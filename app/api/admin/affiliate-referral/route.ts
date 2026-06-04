// Route admin — parrainage co-vendeur (#78).
// GET ?vendorId=...  -> { referral_code, referred[] } : code du vendeur + inscriptions attribuees.
// GET ?code=...      -> { vendor: {id, name} } : resolution d'un code (pour le flux d'inscription).
// POST { action:'generate', vendorId } -> genere/regenere un code unique.
// POST { action:'attribute', code, tenantId } -> attribue le tenant au vendeur (referred_by + vendor_id).
// Gardee par requireAdmin. Service-role via supabaseAdmin.
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { slugifyCode } from '@/lib/affiliateReferral';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const sp = req.nextUrl.searchParams;
  const vendorId = sp.get('vendorId');
  const code = sp.get('code');

  if (code) {
    const { data: v } = await supabaseAdmin.from('vendors').select('id, name').eq('referral_code', code).maybeSingle();
    return NextResponse.json({ vendor: v || null });
  }

  if (!vendorId) return NextResponse.json({ error: 'vendorId ou code requis' }, { status: 400 });

  const { data: vendor } = await supabaseAdmin.from('vendors').select('referral_code').eq('id', vendorId).maybeSingle();
  const { data: refs } = await supabaseAdmin
    .from('tenants').select('id, companyName, created_at').eq('referred_by', vendorId).order('created_at', { ascending: false });
  const referred = (refs || []).map((t: any) => ({ tenant_id: t.id, tenant_name: t.companyName || t.id, created_at: t.created_at || null }));
  return NextResponse.json({ referral_code: vendor?.referral_code ?? null, referred });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = body?.action;

  if (action === 'generate') {
    const vendorId = body?.vendorId;
    if (!vendorId) return NextResponse.json({ error: 'vendorId requis' }, { status: 400 });
    const { data: vendor } = await supabaseAdmin.from('vendors').select('id, name').eq('id', vendorId).maybeSingle();
    if (!vendor) return NextResponse.json({ error: 'Vendeur introuvable' }, { status: 404 });

    const base = slugifyCode(vendor.name);
    let code = '';
    for (let i = 0; i < 6; i++) {
      const candidate = `${base}-${crypto.randomBytes(3).toString('hex')}`;
      const { data: clash } = await supabaseAdmin.from('vendors').select('id').eq('referral_code', candidate).maybeSingle();
      if (!clash) { code = candidate; break; }
    }
    if (!code) return NextResponse.json({ error: 'Impossible de generer un code unique' }, { status: 500 });

    const { error } = await supabaseAdmin.from('vendors').update({ referral_code: code }).eq('id', vendorId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ referral_code: code });
  }

  if (action === 'attribute') {
    const { code, tenantId } = body || {};
    if (!code || !tenantId) return NextResponse.json({ error: 'code et tenantId requis' }, { status: 400 });
    const { data: vendor } = await supabaseAdmin.from('vendors').select('id, name').eq('referral_code', code).maybeSingle();
    if (!vendor) return NextResponse.json({ error: 'Code de parrainage inconnu' }, { status: 404 });

    const { error } = await supabaseAdmin.from('tenants')
      .update({ referred_by: vendor.id, vendor_id: vendor.id }).eq('id', tenantId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ vendor_id: vendor.id, vendor_name: vendor.name });
  }

  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
