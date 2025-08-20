// app/data/equipment/index.ts
// =================== IMPORTS DE TOUS LES ÉQUIPEMENTS ===================

// Protection de la tête
import { headProtectionEquipment } from './head-protection';

// Protection oculaire  
import { eyeProtectionEquipment } from './eye-protection';

// Protection auditive
import { hearingProtectionEquipment } from './hearing-protection';

// Protection respiratoire
import { respiratoryEquipment } from './respiratory';

// Protection des mains
import { handProtectionEquipment } from './hand-protection';

// Protection des pieds
import { footProtectionEquipment } from './foot-protection';

// Protection du corps
import { bodyProtectionEquipment } from './body-protection';

// Protection antichute
import { fallProtectionEquipment } from './fall-protection';

// Équipements électriques
import { electricalEquipment } from './electrical';

// Équipements d'urgence
import { emergencyEquipment } from './emergency';

// Outils et équipements
import { toolsEquipment } from './tools';

// Détection et mesure
import { detectionEquipment } from './detection';

// Fonctions utilitaires
import { 
  createNewEquipment,
  getEquipmentCategoryColor,
  getEquipmentCategoryLabel,
  calculateEquipmentLifespan,
  validateEquipmentData,
  getEquipmentInspectionStatus,
  filterEquipmentByWorkType,
  filterEquipmentByHazard,
  searchEquipment,
  sortEquipmentByCost,
  groupEquipmentByCategory,
  calculateTotalEquipmentCost,
  EQUIPMENT_CATEGORIES,
  INSPECTION_FREQUENCIES,
  EQUIPMENT_STATUSES
} from './template';

// Types
import type { SafetyEquipment } from '../../types/equipment';

// =================== REGISTRY PRINCIPAL DE TOUS LES ÉQUIPEMENTS ===================

export const allEquipment: SafetyEquipment[] = [
  // Protection de la tête (4 équipements)
  ...headProtectionEquipment,
  
  // Protection oculaire (4 équipements)
  ...eyeProtectionEquipment,
  
  // Protection auditive (4 équipements)
  ...hearingProtectionEquipment,
  
  // Protection respiratoire (4 équipements)
  ...respiratoryEquipment,
  
  // Protection des mains (4 équipements)
  ...handProtectionEquipment,
  
  // Protection des pieds (4 équipements)
  ...footProtectionEquipment,
  
  // Protection du corps (5 équipements)
  ...bodyProtectionEquipment,
  
  // Protection antichute (4 équipements)
  ...fallProtectionEquipment,
  
  // Équipements électriques (4 équipements)
  ...electricalEquipment,
  
  // Équipements d'urgence (4 équipements)
  ...emergencyEquipment,
  
  // Outils et équipements (4 équipements)
  ...toolsEquipment,
  
  // Détection et mesure (4 équipements)
  ...detectionEquipment
];

// =================== INDEX PAR ID POUR RECHERCHE RAPIDE ===================

export const equipmentById = allEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

// =================== INDEX PAR CATÉGORIE ===================

export const equipmentByCategory = {
  HEAD_PROTECTION: headProtectionEquipment,
  EYE_PROTECTION: eyeProtectionEquipment,
  HEARING_PROTECTION: hearingProtectionEquipment,
  RESPIRATORY_PROTECTION: respiratoryEquipment,
  HAND_PROTECTION: handProtectionEquipment,
  FOOT_PROTECTION: footProtectionEquipment,
  BODY_PROTECTION: bodyProtectionEquipment,
  FALL_PROTECTION: fallProtectionEquipment,
  ELECTRICAL: electricalEquipment,
  EMERGENCY: emergencyEquipment,
  TOOLS: toolsEquipment,
  DETECTION: detectionEquipment
};

// =================== FONCTIONS DE RECHERCHE ET FILTRAGE ===================

export const getEquipmentByCategory = (category: string): SafetyEquipment[] => {
  return allEquipment.filter(equipment => equipment.category === category);
};

export const getEquipmentByWorkType = (workType: string): SafetyEquipment[] => {
  return filterEquipmentByWorkType(allEquipment, workType);
};

export const getEquipmentByHazard = (hazardType: string): SafetyEquipment[] => {
  return filterEquipmentByHazard(allEquipment, hazardType);
};

export const getEquipmentBySupplier = (supplier: string): SafetyEquipment[] => {
  return allEquipment.filter(equipment => 
    (equipment as any).supplier?.toLowerCase().includes(supplier.toLowerCase())
  );
};

export const getEquipmentByCostRange = (minCost: number, maxCost: number): SafetyEquipment[] => {
  return allEquipment.filter(equipment => {
    const cost = (equipment as any).cost || 0;
    return cost >= minCost && cost <= maxCost;
  });
};

export const searchAllEquipment = (searchTerm: string): SafetyEquipment[] => {
  return searchEquipment(allEquipment, searchTerm);
};

// =================== FONCTIONS D'ANALYSE ===================

