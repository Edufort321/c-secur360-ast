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
 *   DR 5000 Salaires et avantages   = net + déduction véhicule − commissions
 *   DR 5050 Commissions             = commissions
 *   CR 5200 Frais de véhicules      = déduction véhicule (usage perso retenu)
 *   CR 2300 Salaires à payer        = montant net
 * (Les retenues à la source seront ventilées en Phase 5.)
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
  const salaries = total + ded - comm;

  const lines: { account_id: string; debit: number; credit: number; description?: string }[] = [
    { account_id: m['5000'], debit: salaries, credit: 0, description: 'Salaires et avantages' },
  ];
  if (comm > 0 && m['5050']) lines.push({ account_id: m['5050'], debit: comm, credit: 0, description: 'Commissions sur ventes' });
  lines.push({ account_id: m['2300'], debit: 0, credit: total, description: 'Net à payer' });
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
