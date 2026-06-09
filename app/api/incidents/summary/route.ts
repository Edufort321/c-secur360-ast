import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Lecture SERVEUR des incidents/quasi-accidents (les tables sont fermées à l'anon par la sécurité
// RLS). Scopé au tenant de SESSION — jamais un paramètre client (anti-fuite). Alimente les widgets
// de tableau de bord (anomalies, manager, page modules) sans exposer la clé anon.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const kind = new URL(req.url).searchParams.get('kind') || 'all';

  const out: any = { ok: true };

  if (kind === 'incidents' || kind === 'all') {
    const { data } = await supabaseAdmin.from('incident_reports')
      .select('id, incident_type, status, data, created_at')
      .eq('tenant_id', tenant).order('created_at', { ascending: false });
    out.incidents = data || [];
  }
  if (kind === 'nearmiss' || kind === 'all') {
    const { data } = await supabaseAdmin.from('near_miss_events')
      .select('*').eq('tenant_id', tenant).order('incident_date', { ascending: false });
    out.nearMiss = data || [];
  }
  return NextResponse.json(out);
}
