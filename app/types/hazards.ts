// types/hazards.ts - Types spécifiques aux dangers

import { 
  BaseEntity, 
  MultiLanguageText, 
  RiskLevel, 
  SeverityLevel, 
  ProbabilityLevel,
  WeatherRestriction,
  WeatherParameter
} from './index';

// =================== ÉNUMÉRATIONS DANGERS ===================
export enum HazardCategory {
  ELECTRICAL = 'electrical',
  MECHANICAL = 'mechanical',
  PHYSICAL = 'physical',
  CHEMICAL = 'chemical',
  BIOLOGICAL = 'biological',
  ENVIRONMENTAL = 'environmental',
  WORKPLACE = 'workplace',
  ERGONOMIC = 'ergonomic',
  RADIOLOGICAL = 'radiological',
  PSYCHOSOCIAL = 'psychosocial'
}

export enum ExposureFrequency {
  CONTINUOUS = 'continuous',        // Continue (>6h/jour)
  FREQUENT = 'frequent',           // Fréquente (1-6h/jour)
  OCCASIONAL = 'occasional',       // Occasionnelle (30min-1h/jour)
  INFREQUENT = 'infrequent',      // Peu fréquente (<30min/jour)
  RARE = 'rare'                   // Rare (mensuel ou moins)
}

export enum BodyPartAffected {
  HEAD = 'head',
  EYES = 'eyes',
  EARS = 'ears',
  RESPIRATORY = 'respiratory',
  ARMS = 'arms',
  HANDS = 'hands',
  BACK = 'back',
  LEGS = 'legs',
  FEET = 'feet',
  SKIN = 'skin',
  WHOLE_BODY = 'whole_body',
  INTERNAL_ORGANS = 'internal_organs'
}

export enum InjuryType {
  CUTS = 'cuts',
  BURNS = 'burns',
  FRACTURES = 'fractures',
  SPRAINS = 'sprains',
  CONTUSIONS = 'contusions',
  LACERATIONS = 'lacerations',
  PUNCTURES = 'punctures',
  POISONING = 'poisoning',
  ASPHYXIATION = 'asphyxiation',
  ELECTROCUTION = 'electrocution',
  CRUSHING = 'crushing',
  REPETITIVE_STRAIN = 'repetitive_strain',
  HEARING_LOSS = 'hearing_loss',
  VISION_IMPAIRMENT = 'vision_impairment',
  RESPIRATORY_DAMAGE = 'respiratory_damage',
  DERMATITIS = 'dermatitis',
  MUSCULOSKELETAL = 'musculoskeletal'
}

export enum RegulatoryStandard {
  // Standards canadiens
  CSA_Z462 = 'csa_z462',           // Sécurité électrique en milieu de travail
  CSA_Z94_3 = 'csa_z94_3',         // Protection respiratoire
  CSA_Z259 = 'csa_z259',           // Protection contre les chutes
  CSA_Z96 = 'csa_z96',             // Vêtements haute visibilité
  
  // RSST Québec
  RSST_ARTICLE_2_9_1 = 'rsst_2_9_1',   // Espaces clos
  RSST_ARTICLE_2_10 = 'rsst_2_10',      // Travail en hauteur
  RSST_ARTICLE_2_11 = 'rsst_2_11',      // Excavation
  
  // Standards internationaux
  ANSI_Z87_1 = 'ansi_z87_1',       // Protection oculaire
  ANSI_Z89_1 = 'ansi_z89_1',       // Casques de protection
  EN_397 = 'en_397',               // Casques industriels (Europe)
  EN_388 = 'en_388',               // Gants de protection
  
  // OSHA (États-Unis)
  OSHA_1910_146 = 'osha_1910_146', // Permit-required confined spaces
  OSHA_1926_501 = 'osha_1926_501', // Fall protection
  
  // SIMDUT
  SIMDUT_2015 = 'simdut_2015',     // Système d'information sur les matières dangereuses
  
  // ISO
  ISO_45001 = 'iso_45001',         // Système de management de la santé et sécurité
  ISO_14001 = 'iso_14001'          // Système de management environnemental
}

// =================== INTERFACE DANGER PRINCIPALE ===================
export interface Hazard extends BaseEntity {
  // Identification
  name: string;
  displayName?: MultiLanguageText;
  category: HazardCategory;
  subcategory?: string;
  code?: string; // Code interne de classification
  
  // Description
  description: string;
  detailedDescription?: MultiLanguageText;
  synonyms?: string[];
  keywords?: string[];
  
  // Évaluation par défaut
  defaultSeverity?: SeverityLevel;
  defaultProbability?: ProbabilityLevel;
  defaultRiskLevel?: RiskLevel;
  
  // Spécifications techniques
  physicalProperties?: PhysicalProperties;
  chemicalProperties?: ChemicalProperties;
  biologicalProperties?: BiologicalProperties;
  
  // Exposition et effets
  exposureRoutes?: ExposureRoute[];
  bodyPartsAffected: BodyPartAffected[];
  potentialInjuries: InjuryType[];
  acuteEffects?: string[];
  chronicEffects?: string[];
  
