import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// « Importer le bon de commande (IA) » : on envoie le BC (PDF/image) à Anthropic (vision). L'IA extrait
// le N° de BC, le montant, les dates, le titre des travaux, et le PROFIL CLIENT (adresse, facturation,
// contacts) -> pré-remplit le projet + complète la fiche client. Proxy SERVEUR (clé jamais côté client),
// budget IA scopé au tenant. Calqué sur /api/bons-commande/scan-reception.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"po_number":"","po_amount":nombre,"po_date":"AAAA-MM-JJ","title":"","work_start":"AAAA-MM-JJ","work_end":"AAAA-MM-JJ","client_name":"","client":{"address":"","city":"","province":"QC","postal_code":"","billing_address":"","billing_city":"","billing_province":"","billing_postal_code":""},"contacts":[{"name":"","title":"","email":"","phone":"","mobile":""}]}`;
const SYS = `Tu es un commis administratif qui saisit un BON DE COMMANDE (purchase order) reçu d'un client. Lis le document joint et extrais les informations dans un JSON STRICT.
Champs :
- po_number : numéro du bon de commande (PO #, n° de commande). Vide si absent.
- po_amount : montant TOTAL du bon (nombre, sans symbole ni séparateur de milliers ; virgule décimale -> point). 0 si illisible.
- po_date : date du bon (AAAA-MM-JJ). Vide si absente.
- title : objet/description courte des travaux ou de la commande.
- work_start / work_end : dates des travaux si présentes (AAAA-MM-JJ), sinon vide.
- client_name : nom de l'entreprise CLIENTE (celle qui émet le bon / achète). PAS ton entreprise (le fournisseur).
- client.address/city/province/postal_code : adresse principale du client.
- client.billing_address/billing_city/billing_province/billing_postal_code : adresse de FACTURATION si différente (cherche « facturer à », « bill to », « facturation »). Vide si non précisée.
- contacts : personnes-ressources mentionnées (acheteur, responsable, demandeur) avec name, title (fonction), email, phone, mobile. Tableau vide si aucun.
RÈGLES : n'invente JAMAIS une valeur absente (mets "" ou 0). province = code 2 lettres (Québec->QC).
Réponds UNIQUEMENT en JSON valide : ${SCHEMA}`;

async function callAnthropic(apiKey: string, content: any): Promise<any> {
  const resp = await anthropicMessages(apiKey, { max_tokens: 4096, system: [ANTI_INJECTION, SYS].join('\n'), messages: [{ role: 'user', content }] });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
  return resp.json();
}
function parseJson(text: string): any { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m ? m[0] : text); } catch { return null; } }

export async function POST(req: NextRequest) {
 try {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  let raw = String(body.fileBase64 || body.imageBase64 || '');
  let media = String(body.media_type || '').toLowerCase();
  const fileName = String(body.file_name || '');
  const m = raw.match(/^data:([^;]+);base64,(.*)$/);
  if (m) { media = media || m[1].toLowerCase(); raw = m[2]; }
  if (!raw) return NextResponse.json({ error: 'fichier requis' }, { status: 400 });
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (media === 'image/jpg' || ext === 'jpg' || ext === 'jpeg') media = 'image/jpeg';
  else if (ext === 'png' && !media) media = 'image/png';
  else if (ext === 'webp' && !media) media = 'image/webp';
  const isImage = /^image\/(jpeg|png|webp|gif)$/.test(media) || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  const isPdf = media === 'application/pdf' || ext === 'pdf';
  if (isImage && !/^image\/(jpeg|png|webp|gif)$/.test(media)) media = 'image/jpeg';

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { try { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore */ } }

  try {
    let data: any;
    const ask = 'Extrais les informations de ce bon de commande dans le JSON demandé.';
    if (isImage) data = await callAnthropic(apiKey, [{ type: 'image', source: { type: 'base64', media_type: media, data: raw } }, { type: 'text', text: ask }]);
    else if (isPdf) data = await callAnthropic(apiKey, [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: raw } }, { type: 'text', text: ask }]);
    else return NextResponse.json({ error: 'Format non supporté (PDF ou image).' }, { status: 400 });

    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'projects', cost, { feature: 'extract-po' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const obj = parseJson(text);
    if (!obj) return NextResponse.json({ error: 'Lecture impossible (réponse illisible).' }, { status: 422 });
    return NextResponse.json({
      ok: true,
      po_number: String(obj.po_number || ''), po_amount: Number(obj.po_amount) || 0, po_date: String(obj.po_date || ''),
      title: String(obj.title || ''), work_start: String(obj.work_start || ''), work_end: String(obj.work_end || ''),
      client_name: String(obj.client_name || ''),
      client: obj.client && typeof obj.client === 'object' ? obj.client : {},
      contacts: Array.isArray(obj.contacts) ? obj.contacts.filter((c: any) => c && (c.name || c.email || c.phone)) : [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
 } catch (e: any) {
   return NextResponse.json({ error: `Échec du scan : ${e?.message || e}` }, { status: 500 });
 }
}
