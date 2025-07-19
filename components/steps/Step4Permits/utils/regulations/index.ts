// components/steps/Step4Permits/utils/regulations/index.ts

import { Jurisdiction, ValidationResult, BilingualText } from '../../types';

// =================== CONFIG RÉGLEMENTATIONS ===================
export interface RegulationConfig {
  jurisdiction: Jurisdiction;
  authority: string;
  lastUpdated: string;
  applicableRegulations: string[];
  atmosphericLimits: {
    oxygen: { min: number; max: number };
    carbonMonoxide: { max: number };
    hydrogenSulfide: { max: number };
    flammable: { maxLEL: number };
  };
  equipmentRequirements: string[];
  personnelRequirements: string[];
  procedureRequirements: string[];
}

// =================== CONFIGURATIONS PAR PROVINCE ===================
export const albertaRegulations: RegulationConfig = {
  jurisdiction: 'AB',
  authority: 'Alberta OHS',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Code', 'OHS Regulation'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const britishColumbiaRegulations: RegulationConfig = {
  jurisdiction: 'BC',
  authority: 'WorkSafeBC',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Regulation', 'WorkSafeBC Guidelines'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const manitobaRegulations: RegulationConfig = {
  jurisdiction: 'MB',
  authority: 'Manitoba WSB',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Workplace Safety Regulation'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const newBrunswickRegulations: RegulationConfig = {
  jurisdiction: 'NB',
  authority: 'WorkSafeNB',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['General Regulation'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const newfoundlandLabradorRegulations: RegulationConfig = {
  jurisdiction: 'NL',
  authority: 'WorkplaceNL',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const northwestRegulations: RegulationConfig = {
  jurisdiction: 'NT',
  authority: 'WSCC Northwest Territories',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Safety Act', 'General Safety Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const novaScotiaRegulations: RegulationConfig = {
  jurisdiction: 'NS',
  authority: 'WCB Nova Scotia',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const nunavutRegulations: RegulationConfig = {
  jurisdiction: 'NU',
  authority: 'WSCC Nunavut',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Safety Act', 'General Safety Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const ontarioRegulations: RegulationConfig = {
  jurisdiction: 'ON',
  authority: 'WSIB Ontario',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Occupational Health and Safety Act', 'Ontario Regulation 213/91'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const princeEdwardIslandRegulations: RegulationConfig = {
  jurisdiction: 'PE',
  authority: 'WCB Prince Edward Island',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Act', 'General Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const quebecRegulations: RegulationConfig = {
  jurisdiction: 'QC',
  authority: 'CNESST Québec',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Loi sur la santé et la sécurité du travail', 'RSST'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const saskatchewanRegulations: RegulationConfig = {
  jurisdiction: 'SK',
  authority: 'WCB Saskatchewan',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['OHS Act', 'OHS Regulations'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

export const yukonRegulations: RegulationConfig = {
  jurisdiction: 'YT',
  authority: 'WSCC Yukon',
  lastUpdated: '2024-01-01',
  applicableRegulations: ['Occupational Health and Safety Act', 'OHS Regulation'],
  atmosphericLimits: {
    oxygen: { min: 19.5, max: 23.5 },
    carbonMonoxide: { max: 35 },
    hydrogenSulfide: { max: 10 },
    flammable: { maxLEL: 10 }
  },
  equipmentRequirements: ['gas_detector', 'ventilation', 'communication'],
  personnelRequirements: ['confined_space_training', 'first_aid'],
  procedureRequirements: ['entry_procedure', 'emergency_procedure']
};

// =================== MAPPING CONFIGURATIONS ===================
export const REGULATION_MAPPING: Record<Jurisdiction, RegulationConfig> = {
  'AB': albertaRegulations,
  'BC': britishColumbiaRegulations,
  'MB': manitobaRegulations,
  'NB': newBrunswickRegulations,
  'NL': newfoundlandLabradorRegulations,
  'NT': northwestRegulations,
  'NS': novaScotiaRegulations,
  'NU': nunavutRegulations,
  'ON': ontarioRegulations,
  'PE': princeEdwardIslandRegulations,
  'QC': quebecRegulations,
  'SK': saskatchewanRegulations,
  'YT': yukonRegulations
};

// =================== FONCTIONS UTILITAIRES ===================
export const getRegulationConfig = (jurisdiction: Jurisdiction): RegulationConfig => {
  return REGULATION_MAPPING[jurisdiction] || quebecRegulations;
};

export const validateRegulatory = (
  permit: any, 
  jurisdiction: Jurisdiction, 
  language: 'fr' | 'en' = 'fr'
): ValidationResult => {
  const config = getRegulationConfig(jurisdiction);
  const errors: any[] = [];
  const warnings: any[] = [];
  const suggestions: any[] = [];

  // Validation limites atmosphériques
  if (permit.atmosphericData) {
    permit.atmosphericData.forEach((reading: any) => {
      if (reading.gasType === 'oxygen') {
        if (reading.value < config.atmosphericLimits.oxygen.min || 
            reading.value > config.atmosphericLimits.oxygen.max) {
          errors.push({
            type: 'atmospheric_limit_violation',
            message: {
              fr: `Niveau d'oxygène hors limites: ${reading.value}% (requis: ${config.atmosphericLimits.oxygen.min}-${config.atmosphericLimits.oxygen.max}%)`,
              en: `Oxygen level out of bounds: ${reading.value}% (required: ${config.atmosphericLimits.oxygen.min}-${config.atmosphericLimits.oxygen.max}%)`
            },
            field: 'atmospheric.oxygen',
            value: reading.value,
            critical: true
          });
        }
      }

      if (reading.gasType === 'carbon_monoxide') {
        if (reading.value > config.atmosphericLimits.carbonMonoxide.max) {
          errors.push({
            type: 'toxic_gas_violation',
            message: {
              fr: `Niveau de CO trop élevé: ${reading.value}ppm (max: ${config.atmosphericLimits.carbonMonoxide.max}ppm)`,
              en: `CO level too high: ${reading.value}ppm (max: ${config.atmosphericLimits.carbonMonoxide.max}ppm)`
            },
            field: 'atmospheric.carbon_monoxide',
            value: reading.value,
            critical: true
          });
        }
      }

      if (reading.gasType === 'hydrogen_sulfide') {
        if (reading.value > config.atmosphericLimits.hydrogenSulfide.max) {
          errors.push({
            type: 'toxic_gas_violation',
            message: {
              fr: `Niveau de H2S trop élevé: ${reading.value}ppm (max: ${config.atmosphericLimits.hydrogenSulfide.max}ppm)`,
              en: `H2S level too high: ${reading.value}ppm (max: ${config.atmosphericLimits.hydrogenSulfide.max}ppm)`
            },
            field: 'atmospheric.hydrogen_sulfide',
            value: reading.value,
            critical: true
          });
        }
      }

      if (reading.gasType === 'methane') {
        if (reading.value > config.atmosphericLimits.flammable.maxLEL) {
          errors.push({
            type: 'flammable_gas_violation',
            message: {
              fr: `Niveau de gaz combustible trop élevé: ${reading.value}%LEL (max: ${config.atmosphericLimits.flammable.maxLEL}%LEL)`,
              en: `Flammable gas level too high: ${reading.value}%LEL (max: ${config.atmosphericLimits.flammable.maxLEL}%LEL)`
            },
            field: 'atmospheric.flammable',
            value: reading.value,
            critical: true
          });
        }
      }
    });
  }

  // Validation équipement requis
  if (permit.equipmentData) {
    config.equipmentRequirements.forEach(requiredEquip => {
      const hasEquipment = permit.equipmentData.some((equip: any) => 
        equip.type === requiredEquip && equip.status === 'operational'
      );
      
      if (!hasEquipment) {
        errors.push({
          type: 'missing_required_equipment',
          message: {
            fr: `Équipement requis manquant: ${requiredEquip}`,
            en: `Missing required equipment: ${requiredEquip}`
          },
          field: 'equipment',
          value: requiredEquip,
          critical: true
        });
      }
    });
  }

  // Validation personnel requis
  if (permit.personnelData) {
    config.personnelRequirements.forEach(requiredTraining => {
      const hasQualifiedPersonnel = permit.personnelData.some((person: any) =>
        person.certifications?.some((cert: any) => cert.type === requiredTraining && cert.status === 'valid')
      );
      
      if (!hasQualifiedPersonnel) {
        errors.push({
          type: 'missing_qualified_personnel',
          message: {
            fr: `Personnel qualifié manquant pour: ${requiredTraining}`,
            en: `Missing qualified personnel for: ${requiredTraining}`
          },
          field: 'personnel',
          value: requiredTraining,
          critical: true
        });
      }
    });
  }

  // Validation procédures requises
  if (permit.procedureData) {
    config.procedureRequirements.forEach(requiredProc => {
      const hasProcedure = permit.procedureData.some((proc: any) => 
        proc.type === requiredProc && proc.status === 'approved'
      );
      
      if (!hasProcedure) {
        warnings.push({
          type: 'missing_procedure',
          message: {
            fr: `Procédure recommandée manquante: ${requiredProc}`,
            en: `Missing recommended procedure: ${requiredProc}`
          },
          field: 'procedures',
          value: requiredProc,
          severity: 'medium' as const
        });
      }
    });
  }

  // Suggestions d'amélioration
  if (errors.length === 0 && warnings.length === 0) {
    suggestions.push({
      type: 'regulatory_compliance',
      message: {
        fr: 'Conforme aux réglementations en vigueur',
        en: 'Compliant with current regulations'
      },
      priority: 'low' as const
    });
  }

  const isValid = errors.length === 0;
  const confidence = isValid ? (warnings.length === 0 ? 100 : 85) : 0;

  return {
    isValid,
    errors,
    warnings,
    criticalIssues: errors.filter(e => e.critical),
    suggestions,
    confidence
  };
};

export const generateComplianceReport = (
  permit: any,
  jurisdiction: Jurisdiction,
  language: 'fr' | 'en' = 'fr'
): {
  summary: BilingualText;
  details: any[];
  recommendations: BilingualText[];
  complianceScore: number;
} => {
  const validation = validateRegulatory(permit, jurisdiction, language);
  const config = getRegulationConfig(jurisdiction);
  
  const complianceScore = Math.max(0, 100 - (validation.errors.length * 20) - (validation.warnings.length * 5));
  
  const summary: BilingualText = {
    fr: validation.isValid 
      ? `Permis conforme aux réglementations ${config.authority}` 
      : `Non-conformités détectées selon ${config.authority}`,
    en: validation.isValid 
      ? `Permit compliant with ${config.authority} regulations` 
      : `Non-compliance detected under ${config.authority} regulations`
  };

  const details = [
    ...validation.errors.map(error => ({
      type: 'error',
      message: error.message[language],
      regulation: config.applicableRegulations[0],
      severity: 'critical'
    })),
    ...validation.warnings.map(warning => ({
      type: 'warning',
      message: warning.message[language],
      regulation: config.applicableRegulations[0],
      severity: warning.severity
    }))
  ];

  const recommendations: BilingualText[] = [];
  
  if (validation.errors.length > 0) {
    recommendations.push({
      fr: 'Corriger immédiatement toutes les non-conformités critiques avant de procéder',
      en: 'Immediately correct all critical non-compliance issues before proceeding'
    });
  }
  
  if (validation.warnings.length > 0) {
    recommendations.push({
      fr: 'Réviser et améliorer les éléments signalés par les avertissements',
      en: 'Review and improve elements flagged by warnings'
    });
  }
  
  if (validation.isValid) {
    recommendations.push({
      fr: 'Maintenir la conformité tout au long des travaux',
      en: 'Maintain compliance throughout the work duration'
    });
  }

  return {
    summary,
    details,
    recommendations,
    complianceScore
  };
};

// =================== FONCTIONS D'AIDE À LA CONFORMITÉ ===================
export const getApplicableRegulations = (jurisdiction: Jurisdiction): string[] => {
  return getRegulationConfig(jurisdiction).applicableRegulations;
};

export const getAtmosphericLimits = (jurisdiction: Jurisdiction) => {
  return getRegulationConfig(jurisdiction).atmosphericLimits;
};

export const getRequiredEquipment = (jurisdiction: Jurisdiction): string[] => {
  return getRegulationConfig(jurisdiction).equipmentRequirements;
};

export const getPersonnelRequirements = (jurisdiction: Jurisdiction): string[] => {
  return getRegulationConfig(jurisdiction).personnelRequirements;
};

export const getProcedureRequirements = (jurisdiction: Jurisdiction): string[] => {
  return getRegulationConfig(jurisdiction).procedureRequirements;
};

// =================== FUNCTIONS DE RECHERCHE ===================
export const searchRegulations = (
  query: string, 
  jurisdiction: Jurisdiction,
  language: 'fr' | 'en' = 'fr'
): any[] => {
  const config = getRegulationConfig(jurisdiction);
  const results: any[] = [];
  
  // Recherche dans les réglementations applicables
  config.applicableRegulations.forEach(regulation => {
    if (regulation.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        type: 'regulation',
        title: regulation,
        authority: config.authority,
        jurisdiction
      });
    }
  });
  
  return results;
};

// =================== EXPORTS PRINCIPAUX ===================
export {
  type RegulationConfig
};

export default {
  getRegulationConfig,
  validateRegulatory,
  generateComplianceReport,
  getApplicableRegulations,
  getAtmosphericLimits,
  getRequiredEquipment,
  getPersonnelRequirements,
  getProcedureRequirements,
  searchRegulations,
  REGULATION_MAPPING
};
