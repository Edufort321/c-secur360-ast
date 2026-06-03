// Route admin — paiements de commission d'affiliation (#69).
// POST { action:'pay', commission_id, method?, reference?, notes? }
//        -> cree un paiement (statut paye) et passe la commission a « paye ».
// POST { action:'cancel', payment_id }
//        -> annule le paiement et remet la commission « en attente ».
// GET  [?vendorId][?tenantId]            -> { payments } (historique enrichi vendeur+client)
// GET  [?vendorId][?tenantId]&view=expenses -> { expenses } (paiements regles mappes en depenses, compte 5050)
// Gardee par requireAdmin. Service-role via supabaseAdmin. Degrade en liste vide si table absente.
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paymentsToExpenses, type AffiliateCommissionPayment } from '@/lib/affiliatePayments';

export const dynamic = 'force-dynamic';

async function tenantNames(ids: string[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  const real = ids.filter(Boolean);
  if (!real.length) return names;
  const { data } = await supabaseAdmin.from('tenants').select('id, companyName').in('id', real);
  for (const t of data || []) names[(t as any).id] = (t as any).companyName || (t as any).id;
  return names;
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = body?.action || 'pay';

  if (action === 'pay') {
    const commissionId = body?.commission_id;
    if (!commissionId) return NextResponse.json({ error: 'commission_id requis' }, { status: 400 });

    const { data: comm, error: cErr } = await supabaseAdmin
      .from('vendor_commissions').select('*').eq('id', commissionId).maybeSingle();
    if (cErr || !comm) return NextResponse.json({ error: 'Commission introuvable' }, { status: 404 });
    if (comm.status === 'paid') return NextResponse.json({ error: 'Commission deja payee' }, { status: 409 });

    const now = new Date().toISOString();
    const { data: payment, error: pErr } = await supabaseAdmin
      .from('affiliate_commission_payments')
      .insert({
        commission_id: commissionId,
        vendor_id: comm.vendor_id,
        tenant_id: comm.tenant_id,
        due_date: comm.due_date,
        amount: comm.amount,
        method: body.method || null,
        reference: body.reference || null,
        notes: body.notes || null,
        paid_at: now,
        status: 'paid',
      })
      .select('*').maybeSingle();
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

    await supabaseAdmin.from('vendor_commissions')
      .update({ status: 'paid', paid_at: now }).eq('id', commissionId);

    return NextResponse.json({ payment });
  }

  if (action === 'cancel') {
    const paymentId = body?.payment_id;
    if (!paymentId) return NextResponse.json({ error: 'payment_id requis' }, { status: 400 });

    const { data: pay } = await supabaseAdmin
      .from('affiliate_commission_payments').select('*').eq('id', paymentId).maybeSingle();
    if (!pay) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });

    const { error: uErr } = await supabaseAdmin
      .from('affiliate_commission_payments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', paymentId);
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

    if (pay.commission_id) {
      await supabaseAdmin.from('vendor_commissions')
        .update({ status: 'pending', paid_at: null }).eq('id', pay.commission_id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const sp = req.nextUrl.searchParams;
  const vendorId = sp.get('vendorId');
  const tenantId = sp.get('tenantId');
  const view = sp.get('view');

  let q = supabaseAdmin
    .from('affiliate_commission_payments')
    .select('*, vendors(name)')
    .order('paid_at', { ascending: false, nullsFirst: false });
  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (tenantId) q = q.eq('tenant_id', tenantId);

  const { data: raw, error } = await q;
  const rows = error ? [] : (raw || []);
  const names = await tenantNames(Array.from(new Set(rows.map((r: any) => r.tenant_id))));
  const payments: AffiliateCommissionPayment[] = rows.map((r: any) => ({
    ...r,
    vendor_name: r.vendors?.name || null,
    tenant_name: r.tenant_id ? (names[r.tenant_id] || r.tenant_id) : null,
  }));

  if (view === 'expenses') return NextResponse.json({ expenses: paymentsToExpenses(payments) });
  return NextResponse.json({ payments });
}
