'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Shield,
  Lock,
  Unlock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Crown,
  Database,
  Settings,
  Users,
  Activity
} from 'lucide-react';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Vérifier si déjà connecté
  useEffect(() => {
    const adminToken = localStorage.getItem('c360_admin_token');
    const adminEmail = localStorage.getItem('c360_admin_email');
    
    if (adminToken && adminEmail === 'eric.dufort@cerdia.ai') {
      // Vérifier la validité du token (simple check pour la démo)
      const tokenData = JSON.parse(atob(adminToken));
      if (tokenData.expires > Date.now()) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('c360_admin_token');
        localStorage.removeItem('c360_admin_email');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAttempts >= 3) {
      setError('Trop de tentatives. Veuillez attendre 15 minutes.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simuler une authentification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Vérification hardcodée pour l'admin
    if (email === 'eric.dufort@cerdia.ai' && password === 'CGEstion321$') {
      // Créer un token d'authentification simple
      const token = btoa(JSON.stringify({
        email: email,
        role: 'super_admin',
        issued: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
      }));

      localStorage.setItem('c360_admin_token', token);
      localStorage.setItem('c360_admin_email', email);
      
      setIsAuthenticated(true);
      setError('');
    } else {
      setLoginAttempts(prev => prev + 1);
      setError('Identifiants administrateur invalides');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('c360_admin_token');
    localStorage.removeItem('c360_admin_email');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setLoginAttempts(0);
  };

  const adminModules = [
    {
      id: 'ultimate-dashboard',
      title: '🚀 Ultimate Dashboard',
      description: 'Dashboard principal avec IA et automation',
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      features: ['OpenAI Assistant', 'API Management', 'Todo Global', 'KPIs Temps Réel'],
      url: '/admin/ultimate-dashboard'
    },
    {
      id: 'tenant-management',
      title: 'Gestion des Tenants',
      description: 'Administration complète des clients',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-emerald-600',
      features: ['Profils Complets', 'Billing Stripe', 'Email Config', 'Métriques'],
      url: '/admin/tenant-management'
    },
    {
      id: 'financial-dashboard',
      title: 'Dashboard Financier',
      description: 'Suivi revenus et facturation',
      icon: <Activity className="w-8 h-8" />,
      color: 'bg-blue-600',
      features: ['MRR/ARR', 'Stripe Integration', 'Export CSV', 'Filtres Avancés'],
      url: '/admin/financial-dashboard'
    },
    {
      id: 'database',
      title: 'Administration Base de Données',
      description: 'Gestion complète Supabase et migrations',
      icon: <Database className="w-8 h-8" />,
      color: 'bg-indigo-600',
      features: ['Migrations SQL', 'Backup/Restore', 'Performance', 'Monitoring'],
      url: '/admin/database'
    },
    {
      id: 'system',
      title: 'Configuration Système',
      description: 'Paramètres globaux et sécurité',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-purple-600',
      features: ['Variables Env', 'Sécurité', 'API Keys', 'Intégrations'],
      url: '/admin/system'
    },
    {
      id: 'monitoring',
      title: 'Surveillance & Analytics',
      description: 'Monitoring temps réel et métriques',
      icon: <Activity className="w-8 h-8" />,
      color: 'bg-red-600',
      features: ['Logs Système', 'Performances', 'Usage Metrics', 'Alertes'],
      url: '/admin/monitoring'
    },
    {
      id: 'setup-test-tenant',
      title: '🧪 Créer Tenant de Test',
      description: 'Configuration automatique tenant c-secur360test',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-orange-600',
      features: ['Auto-setup', 'Données de test', 'Modules complets', 'Accès instantané'],
      url: '/admin/setup-test-tenant'
    },
    {
      id: 'todo',
      title: '📝 Gestionnaire de Tâches',
      description: 'Système To-Do Microsoft style avec catégories',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-teal-600',
      features: ['Microsoft To-Do Style', 'Catégories & Priorités', 'Sous-tâches', 'Statistiques'],
      url: '/admin/todo'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={48} 
                height={48}
                className="rounded-lg bg-white/10 p-1"
              />
              <Crown className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
            <p className="text-blue-100 text-sm">C-Secur360 Administration</p>
          </div>

          {/* Login Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Administrateur
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eric.dufort@cerdia.ai"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe Admin
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Authentification...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Accès Administrateur
                  </>
                )}
              </button>
            </form>

            {loginAttempts > 0 && (
              <div className="mt-4 text-center text-sm text-red-600">
                Tentatives: {loginAttempts}/3
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Accès réservé aux administrateurs système</p>
              <p className="mt-1">Contact: support@cerdia.ai</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Admin
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={48} 
                height={48}
                className="rounded-lg shadow-sm"
              />
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration C-Secur360</h1>
                <p className="text-sm text-gray-600">Portail administrateur système</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{email}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Super Admin
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Modules d'Administration
          </h2>
          <p className="text-gray-600">
            Gestion complète de la plateforme C-Secur360 avec accès administrateur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${module.color} text-white p-3 rounded-lg`}>
                    {module.icon}
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin Only
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {module.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {module.description}
                </p>

                <div className="space-y-2 mb-6">
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      if (['ultimate-dashboard', 'tenant-management', 'financial-dashboard', 'setup-test-tenant', 'todo'].includes(module.id)) {
                        window.location.href = module.url;
                      } else {
                        alert(`🚀 Module "${module.title}"\n\nEn développement...\nAccès complet bientôt disponible.`);
                      }
                    }}
                    className={`${module.color} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all`}
                  >
                    <Shield className="w-4 h-4" />
                    Accès Admin
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statut Système Global
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Base de Données</p>
                  <p className="text-lg font-bold text-blue-900">Supabase</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Utilisateurs</p>
                  <p className="text-lg font-bold text-green-900">1,247</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Sécurité</p>
                  <p className="text-lg font-bold text-purple-900">Active</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Monitoring</p>
                  <p className="text-lg font-bold text-red-900">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}