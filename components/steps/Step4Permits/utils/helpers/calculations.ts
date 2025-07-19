// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/HELPERS/CALCULATIONS.TS ===================
// Calculs spécialisés pour données atmosphériques, sécurité et conformité réglementaire
"use client";

import type { 
  AtmosphericReading,
  GasType,
  AlarmLevel,
  NumericValue,
  GeoCoordinates,
  ProvinceCode
} from '../../types';

// =================== INTERFACES CALCULS ===================

export interface AtmosphericCalculationResult {
  value: number;
  unit: string;
  confidence: number;
  method: CalculationMethod;
  inputs: Record<string, number>;
  corrections: AtmosphericCorrection[];
  metadata: {
    calculatedAt: number;
    algorithm: string;
    version: string;
    uncertainty: number;
  };
}

export interface AtmosphericCorrection {
  type: CorrectionType;
  factor: number;
  reason: string;
  magnitude: number;
  applied: boolean;
}

export type CorrectionType = 
  | 'temperature'          // Correction température
  | 'pressure'             // Correction pression
  | 'humidity'             // Correction humidité
  | 'cross_sensitivity'    // Sensibilité croisée gaz
  | 'altitude'             // Correction altitude
  | 'calibration_drift'    // Dérive calibration
  | 'aging'                // Vieillissement capteur
  | 'interference';        // Interférences électromagnétiques

export type CalculationMethod = 
  | 'direct_measurement'   // Mesure directe
  | 'interpolation'        // Interpolation
  | 'extrapolation'        // Extrapolation
  | 'statistical'          // Analyse statistique
  | 'theoretical'          // Calcul théorique
  | 'empirical'            // Formule empirique
  | 'regression'           // Régression
  | 'neural_network';      // Réseau neuronal

export interface GasProperties {
  molecularWeight: number;      // g/mol
  density: number;              // kg/m³ à CNTP
  boilingPoint: number;         // °C
  meltingPoint: number;         // °C
  vaporPressure: number;        // kPa à 20°C
  solubility: number;           // mg/L dans l'eau
  flamabilityLimits: {          // Limites inflammabilité
    lel: number;                // Lower Explosive Limit %
    uel: number;                // Upper Explosive Limit %
  };
  autoIgnitionTemp: number;     // °C
  flashPoint?: number;          // °C
  odorThreshold?: number;       // ppm
  toxicityData: {
    twa: number;                // Time Weighted Average - 8h
    stel: number;               // Short Term Exposure Limit - 15min
    ceiling?: number;           // Plafond - instantané
    idlh?: number;              // Immediately Dangerous to Life and Health
    lc50?: number;              // Léthal Concentration 50% - ppm
  };
}

export interface EnvironmentalConditions {
  temperature: number;          // °C
  pressure: number;             // kPa
  humidity: number;             // %RH
  windSpeed?: number;           // m/s
  windDirection?: number;       // degrés
  altitude?: number;            // m
  barometricPressure?: number;  // kPa
}

export interface VentilationCalculation {
  airChangeRate: number;        // ACH (Air Changes per Hour)
  flowRate: number;             // m³/min
  residenceTime: number;        // minutes
  efficiency: number;           // %
  powerRequired: number;        // kW
  energyCost: number;           // $/heure
  noiseLevel: number;           // dB
  recommendation: VentilationRecommendation;
}

export interface VentilationRecommendation {
  required: boolean;
  type: 'natural' | 'mechanical' | 'forced' | 'emergency';
  minFlowRate: number;          // m³/min
  direction: 'intake' | 'exhaust' | 'bidirectional';
  duration: number;             // minutes avant entrée
  monitoring: boolean;
  emergencyShutoff: boolean;
}

export interface RiskAssessmentCalculation {
  overallRisk: RiskLevel;
  riskScore: number;            // 0-100
  factors: RiskFactor[];
  recommendations: RiskRecommendation[];
  timeline: {
    immediate: string[];        // Actions immédiates
    shortTerm: string[];        // 0-24h
    mediumTerm: string[];       // 1-7 jours
    longTerm: string[];         // >7 jours
  };
}

