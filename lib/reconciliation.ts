// Réconciliation inter-modules (#43) — contrôle d'intégrité « santé des données » AVANT la mise en prod.
// Lecture seule : croise factures / transactions / projets / banque / inventaire avec le GRAND LIVRE et
// signale les écarts (non comptabilisé, non rapproché, orphelin, déséquilibre). Aucune écriture.
import { supabase } from '@/lib/supabase';
import { getAccounts, getTrialBalance } from '@/lib/accounting';
import { getInventoryValuation, getBookedStockValue } from '@/lib/inventory';

export type CheckStatus = 'ok' | 'warn' | 'error' | 'info';
export type Check = { key: string; label: string; status: CheckStatus; detail: string; count?: number; hint?: string };
export type ReconResult = { checks: Check[]; ok: number; warn: number; error: number };

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const mny = (n: number) => `${r2(n).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export async function runReconciliation(tenant: string): Promise<ReconResult> {
  const checks: Check[] = [];
  const push = (c: Check) => checks.push(c);

  // Données (best-effort : une table absente ne casse pas le rapport).
  const safe = async <T,>(p: Promise<{ data: T | null }>): Promise<T | null> => { try { return (await p).data; } catch { return null; } };
  const [invoices, txns, glEntries, accounts] = await Promise.all([
    safe<any[]>(supabase.from('commerce_invoices').select('id, status, gl_entry_id, total').eq('tenant_id', tenant) as any),
    safe<any[]>(supabase.from('commerce_transactions').select('id, status, gl_entry_id, needs_review, total, txn_type').eq('tenant_id', tenant) as any),
    safe<any[]>(supabase.from('gl_entries').select('id, source_type, source_id, posted').eq('tenant_id', tenant) as any),
    (async () => { try { return await getAccounts(tenant); } catch { return []; } })(),
  ]);

  // 1) Balance générale équilibrée (Σ débits = Σ crédits sur les écritures validées).
  try {
    const bal = await getTrialBalance(tenant);
    let d = 0, c = 0; Object.values(bal).forEach(b => { d += b.debit; c += b.credit; });
    const diff = r2(d - c);
    push(Math.abs(diff) < 0.01
      ? { key: 'balance', label: 'Balance générale équilibrée', status: 'ok', detail: `Débits = crédits (${mny(d)}).` }
      : { key: 'balance', label: 'Balance générale équilibrée', status: 'error', detail: `Écart débits−crédits : ${mny(diff)}.`, hint: 'Écriture déséquilibrée — vérifier le grand livre.' });
  } catch { push({ key: 'balance', label: 'Balance générale', status: 'info', detail: 'Plan comptable non initialisé.' }); }

  // 2) Factures émises/payées non comptabilisées au GL.
  if (invoices) {
    const toPost = invoices.filter(i => (i.status === 'sent' || i.status === 'paid') && !i.gl_entry_id);
    push(toPost.length === 0
      ? { key: 'inv_posted', label: 'Factures comptabilisées', status: 'ok', detail: 'Toutes les factures émises/payées sont au grand livre.' }
      : { key: 'inv_posted', label: 'Factures à comptabiliser', status: 'warn', count: toPost.length, detail: `${toPost.length} facture(s) émise(s)/payée(s) sans écriture GL (${mny(toPost.reduce((s, i) => s + (Number(i.total) || 0), 0))}).`, hint: 'Facturation → « Comptabiliser » ou « Synchroniser tout ».' });
  }

  // 3) Transactions non comptabilisées (hors annulées et « à vérifier »).
  if (txns) {
    const toPost = txns.filter(t => t.status !== 'cancelled' && !t.needs_review && !t.gl_entry_id);
    const review = txns.filter(t => t.needs_review);
    push(toPost.length === 0
      ? { key: 'txn_posted', label: 'Transactions comptabilisées', status: 'ok', detail: 'Toutes les transactions sont au grand livre.' }
      : { key: 'txn_posted', label: 'Transactions à comptabiliser', status: 'warn', count: toPost.length, detail: `${toPost.length} transaction(s) sans écriture GL (${mny(toPost.reduce((s, t) => s + (Number(t.total) || 0), 0))}).`, hint: 'Transactions → « Comptabiliser tout ».' });
    if (review.length) push({ key: 'txn_review', label: 'Transactions à vérifier (IA)', status: 'warn', count: review.length, detail: `${review.length} transaction(s) pré-remplie(s) par l'IA en attente de validation (non comptabilisées).`, hint: 'Vérifier puis enregistrer.' });
  }

  // 4) Écritures GL orphelines (source supprimée).
  if (glEntries && invoices && txns) {
    const invIds = new Set(invoices.map(i => String(i.id)));
    const txnIds = new Set(txns.map(t => String(t.id)));
    const orphans = glEntries.filter(e => {
      if (e.source_type === 'invoice' || e.source_type === 'invoice_payment') return e.source_id && !invIds.has(String(e.source_id));
      if (e.source_type === 'transaction' || e.source_type === 'transaction_payment') return e.source_id && !txnIds.has(String(e.source_id));
      return false;
    });
    push(orphans.length === 0
      ? { key: 'gl_orphans', label: 'Aucune écriture orpheline', status: 'ok', detail: 'Toutes les écritures GL pointent vers une source existante.' }
      : { key: 'gl_orphans', label: 'Écritures GL orphelines', status: 'error', count: orphans.length, detail: `${orphans.length} écriture(s) dont la facture/transaction d'origine n'existe plus.`, hint: 'Transactions → « Nettoyer orphelines », ou contre-passer.' });
  }

  // 5) Comptes clients (1100) vs factures non payées (cohérence AR).
  if (invoices && accounts && accounts.length) {
    try {
      const bal = await getTrialBalance(tenant);
      const ar = accounts.find(a => a.code === '1100');
      if (ar) {
        const arBal = bal[ar.id] ? r2(bal[ar.id].debit - bal[ar.id].credit) : 0;
        const openInv = r2(invoices.filter(i => i.status === 'sent').reduce((s, i) => s + (Number(i.total) || 0), 0));
        const diff = r2(arBal - openInv);
        push(Math.abs(diff) < 1
          ? { key: 'ar', label: 'Comptes clients (AR) cohérents', status: 'ok', detail: `Compte 1100 (${mny(arBal)}) ≈ factures à recevoir (${mny(openInv)}).` }
          : { key: 'ar', label: 'Écart comptes clients (AR)', status: 'warn', detail: `Compte 1100 = ${mny(arBal)} vs factures « Traité » non payées = ${mny(openInv)} (écart ${mny(diff)}).`, hint: 'Encaissements non soldés ou factures non comptabilisées.' });
      }
    } catch { /* ignore */ }
  }

  // 6) Stocks : valeur calculée vs compte 1300.
  try {
    const [val, booked] = await Promise.all([getInventoryValuation(tenant), getBookedStockValue(tenant)]);
    if (val.itemCount > 0) {
      if (booked == null) push({ key: 'stock', label: 'Stocks au bilan', status: 'info', detail: `Valeur d'inventaire ${mny(val.totalValue)} non encore au bilan (plan comptable absent).` });
      else {
        const diff = r2(val.totalValue - booked);
        push(Math.abs(diff) < 1
          ? { key: 'stock', label: 'Stocks (1300) à jour', status: 'ok', detail: `Compte 1300 (${mny(booked)}) = valeur d'inventaire.` }
          : { key: 'stock', label: 'Stocks (1300) à actualiser', status: 'warn', detail: `Inventaire ${mny(val.totalValue)} vs compte 1300 ${mny(booked)} (écart ${mny(diff)}).`, hint: 'État financier → « Comptabiliser au bilan (1300) ».' });
      }
    }
  } catch { /* ignore */ }

  // 7) Lignes bancaires non rapprochées.
  const bankUnrec = await safe<any[]>(supabase.from('bank_statement_lines').select('id, reconciled').eq('tenant_id', tenant).eq('reconciled', false) as any);
  if (bankUnrec) {
    push(bankUnrec.length === 0
      ? { key: 'bank', label: 'Banque rapprochée', status: 'ok', detail: 'Aucune ligne bancaire en attente de rapprochement.' }
      : { key: 'bank', label: 'Lignes bancaires non rapprochées', status: 'info', count: bankUnrec.length, detail: `${bankUnrec.length} ligne(s) de relevé non rapprochée(s).`, hint: 'Transactions → Rapprochement bancaire.' });
  }

  const ok = checks.filter(c => c.status === 'ok').length;
  const warn = checks.filter(c => c.status === 'warn' || c.status === 'info').length;
  const error = checks.filter(c => c.status === 'error').length;
  return { checks, ok, warn, error };
}
