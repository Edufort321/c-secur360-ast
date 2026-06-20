import { describe, it, expect } from 'vitest';
import { classifyReport, isMirrorable } from './incidentClassify';

const R = (incident_type: string, data: any, id = 'r1') => ({ id, incident_type, status: 'submitted', created_at: '2026-06-10', data });

describe('classifyReport — Accidents → réglementaire', () => {
  it('passé proche → NEAR_MISS', () => {
    expect(classifyReport(R('near_miss', { incidentDate: '2026-06-01' })).event_code).toBe('NEAR_MISS');
  });
  it('dommages matériels → MATERIAL_DAMAGE + montant', () => {
    const c = classifyReport(R('property', { propertyDamage: { estimatedCost: '5000' } }));
    expect(c.event_code).toBe('MATERIAL_DAMAGE'); expect(c.material_damage_amount).toBe(5000);
  });
  it('maladie professionnelle → OCC_DISEASE', () => {
    expect(classifyReport(R('medical', {})).event_code).toBe('OCC_DISEASE');
  });
  it('décès → FATALITY', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ fatality: true }] })).event_code).toBe('FATALITY');
  });
  it('plusieurs blessés → MULTI_WORKER_INJURY', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ medicalTreatment: 'clinic' }, { medicalTreatment: 'first_aid' }] })).event_code).toBe('MULTI_WORKER_INJURY');
  });
  it('hospitalisation / gravité 4+ → SPECIFIED_INJURY', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ medicalTreatment: 'hospital' }] })).event_code).toBe('SPECIFIED_INJURY');
    expect(classifyReport(R('vehicle', { severityLevel: 4, injuredPersons: [{ medicalTreatment: 'clinic' }] })).event_code).toBe('SPECIFIED_INJURY');
  });
  it('arrêt > 7 jours → OVER_7_DAY', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ lostTime: true, lostTimeDays: 10, medicalTreatment: 'clinic' }] })).event_code).toBe('OVER_7_DAY');
  });
  it('soin clinique ou arrêt court → RECORDABLE + is_lost_time + jours', () => {
    const c = classifyReport(R('accident', { injuredPersons: [{ lostTime: true, lostTimeDays: 3, medicalTreatment: 'clinic' }] }));
    expect(c.event_code).toBe('RECORDABLE'); expect(c.is_lost_time).toBe(true); expect(c.lost_days).toBe(3);
  });
  it('premiers soins seuls → FIRST_AID (non enregistrable)', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ medicalTreatment: 'first_aid' }] })).event_code).toBe('FIRST_AID');
  });
  it('jours perdus = somme de tous les blessés', () => {
    const c = classifyReport(R('accident', { injuredPersons: [{ lostTime: true, lostTimeDays: 2, medicalTreatment: 'clinic' }, { lostTime: true, lostTimeDays: 4, medicalTreatment: 'clinic' }] }));
    expect(c.lost_days).toBe(6); expect(c.event_code).toBe('MULTI_WORKER_INJURY');
  });
  it('travail restreint → is_restricted', () => {
    expect(classifyReport(R('accident', { injuredPersons: [{ restricted: true, medicalTreatment: 'clinic' }] })).is_restricted).toBe(true);
  });
  it('brouillon non mirrorable', () => {
    expect(isMirrorable({ status: 'draft' })).toBe(false);
    expect(isMirrorable({ status: 'submitted' })).toBe(true);
  });
});
