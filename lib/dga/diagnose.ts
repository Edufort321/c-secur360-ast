// Module externe DGA — Diagnostic de gaz dissous (huile de transformateur).
// Réfs : IEEE C57.104 (conditions 1-4 + TDCG) et Triangle de Duval 1 (CH4/C2H2/C2H4).
// Indicatif : à confirmer par analyse de laboratoire et tendance dans le temps.

export interface GasInput {
  h2: number;   // hydrogène
  ch4: number;  // méthane
  c2h6: number; // éthane
  c2h4: number; // éthylène
  c2h2: number; // acétylène
  co: number;   // monoxyde de carbone
  co2: number;  // dioxyde de carbone
}

export type DuvalZone = 'PD' | 'D1' | 'D2' | 'T1' | 'T2' | 'T3' | 'DT' | 'N';

export interface DgaResult {
  tdcg: number;
  condition: 1 | 2 | 3 | 4;          // IEEE C57.104
  gasCondition: Record<keyof GasInput, 1 | 2 | 3 | 4>;
  duval: DuvalZone;
  fault: { fr: string; en: string };
  recommendation: { fr: string; en: string };
}

// Bornes IEEE C57.104 : [Cond1 max, Cond2 max, Cond3 max] en ppm. >Cond3 = Condition 4.
const LIMITS: Record<string, [number, number, number]> = {
  h2: [100, 700, 1800],
  ch4: [120, 400, 1000],
  c2h6: [65, 100, 150],
  c2h4: [50, 100, 200],
  c2h2: [35, 50, 80],
  co: [350, 570, 1400],
  co2: [2500, 4000, 10000],
  tdcg: [720, 1920, 4630],
};

function condFor(value: number, limits: [number, number, number]): 1 | 2 | 3 | 4 {
  if (value <= limits[0]) return 1;
  if (value <= limits[1]) return 2;
  if (value <= limits[2]) return 3;
  return 4;
}

// Triangle de Duval 1 (approximation des zones standard). Entrées en ppm de CH4, C2H2, C2H4.
export function duvalTriangle1(ch4: number, c2h2: number, c2h4: number): DuvalZone {
  const tot = ch4 + c2h2 + c2h4;
  if (tot <= 0) return 'N';
  const m = (100 * ch4) / tot;   // %CH4
  const a = (100 * c2h2) / tot;  // %C2H2
  const e = (100 * c2h4) / tot;  // %C2H4
  if (m >= 98) return 'PD';                          // décharges partielles
  if (a >= 13 && e <= 23) return 'D1';               // décharges faible énergie
  if (a >= 13 && e > 23) return 'D2';                // décharges forte énergie (arc)
  if (a < 4 && e < 20) return 'T1';                  // thermique < 300 °C
  if (a < 4 && e >= 20 && e < 50) return 'T2';       // thermique 300-700 °C
  if (a < 15 && e >= 50) return 'T3';                // thermique > 700 °C
  return 'DT';                                       // mélange électrique/thermique
}

const ZONE_TEXT: Record<DuvalZone, { fr: string; en: string }> = {
  N: { fr: 'Aucun défaut détecté (gaz faibles)', en: 'No fault detected (low gases)' },
  PD: { fr: 'Décharges partielles (effet couronne)', en: 'Partial discharges (corona)' },
  D1: { fr: 'Décharges de faible énergie', en: 'Low-energy discharges' },
  D2: { fr: 'Décharges de forte énergie (arc électrique)', en: 'High-energy discharges (arcing)' },
  T1: { fr: 'Défaut thermique < 300 °C', en: 'Thermal fault < 300 °C' },
  T2: { fr: 'Défaut thermique 300-700 °C', en: 'Thermal fault 300-700 °C' },
  T3: { fr: 'Défaut thermique > 700 °C', en: 'Thermal fault > 700 °C' },
  DT: { fr: 'Mélange de défauts thermiques et électriques', en: 'Mix of thermal and electrical faults' },
};

