// =================== CONSTANTS/EQUIPMENT.TS - SECTION 1 - INTERFACES ET ÉQUIPEMENTS DÉTECTION/PROTECTION ===================
// Constantes des équipements requis selon types de permis et réglementations provinciales

import type { PermitType } from '../types';

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

// =================== CATALOGUE ÉQUIPEMENTS - SECTION 1 ===================
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
      },
      {
        standard: 'ATEX',
        number: 'II 1G Ex ia IIC T4',
        description: { 
          fr: 'Certification européenne atmosphères explosives',
          en: 'European explosive atmospheres certification'
        },
        issuingBody: 'European Union',
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
        },
        {
          id: 'sensor-calibration',
          description: { 
            fr: 'Vérifier date dernière calibration',
            en: 'Check last calibration date'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Calibration valide <180 jours',
            en: 'Valid calibration <180 days'
          }
        },
        {
          id: 'alarm-test',
          description: { 
            fr: 'Test alarmes sonores et visuelles',
            en: 'Test audible and visual alarms'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Alarmes fonctionnelles à >85dB',
            en: 'Functional alarms at >85dB'
          }
        }
      ],
      documentation: 'both',
      failureCriteria: {
        fr: ['Batterie <25%', 'Calibration expirée', 'Alarmes défaillantes', 'Écran endommagé'],
        en: ['Battery <25%', 'Expired calibration', 'Failed alarms', 'Damaged display']
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
          skills: 'advanced',
          tools: ['Kit calibration', 'Gaz étalon certifié'],
          parts: ['Filtres capteurs']
        },
        {
          frequency: 12,
          task: { 
            fr: 'Remplacement capteurs selon usage',
            en: 'Sensor replacement based on usage'
          },
          duration: 45,
          skills: 'advanced',
          tools: ['Tournevis spécialisé'],
          parts: ['Capteur O₂', 'Capteur LEL', 'Capteur H₂S', 'Capteur CO']
        }
      ],
      calibration: {
        frequency: 6,
        procedure: { 
          fr: 'Calibration 2 points (zéro + span) selon CSA',
          en: '2-point calibration (zero + span) per CSA'
        },
        qualifiedPersonnel: true,
        equipment: ['Station calibration', 'Gaz certifiés']
      },
      replacement: {
        components: [
          {
            component: 'Batterie lithium',
            interval: 24,
            intervalType: 'months',
            indicators: { 
              fr: ['Autonomie réduite <8h', 'Charge lente'],
              en: ['Reduced autonomy <8h', 'Slow charging']
            }
          },
          {
            component: 'Capteurs électrochimiques',
            interval: 2000,
            intervalType: 'hours',
            indicators: { 
              fr: ['Dérive calibration', 'Temps réponse lent'],
              en: ['Calibration drift', 'Slow response time']
            }
          }
        ],
        conditions: {
          fr: ['Usage intensif >8h/jour', 'Exposition contaminants', 'Environnement corrosif'],
          en: ['Heavy use >8h/day', 'Contaminant exposure', 'Corrosive environment']
        }
      }
    },
    cost: {
      purchase: { min: 1200, max: 1800, currency: 'CAD' },
      rental: { daily: 45, weekly: 200, monthly: 600, currency: 'CAD' },
      maintenance: { annual: 300, currency: 'CAD' },
      calibration: { cost: 150, frequency: 6, currency: 'CAD' }
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
          services: ['sales', 'rental', 'maintenance', 'calibration', 'training'],
          coverage: ['QC', 'ON', 'MB', 'SK', 'AB', 'BC']
        },
        {
          name: 'Acklands-Grainger',
          location: ['National'],
          contact: {
            phone: '1-877-947-2464',
            email: 'customer.service@acklandsgrainger.com',
            website: 'https://www.acklandsgrainger.com'
          },
          services: ['sales', 'rental', 'maintenance'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL']
        }
      ],
      rentalOptions: true,
      emergencyStock: true
    },
    compatibility: ['station-calibration-bw', 'logiciel-fleet-manager'],
    alternatives: ['detecteur-4-gaz-msa', 'detecteur-4-gaz-draeger'],
    accessories: ['kit-calibration', 'housse-protection', 'clip-ceinture'],
    icon: '📟',
    color: '#3B82F6',
    qrCodeTemplate: 'BW-{model}-{serialNumber}',
    rfidEnabled: false,
    bluetoothEnabled: true,
    iotCapabilities: {
      sensors: ['O2', 'LEL', 'H2S', 'CO', 'Temperature', 'Humidity'],
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
      integration: ['IntelliDoX', 'Fleet Manager', 'SafetyNet'],
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
    model: ['Altair 4X', 'Altair 5X', 'ALTAIR io360'],
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
      responseTime: { value: 12, unit: 's' },
      communicationProtocols: ['MSA Link Pro', 'Galaxy GX2']
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
            fr: 'Séquence démarrage normale, aucun code erreur',
            en: 'Normal startup sequence, no error codes'
          }
        }
      ],
      documentation: 'digital',
      failureCriteria: {
        fr: ['Échec autotest', 'Alarmes silencieuses', 'Écran illisible'],
        en: ['Self-test failure', 'Silent alarms', 'Unreadable display']
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
              fr: ['Alarmes fréquentes', 'Lectures instables'],
              en: ['Frequent alarms', 'Unstable readings']
            }
          }
        ],
        conditions: {
          fr: ['Environnement poussiéreux', 'Températures extrêmes'],
          en: ['Dusty environment', 'Extreme temperatures']
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
          services: ['sales', 'maintenance', 'calibration', 'training'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['station-galaxygx2'],
    alternatives: ['detecteur-4-gaz-bw', 'detecteur-4-gaz-draeger'],
    icon: '📱',
    color: '#10B981',
    bluetoothEnabled: true,
    rfidEnabled: false,
    iotCapabilities: {
      sensors: ['O2', 'LEL', 'H2S', 'CO', 'Temperature'],
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
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
    manufacturer: ['Honeywell Miller', 'Miller Fall Protection'],
    model: ['Revolution R10', 'DuraFlex E650', 'Titan T4500'],
    specifications: {
      workingLoadLimit: { value: 140, unit: 'kg' },
      safetyFactor: 2,
      materials: ['Polyester', 'Acier inoxydable', 'Aluminium'],
      operatingRange: {
        temperature: { min: -40, max: 85, unit: '°C' }
      }
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
      },
      {
        standard: 'ANSI',
        number: 'Z359.11-2014',
        description: { 
          fr: 'Norme américaine équipements protection chute',
          en: 'American standard for fall protection equipment'
        },
        issuingBody: 'American National Standards Institute',
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
            fr: 'Aucune coupure, usure excessive ou décoloration',
            en: 'No cuts, excessive wear or discoloration'
          }
        },
        {
          id: 'hardware-check',
          description: { 
            fr: 'Vérification boucles et points d\'ancrage',
            en: 'Buckles and anchor points check'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Fonctionnement fluide, aucune déformation',
            en: 'Smooth operation, no deformation'
          }
        },
        {
          id: 'label-verification',
          description: { 
            fr: 'Vérification étiquettes identification',
            en: 'Identification labels verification'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Étiquettes lisibles avec dates manufacture',
            en: 'Readable labels with manufacture dates'
          }
        }
      ],
      documentation: 'logbook',
      failureCriteria: {
        fr: ['Coupures sangles', 'Déformation métallique', 'Coutures détachées', 'Impact chute'],
        en: ['Webbing cuts', 'Metal deformation', 'Loose stitching', 'Fall impact']
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
              fr: ['Usure visible', 'Exposition UV prolongée', 'Contact produits chimiques'],
              en: ['Visible wear', 'Prolonged UV exposure', 'Chemical contact']
            }
          }
        ],
        conditions: {
          fr: ['Usage quotidien', 'Environnement agressif', 'Stockage inadéquat'],
          en: ['Daily use', 'Aggressive environment', 'Inadequate storage']
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
          services: ['sales', 'rental', 'training'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['ligne-vie-miller', 'mousqueton-triple-lock'],
    alternatives: ['harnais-3m-dbi', 'harnais-capital-safety'],
    accessories: ['ligne-vie-retractable', 'mousqueton-acier', 'housse-transport'],
    icon: '🦺',
    color: '#DC2626',
    rfidEnabled: true,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
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
    manufacturer: ['Amerex', 'Ansul', 'First Alert'],
    model: ['B384T', '322', 'FE05'],
    specifications: {
      capacity: { value: 5, unit: 'kg' },
      dimensions: { length: 150, width: 150, height: 560, unit: 'mm' },
      weight: { value: 14, unit: 'kg' },
      operatingRange: {
        temperature: { min: -40, max: 60, unit: '°C' }
      },
      materials: ['Acier', 'Laiton', 'Caoutchouc'],
      responseTime: { value: 8, unit: 's' }
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
        },
        {
          id: 'seal-tamper',
          description: { 
            fr: 'Vérification scellement et goupille',
            en: 'Check seal and tamper pin'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Scellement intact, goupille en place',
            en: 'Seal intact, pin in place'
          }
        },
        {
          id: 'hose-nozzle',
          description: { 
            fr: 'Inspection tuyau et diffuseur',
            en: 'Hose and nozzle inspection'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Tuyau souple, diffuseur dégagé',
            en: 'Flexible hose, clear nozzle'
          }
        }
      ],
      documentation: 'both',
      failureCriteria: {
        fr: ['Pression insuffisante', 'Scellement brisé', 'Corrosion visible', 'Tuyau endommagé'],
        en: ['Insufficient pressure', 'Broken seal', 'Visible corrosion', 'Damaged hose']
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
          skills: 'advanced',
          tools: ['Balance precision', 'Manomètre test']
        },
        {
          frequency: 60,
          task: { 
            fr: 'Test hydrostatique réservoir',
            en: 'Hydrostatic pressure test'
          },
          duration: 60,
          skills: 'expert',
          tools: ['Équipement test pression']
        }
      ],
      replacement: {
        components: [
          {
            component: 'Tuyau diffuseur',
            interval: 60,
            intervalType: 'months',
            indicators: { 
              fr: ['Fissures caoutchouc', 'Durcissement', 'Obstruction'],
              en: ['Rubber cracks', 'Hardening', 'Obstruction']
            }
          }
        ],
        conditions: {
          fr: ['Exposition UV', 'Températures extrêmes', 'Manipulation fréquente'],
          en: ['UV exposure', 'Extreme temperatures', 'Frequent handling']
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
          services: ['sales', 'rental', 'maintenance', 'training'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'MB']
        }
      ],
      rentalOptions: true,
      emergencyStock: true
    },
    compatibility: ['support-extincteur', 'panneau-signalisation'],
    alternatives: ['extincteur-poudre-abc', 'extincteur-eau-pulverisee'],
    accessories: ['support-mural', 'housse-protection', 'panneau-identification'],
    icon: '🧯',
    color: '#DC2626',
    qrCodeTemplate: 'EXT-{type}-{serialNumber}',
    rfidEnabled: true,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
      connectivity: [],
      batteryMonitoring: false,
      geolocation: false
    }
  }
};
// =================== CONSTANTS/EQUIPMENT.TS - SECTION 2 - ÉQUIPEMENTS RESTANTS ET EXIGENCES ===================
// Suite du catalogue équipements avec communication, sauvetage, ventilation + exigences par type permis

