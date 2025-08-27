import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fonction pour envoyer des notifications à Eric
async function sendAdminNotification(type: string, data: any) {
  const adminEmail = 'eric.dufort@cerdia.ai';
  
  // Notification par email (à implémenter avec votre service d'email)
  console.log(`📧 Notification Admin [${type}]:`, {
    to: adminEmail,
    type,
    data,
    timestamp: new Date().toISOString()
  });

  // Ici vous pouvez intégrer:
  // - SendGrid, Resend, ou autre service d'email
  // - SMS via Twilio
  // - Notification Slack
  // - Webhook vers Make.com pour automation
}

// Mettre à jour les données du tenant dans Supabase
async function updateTenantSubscription(customerId: string, subscriptionData: any) {
  try {
    // Récupérer le tenant par customer_id
    const { data: tenant, error: findError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('stripe_customer_id', customerId)
      .single();

    if (findError || !tenant) {
      console.error('Tenant non trouvé pour customer_id:', customerId);
      return false;
    }

    // Mettre à jour les données d'abonnement
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        stripe_subscription_id: subscriptionData.id,
        subscription_plan: subscriptionData.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly',
        monthly_amount: subscriptionData.items.data[0].price.unit_amount / 100, // Stripe utilise les centimes
        status: subscriptionData.status === 'active' ? 'active' : 'suspended',
        payment_status: subscriptionData.status === 'active' ? 'paid' : 'pending',
        current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tenant.id);

    if (updateError) {
      console.error('Erreur mise à jour tenant:', updateError);
      return false;
    }

    console.log(`✅ Tenant ${tenant.name} mis à jour avec succès`);
    return true;
  } catch (error) {
    console.error('Erreur updateTenantSubscription:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Signature Stripe manquante');
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erreur signature webhook:', err);
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }

    console.log(`📥 Webhook Stripe reçu: ${event.type}`);

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`🔄 Abonnement ${event.type === 'customer.subscription.created' ? 'créé' : 'mis à jour'}:`, {
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
          amount: subscription.items.data[0]?.price.unit_amount
        });

        // Mettre à jour dans Supabase
        const updated = await updateTenantSubscription(customerId, subscription);
        
        if (updated) {
          await sendAdminNotification('subscription_updated', {
            type: event.type,
            customerId,
            subscriptionId: subscription.id,
            status: subscription.status,
            amount: subscription.items.data[0]?.price.unit_amount / 100,
            plan: subscription.items.data[0]?.price.recurring?.interval
          });
        }
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('🗑️ Abonnement annulé:', { customerId, subscriptionId: subscription.id });

        // Marquer le tenant comme annulé
        const { error } = await supabase
          .from('tenants')
          .update({
            status: 'cancelled',
            payment_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (!error) {
          await sendAdminNotification('subscription_cancelled', {
            customerId,
            subscriptionId: subscription.id,
            cancelled_at: new Date().toISOString()
          });
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log('✅ Paiement réussi:', {
          customerId,
          invoiceId: invoice.id,
          amount: invoice.amount_paid / 100
        });

        // Mettre à jour le statut de paiement
        const { error } = await supabase
          .from('tenants')
          .update({
            payment_status: 'paid',
            last_payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (!error) {
          await sendAdminNotification('payment_succeeded', {
            customerId,
            invoiceId: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase()
          });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log('❌ Échec de paiement:', {
          customerId,
          invoiceId: invoice.id,
          amount: invoice.amount_due / 100
        });

        // Marquer comme paiement échoué
        const { error } = await supabase
          .from('tenants')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);

        if (!error) {
          await sendAdminNotification('payment_failed', {
            customerId,
            invoiceId: invoice.id,
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            failure_reason: invoice.last_finalization_error?.message
          });
        }

        break;
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log('🔔 Facture à venir:', {
          customerId,
          amount: invoice.amount_due / 100,
          dueDate: new Date(invoice.due_date! * 1000)
        });

        await sendAdminNotification('invoice_upcoming', {
          customerId,
          amount: invoice.amount_due / 100,
          currency: invoice.currency.toUpperCase(),
          due_date: new Date(invoice.due_date! * 1000).toISOString(),
          days_until_due: Math.ceil((invoice.due_date! * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
        });

        break;
      }

      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;

        console.log(`👤 Client ${event.type === 'customer.created' ? 'créé' : 'mis à jour'}:`, {
          customerId: customer.id,
          email: customer.email,
          name: customer.name
        });

        // Optionnel: mettre à jour les infos client dans Supabase si nécessaire
        if (customer.email && customer.name) {
          const { error } = await supabase
            .from('tenants')
            .update({
              contact_email: customer.email,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customer.id);

          if (!error) {
            await sendAdminNotification('customer_updated', {
              customerId: customer.id,
              email: customer.email,
              name: customer.name
            });
          }
        }

        break;
      }

      default:
        console.log(`ℹ️ Événement non traité: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Erreur traitement webhook Stripe:', error);
    
    await sendAdminNotification('webhook_error', {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Désactiver la vérification du body parser pour les webhooks Stripe
export const dynamic = 'force-dynamic';