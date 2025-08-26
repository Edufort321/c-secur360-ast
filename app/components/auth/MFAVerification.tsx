'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw,
  Clock
} from 'lucide-react';

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  context?: 'login' | 'sensitive_action';
  title?: string;
  description?: string;
}

export default function MFAVerification({ 
  onSuccess, 
  onCancel, 
  context = 'login',
  title,
  description 
}: MFAVerificationProps) {
  const [method, setMethod] = useState<'totp' | 'sms' | 'backup'>('totp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [backupCodeUsed, setBackupCodeUsed] = useState(false);

  // Countdown pour SMS
  useEffect(() => {
    if (smsCountdown > 0) {
      const timer = setTimeout(() => setSmsCountdown(smsCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsCountdown]);

  const verifyCode = async () => {
    if (!code || code.length < 6) {
      setError('Veuillez saisir un code valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          method,
          context 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Code invalide');
      }

      const result = await response.json();
      
      if (result.backupCodeUsed) {
        setBackupCodeUsed(true);
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de vérification');
      setCode(''); // Reset code on error
    } finally {
      setLoading(false);
    }
  };

  const sendSMSCode = async () => {
    setSmsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur envoi SMS');
      }

      setSmsCountdown(60); // 60 secondes
      setMethod('sms');
    } catch (err) {
      setError('Impossible d\'envoyer le SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCode();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {title || 'Vérification MFA'}
          </h2>
          <p className="text-gray-600 text-sm">
            {description || 'Saisissez votre code d\'authentification pour continuer'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {backupCodeUsed && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Code de sauvegarde utilisé.</strong> Il ne peut plus être réutilisé.
              Pensez à générer de nouveaux codes de sauvegarde.
            </p>
          </div>
        )}

        {/* Méthodes de vérification */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg mb-4">
            <button
              onClick={() => setMethod('totp')}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                method === 'totp' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              App
            </button>
            <button
              onClick={() => setMethod('sms')}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                method === 'sms' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              SMS
            </button>
            <button
              onClick={() => setMethod('backup')}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                method === 'backup' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Backup
            </button>
          </div>

          {/* Instructions selon la méthode */}
          <div className="text-sm text-gray-600 mb-4">
            {method === 'totp' && (
              <p>Saisissez le code à 6 chiffres de votre app d'authentification</p>
            )}
            {method === 'sms' && (
              <p>Saisissez le code reçu par SMS</p>
            )}
            {method === 'backup' && (
              <p>Utilisez un de vos codes de sauvegarde à 8 caractères</p>
            )}
          </div>
        </div>

        {/* Envoi SMS */}
        {method === 'sms' && smsCountdown === 0 && (
          <div className="mb-4">
            <button
              onClick={sendSMSCode}
              disabled={smsLoading}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {smsLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Envoyer code SMS
                </>
              )}
            </button>
          </div>
        )}

        {/* Countdown SMS */}
        {method === 'sms' && smsCountdown > 0 && (
          <div className="mb-4 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Nouveau SMS dans {smsCountdown}s
          </div>
        )}

        {/* Saisie du code */}
        <div className="mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = method === 'backup' 
                ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
                : e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            onKeyPress={handleKeyPress}
            placeholder={method === 'backup' ? 'ABCD1234' : '000000'}
            className="w-full text-center text-xl font-mono py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={method === 'backup' ? 8 : 6}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={verifyCode}
            disabled={loading || !code || (method !== 'backup' && code.length !== 6) || (method === 'backup' && code.length !== 8)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Vérifier
          </button>

          {context === 'sensitive_action' && (
            <button
              onClick={onCancel}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Aide */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-500 mb-2">
            Problème avec votre authentification ?
          </p>
          <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            Contacter l'assistance
          </button>
        </div>
      </div>
    </div>
  );
}