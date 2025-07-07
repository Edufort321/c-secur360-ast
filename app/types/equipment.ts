// app/types/equipment.ts
// =================== TYPES ÉQUIPEMENTS DE SÉCURITÉ ===================

// =================== ENUMS ===================
export enum EquipmentCategory {
  HEAD_PROTECTION = 'HEAD_PROTECTION',
  EYE_PROTECTION = 'EYE_PROTECTION',
  HEARING_PROTECTION = 'HEARING_PROTECTION',
  RESPIRATORY_PROTECTION = 'RESPIRATORY_PROTECTION',
  HAND_PROTECTION = 'HAND_PROTECTION',
  FOOT_PROTECTION = 'FOOT_PROTECTION',
  BODY_PROTECTION = 'BODY_PROTECTION',
  FALL_PROTECTION = 'FALL_PROTECTION',
  DETECTION_MONITORING = 'DETECTION_MONITORING',
  COMMUNICATION = 'COMMUNICATION',
  EMERGENCY = 'EMERGENCY',
  TOOLS = 'TOOLS'
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  EXPIRED = 'EXPIRED'
}

export enum CertificationStandard {
  CSA = 'CSA',
  ANSI = 'ANSI',
  NIOSH = 'NIOSH',
  CE = 'CE',
  ISO = 'ISO',
  OSHA = 'OSHA'
}

// =================== INTERFACES DE BASE ===================
export interface MultiLanguageText {
  fr: string;
  en: string;
}

export interface BaseEntity {
  id: string;
  name: string;
  displayName?: MultiLanguageText;
  description: string;
  isActive?: boolean;
  createdDate?: string;
  lastUpdated?: string;
}

// =================== INTERFACES SPÉCIALISÉES ===================
export interface EquipmentSpecifications {
  model?: string;
  manufacturer?: string;
  partNumber?: string;
  size?: string;
  weight?: number;
  material?: string;
  color?: string;
  backgroundMaterial?: string;
  retroreflectiveTape?: string;
  colors?: string;
  voltage?: number;
  frequency?: number;
  operatingTemperature?: {
    min: number;
    max: number;
  };
  storageTemperature?: {
    min: number;
    max: number;
  };
  batteryLife?: number;
  waterproofRating?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  [key: string]: any;
}

export interface MaintenanceInfo {
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceInterval: number; // en jours
  maintenanceNotes?: string;
  serviceProvider?: string;
  warrantyExpiry?: string;
}

export interface CertificationInfo {
  standard: CertificationStandard;
  certificationNumber?: string;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
  documentUrl?: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  inspector: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  notes?: string;
  defectsFound?: string[];
  correctiveActions?: string[];
  nextInspectionDate?: string;
}

// =================== INTERFACE PRINCIPALE ===================
export interface SafetyEquipment extends BaseEntity {
  category: EquipmentCategory;
  subcategory?: string;
  
  // Informations de base
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  serialNumber?: string;
  
  // Spécifications techniques
  specifications: EquipmentSpecifications;
  
  // Certification et conformité
  certifications: CertificationInfo[];
  complianceStandards: string[];
  
  // Statut et disponibilité
  status: EquipmentStatus;
  quantity: number;
  availableQuantity: number;
  
  // Localisation
  location?: string;
  assignedTo?: string;
  
  // Dates importantes
  purchaseDate?: string;
  warrantyExpiry?: string;
  lastInspection?: string;
  nextInspection?: string;
  
  // Maintenance
  maintenanceInfo: MaintenanceInfo;
  inspectionHistory: InspectionRecord[];
  
  // Utilisation
  usageInstructions: string[];
  limitations: string[];
  compatibleWith?: string[]; // IDs d'autres équipements
  incompatibleWith?: string[]; // IDs d'équipements incompatibles
  
  // Images et documentation
  imageUrl?: string;
  images?: string[];
  manualUrl?: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // Coût et approvisionnement
  unitCost?: number;
  supplier?: string;
  reorderLevel?: number;
  replacementRecommendation?: string;
}

// =================== TYPES UTILITAIRES ===================
export interface EquipmentFilter {
  category?: EquipmentCategory[];
  status?: EquipmentStatus[];
  location?: string[];
  manufacturer?: string[];
  availability?: boolean;
  certificationRequired?: CertificationStandard[];
}

