// app/types/workTypes.ts
// =================== TYPES TYPES DE TRAVAIL ===================

// =================== ENUMS ===================
export enum WorkCategory {
  CONSTRUCTION = 'CONSTRUCTION',
  MAINTENANCE = 'MAINTENANCE',
  EXCAVATION = 'EXCAVATION',
  ELECTRICAL = 'ELECTRICAL',
  WELDING = 'WELDING',
  CONFINED_SPACE = 'CONFINED_SPACE',
  HOT_WORK = 'HOT_WORK',
  CHEMICAL = 'CHEMICAL',
  TRANSPORTATION = 'TRANSPORTATION',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}

export enum WorkEnvironment {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
  UNDERGROUND = 'UNDERGROUND',
  HEIGHT = 'HEIGHT',
  CONFINED = 'CONFINED',
  HAZARDOUS = 'HAZARDOUS'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
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

// =================== INTERFACE PRINCIPALE ===================
export interface WorkType extends BaseEntity {
  category: WorkCategory;
  subcategory?: string;
  environment: WorkEnvironment[];
  riskLevel: RiskLevel;
  
  // Conditions et exigences
  requiresPermit: boolean;
  requiresSupervision: boolean;
  requiresSpecialTraining: boolean;
  
  // Équipements requis
  requiredEquipment: string[];
  recommendedEquipment?: string[];
  
  // Dangers associés
  associatedHazards: string[];
  
  // Procédures
  preparationSteps: string[];
  executionSteps: string[];
  completionSteps: string[];
  
  // Mesures de sécurité spécifiques
  safetyMeasures: string[];
  emergencyProcedures: string[];
  
  // Réglementations
  regulatoryReferences: string[];
  
  // Durée et fréquence
  estimatedDuration?: number; // en minutes
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'OCCASIONAL' | 'EMERGENCY';
  
  // Personnel
  minimumPersonnel: number;
  recommendedPersonnel?: number;
  requiredCertifications: string[];
  
