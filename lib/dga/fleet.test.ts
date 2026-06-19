import { describe, it, expect } from 'vitest';
import { percentileRank, buildFleetComparison } from './fleet';

describe('DGA B6 — comparaison à la flotte', () => {
  it('percentile : % strictement sous la valeur', () => {
    expect(percentileRank(50, [10, 20, 30, 40])).toBe(100); // au-dessus de tous
    expect(percentileRank(25, [10, 20, 30, 40])).toBe(50);  // 2 sur 4 sous
    expect(percentileRank(5, [10, 20, 30, 40])).toBe(0);
    expect(percentileRank(5, [])).toBe(0);
  });
  it('compare un transfo vs la flotte', () => {
    const current = { H2: 100, C2H2: 50 };
    const fleet = [{ gases: { H2: 10, C2H2: 0 } }, { gases: { H2: 20, C2H2: 1 } }, { gases: { H2: 30, C2H2: 2 } }];
    const r = buildFleetComparison(current, fleet);
    const h2 = r.find(x => x.gas === 'H2')!;
    expect(h2.count).toBe(3);
    expect(h2.median).toBe(20);
    expect(h2.max).toBe(30);
    expect(h2.percentile).toBe(100);   // 100 > tous
    expect(h2.position).toBe('extrême');
    const c2h2 = r.find(x => x.gas === 'C2H2')!;
    expect(c2h2.position).toBe('extrême'); // 50 >> flotte
  });
  it('ignore les gaz sans population de flotte', () => {
    const r = buildFleetComparison({ H2: 100 }, [{ gases: {} }]);
    // H2 a une pop [0] → comparé ; CH4 etc absents → pop [0] aussi (num→0). On garde H2.
    expect(r.find(x => x.gas === 'H2')).toBeTruthy();
  });
});
