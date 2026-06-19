// Abonnements récurrents (#35) — un tenant facture ses clients périodiquement. Source du MRR/ARR.
// Données opérationnelles (table permissive, scopées par tenant côté app).
import { supabase } from '@/lib/supabase';

export type Interval = 'monthly' | 'annual';
export type SubPayment = { date: string; amount: number; transaction_id?: string | null; proof_url?: string | null; note?: string | null };
export type RecurringSub = {
  id?: string; tenant_id?: string; client_name: string; client_id?: string | null;
  plan_name: string; amount: number; interval: Interval; province?: string | null;
  status: 'active' | 'paused' | 'cancelled'; start_date?: string; next_billing_date?: string | null;
  billing_count?: number; auto_invoice?: boolean; notes?: string | null;
  revenue_category?: string | null;        // classe de revenu (ventilation, mig 239)
  last_paid_at?: string | null; proof_url?: string | null;
  history?: SubPayment[]; last_transaction_id?: string | null;
};

export async function getRecurring(tenant: string): Promise<RecurringSub[]> {
  const { data, error } = await supabase.from('recurring_subscriptions').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as RecurringSub[];
}

// Colonnes optionnelles (migration 239) — retirées chirurgicalement si la base ne les a pas encore.
const OPTIONAL_COLS = ['revenue_category', 'last_paid_at', 'proof_url', 'history', 'last_transaction_id'];
function isMissingColErr(e: any): boolean { const m = String(e?.message || '').toLowerCase(); return m.includes('does not exist') || m.includes('schema cache') || m.includes('column'); }

export async function saveRecurring(tenant: string, s: RecurringSub): Promise<string> {
  const row: any = {
    tenant_id: tenant, client_name: s.client_name, client_id: s.client_id || null, plan_name: s.plan_name || 'Abonnement',
    amount: Number(s.amount) || 0, interval: s.interval === 'annual' ? 'annual' : 'monthly', province: s.province || null,
    status: s.status || 'active', start_date: s.start_date || new Date().toISOString().slice(0, 10),
    next_billing_date: s.next_billing_date || s.start_date || new Date().toISOString().slice(0, 10),
    auto_invoice: s.auto_invoice !== false, notes: s.notes || null, updated_at: new Date().toISOString(),
    revenue_category: s.revenue_category || null,
  };
  if (s.last_paid_at !== undefined) row.last_paid_at = s.last_paid_at || null;
  if (s.proof_url !== undefined) row.proof_url = s.proof_url || null;
  if (s.history !== undefined) row.history = s.history || [];
  if (s.last_transaction_id !== undefined) row.last_transaction_id = s.last_transaction_id || null;

  // Insertion/màj avec repli : si une colonne optionnelle manque, on la retire et on retente.
  async function run(payload: any): Promise<string> {
    if (s.id) {
      const { error } = await supabase.from('recurring_subscriptions').update(payload).eq('id', s.id).eq('tenant_id', tenant);
      if (error) {
        if (isMissingColErr(error) && OPTIONAL_COLS.some(c => c in payload)) { const p = { ...payload }; for (const c of OPTIONAL_COLS) delete p[c]; return run(p); }
        throw error;
      }
      return s.id;
    }
    const { data, error } = await supabase.from('recurring_subscriptions').insert(payload).select('id').single();
    if (error) {
      if (isMissingColErr(error) && OPTIONAL_COLS.some(c => c in payload)) { const p = { ...payload }; for (const c of OPTIONAL_COLS) delete p[c]; return run(p); }
      throw error;
    }
    return (data as any).id as string;
  }
  return run(row);
}

/** Marque un abonnement payé : ajoute le paiement à l'historique, avance l'échéance, garde la preuve + le lien transaction. */
export async function recordSubPayment(tenant: string, sub: RecurringSub, p: SubPayment): Promise<string> {
  const history = [...(sub.history || []), p];
  const next = sub.next_billing_date ? advanceDate(sub.next_billing_date, sub.interval) : null;
  return saveRecurring(tenant, {
    ...sub, history, last_paid_at: p.date, proof_url: p.proof_url || sub.proof_url || null,
    last_transaction_id: p.transaction_id || sub.last_transaction_id || null,
    next_billing_date: next, billing_count: (sub.billing_count || 0) + 1,
  });
}

/** Un abonnement est-il en retard (échéance dépassée et actif) ? → affichage en ROUGE. */
export function isOverdue(s: RecurringSub, todayIso = new Date().toISOString().slice(0, 10)): boolean {
  return s.status === 'active' && !!s.next_billing_date && s.next_billing_date < todayIso;
}

export async function deleteRecurring(tenant: string, id: string): Promise<void> {
  const { error } = await supabase.from('recurring_subscriptions').delete().eq('id', id).eq('tenant_id', tenant);
  if (error) throw error;
}

/** Montant mensuel normalisé d'un abonnement actif (annuel ÷ 12). */
export function monthlyAmount(s: RecurringSub): number {
  if (s.status !== 'active') return 0;
  const a = Number(s.amount) || 0;
  return s.interval === 'annual' ? a / 12 : a;
}

/** MRR (revenu récurrent mensuel) + ARR (× 12) à partir des abonnements ACTIFS. */
export function computeRecurringMetrics(subs: RecurringSub[]): { mrr: number; arr: number; activeCount: number } {
  const active = subs.filter(s => s.status === 'active');
  const mrr = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  return { mrr: Math.round(mrr * 100) / 100, arr: Math.round(mrr * 12 * 100) / 100, activeCount: active.length };
}

/** Avance une date d'échéance d'une période (mensuelle/annuelle). */
export function advanceDate(dateStr: string, interval: Interval): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (interval === 'annual') d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
