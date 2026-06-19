// Correctifs audit financier P1 — écritures SERVEUR (service_role) :
//  P1-2 Amortissement : DR 5600 Amortissement / CR 1590 Amortissement cumulé (par bien et par exercice).
//  P1-3 Remise TPS/TVQ : DR 2100/2110 (taxe à payer) / CR banque, pour une période, + suivi.
// Idempotent (asset_depreciation / tax_remittances uniques + entryExists). Comptes créés à la volée.
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createEntryAdmin, getAccountMap, entryExists } from '@/lib/accountingServer';
import { depreciationForYear, type DepAsset } from '@/lib/depreciation';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Retourne l'id du compte (le crée s'il manque). type: asset|liability|equity|revenue|expense. */
export async function ensureAccount(tenant: string, code: string, name: string, type: string, normal_balance: 'debit' | 'credit'): Promise<string | null> {
  const { data } = await supabaseAdmin.from('gl_accounts').select('id').eq('tenant_id', tenant).eq('code', code).maybeSingle();
  if ((data as any)?.id) return (data as any).id;
  const { data: ins, error } = await supabaseAdmin.from('gl_accounts').insert({ tenant_id: tenant, code, name, type, normal_balance, is_active: true }).select('id').single();
  if (error) return null;
  return (ins as any).id;
}

/** Amortissement cumulé par bien (somme des dotations comptabilisées). */
export async function getAccumulatedDepreciation(tenant: string): Promise<Record<string, number>> {
  const { data } = await supabaseAdmin.from('asset_depreciation').select('asset_id, amount').eq('tenant_id', tenant);
  const m: Record<string, number> = {};
  (data || []).forEach((r: any) => { m[r.asset_id] = r2((m[r.asset_id] || 0) + (Number(r.amount) || 0)); });
  return m;
}

/** Comptabilise la dotation d'amortissement de l'exercice `year` pour TOUS les biens éligibles (idempotent). */
export async function postDepreciationForYear(tenant: string, year: number): Promise<{ posted: number; skipped: number; total: number }> {
  const m = await getAccountMap(tenant);
  const exp = m['5600'] || await ensureAccount(tenant, '5600', 'Amortissement', 'expense', 'debit');
  const accum = m['1590'] || await ensureAccount(tenant, '1590', 'Amortissement cumulé', 'asset', 'credit');
  if (!exp || !accum) throw new Error('Comptes 5600/1590 indisponibles (plan comptable non initialisé ?).');

  const { data: assets } = await supabaseAdmin.from('company_assets').select('*').eq('tenant_id', tenant);
  const { data: deps } = await supabaseAdmin.from('asset_depreciation').select('asset_id, fiscal_year, amount').eq('tenant_id', tenant);
  const priorByAsset: Record<string, number> = {};   // cumul des exercices ANTÉRIEURS à `year`
  const doneThisYear = new Set<string>();             // (asset) déjà amorti pour `year`
  (deps || []).forEach((d: any) => {
    if (d.fiscal_year < year) priorByAsset[d.asset_id] = r2((priorByAsset[d.asset_id] || 0) + (Number(d.amount) || 0));
    if (d.fiscal_year === year) doneThisYear.add(d.asset_id);
  });

  let posted = 0, skipped = 0, total = 0;
  for (const a of (assets || []) as any[]) {
    if (doneThisYear.has(a.id)) { skipped++; continue; }
    const amt = depreciationForYear(a as DepAsset, year, priorByAsset[a.id] || 0);
    if (amt <= 0) { skipped++; continue; }
    if (await entryExists(tenant, 'depreciation', `${a.id}:${year}`)) { skipped++; continue; }
    const entryId = await createEntryAdmin(tenant, {
      entry_date: `${year}-12-31`,
      description: `Amortissement ${year} — ${a.name}`,
      reference: `AMO-${year}`, journal_code: 'OD', source_type: 'depreciation', source_id: `${a.id}:${year}`,
      lines: [
        { account_id: exp, debit: amt, credit: 0, description: `Amortissement ${a.name}` },
        { account_id: accum, debit: 0, credit: amt, description: 'Amortissement cumulé' },
      ],
    });
    await supabaseAdmin.from('asset_depreciation').insert({ tenant_id: tenant, asset_id: a.id, fiscal_year: year, amount: amt, gl_entry_id: entryId });
    posted++; total = r2(total + amt);
  }
  return { posted, skipped, total };
}

