// Métriques SaaS (#43 BLOC B) — MRR/ARR, churn, NRR, runway — à partir des abonnements récurrents.
// Formules standard SaaS. Le churn/NRR utilisent `updated_at` comme proxy de la date d'annulation
// (la table n'a pas de colonne canceled_at dédiée). Fonctions PURES (testables).
import type { RecurringSub } from '@/lib/recurring';

// Montant mensuel normalisé QUEL QUE SOIT le statut (pour le MRR perdu / churn).
function monthlyOf(s: RecurringSub): number {
  const a = Number(s.amount) || 0;
  return s.interval === 'annual' ? a / 12 : a;
}
// Montant mensuel d'un abonnement ACTIF (0 sinon) — pour le MRR courant.
function activeMonthly(s: RecurringSub): number {
  return s.status === 'active' ? monthlyOf(s) : 0;
}
const day = (v: any) => String(v || '').slice(0, 10);

export type SaasMetrics = {
  mrr: number; arr: number; activeCount: number;
  mrrBoM: number;            // MRR au début du mois
  newMrr: number;            // MRR acquis ce mois
  churnedMrr: number;        // MRR perdu ce mois
  churnPct: number | null;   // churn = perdu / MRR début de mois
  nrrPct: number | null;     // net revenue retention (sans expansion = (BoM − churn)/BoM)
  runwayMonths: number | null; // trésorerie / burn (null si rentable)
};

// monthStartIso = 'YYYY-MM-01' du mois courant. cash + monthlyEbitda depuis l'analytique financière.
export function computeSaasMetrics(
  subs: RecurringSub[],
  opts: { monthStartIso: string; cash?: number; monthlyEbitda?: number } = { monthStartIso: '' },
): SaasMetrics {
  const ms = opts.monthStartIso;
  const active = subs.filter(s => s.status === 'active');
  const mrr = Math.round(active.reduce((t, s) => t + activeMonthly(s), 0) * 100) / 100;

  // MRR perdu ce mois = abonnements annulés dont l'annulation (updated_at) tombe dans le mois.
  const churnedMrr = Math.round(subs
    .filter(s => s.status === 'cancelled' && day((s as any).updated_at) >= ms)
    .reduce((t, s) => t + monthlyOf(s), 0) * 100) / 100;

  // MRR au début du mois = actifs avant le mois + ceux annulés CE mois (ils comptaient au début).
  const mrrBoM = Math.round(subs
    .filter(s => day(s.start_date) < ms && (s.status === 'active' || (s.status === 'cancelled' && day((s as any).updated_at) >= ms)))
    .reduce((t, s) => t + monthlyOf(s), 0) * 100) / 100;

  // MRR nouveau ce mois = abonnements actifs démarrés ce mois.
  const newMrr = Math.round(active
    .filter(s => day(s.start_date) >= ms)
    .reduce((t, s) => t + monthlyOf(s), 0) * 100) / 100;

  const churnPct = mrrBoM > 0 ? Math.round((churnedMrr / mrrBoM) * 1000) / 10 : null;
  const nrrPct = mrrBoM > 0 ? Math.round(((mrrBoM - churnedMrr) / mrrBoM) * 1000) / 10 : null;

  const burn = (opts.monthlyEbitda != null && opts.monthlyEbitda < 0) ? -opts.monthlyEbitda : 0;
  const runwayMonths = burn > 0 && opts.cash != null ? Math.round((opts.cash / burn) * 10) / 10 : null;

  return { mrr, arr: Math.round(mrr * 12 * 100) / 100, activeCount: active.length, mrrBoM, newMrr, churnedMrr, churnPct, nrrPct, runwayMonths };
}
