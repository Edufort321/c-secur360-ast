'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Settings, 
  Play, 
  Pause,
  BarChart3,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  Calendar,
  Filter,
  Plus,
  Edit,
  Globe,
  LinkedinIcon,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'linkedin' | 'web_scraping' | 'multi_channel';
  status: 'active' | 'paused' | 'draft' | 'completed';
  target_audience: string;
  leads_generated: number;
  conversion_rate: number;
  cost_per_lead: number;
  total_spend: number;
  roi: number;
  created_at: string;
  last_run: string;
  next_run: string;
}

interface LeadSource {
  source: string;
  leads: number;
  conversion_rate: number;
  cost: number;
  roi: number;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'inactive';
  leads_processed: number;
  success_rate: number;
}

export default function MarketingAutomationPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'automation' | 'analytics'>('campaigns');

  // Mock data pour démonstration
  useEffect(() => {
    const mockCampaigns: MarketingCampaign[] = [
      {
        id: '1',
        name: 'Construction Industry Outreach',
        type: 'linkedin',
        status: 'active',
        target_audience: 'Gestionnaires de construction, 50-500 employés',
        leads_generated: 127,
        conversion_rate: 12.5,
        cost_per_lead: 15.50,
        total_spend: 1968.50,
        roi: 245.0,
        created_at: '2024-08-01',
        last_run: '2024-08-26 09:00',
        next_run: '2024-08-27 09:00'
      },
      {
        id: '2',
        name: 'Email Nurturing Sequence',
        type: 'email',
        status: 'active',
        target_audience: 'Prospects ayant téléchargé des ressources',
        leads_generated: 85,
        conversion_rate: 8.2,
        cost_per_lead: 8.75,
        total_spend: 743.75,
        roi: 178.5,
        created_at: '2024-07-15',
        last_run: '2024-08-26 14:30',
        next_run: '2024-08-27 14:30'
      },
      {
        id: '3',
        name: 'Multi-Channel Manufacturing',
        type: 'multi_channel',
        status: 'paused',
        target_audience: 'Directeurs HSE manufactuirng',
        leads_generated: 43,
        conversion_rate: 15.8,
        cost_per_lead: 22.30,
        total_spend: 958.90,
        roi: 198.7,
        created_at: '2024-08-10',
        last_run: '2024-08-25 10:15',
        next_run: 'Pausée'
      },
      {
        id: '4',
        name: 'Web Scraping Prospects',
        type: 'web_scraping',
        status: 'active',
        target_audience: 'Entreprises avec certifications ISO',
        leads_generated: 216,
        conversion_rate: 6.9,
        cost_per_lead: 3.25,
        total_spend: 702.00,
        roi: 312.8,
        created_at: '2024-07-28',
        last_run: '2024-08-26 06:00',
        next_run: '2024-08-27 06:00'
      }
    ];

    const mockLeadSources: LeadSource[] = [
      { source: 'LinkedIn Automation', leads: 194, conversion_rate: 11.3, cost: 1845.50, roi: 278.4 },
      { source: 'Email Marketing', leads: 123, conversion_rate: 9.8, cost: 890.25, roi: 198.7 },
      { source: 'Web Scraping', leads: 312, conversion_rate: 5.2, cost: 420.75, roi: 445.2 },
      { source: 'Referral Program', leads: 45, conversion_rate: 18.7, cost: 125.00, roi: 387.5 }
    ];

    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: '1',
        name: 'LinkedIn Connect & Follow-up',
        description: 'Connexion automatique + 3 messages de suivi personnalisés',
        trigger: 'Nouveau prospect identifié',
        actions: ['Envoyer demande de connexion', 'Message de bienvenue (J+1)', 'Message de suivi (J+7)', 'Proposition de démo (J+14)'],
        status: 'active',
        leads_processed: 342,
        success_rate: 23.7
      },
      {
        id: '2',
        name: 'Email Drip Campaign',
        description: 'Séquence de 5 emails éducatifs sur la sécurité',
        trigger: 'Téléchargement de contenu',
        actions: ['Email de bienvenue', 'Guide sécurité (J+2)', 'Case study (J+5)', 'Webinar invite (J+10)', 'Demo booking (J+15)'],
        status: 'active',
        leads_processed: 156,
        success_rate: 34.6
      },
      {
        id: '3',
        name: 'Retargeting Multi-Channel',
        description: 'Retargeting coordonné email + LinkedIn + annonces',
        trigger: 'Visite du site sans conversion',
        actions: ['Tag pour retargeting', 'LinkedIn message', 'Email de suivi', 'Annonce ciblée'],
        status: 'inactive',
        leads_processed: 89,
        success_rate: 12.4
      }
    ];

    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLeadSources(mockLeadSources);
      setWorkflows(mockWorkflows);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'draft': return <Edit className="w-4 h-4 text-gray-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'linkedin': return <LinkedinIcon className="w-4 h-4 text-blue-700" />;
      case 'web_scraping': return <Globe className="w-4 h-4 text-green-600" />;
      case 'multi_channel': return <Zap className="w-4 h-4 text-purple-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const totalStats = {
    totalLeads: campaigns.reduce((sum, c) => sum + c.leads_generated, 0),
    avgConversion: campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) / campaigns.length,
    totalSpend: campaigns.reduce((sum, c) => sum + c.total_spend, 0),
    avgROI: campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
          <p className="text-gray-600 mt-1">Gestion complète des campagnes et automatisations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Nouvelle Campagne
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Make.com Config
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-600">Total</div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Leads Générés</p>
            <p className="text-2xl font-bold text-gray-900">{totalStats.totalLeads.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600">Moyenne</div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Taux de Conversion</p>
            <p className="text-2xl font-bold text-gray-900">{totalStats.avgConversion.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-purple-600">Investissement</div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dépenses Totales</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalSpend)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm font-medium text-orange-600">Performance</div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">ROI Moyen</p>
            <p className="text-2xl font-bold text-gray-900">{totalStats.avgROI.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Campagnes Marketing
              </div>
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Workflows Make.com
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics & Rapports
              </div>
            </button>
          </nav>
        </div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(campaign.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      {getStatusIcon(campaign.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Audience</p>
                      <p className="text-sm font-medium text-gray-900">{campaign.target_audience}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Leads</p>
                      <p className="text-sm font-bold text-blue-600">{campaign.leads_generated}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Conversion</p>
                      <p className="text-sm font-bold text-green-600">{campaign.conversion_rate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Coût/Lead</p>
                      <p className="text-sm font-bold text-orange-600">{formatCurrency(campaign.cost_per_lead)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">ROI</p>
                      <p className="text-sm font-bold text-purple-600">{campaign.roi}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Prochaine Exécution</p>
                      <p className="text-sm font-medium text-gray-900">{campaign.next_run}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="p-6">
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Zap className={`w-5 h-5 ${workflow.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      workflow.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                      {workflow.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Déclencheur</p>
                      <p className="text-sm font-medium text-gray-900">{workflow.trigger}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Leads Traités</p>
                      <p className="text-sm font-bold text-blue-600">{workflow.leads_processed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Taux de Succès</p>
                      <p className="text-sm font-bold text-green-600">{workflow.success_rate}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {index + 1}. {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Sources */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Source</h3>
                <div className="space-y-3">
                  {leadSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{source.source}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span>{source.leads} leads</span>
                          <span>{source.conversion_rate}% conv.</span>
                          <span>ROI: {source.roi}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(source.cost)}</p>
                        <p className="text-xs text-gray-600">Coût total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Make.com Integration Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Make.com Intégrations</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">LinkedIn Sales Navigator</span>
                    </div>
                    <span className="text-xs text-green-600">Actif</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Mailchimp Integration</span>
                    </div>
                    <span className="text-xs text-green-600">Actif</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">HubSpot CRM Sync</span>
                    </div>
                    <span className="text-xs text-yellow-600">Config</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-900">Zapier Webhook</span>
                    </div>
                    <span className="text-xs text-red-600">Erreur</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Prochaines Actions Recommandées:</strong>
                  </p>
                  <ul className="mt-2 text-xs text-blue-700 space-y-1">
                    <li>• Finaliser l'intégration HubSpot pour le suivi des leads</li>
                    <li>• Corriger la connexion Zapier pour les notifications</li>
                    <li>• Configurer l'API LinkedIn pour l'automation avancée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}