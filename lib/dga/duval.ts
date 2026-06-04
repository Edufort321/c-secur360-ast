// ============================================================================
// TRIANGLE DE DUVAL 1 (huile minérale) — moteur rigoureux.
//
// SOURCES des frontières de zones :
//   - M. Duval, "A review of faults detectable by gas-in-oil analysis in
//     transformers", IEEE Electrical Insulation Magazine, 2002.
//   - IEC 60599 (interprétation des gaz dissous) ; IEEE C57.104-2019, annexe Duval.
//   Les frontières sont définies par les droites %CH4=98 ; %C2H4=20 et 50 ;
//   %C2H2=4 et 13 ; %C2H4=23 et 40 ; %C2H2=29. Les coordonnées exactes des
//   sommets varient légèrement selon les implémentations — À VÉRIFIER contre la
//   source faisant autorité (le réviseur l'a explicitement demandé).
//
// Représentation : chaque zone est un polygone dans le plan (%C2H2, %C2H4) ;
// %CH4 = 100 - %C2H2 - %C2H4 est implicite. La détection se fait par
// point-dans-polygone (ray casting) en priorité PD>T1>T2>T3>D1>D2>DT.
// ============================================================================

export type DuvalZone = 'PD' | 'T1' | 'T2' | 'T3' | 'D1' | 'D2' | 'DT';

// Sommets en [%C2H2, %C2H4]. (Ordre des zones = ordre de test.)
export const DUVAL1_ZONES: { code: DuvalZone; poly: [number, number][] }[] = [
  { code: 'PD', poly: [[0, 0], [2, 0], [0, 2]] },                                  // %CH4 >= 98
  { code: 'T1', poly: [[2, 0], [4, 20], [0, 20], [0, 2]] },                        // %C2H2<4, %C2H4<20
  { code: 'T2', poly: [[0, 20], [4, 20], [4, 50], [0, 50]] },                      // %C2H4 20-50
  { code: 'T3', poly: [[0, 50], [4, 50], [15, 85], [0, 100]] },                    // %C2H4 >= 50
  { code: 'D1', poly: [[13, 0], [100, 0], [77, 23], [13, 23]] },                   // %C2H2>=13, %C2H4<=23
  { code: 'D2', poly: [[13, 23], [77, 23], [71, 29], [29, 40], [13, 40]] },        // %C2H2 fort, %C2H4 23-40
  { code: 'DT', poly: [[4, 20], [13, 23], [13, 40], [29, 40], [15, 85], [4, 50]] },// zone mixte centrale
];

export const ZONE_COLOR: Record<DuvalZone, string> = {
  PD: '#60a5fa', T1: '#fde047', T2: '#fbbf24', T3: '#f97316', D1: '#f87171', D2: '#dc2626', DT: '#c084fc',
};
export const ZONE_LABEL: Record<DuvalZone, { fr: string; en: string }> = {
  PD: { fr: 'Décharges partielles', en: 'Partial discharge' },
  T1: { fr: 'Thermique < 300 °C', en: 'Thermal < 300 °C' },
  T2: { fr: 'Thermique 300-700 °C', en: 'Thermal 300-700 °C' },
  T3: { fr: 'Thermique > 700 °C', en: 'Thermal > 700 °C' },
  D1: { fr: 'Décharges faible énergie', en: 'Low-energy discharge' },
  D2: { fr: 'Décharges forte énergie (arc)', en: 'High-energy discharge (arc)' },
  DT: { fr: 'Mélange thermique/électrique', en: 'Thermal + electrical mix' },
};

// Seuil de gaz de défaut (somme CH4+C2H2+C2H4, ppm) sous lequel la méthode n'est
// pas appliquée. IEC 60599 recommande de ne classer qu'au-dessus des valeurs
// typiques ; ce seuil est paramétrable (défaut bas pour permettre la classification).
export const DUVAL_MIN_PPM = 1;

export interface DuvalResult { zone: DuvalZone | null; insufficient: boolean; pct: { ch4: number; c2h2: number; c2h4: number }; }

// Pourcentages relatifs.
export function duvalPercents(ch4: number, c2h2: number, c2h4: number) {
  const t = (ch4 || 0) + (c2h2 || 0) + (c2h4 || 0);
  if (t <= 0) return { ch4: 0, c2h2: 0, c2h4: 0, total: 0 };
  return { ch4: (100 * ch4) / t, c2h2: (100 * c2h2) / t, c2h4: (100 * c2h4) / t, total: t };
}

// Point-dans-polygone (ray casting) dans le plan (%C2H2, %C2H4).
function inPoly(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function classifyDuval1(ch4: number, c2h2: number, c2h4: number, minPpm = DUVAL_MIN_PPM): DuvalResult {
  const p = duvalPercents(ch4, c2h2, c2h4);
  if (p.total < minPpm) return { zone: null, insufficient: true, pct: { ch4: p.ch4, c2h2: p.c2h2, c2h4: p.c2h4 } };
  const x = p.c2h2, y = p.c2h4;
  for (const z of DUVAL1_ZONES) if (inPoly(x, y, z.poly)) return { zone: z.code, insufficient: false, pct: { ch4: p.ch4, c2h2: p.c2h2, c2h4: p.c2h4 } };
  // Repli : zone la plus proche (centroïde) si le point tombe sur une frontière/un trou.
  let best: DuvalZone = 'DT', bestD = Infinity;
  for (const z of DUVAL1_ZONES) {
    const cx = z.poly.reduce((s, q) => s + q[0], 0) / z.poly.length;
    const cy = z.poly.reduce((s, q) => s + q[1], 0) / z.poly.length;
    const dd = (cx - x) ** 2 + (cy - y) ** 2; if (dd < bestD) { bestD = dd; best = z.code; }
  }
  return { zone: best, insufficient: false, pct: { ch4: p.ch4, c2h2: p.c2h2, c2h4: p.c2h4 } };
}

// Conversion barycentrique (%CH4 sommet haut, %C2H2 bas-gauche, %C2H4 bas-droite)
// vers cartésien dans un triangle équilatéral de côté `side`, origine en haut-gauche
// du cadre, avec marge `pad`. Retourne {x,y} en unités SVG.
export function baryToCartesian(pctC2h2: number, pctC2h4: number, side: number, pad: number) {
  const pctCh4 = 100 - pctC2h2 - pctC2h4;
  const h = (Math.sqrt(3) / 2) * side;
  const top = { x: pad + side / 2, y: pad };
  const bl = { x: pad, y: pad + h };
  const br = { x: pad + side, y: pad + h };
  return {
    x: (pctCh4 / 100) * top.x + (pctC2h2 / 100) * bl.x + (pctC2h4 / 100) * br.x,
    y: (pctCh4 / 100) * top.y + (pctC2h2 / 100) * bl.y + (pctC2h4 / 100) * br.y,
  };
}