// =================== ÉQUIPEMENTS COMMUNICATION, SAUVETAGE, VENTILATION ===================
// À ajouter au EQUIPMENT_CATALOG existant de la Section 1

export const ADDITIONAL_EQUIPMENT: Record<string, EquipmentItem> = {
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
    model: ['CP200d', 'XPR3300e', 'XPR7350e'],
    specifications: {
      dimensions: { length: 115, width: 55, height: 35, unit: 'mm' },
      weight: { value: 280, unit: 'g' },
      operatingRange: {
        temperature: { min: -30, max: 60, unit: '°C' }
      },
      powerRequirements: {
        type: 'battery',
        batteryLife: 12,
        chargingTime: 3
      },
      communicationProtocols: ['MOTOTRBO', 'DMR Tier II']
    },
    certifications: [
      {
        standard: 'IC',
        number: '109AG-M28JQN9WA5AN',
        description: { 
          fr: 'Certification Innovation, Sciences et Développement économique Canada',
          en: 'Innovation, Science and Economic Development Canada certification'
        },
        issuingBody: 'ISED Canada',
        testingRequired: false,
        annualVerification: false
      },
      {
        standard: 'IP',
        number: 'IP54',
        description: { 
          fr: 'Protection poussière et éclaboussures',
          en: 'Dust and splash protection'
        },
        issuingBody: 'IEC',
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
        },
        {
          id: 'communication-test',
          description: { 
            fr: 'Test communication bidirectionnelle',
            en: 'Two-way communication test'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Communication claire à distance prévue',
            en: 'Clear communication at intended range'
          }
        },
        {
          id: 'emergency-button',
          description: { 
            fr: 'Test bouton urgence',
            en: 'Emergency button test'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Activation immédiate signal détresse',
            en: 'Immediate distress signal activation'
          }
        }
      ],
      documentation: 'digital',
      failureCriteria: {
        fr: ['Batterie défaillante', 'Communication intermittente', 'Bouton urgence non fonctionnel'],
        en: ['Failed battery', 'Intermittent communication', 'Non-functional emergency button']
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
              fr: ['Autonomie réduite <6h', 'Temps charge prolongé'],
              en: ['Reduced autonomy <6h', 'Extended charging time']
            }
          }
        ],
        conditions: {
          fr: ['Usage intensif', 'Cycles charge fréquents'],
          en: ['Heavy use', 'Frequent charge cycles']
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
          location: ['ON', 'QC', 'BC', 'AB'],
          contact: {
            phone: '1-800-461-2121',
            email: 'canada.sales@motorolasolutions.com',
            website: 'https://www.motorolasolutions.com/ca'
          },
          services: ['sales', 'rental', 'maintenance', 'training'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['chargeur-motorola', 'repeater-mototrbo'],
    alternatives: ['radio-kenwood-tk3360', 'radio-hytera-pd365'],
    accessories: ['clip-ceinture', 'ecouteur-surveillance', 'antenne-exterieure'],
    icon: '📻',
    color: '#0369A1',
    rfidEnabled: false,
    bluetoothEnabled: true,
    iotCapabilities: {
      dataLogging: true,
      remoteMonitoring: true,
      alerting: true,
      connectivity: ['cellular'],
      batteryMonitoring: true,
      geolocation: true
    }
  },

  // =================== ÉQUIPEMENTS SAUVETAGE ===================
  'treuil-sauvetage-3m': {
    id: 'treuil-sauvetage-3m',
    name: { fr: 'Treuil sauvetage 3M DBI-SALA', en: '3M DBI-SALA Rescue Winch' },
    description: { 
      fr: 'Treuil manuel sauvetage espace clos avec câble 30m',
      en: 'Manual rescue winch for confined spaces with 30m cable'
    },
    category: 'rescue',
    subcategory: 'retrieval-system',
    manufacturer: ['3M Fall Protection', 'DBI-SALA'],
    model: ['Advanced 5-Way SRL', 'Winch-Operated SRL', 'Salalift II'],
    specifications: {
      dimensions: { length: 400, width: 350, height: 200, unit: 'mm' },
      weight: { value: 18, unit: 'kg' },
      capacity: { value: 140, unit: 'kg' },
      workingLoadLimit: { value: 140, unit: 'kg' },
      safetyFactor: 4,
      materials: ['Acier galvanisé', 'Câble acier inoxydable', 'Aluminium']
    },
    certifications: [
      {
        standard: 'CSA',
        number: 'Z259.2.2-17',
        description: { 
          fr: 'Dispositifs antichute à rappel automatique',
          en: 'Self-retracting lifelines'
        },
        issuingBody: 'CSA Group',
        testingRequired: true,
        annualVerification: true
      },
      {
        standard: 'ANSI',
        number: 'Z359.14-2021',
        description: { 
          fr: 'Systèmes de sauvetage et d\'évacuation',
          en: 'Rescue and evacuation systems'
        },
        issuingBody: 'ANSI',
        testingRequired: true,
        annualVerification: true
      }
    ],
    inspectionRequirements: {
      frequency: 'before-use',
      inspector: 'qualified-person',
      checklist: [
        {
          id: 'cable-inspection',
          description: { 
            fr: 'Inspection câble acier sur toute longueur',
            en: 'Steel cable inspection full length'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Aucun brin cassé, corrosion ou déformation',
            en: 'No broken strands, corrosion or deformation'
          }
        },
        {
          id: 'winch-operation',
          description: { 
            fr: 'Test fonctionnement treuil et freins',
            en: 'Winch operation and brake test'
          },
          method: 'functional',
          acceptanceCriteria: { 
            fr: 'Rotation fluide, freinage efficace',
            en: 'Smooth rotation, effective braking'
          },
          tools: ['Manivelle', 'Charge test 50kg']
        }
      ],
      documentation: 'both',
      failureCriteria: {
        fr: ['Câble endommagé', 'Freins défaillants', 'Corrosion excessive'],
        en: ['Damaged cable', 'Failed brakes', 'Excessive corrosion']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 6,
          task: { 
            fr: 'Lubrification mécanisme et test charge',
            en: 'Mechanism lubrication and load test'
          },
          duration: 60,
          skills: 'advanced',
          tools: ['Lubrifiant spécialisé', 'Poids test 140kg']
        }
      ],
      replacement: {
        components: [
          {
            component: 'Câble acier',
            interval: 60,
            intervalType: 'months',
            indicators: { 
              fr: ['Usure >10% brins', 'Corrosion visible'],
              en: ['Wear >10% strands', 'Visible corrosion']
            }
          }
        ],
        conditions: {
          fr: ['Usage fréquent', 'Environnement corrosif'],
          en: ['Frequent use', 'Corrosive environment']
        }
      }
    },
    cost: {
      purchase: { min: 2500, max: 4000, currency: 'CAD' },
      rental: { daily: 85, weekly: 425, monthly: 1275, currency: 'CAD' },
      maintenance: { annual: 400, currency: 'CAD' }
    },
    availability: {
      commonStock: false,
      leadTime: 10,
      suppliers: [
        {
          name: '3M Canada Safety',
          location: ['ON', 'QC'],
          contact: {
            phone: '1-800-364-3577',
            email: 'safety.canada@3m.com',
            website: 'https://www.3m.ca/safety'
          },
          services: ['sales', 'maintenance', 'training'],
          coverage: ['QC', 'ON', 'BC', 'AB']
        }
      ],
      rentalOptions: true,
      emergencyStock: false
    },
    compatibility: ['harnais-securite-miller', 'treuil-support-portable'],
    alternatives: ['treuil-miller-mightevac', 'treuil-falltech-7285'],
    accessories: ['support-treuil', 'harnais-sauvetage', 'corde-guidage'],
    icon: '🪃',
    color: '#7C2D12',
    rfidEnabled: true,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
      connectivity: [],
      batteryMonitoring: false,
      geolocation: false
    }
  },

  // =================== ÉQUIPEMENTS VENTILATION ===================
  'ventilateur-portable-allegro': {
    id: 'ventilateur-portable-allegro',
    name: { fr: 'Ventilateur portable Allegro', en: 'Allegro Portable Ventilator' },
    description: { 
      fr: 'Ventilateur centrifuge portable pour espaces clos avec gaine flexible',
      en: 'Portable centrifugal ventilator for confined spaces with flexible duct'
    },
    category: 'ventilation',
    subcategory: 'air-mover',
    manufacturer: ['Allegro Industries'],
    model: ['9533-08', '9534-12', '9536-16'],
    specifications: {
      dimensions: { length: 320, width: 280, height: 350, unit: 'mm' },
      weight: { value: 12, unit: 'kg' },
      capacity: { value: 750, unit: 'CFM' },
      powerRequirements: {
        type: 'ac',
        voltage: 115,
        current: 8.5
      },
      operatingRange: {
        temperature: { min: -10, max: 40, unit: '°C' }
      }
    },
    certifications: [
      {
        standard: 'CSA',
        number: 'C22.2 No. 113',
        description: { 
          fr: 'Ventilateurs pour atmosphères dangereuses',
          en: 'Fans for hazardous atmospheres'
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
          id: 'motor-inspection',
          description: { 
            fr: 'Vérification moteur et hélice',
            en: 'Motor and impeller inspection'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Pas de dommage visible, rotation libre',
            en: 'No visible damage, free rotation'
          }
        },
        {
          id: 'electrical-check',
          description: { 
            fr: 'Vérification câblage et mise à terre',
            en: 'Wiring and grounding check'
          },
          method: 'visual',
          acceptanceCriteria: { 
            fr: 'Câbles intacts, connexion terre efficace',
            en: 'Intact cables, effective ground connection'
          }
        }
      ],
      documentation: 'logbook',
      failureCriteria: {
        fr: ['Moteur défaillant', 'Câble endommagé', 'Hélice cassée'],
        en: ['Failed motor', 'Damaged cable', 'Broken impeller']
      }
    },
    maintenanceSchedule: {
      preventive: [
        {
          frequency: 3,
          task: { 
            fr: 'Nettoyage filtre et lubrification roulements',
            en: 'Filter cleaning and bearing lubrication'
          },
          duration: 30,
          skills: 'basic'
        }
      ],
      replacement: {
        components: [
          {
            component: 'Filtre à air',
            interval: 6,
            intervalType: 'months',
            indicators: { 
              fr: ['Débit réduit', 'Filtre obstrué'],
              en: ['Reduced flow', 'Clogged filter']
            }
          }
        ],
        conditions: {
          fr: ['Environnement poussiéreux', 'Usage continu'],
          en: ['Dusty environment', 'Continuous use']
        }
      }
    },
    cost: {
      purchase: { min: 800, max: 1200, currency: 'CAD' },
      rental: { daily: 35, weekly: 175, monthly: 525, currency: 'CAD' },
      maintenance: { annual: 150, currency: 'CAD' }
    },
    availability: {
      commonStock: true,
      leadTime: 3,
      suppliers: [
        {
          name: 'Levitt-Safety',
          location: ['QC', 'ON', 'BC', 'AB'],
          contact: {
            phone: '1-800-465-3948',
            email: 'info@levitt-safety.com',
            website: 'https://www.levitt-safety.com'
          },
          services: ['sales', 'rental', 'maintenance'],
          coverage: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB']
        }
      ],
      rentalOptions: true
    },
    compatibility: ['gaine-flexible-8-pouces', 'deflecteur-air'],
    alternatives: ['ventilateur-ram-fan', 'ventilateur-americ-vaf'],
    accessories: ['gaine-flexible', 'raccord-entree', 'support-portable'],
    icon: '🌪️',
    color: '#059669',
    rfidEnabled: false,
    bluetoothEnabled: false,
    iotCapabilities: {
      dataLogging: false,
      remoteMonitoring: false,
      alerting: false,
      connectivity: [],
      batteryMonitoring: false,
      geolocation: false
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
        'radio-motorola-cp200d',
        'treuil-sauvetage-3m'
      ],
      conditional: [
        {
          equipmentId: 'ventilateur-portable-allegro',
          conditions: [
            { type: 'atmospheric', operator: '<', value: 20.5, unit: '%' },
            { type: 'work-duration', operator: '>', value: 30, unit: 'minutes' }
          ],
          alternatives: ['ventilateur-ram-fan']
        }
      ],
      optional: [
        'eclairage-portable-led',
        'treuil-support-portable'
      ]
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 2, // 1 pour superviseur, 1 pour surveillant
      'harnais-securite-miller': 4, // Tous les entrants
      'radio-motorola-cp200d': 3, // Superviseur, surveillant, 1 entrant
      'treuil-sauvetage-3m': 1
    },
    qualificationRequirements: {
      'detecteur-4-gaz-bw': ['formation-detection-gaz'],
      'treuil-sauvetage-3m': ['formation-sauvetage-espace-clos']
    },
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use',
      'harnais-securite-miller': 'before-use',
      'treuil-sauvetage-3m': 'before-use',
      'radio-motorola-cp200d': 'daily'
    },
    specialConditions: {
      fr: [
        'Tests atmosphériques obligatoires avant entrée',
        'Communication continue superviseur-surveillant-entrants',
        'Équipements sauvetage positionnés près entrée',
        'Ventilation si O₂ < 20.5% ou contaminants détectés'
      ],
      en: [
        'Mandatory atmospheric testing before entry',
        'Continuous communication supervisor-attendant-entrants',
        'Rescue equipment positioned near entry',
        'Ventilation if O₂ < 20.5% or contaminants detected'
      ]
    }
  },

  'travail-chaud': {
    permitType: 'travail-chaud',
    requiredEquipment: {
      mandatory: [
        'detecteur-4-gaz-bw',
        'extincteur-co2-5kg',
        'couverture-ignifuge',
        'radio-motorola-cp200d'
      ],
      conditional: [
        {
          equipmentId: 'arrosoir-emergency',
          conditions: [
            { type: 'work-duration', operator: '>', value: 60, unit: 'minutes' }
          ]
        }
      ],
      optional: [
        'ecran-protection-soudage',
        'aspirateur-fumees'
      ]
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1,
      'extincteur-co2-5kg': 2, // Zone travail + zone surveillance
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
      mandatory: [
        'grue-mobile-certifiee',
        'elingues-certifiees',
        'radio-motorola-cp200d',
        'panneau-signalisation'
      ],
      conditional: [
        {
          equipmentId: 'anemometre-digital',
          conditions: [
            { type: 'height', operator: '>', value: 10, unit: 'm' }
          ]
        }
      ],
      optional: [
        'palonnier-automatique',
        'camera-surveillance'
      ]
    },
    minimumQuantities: {
      'radio-motorola-cp200d': 3, // Opérateur, signaleur, superviseur
      'elingues-certifiees': 4
    },
    qualificationRequirements: {
      'grue-mobile-certifiee': ['licence-operateur-grue'],
      'elingues-certifiees': ['formation-elingage']
    },
    inspectionSchedule: {
      'grue-mobile-certifiee': 'daily',
      'elingues-certifiees': 'before-use'
    }
  },

  'excavation': {
    permitType: 'excavation',
    requiredEquipment: {
      mandatory: [
        'detecteur-4-gaz-bw',
        'echelle-acces-certifiee',
        'panneau-signalisation',
        'radio-motorola-cp200d'
      ],
      conditional: [
        {
          equipmentId: 'systeme-etayage',
          conditions: [
            { type: 'depth', operator: '>', value: 1.2, unit: 'm' }
          ]
        },
        {
          equipmentId: 'pompe-submersible',
          conditions: [
            { type: 'hazard-level', operator: '==', value: 'eau-souterraine' }
          ]
        }
      ],
      optional: [
        'detecteur-services-publics',
        'barriere-securite'
      ]
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1,
      'echelle-acces-certifiee': 1,
      'radio-motorola-cp200d': 2
    },
    qualificationRequirements: {
      'systeme-etayage': ['formation-excavation-securite']
    },
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use',
      'echelle-acces-certifiee': 'daily',
      'systeme-etayage': 'daily'
    }
  },

  'hauteur': {
    permitType: 'hauteur',
    requiredEquipment: {
      mandatory: [
        'harnais-securite-miller',
        'ligne-vie-retractable',
        'mousqueton-triple-lock',
        'radio-motorola-cp200d'
      ],
      conditional: [
        {
          equipmentId: 'anemometre-digital',
          conditions: [
            { type: 'height', operator: '>', value: 15, unit: 'm' }
          ]
        }
      ],
      optional: [
        'filet-securite',
        'garde-corps-temporaire'
      ]
    },
    minimumQuantities: {
      'harnais-securite-miller': 1, // Par travailleur
      'ligne-vie-retractable': 1,
      'mousqueton-triple-lock': 2
    },
    qualificationRequirements: {
      'harnais-securite-miller': ['formation-travail-hauteur']
    },
    inspectionSchedule: {
      'harnais-securite-miller': 'before-use',
      'ligne-vie-retractable': 'before-use'
    }
  },

  'isolation-energetique': {
    permitType: 'isolation-energetique',
    requiredEquipment: {
      mandatory: ['cadenas-loto', 'etiquettes-loto', 'testeur-tension'],
      conditional: [],
      optional: ['detecteur-4-gaz-bw']
    },
    minimumQuantities: {
      'cadenas-loto': 4,
      'etiquettes-loto': 10
    },
    qualificationRequirements: {
      'testeur-tension': ['formation-electricien']
    },
    inspectionSchedule: {
      'testeur-tension': 'before-use'
    }
  },

  'pression': {
    permitType: 'pression',
    requiredEquipment: {
      mandatory: ['manometre-precision', 'soupape-securite', 'detecteur-4-gaz-bw'],
      conditional: [],
      optional: ['camera-thermique']
    },
    minimumQuantities: {
      'manometre-precision': 1,
      'soupape-securite': 1
    },
    qualificationRequirements: {
      'manometre-precision': ['formation-pression']
    },
    inspectionSchedule: {
      'manometre-precision': 'before-use'
    }
  },

  'radiographie': {
    permitType: 'radiographie',
    requiredEquipment: {
      mandatory: ['dosimetre-personnel', 'detecteur-radiation', 'panneau-radiation'],
      conditional: [],
      optional: ['plomb-protection']
    },
    minimumQuantities: {
      'dosimetre-personnel': 1, // Par personne
      'detecteur-radiation': 1
    },
    qualificationRequirements: {
      'detecteur-radiation': ['licence-operateur-radio']
    },
    inspectionSchedule: {
      'dosimetre-personnel': 'daily',
      'detecteur-radiation': 'before-use'
    }
  },

  'toiture': {
    permitType: 'toiture',
    requiredEquipment: {
      mandatory: ['harnais-securite-miller', 'ligne-vie-retractable', 'echelle-securisee'],
      conditional: [],
      optional: ['garde-corps-temporaire', 'filet-securite']
    },
    minimumQuantities: {
      'harnais-securite-miller': 1, // Par travailleur
      'ligne-vie-retractable': 1
    },
    qualificationRequirements: {
      'harnais-securite-miller': ['formation-travail-hauteur']
    },
    inspectionSchedule: {
      'harnais-securite-miller': 'before-use',
      'echelle-securisee': 'before-use'
    }
  },

  'demolition': {
    permitType: 'demolition',
    requiredEquipment: {
      mandatory: ['detecteur-4-gaz-bw', 'detecteur-amiante', 'equipement-demolition'],
      conditional: [],
      optional: ['aspirateur-hepa', 'bache-protection']
    },
    minimumQuantities: {
      'detecteur-4-gaz-bw': 1,
      'detecteur-amiante': 1
    },
    qualificationRequirements: {
      'detecteur-amiante': ['formation-amiante']
    },
    inspectionSchedule: {
      'detecteur-4-gaz-bw': 'before-use',
      'detecteur-amiante': 'before-use'
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
export function getEquipmentInfo(equipmentId: string): EquipmentItem | null {
  return EQUIPMENT_CATALOG[equipmentId] || ADDITIONAL_EQUIPMENT[equipmentId] || null;
}

export function getRequiredEquipmentForPermit(permitType: PermitType): PermitEquipmentRequirement | null {
  return PERMIT_EQUIPMENT_REQUIREMENTS[permitType] || null;
}

export function getEquipmentsByCategory(category: EquipmentCategory): EquipmentItem[] {
  const allEquipment = { ...EQUIPMENT_CATALOG, ...ADDITIONAL_EQUIPMENT };
  return Object.values(allEquipment).filter(equipment => equipment.category === category);
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
    case 'before-use': intervalDays = 0; break; // Toujours requis
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

export function evaluateConditionalEquipment(
  equipment: ConditionalEquipment,
  permitConditions: Record<string, any>
): boolean {
  return equipment.conditions.every(condition => {
    const value = permitConditions[condition.type];
    if (value === undefined) return false;

    switch (condition.operator) {
      case '>': return value > condition.value;
      case '<': return value < condition.value;
      case '>=': return value >= condition.value;
      case '<=': return value <= condition.value;
      case '==': return value === condition.value;
      case '!=': return value !== condition.value;
      default: return false;
    }
  });
}

export function calculateEquipmentCosts(
  equipmentIds: string[],
  rentalDuration: { daily?: number; weekly?: number; monthly?: number } = {},
  includeMaintenanceAnnual: boolean = false
): {
  purchase: { total: number; breakdown: Record<string, number> };
  rental: { total: number; breakdown: Record<string, number> };
  maintenance: { total: number; breakdown: Record<string, number> };
} {
  const result = {
    purchase: { total: 0, breakdown: {} as Record<string, number> },
    rental: { total: 0, breakdown: {} as Record<string, number> },
    maintenance: { total: 0, breakdown: {} as Record<string, number> }
  };

  equipmentIds.forEach(id => {
    const equipment = getEquipmentInfo(id);
    if (!equipment) return;

    // Coût achat (moyenne min-max)
    const purchaseCost = (equipment.cost.purchase.min + equipment.cost.purchase.max) / 2;
    result.purchase.total += purchaseCost;
    result.purchase.breakdown[id] = purchaseCost;

    // Coût location
    let rentalCost = 0;
    if (rentalDuration.daily && equipment.cost.rental?.daily) {
      rentalCost += rentalDuration.daily * equipment.cost.rental.daily;
    }
    if (rentalDuration.weekly && equipment.cost.rental?.weekly) {
      rentalCost += rentalDuration.weekly * equipment.cost.rental.weekly;
    }
    if (rentalDuration.monthly && equipment.cost.rental?.monthly) {
      rentalCost += rentalDuration.monthly * equipment.cost.rental.monthly;
    }
    result.rental.total += rentalCost;
    result.rental.breakdown[id] = rentalCost;

    // Coût maintenance annuel
    if (includeMaintenanceAnnual) {
      const maintenanceCost = equipment.cost.maintenance.annual;
      result.maintenance.total += maintenanceCost;
      result.maintenance.breakdown[id] = maintenanceCost;
    }
  });

  return result;
}

export function searchEquipment(
  query: string,
  filters?: {
    category?: EquipmentCategory;
    manufacturer?: string;
    maxCost?: number;
    certification?: string;
  }
): EquipmentItem[] {
  const allEquipment = { ...EQUIPMENT_CATALOG, ...ADDITIONAL_EQUIPMENT };
  const searchTerm = query.toLowerCase();

  return Object.values(allEquipment).filter(equipment => {
    // Recherche textuelle
    const matchesQuery = !query || 
      equipment.name.fr.toLowerCase().includes(searchTerm) ||
      equipment.name.en.toLowerCase().includes(searchTerm) ||
      equipment.description.fr.toLowerCase().includes(searchTerm) ||
      equipment.description.en.toLowerCase().includes(searchTerm) ||
      equipment.id.toLowerCase().includes(searchTerm);

    // Filtres
    const matchesCategory = !filters?.category || equipment.category === filters.category;
    
    const matchesManufacturer = !filters?.manufacturer || 
      equipment.manufacturer?.some(m => m.toLowerCase().includes(filters.manufacturer!.toLowerCase()));
    
    const matchesCost = !filters?.maxCost || 
      equipment.cost.purchase.min <= filters.maxCost;
    
    const matchesCertification = !filters?.certification ||
      equipment.certifications.some(cert => 
        cert.standard.toLowerCase().includes(filters.certification!.toLowerCase()) ||
        cert.number.toLowerCase().includes(filters.certification!.toLowerCase())
      );

    return matchesQuery && matchesCategory && matchesManufacturer && matchesCost && matchesCertification;
  });
}

export function getEquipmentAlternatives(equipmentId: string): EquipmentItem[] {
  const equipment = getEquipmentInfo(equipmentId);
  if (!equipment || !equipment.alternatives) return [];

  return equipment.alternatives
    .map(altId => getEquipmentInfo(altId))
    .filter((alt): alt is EquipmentItem => alt !== null);
}

export function getCompatibleEquipment(equipmentId: string): EquipmentItem[] {
  const equipment = getEquipmentInfo(equipmentId);
  if (!equipment || !equipment.compatibility) return [];

  return equipment.compatibility
    .map(compId => getEquipmentInfo(compId))
    .filter((comp): comp is EquipmentItem => comp !== null);
}

export function validateEquipmentForPermit(
  permitType: PermitType,
  availableEquipment: string[],
  permitConditions?: Record<string, any>
): {
  isValid: boolean;
  missingMandatory: string[];
  missingConditional: string[];
  recommendations: string[];
} {
  const requirements = getRequiredEquipmentForPermit(permitType);
  if (!requirements) {
    return {
      isValid: false,
      missingMandatory: [],
      missingConditional: [],
      recommendations: []
    };
  }

  // Vérifier équipements obligatoires
  const missingMandatory = requirements.requiredEquipment.mandatory.filter(
    reqId => !availableEquipment.includes(reqId)
  );

  // Vérifier équipements conditionnels
  const missingConditional: string[] = [];
  if (permitConditions) {
    requirements.requiredEquipment.conditional.forEach(conditional => {
      const isRequired = evaluateConditionalEquipment(conditional, permitConditions);
      if (isRequired && !availableEquipment.includes(conditional.equipmentId)) {
        missingConditional.push(conditional.equipmentId);
      }
    });
  }

  // Recommandations (équipements optionnels)
  const recommendations = requirements.requiredEquipment.optional.filter(
    optId => !availableEquipment.includes(optId)
  );

  const isValid = missingMandatory.length === 0 && missingConditional.length === 0;

  return {
    isValid,
    missingMandatory,
    missingConditional,
    recommendations
  };
}

// =================== EXPORT CONSOLIDÉ ===================
export const ALL_EQUIPMENT = { ...EQUIPMENT_CATALOG, ...ADDITIONAL_EQUIPMENT };

export default {
  EQUIPMENT_CATALOG: ALL_EQUIPMENT,
  PERMIT_EQUIPMENT_REQUIREMENTS,
  getEquipmentInfo,
  getRequiredEquipmentForPermit,
  getEquipmentsByCategory,
  checkEquipmentInspectionDue,
  evaluateConditionalEquipment,
  calculateEquipmentCosts,
  searchEquipment,
  getEquipmentAlternatives,
  getCompatibleEquipment,
  validateEquipmentForPermit
};
