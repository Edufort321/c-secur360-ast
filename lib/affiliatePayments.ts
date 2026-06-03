// Paiements de commission d'affiliation co-vendeur (#69) — types, helpers purs et acces API gardee.
// Source : affiliate_commission_payments (migration 125) + vendor_commissions (057).
// Lien comptable : les paiements regles sont exposables comme depenses (compte 5050), en lecture seule.
import type { AffiliateCommission } from '@/lib/affiliateCommissions';

export interface AffiliateCommissionPayment {
  id: string;
  commission_id: string | null;
  vendor_id: string | null;
  tenant_id: string | null;
  due_date: string | null;
  amount: number;
  method: string | null;
  reference: string | null;
  paid_at: string | null;
  status: 'due' | 'paid' | 'cancelled' | string;
  notes: string | null;
  created_at: string;
  vendor_name?: string | null;   // joint cote serveur
  tenant_name?: string | null;   // joint cote serveur
}

export interface PaymentTotals {
  due: number;        // commissions echues, non payees
  upcoming: number;   // commissions a venir (echeance future ou indefinie)
  paid: number;       // paiements regles
}

export interface CommissionExpense {
  date: string;          // date de paiement (paye_le)
  description: string;
  reference: string;
  account_code: string;  // compte de charge
  account_name: string;
  amount: number;
}

/** Compte de charge comptable pour les commissions versees (gl_accounts, migration 085). */
export const COMMISSION_EXPENSE_ACCOUNT = { code: '5050', name: 'Commissions sur ventes' } as const;

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Totaux du / a venir / paye, a partir des commissions et des paiements. Pur (testable). */
export function summarizePayments(
  commissions: AffiliateCommission[],
  payments: AffiliateCommissionPayment[],
  today: string = todayISO(),
): PaymentTotals {
  const pending = (commissions || []).filter(c => c.status === 'pending');
  const due = pending
    .filter(c => c.due_date && c.due_date <= today)
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const upcoming = pending
    .filter(c => !c.due_date || c.due_date > today)
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const paid = (payments || [])
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return { due, upcoming, paid };
}

/** Mappe un paiement regle vers une depense comptable (lecture seule, additif). */
export function paymentToExpense(p: AffiliateCommissionPayment): CommissionExpense {
  const who = [p.vendor_name, p.tenant_name].filter(Boolean).join(' / ') || p.vendor_id || '';
  return {
    date: (p.paid_at || p.created_at || '').slice(0, 10),
    description: `Commission affiliation — ${who}`,
    reference: p.reference || '',
    account_code: COMMISSION_EXPENSE_ACCOUNT.code,
    account_name: COMMISSION_EXPENSE_ACCOUNT.name,
    amount: Number(p.amount) || 0,
  };
}

/** Depenses (paiements regles uniquement) pour la comptabilite. */
export function paymentsToExpenses(payments: AffiliateCommissionPayment[]): CommissionExpense[] {
  return (payments || []).filter(p => p.status === 'paid').map(paymentToExpense);
}

function qs(filters?: { vendorId?: string; tenantId?: string; view?: string }): string {
  const p = new URLSearchParams();
  if (filters?.vendorId) p.set('vendorId', filters.vendorId);
  if (filters?.tenantId) p.set('tenantId', filters.tenantId);
  if (filters?.view) p.set('view', filters.view);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Marque une commission comme payee : cree un paiement et passe l'echeance a « paye ». */
export async function markCommissionPaid(
  commissionId: string,
  opts: { method?: string; reference?: string; notes?: string } = {},
): Promise<AffiliateCommissionPayment> {
  const res = await fetch('/api/admin/affiliate-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'pay', commission_id: commissionId, ...opts }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur lors du paiement');
  return (await res.json()).payment;
}

/** Annule un paiement et remet la commission « en attente ». */
export async function cancelPayment(paymentId: string): Promise<void> {
  const res = await fetch('/api/admin/affiliate-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cancel', payment_id: paymentId }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Erreur lors de l'annulation");
}

/** Historique des paiements (optionnellement par vendeur/tenant). */
export async function listPayments(filters?: { vendorId?: string; tenantId?: string }): Promise<AffiliateCommissionPayment[]> {
  const res = await fetch(`/api/admin/affiliate-payments${qs(filters)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement des paiements');
  return (await res.json()).payments || [];
}

/** Paiements exposes en depenses comptables (lecture seule). */
export async function listCommissionExpenses(filters?: { vendorId?: string; tenantId?: string }): Promise<CommissionExpense[]> {
  const res = await fetch(`/api/admin/affiliate-payments${qs({ ...filters, view: 'expenses' })}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement des depenses');
  return (await res.json()).expenses || [];
}
