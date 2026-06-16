// Écritures au grand livre côté SERVEUR (service_role). Miroir de lib/accounting.createEntry,
// utilisé par les routes sensibles (dividendes, apports en capital) qui ne passent pas par le client.
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type GLLine = { account_id: string; debit?: number; credit?: number; description?: string };

/** Map code de compte -> id, pour un tenant. */
export async function getAccountMap(tenant: string): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin.from('gl_accounts').select('id, code').eq('tenant_id', tenant);
  const m: Record<string, string> = {};
  (data || []).forEach((a: any) => { m[a.code] = a.id; });
  return m;
}

/** Crée une écriture équilibrée et la valide (posted=true). Idempotence : vérifiée par l'appelant via source_type/source_id. */
export async function createEntryAdmin(tenant: string, e: {
  entry_date: string; description?: string; reference?: string; journal_code?: string;
  source_type?: string; source_id?: string; lines: GLLine[];
}): Promise<string> {
  const debit = e.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const credit = e.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  if (debit === 0 && credit === 0) throw new Error('Écriture vide.');
  if (Math.abs(debit - credit) > 0.005) throw new Error(`Écriture déséquilibrée : ${debit.toFixed(2)} ≠ ${credit.toFixed(2)}.`);

  let journal_id: string | null = null;
  if (e.journal_code) {
    const { data: j } = await supabaseAdmin.from('gl_journals').select('id').eq('tenant_id', tenant).eq('code', e.journal_code).maybeSingle();
    journal_id = (j as any)?.id ?? null;
  }
  const { data: entry, error: e1 } = await supabaseAdmin.from('gl_entries').insert({
    tenant_id: tenant, entry_date: e.entry_date, description: e.description ?? null, reference: e.reference ?? null,
    journal_id, source_type: e.source_type || 'manual', source_id: e.source_id ?? null, posted: false,
  }).select('id').single();
  if (e1) throw e1;

  const rows = e.lines
    .filter(l => (Number(l.debit) || 0) > 0 || (Number(l.credit) || 0) > 0)
    .map((l, i) => ({ tenant_id: tenant, entry_id: (entry as any).id, account_id: l.account_id, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0, description: l.description ?? null, sort_order: i }));
  const { error: e2 } = await supabaseAdmin.from('gl_lines').insert(rows);
  if (e2) throw e2;
  const { error: e3 } = await supabaseAdmin.from('gl_entries').update({ posted: true }).eq('id', (entry as any).id);
  if (e3) throw e3;
  return (entry as any).id as string;
}

/** Existe-t-il déjà une écriture pour (source_type, source_id) ? Évite les doublons. */
export async function entryExists(tenant: string, sourceType: string, sourceId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('gl_entries').select('id').eq('tenant_id', tenant).eq('source_type', sourceType).eq('source_id', sourceId).limit(1);
  return !!(data && data.length);
}
