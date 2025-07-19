/**
 * Atmospheric Data Validators
 * Système de validation sophistiqué pour données atmosphériques espaces clos
 * 
 * Fonctionnalités:
 * - Validation plausibilité lectures atmosphériques
 * - Détection anomalies et erreurs instrumentation
 * - Validation conformité standards réglementaires
 * - Validation qualité données et cohérence temporelle
 */

import type { 
  AtmosphericReading, 
  GasType, 
  AlarmLevel,
  BilingualText 
} from '../types';

// =================== TYPES VALIDATION ===================

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  suggestions: ValidationSuggestion[];
  confidence: number;           // 0-1 confiance globale
  dataQuality: DataQualityMetrics;
}

export interface ValidationWarning {
  type: ValidationWarningType;
  message: BilingualText;
  field: string;
  value: any;
  expectedRange?: { min: number; max: number };
  severity: 'low' | 'medium' | 'high';
  suggestion?: BilingualText;
}

export interface ValidationError {
  type: ValidationErrorType;
  message: BilingualText;
  field: string;
  value: any;
  critical: boolean;
  correctionRequired: boolean;
}

export interface ValidationSuggestion {
  type: SuggestionType;
  message: BilingualText;
  priority: 'low' | 'medium' | 'high';
  actionRequired: BilingualText;
  impact: string;
}

export interface DataQualityMetrics {
  accuracy: number;            // 0-1 précision données
  completeness: number;        // 0-1 complétude données
  consistency: number;         // 0-1 cohérence données
  timeliness: number;          // 0-1 actualité données
  reliability: number;         // 0-1 fiabilité source
  overall: number;             // 0-1 qualité globale
}

export type ValidationWarningType = 
  | 'unusual_reading'          // Lecture inhabituelle mais plausible
  | 'sensor_drift'             // Dérive capteur suspecte
  | 'calibration_due'          // Calibration recommandée
  | 'environmental_factor'     // Facteur environnemental
  | 'temporal_inconsistency'   // Incohérence temporelle
  | 'correlation_anomaly'      // Anomalie corrélation
  | 'precision_degraded';      // Précision dégradée

export type ValidationErrorType = 
  | 'out_of_range'             // Hors limites physiques
  | 'sensor_failure'           // Panne capteur
  | 'invalid_format'           // Format invalide
  | 'missing_required'         // Champ obligatoire manquant
  | 'regulation_violation'     // Violation réglementaire
  | 'safety_critical'          // Critique sécurité
  | 'data_corruption';         // Corruption données

export type SuggestionType = 
  | 'calibration'              // Suggestion calibration
  | 'maintenance'              // Maintenance recommandée
  | 'safety_action'            // Action sécurité
  | 'data_collection'          // Amélioration collecte
  | 'equipment_upgrade'        // Mise à niveau équipement
  | 'procedure_update';        // Mise à jour procédure

// =================== CONSTANTES VALIDATION ===================

const PHYSICAL_LIMITS: Record<GasType, { min: number; max: number; unit: string }> = {
  oxygen: { min: 0, max: 100, unit: '%' },
  carbon_monoxide: { min: 0, max: 10000, unit: 'ppm' },
  hydrogen_sulfide: { min: 0, max: 1000, unit: 'ppm' },
  methane: { min: 0, max: 100, unit: '%' },
  carbon_dioxide: { min: 0, max: 100, unit: '%' },
  ammonia: { min: 0, max: 500, unit: 'ppm' },
  chlorine: { min: 0, max: 100, unit: 'ppm' },
  nitrogen_dioxide: { min: 0, max: 100, unit: 'ppm' },
  sulfur_dioxide: { min: 0, max: 100, unit: 'ppm' },
  benzene: { min: 0, max: 1000, unit: 'ppm' },
  toluene: { min: 0, max: 1000, unit: 'ppm' },
  xylene: { min: 0, max: 1000, unit: 'ppm' }
};

