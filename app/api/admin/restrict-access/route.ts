import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Active/lit l'« accès restreint » d'un tenant (tenants.restrict_super_admin). Réglable par un admin
// du tenant (direction/super_user) ou le propriétaire plateforme. Quand activé, un super-admin
// plateforme NON invité (et non propriétaire) n'a plus d'accès admin à ce tenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  const level = await effectiveLevelFor(acc, tenant);
  if (!canShareholders(level)) return { err: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  return { acc, tenant };
}

export async function GET(req: NextRequest) {
  const g = await guard(req, new URL(req.url).searchParams.get('tenant')); if (g.err) return g.err;
  const { data } = await supabaseAdmin.from('tenants').select('restrict_super_admin').eq('subdomain', g.tenant!).maybeSingle();
  return NextResponse.json({ restrict: !!(data as any)?.restrict_super_admin });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const { error } = await supabaseAdmin.from('tenants').update({ restrict_super_admin: !!body.restrict }).eq('subdomain', g.tenant!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, restrict: !!body.restrict });
}
