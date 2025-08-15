// app/types/ast.ts

import { 
  BaseEntity, 
  MultiLanguageText, 
  RiskLevel, 
  SeverityLevel 
} from './index';

// =================== MATRICE DE RISQUE ===================
export interface RiskMatrixData {
  severity: RiskLevel;
  likelihood: RiskLevel;
  resultingRisk: RiskLevel;
  mitigationRequired: boolean;
  acceptableRisk: boolean;
  matrixPosition?: {
    row: number;
    column: number;
  };
  riskScore?: number;
  notes?: string;
}

// =================== TYPES AST PRINCIPAUX ===================
export interface AST extends BaseEntity {
  // Informations de base
  name: string;
  description: string;
  version: string;
  
  // Informations projet
  projectInfo: ProjectInfo;
  
  // Participants
  participants: Participant[];
  
  // Étapes de l'AST
  steps: ASTStep[];
  currentStep: number;
  completedSteps: number[];
  
  // État et statut
  status: ASTStatus;
  priority: ASTPriority;
  
  // Évaluation globale
  overallRiskLevel: RiskLevel;
  riskMatrix?: RiskMatrixData;
  
  // Validation et approbation
  validations: StepValidation[];
  finalApproval?: FinalApproval;
  
  // Métadonnées
  tenant: string;
  organizationId?: string;
  createdBy: string;
  lastModifiedBy: string;
  
  // Planification
  scheduledDate?: string;
  completedDate?: string;
  reviewDate?: string;
  expiryDate?: string;
  
  // Documentation
  attachments?: Attachment[];
  photos?: Photo[];
  
  // Historique et révisions
  revisionHistory: ASTRevision[];
  parentASTId?: string; // Pour les révisions
  
  // Configuration
  template?: ASTTemplate;
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  value: any;
  required?: boolean;
  options?: string[];
}

export interface ProjectInfo {
  workType: string;
  workTypeDetails?: WorkTypeDetails;
  location: Location;
  estimatedDuration: string;
  actualDuration?: string;
  equipmentRequired: string[];
  
  // Contexte environnemental
  environmentalConditions?: EnvironmentalConditions;
  
  // Contraintes et considérations spéciales
  specialConsiderations?: string[];
  regulatoryRequirements?: string[];
  
  // Coordination avec autres travaux
  concurrentWork?: ConcurrentWork[];
  dependencies?: WorkDependency[];
}

export interface WorkTypeDetails {
  category: string;
  subcategory?: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex';
  frequency: 'routine' | 'periodic' | 'occasional' | 'rare';
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface Location {
  site: string;
  building?: string;
  floor?: string;
  room?: string;
  specificArea?: string;
  coordinates?: Coordinates;
  accessRestrictions?: string[];
  emergencyExits?: string[];
  needsValidation?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface EnvironmentalConditions {
  temperature?: TemperatureRange;
  humidity?: number;
  lighting?: LightingConditions;
  noise?: NoiseLevel;
  airQuality?: AirQualityData;
  weather?: WeatherConditions;
}

export interface TemperatureRange {
  min: number;
  max: number;
  units: 'celsius' | 'fahrenheit';
}

export interface LightingConditions {
  type: 'natural' | 'artificial' | 'mixed' | 'poor';
  adequacy: 'excellent' | 'good' | 'adequate' | 'poor';
  requiresSupplemental: boolean;
}

export interface NoiseLevel {
  level: number; // dB
  source?: string;
  requiresProtection: boolean;
}

export interface AirQualityData {
  quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  contaminants?: string[];
  requiresVentilation: boolean;
  requiresRespiratory: boolean;
}

export interface WeatherConditions {
  condition: 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'extreme';
  impactsWork: boolean;
  mitigation?: string[];
}

export interface ConcurrentWork {
  id: string;
  description: string;
  team: string;
  timeOverlap: TimeOverlap;
  interferenceRisk: RiskLevel;
  coordinationRequired: boolean;
  communicationPlan?: string;
}

export interface TimeOverlap {
  start: string;
  end: string;
  duration: string;
}

export interface WorkDependency {
  id: string;
  description: string;
  type: 'predecessor' | 'successor' | 'concurrent';
  criticalPath: boolean;
  buffer?: string;
}

// =================== PARTICIPANTS ===================
export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  experience: ExperienceLevel;
  competencies: Competency[];
  
  // Formation et certifications
  training: TrainingRecord[];
  certifications: Certification[];
  
  // Responsabilités spécifiques
  responsibilities: string[];
  authorizations: Authorization[];
  
  // Contact et disponibilité
  contactInfo?: ContactInfo;
  availability?: Availability;
  
  // Signature et validation
  signature?: ParticipantSignature;
  participationDate?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  radio?: string;
  emergencyContact?: string;
}

export interface Availability {
  startTime: string;
  endTime: string;
  breaks?: string[];
  restrictions?: string[];
}

export interface ParticipantSignature {
  signature: string; // Base64 encoded
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export type ParticipantRole = 
  | 'team_leader'
  | 'safety_officer'
  | 'worker'
  | 'observer'
  | 'specialist'
  | 'supervisor'
  | 'client_representative'
  | 'safety_representative';

export type ExperienceLevel = 
  | 'entry'
  | 'intermediate' 
  | 'experienced'
  | 'expert'
  | 'specialist';

export interface Competency {
  id: string;
  name: string;
  level: CompetencyLevel;
  lastAssessed?: string;
  expiryDate?: string;
  evidence?: string[];
}

export type CompetencyLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface TrainingRecord {
  id: string;
  name: string;
  provider: string;
  completedDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  score?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  status: 'valid' | 'expired' | 'suspended' | 'revoked';
}

export interface Authorization {
  id: string;
  type: string;
  description: string;
  grantedBy: string;
  grantedDate: string;
  expiryDate?: string;
  restrictions?: string[];
}

// =================== ÉTAPES AST ===================
export interface ASTStep {
  stepNumber: number;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  
  // Données spécifiques à l'étape
  data: StepData;
  
