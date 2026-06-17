// Synchronisation d'une connexion bancaire (Flinks) → bank_statement_lines (dédoublonné par
// external_id). Réutilisé par la route manuelle et le cron. SERVEUR (service_role).
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { flinksGetTransactions } from '@/lib/flinks';

export async function syncBankConnection(tenant: string, conn: any): Promise<{ inserted: number }> {
  try {
    const { lines, institution, accountMask } = await flinksGetTransactions(conn.login_id);
    let inserted = 0;
    if (lines.length) {
      const ids = lines.map(l => l.external_id);
      const { data: existing } = await supabaseAdmin.from('bank_statement_lines').select('external_id').eq('tenant_id', tenant).in('external_id', ids);
      const have = new Set((existing || []).map((x: any) => x.external_id));
      const fresh = lines.filter(l => !have.has(l.external_id));
      if (fresh.length) {
        await supabaseAdmin.from('bank_statement_lines').insert(fresh.map(l => ({
          tenant_id: tenant, stmt_date: l.stmt_date || null, description: l.description, amount: l.amount,
          external_id: l.external_id, treasury_account_id: conn.treasury_account_id || null, reconciled: false,
        })));
        inserted = fresh.length;
      }
    }
    await supabaseAdmin.from('bank_connections').update({
      last_sync_at: new Date().toISOString(), status: 'active', last_error: null,
      institution: institution || conn.institution, account_mask: accountMask || conn.account_mask,
    }).eq('id', conn.id);
    return { inserted };
  } catch (e: any) {
    await supabaseAdmin.from('bank_connections').update({ status: 'error', last_error: String(e?.message || e).slice(0, 300) }).eq('id', conn.id);
    throw e;
  }
}
