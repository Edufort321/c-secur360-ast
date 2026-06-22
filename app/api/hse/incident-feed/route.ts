import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Feed KPI : le module Accidents (incident_reports, RLS auth.uid → service_role requis) alimente
// AUTOMATIQUEMENT le KPI HSE (LTIFR/TRIR/presque-accidents) sans ressaisie. Mappe vers la forme légère
// consommée par lib/hse/kpi (occurred_at, event_code, is_lost_time, lost_days). Garde tier ≥ 4.
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

  const { data } = await supabaseAdmin.from('incident_reports').select('id, incident_type, status, data, created_at').eq('tenant_id', tenant);
  const items = (data || []).filter((r: any) => r.status !== 'draft').map((r: any) => {
    const d = r.data || {};
    const occurred_at = (dOnly(d.incidentDate) || dOnly(r.created_at) || '') + 'T12:00:00';
    const event_code = r.incident_type === 'near_miss' ? 'NEAR_MISS'
      : r.incident_type === 'property' ? 'MATERIAL_DAMAGE'
      : 'RECORDABLE';                                              // accident | vehicle | medical
    // Arrêt de travail = saisi PAR PERSONNE blessée (injuredPersons[].lostTimeDays). On prend le pire cas.
    const persons: any[] = Array.isArray(d.injuredPersons) ? d.injuredPersons : [];
    const lost_days = persons.reduce((m, p) => Math.max(m, Number(p?.lostTimeDays) || 0), Number(d.lostDays ?? d.daysLost ?? d.lost_days ?? 0) || 0);
    const anyLostTime = persons.some(p => p?.lostTime || p?.fatality);
    const is_lost_time = event_code === 'RECORDABLE' && (lost_days > 0 || anyLostTime || Number(d.severityLevel ?? 0) >= 4 || d.isLostTime === true);
    return { id: r.id, occurred_at, event_code, is_lost_time, lost_days, source: 'accidents' };
  });
  return NextResponse.json({ items });
}
