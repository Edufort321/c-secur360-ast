// Génération de factures depuis les abonnements récurrents — SERVEUR (service_role). Utilisé par le
// cron de facturation récurrente ET par le bouton « Facturer maintenant ». Réutilise les totaux de facturation.
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeInvoiceTotals } from '@/lib/invoicing';
import { advanceDate, type RecurringSub } from '@/lib/recurring';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

async function nextInvoiceNumberAdmin(tenant: string, prefix = 'F'): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await supabaseAdmin.from('commerce_invoices').select('invoice_number')
    .eq('tenant_id', tenant).like('invoice_number', `${prefix}-${year}-%`)
    .order('invoice_number', { ascending: false }).limit(1);
  let seq = 1;
  const last = (data as any)?.[0]?.invoice_number as string | undefined;
  if (last) { const m = last.match(/(\d+)\s*$/); if (m) seq = parseInt(m[1], 10) + 1; }
  return `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
}

/** Crée une facture « envoyée » depuis un abonnement et avance l'échéance. Retourne l'id de facture. */
export async function generateInvoiceForSubscription(tenant: string, sub: RecurringSub, todayMs = Date.now()): Promise<string> {
  const { data: cs } = await supabaseAdmin.from('company_settings').select('invoice_prefix, province, default_terms').eq('tenant_id', tenant).maybeSingle();
  const prefix = (cs as any)?.invoice_prefix || 'F';
  const province = sub.province || (cs as any)?.province || 'QC';
  const number = await nextInvoiceNumberAdmin(tenant, prefix);
  const today = new Date(todayMs).toISOString().slice(0, 10);
  const due = new Date(todayMs + 30 * 86400000).toISOString().slice(0, 10);
  const line = { description: `${sub.plan_name} (${sub.interval === 'annual' ? 'annuel' : 'mensuel'})`, quantity: 1, unit_price: Number(sub.amount) || 0, subtotal: r2(Number(sub.amount) || 0), taxable: true };
  const totals = computeInvoiceTotals([line as any], province);

  const { data: inv, error } = await supabaseAdmin.from('commerce_invoices').insert({
    tenant_id: tenant, invoice_number: number, client_snapshot: { name: sub.client_name }, status: 'sent',
    issue_date: today, due_date: due, province, notes: `Abonnement récurrent — ${sub.plan_name}`,
    ...totals, updated_at: new Date().toISOString(),
  }).select('id').single();
  if (error) throw error;
  const invId = (inv as any).id;
  await supabaseAdmin.from('commerce_invoice_items').insert({
    tenant_id: tenant, invoice_id: invId, description: line.description, quantity: 1, unit_price: line.unit_price,
    subtotal: line.subtotal, taxable: true, tax_category: 'standard', sort_order: 0,
  });
  // Avance l'échéance + compteur sur l'abonnement.
  const base = sub.next_billing_date || today;
  await supabaseAdmin.from('recurring_subscriptions').update({
    next_billing_date: advanceDate(base, sub.interval), billing_count: (Number(sub.billing_count) || 0) + 1, updated_at: new Date().toISOString(),
  }).eq('id', sub.id!).eq('tenant_id', tenant);
  return invId;
}
