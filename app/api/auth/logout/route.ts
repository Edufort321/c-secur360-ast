import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuthEvent } from '@/lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (token) {
      // Get session info for audit log
      const { data: session } = await supabase
        .from('auth_sessions')
        .select(`
          user_id,
          users (email)
        `)
        .eq('token', token)
        .single();

      // Delete session
      await supabase
        .from('auth_sessions')
        .delete()
        .eq('token', token);

      // Log logout event
      if (session) {
        await logAuthEvent('logout', {
          logout_type: 'manual'
        }, { ip, userAgent }, session.user_id, session.users?.email);
      }
    }

    // Clear cookie and redirect
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    }, { status: 500 });
  }
}

// Clean expired sessions
export async function DELETE(request: NextRequest) {
  try {
    // Only super admins can clean sessions
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: session } = await supabase
      .from('auth_sessions')
      .select(`
        users (role)
      `)
      .eq('token', token)
      .single();

    if (!session || session.users?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Clean expired sessions
    const { data: expiredSessions } = await supabase
      .from('auth_sessions')
      .select('user_id, users(email)')
      .lt('expires_at', new Date().toISOString());

    const { error } = await supabase
      .from('auth_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw error;
    }

    // Log cleanup
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    for (const expiredSession of expiredSessions || []) {
      await logAuthEvent('session_expired', {
        cleanup_type: 'automatic'
      }, { ip, userAgent }, expiredSession.user_id, expiredSession.users?.email);
    }

    return NextResponse.json({
      success: true,
      cleaned_sessions: expiredSessions?.length || 0
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du nettoyage'
    }, { status: 500 });
  }
}