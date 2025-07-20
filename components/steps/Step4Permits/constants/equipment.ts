// =================== CONSTANTS/EQUIPMENT.TS - ÉQUIPEMENTS REQUIS PAR TYPE PERMIS ===================
// Constantes des équipements requis selon types de permis et réglementations provinciales

export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

// =================== INTERFACES ===================
export interface EquipmentItem {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  category: EquipmentCategory;
  subcategory?: string;
  manufacturer?: string[];
  model?: string[];
  specifications: EquipmentSpecifications;
  certifications: CertificationRequirement[];
  inspectionRequirements: InspectionRequirement;
  maintenanceSchedule: MaintenanceSchedule;
  cost: EquipmentCost;
  availability: EquipmentAvailability;
  compatibility: string[]; // IDs autres équipements compatibles
  alternatives: string[]; // IDs équipements alternatifs
  accessories?: string[]; // IDs accessoires requis
  icon: string;
  color: string;
  image?: string;
  qrCodeTemplate?: string;
  rfidEnabled: boolean;
  bluetoothEnabled: boolean;
  iotCapabilities: IoTCapabilities;
}

export type EquipmentCategory = 
  | 'detection' 
  | 'protection' 
  | 'communication' 
  | 'rescue' 
  | 'ventilation' 
  | 'lifting' 
  | 'access' 
  | 'cutting' 
  | 'measurement' 
  | 'safety' 
  | 'medical' 
  | 'lighting' 
  | 'power' 
  | 'containment'
  | 'monitoring'
  | 'tools';

export interface EquipmentSpecifications {
  dimensions?: { length: number; width: number; height: number; unit: 'mm' | 'cm' | 'm' };
  weight?: { value: number; unit: 'g' | 'kg' | 'lbs' };
  capacity?: { value: number; unit: string };
  operatingRange?: {
    temperature: { min: number; max: number; unit: '°C' | '°F' };
    humidity: { min: number; max: number; unit: '%' };
    pressure?: { min: number; max: number; unit: 'kPa' | 'psi' };
  };
  powerRequirements?: {
    type: 'battery' | 'ac' | 'dc' | 'manual' | 'pneumatic' | 'hydraulic';
    voltage?: number;
    current?: number;
    batteryLife?: number; // heures
    chargingTime?: number; // heures
  };
  accuracy?: { value: number; unit: string };
  responseTime?: { value: number; unit: 'ms' | 's' | 'min' };
  communicationProtocols?: string[];
  materials?: string[];
  workingLoadLimit?: { value: number; unit: 'kg' | 'lbs' | 'kN' };
  safetyFactor?: number;
}

export interface CertificationRequirement {
  standard: string; // CSA, ANSI, CE, etc.
  number: string;
  description: { fr: string; en: string };
  issuingBody: string;
  validityPeriod?: number; // mois
  testingRequired: boolean;
  annualVerification: boolean;
}

export interface InspectionRequirement {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'before-use';
  inspector: 'user' | 'supervisor' | 'qualified-person' | 'certified-inspector';
  checklist: InspectionItem[];
  documentation: 'logbook' | 'digital' | 'both';
  failureCriteria: { fr: string[]; en: string[] };
}

export interface InspectionItem {
  id: string;
  description: { fr: string; en: string };
  method: 'visual' | 'functional' | 'measurement' | 'load-test';
  acceptanceCriteria: { fr: string; en: string };
  tools?: string[];
}

export interface MaintenanceSchedule {
  preventive: MaintenanceItem[];
  calibration?: {
    frequency: number; // mois
    procedure: { fr: string; en: string };
    qualifiedPersonnel: boolean;
    equipment?: string[];
  };
  replacement: {
    components: ComponentReplacement[];
    conditions: { fr: string[]; en: string[] };
  };
}

export interface MaintenanceItem {
  frequency: number; // mois
  task: { fr: string; en: string };
  duration: number; // minutes
  skills: 'basic' | 'intermediate' | 'advanced';
  tools?: string[];
  parts?: string[];
}

export interface ComponentReplacement {
  component: string;
  interval: number; // mois ou heures d'utilisation
  intervalType: 'months' | 'hours' | 'cycles';
  indicators: { fr: string[]; en: string[] };
}

