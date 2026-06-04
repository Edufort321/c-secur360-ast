// Commissions d'affiliation co-vendeur (#63) — types + helpers d'acces (via l'API admin gardee).
// Importable client. La table source : vendor_commissions (migration 057), enrichie cote serveur
// du nom du vendeur et du client affilie. Le « contrat actif » provient de tenant_affiliate_contracts (migration 120).
import type { AffiliateContract } from '@/lib/affiliateContract';

export interface AffiliateCommission {
  id: string;
  vendor_id: string;
  tenant_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | string;
  due_date: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  vendor_name: string | null;   // joint cote serveur
  tenant_name: string;          // joint cote serveur (client affilie)
}

export interface VendorClient {
  tenant_id: string;
  tenant_name: string;
  created_at: string | null;
  contract: AffiliateContract | null;   // contrat d'affiliation du client (null si aucun)
}

export interface VendorFiche {
  vendor: { id: string; name: string; email?: string | null; phone?: string | null; commission_rate?: number; is_active?: boolean; notes?: string | null } | null;
  clients: VendorClient[];
  commissions: AffiliateCommission[];
}

/** Liste des commissions (toutes, ou filtrees par statut) triees par echeance — pour le tableau de bord. */
export async function listCommissions(status?: string): Promise<AffiliateCommission[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`/api/admin/affiliate-commissions${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement des commissions');
  return (await res.json()).commissions || [];
}

/** Bundle « fiche vendeur » : vendeur + clients affilies (avec contrat) + commissions. */
export async function getVendorFiche(vendorId: string): Promise<VendorFiche> {
  const res = await fetch(`/api/admin/affiliate-commissions?vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Erreur de chargement de la fiche vendeur');
  const d = await res.json();
  return { vendor: d.vendor ?? null, clients: d.clients ?? [], commissions: d.commissions ?? [] };
}

/** Un contrat est « actif » lorsqu'il est signe. */
export const isContractActive = (c: AffiliateContract | null | undefined): boolean => c?.status === 'signe';

// ─── Indexation a l'inflation (#70) ─────────────────────────────────────────
// La commission d'un contrat indexe est majoree chaque annee a la date anniversaire de sa creation.

/** Nombre d'annees revolues entre une date de debut et une date de reference (defaut : aujourd'hui). */
export function yearsElapsed(startDate?: string | null, asOf?: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate + (String(startDate).length === 10 ? 'T00:00:00' : ''));
  const ref = asOf ? new Date(asOf + (String(asOf).length === 10 ? 'T00:00:00' : '')) : new Date();
  if (isNaN(start.getTime()) || isNaN(ref.getTime())) return 0;
  let y = ref.getFullYear() - start.getFullYear();
  const beforeAnniv = (ref.getMonth() < start.getMonth()) ||
    (ref.getMonth() === start.getMonth() && ref.getDate() < start.getDate());
  if (beforeAnniv) y -= 1;
  return Math.max(0, y);
}

/** Montant indexe : base x (1 + inflation%)^periodes, arrondi au cent. */
export function indexedAmount(base: number, inflationPct: number, periods: number): number {
  const b = Number(base) || 0;
  const r = (Number(inflationPct) || 0) / 100;
  const n = Math.max(0, Math.floor(periods));
  return Math.round(b * Math.pow(1 + r, n) * 100) / 100;
}

/** Projection de la prochaine commission annuelle = montant courant indexe d'une periode. */
export function projectNextCommission(currentAmount: number, inflationPct: number): number {
  return indexedAmount(currentAmount, inflationPct, 1);
}

// ─── Rappels d'echeance (#70) ───────────────────────────────────────────────

export interface CommissionReminder {
  commission: AffiliateCommission;
  daysUntil: number;                 // negatif = en retard
  bucket: 'overdue' | 'soon';
}

// ─── Tableau de bord vendeur — KPIs (#79) ───────────────────────────────────

export interface VendorKpis {
  referredCount: number;        // inscriptions attribuees via le lien de parrainage
  affiliatedCount: number;      // clients assignes au vendeur
  activeContracts: number;      // contrats signes
  retentionPct: number;         // activeContracts / affiliatedCount
  totalCommissions: number;     // toutes commissions generees (peu importe le statut)
  upcoming: number;             // commissions en attente (du + a venir)
  paid: number;                 // commissions payees
  annualRunRate: number;        // somme de la derniere commission par client a contrat actif
  mrr: number;                  // annualRunRate / 12
  nextDueDate: string | null;   // prochaine echeance en attente
}

/** KPIs du tableau de bord vendeur. Pur (testable). */
export function vendorKpis(
  commissions: AffiliateCommission[],
  payments: Array<{ status: string; amount: number }>,
  clients: VendorClient[],
  referredCount: number,
): VendorKpis {
  const affiliatedCount = clients.length;
  const activeContracts = clients.filter(c => isContractActive(c.contract)).length;
  const retentionPct = affiliatedCount ? Math.round((activeContracts / affiliatedCount) * 100) : 0;

  const totalCommissions = commissions.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const pending = commissions.filter(c => c.status === 'pending');
  const upcoming = pending.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const paid = (payments || []).filter(p => p.status === 'paid').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // Derniere commission connue par client (commissions supposees triees par echeance croissante).
  const latest: Record<string, number> = {};
  for (const c of commissions) latest[c.tenant_id] = Number(c.amount) || 0;
  const activeTenantIds = new Set(clients.filter(c => isContractActive(c.contract)).map(c => c.tenant_id));
  const annualRunRate = Object.entries(latest)
    .filter(([tid]) => activeTenantIds.has(tid))
    .reduce((s, [, amt]) => s + amt, 0);
  const mrr = Math.round((annualRunRate / 12) * 100) / 100;

  const nextDueDate = pending
    .map(c => c.due_date)
    .filter((d): d is string => !!d)
    .sort()[0] ?? null;

  return { referredCount, affiliatedCount, activeContracts, retentionPct, totalCommissions, upcoming, paid, annualRunRate, mrr, nextDueDate };
}

/** Commissions en attente echues (retard) ou a echeance proche (<= withinDays), triees par urgence. */
export function commissionReminders(
  commissions: AffiliateCommission[],
  opts: { withinDays?: number; today?: string } = {},
): CommissionReminder[] {
  const withinDays = opts.withinDays ?? 30;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const t0 = Date.parse(today + 'T00:00:00');
  const out: CommissionReminder[] = [];
  for (const c of commissions || []) {
    if (c.status !== 'pending' || !c.due_date) continue;
    const daysUntil = Math.round((Date.parse(c.due_date + 'T00:00:00') - t0) / 86400000);
    if (daysUntil < 0) out.push({ commission: c, daysUntil, bucket: 'overdue' });
    else if (daysUntil <= withinDays) out.push({ commission: c, daysUntil, bucket: 'soon' });
  }
  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}
