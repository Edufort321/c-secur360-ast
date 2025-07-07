// app/data/equipment/index.ts

// ⭐ IMPORT UNIFIÉ - Utilise la même interface que tous les autres fichiers
import { SafetyEquipment, EquipmentCategory } from '../../types/equipment';

// =================== IMPORTS DES ÉQUIPEMENTS ===================
import { headProtectionEquipment, headProtectionById } from './head-protection';
import { eyeProtectionEquipment, eyeProtectionById } from './eye-protection';
import { handProtectionEquipment, handProtectionById } from './hand-protection';
import { footProtectionEquipment, footProtectionById } from './foot-protection';
import { respiratoryEquipment, respiratoryById } from './respiratory';
import { fallProtectionEquipment, fallProtectionById } from './fall-protection';
import { electricalEquipment, electricalEquipmentById } from './electrical';
import { detectionEquipment, detectionEquipmentById } from './detection';
import { bodyProtectionEquipment, bodyProtectionById } from './body-protection';

// Export des types
export type { SafetyEquipment, EquipmentCategory };

// =================== FONCTIONS UTILITAIRES ===================
export function getProtectionLevelColor(level: string): string {
  switch (level) {
    case 'basic': return 'text-green-600';
    case 'standard': return 'text-blue-600';
    case 'enhanced': return 'text-yellow-600';
    case 'specialized': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function getProtectionLevelLabel(level: string): string {
  switch (level) {
    case 'basic': return 'Basique';
    case 'standard': return 'Standard';
    case 'enhanced': return 'Renforcé';
    case 'specialized': return 'Spécialisé';
    case 'critical': return 'Critique';
    default: return 'Non défini';
  }
}

export function calculateEquipmentCost(equipment: SafetyEquipment, quantity: number = 1): number {
  return equipment.cost * quantity;
}

export function validateEquipmentCompatibility(equipmentIds: string[]): boolean {
  // Logique de validation basique - peut être étendue
  return equipmentIds.length > 0;
}

export function getExpiringEquipment(equipmentList: SafetyEquipment[], daysAhead: number = 30): SafetyEquipment[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  
  return equipmentList.filter(equipment => {
    if (!equipment.lifespanMonths) return false;
    
    const createdDate = new Date(equipment.createdDate);
    const expirationDate = new Date(createdDate.getTime() + (equipment.lifespanMonths * 30 * 24 * 60 * 60 * 1000));
    
    return expirationDate <= futureDate;
  });
}

// =================== REGISTRY COMPLET DES ÉQUIPEMENTS ===================
export const allEquipment: SafetyEquipment[] = [
  ...headProtectionEquipment,
  ...eyeProtectionEquipment,
  ...handProtectionEquipment,
  ...footProtectionEquipment,
  ...respiratoryEquipment,
  ...fallProtectionEquipment,
  ...electricalEquipment,
  ...detectionEquipment,
  ...bodyProtectionEquipment
];

export const equipmentById: Record<string, SafetyEquipment> = {
  ...headProtectionById,
  ...eyeProtectionById,
  ...handProtectionById,
  ...footProtectionById,
  ...respiratoryById,
  ...fallProtectionById,
  ...electricalEquipmentById,
  ...detectionEquipmentById,
  ...bodyProtectionById
};

export const equipmentByCategory: Partial<Record<EquipmentCategory, SafetyEquipment[]>> = {
  'head-protection': headProtectionEquipment,
  'eye-protection': eyeProtectionEquipment,
  'hand-protection': handProtectionEquipment,
  'foot-protection': footProtectionEquipment,
  'respiratory-protection': respiratoryEquipment,
  'fall-protection': fallProtectionEquipment,
  'electrical-protection': electricalEquipment,
  'detection-equipment': detectionEquipment,
  'body-protection': bodyProtectionEquipment
};

// =================== FONCTIONS DE RECHERCHE ===================
export function getEquipmentById(id: string): SafetyEquipment | undefined {
  return equipmentById[id];
}

export function getEquipmentByCategory(category: EquipmentCategory): SafetyEquipment[] {
  return equipmentByCategory[category] || [];
}

export function getEquipmentByWorkType(workTypeId: string): SafetyEquipment[] {
  return allEquipment.filter(equipment => 
    equipment.workTypes.includes(workTypeId)
  );
}

export function getEquipmentByHazard(hazardId: string): SafetyEquipment[] {
  return allEquipment.filter(equipment => 
    equipment.hazardTypes.includes(hazardId)
  );
}

export function searchEquipment(query: string): SafetyEquipment[] {
  const searchTerm = query.toLowerCase();
  return allEquipment.filter(equipment => 
    equipment.name.toLowerCase().includes(searchTerm) ||
    equipment.description.toLowerCase().includes(searchTerm) ||
    equipment.category.toLowerCase().includes(searchTerm) ||
    (equipment.subcategory && equipment.subcategory.toLowerCase().includes(searchTerm))
  );
}

export function getMandatoryEquipment(): SafetyEquipment[] {
  return allEquipment.filter(equipment => equipment.isActive);
}

export function getEquipmentRequiringTraining(): SafetyEquipment[] {
  // Filtrer selon les certifications ou standards spéciaux
  return allEquipment.filter(equipment => 
    equipment.standards.some(standard => 
      standard.includes('training') || standard.includes('certification')
    )
  );
}

export function getEquipmentRequiringCertification(): SafetyEquipment[] {
  return allEquipment.filter(equipment => 
    equipment.certifications.length > 0
  );
}

// =================== FONCTIONS DE COMPATIBILITÉ ===================
export function checkEquipmentCompatibility(equipmentIds: string[]): {
  compatible: string[][];
  incompatible: string[][];
  recommendations: string[];
} {
  const equipments = equipmentIds.map(id => getEquipmentById(id)).filter(Boolean) as SafetyEquipment[];
  const compatible: string[][] = [];
  const incompatible: string[][] = [];
  const recommendations: string[] = [];

  // Logique de base - peut être étendue selon vos besoins
  for (let i = 0; i < equipments.length; i++) {
    for (let j = i + 1; j < equipments.length; j++) {
      const eq1 = equipments[i];
      const eq2 = equipments[j];
      
      // Compatible si même fournisseur ou standards similaires
      if (eq1.supplier === eq2.supplier || 
          eq1.standards.some(std => eq2.standards.includes(std))) {
        compatible.push([eq1.id, eq2.id]);
      }
      
      // Incompatible si même catégorie mais différents standards
      if (eq1.category === eq2.category && 
          !eq1.standards.some(std => eq2.standards.includes(std))) {
        incompatible.push([eq1.id, eq2.id]);
      }
    }
  }

  // Recommandations basées sur les dangers couverts
  const allHazards = new Set<string>();
  equipments.forEach(eq => {
    eq.hazardTypes.forEach(hazard => allHazards.add(hazard));
  });

  return { compatible, incompatible, recommendations };
}

// =================== FONCTIONS DE GESTION ===================
export function getEquipmentMaintenanceSchedule(equipmentIds: string[]): {
  daily: SafetyEquipment[];
  weekly: SafetyEquipment[];
  monthly: SafetyEquipment[];
  quarterly: SafetyEquipment[];
  annually: SafetyEquipment[];
} {
  const equipments = equipmentIds.map(id => getEquipmentById(id)).filter(Boolean) as SafetyEquipment[];
  
  return {
    daily: equipments.filter(eq => eq.inspectionFrequency === 'before each use' || eq.inspectionFrequency === 'daily'),
    weekly: equipments.filter(eq => eq.inspectionFrequency === 'weekly'),
    monthly: equipments.filter(eq => eq.inspectionFrequency === 'monthly'),
    quarterly: equipments.filter(eq => eq.inspectionFrequency === 'quarterly'),
    annually: equipments.filter(eq => eq.inspectionFrequency === 'annually')
  };
}

export function calculateProjectEquipmentCost(equipmentSelection: {
  equipmentId: string;
  quantity: number;
}[]): {
  totalCost: number;
  breakdown: Array<{
    equipment: SafetyEquipment;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
} {
  const breakdown = equipmentSelection.map(selection => {
    const equipment = getEquipmentById(selection.equipmentId);
    if (!equipment) {
      return null;
    }
    
    const unitCost = equipment.cost;
    const totalCost = unitCost * selection.quantity;
    
    return {
      equipment,
      quantity: selection.quantity,
      unitCost,
      totalCost
    };
  }).filter(Boolean) as Array<{
    equipment: SafetyEquipment;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;

  const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0);

  return { totalCost, breakdown };
}

// =================== STATISTIQUES DES ÉQUIPEMENTS ===================
export function getEquipmentStats() {
  const stats = {
    total: allEquipment.length,
    byCategory: {} as Record<string, number>,
    active: 0,
    inactive: 0,
    averageCost: 0,
    totalEstimatedValue: 0
  };

  let totalCostSum = 0;

  allEquipment.forEach(equipment => {
    // Stats par catégorie
    stats.byCategory[equipment.category] = (stats.byCategory[equipment.category] || 0) + 1;
    
    // Stats status
    if (equipment.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }
    
    // Stats coûts
    totalCostSum += equipment.cost;
  });

  stats.averageCost = allEquipment.length > 0 ? totalCostSum / allEquipment.length : 0;
  stats.totalEstimatedValue = totalCostSum;

  return stats;
}

// =================== VALIDATION ET CONFORMITÉ ===================
export function validateEquipmentSelection(
  selectedEquipmentIds: string[],
  requiredHazards: string[]
): {
  isCompliant: boolean;
  coveredHazards: string[];
  missingHazards: string[];
  redundantEquipment: string[];
  recommendations: string[];
} {
  const selectedEquipment = selectedEquipmentIds.map(id => getEquipmentById(id)).filter(Boolean) as SafetyEquipment[];
  
  const coveredHazards = new Set<string>();
  selectedEquipment.forEach(equipment => {
    equipment.hazardTypes.forEach(hazard => coveredHazards.add(hazard));
  });

  const missingHazards = requiredHazards.filter(hazard => !coveredHazards.has(hazard));
  const redundantEquipment: string[] = [];
  const recommendations: string[] = [];

  // Identifier équipements redondants
  for (let i = 0; i < selectedEquipment.length; i++) {
    for (let j = i + 1; j < selectedEquipment.length; j++) {
      const eq1 = selectedEquipment[i];
      const eq2 = selectedEquipment[j];
      
      const commonHazards = eq1.hazardTypes.filter(hazard => 
        eq2.hazardTypes.includes(hazard)
      );
      
      if (commonHazards.length > 0 && eq1.category === eq2.category) {
        redundantEquipment.push(eq2.id);
      }
    }
  }

  // Recommandations pour hazards manquants
  missingHazards.forEach(hazard => {
    const suitableEquipment = getEquipmentByHazard(hazard);
    if (suitableEquipment.length > 0) {
      recommendations.push(
        `Pour le danger "${hazard}", ajouter: ${suitableEquipment[0].name}`
      );
    }
  });

  return {
    isCompliant: missingHazards.length === 0,
    coveredHazards: Array.from(coveredHazards),
    missingHazards,
    redundantEquipment: [...new Set(redundantEquipment)],
    recommendations
  };
}

// =================== EXPORTS PRINCIPAUX ===================
export default allEquipment;

export {
  headProtectionEquipment,
  eyeProtectionEquipment,
  handProtectionEquipment,
  footProtectionEquipment,
  respiratoryEquipment,
  fallProtectionEquipment,
  electricalEquipment,
  detectionEquipment,
  bodyProtectionEquipment
};
