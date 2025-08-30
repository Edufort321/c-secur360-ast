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
  language?: 'fr' | 'en';
}

const translations = {
  fr: {
    title: "Notification SMS",
    typeLabel: "Type d'alerte",
    messageLabel: "Message (max 160 caractères)",
    messagePlaceholder: "Tapez votre message...",
    recipientsLabel: "Destinataires",
    recipientPlaceholder: "+15141234567",
    sendButton: "Envoyer SMS",
    sending: "Envoi en cours...",
    simulation: "simulation",
    characters: "caractères",
    recipient: "destinataire",
    recipients: "destinataires",
    types: {
      lock_applied: "Verrouillage appliqué",
      lock_removed: "Verrouillage retiré", 
      general_alert: "Alerte générale",
      emergency: "Urgence",
      work_completion: "Travail terminé",
      test: "Test"
    },
    messages: {
      invalidPhone: "Format de numéro invalide. Utilisez le format canadien (ex: +15141234567)",
      requirementError: "Message et destinataires requis",
      sendError: "Erreur lors de l'envoi",
      serviceNotConfigured: "Service SMS non configuré",
      loading: "Chargement SMS..."
    }
  },
  en: {
    title: "SMS Notification",
    typeLabel: "Alert type",
    messageLabel: "Message (max 160 characters)",
    messagePlaceholder: "Type your message...",
    recipientsLabel: "Recipients",
    recipientPlaceholder: "+15141234567",
    sendButton: "Send SMS",
    sending: "Sending...",
    simulation: "simulation",
    characters: "characters",
    recipient: "recipient",
    recipients: "recipients",
    types: {
      lock_applied: "Lock applied",
      lock_removed: "Lock removed",
      general_alert: "General alert", 
      emergency: "Emergency",
      work_completion: "Work completed",
      test: "Test"
    },
    messages: {
      invalidPhone: "Invalid phone format. Use Canadian format (ex: +15141234567)",
      requirementError: "Message and recipients required",
      sendError: "Error sending message",
      serviceNotConfigured: "SMS service not configured",
      loading: "Loading SMS..."
    }
  }
};

export default function SMSNotification({ 
  astId,
  defaultType = 'general_alert',
  defaultMessage = '',
  defaultRecipients = [],
  onClose,
  compact = false,
  autoExpand = false,
  language = 'fr'
}: SMSNotificationProps) {
  const { config, sendSMS, loading } = useTwilio();
  const t = translations[language];
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
        alert(t.messages.invalidPhone);
      }
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() || recipients.length === 0) {
      alert(t.messages.requirementError);
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
        message: t.messages.sendError,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setSending(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return t.types[type as keyof typeof t.types] || type;
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
    <div style={{
      backgroundColor: '#0f172a',
      color: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
          <h3 style={{ 
            fontWeight: '600', 
            color: '#e2e8f0', 
            margin: 0,
            fontSize: '18px'
          }}>
            {t.title}
          </h3>
          {config.mode === 'simulation' && (
            <span style={{
              fontSize: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              Mode simulation
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}
      </div>

      {/* Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '8px'
        }}>
          {t.typeLabel}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            fontSize: '14px'
          }}
        >
          <option value="general_alert">{t.types.general_alert}</option>
          <option value="emergency">{t.types.emergency}</option>
          <option value="lock_applied">{t.types.lock_applied}</option>
          <option value="lock_removed">{t.types.lock_removed}</option>
          <option value="work_completion">{t.types.work_completion}</option>
          <option value="test">{t.types.test}</option>
        </select>
      </div>

      {/* Message */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '8px'
        }}>
          {t.messageLabel}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.substring(0, 160))}
          placeholder={t.messagePlaceholder}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            fontSize: '14px',
            height: '80px',
            resize: 'none'
          }}
        />
        <div style={{
          textAlign: 'right',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '4px'
        }}>
          {message.length}/160 {t.characters}
        </div>
      </div>

      {/* Recipients */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '8px'
        }}>
          {t.recipientsLabel}
        </label>
        
        {/* Add recipient */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="tel"
            value={newRecipient}
            onChange={(e) => setNewRecipient(e.target.value)}
            placeholder={t.recipientPlaceholder}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              fontSize: '14px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
          />
          <button
            onClick={handleAddRecipient}
            disabled={!newRecipient.trim()}
            style={{
              padding: '12px 16px',
              backgroundColor: !newRecipient.trim() ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.1)',
              color: !newRecipient.trim() ? '#86efac' : '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              cursor: !newRecipient.trim() ? 'not-allowed' : 'pointer',
              opacity: !newRecipient.trim() ? 0.5 : 1
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
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
              {recipients.length} {recipients.length > 1 ? t.recipients : t.recipient}
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
            {t.sending}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t.sendButton} {config.mode === 'simulation' ? `(${t.simulation})` : ''}
          </>
        )}
      </button>
    </div>
  );
}