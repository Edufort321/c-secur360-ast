// Génération automatique d'écritures comptables depuis les événements métier.
// Approche idempotente par (source_type, source_id) : ré-exécutable sans doublon.
// Phase 2 : paie (feuilles de temps). Les ventes/factures arriveront avec le module Facture.
import { supabase } from '@/lib/supabase';
import { getAccounts, createEntry } from '@/lib/accounting';

async function accountMap(tenant: string): Promise<Record<string, string>> {
  const accs = await getAccounts(tenant);
  const m: Record<string, string> = {};
  for (const a of accs) m[a.code] = a.id;
  return m;
}

async function entryExists(tenant: string, sourceType: string, sourceId: string): Promise<boolean> {
  const { data } = await supabase.from('gl_entries').select('id')
    .eq('tenant_id', tenant).eq('source_type', sourceType).eq('source_id', sourceId).limit(1);
  return !!(data && data.length);
}

/**
 * Écriture de paie pour une feuille de temps.
 *   DR 5000 Salaires et avantages   = net + déduction véhicule − commissions + retenues à la source
 *   DR 5050 Commissions             = commissions
 *   CR 2300 Salaires à payer        = montant net versé
 *   CR 2200 Retenues fédéral        = federal_deductions (RPC/AE/impôt fédéral)
 *   CR 2210 Retenues Québec         = quebec_deductions (RRQ/RQAP/impôt QC/FSS)
 *   CR 5200 Frais de véhicules      = déduction véhicule (usage perso retenu)
 * Les retenues sont prises sur la feuille (federal_deductions / quebec_deductions, migration 088) ;
 * si elles sont à 0, l'écriture est identique au comportement antérieur.
 */
export async function postTimesheetPayroll(
  tenant: string, ts: any, accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'empty' | 'no-accounts'> {
  const total = Number(ts.total_amount) || 0;
  if (total <= 0) return 'empty';
  if (await entryExists(tenant, 'timesheet', ts.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['5000'] || !m['2300']) return 'no-accounts';

  const ded = Number(ts.vehicle_deduction) || 0;
  const comm = Number(ts.total_commissions) || 0;
  const fedDed = Number(ts.federal_deductions) || 0;
  const qcDed = Number(ts.quebec_deductions) || 0;
  const salaries = total + ded - comm + fedDed + qcDed;

  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: m['5000'], debit: salaries, credit: 0, description: 'Salaires et avantages' },
  ];
  if (comm > 0 && m['5050']) lines.push({ account_id: m['5050'], debit: comm, credit: 0, description: 'Commissions sur ventes' });
  lines.push({ account_id: m['2300'], debit: 0, credit: total, description: 'Net à payer' });
  if (fedDed > 0 && m['2200']) lines.push({ account_id: m['2200'], debit: 0, credit: fedDed, description: 'Retenues a la source - federal (RPC/AE/impot)' });
  if (qcDed > 0 && m['2210']) lines.push({ account_id: m['2210'], debit: 0, credit: qcDed, description: 'Retenues a la source - Quebec (RRQ/RQAP/impot/FSS)' });
  if (ded > 0 && m['5200']) lines.push({ account_id: m['5200'], debit: 0, credit: ded, description: 'Déduction véhicule (usage personnel)' });

  await createEntry(tenant, {
    entry_date: ts.period_end || ts.period_start || new Date().toISOString().slice(0, 10),
    description: `Paie — ${ts.employee_name || ts.employee_email || ''} (${ts.period_start || ''} → ${ts.period_end || ''})`,
    reference: ts.id ? `TS-${String(ts.id).slice(0, 8)}` : undefined,
    journal_code: 'PAY', source_type: 'timesheet', source_id: ts.id,
    lines,
  });
  return 'created';
}

/**
 * Écriture d'achat pour une transaction (dépense / achat fournisseur).
 *   DR <comptes de charge>          = montants nets ventilés par ligne
 *   DR 5300 (taxe non récupérable)  = PST/RST (hors Québec) capitalisée en charge
 *   DR 1200 TPS/TVH à récupérer     = gst_amount (CTI)
 *   DR 1210 TVQ à récupérer         = qst_amount (RTI)
 *   CR 1000 Banque (comptant) | CR 2000 Fournisseurs (à crédit) = total
 * Idempotent par (source_type='transaction', source_id). Met à jour gl_entry_id + statut 'posted'.
 */
