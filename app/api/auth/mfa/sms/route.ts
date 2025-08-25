import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendMFACodeSMS } from '@/lib/auth/mfa-helpers';

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

    console.log(`📱 Demande envoi SMS MFA pour utilisateur ${user.id}`);

    // Récupérer le numéro de téléphone de l'utilisateur
    const { data: profile } = await supabase
      .from('users')
      .select('phone')
      .eq('id', user.id)
      .single();

    if (!profile?.phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone non configuré' },
        { status: 400 }
      );
    }

    // Envoyer SMS
    const success = await sendMFACodeSMS(user.id, profile.phone);

    if (!success) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du SMS' },
        { status: 500 }
      );
    }

    console.log(`✅ SMS MFA envoyé au ${profile.phone.slice(-4)}`);

    return NextResponse.json({
      success: true,
      message: 'Code envoyé par SMS',
      phoneNumber: profile.phone.replace(/\d(?=\d{4})/g, '*') // Masquer partiellement le numéro
    });

  } catch (error) {
    console.error('💥 Erreur envoi SMS MFA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    );
  }
}