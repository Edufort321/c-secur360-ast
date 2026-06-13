import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { getPermitNorm, PROV_LABELS, type Prov } from '@/lib/permits/norms';

// Conseiller IA GÉNÉRIQUE pour TOUS les types de permis (travail à chaud, LOTO, électrique, hauteur,
// excavation, chimique, pression). Adapté au type + province. Action 'refresh-norms' = MAJ par web.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM = `Tu es un conseiller expert en SST (santé-sécurité au travail) au Canada, spécialiste des PERMIS DE TRAVAIL.
Tu connais à fond CSA Z460 (cadenassage), CSA Z462 / NFPA 70E (électrique/arc flash), NFPA 51B (travail à chaud),
CSA Z259 (chutes), CSTC et RSST (Québec), O.Reg (Ontario) et les règlements OHS provinciaux, CSA B51 (pression),
SIMDUT/SGH (chimique). Tu raisonnes par les RISQUES et la hiérarchie des mesures (élimination > ingénierie >
administratif > EPI). Ton FACTUEL, normatif, orienté action — jamais alarmiste. Adapte à la province fournie.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const type = String(body.type || '');
  const norm = getPermitNorm(type);
  if (!norm) return NextResponse.json({ error: 'Type de permis inconnu' }, { status: 400 });
  const province = String(body.province || 'QC').toUpperCase() as Prov;
  const provLabel = PROV_LABELS[province] || province;
  const action = body.action || 'advise';
  const tenant = String((guard.user as any)?.tenant_id || body.tenant || '').trim();
  if (tenant) { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  try {
    if (action === 'refresh-norms') {
      const prompt = `Recherche les EXIGENCES RÉGLEMENTAIRES ACTUELLES pour un permis « ${norm.labelFr} » dans « ${provLabel} » (${province}), Canada (autorités : ${norm.authorities.join(', ')}). Donne références exactes à jour + check-list normalisée + paramètres clés.
Réponds en JSON STRICT : {"references":["…"],"checklist":["…"],"params":{},"citations":[{"title":"","url":""}]}`;
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2048, system: SYSTEM, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }], messages: [{ role: 'user', content: prompt }] }),
      });
      if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 }); }
      const data = await resp.json();
      if (tenant) { try { const c = aiCallCostCents('claude-sonnet-4-20250514', data?.usage, 4); if (c > 0) await recordAiUsage(tenant, 'permits', c, { feature: 'norm-refresh', type, province }); } catch {} }
      const parsed = extractJson(data); if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });
      return NextResponse.json({ ok: true, type, province, ...parsed });
    }

    const ctx = body.context || {};
    const prompt = `Type de permis : ${norm.labelFr}. Province : ${provLabel} (${province}). Réfs de base : ${norm.references.join(' ; ')}.
Contexte expert : ${norm.aiHints}
Check-list normalisée de référence : ${norm.checklist.join(' | ')}
Contexte des travaux fourni : ${JSON.stringify(ctx)}
Produis une analyse SST complète et prudente. Réponds en JSON STRICT, sans texte autour :
{"hazards":[{"danger":"","source":""}],
 "risk_evaluation":[{"hazard":"","probability":"faible|moyenne|élevée","severity":"mineure|grave|mortelle","level":"faible|moyen|élevé|critique","control":""}],
 "controls":["mesures de maîtrise priorisées (hiérarchie)"],
 "checklist":["check-list pré-travaux adaptée à CE contexte (complète la référence)"],
 "ppe":["EPI requis"],
 "action_plan":["étapes AVANT/PENDANT/APRÈS"],
 "risk_level":"faible|moyen|élevé|critique",
 "missing_info":["infos manquantes à obtenir"],
 "rationale_fr":"justification selon la norme/province"}`;
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 3000, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const c = aiCallCostCents('claude-sonnet-4-20250514', data?.usage); if (c > 0) await recordAiUsage(tenant, 'permits', c, { feature: 'advise', type }); } catch {} }
    const parsed = extractJson(data); if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });
    return NextResponse.json({ ok: true, type, advice: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}

function extractJson(data: any): any {
  const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
  const s = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch { return null; } } return null; }
}
