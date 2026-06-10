import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// #DGA — Config de l'import par courriel (panneau d'instructions cote tenant) + journal d'audit.
// GET  : retourne l'adresse dediee, l'etat (active/liste blanche/auto-creation) et les derniers
//        evenements. Cree une config par defaut (desactivee) si absente.
// POST : met a jour enabled / allow_senders / auto_create. Reserve aux roles admin du tenant.
// Tenant pris dans la SESSION (jamais le corps) ; super_admin peut viser un tenant via ?tenant=.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const INBOUND_DOMAIN = process.env.DGA_INBOUND_DOMAIN || 'in.c-secur360.ca';
const inboundAddress = (tenant: string) => `dga.${tenant}@${INBOUND_DOMAIN}`;
const isAdmin = (role?: string) => role === 'super_admin' || role === 'client_admin';

async function ensureConfig(tenant: string) {
  const { data } = await supabaseAdmin.from('dga_inbound').select('*').eq('tenant_id', tenant).maybeSingle();
  if (data) {
    // Repli : s'assure que l'adresse reflete le domaine courant.
    if (!data.address) { await supabaseAdmin.from('dga_inbound').update({ address: inboundAddress(tenant) }).eq('tenant_id', tenant); data.address = inboundAddress(tenant); }
    return data;
  }
  const row = { tenant_id: tenant, address: inboundAddress(tenant), enabled: false, allow_senders: [], auto_create: true };
  await supabaseAdmin.from('dga_inbound').insert(row);
  return row;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  const qsTenant = new URL(req.url).searchParams.get('tenant') || '';
  const tenant = user.role === 'super_admin' && qsTenant ? qsTenant : user.tenant_id;
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });

  const config = await ensureConfig(tenant);
  const { data: log } = await supabaseAdmin.from('dga_inbound_log').select('*').eq('tenant_id', tenant).order('created_at', { ascending: false }).limit(25);
  return NextResponse.json({ ok: true, config, log: log || [], domain: INBOUND_DOMAIN, canEdit: isAdmin(user.role) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  if (!isAdmin(user.role)) return NextResponse.json({ error: 'Acces reserve a l\'administrateur' }, { status: 403 });
  const qsTenant = new URL(req.url).searchParams.get('tenant') || '';
  const tenant = user.role === 'super_admin' && qsTenant ? qsTenant : user.tenant_id;
  if (!tenant) return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }

  const patch: any = { tenant_id: tenant, address: inboundAddress(tenant), updated_at: new Date().toISOString() };
  if (typeof body.enabled === 'boolean') patch.enabled = body.enabled;
  if (typeof body.auto_create === 'boolean') patch.auto_create = body.auto_create;
  if (Array.isArray(body.allow_senders)) {
    patch.allow_senders = body.allow_senders.map((s: any) => String(s || '').toLowerCase().trim()).filter(Boolean).slice(0, 200);
  }
  await ensureConfig(tenant); // garantit l'existence avant update
  const { data, error } = await supabaseAdmin.from('dga_inbound').update(patch).eq('tenant_id', tenant).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, config: data });
}