export type RiskLevel = 
  | 'negligible'    // 0-10
  | 'low'           // 11-30
  | 'moderate'      // 31-50
  | 'high'          // 51-75
  | 'very_high'     // 76-90
  | 'extreme';      // 91-100

export interface RiskFactor {
  category: 'atmospheric' | 'structural' | 'operational' | 'environmental' | 'human';
  factor: string;
  weight: number;               // 0-1
  score: number;                // 0-100
  impact: number;               // Score pondéré
  mitigation: string[];
}

export interface RiskRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  justification: string;
  timeframe: string;
  cost: 'low' | 'medium' | 'high';
  effectiveness: number;        // % réduction risque
}

export interface ExposureCalculation {
  twa8h: number;                // Exposition moyenne pondérée 8h
  stel15min: number;            // Exposition court terme 15min
  peakExposure: number;         // Exposition pic
  cumulativeExposure: number;   // Exposition cumulative
  complianceStatus: {
    twaCompliant: boolean;
    stelCompliant: boolean;
    ceilingCompliant: boolean;
    recommendation: string;
  };
  healthRisk: {
    level: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
    effects: string[];
    timeToEffect: number;       // minutes
    reversibility: 'reversible' | 'partially_reversible' | 'irreversible';
  };
}

// =================== CONSTANTES PHYSIQUES ===================

export const PHYSICAL_CONSTANTS = {
  // Conditions standard
  STANDARD_TEMP: 273.15,        // K (0°C)
  STANDARD_PRESSURE: 101.325,   // kPa
  STANDARD_DENSITY_AIR: 1.225,  // kg/m³
  
  // Constantes gaz
  UNIVERSAL_GAS_CONSTANT: 8.314, // J/(mol·K)
  AVOGADRO_NUMBER: 6.022e23,     // mol⁻¹
  
  // Conversion facteurs
  PPM_TO_PERCENT: 10000,
  PPB_TO_PPM: 1000,
  TORR_TO_KPA: 0.133322,
  
  // Air composition (%)
  AIR_COMPOSITION: {
    nitrogen: 78.084,
    oxygen: 20.946,
    argon: 0.934,
    carbon_dioxide: 0.036
  }
} as const;

// =================== PROPRIÉTÉS GAZ ===================

export const GAS_PROPERTIES: Record<GasType, GasProperties> = {
  oxygen: {
    molecularWeight: 31.998,
    density: 1.429,
    boilingPoint: -183,
    meltingPoint: -219,
    vaporPressure: 0,
    solubility: 40,
    flamabilityLimits: { lel: 0, uel: 0 }, // Non inflammable
    autoIgnitionTemp: 0,
    toxicityData: {
      twa: 0, // Pas de limite TWA
      stel: 0, // Pas de limite STEL
      // Dangereux si <16% ou >23%
    }
  },
  carbon_monoxide: {
    molecularWeight: 28.010,
    density: 1.250,
    boilingPoint: -192,
    meltingPoint: -205,
    vaporPressure: 0,
    solubility: 27.6,
    flamabilityLimits: { lel: 12.5, uel: 74.0 },
    autoIgnitionTemp: 609,
    odorThreshold: 0, // Inodore
    toxicityData: {
      twa: 25,        // ACGIH TWA
      stel: 200,      // ACGIH STEL
      ceiling: 1000,  // OSHA Ceiling
      idlh: 1200,     // NIOSH IDLH
      lc50: 5207      // Rat, 4h
    }
  },
  hydrogen_sulfide: {
    molecularWeight: 34.080,
    density: 1.539,
    boilingPoint: -60,
    meltingPoint: -86,
    vaporPressure: 1896,
    solubility: 3980,
    flamabilityLimits: { lel: 4.3, uel: 45.5 },
    autoIgnitionTemp: 260,
    odorThreshold: 0.00047, // Très odorant
    toxicityData: {
      twa: 1,         // ACGIH TWA (très toxique)
      stel: 5,        // ACGIH STEL
      ceiling: 20,    // OSHA Ceiling
      idlh: 100,      // NIOSH IDLH
      lc50: 444       // Rat, 4h
    }
  },
  methane: {
    molecularWeight: 16.043,
    density: 0.717,
    boilingPoint: -162,
    meltingPoint: -183,
    vaporPressure: 0,
    solubility: 22.7,
    flamabilityLimits: { lel: 5.0, uel: 15.0 },
    autoIgnitionTemp: 537,
    toxicityData: {
      twa: 1000,      // Simple asphyxiant
      stel: 1000,
    }
  },
  propane: {
    molecularWeight: 44.097,
    density: 2.020,
    boilingPoint: -42,
    meltingPoint: -188,
    vaporPressure: 853,
    solubility: 47,
    flamabilityLimits: { lel: 2.1, uel: 9.5 },
    autoIgnitionTemp: 470,
    toxicityData: {
      twa: 1000,      // Simple asphyxiant
      stel: 1000,
    }
  },
  // Ajouter autres gaz selon besoins...
} as any;

// =================== CLASSE PRINCIPALE CALCULATIONS ===================

export class AtmosphericCalculations {
  
  // =================== CONVERSIONS UNITÉS ===================

  /**
   * Convertir ppm vers mg/m³
   */
  static ppmToMgPerM3(
    ppm: number, 
    gasType: GasType, 
    conditions: EnvironmentalConditions
  ): AtmosphericCalculationResult {
    const gasProps = GAS_PROPERTIES[gasType];
    if (!gasProps) {
      throw new Error(`Gas properties not found for ${gasType}`);
    }

    // Formule: mg/m³ = ppm × (MW × P) / (R × T)
    // Où MW = masse molaire, P = pression, R = constante gaz, T = température
    
    const temperatureK = conditions.temperature + 273.15;
    const pressureKPa = conditions.pressure;
    const molecularWeight = gasProps.molecularWeight;
    
    const mgPerM3 = (ppm * molecularWeight * pressureKPa) / 
                    (PHYSICAL_CONSTANTS.UNIVERSAL_GAS_CONSTANT * temperatureK);

    // Corrections atmosphériques
    const corrections = this.calculateAtmosphericCorrections(
      mgPerM3, 
      gasType, 
      conditions
    );

    let correctedValue = mgPerM3;
    corrections.forEach(correction => {
      if (correction.applied) {
        correctedValue *= correction.factor;
      }
    });

    return {
      value: correctedValue,
      unit: 'mg/m³',
      confidence: 0.95,
      method: 'theoretical',
      inputs: { ppm, temperature: conditions.temperature, pressure: conditions.pressure },
      corrections,
      metadata: {
        calculatedAt: Date.now(),
        algorithm: 'ideal_gas_law',
        version: '1.0.0',
        uncertainty: 0.05
      }
    };
  }

  /**
   * Convertir mg/m³ vers ppm
   */
  static mgPerM3ToPpm(
    mgPerM3: number, 
    gasType: GasType, 
    conditions: EnvironmentalConditions
  ): AtmosphericCalculationResult {
    const gasProps = GAS_PROPERTIES[gasType];
    if (!gasProps) {
      throw new Error(`Gas properties not found for ${gasType}`);
    }

    const temperatureK = conditions.temperature + 273.15;
    const pressureKPa = conditions.pressure;
    const molecularWeight = gasProps.molecularWeight;
    
    const ppm = (mgPerM3 * PHYSICAL_CONSTANTS.UNIVERSAL_GAS_CONSTANT * temperatureK) / 
                (molecularWeight * pressureKPa);

    const corrections = this.calculateAtmosphericCorrections(
      ppm, 
      gasType, 
      conditions
    );

    let correctedValue = ppm;
    corrections.forEach(correction => {
      if (correction.applied) {
        correctedValue *= correction.factor;
      }
    });

    return {
      value: correctedValue,
      unit: 'ppm',
      confidence: 0.95,
      method: 'theoretical',
      inputs: { mgPerM3, temperature: conditions.temperature, pressure: conditions.pressure },
      corrections,
      metadata: {
        calculatedAt: Date.now(),
        algorithm: 'ideal_gas_law_inverse',
        version: '1.0.0',
        uncertainty: 0.05
      }
    };
  }

