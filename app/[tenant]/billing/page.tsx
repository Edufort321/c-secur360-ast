'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  DollarSign,
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';

// Types pour la facturation
interface BillingData {
  subscription: {
    type: 'monthly' | 'annual';
    status: 'active' | 'past_due' | 'cancelled';
    current_period_start: string;
    current_period_end: string;
    amount: number;
    currency: 'CAD';
  };
  usage: {
    users: number;
    ast_completed: number;
    reports_generated: number;
    storage_used: number; // GB
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
    download_url?: string;
  }>;
}

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function BillingPage({ params }: PageProps) {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'usage' | 'plans'>('overview');

  // Données démo pour la facturation
  const DEMO_BILLING_DATA: BillingData = {
    subscription: {
      type: 'monthly',
      status: 'active',
      current_period_start: '2024-08-01',
      current_period_end: '2024-09-01',
      amount: 250,
      currency: 'CAD'
    },
    usage: {
      users: 8,
      ast_completed: 42,
      reports_generated: 15,
      storage_used: 2.4
    },
    invoices: [
      {
        id: 'inv-001',
        date: '2024-08-01',
        amount: 250,
        status: 'paid',
        description: 'C-SECUR360 - Abonnement Mensuel Août 2024',
        download_url: '#'
      },
      {
        id: 'inv-002',
        date: '2024-07-01',
        amount: 250,
        status: 'paid',
        description: 'C-SECUR360 - Abonnement Mensuel Juillet 2024',
        download_url: '#'
      },
      {
        id: 'inv-003',
        date: '2024-06-01',
        amount: 250,
        status: 'paid',
        description: 'C-SECUR360 - Abonnement Mensuel Juin 2024',
        download_url: '#'
      },
      {
        id: 'inv-004',
        date: '2024-05-01',
        amount: 250,
        status: 'paid',
        description: 'C-SECUR360 - Abonnement Mensuel Mai 2024',
        download_url: '#'
      }
    ]
  };

  // Initialiser les données
  useEffect(() => {
    setBillingData(DEMO_BILLING_DATA);
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'past_due':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'past_due': return 'Échue';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const plans = [
    {
      name: 'Mensuel',
      price: 250,
      period: 'mois',
      description: 'Parfait pour tester notre plateforme',
      features: [
        'Utilisateurs illimités',
        'AST illimitées',
        'Rapports avancés',
        'Support 24/7',
        'API complète',
        'Conformité complète'
      ],
      current: billingData?.subscription.type === 'monthly'
    },
    {
      name: 'Annuel',
      price: 3000,
      period: 'année',
      description: 'Économisez avec notre plan annuel',
      features: [
        'Utilisateurs illimités',
        'AST illimitées',
        'Rapports avancés',
        'Support prioritaire',
        'API complète',
        'Conformité complète',
        '2 mois GRATUITS'
      ],
      savings: 'Économisez 500$ par année',
      current: billingData?.subscription.type === 'annual'
    }
  ];

  const renderOverviewTab = () => {
    if (!billingData) return null;

    return (
      <div className="space-y-6">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Abonnement Actuel</h3>
              <p className="text-gray-600 text-sm">Gérez votre abonnement C-SECUR360</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(billingData.subscription.status)}`}>
              {getStatusLabel(billingData.subscription.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-900">Plan</p>
              <p className="text-2xl font-bold text-blue-600">
                {billingData.subscription.type === 'monthly' ? 'Mensuel' : 'Annuel'}
              </p>
              <p className="text-gray-600 text-sm">
                {billingData.subscription.amount} {billingData.subscription.currency} / 
                {billingData.subscription.type === 'monthly' ? 'mois' : 'année'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Période Actuelle</p>
              <p className="text-gray-600">
                {new Date(billingData.subscription.current_period_start).toLocaleDateString('fr-FR')} - 
                {new Date(billingData.subscription.current_period_end).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Prochaine Facturation</p>
              <p className="text-gray-600">
                {new Date(billingData.subscription.current_period_end).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={() => alert('🔄 Changer de plan\n\nFonctionnalité Stripe disponible bientôt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Changer de Plan
            </button>
            <button 
              onClick={() => alert('💳 Gérer Paiement\n\nPortail Stripe disponible bientôt')}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Méthodes de Paiement
            </button>
            <button 
              onClick={() => alert('📄 Historique Complet\n\nFonctionnalité disponible bientôt')}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Portail Client
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Utilisation (Période Actuelle)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{billingData.usage.users}</p>
              <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{billingData.usage.ast_completed}</p>
              <p className="text-sm text-gray-600">AST Complétées</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{billingData.usage.reports_generated}</p>
              <p className="text-sm text-gray-600">Rapports Générés</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{billingData.usage.storage_used} GB</p>
              <p className="text-sm text-gray-600">Stockage Utilisé</p>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Factures Récentes</h3>
            <button 
              onClick={() => setActiveTab('invoices')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir toutes
            </button>
          </div>
          <div className="space-y-3">
            {billingData.invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{invoice.description}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                  <span className="font-medium text-gray-900">{invoice.amount} CAD</span>
                  {invoice.download_url && (
                    <button 
                      onClick={() => alert('📥 Télécharger facture\n\nFonctionnalité disponible bientôt')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInvoicesTab = () => {
    if (!billingData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Historique des Factures</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingData.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.id.toUpperCase()}</div>
                      <div className="text-sm text-gray-500">{invoice.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.amount} CAD
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert('📄 Voir facture\n\nFonctionnalité disponible bientôt')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Voir
                        </button>
                        {invoice.download_url && (
                          <button 
                            onClick={() => alert('📥 Télécharger PDF\n\nFonctionnalité disponible bientôt')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Télécharger
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
      </div>
    );
  };

  const renderUsageTab = () => {
    if (!billingData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Détails d'Utilisation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Utilisateurs Actifs</p>
                    <p className="text-sm text-gray-600">Illimité inclus</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{billingData.usage.users}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">AST Complétées</p>
                    <p className="text-sm text-gray-600">Illimitées incluses</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{billingData.usage.ast_completed}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Rapports Générés</p>
                    <p className="text-sm text-gray-600">Illimités inclus</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{billingData.usage.reports_generated}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Stockage</p>
                    <p className="text-sm text-gray-600">100 GB inclus</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-orange-600">{billingData.usage.storage_used} GB</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(billingData.usage.storage_used / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlansTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choisissez Votre Plan</h3>
        <p className="text-gray-600">Changez de plan à tout moment, sans frais cachés</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
            plan.current ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="p-6">
              {plan.current && (
                <div className="flex justify-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Plan Actuel
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600"> CAD / {plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                {plan.savings && (
                  <p className="text-green-600 text-sm font-medium mt-1">{plan.savings}</p>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => {
                  if (plan.current) {
                    alert('✅ Plan Actuel\n\nVous utilisez déjà ce plan');
                  } else {
                    alert(`🔄 Changer vers ${plan.name}\n\nFonctionnalité Stripe disponible bientôt`);
                  }
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current 
                    ? 'bg-gray-100 text-gray-600 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Plan Actuel' : 'Choisir ce Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={40} 
                height={40}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
                <p className="text-gray-600 mt-1">Gérez votre abonnement et facturation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Prochaine facturation: {billingData && new Date(billingData.subscription.current_period_end).toLocaleDateString('fr-FR')}
              </span>
              <button 
                onClick={() => alert('🎫 Contacter Support\n\nSupport disponible 24/7:\nsupport@c-secur360.com')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: <DollarSign className="h-4 w-4" /> },
              { id: 'invoices', label: 'Factures', icon: <Download className="h-4 w-4" /> },
              { id: 'usage', label: 'Utilisation', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'plans', label: 'Plans', icon: <Star className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
        {activeTab === 'usage' && renderUsageTab()}
        {activeTab === 'plans' && renderPlansTab()}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💳 Facturation et Abonnement Sécurisés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔒 Paiements Sécurisés</h4>
              <ul className="space-y-1 text-xs">
                <li>• Intégration Stripe certifiée PCI</li>
                <li>• Chiffrement bout-en-bout</li>
                <li>• Facturation automatisée</li>
                <li>• Conformité fiscale canadienne</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Suivi et Analytics</h4>
              <ul className="space-y-1 text-xs">
                <li>• Métriques d\'utilisation détaillées</li>
                <li>• Historique complet des paiements</li>
                <li>• Prévisions de coûts</li>
                <li>• Export comptabilité</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Flexibilité Totale</h4>
              <ul className="space-y-1 text-xs">
                <li>• Changement de plan instantané</li>
                <li>• Pas de frais cachés</li>
                <li>• Support 24/7 inclus</li>
                <li>• Garantie remboursement 30 jours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}