export interface EquipmentCost {
  purchase: { min: number; max: number; currency: 'CAD' };
  rental: { daily?: number; weekly?: number; monthly?: number; currency: 'CAD' };
  maintenance: { annual: number; currency: 'CAD' };
  calibration?: { cost: number; frequency: number; currency: 'CAD' };
}

export interface EquipmentAvailability {
  commonStock: boolean; // Équipement couramment en stock
  leadTime: number; // jours
  suppliers: EquipmentSupplier[];
  rentalOptions: boolean;
  emergencyStock?: boolean;
}

export interface EquipmentSupplier {
  name: string;
  location: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  services: ('sales' | 'rental' | 'maintenance' | 'calibration' | 'training')[];
  coverage: string[]; // Provinces desservies
}

export interface IoTCapabilities {
  sensors?: string[];
  dataLogging: boolean;
  remoteMonitoring: boolean;
  alerting: boolean;
  integration: string[]; // Systèmes compatibles
  connectivity: ('bluetooth' | 'wifi' | 'cellular' | 'lora' | 'zigbee')[];
  batteryMonitoring: boolean;
  geolocation: boolean;
}

export interface PermitEquipmentRequirement {
  permitType: PermitType;
  requiredEquipment: {
    mandatory: string[]; // IDs équipements obligatoires
    conditional: ConditionalEquipment[]; // Équipements selon conditions
    optional: string[]; // IDs équipements recommandés
  };
  minimumQuantities: Record<string, number>;
  qualificationRequirements: Record<string, string[]>; // équipement → certifications
  inspectionSchedule: Record<string, string>; // équipement → fréquence
  specialConditions?: { fr: string[]; en: string[] };
}

export interface ConditionalEquipment {
  equipmentId: string;
  conditions: EquipmentCondition[];
  alternatives?: string[];
}

export interface EquipmentCondition {
  type: 'atmospheric' | 'depth' | 'height' | 'temperature' | 'personnel-count' | 'work-duration' | 'hazard-level';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number | string;
  unit?: string;
}

// =================== CATALOGUE ÉQUIPEMENTS ===================
export const EQUIPMENT_CATALOG: Record<string, EquipmentItem> = {
  // =================== ÉQUIPEMENTS DÉTECTION ===================
  'detecteur-4-gaz-bw': {
    id: 'detecteur-4-gaz-bw',
    name: { fr: 'Détecteur 4 gaz BW Technologies', en: 'BW Technologies 4-Gas Detector' },
    description: { 
      fr: 'Détecteur portatif O₂, LEL, H₂S, CO avec alarmes visuelles et sonores',
      en: 'Portable O₂, LEL, H₂S, CO detector with visual and audible alarms'
    },
    category: 'detection',
    subcategory: 'atmospheric-monitoring',
    manufacturer: ['BW Technologies', 'Honeywell'],
    model: ['GasAlert Quattro', 'BW Clip4', 'MicroClip XL'],
    specifications: {
      dimensions: { length: 110, width: 58, height: 32, unit: 'mm' },
      weight: { value: 135, unit: 'g' },
      operatingRange: {
        temperature: { min: -40, max: 50, unit: '°C' },
        humidity: { min: 15, max: 95, unit: '%' },
        pressure: { min: 80, max: 120, unit: 'kPa' }
      },
      powerRequirements: {
        type: 'battery',
        batteryLife: 14, // heures
        chargingTime: 4
      },
      accuracy: { value: 2, unit: '% lecture' },
      responseTime: { value: 15, unit: 's' },
      communicationProtocols: ['Bluetooth', 'IntelliDoX']
    },
    certifications: [
      {
        standard: 'CSA',
        number: 'C22.2 No. 152',
        description: { 
          fr: 'Équipement électrique pour atmosphères explosives',
          en: 'Electrical equipment for explosive atmospheres'
        },
        issuingBody: 'Canadian Standards Association',
        testingRequired: true,
        annualVerification: true
      }
    ],
    inspectionRequirements: {
      frequency: 'before-use',
      inspector: 'user',
      checklist: [
        {
          id: 'battery-check',
          description: { 
            fr: 'Vérifier niveau batterie >25%',
            en: 'Check battery level >25%'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Indicateur batterie vert, pas d\'alerte faible',
            en: 'Green battery indicator, no low alert'
          }
        }
      ],
      documentation: 'both',
      failureCriteria: {
        fr: ['Batterie <25%', 'Calibration expirée', 'Alarmes défaillantes'],
        en: ['Battery <25%', 'Expired calibration', 'Failed alarms']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 6,
          task: { 
            fr: 'Calibration complète 4 gaz avec certificat',
            en: 'Complete 4-gas calibration with certificate'
          },
          duration: 30,
          skills: 'advanced'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Batterie lithium',
            interval: 24,
            intervalType: 'months',
            indicators: { 
              fr: ['Autonomie réduite <8h'],
              en: ['Reduced autonomy <8h']
            }
          }
        ],
        conditions: {
          fr: ['Usage intensif >8h/jour'],
          en: ['Heavy use >8h/day']
        }
      }
    },
    cost: {
      purchase: { min: 1200, max: 1800, currency: 'CAD' },
      rental: { daily: 45, weekly: 200, monthly: 600, currency: 'CAD' },
      maintenance: { annual: 300, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 2,
      suppliers: [
        {
          name: 'Levitt-Safety',
          location: ['QC', 'ON', 'BC', 'AB'],
          contact: {
            phone: '1-800-465-3948',
            email: 'info@levitt-safety.com',
            website: 'https://www.levitt-safety.com'
          },
          services: ['sales', 'rental', 'maintenance', 'calibration'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['station-calibration-bw'],
    alternatives: ['detecteur-4-gaz-msa'],
    accessories: ['kit-calibration', 'housse-protection'],
    icon: '📟',
    color: '#3B82F6',
    rfidEnabled: false,
    bluetoothEnabled: true,
    iotCapabilities: {
      sensors: ['O2', 'LEL', 'H2S', 'CO'],
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
      integration: ['IntelliDoX', 'Fleet Manager'],
      connectivity: ['bluetooth'],
      batteryMonitoring: true,
      geolocation: false
    }
  },

  'detecteur-4-gaz-msa': {
    id: 'detecteur-4-gaz-msa',
    name: { fr: 'Détecteur 4 gaz MSA Altair', en: 'MSA Altair 4-Gas Detector' },
    description: { 
      fr: 'Détecteur multigaz portatif avec alarmes et enregistrement données',
      en: 'Portable multigas detector with alarms and data logging'
    },
    category: 'detection',
    subcategory: 'atmospheric-monitoring',
    manufacturer: ['MSA Safety'],
    model: ['Altair 4X', 'Altair 5X'],
    specifications: {
      dimensions: { length: 112, width: 58, height: 35, unit: 'mm' },
      weight: { value: 165, unit: 'g' },
      operatingRange: {
        temperature: { min: -40, max: 60, unit: '°C' },
        humidity: { min: 10, max: 95, unit: '%' }
      },
      powerRequirements: {
        type: 'battery',
        batteryLife: 18,
        chargingTime: 6
      },
      responseTime: { value: 12, unit: 's' }
    },
    certifications: [
      {
        standard: 'CSA',
        number: 'C22.2 No. 152',
        description: { 
          fr: 'Certification canadienne équipements atmosphères explosives',
          en: 'Canadian certification for explosive atmosphere equipment'
        },
        issuingBody: 'CSA Group',
        testingRequired: true,
        annualVerification: true
      }
    ],
    inspectionRequirements: {
      frequency: 'daily',
      inspector: 'user',
      checklist: [
        {
          id: 'startup-test',
          description: { 
            fr: 'Test démarrage et autodiagnostic',
            en: 'Startup test and self-diagnosis'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Séquence démarrage normale',
            en: 'Normal startup sequence'
          }
        }
      ],
      documentation: 'digital',
      failureCriteria: {
        fr: ['Échec autotest'],
        en: ['Self-test failure']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 6,
          task: { 
            fr: 'Calibration et vérification capteurs',
            en: 'Calibration and sensor verification'
          },
          duration: 25,
          skills: 'intermediate'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Module capteurs',
            interval: 24,
            intervalType: 'months',
            indicators: { 
              fr: ['Alarmes fréquentes'],
              en: ['Frequent alarms']
            }
          }
        ],
        conditions: {
          fr: ['Environnement poussiéreux'],
          en: ['Dusty environment']
        }
      }
    },
    cost: {
      purchase: { min: 1400, max: 2200, currency: 'CAD' },
      rental: { daily: 50, weekly: 225, monthly: 675, currency: 'CAD' },
      maintenance: { annual: 350, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 3,
      suppliers: [
        {
          name: 'MSA Safety Canada',
          location: ['ON', 'AB'],
          contact: {
            phone: '1-800-672-2222',
            email: 'info.ca@msasafety.com',
            website: 'https://ca.msasafety.com'
          },
          services: ['sales', 'maintenance'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['station-galaxygx2'],
    alternatives: ['detecteur-4-gaz-bw'],
    icon: '📱',
    color: '#10B981',
    bluetoothEnabled: true,
    rfidEnabled: false,
    iotCapabilities: {
      sensors: ['O2', 'LEL', 'H2S', 'CO'],
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
      integration: ['MSA Link Pro'],
      connectivity: ['bluetooth'],
      batteryMonitoring: true,
      geolocation: false
    }
  },

  // =================== ÉQUIPEMENTS PROTECTION ===================
  'harnais-securite-miller': {
    id: 'harnais-securite-miller',
    name: { fr: 'Harnais sécurité Miller Revolution', en: 'Miller Revolution Safety Harness' },
    description: { 
      fr: 'Harnais complet protection antichute avec points d\'ancrage multiples',
      en: 'Full body fall protection harness with multiple anchor points'
    },
    category: 'protection',
    subcategory: 'fall-protection',
    manufacturer: ['Honeywell Miller'],
    model: ['Revolution R10', 'DuraFlex E650'],
    specifications: {
      workingLoadLimit: { value: 140, unit: 'kg' },
      safetyFactor: 2,
      materials: ['Polyester', 'Acier inoxydable']
    },
    certifications: [
      {
        standard: 'CSA',
        number: 'Z259.10-18',
        description: { 
          fr: 'Harnais complets pour protection contre les chutes',
          en: 'Full body harnesses for fall protection'
        },
        issuingBody: 'CSA Group',
        testingRequired: true,
        annualVerification: true
      }
    ],
    inspectionRequirements: {
      frequency: 'before-use',
      inspector: 'user',
      checklist: [
        {
          id: 'webbing-inspection',
          description: { 
            fr: 'Inspection sangles et coutures',
            en: 'Webbing and stitching inspection'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Aucune coupure ou usure excessive',
            en: 'No cuts or excessive wear'
          }
        }
      ],
      documentation: 'logbook',
      failureCriteria: {
        fr: ['Coupures sangles', 'Déformation métallique'],
        en: ['Webbing cuts', 'Metal deformation']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 12,
          task: { 
            fr: 'Inspection annuelle par personne compétente',
            en: 'Annual inspection by competent person'
          },
          duration: 15,
          skills: 'advanced'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Harnais complet',
            interval: 60,
            intervalType: 'months',
            indicators: { 
              fr: ['Usure visible'],
              en: ['Visible wear']
            }
          }
        ],
        conditions: {
          fr: ['Usage quotidien'],
          en: ['Daily use']
        }
      }
    },
    cost: {
      purchase: { min: 180, max: 350, currency: 'CAD' },
      rental: { daily: 15, weekly: 75, monthly: 225, currency: 'CAD' },
      maintenance: { annual: 50, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 1,
      suppliers: [
        {
          name: 'Levitt-Safety',
          location: ['QC', 'ON', 'BC', 'AB'],
          contact: {
            phone: '1-800-465-3948',
            email: 'info@levitt-safety.com',
            website: 'https://www.levitt-safety.com'
          },
          services: ['sales', 'rental'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['ligne-vie-miller'],
    alternatives: ['harnais-3m-dbi'],
    accessories: ['ligne-vie-retractable', 'mousqueton-acier'],
    icon: '🦺',
    color: '#DC2626',
    rfidEnabled: true,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
      integration: [],
      connectivity: [],
      batteryMonitoring: false,
      geolocation: false
    }
  },

  'extincteur-co2-5kg': {
    id: 'extincteur-co2-5kg',
    name: { fr: 'Extincteur CO₂ 5kg', en: '5kg CO₂ Fire Extinguisher' },
    description: { 
      fr: 'Extincteur dioxyde de carbone pour feux classe B et équipements électriques',
      en: 'Carbon dioxide extinguisher for class B fires and electrical equipment'
    },
    category: 'protection',
    subcategory: 'fire-suppression',
    manufacturer: ['Amerex', 'Ansul'],
    model: ['B384T', '322'],
    specifications: {
      capacity: { value: 5, unit: 'kg' },
      dimensions: { length: 150, width: 150, height: 560, unit: 'mm' },
      weight: { value: 14, unit: 'kg' }
    },
    certifications: [
      {
        standard: 'ULC',
        number: 'S508',
        description: { 
          fr: 'Extincteurs portatifs - Standards canadiens',
          en: 'Portable fire extinguishers - Canadian standards'
        },
        issuingBody: 'Underwriters Laboratories of Canada',
        testingRequired: true,
        annualVerification: true
      }
    ],
    inspectionRequirements: {
      frequency: 'monthly',
      inspector: 'user',
      checklist: [
        {
          id: 'pressure-gauge',
          description: { 
            fr: 'Vérification manomètre zone verte',
            en: 'Check pressure gauge in green zone'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Aiguille manomètre dans zone verte',
            en: 'Gauge needle in green zone'
          }
        }
      ],
      documentation: 'both',
      failureCriteria: {
        fr: ['Pression insuffisante', 'Scellement brisé'],
        en: ['Insufficient pressure', 'Broken seal']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 12,
          task: { 
            fr: 'Inspection annuelle par technicien certifié',
            en: 'Annual inspection by certified technician'
          },
          duration: 20,
          skills: 'advanced'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Tuyau diffuseur',
            interval: 60,
            intervalType: 'months',
            indicators: { 
              fr: ['Fissures caoutchouc'],
              en: ['Rubber cracks']
            }
          }
        ],
        conditions: {
          fr: ['Exposition UV'],
          en: ['UV exposure']
        }
      }
    },
    cost: {
      purchase: { min: 180, max: 280, currency: 'CAD' },
      rental: { daily: 12, weekly: 60, monthly: 180, currency: 'CAD' },
      maintenance: { annual: 45, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 1,
      suppliers: [
        {
          name: 'Fire & Safety Services',
          location: ['QC', 'ON', 'BC'],
          contact: {
            phone: '1-888-347-3427',
            email: 'info@fire-safety.ca',
            website: 'https://www.fire-safety.ca'
          },
          services: ['sales', 'rental', 'maintenance'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['support-extincteur'],
    alternatives: ['extincteur-poudre-abc'],
    accessories: ['support-mural', 'housse-protection'],
    icon: '🧯',
    color: '#DC2626',
    rfidEnabled: true,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
      integration: [],
      connectivity: [],
      batteryMonitoring: false,
      geolocation: false
    }
  },

  // =================== ÉQUIPEMENTS COMMUNICATION ===================
  'radio-motorola-cp200d': {
    id: 'radio-motorola-cp200d',
    name: { fr: 'Radio Motorola CP200d', en: 'Motorola CP200d Radio' },
    description: { 
      fr: 'Radio portable numérique avec fonctions urgence et GPS',
      en: 'Portable digital radio with emergency and GPS functions'
    },
    category: 'communication',
    subcategory: 'two-way-radio',
    manufacturer: ['Motorola Solutions'],
    model: ['CP200d', 'XPR3300e'],
    specifications: {
      dimensions: { length: 115, width: 55, height: 35, unit: 'mm' },
      weight: { value: 280, unit: 'g' },
      powerRequirements: {
        type: 'battery',
        batteryLife: 12,
        chargingTime: 3
      }
    },
    certifications: [
      {
        standard: 'IC',
        number: '109AG-M28JQN9WA5AN',
        description: { 
          fr: 'Certification ISED Canada',
          en: 'ISED Canada certification'
        },
        issuingBody: 'ISED Canada',
        testingRequired: false,
        annualVerification: false
      }
    ],
    inspectionRequirements: {
      frequency: 'weekly',
      inspector: 'user',
      checklist: [
        {
          id: 'battery-test',
          description: { 
            fr: 'Test autonomie batterie',
            en: 'Battery life test'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Autonomie >8h usage normal',
            en: 'Battery life >8h normal use'
          }
        }
      ],
      documentation: 'digital',
      failureCriteria: {
        fr: ['Batterie défaillante'],
        en: ['Failed battery']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 6,
          task: { 
            fr: 'Nettoyage contacts et vérification antenne',
            en: 'Contact cleaning and antenna verification'
          },
          duration: 10,
          skills: 'basic'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Batterie Li-Ion',
            interval: 18,
            intervalType: 'months',
            indicators: { 
              fr: ['Autonomie réduite <6h'],
              en: ['Reduced autonomy <6h']
            }
          }
        ],
        conditions: {
          fr: ['Usage intensif'],
          en: ['Heavy use']
        }
      }
    },
    cost: {
      purchase: { min: 450, max: 650, currency: 'CAD' },
      rental: { daily: 25, weekly: 125, monthly: 375, currency: 'CAD' },
      maintenance: { annual: 75, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 5,
      suppliers: [
        {
          name: 'Motorola Solutions Canada',
          location: ['ON', 'QC', 'BC'],
          contact: {
            phone: '1-800-461-2121',
            email: 'canada.sales@motorolasolutions.com',
            website: 'https://www.motorolasolutions.com/ca'
          },
          services: ['sales', 'rental', 'maintenance'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['chargeur-motorola'],
    alternatives: ['radio-kenwood-tk3360'],
    accessories: ['clip-ceinture', 'ecouteur-surveillance'],
    icon: '📻',
    color: '#0369A1',
    rfidEnabled: false,
    bluetoothEnabled: true,
    iotCapabilities: {
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
      integration: ['MOTOTRBO'],
      connectivity: ['cellular'],
      batteryMonitoring: true,
      geolocation: true
    }
  }
};

// =================== EXIGENCES PAR TYPE PERMIS ===================
export const PERMIT_EQUIPMENT_REQUIREMENTS: Record<PermitType, PermitEquipmentRequirement> = {
  'espace-clos': {
    permitType: 'espace-clos',
    requiredEquipment: {
      mandatory: [
        'detecteur-4-gaz-bw',
        'harnais-securite-miller',
        'radio-motorola-cp200d'
      ],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 2,
      'harnais-securite-miller': 4,
      'radio-motorola-cp200d': 3
    },
    qualificationRequirements: {
      'detecteur-4-gaz-bw': ['formation-detection-gaz']
    },
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use',
      'harnais-securite-miller': 'before-use',
      'radio-motorola-cp200d': 'daily'
    },
    specialConditions: {
      fr: ['Tests atmosphériques obligatoires avant entrée'],
      en: ['Mandatory atmospheric testing before entry']
    }
  },

  'travail-chaud': {
    permitType: 'travail-chaud',
    requiredEquipment: {
      mandatory: [
        'detecteur-4-gaz-bw',
        'extincteur-co2-5kg',
        'radio-motorola-cp200d'
      ],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1,
      'extincteur-co2-5kg': 2,
      'radio-motorola-cp200d': 2
    },
    qualificationRequirements: {
      'extincteur-co2-5kg': ['formation-extinction-incendie']
    },
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use',
      'extincteur-co2-5kg': 'monthly'
    }
  },

  'levage': {
    permitType: 'levage',
    requiredEquipment: {
      mandatory: ['radio-motorola-cp200d'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'radio-motorola-cp200d': 3
    },
    qualificationRequirements: {},
    inspectionSchedule: {}
  },

  'excavation': {
    permitType: 'excavation',
    requiredEquipment: {
      mandatory: ['detecteur-4-gaz-bw', 'radio-motorola-cp200d'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1,
      'radio-motorola-cp200d': 2
    },
    qualificationRequirements: {},
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use'
    }
  },

  'hauteur': {
    permitType: 'hauteur',
    requiredEquipment: {
      mandatory: ['harnais-securite-miller', 'radio-motorola-cp200d'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'harnais-securite-miller': 1,
      'radio-motorola-cp200d': 1
    },
    qualificationRequirements: {
      'harnais-securite-miller': ['formation-travail-hauteur']
    },
    inspectionSchedule: {
      'harnais-securite-miller': 'before-use'
    }
  },

  'isolation-energetique': {
    permitType: 'isolation-energetique',
    requiredEquipment: {
      mandatory: [],
      conditional: [],
      optional: []
    },
    minimumQuantities: {},
    qualificationRequirements: {},
    inspectionSchedule: {}
  },

  'pression': {
    permitType: 'pression',
    requiredEquipment: {
      mandatory: ['detecteur-4-gaz-bw'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1
    },
    qualificationRequirements: {},
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use'
    }
  },

  'radiographie': {
    permitType: 'radiographie',
    requiredEquipment: {
      mandatory: [],
      conditional: [],
      optional: []
    },
    minimumQuantities: {},
    qualificationRequirements: {},
    inspectionSchedule: {}
  },

  'toiture': {
    permitType: 'toiture',
    requiredEquipment: {
      mandatory: ['harnais-securite-miller'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'harnais-securite-miller': 1
    },
    qualificationRequirements: {
      'harnais-securite-miller': ['formation-travail-hauteur']
    },
    inspectionSchedule: {
      'harnais-securite-miller': 'before-use'
    }
  },

  'demolition': {
    permitType: 'demolition',
    requiredEquipment: {
      mandatory: ['detecteur-4-gaz-bw'],
      conditional: [],
      optional: []
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1
    },
    qualificationRequirements: {},
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use'
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
export function getEquipmentInfo(equipmentId: string): EquipmentItem | null {
  return EQUIPMENT_CATALOG[equipmentId] || null;
}

export function getRequiredEquipmentForPermit(permitType: PermitType): PermitEquipmentRequirement | null {
  return PERMIT_EQUIPMENT_REQUIREMENTS[permitType] || null;
}

export function getEquipmentsByCategory(category: EquipmentCategory): EquipmentItem[] {
  return Object.values(EQUIPMENT_CATALOG).filter(equipment => equipment.category === category);
}

export function checkEquipmentInspectionDue(
  equipmentId: string, 
  lastInspectionDate: Date
): {
  isDue: boolean;
  daysOverdue: number;
  nextInspectionDate: Date;
  status: 'current' | 'due-soon' | 'overdue';
} {
  const equipment = getEquipmentInfo(equipmentId);
  if (!equipment) {
    return {
      isDue: true,
      daysOverdue: 0,
      nextInspectionDate: new Date(),
      status: 'overdue'
    };
  }

  const inspection = equipment.inspectionRequirements;
  let intervalDays: number;

  switch (inspection.frequency) {
    case 'daily': intervalDays = 1; break;
    case 'weekly': intervalDays = 7; break;
    case 'monthly': intervalDays = 30; break;
    case 'quarterly': intervalDays = 90; break;
    case 'annual': intervalDays = 365; break;
    case 'before-use': intervalDays = 0; break;
    default: intervalDays = 30;
  }

  const nextInspectionDate = new Date(lastInspectionDate);
  nextInspectionDate.setDate(nextInspectionDate.getDate() + intervalDays);

  const now = new Date();
  const timeDiff = now.getTime() - nextInspectionDate.getTime();
  const daysOverdue = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

  let status: 'current' | 'due-soon' | 'overdue';
  if (daysOverdue > 0) {
    status = 'overdue';
  } else if (daysOverdue > -7) {
    status = 'due-soon';
  } else {
    status = 'current';
  }

  return {
    isDue: daysOverdue > 0 || inspection.frequency === 'before-use',
    daysOverdue: Math.max(0, daysOverdue),
    nextInspectionDate,
    status
  };
}

// =================== EXPORT DEFAULT ===================
export default EQUIPMENT_CATALOG;
