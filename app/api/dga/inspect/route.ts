import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';
import { extractJsonValue } from '@/lib/aiJson';

// #DGA — Aide technique IA pour l'inspection de routine d'un transformateur à l'huile.
// À partir des points en ANOMALIE relevés, propose des correctifs concrets (cause probable +
// action). Connaissances : IEEE C57.93/C57.152, IEC 60076, NETA MTS, pratiques d'entretien.
// Proxy serveur (clé non exposée).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 45;

const SYSTEM = `Tu es un ingénieur d'entretien expert en transformateurs de puissance à l'huile (IEEE C57.93 guide d'entretien, C57.152 essais terrain, IEC 60076, NETA MTS). On te donne les points en ANOMALIE relevés lors d'une inspection visuelle de routine (avec parfois des mesures et des notes). Pour CHAQUE anomalie, donne une recommandation de correctif concrète, proportionnée et sécuritaire : cause probable + action corrective (et essai/vérification de confirmation au besoin). Reste FACTUEL et MESURÉ, ton d'ingénieur, jamais alarmiste. Priorise par criticité (sécurité/diélectrique d'abord).
Réponds en JSON STRICT, sans texte autour : {"summaryFr": "...", "summaryEn": "...", "actionsFr": ["..."], "actionsEn": ["..."]}.
summaryFr/En = 1-3 phrases de synthèse. actionsFr/En = liste de correctifs (1 par anomalie ou regroupés).`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const dossier = body.dossier || {};
  const anomalies = Array.isArray(body.anomalies) ? body.anomalies : [];
  if (!anomalies.length) return NextResponse.json({ error: 'Aucune anomalie à analyser' }, { status: 400 });
  const tenant = String((guard.user?.tenant_id) || body.tenant || dossier.tenant_id || '').trim();
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  const userMsg = `Équipement : ${JSON.stringify({ ident: dossier.ident, kv: dossier.kv, mva: dossier.mva, oil_type: dossier.oil_type, manufacturer: dossier.manufacturer, year: dossier.year })}
Anomalies relevées (catégorie · point · note/mesure) :
${anomalies.map((a: any, i: number) => `${i + 1}. [${a.category || ''}] ${a.label}${a.note ? ' — ' + a.note : ''}`).join('\n')}
Donne les correctifs.`;

  try {
    const resp = await anthropicMessages(apiKey, { max_tokens: 2048, system: SYSTEM, messages: [{ role: 'user', content: userMsg }] });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (cost > 0) await recordAiUsage(tenant, 'dga', cost, { feature: 'inspect' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const parsed = extractJsonValue(text);
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });
    return NextResponse.json({ ok: true, advice: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur analyse' }, { status: 500 });
  }
}
