'use client';

import React, { useState, useCallback } from 'react';
import { Bell, Send, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

interface LockoutPoint {
  id: string;
  equipmentName: string;
  location: string;
  energyType: string;
}

interface NotificationSystemProps {
  lockoutPoints: LockoutPoint[];
  projectNumber: string;
  language: 'fr' | 'en';
  onNotificationSent?: (pointId: string) => void;
}

interface NotificationState {
  isEnabled: boolean;
  isSending: boolean;
  lastSentAt: string | null;
  sentNotifications: string[];
}

const LOTONotificationSystem: React.FC<NotificationSystemProps> = ({
  lockoutPoints,
  projectNumber,
  language,
  onNotificationSent
}) => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    isEnabled: false,
    isSending: false,
    lastSentAt: null,
    sentNotifications: []
  });

  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const t = {
    fr: {
      notifyWorkers: "Notifier les travailleurs",
      notifyWorkersDesc: "Envoyer une notification SMS des modifications LOTO",
      sendNotification: "Envoyer notification",
      notificationSent: "Notification envoyée",
      enableNotifications: "Activer les notifications",
      notificationSettings: "Paramètres de notification",
      lastSent: "Dernière envoyée",
      totalSent: "Total envoyées",
      sendingNotification: "Envoi en cours...",
      notificationSuccess: "Notification envoyée avec succès",
      notificationError: "Erreur lors de l'envoi"
    },
    en: {
      notifyWorkers: "Notify Workers",
      notifyWorkersDesc: "Send SMS notification for LOTO modifications",
      sendNotification: "Send Notification",
      notificationSent: "Notification Sent",
      enableNotifications: "Enable Notifications",
      notificationSettings: "Notification Settings",
      lastSent: "Last sent",
      totalSent: "Total sent",
      sendingNotification: "Sending...",
      notificationSuccess: "Notification sent successfully",
      notificationError: "Error sending notification"
    }
  };

  const text = t[language];

  const sendLOTONotification = useCallback(async (
    lockoutPoint: LockoutPoint, 
    modificationType: 'CHANGE' | 'DELETE' | 'ADD'
  ) => {
    if (!notificationState.isEnabled || notificationState.isSending) {
      return;
    }

    setNotificationState(prev => ({ ...prev, isSending: true }));

    try {
      // Récupérer TOUS les travailleurs actifs du projet (pas seulement le superviseur)
      // En production, récupérer depuis la liste des membres d'équipe de Step1 + API
      const mockWorkers = [
        { id: '1', name: 'Jean Tremblay', phone: '+15141234567', role: 'Électricien', isActive: true },
        { id: '2', name: 'Marie Dubois', phone: '+15149876543', role: 'Mécanicien', isActive: true },
        { id: '3', name: 'Pierre Martin', phone: '+15145555555', role: 'Superviseur', isActive: true },
        { id: '4', name: 'Luc Gagnon', phone: '+15146666666', role: 'Spécialiste', isActive: true },
        { id: '5', name: 'Sophie Lavoie', phone: '+15147777777', role: 'Observateur', isActive: true },
        { id: '6', name: 'Marc Bouchard', phone: '+15148888888', role: 'Travailleur', isActive: true }
      ];
      
      // CRITIQUE: Alerter TOUS les travailleurs présents sur le site
      console.log(`LOTO Alert: Notifying ALL ${mockWorkers.length} workers on site for equipment: ${lockoutPoint.equipmentName}`);

      const messageContext = {
        equipmentName: lockoutPoint.equipmentName || 'Équipement',
        astNumber: projectNumber || 'XXX',
        location: lockoutPoint.location || 'Site de travail',
        priority: 'HIGH'
      };

      let messageType: 'LOTO_CHANGE' | 'EQUIPMENT_CHANGE' | 'EMERGENCY';
      let customMessage = '';

      if (language === 'fr') {
        switch (modificationType) {
          case 'CHANGE':
            messageType = 'LOTO_CHANGE';
            customMessage = `MODIFICATION LOTO CRITIQUE\n\n⚠ ALERTE À TOUS LES TRAVAILLEURS ⚠\n\nPoint modifié: ${messageContext.equipmentName}\nProjet: AST-${messageContext.astNumber}\nEmplacement: ${messageContext.location}\n\nACTION IMMÉDIATE REQUISE:\n• Arrêtez votre travail IMMÉDIATEMENT\n• Vérifiez vos cadenas\n• Consultez la nouvelle procédure\n• Répondez OUI pour confirmer réception\n\n⚠ NE PAS IGNORER - Sécurité priorité absolue`;
            break;
          case 'DELETE':
            messageType = 'LOTO_CHANGE';
            customMessage = `POINT LOTO SUPPRIMÉ\n\n⚠ ALERTE À TOUS LES TRAVAILLEURS ⚠\n\nÉquipement: ${messageContext.equipmentName}\nProjet: AST-${messageContext.astNumber}\nEmplacement: ${messageContext.location}\n\nACTION IMMÉDIATE REQUISE:\n• Arrêtez votre travail IMMÉDIATEMENT\n• RETIREZ vos cadenas de cet équipement\n• Confirmez la réception\n\n⚠ CRITIQUE - Risque de sécurité si ignoré`;
            break;
          case 'ADD':
            messageType = 'EQUIPMENT_CHANGE';
            customMessage = `NOUVEAU POINT LOTO\n\n⚠ ALERTE À TOUS LES TRAVAILLEURS ⚠\n\nNouveau équipement: ${messageContext.equipmentName}\nProjet: AST-${messageContext.astNumber}\nEmplacement: ${messageContext.location}\n\nNOUVEAU POINT DE VERROUILLAGE:\n• Consultez la procédure mise à jour\n• Appliquez les mesures de sécurité\n• Répondez OUI pour confirmer réception\n\nSécurité renforcée sur le site`;
            break;
        }
      } else {
        switch (modificationType) {
          case 'CHANGE':
            messageType = 'LOTO_CHANGE';
            customMessage = `CRITICAL LOTO MODIFICATION\n\n⚠ ALERT TO ALL WORKERS ⚠\n\nModified point: ${messageContext.equipmentName}\nProject: AST-${messageContext.astNumber}\nLocation: ${messageContext.location}\n\nIMMEDIATE ACTION REQUIRED:\n• STOP your work IMMEDIATELY\n• Check your locks\n• Review new procedure\n• Reply YES to confirm receipt\n\n⚠ DO NOT IGNORE - Safety absolute priority`;
            break;
          case 'DELETE':
            messageType = 'LOTO_CHANGE';
            customMessage = `LOTO POINT DELETED\n\n⚠ ALERT TO ALL WORKERS ⚠\n\nEquipment: ${messageContext.equipmentName}\nProject: AST-${messageContext.astNumber}\nLocation: ${messageContext.location}\n\nIMMEDIATE ACTION REQUIRED:\n• STOP your work IMMEDIATELY\n• REMOVE your locks from this equipment\n• Confirm receipt\n\n⚠ CRITICAL - Safety risk if ignored`;
            break;
          case 'ADD':
            messageType = 'EQUIPMENT_CHANGE';
            customMessage = `NEW LOTO POINT\n\n⚠ ALERT TO ALL WORKERS ⚠\n\nNew equipment: ${messageContext.equipmentName}\nProject: AST-${messageContext.astNumber}\nLocation: ${messageContext.location}\n\nNEW LOCKOUT POINT:\n• Review updated procedure\n• Apply safety measures\n• Reply YES to confirm receipt\n\nEnhanced site safety`;
            break;
        }
      }

      // Envoyer notification bulk
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `loto_${Date.now()}`,
          type: messageType,
          title: `${modificationType} LOTO - AST-${messageContext.astNumber}`,
          message: customMessage,
          recipients: mockWorkers,
          priority: 'HIGH',
          requiresConfirmation: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification LOTO envoyée:', result);

        setNotificationState(prev => ({
          ...prev,
          isSending: false,
          lastSentAt: new Date().toISOString(),
          sentNotifications: [...prev.sentNotifications, lockoutPoint.id]
        }));

        onNotificationSent?.(lockoutPoint.id);

        // Notification de succès (optionnel)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(text.notificationSuccess, {
            body: `${result.summary.successful} ${language === 'fr' ? 'travailleurs notifiés' : 'workers notified'}`,
            icon: '/favicon.ico'
          });
        }
      } else {
        throw new Error('Erreur envoi notification');
      }
    } catch (error) {
      console.error('Erreur notification LOTO:', error);
      setNotificationState(prev => ({ ...prev, isSending: false }));
      alert(text.notificationError);
    }
  }, [notificationState.isEnabled, notificationState.isSending, projectNumber, language, onNotificationSent, text.notificationError, text.notificationSuccess]);

  const toggleNotifications = useCallback(() => {
    setNotificationState(prev => ({ 
      ...prev, 
      isEnabled: !prev.isEnabled 
    }));
  }, []);

  if (!showNotificationPanel) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowNotificationPanel(true)}
          style={{
            background: notificationState.isEnabled 
              ? 'linear-gradient(135deg, #10b981, #059669)' 
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}
          title={text.notifyWorkers}
        >
          <Bell size={24} />
          {notificationState.sentNotifications.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notificationState.sentNotifications.length}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '380px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          color: '#3b82f6',
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Bell size={20} />
          {text.notificationSettings}
        </h3>
        <button
          onClick={() => setShowNotificationPanel(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          ×
        </button>
      </div>

      {/* Toggle Switch */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div
          onClick={toggleNotifications}
          style={{
            width: '48px',
            height: '24px',
            background: notificationState.isEnabled ? '#10b981' : '#6b7280',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '10px',
            position: 'absolute',
            top: '2px',
            left: notificationState.isEnabled ? '26px' : '2px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: '500', fontSize: '14px' }}>
            {text.enableNotifications}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>
            {text.notifyWorkersDesc}
          </div>
        </div>
      </div>

      {/* Stats */}
      {notificationState.isEnabled && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#10b981', fontWeight: '600', fontSize: '16px' }}>
              {notificationState.sentNotifications.length}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>
              {text.totalSent}
            </div>
          </div>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '16px' }}>
              {notificationState.lastSentAt 
                ? new Date(notificationState.lastSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--:--'
              }
            </div>
            <div style={{ color: '#9ca3af', fontSize: '11px' }}>
              {text.lastSent}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {notificationState.isEnabled && lockoutPoints.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#f1f5f9', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Actions rapides:
          </div>
          {lockoutPoints.slice(0, 2).map((point) => (
            <button
              key={point.id}
              onClick={() => sendLOTONotification(point, 'CHANGE')}
              disabled={notificationState.isSending}
              style={{
                width: '100%',
                background: notificationState.sentNotifications.includes(point.id) 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: notificationState.sentNotifications.includes(point.id)
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                color: notificationState.sentNotifications.includes(point.id) ? '#10b981' : '#ef4444',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '6px',
                cursor: notificationState.isSending ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: notificationState.isSending ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {notificationState.sentNotifications.includes(point.id) ? (
                <CheckCircle size={14} />
              ) : notificationState.isSending ? (
                <MessageSquare size={14} />
              ) : (
                <Send size={14} />
              )}
              {notificationState.sentNotifications.includes(point.id) 
                ? `${text.notificationSent} - ${point.equipmentName || `Point ${lockoutPoints.indexOf(point) + 1}`}`
                : notificationState.isSending 
                  ? text.sendingNotification
                  : `${text.sendNotification} - ${point.equipmentName || `Point ${lockoutPoints.indexOf(point) + 1}`}`
              }
            </button>
          ))}
        </div>
      )}

      {!notificationState.isEnabled && (
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '14px',
          padding: '20px 0'
        }}>
          <AlertTriangle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <div>Activez les notifications pour alerter les travailleurs des modifications LOTO</div>
        </div>
      )}
    </div>
  );
};

export default LOTONotificationSystem;