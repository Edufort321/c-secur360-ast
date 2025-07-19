// =================== CONSTANTS/ATMOSPHERICLIMITS.TS - LIMITES ATMOSPHÉRIQUES PAR PROVINCE ===================
// Constantes des limites atmosphériques selon réglementations provinciales canadiennes

import type { PermitType } from '../types';

// =================== INTERFACES ===================
export interface AtmosphericParameter {
  name: { fr: string; en: string };
  unit: string;
  symbol: string;
  description: { fr: string; en: string };
  measurementMethod: string;
  calibrationFrequency: number; // jours
  icon: string;
  color: string;
}

export interface AtmosphericLimit {
  min?: number;
  max: number;
  critical: number;
  warning?: number;
  optimal?: { min: number; max: number };
  measurementPrecision: number;
  samplingInterval: number; // secondes
  averagingPeriod: number; // minutes
}

export interface ProvincialLimits {
  province: {
    code: string;
    name: { fr: string; en: string };
  };
  effectiveDate: string;
  regulations: {
    primary: string;
    secondary: string[];
    standards: string[];
  };
  limits: Record<string, AtmosphericLimit>;
  specialConditions?: {
    permitType: PermitType;
    modifications: Record<string, Partial<AtmosphericLimit>>;
    additionalRequirements: { fr: string[]; en: string[] };
  }[];
  temperatureCorrections: {
    enabled: boolean;
    referenceTemp: number; // °C
    correctionFactor: number; // %/°C
  };
  altitudeCorrections: {
    enabled: boolean;
    referenceAltitude: number; // mètres
    correctionFactor: number; // %/100m
  };
}

// =================== PARAMÈTRES ATMOSPHÉRIQUES ===================
export const ATMOSPHERIC_PARAMETERS: Record<string, AtmosphericParameter> = {
  oxygen: {
    name: { fr: 'Oxygène', en: 'Oxygen' },
    unit: '%',
    symbol: 'O₂',
    description: { 
      fr: 'Concentration d\'oxygène dans l\'air ambiant',
      en: 'Oxygen concentration in ambient air'
    },
    measurementMethod: 'electrochemical',
    calibrationFrequency: 180, // 6 mois
    icon: '🫁',
    color: '#3B82F6'
  },
  lel: {
    name: { fr: 'Limite explosive inférieure', en: 'Lower Explosive Limit' },
    unit: '%',
    symbol: 'LEL',
    description: { 
      fr: 'Pourcentage de la limite explosive inférieure des gaz combustibles',
      en: 'Percentage of lower explosive limit of combustible gases'
    },
    measurementMethod: 'catalytic',
    calibrationFrequency: 180,
    icon: '🔥',
    color: '#EA580C'
  },
  h2s: {
    name: { fr: 'Sulfure d\'hydrogène', en: 'Hydrogen Sulfide' },
    unit: 'ppm',
    symbol: 'H₂S',
    description: { 
      fr: 'Concentration de sulfure d\'hydrogène en parties par million',
      en: 'Hydrogen sulfide concentration in parts per million'
    },
    measurementMethod: 'electrochemical',
    calibrationFrequency: 180,
    icon: '☠️',
    color: '#DC2626'
  },
  co: {
    name: { fr: 'Monoxyde de carbone', en: 'Carbon Monoxide' },
    unit: 'ppm',
    symbol: 'CO',
    description: { 
      fr: 'Concentration de monoxyde de carbone en parties par million',
      en: 'Carbon monoxide concentration in parts per million'
    },
    measurementMethod: 'electrochemical',
    calibrationFrequency: 180,
    icon: '💨',
    color: '#7C2D12'
  },
  temperature: {
    name: { fr: 'Température', en: 'Temperature' },
    unit: '°C',
    symbol: 'T',
    description: { 
      fr: 'Température ambiante de l\'air',
      en: 'Ambient air temperature'
    },
    measurementMethod: 'thermistor',
    calibrationFrequency: 365, // 1 an
    icon: '🌡️',
    color: '#059669'
  },
  humidity: {
    name: { fr: 'Humidité relative', en: 'Relative Humidity' },
    unit: '%',
    symbol: 'RH',
    description: { 
      fr: 'Humidité relative de l\'air ambiant',
      en: 'Relative humidity of ambient air'
    },
    measurementMethod: 'capacitive',
    calibrationFrequency: 365,
    icon: '💧',
    color: '#0369A1'
  },
  pressure: {
    name: { fr: 'Pression atmosphérique', en: 'Atmospheric Pressure' },
    unit: 'kPa',
    symbol: 'P',
    description: { 
      fr: 'Pression atmosphérique absolue',
      en: 'Absolute atmospheric pressure'
    },
    measurementMethod: 'piezoresistive',
    calibrationFrequency: 365,
    icon: '📊',
    color: '#7C3AED'
  },
  no2: {
    name: { fr: 'Dioxyde d\'azote', en: 'Nitrogen Dioxide' },
    unit: 'ppm',
    symbol: 'NO₂',
    description: { 
      fr: 'Concentration de dioxyde d\'azote',
      en: 'Nitrogen dioxide concentration'
    },
    measurementMethod: 'electrochemical',
    calibrationFrequency: 180,
    icon: '🟤',
    color: '#A16207'
  },
  so2: {
    name: { fr: 'Dioxyde de soufre', en: 'Sulfur Dioxide' },
    unit: 'ppm',
    symbol: 'SO₂',
    description: { 
      fr: 'Concentration de dioxyde de soufre',
      en: 'Sulfur dioxide concentration'
    },
    measurementMethod: 'electrochemical',
    calibrationFrequency: 180,
    icon: '🟡',
    color: '#BE185D'
  }
};

