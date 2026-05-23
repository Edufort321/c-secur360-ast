// Hook pour la gestion SMS dans les composants
'use client';

import { useState, useCallback } from 'react';

// =================== TYPES ===================

interface SMSAlert {
  id: string;
  type: 'lock_applied' | 'lock_removed' | 'general_alert' | 'emergency' | 'work_completion';
  message: string;
  recipients: string[];
  sentAt: string;
  sentBy: string;
  status?: 'pending' | 'sent' | 'failed' | 'partial';
  deliveryStatus?: any;
}

interface SMSRequest {
  astId: string;
  type: SMSAlert['type'];
  message: string;
  recipients: string[];
  sentBy?: string;
}

interface SMSResponse {
  success: boolean;
  alertId?: string;
  message: string;
  recipientCount: number;
  error?: string;
  details?: any;
}

interface UseSMSReturn {
  // États
  isSending: boolean;
  lastResponse: SMSResponse | null;
  alerts: SMSAlert[];
  
  // Actions
  sendSMS: (request: SMSRequest) => Promise<SMSResponse>;
  getAlertHistory: (astId: string) => Promise<SMSAlert[]>;
  validatePhoneNumber: (phone: string) => boolean;
  formatPhoneNumber: (phone: string) => string;
  
  // Utilitaires
  clearLastResponse: () => void;
  getQuickMessages: (language?: 'fr' | 'en') => string[];
}

// =================== VALIDATION TÉLÉPHONE ===================

const validateCanadianPhoneNumber = (phone: string): boolean => {
  // Format: +1XXXXXXXXXX, 1XXXXXXXXXX, ou XXXXXXXXXX (10 digits)
  const phoneRegex = /^\+?1?([2-9]\d{2}[2-9]\d{2}\d{4})$/;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleaned);
};

const formatCanadianPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const match = cleaned.match(/^(\+?1?)([2-9]\d{2}[2-9]\d{2}\d{4})$/);
  if (match) {
    return '+1' + match[2];
  }
  return phone;
};

// =================== MESSAGES RAPIDES ===================

const quickMessages = {
  fr: [
    '🚨 URGENCE: Arrêt immédiat des travaux',
    '⚠️ Vérification LOTO requise',
    '🔒 Nouveaux cadenas appliqués',
    '📋 Réunion sécurité dans 15min',
    '🎯 Fin des travaux - Retirer tous cadenas',
    '⏰ Pause obligatoire dans 10min',
    '🚪 Évacuation préventive en cours',
    '🔧 Maintenance d\'urgence - Zone fermée',
    '📞 Contactez superviseur immédiatement',
    '✅ Travaux autorisés à reprendre'
  ],
  en: [
    '🚨 EMERGENCY: Stop work immediately',
    '⚠️ LOTO verification required',
    '🔒 New locks applied',
    '📋 Safety meeting in 15min',
    '🎯 Work complete - Remove all locks',
    '⏰ Mandatory break in 10min',
    '🚪 Preventive evacuation in progress',
    '🔧 Emergency maintenance - Area closed',
    '📞 Contact supervisor immediately',
    '✅ Work authorized to resume'
  ]
};

// =================== HOOK PRINCIPAL ===================

