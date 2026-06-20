import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Pièces jointes HSE — accès SERVEUR (service_role) au bucket PRIVÉ 'hse-documents'. Garde de niveau :
// tier ≥ 4 (administration) pour voir/gérer ; les pièces `sensitive` (santé, Loi 25) exigent canHr (RH).
// Tenant TOUJOURS celui résolu côté serveur (jamais un paramètre client) → zéro fuite inter-tenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const BUCKET = 'hse-documents';
const VIEW_TIER = 4;

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  const level = await effectiveLevelFor(acc, tenant);
  if (tierFromLevel(level) < VIEW_TIER) return { err: NextResponse.json({ error: 'Accès refusé (niveau insuffisant)' }, { status: 403 }) };
  return { acc, tenant, level, hr: canHr(level), email: acc.email };
}

// GET ?entityType&entityId&tenant → liste + URLs signées (masque les pièces sensibles si non-RH).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const g = await guard(req, url.searchParams.get('tenant')); if (g.err) return g.err;
  const entityType = url.searchParams.get('entityType');
  const entityId = url.searchParams.get('entityId');
  if (!entityType || !entityId) return NextResponse.json({ error: 'entityType/entityId requis' }, { status: 400 });
  let q = supabaseAdmin.from('hse_attachment').select('*').eq('tenant_id', g.tenant!).eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false });
  if (!g.hr) q = q.eq('sensitive', false);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const items = await Promise.all((data || []).map(async (a: any) => {
    let url2 = a.file_url as string | null;
    if (!url2 && a.storage_path) { const s = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(a.storage_path, 3600); url2 = s.data?.signedUrl || null; }
    return { ...a, url: url2 };
  }));
  return NextResponse.json({ items });
}

// POST multipart (téléversement) : champs tenant, entityType, entityId, sensitive, file.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const reqTenant = String(form.get('tenant') || '');
  const g = await guard(req, reqTenant); if (g.err) return g.err;
  const entityType = String(form.get('entityType') || ''); const entityId = String(form.get('entityId') || '');
  const sensitive = String(form.get('sensitive') || '') === 'true';
  const file = form.get('file') as File | null;
  if (!entityType || !entityId || !file) return NextResponse.json({ error: 'entityType/entityId/file requis' }, { status: 400 });
  if (sensitive && !g.hr) return NextResponse.json({ error: 'Pièce sensible : niveau RH requis' }, { status: 403 });
  const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-120);
  const path = `${g.tenant}/${entityType}/${entityId}/${Date.now()}-${safe}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
  const { error } = await supabaseAdmin.from('hse_attachment').insert({
    tenant_id: g.tenant, entity_type: entityType, entity_id: entityId, file_name: file.name,
    storage_path: path, source_module: 'upload', mime_type: file.type || null, file_size: buf.length,
    sensitive, uploaded_by: g.email || null,
  });
  if (error) { await supabaseAdmin.storage.from(BUCKET).remove([path]); return NextResponse.json({ error: error.message }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}

// DELETE ?id&tenant → supprime la ligne + l'objet Storage (sensible → RH requis).
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const g = await guard(req, url.searchParams.get('tenant')); if (g.err) return g.err;
  const id = url.searchParams.get('id'); if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { data: row } = await supabaseAdmin.from('hse_attachment').select('*').eq('id', id).eq('tenant_id', g.tenant!).maybeSingle();
  if (!row) return NextResponse.json({ ok: true });
  if ((row as any).sensitive && !g.hr) return NextResponse.json({ error: 'Pièce sensible : niveau RH requis' }, { status: 403 });
  if ((row as any).storage_path) await supabaseAdmin.storage.from(BUCKET).remove([(row as any).storage_path]);
  await supabaseAdmin.from('hse_attachment').delete().eq('id', id).eq('tenant_id', g.tenant!);
  return NextResponse.json({ ok: true });
}
