// Tests du moteur de paie réelle (#43). RRQ/RQAP/AE = exacts (plafonds) ; impôt = méthode des formules.
// Lancer : npm test
import { describe, it, expect } from 'vitest';
import { computePayroll, paramsForYear } from './payrollTax';

const p26 = paramsForYear(2026);

describe('cotisations plafonnées (exactes) — RRQ/RQAP/AE 2026', () => {
  it('atteint les cotisations MAXIMALES annuelles pour un haut salaire', () => {
    // Salaire annuel très élevé → toutes les cotisations plafonnées.
    const r = computePayroll({ periodGross: 5000, frequency: 'weekly', year: 2026 }); // 260 000 $/an
    const annualQpp = r.qpp * 52, annualEi = r.ei * 52, annualQpip = r.qpip * 52;
    // RRQ max = base+1re suppl. sur (MGA-exemption) + RRQ2 sur (MSGA-MGA)
    const expectedQppMax = (p26.qpp.ympe - p26.qpp.exemption) * (p26.qpp.baseRate + p26.qpp.firstAddlRate)
      + (p26.qpp.yampe - p26.qpp.ympe) * p26.qpp.qpp2Rate;
    expect(annualQpp).toBeCloseTo(expectedQppMax, 0);
    // AE max 2026 ≈ 895,70 $
    expect(annualEi).toBeCloseTo(p26.ei.maxInsurable * p26.ei.empRate, 0);
    // RQAP max 2026 ≈ 442,90 $
    expect(annualQpip).toBeCloseTo(p26.qpip.maxInsurable * p26.qpip.empRate, 0);
  });

  it('respecte l’exemption RRQ de 3 500 $ pour un faible salaire', () => {
    const r = computePayroll({ periodGross: 1000, frequency: 'weekly', year: 2026 }); // 52 000 $/an
    const annualQpp = r.qpp * 52;
    const expected = (52000 - p26.qpp.exemption) * (p26.qpp.baseRate + p26.qpp.firstAddlRate);
    expect(annualQpp).toBeCloseTo(expected, 0);
  });
});

describe('impôt sur le revenu', () => {
  it('revenu sous le montant personnel de base → impôt nul', () => {
    const r = computePayroll({ periodGross: 300, frequency: 'weekly', year: 2026 }); // 15 600 $/an
    expect(r.federalTax).toBe(0);
    expect(r.quebecTax).toBe(0);
  });

  it('salaire moyen → retenues positives et net cohérent', () => {
    const r = computePayroll({ periodGross: 2000, frequency: 'biweekly', year: 2026 }); // 52 000 $/an
    expect(r.federalTax).toBeGreaterThan(0);
    expect(r.quebecTax).toBeGreaterThan(0);
    // net = brut - total des retenues
    expect(r.netPay).toBeCloseTo(r.gross - r.totalDeductions, 2);
    // total des retenues = somme des composantes
    expect(r.totalDeductions).toBeCloseTo(r.qpp + r.ei + r.qpip + r.federalTax + r.quebecTax + r.extraTax, 2);
    // le net doit rester une fraction plausible du brut (entre 60 % et 90 %)
    expect(r.netPay / r.gross).toBeGreaterThan(0.6);
    expect(r.netPay / r.gross).toBeLessThan(0.9);
  });
});

describe('coût employeur', () => {
  it('inclut la part employeur (RRQ égale, AE 1,4×, RQAP, FSS, CNESST) au-dessus du brut', () => {
    const r = computePayroll({ periodGross: 2000, frequency: 'biweekly', year: 2026 });
    expect(r.employer.qpp).toBeCloseTo(r.qpp, 2);              // RRQ employeur = part employé
    expect(r.employer.ei).toBeCloseTo(r.ei * 1.4, 2);          // AE employeur = 1,4×
    expect(r.totalEmployerCost).toBeCloseTo(r.gross + r.employer.total, 2);
    expect(r.employer.total).toBeGreaterThan(0);
  });
});

describe('réglages employé', () => {
  it('la retenue additionnelle augmente les retenues du même montant', () => {
    const base = computePayroll({ periodGross: 2000, frequency: 'biweekly', year: 2026 });
    const extra = computePayroll({ periodGross: 2000, frequency: 'biweekly', year: 2026, extraTaxPerPeriod: 50 });
    expect(extra.totalDeductions).toBeCloseTo(base.totalDeductions + 50, 2);
  });

  it('exemption RRQ/AE met ces cotisations à zéro', () => {
    const r = computePayroll({ periodGross: 2000, frequency: 'biweekly', year: 2026, exemptCpp: true, exemptEi: true });
    expect(r.qpp).toBe(0);
    expect(r.ei).toBe(0);
  });
});
