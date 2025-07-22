// components/steps/Step4Permits/utils/validators/procedures.ts
"use client";

// Types définis localement pour éviter les dépendances manquantes
export interface BilingualText {
  fr: string;
  en: string;
}

export type ProcedureType = 
  | 'confined_space_entry'
  | 'hot_work'
  | 'excavation'
  | 'lockout_tagout'
  | 'fall_protection';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  criticalIssues: ValidationError[];
  suggestions: ValidationSuggestion[];
  confidence: number;
}

export interface ValidationError {
  type: string;
  message: BilingualText;
  field: string;
  critical: boolean;
}

export interface ValidationWarning {
  type: string;
  message: BilingualText;
  field: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationSuggestion {
  type: string;
  message: BilingualText;
  priority: 'low' | 'medium' | 'high';
}

export interface ProcedureStep {
  id: string;
  sequence: number;
  title: BilingualText;
  description?: BilingualText;
  safetyChecks?: string[];
  requiredEquipment?: string[];
  estimatedTime?: number;
  responsible?: string;
  references?: ProcedureReference[];
}

export interface ProcedureReference {
  procedureId: string;
  stepId?: string;
  type: 'prerequisite' | 'related' | 'follow_up';
}

export interface SafetyProtocol {
  type: string;
  description: BilingualText;
  implemented: boolean;
  verificationMethod?: string;
  responsibleRole?: string;
  frequency?: string;
}

export interface EmergencyProcedure {
  id: string;
  type: EmergencyType;
  title: BilingualText;
  description: BilingualText;
  steps: EmergencyStep[];
  tested?: boolean;
  lastDrill?: string | Date;
  contacts?: EmergencyContact[];
}

export interface EmergencyStep {
  sequence: number;
  action: BilingualText;
  responsibleRole: string;
  timeLimit?: number;
}

export interface EmergencyContact {
  role: string;
  name?: string;
  phone: string;
  backup?: string;
}

export interface RiskAssessment {
  id: string;
  lastUpdate: string | Date;
  assessor: string;
  risks: Risk[];
  controlMeasures: ControlMeasure[];
  overallRiskLevel: RiskLevel;
  approved: boolean;
}

export interface Risk {
  id: string;
  description: BilingualText;
  category: string;
  probability: 'low' | 'medium' | 'high';
  consequence: 'minor' | 'moderate' | 'major' | 'catastrophic';
  controls?: string[];
}

export interface WorkPermit {
  id: string;
  type: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  issueDate?: string | Date;
  validFrom?: string | Date;
  validTo?: string | Date;
  authorizedBy?: string;
  conditions?: string[];
}

export interface ProcedureData {
  id: string;
  type: ProcedureType;
  title: BilingualText;
  description?: BilingualText;
  version?: string;
  status?: 'draft' | 'review' | 'approved' | 'active' | 'archived';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  lastReview?: string | Date;
  nextReview?: string | Date;
  steps?: ProcedureStep[];
  safetyProtocols?: SafetyProtocol[];
  emergencyProcedures?: EmergencyProcedure[];
  riskAssessment?: RiskAssessment;
  requiredDocuments?: string[];
  communicationProtocol?: string;
  emergencyContacts?: EmergencyContact[];
  [key: string]: any;
}

// =================== TYPES VALIDATION PROCÉDURES ===================

export interface ProcedureValidationResult extends ValidationResult {
  procedureStatus: ProcedureStatus;
  safetyCompliance: SafetyComplianceStatus;
  completenessStatus: CompletenessStatus;
  emergencyPreparedness: EmergencyPreparednessStatus;
  regulatoryCompliance: RegulatoryComplianceStatus;
  riskManagement: RiskManagementStatus;
}

export interface ProcedureStatus {
  approved: boolean;
  upToDate: boolean;
  executable: boolean;
  lastReview: Date | null;
  nextReviewDue: Date | null;
  revisionRequired: boolean;
  procedureGaps: ProcedureGap[];
}

export interface SafetyComplianceStatus {
  compliant: boolean;
  safetyRating: SafetyRating;
  violatedProtocols: string[];
  missingProtocols: string[];
  riskLevel: RiskLevel;
  mitigationAdequate: boolean;
}

export interface CompletenessStatus {
  complete: boolean;
  missingSteps: string[];
  incompleteSteps: ProcedureStep[];
  missingDocuments: string[];
  documentationGaps: DocumentationGap[];
}

export interface EmergencyPreparednessStatus {
  prepared: boolean;
  emergencyProcedures: EmergencyProcedureStatus[];
  evacuationPlan: boolean;
  communicationPlan: boolean;
  rescuePlan: boolean;
  emergencyContacts: boolean;
}

export interface RegulatoryComplianceStatus {
  compliant: boolean;
  applicableRegulations: string[];
  violatedRegulations: string[];
  requiredDocuments: string[];
  missingDocuments: string[];
  complianceLevel: ComplianceLevel;
}

export interface RiskManagementStatus {
  adequate: boolean;
  identifiedRisks: RiskItem[];
  unmitigatedRisks: RiskItem[];
  riskAssessmentCurrent: boolean;
  controlMeasures: ControlMeasure[];
  residualRiskLevel: RiskLevel;
}

export interface ProcedureGap {
  type: ProcedureGapType;
  description: BilingualText;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: BilingualText;
  regulatoryRequirement?: string;
}

export interface DocumentationGap {
  documentType: string;
  requirement: BilingualText;
  impact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmergencyProcedureStatus {
  type: EmergencyType;
  defined: boolean;
  tested: boolean;
  upToDate: boolean;
  lastDrill: Date | null;
  nextDrillDue: Date | null;
}

export interface RiskItem {
  id: string;
  description: BilingualText;
  probability: 'low' | 'medium' | 'high';
  consequence: 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: RiskLevel;
  mitigated: boolean;
  controls: string[];
}

export interface ControlMeasure {
  type: ControlType;
  description: BilingualText;
  effectiveness: 'low' | 'medium' | 'high';
  implemented: boolean;
  verificationRequired: boolean;
}

export type ProcedureGapType = 
  | 'missing_step'
  | 'incomplete_step'
  | 'missing_safety_check'
  | 'insufficient_detail'
  | 'unclear_instruction'
  | 'missing_equipment_check'
  | 'inadequate_communication'
  | 'missing_emergency_response'
  | 'regulatory_non_compliance';

export type EmergencyType = 
  | 'atmospheric_hazard'
  | 'entrapment'
  | 'equipment_failure'
  | 'medical_emergency'
  | 'fire_explosion'
  | 'structural_collapse'
  | 'communication_failure'
  | 'weather_emergency';

export type ControlType = 
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type SafetyRating = 1 | 2 | 3 | 4 | 5;
export type ComplianceLevel = 'non_compliant' | 'partially_compliant' | 'mostly_compliant' | 'fully_compliant';

// =================== CONSTANTES PROCÉDURES ===================

const REQUIRED_PROCEDURES: Record<ProcedureType, {
  mandatorySteps: string[];
  safetyProtocols: string[];
  emergencyProcedures: EmergencyType[];
  documents: string[];
  reviewInterval: number; // mois
  regulatoryBasis: string[];
}> = {
  confined_space_entry: {
    mandatorySteps: [
      'pre_entry_atmospheric_testing',
      'hazard_identification',
      'isolation_verification',
      'ventilation_setup',
      'communication_establishment',
      'emergency_equipment_check',
      'personnel_briefing',
      'entry_authorization',
      'continuous_monitoring',
      'exit_procedures'
    ],
    safetyProtocols: [
      'atmospheric_monitoring',
      'ventilation_protocol',
      'isolation_lockout',
      'communication_protocol',
      'emergency_response',
      'ppe_requirements',
      'personnel_accountability'
    ],
    emergencyProcedures: [
      'atmospheric_hazard',
      'entrapment',
      'equipment_failure',
      'medical_emergency',
      'communication_failure'
    ],
    documents: [
      'entry_permit',
      'risk_assessment',
      'atmospheric_test_results',
      'isolation_certificate',
      'emergency_action_plan',
      'personnel_qualifications'
    ],
    reviewInterval: 12,
    regulatoryBasis: [
      'CSA Z1006',
      'Provincial OHS Regulations',
      'Municipal Bylaws'
    ]
  },
  hot_work: {
    mandatorySteps: [
      'fire_watch_assignment',
      'area_inspection',
      'fire_prevention_measures',
      'equipment_inspection',
      'atmospheric_testing',
      'work_authorization',
      'continuous_monitoring',
      'post_work_inspection'
    ],
    safetyProtocols: [
      'fire_prevention',
      'hot_work_monitoring',
      'fire_watch_protocol',
      'emergency_response',
      'equipment_maintenance'
    ],
    emergencyProcedures: [
      'fire_explosion',
      'atmospheric_hazard',
      'equipment_failure'
    ],
    documents: [
      'hot_work_permit',
      'fire_watch_certificate',
      'equipment_inspection_log',
      'atmospheric_test_results'
    ],
    reviewInterval: 6,
    regulatoryBasis: [
      'Fire Code',
      'Provincial OHS Regulations'
    ]
  },
  excavation: {
    mandatorySteps: [
      'utility_location',
      'soil_analysis',
      'shoring_design',
      'atmospheric_testing',
      'access_egress_plan',
      'water_control',
      'daily_inspection',
      'entry_authorization'
    ],
    safetyProtocols: [
      'excavation_safety',
      'utility_protection',
      'atmospheric_monitoring',
      'structural_integrity',
      'access_control'
    ],
    emergencyProcedures: [
      'structural_collapse',
      'atmospheric_hazard',
      'entrapment'
    ],
    documents: [
      'excavation_permit',
      'utility_clearance',
      'soil_report',
      'shoring_plan',
      'inspection_log'
    ],
    reviewInterval: 12,
    regulatoryBasis: [
      'Provincial OHS Regulations',
      'Municipal Excavation Bylaws'
    ]
  },
  lockout_tagout: {
    mandatorySteps: [
      'energy_source_identification',
      'shutdown_procedure',
      'isolation_verification',
      'lockout_application',
      'stored_energy_release',
      'isolation_testing',
      'work_authorization',
      'restoration_procedure'
    ],
    safetyProtocols: [
      'energy_isolation',
      'lockout_verification',
      'group_lockout',
      'stored_energy_control',
      'restoration_safety'
    ],
    emergencyProcedures: [
      'equipment_failure',
      'medical_emergency'
    ],
    documents: [
      'lockout_procedure',
      'energy_assessment',
      'isolation_certificate',
      'equipment_list'
    ],
    reviewInterval: 24,
    regulatoryBasis: [
      'Provincial OHS Regulations',
      'CSA Z460'
    ]
  },
  fall_protection: {
    mandatorySteps: [
      'fall_hazard_assessment',
      'protection_system_selection',
      'anchor_point_verification',
      'equipment_inspection',
      'rescue_plan_development',
      'worker_training_verification',
      'system_installation',
      'pre_use_inspection'
    ],
    safetyProtocols: [
      'fall_protection_hierarchy',
      'equipment_maintenance',
      'rescue_procedures',
      'training_requirements',
      'inspection_protocols'
    ],
    emergencyProcedures: [
      'medical_emergency',
      'equipment_failure'
    ],
    documents: [
      'fall_protection_plan',
      'equipment_certificates',
      'rescue_plan',
      'training_records'
    ],
    reviewInterval: 12,
    regulatoryBasis: [
      'Provincial OHS Regulations',
      'CSA Z259 Series'
    ]
  }
};

const REGULATORY_REQUIREMENTS: Record<string, {
  applicableProcedures: ProcedureType[];
  mandatoryElements: string[];
  documentationRequired: string[];
  inspectionFrequency: string;
  penalties: string[];
}> = {
  'CSA Z1006': {
    applicableProcedures: ['confined_space_entry'],
    mandatoryElements: [
      'Written Program',
      'Hazard Assessment',
      'Entry Procedures',
      'Atmospheric Testing',
      'Emergency Response'
    ],
    documentationRequired: [
      'Program Documentation',
      'Training Records',
      'Entry Permits',
      'Test Results',
      'Incident Reports'
    ],
    inspectionFrequency: 'Annual',
    penalties: ['Work Stoppage', 'Fines', 'Prosecution']
  },
  'Provincial OHS Regulations': {
    applicableProcedures: ['confined_space_entry', 'hot_work', 'excavation', 'lockout_tagout', 'fall_protection'],
    mandatoryElements: [
      'Written Procedures',
      'Worker Training',
      'Supervision',
      'Equipment Standards',
      'Record Keeping'
    ],
    documentationRequired: [
      'Safety Program',
      'Procedures Manual',
      'Training Records',
      'Inspection Reports',
      'Incident Reports'
    ],
    inspectionFrequency: 'As Required',
    penalties: ['Administrative Penalties', 'Work Orders', 'Prosecution']
  }
};

const RISK_MATRIX = {
  probability: {
    low: 1,
    medium: 2,
    high: 3
  },
  consequence: {
    minor: 1,
    moderate: 2,
    major: 3,
    catastrophic: 4
  }
};

const EMERGENCY_DRILL_INTERVALS = { // mois
  atmospheric_hazard: 6,
  entrapment: 12,
  equipment_failure: 12,
  medical_emergency: 6,
  fire_explosion: 6,
  structural_collapse: 12,
  communication_failure: 12,
  weather_emergency: 12
};

// =================== FONCTIONS VALIDATION PRINCIPALES ===================

/**
 * Valide une procédure complète
 */
export function validateProcedure(procedure: ProcedureData): ProcedureValidationResult {
  const baseValidation = validateBasicProcedureData(procedure);
  
  // Validations spécialisées
  const procedureStatus = assessProcedureStatus(procedure);
  const safetyCompliance = validateSafetyCompliance(procedure);
  const completenessStatus = validateCompleteness(procedure);
  const emergencyPreparedness = validateEmergencyPreparedness(procedure);
  const regulatoryCompliance = validateRegulatoryCompliance(procedure);
  const riskManagement = validateRiskManagement(procedure);

  // Fusion résultats
  const combinedResult: ProcedureValidationResult = {
    ...baseValidation,
    procedureStatus,
    safetyCompliance,
    completenessStatus,
    emergencyPreparedness,
    regulatoryCompliance,
    riskManagement
  };

  // Recalcul validité globale
  combinedResult.isValid = combinedResult.errors.filter(e => e.critical).length === 0 &&
                          procedureStatus.approved &&
                          safetyCompliance.compliant &&
                          completenessStatus.complete &&
                          emergencyPreparedness.prepared &&
                          regulatoryCompliance.compliant &&
                          riskManagement.adequate;

  return combinedResult;
}

/**
 * Valide un ensemble de procédures
 */
export function validateProcedureSet(procedures: ProcedureData[]): ProcedureValidationResult {
  if (procedures.length === 0) {
    return createEmptyProcedureValidationResult('Aucune procédure fournie');
  }

  const individualResults = procedures.map(proc => validateProcedure(proc));
  
  // Validation ensemble
  const coherenceValidation = validateProcedureCoherence(procedures);
  const coverageValidation = validateProcedureCoverage(procedures);
  const integrationValidation = validateProcedureIntegration(procedures);

  // Fusion tous résultats
  const allErrors = individualResults.flatMap(r => r.errors).concat(
    coherenceValidation.errors,
    coverageValidation.errors,
    integrationValidation.errors
  );
  
  const allWarnings = individualResults.flatMap(r => r.warnings).concat(
    coherenceValidation.warnings,
    coverageValidation.warnings,
    integrationValidation.warnings
  );
  
  const allSuggestions = individualResults.flatMap(r => r.suggestions).concat(
    coherenceValidation.suggestions,
    coverageValidation.suggestions,
    integrationValidation.suggestions
  );

  // Statuts ensemble
  const procedureStatus = aggregateProcedureStatus(individualResults);
  const safetyCompliance = aggregateSafetyCompliance(individualResults);
  const completenessStatus = aggregateCompleteness(individualResults);
  const emergencyPreparedness = aggregateEmergencyPreparedness(individualResults);
  const regulatoryCompliance = aggregateRegulatoryCompliance(individualResults);
  const riskManagement = aggregateRiskManagement(individualResults);

  return {
    isValid: allErrors.filter(e => e.critical).length === 0,
    errors: allErrors,
    warnings: allWarnings,
    criticalIssues: allErrors.filter(e => e.critical),
    suggestions: allSuggestions,
    confidence: calculateSetConfidence(individualResults),
    procedureStatus,
    safetyCompliance,
    completenessStatus,
    emergencyPreparedness,
    regulatoryCompliance,
    riskManagement
  };
}

// =================== VALIDATIONS SPÉCIALISÉES ===================

/**
 * Validation données de base procédure
 */
function validateBasicProcedureData(procedure: ProcedureData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Champs obligatoires
  if (!procedure.id) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'ID procédure requis', en: 'Procedure ID required' },
      field: 'id',
      critical: true
    });
  }

  if (!procedure.type) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Type procédure requis', en: 'Procedure type required' },
      field: 'type',
      critical: true
    });
  }

  if (!procedure.title || !procedure.title.fr || !procedure.title.en) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Titre procédure requis (bilingue)', en: 'Procedure title required (bilingual)' },
      field: 'title',
      critical: true
    });
  }

  if (!procedure.steps || procedure.steps.length === 0) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Étapes procédure requises', en: 'Procedure steps required' },
      field: 'steps',
      critical: true
    });
  }

  // Validation dates
  if (procedure.lastReview && procedure.nextReview) {
    if (new Date(procedure.nextReview) <= new Date(procedure.lastReview)) {
      warnings.push({
        type: 'invalid_dates',
        message: { fr: 'Date prochaine révision invalide', en: 'Invalid next review date' },
        field: 'nextReview',
        severity: 'medium'
      });
    }
  }

  if (procedure.nextReview && new Date(procedure.nextReview) < new Date()) {
    warnings.push({
      type: 'review_overdue',
      message: { fr: 'Révision procédure en retard', en: 'Procedure review overdue' },
      field: 'nextReview',
      severity: 'high'
    });
  }

  return {
    isValid: errors.filter(e => e.critical).length === 0,
    errors,
    warnings,
    criticalIssues: errors.filter(e => e.critical),
    suggestions,
    confidence: errors.length === 0 ? 1 : 0.7
  };
}

