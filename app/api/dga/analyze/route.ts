import { NextRequest, NextResponse } from 'next/server';

// #DGA — Analyseur IA expert. Connaissances normatives intégrées (IEEE C57.104, IEC 60599, Duval,
// Rogers, Doernenburg, qualité d'huile, furannes/DP, tendances). Proxy serveur (clé non exposée).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const KNOWLEDGE = `Tu es un ingénieur expert en diagnostic d'huile de transformateur (DGA + qualité d'huile).
Base tes conclusions sur les normes suivantes (intégrées) et sur la TENDANCE dans le temps, pas seulement la dernière valeur.

IEEE C57.104 — Conditions 1-4 (ppm) [C1<= / C2<= / C3<=, sinon C4] :
 H2 100/700/1800 · CH4 120/400/1000 · C2H6 65/100/150 · C2H4 50/100/200 · C2H2 35/50/80 · CO 350/570/1400 · CO2 2500/4000/10000 · TDCG 720/1920/4630 (TDCG = H2+CH4+C2H6+C2H4+C2H2+CO).

Triangle de Duval 1 (%CH4,%C2H2,%C2H4) : PD décharges partielles ; D1 décharges faible énergie ; D2 arc (forte énergie) ; T1 thermique <300°C ; T2 300-700°C ; T3 >700°C ; DT mélange.
Gaz dominant (Key Gas) : H2→PD ; C2H2→arc ; C2H4→surchauffe élevée ; CH4→surchauffe modérée ; CO/CO2→dégradation cellulose (papier).
Rogers (R1=CH4/H2, R2=C2H2/C2H4, R5=C2H4/C2H6) et IEC 60599 (C2H2/C2H4, CH4/H2, C2H4/C2H6) pour confirmer le type de défaut.
Doernenburg pour confirmer PD vs thermique vs arc.
Taux de génération de gaz (ppm/jour ou /mois entre échantillons) : une hausse rapide est plus grave que des valeurs élevées stables.

Qualité d'huile : humidité (ppm eau — risque si élevé selon classe kV), acidité (mg KOH/g, vieillissement), IFT (tension interfaciale, baisse = dégradation), rigidité diélectrique D1816/D877 (kV, baisse = contamination/eau), couleur, facteur de puissance PF 25/100°C, densité. Furannes (2-FAL surtout) → estimation du degré de polymérisation (DP) et du vieillissement du papier (2-FAL > ~1-2 ppm = vieillissement avancé).

TON ET STYLE (important) : reste FACTUEL et MESURÉ, jamais alarmiste ou sensationnaliste. Décris ce que disent les
normes et les résultats, sans dramatiser. Évite les mots à charge émotive ("catastrophique", "danger imminent",
"explosion", etc.) sauf si une norme l'exige explicitement. Formule les constats en termes de condition normalisée
(IEEE 1-4), de type de défaut probable et de tendance, puis des recommandations concrètes et proportionnées.
Le ton doit rester professionnel d'ingénieur, neutre, orienté action.

Donne une analyse claire, priorisée, actionnable. Réponds en JSON STRICT, sans texte autour :
{"severity": 1|2|3|4, "faultType": "...", "trend": "stable|hausse|hausse rapide|baisse",
 "summaryFr": "...", "summaryEn": "...",
 "recommendationsFr": ["..."], "recommendationsEn": ["..."],
 "retestMonths": number}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const dossier = body.dossier || {};
  const measures = Array.isArray(body.measures) ? body.measures : [];
  if (!measures.length) return NextResponse.json({ error: 'Aucune mesure a analyser' }, { status: 400 });

  const userMsg = `Équipement : ${JSON.stringify({ ident: dossier.ident, client: dossier.client, serie: dossier.serie, kv: dossier.kv, mva: dossier.mva, oil_type: dossier.oil_type, manufacturer: dossier.manufacturer, year: dossier.year })}
Historique des mesures (ancien -> récent) : ${JSON.stringify(measures)}
Analyse l'évolution et donne ton diagnostic expert.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: KNOWLEDGE,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });
    if (!resp.ok) {
      const e = await resp.text();
      return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 });
    }
    const data = await resp.json();
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch { const m = jsonStr.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } } }
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });
    return NextResponse.json({ ok: true, analysis: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur analyse' }, { status: 500 });
  }
}
