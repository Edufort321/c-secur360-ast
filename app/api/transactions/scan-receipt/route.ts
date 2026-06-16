import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// « Scanner (IA) » d'une pièce jointe pour PRÉ-REMPLIR une (ou plusieurs) transaction(s) :
//   - IMAGE  -> Claude Vision (OCR du reçu)            -> { extracted } (1 transaction)
//   - PDF    -> Claude document (lit le PDF nativement) -> { extracted } (1 transaction)
//   - EXCEL/CSV -> parsé en texte, l'IA extrait une LISTE -> { extractedList } (N transactions)
// Proxy SERVEUR (clé Anthropic jamais côté navigateur), budget IA scopé au tenant. Québec TPS/TVQ.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"vendor":"nom","date":"AAAA-MM-JJ","currency":"CAD|USD","subtotal":nombre,"gst":nombre,"qst":nombre,"pst":nombre,"total":nombre,"type":"expense|revenue","category_hint":"nature","description":"libellé court","confidence":"high|medium|low"}`;
const SYS_ONE = `Tu es un assistant COMPTABLE. Extrais les infos d'UN reçu/facture pour une entreprise québécoise (TPS 5 %, TVQ 9,975 %). Réponds UNIQUEMENT en JSON valide : ${SCHEMA}. Montants en nombres (point décimal), 0 si taxe absente, null si illisible. N'invente pas.`;
const SYS_LIST = `Tu es un assistant COMPTABLE. On te donne des lignes (CSV) d'un relevé ou d'une liste de dépenses/revenus. Extrais CHAQUE opération. Réponds UNIQUEMENT en JSON valide : {"items":[${SCHEMA}]}. Montants en nombres, 0 si taxe absente. Ignore les en-têtes. N'invente pas.`;
// PDF : peut être un reçu UNIQUE ou un RELEVÉ multi-lignes → extraction EXHAUSTIVE ligne par ligne.
const SYS_DOC = `Tu es un assistant COMPTABLE MÉTICULEUX pour une entreprise québécoise (TPS 5 %, TVQ 9,975 %). On te donne un PDF : soit un REÇU/FACTURE unique, soit un RELEVÉ (bancaire / carte de crédit) qui contient PLUSIEURS opérations.
RÈGLES STRICTES :
- Si c'est un RELEVÉ : liste EN DÉTAIL CHAQUE opération, UNE PAR UNE (n'en omets AUCUNE). Pour chacune : date (AAAA-MM-JJ), description/tiers exact, montant POSITIF.
- N'inscris JAMAIS comme opération une ligne de SOLDE, « solde précédent », « solde courant », sous-total, report, intérêts cumulés ou total de page. UNIQUEMENT les vraies opérations (débits/crédits).
- Débit / retrait / paiement (argent SORTI) → "type":"expense". Dépôt / crédit / remboursement (argent ENTRÉ) → "type":"revenue".
- Si c'est un seul reçu/facture : renvoie UN seul item avec les taxes détaillées.
- Taxes inconnues sur un relevé → 0. N'invente RIEN.
Réponds UNIQUEMENT en JSON valide : {"items":[${SCHEMA}]}.`;

async function callAnthropic(apiKey: string, system: string, content: any, maxTokens = 4096): Promise<any> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] }),
  });
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
  let raw = String(body.imageBase64 || body.fileBase64 || '');
  let media = String(body.media_type || '').toLowerCase();
  const fileName = String(body.file_name || '');
  const m = raw.match(/^data:([^;]+);base64,(.*)$/);
  if (m) { media = media || m[1].toLowerCase(); raw = m[2]; }
  if (!raw) return NextResponse.json({ error: 'fichier requis' }, { status: 400 });
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  // Normalisation des types d'image fréquents (jpg→jpeg, heic non supporté par l'API Vision).
  if (media === 'image/jpg' || ext === 'jpg' || ext === 'jpeg') media = 'image/jpeg';
  else if (ext === 'png' && !media) media = 'image/png';
  else if (ext === 'webp' && !media) media = 'image/webp';
  const isImage = /^image\/(jpeg|png|webp|gif)$/.test(media) || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  const isPdf = media === 'application/pdf' || ext === 'pdf';
  const isSheet = /spreadsheet|excel|csv/.test(media) || ['xls', 'xlsx', 'csv'].includes(ext);
  if (isImage && !/^image\/(jpeg|png|webp|gif)$/.test(media)) media = 'image/jpeg'; // repli si type absent

  const tenant = guard.user?.tenant_id || '';
  // Lecture du budget « best-effort » : une erreur de lecture ne doit JAMAIS bloquer le scan (sinon 500 opaque).
  if (tenant) { try { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore lecture budget */ } }

  try {
    let data: any;
    if (isImage) {
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS_ONE].join('\n'), [
        { type: 'image', source: { type: 'base64', media_type: media, data: raw } },
        { type: 'text', text: 'Extrais les informations de ce reçu en JSON.' },
      ]);
    } else if (isPdf) {
      // PDF = potentiellement un RELEVÉ multi-lignes → extraction LISTE exhaustive (max_tokens élevé).
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS_DOC].join('\n'), [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: raw } },
        { type: 'text', text: 'Lis ce PDF. Si c\'est un relevé, extrais EN DÉTAIL chaque opération (jamais le solde). Si c\'est un reçu, un seul item. JSON {"items":[...]}.' },
      ], 8192);
    } else if (isSheet) {
      // Parse Excel/CSV -> CSV texte (1re feuille) -> l'IA extrait la LISTE.
      let csv = '';
      try { const wb = XLSX.read(Buffer.from(raw, 'base64'), { type: 'buffer' }); csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]] || {}); }
      catch { return NextResponse.json({ error: 'Fichier Excel/CSV illisible.' }, { status: 422 }); }
      if (!csv.trim()) return NextResponse.json({ error: 'Fichier vide.' }, { status: 422 });
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS_LIST].join('\n'), `Lignes (CSV) à extraire :\n${csv.slice(0, 16000)}`, 8192);
    } else {
      return NextResponse.json({ error: 'Format non supporté (image, PDF, Excel ou CSV).' }, { status: 400 });
    }

    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'transactions', cost, { feature: 'scan-receipt' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const obj = parseJson(text);
    if (!obj) return NextResponse.json({ error: 'Lecture impossible (réponse illisible).' }, { status: 422 });
    // PDF (relevé) ET tableur → LISTE d'opérations ; image/reçu simple → 1 transaction.
    if (isSheet || isPdf) {
      const items = Array.isArray(obj.items) ? obj.items : (Array.isArray(obj) ? obj : (obj.vendor || obj.total != null ? [obj] : []));
      return NextResponse.json({ extractedList: items });
    }
    return NextResponse.json({ extracted: obj });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
 } catch (e: any) {
   // Filet de sécurité : aucune exception (garde, parsing, budget…) ne doit produire un 500 opaque sans message.
   return NextResponse.json({ error: `Échec du scan : ${e?.message || e}` }, { status: 500 });
 }
}