/**
 * Évalue statut procédure
 */
function assessProcedureStatus(procedure: ProcedureData): ProcedureStatus {
  const procedureGaps: ProcedureGap[] = [];
  
  const requirements = REQUIRED_PROCEDURES[procedure.type];
  if (!requirements) {
    procedureGaps.push({
      type: 'regulatory_non_compliance',
      description: {
        fr: `Type de procédure non reconnu: ${procedure.type}`,
        en: `Unrecognized procedure type: ${procedure.type}`
      },
      severity: 'critical',
      recommendedAction: {
        fr: 'Définir les exigences pour ce type de procédure',
        en: 'Define requirements for this procedure type'
      }
    });
  }

  // Vérifier étapes obligatoires
  if (requirements) {
    const currentSteps = procedure.steps?.map(s => s.id) || [];
    const missingSteps = requirements.mandatorySteps.filter(step => !currentSteps.includes(step));
    
    missingSteps.forEach(step => {
      procedureGaps.push({
        type: 'missing_step',
        description: {
          fr: `Étape obligatoire manquante: ${step}`,
          en: `Missing mandatory step: ${step}`
        },
        severity: 'high',
        recommendedAction: {
          fr: `Ajouter l'étape: ${step}`,
          en: `Add step: ${step}`
        },
        regulatoryRequirement: requirements.regulatoryBasis.join(', ')
      });
    });
  }

  const approved = procedure.approvalStatus === 'approved';
  const lastReview = procedure.lastReview ? new Date(procedure.lastReview) : null;
  const reviewInterval = requirements?.reviewInterval || 12;
  const nextReviewDue = lastReview ? 
    new Date(lastReview.getTime() + reviewInterval * 30 * 24 * 60 * 60 * 1000) : 
    new Date();

  const upToDate = lastReview ? new Date() <= nextReviewDue : false;
  const executable = approved && upToDate && procedureGaps.filter(g => g.severity === 'critical').length === 0;
  const revisionRequired = !upToDate || procedureGaps.length > 0;

  return {
    approved,
    upToDate,
    executable,
    lastReview,
    nextReviewDue,
    revisionRequired,
    procedureGaps
  };
}

