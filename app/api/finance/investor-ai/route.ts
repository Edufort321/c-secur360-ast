import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';
import { extractJsonValue } from '@/lib/aiJson';

// Analyse IA « investisseur / crise » (#33) : on envoie valorisation, bilan, EBITDA/CAPEX, Altman Z
// et la dilution simulée ; l'IA renvoie lecture investisseur, risques de crise et recommandations
// FROIDES (restructuration, contrôle des dépenses, CAPEX vs libérer du staff), alertes anticipées.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
const SCHEMA = `{"valuationView":"2-3 phrases sur la valeur et sa crédibilité","investmentThesis":["argument pour un investisseur"],"crisisRisk":"faible|moyen|eleve|critique","earlyWarnings":[{"severity":"info|warning|critical","title":"court","detail":"chiffré, AVANT que ça se dégrade"}],"recommendations":[{"action":"décision froide","rationale":"impact chiffré (marge/runway/payback)"}]}`;
const SYS = `Tu es un ANALYSTE FINANCIER / banquier d'affaires FROID et OBJECTIF pour une PME de services SST/industriels au Québec. Tu prépares un dossier pour (a) une VENTE D'ACTIONS / entrée d'investisseur et (b) la PRÉVENTION DE CRISE.
On te fournit : valorisation (multiple d'EBITDA), EBITDA/EBIT/CAPEX, bilan agrégé, score d'Altman Z'' (zone), et une éventuelle simulation de dilution.
Analyse :
- VALORISATION : la valeur est-elle crédible vs le multiple et la marge ? Qu'est-ce qui la soutient ou la fragilise ?
- THÈSE D'INVESTISSEMENT : 2-4 arguments concrets pour un investisseur (croissance, marge, récurrence, actifs).
- CRISE : à partir du Z'' et des tendances, évalue le risque. Donne des ALERTES PRÉCOCES, AVANT la détresse (runway, fonds de roulement négatif, EBITDA en baisse, dette/capitaux).
- DÉCISIONS FROIDES : restructuration, contrôle des dépenses, CAPEX (maintenance/équipement) VS libérer du staff — tranche selon la RENTABILITÉ pure, chiffre l'impact (marge, payback, runway). Jusqu'à la décision de cessation si les chiffres l'imposent, mais alerte bien avant.
Concis. Réponds UNIQUEMENT en JSON valide : ${SCHEMA}.`;

function parseJson(text: string): any { return extractJsonValue(text); }

export async function POST(req: NextRequest) {
 try {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const d = body.data || {};
  const tenant = guard.user?.tenant_id || '';
  if (tenant) { try { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); } catch { /* ignore */ } }

  const v = d.valuation || {}; const bs = d.balanceSheet || {}; const z = d.altman || {}; const sim = d.simulation;
  const ctx = `VALORISATION :
- EBITDA: ${Math.round(d.ebitda || 0)}$ | EBIT: ${Math.round(d.ebit || 0)}$ | CA: ${Math.round(d.revenue || 0)}$ | CAPEX: ${Math.round(d.capex || 0)}$
- Multiple appliqué: ${(v.multiple || 0)}x → Valeur d'entreprise: ${Math.round(v.enterpriseValue || 0)}$ | Capitaux propres: ${Math.round(v.equityValue || 0)}$
- Actions en circulation: ${Math.round(v.sharesOutstanding || 0)} → Prix/action: ${(v.pricePerShare || 0).toFixed(2)}$ | Dette nette: ${Math.round(v.netDebt || 0)}$

BILAN :
- Actif total: ${Math.round(bs.totalAssets || 0)}$ (courant ${Math.round(bs.currentAssets || 0)}$) | Passif total: ${Math.round(bs.totalLiabilities || 0)}$ (courant ${Math.round(bs.currentLiabilities || 0)}$)
- Capitaux propres: ${Math.round(bs.equity || 0)}$ | BNR: ${Math.round(bs.retainedEarnings || 0)}$ | Trésorerie: ${Math.round(bs.cash || 0)}$ | Fonds de roulement: ${Math.round((bs.currentAssets || 0) - (bs.currentLiabilities || 0))}$

ALTMAN Z'': ${(z.z || 0).toFixed(2)} (zone: ${z.zone || 'n/d'} — ${z.label || ''})${sim ? `

DILUTION SIMULÉE : pré-money ${Math.round(sim.preMoney || 0)}$ + investissement ${Math.round(sim.investment || 0)}$ → post-money ${Math.round(sim.postMoney || 0)}$ ; nouvel investisseur ${ (sim.newInvestorPct || 0).toFixed(1)}%` : ''}`;

  try {
    const resp = await anthropicMessages(apiKey, { max_tokens: 2048, system: [ANTI_INJECTION, SYS].join('\n'), messages: [{ role: 'user', content: ctx }] });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 200)}`); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'finance', cost, { feature: 'investor' }); } catch { /* best-effort */ } }
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
