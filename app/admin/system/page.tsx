'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Globe,
  Zap,
  Mail,
  Smartphone,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  ExternalLink,
  Activity,
  Lock,
  Unlock
} from 'lucide-react';

interface SystemConfig {
  api_keys: {
    openai: string;
    stripe_publishable: string;
    stripe_secret: string;
    supabase_url: string;
    supabase_anon: string;
    supabase_service: string;
    make_webhook: string;
    resend_api: string;
    twilio_sid: string;
    twilio_token: string;
  };
  integrations: {
    make_com: {
      enabled: boolean;
      webhook_url: string;
      last_sync: string;
      status: 'active' | 'error' | 'disabled';
    };
    stripe: {
      enabled: boolean;
      webhook_configured: boolean;
      test_mode: boolean;
      last_payment: string;
    };
    email: {
      provider: 'resend' | 'sendgrid' | 'mailgun';
      from_email: string;
      daily_limit: number;
      sent_today: number;
    };
    sms: {
      enabled: boolean;
      provider: 'twilio';
      from_number: string;
    };
  };
  security: {
    admin_session_timeout: number;
    max_login_attempts: number;
    require_2fa: boolean;
    allowed_domains: string[];
    rate_limiting: {
      enabled: boolean;
      requests_per_minute: number;
    };
  };
  monitoring: {
    error_tracking: boolean;
    performance_monitoring: boolean;
    uptime_checks: boolean;
    alerts_email: string;
  };
}

