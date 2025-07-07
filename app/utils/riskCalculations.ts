// app/utils/riskCalculations.ts - Calculs de risque avancés

import { 
  RiskLevel, 
  SeverityLevel, 
  Priority
} from '../types/index';
import { AST } from '../types/ast';
import { Hazard, RiskAssessment } from '../types/hazards';

// =================== INTERFACES DE CALCUL ===================
export interface RiskCalculationResult {
  initialRisk: RiskLevel;
  residualRisk: RiskLevel;
  riskReduction: number; // Pourcentage de réduction
  riskScore: number; // Score numérique 1-25
  controlEffectiveness: number; // Efficacité des mesures 0-100%
  acceptabilityLevel: RiskAcceptability;
  recommendations: string[];
}

export interface DetailedRiskAssessment {
  hazardId: string;
  hazardName: string;
  calculation: RiskCalculationResult;
  exposureAnalysis: ExposureAnalysis;
  controlMeasureAnalysis: ControlMeasureAnalysis[];
  costBenefitAnalysis?: CostBenefitAnalysis;
  uncertaintyFactors: UncertaintyFactor[];
}

export interface ExposureAnalysis {
  frequency: ExposureFrequency;
  duration: number; // heures par exposition
  numberOfPersons: number;
  exposureIndex: number; // Index calculé 0-100
  populationAtRisk: PopulationRisk;
}

export interface ControlMeasureAnalysis {
  measureId: string;
  hierarchyLevel: HierarchyLevel;
  effectivenessRating: EffectivenessRating;
  riskReductionFactor: number; // 0-1
  implementationCost: number;
  maintenanceCost: number;
  reliabilityFactor: number; // 0-1
}

export interface CostBenefitAnalysis {
  implementationCost: number;
  annualSavings: number;
  paybackPeriod: number; // années
  netPresentValue: number;
  costPerRiskPoint: number;
}

export interface UncertaintyFactor {
  factor: string;
  impact: 'increase' | 'decrease' | 'variable';
  magnitude: number; // Facteur multiplicateur
  confidence: 'low' | 'medium' | 'high';
}

export interface HazardAssessment {
  hazardId: string;
  severityLevel: SeverityLevel;
  probabilityLevel: ProbabilityLevel;
  residualRiskLevel: RiskLevel;
  appliedControlMeasures: string[];
}

export interface ControlMeasureAssignment {
  controlMeasureId: string;
  hierarchyLevel: HierarchyLevel;
  effectivenessRating: EffectivenessRating;
}

// =================== ÉNUMÉRATIONS ===================
export enum RiskAcceptability {
  ACCEPTABLE = 'acceptable',
  TOLERABLE = 'tolerable',
  UNACCEPTABLE = 'unacceptable',
  REVIEW_REQUIRED = 'review_required'
}

export enum PopulationRisk {
  INDIVIDUAL = 'individual',      // 1 personne
  SMALL_GROUP = 'small_group',    // 2-5 personnes
  MEDIUM_GROUP = 'medium_group',  // 6-15 personnes
  LARGE_GROUP = 'large_group',    // 16+ personnes
  PUBLIC = 'public'               // Population générale
}

export enum ExposureFrequency {
  CONTINUOUS = 'CONTINUOUS',     // Plus de 6h/jour
  FREQUENT = 'FREQUENT',         // 2-6h/jour
  OCCASIONAL = 'OCCASIONAL',     // 30min-2h/jour
  INFREQUENT = 'INFREQUENT',     // Moins de 30min/jour
  RARE = 'RARE'                  // Moins d'1 fois/semaine
}

export enum HierarchyLevel {
  ELIMINATION = 1,
  SUBSTITUTION = 2,
  ENGINEERING = 3,
  ADMINISTRATIVE = 4,
  PPE = 5
}

export enum EffectivenessRating {
  VERY_EFFECTIVE = 5,
  EFFECTIVE = 4,
  MODERATELY_EFFECTIVE = 3,
  SOMEWHAT_EFFECTIVE = 2,
  MINIMALLY_EFFECTIVE = 1
}

