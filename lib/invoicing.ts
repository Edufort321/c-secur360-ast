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
export type InvoiceItem = { id?: string; description: string; quantity: number; unit_price: number; subtotal: number; taxable: boolean; tax_category?: TaxCategory; sort_order?: number; item_id?: string | null; product_class?: string | null };
// Une ligne est TAXÉE seulement si sa catégorie est 'standard' (sinon 0). Repli sur l'ancien booléen.
export const lineIsTaxed = (i: { tax_category?: TaxCategory; taxable?: boolean }) => i.tax_category ? i.tax_category === 'standard' : i.taxable !== false;
export type Invoice = {
  id?: string; invoice_number: string; client_id?: string | null; client_snapshot?: any;
  status: 'draft' | 'sent' | 'paid' | 'cancelled'; issue_date: string; due_date?: string | null; province: string;
  subtotal: number; gst_rate: number; qst_rate: number; pst_rate: number;
  gst_amount: number; qst_amount: number; pst_amount: number; total: number;
  notes?: string | null; payment_terms?: string | null; paid_date?: string | null; gl_entry_id?: string | null;
  currency?: string; fx_rate?: number;   // multi-devise (#43) — défaut CAD / 1
  revenue_category?: string | null;      // catégorie de revenu (ventilation état financier, migration 231)
  paid_amount?: number | null;           // cumul encaissé (paiements partiels, migration 246)
};
export type CompanySettings = {
  tenant_id?: string; legal_name?: string; address?: string; city?: string; province?: string; postal_code?: string;
  country?: string; phone?: string; email?: string; website?: string; gst_number?: string; qst_number?: string;
  bank_details?: string; invoice_prefix?: string; default_terms?: string; logo_url?: string;
  // Relances automatiques (dunning) : activer + paliers de retard (jours).
  dunning_enabled?: boolean; dunning_days?: number[];
  // Règle frais de subsistance par défaut selon la portée du projet (interne/externe).
  subsistence_interne?: boolean; subsistence_externe?: boolean;
  // Licences entrepreneur (Québec) — affichées sur soumissions/factures (conformité RBQ/CMEQ).
  rbq_license?: string; cmeq_member?: string; neq?: string;
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
  const row: any = { ...s, tenant_id: tenant, updated_at: new Date().toISOString() };
  let { error } = await supabase.from('company_settings').upsert(row, { onConflict: 'tenant_id' });
  // Résilience : si une colonne récente n'existe pas encore (migration non appliquée), on la retire et on réessaie.
  if (error && /(dunning_enabled|dunning_days|stripe_account_id|stripe_charges_enabled|subsistence_interne|subsistence_externe|rbq_license|cmeq_member|neq|column).*(does not exist|schema cache)/i.test(error.message || '')) {
    delete row.dunning_enabled; delete row.dunning_days; delete row.subsistence_interne; delete row.subsistence_externe;
    delete row.rbq_license; delete row.cmeq_member; delete row.neq;
    ({ error } = await supabase.from('company_settings').upsert(row, { onConflict: 'tenant_id' }));
  }
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
    ...(header.currency ? { currency: header.currency, fx_rate: Number(header.fx_rate) || 1 } : {}),
    ...(header.revenue_category ? { revenue_category: header.revenue_category } : {}),
    ...totals, updated_at: new Date().toISOString(),
  };
  // Résilient : si des colonnes optionnelles n'existent pas (migrations 221/231), on les retire et on réessaie.
  const isMissingCur = (e: any) => /currency|fx_rate|revenue_category/i.test(String(e?.message || ''));
  const stripCur = (p: any) => { const { currency, fx_rate, revenue_category, ...rest } = p; return rest; };
  let id = header.id;
  if (id) {
    let { error } = await supabase.from('commerce_invoices').update(payload).eq('id', id);
    if (error && isMissingCur(error)) ({ error } = await supabase.from('commerce_invoices').update(stripCur(payload)).eq('id', id));
    if (error) throw error;
    await supabase.from('commerce_invoice_items').delete().eq('tenant_id', tenant).eq('invoice_id', id);
  } else {
    let res = await supabase.from('commerce_invoices').insert(payload).select('id').single();
    if (res.error && isMissingCur(res.error)) res = await supabase.from('commerce_invoices').insert(stripCur(payload)).select('id').single();
    if (res.error) throw res.error;
    id = res.data.id;
  }
  const rows = items.map((it, i) => ({
    tenant_id: tenant, invoice_id: id, description: it.description, quantity: Number(it.quantity) || 0,
    unit_price: Number(it.unit_price) || 0, subtotal: r2((Number(it.quantity) || 0) * (Number(it.unit_price) || 0)),
    taxable: lineIsTaxed(it), // synchro avec la catégorie -> taxes correctes même avant migration 182
    tax_category: it.tax_category || (it.taxable === false ? 'exempt' : 'standard'), sort_order: i,
    item_id: it.item_id || null, product_class: it.product_class || null, // lien produit + classe (revenus par classe, mig 194)
  }));
  if (rows.length) {
    // Insert résilient : retire les colonnes récentes absentes (tax_category mig 182, item_id/product_class mig 194).
    let { error } = await supabase.from('commerce_invoice_items').insert(rows);
    let attempt = rows;
    let g = 0;
    while (error && g < 4) {
      const msg = String(error.message || '');
      const m = msg.match(/'([a-z_]+)' column|column "?([a-z_]+)"? .*does not exist|could not find the '([a-z_]+)'/i);
      const col = m ? (m[1] || m[2] || m[3]) : (/tax_category/i.test(msg) ? 'tax_category' : null);
      if (!col) break;
      attempt = attempt.map((r: any) => { const c = { ...r }; delete c[col]; return c; });
      ({ error } = await supabase.from('commerce_invoice_items').insert(attempt)); g++;
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
  // Comptabilité d'EXERCICE : constatation auto du revenu/encaissement au changement de statut (best-effort).
  const { autoPostInvoiceStatus } = await import('@/lib/accountingAuto');
  await autoPostInvoiceStatus(tenant, id, status);
}

export async function deleteInvoice(tenant: string, id: string) {
  const { error } = await supabase.from('commerce_invoices').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

/**
 * PONT Projet → Facturation centrale. Crée (ou met à jour, idempotent par id) une facture commerce
 * depuis l'onglet Facture d'un PROJET, pour qu'elle apparaisse dans la « Facturation » au statut
 * « Traité » (= 'sent', revenu constaté au grand livre via setInvoiceStatus). L'encaissement (statut
 * « Payée ») se fait ensuite depuis la liste Facturation (bouton Payée). Lien projet best-effort
 * (colonnes de la migration 212 — ignoré si absentes).
 */
export async function syncProjectInvoice(tenant: string, opts: {
  id?: string | null; invoice_number: string; issue_date: string; province?: string;
  client_name?: string | null; client_id?: string | null; notes?: string | null; payment_terms?: string | null;
  items: InvoiceItem[]; project_id?: string | null; project_number?: string | null;
  revenue_distribution?: { class: string; pct: number }[] | null; // répartition par classe (mig 237)
}): Promise<string> {
  const header: Invoice = {
    id: opts.id || undefined, invoice_number: opts.invoice_number,
    client_id: opts.client_id ?? null, client_snapshot: opts.client_name ? { name: opts.client_name } : null,
    status: 'sent', issue_date: opts.issue_date, province: opts.province || 'QC',
    subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0,
    notes: opts.notes ?? null, payment_terms: opts.payment_terms ?? null,
  };
  const id = await saveInvoice(tenant, header, opts.items);
  // Lien projet (best-effort : colonnes ajoutées par la migration 212).
  if (opts.project_id || opts.project_number) {
    try { await supabase.from('commerce_invoices').update({ project_id: opts.project_id ?? null, project_number: opts.project_number ?? null, source: 'project' }).eq('id', id).eq('tenant_id', tenant); } catch { /* colonnes absentes */ }
  }
  // Répartition par classe (best-effort : colonne ajoutée par la migration 237).
  if (opts.revenue_distribution && opts.revenue_distribution.length) {
    try { await supabase.from('commerce_invoices').update({ revenue_distribution: opts.revenue_distribution }).eq('id', id).eq('tenant_id', tenant); } catch { /* colonne absente */ }
  }
  // Statut « Traité » + constatation auto du revenu au grand livre (idempotent, best-effort).
  await setInvoiceStatus(tenant, id, 'sent');
  return id;
}
