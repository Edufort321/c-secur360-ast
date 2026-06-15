// Module « Facture de commerce » — facturation générique multi-province.
// Taxes alignées sur les codes de la migration 085. Lien vers le grand livre via gl_entry_id.
import { supabase } from '@/lib/supabase';

export type TaxRates = { gst: number; qst: number; pst: number; pstLabel: string };

// Taux par province/territoire (2026). TVH = taxe unique (placée dans pst, étiquetée « TVH »).
export const TAX_BY_PROVINCE: Record<string, TaxRates> = {
  QC: { gst: 0.05, qst: 0.09975, pst: 0,     pstLabel: '' },
  ON: { gst: 0,    qst: 0,       pst: 0.13,  pstLabel: 'TVH' },
  NS: { gst: 0,    qst: 0,       pst: 0.14,  pstLabel: 'TVH' },
  NB: { gst: 0,    qst: 0,       pst: 0.15,  pstLabel: 'TVH' },
  NL: { gst: 0,    qst: 0,       pst: 0.15,  pstLabel: 'TVH' },
  PE: { gst: 0,    qst: 0,       pst: 0.15,  pstLabel: 'TVH' },
  BC: { gst: 0.05, qst: 0,       pst: 0.07,  pstLabel: 'PST' },
  SK: { gst: 0.05, qst: 0,       pst: 0.06,  pstLabel: 'PST' },
  MB: { gst: 0.05, qst: 0,       pst: 0.07,  pstLabel: 'RST' },
  AB: { gst: 0.05, qst: 0,       pst: 0,     pstLabel: '' },
  NT: { gst: 0.05, qst: 0,       pst: 0,     pstLabel: '' },
  YT: { gst: 0.05, qst: 0,       pst: 0,     pstLabel: '' },
  NU: { gst: 0.05, qst: 0,       pst: 0,     pstLabel: '' },
};
export const PROVINCES = Object.keys(TAX_BY_PROVINCE);

