import { z } from 'zod'

export const ASTFormData = z.object({
  projectNumber: z.string().optional(),
  client: z.string().optional(),
  workLocation: z.string().optional(),
  clientRep: z.string(),
  emergencyNumber: z.string(),
  astClientNumber: z.string().optional(),
  workDescription: z.string().optional(),
  datetime: z.string(),
  language: z.enum(['fr', 'en']),
  teamDiscussion: z.any(),
  isolation: z.any(),
  hazards: z.any(),
  controlMeasures: z.any(),
  workers: z.any(),
  photos: z.any()
})

export type ASTFormDataType = z.infer<typeof ASTFormData>
