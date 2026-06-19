import { describe, it, expect } from 'vitest';
import { classifyTriangle4, classifyPct4, toPct4, appliesToT1, setT4Bounds, DEFAULT_T4_BOUNDS } from './triangle4';

describe('Triangle de Duval 4 — gate (basse-T uniquement)', () => {
  it('ne s’applique QUE pour PD/T1/T2 du Triangle 1', () => {
    expect(appliesToT1('PD')).toBe(true);
    expect(appliesToT1('T1')).toBe(true);
    expect(appliesToT1('T2')).toBe(true);
    expect(appliesToT1('T3')).toBe(false);   // haute-T → Triangle 5
    expect(appliesToT1('D1')).toBe(false);   // électrique → jamais Triangle 4
    expect(appliesToT1('D2')).toBe(false);
    expect(appliesToT1(null)).toBe(false);
  });
});

describe('Triangle de Duval 4 — classification', () => {
  it('H2 quasi pur (bas CH4/C2H6) → PD', () => {
    expect(classifyTriangle4({ H2: 980, CH4: 10, C2H6: 5 })!.fault).toBe('PD');
  });
  it('CH4 dominant (> 36 %) → C (carbonisation)', () => {
    expect(classifyTriangle4({ H2: 100, CH4: 600, C2H6: 100 })!.fault).toBe('C');
  });
  it('C2H6 élevé + H2 faible → O (surchauffe)', () => {
    expect(classifyTriangle4({ H2: 5, CH4: 100, C2H6: 200 })!.fault).toBe('O');
  });
  it('zone résiduelle → S (gazage parasite)', () => {
    expect(classifyTriangle4({ H2: 300, CH4: 200, C2H6: 200 })!.fault).toBe('S');
  });
  it('somme nulle → null', () => {
    expect(classifyTriangle4({ H2: 0, CH4: 0, C2H6: 0 })).toBeNull();
  });
  it('pourcentages somment à 100', () => {
    const p = toPct4({ H2: 50, CH4: 30, C2H6: 20 })!;
    expect(Math.round(p.h2 + p.ch4 + p.c2h6)).toBe(100);
  });
});

describe('Triangle de Duval 4 — frontières surchargeables / validation', () => {
  it('placeholder=true par défaut (non validé), false une fois validé', () => {
    setT4Bounds(null, false);
    expect(classifyTriangle4({ H2: 980, CH4: 10, C2H6: 5 })!.placeholder).toBe(true);
    setT4Bounds(DEFAULT_T4_BOUNDS, true);
    expect(classifyTriangle4({ H2: 980, CH4: 10, C2H6: 5 })!.placeholder).toBe(false);
    setT4Bounds(null, false); // reset
  });
  it('une frontière surchargée modifie la zone', () => {
    // au seuil par défaut ch4_c=36 : CH4≈40 % → C
    expect(classifyPct4({ h2: 30, c2h6: 30, ch4: 40 })).toBe('C');
    setT4Bounds({ ch4_c: 45 }, true);    // remonte la frontière → plus C
    expect(classifyPct4({ h2: 30, c2h6: 30, ch4: 40 })).not.toBe('C');
    setT4Bounds(null, false);            // reset
  });
});
