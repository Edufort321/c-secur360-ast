import { NextRequest, NextResponse } from 'next/server';
import { auditHelpers } from '@/lib/audit';
import { validateTwilioSignature } from '@/lib/twilio-webhook-validation';

/**
 * Webhook Twilio pour les appels entrants
 * Forward automatiquement vers OWNER_MOBILE
 */
export async function POST(request: NextRequest) {
  try {
    // Parse du body Twilio (form-urlencoded)
    const formData = await request.formData();

    // Securite : valider la signature Twilio (anti-usurpation du webhook).
    const allParams: Record<string, string> = {};
    for (const [k, v] of formData.entries()) if (typeof v === 'string') allParams[k] = v;
    const sig = await validateTwilioSignature(request, allParams);
    if (!sig.valid) {
      return NextResponse.json({ error: 'Signature Twilio invalide' }, { status: 403 });
    }

    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;

    // Log de l'appel entrant
    await auditHelpers.voice('inbound', {
      from,
      to,
      callSid,
      callStatus,
      timestamp: new Date().toISOString()
    });

    const ownerMobile = process.env.OWNER_MOBILE;
    
    if (!ownerMobile) {
      console.error('❌ OWNER_MOBILE non configuré pour forward voice');
      
      // TwiML pour répondre que le service n'est pas disponible
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">
    Bonjour, vous avez rejoint C-Secur360. 
    Notre service d'assistance n'est pas disponible actuellement. 
    Veuillez nous contacter par SMS ou email. 
    Merci.
  </Say>
  <Hangup/>
</Response>`;

      await auditHelpers.voice('inbound', {
        from,
        action: 'no_forward_number',
        error: 'OWNER_MOBILE not configured'
      });

      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Forward vers le numéro propriétaire
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">
    Bonjour, vous contactez C-Secur360. 
    Transfert de votre appel en cours.
  </Say>
  <Dial timeout="30" action="/api/voice/dial-status">
    <Number>${ownerMobile}</Number>
  </Dial>
  <Say voice="alice" language="fr-FR">
    Nous n'avons pas pu vous mettre en relation. 
    Veuillez laisser un message SMS au ${process.env.PUBLIC_CONTACT_NUMBER || 'numéro affiché'} 
    ou contacter directement notre support.
  </Say>
  <Hangup/>
</Response>`;

    await auditHelpers.voice('forward', {
      from,
      to: ownerMobile,
      callSid,
      action: 'dial_forwarded'
    });

    console.log(`📞 Appel forwarded: ${from} → ${ownerMobile}`);

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.voice('inbound', {
      error: errorMsg,
      success: false
    });

    console.error('❌ Erreur webhook voice entrant:', error);
    
    // TwiML d'erreur générique
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="fr-FR">
    Nous rencontrons un problème technique. 
    Veuillez réessayer plus tard ou nous contacter par SMS.
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200, // Toujours 200 pour Twilio
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}

/**
 * Status callback pour les appels
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callSid = searchParams.get('CallSid');
  const callStatus = searchParams.get('CallStatus');
  const from = searchParams.get('From');
  const to = searchParams.get('To');

  await auditHelpers.voice('inbound', {
    callSid,
    callStatus,
    from,
    to,
    action: 'status_callback'
  });

  return NextResponse.json({ received: true });
}