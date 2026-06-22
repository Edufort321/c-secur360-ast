// Moteur de DÉCLARABILITÉ CNESST — l'équivalent SST du « Condition 4 » du DGA : à partir des données d'un
// accident, détermine AUTOMATIQUEMENT les obligations légales (déclaration sous 24 h, Registre, ADR).
// Référence : LSST (RLRQ c. S-2.1) art. 62 — événements à déclarer sans délai ; LATMP — réclamation du
// travailleur. Pur & testable. ⚠️ INDICATIF — à valider par une personne qualifiée (les seuils et la
// qualification finale appartiennent à l'employeur). Seuil de dégâts matériels revalorisé annuellement.

export type IncidentData = {
  injuryType?: string;
  bodyParts?: string[];
  medicalTreatment?: string;     // none | first_aid | clinic | hospital | emergency (ou texte)
  daysAbsent?: number;
  multipleWorkers?: boolean;
  limbLossOrUse?: boolean;       // perte totale/partielle d'un membre ou de son usage
  majorTrauma?: boolean;         // traumatisme physique majeur
  death?: boolean;
  propertyDamage?: number;       // $ de dégâts matériels
};

export type CnesstReasonCode = 'death' | 'limb' | 'major_trauma' | 'multi_workers' | 'property';
export type CnesstObligations = {
  reportable24h: boolean;
  reasons: CnesstReasonCode[];
  registerRequired: boolean;     // inscription au Registre — TOUJOURS
  adrRequired: boolean;          // Avis de l'employeur et demande de remboursement (si arrêt)
  workerClaimMonths: number;     // délai de réclamation du travailleur (LATMP)
};

// Seuil « dégâts matériels » de l'art. 62 LSST (revalorisé annuellement par la CNESST).
export const PROPERTY_DAMAGE_THRESHOLD: Record<number, number> = { 2025: 206159, 2026: 206159 };
export function propertyThreshold(year = 2025): number { return PROPERTY_DAMAGE_THRESHOLD[year] ?? PROPERTY_DAMAGE_THRESHOLD[2025]; }

/** Évalue les obligations CNESST d'un accident. `year` sert au seuil de dégâts matériels. */
export function assessCnesst(d: IncidentData, year = 2025): CnesstObligations {
  const reasons: CnesstReasonCode[] = [];
  const days = Number(d.daysAbsent) || 0;
  if (d.death) reasons.push('death');
  if (d.limbLossOrUse) reasons.push('limb');
  if (d.majorTrauma) reasons.push('major_trauma');
  if (d.multipleWorkers && days >= 1) reasons.push('multi_workers');
  if ((Number(d.propertyDamage) || 0) >= propertyThreshold(year)) reasons.push('property');
  return {
    reportable24h: reasons.length > 0,
    reasons,
    registerRequired: true,            // toujours, peu importe la gravité
    adrRequired: days > 0,             // Avis de l'employeur si arrêt de travail
    workerClaimMonths: 6,
  };
}

// Adapte un rapport d'accident (IncidentReportData) vers l'entrée du moteur CNESST. Heuristiques :
// majorTrauma ≈ gravité ≥ 4 ou traitement urgence ; perte de membre non captée (false par défaut).
const TREAT_RANK: Record<string, number> = { none: 0, first_aid: 1, clinic: 2, hospital: 3, emergency: 4 };
export function cnesstFromReport(rep: any): IncidentData {
  const persons: any[] = Array.isArray(rep?.injuredPersons) ? rep.injuredPersons : [];
  let death = false, days = 0, worstTreat = 0; const parts: string[] = [];
  for (const p of persons) {
    if (p?.fatality) death = true;
    days = Math.max(days, Number(p?.lostTimeDays) || 0);
    worstTreat = Math.max(worstTreat, TREAT_RANK[String(p?.medicalTreatment || 'none')] ?? 0);
    if (p?.injuryType) parts.push(p.injuryType);
  }
  const sev = Number(rep?.severityLevel) || 0;
  return {
    injuryType: persons[0]?.injuryType,
    bodyParts: parts,
    medicalTreatment: persons.find(p => p?.lostTime || p?.medicalTreatment)?.medicalTreatment,
    daysAbsent: days,
    multipleWorkers: persons.length >= 2,
    majorTrauma: sev >= 4 || worstTreat >= TREAT_RANK.emergency,
    limbLossOrUse: false,
    death,
    propertyDamage: Number(rep?.propertyDamage?.estimatedCost) || 0,
  };
}

// Libellés bilingues des motifs de déclaration (art. 62 LSST).
export const CNESST_REASON_LABEL: Record<CnesstReasonCode, { fr: string; en: string }> = {
  death: { fr: 'Décès (LSST art. 62)', en: 'Death (OHSA s. 62)' },
  limb: { fr: 'Perte totale/partielle d’un membre ou de son usage', en: 'Total/partial loss of a limb or its use' },
  major_trauma: { fr: 'Traumatisme physique majeur', en: 'Major physical trauma' },
  multi_workers: { fr: 'Plusieurs travailleurs blessés (arrêt ≥ 1 jour)', en: 'Multiple injured workers (≥ 1 day off)' },
  property: { fr: 'Dégâts matériels au-delà du seuil légal', en: 'Property damage above the legal threshold' },
};

/** Notes d'action bilingues prêtes à afficher (déclaration / registre / ADR). */
export function cnesstNotes(o: CnesstObligations, lang: 'fr' | 'en' = 'fr'): string[] {
  const fr = lang === 'fr';
  if (o.reportable24h) {
    return [
      fr ? 'Déclaration CNESST requise SANS DÉLAI + rapport écrit sous 24 h.' : 'CNESST notification required WITHOUT DELAY + written report within 24 h.',
      fr ? 'Conserver les lieux inchangés pour l’enquête (sauf risque d’aggravation).' : 'Keep the scene unchanged for investigation (unless risk of worsening).',
      fr ? 'Transmettre une copie de l’avis au comité SST / représentant SST.' : 'Send a copy of the notice to the HSE committee / representative.',
      fr ? 'Inscription au Registre d’accidents/incidents/premiers secours obligatoire.' : 'Entry in the accident/incident/first-aid register is mandatory.',
      o.adrRequired ? (fr ? 'Remplir l’Avis de l’employeur et demande de remboursement (ADR).' : 'Complete the Employer’s notice and reimbursement claim (ADR).') : (fr ? 'Aucun ADR requis (pas d’arrêt de travail).' : 'No ADR required (no lost time).'),
    ];
  }
  return [
    fr ? 'Non déclarable à la CNESST sous 24 h selon LSST art. 62.' : 'Not reportable to CNESST within 24 h under OHSA s. 62.',
    fr ? 'Inscription au Registre d’accidents, d’incidents et de premiers secours OBLIGATOIRE.' : 'Entry in the accident, incident and first-aid register is MANDATORY.',
    o.adrRequired ? (fr ? 'Remplir l’Avis de l’employeur et demande de remboursement (ADR).' : 'Complete the Employer’s notice and reimbursement claim (ADR).') : (fr ? 'Aucun ADR requis (pas d’arrêt de travail).' : 'No ADR required (no lost time).'),
  ];
}