  /**
   * Calculer % LEL (Lower Explosive Limit)
   */
  static calculateLELPercentage(
    concentration: number, 
    unit: string, 
    gasType: GasType,
    conditions: EnvironmentalConditions
  ): AtmosphericCalculationResult {
    const gasProps = GAS_PROPERTIES[gasType];
    if (!gasProps || !gasProps.flamabilityLimits.lel) {
      throw new Error(`Flammability data not available for ${gasType}`);
    }

    let concentrationPpm = concentration;
    
    // Convertir vers ppm si nécessaire
    if (unit === 'mg/m³') {
      const conversion = this.mgPerM3ToPpm(concentration, gasType, conditions);
      concentrationPpm = conversion.value;
    } else if (unit === '%') {
      concentrationPpm = concentration * PHYSICAL_CONSTANTS.PPM_TO_PERCENT;
    }

    // LEL en ppm (LEL% × 10000)
    const lelPpm = gasProps.flamabilityLimits.lel * PHYSICAL_CONSTANTS.PPM_TO_PERCENT;
    
    // % LEL = (concentration / LEL) × 100
    const lelPercentage = (concentrationPpm / lelPpm) * 100;

    // Corrections pour température et pression
    const tempCorrectionFactor = this.calculateTemperatureLELCorrection(
      conditions.temperature, 
      gasType
    );
    
    const correctedLEL = lelPercentage * tempCorrectionFactor;

    return {
      value: correctedLEL,
      unit: '%LEL',
      confidence: 0.90,
      method: 'empirical',
      inputs: { concentration, unit, temperature: conditions.temperature },
      corrections: [{
        type: 'temperature',
        factor: tempCorrectionFactor,
        reason: 'Temperature effect on LEL',
        magnitude: Math.abs(tempCorrectionFactor - 1) * 100,
        applied: true
      }],
      metadata: {
        calculatedAt: Date.now(),
        algorithm: 'lel_calculation',
        version: '1.0.0',
        uncertainty: 0.10
      }
    };
  }

  // =================== CALCULS VENTILATION ===================

  /**
   * Calculer exigences de ventilation
   */
  static calculateVentilationRequirements(
    spaceVolume: number, // m³
    gasType: GasType,
    currentConcentration: number, // ppm
    targetConcentration: number, // ppm
    conditions: EnvironmentalConditions,
    entryTime: number = 30 // minutes avant entrée
  ): VentilationCalculation {
    const gasProps = GAS_PROPERTIES[gasType];
    
    // Calcul taux de changement d'air requis
    // Formule: ACH = ln(C1/C2) × (60/t)
    // Où C1 = concentration initiale, C2 = concentration cible, t = temps (min)
    
    const concentrationRatio = currentConcentration / targetConcentration;
    const requiredACH = Math.log(concentrationRatio) * (60 / entryTime);
    
    // Débit d'air requis (m³/min)
    const flowRate = (requiredACH * spaceVolume) / 60;
    
    // Temps de résidence moyen
    const residenceTime = spaceVolume / flowRate;
    
    // Efficacité ventilation (facteur k)
    const efficiency = this.calculateVentilationEfficiency(
      spaceVolume, 
      flowRate, 
      gasProps.density
    );
    
    // Puissance requise (estimation)
    const powerRequired = this.estimateVentilationPower(flowRate, spaceVolume);
    
    // Coût énergétique ($/h à 0.10$/kWh)
    const energyCost = powerRequired * 0.10;
    
    // Niveau sonore estimé
    const noiseLevel = this.estimateNoiseLevel(flowRate);
    
    // Recommandations
    const recommendation = this.generateVentilationRecommendation(
      requiredACH,
      currentConcentration,
      gasType,
      spaceVolume
    );

    return {
      airChangeRate: requiredACH,
      flowRate,
      residenceTime,
      efficiency,
      powerRequired,
      energyCost,
      noiseLevel,
      recommendation
    };
  }

