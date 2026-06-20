import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Incidents HSE — accès SERVEUR (service_role). Les incidents portent des renseignements de SANTÉ
// (partie du corps, nature de la blessure, description) → Loi 25 : la clé anon n'y accède plus
// (REVOKE, migration 258) ; tout passe ici. Garde : tier ≥ 4 (administration) ; les champs médicaux
// (body_part/injury_type) sont MASQUÉS si non-RH (minimisation). Tenant TOUJOURS résolu côté serveur.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const VIEW_TIER = 4;
const MEDICAL_FIELDS = ['body_part', 'injury_type'];

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  const level = await effectiveLevelFor(acc, tenant);
  if (tierFromLevel(level) < VIEW_TIER) return { err: NextResponse.json({ error: 'Accès refusé (niveau insuffisant)' }, { status: 403 }) };
  return { acc, tenant, level, hr: canHr(level), email: acc.email };
}

// GET ?tenant[&count=1] → liste des incidents (champs médicaux masqués si non-RH) ou seulement le nombre.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const g = await guard(req, url.searchParams.get('tenant')); if (g.err) return g.err;
  if (url.searchParams.get('count')) {
    const { count } = await supabaseAdmin.from('hse_incident').select('id', { count: 'exact', head: true }).eq('tenant_id', g.tenant!);
    return NextResponse.json({ count: count || 0 });
  }
  const { data, error } = await supabaseAdmin.from('hse_incident').select('*').eq('tenant_id', g.tenant!).order('occurred_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const items = (data || []).map((r: any) => {
    if (g.hr) return r;
    const masked = { ...r }; for (const f of MEDICAL_FIELDS) masked[f] = null; return masked;  // minimisation Loi 25
  });
  return NextResponse.json({ items });
}

// POST { tenant, incident } → crée l'incident (le trigger DB génère les échéances). Renvoie l'id.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const g = await guard(req, body?.tenant); if (g.err) return g.err;
  const i = body?.incident || {};
  const row: any = {
    tenant_id: g.tenant, project_id: i.project_id || null, occurred_at: i.occurred_at, reported_at: i.reported_at || new Date().toISOString(),
    event_code: i.event_code, severity: i.severity || null, is_lost_time: !!i.is_lost_time, is_restricted: !!i.is_restricted, lost_days: Number(i.lost_days) || 0,
    body_part: i.body_part || null, injury_type: i.injury_type || null, location_text: i.location_text || null, description: i.description || null,
    material_damage_amount: i.material_damage_amount ?? null, created_by: g.email || i.created_by || null,
  };
  let { data, error } = await supabaseAdmin.from('hse_incident').insert(row).select('id').single();
  if (error && /is_restricted/.test(error.message || '')) {   // migration 257 pas encore appliquée → repli
    delete row.is_restricted;
    ({ data, error } = await supabaseAdmin.from('hse_incident').insert(row).select('id').single());
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: (data as any).id });
}

// PATCH { tenant, id, patch } → workflow incident (statut, causes racines, clôture).
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const g = await guard(req, body?.tenant); if (g.err) return g.err;
  const id = body?.id; const patch = body?.patch || {};
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const row: any = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) { row.status = patch.status; if (patch.status === 'closed') { row.closed_at = new Date().toISOString(); row.closed_by = g.email || patch.closed_by || null; } }
  if (patch.root_cause !== undefined) row.root_cause = patch.root_cause;
  if (patch.contributing_factors !== undefined) row.contributing_factors = patch.contributing_factors;
  const { error } = await supabaseAdmin.from('hse_incident').update(row).eq('id', id).eq('tenant_id', g.tenant!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
