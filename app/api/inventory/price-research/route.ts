import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// #Inventaire — Assistant Prix IA : recherche WEB du prix coutant a jour des articles.
// Proxy SERVEUR de l'appel Anthropic (cle ANTHROPIC_API_KEY cote serveur). Utilise l'outil
// serveur web_search (Anthropic execute les recherches). Le prix web est souvent du prix de
// DETAIL (plus eleve que le cout fournisseur) -> le client laisse l'utilisateur choisir
// "prix IA (web)" ou "prix fournisseur" avant d'appliquer.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const items: any[] = Array.isArray(body.items) ? body.items : [];
  const tenant = String((guard.user?.tenant_id) || body.tenant || '').trim();
  if (!items.length) return NextResponse.json({ error: 'Aucun article a rechercher.' }, { status: 400 });
  if (items.length > 20) return NextResponse.json({ error: `Trop d'articles (${items.length}). Maximum 20 par recherche.` }, { status: 400 });

  // FORFAIT IA : on bloque si le budget du client est epuise (sauf "illimite" = pas de forfait configure).
  if (tenant) {
    const budget = await getAiBudget(tenant);
    if (budget.exhausted) {
      return NextResponse.json({ error: 'Forfait IA épuisé — renouvelez votre forfait.', exhausted: true, remainingCents: 0 }, { status: 402 });
    }
  }

  const list = items.map((it, i) => `${i + 1}. code="${String(it.code || '').slice(0, 40)}" nom="${String(it.name || '').slice(0, 120)}"${it.supplier ? ` fournisseur="${String(it.supplier).slice(0, 60)}"` : ''}`).join('\n');

  // Prompt COMPACT (moins de tokens). Sortie JSON minimale.
  const prompt = `Recherche le PRIX COUTANT unitaire actuel (CAD) de chaque article (fournisseurs industriels/grossistes en priorite). 1 recherche par article au plus.
Articles :
${list}
Reponds UNIQUEMENT en JSON, sans texte ni backticks :
{"prices":[{"code":string,"webPrice":number,"source":string,"confidence":"haute"|"moyenne"|"faible"}]}
Un objet par article (meme code). Introuvable -> webPrice:0. webPrice = nombre sans symbole. Ne devine pas sans source.`;

  const baseBody: any = {
    // OPTIMISATION COUTS : Sonnet 4.6 (moins cher qu'Opus, supporte la recherche web), sortie courte,
    // 1 recherche web par article max (la recherche web est facturee a l'unite).
    max_tokens: 1500,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: Math.min(12, items.length) }],
    messages: [{ role: 'user', content: prompt }],
  };

  try {
    const messages: any[] = [...baseBody.messages];
    let data: any = null;
    let costCents = 0; // cout cumule de l'appel (tokens + recherches web) pour le forfait IA
    // Boucle de continuation : l'outil serveur peut renvoyer stop_reason "pause_turn" -> on renvoie
    // la reponse de l'assistant telle quelle pour que le serveur reprenne sa boucle de recherche.
    for (let i = 0; i < 6; i++) {
      const resp = await anthropicMessages(apiKey, { ...baseBody, messages });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        return NextResponse.json({ error: `Appel IA echoue (${resp.status}). ${errText.slice(0, 300)}` }, { status: 502 });
      }
      data = await resp.json();
      // Cout de cette iteration : tokens (usage) + recherches web ($10/1000).
      const searches = (data?.content || []).filter((b: any) => b?.type === 'server_tool_use' && b?.name === 'web_search').length;
      costCents += aiCallCostCents(baseBody.model, data?.usage, searches);
      if (data?.stop_reason === 'pause_turn' && Array.isArray(data.content)) {
        messages.push({ role: 'assistant', content: data.content });
        continue; // le serveur reprend la recherche
      }
      break;
    }
    // Enregistre la consommation IA (module inventaire) sur le forfait du tenant.
    if (tenant && costCents > 0) { await recordAiUsage(tenant, 'inventaire', costCents, { feature: 'price-research', items: items.length }); }

    const text = (data?.content || []).filter((b: any) => b?.type === 'text').map((b: any) => b.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch {
      const m = jsonStr.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });

    const prices = Array.isArray(parsed.prices) ? parsed.prices : (Array.isArray(parsed) ? parsed : []);
    return NextResponse.json({ ok: true, prices });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
