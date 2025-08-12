// =================== STEP 1 - PROJECT INFORMATION ===================

export interface WorkLocation {
  id: string;
  name: string;
  description: string;
  zone: string;
  building?: string;
  floor?: string;
  maxWorkersReached: number;
  currentWorkers: number;
  lockoutPoints: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  estimatedDuration: string;
  startTime?: string;
  endTime?: string;
}

export interface LockoutPoint {
  id: string;
  energyType:
    | 'electrical'
    | 'mechanical'
    | 'hydraulic'
    | 'pneumatic'
    | 'chemical'
    | 'thermal'
    | 'gravity';
  equipmentName: string;
  location: string;
  lockType: string;
  tagNumber: string;
  isLocked: boolean;
  verifiedBy: string;
  verificationTime: string;
  photos: string[];
  notes: string;
  completedProcedures: number[];
  assignedLocation?: string;
}

export interface LockoutPhoto {
  id: string;
  url: string;
  caption: string;
  category:
    | 'before_lockout'
    | 'during_lockout'
    | 'lockout_device'
    | 'client_form'
    | 'verification';
  timestamp: string;
  lockoutPointId?: string;
}

export interface Step1Data {
  client: string;
  clientPhone: string;
  clientRepresentative: string;
  clientRepresentativePhone: string;
  projectNumber: string;
  astClientNumber: string;
  date: string;
  time: string;
  workLocation: string;
  industry: string;
  emergencyContact: string;
  emergencyPhone: string;
  workDescription: string;
  workLocations: WorkLocation[];
  lockoutPoints: LockoutPoint[];
  lockoutPhotos: LockoutPhoto[];
}

// =================== STEP 2 - EQUIPMENT ===================

export interface Step2EquipmentItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  certification?: string;
  priority?: 'high' | 'medium' | 'low';
  icon: string;
}

export interface Step2Data {
  list: Step2EquipmentItem[];
  selected: Step2EquipmentItem[];
  totalSelected: number;
  highPriority: number;
  categories: string[];
  inspectionStatus: {
    total: number;
    verified: number;
    available: number;
    verificationRate: number;
    availabilityRate: number;
  };
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
  projectInfo: Step1Data;
  equipment: Step2Data;
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