/** Net de taxe à remettre pour une période (perçue 2100/2110 − CTI/RTI 1200/1210), depuis le GL. */
export async function computeRemittance(tenant: string, periodStart: string, periodEnd: string): Promise<{ gstNet: number; qstNet: number }> {
  const m = await getAccountMap(tenant);
  const ids = ['2100', '2110', '1200', '1210'].map(c => m[c]).filter(Boolean);
  if (!ids.length) return { gstNet: 0, qstNet: 0 };
  const { data } = await supabaseAdmin.from('gl_lines')
    .select('debit, credit, account_id, gl_entries!inner(entry_date, posted)')
    .eq('tenant_id', tenant).in('account_id', ids)
    .gte('gl_entries.entry_date', periodStart).lte('gl_entries.entry_date', periodEnd).eq('gl_entries.posted', true);
  const bal: Record<string, number> = {}; // crédit − débit (solde créditeur des comptes de taxe)
  (data || []).forEach((l: any) => { bal[l.account_id] = (bal[l.account_id] || 0) + (Number(l.credit) || 0) - (Number(l.debit) || 0); });
  const cr = (code: string) => bal[m[code]] || 0;
  // Perçue = solde créditeur de 2100/2110 ; CTI/RTI = solde DÉBITEUR de 1200/1210 (= −(cr−dr)).
  const gstNet = r2(cr('2100') - (-cr('1200')));
  const qstNet = r2(cr('2110') - (-cr('1210')));
  return { gstNet, qstNet };
}

/** Comptabilise la REMISE de taxe d'une période : DR 2100/2110 / CR banque. Idempotent par période. */
export async function postTaxRemittance(tenant: string, opts: { periodStart: string; periodEnd: string; frequency?: string; payDate?: string | null; treasuryCode?: string }): Promise<{ ok: boolean; gstNet: number; qstNet: number; total: number; reason?: string }> {
  const { periodStart, periodEnd } = opts;
  const m = await getAccountMap(tenant);
  const bank = (opts.treasuryCode && m[opts.treasuryCode]) || m['1000'];
  if (!m['2100'] || !m['2110'] || !bank) return { ok: false, gstNet: 0, qstNet: 0, total: 0, reason: 'Plan comptable incomplet (2100/2110/1000).' };
  const { gstNet, qstNet } = await computeRemittance(tenant, periodStart, periodEnd);
  const total = r2(gstNet + qstNet);
  if (total <= 0) return { ok: false, gstNet, qstNet, total, reason: 'Aucun montant net à remettre pour cette période (≤ 0).' };
  if (await entryExists(tenant, 'tax_remittance', `${periodStart}:${periodEnd}`)) return { ok: false, gstNet, qstNet, total, reason: 'Remise déjà comptabilisée pour cette période.' };

  const lines = [
    ...(gstNet > 0 ? [{ account_id: m['2100'], debit: gstNet, credit: 0, description: 'TPS/TVH remise' }] : []),
    ...(qstNet > 0 ? [{ account_id: m['2110'], debit: qstNet, credit: 0, description: 'TVQ remise' }] : []),
    { account_id: bank, debit: 0, credit: total, description: 'Remise de taxe (banque)' },
  ];
  const entryId = await createEntryAdmin(tenant, {
    entry_date: opts.payDate || periodEnd,
    description: `Remise TPS/TVQ ${periodStart} → ${periodEnd}`,
    reference: `REM-${periodEnd}`, journal_code: 'BNK', source_type: 'tax_remittance', source_id: `${periodStart}:${periodEnd}`,
    lines,
  });
  await supabaseAdmin.from('tax_remittances').upsert({
    tenant_id: tenant, period_start: periodStart, period_end: periodEnd, frequency: opts.frequency || 'trimestriel',
    gst_net: gstNet, qst_net: qstNet, total, pay_date: opts.payDate || periodEnd, status: 'posted', gl_entry_id: entryId,
  }, { onConflict: 'tenant_id,period_start,period_end' });
  return { ok: true, gstNet, qstNet, total };
}
