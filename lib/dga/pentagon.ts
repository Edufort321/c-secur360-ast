// Pentagone de Duval (B1) — calculs PURS, testables.
// SOMMETS PUBLICS & EXACTS (Duval 2014) : coordonnées (x,y) des axes à 100 % (échelle limitée à 40 unités —
// même un gaz à 100 % / les autres à 0 % ne dépasse pas 40 sur l'axe). Le CENTROÏDE du pentagone des 5 % de gaz
// est le point de diagnostic (formule de l'aire signée). Sommets et centroïde = exacts, codables sans deviner.
//
// ⚠️ Les FRONTIÈRES INTERNES des zones (PD/S/D1/D2/T1/T2/T3) ne sont PAS reproduites au pixel dans les sources
// gratuites (Duval 2014 IEEE EIM / « Combined Duval Pentagons », Energies 2020 = partiellement). On TRACE donc
// le point (exact, utile) mais la classification de zone reste « PRÉLIMINAIRE — frontières à valider ».
// Pentagone 2 = mêmes zones PD/S/D1/D2 que le Pentagone 1 ; ne diffère que dans l'hémisphère thermique sud.

export type PentaGasKey = 'H2' | 'C2H6' | 'CH4' | 'C2H4' | 'C2H2';
export type PentaGases = Partial<Record<PentaGasKey, number>>;

// Sommets à 100 % (ordre anti-horaire pour le polygone). Source : Duval 2014.
export const PENTAGON_VERTICES: Record<PentaGasKey, [number, number]> = {
  H2: [0, 40], C2H6: [-38, 12.4], CH4: [-23.5, -32.4], C2H4: [23.5, -32.4], C2H2: [38, 12.4],
};
export const PENTAGON_ORDER: PentaGasKey[] = ['H2', 'C2H6', 'CH4', 'C2H4', 'C2H2'];
export const PENTAGON_AXIS_MAX = 40; // unité d'axe max (= 100 % d'un gaz) — DESSIN seulement

// Angles officiels (Cheim, Duval & Haider, Energies 2020, 13, 2859) — sens ANTIHORAIRE H2→C2H6→CH4→C2H4→C2H2.
export const GAS_ANGLE_DEG: Record<PentaGasKey, number> = { H2: 90, C2H6: 162, CH4: 234, C2H4: 306, C2H2: 18 };
// Vecteurs UNITAIRES de chaque axe — pour le CALCUL du centroïde (projection du %, 0..100), PAS le dessin.
export const GAS_UNIT: Record<PentaGasKey, [number, number]> = PENTAGON_ORDER.reduce((acc, g) => {
  const a = (GAS_ANGLE_DEG[g] * Math.PI) / 180; acc[g] = [Math.cos(a), Math.sin(a)]; return acc;
}, {} as Record<PentaGasKey, [number, number]>);
// Le centroïde officiel vit dans le repère « % » (sommets à distance 100). Le dessin utilise R=40 → ×0.4.
export const PENTAGON_DRAW_SCALE = PENTAGON_AXIS_MAX / 100; // 0.4

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Centroïde (aire signée) d'un polygone fermé. Repli = moyenne des sommets si aire ≈ 0. */
export function polygonCentroid(pts: [number, number][]): [number, number] {
  const n = pts.length;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    const cross = x0 * y1 - x1 * y0;
    a += cross; cx += (x0 + x1) * cross; cy += (y0 + y1) * cross;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-9) { const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n; return [r2(mx), r2(my)]; }
  return [r2(cx / (6 * a)), r2(cy / (6 * a))];
}

