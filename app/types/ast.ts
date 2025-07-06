// app/types/ast.ts

// =================== TYPES DE BASE AST ===================
export interface ASTFormProps {
  tenant: string;
}

export interface ProjectInfo {
  id?: string;
  astNumber?: string;
  projectName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  startDate: string;
  endDate?: string;
  duration: string;
  teamSize: string;
  workType: string; // ID du type de travail
  client: string; // ID du client
  supervisor: string;
  contact: string;
  emergencyContact: string;
  permits: string[];
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
}

export interface TeamMember {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  qualification: string;
  phone?: string;
  email?: string;
  certifications: string[];
  hasAcknowledged: boolean;
  acknowledgmentTime?: string;
  signature?: string;
  joinedAt: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  validationComments?: string;
}

export interface SelectedEquipment {
  equipmentId: string;
  quantity: number;
  inspectionDate: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'out-of-service';
  inspector?: string;
  notes?: string;
  serialNumbers?: string[];
  expiryDate?: string;
}

export interface SelectedHazard {
  hazardId: string;
  severity: number; // 1-5
  probability: number; // 1-5
  riskScore?: number; // Calculé automatiquement
  notes: string;
  controlMeasures?: ControlMeasureSelection[];
  residualRisk?: number;
  isAcceptable?: boolean;
  reviewedBy?: string;
  reviewDate?: string;
}

export interface ControlMeasureSelection {
  id: string;
  implemented: boolean;
  implementationDate?: string;
  responsiblePerson?: string;
  effectiveness?: number; // 1-100%
  cost?: number;
  notes?: string;
}

export interface WorkPermit {
  id: string;
  type: string;
  number: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected' | 'cancelled';
  conditions: string[];
  attachments?: string[];
  reviewer?: string;
  reviewDate?: string;
  notes?: string;
}

export interface Photo {
  id: string;
  name: string;
  url?: string;
  data?: string; // Base64 pour stockage local
  description: string;
  timestamp: string;
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'before' | 'after' | 'incident' | 'other';
  gpsLocation?: { lat: number; lng: number };
  takenBy?: string;
  metadata?: {
    camera?: string;
    settings?: string;
    weather?: string;
  };
}

export interface IsolationPoint {
  id: string;
  name: string;
  type: 'electrical' | 'mechanical' | 'pneumatic' | 'hydraulic' | 'chemical' | 'thermal' | 'gas';
  location: string;
  description: string;
  energyLevel: string;
  isolationMethod: string;
  lockoutDevice: string;
  isActive: boolean;
  isolatedBy?: string;
  isolationTime?: string;
  verifiedBy?: string;
  verificationTime?: string;
  photos: Photo[];
  checklist: {
    energyIsolated: boolean;
    lockoutApplied: boolean;
    energyVerified: boolean;
    signagePosted: boolean;
    teamNotified: boolean;
  };
}

export interface EmergencyProcedure {
  id: string;
  type: 'medical' | 'fire' | 'evacuation' | 'spill' | 'electrical' | 'gas-leak' | 'confined-space' | 'other';
  title: string;
  procedure: string;
  responsiblePerson: string;
  contactInfo: string;
  equipment?: string[];
  isVerified: boolean;
  lastReview?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface WeatherData {
  temperature: number;
  condition: 'ensoleillé' | 'nuageux' | 'pluvieux' | 'neigeux' | 'orageux' | 'brouillard';
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  visibility: number;
  uvIndex: number;
  pressure?: number;
  alerts: string[];
  timestamp: string;
  impact: 'none' | 'low' | 'medium' | 'high' | 'severe';
}

export interface TeamConsultation {
  id: string;
  sharedWith: string[]; // IDs des membres
  sharedBy: string;
  shareDate: string;
  method: 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack';
  message?: string;
  expiryDate: string;
  responses: TeamResponse[];
  isActive: boolean;
  remindersSent: number;
}

export interface TeamResponse {
  memberId: string;
  memberName: string;
  approved: boolean;
  comments: string;
  concerns?: string[];
  timestamp: string;
  ipAddress?: string;
  location?: { lat: number; lng: number };
}

export interface RiskAssessment {
  id: string;
  hazardId: string;
  initialRisk: number;
  controlMeasures: string[];
  residualRisk: number;
  riskReduction: number; // Pourcentage
  isAcceptable: boolean;
  additionalMeasures?: string[];
  reviewRequired: boolean;
  reviewDate?: string;
  assessedBy: string;
  assessmentDate: string;
}

export interface ValidationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
  signature?: string;
  comments?: string;
  attachments?: string[];
}

export interface ASTDocument {
  id: string;
  astNumber: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'active' | 'completed' | 'archived';
  
  // Sections principales
  projectInfo: ProjectInfo;
  team: TeamMember[];
  equipment: SelectedEquipment[];
  hazards: SelectedHazard[];
  permits: WorkPermit[];
  isolationPoints: IsolationPoint[];
  emergencyProcedures: EmergencyProcedure[];
  riskAssessments: RiskAssessment[];
  consultation: TeamConsultation;
  
  // Documentation
  photos: Photo[];
  attachments: string[];
  
  // Validation
  validationSteps: ValidationStep[];
  
  // Métadonnées
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  language: 'fr' | 'en';
  tenant: string;
  
  // Historique
  revisions?: ASTRevision[];
  
  // Données calculées
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage: number;
  complianceScore: number;
}

export interface ASTRevision {
  version: number;
  changes: string[];
  changedBy: string;
  changeDate: string;
  reason: string;
  previousData?: Partial<ASTDocument>;
}

// =================== TYPES D'ÉTAT DE L'APPLICATION ===================
export interface ASTFormState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  language: 'fr' | 'en';
  showSidebar: boolean;
  autoSave: boolean;
  lastSaved?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
  completedFields: string[];
  completionPercentage: number;
}

// =================== TYPES D'ACTIONS ===================
export type ASTAction = 
  | { type: 'SET_PROJECT_INFO'; payload: Partial<ProjectInfo> }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'REMOVE_TEAM_MEMBER'; payload: string }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { id: string; data: Partial<TeamMember> } }
  | { type: 'ADD_EQUIPMENT'; payload: SelectedEquipment }
  | { type: 'REMOVE_EQUIPMENT'; payload: string }
  | { type: 'UPDATE_EQUIPMENT'; payload: { id: string; data: Partial<SelectedEquipment> } }
  | { type: 'ADD_HAZARD'; payload: SelectedHazard }
  | { type: 'REMOVE_HAZARD'; payload: string }
  | { type: 'UPDATE_HAZARD'; payload: { id: string; data: Partial<SelectedHazard> } }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'SAVE_SUCCESS'; payload: string }
  | { type: 'RESET_FORM' };

// =================== EXPORT TYPES UTILITAIRES ===================
export type ASTStatus = ASTDocument['status'];
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Language = 'fr' | 'en';
export type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
