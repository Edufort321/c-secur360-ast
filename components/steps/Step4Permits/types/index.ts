// components/steps/Step4Permits/types/index.ts - SECTION 1

// =================== TYPES DE BASE ===================
export interface BilingualText {
  fr: string;
  en: string;
}

export type PermitStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'active' 
  | 'completed' 
  | 'expired' 
  | 'suspended' 
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Jurisdiction = 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== VALIDATION DE BASE ===================
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
  value?: any;
  critical: boolean;
  correctionRequired?: boolean;
}

export interface ValidationWarning {
  type: string;
  message: BilingualText;
  field: string;
  value?: any;
  severity: 'low' | 'medium' | 'high';
  suggestion?: BilingualText;
  expectedRange?: { min: number; max: number };
}

export interface ValidationSuggestion {
  type: string;
  message: BilingualText;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: BilingualText;
  impact?: string;
}

export interface ValidationSummary {
  overallValid: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  criticalIssues: number;
  warnings: number;
  confidence: number;
  completionPercentage: number;
}

// =================== PERMIS DE BASE ===================
export interface PermitData {
  id: string;
  type: string;
  status: PermitStatus;
  title?: BilingualText;
  description?: BilingualText;
  location?: string;
  site?: string;
  jurisdiction?: Jurisdiction;
  createdAt?: Date;
  updatedAt?: Date;
  validFrom?: Date;
  validUntil?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface PermitValidationResult extends ValidationResult {
  permitId: string;
  validationType: 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'regulatory' | 'overall';
  timestamp: Date;
  validatedBy: string;
  nextValidationDue?: Date;
}

// =================== DONNÉES ATMOSPHÉRIQUES ===================
export type GasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'propane'
  | 'butane'
  | 'acetylene'
  | 'ethylene'
  | 'formaldehyde';

export type AlarmLevel = 'normal' | 'warning' | 'high' | 'critical' | 'emergency';

export interface AtmosphericReading {
  id: string;
  gasType: GasType;
  value: number;
  unit: string;
  timestamp: Date | string;
  location?: string;
  equipment?: string;
  operator?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  alarmLevel?: AlarmLevel;
  confidence?: number;
  calibrationDate?: Date;
  drift?: number;
  historicalData?: AtmosphericReading[];
}

export interface AtmosphericData {
  readings: AtmosphericReading[];
  monitoringFrequency: number; // minutes
  lastUpdate: Date;
  nextReading: Date;
  equipmentUsed: string[];
  calibrationStatus: 'current' | 'due' | 'overdue';
  alarmThresholds: AtmosphericLimits;
}

export interface AtmosphericLimits {
  oxygen: { min: number; max: number };
  flammable: { maxLEL: number };
  toxic: Record<string, {
    TWA: number;  // Time Weighted Average
    STEL: number; // Short Term Exposure Limit
    IDLH: number; // Immediately Dangerous to Life or Health
  }>;
  environmental: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure: { min: number; max: number };
  };
}

// =================== VALIDATION ATMOSPHÉRIQUE ===================
export type ValidationWarningType = 
  | 'unusual_reading'
  | 'sensor_drift'
  | 'calibration_due'
  | 'environmental_factor'
  | 'temporal_inconsistency'
  | 'correlation_anomaly'
  | 'precision_degraded';

export type ValidationErrorType = 
  | 'out_of_range'
  | 'sensor_failure'
  | 'invalid_format'
  | 'missing_required'
  | 'regulation_violation'
  | 'safety_critical'
  | 'data_corruption';

export type SuggestionType = 
  | 'calibration'
  | 'maintenance'
  | 'safety_action'
  | 'data_collection'
  | 'equipment_upgrade'
  | 'procedure_update';

export interface DataQualityMetrics {
  accuracy: number;
  completeness: number;
  consistency: number;
  timeliness: number;
  reliability: number;
  overall: number;
}

// FIN SECTION 1 - Prêt pour la section 2 ?
// components/steps/Step4Permits/types/index.ts - SECTION 1

// =================== TYPES DE BASE ===================
export interface BilingualText {
  fr: string;
  en: string;
}

