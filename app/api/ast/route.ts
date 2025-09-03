import { NextRequest, NextResponse } from 'next/server'
import { createASTForm, getASTFormsByTenant } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.json();
    if (!jsonData || !jsonData.tenantId || !jsonData.formData) {
      return NextResponse.json({ error: 'tenantId and formData are required' }, { status: 400 });
    }
    const { tenantId, formData } = jsonData;
    
    // Générer un numéro AST automatique (format démo)
    const existingForms = await getASTFormsByTenant(tenantId);
    const astNumber = `AST-${new Date().getFullYear()}-${String(existingForms.length + 1).padStart(3, '0')}`
    
    const astForm = await createASTForm({
      tenantId,
      userId: '', // À remplacer par l'authentification
      projectNumber: formData.projectNumber || '',
      clientName: formData.client || '',
      workLocation: formData.workLocation || '',
      clientRep: formData.clientRep,
      emergencyNumber: formData.emergencyNumber,
      astNumber: astNumber,
      clientReference: formData.clientReference,
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
    })
    
    return NextResponse.json({ 
      success: true, 
      astForm,
      message: 'AST sauvegardé avec succès dans Supabase!',
      astNumber 
    });
    
  } catch (error: unknown) {
    console.error('Error saving AST to Supabase:', error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }
    
    const astForms = await getASTFormsByTenant(tenantId);
    
    return NextResponse.json({ astForms })
    
  } catch (error: unknown) {
    console.error('Error fetching AST forms from Supabase:', error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}