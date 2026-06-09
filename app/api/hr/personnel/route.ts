import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, canAuth } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Accès SERVEUR aux champs SENSIBLES de planner_personnel : mots de passe d'accès (canAuth) et
// salaire/évaluation (canHr). Service role + tenant de SESSION (anti-fuite inter-tenant). Empêche
// la lecture/écriture directe via la clé anon (fermées par migration 147).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET ?access=1 -> liste pour la gestion des accès (id, name, email, niveau, access_password).
export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAuth(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  if (new URL(req.url).searchParams.get('access')) {
    const r1 = await supabaseAdmin.from('planner_personnel').select('id, name, email, niveauAcces, access_password').eq('tenant_id', acc.tenant).order('name');
    let data: any = r1.data;
    if (r1.error) { const r2 = await supabaseAdmin.from('planner_personnel').select('id, name, email, niveauAcces').eq('tenant_id', acc.tenant).order('name'); data = r2.data; }
    return NextResponse.json({ ok: true, personnel: data || [] });
  }
  return NextResponse.json({ error: 'Paramètre requis' }, { status: 400 });
}

// PATCH { kind:'access', id|email_match, password?, email? }  (canAuth)
// PATCH { kind:'eval', id, payload }                          (canHr)
export async function PATCH(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  if (body.kind === 'access') {
    if (!canAuth(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    const patch: any = {};
    if (typeof body.password === 'string') patch.access_password = body.password;
    if (typeof body.email === 'string' && body.email) patch.email = body.email;
    if (!Object.keys(patch).length) return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 });
    let q: any = supabaseAdmin.from('planner_personnel').update(patch).eq('tenant_id', acc.tenant);
    if (body.id) q = q.eq('id', body.id);
    else if (body.email_match) q = q.ilike('email', body.email_match);
    else return NextResponse.json({ error: 'Cible requise' }, { status: 400 });
    const { error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.kind === 'eval') {
    if (!canHr(acc.level)) return NextResponse.json({ error: 'Accès refusé (salaires)' }, { status: 403 });
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const payload: any = { ...(body.payload || {}) }; delete payload.tenant_id; delete payload.id;
    let { error } = await supabaseAdmin.from('planner_personnel').update(payload).eq('id', body.id).eq('tenant_id', acc.tenant);
    if (error && /skill_scores|objectives/i.test(error.message || '')) {
      const { skill_scores, objectives, ...fb } = payload; // migrations 075-076 non exécutées
      ({ error } = await supabaseAdmin.from('planner_personnel').update(fb).eq('id', body.id).eq('tenant_id', acc.tenant));
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // Mise à jour de PROFIL (nom, rôle, niveauAcces…) — canAuth (niveauAcces = privilège).
  if (body.kind === 'profile') {
    if (!canAuth(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const patch: any = { ...(body.patch || {}) }; delete patch.id; delete patch.tenant_id;
    delete patch.access_password; delete patch.current_salary; // champs ultra-sensibles via leurs kinds dédiés
    let { data, error } = await supabaseAdmin.from('planner_personnel').update(patch).eq('id', body.id).eq('tenant_id', acc.tenant).select();
    if (error && /next_evaluation_date/i.test(error.message || '')) { const { next_evaluation_date, ...b2 } = patch; ({ data, error } = await supabaseAdmin.from('planner_personnel').update(b2).eq('id', body.id).eq('tenant_id', acc.tenant).select()); }
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, row: (data || [])[0] || null });
  }

  return NextResponse.json({ error: 'kind invalide' }, { status: 400 });
}

// POST { row } -> crée un employé (canAuth ; tenant forcé à la session).
export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAuth(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const row: any = { ...(body.row || {}), tenant_id: acc.tenant };
  delete row.id; delete row.access_password; delete row.current_salary; // via kinds dédiés
  let { data, error } = await supabaseAdmin.from('planner_personnel').insert(row).select();
  if (error && /next_evaluation_date/i.test(error.message || '')) { const { next_evaluation_date, ...b2 } = row; ({ data, error } = await supabaseAdmin.from('planner_personnel').insert(b2).select()); }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, row: (data || [])[0] || null });
}

// DELETE ?id= -> supprime un employé (canAuth ; tenant de session).
export async function DELETE(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canAuth(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('planner_personnel').delete().eq('id', id).eq('tenant_id', acc.tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