const TYPICAL_RANGES: Record<GasType, { safe: { min: number; max: number }; concern: { min: number; max: number } }> = {
  oxygen: { 
    safe: { min: 19.5, max: 23.5 }, 
    concern: { min: 16, max: 25 } 
  },
  carbon_monoxide: { 
    safe: { min: 0, max: 35 }, 
    concern: { min: 35, max: 200 } 
  },
  hydrogen_sulfide: { 
    safe: { min: 0, max: 10 }, 
    concern: { min: 10, max: 50 } 
  },
  methane: { 
    safe: { min: 0, max: 1 }, 
    concern: { min: 1, max: 5 } 
  },
  carbon_dioxide: { 
    safe: { min: 0, max: 0.5 }, 
    concern: { min: 0.5, max: 3 } 
  },
  ammonia: { 
    safe: { min: 0, max: 25 }, 
    concern: { min: 25, max: 100 } 
  },
  chlorine: { 
    safe: { min: 0, max: 0.5 }, 
    concern: { min: 0.5, max: 3 } 
  },
  nitrogen_dioxide: { 
    safe: { min: 0, max: 3 }, 
    concern: { min: 3, max: 20 } 
  },
  sulfur_dioxide: { 
    safe: { min: 0, max: 2 }, 
    concern: { min: 2, max: 20 } 
  },
  benzene: { 
    safe: { min: 0, max: 0.5 }, 
    concern: { min: 0.5, max: 5 } 
  },
  toluene: { 
    safe: { min: 0, max: 50 }, 
    concern: { min: 50, max: 200 } 
  },
  xylene: { 
    safe: { min: 0, max: 100 }, 
    concern: { min: 100, max: 400 } 
  }
};

const SENSOR_DRIFT_THRESHOLDS = {
  hourly: 0.02,               // 2% dérive max par heure
  daily: 0.05,                // 5% dérive max par jour
  weekly: 0.10                // 10% dérive max par semaine
};

const CORRELATION_COEFFICIENTS: Record<string, { gases: [GasType, GasType]; expected: number }[]> = {
  industrial: [
    { gases: ['carbon_monoxide', 'oxygen'], expected: -0.7 },      // Anti-corrélation CO-O2
    { gases: ['methane', 'oxygen'], expected: -0.8 },              // Anti-corrélation CH4-O2
    { gases: ['benzene', 'toluene'], expected: 0.6 },              // Corrélation solvants
    { gases: ['nitrogen_dioxide', 'sulfur_dioxide'], expected: 0.5 } // Corrélation combustion
  ]
};

// =================== FONCTIONS VALIDATION PRINCIPALES ===================

/**
 * Valide une lecture atmosphérique complète
 */
export function validateAtmosphericReading(
  reading: AtmosphericReading,
  previousReadings?: AtmosphericReading[],
  regulatoryStandards?: Record<GasType, any>
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Validation format et champs obligatoires
  const formatValidation = validateFormat(reading);
  errors.push(...formatValidation.errors);
  warnings.push(...formatValidation.warnings);

  // Validation limites physiques
  const physicalValidation = validatePhysicalLimits(reading);
  errors.push(...physicalValidation.errors);
  warnings.push(...physicalValidation.warnings);

  // Validation plausibilité
  const plausibilityValidation = validatePlausibility(reading);
  warnings.push(...plausibilityValidation.warnings);
  suggestions.push(...plausibilityValidation.suggestions);

  // Validation temporelle si lectures précédentes
  if (previousReadings && previousReadings.length > 0) {
    const temporalValidation = validateTemporalConsistency(reading, previousReadings);
    warnings.push(...temporalValidation.warnings);
    suggestions.push(...temporalValidation.suggestions);
  }

  // Validation conformité réglementaire
  if (regulatoryStandards) {
    const regulatoryValidation = validateRegulatoryCompliance(reading, regulatoryStandards);
    errors.push(...regulatoryValidation.errors);
    warnings.push(...regulatoryValidation.warnings);
  }

  // Calcul métriques qualité
  const dataQuality = calculateDataQuality(reading, previousReadings, errors, warnings);

  // Calcul confiance globale
  const confidence = calculateConfidence(errors, warnings, dataQuality);

  return {
    isValid: errors.filter(e => e.critical).length === 0,
    warnings,
    errors,
    suggestions,
    confidence,
    dataQuality
  };
}

/**
 * Valide un ensemble de lectures atmosphériques
 */