export enum ProbabilityLevel {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5
}

// =================== MATRICES DE RISQUE ===================

/**
 * Matrice de risque 5x5 standard
 */
export const STANDARD_RISK_MATRIX: RiskLevel[][] = [
  [RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL],
  [RiskLevel.LOW, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL],
  [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.HIGH, RiskLevel.CRITICAL],
  [RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.HIGH, RiskLevel.CRITICAL, RiskLevel.CRITICAL],
  [RiskLevel.HIGH, RiskLevel.HIGH, RiskLevel.CRITICAL, RiskLevel.CRITICAL, RiskLevel.CRITICAL]
];

/**
 * Matrice de risque avec facteur d'exposition
 */
export const EXPOSURE_ADJUSTED_MATRIX: Record<ExposureFrequency, number[][]> = {
  [ExposureFrequency.CONTINUOUS]: [
    [2, 4, 6, 8, 10],
    [4, 6, 8, 10, 12],
    [6, 8, 10, 12, 15],
    [8, 10, 12, 15, 20],
    [10, 12, 15, 20, 25]
  ],
  [ExposureFrequency.FREQUENT]: [
    [1, 3, 5, 7, 9],
    [3, 5, 7, 9, 11],
    [5, 7, 9, 11, 13],
    [7, 9, 11, 13, 16],
    [9, 11, 13, 16, 20]
  ],
  [ExposureFrequency.OCCASIONAL]: [
    [1, 2, 4, 6, 8],
    [2, 4, 6, 8, 10],
    [4, 6, 8, 10, 12],
    [6, 8, 10, 12, 15],
    [8, 10, 12, 15, 18]
  ],
  [ExposureFrequency.INFREQUENT]: [
    [1, 2, 3, 5, 7],
    [2, 3, 5, 7, 9],
    [3, 5, 7, 9, 11],
    [5, 7, 9, 11, 13],
    [7, 9, 11, 13, 16]
  ],
  [ExposureFrequency.RARE]: [
    [1, 1, 2, 4, 6],
    [1, 2, 4, 6, 8],
    [2, 4, 6, 8, 10],
    [4, 6, 8, 10, 12],
    [6, 8, 10, 12, 15]
  ]
};

// =================== FONCTIONS PRINCIPALES ===================

/**
 * Calcul de risque basique (Sévérité × Probabilité)
 */
export function calculateBasicRisk(
  severity: SeverityLevel,
  probability: ProbabilityLevel
): RiskLevel {
  const severityIndex = Math.min(4, Math.max(0, Number(severity) - 1));
  const probabilityIndex = Math.min(4, Math.max(0, Number(probability) - 1));
  
  return STANDARD_RISK_MATRIX[probabilityIndex][severityIndex];
}

/**
 * Calcul de risque avec facteur d'exposition
 */
export function calculateRiskWithExposure(
  severity: SeverityLevel,
  probability: ProbabilityLevel,
  exposure: ExposureFrequency,
  numberOfPersons: number = 1
): RiskCalculationResult {
  const severityIndex = Math.min(4, Math.max(0, Number(severity) - 1));
  const probabilityIndex = Math.min(4, Math.max(0, Number(probability) - 1));
  
  // Score de base avec exposition
  const baseScore = EXPOSURE_ADJUSTED_MATRIX[exposure][probabilityIndex][severityIndex];
  
  // Facteur population
  const populationFactor = calculatePopulationFactor(numberOfPersons);
  const adjustedScore = Math.round(baseScore * populationFactor);
  
  // Conversion en niveau de risque
  const initialRisk = scoreToRiskLevel(adjustedScore);
  
  return {
    initialRisk,
    residualRisk: initialRisk, // Pas de contrôles appliqués
    riskReduction: 0,
    riskScore: adjustedScore,
    controlEffectiveness: 0,
    acceptabilityLevel: determineAcceptability(adjustedScore),
    recommendations: generateBasicRecommendations(initialRisk, adjustedScore)
  };
}

/**
 * Calcul de risque résiduel après application des mesures de contrôle
 */
