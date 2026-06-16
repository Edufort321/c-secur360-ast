// Abonnements récurrents (#35) — un tenant facture ses clients périodiquement. Source du MRR/ARR.
// Données opérationnelles (table permissive, scopées par tenant côté app).
import { supabase } from '@/lib/supabase';

export type Interval = 'monthly' | 'annual';
export type RecurringSub = {
  id?: string; tenant_id?: string; client_name: string; client_id?: string | null;
  plan_name: string; amount: number; interval: Interval; province?: string | null;
  status: 'active' | 'paused' | 'cancelled'; start_date?: string; next_billing_date?: string | null;
  billing_count?: number; auto_invoice?: boolean; notes?: string | null;
};

export async function getRecurring(tenant: string): Promise<RecurringSub[]> {
  const { data, error } = await supabase.from('recurring_subscriptions').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as RecurringSub[];
}

export async function saveRecurring(tenant: string, s: RecurringSub): Promise<string> {
  const row: any = {
    tenant_id: tenant, client_name: s.client_name, client_id: s.client_id || null, plan_name: s.plan_name || 'Abonnement',
    amount: Number(s.amount) || 0, interval: s.interval === 'annual' ? 'annual' : 'monthly', province: s.province || null,
    status: s.status || 'active', start_date: s.start_date || new Date().toISOString().slice(0, 10),
    next_billing_date: s.next_billing_date || s.start_date || new Date().toISOString().slice(0, 10),
    auto_invoice: s.auto_invoice !== false, notes: s.notes || null, updated_at: new Date().toISOString(),
  };
  if (s.id) { const { error } = await supabase.from('recurring_subscriptions').update(row).eq('id', s.id).eq('tenant_id', tenant); if (error) throw error; return s.id; }
  const { data, error } = await supabase.from('recurring_subscriptions').insert(row).select('id').single();
  if (error) throw error;
  return (data as any).id as string;
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
