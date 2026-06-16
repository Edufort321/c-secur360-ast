import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// Analyse IA « dirigeant » du portefeuille de projets : on envoie les KPIs agrégés + la marge par projet,
// l'IA renvoie un diagnostic (projets non profitables, meilleures/pires ventes, risques, recommandations).
// Proxy SERVEUR (clé Anthropic jamais côté navigateur), budget IA scopé au tenant.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';
const SCHEMA = `{"health":"excellent|bon|a_surveiller|critique","summary":"2-3 phrases pour un dirigeant","insights":[{"severity":"info|warning|critical","title":"court","detail":"explication chiffrée"}],"unprofitable":[{"number":"n° projet","reason":"pourquoi non profitable","action":"correctif concret"}],"recommendations":["action priorisée"]}`;
const SYS = `Tu es un CONTRÔLEUR DE GESTION expérimenté (entreprise de services SST/industriels au Québec). On te fournit les indicateurs d'un portefeuille de projets et la marge par projet. Donne une analyse de DIRIGEANT : santé globale, projets non profitables (marge négative ou faible) avec correctif concret, meilleures vs pires performances, taux de conversion soumission→projet, et 3 à 6 recommandations priorisées et actionnables. Sois concis, chiffré, sans bla-bla. Réponds UNIQUEMENT en JSON valide : ${SCHEMA}.`;

function parseJson(text: string): any { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m ? m[0] : text); } catch { return null; } }

export async function POST(req: NextRequest) {
 try {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const a = body.analytics || {};

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { try { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore */ } }

  // On résume le portefeuille en texte compact (limité aux 40 projets les plus significatifs en marge).
  const metrics: any[] = Array.isArray(a.metrics) ? a.metrics.slice(0, 40) : [];
  const lines = metrics.map((m: any) => `${m.number} | ${m.status} | contrat ${Math.round(m.contract)}$ | coût ${Math.round(m.cost)}$ | marge ${Math.round(m.margin)}$ (${(m.marginPct || 0).toFixed(1)}%)${m.hasFinancials ? '' : ' [finances incomplètes]'}`).join('\n');
  const ctx = `PORTEFEUILLE (KPIs):
- Projets: ${a.count ?? 0}  | en soumission: ${a.quotedCount ?? 0}  | gagnés: ${a.wonCount ?? 0}  | conversion: ${(a.conversionPct ?? 0).toFixed(1)}%
- Valeur contrats: ${Math.round(a.contractTotal ?? 0)}$ | WIP (en cours): ${Math.round(a.wipValue ?? 0)}$ | facturé: ${Math.round(a.invoicedValue ?? 0)}$
- Coûts réels: ${Math.round(a.costTotal ?? 0)}$ | marge totale: ${Math.round(a.marginTotal ?? 0)}$ | marge moy.: ${(a.avgMarginPct ?? 0).toFixed(1)}%
- Projets non profitables: ${(a.unprofitable || []).length}

MARGE PAR PROJET (${metrics.length}):
${lines || '(aucune donnée financière)'}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2048, system: [ANTI_INJECTION, SYS].join('\n'), messages: [{ role: 'user', content: ctx }] }),
    });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'projects', cost, { feature: 'analytics' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const obj = parseJson(text);
    if (!obj) return NextResponse.json({ error: 'Analyse illisible.' }, { status: 422 });
    return NextResponse.json({ analysis: obj });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
 } catch (e: any) {
   return NextResponse.json({ error: `Échec de l'analyse : ${e?.message || e}` }, { status: 500 });
 }
}
