// Marquer un abonnement PAYÉ + écrire AUTO une transaction de revenu (réconciliation bidirectionnelle #35).
// body { tenant?, id, date?, amount?, proof_url?, note?, province?, taxable?, treasury_account_id?, createTransaction? }
//  - enregistre le paiement dans l'historique de l'abonnement, avance l'échéance, garde la preuve ;
//  - crée (par défaut) une transaction de REVENU avec la classe de revenu de l'abonnement, et la comptabilise.
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { saveTransaction, nextTransactionNumber, type Transaction } from '@/lib/transactions';
import { postTransactionNow } from '@/lib/accountingAuto';
import { recordSubPayment } from '@/lib/recurring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effTenant(u, body.tenant);
  if (!tenant || !body.id) return NextResponse.json({ error: 'tenant/id requis' }, { status: 400 });

  const { data: sub } = await supabaseAdmin.from('recurring_subscriptions').select('*').eq('id', body.id).eq('tenant_id', tenant).maybeSingle();
  if (!sub) return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 });

  const date = (body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) ? body.date : new Date().toISOString().slice(0, 10);
  const amount = Number(body.amount) > 0 ? Number(body.amount) : (Number((sub as any).amount) || 0);

  let transactionId: string | null = null;
  try {
    if (body.createTransaction !== false && amount > 0) {
      const province = body.province || (sub as any).province || 'QC';
      const items = [{ description: `${(sub as any).plan_name || 'Abonnement'} — ${(sub as any).client_name}`, account_code: '4000', amount, taxable: body.taxable !== false, revenue_category: (sub as any).revenue_category || null }];
      const number = await nextTransactionNumber(tenant);
      const header: Transaction = {
        transaction_number: number, vendor_id: (sub as any).client_id || null, vendor_name: (sub as any).client_name,
        txn_type: 'revenue', txn_date: date, province, payment_method: 'cash', status: 'posted',
        subtotal: 0, gst_rate: 0, qst_rate: 0, pst_rate: 0, gst_amount: 0, qst_amount: 0, pst_amount: 0, total: 0,
        receipt_url: body.proof_url || null, notes: `Abonnement récurrent — ${(sub as any).plan_name || ''}`,
        treasury_account_id: body.treasury_account_id || null, revenue_category: (sub as any).revenue_category || null,
      };
      transactionId = await saveTransaction(tenant, header, items as any);
      await postTransactionNow(tenant, transactionId);
    }
    await recordSubPayment(tenant, sub as any, { date, amount, transaction_id: transactionId, proof_url: body.proof_url || null, note: body.note || null });
    return NextResponse.json({ ok: true, transactionId });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}
