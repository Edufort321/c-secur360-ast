import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { verifyPassword, createSession, AUTH_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, rememberMe } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password, role, tenant_id, is_active, locked_until, failed_attempts')
      .eq('email', String(email).toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    if (user.is_active === false) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Compte temporairement verrouillé' }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const TTL_7_DAYS = 7 * 24 * 60 * 60;
    const ttlSeconds = rememberMe ? TTL_7_DAYS : SESSION_TTL_SECONDS;

    const { token } = await createSession(user.id, {
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      ttlSeconds,
    });

    cookies().set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ttlSeconds,
    });

    // best-effort (non bloquant)
    supabase.from('users')
      .update({ last_login_at: new Date().toISOString(), failed_attempts: 0 })
      .eq('id', user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenant_id },
    });
  } catch (e: unknown) {
    console.error('auth/login error:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
