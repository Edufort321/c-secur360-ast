// Coordonnées bancaires des employés (#52) — TRÈS SENSIBLE (Loi 25). Tout passe par le service_role :
// la table employee_bank_accounts est REVOKE anon (migration 218). Gating = canHr (niveaux RH/paie).
// GET renvoie des numéros MASQUÉS (4 derniers chiffres) ; seul l'export dépôt (route dédiée) lit en clair.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const mask = (s?: string | null) => { const v = String(s || '').replace(/\D/g, ''); return v ? '••••' + v.slice(-4) : ''; };

// GET ?tenant= -> état bancaire (masqué) par employé pour l'UI de gestion.
export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const tenant = effectiveTenant(acc, new URL(req.url).searchParams.get('tenant'));
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const { data, error } = await supabaseAdmin.from('employee_bank_accounts').select('personnel_id, account_holder, institution_number, transit_number, account_number, updated_at').eq('tenant_id', tenant);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data || []).map((r: any) => ({
    personnel_id: r.personnel_id, account_holder: r.account_holder || '',
    institution_number: r.institution_number || '', transit_number: r.transit_number || '',
    account_masked: mask(r.account_number), has_account: !!(r.institution_number && r.transit_number && r.account_number),
    updated_at: r.updated_at,
  }));
  return NextResponse.json({ ok: true, accounts: rows });
}

// POST { tenant, personnel_id, account_holder?, institution_number, transit_number, account_number } -> upsert.
export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  if (!body.personnel_id) return NextResponse.json({ error: 'personnel_id requis' }, { status: 400 });
  const digits = (s: any) => String(s || '').replace(/\D/g, '');
  const inst = digits(body.institution_number), transit = digits(body.transit_number), account = digits(body.account_number);
  // Validation souple du format bancaire canadien (3 / 5 / 7-12 chiffres).
  if (inst && inst.length !== 3) return NextResponse.json({ error: 'N° d’institution = 3 chiffres' }, { status: 400 });
  if (transit && transit.length !== 5) return NextResponse.json({ error: 'N° de transit = 5 chiffres' }, { status: 400 });
  if (account && (account.length < 7 || account.length > 12)) return NextResponse.json({ error: 'N° de compte = 7 à 12 chiffres' }, { status: 400 });
  const { error } = await supabaseAdmin.from('employee_bank_accounts').upsert({
    tenant_id: tenant, personnel_id: body.personnel_id, account_holder: body.account_holder || null,
    institution_number: inst || null, transit_number: transit || null, account_number: account || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id,personnel_id' });
  if (error) return NextResponse.json({ error: error.message + ' (migration 218 appliquée ?)' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE ?tenant=&personnel_id= -> supprime les coordonnées (droit à l'effacement).
export async function DELETE(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const url = new URL(req.url);
  const tenant = effectiveTenant(acc, url.searchParams.get('tenant'));
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const pid = url.searchParams.get('personnel_id');
  if (!pid) return NextResponse.json({ error: 'personnel_id requis' }, { status: 400 });
  const { error } = await supabaseAdmin.from('employee_bank_accounts').delete().eq('tenant_id', tenant).eq('personnel_id', pid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
