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
export const PENTAGON_AXIS_MAX = 40; // unité d'axe max (= 100 % d'un gaz)

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
export function pentagonPoint(g: PentaGases): { x: number; y: number; hemisphere: 'nord' | 'sud' } | null {
  const sum = PENTAGON_ORDER.reduce((s, k) => s + Math.max(0, Number(g[k]) || 0), 0);
  if (sum <= 0) return null;
  const pts: [number, number][] = PENTAGON_ORDER.map(k => {
    const pct = Math.max(0, Number(g[k]) || 0) / sum;          // fraction 0..1
    const [vx, vy] = PENTAGON_VERTICES[k];
    return [vx * pct, vy * pct];
  });
  const [x, y] = polygonCentroid(pts);
  // hémisphère NORD (y>0) = tendance électrique (H2/C2H2/C2H6) ; SUD (y<0) = thermique (CH4/C2H4). Indicatif.
  return { x, y, hemisphere: y >= 0 ? 'nord' : 'sud' };
}
