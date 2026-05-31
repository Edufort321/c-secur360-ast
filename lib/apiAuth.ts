// Garde d'authentification serveur pour les routes API admin (securite #1-4, #7).
// Acces autorise si l'UNE des conditions : (a) cookie httpOnly du dashboard super-admin,
// (b) session utilisateur de role super_admin, (c) secret de synchronisation serveur-a-serveur.
// Tout est FAIL-SECURE : aucun secret en dur, refus par defaut.
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const ADMIN_COOKIE = 'csecur_admin';

/** Jeton du dashboard super-admin dérivé du mot de passe serveur (non forgeable côté client). */
export function adminDashboardToken(): string | null {
  const pwd = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!pwd) return null;
  return crypto.createHash('sha256').update('csecur-admin:' + pwd).digest('hex');
}

function hasAdminCookie(req: NextRequest): boolean {
  const tok = adminDashboardToken();
  return !!tok && req.cookies.get(ADMIN_COOKIE)?.value === tok;
}

/** Secret de synchronisation serveur-à-serveur (fail-secure : aucun fallback en dur). */
export function checkSyncSecret(req: NextRequest): boolean {
  const secret = process.env.CSECUR360_SYNC_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/** Utilisateur de session (cookie auth_token → auth_sessions → users), ou null. */
export async function getSessionUser(req: NextRequest): Promise<any | null> {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { data } = await supabaseAdmin.from('auth_sessions')
      .select('expires_at, users!inner(id, email, role, tenant_id)')
      .eq('token', token).gt('expires_at', new Date().toISOString()).single();
    return (data as any)?.users || null;
  } catch { return null; }
}

/** Garde admin : cookie dashboard OU session super_admin OU secret de sync. */
export async function requireAdmin(req: NextRequest): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  if (hasAdminCookie(req) || checkSyncSecret(req)) return { ok: true };
  const user = await getSessionUser(req);
  if (user?.role === 'super_admin') return { ok: true };
  return { ok: false, res: NextResponse.json({ error: 'Accès refusé' }, { status: user ? 403 : 401 }) };
}
