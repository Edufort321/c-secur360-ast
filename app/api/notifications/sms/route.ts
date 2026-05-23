// =================== API NOTIFICATIONS SMS ===================
import { NextRequest, NextResponse } from 'next/server';

// Interface pour la requête SMS
interface SMSRequest {
  phoneNumber: string;
  message: string;
  recipientName?: string;
  type?: string;
}

// Configuration Twilio (en production, utiliser des variables d'environnement)
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC_test_account_sid',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'test_auth_token',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
  webhookUrl: process.env.TWILIO_WEBHOOK_URL || 'http://localhost:3000/api/notifications/webhook'
};

// Simulateur Twilio pour développement
class TwilioSimulator {
  async sendSMS(to: string, body: string, from: string) {
    console.log('📱 [TWILIO SIMULATOR] SMS envoyé:');
    console.log(`   De: ${from}`);
    console.log(`   À: ${to}`);
    console.log(`   Message: ${body}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      to,
      from,
      body,
      dateCreated: new Date(),
      accountSid: TWILIO_CONFIG.accountSid
    };
  }
}

// Fonction d'envoi SMS réelle avec Twilio
async function sendRealSMS(to: string, body: string) {
  try {
    // En production, décommenter et installer twilio
    // const twilio = require('twilio');
    // const client = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken);
    
    // const message = await client.messages.create({
    //   body: body,
    //   from: TWILIO_CONFIG.phoneNumber,
    //   to: to,
    //   statusCallback: TWILIO_CONFIG.webhookUrl
    // });
    
    // return message;
    
    // Pour le développement, utiliser le simulateur
    const simulator = new TwilioSimulator();
    return await simulator.sendSMS(to, body, TWILIO_CONFIG.phoneNumber);
    
  } catch (error) {
    console.error('❌ Erreur envoi SMS Twilio:', error);
    throw error;
  }
}

// Valider le numéro de téléphone
function validatePhoneNumber(phoneNumber: string): boolean {
  // Format international ou nord-américain
  const phoneRegex = /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  return phoneRegex.test(cleanPhone);
}

// Formatter le numéro de téléphone
function formatPhoneNumber(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ajouter +1 si manquant
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  return `+1${cleanPhone}`;
}

// POST - Envoyer un SMS simple
export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json();
    
    // Validation des données requises
    if (!body.phoneNumber || !body.message) {
      return NextResponse.json(
        { 
          error: 'Numéro de téléphone et message requis',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validation du numéro de téléphone
    if (!validatePhoneNumber(body.phoneNumber)) {
      return NextResponse.json(
        { 
          error: 'Format de numéro de téléphone invalide',
          code: 'INVALID_PHONE_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validation de la longueur du message (limite SMS: 1600 caractères)
    if (body.message.length > 1600) {
      return NextResponse.json(
        { 
          error: 'Message trop long (maximum 1600 caractères)',
          code: 'MESSAGE_TOO_LONG'
        },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(body.phoneNumber);
    
    console.log(`📱 Envoi SMS à ${formattedPhone} (${body.recipientName || 'Inconnu'})`);
    
    // Envoyer le SMS
    const result = await sendRealSMS(formattedPhone, body.message);
    
    // Log pour audit
    console.log(`✅ SMS envoyé avec succès:`, {
      sid: result.sid,
      to: formattedPhone,
      recipientName: body.recipientName,
      type: body.type,
      messageLength: body.message.length,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      to: formattedPhone,
      status: result.status,
      sentAt: result.dateCreated || new Date().toISOString(),
      message: 'SMS envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur API SMS:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur lors de l\'envoi SMS',
        code: 'SMS_SEND_FAILED',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Unknown error") : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Obtenir le statut du service SMS
export async function GET() {
  try {
    const status = {
      service: 'SMS Notifications API',
      status: 'active',
      timestamp: new Date().toISOString(),
      config: {
        twilioConfigured: !!TWILIO_CONFIG.accountSid && TWILIO_CONFIG.accountSid !== 'AC_test_account_sid',
        phoneNumber: TWILIO_CONFIG.phoneNumber,
        webhookUrl: TWILIO_CONFIG.webhookUrl,
        environment: process.env.NODE_ENV || 'development'
      }
    };

    return NextResponse.json(status);
    
  } catch (error) {
    console.error('❌ Erreur status API SMS:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        code: 'STATUS_ERROR'
      },
      { status: 500 }
    );
  }
}