// app/types/hazards.ts

import { 
  BaseEntity, 
  MultiLanguageText, 
  RiskLevel, 
  SeverityLevel, 
  LikelihoodLevel 
} from './index';

// =================== ENUM STANDARDS RÉGLEMENTAIRES ===================
export enum RegulatoryStandard {
  // Standards québécois - RSST
  RSST_ARTICLE_2_9_1 = 'RSST_ARTICLE_2_9_1',
  RSST_ARTICLE_2_10 = 'RSST_ARTICLE_2_10', 
  RSST_ARTICLE_2_11 = 'RSST_ARTICLE_2_11',
  SIMDUT_2015 = 'SIMDUT_2015',
  
  // Standards canadiens - CSA
  CSA_Z462 = 'CSA_Z462',
  CSA_Z94_3 = 'CSA_Z94_3',
  CSA_Z259 = 'CSA_Z259',
  CSA_Z96 = 'CSA_Z96',
  
  // Standards américains - OSHA
  OSHA_1910_146 = 'OSHA_1910_146',
  OSHA_1926_501 = 'OSHA_1926_501',
  
  // Standards ANSI
  ANSI_Z87_1 = 'ANSI_Z87_1',
  ANSI_Z89_1 = 'ANSI_Z89_1',
  
  // Standards internationaux - ISO
  ISO_45001 = 'ISO_45001',
  ISO_14001 = 'ISO_14001'
}

// =================== TYPES DANGERS ===================
export interface Hazard extends BaseEntity {
  name: string;
  displayName?: MultiLanguageText;
  description: string;
  category: HazardCategory;
  subcategory?: string;
  riskLevel: RiskLevel;
  severity: SeverityLevel;
  likelihood: LikelihoodLevel;
  
  // Caractéristiques spécifiques
  characteristics: {
    isVisibleWarning: boolean;
    requiresSpecialTraining: boolean;
    hasImmediateEffect: boolean;
    canCauseFatality: boolean;
    affectsMultiplePeople: boolean;
    isEnvironmentalHazard: boolean;
  };
  
  // Sources et causes
  commonSources: string[];
  triggerConditions: string[];
  
  // Effets potentiels
  potentialInjuries: string[];
  healthEffects: string[];
  environmentalImpact?: string[];
  
  // Prévention et contrôle
  preventiveMeasures: string[];
  requiredPPE: string[];
  emergencyProcedures: string[];
  
  // Réglementation
  applicableStandards: RegulatoryStandard[];
  complianceRequirements: string[];
  
  // Métadonnées
  tags: string[];
  keywords: string[];
  relatedHazards: string[];
  
  // Documentation
  references: string[];
  images?: string[];
  videos?: string[];
  
  // Validation
  isValidated: boolean;
  validatedBy?: string;
  validatedDate?: string;
  reviewDate?: string;
}

export enum HazardCategory {
  BIOLOGICAL = 'BIOLOGICAL',
  CHEMICAL = 'CHEMICAL', 
  ELECTRICAL = 'ELECTRICAL',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  ERGONOMIC = 'ERGONOMIC',
  GAS = 'GAS',
  MECHANICAL = 'MECHANICAL',
  PHYSICAL = 'PHYSICAL',
  WORKPLACE = 'WORKPLACE'
}

// =================== ÉVALUATION DES RISQUES ===================
export interface RiskAssessment extends BaseEntity {
  hazardId: string;
  assessorId: string;
  assessmentDate: string;
  
  // Évaluation
  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;
  riskScore: number;
  
  // Matrice de risque
  riskMatrix: RiskMatrix;
  
  // Analyse
  exposureFrequency: 'RARE' | 'OCCASIONAL' | 'FREQUENT' | 'CONTINUOUS';
  numberOfPeopleExposed: number;
  durationOfExposure: string;
  
  // Contrôles existants
  existingControls: string[];
  controlEffectiveness: ControlEffectiveness;
  
  // Recommandations
  recommendedActions: string[];
  additionalControls: string[];
  monitoringRequirements: string[];
  
  // Validation
  isApproved: boolean;
  approvedBy?: string;
  approvalDate?: string;
  nextReviewDate: string;
  
  // Commentaires
  comments?: string;
  assumptions?: string[];
  limitations?: string[];
}

export interface RiskMatrix {
  severity: MatrixLevel;
  likelihood: MatrixLevel;
  riskScore: number;
  riskLevel: MatrixRiskLevel;
  calculationMethod: string;
  customFactors?: Record<string, number>;
}

export enum MatrixLevel {
  VERY_LOW = 1,
  LOW = 2,
  MEDIUM = 3,
  HIGH = 4,
  VERY_HIGH = 5
}

