// Budget annuel vs réel (#41). Le budget est saisi par compte GL ; le réel est calculé depuis le
// grand livre (mêmes données que l'état financier). Fonctions pures pour le calcul des écarts.
import { supabase } from '@/lib/supabase';

export type BudgetLine = { account_code: string; amount: number };

export async function getBudgets(tenant: string, year: number): Promise<Record<string, number>> {
  const { data } = await supabase.from('annual_budgets').select('account_code, amount').eq('tenant_id', tenant).eq('year', year);
  const m: Record<string, number> = {};
  (data || []).forEach((b: any) => { m[b.account_code] = Number(b.amount) || 0; });
  return m;
}

export async function saveBudget(tenant: string, year: number, account_code: string, amount: number): Promise<void> {
  const { error } = await supabase.from('annual_budgets').upsert(
    { tenant_id: tenant, year, account_code, amount: Number(amount) || 0, updated_at: new Date().toISOString() },
    { onConflict: 'tenant_id,year,account_code' },
  );
  if (error) throw error;
}

const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Réel par compte (sens normal) pour une ANNÉE civile, depuis le grand livre. */
export function actualByAccount(ledger: any[], year: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of ledger || []) {
    if (e.posted === false) continue;
    const d = String(e.entry_date || ''); if (d.slice(0, 4) !== String(year)) continue;
    for (const l of e.gl_lines || []) {
      const code = String(l.gl_accounts?.code || ''); const type = l.gl_accounts?.type; if (!code) continue;
      const debit = n(l.debit), credit = n(l.credit);
      // Sens normal : produit/passif/capitaux = crédit − débit ; actif/charge = débit − crédit.
      const natural = (type === 'revenue' || type === 'liability' || type === 'equity') ? credit - debit : debit - credit;
      out[code] = (out[code] || 0) + natural;
    }
  }
  return out;
}

export type BudgetRow = { code: string; name: string; type: string; budget: number; actual: number; variance: number; variancePct: number };

/** Construit les lignes budget vs réel pour les comptes de PRODUITS et de CHARGES. */
export function budgetVsActual(
  accounts: { code: string; name: string; type: string }[],
  budgets: Record<string, number>,
  actuals: Record<string, number>,
): { revenue: BudgetRow[]; expense: BudgetRow[] } {
  const mk = (a: { code: string; name: string; type: string }): BudgetRow => {
    const budget = n(budgets[a.code]); const actual = Math.round(n(actuals[a.code]) * 100) / 100;
    const variance = Math.round((actual - budget) * 100) / 100;
    return { code: a.code, name: a.name, type: a.type, budget, actual, variance, variancePct: budget !== 0 ? (variance / Math.abs(budget)) * 100 : (actual !== 0 ? 100 : 0) };
  };
  const revenue = accounts.filter(a => a.type === 'revenue').map(mk);
  const expense = accounts.filter(a => a.type === 'expense').map(mk);
  return { revenue, expense };
}
