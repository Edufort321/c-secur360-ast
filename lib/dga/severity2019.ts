// ============================================================================
// DGA — Sévérité IEEE C57.104-2019 (édition MODERNE, percentiles + type de transfo).
// Corrige les bugs d'interprétation : choix des seuils SELON le type scellé/respirant (ratio O₂/N₂),
// taux de génération (ppm/jour), interprétation CO₂/CO, et garde anti-verdict « stabilisé ».
//
// ⚠️ Les valeurs de percentiles (90e) ci-dessous proviennent de sources publiques IEEE C57.104-2019 et
//    DOIVENT être validées contre la norme officielle par une personne qualifiée avant
//    usage en production. Ce module est une aide à l'ingénierie, pas un avis certifié.
// ============================================================================

export type TransfoType = 'sealed' | 'free-breathing';
export const STANDARD_EDITION = 'IEEE C57.104-2019';

// Ratio O₂/N₂ : un transfo SCELLÉ a peu d'oxygène (ratio bas) ; un RESPIRANT s'équilibre avec l'air.
export function o2n2Ratio(o2?: number | null, n2?: number | null): number | null {
  const O = Number(o2), N = Number(n2);
  if (!isFinite(O) || !isFinite(N) || N <= 0) return null;
  return O / N;
}
// Seuil de bascule 0,2 (IEEE C57.104-2019, indicatif) : ≤ 0,2 = scellé, sinon respirant.
export function transformerType(o2?: number | null, n2?: number | null): TransfoType {
  const r = o2n2Ratio(o2, n2);
  return r != null && r <= 0.2 ? 'sealed' : 'free-breathing';
}

// 90e percentile (ppm) par gaz et par type [sealed, free-breathing] — IEEE C57.104-2019 (À VALIDER).
// L'acétylène (C₂H₂) reste à 1 ppm dans les deux cas (présence anormale en exploitation saine).
export const PCT90_2019: Record<string, [number, number]> = {
  h2:   [80, 40],
  ch4:  [90, 60],
  c2h6: [90, 30],
  c2h4: [50, 60],
  c2h2: [1, 1],
  co:   [900, 500],
  co2:  [9000, 5000],
};

export function threshold90(gas: keyof typeof PCT90_2019 | string, type: TransfoType): number | null {
  const row = PCT90_2019[gas as string];
  if (!row) return null;
  return type === 'sealed' ? row[0] : row[1];
}

// Multiple du 90e percentile : 947 ppm sur un seuil scellé de 1 ppm = 947× (sévérité réelle massive).
export function overThreshold(value: number, gas: string, type: TransfoType): number | null {
  const t = threshold90(gas, type);
  if (t == null || t <= 0) return null;
  return (Number(value) || 0) / t;
}

// Taux de génération (ppm/jour) d'un gaz entre deux échantillons — central en 2019 (défaut actif vs historique).
export function generationRatePerDay(prevVal: number, prevDateIso: string, curVal: number, curDateIso: string): number | null {
  const d1 = new Date(prevDateIso).getTime(), d2 = new Date(curDateIso).getTime();
  if (!isFinite(d1) || !isFinite(d2) || d2 <= d1) return null;
  const days = (d2 - d1) / 86400000;
  if (days <= 0) return null;
  return ((Number(curVal) || 0) - (Number(prevVal) || 0)) / days;
}

// 90e percentile du TAUX de génération (ppm/AN) par gaz — IEEE C57.104-2019 Table 3/4 (À VALIDER).
// Le taux distingue un défaut ACTIF d'un défaut historique : c'est LE paramètre central de l'édition 2019.
export const RATE_PCT90_PER_YEAR: Record<string, number> = {
  h2: 100, ch4: 90, c2h6: 70, c2h4: 70, c2h2: 4, co: 500, co2: 5000,
};
export type RateLevel = 'ok' | 'warn' | 'crit';
export type GasRate = { gas: string; perDay: number | null; perYear: number | null; threshold: number | null; level: RateLevel };

