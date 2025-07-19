// =================== TYPES/FORMS.TS - FORMULAIRES BILINGUES COMPLETS ===================
// Types pour formulaires spécialisés avec support bilingue intégral

import type { LegalPermit, Entrant, Surveillant, Superviseur } from './permits';
import type { ProvinceCode } from '../constants/provinces';

// =================== INTERFACE PRINCIPALE DONNÉES ATMOSPHÉRIQUES ===================
export interface AtmosphericData {
  oxygene: {
    niveau: number; // Pourcentage O2
    conformeCNESST: boolean; // Selon limites provinciales
    heureTest: string;
    equipementUtilise: string;
    dernierEchec: Date | null;
    tentativeReprise: number;
    enAttente: boolean;
    operateurTest: string;
    certificatEtalonnage: string;
    commentaires?: string;
  };
  gazToxiques: {
    detection: string[]; // Liste gaz détectés
    niveaux: Record<string, number>; // ppm par gaz
    seuils: Record<string, number>; // Limites légales
    conforme: boolean;
    dernierEchec: Date | null;
    tentativeReprise: number;
    enAttente: boolean;
    equipementUtilise: string;
    methodesDetection: string[];
  };
  gazCombustibles: {
    pourcentageLIE: number; // % Limite Inférieure Explosion
    conformeReglement: boolean;
    typeGaz: string;
    equipementTest: string;
    dernierEchec: Date | null;
    tentativeReprise: number;
    enAttente: boolean;
    concentrationMaxDetectee: number;
    heuresDerniereCalibration: number;
  };
  ventilation: {
    active: boolean;
    debitAir: string; // CFM ou m³/min
    directionFlux: 'extraction' | 'insufflation' | 'mixte' | '';
    efficacite: string; // Pourcentage
    typeVentilation: 'naturelle' | 'mecanique' | 'forcee';
    verificationDebit: boolean;
  };
  conditionsEnvironnementales: {
    temperature: number; // Celsius
    humidite: number; // Pourcentage
    pression: number; // kPa
    conditionsMeteo: string;
    visibilite: 'excellente' | 'bonne' | 'reduite' | 'mauvaise';
  };
}

// =================== DONNÉES FORMULAIRE COMPLET BILINGUE ===================
export interface PermitFormData {
  // Section 1: Identification avec textes bilingues
  identification: {
    codePermis: string;
    numeroFormulaire: string;
    lieuTravail: {
      fr: string;
      en: string;
    };
    descriptionTravaux: {
      fr: string;
      en: string;
    };
    dateDebut: string;
    dateFin: string;
    dureeEstimee: string;
    typePermis: PermitType;
    province: ProvinceCode;
    coordinatesGPS?: {
      latitude: number;
      longitude: number;
    };
    adresseComplete: {
      fr: string;
      en: string;
    };
    contactUrgenceLocal: string;
  };

  // Section 2: Personnel avec rôles bilingues
  personnel: {
    superviseur: Superviseur | null;
    surveillants: Surveillant[];
    entrants: Entrant[];
    // Personnel spécialisé selon type de permis
    specialisedPersonnel: {
      surveillantIncendie?: SurveillantIncendie;
      surveillantExterieur?: SurveillantExterieur;
      personneCompetente?: PersonneCompetente;
      operateurGrue?: OperateurGrue;
      electicienQualifie?: ElectricienQualifie;
      inspecteurRadiation?: InspecteurRadiation;
    };
  };

  // Section 3: Tests et mesures
  testsEtMesures: {
    atmospherique: AtmosphericData;
    structurels?: TestsStructurels;
    electriques?: TestsElectriques;
    radiation?: TestsRadiation;
    qualiteSol?: TestsQualiteSol;
  };

  // Section 4: Équipements avec descriptions bilingues
  equipements: {
    protection: EquipementProtection[];
    detection: EquipementDetection[];
    sauvetage: EquipementSauvetage[];
    communication: EquipementCommunication[];
    specialises: Record<PermitType, any>;
  };

  // Section 5: Procédures spécialisées
  procedures: {
    travailChaud?: ProceduresTravailChaud;
    excavation?: ProceduresExcavation;
    espaceClos?: ProceduresEspaceClos;
    levage?: ProceduresLevage;
    hauteur?: ProceduresHauteur;
    loto?: ProceduresLOTO;
    radiographie?: ProceduresRadiographie;
    demolition?: ProceduresDemolition;
  };

