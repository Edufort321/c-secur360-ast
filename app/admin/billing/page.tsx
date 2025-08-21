'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Users, DollarSign, TrendingUp, 
  Calendar, AlertTriangle, CheckCircle, Clock,
  Search, Filter, Download, Plus, Eye, Edit,
  Mail, Phone, Building, MapPin, Shield
} from 'lucide-react';

// =================== INTERFACES ===================
interface Customer {
  id: string;
  email: string;
  company_name: string;
  stripe_customer_id?: string;
  province: string;
  subscription_status: 'active' | 'inactive' | 'suspended' | 'canceled' | 'past_due' | 'trial';
  created_at: string;
  trial_end?: string;
}

interface Subscription {
  id: string;
  customer_id: string;
  plan_type: 'monthly' | 'annual';
  additional_sites: number;
  status: string;
  current_period_end: string;
  last_payment_at?: string;
  customer?: Customer;
}

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_total: number;
  status: string;
  paid_at?: string;
  due_date?: string;
  hosted_invoice_url?: string;
}

interface BillingStats {
  total_customers: number;
  active_subscriptions: number;
  mrr_cad: number;
  overdue_invoices: number;
  trial_customers: number;
  churn_rate: number;
}

const AdminBillingPage = () => {
  // =================== ÉTATS ===================
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'subscriptions' | 'invoices'>('overview');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    total_customers: 0,
    active_subscriptions: 0,
    mrr_cad: 0,
    overdue_invoices: 0,
    trial_customers: 0,
    churn_rate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // =================== EFFECTS ===================
  useEffect(() => {
    loadBillingData();
  }, []);

  // =================== FONCTIONS DE CHARGEMENT ===================
  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API - remplacer par vrais appels Supabase
      await Promise.all([
        loadCustomers(),
        loadSubscriptions(),
        loadInvoices(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Erreur chargement données facturation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    // Mock data - remplacer par appel Supabase
    const mockCustomers: Customer[] = [
      {
        id: '1',
        email: 'client1@entrepriseabc.ca',
        company_name: 'Entreprise ABC Inc.',
        stripe_customer_id: 'cus_mock123',
        province: 'QC',
        subscription_status: 'active',
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        email: 'admin@companyxyz.ca',
        company_name: 'Company XYZ Ltd.',
        stripe_customer_id: 'cus_mock456',
        province: 'ON',
        subscription_status: 'trial',
        created_at: '2024-02-01T00:00:00Z',
        trial_end: '2024-02-15T00:00:00Z'
      },
      {
        id: '3',
        email: 'contact@corpdef.ca',
        company_name: 'Corp DEF Limited',
        province: 'BC',
        subscription_status: 'past_due',
        created_at: '2024-01-10T00:00:00Z'
      }
    ];
    setCustomers(mockCustomers);
  };

  const loadSubscriptions = async () => {
    // Mock data - remplacer par appel Supabase
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        customer_id: '1',
        plan_type: 'annual',
        additional_sites: 2,
        status: 'active',
        current_period_end: '2025-01-15T00:00:00Z',
        last_payment_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        customer_id: '2',
        plan_type: 'monthly',
        additional_sites: 0,
        status: 'trialing',
        current_period_end: '2024-02-15T00:00:00Z'
      }
    ];
    setSubscriptions(mockSubscriptions);
  };

  const loadInvoices = async () => {
    // Mock data
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        stripe_invoice_id: 'in_mock123',
        amount_total: 300000, // 3000$ CAD en cents
        status: 'paid',
        paid_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        stripe_invoice_id: 'in_mock456',
        amount_total: 25000, // 250$ CAD en cents
        status: 'open',
        due_date: '2024-02-15T00:00:00Z'
      }
    ];
    setInvoices(mockInvoices);
  };

  const loadStats = async () => {
    const mockStats: BillingStats = {
      total_customers: 127,
      active_subscriptions: 98,
      mrr_cad: 28750, // 287.50$ CAD
      overdue_invoices: 3,
      trial_customers: 12,
      churn_rate: 2.1
    };
    setStats(mockStats);
  };

  // =================== HANDLERS ===================
  const handleCreateCustomer = async () => {
    try {
      // Appel API pour créer un nouveau client
      console.log('Créer nouveau client...');
      // Refresh data après création
      await loadCustomers();
      setShowNewCustomerModal(false);
    } catch (error) {
      console.error('Erreur création client:', error);
    }
  };

  const handleCreateSubscription = async (customerId: string) => {
    try {
      // Appel API pour créer abonnement
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          planType: 'monthly',
          successUrl: `${window.location.origin}/admin/billing?success=true`,
          cancelUrl: `${window.location.origin}/admin/billing`
        })
      });
      
      const data = await response.json();
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erreur création abonnement:', error);
    }
  };

  const handleOpenPortal = async (customerId: string) => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/admin/billing`
        })
      });
      
      const data = await response.json();
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erreur ouverture portail:', error);
    }
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amountCents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      case 'past_due': return 'text-orange-600 bg-orange-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'trialing': return <Clock size={16} />;
      case 'past_due': return <AlertTriangle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  // =================== FILTRAGE ===================
  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données de facturation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="text-blue-600" />
                Administration Facturation
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion des abonnements, clients et facturation Stripe
              </p>
            </div>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Nouveau Client
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_customers}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abonnements Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.mrr_cad * 100)}</p>
              </div>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Factures en Souffrance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overdue_invoices}</p>
              </div>
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Essai</p>
                <p className="text-2xl font-bold text-purple-600">{stats.trial_customers}</p>
              </div>
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux Attrition</p>
                <p className="text-2xl font-bold text-red-600">{stats.churn_rate}%</p>
              </div>
              <TrendingUp className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                { id: 'customers', label: 'Clients', icon: Users },
                { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
                { id: 'invoices', label: 'Factures', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Clients */}
            {activeTab === 'customers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Gestion des Clients</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Province
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Créé le
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Building className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.company_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{customer.province}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.subscription_status)}`}>
                              {getStatusIcon(customer.subscription_status)}
                              <span className="ml-1">{customer.subscription_status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(customer.created_at).toLocaleDateString('fr-CA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye size={16} />
                              </button>
                              {customer.stripe_customer_id && (
                                <button
                                  onClick={() => handleOpenPortal(customer.stripe_customer_id!)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Shield size={16} />
                                </button>
                              )}
                              {!customer.stripe_customer_id && (
                                <button
                                  onClick={() => handleCreateSubscription(customer.id)}
                                  className="text-purple-600 hover:text-purple-900"
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Autres onglets (à implémenter) */}
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tableau de bord des revenus</h3>
                <p className="text-gray-500">Graphiques et métriques détaillées à venir</p>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des abonnements</h3>
                <p className="text-gray-500">Interface de gestion des abonnements à venir</p>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historique des factures</h3>
                <p className="text-gray-500">Liste des factures et paiements à venir</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBillingPage;