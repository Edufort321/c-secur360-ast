// =================== HOOK DE NOTIFICATIONS AST ===================
'use client';

import { useState, useCallback, useEffect } from 'react';

// Types pour le système de notifications
export interface NotificationRecipient {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export interface NotificationMessage {
  id: string;
  type: 'LOTO_CHANGE' | 'HAZARD_UPDATE' | 'EQUIPMENT_CHANGE' | 'EMERGENCY' | 'REMINDER';
  title: string;
  message: string;
  recipients: NotificationRecipient[];
  sentAt: string;
  confirmations: NotificationConfirmation[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
  expiresAt?: string;
}

export interface NotificationConfirmation {
  recipientId: string;
  confirmedAt: string;
  method: 'SMS' | 'APP' | 'CALL';
  response: string;
}

export interface NotificationService {
  sendSMS: (phoneNumber: string, message: string) => Promise<boolean>;
  sendBulkSMS: (recipients: NotificationRecipient[], message: string) => Promise<{ success: number; failed: number }>;
  trackConfirmation: (messageId: string, recipientId: string, response: string) => Promise<void>;
}

// Hook principal pour les notifications AST
export const useASTNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationMessage[]>([]);

  // Connexion WebSocket pour les notifications temps réel
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications`);
        
        ws.onopen = () => {
          console.log('Connexion WebSocket notifications établie');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          const notification = JSON.parse(event.data);
          console.log('Nouvelle notification reçue:', notification);
          
          setNotifications(prev => [notification, ...prev]);
          
          // Notification browser si supporté
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            });
          }
        };

        ws.onclose = () => {
          console.log('Connexion WebSocket fermée');
          setIsConnected(false);
          
          // Tentative de reconnexion après 5 secondes
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          setIsConnected(false);
        };

        return ws;
      } catch (error) {
        console.error('Erreur connexion WebSocket:', error);
        setIsConnected(false);
        return null;
      }
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Demander permission notifications browser
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Envoyer notification SMS à un destinataire
  const sendSMSNotification = useCallback(async (recipient: NotificationRecipient, message: string, type: NotificationMessage['type'] = 'LOTO_CHANGE'): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: recipient.phone,
          message: message,
          recipientName: recipient.name,
          type: type
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('SMS envoyé avec succès:', result);
      
      return true;
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      return false;
    }
  }, []);

  // Envoyer notification à plusieurs destinataires
  const sendBulkNotification = useCallback(async (
    recipients: NotificationRecipient[], 
    title: string,
    message: string, 
    type: NotificationMessage['type'] = 'LOTO_CHANGE',
    priority: NotificationMessage['priority'] = 'HIGH',
    requiresConfirmation = true
  ): Promise<NotificationMessage> => {
    
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: NotificationMessage = {
      id: notificationId,
      type,
      title,
      message,
      recipients: recipients.filter(r => r.isActive),
      sentAt: new Date().toISOString(),
      confirmations: [],
      priority,
      requiresConfirmation,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    try {
      // Envoyer via API bulk
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Notification bulk envoyée:', result);

      // Ajouter à l'historique local
      setNotifications(prev => [notification, ...prev]);
      setNotificationHistory(prev => [notification, ...prev]);

      return notification;
    } catch (error) {
      console.error('Erreur envoi bulk notification:', error);
      throw error;
    }
  }, []);

  // Confirmer réception d'une notification
  const confirmNotification = useCallback(async (messageId: string, recipientId: string, response: string = 'OUI'): Promise<void> => {
    try {
      const confirmation: NotificationConfirmation = {
        recipientId,
        confirmedAt: new Date().toISOString(),
        method: 'SMS',
        response
      };

      await fetch('/api/notifications/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          confirmation
        }),
      });

      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === messageId 
            ? { ...notif, confirmations: [...notif.confirmations, confirmation] }
            : notif
        )
      );

      console.log('Confirmation enregistrée:', messageId, recipientId);
    } catch (error) {
      console.error('Erreur confirmation notification:', error);
    }
  }, []);

  // Messages prédéfinis pour différents types de notifications
  const getMessageTemplate = useCallback((
    type: NotificationMessage['type'], 
    context: any,
    language: 'fr' | 'en' = 'fr'
  ): { title: string; message: string } => {
    
    const templates = {
      fr: {
        LOTO_CHANGE: {
          title: 'MODIFICATION LOTO - ACTION REQUISE',
          message: `ALERTE SÉCURITÉ: Modification du point de verrouillage "${context.equipmentName}" sur le projet AST-${context.astNumber}. Vous devez IMMÉDIATEMENT déplacer votre cadenas et valider. Répondez OUI pour confirmer. Urgence: ${context.priority}`
        },
        HAZARD_UPDATE: {
          title: '⚠️ NOUVEAU DANGER IDENTIFIÉ',
          message: `ATTENTION: Nouveau danger identifié sur votre zone de travail "${context.location}". Consultez la mise à jour AST-${context.astNumber} et confirmez réception par OUI.`
        },
        EQUIPMENT_CHANGE: {
          title: 'CHANGEMENT D\'ÉQUIPEMENT',
          message: `MODIFICATION: Changement d'équipement sur "${context.equipmentName}". Nouvelle procédure en vigueur. Confirmez par OUI la lecture du nouvel AST-${context.astNumber}.`
        },
        EMERGENCY: {
          title: 'URGENCE SÉCURITÉ',
          message: `URGENCE: ${context.message} Évacuez immédiatement la zone si nécessaire. Confirmez votre sécurité par OUI.`
        },
        REMINDER: {
          title: 'RAPPEL AST',
          message: `RAPPEL: Vous n'avez pas confirmé la notification AST-${context.astNumber}. Action requise. Répondez OUI pour confirmer.`
        }
      },
      en: {
        LOTO_CHANGE: {
          title: 'LOTO MODIFICATION - ACTION REQUIRED',
          message: `SAFETY ALERT: Lockout point "${context.equipmentName}" modified on AST-${context.astNumber}. You must IMMEDIATELY move your lock and validate. Reply YES to confirm. Priority: ${context.priority}`
        },
        HAZARD_UPDATE: {
          title: '⚠️ NEW HAZARD IDENTIFIED',
          message: `WARNING: New hazard identified in your work area "${context.location}". Review AST-${context.astNumber} update and confirm receipt with YES.`
        },
        EQUIPMENT_CHANGE: {
          title: 'EQUIPMENT CHANGE',
          message: `MODIFICATION: Equipment change on "${context.equipmentName}". New procedure in effect. Confirm reading of new AST-${context.astNumber} with YES.`
        },
        EMERGENCY: {
          title: 'SAFETY EMERGENCY',
          message: `EMERGENCY: ${context.message} Evacuate area immediately if necessary. Confirm your safety with YES.`
        },
        REMINDER: {
          title: 'AST REMINDER',
          message: `REMINDER: You haven't confirmed AST-${context.astNumber} notification. Action required. Reply YES to confirm.`
        }
      }
    };

    return templates[language][type] || templates.fr.LOTO_CHANGE;
  }, []);

  // Statistiques des notifications
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const confirmed = notifications.reduce((sum, notif) => sum + notif.confirmations.length, 0);
    const pending = notifications.reduce((sum, notif) => {
      const pendingRecipients = notif.recipients.length - notif.confirmations.length;
      return sum + Math.max(0, pendingRecipients);
    }, 0);

    return {
      total,
      confirmed,
      pending,
      confirmationRate: total > 0 ? Math.round((confirmed / (total * notifications.reduce((sum, n) => sum + n.recipients.length, 0)) * 100)) : 0
    };
  }, [notifications]);

  return {
    notifications,
    notificationHistory,
    isConnected,
    sendSMSNotification,
    sendBulkNotification,
    confirmNotification,
    getMessageTemplate,
    getNotificationStats,
    // États utiles
    hasUnconfirmedNotifications: notifications.some(n => n.requiresConfirmation && n.confirmations.length < n.recipients.length),
    criticalNotifications: notifications.filter(n => n.priority === 'CRITICAL'),
  };
};

export default useASTNotifications;