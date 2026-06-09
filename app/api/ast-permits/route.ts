import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Lecture SERVEUR de ast_permits (RLS activée sans policy anon -> lecture client = 401). Scopée au
// tenant de SESSION. Renvoie le MÊME shape que la requête client d'origine (data + created_at)
// pour les graphiques du tableau de bord — aucune transformation.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const { data } = await supabaseAdmin.from('ast_permits')
    .select('id, data, status, created_at').eq('tenant_id', tenant).order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, rows: data || [] });
}
