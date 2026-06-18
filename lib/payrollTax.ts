// Moteur de paie réelle (#43) — calcul des RETENUES À LA SOURCE et des cotisations de l'employeur
// pour un employé du QUÉBEC, selon la « méthode des formules » :
//   • Fédéral  : Guide T4127 de l'ARC (impôt fédéral + AE), avec abattement du Québec (16,5 %).
//   • Québec   : Guide TP-1015.F de Revenu Québec (impôt du Québec + RRQ + RQAP).
//
// PRINCIPE (méthode annualisée, « Option 1 ») : on annualise la paie de la période (× nombre de
// périodes/an), on calcule l'impôt annuel via les paliers et les crédits, puis on divise par le
// nombre de périodes pour obtenir la retenue de la période. RRQ/RQAP/AE = taux × gains plafonnés
// (exemption RRQ proratisée). Tous les PARAMÈTRES ANNUELS sont éditables (table payroll_params) :
// les taux/paliers changent chaque année — voir PAYROLL_PARAMS (2025, 2026) comme valeurs par défaut.
//
// ⚠️ Référence faisant autorité = WebRAS (Revenu Québec) + PDOC (ARC). Ce moteur reproduit la méthode
// documentée et concorde au cent près pour les cas standards (salaire régulier). Les cas particuliers
// (commissions, primes étalées, REER retenu à la source, crédits additionnels) utilisent les champs
// de réglage (claimFederal/claimQuebec, extraTax, deductionsAnnual) ou sont à valider par le fiscaliste.

// ───────────────────────────── Types de paramètres ─────────────────────────────

export type TaxBracket = { upTo: number | null; rate: number }; // upTo null = palier supérieur

export type PayrollYearParams = {
  year: number;
  // RRQ (Régime de rentes du Québec)
  qpp: {
    baseRate: number;        // taux de BASE employé (donne droit à un crédit d'impôt)
    firstAddlRate: number;   // 1re cotisation supplémentaire (DÉDUCTIBLE du revenu)
    qpp2Rate: number;        // 2e cotisation supplémentaire (RRQ2, entre MGA et MSGA, déductible)
    ympe: number;            // maximum des gains admissibles (MGA)
    yampe: number;           // maximum supplémentaire des gains admissibles (MSGA, 2e plafond)
    exemption: number;       // exemption générale annuelle (3 500 $)
  };
  // RQAP (Régime québécois d'assurance parentale)
  qpip: { empRate: number; erRate: number; maxInsurable: number };
  // Assurance-emploi (taux réduit du Québec)
  ei: { empRate: number; maxInsurable: number; erMultiplier: number };
  // Impôt fédéral
  fed: {
    brackets: TaxBracket[];
    bpaMax: number; bpaMin: number;        // montant personnel de base (max / min après réduction)
    bpaPhaseStart: number; bpaPhaseEnd: number; // plage de réduction du MPB selon le revenu
    creditRate: number;                    // taux des crédits non remboursables (1er palier)
    canadaEmploymentAmount: number;        // montant canadien pour emploi
    quebecAbatement: number;               // abattement du Québec sur l'impôt fédéral (0,165)
  };
  // Impôt du Québec
  qc: {
    brackets: TaxBracket[];
    bpa: number;             // montant personnel de base du Québec
    creditRate: number;      // taux des crédits (1er palier)
    workerDeductionRate: number; // déduction pour travailleurs (% du revenu de travail)
    workerDeductionMax: number;  // plafond de la déduction pour travailleurs
  };
  // Cotisations de l'EMPLOYEUR (défauts ; CNESST/FSS dépendent du tenant — éditable)
  employer: {
    fssRate: number;         // Fonds des services de santé (% — varie selon masse salariale)
    cnesstRate: number;      // CNESST par 100 $ de gains assurables → on stocke en taux décimal
    wsdrfRate: number;       // Loi du 1 % (formation) si masse salariale > seuil
    wsdrfThreshold: number;
  };
};

// ───────────────────────────── Paramètres par année ─────────────────────────────
// Sources : Revenu Québec (changements 2026), ARC T4127 122e éd. (2026), TaxTips. Éditables en base.

