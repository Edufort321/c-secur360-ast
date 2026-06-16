// Règles de CONGÉ PARENTAL / familial par PROVINCE (#congés-4-5). Référentiel pour informer l'employé
// et l'employeur : régime (RQAP au QC, AE/EI ailleurs), durées, prestations, Relevé d'emploi (RE/ROE).
// ⚠️ VALEURS 2026 À VALIDER par le comptable / CNESST / Service Canada — fournies à titre indicatif.
// Sources : RQAP (rqap.gouv.qc.ca), AE/EI maternité-parental (canada.ca), RE Code P (cessation temporaire
// quand le salaire tombe ≤ 40 % du salaire habituel ; au QC, partage automatique avec le RQAP).

export type LeaveRules = {
  plan: 'RQAP' | 'EI';
  // Prestations (revenu de remplacement) — semaines
  maternityWeeks: number;          // exclusif à la mère
  paternityWeeks: number;          // exclusif au 2e parent (RQAP) ; 0 sous l'AE (inclus au parental)
  parentalWeeks: number;           // parental partageable (régime de base / standard)
  parentalWeeksExtended?: number;  // option prolongée (AE) — taux réduit
  benefitRatePct: number;          // taux de base (%)
  maxInsurableAnnual: number;      // maximum assurable annuel ($)
  // Congé PROTÉGÉ par l'emploi (normes du travail provinciales) — semaines
  jobProtectedMaternityWeeks: number;
  jobProtectedParentalWeeks: number;
  roeCode: string;                 // code du Relevé d'emploi pour cessation parentale
  note: string;
};

// QC = RQAP (régime de base). Ailleurs = AE fédéral + congé protégé selon la province.
const EI_BASE = { plan: 'EI' as const, maternityWeeks: 15, paternityWeeks: 0, parentalWeeks: 35, parentalWeeksExtended: 61, benefitRatePct: 55, maxInsurableAnnual: 68900, roeCode: 'P' };

export const LEAVE_RULES_BY_PROVINCE: Record<string, LeaveRules> = {
  QC: { plan: 'RQAP', maternityWeeks: 18, paternityWeeks: 5, parentalWeeks: 32, benefitRatePct: 70, maxInsurableAnnual: 94000, jobProtectedMaternityWeeks: 18, jobProtectedParentalWeeks: 65, roeCode: 'P', note: 'RQAP régime de base (mat. 18 sem., pat. 5 sem., parental 32 sem. partageables). Au QC, le RE est partagé automatiquement avec le RQAP. À valider.' },
  ON: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 61, note: 'AE fédéral + congé protégé Ontario (mat. 17 sem., parental jusqu’à 61-63 sem.). À valider.' },
  BC: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 62, note: 'AE fédéral + congé protégé C.-B. (mat. 17 sem., parental jusqu’à 62 sem.). À valider.' },
  AB: { ...EI_BASE, jobProtectedMaternityWeeks: 16, jobProtectedParentalWeeks: 62, note: 'AE fédéral + congé protégé Alberta (mat. 16 sem., parental jusqu’à 62 sem.). À valider.' },
  SK: { ...EI_BASE, jobProtectedMaternityWeeks: 19, jobProtectedParentalWeeks: 59, note: 'AE fédéral + congé protégé Saskatchewan (mat. 19 sem.). À valider.' },
  MB: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 63, note: 'AE fédéral + congé protégé Manitoba. À valider.' },
  NB: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 62, note: 'AE fédéral + congé protégé Nouveau-Brunswick. À valider.' },
  NS: { ...EI_BASE, jobProtectedMaternityWeeks: 16, jobProtectedParentalWeeks: 61, note: 'AE fédéral + congé protégé Nouvelle-Écosse. À valider.' },
  PE: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 62, note: 'AE fédéral + congé protégé Î.-P.-É. À valider.' },
  NL: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 61, note: 'AE fédéral + congé protégé Terre-Neuve. À valider.' },
  NT: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 61, note: 'AE fédéral + congé protégé T.N.-O. À valider.' },
  YT: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 63, note: 'AE fédéral + congé protégé Yukon. À valider.' },
  NU: { ...EI_BASE, jobProtectedMaternityWeeks: 17, jobProtectedParentalWeeks: 61, note: 'AE fédéral + congé protégé Nunavut. À valider.' },
};

export function getLeaveRules(province?: string | null): LeaveRules {
  return LEAVE_RULES_BY_PROVINCE[(province || 'QC').toUpperCase()] || LEAVE_RULES_BY_PROVINCE.QC;
}

// Un type de congé concerne-t-il le PARENTAL/maternité (déclenche le cadre RE + cessation temporaire) ?
export function isParentalType(value?: string): boolean {
  return /parent|matern|patern|adopt/i.test(String(value || ''));
}