  // Validation
  validation?: StepValidation;
  
  // Timing
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  
  // Responsable
  assignedTo?: string;
  completedBy?: string;
  
  // Dépendances
  dependencies?: number[]; // Numéros d'étapes prérequises
  blockers?: StepBlocker[];
}

export interface StepBlocker {
  id: string;
  description: string;
  type: 'dependency' | 'resource' | 'approval' | 'external';
  severity: 'minor' | 'major' | 'critical';
  estimatedResolution?: string;
  owner?: string;
}

export type StepData = 
  | ProjectInfoData
  | ParticipantsData
  | EquipmentData
  | HazardsData
  | ControlMeasuresData
  | RiskAssessmentData
  | EmergencyProceduresData
  | ReviewValidationData;

export interface ProjectInfoData {
  stepType: 'project_info';
  projectInfo: ProjectInfo;
  additionalNotes?: string;
}

export interface ParticipantsData {
  stepType: 'participants';
  participants: Participant[];
  teamDynamics?: TeamDynamics;
  communicationPlan?: CommunicationPlan;
}

export interface EquipmentData {
  stepType: 'equipment';
  requiredEquipment: EquipmentSelection[];
  equipmentInspections: EquipmentInspection[];
  equipmentLayout?: EquipmentLayout;
}

export interface HazardsData {
  stepType: 'hazards';
  identifiedHazards: HazardIdentification[];
  hazardInteractions?: HazardInteraction[];
  hazardPriority?: HazardPriorityMatrix;
}

export interface ControlMeasuresData {
  stepType: 'control_measures';
  controlMeasures: ControlMeasureImplementation[];
  hierarchyCompliance?: HierarchyCompliance;
  effectiveness?: ControlEffectiveness[];
}

export interface RiskAssessmentData {
  stepType: 'risk_assessment';
  riskAssessments: StepRiskAssessment[];
  residualRisks: ResidualRisk[];
  acceptanceCriteria?: RiskAcceptanceCriteria;
}

export interface EmergencyProceduresData {
  stepType: 'emergency_procedures';
  procedures: EmergencyProcedure[];
  evacuationPlan?: EvacuationPlan;
  emergencyContacts: EmergencyContact[];
}

export interface ReviewValidationData {
  stepType: 'review_validation';
  reviewComments: ReviewComment[];
  validationChecklist: ValidationChecklist;
  finalRecommendations?: string[];
}

// =================== INTERFACES AUXILIAIRES POUR STEP DATA ===================

export interface ControlMeasureImplementation {
  id: string;
  hazardId: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  effectiveness: 'low' | 'medium' | 'high';
  implementation: 'immediate' | 'short_term' | 'long_term';
  responsible: string;
  status: 'planned' | 'in_progress' | 'implemented' | 'verified';
}

export interface HierarchyCompliance {
  eliminationScore: number;
  substitutionScore: number;
  engineeringScore: number;
  administrativeScore: number;
  ppeScore: number;
  overallCompliance: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface ControlEffectiveness {
  controlId: string;
  effectiveness: number; // 0-100%
  verificationMethod: string;
  verifiedBy: string;
  verificationDate: string;
  notes?: string;
}

export interface StepRiskAssessment {
  id: string;
  hazardId: string;
  initialRisk: RiskLevel;
  controlMeasures: string[];
  residualRisk: RiskLevel;
  acceptable: boolean;
  justification?: string;
}

export interface ResidualRisk {
  hazardId: string;
  riskLevel: RiskLevel;
  acceptanceRationale: string;
  additionalControls?: string[];
  monitoringRequired: boolean;
  reviewDate?: string;
}

export interface RiskAcceptanceCriteria {
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  criticalRisk: string;
  alarpPrinciple: boolean;
}

export interface EmergencyProcedure {
  id: string;
  type: 'medical' | 'fire' | 'evacuation' | 'chemical_spill' | 'equipment_failure';
  description: string;
  steps: string[];
  contacts: string[];
  equipment?: string[];
}

export interface EvacuationPlan {
  primaryRoute: string;
  alternativeRoutes: string[];
  assemblyPoint: string;
  responsibilities: EvacuationResponsibility[];
}

export interface EvacuationResponsibility {
  role: string;
  responsibility: string;
  person?: string;
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  alternatePhone?: string;
  availability: string;
}

export interface ReviewComment {
  id: string;
  stepNumber?: number;
  comment: string;
  type: 'suggestion' | 'concern' | 'improvement' | 'compliment';
  priority: 'low' | 'medium' | 'high';
  author: string;
  timestamp: string;
  resolved: boolean;
  response?: string;
}

export interface ValidationChecklist {
  items: ValidationChecklistItem[];
  completionPercentage: number;
  overallStatus: 'incomplete' | 'complete' | 'needs_attention';
}

export interface ValidationChecklistItem {
  id: string;
  description: string;
  isChecked: boolean;
  isRequired: boolean;
  notes?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

// =================== VALIDATION ET APPROBATION ===================
export interface StepValidation {
  stepNumber: number;
  isValid: boolean;
  validatedBy: string;
  validatedAt: string;
  
