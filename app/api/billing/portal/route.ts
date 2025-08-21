import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 }
      );
    }

    // Créer une session de portail client
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
      configuration: {
        business_profile: {
          headline: 'Gestion abonnement C-Secur360',
        },
        features: {
          payment_method_update: {
            enabled: true,
          },
          invoice_history: {
            enabled: true,
          },
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'address', 'phone', 'tax_id'],
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            proration_behavior: 'none',
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features', 
                'switched_service',
                'unused',
                'other'
              ],
            },
          },
          subscription_pause: {
            enabled: false, // Désactivé pour C-Secur360
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price', 'quantity'],
            proration_behavior: 'create_prorations',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url
    });

  } catch (error) {
    console.error('Erreur création portail client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du portail client' },
      { status: 500 }
    );
  }
}