// tax_category : 'standard' (TPS+TVQ), 'zero_rated' (détaxé 0% — fourniture taxable à 0%, CTI possible
// sur intrants), 'exempt' (exonéré — pas de taxe, pas de CTI). Pour le calcul d'une ligne, détaxé et
// exonéré = 0 taxe ; la catégorie sert au classement fiscal. Rétro-compat : si absent, on lit `taxable`.
export type TaxCategory = 'standard' | 'zero_rated' | 'exempt';
export type InvoiceItem = { id?: string; description: string; quantity: number; unit_price: number; subtotal: number; taxable: boolean; tax_category?: TaxCategory; sort_order?: number };
// Une ligne est TAXÉE seulement si sa catégorie est 'standard' (sinon 0). Repli sur l'ancien booléen.
export const lineIsTaxed = (i: { tax_category?: TaxCategory; taxable?: boolean }) => i.tax_category ? i.tax_category === 'standard' : i.taxable !== false;
export type Invoice = {
  id?: string; invoice_number: string; client_id?: string | null; client_snapshot?: any;
  status: 'draft' | 'sent' | 'paid' | 'cancelled'; issue_date: string; due_date?: string | null; province: string;
  subtotal: number; gst_rate: number; qst_rate: number; pst_rate: number;
  gst_amount: number; qst_amount: number; pst_amount: number; total: number;
  notes?: string | null; payment_terms?: string | null; paid_date?: string | null; gl_entry_id?: string | null;
};
export type CompanySettings = {
  tenant_id?: string; legal_name?: string; address?: string; city?: string; province?: string; postal_code?: string;
  country?: string; phone?: string; email?: string; website?: string; gst_number?: string; qst_number?: string;
  bank_details?: string; invoice_prefix?: string; default_terms?: string; logo_url?: string;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Calcule sous-total + taxes (sur la base taxable, sans taxe sur taxe) + total selon la province. */
export function computeInvoiceTotals(items: InvoiceItem[], province: string) {
  const r = TAX_BY_PROVINCE[province] || TAX_BY_PROVINCE.QC;
  const taxableBase = items.filter(lineIsTaxed).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const gst_amount = r2(taxableBase * r.gst);
  const qst_amount = r2(taxableBase * r.qst);
  const pst_amount = r2(taxableBase * r.pst);
  return {
    subtotal: r2(subtotal), gst_rate: r.gst, qst_rate: r.qst, pst_rate: r.pst,
    gst_amount, qst_amount, pst_amount, total: r2(subtotal + gst_amount + qst_amount + pst_amount),
  };
}

export async function getCompanySettings(tenant: string): Promise<CompanySettings | null> {
  const { data } = await supabase.from('company_settings').select('*').eq('tenant_id', tenant).maybeSingle();
  return (data as CompanySettings) || null;
}
export async function saveCompanySettings(tenant: string, s: CompanySettings) {
  const { error } = await supabase.from('company_settings').upsert({ ...s, tenant_id: tenant, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (error) throw error;
}

/** Prochain numéro séquentiel pour l'année courante : <prefix>-<année>-NNN. */
export async function nextInvoiceNumber(tenant: string, prefix = 'F'): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabase.from('commerce_invoices').select('invoice_number')
    .eq('tenant_id', tenant).like('invoice_number', `${prefix}-${year}-%`)
    .order('invoice_number', { ascending: false }).limit(1);
  let seq = 1;
  const last = data?.[0]?.invoice_number as string | undefined;
  if (last) { const m = last.match(/(\d+)\s*$/); if (m) seq = parseInt(m[1], 10) + 1; }
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
}

export async function getInvoices(tenant: string): Promise<Invoice[]> {
  const { data, error } = await supabase.from('commerce_invoices').select('*').eq('tenant_id', tenant).order('issue_date', { ascending: false });
  if (error) throw error;
  return (data || []) as Invoice[];
}
export async function getInvoiceItems(tenant: string, invoiceId: string): Promise<InvoiceItem[]> {
  const { data } = await supabase.from('commerce_invoice_items').select('*').eq('tenant_id', tenant).eq('invoice_id', invoiceId).order('sort_order');
  return (data || []) as InvoiceItem[];
}

/** Crée (ou met à jour) une facture + ses lignes, avec recalcul des totaux. */
export async function saveInvoice(tenant: string, header: Invoice, items: InvoiceItem[]): Promise<string> {
  const totals = computeInvoiceTotals(items, header.province);
  const payload: any = {
    tenant_id: tenant, invoice_number: header.invoice_number, client_id: header.client_id ?? null,
    client_snapshot: header.client_snapshot ?? null, status: header.status, issue_date: header.issue_date,
    due_date: header.due_date ?? null, province: header.province, notes: header.notes ?? null,
    payment_terms: header.payment_terms ?? null, paid_date: header.paid_date ?? null, gl_entry_id: header.gl_entry_id ?? null,
    ...totals, updated_at: new Date().toISOString(),
  };
  let id = header.id;
  if (id) {
    const { error } = await supabase.from('commerce_invoices').update(payload).eq('id', id);
    if (error) throw error;
    await supabase.from('commerce_invoice_items').delete().eq('tenant_id', tenant).eq('invoice_id', id);
  } else {
    const { data, error } = await supabase.from('commerce_invoices').insert(payload).select('id').single();
    if (error) throw error;
    id = data.id;
  }
  const rows = items.map((it, i) => ({
    tenant_id: tenant, invoice_id: id, description: it.description, quantity: Number(it.quantity) || 0,
    unit_price: Number(it.unit_price) || 0, subtotal: r2((Number(it.quantity) || 0) * (Number(it.unit_price) || 0)),
    taxable: lineIsTaxed(it), // synchro avec la catégorie -> taxes correctes même avant migration 182
    tax_category: it.tax_category || (it.taxable === false ? 'exempt' : 'standard'), sort_order: i,
  }));
  if (rows.length) {
    let { error } = await supabase.from('commerce_invoice_items').insert(rows);
    if (error && /tax_category/i.test(String(error.message || ''))) { // colonne absente (migration 182) -> retire et réessaie
      const rows2 = rows.map(({ tax_category, ...r }) => r);
      ({ error } = await supabase.from('commerce_invoice_items').insert(rows2));
    }
    if (error) throw error;
  }
  return id as string;
}

export async function setInvoiceStatus(tenant: string, id: string, status: Invoice['status'], paidDate?: string) {
  const patch: any = { status, updated_at: new Date().toISOString() };
  if (status === 'paid') patch.paid_date = paidDate || new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from('commerce_invoices').update(patch).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function deleteInvoice(tenant: string, id: string) {
  const { error } = await supabase.from('commerce_invoices').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}