  // Critères de validation
  criteria: ValidationCriteria[];
  
  // Résultats
  score?: number;
  grade?: ValidationGrade;
  
  // Commentaires et recommandations
  comments?: string;
  recommendations?: string[];
  
  // Actions requises
  requiredActions?: ValidationAction[];
  
  // Re-validation
  requiresRevalidation: boolean;
  revalidationReason?: string;
  nextValidationDate?: string;
}

export interface ValidationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  result: ValidationResult;
  evidence?: string[];
  notes?: string;
}

export type ValidationResult = 'pass' | 'fail' | 'conditional' | 'not_applicable';
export type ValidationGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ValidationAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: string;
  notes?: string;
}

export interface FinalApproval {
  approvedBy: string;
  approvedAt: string;
  approvalLevel: ApprovalLevel;
  conditions?: string[];
  validity: ApprovalValidity;
  signature: string; // Base64 encoded
}

export type ApprovalLevel = 'conditional' | 'standard' | 'full' | 'emergency';

export interface ApprovalValidity {
  validFrom: string;
  validUntil?: string;
  restrictions?: string[];
  reviewRequired?: boolean;
}

// =================== TYPES AUXILIAIRES ===================
export interface TeamDynamics {
  communicationEffectiveness: 'poor' | 'fair' | 'good' | 'excellent';
  experienceMix: 'unbalanced' | 'adequate' | 'well_balanced' | 'optimal';
  leadershipClarity: boolean;
  conflictResolution?: string;
}

export interface CommunicationPlan {
  primaryMethod: 'verbal' | 'radio' | 'hand_signals' | 'digital';
  backupMethods: string[];
  checkInFrequency: string;
  emergencySignals: EmergencySignal[];
}

export interface EmergencySignal {
  type: 'stop_work' | 'evacuation' | 'medical_emergency' | 'equipment_failure';
  signal: string;
  response: string;
}

export interface EquipmentSelection {
  equipmentId: string;
  quantity: number;
  purpose: string;
  isRequired: boolean;
  alternatives?: string[];
  inspectionRequired: boolean;
  notes?: string;
}

export interface EquipmentInspection {
  equipmentId: string;
  inspectedBy: string;
  inspectionDate: string;
  result: 'pass' | 'fail' | 'conditional';
  issues?: InspectionIssue[];
  nextInspectionDate?: string;
}

export interface InspectionIssue {
  severity: 'minor' | 'major' | 'critical';
  description: string;
  action: 'repair' | 'replace' | 'monitor' | 'remove_from_service';
  dueDate?: string;
}

export interface EquipmentLayout {
  description: string;
  diagram?: string; // URL ou base64
  safetyZones?: SafetyZone[];
}

export interface SafetyZone {
  name: string;
  purpose: string;
  boundaries: string;
  restrictions?: string[];
}

export interface HazardIdentification {
  hazardId: string;
  customDescription?: string;
  location: string;
  identifiedBy: string;
  identificationMethod: IdentificationMethod;
  severity: SeverityLevel;
  likelihood: string;
  consequences: string[];
  notes?: string;
}

export type IdentificationMethod = 
  | 'observation'
  | 'experience'
  | 'checklist'
  | 'what_if'
  | 'job_safety_analysis'
  | 'hazop'
  | 'fmea';

export interface HazardInteraction {
  hazardIds: string[];
  interactionType: 'amplification' | 'masking' | 'triggering' | 'cumulative';
  combinedEffect: RiskLevel;
  description: string;
}

export interface HazardPriorityMatrix {
  criteria: PriorityCriteria[];
  rankings: HazardRanking[];
}

export interface PriorityCriteria {
  name: string;
  weight: number;
  description: string;
}

export interface HazardRanking {
  hazardId: string;
  rank: number;
  score: number;
  justification?: string;
}

// =================== STATUS ET PRIORITÉ ===================
export type ASTStatus = 
  | 'draft'
  | 'in_progress'
  | 'under_review'
  | 'approved'
  | 'active'
  | 'completed'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'archived';

export type ASTPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

// =================== RÉVISIONS ET HISTORIQUE ===================
export interface ASTRevision {
  revisionNumber: string;
  reason: RevisionReason;
  description: string;
  changes: ChangeRecord[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export type RevisionReason = 
  | 'periodic_review'
  | 'incident_driven'
  | 'process_change'
  | 'regulatory_update'
  | 'equipment_change'
  | 'personnel_change'
  | 'correction'
  | 'improvement';

export interface ChangeRecord {
  field: string;
  previousValue: any;
  newValue: any;
  reason?: string;
  impact?: string;
}

// =================== TEMPLATES ET CONFIGURATION ===================
export interface ASTTemplate {
  id: string;
  name: string;
  description?: string;
  workTypes: string[];
  steps: ASTStepTemplate[];
  defaultSettings: ASTSettings;
  isPublic: boolean;
  organizationId?: string;
}

export interface ASTStepTemplate {
  stepNumber: number;
  name: string;
  description: string;
  isRequired: boolean;
  estimatedDuration?: string;
  instructions?: string;
  checklistItems?: ChecklistItem[];
  requiredRoles?: ParticipantRole[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  isRequired: boolean;
  category?: string;
  notes?: string;
}

export interface ASTSettings {
  autoSave: boolean;
  requiredApprovals: number;
  validityPeriod?: string; // ISO 8601 duration
  reminderSettings: ReminderSettings;
  notificationSettings: NotificationSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  intervals: string[]; // ISO 8601 durations
  recipients: string[];
}

export interface NotificationSettings {
  statusChanges: boolean;
  stepCompletions: boolean;
  approvals: boolean;
  expirations: boolean;
  incidents: boolean;
}

// =================== ATTACHMENTS ET DOCUMENTATION ===================
export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  category?: string;
}

export type AttachmentType = 
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'drawing'
  | 'certificate'
  | 'permit'
  | 'procedure'
  | 'checklist';

export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  location?: string;
  takenBy: string;
  takenAt: string;
  tags?: string[];
  hazardIds?: string[];
  equipmentIds?: string[];
}

// =================== TYPES EXPORTS ===================
export type ASTId = string;
export type StepId = number;
export type ParticipantId = string;
