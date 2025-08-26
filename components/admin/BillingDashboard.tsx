'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, Download, FileText, Clock, AlertTriangle, 
  CheckCircle, TrendingUp, Users, CreditCard, Mail, ArrowUpRight,
  Filter, Search, ChevronDown, RefreshCw, Calculator, Phone, Settings
} from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { useTheme } from '../layout/AppLayout';

interface Subscription {
  id: string;
  organizationName: string;
  contactEmail: string;
  plan: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annually';
  daysUntilRenewal: number;
  stripeCustomerId: string;
  lastPayment?: {
    amount: number;
    date: Date;
    status: 'paid' | 'failed' | 'pending';
  };
  usage: {
    users: number;
    maxUsers: number;
    astCount: number;
    maxAST: number;
    storageUsed: number;
    maxStorage: number;
  };
}

interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalCustomers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  upcomingRenewals: number;
  failedPayments: number;
}

const BillingDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRenewals, setShowRenewals] = useState(false);

  // Simulation de données réelles - À remplacer par des appels API
  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      
      // Simuler l'API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          organizationName: 'Électrique ABC',
          contactEmail: 'facturation@electrique-abc.com',
          plan: 'enterprise',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-12-31'),
          amount: 1990,
          currency: 'CAD',
          billingCycle: 'annually',
          daysUntilRenewal: 45,
          stripeCustomerId: 'cus_enterprise_1',
          lastPayment: {
            amount: 1990,
            date: new Date('2024-01-01'),
            status: 'paid'
          },
          usage: {
            users: 85,
            maxUsers: 100,
            astCount: 1250,
            maxAST: -1,
            storageUsed: 320,
            maxStorage: 500
          }
        },
        {
          id: 'sub_2',
          organizationName: 'Construction ABC Inc.',
          contactEmail: 'admin@abc-construction.com',
          plan: 'professional',
          status: 'active',
          currentPeriodStart: new Date('2024-08-01'),
          currentPeriodEnd: new Date('2024-09-01'),
          amount: 79,
          currency: 'CAD',
          billingCycle: 'monthly',
          daysUntilRenewal: 12,
          stripeCustomerId: 'cus_pro_2',
          lastPayment: {
            amount: 79,
            date: new Date('2024-08-01'),
            status: 'paid'
          },
          usage: {
            users: 18,
            maxUsers: 25,
            astCount: 345,
            maxAST: 500,
            storageUsed: 28,
            maxStorage: 50
          }
        },
        {
          id: 'sub_3',
          organizationName: 'Métallurgie Dorval',
          contactEmail: 'compta@metallurgie-dorval.ca',
          plan: 'starter',
          status: 'past_due',
          currentPeriodStart: new Date('2024-07-15'),
          currentPeriodEnd: new Date('2024-08-15'),
          amount: 29,
          currency: 'CAD',
          billingCycle: 'monthly',
          daysUntilRenewal: -5,
          stripeCustomerId: 'cus_starter_3',
          lastPayment: {
            amount: 29,
            date: new Date('2024-07-15'),
            status: 'failed'
          },
          usage: {
            users: 4,
            maxUsers: 5,
            astCount: 23,
            maxAST: 50,
            storageUsed: 2.1,
            maxStorage: 5
          }
        }
      ];

      const mockStats: BillingStats = {
        totalRevenue: 15670,
        monthlyRecurringRevenue: 2890,
        annualRecurringRevenue: 34680,
        totalCustomers: 47,
        activeSubscriptions: 42,
        trialSubscriptions: 5,
        churnRate: 3.2,
        averageRevenuePerUser: 68.50,
        upcomingRenewals: 8,
        failedPayments: 2
      };

      setSubscriptions(mockSubscriptions);
      setStats(mockStats);
      setLoading(false);
    };

    fetchBillingData();
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'past_due': return 'text-red-600 bg-red-100';
      case 'canceled': return 'text-gray-600 bg-gray-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'starter': return 'Démarrage';
      case 'professional': return 'Professionnel';
      case 'enterprise': return 'Entreprise';
      default: return planId;
    }
  };

  const exportBillingReport = async (format: 'csv' | 'pdf' | 'excel') => {
    // Génération des rapports comptables
    const reportData = {
      period: selectedPeriod,
      subscriptions,
      stats,
      exportedAt: new Date().toISOString()
    };

    console.log(`Exporting ${format} report:`, reportData);
    
    // Ici, implémentation réelle d'export
    alert(`Rapport ${format.toUpperCase()} généré et téléchargé avec succès !`);
  };

  const sendRenewalReminder = async (subscriptionId: string, daysAdvance: number) => {
    // Envoi automatique des rappels de renouvellement
    console.log(`Envoi rappel de renouvellement pour ${subscriptionId} - ${daysAdvance} jours`);
    
    try {
      // Ici, appel API pour envoyer email
      alert(`Rappel de renouvellement envoyé avec succès !`);
    } catch (error) {
      alert('Erreur lors de l\'envoi du rappel');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesRenewals = !showRenewals || sub.daysUntilRenewal <= 30;
    
    return matchesSearch && matchesStatus && matchesRenewals;
  });

  if (loading) {
    return (
      <AppLayout currentPage="billing">
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Chargement des données de facturation...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="billing">
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Suivi de Facturation
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Gestion des abonnements, revenus et renouvellements automatiques
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/twilio-config"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Configuration Twilio
              </a>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
                Paramètres
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString('fr-CA', {
                      style: 'currency',
                      currency: 'CAD'
                    })}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% ce mois
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MRR (Mensuel)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.monthlyRecurringRevenue.toLocaleString('fr-CA', {
                      style: 'currency',
                      currency: 'CAD'
                    })}
                  </p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clients Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeSubscriptions}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Renouvellements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.upcomingRenewals}
                  </p>
                  <p className="text-xs text-orange-600">Prochains 30 jours</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une organisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="past_due">En retard</option>
                <option value="trialing">Essai</option>
                <option value="canceled">Annulé</option>
              </select>

              {/* Renewals Toggle */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showRenewals}
                  onChange={(e) => setShowRenewals(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Renouvellements proches</span>
              </label>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => exportBillingReport('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => exportBillingReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => exportBillingReport('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renouvellement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.organizationName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.contactEmail}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getPlanName(subscription.plan)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {subscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status === 'active' && 'Actif'}
                        {subscription.status === 'past_due' && 'En retard'}
                        {subscription.status === 'trialing' && 'Essai'}
                        {subscription.status === 'canceled' && 'Annulé'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.amount.toLocaleString('fr-CA', {
                        style: 'currency',
                        currency: 'CAD'
                      })}
                      <div className="text-xs text-gray-500">
                        /{subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.daysUntilRenewal > 0 ? (
                          <span className={subscription.daysUntilRenewal <= 7 ? 'text-orange-600 font-medium' : ''}>
                            Dans {subscription.daysUntilRenewal} jours
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Échéance dépassée ({Math.abs(subscription.daysUntilRenewal)} jours)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.currentPeriodEnd.toLocaleDateString('fr-CA')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Utilisateurs: {subscription.usage.users}/{subscription.usage.maxUsers === -1 ? '∞' : subscription.usage.maxUsers}</div>
                        <div>AST: {subscription.usage.astCount}/{subscription.usage.maxAST === -1 ? '∞' : subscription.usage.maxAST}</div>
                        <div>Storage: {subscription.usage.storageUsed.toFixed(1)}/{subscription.usage.maxStorage}GB</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {subscription.daysUntilRenewal <= 30 && subscription.daysUntilRenewal > 0 && (
                        <button
                          onClick={() => sendRenewalReminder(subscription.id, subscription.daysUntilRenewal)}
                          className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" />
                          Rappeler
                        </button>
                      )}
                      
                      {subscription.status === 'past_due' && (
                        <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Relancer
                        </button>
                      )}
                      
                      <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auto-Renewal Settings */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration des Renouvellements Automatiques
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Rappel Initial</h4>
              <p className="text-sm text-gray-600 mb-3">
                Premier rappel envoyé 30 jours avant l'échéance
              </p>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">Activé</span>
              </label>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Rappel de Suivi</h4>
              <p className="text-sm text-gray-600 mb-3">
                Deuxième rappel envoyé 7 jours avant l'échéance
              </p>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">Activé</span>
              </label>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Rappel Urgent</h4>
              <p className="text-sm text-gray-600 mb-3">
                Rappel urgent envoyé 1 jour avant l'échéance
              </p>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">Activé</span>
              </label>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillingDashboard;