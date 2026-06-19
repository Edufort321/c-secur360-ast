// Module « Transactions » — depenses / achats fournisseurs (migration 087).
// Calcule les taxes payees (recuperables CTI/RTI) et alimente le grand livre via une
// ecriture d'achat. Reutilise les taux par province du module Facture.
import { supabase } from '@/lib/supabase';
import { TAX_BY_PROVINCE, lineIsTaxed, type TaxCategory } from '@/lib/invoicing';

export type TransactionItem = {
  id?: string; description: string; account_code: string; amount: number; taxable: boolean; tax_category?: TaxCategory; sort_order?: number;
  revenue_category?: string | null; // classe PAR LIGNE (ventilation des coûts/revenus par classe, migration 236)
};
export type Transaction = {
  id?: string; transaction_number: string; vendor_id?: string | null; vendor_name?: string | null;
  txn_type?: 'expense' | 'revenue'; // 'expense' = depense/achat (defaut) ; 'revenue' = revenu/vente
  txn_date: string; province: string; payment_method: 'cash' | 'on_account';
  status: 'draft' | 'posted' | 'paid' | 'cancelled';
  subtotal: number; gst_rate: number; qst_rate: number; pst_rate: number;
  gst_amount: number; qst_amount: number; pst_amount: number; total: number;
  receipt_url?: string | null; notes?: string | null; gl_entry_id?: string | null;
  treasury_account_id?: string | null; // compte de tresorerie assigne (banque/carte) — migration 185
  needs_review?: boolean; // pre-rempli IA -> a verifier avant comptabilisation (migration 187)
  // Dépense engagée par une PERSONNE (migration 207) + nature du règlement :
  //  'standard' (banque/fournisseur) | 'reimbursement' (à rembourser à la personne -> 2300) | 'investment' (apport -> 3100)
  paid_by_person_id?: string | null;
  //  'investor_advance' = ENTRÉE d'argent qui est une avance d'investisseur (dette à rembourser → CR 2400, pas un revenu)
  //  'shares_payment' = l'entreprise RÈGLE une dépense/immobilisation en émettant des actions/parts (aucun décaissement → CR 3100 Capital-actions)
  settlement_kind?: 'standard' | 'reimbursement' | 'investment' | 'investor_advance' | 'shares_payment';
  currency?: string;   // devise du document (multi-devise #43, défaut CAD)
  fx_rate?: number;    // taux vers la devise de base au moment de l'opération (défaut 1)
  revenue_category?: string | null; // classe de revenu (ventilation état financier, migration 232) — si txn_type='revenue'
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
    notes: header.notes ?? null, gl_entry_id: header.gl_entry_id ?? null,
    treasury_account_id: header.treasury_account_id ?? null,
    paid_by_person_id: header.paid_by_person_id ?? null,
    settlement_kind: header.settlement_kind || 'standard',
    ...(header.needs_review !== undefined ? { needs_review: header.needs_review } : {}),
    ...(header.currency ? { currency: header.currency, fx_rate: Number(header.fx_rate) || 1 } : {}),
    ...(header.revenue_category ? { revenue_category: header.revenue_category } : {}),
    ...totals, updated_at: new Date().toISOString(),
  };
  // Si une colonne récente n'existe pas encore (migration 185/187/207/221/232/235), on retire UNIQUEMENT
  // la/les colonne(s) RÉELLEMENT signalée(s) par l'erreur (pas les autres) — sinon on perdait p.ex.
  // revenue_category alors que sa colonne existe, juste parce qu'une autre migration manquait.
  const OPTIONAL_COLS = ['treasury_account_id', 'needs_review', 'paid_by_person_id', 'settlement_kind', 'currency', 'fx_rate', 'revenue_category'];
  const missingCol = (e: any) => OPTIONAL_COLS.some(c => new RegExp(c, 'i').test(String(e?.message || '')));
  const stripFlagged = (p: any, e: any) => { const msg = String(e?.message || ''); const r = { ...p }; for (const c of OPTIONAL_COLS) { if (new RegExp(c, 'i').test(msg)) delete r[c]; } return r; };
  let id = header.id;
  if (id) {
    let { error } = await supabase.from('commerce_transactions').update(payload).eq('id', id);
    if (error && missingCol(error)) { ({ error } = await supabase.from('commerce_transactions').update(stripFlagged(payload, error)).eq('id', id)); }
    if (error) throw error;
    await supabase.from('commerce_transaction_items').delete().eq('tenant_id', tenant).eq('transaction_id', id);
  } else {
    let { data, error } = await supabase.from('commerce_transactions').insert(payload).select('id').single();
    if (error && missingCol(error)) { ({ data, error } = await supabase.from('commerce_transactions').insert(stripFlagged(payload, error)).select('id').single()); }
    if (error) throw error;
    id = data?.id;
  }
  const rows = items.map((it, i) => ({
    tenant_id: tenant, transaction_id: id, description: it.description, account_code: it.account_code || '5300',
    amount: r2(Number(it.amount) || 0), taxable: lineIsTaxed(it),
    tax_category: it.tax_category || (it.taxable === false ? 'exempt' : 'standard'), sort_order: i,
    ...(it.revenue_category ? { revenue_category: it.revenue_category } : {}),
  }));
  if (rows.length) {
    let { error } = await supabase.from('commerce_transaction_items').insert(rows);
    // Colonnes potentiellement absentes : tax_category (mig 182), revenue_category (mig 236) → on retire la/les
    // colonne(s) réellement signalée(s) et on réessaie (zéro perte des autres champs).
    if (error && /tax_category|revenue_category/i.test(String(error.message || ''))) {
      const msg = String(error.message || '');
      const rows2 = rows.map(r => { const x: any = { ...r }; if (/tax_category/i.test(msg)) delete x.tax_category; if (/revenue_category/i.test(msg)) delete x.revenue_category; return x; });
      ({ error } = await supabase.from('commerce_transaction_items').insert(rows2));
    }
    if (error) throw error;
  }
  return id as string;
}

/** Lève le drapeau « à vérifier » (transaction pré-remplie IA confirmée par un humain). Migration 187. */
export async function setTransactionReviewed(tenant: string, id: string): Promise<void> {
  try { await supabase.from('commerce_transactions').update({ needs_review: false }).eq('id', id).eq('tenant_id', tenant); }
  catch { /* colonne absente (migration 187) -> ignore */ }
}

export async function setTransactionStatus(tenant: string, id: string, status: Transaction['status']) {
  const { error } = await supabase.from('commerce_transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
  // Comptabilité d'EXERCICE : constatation auto de la charge/paiement au changement de statut (best-effort).
  const { autoPostTransactionStatus } = await import('@/lib/accountingAuto');
  await autoPostTransactionStatus(tenant, id, status);
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
