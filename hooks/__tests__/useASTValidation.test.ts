import { describe, it, expect } from 'vitest';
import { computeASTValidation, computeSectionValidation, ASTData, FinalizationData } from '../useASTValidation';

describe('useASTValidation utilities', () => {
  const finalization: FinalizationData = {
    photos: [],
    finalComments: 'done',
    documentGeneration: {
      includePhotos: false,
      includeSignatures: false,
      includeQRCode: false,
      includeBranding: false,
      includeTimestamps: false,
      includeComments: false,
      includeStatistics: false,
      includeValidation: false,
      includePermits: false,
      includeHazards: false,
      includeEquipment: false,
      format: 'pdf',
      template: 'standard',
    },
    isLocked: false,
    completionPercentage: 100,
    generatedReports: [],
  };

  const baseData: ASTData = {
    astNumber: 'AST-1',
    tenant: 'tenant',
    language: 'en',
    createdAt: '',
    updatedAt: '',
    status: 'draft',
    projectInfo: {
      client: 'Client',
      projectNumber: 'PN',
      workLocation: 'Location',
      date: '',
      time: '',
      industry: '',
      workerCount: 1,
      estimatedDuration: '',
      workDescription: 'Desc',
      clientContact: '',
      emergencyContact: '',
      lockoutPoints: [],
    },
    equipment: {
      selected: ['Helmet'],
      categories: [],
      mandatory: [],
      optional: [],
      totalCost: 0,
      inspectionRequired: false,
      certifications: [],
    },
    hazards: {
      identified: ['Fire'],
      riskLevel: 'low',
      controlMeasures: [],
      residualRisk: 'low',
      emergencyProcedures: [],
      monitoringRequired: false,
    },
    permits: {
      required: ['Permit'],
      authorities: [],
      validations: [],
      expiry: [],
      documents: [],
      specialRequirements: [],
    },
    validation: {
      reviewers: ['John'],
      approvals: [],
      signatures: [],
      finalApproval: false,
      criteria: {},
      comments: [],
    },
    finalization: finalization,
  };

  it('computes overall validation', () => {
    const result = computeASTValidation(baseData, 'en');
    expect(result.isValid).toBe(true);
    expect(result.percentage).toBe(100);
  });

  it('computes section validation list', () => {
    const validation = computeASTValidation(baseData, 'en');
    const t = {
      step1ProjectInfo: 'Step1',
      step2Equipment: 'Step2',
      step3Hazards: 'Step3',
      step4Permits: 'Step4',
      step5Validation: 'Step5',
      step6Finalization: 'Step6',
    };
    const sections = computeSectionValidation(baseData, validation, finalization, t, 'en');
    expect(sections.length).toBe(6);
    expect(sections[0].isComplete).toBe(true);
  });
});
