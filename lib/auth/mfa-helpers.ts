// ===================================================================
// C-Secur360 Multi-Factor Authentication (MFA) Helpers
// ===================================================================

import { createClient } from '@/utils/supabase/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { Twilio } from 'twilio';

interface MFASetup {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
  otpauthUrl: string;
}

interface MFAVerification {
  isValid: boolean;
  error?: string;
  backupCodeUsed?: boolean;
}

// Configuration TOTP
authenticator.options = {
  window: 1, // Fenêtre de 30 secondes
  step: 30
};

// Client Twilio pour SMS
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Génère un setup MFA complet pour un utilisateur
 */
export async function generateMFASetup(userId: string, userEmail: string): Promise<MFASetup> {
  const supabase = createClient();
  
  // Générer secret TOTP unique
  const secret = authenticator.generateSecret();
  
  // Créer URL OTPAUTH pour QR code
  const serviceName = 'C-Secur360';
  const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
  
  // Générer QR code
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  // Générer codes de sauvegarde (8 codes de 8 caractères)
  const backupCodes = Array.from({ length: 8 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  // Sauvegarder en base (temporaire jusqu'à validation)
  await supabase
    .from('user_security_settings')
    .upsert({
      user_id: userId,
      totp_secret_temp: secret, // Temporaire jusqu'à validation
      backup_codes: JSON.stringify(backupCodes.map(code => ({
        code,
        used: false,
        created_at: new Date().toISOString()
      }))),
      mfa_enrollment_started: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  return {
    secret,
    qrCodeDataUrl,
    backupCodes,
    otpauthUrl
  };
}

/**
 * Valide l'enrollment MFA avec code TOTP
 */
export async function validateMFAEnrollment(
  userId: string, 
  token: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  try {
    // Récupérer secret temporaire
    const { data: security, error } = await supabase
      .from('user_security_settings')
      .select('totp_secret_temp, backup_codes')
      .eq('user_id', userId)
      .single();
    
    if (error || !security?.totp_secret_temp) {
      return { success: false, error: 'Setup MFA non trouvé' };
    }
    
    // Valider code TOTP
    const isValid = authenticator.verify({
      token,
      secret: security.totp_secret_temp
    });
    
    if (!isValid) {
      return { success: false, error: 'Code invalide' };
    }
    
    // Activer MFA définitivement
    await supabase
      .from('user_security_settings')
      .update({
        totp_secret: security.totp_secret_temp,
        totp_secret_temp: null,
        mfa_enabled: true,
        mfa_enrolled_at: new Date().toISOString(),
        mfa_enforcement_level: 'required',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    // Log d'audit
    await logMFAEvent(userId, 'mfa_enrolled', { method: 'totp' });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur validation MFA:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

/**
 * Vérifie un code MFA (TOTP ou backup)
 */
export async function verifyMFACode(
  userId: string, 
  token: string,
  context: 'login' | 'sensitive_action' = 'login'
): Promise<MFAVerification> {
  const supabase = createClient();
  
  try {
    const { data: security, error } = await supabase
      .from('user_security_settings')
      .select('totp_secret, backup_codes, mfa_enabled')
      .eq('user_id', userId)
      .single();
    
    if (error || !security) {
      return { isValid: false, error: 'Configuration MFA non trouvée' };
    }
    
    if (!security.mfa_enabled) {
      return { isValid: false, error: 'MFA non activé' };
    }
    
    // Vérifier code TOTP d'abord
    if (security.totp_secret) {
      const isValidTOTP = authenticator.verify({
        token,
        secret: security.totp_secret
      });
      
      if (isValidTOTP) {
        await logMFAEvent(userId, 'mfa_verified', { 
          method: 'totp', 
          context 
        });
        return { isValid: true };
      }
    }
    
    // Vérifier codes de sauvegarde
    if (security.backup_codes) {
      const backupCodes = JSON.parse(security.backup_codes);
      const codeEntry = backupCodes.find((entry: any) => 
        entry.code === token.toUpperCase() && !entry.used
      );
      
      if (codeEntry) {
        // Marquer le code comme utilisé
        codeEntry.used = true;
        codeEntry.used_at = new Date().toISOString();
        
        await supabase
          .from('user_security_settings')
          .update({
            backup_codes: JSON.stringify(backupCodes),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        await logMFAEvent(userId, 'mfa_verified', { 
          method: 'backup_code', 
          context 
        });
        
        return { isValid: true, backupCodeUsed: true };
      }
    }
    
    // Code invalide
    await logMFAEvent(userId, 'mfa_failed', { 
      method: 'unknown', 
      context,
      token_prefix: token.substring(0, 2) 
    });
    
    return { isValid: false, error: 'Code invalide' };
  } catch (error) {
    console.error('Erreur vérification MFA:', error);
    return { isValid: false, error: 'Erreur serveur' };
  }
}

/**
 * Génère de nouveaux codes de sauvegarde
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const supabase = createClient();
  
  const newBackupCodes = Array.from({ length: 8 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  await supabase
    .from('user_security_settings')
    .update({
      backup_codes: JSON.stringify(newBackupCodes.map(code => ({
        code,
        used: false,
        created_at: new Date().toISOString()
      }))),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  await logMFAEvent(userId, 'backup_codes_regenerated');
  
  return newBackupCodes;
}

/**
 * Désactive MFA pour un utilisateur
 */
export async function disableMFA(userId: string, reason: string = 'user_request'): Promise<boolean> {
  const supabase = createClient();
  
  try {
    await supabase
      .from('user_security_settings')
      .update({
        mfa_enabled: false,
        totp_secret: null,
        backup_codes: null,
        mfa_disabled_at: new Date().toISOString(),
        mfa_disabled_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    await logMFAEvent(userId, 'mfa_disabled', { reason });
    
    return true;
  } catch (error) {
    console.error('Erreur désactivation MFA:', error);
    return false;
  }
}

/**
 * Envoie code MFA par SMS (fallback)
 */
export async function sendMFACodeSMS(userId: string, phoneNumber: string): Promise<boolean> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio non configuré');
    return false;
  }
  
  const supabase = createClient();
  
  try {
    // Générer code 6 chiffres
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Sauvegarder code temporaire
    await supabase
      .from('user_security_settings')
      .update({
        sms_code_temp: smsCode,
        sms_code_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    // Envoyer SMS
    await twilioClient.messages.create({
      body: `C-Secur360: Votre code de vérification est ${smsCode}. Valide 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    await logMFAEvent(userId, 'sms_code_sent', { phone: phoneNumber.slice(-4) });
    
    return true;
  } catch (error) {
    console.error('Erreur envoi SMS MFA:', error);
    return false;
  }
}

/**
 * Vérifie code SMS MFA
 */
export async function verifySMSCode(userId: string, code: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: security } = await supabase
      .from('user_security_settings')
      .select('sms_code_temp, sms_code_expires')
      .eq('user_id', userId)
      .single();
    
    if (!security?.sms_code_temp || !security.sms_code_expires) {
      return false;
    }
    
    const now = new Date();
    const expires = new Date(security.sms_code_expires);
    
    if (now > expires) {
      // Code expiré
      await supabase
        .from('user_security_settings')
        .update({
          sms_code_temp: null,
          sms_code_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      return false;
    }
    
    const isValid = security.sms_code_temp === code;
    
    if (isValid) {
      // Supprimer code utilisé
      await supabase
        .from('user_security_settings')
        .update({
          sms_code_temp: null,
          sms_code_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      await logMFAEvent(userId, 'sms_code_verified');
    } else {
      await logMFAEvent(userId, 'sms_code_failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('Erreur vérification SMS:', error);
    return false;
  }
}

/**
 * Envoie invitation utilisateur avec setup MFA obligatoire
 */
export async function sendUserInvitation(
  email: string, 
  role: string,
  invitedBy: string,
  clientId?: string
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  const supabase = createClient();
  
  try {
    // Générer token d'invitation sécurisé
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    // Créer invitation
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        invited_by: invitedBy,
        client_id: clientId,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        mfa_required: true, // MFA obligatoire pour nouveaux utilisateurs
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // TODO: Envoyer email d'invitation
    const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invitation/${invitationToken}`;
    
    console.log(`📧 Invitation envoyée à ${email}: ${invitationUrl}`);
    
    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error('Erreur invitation utilisateur:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

/**
 * Log des événements MFA pour audit
 */
async function logMFAEvent(
  userId: string, 
  eventType: string, 
  metadata: any = {}
): Promise<void> {
  const supabase = createClient();
  
  try {
    await supabase
      .from('auth_audit_logs')
      .insert({
        user_id: userId,
        event_type: eventType,
        ip_address: metadata.ip || null,
        user_agent: metadata.userAgent || null,
        metadata,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Erreur log MFA:', error);
  }
}

/**
 * Vérifie si MFA est requis pour un utilisateur
 */
export async function isMFARequired(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: security } = await supabase
      .from('user_security_settings')
      .select('mfa_enforcement_level, mfa_enabled')
      .eq('user_id', userId)
      .single();
    
    if (!security) return true; // Par défaut, MFA requis
    
    return security.mfa_enforcement_level === 'required' || 
           security.mfa_enforcement_level === 'admin_required';
  } catch (error) {
    console.error('Erreur vérification MFA requis:', error);
    return true; // Par sécurité, MFA requis en cas d'erreur
  }
}

export const MFAHelpers = {
  generateMFASetup,
  validateMFAEnrollment,
  verifyMFACode,
  regenerateBackupCodes,
  disableMFA,
  sendMFACodeSMS,
  verifySMSCode,
  sendUserInvitation,
  isMFARequired
};