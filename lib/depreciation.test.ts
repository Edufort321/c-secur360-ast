import { describe, it, expect } from 'vitest';
import { monthsInServiceInYear, depreciationForYear, depreciableBase, netBookValue } from './depreciation';

describe('amortissement', () => {
  it('mois en service — année pleine vs prorata acquisition', () => {
    expect(monthsInServiceInYear('2024-01-01', null, 2025)).toBe(12); // acquis avant → 12 mois en 2025
    expect(monthsInServiceInYear('2025-04-15', null, 2025)).toBe(9);  // avril→déc = 9 mois
    expect(monthsInServiceInYear('2026-01-01', null, 2025)).toBe(0);  // acquis après l'année
  });
  it('mois en service — disposition en cours d’année', () => {
    expect(monthsInServiceInYear('2024-01-01', '2025-03-31', 2025)).toBe(3); // jan→mars
    expect(monthsInServiceInYear('2024-01-01', '2024-12-31', 2025)).toBe(0); // cédé avant l’année
  });
  it('base amortissable = coût − valeur résiduelle', () => {
    expect(depreciableBase({ cost: 10000, salvage_value: 1000 })).toBe(9000);
    expect(depreciableBase({ cost: 500, salvage_value: 800 })).toBe(0); // jamais négatif
  });
  it('dotation linéaire pleine année', () => {
    // 9000 / 5 ans = 1800/an
    expect(depreciationForYear({ cost: 10000, salvage_value: 1000, useful_life_years: 5, acquisition_date: '2024-01-01' }, 2025)).toBe(1800);
  });
  it('dotation prorata 1re année (acquis en avril → 9/12)', () => {
    expect(depreciationForYear({ cost: 12000, salvage_value: 0, useful_life_years: 5, acquisition_date: '2025-04-01' }, 2025)).toBe(1800); // 2400 × 9/12
  });
  it('plafonnée au reste amortissable', () => {
    // base 1000, déjà 900 cumulés → ne dépasse pas 100
    expect(depreciationForYear({ cost: 1000, salvage_value: 0, useful_life_years: 2, acquisition_date: '2020-01-01' }, 2025, 900)).toBe(100);
  });
  it('0 si durée non définie', () => {
    expect(depreciationForYear({ cost: 1000, useful_life_years: null, acquisition_date: '2024-01-01' }, 2025)).toBe(0);
  });
  it('valeur nette = coût − cumul (plancher résiduelle)', () => {
    expect(netBookValue({ cost: 10000, salvage_value: 1000 }, 3600)).toBe(6400);
    expect(netBookValue({ cost: 10000, salvage_value: 1000 }, 9999)).toBe(1000); // plancher = résiduelle
  });
});
