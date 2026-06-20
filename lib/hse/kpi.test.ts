import { describe, it, expect } from 'vitest';
import { normalizedRate, computeMonthlyKpi, computeAggregateKpi, formatDeadlineDelay } from './kpi';

describe('HSE KPI', () => {
  it('taux normalisé = n × base / heures', () => {
    expect(normalizedRate(2, 200000, 200000)).toBe(2);   // 2 incidents sur 200k h, base 200k → 2
    expect(normalizedRate(1, 100000, 200000)).toBe(2);    // base nord-américaine
    expect(normalizedRate(1, 100000, 100000)).toBe(1);    // base UK
    expect(normalizedRate(5, 0, 200000)).toBe(0);          // pas d'heures
  });
  it('KPI mensuels LTIFR/TRIR/gravité', () => {
    const inc = [
      { occurred_at: '2026-03-10', event_code: 'OVER_7_DAY', is_lost_time: true, lost_days: 12 },
      { occurred_at: '2026-03-20', event_code: 'NEAR_MISS' },
      { occurred_at: '2026-04-02', event_code: 'FATALITY', is_lost_time: true, lost_days: 0 },
    ];
    const hours = [{ period_start: '2026-03-02', hours: 100000 }, { period_start: '2026-04-06', hours: 100000 }];
    const k = computeMonthlyKpi(inc, hours, 200000);
    const mar = k.find(r => r.month === '2026-03')!;
    expect(mar.ltiCount).toBe(1); expect(mar.nearMissCount).toBe(1); expect(mar.recordableCount).toBe(1);
    expect(mar.ltifr).toBe(2);            // 1 × 200000 / 100000
    expect(mar.severityRate).toBe(24);    // 12 × 200000 / 100000
    const apr = k.find(r => r.month === '2026-04')!;
    expect(apr.recordableCount).toBe(1);  // FATALITY recordable
    expect(apr.trir).toBe(2);
  });
  it('MULTI_WORKER_INJURY compte en enregistrable (TRIR) — correctif audit', () => {
    const k = computeMonthlyKpi([
      { occurred_at: '2026-05-10', event_code: 'MULTI_WORKER_INJURY', is_lost_time: false },
    ], [{ period_start: '2026-05-04', hours: 200000 }], 200000);
    const may = k.find(r => r.month === '2026-05')!;
    expect(may.recordableCount).toBe(1); expect(may.trir).toBe(1);
  });
  it('DART = arrêt OU travail restreint/mutation', () => {
    const k = computeMonthlyKpi([
      { occurred_at: '2026-06-01', event_code: 'RECORDABLE', is_lost_time: true, lost_days: 3 },   // DART (arrêt)
      { occurred_at: '2026-06-02', event_code: 'RECORDABLE', is_restricted: true },                 // DART (restreint)
      { occurred_at: '2026-06-03', event_code: 'RECORDABLE' },                                       // enregistrable, pas DART
      { occurred_at: '2026-06-04', event_code: 'FATALITY' },                                          // décès (suivi séparé)
    ], [{ period_start: '2026-06-01', hours: 200000 }], 200000);
    const jun = k.find(r => r.month === '2026-06')!;
    expect(jun.dartCount).toBe(2); expect(jun.dartRate).toBe(2);
    expect(jun.fatalityCount).toBe(1); expect(jun.recordableCount).toBe(4);
  });
  it('cumul période', () => {
    const rows = computeMonthlyKpi([
      { occurred_at: '2026-01-05', event_code: 'OVER_7_DAY', is_lost_time: true, lost_days: 5 },
    ], [{ period_start: '2026-01-05', hours: 200000 }], 200000);
    const agg = computeAggregateKpi(rows, 200000);
    expect(agg.ltiCount).toBe(1); expect(agg.ltifr).toBe(1); expect(agg.severityRate).toBe(5);
  });
  it('« sans délai » → immédiat (jamais « 0 heure »)', () => {
    expect(formatDeadlineDelay(0)).toMatch(/immédiat/);
    expect(formatDeadlineDelay(0, 'en')).toMatch(/immediate/);
    expect(formatDeadlineDelay(240)).toBe('10 jour(s)');
    expect(formatDeadlineDelay(null)).toBe('s.o.');
  });
});
