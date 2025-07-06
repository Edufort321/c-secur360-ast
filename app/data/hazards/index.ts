// app/data/hazards/index.ts

// =================== IMPORTS DES DANGERS ===================
import { Hazard, HazardCategory, calculateRiskLevel, getRiskColor, getRiskLabel } from './template';
import { electricalHazards, electricalHazardsById } from './electrical';
import { mechanicalHazards, mechanicalHazardsById } from './mechanical';
import { physicalHazards, physicalHazardsById } from './physical';

// Export des types
export type { Hazard, HazardCategory };
export { calculateRiskLevel, getRiskColor, getRiskLabel };

// =================== REGISTRY COMPLET DES DANGERS ===================
export const allHazards: Hazard[] = [
  ...electricalHazards,
  ...mechanicalHazards,
  ...physicalHazards
  // Les autres catégories seront ajoutées ici
];

export const hazardsById: Record<string, Hazard> = {
  ...electricalHazardsById,
  ...mechanicalHazardsById,
  ...physicalHazardsById
  // Les autres seront ajoutées ici
};

export const hazardsByCategory: Record<HazardCategory, Hazard[]> = {
  electrical: electricalHazards,
  mechanical: mechanicalHazards,
  physical: physicalHazards,
  chemical: [], // À ajouter
  biological: [], // À ajouter
  environmental: [], // À ajouter
  workplace: [], // À ajouter
  transportation: [], // À ajouter
  fire_explosion: [], // À ajouter
  confined_space: allHazards.filter(h => h.subcategory === 'confined_space')
};

// =================== FONCTIONS DE RECHERCHE ===================
export function getHazardById(id: string): Hazard | undefined {
  return hazardsById[id];
}

export function getHazardsByCategory(category: HazardCategory): Hazard[] {
  return hazardsByCategory[category] || [];
}

export function getHazardsByWorkType(workTypeId: string): Hazard[] {
  // Cette fonction sera étendue quand nous intégrerons avec workTypes
  const workTypeHazardMapping: Record<string, string[]> = {
    'electrical_maintenance': [
      'electrical_shock',
      'arc_flash',
      'working_at_height'
    ],
    'gas_maintenance': [
      'confined_space_entry',
      'chemical_exposure',
      'fire_explosion_risk'
    ],
    'construction_general': [
      'working_at_height',
      'moving_mechanical_parts',
      'lifting_dropping_loads'
    ],
    'telecom_installation': [
      'working_at_height',
      'electrical_shock',
      'moving_mechanical_parts'
    ]
  };

  const hazardIds = workTypeHazardMapping[workTypeId] || [];
  return hazardIds.map(id => getHazardById(id)).filter(Boolean) as Hazard[];
}

export function searchHazards(query: string): Hazard[] {
  const searchTerm = query.toLowerCase();
  return allHazards.filter(hazard => 
    hazard.name.toLowerCase().includes(searchTerm) ||
    hazard.description.toLowerCase().includes(searchTerm) ||
    hazard.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    hazard.category.toLowerCase().includes(searchTerm)
  );
}

export function getHighRiskHazards(): Hazard[] {
  return allHazards.filter(hazard => hazard.riskLevel >= 4);
}

export function getHazardsByRiskLevel(riskLevel: number): Hazard[] {
  return allHazards.filter(hazard => hazard.riskLevel === riskLevel);
}

// =================== STATISTIQUES DES DANGERS ===================
export function getHazardStats() {
  const stats = {
    total: allHazards.length,
    byCategory: {} as Record<HazardCategory, number>,
    byRiskLevel: {} as Record<number, number>,
    withCertificationRequired: 0,
    withMonitoringRequired: 0,
    withWeatherRestrictions: 0
  };

  allHazards.forEach(hazard => {
    // Stats par catégorie
    stats.byCategory[hazard.category] = (stats.byCategory[hazard.category] || 0) + 1;
    
    // Stats par niveau de risque
    stats.byRiskLevel[hazard.riskLevel] = (stats.byRiskLevel[hazard.riskLevel] || 0) + 1;
    
    // Stats spéciales
    if (hazard.certificationRequired) stats.withCertificationRequired++;
    if (hazard.monitoringRequired) stats.withMonitoringRequired++;
    if (hazard.weatherRestrictions.length > 0) stats.withWeatherRestrictions++;
  });

  return stats;
}

// =================== VALIDATION ET CONFORMITÉ ===================
export function validateHazardCompliance(selectedHazards: string[]): {
  isCompliant: boolean;
  missingRequirements: string[];
  recommendations: string[];
} {
  const hazards = selectedHazards.map(id => getHazardById(id)).filter(Boolean) as Hazard[];
  
  const allRequiredEquipment = new Set<string>();
  const allRequiredTraining = new Set<string>();
  const allRegulations = new Set<string>();
  
  hazards.forEach(hazard => {
    hazard.requiredEquipment.forEach(eq => allRequiredEquipment.add(eq));
    hazard.requiredTraining.forEach(tr => allRequiredTraining.add(tr));
    hazard.regulations.csa.forEach(reg => allRegulations.add(reg));
    hazard.regulations.rsst.forEach(reg => allRegulations.add(reg));
  });

  return {
    isCompliant: true, // Logique de validation à implémenter
    missingRequirements: [],
    recommendations: [
      `Équipements requis: ${Array.from(allRequiredEquipment).join(', ')}`,
      `Formations requises: ${Array.from(allRequiredTraining).join(', ')}`,
      `Réglementations: ${Array.from(allRegulations).join(', ')}`
    ]
  };
}

// =================== MATRICE DE RISQUE ===================
export function generateRiskMatrix(): Array<Array<{
  severity: number;
  probability: number;
  riskLevel: number;
  color: string;
  hazards: Hazard[];
}>> {
  const matrix: any[][] = [];
  
  for (let severity = 1; severity <= 5; severity++) {
    matrix[severity - 1] = [];
    for (let probability = 1; probability <= 5; probability++) {
      const riskLevel = calculateRiskLevel(severity as any, probability as any);
      const cellHazards = allHazards.filter(h => 
        h.severity === severity && h.probability === probability
      );
      
      matrix[severity - 1][probability - 1] = {
        severity,
        probability,
        riskLevel,
        color: getRiskColor(riskLevel),
        hazards: cellHazards
      };
    }
  }
  
  return matrix;
}

// =================== EXPORTS PRINCIPAUX ===================
export default allHazards;

export {
  electricalHazards,
  mechanicalHazards,
  physicalHazards
};
