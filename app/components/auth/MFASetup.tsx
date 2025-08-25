'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface MFASetupData {
  qrCodeDataUrl: string;
  backupCodes: string[];
  otpauthUrl: string;
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  // Initialiser le setup MFA
  useEffect(() => {
    initializeMFASetup();
  }, []);

  const initializeMFASetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation MFA');
      }

      const data = await response.json();
      setSetupData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFACode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Code invalide');
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;
    
    const content = `C-Secur360 - Codes de sauvegarde MFA\n\n${setupData.backupCodes.join('\n')}\n\nConservez ces codes en sécurité. Chaque code ne peut être utilisé qu'une seule fois.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'c-secur360-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const completeMFASetup = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (loading && !setupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation MFA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentification à deux facteurs
          </h2>
          <p className="text-gray-600 text-sm">
            Sécurisez votre compte avec l'authentification MFA
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Étape 1: Setup */}
        {step === 'setup' && setupData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">1. Scannez le QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Utilisez une app d'authentification (Google Authenticator, Authy, etc.)
              </p>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <Image
                  src={setupData.qrCodeDataUrl}
                  alt="QR Code MFA"
                  width={256}
                  height={256}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Configuration manuelle</h4>
              <p className="text-sm text-gray-600 mb-2">
                Si vous ne pouvez pas scanner le QR code:
              </p>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-xs break-all">{setupData.otpauthUrl}</code>
                <button
                  onClick={() => copyToClipboard(setupData.otpauthUrl)}
                  className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 2: Vérification */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">2. Vérifiez votre configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Saisissez le code à 6 chiffres affiché dans votre app
              </p>
            </div>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('setup')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={verifyMFACode}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Vérifier
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Codes de sauvegarde */}
        {step === 'backup' && setupData && (
          <div className="space-y-6">
            <div className="text-center">
              <Download className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">3. Sauvegardez vos codes de récupération</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ces codes vous permettront d'accéder à votre compte si vous perdez votre téléphone
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadBackupCodes}
                className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto mb-4"
              >
                <Download className="w-4 h-4" />
                Télécharger les codes
              </button>
              
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={backupCodesSaved}
                  onChange={(e) => setBackupCodesSaved(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                J'ai sauvegardé mes codes de récupération
              </label>
            </div>

            <button
              onClick={completeMFASetup}
              disabled={!backupCodesSaved}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Terminer la configuration
            </button>
          </div>
        )}

        {/* Étape 4: Terminé */}
        {step === 'complete' && (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                MFA configuré avec succès !
              </h3>
              <p className="text-gray-600">
                Votre compte est maintenant protégé par l'authentification à deux facteurs.
              </p>
            </div>
          </div>
        )}

        {/* Footer - uniquement si pas en step complete */}
        {step !== 'complete' && (
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onCancel}
              className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Annuler et configurer plus tard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}