  // Limites d'exposition
  exposureLimits?: ExposureLimit[];
  monitoringRequirements?: MonitoringRequirement[];
  
  // Facteurs de risque
  riskFactors: RiskFactor[];
  aggravatingFactors?: string[];
  protectiveFactors?: string[];
  
  // Contexte d'application
  workTypes: string[]; // IDs des types de travail
  industries?: string[];
  environments?: EnvironmentType[];
  
  // Conditions météo
  weatherRestrictions?: WeatherRestriction[];
  seasonalConsiderations?: SeasonalConsideration[];
  
  // Réglementation et conformité
  regulatoryStandards: RegulatoryStandard[];
  complianceRequirements?: ComplianceRequirement[];
  
  // Mesures de prévention
  requiredTraining?: string[];
  requiredCertifications?: string[];
  requiredEquipment?: string[]; // IDs équipements
  recommendedControlMeasures?: string[]; // IDs mesures de contrôle
  
  // Procédures d'urgence
  emergencyProcedures?: EmergencyProcedureReference[];
  firstAidRequirements?: FirstAidRequirement[];
  evacuationRequirements?: EvacuationRequirement;
  
  // Documentation
  references?: Reference[];
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewedBy?: string;
  
  // Métadonnées
  isActive: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  frequency?: number; // Fréquence d'occurrence dans l'industrie
  costImpact?: number; // Impact financier moyen
  
  // Versions et révisions
  versionNumber?: string;
  previousVersions?: string[];
  changeLog?: ChangeLogEntry[];
}

// =================== TYPES AUXILIAIRES ===================
export interface PhysicalProperties {
  temperature?: TemperatureRange;
  pressure?: PressureRange;
  noise?: NoiseLevel;
  vibration?: VibrationLevel;
  radiation?: RadiationLevel;
  lighting?: LightingCondition;
  space?: SpaceConstraint;
}

export interface ChemicalProperties {
  casNumber?: string;
  molecularFormula?: string;
  molarMass?: number;
  boilingPoint?: number;
  meltingPoint?: number;
  density?: number;
  vaporPressure?: number;
  solubility?: string;
  pH?: number;
  flashPoint?: number;
  autoIgnitionTemp?: number;
  explosiveLimits?: {
    lower: number;
    upper: number;
  };
  reactivity?: ReactivityData;
}

export interface BiologicalProperties {
  organism?: string;
  pathogenicity?: PathogenicityLevel;
  infectivity?: InfectivityLevel;
  virulence?: VirulenceLevel;
  transmissionRoute?: TransmissionRoute[];
  incubationPeriod?: number; // en jours
  infectiousPeriod?: number; // en jours
  survivalOutsideHost?: number; // en heures
  disinfectionRequirements?: DisinfectionRequirement[];
}

export interface ExposureRoute {
  route: 'inhalation' | 'dermal' | 'oral' | 'injection' | 'ocular';
  likelihood: 'high' | 'medium' | 'low';
  description?: string;
}

export interface ExposureLimit {
  type: 'TWA' | 'STEL' | 'Ceiling' | 'Peak';
  value: number;
  unit: string;
  duration?: number; // en minutes
  standard: RegulatoryStandard;
  notes?: string;
}

export interface MonitoringRequirement {
  parameter: string;
  frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  method: string;
  equipment?: string;
  recordingRequired: boolean;
  alertLevels?: AlertLevel[];
}

export interface AlertLevel {
  level: 'caution' | 'warning' | 'danger' | 'emergency';
  threshold: number;
  unit: string;
  action: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'increases' | 'decreases';
  magnitude: 'low' | 'medium' | 'high';
  description?: string;
}

export enum EnvironmentType {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  CONFINED_SPACE = 'confined_space',
  UNDERGROUND = 'underground',
  ELEVATED = 'elevated',
  AQUATIC = 'aquatic',
  EXTREME_TEMPERATURE = 'extreme_temperature',
  HIGH_PRESSURE = 'high_pressure',
  LOW_PRESSURE = 'low_pressure',
  CORROSIVE = 'corrosive',
  EXPLOSIVE_ATMOSPHERE = 'explosive_atmosphere'
}

export interface SeasonalConsideration {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  riskLevel: RiskLevel;
  specificRisks?: string[];
  additionalPrecautions?: string[];
}

export interface ComplianceRequirement {
  standard: RegulatoryStandard;
  requirement: string;
  mandatory: boolean;
  frequency?: string;
  documentation?: string[];
  inspectionRequired?: boolean;
}

export interface EmergencyProcedureReference {
  procedureId: string;
  procedureName: string;
  triggerConditions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface FirstAidRequirement {
  injury: InjuryType;
  immediateActions: string[];
  treatmentProtocol?: string;
  medicationRequired?: string[];
  hospitalRequired?: boolean;
  specialistRequired?: string;
}

export interface EvacuationRequirement {
  triggerConditions: string[];
  evacuationRadius?: number; // en mètres
  evacuationDirection?: string;
  shelterInPlace?: boolean;
  specialInstructions?: string[];
}

export interface Reference {
  title: string;
  author?: string;
  source: string;
  date?: Date;
  url?: string;
  standard?: RegulatoryStandard;
  relevance: 'primary' | 'secondary' | 'supplementary';
}

export interface ChangeLogEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  reason: string;
}

