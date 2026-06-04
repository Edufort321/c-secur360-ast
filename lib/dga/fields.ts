// ============================================================================
// CONSTANTES D'AFFICHAGE — portées À L'IDENTIQUE du prototype dga-oil-app.jsx
// (GAS_LABELS ~l.140, GAS_FIELDS ~l.152, OIL_FIELDS ~l.170, FURAN_FIELDS ~l.188,
//  IEEE_LIMITS/COND_* ~l.297, ieeeCondition ~l.306, rogers ~l.333, parseNum ~l.783).
// Adaptations : clés de gaz en minuscules (cohérent avec dga_measures) ; `lang` en paramètre.
// Les paramètres d'huile + furanes sont stockés dans measure.oil_quality (jsonb), MÊMES clés.
// ============================================================================
import type { Measure } from './dossiers';
import { autoNextDate } from './catalog';

export type Lang = 'fr' | 'en';

// ── Libellés bilingues des gaz (clé MAJUSCULE = libellé affiché) ──
export const GAS_LABELS: Record<string, { fr: string; en: string }> = {
  H2: { fr: 'Hydrogène (H₂)', en: 'Hydrogen (H₂)' },
  C2H2: { fr: 'Acétylène (C₂H₂)', en: 'Acetylene (C₂H₂)' },
  C2H6: { fr: 'Éthane (C₂H₆)', en: 'Ethane (C₂H₆)' },
  C2H4: { fr: 'Éthylène (C₂H₄)', en: 'Ethylene (C₂H₄)' },
  CH4: { fr: 'Méthane (CH₄)', en: 'Methane (CH₄)' },
  CO: { fr: 'Monoxyde de C (CO)', en: 'Carbon monoxide (CO)' },
  CO2: { fr: 'Dioxyde de C (CO₂)', en: 'Carbon dioxide (CO₂)' },
  N2: { fr: 'Azote (N₂)', en: 'Nitrogen (N₂)' },
  O2: { fr: 'Oxygène (O₂)', en: 'Oxygen (O₂)' },
  TDCG: { fr: 'TDCG (ppm)', en: 'TDCG (ppm)' },
};
export const gl = (u: string, lang: Lang = 'fr') => { const g = GAS_LABELS[u]; return g ? (lang === 'en' ? g.en : g.fr) : u; };

// ── Champs gaz : clé de mesure (minuscule) + clé d'affichage (MAJUSCULE) + couleur ──
export interface GasField { key: keyof Measure; u: string; color: string; }
export const GAS_FIELDS: GasField[] = [
  { key: 'h2', u: 'H2', color: '#e63946' },
  { key: 'c2h2', u: 'C2H2', color: '#9d0208' },
  { key: 'c2h6', u: 'C2H6', color: '#90be6d' },
  { key: 'c2h4', u: 'C2H4', color: '#f3722c' },
  { key: 'ch4', u: 'CH4', color: '#f9c74f' },
  { key: 'co', u: 'CO', color: '#577590' },
  { key: 'co2', u: 'CO2', color: '#277da1' },
  { key: 'n2', u: 'N2', color: '#999' },
  { key: 'o2', u: 'O2', color: '#aaa' },
];
// Gaz combustibles tracés dans le graphe d'évolution (clés de mesure).
export const COMBUSTIBLE: (keyof Measure)[] = ['h2', 'c2h2', 'c2h4', 'ch4', 'c2h6', 'co'];
// Ordre des lignes du tableau IEEE (clé de mesure ; tdcg en fin).
export const IEEE_ROWS: { key: keyof Measure | 'tdcg'; u: string }[] = [
  { key: 'h2', u: 'H2' }, { key: 'ch4', u: 'CH4' }, { key: 'c2h2', u: 'C2H2' }, { key: 'c2h4', u: 'C2H4' },
  { key: 'c2h6', u: 'C2H6' }, { key: 'co', u: 'CO' }, { key: 'co2', u: 'CO2' }, { key: 'tdcg', u: 'TDCG' },
];

// ── Paramètres qualité d'huile (15) — clés = clés dans oil_quality (jsonb) ──
export interface OilField { key: string; label: string; en: string; method: string; text?: boolean; }
export const OIL_FIELDS: OilField[] = [
  { key: 'moisture', label: "Humidité dans l'huile (ppm)", en: 'Moisture in oil (ppm)', method: 'D1533-20' },
  { key: 'relSat', label: 'Saturation relative (%)', en: 'Relative saturation (%)', method: '—' },
  { key: 'ift', label: 'Tension interfaciale (mN/m)', en: 'Interfacial tension (mN/m)', method: 'D971-20' },
  { key: 'acid', label: "Indice d'acidité (mg KOH/g)", en: 'Acid number (mg KOH/g)', method: 'D974-14e2' },
  { key: 'color', label: 'Couleur (ASTM)', en: 'Color number (ASTM)', method: 'D1500-12' },
  { key: 'visual', label: 'Examen visuel', en: 'Visual examination', method: 'D1524-15', text: true },
  { key: 'dbd877', label: 'Rigidité diélectrique (kV)', en: 'Dielectric breakdown (kV)', method: 'D877M-19' },
  { key: 'dielectric', label: 'Rigidité diélectrique 2mm (kV)', en: 'Dielectric breakdown 2mm (kV)', method: 'D1816-19' },
  { key: 'pf25', label: 'Facteur de puissance @ 25°C (%)', en: 'Power factor @ 25°C (%)', method: 'D924-15' },
  { key: 'pf100', label: 'Facteur de puissance @100°C (%)', en: 'Power factor @100°C (%)', method: 'D924-15' },
  { key: 'sg', label: 'Densité (specific gravity)', en: 'Specific gravity', method: 'D1298-12b' },
  { key: 'dbp', label: 'Inhibiteur DBP (wt. %)', en: 'Oxidation inhibitor DBP (wt. %)', method: 'D4768-11' },
  { key: 'dbpc', label: 'Inhibiteur DBPC (wt. %)', en: 'Oxidation inhibitor DBPC (wt.%)', method: 'D4768-11' },
  { key: 'pcb', label: 'PCB - Arochlor total (ppm)', en: 'PCB - Total Arochlor (ppm)', method: 'D4059-2018' },
  { key: 'corrS', label: 'Soufre corrosif (cuivre)', en: 'Corrosive sulphur (copper)', method: 'D1275-15', text: true },
];

