// Export DÉPÔT DIRECT au format CPA-005 (Desjardins) — #52 phase 2. Gating canHr, service_role : joint
// les coordonnées bancaires (clair, seul endroit), lit la config d'expéditeur (company_settings), incrémente
// le n° de création de fichier, et renvoie le fichier 1464 octets. ⚠️ À valider avec un fichier test AccèsD.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildCpa005, type Cpa005Originator, type Cpa005Payment } from '@/lib/cpa005';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Item = { personnel_id: string; name: string; amount: number };

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const items: Item[] = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: 'Aucun montant à verser.' }, { status: 400 });

  // Config d'expéditeur (CPA-005) — requise (migration 220 + saisie dans Admin › Paie).
  const { data: cs } = await supabaseAdmin.from('company_settings')
    .select('cpa_originator_id, cpa_short_name, cpa_long_name, cpa_data_centre, cpa_return_institution, cpa_return_transit, cpa_return_account, cpa_transaction_type, cpa_file_creation_number, legal_name')
    .eq('tenant_id', tenant).maybeSingle();
  const c: any = cs || {};
  if (!c.cpa_originator_id || !c.cpa_data_centre) {
    return NextResponse.json({ error: 'Paramètres CPA-005 incomplets (n° d’expéditeur et centre de données requis — Admin › Paie › Dépôt direct Desjardins).' }, { status: 400 });
  }

  // Agrège par employé puis joint les coordonnées bancaires.
  const byEmp = new Map<string, { name: string; amount: number }>();
  for (const it of items) { const pid = String(it.personnel_id || ''); if (!pid) continue; const cur = byEmp.get(pid) || { name: it.name || '', amount: 0 }; cur.amount += Number(it.amount) || 0; if (it.name) cur.name = it.name; byEmp.set(pid, cur); }
  const pids = [...byEmp.keys()];
  const { data: bankData, error } = await supabaseAdmin.from('employee_bank_accounts')
    .select('personnel_id, account_holder, institution_number, transit_number, account_number')
    .eq('tenant_id', tenant).in('personnel_id', pids.length ? pids : ['__none__']);
  if (error) return NextResponse.json({ error: error.message + ' (migration 218 ?)' }, { status: 500 });
  const bank = new Map<string, any>((bankData || []).map((r: any) => [r.personnel_id, r]));

  const payments: Cpa005Payment[] = [];
  const missing: string[] = [];
  for (const [pid, emp] of byEmp) {
    if ((Number(emp.amount) || 0) <= 0) continue;
    const b = bank.get(pid);
    if (!b?.institution_number || !b?.transit_number || !b?.account_number) { missing.push(emp.name || pid); continue; }
    payments.push({
      name: b.account_holder || emp.name, institution: b.institution_number, transit: b.transit_number, account: b.account_number,
      amountCents: Math.round((Number(emp.amount) || 0) * 100), reference: String(body.periodLabel || '').slice(0, 19),
    });
  }
  if (!payments.length) return NextResponse.json({ ok: true, content: '', count: 0, missing });

  const fcn = Number(c.cpa_file_creation_number) || 1;
  const originator: Cpa005Originator = {
    originatorId: c.cpa_originator_id, shortName: c.cpa_short_name || c.legal_name || 'C-SECUR360',
    longName: c.cpa_long_name || c.legal_name || 'C-SECUR360', dataCentre: c.cpa_data_centre,
    fileCreationNumber: fcn, returnInstitution: c.cpa_return_institution || '815',
    returnTransit: c.cpa_return_transit || '', returnAccount: c.cpa_return_account || '',
    transactionType: c.cpa_transaction_type || '200',
  };
  const { content, count, totalCents } = buildCpa005(originator, payments);

  // Incrémente le n° de création de fichier (chaque fichier transmis doit avoir un n° unique).
  await supabaseAdmin.from('company_settings').update({ cpa_file_creation_number: fcn + 1, updated_at: new Date().toISOString() }).eq('tenant_id', tenant);

  return NextResponse.json({ ok: true, content, count, missing, total: Math.round(totalCents) / 100, fileCreationNumber: fcn });
}
