// Comptes de TRÉSORERIE du tenant (banque, carte de crédit, caisse), reliés au grand livre (#moteur
// transaction). Chaque compte = un compte GL dédié -> solde suivi PAR compte. Assignés aux transactions.
import { supabase } from '@/lib/supabase';

export type TreasuryKind = 'bank' | 'credit_card' | 'cash';
export type TreasuryAccount = {
  id?: string; tenant_id?: string; name: string; kind: TreasuryKind;
  gl_account_id?: string | null; last4?: string | null; institution?: string | null; active?: boolean;
};

export const TREASURY_KIND_LABELS: Record<TreasuryKind, [string, string]> = {
  bank:        ['Compte bancaire', 'Bank account'],
  credit_card: ['Carte de crédit', 'Credit card'],
  cash:        ['Caisse / comptant', 'Cash'],
};

export async function getTreasuryAccounts(tenant: string): Promise<TreasuryAccount[]> {
  const { data } = await supabase.from('treasury_accounts').select('*').eq('tenant_id', tenant).order('created_at');
  return (data || []) as TreasuryAccount[];
}

/** Prochain code GL libre dans une plage (ex. 1020..1099 pour banques, 2050..2099 pour cartes). */
async function nextGlCode(tenant: string, from: number, to: number): Promise<string> {
  const { data } = await supabase.from('gl_accounts').select('code').eq('tenant_id', tenant);
  const used = new Set((data || []).map((a: any) => String(a.code)));
  for (let n = from; n <= to; n++) { if (!used.has(String(n))) return String(n); }
  return String(from); // plage pleine (improbable) -> repli
}

/**
 * Crée un compte de trésorerie + son compte GL DÉDIÉ.
 *  - banque / caisse  -> compte d'ACTIF (normal_balance debit), plage 1020-1099 / 1010.
 *  - carte de crédit  -> compte de PASSIF (normal_balance credit), plage 2050-2099.
 */
export async function createTreasuryAccount(tenant: string, a: { name: string; kind: TreasuryKind; last4?: string; institution?: string }): Promise<{ error?: string }> {
  const isCard = a.kind === 'credit_card';
  const type = isCard ? 'liability' : 'asset';
  const normal_balance = isCard ? 'credit' : 'debit';
  const code = isCard ? await nextGlCode(tenant, 2050, 2099) : await nextGlCode(tenant, 1020, 1099);
  const label = `${a.name}${a.last4 ? ` ••${a.last4}` : ''}`;
  const { data: gl, error: ge } = await supabase.from('gl_accounts')
    .insert({ tenant_id: tenant, code, name: label, type, normal_balance, is_active: true, is_system: false })
    .select('id').single();
  if (ge) return { error: ge.message };
  const { error } = await supabase.from('treasury_accounts').insert({
    tenant_id: tenant, name: a.name, kind: a.kind, gl_account_id: gl.id,
    last4: a.last4 || null, institution: a.institution || null, active: true,
  });
  return { error: error?.message };
}

export async function setTreasuryActive(tenant: string, id: string, active: boolean): Promise<void> {
  await supabase.from('treasury_accounts').update({ active }).eq('id', id).eq('tenant_id', tenant);
}
