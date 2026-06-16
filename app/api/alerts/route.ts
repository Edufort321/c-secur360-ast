import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Règles d'alerte (seuils financiers). Configuration réservée direction/super_user. Service_role +
// effectiveTenant (super_admin = tenant de la page).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const METRICS = new Set(['cash_below', 'margin_pct_below', 'ar_overdue_above', 'ebitda_below', 'altman_below']);
const CHANNELS = new Set(['in_app', 'email', 'sms']);

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
  const { data } = await supabaseAdmin.from('alert_rules').select('*').eq('tenant_id', g.tenant!).order('created_at');
  return NextResponse.json({ rules: data || [] });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const tenant = g.tenant!; const r = body.rule || {};
  if (!METRICS.has(r.metric)) return NextResponse.json({ error: 'Métrique invalide' }, { status: 400 });
  const channels = (Array.isArray(r.channels) ? r.channels : ['in_app']).filter((c: string) => CHANNELS.has(c));
  if (!channels.length) channels.push('in_app');
  const row: any = {
    tenant_id: tenant, metric: r.metric, threshold: Number(r.threshold) || 0, channels,
    recipient_email: r.recipient_email || null, recipient_phone: r.recipient_phone || null,
    enabled: r.enabled !== false,
  };
  if (r.id) { const { error } = await supabaseAdmin.from('alert_rules').update(row).eq('id', r.id).eq('tenant_id', tenant); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true, id: r.id }); }
  const { data, error } = await supabaseAdmin.from('alert_rules').insert(row).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: (data as any).id });
}

export async function DELETE(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('alert_rules').delete().eq('id', body.id).eq('tenant_id', g.tenant!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
