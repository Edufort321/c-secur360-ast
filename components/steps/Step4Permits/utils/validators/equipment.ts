// components/steps/Step4Permits/utils/validators/equipment.ts
"use client";

// Types définis localement pour éviter les dépendances manquantes
export interface BilingualText {
  fr: string;
  en: string;
}

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

export type CalibrationStatus = 'valid' | 'expired' | 'due_soon' | 'overdue' | 'unknown';

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

export interface MaintenanceRecord {
  id: string;
  date: string | Date;
  scheduledDate?: string | Date;
  type: string;
  description: string;
  technician?: string;
  completed: boolean;
}

export interface EquipmentData {
  id: string;
  type: EquipmentType;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string | Date;
  warrantyExpiry?: string | Date;
  lastInspection?: string | Date;
  safetyRating?: SafetyRating;
  safetyStandards?: string[];
  operatingConditions?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
  };
  specifications?: {
    voltage?: number;
    communicationProtocol?: string;
    [key: string]: any;
  };
  calibration?: {
    lastDate?: string | Date;
    nextDate?: string | Date;
    accuracy?: number;
    drift?: number;
    status?: CalibrationStatus;
  };
  certification?: {
    authority?: string;
    level?: string;
    expiryDate?: string | Date;
    number?: string;
  };
  maintenanceHistory?: MaintenanceRecord[];
  [key: string]: any;
}

// =================== TYPES VALIDATION ÉQUIPEMENT ===================

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
  estimatedDowntime?: number; // minutes
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

// =================== CONSTANTES ÉQUIPEMENT ===================

const EQUIPMENT_SPECIFICATIONS: Record<EquipmentType, {
  maxAge: number; // années
  calibrationInterval: number; // jours
  maintenanceInterval: number; // jours
  certificationRequired: boolean;
  safetyStandards: string[];
  operatingConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    pressure: { min: number; max: number };
  };
  accuracyTolerance: number; // %
  driftTolerance: number; // %/jour
}> = {
  gas_detector_portable: {
    maxAge: 10,
    calibrationInterval: 180, // 6 mois
    maintenanceInterval: 365, // 1 an
    certificationRequired: true,
    safetyStandards: ['CSA', 'UL', 'ATEX'],
    operatingConditions: {
      temperature: { min: -20, max: 50 },
      humidity: { min: 15, max: 90 },
      pressure: { min: 80, max: 120 }
    },
    accuracyTolerance: 5,
    driftTolerance: 2
  },
  gas_detector_fixed: {
    maxAge: 15,
    calibrationInterval: 90, // 3 mois
    maintenanceInterval: 180, // 6 mois
    certificationRequired: true,
    safetyStandards: ['CSA', 'UL', 'ATEX', 'SIL'],
    operatingConditions: {
      temperature: { min: -40, max: 70 },
      humidity: { min: 10, max: 95 },
      pressure: { min: 70, max: 130 }
    },
    accuracyTolerance: 3,
    driftTolerance: 1
  },
  ventilation_fan: {
    maxAge: 20,
    calibrationInterval: 365, // 1 an
    maintenanceInterval: 90, // 3 mois
    certificationRequired: false,
    safetyStandards: ['CSA', 'UL'],
    operatingConditions: {
      temperature: { min: -30, max: 60 },
      humidity: { min: 0, max: 100 },
      pressure: { min: 50, max: 150 }
    },
    accuracyTolerance: 10,
    driftTolerance: 5
  },
  air_pump: {
    maxAge: 15,
    calibrationInterval: 180, // 6 mois
    maintenanceInterval: 90, // 3 mois
    certificationRequired: true,
    safetyStandards: ['CSA', 'UL'],
    operatingConditions: {
      temperature: { min: -20, max: 50 },
      humidity: { min: 10, max: 85 },
      pressure: { min: 80, max: 120 }
    },
    accuracyTolerance: 5,
    driftTolerance: 3
  },
  communication_system: {
    maxAge: 10,
    calibrationInterval: 365, // 1 an
    maintenanceInterval: 180, // 6 mois
    certificationRequired: false,
    safetyStandards: ['IC', 'FCC'],
    operatingConditions: {
      temperature: { min: -30, max: 60 },
      humidity: { min: 5, max: 95 },
      pressure: { min: 70, max: 130 }
    },
    accuracyTolerance: 15,
    driftTolerance: 10
  },
  tripod_winch: {
    maxAge: 25,
    calibrationInterval: 365, // 1 an
    maintenanceInterval: 30, // 1 mois
    certificationRequired: true,
    safetyStandards: ['CSA', 'ANSI', 'CE'],
    operatingConditions: {
      temperature: { min: -40, max: 50 },
      humidity: { min: 0, max: 100 },
      pressure: { min: 50, max: 150 }
    },
    accuracyTolerance: 2,
    driftTolerance: 1
  },
  fall_protection: {
    maxAge: 10,
    calibrationInterval: 365, // 1 an
    maintenanceInterval: 30, // 1 mois
    certificationRequired: true,
    safetyStandards: ['CSA', 'ANSI', 'CE'],
    operatingConditions: {
      temperature: { min: -40, max: 60 },
      humidity: { min: 0, max: 100 },
      pressure: { min: 50, max: 150 }
    },
    accuracyTolerance: 1,
    driftTolerance: 0.5
  },
  scba: {
    maxAge: 15,
    calibrationInterval: 365, // 1 an
    maintenanceInterval: 30, // 1 mois
    certificationRequired: true,
    safetyStandards: ['NIOSH', 'CSA', 'CE'],
    operatingConditions: {
      temperature: { min: -30, max: 60 },
      humidity: { min: 0, max: 100 },
      pressure: { min: 50, max: 150 }
    },
    accuracyTolerance: 2,
    driftTolerance: 1
  },
  emergency_lighting: {
    maxAge: 20,
    calibrationInterval: 180, // 6 mois
    maintenanceInterval: 90, // 3 mois
    certificationRequired: false,
    safetyStandards: ['CSA', 'UL'],
    operatingConditions: {
      temperature: { min: -20, max: 50 },
      humidity: { min: 10, max: 90 },
      pressure: { min: 70, max: 130 }
    },
    accuracyTolerance: 10,
    driftTolerance: 5
  }
};

