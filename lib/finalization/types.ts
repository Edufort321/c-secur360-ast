export type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack';
export type LockType = 'temporary' | 'permanent' | 'review' | 'archive';
export type NotificationType = 'success' | 'error' | 'warning';
export type ReportType = 'standard' | 'executive' | 'technical' | 'compact';
export type ViewType = 'main' | 'database';

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
  template: ReportType;
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
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

export interface ASTData {
  astNumber: string;
  tenant: string;
  language: 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';

  projectInfo: {
    client: string;
    projectNumber: string;
    workLocation: string;
    date: string;
    time: string;
    industry: string;
    workerCount: number;
    estimatedDuration: string;
    workDescription: string;
    clientContact: string;
    emergencyContact: string;
    lockoutPoints: string[];
    weatherConditions?: string;
    accessRestrictions?: string;
  };

  equipment: {
    selected: string[];
    categories: string[];
    mandatory: string[];
    optional: string[];
    totalCost: number;
    inspectionRequired: boolean;
    certifications: string[];
  };

  hazards: {
    identified: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    controlMeasures: string[];
    residualRisk: 'low' | 'medium' | 'high';
    emergencyProcedures: string[];
    monitoringRequired: boolean;
  };

  permits: {
    required: string[];
    authorities: string[];
    validations: string[];
    expiry: string[];
    documents: string[];
    specialRequirements: string[];
  };

  validation: {
    reviewers: string[];
    approvals: string[];
    signatures: string[];
    finalApproval: boolean;
    criteria: Record<string, boolean>;
    comments: string[];
  };

  finalization: FinalizationData;
}

export interface ASTStatistics {
  astNumber: string;
  tenant: string;
  createdAt: string;
  lastModified: string;
  status: string;

  totalSections: number;
  completedSections: number;
  overallCompletion: number;

  identifiedHazards: number;
  selectedEquipment: number;
  requiredPermits: number;
  teamMembers: number;
  lockoutPoints: number;

  photosCount: number;
  documentsCount: number;
  signaturesCount: number;

  industry: string;
  client: string;
  projectNumber: string;
  workLocation: string;
  estimatedDuration: string;
  workerCount: number;

  lastSaved: string;
  isLocked: boolean;
  hasQRCode: boolean;
  hasShareableLink: boolean;
}

export interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
  stepNumber: number;
}

export interface ASTHistoryEntry {
  id: string;
  astNumber: string;
  projectNumber: string;
  workLocation: string;
  client: string;
  industry: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  createdAt: string;
  lastModified: string;
  hazardCount: number;
  equipmentCount: number;
  workerCount: number;
  photoCount: number;
  permitCount: number;
  completionPercentage: number;
  qrCodeUrl?: string;
}

export interface FinalizationStepProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}
