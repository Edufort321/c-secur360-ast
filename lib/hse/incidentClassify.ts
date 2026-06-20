// Module HSE — CLASSIFIEUR : traduit un rapport du module Accidents (`incident_reports`, taxonomie riche)
// vers la classification RÉGLEMENTAIRE (`event_code` HSE) + les drapeaux KPI (LTIFR/TRIR/DART/gravité).
// C'est le pont qui fait qu'UNE seule saisie (le formulaire riche Accidents) nourrit le moteur d'échéances
// CNESST + tous les KPI, sans ressaisie. Pur & testable. ⚠️ Mapping INDICATIF — à valider par une
// personne qualifiée SST (la qualification réglementaire finale appartient à l'employeur).
//
// Taxonomie source (incident_reports) :
//   incident_type ∈ accident | near_miss | vehicle | property | medical
//   data.severityLevel 1..5 ; data.injuredPersons[].{lostTime,lostTimeDays,medicalTreatment,fatality}
//   data.injuredPersons[].medicalTreatment ∈ none|first_aid|clinic|hospital|emergency
//   data.fatality (bool global) ; data.propertyDamage.estimatedCost
//
// Codes réglementaires (event_code) consommés par le moteur d'échéances + kpi.ts :
//   FATALITY, SPECIFIED_INJURY, MULTI_WORKER_INJURY, OVER_7_DAY, RECORDABLE (= enregistrables/TRIR),
//   OCC_DISEASE, MATERIAL_DAMAGE, NEAR_MISS, FIRST_AID (premiers soins seuls = NON enregistrable).

export type IncidentReportLite = {
  id?: string; incident_type?: string | null; created_at?: string; status?: string;
  data?: any;
};

export type MirrorIncident = {
  source_report_id: string | null;
  occurred_at: string;
  event_code: string;
  is_lost_time: boolean;
  is_restricted: boolean;
  lost_days: number;
  severity: string | null;
  location_text: string | null;
  material_damage_amount: number | null;
};

const TREATMENT_RANK: Record<string, number> = { none: 0, first_aid: 1, clinic: 2, hospital: 3, emergency: 4 };
const num = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const dOnly = (v: any): string | null => { if (!v) return null; const s = String(v); return s.length >= 10 ? s.slice(0, 10) : null; };

/** Agrège les blessés : nombre, arrêt de travail, jours perdus (somme), pire traitement, décès, restreint. */
function summarizeInjuries(data: any) {
  const persons: any[] = Array.isArray(data?.injuredPersons) ? data.injuredPersons : [];
  let anyLostTime = data?.isLostTime === true, anyRestricted = data?.restricted === true || data?.isRestricted === true;
  let fatality = data?.fatality === true, lostDaysSum = 0, maxLostDays = 0, worstTreatment = 0;
  for (const p of persons) {
    if (p?.lostTime === true) anyLostTime = true;
    if (p?.restricted === true || p?.modifiedDuty === true) anyRestricted = true;
    if (p?.fatality === true || String(p?.injuryType || '').toLowerCase().includes('décès') || String(p?.injuryType || '').toLowerCase().includes('fatal')) fatality = true;
    const d = num(p?.lostTimeDays ?? p?.lostDays);
    lostDaysSum += d; if (d > maxLostDays) maxLostDays = d;
    const t = TREATMENT_RANK[String(p?.medicalTreatment || 'none')] ?? 0; if (t > worstTreatment) worstTreatment = t;
  }
  // Replis si aucun bloc « blessés » détaillé (rapport léger) : champs à plat dans data.
  if (!persons.length) {
    lostDaysSum = num(data?.lostDays ?? data?.daysLost ?? data?.lost_days);
    maxLostDays = lostDaysSum;
    worstTreatment = TREATMENT_RANK[String(data?.medicalTreatment || 'none')] ?? 0;
  }
  return { count: persons.length, anyLostTime, anyRestricted, fatality, lostDaysSum, maxLostDays, worstTreatment };
}

/** Classe un rapport en code réglementaire + drapeaux KPI. */
export function classifyReport(report: IncidentReportLite): MirrorIncident {
  const data = report.data || {};
  const type = String(report.incident_type || 'accident');
  const inj = summarizeInjuries(data);
  const severityLevel = num(data.severityLevel);
  const occurred_at = (dOnly(data.incidentDate) || dOnly(report.created_at) || dOnly(new Date().toISOString())) + 'T12:00:00';
  const material = (() => { const c = num(data?.propertyDamage?.estimatedCost ?? data?.estimatedCost); return c > 0 ? c : null; })();

  let event_code: string;
  if (type === 'near_miss') event_code = 'NEAR_MISS';
  else if (type === 'property') event_code = 'MATERIAL_DAMAGE';
  else if (type === 'medical') event_code = 'OCC_DISEASE';
  else { // accident | vehicle → on dérive la conséquence sur le travailleur
    if (inj.fatality) event_code = 'FATALITY';
    else if (inj.count >= 2) event_code = 'MULTI_WORKER_INJURY';
    else if (severityLevel >= 4 || inj.worstTreatment >= TREATMENT_RANK.hospital) event_code = 'SPECIFIED_INJURY';
    else if (inj.maxLostDays > 7) event_code = 'OVER_7_DAY';
    else if (inj.anyLostTime || inj.worstTreatment >= TREATMENT_RANK.clinic) event_code = 'RECORDABLE';
    else event_code = 'FIRST_AID'; // premiers soins / sans soin et sans arrêt → non enregistrable
  }

  return {
    source_report_id: report.id || null,
    occurred_at,
    event_code,
    is_lost_time: inj.anyLostTime,
    is_restricted: inj.anyRestricted,
    lost_days: Math.round(inj.lostDaysSum * 100) / 100,
    severity: severityLevel ? String(severityLevel) : null,
    location_text: (data.exactLocation || data.address || data.department || null) as any,
    material_damage_amount: material,
  };
}

/** Un rapport compte pour les échéances/KPI seulement s'il est soumis (pas brouillon). */
export function isMirrorable(report: IncidentReportLite): boolean {
  return String(report.status || 'draft') !== 'draft';
}
