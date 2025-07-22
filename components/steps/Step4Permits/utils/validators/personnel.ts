// components/steps/Step4Permits/utils/validators/personnel.ts
"use client";

// Types définis localement pour éviter les dépendances manquantes
export interface BilingualText {
  fr: string;
  en: string;
}

export type PersonnelRole = 
  | 'entry_supervisor'
  | 'entrant'
  | 'attendant'
  | 'rescue_team_member'
  | 'safety_officer'
  | 'support_personnel';

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

export interface CertificationRecord {
  id: string;
  type: string;
  issuedBy: string;
  issueDate: string | Date;
  expiryDate?: string | Date;
  certificateNumber?: string;
  status: 'valid' | 'expired' | 'suspended' | 'pending';
}

export interface TrainingRecord {
  id: string;
  course: string;
  provider: string;
  completionDate: string | Date;
  instructor?: string;
  score?: number;
  duration?: number; // heures
  status: 'completed' | 'in_progress' | 'failed' | 'expired';
}

export interface MedicalClearance {
  status: 'cleared' | 'restricted' | 'unfit' | 'pending';
  lastExam?: string | Date;
  nextExamDue?: string | Date;
  examiningPhysician?: string;
  restrictions?: MedicalRestriction[];
  fitnessLevel?: FitnessLevel;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
}

export interface PersonnelData {
  id: string;
  name: string;
  employeeId?: string;
  role: PersonnelRole;
  hireDate?: string | Date;
  experienceYears?: number;
  certifications?: CertificationRecord[];
  training?: TrainingRecord[];
  medicalClearance?: MedicalClearance;
  emergencyContact?: EmergencyContact;
  communicationDevice?: string;
  [key: string]: any;
}

// =================== TYPES VALIDATION PERSONNEL ===================

export interface PersonnelValidationResult extends ValidationResult {
  personnelStatus: PersonnelStatus;
  qualificationStatus: QualificationStatus;
  trainingStatus: TrainingStatus;
  medicalStatus: MedicalStatus;
  teamComposition: TeamCompositionStatus;
  emergencyReadiness: EmergencyReadinessStatus;
}

export interface PersonnelStatus {
  authorized: boolean;
  readyForEntry: boolean;
  restrictions: PersonnelRestriction[];
  lastMedicalExam: Date | null;
  nextMedicalDue: Date | null;
  experienceLevel: ExperienceLevel;
}

export interface QualificationStatus {
  qualified: boolean;
  requiredCertifications: string[];
  missingCertifications: string[];
  expiredCertifications: CertificationRecord[];
  competencyLevel: CompetencyLevel;
}

export interface TrainingStatus {
  upToDate: boolean;
  requiredTraining: string[];
  missingTraining: string[];
  expiredTraining: TrainingRecord[];
  lastRefresher: Date | null;
  nextRefresherDue: Date | null;
}

export interface MedicalStatus {
  cleared: boolean;
  restrictions: MedicalRestriction[];
  lastExam: Date | null;
  nextExamDue: Date | null;
  fitnessLevel: FitnessLevel;
}

export interface TeamCompositionStatus {
  adequate: boolean;
  requiredRoles: PersonnelRole[];
  missingRoles: PersonnelRole[];
  supervisionAdequate: boolean;
  experienceBalance: ExperienceBalance;
}

export interface EmergencyReadinessStatus {
  prepared: boolean;
  emergencyContacts: EmergencyContact[];
  evacuationTrained: boolean;
  firstAidCertified: boolean;
  communicationReady: boolean;
}

export interface PersonnelRestriction {
  type: RestrictionType;
  description: BilingualText;
  severity: 'low' | 'medium' | 'high' | 'absolute';
  validUntil?: Date;
  conditions?: string[];
}

export interface MedicalRestriction {
  type: MedicalRestrictionType;
  description: BilingualText;
  limitations: string[];
  accommodations?: string[];
  reviewDate?: Date;
  severity?: 'low' | 'medium' | 'high' | 'absolute';
}

export type RestrictionType = 
  | 'height_work'
  | 'confined_space'
  | 'respiratory_protection'
  | 'physical_limitations'
  | 'chemical_exposure'
  | 'noise_exposure'
  | 'temperature_extremes'
  | 'emergency_response'
  | 'supervision_required';