export type PermitStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'active' 
  | 'completed' 
  | 'expired' 
  | 'suspended' 
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Jurisdiction = 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== VALIDATION DE BASE ===================
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
  value?: any;
  critical: boolean;
  correctionRequired?: boolean;
}

export interface ValidationWarning {
  type: string;
  message: BilingualText;
  field: string;
  value?: any;
  severity: 'low' | 'medium' | 'high';
  suggestion?: BilingualText;
  expectedRange?: { min: number; max: number };
}

export interface ValidationSuggestion {
  type: string;
  message: BilingualText;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: BilingualText;
  impact?: string;
}

export interface ValidationSummary {
  overallValid: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  criticalIssues: number;
  warnings: number;
  confidence: number;
  completionPercentage: number;
}

// =================== PERMIS DE BASE ===================
export interface PermitData {
  id: string;
  type: string;
  status: PermitStatus;
  title?: BilingualText;
  description?: BilingualText;
  location?: string;
  site?: string;
  jurisdiction?: Jurisdiction;
  createdAt?: Date;
  updatedAt?: Date;
  validFrom?: Date;
  validUntil?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface PermitValidationResult extends ValidationResult {
  permitId: string;
  validationType: 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'regulatory' | 'overall';
  timestamp: Date;
  validatedBy: string;
  nextValidationDue?: Date;
}

// =================== DONNÉES ATMOSPHÉRIQUES ===================
export type GasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'propane'
  | 'butane'
  | 'acetylene'
  | 'ethylene'
  | 'formaldehyde';

export type AlarmLevel = 'normal' | 'warning' | 'high' | 'critical' | 'emergency';

export interface AtmosphericReading {
  id: string;
  gasType: GasType;
  value: number;
  unit: string;
  timestamp: Date | string;
  location?: string;
  equipment?: string;
  operator?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  alarmLevel?: AlarmLevel;
  confidence?: number;
  calibrationDate?: Date;
  drift?: number;
  historicalData?: AtmosphericReading[];
}

export interface AtmosphericData {
  readings: AtmosphericReading[];
  monitoringFrequency: number; // minutes
  lastUpdate: Date;
  nextReading: Date;
  equipmentUsed: string[];
  calibrationStatus: 'current' | 'due' | 'overdue';
  alarmThresholds: AtmosphericLimits;
}

export interface AtmosphericLimits {
  oxygen: { min: number; max: number };
  flammable: { maxLEL: number };
  toxic: Record<string, {
    TWA: number;  // Time Weighted Average
    STEL: number; // Short Term Exposure Limit
    IDLH: number; // Immediately Dangerous to Life or Health
  }>;
  environmental: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure: { min: number; max: number };
  };
}

// =================== VALIDATION ATMOSPHÉRIQUE ===================
export type ValidationWarningType = 
  | 'unusual_reading'
  | 'sensor_drift'
  | 'calibration_due'
  | 'environmental_factor'
  | 'temporal_inconsistency'
  | 'correlation_anomaly'
  | 'precision_degraded';

export type ValidationErrorType = 
  | 'out_of_range'
  | 'sensor_failure'
  | 'invalid_format'
  | 'missing_required'
  | 'regulation_violation'
  | 'safety_critical'
  | 'data_corruption';

export type SuggestionType = 
  | 'calibration'
  | 'maintenance'
  | 'safety_action'
  | 'data_collection'
  | 'equipment_upgrade'
  | 'procedure_update';

export interface DataQualityMetrics {
  accuracy: number;
  completeness: number;
  consistency: number;
  timeliness: number;
  reliability: number;
  overall: number;
}

// =================== TYPES ÉQUIPEMENT ===================
export type EquipmentType = 
  | 'gas_detector_portable'
  | 'gas_detector_fixed'
  | 'ventilation_fan'
  | 'air_pump'
  | 'communication_system'
  | 'tripod_winch'
  | 'fall_protection'
  | 'scba'
  | 'emergency_lighting';

export type SafetyRating = 1 | 2 | 3 | 4 | 5;

