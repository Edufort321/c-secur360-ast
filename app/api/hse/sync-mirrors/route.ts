import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { backfillMirrors } from '@/lib/hse/incidentMirror';

// Backfill idempotent des miroirs hse_incident à partir des rapports `incident_reports` (module Accidents).
// Appelé au chargement du module HSE pour que les accidents existants nourrissent immédiatement le KPI.
// Renvoie aussi la date de DÉBUT du tenant (plancher du compteur « jours sans accident »). Garde tier ≥ 4.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (tierFromLevel(await effectiveLevelFor(acc, tenant)) < 4) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  let result = { synced: 0, skipped: 0 };
  try { result = await backfillMirrors(tenant); } catch (e: any) { return NextResponse.json({ error: e?.message || 'sync échouée' }, { status: 500 }); }

  // Plancher du compteur = date de création du tenant (jour 0), avec repli sur l'abonnement.
  let tenantStart: string | null = null;
  try {
    const { data: t } = await supabaseAdmin.from('tenants').select('"createdAt"').eq('id', tenant).maybeSingle();
    tenantStart = (t as any)?.createdAt || null;
    if (!tenantStart) { const { data: s } = await supabaseAdmin.from('tenant_subscriptions').select('start_date').eq('tenant_id', tenant).order('start_date', { ascending: true }).limit(1).maybeSingle(); tenantStart = (s as any)?.start_date || null; }
  } catch {}

  return NextResponse.json({ ok: true, ...result, tenantStart });
}