export enum MatrixRiskLevel {
  NEGLIGIBLE = 'NEGLIGIBLE',
  LOW = 'LOW',
  MODERATE = 'MODERATE', 
  HIGH = 'HIGH',
  EXTREME = 'EXTREME'
}

export interface ControlEffectiveness {
  engineering: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  administrative: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  ppe: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  overall: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

// =================== CATALOGUE DE DANGERS ===================
export interface HazardCatalog {
  id: string;
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
  
  // Organisation
  categories: HazardCategoryInfo[];
  hazards: Hazard[];
  
  // Métadonnées
  applicableIndustries: string[];
  applicableRegions: string[];
  complianceFrameworks: RegulatoryStandard[];
  
  // Statistiques
  totalHazards: number;
  mostCommonHazards: string[];
  highestRiskHazards: string[];
}

export interface HazardCategoryInfo {
  category: HazardCategory;
  name: MultiLanguageText;
  description: MultiLanguageText;
  subcategories: HazardSubcategoryInfo[];
  hazardCount: number;
  averageRiskLevel: RiskLevel;
  requiredTraining: string[];
  commonPPE: string[];
}

export interface HazardSubcategoryInfo {
  id: string;
  name: MultiLanguageText;
  description: MultiLanguageText;
  parentCategory: HazardCategory;
  hazardIds: string[];
  specificConsiderations: string[];
}

// =================== RELATIONS ET INTERACTIONS ===================
export interface HazardRelationship {
  id: string;
  primaryHazardId: string;
  relatedHazardId: string;
  relationshipType: HazardRelationshipType;
  interactionEffect: 'AMPLIFIES' | 'REDUCES' | 'NEUTRALIZES' | 'CREATES_NEW';
  description: string;
  combinedRiskLevel?: RiskLevel;
  additionalPrecautions: string[];
}

export enum HazardRelationshipType {
  COMPOUND = 'COMPOUND',
  SEQUENTIAL = 'SEQUENTIAL',
  SIMULTANEOUS = 'SIMULTANEOUS',
  CONDITIONAL = 'CONDITIONAL',
  MUTUALLY_EXCLUSIVE = 'MUTUALLY_EXCLUSIVE'
}

// =================== INCIDENTS ET ÉVÉNEMENTS ===================
export interface HazardIncident extends BaseEntity {
  hazardId: string;
  incidentType: 'NEAR_MISS' | 'MINOR_INJURY' | 'MAJOR_INJURY' | 'FATALITY' | 'PROPERTY_DAMAGE';
  
  // Détails de l'incident
  dateOccurred: string;
  location: string;
  description: string;
  immediateConsequences: string[];
  
  // Personnes impliquées
  peopleInvolved: IncidentPerson[];
  witnesses: IncidentPerson[];
  
  // Analyse
  rootCauses: string[];
  contributingFactors: string[];
  failedControls: string[];
  
  // Actions
  immediateActions: string[];
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  
  // Investigation
  investigatedBy: string;
  investigationDate: string;
  investigationStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
  
  // Coûts et impacts
  estimatedCost?: number;
  workDaysLost?: number;
  regulatoryReporting: boolean;
  reportingDate?: string;
  
  // Documentation
  photos?: string[];
  documents?: string[];
  externalReports?: string[];
}

export interface IncidentPerson {
  id: string;
  name: string;
  role: string;
  injuryType?: string;
  injurySeverity?: 'MINOR' | 'MODERATE' | 'SEVERE' | 'FATAL';
  medicalTreatment?: string;
  timeOffWork?: number;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsiblePerson: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completionDate?: string;
  effectiveness?: 'NOT_EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'FULLY_EFFECTIVE';
  cost?: number;
}

export interface PreventiveAction {
  id: string;
  description: string;
  targetHazards: string[];
  implementationPlan: string;
  responsiblePerson: string;
  expectedCompletion: string;
  monitoringMethod: string;
  successCriteria: string[];
}

// =================== ANALYTIQUES ET REPORTING ===================
export interface HazardAnalytics {
  timeframeStart: string;
  timeframeEnd: string;
  
  // Statistiques générales
  totalHazardsIdentified: number;
  newHazardsAdded: number;
  hazardsResolved: number;
  
  // Distribution par catégorie
  hazardDistribution: Record<HazardCategory, number>;
  
  // Tendances de risque
  riskTrends: {
    period: string;
    averageRiskLevel: number;
    highRiskCount: number;
    riskLevelChanges: RiskLevelChange[];
  }[];
  
  // Fréquence des incidents
  incidentFrequency: {
    category: HazardCategory;
    incidentCount: number;
    severity: string;
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  }[];
  
  // Performance des contrôles
  controlEffectiveness: {
    hazardId: string;
    controlType: string;
    effectivenessScore: number;
    incidentReduction: number;
  }[];
  
