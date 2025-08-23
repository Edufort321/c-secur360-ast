import { NextRequest, NextResponse } from 'next/server';
import { auditHelpers } from '@/lib/audit';

/**
 * Endpoint de compatibilité pour l'envoi de SMS
 * Redirige vers /api/sms/send avec format standardisé
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log de l'usage de l'endpoint de compatibilité
    await auditHelpers.sms('send', {
      endpoint: '/api/send-sms',
      redirected: true,
      recipients: Array.isArray(body.recipients) ? body.recipients.length : 1
    });

    // Format du body pour compatibilité avec différents formats d'entrée
    let formattedBody;
    
    if (body.to && body.body) {
      // Format simple : { to: "+1234567890", body: "message" }
      formattedBody = {
        astId: body.astId || `api-${Date.now()}`,
        type: body.type || 'general_alert',
        message: body.body,
        recipients: Array.isArray(body.to) ? body.to : [body.to],
        sentBy: body.sentBy || 'API'
      };
    } else if (body.recipients && body.message) {
      // Format avancé : déjà dans le bon format
      formattedBody = body;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Format invalide. Utiliser { "to": "+1234567890", "body": "message" } ou le format avancé'
      }, { status: 400 });
    }

    // Rediriger vers l'API SMS principale
    const smsUrl = new URL('/api/sms/send', request.url);
    
    const response = await fetch(smsUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries())
      },
      body: JSON.stringify(formattedBody)
    });

    const result = await response.json();
    
    return NextResponse.json(result, { status: response.status });
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.sms('send', {
      endpoint: '/api/send-sms',
      error: errorMsg,
      success: false
    });

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la redirection SMS',
      details: errorMsg
    }, { status: 500 });
  }
}