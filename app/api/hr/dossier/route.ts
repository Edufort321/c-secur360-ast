import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Accès SERVEUR aux dossiers RH (service role + vérification de niveau + tenant de SESSION).
// Remplace les lectures/écritures directes du navigateur (clé anon) sur les tables sensibles
// hr_documents / hr_certifications / hr_onboarding + la fiche salariale (planner_personnel).
// ZÉRO FUITE : toutes les requêtes sont scopées au tenant de la session, jamais à un paramètre client.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TABLES = new Set(['hr_documents', 'hr_certifications', 'hr_onboarding']);

async function guard(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (!canHr(acc.level)) return { err: NextResponse.json({ error: 'Accès refusé (niveau insuffisant)' }, { status: 403 }) };
  if (!acc.tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  return { acc };
}

// GET ?list=1  -> liste du personnel (avec salaire) ; ?personnelId=X -> dossier ; ?general=1 -> docs généraux
export async function GET(req: NextRequest) {
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  const url = new URL(req.url);

  if (url.searchParams.get('list')) {
    const { data } = await supabaseAdmin.from('planner_personnel')
      .select('id, name, email, role, succursale, niveauAcces, hire_date, current_salary, last_evaluation_date, next_evaluation_date')
      .eq('tenant_id', tenant).order('name');
    return NextResponse.json({ ok: true, personnel: (data || []).filter((p: any) => p.name) });
  }
  if (url.searchParams.get('general')) {
    const { data } = await supabaseAdmin.from('hr_documents').select('*').eq('tenant_id', tenant).is('personnel_id', null).order('created_at', { ascending: false });
    return NextResponse.json({ ok: true, documents: data || [] });
  }
  if (url.searchParams.get('incidents')) {
    const { data } = await supabaseAdmin.from('incident_reports')
      .select('id, report_number, incident_type, status, created_at')
      .eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(12);
    return NextResponse.json({ ok: true, incidents: data || [] });
  }
  const pid = url.searchParams.get('personnelId');
  if (pid) {
    const [d, c, o] = await Promise.all([
      supabaseAdmin.from('hr_documents').select('*').eq('tenant_id', tenant).eq('personnel_id', pid).order('created_at'),
      supabaseAdmin.from('hr_certifications').select('*').eq('tenant_id', tenant).eq('personnel_id', pid).order('expiry_date'),
      supabaseAdmin.from('hr_onboarding').select('*').eq('tenant_id', tenant).eq('personnel_id', pid).order('sort_order'),
    ]);
    return NextResponse.json({ ok: true, documents: d.data || [], certifications: c.data || [], onboarding: o.data || [] });
  }
  return NextResponse.json({ error: 'Paramètre requis' }, { status: 400 });
}

// POST { table, row } -> insert (tenant_id forcé à la session)
export async function POST(req: NextRequest) {
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  if (!TABLES.has(body.table)) return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  const row = { ...(body.row || {}), tenant_id: tenant }; // tenant forcé (anti-usurpation)
  delete row.id;
  const { data, error } = await supabaseAdmin.from(body.table).insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, row: data });
}

// PATCH { table, id, patch } -> update (scoping tenant)
export async function PATCH(req: NextRequest) {
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  if (!TABLES.has(body.table) || !body.id) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  const patch = { ...(body.patch || {}) }; delete patch.id; delete patch.tenant_id;
  const { error } = await supabaseAdmin.from(body.table).update(patch).eq('id', body.id).eq('tenant_id', tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE ?table=&id= -> delete (scoping tenant)
export async function DELETE(req: NextRequest) {
  const g = await guard(req); if (g.err) return g.err;
  const tenant = g.acc!.tenant;
  const url = new URL(req.url);
  const table = url.searchParams.get('table') || '';
  const id = url.searchParams.get('id') || '';
  if (!TABLES.has(table) || !id) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id).eq('tenant_id', tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
