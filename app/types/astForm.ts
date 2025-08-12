export interface ProjectInfo {
  client: string;
  workLocation: string;
  industry: string;
  projectNumber: string;
  date: string;
  time: string;
  workDescription: string;
  workerCount: number;
  lockoutPoints: string[];
}

export interface EquipmentData {
  selected: string[];
  custom: string[];
}

export interface HazardsData {
  selected: string[];
  controls: string[];
}

export interface PermitsData {
  permits: string[];
}

export interface ValidationData {
  reviewers: string[];
}

export interface FinalizationData {
  consent: boolean;
  signatures: string[];
}

export interface ASTFormData {
  id: string;
  astNumber: string;
  projectInfo: ProjectInfo;
  equipment: EquipmentData;
  hazards: HazardsData;
  permits: PermitsData;
  validation: ValidationData;
  finalization: FinalizationData;
  tenant?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  language?: 'fr' | 'en';
}