const RECO: Record<1 | 2 | 3 | 4, { fr: string; en: string }> = {
  1: { fr: 'Condition normale. Surveillance annuelle.', en: 'Normal condition. Annual monitoring.' },
  2: { fr: 'Vigilance. Refaire un DGA dans 3-6 mois et suivre la tendance.', en: 'Caution. Re-test DGA in 3-6 months and trend.' },
  3: { fr: 'Anomalie marquée. DGA mensuel, planifier inspection.', en: 'Significant anomaly. Monthly DGA, plan inspection.' },
  4: { fr: 'Critique. Retrait de service possible, expertise immédiate.', en: 'Critical. Possible removal from service, immediate expertise.' },
};

export function diagnose(g: GasInput): DgaResult {
  const tdcg = g.h2 + g.ch4 + g.c2h6 + g.c2h4 + g.c2h2 + g.co; // CO2 exclu du TDCG
  const gasCondition = {
    h2: condFor(g.h2, LIMITS.h2), ch4: condFor(g.ch4, LIMITS.ch4), c2h6: condFor(g.c2h6, LIMITS.c2h6),
    c2h4: condFor(g.c2h4, LIMITS.c2h4), c2h2: condFor(g.c2h2, LIMITS.c2h2), co: condFor(g.co, LIMITS.co),
    co2: condFor(g.co2, LIMITS.co2),
  } as Record<keyof GasInput, 1 | 2 | 3 | 4>;
  const tdcgCond = condFor(tdcg, LIMITS.tdcg);
  const condition = Math.max(tdcgCond, ...Object.values(gasCondition)) as 1 | 2 | 3 | 4;

  // Duval seulement si des gaz de défaut sont présents (sinon zone normale).
  const gasy = g.ch4 + g.c2h2 + g.c2h4;
  const duval: DuvalZone = (condition === 1 && gasy < 10) ? 'N' : duvalTriangle1(g.ch4, g.c2h2, g.c2h4);

  return { tdcg, condition, gasCondition, duval, fault: ZONE_TEXT[duval], recommendation: RECO[condition] };
}

// ───────────────────────── Méthodes complémentaires ─────────────────────────

const safeRatio = (a: number, b: number) => (b > 0 ? a / b : (a > 0 ? Infinity : 0));

export interface MethodResult { name: string; detail: string; fault: { fr: string; en: string }; }

// Gaz dominant (Key Gas method, IEEE).
export function keyGas(g: GasInput): MethodResult {
  const candidates: { k: keyof GasInput; fr: string; en: string }[] = [
    { k: 'h2', fr: 'H₂ dominant — décharges partielles', en: 'H₂ dominant — partial discharge' },
    { k: 'c2h2', fr: 'C₂H₂ dominant — arc électrique', en: 'C₂H₂ dominant — arcing' },
    { k: 'c2h4', fr: 'C₂H₄ dominant — surchauffe élevée', en: 'C₂H₄ dominant — high overheating' },
    { k: 'ch4', fr: 'CH₄ dominant — surchauffe modérée', en: 'CH₄ dominant — moderate overheating' },
    { k: 'co', fr: 'CO dominant — dégradation cellulose/papier', en: 'CO dominant — cellulose/paper degradation' },
  ];
  let best = candidates[0]; let bestVal = -1;
  for (const c of candidates) { const v = g[c.k] || 0; if (v > bestVal) { bestVal = v; best = c; } }
  if (bestVal <= 0) return { name: 'Key Gas', detail: '—', fault: { fr: 'Aucun gaz significatif', en: 'No significant gas' } };
  return { name: 'Key Gas', detail: best.k.toUpperCase(), fault: { fr: best.fr, en: best.en } };
}

