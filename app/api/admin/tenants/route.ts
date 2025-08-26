import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateTenantRequest {
  company_name: string;
  tenant_id: string;
  billing_email: string;
  inventory_email?: string;
  accident_email?: string;
  subscription_type: 'monthly' | 'annual';
  monthly_revenue: number;
  contact_person: string;
  contact_phone: string;
  address?: string;
  city: string;
  province: string;
  postal_code?: string;
  stripe_customer_id?: string;
  notes?: string;
}

// Force dynamic for server-side processing
export const dynamic = 'force-dynamic';

// GET - List all tenants
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const subscription_type = searchParams.get('subscription_type');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (subscription_type && subscription_type !== 'all') {
      query = query.eq('subscription_type', subscription_type);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,tenant_id.ilike.%${search}%,contact_person.ilike.%${search}%`);
    }

    const { data: tenants, error } = await query;

    if (error) {
      console.error('Error fetching tenants:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tenants' }, { status: 500 });
    }

    return NextResponse.json({ tenants });

  } catch (error) {
    console.error('Unexpected error in GET /api/admin/tenants:', error);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}

// POST - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const body: CreateTenantRequest = await request.json();

    // Validation
    if (!body.company_name || !body.tenant_id || !body.billing_email || !body.contact_person) {
      return NextResponse.json({ 
        error: 'Champs requis manquants',
        details: 'company_name, tenant_id, billing_email et contact_person sont requis'
      }, { status: 400 });
    }

    // Validate tenant_id format
    if (!/^[a-z0-9-]+$/.test(body.tenant_id)) {
      return NextResponse.json({ 
        error: 'Format d\'ID tenant invalide',
        details: 'L\'ID tenant doit contenir uniquement des lettres minuscules, chiffres et tirets'
      }, { status: 400 });
    }

    // Check if tenant_id already exists
    const { data: existingTenant, error: checkError } = await supabase
      .from('tenants')
      .select('tenant_id')
      .eq('tenant_id', body.tenant_id)
      .single();

    if (existingTenant) {
      return NextResponse.json({ 
        error: 'ID tenant déjà utilisé',
        details: `L'ID tenant "${body.tenant_id}" est déjà utilisé par un autre client`
      }, { status: 409 });
    }

    // Create Stripe customer if needed
    let stripe_customer_id = body.stripe_customer_id;
    
    if (!stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
      try {
        // Initialize Stripe (if available)
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const customer = await stripe.customers.create({
          name: body.company_name,
          email: body.billing_email,
          phone: body.contact_phone,
          address: body.address ? {
            line1: body.address,
            city: body.city,
            state: body.province,
            postal_code: body.postal_code,
            country: 'CA'
          } : undefined,
          metadata: {
            tenant_id: body.tenant_id,
            subscription_type: body.subscription_type,
            monthly_revenue: body.monthly_revenue.toString()
          }
        });

        stripe_customer_id = customer.id;
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError);
        // Continue without Stripe integration if it fails
      }
    }

    // Insert tenant into database
    const { data: tenant, error: insertError } = await supabase
      .from('tenants')
      .insert([{
        company_name: body.company_name,
        tenant_id: body.tenant_id,
        billing_email: body.billing_email,
        inventory_email: body.inventory_email || null,
        accident_email: body.accident_email || null,
        subscription_type: body.subscription_type,
        monthly_revenue: body.monthly_revenue,
        contact_person: body.contact_person,
        contact_phone: body.contact_phone,
        address: body.address || null,
        city: body.city,
        province: body.province,
        postal_code: body.postal_code || null,
        stripe_customer_id,
        status: 'pending', // Start as pending until activated
        total_users: 0,
        last_activity: new Date().toISOString(),
        notes: body.notes || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ 
        error: 'Erreur lors de la création du tenant',
        details: insertError.message
      }, { status: 500 });
    }

    // Send welcome emails (asynchronous, don't wait for completion)
    try {
      sendWelcomeEmails(tenant);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail the tenant creation if emails fail
    }

    return NextResponse.json({ 
      tenant,
      message: 'Tenant créé avec succès',
      stripe_customer_id: stripe_customer_id ? 'Client Stripe créé' : 'Pas d\'intégration Stripe'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/admin/tenants:', error);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}

// Function to send welcome emails
async function sendWelcomeEmails(tenant: any) {
  // This would integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('Sending welcome emails to:', {
    company: tenant.company_name,
    billing: tenant.billing_email,
    inventory: tenant.inventory_email,
    accident: tenant.accident_email
  });

  // Mock email sending - replace with actual email service
  const emailPromises = [];

  // Billing email
  if (tenant.billing_email) {
    emailPromises.push(
      sendEmail(
        tenant.billing_email,
        `Bienvenue sur C-SECUR360 - ${tenant.company_name}`,
        `Félicitations! Votre compte C-SECUR360 a été créé.
        
        Entreprise: ${tenant.company_name}
        ID Tenant: ${tenant.tenant_id}
        URL d'accès: https://${tenant.tenant_id}.csecur360.ca
        
        Prochaines étapes:
        1. Vous recevrez vos identifiants de connexion sous peu
        2. Notre équipe vous contactera pour la configuration initiale
        3. Formation incluse - nous vous contacterons pour planifier
        
        Questions? Contactez-nous à support@csecur360.ca
        
        L'équipe C-SECUR360`
      )
    );
  }

  // Inventory email (if different)
  if (tenant.inventory_email && tenant.inventory_email !== tenant.billing_email) {
    emailPromises.push(
      sendEmail(
        tenant.inventory_email,
        `Accès inventaire C-SECUR360 - ${tenant.company_name}`,
        `Bonjour,
        
        Vous avez été configuré comme contact pour l'inventaire de ${tenant.company_name} sur C-SECUR360.
        
        Vous recevrez:
        - Notifications de stock bas
        - Rapports d'inventaire automatiques
        - Alertes de mouvements importants
        
        Accès: https://${tenant.tenant_id}.csecur360.ca
        
        L'équipe C-SECUR360`
      )
    );
  }

  // Accident email (if different)
  if (tenant.accident_email && 
      tenant.accident_email !== tenant.billing_email && 
      tenant.accident_email !== tenant.inventory_email) {
    emailPromises.push(
      sendEmail(
        tenant.accident_email,
        `Notifications sécurité C-SECUR360 - ${tenant.company_name}`,
        `Bonjour,
        
        Vous avez été configuré comme contact sécurité pour ${tenant.company_name} sur C-SECUR360.
        
        Vous recevrez:
        - Notifications d'urgence immédiates
        - Rapports d'accidents/incidents
        - Alertes AST critiques
        
        Accès: https://${tenant.tenant_id}.csecur360.ca
        
        L'équipe C-SECUR360`
      )
    );
  }

  // Wait for all emails to be sent
  await Promise.allSettled(emailPromises);
}

// Mock email function - replace with actual email service
async function sendEmail(to: string, subject: string, body: string) {
  // This would use your actual email service
  console.log(`Email sent to ${to}: ${subject}`);
  return Promise.resolve();
}