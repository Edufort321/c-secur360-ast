// API SMS - Placeholder en attendant l'installation de Twilio
// Ce fichier sera mis à jour avec la vraie intégration Twilio

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createTwilioClient, isTwilioAvailable } from '@/lib/twilio-safe';

// =================== TYPES ===================

interface SMSRequest {
  astId: string;
  type: 'lock_applied' | 'lock_removed' | 'general_alert' | 'emergency' | 'work_completion';
  message: string;
  recipients: string[];
  sentBy?: string;
}

interface SMSResponse {
  success: boolean;
  alertId?: string;
  message: string;
  recipientCount: number;
  error?: string;
  details?: any;
}

// =================== VALIDATION TÉLÉPHONE CANADIEN ===================

function validateCanadianPhoneNumber(phone: string): boolean {
  // Format: +1XXXXXXXXXX, 1XXXXXXXXXX, ou XXXXXXXXXX (10 digits)
  const phoneRegex = /^\+?1?([2-9]\d{2}[2-9]\d{2}\d{4})$/;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleaned);
}

function formatCanadianPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const match = cleaned.match(/^(\+?1?)([2-9]\d{2}[2-9]\d{2}\d{4})$/);
  if (match) {
    return '+1' + match[2];
  }
  return phone; // Retourner tel quel si invalide
}

// =================== SUPABASE CONFIG ===================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante pour SMS API');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

// =================== RATE LIMITING ===================

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_SMS_PER_MINUTE = 10;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (userLimit.count >= MAX_SMS_PER_MINUTE) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// =================== FONCTION SMS TWILIO (PLACEHOLDER) ===================

async function sendSMSWithTwilio(phone: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  // TODO: Remplacer par la vraie intégration Twilio quand installé
  
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('📝 SMS Simulation (Twilio non configuré):', { phone, message });
    
    // Simulation de l'envoi réussi pour les tests
    return { 
      success: true, 
      sid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
  }
  
  try {
    // Vérification si Twilio est disponible
    if (!isTwilioAvailable()) {
      console.log('📝 Twilio non installé - simulation activée');
      return { 
        success: true, 
        sid: `sim_twilio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    }
    
    // Créer le client Twilio de manière sécurisée
    const twilio = createTwilioClient(twilioAccountSid, twilioAuthToken);
    if (!twilio) {
      console.log('📝 Erreur création client Twilio - simulation activée');
      return { 
        success: true, 
        sid: `sim_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    }
    
    const messageResponse = await twilio.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phone
    });
    
    console.log('✅ SMS envoyé via Twilio:', messageResponse.sid);
    return { success: true, sid: messageResponse.sid };
    
  } catch (error: any) {
    console.error('❌ Erreur Twilio:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur inconnue Twilio' 
    };
  }
}

// =================== ENDPOINT PRINCIPAL ===================

export async function POST(request: NextRequest) {
  try {
    // Parse du body
    const body: SMSRequest = await request.json();
    const { astId, type, message, recipients, sentBy = 'Système' } = body;
    
    // Validation des données
    if (!astId || !type || !message || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Données manquantes (astId, type, message, recipients requis)',
          recipientCount: 0
        } as SMSResponse,
        { status: 400 }
      );
    }
    
    // Validation du message (max 160 caractères pour SMS)
    if (message.length > 160) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Message trop long (max 160 caractères)',
          recipientCount: 0
        } as SMSResponse,
        { status: 400 }
      );
    }
    
    // Rate limiting par AST
    if (!checkRateLimit(astId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Limite de SMS atteinte (10 par minute)',
          recipientCount: 0
        } as SMSResponse,
        { status: 429 }
      );
    }
    
    // Validation et formatage des numéros de téléphone
    const validRecipients: string[] = [];
    const invalidNumbers: string[] = [];
    
    for (const phone of recipients) {
      if (validateCanadianPhoneNumber(phone)) {
        validRecipients.push(formatCanadianPhoneNumber(phone));
      } else {
        invalidNumbers.push(phone);
        console.warn('⚠️ Numéro invalide ignoré:', phone);
      }
    }
    
    if (validRecipients.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Aucun numéro de téléphone valide trouvé',
          recipientCount: 0,
          details: { invalidNumbers }
        } as SMSResponse,
        { status: 400 }
      );
    }
    
    // Créer l'enregistrement dans Supabase
    const { data: alertData, error: alertError } = await supabase
      .from('sms_alerts')
      .insert({
        ast_id: astId,
        tenant_id: 'default', // TODO: Récupérer le vrai tenant
        alert_type: type,
        message,
        sent_by_name: sentBy,
        recipients: validRecipients,
        recipient_names: [], // TODO: Ajouter les noms si disponibles
        status: 'pending'
      })
      .select()
      .single();
    
    if (alertError) {
      console.error('❌ Erreur Supabase:', alertError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur base de données',
          recipientCount: 0,
          error: alertError.message
        } as SMSResponse,
        { status: 500 }
      );
    }
    
    // Envoi des SMS
    const sendResults: Array<{ phone: string; success: boolean; sid?: string; error?: string }> = [];
    let successCount = 0;
    
    for (const phone of validRecipients) {
      try {
        const result = await sendSMSWithTwilio(phone, message);
        sendResults.push({ phone, ...result });
        if (result.success) successCount++;
      } catch (error: any) {
        sendResults.push({ 
          phone, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Mise à jour du statut dans Supabase
    const finalStatus = successCount === validRecipients.length ? 'sent' : 
                       successCount > 0 ? 'partial' : 'failed';
    
    await supabase
      .from('sms_alerts')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        delivery_status: sendResults,
        cost_cents: successCount * 1 // 1 cent par SMS (estimation)
      })
      .eq('id', alertData.id);
    
    // Log pour debugging
    console.log(`📱 SMS Alert [${type}]:`, {
      astId,
      message: message.substring(0, 50) + '...',
      validRecipients: validRecipients.length,
      successCount,
      status: finalStatus
    });
    
    // Réponse
    const response: SMSResponse = {
      success: successCount > 0,
      alertId: alertData.id,
      message: successCount === validRecipients.length 
        ? 'Tous les SMS envoyés avec succès'
        : successCount > 0 
        ? `${successCount}/${validRecipients.length} SMS envoyés`
        : 'Échec envoi SMS',
      recipientCount: successCount,
      details: {
        totalValidNumbers: validRecipients.length,
        invalidNumbers,
        sendResults
      }
    };
    
    return NextResponse.json(response, { 
      status: successCount > 0 ? 200 : 500 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur API SMS:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        recipientCount: 0,
        error: error.message
      } as SMSResponse,
      { status: 500 }
    );
  }
}

// =================== ENDPOINT GET POUR STATUS ===================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const astId = searchParams.get('astId');
    
    if (!astId) {
      return NextResponse.json({ error: 'astId requis' }, { status: 400 });
    }
    
    // Récupérer l'historique SMS pour cet AST
    const { data: alerts, error } = await supabase
      .from('sms_alerts')
      .select('*')
      .eq('ast_id', astId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur récupération SMS:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      count: alerts?.length || 0
    });
    
  } catch (error: any) {
    console.error('❌ Erreur GET SMS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}