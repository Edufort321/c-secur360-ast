// Gestion du LIEN COMPTABLE read-only (migration 184). Un admin (super_admin ou admin du tenant)
// génère / révoque un jeton qui donne au comptable externe un accès LECTURE SEULE au grand livre via
// /api/accounting/export. Tout passe par service_role (la table accountant_tokens est REVOKE anon).
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, getSessionUser } from '@/lib/apiAuth';

// Autorisé si : super_admin / cookie admin / secret de sync (requireAdmin) OU utilisateur de session
// appartenant à CE tenant (un admin de tenant gère le lien comptable de sa propre entreprise).
async function authorize(req: NextRequest, tenant: string): Promise<boolean> {
  const a = await requireAdmin(req);
  if (a.ok) return true;
  const user = await getSessionUser(req);
  return !!user && user.tenant_id === tenant;
}

// GET ?tenant= → lien actif (token masqué + url) ou null.
export async function GET(req: NextRequest) {
  const tenant = new URL(req.url).searchParams.get('tenant') || '';
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  if (!(await authorize(req, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const { data } = await supabaseAdmin.from('accountant_tokens')
    .select('id, token, label, created_at, last_used_at').eq('tenant_id', tenant).eq('revoked', false)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!data) return NextResponse.json({ link: null });
  const origin = new URL(req.url).origin;
  return NextResponse.json({ link: { id: data.id, label: data.label, created_at: data.created_at, last_used_at: data.last_used_at, url: `${origin}/api/accounting/export?token=${data.token}` } });
}

// POST {tenant, label?} → (révoque les anciens) génère un nouveau jeton, renvoie l'URL complète.
export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch {}
  const tenant = String(body.tenant || '').trim();
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  if (!(await authorize(req, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  await supabaseAdmin.from('accountant_tokens').update({ revoked: true }).eq('tenant_id', tenant).eq('revoked', false);
  const token = 'acct_' + crypto.randomBytes(24).toString('hex');
  const { error } = await supabaseAdmin.from('accountant_tokens').insert({ tenant_id: tenant, token, label: body.label || 'Comptable' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const origin = new URL(req.url).origin;
  return NextResponse.json({ ok: true, url: `${origin}/api/accounting/export?token=${token}` });
}

// DELETE ?tenant= → révoque le(s) lien(s) actif(s).
export async function DELETE(req: NextRequest) {
  const tenant = new URL(req.url).searchParams.get('tenant') || '';
  if (!tenant) return NextResponse.json({ error: 'tenant requis' }, { status: 400 });
  if (!(await authorize(req, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  const { error } = await supabaseAdmin.from('accountant_tokens').update({ revoked: true }).eq('tenant_id', tenant).eq('revoked', false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
