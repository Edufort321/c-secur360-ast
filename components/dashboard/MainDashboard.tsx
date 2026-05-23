'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  Activity, Users, FileText, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Shield, Building, Calendar, Download,
  Bell, Filter, RefreshCw, Eye, Edit, Trash2, Plus
} from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { useTheme } from '../layout/AppLayout';
import WorkerPresenceDashboard from '../workers/WorkerPresenceDashboard';

// Types pour les données du dashboard
interface ASTData {
  id: string;
  projectName: string;
  organizationName: string;
  createdDate: Date;
  lastModified: Date;
  status: 'draft' | 'active' | 'approved' | 'expired' | 'archived';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  completionRate: number;
  assignedUsers: string[];
  location: string;
  workType: string;
  hazards: number;
  controlMeasures: number;
  complianceScore: number;
}

interface DashboardStats {
  totalAST: number;
  activeAST: number;
  expiringSoon: number;
  highRiskAST: number;
  averageComplianceScore: number;
  totalUsers: number;
  recentActivity: number;
  monthlyTrend: number;
}

interface ActivityLog {
  id: string;
  type: 'created' | 'modified' | 'approved' | 'expired' | 'archived';
  astId: string;
  astName: string;
  userName: string;
  timestamp: Date;
  description: string;
}

const MainDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [astData, setAstData] = useState<ASTData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Couleurs pour les graphiques
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#8b5cf6',
    gray: '#6b7280'
  };

  // Simulation de données réelles - À remplacer par des appels API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Simuler l'API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Données simulées d'AST
      const mockASTData: ASTData[] = [
        {
          id: 'ast_001',
          projectName: 'Maintenance Turbine #3',
          organizationName: 'Hydro-Québec',
          createdDate: new Date('2024-08-01'),
          lastModified: new Date('2024-08-15'),
          status: 'approved',
          riskLevel: 'high',
          completionRate: 100,
          assignedUsers: ['Jean Tremblay', 'Marie Dubois'],
          location: 'Centrale de la Manic-5',
          workType: 'Maintenance électrique',
          hazards: 8,
          controlMeasures: 12,
          complianceScore: 95
        },
        {
          id: 'ast_002',
          projectName: 'Construction Pont Champlain - Section A',
          organizationName: 'Construction ABC Inc.',
          createdDate: new Date('2024-08-10'),
          lastModified: new Date('2024-08-18'),
          status: 'active',
          riskLevel: 'critical',
          completionRate: 85,
          assignedUsers: ['Pierre Martin', 'Sophie Gagnon', 'Marc Leblanc'],
          location: 'Montréal, QC',
          workType: 'Construction civile',
          hazards: 15,
          controlMeasures: 18,
          complianceScore: 88
        },
        {
          id: 'ast_003',
          projectName: 'Inspection Raffinerie',
          organizationName: 'Pétrolia Canada',
          createdDate: new Date('2024-07-20'),
          lastModified: new Date('2024-08-19'),
          status: 'expired',
          riskLevel: 'medium',
          completionRate: 90,
          assignedUsers: ['Robert Caron'],
          location: 'Lévis, QC',
          workType: 'Inspection équipements',
          hazards: 6,
          controlMeasures: 9,
          complianceScore: 78
        },
        {
          id: 'ast_004',
          projectName: 'Rénovation Bureau - Étage 12',
          organizationName: 'Métallurgie Dorval',
          createdDate: new Date('2024-08-12'),
          lastModified: new Date('2024-08-19'),
          status: 'draft',
          riskLevel: 'low',
          completionRate: 45,
          assignedUsers: ['Anne Lapointe'],
          location: 'Dorval, QC',
          workType: 'Rénovation',
          hazards: 3,
          controlMeasures: 5,
          complianceScore: 65
        }
      ];
      
      const mockStats: DashboardStats = {
        totalAST: 47,
        activeAST: 23,
        expiringSoon: 5,
        highRiskAST: 8,
        averageComplianceScore: 87,
        totalUsers: 156,
        recentActivity: 32,
        monthlyTrend: 12.5
      };
      
      const mockActivities: ActivityLog[] = [
        {
          id: 'act_1',
          type: 'approved',
          astId: 'ast_001',
          astName: 'Maintenance Turbine #3',
          userName: 'Superviseur Sécurité',
          timestamp: new Date('2024-08-19T14:30:00'),
          description: 'AST approuvée après révision finale'
        },
        {
          id: 'act_2',
          type: 'modified',
          astId: 'ast_002',
          astName: 'Construction Pont Champlain - Section A',
          userName: 'Pierre Martin',
          timestamp: new Date('2024-08-19T11:15:00'),
          description: 'Ajout de mesures de contrôle pour travail en hauteur'
        },
        {
          id: 'act_3',
          type: 'expired',
          astId: 'ast_003',
          astName: 'Inspection Raffinerie',
          userName: 'Système',
          timestamp: new Date('2024-08-19T09:00:00'),
          description: 'AST expirée - renouvellement requis'
        },
        {
          id: 'act_4',
          type: 'created',
          astId: 'ast_004',
          astName: 'Rénovation Bureau - Étage 12',
          userName: 'Anne Lapointe',
          timestamp: new Date('2024-08-19T08:45:00'),
          description: 'Nouvelle AST créée'
        }
      ];
      
      setAstData(mockASTData);
      setStats(mockStats);
      setActivities(mockActivities);
      setLoading(false);
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  // Données pour les graphiques
  const chartData = astData.map(ast => ({
    name: ast.projectName.slice(0, 20) + '...',
    compliance: ast.complianceScore,
    hazards: ast.hazards,
    controls: ast.controlMeasures,
    completion: ast.completionRate
  }));

  const riskDistribution = [
    { name: 'Faible', value: astData.filter(ast => ast.riskLevel === 'low').length, color: COLORS.success },
    { name: 'Moyen', value: astData.filter(ast => ast.riskLevel === 'medium').length, color: COLORS.warning },
    { name: 'Élevé', value: astData.filter(ast => ast.riskLevel === 'high').length, color: COLORS.danger },
    { name: 'Critique', value: astData.filter(ast => ast.riskLevel === 'critical').length, color: '#7c2d12' }
  ];

  const statusDistribution = [
    { name: 'Brouillon', value: astData.filter(ast => ast.status === 'draft').length },
    { name: 'Actif', value: astData.filter(ast => ast.status === 'active').length },
    { name: 'Approuvé', value: astData.filter(ast => ast.status === 'approved').length },
    { name: 'Expiré', value: astData.filter(ast => ast.status === 'expired').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredASTData = astData.filter(ast => {
    const matchesSearch = ast.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ast.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || ast.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <AppLayout currentPage="dashboard">
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Chargement du tableau de bord...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="dashboard">
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tableau de Bord Principal
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Vue d'ensemble de vos analyses sécuritaires de tâches (AST)
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nouvelle AST
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total AST</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAST}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.monthlyTrend}% ce mois
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AST Actives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAST}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conformité Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageComplianceScore}%</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Risque Élevé</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.highRiskAST}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Score de Conformité par AST
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="compliance" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition des Niveaux de Risque
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Presence Dashboard */}
        <div className="mb-8">
          <WorkerPresenceDashboard 
            siteId="main-site"
            language="fr"
            refreshInterval={30}
            compactMode={false}
          />
        </div>

        {/* AST List and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AST List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  AST Récentes ({filteredASTData.length})
                </h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous risques</option>
                    <option value="low">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Élevé</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredASTData.map((ast) => (
                <div key={ast.id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {ast.projectName}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ast.status)}`}>
                          {ast.status === 'approved' && 'Approuvé'}
                          {ast.status === 'active' && 'Actif'}
                          {ast.status === 'draft' && 'Brouillon'}
                          {ast.status === 'expired' && 'Expiré'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(ast.riskLevel)}`}>
                          {ast.riskLevel === 'low' && 'Faible'}
                          {ast.riskLevel === 'medium' && 'Moyen'}
                          {ast.riskLevel === 'high' && 'Élevé'}
                          {ast.riskLevel === 'critical' && 'Critique'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {ast.organizationName} • {ast.location}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ast.hazards} dangers identifiés</span>
                        <span>{ast.controlMeasures} mesures de contrôle</span>
                        <span>Conformité: {ast.complianceScore}%</span>
                        <span>Complété: {ast.completionRate}%</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {ast.assignedUsers.slice(0, 3).map((user, index) => (
                          <div key={index} className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                            {user.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {ast.assignedUsers.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{ast.assignedUsers.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Activité Récente
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'approved' ? 'bg-green-100' :
                    activity.type === 'modified' ? 'bg-blue-100' :
                    activity.type === 'expired' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {activity.type === 'modified' && <Edit className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'expired' && <Clock className="w-4 h-4 text-red-600" />}
                    {activity.type === 'created' && <Plus className="w-4 h-4 text-gray-600" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.astName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.userName} • {activity.timestamp.toLocaleDateString('fr-CA')} à {activity.timestamp.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MainDashboard;