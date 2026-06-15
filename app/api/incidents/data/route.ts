import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// CRUD SERVEUR du module Accidents/Incidents (tables fermées à l'anon par la sécurité RLS).
// Tout est scopé au tenant de SESSION (jamais un paramètre client) — anti-fuite.
//  - GET             -> { reports: incident_reports[], counter: incident_day_counters|null }
//  - POST {action:'save', item}  -> insert/update d'un rapport (tenant forcé) ; renvoie { id }
//  - POST {action:'reset', incidentType} -> remet à zéro le compteur de jours (accident|near_miss)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const [{ data: reports }, { data: counter }] = await Promise.all([
    supabaseAdmin.from('incident_reports').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }),
    supabaseAdmin.from('incident_day_counters').select('*').eq('tenant_id', tenant).maybeSingle(),
  ]);
  return NextResponse.json({ ok: true, reports: reports || [], counter: counter || null });
}

async function resetCounter(tenant: string, incidentType: string) {
  const field = incidentType === 'near_miss' ? 'last_near_miss_date' : 'last_accident_date';
  const recordField = incidentType === 'near_miss' ? 'near_miss_record_days' : 'accident_record_days';
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabaseAdmin.from('incident_day_counters').select('*').eq('tenant_id', tenant).maybeSingle();
  if (existing) {
    const lastDate: string | null = (existing as any)[field];
    const prevRecord: number = (existing as any)[recordField] ?? 0;
    const daysSince = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 0;
    await supabaseAdmin.from('incident_day_counters').update({ [field]: today, [recordField]: Math.max(prevRecord, daysSince), updated_at: new Date().toISOString() }).eq('tenant_id', tenant);
  } else {
    await supabaseAdmin.from('incident_day_counters').insert({ tenant_id: tenant, [field]: today, [recordField]: 0, updated_at: new Date().toISOString() });
  }
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  if (body.action === 'reset') {
    const t = body.incidentType === 'near_miss' ? 'near_miss' : 'accident';
    await resetCounter(tenant, t);
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'save') {
    const it = body.item || {};
    const now = new Date().toISOString();
    // Champs autorisés uniquement ; tenant FORCÉ à la session (anti-IDOR).
    const payload: any = {
      tenant_id: tenant,
      incident_type: it.incident_type ?? null,
      province: it.province ?? null,
      status: it.status || 'draft',
      site_id: it.site_id ?? null, // rattachement au site (filtre par site)
      ast_permit_number: it.ast_permit_number ?? null, // interconnexion Accidents↔AST
      personnel_id: it.personnel_id ?? null, // interconnexion Accidents↔Personnel
      data: it.data ?? {},
      updated_at: now,
    };
    if (it.submitted_at) payload.submitted_at = it.submitted_at;
    if (it.id) {
      const { error } = await supabaseAdmin.from('incident_reports').update(payload).eq('id', it.id).eq('tenant_id', tenant);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id: it.id });
    }
    const { data: row, error } = await supabaseAdmin.from('incident_reports').insert({ ...payload, created_at: now }).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: row?.id });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