export default function SystemPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'api_keys' | 'integrations' | 'security' | 'monitoring'>('api_keys');
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock configuration data
  useEffect(() => {
    const mockConfig: SystemConfig = {
      api_keys: {
        openai: 'sk-proj-abc...xyz123',
        stripe_publishable: 'pk_test_51abc...xyz',
        stripe_secret: 'sk_test_51abc...xyz',
        supabase_url: 'https://abc123.supabase.co',
        supabase_anon: 'eyJhbGciOiJIUzI1NiIs...xyz',
        supabase_service: 'eyJhbGciOiJIUzI1NiIs...abc',
        make_webhook: 'https://hook.us1.make.com/abc123',
        resend_api: 're_abc123...',
        twilio_sid: 'ACabc123...',
        twilio_token: 'abc123...'
      },
      integrations: {
        make_com: {
          enabled: true,
          webhook_url: 'https://hook.us1.make.com/abc123',
          last_sync: '2024-08-26T14:30:00Z',
          status: 'active'
        },
        stripe: {
          enabled: true,
          webhook_configured: true,
          test_mode: true,
          last_payment: '2024-08-26T09:15:00Z'
        },
        email: {
          provider: 'resend',
          from_email: 'notifications@c-secur360.com',
          daily_limit: 1000,
          sent_today: 47
        },
        sms: {
          enabled: true,
          provider: 'twilio',
          from_number: '+1-555-0123'
        }
      },
      security: {
        admin_session_timeout: 24,
        max_login_attempts: 3,
        require_2fa: false,
        allowed_domains: ['c-secur360.com', 'cerdia.ai'],
        rate_limiting: {
          enabled: true,
          requests_per_minute: 100
        }
      },
      monitoring: {
        error_tracking: true,
        performance_monitoring: true,
        uptime_checks: true,
        alerts_email: 'eric.dufort@cerdia.ai'
      }
    };

    setTimeout(() => {
      setConfig(mockConfig);
      setIsLoading(false);
    }, 1000);
  }, []);

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const maskSecret = (secret: string, show: boolean) => {
    if (show) return secret;
    if (secret.length <= 8) return '•'.repeat(secret.length);
    return secret.slice(0, 4) + '•'.repeat(secret.length - 8) + secret.slice(-4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally show a toast notification
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setHasUnsavedChanges(false);
    setIsSaving(false);
    
    // Show success notification
    console.log('Configuration sauvegardée');
  };

  const testIntegration = async (integration: string) => {
    console.log(`Test de l'intégration ${integration}...`);
    // Simulate test API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement configuration système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration Système</h1>
          <p className="text-gray-600 mt-1">Gestion des API keys, intégrations et paramètres de sécurité</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Modifications non sauvegardées
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'api_keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
              { id: 'integrations', label: 'Intégrations', icon: <Zap className="w-4 h-4" /> },
              { id: 'security', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
              { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.id
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
          {/* API Keys Section */}
          {activeSection === 'api_keys' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Sécurité des API Keys</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Ces clés donnent accès à vos services. Ne les partagez jamais et stockez-les de manière sécurisée.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {Object.entries(config.api_keys).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                        {key === 'openai' && <Key className="w-4 h-4 text-green-600" />}
                        {key.includes('stripe') && <Key className="w-4 h-4 text-purple-600" />}
                        {key.includes('supabase') && <Database className="w-4 h-4 text-blue-600" />}
                        {key === 'make_webhook' && <Zap className="w-4 h-4 text-orange-600" />}
                        {key === 'resend_api' && <Mail className="w-4 h-4 text-red-600" />}
                        {key.includes('twilio') && <Smartphone className="w-4 h-4 text-teal-600" />}
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSecret(key)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {showSecrets[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={maskSecret(value, showSecrets[key] || false)}
                        readOnly
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              {/* Make.com */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Make.com Automation</h3>
                      <p className="text-sm text-gray-600">Workflows marketing et notifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      config.integrations.make_com.status === 'active' ? 'bg-green-100 text-green-800' :
                      config.integrations.make_com.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {config.integrations.make_com.status}
                    </span>
                    <button
                      onClick={() => testIntegration('make')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      Tester
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Webhook URL</p>
                    <p className="font-mono text-gray-900">{config.integrations.make_com.webhook_url}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dernière synchronisation</p>
                    <p className="text-gray-900">{new Date(config.integrations.make_com.last_sync).toLocaleString('fr-CA')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Statut</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      {config.integrations.make_com.enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {config.integrations.make_com.enabled ? 'Activé' : 'Désactivé'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stripe */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Key className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Stripe Payments</h3>
                      <p className="text-sm text-gray-600">Gestion des abonnements et paiements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {config.integrations.stripe.test_mode && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Mode Test
                      </span>
                    )}
                    <button
                      onClick={() => testIntegration('stripe')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      Tester
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Webhooks configurés</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      {config.integrations.stripe.webhook_configured ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {config.integrations.stripe.webhook_configured ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dernier paiement</p>
                    <p className="text-gray-900">{new Date(config.integrations.stripe.last_payment).toLocaleString('fr-CA')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Environnement</p>
                    <p className="text-gray-900">{config.integrations.stripe.test_mode ? 'Test' : 'Production'}</p>
                  </div>
                </div>
              </div>

              {/* Email & SMS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Email Service</h3>
                      <p className="text-sm text-gray-600">Provider: {config.integrations.email.provider}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From Email</span>
                      <span className="text-gray-900">{config.integrations.email.from_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Limite quotidienne</span>
                      <span className="text-gray-900">{config.integrations.email.daily_limit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envoyés aujourd'hui</span>
                      <span className="text-gray-900">{config.integrations.email.sent_today}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(config.integrations.email.sent_today / config.integrations.email.daily_limit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Smartphone className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">SMS Service</h3>
                      <p className="text-sm text-gray-600">Provider: Twilio</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut</span>
                      <span className="text-gray-900 flex items-center gap-2">
                        {config.integrations.sms.enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {config.integrations.sms.enabled ? 'Activé' : 'Désactivé'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro expéditeur</span>
                      <span className="text-gray-900">{config.integrations.sms.from_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Paramètres de Sécurité</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Ces paramètres affectent la sécurité de toute la plateforme. Modifiez avec précaution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Authentification
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée session admin (heures)
                      </label>
                      <input
                        type="number"
                        value={config.security.admin_session_timeout}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tentatives de connexion max
                      </label>
                      <input
                        type="number"
                        value={config.security.max_login_attempts}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.security.require_2fa}
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm text-gray-700">Activer l'authentification 2FA</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Contrôle d'accès
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domaines autorisés
                      </label>
                      <div className="space-y-2">
                        {config.security.allowed_domains.map((domain, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={domain}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg">
                          <Plus className="w-4 h-4" />
                          Ajouter domaine
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.security.rate_limiting.enabled}
                        className="rounded border-gray-300"
                      />
                      <label className="text-sm text-gray-700">
                        Limitation de débit ({config.security.rate_limiting.requests_per_minute}/min)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Section */}
          {activeSection === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Surveillance Système
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Suivi des erreurs</label>
                      <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        config.monitoring.error_tracking ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          config.monitoring.error_tracking ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Monitoring des performances</label>
                      <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        config.monitoring.performance_monitoring ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          config.monitoring.performance_monitoring ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Vérifications uptime</label>
                      <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        config.monitoring.uptime_checks ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          config.monitoring.uptime_checks ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Alertes & Notifications
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email des alertes
                      </label>
                      <input
                        type="email"
                        value={config.monitoring.alerts_email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-green-600">Uptime</p>
                        <p className="text-lg font-bold text-green-800">99.9%</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-blue-600">Temps réponse</p>
                        <p className="text-lg font-bold text-blue-800">245ms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tableau de Bord Système</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">CPU Usage</p>
                    <p className="text-2xl font-bold text-gray-900">23%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Memory</p>
                    <p className="text-2xl font-bold text-gray-900">1.2GB</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Requests/min</p>
                    <p className="text-2xl font-bold text-gray-900">342</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Erreurs 24h</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}