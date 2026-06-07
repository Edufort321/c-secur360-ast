import { NextRequest, NextResponse } from 'next/server';

// #Inventaire — Assistant Prix IA : recherche WEB du prix coutant a jour des articles.
// Proxy SERVEUR de l'appel Anthropic (cle ANTHROPIC_API_KEY cote serveur). Utilise l'outil
// serveur web_search (Anthropic execute les recherches). Le prix web est souvent du prix de
// DETAIL (plus eleve que le cout fournisseur) -> le client laisse l'utilisateur choisir
// "prix IA (web)" ou "prix fournisseur" avant d'appliquer.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const items: any[] = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ error: 'Aucun article a rechercher.' }, { status: 400 });
  if (items.length > 20) return NextResponse.json({ error: `Trop d'articles (${items.length}). Maximum 20 par recherche.` }, { status: 400 });

  const list = items.map((it, i) => `${i + 1}. code="${String(it.code || '').slice(0, 40)}" nom="${String(it.name || '').slice(0, 120)}"${it.supplier ? ` fournisseur="${String(it.supplier).slice(0, 60)}"` : ''}${it.unit ? ` unite="${String(it.unit).slice(0, 20)}"` : ''}`).join('\n');

  const prompt = `Tu es un assistant d'approvisionnement. Recherche sur le WEB le PRIX COUTANT UNITAIRE actuel (CAD, en dollars canadiens si possible, sinon convertis approximativement) de chaque article ci-dessous. Privilegie les fournisseurs industriels / grossistes / distributeurs (pas le detail grand public quand un prix grossiste existe). Indique la source (domaine).

Articles :
${list}

Reponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni backticks, de la forme :
{"prices":[{"code": string, "webPrice": number, "currency": "CAD", "source": string, "confidence": "haute"|"moyenne"|"faible", "note": string}]}
Regles : un objet par article (meme "code" qu'en entree). Si introuvable, webPrice=0 et note explicative. webPrice = nombre simple (pas de symbole). Ne devine pas un prix sans source.`;

  const baseBody: any = {
    model: 'claude-opus-4-8',
    max_tokens: 4000,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: Math.min(20, items.length * 2) }],
    messages: [{ role: 'user', content: prompt }],
  };

  try {
    const messages: any[] = [...baseBody.messages];
    let data: any = null;
    // Boucle de continuation : l'outil serveur peut renvoyer stop_reason "pause_turn" -> on renvoie
    // la reponse de l'assistant telle quelle pour que le serveur reprenne sa boucle de recherche.
    for (let i = 0; i < 6; i++) {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ ...baseBody, messages }),
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        return NextResponse.json({ error: `Appel IA echoue (${resp.status}). ${errText.slice(0, 300)}` }, { status: 502 });
      }
      data = await resp.json();
      if (data?.stop_reason === 'pause_turn' && Array.isArray(data.content)) {
        messages.push({ role: 'assistant', content: data.content });
        continue; // le serveur reprend la recherche
      }
      break;
    }

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
