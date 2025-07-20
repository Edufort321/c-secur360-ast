// =================== COMPONENTS/STEPS/STEP4PERMITS/CONSTANTS/PERMITTYPES.TS ===================
// Constantes pour les types de permis avec configurations complètes, workflows et exigences

export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export type Province = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== INTERFACES ===================

export interface PermitTypeInfo {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  category: 'safety' | 'environmental' | 'operational' | 'specialized';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  icon: string; // Lucide icon name
  color: string;
  bgColor: string;
  
  // Configuration
  validityPeriod: number; // hours
  maxExtensions: number;
  renewalPeriod: number; // hours before expiry
  
  // Requirements
  requiredPersonnel: PersonnelRequirement[];
  requiredEquipment: string[]; // Equipment IDs
  requiredProcedures: string[]; // Procedure IDs
  requiredTests: string[]; // Atmospheric parameter IDs
  
  // Workflow
  approvalWorkflow: ApprovalStep[];
  inspectionSchedule: InspectionRequirement[];
  
  // Regulatory
  regulatoryReferences: RegulatoryReference[];
  applicableProvinces: Province[];
  
  // Additional
  examples: string[];
  estimatedDuration: number; // minutes
  complexityScore: number; // 1-10
  seasonalRestrictions?: SeasonalRestriction[];
}

export interface PersonnelRequirement {
  role: string;
  minimumCount: number;
  maximumCount?: number;
  requiredCertifications: string[];
  minimumExperience: number; // months
  minimumAge: number;
  isOptional: boolean;
}

export interface ApprovalStep {
  order: number;
  title: { fr: string; en: string };
  roleRequired: string[];
  timeLimit: number; // hours
  escalationAfter: number; // hours
  delegationAllowed: boolean;
  conditions: string[]; // Prerequisites
}

export interface InspectionRequirement {
  frequency: 'before-start' | 'daily' | 'weekly' | 'monthly' | 'completion';
  inspector: string; // Role
  checklist: string[];
  estimatedDuration: number; // minutes
}

export interface RegulatoryReference {
  province: string;
  regulation: string;
  section: string;
  title: { fr: string; en: string };
  url?: string;
  effectiveDate: string;
}

export interface SeasonalRestriction {
  months: number[];
  restrictions: { fr: string; en: string };
  conditions: string[];
}

// =================== TYPES DE PERMIS COMPLETS ===================

