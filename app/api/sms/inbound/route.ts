import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auditHelpers } from '@/lib/audit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Webhook Twilio pour SMS entrants
 * Gère les commandes STOP/START et autres SMS
 */
export async function POST(request: NextRequest) {
  try {
    // Parse du body Twilio (form-urlencoded)
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    // Log de l'SMS entrant
    await auditHelpers.sms('receive', {
      from,
      to,
      body: body?.substring(0, 100), // Limiter pour les logs
      messageSid
    });

    if (!from || !body) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Normaliser le numéro de téléphone
    const normalizedFrom = from.startsWith('+1') ? from : `+1${from.replace(/\D/g, '')}`;
    const messageBody = body.trim().toUpperCase();

    // Traitement des commandes spéciales
    let twimlResponse = '';
    let shouldRespond = false;

    if (messageBody === 'STOP' || messageBody === 'UNSUBSCRIBE') {
      // Désactiver les notifications SMS pour ce numéro
      await supabase
        .from('workers')
        .update({ 
          sms_consent: false,
          consent_updated_at: new Date().toISOString()
        })
        .eq('phone', normalizedFrom);

      await auditHelpers.sms('receive', {
        from: normalizedFrom,
        action: 'STOP',
        consent: false
      });

      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vous avez été désabonné des notifications SMS C-Secur360. Répondez START pour vous réabonner.</Message>
</Response>`;
      shouldRespond = true;

    } else if (messageBody === 'START' || messageBody === 'SUBSCRIBE') {
      // Réactiver les notifications SMS
      await supabase
        .from('workers')
        .update({ 
          sms_consent: true,
          consent_updated_at: new Date().toISOString()
        })
        .eq('phone', normalizedFrom);

      await auditHelpers.sms('receive', {
        from: normalizedFrom,
        action: 'START',
        consent: true
      });

      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Vous êtes maintenant réabonné aux notifications SMS C-Secur360. Répondez STOP pour vous désabonner.</Message>
</Response>`;
      shouldRespond = true;

    } else if (messageBody === 'HELP' || messageBody === 'INFO') {
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>C-Secur360 SMS:
• STOP - Se désabonner
• START - Se réabonner  
• HELP - Cette aide
Support: +15146034519</Message>
</Response>`;
      shouldRespond = true;

    } else {
      // Message général - forward vers l'équipe ou traiter selon contexte
      await auditHelpers.sms('receive', {
        from: normalizedFrom,
        action: 'general_message',
        message: body.substring(0, 100)
      });

      // Optionnel: Forward vers le numéro de support
      if (process.env.OWNER_MOBILE) {
        try {
          // Utiliser l'API d'envoi existante pour forward
          const forwardResponse = await fetch(new URL('/api/sms/send', request.url), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              astId: `inbound-${Date.now()}`,
              type: 'general_alert',
              message: `SMS de ${from}: ${body}`,
              recipients: [process.env.OWNER_MOBILE],
              sentBy: 'Système Forward'
            })
          });

          await auditHelpers.sms('receive', {
            from: normalizedFrom,
            action: 'forward',
            forwardTo: process.env.OWNER_MOBILE,
            success: forwardResponse.ok
          });
        } catch (error) {
          console.error('Erreur forward SMS:', error);
        }
      }

      // Réponse automatique optionnelle
      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Merci pour votre message. Notre équipe vous répondra sous peu. Pour de l'aide immédiate: +15146034519</Message>
</Response>`;
      shouldRespond = false; // Pas de réponse automatique pour messages généraux
    }

    // Enregistrer le SMS entrant dans la base
    try {
      await supabase
        .from('sms_alerts')
        .insert({
          tenant_id: 'system',
          ast_id: `inbound-${messageSid}`,
          alert_type: 'inbound',
          message: body,
          sent_by_name: from,
          recipients: [to],
          status: 'received',
          delivery_status: [{
            phone: from,
            success: true,
            sid: messageSid,
            direction: 'inbound'
          }]
        });
    } catch (error) {
      console.error('Erreur enregistrement SMS entrant:', error);
    }

    // Retourner TwiML si nécessaire
    if (shouldRespond && twimlResponse) {
      return new NextResponse(twimlResponse, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Réponse vide (pas de message automatique)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.sms('receive', {
      error: errorMsg,
      success: false
    });

    console.error('❌ Erreur webhook SMS entrant:', error);
    
    // Réponse TwiML d'erreur
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200, // Toujours 200 pour Twilio
        headers: { 'Content-Type': 'text/xml' }
      }
    );
  }
}