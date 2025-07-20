// =================== CONSTANTS/CERTIFICATIONS.TS - CERTIFICATIONS PAR PROVINCE ET TYPE PERMIS ===================
// Constantes des certifications requises selon réglementations provinciales canadiennes

export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

// =================== INTERFACES ===================
export interface CertificationInfo {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  category: 'safety' | 'technical' | 'medical' | 'regulatory' | 'specialized';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  validityPeriod: number; // mois
  renewalRequirements: { fr: string[]; en: string[] };
  prerequisite?: string[]; // IDs autres certifications
  minimumAge: number;
  trainingHours: number;
  examRequired: boolean;
  practicalTest: boolean;
  medicalExam: boolean;
  issuingBodies: IssuingBody[];
  cost: {
    initial: number;
    renewal: number;
    currency: 'CAD';
  };
  onlineAvailable: boolean;
  continuingEducation: number; // heures par an
  icon: string;
  color: string;
}

export interface IssuingBody {
  organization: string;
  province: string[];
  website: string;
  accreditation: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  processingTime: string; // "2-4 semaines"
  recognition: 'national' | 'provincial' | 'regional';
}

export interface RoleRequirement {
  roleId: string;
  roleName: { fr: string; en: string };
  requiredCertifications: {
    mandatory: string[]; // IDs certifications obligatoires
    optional: string[];  // IDs certifications recommandées
    alternatives: string[][]; // Groupes de certifications alternatives
  };
  experienceRequired: number; // années
  specialConditions?: { fr: string[]; en: string[] };
}

export interface ProvincialCertificationRequirements {
  province: {
    code: string;
    name: { fr: string; en: string };
  };
  regulatoryBody: {
    name: string;
    website: string;
    certificationRegistry: string;
  };
  requirements: Record<PermitType, {
    roles: RoleRequirement[];
    additionalRequirements?: { fr: string[]; en: string[] };
    reciprocity: string[]; // Provinces avec reconnaissance mutuelle
  }>;
  renewalPeriods: Record<string, number>; // ID certification → mois
  gracePeriods: Record<string, number>; // ID certification → jours
  penalties: {
    expiredCertification: { fr: string; en: string };
    falsification: { fr: string; en: string };
    workingWithoutCertification: { fr: string; en: string };
  };
}

