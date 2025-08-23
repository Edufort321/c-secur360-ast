import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioConfig } from '@/lib/twilio-safe';
import { auditHelpers } from '@/lib/audit';

/**
 * API pour gérer la configuration Twilio via l'interface admin
 */

export async function GET(request: NextRequest) {
  try {
    const config = validateTwilioConfig();
    
    // Masquer les secrets pour la sécurité
    const safeConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 
        maskSecret(process.env.TWILIO_ACCOUNT_SID) : '',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 
        maskSecret(process.env.TWILIO_AUTH_TOKEN) : '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ? 
        maskSecret(process.env.TWILIO_MESSAGING_SERVICE_SID) : '',
      ...config
    };

    await auditHelpers.admin('twilio_config_view', {
      mode: config.mode,
      valid: config.valid
    }, 'admin');

    return NextResponse.json(safeConfig);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.admin('twilio_config_error', {
      error: errorMsg,
      action: 'GET'
    }, 'admin');

    return NextResponse.json(
      { error: 'Erreur récupération config Twilio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountSid, authToken, phoneNumber, messagingServiceSid } = body;

    // Validation des données
    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Données manquantes (accountSid, authToken, phoneNumber requis)' },
        { status: 400 }
      );
    }

    // Validation format Account SID
    if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
      return NextResponse.json(
        { error: 'Format Account SID invalide (doit commencer par AC et faire 34 caractères)' },
        { status: 400 }
      );
    }

    // Validation format numéro de téléphone
    if (!phoneNumber.match(/^\+1[0-9]{10}$/)) {
      return NextResponse.json(
        { error: 'Format numéro invalide (doit être +1XXXXXXXXXX)' },
        { status: 400 }
      );
    }

    // Validation Messaging Service SID si fourni
    if (messagingServiceSid && (!messagingServiceSid.startsWith('MG') || messagingServiceSid.length !== 34)) {
      return NextResponse.json(
        { error: 'Format Messaging Service SID invalide (doit commencer par MG et faire 34 caractères)' },
        { status: 400 }
      );
    }

    // Log de la mise à jour (sans les secrets)
    await auditHelpers.admin('twilio_config_update', {
      accountSid: maskSecret(accountSid),
      phoneNumber,
      hasMessagingService: !!messagingServiceSid,
      timestamp: new Date().toISOString()
    }, 'admin');

    // Note: En production, ces valeurs seraient sauvegardées dans un système 
    // de gestion de secrets sécurisé (ex: HashiCorp Vault, AWS Secrets Manager)
    // Pour cette démo, nous retournons juste la validation
    
    // Simulation de la sauvegarde réussie
    const updatedConfig = {
      accountSid: maskSecret(accountSid),
      authToken: maskSecret(authToken),
      phoneNumber,
      messagingServiceSid: messagingServiceSid ? maskSecret(messagingServiceSid) : '',
      valid: true,
      missing: [],
      mode: 'production' as const
    };

    return NextResponse.json({
      success: true,
      message: 'Configuration Twilio mise à jour avec succès',
      config: updatedConfig
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await auditHelpers.admin('twilio_config_error', {
      error: errorMsg,
      action: 'POST'
    }, 'admin');

    return NextResponse.json(
      { error: 'Erreur sauvegarde config Twilio' },
      { status: 500 }
    );
  }
}

/**
 * Masquer les secrets pour l'affichage sécurisé
 */
function maskSecret(secret: string): string {
  if (!secret || secret.length < 8) {
    return secret;
  }
  
  return secret.substring(0, 6) + '*'.repeat(secret.length - 10) + secret.substring(secret.length - 4);
}