export type MedicalRestrictionType = 
  | 'cardiovascular'
  | 'respiratory'
  | 'musculoskeletal'
  | 'neurological'
  | 'psychological'
  | 'sensory'
  | 'pregnancy'
  | 'medication_effects';

export type ExperienceLevel = 'novice' | 'intermediate' | 'experienced' | 'expert';
export type CompetencyLevel = 'basic' | 'proficient' | 'advanced' | 'expert';
export type FitnessLevel = 'excellent' | 'good' | 'adequate' | 'limited' | 'unfit';
export type ExperienceBalance = 'poor' | 'adequate' | 'good' | 'excellent';

// =================== CONSTANTES PERSONNEL ===================

const ROLE_REQUIREMENTS: Record<PersonnelRole, {
  requiredCertifications: string[];
  requiredTraining: string[];
  minimumExperience: number; // années
  medicalRequirements: string[];
  supervisionLevel: 'none' | 'indirect' | 'direct' | 'constant';
  maxConfinedSpaceHours: number; // heures par jour
}> = {
  entry_supervisor: {
    requiredCertifications: [
      'Confined Space Supervisor',
      'Gas Detection Certified',
      'Emergency Response',
      'First Aid/CPR'
    ],
    requiredTraining: [
      'Confined Space Entry',
      'Atmospheric Hazards',
      'Emergency Procedures',
      'Rescue Operations',
      'Communication Protocols'
    ],
    minimumExperience: 5,
    medicalRequirements: [
      'Occupational Health Clearance',
      'Respiratory Fitness',
      'Vision/Hearing Test'
    ],
    supervisionLevel: 'none',
    maxConfinedSpaceHours: 12
  },
  entrant: {
    requiredCertifications: [
      'Confined Space Entry',
      'Gas Detection Basic',
      'First Aid/CPR'
    ],
    requiredTraining: [
      'Confined Space Entry',
      'Personal Protective Equipment',
      'Emergency Procedures',
      'Communication Protocols'
    ],
    minimumExperience: 1,
    medicalRequirements: [
      'Occupational Health Clearance',
      'Respiratory Fitness'
    ],
    supervisionLevel: 'indirect',
    maxConfinedSpaceHours: 8
  },
  attendant: {
    requiredCertifications: [
      'Confined Space Attendant',
      'Gas Detection Basic',
      'First Aid/CPR',
      'Emergency Response'
    ],
    requiredTraining: [
      'Attendant Duties',
      'Emergency Communication',
      'Rescue Procedures',
      'Atmospheric Monitoring'
    ],
    minimumExperience: 2,
    medicalRequirements: [
      'Occupational Health Clearance',
      'Vision/Hearing Test'
    ],
    supervisionLevel: 'indirect',
    maxConfinedSpaceHours: 12
  },
  rescue_team_member: {
    requiredCertifications: [
      'Technical Rescue',
      'Confined Space Rescue',
      'Advanced First Aid',
      'Emergency Response'
    ],
    requiredTraining: [
      'Technical Rescue',
      'Emergency Medicine',
      'Equipment Operation',
      'Risk Assessment'
    ],
    minimumExperience: 3,
    medicalRequirements: [
      'Enhanced Medical Clearance',
      'Physical Fitness Test',
      'Respiratory Fitness',
      'Psychological Assessment'
    ],
    supervisionLevel: 'none',
    maxConfinedSpaceHours: 6
  },
  safety_officer: {
    requiredCertifications: [
      'Safety Professional',
      'Confined Space Expert',
      'Risk Assessment',
      'Emergency Response'
    ],
    requiredTraining: [
      'Safety Management',
      'Hazard Recognition',
      'Regulatory Compliance',
      'Incident Investigation'
    ],
    minimumExperience: 7,
    medicalRequirements: [
      'Occupational Health Clearance',
      'Vision/Hearing Test'
    ],
    supervisionLevel: 'none',
    maxConfinedSpaceHours: 12
  },
  support_personnel: {
    requiredCertifications: [
      'Basic Safety',
      'First Aid/CPR'
    ],
    requiredTraining: [
      'Site Safety',
      'Emergency Procedures',
      'Communication Protocols'
    ],
    minimumExperience: 0,
    medicalRequirements: [
      'Basic Medical Clearance'
    ],
    supervisionLevel: 'direct',
    maxConfinedSpaceHours: 0
  }
};