// =================== BASE CERTIFICATIONS ===================
export const CERTIFICATIONS_CATALOG: Record<string, CertificationInfo> = {
  'securite-generale': {
    id: 'securite-generale',
    name: { fr: 'Formation sécurité générale', en: 'General Safety Training' },
    description: { 
      fr: 'Formation de base en santé et sécurité au travail',
      en: 'Basic occupational health and safety training'
    },
    category: 'safety',
    level: 'basic',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation de rappel 8 heures', 'Test écrit'],
      en: ['8-hour refresher training', 'Written test']
    },
    minimumAge: 16,
    trainingHours: 30,
    examRequired: true,
    practicalTest: false,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-SGT-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'info@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '1-2 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 350,
      renewal: 150,
      currency: 'CAD'
    },
    onlineAvailable: true,
    continuingEducation: 8,
    icon: '🛡️',
    color: '#3B82F6'
  },

  'premiers-secours': {
    id: 'premiers-secours',
    name: { fr: 'Premiers secours', en: 'First Aid' },
    description: { 
      fr: 'Certification premiers secours et RCR',
      en: 'First aid and CPR certification'
    },
    category: 'medical',
    level: 'basic',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Recertification complète', 'Test pratique RCR'],
      en: ['Complete recertification', 'CPR practical test']
    },
    minimumAge: 16,
    trainingHours: 16,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'Croix-Rouge canadienne',
        province: ['QC', 'ON', 'BC', 'AB'],
        website: 'https://www.croixrouge.ca',
        accreditation: 'CRC-FA-001',
        contactInfo: {
          phone: '1-800-418-1111',
          email: 'info@croixrouge.ca',
          address: 'Bureaux régionaux dans chaque province'
        },
        processingTime: 'Immédiat',
        recognition: 'national'
      }
    ],
    cost: {
      initial: 120,
      renewal: 120,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 0,
    icon: '🏥',
    color: '#DC2626'
  },

  'espace-clos-entrant': {
    id: 'espace-clos-entrant',
    name: { fr: 'Entrant espace clos', en: 'Confined Space Entrant' },
    description: { 
      fr: 'Certification pour entrer dans les espaces clos',
      en: 'Certification to enter confined spaces'
    },
    category: 'safety',
    level: 'intermediate',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation rappel 8h', 'Test écrit et pratique'],
      en: ['8h refresher training', 'Written and practical test']
    },
    prerequisite: ['securite-generale', 'premiers-secours'],
    minimumAge: 18,
    trainingHours: 24,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-ECE-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '2-3 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 450,
      renewal: 200,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 4,
    icon: '🏠',
    color: '#DC2626'
  },

  'soudage-certifie': {
    id: 'soudage-certifie',
    name: { fr: 'Soudage certifié', en: 'Certified Welding' },
    description: { 
      fr: 'Certification soudage selon standards CWB',
      en: 'Welding certification per CWB standards'
    },
    category: 'technical',
    level: 'intermediate',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Test pratique annuel', 'Formation continue 16h'],
      en: ['Annual practical test', '16h continuing education']
    },
    minimumAge: 18,
    trainingHours: 120,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'Canadian Welding Bureau (CWB)',
        province: ['QC', 'ON', 'BC', 'AB'],
        website: 'https://www.cwbgroup.org',
        accreditation: 'CWB-CSA-W47.1',
        contactInfo: {
          phone: '1-800-844-6790',
          email: 'info@cwbgroup.org',
          address: '8260 Parkhill Dr, Milton, ON L9T 5V7'
        },
        processingTime: '4-6 semaines',
        recognition: 'national'
      }
    ],
    cost: {
      initial: 850,
      renewal: 400,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 16,
    icon: '⚡',
    color: '#EA580C'
  },

  'operateur-grue-certifie': {
    id: 'operateur-grue-certifie',
    name: { fr: 'Opérateur de grue certifié', en: 'Certified Crane Operator' },
    description: { 
      fr: 'Certification opérateur grue mobile/fixe',
      en: 'Mobile/fixed crane operator certification'
    },
    category: 'technical',
    level: 'advanced',
    validityPeriod: 60,
    renewalRequirements: {
      fr: ['Examen médical', 'Test pratique', 'Formation continue 24h'],
      en: ['Medical exam', 'Practical test', '24h continuing education']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 21,
    trainingHours: 200,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'Régie du bâtiment du Québec (RBQ)',
        province: ['QC'],
        website: 'https://www.rbq.gouv.qc.ca',
        accreditation: 'RBQ-OG-001',
        contactInfo: {
          phone: '1-800-361-0761',
          email: 'info@rbq.gouv.qc.ca',
          address: '545, boulevard Crémazie Est, Montréal (Québec) H2M 2V2'
        },
        processingTime: '6-8 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 1200,
      renewal: 600,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 24,
    icon: '🏗️',
    color: '#0369A1'
  }
};