// Niveau d'un taux vs le seuil 90e pct : ok ≤ seuil, warn ≤ 3× seuil, crit au-delà.
export function rateLevel(perYear: number | null, threshold: number | null): RateLevel {
  if (perYear == null || threshold == null || threshold <= 0) return 'ok';
  if (perYear <= threshold) return 'ok';
  if (perYear <= threshold * 3) return 'warn';
  return 'crit';
}

// Taux de génération de TOUS les gaz entre deux échantillons (ppm/jour + ppm/an + niveau).
const RATE_GASES = ['h2', 'ch4', 'c2h6', 'c2h4', 'c2h2', 'co', 'co2'] as const;
export function generationRates(
  prev: Record<string, any> & { sample_date?: string; date?: string },
  cur: Record<string, any> & { sample_date?: string; date?: string },
): GasRate[] {
  const pd = prev.sample_date || prev.date || ''; const cd = cur.sample_date || cur.date || '';
  return RATE_GASES.map(g => {
    const perDay = generationRatePerDay(Number(prev[g]) || 0, pd, Number(cur[g]) || 0, cd);
    const perYear = perDay == null ? null : perDay * 365;
    const threshold = RATE_PCT90_PER_YEAR[g] ?? null;
    return { gas: g, perDay, perYear, threshold, level: rateLevel(perYear, threshold) };
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SÉVÉRITÉ IEEE C57.104-2019 (Option 2) — le STATUT 1/2/3 par gaz pilote le verdict et les couleurs.
// Calculé UNIQUEMENT par les percentiles 2019 : 90e (statut 1→2, « Table 1 ») et 95e (2→3, « Table 2 »),
// par SEGMENT = ratio O₂/N₂ (seuil 0,2 : scellé/respirant) × tranche d'âge OFFICIELLE (≤10 / 10-30 / >30 ans).
// Statut GLOBAL = pire gaz (conservateur). AUCUNE logique « Condition 1-4 ». Le TDCG est isolé (tdcgIndicator).
//
// ⚠️⚠️ La table PERCENTILES est une STRUCTURE DE PLACEHOLDER — PAS les valeurs certifiées. Les vraies valeurs
//     (Table 1 = 90e, Table 2 = 95e, par O₂/N₂ et âge) sont dans la norme PAYANTE et ne sont pas publiques.
//     À REMPLIR par une personne qualifiée AVANT production. La structure ne bouge pas ; seuls les chiffres changent.
// Note : CO₂ est volontairement EXCLU du statut (marqueur cellulose bruité, couvert par CO₂/CO). L'ajouter =
//     étendre SEV_GAS_KEYS + fournir son percentile.
// ════════════════════════════════════════════════════════════════════════════
export type SegO2N2 = 'low' | 'high';            // low = O₂/N₂ ≤ 0,2 (scellé) ; high = respirant
export type SegAge = 'le10' | '10to30' | 'gt30' | 'unknown'; // tranches officielles ≤10 / 10-30 / >30
export type Segment = { o2n2: SegO2N2; ageBand: SegAge };
export type Status = 1 | 2 | 3;
export type SeverityGasKey = 'H2' | 'CH4' | 'C2H6' | 'C2H4' | 'C2H2' | 'CO';
export type SeverityGases = { H2: number; CH4: number; C2H6: number; C2H4: number; C2H2: number; CO?: number; CO2?: number; O2?: number; N2?: number };
const SEV_GAS_KEYS: SeverityGasKey[] = ['H2', 'CH4', 'C2H6', 'C2H4', 'C2H2', 'CO'];

export function getSegment(g: SeverityGases, ageYears?: number | null): Segment {
  const o2n2: SegO2N2 = (g.O2 != null && g.N2 != null && g.N2 > 0 && g.O2 / g.N2 <= 0.2) ? 'low' : 'high';
  let ageBand: SegAge = 'unknown';
  if (ageYears != null && isFinite(ageYears)) ageBand = ageYears <= 10 ? 'le10' : ageYears <= 30 ? '10to30' : 'gt30';
  return { o2n2, ageBand };
}

type GasLimits = { p90: number; p95: number };
type SegmentKey = `${SegO2N2}_${SegAge}`;
// PLACEHOLDERS de structure — à remplacer par les valeurs officielles. _default = repli ; surcharges par segment.
export const PERCENTILES: Record<SeverityGasKey, Partial<Record<SegmentKey, GasLimits>>> & { _default: Record<SeverityGasKey, GasLimits> } = {
  _default: {
    H2: { p90: 80, p95: 200 }, CH4: { p90: 90, p95: 150 }, C2H6: { p90: 90, p95: 175 },
    C2H4: { p90: 50, p95: 100 }, C2H2: { p90: 1, p95: 2 }, CO: { p90: 900, p95: 1100 },
  },
  H2: {}, CH4: {}, C2H6: {}, C2H4: {}, CO: {},
  // C₂H₂ reste très bas en scellé ; un peu plus permissif en respirant (placeholder).
  C2H2: { low_le10: { p90: 1, p95: 2 }, low_10to30: { p90: 1, p95: 2 }, low_gt30: { p90: 1, p95: 2 }, high_10to30: { p90: 2, p95: 7 } },
};
export const PERCENTILES_ARE_PLACEHOLDER = true; // tant que la Table 1/2 officielle n'est pas saisie

function limitsFor(gas: SeverityGasKey, seg: Segment): GasLimits {
  const key = `${seg.o2n2}_${seg.ageBand}` as SegmentKey;
  return (PERCENTILES[gas] as Partial<Record<SegmentKey, GasLimits>>)[key] ?? PERCENTILES._default[gas];
}
export function gasStatus(gas: SeverityGasKey, value: number, seg: Segment): Status {
  const { p90, p95 } = limitsFor(gas, seg);
  const v = Number(value) || 0;
  if (v >= p95) return 3;
  if (v >= p90) return 2;
  return 1;
}

export type SeverityResult = {
  status: Status;
  perGas: { gas: SeverityGasKey; value: number; status: Status; p90: number; p95: number }[];
  drivingGases: SeverityGasKey[];
  segment: Segment;
  placeholder: boolean;
};
export function severity2019(g: SeverityGases, ageYears?: number | null): SeverityResult {
  const seg = getSegment(g, ageYears);
  const perGas = SEV_GAS_KEYS.map(gas => {
    const value = Number((g as any)[gas]) || 0;
    const { p90, p95 } = limitsFor(gas, seg);
    return { gas, value, status: gasStatus(gas, value, seg), p90, p95 };
  });
  const status = Math.max(...perGas.map(p => p.status)) as Status;
  return { status, perGas, drivingGases: perGas.filter(p => p.status === status && status > 1).map(p => p.gas), segment: seg, placeholder: PERCENTILES_ARE_PLACEHOLDER };
}

// TDCG — INDICATEUR de tendance seulement (valeur = somme des gaz combustibles + taux). PAS un verdict.
export function tdcgIndicator(current: SeverityGases, previous?: { gases: SeverityGases; date: string }, currentDate?: string) {
  const sum = (x: SeverityGases) => (x.H2 || 0) + (x.CH4 || 0) + (x.C2H6 || 0) + (x.C2H4 || 0) + (x.C2H2 || 0) + (x.CO || 0);
  const value = Math.round(sum(current));
  let ratePpmPerDay: number | null = null;
  if (previous && currentDate) {
    const days = (new Date(currentDate).getTime() - new Date(previous.date).getTime()) / 86400000;
    if (days > 0) ratePpmPerDay = Math.round(((value - sum(previous.gases)) / days) * 100) / 100;
  }
  return { value, ratePpmPerDay };
}

export const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  1: { bg: '#EAF3DE', fg: '#173404' }, 2: { bg: '#FAEEDA', fg: '#633806' }, 3: { bg: '#FCEBEB', fg: '#501313' },
};

// Interprétation CO₂/CO (IEC 60599) — implication du papier (cellulose).
export function co2coRatio(co2?: number | null, co?: number | null): number | null {
  const C2 = Number(co2), C = Number(co);
  if (!isFinite(C2) || !isFinite(C) || C <= 0) return null;
  return C2 / C;
}
export function co2coInterpretation(ratio: number | null, lang: 'fr' | 'en' = 'fr'): string | null {
  if (ratio == null) return null;
  const EN = lang === 'en';
  if (ratio > 11) return EN ? 'paper degradation (poor condition)' : 'papier en dégradation (mauvais état)';
  if (ratio >= 4) return EN ? 'healthy cellulose (normal range)' : 'cellulose saine (plage normale)';
  if (ratio < 3) return EN ? 'thermal involvement of paper at high temperature (hot spot)' : 'implication thermique du papier à haute température (point chaud)';
  return EN ? 'intermediate zone — correlate with the electrical fault' : 'zone intermédiaire — à corréler avec le défaut électrique';
}

// ── Indice de santé global (Health Index 0–100) — agrège gaz combustibles, taux de génération, qualité
//    huile et papier (DP). Lecture immédiate pour le client. INDICATIF (à valider par personne qualifiée).
export type HealthBand = 'excellent' | 'bon' | 'a_surveiller' | 'critique';
export type HealthInput = {
  c2h2Over?: number | null;     // multiple du seuil 90e pct C₂H₂
  worstCondition?: number;      // 1–4 (IEEE C57.104 conditions, legacy)
  genRates?: GasRate[];         // taux de génération par gaz
  oilPoor?: number; oilFair?: number; // nb de paramètres d'huile mauvais / moyens
  dp?: number | null;           // degré de polymérisation du papier (furanes)
};
export function healthBand(score: number): HealthBand {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'bon';
  if (score >= 40) return 'a_surveiller';
  return 'critique';
}
export function computeHealthIndex(inp: HealthInput): { score: number; band: HealthBand } {
  let s = 100;
  const cond = inp.worstCondition || 1;
  s -= cond === 4 ? 45 : cond === 3 ? 25 : cond === 2 ? 10 : 0;
  const over = inp.c2h2Over ?? 0;
  s -= over > 100 ? 40 : over > 10 ? 25 : over > 1 ? 10 : 0;
  const crit = (inp.genRates || []).filter(r => r.level === 'crit').length;
  const warn = (inp.genRates || []).filter(r => r.level === 'warn').length;
  s -= Math.min(36, crit * 12 + warn * 5);
  s -= Math.min(24, (inp.oilPoor || 0) * 8 + (inp.oilFair || 0) * 3);
  if (inp.dp != null) s -= inp.dp < 250 ? 25 : inp.dp < 450 ? 12 : inp.dp < 700 ? 4 : 0;
  const score = Math.max(0, Math.min(100, Math.round(s)));
  return { score, band: healthBand(score) };
}

// Intervalle de RE-TEST recommandé (jours) selon la bande de santé + présence d'un taux critique.
// Actionnable et chiffré (ex. « re-test sous 7 jours »). La date cible se calcule avec addDays().
export function recommendedRetestDays(band: HealthBand, hasCritRate = false): number {
  if (band === 'critique' || hasCritRate) return 7;
  if (band === 'a_surveiller') return 30;
  if (band === 'bon') return 180;
  return 365;
}
export function addDays(fromIso: string, days: number): string {
  const d = new Date(fromIso); if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Garde anti-« stabilisé » : interdit le verdict de stabilisation s'il n'y a pas ≥ 2 points APRÈS
//    le dernier SAUT (delta > seuil). Avec 2 mesures et un saut récent, on NE PEUT PAS conclure stabilisé.
export type SampleLite = { date: string; value: number };
export function pointsAfterLastJump(samples: SampleLite[], jumpThreshold: number): number {
  const s = [...samples].filter(x => x && x.date).sort((a, b) => a.date.localeCompare(b.date));
  if (s.length < 2) return 0;
  let lastJumpIdx = -1;
  for (let i = 1; i < s.length; i++) {
    if (Math.abs((Number(s[i].value) || 0) - (Number(s[i - 1].value) || 0)) > jumpThreshold) lastJumpIdx = i;
  }
  if (lastJumpIdx < 0) return s.length; // pas de saut → toute la série sert de tendance
  return s.length - 1 - lastJumpIdx;     // nombre de points APRÈS l'échantillon du saut
}
// Peut-on conclure « stabilisé » ? Il faut ≥ 2 points après le dernier saut.
export function canConcludeStabilized(samples: SampleLite[], jumpThreshold: number): boolean {
  return pointsAfterLastJump(samples, jumpThreshold) >= 2;
}
