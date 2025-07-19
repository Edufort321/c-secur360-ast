// =================== TYPES/PERMITS.TS ===================
// Types principaux pour les permis de travail officiels

// =================== INTERFACE PRINCIPALE PERMIS ===================
export interface LegalPermit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData?: any;
  code: string;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
    approvedBy?: string;
  };
  compliance: {
    cnesst?: boolean;
    ohsa?: boolean;
    worksafebc?: boolean;
    ohs?: boolean;
  };
}

// =================== TYPES PERSONNEL CONFORMES CNESST/OHSA ===================
export interface Entrant {
  id: string;
  nom: string;
  certification: string;
  age: number; // Minimum 18 ans selon CNESST 2025
  heureEntree?: string;
  heureSortie?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  equipementProtection: string[];
  medicaleClearance: boolean;
  contactUrgence?: string;
}

export interface Surveillant {
  id: string;
  nom: string;
  certification: string;
  contactUrgence: string;
  posteDeSurveillance: string;
  heureDebut?: string;
  heureFin?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  communicationMethod: string;
  emergencyProcedure: string;
}

export interface Superviseur {
  id: string;
  nom: string;
  certification: string;
  numeroPermis: string;
  contactUrgence: string;
  autorisation: string;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  responsabilites: string[];
  experienceAnnees: number;
}

// =================== TYPES SPÉCIFIQUES PAR PERMIS ===================
export interface SurveillantIncendie extends Surveillant {
  zoneSurveillance: number; // mètres
  equipementIncendie: string[];
  positionStrategique: string;
}

export interface SurveillantExterieur extends Surveillant {
  visuelMaintenu: boolean;
  ligneVie: boolean;
  planSauvetage: string;
}

export interface PersonneCompetente extends Superviseur {
  typeExpertise: 'excavation' | 'etancemment' | 'sols' | 'general';
  certificationSpecialisee: string;
  inspectionQuotidienne: boolean;
}

// =================== STATUTS ET PRIORITÉS ===================
export type PermitStatus = 'draft' | 'submitted' | 'approved' | 'archived';
export type PermitPriority = 'low' | 'medium' | 'high' | 'critical';
export type PermitCategory = 'Espaces Clos' | 'Travail à Chaud' | 'Excavation' | 'Hauteur';

// =================== TYPES DE COMPLIANCE ===================
export interface ComplianceInfo {
  cnesst?: boolean;
  ohsa?: boolean;
  worksafebc?: boolean;
  ohs?: boolean;
  regulation: string;
  lastUpdated: string;
  mandatoryDocuments: string[];
  penalties: string;
}

// =================== VALIDITÉ ET SIGNATURES ===================
export interface PermitValidity {
  startDate: string;
  endDate: string;
  isValid: boolean;
  approvedBy?: string;
  approvalDate?: string;
  renewalRequired?: boolean;
  restrictionsSpeciales?: string[];
}

export interface SignatureElectronique {
  nom: string;
  titre: string;
  organisation: string;
  dateSignature: string;
  adresseIP?: string;
  empreinteNumerique: string;
}

// =================== TYPES POUR STATISTIQUES ===================
export interface PermitStats {
  totalPermits: number;
  submitted: number;
  approved: number;
  archived: number;
  byCategory: Record<string, number>;
  byProvince: Record<string, number>;
  byStatus: Record<PermitStatus, number>;
}

// =================== PROPS DES COMPOSANTS ===================
export interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

export interface PermitCardProps {
  permit: LegalPermit;
  language: 'fr' | 'en';
  onSelect: (permitId: string) => void;
  onEdit: (permitId: string) => void;
  onDelete: (permitId: string) => void;
  onArchive: (permitId: string) => void;
  onDuplicate: (permitId: string) => void;
  isLoading?: boolean;
}

export interface PermitFormProps {
  permit: LegalPermit;
  onFormChange: (data: any) => void;
  language: 'fr' | 'en';
  onClose: () => void;
  onSave?: (data: any) => Promise<{ success: boolean; message: string }>;
}

// =================== EXPORT DE TOUS LES TYPES ===================
export type {
  LegalPermit,
  Entrant,
  Surveillant,
  Superviseur,
  SurveillantIncendie,
  SurveillantExterieur,
  PersonneCompetente,
  PermitStatus,
  PermitPriority,
  PermitCategory,
  ComplianceInfo,
  PermitValidity,
  SignatureElectronique,
  PermitStats,
  Step4PermitsProps,
  PermitCardProps,
  PermitFormProps
};
