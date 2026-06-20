import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Statistiques de BLESSURES par partie du corps (beigne du tableau de bord HSE). Agrège
// incident_reports.data.injuredPersons[].bodyRegions sur une fenêtre [from,to] (filtre semaine/mois/année).
// Données santé → service_role + garde tier ≥ 4 ; on ne renvoie QUE des COMPTAGES agrégés (pas de PII, Loi 25).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const dOnly = (v: any): string | null => { if (!v) return null; const s = String(v); return s.length >= 10 ? s.slice(0, 10) : null; };

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (tierFromLevel(await effectiveLevelFor(acc, tenant)) < 4) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const from = dOnly(url.searchParams.get('from'));  // borne inférieure incluse (null = pas de borne)
  const to = dOnly(url.searchParams.get('to'));      // borne supérieure incluse

  const { data } = await supabaseAdmin.from('incident_reports').select('data, status, created_at, incident_type').eq('tenant_id', tenant);
  const byRegion: Record<string, number> = {};
  const byInjuryType: Record<string, number> = {};
  let injuries = 0, reports = 0;

  for (const r of (data || []) as any[]) {
    if (r.status === 'draft') continue;                                  // brouillons exclus
    const d = r.data || {};
    const day = dOnly(d.incidentDate) || dOnly(r.created_at);
    if (from && (!day || day < from)) continue;
    if (to && (!day || day > to)) continue;
    reports++;
    const persons: any[] = Array.isArray(d.injuredPersons) ? d.injuredPersons : [];
    for (const p of persons) {
      injuries++;
      const regions: string[] = Array.isArray(p?.bodyRegions) ? p.bodyRegions : [];
      for (const reg of regions) { const k = String(reg || '').trim(); if (k) byRegion[k] = (byRegion[k] || 0) + 1; }
      const it = String(p?.injuryType || '').trim(); if (it) byInjuryType[it] = (byInjuryType[it] || 0) + 1;
    }
  }

  return NextResponse.json({ byRegion, byInjuryType, totalInjuries: injuries, totalReports: reports });
}
