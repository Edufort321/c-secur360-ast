import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Lecture SERVEUR de work_permits (RLS activée sans policy anon -> lecture client = 401). Scopée au
// tenant de SESSION. Renvoie le MÊME shape que la requête client (permit_number, type, data, updated_at).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const { data } = await supabaseAdmin.from('work_permits')
    .select('permit_number, type, data, updated_at').eq('tenant_id', tenant);
  return NextResponse.json({ ok: true, rows: data || [] });
}