const TRAINING_REFRESH_INTERVALS: Record<string, number> = { // mois
  'Confined Space Entry': 12,
  'Gas Detection': 6,
  'Emergency Response': 12,
  'First Aid/CPR': 24,
  'Rescue Operations': 6,
  'Atmospheric Hazards': 12,
  'Personal Protective Equipment': 12,
  'Communication Protocols': 24,
  'Technical Rescue': 6,
  'Safety Management': 36
};

const CERTIFICATION_VALIDITY: Record<string, number> = { // années
  'Confined Space Supervisor': 3,
  'Confined Space Entry': 3,
  'Confined Space Attendant': 3,
  'Gas Detection Certified': 1,
  'Gas Detection Basic': 1,
  'Technical Rescue': 2,
  'Confined Space Rescue': 2,
  'Emergency Response': 3,
  'First Aid/CPR': 2,
  'Advanced First Aid': 2,
  'Safety Professional': 5,
  'Risk Assessment': 3
};

const MEDICAL_EXAM_INTERVALS: Record<PersonnelRole, number> = { // mois
  entry_supervisor: 12,
  entrant: 12,
  attendant: 12,
  rescue_team_member: 6,
  safety_officer: 12,
  support_personnel: 24
};

const MINIMUM_TEAM_COMPOSITION = {
  entry_supervisor: 1,
  attendant: 1,
  entrant: 1 // minimum, peut être plus selon travaux
};

// =================== FONCTIONS VALIDATION PRINCIPALES ===================

/**
 * Valide un membre du personnel
 */
export function validatePersonnel(personnel: PersonnelData): PersonnelValidationResult {
  const baseValidation = validateBasicPersonnelData(personnel);
  
  // Validations spécialisées
  const personnelStatus = assessPersonnelStatus(personnel);
  const qualificationStatus = validateQualifications(personnel);
  const trainingStatus = validateTraining(personnel);
  const medicalStatus = validateMedicalClearance(personnel);
  const emergencyReadiness = validateEmergencyReadiness(personnel);

  // Fusion résultats
  const combinedResult: PersonnelValidationResult = {
    ...baseValidation,
    personnelStatus,
    qualificationStatus,
    trainingStatus,
    medicalStatus,
    teamComposition: {
      adequate: true, // Sera évalué au niveau équipe
      requiredRoles: [],
      missingRoles: [],
      supervisionAdequate: true,
      experienceBalance: 'adequate'
    },
    emergencyReadiness
  };

  // Recalcul validité globale
  combinedResult.isValid = combinedResult.errors.filter(e => e.critical).length === 0 &&
                          personnelStatus.authorized &&
                          qualificationStatus.qualified &&
                          trainingStatus.upToDate &&
                          medicalStatus.cleared;

  return combinedResult;
}

/**
 * Valide une équipe de personnel
 */
