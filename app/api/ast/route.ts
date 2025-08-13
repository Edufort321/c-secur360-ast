import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { z, type ZodType } from 'zod'
import env from '@/lib/env'
import type { Prisma } from '@prisma/client'
import type {
  ASTFormPayload,
  GeneralInfo,
  Isolation,
  IsolationCircuit,
  Worker,
} from '@/types/astPayload'
import type { Hazard } from '@/types/hazards'
import { sanitizeFormData } from './sanitize'

const generalInfoSchema: ZodType<GeneralInfo> = z.object({
  datetime: z.string().trim().optional(),
  language: z.string().trim().optional(),
})

const isolationCircuitSchema: ZodType<IsolationCircuit> = z.object({
  name: z.string().trim(),
  padlock: z.boolean(),
  voltage: z.boolean(),
  grounding: z.boolean(),
})

const isolationSchema: ZodType<Isolation> = z.object({
  point: z.string().trim().optional(),
  circuits: z.array(isolationCircuitSchema).optional(),
})

const hazardSchema: ZodType<Hazard> = z.any()

const workerSchema: ZodType<Worker> = z.object({
  name: z.string().trim(),
  departureTime: z.string().trim().optional(),
})

const formDataSchema: ZodType<ASTFormPayload> = z.object({
  projectNumber: z.string().trim().optional(),
  client: z.string().trim().optional(),
  workLocation: z.string().trim().optional(),
  clientRep: z.string().trim().optional(),
  emergencyNumber: z.string().trim().optional(),
  astClientNumber: z.string().trim().optional(),
  workDescription: z.string().trim().optional(),
  generalInfo: generalInfoSchema.optional(),
  teamDiscussion: z.array(z.string().trim()).optional(),
  isolation: isolationSchema.optional(),
  hazards: z.array(hazardSchema).optional(),
  controlMeasures: z.array(z.string().trim()).optional(),
  workers: z.array(workerSchema).optional(),
  photos: z.array(z.string().trim()).optional(),
})

const requestSchema = z.object({
  tenantId: z.string(),
  formData: formDataSchema,
})

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET })
    const userId = token?.sub
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      )
    }

    const { tenantId, formData } = parsed.data
    const cleanFormData = sanitizeFormData(formData)
    
    // Générer un numéro AST automatique
    const astCount = await prisma.aSTForm.count({ where: { tenantId } })
    const astNumber = `AST-${new Date().getFullYear()}-${String(astCount + 1).padStart(3, '0')}`
    
    const astForm = await prisma.aSTForm.create({
      data: {
        tenantId,
        userId,
        projectNumber: cleanFormData.projectNumber || '',
        clientName: cleanFormData.client || '',
        workLocation: cleanFormData.workLocation || '',
        clientRep: cleanFormData.clientRep,
        emergencyNumber: cleanFormData.emergencyNumber,
        astMdlNumber: astNumber,
        astClientNumber: cleanFormData.astClientNumber,
        workDescription: cleanFormData.workDescription || '',
        status: 'completed',
        generalInfo: cleanFormData.generalInfo as unknown as Prisma.InputJsonValue,
        teamDiscussion: cleanFormData.teamDiscussion as unknown as Prisma.InputJsonValue,
        isolation: cleanFormData.isolation as unknown as Prisma.InputJsonValue,
        hazards: cleanFormData.hazards as unknown as Prisma.InputJsonValue,
        controlMeasures: cleanFormData.controlMeasures as unknown as Prisma.InputJsonValue,
        workers: cleanFormData.workers as unknown as Prisma.InputJsonValue,
        photos: cleanFormData.photos as unknown as Prisma.InputJsonValue
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      astForm,
      message: 'AST sauvegardé avec succès!'
    })
    
  } catch (error: unknown) {
    console.error('Error saving AST:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET })
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
    }
    
    const astForms = await prisma.aSTForm.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ astForms })
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({
      error: message
    }, { status: 500 })
  }
}