export function validateAtmosphericReadings(
  readings: AtmosphericReading[],
  regulatoryStandards?: Record<GasType, any>
): ValidationResult {
  if (readings.length === 0) {
    return {
      isValid: false,
      warnings: [],
      errors: [{
        type: 'missing_required',
        message: {
          fr: 'Aucune lecture atmosphérique fournie',
          en: 'No atmospheric readings provided'
        },
        field: 'readings',
        value: readings,
        critical: true,
        correctionRequired: true
      }],
      suggestions: [],
      confidence: 0,
      dataQuality: {
        accuracy: 0,
        completeness: 0,
        consistency: 0,
        timeliness: 0,
        reliability: 0,
        overall: 0
      }
    };
  }

  const allWarnings: ValidationWarning[] = [];
  const allErrors: ValidationError[] = [];
  const allSuggestions: ValidationSuggestion[] = [];

  // Validation individuelle
  readings.forEach((reading, index) => {
    const previousReadings = readings.slice(0, index);
    const validation = validateAtmosphericReading(reading, previousReadings, regulatoryStandards);
    
    allWarnings.push(...validation.warnings);
    allErrors.push(...validation.errors);
    allSuggestions.push(...validation.suggestions);
  });

  // Validation ensemble (corrélations, tendances)
  const ensembleValidation = validateEnsembleData(readings);
  allWarnings.push(...ensembleValidation.warnings);
  allSuggestions.push(...ensembleValidation.suggestions);

  // Métriques qualité ensemble
  const dataQuality = calculateEnsembleDataQuality(readings, allErrors, allWarnings);
  const confidence = calculateConfidence(allErrors, allWarnings, dataQuality);

  return {
    isValid: allErrors.filter(e => e.critical).length === 0,
    warnings: allWarnings,
    errors: allErrors,
    suggestions: allSuggestions,
    confidence,
    dataQuality
  };
}

// =================== VALIDATIONS SPÉCIALISÉES ===================

/**
 * Validation format et champs obligatoires
 */
