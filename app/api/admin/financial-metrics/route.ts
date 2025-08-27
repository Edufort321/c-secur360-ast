import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour l'admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TenantSubscription {
  tenant_id: string;
  tenant_name: string;
  subscription_plan: 'monthly' | 'annual';
  monthly_amount: number;
  status: 'active' | 'cancelled' | 'pending' | 'suspended';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  current_period_start: string;
  current_period_end: string;
  total_users: number;
  last_payment_date?: string;
  payment_status: 'paid' | 'pending' | 'overdue' | 'failed';
}

interface FinancialMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  avgRevenuePerCustomer: number;
  monthlyGrowth: number;
  projectedRevenue: number;
  totalUsers: number;
  overduePayments: number;
  pendingPayments: number;
}

// Fonction pour vérifier l'authentification admin
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    // Décoder le token simple (pour la démo)
    const decoded = JSON.parse(atob(token));
    
    if (decoded.email === 'eric.dufort@cerdia.ai' && decoded.role === 'super_admin') {
      return decoded;
    }
  } catch (error) {
    console.error('Erreur décodage token:', error);
  }
  
  return null;
}

// Calculer les métriques financières à partir des données Supabase
async function calculateFinancialMetrics(): Promise<{
  metrics: FinancialMetrics;
  subscriptions: TenantSubscription[];
}> {
  try {
    // Récupérer toutes les données des tenants avec leurs abonnements
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        status,
        created_at,
        subscription_plan,
        monthly_amount,
        stripe_customer_id,
        stripe_subscription_id,
        last_payment_date,
        payment_status,
        current_period_start,
        current_period_end
      `)
      .eq('status', 'active');

    if (tenantsError) {
      console.error('Erreur récupération tenants:', tenantsError);
      throw tenantsError;
    }

    // Récupérer le nombre d'utilisateurs par tenant
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('active', true);

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError);
    }

    // Compter les utilisateurs par tenant
    const usersByTenant: Record<string, number> = {};
    usersData?.forEach(user => {
      if (user.tenant_id) {
        usersByTenant[user.tenant_id] = (usersByTenant[user.tenant_id] || 0) + 1;
      }
    });

    // Transformer les données en format standardisé
    const subscriptions: TenantSubscription[] = (tenantsData || []).map(tenant => ({
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      subscription_plan: tenant.subscription_plan || 'monthly',
      monthly_amount: tenant.monthly_amount || 250,
      status: tenant.status === 'active' ? 'active' : 'suspended',
      stripe_customer_id: tenant.stripe_customer_id,
      stripe_subscription_id: tenant.stripe_subscription_id,
      created_at: tenant.created_at,
      current_period_start: tenant.current_period_start || tenant.created_at,
      current_period_end: tenant.current_period_end || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      total_users: usersByTenant[tenant.id] || 0,
      last_payment_date: tenant.last_payment_date,
      payment_status: tenant.payment_status || 'pending'
    }));

    // Calculer les métriques
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    
    // MRR = somme des revenus mensuels pour les abonnements actifs
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthlyRevenue = sub.subscription_plan === 'annual' 
        ? sub.monthly_amount 
        : sub.monthly_amount;
      return sum + monthlyRevenue;
    }, 0);

    // ARR = MRR * 12
    const arr = mrr * 12;

    // Calculer le revenu total historique (estimation basée sur la date de création)
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      const createdDate = new Date(sub.created_at);
      const monthsActive = Math.max(1, Math.ceil((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      
      if (sub.subscription_plan === 'annual') {
        const yearsActive = Math.ceil(monthsActive / 12);
        return sum + (sub.monthly_amount * 12 * yearsActive);
      } else {
        return sum + (sub.monthly_amount * monthsActive);
      }
    }, 0);

    // Autres métriques
    const totalUsers = subscriptions.reduce((sum, s) => sum + s.total_users, 0);
    const avgRevenuePerCustomer = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;
    
    // Calcul du taux de croissance mensuel (approximation basée sur les créations récentes)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentSubscriptions = subscriptions.filter(s => new Date(s.created_at) > lastMonth);
    const monthlyGrowth = activeSubscriptions.length > 0 
      ? (recentSubscriptions.length / activeSubscriptions.length) * 100 
      : 0;

    // Projection avec croissance estimée
    const projectedRevenue = arr * (1 + (monthlyGrowth / 100));

    // Paiements en retard/en attente
    const overduePayments = subscriptions.filter(s => s.payment_status === 'overdue').length;
    const pendingPayments = subscriptions.filter(s => s.payment_status === 'pending').length;

    // Taux de désabonnement (estimation)
    const churnRate = Math.max(0, Math.min(10, (overduePayments / Math.max(1, activeSubscriptions.length)) * 100));

    const metrics: FinancialMetrics = {
      mrr,
      arr,
      totalRevenue,
      activeSubscriptions: activeSubscriptions.length,
      churnRate,
      avgRevenuePerCustomer,
      monthlyGrowth,
      projectedRevenue,
      totalUsers,
      overduePayments,
      pendingPayments
    };

    return { metrics, subscriptions };

  } catch (error) {
    console.error('Erreur calcul métriques:', error);
    
    // Retourner des données par défaut en cas d'erreur
    const defaultMetrics: FinancialMetrics = {
      mrr: 0,
      arr: 0,
      totalRevenue: 0,
      activeSubscriptions: 0,
      churnRate: 0,
      avgRevenuePerCustomer: 0,
      monthlyGrowth: 0,
      projectedRevenue: 0,
      totalUsers: 0,
      overduePayments: 0,
      pendingPayments: 0
    };
    
    return { metrics: defaultMetrics, subscriptions: [] };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé - Admin requis' },
        { status: 401 }
      );
    }

    // Calculer les métriques financières
    const { metrics, subscriptions } = await calculateFinancialMetrics();

    // Ajouter des métadonnées utiles
    const response = {
      metrics,
      subscriptions,
      metadata: {
        calculated_at: new Date().toISOString(),
        data_source: 'supabase',
        admin_user: adminUser.email,
        total_subscriptions: subscriptions.length,
        currency: 'CAD'
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erreur API financial-metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors du calcul des métriques',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Endpoint pour mettre à jour les données d'abonnement
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tenant_id, updates } = body;

    if (!tenant_id || !updates) {
      return NextResponse.json(
        { error: 'tenant_id et updates requis' },
        { status: 400 }
      );
    }

    // Mettre à jour les données du tenant
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenant_id)
      .select();

    if (error) {
      console.error('Erreur mise à jour tenant:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_tenant: data?.[0],
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur POST financial-metrics:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}