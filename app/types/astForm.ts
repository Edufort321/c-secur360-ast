export interface ProjectInfo {
  client?: string;
  projectName?: string;
  workLocation?: string;
  industry?: string;
  projectNumber?: string;
  date?: string;
  time?: string;
  workDescription?: string;
  workerCount?: number;
  lockoutPoints?: string[];
  [key: string]: any;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  certification?: string;
  priority?: 'high' | 'medium' | 'low';
  icon: string;
}

export interface EquipmentData {
  list: EquipmentItem[];
  selected: EquipmentItem[];
  totalSelected?: number;
  highPriority?: number;
  categories?: string[];
  custom?: string[];
  inspectionStatus?: {
    total: number;
    verified: number;
    available: number;
    verificationRate: number;
    availabilityRate: number;
  };
}

export interface ControlMeasure {
  id: string;
  name: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  priority: number;
  implemented: boolean;
  responsible?: string;
  deadline?: string;
  notes?: string;
  standards?: Standard[];
}

export interface Standard {
  id: string;
  name: string;
  fullName: string;
  url?: string;
  section?: string;
  description: string;
  mandatory: boolean;
}

export interface Hazard {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  selected: boolean;
  controlMeasures: ControlMeasure[];
}

export interface HazardStats {
  totalHazards: number;
  totalControls: number;
  implementedControls: number;
  implementationRate: number;
  criticalHazards: number;
  highRiskHazards: number;
}

export interface HazardsData {
  list: Hazard[];
  selected: Hazard[];
  stats: HazardStats;
}

export interface PermitsData {
  permits: any[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  certification?: string;
  status: 'approved' | 'pending' | 'rejected' | 'reviewing';
  comments?: string;
  rating?: number;
  validatedAt?: string;
  signature?: string;
}

export interface ValidationCriteria {
  hazardIdentification: boolean;
  controlMeasures: boolean;
  equipmentSelection: boolean;
  procedural: boolean;
  regulatory: boolean;
}

export interface ValidationData {
  reviewers: TeamMember[];
  approvalRequired: boolean;
  minimumReviewers: number;
  reviewDeadline?: string;
  validationCriteria: ValidationCriteria;
  finalApproval?: {
    approvedBy: string;
    approvedAt: string;
    signature: string;
    conditions?: string;
  };
}

export interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'hazard' | 'equipment' | 'site' | 'team' | 'safety' | 'permit' | 'other';
  location?: string;
  tags?: string[];
  stepSource?: string;
}

export interface DocumentGeneration {
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  includeBranding: boolean;
  includeTimestamps: boolean;
  includeComments: boolean;
  includeStatistics: boolean;
  includeValidation: boolean;
  includePermits: boolean;
  includeHazards: boolean;
  includeEquipment: boolean;
  format: 'pdf' | 'word' | 'html';
  template: string;
}

export interface GeneratedReport {
  id: string;
  type: string;
  url: string;
  generatedAt: string;
  fileSize?: string;
  astNumber: string;
}

export interface FinalizationData {
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  isLocked: boolean;
  lockTimestamp?: string;
  lockReason?: string;
  completionPercentage: number;
  qrCodeUrl?: string;
  shareableLink?: string;
  lastSaved?: string;
  generatedReports: GeneratedReport[];
}

export type ASTFormSection =
  | 'projectInfo'
  | 'equipment'
  | 'hazards'
  | 'permits'
  | 'validation'
  | 'finalization';

export interface ASTFormData {
  id?: string;
  astNumber?: string;
  tenantId?: string;
  userId?: string;
  projectInfo?: ProjectInfo;
  equipment?: EquipmentData;
  hazards?: HazardsData;
  permits?: PermitsData;
  validation?: ValidationData;
  finalization?: FinalizationData;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  language?: 'fr' | 'en';
}