  // Section 6: Surveillance avec timers
  surveillance: {
    travauxTermines: boolean;
    heureFin: string;
    surveillanceActive: boolean;
    timerActif: boolean;
    dureeRequise: number; // minutes
    tempsRestant: number;
    interventionEnCours: boolean;
    incidents: IncidentSurveillance[];
    typesSurveillance: string[];
  };

  // Section 7: Validation bilingue et conformité
  validation: {
    tousTestsCompletes: boolean;
    documentationComplete: boolean;
    formationVerifiee: boolean;
    equipementsVerifies: boolean;
    conformeReglementation: boolean;
    signatureResponsable: string;
    dateValidation: string;
    certificationsValides: boolean;
    planUrgenceApprouve: boolean;
    numeroFormulaireFinal: string;
    commentairesValidation: {
      fr: string;
      en: string;
    };
    restrictions: {
      fr: string[];
      en: string[];
    };
  };
}

// =================== TYPES DE PERMIS BILINGUES ===================
export type PermitType = 
  | 'espace-clos' 
  | 'travail-chaud' 
  | 'excavation' 
  | 'levage-grue'
  | 'travail-hauteur'
  | 'loto-electrique'
  | 'equipement-pression'
  | 'radiographie-industrielle'
  | 'travail-toiture'
  | 'demolition';

export const PERMIT_TYPE_LABELS = {
  fr: {
    'espace-clos': 'Espace Clos',
    'travail-chaud': 'Travail à Chaud',
    'excavation': 'Excavation',
    'levage-grue': 'Levage et Grutage',
    'travail-hauteur': 'Travail en Hauteur',
    'loto-electrique': 'Isolation Électrique',
    'equipement-pression': 'Équipement sous Pression',
    'radiographie-industrielle': 'Radiographie Industrielle',
    'travail-toiture': 'Travail sur Toiture',
    'demolition': 'Démolition'
  },
  en: {
    'espace-clos': 'Confined Space',
    'travail-chaud': 'Hot Work',
    'excavation': 'Excavation',
    'levage-grue': 'Lifting & Crane',
    'travail-hauteur': 'Working at Heights',
    'loto-electrique': 'Electrical Isolation',
    'equipement-pression': 'Pressure Equipment',
    'radiographie-industrielle': 'Industrial Radiography',
    'travail-toiture': 'Roofing Work',
    'demolition': 'Demolition'
  }
} as const;

// =================== PERSONNEL SPÉCIALISÉ ÉTENDU ===================
export interface SurveillantIncendie extends Surveillant {
  zoneSurveillance: number; // mètres (11m NFPA 51B)
  equipementIncendie: string[];
  positionStrategique: string;
  formationNFPA: boolean;
  certificatPrevention: string;
  experienceAnnees: number;
}

export interface SurveillantExterieur extends Surveillant {
  visuelMaintenu: boolean;
  ligneVie: boolean;
  planSauvetage: string;
  equipementCommunication: string[];
  formationSauvetage: boolean;
  certificationSecourisme: string;
}

export interface PersonneCompetente extends Superviseur {
  typeExpertise: 'excavation' | 'etancemment' | 'sols' | 'general';
  certificationSpecialisee: string;
  inspectionQuotidienne: boolean;
  planificationSecurite: boolean;
  autorisationProvinciale: string;
}

export interface OperateurGrue {
  id: string;
  nom: string;
  certificationProvinciale: string; // BC Crane Safety, OHSA, etc.
  typeGrues: string[]; // Mobile, Tower, Boom truck
  capaciteMaximale: number; // Tonnes
  experienceAnnees: number;
  formationContinue: boolean;
  cartesCompetence: string[];
  restrictionsMedicales: string[];
}

export interface ElectricienQualifie {
  id: string;
  nom: string;
  licence: string; // Numéro licence provinciale
  specialites: string[]; // Haute tension, basse tension, etc.
  formationLOTO: boolean;
  certificationCSA: string;
  autorisationTravailSous: string[]; // Tensions autorisées
  equipementTest: string[];
}

export interface InspecteurRadiation {
  id: string;
  nom: string;
  licenceCCSN: string; // Commission canadienne sûreté nucléaire
  niveauAutorisation: string;
  dosimetrePersonnel: string;
  formationRadioprotection: boolean;
  equipementDetection: string[];
  proceduresUrgence: string[];
}

