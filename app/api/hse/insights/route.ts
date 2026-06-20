import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { anthropicMessages } from '@/lib/anthropicModel';
import { bodyRegionGroup, BODY_GROUP_LABELS } from '@/lib/hse/bodyRegions';

// Analyse IA des TENDANCES SST (détection de points chauds + patterns + recommandations préventives).
// On n'envoie à l'IA que des AGRÉGATS ANONYMISÉS (comptages par type/lieu/région/mois — aucune PII, Loi 25).
// Garde tier ≥ 4 (administration). À la demande (bouton) pour maîtriser le coût IA.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const top = (m: Record<string, number>, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, v }));

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (tierFromLevel(await effectiveLevelFor(acc, tenant)) < 4) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée' }, { status: 503 });

  // ── Agrégats anonymisés ────────────────────────────────────────────────────────────────────────
  const { data } = await supabaseAdmin.from('incident_reports').select('incident_type, status, data, created_at').eq('tenant_id', tenant);
  const rows = (data || []).filter((r: any) => r.status !== 'draft');
  if (rows.length < 3) return NextResponse.json({ error: 'insufficient', message: 'Pas assez de données (min. 3 rapports soumis).' }, { status: 200 });

  const byType: Record<string, number> = {}, byMonth: Record<string, number> = {}, byLocation: Record<string, number> = {};
  const byRegion: Record<string, number> = {}, byFactor: Record<string, number> = {}, bySeverity: Record<string, number> = {};
  let lostTime = 0, nearMiss = 0, injuries = 0;
  for (const r of rows as any[]) {
    const d = r.data || {};
    byType[r.incident_type || 'autre'] = (byType[r.incident_type || 'autre'] || 0) + 1;
    if (r.incident_type === 'near_miss') nearMiss++;
    const m = (d.incidentDate || r.created_at || '').slice(0, 7); if (m) byMonth[m] = (byMonth[m] || 0) + 1;
    const loc = String(d.exactLocation || d.department || d.address || '').trim(); if (loc) byLocation[loc] = (byLocation[loc] || 0) + 1;
    if (d.severityLevel) bySeverity['niveau ' + d.severityLevel] = (bySeverity['niveau ' + d.severityLevel] || 0) + 1;
    for (const f of (Array.isArray(d.contributingFactors) ? d.contributingFactors : [])) { const k = String(f).trim(); if (k) byFactor[k] = (byFactor[k] || 0) + 1; }
    for (const p of (Array.isArray(d.injuredPersons) ? d.injuredPersons : [])) {
      injuries++; if (p?.lostTime) lostTime++;
      for (const reg of (Array.isArray(p?.bodyRegions) ? p.bodyRegions : [])) { const g = BODY_GROUP_LABELS[bodyRegionGroup(reg)].fr; byRegion[g] = (byRegion[g] || 0) + 1; }
    }
  }

  const summary = {
    total_rapports: rows.length, blessures: injuries, avec_arret: lostTime, presque_accidents: nearMiss,
    par_type: byType, par_mois: byMonth, top_lieux: top(byLocation), top_parties_du_corps: top(byRegion),
    top_facteurs_contributifs: top(byFactor), par_gravite: bySeverity,
  };

  const system = `Tu es un conseiller en santé-sécurité du travail (SST) au Canada. À partir d'AGRÉGATS ANONYMISÉS d'incidents, identifie les tendances, points chauds et risques émergents, et propose des actions préventives concrètes et priorisées. Base-toi UNIQUEMENT sur les données fournies, ne fabrique aucune statistique. Réponds en FRANÇAIS, en JSON STRICT (aucun texte hors JSON) avec ce schéma :
{"hotspots":[{"label":"...","count":N,"insight":"..."}],"patterns":["..."],"risques_emergents":["..."],"recommandations":[{"titre":"...","justification":"...","priorite":"haute|moyenne|basse"}],"synthese":"..."}
Max 5 hotspots, 5 patterns, 6 recommandations. Termine la synthèse par un rappel que l'analyse est indicative et doit être validée par une personne qualifiée.`;

  const resp = await anthropicMessages(apiKey, {
    max_tokens: 2000,
    system,
    messages: [{ role: 'user', content: `Agrégats SST (anonymisés) :\n${JSON.stringify(summary, null, 2)}` }, { role: 'assistant', content: '{' }],
  });
  if (!resp.ok) return NextResponse.json({ error: 'Échec IA (' + resp.status + ')' }, { status: 502 });
  const j = await resp.json();
  let parsed: any = null;
  try { parsed = JSON.parse('{' + (j?.content?.[0]?.text || '')); } catch { return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 502 }); }
  return NextResponse.json({ ok: true, insights: parsed, summary });
}
