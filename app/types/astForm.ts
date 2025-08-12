import { z } from 'zod'

export const ProjectInfoSchema = z.object({
  client: z.string(),
  workLocation: z.string(),
  industry: z.string(),
  projectNumber: z.string(),
  date: z.string(),
  time: z.string(),
  workDescription: z.string(),
  workerCount: z.number(),
  lockoutPoints: z.array(z.string())
})
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>

export const EquipmentDataSchema = z.object({
  selected: z.array(z.string()),
  custom: z.array(z.string())
})
export type EquipmentData = z.infer<typeof EquipmentDataSchema>

export const HazardsDataSchema = z.object({
  selected: z.array(z.string()),
  controls: z.array(z.string())
})
export type HazardsData = z.infer<typeof HazardsDataSchema>

export const PermitsDataSchema = z.object({
  permits: z.array(z.string())
})
export type PermitsData = z.infer<typeof PermitsDataSchema>

export const ValidationDataSchema = z.object({
  reviewers: z.array(z.string())
})
export type ValidationData = z.infer<typeof ValidationDataSchema>

export const FinalizationDataSchema = z.object({
  consent: z.boolean(),
  signatures: z.array(z.string())
})
export type FinalizationData = z.infer<typeof FinalizationDataSchema>

export const ASTFormSchema = z.object({
  id: z.string(),
  astNumber: z.string(),
  projectInfo: ProjectInfoSchema,
  equipment: EquipmentDataSchema,
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
export type ASTFormData = z.infer<typeof ASTFormSchema>

