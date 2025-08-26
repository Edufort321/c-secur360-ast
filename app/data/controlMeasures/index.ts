// app/data/controlMeasures/index.ts

// =================== IMPORTS DES MESURES DE CONTRÔLE ===================
import { 
  ControlMeasure, 
  ControlMeasureCategory, 
  HierarchyLevel,
  getHierarchyLevelName, 
  getHierarchyLevelColor, 
  calculateResidualRisk, 
  validateControlMeasureSelection,
  calculateImplementationCost
} from './template';
import { eliminationMeasures, eliminationMeasuresById } from './elimination';
import { substitutionMeasures, substitutionMeasuresById } from './substitution';
import { engineeringMeasures, engineeringMeasuresById } from './engineering';
import { administrativeMeasures, administrativeMeasuresById } from './administrative';
import { ppeMeasures, ppeMeasuresById } from './ppe';

// Export des types
export type { ControlMeasure, ControlMeasureCategory, HierarchyLevel };
export { getHierarchyLevelName, getHierarchyLevelColor, calculateResidualRisk, validateControlMeasureSelection, calculateImplementationCost };

// =================== REGISTRY COMPLET DES MESURES ===================
export const allControlMeasures: ControlMeasure[] = [
  ...eliminationMeasures,
  ...substitutionMeasures,
  ...engineeringMeasures,
  ...administrativeMeasures,
  ...ppeMeasures
];

export const controlMeasuresById: Record<string, ControlMeasure> = {
  ...eliminationMeasuresById,
  ...substitutionMeasuresById,
  ...engineeringMeasuresById,
  ...administrativeMeasuresById,
  ...ppeMeasuresById
};

export const controlMeasuresByCategory: Record<ControlMeasureCategory, ControlMeasure[]> = {
  elimination: eliminationMeasures,
  substitution: substitutionMeasures,
  engineering: engineeringMeasures,
  administrative: administrativeMeasures,
  ppe: ppeMeasures
};

export const controlMeasuresByHierarchy: Record<HierarchyLevel, ControlMeasure[]> = {
  1: eliminationMeasures,
  2: substitutionMeasures,
  3: engineeringMeasures,
  4: administrativeMeasures,
  5: ppeMeasures
};

// =================== FONCTIONS DE RECHERCHE ===================
export function getControlMeasureById(id: string): ControlMeasure | undefined {
  return controlMeasuresById[id];
}

export function getControlMeasuresByCategory(category: ControlMeasureCategory): ControlMeasure[] {
  return controlMeasuresByCategory[category] || [];
}

export function getControlMeasuresByHierarchy(level: HierarchyLevel): ControlMeasure[] {
  return controlMeasuresByHierarchy[level] || [];
}

export function getControlMeasuresByHazard(hazardId: string): ControlMeasure[] {
  return allControlMeasures.filter(measure => 
    measure.applicableHazards.includes(hazardId)
  );
}

export function getControlMeasuresByWorkType(workTypeId: string): ControlMeasure[] {
  return allControlMeasures.filter(measure => 
    measure.applicableWorkTypes.includes(workTypeId) || 
    measure.applicableWorkTypes.includes('all_work_types')
  );
}

export function searchControlMeasures(query: string): ControlMeasure[] {
  const searchTerm = query.toLowerCase();
  return allControlMeasures.filter(measure => 
    measure.name.toLowerCase().includes(searchTerm) ||
    measure.description.toLowerCase().includes(searchTerm) ||
    measure.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    measure.category.toLowerCase().includes(searchTerm)
  );
}

export function getMandatoryControlMeasures(): ControlMeasure[] {
  return allControlMeasures.filter(measure => measure.complianceLevel === 'mandatory');
}

export function getHighEffectivenessControlMeasures(): ControlMeasure[] {
  return allControlMeasures.filter(measure => measure.effectiveness >= 4);
}

// =================== FONCTIONS DE RECOMMANDATION ===================
export function recommendControlMeasures(
  hazardIds: string[],
  workTypeId?: string,
  budget?: number
): {
  recommended: ControlMeasure[];
  hierarchy: Record<HierarchyLevel, ControlMeasure[]>;
  totalCost: number;
  effectivenessScore: number;
} {
  let applicableMeasures = new Set<ControlMeasure>();
  
  hazardIds.forEach(hazardId => {
    const measures = getControlMeasuresByHazard(hazardId);
    measures.forEach(measure => applicableMeasures.add(measure));
  });
  
  if (workTypeId) {
    const workTypeMeasures = getControlMeasuresByWorkType(workTypeId);
    workTypeMeasures.forEach(measure => applicableMeasures.add(measure));
  }
  
  const measures = Array.from(applicableMeasures);
  
  const hierarchy: Record<HierarchyLevel, ControlMeasure[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };
  
  measures.forEach(measure => {
    hierarchy[measure.hierarchyLevel].push(measure);
  });
  
  let recommended: ControlMeasure[] = [];
  let totalCost = 0;
  
  // Prioriser selon hiérarchie CSA
  for (let level = 1; level <= 5; level++) {
    const levelMeasures = hierarchy[level as HierarchyLevel]
      .sort((a, b) => b.effectiveness - a.effectiveness);
    
    if (budget) {
      for (const measure of levelMeasures) {
        if (totalCost + measure.estimatedCost.amount <= budget) {
          recommended.push(measure);
          totalCost += measure.estimatedCost.amount;
        }
      }
    } else {
      recommended.push(...levelMeasures.slice(0, 2)); // Top 2 par niveau
    }
  }
  
  const effectivenessScore = recommended.length > 0 
    ? recommended.reduce((sum, m) => sum + m.effectiveness, 0) / recommended.length
    : 0;
  
  return {
    recommended,
    hierarchy,
    totalCost,
    effectivenessScore
  };
}

// =================== STATISTIQUES ===================
export function getControlMeasureStats() {
  const stats = {
    total: allControlMeasures.length,
    byCategory: {} as Record<ControlMeasureCategory, number>,
    byHierarchy: {} as Record<HierarchyLevel, number>,
    byComplianceLevel: {} as Record<string, number>,
    averageCost: 0,
    averageEffectiveness: 0
  };
  
  let totalCost = 0;
  let totalEffectiveness = 0;
  let measuresWithCost = 0;
  
  allControlMeasures.forEach(measure => {
    stats.byCategory[measure.category] = (stats.byCategory[measure.category] || 0) + 1;
    stats.byHierarchy[measure.hierarchyLevel] = (stats.byHierarchy[measure.hierarchyLevel] || 0) + 1;
    stats.byComplianceLevel[measure.complianceLevel] = (stats.byComplianceLevel[measure.complianceLevel] || 0) + 1;
    
    totalCost += measure.estimatedCost.amount;
    totalEffectiveness += measure.effectiveness;
    measuresWithCost++;
  });
  
  stats.averageCost = measuresWithCost > 0 ? totalCost / measuresWithCost : 0;
  stats.averageEffectiveness = totalEffectiveness / allControlMeasures.length;
  
  return stats;
}

// =================== EXPORTS PRINCIPAUX ===================
export default allControlMeasures;

export {
  eliminationMeasures,
  substitutionMeasures,
  engineeringMeasures,
  administrativeMeasures,
  ppeMeasures
};