const FED_BRACKETS_2026: TaxBracket[] = [
  { upTo: 58523, rate: 0.14 },
  { upTo: 117045, rate: 0.205 },
  { upTo: 181440, rate: 0.26 },
  { upTo: 258482, rate: 0.2929 },
  { upTo: null, rate: 0.33 },
];
const QC_BRACKETS_2026: TaxBracket[] = [
  { upTo: 54345, rate: 0.14 },
  { upTo: 108680, rate: 0.19 },
  { upTo: 132245, rate: 0.24 },
  { upTo: null, rate: 0.2575 },
];

const FED_BRACKETS_2025: TaxBracket[] = [
  { upTo: 57375, rate: 0.15 },
  { upTo: 114750, rate: 0.205 },
  { upTo: 177882, rate: 0.26 },
  { upTo: 253414, rate: 0.29 },
  { upTo: null, rate: 0.33 },
];
const QC_BRACKETS_2025: TaxBracket[] = [
  { upTo: 53255, rate: 0.14 },
  { upTo: 106495, rate: 0.19 },
  { upTo: 129590, rate: 0.24 },
  { upTo: null, rate: 0.2575 },
];

export const PAYROLL_PARAMS: Record<number, PayrollYearParams> = {
  2026: {
    year: 2026,
    qpp: { baseRate: 0.053, firstAddlRate: 0.01, qpp2Rate: 0.04, ympe: 74600, yampe: 85000, exemption: 3500 },
    qpip: { empRate: 0.0043, erRate: 0.00602, maxInsurable: 103000 },
    ei: { empRate: 0.013, maxInsurable: 68900, erMultiplier: 1.4 },
    fed: { brackets: FED_BRACKETS_2026, bpaMax: 16452, bpaMin: 14829, bpaPhaseStart: 181440, bpaPhaseEnd: 258482, creditRate: 0.14, canadaEmploymentAmount: 1503, quebecAbatement: 0.165 },
    qc: { brackets: QC_BRACKETS_2026, bpa: 18952, creditRate: 0.14, workerDeductionRate: 0.06, workerDeductionMax: 1235 },
    employer: { fssRate: 0.0165, cnesstRate: 0.02, wsdrfRate: 0.01, wsdrfThreshold: 2000000 },
  },
  2025: {
    year: 2025,
    qpp: { baseRate: 0.054, firstAddlRate: 0.01, qpp2Rate: 0.04, ympe: 71300, yampe: 81200, exemption: 3500 },
    qpip: { empRate: 0.00494, erRate: 0.00692, maxInsurable: 98000 },
    ei: { empRate: 0.0131, maxInsurable: 65700, erMultiplier: 1.4 },
    fed: { brackets: FED_BRACKETS_2025, bpaMax: 16129, bpaMin: 14538, bpaPhaseStart: 177882, bpaPhaseEnd: 253414, creditRate: 0.15, canadaEmploymentAmount: 1471, quebecAbatement: 0.165 },
    qc: { brackets: QC_BRACKETS_2025, bpa: 18571, creditRate: 0.14, workerDeductionRate: 0.06, workerDeductionMax: 1235 },
    employer: { fssRate: 0.0165, cnesstRate: 0.02, wsdrfRate: 0.01, wsdrfThreshold: 2000000 },
  },
};

export function paramsForYear(year: number): PayrollYearParams {
  return PAYROLL_PARAMS[year] || PAYROLL_PARAMS[2026];
}

// Périodes de paie par an
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
export const PERIODS_PER_YEAR: Record<PayFrequency, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };

// ───────────────────────────── Entrée / sortie ─────────────────────────────

export type PayrollInput = {
  periodGross: number;       // rémunération BRUTE imposable de la période (salaire + primes imposables)
  frequency: PayFrequency;
  year?: number;             // défaut = année des params la plus récente
  params?: PayrollYearParams;// paramètres explicites (ex. surchargés par le tenant) — prioritaires sur year
  province?: string;         // défaut 'QC' (seul le Québec est pleinement supporté pour l'instant)
  // Réglages employé (facultatifs) :
  claimFederal?: number;     // montant de demande fédéral (TD1) — défaut = MPB de base
  claimQuebec?: number;      // montant de demande Québec (TP-1015.3) — défaut = MPB Québec
  deductionsAnnual?: number; // autres déductions annuelles (REER retenu, pension, syndicat…)
  extraTaxPerPeriod?: number;// retenue d'impôt additionnelle demandée par l'employé (par période)
  exemptCpp?: boolean;       // exempté RRQ (≥70 ans / <18, etc.)
  exemptEi?: boolean;        // exempté AE (ex. actionnaire à 40 %+ lien de dépendance)
};

