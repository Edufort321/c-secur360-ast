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
  // =================== CERTIFICATIONS SÉCURITÉ GÉNÉRALE ===================
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
      },
      {
        organization: 'Ministry of Labour',
        province: ['ON'],
        website: 'https://www.labour.gov.on.ca',
        accreditation: 'MOL-SGT-001',
        contactInfo: {
          phone: '1-877-202-0008',
          email: 'info@labour.gov.on.ca',
          address: '400 University Ave, Toronto, ON M7A 1T7'
        },
        processingTime: '2-3 semaines',
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
        province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
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

  // =================== CERTIFICATIONS ESPACE CLOS ===================
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

  'espace-clos-surveillant': {
    id: 'espace-clos-surveillant',
    name: { fr: 'Surveillant espace clos', en: 'Confined Space Attendant' },
    description: { 
      fr: 'Certification surveillant extérieur espace clos',
      en: 'Confined space external attendant certification'
    },
    category: 'safety',
    level: 'intermediate',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation rappel 8h', 'Test procédures urgence'],
      en: ['8h refresher training', 'Emergency procedures test']
    },
    prerequisite: ['espace-clos-entrant'],
    minimumAge: 19,
    trainingHours: 16,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-ECS-001',
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
      initial: 350,
      renewal: 175,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 4,
    icon: '👁️',
    color: '#EA580C'
  },

  'espace-clos-superviseur': {
    id: 'espace-clos-superviseur',
    name: { fr: 'Superviseur entrée espace clos', en: 'Confined Space Entry Supervisor' },
    description: { 
      fr: 'Certification superviseur autorisant entrée espace clos',
      en: 'Confined space entry authorization supervisor certification'
    },
    category: 'safety',
    level: 'advanced',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation rappel 16h', 'Test réglementations', 'Évaluation pratique'],
      en: ['16h refresher training', 'Regulations test', 'Practical evaluation']
    },
    prerequisite: ['espace-clos-surveillant'],
    minimumAge: 21,
    trainingHours: 40,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-ECSU-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'superviseurs@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '3-4 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 650,
      renewal: 300,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 8,
    icon: '👨‍💼',
    color: '#7C2D12'
  },

  // =================== CERTIFICATIONS TRAVAIL À CHAUD ===================
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
        province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'],
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

  'surveillant-incendie': {
    id: 'surveillant-incendie',
    name: { fr: 'Surveillant incendie', en: 'Fire Watch' },
    description: { 
      fr: 'Certification surveillance incendie travaux à chaud',
      en: 'Fire watch certification for hot work'
    },
    category: 'safety',
    level: 'basic',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Formation rappel 4h', 'Test extincteurs'],
      en: ['4h refresher training', 'Extinguisher test']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 8,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-SI-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '1-2 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 250,
      renewal: 125,
      currency: 'CAD'
    },
    onlineAvailable: true,
    continuingEducation: 2,
    icon: '🔥',
    color: '#DC2626'
  },

  'travail-chaud-superviseur': {
    id: 'travail-chaud-superviseur',
    name: { fr: 'Superviseur travail à chaud', en: 'Hot Work Supervisor' },
    description: { 
      fr: 'Supervision et autorisation travaux à chaud',
      en: 'Hot work supervision and authorization'
    },
    category: 'safety',
    level: 'advanced',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation rappel 12h', 'Évaluation risques incendie'],
      en: ['12h refresher training', 'Fire risk assessment']
    },
    prerequisite: ['soudage-certifie', 'surveillant-incendie'],
    minimumAge: 21,
    trainingHours: 32,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-TCSU-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'superviseurs@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '3-4 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 550,
      renewal: 275,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 6,
    icon: '👨‍🔧',
    color: '#7C2D12'
  },

  // =================== CERTIFICATIONS LEVAGE ===================
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
      },
      {
        organization: 'Technical Standards and Safety Authority (TSSA)',
        province: ['ON'],
        website: 'https://www.tssa.org',
        accreditation: 'TSSA-CO-001',
        contactInfo: {
          phone: '1-877-682-8772',
          email: 'customer.service@tssa.org',
          address: '3300 Bloor St W, Toronto, ON M8X 2X4'
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
  },

  'signaleur-certifie': {
    id: 'signaleur-certifie',
    name: { fr: 'Signaleur certifié', en: 'Certified Signaler' },
    description: { 
      fr: 'Certification signaleur opérations levage',
      en: 'Lifting operations signaler certification'
    },
    category: 'safety',
    level: 'intermediate',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Test gestuelle', 'Formation rappel 8h'],
      en: ['Hand signals test', '8h refresher training']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 16,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-SC-001',
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
      initial: 300,
      renewal: 150,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 4,
    icon: '👋',
    color: '#059669'
  },

  'rigging-certifie': {
    id: 'rigging-certifie',
    name: { fr: 'Élingage certifié', en: 'Certified Rigging' },
    description: { 
      fr: 'Certification élingage et arrimage charges',
      en: 'Load rigging and securing certification'
    },
    category: 'technical',
    level: 'intermediate',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Test calculs charges', 'Inspection équipements'],
      en: ['Load calculation test', 'Equipment inspection']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 40,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-RC-001',
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
      renewal: 225,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 8,
    icon: '🔗',
    color: '#7C3AED'
  },

  // =================== AUTRES CERTIFICATIONS ===================
  'personne-competente-excavation': {
    id: 'personne-competente-excavation',
    name: { fr: 'Personne compétente excavation', en: 'Excavation Competent Person' },
    description: { 
      fr: 'Certification personne compétente sécurité excavation',
      en: 'Excavation safety competent person certification'
    },
    category: 'safety',
    level: 'expert',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation sols 16h', 'Évaluation terrain', 'Test réglementations'],
      en: ['16h soil training', 'Site assessment', 'Regulations test']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 25,
    trainingHours: 80,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-PCE-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '4-6 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 750,
      renewal: 375,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 16,
    icon: '⛏️',
    color: '#A16207'
  },

  'travail-hauteur-superviseur': {
    id: 'travail-hauteur-superviseur',
    name: { fr: 'Superviseur travail hauteur', en: 'Work at Height Supervisor' },
    description: { 
      fr: 'Supervision sécurité travail en hauteur',
      en: 'Work at height safety supervision'
    },
    category: 'safety',
    level: 'advanced',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation systèmes antichute', 'Inspection équipements'],
      en: ['Fall protection systems training', 'Equipment inspection']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 21,
    trainingHours: 32,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-THS-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '3-4 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 500,
      renewal: 250,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 8,
    icon: '🪜',
    color: '#7C2D12'
  },

  'electricien-certifie': {
    id: 'electricien-certifie',
    name: { fr: 'Électricien certifié', en: 'Certified Electrician' },
    description: { 
      fr: 'Licence électricien selon province',
      en: 'Provincial electrician license'
    },
    category: 'technical',
    level: 'expert',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation continue 30h', 'Examen réglementations'],
      en: ['30h continuing education', 'Regulations exam']
    },
    minimumAge: 18,
    trainingHours: 8000,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'Corporation des maîtres électriciens du Québec (CMEQ)',
        province: ['QC'],
        website: 'https://www.cmeq.org',
        accreditation: 'CMEQ-EC-001',
        contactInfo: {
          phone: '514-738-2184',
          email: 'info@cmeq.org',
          address: '5925, boulevard Décarie, Montréal (Québec) H3W 3C9'
        },
        processingTime: '8-12 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 800,
      renewal: 400,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 30,
    icon: '⚡',
    color: '#7C3AED'
  },

  'loto-procedure': {
    id: 'loto-procedure',
    name: { fr: 'Procédures LOTO', en: 'LOTO Procedures' },
    description: { 
      fr: 'Cadenassage et étiquetage sécuritaire',
      en: 'Lockout tagout safety procedures'
    },
    category: 'safety',
    level: 'intermediate',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Formation rappel 8h', 'Test procédures'],
      en: ['8h refresher training', 'Procedures test']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 16,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-LOTO-001',
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
      initial: 350,
      renewal: 175,
      currency: 'CAD'
    },
    onlineAvailable: true,
    continuingEducation: 4,
    icon: '🔐',
    color: '#DC2626'
  // =================== AUTRES CERTIFICATIONS COMPLÈTES ===================
  'inspecteur-pression-certifie': {
    id: 'inspecteur-pression-certifie',
    name: { fr: 'Inspecteur équipements pression', en: 'Pressure Equipment Inspector' },
    description: { 
      fr: 'Inspection équipements sous pression CSA B51',
      en: 'CSA B51 pressure equipment inspection'
    },
    category: 'technical',
    level: 'expert',
    validityPeriod: 60,
    renewalRequirements: {
      fr: ['Formation continue 40h', 'Examen CSA B51'],
      en: ['40h continuing education', 'CSA B51 exam']
    },
    minimumAge: 25,
    trainingHours: 120,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'Association canadienne de normalisation (CSA)',
        province: ['QC', 'ON', 'BC', 'AB'],
        website: 'https://www.csagroup.org',
        accreditation: 'CSA-B51-001',
        contactInfo: {
          phone: '1-800-463-6727',
          email: 'certification@csagroup.org',
          address: '178 Rexdale Blvd, Toronto, ON M9W 1R3'
        },
        processingTime: '6-8 semaines',
        recognition: 'national'
      }
    ],
    cost: {
      initial: 1500,
      renewal: 750,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 40,
    icon: '🔧',
    color: '#059669'
  },

  'operateur-radio-certifie': {
    id: 'operateur-radio-certifie',
    name: { fr: 'Opérateur radiographie certifié', en: 'Certified Radiography Operator' },
    description: { 
      fr: 'Opérateur sources radioactives industrielles',
      en: 'Industrial radioactive sources operator'
    },
    category: 'specialized',
    level: 'expert',
    validityPeriod: 60,
    renewalRequirements: {
      fr: ['Formation radioprotection 24h', 'Examen médical annuel'],
      en: ['24h radiation protection training', 'Annual medical exam']
    },
    minimumAge: 21,
    trainingHours: 160,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'Commission canadienne de sûreté nucléaire (CCSN)',
        province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'NT', 'NU', 'YT'],
        website: 'https://www.cnsc-ccsn.gc.ca',
        accreditation: 'CCSN-ORN-001',
        contactInfo: {
          phone: '613-995-5894',
          email: 'info@cnsc-ccsn.gc.ca',
          address: '280 Slater Street, Ottawa, ON K1P 5S9'
        },
        processingTime: '12-16 semaines',
        recognition: 'national'
      }
    ],
    cost: {
      initial: 2500,
      renewal: 1250,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 24,
    icon: '☢️',
    color: '#BE185D'
  },

  'couvreur-certifie': {
    id: 'couvreur-certifie',
    name: { fr: 'Couvreur certifié', en: 'Certified Roofer' },
    description: { 
      fr: 'Certification travaux toiture et couverture',
      en: 'Roofing and covering work certification'
    },
    category: 'technical',
    level: 'intermediate',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation matériaux 16h', 'Test sécurité hauteur'],
      en: ['16h materials training', 'Height safety test']
    },
    prerequisite: ['securite-generale', 'travail-hauteur-superviseur'],
    minimumAge: 18,
    trainingHours: 80,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'Corporation des maîtres couvreurs du Québec (CMCQ)',
        province: ['QC'],
        website: 'https://www.cmcq.org',
        accreditation: 'CMCQ-CC-001',
        contactInfo: {
          phone: '514-527-7491',
          email: 'info@cmcq.org',
          address: '7905, boulevard Louis-H.-La Fontaine, Anjou (Québec) H1K 4E4'
        },
        processingTime: '4-6 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 600,
      renewal: 300,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 16,
    icon: '🏠',
    color: '#1F2937'
  },

  'demolisseur-certifie': {
    id: 'demolisseur-certifie',
    name: { fr: 'Démolisseur certifié', en: 'Certified Demolition Worker' },
    description: { 
      fr: 'Certification démolition et décontamination',
      en: 'Demolition and decontamination certification'
    },
    category: 'specialized',
    level: 'advanced',
    validityPeriod: 36,
    renewalRequirements: {
      fr: ['Formation amiante 8h', 'Test dangers démolition'],
      en: ['8h asbestos training', 'Demolition hazards test']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 21,
    trainingHours: 60,
    examRequired: true,
    practicalTest: true,
    medicalExam: true,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-DC-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '4-6 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 750,
      renewal: 375,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 8,
    icon: '🏗️',
    color: '#991B1B'
  },

  // =================== CERTIFICATIONS ADDITIONNELLES ===================
  'gaz-detection': {
    id: 'gaz-detection',
    name: { fr: 'Détection de gaz', en: 'Gas Detection' },
    description: { 
      fr: 'Utilisation détecteurs multi-gaz portables',
      en: 'Portable multi-gas detector usage'
    },
    category: 'technical',
    level: 'intermediate',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Calibrage équipements', 'Test fonctionnement'],
      en: ['Equipment calibration', 'Function testing']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 12,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-GD-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '1-2 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 200,
      renewal: 100,
      currency: 'CAD'
    },
    onlineAvailable: true,
    continuingEducation: 2,
    icon: '🔍',
    color: '#6B7280'
  },

  'equipements-protection': {
    id: 'equipements-protection',
    name: { fr: 'Équipements de protection individuelle', en: 'Personal Protective Equipment' },
    description: { 
      fr: 'Sélection et utilisation EPI selon risques',
      en: 'PPE selection and usage per risk assessment'
    },
    category: 'safety',
    level: 'basic',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Mise à jour équipements', 'Formation nouvelle technologie'],
      en: ['Equipment updates', 'New technology training']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 16,
    trainingHours: 8,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-EPI-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '1 semaine',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 150,
      renewal: 75,
      currency: 'CAD'
    },
    onlineAvailable: true,
    continuingEducation: 2,
    icon: '🦺',
    color: '#F59E0B'
  },

  'communication-urgence': {
    id: 'communication-urgence',
    name: { fr: 'Communications d\'urgence', en: 'Emergency Communications' },
    description: { 
      fr: 'Systèmes communication et procédures urgence',
      en: 'Communication systems and emergency procedures'
    },
    category: 'safety',
    level: 'basic',
    validityPeriod: 24,
    renewalRequirements: {
      fr: ['Test équipements', 'Simulation urgence'],
      en: ['Equipment testing', 'Emergency simulation']
    },
    prerequisite: ['securite-generale'],
    minimumAge: 18,
    trainingHours: 8,
    examRequired: true,
    practicalTest: true,
    medicalExam: false,
    issuingBodies: [
      {
        organization: 'CNESST',
        province: ['QC'],
        website: 'https://www.cnesst.gouv.qc.ca',
        accreditation: 'CNESST-CU-001',
        contactInfo: {
          phone: '1-844-838-0808',
          email: 'formation@cnesst.gouv.qc.ca',
          address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
        },
        processingTime: '1-2 semaines',
        recognition: 'provincial'
      }
    ],
    cost: {
      initial: 200,
      renewal: 100,
      currency: 'CAD'
    },
    onlineAvailable: false,
    continuingEducation: 2,
    icon: '📻',
    color: '#10B981'
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
      name: 'CNESST - Commission des normes, de l\'équité, de la santé et de la sécurité du travail',
      website: 'https://www.cnesst.gouv.qc.ca',
      certificationRegistry: 'https://www.cnesst.gouv.qc.ca/formation-information/repertoire-formations'
    },
    requirements: {
      'espace-clos': {
        roles: [
          {
            roleId: 'superviseur',
            roleName: { fr: 'Superviseur d\'entrée', en: 'Entry Supervisor' },
            requiredCertifications: {
              mandatory: ['espace-clos-superviseur', 'premiers-secours'],
              optional: ['securite-generale'],
              alternatives: []
            },
            experienceRequired: 5,
            specialConditions: {
              fr: ['Minimum 21 ans', 'Expérience 5 ans espaces clos'],
              en: ['Minimum 21 years old', '5 years confined space experience']
            }
          },
          {
            roleId: 'surveillant',
            roleName: { fr: 'Surveillant extérieur', en: 'External Attendant' },
            requiredCertifications: {
              mandatory: ['espace-clos-surveillant', 'premiers-secours'],
              optional: ['securite-generale'],
              alternatives: []
            },
            experienceRequired: 2
          },
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
        additionalRequirements: {
          fr: [
            'Formation annuelle obligatoire selon RSST art. 297-310',
            'Évaluation médicale annuelle pour entrants',
            'Registre formations tenu à jour'
          ],
          en: [
            'Annual mandatory training per RSST art. 297-310',
            'Annual medical evaluation for entrants',
            'Updated training registry maintained'
          ]
        },
        reciprocity: ['ON', 'NB']
      },
      'travail-chaud': {
        roles: [
          {
            roleId: 'superviseur',
            roleName: { fr: 'Superviseur travail à chaud', en: 'Hot Work Supervisor' },
            requiredCertifications: {
              mandatory: ['travail-chaud-superviseur', 'surveillant-incendie'],
              optional: ['soudage-certifie'],
              alternatives: []
            },
            experienceRequired: 3
          },
          {
            roleId: 'surveillant-incendie',
            roleName: { fr: 'Surveillant incendie', en: 'Fire Watch' },
            requiredCertifications: {
              mandatory: ['surveillant-incendie'],
              optional: ['premiers-secours'],
              alternatives: []
            },
            experienceRequired: 1
          },
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
            experienceRequired: 2,
            specialConditions: {
              fr: ['Licence RBQ valide', 'Examen médical annuel'],
              en: ['Valid RBQ license', 'Annual medical exam']
            }
          },
          {
            roleId: 'signaleur',
            roleName: { fr: 'Signaleur certifié', en: 'Certified Signaler' },
            requiredCertifications: {
              mandatory: ['signaleur-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 1
          },
          {
            roleId: 'riggers',
            roleName: { fr: 'Riggers qualifiés', en: 'Qualified Riggers' },
            requiredCertifications: {
              mandatory: ['rigging-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 2
          }
        ],
        reciprocity: ['ON']
      },
      'excavation': {
        roles: [
          {
            roleId: 'personne-competente',
            roleName: { fr: 'Personne compétente', en: 'Competent Person' },
            requiredCertifications: {
              mandatory: ['personne-competente-excavation'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 5,
            specialConditions: {
              fr: ['Formation géotechnique recommandée', 'Minimum 25 ans'],
              en: ['Geotechnical training recommended', 'Minimum 25 years old']
            }
          }
        ],
        reciprocity: []
      },
      'hauteur': {
        roles: [
          {
            roleId: 'superviseur-hauteur',
            roleName: { fr: 'Superviseur travail hauteur', en: 'Work at Height Supervisor' },
            requiredCertifications: {
              mandatory: ['travail-hauteur-superviseur'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 3
          }
        ],
        reciprocity: ['ON']
      },
      'isolation-energetique': {
        roles: [
          {
            roleId: 'electricien-qualifie',
            roleName: { fr: 'Électricien qualifié', en: 'Qualified Electrician' },
            requiredCertifications: {
              mandatory: ['electricien-certifie', 'loto-procedure'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 3,
            specialConditions: {
              fr: ['Licence CMEQ valide', 'Formation LOTO spécialisée'],
              en: ['Valid CMEQ license', 'Specialized LOTO training']
            }
          }
        ],
        reciprocity: []
      },
      'pression': {
        roles: [
          {
            roleId: 'inspecteur-pression',
            roleName: { fr: 'Inspecteur équipements pression', en: 'Pressure Equipment Inspector' },
            requiredCertifications: {
              mandatory: ['inspecteur-pression-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 5
          }
        ],
        reciprocity: []
      },
      'radiographie': {
        roles: [
          {
            roleId: 'operateur-radio',
            roleName: { fr: 'Opérateur radiographie', en: 'Radiography Operator' },
            requiredCertifications: {
              mandatory: ['operateur-radio-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 2
          }
        ],
        reciprocity: []
      },
      'toiture': {
        roles: [
          {
            roleId: 'couvreur-certifie',
            roleName: { fr: 'Couvreur certifié', en: 'Certified Roofer' },
            requiredCertifications: {
              mandatory: ['couvreur-certifie', 'travail-hauteur-superviseur'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 2
          }
        ],
        reciprocity: []
      },
      'demolition': {
        roles: [
          {
            roleId: 'demolisseur-certifie',
            roleName: { fr: 'Démolisseur certifié', en: 'Certified Demolition Worker' },
            requiredCertifications: {
              mandatory: ['demolisseur-certifie'],
              optional: [],
              alternatives: []
            },
            experienceRequired: 3,
            specialConditions: {
              fr: ['Formation amiante obligatoire', 'Surveillance médicale'],
              en: ['Mandatory asbestos training', 'Medical surveillance']
            }
          }
        ],
        reciprocity: []
      }
    },
    renewalPeriods: {
      'securite-generale': 36,
      'premiers-secours': 36,
      'espace-clos-entrant': 36,
      'espace-clos-surveillant': 36,
      'espace-clos-superviseur': 36,
      'soudage-certifie': 24,
      'surveillant-incendie': 24,
      'travail-chaud-superviseur': 36,
      'operateur-grue-certifie': 60,
      'signaleur-certifie': 36,
      'rigging-certifie': 36,
      'personne-competente-excavation': 36,
      'travail-hauteur-superviseur': 36,
      'electricien-certifie': 36,
      'loto-procedure': 24,
      'inspecteur-pression-certifie': 60,
      'operateur-radio-certifie': 60,
      'couvreur-certifie': 36,
      'demolisseur-certifie': 36,
      'gaz-detection': 24,
      'equipements-protection': 24,
      'communication-urgence': 24
    },
    gracePeriods: {
      'securite-generale': 30,
      'premiers-secours': 30,
      'espace-clos-entrant': 0,
      'espace-clos-surveillant': 0,
      'espace-clos-superviseur': 0,
      'soudage-certifie': 15,
      'surveillant-incendie': 0,
      'travail-chaud-superviseur': 0,
      'operateur-grue-certifie': 0,
      'signaleur-certifie': 15,
      'rigging-certifie': 15,
      'personne-competente-excavation': 0,
      'travail-hauteur-superviseur': 0,
      'electricien-certifie': 0,
      'loto-procedure': 0,
      'inspecteur-pression-certifie': 0,
      'operateur-radio-certifie': 0,
      'couvreur-certifie': 15,
      'demolisseur-certifie': 0,
      'gaz-detection': 7,
      'equipements-protection': 15,
      'communication-urgence': 7
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

export function checkPrerequisites(
  certificationId: string, 
  heldCertifications: string[]
): {
  hasPrerequisites: boolean;
  missingPrerequisites: string[];
} {
  const certification = getCertificationInfo(certificationId);
  
  if (!certification || !certification.prerequisite) {
    return {
      hasPrerequisites: true,
      missingPrerequisites: []
    };
  }
  
  const missingPrerequisites = certification.prerequisite.filter(
    prereq => !heldCertifications.includes(prereq)
  );
  
  return {
    hasPrerequisites: missingPrerequisites.length === 0,
    missingPrerequisites
  };
}

export function calculateCertificationCost(
  certificationId: string, 
  isRenewal: boolean = false
): number {
  const certification = getCertificationInfo(certificationId);
  
  if (!certification) {
    return 0;
  }
  
  return isRenewal ? certification.cost.renewal : certification.cost.initial;
}

export function getCertificationsByCategory(category: CertificationInfo['category']): CertificationInfo[] {
  return Object.values(CERTIFICATIONS_CATALOG).filter(cert => cert.category === category);
}

export function searchCertifications(query: string, language: 'fr' | 'en'): CertificationInfo[] {
  const searchTerm = query.toLowerCase();
  
  return Object.values(CERTIFICATIONS_CATALOG).filter(cert => 
    cert.name[language].toLowerCase().includes(searchTerm) ||
    cert.description[language].toLowerCase().includes(searchTerm) ||
    cert.id.toLowerCase().includes(searchTerm)
  );
}

// =================== EXPORT DEFAULT ===================
export default CERTIFICATIONS_CATALOG;
