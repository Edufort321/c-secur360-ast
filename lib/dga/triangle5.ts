// Triangle de Duval 5 — RAFFINEMENT des défauts THERMIQUES HAUTE température (T2, T3). Gaz CH4/C2H4/C2H6.
// ROUTAGE (confirmé par Eric/recherche) : Triangle 1 → si T2/T3 → Triangle 5 ; JAMAIS sur D1/D2 (électrique)
// ni sur PD/T1/O/S (→ Triangle 4). Distingue : PD (corona) · S (stray gassing) · O (surchauffe) ·
// C (carbonisation du papier) · T3 (> 700 °C).
//
// ⚠️ SQUELETTE : les coordonnées des frontières (T5_BOUNDS / classifyPct5) sont des PLACEHOLDERS
// `// TODO-VERIFY` — les valeurs chiffrées vivent dans les publications de Duval (IEEE EIM / primer H-J),
// non reproduites en clair dans les sources gratuites. `T5_VALIDATED=false` tant qu'un ingénieur n'a pas
// confronté ces frontières à la source primaire. Surchargeables via les Normes de référence (comme T4).

import type { Fault as T1Fault } from './triangle1';

// Géométrie ternaire (mêmes dimensions que triangle1/4 pour un rendu homogène). Convention TODO-VERIFY :
// CH4 (haut), C2H6 (bas-gauche), C2H4 (bas-droite).
export const TOP = { x: 200, y: 24 };    // CH4
export const LEFT = { x: 24, y: 320 };   // C2H6
export const RIGHT = { x: 376, y: 320 }; // C2H4

export type Gases5 = { CH4: number; C2H4: number; C2H6: number };
export type Pct5 = { ch4: number; c2h6: number; c2h4: number };
export type Fault5 = 'PD' | 'S' | 'O' | 'C' | 'T3';

// Frontières surchargeables (en % des 3 gaz). PLACEHOLDERS // TODO-VERIFY (Duval EIM / primer H-J).
export type T5Bounds = { c2h4_t3: number; c2h4_o: number; c2h6_s: number; ch4_pd: number };
export const DEFAULT_T5_BOUNDS: T5Bounds = { c2h4_t3: 50, c2h4_o: 20, c2h6_s: 50, ch4_pd: 80 }; // TODO-VERIFY
let T5_BOUNDS: T5Bounds = { ...DEFAULT_T5_BOUNDS };
let T5_VALIDATED = false;
export function setT5Bounds(b?: Partial<T5Bounds> | null, validated = false) {
  T5_BOUNDS = { ...DEFAULT_T5_BOUNDS, ...(b || {}) };
  T5_VALIDATED = !!validated;
}
export function t5Validated() { return T5_VALIDATED; }

export const FAULT5_STYLE: Record<Fault5, { fill: string; text: string; label: string; labelEn: string }> = {
  PD: { fill: '#B5D4F4', text: '#0C447C', label: 'Décharges partielles (corona)', labelEn: 'Partial discharges (corona)' },
  S:  { fill: '#FAD46B', text: '#5A4106', label: 'Gazage parasite de l’huile', labelEn: 'Stray gassing of oil' },
  O:  { fill: '#EF9F27', text: '#633806', label: 'Surchauffe', labelEn: 'Overheating' },
  C:  { fill: '#9C5A33', text: '#FFF', label: 'Carbonisation du papier', labelEn: 'Paper carbonization' },
  T3: { fill: '#D85A30', text: '#4A1B0C', label: 'Surchauffe > 700 °C', labelEn: 'Overheating > 700 °C' },
};

// Triangle 5 ne s'utilise QUE pour un défaut thermique HAUTE température (T2/T3) issu du Triangle 1.
export function appliesToT1(f: T1Fault | null | undefined): boolean {
  return f === 'T2' || f === 'T3';
}

export function toPct5({ CH4, C2H4, C2H6 }: Gases5): Pct5 | null {
  const t = CH4 + C2H4 + C2H6;
  if (t <= 0) return null;
  return { ch4: (CH4 / t) * 100, c2h6: (C2H6 / t) * 100, c2h4: (C2H4 / t) * 100 };
}

// Classification par RÈGLES — PLACEHOLDER // TODO-VERIFY (à remplacer par les vraies frontières Duval).
export function classifyPct5({ ch4, c2h6, c2h4 }: Pct5): Fault5 {
  const b = T5_BOUNDS;
  if (ch4 >= b.ch4_pd) return 'PD';            // CH4 très dominant → corona  // TODO-VERIFY
  if (c2h6 >= b.c2h6_s) return 'S';            // C2H6 élevé → gazage parasite // TODO-VERIFY
  if (c2h4 >= b.c2h4_t3) return 'T3';          // C2H4 élevé → > 700 °C        // TODO-VERIFY
  if (c2h4 >= b.c2h4_o) return 'O';            // C2H4 intermédiaire → surchauffe // TODO-VERIFY
  return 'C';                                  // résiduel → carbonisation papier // TODO-VERIFY
}

export function pctToXY5({ ch4, c2h6, c2h4 }: Pct5) {
  const a = ch4 / 100, b = c2h6 / 100, c = c2h4 / 100;
  return { x: a * TOP.x + b * LEFT.x + c * RIGHT.x, y: a * TOP.y + b * LEFT.y + c * RIGHT.y };
}

// Classification depuis ppm. `placeholder` = vrai tant que les frontières ne sont pas validées.
export function classifyTriangle5(g: Gases5): { fault: Fault5; label: string; labelEn: string; placeholder: boolean } | null {
  const p = toPct5(g); if (!p) return null;
  const f = classifyPct5(p);
  const s = FAULT5_STYLE[f];
  return { fault: f, label: s.label, labelEn: s.labelEn, placeholder: !T5_VALIDATED };
}
