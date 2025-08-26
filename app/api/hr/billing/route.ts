import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

interface BillingProfileData {
  rate_normal: number;
  rate_overtime_1_5: number;
  rate_overtime_2_0: number;
  per_diem_rate?: number;
  vehicle_rate_light?: number;
  vehicle_rate_trailer?: number;
  custom_rates?: any;
  currency?: string;
  tax_rate?: number;
  rounding_minutes?: number;
  minimum_billable_hours?: number;
  payment_terms_days?: number;
  invoice_prefix?: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id') || request.headers.get('x-tenant-id') || 'demo';
    
    const { data: billingProfile, error } = await supabase
      .from('client_billing_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil de facturation' },
        { status: 500 }
      );
    }

    if (!billingProfile) {
      return NextResponse.json({
        billingProfile: {
          tenant_id,
          rate_normal: 140.00,
          rate_overtime_1_5: 210.00,
          rate_overtime_2_0: 280.00,
          per_diem_rate: 75.00,
          vehicle_rate_light: 0.68,
          vehicle_rate_trailer: 0.72,
          custom_rates: {
            "supervision": 160.00,
            "emergency_call": 200.00,
            "specialized_equipment": 180.00,
            "weekend_premium": 1.25,
            "holiday_premium": 2.00
          },
          currency: 'CAD',
          tax_rate: 0.14975,
          rounding_minutes: 15,
          minimum_billable_hours: 0.25,
          payment_terms_days: 30,
          invoice_prefix: 'CSR',
          exists: false
        }
      });
    }

    return NextResponse.json({
      billingProfile: {
        ...billingProfile,
        exists: true
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du profil de facturation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const body: BillingProfileData = await request.json();
    const tenant_id = request.headers.get('x-tenant-id') || 'demo';

    const requiredFields = ['rate_normal', 'rate_overtime_1_5', 'rate_overtime_2_0'];
    for (const field of requiredFields) {
      if (!body[field as keyof BillingProfileData] || body[field as keyof BillingProfileData] <= 0) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis et doit être positif` },
          { status: 400 }
        );
      }
    }

    const { data: existingProfile } = await supabase
      .from('client_billing_profiles')
      .select('id')
      .eq('tenant_id', tenant_id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Un profil de facturation existe déjà pour ce tenant' },
        { status: 400 }
      );
    }

    const billingData = {
      tenant_id,
      rate_normal: body.rate_normal,
      rate_overtime_1_5: body.rate_overtime_1_5,
      rate_overtime_2_0: body.rate_overtime_2_0,
      per_diem_rate: body.per_diem_rate || 75.00,
      vehicle_rate_light: body.vehicle_rate_light || 0.68,
      vehicle_rate_trailer: body.vehicle_rate_trailer || 0.72,
      custom_rates: body.custom_rates || {
        "supervision": 160.00,
        "emergency_call": 200.00,
        "specialized_equipment": 180.00,
        "weekend_premium": 1.25,
        "holiday_premium": 2.00
      },
      currency: body.currency || 'CAD',
      tax_rate: body.tax_rate || 0.14975,
      rounding_minutes: body.rounding_minutes || 15,
      minimum_billable_hours: body.minimum_billable_hours || 0.25,
      payment_terms_days: body.payment_terms_days || 30,
      invoice_prefix: body.invoice_prefix || 'CSR'
    };

    const { data: billingProfile, error } = await supabase
      .from('client_billing_profiles')
      .insert(billingData)
      .select()
      .single();

    if (error) {
      console.error('Billing profile creation error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil de facturation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      billingProfile,
      message: 'Profil de facturation créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du profil de facturation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const body = await request.json();
    const tenant_id = request.headers.get('x-tenant-id') || 'demo';
    const { id, ...updateData } = body;

    const rateFields = ['rate_normal', 'rate_overtime_1_5', 'rate_overtime_2_0'];
    for (const field of rateFields) {
      if (updateData[field] !== undefined && updateData[field] <= 0) {
        return NextResponse.json(
          { error: `Le taux ${field} doit être positif` },
          { status: 400 }
        );
      }
    }

    const { data: billingProfile, error } = await supabase
      .from('client_billing_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Billing profile update error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil de facturation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      billingProfile,
      message: 'Profil de facturation mis à jour avec succès'
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du profil de facturation' },
      { status: 500 }
    );
  }
}

export async function calculateBillableAmount(
  hours: number,
  overtime_type: 'normal' | 'overtime_1_5' | 'overtime_2_0',
  tenant_id: string,
  custom_rate_type?: string
) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: billingProfile } = await supabase
    .from('client_billing_profiles')
    .select('*')
    .eq('tenant_id', tenant_id)
    .single();

  if (!billingProfile) {
    const defaultRates = {
      normal: 140.00,
      overtime_1_5: 210.00,
      overtime_2_0: 280.00
    };
    return hours * defaultRates[overtime_type];
  }

  if (custom_rate_type && billingProfile.custom_rates[custom_rate_type]) {
    const baseRate = billingProfile[`rate_${overtime_type}`];
    const multiplier = billingProfile.custom_rates[custom_rate_type];
    return hours * baseRate * multiplier;
  }

  const rate = billingProfile[`rate_${overtime_type}`];
  return hours * rate;
}