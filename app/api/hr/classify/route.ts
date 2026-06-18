import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// RH — Classement automatique d'un document déposé (assistance IA). Détermine le TYPE,
// une CATÉGORIE, le NOM de la personne concernée (extrait du document, le cas échéant),
// une date d'expiration et un titre court. Proxy serveur (clé Anthropic non exposée).
// Loi 25 — minimisation : on n'envoie QUE le document à classer ; aucun fichier RH/paie
// ni la liste des employés n'est transmise. Le rapprochement employé se fait côté app.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const PROMPT = `Tu classes un document de ressources humaines / santé-sécurité d'une entreprise québécoise.
Lis le document et réponds UNIQUEMENT en JSON valide (sans texte autour, sans backticks) :
{"type": "<contrat|cv|certification|attestation|carte_competence|politique|formulaire|paie|evaluation|medical|autre>",
 "category": "<SST|Loi25|paie|contrat|formation|administratif|autre>",
 "personName": "<nom complet de la personne concernée si le document vise un employé précis, sinon null>",
 "isGeneral": <true si le document est general (s'applique a l'organisation, pas a une personne), sinon false>,
 "expiryDate": "<YYYY-MM-DD si une date d'expiration/echeance est presente, sinon null>",
 "title": "<titre court et clair, max 60 caracteres>"}
Règles : déduis le type et la catégorie du contenu. Pour une certification/carte de compétence, capte la date d'expiration. Ne devine pas un nom : si aucune personne précise n'est visée, personName=null et isGeneral=true.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  // Fichier brut en multipart (léger), sinon JSON base64 (compat).
  let b64 = '', mime = 'application/pdf', tenant = '';
  const ctype = req.headers.get('content-type') || '';
  if (ctype.includes('multipart/form-data')) {
    try {
      const fd = await req.formData();
      const file = fd.get('file') as File | null;
      tenant = String(fd.get('tenant') || '').trim();
      if (file) { mime = file.type || 'application/pdf'; b64 = Buffer.from(await file.arrayBuffer()).toString('base64'); }
    } catch { return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 }); }
  } else {
    try { const body = await req.json(); b64 = body.base64 || ''; mime = body.mime || 'application/pdf'; tenant = String(body.tenant || '').trim(); }
    catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  }
  if (!b64) return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
  if (guard.user?.tenant_id) tenant = guard.user.tenant_id; // budget scopé au tenant de session

  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  // PDF -> document ; image -> image.
  const isImage = mime.startsWith('image/');
  const docBlock = isImage
    ? { type: 'image', source: { type: 'base64', media_type: mime, data: b64 } }
    : { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } };

  try {
    const resp = await anthropicMessages(apiKey, {
      max_tokens: 512,
      messages: [{ role: 'user', content: [docBlock, { type: 'text', text: PROMPT + '\n' + ANTI_INJECTION }] }],
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (cost > 0) await recordAiUsage(tenant, 'rh', cost, { feature: 'classify' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch { const m = jsonStr.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } } }
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non exploitable' }, { status: 422 });
    return NextResponse.json({ ok: true, classification: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur classement' }, { status: 500 });
  }
}