// =================== EXIGENCES PAR PROVINCE ===================
export const PROVINCIAL_CERTIFICATION_REQUIREMENTS: Record<string, ProvincialCertificationRequirements> = {
  QC: {
    province: {
      code: 'QC',
      name: { fr: 'Québec', en: 'Quebec' }
    },
    regulatoryBody: {
      name: 'CNESST',
      website: 'https://www.cnesst.gouv.qc.ca',
      certificationRegistry: 'https://www.cnesst.gouv.qc.ca/formation-information/repertoire-formations'
    },
    requirements: {
      'espace-clos': {
        roles: [
          {
            roleId: 'entrants',
            roleName: { fr: 'Entrants autorisés', en: 'Authorized Entrants' },
            requiredCertifications: {
              mandatory: ['espace-clos-entrant'],
              optional: ['premiers-secours'],
              alternatives: []
            },
            experienceRequired: 1
          }
        ],
        reciprocity: ['ON']
      },
      'travail-chaud': {
        roles: [
          {
            roleId: 'operateurs',
            roleName: { fr: 'Opérateurs qualifiés', en: 'Qualified Operators' },
            requiredCertifications: {
              mandatory: ['soudage-certifie'],
              optional: ['securite-generale'],
              alternatives: []
            },
            experienceRequired: 2
          }
        ],
        reciprocity: ['ON']
      },
      'levage': {
        roles: [
          {
            roleId: 'operateur-grue',
            roleName: { fr: 'Opérateur de grue', en: 'Crane Operator' },
            requiredCertifications: {
              mandatory: ['operateur-grue-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 2
          }
        ],
        reciprocity: []
      },
      'excavation': {
        roles: [],
        reciprocity: []
      },
      'hauteur': {
        roles: [],
        reciprocity: []
      },
      'isolation-energetique': {
        roles: [],
        reciprocity: []
      },
      'pression': {
        roles: [],
        reciprocity: []
      },
      'radiographie': {
        roles: [],
        reciprocity: []
      },
      'toiture': {
        roles: [],
        reciprocity: []
      },
      'demolition': {
        roles: [],
        reciprocity: []
      }
    },
    renewalPeriods: {
      'securite-generale': 36,
      'premiers-secours': 36,
      'espace-clos-entrant': 36,
      'soudage-certifie': 24,
      'operateur-grue-certifie': 60
    },
    gracePeriods: {
      'securite-generale': 30,
      'premiers-secours': 30,
      'espace-clos-entrant': 0,
      'soudage-certifie': 15,
      'operateur-grue-certifie': 0
    },
    penalties: {
      expiredCertification: {
        fr: 'Amende 500-2500$ et arrêt travaux jusqu\'à mise en conformité',
        en: '$500-2500 fine and work stoppage until compliance'
      },
      falsification: {
        fr: 'Amende 5000-50000$ et poursuites criminelles possibles',
        en: '$5000-50000 fine and possible criminal charges'
      },
      workingWithoutCertification: {
        fr: 'Amende 1000-10000$ et responsabilité civile accidents',
        en: '$1000-10000 fine and civil liability for accidents'
      }
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
export function getCertificationInfo(certificationId: string): CertificationInfo | null {
  return CERTIFICATIONS_CATALOG[certificationId] || null;
}

export function getRequiredCertificationsForRole(
  permitType: PermitType, 
  roleId: string, 
  province: string
): string[] {
  const provinceReqs = PROVINCIAL_CERTIFICATION_REQUIREMENTS[province];
  if (!provinceReqs || !provinceReqs.requirements[permitType]) {
    return [];
  }

  const role = provinceReqs.requirements[permitType].roles.find(r => r.roleId === roleId);
  return role?.requiredCertifications.mandatory || [];
}

export function validateCertificationExpiry(
  certificationId: string, 
  issueDate: Date, 
  province: string
): {
  isValid: boolean;
  expiryDate: Date;
  daysUntilExpiry: number;
  isInGracePeriod: boolean;
  status: 'valid' | 'expiring-soon' | 'expired' | 'grace-period';
} {
  const certification = getCertificationInfo(certificationId);
  const provinceReqs = PROVINCIAL_CERTIFICATION_REQUIREMENTS[province];
  
  if (!certification || !provinceReqs) {
    return {
      isValid: false,
      expiryDate: new Date(),
      daysUntilExpiry: 0,
      isInGracePeriod: false,
      status: 'expired'
    };
  }

  const validityPeriod = provinceReqs.renewalPeriods[certificationId] || certification.validityPeriod;
  const gracePeriod = provinceReqs.gracePeriods[certificationId] || 0;
  
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + validityPeriod);
  
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  const graceEndDate = new Date(expiryDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriod);
  
  let status: 'valid' | 'expiring-soon' | 'expired' | 'grace-period';
  let isValid: boolean;
  let isInGracePeriod: boolean;
  
  if (now <= expiryDate) {
    isValid = true;
    isInGracePeriod = false;
    status = daysUntilExpiry <= 30 ? 'expiring-soon' : 'valid';
  } else if (gracePeriod > 0 && now <= graceEndDate) {
    isValid = true;
    isInGracePeriod = true;
    status = 'grace-period';
  } else {
    isValid = false;
    isInGracePeriod = false;
    status = 'expired';
  }
  
  return {
    isValid,
    expiryDate,
    daysUntilExpiry,
    isInGracePeriod,
    status
  };
}

// =================== EXPORT DEFAULT ===================
export default CERTIFICATIONS_CATALOG;
