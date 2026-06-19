// Réconciliation INVERSE (#35) : depuis une TRANSACTION existante, lier un abonnement → met son statut à
// jour (paiement à l'historique, échéance avancée, preuve) SANS recréer de transaction.
// body { tenant?, subscriptionId, transactionId } → lit la transaction (date/montant/preuve) et enregistre le paiement.
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { recordSubPayment } from '@/lib/recurring';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effTenant(u, body.tenant);
  if (!tenant || !body.subscriptionId || !body.transactionId) return NextResponse.json({ error: 'tenant/subscriptionId/transactionId requis' }, { status: 400 });

  const [{ data: sub }, { data: txn }] = await Promise.all([
    supabaseAdmin.from('recurring_subscriptions').select('*').eq('id', body.subscriptionId).eq('tenant_id', tenant).maybeSingle(),
    supabaseAdmin.from('commerce_transactions').select('*').eq('id', body.transactionId).eq('tenant_id', tenant).maybeSingle(),
  ]);
  if (!sub) return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 });
  if (!txn) return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });

  const date = (txn as any).txn_date || new Date().toISOString().slice(0, 10);
  const amount = Number((txn as any).subtotal) || Number((txn as any).total) || Number((sub as any).amount) || 0;
  try {
    await recordSubPayment(tenant, sub as any, { date, amount, transaction_id: (txn as any).id, proof_url: (txn as any).receipt_url || null, note: 'Lié depuis une transaction' });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Erreur' }, { status: 400 }); }
}
