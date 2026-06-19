// Échéancier des comptes CLIENTS (AR aging, #43 BLOC B) — factures non payées ventilées par tranche
// d'ancienneté vs la date d'échéance. Source : commerce_invoices (table opérationnelle, scopée tenant).
// AP (fournisseurs) : pas de table de factures fournisseurs avec échéances → non calculé pour l'instant.
import { supabase } from '@/lib/supabase';

export type AgingBucket = 'courant' | '0-30' | '31-60' | '61-90' | '90+';
export type ArAging = { buckets: Record<AgingBucket, number>; total: number; overdue: number; count: number };

const BUCKETS: AgingBucket[] = ['courant', '0-30', '31-60', '61-90', '90+'];

function bucketFor(dueIso: string | null, todayIso: string): AgingBucket {
  if (!dueIso) return 'courant';
  const due = new Date(dueIso + 'T00:00:00').getTime();
  const today = new Date(todayIso + 'T00:00:00').getTime();
  const days = Math.round((today - due) / 86400000); // > 0 = en retard
  if (days <= 0) return 'courant';
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

export async function getArAging(tenant: string, todayIso?: string): Promise<ArAging> {
  const today = todayIso || new Date().toISOString().slice(0, 10);
  const empty: ArAging = { buckets: { courant: 0, '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }, total: 0, overdue: 0, count: 0 };
  const { data, error } = await supabase.from('commerce_invoices')
    .select('total, subtotal, status, due_date')
    .eq('tenant_id', tenant)
    .not('status', 'in', '("paid","cancelled","draft")');
  if (error) return empty;
  const out: ArAging = { buckets: { courant: 0, '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }, total: 0, overdue: 0, count: 0 };
  for (const iv of ((data as any[]) || [])) {
    const amt = Number(iv.total) || Number(iv.subtotal) || 0;
    if (amt <= 0) continue;
    const b = bucketFor(iv.due_date ? String(iv.due_date).slice(0, 10) : null, today);
    out.buckets[b] += amt; out.total += amt; out.count++;
    if (b !== 'courant') out.overdue += amt;
  }
  for (const k of BUCKETS) out.buckets[k] = Math.round(out.buckets[k] * 100) / 100;
  out.total = Math.round(out.total * 100) / 100; out.overdue = Math.round(out.overdue * 100) / 100;
  return out;
}
