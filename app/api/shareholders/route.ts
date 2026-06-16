import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Registre des ACTIONNAIRES (profil, non bancaire). Données sensibles → service_role +
// niveau direction/super_user. Super_admin peut cibler le tenant de la page (effectiveTenant).
// L'info bancaire n'est JAMAIS renvoyée ici (route /api/shareholders/banking dédiée).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  // Niveau effectif sur CE tenant (applique l'accès restreint pour les super-admins non invités).
  const level = await effectiveLevelFor(acc, tenant);
  if (!canShareholders(level)) return { err: NextResponse.json({ error: 'Accès refusé (actionnaires)' }, { status: 403 }) };
  return { acc, tenant };
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const g = await guard(req, sp.get('tenant')); if (g.err) return g.err;
  const tenant = g.tenant!;
  const [{ data: sh }, { data: cls }, { data: bank }, { data: txns }] = await Promise.all([
    supabaseAdmin.from('shareholders').select('*').eq('tenant_id', tenant).order('full_name'),
    supabaseAdmin.from('share_classes').select('*').eq('tenant_id', tenant).order('sort_order'),
    supabaseAdmin.from('shareholder_banking').select('shareholder_id').eq('tenant_id', tenant),
    supabaseAdmin.from('share_transactions').select('shareholder_id, shares').eq('tenant_id', tenant),
  ]);
  const bankSet = new Set((bank || []).map((b: any) => b.shareholder_id));
  const holdings: Record<string, number> = {};
  (txns || []).forEach((t: any) => { holdings[t.shareholder_id] = (holdings[t.shareholder_id] || 0) + (Number(t.shares) || 0); });
  const shareholders = (sh || []).map((s: any) => ({ ...s, banking_on_file: bankSet.has(s.id), shares_total: holdings[s.id] || 0 }));
  return NextResponse.json({ shareholders, classes: cls || [] });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const tenant = g.tenant!;
  const s = body.shareholder || {};
  if (!s.full_name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const row: any = {
    tenant_id: tenant, full_name: s.full_name.trim(), email: s.email || null, phone: s.phone || null,
    address: s.address || null, holder_type: s.holder_type || 'individual', tax_id: s.tax_id || null,
    is_active: s.is_active !== false, notes: s.notes || null, updated_at: new Date().toISOString(),
  };
  try {
    if (s.id) {
      const { error } = await supabaseAdmin.from('shareholders').update(row).eq('id', s.id).eq('tenant_id', tenant);
      if (error) throw error; return NextResponse.json({ ok: true, id: s.id });
    }
    const { data, error } = await supabaseAdmin.from('shareholders').insert(row).select('id').single();
    if (error) throw error; return NextResponse.json({ ok: true, id: (data as any).id });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}

export async function DELETE(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  if (!body.id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('shareholders').delete().eq('id', body.id).eq('tenant_id', g.tenant!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
