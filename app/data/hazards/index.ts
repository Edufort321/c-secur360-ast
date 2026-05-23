// app/data/hazards/index.ts
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
  acc[(hazard as any).id] = hazard;
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
    (hazard as any).name.toLowerCase().includes(lowerQuery) ||
    (hazard as any).description.toLowerCase().includes(lowerQuery) ||
    (hazard as any).subcategory?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filtre dangers par catégorie
 */
export const getHazardsByCategory = (category: string): Hazard[] => {
  return allHazards.filter(hazard => (hazard as any).category === category);
};

/**
 * Filtre dangers par type de travail
 */
export const getHazardsByWorkType = (workType: string): Hazard[] => {
  return allHazards.filter(hazard => 
    (hazard as any).workTypes?.includes(workType)
  );
};

/**
 * Filtre dangers par niveau de sévérité
 */
export const getHazardsBySeverity = (severity: string): Hazard[] => {
  return allHazards.filter(hazard => (hazard as any).severity === severity);
};

/**
 * Filtre dangers par niveau de risque
 */
export const getHazardsByRiskLevel = (riskLevel: string): Hazard[] => {
  return allHazards.filter(hazard => (hazard as any).riskLevel === riskLevel);
};

/**
 * Obtient dangers actifs seulement
 */
export const getActiveHazards = (): Hazard[] => {
  return allHazards.filter(hazard => (hazard as any).isActive);
};

/**
 * Calcule la distribution des dangers par catégorie
 */
export const getHazardCategoryDistribution = () => {
  const distribution: Record<string, number> = {};
  
  allHazards.forEach(hazard => {
    const category = (hazard as any).category as string;
    distribution[category] = (distribution[category] || 0) + 1;
  });
  
  return distribution;
};

/**
 * Obtient les dangers les plus critiques
 */
export const getCriticalHazards = (): Hazard[] => {
  return allHazards.filter(hazard => 
    (hazard as any).severity === 'critical' || (hazard as any).riskLevel === 'critical'
  );
};

/**
 * Obtient les équipements requis pour une liste de dangers
 */
export const getRequiredEquipmentForHazards = (hazardIds: string[]): string[] => {
  const equipment = new Set<string>();
  
  hazardIds.forEach(hazardId => {
    const hazard = hazardsById[hazardId];
    if (hazard && (hazard as any).requiredEquipment) {
      (hazard as any).requiredEquipment.forEach((eq: string) => equipment.add(eq));
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
    if (hazard && (hazard as any).controlMeasures) {
      (hazard as any).controlMeasures.forEach((measure: string) => measures.add(measure));
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
    if (hazard && (hazard as any).regulatoryReferences) {
      (hazard as any).regulatoryReferences.forEach((ref: string) => references.add(ref));
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