export interface EquipmentData {
  id: string;
  type: EquipmentType;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastInspection?: Date;
  nextInspection?: Date;
  calibration?: CalibrationStatus;
  maintenance?: MaintenanceRecord[];
  certification?: CertificationRecord;
  safetyStandards?: string[];
  safetyRating?: SafetyRating;
  operatingConditions?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
  };
  specifications?: {
    voltage?: number;
    communicationProtocol?: string;
  };
}

export interface CalibrationStatus {
  lastDate?: Date;
  nextDate?: Date;
  accuracy?: number;
  drift?: number;
  status: 'current' | 'due' | 'overdue';
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  scheduledDate?: Date;
  nextDueDate?: Date;
}

export interface CertificationRecord {
  id: string;
  type: string;
  issueDate: Date;
  expiryDate?: Date;
  authority?: string;
  level?: string;
  status: 'valid' | 'expired' | 'pending';
}

export interface EquipmentValidationResult extends ValidationResult {
  equipmentStatus: EquipmentStatus;
  certificationStatus: CertificationStatus;
  maintenanceStatus: MaintenanceStatus;
  calibrationStatus: CalibrationValidationStatus;
  safetyCompliance: SafetyComplianceStatus;
}

export interface EquipmentStatus {
  operational: boolean;
  readiness: 'ready' | 'needs_attention' | 'not_ready';
  issues: EquipmentIssue[];
  lastInspection: Date | null;
  nextMaintenanceDue: Date | null;
}

export interface CertificationStatus {
  isValid: boolean;
  expiryDate: Date | null;
  certifyingAuthority: string | null;
  certificationLevel: string | null;
  renewalRequired: boolean;
}

export interface MaintenanceStatus {
  upToDate: boolean;
  overdue: MaintenanceRecord[];
  upcoming: MaintenanceRecord[];
  lastService: Date | null;
  nextService: Date | null;
}

export interface CalibrationValidationStatus {
  isCalibrated: boolean;
  lastCalibration: Date | null;
  nextCalibration: Date | null;
  driftDetected: boolean;
  accuracy: number;
  withinTolerance: boolean;
}

export interface SafetyComplianceStatus {
  compliant: boolean;
  safetyRating: SafetyRating;
  violatedStandards: string[];
  requiredUpgrades: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EquipmentIssue {
  type: EquipmentIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: BilingualText;
  recommendation: BilingualText;
  urgent: boolean;
  estimatedDowntime?: number;
}

export type EquipmentIssueType = 
  | 'calibration_overdue'
  | 'maintenance_overdue' 
  | 'certification_expired'
  | 'safety_violation'
  | 'performance_degraded'
  | 'component_failure'
  | 'connectivity_issue'
  | 'power_issue'
  | 'environmental_damage'
  | 'wear_excessive'
  | 'configuration_invalid';

// =================== TYPES PERSONNEL ===================
export type PersonnelRole = 
  | 'entry_supervisor'
  | 'entrant'
  | 'attendant'
  | 'rescue_team_member'
  | 'safety_officer'
  | 'support_personnel';

export type ExperienceLevel = 'novice' | 'intermediate' | 'experienced' | 'expert';
export type CompetencyLevel = 'basic' | 'proficient' | 'advanced' | 'expert';
export type FitnessLevel = 'excellent' | 'good' | 'adequate' | 'limited' | 'unfit';
export type ExperienceBalance = 'poor' | 'adequate' | 'good' | 'excellent';

export interface PersonnelData {
  id: string;
  name: string;
  employeeId?: string;
  role: PersonnelRole;
  experienceYears?: number;
  hireDate?: Date;
  certifications?: CertificationRecord[];
  training?: TrainingRecord[];
  medicalClearance?: MedicalClearance;
  emergencyContact?: EmergencyContact;
  communicationDevice?: string;
}

export interface TrainingRecord {
  id: string;
  course: string;
  provider: string;
  completionDate: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  score?: number;
  refresherRequired?: boolean;
}

export interface MedicalClearance {
  id: string;
  status: 'cleared' | 'restricted' | 'not_cleared';
  lastExam?: Date;
  nextExam?: Date;
  examiner?: string;
  restrictions?: MedicalRestriction[];
  fitnessLevel?: FitnessLevel;
}

export interface MedicalRestriction {
  type: MedicalRestrictionType;
  description: BilingualText;
  limitations: string[];
  accommodations?: string[];
  reviewDate?: Date;
  severity?: 'minor' | 'moderate' | 'major' | 'absolute';
}

export type MedicalRestrictionType = 
  | 'cardiovascular'
  | 'respiratory'
  | 'musculoskeletal'
  | 'neurological'
  | 'psychological'
  | 'sensory'
  | 'pregnancy'
  | 'medication_effects';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
  alternatePhone?: string;
  email?: string;
}

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

