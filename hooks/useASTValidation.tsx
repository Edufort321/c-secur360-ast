import React, { useCallback, useMemo } from 'react';
import { Building, Shield, AlertTriangle, FileText, Users, CheckCircle } from 'lucide-react';

export interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'hazard' | 'equipment' | 'site' | 'team' | 'safety' | 'permit' | 'other';
  location?: string;
  tags?: string[];
  stepSource?: string;
}

export interface DocumentGeneration {
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  includeBranding: boolean;
  includeTimestamps: boolean;
  includeComments: boolean;
  includeStatistics: boolean;
  includeValidation: boolean;
  includePermits: boolean;
  includeHazards: boolean;
  includeEquipment: boolean;
  format: 'pdf' | 'word' | 'html';
  template: string;
}

export interface GeneratedReport {
  id: string;
  type: string;
  url: string;
  generatedAt: string;
  fileSize?: string;
  astNumber: string;
}

export interface FinalizationData {
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  isLocked: boolean;
  lockTimestamp?: string;
  lockReason?: string;
  completionPercentage: number;
  qrCodeUrl?: string;
  shareableLink?: string;
  lastSaved?: string;
  generatedReports: GeneratedReport[];
}

export interface ASTData {
  astNumber: string;
  tenant: string;
  language: 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  projectInfo: {
    client: string;
    projectNumber: string;
    workLocation: string;
    date: string;
    time: string;
    industry: string;
    workerCount: number;
    estimatedDuration: string;
    workDescription: string;
    clientContact: string;
    emergencyContact: string;
    lockoutPoints: string[];
    weatherConditions?: string;
    accessRestrictions?: string;
  };
  equipment: {
    selected: string[];
    categories: string[];
    mandatory: string[];
    optional: string[];
    totalCost: number;
    inspectionRequired: boolean;
    certifications: string[];
  };
  hazards: {
    identified: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    controlMeasures: string[];
    residualRisk: 'low' | 'medium' | 'high';
    emergencyProcedures: string[];
    monitoringRequired: boolean;
  };
  permits: {
    required: string[];
    authorities: string[];
    validations: string[];
    expiry: string[];
    documents: string[];
    specialRequirements: string[];
  };
  validation: {
    reviewers: string[];
    approvals: string[];
    signatures: string[];
    finalApproval: boolean;
    criteria: Record<string, boolean>;
    comments: string[];
  };
  finalization: FinalizationData;
}

export interface ASTValidationResult {
  isValid: boolean;
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  errors: string[];
  sections: {
    step1Complete: boolean;
    step2Complete: boolean;
    step3Complete: boolean;
    step4Complete: boolean;
    step5Complete: boolean;
    step6Complete: boolean;
  };
}

export interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
  stepNumber: number;
}

export function computeASTValidation(astData: ASTData, language: 'fr' | 'en'): ASTValidationResult {
  const step1Complete = Boolean(
    astData.projectInfo.client !== 'Non spécifié' &&
    astData.projectInfo.projectNumber !== 'Non spécifié' &&
    astData.projectInfo.workLocation !== 'Non spécifié' &&
    astData.projectInfo.workDescription !== 'Non spécifié'
  );
  const step2Complete = Boolean(astData.equipment.selected.length > 0);
  const step3Complete = Boolean(astData.hazards.identified.length > 0);
  const step4Complete = Boolean(astData.permits.required.length > 0);
  const step5Complete = Boolean(astData.validation.reviewers.length > 0);
  const step6Complete = Boolean(
    astData.finalization.finalComments.length > 0 ||
    astData.finalization.photos.length > 0
  );

  const completedSteps = [step1Complete, step2Complete, step3Complete, step4Complete, step5Complete, step6Complete].filter(Boolean).length;
  const totalSteps = 6;
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  const errors: string[] = [];
  if (!step1Complete) errors.push(language === 'fr' ? 'Informations projet incomplètes' : 'Project information incomplete');
  if (!step2Complete) errors.push(language === 'fr' ? 'Équipements non sélectionnés' : 'Equipment not selected');
  if (!step3Complete) errors.push(language === 'fr' ? 'Dangers non identifiés' : 'Hazards not identified');
  if (!step4Complete) errors.push(language === 'fr' ? 'Permis non configurés' : 'Permits not configured');
  if (!step5Complete) errors.push(language === 'fr' ? 'Validation équipe manquante' : 'Team validation missing');
  if (!step6Complete) errors.push(language === 'fr' ? 'Finalisation incomplète' : 'Finalization incomplete');

  return {
    isValid: completedSteps === totalSteps,
    percentage,
    completedSteps,
    totalSteps,
    errors,
    sections: {
      step1Complete,
      step2Complete,
      step3Complete,
      step4Complete,
      step5Complete,
      step6Complete,
    },
  };
}

