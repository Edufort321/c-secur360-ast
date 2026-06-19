// DPA — Déduction pour amortissement (Capital Cost Allowance, ARC) — ESTIMATION fiscale, calculs PURS.
// Méthode : DÉCLINANT par catégorie + RÈGLE DU DEMI-ANNÉE sur les ajouts de l'année d'acquisition.
// ⚠️ Estimation PRUDENTE : l'Incitatif à l'investissement accéléré (BIIA) et la passation immédiate NE sont
// PAS appliqués (ils AUGMENTENT la déduction de 1re année). Pas de pool de catégorie réel (par bien, pas de
// récupération/perte finale). La DPA est une donnée de la déclaration (T2 annexe 8), PAS une écriture au GL.
// À VALIDER PAR UNE PERSONNE QUALIFIÉE. Réf. ARC « Déduction pour amortissement », catégories de biens.
// Taux confirmés 2025 : cat. 8 = 20 %, 10 = 30 %, 50 = 55 % (déclinant). Demi-année sauf BIIA/véhicules ZE.

export type CcaClass = { code: string; rate: number; fr: string; en: string };

// Catégories courantes (déclinant). 12 = 100 % ; 13/14.1 traitées hors estimation (linéaire/spécifique).
export const CCA_CLASSES: CcaClass[] = [
  { code: '8', rate: 0.20, fr: 'Cat. 8 — Mobilier, équipement, outils > 500 $', en: 'Class 8 — Furniture, equipment, tools > $500' },
  { code: '10', rate: 0.30, fr: 'Cat. 10 — Véhicules, matériel (général)', en: 'Class 10 — Vehicles, general equipment' },
  { code: '10.1', rate: 0.30, fr: 'Cat. 10.1 — Voiture de tourisme (plafond)', en: 'Class 10.1 — Passenger vehicle (capped)' },
  { code: '12', rate: 1.00, fr: 'Cat. 12 — Outils < 500 $, logiciels applicatifs (100 %)', en: 'Class 12 — Tools < $500, application software (100%)' },
  { code: '50', rate: 0.55, fr: 'Cat. 50 — Matériel informatique + logiciels système', en: 'Class 50 — Computer hardware + systems software' },
  { code: '54', rate: 0.30, fr: 'Cat. 54 — Véhicule zéro émission', en: 'Class 54 — Zero-emission vehicle' },
  { code: '1', rate: 0.04, fr: 'Cat. 1 — Bâtiment', en: 'Class 1 — Building' },
  { code: '43', rate: 0.30, fr: 'Cat. 43 — Matériel de fabrication', en: 'Class 43 — Manufacturing equipment' },
  { code: '14.1', rate: 0.05, fr: 'Cat. 14.1 — Achalandage / incorporels', en: 'Class 14.1 — Goodwill / intangibles' },
];

export const ccaRate = (code?: string | null): number => CCA_CLASSES.find(c => c.code === code)?.rate ?? 0;

/** Catégorie DPA suggérée selon la catégorie d'immobilisation (modifiable par l'utilisateur). */
export function suggestCcaClass(category?: string | null): string {
  switch (String(category || '').toLowerCase()) {
    case 'informatique': return '50';
    case 'véhicule': case 'vehicule': return '10';
    case 'mobilier de bureau': case 'mobilier': return '8';
    case 'bâtiment': case 'batiment': return '1';
    case 'outillage': return '8';
    case 'équipement': case 'equipement': return '8';
    default: return '8';
  }
}

export type CcaAsset = { cost?: number; acquisition_date?: string; disposal_date?: string | null; status?: string; cca_class?: string | null; category?: string | null };
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** DPA estimée d'un bien pour l'exercice `year` (déclinant + demi-année l'année d'acquisition). */
export function ccaForAssetYear(a: CcaAsset, year: number): number {
  const rate = ccaRate(a.cca_class || suggestCcaClass(a.category));
  const cost = Number(a.cost) || 0;
  if (rate <= 0 || cost <= 0 || !a.acquisition_date) return 0;
  const acqYear = new Date(a.acquisition_date + 'T00:00:00').getFullYear();
  if (isNaN(acqYear) || year < acqYear) return 0;
  if (a.disposal_date) { const dy = new Date(a.disposal_date + 'T00:00:00').getFullYear(); if (!isNaN(dy) && year > dy) return 0; }
  let ucc = cost;
  for (let y = acqYear; y <= year; y++) {
    const base = y === acqYear ? ucc * 0.5 : ucc; // demi-année sur l'ajout de l'année d'acquisition
    const cca = r2(base * rate);
    if (y === year) return Math.min(cca, r2(ucc)); // jamais plus que la FNACC restante
    ucc = r2(ucc - cca);
    if (ucc <= 0) return 0;
  }
  return 0;
}

/** Total de DPA estimée pour un parc, pour l'exercice `year` (biens non cédés avant l'exercice). */
export function ccaScheduleTotal(assets: CcaAsset[], year: number): number {
  return r2(assets.filter(a => a.status !== 'disposed').reduce((s, a) => s + ccaForAssetYear(a, year), 0));
}
