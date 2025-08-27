'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Key,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Languages,
  Clock
} from 'lucide-react';

interface PageProps {
  params: {
    tenant: string;
  };
}

export default function SettingsPage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'security' | 'notifications' | 'preferences' | 'integrations'>('company');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // États pour les différentes sections
  const [companySettings, setCompanySettings] = useState({
    company_name: 'Mon Entreprise',
    industry: 'construction',
    address: '123 Rue Principale',
    city: 'Montréal',
    province: 'QC',
    postal_code: 'H1H 1H1',
    phone: '+1 (514) 123-4567',
    email: 'contact@monentreprise.com',
    website: 'https://monentreprise.com',
    logo: null,
    timezone: 'America/Toronto',
    language: 'fr'
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    password_policy: 'strong',
    session_timeout: 480, // minutes
    ip_whitelist: '',
    login_notifications: true,
    password_change_required: 90 // days
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: {
      ast_completed: true,
      incidents: true,
      maintenance_due: true,
      team_updates: false,
      system_alerts: true
    },
    sms_notifications: {
      critical_alerts: true,
      ast_approvals: false,
      incidents: true
    },
    push_notifications: {
      enabled: true,
      ast_reminders: true,
      safety_alerts: true
    }
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    sidebar_collapsed: false,
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    default_dashboard: 'overview',
    items_per_page: 25,
    auto_save: true,
    show_tutorials: true
  });

  const tabs = [
    {
      id: 'company',
      label: 'Entreprise',
      icon: <Building className="w-4 h-4" />,
      description: 'Informations de votre entreprise'
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: <Shield className="w-4 h-4" />,
      description: 'Paramètres de sécurité et accès'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      description: 'Préférences de notifications'
    },
    {
      id: 'preferences',
      label: 'Préférences',
      icon: <Palette className="w-4 h-4" />,
      description: 'Interface et affichage'
    },
    {
      id: 'integrations',
      label: 'Intégrations',
      icon: <Key className="w-4 h-4" />,
      description: 'API et intégrations tierces'
    }
  ];

  const handleSave = (section: string) => {
    setUnsavedChanges(false);
    alert(`💾 Paramètres ${section} sauvegardés\n\nFonctionnalité complète disponible bientôt`);
  };

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'Entreprise</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              value={companySettings.company_name}
              onChange={(e) => {
                setCompanySettings({...companySettings, company_name: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secteur d'activité
            </label>
            <select
              value={companySettings.industry}
              onChange={(e) => {
                setCompanySettings({...companySettings, industry: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="construction">Construction</option>
              <option value="manufacturing">Manufacturier</option>
              <option value="transport">Transport</option>
              <option value="energy">Énergie</option>
              <option value="mining">Minier</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={companySettings.address}
              onChange={(e) => {
                setCompanySettings({...companySettings, address: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville
            </label>
            <input
              type="text"
              value={companySettings.city}
              onChange={(e) => {
                setCompanySettings({...companySettings, city: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province
            </label>
            <select
              value={companySettings.province}
              onChange={(e) => {
                setCompanySettings({...companySettings, province: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="QC">Québec</option>
              <option value="ON">Ontario</option>
              <option value="BC">Colombie-Britannique</option>
              <option value="AB">Alberta</option>
              <option value="SK">Saskatchewan</option>
              <option value="MB">Manitoba</option>
              <option value="NS">Nouvelle-Écosse</option>
              <option value="NB">Nouveau-Brunswick</option>
              <option value="PE">Île-du-Prince-Édouard</option>
              <option value="NL">Terre-Neuve-et-Labrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={companySettings.phone}
              onChange={(e) => {
                setCompanySettings({...companySettings, phone: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email principal
            </label>
            <input
              type="email"
              value={companySettings.email}
              onChange={(e) => {
                setCompanySettings({...companySettings, email: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => handleSave('entreprise')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité du Compte</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
              </div>
            </div>
            <button 
              onClick={() => alert('🔐 Configuration 2FA\n\nFonctionnalité complète disponible bientôt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              {securitySettings.two_factor_enabled ? 'Configuré' : 'Configurer'}
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Politique de mot de passe
            </label>
            <select
              value={securitySettings.password_policy}
              onChange={(e) => {
                setSecuritySettings({...securitySettings, password_policy: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md"
            >
              <option value="basic">Basique (8 caractères)</option>
              <option value="strong">Fort (12+ caractères, symboles)</option>
              <option value="very_strong">Très fort (16+ caractères, complexe)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Délai d'expiration de session (minutes)
            </label>
            <input
              type="number"
              value={securitySettings.session_timeout}
              onChange={(e) => {
                setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-md"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="login_notifications"
              checked={securitySettings.login_notifications}
              onChange={(e) => {
                setSecuritySettings({...securitySettings, login_notifications: e.target.checked});
                setUnsavedChanges(true);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="login_notifications" className="text-sm text-gray-700">
              Recevoir des notifications de connexion
            </label>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => handleSave('sécurité')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications Email</h3>
        
        <div className="space-y-4">
          {Object.entries(notificationSettings.email_notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-600">
                  {key === 'ast_completed' && 'Recevoir un email quand une AST est complétée'}
                  {key === 'incidents' && 'Alertes pour tous les incidents de sécurité'}
                  {key === 'maintenance_due' && 'Rappels de maintenance d\'équipement'}
                  {key === 'team_updates' && 'Mises à jour de l\'équipe et changements'}
                  {key === 'system_alerts' && 'Alertes système importantes'}
                </p>
              </div>
              <button
                onClick={() => {
                  setNotificationSettings({
                    ...notificationSettings,
                    email_notifications: {
                      ...notificationSettings.email_notifications,
                      [key]: !value
                    }
                  });
                  setUnsavedChanges(true);
                }}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  } mt-1`}
                />
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => handleSave('notifications')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences d'Interface</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreferences({...preferences, theme: 'light'});
                  setUnsavedChanges(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                  preferences.theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Sun className="h-4 w-4" />
                Clair
              </button>
              <button
                onClick={() => {
                  setPreferences({...preferences, theme: 'dark'});
                  setUnsavedChanges(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                  preferences.theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Moon className="h-4 w-4" />
                Sombre
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format de date
            </label>
            <select
              value={preferences.date_format}
              onChange={(e) => {
                setPreferences({...preferences, date_format: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'heure
            </label>
            <select
              value={preferences.time_format}
              onChange={(e) => {
                setPreferences({...preferences, time_format: e.target.value});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">24 heures</option>
              <option value="12h">12 heures (AM/PM)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Éléments par page
            </label>
            <select
              value={preferences.items_per_page}
              onChange={(e) => {
                setPreferences({...preferences, items_per_page: parseInt(e.target.value)});
                setUnsavedChanges(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_save"
              checked={preferences.auto_save}
              onChange={(e) => {
                setPreferences({...preferences, auto_save: e.target.checked});
                setUnsavedChanges(true);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="auto_save" className="text-sm text-gray-700">
              Sauvegarde automatique des formulaires
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_tutorials"
              checked={preferences.show_tutorials}
              onChange={(e) => {
                setPreferences({...preferences, show_tutorials: e.target.checked});
                setUnsavedChanges(true);
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="show_tutorials" className="text-sm text-gray-700">
              Afficher les tutoriels et conseils
            </label>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={() => handleSave('préférences')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API et Intégrations</h3>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">API Key</h4>
                <p className="text-sm text-gray-600">Clé d'accès pour intégrations tierces</p>
              </div>
              <button 
                onClick={() => alert('🔑 Générer nouvelle clé API\n\nFonctionnalité complète disponible bientôt')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Générer
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm text-gray-600">
              sk_demo_********************************
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Webhooks</h4>
            <p className="text-sm text-gray-600 mb-3">
              Recevez des notifications en temps réel
            </p>
            <button 
              onClick={() => alert('🔗 Configurer Webhooks\n\nFonctionnalité complète disponible bientôt')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
            >
              Configurer
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Intégrations Disponibles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Microsoft Teams</span>
                </div>
                <button 
                  onClick={() => alert('Teams intégration\n\nFonctionnalité disponible bientôt')}
                  className="text-blue-600 text-sm"
                >
                  Connecter
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Slack</span>
                </div>
                <button 
                  onClick={() => alert('Slack intégration\n\nFonctionnalité disponible bientôt')}
                  className="text-blue-600 text-sm"
                >
                  Connecter
                </button>
              </div>
            </div>
          </div>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-600 mt-1">Configuration de votre espace de travail</p>
              </div>
            </div>
            
            {unsavedChanges && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Modifications non sauvegardées</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs opacity-75 hidden lg:block">{tab.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'company' && renderCompanyTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'preferences' && renderPreferencesTab()}
        {activeTab === 'integrations' && renderIntegrationsTab()}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            ⚙️ Configuration Avancée et Personnalisation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🏢 Profil Entreprise</h4>
              <ul className="space-y-1 text-xs">
                <li>• Configuration complète de profil</li>
                <li>• Multi-sites et départements</li>
                <li>• Conformité réglementaire par province</li>
                <li>• Branding personnalisé</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔒 Sécurité Enterprise</h4>
              <ul className="space-y-1 text-xs">
                <li>• SSO (SAML, OIDC)</li>
                <li>• MFA obligatoire</li>
                <li>• Audit logs complets</li>
                <li>• IP whitelisting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔌 Intégrations API</h4>
              <ul className="space-y-1 text-xs">
                <li>• API REST complète</li>
                <li>• Webhooks temps réel</li>
                <li>• SDK multi-langages</li>
                <li>• Intégrations natives (Slack, Teams)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}