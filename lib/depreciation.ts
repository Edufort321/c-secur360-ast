// Amortissement linéaire (ASPE) — calculs PURS, testables, sans dépendance.
// La COMPTABILISATION (DR 5600 / CR 1590) se fait côté serveur (lib/financeP1Server) ; ici, juste les montants.
// ⚠️ Méthode comptable (livre) linéaire. La DPA fiscale (déclinant + règle du demi-année) est distincte et
// reste à valider par une personne qualifiée — voir docs/AUDIT_FINANCIER.md (P2-7).

export type DepAsset = {
  cost?: number; salvage_value?: number; useful_life_years?: number | null;
  acquisition_date?: string; disposal_date?: string | null; status?: 'active' | 'disposed';
};

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Nombre de mois en service d'un bien DANS une année donnée (proration 1re/dernière année). 0..12. */
export function monthsInServiceInYear(acquisitionDate: string | undefined, disposalDate: string | null | undefined, year: number): number {
  if (!acquisitionDate) return 12; // inconnu → année pleine
  const acq = new Date(acquisitionDate + 'T00:00:00');
  if (isNaN(acq.getTime()) || acq.getFullYear() > year) return 0;
  const yStart = new Date(year, 0, 1), yEnd = new Date(year, 11, 31);
  const start = acq > yStart ? acq : yStart;
  let end = yEnd;
  if (disposalDate) { const d = new Date(disposalDate + 'T00:00:00'); if (!isNaN(d.getTime())) { if (d < yStart) return 0; if (d < yEnd) end = d; } }
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(0, Math.min(12, months));
}

/** Base amortissable = coût − valeur résiduelle (jamais négative). */
export function depreciableBase(a: DepAsset): number {
  return Math.max(0, (Number(a.cost) || 0) - (Number(a.salvage_value) || 0));
}

/** Dotation d'amortissement pour UNE année, en tenant compte du cumul déjà comptabilisé (plafonné à la base).
 *  Linéaire : base / durée, prorata des mois en service. 0 si durée non définie ou bien déjà amorti. */
export function depreciationForYear(a: DepAsset, year: number, priorAccumulated = 0): number {
  const life = Number(a.useful_life_years) || 0;
  if (life <= 0) return 0;
  const base = depreciableBase(a);
  const remaining = base - (Number(priorAccumulated) || 0);
  if (remaining <= 0.005) return 0;
  const months = monthsInServiceInYear(a.acquisition_date, a.disposal_date, year);
  if (months <= 0) return 0;
  const annual = base / life;
  return r2(Math.min(annual * (months / 12), remaining));
}

/** Valeur comptable nette = coût − amortissement cumulé (plancher = valeur résiduelle tant que non cédé). */
export function netBookValue(a: DepAsset, accumulated = 0): number {
  const cost = Number(a.cost) || 0;
  const nbv = cost - (Number(accumulated) || 0);
  return r2(Math.max(nbv, a.status === 'disposed' ? 0 : Number(a.salvage_value) || 0));
}