  // =================== ÉVALUATION RISQUES ===================

  /**
   * Évaluer risques atmosphériques
   */
  static assessAtmosphericRisk(
    readings: AtmosphericReading[],
    spaceCharacteristics: {
      volume: number;
      depth: number;
      ventilation: 'none' | 'natural' | 'mechanical';
      access: 'top' | 'side' | 'bottom';
      drainage: boolean;
    },
    workActivities: string[],
    personnelCount: number
  ): RiskAssessmentCalculation {
    const factors: RiskFactor[] = [];
    let totalRiskScore = 0;

    // Facteurs atmosphériques
    readings.forEach(reading => {
      const atmosphericFactor = this.evaluateAtmosphericFactor(reading);
      factors.push(atmosphericFactor);
    });

    // Facteurs structurels
    const structuralFactor = this.evaluateStructuralFactor(spaceCharacteristics);
    factors.push(structuralFactor);

    // Facteurs opérationnels
    const operationalFactor = this.evaluateOperationalFactor(
      workActivities, 
      personnelCount
    );
    factors.push(operationalFactor);

    // Calcul score global
    factors.forEach(factor => {
      totalRiskScore += factor.impact;
    });

    const overallRisk = this.categorizeRiskLevel(totalRiskScore);
    const recommendations = this.generateRiskRecommendations(factors, overallRisk);
    const timeline = this.generateActionTimeline(recommendations);

    return {
      overallRisk,
      riskScore: totalRiskScore,
      factors,
      recommendations,
      timeline
    };
  }

  // =================== CALCULS EXPOSITION ===================

  /**
   * Calculer exposition personnel
   */
  static calculatePersonnelExposure(
    readings: AtmosphericReading[],
    exposureDuration: number, // minutes
    gasType: GasType,
    activityLevel: 'light' | 'moderate' | 'heavy' = 'moderate'
  ): ExposureCalculation {
    const gasProps = GAS_PROPERTIES[gasType];
    
    // Facteur respiration selon activité
    const breathingRates = {
      light: 20,      // L/min
      moderate: 30,   // L/min
      heavy: 50       // L/min
    };
    
    const breathingRate = breathingRates[activityLevel];
    
    // Calculer exposition moyenne pondérée
    const sortedReadings = readings.sort((a, b) => a.timestamp - b.timestamp);
    let cumulativeExposure = 0;
    let timeWeightedSum = 0;
    let totalTime = 0;

    for (let i = 0; i < sortedReadings.length - 1; i++) {
      const current = sortedReadings[i];
      const next = sortedReadings[i + 1];
      const timeDiff = (next.timestamp - current.timestamp) / (1000 * 60); // minutes
      
      timeWeightedSum += current.value * timeDiff;
      totalTime += timeDiff;
      
      // Exposition cumulative (µg inhalés)
      const inhaledVolume = breathingRate * timeDiff / 1000; // m³
      cumulativeExposure += current.value * inhaledVolume; // mg
    }

    const twa8h = totalTime > 0 ? timeWeightedSum / totalTime : 0;
    
    // Exposition court terme (STEL) - maximum 15 min
    const stel15min = this.calculateSTEL(readings, 15);
    
    // Exposition pic
    const peakExposure = Math.max(...readings.map(r => r.value));

    // Vérification conformité
    const complianceStatus = {
      twaCompliant: twa8h <= gasProps.toxicityData.twa,
      stelCompliant: stel15min <= gasProps.toxicityData.stel,
      ceilingCompliant: gasProps.toxicityData.ceiling ? 
        peakExposure <= gasProps.toxicityData.ceiling : true,
      recommendation: this.generateExposureRecommendation(
        twa8h, 
        stel15min, 
        peakExposure, 
        gasProps
      )
    };

    // Évaluation risque santé
    const healthRisk = this.assessHealthRisk(
      twa8h, 
      stel15min, 
      peakExposure, 
      exposureDuration, 
      gasProps
    );

    return {
      twa8h,
      stel15min,
      peakExposure,
      cumulativeExposure,
      complianceStatus,
      healthRisk
    };
  }

