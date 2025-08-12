// =================== STEP 1 - PROJECT INFORMATION ===================

import { z } from 'zod'

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

export const WorkLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  zone: z.string(),
  building: z.string().optional(),
  floor: z.string().optional(),
  maxWorkersReached: z.number(),
  currentWorkers: z.number(),
  lockoutPoints: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  notes: z.string().optional(),
  estimatedDuration: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional()
})

export const LockoutPointSchema = z.object({
  id: z.string(),
  energyType: z.enum([
    'electrical',
    'mechanical',
    'hydraulic',
    'pneumatic',
    'chemical',
    'thermal',
    'gravity'
  ]),
  equipmentName: z.string(),
  location: z.string(),
  lockType: z.string(),
  tagNumber: z.string(),
  isLocked: z.boolean(),
  verifiedBy: z.string(),
  verificationTime: z.string(),
  photos: z.array(z.string()),
  notes: z.string(),
  completedProcedures: z.array(z.number()),
  assignedLocation: z.string().optional()
})

export const LockoutPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string(),
  category: z.enum([
    'before_lockout',
    'during_lockout',
    'lockout_device',
    'client_form',
    'verification'
  ]),
  timestamp: z.string(),
  lockoutPointId: z.string().optional()
})

export const Step1DataSchema = z.object({
  client: z.string(),
  clientPhone: z.string(),
  clientRepresentative: z.string(),
  clientRepresentativePhone: z.string(),
  projectNumber: z.string(),
  astClientNumber: z.string(),
  date: z.string(),
  time: z.string(),
  workLocation: z.string(),
  industry: z.string(),
  emergencyContact: z.string(),
  emergencyPhone: z.string(),
  workDescription: z.string(),
  workLocations: z.array(WorkLocationSchema),
  lockoutPoints: z.array(LockoutPointSchema),
  lockoutPhotos: z.array(LockoutPhotoSchema)
})

export const Step2EquipmentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  required: z.boolean(),
  certification: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  icon: z.string()
})

export const Step2DataSchema = z.object({
  list: z.array(Step2EquipmentItemSchema),
  selected: z.array(Step2EquipmentItemSchema),
  totalSelected: z.number(),
  highPriority: z.number(),
  categories: z.array(z.string()),
  inspectionStatus: z.object({
    total: z.number(),
    verified: z.number(),
    available: z.number(),
    verificationRate: z.number(),
    availabilityRate: z.number()
  })
})

export const HazardsDataSchema = z.object({
  selected: z.array(z.string()),
  controls: z.array(z.string())
})

export const PermitsDataSchema = z.object({
  permits: z.array(z.string())
})

export const ValidationDataSchema = z.object({
  reviewers: z.array(z.string())
})

export const FinalizationDataSchema = z.object({
  consent: z.boolean(),
  signatures: z.array(z.string())
})

export const ASTFormDataSchema = z.object({
  id: z.string(),
  astNumber: z.string(),
  projectInfo: Step1DataSchema,
  equipment: Step2DataSchema,
  hazards: HazardsDataSchema,
  permits: PermitsDataSchema,
  validation: ValidationDataSchema,
  finalization: FinalizationDataSchema,
  tenant: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  language: z.enum(['fr', 'en']).optional()
})

export type ASTFormData = z.infer<typeof ASTFormDataSchema>