export function validatePersonnelTeam(team: PersonnelData[]): PersonnelValidationResult {
  if (team.length === 0) {
    return createEmptyPersonnelValidationResult('Aucun personnel assigné');
  }

  const individualResults = team.map(person => validatePersonnel(person));
  
  // Validation composition équipe
  const teamComposition = validateTeamComposition(team);
  const supervisionValidation = validateSupervisionStructure(team);
  const experienceValidation = validateExperienceBalance(team);

  // Fusion tous résultats
  const allErrors = individualResults.flatMap(r => r.errors).concat(
    teamComposition.errors,
    supervisionValidation.errors,
    experienceValidation.errors
  );
  
  const allWarnings = individualResults.flatMap(r => r.warnings).concat(
    teamComposition.warnings,
    supervisionValidation.warnings,
    experienceValidation.warnings
  );
  
  const allSuggestions = individualResults.flatMap(r => r.suggestions).concat(
    teamComposition.suggestions,
    supervisionValidation.suggestions,
    experienceValidation.suggestions
  );

  // Statuts équipe
  const personnelStatus: PersonnelStatus = {
    authorized: individualResults.every(r => r.personnelStatus.authorized),
    readyForEntry: individualResults.every(r => r.personnelStatus.readyForEntry),
    restrictions: individualResults.flatMap(r => r.personnelStatus.restrictions),
    lastMedicalExam: getLatestDate(individualResults.map(r => r.personnelStatus.lastMedicalExam)),
    nextMedicalDue: getEarliestDate(individualResults.map(r => r.personnelStatus.nextMedicalDue)),
    experienceLevel: calculateTeamExperienceLevel(team)
  };

  const qualificationStatus: QualificationStatus = {
    qualified: individualResults.every(r => r.qualificationStatus.qualified),
    requiredCertifications: [...new Set(individualResults.flatMap(r => r.qualificationStatus.requiredCertifications))],
    missingCertifications: [...new Set(individualResults.flatMap(r => r.qualificationStatus.missingCertifications))],
    expiredCertifications: individualResults.flatMap(r => r.qualificationStatus.expiredCertifications),
    competencyLevel: calculateTeamCompetencyLevel(team)
  };

  const trainingStatus: TrainingStatus = {
    upToDate: individualResults.every(r => r.trainingStatus.upToDate),
    requiredTraining: [...new Set(individualResults.flatMap(r => r.trainingStatus.requiredTraining))],
    missingTraining: [...new Set(individualResults.flatMap(r => r.trainingStatus.missingTraining))],
    expiredTraining: individualResults.flatMap(r => r.trainingStatus.expiredTraining),
    lastRefresher: getLatestDate(individualResults.map(r => r.trainingStatus.lastRefresher)),
    nextRefresherDue: getEarliestDate(individualResults.map(r => r.trainingStatus.nextRefresherDue))
  };

  const medicalStatus: MedicalStatus = {
    cleared: individualResults.every(r => r.medicalStatus.cleared),
    restrictions: individualResults.flatMap(r => r.medicalStatus.restrictions),
    lastExam: getLatestDate(individualResults.map(r => r.medicalStatus.lastExam)),
    nextExamDue: getEarliestDate(individualResults.map(r => r.medicalStatus.nextExamDue)),
    fitnessLevel: calculateTeamFitnessLevel(individualResults.map(r => r.medicalStatus.fitnessLevel))
  };

  const emergencyReadiness: EmergencyReadinessStatus = {
    prepared: individualResults.every(r => r.emergencyReadiness.prepared),
    emergencyContacts: individualResults.flatMap(r => r.emergencyReadiness.emergencyContacts),
    evacuationTrained: individualResults.every(r => r.emergencyReadiness.evacuationTrained),
    firstAidCertified: individualResults.some(r => r.emergencyReadiness.firstAidCertified),
    communicationReady: individualResults.every(r => r.emergencyReadiness.communicationReady)
  };

  return {
    isValid: allErrors.filter(e => e.critical).length === 0,
    errors: allErrors,
    warnings: allWarnings,
    criticalIssues: allErrors.filter(e => e.critical),
    suggestions: allSuggestions,
    confidence: calculateTeamConfidence(individualResults),
    personnelStatus,
    qualificationStatus,
    trainingStatus,
    medicalStatus,
    teamComposition: assessTeamComposition(team),
    emergencyReadiness
  };
}

// =================== VALIDATIONS SPÉCIALISÉES ===================

/**
 * Validation données de base personnel
 */