export function computeSectionValidation(
  astData: ASTData,
  validation: ASTValidationResult,
  finalizationData: FinalizationData,
  t: any,
  language: 'fr' | 'en'
): ValidationSummary[] {
  return [
    {
      stepNumber: 1,
      sectionName: t.step1ProjectInfo,
      icon: <Building size={20} color={validation.sections.step1Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step1Complete,
      completionPercentage: validation.sections.step1Complete
        ? 100
        : Math.round(
            (astData.projectInfo.client !== 'Non spécifié' ? 25 : 0) +
              (astData.projectInfo.projectNumber !== 'Non spécifié' ? 25 : 0) +
              (astData.projectInfo.workLocation !== 'Non spécifié' ? 25 : 0) +
              (astData.projectInfo.workDescription !== 'Non spécifié' ? 25 : 0)
          ),
      errors: validation.sections.step1Complete
        ? []
        : [language === 'fr' ? 'Informations projet incomplètes' : 'Project information incomplete'],
      lastModified: astData.updatedAt,
    },
    {
      stepNumber: 2,
      sectionName: t.step2Equipment,
      icon: <Shield size={20} color={validation.sections.step2Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step2Complete,
      completionPercentage: validation.sections.step2Complete ? 100 : 0,
      errors: validation.sections.step2Complete
        ? []
        : [language === 'fr' ? 'Équipements de sécurité non sélectionnés' : 'Safety equipment not selected'],
      lastModified: astData.updatedAt,
    },
    {
      stepNumber: 3,
      sectionName: t.step3Hazards,
      icon: <AlertTriangle size={20} color={validation.sections.step3Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step3Complete,
      completionPercentage: validation.sections.step3Complete ? 100 : 0,
      errors: validation.sections.step3Complete
        ? []
        : [language === 'fr' ? 'Dangers et contrôles non identifiés' : 'Hazards and controls not identified'],
      lastModified: astData.updatedAt,
    },
    {
      stepNumber: 4,
      sectionName: t.step4Permits,
      icon: <FileText size={20} color={validation.sections.step4Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step4Complete,
      completionPercentage: validation.sections.step4Complete ? 100 : 0,
      errors: validation.sections.step4Complete
        ? []
        : [language === 'fr' ? 'Permis et autorisations non configurés' : 'Permits and authorizations not configured'],
      lastModified: astData.updatedAt,
    },
    {
      stepNumber: 5,
      sectionName: t.step5Validation,
      icon: <Users size={20} color={validation.sections.step5Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step5Complete,
      completionPercentage: validation.sections.step5Complete ? 100 : 0,
      errors: validation.sections.step5Complete
        ? []
        : [language === 'fr' ? 'Validation équipe manquante' : 'Team validation missing'],
      lastModified: astData.updatedAt,
    },
    {
      stepNumber: 6,
      sectionName: t.step6Finalization,
      icon: <CheckCircle size={20} color={validation.sections.step6Complete ? '#10b981' : '#f59e0b'} />,
      isComplete: validation.sections.step6Complete,
      completionPercentage: validation.sections.step6Complete
        ? 100
        : (finalizationData.finalComments.length > 0 ? 50 : 0) +
          (finalizationData.photos.length > 0 ? 50 : 0),
      errors: validation.sections.step6Complete
        ? []
        : [language === 'fr' ? 'Finalisation AST incomplète' : 'JSA finalization incomplete'],
      lastModified: astData.updatedAt,
    },
  ];
}

export function useASTValidation(
  formData: any,
  finalizationData: FinalizationData,
  tenant: string,
  language: 'fr' | 'en',
  t: any
) {
  const extractCompleteASTData = useCallback((): ASTData => {
    const astNumber =
      formData?.astNumber || `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    return {
      astNumber,
      tenant,
      language,
      createdAt: formData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: formData?.status || 'draft',
      projectInfo: {
        client: formData?.projectInfo?.client || formData?.client || 'Non spécifié',
        projectNumber: formData?.projectInfo?.projectNumber || formData?.projectNumber || 'Non spécifié',
        workLocation: formData?.projectInfo?.workLocation || formData?.workLocation || 'Non spécifié',
        date: formData?.projectInfo?.date || formData?.date || new Date().toISOString().split('T')[0],
        time: formData?.projectInfo?.time || formData?.time || new Date().toTimeString().slice(0, 5),
        industry: formData?.projectInfo?.industry || formData?.industry || 'other',
        workerCount: formData?.projectInfo?.workerCount || formData?.workerCount || 0,
        estimatedDuration: formData?.projectInfo?.estimatedDuration || formData?.estimatedDuration || 'Non spécifié',
        workDescription: formData?.projectInfo?.workDescription || formData?.workDescription || 'Non spécifié',
        clientContact: formData?.projectInfo?.clientContact || formData?.clientContact || 'Non spécifié',
        emergencyContact: formData?.projectInfo?.emergencyContact || formData?.emergencyContact || 'Non spécifié',
        lockoutPoints: formData?.projectInfo?.lockoutPoints || formData?.lockoutPoints || [],
        weatherConditions: formData?.projectInfo?.weatherConditions || formData?.weatherConditions,
        accessRestrictions: formData?.projectInfo?.accessRestrictions || formData?.accessRestrictions,
      },
      equipment: {
        selected: formData?.equipment?.selected || formData?.selectedEquipment || [],
        categories: formData?.equipment?.categories || [],
        mandatory: formData?.equipment?.mandatory || [],
        optional: formData?.equipment?.optional || [],
        totalCost: formData?.equipment?.totalCost || 0,
        inspectionRequired: formData?.equipment?.inspectionRequired || false,
        certifications: formData?.equipment?.certifications || [],
      },
      hazards: {
        identified: formData?.hazards?.identified || formData?.selectedHazards || [],
        riskLevel: formData?.hazards?.riskLevel || 'medium',
        controlMeasures: formData?.hazards?.controlMeasures || [],
        residualRisk: formData?.hazards?.residualRisk || 'low',
        emergencyProcedures: formData?.hazards?.emergencyProcedures || [],
        monitoringRequired: formData?.hazards?.monitoringRequired || false,
      },
      permits: {
        required: formData?.permits?.required || formData?.selectedPermits || [],
        authorities: formData?.permits?.authorities || [],
        validations: formData?.permits?.validations || [],
        expiry: formData?.permits?.expiry || [],
        documents: formData?.permits?.documents || [],
        specialRequirements: formData?.permits?.specialRequirements || [],
      },
      validation: {
        reviewers: formData?.validation?.reviewers || formData?.teamMembers || [],
        approvals: formData?.validation?.approvals || [],
        signatures: formData?.validation?.signatures || [],
        finalApproval: formData?.validation?.finalApproval || false,
        criteria: formData?.validation?.criteria || {},
        comments: formData?.validation?.comments || [],
      },
      finalization: finalizationData,
    };
  }, [formData, finalizationData, tenant, language]);

  const getASTValidation = useMemo(
    () => computeASTValidation(extractCompleteASTData(), language),
    [extractCompleteASTData, language]
  );

  const getSectionValidation = useCallback(
    () => computeSectionValidation(extractCompleteASTData(), getASTValidation, finalizationData, t, language),
    [extractCompleteASTData, getASTValidation, finalizationData, t, language]
  );

  return { extractCompleteASTData, getASTValidation, getSectionValidation };
}
