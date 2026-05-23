/**
 * Validation des webhooks Twilio pour la sécurité
 */

import { auditHelpers } from './audit';

/**
 * Valide la signature Twilio d'un webhook
 */
export async function validateTwilioSignature(
  request: Request,
  body: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Vérifier si la validation est activée
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken || authToken.includes('placeholder')) {
      // Mode développement - skip la validation
      return { valid: true };
    }

    const signature = request.headers.get('X-Twilio-Signature');
    if (!signature) {
      await auditHelpers.sms('receive', {
        error: 'Missing Twilio signature header',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      return { 
        valid: false, 
        error: 'Missing Twilio signature' 
      };
    }

    // Import dynamique pour éviter les erreurs si Twilio n'est pas installé
    try {
      const twilio = require('twilio');
      const url = request.url;
      
      const isValid = twilio.validateRequest(
        authToken,
        signature,
        url,
        body
      );

      if (!isValid) {
        await auditHelpers.sms('receive', {
          error: 'Invalid Twilio signature',
          signature: signature.substring(0, 20) + '...',
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        });
      }

      return { valid: isValid };

    } catch (error) {
      // Twilio non installé ou erreur - permettre en mode dev
      console.warn('⚠️ Cannot validate Twilio signature:', error);
      return { valid: true };
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.sms('receive', {
      error: `Signature validation error: ${errorMsg}`,
      success: false
    });

    return { 
      valid: false, 
      error: `Signature validation failed: ${errorMsg}` 
    };
  }
}

/**
 * Rate limiting pour les webhooks
 */
const webhookRateLimit = new Map<string, { count: number; lastReset: number }>();

export function checkWebhookRateLimit(identifier: string, maxPerMinute: number = 100): boolean {
  const now = Date.now();
  const minute = 60 * 1000;
  const current = webhookRateLimit.get(identifier);

  if (!current || now - current.lastReset > minute) {
    webhookRateLimit.set(identifier, { count: 1, lastReset: now });
    return true;
  }

  if (current.count >= maxPerMinute) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Parse les données Twilio form-urlencoded de manière sécurisée
 */
export function parseTwilioFormData(formData: FormData): Record<string, string> {
  const data: Record<string, string> = {};
  
  // Champs Twilio standards
  const allowedFields = [
    'From', 'To', 'Body', 'MessageSid', 'MessageStatus', 'CallSid', 
    'CallStatus', 'Direction', 'DialCallStatus', 'DialCallDuration',
    'AccountSid', 'MessagingServiceSid', 'NumMedia', 'ErrorCode', 'ErrorMessage'
  ];

  for (const [key, value] of formData.entries()) {
    if (allowedFields.includes(key) && typeof value === 'string') {
      // Sanitisation de base
      data[key] = value.trim().substring(0, 1000); // Limiter la taille
    }
  }

  return data;
}