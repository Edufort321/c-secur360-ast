import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logAudit, clientIp } from '@/lib/auditTrail';

// Coordonnées BANCAIRES de versement des dividendes — CONFIDENTIEL. Lecture/écriture
// service_role + niveau direction/super_user uniquement. La révélation (GET) est explicite
// (jamais incluse dans les listes), au même titre que les salaires.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  const level = await effectiveLevelFor(acc, tenant);
  if (!canShareholders(level)) return { err: NextResponse.json({ error: 'Accès refusé (information bancaire)' }, { status: 403 }) };
  return { acc, tenant };
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const g = await guard(req, sp.get('tenant')); if (g.err) return g.err;
  const id = sp.get('id'); if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { data } = await supabaseAdmin.from('shareholder_banking').select('*').eq('shareholder_id', id).eq('tenant_id', g.tenant!).maybeSingle();
  // AUDIT : la consultation de l'info bancaire est tracée (qui a révélé quoi, quand).
  await logAudit({ tenant: g.tenant!, actorId: g.acc!.userId, actorEmail: g.acc!.email, action: 'reveal_banking', entityType: 'shareholder_banking', entityId: id, summary: 'Consultation des coordonnées bancaires', ip: clientIp(req) });
  return NextResponse.json({ banking: data || null });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const tenant = g.tenant!; const id = body.id; const b = body.banking || {};
  if (!id) return NextResponse.json({ error: 'id actionnaire requis' }, { status: 400 });
  // vérifie que l'actionnaire appartient au tenant (anti-injection d'id)
  const { data: own } = await supabaseAdmin.from('shareholders').select('id').eq('id', id).eq('tenant_id', tenant).maybeSingle();
  if (!own) return NextResponse.json({ error: 'Actionnaire introuvable' }, { status: 404 });
  const row: any = {
    shareholder_id: id, tenant_id: tenant, payment_method: b.payment_method || 'eft',
    bank_institution: b.bank_institution || null, bank_transit: b.bank_transit || null,
    bank_account: b.bank_account || null, iban: b.iban || null, swift: b.swift || null,
    account_holder: b.account_holder || null, updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin.from('shareholder_banking').upsert(row, { onConflict: 'shareholder_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAudit({ tenant, actorId: g.acc!.userId, actorEmail: g.acc!.email, action: 'update_banking', entityType: 'shareholder_banking', entityId: id, summary: 'Modification des coordonnées bancaires', ip: clientIp(req) });
  return NextResponse.json({ ok: true });
}