// =================== ÉQUIPEMENTS SPÉCIALISÉS BILINGUES ===================
export interface EquipementProtection {
  id: string;
  nom: {
    fr: string;
    en: string;
  };
  type: 'casque' | 'chaussures' | 'gants' | 'veste' | 'lunettes' | 'masque' | 'harnais';
  normeCSA: string;
  obligatoire: boolean;
  dateInspection: string;
  etatEquipement: 'excellent' | 'bon' | 'acceptable' | 'a-remplacer';
  responsableVerification: string;
}

export interface EquipementDetection {
  id: string;
  nom: {
    fr: string;
    en: string;
  };
  type: 'detecteur-gaz' | 'thermometre' | 'luxmetre' | 'dosimetre' | 'multimetre';
  specifications: string;
  dernierEtalonnage: string;
  certificatEtalonnage: string;
  operateurAutorise: string;
  precision: string;
  gammeDetection: string;
}

export interface EquipementSauvetage {
  id: string;
  nom: {
    fr: string;
    en: string;
  };
  type: 'treuil' | 'civiere' | 'ara' | 'echelle' | 'corde' | 'harnais-sauvetage';
  capaciteCharge: string;
  longueurCable?: number;
  derniereInspection: string;
  etatCertification: boolean;
  responsableEntretien: string;
}

export interface EquipementCommunication {
  id: string;
  nom: {
    fr: string;
    en: string;
  };
  type: 'radio' | 'telephone' | 'klaxon' | 'sirene' | 'signalisation';
  frequence?: string;
  portee: string;
  batterie: string;
  testCommunication: boolean;
  proceduresUtilisation: string;
}

// =================== PROCÉDURES SPÉCIALISÉES PAR TYPE ===================
export interface ProceduresTravailChaud {
  zoneDegagee: number; // 11 mètres NFPA 51B
  surveillanceIncendie: boolean;
  surveysPostTravaux: number; // 30 minutes minimum
  equipementEteint: boolean;
  autorisationSuperviseur: boolean;
  materiauxCombustibles: {
    enleves: boolean;
    proteges: boolean;
    arroses: boolean;
    distance: number;
  };
  equipementExtinction: {
    co2Disponible: boolean;
    eauDisponible: boolean;
    couverturesIgnifuges: boolean;
    accessibilite: string;
  };
  conditionsMeteo: {
    ventAcceptable: boolean;
    humiditeOK: boolean;
    temperatureOK: boolean;
  };
}

export interface ProceduresExcavation {
  localisationServices: boolean; // Ontario Reg 213/91 s.228
  noticeRequired: boolean; // >1.2m depth  
  protectionAdjacentes: boolean;
  planIngenieur: boolean;
  accesSortie: boolean; // Échelles max 8m CCOHS
  typeProtection: 'pente' | 'etancemment-bois' | 'etancemment-hydraulique' | 'caisson';
  profondeur: number;
  largeur: number;
  typeSol: string;
  nappe: {
    presente: boolean;
    profondeur?: number;
    pompageRequis: boolean;
  };
  servicesPublics: {
    localises: boolean;
    marques: boolean;
    contactsUrgence: string[];
  };
}

export interface ProceduresEspaceClos {
  analyseContinue: boolean;
  surveillantDesigne: boolean;
  procedureSecours: boolean;
  communicationEtablie: boolean;
  methodeEntree: string;
  methodeSortie: string;
  planSauvetage: string;
  equipementVentilation: {
    type: string;
    debit: string;
    direction: string;
    efficacite: number;
  };
  controleAtmosphere: {
    frequenceTests: number; // minutes
    equipementContinueel: boolean;
    seuilsAlarme: Record<string, number>;
  };
}

export interface ProceduresLevage {
  planLevage: boolean;
  calculCharges: boolean;
  inspectionGrue: boolean;
  operateurCertifie: boolean;
  signaleurDesigne: boolean;
  zoneExclusion: boolean;
  conditionsMeteo: {
    ventMaximum: number; // km/h
    visibiliteMinimum: number; // mètres
    temperatireMinimum: number; // Celsius
  };
  typeGrue: string;
  capaciteUtilisee: number; // Pourcentage capacité max
  rayon: number; // mètres
  hauteur: number; // mètres
  poidCharge: number; // kg
}

export interface ProceduresHauteur {
  hauteurTravail: number; // mètres
  typeProtection: 'garde-corps' | 'harnais' | 'filet' | 'plateforme';
  systemeArret: boolean;
  systemeRetenue: boolean;
  ancrages: {
    certifies: boolean;
    resistance: number; // kN
    inspection: boolean;
    localisation: string[];
  };
  echafaudage: {
    certifie: boolean;
    monte: string; // personne compétente
    inspecte: boolean;
    ancre: boolean;
  };
  conditionsMeteo: {
    ventMaximum: number;
    visibilite: string;
    precipitation: boolean;
  };
}

export interface ProceduresLOTO {
  equipementIdentifie: boolean;
  dispositifsIsolement: string[];
  verificationZeroEnergie: boolean;
  cadenasPoses: boolean;
  etiquettesPosees: boolean;
  personnelAutoriseUniquement: boolean;
  procedureRemiseService: string;
  typesEnergie: ('electrique' | 'pneumatique' | 'hydraulique' | 'mecanique' | 'thermique')[];
  tensions: {
    presente: boolean;
    niveau: number; // VAC
    teste: boolean;
    equipementTest: string;
  };
  energieStockee: {
    condensateurs: boolean;
    ressorts: boolean;
    air_comprime: boolean;
    hydraulique: boolean;
  };
}

export interface ProceduresRadiographie {
  licenceCCSN: boolean;
  zoneControlee: boolean;
  balissageZone: boolean;
  equipementDetection: boolean;
  dosimetresPortes: boolean;
  proceduresUrgence: boolean;
  transportSecurise: boolean;
  surveillanceZone: boolean;
  sourceRadiation: {
    type: string;
    activite: string;
    certificat: string;
    transport: string;
  };
  equipementSurete: {
    detecteurs: string[];
    protection: string[];
    alarmes: string[];
  };
  zoneSurete: {
    perimetreControle: number; // mètres
    perimetreSupervision: number; // mètres
    signalisation: boolean;
    barrieres: boolean;
  };
}

export interface ProceduresDemolition {
  planDemolition: boolean;
  inspectionStructure: boolean;
  isolementServices: boolean;
  controlePoussiere: boolean;
  gestionAmiante: boolean;
  zoneExclusion: boolean;
  equipementsInspectes: boolean;
  gestionDebris: boolean;
  proceduresUrgence: boolean;
  structureAnalysee: {
    ingenieur: string;
    rapport: string;
    recommendations: string[];
    restrictions: string[];
  };
  materinauxDangereux: {
    amiantePresent: boolean;
    plombPresent: boolean;
    autresContaminants: string[];
    planRetrait: string;
    entrepriseSpecialisee: string;
  };
  equipementsDemolition: {
    types: string[];
    inspections: Record<string, string>;
    operateurs: string[];
    certifications: string[];
  };
}

// =================== TESTS SPÉCIALISÉS ===================
export interface TestsStructurels {
  resistanceCalculee: boolean;
  inspectionVisuelle: boolean;
  testsSol: boolean;
  analyseSismique: boolean;
  rapportIngenieur: string;
  dateInspection: string;
  recommendations: string[];
  limitations: string[];
}

export interface TestsElectriques {
  tensionMesuree: number; // VAC
  courantMesure: number; // Ampères
  resistanceIsolement: number; // MΩ
  continuiteTerre: boolean;
  equipementTest: string;
  operateurQualifie: string;
  certificatEtalonnage: string;
  resultatsConformes: boolean;
}

export interface TestsRadiation {
  niveauRadiation: number; // μSv/h
  typeRadiation: string;
  equipementMesure: string;
  operateurAutorise: string;
  zonesTestees: string[];
  resultatsConformes: boolean;
  limitesReglementaires: number;
  proceduresDecontamination: string[];
}

export interface TestsQualiteSol {
  typeSol: string;
  densite: number;
  humidite: number;
  stabilite: string;
  contaminants: string[];
  rapportGeotechnique: string;
  ingenieurSol: string;
  recommendations: string[];
}

// =================== INCIDENTS DE SURVEILLANCE ===================
export interface IncidentSurveillance {
  id: string;
  heure: string;
  description: {
    fr: string;
    en: string;
  };
  actionPrise: {
    fr: string;
    en: string;
  };
  timerRedemarrage: boolean;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  personneSignalant: string;
  temoinPresents: string[];
  photosPrises: boolean;
  rapportComplete: boolean;
}