export function calculateResidualRisk(
  hazardAssessment: HazardAssessment,
  controlMeasures: ControlMeasureAssignment[],
  exposureData?: ExposureAnalysis
): RiskCalculationResult {
  // Calcul du risque initial
  const initialResult = exposureData ? 
    calculateRiskWithExposure(
      hazardAssessment.severityLevel,
      hazardAssessment.probabilityLevel,
      exposureData.frequency,
      exposureData.numberOfPersons
    ) :
    {
      initialRisk: calculateBasicRisk(
        hazardAssessment.severityLevel,
        hazardAssessment.probabilityLevel
      ),
      riskScore: (Number(hazardAssessment.severityLevel) * Number(hazardAssessment.probabilityLevel)),
      controlEffectiveness: 0,
      riskReduction: 0,
      residualRisk: calculateBasicRisk(
        hazardAssessment.severityLevel,
        hazardAssessment.probabilityLevel
      ),
      acceptabilityLevel: RiskAcceptability.REVIEW_REQUIRED,
      recommendations: []
    };

  // Calcul de l'efficacité des mesures de contrôle
  const controlEffectiveness = calculateControlEffectiveness(controlMeasures);
  
  // Application de la réduction de risque
  const riskReductionFactor = controlEffectiveness / 100;
  const residualScore = Math.max(1, Math.round(initialResult.riskScore * (1 - riskReductionFactor)));
  const residualRisk = scoreToRiskLevel(residualScore);
  
  const riskReduction = ((initialResult.riskScore - residualScore) / initialResult.riskScore) * 100;

  return {
    initialRisk: initialResult.initialRisk,
    residualRisk,
    riskReduction: Math.round(riskReduction),
    riskScore: residualScore,
    controlEffectiveness: Math.round(controlEffectiveness),
    acceptabilityLevel: determineAcceptability(residualScore),
    recommendations: generateDetailedRecommendations(
      initialResult.initialRisk,
      residualRisk,
      controlEffectiveness,
      controlMeasures
    )
  };
}

/**
 * Calcule l'efficacité globale des mesures de contrôle selon la hiérarchie
 */
export function calculateControlEffectiveness(
  controlMeasures: ControlMeasureAssignment[]
): number {
  if (controlMeasures.length === 0) return 0;

  let totalEffectiveness = 0;
  let weightedSum = 0;

  // Poids selon la hiérarchie des contrôles (plus haut = plus efficace)
  const hierarchyWeights: Record<HierarchyLevel, number> = {
    [HierarchyLevel.ELIMINATION]: 0.95,     // 95% efficacité max
    [HierarchyLevel.SUBSTITUTION]: 0.85,   // 85% efficacité max
    [HierarchyLevel.ENGINEERING]: 0.75,    // 75% efficacité max
    [HierarchyLevel.ADMINISTRATIVE]: 0.50, // 50% efficacité max
    [HierarchyLevel.PPE]: 0.30             // 30% efficacité max
  };

  for (const measure of controlMeasures) {
    const hierarchyWeight = hierarchyWeights[measure.hierarchyLevel];
    const effectivenessRating = measure.effectivenessRating || EffectivenessRating.MODERATELY_EFFECTIVE;
    
    // Convertir l'évaluation en pourcentage
    const measureEffectiveness = (effectivenessRating / 5) * hierarchyWeight * 100;
    
    // Pondération selon le niveau hiérarchique
    const weight = 6 - measure.hierarchyLevel; // Élimination = 5, PPE = 1
    
    totalEffectiveness += measureEffectiveness * weight;
    weightedSum += weight;
  }

  // Efficacité moyenne pondérée avec facteur de complémentarité
  const averageEffectiveness = totalEffectiveness / weightedSum;
  
  // Bonus pour diversité des mesures (défense en profondeur)
  const uniqueHierarchyLevels = new Set(controlMeasures.map(cm => cm.hierarchyLevel)).size;
  const diversityBonus = Math.min(10, uniqueHierarchyLevels * 2); // Max 10% bonus
  
  return Math.min(95, averageEffectiveness + diversityBonus);
}