  // =================== MÉTHODES PRIVÉES UTILITAIRES ===================

  private static calculateAtmosphericCorrections(
    value: number,
    gasType: GasType,
    conditions: EnvironmentalConditions
  ): AtmosphericCorrection[] {
    const corrections: AtmosphericCorrection[] = [];

    // Correction température (référence 20°C)
    if (Math.abs(conditions.temperature - 20) > 1) {
      const tempFactor = (273.15 + 20) / (273.15 + conditions.temperature);
      corrections.push({
        type: 'temperature',
        factor: tempFactor,
        reason: `Temperature correction from ${conditions.temperature}°C to 20°C`,
        magnitude: Math.abs(tempFactor - 1) * 100,
        applied: true
      });
    }

    // Correction pression (référence 101.325 kPa)
    if (Math.abs(conditions.pressure - 101.325) > 1) {
      const pressureFactor = conditions.pressure / 101.325;
      corrections.push({
        type: 'pressure',
        factor: pressureFactor,
        reason: `Pressure correction from ${conditions.pressure} kPa to 101.325 kPa`,
        magnitude: Math.abs(pressureFactor - 1) * 100,
        applied: true
      });
    }

    // Correction humidité pour certains gaz
    if (['hydrogen_sulfide', 'carbon_monoxide'].includes(gasType)) {
      const humidityFactor = 1 + (conditions.humidity - 50) * 0.001;
      corrections.push({
        type: 'humidity',
        factor: humidityFactor,
        reason: `Humidity correction for ${gasType}`,
        magnitude: Math.abs(humidityFactor - 1) * 100,
        applied: Math.abs(conditions.humidity - 50) > 10
      });
    }

    return corrections;
  }

  private static calculateTemperatureLELCorrection(
    temperature: number,
    gasType: GasType
  ): number {
    // Correction température pour LEL (approximation)
    // LEL diminue avec l'augmentation de température
    const referenceTempC = 20;
    const tempDiff = temperature - referenceTempC;
    
    // Facteur correction approximatif: -0.5%/°C pour la plupart des gaz
    const correctionPercent = -0.5 * tempDiff / 100;
    return 1 + correctionPercent;
  }

  private static calculateVentilationEfficiency(
    volume: number,
    flowRate: number,
    gasDensity: number
  ): number {
    // Facteur k basé sur géométrie et densité gaz
    let k = 3; // Défaut pour mélange parfait
    
    // Ajustement pour densité gaz vs air
    const airDensity = PHYSICAL_CONSTANTS.STANDARD_DENSITY_AIR;
    if (gasDensity > airDensity * 1.2) {
      k = 5; // Gaz lourd, ventilation moins efficace
    } else if (gasDensity < airDensity * 0.8) {
      k = 2; // Gaz léger, ventilation plus efficace
    }
    
    return (100 / k); // Efficacité en %
  }

  private static estimateVentilationPower(flowRate: number, volume: number): number {
    // Estimation basique: ~0.1 kW par 100 m³/min
    return (flowRate / 100) * 0.1;
  }

  private static estimateNoiseLevel(flowRate: number): number {
    // Estimation basique: niveau sonore vs débit
    return 50 + Math.log10(flowRate) * 20; // dB
  }

