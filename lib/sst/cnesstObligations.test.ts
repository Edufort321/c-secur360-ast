import { describe, it, expect } from 'vitest';
import { assessCnesst } from './cnesstObligations';

describe('assessCnesst — déclarabilité CNESST (LSST art. 62)', () => {
  it('AT-2026-7578 : corps étranger au doigt, premiers soins, sans arrêt → NON déclarable 24h, Registre oui, ADR non', () => {
    const o = assessCnesst({ injuryType: 'Corps étranger', bodyParts: ['Index'], medicalTreatment: 'first_aid', daysAbsent: 0, multipleWorkers: false, propertyDamage: 0 });
    expect(o.reportable24h).toBe(false);
    expect(o.reasons).toEqual([]);
    expect(o.registerRequired).toBe(true);
    expect(o.adrRequired).toBe(false);
    expect(o.workerClaimMonths).toBe(6);
  });
  it('décès → déclarable 24h', () => {
    const o = assessCnesst({ death: true });
    expect(o.reportable24h).toBe(true);
    expect(o.reasons).toContain('death');
  });
  it('perte d’usage d’un membre → déclarable', () => {
    expect(assessCnesst({ limbLossOrUse: true }).reportable24h).toBe(true);
  });
  it('traumatisme majeur → déclarable', () => {
    expect(assessCnesst({ majorTrauma: true }).reportable24h).toBe(true);
  });
  it('plusieurs blessés AVEC arrêt ≥ 1 j → déclarable ; sans arrêt → non', () => {
    expect(assessCnesst({ multipleWorkers: true, daysAbsent: 2 }).reportable24h).toBe(true);
    expect(assessCnesst({ multipleWorkers: true, daysAbsent: 0 }).reportable24h).toBe(false);
  });
  it('dégâts matériels ≥ seuil (2025) → déclarable', () => {
    expect(assessCnesst({ propertyDamage: 206159 }, 2025).reportable24h).toBe(true);
    expect(assessCnesst({ propertyDamage: 100000 }, 2025).reportable24h).toBe(false);
  });
  it('arrêt de travail > 0 → ADR requis (même si non déclarable 24h)', () => {
    const o = assessCnesst({ daysAbsent: 3 });
    expect(o.reportable24h).toBe(false);
    expect(o.adrRequired).toBe(true);
  });
});