export interface PersonnelRestriction {
  type: RestrictionType;
  description: BilingualText;
  severity: 'low' | 'medium' | 'high' | 'absolute';
  validUntil?: Date;
  conditions?: string[];
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

// FIN SECTION 2 - Prêt pour la section 3 ?

// components/steps/Step4Permits/types/index.ts - SECTION 1

// =================== TYPES DE BASE ===================
export interface BilingualText {
  fr: string;
  en: string;
}

export type PermitStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'active' 
  | 'completed' 
  | 'expired' 
  | 'suspended' 
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Jurisdiction = 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== VALIDATION DE BASE ===================
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
  value?: any;
  critical: boolean;
  correctionRequired?: boolean;
}

export interface ValidationWarning {
  type: string;
  message: BilingualText;
  field: string;
  value?: any;
  severity: 'low' | 'medium' | 'high';
  suggestion?: BilingualText;
  expectedRange?: { min: number; max: number };
}

export interface ValidationSuggestion {
  type: string;
  message: BilingualText;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: BilingualText;
  impact?: string;
}

export interface ValidationSummary {
  overallValid: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  criticalIssues: number;
  warnings: number;
  confidence: number;
  completionPercentage: number;
}

// =================== PERMIS DE BASE ===================
export interface PermitData {
  id: string;
  type: string;
  status: PermitStatus;
  title?: BilingualText;
  description?: BilingualText;
  location?: string;
  site?: string;
  jurisdiction?: Jurisdiction;
  createdAt?: Date;
  updatedAt?: Date;
  validFrom?: Date;
  validUntil?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface PermitValidationResult extends ValidationResult {
  permitId: string;
  validationType: 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'regulatory' | 'overall';
  timestamp: Date;
  validatedBy: string;
  nextValidationDue?: Date;
}

// =================== DONNÉES ATMOSPHÉRIQUES ===================
export type GasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'propane'
  | 'butane'
  | 'acetylene'
  | 'ethylene'
  | 'formaldehyde';

export type AlarmLevel = 'normal' | 'warning' | 'high' | 'critical' | 'emergency';

export interface AtmosphericReading {
  id: string;
  gasType: GasType;
  value: number;
  unit: string;
  timestamp: Date | string;
  location?: string;
  equipment?: string;
  operator?: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  alarmLevel?: AlarmLevel;
  confidence?: number;
  calibrationDate?: Date;
  drift?: number;
  historicalData?: AtmosphericReading[];
}

export interface AtmosphericData {
  readings: AtmosphericReading[];
  monitoringFrequency: number; // minutes
  lastUpdate: Date;
  nextReading: Date;
  equipmentUsed: string[];
  calibrationStatus: 'current' | 'due' | 'overdue';
  alarmThresholds: AtmosphericLimits;
}

export interface AtmosphericLimits {
  oxygen: { min: number; max: number };
  flammable: { maxLEL: number };
  toxic: Record<string, {
    TWA: number;  // Time Weighted Average
    STEL: number; // Short Term Exposure Limit
    IDLH: number; // Immediately Dangerous to Life or Health
  }>;
  environmental: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure: { min: number; max: number };
  };
}

// =================== VALIDATION ATMOSPHÉRIQUE ===================
export type ValidationWarningType = 
  | 'unusual_reading'
  | 'sensor_drift'
  | 'calibration_due'
  | 'environmental_factor'
  | 'temporal_inconsistency'
  | 'correlation_anomaly'
  | 'precision_degraded';

