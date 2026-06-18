import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// « Importer le bordereau de réception (IA) » : on envoie l'image/PDF/Excel du bordereau + les lignes
// du bon de commande. L'IA lit ce qui a été RÉELLEMENT reçu et le rattache aux lignes du bon (par code
// ou désignation), en relevant les écarts (qté reçue vs commandée) et les articles non commandés.
// Proxy SERVEUR (clé Anthropic jamais côté navigateur), budget IA scopé au tenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"matches":[{"index":entier-de-la-ligne-du-bon,"code":"code si lisible","designation":"libellé lu","quantite_recue":nombre}],"extras":[{"code":"","designation":"article reçu NON présent dans le bon","quantite_recue":nombre}]}`;
const SYS = `Tu es un commis à la RÉCEPTION de marchandises. On te donne (1) les lignes d'un BON DE COMMANDE (avec leur index, code, désignation, quantité commandée) et (2) un BORDEREAU DE RÉCEPTION (bon de livraison). Tâche : déterminer ce qui a été RÉELLEMENT reçu et le rattacher aux lignes du bon.
- Pour chaque article reçu qui correspond à une ligne du bon, ajoute une entrée dans "matches" avec l'index EXACT de la ligne du bon et la quantité reçue.
- Rattache par code si présent, sinon par désignation (tolère les variations d'orthographe/abréviations).
- Si un article reçu n'a AUCUNE ligne correspondante dans le bon, mets-le dans "extras".
- N'invente jamais de quantités : si illisible, ne crée pas l'entrée.
Réponds UNIQUEMENT en JSON valide : ${SCHEMA}.`;

async function callAnthropic(apiKey: string, system: string, content: any): Promise<any> {
  const resp = await anthropicMessages(apiKey, { max_tokens: 4096, system, messages: [{ role: 'user', content }] });
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
  const poLines: any[] = Array.isArray(body.lines) ? body.lines : [];
  const m = raw.match(/^data:([^;]+);base64,(.*)$/);
  if (m) { media = media || m[1].toLowerCase(); raw = m[2]; }
  if (!raw) return NextResponse.json({ error: 'fichier requis' }, { status: 400 });
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (media === 'image/jpg' || ext === 'jpg' || ext === 'jpeg') media = 'image/jpeg';
  else if (ext === 'png' && !media) media = 'image/png';
  else if (ext === 'webp' && !media) media = 'image/webp';
  const isImage = /^image\/(jpeg|png|webp|gif)$/.test(media) || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  const isPdf = media === 'application/pdf' || ext === 'pdf';
  const isSheet = /spreadsheet|excel|csv/.test(media) || ['xls', 'xlsx', 'csv'].includes(ext);
  if (isImage && !/^image\/(jpeg|png|webp|gif)$/.test(media)) media = 'image/jpeg';

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { try { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore */ } }

  // Contexte : les lignes du bon de commande, avec leur index.
  const linesText = poLines.length
    ? poLines.map((l: any, i: number) => `[${i}] code="${l.code || ''}" désignation="${l.designation || ''}" commandé=${Number(l.quantite) || 0} ${l.unite || ''}`).join('\n')
    : '(aucune ligne fournie)';

  try {
    let data: any;
    const ask = `LIGNES DU BON DE COMMANDE :\n${linesText}\n\nLis le bordereau de réception ci-joint et retourne le JSON des quantités reçues rattachées aux index ci-dessus.`;
    if (isImage) {
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS].join('\n'), [
        { type: 'image', source: { type: 'base64', media_type: media, data: raw } },
        { type: 'text', text: ask },
      ]);
    } else if (isPdf) {
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS].join('\n'), [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: raw } },
        { type: 'text', text: ask },
      ]);
    } else if (isSheet) {
      let csv = '';
      try { const wb = XLSX.read(Buffer.from(raw, 'base64'), { type: 'buffer' }); csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]] || {}); }
      catch { return NextResponse.json({ error: 'Fichier Excel/CSV illisible.' }, { status: 422 }); }
      if (!csv.trim()) return NextResponse.json({ error: 'Fichier vide.' }, { status: 422 });
      data = await callAnthropic(apiKey, [ANTI_INJECTION, SYS].join('\n'), `${ask}\n\nBORDEREAU (CSV) :\n${csv.slice(0, 12000)}`);
    } else {
      return NextResponse.json({ error: 'Format non supporté (image, PDF, Excel ou CSV).' }, { status: 400 });
    }

    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'bons-commande', cost, { feature: 'scan-reception' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const obj = parseJson(text);
    if (!obj) return NextResponse.json({ error: 'Lecture impossible (réponse illisible).' }, { status: 422 });
    return NextResponse.json({
      matches: Array.isArray(obj.matches) ? obj.matches : [],
      extras: Array.isArray(obj.extras) ? obj.extras : [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
 } catch (e: any) {
   return NextResponse.json({ error: `Échec du scan : ${e?.message || e}` }, { status: 500 });
 }
}
