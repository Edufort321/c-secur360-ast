// app/data/equipment/template.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// =================== FONCTION HELPER ===================
export const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'GENERAL' as any,
    certifications: [] as any,
    standards: [] as any,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    workTypes: [] as any,
    hazardTypes: [] as any,
    supplier: 'Supplier TBD',
    cost: 0,
    currency: 'CAD',
    lifespan: '1 year',
    inspectionFrequency: 'monthly',
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== FONCTIONS UTILITAIRES ===================

export const getEquipmentCategoryColor = (category: string): string => {
  switch (category) {
    case 'HEAD_PROTECTION': return 'text-blue-600';
    case 'EYE_PROTECTION': return 'text-green-600';
    case 'HEARING_PROTECTION': return 'text-purple-600';
    case 'RESPIRATORY_PROTECTION': return 'text-red-600';
    case 'HAND_PROTECTION': return 'text-yellow-600';
    case 'FOOT_PROTECTION': return 'text-indigo-600';
    case 'BODY_PROTECTION': return 'text-orange-600';
    case 'FALL_PROTECTION': return 'text-pink-600';
    case 'ELECTRICAL': return 'text-cyan-600';
    case 'EMERGENCY': return 'text-red-700';
    case 'TOOLS': return 'text-gray-600';
    case 'DETECTION': return 'text-emerald-600';
    default: return 'text-gray-600';
  }
};

export const getEquipmentCategoryLabel = (category: string): string => {
  switch (category) {
    case 'HEAD_PROTECTION': return 'Protection de la tête';
    case 'EYE_PROTECTION': return 'Protection oculaire';
    case 'HEARING_PROTECTION': return 'Protection auditive';
    case 'RESPIRATORY_PROTECTION': return 'Protection respiratoire';
    case 'HAND_PROTECTION': return 'Protection des mains';
    case 'FOOT_PROTECTION': return 'Protection des pieds';
    case 'BODY_PROTECTION': return 'Protection du corps';
    case 'FALL_PROTECTION': return 'Protection antichute';
    case 'ELECTRICAL': return 'Équipement électrique';
    case 'EMERGENCY': return 'Équipement d\'urgence';
    case 'TOOLS': return 'Outils et équipements';
    case 'DETECTION': return 'Détection et mesure';
    default: return 'Général';
  }
};

export const calculateEquipmentLifespan = (purchaseDate: string, lifespanMonths: number): {
  remainingMonths: number;
  expirationDate: string;
  isExpired: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
} => {
  const purchase = new Date(purchaseDate);
  const expiration = new Date(purchase);
  expiration.setMonth(expiration.getMonth() + lifespanMonths);
  
  const now = new Date();
  const diffTime = expiration.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  let warningLevel: 'none' | 'warning' | 'critical' = 'none';
  if (diffMonths <= 0) {
    warningLevel = 'critical';
  } else if (diffMonths <= 2) {
    warningLevel = 'warning';
  }
  
  return {
    remainingMonths: Math.max(0, diffMonths),
    expirationDate: expiration.toISOString(),
    isExpired: diffMonths <= 0,
    warningLevel
  };
};

