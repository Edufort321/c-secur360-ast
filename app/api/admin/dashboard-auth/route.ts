import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminDashboardToken } from '@/lib/apiAuth';

// Securite (#7) : verification du mot de passe du dashboard super-admin COTE SERVEUR.
// Le mot de passe n'est plus dans le bundle navigateur. Fail-closed : si ADMIN_DASHBOARD_PASSWORD
// n'est pas configure (Vercel + .env.local), l'acces est refuse (pas de fallback en dur).
// Sur succes : pose un cookie httpOnly (jeton derive du mot de passe) que les routes admin verifient.
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let password = '';
  try { ({ password } = await req.json()); } catch { /* corps invalide */ }
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'ADMIN_DASHBOARD_PASSWORD non configure cote serveur.' }, { status: 500 });
  }
  if (password && password === expected) {
    const res = NextResponse.json({ ok: true });
    const tok = adminDashboardToken();
    if (tok) res.cookies.set(ADMIN_COOKIE, tok, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
    return res;
  }
  return NextResponse.json({ ok: false, error: 'Mot de passe incorrect.' }, { status: 401 });
}

// Deconnexion : efface le cookie admin.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