/**
 * Valide conformité sécurité
 */
function validateSafetyCompliance(procedure: ProcedureData): SafetyComplianceStatus {
  const requirements = REQUIRED_PROCEDURES[procedure.type];
  const currentProtocols = procedure.safetyProtocols?.map(p => p.type) || [];
  
  const missingProtocols = requirements?.safetyProtocols.filter(protocol => 
    !currentProtocols.includes(protocol)
  ) || [];

  const violatedProtocols: string[] = [];
  
  // Vérifier implémentation des protocoles
  procedure.safetyProtocols?.forEach(protocol => {
    if (!protocol.implemented) {
      violatedProtocols.push(protocol.type);
    }
  });

  const compliant = missingProtocols.length === 0 && violatedProtocols.length === 0;
  const safetyRating = calculateSafetyRating(procedure);
  const riskLevel = assessOverallRiskLevel(procedure);
  const mitigationAdequate = assessMitigationAdequacy(procedure);

  return {
    compliant,
    safetyRating,
    violatedProtocols,
    missingProtocols,
    riskLevel,
    mitigationAdequate
  };
}

/**
 * Valide complétude
 */
function validateCompleteness(procedure: ProcedureData): CompletenessStatus {
  const requirements = REQUIRED_PROCEDURES[procedure.type];
  const missingSteps: string[] = [];
  const incompleteSteps: ProcedureStep[] = [];
  const missingDocuments: string[] = [];
  const documentationGaps: DocumentationGap[] = [];

  // Vérifier étapes
  if (requirements) {
    const currentSteps = procedure.steps?.map(s => s.id) || [];
    missingSteps.push(...requirements.mandatorySteps.filter(step => !currentSteps.includes(step)));
  }

  // Vérifier complétude des étapes
  procedure.steps?.forEach(step => {
    if (!step.description?.fr || !step.description?.en) {
      incompleteSteps.push(step);
    }
    if (!step.safetyChecks || step.safetyChecks.length === 0) {
      incompleteSteps.push(step);
    }
  });

  // Vérifier documents
  if (requirements) {
    const currentDocs = procedure.requiredDocuments || [];
    missingDocuments.push(...requirements.documents.filter(doc => !currentDocs.includes(doc)));
    
    missingDocuments.forEach(doc => {
      documentationGaps.push({
        documentType: doc,
        requirement: {
          fr: `Document requis: ${doc}`,
          en: `Required document: ${doc}`
        },
        impact: 'compliance',
        priority: 'high'
      });
    });
  }

  const complete = missingSteps.length === 0 && 
                  incompleteSteps.length === 0 && 
                  missingDocuments.length === 0;

  return {
    complete,
    missingSteps,
    incompleteSteps,
    missingDocuments,
    documentationGaps
  };
}

/**
 * Valide préparation urgence
 */
function validateEmergencyPreparedness(procedure: ProcedureData): EmergencyPreparednessStatus {
  const requirements = REQUIRED_PROCEDURES[procedure.type];
  const requiredEmergencies = requirements?.emergencyProcedures || [];
  
  const emergencyProcedures: EmergencyProcedureStatus[] = [];
  
  requiredEmergencies.forEach(emergencyType => {
    const procedure_found = procedure.emergencyProcedures?.find(ep => ep.type === emergencyType);
    const drillInterval = EMERGENCY_DRILL_INTERVALS[emergencyType] || 12;
    
    const lastDrill = procedure_found?.lastDrill ? new Date(procedure_found.lastDrill) : null;
    const nextDrillDue = lastDrill ? 
      new Date(lastDrill.getTime() + drillInterval * 30 * 24 * 60 * 60 * 1000) : 
      new Date();

    emergencyProcedures.push({
      type: emergencyType,
      defined: !!procedure_found,
      tested: !!procedure_found?.tested,
      upToDate: lastDrill ? new Date() <= nextDrillDue : false,
      lastDrill,
      nextDrillDue
    });
  });

  const evacuationPlan = procedure.emergencyProcedures?.some(ep => ep.type === 'atmospheric_hazard') || false;
  const communicationPlan = procedure.communicationProtocol !== undefined;
  const rescuePlan = procedure.emergencyProcedures?.some(ep => ep.type === 'entrapment') || false;
  const emergencyContacts = (procedure.emergencyContacts?.length || 0) > 0;

  const prepared = emergencyProcedures.every(ep => ep.defined && ep.upToDate) &&
                  evacuationPlan &&
                  communicationPlan &&
                  rescuePlan &&
                  emergencyContacts;

  return {
    prepared,
    emergencyProcedures,
    evacuationPlan,
    communicationPlan,
    rescuePlan,
    emergencyContacts
  };
}

