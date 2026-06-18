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

  // Jour 0 = début de l'abonnement (création du tenant). Repli : 1 an en arrière si indisponible.
  let baseline = new Date(Date.now() - 365 * dayMs).toISOString().slice(0, 10);
  try {
    const { data: t } = await supabaseAdmin.from('tenants').select('created_at').eq('subdomain', tenant).maybeSingle();
    if ((t as any)?.created_at) baseline = dOnly((t as any).created_at) || baseline;
  } catch { /* repli */ }

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
  // « Jours sans » = depuis le dernier événement, ou depuis le jour 0 de l'abonnement si aucun.
  const accidentBaseline = lastAccident && lastAccident > baseline ? lastAccident : baseline;
  const nearMissBaseline = lastNearMiss && lastNearMiss > baseline ? lastNearMiss : baseline;

  return NextResponse.json({
    ok: true, year, baseline, today: todayIso,
    accidentsYTD: inYear(accidents), nearMissYTD: inYear(nearMiss),
    accidentsTotal: accidents.length, nearMissTotal: nearMiss.length,
    lastAccidentDate: lastAccident, lastNearMissDate: lastNearMiss,
    daysSinceAccident: daysBetween(accidentBaseline, todayIso),
    daysSinceNearMiss: daysBetween(nearMissBaseline, todayIso),
  });
}
