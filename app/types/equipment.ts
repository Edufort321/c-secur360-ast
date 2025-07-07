// app/types/equipment.ts

// =================== TYPES ÉQUIPEMENTS DE SÉCURITÉ ===================
export interface SafetyEquipment {
  id: string;
  name: string;
  displayName?: { fr: string; en: string };
  description: string;
  category: EquipmentCategory;
  subcategory?: string;
  
  // Spécifications techniques ÉTENDUES
  specifications: {
    model?: string;
    manufacturer?: string;
    partNumber?: string;
    size?: string;
    weight?: number; // kg
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      units: 'mm' | 'cm' | 'm';
    };
    material?: string;
    color?: string;
    
    // ⭐ AJOUTS pour compatibilité avec body-protection.ts
    backgroundMaterial?: string;
    retroreflectiveTape?: string;
    colors?: string;
    
    // Propriétés spécifiques aux équipements électriques
    voltage?: string;
    current?: string;
    resistance?: string;
    
    // Propriétés spécifiques aux détecteurs
    detectionRange?: string;
    accuracy?: string;
    calibrationDate?: string;
    
    // Propriétés spécifiques aux équipements de hauteur
    breakingStrength?: string;
    elongation?: string;
    webbing?: string;
    
    // Index signature pour flexibilité future
    [key: string]: any;
  };
  
  // Certifications et standards
  certifications: string[];
  standards: string[];
  testingStandards?: string[];
  
  // Protection et performance
  protectionLevel?: string;
  performanceRating?: string;
  resistanceProperties?: ResistanceProperties;
  
  // Informations commerciales
  supplier: string;
  alternativeSuppliers?: string[];
  cost: number;
  currency: 'CAD' | 'USD';
  costLastUpdated?: string;
  
  // Cycle de vie
  lifespan: string;
  lifespanMonths?: number;
  inspectionFrequency: string;
  inspectionIntervalDays?: number;
  maintenanceRequirements?: string[];
  
  // Stockage et manipulation
  storageRequirements?: string[];
  handlingInstructions?: string[];
  transportRestrictions?: string[];
  
  // Compatibilité
  compatibleWith?: string[]; // IDs d'autres équipements
  incompatibleWith?: string[]; // IDs d'équipements incompatibles
  workTypes: string[]; // Types de travaux où cet équipement est utilisé
  hazardTypes: string[]; // Types de dangers contre lesquels il protège
  
  // Documentation
  manualUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  dataSheetUrl?: string;
  
  // État et disponibilité
  isActive: boolean;
  isDiscontinued?: boolean;
  replacementId?: string; // ID de l'équipement de remplacement
  
  // Métadonnées
  createdDate: string;
  lastUpdated: string;
  version: string;
}

export interface ResistanceProperties {
  electrical?: {
    voltage?: number; // Volts
    current?: number; // Ampères
    resistance?: number; // Ohms
    testVoltage?: number;
  };
  chemical?: {
    acids?: boolean;
    bases?: boolean;
    solvents?: boolean;
    oils?: boolean;
    specificChemicals?: string[];
  };
  thermal?: {
    minTemperature?: number; // °C
    maxTemperature?: number; // °C
    flameResistant?: boolean;
    heatResistant?: boolean;
  };
  mechanical?: {
    cutResistance?: string; // Niveau ANSI
    punctureResistance?: boolean;
    tearResistance?: boolean;
    abrasionResistance?: string;
    impactResistance?: boolean;
  };
  environmental?: {
    waterproof?: boolean;
    weatherResistant?: boolean;
    uvResistant?: boolean;
    corrosionResistant?: boolean;
  };
}

export type EquipmentCategory = 
  | 'head-protection'
  | 'eye-protection' 
  | 'respiratory-protection'
  | 'hand-protection'
  | 'foot-protection'
  | 'body-protection'
  | 'fall-protection'
  | 'electrical-protection'
  | 'detection-equipment'
  | 'communication'
  | 'first-aid'
  | 'emergency-equipment'
  | 'tools'
  | 'other';

