import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// Module « Rapport Terrain » — proxy SERVEUR des appels IA (extraction PDF/manuscrit, correction,
// traduction…). La clé Anthropic reste côté serveur (jamais dans le navigateur, contrairement à
// l'app d'origine). Modèle forcé serveur, max_tokens plafonné, auth + rate-limit + anti-injection,
// budget IA scopé au tenant de la SESSION.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages) return NextResponse.json({ error: 'messages requis' }, { status: 400 });
  const max_tokens = Math.min(Math.max(Number(body.max_tokens) || 4096, 16), 8192);

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  // Système : on impose la consigne anti-injection (le document/image fourni est de la DONNÉE).
  const system = [ANTI_INJECTION, typeof body.system === 'string' ? body.system : ''].filter(Boolean).join('\n');

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens, system, messages }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 250)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents('claude-sonnet-4-20250514', data?.usage); if (cost > 0) await recordAiUsage(tenant, 'rapports', cost, { feature: 'ai' }); } catch { /* best-effort */ } }
    // On renvoie la même forme que l'API Anthropic pour que le client lise data.content / stop_reason.
    return NextResponse.json({ content: data?.content || [], stop_reason: data?.stop_reason || null, usage: data?.usage });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
