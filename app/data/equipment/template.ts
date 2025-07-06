// app/data/equipment/template.ts

// =================== TEMPLATE & TYPES ÉQUIPEMENTS ===================
export interface SafetyEquipment {
  id: string;
  name: string;
  displayName?: { fr: string; en: string };
  category: EquipmentCategory;
  subcategory?: string;
  description: string;
  
  // Spécifications techniques
  specifications: {
    model?: string;
    manufacturer?: string;
    partNumber?: string;
    size?: string;
    weight?: string;
    material?: string;
    color?: string;
  };
  
  // Certifications et normes
  certifications: {
    csa: string[];
    ansi: string[];
    en: string[];      // Normes européennes
    iso: string[];     // Normes ISO
    other: string[];   // Autres certifications
  };
  
  // Protection fournie
  protectionLevel: ProtectionLevel;
  protectedBodyParts: BodyPart[];
  hazardsProtectedAgainst: string[]; // IDs des dangers
  
  // Utilisation
  usageInstructions: {
    fr: string[];
    en: string[];
  };
  limitationsUse: string[];
  compatibility: string[]; // IDs équipements compatibles
  incompatibility: string[]; // IDs équipements incompatibles
  
  // Inspection et maintenance
  inspectionFrequency: InspectionFrequency;
  inspectionCriteria: string[];
  maintenanceInstructions: string[];
  storageInstructions: string[];
  
  // Durée de vie
  lifespanMonths?: number;
  replacementCriteria: string[];
  expirationWarning?: number; // Mois avant expiration
  
  // Conditions d'utilisation
  temperatureRange?: { min: number; max: number; unit: string };
  humidityRange?: { min: number; max: number; unit: string };
  weatherLimitations: string[];
  
  // Coûts et disponibilité
  estimatedCost?: {
    amount: number;
    currency: string;
    unit: 'per_item' | 'per_set' | 'per_pair';
  };
  suppliers: string[];
  availability: 'common' | 'specialized' | 'rare';
  
  // Formation requise
  trainingRequired: boolean;
  trainingType?: string[];
  certificationRequired: boolean;
  
  // Métadonnées
  isActive: boolean;
  isMandatory: boolean; // Obligatoire par réglementation
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type EquipmentCategory = 
  | 'ppe_head'
  | 'ppe_eyes_face'
  | 'ppe_respiratory'
  | 'ppe_hearing'
  | 'ppe_hands'
  | 'ppe_feet'
  | 'ppe_body'
  | 'ppe_fall_protection'
  | 'electrical_safety'
  | 'mechanical_safety'
  | 'chemical_safety'
  | 'monitoring_detection'
  | 'rescue_emergency'
  | 'tools_equipment'
  | 'communication'
  | 'lighting';

export type ProtectionLevel = 
  | 'basic'      // Protection de base
  | 'standard'   // Protection standard industrie
  | 'enhanced'   // Protection renforcée
  | 'specialized' // Protection spécialisée
  | 'maximum';   // Protection maximale

export type BodyPart = 
  | 'head'
  | 'eyes'
  | 'face'
  | 'ears'
  | 'respiratory_system'
  | 'neck'
  | 'shoulders'
  | 'arms'
  | 'hands'
  | 'fingers'
  | 'torso'
  | 'back'
  | 'legs'
  | 'knees'
  | 'feet'
  | 'whole_body';

export type InspectionFrequency = 
  | 'before_each_use'
  | 'daily'
  | 'weekly' 
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'as_needed';

// =================== HELPER FUNCTIONS ===================
export function getProtectionLevelColor(level: ProtectionLevel): string {
  const colors = {
    basic: '#10b981',      // Vert
    standard: '#3b82f6',   // Bleu
    enhanced: '#f59e0b',   // Orange
    specialized: '#8b5cf6', // Violet
    maximum: '#ef4444'     // Rouge
  };
  return colors[level];
}

export function getProtectionLevelLabel(level: ProtectionLevel): { fr: string; en: string } {
  const labels = {
    basic: { fr: 'Base', en: 'Basic' },
    standard: { fr: 'Standard', en: 'Standard' },
    enhanced: { fr: 'Renforcée', en: 'Enhanced' },
    specialized: { fr: 'Spécialisée', en: 'Specialized' },
    maximum: { fr: 'Maximale', en: 'Maximum' }
  };
  return labels[level];
}

export function calculateEquipmentCost(equipment: SafetyEquipment[], quantity: number = 1): number {
  return equipment.reduce((total, eq) => {
    if (eq.estimatedCost) {
      return total + (eq.estimatedCost.amount * quantity);
    }
    return total;
  }, 0);
}

export function validateEquipmentCompatibility(equipmentIds: string[]): {
  isCompatible: boolean;
  conflicts: string[];
  recommendations: string[];
} {
  // Cette fonction sera étendue avec la logique de compatibilité
  return {
    isCompatible: true,
    conflicts: [],
    recommendations: []
  };
}

export function getExpiringEquipment(equipmentList: SafetyEquipment[], daysAhead: number = 30): SafetyEquipment[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return equipmentList.filter(equipment => {
    if (!equipment.lifespanMonths) return false;
    
    const purchaseDate = new Date(equipment.createdAt);
    const expirationDate = new Date(purchaseDate);
    expirationDate.setMonth(expirationDate.getMonth() + equipment.lifespanMonths);
    
    return expirationDate <= cutoffDate;
  });
}

// =================== TEMPLATE DE BASE ===================
export const equipmentTemplate: Omit<SafetyEquipment, 'id' | 'name' | 'category'> = {
  description: '',
  specifications: {},
  certifications: {
    csa: [],
    ansi: [],
    en: [],
    iso: [],
    other: []
  },
  protectionLevel: 'standard',
  protectedBodyParts: [],
  hazardsProtectedAgainst: [],
  usageInstructions: {
    fr: [],
    en: []
  },
  limitationsUse: [],
  compatibility: [],
  incompatibility: [],
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [],
  maintenanceInstructions: [],
  storageInstructions: [],
  replacementCriteria: [],
  weatherLimitations: [],
  suppliers: [],
  availability: 'common',
  trainingRequired: false,
  certificationRequired: false,
  isActive: true,
  isMandatory: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: []
};

export function createNewEquipment(overrides: Partial<SafetyEquipment> & Pick<SafetyEquipment, 'id' | 'name' | 'category'>): SafetyEquipment {
  return {
    ...equipmentTemplate,
    ...overrides
  };
}