export async function postTransactionPurchase(
  tenant: string, txn: any, items: any[], accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (txn.gl_entry_id) return 'skipped';
  if (await entryExists(tenant, 'transaction', txn.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  const payAcc = txn.payment_method === 'on_account' ? m['2000'] : m['1000'];
  if (!payAcc || !m['5300']) return 'no-accounts';

  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [];
  for (const it of (items || [])) {
    const amt = Number(it.amount) || 0;
    if (amt <= 0) continue;
    const acc = m[it.account_code] || m['5300'];
    lines.push({ account_id: acc, debit: amt, credit: 0, description: it.description || 'Charge' });
  }
  const pst = Number(txn.pst_amount) || 0;
  if (pst > 0) lines.push({ account_id: m['5300'], debit: pst, credit: 0, description: 'Taxe provinciale non recuperable (PST/RST)' });
  const gst = Number(txn.gst_amount) || 0;
  if (gst > 0 && m['1200']) lines.push({ account_id: m['1200'], debit: gst, credit: 0, description: 'TPS/TVH a recuperer (CTI)' });
  const qst = Number(txn.qst_amount) || 0;
  if (qst > 0 && m['1210']) lines.push({ account_id: m['1210'], debit: qst, credit: 0, description: 'TVQ a recuperer (RTI)' });
  const total = Number(txn.total) || 0;
  lines.push({ account_id: payAcc, debit: 0, credit: total, description: txn.payment_method === 'on_account' ? 'Fournisseurs a payer' : 'Banque' });

  const entryId = await createEntry(tenant, {
    entry_date: txn.txn_date || new Date().toISOString().slice(0, 10),
    description: `Achat — ${txn.vendor_name || txn.transaction_number || ''}`,
    reference: txn.transaction_number || undefined,
    journal_code: 'ACH', source_type: 'transaction', source_id: txn.id, lines,
  });
  await supabase.from('commerce_transactions').update({ gl_entry_id: entryId, status: txn.status === 'draft' ? 'posted' : txn.status }).eq('id', txn.id);
  return 'created';
}

/**
 * Paiement d'un achat à crédit : solde le compte fournisseurs.
 *   DR 2000 Fournisseurs   = total
 *   CR 1000 Banque         = total
 * Idempotent par (source_type='transaction_payment', source_id).
 */
export async function postTransactionPayment(
  tenant: string, txn: any, accMap?: Record<string, string>
): Promise<'created' | 'skipped' | 'no-accounts'> {
  if (await entryExists(tenant, 'transaction_payment', txn.id)) return 'skipped';
  const m = accMap || await accountMap(tenant);
  if (!m['2000'] || !m['1000']) return 'no-accounts';
  const total = Number(txn.total) || 0;
  if (total <= 0) return 'skipped';
  await createEntry(tenant, {
    entry_date: new Date().toISOString().slice(0, 10),
    description: `Paiement fournisseur — ${txn.vendor_name || txn.transaction_number || ''}`,
    reference: txn.transaction_number || undefined,
    journal_code: 'BNK', source_type: 'transaction_payment', source_id: txn.id,
    lines: [
      { account_id: m['2000'], debit: total, credit: 0, description: 'Fournisseurs a payer' },
      { account_id: m['1000'], debit: 0, credit: total, description: 'Banque' },
    ],
  });
  return 'created';
}

/** Génère les écritures de paie manquantes pour toutes les feuilles approuvées/payées. */
export async function syncPayrollEntries(tenant: string): Promise<{ created: number; skipped: number; empty: number }> {
  const { data, error } = await supabase.from('timesheets').select('*')
    .eq('tenant_id', tenant).in('status', ['approved', 'paid']);
  if (error) throw error;
  const m = await accountMap(tenant);
  if (!m['5000'] || !m['2300']) throw new Error('Plan comptable non initialisé (exécutez la migration 085 puis initialisez).');

  let created = 0, skipped = 0, empty = 0;
  for (const ts of (data || [])) {
    const r = await postTimesheetPayroll(tenant, ts, m);
    if (r === 'created') created++;
    else if (r === 'skipped') skipped++;
    else empty++;
  }
  return { created, skipped, empty };
}
