import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateMFAEnrollment } from '@/lib/auth/mfa-helpers';

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

    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    console.log(`🔐 Validation enrollment MFA pour utilisateur ${user.id}`);

    // Valider le code TOTP et activer MFA
    const result = await validateMFAEnrollment(user.id, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log(`✅ MFA activé avec succès pour ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'MFA configuré avec succès'
    });

  } catch (error) {
    console.error('💥 Erreur validation MFA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}