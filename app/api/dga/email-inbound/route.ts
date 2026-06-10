import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAiBudget } from '@/lib/aiBudget';
import { extractDgaFromPdf, importTransformers } from '@/lib/dga/importServer';
import { parseLimsBuffer, isPdf, isSpreadsheet } from '@/lib/dga/insideview';

// #DGA — Webhook d'IMPORT PAR COURRIEL. Le tenant fait suivre / configure son labo pour envoyer les
// rapports PDF ou Excel/CSV (LIMS) a son adresse dediee (dga.<tenant>@<domaine>).
// DEUX sources possibles :
//   • PASSERELLE GENERIQUE (recommande, GRATUIT — ex. Cloudflare Email Routing + Email Worker) :
//     POST JSON avec en-tete `x-cs-inbound-secret` = DGA_INBOUND_WEBHOOK_SECRET, pieces jointes EN
//     LIGNE (base64). Aucune dependance externe pour la reception.
//   • RESEND Inbound (event `email.received` + signature Svix) : pieces jointes recuperees via l'API.
// Flux commun : resolution tenant par config (adresse To) -> liste blanche -> budget IA (PDF) ->
// extraction (PDF=IA / Excel=direct) -> import service_role -> courriel de confirmation -> audit.
// Temps reel (publication 153) -> les donnees apparaissent EN DIRECT dans l'app.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const RESEND_API = 'https://api.resend.com';

