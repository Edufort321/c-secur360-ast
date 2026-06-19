import { describe, it, expect } from 'vitest';
import { polygonCentroid, pentagonPoint, PENTAGON_VERTICES } from './pentagon';

describe('Pentagone de Duval — sommets + centroïde', () => {
  it('sommets publics exacts (rayon ≈ 40)', () => {
    for (const k of Object.keys(PENTAGON_VERTICES) as (keyof typeof PENTAGON_VERTICES)[]) {
      const [x, y] = PENTAGON_VERTICES[k];
      expect(Math.hypot(x, y)).toBeCloseTo(40, 0);
    }
  });
  it('centroïde d’un carré centré = origine', () => {
    expect(polygonCentroid([[-1, -1], [1, -1], [1, 1], [-1, 1]])).toEqual([0, 0]);
  });
  it('un seul gaz à 100 % → point sur son axe, ≤ 40', () => {
    const p = pentagonPoint({ H2: 100 })!;
    expect(p).not.toBeNull();
    expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(40.01);
    expect(p.x).toBeCloseTo(0, 1); // axe H2 vertical
    expect(p.y).toBeGreaterThan(0); // vers le sommet H2 (haut)
  });
  it('aucun gaz → null', () => {
    expect(pentagonPoint({})).toBeNull();
    expect(pentagonPoint({ H2: 0, CH4: 0 })).toBeNull();
  });
  it('NEW RICHMOND (arc, C2H2/C2H4 élevés) → point défini, dans le rayon', () => {
    const p = pentagonPoint({ H2: 1082, CH4: 529, C2H6: 54, C2H4: 768, C2H2: 947 })!;
    expect(p).not.toBeNull();
    expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(40.01);
  });
});
