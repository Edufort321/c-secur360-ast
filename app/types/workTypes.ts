// app/types/workTypes.ts

// =================== TYPES DE TRAVAUX ===================
export interface WorkType {
  id: string;
  name: string;
  displayName?: { fr: string; en: string };
  category: WorkTypeCategory;
  subcategory?: string;
  description: string;
  icon: string;
  iconUrl?: string;
  
  // Dangers de base associés
  baseHazards: string[]; // IDs des dangers
  criticalHazards?: string[]; // Dangers critiques spécifiques
  
  // Permis et autorisations
  requiredPermits: string[];
  optionalPermits?: string[];
  
  // Équipements obligatoires
  requiredEquipment: string[];
  recommendedEquipment?: string[];
  
  // Certifications requises
  certifications: string[];
  optionalCertifications?: string[];
  
  // Configuration équipe
  minimumTeamSize: number;
  recommendedTeamSize?: number;
  requiredRoles?: TeamRole[];
  
  // Durée estimée
  estimatedDuration: {
    min: number; // en heures
    max: number; // en heures
    typical?: number; // durée typique
  };
  
  // Restrictions
  seasonalRestrictions?: string[];
  weatherLimitations?: WeatherLimitations;
  timeRestrictions?: TimeRestrictions;
  locationRestrictions?: LocationRestrictions;
  
  // Procédures spéciales
  specialProcedures?: SpecialProcedures;
  
  // Métadonnées
  complexity: 'low' | 'medium' | 'high' | 'expert';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'rare' | 'occasional' | 'frequent' | 'routine';
  
  // Standards et réglementations
  standards?: string[]; // CSA, NFPA, etc.
  regulations?: string[]; // RSST, etc.
  
  // Configuration avancée
  settings?: WorkTypeSettings;
  
  // État
  isActive: boolean;
  version: string;
  lastUpdated: string;
}

export interface WeatherLimitations {
  temperature: {
    min: number;
    max: number;
  };
  windSpeed: {
    max: number;
    gustMax?: number;
  };
  precipitation: boolean; // true = arrêt sous la pluie
  visibility: {
    min: number; // en km
  };
  humidity?: {
    max: number; // pourcentage
  };
  uvIndex?: {
    max: number;
  };
  lightning: boolean; // true = arrêt lors d'orages
  airQuality?: {
    maxAQI: number;
  };
}

export interface TimeRestrictions {
  dayOnly?: boolean;
  nightWork?: {
    allowed: boolean;
    restrictions?: string[];
    additionalEquipment?: string[];
  };
  weekendWork?: {
    allowed: boolean;
    restrictions?: string[];
  };
  holidayWork?: {
    allowed: boolean;
    restrictions?: string[];
  };
  continuousWork?: {
    maxHours: number;
    requiredBreaks: number; // minutes
  };
}

export interface LocationRestrictions {
  urbanAreas?: {
    allowed: boolean;
    restrictions?: string[];
  };
  residentialZones?: {
    allowed: boolean;
    timeRestrictions?: string[];
  };
  industrialZones?: {
    preferred: boolean;
    requirements?: string[];
  };
  proximityRestrictions?: {
    schools?: number; // distance minimum en mètres
    hospitals?: number;
    airports?: number;
    powerLines?: number;
    gasLines?: number;
    waterBodies?: number;
  };
  environmentalZones?: {
    protected: boolean;
    sensitive: boolean;
    requirements?: string[];
  };
}

export interface SpecialProcedures {
  lockout: boolean;
  hotWork: boolean;
  confinedSpace: boolean;
  heightWork: boolean;
  gasDetection: boolean;
  radiationSafety?: boolean;
  biologicalSafety?: boolean;
  chemicalSafety?: boolean;
  fireWatch?: boolean;
  atmosphereMonitoring?: boolean;
  rescue?: {
    required: boolean;
    type: 'basic' | 'technical' | 'specialized';
  };
  communication?: {
    constant: boolean;
    checkInInterval?: number; // minutes
  };
}

export interface WorkTypeSettings {
  autoAssignHazards: boolean;
  autoAssignEquipment: boolean;
  requireRiskAssessment: boolean;
  requireSupervisorApproval: boolean;
  enableRealTimeMonitoring: boolean;
  maxRiskScore?: number;
  requiredDocumentation?: string[];
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[]; // pour select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TeamRole {
  role: string;
  required: boolean;
  count: number;
  certifications?: string[];
  description?: string;
}

// =================== CATÉGORIES ET TYPES SPÉCIALISÉS ===================
export type WorkTypeCategory = 
  | 'electrical'
  | 'gas'
  | 'construction'
  | 'telecom'
  | 'maintenance'
  | 'emergency'
  | 'environmental'
  | 'transportation'
  | 'industrial'
  | 'specialty';

export interface ElectricalWorkType extends WorkType {
  electricalData: {
    voltageLevel: 'LV' | 'MV' | 'HV' | 'EHV'; // Low/Medium/High/Extra High Voltage
    systemType: 'AC' | 'DC' | 'both';
    frequency?: number; // Hz
    maxCurrent?: number; // Ampères
    arcFlashBoundary?: number; // mètres
    shockHazardBoundary?: number; // mètres
    requiredPPELevel?: 0 | 1 | 2 | 3 | 4;
    isolationRequired: boolean;
    testingRequired: boolean;
  };
}

export interface GasWorkType extends WorkType {
  gasData: {
    gasType: 'natural' | 'propane' | 'hydrogen' | 'oxygen' | 'acetylene' | 'other';
    pressureLevel: 'LP' | 'MP' | 'HP' | 'XHP'; // Low/Medium/High/Extra High Pressure
    maxPressure?: number; // kPa
    flowRate?: number; // m³/h
    detectionRequired: boolean;
    ventilationRequired: boolean;
    ignitionSources: 'prohibited' | 'controlled' | 'allowed';
    emergencyShutoff: boolean;
  };
}

export interface HeightWorkType extends WorkType {
  heightData: {
    maxHeight?: number; // mètres
    fallProtectionRequired: boolean;
    rescueRequired: boolean;
    anchorageRequired: boolean;
    scaffoldingType?: 'fixed' | 'mobile' | 'suspended';
    accessMethod: 'ladder' | 'scaffold' | 'lift' | 'rope' | 'stairs';
    weatherSensitive: boolean;
  };
}

export interface ConfinedSpaceWorkType extends WorkType {
  confinedSpaceData: {
    spaceType: 'tank' | 'vessel' | 'pit' | 'sewer' | 'tunnel' | 'other';
    atmosphereType: 'normal' | 'hazardous' | 'IDLH' | 'oxygen-deficient';
    ventilationRequired: boolean;
    continuousMonitoring: boolean;
    attendantRequired: boolean;
    emergencyRetrievalRequired: boolean;
    communicationRequired: boolean;
    maxOccupancy?: number;
  };
}

// =================== INTERFACES DE GESTION ===================
export interface WorkTypeRegistry {
  [workTypeId: string]: WorkType;
}

export interface WorkTypeService {
  getById: (id: string) => WorkType | null;
  getAll: () => WorkType[];
  getByCategory: (category: WorkTypeCategory) => WorkType[];
  getByComplexity: (complexity: string) => WorkType[];
  getByRiskLevel: (riskLevel: string) => WorkType[];
  add: (workType: WorkType) => void;
  update: (id: string, updates: Partial<WorkType>) => void;
  remove: (id: string) => void;
  search: (query: string) => WorkType[];
  getCompatibleEquipment: (workTypeId: string) => string[];
  getRequiredCertifications: (workTypeId: string) => string[];
  getBaseHazards: (workTypeId: string) => string[];
  validateWorkType: (workType: WorkType) => WorkTypeValidation;
}

export interface WorkTypeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface WorkTypeTemplate {
  category: WorkTypeCategory;
  baseConfig: Partial<WorkType>;
  requiredFields: string[];
  optionalFields: string[];
  defaultValues: Record<string, any>;
}

export interface WorkTypeStatistics {
  totalWorkTypes: number;
  byCategory: Record<WorkTypeCategory, number>;
  byComplexity: Record<string, number>;
  byRiskLevel: Record<string, number>;
  mostUsed: Array<{ id: string; name: string; count: number }>;
  recentlyAdded: WorkType[];
  needsReview: WorkType[];
}

// =================== TYPES D'ÉVÉNEMENTS ===================
export interface WorkTypeEvent {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  workTypeId: string;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

// =================== EXPORTS UTILITAIRES ===================
export type WorkTypeId = string;
export type WorkTypeComplexity = WorkType['complexity'];
export type WorkTypeRisk = WorkType['riskLevel'];
export type WorkTypeFrequency = WorkType['frequency'];