export type ValidationErrorType = 
  | 'out_of_range'
  | 'sensor_failure'
  | 'invalid_format'
  | 'missing_required'
  | 'regulation_violation'
  | 'safety_critical'
  | 'data_corruption';

export type SuggestionType = 
  | 'calibration'
  | 'maintenance'
  | 'safety_action'
  | 'data_collection'
  | 'equipment_upgrade'
  | 'procedure_update';

export interface DataQualityMetrics {
  accuracy: number;
  completeness: number;
  consistency: number;
  timeliness: number;
  reliability: number;
  overall: number;
}

// =================== TYPES ÉQUIPEMENT ===================
export type EquipmentType = 
  | 'gas_detector_portable'
  | 'gas_detector_fixed'
  | 'ventilation_fan'
  | 'air_pump'
  | 'communication_system'
  | 'tripod_winch'
  | 'fall_protection'
  | 'scba'
  | 'emergency_lighting';

export type SafetyRating = 1 | 2 | 3 | 4 | 5;

export interface EquipmentData {
  id: string;
  type: EquipmentType;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastInspection?: Date;
  nextInspection?: Date;
  calibration?: CalibrationStatus;
  maintenance?: MaintenanceRecord[];
  certification?: CertificationRecord;
  safetyStandards?: string[];
  safetyRating?: SafetyRating;
  operatingConditions?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
  };
  specifications?: {
    voltage?: number;
    communicationProtocol?: string;
  };
}

export interface CalibrationStatus {
  lastDate?: Date;
  nextDate?: Date;
  accuracy?: number;
  drift?: number;
  status: 'current' | 'due' | 'overdue';
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  scheduledDate?: Date;
  nextDueDate?: Date;
}

export interface CertificationRecord {
  id: string;
  type: string;
  issueDate: Date;
  expiryDate?: Date;
  authority?: string;
  level?: string;
  status: 'valid' | 'expired' | 'pending';
}

export interface EquipmentValidationResult extends ValidationResult {
  equipmentStatus: EquipmentStatus;
  certificationStatus: CertificationStatus;
  maintenanceStatus: MaintenanceStatus;
  calibrationStatus: CalibrationValidationStatus;
  safetyCompliance: SafetyComplianceStatus;
}

export interface EquipmentStatus {
  operational: boolean;
  readiness: 'ready' | 'needs_attention' | 'not_ready';
  issues: EquipmentIssue[];
  lastInspection: Date | null;
  nextMaintenanceDue: Date | null;
}

export interface CertificationStatus {
  isValid: boolean;
  expiryDate: Date | null;
  certifyingAuthority: string | null;
  certificationLevel: string | null;
  renewalRequired: boolean;
}

export interface MaintenanceStatus {
  upToDate: boolean;
  overdue: MaintenanceRecord[];
  upcoming: MaintenanceRecord[];
  lastService: Date | null;
  nextService: Date | null;
}

export interface CalibrationValidationStatus {
  isCalibrated: boolean;
  lastCalibration: Date | null;
  nextCalibration: Date | null;
  driftDetected: boolean;
  accuracy: number;
  withinTolerance: boolean;
}

