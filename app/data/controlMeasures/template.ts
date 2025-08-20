// app/data/controlMeasures/template.ts

// =================== TEMPLATE & TYPES MESURES DE CONTRÔLE ===================
export interface ControlMeasure {
  id: string;
  name: string;
  displayName?: { fr: string; en: string };
  category: ControlMeasureCategory;
  subcategory?: string;
  description: string;
  
  // Hiérarchie de contrôle CSA
  hierarchyLevel: HierarchyLevel;
  effectiveness: EffectivenessRating; // 1-5 (5 = plus efficace)
  
  // Application
  applicableHazards: string[]; // IDs des dangers
  applicableWorkTypes: string[]; // IDs types de travaux
  applicableIndustries: string[];
  
  // Mise en œuvre
  implementationSteps: {
    fr: string[];
    en: string[];
  };
  requiredResources: string[];
  estimatedCost: {
    amount: number;
    currency: string;
    unit: 'per_worker' | 'per_project' | 'per_hour' | 'one_time';
    timeframe?: string;
  };
  implementationTime: string; // Ex: "2-4 heures", "1 semaine"
  
  // Efficacité
  riskReduction: number; // Pourcentage de réduction 0-100%
  sustainabilityRating: number; // 1-5 (5 = très durable)
  maintenanceRequired: boolean;
  maintenanceFrequency?: string;
  
  // Réglementations
  regulatoryRequirements: {
    csa: string[];
    rsst: string[];
    other: string[];
  };
  complianceLevel: ComplianceLevel;
  
  // Limitations et considérations
  limitations: string[];
  prerequisites: string[];
  potentialSideEffects: string[];
  monitoringRequired: boolean;
  
  // Formation et compétences
  trainingRequired: boolean;
  skillLevel: SkillLevel;
  certificationRequired: boolean;
  
  // Compatibilité
  compatibleMeasures: string[]; // IDs autres mesures compatibles
  incompatibleMeasures: string[]; // IDs mesures incompatibles
  
  // Métadonnées
  isActive: boolean;
  approvalRequired: boolean;
  lastReviewed: string;
  nextReview: string;
  tags: string[];
}

export type ControlMeasureCategory = 
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe';

export type HierarchyLevel = 1 | 2 | 3 | 4 | 5; // 1=Élimination, 5=ÉPI

export type EffectivenessRating = 1 | 2 | 3 | 4 | 5; // 1=Faible, 5=Très efficace

export type ComplianceLevel = 
  | 'mandatory'     // Obligatoire par réglementation
  | 'recommended'   // Recommandé par normes
  | 'best_practice' // Meilleure pratique
  | 'optional';     // Optionnel

export type SkillLevel = 
  | 'basic'         // Formation de base
  | 'intermediate'  // Compétences spécialisées
  | 'advanced'      // Expertise technique
  | 'expert';       // Qualification professionnelle

// =================== HELPER FUNCTIONS ===================
export function getHierarchyLevelName(level: HierarchyLevel): { fr: string; en: string } {
  const names = {
    1: { fr: 'Élimination', en: 'Elimination' },
    2: { fr: 'Substitution', en: 'Substitution' },
    3: { fr: 'Contrôles d\'ingénierie', en: 'Engineering Controls' },
    4: { fr: 'Contrôles administratifs', en: 'Administrative Controls' },
    5: { fr: 'Équipements de protection individuelle', en: 'Personal Protective Equipment' }
  };
  return names[level];
}

export function getHierarchyLevelColor(level: HierarchyLevel): string {
  const colors = {
    1: '#22c55e', // Vert - Plus efficace
    2: '#84cc16', // Vert clair
    3: '#eab308', // Jaune
    4: '#f97316', // Orange
    5: '#ef4444'  // Rouge - Moins efficace
  };
  return colors[level];
}

export function calculateResidualRisk(
  originalRisk: number,
  appliedMeasures: ControlMeasure[]
): number {
  let totalReduction = 0;
  
  // Appliquer les réductions en cascade selon hiérarchie
  const sortedMeasures = appliedMeasures.sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
  
  let currentRisk = originalRisk;
  
  sortedMeasures.forEach(measure => {
    const reduction = (measure.riskReduction / 100) * currentRisk;
    currentRisk = Math.max(1, currentRisk - reduction);
  });
  
  return Math.round(currentRisk);
}

