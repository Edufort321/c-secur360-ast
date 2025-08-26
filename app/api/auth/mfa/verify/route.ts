import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyMFACode, verifySMSCode } from '@/lib/auth/mfa-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { code, method, context } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code manquant' },
        { status: 400 }
      );
    }

    console.log(`🔐 Vérification MFA ${method} pour utilisateur ${user.id}, contexte: ${context}`);

    let verificationResult;

    if (method === 'sms') {
      // Vérification SMS
      const isValid = await verifySMSCode(user.id, code);
      verificationResult = { isValid, error: isValid ? undefined : 'Code SMS invalide' };
    } else {
      // Vérification TOTP ou backup code
      verificationResult = await verifyMFACode(user.id, code, context);
    }

    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: verificationResult.error || 'Code invalide' },
        { status: 400 }
      );
    }

    console.log(`✅ MFA vérifié avec succès pour ${user.email}`);

    // Créer une session MFA valide (24h pour login, 1h pour action sensible)
    const sessionDuration = context === 'login' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionDuration);

    await supabase
      .from('auth_sessions')
      .upsert({
        user_id: user.id,
        session_type: context === 'login' ? 'mfa_authenticated' : 'mfa_verified',
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      backupCodeUsed: verificationResult.backupCodeUsed,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('💥 Erreur vérification MFA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}