import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Transmission au client pour APPROBATION (soumission / facture / feuille de temps).
//  - POST (auth)      : crée un lien { docType, docId, docNumber, expiresInDays } -> { token, url }
//  - GET ?token=      : PUBLIC — résout le lien : document normalisé (en-tête, lignes, total) + statut
//  - PUT ?token=      : PUBLIC — le client APPROUVE/REFUSE + signe -> met à jour le statut du document
//  - GET ?docId=&docType= (auth) : liste les liens d'un document
//  - DELETE ?token=   : (auth) révoque
// Sécurité : tenant = SESSION à la création ; table fermée à l'anon (migration 180) — accès via service_role.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const money = (n: number) => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
function newToken() {
  const u = () => (globalThis.crypto?.randomUUID?.() || '').replace(/-/g, '');
  return (u() + u()).slice(0, 48) || Math.random().toString(36).slice(2);
}
const DOC_TYPES = ['soumission', 'invoice', 'timesheet'] as const;
const isExpired = (s: any) => s.revoked || (s.expires_at && new Date(s.expires_at).getTime() < Date.now());

// Normalise un document (par type) pour la page d'approbation : titre, n°, client, date, lignes, total.
async function loadDocument(tenant: string, docType: string, docId: string): Promise<any | null> {
  if (docType === 'soumission') {
    const { data: s } = await supabaseAdmin.from('soumissions').select('*').eq('id', docId).eq('tenant_id', tenant).maybeSingle();
    if (!s) return null;
    const { data: items } = await supabaseAdmin.from('soumission_items').select('id, name, total').eq('soumission_id', docId).order('sort_order');
    const lines = (items || []).map((it: any) => ({ label: it.name || 'Item', amount: money(it.total || 0) }));
    return { title: 'Soumission', number: s.numero, clientName: s.client_snapshot?.name || '—', date: s.created_at?.slice(0, 10) || '', lines, total: money(s.total || 0), status: s.status };
  }
  if (docType === 'invoice') {
    const { data: inv } = await supabaseAdmin.from('commerce_invoices').select('*').eq('id', docId).eq('tenant_id', tenant).maybeSingle();
    if (!inv) return null;
    const { data: items } = await supabaseAdmin.from('commerce_invoice_items').select('description, subtotal').eq('invoice_id', docId);
    const lines = (items || []).map((it: any) => ({ label: it.description || '—', amount: money(it.subtotal || 0) }));
    return { title: 'Facture', number: inv.invoice_number, clientName: inv.client_snapshot?.name || '—', date: inv.issue_date || '', lines, total: money(inv.total || 0), status: inv.status };
  }
  if (docType === 'timesheet') {
    const { data: t } = await supabaseAdmin.from('timesheets').select('*').eq('id', docId).eq('tenant_id', tenant).maybeSingle();
    if (!t) return null;
    const { data: ents } = await supabaseAdmin.from('timesheet_entries').select('date, hrs_regular, hrs_overtime, hrs_premium, project_number').eq('timesheet_id', docId).order('date');
    let h = 0; const lines = (ents || []).map((e: any) => { const tot = (Number(e.hrs_regular) || 0) + (Number(e.hrs_overtime) || 0) + (Number(e.hrs_premium) || 0); h += tot; return { label: `${e.date || ''}${e.project_number ? ' · ' + e.project_number : ''}`, amount: `${tot} h` }; });
    return { title: 'Feuille de temps', number: t.employee_name || '', clientName: t.employee_name || '—', date: `${t.period_start || ''} → ${t.period_end || ''}`, lines, total: `${Math.round(h * 100) / 100} h`, status: t.status };
  }
  return null;
}

// Met à jour le statut du document sous-jacent à l'approbation client.
async function markDocumentApproved(tenant: string, docType: string, docId: string, approved: boolean) {
  if (!approved) return;
  if (docType === 'soumission') await supabaseAdmin.from('soumissions').update({ status: 'accepted' }).eq('id', docId).eq('tenant_id', tenant);
  else if (docType === 'timesheet') await supabaseAdmin.from('timesheets').update({ status: 'approved' }).eq('id', docId).eq('tenant_id', tenant);
  // facture : l'approbation client est tracée sur le partage (pas de statut « approuvé » dédié sur la facture).
}

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const docType = String(body.docType || '');
  const docId = String(body.docId || '');
  if (!DOC_TYPES.includes(docType as any) || !docId) return NextResponse.json({ error: 'docType/docId invalides' }, { status: 400 });
  // Le document doit appartenir au tenant.
  const doc = await loadDocument(tenant, docType, docId);
  if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  const token = newToken();
  const expires_at = body.expiresInDays ? new Date(Date.now() + Number(body.expiresInDays) * 86400000).toISOString() : null;
  const { error } = await supabaseAdmin.from('document_shares').insert({
    tenant_id: tenant, token, doc_type: docType, doc_id: docId, doc_number: body.docNumber || doc.number || null,
    created_by: u.email || null, expires_at,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const origin = req.headers.get('origin') || new URL(req.url).origin;
  return NextResponse.json({ ok: true, token, url: `${origin}/approbation/${token}` });
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const token = sp.get('token');
  // PUBLIC : résolution par token.
  if (token) {
    const { data: share } = await supabaseAdmin.from('document_shares').select('*').eq('token', token).maybeSingle();
    if (!share || isExpired(share)) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
    const doc = await loadDocument(share.tenant_id, share.doc_type, share.doc_id);
    if (!doc) return NextResponse.json({ error: 'Document indisponible' }, { status: 404 });
    return NextResponse.json({ ok: true, document: doc, share: { status: share.status, approver_name: share.approver_name, signature: share.signature, decided_at: share.decided_at, note: share.note } });
  }
  // AUTH : liste des liens d'un document.
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const docId = sp.get('docId') || '';
  const { data } = await supabaseAdmin.from('document_shares').select('token, status, approver_name, decided_at, created_at, revoked')
    .eq('tenant_id', u.tenant_id || '').eq('doc_id', docId).order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, shares: data || [] });
}

export async function PUT(req: NextRequest) {
  // PUBLIC : le client approuve/refuse + signe.
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });
  const { data: share } = await supabaseAdmin.from('document_shares').select('*').eq('token', token).maybeSingle();
  if (!share || isExpired(share)) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
  if (share.status !== 'pending') return NextResponse.json({ ok: true, already: true, status: share.status });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const decision = body.decision === 'declined' ? 'declined' : 'approved';
  const name = String(body.approverName || '').slice(0, 160).trim();
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('document_shares').update({
    status: decision, approver_name: name, approver_email: String(body.approverEmail || '').slice(0, 200) || null,
    signature: String(body.signature || name).slice(0, 4000), note: String(body.note || '').slice(0, 2000) || null,
    decided_at: new Date().toISOString(),
  }).eq('token', token);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await markDocumentApproved(share.tenant_id, share.doc_type, share.doc_id, decision === 'approved');
  return NextResponse.json({ ok: true, status: decision });
}

export async function DELETE(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const token = new URL(req.url).searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'token requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('document_shares').update({ revoked: true }).eq('token', token).eq('tenant_id', u.tenant_id || '');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
