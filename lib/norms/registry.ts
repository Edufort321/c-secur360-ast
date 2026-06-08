// Registre des domaines normatifs et législatifs PAR MODULE.
// Sert à cibler la recherche web de l'assistant « Normes à jour » sur les bons référentiels
// et les sources officielles, pour une réponse précise et juridiquement pertinente (Québec/Canada).
// Mis à jour côté contenu seulement — la recherche web fournit la version EN VIGUEUR.

export type NormScope = {
  /** Libellé lisible du module. */
  label: string;
  /** Ce que couvre le module (cadre). */
  scope: string;
  /** Lois/règlements et normes à vérifier en priorité (références à jour via le web). */
  focus: string[];
  /** Autorités / sources officielles à privilégier. */
  authorities: string[];
};

// Sources officielles communes (Québec/Canada).
const QC_OHS = ['CNESST', 'LégisQuébec', 'Publications du Québec'];
const STANDARDS = ['CSA Group', 'BNQ', 'ISO'];

export const NORMS_REGISTRY: Record<string, NormScope> = {
  ast: {
    label: 'Analyse sécuritaire de tâches (AST)',
    scope: 'Identification des risques, moyens de maîtrise et droits du travailleur avant une tâche.',
    focus: ['Loi sur la santé et la sécurité du travail (LSST, RLRQ c. S-2.1)', 'Règlement sur la santé et la sécurité du travail (RSST, c. S-2.1, r. 13)', 'Code de sécurité pour les travaux de construction (CSTC, c. S-2.1, r. 4)', 'hiérarchie des moyens de maîtrise des risques'],
    authorities: QC_OHS,
  },
  permits: {
    label: 'Permis de travail',
    scope: 'Cadenassage, espace clos, travail à chaud, hauteur, excavation.',
    focus: ['RSST cadenassage et autres méthodes de maîtrise des énergies (art. 188.1 et suiv.)', 'CSA Z460 (maîtrise des énergies dangereuses)', 'RSST espaces clos (art. 297 et suiv.)', 'CSA Z1006 (travail en espace clos)', 'travail à chaud (NFPA 51B)', 'CSTC excavation et travail en hauteur'],
    authorities: [...QC_OHS, 'CSA Group', 'NFPA'],
  },
  dga: {
    label: 'Diagnostic d’huile de transformateur (DGA)',
    scope: 'Analyse des gaz dissous et qualité d’huile des transformateurs de puissance.',
    focus: ['IEEE C57.104 (interprétation DGA)', 'IEC 60599', 'IEEE C57.106 / C57.139 (OLTC)', 'ASTM D3612 / D1816 / D877 / D1533 / D971', 'IEC 60422 / 60567 / 61198', 'CIGRE TB 296/771/443/445'],
    authorities: ['IEEE', 'IEC', 'ASTM International', 'CIGRE', 'CSA Group'],
  },
  inspections: {
    label: 'Inspections et entretien préventif',
    scope: 'Inspection des équipements et lieux de travail.',
    focus: ['RSST (inspection et entretien des équipements)', 'CSTC', 'normes d’inspection applicables à l’équipement visé', 'CSA Group'],
    authorities: [...QC_OHS, ...STANDARDS],
  },
  equipment: {
    label: 'Équipements et produits dangereux',
    scope: 'Gestion des équipements, SIMDUT, manutention.',
    focus: ['SIMDUT 2015 / Règlement sur les produits dangereux (DORS/2015-17)', 'Règlement sur l’information concernant les produits dangereux (RLRQ)', 'RSST (appareils et machines)', 'CSA Group (protection des machines)'],
    authorities: [...QC_OHS, 'Santé Canada', 'CSA Group'],
  },
  inventory: {
    label: 'Inventaire et matières dangereuses',
    scope: 'Entreposage et suivi des matériaux, dont matières dangereuses.',
    focus: ['SIMDUT 2015 (fiches de données de sécurité)', 'Transport des marchandises dangereuses (TMD, DORS/2001-286)', 'RSST entreposage'],
    authorities: [...QC_OHS, 'Transports Canada', 'Santé Canada'],
  },
  accidents: {
    label: 'Accidents et incidents',
    scope: 'Déclaration, registre et suivi des accidents/incidents du travail.',
    focus: ['Loi sur les accidents du travail et les maladies professionnelles (LATMP, RLRQ c. A-3.001)', 'LSST (obligations de déclaration et registre)', 'délais et obligations de déclaration à la CNESST', 'registre des accidents, incidents et premiers secours'],
    authorities: QC_OHS,
  },
  'near-miss': {
    label: 'Passés proches (near-miss)',
    scope: 'Signalement et analyse des situations dangereuses sans blessure.',
    focus: ['LSST (prévention et participation des travailleurs)', 'bonnes pratiques d’analyse des causes', 'registre des incidents'],
    authorities: QC_OHS,
  },
  capa: {
    label: 'Actions correctives et préventives (CAPA)',
    scope: 'Gestion des correctifs suite à non-conformités/incidents.',
    focus: ['LSST (programme de prévention)', 'ISO 45001 (SST)', 'analyse des causes profondes'],
    authorities: [...QC_OHS, 'ISO'],
  },
  timesheets: {
    label: 'Feuilles de temps',
    scope: 'Heures travaillées, heures supplémentaires, primes.',
    focus: ['Loi sur les normes du travail (LNT, RLRQ c. N-1.1)', 'Règlement sur les normes du travail', 'heures supplémentaires et durée du travail'],
    authorities: ['CNESST', 'LégisQuébec'],
  },
  conges: {
    label: 'Congés et absences',
    scope: 'Vacances, congés, absences.',
    focus: ['Loi sur les normes du travail (congés annuels, congés familiaux, absences)', 'Règlement sur les normes du travail'],
    authorities: ['CNESST', 'LégisQuébec'],
  },
  planificateur: {
    label: 'Planification de la main-d’œuvre',
    scope: 'Horaires, affectations, durée du travail.',
    focus: ['Loi sur les normes du travail (durée du travail, repos)', 'LSST (fatigue et organisation du travail)'],
    authorities: ['CNESST', 'LégisQuébec'],
  },
  admin: {
    label: 'Administration / RH',
    scope: 'Dossiers employés, conformité RH et protection des renseignements.',
    focus: ['Loi sur les normes du travail', 'Loi 25 (protection des renseignements personnels, RLRQ P-39.1)', 'Loi sur l’équité salariale', 'LSST (programme de prévention, comité SST)'],
    authorities: ['CNESST', 'Commission d’accès à l’information du Québec', 'LégisQuébec'],
  },
  projects: {
    label: 'Projets',
    scope: 'Gestion de mandats et conformité associée.',
    focus: ['LSST / CSTC selon la nature des travaux', 'obligations du maître d’œuvre'],
    authorities: QC_OHS,
  },
};

export const DEFAULT_SCOPE: NormScope = {
  label: 'Santé et sécurité du travail',
  scope: 'Cadre général SST applicable au Québec.',
  focus: ['Loi sur la santé et la sécurité du travail (LSST)', 'Règlement sur la santé et la sécurité du travail (RSST)', 'obligations générales de l’employeur et droits du travailleur'],
  authorities: QC_OHS,
};

/** Résout le module à partir du segment d’URL (après le tenant). */
export function scopeForModule(moduleKey?: string | null): { key: string; scope: NormScope } {
  const k = String(moduleKey || '').toLowerCase();
  if (k && NORMS_REGISTRY[k]) return { key: k, scope: NORMS_REGISTRY[k] };
  return { key: k || 'general', scope: DEFAULT_SCOPE };
}
