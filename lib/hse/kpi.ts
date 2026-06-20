// Module HSE — KPI normalisés (LTIFR/TF1, TRIR/TF2, taux de gravité) + indicateurs proactifs.
// Calculs PURS, testables. La BASE DE NORMALISATION (rateBase) vient TOUJOURS de hse_tenant_settings
// (200 000 Amérique du Nord / 100 000 UK) — JAMAIS codée en dur dans le front (point de vigilance #3).
// Références : LTIFR/TRIR = (n incidents × base) / heures travaillées (OSHA/CNESST/HSE — standard).

export type HseIncidentLite = {
  occurred_at: string; event_code: string; is_lost_time?: boolean; is_restricted?: boolean; lost_days?: number;
};
export type HseHours = { period_start: string; hours: number };

// Codes ENREGISTRABLES (comptent en TRIR/TF2) = blessures/maladies de TRAVAILLEURS imputables au travail.
// Inclut MULTI_WORKER_INJURY (événement à blessés multiples = enregistrable au sens CNESST).
// NE comptent PAS en TRIR (volontairement) : NEAR_MISS (pas de lésion), MATERIAL_DAMAGE (matériel),
// et les catégories RIDDOR non liées à un travailleur — DANGEROUS_OCCURRENCE (événement à signaler sans
// blessé), OCC_DISEASE (suivi maladie pro. distinct), NON_WORKER_HOSPITAL (tiers, pas un employé).
const RECORDABLE = new Set(['FATALITY', 'SPECIFIED_INJURY', 'OVER_7_DAY', 'RECORDABLE', 'MULTI_WORKER_INJURY']);
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const monthKey = (iso: string) => (iso || '').slice(0, 7); // AAAA-MM

/** Taux normalisé = (nombre × base) / heures. 0 si pas d'heures. */
export function normalizedRate(count: number, hours: number, rateBase: number): number {
  const h = Number(hours) || 0;
  if (h <= 0) return 0;
  return r2((Number(count) || 0) * (Number(rateBase) || 0) / h);
}

export type HseKpiRow = {
  month: string; hours: number; ltiCount: number; recordableCount: number; nearMissCount: number;
  dartCount: number; fatalityCount: number;
  lostDays: number; ltifr: number; trir: number; severityRate: number; dartRate: number;
};

/** KPI mensuels à partir des incidents + heures. rateBase = base de normalisation du tenant. */
export function computeMonthlyKpi(incidents: HseIncidentLite[], hours: HseHours[], rateBase: number): HseKpiRow[] {
  const byMonth: Record<string, HseKpiRow> = {};
  const ensure = (m: string) => (byMonth[m] ||= { month: m, hours: 0, ltiCount: 0, recordableCount: 0, nearMissCount: 0, dartCount: 0, fatalityCount: 0, lostDays: 0, ltifr: 0, trir: 0, severityRate: 0, dartRate: 0 });
  for (const h of hours) { const m = monthKey(h.period_start); ensure(m).hours += Number(h.hours) || 0; }
  for (const i of incidents) {
    const row = ensure(monthKey(i.occurred_at));
    if (i.is_lost_time) row.ltiCount++;
    if (RECORDABLE.has(i.event_code)) row.recordableCount++;
    if (i.event_code === 'NEAR_MISS') row.nearMissCount++;
    if (i.event_code === 'FATALITY') row.fatalityCount++;
    // DART = Days Away/Restricted/Transferred : arrêt de travail OU travail restreint/mutation (OSHA 300).
    if (i.is_lost_time || i.is_restricted) row.dartCount++;
    row.lostDays += Number(i.lost_days) || 0;
  }
  for (const m of Object.keys(byMonth)) {
    const row = byMonth[m];
    row.hours = r2(row.hours);
    row.ltifr = normalizedRate(row.ltiCount, row.hours, rateBase);
    row.trir = normalizedRate(row.recordableCount, row.hours, rateBase);
    row.severityRate = normalizedRate(row.lostDays, row.hours, rateBase);
    row.dartRate = normalizedRate(row.dartCount, row.hours, rateBase);
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

/** Cumul de la période (KPI « board-ready » sur l'ensemble fourni). */
export function computeAggregateKpi(rows: HseKpiRow[], rateBase: number): Omit<HseKpiRow, 'month'> {
  // Cumul board-ready : on somme les COMPTAGES BRUTS et les HEURES, puis on RECALCULE chaque taux à partir
  // des totaux — (Σ n × base) / Σ heures — JAMAIS la moyenne des taux mensuels (qui serait pondérée à tort).
  const sum = (k: keyof HseKpiRow) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const hours = r2(sum('hours')), lti = sum('ltiCount'), rec = sum('recordableCount'), nm = sum('nearMissCount'), ld = sum('lostDays');
  const dart = sum('dartCount'), fat = sum('fatalityCount');
  return { hours, ltiCount: lti, recordableCount: rec, nearMissCount: nm, dartCount: dart, fatalityCount: fat, lostDays: ld,
    ltifr: normalizedRate(lti, hours, rateBase), trir: normalizedRate(rec, hours, rateBase), severityRate: normalizedRate(ld, hours, rateBase), dartRate: normalizedRate(dart, hours, rateBase) };
}

/** « Sans délai » = 0 h → libellé « immédiat » (point de vigilance #4 : ne jamais afficher « 0 heure »). */
export function formatDeadlineDelay(hours: number | null | undefined, lang: 'fr' | 'en' = 'fr'): string {
  if (hours == null) return lang === 'en' ? 'n/a' : 's.o.';
  if (hours <= 0) return lang === 'en' ? 'immediate / without delay' : 'immédiat / sans délai';
  if (hours % 24 === 0) { const d = hours / 24; return lang === 'en' ? `${d} day(s)` : `${d} jour(s)`; }
  return lang === 'en' ? `${hours} h` : `${hours} h`;
}
