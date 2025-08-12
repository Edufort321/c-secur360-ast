import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import env from '@/lib/env'

const requestSchema = z.object({
  tenantId: z.string(),
  formData: z.any()
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
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { tenantId, formData } = parsed.data
    
    // Générer un numéro AST automatique
    const astCount = await prisma.aSTForm.count({ where: { tenantId } })
    const astNumber = `AST-${new Date().getFullYear()}-${String(astCount + 1).padStart(3, '0')}`
    
    const astForm = await prisma.aSTForm.create({
      data: {
        tenantId,
        userId,
        projectNumber: formData.projectNumber || '',
        clientName: formData.client || '',
        workLocation: formData.workLocation || '',
        clientRep: formData.clientRep,
        emergencyNumber: formData.emergencyNumber,
        astMdlNumber: astNumber,
        astClientNumber: formData.astClientNumber,
        workDescription: formData.workDescription || '',
        status: 'completed',
        generalInfo: {
          datetime: formData.datetime,
          language: formData.language
        },
        teamDiscussion: formData.teamDiscussion,
        isolation: formData.isolation,
        hazards: formData.hazards,
        controlMeasures: formData.controlMeasures,
        workers: formData.workers,
        photos: formData.photos
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
