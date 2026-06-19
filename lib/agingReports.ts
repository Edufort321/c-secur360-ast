// Sous-grands livres CHRONOLOGIQUES (aging) — Comptes à RECEVOIR (AR) et à PAYER (AP).
// Regroupe les factures clients impayées (AR) et les achats fournisseurs « à terme » impayés (AP)
// par tiers, ventilés en tranches d'ancienneté (courant / 1-30 / 31-60 / 61-90 / 90+ jours) à partir
// de la date d'échéance (ou de la date du document si aucune échéance). Référence : pratique standard
// (rapport d'âge des comptes) pour le suivi des encaissements/décaissements et la provision créances.
import { supabase } from '@/lib/supabase';

export type AgingBucket = 'current' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_plus';
export const AGING_BUCKETS: AgingBucket[] = ['current', 'd1_30', 'd31_60', 'd61_90', 'd90_plus'];
export const AGING_LABELS: Record<AgingBucket, [string, string]> = {
  current:   ['Courant', 'Current'],
  d1_30:     ['1–30 j', '1–30 d'],
  d31_60:    ['31–60 j', '31–60 d'],
  d61_90:    ['61–90 j', '61–90 d'],
  d90_plus:  ['90 j +', '90 d +'],
};

export type AgingDoc = {
  id: string; number: string; party: string; doc_date: string; due_date: string;
  days_overdue: number; bucket: AgingBucket; amount: number;
};
export type AgingParty = { party: string; total: number; buckets: Record<AgingBucket, number>; docs: AgingDoc[] };
export type AgingReport = { parties: AgingParty[]; totals: Record<AgingBucket, number>; grand_total: number; as_of: string };

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const emptyBuckets = (): Record<AgingBucket, number> => ({ current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 });

/** Nombre de jours entre deux dates ISO (b - a), arrondi au jour. */
function daysBetween(a: string, b: string): number {
  const ta = Date.parse(a + 'T00:00:00'), tb = Date.parse(b + 'T00:00:00');
  if (isNaN(ta) || isNaN(tb)) return 0;
  return Math.round((tb - ta) / 86400000);
}

/** Classe un nombre de jours en retard dans une tranche d'ancienneté. */
export function bucketFor(daysOverdue: number): AgingBucket {
  if (daysOverdue <= 0) return 'current';
  if (daysOverdue <= 30) return 'd1_30';
  if (daysOverdue <= 60) return 'd31_60';
  if (daysOverdue <= 90) return 'd61_90';
  return 'd90_plus';
}

/** Construit un rapport d'âge à partir d'une liste de documents impayés. */
function buildReport(docs: Array<{ id: string; number: string; party: string; doc_date: string; due_date: string; amount: number }>, asOf: string): AgingReport {
  const byParty = new Map<string, AgingParty>();
  const totals = emptyBuckets();
  let grand = 0;
  for (const d of docs) {
    const amount = r2(d.amount);
    if (Math.abs(amount) < 0.005) continue;
    const due = d.due_date || d.doc_date;
    const days = daysBetween(due, asOf);
    const bucket = bucketFor(days);
    let p = byParty.get(d.party);
    if (!p) { p = { party: d.party, total: 0, buckets: emptyBuckets(), docs: [] }; byParty.set(d.party, p); }
    p.total = r2(p.total + amount);
    p.buckets[bucket] = r2(p.buckets[bucket] + amount);
    p.docs.push({ id: d.id, number: d.number, party: d.party, doc_date: d.doc_date, due_date: due, days_overdue: Math.max(0, days), bucket, amount });
    totals[bucket] = r2(totals[bucket] + amount);
    grand = r2(grand + amount);
  }
  const parties = Array.from(byParty.values()).sort((a, b) => b.total - a.total);
  for (const p of parties) p.docs.sort((a, b) => b.days_overdue - a.days_overdue);
  return { parties, totals, grand_total: grand, as_of: asOf };
}

/** Comptes à RECEVOIR : factures clients non payées/non annulées (les brouillons sont exclus — non émises). */
export async function getArAging(tenant: string, asOf?: string): Promise<AgingReport> {
  const ref = asOf || new Date().toISOString().slice(0, 10);
  // paid_amount (mig 246) lu en best-effort → le solde DÛ (total − encaissé) alimente l'âge. Repli sans la colonne.
  let data: any[] | null = null;
  ({ data } = await supabase.from('commerce_invoices')
    .select('id, invoice_number, client_snapshot, issue_date, due_date, total, status, paid_amount')
    .eq('tenant_id', tenant).not('status', 'in', '(paid,cancelled,draft)'));
  if (data == null) ({ data } = await supabase.from('commerce_invoices')
    .select('id, invoice_number, client_snapshot, issue_date, due_date, total, status')
    .eq('tenant_id', tenant).not('status', 'in', '(paid,cancelled,draft)'));
  const docs = (data || []).map((i: any) => ({
    id: i.id, number: i.invoice_number || '—',
    party: i.client_snapshot?.name || i.client_snapshot?.legal_name || i.client_snapshot?.company || 'Client',
    doc_date: (i.issue_date || '').slice(0, 10), due_date: (i.due_date || '').slice(0, 10),
    amount: r2((Number(i.total) || 0) - (Number(i.paid_amount) || 0)), // solde DÛ
  }));
  return buildReport(docs, ref);
}

/** Comptes à PAYER : achats fournisseurs « à terme » (on_account) non payés/non annulés (hors revenus). */
export async function getApAging(tenant: string, asOf?: string): Promise<AgingReport> {
  const ref = asOf || new Date().toISOString().slice(0, 10);
  // due_date / payment_terms (mig 244) lus en best-effort : repli sans ces colonnes si non appliquée.
  let data: any[] | null = null;
  ({ data } = await supabase.from('commerce_transactions')
    .select('id, transaction_number, vendor_name, txn_date, txn_type, payment_method, total, status, due_date, payment_terms')
    .eq('tenant_id', tenant).eq('payment_method', 'on_account').not('status', 'in', '(paid,cancelled,draft)'));
  if (data == null) ({ data } = await supabase.from('commerce_transactions')
    .select('id, transaction_number, vendor_name, txn_date, txn_type, payment_method, total, status')
    .eq('tenant_id', tenant).eq('payment_method', 'on_account').not('status', 'in', '(paid,cancelled,draft)'));
  const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00'); if (isNaN(d.getTime())) return ''; d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const docs = (data || [])
    .filter((t: any) => (t.txn_type || 'expense') !== 'revenue')
    .map((t: any) => {
      const doc_date = (t.txn_date || '').slice(0, 10);
      // Échéance = date explicite, sinon date d'écriture + conditions de paiement (net N jours), sinon vide.
      const due_date = t.due_date ? String(t.due_date).slice(0, 10) : (t.payment_terms && doc_date ? addDays(doc_date, Number(t.payment_terms)) : '');
      return { id: t.id, number: t.transaction_number || '—', party: t.vendor_name || 'Fournisseur', doc_date, due_date, amount: Number(t.total) || 0 };
    });
  return buildReport(docs, ref);
}