  private static generateVentilationRecommendation(
    ach: number,
    concentration: number,
    gasType: GasType,
    volume: number
  ): VentilationRecommendation {
    const gasProps = GAS_PROPERTIES[gasType];
    const isDense = gasProps.density > PHYSICAL_CONSTANTS.STANDARD_DENSITY_AIR;
    
    return {
      required: concentration > gasProps.toxicityData.twa,
      type: ach > 6 ? 'forced' : ach > 3 ? 'mechanical' : 'natural',
      minFlowRate: Math.max(ach * volume / 60, 10),
      direction: isDense ? 'exhaust' : 'bidirectional',
      duration: Math.max(30, ach * 2),
      monitoring: concentration > gasProps.toxicityData.twa * 0.5,
      emergencyShutoff: concentration > gasProps.toxicityData.stel
    };
  }

  private static evaluateAtmosphericFactor(reading: AtmosphericReading): RiskFactor {
    const gasProps = GAS_PROPERTIES[reading.gasType];
    let score = 0;
    
    // Score basé sur dépassement limites
    if (reading.value > gasProps.toxicityData.twa * 2) score += 40;
    else if (reading.value > gasProps.toxicityData.twa) score += 20;
    
    if (reading.alarmLevel === 'critical') score += 30;
    else if (reading.alarmLevel === 'danger') score += 20;
    else if (reading.alarmLevel === 'warning') score += 10;

    return {
      category: 'atmospheric',
      factor: `${reading.gasType} concentration`,
      weight: 0.4,
      score,
      impact: score * 0.4,
      mitigation: ['Ventilation', 'Personal protective equipment', 'Continuous monitoring']
    };
  }

  private static evaluateStructuralFactor(characteristics: any): RiskFactor {
    let score = 0;
    
    if (!characteristics.ventilation || characteristics.ventilation === 'none') score += 30;
    if (characteristics.depth > 3) score += 20;
    if (!characteristics.drainage) score += 15;
    if (characteristics.access === 'bottom') score += 10;

    return {
      category: 'structural',
      factor: 'Space configuration',
      weight: 0.3,
      score,
      impact: score * 0.3,
      mitigation: ['Improve ventilation', 'Multiple access points', 'Drainage system']
    };
  }

  private static evaluateOperationalFactor(activities: string[], personnelCount: number): RiskFactor {
    let score = 0;
    
    if (activities.includes('welding') || activities.includes('cutting')) score += 25;
    if (activities.includes('painting') || activities.includes('coating')) score += 15;
    if (personnelCount > 2) score += 10;

    return {
      category: 'operational',
      factor: 'Work activities',
      weight: 0.3,
      score,
      impact: score * 0.3,
      mitigation: ['Hot work permits', 'Continuous monitoring', 'Emergency procedures']
    };
  }

  private static categorizeRiskLevel(score: number): RiskLevel {
    if (score <= 10) return 'negligible';
    if (score <= 30) return 'low';
    if (score <= 50) return 'moderate';
    if (score <= 75) return 'high';
    if (score <= 90) return 'very_high';
    return 'extreme';
  }