export const validateEquipmentData = (equipment: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validation obligatoire
  if (!equipment.id) errors.push('ID est requis');
  if (!equipment.name) errors.push('Nom est requis');
  if (!equipment.category) errors.push('Catégorie est requise');
  if (!equipment.description) errors.push('Description est requise');
  
  // Validation recommandée
  if (!equipment.supplier || equipment.supplier === 'Supplier TBD') {
    warnings.push('Fournisseur non spécifié');
  }
  if (!equipment.cost || equipment.cost === 0) {
    warnings.push('Coût non spécifié');
  }
  if (!equipment.certifications || equipment.certifications.length === 0) {
    warnings.push('Aucune certification spécifiée');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getEquipmentInspectionStatus = (equipment: any): {
  status: 'current' | 'due' | 'overdue';
  nextInspectionDate: string;
  daysUntilInspection: number;
} => {
  const lastInspection = new Date(equipment.lastUpdated);
  const frequency = equipment.inspectionFrequency;
  
  let intervalDays = 30; // par défaut mensuel
  switch (frequency) {
    case 'daily': intervalDays = 1; break;
    case 'weekly': intervalDays = 7; break;
    case 'monthly': intervalDays = 30; break;
    case 'quarterly': intervalDays = 90; break;
    case 'annually': intervalDays = 365; break;
    case 'before each use': intervalDays = 0; break;
  }
  
  const nextInspection = new Date(lastInspection);
  nextInspection.setDate(nextInspection.getDate() + intervalDays);
  
  const now = new Date();
  const diffTime = nextInspection.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let status: 'current' | 'due' | 'overdue' = 'current';
  if (diffDays <= 0) {
    status = 'overdue';
  } else if (diffDays <= 7) {
    status = 'due';
  }
  
  return {
    status,
    nextInspectionDate: nextInspection.toISOString(),
    daysUntilInspection: diffDays
  };
};

export const filterEquipmentByWorkType = (
  equipment: SafetyEquipment[], 
  workType: string
): SafetyEquipment[] => {
  return equipment.filter(item => 
    item.workTypes && (item.workTypes as any).includes(workType)
  );
};

export const filterEquipmentByHazard = (
  equipment: SafetyEquipment[], 
  hazardType: string
): SafetyEquipment[] => {
  return equipment.filter(item => 
    item.hazardTypes && (item.hazardTypes as any).includes(hazardType)
  );
};

export const searchEquipment = (
  equipment: SafetyEquipment[], 
  searchTerm: string
): SafetyEquipment[] => {
  const term = searchTerm.toLowerCase();
  return equipment.filter(item => 
    item.name.toLowerCase().includes(term) ||
    item.description.toLowerCase().includes(term) ||
    (item.subcategory && item.subcategory.toLowerCase().includes(term)) ||
    (item.supplier && item.supplier.toLowerCase().includes(term))
  );
};

export const sortEquipmentByCost = (
  equipment: SafetyEquipment[], 
  direction: 'asc' | 'desc' = 'asc'
): SafetyEquipment[] => {
  return [...equipment].sort((a, b) => {
    const costA = a.cost || 0;
    const costB = b.cost || 0;
    return direction === 'asc' ? costA - costB : costB - costA;
  });
};

export const groupEquipmentByCategory = (
  equipment: SafetyEquipment[]
): Record<string, SafetyEquipment[]> => {
  return equipment.reduce((groups, item) => {
    const category = item.category as string;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, SafetyEquipment[]>);
};

export const calculateTotalEquipmentCost = (equipment: any[]): {
  totalCost: number;
  currency: string;
  breakdown: Record<string, number>;
} => {
  const breakdown: Record<string, number> = {};
  let totalCost = 0;
  let currency = 'CAD';
  
  equipment.forEach(item => {
    const category = item.category as string;
    const cost = item.cost || 0;
    
    if (!breakdown[category]) {
      breakdown[category] = 0;
    }
    breakdown[category] += cost;
    totalCost += cost;
    
    if (item.currency) {
      currency = item.currency;
    }
  });
  
  return { totalCost, currency, breakdown };
};

// =================== TYPES POUR COMPATIBILITÉ ===================

export interface EquipmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EquipmentInspectionStatus {
  status: 'current' | 'due' | 'overdue';
  nextInspectionDate: string;
  daysUntilInspection: number;
}

export interface EquipmentLifespanInfo {
  remainingMonths: number;
  expirationDate: string;
  isExpired: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
}

export interface EquipmentCostBreakdown {
  totalCost: number;
  currency: string;
  breakdown: Record<string, number>;
}

// =================== CONSTANTES UTILITAIRES ===================

export const EQUIPMENT_CATEGORIES = [
  'HEAD_PROTECTION',
  'EYE_PROTECTION', 
  'HEARING_PROTECTION',
  'RESPIRATORY_PROTECTION',
  'HAND_PROTECTION',
  'FOOT_PROTECTION',
  'BODY_PROTECTION',
  'FALL_PROTECTION',
  'ELECTRICAL',
  'EMERGENCY',
  'TOOLS',
  'DETECTION'
] as const;

export const INSPECTION_FREQUENCIES = [
  'before each use',
  'daily',
  'weekly', 
  'monthly',
  'quarterly',
  'annually'
] as const;

export const EQUIPMENT_STATUSES = [
  'active',
  'inactive',
  'maintenance',
  'retired',
  'damaged'
] as const;

// =================== EXPORTS ===================

export type { SafetyEquipment } from '../../types/equipment';