function validateFormat(reading: AtmosphericReading): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Champs obligatoires
  if (!reading.gasType) {
    errors.push({
      type: 'missing_required',
      message: {
        fr: 'Type de gaz requis',
        en: 'Gas type required'
      },
      field: 'gasType',
      value: reading.gasType,
      critical: true,
      correctionRequired: true
    });
  }

  if (reading.value === undefined || reading.value === null) {
    errors.push({
      type: 'missing_required',
      message: {
        fr: 'Valeur de lecture requise',
        en: 'Reading value required'
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  if (!reading.unit) {
    errors.push({
      type: 'missing_required',
      message: {
        fr: 'Unité de mesure requise',
        en: 'Unit of measurement required'
      },
      field: 'unit',
      value: reading.unit,
      critical: true,
      correctionRequired: true
    });
  }

  if (!reading.timestamp) {
    errors.push({
      type: 'missing_required',
      message: {
        fr: 'Horodatage requis',
        en: 'Timestamp required'
      },
      field: 'timestamp',
      value: reading.timestamp,
      critical: true,
      correctionRequired: true
    });
  }

  // Validation format valeur
  if (reading.value !== undefined && (typeof reading.value !== 'number' || isNaN(reading.value))) {
    errors.push({
      type: 'invalid_format',
      message: {
        fr: 'Valeur doit être un nombre valide',
        en: 'Value must be a valid number'
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  // Validation timestamp
  if (reading.timestamp && isNaN(Date.parse(reading.timestamp.toString()))) {
    errors.push({
      type: 'invalid_format',
      message: {
        fr: 'Horodatage invalide',
        en: 'Invalid timestamp'
      },
      field: 'timestamp',
      value: reading.timestamp,
      critical: true,
      correctionRequired: true
    });
  }

  // Timestamp future
  if (reading.timestamp && new Date(reading.timestamp) > new Date()) {
    warnings.push({
      type: 'temporal_inconsistency',
      message: {
        fr: 'Horodatage dans le futur',
        en: 'Timestamp in the future'
      },
      field: 'timestamp',
      value: reading.timestamp,
      severity: 'medium',
      suggestion: {
        fr: 'Vérifier la synchronisation de l\'horloge du capteur',
        en: 'Check sensor clock synchronization'
      }
    });
  }

  return { errors, warnings };
}

/**
 * Validation limites physiques
 */
function validatePhysicalLimits(reading: AtmosphericReading): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (reading.value === undefined || !reading.gasType) return { errors, warnings };

  const limits = PHYSICAL_LIMITS[reading.gasType];
  if (!limits) {
    warnings.push({
      type: 'unusual_reading',
      message: {
        fr: `Type de gaz non reconnu: ${reading.gasType}`,
        en: `Unrecognized gas type: ${reading.gasType}`
      },
      field: 'gasType',
      value: reading.gasType,
      severity: 'medium'
    });
    return { errors, warnings };
  }

  // Valeur négative
  if (reading.value < 0) {
    errors.push({
      type: 'out_of_range',
      message: {
        fr: 'Valeur négative impossible pour concentration gaz',
        en: 'Negative value impossible for gas concentration'
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  // Hors limites physiques
  if (reading.value < limits.min || reading.value > limits.max) {
    errors.push({
      type: 'out_of_range',
      message: {
        fr: `Valeur hors limites physiques (${limits.min}-${limits.max} ${limits.unit})`,
        en: `Value outside physical limits (${limits.min}-${limits.max} ${limits.unit})`
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  return { errors, warnings };
}

/**
 * Validation plausibilité
 */
function validatePlausibility(reading: AtmosphericReading): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (reading.value === undefined || !reading.gasType) return { warnings, suggestions };

  const ranges = TYPICAL_RANGES[reading.gasType];
  if (!ranges) return { warnings, suggestions };

  // Lecture inhabituelle mais pas impossible
  if (reading.value > ranges.concern.max) {
    warnings.push({
      type: 'unusual_reading',
      message: {
        fr: `Lecture très élevée pour ${reading.gasType}: ${reading.value} ${reading.unit}`,
        en: `Very high reading for ${reading.gasType}: ${reading.value} ${reading.unit}`
      },
      field: 'value',
      value: reading.value,
      expectedRange: ranges.safe,
      severity: 'high',
      suggestion: {
        fr: 'Vérifier calibration capteur et conditions environnementales',
        en: 'Check sensor calibration and environmental conditions'
      }
    });

    suggestions.push({
      type: 'calibration',
      message: {
        fr: 'Calibration recommandée suite à lecture inhabituelle',
        en: 'Calibration recommended following unusual reading'
      },
      priority: 'high',
      actionRequired: {
        fr: 'Effectuer calibration capteur et vérification installation',
        en: 'Perform sensor calibration and installation verification'
      },
      impact: 'safety_critical'
    });
  }

  // Précision suspecte
  if (reading.confidence !== undefined && reading.confidence < 0.7) {
    warnings.push({
      type: 'precision_degraded',
      message: {
        fr: `Confiance faible: ${Math.round(reading.confidence * 100)}%`,
        en: `Low confidence: ${Math.round(reading.confidence * 100)}%`
      },
      field: 'confidence',
      value: reading.confidence,
      severity: 'medium',
      suggestion: {
        fr: 'Maintenance préventive recommandée',
        en: 'Preventive maintenance recommended'
      }
    });
  }

  return { warnings, suggestions };
}

/**
 * Validation cohérence temporelle
 */
function validateTemporalConsistency(
  reading: AtmosphericReading, 
  previousReadings: AtmosphericReading[]
): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!previousReadings.length) return { warnings, suggestions };

  // Lectures même type gaz
  const sameGasReadings = previousReadings.filter(r => r.gasType === reading.gasType);
  if (!sameGasReadings.length) return { warnings, suggestions };

  const lastReading = sameGasReadings[sameGasReadings.length - 1];
  
  // Variation brutale
  if (lastReading.value !== undefined && reading.value !== undefined) {
    const variation = Math.abs(reading.value - lastReading.value) / lastReading.value;
    
    if (variation > 0.5) { // >50% variation
      warnings.push({
        type: 'temporal_inconsistency',
        message: {
          fr: `Variation brutale: ${Math.round(variation * 100)}% depuis dernière lecture`,
          en: `Sudden variation: ${Math.round(variation * 100)}% since last reading`
        },
        field: 'value',
        value: reading.value,
        severity: 'high',
        suggestion: {
          fr: 'Vérifier conditions et intégrité capteur',
          en: 'Check conditions and sensor integrity'
        }
      });
    }
  }

  // Détection dérive capteur
  const drift = detectSensorDrift(reading, sameGasReadings);
  if (drift.detected) {
    warnings.push({
      type: 'sensor_drift',
      message: {
        fr: `Dérive capteur détectée: ${drift.rate}%/h`,
        en: `Sensor drift detected: ${drift.rate}%/h`
      },
      field: 'value',
      value: reading.value,
      severity: drift.rate > 5 ? 'high' : 'medium',
      suggestion: {
        fr: 'Calibration recommandée',
        en: 'Calibration recommended'
      }
    });

    suggestions.push({
      type: 'calibration',
      message: {
        fr: 'Calibration urgente requise suite à dérive détectée',
        en: 'Urgent calibration required following detected drift'
      },
      priority: drift.rate > 5 ? 'high' : 'medium',
      actionRequired: {
        fr: 'Stopper mesures et calibrer immédiatement',
        en: 'Stop measurements and calibrate immediately'
      },
      impact: 'measurement_accuracy'
    });
  }

  return { warnings, suggestions };
}

/**
 * Validation conformité réglementaire
 */
function validateRegulatoryCompliance(
  reading: AtmosphericReading,
  standards: Record<GasType, any>
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!reading.gasType || reading.value === undefined) return { errors, warnings };

  const standard = standards[reading.gasType];
  if (!standard) return { errors, warnings };

  // Violation limite réglementaire
  if ('max' in standard && reading.value > standard.max) {
    errors.push({
      type: 'regulation_violation',
      message: {
        fr: `Dépassement limite réglementaire: ${reading.value} > ${standard.max} ${standard.unit}`,
        en: `Regulatory limit exceeded: ${reading.value} > ${standard.max} ${standard.unit}`
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  if ('min' in standard && reading.value < standard.min) {
    errors.push({
      type: 'regulation_violation',
      message: {
        fr: `Sous limite réglementaire: ${reading.value} < ${standard.min} ${standard.unit}`,
        en: `Below regulatory limit: ${reading.value} < ${standard.min} ${standard.unit}`
      },
      field: 'value',
      value: reading.value,
      critical: true,
      correctionRequired: true
    });
  }

  return { errors, warnings };
}

/**
 * Validation données d'ensemble
 */
function validateEnsembleData(readings: AtmosphericReading[]): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
  const warnings: ValidationWarning[] = [];
  const suggestions: ValidationSuggestion[] = [];

  // Validation corrélations gaz
  const correlationValidation = validateGasCorrelations(readings);
  warnings.push(...correlationValidation.warnings);

  // Gaps temporels
  const temporalGaps = detectTemporalGaps(readings);
  if (temporalGaps.length > 0) {
    warnings.push({
      type: 'temporal_inconsistency',
      message: {
        fr: `${temporalGaps.length} gaps temporels détectés`,
        en: `${temporalGaps.length} temporal gaps detected`
      },
      field: 'timestamps',
      value: temporalGaps,
      severity: 'medium',
      suggestion: {
        fr: 'Vérifier continuité acquisition données',
        en: 'Check data acquisition continuity'
      }
    });
  }

  return { warnings, suggestions };
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Détecte dérive capteur
 */
function detectSensorDrift(
  reading: AtmosphericReading, 
  previousReadings: AtmosphericReading[]
): { detected: boolean; rate: number } {
  if (previousReadings.length < 3) return { detected: false, rate: 0 };

  // Calculer tendance linéaire
  const values = previousReadings.map(r => r.value).filter(v => v !== undefined) as number[];
  const timestamps = previousReadings.map(r => new Date(r.timestamp).getTime());
  
  if (values.length < 3) return { detected: false, rate: 0 };

  // Régression linéaire simple
  const n = values.length;
  const sumX = timestamps.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Taux de dérive en %/heure
  const hourlyRate = (slope * 3600000) / (sumY / n) * 100; // ms vers h
  
  return {
    detected: Math.abs(hourlyRate) > SENSOR_DRIFT_THRESHOLDS.hourly,
    rate: Math.round(Math.abs(hourlyRate) * 100) / 100
  };
}

/**
 * Valide corrélations entre gaz
 */
function validateGasCorrelations(readings: AtmosphericReading[]): { warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  // Grouper par type gaz
  const gasGroups = readings.reduce((groups, reading) => {
    if (!groups[reading.gasType]) groups[reading.gasType] = [];
    groups[reading.gasType].push(reading);
    return groups;
  }, {} as Record<GasType, AtmosphericReading[]>);

  // Vérifier corrélations attendues
  const correlations = CORRELATION_COEFFICIENTS.industrial;
  
  for (const correlation of correlations) {
    const [gas1, gas2] = correlation.gases;
    const readings1 = gasGroups[gas1];
    const readings2 = gasGroups[gas2];

    if (readings1 && readings2 && readings1.length > 3 && readings2.length > 3) {
      const actualCorrelation = calculateCorrelation(readings1, readings2);
      
      if (Math.abs(actualCorrelation - correlation.expected) > 0.3) {
        warnings.push({
          type: 'correlation_anomaly',
          message: {
            fr: `Corrélation anormale entre ${gas1} et ${gas2}: ${actualCorrelation.toFixed(2)} (attendu: ${correlation.expected})`,
            en: `Abnormal correlation between ${gas1} and ${gas2}: ${actualCorrelation.toFixed(2)} (expected: ${correlation.expected})`
          },
          field: 'correlations',
          value: actualCorrelation,
          severity: 'medium'
        });
      }
    }
  }

  return { warnings };
}

/**
 * Calcule corrélation entre deux séries lectures
 */
function calculateCorrelation(readings1: AtmosphericReading[], readings2: AtmosphericReading[]): number {
  // Simplification: assume même timestamps
  const values1 = readings1.map(r => r.value).filter(v => v !== undefined) as number[];
  const values2 = readings2.map(r => r.value).filter(v => v !== undefined) as number[];
  
  if (values1.length !== values2.length || values1.length < 2) return 0;

  const mean1 = values1.reduce((a, b) => a + b) / values1.length;
  const mean2 = values2.reduce((a, b) => a + b) / values2.length;

  const numerator = values1.reduce((sum, val1, i) => {
    return sum + (val1 - mean1) * (values2[i] - mean2);
  }, 0);

  const denominator = Math.sqrt(
    values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
    values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Détecte gaps temporels
 */
function detectTemporalGaps(readings: AtmosphericReading[]): Array<{ start: number; end: number; duration: number }> {
  const gaps: Array<{ start: number; end: number; duration: number }> = [];
  
  const sortedReadings = readings
    .filter(r => r.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (let i = 1; i < sortedReadings.length; i++) {
    const prevTime = new Date(sortedReadings[i - 1].timestamp).getTime();
    const currentTime = new Date(sortedReadings[i].timestamp).getTime();
    const gap = currentTime - prevTime;

    // Gap > 10 minutes
    if (gap > 10 * 60 * 1000) {
      gaps.push({
        start: prevTime,
        end: currentTime,
        duration: gap
      });
    }
  }

  return gaps;
}

/**
 * Calcule métriques qualité données
 */
function calculateDataQuality(
  reading: AtmosphericReading,
  previousReadings?: AtmosphericReading[],
  errors: ValidationError[] = [],
  warnings: ValidationWarning[] = []
): DataQualityMetrics {
  // Précision basée sur erreurs/avertissements
  const accuracy = Math.max(0, 1 - (errors.length * 0.3 + warnings.length * 0.1));

  // Complétude basée sur champs présents
  const requiredFields = ['gasType', 'value', 'unit', 'timestamp'];
  const optionalFields = ['location', 'equipment', 'confidence', 'temperature', 'humidity'];
  const presentRequired = requiredFields.filter(field => reading[field as keyof AtmosphericReading] !== undefined).length;
  const presentOptional = optionalFields.filter(field => reading[field as keyof AtmosphericReading] !== undefined).length;
  
  const completeness = (presentRequired / requiredFields.length) * 0.8 + (presentOptional / optionalFields.length) * 0.2;

  // Cohérence basée sur cohérence temporelle
  const consistency = warnings.filter(w => w.type === 'temporal_inconsistency').length === 0 ? 1 : 0.7;

  // Actualité basée sur âge données
  const age = Date.now() - new Date(reading.timestamp).getTime();
  const timeliness = Math.max(0, 1 - (age / (24 * 60 * 60 * 1000))); // Décroît sur 24h

  // Fiabilité basée sur confiance capteur
  const reliability = reading.confidence || 0.8;

  // Qualité globale
  const overall = (accuracy * 0.3 + completeness * 0.2 + consistency * 0.2 + timeliness * 0.15 + reliability * 0.15);

  return {
    accuracy,
    completeness,
    consistency,
    timeliness,
    reliability,
    overall
  };
}

/**
 * Calcule métriques qualité ensemble données
 */
function calculateEnsembleDataQuality(
  readings: AtmosphericReading[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): DataQualityMetrics {
  if (readings.length === 0) {
    return {
      accuracy: 0,
      completeness: 0,
      consistency: 0,
      timeliness: 0,
      reliability: 0,
      overall: 0
    };
  }

  // Moyennes des métriques individuelles
  const individualMetrics = readings.map(reading => 
    calculateDataQuality(reading, [], 
      errors.filter(e => e.field in reading),
      warnings.filter(w => w.field in reading)
    )
  );

  const accuracy = individualMetrics.reduce((sum, m) => sum + m.accuracy, 0) / individualMetrics.length;
  const completeness = individualMetrics.reduce((sum, m) => sum + m.completeness, 0) / individualMetrics.length;
  const consistency = individualMetrics.reduce((sum, m) => sum + m.consistency, 0) / individualMetrics.length;
  const timeliness = individualMetrics.reduce((sum, m) => sum + m.timeliness, 0) / individualMetrics.length;
  const reliability = individualMetrics.reduce((sum, m) => sum + m.reliability, 0) / individualMetrics.length;

  const overall = (accuracy * 0.3 + completeness * 0.2 + consistency * 0.2 + timeliness * 0.15 + reliability * 0.15);

  return {
    accuracy,
    completeness,
    consistency,
    timeliness,
    reliability,
    overall
  };
}

/**
 * Calcule confiance globale
 */
function calculateConfidence(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  dataQuality: DataQualityMetrics
): number {
  // Impact erreurs critiques
  const criticalErrors = errors.filter(e => e.critical).length;
  if (criticalErrors > 0) return 0;

  // Impact erreurs et avertissements
  const errorPenalty = errors.length * 0.15;
  const warningPenalty = warnings.length * 0.05;

  // Confiance basée sur qualité + pénalités
  const baseConfidence = dataQuality.overall;
  const confidence = Math.max(0, baseConfidence - errorPenalty - warningPenalty);

  return Math.round(confidence * 100) / 100;
}

// =================== FONCTIONS UTILITAIRES EXPORT ===================

/**
 * Formate résultat validation pour affichage
 */
export function formatValidationResult(result: ValidationResult, language: 'fr' | 'en' = 'fr'): string {
  const lines: string[] = [];
  
  lines.push(`${language === 'fr' ? 'Résultat validation' : 'Validation Result'}: ${result.isValid ? '✅ Valide' : '❌ Invalide'}`);
  lines.push(`${language === 'fr' ? 'Confiance' : 'Confidence'}: ${Math.round(result.confidence * 100)}%`);
  lines.push(`${language === 'fr' ? 'Qualité données' : 'Data Quality'}: ${Math.round(result.dataQuality.overall * 100)}%`);

  if (result.errors.length > 0) {
    lines.push(`\n${language === 'fr' ? 'Erreurs' : 'Errors'} (${result.errors.length}):`);
    result.errors.forEach(error => {
      lines.push(`  ❌ ${error.message[language]}`);
    });
  }

  if (result.warnings.length > 0) {
    lines.push(`\n${language === 'fr' ? 'Avertissements' : 'Warnings'} (${result.warnings.length}):`);
    result.warnings.forEach(warning => {
      lines.push(`  ⚠️ ${warning.message[language]}`);
    });
  }

  if (result.suggestions.length > 0) {
    lines.push(`\n${language === 'fr' ? 'Suggestions' : 'Suggestions'} (${result.suggestions.length}):`);
    result.suggestions.forEach(suggestion => {
      lines.push(`  💡 ${suggestion.message[language]}`);
    });
  }

  return lines.join('\n');
}

/**
 * Génère rapport qualité détaillé
 */
export function generateQualityReport(result: ValidationResult, language: 'fr' | 'en' = 'fr'): object {
  return {
    summary: {
      valid: result.isValid,
      confidence: result.confidence,
      overall_quality: result.dataQuality.overall,
      error_count: result.errors.length,
      warning_count: result.warnings.length,
      suggestion_count: result.suggestions.length
    },
    quality_metrics: {
      accuracy: result.dataQuality.accuracy,
      completeness: result.dataQuality.completeness,
      consistency: result.dataQuality.consistency,
      timeliness: result.dataQuality.timeliness,
      reliability: result.dataQuality.reliability
    },
    issues: {
      critical_errors: result.errors.filter(e => e.critical),
      high_severity_warnings: result.warnings.filter(w => w.severity === 'high'),
      high_priority_suggestions: result.suggestions.filter(s => s.priority === 'high')
    },
    recommendations: result.suggestions.map(s => ({
      type: s.type,
      priority: s.priority,
      action: s.actionRequired[language],
      impact: s.impact
    }))
  };
}

export default {
  validateAtmosphericReading,
  validateAtmosphericReadings,
  formatValidationResult,
  generateQualityReport
};
