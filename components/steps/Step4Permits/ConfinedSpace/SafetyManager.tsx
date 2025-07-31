// =================== GESTIONNAIRE CENTRAL DE SÉCURITÉ ===================
// Ce fichier gère la communication entre AtmosphericTesting.tsx et EntryRegistry.tsx

import { useEffect, useRef } from 'react';

// =================== TYPES PARTAGÉS ===================
export interface SafetyTimer {
  id: string;
  type: 'retest' | 'continuous' | 'evacuation';
  level?: 'top' | 'middle' | 'bottom';
  timeRemaining: number;
  isActive: boolean;
  lastReading?: AtmosphericReading;
  alertTriggered: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'warning' | 'danger' | 'evacuation' | 'retest';
  level: 'top' | 'middle' | 'bottom';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  personnelCount: number;
  autoEvacuation?: boolean;
}

export interface AtmosphericReading {
  id: string;
  timestamp: string;
  level: 'top' | 'middle' | 'bottom';
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature?: number;
  humidity?: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  taken_by: string;
  notes?: string;
  retest_required?: boolean;
  next_test_due?: string;
  timer_active?: boolean;
}

export interface PersonnelStatus {
  totalPersonnel: number;
  personnelInside: number;
  personnelByLevel: {
    top: number;
    middle: number;
    bottom: number;
  };
  surveillantActive: boolean;
}