const SAFETY_CRITICAL_EQUIPMENT: EquipmentType[] = [
  'gas_detector_portable',
  'gas_detector_fixed', 
  'tripod_winch',
  'fall_protection',
  'scba'
];

const CALIBRATION_GRACE_PERIOD = 7; // jours
const MAINTENANCE_GRACE_PERIOD = 14; // jours

// =================== FONCTIONS VALIDATION PRINCIPALES ===================

/**
 * Valide un équipement complet
 */
function validateEquipment(equipment: EquipmentData): EquipmentValidationResult {
  const baseValidation = validateBasicEquipmentData(equipment);
  
  // Validation spécialisée selon type
  const typeValidation = validateEquipmentByType(equipment);
  
  // Statuts détaillés
  const equipmentStatus = assessEquipmentStatus(equipment);
  const certificationStatus = validateCertification(equipment);
  const maintenanceStatus = validateMaintenance(equipment);
  const calibrationStatus = validateCalibration(equipment);
  const safetyCompliance = validateSafetyCompliance(equipment);

  // Fusion résultats
  const combinedResult: EquipmentValidationResult = {
    ...baseValidation,
    errors: [...baseValidation.errors, ...typeValidation.errors],
    warnings: [...baseValidation.warnings, ...typeValidation.warnings],
    suggestions: [...baseValidation.suggestions, ...typeValidation.suggestions],
    equipmentStatus,
    certificationStatus,
    maintenanceStatus,
    calibrationStatus,
    safetyCompliance
  };

  // Recalcul validité globale
  combinedResult.isValid = combinedResult.errors.filter(e => e.critical).length === 0 &&
                          equipmentStatus.operational &&
                          certificationStatus.isValid &&
                          maintenanceStatus.upToDate &&
                          calibrationStatus.isCalibrated &&
                          safetyCompliance.compliant;

  return combinedResult;
}

/**
 * Valide un ensemble d'équipements
 */
