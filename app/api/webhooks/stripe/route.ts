import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const sig = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Erreur vérification webhook:', err);
      return NextResponse.json(
        { error: 'Signature webhook invalide' },
        { status: 400 }
      );
    }

    // Traitement des événements Stripe
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'mandate.updated':
        await handleMandateUpdated(event.data.object as Stripe.Mandate);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}

// === HANDLERS D'ÉVÉNEMENTS ===

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout complété:', session.id);

  // === Connect : paiement d'une FACTURE de tenant (Commerce) ===
  // La session a été créée avec metadata.kind = 'commerce_invoice' (route /api/stripe/connect/pay).
  if (session.metadata?.kind === 'commerce_invoice') {
    const tenant = session.metadata.tenant || '';
    const invoiceId = session.metadata.invoice_id || '';
    if (tenant && invoiceId) {
      try {
        // setInvoiceStatus marque payée + auto-poste vente & encaissement au GL (idempotent par gl_entry_id).
        const { setInvoiceStatus } = await import('@/lib/invoicing');
        await setInvoiceStatus(tenant, invoiceId, 'paid');
        // Référence de paiement Stripe (best-effort ; colonne optionnelle).
        await supabase.from('commerce_invoices')
          .update({ stripe_payment_intent: (session.payment_intent as string) || null })
          .eq('id', invoiceId).eq('tenant_id', tenant);
        console.log(`✅ Facture ${invoiceId} (${tenant}) payée via Stripe Connect.`);
      } catch (error) {
        console.error('Erreur paiement facture Connect:', error);
      }
    }
    return; // ne pas exécuter la logique de billing plateforme
  }

  try {
    // Mettre à jour le statut de la session
    await supabase
      .from('checkout_sessions')
      .update({
        status: 'completed',
        stripe_subscription_id: session.subscription,
        completed_at: new Date().toISOString()
      })
      .eq('stripe_session_id', session.id);

    // Activer l'accès client si abonnement créé
    if (session.subscription) {
      const customerSupabaseId = session.metadata?.customer_supabase_id;
      if (customerSupabaseId) {
        await supabase
          .from('customers')
          .update({
            subscription_status: 'active',
            stripe_subscription_id: session.subscription,
            trial_end: null, // Will be updated separately if needed
            updated_at: new Date().toISOString()
          })
          .eq('id', customerSupabaseId);

        // Créer l'entrée d'abonnement
        await supabase
          .from('subscriptions')
          .insert([
            {
              customer_id: customerSupabaseId,
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              plan_type: session.metadata?.plan_type || 'monthly',
              additional_sites: parseInt(session.metadata?.additional_sites || '0'),
              status: 'active',
              current_period_start: new Date().toISOString(),
              created_at: new Date().toISOString()
            }
          ]);
      }
    }

  } catch (error) {
    console.error('Erreur handleCheckoutCompleted:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('💳 Facture payée:', invoice.id);
  
  try {
    // Enregistrer la facture
    await supabase
      .from('invoices')
      .upsert([
        {
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          amount_total: invoice.amount_paid,
          tax_amount: invoice.tax || 0,
          status: 'paid',
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
          created_at: new Date(invoice.created * 1000).toISOString()
        }
      ]);

    // Maintenir l'abonnement actif
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          last_payment_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      // Mettre à jour le statut client
      await supabase
        .from('customers')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', invoice.customer);
    }

  } catch (error) {
    console.error('Erreur handleInvoicePaid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Échec paiement facture:', invoice.id);
  
  try {
    // Enregistrer l'échec de paiement
    await supabase
      .from('invoices')
      .upsert([
        {
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          stripe_subscription_id: invoice.subscription,
          amount_total: invoice.amount_due,
          status: 'payment_failed',
          attempt_count: invoice.attempt_count,
          next_payment_attempt: invoice.next_payment_attempt 
            ? new Date(invoice.next_payment_attempt * 1000).toISOString()
            : null,
          created_at: new Date(invoice.created * 1000).toISOString()
        }
      ]);

    // Marquer l'abonnement comme en défaut
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      // Suspendre l'accès client après 3 échecs
      if (invoice.attempt_count >= 3) {
        await supabase
          .from('customers')
          .update({
            subscription_status: 'suspended',
            suspension_reason: 'payment_failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', invoice.customer);
      }
    }

  } catch (error) {
    console.error('Erreur handleInvoicePaymentFailed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Abonnement créé:', subscription.id);
  
  try {
    // Créer l'enregistrement d'abonnement
    await supabase
      .from('subscriptions')
      .upsert([
        {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          created_at: new Date(subscription.created * 1000).toISOString()
        }
      ]);

  } catch (error) {
    console.error('Erreur handleSubscriptionCreated:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Abonnement mis à jour:', subscription.id);
  
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Mettre à jour le statut client
    await supabase
      .from('customers')
      .update({
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', subscription.customer);

  } catch (error) {
    console.error('Erreur handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ Abonnement supprimé:', subscription.id);
  
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Désactiver l'accès client
    await supabase
      .from('customers')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', subscription.customer);

  } catch (error) {
    console.error('Erreur handleSubscriptionDeleted:', error);
  }
}

// Suivi de l'onboarding Connect d'un tenant : active l'encaissement quand Stripe confirme charges_enabled.
async function handleAccountUpdated(account: Stripe.Account) {
  console.log('🔗 Compte Connect mis à jour:', account.id, 'charges_enabled=', account.charges_enabled);
  try {
    await supabase
      .from('company_settings')
      .update({ stripe_charges_enabled: !!account.charges_enabled, updated_at: new Date().toISOString() })
      .eq('stripe_account_id', account.id);
  } catch (error) {
    console.error('Erreur handleAccountUpdated:', error);
  }
}

async function handleMandateUpdated(mandate: Stripe.Mandate) {
  console.log('📝 Mandat PAD mis à jour:', mandate.id);
  
  try {
    // Enregistrer l'état du mandat PAD/ACSS
    await supabase
      .from('payment_methods')
      .upsert([
        {
          stripe_mandate_id: mandate.id,
          stripe_customer_id: mandate.customer_acceptance?.online?.user_agent || '',
          type: 'acss_debit',
          status: mandate.status,
          created_at: new Date().toISOString()
        }
      ]);

  } catch (error) {
    console.error('Erreur handleMandateUpdated:', error);
  }
}