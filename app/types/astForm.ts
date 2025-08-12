// app/types/astForm.ts

export interface ASTFormProjectInfo {
  projectName?: string;
  location?: string;
  workType?: string;
  client?: string;
  supervisor?: string;
  startDate?: string;
  workDescription?: string;
  [key: string]: unknown;
}

export interface ASTFormEquipmentItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  certification?: string;
  priority?: 'high' | 'medium' | 'low';
  icon: string;
  [key: string]: unknown;
}

export interface ASTFormEquipmentData {
  list?: ASTFormEquipmentItem[];
  selected?: ASTFormEquipmentItem[];
  [key: string]: unknown;
}

export interface ASTFormControlMeasure {
  id: string;
  name: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  priority: number;
  implemented: boolean;
  [key: string]: unknown;
}

export interface ASTFormHazard {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  selected: boolean;
  controlMeasures: ASTFormControlMeasure[];
  [key: string]: unknown;
}

export interface ASTFormHazardsData {
  list?: ASTFormHazard[];
  selected?: ASTFormHazard[];
  [key: string]: unknown;
}

export interface ASTFormPermitsData {
  completed?: string[];
  inProgress?: string[];
  completion?: Record<string, number>;
  permits?: string[];
  [key: string]: unknown;
}

export interface ASTFormTeamMember {
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
  [key: string]: unknown;
}

export interface ASTFormValidationData {
  reviewers: ASTFormTeamMember[];
  approvalRequired: boolean;
  minimumReviewers: number;
  reviewDeadline?: string;
  validationCriteria: {
    hazardIdentification: boolean;
    controlMeasures: boolean;
    equipmentSelection: boolean;
    procedural: boolean;
    regulatory: boolean;
  };
  finalApproval?: {
    approvedBy: string;
    approvedAt: string;
    signature: string;
    conditions?: string;
  };
  [key: string]: unknown;
}

export interface ASTFormFinalizationData {
  status?: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  createdAt?: string;
  lastModified?: string;
  hazardCount?: number;
  equipmentCount?: number;
  workerCount?: number;
  photoCount?: number;
  permitCount?: number;
  completionPercentage?: number;
  qrCodeUrl?: string;
  [key: string]: unknown;
}

export interface ASTFormData {
  tenantId?: string;
  astNumber?: string;
  userId?: string;
  createdAt?: string;
  projectInfo?: ASTFormProjectInfo;
  equipment?: ASTFormEquipmentData;
  hazards?: ASTFormHazardsData;
  permits?: ASTFormPermitsData;
  permitData?: Record<string, unknown>;
  validation?: ASTFormValidationData;
  finalization?: ASTFormFinalizationData;
}
