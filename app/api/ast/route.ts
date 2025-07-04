import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, formData } = await request.json()
    
    // Générer un numéro AST automatique
    const astCount = await prisma.aSTForm.count({ where: { tenantId } })
    const astNumber = `AST-${new Date().getFullYear()}-${String(astCount + 1).padStart(3, '0')}`
    
    const astForm = await prisma.aSTForm.create({
      data: {
        tenantId,
        userId: 'temp-user', // À remplacer par l'authentification
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
    
  } catch (error: any) {
    console.error('Error saving AST:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
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
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
