import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'token et mot de passe requis' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });

    const { data: record } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token', token)
      .maybeSingle();

    if (!record) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
    if (record.used_at) return NextResponse.json({ error: 'Ce lien a déjà été utilisé.' }, { status: 400 });
    if (new Date(record.expires_at) < new Date()) return NextResponse.json({ error: 'Ce lien est expiré. Redemandez une réinitialisation.' }, { status: 400 });

    const hash = await hashPassword(password);
    const [updateErr] = await Promise.all([
      supabaseAdmin.from('users').update({ password: hash }).eq('id', record.user_id).then(r => r.error),
      supabaseAdmin.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('id', record.id),
      // Invalidate all sessions for this user
      supabaseAdmin.from('auth_sessions').delete().eq('user_id', record.user_id),
    ]);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[reset-password]', e);
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}

// GET /api/auth/reset-password?token=... → validate token (for page load check)
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false, error: 'Token manquant' });

  const { data: record } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('expires_at, used_at, user_id')
    .eq('token', token)
    .maybeSingle();

  if (!record) return NextResponse.json({ valid: false, error: 'Lien invalide.' });
  if (record.used_at) return NextResponse.json({ valid: false, error: 'Ce lien a déjà été utilisé.' });
  if (new Date(record.expires_at) < new Date()) return NextResponse.json({ valid: false, error: 'Ce lien est expiré.' });

  const { data: user } = await supabaseAdmin
    .from('users').select('email, name').eq('id', record.user_id).maybeSingle();

  return NextResponse.json({ valid: true, email: user?.email, name: user?.name });
}