/**
 * Valide conformité réglementaire
 */
function validateRegulatoryCompliance(procedure: ProcedureData): RegulatoryComplianceStatus {
  const applicableRegulations: string[] = [];
  const violatedRegulations: string[] = [];
  const requiredDocuments: string[] = [];
  const missingDocuments: string[] = [];

  // Identifier réglementations applicables
  Object.entries(REGULATORY_REQUIREMENTS).forEach(([regulation, req]) => {
    if (req.applicableProcedures.includes(procedure.type)) {
      applicableRegulations.push(regulation);
      requiredDocuments.push(...req.documentationRequired);
      
      // Vérifier éléments obligatoires
      const hasAllElements = req.mandatoryElements.every(element => {
        // Logique simplifiée - peut être étendue
        return procedure.steps?.some(step => 
          step.description?.fr.toLowerCase().includes(element.toLowerCase()) ||
          step.description?.en.toLowerCase().includes(element.toLowerCase())
        );
      });
      
      if (!hasAllElements) {
        violatedRegulations.push(regulation);
      }
    }
  });

  // Vérifier documents
  const currentDocs = procedure.requiredDocuments || [];
  missingDocuments.push(...requiredDocuments.filter(doc => !currentDocs.includes(doc)));

  const compliant = violatedRegulations.length === 0 && missingDocuments.length === 0;
  const complianceLevel = calculateComplianceLevel(violatedRegulations.length, missingDocuments.length);

  return {
    compliant,
    applicableRegulations,
    violatedRegulations,
    requiredDocuments,
    missingDocuments,
    complianceLevel
  };
}

