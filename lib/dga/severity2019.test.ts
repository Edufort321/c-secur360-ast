// Test de validation DGA — cas réel NEW RICHMOND TG1 (DGA-212051041), Partie C des instructions.
// Le moteur 2019 DOIT reproduire ces sorties (sinon = bug à corriger avant d'ajouter des features).
// Lancer : npm test
import { describe, it, expect } from 'vitest';
import {
  o2n2Ratio, transformerType, threshold90, overThreshold, generationRatePerDay,
  co2coRatio, co2coInterpretation, canConcludeStabilized,
} from './severity2019';
import { duvalTriangle1 } from './diagnose';

// Échantillons NEW RICHMOND TG1 (grounding transformer, huile minérale, 34,5 kV).
const s2024 = { date: '2024-07-09', H2: 40, CH4: 77, C2H6: 29, C2H4: 134, C2H2: 0.5, CO: 458, CO2: 1744, N2: 81806, O2: 11517, TDCG: 739 };
const s2025 = { date: '2025-07-08', H2: 1082, CH4: 529, C2H6: 54, C2H4: 768, C2H2: 947, CO: 1157, CO2: 2182, N2: 81968, O2: 10553, TDCG: 4537 };

describe('DGA NEW RICHMOND TG1 — Partie C (IEEE C57.104-2019)', () => {
  it('O₂/N₂ ≈ 0,13 → transformateur SCELLÉ', () => {
    expect(o2n2Ratio(s2025.O2, s2025.N2)!).toBeCloseTo(0.13, 2);
    expect(transformerType(s2025.O2, s2025.N2)).toBe('sealed');
  });

  it('seuil C₂H₂ scellé = 1 ppm → 947× le 90e percentile', () => {
    expect(threshold90('c2h2', 'sealed')).toBe(1);
    expect(overThreshold(s2025.C2H2, 'c2h2', 'sealed')!).toBeCloseTo(947, 0);
  });

  it('Triangle de Duval = D2 (décharges forte énergie / arc)', () => {
    expect(duvalTriangle1(s2025.CH4, s2025.C2H2, s2025.C2H4)).toBe('D2');
  });

  it('CO₂/CO ≈ 1,89 → implication thermique du papier', () => {
    const r = co2coRatio(s2025.CO2, s2025.CO)!;
    expect(r).toBeCloseTo(1.89, 2);
    expect(co2coInterpretation(r)).toMatch(/thermique/i);
  });

  it('taux de génération C₂H₂ ≈ 2,6 ppm/jour', () => {
    const rate = generationRatePerDay(s2024.C2H2, s2024.date, s2025.C2H2, s2025.date)!;
    expect(rate).toBeCloseTo(2.6, 1);
  });

  it('NE PEUT PAS conclure « stabilisé » avec 2 mesures et un saut récent', () => {
    const samples = [
      { date: s2024.date, value: s2024.C2H2 },
      { date: s2025.date, value: s2025.C2H2 },
    ];
    // saut C₂H₂ 0,5 → 947 (>50) au dernier point → 0 point après le saut → interdit.
    expect(canConcludeStabilized(samples, 50)).toBe(false);
  });
});