function validateBasicPersonnelData(personnel: PersonnelData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Champs obligatoires
  if (!personnel.id) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'ID personnel requis', en: 'Personnel ID required' },
      field: 'id',
      critical: true
    });
  }

  if (!personnel.name || !personnel.name.trim()) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Nom personnel requis', en: 'Personnel name required' },
      field: 'name',
      critical: true
    });
  }

  if (!personnel.role) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Rôle personnel requis', en: 'Personnel role required' },
      field: 'role',
      critical: true
    });
  }

  if (!personnel.employeeId) {
    warnings.push({
      type: 'missing_data',
      message: { fr: 'Numéro employé manquant', en: 'Employee ID missing' },
      field: 'employeeId',
      severity: 'medium'
    });
  }

  // Validation contact d'urgence
  if (!personnel.emergencyContact) {
    warnings.push({
      type: 'missing_emergency_contact',
      message: { fr: 'Contact d\'urgence requis', en: 'Emergency contact required' },
      field: 'emergencyContact',
      severity: 'high'
    });
  } else {
    const contactValidation = validateEmergencyContact(personnel.emergencyContact);
    warnings.push(...contactValidation.warnings);
    errors.push(...contactValidation.errors);
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
 * Évalue statut personnel
 */
function assessPersonnelStatus(personnel: PersonnelData): PersonnelStatus {
  const restrictions: PersonnelRestriction[] = [];
  
  // Vérifier restrictions médicales
  if (personnel.medicalClearance?.restrictions) {
    personnel.medicalClearance.restrictions.forEach(medRestriction => {
      restrictions.push({
        type: 'physical_limitations',
        description: {
          fr: `Restriction médicale: ${medRestriction.description.fr}`,
          en: `Medical restriction: ${medRestriction.description.en}`
        },
        severity: medRestriction.severity || 'medium',
        conditions: medRestriction.limitations
      });
    });
  }

  // Vérifier expérience
  const experience = calculateExperience(personnel);
  const roleRequirements = ROLE_REQUIREMENTS[personnel.role];
  
  if (experience < roleRequirements.minimumExperience) {
    restrictions.push({
      type: 'supervision_required',
      description: {
        fr: `Expérience insuffisante: ${experience} ans (requis: ${roleRequirements.minimumExperience} ans)`,
        en: `Insufficient experience: ${experience} years (required: ${roleRequirements.minimumExperience} years)`
      },
      severity: 'high'
    });
  }

  const authorized = restrictions.filter(r => r.severity === 'absolute').length === 0;
  const readyForEntry = authorized && 
                       personnel.medicalClearance?.status === 'cleared' &&
                       (personnel.certifications?.length || 0) > 0 &&
                       (personnel.training?.length || 0) > 0;

  const lastMedicalExam = personnel.medicalClearance?.lastExam ? 
    new Date(personnel.medicalClearance.lastExam) : null;
  
  const nextMedicalDue = lastMedicalExam ? 
    new Date(lastMedicalExam.getTime() + MEDICAL_EXAM_INTERVALS[personnel.role] * 30 * 24 * 60 * 60 * 1000) : 
    new Date();

  return {
    authorized,
    readyForEntry,
    restrictions,
    lastMedicalExam,
    nextMedicalDue,
    experienceLevel: categorizeExperience(experience)
  };
}

/**
 * Valide qualifications
 */
function validateQualifications(personnel: PersonnelData): QualificationStatus {
  const roleRequirements = ROLE_REQUIREMENTS[personnel.role];
  const requiredCertifications = roleRequirements.requiredCertifications;
  const currentCertifications = personnel.certifications || [];
  
  const missingCertifications: string[] = [];
  const expiredCertifications: CertificationRecord[] = [];
  
  requiredCertifications.forEach(required => {
    const cert = currentCertifications.find(c => c.type === required);
    
    if (!cert) {
      missingCertifications.push(required);
    } else if (cert.expiryDate && new Date(cert.expiryDate) < new Date()) {
      expiredCertifications.push(cert);
    }
  });

  const qualified = missingCertifications.length === 0 && expiredCertifications.length === 0;
  const competencyLevel = calculateCompetencyLevel(personnel);

  return {
    qualified,
    requiredCertifications,
    missingCertifications,
    expiredCertifications,
    competencyLevel
  };
}

/**
 * Valide formation
 */
function validateTraining(personnel: PersonnelData): TrainingStatus {
  const roleRequirements = ROLE_REQUIREMENTS[personnel.role];
  const requiredTraining = roleRequirements.requiredTraining;
  const currentTraining = personnel.training || [];
  
  const missingTraining: string[] = [];
  const expiredTraining: TrainingRecord[] = [];
  
  requiredTraining.forEach(required => {
    const training = currentTraining.find(t => t.course === required);
    
    if (!training) {
      missingTraining.push(required);
    } else {
      const refreshInterval = TRAINING_REFRESH_INTERVALS[required] || 12;
      const expiryDate = new Date(new Date(training.completionDate).getTime() + refreshInterval * 30 * 24 * 60 * 60 * 1000);
      
      if (expiryDate < new Date()) {
        expiredTraining.push(training);
      }
    }
  });

  const upToDate = missingTraining.length === 0 && expiredTraining.length === 0;
  
  const lastRefresher = currentTraining.length > 0 ? 
    new Date(Math.max(...currentTraining.map(t => new Date(t.completionDate).getTime()))) : null;
  
  const nextRefresherDue = lastRefresher ? 
    new Date(lastRefresher.getTime() + 12 * 30 * 24 * 60 * 60 * 1000) : new Date();

  return {
    upToDate,
    requiredTraining,
    missingTraining,
    expiredTraining,
    lastRefresher,
    nextRefresherDue
  };
}

/**
 * Valide autorisation médicale
 */
function validateMedicalClearance(personnel: PersonnelData): MedicalStatus {
  const medical = personnel.medicalClearance;
  
  if (!medical) {
    return {
      cleared: false,
      restrictions: [],
      lastExam: null,
      nextExamDue: new Date(),
      fitnessLevel: 'unfit'
    };
  }

  const cleared = medical.status === 'cleared';
  const restrictions = medical.restrictions || [];
  const lastExam = medical.lastExam ? new Date(medical.lastExam) : null;
  
  const intervalMonths = MEDICAL_EXAM_INTERVALS[personnel.role] || 12;
  const nextExamDue = lastExam ? 
    new Date(lastExam.getTime() + intervalMonths * 30 * 24 * 60 * 60 * 1000) : 
    new Date();

  const fitnessLevel = medical.fitnessLevel || 'adequate';

  return {
    cleared,
    restrictions,
    lastExam,
    nextExamDue,
    fitnessLevel
  };
}

/**
 * Valide préparation urgence
 */
function validateEmergencyReadiness(personnel: PersonnelData): EmergencyReadinessStatus {
  const emergencyContacts = personnel.emergencyContact ? [personnel.emergencyContact] : [];
  
  const evacuationTrained = personnel.training?.some(t => 
    t.course.toLowerCase().includes('emergency') || 
    t.course.toLowerCase().includes('evacuation')
  ) || false;

  const firstAidCertified = personnel.certifications?.some(c => 
    c.type.toLowerCase().includes('first aid') || 
    c.type.toLowerCase().includes('cpr')
  ) || false;

  const communicationReady = personnel.communicationDevice !== undefined;

  const prepared = emergencyContacts.length > 0 && 
                  evacuationTrained && 
                  firstAidCertified && 
                  communicationReady;

  return {
    prepared,
    emergencyContacts,
    evacuationTrained,
    firstAidCertified,
    communicationReady
  };
}

/**
 * Valide contact d'urgence
 */
function validateEmergencyContact(contact: EmergencyContact): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!contact.name || !contact.name.trim()) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Nom contact d\'urgence requis', en: 'Emergency contact name required' },
      field: 'emergencyContact.name',
      critical: true
    });
  }

  if (!contact.phone || !contact.phone.trim()) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Téléphone contact d\'urgence requis', en: 'Emergency contact phone required' },
      field: 'emergencyContact.phone',
      critical: true
    });
  }

  if (!contact.relationship || !contact.relationship.trim()) {
    warnings.push({
      type: 'missing_data',
      message: { fr: 'Relation contact d\'urgence recommandée', en: 'Emergency contact relationship recommended' },
      field: 'emergencyContact.relationship',
      severity: 'low'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: errors,
    suggestions: [],
    confidence: errors.length === 0 ? 1 : 0.5
  };
}

// =================== VALIDATIONS ÉQUIPE ===================

/**
 * Valide composition équipe
 */
function validateTeamComposition(team: PersonnelData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Compter rôles présents
  const roleCounts = team.reduce((counts, person) => {
    counts[person.role] = (counts[person.role] || 0) + 1;
    return counts;
  }, {} as Record<PersonnelRole, number>);

  // Vérifier rôles minimum requis
  Object.entries(MINIMUM_TEAM_COMPOSITION).forEach(([role, minCount]) => {
    const currentCount = roleCounts[role as PersonnelRole] || 0;
    
    if (currentCount < minCount) {
      errors.push({
        type: 'insufficient_personnel',
        message: {
          fr: `${role} insuffisant: ${currentCount}/${minCount} requis`,
          en: `Insufficient ${role}: ${currentCount}/${minCount} required`
        },
        field: 'teamComposition',
        critical: true
      });
    }
  });

  // Vérifier superviseur qualifié
  const supervisors = team.filter(p => p.role === 'entry_supervisor');
  if (supervisors.length === 0) {
    errors.push({
      type: 'missing_supervisor',
      message: {
        fr: 'Superviseur d\'entrée requis',
        en: 'Entry supervisor required'
      },
      field: 'teamComposition',
      critical: true
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: errors,
    suggestions,
    confidence: errors.length === 0 ? 1 : 0.5
  };
}

/**
 * Valide structure supervision
 */
function validateSupervisionStructure(team: PersonnelData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Vérifier ratios supervision
  const entrants = team.filter(p => p.role === 'entrant').length;
  const attendants = team.filter(p => p.role === 'attendant').length;
  const supervisors = team.filter(p => p.role === 'entry_supervisor').length;

  // Ratio attendant/entrant
  if (entrants > attendants * 3) {
    warnings.push({
      type: 'supervision_ratio',
      message: {
        fr: `Ratio attendant/entrant élevé: ${entrants}/${attendants}`,
        en: `High attendant/entrant ratio: ${entrants}/${attendants}`
      },
      field: 'supervisionStructure',
      severity: 'medium'
    });
  }

  // Expérience supervision
  const inexperiencedEntrants = team.filter(p => 
    p.role === 'entrant' && calculateExperience(p) < 2
  ).length;

  if (inexperiencedEntrants > supervisors) {
    warnings.push({
      type: 'supervision_experience',
      message: {
        fr: 'Supervision renforcée requise pour personnel inexpérimenté',
        en: 'Enhanced supervision required for inexperienced personnel'
      },
      field: 'supervisionStructure',
      severity: 'high'
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
 * Valide équilibre expérience
 */
function validateExperienceBalance(team: PersonnelData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  const experiences = team.map(p => calculateExperience(p));
  const avgExperience = experiences.reduce((sum, exp) => sum + exp, 0) / experiences.length;
  
  const novices = experiences.filter(exp => exp < 1).length;
  const experts = experiences.filter(exp => exp > 5).length;

  // Trop de novices
  if (novices / team.length > 0.5) {
    warnings.push({
      type: 'experience_balance',
      message: {
        fr: 'Équipe avec beaucoup de personnel inexpérimenté',
        en: 'Team with many inexperienced personnel'
      },
      field: 'experienceBalance',
      severity: 'high'
    });

    suggestions.push({
      type: 'add_experienced_personnel',
      message: {
        fr: 'Ajouter personnel expérimenté à l\'équipe',
        en: 'Add experienced personnel to team'
      },
      priority: 'high'
    });
  }

  // Manque d'experts
  if (experts === 0 && team.length > 3) {
    suggestions.push({
      type: 'add_expert',
      message: {
        fr: 'Considérer ajouter un expert à l\'équipe',
        en: 'Consider adding an expert to the team'
      },
      priority: 'medium'
    });
  }

  return {
    isValid: true,
    errors,
    warnings,
    criticalIssues: [],
    suggestions,
    confidence: 0.9
  };
}

// =================== FONCTIONS UTILITAIRES ===================

function calculateExperience(personnel: PersonnelData): number {
  if (personnel.experienceYears !== undefined) {
    return personnel.experienceYears;
  }
  
  if (personnel.hireDate) {
    return (Date.now() - new Date(personnel.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  return 0;
}

function categorizeExperience(years: number): ExperienceLevel {
  if (years < 1) return 'novice';
  if (years < 3) return 'intermediate';
  if (years < 7) return 'experienced';
  return 'expert';
}

function calculateCompetencyLevel(personnel: PersonnelData): CompetencyLevel {
  const experience = calculateExperience(personnel);
  const certCount = personnel.certifications?.length || 0;
  const trainingCount = personnel.training?.length || 0;
  
  const competencyScore = experience * 0.4 + certCount * 0.3 + trainingCount * 0.3;
  
  if (competencyScore < 2) return 'basic';
  if (competencyScore < 5) return 'proficient';
  if (competencyScore < 8) return 'advanced';
  return 'expert';
}

function assessTeamComposition(team: PersonnelData[]): TeamCompositionStatus {
  const roleCounts = team.reduce((counts, person) => {
    counts[person.role] = (counts[person.role] || 0) + 1;
    return counts;
  }, {} as Record<PersonnelRole, number>);

  const requiredRoles: PersonnelRole[] = Object.keys(MINIMUM_TEAM_COMPOSITION) as PersonnelRole[];
  const missingRoles: PersonnelRole[] = [];

  requiredRoles.forEach(role => {
    const required = MINIMUM_TEAM_COMPOSITION[role as keyof typeof MINIMUM_TEAM_COMPOSITION] || 0;
    const current = roleCounts[role] || 0;
    
    if (current < required) {
      for (let i = current; i < required; i++) {
        missingRoles.push(role);
      }
    }
  });

  const adequate = missingRoles.length === 0;
  const supervisionAdequate = (roleCounts.entry_supervisor || 0) >= 1 && (roleCounts.attendant || 0) >= 1;
  const experienceBalance = calculateExperienceBalance(team);

  return {
    adequate,
    requiredRoles,
    missingRoles,
    supervisionAdequate,
    experienceBalance
  };
}

function calculateTeamExperienceLevel(team: PersonnelData[]): ExperienceLevel {
  const experiences = team.map(p => calculateExperience(p));
  const avgExperience = experiences.reduce((sum, exp) => sum + exp, 0) / experiences.length;
  return categorizeExperience(avgExperience);
}

function calculateTeamCompetencyLevel(team: PersonnelData[]): CompetencyLevel {
  const competencies = team.map(p => calculateCompetencyLevel(p));
  const scores = competencies.map(c => ({ basic: 1, proficient: 2, advanced: 3, expert: 4 }[c]));
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  if (avgScore < 1.5) return 'basic';
  if (avgScore < 2.5) return 'proficient';
  if (avgScore < 3.5) return 'advanced';
  return 'expert';
}

function calculateTeamFitnessLevel(levels: FitnessLevel[]): FitnessLevel {
  const scores = levels.map(l => ({ unfit: 0, limited: 1, adequate: 2, good: 3, excellent: 4 }[l]));
  const minScore = Math.min(...scores);
  
  if (minScore === 0) return 'unfit';
  if (minScore === 1) return 'limited';
  if (minScore === 2) return 'adequate';
  if (minScore === 3) return 'good';
  return 'excellent';
}

function calculateExperienceBalance(team: PersonnelData[]): ExperienceBalance {
  const experiences = team.map(p => calculateExperience(p));
  const novices = experiences.filter(exp => exp < 1).length;
  const intermediate = experiences.filter(exp => exp >= 1 && exp < 3).length;
  const experienced = experiences.filter(exp => exp >= 3 && exp < 7).length;
  const experts = experiences.filter(exp => exp >= 7).length;
  
  const total = team.length;
  const noviceRatio = novices / total;
  const expertRatio = experts / total;
  
  if (noviceRatio > 0.6) return 'poor';
  if (noviceRatio > 0.4 || expertRatio === 0) return 'adequate';
  if (expertRatio > 0.2 && noviceRatio < 0.3) return 'excellent';
  return 'good';
}

function calculateTeamConfidence(results: PersonnelValidationResult[]): number {
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

function createEmptyPersonnelValidationResult(message: string): PersonnelValidationResult {
  return {
    isValid: false,
    errors: [{
      type: 'missing_required',
      message: { fr: message, en: message },
      field: 'personnel',
      critical: true
    }],
    warnings: [],
    criticalIssues: [],
    suggestions: [],
    confidence: 0,
    personnelStatus: {
      authorized: false,
      readyForEntry: false,
      restrictions: [],
      lastMedicalExam: null,
      nextMedicalDue: null,
      experienceLevel: 'novice'
    },
    qualificationStatus: {
      qualified: false,
      requiredCertifications: [],
      missingCertifications: [],
      expiredCertifications: [],
      competencyLevel: 'basic'
    },
    trainingStatus: {
      upToDate: false,
      requiredTraining: [],
      missingTraining: [],
      expiredTraining: [],
      lastRefresher: null,
      nextRefresherDue: null
    },
    medicalStatus: {
      cleared: false,
      restrictions: [],
      lastExam: null,
      nextExamDue: null,
      fitnessLevel: 'unfit'
    },
    teamComposition: {
      adequate: false,
      requiredRoles: [],
      missingRoles: [],
      supervisionAdequate: false,
      experienceBalance: 'poor'
    },
    emergencyReadiness: {
      prepared: false,
      emergencyContacts: [],
      evacuationTrained: false,
      firstAidCertified: false,
      communicationReady: false
    }
  };
}

// =================== EXPORTS ===================

// Export des constantes pour l'index
export { ROLE_REQUIREMENTS, TRAINING_REFRESH_INTERVALS, CERTIFICATION_VALIDITY, MEDICAL_EXAM_INTERVALS };

// Export des fonctions principales
export { validatePersonnel, validatePersonnelTeam };

export default {
  validatePersonnel,
  validatePersonnelTeam,
  ROLE_REQUIREMENTS,
  TRAINING_REFRESH_INTERVALS,
  CERTIFICATION_VALIDITY,
  MEDICAL_EXAM_INTERVALS
};
