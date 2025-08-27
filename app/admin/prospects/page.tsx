'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Search,
  Globe,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  LinkedinIcon
} from 'lucide-react';

interface Prospect {
  id: string;
  company_name: string;
  website: string;
  industry: string;
  employee_count: string;
  location: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  contact_linkedin?: string;
  phone?: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source: 'web_scraping' | 'linkedin' | 'referral' | 'manual' | 'api';
  notes?: string;
  found_at: string;
  last_contact?: string;
  next_follow_up?: string;
  technologies?: string[];
  certifications?: string[];
  funding_stage?: string;
  revenue_estimate?: string;
}

interface ProspectingCampaign {
  id: string;
  name: string;
  description: string;
  target_criteria: {
    industries: string[];
    employee_range: string;
    locations: string[];
    technologies?: string[];
    certifications?: string[];
  };
  status: 'active' | 'paused' | 'completed';
  prospects_found: number;
  conversion_rate: number;
  last_run: string;
  next_run: string;
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [campaigns, setCampaigns] = useState<ProspectingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [activeTab, setActiveTab] = useState<'prospects' | 'campaigns' | 'analytics'>('prospects');
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    industry: 'all',
    score_min: 0
  });

  // Mock data pour démonstration
  useEffect(() => {
    const mockProspects: Prospect[] = [
      {
        id: '1',
        company_name: 'Construction Moderne Inc.',
        website: 'https://construction-moderne.ca',
        industry: 'Construction',
        employee_count: '50-200',
        location: 'Montréal, QC',
        contact_name: 'Marie Tremblay',
        contact_title: 'Directrice HSE',
        contact_email: 'marie.tremblay@construction-moderne.ca',
        contact_linkedin: 'https://linkedin.com/in/marie-tremblay-hse',
        phone: '+1 (514) 555-0123',
        score: 85,
        status: 'new',
        source: 'web_scraping',
        notes: 'Entreprise en croissance, récemment certifiée ISO 45001',
        found_at: '2024-08-26',
        technologies: ['Microsoft 365', 'AutoCAD', 'Procore'],
        certifications: ['ISO 45001', 'COR'],
        revenue_estimate: '10M-50M CAD'
      },
      {
        id: '2',
        company_name: 'Manufactures Précision',
        website: 'https://manufactures-precision.com',
        industry: 'Manufacturing',
        employee_count: '200-500',
        location: 'Québec, QC',
        contact_name: 'Jean-François Dubois',
        contact_title: 'VP Opérations',
        contact_email: 'jf.dubois@manufactures-precision.com',
        contact_linkedin: 'https://linkedin.com/in/jf-dubois-operations',
        score: 92,
        status: 'contacted',
        source: 'linkedin',
        notes: 'Intéressé par une démo, meeting prévu jeudi prochain',
        found_at: '2024-08-24',
        last_contact: '2024-08-25',
        next_follow_up: '2024-08-29',
        technologies: ['SAP', 'Salesforce', 'Power BI'],
        certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
        revenue_estimate: '50M-100M CAD'
      },
      {
        id: '3',
        company_name: 'Services Industriels Pro',
        website: 'https://services-industriels-pro.ca',
        industry: 'Industrial Services',
        employee_count: '25-50',
        location: 'Sherbrooke, QC',
        contact_name: 'Sophie Martin',
        contact_title: 'Responsable Sécurité',
        contact_email: 'sophie.martin@si-pro.ca',
        score: 78,
        status: 'qualified',
        source: 'referral',
        notes: 'Budget confirmé pour Q4 2024, évalue 3 solutions',
        found_at: '2024-08-20',
        last_contact: '2024-08-26',
        next_follow_up: '2024-08-30',
        technologies: ['Office 365', 'QuickBooks'],
        certifications: ['COR'],
        revenue_estimate: '5M-10M CAD'
      },
      {
        id: '4',
        company_name: 'Énergie Verte Solutions',
        website: 'https://energie-verte-solutions.com',
        industry: 'Renewable Energy',
        employee_count: '100-200',
        location: 'Laval, QC',
        contact_name: 'Philippe Gagnon',
        contact_title: 'Directeur Général',
        contact_email: 'p.gagnon@energie-verte.com',
        contact_linkedin: 'https://linkedin.com/in/philippe-gagnon-energy',
        score: 88,
        status: 'new',
        source: 'web_scraping',
        notes: 'Expansion rapide, cherche solutions de sécurité scalables',
        found_at: '2024-08-26',
        technologies: ['Slack', 'Notion', 'Zoom'],
        certifications: ['ISO 14001'],
        funding_stage: 'Series A',
        revenue_estimate: '20M-50M CAD'
      }
    ];

    const mockCampaigns: ProspectingCampaign[] = [
      {
        id: '1',
        name: 'Construction QC - ISO Certified',
        description: 'Ciblage entreprises construction avec certifications ISO au Québec',
        target_criteria: {
          industries: ['Construction', 'Engineering'],
          employee_range: '50-500',
          locations: ['Québec', 'Montréal', 'Gatineau'],
          certifications: ['ISO 45001', 'COR']
        },
        status: 'active',
        prospects_found: 47,
        conversion_rate: 12.8,
        last_run: '2024-08-26 06:00',
        next_run: '2024-08-27 06:00'
      },
      {
        id: '2',
        name: 'Manufacturing Leaders LinkedIn',
        description: 'Prospection dirigeants manufacturing via LinkedIn Sales Navigator',
        target_criteria: {
          industries: ['Manufacturing', 'Industrial'],
          employee_range: '100+',
          locations: ['Canada'],
          technologies: ['ERP', 'MES']
        },
        status: 'active',
        prospects_found: 23,
        conversion_rate: 21.7,
        last_run: '2024-08-25 14:30',
        next_run: '2024-08-27 14:30'
      },
      {
        id: '3',
        name: 'Renewable Energy Expansion',
        description: 'Entreprises énergie renouvelable en croissance',
        target_criteria: {
          industries: ['Renewable Energy', 'Clean Tech'],
          employee_range: '20-200',
          locations: ['Québec', 'Ontario'],
          funding_stage: ['Seed', 'Series A', 'Series B']
        },
        status: 'paused',
        prospects_found: 15,
        conversion_rate: 33.3,
        last_run: '2024-08-24 10:00',
        next_run: 'Pausée'
      }
    ];

    setTimeout(() => {
      setProspects(mockProspects);
      setCampaigns(mockCampaigns);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'web_scraping': return <Globe className="w-4 h-4 text-green-600" />;
      case 'linkedin': return <LinkedinIcon className="w-4 h-4 text-blue-700" />;
      case 'referral': return <Users className="w-4 h-4 text-purple-600" />;
      case 'api': return <Zap className="w-4 h-4 text-orange-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredProspects = prospects.filter(prospect => {
    if (filters.status !== 'all' && prospect.status !== filters.status) return false;
    if (filters.source !== 'all' && prospect.source !== filters.source) return false;
    if (filters.industry !== 'all' && prospect.industry !== filters.industry) return false;
    if (prospect.score < filters.score_min) return false;
    return true;
  });

  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    qualified: prospects.filter(p => p.status === 'qualified').length,
    converted: prospects.filter(p => p.status === 'converted').length,
    avgScore: prospects.reduce((sum, p) => sum + p.score, 0) / prospects.length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospection IA</h1>
          <p className="text-gray-600 mt-1">Identification et qualification automatisée de prospects</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Nouvelle Campagne
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Scanner Prospects
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Prospects</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Nouveaux</p>
              <p className="text-xl font-bold text-blue-600">{stats.new}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Contactés</p>
              <p className="text-xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Qualifiés</p>
              <p className="text-xl font-bold text-green-600">{stats.qualified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Convertis</p>
              <p className="text-xl font-bold text-purple-600">{stats.converted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Score Moyen</p>
              <p className="text-xl font-bold text-orange-600">{stats.avgScore.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('prospects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prospects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Liste des Prospects
              </div>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Campagnes de Prospection
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
                <TrendingUp className="w-4 h-4" />
                Analytics & Performance
              </div>
            </button>
          </nav>
        </div>

        {/* Prospects Tab */}
        {activeTab === 'prospects' && (
          <div className="p-6">
            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtres:</span>
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="new">Nouveaux</option>
                  <option value="contacted">Contactés</option>
                  <option value="qualified">Qualifiés</option>
                  <option value="converted">Convertis</option>
                  <option value="rejected">Rejetés</option>
                </select>

                <select
                  value={filters.source}
                  onChange={(e) => setFilters({...filters, source: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Toutes les sources</option>
                  <option value="web_scraping">Web Scraping</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Référence</option>
                  <option value="api">API</option>
                  <option value="manual">Manuel</option>
                </select>

                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">Toutes les industries</option>
                  <option value="Construction">Construction</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Industrial Services">Services Industriels</option>
                  <option value="Renewable Energy">Énergie Renouvelable</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Score min:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.score_min}
                    onChange={(e) => setFilters({...filters, score_min: parseInt(e.target.value)})}
                    className="w-20"
                  />
                  <span className="text-sm font-medium text-gray-900">{filters.score_min}</span>
                </div>
              </div>
            </div>

            {/* Prospects List */}
            <div className="space-y-4">
              {filteredProspects.map((prospect) => (
                <div key={prospect.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(prospect.source)}
                          <h3 className="text-lg font-semibold text-gray-900">{prospect.company_name}</h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prospect.status)}`}>
                          {prospect.status}
                        </span>
                        <div className={`flex items-center gap-1 ${getScoreColor(prospect.score)}`}>
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold">{prospect.score}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4" />
                          <span>{prospect.industry} • {prospect.employee_count} employés</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{prospect.location}</span>
                        </div>
                        {prospect.revenue_estimate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Rev: {prospect.revenue_estimate}</span>
                          </div>
                        )}
                      </div>

                      {prospect.contact_name && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{prospect.contact_name}</p>
                              <p className="text-sm text-gray-600">{prospect.contact_title}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {prospect.contact_email && (
                                <a href={`mailto:${prospect.contact_email}`} className="text-blue-600 hover:text-blue-800">
                                  <Mail className="w-4 h-4" />
                                </a>
                              )}
                              {prospect.contact_linkedin && (
                                <a href={prospect.contact_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                                  <LinkedinIcon className="w-4 h-4" />
                                </a>
                              )}
                              {prospect.phone && (
                                <a href={`tel:${prospect.phone}`} className="text-green-600 hover:text-green-800">
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {prospect.notes && (
                        <p className="text-sm text-gray-600 mb-3 italic">"{prospect.notes}"</p>
                      )}

                      {(prospect.technologies?.length || prospect.certifications?.length) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {prospect.technologies?.map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tech}
                            </span>
                          ))}
                          {prospect.certifications?.map((cert, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => setSelectedProspect(prospect)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {prospect.website && (
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {(prospect.last_contact || prospect.next_follow_up) && (
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                      {prospect.last_contact && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Dernier contact: {new Date(prospect.last_contact).toLocaleDateString('fr-CA')}</span>
                        </div>
                      )}
                      {prospect.next_follow_up && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <span>Suivi prévu: {new Date(prospect.next_follow_up).toLocaleDateString('fr-CA')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredProspects.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun prospect ne correspond aux filtres sélectionnés.</p>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status === 'active' ? 'Actif' : campaign.status === 'paused' ? 'Pausé' : 'Terminé'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Industries Ciblées</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.target_criteria.industries.map((industry, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Taille d'Entreprise</p>
                      <p className="text-sm font-medium text-gray-900">{campaign.target_criteria.employee_range}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Prospects Trouvés</p>
                      <p className="text-sm font-bold text-blue-600">{campaign.prospects_found}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Taux de Conversion</p>
                      <p className="text-sm font-bold text-green-600">{campaign.conversion_rate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>Dernière exécution: {campaign.last_run}</span>
                      <span>Prochaine: {campaign.next_run}</span>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      campaign.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                      {campaign.status === 'active' ? 'Pause' : 'Démarrer'}
                    </button>
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Source</h3>
                <div className="space-y-3">
                  {['web_scraping', 'linkedin', 'referral', 'api'].map((source) => {
                    const sourceProspects = prospects.filter(p => p.source === source);
                    const avgScore = sourceProspects.reduce((sum, p) => sum + p.score, 0) / sourceProspects.length || 0;
                    const conversionRate = (sourceProspects.filter(p => p.status === 'qualified' || p.status === 'converted').length / sourceProspects.length) * 100 || 0;
                    
                    return (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {source.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-bold text-gray-900">{sourceProspects.length} prospects</p>
                          <p className="text-gray-600">Score: {avgScore.toFixed(0)} • Conv: {conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances & Opportunités</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Croissance Construction</span>
                    </div>
                    <p className="text-xs text-green-700">+45% de nouveaux prospects construction ce mois</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkedinIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">LinkedIn Performance</span>
                    </div>
                    <p className="text-xs text-blue-700">Taux de conversion LinkedIn: 21.7% (meilleure source)</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Follow-ups Requis</span>
                    </div>
                    <p className="text-xs text-orange-700">3 prospects qualifiés nécessitent un suivi cette semaine</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Prospects Premium</span>
                    </div>
                    <p className="text-xs text-purple-700">2 prospects avec score 90+ prêts pour contact direct</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}