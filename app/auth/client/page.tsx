"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, Lock, Eye, EyeOff, Smartphone, Key, 
  AlertTriangle, CheckCircle, Loader, Copy, Download
} from 'lucide-react';

interface LoginState {
  step: 'login' | 'totp' | 'setup';
  email: string;
  password: string;
  totpCode: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string;
  showPassword: boolean;
  setupData?: {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  };
}

export default function ClientLogin() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({
    step: 'login',
    email: '',
    password: '',
    totpCode: '',
    rememberMe: false,
    isLoading: false,
    error: '',
    showPassword: false
  });

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/login', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user.role === 'client_admin' && data.user.tenant_id) {
            router.push(`/client/${data.user.tenant_id}`);
          }
        }
      } catch (error) {
        // Not authenticated, continue with login
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          totp_code: state.totpCode,
          remember_me: state.rememberMe
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.requires_setup) {
          // First login - setup TOTP
          setState(prev => ({ ...prev, step: 'setup', isLoading: false }));
          await generateTOTPSetup();
        } else if (data.requires_totp) {
          // Need TOTP code
          setState(prev => ({ ...prev, step: 'totp', isLoading: false }));
        } else {
          // Login successful
          router.push(data.redirect_url || '/');
        }
      } else {
        if (data.requires_totp) {
          setState(prev => ({ ...prev, step: 'totp', isLoading: false, error: data.error || '' }));
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: data.error || 'Erreur de connexion',
            totpCode: '' // Reset TOTP on error
          }));
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erreur de connexion au serveur'
      }));
    }
  };

  const generateTOTPSetup = async () => {
    try {
      const response = await fetch('/api/auth/totp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          action: 'generate'
        })
      });

      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          setupData: {
            secret: data.secret,
            qrCodeUrl: data.qr_code_url,
            backupCodes: data.backup_codes
          }
        }));
      } else {
        setState(prev => ({ ...prev, error: data.error }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Erreur génération TOTP' }));
    }
  };

  const verifyTOTPSetup = async () => {
    if (!state.totpCode || !state.setupData?.secret) return;

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch('/api/auth/totp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          action: 'verify',
          totp_code: state.totpCode,
          secret: state.setupData.secret
        })
      });

      const data = await response.json();
      if (data.success) {
        // TOTP setup complete, login again to get redirect
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: state.email,
            password: state.password,
            totp_code: state.totpCode,
            remember_me: state.rememberMe
          })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.success) {
          router.push(loginData.redirect_url || '/');
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: data.error, totpCode: '' }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Erreur vérification TOTP' }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    if (!state.setupData?.backupCodes) return;
    
    const content = `C-Secur360 - Codes de récupération TOTP
Email: ${state.email}
Date: ${new Date().toLocaleDateString('fr-CA')}

IMPORTANT: Gardez ces codes en lieu sûr!
Chaque code ne peut être utilisé qu'une seule fois.

${state.setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `c-secur360-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-4">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Accès Client
          </h1>
          <p className="text-slate-300">
            Espace client sécurisé C-Secur360
          </p>
        </div>

        {/* Login Form */}
        {state.step === 'login' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email de l'entreprise
                </label>
                <input
                  type="email"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="admin@votreentreprise.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={state.showPassword ? 'text' : 'password'}
                    value={state.password}
                    onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mot de passe sécurisé"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {state.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={state.rememberMe}
                  onChange={(e) => setState(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Se souvenir de moi (30 jours)
                </label>
              </div>

              {state.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{state.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={state.isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Accéder à mon espace
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous êtes un super administrateur?{' '}
                <a href="/auth/admin" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Accès admin
                </a>
              </p>
            </div>
          </div>
        )}

        {/* TOTP Code Input */}
        {state.step === 'totp' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentification à deux facteurs
              </h2>
              <p className="text-gray-600">
                Entrez le code à 6 chiffres de votre application authenticator
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code TOTP
                </label>
                <input
                  type="text"
                  value={state.totpCode}
                  onChange={(e) => setState(prev => ({ ...prev, totpCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              {state.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{state.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={state.isLoading || state.totpCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Vérifier
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, step: 'login', error: '', totpCode: '' }))}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                ← Retour à la connexion
              </button>
            </form>
          </div>
        )}

        {/* TOTP Setup */}
        {state.step === 'setup' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configuration TOTP
              </h2>
              <p className="text-gray-600">
                Première connexion : configurez l'authentification à deux facteurs
              </p>
            </div>

            {state.setupData && (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Scannez ce QR code avec Google Authenticator :
                  </p>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                    <img 
                      src={state.setupData.qrCodeUrl} 
                      alt="QR Code TOTP"
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Manual Secret */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Ou saisissez cette clé secrète manuellement :
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border rounded font-mono text-sm">
                      {state.setupData.secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(state.setupData!.secret)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Backup Codes */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-yellow-800">Codes de récupération</h3>
                    <button
                      onClick={downloadBackupCodes}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      <Download className="w-3 h-3" />
                      Télécharger
                    </button>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Sauvegardez ces codes en lieu sûr. Utilisez-les si vous perdez votre téléphone.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {state.setupData.backupCodes.map((code, index) => (
                      <code key={index} className="px-2 py-1 bg-white rounded text-xs">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Verification */}
                <form onSubmit={(e) => { e.preventDefault(); verifyTOTPSetup(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmez avec un code TOTP
                    </label>
                    <input
                      type="text"
                      value={state.totpCode}
                      onChange={(e) => setState(prev => ({ ...prev, totpCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>

                  {state.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-700">{state.error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={state.isLoading || state.totpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Configuration...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Accéder à mon espace
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Security Info */}
        <div className="mt-8 text-center text-sm text-slate-300">
          <p>🔐 Connexion sécurisée avec chiffrement SSL</p>
          <p>📱 Double authentification obligatoire</p>
        </div>
      </div>
    </div>
  );
}