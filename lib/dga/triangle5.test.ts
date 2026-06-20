import { describe, it, expect } from 'vitest';
import { classifyTriangle5, toPct5, appliesToT1, setT5Bounds, DEFAULT_T5_BOUNDS, t5Validated } from './triangle5';

describe('Triangle de Duval 5 — gate (haute-T uniquement)', () => {
  it('ne s’applique QUE pour T2/T3 du Triangle 1 (jamais D1/D2 ni PD/T1)', () => {
    expect(appliesToT1('T2')).toBe(true);
    expect(appliesToT1('T3')).toBe(true);
    expect(appliesToT1('T1')).toBe(false);  // basse-T → Triangle 4
    expect(appliesToT1('PD')).toBe(false);  // → Triangle 4
    expect(appliesToT1('D1')).toBe(false);  // électrique → jamais
    expect(appliesToT1('D2')).toBe(false);
    expect(appliesToT1(null)).toBe(false);
  });
});

describe('Triangle de Duval 5 — structure (frontières à valider)', () => {
  it('pourcentages somment à 100', () => {
    const p = toPct5({ CH4: 50, C2H4: 30, C2H6: 20 })!;
    expect(Math.round(p.ch4 + p.c2h4 + p.c2h6)).toBe(100);
  });
  it('somme nulle → null', () => {
    expect(classifyTriangle5({ CH4: 0, C2H4: 0, C2H6: 0 })).toBeNull();
  });
  it('placeholder=true par défaut (non validé)', () => {
    setT5Bounds(null, false);
    expect(t5Validated()).toBe(false);
    expect(classifyTriangle5({ CH4: 100, C2H4: 500, C2H6: 50 })!.placeholder).toBe(true);
  });
  it('une fois validé, placeholder=false', () => {
    setT5Bounds(DEFAULT_T5_BOUNDS, true);
    expect(classifyTriangle5({ CH4: 100, C2H4: 500, C2H6: 50 })!.placeholder).toBe(false);
    setT5Bounds(null, false); // reset
  });
});

// ⚠️ Zones attendues = SKIP tant que les frontières ne sont pas validées (coordonnées // TODO-VERIFY).
describe.skip('Triangle de Duval 5 — cas publiés (zones à valider Duval EIM / primer H-J)', () => {
  it('C2H4 très élevé → T3 (> 700 °C)', () => {
    expect(classifyTriangle5({ CH4: 100, C2H4: 800, C2H6: 50 })!.fault).toBe('T3');
  });
});
