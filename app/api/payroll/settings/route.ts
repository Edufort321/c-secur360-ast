// Paie réelle (#43) — réglages de paie du tenant (fréquence, année fiscale, taux CNESST/FSS, 1 %).
// Gating = canHr. GET -> réglages courants (ou défauts). POST -> upsert.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULTS = { pay_frequency: 'biweekly', tax_year: 2026, fss_rate: 0.0165, cnesst_rate: 0.02, wsdrf_rate: 0.01, wsdrf_threshold: 2000000 };

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, req.nextUrl.searchParams.get('tenant') || '');
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  try {
    const { data } = await supabaseAdmin.from('payroll_settings').select('*').eq('tenant_id', tenant).maybeSingle();
    return NextResponse.json({ ok: true, settings: data || { tenant_id: tenant, ...DEFAULTS } });
  } catch {
    return NextResponse.json({ ok: true, settings: { tenant_id: tenant, ...DEFAULTS } });
  }
}

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const s = body.settings || {};
  const row = {
    tenant_id: tenant,
    pay_frequency: ['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(s.pay_frequency) ? s.pay_frequency : 'biweekly',
    tax_year: Number(s.tax_year) || 2026,
    fss_rate: Number(s.fss_rate) || 0, cnesst_rate: Number(s.cnesst_rate) || 0,
    wsdrf_rate: Number(s.wsdrf_rate) || 0, wsdrf_threshold: Number(s.wsdrf_threshold) || 2000000,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin.from('payroll_settings').upsert(row, { onConflict: 'tenant_id' });
  if (error) return NextResponse.json({ error: error.message + ' (migration 223 appliquée ?)' }, { status: 500 });
  return NextResponse.json({ ok: true, settings: row });
}
