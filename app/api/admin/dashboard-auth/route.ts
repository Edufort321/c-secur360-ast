import { NextRequest, NextResponse } from 'next/server';

// Securite (#7) : verification du mot de passe du dashboard super-admin COTE SERVEUR.
// Le mot de passe n'est plus dans le bundle navigateur. Fail-closed : si ADMIN_DASHBOARD_PASSWORD
// n'est pas configure (Vercel + .env.local), l'acces est refuse (pas de fallback en dur).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let password = '';
  try { ({ password } = await req.json()); } catch { /* corps invalide */ }
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'ADMIN_DASHBOARD_PASSWORD non configure cote serveur.' }, { status: 500 });
  }
  if (password && password === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: 'Mot de passe incorrect.' }, { status: 401 });
}