function eqConst(a: string, b: string): boolean {
  const ba = Buffer.from(a || ''), bb = Buffer.from(b || '');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
function verifySvix(secret: string, id: string, ts: string, sigHeader: string, body: string): boolean {
  if (!secret || !id || !ts || !sigHeader) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
  const exp = Buffer.from(expected);
  for (const part of sigHeader.split(' ')) {
    const sig = part.includes(',') ? part.split(',')[1] : part;
    if (!sig) continue;
    try { const got = Buffer.from(sig); if (got.length === exp.length && timingSafeEqual(got, exp)) return true; } catch { /* longueurs differentes */ }
  }
  return false;
}

function pureAddr(s: string): string {
  const m = String(s || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(s || '')).trim().toLowerCase();
}
function tenantsFromTo(toList: string[]): string[] {
  const out = new Set<string>();
  for (const raw of toList) {
    const local = pureAddr(raw).split('@')[0] || '';
    if (local.startsWith('dga.')) out.add(local.slice(4));
    else if (local.startsWith('dga+')) out.add(local.slice(4));
    else if (local.includes('+')) out.add(local.split('+')[1]);
  }
  return [...out].filter(Boolean);
}
function senderAllowed(from: string, allow: string[]): boolean {
  if (!allow || !allow.length) return true; // vide = accepter tous (choix du tenant)
  const f = pureAddr(from); const dom = f.split('@')[1] || '';
  return allow.some(a => {
    a = String(a || '').toLowerCase().trim(); if (!a) return false;
    if (a.startsWith('@')) return dom === a.slice(1);
    if (a.includes('@')) return f === a;
    return dom === a || f === a;
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY; if (!apiKey || !to) return;
  try {
    await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'noreply@csecur360.com', to, subject, html }),
    });
  } catch { /* best-effort */ }
}
function frame(title: string, body: string) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:28px 24px;background:#f8fafc;border-radius:12px">
    <h2 style="color:#1e293b;margin:0 0 10px">${title}</h2>${body}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0" />
    <p style="color:#cbd5e1;font-size:12px">C-Secur360 · Diagnostic DGA</p></div>`;
}
async function logRow(row: any) { try { await supabaseAdmin.from('dga_inbound_log').insert(row); } catch { /* best-effort */ } }

// Doc normalise a traiter : metadonnees + recuperation paresseuse des octets.
interface Doc { filename: string; contentType: string; getBytes: () => Promise<Uint8Array>; }

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = process.env.DGA_INBOUND_WEBHOOK_SECRET || '';
  const isProd = process.env.NODE_ENV === 'production';

  let to: string[] = [], from = '', subject = '', emailId = '';
  let inline: { filename: string; contentType: string; bytes: Uint8Array }[] | null = null;

  const genSecret = req.headers.get('x-cs-inbound-secret');
  if (genSecret != null) {
    // ── Mode PASSERELLE GENERIQUE (Cloudflare Email Worker, etc.) ──
    if (!secret || !eqConst(genSecret, secret)) return NextResponse.json({ error: 'secret invalide' }, { status: 401 });
    let body: any = {}; try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
    to = Array.isArray(body.to) ? body.to : (body.to ? [body.to] : []);
    from = body.from || ''; subject = body.subject || '';
    inline = (Array.isArray(body.attachments) ? body.attachments : []).map((a: any) => {
      const b64 = a.contentBase64 || a.content || a.data || '';
      let bytes = new Uint8Array(0); try { bytes = new Uint8Array(Buffer.from(String(b64), 'base64')); } catch { /* ignore */ }
      return { filename: a.filename || a.name || '', contentType: a.contentType || a.content_type || a.type || '', bytes };
    }).filter((a: any) => a.bytes.length);
  } else {
    // ── Mode RESEND (email.received + Svix) ──
    if (secret) {
      if (!verifySvix(secret, req.headers.get('svix-id') || '', req.headers.get('svix-timestamp') || '', req.headers.get('svix-signature') || '', raw)) return NextResponse.json({ error: 'signature invalide' }, { status: 401 });
    } else if (isProd) {
      return NextResponse.json({ error: 'webhook non configure' }, { status: 503 });
    }
    let evt: any = {}; try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
    if (evt?.type && evt.type !== 'email.received') return NextResponse.json({ ok: true, ignored: evt.type });
    const d = evt?.data || evt || {};
    to = Array.isArray(d.to) ? d.to : (d.to ? [d.to] : []);
    from = d.from || ''; subject = d.subject || ''; emailId = d.email_id || d.id || '';
  }

  // ── Resolution du tenant via la CONFIG (adresse To), jamais via le corps ──
  const cands = tenantsFromTo(to);
  if (!cands.length) return NextResponse.json({ ok: true, ignored: 'no-tenant' });
  const { data: configs } = await supabaseAdmin.from('dga_inbound').select('*').in('tenant_id', cands);
  const toSet = new Set(to.map(pureAddr));
  const cfg = (configs || []).find((c: any) => toSet.has(pureAddr(c.address))) || (configs || [])[0];
  if (!cfg) return NextResponse.json({ ok: true, ignored: 'no-config' });
  const tenant = cfg.tenant_id as string;

  const audit = (status: string, detail: string, counts?: { created?: number; merged?: number; measures?: number }) =>
    logRow({ tenant_id: tenant, email_id: emailId, from_addr: pureAddr(from), subject, status, detail, created: counts?.created || 0, merged: counts?.merged || 0, measures: counts?.measures || 0 });

  if (!cfg.enabled) { await audit('rejected', 'Import par courriel desactive'); return NextResponse.json({ ok: true, ignored: 'disabled' }); }
  if (!senderAllowed(from, cfg.allow_senders || [])) { await audit('rejected', `Expediteur non autorise : ${pureAddr(from)}`); return NextResponse.json({ ok: true, ignored: 'sender-not-allowed' }); }

  // ── Liste des documents (PDF + Excel/CSV) selon la source ──
  let docs: Doc[] = [];
  if (inline) {
    docs = inline.filter(a => isPdf(a.filename, a.contentType) || isSpreadsheet(a.filename, a.contentType))
      .map(a => ({ filename: a.filename, contentType: a.contentType, getBytes: async () => a.bytes }));
  } else {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !emailId) { await audit('error', 'RESEND_API_KEY ou email_id manquant'); return NextResponse.json({ error: 'config' }, { status: 500 }); }
    let attachments: any[] = [];
    try { const r = await fetch(`${RESEND_API}/emails/receiving/${emailId}/attachments`, { headers: { Authorization: `Bearer ${apiKey}` } }); const j = await r.json(); attachments = Array.isArray(j?.data) ? j.data : []; }
    catch { await audit('error', 'Recuperation des pieces jointes echouee'); return NextResponse.json({ error: 'attachments' }, { status: 500 }); }
    docs = attachments.filter(a => isPdf(a.filename, a.content_type) || isSpreadsheet(a.filename, a.content_type)).map(a => ({
      filename: a.filename || '', contentType: a.content_type || '',
      getBytes: async () => { const fr = await fetch(a.download_url); return new Uint8Array(await fr.arrayBuffer()); },
    }));
  }
  if (!docs.length) { await audit('ignored', 'Courriel sans piece jointe DGA (PDF/Excel) — ignore'); return NextResponse.json({ ok: true, ignored: 'no-doc' }); }

  // ── Traitement : Excel/CSV en direct (gratuit) ; PDF via l'IA (budget IA du tenant) ──
  try {
    let budget: any = null; try { budget = await getAiBudget(tenant); } catch { /* tolere */ }
    const allTransformers: any[] = [];
    let blockedByBudget = false;
    for (const a of docs) {
      const bytes = await a.getBytes();
      if (!bytes || !bytes.length) continue;
      if (isSpreadsheet(a.filename, a.contentType) && !isPdf(a.filename, a.contentType)) {
        const parsed = parseLimsBuffer(bytes); if (parsed) allTransformers.push(...parsed.transformers);
      } else {
        if (budget?.exhausted) { blockedByBudget = true; continue; }
        const { transformers } = await extractDgaFromPdf(Buffer.from(bytes).toString('base64'), tenant);
        allTransformers.push(...transformers);
      }
    }
    if (!allTransformers.length) {
      if (blockedByBudget) { await audit('rejected', 'Forfait IA epuise'); await sendMail(pureAddr(from), 'Import DGA non traite — forfait IA epuise', frame('Import DGA non traite', '<p style="color:#475569">Votre rapport PDF a bien ete recu mais le forfait IA du compte est epuise. Renouvelez-le puis renvoyez le rapport. (Les exports Excel/CSV ne consomment pas de forfait.)</p>')); return NextResponse.json({ ok: true, ignored: 'budget' }); }
      await audit('ignored', 'Aucune donnee DGA exploitable — ignore'); return NextResponse.json({ ok: true, ignored: 'empty' });
    }

    const res = await importTransformers(tenant, allTransformers, { autoCreate: cfg.auto_create !== false });
    await audit('imported', res.idents.join(', ').slice(0, 500), res);

    const list = res.idents.slice(0, 20).map(x => `<li>${String(x).replace(/</g, '')}</li>`).join('');
    await sendMail(pureAddr(from), `Import DGA reussi — ${res.created} cree(s), ${res.merged} mis a jour`, frame('Import DGA reussi', `
      <p style="color:#475569">Votre rapport a ete importe automatiquement dans C-Secur360 :</p>
      <ul style="color:#1e293b;font-size:14px"><li><b>${res.created}</b> transformateur(s) cree(s)</li><li><b>${res.merged}</b> transformateur(s) mis a jour</li><li><b>${res.measures}</b> mesure(s) ajoutee(s)</li></ul>
      ${list ? `<p style="color:#64748b;font-size:13px;margin-bottom:4px">Transformateurs :</p><ul style="color:#475569;font-size:13px">${list}</ul>` : ''}
      <p style="color:#94a3b8;font-size:13px">Diagnostics (IEEE C57.104 / Duval) calcules automatiquement. Ouvrez le module DGA pour consulter les fiches.</p>`));

    return NextResponse.json({ ok: true, created: res.created, merged: res.merged, measures: res.measures });
  } catch (e: any) {
    await audit('error', String(e?.message || e).slice(0, 500));
    return NextResponse.json({ error: e?.message || 'Erreur import' }, { status: 500 });
  }
}
