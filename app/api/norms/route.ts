import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { scopeForModule } from '@/lib/norms/registry';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// Assistant « Normes à jour » — fournit, selon le module en cours, les normes/standards et la
// LÉGISLATION applicable, TOUJOURS à jour, via l'outil serveur web_search (Anthropic exécute les
// recherches sur les sources officielles). Précision et législation = priorité : on cite la
// référence exacte, l'autorité, la date de dernière mise à jour et l'URL officielle, et on rappelle
// que la SOURCE OFFICIELLE PRÉVAUT. Proxy serveur (clé Anthropic non exposée).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = String((guard.user?.tenant_id) || body.tenant || '').trim();
  const province = String(body.province || 'QC').trim().toUpperCase();
  const userQuery = String(body.query || '').slice(0, 300).trim();
  const { key, scope } = scopeForModule(body.module);

  if (tenant) {
    const budget = await getAiBudget(tenant);
    if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — renouvelez votre forfait.', exhausted: true }, { status: 402 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Nous sommes le ${today}. Province de référence : ${province} (Canada).
Module en cours : « ${scope.label} » — ${scope.scope}
Référentiels à vérifier EN PRIORITÉ (donne la version EN VIGUEUR aujourd'hui) :
${scope.focus.map(f => `- ${f}`).join('\n')}
Sources officielles à privilégier : ${scope.authorities.join(', ')}.
${userQuery ? `Question précise de l'utilisateur : « ${userQuery} »\n` : ''}
Utilise la recherche web pour CONFIRMER la version actuellement en vigueur (les lois et normes changent). Vérifie les dates de dernière mise à jour. N'invente jamais une référence ou un article : si tu n'es pas sûr, indique-le.
Réponds UNIQUEMENT en JSON valide (sans texte ni backticks) :
{"asOf":"${today}","province":"${province}","module":"${scope.label}",
 "items":[{"ref":"<référence exacte: loi/règlement + article ou norme + édition>","title":"<titre court>","type":"loi"|"règlement"|"norme"|"guide","authority":"<autorité>","summary":"<exigence clé en 1-2 phrases>","url":"<URL officielle>","lastUpdate":"<AAAA-MM-JJ ou édition, si connue>"}],
 "keyObligations":["<obligation concrète et actionnable>"],
 "disclaimer":"Information indicative à jour au mieux de la recherche; la source officielle et la version en vigueur prévalent. Validez avec votre responsable SST/juridique."}
Donne 4 à 8 items pertinents, du plus important au moins important.`;

  const baseBody: any = {
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }],
    messages: [{ role: 'user', content: prompt + '\n' + ANTI_INJECTION }],
  };

  try {
    const messages: any[] = [...baseBody.messages];
    let data: any = null;
    let costCents = 0;
    for (let i = 0; i < 6; i++) {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ ...baseBody, messages }),
      });
      if (!resp.ok) { const e = await resp.text().catch(() => ''); return NextResponse.json({ error: `Appel IA échoué (${resp.status}). ${e.slice(0, 250)}` }, { status: 502 }); }
      data = await resp.json();
      const searches = (data?.content || []).filter((b: any) => b?.type === 'server_tool_use' && b?.name === 'web_search').length;
      costCents += aiCallCostCents(baseBody.model, data?.usage, searches);
      if (data?.stop_reason === 'pause_turn' && Array.isArray(data.content)) { messages.push({ role: 'assistant', content: data.content }); continue; }
      break;
    }
    if (tenant && costCents > 0) { await recordAiUsage(tenant, key === 'general' ? 'normes' : key, costCents, { feature: 'norms' }); }

    const text = (data?.content || []).filter((b: any) => b?.type === 'text').map((b: any) => b.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch { const m = jsonStr.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } } }
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non exploitable', raw: text.slice(0, 400) }, { status: 422 });

    return NextResponse.json({ ok: true, ...parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur recherche de normes' }, { status: 500 });
  }
}
