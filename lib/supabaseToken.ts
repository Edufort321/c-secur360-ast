// =====================================================
// Signature d'un JWT compatible Supabase (HS256, secret projet) portant l'identite
// du tenant. SERVER-ONLY — ne jamais importer cote navigateur (expose SUPABASE_JWT_SECRET).
//
// Pourquoi : le RLS Supabase enforce l'isolation via `auth.jwt() ->> 'tenant_id'`. Le client
// navigateur (cle anon) n'a AUCUN claim -> toute requete anon retombe a NULL et ne voit rien.
// A la connexion, le serveur signe ce jeton court (10 min) et le navigateur l'attache a chaque
// requete PostgREST (voir lib/supabase.ts + app/api/auth/supabase-token). Le filtrage cote
// client (.eq('tenant_id', ...)) devient redondant : la vraie barriere est desormais le RLS.
//
// Claims :
//   role     = 'authenticated'  -> role Postgres utilise par PostgREST (DOIT etre reel)
//   app_role = users.role       -> claim applicatif (super_admin bypass dans les policies)
//   tenant_id                   -> claim applicatif compare a <table>.tenant_id dans le RLS
// =====================================================
import { SignJWT } from 'jose';

const TTL_SECONDS = 10 * 60; // jeton court ; le navigateur le rafraichit avant expiration

export interface TenantTokenClaims {
  userId: string;
  tenantId: string | null;
  role: string; // users.role (super_admin, client_admin, ...)
}

/** Signe un JWT Supabase pour l'utilisateur/tenant courant. Throw si le secret est absent. */
export async function mintSupabaseToken({ userId, tenantId, role }: TenantTokenClaims): Promise<{ token: string; exp: number }> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET manquant — impossible de signer le jeton tenant (Supabase Dashboard → Settings → API → JWT Secret).');
  }
  const key = new TextEncoder().encode(secret);
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TTL_SECONDS;

  const token = await new SignJWT({
    role: 'authenticated',        // role Postgres (PostgREST) — obligatoire et reel
    app_role: role,               // role applicatif — utilise par les policies (super_admin)
    tenant_id: tenantId ?? '',    // isolation tenant — compare dans le RLS
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setAudience('authenticated')
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);

  return { token, exp };
}