export interface EquipmentSearchOptions {
  query?: string;
  filters?: EquipmentFilter;
  sortBy?: 'name' | 'category' | 'status' | 'nextInspection' | 'quantity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface EquipmentAssignment {
  equipmentId: string;
  assignedTo: string;
  assignedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  condition?: string;
  notes?: string;
}

export interface EquipmentRequest {
  id: string;
  requestedBy: string;
  requestDate: string;
  equipmentId: string;
  quantity: number;
  requiredDate: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface EquipmentInventory {
  equipment: SafetyEquipment;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  minimumStock: number;
  needsReorder: boolean;
  lastStockUpdate: string;
}

// =================== DONNÉES STATIQUES ===================
export const EQUIPMENT_CATEGORIES = [
  { value: EquipmentCategory.HEAD_PROTECTION, label: { fr: 'Protection de la tête', en: 'Head Protection' } },
  { value: EquipmentCategory.EYE_PROTECTION, label: { fr: 'Protection des yeux', en: 'Eye Protection' } },
  { value: EquipmentCategory.HEARING_PROTECTION, label: { fr: 'Protection auditive', en: 'Hearing Protection' } },
  { value: EquipmentCategory.RESPIRATORY_PROTECTION, label: { fr: 'Protection respiratoire', en: 'Respiratory Protection' } },
  { value: EquipmentCategory.HAND_PROTECTION, label: { fr: 'Protection des mains', en: 'Hand Protection' } },
  { value: EquipmentCategory.FOOT_PROTECTION, label: { fr: 'Protection des pieds', en: 'Foot Protection' } },
  { value: EquipmentCategory.BODY_PROTECTION, label: { fr: 'Protection du corps', en: 'Body Protection' } },
  { value: EquipmentCategory.FALL_PROTECTION, label: { fr: 'Protection contre les chutes', en: 'Fall Protection' } },
  { value: EquipmentCategory.DETECTION_MONITORING, label: { fr: 'Détection et surveillance', en: 'Detection & Monitoring' } },
  { value: EquipmentCategory.COMMUNICATION, label: { fr: 'Communication', en: 'Communication' } },
  { value: EquipmentCategory.EMERGENCY, label: { fr: 'Urgence', en: 'Emergency' } },
  { value: EquipmentCategory.TOOLS, label: { fr: 'Outils', en: 'Tools' } }
];

export const EQUIPMENT_STATUS_OPTIONS = [
  { value: EquipmentStatus.AVAILABLE, label: { fr: 'Disponible', en: 'Available' }, color: 'green' },
  { value: EquipmentStatus.IN_USE, label: { fr: 'En usage', en: 'In Use' }, color: 'blue' },
  { value: EquipmentStatus.MAINTENANCE, label: { fr: 'Maintenance', en: 'Maintenance' }, color: 'yellow' },
  { value: EquipmentStatus.OUT_OF_SERVICE, label: { fr: 'Hors service', en: 'Out of Service' }, color: 'red' },
  { value: EquipmentStatus.EXPIRED, label: { fr: 'Expiré', en: 'Expired' }, color: 'gray' }
];

export const CERTIFICATION_STANDARDS = [
  { value: CertificationStandard.CSA, label: 'CSA' },
  { value: CertificationStandard.ANSI, label: 'ANSI' },
  { value: CertificationStandard.NIOSH, label: 'NIOSH' },
  { value: CertificationStandard.CE, label: 'CE' },
  { value: CertificationStandard.ISO, label: 'ISO' },
  { value: CertificationStandard.OSHA, label: 'OSHA' }
];

// =================== FONCTIONS UTILITAIRES ===================
export const getEquipmentByCategory = (equipment: SafetyEquipment[], category: EquipmentCategory): SafetyEquipment[] => {
  return equipment.filter(eq => eq.category === category);
};

export const getAvailableEquipment = (equipment: SafetyEquipment[]): SafetyEquipment[] => {
  return equipment.filter(eq => eq.status === EquipmentStatus.AVAILABLE && eq.availableQuantity > 0);
};

export const getEquipmentNeedingInspection = (equipment: SafetyEquipment[], daysAhead: number = 30): SafetyEquipment[] => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  return equipment.filter(eq => {
    if (!eq.nextInspection) return false;
    const inspectionDate = new Date(eq.nextInspection);
    return inspectionDate <= targetDate;
  });
};

export const getEquipmentNeedingMaintenance = (equipment: SafetyEquipment[], daysAhead: number = 30): SafetyEquipment[] => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  return equipment.filter(eq => {
    if (!eq.maintenanceInfo.nextMaintenance) return false;
    const maintenanceDate = new Date(eq.maintenanceInfo.nextMaintenance);
    return maintenanceDate <= targetDate;
  });
};