// =================== TYPES SPÉCIALISÉS ===================
export interface TemperatureRange {
  min?: number;
  max?: number;
  unit: 'celsius' | 'fahrenheit' | 'kelvin';
  criticalPoints?: number[];
}

export interface PressureRange {
  min?: number;
  max?: number;
  unit: 'pascal' | 'bar' | 'psi' | 'mmHg';
  vacuum?: boolean;
}

export interface NoiseLevel {
  level: number;
  unit: 'dB' | 'dBA' | 'dBC';
  frequency?: number; // Hz
  duration?: number; // minutes
  type?: 'continuous' | 'intermittent' | 'impact';
}

export interface VibrationLevel {
  acceleration: number;
  unit: 'm/s²' | 'g';
  frequency: number; // Hz
  direction: 'x' | 'y' | 'z' | 'combined';
  bodyPart: BodyPartAffected;
}

export interface RadiationLevel {
  type: 'ionizing' | 'non_ionizing';
  dose?: number;
  doseRate?: number;
  unit: 'Sv' | 'mSv' | 'μSv' | 'Gy' | 'mGy' | 'W/m²';
  wavelength?: number; // pour radiations non-ionisantes
  frequency?: number; // Hz
}

export interface LightingCondition {
  illuminance?: number; // lux
  uniformity?: number;
  glare?: 'none' | 'low' | 'medium' | 'high';
  flickering?: boolean;
  colorTemperature?: number; // Kelvin
  UV_content?: number;
}

export interface SpaceConstraint {
  minimumHeight?: number; // cm
  minimumWidth?: number; // cm
  minimumDepth?: number; // cm
  accessLimitations?: string[];
  confinedSpace?: boolean;
  entryRequirements?: string[];
}

export interface ReactivityData {
  stability: 'stable' | 'unstable';
  incompatibleMaterials?: string[];
  hazardousDecomposition?: string[];
  polymerization?: 'none' | 'possible' | 'likely';
  conditions_to_avoid?: string[];
}

export enum PathogenicityLevel {
  NON_PATHOGENIC = 'non_pathogenic',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export enum InfectivityLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum VirulenceLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum TransmissionRoute {
  AIRBORNE = 'airborne',
  DROPLET = 'droplet',
  CONTACT = 'contact',
  VECTOR = 'vector',
  FOODBORNE = 'foodborne',
  WATERBORNE = 'waterborne',
  BLOODBORNE = 'bloodborne'
}

export interface DisinfectionRequirement {
  agent: string;
  concentration: number;
  contactTime: number; // minutes
  temperature?: number; // celsius
  method: 'spray' | 'wipe' | 'immersion' | 'fumigation';
}

// =================== TYPES UTILITAIRES DANGERS ===================
export interface HazardSearchCriteria {
  category?: HazardCategory[];
  workType?: string[];
  riskLevel?: RiskLevel[];
  bodyPart?: BodyPartAffected[];
  injuryType?: InjuryType[];
  environment?: EnvironmentType[];
  season?: string;
  weatherConditions?: WeatherParameter[];
  query?: string;
}

export interface HazardAssessmentTemplate {
  hazardId: string;
  assessmentQuestions: AssessmentQuestion[];
  scoringMethod: 'matrix' | 'additive' | 'weighted';
  riskMatrix?: RiskMatrix;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'scale' | 'boolean' | 'multiple_choice' | 'text';
  options?: string[];
  weight?: number;
  category: 'severity' | 'probability' | 'exposure' | 'control';
}

export interface RiskMatrix {
  severityLevels: MatrixLevel[];
  probabilityLevels: MatrixLevel[];
  riskLevels: RiskLevel[][];
}

export interface MatrixLevel {
  value: number;
  label: string;
  description: string;
  color?: string;
}

export interface HazardStatistics {
  totalHazards: number;
  byCategory: Record<HazardCategory, number>;
  byRiskLevel: Record<RiskLevel, number>;
  mostCommon: string[];
  leastCommon: string[];
  recentlyUpdated: string[];
  requiresReview: string[];
}

// =================== EXPORTS ===================
export type {
  Hazard,
  PhysicalProperties,
  ChemicalProperties,
  BiologicalProperties,
  ExposureRoute,
  ExposureLimit,
  MonitoringRequirement,
  AlertLevel,
  RiskFactor,
  SeasonalConsideration,
  ComplianceRequirement,
  EmergencyProcedureReference,
  FirstAidRequirement,
  EvacuationRequirement,
  Reference,
  ChangeLogEntry,
  TemperatureRange,
  PressureRange,
  NoiseLevel,
  VibrationLevel,
  RadiationLevel,
  LightingCondition,
  SpaceConstraint,
  ReactivityData,
  DisinfectionRequirement,
  HazardSearchCriteria,
  HazardAssessmentTemplate,
  AssessmentQuestion,
  RiskMatrix,
  MatrixLevel,
  HazardStatistics
};
