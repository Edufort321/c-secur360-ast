import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateMFASetup } from '@/lib/auth/mfa-helpers';

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

    console.log(`🔐 Initialisation MFA pour utilisateur ${user.id}`);

    // Générer setup MFA complet
    const mfaSetup = await generateMFASetup(user.id, user.email || '');

    return NextResponse.json({
      qrCodeDataUrl: mfaSetup.qrCodeDataUrl,
      backupCodes: mfaSetup.backupCodes,
      otpauthUrl: mfaSetup.otpauthUrl
    });

  } catch (error) {
    console.error('💥 Erreur setup MFA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation MFA' },
      { status: 500 }
    );
  }
}