function validateEquipmentSet(equipments: EquipmentData[]): EquipmentValidationResult {
  if (equipments.length === 0) {
    return createEmptyValidationResult('Aucun équipement fourni');
  }

  const individualResults = equipments.map(eq => validateEquipment(eq));
  
  // Validation ensemble
  const setValidation = validateEquipmentCompatibility(equipments);
  const redundancyValidation = validateEquipmentRedundancy(equipments);
  
  // Fusion tous résultats
  const allErrors = individualResults.flatMap(r => r.errors).concat(setValidation.errors, redundancyValidation.errors);
  const allWarnings = individualResults.flatMap(r => r.warnings).concat(setValidation.warnings, redundancyValidation.warnings);
  const allSuggestions = individualResults.flatMap(r => r.suggestions).concat(setValidation.suggestions, redundancyValidation.suggestions);

  // Statuts ensemble
  const equipmentStatus: EquipmentStatus = {
    operational: individualResults.every(r => r.equipmentStatus.operational),
    readiness: calculateSetReadiness(individualResults),
    issues: individualResults.flatMap(r => r.equipmentStatus.issues),
    lastInspection: getLatestDate(individualResults.map(r => r.equipmentStatus.lastInspection)),
    nextMaintenanceDue: getEarliestDate(individualResults.map(r => r.equipmentStatus.nextMaintenanceDue))
  };

  const certificationStatus: CertificationStatus = {
    isValid: individualResults.every(r => r.certificationStatus.isValid),
    expiryDate: getEarliestDate(individualResults.map(r => r.certificationStatus.expiryDate)),
    certifyingAuthority: null,
    certificationLevel: null,
    renewalRequired: individualResults.some(r => r.certificationStatus.renewalRequired)
  };

  const maintenanceStatus: MaintenanceStatus = {
    upToDate: individualResults.every(r => r.maintenanceStatus.upToDate),
    overdue: individualResults.flatMap(r => r.maintenanceStatus.overdue),
    upcoming: individualResults.flatMap(r => r.maintenanceStatus.upcoming),
    lastService: getLatestDate(individualResults.map(r => r.maintenanceStatus.lastService)),
    nextService: getEarliestDate(individualResults.map(r => r.maintenanceStatus.nextService))
  };

  const calibrationStatus: CalibrationValidationStatus = {
    isCalibrated: individualResults.every(r => r.calibrationStatus.isCalibrated),
    lastCalibration: getLatestDate(individualResults.map(r => r.calibrationStatus.lastCalibration)),
    nextCalibration: getEarliestDate(individualResults.map(r => r.calibrationStatus.nextCalibration)),
    driftDetected: individualResults.some(r => r.calibrationStatus.driftDetected),
    accuracy: Math.min(...individualResults.map(r => r.calibrationStatus.accuracy)),
    withinTolerance: individualResults.every(r => r.calibrationStatus.withinTolerance)
  };

  const safetyCompliance: SafetyComplianceStatus = {
    compliant: individualResults.every(r => r.safetyCompliance.compliant),
    safetyRating: calculateLowestSafetyRating(individualResults.map(r => r.safetyCompliance.safetyRating)),
    violatedStandards: [...new Set(individualResults.flatMap(r => r.safetyCompliance.violatedStandards))],
    requiredUpgrades: [...new Set(individualResults.flatMap(r => r.safetyCompliance.requiredUpgrades))],
    riskLevel: calculateHighestRiskLevel(individualResults.map(r => r.safetyCompliance.riskLevel))
  };

  return {
    isValid: allErrors.filter(e => e.critical).length === 0,
    errors: allErrors,
    warnings: allWarnings,
    criticalIssues: allErrors.filter(e => e.critical),
    suggestions: allSuggestions,
    confidence: calculateSetConfidence(individualResults),
    equipmentStatus,
    certificationStatus,
    maintenanceStatus,
    calibrationStatus,
    safetyCompliance
  };
}

// =================== VALIDATIONS SPÉCIALISÉES ===================

/**
 * Validation données de base équipement
 */
