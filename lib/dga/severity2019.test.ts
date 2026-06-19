// Test de validation DGA — cas réel NEW RICHMOND TG1 (DGA-212051041), Partie C des instructions.
// Le moteur 2019 DOIT reproduire ces sorties (sinon = bug à corriger avant d'ajouter des features).
// Lancer : npm test
import { describe, it, expect } from 'vitest';
import {
  o2n2Ratio, transformerType, threshold90, overThreshold, generationRatePerDay,
  co2coRatio, co2coInterpretation, canConcludeStabilized, generationRates, computeHealthIndex,
  recommendedRetestDays, addDays, getSegment, severity2019, tdcgIndicator,
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

  it('taux de génération par gaz : C₂H₂ critique (≫ seuil 90e pct)', () => {
    const prev = { ...s2024, sample_date: s2024.date, h2: s2024.H2, ch4: s2024.CH4, c2h6: s2024.C2H6, c2h4: s2024.C2H4, c2h2: s2024.C2H2, co: s2024.CO, co2: s2024.CO2 };
    const cur = { ...s2025, sample_date: s2025.date, h2: s2025.H2, ch4: s2025.CH4, c2h6: s2025.C2H6, c2h4: s2025.C2H4, c2h2: s2025.C2H2, co: s2025.CO, co2: s2025.CO2 };
    const rates = generationRates(prev, cur);
    const c2h2 = rates.find(r => r.gas === 'c2h2')!;
    expect(c2h2.perDay!).toBeCloseTo(2.6, 1);
    expect(c2h2.level).toBe('crit'); // ~950 ppm/an ≫ seuil 4 ppm/an
  });

  it('indice de santé : NEW RICHMOND = critique (score bas)', () => {
    const prev = { sample_date: s2024.date, h2: s2024.H2, ch4: s2024.CH4, c2h6: s2024.C2H6, c2h4: s2024.C2H4, c2h2: s2024.C2H2, co: s2024.CO, co2: s2024.CO2 };
    const cur = { sample_date: s2025.date, h2: s2025.H2, ch4: s2025.CH4, c2h6: s2025.C2H6, c2h4: s2025.C2H4, c2h2: s2025.C2H2, co: s2025.CO, co2: s2025.CO2 };
    const hi = computeHealthIndex({ c2h2Over: overThreshold(s2025.C2H2, 'c2h2', 'sealed'), worstCondition: 4, genRates: generationRates(prev, cur) });
    expect(hi.score).toBeLessThan(30);
    expect(hi.band).toBe('critique');
  });

  it('re-test recommandé : critique → 7 jours, date cible calculée', () => {
    expect(recommendedRetestDays('critique')).toBe(7);
    expect(recommendedRetestDays('a_surveiller')).toBe(30);
    expect(recommendedRetestDays('excellent')).toBe(365);
    expect(addDays('2025-07-08', 7)).toBe('2025-07-15');
  });

  it('sévérité 2019 segmentée : scellé, âge 10-30, statut 3 porté par C₂H₂ ; TDCG isolé', () => {
    const g = { H2: s2025.H2, CH4: s2025.CH4, C2H6: s2025.C2H6, C2H4: s2025.C2H4, C2H2: s2025.C2H2, CO: s2025.CO, CO2: s2025.CO2, O2: s2025.O2, N2: s2025.N2 };
    const seg = getSegment(g, 13);
    expect(seg.o2n2).toBe('low');       // O₂/N₂ = 0,13 → scellé
    expect(seg.ageBand).toBe('10to30'); // tranche officielle
    const sv = severity2019(g, 13);
    expect(sv.status).toBe(3);          // C₂H₂ 947 ≥ p95 → statut 3
    expect(sv.drivingGases).toContain('C2H2');
    expect(sv.placeholder).toBe(true);  // table non remplie avec valeurs officielles
    const t = tdcgIndicator(g);
    expect(t.value).toBe(4537);         // somme des combustibles
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
