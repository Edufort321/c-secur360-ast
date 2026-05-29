// Service comptable — couche d'accès au grand livre (partie double).
// S'appuie sur les tables gl_* (migration 085). Toutes les écritures validées
// (posted=true) sont équilibrées (Σdébits = Σcrédits) et immuables (contre-passation).
import { supabase } from '@/lib/supabase';

export type GLAccount = {
  id: string; code: string; name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  normal_balance: 'debit' | 'credit'; is_active: boolean; is_system?: boolean;
};
export type GLTaxCode = { id: string; code: string; name: string; jurisdiction?: string; rate: number };
export type GLLineInput = { account_id: string; debit?: number; credit?: number; description?: string; tax_code_id?: string | null };

export const ACCOUNT_TYPE_LABELS: Record<string, [string, string]> = {
  asset:     ['Actif', 'Assets'],
  liability: ['Passif', 'Liabilities'],
  equity:    ['Capitaux propres', 'Equity'],
  revenue:   ['Produits', 'Revenue'],
  expense:   ['Charges', 'Expenses'],
};

/** Initialise le plan comptable + journaux + taxes par défaut pour un tenant (idempotent). */
export async function seedAccountingDefaults(tenant: string) {
  const { error } = await supabase.rpc('seed_accounting_defaults', { p_tenant: tenant });
  if (error) throw error;
}

export async function getAccounts(tenant: string): Promise<GLAccount[]> {
  const { data, error } = await supabase.from('gl_accounts').select('*').eq('tenant_id', tenant).order('code');
  if (error) throw error;
  return (data || []) as GLAccount[];
}

export async function getTaxCodes(tenant: string): Promise<GLTaxCode[]> {
  const { data } = await supabase.from('gl_tax_codes').select('id,code,name,jurisdiction,rate').eq('tenant_id', tenant).eq('active', true).order('code');
  return (data || []) as GLTaxCode[];
}

/** Écritures (en-tête) + leurs lignes, avec le compte joint, triées par date décroissante. */
export async function getLedger(tenant: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('gl_entries')
    .select('*, gl_lines(*, gl_accounts(code,name,type))')
    .eq('tenant_id', tenant)
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Solde par compte (somme débits - crédits selon le sens normal). Calcul applicatif simple. */
export async function getTrialBalance(tenant: string): Promise<Record<string, { debit: number; credit: number }>> {
  const { data, error } = await supabase.from('gl_lines').select('account_id, debit, credit, gl_entries!inner(posted, tenant_id)').eq('tenant_id', tenant);
  if (error) throw error;
  const bal: Record<string, { debit: number; credit: number }> = {};
  for (const l of (data || []) as any[]) {
    if (!l.gl_entries?.posted) continue;
    const k = l.account_id;
    if (!bal[k]) bal[k] = { debit: 0, credit: 0 };
    bal[k].debit += Number(l.debit) || 0;
    bal[k].credit += Number(l.credit) || 0;
  }
  return bal;
}

/**
 * Crée une écriture équilibrée et la valide (posted=true).
 * Le trigger DB revérifie l'équilibre; on valide aussi côté client pour un message clair.
 */
export async function createEntry(tenant: string, e: {
  entry_date: string; description?: string; reference?: string; journal_code?: string;
  source_type?: string; source_id?: string; created_by?: string; lines: GLLineInput[];
}): Promise<string> {
  const debit = e.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const credit = e.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  if (debit === 0 && credit === 0) throw new Error('Écriture vide.');
  if (Math.abs(debit - credit) > 0.005) throw new Error(`Écriture déséquilibrée : débits ${debit.toFixed(2)} ≠ crédits ${credit.toFixed(2)}.`);

  let journal_id: string | null = null;
  if (e.journal_code) {
    const { data: j } = await supabase.from('gl_journals').select('id').eq('tenant_id', tenant).eq('code', e.journal_code).maybeSingle();
    journal_id = j?.id ?? null;
  }
  const { data: entry, error: e1 } = await supabase.from('gl_entries').insert({
    tenant_id: tenant, entry_date: e.entry_date, description: e.description ?? null, reference: e.reference ?? null,
    journal_id, source_type: e.source_type || 'manual', source_id: e.source_id ?? null, created_by: e.created_by ?? null, posted: false,
  }).select('id').single();
  if (e1) throw e1;

  const rows = e.lines
    .filter(l => (Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0)
    .map((l, i) => ({
      tenant_id: tenant, entry_id: entry.id, account_id: l.account_id,
      debit: Number(l.debit) || 0, credit: Number(l.credit) || 0,
      tax_code_id: l.tax_code_id ?? null, description: l.description ?? null, sort_order: i,
    }));
  const { error: e2 } = await supabase.from('gl_lines').insert(rows);
  if (e2) throw e2;

  const { error: e3 } = await supabase.from('gl_entries').update({ posted: true }).eq('id', entry.id);
  if (e3) throw e3;
  return entry.id as string;
}

/** Contre-passation d'une écriture validée (inverse débits/crédits) — préserve la piste d'audit. */
export async function reverseEntry(tenant: string, entryId: string, created_by?: string): Promise<string> {
  const { data: orig, error } = await supabase.from('gl_entries').select('*, gl_lines(*)').eq('id', entryId).single();
  if (error) throw error;
  const lines: GLLineInput[] = (orig.gl_lines || []).map((l: any) => ({
    account_id: l.account_id, debit: Number(l.credit) || 0, credit: Number(l.debit) || 0, description: l.description, tax_code_id: l.tax_code_id,
  }));
  const newId = await createEntry(tenant, {
    entry_date: new Date().toISOString().slice(0, 10),
    description: `Contre-passation : ${orig.description || orig.entry_number || entryId}`,
    reference: orig.reference, source_type: 'reversal', source_id: entryId, created_by, lines,
  });
  await supabase.from('gl_entries').update({ reversed_by_id: newId }).eq('id', entryId);
  return newId;
}
