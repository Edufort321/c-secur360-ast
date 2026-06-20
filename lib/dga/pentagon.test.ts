import { describe, it, expect } from 'vitest';
import { polygonCentroid, pentagonPoint, PENTAGON_VERTICES, classifyDuval, pointInPolygon, guardGasLevels, BOUNDARIES_VALIDATED, ZONE_POLYGONS, GAS_UNIT } from './pentagon';

// ── Validation OFFICIELLE du centroïde (Cheim, Duval & Haider, Energies 2020, 13, 2859) ──────────────
// Méthode : projeter le % (0..100) de chaque gaz sur son axe UNITAIRE, centroïde par aire signée.
// Ces valeurs sont vérifiées numériquement à la main (±0.01). Le moteur de centroïde doit les reproduire.
describe('Pentagone combiné — centroïde officiel (Energies 2020)', () => {
  const near = (p: any, x: number, y: number) => { expect(p).not.toBeNull(); expect(p.x).toBeCloseTo(x, 1); expect(p.y).toBeCloseTo(y, 1); };
  it('axes unitaires : H2 vertical (0,1), C2H4 bas-droite', () => {
    expect(GAS_UNIT.H2[0]).toBeCloseTo(0, 5); expect(GAS_UNIT.H2[1]).toBeCloseTo(1, 5);
    expect(GAS_UNIT.C2H4[1]).toBeLessThan(0); expect(GAS_UNIT.C2H4[0]).toBeGreaterThan(0);
  });
  it('ancre Figure 1 : (50,120,30,60,80) → (−7.35, −5.79)', () => {
    near(pentagonPoint({ H2: 50, CH4: 120, C2H2: 30, C2H4: 60, C2H6: 80 }), -7.35, -5.79);
  });
  it('cas 1 : H2=29, CH4=204, C2H2=0, C2H4=17, C2H6=264 → (−22.24, −4.26)', () => {
    near(pentagonPoint({ H2: 29, CH4: 204, C2H2: 0, C2H4: 17, C2H6: 264 }), -22.24, -4.26);
  });
});

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

describe('Pentagone combiné — moteur (géométrie, garde, structure)', () => {
  it('point-dans-polygone : carré unité', () => {
    const sq = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];
    expect(pointInPolygon({ x: 0, y: 0 }, sq)).toBe(true);
    expect(pointInPolygon({ x: 2, y: 0 }, sq)).toBe(false);
  });
  it('garde-fou C57.104 : tous les gaz sous les seuils → non diagnosticable', () => {
    expect(guardGasLevels({ H2: 10, CH4: 10, C2H6: 10, C2H4: 5, C2H2: 0 }).ok).toBe(false);
    expect(guardGasLevels({ H2: 500, CH4: 10, C2H6: 10, C2H4: 5, C2H2: 0 }).ok).toBe(true);
  });
  it('classifyDuval renvoie un résultat tracé+versionné, drapeau validated cohérent', () => {
    const r = classifyDuval({ H2: 29, C2H6: 264, CH4: 204, C2H4: 17, C2H2: 0 })!;
    expect(r).not.toBeNull();
    expect(r.percentages.C2H6).toBeGreaterThan(40);   // C2H6 dominant (stray gassing attendu)
    expect(r.validated).toBe(BOUNDARIES_VALIDATED);
    expect(r.boundaryVersion).toMatch(/cheim-duval-2020/);
  });
  it('10 zones définies', () => { expect(ZONE_POLYGONS).toHaveLength(10); });

  // BUG 1 — cohérence du repère axes↔zones (indépendant des valeurs exactes des frontières) :
  // un gaz dominant doit tomber dans SA région (PD/S haut, D côté C2H2/CH4, T côté C2H4).
  it('C2H2 dominant → zone électrique D (centroïde tiré vers C2H2 haut-droite)', () => {
    expect(classifyDuval({ H2: 0, CH4: 0, C2H6: 0, C2H4: 0, C2H2: 100 })!.zone).toMatch(/^D/);
  });
  it('C2H4 dominant → zone thermique T3 (adjacent C2H4, bas-droite)', () => {
    expect(classifyDuval({ H2: 0, CH4: 0, C2H6: 0, C2H4: 100, C2H2: 0 })!.zone).toMatch(/^T3/);
  });
  it('H2 dominant → PD (sommet haut)', () => {
    expect(classifyDuval({ H2: 100, CH4: 0, C2H6: 0, C2H4: 0, C2H2: 0 })!.zone).toBe('PD');
  });
  it('CH4 dominant → D1 (bas-gauche)', () => {
    expect(classifyDuval({ H2: 0, CH4: 100, C2H6: 0, C2H4: 0, C2H2: 0 })!.zone).toBe('D1');
  });
  it('C2H6 dominant → S (haut-gauche)', () => {
    expect(classifyDuval({ H2: 0, CH4: 0, C2H6: 100, C2H4: 0, C2H2: 0 })!.zone).toBe('S');
  });
});

// ⚠️ Cas de référence du primer (zone ATTENDUE) — SKIP tant que les frontières ne sont pas validées
// par un ingénieur (coordonnées // TODO-VERIFY). Lever describe.skip→describe quand BOUNDARIES_VALIDATED.
describe.skip('Pentagone combiné — cas publiés (zones à valider)', () => {
  it('exemple primer (29,264,204,17,0) → zone S (stray gassing)', () => {
    expect(classifyDuval({ H2: 29, C2H6: 264, CH4: 204, C2H4: 17, C2H2: 0 })!.zone).toBe('S');
  });
});