export const useSMS = (): UseSMSReturn => {
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<SMSResponse | null>(null);
  const [alerts, setAlerts] = useState<SMSAlert[]>([]);

  // =================== ENVOI SMS ===================
  
  const sendSMS = useCallback(async (request: SMSRequest): Promise<SMSResponse> => {
    setIsSending(true);
    setLastResponse(null);
    
    try {
      // Validation côté client
      if (!request.astId || !request.message || !request.recipients || request.recipients.length === 0) {
        throw new Error('Données manquantes pour envoi SMS');
      }
      
      if (request.message.length > 160) {
        throw new Error('Message trop long (max 160 caractères)');
      }
      
      // Valider les numéros de téléphone
      const validRecipients = request.recipients.filter(phone => 
        validateCanadianPhoneNumber(phone)
      );
      
      if (validRecipients.length === 0) {
        throw new Error('Aucun numéro de téléphone valide');
      }
      
      // Appel API
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          recipients: validRecipients
        }),
      });
      
      const data: SMSResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur envoi SMS');
      }
      
      // Ajouter à l'historique local
      if (data.success && data.alertId) {
        const newAlert: SMSAlert = {
          id: data.alertId,
          type: request.type,
          message: request.message,
          recipients: validRecipients,
          sentAt: new Date().toISOString(),
          sentBy: request.sentBy || 'Utilisateur',
          status: 'sent'
        };
        
        setAlerts(prev => [newAlert, ...prev]);
      }
      
      setLastResponse(data);
      return data;
      
    } catch (error: any) {
      const errorResponse: SMSResponse = {
        success: false,
        message: error.message || 'Erreur inconnue',
        recipientCount: 0,
        error: error.message
      };
      
      setLastResponse(errorResponse);
      throw error;
      
    } finally {
      setIsSending(false);
    }
  }, []);

  // =================== HISTORIQUE SMS ===================
  
  const getAlertHistory = useCallback(async (astId: string): Promise<SMSAlert[]> => {
    try {
      const response = await fetch(`/api/sms/send?astId=${encodeURIComponent(astId)}`);
      
      if (!response.ok) {
        throw new Error('Erreur récupération historique SMS');
      }
      
      const data = await response.json();
      
      if (data.success && data.alerts) {
        setAlerts(data.alerts);
        return data.alerts;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erreur historique SMS:', error);
      return [];
    }
  }, []);

  // =================== UTILITAIRES ===================
  
  const clearLastResponse = useCallback(() => {
    setLastResponse(null);
  }, []);
  
  const getQuickMessages = useCallback((language: 'fr' | 'en' = 'fr'): string[] => {
    return quickMessages[language] || quickMessages.fr;
  }, []);

  // =================== RETURN ===================
  
  return {
    // États
    isSending,
    lastResponse,
    alerts,
    
    // Actions
    sendSMS,
    getAlertHistory,
    validatePhoneNumber: validateCanadianPhoneNumber,
    formatPhoneNumber: formatCanadianPhoneNumber,
    
    // Utilitaires
    clearLastResponse,
    getQuickMessages
  };
};

// =================== HOOK SPÉCIALISÉ POUR LOTO ===================

export const useLOTOSMS = (astId: string) => {
  const sms = useSMS();
  
  const sendLockAppliedAlert = useCallback(async (
    workerName: string, 
    lockNumber: string, 
    equipment: string,
    recipients: string[]
  ) => {
    const message = `🔒 ${workerName} a appliqué le cadenas ${lockNumber} sur ${equipment}`;
    return sms.sendSMS({
      astId,
      type: 'lock_applied',
      message,
      recipients,
      sentBy: workerName
    });
  }, [astId, sms]);
  
  const sendLockRemovedAlert = useCallback(async (
    workerName: string, 
    lockNumber: string, 
    equipment: string,
    recipients: string[]
  ) => {
    const message = `🔓 ${workerName} a retiré le cadenas ${lockNumber} de ${equipment}`;
    return sms.sendSMS({
      astId,
      type: 'lock_removed',
      message,
      recipients,
      sentBy: workerName
    });
  }, [astId, sms]);
  
  const sendWorkCompletionAlert = useCallback(async (
    workerName: string, 
    activeLockCount: number,
    recipients: string[]
  ) => {
    const message = activeLockCount > 0 
      ? `⚠️ ${workerName} termine ses travaux mais a encore ${activeLockCount} cadenas actifs!`
      : `✅ ${workerName} a terminé ses travaux et retiré tous ses cadenas`;
      
    return sms.sendSMS({
      astId,
      type: 'work_completion',
      message,
      recipients,
      sentBy: workerName
    });
  }, [astId, sms]);
  
  const sendEmergencyAlert = useCallback(async (
    message: string,
    recipients: string[]
  ) => {
    return sms.sendSMS({
      astId,
      type: 'emergency',
      message: `🚨 URGENCE: ${message}`,
      recipients,
      sentBy: 'Système d\'urgence'
    });
  }, [astId, sms]);
  
  return {
    ...sms,
    sendLockAppliedAlert,
    sendLockRemovedAlert,
    sendWorkCompletionAlert,
    sendEmergencyAlert
  };
};

export default useSMS;