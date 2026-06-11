// Cycle de vie d'une feuille de temps — source unique partagée (liste employé, détail, admin paie).
// Flux : draft (En cours) → submitted (Soumise) → approved (Validée, superviseur)
//        → verified (Vérifiée, paie) → paid (Payée, paie traitée). rejected = Refusée (renvoyée à l'employé).
// 'exported' est un statut hérité, traité comme « Payée » pour l'affichage.

export type TsStatus = 'draft' | 'submitted' | 'approved' | 'verified' | 'paid' | 'rejected' | 'exported';

export const TS_STATUS: Record<string, { label: string; en: string; cls: string; order: number }> = {
  draft:     { label: 'En cours',  en: 'In progress', cls: 'bg-slate-100 text-slate-600',     order: 0 },
  submitted: { label: 'Soumise',   en: 'Submitted',   cls: 'bg-amber-100 text-amber-700',     order: 1 },
  approved:  { label: 'Validée',   en: 'Approved',    cls: 'bg-emerald-100 text-emerald-700', order: 2 },
  verified:  { label: 'Vérifiée',  en: 'Verified',    cls: 'bg-teal-100 text-teal-700',       order: 3 },
  paid:      { label: 'Payée',     en: 'Paid',        cls: 'bg-blue-100 text-blue-700',       order: 4 },
  exported:  { label: 'Payée',     en: 'Paid',        cls: 'bg-blue-100 text-blue-700',       order: 4 },
  rejected:  { label: 'Refusée',   en: 'Rejected',    cls: 'bg-red-100 text-red-700',         order: -1 },
};

export const tsLabel = (s: string, en = false) => { const x = TS_STATUS[s]; return x ? (en ? x.en : x.label) : s; };
export const tsCls   = (s: string) => TS_STATUS[s]?.cls || TS_STATUS.draft.cls;

// Étapes pilotées par la PAIE (admin) : validée → vérifiée → payée.
export const isPayrollProcessable = (s: string) => s === 'approved' || s === 'verified';
// Une feuille n'est plus modifiable par l'employé dès qu'elle est validée/vérifiée/payée.
export const isLocked = (s: string) => s === 'approved' || s === 'verified' || s === 'paid' || s === 'exported';
