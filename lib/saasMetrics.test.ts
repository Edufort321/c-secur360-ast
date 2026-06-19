// Tests BLOC B : métriques SaaS (churn/NRR) + prévision de trésorerie (scénarios). Lancer : npm test
import { describe, it, expect } from 'vitest';
import { computeSaasMetrics } from './saasMetrics';
import { projectCashflow } from './cashForecast';
import type { RecurringSub } from './recurring';

const subs: RecurringSub[] = [
  { client_name: 'A', plan_name: 'P', amount: 100, interval: 'monthly', status: 'active', start_date: '2026-05-01' } as any,
  { client_name: 'B', plan_name: 'P', amount: 50, interval: 'monthly', status: 'cancelled', start_date: '2026-04-01', updated_at: '2026-06-10' } as any,
  { client_name: 'C', plan_name: 'P', amount: 30, interval: 'monthly', status: 'active', start_date: '2026-06-05' } as any,
];

describe('métriques SaaS (mois 2026-06)', () => {
  const m = computeSaasMetrics(subs, { monthStartIso: '2026-06-01', cash: 9000, monthlyEbitda: -3000 });
  it('MRR/ARR/actifs', () => { expect(m.mrr).toBe(130); expect(m.arr).toBe(1560); expect(m.activeCount).toBe(2); });
  it('MRR début de mois + nouveau + perdu', () => { expect(m.mrrBoM).toBe(150); expect(m.newMrr).toBe(30); expect(m.churnedMrr).toBe(50); });
  it('churn ≈ 33,3 % et NRR ≈ 66,7 %', () => { expect(m.churnPct!).toBeCloseTo(33.3, 1); expect(m.nrrPct!).toBeCloseTo(66.7, 1); });
  it('runway = trésorerie / burn', () => { expect(m.runwayMonths!).toBeCloseTo(3, 1); }); // 9000 / 3000
});

describe('prévision de trésorerie (pur)', () => {
  it('applique le facteur de scénario aux entrées', () => {
    const r = projectCashflow({
      startingCash: 1000, startIso: '2026-06-01',
      inflows: [{ dateIso: '2026-06-02', amount: 500 }],
      outflows: [{ dateIso: '2026-06-03', amount: 200 }],
      scenario: 'realistic', weeks: 2,
    });
    expect(r[0].balance).toBe(1250); // 1000 + 500*0.9 − 200
    expect(r.length).toBe(2);
  });
});