// ── Furanes (5) — ppb — clés dans oil_quality (jsonb) ──
export const FURAN_FIELDS: OilField[] = [
  { key: 'f_5hmf', label: '5-hydroxyméthyl-2-furaldéhyde', en: '5-hydroxymethyl-2-furaldehyde', method: 'D5837-15' },
  { key: 'f_ffa', label: 'Furfuryl alcohol', en: 'Furfuryl alcohol', method: 'D5837-15' },
  { key: 'f_2fal', label: '2-furaldéhyde (2-FAL)', en: '2-furaldehyde (2-FAL)', method: 'D5837-15' },
  { key: 'f_2acf', label: '2-acétylfuran', en: '2-acetylfuran', method: 'D5837-15' },
  { key: 'f_5mef', label: '5-méthyl-2-furaldéhyde', en: '5-methyl-2-furaldehyde', method: 'D5837-15' },
];
export const fl = (f: OilField, lang: Lang = 'fr') => (lang === 'en' && f.en ? f.en : f.label);

// ── IEEE C57.104-2019 : [C1<=, C2<=, C3<=] sinon C4. ieeeCondition -> index 0..3. ──
export const IEEE_LIMITS: Record<string, [number, number, number]> = {
  h2: [100, 700, 1800], ch4: [120, 400, 1000], c2h2: [1, 9, 35],
  c2h4: [50, 100, 200], c2h6: [65, 100, 150], co: [350, 570, 1400],
  co2: [2500, 4000, 10000], tdcg: [720, 1920, 4630],
};
export const COND_LABELS = ['Condition 1', 'Condition 2', 'Condition 3', 'Condition 4'];
export const COND_COLORS = ['#2a9d8f', '#e9c46a', '#f4a261', '#e63946'];
export function ieeeCondition(key: string, v: any): number | null {
  const l = IEEE_LIMITS[key]; if (!l) return null;
  const n = Number(v) || 0;
  if (n <= l[0]) return 0; if (n <= l[1]) return 1; if (n <= l[2]) return 2; return 3;
}
// Pire condition (index 0..3) sur une mesure — gaz combustibles + TDCG (CO2 exclu, comme le prototype).
export const WORST_KEYS = ['h2', 'ch4', 'c2h2', 'c2h4', 'c2h6', 'co', 'tdcg'];
export function worstCondition(m: Measure | null | undefined): number {
  if (!m) return 0;
  return Math.max(...WORST_KEYS.map(k => ieeeCondition(k, (m as any)[k]) ?? 0));
}

// ── Ratios de Rogers (forme objet, pour l'affichage en 4 cases — identique au prototype) ──
export function rogersRatios(m: Measure): Record<string, number> {
  const s = (n: number, dn: number) => (dn === 0 ? 0 : n / dn);
  const CH4 = +(m.ch4 || 0), H2 = +(m.h2 || 0), C2H2 = +(m.c2h2 || 0), C2H4 = +(m.c2h4 || 0), C2H6 = +(m.c2h6 || 0);
  return { 'CH₄/H₂': s(CH4, H2), 'C₂H₂/C₂H₄': s(C2H2, C2H4), 'C₂H₄/C₂H₆': s(C2H4, C2H6), 'C₂H₂/CH₄': s(C2H2, CH4) };
}

// ── Parsing de valeur de labo : « <1 » / « <5 » => moitié du seuil ; vide => null ──
export function parseNum(raw: any): number | null {
  let v = String(raw ?? '').trim().replace(',', '.');
  if (v === '') return null;
  if (v.startsWith('<')) { const n = parseFloat(v.replace(/[^0-9.]/g, '')); return isNaN(n) ? 0.5 : n / 2; }
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}
// Lecture numérique souple (pour les graphiques / Δ%).
export const numOrNull = (v: any) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v));

// Date de reprise effective : override manuel (extra.next_date_manual) sinon auto selon la pire
// condition de la dernière mesure (identique à effectiveNextDate du prototype).
export function effectiveNextDate(extra: any, lastMeasure?: Measure | null): string | null {
  if (extra?.next_date_manual) return extra.next_date_manual;
  if (!lastMeasure) return null;
  return autoNextDate(lastMeasure.sample_date, worstCondition(lastMeasure));
}
