// Garde des routes IA tenant : authentification OBLIGATOIRE + quota par utilisateur.
// Accepte un Bearer Supabase (Authorization) OU le cookie de session maison (auth_token).
// Anonyme = refusé. Rate-limit par userId (pas par IP) selon le tier de coût.
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionUser } from '@/lib/apiAuth';

type Tier = 'text';
const LIMITS: Record<Tier, number> = { text: 20 }; // requêtes / minute / utilisateur

const RATE: Map<string, { count: number; reset: number }> = (globalThis as any).__aiRate || new Map();
(globalThis as any).__aiRate = RATE;

async function resolveUser(req: NextRequest): Promise<{ id: string; email?: string } | null> {
  // 1) Bearer Supabase (token d'accès de la session client)
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token) {
      try {
        const { data } = await supabaseAdmin.auth.getUser(token);
        if (data?.user) return { id: data.user.id, email: data.user.email || undefined };
      } catch { /* token invalide -> on tente le cookie */ }
    }
  }
  // 2) Cookie de session maison (auth_token -> auth_sessions -> users)
  const u = await getSessionUser(req);
  if (u?.id) return { id: u.id, email: u.email };
  return null;
}

export async function requireAIUser(
  req: NextRequest, tier: Tier = 'text'
): Promise<{ ok: true; user: { id: string; email?: string } } | { ok: false; res: NextResponse }> {
  const user = await resolveUser(req);
  if (!user) return { ok: false, res: NextResponse.json({ error: 'Authentification requise.' }, { status: 401 }) };

  const limit = LIMITS[tier] || 20;
  const now = Date.now();
  const key = `${tier}:${user.id}`;
  const e = RATE.get(key);
  if (!e || now > e.reset) {
    RATE.set(key, { count: 1, reset: now + 60_000 });
  } else {
    if (e.count >= limit) return { ok: false, res: NextResponse.json({ error: 'Quota atteint, réessayez dans une minute.' }, { status: 429 }) };
    e.count++;
  }
  return { ok: true, user };
}