// =================== OPTIONS DE CRÉATION/RECHERCHE PERMIS ===================
export interface PermitSearchCriteria {
  typePermis?: PermitType[];
  province?: ProvinceCode[];
  statut?: ('draft' | 'submitted' | 'approved' | 'archived')[];
  dateDebut?: string;
  dateFin?: string;
  numeroFormulaire?: string;
  autoriteEmettrice?: string;
  motsCles?: {
    fr: string;
    en: string;
  };
  responsable?: string;
  entreprise?: string;
}

export interface PermitCreationOptions {
  creerNouveau: boolean;
  copierExistant?: string; // ID permis à copier
  modeleUtilise?: string; // Template à utiliser
  langue: 'fr' | 'en';
  province: ProvinceCode;
  typePermis: PermitType;
  urgence: boolean;
  validationRequise: boolean;
  assignerResponsable?: string;
}

// =================== INTERFACE UX DROPDOWN BILINGUE ===================
export interface PermitTypeOption {
  value: PermitType;
  label: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  icon: string;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: {
    fr: string;
    en: string;
  };
  requiredPersonnel: number;
  testingRequired: boolean;
  specialEquipment: boolean;
}

export const PERMIT_DROPDOWN_OPTIONS: PermitTypeOption[] = [
  {
    value: 'espace-clos',
    label: { fr: 'Espace Clos', en: 'Confined Space' },
    description: { 
      fr: 'Permis pour entrée en espaces confinés avec tests atmosphériques obligatoires',
      en: 'Permit for confined space entry with mandatory atmospheric testing'
    },
    icon: '🔒',
    color: '#8b5cf6',
    priority: 'critical',
    estimatedDuration: { fr: '30-60 min', en: '30-60 min' },
    requiredPersonnel: 3,
    testingRequired: true,
    specialEquipment: true
  },
  {
    value: 'travail-chaud',
    label: { fr: 'Travail à Chaud', en: 'Hot Work' },
    description: { 
      fr: 'Soudage, découpage, meulage avec surveillance incendie (NFPA 51B)',
      en: 'Welding, cutting, grinding with fire watch (NFPA 51B)'
    },
    icon: '🔥',
    color: '#ef4444',
    priority: 'critical',
    estimatedDuration: { fr: '15-30 min', en: '15-30 min' },
    requiredPersonnel: 2,
    testingRequired: false,
    specialEquipment: true
  },
  {
    value: 'excavation',
    label: { fr: 'Excavation', en: 'Excavation' },
    description: { 
      fr: 'Travaux d\'excavation >1.2m avec protection et localisation services',
      en: 'Excavation work >1.2m with protection and utility locating'
    },
    icon: '⛏️',
    color: '#f59e0b',
    priority: 'high',
    estimatedDuration: { fr: '20-45 min', en: '20-45 min' },
    requiredPersonnel: 2,
    testingRequired: false,
    specialEquipment: true
  },
  {
    value: 'levage-grue',
    label: { fr: 'Levage et Grutage', en: 'Lifting & Crane' },
    description: { 
      fr: 'Opérations de levage avec grues et opérateurs certifiés',
      en: 'Lifting operations with cranes and certified operators'
    },
    icon: '🏗️',
    color: '#3b82f6',
    priority: 'high',
    estimatedDuration: { fr: '25-40 min', en: '25-40 min' },
    requiredPersonnel: 3,
    testingRequired: true,
    specialEquipment: true
  },
  {
    value: 'travail-hauteur',
    label: { fr: 'Travail en Hauteur', en: 'Working at Heights' },
    description: { 
      fr: 'Travail en hauteur avec protection contre les chutes',
      en: 'Height work with fall protection systems'
    },
    icon: '🪜',
    color: '#22c55e',
    priority: 'high',
    estimatedDuration: { fr: '15-25 min', en: '15-25 min' },
    requiredPersonnel: 2,
    testingRequired: false,
    specialEquipment: true
  },
  {
    value: 'loto-electrique',
    label: { fr: 'Isolation Électrique', en: 'Electrical Isolation' },
    description: { 
      fr: 'Lockout-Tagout pour isolation énergétique sécuritaire ≥50VAC',
      en: 'Lockout-Tagout for safe energy isolation ≥50VAC'
    },
    icon: '⚡',
    color: '#dc2626',
    priority: 'critical',
    estimatedDuration: { fr: '10-20 min', en: '10-20 min' },
    requiredPersonnel: 2,
    testingRequired: true,
    specialEquipment: true
  },
  {
    value: 'equipement-pression',
    label: { fr: 'Équipement sous Pression', en: 'Pressure Equipment' },
    description: { 
      fr: 'Travail sur chaudières et équipements sous pression (CSA B51)',
      en: 'Pressure vessel and boiler work (CSA B51)'
    },
    icon: '🔧',
    color: '#7c3aed',
    priority: 'critical',
    estimatedDuration: { fr: '30-50 min', en: '30-50 min' },
    requiredPersonnel: 3,
    testingRequired: true,
    specialEquipment: true
  },
  {
    value: 'radiographie-industrielle',
    label: { fr: 'Radiographie Industrielle', en: 'Industrial Radiography' },
    description: { 
      fr: 'Radiographie avec protection radiation et licence CCSN',
      en: 'Radiography with radiation protection and CNSC license'
    },
    icon: '☢️',
    color: '#f97316',
    priority: 'critical',
    estimatedDuration: { fr: '45-75 min', en: '45-75 min' },
    requiredPersonnel: 3,
    testingRequired: true,
    specialEquipment: true
  },
  {
    value: 'travail-toiture',
    label: { fr: 'Travail sur Toiture', en: 'Roofing Work' },
    description: { 
      fr: 'Travaux de couverture avec protection spécialisée',
      en: 'Roofing work with specialized protection'
    },
    icon: '🏠',
    color: '#06b6d4',
    priority: 'medium',
    estimatedDuration: { fr: '15-30 min', en: '15-30 min' },
    requiredPersonnel: 2,
    testingRequired: false,
    specialEquipment: true
  },
  {
    value: 'demolition',
    label: { fr: 'Démolition', en: 'Demolition' },
    description: { 
      fr: 'Démolition contrôlée avec gestion amiante et structures',
      en: 'Controlled demolition with asbestos and structural management'
    },
    icon: '🔨',
    color: '#991b1b',
    priority: 'critical',
    estimatedDuration: { fr: '60-90 min', en: '60-90 min' },
    requiredPersonnel: 4,
    testingRequired: true,
    specialEquipment: true
  }
];

