import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';
import { extractJsonValue } from '@/lib/aiJson';

// « Scanner (IA) » d'une pièce jointe pour PRÉ-REMPLIR une (ou plusieurs) transaction(s) :
//   - IMAGE  -> Claude Vision (OCR du reçu)            -> { extracted } (1 transaction)
//   - PDF    -> Claude document (lit le PDF nativement) -> { extracted } (1 transaction)
//   - EXCEL/CSV -> parsé en texte, l'IA extrait une LISTE -> { extractedList } (N transactions)
// Proxy SERVEUR (clé Anthropic jamais côté navigateur), budget IA scopé au tenant. Québec TPS/TVQ.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"vendor":"nom","date":"AAAA-MM-JJ","currency":"CAD|USD","subtotal":nombre,"gst":nombre,"qst":nombre,"pst":nombre,"total":nombre,"type":"expense|revenue","is_transfer":true|false,"category_hint":"nature","description":"libellé court","confidence":"high|medium|low"}`;
const SYS_ONE = `Tu es un assistant COMPTABLE. Extrais les infos d'UN reçu/facture pour une entreprise québécoise (TPS 5 %, TVQ 9,975 %). Réponds UNIQUEMENT en JSON valide : ${SCHEMA}. Montants en nombres (point décimal), 0 si taxe absente, null si illisible. N'invente pas.`;
// PDF/CSV : peut être un reçu UNIQUE ou un RELEVÉ multi-lignes → extraction EXHAUSTIVE ligne par ligne + RÉSUMÉ déclaré.
const STMT_SUMMARY = `"summary":{"is_statement":true|false,"account_number":"numéro/derniers chiffres du compte du relevé (ex. 8157)","opening_balance":nombre,"closing_balance":nombre,"total_credits":nombre,"total_debits":nombre,"count_credits":entier,"count_debits":entier}`;
const SYS_DOC = `Tu es un assistant COMPTABLE MÉTICULEUX pour une entreprise québécoise (TPS 5 %, TVQ 9,975 %). On te donne un relevé/reçu sous forme de PDF, d'image OU de lignes CSV : soit un REÇU/FACTURE unique, soit un RELEVÉ (bancaire / carte) avec PLUSIEURS opérations.
RÈGLES STRICTES — n'omets AUCUNE opération :
- Liste CHAQUE opération individuellement, MÊME s'il y en a PLUSIEURS le MÊME JOUR (chaque virement/dépôt/retrait/frais = une ligne distincte). Compte-les : le nombre de lignes extraites DOIT égaler le nombre d'opérations du relevé.
- Utilise les colonnes « Chèques et débits » / « Dépôts et crédits » — JAMAIS la colonne « Solde » (le solde n'est PAS une opération).
- N'inscris JAMAIS comme opération : solde d'ouverture/clôture, sous-total, report, total de page.
- Débit / retrait / paiement / chèque / frais (argent SORTI) → "type":"expense". Dépôt / crédit / virement reçu (argent ENTRÉ) → "type":"revenue". Montant POSITIF.
- TRANSFERT ENTRE COMPTES DE L'ENTREPRISE (ex. « télévirement au compte de dépôt », « virement au compte », « transfert vers compte », mouvement vers un autre de SES comptes) → garde "type" selon la direction MAIS mets "is_transfer":true (ce N'EST NI un revenu NI une dépense, c'est un déplacement d'argent interne). Tous les autres : "is_transfer":false.
- Reçu/facture unique : UN seul item avec taxes détaillées.
- En PLUS des items, renvoie le RÉSUMÉ DÉCLARÉ du relevé (les TOTAUX imprimés : solde d'ouverture, clôture, total des crédits/dépôts, total des débits/chèques, et leurs nombres). Ces chiffres servent à détecter un écart. is_statement=false si c'est un simple reçu.
Réponds UNIQUEMENT en JSON valide : {"items":[${SCHEMA}],${STMT_SUMMARY}}. N'invente RIEN.`;

async function callAnthropic(apiKey: string, system: string, content: any, maxTokens = 4096): Promise<any> {
  const resp = await anthropicMessages(apiKey, { max_tokens: maxTokens, system, messages: [{ role: 'user', content }] });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
  return resp.json();
}
function parseJson(text: string): any { return extractJsonValue(text); }

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
      // DÉCOUPAGE EN LOTS : un gros relevé dépasserait max_tokens et tronquerait le JSON (réponse illisible).
      // On garde l'en-tête dans chaque lot et on agrège les items ; le 1er résumé déclaré est conservé.
      const allLines = csv.split(/\r?\n/).filter(l => l.trim().length);
      const header = allLines[0] || '';
      const dataLines = allLines.slice(1);
      const CHUNK = 60;
      // Borne le NOMBRE d'appels IA par requête pour ne pas dépasser le délai serveur (504). Au-delà,
      // l'appelant (relevé→transactions) découpe déjà côté client par lots, et un repli crée sans IA.
      const MAX_BATCHES = 3;
      const allBatches: string[] = dataLines.length <= CHUNK
        ? [csv.slice(0, 16000)]
        : Array.from({ length: Math.ceil(dataLines.length / CHUNK) }, (_, i) => [header, ...dataLines.slice(i * CHUNK, i * CHUNK + CHUNK)].join('\n').slice(0, 16000));
      const batches = allBatches.slice(0, MAX_BATCHES);
      const truncated = allBatches.length > MAX_BATCHES;
      const items: any[] = [];
      let summary: any = null, costTotal = 0;
      for (const batch of batches) {
        const d = await callAnthropic(apiKey, [ANTI_INJECTION, SYS_DOC].join('\n'), `Lignes (CSV) d'un relevé à extraire (déduis le compte si présent dans l'en-tête/préambule) :\n${batch}`, 8192);
        try { const c = aiCallCostCents(MODEL, d?.usage); if (c > 0) costTotal += c; } catch { /* best-effort */ }
        const t = (d?.content || []).map((b: any) => b?.text || '').join('').trim();
        const o = parseJson(t);
        if (o) {
          const its = Array.isArray(o.items) ? o.items : (Array.isArray(o) ? o : (o.vendor || o.total != null ? [o] : []));
          items.push(...its);
          if (o.summary && !summary) summary = o.summary;
        }
      }
      if (tenant && costTotal > 0) { try { await recordAiUsage(tenant, 'transactions', costTotal, { feature: 'scan-receipt' }); } catch { /* best-effort */ } }
      if (!items.length) return NextResponse.json({ error: 'Lecture impossible (réponse illisible).' }, { status: 422 });
      return NextResponse.json({ extractedList: items, summary: summary || null, truncated, processedRows: Math.min(dataLines.length, MAX_BATCHES * CHUNK) });
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
      // Résumé déclaré du relevé (totaux imprimés) → permet de détecter un écart d'extraction côté client.
      return NextResponse.json({ extractedList: items, summary: obj.summary || null });
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
