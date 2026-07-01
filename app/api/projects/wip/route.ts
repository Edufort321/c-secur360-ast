import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeProjectActuals } from '@/lib/projectActuals';

// WIP / rentabilité temps réel d'un projet. Le COÛT RÉEL (salaire = heures × taux employé,
// + km + matériel + frais + dépenses) est calculé CÔTÉ SERVEUR : les taux/salaires ne
// transitent jamais par le navigateur (sécurité). Persiste le résultat dans projects.actuals
// pour que l'écart réel vs estimé et la marge soient vrais partout. Tenant = SESSION (anti-IDOR ;
// un super_admin peut viser le tenant de l'URL).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resolveTenant(u: any, requested: string | null): { tenant: string } | { error: NextResponse } {
  const sessionTenant = u.tenant_id || '';
  const req = (requested || '').trim();
  if (u.role === 'super_admin') return { tenant: req || sessionTenant };
  if (req && req !== sessionTenant) return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  return { tenant: sessionTenant };
}

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const rt = resolveTenant(u, sp.get('tenant'));
  if ('error' in rt) return rt.error;
  const tenant = rt.tenant;
  const projectId = sp.get('project_id') || '';
  if (!projectId) return NextResponse.json({ error: 'project_id requis' }, { status: 400 });

  // Le projet DOIT appartenir au tenant (anti-IDOR).
  const { data: proj } = await supabaseAdmin.from('projects')
    .select('id, project_number, po_amount, estimate, actuals').eq('id', projectId).eq('tenant_id', tenant).maybeSingle();
  if (!proj) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

  // Coût réel agrégé (calcul serveur — salaires non exposés au client) : labor + km + frais + dépenses + matériel feuille.
  const base = await computeProjectActuals(tenant, projectId);

  // + Matériel CONSOMMÉ depuis l'inventaire (mouvements 'exit' pointés sur ce projet).
  //   - materielInventaire = COÛT (prix coûtant) -> entre dans le coût réel.
  //   - materielBillable = VALEUR VENDANT (sale_price) -> facturable au projet.
  //   - materielMissingPrice = articles consommés SANS prix vendant à jour (à signaler en ROUGE).
  let materielInventaire = 0, materielBillable = 0;
  const missing: Record<string, { name: string; qty: number }> = {};
  const pn = (proj as any).project_number;
  if (pn) {
    try {
      const { data: inv } = await supabaseAdmin.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
      const snap: any = (inv as any)?.data || {};
      const items: any[] = Array.isArray(snap.items) ? snap.items : [];
      const itemOf = (itemId: any) => items.find(x => String(x.id) === String(itemId));
      for (const m of (Array.isArray(snap.movements) ? snap.movements : [])) {
        if (m && m.type === 'exit' && (String(m.projectCode) === String(pn) || String(m.reason || '').includes(pn))) {
          const qty = Number(m.quantity) || 0;
          const it = itemOf(m.itemId);
          const cost = Number(it?.costPrice ?? it?.cost_price ?? 0) || 0;
          const sale = Number(it?.salePrice ?? it?.sale_price ?? 0) || 0;
          materielInventaire += qty * cost;
          materielBillable += qty * sale;
          if (sale <= 0) { const k = String(m.itemId); const nm = it?.name || m.itemName || k; missing[k] = { name: nm, qty: (missing[k]?.qty || 0) + qty }; }
        }
      }
    } catch { /* inventaire absent -> ignore */ }
  }
  const materielMissingPrice = Object.values(missing);
  // Le matériel d'inventaire consommé fait partie du COÛT réel : l'ajouter à `total` ET à `costReal`
  // (coût chargé) — sinon la marge du CoûtsTab (basée sur costReal) était surévaluée.
  const actuals = { ...base, materielInventaire, materielBillable: Math.round(materielBillable * 100) / 100, materielMissingPrice, total: base.total + materielInventaire, costReal: (Number(base.costReal) || 0) + materielInventaire };

  // Persiste le coût réel dans projects.actuals -> l'écart/marge deviennent vrais partout.
  try {
    await supabaseAdmin.from('projects')
      .update({ actuals: { ...actuals, computed_at: new Date().toISOString(), source: 'wip' }, updated_at: new Date().toISOString() })
      .eq('id', projectId).eq('tenant_id', tenant);
  } catch { /* colonne actuals absente -> on retourne quand même le calcul */ }

  const revenue = Number(proj.po_amount) || 0;
  const estimate = Number((proj.estimate as any)?.total) || 0;
  const marge = revenue - actuals.total;
  return NextResponse.json({ ok: true, actuals, revenue, estimate, marge });
}
