export type ReportType = 'standard' | 'executive' | 'technical' | 'compact';

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
  id?: string;
  astNumber: string;
  tenant: string;
  language: 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  client?: string;
  projectNumber?: string;
  workLocation?: string;
  date?: string;
  teamMembers?: string[];
  selectedEquipment?: string[];
  selectedHazards?: string[];
  selectedPermits?: string[];

  projectInfo: {
    projectName?: string;
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

