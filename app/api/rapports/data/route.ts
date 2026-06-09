import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Persistance SERVEUR du module Rapports terrain (rapports + gabarits custom). Auth requise ;
// toutes les requêtes scopées au tenant de la SESSION (jamais un paramètre client) — anti-fuite.
// Les tables sont fermées à l'anon (migration 149) : accès uniquement via cette route (service role).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TABLE = (kind: string) => (kind === 'templates' ? 'rapport_templates' : 'rapports');

// GET ?kind=reports|templates -> liste (non supprimés) du tenant de session.
export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const kind = new URL(req.url).searchParams.get('kind') || 'reports';
  const { data, error } = await supabaseAdmin.from(TABLE(kind)).select('*').eq('tenant_id', tenant).eq('deleted', false).order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, items: data || [] });
}

// POST { kind, item } -> upsert (tenant forcé à la session). `item` = doc complet { id, ... }.
export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const kind = body.kind === 'templates' ? 'templates' : 'reports';
  const item = body.item || {};
  if (!item.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const row: any = (kind === 'templates')
    ? { id: item.id, tenant_id: tenant, name: item.name || '', num: item.num || null, blocks: item.blocks || [], deleted: false, updated_at: new Date().toISOString() }
    : { id: item.id, tenant_id: tenant, title: item.title || '', status: item.status || 'in_progress', template: item.template || null, num: item.num || null, data: item, author_email: item.author_email || u.email || null, version: item.version || 1, deleted: false, updated_at: new Date().toISOString() };

  const { error } = await supabaseAdmin.from(TABLE(kind)).upsert(row, { onConflict: 'id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE ?kind=&id= -> soft-delete (scopé au tenant de session).
export async function DELETE(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const sp = new URL(req.url).searchParams;
  const kind = sp.get('kind') === 'templates' ? 'templates' : 'reports';
  const id = sp.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from(TABLE(kind)).update({ deleted: true, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
