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

export async function POST(request: NextRequest) {
  try {
    const { email, company, address, taxIds, province } = await request.json();

    // Validation des données requises
    if (!email || !company) {
      return NextResponse.json(
        { error: 'Email et nom de compagnie requis' },
        { status: 400 }
      );
    }

    // Créer le client Stripe
    const customer = await stripe.customers.create({
      email,
      name: company,
      description: `Client C-Secur360 - ${company}`,
      address: address ? {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: 'CA'
      } : undefined,
      metadata: {
        company,
        province: province || 'QC',
        source: 'c-secur360'
      }
    });

    // Enregistrer dans Supabase
    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          email,
          company_name: company,
          stripe_customer_id: customer.id,
          province: province || 'QC',
          address,
          tax_ids: taxIds,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      // Nettoyer le client Stripe si erreur Supabase
      await stripe.customers.del(customer.id);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du client' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        supabase_id: data.id
      }
    });

  } catch (error) {
    console.error('Erreur création client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    );
  }
}