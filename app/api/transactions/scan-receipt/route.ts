import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';

// « Scanner le reçu (IA) » : OCR d'une pièce jointe (reçu/facture) via Claude Vision, pour PRÉ-REMPLIR
// la transaction ET servir de contrôle comptable (comparaison reçu vs saisie). Proxy SERVEUR (clé
// Anthropic jamais côté navigateur), budget IA scopé au tenant. Québec : TPS 5 %, TVQ 9,975 %.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  // imageBase64 = data URL ("data:image/png;base64,...") ou base64 brut ; media_type optionnel.
  let raw = String(body.imageBase64 || '');
  let media = String(body.media_type || '');
  const m = raw.match(/^data:([^;]+);base64,(.*)$/);
  if (m) { media = media || m[1]; raw = m[2]; }
  if (!raw) return NextResponse.json({ error: 'imageBase64 requis' }, { status: 400 });
  if (!media) media = 'image/jpeg';
  if (!/^image\/(jpeg|png|webp|gif)$/.test(media)) return NextResponse.json({ error: 'Format image non supporté (JPEG/PNG/WebP/GIF). Pour un PDF, fournissez une image.' }, { status: 400 });

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); }

  const system = [
    ANTI_INJECTION,
    `Tu es un assistant COMPTABLE. On te donne l'IMAGE d'un reçu/facture. Extrais les informations pour pré-remplir une transaction d'une entreprise québécoise (TPS 5 %, TVQ 9,975 %). Réponds UNIQUEMENT en JSON valide, sans texte autour :
{"vendor":"nom du commerce/fournisseur","date":"AAAA-MM-JJ","currency":"CAD|USD|...","subtotal":nombre,"gst":nombre,"qst":nombre,"pst":nombre,"total":nombre,"type":"expense|revenue","category_hint":"nature de la dépense (ex. essence, restaurant, fournitures)","description":"libellé court","confidence":"high|medium|low"}
Règles : montants en nombres (pas de symbole), point décimal. Si une taxe est absente, mets 0. Si une valeur est illisible, mets null. N'invente pas. Le total inclut les taxes.`,
  ].join('\n');

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 1200, system,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: media, data: raw } },
          { type: 'text', text: 'Extrais les informations de ce reçu en JSON.' },
        ] }],
      }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'transactions', cost, { feature: 'scan-receipt' }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    let extracted: any = null;
    const jm = text.match(/\{[\s\S]*\}/);
    try { extracted = JSON.parse(jm ? jm[0] : text); } catch { extracted = null; }
    if (!extracted) return NextResponse.json({ error: 'Lecture du reçu impossible (réponse illisible).' }, { status: 422 });
    return NextResponse.json({ extracted });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
