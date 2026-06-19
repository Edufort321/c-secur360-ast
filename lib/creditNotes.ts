// Notes de crédit (P2-1) — lecture/numérotation côté client. La création + comptabilisation passe par
// la route serveur /api/accounting/credit-note (contre-écriture GL). Données opérationnelles, scopées tenant.
import { supabase } from '@/lib/supabase';

export type CreditNote = {
  id?: string; tenant_id?: string; credit_note_number: string; invoice_id?: string | null; invoice_number?: string | null;
  client_name?: string | null; issue_date?: string; reason?: string | null; province?: string;
  subtotal: number; gst_amount: number; qst_amount: number; pst_amount: number; total: number;
  refunded?: boolean; gl_entry_id?: string | null; refund_gl_entry_id?: string | null; created_at?: string;
};

export async function getCreditNotes(tenant: string): Promise<CreditNote[]> {
  try {
    const { data, error } = await supabase.from('commerce_credit_notes').select('*').eq('tenant_id', tenant).order('issue_date', { ascending: false });
    if (error) return [];
    return (data || []) as CreditNote[];
  } catch { return []; }
}

/** Prochain numéro de note de crédit : NC-AAAA-NNN. */
export async function nextCreditNoteNumber(tenant: string, prefix = 'NC'): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const { data } = await supabase.from('commerce_credit_notes').select('credit_note_number').eq('tenant_id', tenant).like('credit_note_number', `${prefix}-${year}-%`).order('credit_note_number', { ascending: false }).limit(1);
    const last = (data && data[0]?.credit_note_number) || '';
    const n = parseInt(String(last).split('-').pop() || '0', 10) || 0;
    return `${prefix}-${year}-${String(n + 1).padStart(3, '0')}`;
  } catch { return `${prefix}-${year}-001`; }
}
