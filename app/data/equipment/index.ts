// app/data/equipment/index.ts

// =================== IMPORTS DES ÉQUIPEMENTS ===================
import { SafetyEquipment, EquipmentCategory, getProtectionLevelColor, getProtectionLevelLabel, calculateEquipmentCost, validateEquipmentCompatibility, getExpiringEquipment } from './template';
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
export { getProtectionLevelColor, getProtectionLevelLabel, calculateEquipmentCost, validateEquipmentCompatibility, getExpiringEquipment };

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

export const equipmentByCategory: Record<EquipmentCategory, SafetyEquipment[]> = {
  ppe_head: headProtectionEquipment,
  ppe_eyes_face: eyeProtectionEquipment,
  ppe_hands: handProtectionEquipment,
  ppe_feet: footProtectionEquipment,
  ppe_respiratory: respiratoryEquipment,
  ppe_fall_protection: fallProtectionEquipment,
  electrical_safety: electricalEquipment,
  monitoring_detection: detectionEquipment,
  ppe_body: bodyProtectionEquipment,
  ppe_hearing: [], // À ajouter si nécessaire
  mechanical_safety: [], // À ajouter si nécessaire
  chemical_safety: [], // À ajouter si nécessaire
  rescue_emergency: [], // À ajouter si nécessaire
  tools_equipment: [], // À ajouter si nécessaire
  communication: [], // À ajouter si nécessaire
  lighting: [] // À ajouter si nécessaire
};

// =================== FONCTIONS DE RECHERCHE ===================
export function getEquipmentById(id: string): SafetyEquipment | undefined {
  return equipmentById[id];
}

export function getEquipmentByCategory(category: EquipmentCategory): SafetyEquipment[] {
  return equipmentByCategory[category] || [];
}

export function getEquipmentByHazard(hazardId: string): SafetyEquipment[] {
  return allEquipment.filter(equipment => 
    equipment.hazardsProtectedAgainst.includes(hazardId)
  );
}

export function searchEquipment(query: string): SafetyEquipment[] {
  const searchTerm = query.toLowerCase();
  return allEquipment.filter(equipment => 
    equipment.name.toLowerCase().includes(searchTerm) ||
    equipment.description.toLowerCase().includes(searchTerm) ||
    equipment.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    equipment.category.toLowerCase().includes(searchTerm) ||
    (equipment.subcategory && equipment.subcategory.toLowerCase().includes(searchTerm))
  );
}

export function getMandatoryEquipment(): SafetyEquipment[] {
  return allEquipment.filter(equipment => equipment.isMandatory);
}

export function getEquipmentRequiringTraining(): SafetyEquipment[] {
  return allEquipment.filter(equipment => equipment.trainingRequired);
}

export function getEquipmentRequiringCertification(): SafetyEquipment[] {
  return allEquipment.filter(equipment => equipment.certificationRequired);
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

  for (let i = 0; i < equipments.length; i++) {
    for (let j = i + 1; j < equipments.length; j++) {
      const eq1 = equipments[i];
      const eq2 = equipments[j];
      
      if (eq1.compatibility.includes(eq2.id) || eq2.compatibility.includes(eq1.id)) {
        compatible.push([eq1.id, eq2.id]);
      }
      
      if (eq1.incompatibility.includes(eq2.id) || eq2.incompatibility.includes(eq1.id)) {
        incompatible.push([eq1.id, eq2.id]);
      }
    }
  }

  // Recommandations basées sur les dangers couverts
  const allHazards = new Set<string>();
  equipments.forEach(eq => {
    eq.hazardsProtectedAgainst.forEach(hazard => allHazards.add(hazard));
  });

  // Vérifier si équipements complémentaires manquent
  allHazards.forEach(hazard => {
    const protectingEquipment = equipments.filter(eq => 
      eq.hazardsProtectedAgainst.includes(hazard)
    );
    
    if (protectingEquipment.length === 1) {
      const additionalEquipment = getEquipmentByHazard(hazard).filter(eq => 
        !equipmentIds.includes(eq.id)
      );
      
      if (additionalEquipment.length > 0) {
        recommendations.push(
          `Pour le danger "${hazard}", considérer aussi: ${additionalEquipment[0].name}`
        );
      }
    }
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
    daily: equipments.filter(eq => eq.inspectionFrequency === 'before_each_use' || eq.inspectionFrequency === 'daily'),
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
    if (!equipment || !equipment.estimatedCost) {
      return null;
    }
    
    const unitCost = equipment.estimatedCost.amount;
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
    byCategory: {} as Record<EquipmentCategory, number>,
    byProtectionLevel: {} as Record<string, number>,
    mandatory: 0,
    trainingRequired: 0,
    certificationRequired: 0,
    withExpirationWarning: 0,
    averageCost: 0,
    totalEstimatedValue: 0
  };

  let totalCostSum = 0;
  let equipmentWithCost = 0;

  allEquipment.forEach(equipment => {
    // Stats par catégorie
    stats.byCategory[equipment.category] = (stats.byCategory[equipment.category] || 0) + 1;
    
    // Stats par niveau protection
    stats.byProtectionLevel[equipment.protectionLevel] = (stats.byProtectionLevel[equipment.protectionLevel] || 0) + 1;
    
    // Stats spéciales
    if (equipment.isMandatory) stats.mandatory++;
    if (equipment.trainingRequired) stats.trainingRequired++;
    if (equipment.certificationRequired) stats.certificationRequired++;
    if (equipment.expirationWarning) stats.withExpirationWarning++;
    
    // Stats coûts
    if (equipment.estimatedCost) {
      totalCostSum += equipment.estimatedCost.amount;
      equipmentWithCost++;
    }
  });

  stats.averageCost = equipmentWithCost > 0 ? totalCostSum / equipmentWithCost : 0;
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
    equipment.hazardsProtectedAgainst.forEach(hazard => coveredHazards.add(hazard));
  });

  const missingHazards = requiredHazards.filter(hazard => !coveredHazards.has(hazard));
  const redundantEquipment: string[] = [];
  const recommendations: string[] = [];

  // Identifier équipements redondants
  for (let i = 0; i < selectedEquipment.length; i++) {
    for (let j = i + 1; j < selectedEquipment.length; j++) {
      const eq1 = selectedEquipment[i];
      const eq2 = selectedEquipment[j];
      
      const commonHazards = eq1.hazardsProtectedAgainst.filter(hazard => 
        eq2.hazardsProtectedAgainst.includes(hazard)
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
