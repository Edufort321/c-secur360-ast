import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otplib';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import { User, AuditLogEntry } from '../types/auth';

// Configuration
const SALT_ROUNDS = 12;
const TOTP_SERVICE_NAME = 'C-Secur360';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate TOTP secret and QR code
 */
export async function generateTOTPSetup(email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  // Generate secret
  const secret = OTPAuth.authenticator.generateSecret();
  
  // Create TOTP URL for QR code
  const totpUrl = OTPAuth.authenticator.keyuri(
    email,
    TOTP_SERVICE_NAME,
    secret
  );
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(totpUrl);
  
  // Generate backup codes (10 codes of 8 digits each)
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substr(2, 8).toUpperCase()
  );
  
  return {
    secret,
    qrCodeUrl,
    backupCodes
  };
}

/**
 * Verify TOTP code
 */
export function verifyTOTPCode(code: string, secret: string): boolean {
  try {
    return OTPAuth.authenticator.verify({
      token: code.replace(/\s/g, ''), // Remove spaces
      secret,
      window: 1 // Allow 1 step tolerance (30 seconds before/after)
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create new user
 */
export async function createUser(userData: {
  email: string;
  password: string;
  role: 'super_admin' | 'client_admin' | 'user';
  tenant_id?: string;
  profile?: {
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
  };
}): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(userData.password);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        role: userData.role,
        tenant_id: userData.tenant_id || null,
        totp_enabled: false,
        first_login: true,
        failed_attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: userData.profile
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user TOTP settings
 */
export async function updateUserTOTP(
  userId: string, 
  secret: string, 
  backupCodes: string[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        totp_secret: secret,
        totp_enabled: true,
        totp_backup_codes: backupCodes,
        first_login: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error updating user TOTP:', error);
    return false;
  }
}

/**
 * Check if account is locked
 */
export function isAccountLocked(user: User): boolean {
  if (!user.locked_until) return false;
  
  const lockExpiry = new Date(user.locked_until);
  return new Date() < lockExpiry;
}

/**
 * Handle failed login attempt
 */
export async function handleFailedLogin(email: string): Promise<void> {
  try {
    const user = await getUserByEmail(email);
    if (!user) return;
    
    const failedAttempts = user.failed_attempts + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
    
    await supabase
      .from('users')
      .update({
        failed_attempts: failedAttempts,
        locked_until: shouldLock 
          ? new Date(Date.now() + LOCKOUT_DURATION).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());
  } catch (error) {
    console.error('Error handling failed login:', error);
  }
}

/**
 * Reset failed attempts on successful login
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  try {
    await supabase
      .from('users')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  action: AuditLogEntry['action'],
  details: Record<string, any>,
  request: {
    ip?: string;
    userAgent?: string;
  },
  userId?: string,
  email?: string
): Promise<void> {
  try {
    await supabase
      .from('auth_audit_logs')
      .insert({
        user_id: userId,
        email: email?.toLowerCase(),
        action,
        details,
        ip_address: request.ip || 'unknown',
        user_agent: request.userAgent || 'unknown',
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging auth event:', error);
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}