// =================== HOOK GESTIONNAIRE DE SÉCURITÉ ===================
export const useSafetyManager = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sons d'alerte
  const ALERT_SOUNDS = {
    warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR',
    danger: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR',
    evacuation: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR'
  };

  // Jouer son d'alerte
  const playAlert = (type: keyof typeof ALERT_SOUNDS, repeat = false) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current = new Audio(ALERT_SOUNDS[type]);
      audioRef.current.loop = repeat;
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(() => {
        console.log('Audio autoplay bloqué par le navigateur');
      });
    } catch (error) {
      console.error('Erreur audio:', error);
    }
  };

  // Notification browser avec son
  const sendNotification = (title: string, body: string, type: keyof typeof ALERT_SOUNDS) => {
    playAlert(type, type === 'evacuation');
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/c-secur360-logo.png',
          tag: `safety-alert-${type}`,
          requireInteraction: type === 'evacuation',
          vibrate: type === 'evacuation' ? [200, 100, 200] : [100]
        });
        
        if (type === 'evacuation') {
          // Auto-fermer après 30 secondes pour évacuation
          setTimeout(() => notification.close(), 30000);
        }
      }
    }
  };

  // Créer timer de surveillance pour un niveau
  const createLevelTimer = (
    reading: AtmosphericReading,
    frequency: number,
    onWarning: (level: string) => void,
    onRetest: (level: string) => void
  ): SafetyTimer => {
    const timerId = `${reading.level}_${reading.id}`;
    const totalTime = frequency * 60; // en secondes
    
    let timeRemaining = totalTime;
    
    const interval = setInterval(() => {
      timeRemaining--;
      
      // Alerte à 1 minute
      if (timeRemaining === 60 && !reading.timer_active) {
        playAlert('warning');
        sendNotification(
          '⏰ RETEST ATMOSPHÉRIQUE - 1 MINUTE',
          `Niveau ${reading.level.toUpperCase()}: Nouveau test requis dans 1 minute`,
          'warning'
        );
        onWarning(reading.level);
      }
      
      // Fin du timer - retest obligatoire
      if (timeRemaining <= 0) {
        playAlert('danger');
        sendNotification(
          '🚨 RETEST OBLIGATOIRE MAINTENANT',
          `Niveau ${reading.level.toUpperCase()}: Effectuer immédiatement un nouveau test atmosphérique`,
          'danger'
        );
        onRetest(reading.level);
        clearInterval(interval);
        timersRef.current.delete(timerId);
      }
    }, 1000);
    
    timersRef.current.set(timerId, interval);
    
    return {
      id: timerId,
      type: 'continuous',
      level: reading.level,
      timeRemaining,
      isActive: true,
      lastReading: reading,
      alertTriggered: false
    };
  };

  // Déclencher évacuation d'urgence
  const triggerEmergencyEvacuation = (
    reading: AtmosphericReading,
    personnelStatus: PersonnelStatus,
    onEvacuate: () => void
  ) => {
    if (personnelStatus.personnelInside > 0) {
      // Son d'évacuation en continu
      playAlert('evacuation', true);
      
      // Notification d'évacuation
      sendNotification(
        '🚨 ÉVACUATION IMMÉDIATE REQUISE',
        `DANGER CRITIQUE niveau ${reading.level.toUpperCase()}: ${personnelStatus.personnelInside} personne(s) à évacuer immédiatement!`,
        'evacuation'
      );
      
      // Alerte visuelle clignotante
      if (typeof window !== 'undefined') {
        document.body.style.animation = 'evacuation-flash 0.5s infinite';
        
        // Arrêter le clignotement après 30 secondes
        setTimeout(() => {
          document.body.style.animation = '';
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }, 30000);
      }
      
      // Déclencher l'évacuation automatique
      onEvacuate();
      
      return true;
    }
    return false;
  };

  // Démarrer timer de retest (15 minutes après échec)
  const startRetestTimer = (
    reading: AtmosphericReading,
    onRetestDue: (level: string) => void
  ): SafetyTimer => {
    const timerId = `retest_${reading.level}_${reading.id}`;
    let timeRemaining = 15 * 60; // 15 minutes
    
    const interval = setInterval(() => {
      timeRemaining--;
      
      if (timeRemaining <= 0) {
        playAlert('danger');
        sendNotification(
          '🚨 RETEST OBLIGATOIRE - 15 MINUTES ÉCOULÉES',
          `Niveau ${reading.level.toUpperCase()}: Effectuer immédiatement un nouveau test atmosphérique`,
          'danger'
        );
        onRetestDue(reading.level);
        clearInterval(interval);
        timersRef.current.delete(timerId);
      }
    }, 1000);
    
    timersRef.current.set(timerId, interval);
    
    return {
      id: timerId,
      type: 'retest',
      level: reading.level,
      timeRemaining,
      isActive: true,
      lastReading: reading,
      alertTriggered: false
    };
  };

  // Analyser lecture et déclencher actions appropriées
  const processAtmosphericReading = (
    reading: AtmosphericReading,
    personnelStatus: PersonnelStatus,
    frequency: number,
    callbacks: {
      onWarning: (level: string) => void;
      onRetest: (level: string) => void;
      onEvacuate: () => void;
    }
  ): {
    timer?: SafetyTimer;
    alert?: SafetyAlert;
    evacuationTriggered: boolean;
  } => {
    let timer: SafetyTimer | undefined;
    let alert: SafetyAlert | undefined;
    let evacuationTriggered = false;
    
    // Si lecture dangereuse
    if (reading.status === 'danger') {
      // Déclencher évacuation si personnel à l'intérieur
      evacuationTriggered = triggerEmergencyEvacuation(reading, personnelStatus, callbacks.onEvacuate);
      
      // Démarrer timer de retest (15 minutes)
      timer = startRetestTimer(reading, callbacks.onRetest);
      
      alert = {
        id: `alert_${reading.id}`,
        type: 'evacuation',
        level: reading.level,
        message: `DANGER CRITIQUE niveau ${reading.level.toUpperCase()}: Évacuation immédiate requise!`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        personnelCount: personnelStatus.personnelInside,
        autoEvacuation: evacuationTriggered
      };
    }
    // Si lecture normale, démarrer surveillance continue
    else if (reading.status === 'safe' || reading.status === 'warning') {
      timer = createLevelTimer(reading, frequency, callbacks.onWarning, callbacks.onRetest);
      
      if (reading.status === 'warning') {
        alert = {
          id: `alert_${reading.id}`,
          type: 'warning',
          level: reading.level,
          message: `ATTENTION niveau ${reading.level.toUpperCase()}: Valeurs hors limites acceptables`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          personnelCount: personnelStatus.personnelInside
        };
      }
    }
    
    return {
      timer,
      alert,
      evacuationTriggered
    };
  };

  // Nettoyer tous les timers
  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => {
      clearInterval(timer);
    });
    timersRef.current.clear();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return {
    processAtmosphericReading,
    createLevelTimer,
    startRetestTimer,
    triggerEmergencyEvacuation,
    playAlert,
    sendNotification,
    formatTime,
    clearAllTimers
  };
};

// =================== CSS ANIMATION POUR ÉVACUATION ===================
export const emergencyStyles = `
  @keyframes evacuation-flash {
    0% { background-color: rgba(220, 38, 38, 0.1); }
    50% { background-color: rgba(220, 38, 38, 0.3); }
    100% { background-color: rgba(220, 38, 38, 0.1); }
  }
  
  .evacuation-alert {
    animation: evacuation-flash 0.5s infinite;
    border: 3px solid #ef4444 !important;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
  }
  
  .timer-warning {
    animation: pulse 1s infinite;
    color: #f59e0b !important;
  }
  
  .timer-danger {
    animation: pulse 0.5s infinite;
    color: #ef4444 !important;
  }
`;

export default useSafetyManager;
