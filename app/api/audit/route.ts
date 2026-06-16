import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Lecture du JOURNAL D'AUDIT des données sensibles (finance/RH/actionnaires). Réservé
// direction/super_user. Service_role + effectiveTenant (super_admin = tenant de la page).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!canShareholders(acc.level)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const sp = new URL(req.url).searchParams;
  const tenant = effectiveTenant(acc, sp.get('tenant'));
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
  const limit = Math.min(500, Math.max(1, parseInt(sp.get('limit') || '200', 10) || 200));
  const entity = sp.get('entity') || '';

  let q = supabaseAdmin.from('audit_log').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(limit);
  if (entity) q = q.eq('entity_type', entity);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ entries: data || [] });
}
