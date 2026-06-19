// Triangle de Duval 4 — RAFFINEMENT des défauts BASSE température / faible énergie (PD, T1, T2).
// ⚠️ NE s'applique PAS aux défauts électriques (D1/D2) ni T3 → utiliser seulement quand Triangle 1
// conclut à PD, T1 ou T2 (gate `appliesToT1`). Gaz : H2, CH4, C2H6 (les gaz « basse énergie »).
// Distingue : PD (décharges partielles) · S (gazage parasite de l'huile / « stray gassing ») ·
// O (surchauffe < 250 °C) · C (point chaud avec carbonisation possible du papier).
//
// Convention sommets : H2 (haut), C2H6 (bas-gauche), CH4 (bas-droite).
// Frontières : valeurs publiées (Duval/Lapworth ; corroborées C2H6=1/24, CH4=2/15/36, H2=9).
// PLACEHOLDER tant que non confirmées contre la norme officielle → `placeholder:true` + surchargeables
// via les Normes de référence (company_settings.reference_standards.dga_t4_bounds). À VALIDER par une
// personne qualifiée avant de retirer la mention « à valider ».

import type { Fault as T1Fault } from './triangle1';

// Géométrie (mêmes dimensions que triangle1 pour un rendu homogène)
export const TOP = { x: 200, y: 24 };    // H2
export const LEFT = { x: 24, y: 320 };   // C2H6
export const RIGHT = { x: 376, y: 320 }; // CH4

export type Gases4 = { H2: number; CH4: number; C2H6: number };
export type Pct4 = { h2: number; c2h6: number; ch4: number };
export type Fault4 = 'PD' | 'S' | 'O' | 'C';

// Frontières surchargeables (en % des 3 gaz). Valeurs publiées par défaut, marquées à valider.
export type T4Bounds = { c2h6_pd: number; ch4_pd: number; ch4_c: number; c2h6_o: number; h2_o: number };
export const DEFAULT_T4_BOUNDS: T4Bounds = { c2h6_pd: 1, ch4_pd: 15, ch4_c: 36, c2h6_o: 24, h2_o: 9 };
let T4_BOUNDS: T4Bounds = { ...DEFAULT_T4_BOUNDS };
let T4_VALIDATED = false;
export function setT4Bounds(b?: Partial<T4Bounds> | null, validated = false) {
  T4_BOUNDS = { ...DEFAULT_T4_BOUNDS, ...(b || {}) };
  T4_VALIDATED = !!validated;
}
export function t4Validated() { return T4_VALIDATED; }

export const FAULT4_STYLE: Record<Fault4, { fill: string; text: string; label: string; labelEn: string }> = {
  PD: { fill: '#B5D4F4', text: '#0C447C', label: 'Décharges partielles', labelEn: 'Partial discharges' },
  S:  { fill: '#FAD46B', text: '#5A4106', label: 'Gazage parasite de l’huile', labelEn: 'Stray gassing of oil' },
  O:  { fill: '#EF9F27', text: '#633806', label: 'Surchauffe < 250 °C', labelEn: 'Overheating < 250 °C' },
  C:  { fill: '#9C5A33', text: '#FFF', label: 'Carbonisation possible du papier', labelEn: 'Possible paper carbonization' },
};

// Triangle 4 ne s'utilise QUE pour un défaut basse-T/faible énergie issu du Triangle 1.
export function appliesToT1(f: T1Fault | null | undefined): boolean {
  return f === 'PD' || f === 'T1' || f === 'T2';
}

export function toPct4({ H2, CH4, C2H6 }: Gases4): Pct4 | null {
  const t = H2 + CH4 + C2H6;
  if (t <= 0) return null;
  return { h2: (H2 / t) * 100, c2h6: (C2H6 / t) * 100, ch4: (CH4 / t) * 100 };
}

// Classification par RÈGLES (du plus spécifique au résiduel). Frontières = T4_BOUNDS (surchargeables).
export function classifyPct4({ h2, c2h6, ch4 }: Pct4): Fault4 {
  const b = T4_BOUNDS;
  if (ch4 <= b.ch4_pd && c2h6 <= b.c2h6_pd) return 'PD';   // sliver haut-H2 / bas-CH4 / bas-C2H6
  if (ch4 > b.ch4_c) return 'C';                            // CH4 élevé → carbonisation papier
  if (c2h6 > b.c2h6_o && h2 < b.h2_o) return 'O';           // C2H6 élevé + H2 faible → surchauffe
  return 'S';                                               // résiduel → gazage parasite
}

export function pctToXY4({ h2, c2h6, ch4 }: Pct4) {
  const a = h2 / 100, b = c2h6 / 100, c = ch4 / 100;
  return { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
}

// Classification depuis ppm. `placeholder` = vrai tant que les frontières ne sont pas validées.
export function classifyTriangle4(g: Gases4): { fault: Fault4; label: string; labelEn: string; placeholder: boolean } | null {
  const p = toPct4(g); if (!p) return null;
  const f = classifyPct4(p);
  const s = FAULT4_STYLE[f];
  return { fault: f, label: s.label, labelEn: s.labelEn, placeholder: !T4_VALIDATED };
}