/**
 * Analyse complète du risque pour un AST
 */
export function analyzeASTRisk(ast: AST): DetailedRiskAssessment[] {
  const identifiedHazards = (ast as any).identifiedHazards || [];
  const controlMeasures = (ast as any).controlMeasures || [];
  const teamMembers = (ast as any).teamMembers || ast.participants || [];
  const estimatedDuration = (ast as any).estimatedDuration || 8;

  return identifiedHazards.map((hazard: any) => {
    // Trouver les mesures de contrôle pour ce danger
    const relevantControls = controlMeasures.filter((cm: any) => 
      hazard.appliedControlMeasures?.includes(cm.controlMeasureId) ||
      hazard.appliedControlMeasures?.includes(cm.id)
    );

    // Convertir en format attendu
    const hazardAssessment: HazardAssessment = {
      hazardId: hazard.hazardId || hazard.id,
      severityLevel: hazard.severityLevel || SeverityLevel.MEDIUM,
      probabilityLevel: hazard.probabilityLevel || ProbabilityLevel.MEDIUM,
      residualRiskLevel: hazard.residualRiskLevel || RiskLevel.MEDIUM,
      appliedControlMeasures: hazard.appliedControlMeasures || []
    };

    // Calcul du risque
    const calculation = calculateResidualRisk(hazardAssessment, relevantControls);

    // Analyse d'exposition
    const exposureAnalysis: ExposureAnalysis = {
      frequency: ExposureFrequency.FREQUENT,
      duration: estimatedDuration,
      numberOfPersons: teamMembers.length + 1,
      exposureIndex: calculateExposureIndex(estimatedDuration, teamMembers.length + 1),
      populationAtRisk: determinePopulationRisk(teamMembers.length + 1)
    };

    // Analyse des mesures de contrôle
    const controlMeasureAnalysis: ControlMeasureAnalysis[] = relevantControls.map((cm: any) => ({
      measureId: cm.controlMeasureId || cm.id,
      hierarchyLevel: cm.hierarchyLevel || HierarchyLevel.PPE,
      effectivenessRating: cm.effectivenessRating || EffectivenessRating.MODERATELY_EFFECTIVE,
      riskReductionFactor: calculateIndividualControlReduction(cm),
      implementationCost: estimateImplementationCost(cm),
      maintenanceCost: estimateMaintenanceCost(cm),
      reliabilityFactor: calculateReliabilityFactor(cm)
    }));

    // Facteurs d'incertitude
    const uncertaintyFactors: UncertaintyFactor[] = [
      {
        factor: 'Variabilité des conditions météo',
        impact: 'variable',
        magnitude: 1.2,
        confidence: 'medium'
      },
      {
        factor: 'Expérience de l\'équipe',
        impact: 'decrease',
        magnitude: 0.9,
        confidence: 'low'
      }
    ];

    return {
      hazardId: hazardAssessment.hazardId,
      hazardName: hazard.name || hazard.hazardId || hazard.id,
      calculation,
      exposureAnalysis,
      controlMeasureAnalysis,
      uncertaintyFactors
    };
  });
}

// =================== FONCTIONS UTILITAIRES ===================

function calculatePopulationFactor(numberOfPersons: number): number {
  if (numberOfPersons <= 1) return 1.0;
  if (numberOfPersons <= 5) return 1.2;
  if (numberOfPersons <= 15) return 1.5;
  if (numberOfPersons <= 50) return 2.0;
  return 2.5;
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 3) return RiskLevel.LOW;
  if (score <= 6) return RiskLevel.LOW;
  if (score <= 12) return RiskLevel.MEDIUM;
  if (score <= 18) return RiskLevel.HIGH;
  return RiskLevel.CRITICAL;
}

function determineAcceptability(score: number): RiskAcceptability {
  if (score <= 3) return RiskAcceptability.ACCEPTABLE;
  if (score <= 8) return RiskAcceptability.TOLERABLE;
  if (score <= 15) return RiskAcceptability.REVIEW_REQUIRED;
  return RiskAcceptability.UNACCEPTABLE;
}