export const getEquipmentStatistics = () => {
  const totalEquipment = allEquipment.length;
  const categoryStats = groupEquipmentByCategory(allEquipment);
  const costBreakdown = calculateTotalEquipmentCost(allEquipment);
  
  const supplierStats = allEquipment.reduce((acc, equipment) => {
    const supplier = (equipment as any).supplier || 'Unknown';
    acc[supplier] = (acc[supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const activeEquipment = allEquipment.filter(equipment => equipment.isActive).length;
  const inactiveEquipment = totalEquipment - activeEquipment;
  
  return {
    total: totalEquipment,
    active: activeEquipment,
    inactive: inactiveEquipment,
    byCategory: Object.keys(categoryStats).map(category => ({
      category,
      count: categoryStats[category].length,
      percentage: Math.round((categoryStats[category].length / totalEquipment) * 100)
    })),
    bySupplier: Object.keys(supplierStats).map(supplier => ({
      supplier,
      count: supplierStats[supplier],
      percentage: Math.round((supplierStats[supplier] / totalEquipment) * 100)
    })),
    costAnalysis: {
      ...costBreakdown,
      averageCost: Math.round(costBreakdown.totalCost / totalEquipment),
      mostExpensive: allEquipment.reduce((max, equipment) => 
        ((equipment as any).cost || 0) > ((max as any).cost || 0) ? equipment : max
      ),
      leastExpensive: allEquipment.reduce((min, equipment) => 
        ((equipment as any).cost || 0) < ((min as any).cost || 0) && ((equipment as any).cost || 0) > 0 ? equipment : min
      )
    }
  };
};

export const getInspectionSchedule = () => {
  return allEquipment.map(equipment => ({
    equipment,
    inspectionStatus: getEquipmentInspectionStatus(equipment),
    lifespan: calculateEquipmentLifespan(equipment.createdDate || new Date().toISOString(), (equipment as any).lifespanMonths || 12)
  })).sort((a, b) => 
    a.inspectionStatus.daysUntilInspection - b.inspectionStatus.daysUntilInspection
  );
};

export const getEquipmentRequiringAttention = () => {
  const schedule = getInspectionSchedule();
  
  return {
    overdueInspections: schedule.filter(item => item.inspectionStatus.status === 'overdue'),
    dueInspections: schedule.filter(item => item.inspectionStatus.status === 'due'),
    expiredEquipment: schedule.filter(item => item.lifespan.isExpired),
    warningEquipment: schedule.filter(item => item.lifespan.warningLevel === 'warning'),
    criticalEquipment: schedule.filter(item => item.lifespan.warningLevel === 'critical')
  };
};

// =================== FONCTIONS DE VALIDATION ===================

export const validateAllEquipment = () => {
  const results = allEquipment.map(equipment => ({
    equipment,
    validation: validateEquipmentData(equipment)
  }));
  
  const invalidEquipment = results.filter(result => !result.validation.isValid);
  const equipmentWithWarnings = results.filter(result => result.validation.warnings.length > 0);
  
  return {
    totalValidated: allEquipment.length,
    valid: results.length - invalidEquipment.length,
    invalid: invalidEquipment.length,
    withWarnings: equipmentWithWarnings.length,
    invalidEquipment,
    equipmentWithWarnings,
    allResults: results
  };
};

// =================== EXPORTS INDIVIDUELS POUR COMPATIBILITÉ ===================

export {
  // Équipements par catégorie
  headProtectionEquipment,
  eyeProtectionEquipment,
  hearingProtectionEquipment,
  respiratoryEquipment,
  handProtectionEquipment,
  footProtectionEquipment,
  bodyProtectionEquipment,
  fallProtectionEquipment,
  electricalEquipment,
  emergencyEquipment,
  toolsEquipment,
  detectionEquipment,
  
  // Fonctions utilitaires
  createNewEquipment,
  getEquipmentCategoryColor,
  getEquipmentCategoryLabel,
  calculateEquipmentLifespan,
  validateEquipmentData,
  getEquipmentInspectionStatus,
  filterEquipmentByWorkType,
  filterEquipmentByHazard,
  searchEquipment,
  sortEquipmentByCost,
  groupEquipmentByCategory,
  calculateTotalEquipmentCost,
  
  // Constantes
  EQUIPMENT_CATEGORIES,
  INSPECTION_FREQUENCIES,
  EQUIPMENT_STATUSES
};

// =================== EXPORTS DE TYPES ===================

export type { SafetyEquipment } from '../../types/equipment';
export type {
  EquipmentValidationResult,
  EquipmentInspectionStatus,
  EquipmentLifespanInfo,
  EquipmentCostBreakdown
} from './template';

// =================== EXPORT PAR DÉFAUT ===================

export default {
  allEquipment,
  equipmentById,
  equipmentByCategory,
  getEquipmentByCategory,
  getEquipmentByWorkType,
  getEquipmentByHazard,
  searchAllEquipment,
  getEquipmentStatistics,
  getInspectionSchedule,
  getEquipmentRequiringAttention,
  validateAllEquipment
};
