// app/types/hazards.ts

import { 
  BaseEntity, 
  MultiLanguageText, 
  RiskLevel, 
  SeverityLevel, 
  LikelihoodLevel 
} from './index';

// =================== TYPES DANGERS ===================
export interface Hazard extends BaseEntity {
  name: string;
  displayName?: MultiLanguageText;
  description: string;
  category: HazardCategory;
  subcategory?: string;
  
  // Évaluation des risques
  severity: SeverityLevel;
  likelihood: LikelihoodLevel;
  riskLevel: RiskLevel;
  
  // Méthodes de contrôle hiérarchiques
  eliminationMethods?: string[];
  engineeringControls?: string[];
  administrativeControls?: string[];
  controlMeasures: string[];
  
  // Équipements requis
  requiredEquipment: string[];
  
  // Procédures d'urgence
  emergencyProcedures?: string[];
  
  // Références réglementaires
  regulatoryReferences: string[];
  
  // Association avec types de travail
  workTypes: string[];
  
  // Métadonnées
  version?: string;
  tags?: string[];
}

export type HazardCategory = 
  | 'BIOLOGICAL'
  | 'CHEMICAL'
  | 'ELECTRICAL'
  | 'ENVIRONMENTAL'
  | 'ERGONOMIC'
  | 'GAS'
  | 'MECHANICAL'
  | 'PHYSICAL'
  | 'WORKPLACE'
  | 'RADIOLOGICAL'
  | 'THERMAL'
  | 'PSYCHOSOCIAL'
  | 'OTHER';

// =================== ÉVALUATION DES RISQUES ===================
export interface RiskAssessment {
  id: string;
  hazardId: string;
  assessorId: string;
  assessmentDate: string;
  
  // Évaluation
  severity: SeverityLevel;
  likelihood: LikelihoodLevel;
  riskLevel: RiskLevel;
  
  // Justifications
  severityJustification?: string;
  likelihoodJustification?: string;
  
  // Mesures de contrôle évaluées
  controlMeasuresEffectiveness: ControlEffectiveness[];
  
  // Risque résiduel après contrôles
  residualRisk: {
    severity: SeverityLevel;
    likelihood: LikelihoodLevel;
    riskLevel: RiskLevel;
  };
  
  // Recommandations
  recommendations?: string[];
  nextReviewDate?: string;
  
  // Validation
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: string;
}

export interface ControlEffectiveness {
  controlMeasure: string;
  effectiveness: 'none' | 'low' | 'medium' | 'high' | 'complete';
  notes?: string;
  costEstimate?: number;
  implementationDifficulty?: 'easy' | 'medium' | 'hard' | 'very_hard';
}

// =================== MATRICE DE RISQUES ===================
export interface RiskMatrix {
  id: string;
  name: string;
  description?: string;
  
  // Configuration de la matrice
  severityLevels: MatrixLevel[];
  likelihoodLevels: MatrixLevel[];
  riskLevels: MatrixRiskLevel[];
  
  // Règles de calcul
  riskCalculationRules: RiskCalculationRule[];
  
  // Métadonnées
  isDefault: boolean;
  organizationId?: string;
  createdBy: string;
  createdDate: string;
}

export interface MatrixLevel {
  value: number;
  label: string;
  description: string;
  color?: string;
}

export interface MatrixRiskLevel {
  level: RiskLevel;
  label: string;
  color: string;
  actionRequired: string;
  timeframe?: string;
}

export interface RiskCalculationRule {
  severityValue: number;
  likelihoodValue: number;
  resultingRiskLevel: RiskLevel;
}

// =================== CATALOGUES DE DANGERS ===================
export interface HazardCatalog {
  id: string;
  name: string;
  description?: string;
  version: string;
  
  // Organisation des dangers
  categories: HazardCategoryInfo[];
  hazards: Hazard[];
  
  // Configuration
  isPublic: boolean;
  organizationId?: string;
  industry?: string;
  region?: string;
  
  // Métadonnées
  publishedDate: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  maintainerIds: string[];
}

export interface HazardCategoryInfo {
  category: HazardCategory;
  name: MultiLanguageText;
  description: MultiLanguageText;
  icon?: string;
  color?: string;
  subcategories?: HazardSubcategoryInfo[];
}

export interface HazardSubcategoryInfo {
  id: string;
  name: string;
  description?: string;
  parentCategory: HazardCategory;
}

// =================== RELATIONS ET DÉPENDANCES ===================
export interface HazardRelationship {
  id: string;
  primaryHazardId: string;
  relatedHazardId: string;
  relationshipType: HazardRelationshipType;
  strength: 'weak' | 'medium' | 'strong';
  description?: string;
  bidirectional: boolean;
}

export type HazardRelationshipType = 
  | 'amplifies'        // Un danger amplifie l'autre
  | 'triggers'         // Un danger déclenche l'autre
  | 'masks'           // Un danger cache l'autre
  | 'competes'        // Les dangers sont en compétition
  | 'synergistic'     // Effet synergique
  | 'mutually_exclusive'; // Mutuellement exclusifs

// =================== INCIDENTS ET HISTORIQUE ===================
export interface HazardIncident {
  id: string;
  hazardIds: string[];
  incidentDate: string;
  location: string;
  
