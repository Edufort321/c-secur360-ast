'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Bot,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  MessageSquare,
  Mic,
  MicOff,
  RefreshCw,
  Settings,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  FileText,
  Database,
  Shield,
  ExternalLink,
  Play,
  Pause,
  Send,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Smartphone,
  Server
} from 'lucide-react';

// Interface pour les tâches de la todo list
interface TodoTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'api' | 'feature' | 'integration' | 'bug' | 'enhancement';
  assignee?: string;
  estimatedHours?: number;
  completedHours?: number;
  createdAt: string;
  dueDate?: string;
  dependencies?: string[];
  apiEndpoint?: string;
  implementationStatus?: 'exists' | 'partial' | 'missing' | 'broken';
}

// Interface pour les métriques système
interface SystemMetrics {
  apiHealth: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
  tenantStats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  financialMetrics: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
  };
  systemPerformance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  };
}

// Interface pour l'assistant IA
interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export default function UltimateDashboardPage() {
  // États principaux
  const [isListening, setIsListening] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Todo List avec analyse des APIs
  const [todoTasks, setTodoTasks] = useState<TodoTask[]>([
    // APIs Admin
    {
      id: 'api-admin-billing',
      title: 'Admin Billing API',
      description: 'API pour la facturation administrative et cron jobs',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/admin/billing',
      createdAt: '2024-08-26',
      estimatedHours: 8,
      completedHours: 8
    },
    {
      id: 'api-admin-tenants',
      title: 'Admin Tenants API',
      description: 'API complète de gestion des tenants avec Stripe',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/admin/tenants',
      createdAt: '2024-08-26',
      estimatedHours: 12,
      completedHours: 12
    },
    {
      id: 'api-admin-twilio',
      title: 'Twilio Configuration API',
      description: 'Configuration SMS et voice pour alertes',
      status: 'completed',
      priority: 'medium',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/admin/twilio-config',
      createdAt: '2024-08-26',
      estimatedHours: 6,
      completedHours: 6
    },
    
    // APIs Intelligence Artificielle
    {
      id: 'api-ai-journal',
      title: 'AI Process Journal API',
      description: 'Traitement IA des journaux de travail',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/ai/process-journal',
      createdAt: '2024-08-26',
      estimatedHours: 10,
      completedHours: 10
    },
    {
      id: 'api-chat-assistant',
      title: 'OpenAI Chat Assistant API',
      description: 'Assistant IA conversationnel pour admin',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/chat/assistant',
      createdAt: '2024-08-26',
      estimatedHours: 15,
      completedHours: 15
    },

    // APIs AST & Safety
    {
      id: 'api-ast-core',
      title: 'AST Core API',
      description: 'API principale pour analyses sécurité travail',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/ast',
      createdAt: '2024-08-26',
      estimatedHours: 20,
      completedHours: 20
    },

    // APIs Authentification & Sécurité
    {
      id: 'api-auth-mfa',
      title: 'MFA Authentication APIs',
      description: 'Authentification multi-facteur complète',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/auth/mfa/*',
      createdAt: '2024-08-26',
      estimatedHours: 16,
      completedHours: 16
    },
    {
      id: 'api-auth-login',
      title: 'Login/Logout APIs',
      description: 'Système de connexion sécurisé',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/auth/login',
      createdAt: '2024-08-26',
      estimatedHours: 12,
      completedHours: 12
    },

    // APIs Facturation Stripe
    {
      id: 'api-billing-stripe',
      title: 'Stripe Billing Integration',
      description: 'Intégration complète Stripe avec webhooks',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/billing/*',
      createdAt: '2024-08-26',
      estimatedHours: 18,
      completedHours: 18
    },

    // APIs Gantt & Planning
    {
      id: 'api-gantt-ai',
      title: 'Gantt AI Assistant API',
      description: 'Planification IA avec assistant Gantt',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/gantt/ai-assist',
      createdAt: '2024-08-26',
      estimatedHours: 14,
      completedHours: 14
    },
    {
      id: 'api-gantt-projects',
      title: 'Projects & Tasks APIs',
      description: 'Gestion projets et tâches avec ressources',
      status: 'completed',
      priority: 'medium',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/gantt/projects',
      createdAt: '2024-08-26',
      estimatedHours: 16,
      completedHours: 16
    },

    // APIs RH & Employés
    {
      id: 'api-hr-complete',
      title: 'HR Management APIs',
      description: 'APIs RH complètes avec sécurité et certifications',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/hr/*',
      createdAt: '2024-08-26',
      estimatedHours: 24,
      completedHours: 24
    },

    // APIs Inventaire & QR
    {
      id: 'api-inventory-qr',
      title: 'Inventory & QR APIs',
      description: 'Système inventaire QR avec génération étiquettes',
      status: 'completed',
      priority: 'medium',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/inventory/*',
      createdAt: '2024-08-26',
      estimatedHours: 12,
      completedHours: 12
    },
    {
      id: 'api-qr-generate',
      title: 'QR Code Generation API',
      description: 'Génération QR codes pour équipements',
      status: 'completed',
      priority: 'medium',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/qr/generate',
      createdAt: '2024-08-26',
      estimatedHours: 6,
      completedHours: 6
    },

    // APIs Notifications & Communications
    {
      id: 'api-sms-system',
      title: 'SMS Notification System',
      description: 'Système SMS complet avec Twilio et webhooks',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/sms/*',
      createdAt: '2024-08-26',
      estimatedHours: 16,
      completedHours: 16
    },
    {
      id: 'api-voice-system',
      title: 'Voice Communication API',
      description: 'Système vocal pour urgences',
      status: 'completed',
      priority: 'medium',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/voice/*',
      createdAt: '2024-08-26',
      estimatedHours: 10,
      completedHours: 10
    },

    // APIs RBAC & Permissions
    {
      id: 'api-rbac-system',
      title: 'RBAC Permission System',
      description: 'Système granulaire de rôles et permissions',
      status: 'completed',
      priority: 'urgent',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/rbac/*',
      createdAt: '2024-08-26',
      estimatedHours: 20,
      completedHours: 20
    },

    // APIs Timesheets
    {
      id: 'api-timesheets-mobile',
      title: 'Mobile Timesheets API',
      description: 'API feuilles de temps mobiles avec géolocalisation',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/timesheets/mobile',
      createdAt: '2024-08-26',
      estimatedHours: 18,
      completedHours: 18
    },

    // APIs System & Monitoring
    {
      id: 'api-system-status',
      title: 'System Status API',
      description: 'Monitoring système et health checks',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/system/status',
      createdAt: '2024-08-26',
      estimatedHours: 8,
      completedHours: 8
    },

    // APIs Audit & Compliance
    {
      id: 'api-audit-system',
      title: 'Audit Trail APIs',
      description: 'Système audit complet avec export',
      status: 'completed',
      priority: 'high',
      category: 'api',
      implementationStatus: 'exists',
      apiEndpoint: '/api/audit/*',
      createdAt: '2024-08-26',
      estimatedHours: 14,
      completedHours: 14
    },

    // FONCTIONNALITÉS À DÉVELOPPER
    {
      id: 'feature-equipment-inspection',
      title: 'Equipment Inspection Module',
      description: 'Module inspection équipements (nacelles, chariots, échelles)',
      status: 'pending',
      priority: 'urgent',
      category: 'feature',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 20,
      dependencies: ['api-qr-generate']
    },
    {
      id: 'feature-demo-ast-restrictions',
      title: 'Demo AST No-Save Mode',
      description: 'Permettre remplissage AST en demo sans sauvegarde DB',
      status: 'pending',
      priority: 'high',
      category: 'feature',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 8,
      dependencies: ['api-ast-core']
    },
    {
      id: 'feature-test-tenant',
      title: 'Test Tenant c-secur360test',
      description: 'Créer tenant de test pour Eric avec toutes fonctionnalités',
      status: 'pending',
      priority: 'urgent',
      category: 'feature',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 6,
      dependencies: ['api-admin-tenants']
    },

    // INTÉGRATIONS ERP
    {
      id: 'integration-quickbooks',
      title: 'QuickBooks Online Integration',
      description: 'Intégration API QuickBooks avec sync temps réel',
      status: 'pending',
      priority: 'high',
      category: 'integration',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 25
    },
    {
      id: 'integration-xero',
      title: 'Xero API Integration',
      description: 'Conformité comptable canadienne avec Xero',
      status: 'pending',
      priority: 'high',
      category: 'integration',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 20
    },
    {
      id: 'integration-sage',
      title: 'Sage Accounting Integration',
      description: 'Intégration Sage pour comptables traditionnels',
      status: 'pending',
      priority: 'medium',
      category: 'integration',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 18
    },
    {
      id: 'integration-netsuite',
      title: 'NetSuite ERP Integration',
      description: 'Intégration enterprise NetSuite',
      status: 'pending',
      priority: 'medium',
      category: 'integration',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 30
    },
    {
      id: 'integration-make-zapier',
      title: 'Make.com/Zapier Workflows',
      description: 'Automatisation workflows avec Make.com',
      status: 'pending',
      priority: 'high',
      category: 'integration',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 16
    },

    // INTELLIGENCE ARTIFICIELLE
    {
      id: 'ai-invoice-processing',
      title: 'AI Invoice Processing',
      description: 'OCR et catégorisation automatique factures',
      status: 'pending',
      priority: 'high',
      category: 'enhancement',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 20
    },
    {
      id: 'ai-expense-tracking',
      title: 'AI Expense Tracking',
      description: 'Tracking automatique dépenses avec OCR reçus',
      status: 'pending',
      priority: 'medium',
      category: 'enhancement',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 18
    },
    {
      id: 'ai-financial-reporting',
      title: 'AI Financial Reporting',
      description: 'Rapports financiers avec requêtes langage naturel',
      status: 'pending',
      priority: 'high',
      category: 'enhancement',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 25
    },
    {
      id: 'ai-cash-flow-forecast',
      title: 'AI Cash Flow Forecasting',
      description: 'Prévisions trésorerie avec IA',
      status: 'pending',
      priority: 'medium',
      category: 'enhancement',
      implementationStatus: 'missing',
      createdAt: '2024-08-26',
      estimatedHours: 22
    }
  ]);

  // Métriques système simulées (à remplacer par vraies données)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    apiHealth: {
      total: 48,
      healthy: 44,
      degraded: 3,
      down: 1
    },
    tenantStats: {
      total: 12,
      active: 8,
      pending: 2,
      suspended: 2
    },
    financialMetrics: {
      mrr: 2450,
      arr: 29400,
      growth: 15.2,
      churn: 2.1
    },
    systemPerformance: {
      uptime: 99.9,
      responseTime: 235,
      errorRate: 0.02,
      activeUsers: 147
    }
  });

  // Calculs dérivés
  const apiHealthPercentage = useMemo(() => 
    Math.round((systemMetrics.apiHealth.healthy / systemMetrics.apiHealth.total) * 100), 
    [systemMetrics.apiHealth]
  );

  const tasksByStatus = useMemo(() => ({
    completed: todoTasks.filter(t => t.status === 'completed').length,
    in_progress: todoTasks.filter(t => t.status === 'in_progress').length,
    pending: todoTasks.filter(t => t.status === 'pending').length,
    blocked: todoTasks.filter(t => t.status === 'blocked').length
  }), [todoTasks]);

  const completionPercentage = useMemo(() => 
    Math.round((tasksByStatus.completed / todoTasks.length) * 100), 
    [tasksByStatus.completed, todoTasks.length]
  );

  // Gestionnaires d'événements
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleVoiceCommand = () => {
    if (!isListening) {
      setIsListening(true);
      // Simuler reconnaissance vocale
      setTimeout(() => {
        setCurrentMessage("Montre-moi les APIs en erreur");
        setIsListening(false);
        handleSendMessage("Montre-moi les APIs en erreur");
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (message?: string) => {
    const msg = message || currentMessage;
    if (!msg.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: msg,
      timestamp: new Date().toISOString()
    };

    setAiMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiProcessing(true);

    // Simuler réponse IA (à remplacer par vraie API OpenAI)
    setTimeout(() => {
      let response = "Je peux vous aider avec ça.";
      
      if (msg.toLowerCase().includes('api') && msg.toLowerCase().includes('erreur')) {
        response = "📊 **Analyse des APIs en erreur:**\n\n• `/api/system/status` - Réponse lente (>500ms)\n• `/api/sms/cleanup` - 2 échecs récents\n• `/api/voice/inbound` - Webhook timeout\n\n**Actions recommandées:**\n1. Redémarrer service SMS\n2. Vérifier configuration Twilio\n3. Augmenter timeout webhooks";
      } else if (msg.toLowerCase().includes('tenant')) {
        response = "🏢 **Statut Tenants:**\n\n• **Actifs:** 8 tenants\n• **En attente:** 2 nouveaux\n• **Suspendus:** 2 (paiements en retard)\n\n**MRR Total:** $2,450\n**Croissance:** +15.2% ce mois";
      } else if (msg.toLowerCase().includes('todo') || msg.toLowerCase().includes('tâche')) {
        response = `📋 **Résumé Todo List:**\n\n• **Complétées:** ${tasksByStatus.completed} tâches\n• **En cours:** ${tasksByStatus.in_progress} tâches\n• **En attente:** ${tasksByStatus.pending} tâches\n• **Progression:** ${completionPercentage}%\n\n**Priorités urgentes:**\n1. Module inspection équipements\n2. Tenant test c-secur360test\n3. Intégration QuickBooks`;
      }

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setAiMessages(prev => [...prev, aiMessage]);
      setIsAiProcessing(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">✅ Complété</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">🔄 En cours</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">⏳ En attente</span>;
      case 'blocked':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🚫 Bloqué</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImplementationBadge = (status?: string) => {
    switch (status) {
      case 'exists':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">✅ Implémenté</span>;
      case 'partial':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">🔄 Partiel</span>;
      case 'missing':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">❌ Manquant</span>;
      case 'broken':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">🚨 Cassé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-3">
                <Image 
                  src="/c-secur360-logo.png" 
                  alt="C-SECUR360" 
                  width={40} 
                  height={40}
                  className="rounded-lg bg-white/10 p-1"
                />
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Ultime Eric</h1>
                  <p className="text-sm text-white/70">Assistant IA • Monitoring • APIs • Todo List</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">Système Opérationnel</span>
                </div>
                <div className="text-white/70">APIs: {apiHealthPercentage}% • Uptime: {systemMetrics.systemPerformance.uptime}%</div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-green-400">
                {tasksByStatus.completed}/{todoTasks.length}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Tâches Complétées</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/20 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-white/70">{completionPercentage}%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {systemMetrics.apiHealth.healthy}/{systemMetrics.apiHealth.total}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">APIs Santé</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/20 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${apiHealthPercentage}%` }}
                />
              </div>
              <span className="text-sm text-white/70">{apiHealthPercentage}%</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                ${systemMetrics.financialMetrics.mrr.toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">MRR Total</h3>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">+{systemMetrics.financialMetrics.growth}%</span>
              <span className="text-sm text-white/70">ce mois</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">
                {systemMetrics.tenantStats.active}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Tenants Actifs</h3>
            <div className="text-sm text-white/70">
              {systemMetrics.tenantStats.pending} en attente • {systemMetrics.tenantStats.suspended} suspendus
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Assistant IA */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-fit sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold">Assistant IA Eric</h2>
              </div>
              
              {/* Chat Messages */}
              <div className="space-y-4 mb-4 h-64 overflow-y-auto">
                {aiMessages.length === 0 ? (
                  <div className="text-center text-white/50 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Salut Eric! 👋</p>
                    <p className="text-sm mt-2">Demande-moi n'importe quoi sur tes APIs, tenants, finances, ou todo list.</p>
                  </div>
                ) : (
                  aiMessages.map(message => (
                    <div key={message.id} className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-500/20 ml-4' 
                        : 'bg-purple-500/20 mr-4'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Bot className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                        )}
                        <div className="text-sm whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  ))
                )}
                {isAiProcessing && (
                  <div className="bg-purple-500/20 mr-4 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tape ta question ou commande vocale..."
                    className="flex-1 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isAiProcessing}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleVoiceCommand}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isListening ? 'Écoute...' : 'Vocal'}
                  </button>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSendMessage("Statut des APIs")}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-xs transition-colors"
                      title="Statut APIs"
                    >
                      <Server className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendMessage("Résumé financier")}
                      className="bg-emerald-600 hover:bg-emerald-700 p-2 rounded-lg text-xs transition-colors"
                      title="Finances"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendMessage("Todo prioritaire")}
                      className="bg-orange-600 hover:bg-orange-700 p-2 rounded-lg text-xs transition-colors"
                      title="Todo"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Todo List Principale */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">Todo List - APIs & Développement</h2>
                </div>
                <div className="text-sm text-white/70">
                  {todoTasks.filter(t => t.implementationStatus === 'exists').length} APIs implémentées
                </div>
              </div>

              {/* Filtres rapides */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <button className="px-3 py-1 bg-green-600 rounded-full text-xs whitespace-nowrap">
                  ✅ Complétées ({tasksByStatus.completed})
                </button>
                <button className="px-3 py-1 bg-blue-600 rounded-full text-xs whitespace-nowrap">
                  🔄 En cours ({tasksByStatus.in_progress})
                </button>
                <button className="px-3 py-1 bg-yellow-600 rounded-full text-xs whitespace-nowrap">
                  ⏳ En attente ({tasksByStatus.pending})
                </button>
                <button className="px-3 py-1 bg-red-600 rounded-full text-xs whitespace-nowrap">
                  🚫 Bloquées ({tasksByStatus.blocked})
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todoTasks.slice(0, 15).map(task => (
                  <div key={task.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(task.priority)}
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-white/70 mb-2">{task.description}</p>
                          {task.apiEndpoint && (
                            <div className="flex items-center gap-2 text-xs">
                              <code className="bg-black/30 px-2 py-1 rounded font-mono">{task.apiEndpoint}</code>
                              {getImplementationBadge(task.implementationStatus)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(task.status)}
                        <div className="text-xs text-white/50">
                          {task.estimatedHours}h estimé
                          {task.completedHours && ` • ${task.completedHours}h fait`}
                        </div>
                      </div>
                    </div>
                    
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="text-xs text-orange-400">
                        📎 Dépend de: {task.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <Link
                  href="/admin/ultimate-dashboard/todo"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Voir toutes les {todoTasks.length} tâches →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Health & Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* API Health */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Santé des APIs
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Opérationnelles</span>
                <span className="text-green-400 font-medium">{systemMetrics.apiHealth.healthy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Dégradées</span>
                <span className="text-yellow-400 font-medium">{systemMetrics.apiHealth.degraded}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Hors service</span>
                <span className="text-red-400 font-medium">{systemMetrics.apiHealth.down}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Actions Rapides
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/tenant-management"
                className="block w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm text-center transition-colors"
              >
                🏢 Gestion Tenants
              </Link>
              <Link
                href="/admin/financial-dashboard"
                className="block w-full bg-emerald-600 hover:bg-emerald-700 p-2 rounded text-sm text-center transition-colors"
              >
                💰 Dashboard Financier
              </Link>
              <Link
                href="/admin/tenant-management/create"
                className="block w-full bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm text-center transition-colors"
              >
                ➕ Nouveau Tenant
              </Link>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Performance Système
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Temps de réponse</span>
                <span className="text-blue-400">{systemMetrics.systemPerformance.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Utilisateurs actifs</span>
                <span className="text-green-400">{systemMetrics.systemPerformance.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Taux d'erreur</span>
                <span className="text-yellow-400">{systemMetrics.systemPerformance.errorRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import manquant pour User icon
import { User } from 'lucide-react';