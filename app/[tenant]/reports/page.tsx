'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Eye,
  FileText,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Building,
  MapPin,
  Star,
  Zap,
  Award
} from 'lucide-react';

// Types pour les rapports
interface ReportData {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'ast' | 'incidents' | 'performance' | 'compliance' | 'overview';
  type: 'chart' | 'table' | 'document';
  data: any;
  generated_at: string;
  period: string;
}

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function ReportsPage({ params }: PageProps) {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'safety' | 'ast' | 'incidents' | 'performance' | 'compliance'>('overview');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reports, setReports] = useState<ReportData[]>([]);

  // Données démo pour les rapports
  const DEMO_REPORTS: ReportData[] = [
    {
      id: 'rpt-001',
      title: 'Vue d\'ensemble Sécurité',
      description: 'Tableau de bord complet des métriques de sécurité',
      category: 'overview',
      type: 'chart',
      data: {
        total_ast: 45,
        completed_ast: 42,
        pending_ast: 3,
        incidents: 2,
        safety_score: 94,
        compliance_rate: 98
      },
      generated_at: '2024-08-26',
      period: '30 derniers jours'
    },
    {
      id: 'rpt-002',
      title: 'Performance AST',
      description: 'Analyse des Analyses de Sécurité au Travail',
      category: 'ast',
      type: 'chart',
      data: {
        total_created: 45,
        total_approved: 42,
        total_rejected: 1,
        avg_completion_time: 2.4,
        top_hazards: ['Chute de hauteur', 'Électrocution', 'Écrasement']
      },
      generated_at: '2024-08-26',
      period: '30 derniers jours'
    },
    {
      id: 'rpt-003',
      title: 'Incidents et Accidents',
      description: 'Suivi des déclarations d\'incidents',
      category: 'incidents',
      type: 'table',
      data: {
        total_incidents: 2,
        minor_injuries: 1,
        near_misses: 3,
        investigation_completed: 2,
        avg_response_time: 1.2
      },
      generated_at: '2024-08-26',
      period: '30 derniers jours'
    },
    {
      id: 'rpt-004',
      title: 'Performance Équipe',
      description: 'Évaluation de la performance de l\'équipe',
      category: 'performance',
      type: 'chart',
      data: {
        total_members: 25,
        active_members: 23,
        avg_safety_score: 91,
        certifications_up_to_date: 22,
        training_completion_rate: 96
      },
      generated_at: '2024-08-26',
      period: '30 derniers jours'
    },
    {
      id: 'rpt-005',
      title: 'Conformité Réglementaire',
      description: 'État de la conformité aux normes',
      category: 'compliance',
      type: 'document',
      data: {
        overall_compliance: 98,
        csa_compliance: 100,
        osha_compliance: 96,
        iso_compliance: 99,
        pending_actions: 3
      },
      generated_at: '2024-08-26',
      period: '30 derniers jours'
    }
  ];

  // Initialiser les données
  useEffect(() => {
    setReports(DEMO_REPORTS);
  }, []);

  // Filtrer les rapports par catégorie
  const filteredReports = reports.filter(report => 
    activeCategory === 'overview' ? true : report.category === activeCategory
  );

  const categories = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-600',
      count: reports.length
    },
    {
      id: 'safety',
      label: 'Sécurité',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-green-600',
      count: reports.filter(r => r.category === 'safety').length
    },
    {
      id: 'ast',
      label: 'AST',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-600',
      count: reports.filter(r => r.category === 'ast').length
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-600',
      count: reports.filter(r => r.category === 'incidents').length
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-orange-600',
      count: reports.filter(r => r.category === 'performance').length
    },
    {
      id: 'compliance',
      label: 'Conformité',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-indigo-600',
      count: reports.filter(r => r.category === 'compliance').length
    }
  ];

  const renderOverviewDashboard = () => {
    const overviewReport = reports.find(r => r.category === 'overview');
    if (!overviewReport) return null;

    const data = overviewReport.data;

    return (
      <div className="space-y-6">
        {/* KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AST Totales</p>
                <p className="text-2xl font-bold text-blue-600">{data.total_ast}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AST Complétées</p>
                <p className="text-2xl font-bold text-green-600">{data.completed_ast}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{data.pending_ast}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Incidents</p>
                <p className="text-2xl font-bold text-red-600">{data.incidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Sécurité</p>
                <p className="text-2xl font-bold text-purple-600">{data.safety_score}%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformité</p>
                <p className="text-2xl font-bold text-indigo-600">{data.compliance_rate}%</p>
              </div>
              <Award className="h-8 w-8 text-indigo-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution AST (30 jours)</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Graphique interactif disponible bientôt</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par Département</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Graphique circulaire disponible bientôt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryReports = () => (
    <div className="space-y-6">
      {filteredReports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Généré le {new Date(report.generated_at).toLocaleDateString('fr-FR')}</span>
                  <span>Période: {report.period}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    report.type === 'chart' ? 'bg-blue-100 text-blue-800' :
                    report.type === 'table' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {report.type === 'chart' ? 'Graphique' :
                     report.type === 'table' ? 'Tableau' : 'Document'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`👁️ Consulter rapport: ${report.title}\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Consulter
                </button>
                <button
                  onClick={() => alert(`📥 Exporter rapport: ${report.title}\n\nFormats disponibles: PDF, Excel, CSV\n\nFonctionnalité complète disponible bientôt`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Data Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Aperçu des données:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.data).slice(0, 4).map(([key, value], index) => (
                  <div key={index} className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {Array.isArray(value) ? value.length : value}
                      {typeof value === 'number' && key.includes('rate') ? '%' : ''}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
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
                <h1 className="text-2xl font-bold text-gray-900">Rapports & Analytics</h1>
                <p className="text-gray-600 mt-1">Tableaux de bord et analyses de performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="last_7_days">7 derniers jours</option>
                <option value="last_30_days">30 derniers jours</option>
                <option value="last_90_days">90 derniers jours</option>
                <option value="current_year">Année courante</option>
                <option value="custom">Personnalisé</option>
              </select>
              
              <button 
                onClick={() => alert('📊 Génération rapport personnalisé\n\nFonctionnalité complète disponible bientôt')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Nouveau Rapport
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={category.color}>{category.icon}</span>
                  {category.label}
                  {category.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {category.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeCategory === 'overview' ? renderOverviewDashboard() : renderCategoryReports()}

        {/* Empty State */}
        {filteredReports.length === 0 && activeCategory !== 'overview' && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rapport disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Les rapports pour cette catégorie sont en cours de génération.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
              <BarChart3 className="h-4 w-4" />
              Générer Rapport
            </button>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            📊 Module Analytics et Rapports Avancés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📈 Analytics Temps Réel</h4>
              <ul className="space-y-1 text-xs">
                <li>• KPIs sécurité en direct</li>
                <li>• Tableaux de bord interactifs</li>
                <li>• Alertes performance automatiques</li>
                <li>• Comparaisons historiques</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📑 Rapports Conformité</h4>
              <ul className="space-y-1 text-xs">
                <li>• Conformité CSA/OSHA/ISO</li>
                <li>• Rapports réglementaires automatiques</li>
                <li>• Audit trail complet</li>
                <li>• Export formats multiples</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🤖 IA Prédictive</h4>
              <ul className="space-y-1 text-xs">
                <li>• Prédiction incidents</li>
                <li>• Recommandations amélioration</li>
                <li>• Analyse tendances</li>
                <li>• Alertes proactives</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}