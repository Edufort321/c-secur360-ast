import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';

// IA du module Accidents/Incidents — proxy SERVEUR (clé Anthropic jamais exposée). Actions :
//  • correct   : correction orthographe/grammaire/ton SST d'un texte (MÊME langue, sens préservé).
//  • translate : traduction d'un dictionnaire de champs vers FR/EN (pour l'export bilingue).
//  • recommend : suggestion d'actions correctives / recommandations à partir du contexte de l'incident.
// Auth + rate-limit + anti-injection + budget IA scopés au tenant de SESSION (aiGuard).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

function extractText(data: any): string {
  const blocks = data?.content || [];
  return blocks.map((b: any) => (typeof b?.text === 'string' ? b.text : '')).join('').trim();
}
function parseJson(s: string): any { try { return JSON.parse(s); } catch { const i = s.indexOf('{'), j = s.lastIndexOf('}'); if (i >= 0 && j > i) { try { return JSON.parse(s.slice(i, j + 1)); } catch {} } return null; } }

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = String(body.action || '');
  const lang = body.lang === 'en' ? 'en' : 'fr';
  const tenant = guard.user?.tenant_id || '';
  if (tenant) { const b = await getAiBudget(tenant); if (b.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  let system = ANTI_INJECTION + '\n';
  let prompt = '';
  let max_tokens = 1500;
  let expectJson = false;

  if (action === 'correct') {
    const text = String(body.text || '').slice(0, 8000);
    if (!text.trim()) return NextResponse.json({ result: '' });
    system += lang === 'fr'
      ? "Tu es un correcteur professionnel en santé-sécurité (SST). Corrige l'orthographe, la grammaire, la ponctuation et clarifie le style SANS changer le sens, les faits, les chiffres ni les noms. Garde la MÊME langue (français). Ton factuel et professionnel. Réponds UNIQUEMENT avec le texte corrigé, sans préambule ni guillemets."
      : "You are a professional OHS (occupational health & safety) proofreader. Fix spelling, grammar, punctuation and clarify style WITHOUT changing meaning, facts, numbers or names. Keep the SAME language (English). Factual, professional tone. Reply ONLY with the corrected text, no preamble or quotes.";
    prompt = text;
    max_tokens = 2000;
  } else if (action === 'translate') {
    const fields = body.fields && typeof body.fields === 'object' ? body.fields : null;
    const single = typeof body.text === 'string' ? body.text : null;
    const target = body.target === 'en' ? 'en' : 'fr';
    const targetName = target === 'fr' ? 'français' : 'anglais';
    system += `Tu es un traducteur professionnel SST. Traduis fidèlement vers le ${targetName} en conservant les faits, chiffres, noms propres et le ton professionnel. Ne traduis PAS les noms de personnes ni les numéros.`;
    if (single != null) {
      if (!single.trim()) return NextResponse.json({ result: '' });
      system += ' Réponds UNIQUEMENT avec la traduction, sans préambule.';
      prompt = single.slice(0, 8000);
      max_tokens = 2000;
    } else if (fields) {
      expectJson = true;
      system += ' Renvoie un objet JSON avec EXACTEMENT les mêmes clés, chaque valeur traduite. Aucune autre clé, aucun texte hors JSON.';
      prompt = 'Traduis les valeurs de cet objet JSON :\n' + JSON.stringify(fields).slice(0, 12000);
      max_tokens = 4000;
    } else return NextResponse.json({ error: 'text ou fields requis' }, { status: 400 });
  } else if (action === 'recommend') {
    expectJson = true;
    const ctx = String(body.context || '').slice(0, 8000);
    system += lang === 'fr'
      ? "Tu es un conseiller SST senior (CNESST/SST Canada). À partir du contexte d'incident fourni, propose 3 à 6 ACTIONS CORRECTIVES/PRÉVENTIVES concrètes, hiérarchisées selon la hiérarchie des moyens de maîtrise (élimination > substitution > ingénierie > administratif > EPI). Chaque action : courte, actionnable, mesurable. Réponds en JSON {\"actions\":[{\"description\":\"...\",\"priority\":\"high|medium|low\"}],\"rootCauseHint\":\"...\"}. INDICATIF — à valider par une personne qualifiée."
      : "You are a senior OHS advisor (Canada). From the incident context, propose 3 to 6 concrete CORRECTIVE/PREVENTIVE actions, ranked by the hierarchy of controls (elimination > substitution > engineering > administrative > PPE). Each: short, actionable, measurable. Reply as JSON {\"actions\":[{\"description\":\"...\",\"priority\":\"high|medium|low\"}],\"rootCauseHint\":\"...\"}. INDICATIVE — to be validated by a qualified person.";
    prompt = ctx || (lang === 'fr' ? 'Aucun détail fourni.' : 'No detail provided.');
    max_tokens = 1500;
  } else if (action === 'fivewhys') {
    expectJson = true;
    const ctx = String(body.context || '').slice(0, 8000);
    system += lang === 'fr'
      ? "Tu es un enquêteur SST. À partir du contexte d'incident, construis une analyse « 5 Pourquoi » qui remonte la chaîne causale jusqu'à une CAUSE RACINE ORGANISATIONNELLE (gestion, formation, procédure, conception — pas la faute individuelle). Chaque « pourquoi » découle logiquement du précédent. Réponds en JSON {\"whys\":[\"réponse1\",\"réponse2\",\"réponse3\",\"réponse4\",\"réponse5\"],\"rootCause\":\"...\"}. Exactement 5 réponses, concises. INDICATIF — à valider par une personne qualifiée."
      : "You are an OHS investigator. From the incident context, build a '5 Whys' analysis tracing the causal chain to an ORGANIZATIONAL ROOT CAUSE (management, training, procedure, design — not individual blame). Each 'why' follows logically from the previous. Reply as JSON {\"whys\":[\"answer1\",\"answer2\",\"answer3\",\"answer4\",\"answer5\"],\"rootCause\":\"...\"}. Exactly 5 concise answers. INDICATIVE — to be validated by a qualified person.";
    prompt = ctx || (lang === 'fr' ? 'Aucun détail fourni.' : 'No detail provided.');
    max_tokens = 1500;
  } else return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });

  try {
    // ⚠️ Pas de préremplissage du message assistant (« { ») : certains modèles Anthropic le refusent
    // (« does not support assistant message prefill »). La conversation se termine par un message USER ;
    // on impose le JSON par la consigne système et on l'extrait via parseJson (tolérant).
    if (expectJson) system += lang === 'fr'
      ? "\nRéponds UNIQUEMENT avec l'objet JSON demandé, sans texte avant ni après, sans bloc de code."
      : "\nReply ONLY with the requested JSON object, no text before or after, no code fences.";
    const messages: any[] = [{ role: 'user', content: prompt }];
    const resp = await anthropicMessages(apiKey, { max_tokens, system, messages });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (cost > 0) await recordAiUsage(tenant, 'accidents', cost, { feature: action }); } catch {} }
    let out = extractText(data);
    if (expectJson) {
      const obj = parseJson(out);
      return NextResponse.json(obj || {});
    }
    return NextResponse.json({ result: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