  // Conditions météo
  weatherRestrictions?: string[];
  temperatureRange?: {
    min?: number;
    max?: number;
  };
}

// =================== TYPES UTILITAIRES ===================
export interface WorkTypeFilter {
  category?: WorkCategory[];
  environment?: WorkEnvironment[];
  riskLevel?: RiskLevel[];
  requiresPermit?: boolean;
  requiresSupervision?: boolean;
}

export interface WorkTypeSearchOptions {
  query?: string;
  filters?: WorkTypeFilter;
  sortBy?: 'name' | 'category' | 'riskLevel' | 'duration';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface WorkTypeGroup {
  category: WorkCategory;
  workTypes: WorkType[];
  totalCount: number;
}

// =================== DONNÉES STATIQUES ===================
export const WORK_CATEGORIES = [
  { value: WorkCategory.CONSTRUCTION, label: { fr: 'Construction', en: 'Construction' } },
  { value: WorkCategory.MAINTENANCE, label: { fr: 'Maintenance', en: 'Maintenance' } },
  { value: WorkCategory.EXCAVATION, label: { fr: 'Excavation', en: 'Excavation' } },
  { value: WorkCategory.ELECTRICAL, label: { fr: 'Électrique', en: 'Electrical' } },
  { value: WorkCategory.WELDING, label: { fr: 'Soudage', en: 'Welding' } },
  { value: WorkCategory.CONFINED_SPACE, label: { fr: 'Espaces clos', en: 'Confined Space' } },
  { value: WorkCategory.HOT_WORK, label: { fr: 'Travaux à chaud', en: 'Hot Work' } },
  { value: WorkCategory.CHEMICAL, label: { fr: 'Chimique', en: 'Chemical' } },
  { value: WorkCategory.TRANSPORTATION, label: { fr: 'Transport', en: 'Transportation' } },
  { value: WorkCategory.ADMINISTRATIVE, label: { fr: 'Administratif', en: 'Administrative' } }
];

export const WORK_ENVIRONMENTS = [
  { value: WorkEnvironment.INDOOR, label: { fr: 'Intérieur', en: 'Indoor' } },
  { value: WorkEnvironment.OUTDOOR, label: { fr: 'Extérieur', en: 'Outdoor' } },
  { value: WorkEnvironment.UNDERGROUND, label: { fr: 'Souterrain', en: 'Underground' } },
  { value: WorkEnvironment.HEIGHT, label: { fr: 'En hauteur', en: 'At Height' } },
  { value: WorkEnvironment.CONFINED, label: { fr: 'Espace confiné', en: 'Confined Space' } },
  { value: WorkEnvironment.HAZARDOUS, label: { fr: 'Dangereux', en: 'Hazardous' } }
];

export const RISK_LEVELS = [
  { value: RiskLevel.LOW, label: { fr: 'Faible', en: 'Low' }, color: 'green' },
  { value: RiskLevel.MEDIUM, label: { fr: 'Moyen', en: 'Medium' }, color: 'yellow' },
  { value: RiskLevel.HIGH, label: { fr: 'Élevé', en: 'High' }, color: 'orange' },
  { value: RiskLevel.CRITICAL, label: { fr: 'Critique', en: 'Critical' }, color: 'red' }
];

// =================== FONCTIONS UTILITAIRES ===================
export const getWorkTypesByCategory = (workTypes: WorkType[], category: WorkCategory): WorkType[] => {
  return workTypes.filter(wt => wt.category === category);
};

export const getWorkTypesByRiskLevel = (workTypes: WorkType[], riskLevel: RiskLevel): WorkType[] => {
  return workTypes.filter(wt => wt.riskLevel === riskLevel);
};

export const getWorkTypesByEnvironment = (workTypes: WorkType[], environment: WorkEnvironment): WorkType[] => {
  return workTypes.filter(wt => wt.environment.includes(environment));
};

export const searchWorkTypes = (workTypes: WorkType[], options: WorkTypeSearchOptions): WorkType[] => {
  let filtered = [...workTypes];
  
  // Recherche textuelle
  if (options.query) {
    const query = options.query.toLowerCase();
    filtered = filtered.filter(wt => 
      wt.name.toLowerCase().includes(query) ||
      wt.description.toLowerCase().includes(query)
    );
  }
  
  // Filtres
  if (options.filters) {
    const { category, environment, riskLevel, requiresPermit, requiresSupervision } = options.filters;
    
    if (category && category.length > 0) {
      filtered = filtered.filter(wt => category.includes(wt.category));
    }
    
    if (environment && environment.length > 0) {
      filtered = filtered.filter(wt => 
        environment.some(env => wt.environment.includes(env))
      );
    }
    
    if (riskLevel && riskLevel.length > 0) {
      filtered = filtered.filter(wt => riskLevel.includes(wt.riskLevel));
    }
    
    if (requiresPermit !== undefined) {
      filtered = filtered.filter(wt => wt.requiresPermit === requiresPermit);
    }
    
    if (requiresSupervision !== undefined) {
      filtered = filtered.filter(wt => wt.requiresSupervision === requiresSupervision);
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
        case 'riskLevel':
          const riskOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
          aValue = riskOrder[a.riskLevel];
          bValue = riskOrder[b.riskLevel];
          break;
        case 'duration':
          aValue = a.estimatedDuration || 0;
          bValue = b.estimatedDuration || 0;
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

export const groupWorkTypesByCategory = (workTypes: WorkType[]): WorkTypeGroup[] => {
  const groups: { [key in WorkCategory]?: WorkType[] } = {};
  
  workTypes.forEach(wt => {
    if (!groups[wt.category]) {
      groups[wt.category] = [];
    }
    groups[wt.category]!.push(wt);
  });
  
  return Object.entries(groups).map(([category, workTypes]) => ({
    category: category as WorkCategory,
    workTypes: workTypes || [],
    totalCount: (workTypes || []).length
  }));
};

export const validateWorkType = (workType: Partial<WorkType>): string[] => {
  const errors: string[] = [];
  
  if (!workType.id) errors.push('ID est requis');
  if (!workType.name) errors.push('Nom est requis');
  if (!workType.description) errors.push('Description est requise');
  if (!workType.category) errors.push('Catégorie est requise');
  if (!workType.environment || workType.environment.length === 0) {
    errors.push('Au moins un environnement est requis');
  }
  if (!workType.riskLevel) errors.push('Niveau de risque est requis');
  if (workType.minimumPersonnel !== undefined && workType.minimumPersonnel < 1) {
    errors.push('Minimum 1 personne requise');
  }
  
  return errors;
};

// =================== EXPORTS ===================
export default WorkType;
