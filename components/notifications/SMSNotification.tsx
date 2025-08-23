"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, AlertCircle, CheckCircle, X, Plus, Trash2 } from 'lucide-react';
import { useTwilio } from '../../contexts/TwilioContext';

interface SMSNotificationProps {
  astId?: string;
  defaultType?: 'lock_applied' | 'lock_removed' | 'general_alert' | 'emergency' | 'work_completion' | 'test';
  defaultMessage?: string;
  defaultRecipients?: string[];
  onClose?: () => void;
  compact?: boolean;
  autoExpand?: boolean;
}

export default function SMSNotification({ 
  astId,
  defaultType = 'general_alert',
  defaultMessage = '',
  defaultRecipients = [],
  onClose,
  compact = false,
  autoExpand = false
}: SMSNotificationProps) {
  const { config, sendSMS, loading } = useTwilio();
  const [isOpen, setIsOpen] = useState(autoExpand);
  const [message, setMessage] = useState(defaultMessage);
  const [recipients, setRecipients] = useState<string[]>(defaultRecipients);
  const [newRecipient, setNewRecipient] = useState('');
  const [type, setType] = useState(defaultType);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  useEffect(() => {
    if (defaultMessage && defaultMessage !== message) {
      setMessage(defaultMessage);
    }
  }, [defaultMessage]);

  useEffect(() => {
    if (defaultRecipients.length > 0 && JSON.stringify(defaultRecipients) !== JSON.stringify(recipients)) {
      setRecipients(defaultRecipients);
    }
  }, [defaultRecipients]);

  const handleAddRecipient = () => {
    const phone = newRecipient.trim();
    if (phone && !recipients.includes(phone)) {
      // Basic Canadian phone validation
      const phoneRegex = /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
      const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
      
      if (phoneRegex.test(cleanPhone)) {
        const formatted = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
        setRecipients([...recipients, formatted]);
        setNewRecipient('');
      } else {
        alert('Format de numéro invalide. Utilisez le format canadien (ex: +15141234567)');
      }
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() || recipients.length === 0) {
      alert('Message et destinataires requis');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const result = await sendSMS({
        astId,
        type,
        message: message.trim(),
        recipients
      });
      
      setResult(result);
      
      if (result.success) {
        // Clear form on success
        setMessage('');
        setRecipients([]);
        // Auto-close after success if compact mode
        if (compact && onClose) {
          setTimeout(() => onClose(), 2000);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de l\'envoi',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setSending(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lock_applied': return 'Verrouillage appliqué';
      case 'lock_removed': return 'Verrouillage retiré';
      case 'general_alert': return 'Alerte générale';
      case 'emergency': return 'Urgence';
      case 'work_completion': return 'Travail terminé';
      case 'test': return 'Test';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <MessageSquare className="w-4 h-4 animate-pulse" />
        <span className="text-sm">Chargement SMS...</span>
      </div>
    );
  }

  if (!config.enabled) {
    return (
      <div className="flex items-center gap-2 text-gray-400 bg-gray-50 p-3 rounded-lg border">
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">Service SMS non configuré</span>
        {config.mode === 'simulation' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Mode simulation
          </span>
        )}
      </div>
    );
  }

  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Envoyer SMS</span>
        {config.mode === 'simulation' && (
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">SIM</span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Notification SMS</h3>
          {config.mode === 'simulation' && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Mode simulation
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type d'alerte
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general_alert">Alerte générale</option>
          <option value="emergency">Urgence</option>
          <option value="lock_applied">Verrouillage appliqué</option>
          <option value="lock_removed">Verrouillage retiré</option>
          <option value="work_completion">Travail terminé</option>
          <option value="test">Test</option>
        </select>
      </div>

      {/* Message */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message (max 160 caractères)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.substring(0, 160))}
          placeholder="Tapez votre message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {message.length}/160
        </div>
      </div>

      {/* Recipients */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinataires
        </label>
        
        {/* Add recipient */}
        <div className="flex gap-2 mb-3">
          <input
            type="tel"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder="+15141234567"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
          />
          <button
            onClick={handleAddRecipient}
            disabled={!newRecipient.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Recipients list */}
        {recipients.length > 0 && (
          <div className="space-y-2">
            {recipients.map((phone, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm text-gray-700">{phone}</span>
                <button
                  onClick={() => handleRemoveRecipient(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {recipients.length} destinataire{recipients.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className={`mb-4 p-3 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </span>
          </div>
          {result.details && (
            <details className="mt-2">
              <summary className="text-xs text-gray-600 cursor-pointer">Détails</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={sending || !message.trim() || recipients.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {sending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Envoyer SMS {config.mode === 'simulation' ? '(simulation)' : ''}
          </>
        )}
      </button>
    </div>
  );
}