function calculateExposureIndex(duration: number, numberOfPersons: number): number {
  return Math.min(100, (duration * numberOfPersons) / 2);
}

function determinePopulationRisk(numberOfPersons: number): PopulationRisk {
  if (numberOfPersons <= 1) return PopulationRisk.INDIVIDUAL;
  if (numberOfPersons <= 5) return PopulationRisk.SMALL_GROUP;
  if (numberOfPersons <= 15) return PopulationRisk.MEDIUM_GROUP;
  if (numberOfPersons <= 50) return PopulationRisk.LARGE_GROUP;
  return PopulationRisk.PUBLIC;
}

function calculateIndividualControlReduction(control: any): number {
  const hierarchyFactors: Record<HierarchyLevel, number> = {
    [HierarchyLevel.ELIMINATION]: 0.95,
    [HierarchyLevel.SUBSTITUTION]: 0.80,
    [HierarchyLevel.ENGINEERING]: 0.65,
    [HierarchyLevel.ADMINISTRATIVE]: 0.40,
    [HierarchyLevel.PPE]: 0.25
  };

  const hierarchyLevel = control.hierarchyLevel || HierarchyLevel.PPE;
  const effectiveness = (control.effectivenessRating || 3) / 5;
  return hierarchyFactors[hierarchyLevel as HierarchyLevel] * effectiveness;
}

function estimateImplementationCost(control: any): number {
  // Coûts estimés selon le niveau hiérarchique (en $CAD)
  const baseCosts: Record<HierarchyLevel, number> = {
    [HierarchyLevel.ELIMINATION]: 10000,
    [HierarchyLevel.SUBSTITUTION]: 5000,
    [HierarchyLevel.ENGINEERING]: 3000,
    [HierarchyLevel.ADMINISTRATIVE]: 500,
    [HierarchyLevel.PPE]: 200
  };

  const hierarchyLevel = control.hierarchyLevel || HierarchyLevel.PPE;
  return baseCosts[hierarchyLevel as HierarchyLevel];
}

function estimateMaintenanceCost(control: any): number {
  // Coût de maintenance annuel (% du coût d'implémentation)
  const maintenanceRates: Record<HierarchyLevel, number> = {
    [HierarchyLevel.ELIMINATION]: 0.02,
    [HierarchyLevel.SUBSTITUTION]: 0.05,
    [HierarchyLevel.ENGINEERING]: 0.10,
    [HierarchyLevel.ADMINISTRATIVE]: 0.20,
    [HierarchyLevel.PPE]: 0.50
  };

  const hierarchyLevel = control.hierarchyLevel || HierarchyLevel.PPE;
  return estimateImplementationCost(control) * maintenanceRates[hierarchyLevel as HierarchyLevel];
}

function calculateReliabilityFactor(control: any): number {
  // Facteur de fiabilité selon le niveau hiérarchique
  const reliabilityFactors: Record<HierarchyLevel, number> = {
    [HierarchyLevel.ELIMINATION]: 0.98,
    [HierarchyLevel.SUBSTITUTION]: 0.95,
    [HierarchyLevel.ENGINEERING]: 0.90,
    [HierarchyLevel.ADMINISTRATIVE]: 0.70,
    [HierarchyLevel.PPE]: 0.60
  };

  const hierarchyLevel = control.hierarchyLevel || HierarchyLevel.PPE;
  return reliabilityFactors[hierarchyLevel as HierarchyLevel];
}

