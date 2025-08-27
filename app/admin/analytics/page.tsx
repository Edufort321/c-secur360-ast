'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Mail,
  Smartphone
} from 'lucide-react';

interface AnalyticsData {
  // Métriques financières
  revenue: {
    current_month: number;
    last_month: number;
    growth_rate: number;
    forecast_next_month: number;
    ytd_total: number;
  };
  
  // Métriques clients
  customers: {
    total_active: number;
    new_this_month: number;
    churned_this_month: number;
    churn_rate: number;
    lifetime_value: number;
    acquisition_cost: number;
  };
  
  // Métriques marketing
  marketing: {
    leads_generated: number;
    conversion_rate: number;
    cost_per_lead: number;
    roi: number;
    campaign_performance: Array<{
      name: string;
      leads: number;
      cost: number;
      conversions: number;
      roi: number;
    }>;
  };
  
  // Métriques produit/usage
  product: {
    monthly_active_users: number;
    feature_adoption_rates: {[key: string]: number};
    support_tickets: number;
    satisfaction_score: number;
  };
  
  // Prédictions IA
  predictions: {
    revenue_forecast_6m: number[];
    churn_risk_customers: number;
    expansion_opportunities: number;
    market_trends: string[];
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'marketing' | 'predictions'>('overview');

  // Mock data pour démonstration avec prédictions IA
  useEffect(() => {
    const mockData: AnalyticsData = {
      revenue: {
        current_month: 28750,
        last_month: 24200,
        growth_rate: 18.8,
        forecast_next_month: 33650,
        ytd_total: 185420
      },
      customers: {
        total_active: 47,
        new_this_month: 8,
        churned_this_month: 2,
        churn_rate: 4.3,
        lifetime_value: 8940,
        acquisition_cost: 750
      },
      marketing: {
        leads_generated: 342,
        conversion_rate: 13.7,
        cost_per_lead: 28.50,
        roi: 285,
        campaign_performance: [
          { name: 'LinkedIn Automation', leads: 127, cost: 2450, conversions: 19, roi: 378 },
          { name: 'Email Marketing', leads: 89, cost: 890, conversions: 12, roi: 298 },
          { name: 'Web Scraping', leads: 76, cost: 340, conversions: 8, roi: 441 },
          { name: 'Referrals', leads: 50, cost: 125, conversions: 8, roi: 520 }
        ]
      },
      product: {
        monthly_active_users: 1247,
        feature_adoption_rates: {
          'AST Module': 89.2,
          'Equipment Inspection': 67.8,
          'Team Management': 78.5,
          'Reports': 92.1,
          'Mobile App': 45.3
        },
        support_tickets: 23,
        satisfaction_score: 4.7
      },
      predictions: {
        revenue_forecast_6m: [33650, 38200, 42800, 46900, 51200, 55800],
        churn_risk_customers: 4,
        expansion_opportunities: 12,
        market_trends: [
          'Augmentation demande solutions HSE digitales (+23%)',
          'Croissance secteur construction Québec (+15%)',
          'Adoption IA en entreprise manufacturing (+34%)',
          'Réglementation sécurité renforcée 2025'
        ]
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1500);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Calcul des analytics IA...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & BI</h1>
          <p className="text-gray-600 mt-1">Intelligence d'affaires avec prédictions IA</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 année</option>
          </select>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`text-sm font-medium ${analyticsData.revenue.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(analyticsData.revenue.growth_rate)}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Revenus ce mois</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.current_month)}</p>
            <p className="text-xs text-gray-500 mt-1">Prév. prochain: {formatCurrency(analyticsData.revenue.forecast_next_month)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-600">
              +{analyticsData.customers.new_this_month}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Clients Actifs</p>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.customers.total_active}</p>
            <p className="text-xs text-gray-500 mt-1">Churn: {analyticsData.customers.churn_rate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-purple-600">
              {formatPercentage(analyticsData.marketing.conversion_rate)}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Leads Générés</p>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.marketing.leads_generated}</p>
            <p className="text-xs text-gray-500 mt-1">ROI: {analyticsData.marketing.roi}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-orange-600">
              {analyticsData.product.satisfaction_score}/5
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.product.monthly_active_users}</p>
            <p className="text-xs text-gray-500 mt-1">Tickets support: {analyticsData.product.support_tickets}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'revenue', label: 'Revenus', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'customers', label: 'Clients', icon: <Users className="w-4 h-4" /> },
              { id: 'marketing', label: 'Marketing', icon: <Target className="w-4 h-4" /> },
              { id: 'predictions', label: 'Prédictions IA', icon: <Brain className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Performance Globale
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Croissance revenus</span>
                      <span className="text-sm font-bold text-green-600">+{analyticsData.revenue.growth_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ROI marketing</span>
                      <span className="text-sm font-bold text-blue-600">{analyticsData.marketing.roi}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Satisfaction client</span>
                      <span className="text-sm font-bold text-purple-600">{analyticsData.product.satisfaction_score}/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de rétention</span>
                      <span className="text-sm font-bold text-orange-600">{(100 - analyticsData.customers.churn_rate).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Points d'Attention
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{analyticsData.predictions.churn_risk_customers} clients à risque de churn</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Adoption mobile faible (45.3%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{analyticsData.predictions.expansion_opportunities} opportunités d'expansion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Coût acquisition: {formatCurrency(analyticsData.customers.acquisition_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Adoption */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Adoption des Fonctionnalités
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.product.feature_adoption_rates).map(([feature, rate]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{feature}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              rate >= 80 ? 'bg-green-500' : 
                              rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-12">{rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Revenus YTD</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.ytd_total)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Objectif annuel: 75% atteint</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">MRR Actuel</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.current_month)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600">+{formatPercentage(analyticsData.revenue.growth_rate)} vs mois dernier</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Prévision Prochaine</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.forecast_next_month)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-600">Confiance IA: 87%</span>
                  </div>
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus (6 mois)</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Graphique des revenus avec prédictions IA</p>
                    <p className="text-sm text-gray-500 mt-1">Intégration Chart.js à venir</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Canal</h3>
                <div className="space-y-4">
                  {analyticsData.marketing.campaign_performance.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          campaign.name.includes('LinkedIn') ? 'bg-blue-100' :
                          campaign.name.includes('Email') ? 'bg-green-100' :
                          campaign.name.includes('Web') ? 'bg-purple-100' :
                          'bg-orange-100'
                        }`}>
                          {campaign.name.includes('LinkedIn') && <Globe className="w-4 h-4 text-blue-600" />}
                          {campaign.name.includes('Email') && <Mail className="w-4 h-4 text-green-600" />}
                          {campaign.name.includes('Web') && <Globe className="w-4 h-4 text-purple-600" />}
                          {campaign.name.includes('Referrals') && <Users className="w-4 h-4 text-orange-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-600">{campaign.leads} leads • {campaign.conversions} conversions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(campaign.cost)}</p>
                        <p className="text-sm text-green-600">ROI: {campaign.roi}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Prédictions Revenus IA
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Prévisions 6 prochains mois:</p>
                    {analyticsData.predictions.revenue_forecast_6m.map((forecast, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Mois {index + 1}</span>
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(forecast)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Alertes Prédictives
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">{analyticsData.predictions.churn_risk_customers} clients à risque</p>
                        <p className="text-xs text-red-600">Action recommandée sous 7 jours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">{analyticsData.predictions.expansion_opportunities} opportunités d'expansion</p>
                        <p className="text-xs text-green-600">Potentiel revenus: +{formatCurrency(45000)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Pic saisonnier prévu en octobre</p>
                        <p className="text-xs text-blue-600">Préparer capacité +25%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Tendances Marché (IA Analysis)
                </h3>
                <div className="space-y-3">
                  {analyticsData.predictions.market_trends.map((trend, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{trend}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Recommandation IA:</strong> Accélérer développement fonctionnalités IA et mobile pour capitaliser sur les tendances marché.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}