// =================== INTERFACES D'ACTION UX ===================
export interface PermitActionContext {
  action: 'create_new' | 'search_existing' | 'copy_existing' | 'import_template';
  selectedType?: PermitType;
  language: 'fr' | 'en';
  province: ProvinceCode;
  userRole: 'admin' | 'supervisor' | 'worker' | 'viewer';
  permissions: string[];
}

export interface PermitSearchResult {
  permits: LegalPermit[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  hasMore: boolean;
  searchTime: number; // ms
  suggestions: {
    fr: string[];
    en: string[];
  };
}

// =================== VALIDATION ET ERREURS BILINGUES ===================
export interface FormValidationError {
  field: string;
  message: {
    fr: string;
    en: string;
  };
  severity: 'warning' | 'error' | 'info';
  suggestion?: {
    fr: string;
    en: string;
  };
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  completionPercentage: number;
  missingRequiredFields: string[];
  estimatedTimeToComplete: {
    fr: string;
    en: string;
  };
}

// =================== EXPORT TYPES ===================
export type {
  PermitFormData,
  PermitType,
  AtmosphericData,
  SurveillantIncendie,
  SurveillantExterieur,
  PersonneCompetente,
  OperateurGrue,
  ElectricienQualifie,
  InspecteurRadiation,
  EquipementProtection,
  EquipementDetection,
  EquipementSauvetage,
  EquipementCommunication,
  ProceduresTravailChaud,
  ProceduresExcavation,
  ProceduresEspaceClos,
  ProceduresLevage,
  ProceduresHauteur,
  ProceduresLOTO,
  ProceduresRadiographie,
  ProceduresDemolition,
  TestsStructurels,
  TestsElectriques,
  TestsRadiation,
  TestsQualiteSol,
  IncidentSurveillance,
  PermitSearchCriteria,
  PermitCreationOptions,
  PermitTypeOption,
  PermitActionContext,
  PermitSearchResult,
  FormValidationError,
  FormValidationResult
};