// Ratios de Rogers (IEEE) : R1=CH4/H2, R2=C2H2/C2H4, R5=C2H4/C2H6.
export function rogers(g: GasInput): MethodResult {
  const R1 = safeRatio(g.ch4, g.h2), R2 = safeRatio(g.c2h2, g.c2h4), R5 = safeRatio(g.c2h4, g.c2h6);
  let fr = 'Indéterminé (hors plages Rogers)', en = 'Undetermined (outside Rogers ranges)';
  if (R2 < 0.1 && R1 >= 0.1 && R1 <= 1 && R5 < 1) { fr = 'Aucun défaut / vieillissement normal'; en = 'No fault / normal aging'; }
  else if (R2 < 0.1 && R1 < 0.1 && R5 < 1) { fr = 'Décharges partielles'; en = 'Partial discharge'; }
  else if (R2 >= 0.1 && R2 <= 3 && R1 >= 0.1 && R1 <= 1 && R5 > 3) { fr = 'Arc — décharge de forte énergie'; en = 'Arcing — high-energy discharge'; }
  else if (R2 < 0.1 && R1 >= 0.1 && R1 <= 1 && R5 >= 1 && R5 <= 3) { fr = 'Surchauffe < 700 °C'; en = 'Overheating < 700 °C'; }
  else if (R2 < 0.1 && R1 > 1 && R5 > 3) { fr = 'Surchauffe > 700 °C'; en = 'Overheating > 700 °C'; }
  return { name: 'Rogers', detail: `R1=${isFinite(R1) ? R1.toFixed(2) : '∞'} R2=${isFinite(R2) ? R2.toFixed(2) : '∞'} R5=${isFinite(R5) ? R5.toFixed(2) : '∞'}`, fault: { fr, en } };
}

// Ratios IEC 60599 : C2H2/C2H4, CH4/H2, C2H4/C2H6.
export function iec60599(g: GasInput): MethodResult {
  const r1 = safeRatio(g.c2h2, g.c2h4), r2 = safeRatio(g.ch4, g.h2), r3 = safeRatio(g.c2h4, g.c2h6);
  let fr = 'Indéterminé', en = 'Undetermined';
  if (r1 < 0.1 && r2 > 1 && r3 < 1) { fr = 'Surchauffe < 300 °C'; en = 'Overheating < 300 °C'; }
  else if (r1 < 0.1 && r2 > 1 && r3 >= 1 && r3 <= 4) { fr = 'Surchauffe 300-700 °C'; en = 'Overheating 300-700 °C'; }
  else if (r1 < 0.2 && r2 > 1 && r3 > 4) { fr = 'Surchauffe > 700 °C'; en = 'Overheating > 700 °C'; }
  else if (r2 < 0.1 && r3 < 0.2) { fr = 'Décharges partielles'; en = 'Partial discharge'; }
  else if (r1 >= 0.6 && r2 >= 0.1 && r2 <= 0.5 && r3 > 1) { fr = 'Décharges de faible énergie'; en = 'Low-energy discharge'; }
  else if (r1 >= 0.1 && r1 <= 1 && r2 >= 0.1 && r2 <= 1 && r3 > 2) { fr = 'Décharges de forte énergie (arc)'; en = 'High-energy discharge (arc)'; }
  return { name: 'IEC 60599', detail: `${isFinite(r1) ? r1.toFixed(2) : '∞'} / ${isFinite(r2) ? r2.toFixed(2) : '∞'} / ${isFinite(r3) ? r3.toFixed(2) : '∞'}`, fault: { fr, en } };
}

// Taux de génération de gaz entre deux échantillons (ppm/jour sur le TDCG).
export function gasRatePerDay(prevTdcg: number, prevDateIso: string, curTdcg: number, curDateIso: string): number | null {
  const d1 = new Date(prevDateIso).getTime(), d2 = new Date(curDateIso).getTime();
  if (!isFinite(d1) || !isFinite(d2) || d2 <= d1) return null;
  const days = (d2 - d1) / 86400000;
  return days > 0 ? (curTdcg - prevTdcg) / days : null;
}

// Synthèse multi-méthodes.
export function diagnoseFull(g: GasInput) {
  return { ...diagnose(g), methods: [keyGas(g), rogers(g), iec60599(g)] };
}
