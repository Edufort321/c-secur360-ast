// =====================================================
// Utilisateur courant cote NAVIGATEUR, source unique : /api/auth/me (cookie httpOnly auth_token).
// Remplace les anciens appels supabase.auth.getUser()/getSession() (Supabase Auth n'est pas
// utilise ; et avec l'option accessToken de lib/supabase.ts, le namespace supabase.auth throw).
// Resultat mis en cache en memoire pour eviter les appels repetes.
// =====================================================

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  tenantId: string | null;
  siteId: string | null;
  firstLogin: boolean;
}

let cache: CurrentUser | null | undefined; // undefined = pas encore charge ; null = non connecte
let inflight: Promise<CurrentUser | null> | null = null;

/** Renvoie l'utilisateur courant (ou null si non connecte). Mis en cache apres le 1er appel. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (cache !== undefined) return cache;
  if (!inflight) {
    inflight = (async (): Promise<CurrentUser | null> => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) { cache = null; return null; }
        const { user } = await res.json();
        const u: CurrentUser | null = user ?? null;
        cache = u;
        return u;
      } catch {
        cache = null; return null;
      } finally {
        inflight = null;
      }
    })();
  }
  return inflight;
}

/** Vide le cache (a appeler apres login/logout). */
export function resetCurrentUser(): void {
  cache = undefined;
  inflight = null;
}
