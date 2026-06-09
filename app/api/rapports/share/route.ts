import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Partage d'un rapport à un VÉRIFICATEUR externe (lecture/révision) via lien tokenisé.
//  - POST   (auth)   : crée un lien { reportId, mode, expiresInDays } -> { token, url }
//  - GET ?token=     : PUBLIC — résout le lien (rapport en lecture seule + commentaires)
//  - GET ?reportId=  : (auth) — liste des liens + commentaires pour le propriétaire
//  - PUT ?token=     : PUBLIC — ajoute un commentaire de révision (mode 'review' uniquement)
//  - DELETE ?token=  : (auth) — révoque un lien
// Sécurité : le token ne donne accès QU'au rapport ciblé ; jamais d'accès tenant. Tables fermées
// à l'anon (migration 151) — accès uniquement via cette route (service role).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function newToken() {
  // 2 UUID concaténés (sans tirets) -> 64 caractères hex, forte entropie.
  const u = () => (globalThis.crypto?.randomUUID?.() || '').replace(/-/g, '');
  return (u() + u()).slice(0, 48) || Math.random().toString(36).slice(2);
}
function shareUrl(req: NextRequest, token: string) {
  const origin = req.headers.get('origin') || new URL(req.url).origin;
  return `${origin}/rapports/s/${token}`;
}
function isExpired(s: any) {
  if (s.revoked) return true;
  const now = Date.now();
  if (s.starts_at && new Date(s.starts_at).getTime() > now) return true;   // fenêtre pas encore ouverte
  if (s.expires_at && new Date(s.expires_at).getTime() < now) return true; // fenêtre terminée
  return false;
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const reportId = String(body.reportId || '');
  const mode = ['review', 'edit'].includes(body.mode) ? body.mode : 'view';
  if (!reportId) return NextResponse.json({ error: 'reportId requis' }, { status: 400 });
  // Le rapport DOIT appartenir au tenant de la session (anti-IDOR).
  const { data: rep } = await supabaseAdmin.from('rapports').select('id, tenant_id').eq('id', reportId).eq('tenant_id', tenant).maybeSingle();
  if (!rep) return NextResponse.json({ error: 'Rapport introuvable' }, { status: 404 });
  const token = newToken();
  // Fenêtre d'autorisation : startsAt/endsAt (ISO) prioritaires, sinon expiresInDays.
  const starts_at = body.startsAt ? new Date(body.startsAt).toISOString() : null;
  const expires_at = body.endsAt ? new Date(body.endsAt).toISOString()
    : (body.expiresInDays ? new Date(Date.now() + Number(body.expiresInDays) * 86400000).toISOString() : null);
  const { error } = await supabaseAdmin.from('rapport_shares').insert({ token, report_id: reportId, tenant_id: tenant, mode, created_by: u.email || null, starts_at, expires_at });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, token, mode, url: shareUrl(req, token) });
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const token = sp.get('token');
  // --- PUBLIC : résolution par token ---
  if (token) {
    const { data: share } = await supabaseAdmin.from('rapport_shares').select('*').eq('token', token).maybeSingle();
    if (!share || isExpired(share)) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
    const { data: rep } = await supabaseAdmin.from('rapports').select('id, title, status, num, data, deleted, tenant_id').eq('id', share.report_id).maybeSingle();
    if (!rep || rep.deleted) return NextResponse.json({ error: 'Rapport indisponible' }, { status: 404 });
    const { data: reviews } = await supabaseAdmin.from('rapport_reviews').select('id, author, comment, block_ref, created_at').eq('report_id', share.report_id).order('created_at', { ascending: true });
    // Logo du tenant (pour un rendu fidèle), sans exposer d'autres données du tenant.
    let logo: string | null = null;
    try { const { data: cs } = await supabaseAdmin.from('company_settings').select('logo_url').eq('tenant_id', rep.tenant_id).maybeSingle(); logo = cs?.logo_url || null; } catch { /* ignore */ }
    return NextResponse.json({ ok: true, mode: share.mode, canEdit: share.mode === 'edit', report: { id: rep.id, title: rep.title, status: rep.status, num: rep.num, data: rep.data || {} }, logo, reviews: reviews || [], window: { startsAt: share.starts_at, endsAt: share.expires_at } });
  }
  // --- AUTH : liste des liens + commentaires d'un rapport (propriétaire) ---
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const reportId = sp.get('reportId') || '';
  if (!reportId) return NextResponse.json({ error: 'reportId requis' }, { status: 400 });
  const tenant = u.tenant_id || '';
  const { data: shares } = await supabaseAdmin.from('rapport_shares').select('token, mode, created_at, expires_at, revoked').eq('report_id', reportId).eq('tenant_id', tenant).order('created_at', { ascending: false });
  const { data: reviews } = await supabaseAdmin.from('rapport_reviews').select('id, author, comment, block_ref, created_at').eq('report_id', reportId).eq('tenant_id', tenant).order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, shares: shares || [], reviews: reviews || [] });
}