/** Point de diagnostic du pentagone : centroïde du polygone des 5 gaz (en % relatif). null si pas de gaz. */
// Centroïde OFFICIEL (Cheim, Duval & Haider 2020) : chaque gaz projeté à une distance = son POURCENTAGE
// (0..100) sur son axe UNITAIRE (cos,sin) ; le centroïde du polygone (aire signée) est le point de
// diagnostic. ⚠️ Repère « % » (sommets à distance 100) — pour le DESSIN, multiplier par PENTAGON_DRAW_SCALE.
// Validé numériquement contre la Figure 1 du papier : (50,120,30,60,80) → (−7.36, −5.80).
export function pentagonPoint(g: PentaGases): { x: number; y: number; hemisphere: 'nord' | 'sud' } | null {
  const sum = PENTAGON_ORDER.reduce((s, k) => s + Math.max(0, Number(g[k]) || 0), 0);
  if (sum <= 0) return null;
  const pts: [number, number][] = PENTAGON_ORDER.map(k => {
    const pct = (100 * Math.max(0, Number(g[k]) || 0)) / sum;  // pourcentage 0..100
    const [ux, uy] = GAS_UNIT[k];
    return [ux * pct, uy * pct];
  });
  const [x, y] = polygonCentroid(pts);
  // hémisphère NORD (y>0) = tendance électrique (H2/C2H2/C2H6) ; SUD (y<0) = thermique (CH4/C2H4). Indicatif.
  return { x, y, hemisphere: y >= 0 ? 'nord' : 'sud' };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════
// PENTAGONE COMBINÉ — 10 zones (Cheim & Duval, « Combined Duval Pentagons », Energies 2020, 13, 2859).
// RÉUTILISE la géométrie + le centroïde + les % ci-dessus (PAS de recalcul dupliqué). ⚠️ Les FRONTIÈRES
// internes (ZONE_POLYGONS) sont reconstruites (// TODO-VERIFY) → tant que BOUNDARIES_VALIDATED=false :
// bandeau « frontières à valider » + export PDF du diagnostic désactivé. À confronter aux Fig. 6–9 par
// un ingénieur avant production. Versionné (PENTAGON_BOUNDARY_VERSION) pour la traçabilité des diagnostics.
// ════════════════════════════════════════════════════════════════════════════════════════════════════

export const BOUNDARIES_VALIDATED = false;                    // ← lever à true après validation ingénieur
export const PENTAGON_BOUNDARY_VERSION = 'cheim-duval-2020-draft-3';
export const BOUNDARY_TOL = 0.8;                              // proximité frontière → prudence (≈2 % de R=40)

export type ZoneCode = 'PD' | 'S' | 'D1' | 'D2' | 'T1-O' | 'T1-C' | 'T2-O' | 'T2-C' | 'T3-C' | 'T3-H';
export type Pt = { x: number; y: number };
export type ZoneDef = { code: ZoneCode; labelFr: string; labelEn: string; polygon: Pt[] };

// Polygones des zones — MÊME repère que PENTAGON_VERTICES (origine au centre, y vers le haut). PARTITION
// COHÉRENTE & CONTENUE (chaque zone = secteur centre→arc du périmètre, donc strictement à l'intérieur de
// l'enveloppe, aucun débordement). Placement RÉGIONAL correct : PD/S en haut, D2 côté C₂H₂ (haut-droite),
// D1 côté CH₄ (bas-gauche), zones thermiques T1→T3 vers C₂H₄ (bas-droite) avec T3 (rouge) adjacent à C₂H₄.
// ⚠️ Les FORMES exactes restent // TODO-VERIFY (Cheim & Duval 2020 Fig. 6–9) : ceci est un PLACEHOLDER
// régional cohérent tant que BOUNDARIES_VALIDATED=false (verdict provisoire). Sommets périmètre + milieux :
//   H2(0,40) C2H2(38,12.4) C2H4(23.5,-32.4) CH4(-23.5,-32.4) C2H6(-38,12.4) ; O=(0,0).
export const ZONE_POLYGONS: ZoneDef[] = [
  // — Haut / électrique / parasite (secteurs centre→arc) —
  { code: 'PD', labelFr: 'Décharges partielles', labelEn: 'Partial discharges', polygon: [{ x: 0, y: 0 }, { x: -19, y: 26.2 }, { x: 0, y: 40 }, { x: 19, y: 26.2 }] },
  { code: 'D2', labelFr: 'Décharges de haute énergie', labelEn: 'High-energy discharges', polygon: [{ x: 0, y: 0 }, { x: 19, y: 26.2 }, { x: 38, y: 12.4 }, { x: 30.75, y: -10 }] }, // côté C2H2 (test : C2H2 → D)
  { code: 'S', labelFr: 'Dégazage parasite (stray gassing)', labelEn: 'Stray gassing', polygon: [{ x: 0, y: 0 }, { x: -30.75, y: -10 }, { x: -38, y: 12.4 }, { x: -19, y: 26.2 }] }, // côté C2H6 (haut-gauche)
  { code: 'D1', labelFr: 'Décharges de faible énergie', labelEn: 'Low-energy discharges', polygon: [{ x: 0, y: 0 }, { x: 0, y: -32.4 }, { x: -23.5, y: -32.4 }, { x: -30.75, y: -10 }] }, // côté CH4 (bas-gauche)
  // — Région thermique (bas-droite, vers C2H4) : T1→T3, T3 adjacent à C2H4 —
  { code: 'T1-O', labelFr: 'Surchauffe < 300 °C sans carbonisation', labelEn: 'Overheating < 300 °C, no carbonization', polygon: [{ x: 0, y: 0 }, { x: 0, y: -32.4 }, { x: 7.83, y: -32.4 }] },
  { code: 'T2-O', labelFr: 'Surchauffe 300–700 °C sans carbonisation', labelEn: 'Overheating 300–700 °C, no carbonization', polygon: [{ x: 0, y: 0 }, { x: 7.83, y: -32.4 }, { x: 15.67, y: -32.4 }] },
  { code: 'T3-C', labelFr: 'Surchauffe > 700 °C avec carbonisation', labelEn: 'Overheating > 700 °C, carbonization', polygon: [{ x: 0, y: 0 }, { x: 15.67, y: -32.4 }, { x: 23.5, y: -32.4 }] }, // adjacent C2H4
  { code: 'T3-H', labelFr: 'Surchauffe > 700 °C (huile seulement)', labelEn: 'Overheating > 700 °C, oil only', polygon: [{ x: 0, y: 0 }, { x: 23.5, y: -32.4 }, { x: 25.9, y: -25 }] }, // adjacent C2H4
  { code: 'T2-C', labelFr: 'Surchauffe 300–700 °C avec carbonisation', labelEn: 'Overheating 300–700 °C, carbonization', polygon: [{ x: 0, y: 0 }, { x: 25.9, y: -25 }, { x: 28.3, y: -17.5 }] },
  { code: 'T1-C', labelFr: 'Surchauffe < 300 °C avec carbonisation', labelEn: 'Overheating < 300 °C, carbonization', polygon: [{ x: 0, y: 0 }, { x: 28.3, y: -17.5 }, { x: 30.75, y: -10 }] },
];

export function pointInPolygon(pt: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if (yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function distToSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy;
  let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function distToPolygon(p: Pt, poly: Pt[]): number {
  let m = Infinity; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) m = Math.min(m, distToSeg(p, poly[j], poly[i])); return m;
}

// Garde-fou C57.104-2019 : sous ces minima (Tableau 1), ne pas diagnostiquer (gaz de fond). // TODO-VERIFY
export const C57104_TABLE1_MIN: Record<PentaGasKey, number> = { H2: 80, CH4: 90, C2H6: 90, C2H4: 50, C2H2: 1 };
export function guardGasLevels(g: PentaGases): { ok: boolean; reason?: string } {
  const allBelow = PENTAGON_ORDER.every(k => (Number(g[k]) || 0) < C57104_TABLE1_MIN[k]);
  return allBelow ? { ok: false, reason: 'Tous les gaz sont sous les seuils du Tableau 1 (C57.104-2019) : diagnostic non recommandé.' } : { ok: true };
}

export type DuvalResult = {
  centroid: Pt; zone: ZoneCode | null; labelFr: string | null; labelEn: string | null;
  onBoundary: boolean; guard: { ok: boolean; reason?: string }; percentages: Record<PentaGasKey, number>;
  validated: boolean; boundaryVersion: string;
};

/** Classification combinée : centroïde (réutilisé) → zone (point-dans-polygone) → diagnostic. */
export function classifyDuval(g: PentaGases): DuvalResult | null {
  const pt = pentagonPoint(g); if (!pt) return null;
  const sum = PENTAGON_ORDER.reduce((s, k) => s + Math.max(0, Number(g[k]) || 0), 0) || 1;
  const percentages = PENTAGON_ORDER.reduce((acc, k) => { acc[k] = r2((Math.max(0, Number(g[k]) || 0) / sum) * 100); return acc; }, {} as Record<PentaGasKey, number>);
  const centroid: Pt = { x: pt.x, y: pt.y };                    // OFFICIEL (repère %) — affichage + tests
  const draw: Pt = { x: pt.x * PENTAGON_DRAW_SCALE, y: pt.y * PENTAGON_DRAW_SCALE }; // repère R=40 des zones
  let found: ZoneDef | null = ZONE_POLYGONS.find(z => pointInPolygon(draw, z.polygon)) || null;
  if (!found) { let bestD = Infinity; for (const z of ZONE_POLYGONS) { const d = distToPolygon(draw, z.polygon); if (d < bestD) { bestD = d; found = z; } } }
  const onBoundary = found != null && distToPolygon(draw, found.polygon) < BOUNDARY_TOL;
  return { centroid, zone: found?.code ?? null, labelFr: found?.labelFr ?? null, labelEn: found?.labelEn ?? null, onBoundary, guard: guardGasLevels(g), percentages, validated: BOUNDARIES_VALIDATED, boundaryVersion: PENTAGON_BOUNDARY_VERSION };
}
