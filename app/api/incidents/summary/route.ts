import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Lecture SERVEUR des incidents/quasi-accidents (les tables sont fermées à l'anon par la sécurité
// RLS). Scopé au tenant de la PAGE via effectiveTenant : super_admin cible le tenant visité, tout autre
// rôle est forcé à son propre tenant (anti-fuite ET anti-contamination cross-tenant).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const url = new URL(req.url);
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  const kind = url.searchParams.get('kind') || 'all';

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