// =================== TYPES SPÉCIALISÉS PAR CATÉGORIE ===================
export interface HeadProtection extends SafetyEquipment {
  headData: {
    type: 'hard-hat' | 'bump-cap' | 'helmet';
    electricalClass?: 'G' | 'E' | 'C'; // General, Electrical, Conductive
    suspensionType?: 'ratchet' | 'pin-lock' | 'slip-ratchet';
    ventilation?: boolean;
    accessories?: string[]; // chin strap, face shield, etc.
  };
}

export interface EyeProtection extends SafetyEquipment {
  eyeData: {
    type: 'glasses' | 'goggles' | 'face-shield' | 'welding-helmet';
    lensType: 'clear' | 'tinted' | 'photochromic' | 'prescription';
    sideProtection?: boolean;
    antifogging?: boolean;
    scratchResistant?: boolean;
    uvProtection?: boolean;
    impactRating?: string; // ANSI Z87.1
    opticalClass?: number;
  };
}

export interface RespiratoryProtection extends SafetyEquipment {
  respiratoryData: {
    type: 'disposable' | 'half-face' | 'full-face' | 'scba' | 'supplied-air';
    filterType?: 'N95' | 'N99' | 'N100' | 'P95' | 'P99' | 'P100' | 'organic-vapor' | 'acid-gas';
    cartridgeType?: string[];
    protectionFactor?: number;
    approvalNumber?: string; // NIOSH approval
    usageTime?: number; // hours
  };
}

export interface HandProtection extends SafetyEquipment {
  handData: {
    type: 'gloves' | 'mittens' | 'gauntlets';
    coating?: string;
    lining?: string;
    cuffLength?: 'wrist' | 'mid-forearm' | 'elbow';
    grip?: 'smooth' | 'textured' | 'dotted' | 'crinkle';
    dexterity?: 1 | 2 | 3 | 4 | 5; // 1 = best dexterity
    sizes?: string[];
  };
}

export interface FootProtection extends SafetyEquipment {
  footData: {
    type: 'shoes' | 'boots' | 'overshoes' | 'gaiters';
    toeProtection?: 'steel' | 'composite' | 'aluminum' | 'none';
    soleType: 'rubber' | 'pu' | 'leather' | 'composite';
    punctureResistant?: boolean;
    metatarsalProtection?: boolean;
    ankleHeight?: 'low' | 'mid' | 'high';
    sizes?: string[];
    widths?: string[];
  };
}

export interface FallProtection extends SafetyEquipment {
  fallData: {
    type: 'harness' | 'lanyard' | 'anchor' | 'lifeline' | 'net';
    attachmentPoints?: number;
    shockAbsorbing?: boolean;
    workPositioning?: boolean;
    retrieval?: boolean;
    maxUserWeight?: number; // kg
    workingLoad?: number; // kg
    breakingStrength?: number; // kN
  };
}

export interface DetectionEquipment extends SafetyEquipment {
  detectionData: {
    type: 'gas-detector' | 'noise-meter' | 'radiation-detector' | 'air-quality-monitor';
    detectedSubstances?: string[];
    range?: {
      min: number;
      max: number;
      units: string;
    };
    accuracy?: string;
    responseTime?: number; // seconds
    batteryLife?: number; // hours
    calibrationFrequency?: string;
    alarmTypes?: ('visual' | 'audible' | 'vibration')[];
  };
}

// =================== GESTION D'INVENTAIRE ===================
export interface EquipmentInventory {
  equipmentId: string;
  location: string;
  quantity: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    damaged: number;
    expired: number;
  };
  stockLevels: {
    minimum: number;
    maximum: number;
    reorderPoint: number;
    economicOrderQuantity?: number;
  };
  tracking: InventoryTracking[];
  lastInventoryDate: string;
  nextInventoryDate: string;
}

