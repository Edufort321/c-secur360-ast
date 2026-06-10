import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAiBudget } from '@/lib/aiBudget';
import { extractDgaFromPdf, importTransformers } from '@/lib/dga/importServer';
import { parseLimsBuffer, isPdf, isSpreadsheet } from '@/lib/dga/insideview';

// #DGA — Webhook d'IMPORT PAR COURRIEL (Resend Inbound). Le tenant fait suivre / configure son labo
// ou son analyseur pour envoyer les rapports PDF a son adresse dediee (dga.<tenant>@<domaine>).
// Resend recoit le courriel, parse les pieces jointes, puis appelle CE webhook (event email.received).
// Flux : verif signature Svix -> resolution du tenant depuis l'adresse To -> liste blanche
// d'expediteurs -> budget IA -> recuperation des PDF via l'API Resend -> extraction + import serveur
// (service_role) -> courriel de confirmation -> journal d'audit. Le temps reel (publication 153)
// fait apparaitre les donnees EN DIRECT dans l'app ouverte.
//
// Securite / Loi 25 : signature obligatoire en prod ; tenant resolu par CONFIG (jamais par le corps) ;
// liste blanche anti-usurpation ; tout en service_role cote serveur ; audit conserve.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // boucle sur plusieurs PDF/Excel -> marge anti-timeout

const RESEND_API = 'https://api.resend.com';

// ───────────────────────── Verification signature (Svix / Resend) ─────────────────────────
function verifySvix(secret: string, id: string, ts: string, sigHeader: string, body: string): boolean {
  if (!secret || !id || !ts || !sigHeader) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
  const exp = Buffer.from(expected);
  for (const part of sigHeader.split(' ')) {
    const sig = part.includes(',') ? part.split(',')[1] : part;
    if (!sig) continue;
    try { const got = Buffer.from(sig); if (got.length === exp.length && timingSafeEqual(got, exp)) return true; } catch { /* longueur differente */ }
  }
  return false;
}

// Extrait l'adresse courriel pure d'un champ "Nom <addr@x>" ou "addr@x".
function pureAddr(s: string): string {
  const m = String(s || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(s || '')).trim().toLowerCase();
}
// Candidats de tenant a partir des adresses To : dga.<tenant>@... ou dga+<tenant>@... ou <x>+<tenant>@...
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

