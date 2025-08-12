import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, formData } = await request.json()

    // Générer un numéro AST automatique
    const { count, error: countError } = await supabase
      .from('ast_forms')
      .select('*', { count: 'exact', head: true })
      .eq('tenantId', tenantId)

    if (countError) throw countError

    const astNumber = `AST-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(3, '0')}`

    const insertData = {
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

    const { data: astForm, error } = await supabase
      .from('ast_forms')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

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

    const { data: astForms, error } = await supabase
      .from('ast_forms')
      .select('*')
      .eq('tenantId', tenantId)
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({ astForms })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
