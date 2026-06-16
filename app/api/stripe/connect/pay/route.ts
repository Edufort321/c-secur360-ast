import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSessionUser } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Crée un lien de paiement (Checkout) pour une FACTURE du tenant — destination charge vers le compte
// connecté du tenant + commission plateforme (application_fee). Le webhook marquera la facture payée.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const effTenant = (u: any, t?: string | null) => (u?.role === 'super_admin' && t ? String(t) : (u?.tenant_id || ''));

export async function POST(req: NextRequest) {
  const u = await getSessionUser(req);
  if (!u) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effTenant(u, body.tenant);
  const invoiceId = String(body.invoiceId || '');
  if (!tenant || !invoiceId) return NextResponse.json({ error: 'tenant/invoiceId requis' }, { status: 400 });

  const { data: cs } = await supabaseAdmin.from('company_settings').select('stripe_account_id').eq('tenant_id', tenant).maybeSingle();
  if (!cs?.stripe_account_id) return NextResponse.json({ error: 'Compte Stripe du tenant non connecté.' }, { status: 400 });
  const { data: inv } = await supabaseAdmin.from('commerce_invoices').select('*').eq('id', invoiceId).eq('tenant_id', tenant).maybeSingle();
  if (!inv) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  const amount = Math.round((Number(inv.total) || 0) * 100);
  if (amount < 50) return NextResponse.json({ error: 'Montant trop faible.' }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const feeBps = Number(process.env.STRIPE_PLATFORM_FEE_BPS || 0); // commission plateforme (points de base)
  const fee = Math.round(amount * feeBps / 10000);
  const origin = req.headers.get('origin') || new URL(req.url).origin;
  try {
    // DIRECT CHARGE : la session est créée SUR le compte connecté du tenant (header Stripe-Account).
    // → le tenant est le commerçant officiel (frais Stripe + litiges sur lui), la plateforme prélève
    //   application_fee_amount (sa commission). L'événement revient via le webhook « comptes connectés ».
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'cad', product_data: { name: `Facture ${inv.invoice_number}` }, unit_amount: amount }, quantity: 1 }],
      ...(fee > 0 ? { payment_intent_data: { application_fee_amount: fee } } : {}),
      success_url: `${origin}/${tenant}/admin?tab=factures&paid=1`,
      cancel_url: `${origin}/${tenant}/admin?tab=factures&paid=0`,
      metadata: { kind: 'commerce_invoice', tenant, invoice_id: invoiceId },
    }, { stripeAccount: cs.stripe_account_id });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur Stripe' }, { status: 400 });
  }
}