export async function POST(req: NextRequest) {
  const raw = await req.text(); // corps BRUT requis pour la verification de signature
  const secret = process.env.DGA_INBOUND_WEBHOOK_SECRET || '';
  const svixId = req.headers.get('svix-id') || '';
  const svixTs = req.headers.get('svix-timestamp') || '';
  const svixSig = req.headers.get('svix-signature') || '';
  const isProd = process.env.NODE_ENV === 'production';

  if (secret) {
    if (!verifySvix(secret, svixId, svixTs, svixSig, raw)) return NextResponse.json({ error: 'signature invalide' }, { status: 401 });
  } else if (isProd) {
    // En prod, refuser si le secret n'est pas configure (sinon n'importe qui pourrait injecter).
    return NextResponse.json({ error: 'webhook non configure' }, { status: 503 });
  } // en dev : on accepte sans signature (fail-open local, comme l'inbound Twilio).

  let evt: any = {};
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  if (evt?.type && evt.type !== 'email.received') return NextResponse.json({ ok: true, ignored: evt.type });

  const d = evt?.data || evt || {};
  const toList: string[] = Array.isArray(d.to) ? d.to : (d.to ? [d.to] : []);
  const from: string = d.from || '';
  const subject: string = d.subject || '';
  const emailId: string = d.email_id || d.id || '';

  // 1) Resolution du tenant via la CONFIG (jamais via le corps du courriel).
  const cands = tenantsFromTo(toList);
  if (!cands.length) return NextResponse.json({ ok: true, ignored: 'no-tenant' });
  const { data: configs } = await supabaseAdmin.from('dga_inbound').select('*').in('tenant_id', cands);
  const toSet = new Set(toList.map(pureAddr));
  const cfg = (configs || []).find((c: any) => toSet.has(pureAddr(c.address))) || (configs || [])[0];
  if (!cfg) return NextResponse.json({ ok: true, ignored: 'no-config' });
  const tenant = cfg.tenant_id as string;

  // Helper de journalisation rattache au tenant resolu.
  const audit = (status: string, detail: string, counts?: { created?: number; merged?: number; measures?: number }) =>
    logRow({ tenant_id: tenant, email_id: emailId, from_addr: pureAddr(from), subject, status, detail, created: counts?.created || 0, merged: counts?.merged || 0, measures: counts?.measures || 0 });

  if (!cfg.enabled) { await audit('rejected', 'Import par courriel desactive'); return NextResponse.json({ ok: true, ignored: 'disabled' }); }

  // 2) Liste blanche d'expediteurs (anti-usurpation).
  if (!senderAllowed(from, cfg.allow_senders || [])) {
    await audit('rejected', `Expediteur non autorise : ${pureAddr(from)}`);
    return NextResponse.json({ ok: true, ignored: 'sender-not-allowed' });
  }

  // 3) Recupere les pieces jointes via l'API Resend (le webhook ne contient que les metadonnees).
  //    On traite les rapports PDF (extraction IA) ET les exports Excel/CSV LIMS InsideView/Morgan
  //    Schaffer (mappage DIRECT, sans IA). Un courriel sans piece exploitable est IGNORE (aucune
  //    action, aucun courriel renvoye ; simple trace au journal).
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !emailId) { await audit('error', 'RESEND_API_KEY ou email_id manquant'); return NextResponse.json({ error: 'config' }, { status: 500 }); }
  let attachments: any[] = [];
  try {
    const r = await fetch(`${RESEND_API}/emails/receiving/${emailId}/attachments`, { headers: { Authorization: `Bearer ${apiKey}` } });
    const j = await r.json();
    attachments = Array.isArray(j?.data) ? j.data : [];
  } catch { await audit('error', 'Recuperation des pieces jointes echouee'); return NextResponse.json({ error: 'attachments' }, { status: 500 }); }
  const docs = attachments.filter(a => isPdf(a.filename, a.content_type) || isSpreadsheet(a.filename, a.content_type));
  if (!docs.length) { await audit('ignored', 'Courriel sans piece jointe DGA (PDF/Excel) — ignore'); return NextResponse.json({ ok: true, ignored: 'no-doc' }); }

  // 4) Traitement : Excel/CSV LIMS en direct (gratuit) ; PDF via l'IA (soumis au budget IA du tenant).
  try {
    let budget: any = null; try { budget = await getAiBudget(tenant); } catch { /* tolere */ }
    const allTransformers: any[] = [];
    let blockedByBudget = false;
    for (const a of docs) {
      if (!a.download_url) continue;
      const fr = await fetch(a.download_url);
      if (!fr.ok) continue;
      const bytes = new Uint8Array(await fr.arrayBuffer());
      if (isSpreadsheet(a.filename, a.content_type) && !isPdf(a.filename, a.content_type)) {
        const parsed = parseLimsBuffer(bytes); // deterministe, aucun jeton IA
        if (parsed) allTransformers.push(...parsed.transformers);
      } else {
        if (budget?.exhausted) { blockedByBudget = true; continue; } // PDF = IA -> respecte le budget
        const { transformers } = await extractDgaFromPdf(Buffer.from(bytes).toString('base64'), tenant);
        allTransformers.push(...transformers);
      }
    }
    if (!allTransformers.length) {
      if (blockedByBudget) { await audit('rejected', 'Forfait IA epuise'); await sendMail(pureAddr(from), 'Import DGA non traite — forfait IA epuise', frame('Import DGA non traite', '<p style="color:#475569">Votre rapport PDF a bien ete recu mais le forfait IA du compte est epuise. Renouvelez-le puis renvoyez le rapport. (Les exports Excel/CSV LIMS ne consomment pas de forfait.)</p>')); return NextResponse.json({ ok: true, ignored: 'budget' }); }
      await audit('ignored', 'Aucune donnee DGA exploitable — ignore'); return NextResponse.json({ ok: true, ignored: 'empty' });
    }

    const res = await importTransformers(tenant, allTransformers, { autoCreate: cfg.auto_create !== false });
    await audit('imported', res.idents.join(', ').slice(0, 500), res);

    const list = res.idents.slice(0, 20).map(x => `<li>${String(x).replace(/</g, '')}</li>`).join('');
    await sendMail(pureAddr(from), `Import DGA reussi — ${res.created} cree(s), ${res.merged} mis a jour`, frame('Import DGA reussi', `
      <p style="color:#475569">Votre rapport a ete importe automatiquement dans C-Secur360 :</p>
      <ul style="color:#1e293b;font-size:14px">
        <li><b>${res.created}</b> transformateur(s) cree(s)</li>
        <li><b>${res.merged}</b> transformateur(s) mis a jour</li>
        <li><b>${res.measures}</b> mesure(s) ajoutee(s)</li>
      </ul>
      ${list ? `<p style="color:#64748b;font-size:13px;margin-bottom:4px">Transformateurs :</p><ul style="color:#475569;font-size:13px">${list}</ul>` : ''}
      <p style="color:#94a3b8;font-size:13px">Les diagnostics (IEEE C57.104 / Duval) sont calcules automatiquement. Ouvrez le module DGA pour consulter les fiches.</p>`));

    return NextResponse.json({ ok: true, created: res.created, merged: res.merged, measures: res.measures });
  } catch (e: any) {
    await audit('error', String(e?.message || e).slice(0, 500));
    return NextResponse.json({ error: e?.message || 'Erreur import' }, { status: 500 });
  }
}
