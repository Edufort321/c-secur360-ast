import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const EXPIRY_MINUTES = 60;

async function sendResetEmail(to: string, resetUrl: string, name: string | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback: log the link
    console.log(`[RESET PASSWORD] Link for ${to}: ${resetUrl}`);
    return;
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@csecur360.com',
      to,
      subject: 'Réinitialisation de votre mot de passe — C-Secur360',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px">
          <h2 style="color:#1e293b;margin-bottom:8px">Réinitialisation du mot de passe</h2>
          <p style="color:#475569">Bonjour${name ? ` ${name}` : ''},</p>
          <p style="color:#475569">Vous avez demandé la réinitialisation de votre mot de passe C-Secur360. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valide pendant <strong>${EXPIRY_MINUTES} minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#94a3b8;font-size:13px">Si vous n'avez pas demandé cette réinitialisation, ignorez ce courriel.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="color:#cbd5e1;font-size:12px">C-Secur360 · Sécurité industrielle</p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, tenant } = await req.json();
    if (!email || !tenant) return NextResponse.json({ error: 'email et tenant requis' }, { status: 400 });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('email', String(email).toLowerCase().trim())
      .eq('tenant_id', tenant)
      .eq('is_active', true)
      .maybeSingle();

    // Always return OK to avoid user enumeration
    if (!user) return NextResponse.json({ ok: true });

    // Expire old tokens for this user
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });
    if (error) throw error;

    const origin = req.headers.get('origin') || `https://${req.headers.get('host')}`;
    const resetUrl = `${origin}/${tenant}/reset-password?token=${token}`;
    await sendResetEmail(user.email, resetUrl, user.name);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[forgot-password]', e);
    return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 500 });
  }
}
