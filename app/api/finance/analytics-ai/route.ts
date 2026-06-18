import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// Analyse IA « dirigeant » de l'état financier : on envoie les KPIs + la série temporelle,
// l'IA renvoie santé financière, tendances, risques (marge, masse salariale, trésorerie) et recommandations.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"health":"excellent|bon|a_surveiller|critique","summary":"2-3 phrases dirigeant","insights":[{"severity":"info|warning|critical","title":"court","detail":"chiffré"}],"recommendations":["action priorisée"]}`;
const SYS = `Tu es un DIRECTEUR FINANCIER (CFO) FROID et OBJECTIF pour une PME de services SST/industriels au Québec. Seul critère : la RENTABILITÉ. On te fournit les KPIs + une série temporelle (CA, charges, marge, masse salariale, croissance) — possiblement sur PLUSIEURS ANNÉES.
Analyse :
- TENDANCES PLURIANNUELLES (année sur année) et SAISONNALITÉ : identifie les PÉRIODES CREUSES récurrentes.
- À chaque DÉCISION importante, tranche FROIDEMENT selon la rentabilité, ex. « investir maintenant en CAPEX (maintenance/équipement) » VS « libérer/réduire du staff » : chiffre l'impact sur la marge, le payback, le runway. Recommandation financière pure, sans complaisance.
- Anticipe : alertes AVANT que ça se dégrade (marge↓, runway court, ratio masse salariale/CA trop élevé en période creuse).
Donne santé globale, tendances chiffrées, risques, et 3 à 6 recommandations PRIORISÉES, actionnables et chiffrées (ROI/impact). Concis. Réponds UNIQUEMENT en JSON valide : ${SCHEMA}.`;

function parseJson(text: string): any { const m = text.match(/\{[\s\S]*\}/); try { return JSON.parse(m ? m[0] : text); } catch { return null; } }

export async function POST(req: NextRequest) {
 try {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const a = body.analytics || {};
  const tenant = guard.user?.tenant_id || '';
  if (tenant) { try { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore */ } }

  const periods: any[] = Array.isArray(a.periods) ? a.periods.slice(-48) : []; // jusqu'à ~4 ans pour tendances YoY/saisonnalité
  const series = periods.map((p: any) => `${p.label}: CA ${Math.round(p.revenue)}$ | charges ${Math.round(p.expense)}$ | marge ${Math.round(p.margin)}$ | paie ${Math.round(p.payroll)}$${p.growthPct != null ? ` | crois. ${p.growthPct.toFixed(1)}%` : ''}`).join('\n');
  const ctx = `KPIs (${body.granularityLabel || ''}) :
- CA total: ${Math.round(a.revenueTotal || 0)}$ | Charges: ${Math.round(a.expenseTotal || 0)}$ | Marge: ${Math.round(a.marginTotal || 0)}$ (${(a.marginPct || 0).toFixed(1)}%)
- Masse salariale: ${Math.round(a.payrollTotal || 0)}$ (${(a.payrollPct || 0).toFixed(1)}% du CA)
- Croissance (dernière période): ${a.growthPct != null ? a.growthPct.toFixed(1) + '%' : 'n/d'}
- Trésorerie: ${Math.round(a.cash || 0)}$ | Créances: ${Math.round(a.arTotal || 0)}$ | Dettes: ${Math.round(a.apTotal || 0)}$

SÉRIE (${periods.length} périodes) :
${series || '(aucune donnée)'}`;

  try {
    const resp = await anthropicMessages(apiKey, { max_tokens: 2048, system: [ANTI_INJECTION, SYS].join('\n'), messages: [{ role: 'user', content: ctx }] });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'finance', cost, { feature: 'analytics' }); } catch { /* best-effort */ } }
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