export interface InventoryTracking {
  id: string;
  equipmentId: string;
  serialNumber?: string;
  batchNumber?: string;
  purchaseDate: string;
  expiryDate?: string;
  condition: EquipmentCondition;
  location: string;
  assignedTo?: string;
  lastInspection?: string;
  nextInspection?: string;
  maintenanceHistory: MaintenanceRecord[];
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'inspection' | 'cleaning' | 'repair' | 'calibration' | 'replacement';
  performedBy: string;
  results: 'pass' | 'fail' | 'conditional';
  issues?: string[];
  actionsPerformed?: string[];
  nextMaintenanceDate?: string;
  cost?: number;
  downtime?: number; // hours
}

export type EquipmentCondition = 
  | 'excellent'
  | 'good' 
  | 'fair'
  | 'poor'
  | 'damaged'
  | 'expired'
  | 'out-of-service'
  | 'recalled';

// =================== SÉLECTION ET UTILISATION ===================
export interface EquipmentSelection {
  equipmentId: string;
  quantity: number;
  requiredBy: string; // Date
  assignedTo?: string[];
  condition: EquipmentCondition;
  inspectionDate?: string;
  inspector?: string;
  notes?: string;
  alternatives?: string[]; // IDs d'équipments alternatifs
  cost?: number;
  rental?: boolean;
}

export interface EquipmentRequirement {
  workTypeId: string;
  hazardId?: string;
  equipmentCategory: EquipmentCategory;
  required: boolean;
  minimumSpecifications?: Record<string, any>;
  alternatives?: string[];
  quantity?: number;
  reason?: string;
}

export interface EquipmentCompatibility {
  equipmentId: string;
  compatibleWith: string[];
  incompatibleWith: string[];
  conflictReasons?: Record<string, string>;
  recommendations?: string[];
}

// =================== SERVICES ET UTILITAIRES ===================
export interface EquipmentService {
  getById: (id: string) => SafetyEquipment | null;
  getAll: () => SafetyEquipment[];
  getByCategory: (category: EquipmentCategory) => SafetyEquipment[];
  getByWorkType: (workTypeId: string) => SafetyEquipment[];
  getByHazard: (hazardId: string) => SafetyEquipment[];
  search: (query: string) => SafetyEquipment[];
  findAlternatives: (equipmentId: string) => SafetyEquipment[];
  checkCompatibility: (equipmentIds: string[]) => EquipmentCompatibility[];
  validateSelection: (selection: EquipmentSelection[]) => EquipmentValidation;
  calculateCost: (selection: EquipmentSelection[]) => number;
}

export interface EquipmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[]; // Équipements requis manquants
  conflicts: string[]; // Équipements incompatibles
  suggestions: string[];
  alternatives: Record<string, string[]>; // equipmentId -> alternatives
}

export interface EquipmentRegistry {
  [equipmentId: string]: SafetyEquipment;
}

export interface EquipmentStatistics {
  totalEquipment: number;
  byCategory: Record<EquipmentCategory, number>;
  mostUsed: Array<{ id: string; name: string; usage: number }>;
  expiringSoon: Array<{ id: string; name: string; expiryDate: string }>;
  needingMaintenance: Array<{ id: string; name: string; dueDate: string }>;
  costAnalysis: {
    totalValue: number;
    averageCost: number;
    mostExpensive: Array<{ id: string; name: string; cost: number }>;
  };
}

// =================== EXPORTS UTILITAIRES ===================
export type EquipmentId = string;
export type EquipmentType = SafetyEquipment['category'];
export type InspectionResult = MaintenanceRecord['results'];

// ⭐ COMPATIBILITÉ AVEC LES AUTRES FICHIERS
export interface Equipment extends SafetyEquipment {}
export interface EquipmentSpecifications {
export interface SelectedEquipment {
  equipmentId: string;
  equipment: Equipment;
  isRequired: boolean;
  notes?: string;
  checkedAt?: string;
  checkedBy?: string;
}
