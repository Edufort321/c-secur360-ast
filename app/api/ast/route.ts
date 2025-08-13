import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import sanitizeHtml from 'sanitize-html'
import env from '@/lib/env'

const formDataSchema = z.object({
  projectNumber: z.string().trim().optional(),
  client: z.string().trim().optional(),
  workLocation: z.string().trim().optional(),
  clientRep: z.string().trim().optional(),
  emergencyNumber: z.string().trim().optional(),
  astClientNumber: z.string().trim().optional(),
  workDescription: z.string().trim().optional(),
  datetime: z.string().trim().optional(),
  language: z.string().trim().optional(),
  teamDiscussion: z.array(z.string().trim()).optional(),
  isolation: z
    .object({
      point: z.string().trim().optional(),
      circuits: z
        .array(
          z.object({
            name: z.string(),
            padlock: z.boolean(),
            voltage: z.boolean(),
            grounding: z.boolean(),
          })
        )
        .optional(),
    })
    .optional(),
  hazards: z.array(z.unknown()).optional(),
  controlMeasures: z.array(z.unknown()).optional(),
  workers: z.array(z.unknown()).optional(),
  photos: z.array(z.unknown()).optional(),
})

const requestSchema = z.object({
  tenantId: z.string(),
  formData: formDataSchema
})

export function sanitizeFormData(data: z.infer<typeof formDataSchema>) {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return sanitizeHtml(value)
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue)
    }
    if (value && typeof value === 'object') {
      const obj: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        obj[k] = sanitizeValue(v)
      }
      return obj
    }
    return value
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = sanitizeValue(value)
  }
  return sanitized as z.infer<typeof formDataSchema>
}

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
        generalInfo: {
          datetime: cleanFormData.datetime,
          language: cleanFormData.language
        },
        teamDiscussion: cleanFormData.teamDiscussion,
        isolation: cleanFormData.isolation,
        hazards: cleanFormData.hazards,
        controlMeasures: cleanFormData.controlMeasures,
        workers: cleanFormData.workers,
        photos: cleanFormData.photos
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