  private static generateRiskRecommendations(
    factors: RiskFactor[], 
    riskLevel: RiskLevel
  ): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];
    
    // Recommandations basées sur facteurs critiques
    factors.forEach(factor => {
      if (factor.impact > 15) {
        factor.mitigation.forEach(mitigation => {
          recommendations.push({
            priority: factor.impact > 25 ? 'critical' : 'high',
            action: mitigation,
            justification: `High risk factor: ${factor.factor}`,
            timeframe: factor.impact > 25 ? 'Immediate' : '24 hours',
            cost: 'medium',
            effectiveness: 70
          });
        });
      }
    });

    return recommendations;
  }

  private static generateActionTimeline(recommendations: RiskRecommendation[]): any {
    return {
      immediate: recommendations.filter(r => r.priority === 'critical').map(r => r.action),
      shortTerm: recommendations.filter(r => r.priority === 'high').map(r => r.action),
      mediumTerm: recommendations.filter(r => r.priority === 'medium').map(r => r.action),
      longTerm: recommendations.filter(r => r.priority === 'low').map(r => r.action)
    };
  }

  private static calculateSTEL(readings: AtmosphericReading[], duration: number): number {
    // Calculer maximum mobile sur période donnée
    let maxSTEL = 0;
    
    for (let i = 0; i < readings.length; i++) {
      const windowStart = readings[i].timestamp;
      const windowEnd = windowStart + (duration * 60 * 1000);
      
      const windowReadings = readings.filter(r => 
        r.timestamp >= windowStart && r.timestamp <= windowEnd
      );
      
      if (windowReadings.length > 0) {
        const average = windowReadings.reduce((sum, r) => sum + r.value, 0) / 
                      windowReadings.length;
        maxSTEL = Math.max(maxSTEL, average);
      }
    }
    
    return maxSTEL;
  }

  private static generateExposureRecommendation(
    twa: number,
    stel: number,
    peak: number,
    gasProps: GasProperties
  ): string {
    if (peak > (gasProps.toxicityData.idlh || Infinity)) {
      return 'IMMEDIATE EVACUATION REQUIRED - IDLH exceeded';
    }
    if (stel > gasProps.toxicityData.stel) {
      return 'REDUCE EXPOSURE IMMEDIATELY - STEL exceeded';
    }
    if (twa > gasProps.toxicityData.twa) {
      return 'Implement exposure controls - TWA exceeded';
    }
    return 'Exposure within acceptable limits';
  }

  private static assessHealthRisk(
    twa: number,
    stel: number,
    peak: number,
    duration: number,
    gasProps: GasProperties
  ): any {
    let level: 'minimal' | 'low' | 'moderate' | 'high' | 'severe' = 'minimal';
    const effects: string[] = [];
    let timeToEffect = Infinity;
    let reversibility: 'reversible' | 'partially_reversible' | 'irreversible' = 'reversible';

    // Évaluation basée sur dépassements limites
    if (peak > (gasProps.toxicityData.idlh || Infinity)) {
      level = 'severe';
      effects.push('Life-threatening', 'Immediate incapacitation');
      timeToEffect = 1; // minutes
      reversibility = 'irreversible';
    } else if (stel > gasProps.toxicityData.stel * 2) {
      level = 'high';
      effects.push('Acute symptoms', 'Respiratory distress');
      timeToEffect = 15;
      reversibility = 'partially_reversible';
    } else if (twa > gasProps.toxicityData.twa * 2) {
      level = 'moderate';
      effects.push('Chronic exposure effects');
      timeToEffect = 60;
    }

    return { level, effects, timeToEffect, reversibility };
  }
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Convertir rapidement ppm vers mg/m³
 */
export function quickPpmToMgPerM3(
  ppm: number,
  gasType: GasType,
  temperature: number = 20,
  pressure: number = 101.325
): number {
  const result = AtmosphericCalculations.ppmToMgPerM3(
    ppm,
    gasType,
    { temperature, pressure, humidity: 50 }
  );
  return result.value;
}

/**
 * Calculer % LEL rapidement
 */
export function quickCalculateLEL(
  concentration: number,
  unit: string,
  gasType: GasType
): number {
  const result = AtmosphericCalculations.calculateLELPercentage(
    concentration,
    unit,
    gasType,
    { temperature: 20, pressure: 101.325, humidity: 50 }
  );
  return result.value;
}

/**
 * Évaluer risque simple
 */
export function quickRiskAssessment(readings: AtmosphericReading[]): RiskLevel {
  const assessment = AtmosphericCalculations.assessAtmosphericRisk(
    readings,
    { volume: 100, depth: 2, ventilation: 'none', access: 'top', drainage: false },
    ['inspection'],
    1
  );
  return assessment.overallRisk;
}

/**
 * Calculer ventilation requise simple
 */
export function quickVentilationCalc(
  volume: number,
  currentPpm: number,
  targetPpm: number,
  gasType: GasType
): number {
  const ventilation = AtmosphericCalculations.calculateVentilationRequirements(
    volume,
    gasType,
    currentPpm,
    targetPpm,
    { temperature: 20, pressure: 101.325, humidity: 50 }
  );
  return ventilation.flowRate;
}

// =================== EXPORTS ===================
export default AtmosphericCalculations;
