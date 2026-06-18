import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Persistance SERVEUR du module Rapports terrain (rapports + gabarits custom). Auth requise ;
// toutes les requêtes scopées au tenant de la SESSION (jamais un paramètre client) — anti-fuite.
// Les tables sont fermées à l'anon (migration 149) : accès uniquement via cette route (service role).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TABLE = (kind: string) => (kind === 'templates' ? 'rapport_templates' : 'rapports');

// Tenant effectif d'une requête : un super_admin peut consulter le tenant DEMANDÉ (celui de
// l'URL qu'il visite) ; tout autre rôle est verrouillé sur le tenant de sa SESSION — toute
// demande d'un autre tenant est refusée (403). Anti-fuite inter-tenant.
function resolveTenant(u: any, requested: string | null): { tenant: string } | { error: NextResponse } {
  const sessionTenant = u.tenant_id || '';
  const req = (requested || '').trim();
  if (u.role === 'super_admin') return { tenant: req || sessionTenant };
  if (req && req !== sessionTenant) return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  return { tenant: sessionTenant };
}

// GET ?kind=reports|templates&tenant= -> liste (non supprimés) du tenant effectif.
export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const rt = resolveTenant(u, new URL(req.url).searchParams.get('tenant'));
  if ('error' in rt) return rt.error;
  const tenant = rt.tenant;
  const sp = new URL(req.url).searchParams;
  const kind = sp.get('kind') || 'reports';
  const docType = sp.get('docType') || 'rapport';
  const { data, error } = await supabaseAdmin.from(TABLE(kind)).select('*').eq('tenant_id', tenant).eq('deleted', false).order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Filtre doc_type en JS (résilient si la colonne 229 n'est pas encore appliquée → traité comme 'rapport').
  const items = (data || []).filter((r: any) => (r.doc_type || 'rapport') === docType);
  return NextResponse.json({ ok: true, items });
}

// POST { kind, item } -> upsert (tenant forcé à la session). `item` = doc complet { id, ... }.
export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const rt = resolveTenant(u, body.tenant);
  if ('error' in rt) return rt.error;
  const tenant = rt.tenant;
  const kind = body.kind === 'templates' ? 'templates' : 'reports';
  const item = body.item || {};
  if (!item.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const docType = body.docType === 'maintenance' ? 'maintenance' : 'rapport';
  const row: any = (kind === 'templates')
    ? { id: item.id, tenant_id: tenant, name: item.name || '', num: item.num || null, blocks: item.blocks || [], doc_type: docType, deleted: false, updated_at: new Date().toISOString() }
    : { id: item.id, tenant_id: tenant, title: item.title || '', status: item.status || 'in_progress', template: item.template || null, num: item.num || null, data: item, author_email: item.author_email || u.email || null, version: item.version || 1, project_id: (item.link && item.link.projectId) || null, planner_job_id: (item.link && item.link.jobId) || null, doc_type: docType, deleted: false, updated_at: new Date().toISOString() };

  let { error } = await supabaseAdmin.from(TABLE(kind)).upsert(row, { onConflict: 'id' });
  if (error && /doc_type/.test(error.message || '')) {
    // Colonne 229 pas encore appliquée → réessai sans doc_type (zéro régression pour les rapports).
    const { doc_type, ...legacy } = row;
    ({ error } = await supabaseAdmin.from(TABLE(kind)).upsert(legacy, { onConflict: 'id' }));
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE ?kind=&id= -> soft-delete (scopé au tenant de session).
export async function DELETE(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const rt = resolveTenant(u, sp.get('tenant'));
  if ('error' in rt) return rt.error;
  const tenant = rt.tenant;
  const kind = sp.get('kind') === 'templates' ? 'templates' : 'reports';
  const id = sp.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from(TABLE(kind)).update({ deleted: true, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