function validateBasicEquipmentData(equipment: EquipmentData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Champs obligatoires
  if (!equipment.id) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'ID équipement requis', en: 'Equipment ID required' },
      field: 'id',
      critical: true
    });
  }

  if (!equipment.type) {
    errors.push({
      type: 'missing_required',
      message: { fr: 'Type équipement requis', en: 'Equipment type required' },
      field: 'type',
      critical: true
    });
  }

  if (!equipment.serialNumber) {
    warnings.push({
      type: 'missing_data',
      message: { fr: 'Numéro de série manquant', en: 'Serial number missing' },
      field: 'serialNumber',
      severity: 'medium'
    });
  }

  if (!equipment.manufacturer) {
    warnings.push({
      type: 'missing_data',
      message: { fr: 'Fabricant non spécifié', en: 'Manufacturer not specified' },
      field: 'manufacturer',
      severity: 'low'
    });
  }

  // Validation dates
  if (equipment.purchaseDate && new Date(equipment.purchaseDate) > new Date()) {
    errors.push({
      type: 'invalid_data',
      message: { fr: 'Date d\'achat dans le futur', en: 'Purchase date in future' },
      field: 'purchaseDate',
      critical: false
    });
  }

  if (equipment.warrantyExpiry && new Date(equipment.warrantyExpiry) < new Date()) {
    warnings.push({
      type: 'expired_warranty',
      message: { fr: 'Garantie expirée', en: 'Warranty expired' },
      field: 'warrantyExpiry',
      severity: 'low'
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
 * Validation par type d'équipement
 */
function validateEquipmentByType(equipment: EquipmentData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!equipment.type) return { isValid: false, errors, warnings, criticalIssues: [], suggestions, confidence: 0 };

  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  if (!specs) {
    errors.push({
      type: 'unknown_type',
      message: { fr: `Type d'équipement non reconnu: ${equipment.type}`, en: `Unknown equipment type: ${equipment.type}` },
      field: 'type',
      critical: true
    });
    return { isValid: false, errors, warnings, criticalIssues: errors, suggestions, confidence: 0 };
  }

  // Validation âge équipement
  if (equipment.purchaseDate) {
    const ageYears = (Date.now() - new Date(equipment.purchaseDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (ageYears > specs.maxAge) {
      warnings.push({
        type: 'equipment_old',
        message: { 
          fr: `Équipement dépassé (${Math.round(ageYears)} ans, max: ${specs.maxAge} ans)`, 
          en: `Equipment outdated (${Math.round(ageYears)} years, max: ${specs.maxAge} years)` 
        },
        field: 'age',
        severity: 'high'
      });

      suggestions.push({
        type: 'equipment_replacement',
        message: { fr: 'Remplacement équipement recommandé', en: 'Equipment replacement recommended' },
        priority: 'high'
      });
    } else if (ageYears > specs.maxAge * 0.8) {
      suggestions.push({
        type: 'replacement_planning',
        message: { fr: 'Planifier remplacement équipement', en: 'Plan equipment replacement' },
        priority: 'medium'
      });
    }
  }

  // Validation conditions opérationnelles
  if (equipment.operatingConditions) {
    const conditions = equipment.operatingConditions;
    const limits = specs.operatingConditions;

    if (conditions.temperature !== undefined) {
      if (conditions.temperature < limits.temperature.min || conditions.temperature > limits.temperature.max) {
        warnings.push({
          type: 'operating_conditions',
          message: { 
            fr: `Température hors limites: ${conditions.temperature}°C (${limits.temperature.min}-${limits.temperature.max}°C)`,
            en: `Temperature out of limits: ${conditions.temperature}°C (${limits.temperature.min}-${limits.temperature.max}°C)`
          },
          field: 'temperature',
          severity: 'high'
        });
      }
    }

    if (conditions.humidity !== undefined) {
      if (conditions.humidity < limits.humidity.min || conditions.humidity > limits.humidity.max) {
        warnings.push({
          type: 'operating_conditions',
          message: { 
            fr: `Humidité hors limites: ${conditions.humidity}% (${limits.humidity.min}-${limits.humidity.max}%)`,
            en: `Humidity out of limits: ${conditions.humidity}% (${limits.humidity.min}-${limits.humidity.max}%)`
          },
          field: 'humidity',
          severity: 'medium'
        });
      }
    }
  }

  return {
    isValid: errors.filter(e => e.critical).length === 0,
    errors,
    warnings,
    criticalIssues: errors.filter(e => e.critical),
    suggestions,
    confidence: errors.length === 0 && warnings.length < 3 ? 0.9 : 0.6
  };
}

/**
 * Évalue statut opérationnel équipement
 */
function assessEquipmentStatus(equipment: EquipmentData): EquipmentStatus {
  const issues: EquipmentIssue[] = [];
  
  // Vérifications calibration
  const calibrationIssue = checkCalibrationStatus(equipment);
  if (calibrationIssue) issues.push(calibrationIssue);

  // Vérifications maintenance
  const maintenanceIssue = checkMaintenanceStatus(equipment);
  if (maintenanceIssue) issues.push(maintenanceIssue);

  // Vérifications certification
  const certificationIssue = checkCertificationStatus(equipment);
  if (certificationIssue) issues.push(certificationIssue);

  // Vérifications performances
  const performanceIssue = checkPerformanceStatus(equipment);
  if (performanceIssue) issues.push(performanceIssue);

  // Déterminer état global
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');

  let readiness: 'ready' | 'needs_attention' | 'not_ready';
  let operational = true;

  if (criticalIssues.length > 0) {
    readiness = 'not_ready';
    operational = false;
  } else if (highIssues.length > 0) {
    readiness = 'needs_attention';
  } else {
    readiness = 'ready';
  }

  return {
    operational,
    readiness,
    issues,
    lastInspection: equipment.lastInspection ? new Date(equipment.lastInspection) : null,
    nextMaintenanceDue: calculateNextMaintenance(equipment)
  };
}

/**
 * Valide certification équipement
 */
function validateCertification(equipment: EquipmentData): CertificationStatus {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  
  if (!specs?.certificationRequired) {
    return {
      isValid: true,
      expiryDate: null,
      certifyingAuthority: null,
      certificationLevel: null,
      renewalRequired: false
    };
  }

  const certification = equipment.certification;
  if (!certification) {
    return {
      isValid: false,
      expiryDate: null,
      certifyingAuthority: null,
      certificationLevel: null,
      renewalRequired: true
    };
  }

  const isValid = certification.expiryDate ? new Date(certification.expiryDate) > new Date() : false;
  const renewalRequired = certification.expiryDate ? 
    (new Date(certification.expiryDate).getTime() - Date.now()) < (30 * 24 * 60 * 60 * 1000) : true;

  return {
    isValid,
    expiryDate: certification.expiryDate ? new Date(certification.expiryDate) : null,
    certifyingAuthority: certification.authority || null,
    certificationLevel: certification.level || null,
    renewalRequired
  };
}

/**
 * Valide maintenance équipement
 */
function validateMaintenance(equipment: EquipmentData): MaintenanceStatus {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const maintenanceRecords = equipment.maintenanceHistory || [];
  
  const now = new Date();
  const lastService = maintenanceRecords.length > 0 ? 
    new Date(Math.max(...maintenanceRecords.map(r => new Date(r.date).getTime()))) : null;
  
  const nextService = lastService ? 
    new Date(lastService.getTime() + specs.maintenanceInterval * 24 * 60 * 60 * 1000) : 
    new Date(now.getTime() + specs.maintenanceInterval * 24 * 60 * 60 * 1000);

  const upToDate = lastService ? 
    (now.getTime() - lastService.getTime()) <= (specs.maintenanceInterval + MAINTENANCE_GRACE_PERIOD) * 24 * 60 * 60 * 1000 : 
    false;

  const overdue = !upToDate && lastService ? 
    maintenanceRecords.filter(r => 
      (now.getTime() - new Date(r.date).getTime()) > (specs.maintenanceInterval + MAINTENANCE_GRACE_PERIOD) * 24 * 60 * 60 * 1000
    ) : [];

  const upcoming = maintenanceRecords.filter(r => {
    const scheduledDate = new Date(r.scheduledDate || r.date);
    const timeDiff = scheduledDate.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 30 * 24 * 60 * 60 * 1000; // Prochains 30 jours
  });

  return {
    upToDate,
    overdue,
    upcoming,
    lastService,
    nextService
  };
}

/**
 * Valide calibration équipement
 */
function validateCalibration(equipment: EquipmentData): CalibrationValidationStatus {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const calibration = equipment.calibration;
  
  if (!calibration) {
    return {
      isCalibrated: false,
      lastCalibration: null,
      nextCalibration: null,
      driftDetected: false,
      accuracy: 0,
      withinTolerance: false
    };
  }

  const now = new Date();
  const lastCalibration = calibration.lastDate ? new Date(calibration.lastDate) : null;
  const nextCalibration = lastCalibration ? 
    new Date(lastCalibration.getTime() + specs.calibrationInterval * 24 * 60 * 60 * 1000) : null;

  const isCalibrated = lastCalibration ? 
    (now.getTime() - lastCalibration.getTime()) <= (specs.calibrationInterval + CALIBRATION_GRACE_PERIOD) * 24 * 60 * 60 * 1000 : 
    false;

  const accuracy = calibration.accuracy || 0;
  const withinTolerance = accuracy <= specs.accuracyTolerance;
  
  // Détection dérive simple
  const driftDetected = calibration.drift ? Math.abs(calibration.drift) > specs.driftTolerance : false;

  return {
    isCalibrated,
    lastCalibration,
    nextCalibration,
    driftDetected,
    accuracy,
    withinTolerance
  };
}

/**
 * Valide conformité sécurité
 */
function validateSafetyCompliance(equipment: EquipmentData): SafetyComplianceStatus {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const isSafetyCritical = SAFETY_CRITICAL_EQUIPMENT.includes(equipment.type);
  
  const violatedStandards: string[] = [];
  const requiredUpgrades: string[] = [];

  // Vérifier standards requis
  if (equipment.safetyStandards) {
    specs.safetyStandards.forEach(required => {
      if (!equipment.safetyStandards!.includes(required)) {
        violatedStandards.push(required);
      }
    });
  } else {
    violatedStandards.push(...specs.safetyStandards);
  }

  // Évaluer niveau de risque
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (isSafetyCritical && violatedStandards.length > 0) {
    riskLevel = 'critical';
  } else if (violatedStandards.length > 2) {
    riskLevel = 'high';
  } else if (violatedStandards.length > 0) {
    riskLevel = 'medium';
  }

  // Déterminer mises à niveau requises
  if (violatedStandards.length > 0) {
    requiredUpgrades.push('Mise à jour certifications sécurité');
  }

  if (equipment.safetyRating && equipment.safetyRating < 3) {
    requiredUpgrades.push('Amélioration cote sécurité');
  }

  const compliant = violatedStandards.length === 0 && riskLevel !== 'critical';
  const safetyRating = equipment.safetyRating || 3;

  return {
    compliant,
    safetyRating,
    violatedStandards,
    requiredUpgrades,
    riskLevel
  };
}

// =================== VALIDATIONS ENSEMBLE ===================

/**
 * Valide compatibilité entre équipements
 */
function validateEquipmentCompatibility(equipments: EquipmentData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Vérifier compatibilité électrique
  const electricalCheck = checkElectricalCompatibility(equipments);
  if (!electricalCheck.compatible) {
    warnings.push({
      type: 'compatibility_issue',
      message: electricalCheck.message,
      field: 'electrical',
      severity: 'high'
    });
  }

  // Vérifier compatibilité communications
  const commCheck = checkCommunicationCompatibility(equipments);
  if (!commCheck.compatible) {
    warnings.push({
      type: 'compatibility_issue', 
      message: commCheck.message,
      field: 'communication',
      severity: 'medium'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalIssues: errors.filter(e => e.critical),
    suggestions,
    confidence: warnings.length === 0 ? 1 : 0.8
  };
}

/**
 * Valide redondance équipements critiques
 */
function validateEquipmentRedundancy(equipments: EquipmentData[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Vérifier redondance détecteurs gaz
  const gasDetectors = equipments.filter(eq => 
    eq.type === 'gas_detector_portable' || eq.type === 'gas_detector_fixed'
  );

  if (gasDetectors.length < 2) {
    warnings.push({
      type: 'insufficient_redundancy',
      message: { 
        fr: 'Redondance insuffisante pour détecteurs gaz',
        en: 'Insufficient redundancy for gas detectors'
      },
      field: 'gas_detectors',
      severity: 'high'
    });

    suggestions.push({
      type: 'add_redundancy',
      message: { 
        fr: 'Ajouter détecteur gaz redondant',
        en: 'Add redundant gas detector'
      },
      priority: 'high'
    });
  }

  // Vérifier systèmes communication
  const commSystems = equipments.filter(eq => eq.type === 'communication_system');
  if (commSystems.length < 1) {
    errors.push({
      type: 'missing_critical',
      message: { 
        fr: 'Système communication requis',
        en: 'Communication system required'
      },
      field: 'communication',
      critical: true
    });
  }

  return {
    isValid: errors.filter(e => e.critical).length === 0,
    errors,
    warnings,
    criticalIssues: errors.filter(e => e.critical),
    suggestions,
    confidence: 0.9
  };
}

// =================== FONCTIONS UTILITAIRES ===================

function checkCalibrationStatus(equipment: EquipmentData): EquipmentIssue | null {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const calibration = equipment.calibration;

  if (!calibration?.lastDate) {
    return {
      type: 'calibration_overdue',
      severity: 'critical',
      description: { fr: 'Aucune calibration enregistrée', en: 'No calibration recorded' },
      recommendation: { fr: 'Effectuer calibration immédiate', en: 'Perform immediate calibration' },
      urgent: true
    };
  }

  const daysSinceCalibration = (Date.now() - new Date(calibration.lastDate).getTime()) / (24 * 60 * 60 * 1000);
  
  if (daysSinceCalibration > specs.calibrationInterval + CALIBRATION_GRACE_PERIOD) {
    return {
      type: 'calibration_overdue',
      severity: 'high',
      description: { 
        fr: `Calibration en retard de ${Math.round(daysSinceCalibration - specs.calibrationInterval)} jours`,
        en: `Calibration overdue by ${Math.round(daysSinceCalibration - specs.calibrationInterval)} days`
      },
      recommendation: { fr: 'Programmer calibration urgente', en: 'Schedule urgent calibration' },
      urgent: true
    };
  }

  return null;
}

function checkMaintenanceStatus(equipment: EquipmentData): EquipmentIssue | null {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const maintenance = equipment.maintenanceHistory;

  if (!maintenance || maintenance.length === 0) {
    return {
      type: 'maintenance_overdue',
      severity: 'high',
      description: { fr: 'Aucun historique maintenance', en: 'No maintenance history' },
      recommendation: { fr: 'Effectuer inspection maintenance', en: 'Perform maintenance inspection' },
      urgent: false
    };
  }

  const lastMaintenance = new Date(Math.max(...maintenance.map(m => new Date(m.date).getTime())));
  const daysSinceMaintenance = (Date.now() - lastMaintenance.getTime()) / (24 * 60 * 60 * 1000);

  if (daysSinceMaintenance > specs.maintenanceInterval + MAINTENANCE_GRACE_PERIOD) {
    return {
      type: 'maintenance_overdue',
      severity: 'high',
      description: { 
        fr: `Maintenance en retard de ${Math.round(daysSinceMaintenance - specs.maintenanceInterval)} jours`,
        en: `Maintenance overdue by ${Math.round(daysSinceMaintenance - specs.maintenanceInterval)} days`
      },
      recommendation: { fr: 'Programmer maintenance immédiate', en: 'Schedule immediate maintenance' },
      urgent: true
    };
  }

  return null;
}

function checkCertificationStatus(equipment: EquipmentData): EquipmentIssue | null {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  
  if (!specs.certificationRequired) return null;

  const certification = equipment.certification;
  
  if (!certification) {
    return {
      type: 'certification_expired',
      severity: 'critical',
      description: { fr: 'Certification manquante', en: 'Missing certification' },
      recommendation: { fr: 'Obtenir certification requise', en: 'Obtain required certification' },
      urgent: true
    };
  }

  if (certification.expiryDate && new Date(certification.expiryDate) < new Date()) {
    return {
      type: 'certification_expired',
      severity: 'critical',
      description: { fr: 'Certification expirée', en: 'Certification expired' },
      recommendation: { fr: 'Renouveler certification', en: 'Renew certification' },
      urgent: true
    };
  }

  return null;
}

function checkPerformanceStatus(equipment: EquipmentData): EquipmentIssue | null {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  
  if (equipment.calibration?.accuracy && equipment.calibration.accuracy > specs.accuracyTolerance) {
    return {
      type: 'performance_degraded',
      severity: 'medium',
      description: { 
        fr: `Précision dégradée: ${equipment.calibration.accuracy}% (max: ${specs.accuracyTolerance}%)`,
        en: `Degraded accuracy: ${equipment.calibration.accuracy}% (max: ${specs.accuracyTolerance}%)`
      },
      recommendation: { fr: 'Recalibrer ou remplacer', en: 'Recalibrate or replace' },
      urgent: false
    };
  }

  return null;
}

function calculateNextMaintenance(equipment: EquipmentData): Date | null {
  const specs = EQUIPMENT_SPECIFICATIONS[equipment.type];
  const maintenance = equipment.maintenanceHistory;

  if (!maintenance || maintenance.length === 0) {
    return new Date(Date.now() + specs.maintenanceInterval * 24 * 60 * 60 * 1000);
  }

  const lastMaintenance = new Date(Math.max(...maintenance.map(m => new Date(m.date).getTime())));
  return new Date(lastMaintenance.getTime() + specs.maintenanceInterval * 24 * 60 * 60 * 1000);
}

function checkElectricalCompatibility(equipments: EquipmentData[]): { compatible: boolean; message: BilingualText } {
  // Vérification simplifiée - peut être étendue
  const voltages = equipments
    .map(eq => eq.specifications?.voltage)
    .filter(v => v !== undefined) as number[];

  const uniqueVoltages = [...new Set(voltages)];
  
  if (uniqueVoltages.length > 2) {
    return {
      compatible: false,
      message: {
        fr: 'Tensions électriques incompatibles détectées',
        en: 'Incompatible electrical voltages detected'
      }
    };
  }

  return { compatible: true, message: { fr: 'Compatible', en: 'Compatible' } };
}

function checkCommunicationCompatibility(equipments: EquipmentData[]): { compatible: boolean; message: BilingualText } {
  // Vérification simplifiée des protocoles de communication
  const protocols = equipments
    .map(eq => eq.specifications?.communicationProtocol)
    .filter(p => p !== undefined) as string[];

  const uniqueProtocols = [...new Set(protocols)];
  
  if (uniqueProtocols.length > 3) {
    return {
      compatible: false,
      message: {
        fr: 'Trop de protocoles communication différents',
        en: 'Too many different communication protocols'
      }
    };
  }

  return { compatible: true, message: { fr: 'Compatible', en: 'Compatible' } };
}

function calculateSetReadiness(results: EquipmentValidationResult[]): 'ready' | 'needs_attention' | 'not_ready' {
  const notReady = results.filter(r => r.equipmentStatus.readiness === 'not_ready').length;
  const needsAttention = results.filter(r => r.equipmentStatus.readiness === 'needs_attention').length;

  if (notReady > 0) return 'not_ready';
  if (needsAttention > 0) return 'needs_attention';
  return 'ready';
}

function getLatestDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  return validDates.length > 0 ? new Date(Math.max(...validDates.map(d => d.getTime()))) : null;
}

function getEarliestDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  return validDates.length > 0 ? new Date(Math.min(...validDates.map(d => d.getTime()))) : null;
}

function calculateLowestSafetyRating(ratings: SafetyRating[]): SafetyRating {
  return Math.min(...ratings) as SafetyRating;
}

function calculateHighestRiskLevel(levels: ('low' | 'medium' | 'high' | 'critical')[]): 'low' | 'medium' | 'high' | 'critical' {
  const priority = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
  const highest = Math.max(...levels.map(l => priority[l]));
  return Object.keys(priority).find(k => priority[k as keyof typeof priority] === highest) as 'low' | 'medium' | 'high' | 'critical';
}

function calculateSetConfidence(results: EquipmentValidationResult[]): number {
  if (results.length === 0) return 0;
  const average = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  return Math.round(average * 100) / 100;
}

function createEmptyValidationResult(message: string): EquipmentValidationResult {
  return {
    isValid: false,
    errors: [{
      type: 'missing_required',
      message: { fr: message, en: message },
      field: 'equipments',
      critical: true
    }],
    warnings: [],
    criticalIssues: [],
    suggestions: [],
    confidence: 0,
    equipmentStatus: {
      operational: false,
      readiness: 'not_ready',
      issues: [],
      lastInspection: null,
      nextMaintenanceDue: null
    },
    certificationStatus: {
      isValid: false,
      expiryDate: null,
      certifyingAuthority: null,
      certificationLevel: null,
      renewalRequired: false
    },
    maintenanceStatus: {
      upToDate: false,
      overdue: [],
      upcoming: [],
      lastService: null,
      nextService: null
    },
    calibrationStatus: {
      isCalibrated: false,
      lastCalibration: null,
      nextCalibration: null,
      driftDetected: false,
      accuracy: 0,
      withinTolerance: false
    },
    safetyCompliance: {
      compliant: false,
      safetyRating: 1,
      violatedStandards: [],
      requiredUpgrades: [],
      riskLevel: 'critical'
    }
  };
}

// =================== EXPORTS ===================

// Export des constantes pour l'index
export { EQUIPMENT_SPECIFICATIONS, SAFETY_CRITICAL_EQUIPMENT };

// Export des fonctions principales
export { validateEquipment, validateEquipmentSet };

export default {
  validateEquipment,
  validateEquipmentSet,
  EQUIPMENT_SPECIFICATIONS,
  SAFETY_CRITICAL_EQUIPMENT
};
