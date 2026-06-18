import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { anthropicMessages } from '@/lib/anthropicModel';

// IA MARKETING du TENANT. Toute la conso est plafonnée par le FORFAIT du tenant (ai_budgets/ai_usage).
// L'IA s'appuie sur le PROFIL D'ENTREPRISE du tenant (tenant_marketing_profile) — la plateforme ne
// connaît pas l'activité de chaque tenant. Clé Anthropic CÔTÉ SERVEUR. Conformité LCAP/Loi 25 imposée.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
const MODEL = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = String((guard.user as any)?.tenant_id || body.tenant || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });

  // Action budget : état du forfait IA du tenant (pour l'afficher dans l'UI).
  if (body.action === 'budget') {
    const b = await getAiBudget(tenant);
    return NextResponse.json({ ok: true, budget: b });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée.' }, { status: 503 });
  const budget = await getAiBudget(tenant);
  if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — augmentez votre forfait pour continuer.', exhausted: true }, { status: 402 });

  // Profil d'entreprise du tenant (contexte indispensable).
  const { data: prof } = await supabaseAdmin.from('tenant_marketing_profile').select('*').eq('tenant_id', tenant).maybeSingle();
  if (!prof || !prof.description) {
    return NextResponse.json({ error: 'Complétez d’abord votre PROFIL D’ENTREPRISE (ce que vous faites) — l’IA en a besoin pour produire du contenu pertinent.', needProfile: true }, { status: 400 });
  }

  const lang = prof.lang || body.lang || 'fr';
  const system = [
    "Tu es un directeur marketing B2B au Canada, expert conformité LCAP/CASL et Loi 25 (RLRQ c P-39.1).",
    "Règles ABSOLUES : (1) aucune donnée personnelle réelle ; exemples fictifs. (2) Toute allégation chiffrée non sourcée = signalée NON DÉMONTRÉE. (3) Courriel commercial : identité de l'expéditeur + adresse postale + désabonnement obligatoires. (4) Jamais d'envoi sans consentement.",
    `PROFIL DE L'ENTREPRISE (à utiliser comme base de TOUT le contenu) : nom=${prof.company_name || '—'} ; secteur=${prof.sector || '—'} ; ACTIVITÉ=${prof.description} ; offre=${prof.offer || '—'} ; clientèle cible=${prof.audience || '—'} ; arguments clés=${prof.key_points || '—'} ; ton de marque=${prof.tone || 'professionnel'} ; site=${prof.website || '—'}.`,
  ].join('\n');

  const objective = String(body.objective || '').slice(0, 400);
  const format = body.format || 'pack';
  const prompt = `Langue : ${lang}. Objectif/sujet de la campagne : "${objective || 'présenter l’entreprise et son offre'}".
Produis un PACK MARKETING cohérent et conforme, adapté à l'entreprise (profil ci-dessus). Réponds en JSON STRICT, sans texte autour :
{"hooks":["accroche 1","..."],
 "script":"court script de vidéo (20-40 s) prêt à narrer",
 "storyboard":[{"scene":"","seconds":6,"onscreen_text":"","voiceover":""}],
 "captions":"sous-titres prêts",
 "social_posts":[{"platform":"LinkedIn|Facebook|Instagram|TikTok","caption":"","hashtags":["#..."]}],
 "follow_up_email":{"subject":"","body":"avec identité expéditeur + [adresse postale] + [lien de désabonnement]"},
 "warnings":["allégations à sourcer, le cas échéant"]}`;

  try {
    const resp = await anthropicMessages(apiKey, { max_tokens: 3500, system, messages: [{ role: 'user', content: prompt }] });
    if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
    const data = await resp.json();
    try { const cost = aiCallCostCents(MODEL, data?.usage); if (cost > 0) await recordAiUsage(tenant, 'marketing', cost, { feature: format }); } catch {}
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const s = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(s); } catch { const m = s.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]); } catch {} } }
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });
    return NextResponse.json({ ok: true, pack: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 500 });
  }
}
