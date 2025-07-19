// =================== COMPONENTS/STEPS/STEP4PERMITS/CONSTANTS/PERMITTYPES.TS ===================
// Constantes pour les types de permis avec configurations complètes, workflows et exigences
"use client";

import { LucideIcon } from 'lucide-react';

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
      },
      {
        role: 'secouriste',
        minimumCount: 1,
        maximumCount: 1,
        requiredCertifications: ['premiers-secours-industriel', 'sauvetage-espace-clos'],
        minimumExperience: 36,
        minimumAge: 21,
        isOptional: true // Conditional based on risk assessment
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
      'procedure-sauvetage',
      'autorisation-entree'
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
        requiredCertifications: ['travail-chaud-superviseur', 'soudage-cwb'],
        minimumExperience: 48,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'surveillant-incendie',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['surveillant-incendie', 'extincteur-usage'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'operateur-soudage',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['soudage-cwb'],
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
      },
      {
        order: 2,
        title: { fr: 'Approbation Travaux', en: 'Work Approval' },
        roleRequired: ['superviseur-travail-chaud'],
        timeLimit: 2,
        escalationAfter: 4,
        delegationAllowed: false,
        conditions: ['equipment-ready', 'personnel-briefed']
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
        requiredCertifications: ['grue-mobile-rbq', 'examen-medical-annuel'],
        minimumExperience: 36,
        minimumAge: 21,
        isOptional: false
      },
      {
        role: 'signaleur',
        minimumCount: 1,
        maximumCount: 2,
        requiredCertifications: ['signaleur-grue', 'communication-radio'],
        minimumExperience: 12,
        minimumAge: 18,
        isOptional: false
      },
      {
        role: 'rigger',
        minimumCount: 1,
        maximumCount: 3,
        requiredCertifications: ['rigging-avance'],
        minimumExperience: 24,
        minimumAge: 18,
        isOptional: false
      }
    ],
    
    requiredEquipment: [
      'radio-motorola-cp200d'
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
  return permit?.applicableProvinces.includes(province) || false;
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
