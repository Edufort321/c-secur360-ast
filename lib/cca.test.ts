import { describe, it, expect } from 'vitest';
import { ccaForAssetYear, ccaRate, suggestCcaClass, ccaScheduleTotal } from './cca';

describe('DPA (CCA) — estimation déclinant + demi-année', () => {
  it('taux et suggestion de catégorie', () => {
    expect(ccaRate('8')).toBe(0.20);
    expect(ccaRate('50')).toBe(0.55);
    expect(suggestCcaClass('Informatique')).toBe('50');
    expect(suggestCcaClass('Véhicule')).toBe('10');
  });
  it('année d’acquisition : demi-année', () => {
    // Cat. 8 (20 %), coût 10 000, année d'acquisition → 10000 × 0.5 × 0.20 = 1000
    expect(ccaForAssetYear({ cost: 10000, cca_class: '8', acquisition_date: '2025-06-01' }, 2025)).toBe(1000);
  });
  it('2e année : déclinant sur la FNACC', () => {
    // FNACC fin année 1 = 10000 − 1000 = 9000 ; année 2 = 9000 × 0.20 = 1800
    expect(ccaForAssetYear({ cost: 10000, cca_class: '8', acquisition_date: '2024-06-01' }, 2025)).toBe(1800);
  });
  it('classe 50 (55 %) année d’acquisition', () => {
    // 4000 × 0.5 × 0.55 = 1100
    expect(ccaForAssetYear({ cost: 4000, cca_class: '50', acquisition_date: '2025-01-10' }, 2025)).toBe(1100);
  });
  it('0 avant acquisition / après disposition', () => {
    expect(ccaForAssetYear({ cost: 10000, cca_class: '8', acquisition_date: '2026-01-01' }, 2025)).toBe(0);
    expect(ccaForAssetYear({ cost: 10000, cca_class: '8', acquisition_date: '2020-01-01', disposal_date: '2024-05-01' }, 2025)).toBe(0);
  });
  it('total du parc', () => {
    const assets = [
      { cost: 10000, cca_class: '8', acquisition_date: '2025-06-01' },  // 1000
      { cost: 4000, cca_class: '50', acquisition_date: '2025-01-10' },  // 1100
    ];
    expect(ccaScheduleTotal(assets, 2025)).toBe(2100);
  });
});