export const searchEquipment = (equipment: SafetyEquipment[], options: EquipmentSearchOptions): SafetyEquipment[] => {
  let filtered = [...equipment];
  
  // Recherche textuelle
  if (options.query) {
    const query = options.query.toLowerCase();
    filtered = filtered.filter(eq => 
      eq.name.toLowerCase().includes(query) ||
      eq.description.toLowerCase().includes(query) ||
      eq.manufacturer?.toLowerCase().includes(query) ||
      eq.model?.toLowerCase().includes(query)
    );
  }
  
  // Filtres
  if (options.filters) {
    const { category, status, location, manufacturer, availability, certificationRequired } = options.filters;
    
    if (category && category.length > 0) {
      filtered = filtered.filter(eq => category.includes(eq.category));
    }
    
    if (status && status.length > 0) {
      filtered = filtered.filter(eq => status.includes(eq.status));
    }
    
    if (location && location.length > 0) {
      filtered = filtered.filter(eq => eq.location && location.includes(eq.location));
    }
    
    if (manufacturer && manufacturer.length > 0) {
      filtered = filtered.filter(eq => eq.manufacturer && manufacturer.includes(eq.manufacturer));
    }
    
    if (availability !== undefined) {
      filtered = filtered.filter(eq => 
        availability ? (eq.status === EquipmentStatus.AVAILABLE && eq.availableQuantity > 0) : true
      );
    }
    
    if (certificationRequired && certificationRequired.length > 0) {
      filtered = filtered.filter(eq => 
        certificationRequired.some(cert => 
          eq.certifications.some(c => c.standard === cert)
        )
      );
    }
  }
  
  // Tri
  if (options.sortBy) {
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (options.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'nextInspection':
          aValue = a.nextInspection ? new Date(a.nextInspection) : new Date('9999-12-31');
          bValue = b.nextInspection ? new Date(b.nextInspection) : new Date('9999-12-31');
          break;
        case 'quantity':
          aValue = a.availableQuantity;
          bValue = b.availableQuantity;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
      if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }
  
  // Pagination
  if (options.offset !== undefined || options.limit !== undefined) {
    const start = options.offset || 0;
    const end = options.limit ? start + options.limit : undefined;
    filtered = filtered.slice(start, end);
  }
  
  return filtered;
};

export const validateEquipment = (equipment: Partial<SafetyEquipment>): string[] => {
  const errors: string[] = [];
  
  if (!equipment.id) errors.push('ID est requis');
  if (!equipment.name) errors.push('Nom est requis');
  if (!equipment.description) errors.push('Description est requise');
  if (!equipment.category) errors.push('Catégorie est requise');
  if (!equipment.status) errors.push('Statut est requis');
  if (equipment.quantity !== undefined && equipment.quantity < 0) {
    errors.push('Quantité ne peut pas être négative');
  }
  if (equipment.availableQuantity !== undefined && equipment.availableQuantity < 0) {
    errors.push('Quantité disponible ne peut pas être négative');
  }
  if (equipment.quantity !== undefined && equipment.availableQuantity !== undefined) {
    if (equipment.availableQuantity > equipment.quantity) {
      errors.push('Quantité disponible ne peut pas dépasser la quantité totale');
    }
  }
  
  return errors;
};

export const calculateMaintenanceDue = (equipment: SafetyEquipment): number => {
  if (!equipment.maintenanceInfo.nextMaintenance) return Infinity;
  
  const nextMaintenance = new Date(equipment.maintenanceInfo.nextMaintenance);
  const today = new Date();
  const diffTime = nextMaintenance.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const calculateInspectionDue = (equipment: SafetyEquipment): number => {
  if (!equipment.nextInspection) return Infinity;
  
  const nextInspection = new Date(equipment.nextInspection);
  const today = new Date();
  const diffTime = nextInspection.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// =================== EXPORTS UTILITAIRES ===================
export interface Equipment extends SafetyEquipment {}

export interface SelectedEquipment {
  equipmentId: string;
  equipment: Equipment;
  isRequired: boolean;
  quantity: number;
  notes?: string;
}

export interface EquipmentUsage {
  equipmentId: string;
  equipment: Equipment;
  usageContext: string;
  effectivenessRating?: number;
  userFeedback?: string;
}

// Export par défaut
export default SafetyEquipment;
