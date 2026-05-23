import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plans C-Secur360 selon specs originales
const PLANS = {
  monthly: {
    price_id: process.env.STRIPE_PRICE_MONTHLY!,
    amount: 25000, // 250$ CAD en cents
    interval: 'month'
  },
  annual: {
    price_id: process.env.STRIPE_PRICE_ANNUAL!,
    amount: 300000, // 3000$ CAD en cents (économie de 2 mois)
    interval: 'year'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { 
      customerId, 
      priceId,
      planType, 
      successUrl, 
      cancelUrl,
      additionalSites = 0,
      trialDays = 14 
    } = await request.json();

    // Validation selon specs handoff
    if (!customerId || (!priceId && !planType)) {
      return NextResponse.json(
        { error: 'customerId et priceId/planType requis' },
        { status: 400 }
      );
    }

    // Récupérer les infos client depuis Supabase
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Utiliser priceId direct ou dériver du planType
    const finalPriceId = priceId || (planType ? PLANS[planType as keyof typeof PLANS]?.price_id : null);
    
    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Prix non trouvé pour ce plan' },
        { status: 400 }
      );
    }

    // Line items selon specs (simple)
    const lineItems = [
      {
        price: finalPriceId,
        quantity: 1,
      }
    ];

    // Déterminer le taux de taxe selon la province
    const taxRate = getTaxRateByProvince(customerData.province);

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'acss_debit'], // Cartes + PAD/ACSS
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        customer_supabase_id: customerData.id,
        plan_type: planType,
        additional_sites: '0',
        province: customerData.province
      },
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          customer_supabase_id: customerData.id,
          plan_type: planType,
          additional_sites: additionalSites.toString()
        }
      },
      automatic_tax: {
        enabled: true, // Stripe Tax pour conformité CA/QC
      },
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Abonnement C-Secur360 - ${planType}`,
          metadata: {
            company: customerData.company_name,
            province: customerData.province
          }
        }
      }
    });

    // Enregistrer la session dans Supabase pour suivi
    await supabase
      .from('checkout_sessions')
      .insert([
        {
          stripe_session_id: session.id,
          customer_id: customerData.id,
          plan_type: planType,
          additional_sites: 0,
          amount_total: finalPriceId === PLANS.monthly.price_id ? 25000 : 300000,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erreur création session checkout:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}

// Fonction pour déterminer les taux de taxe par province canadienne
function getTaxRateByProvince(province: string): number {
  const taxRates: Record<string, number> = {
    'QC': 0.14975, // TPS 5% + TVQ 9.975%
    'ON': 0.13,    // HST 13%
    'BC': 0.12,    // TPS 5% + PST 7%
    'AB': 0.05,    // TPS 5% seulement
    'SK': 0.11,    // TPS 5% + PST 6%
    'MB': 0.12,    // TPS 5% + PST 7%
    'NB': 0.15,    // HST 15%
    'NS': 0.15,    // HST 15%
    'PE': 0.15,    // HST 15%
    'NL': 0.15,    // HST 15%
    'YT': 0.05,    // TPS 5% seulement
    'NT': 0.05,    // TPS 5% seulement
    'NU': 0.05     // TPS 5% seulement
  };
  
  return taxRates[province] || 0.14975; // Défaut QC
}