export async function PUT(req: NextRequest) {
  // PUBLIC : ajout d'un commentaire de révision via un token en mode 'review'.
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });
  const { data: share } = await supabaseAdmin.from('rapport_shares').select('*').eq('token', token).maybeSingle();
  if (!share || isExpired(share)) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
  if (share.mode !== 'review') return NextResponse.json({ error: 'Lecture seule' }, { status: 403 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const comment = String(body.comment || '').slice(0, 4000).trim();
  if (!comment) return NextResponse.json({ error: 'Commentaire vide' }, { status: 400 });
  const { error } = await supabaseAdmin.from('rapport_reviews').insert({
    report_id: share.report_id, tenant_id: share.tenant_id, token,
    author: String(body.author || '').slice(0, 120), comment, block_ref: body.blockRef ? String(body.blockRef).slice(0, 120) : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  // PUBLIC : édition encadrée via un token en mode 'edit', dans la fenêtre autorisée. On ne fusionne
  // QUE des VALEURS (champs de section, états/notes d'inspection) par id — jamais la structure : un
  // client public ne peut donc pas injecter/supprimer de blocs ni toucher aux autres rapports.
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });
  const { data: share } = await supabaseAdmin.from('rapport_shares').select('*').eq('token', token).maybeSingle();
  if (!share || isExpired(share)) return NextResponse.json({ error: 'Lien invalide ou hors fenêtre' }, { status: 404 });
  if (share.mode !== 'edit') return NextResponse.json({ error: 'Édition non autorisée' }, { status: 403 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const fields = body.fields || {};   // { blockId: { fieldId: value } }
  const inspects = body.inspects || {}; // { blockId: { itemId: { state, note } } }

  const { data: rep } = await supabaseAdmin.from('rapports').select('data, deleted, version').eq('id', share.report_id).eq('tenant_id', share.tenant_id).maybeSingle();
  if (!rep || rep.deleted) return NextResponse.json({ error: 'Rapport indisponible' }, { status: 404 });
  const data: any = rep.data || {};
  const blocks: any[] = Array.isArray(data.blocks) ? data.blocks : [];
  const STATES = new Set(['good', 'anomaly', 'na', 'nv']);
  for (const b of blocks) {
    if (b.type === 'section' && fields[b.id]) {
      for (const f of (b.fields || [])) { if (Object.prototype.hasOwnProperty.call(fields[b.id], f.id)) { f.value = String(fields[b.id][f.id] ?? '').slice(0, 2000); f.uncertain = false; } }
    }
    if (b.type === 'inspect' && inspects[b.id]) {
      for (const it of (b.items || [])) { const patch = inspects[b.id][it.id]; if (patch) {
        if (patch.state && STATES.has(patch.state)) it.state = patch.state;
        if (typeof patch.note === 'string') it.note = patch.note.slice(0, 2000);
      } }
    }
  }
  data.blocks = blocks;
  data.lastExternalEditAt = new Date().toISOString();
  const { error } = await supabaseAdmin.from('rapports').update({ data, updated_at: new Date().toISOString() }).eq('id', share.report_id).eq('tenant_id', share.tenant_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const token = new URL(req.url).searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('rapport_shares').update({ revoked: true }).eq('token', token).eq('tenant_id', u.tenant_id || '');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