export const PERMIT_TYPES: Record<string, PermitTypeInfo> = {
  'espace-clos': {
    id: 'espace-clos',
    name: {
      fr: 'Espace Clos',
      en: 'Confined Space'
    },
    description: {
      fr: 'Permis pour travaux dans des espaces confinés avec atmosphère contrôlée',
      en: 'Permit for work in confined spaces with controlled atmosphere'
    },
    category: 'safety',
    riskLevel: 'critical',
    icon: 'Building',
    color: '#dc2626',
    bgColor: '#fef2f2',
    
    validityPeriod: 8, // 8 hours max
    maxExtensions: 1,
    renewalPeriod: 2, // 2 hours before expiry
    
    requiredPersonnel: [
      {
        role: 'superviseur-espace-clos',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['espace-clos-superviseur', 'premiers-secours'],
        minimumExperience: 60, // 5 years
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'surveillant-espace-clos',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['espace-clos-surveillant', 'premiers-secours'],
        minimumExperience: 24, // 2 years
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'entrant-espace-clos',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['espace-clos-entrant'],
        minimumExperience: 12, // 1 year
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'detecteur-4-gaz-bw',
      'harnais-securite-miller',
      'radio-motorola-cp200d',
      'treuil-sauvetage-3m'
    ],
    
    requiredProcedures: [
      'isolation-espace-clos',
      'tests-atmospheriques-initial',
      'verification-ventilation',
      'communication-continue',
      'procedure-sauvetage'
    ],
    
    requiredTests: ['oxygen', 'lel', 'h2s', 'co', 'temperature'],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Risques', en: 'Risk Assessment' },
        roleRequired: ['superviseur-securite'],
        timeLimit: 24,
        escalationAfter: 48,
        delegationAllowed: false,
        conditions: ['atmospheric-tests-completed', 'equipment-verified']
      },
      {
        order: 2,
        title: { fr: 'Approbation Finale', en: 'Final Approval' },
        roleRequired: ['gestionnaire-securite'],
        timeLimit: 8,
        escalationAfter: 12,
        delegationAllowed: true,
        conditions: ['personnel-assigned', 'procedures-reviewed']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'superviseur-espace-clos',
        checklist: [
          'Tests atmosphériques initial',
          'Vérification équipements sauvetage',
          'Communication radio',
          'Ventilation opérationnelle'
        ],
        estimatedDuration: 30
      },
      {
        frequency: 'daily',
        inspector: 'surveillant-espace-clos',
        checklist: [
          'Tests atmosphériques continus',
          'Surveillance personnel',
          'Vérification ventilation'
        ],
        estimatedDuration: 15
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 297-310',
        title: { fr: 'Espaces Clos', en: 'Confined Spaces' },
        url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013',
        effectiveDate: '2024-01-01'
      },
      {
        province: 'ON',
        regulation: 'O. Reg. 851',
        section: 'Sections 231-236',
        title: { fr: 'Espaces Clos', en: 'Confined Spaces' },
        url: 'https://www.ontario.ca/laws/regulation/851',
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Réservoirs souterrains',
      'Cuves de stockage',
      'Tunnels et égouts',
      'Silos et trémies',
      'Espaces entre ponts navires'
    ],
    
    estimatedDuration: 45,
    complexityScore: 9,
    
    seasonalRestrictions: [
      {
        months: [12, 1, 2], // Winter
        restrictions: { 
          fr: 'Précautions supplémentaires temps froid', 
          en: 'Additional cold weather precautions' 
        },
        conditions: ['heated-equipment', 'extended-warmup-time']
      }
    ]
  },

  'travail-chaud': {
    id: 'travail-chaud',
    name: {
      fr: 'Travail à Chaud',
      en: 'Hot Work'
    },
    description: {
      fr: 'Permis pour soudage, coupage et autres travaux produisant flammes ou étincelles',
      en: 'Permit for welding, cutting and other work producing flames or sparks'
    },
    category: 'safety',
    riskLevel: 'high',
    icon: 'Flame',
    color: '#ea580c',
    bgColor: '#fff7ed',
    
    validityPeriod: 8,
    maxExtensions: 2,
    renewalPeriod: 1,
    
    requiredPersonnel: [
      {
        role: 'superviseur-travail-chaud',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['travail-chaud-superviseur', 'soudage-certifie'],
        minimumExperience: 48,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'surveillant-incendie',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['surveillant-incendie'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'operateur-soudage',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['soudage-certifie'],
        minimumExperience: 24,
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'detecteur-4-gaz-bw',
      'extincteur-co2-5kg',
      'radio-motorola-cp200d'
    ],
    
    requiredProcedures: [
      'evaluation-risques-incendie',
      'installation-surveillance-incendie',
      'verification-zone-travail',
      'communication-continue'
    ],
    
    requiredTests: ['lel', 'oxygen'],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Incendie', en: 'Fire Risk Assessment' },
        roleRequired: ['superviseur-securite'],
        timeLimit: 4,
        escalationAfter: 8,
        delegationAllowed: true,
        conditions: ['area-cleared', 'fire-watch-assigned']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'superviseur-travail-chaud',
        checklist: [
          'Zone dégagée combustibles',
          'Équipements extinction disponibles',
          'Personnel surveillance assigné'
        ],
        estimatedDuration: 20
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 314-319',
        title: { fr: 'Travail à Chaud', en: 'Hot Work' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Soudage électrique/gaz',
      'Coupage plasma/oxyacétylène',
      'Meulage produisant étincelles',
      'Brasage et soudure',
      'Utilisation chalumeaux'
    ],
    
    estimatedDuration: 25,
    complexityScore: 7
  },

  'excavation': {
    id: 'excavation',
    name: {
      fr: 'Excavation',
      en: 'Excavation'
    },
    description: {
      fr: 'Permis pour travaux d\'excavation et de terrassement',
      en: 'Permit for excavation and earthwork operations'
    },
    category: 'safety',
    riskLevel: 'high',
    icon: 'Shovel',
    color: '#a16207',
    bgColor: '#fffbeb',
    
    validityPeriod: 24,
    maxExtensions: 3,
    renewalPeriod: 4,
    
    requiredPersonnel: [
      {
        role: 'personne-competente-excavation',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['personne-competente-excavation'],
        minimumExperience: 60,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'operateur-equipement',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['operateur-equipement-lourd'],
        minimumExperience: 36,
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'radio-motorola-cp200d',
      'barriere-de-securite'
    ],
    
    requiredProcedures: [
      'localisation-services-publics',
      'classification-sol',
      'pentes-etayage',
      'acces-sortie-urgence'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Géotechnique', en: 'Geotechnical Assessment' },
        roleRequired: ['ingenieur-geotechnique'],
        timeLimit: 48,
        escalationAfter: 72,
        delegationAllowed: false,
        conditions: ['soil-analysis', 'utility-clearance']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'daily',
        inspector: 'personne-competente-excavation',
        checklist: [
          'Stabilité parois excavation',
          'Systèmes protection opérationnels',
          'Accès sécuritaires'
        ],
        estimatedDuration: 25
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 3.8.1-3.8.15',
        title: { fr: 'Excavation', en: 'Excavation' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Tranchées services publics',
      'Fondations bâtiments',
      'Bassins rétention',
      'Excavations archéologiques',
      'Travaux routiers'
    ],
    
    estimatedDuration: 35,
    complexityScore: 6
  },

  'levage': {
    id: 'levage',
    name: {
      fr: 'Levage',
      en: 'Lifting'
    },
    description: {
      fr: 'Permis pour opérations de levage avec grues et équipements mobiles',
      en: 'Permit for lifting operations with cranes and mobile equipment'
    },
    category: 'operational',
    riskLevel: 'high',
    icon: 'Crane',
    color: '#2563eb',
    bgColor: '#eff6ff',
    
    validityPeriod: 12,
    maxExtensions: 1,
    renewalPeriod: 2,
    
    requiredPersonnel: [
      {
        role: 'operateur-grue',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['operateur-grue-certifie'],
        minimumExperience: 36,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'signaleur',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['signaleur-certifie'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'rigger',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['rigging-certifie'],
        minimumExperience: 24,
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'radio-motorola-cp200d',
      'elingues-textiles-certifiees'
    ],
    
    requiredProcedures: [
      'pre-inspection-grue',
      'inspection-visuelle-elingues',
      'calcul-charges-levage',
      'plan-levage-detaille'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Plan de Levage', en: 'Lifting Plan' },
        roleRequired: ['ingenieur-levage'],
        timeLimit: 24,
        escalationAfter: 48,
        delegationAllowed: false,
        conditions: ['load-calculations', 'crane-capacity-verified']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'operateur-grue',
        checklist: [
          'Inspection grue complète',
          'Vérification élingues câbles',
          'Test fonctions sécurité'
        ],
        estimatedDuration: 45
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 2.20.1-2.20.15',
        title: { fr: 'Grues Mobiles', en: 'Mobile Cranes' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Levage équipements lourds',
      'Installation structures',
      'Manutention préfabriqués',
      'Démontage équipements',
      'Levage urgence'
    ],
    
    estimatedDuration: 40,
    complexityScore: 8,
    
    seasonalRestrictions: [
      {
        months: [11, 12, 1, 2, 3], // Winter/Spring
        restrictions: { 
          fr: 'Restrictions conditions météo', 
          en: 'Weather condition restrictions' 
        },
        conditions: ['wind-speed-max-40kmh', 'no-ice-conditions']
      }
    ]
  },

  'hauteur': {
    id: 'hauteur',
    name: {
      fr: 'Travail en Hauteur',
      en: 'Work at Height'
    },
    description: {
      fr: 'Permis pour travaux en hauteur avec protection antichute',
      en: 'Permit for work at height with fall protection'
    },
    category: 'safety',
    riskLevel: 'high',
    icon: 'Mountain',
    color: '#7c3aed',
    bgColor: '#faf5ff',
    
    validityPeriod: 8,
    maxExtensions: 2,
    renewalPeriod: 2,
    
    requiredPersonnel: [
      {
        role: 'travail-hauteur-superviseur',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['travail-hauteur-superviseur'],
        minimumExperience: 48,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'travailleur-hauteur',
        minimumCount: 1,
        maximumCount: 5,
        requiredCertifications: ['travail-hauteur-base'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'harnais-securite-miller',
      'radio-motorola-cp200d',
      'echelle-extension-fibre'
    ],
    
    requiredProcedures: [
      'inspection-equipements-antichute',
      'evaluation-points-ancrage',
      'plan-sauvetage-hauteur',
      'procedures-urgence'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Protection Antichute', en: 'Fall Protection Assessment' },
        roleRequired: ['superviseur-securite'],
        timeLimit: 8,
        escalationAfter: 16,
        delegationAllowed: true,
        conditions: ['anchor-points-verified', 'equipment-inspected']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'travail-hauteur-superviseur',
        checklist: [
          'Inspection harnais et équipements',
          'Vérification points d\'ancrage',
          'Plan sauvetage en place'
        ],
        estimatedDuration: 20
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 2.9.1-2.9.7',
        title: { fr: 'Protection contre les chutes', en: 'Fall Protection' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Travaux toiture',
      'Montage structures',
      'Nettoyage façades',
      'Installation équipements',
      'Maintenance tours'
    ],
    
    estimatedDuration: 30,
    complexityScore: 7
  },

  'isolation-energetique': {
    id: 'isolation-energetique',
    name: {
      fr: 'Isolement Énergétique',
      en: 'Energy Isolation'
    },
    description: {
      fr: 'Permis pour isolement énergétique et procédures LOTO',
      en: 'Permit for energy isolation and LOTO procedures'
    },
    category: 'safety',
    riskLevel: 'critical',
    icon: 'Lock',
    color: '#dc2626',
    bgColor: '#fef2f2',
    
    validityPeriod: 12,
    maxExtensions: 1,
    renewalPeriod: 2,
    
    requiredPersonnel: [
      {
        role: 'personne-autorisee-loto',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['loto-procedure'],
        minimumExperience: 24,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'electricien-certifie',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['electricien-certifie'],
        minimumExperience: 60,
        minimumAge: 21,
        isOptional: true
      }
    ],
    
    requiredEquipment: [
      'cadenas-loto-master',
      'testeur-tension-digital'
    ],
    
    requiredProcedures: [
      'identification-sources-energie',
      'sequence-isolement',
      'verification-isolement',
      'pose-cadenas-etiquettes'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Validation Procédure LOTO', en: 'LOTO Procedure Validation' },
        roleRequired: ['superviseur-maintenance'],
        timeLimit: 4,
        escalationAfter: 8,
        delegationAllowed: false,
        conditions: ['energy-sources-identified', 'isolation-verified']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'personne-autorisee-loto',
        checklist: [
          'Sources énergie identifiées',
          'Dispositifs isolement vérifiés',
          'Cadenas et étiquettes en place'
        ],
        estimatedDuration: 30
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 188-194',
        title: { fr: 'Cadenassage', en: 'Lockout' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Maintenance équipements',
      'Réparations électriques',
      'Nettoyage machines',
      'Interventions mécaniques',
      'Modifications installations'
    ],
    
    estimatedDuration: 35,
    complexityScore: 8
  },

  'pression': {
    id: 'pression',
    name: {
      fr: 'Équipements sous Pression',
      en: 'Pressure Equipment'
    },
    description: {
      fr: 'Permis pour travaux sur équipements sous pression',
      en: 'Permit for work on pressure equipment'
    },
    category: 'specialized',
    riskLevel: 'critical',
    icon: 'Gauge',
    color: '#991b1b',
    bgColor: '#fef2f2',
    
    validityPeriod: 6,
    maxExtensions: 0,
    renewalPeriod: 1,
    
    requiredPersonnel: [
      {
        role: 'inspecteur-pression',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['inspecteur-pression-certifie'],
        minimumExperience: 84,
        minimumAge: 25,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'radio-motorola-cp200d'
    ],
    
    requiredProcedures: [
      'depressurisation-complete',
      'purge-systeme',
      'test-etancheite',
      'verification-soupapes'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Certification Pression', en: 'Pressure Certification' },
        roleRequired: ['ingenieur-pression'],
        timeLimit: 12,
        escalationAfter: 24,
        delegationAllowed: false,
        conditions: ['pressure-released', 'system-purged']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'inspecteur-pression',
        checklist: [
          'Pression complètement relâchée',
          'Système purgé et ventilé',
          'Soupapes sécurité vérifiées'
        ],
        estimatedDuration: 45
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'Loi sur les appareils sous pression',
        section: 'Articles 15-28',
        title: { fr: 'Inspection et maintenance', en: 'Inspection and maintenance' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Chaudières industrielles',
      'Réservoirs pression',
      'Compresseurs air',
      'Autoclaves',
      'Systèmes hydrauliques'
    ],
    
    estimatedDuration: 50,
    complexityScore: 9
  },

  'radiographie': {
    id: 'radiographie',
    name: {
      fr: 'Radiographie Industrielle',
      en: 'Industrial Radiography'
    },
    description: {
      fr: 'Permis pour travaux de radiographie industrielle',
      en: 'Permit for industrial radiography work'
    },
    category: 'specialized',
    riskLevel: 'critical',
    icon: 'Radiation',
    color: '#991b1b',
    bgColor: '#fef2f2',
    
    validityPeriod: 4,
    maxExtensions: 0,
    renewalPeriod: 1,
    
    requiredPersonnel: [
      {
        role: 'radiographe-certifie',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['operateur-radio-certifie'],
        minimumExperience: 60,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'assistant-radiographie',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['radioprotection-base'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: true
      }
    ],
    
    requiredEquipment: [
      'dosimetre-personnel-digital',
      'radio-motorola-cp200d',
      'barriere-de-securite'
    ],
    
    requiredProcedures: [
      'delimitation-zone-controlee',
      'surveillance-dosimetrique',
      'procedures-urgence-radiation',
      'entreposage-sources'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Autorisation Radiation', en: 'Radiation Authorization' },
        roleRequired: ['officier-radioprotection'],
        timeLimit: 8,
        escalationAfter: 12,
        delegationAllowed: false,
        conditions: ['area-secured', 'dosimetry-assigned']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'radiographe-certifie',
        checklist: [
          'Zone sécurisée délimitée',
          'Dosimètres assignés',
          'Équipements protection disponibles'
        ],
        estimatedDuration: 40
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'CCSN',
        section: 'REGDOC-2.7.1',
        title: { fr: 'Radioprotection', en: 'Radiation Protection' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Contrôle soudures',
      'Inspection pipelines',
      'Évaluation structures',
      'Contrôle qualité',
      'Tests non destructifs'
    ],
    
    estimatedDuration: 60,
    complexityScore: 10
  },

  'toiture': {
    id: 'toiture',
    name: {
      fr: 'Travaux de Toiture',
      en: 'Roofing Work'
    },
    description: {
      fr: 'Permis pour travaux de toiture et couverture',
      en: 'Permit for roofing and covering work'
    },
    category: 'safety',
    riskLevel: 'high',
    icon: 'Home',
    color: '#059669',
    bgColor: '#ecfdf5',
    
    validityPeriod: 10,
    maxExtensions: 2,
    renewalPeriod: 2,
    
    requiredPersonnel: [
      {
        role: 'couvreur-certifie',
        minimumCount: 1,
        maximumCount: 4,
        requiredCertifications: ['couvreur-certifie'],
        minimumExperience: 36,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'superviseur-toiture',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['travail-hauteur-superviseur'],
        minimumExperience: 60,
        minimumAge: 21,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'harnais-securite-miller',
      'echelle-extension-fibre',
      'radio-motorola-cp200d'
    ],
    
    requiredProcedures: [
      'evaluation-conditions-meteorologiques',
      'inspection-structure-toiture',
      'installation-protection-antichute',
      'plan-evacuation-urgence'
    ],
    
    requiredTests: [],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Structurelle', en: 'Structural Assessment' },
        roleRequired: ['ingenieur-structure'],
        timeLimit: 12,
        escalationAfter: 24,
        delegationAllowed: false,
        conditions: ['weather-cleared', 'structure-verified']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'before-start',
        inspector: 'superviseur-toiture',
        checklist: [
          'Conditions météo acceptables',
          'Structure toiture vérifiée',
          'Équipements antichute installés'
        ],
        estimatedDuration: 25
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 2.9.1-2.9.7',
        title: { fr: 'Protection contre les chutes', en: 'Fall Protection' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Réfection toiture',
      'Installation revêtements',
      'Réparations urgentes',
      'Isolation toiture',
      'Installation équipements'
    ],
    
    estimatedDuration: 35,
    complexityScore: 6,
    
    seasonalRestrictions: [
      {
        months: [11, 12, 1, 2, 3], // Winter
        restrictions: { 
          fr: 'Restrictions conditions hivernales', 
          en: 'Winter weather restrictions' 
        },
        conditions: ['no-ice-snow', 'temperature-above-minus-10']
      }
    ]
  },

  'demolition': {
    id: 'demolition',
    name: {
      fr: 'Démolition',
      en: 'Demolition'
    },
    description: {
      fr: 'Permis pour travaux de démolition et décontamination',
      en: 'Permit for demolition and decontamination work'
    },
    category: 'specialized',
    riskLevel: 'critical',
    icon: 'Hammer',
    color: '#a16207',
    bgColor: '#fffbeb',
    
    validityPeriod: 16,
    maxExtensions: 1,
    renewalPeriod: 4,
    
    requiredPersonnel: [
      {
        role: 'demolisseur-certifie',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['demolisseur-certifie'],
        minimumExperience: 48,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'superviseur-demolition',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['supervision-demolition'],
        minimumExperience: 84,
        minimumAge: 25,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'detecteur-4-gaz-bw',
      'radio-motorola-cp200d',
      'barriere-de-securite',
      'perceuse-percussion-sans-fil'
    ],
    
    requiredProcedures: [
      'evaluation-structure-existante',
      'detection-materiaux-dangereux',
      'plan-demolition-sequence',
      'gestion-dechets-demolition'
    ],
    
    requiredTests: ['lel', 'particulates'],
    
    approvalWorkflow: [
      {
        order: 1,
        title: { fr: 'Évaluation Matériaux Dangereux', en: 'Hazmat Assessment' },
        roleRequired: ['expert-amiante'],
        timeLimit: 48,
        escalationAfter: 72,
        delegationAllowed: false,
        conditions: ['asbestos-survey', 'lead-assessment']
      },
      {
        order: 2,
        title: { fr: 'Plan Démolition', en: 'Demolition Plan' },
        roleRequired: ['ingenieur-structure'],
        timeLimit: 24,
        escalationAfter: 48,
        delegationAllowed: false,
        conditions: ['structural-analysis', 'sequence-approved']
      }
    ],
    
    inspectionSchedule: [
      {
        frequency: 'daily',
        inspector: 'superviseur-demolition',
        checklist: [
          'Zone sécurisée maintenue',
          'Équipements protection utilisés',
          'Séquence démolition respectée'
        ],
        estimatedDuration: 35
      }
    ],
    
    regulatoryReferences: [
      {
        province: 'QC',
        regulation: 'RSST',
        section: 'Articles 3.23.1-3.23.8',
        title: { fr: 'Démolition', en: 'Demolition' },
        effectiveDate: '2024-01-01'
      }
    ],
    
    applicableProvinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
    
    examples: [
      'Démolition bâtiments',
      'Décontamination amiante',
      'Démantèlement structures',
      'Démolition sélective',
      'Préparation sites'
    ],
    
    estimatedDuration: 60,
    complexityScore: 10
  }
};

// =================== CATÉGORIES ET FILTRES ===================

export const PERMIT_CATEGORIES = {
  safety: {
    fr: 'Sécurité',
    en: 'Safety',
    color: '#dc2626',
    icon: 'Shield'
  },
  environmental: {
    fr: 'Environnemental',
    en: 'Environmental',
    color: '#059669',
    icon: 'Leaf'
  },
  operational: {
    fr: 'Opérationnel',
    en: 'Operational',
    color: '#2563eb',
    icon: 'Settings'
  },
  specialized: {
    fr: 'Spécialisé',
    en: 'Specialized',
    color: '#7c3aed',
    icon: 'Star'
  }
} as const;

export const RISK_LEVELS = {
  low: {
    fr: 'Faible',
    en: 'Low',
    color: '#059669',
    bgColor: '#ecfdf5'
  },
  medium: {
    fr: 'Moyen',
    en: 'Medium',
    color: '#d97706',
    bgColor: '#fffbeb'
  },
  high: {
    fr: 'Élevé',
    en: 'High',
    color: '#dc2626',
    bgColor: '#fef2f2'
  },
  critical: {
    fr: 'Critique',
    en: 'Critical',
    color: '#991b1b',
    bgColor: '#fef2f2'
  }
} as const;

// =================== FONCTIONS UTILITAIRES ===================

export function getPermitTypeInfo(permitId: string): PermitTypeInfo | undefined {
  return PERMIT_TYPES[permitId];
}

export function getPermitTypesByCategory(category: string): PermitTypeInfo[] {
  return Object.values(PERMIT_TYPES).filter(permit => permit.category === category);
}

export function getPermitTypesByRiskLevel(riskLevel: string): PermitTypeInfo[] {
  return Object.values(PERMIT_TYPES).filter(permit => permit.riskLevel === riskLevel);
}

export function searchPermitTypes(query: string, language: 'fr' | 'en' = 'fr'): PermitTypeInfo[] {
  const searchTerm = query.toLowerCase();
  return Object.values(PERMIT_TYPES).filter(permit => 
    permit.name[language].toLowerCase().includes(searchTerm) ||
    permit.description[language].toLowerCase().includes(searchTerm) ||
    permit.examples.some(example => example.toLowerCase().includes(searchTerm))
  );
}

export function getRequiredPersonnelForPermit(permitId: string): PersonnelRequirement[] {
  const permit = getPermitTypeInfo(permitId);
  return permit?.requiredPersonnel || [];
}

export function getRequiredEquipmentForPermit(permitId: string): string[] {
  const permit = getPermitTypeInfo(permitId);
  return permit?.requiredEquipment || [];
}

export function getRequiredProceduresForPermit(permitId: string): string[] {
  const permit = getPermitTypeInfo(permitId);
  return permit?.requiredProcedures || [];
}

export function getApprovalWorkflowForPermit(permitId: string): ApprovalStep[] {
  const permit = getPermitTypeInfo(permitId);
  return permit?.approvalWorkflow || [];
}

export function validatePermitConfiguration(permitId: string): {
  isValid: boolean;
  missingPersonnel: string[];
  missingEquipment: string[];
  missingProcedures: string[];
} {
  const permit = getPermitTypeInfo(permitId);
  
  if (!permit) {
    return {
      isValid: false,
      missingPersonnel: [],
      missingEquipment: [],
      missingProcedures: []
    };
  }

  // Basic validation - more complex logic would check actual assignments
  return {
    isValid: true,
    missingPersonnel: [],
    missingEquipment: [],
    missingProcedures: []
  };
}

export function calculatePermitComplexity(permitId: string): {
  score: number;
  factors: {
    personnelComplexity: number;
    equipmentComplexity: number;
    procedureComplexity: number;
    approvalComplexity: number;
  };
} {
  const permit = getPermitTypeInfo(permitId);
  
  if (!permit) {
    return {
      score: 0,
      factors: {
        personnelComplexity: 0,
        equipmentComplexity: 0,
        procedureComplexity: 0,
        approvalComplexity: 0
      }
    };
  }

  const personnelComplexity = permit.requiredPersonnel.length * 2;
  const equipmentComplexity = permit.requiredEquipment.length * 1.5;
  const procedureComplexity = permit.requiredProcedures.length * 1.8;
  const approvalComplexity = permit.approvalWorkflow.length * 3;

  const score = Math.min(10, 
    (personnelComplexity + equipmentComplexity + procedureComplexity + approvalComplexity) / 4
  );

  return {
    score: Math.round(score * 10) / 10,
    factors: {
      personnelComplexity,
      equipmentComplexity,
      procedureComplexity,
      approvalComplexity
    }
  };
}

export function getSeasonalRestrictions(permitId: string, month: number): SeasonalRestriction[] {
  const permit = getPermitTypeInfo(permitId);
  return permit?.seasonalRestrictions?.filter(restriction => 
    restriction.months.includes(month)
  ) || [];
}

export function isPermitValidForProvince(permitId: string, province: string): boolean {
  const permit = getPermitTypeInfo(permitId);
  return permit?.applicableProvinces.includes(province as Province) || false;
}

export function getEstimatedProcessingTime(permitId: string): {
  preparation: number; // minutes
  approval: number; // hours
  total: number; // hours
} {
  const permit = getPermitTypeInfo(permitId);
  
  if (!permit) {
    return { preparation: 0, approval: 0, total: 0 };
  }

  const preparation = permit.estimatedDuration;
  const approval = permit.approvalWorkflow.reduce((total, step) => total + step.timeLimit, 0);
  const total = (preparation / 60) + approval;

  return {
    preparation,
    approval,
    total: Math.round(total * 10) / 10
  };
}

export function getPermitsByComplexity(maxComplexity: number): PermitTypeInfo[] {
  return Object.values(PERMIT_TYPES).filter(permit => permit.complexityScore <= maxComplexity);
}

export function getPermitsForProvince(province: Province): PermitTypeInfo[] {
  return Object.values(PERMIT_TYPES).filter(permit => 
    permit.applicableProvinces.includes(province)
  );
}

export function getPermitsWithSeasonalRestrictions(month: number): PermitTypeInfo[] {
  return Object.values(PERMIT_TYPES).filter(permit => 
    permit.seasonalRestrictions?.some(restriction => 
      restriction.months.includes(month)
    )
  );
}