  // Description
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  actualConsequences: string[];
  potentialConsequences: string[];
  
  // Causes
  rootCauses: string[];
  contributingFactors: string[];
  controlFailures: string[];
  
  // Personnes impliquées
  peopleInvolved: IncidentPerson[];
  witnessAccounts?: string[];
  
  // Actions
  immediateActions: string[];
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  
  // Suivi
  status: IncidentStatus;
  investigationCompleted: boolean;
  lessonsLearned?: string[];
  
  // Coûts
  directCosts?: number;
  indirectCosts?: number;
  lostTime?: number; // heures
}

export interface IncidentPerson {
  id: string;
  name: string;
  role: string;
  injuryType?: string;
  injurySeverity?: 'none' | 'first_aid' | 'medical' | 'lost_time' | 'fatality';
  experienceLevel?: string;
  trainingStatus?: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: ActionStatus;
  completedDate?: string;
  notes?: string;
}

export interface PreventiveAction {
  id: string;
  description: string;
  hazardIds: string[];
  assignedTo: string;
  dueDate: string;
  estimatedCost?: number;
  expectedBenefit: string;
  status: ActionStatus;
}

export type IncidentStatus = 
  | 'reported'
  | 'under_investigation'
  | 'investigation_complete'
  | 'actions_pending'
  | 'closed';

export type ActionStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

// =================== ANALYSES ET STATISTIQUES ===================
export interface HazardAnalytics {
  totalHazards: number;
  byCategory: Record<HazardCategory, number>;
  byRiskLevel: Record<RiskLevel, number>;
  bySeverity: Record<SeverityLevel, number>;
  
  // Tendances
  trends: {
    newHazardsThisMonth: number;
    riskLevelChanges: RiskLevelChange[];
    mostCommonCategories: CategoryFrequency[];
  };
  
  // Incidents
  incidentStats: {
    totalIncidents: number;
    incidentsByHazard: Array<{
      hazardId: string;
      hazardName: string;
      incidentCount: number;
      avgSeverity: number;
    }>;
    incidentTrends: MonthlyIncidentData[];
  };
  
  // Efficacité des contrôles
  controlEffectiveness: {
    avgEffectiveness: number;
    byControlType: Record<string, number>;
    improvementOpportunities: string[];
  };
}

export interface RiskLevelChange {
  hazardId: string;
  hazardName: string;
  previousLevel: RiskLevel;
  currentLevel: RiskLevel;
  changeDate: string;
  reason?: string;
}

export interface CategoryFrequency {
  category: HazardCategory;
  count: number;
  percentage: number;
}

export interface MonthlyIncidentData {
  month: string;
  incidentCount: number;
  avgSeverity: number;
  totalCost: number;
}

// =================== SERVICES ET UTILITAIRES ===================
export interface HazardService {
  // CRUD opérations
  getById: (id: string) => Promise<Hazard | null>;
  getAll: () => Promise<Hazard[]>;
  create: (hazard: Omit<Hazard, 'id' | 'createdDate' | 'lastUpdated'>) => Promise<Hazard>;
  update: (id: string, updates: Partial<Hazard>) => Promise<Hazard>;
  delete: (id: string) => Promise<boolean>;
  
  // Recherche et filtrage
  search: (query: string) => Promise<Hazard[]>;
  getByCategory: (category: HazardCategory) => Promise<Hazard[]>;
  getByWorkType: (workTypeId: string) => Promise<Hazard[]>;
  getByRiskLevel: (riskLevel: RiskLevel) => Promise<Hazard[]>;
  
  // Évaluation des risques
  assessRisk: (hazardId: string, assessment: Omit<RiskAssessment, 'id'>) => Promise<RiskAssessment>;
  getAssessments: (hazardId: string) => Promise<RiskAssessment[]>;
  
  // Relations
  getRelatedHazards: (hazardId: string) => Promise<Hazard[]>;
  createRelationship: (relationship: Omit<HazardRelationship, 'id'>) => Promise<HazardRelationship>;
  
  // Analytiques
  getAnalytics: (timeframe?: string) => Promise<HazardAnalytics>;
  generateReport: (options: HazardReportOptions) => Promise<HazardReport>;
}

export interface HazardReportOptions {
  categories?: HazardCategory[];
  riskLevels?: RiskLevel[];
  workTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeIncidents?: boolean;
  includeControls?: boolean;
  format: 'pdf' | 'excel' | 'csv';
}

export interface HazardReport {
  id: string;
  generatedDate: string;
  options: HazardReportOptions;
  data: {
    hazards: Hazard[];
    summary: HazardAnalytics;
    recommendations?: string[];
  };
  downloadUrl?: string;
}

// =================== TYPES EXPORTS ===================
export type HazardId = string;
export type AssessmentId = string;
export type IncidentId = string;

// =================== EXPORTS POUR COMPATIBILITÉ ===================

export type { Hazard as HazardEntity };
export type { HazardCategory as Category };

// ✅ SUPPRIMÉ LES EXPORTS CIRCULAIRES - Les types sont déjà définis dans index.ts
// Les autres fichiers peuvent importer RiskLevel, SeverityLevel depuis './index' directement
