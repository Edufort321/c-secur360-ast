import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendUserInvitation } from '@/lib/auth/mfa-helpers';
import { requirePermission } from '@/lib/auth/rbac-helpers';

export async function POST(request: NextRequest) {
  try {
    // Vérifier permissions admin pour envoyer invitations
    const authContext = await requirePermission('users.manage', 'global');

    const { email, role, clientId } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email et rôle requis' },
        { status: 400 }
      );
    }

    console.log(`📧 Invitation utilisateur: ${email} (${role})`);

    // Envoyer invitation avec MFA obligatoire
    const result = await sendUserInvitation(
      email, 
      role, 
      authContext.user.id,
      clientId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log(`✅ Invitation envoyée avec succès à ${email}`);

    return NextResponse.json({
      success: true,
      invitationId: result.invitationId,
      message: 'Invitation envoyée avec succès'
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur invitation:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'invitation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authContext = await requirePermission('users.view', 'global');
    const supabase = createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        created_at,
        invited_by,
        mfa_required,
        users!user_invitations_invited_by_fkey(email, full_name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      invitations: invitations || []
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('💥 Erreur récupération invitations:', error);
    
    if (message.includes('Permission refusée')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('authentifié')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}