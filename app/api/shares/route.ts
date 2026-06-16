import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAccountMap, createEntryAdmin, entryExists } from '@/lib/accountingServer';
import { logAudit, clientIp } from '@/lib/auditTrail';

// Cap table : catégories d'actions + mouvements (émission/transfert/rachat). La détention par
// actionnaire = somme cumulée des mouvements. Un apport en ESPÈCES (amount > 0 sur une émission)
// poste une écriture d'apport au capital : DR 1000 Banque / CR 3100 Capital-actions.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (!canShareholders(acc.level)) return { err: NextResponse.json({ error: 'Accès refusé (cap table)' }, { status: 403 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  return { acc, tenant };
}

export async function GET(req: NextRequest) {
  const g = await guard(req, new URL(req.url).searchParams.get('tenant')); if (g.err) return g.err;
  const tenant = g.tenant!;
  const [{ data: txns }, { data: cls }] = await Promise.all([
    supabaseAdmin.from('share_transactions').select('*').eq('tenant_id', tenant).order('txn_date'),
    supabaseAdmin.from('share_classes').select('*').eq('tenant_id', tenant).order('sort_order'),
  ]);
  const holdMap: Record<string, number> = {};
  (txns || []).forEach((t: any) => { holdMap[t.shareholder_id] = (holdMap[t.shareholder_id] || 0) + (Number(t.shares) || 0); });
  const holdings = Object.entries(holdMap).map(([shareholder_id, shares]) => ({ shareholder_id, shares }));
  return NextResponse.json({ transactions: txns || [], classes: cls || [], holdings });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const tenant = g.tenant!;

  if (body.kind === 'class') {
    const c = body.shareClass || {};
    if (!c.name?.trim()) return NextResponse.json({ error: 'Nom de catégorie requis' }, { status: 400 });
    const row: any = { tenant_id: tenant, name: c.name.trim(), votes_per_share: Number(c.votes_per_share) || 0, is_voting: c.is_voting !== false, par_value: Number(c.par_value) || 0, liquidation_pref: Number(c.liquidation_pref) || 0, sort_order: Number(c.sort_order) || 0 };
    if (c.id) { const { error } = await supabaseAdmin.from('share_classes').update(row).eq('id', c.id).eq('tenant_id', tenant); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true, id: c.id }); }
    const { data, error } = await supabaseAdmin.from('share_classes').insert(row).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: (data as any).id });
  }

  if (body.kind === 'txn') {
    const t = body.transaction || {};
    if (!t.shareholder_id || !t.txn_date || t.shares == null) return NextResponse.json({ error: 'Actionnaire, date et nombre d\'actions requis' }, { status: 400 });
    // vérifie l'appartenance de l'actionnaire au tenant
    const { data: own } = await supabaseAdmin.from('shareholders').select('id').eq('id', t.shareholder_id).eq('tenant_id', tenant).maybeSingle();
    if (!own) return NextResponse.json({ error: 'Actionnaire introuvable' }, { status: 404 });
    const amount = Number(t.amount) || 0;
    const row: any = { tenant_id: tenant, shareholder_id: t.shareholder_id, share_class_id: t.share_class_id || null, txn_date: t.txn_date, txn_type: t.txn_type || 'issuance', shares: Number(t.shares) || 0, price_per_share: Number(t.price_per_share) || 0, amount, notes: t.notes || null };
    const { data: ins, error } = await supabaseAdmin.from('share_transactions').insert(row).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const txnId = (ins as any).id;
    // Apport en capital (espèces) → écriture DR Banque / CR Capital-actions (best-effort, idempotent).
    if (amount > 0 && (row.txn_type === 'issuance' || row.txn_type === 'transfer_in')) {
      try {
        const m = await getAccountMap(tenant);
        if (m['1000'] && m['3100'] && !(await entryExists(tenant, 'share_capital', txnId))) {
          const entryId = await createEntryAdmin(tenant, {
            entry_date: row.txn_date, description: `Apport au capital — ${row.shares} actions`, journal_code: 'OD',
            source_type: 'share_capital', source_id: txnId,
            lines: [{ account_id: m['1000'], debit: amount, credit: 0, description: 'Banque' }, { account_id: m['3100'], debit: 0, credit: amount, description: 'Capital-actions' }],
          });
          await supabaseAdmin.from('share_transactions').update({ gl_entry_id: entryId }).eq('id', txnId);
        }
      } catch { /* l'apport est enregistré ; l'écriture GL est best-effort (plan comptable requis) */ }
    }
    await logAudit({ tenant, actorId: g.acc!.userId, actorEmail: g.acc!.email, action: 'share_txn', entityType: 'share_txn', entityId: txnId, summary: `${row.txn_type} ${row.shares} actions`, meta: { amount, shareholder_id: t.shareholder_id }, ip: clientIp(req) });
    return NextResponse.json({ ok: true, id: txnId });
  }

  return NextResponse.json({ error: 'kind inconnu' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('share_transactions').delete().eq('id', body.id).eq('tenant_id', g.tenant!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
