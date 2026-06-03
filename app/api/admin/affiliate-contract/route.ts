// Route admin — contrat d'affiliation co-vendeur (#51).
// GET  ?tenantId=...  -> contrat enregistre, ou brouillon prerempli (vendeur assigne + date de creation du tenant).
// POST { ...contrat } -> cree/met a jour le contrat (upsert sur tenant_id).
// Gardee par requireAdmin (cookie super-admin, session super_admin ou secret de sync). Service-role via supabaseAdmin.
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { defaultContract, type AffiliateContract } from '@/lib/affiliateContract';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId requis' }, { status: 400 });

  // Contrat existant ?
  const { data: existing } = await supabaseAdmin
    .from('tenant_affiliate_contracts').select('*').eq('tenant_id', tenantId).maybeSingle();
  if (existing) return NextResponse.json(existing);

  // Aucun : construire un brouillon prerempli depuis le vendeur assigne et la date de creation du tenant.
  let vendorName = '', vendorEmail = '', commission = 20, startDate: string | null = null;
  try {
    const { data: tenant } = await supabaseAdmin
      .from('tenants').select('created_at, vendor_id').eq('id', tenantId).maybeSingle();
    if (tenant?.created_at) startDate = String(tenant.created_at).slice(0, 10);
    if (tenant?.vendor_id) {
      const { data: v } = await supabaseAdmin
        .from('vendors').select('name, email, commission_rate').eq('id', tenant.vendor_id).maybeSingle();
      if (v) {
        vendorName = v.name || '';
        vendorEmail = v.email || '';
        if (v.commission_rate != null) commission = Math.round(Number(v.commission_rate) * 100 * 100) / 100;
      }
    }
  } catch { /* degrade : table tenants/vendors absente -> brouillon vierge */ }

  return NextResponse.json(
    defaultContract(tenantId, { vendor_name: vendorName, vendor_email: vendorEmail, commission_pct: commission, start_date: startDate }),
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  let body: AffiliateContract;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  if (!body?.tenant_id) return NextResponse.json({ error: 'tenant_id requis' }, { status: 400 });

  const payload: Record<string, any> = {
    tenant_id: body.tenant_id,
    vendor_name: body.vendor_name || null,
    vendor_email: body.vendor_email || null,
    commission_pct: Number(body.commission_pct) || 0,
    inflation_pct: Number(body.inflation_pct) || 0,
    recurrence: body.recurrence || 'annuelle',
    start_date: body.start_date || null,
    clauses: body.clauses || null,
    signataire_name: body.signataire_name || null,
    signataire_title: body.signataire_title || null,
    signed_at: body.signed_at || null,
    status: body.status || 'brouillon',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('tenant_affiliate_contracts')
    .upsert(payload, { onConflict: 'tenant_id' })
    .select('*').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
