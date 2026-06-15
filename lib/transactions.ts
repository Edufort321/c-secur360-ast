// Module « Transactions » — depenses / achats fournisseurs (migration 087).
// Calcule les taxes payees (recuperables CTI/RTI) et alimente le grand livre via une
// ecriture d'achat. Reutilise les taux par province du module Facture.
import { supabase } from '@/lib/supabase';
import { TAX_BY_PROVINCE, lineIsTaxed, type TaxCategory } from '@/lib/invoicing';

export type TransactionItem = {
  id?: string; description: string; account_code: string; amount: number; taxable: boolean; tax_category?: TaxCategory; sort_order?: number;
};
export type Transaction = {
  id?: string; transaction_number: string; vendor_id?: string | null; vendor_name?: string | null;
  txn_type?: 'expense' | 'revenue'; // 'expense' = depense/achat (defaut) ; 'revenue' = revenu/vente
  txn_date: string; province: string; payment_method: 'cash' | 'on_account';
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  subtotal: number; gst_rate: number; qst_rate: number; pst_rate: number;
  gst_amount: number; qst_amount: number; pst_amount: number; total: number;
  receipt_url?: string | null; notes?: string | null; gl_entry_id?: string | null;
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Sous-total (somme des lignes) + taxes sur la base taxable + total, selon la province. */
export function computeTransactionTotals(items: TransactionItem[], province: string) {
  const r = TAX_BY_PROVINCE[province] || TAX_BY_PROVINCE.QC;
  const taxableBase = items.filter(lineIsTaxed).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const gst_amount = r2(taxableBase * r.gst);
  const qst_amount = r2(taxableBase * r.qst);
  const pst_amount = r2(taxableBase * r.pst);
  return {
    subtotal: r2(subtotal), gst_rate: r.gst, qst_rate: r.qst, pst_rate: r.pst,
    gst_amount, qst_amount, pst_amount, total: r2(subtotal + gst_amount + qst_amount + pst_amount),
  };
}

/** Prochain numero sequentiel pour l'annee courante : <prefix>-<annee>-NNN. */
export async function nextTransactionNumber(tenant: string, prefix = 'A'): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabase.from('commerce_transactions').select('transaction_number')
    .eq('tenant_id', tenant).like('transaction_number', `${prefix}-${year}-%`)
    .order('transaction_number', { ascending: false }).limit(1);
  let seq = 1;
  const last = data?.[0]?.transaction_number as string | undefined;
  if (last) { const m = last.match(/(\d+)\s*$/); if (m) seq = parseInt(m[1], 10) + 1; }
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
}

export async function getTransactions(tenant: string): Promise<Transaction[]> {
  const { data, error } = await supabase.from('commerce_transactions').select('*').eq('tenant_id', tenant).order('txn_date', { ascending: false });
  if (error) throw error;
  return (data || []) as Transaction[];
}
export async function getTransactionItems(tenant: string, transactionId: string): Promise<TransactionItem[]> {
  const { data } = await supabase.from('commerce_transaction_items').select('*').eq('tenant_id', tenant).eq('transaction_id', transactionId).order('sort_order');
  return (data || []) as TransactionItem[];
}

/** Cree (ou met a jour) une transaction + ses lignes, avec recalcul des totaux. */
export async function saveTransaction(tenant: string, header: Transaction, items: TransactionItem[]): Promise<string> {
  const totals = computeTransactionTotals(items, header.province);
  const payload: any = {
    tenant_id: tenant, transaction_number: header.transaction_number, vendor_id: header.vendor_id ?? null,
    vendor_name: header.vendor_name ?? null, txn_type: header.txn_type || 'expense', txn_date: header.txn_date, province: header.province,
    payment_method: header.payment_method, status: header.status, receipt_url: header.receipt_url ?? null,
    notes: header.notes ?? null, gl_entry_id: header.gl_entry_id ?? null, ...totals, updated_at: new Date().toISOString(),
  };
  let id = header.id;
  if (id) {
    const { error } = await supabase.from('commerce_transactions').update(payload).eq('id', id);
    if (error) throw error;
    await supabase.from('commerce_transaction_items').delete().eq('tenant_id', tenant).eq('transaction_id', id);
  } else {
    const { data, error } = await supabase.from('commerce_transactions').insert(payload).select('id').single();
    if (error) throw error;
    id = data.id;
  }
  const rows = items.map((it, i) => ({
    tenant_id: tenant, transaction_id: id, description: it.description, account_code: it.account_code || '5300',
    amount: r2(Number(it.amount) || 0), taxable: lineIsTaxed(it),
    tax_category: it.tax_category || (it.taxable === false ? 'exempt' : 'standard'), sort_order: i,
  }));
  if (rows.length) {
    let { error } = await supabase.from('commerce_transaction_items').insert(rows);
    if (error && /tax_category/i.test(String(error.message || ''))) { // colonne absente (migration 182)
      const rows2 = rows.map(({ tax_category, ...r }) => r);
      ({ error } = await supabase.from('commerce_transaction_items').insert(rows2));
    }
    if (error) throw error;
  }
  return id as string;
}

export async function setTransactionStatus(tenant: string, id: string, status: Transaction['status']) {
  const { error } = await supabase.from('commerce_transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

export async function deleteTransaction(tenant: string, id: string) {
  const { error } = await supabase.from('commerce_transactions').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

/** Televerse un recu (image ou PDF) vers Storage ; repli en data URL si le bucket est absent. */
export async function uploadReceipt(tenant: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  try {
    const path = `${tenant}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('transaction-receipts').upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (!error) return supabase.storage.from('transaction-receipts').getPublicUrl(path).data.publicUrl;
  } catch { /* reseau / bucket absent -> repli */ }
  // Repli base64 pour les petits fichiers seulement (limite ~2 Mo)
  if (file.size > 2_000_000) throw new Error('Recu trop volumineux (executez la migration 087 pour activer le stockage).');
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => { const r = e.target?.result as string; r ? resolve(r) : reject(new Error('Lecture du fichier echouee.')); };
    reader.onerror = () => reject(new Error('Lecture du fichier echouee.'));
    reader.readAsDataURL(file);
  });
}
