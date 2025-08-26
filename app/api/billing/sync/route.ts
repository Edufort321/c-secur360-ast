import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { audit, auditHelpers } from '@/lib/audit';
nexport const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Vérification que c'est bien un cron Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      await audit('billing', 'sync_unauthorized', { 
        ip: request.ip,
        userAgent: request.headers.get('user-agent') 
      });
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await auditHelpers.config('billing_sync_start', { 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });

    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // 1. Synchroniser les subscriptions Stripe vers Supabase
      const subscriptions = await stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.customer']
      });

      for (const subscription of subscriptions.data) {
        try {
          const customer = subscription.customer as Stripe.Customer;
          
          // Vérifier si le customer existe dans Supabase
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('stripe_customer_id', customer.id)
            .single();

          if (!existingCustomer) {
            // Créer le customer s'il n'existe pas
            const { error: customerError } = await supabase
              .from('customers')
              .insert({
                stripe_customer_id: customer.id,
                email: customer.email,
                name: customer.name,
                created_at: new Date(customer.created * 1000).toISOString(),
                updated_at: new Date().toISOString()
              });

            if (customerError) {
              errors.push(`Customer ${customer.id}: ${customerError.message}`);
              errorCount++;
              continue;
            }
          }

          // Synchroniser la subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              id: subscription.id,
              customer_id: customer.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              created_at: new Date(subscription.created * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              metadata: subscription.metadata
            }, {
              onConflict: 'id'
            });

          if (subError) {
            errors.push(`Subscription ${subscription.id}: ${subError.message}`);
            errorCount++;
          } else {
            syncedCount++;
          }

        } catch (subError) {
          const errorMsg = subError instanceof Error ? subError.message : 'Unknown error';
          errors.push(`Subscription ${subscription.id}: ${errorMsg}`);
          errorCount++;
        }
      }

      // 2. Synchroniser les invoices récentes (dernières 48h)
      const twoDaysAgo = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);
      const invoices = await stripe.invoices.list({
        created: { gte: twoDaysAgo },
        limit: 100
      });

      for (const invoice of invoices.data) {
        try {
          const { error: invoiceError } = await supabase
            .from('invoices')
            .upsert({
              id: invoice.id,
              subscription_id: invoice.subscription as string,
              customer_id: invoice.customer as string,
              amount_paid: invoice.amount_paid,
              amount_due: invoice.amount_due,
              status: invoice.status,
              created_at: new Date(invoice.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (invoiceError) {
            errors.push(`Invoice ${invoice.id}: ${invoiceError.message}`);
            errorCount++;
          }
        } catch (invError) {
          const errorMsg = invError instanceof Error ? invError.message : 'Unknown error';
          errors.push(`Invoice ${invoice.id}: ${errorMsg}`);
          errorCount++;
        }
      }

      await auditHelpers.config('billing_sync_complete', {
        syncedCount,
        errorCount,
        subscriptions: subscriptions.data.length,
        invoices: invoices.data.length,
        errors: errors.slice(0, 5) // Limiter les erreurs dans les logs
      });

      return NextResponse.json({
        success: true,
        message: 'Billing sync completed',
        stats: {
          syncedCount,
          errorCount,
          subscriptionsProcessed: subscriptions.data.length,
          invoicesProcessed: invoices.data.length
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined
      });

    } catch (syncError) {
      const errorMsg = syncError instanceof Error ? syncError.message : 'Unknown sync error';
      
      await audit('billing', 'sync_error', {
        error: errorMsg,
        syncedCount,
        errorCount
      });

      return NextResponse.json({
        success: false,
        error: 'Billing sync failed',
        details: errorMsg,
        stats: { syncedCount, errorCount }
      }, { status: 500 });
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    await audit('billing', 'sync_critical_error', {
      error: errorMsg,
      timestamp: new Date().toISOString()
    });

    console.error('❌ Billing sync critical error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Critical billing sync error',
      details: errorMsg
    }, { status: 500 });
  }
}