// Remise TPS/TVQ (P1-3) : POST { tenant?, periodStart, periodEnd, frequency?, payDate? } comptabilise la
// remise (DR 2100/2110 / CR banque) pour la période, idempotent. Gating finance = canHr.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { postTaxRemittance } from '@/lib/financeP1Server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const isDate = (s: any) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  if (!isDate(body.periodStart) || !isDate(body.periodEnd)) return NextResponse.json({ error: 'Période invalide (AAAA-MM-JJ).' }, { status: 400 });
  try {
    const r = await postTaxRemittance(tenant, { periodStart: body.periodStart, periodEnd: body.periodEnd, frequency: body.frequency, payDate: isDate(body.payDate) ? body.payDate : null });
    return NextResponse.json(r.ok ? r : { ...r, error: r.reason }, { status: r.ok ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}
