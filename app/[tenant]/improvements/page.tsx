'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Target,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Star,
  Users,
  Calendar,
  Award,
  ArrowUp,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

// Types pour les améliorations
interface Improvement {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'process' | 'equipment' | 'training' | 'environment' | 'cost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  submitted_by: string;
  submitted_date: string;
  assigned_to?: string;
  target_completion?: string;
  estimated_cost?: number;
  expected_savings?: number;
  roi_estimated?: number;
  impact_score: number;
  feasibility_score: number;
  votes: number;
  comments: number;
  tags: string[];
  implementation_steps?: string[];
  progress?: number;
}

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function ImprovementsPage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'in_progress' | 'completed' | 'analytics'>('suggestions');
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Données démo pour les améliorations
  const DEMO_IMPROVEMENTS: Improvement[] = [
    {
      id: 'imp-001',
      title: 'Installation de barrières de sécurité automatiques',
      description: 'Installer des barrières automatiques à proximité des équipements dangereux pour prévenir les accidents. Système avec détecteurs de mouvement et arrêt d\'urgence automatique.',
      category: 'safety',
      priority: 'high',
      status: 'approved',
      submitted_by: 'Jean Dupont',
      submitted_date: '2024-08-15',
      assigned_to: 'Marc Tremblay',
      target_completion: '2024-10-15',
      estimated_cost: 15000,
      expected_savings: 50000,
      roi_estimated: 233,
      impact_score: 95,
      feasibility_score: 85,
      votes: 12,
      comments: 8,
      tags: ['sécurité', 'automatisation', 'prévention'],
      implementation_steps: [
        'Évaluation des zones à risque',
        'Sélection des équipements',
        'Installation et tests',
        'Formation du personnel'
      ],
      progress: 25
    },
    {
      id: 'imp-002',
      title: 'Optimisation du processus de maintenance préventive',
      description: 'Implémenter un système de maintenance prédictive basé sur l\'IA pour réduire les pannes non planifiées et optimiser les coûts de maintenance.',
      category: 'process',
      priority: 'medium',
      status: 'under_review',
      submitted_by: 'Sophie Martin',
      submitted_date: '2024-08-10',
      estimated_cost: 25000,
      expected_savings: 75000,
      roi_estimated: 200,
      impact_score: 88,
      feasibility_score: 75,
      votes: 8,
      comments: 5,
      tags: ['maintenance', 'IA', 'optimisation', 'coûts']
    },
    {
      id: 'imp-003',
      title: 'Amélioration de l\'éclairage LED dans les ateliers',
      description: 'Remplacement complet de l\'éclairage existant par des LED haute performance pour améliorer la visibilité et réduire la consommation énergétique.',
      category: 'environment',
      priority: 'low',
      status: 'completed',
      submitted_by: 'Caroline Leblanc',
      submitted_date: '2024-07-01',
      assigned_to: 'David Roy',
      target_completion: '2024-08-15',
      estimated_cost: 8000,
      expected_savings: 12000,
      roi_estimated: 50,
      impact_score: 70,
      feasibility_score: 95,
      votes: 15,
      comments: 3,
      tags: ['énergie', 'environnement', 'éclairage'],
      progress: 100
    },
    {
      id: 'imp-004',
      title: 'Formation VR pour situations dangereuses',
      description: 'Développer des modules de formation en réalité virtuelle pour simuler des situations dangereuses sans risque réel pour les employés.',
      category: 'training',
      priority: 'medium',
      status: 'proposed',
      submitted_by: 'Marc Tremblay',
      submitted_date: '2024-08-20',
      estimated_cost: 35000,
      expected_savings: 20000,
      roi_estimated: -43,
      impact_score: 92,
      feasibility_score: 60,
      votes: 6,
      comments: 12,
      tags: ['formation', 'VR', 'sécurité', 'innovation']
    },
    {
      id: 'imp-005',
      title: 'Système de reconnaissance vocale pour rapports',
      description: 'Implémenter un système de reconnaissance vocale pour permettre la dictée rapide des rapports d\'inspection et AST sur le terrain.',
      category: 'process',
      priority: 'low',
      status: 'in_progress',
      submitted_by: 'David Roy',
      submitted_date: '2024-08-05',
      assigned_to: 'Sophie Martin',
      target_completion: '2024-09-30',
      estimated_cost: 12000,
      expected_savings: 18000,
      roi_estimated: 50,
      impact_score: 75,
      feasibility_score: 80,
      votes: 9,
      comments: 4,
      tags: ['technologie', 'efficacité', 'mobile'],
      implementation_steps: [
        'Sélection de la plateforme',
        'Développement interface',
        'Tests pilotes',
        'Déploiement complet'
      ],
      progress: 60
    }
  ];

  // Initialiser les données
  useEffect(() => {
    setImprovements(DEMO_IMPROVEMENTS);
  }, []);

  // Filtrer les améliorations
  const filteredImprovements = improvements.filter(improvement => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!improvement.title.toLowerCase().includes(searchLower) &&
          !improvement.description.toLowerCase().includes(searchLower) &&
          !improvement.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && improvement.category !== categoryFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && improvement.priority !== priorityFilter) {
      return false;
    }
    if (statusFilter !== 'all' && improvement.status !== statusFilter) {
      return false;
    }
    
    // Filtrer par onglet
    if (activeTab === 'in_progress' && !['approved', 'in_progress'].includes(improvement.status)) {
      return false;
    }
    if (activeTab === 'completed' && improvement.status !== 'completed') {
      return false;
    }
    
    return true;
  });

  // Statistiques
  const stats = {
    total: improvements.length,
    proposed: improvements.filter(i => i.status === 'proposed').length,
    in_progress: improvements.filter(i => ['approved', 'in_progress'].includes(i.status)).length,
    completed: improvements.filter(i => i.status === 'completed').length,
    total_savings: improvements.reduce((acc, i) => acc + (i.expected_savings || 0), 0),
    avg_roi: Math.round(improvements.reduce((acc, i) => acc + (i.roi_estimated || 0), 0) / improvements.length)
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-indigo-100 text-indigo-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'proposed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'approved': return 'Approuvée';
      case 'under_review': return 'En révision';
      case 'proposed': return 'Proposée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'process': return <Zap className="w-4 h-4" />;
      case 'equipment': return <Award className="w-4 h-4" />;
      case 'training': return <Users className="w-4 h-4" />;
      case 'environment': return <Lightbulb className="w-4 h-4" />;
      case 'cost': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'safety': return 'Sécurité';
      case 'process': return 'Processus';
      case 'equipment': return 'Équipement';
      case 'training': return 'Formation';
      case 'environment': return 'Environnement';
      case 'cost': return 'Coût';
      default: return category;
    }
  };

  const handleNewImprovement = () => {
    alert('💡 Nouvelle Suggestion\n\nFonctionnalité complète disponible bientôt:\n• Formulaire de suggestion détaillé\n• Upload photos/documents\n• Estimation ROI automatique\n• Système de vote collaboratif\n• Workflow d\'approbation');
  };

  const renderImprovementCard = (improvement: Improvement) => (
    <div key={improvement.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(improvement.category)}
              <h3 className="text-lg font-medium text-gray-900">{improvement.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">{improvement.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Par: {improvement.submitted_by}</span>
              <span>{new Date(improvement.submitted_date).toLocaleDateString('fr-FR')}</span>
              {improvement.assigned_to && (
                <span>Assigné à: {improvement.assigned_to}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(improvement.status)}`}>
              {getStatusLabel(improvement.status)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(improvement.priority)}`}>
              {getPriorityLabel(improvement.priority)}
            </span>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
          <div className="text-sm">
            <p className="font-medium text-gray-900">Impact</p>
            <div className="flex items-center gap-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${improvement.impact_score}%` }}
                ></div>
              </div>
              <span className="text-xs text-green-600">{improvement.impact_score}%</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Faisabilité</p>
            <div className="flex items-center gap-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${improvement.feasibility_score}%` }}
                ></div>
              </div>
              <span className="text-xs text-blue-600">{improvement.feasibility_score}%</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">ROI Estimé</p>
            <p className={`font-semibold ${
              (improvement.roi_estimated || 0) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {improvement.roi_estimated ? `${improvement.roi_estimated}%` : 'N/A'}
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Économies</p>
            <p className="text-green-600 font-semibold">
              {improvement.expected_savings ? `$${improvement.expected_savings.toLocaleString()}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Progression pour les améliorations en cours */}
        {improvement.progress !== undefined && (
          <div className="py-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-900">Progression</p>
              <span className="text-sm text-gray-600">{improvement.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${improvement.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {improvement.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {improvement.votes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {improvement.comments}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => alert(`👁️ Voir détails: ${improvement.title}\n\nFonctionnalité complète disponible bientôt`)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </button>
            <button
              onClick={() => alert(`👍 Voter pour: ${improvement.title}\n\nFonctionnalité complète disponible bientôt`)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Voter
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Économies Totales</p>
              <p className="text-2xl font-bold text-green-600">${stats.total_savings.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">ROI Moyen</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avg_roi}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Taux Réalisation</p>
              <p className="text-2xl font-bold text-indigo-600">
                {Math.round((stats.completed / stats.total) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Analytics Détaillées
        </h3>
        <p className="text-gray-600 mb-6">
          Graphiques et analyses approfondies des améliorations disponibles bientôt
        </p>
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
                <h1 className="text-2xl font-bold text-gray-900">Améliorations Continues</h1>
                <p className="text-gray-600 mt-1">Suggestions et initiatives d'amélioration</p>
              </div>
            </div>
            <button 
              onClick={handleNewImprovement}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Suggestion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Suggestions ({stats.proposed})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'in_progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En Cours ({stats.in_progress})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Terminées ({stats.completed})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters (except for analytics tab) */}
      {activeTab !== 'analytics' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    placeholder="Rechercher par titre, description, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes catégories</option>
                <option value="safety">Sécurité</option>
                <option value="process">Processus</option>
                <option value="equipment">Équipement</option>
                <option value="training">Formation</option>
                <option value="environment">Environnement</option>
                <option value="cost">Coût</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="critical">Critique</option>
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'analytics' ? (
          renderAnalyticsTab()
        ) : (
          <div className="space-y-6">
            {filteredImprovements.map(improvement => renderImprovementCard(improvement))}
            
            {/* Empty State */}
            {filteredImprovements.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune amélioration trouvée
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Aucune amélioration ne correspond aux filtres sélectionnés.'
                    : 'Commencez par proposer votre première amélioration.'}
                </p>
                <button 
                  onClick={handleNewImprovement}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle Suggestion
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💡 Module Amélioration Continue Avancé
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🚀 Innovation Collaborative</h4>
              <ul className="space-y-1 text-xs">
                <li>• Système de suggestions participatif</li>
                <li>• Votes et commentaires équipe</li>
                <li>• Workflow approbation structuré</li>
                <li>• Gamification et récompenses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 ROI et Impact</h4>
              <ul className="space-y-1 text-xs">
                <li>• Calculs ROI automatiques</li>
                <li>• Suivi économies réalisées</li>
                <li>• Métriques impact sécurité</li>
                <li>• Tableaux de bord performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Amélioration Continue</h4>
              <ul className="space-y-1 text-xs">
                <li>• Méthodologie Kaizen intégrée</li>
                <li>• Templates par catégorie</li>
                <li>• Suivi implémentation temps réel</li>
                <li>• Reporting conformité ISO 9001</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}