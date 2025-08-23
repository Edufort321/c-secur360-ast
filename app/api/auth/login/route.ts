import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmail, 
  verifyPassword, 
  verifyTOTPCode, 
  handleFailedLogin,
  resetFailedAttempts,
  logAuthEvent,
  isAccountLocked,
  generateSecureToken
} from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';
import { LoginRequest, LoginResponse } from '@/types/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Session expiry (24 hours for normal, 30 days if remember me)
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, totp_code, remember_me } = body;

    // Get IP and user agent for audit
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate required fields
    if (!email || !password) {
      await logAuthEvent('login_fail', {
        reason: 'Missing email or password',
        email
      }, { ip, userAgent }, undefined, email);

      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis'
      } as LoginResponse, { status: 400 });
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      // Log failed attempt but don't reveal if user exists
      await logAuthEvent('login_fail', {
        reason: 'User not found',
        email
      }, { ip, userAgent }, undefined, email);

      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides'
      } as LoginResponse, { status: 401 });
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      await logAuthEvent('login_fail', {
        reason: 'Account locked',
        locked_until: user.locked_until
      }, { ip, userAgent }, user.id, email);

      return NextResponse.json({
        success: false,
        error: 'Compte temporairement verrouillé. Réessayez plus tard.',
        locked_until: user.locked_until
      } as LoginResponse, { status: 423 });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      await handleFailedLogin(email);
      await logAuthEvent('login_fail', {
        reason: 'Invalid password',
        attempts: user.failed_attempts + 1
      }, { ip, userAgent }, user.id, email);

      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides'
      } as LoginResponse, { status: 401 });
    }

    // If TOTP is enabled, verify code
    if (user.totp_enabled) {
      if (!totp_code) {
        return NextResponse.json({
          success: false,
          requires_totp: true
        } as LoginResponse);
      }

      const totpValid = verifyTOTPCode(totp_code, user.totp_secret!);
      if (!totpValid) {
        await logAuthEvent('login_fail', {
          reason: 'Invalid TOTP code'
        }, { ip, userAgent }, user.id, email);

        return NextResponse.json({
          success: false,
          error: 'Code d\'authentification invalide',
          requires_totp: true
        } as LoginResponse, { status: 401 });
      }
    }

    // If first login, require TOTP setup
    if (user.first_login && !user.totp_enabled) {
      await logAuthEvent('login_success', {
        reason: 'First login - TOTP setup required',
        role: user.role
      }, { ip, userAgent }, user.id, email);

      return NextResponse.json({
        success: true,
        requires_setup: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id,
          totp_enabled: user.totp_enabled,
          first_login: user.first_login,
          profile: user.profile,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      } as LoginResponse);
    }

    // Create session
    const token = generateSecureToken(64);
    const sessionDuration = remember_me ? REMEMBER_ME_DURATION : SESSION_DURATION;
    const expiresAt = new Date(Date.now() + sessionDuration);

    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: ip,
        user_agent: userAgent
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la session'
      } as LoginResponse, { status: 500 });
    }

    // Reset failed attempts
    await resetFailedAttempts(user.id);

    // Log successful login
    await logAuthEvent('login_success', {
      role: user.role,
      tenant_id: user.tenant_id,
      remember_me
    }, { ip, userAgent }, user.id, email);

    // Determine redirect URL based on role
    let redirectUrl = '/';
    if (user.role === 'super_admin') {
      redirectUrl = '/admin';
    } else if (user.role === 'client_admin' && user.tenant_id) {
      redirectUrl = `/client/${user.tenant_id}`;
    }

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        totp_enabled: user.totp_enabled,
        first_login: user.first_login,
        profile: user.profile,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at
      },
      redirect_url: redirectUrl
    } as LoginResponse);

    // Set secure session cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Math.floor(sessionDuration / 1000),
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logAuthEvent('login_fail', {
      reason: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { ip, userAgent });

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    } as LoginResponse, { status: 500 });
  }
}

// Handle GET requests (check auth status)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Verify session
    const { data: session, error } = await supabase
      .from('auth_sessions')
      .select(`
        *,
        users (
          id, email, role, tenant_id, totp_enabled, first_login, 
          profile, created_at, updated_at, last_login_at
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return NextResponse.json({
        success: false,
        error: 'Session expirée'
      }, { status: 401 });
    }

    // Update last activity
    await supabase
      .from('auth_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('token', token);

    return NextResponse.json({
      success: true,
      user: session.users
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}