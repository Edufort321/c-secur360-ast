// =================== WEBHOOK NOTIFICATIONS SMS ===================
import { NextRequest, NextResponse } from 'next/server';

// Interface pour les données webhook Twilio
interface TwilioWebhookData {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  SmsStatus: string;
  AccountSid: string;
  MessageStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

// Interface pour les confirmations de travailleurs
interface WorkerConfirmation {
  phone: string;
  response: string;
  messageId: string;
  confirmedAt: string;
  isValid: boolean;
}

// Fonction pour valider les réponses de confirmation
function validateWorkerResponse(responseBody: string): { isValid: boolean; response: string } {
  const cleanResponse = responseBody.trim().toLowerCase();
  
  // Réponses valides en français et anglais
  const validResponses = [
    'oui', 'yes', 'ok', 'confirm', 'confirmé', 'valide', 'valid',
    'compris', 'understood', 'reçu', 'received', 'acquitté', 'acknowledged'
  ];
  
  const isValid = validResponses.some(valid => cleanResponse.includes(valid));
  
  return {
    isValid,
    response: responseBody.trim()
  };
}

// Fonction pour parser le numéro de téléphone
function parsePhoneNumber(phone: string): string {
  // Nettoyer et formatter le numéro
  return phone.replace(/[^\d+]/g, '');
}

// POST - Recevoir les webhooks Twilio
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('📞 [WEBHOOK] Réception webhook SMS:', body);

    // Parser les données du webhook (format application/x-www-form-urlencoded)
    const webhookData: TwilioWebhookData = Object.fromEntries(
      new URLSearchParams(body).entries()
    ) as any;

    console.log('📞 [WEBHOOK] Données parsées:', webhookData);

    // Vérifier que c'est bien un message reçu (pas un statut d'envoi)
    if (!webhookData.Body || !webhookData.From) {
      console.log('📞 [WEBHOOK] Webhook de statut ignoré (pas un message entrant)');
      return NextResponse.json({ status: 'ignored' });
    }

    // Parser et valider la réponse du travailleur
    const validation = validateWorkerResponse(webhookData.Body);
    const cleanPhone = parsePhoneNumber(webhookData.From);

    const confirmation: WorkerConfirmation = {
      phone: cleanPhone,
      response: validation.response,
      messageId: webhookData.MessageSid,
      confirmedAt: new Date().toISOString(),
      isValid: validation.isValid
    };

    console.log('📞 [WEBHOOK] Confirmation analysée:', confirmation);

    // Ici on pourrait enregistrer en base de données
    // await saveConfirmationToDatabase(confirmation);

    // Simuler l'enregistrement de la confirmation
    console.log('✅ [WEBHOOK] Confirmation enregistrée:', {
      worker: `Travailleur avec ${cleanPhone}`,
      response: validation.response,
      isValid: validation.isValid,
      timestamp: confirmation.confirmedAt
    });

    // Envoyer confirmation automatique si la réponse est valide
    if (validation.isValid) {
      const confirmationMessage = validation.response.toLowerCase().includes('oui') || validation.response.toLowerCase().includes('yes')
        ? `✅ CONFIRMATION REÇUE\n\nVotre confirmation "${validation.response}" a été enregistrée avec succès.\n\nHeure: ${new Date().toLocaleString('fr-CA', { timeZone: 'America/Montreal' })}\n\nMerci de prioriser votre sécurité.`
        : `✅ RÉPONSE REÇUE\n\nVotre message "${validation.response}" a été enregistré.\n\nHeure: ${new Date().toLocaleString('fr-CA', { timeZone: 'America/Montreal' })}\n\nPour confirmer officiellement, répondez "OUI".`;

      // En production, renvoyer un SMS de confirmation via Twilio
      console.log(`📱 [AUTO-REPLY] Envoi confirmation à ${cleanPhone}:`, confirmationMessage);
    } else {
      // Réponse non reconnue - demander clarification
      const clarificationMessage = `❓ RÉPONSE NON RECONNUE\n\nVotre message "${validation.response}" n'a pas été reconnu comme une confirmation.\n\nPour confirmer la réception de l'alerte LOTO, répondez:\n• "OUI" (français)\n• "YES" (anglais)\n• "OK"\n\nCette confirmation est OBLIGATOIRE pour votre sécurité.`;
      
      console.log(`📱 [AUTO-REPLY] Demande clarification à ${cleanPhone}:`, clarificationMessage);
    }

    // Réponse de succès pour Twilio
    return NextResponse.json({
      status: 'processed',
      confirmation: {
        messageId: webhookData.MessageSid,
        from: cleanPhone,
        response: validation.response,
        isValid: validation.isValid,
        processedAt: new Date().toISOString()
      },
      message: 'Confirmation processed successfully'
    });

  } catch (error) {
    console.error('❌ [WEBHOOK] Erreur traitement webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du webhook',
        code: 'WEBHOOK_PROCESSING_ERROR',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Unknown error") : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Statut du webhook
export async function GET() {
  try {
    const webhookStatus = {
      service: 'SMS Webhook API',
      status: 'active',
      timestamp: new Date().toISOString(),
      endpoints: {
        webhook: '/api/notifications/webhook',
        purpose: 'Receive SMS replies and confirmations from workers'
      },
      supportedResponses: [
        'oui', 'yes', 'ok', 'confirm', 'confirmé',
        'compris', 'understood', 'reçu', 'received'
      ],
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(webhookStatus);
    
  } catch (error) {
    console.error('❌ [WEBHOOK] Erreur status webhook:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut webhook',
        code: 'WEBHOOK_STATUS_ERROR'
      },
      { status: 500 }
    );
  }
}