/**
 * Valide gestion risques
 */
function validateRiskManagement(procedure: ProcedureData): RiskManagementStatus {
  const riskAssessment = procedure.riskAssessment;
  const identifiedRisks: RiskItem[] = [];
  const unmitigatedRisks: RiskItem[] = [];
  const controlMeasures: ControlMeasure[] = [];

  if (riskAssessment?.risks) {
    riskAssessment.risks.forEach(risk => {
      const riskItem: RiskItem = {
        id: risk.id,
        description: risk.description,
        probability: risk.probability,
        consequence: risk.consequence,
        riskLevel: calculateRiskLevel(risk.probability, risk.consequence),
        mitigated: (risk.controls?.length || 0) > 0,
        controls: risk.controls || []
      };
      
      identifiedRisks.push(riskItem);
      
      if (!riskItem.mitigated || riskItem.riskLevel === 'very_high') {
        unmitigatedRisks.push(riskItem);
      }
    });
  }

  if (riskAssessment?.controlMeasures) {
    controlMeasures.push(...riskAssessment.controlMeasures.map(cm => ({
      type: cm.type,
      description: cm.description,
      effectiveness: cm.effectiveness,
      implemented: cm.implemented,
      verificationRequired: cm.verificationRequired
    })));
  }

  const riskAssessmentCurrent = riskAssessment?.lastUpdate ? 
    (Date.now() - new Date(riskAssessment.lastUpdate).getTime()) < (365 * 24 * 60 * 60 * 1000) : 
    false;

  const residualRiskLevel = calculateResidualRiskLevel(identifiedRisks, controlMeasures);
  const adequate = unmitigatedRisks.length === 0 && 
                  riskAssessmentCurrent && 
                  residualRiskLevel !== 'very_high';

  return {
    adequate,
    identifiedRisks,
    unmitigatedRisks,
    riskAssessmentCurrent,
    controlMeasures,
    residualRiskLevel
  };
}

// =================== VALIDATIONS ENSEMBLE ===================

/**
 * Valide cohérence entre procédures
 */