export interface SafetyComplianceStatus {
  compliant: boolean;
  safetyRating: SafetyRating;
  violatedStandards: string[];
  requiredUpgrades: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EquipmentIssue {
  type: EquipmentIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: BilingualText;
  recommendation: BilingualText;
  urgent: boolean;
  estimatedDowntime?: number;
}

export type EquipmentIssueType = 
  | 'calibration_overdue'
  | 'maintenance_overdue' 
  | 'certification_expired'
  | 'safety_violation'
  | 'performance_degraded'
  | 'component_failure'
  | 'connectivity_issue'
  | 'power_issue'
  | 'environmental_damage'
  | 'wear_excessive'
  | 'configuration_invalid';

// =================== TYPES PERSONNEL ===================
export type PersonnelRole = 
  | 'entry_supervisor'
  | 'entrant'
  | 'attendant'
  | 'rescue_team_member'
  | 'safety_officer'
  | 'support_personnel';

export type ExperienceLevel = 'novice' | 'intermediate' | 'experienced' | 'expert';
export type CompetencyLevel = 'basic' | 'proficient' | 'advanced' | 'expert';
export type FitnessLevel = 'excellent' | 'good' | 'adequate' | 'limited' | 'unfit';
export type ExperienceBalance = 'poor' | 'adequate' | 'good' | 'excellent';

export interface PersonnelData {
  id: string;
  name: string;
  employeeId?: string;
  role: PersonnelRole;
  experienceYears?: number;
  hireDate?: Date;
  certifications?: CertificationRecord[];
  training?: TrainingRecord[];
  medicalClearance?: MedicalClearance;
  emergencyContact?: EmergencyContact;
  communicationDevice?: string;
}

export interface TrainingRecord {
  id: string;
  course: string;
  provider: string;
  completionDate: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  score?: number;
  refresherRequired?: boolean;
}

export interface MedicalClearance {
  id: string;
  status: 'cleared' | 'restricted' | 'not_cleared';
  lastExam?: Date;
  nextExam?: Date;
  examiner?: string;
  restrictions?: MedicalRestriction[];
  fitnessLevel?: FitnessLevel;
}

export interface MedicalRestriction {
  type: MedicalRestrictionType;
  description: BilingualText;
  limitations: string[];
  accommodations?: string[];
  reviewDate?: Date;
  severity?: 'minor' | 'moderate' | 'major' | 'absolute';
}

export type MedicalRestrictionType = 
  | 'cardiovascular'
  | 'respiratory'
  | 'musculoskeletal'
  | 'neurological'
  | 'psychological'
  | 'sensory'
  | 'pregnancy'
  | 'medication_effects';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
  alternatePhone?: string;
  email?: string;
}

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

