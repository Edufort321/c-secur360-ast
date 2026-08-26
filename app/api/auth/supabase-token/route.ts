import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { mintSupabaseToken } from '@/lib/supabaseToken';

// Renvoie au navigateur un JWT Supabase court (tenant_id + app_role) pour la session courante.
// Consomme par le client navigateur (lib/supabase.ts, option accessToken) pour que le RLS
// enforce l'isolation tenant. Sans session valide -> pas de jeton -> le client reste anon.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ token: null }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const { token, exp } = await mintSupabaseToken({
      userId: user.id,
      tenantId: user.tenant_id ?? null,
      role: user.role ?? 'user',
    });
    return NextResponse.json({ token, exp }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    // Secret absent / mauvaise config -> on echoue visiblement cote serveur, jeton null cote client.
    return NextResponse.json({ token: null, error: e?.message ?? 'mint_failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