  // Coûts
  costAnalysis: {
    preventiveCosts: number;
    incidentCosts: number;
    totalCosts: number;
    costPerHazard: number;
    roi: number;
  };
  
  // Recommandations
  recommendations: string[];
  priorityActions: string[];
}

export interface RiskLevelChange {
  hazardId: string;
  previousLevel: RiskLevel;
  currentLevel: RiskLevel;
  changeDate: string;
  changeReason: string;
}

// =================== SERVICES ET UTILITAIRES ===================
export interface HazardService {
  // Recherche et filtrage
  searchHazards: (criteria: SearchCriteria) => Promise<Hazard[]>;
  getHazardsByCategory: (category: HazardCategory) => Promise<Hazard[]>;
  getHighRiskHazards: (threshold: RiskLevel) => Promise<Hazard[]>;
  
  // Évaluation des risques
  calculateRiskScore: (severity: SeverityLevel, likelihood: LikelihoodLevel) => number;
  assessHazardRisk: (hazardId: string, context: AssessmentContext) => Promise<RiskAssessment>;
  updateRiskAssessment: (assessmentId: string, updates: Partial<RiskAssessment>) => Promise<RiskAssessment>;
  
  // Gestion des incidents
  recordIncident: (incident: Omit<HazardIncident, 'id' | 'createdDate' | 'lastUpdated'>) => Promise<HazardIncident>;
  analyzeIncidentTrends: (timeframe: DateRange) => Promise<IncidentAnalysis>;
  
  // Rapports
  generateHazardReport: (options: HazardReportOptions) => Promise<HazardReport>;
  exportHazardData: (format: 'CSV' | 'EXCEL' | 'PDF') => Promise<string>;
  
  // Validation et conformité
  validateHazardData: (hazard: Hazard) => ValidationResult;
  checkCompliance: (hazards: Hazard[], standards: RegulatoryStandard[]) => ComplianceReport;
}

export interface SearchCriteria {
  searchTerm?: string;
  categories?: HazardCategory[];
  riskLevels?: RiskLevel[];
  keywords?: string[];
  dateRange?: DateRange;
  validationStatus?: boolean;
}

export interface AssessmentContext {
  workEnvironment: string;
  equipmentUsed: string[];
  numberOfWorkers: number;
  experienceLevel: 'NOVICE' | 'INTERMEDIATE' | 'EXPERT';
  safetyMeasures: string[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface IncidentAnalysis {
  totalIncidents: number;
  incidentsByCategory: Record<HazardCategory, number>;
  severityDistribution: Record<string, number>;
  monthlyTrends: MonthlyIncidentData[];
  topHazards: string[];
  commonCauses: string[];
}

export interface MonthlyIncidentData {
  month: string;
  incidentCount: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: HazardCategory;
}

export interface HazardReport {
  id: string;
  title: string;
  generatedDate: string;
  generatedBy: string;
  
  // Contenu
  summary: string;
  hazardCount: number;
  categoricalBreakdown: Record<HazardCategory, CategoryFrequency>;
  riskDistribution: Record<RiskLevel, number>;
  
  // Analyses
  topRisks: Hazard[];
  emergingHazards: Hazard[];
  controlGaps: string[];
  
  // Recommandations
  priorityActions: string[];
  budgetEstimates: Record<string, number>;
  timelineEstimates: Record<string, string>;
  
  // Métadonnées
  reportType: 'SUMMARY' | 'DETAILED' | 'COMPLIANCE' | 'INCIDENT';
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  distributionList: string[];
}

export interface CategoryFrequency {
  count: number;
  percentage: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  averageRiskLevel: RiskLevel;
}

export interface HazardReportOptions {
  includeIncidents: boolean;
  includeAnalytics: boolean;
  timeframe: DateRange;
  categories?: HazardCategory[];
  riskThreshold?: RiskLevel;
  format: 'PDF' | 'EXCEL' | 'HTML';
  language: 'fr' | 'en';
}

export interface ComplianceReport {
  overallCompliance: number;
  standardsAssessed: RegulatoryStandard[];
  complianceByStandard: Record<RegulatoryStandard, number>;
  nonComplianceIssues: string[];
  recommendedActions: string[];
  nextAuditDate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// =================== RÈGLES DE CALCUL ===================
export interface RiskCalculationRule {
  id: string;
  name: string;
  description: string;
  formula: string;
  parameters: Record<string, number>;
  applicableCategories: HazardCategory[];
  isDefault: boolean;
}

// =================== TYPES UTILITAIRES ===================
export type HazardId = string;
export type AssessmentId = string;
export type IncidentId = string;

// =================== EXPORTS POUR COMPATIBILITÉ ===================
export type { Hazard as HazardEntity };
export type { HazardCategory as Category };
