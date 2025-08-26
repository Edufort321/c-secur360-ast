"use client";

import { useEffect, useState } from "react";
import { 
  Shield, 
  Save, 
  TestTube, 
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  messagingServiceSid?: string;
  mode: 'production' | 'simulation' | 'disabled';
  valid: boolean;
  missing: string[];
}

export default function TwilioConfigPage() {
  const [config, setConfig] = useState<TwilioConfig>({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
    messagingServiceSid: '',
    mode: 'disabled',
    valid: false,
    missing: []
  });
  
  const [showSecrets, setShowSecrets] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Charger la configuration actuelle
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/twilio-config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Erreur chargement config Twilio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/twilio-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const result = await response.json();
        setConfig(result);
        alert('✅ Configuration Twilio sauvegardée');
      } else {
        alert('❌ Erreur sauvegarde');
      }
    } catch (error) {
      alert('❌ Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (type: 'sms' | 'voice') => {
    setTesting(true);
    setTestResult(null);

    try {
      const endpoint = type === 'sms' ? '/api/send-sms' : '/api/voice/test';
      const body = type === 'sms' 
        ? {
            to: process.env.NEXT_PUBLIC_OWNER_MOBILE || "+15146034519",
            body: "Test SMS C-Secur360 - " + new Date().toLocaleString()
          }
        : {
            to: process.env.NEXT_PUBLIC_OWNER_MOBILE || "+15146034519"
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      setTestResult({ type, success: result.success, ...result });
      
    } catch (error) {
      setTestResult({ 
        type, 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Chargement de la configuration Twilio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Phone className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuration Twilio
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les paramètres SMS et Voice pour C-Secur360
              </p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border-2 ${
            config.valid 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {config.valid ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <div>
                <p className="text-sm font-medium opacity-75">Configuration</p>
                <p className="text-xl font-bold">
                  {config.valid ? 'Valide' : 'Invalide'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Mode</p>
                <p className="text-xl font-bold capitalize">{config.mode}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Variables</p>
                <p className="text-xl font-bold">
                  {4 - config.missing.length}/4
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres Twilio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account SID
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.accountSid}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.authToken}
                onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="********************************"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="text"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Messaging Service SID (Optionnel)
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.messagingServiceSid || ''}
                onChange={(e) => setConfig({ ...config, messagingServiceSid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSecrets ? 'Masquer' : 'Afficher'} les secrets
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Test Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Tests de fonctionnement
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleTest('sms')}
              disabled={testing || !config.valid}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <MessageSquare className="w-5 h-5" />
              {testing ? 'Test en cours...' : 'Tester SMS'}
            </button>

            <button
              onClick={() => handleTest('voice')}
              disabled={testing || !config.valid}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Phone className="w-5 h-5" />
              {testing ? 'Test en cours...' : 'Tester Voice'}
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">
                  Test {testResult.type.toUpperCase()}: {testResult.success ? 'Réussi' : 'Échoué'}
                </span>
              </div>
              <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📚 Instructions de configuration
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>• <strong>Account SID</strong> : Identifiant unique de votre compte Twilio</p>
            <p>• <strong>Auth Token</strong> : Jeton d'authentification (gardez-le secret)</p>
            <p>• <strong>Numéro</strong> : Numéro Twilio pour l'envoi de SMS (+1XXXXXXXXXX)</p>
            <p>• <strong>Messaging Service</strong> : Optionnel, améliore la délivrabilité</p>
            <p>• Les webhooks seront automatiquement configurés sur : <code>/api/sms/inbound</code> et <code>/api/voice/inbound</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}