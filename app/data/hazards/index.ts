// app/data/hazards/index.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Imports de tous les dangers
import { biologicalHazards } from './biological';
import { chemicalHazards } from './chemical';
import { electricalHazards } from './electrical';
import { environmentalHazards } from './environmental';
import { ergonomicHazards } from './ergonomic';
import { gasHazards } from './gas';
import { mechanicalHazards } from './mechanical';
import { physicalHazards } from './physical';
import { workplaceHazards } from './workplace';

// =================== REGISTRY PRINCIPAL DES DANGERS ===================

// Combinaison de tous les dangers
export const allHazards: Hazard[] = [
  ...biologicalHazards,
  ...chemicalHazards,
  ...electricalHazards,
  ...environmentalHazards,
  ...ergonomicHazards,
  ...gasHazards,
  ...mechanicalHazards,
  ...physicalHazards,
  ...workplaceHazards
];

// Index par ID pour recherche rapide
export const hazardsById = allHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

// Index par catégorie
export const hazardsByCategory = {
  BIOLOGICAL: biologicalHazards,
  CHEMICAL: chemicalHazards,
  ELECTRICAL: electricalHazards,
  ENVIRONMENTAL: environmentalHazards,
  ERGONOMIC: ergonomicHazards,
  GAS: gasHazards,
  MECHANICAL: mechanicalHazards,
  PHYSICAL: physicalHazards,
  WORKPLACE: workplaceHazards
} as const;

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Recherche dangers par mot-clé
 */
export const searchHazards = (query: string): Hazard[] => {
  const lowerQuery = query.toLowerCase();
  return allHazards.filter(hazard => 
    hazard.name.toLowerCase().includes(lowerQuery) ||
    hazard.description.toLowerCase().includes(lowerQuery) ||
    hazard.subcategory?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filtre dangers par catégorie
 */
export const getHazardsByCategory = (category: string): Hazard[] => {
  return allHazards.filter(hazard => hazard.category === category);
};

/**
 * Filtre dangers par type de travail
 */
export const getHazardsByWorkType = (workType: string): Hazard[] => {
  return allHazards.filter(hazard => 
    hazard.workTypes?.includes(workType)
  );
};

/**
 * Filtre dangers par niveau de sévérité
 */
export const getHazardsBySeverity = (severity: string): Hazard[] => {
  return allHazards.filter(hazard => hazard.severity === severity);
};

/**
 * Filtre dangers par niveau de risque
 */
export const getHazardsByRiskLevel = (riskLevel: string): Hazard[] => {
  return allHazards.filter(hazard => hazard.riskLevel === riskLevel);
};

/**
 * Obtient dangers actifs seulement
 */
export const getActiveHazards = (): Hazard[] => {
  return allHazards.filter(hazard => hazard.isActive);
};

/**
 * Calcule la distribution des dangers par catégorie
 */
export const getHazardCategoryDistribution = () => {
  const distribution: Record<string, number> = {};
  
  allHazards.forEach(hazard => {
    const category = hazard.category as string;
    distribution[category] = (distribution[category] || 0) + 1;
  });
  
  return distribution;
};

/**
 * Obtient les dangers les plus critiques
 */
export const getCriticalHazards = (): Hazard[] => {
  return allHazards.filter(hazard => 
    hazard.severity === 'critical' || hazard.riskLevel === 'critical'
  );
};

/**
 * Obtient les équipements requis pour une liste de dangers
 */
export const getRequiredEquipmentForHazards = (hazardIds: string[]): string[] => {
  const equipment = new Set<string>();
  
  hazardIds.forEach(hazardId => {
    const hazard = hazardsById[hazardId];
    if (hazard && hazard.requiredEquipment) {
      hazard.requiredEquipment.forEach(eq => equipment.add(eq));
    }
  });
  
  return Array.from(equipment);
};

/**
 * Valide qu'un danger existe
 */
export const validateHazardExists = (hazardId: string): boolean => {
  return hazardId in hazardsById;
};

/**
 * Obtient les mesures de contrôle pour une liste de dangers
 */
export const getControlMeasuresForHazards = (hazardIds: string[]): string[] => {
  const measures = new Set<string>();
  
  hazardIds.forEach(hazardId => {
    const hazard = hazardsById[hazardId];
    if (hazard && hazard.controlMeasures) {
      hazard.controlMeasures.forEach(measure => measures.add(measure));
    }
  });
  
  return Array.from(measures);
};

/**
 * Obtient les références réglementaires pour une liste de dangers
 */
export const getRegulatoryReferencesForHazards = (hazardIds: string[]): string[] => {
  const references = new Set<string>();
  
  hazardIds.forEach(hazardId => {
    const hazard = hazardsById[hazardId];
    if (hazard && hazard.regulatoryReferences) {
      hazard.regulatoryReferences.forEach(ref => references.add(ref));
    }
  });
  
  return Array.from(references);
};

// =================== EXPORTS ===================
export {
  biologicalHazards,
  chemicalHazards,
  electricalHazards,
  environmentalHazards,
  ergonomicHazards,
  gasHazards,
  mechanicalHazards,
  physicalHazards,
  workplaceHazards
};

// Export par défaut
export default allHazards;