export interface PersonnelRestriction {
  type: RestrictionType;
  description: BilingualText;
  severity: 'low' | 'medium' | 'high' | 'absolute';
  validUntil?: Date;
  conditions?: string[];
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

// =================== TYPES PROCÉDURES ===================
export type ProcedureType = 
  | 'confined_space_entry'
  | 'hot_work'
  | 'excavation'
  | 'lockout_tagout'
  | 'fall_protection';

export interface ProcedureData {
  id: string;
  type: ProcedureType;
  title: BilingualText;
  description: BilingualText;
  steps?: ProcedureStep[];
  safetyProtocols?: SafetyProtocol[];
  emergencyProcedures?: EmergencyProcedure[];
  requiredDocuments?: string[];
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  lastReview?: Date;
  nextReview?: Date;
  version?: string;
  riskAssessment?: RiskAssessment;
  communicationProtocol?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface ProcedureStep {
  id: string;
  stepNumber: number;
  title: BilingualText;
  description: BilingualText;
  safetyChecks?: string[];
  requiredEquipment?: string[];
  estimatedTime?: number;
  references?: {
    procedureId: string;
    stepId?: string;
    documentName?: string;
  }[];
  mandatory: boolean;
}

export interface SafetyProtocol {
  id: string;
  type: string;
  description: BilingualText;
  implemented: boolean;
  verificationMethod?: string;
  frequency?: string;
  responsiblePerson?: string;
}

export interface EmergencyProcedure {
  id: string;
  type: EmergencyType;
  description: BilingualText;
  steps: ProcedureStep[];
  tested?: boolean;
  lastDrill?: Date;
  nextDrill?: Date;
  responsiblePersons?: string[];
}

export type EmergencyType = 
  | 'atmospheric_hazard'
  | 'entrapment'
  | 'equipment_failure'
  | 'medical_emergency'
  | 'fire_explosion'
  | 'structural_collapse'
  | 'communication_failure'
  | 'weather_emergency'
  | 'evacuation'
  | 'rescue';

export interface RiskAssessment {
  id: string;
  assessor: string;
  assessmentDate: Date;
  lastUpdate?: Date;
  risks: RiskItem[];
  controlMeasures: ControlMeasure[];
  residualRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  approved: boolean;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface RiskItem {
  id: string;
  description: BilingualText;
  probability: 'low' | 'medium' | 'high';
  consequence: 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  mitigated: boolean;
  controls: string[];
}

export interface ControlMeasure {
  id?: string;
  type: ControlType;
  description: BilingualText;
  effectiveness: 'low' | 'medium' | 'high';
  implemented: boolean;
  verificationRequired: boolean;
}

export type ControlType = 
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export interface WorkPermit {
  id: string;
  permitNumber: string;
  type: ProcedureType;
  status: PermitStatus;
  issuedDate: Date;
  validFrom: Date;
  validUntil: Date;
  issuedBy: string;
  authorizedPersonnel: string[];
  workDescription: BilingualText;
  location: string;
  specialConditions?: string[];
  extensions?: PermitExtension[];
}

export interface PermitExtension {
  id: string;
  requestedBy: string;
  requestDate: Date;
  newExpiryDate: Date;
  reason: string;
  approvedBy?: string;
  approvalDate?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ProcedureValidationResult extends ValidationResult {
  procedureStatus: ProcedureStatus;
  safetyCompliance: ProcSafetyComplianceStatus;
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

export interface ProcSafetyComplianceStatus {
  compliant: boolean;
  safetyRating: SafetyRating;
  violatedProtocols: string[];
  missingProtocols: string[];
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
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

export interface EmergencyProcedureStatus {
  type: EmergencyType;
  defined: boolean;
  tested: boolean;
  upToDate: boolean;
  lastDrill: Date | null;
  nextDrillDue: Date | null;
}

export interface RegulatoryComplianceStatus {
  compliant: boolean;
  applicableRegulations: string[];
  violatedRegulations: string[];
  requiredDocuments: string[];
  missingDocuments: string[];
  complianceLevel: 'non_compliant' | 'partially_compliant' | 'mostly_compliant' | 'fully_compliant';
}

export interface RiskManagementStatus {
  adequate: boolean;
  identifiedRisks: RiskItem[];
  unmitigatedRisks: RiskItem[];
  riskAssessmentCurrent: boolean;
  controlMeasures: ControlMeasure[];
  residualRiskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface ProcedureGap {
  type: ProcedureGapType;
  description: BilingualText;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: BilingualText;
  regulatoryRequirement?: string;
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

export interface DocumentationGap {
  documentType: string;
  requirement: BilingualText;
  impact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// =================== TYPES CONFIGURATION ET RÉGLEMENTATIONS ===================
export interface RegulationConfig {
  jurisdiction: Jurisdiction;
  authority: string;
  lastUpdated: string;
  confinedSpaceClasses?: any;
  applicableRegulations?: string[];
  atmosphericLimits?: AtmosphericLimits;
  equipmentRequirements?: any;
  personnelRequirements?: any;
  procedureRequirements?: any;
}

// =================== EXPORTS FINAUX ===================
export default {
  // Types de base
  BilingualText,
  PermitStatus,
  Priority,
  Jurisdiction,
  
  // Validation
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  ValidationSummary,
  
  // Permis
  PermitData,
  PermitValidationResult,
  
  // Atmosphérique
  GasType,
  AlarmLevel,
  AtmosphericReading,
  AtmosphericData,
  AtmosphericLimits,
  DataQualityMetrics,
  
  // Équipement
  EquipmentType,
  EquipmentData,
  CalibrationStatus,
  MaintenanceRecord,
  CertificationRecord,
  EquipmentValidationResult,
  
  // Personnel
  PersonnelRole,
  PersonnelData,
  TrainingRecord,
  MedicalClearance,
  EmergencyContact,
  PersonnelValidationResult,
  
  // Procédures
  ProcedureType,
  ProcedureData,
  ProcedureStep,
  SafetyProtocol,
  EmergencyProcedure,
  RiskAssessment,
  WorkPermit,
  ProcedureValidationResult,
  
  // Configuration
  RegulationConfig
};

// =================== SYSTÈME COMPLET PRÊT ! ===================
