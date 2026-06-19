// Amortissement (P1-2) : GET = amortissement cumulé par bien ; POST { tenant?, year } = comptabilise la
// dotation de l'exercice (DR 5600 / CR 1590), idempotent. Gating finance = canHr.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { postDepreciationForYear, getAccumulatedDepreciation } from '@/lib/financeP1Server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, new URL(req.url).searchParams.get('tenant'));
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  try { return NextResponse.json({ ok: true, accumulated: await getAccumulatedDepreciation(tenant) }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const year = Number(body.year) || new Date().getFullYear();
  try { const r = await postDepreciationForYear(tenant, year); return NextResponse.json({ ok: true, year, ...r }); }
  catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}
