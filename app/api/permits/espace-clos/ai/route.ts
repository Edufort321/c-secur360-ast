import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { getNorm } from '@/lib/confinedSpace/norms';

// Conseiller IA « espace clos » (à la manière du conseiller AST) + rafraîchissement automatique des
// normes par recherche web. Proxy serveur (clé non exposée), budget scopé au tenant, anti-abus.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const KNOWLEDGE = `Tu es un conseiller expert en SST spécialisé dans le TRAVAIL EN ESPACE CLOS au Canada.
Tu connais à fond CSA Z1006 (gestion du travail en espace clos), les règlements PROVINCIAUX (Québec RSST
section XXVI / CNESST ; Ontario O. Reg. 632/05 ; etc.) et le Code canadien du travail (RCSST partie XI).
Tu raisonnes par les RISQUES (asphyxie/déficience ou enrichissement en O₂, intoxication, perte de
conscience/jugement, incendie/explosion, ensevelissement, dangers mécaniques/électriques, chaleur).
Ordre de test atmosphérique imposé : 1) Oxygène, 2) Gaz/vapeurs inflammables (LIE), 3) Gaz toxiques ;
échantillonnage haut/milieu/bas. Ton FACTUEL, normatif, orienté action — jamais alarmiste.
Adapte SYSTÉMATIQUEMENT à la province fournie et cite les références applicables.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = body.action || 'advise';
  const tenant = String((guard.user as any)?.tenant_id || body.tenant || '').trim();
  if (tenant) { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  const province = String(body.province || 'QC').toUpperCase();
  const norm = getNorm(province);

  try {
    if (action === 'refresh-norms') {
      // Recherche web pour vérifier/actualiser les normes de la province (toujours à jour).
      const prompt = `Recherche les EXIGENCES RÉGLEMENTAIRES ACTUELLES pour le travail en espace clos dans la province/territoire « ${norm.label} » (${province}), Canada.
Donne, en te basant sur des sources officielles récentes (autorité : ${norm.authority}) : les seuils atmosphériques (O₂ min/max %, LIE max %, H₂S max ppm, CO max ppm), l'intervalle de reprise/surveillance recommandé, l'exigence de surveillant et le ratio, l'exigence de surveillance continue, et les références réglementaires exactes (numéros d'articles/règlements à jour).
Réponds en JSON STRICT, sans texte autour :
{"limits":[{"key":"o2","label":"Oxygène (O₂)","unit":"%","min":19.5,"max":23.0},{"key":"lel","label":"Gaz inflammables (LIE)","unit":"% LIE","max":10},{"key":"h2s","label":"H₂S","unit":"ppm","max":10},{"key":"co","label":"CO","unit":"ppm","max":35}],"defaultRetestMinutes":15,"attendantPerEntrants":2,"continuousMonitoring":true,"regulations":["..."],"notes":"...","citations":[{"title":"...","url":"..."}]}`;
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), max_tokens: 2048, system: KNOWLEDGE,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }],
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 }); }
      const data = await resp.json();
      if (tenant) { try { const c = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage, 4); if (c > 0) await recordAiUsage(tenant, 'permits', c, { feature: 'norm-refresh', province }); } catch {} }
      const parsed = extractJson(data);
      if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });
      return NextResponse.json({ ok: true, province, norm: { ...norm, ...parsed, source: 'ai', updatedAt: new Date().toISOString() }, citations: parsed.citations || [] });
    }

    // action 'advise' : à partir de la CARACTÉRISATION COMPLÈTE de l'espace, produit une évaluation des
    // risques structurée + moyens de maîtrise + plan de sauvetage + plan d'action. Le contexte fourni est
    // essentiel : sans lui, l'analyse n'a aucune valeur. (Sécurité critique.)
    const space = body.space || {};
    const prompt = `Province : ${norm.label} (${province}). Autorité : ${norm.authority}. Réfs : ${norm.regulations.join(' ; ')}.
Tu reçois la CARACTÉRISATION d'un espace clos. Analyse-la EN PROFONDEUR (type, usage normal, dernier contenu/résidus, dimensions/accès/configuration, sources d'énergie, ventilation, dangers cochés) et produis une évaluation professionnelle, exhaustive et prudente. Si une information manque, signale-la dans "missing_info".

CARACTÉRISATION FOURNIE :
${JSON.stringify(space, null, 1)}

Réponds en JSON STRICT, sans texte autour :
{"characteristics":{"synthese":"résumé technique de l'espace et de son usage","particularites":"config/accès/contenu notables"},
 "hazards":[{"category":"atmosphérique|ensevelissement|mécanique|électrique|thermique|chute|noyade|bruit|chimique|autre","danger":"description précise","source":"origine du danger"}],
 "risk_evaluation":[{"hazard":"…","probability":"faible|moyenne|élevée","severity":"mineure|grave|mortelle","level":"faible|moyen|élevé|critique","control":"mesure qui réduit ce risque"}],
 "controls":["mesures de maîtrise prioritaires (élimination/ventilation/cadenassage LOTO/EPI/détection continue/communication)"],
 "atmospheric_focus":["gaz/paramètres à surveiller en priorité pour CET espace, avec pourquoi"],
 "rescue":{"strategy":"plan de sauvetage — privilégier le sauvetage SANS entrée (treuil/trépied/harnais récupérateur)","type":"sans entrée|avec entrée","equipment":["…"],"team":"qui (interne/911/équipe spécialisée)","contacts":"numéros/qui alerter","nearest_hospital":"à préciser par l'employeur","notes":""},
 "action_plan":["étapes séquentielles AVANT/PENDANT/APRÈS l'entrée (isolement, purge, ventilation, tests, surveillance, communication, fermeture)"],
 "recommended_retest_minutes": ${norm.defaultRetestMinutes},
 "risk_level":"faible|moyen|élevé|critique",
 "missing_info":["informations manquantes à obtenir pour sécuriser l'entrée"],
 "rationale_fr":"justification synthétique selon la norme de la province"}`;
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), max_tokens: 3500, system: KNOWLEDGE, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const c = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (c > 0) await recordAiUsage(tenant, 'permits', c, { feature: 'espace-clos-advise' }); } catch {} }
    const parsed = extractJson(data);
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });
    return NextResponse.json({ ok: true, advice: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}

function extractJson(data: any): any {
  const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
  const s = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch { return null; } } return null; }
}