function generateBasicRecommendations(riskLevel: RiskLevel, score: number): string[] {
  const recommendations: string[] = [];

  switch (riskLevel) {
    case RiskLevel.CRITICAL:
      recommendations.push(
        "🚨 ARRÊT IMMÉDIAT - Risque critique inacceptable",
        "📋 Révision complète de l'analyse requise",
        "👥 Consultation d'experts en sécurité obligatoire",
        "🔒 Mise en place de mesures d'élimination prioritaires"
      );
      break;
    
    case RiskLevel.HIGH:
      recommendations.push(
        "⚠️ Mesures de contrôle renforcées requises",
        "📝 Plan d'action détaillé à élaborer",
        "👨‍💼 Approbation supervision nécessaire",
        "🔍 Surveillance continue pendant l'exécution"
      );
      break;
    
    case RiskLevel.MEDIUM:
      recommendations.push(
        "📋 Mesures de contrôle à implémenter avant début",
        "🔄 Révision périodique pendant l'exécution",
        "📊 Documentation des mesures prises"
      );
      break;
    
    case RiskLevel.LOW:
      recommendations.push(
        "✅ Risque acceptable avec précautions standard",
        "📝 Application des bonnes pratiques",
        "🔍 Surveillance de routine"
      );
      break;
    
    default:
      recommendations.push(
        "✅ Risque très faible",
        "📋 Maintenir les bonnes pratiques"
      );
  }

  return recommendations;
}

function generateDetailedRecommendations(
  initialRisk: RiskLevel,
  residualRisk: RiskLevel,
  controlEffectiveness: number,
  controlMeasures: ControlMeasureAssignment[]
): string[] {
  const recommendations = generateBasicRecommendations(residualRisk, 0);

  // Recommandations basées sur l'efficacité des contrôles
  if (controlEffectiveness < 50) {
    recommendations.unshift(
      "⚡ Efficacité des contrôles insuffisante (<50%)",
      "🔄 Révision des mesures de contrôle nécessaire",
      "⬆️ Privilégier les mesures de niveau hiérarchique supérieur"
    );
  } else if (controlEffectiveness < 75) {
    recommendations.push(
      "📈 Possibilité d'amélioration des contrôles",
      "🔍 Évaluer l'ajout de mesures complémentaires"
    );
  } else {
    recommendations.push(
      "✅ Excellente efficacité des contrôles",
      "🔄 Maintenir l'efficacité par formation et maintenance"
    );
  }

  // Recommandations basées sur la diversité des contrôles
  const hierarchyLevels = new Set(controlMeasures.map(cm => cm.hierarchyLevel));
  if (hierarchyLevels.size < 2) {
    recommendations.push(
      "🛡️ Envisager la défense en profondeur",
      "🔄 Ajouter des mesures de niveaux hiérarchiques différents"
    );
  }

  return recommendations;
}

// =================== FONCTIONS MULTI-TENANT ===================

/**
 * Calcule les statistiques de risque pour un tenant
 */
export function calculateTenantRiskStatistics(tenantASTs: AST[]) {
  const riskDistribution: Record<RiskLevel, number> = {
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 0,
    [RiskLevel.HIGH]: 0,
    [RiskLevel.CRITICAL]: 0
  };

  let totalRiskScore = 0;
  let totalHazards = 0;

  tenantASTs.forEach(ast => {
    const identifiedHazards = (ast as any).identifiedHazards || [];
    identifiedHazards.forEach((hazard: any) => {
      const riskLevel = hazard.residualRiskLevel || RiskLevel.MEDIUM;
      riskDistribution[riskLevel]++;
      totalRiskScore += (Number(hazard.severityLevel) || 3) * (Number(hazard.probabilityLevel) || 3);
      totalHazards++;
    });
  });

  return {
    riskDistribution,
    averageRiskScore: totalHazards > 0 ? totalRiskScore / totalHazards : 0,
    totalHazards,
    criticalCount: riskDistribution[RiskLevel.CRITICAL],
    highRiskCount: riskDistribution[RiskLevel.HIGH],
    acceptableRiskPercentage: totalHazards > 0 ? 
      (riskDistribution[RiskLevel.LOW] / totalHazards) * 100 : 0
  };
}

export default {
  calculateBasicRisk,
  calculateRiskWithExposure,
  calculateResidualRisk,
  calculateControlEffectiveness,
  analyzeASTRisk,
  calculateTenantRiskStatistics,
  STANDARD_RISK_MATRIX,
  EXPOSURE_ADJUSTED_MATRIX
};
