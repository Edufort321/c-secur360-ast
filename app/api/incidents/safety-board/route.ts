// Tableau de bord SÉCURITÉ (remonte au dashboard principal). Scopé au tenant de SESSION (anti-fuite).
// Compte les accidents / passés proches de l'année en cours et les compteurs « jours sans … » qui
// repartent à 0 lors d'un événement, avec pour plancher le JOUR 0 de l'abonnement (tenants.created_at).
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const dayMs = 86400000;
const dOnly = (s: any): string | null => { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); };
const daysBetween = (fromIso: string, toIso: string) => Math.max(0, Math.floor((new Date(toIso + 'T00:00:00').getTime() - new Date(fromIso + 'T00:00:00').getTime()) / dayMs));

export async function GET(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  const todayIso = new Date().toISOString().slice(0, 10);
  const year = new Date().getFullYear();

  // Jour 0 = CRÉATION du tenant (quand l'exploitation a pu commencer). Le compteur « jours sans … » ne
  // doit JAMAIS dépasser l'âge réel du tenant. SOURCE PRIMAIRE : tenants.createdAt (⚠️ camelCase ; il n'y a
  // PAS de created_at sur tenants/users — ne pas les interroger). Repli : tenant_subscriptions.start_date
  // (qui peut être ANTÉRIEUR à la création réelle si l'abonnement a été pré-amorcé → ne plus le prioriser,
  // ça surcomptait, ex. 28 j pour un tenant créé il y a < 7 j).
  let tenantStart: string | null = null;
  try {
    const { data: t } = await supabaseAdmin.from('tenants').select('createdAt').eq('id', tenant).maybeSingle();
    tenantStart = dOnly((t as any)?.createdAt);
  } catch { /* ignore */ }
  if (!tenantStart) {
    try {
      const { data: sub } = await supabaseAdmin.from('tenant_subscriptions').select('start_date, created_at').eq('tenant_id', tenant).maybeSingle();
      tenantStart = dOnly((sub as any)?.start_date) || dOnly((sub as any)?.created_at);
    } catch { /* ignore */ }
  }
  if (!tenantStart) tenantStart = todayIso; // inconnu → 0 jour (jamais une valeur factice)
  if (tenantStart > todayIso) tenantStart = todayIso; // garde-fou : jamais dans le futur

  // Réinitialisations PAR TYPE (company_settings.safety_baseline_accident / _nearmiss). Repli legacy =
  // safety_baseline_date (réinit. générale historique), sinon création du tenant.
  let resetAcc: string | null = null, resetNm: string | null = null, legacy: string | null = null;
  try {
    const { data: cs } = await supabaseAdmin.from('company_settings').select('safety_baseline_accident, safety_baseline_nearmiss, safety_baseline_date').eq('tenant_id', tenant).maybeSingle();
    resetAcc = dOnly((cs as any)?.safety_baseline_accident);
    resetNm = dOnly((cs as any)?.safety_baseline_nearmiss);
    legacy = dOnly((cs as any)?.safety_baseline_date);
  } catch { /* colonnes optionnelles (mig 240) */ }
  const accFloor = resetAcc || legacy || tenantStart;   // plancher « jours sans accident »
  const nmFloor = resetNm || legacy || tenantStart;      // plancher « jours sans presque-accident »
  const baseline = tenantStart;

  // Incidents (accidents) + passés proches : incident_reports (par type) + table near_miss_events (héritée).
  const [{ data: reports }, { data: nm }] = await Promise.all([
    supabaseAdmin.from('incident_reports').select('incident_type, data, created_at').eq('tenant_id', tenant),
    supabaseAdmin.from('near_miss_events').select('incident_date, created_at').eq('tenant_id', tenant).then(r => r, () => ({ data: [] as any[] })),
  ]);

  const dateOf = (r: any): string | null => dOnly(r?.data?.incidentDate) || dOnly(r?.created_at);
  const accidents: string[] = [];
  const nearMiss: string[] = [];
  for (const r of (reports || []) as any[]) {
    const d = dateOf(r); if (!d) continue;
    if (r.incident_type === 'near_miss') nearMiss.push(d); else accidents.push(d); // accident/vehicle/property/medical = incident réel
  }
  for (const e of (nm || []) as any[]) { const d = dOnly(e.incident_date) || dOnly(e.created_at); if (d) nearMiss.push(d); }

  const inYear = (arr: string[]) => arr.filter(d => d.slice(0, 4) === String(year)).length;
  const lastOf = (arr: string[]) => arr.length ? arr.slice().sort().slice(-1)[0] : null;

  const lastAccident = lastOf(accidents);
  const lastNearMiss = lastOf(nearMiss);
  // « Jours sans » = depuis le PLUS RÉCENT entre le dernier événement de ce type et le plancher du type
  // (réinit. par type, sinon création du tenant).
  const accidentBaseline = lastAccident && lastAccident > accFloor ? lastAccident : accFloor;
  const nearMissBaseline = lastNearMiss && lastNearMiss > nmFloor ? lastNearMiss : nmFloor;

  return NextResponse.json({
    ok: true, year, baseline, today: todayIso,
    accidentsYTD: inYear(accidents), nearMissYTD: inYear(nearMiss),
    accidentsTotal: accidents.length, nearMissTotal: nearMiss.length,
    lastAccidentDate: lastAccident, lastNearMissDate: lastNearMiss,
    accFloor, nmFloor,
    daysSinceAccident: daysBetween(accidentBaseline, todayIso),
    daysSinceNearMiss: daysBetween(nearMissBaseline, todayIso),
  });
}

// RÉINITIALISATION PAR TYPE : remet le compteur « jours sans … » à 0 pour UN type seulement.
// body { type: 'accident' | 'near_miss', date? } → fixe le plancher du type à `date` (défaut aujourd'hui).
export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = u.tenant_id || '';
  let body: any = {}; try { body = await req.json(); } catch { /* vide */ }
  const type = body.type === 'near_miss' ? 'near_miss' : body.type === 'accident' ? 'accident' : null;
  if (!type) return NextResponse.json({ error: 'type requis (accident | near_miss)' }, { status: 400 });
  const date = dOnly(body.date) || new Date().toISOString().slice(0, 10);
  const col = type === 'accident' ? 'safety_baseline_accident' : 'safety_baseline_nearmiss';
  const { error } = await supabaseAdmin.from('company_settings').upsert({ tenant_id: tenant, [col]: date, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, type, date });
}