export type PayrollResult = {
  year: number;
  frequency: PayFrequency;
  periodsPerYear: number;
  gross: number;
  // Retenues de l'EMPLOYÉ (par période)
  qpp: number;               // RRQ totale (base + supplémentaires + RRQ2)
  ei: number;                // assurance-emploi
  qpip: number;              // RQAP
  federalTax: number;        // impôt fédéral (après abattement du Québec)
  quebecTax: number;         // impôt du Québec
  extraTax: number;
  totalDeductions: number;
  netPay: number;
  // Cotisations de l'EMPLOYEUR (par période) — coût employeur au-delà du salaire
  employer: {
    qpp: number; ei: number; qpip: number; fss: number; cnesst: number; wsdrf: number; total: number;
  };
  totalEmployerCost: number; // brut + cotisations employeur
  // Détail annualisé (pour vérification / bulletins)
  annual: { gross: number; taxableFed: number; taxableQc: number; qppBaseCredit: number; qppDeduction: number; ei: number; qpip: number };
};

const r2 = (v: number) => Math.round(v * 100) / 100;
const clampPos = (v: number) => (v > 0 ? v : 0);

/** Impôt progressif annuel selon une grille de paliers. */
function bracketTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0;
  let tax = 0, lower = 0;
  for (const b of brackets) {
    const upper = b.upTo == null ? Infinity : b.upTo;
    if (income > lower) tax += (Math.min(income, upper) - lower) * b.rate;
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

/** Montant personnel de base fédéral réduit selon le revenu net (entre bpaPhaseStart et bpaPhaseEnd). */
function federalBpa(p: PayrollYearParams, netIncome: number): number {
  const { bpaMax, bpaMin, bpaPhaseStart, bpaPhaseEnd } = p.fed;
  if (netIncome <= bpaPhaseStart) return bpaMax;
  if (netIncome >= bpaPhaseEnd) return bpaMin;
  const reduction = (bpaMax - bpaMin) * ((netIncome - bpaPhaseStart) / (bpaPhaseEnd - bpaPhaseStart));
  return bpaMax - reduction;
}

/**
 * Calcule les retenues à la source et les cotisations de l'employeur pour UNE période de paie.
 * Méthode des formules annualisée (T4127 / TP-1015.F). Québec = abattement 16,5 % sur l'impôt fédéral.
 */
export function computePayroll(input: PayrollInput): PayrollResult {
  const p = input.params || paramsForYear(input.year || Math.max(...Object.keys(PAYROLL_PARAMS).map(Number)));
  const P = PERIODS_PER_YEAR[input.frequency];
  const gross = clampPos(Number(input.periodGross) || 0);
  const A = gross * P; // rémunération annualisée

  // ── RRQ (annualisé puis réparti) ─────────────────────────────
  let qppBaseAnnual = 0, qppFirstAddlAnnual = 0, qpp2Annual = 0;
  if (!input.exemptCpp) {
    const contributory = clampPos(Math.min(A, p.qpp.ympe) - p.qpp.exemption);
    qppBaseAnnual = contributory * p.qpp.baseRate;
    qppFirstAddlAnnual = contributory * p.qpp.firstAddlRate;
    qpp2Annual = clampPos(Math.min(A, p.qpp.yampe) - p.qpp.ympe) * p.qpp.qpp2Rate;
  }
  const qppAnnual = qppBaseAnnual + qppFirstAddlAnnual + qpp2Annual;
  const qppPeriod = qppAnnual / P;
  // La cotisation de base donne un CRÉDIT d'impôt ; les cotisations supplémentaires sont DÉDUCTIBLES.
  const qppCreditBase = qppBaseAnnual;
  const qppDeduction = qppFirstAddlAnnual + qpp2Annual;

  // ── RQAP ─────────────────────────────
  const qpipAnnual = Math.min(A, p.qpip.maxInsurable) * p.qpip.empRate;
  const qpipPeriod = qpipAnnual / P;

  // ── Assurance-emploi (taux réduit du Québec) ─────────────────────────────
  const eiAnnual = input.exemptEi ? 0 : Math.min(A, p.ei.maxInsurable) * p.ei.empRate;
  const eiPeriod = eiAnnual / P;

  // ── Revenu imposable annualisé (les cotisations supplémentaires RRQ + autres déductions le réduisent) ──
  const otherDed = clampPos(Number(input.deductionsAnnual) || 0);
  // Déduction pour travailleurs (Québec) : % du revenu de travail, plafonnée.
  const workerDed = Math.min(A * p.qc.workerDeductionRate, p.qc.workerDeductionMax);
  const taxableFed = clampPos(A - qppDeduction - otherDed);
  const taxableQc = clampPos(A - qppDeduction - otherDed - workerDed);

  // ── Impôt FÉDÉRAL (avec abattement du Québec) ─────────────────────────────
  const fedGross = bracketTax(taxableFed, p.fed.brackets);
  const bpaF = input.claimFederal != null ? input.claimFederal : federalBpa(p, taxableFed);
  const fedCredits = p.fed.creditRate * (bpaF + qppCreditBase + eiAnnual + qpipAnnual + p.fed.canadaEmploymentAmount);
  const fedAfterCredits = clampPos(fedGross - fedCredits);
  const fedNetAnnual = fedAfterCredits * (1 - p.fed.quebecAbatement); // abattement du Québec
  const federalTax = fedNetAnnual / P;

  // ── Impôt du QUÉBEC ─────────────────────────────
  const qcGross = bracketTax(taxableQc, p.qc.brackets);
  const bpaQ = input.claimQuebec != null ? input.claimQuebec : p.qc.bpa;
  // Crédits Québec : MPB + cotisations (base RRQ + RQAP + AE) au 1er taux.
  const qcCredits = p.qc.creditRate * (bpaQ + qppCreditBase + eiAnnual + qpipAnnual);
  const qcNetAnnual = clampPos(qcGross - qcCredits);
  const quebecTax = qcNetAnnual / P;

  const extraTax = clampPos(Number(input.extraTaxPerPeriod) || 0);
  const totalDeductions = r2(qppPeriod + eiPeriod + qpipPeriod + federalTax + quebecTax + extraTax);
  const netPay = r2(gross - totalDeductions);

  // ── Cotisations de l'EMPLOYEUR (par période) ─────────────────────────────
  const erQpp = qppPeriod;                       // l'employeur égale la cotisation RRQ de l'employé
  const erEi = eiPeriod * p.ei.erMultiplier;     // AE employeur = 1,4 × part employé
  const erQpip = (Math.min(A, p.qpip.maxInsurable) * p.qpip.erRate) / P;
  const erFss = gross * p.employer.fssRate;      // Fonds des services de santé
  const erCnesst = gross * p.employer.cnesstRate;
  const erWsdrf = A > p.employer.wsdrfThreshold ? gross * p.employer.wsdrfRate : 0;
  const erTotal = r2(erQpp + erEi + erQpip + erFss + erCnesst + erWsdrf);

  return {
    year: p.year, frequency: input.frequency, periodsPerYear: P, gross: r2(gross),
    qpp: r2(qppPeriod), ei: r2(eiPeriod), qpip: r2(qpipPeriod),
    federalTax: r2(federalTax), quebecTax: r2(quebecTax), extraTax: r2(extraTax),
    totalDeductions, netPay,
    employer: { qpp: r2(erQpp), ei: r2(erEi), qpip: r2(erQpip), fss: r2(erFss), cnesst: r2(erCnesst), wsdrf: r2(erWsdrf), total: erTotal },
    totalEmployerCost: r2(gross + erTotal),
    annual: { gross: r2(A), taxableFed: r2(taxableFed), taxableQc: r2(taxableQc), qppBaseCredit: r2(qppCreditBase), qppDeduction: r2(qppDeduction), ei: r2(eiAnnual), qpip: r2(qpipAnnual) },
  };
}