// =================== LIMITES PAR PROVINCE ===================
export const PROVINCIAL_ATMOSPHERIC_LIMITS: Record<string, ProvincialLimits> = {
  QC: {
    province: {
      code: 'QC',
      name: { fr: 'Québec', en: 'Quebec' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'RSST - Règlement sur la santé et la sécurité du travail',
      secondary: ['Code de sécurité pour les travaux de construction', 'Loi sur la santé et la sécurité du travail'],
      standards: ['CSA Z1006-16', 'NFPA 350', 'ANSI/ASSE Z117.1']
    },
    limits: {
      oxygen: {
        min: 20.5,
        max: 23.0,
        critical: 19.5,
        warning: 20.0,
        optimal: { min: 20.8, max: 21.5 },
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 35,
        critical: 200,
        warning: 25,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -20,
        max: 50,
        critical: 55,
        warning: 45,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      humidity: {
        max: 95,
        critical: 99,
        warning: 90,
        measurementPrecision: 1,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      pressure: {
        min: 95.0,
        max: 106.0,
        critical: 90.0,
        warning: 97.0,
        measurementPrecision: 0.1,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    specialConditions: [
      {
        permitType: 'espace-clos',
        modifications: {
          oxygen: { min: 20.5, warning: 20.8 },
          h2s: { max: 5, warning: 2 }
        },
        additionalRequirements: {
          fr: [
            'Tests continus pendant toute la durée des travaux',
            'Ventilation mécanique obligatoire si O₂ < 20.8%',
            'Évacuation immédiate si H₂S > 5 ppm'
          ],
          en: [
            'Continuous testing throughout work duration',
            'Mechanical ventilation required if O₂ < 20.8%',
            'Immediate evacuation if H₂S > 5 ppm'
          ]
        }
      }
    ],
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 20,
      correctionFactor: 0.3
    },
    altitudeCorrections: {
      enabled: true,
      referenceAltitude: 0,
      correctionFactor: 1.2
    }
  },

  ON: {
    province: {
      code: 'ON',
      name: { fr: 'Ontario', en: 'Ontario' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'O. Reg. 851 - Industrial Establishments',
      secondary: ['O. Reg. 213/91 - Construction Projects', 'Occupational Health and Safety Act'],
      standards: ['CSA Z1006-16', 'NFPA 350', 'ANSI/ASSE Z117.1']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        optimal: { min: 20.5, max: 21.5 },
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25, // Plus strict qu'au Québec
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -25,
        max: 45,
        critical: 50,
        warning: 40,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      humidity: {
        max: 95,
        critical: 99,
        warning: 90,
        measurementPrecision: 1,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      pressure: {
        min: 95.0,
        max: 106.0,
        critical: 90.0,
        warning: 97.0,
        measurementPrecision: 0.1,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 20,
      correctionFactor: 0.4
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 0,
      correctionFactor: 0
    }
  },

  BC: {
    province: {
      code: 'BC',
      name: { fr: 'Colombie-Britannique', en: 'British Columbia' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Workers Compensation Act - Occupational Health and Safety Regulation',
      secondary: ['WorkSafeBC Guidelines', 'BC Building Code'],
      standards: ['CSA Z1006-16', 'NFPA 350', 'WorkSafeBC Standards']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        optimal: { min: 20.5, max: 21.5 },
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -30,
        max: 40,
        critical: 45,
        warning: 35,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      humidity: {
        max: 98, // Plus humide sur la côte
        critical: 99,
        warning: 95,
        measurementPrecision: 1,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      pressure: {
        min: 94.0, // Altitude variable
        max: 107.0,
        critical: 89.0,
        warning: 96.0,
        measurementPrecision: 0.1,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 15, // Climat plus frais
      correctionFactor: 0.5
    },
    altitudeCorrections: {
      enabled: true,
      referenceAltitude: 100,
      correctionFactor: 1.5
    }
  },

  AB: {
    province: {
      code: 'AB',
      name: { fr: 'Alberta', en: 'Alberta' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Code',
      secondary: ['Alberta OHS Regulation', 'Petro-Chemical Guidelines'],
      standards: ['CSA Z1006-16', 'API Standards', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        optimal: { min: 20.5, max: 21.5 },
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 15, // Plus strict - industrie pétrolière
        warning: 3,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -35,
        max: 45,
        critical: 50,
        warning: 40,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      humidity: {
        max: 90, // Climat plus sec
        critical: 95,
        warning: 85,
        measurementPrecision: 1,
        samplingInterval: 60,
        averagingPeriod: 5
      },
      pressure: {
        min: 92.0, // Altitude élevée
        max: 105.0,
        critical: 87.0,
        warning: 94.0,
        measurementPrecision: 0.1,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    specialConditions: [
      {
        permitType: 'espace-clos',
        modifications: {
          h2s: { max: 5, critical: 10, warning: 2 }
        },
        additionalRequirements: {
          fr: [
            'Détection H₂S obligatoire - industrie pétrolière',
            'Formation spécialisée H₂S requise',
            'Équipements auto-sauveteurs disponibles'
          ],
          en: [
            'H₂S detection mandatory - oil industry',
            'Specialized H₂S training required',
            'Self-rescue equipment available'
          ]
        }
      }
    ],
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 10, // Climat plus froid
      correctionFactor: 0.6
    },
    altitudeCorrections: {
      enabled: true,
      referenceAltitude: 600,
      correctionFactor: 2.0
    }
  },

  SK: {
    province: {
      code: 'SK',
      name: { fr: 'Saskatchewan', en: 'Saskatchewan' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'The Saskatchewan Employment Act - OHS Regulations',
      secondary: ['WCB Guidelines', 'Mining Regulations'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -40,
        max: 40,
        critical: 45,
        warning: 35,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 5,
      correctionFactor: 0.7
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 500,
      correctionFactor: 0.5
    }
  },

  MB: {
    province: {
      code: 'MB',
      name: { fr: 'Manitoba', en: 'Manitoba' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Workplace Safety and Health Act and Regulation',
      secondary: ['WCB Guidelines', 'Construction Safety Codes'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 30,
        critical: 200,
        warning: 20,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -35,
        max: 35,
        critical: 40,
        warning: 30,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 8,
      correctionFactor: 0.5
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 250,
      correctionFactor: 0.3
    }
  },

  NB: {
    province: {
      code: 'NB',
      name: { fr: 'Nouveau-Brunswick', en: 'New Brunswick' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Act - General Regulation',
      secondary: ['WCB Guidelines', 'Industrial Safety Codes'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -25,
        max: 35,
        critical: 40,
        warning: 30,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 12,
      correctionFactor: 0.4
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 50,
      correctionFactor: 0.1
    }
  },

  NS: {
    province: {
      code: 'NS',
      name: { fr: 'Nouvelle-Écosse', en: 'Nova Scotia' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Act - Workplace Safety Regulations',
      secondary: ['WCB Guidelines', 'Maritime Safety Codes'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -20,
        max: 30,
        critical: 35,
        warning: 25,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 10,
      correctionFactor: 0.3
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 0,
      correctionFactor: 0
    }
  },

  PE: {
    province: {
      code: 'PE',
      name: { fr: 'Île-du-Prince-Édouard', en: 'Prince Edward Island' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Act - General Regulations',
      secondary: ['WCB Guidelines'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -15,
        max: 30,
        critical: 35,
        warning: 25,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 12,
      correctionFactor: 0.3
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 0,
      correctionFactor: 0
    }
  },

  NL: {
    province: {
      code: 'NL',
      name: { fr: 'Terre-Neuve-et-Labrador', en: 'Newfoundland and Labrador' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Regulations',
      secondary: ['WCB Guidelines', 'Offshore Safety Regulations'],
      standards: ['CSA Z1006-16', 'NFPA 350', 'Offshore Standards']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -25,
        max: 25,
        critical: 30,
        warning: 20,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 8,
      correctionFactor: 0.4
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 0,
      correctionFactor: 0
    }
  },

  NT: {
    province: {
      code: 'NT',
      name: { fr: 'Territoires du Nord-Ouest', en: 'Northwest Territories' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Safety Act - General Safety Regulations',
      secondary: ['WCB Guidelines', 'Mining Safety Codes'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -45,
        max: 30,
        critical: 35,
        warning: 25,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: 0,
      correctionFactor: 1.0
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 200,
      correctionFactor: 0.3
    }
  },

  NU: {
    province: {
      code: 'NU',
      name: { fr: 'Nunavut', en: 'Nunavut' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Safety Act - Occupational Health and Safety Regulations',
      secondary: ['WCB Guidelines'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -50,
        max: 25,
        critical: 30,
        warning: 20,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: -5,
      correctionFactor: 1.2
    },
    altitudeCorrections: {
      enabled: false,
      referenceAltitude: 100,
      correctionFactor: 0.2
    }
  },

  YT: {
    province: {
      code: 'YT',
      name: { fr: 'Yukon', en: 'Yukon' }
    },
    effectiveDate: '2024-01-01',
    regulations: {
      primary: 'Occupational Health and Safety Act - Regulation',
      secondary: ['WCB Guidelines', 'Mining Safety Codes'],
      standards: ['CSA Z1006-16', 'NFPA 350']
    },
    limits: {
      oxygen: {
        min: 19.5,
        max: 23.0,
        critical: 19.0,
        warning: 19.8,
        measurementPrecision: 0.1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      lel: {
        max: 10,
        critical: 25,
        warning: 5,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 1
      },
      h2s: {
        max: 10,
        critical: 20,
        warning: 5,
        measurementPrecision: 0.5,
        samplingInterval: 15,
        averagingPeriod: 1
      },
      co: {
        max: 25,
        critical: 200,
        warning: 15,
        measurementPrecision: 1,
        samplingInterval: 30,
        averagingPeriod: 15
      },
      temperature: {
        min: -45,
        max: 30,
        critical: 35,
        warning: 25,
        measurementPrecision: 0.5,
        samplingInterval: 60,
        averagingPeriod: 5
      }
    },
    temperatureCorrections: {
      enabled: true,
      referenceTemp: -2,
      correctionFactor: 0.8
    },
    altitudeCorrections: {
      enabled: true,
      referenceAltitude: 500,
      correctionFactor: 1.0
    }
  }
};

// =================== LIMITES PAR TYPE DE PERMIS ===================
export const PERMIT_TYPE_ATMOSPHERIC_REQUIREMENTS: Record<PermitType, {
  requiredParameters: string[];
  testingFrequency: 'initial' | 'continuous' | 'periodic';
  testingInterval?: number; // minutes si periodic
  specialRequirements?: { fr: string[]; en: string[] };
}> = {
  'espace-clos': {
    requiredParameters: ['oxygen', 'lel', 'h2s', 'co', 'temperature'],
    testingFrequency: 'continuous',
    specialRequirements: {
      fr: [
        'Tests obligatoires avant entrée',
        'Monitoring continu pendant les travaux',
        'Ventilation mécanique si nécessaire',
        'Alarmes automatiques configurées'
      ],
      en: [
        'Mandatory testing before entry',
        'Continuous monitoring during work',
        'Mechanical ventilation if required',
        'Automatic alarms configured'
      ]
    }
  },
  'travail-chaud': {
    requiredParameters: ['oxygen', 'lel', 'co', 'temperature'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Tests gaz combustibles obligatoires',
        'Surveillance continue LEL',
        'Arrêt travaux si LEL > 5%'
      ],
      en: [
        'Mandatory combustible gas testing',
        'Continuous LEL monitoring',
        'Stop work if LEL > 5%'
      ]
    }
  },
  'excavation': {
    requiredParameters: ['oxygen', 'lel', 'h2s'],
    testingFrequency: 'periodic',
    testingInterval: 120, // 2 heures
    specialRequirements: {
      fr: [
        'Tests avant descente personnel',
        'Re-test après interruption >2h',
        'Surveillance H₂S proximité égouts'
      ],
      en: [
        'Testing before personnel descent',
        'Re-test after >2h interruption',
        'H₂S monitoring near sewers'
      ]
    }
  },
  'levage': {
    requiredParameters: ['temperature', 'pressure'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Conditions météo acceptables',
        'Visibilité minimale 1km',
        'Vent maximum selon équipement'
      ],
      en: [
        'Acceptable weather conditions',
        'Minimum visibility 1km',
        'Maximum wind per equipment specs'
      ]
    }
  },
  'hauteur': {
    requiredParameters: ['temperature', 'pressure'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Conditions météo sécuritaires',
        'Pas de travail par foudre',
        'Vent maximum 40 km/h'
      ],
      en: [
        'Safe weather conditions',
        'No work during lightning',
        'Maximum wind 40 km/h'
      ]
    }
  },
  'isolation-energetique': {
    requiredParameters: ['oxygen', 'lel'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Tests avant réactivation',
        'Purge complète si nécessaire',
        'Verification absence gaz'
      ],
      en: [
        'Testing before reactivation',
        'Complete purge if required',
        'Verify absence of gases'
      ]
    }
  },
  'pression': {
    requiredParameters: ['pressure', 'temperature', 'oxygen'],
    testingFrequency: 'continuous',
    specialRequirements: {
      fr: [
        'Monitoring pression continu',
        'Alarmes haute/basse pression',
        'Procedures depressurization'
      ],
      en: [
        'Continuous pressure monitoring',
        'High/low pressure alarms',
        'Depressurization procedures'
      ]
    }
  },
  'radiographie': {
    requiredParameters: ['temperature', 'humidity'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Conditions climatiques stables',
        'Humidité contrôlée équipements',
        'Température opérationnelle'
      ],
      en: [
        'Stable climatic conditions',
        'Controlled equipment humidity',
        'Operational temperature'
      ]
    }
  },
  'toiture': {
    requiredParameters: ['temperature', 'pressure'],
    testingFrequency: 'initial',
    specialRequirements: {
      fr: [
        'Pas de travail si vent >35 km/h',
        'Température matériaux sécuritaire',
        'Conditions anti-dérapantes'
      ],
      en: [
        'No work if wind >35 km/h',
        'Safe material temperatures',
        'Non-slip conditions'
      ]
    }
  },
  'demolition': {
    requiredParameters: ['oxygen', 'lel', 'h2s', 'co', 'temperature'],
    testingFrequency: 'continuous',
    specialRequirements: {
      fr: [
        'Tests contaminants avant démolition',
        'Surveillance amiante/plomb',
        'Monitoring poussières'
      ],
      en: [
        'Contaminant testing before demolition',
        'Asbestos/lead monitoring',
        'Dust monitoring'
      ]
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
export function getLimitsForProvince(provinceCode: string): ProvincialLimits | null {
  return PROVINCIAL_ATMOSPHERIC_LIMITS[provinceCode] || null;
}

export function getParameterInfo(parameterKey: string): AtmosphericParameter | null {
  return ATMOSPHERIC_PARAMETERS[parameterKey] || null;
}

export function getRequiredParametersForPermit(permitType: PermitType): string[] {
  return PERMIT_TYPE_ATMOSPHERIC_REQUIREMENTS[permitType]?.requiredParameters || [];
}

export function validateReading(
  parameter: string, 
  value: number, 
  provinceCode: string
): {
  isValid: boolean;
  status: 'normal' | 'warning' | 'critical';
  message: { fr: string; en: string };
} {
  const limits = getLimitsForProvince(provinceCode);
  if (!limits || !limits.limits[parameter]) {
    return {
      isValid: false,
      status: 'critical',
      message: {
        fr: 'Limites non définies pour ce paramètre',
        en: 'Limits not defined for this parameter'
      }
    };
  }

  const paramLimits = limits.limits[parameter];
  const paramInfo = getParameterInfo(parameter);

  // Validation selon type de paramètre
  if (parameter === 'oxygen') {
    if (value < paramLimits.critical!) {
      return {
        isValid: false,
        status: 'critical',
        message: {
          fr: `O₂ critique: ${value}% < ${paramLimits.critical}%`,
          en: `Critical O₂: ${value}% < ${paramLimits.critical}%`
        }
      };
    } else if (value < paramLimits.min! || value > paramLimits.max) {
      return {
        isValid: false,
        status: 'warning',
        message: {
          fr: `O₂ hors limites: ${value}% (requis: ${paramLimits.min}-${paramLimits.max}%)`,
          en: `O₂ out of range: ${value}% (required: ${paramLimits.min}-${paramLimits.max}%)`
        }
      };
    }
  } else {
    // Autres paramètres (LEL, H2S, CO, etc.)
    if (value > paramLimits.critical) {
      return {
        isValid: false,
        status: 'critical',
        message: {
          fr: `${paramInfo?.symbol} critique: ${value}${paramInfo?.unit} > ${paramLimits.critical}${paramInfo?.unit}`,
          en: `Critical ${paramInfo?.symbol}: ${value}${paramInfo?.unit} > ${paramLimits.critical}${paramInfo?.unit}`
        }
      };
    } else if (value > paramLimits.max) {
      return {
        isValid: false,
        status: 'warning',
        message: {
          fr: `${paramInfo?.symbol} élevé: ${value}${paramInfo?.unit} > ${paramLimits.max}${paramInfo?.unit}`,
          en: `High ${paramInfo?.symbol}: ${value}${paramInfo?.unit} > ${paramLimits.max}${paramInfo?.unit}`
        }
      };
    }
  }

  return {
    isValid: true,
    status: 'normal',
    message: {
      fr: `${paramInfo?.symbol} normal: ${value}${paramInfo?.unit}`,
      en: `Normal ${paramInfo?.symbol}: ${value}${paramInfo?.unit}`
    }
  };
}

export function applyTemperatureCorrection(
  value: number,
  parameter: string,
  temperature: number,
  provinceCode: string
): number {
  const limits = getLimitsForProvince(provinceCode);
  if (!limits || !limits.temperatureCorrections.enabled) {
    return value;
  }

  const tempDiff = temperature - limits.temperatureCorrections.referenceTemp;
  const correctionFactor = limits.temperatureCorrections.correctionFactor;
  
  // Correction principalement pour gaz (LEL, H2S, CO)
  if (['lel', 'h2s', 'co'].includes(parameter)) {
    return value * (1 + (tempDiff * correctionFactor / 100));
  }
  
  return value;
}

export function applyAltitudeCorrection(
  value: number,
  parameter: string,
  altitude: number,
  provinceCode: string
): number {
  const limits = getLimitsForProvince(provinceCode);
  if (!limits || !limits.altitudeCorrections.enabled) {
    return value;
  }

  const altitudeDiff = altitude - limits.altitudeCorrections.referenceAltitude;
  const correctionFactor = limits.altitudeCorrections.correctionFactor;
  
  // Correction principalement pour pression et oxygène
  if (['pressure', 'oxygen'].includes(parameter)) {
    return value * (1 + (altitudeDiff * correctionFactor / 10000));
  }
  
  return value;
}

// =================== EXPORT DEFAULT ===================
export default PROVINCIAL_ATMOSPHERIC_LIMITS;