export function validateControlMeasureSelection(
  hazardId: string,
  selectedMeasureIds: string[],
  allMeasures: ControlMeasure[]
): {
  isOptimal: boolean;
  missingHierarchyLevels: HierarchyLevel[];
  conflicts: string[];
  recommendations: string[];
  totalEffectiveness: number;
} {
  const selectedMeasures = selectedMeasureIds
    .map(id => allMeasures.find(m => m.id === id))
    .filter(Boolean) as ControlMeasure[];

  const appliedLevels = new Set(selectedMeasures.map(m => m.hierarchyLevel));
  const allLevels: HierarchyLevel[] = [1, 2, 3, 4, 5];
  const missingHierarchyLevels = allLevels.filter(level => !appliedLevels.has(level));

  const conflicts: string[] = [];
  const recommendations: string[] = [];

  // Vérifier incompatibilités
  selectedMeasures.forEach(measure => {
    const incompatibles = selectedMeasures.filter(other => 
      measure.incompatibleMeasures.includes(other.id)
    );
    if (incompatibles.length > 0) {
      conflicts.push(`${measure.name} incompatible avec ${incompatibles.map(i => i.name).join(', ')}`);
    }
  });

  // Calculer efficacité totale
  const totalEffectiveness = selectedMeasures.reduce((sum, measure) => 
    sum + measure.effectiveness, 0
  ) / selectedMeasures.length;

  // Recommandations d'amélioration
  if (missingHierarchyLevels.includes(1)) {
    recommendations.push('Considérer des mesures d\'élimination pour efficacité maximale');
  }
  if (missingHierarchyLevels.includes(2)) {
    recommendations.push('Évaluer possibilités de substitution');
  }
  if (totalEffectiveness < 3) {
    recommendations.push('Sélectionner des mesures plus efficaces');
  }

  return {
    isOptimal: missingHierarchyLevels.length <= 2 && conflicts.length === 0,
    missingHierarchyLevels,
    conflicts,
    recommendations,
    totalEffectiveness
  };
}

export function calculateImplementationCost(
  measures: ControlMeasure[],
  projectParams: {
    workerCount: number;
    projectDuration: number; // en jours
    projectBudget?: number;
  }
): {
  totalCost: number;
  breakdown: Array<{
    measure: ControlMeasure;
    unitCost: number;
    totalCost: number;
    costType: string;
  }>;
  costEffectivenessRatio: number;
} {
  const breakdown = measures.map(measure => {
    let unitCost = measure.estimatedCost.amount;
    let totalCost = unitCost;
    let costType = measure.estimatedCost.unit;

    switch (measure.estimatedCost.unit) {
      case 'per_worker':
        totalCost = unitCost * projectParams.workerCount;
        break;
      case 'per_project':
        totalCost = unitCost;
        break;
      case 'per_hour':
        totalCost = unitCost * projectParams.projectDuration * 8; // 8h/jour
        break;
      case 'one_time':
        totalCost = unitCost;
        break;
    }

    return {
      measure,
      unitCost,
      totalCost,
      costType
    };
  });

  const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Ratio coût-efficacité (coût par point d'efficacité)
  const totalEffectiveness = measures.reduce((sum, m) => sum + m.effectiveness, 0);
  const costEffectivenessRatio = totalEffectiveness > 0 ? totalCost / totalEffectiveness : 0;

  return {
    totalCost,
    breakdown,
    costEffectivenessRatio
  };
}

// =================== TEMPLATE DE BASE ===================
export const controlMeasureTemplate: Omit<ControlMeasure, 'id' | 'name' | 'category' | 'hierarchyLevel'> = {
  description: '',
  effectiveness: 3,
  applicableHazards: [],
  applicableWorkTypes: [],
  applicableIndustries: [],
  implementationSteps: {
    fr: [],
    en: []
  },
  requiredResources: [],
  estimatedCost: {
    amount: 0,
    currency: 'CAD',
    unit: 'one_time'
  },
  implementationTime: '',
  riskReduction: 50,
  sustainabilityRating: 3,
  maintenanceRequired: false,
  regulatoryRequirements: {
    csa: [],
    rsst: [],
    other: []
  },
  complianceLevel: 'best_practice',
  limitations: [],
  prerequisites: [],
  potentialSideEffects: [],
  monitoringRequired: false,
  trainingRequired: false,
  skillLevel: 'basic',
  certificationRequired: false,
  compatibleMeasures: [],
  incompatibleMeasures: [],
  isActive: true,
  approvalRequired: false,
  lastReviewed: new Date().toISOString(),
  nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 an
  tags: []
};

export function createNewControlMeasure(
  overrides: Partial<ControlMeasure> & Pick<ControlMeasure, 'id' | 'name' | 'category' | 'hierarchyLevel'>
): ControlMeasure {
  return {
    ...controlMeasureTemplate,
    ...overrides
  };
}