function validateProcedureCoherence(procedures: ProcedureData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Vérifier cohérence des protocoles de sécurité
  const allProtocols = procedures.flatMap(p => p.safetyProtocols || []);
  const protocolConflicts = findProtocolConflicts(allProtocols);
  
  protocolConflicts.forEach(conflict => {
    warnings.push({
      type: 'procedure_conflict',
      message: {
        fr: `Conflit de protocoles: ${conflict}`,
        en: `Protocol conflict: ${conflict}`
      },
      field: 'protocols',
      severity: 'medium'
    });
  });

  // Vérifier cohérence des communications
  const commProtocols = procedures.map(p => p.communicationProtocol).filter(cp => cp);
  if (new Set(commProtocols).size > 1) {
    warnings.push({
      type: 'communication_inconsistency',
      message: {
        fr: 'Protocoles communication incohérents entre procédures',
        en: 'Inconsistent communication protocols across procedures'
      },
      field: 'communication',
      severity: 'medium'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: errors,
    suggestions,
    confidence: 0.9
  };
}

/**
 * Valide couverture procédures
 */
function validateProcedureCoverage(procedures: ProcedureData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  const procedureTypes = procedures.map(p => p.type);
  const uniqueTypes = [...new Set(procedureTypes)];

  // Vérifier couverture types critiques
  const criticalTypes: ProcedureType[] = ['confined_space_entry'];
  const missingCritical = criticalTypes.filter(type => !uniqueTypes.includes(type));
  
  missingCritical.forEach(type => {
    errors.push({
      type: 'missing_critical_procedure',
      message: {
        fr: `Procédure critique manquante: ${type}`,
        en: `Missing critical procedure: ${type}`
      },
      field: 'procedures',
      critical: true
    });
  });

  // Suggérer procédures complémentaires
  if (uniqueTypes.includes('confined_space_entry') && !uniqueTypes.includes('lockout_tagout')) {
    suggestions.push({
      type: 'add_complementary_procedure',
      message: {
        fr: 'Ajouter procédure cadenassage recommandée',
        en: 'Adding lockout/tagout procedure recommended'
      },
      priority: 'medium'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: errors,
    suggestions,
    confidence: 0.9
  };
}

/**
 * Valide intégration procédures
 */
function validateProcedureIntegration(procedures: ProcedureData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Vérifier références croisées
  procedures.forEach(procedure => {
    procedure.steps?.forEach(step => {
      if (step.references) {
        step.references.forEach(ref => {
          const referencedProcedure = procedures.find(p => p.id === ref.procedureId);
          if (!referencedProcedure) {
            errors.push({
              type: 'broken_reference',
              message: {
                fr: `Référence brisée vers procédure: ${ref.procedureId}`,
                en: `Broken reference to procedure: ${ref.procedureId}`
              },
              field: 'references',
              critical: false
            });
          }
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: [],
    suggestions,
    confidence: 0.95
  };
}

// =================== FONCTIONS UTILITAIRES ===================

function calculateSafetyRating(procedure: ProcedureData): SafetyRating {
  let score = 3; // Base
  
  // Facteurs positifs
  if (procedure.safetyProtocols && procedure.safetyProtocols.length > 0) score += 0.5;
  if (procedure.emergencyProcedures && procedure.emergencyProcedures.length > 0) score += 0.5;
  if (procedure.riskAssessment) score += 0.5;
  
  // Facteurs négatifs
  if (procedure.safetyProtocols?.some(p => !p.implemented)) score -= 1;
  if (!procedure.lastReview) score -= 0.5;
  
  return Math.max(1, Math.min(5, Math.round(score))) as SafetyRating;
}

function assessOverallRiskLevel(procedure: ProcedureData): RiskLevel {
  if (!procedure.riskAssessment?.risks) return 'medium';
  
  const riskLevels = procedure.riskAssessment.risks.map(risk => 
    calculateRiskLevel(risk.probability, risk.consequence)
  );
  
  if (riskLevels.includes('very_high')) return 'very_high';
  if (riskLevels.includes('high')) return 'high';
  if (riskLevels.includes('medium')) return 'medium';
  if (riskLevels.includes('low')) return 'low';
  return 'very_low';
}

function assessMitigationAdequacy(procedure: ProcedureData): boolean {
  if (!procedure.riskAssessment?.risks) return false;
  
  return procedure.riskAssessment.risks.every(risk => 
    (risk.controls?.length || 0) > 0
  );
}

function calculateRiskLevel(probability: string, consequence: string): RiskLevel {
  const probScore = RISK_MATRIX.probability[probability as keyof typeof RISK_MATRIX.probability] || 2;
  const consScore = RISK_MATRIX.consequence[consequence as keyof typeof RISK_MATRIX.consequence] || 2;
  const riskScore = probScore * consScore;
  
  if (riskScore <= 2) return 'very_low';
  if (riskScore <= 4) return 'low';
  if (riskScore <= 6) return 'medium';
  if (riskScore <= 9) return 'high';
  return 'very_high';
}

function calculateComplianceLevel(violatedCount: number, missingDocsCount: number): ComplianceLevel {
  const totalIssues = violatedCount + missingDocsCount;
  
  if (totalIssues === 0) return 'fully_compliant';
  if (totalIssues <= 2) return 'mostly_compliant';
  if (totalIssues <= 5) return 'partially_compliant';
  return 'non_compliant';
}

function calculateResidualRiskLevel(risks: RiskItem[], controls: ControlMeasure[]): RiskLevel {
  const implementedControls = controls.filter(c => c.implemented);
  const controlEffectiveness = implementedControls.length / Math.max(controls.length, 1);
  
  const highRisks = risks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'very_high').length;
  
  if (highRisks > 0 && controlEffectiveness < 0.8) return 'high';
  if (highRisks > 0) return 'medium';
  if (controlEffectiveness < 0.5) return 'medium';
  return 'low';
}

function findProtocolConflicts(protocols: SafetyProtocol[]): string[] {
  // Logique simplifiée - peut être étendue
  const conflicts: string[] = [];
  
  const protocolsByType = protocols.reduce((groups, protocol) => {
    if (!groups[protocol.type]) groups[protocol.type] = [];
    groups[protocol.type].push(protocol);
    return groups;
  }, {} as Record<string, SafetyProtocol[]>);

  Object.entries(protocolsByType).forEach(([type, typeProtocols]) => {
    if (typeProtocols.length > 1) {
      const implemented = typeProtocols.filter(p => p.implemented).length;
      const notImplemented = typeProtocols.length - implemented;
      
      if (implemented > 0 && notImplemented > 0) {
        conflicts.push(`${type}: implémentation incohérente`);
      }
    }
  });

  return conflicts;
}

// Fonctions d'agrégation
function aggregateProcedureStatus(results: ProcedureValidationResult[]): ProcedureStatus {
  return {
    approved: results.every(r => r.procedureStatus.approved),
    upToDate: results.every(r => r.procedureStatus.upToDate),
    executable: results.every(r => r.procedureStatus.executable),
    lastReview: getLatestDate(results.map(r => r.procedureStatus.lastReview)),
    nextReviewDue: getEarliestDate(results.map(r => r.procedureStatus.nextReviewDue)),
    revisionRequired: results.some(r => r.procedureStatus.revisionRequired),
    procedureGaps: results.flatMap(r => r.procedureStatus.procedureGaps)
  };
}

function aggregateSafetyCompliance(results: ProcedureValidationResult[]): SafetyComplianceStatus {
  return {
    compliant: results.every(r => r.safetyCompliance.compliant),
    safetyRating: Math.min(...results.map(r => r.safetyCompliance.safetyRating)) as SafetyRating,
    violatedProtocols: [...new Set(results.flatMap(r => r.safetyCompliance.violatedProtocols))],
    missingProtocols: [...new Set(results.flatMap(r => r.safetyCompliance.missingProtocols))],
    riskLevel: getHighestRiskLevel(results.map(r => r.safetyCompliance.riskLevel)),
    mitigationAdequate: results.every(r => r.safetyCompliance.mitigationAdequate)
  };
}

function aggregateCompleteness(results: ProcedureValidationResult[]): CompletenessStatus {
  return {
    complete: results.every(r => r.completenessStatus.complete),
    missingSteps: [...new Set(results.flatMap(r => r.completenessStatus.missingSteps))],
    incompleteSteps: results.flatMap(r => r.completenessStatus.incompleteSteps),
    missingDocuments: [...new Set(results.flatMap(r => r.completenessStatus.missingDocuments))],
    documentationGaps: results.flatMap(r => r.completenessStatus.documentationGaps)
  };
}

function aggregateEmergencyPreparedness(results: ProcedureValidationResult[]): EmergencyPreparednessStatus {
  return {
    prepared: results.every(r => r.emergencyPreparedness.prepared),
    emergencyProcedures: results.flatMap(r => r.emergencyPreparedness.emergencyProcedures),
    evacuationPlan: results.every(r => r.emergencyPreparedness.evacuationPlan),
    communicationPlan: results.every(r => r.emergencyPreparedness.communicationPlan),
    rescuePlan: results.some(r => r.emergencyPreparedness.rescuePlan),
    emergencyContacts: results.every(r => r.emergencyPreparedness.emergencyContacts)
  };
}

function aggregateRegulatoryCompliance(results: ProcedureValidationResult[]): RegulatoryComplianceStatus {
  return {
    compliant: results.every(r => r.regulatoryCompliance.compliant),
    applicableRegulations: [...new Set(results.flatMap(r => r.regulatoryCompliance.applicableRegulations))],
    violatedRegulations: [...new Set(results.flatMap(r => r.regulatoryCompliance.violatedRegulations))],
    requiredDocuments: [...new Set(results.flatMap(r => r.regulatoryCompliance.requiredDocuments))],
    missingDocuments: [...new Set(results.flatMap(r => r.regulatoryCompliance.missingDocuments))],
    complianceLevel: getLowestComplianceLevel(results.map(r => r.regulatoryCompliance.complianceLevel))
  };
}

function aggregateRiskManagement(results: ProcedureValidationResult[]): RiskManagementStatus {
  return {
    adequate: results.every(r => r.riskManagement.adequate),
    identifiedRisks: results.flatMap(r => r.riskManagement.identifiedRisks),
    unmitigatedRisks: results.flatMap(r => r.riskManagement.unmitigatedRisks),
    riskAssessmentCurrent: results.every(r => r.riskManagement.riskAssessmentCurrent),
    controlMeasures: results.flatMap(r => r.riskManagement.controlMeasures),
    residualRiskLevel: getHighestRiskLevel(results.map(r => r.riskManagement.residualRiskLevel))
  };
}

function getHighestRiskLevel(levels: RiskLevel[]): RiskLevel {
  const priority = { 'very_high': 5, 'high': 4, 'medium': 3, 'low': 2, 'very_low': 1 };
  const highest = Math.max(...levels.map(l => priority[l]));
  return Object.keys(priority).find(k => priority[k as keyof typeof priority] === highest) as RiskLevel;
}

function getLowestComplianceLevel(levels: ComplianceLevel[]): ComplianceLevel {
  const priority = { 'non_compliant': 1, 'partially_compliant': 2, 'mostly_compliant': 3, 'fully_compliant': 4 };
  const lowest = Math.min(...levels.map(l => priority[l]));
  return Object.keys(priority).find(k => priority[k as keyof typeof priority] === lowest) as ComplianceLevel;
}

function calculateSetConfidence(results: ProcedureValidationResult[]): number {
  if (results.length === 0) return 0;
  const average = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  return Math.round(average * 100) / 100;
}

function getLatestDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  return validDates.length > 0 ? new Date(Math.max(...validDates.map(d => d.getTime()))) : null;
}

function getEarliestDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  return validDates.length > 0 ? new Date(Math.min(...validDates.map(d => d.getTime()))) : null;
}

function createEmptyProcedureValidationResult(message: string): ProcedureValidationResult {
  return {
    isValid: false,
    errors: [{
      type: 'missing_required',
      message: { fr: message, en: message },
      field: 'procedures',
      critical: true
    }],
    warnings: [],
    criticalIssues: [],
    suggestions: [],
    confidence: 0,
    procedureStatus: {
      approved: false,
      upToDate: false,
      executable: false,
      lastReview: null,
      nextReviewDue: null,
      revisionRequired: true,
      procedureGaps: []
    },
    safetyCompliance: {
      compliant: false,
      safetyRating: 1,
      violatedProtocols: [],
      missingProtocols: [],
      riskLevel: 'very_high',
      mitigationAdequate: false
    },
    completenessStatus: {
      complete: false,
      missingSteps: [],
      incompleteSteps: [],
      missingDocuments: [],
      documentationGaps: []
    },
    emergencyPreparedness: {
      prepared: false,
      emergencyProcedures: [],
      evacuationPlan: false,
      communicationPlan: false,
      rescuePlan: false,
      emergencyContacts: false
    },
    regulatoryCompliance: {
      compliant: false,
      applicableRegulations: [],
      violatedRegulations: [],
      requiredDocuments: [],
      missingDocuments: [],
      complianceLevel: 'non_compliant'
    },
    riskManagement: {
      adequate: false,
      identifiedRisks: [],
      unmitigatedRisks: [],
      riskAssessmentCurrent: false,
      controlMeasures: [],
      residualRiskLevel: 'very_high'
    }
  };
}

// =================== EXPORTS ===================

// Export des constantes pour l'index
export { REQUIRED_PROCEDURES, REGULATORY_REQUIREMENTS, EMERGENCY_DRILL_INTERVALS };

// Export des fonctions principales
export { validateProcedure, validateProcedureSet };

export default {
  validateProcedure,
  validateProcedureSet,
  REQUIRED_PROCEDURES,
  REGULATORY_REQUIREMENTS,
  EMERGENCY_DRILL_INTERVALS
};
