import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Feed ANTI-DUPLICATION pour les registres HSE depuis des sources VERROUILLÉES (RH). service_role +
// garde canHr (les certifications sont des données RH sensibles). Tenant résolu serveur (zéro fuite).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé (RH requis)' }, { status: 403 });

  const source = url.searchParams.get('source');
  if (source !== 'certifications') return NextResponse.json({ error: 'source inconnue' }, { status: 400 });

  const { data: certs } = await supabaseAdmin.from('hr_certifications')
    .select('id, personnel_id, name, issuer, issued_date, expiry_date').eq('tenant_id', tenant).order('expiry_date');
  const ids = Array.from(new Set((certs || []).map((c: any) => c.personnel_id).filter(Boolean)));
  const nameById: Record<string, string> = {};
  if (ids.length) {
    const { data: pers } = await supabaseAdmin.from('planner_personnel').select('id, name').eq('tenant_id', tenant).in('id', ids);
    for (const p of (pers || []) as any[]) nameById[p.id] = p.name;
  }
  const items = (certs || []).map((c: any) => ({
    reference: String(c.id),
    title: nameById[c.personnel_id] || (c.name || 'Certification'),
    data: { worker: nameById[c.personnel_id] || '', course: c.name || '', issuer: c.issuer || '', completed_at: c.issued_date || '', expires_at: c.expiry_date || '' },
  }));
  return NextResponse.json({ items });
}
