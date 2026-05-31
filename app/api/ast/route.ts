import { NextRequest, NextResponse } from 'next/server'
import { createASTForm, getASTFormsByTenant } from '@/lib/supabase'
import { getSessionUser } from '@/lib/apiAuth'

export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.json();
    if (!jsonData || !jsonData.tenantId || !jsonData.formData) {
      return NextResponse.json({ error: 'tenantId and formData are required' }, { status: 400 });
    }
    const { tenantId, formData } = jsonData;
    // Securite (#14) : l'identite vient de la SESSION (jamais du client). Vide = creation publique
    // anonyme via QR (flux intentionnel autorise par le middleware).
    const sessionUser = await getSessionUser(request);

    // Générer un numéro AST unique : AST-{TENANT}-{AAAA-MM-JJ}-{CODE}
    // ex: AST-QC-2026-05-25-VVTJ
    const tenantCode = String(tenantId).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'AST';
    const now = new Date();
    const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const ALPHABET = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // sans I,O,0,1,L pour lisibilité
    const randomPart = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
    const astNumber = `AST-${tenantCode}-${datePart}-${randomPart}`;

    const astForm = await createASTForm({
      tenantId,
      userId: sessionUser?.id || '', // identite de session ; vide = QR public anonyme
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