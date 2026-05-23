import { NextRequest, NextResponse } from 'next/server';
import { auditHelpers } from '@/lib/audit';

/**
 * Callback pour le status des appels transférés
 * Appelé après une tentative de Dial dans /api/voice/inbound
 */
export async function POST(request: NextRequest) {
  try {
    // Parse du body Twilio (form-urlencoded)
    const formData = await request.formData();
    const dialCallStatus = formData.get('DialCallStatus') as string;
    const dialCallDuration = formData.get('DialCallDuration') as string;
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;

    // Log du résultat du transfer
    await auditHelpers.voice('forward', {
      callSid,
      from,
      dialCallStatus,
      dialCallDuration,
      action: 'dial_callback'
    });

    let twiml = '';

    if (dialCallStatus === 'completed') {
      // L'appel a été connecté et terminé normalement
      console.log(`✅ Appel transféré complété: ${callSid} (${dialCallDuration}s)`);
      
      // Pas besoin de TwiML, l'appel est déjà terminé
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;

    } else if (dialCallStatus === 'no-answer' || dialCallStatus === 'busy') {
      // Personne n'a répondu ou ligne occupée
      console.log(`📞 Appel non répondu: ${callSid} - ${dialCallStatus}`);
      
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">
    Notre équipe n'est pas disponible en ce moment. 
    Veuillez nous envoyer un SMS avec votre demande, 
    nous vous répondrons rapidement. 
    Vous pouvez aussi envoyer un email à notre équipe support.
  </Say>
  <Hangup/>
</Response>`;

    } else if (dialCallStatus === 'failed' || dialCallStatus === 'canceled') {
      // Échec du transfer
      console.log(`❌ Échec transfer appel: ${callSid} - ${dialCallStatus}`);
      
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">
    Nous rencontrons un problème technique. 
    Veuillez nous contacter par SMS ou email. 
    Nos coordonnées sont disponibles sur notre site web.
  </Say>
  <Hangup/>
</Response>`;

    } else {
      // Status inconnu
      console.log(`⚠️ Status appel inconnu: ${callSid} - ${dialCallStatus}`);
      
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.voice('forward', {
      error: errorMsg,
      success: false,
      action: 'dial_callback_error'
    });

    console.error('❌ Erreur callback dial status:', error);
    
    // TwiML minimal en cas d'erreur
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}