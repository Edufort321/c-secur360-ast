'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield, Users, Building,
  Search, Filter, Download, Calendar, Zap, CheckCircle, Clock,
  MapPin, FileText, Eye, ChevronDown, Target, Award
} from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { useTheme } from '../layout/AppLayout';
import { MultiSiteDatabase } from '../../lib/multi-site-database';

interface SiteComparison {
  siteId: string;
  siteName: string;
  accidentRate: number;
  complianceScore: number;
  astCount: number;
  overdueInspections: number;
  rank: number;
  trend: 'improving' | 'stable' | 'declining';
}

const ConsolidatedAnalytics: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#8b5cf6'
  };

  // Données clients simulées
  const mockClients = [
    { id: 'all', name: 'Tous les clients' },
    { id: 'client_abc', name: 'Construction ABC Inc.' },
    { id: 'client_hydro', name: 'Hydro-Québec' },
    { id: 'client_petrolia', name: 'Pétrolia Canada' }
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        // Simulation - À remplacer par vraies API calls
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const clientId = selectedClient === 'all' ? 'consolidated' : selectedClient;
        const dashboard = await MultiSiteDatabase.getConsolidatedDashboard(clientId, selectedPeriod);
        const accidentStats = await MultiSiteDatabase.getAccidentStatistics(clientId);
        
        setDashboardData({ dashboard, accidentStats });
        
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedClient, selectedPeriod]);

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await MultiSiteDatabase.globalSearch('consolidated', searchQuery, {
        dataTypes: ['ast', 'accidents', 'inspections', 'training', 'equipment'],
        limit: 20
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur recherche globale:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Export rapport ${format} pour ${selectedClient} - ${selectedPeriod}`);
    alert(`Rapport ${format.toUpperCase()} généré et téléchargé avec succès !`);
  };

  if (loading) {
    return (
      <AppLayout currentPage="analytics">
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <BarChart className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Chargement des analyses consolidées...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="analytics">
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header avec contrôles */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Analyses Consolidées Multi-Sites
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Vue d'ensemble des performances sécuritaires à travers tous vos sites
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
              {/* Sélection client */}
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              
              {/* Sélection période */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              
              {/* Boutons export */}
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('excel')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Recherche globale */}
          <div className={`rounded-xl p-6 shadow-sm mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Rechercher dans toute la base de données (AST, accidents, inspections, formations, équipements...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-lg transition-colors ${
                  isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={handleGlobalSearch}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rechercher
              </button>
            </div>
            
            {/* Résultats de recherche */}
            {searchResults && (
              <div className="mt-6 border-t pt-6">
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Résultats de recherche ({searchResults.totalResults})
                </h3>
                <div className="space-y-3">
                  {searchResults.results.map((result: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.type === 'ast' ? 'bg-blue-100 text-blue-800' :
                              result.type === 'accident' ? 'bg-red-100 text-red-800' :
                              result.type === 'inspection' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {result.type.toUpperCase()}
                            </span>
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {result.title}
                            </h4>
                          </div>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {result.siteName}
                            </span>
                            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {result.lastUpdated.toLocaleDateString('fr-CA')}
                            </span>
                            <span className={`font-medium ${
                              result.relevanceScore > 0.8 ? 'text-green-600' : 
                              result.relevanceScore > 0.6 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              Pertinence: {Math.round(result.relevanceScore * 100)}%
                            </span>
                          </div>
                        </div>
                        <button className={`ml-4 p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        }`}>
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {dashboardData && (
            <>
              {/* KPIs consolidés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sites Totaux</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dashboardData.dashboard.summary.totalSites}
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2 ce trimestre
                  </div>
                </div>

                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Taux d'Accidents</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dashboardData.dashboard.riskMetrics.incidentRate}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>pour 100 employés</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -15% vs. année précédente
                  </div>
                </div>

                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Conformité Globale</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dashboardData.dashboard.summary.averageComplianceScore}%
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <Target className="w-4 h-4 mr-1" />
                    Objectif: 90%
                  </div>
                </div>

                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AST Actives</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {dashboardData.dashboard.summary.activeAST}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {dashboardData.dashboard.summary.expiredAST} expirées
                  </div>
                </div>
              </div>

              {/* Graphiques analytiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Tendance des accidents par site */}
                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Tendance des Accidents par Site
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.dashboard.trends.accidentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1f2937' : 'white',
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                          color: isDark ? 'white' : 'black'
                        }}
                      />
                      <Line type="monotone" dataKey="total" stroke={COLORS.danger} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Répartition des accidents par type */}
                <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Types d'Accidents
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardData.accidentStats.byType).map(([key, value]) => ({
                          name: key === 'accident' ? 'Accident' :
                                key === 'near_miss' ? 'Quasi-accident' :
                                key === 'property_damage' ? 'Dommage matériel' : 'Environnemental',
                          value: value as number
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {Object.entries(dashboardData.accidentStats.byType).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparaison des sites */}
              <div className={`rounded-xl p-6 shadow-sm mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Comparaison des Performances par Site
                  </h3>
                  <button className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Rapport détaillé
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rang</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Site</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Score Conformité</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Taux Accidents</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tendance</th>
                        <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.dashboard.topPerformingSites.map((site: any, index: number) => (
                        <tr key={site.siteId} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="py-3 px-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {site.siteName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                                site.complianceScore >= 90 ? 'bg-green-100 text-green-800' :
                                site.complianceScore >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {site.complianceScore}%
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              site.incidentRate <= 2 ? 'text-green-600' :
                              site.incidentRate <= 3 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {site.incidentRate}
                            </span>
                            <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              /100 emp.
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`flex items-center gap-1 ${
                              index < 2 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {index < 2 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span className="text-sm capitalize">
                                {index < 2 ? 'Amélioration' : 'Déclin'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button className={`p-2 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}>
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alertes consolidées */}
              <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Alertes Prioritaires
                </h3>
                
                <div className="space-y-3">
                  {dashboardData.dashboard.alerts.map((alert: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {alert.type === 'critical' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : alert.type === 'warning' ? (
                            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                          ) : (
                            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                          )}
                          <div>
                            <p className={`font-medium ${
                              alert.type === 'critical' ? 'text-red-800 dark:text-red-200' :
                              alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                              'text-blue-800 dark:text-blue-200'
                            }`}>
                              {alert.message}
                            </p>
                            {alert.siteId !== 'all' && (
                              <p className={`text-sm mt-1 ${
                                alert.type === 'critical' ? 'text-red-600 dark:text-red-300' :
                                alert.type === 'warning' ? 'text-yellow-600 dark:text-yellow-300' :
                                'text-blue-600 dark:text-blue-300'
                              }`}>
                                Site: {alert.siteId}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {alert.actionRequired && (
                          <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            alert.type === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                            alert.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                            'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            Agir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ConsolidatedAnalytics;