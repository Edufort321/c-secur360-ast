import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard, ANTI_INJECTION } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';
import { extractJsonValue } from '@/lib/aiJson';

// Assistant IA du PLANIFICATEUR : valide et OPTIMISE la logique d'un Gantt (séquençage, dépendances,
// durées réalistes, effectif). Clé Anthropic côté serveur, budget IA scopé au tenant de la SESSION,
// auth + rate-limit + anti-injection. Le PROMPT est construit ici (le client n'envoie que les données).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const etapes = Array.isArray(body.etapes) ? body.etapes : null;
  if (!etapes) return NextResponse.json({ error: 'etapes requis' }, { status: 400 });
  const hoursPerDay = Math.max(1, Math.min(24, Number(body.hoursPerDay) || 8));
  const lang = body.lang === 'en' ? 'en' : 'fr';

  const tenant = guard.user?.tenant_id || '';
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé.', exhausted: true }, { status: 402 }); }

  // On ne transmet à l'IA que la STRUCTURE utile (pas de données personnelles superflues).
  const slim = etapes.map((e: any) => ({
    id: e.id, text: e.text, parentId: e.parentId ?? null, level: e.level ?? (e.parentId ? 1 : 0),
    order: e.order ?? 0, duration: Number(e.duration) || 0, manHours: Number(e.manHours) || 0,
    personnesRequises: Number(e.personnesRequises) || 1,
    dependencies: (e.dependencies || []).map((d: any) => ({ id: d.id, type: d.type || 'FS', lag: d.lag || 0 })),
    parallelWith: (e.parallelWith || []).map((x: any) => x),
  }));

  const langName = lang === 'en' ? 'English' : 'français';
  const prompt = `Tu es un PLANIFICATEUR DE PROJET expert (ordonnancement, méthode du chemin critique CPM, nivellement des ressources). On te donne la structure WBS d'un mandat : des ITEMS (parentId=null) et leurs SOUS-TÂCHES (parentId=item).
Données par tâche : duration (en HEURES de calendrier), manHours (heures-homme = charge totale), personnesRequises (effectif), dependencies (FS/SS/FF/SF + lag), parallelWith.
Journée de travail : ${hoursPerDay} h/jour.

ANALYSE selon les BONNES PRATIQUES :
1) Cohérence durée/effort : durée(h) ≈ manHours ÷ personnesRequises. Signale les écarts.
2) Effectif réaliste : au-delà d'un effectif optimal, les gains diminuent (loi de Brooks / congestion). Signale les tâches sur-staffées (ex. plus de personnes que d'heures-homme) ou les durées irréalistes (trop courtes).
3) Séquençage : repère les dépendances manquantes (ex. une tâche qui devrait suivre une autre), les boucles, et ce qui peut tourner EN PARALLÈLE sans dépasser les ressources.
4) Chemin critique : identifie les tâches critiques (sans marge) et estime la durée totale (en jours, ${hoursPerDay} h/j, hors fins de semaine).
5) Risques : tâches sans durée, dépendances vers des id inexistants, items sans sous-tâches.

Retourne UNIQUEMENT un objet JSON valide (sans texte autour, sans backticks) :
{
 "summary": "synthèse en 1-3 phrases (faisabilité, durée totale estimée en jours, principaux risques)",
 "totalDays": <nombre estimé de jours ouvrables>,
 "issues": [{"etapeId": <id ou null>, "severity": "info|warn|critical", "message": "constat précis et action recommandée"}],
 "optimized": [{"id": <id de la tâche>, "duration": <heures recommandées, optionnel>, "personnesRequises": <effectif recommandé, optionnel>, "dependencies": [{"id": <id>, "type": "FS", "lag": 0}], "parallelWith": [<ids>]}]
}
RÈGLES : "optimized" ne contient QUE les tâches à corriger, avec UNIQUEMENT les champs à changer (n'invente pas d'id ; réutilise les id fournis). Sois concret et prudent. Langue : ${langName}.

WBS À ANALYSER :
${JSON.stringify(slim)}`;

  const system = [ANTI_INJECTION].join('\n');
  try {
    const resp = await anthropicMessages(apiKey, { max_tokens: 4096, system, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (cost > 0) await recordAiUsage(tenant, 'planner', cost, { feature: 'gantt-ai' }); } catch { /* best-effort */ } }
    const txt = (data?.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
    const clean = txt.replace(/```json|```/g, '').trim();
    const parsed = extractJsonValue(clean);
    if (!parsed) return NextResponse.json({ error: 'Réponse IA illisible', raw: clean.slice(0, 400) }, { status: 502 });
    return NextResponse.json({ ok: true, ...parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
