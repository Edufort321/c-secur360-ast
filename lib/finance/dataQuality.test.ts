// Test du détecteur de complétude comptable. Lancer : npm test
import { describe, it, expect } from 'vitest';
import { assessDataQuality } from './dataQuality';

describe('assessDataQuality', () => {
  it('démo cost-side vide → NON fiable + manques listés', () => {
    const q = assessDataQuality({ revenue: 323000, cogs: 0, payroll: 0, opex: 1350, depreciation: 0 });
    expect(q.isReliable).toBe(false);
    expect(q.hasPayroll).toBe(false);
    expect(q.hasCOGS).toBe(false);
    expect(q.expenseRatio).toBeLessThan(0.05);
    expect(q.missing.length).toBeGreaterThanOrEqual(2);
    expect(q.warning).toBeTruthy();
  });

  it('compta complète → FIABLE, aucun manque', () => {
    const q = assessDataQuality({ revenue: 100000, cogs: 30000, payroll: 40000, opex: 10000, depreciation: 2000 });
    expect(q.isReliable).toBe(true);
    expect(q.missing).toHaveLength(0);
    expect(q.warning).toBeNull();
  });

  it('aucun revenu → considéré fiable (état de départ normal, pas d’alerte)', () => {
    const q = assessDataQuality({ revenue: 0, cogs: 0, payroll: 0, opex: 0, depreciation: 0 });
    expect(q.isReliable).toBe(true);
    expect(q.missing).toHaveLength(0);
  });
});
