// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USETIMERS.TS ===================
// Hook React pour gestion timers, planification et alertes automatiques
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

// =================== INTERFACES ===================

export interface Timer {
  id: string;
  name: string;
  type: TimerType;
  context: TimerContext;
  startTime: Date;
  endTime?: Date;
  duration: number; // millisecondes
  remainingTime: number;
  status: TimerStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  alerts: TimerAlert[];
  onExpire?: () => void;
  onWarning?: (timeLeft: number) => void;
  metadata: TimerMetadata;
}

export interface TimerAlert {
  id: string;
  timerId: string;
  triggerTime: Date;
  triggerOffset: number; // millisecondes avant expiration
  alertType: 'notification' | 'warning' | 'critical' | 'expired';
  message: string;
  isTriggered: boolean;
  isSilenced: boolean;
  callback?: () => void;
}

// Interface pour les templates d'alertes (sans timerId et triggerTime)
export interface TimerAlertTemplate {
  id: string;
  triggerOffset: number; // millisecondes avant expiration
  alertType: 'notification' | 'warning' | 'critical' | 'expired';
  message: string;
  isTriggered: boolean;
  isSilenced: boolean;
  callback?: () => void;
}

export interface TimerMetadata {
  permitId?: string;
  spaceId?: string;
  userId?: string;
  description: string;
  requirements: string[];
  consequences: string[];
  relatedTimers: string[];
  legalDeadline: boolean;
  autoRenew: boolean;
  notificationChannels: NotificationChannel[];
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: TaskType;
  scheduleType: 'once' | 'recurring';
  cronExpression?: string; // Pour tâches récurrentes
  nextExecution: Date;
  lastExecution?: Date;
  isActive: boolean;
  callback: () => void | Promise<void>;
  metadata: Record<string, any>;
}

export interface TimerConfig {
  enableNotifications: boolean;
  enableHapticFeedback: boolean;
  enableAudioAlerts: boolean;
  defaultWarningOffset: number; // millisecondes
  criticalWarningOffset: number;
  maxConcurrentTimers: number;
  persistTimers: boolean;
  autoCleanupExpired: boolean;
  debugMode: boolean;
}

export interface TimerStats {
  activeTimers: number;
  expiredTimers: number;
  totalTimers: number;
  criticalAlerts: number;
  pendingAlerts: number;
  averageDuration: number;
  longestRunning: Timer | null;
  upcomingExpirations: Timer[];
}

// Interface pour les templates de timers
export interface TimerTemplate {
  name: string;
  type: TimerType;
  context: TimerContext;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  alerts: TimerAlertTemplate[];
  metadata: Partial<TimerMetadata>;
}

// =================== TYPES ===================

export type TimerType = 
  | 'permit_validity' | 'atmospheric_testing' | 'equipment_calibration'
  | 'inspection_due' | 'certification_expiry' | 'training_deadline'
  | 'maintenance_due' | 'audit_reminder' | 'emergency_drill'
  | 'shift_duration' | 'break_reminder' | 'meeting_reminder'
  | 'custom_countdown' | 'procedure_timeout' | 'response_deadline';

export type TimerContext = 
  | 'permit' | 'safety' | 'equipment' | 'personnel' | 'compliance'
  | 'maintenance' | 'training' | 'emergency' | 'administrative';

export type TimerStatus = 
  | 'active' | 'paused' | 'expired' | 'completed' | 'cancelled' | 'overdue';

export type TaskType = 
  | 'permit_renewal' | 'equipment_check' | 'atmospheric_test'
  | 'inspection' | 'training_reminder' | 'certification_check'
  | 'maintenance_alert' | 'audit_preparation' | 'report_generation';

export type NotificationChannel = 
  | 'push' | 'email' | 'sms' | 'in_app' | 'haptic' | 'audio';

// =================== TEMPLATES TIMERS ===================

export const TIMER_TEMPLATES: Record<TimerType, TimerTemplate> = {
  permit_validity: {
    name: 'Validité Permis',
    type: 'permit_validity',
    context: 'permit',
    priority: 'critical',
    duration: 8 * 60 * 60 * 1000, // 8 heures
    alerts: [
      {
        id: 'warning_2h',
        triggerOffset: 2 * 60 * 60 * 1000, // 2h avant
        alertType: 'warning',
        message: 'Permis expire dans 2 heures',
        isTriggered: false,
        isSilenced: false
      },
      {
        id: 'critical_30m',
        triggerOffset: 30 * 60 * 1000, // 30min avant
        alertType: 'critical',
        message: 'Permis expire dans 30 minutes - Action requise',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Validité du permis de travail',
      requirements: ['Renouvellement avant expiration'],
      consequences: ['Arrêt immédiat des travaux'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'haptic', 'audio']
    }
  },

  atmospheric_testing: {
    name: 'Tests Atmosphériques',
    type: 'atmospheric_testing',
    context: 'safety',
    priority: 'high',
    duration: 2 * 60 * 60 * 1000, // 2 heures
    alerts: [
      {
        id: 'reminder_15m',
        triggerOffset: 15 * 60 * 1000,
        alertType: 'notification',
        message: 'Tests atmosphériques requis dans 15 minutes',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Intervalle tests atmosphériques périodiques',
      requirements: ['Tests O₂, LEL, H₂S, CO obligatoires'],
      consequences: ['Évacuation si tests non effectués'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: true,
      notificationChannels: ['push', 'haptic']
    }
  },

  equipment_calibration: {
    name: 'Calibration Équipement',
    type: 'equipment_calibration',
    context: 'equipment',
    priority: 'medium',
    duration: 180 * 24 * 60 * 60 * 1000, // 180 jours
    alerts: [
      {
        id: 'reminder_30d',
        triggerOffset: 30 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Calibration équipement due dans 30 jours',
        isTriggered: false,
        isSilenced: false
      },
      {
        id: 'warning_7d',
        triggerOffset: 7 * 24 * 60 * 60 * 1000,
        alertType: 'warning',
        message: 'Calibration équipement due dans 7 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Calibration périodique équipements de mesure',
      requirements: ['Calibration par technicien certifié'],
      consequences: ['Équipement hors service si non calibré'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'email']
    }
  },

  certification_expiry: {
    name: 'Expiration Certification',
    type: 'certification_expiry',
    context: 'personnel',
    priority: 'high',
    duration: 365 * 24 * 60 * 60 * 1000, // 1 an
    alerts: [
      {
        id: 'reminder_60d',
        triggerOffset: 60 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Certification expire dans 60 jours',
        isTriggered: false,
        isSilenced: false
      },
      {
        id: 'warning_30d',
        triggerOffset: 30 * 24 * 60 * 60 * 1000,
        alertType: 'warning',
        message: 'Certification expire dans 30 jours - Renouvellement requis',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Expiration certifications personnel',
      requirements: ['Formation et examen de renouvellement'],
      consequences: ['Personnel non autorisé à travailler'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'email', 'sms']
    }
  },

  shift_duration: {
    name: 'Durée Quart',
    type: 'shift_duration',
    context: 'administrative',
    priority: 'medium',
    duration: 8 * 60 * 60 * 1000, // 8 heures
    alerts: [
      {
        id: 'break_4h',
        triggerOffset: 4 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Pause recommandée après 4h de travail',
        isTriggered: false,
        isSilenced: false
      },
      {
        id: 'end_shift',
        triggerOffset: 30 * 60 * 1000,
        alertType: 'warning',
        message: 'Fin de quart dans 30 minutes',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Durée maximale du quart de travail',
      requirements: ['Respect des heures légales de travail'],
      consequences: ['Heures supplémentaires, fatigue'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: false,
      notificationChannels: ['push']
    }
  },

  emergency_drill: {
    name: 'Exercice Urgence',
    type: 'emergency_drill',
    context: 'emergency',
    priority: 'high',
    duration: 90 * 24 * 60 * 60 * 1000, // 90 jours
    alerts: [
      {
        id: 'schedule_drill',
        triggerOffset: 7 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Exercice d\'urgence à planifier dans 7 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Fréquence exercices d\'urgence obligatoires',
      requirements: ['Exercice trimestriel équipe sauvetage'],
      consequences: ['Non-conformité réglementaire'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: true,
      notificationChannels: ['push', 'email']
    }
  },

  // Ajout des types manquants avec des templates par défaut
  inspection_due: {
    name: 'Inspection Due',
    type: 'inspection_due',
    context: 'compliance',
    priority: 'medium',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 jours
    alerts: [
      {
        id: 'reminder_7d',
        triggerOffset: 7 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Inspection due dans 7 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Inspection périodique requise',
      requirements: ['Inspection par personne qualifiée'],
      consequences: ['Non-conformité réglementaire'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'email']
    }
  },

  training_deadline: {
    name: 'Échéance Formation',
    type: 'training_deadline',
    context: 'training',
    priority: 'medium',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 jours
    alerts: [
      {
        id: 'reminder_14d',
        triggerOffset: 14 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Formation obligatoire dans 14 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Échéance formation obligatoire',
      requirements: ['Completion formation certifiante'],
      consequences: ['Personnel non qualifié'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'email']
    }
  },

  maintenance_due: {
    name: 'Maintenance Due',
    type: 'maintenance_due',
    context: 'maintenance',
    priority: 'medium',
    duration: 90 * 24 * 60 * 60 * 1000, // 90 jours
    alerts: [
      {
        id: 'reminder_7d',
        triggerOffset: 7 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Maintenance préventive due dans 7 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Maintenance préventive équipement',
      requirements: ['Maintenance par technicien qualifié'],
      consequences: ['Risque panne équipement'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: true,
      notificationChannels: ['push', 'email']
    }
  },

  audit_reminder: {
    name: 'Rappel Audit',
    type: 'audit_reminder',
    context: 'compliance',
    priority: 'medium',
    duration: 365 * 24 * 60 * 60 * 1000, // 1 an
    alerts: [
      {
        id: 'reminder_30d',
        triggerOffset: 30 * 24 * 60 * 60 * 1000,
        alertType: 'notification',
        message: 'Audit annuel dans 30 jours',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Audit annuel obligatoire',
      requirements: ['Préparation documents audit'],
      consequences: ['Non-conformité réglementaire'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: true,
      notificationChannels: ['push', 'email']
    }
  },

  break_reminder: {
    name: 'Rappel Pause',
    type: 'break_reminder',
    context: 'administrative',
    priority: 'low',
    duration: 4 * 60 * 60 * 1000, // 4 heures
    alerts: [
      {
        id: 'break_time',
        triggerOffset: 0,
        alertType: 'notification',
        message: 'Pause recommandée',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Rappel pause régulière',
      requirements: ['Pause toutes les 4 heures'],
      consequences: ['Fatigue, productivité réduite'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: true,
      notificationChannels: ['push']
    }
  },

  meeting_reminder: {
    name: 'Rappel Réunion',
    type: 'meeting_reminder',
    context: 'administrative',
    priority: 'low',
    duration: 60 * 60 * 1000, // 1 heure
    alerts: [
      {
        id: 'meeting_15m',
        triggerOffset: 15 * 60 * 1000,
        alertType: 'notification',
        message: 'Réunion dans 15 minutes',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Rappel réunion programmée',
      requirements: ['Présence obligatoire'],
      consequences: ['Retard réunion'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: false,
      notificationChannels: ['push', 'audio']
    }
  },

  custom_countdown: {
    name: 'Compte à Rebours',
    type: 'custom_countdown',
    context: 'administrative',
    priority: 'medium',
    duration: 60 * 60 * 1000, // 1 heure par défaut
    alerts: [
      {
        id: 'countdown_end',
        triggerOffset: 0,
        alertType: 'notification',
        message: 'Compte à rebours terminé',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Compte à rebours personnalisé',
      requirements: ['Action à effectuer'],
      consequences: ['Délai dépassé'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: false,
      notificationChannels: ['push', 'audio']
    }
  },

  procedure_timeout: {
    name: 'Timeout Procédure',
    type: 'procedure_timeout',
    context: 'safety',
    priority: 'high',
    duration: 30 * 60 * 1000, // 30 minutes
    alerts: [
      {
        id: 'timeout_warning',
        triggerOffset: 5 * 60 * 1000,
        alertType: 'warning',
        message: 'Procédure expire dans 5 minutes',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Timeout procédure sécurité',
      requirements: ['Completion procédure obligatoire'],
      consequences: ['Arrêt procédure, recommencer'],
      relatedTimers: [],
      legalDeadline: true,
      autoRenew: false,
      notificationChannels: ['push', 'haptic', 'audio']
    }
  },

  response_deadline: {
    name: 'Délai Réponse',
    type: 'response_deadline',
    context: 'administrative',
    priority: 'medium',
    duration: 24 * 60 * 60 * 1000, // 24 heures
    alerts: [
      {
        id: 'response_6h',
        triggerOffset: 6 * 60 * 60 * 1000,
        alertType: 'warning',
        message: 'Réponse requise dans 6 heures',
        isTriggered: false,
        isSilenced: false
      }
    ],
    metadata: {
      description: 'Délai de réponse obligatoire',
      requirements: ['Réponse dans les délais'],
      consequences: ['Escalade automatique'],
      relatedTimers: [],
      legalDeadline: false,
      autoRenew: false,
      notificationChannels: ['push', 'email']
    }
  }
};

// =================== CONFIGURATION PAR DÉFAUT ===================

const DEFAULT_CONFIG: TimerConfig = {
  enableNotifications: true,
  enableHapticFeedback: true,
  enableAudioAlerts: true,
  defaultWarningOffset: 30 * 60 * 1000, // 30 minutes
  criticalWarningOffset: 10 * 60 * 1000, // 10 minutes
  maxConcurrentTimers: 50,
  persistTimers: true,
  autoCleanupExpired: true,
  debugMode: false
};

// =================== HOOK PRINCIPAL ===================

export function useTimers(config: Partial<TimerConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // État principal
  const [timers, setTimers] = useState<Map<string, Timer>>(new Map());
  const [scheduledTasks, setScheduledTasks] = useState<Map<string, ScheduledTask>>(new Map());
  const [isRunning, setIsRunning] = useState(true);

  // Références pour intervalles
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // =================== UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.debugMode) {
      console.log(`[Timers] ${message}`, data || '');
    }
  }, [finalConfig.debugMode]);

  const generateId = useCallback(() => {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const calculateRemainingTime = useCallback((timer: Timer): number => {
    if (timer.status !== 'active') return 0;
    
    const elapsed = Date.now() - timer.startTime.getTime();
    const remaining = Math.max(0, timer.duration - elapsed);
    return remaining;
  }, []);

  const formatDuration = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // =================== GESTION TIMERS ===================

  const createTimer = useCallback((
    type: TimerType,
    customConfig?: Partial<Timer>
  ): string => {
    const template = TIMER_TEMPLATES[type];
    if (!template) {
      log(`Template non trouvé pour type: ${type}`);
      return '';
    }

    const timerId = generateId();
    const now = new Date();
    const duration = customConfig?.duration || template.duration;

    // Générer les alertes avec IDs uniques et propriétés complètes
    const alerts: TimerAlert[] = template.alerts.map(alertTemplate => ({
      ...alertTemplate,
      id: `${timerId}_${alertTemplate.id}`,
      timerId,
      triggerTime: new Date(now.getTime() + duration - alertTemplate.triggerOffset)
    }));

    const timer: Timer = {
      id: timerId,
      name: customConfig?.name || template.name,
      type,
      context: template.context,
      startTime: now,
      duration,
      remainingTime: duration,
      status: 'active',
      priority: customConfig?.priority || template.priority,
      alerts,
      onExpire: customConfig?.onExpire,
      onWarning: customConfig?.onWarning,
      metadata: {
        description: template.metadata.description || '',
        requirements: template.metadata.requirements || [],
        consequences: template.metadata.consequences || [],
        relatedTimers: template.metadata.relatedTimers || [],
        legalDeadline: template.metadata.legalDeadline || false,
        autoRenew: template.metadata.autoRenew || false,
        notificationChannels: template.metadata.notificationChannels || ['push'],
        ...customConfig?.metadata
      }
    };

    setTimers(prev => new Map(prev.set(timerId, timer)));
    
    log('Timer créé', {
      id: timerId,
      type,
      name: timer.name,
      duration: formatDuration(timer.duration)
    });

    return timerId;
  }, [generateId, formatDuration, log]);

  const pauseTimer = useCallback((timerId: string): boolean => {
    const timer = timers.get(timerId);
    if (!timer || timer.status !== 'active') return false;

    const updatedTimer: Timer = {
      ...timer,
      status: 'paused',
      remainingTime: calculateRemainingTime(timer)
    };

    setTimers(prev => new Map(prev.set(timerId, updatedTimer)));
    log('Timer mis en pause', { id: timerId, remainingTime: formatDuration(updatedTimer.remainingTime) });
    return true;
  }, [timers, calculateRemainingTime, formatDuration, log]);

  const resumeTimer = useCallback((timerId: string): boolean => {
    const timer = timers.get(timerId);
    if (!timer || timer.status !== 'paused') return false;

    const now = new Date();
    const updatedTimer: Timer = {
      ...timer,
      status: 'active',
      startTime: new Date(now.getTime() - (timer.duration - timer.remainingTime)),
      // Recalculer les alertes
      alerts: timer.alerts.map(alert => ({
        ...alert,
        triggerTime: new Date(now.getTime() + timer.remainingTime - alert.triggerOffset),
        isTriggered: false
      }))
    };

    setTimers(prev => new Map(prev.set(timerId, updatedTimer)));
    log('Timer repris', { id: timerId, remainingTime: formatDuration(timer.remainingTime) });
    return true;
  }, [timers, formatDuration, log]);

  const stopTimer = useCallback((timerId: string, status: 'completed' | 'cancelled' = 'completed'): boolean => {
    const timer = timers.get(timerId);
    if (!timer) return false;

    const updatedTimer: Timer = {
      ...timer,
      status,
      endTime: new Date(),
      remainingTime: 0
    };

    setTimers(prev => new Map(prev.set(timerId, updatedTimer)));
    log('Timer arrêté', { id: timerId, status });
    return true;
  }, [timers, log]);

  const extendTimer = useCallback((timerId: string, additionalTime: number): boolean => {
    const timer = timers.get(timerId);
    if (!timer || timer.status !== 'active') return false;

    const updatedTimer: Timer = {
      ...timer,
      duration: timer.duration + additionalTime,
      // Recalculer les alertes
      alerts: timer.alerts.map(alert => ({
        ...alert,
        triggerTime: new Date(alert.triggerTime.getTime() + additionalTime)
      }))
    };

    setTimers(prev => new Map(prev.set(timerId, updatedTimer)));
    log('Timer prolongé', { 
      id: timerId, 
      additionalTime: formatDuration(additionalTime),
      newDuration: formatDuration(updatedTimer.duration)
    });
    return true;
  }, [timers, formatDuration, log]);

  const deleteTimer = useCallback((timerId: string): boolean => {
    const success = timers.has(timerId);
    if (success) {
      setTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(timerId);
        return newMap;
      });
      log('Timer supprimé', timerId);
    }
    return success;
  }, [timers, log]);

  // =================== GESTION ALERTES ===================

  const checkAndTriggerAlerts = useCallback(() => {
    const now = Date.now();
    let alertsTriggered = 0;

    setTimers(prev => {
      const newTimers = new Map(prev);
      
      for (const [timerId, timer] of newTimers.entries()) {
        if (timer.status !== 'active') continue;

        const remainingTime = calculateRemainingTime(timer);
        const updatedAlerts = timer.alerts.map(alert => {
          if (!alert.isTriggered && !alert.isSilenced && now >= alert.triggerTime.getTime()) {
            // Déclencher l'alerte
            alertsTriggered++;
            
            // Callback personnalisé
            if (alert.callback) {
              alert.callback();
            }
            
            // Callback timer général
            if (alert.alertType === 'warning' && timer.onWarning) {
              timer.onWarning(remainingTime);
            }
            
            // Notifications système
            if (finalConfig.enableNotifications && 'Notification' in window) {
              new Notification(timer.name, {
                body: alert.message,
                icon: '/icons/timer-alert.png',
                badge: '/icons/timer-badge.png',
                tag: `timer-${timerId}-${alert.id}`,
                requireInteraction: alert.alertType === 'critical'
              });
            }

            log('Alerte déclenchée', {
              timerId,
              alertType: alert.alertType,
              message: alert.message,
              remainingTime: formatDuration(remainingTime)
            });

            return { ...alert, isTriggered: true };
          }
          return alert;
        });

        // Vérifier expiration
        if (remainingTime <= 0 && timer.status === 'active') {
          const expiredTimer = {
            ...timer,
            status: 'expired' as TimerStatus,
            endTime: new Date(),
            remainingTime: 0
          };

          if (timer.onExpire) {
            timer.onExpire();
          }

          // Notification d'expiration
          if (finalConfig.enableNotifications && 'Notification' in window) {
            new Notification(`${timer.name} - EXPIRÉ`, {
              body: 'Timer expiré - Action requise',
              icon: '/icons/timer-expired.png',
              requireInteraction: true,
              tag: `timer-expired-${timerId}`
            });
          }

          log('Timer expiré', { timerId, name: timer.name });
          newTimers.set(timerId, expiredTimer);
        } else {
          newTimers.set(timerId, { ...timer, alerts: updatedAlerts, remainingTime });
        }
      }

      return newTimers;
    });

    return alertsTriggered;
  }, [calculateRemainingTime, finalConfig.enableNotifications, formatDuration, log]);

  const silenceAlert = useCallback((timerId: string, alertId: string): boolean => {
    const timer = timers.get(timerId);
    if (!timer) return false;

    const updatedAlerts = timer.alerts.map(alert =>
      alert.id === alertId ? { ...alert, isSilenced: true } : alert
    );

    const updatedTimer = { ...timer, alerts: updatedAlerts };
    setTimers(prev => new Map(prev.set(timerId, updatedTimer)));
    
    log('Alerte masquée', { timerId, alertId });
    return true;
  }, [timers, log]);

  // =================== PLANIFICATION ===================

  const scheduleTask = useCallback((
    name: string,
    type: TaskType,
    scheduleType: 'once' | 'recurring',
    nextExecution: Date,
    callback: () => void | Promise<void>,
    cronExpression?: string
  ): string => {
    const taskId = generateId();
    
    const task: ScheduledTask = {
      id: taskId,
      name,
      type,
      scheduleType,
      cronExpression,
      nextExecution,
      isActive: true,
      callback,
      metadata: {}
    };

    setScheduledTasks(prev => new Map(prev.set(taskId, task)));
    
    log('Tâche planifiée', {
      id: taskId,
      name,
      type,
      nextExecution: nextExecution.toISOString()
    });

    return taskId;
  }, [generateId, log]);

  const cancelScheduledTask = useCallback((taskId: string): boolean => {
    const success = scheduledTasks.has(taskId);
    if (success) {
      setScheduledTasks(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      log('Tâche planifiée annulée', taskId);
    }
    return success;
  }, [scheduledTasks, log]);

  // =================== STATISTIQUES ===================

  const getTimerStats = useCallback((): TimerStats => {
    const allTimers = Array.from(timers.values());
    const activeTimers = allTimers.filter(t => t.status === 'active');
    const expiredTimers = allTimers.filter(t => t.status === 'expired');
    
    const criticalAlerts = allTimers.reduce((count, timer) => 
      count + timer.alerts.filter(a => a.alertType === 'critical' && a.isTriggered && !a.isSilenced).length, 0
    );
    
    const pendingAlerts = allTimers.reduce((count, timer) => 
      count + timer.alerts.filter(a => !a.isTriggered && !a.isSilenced).length, 0
    );

    const totalDuration = allTimers.reduce((sum, timer) => sum + timer.duration, 0);
    const averageDuration = allTimers.length > 0 ? totalDuration / allTimers.length : 0;

    const longestRunning = activeTimers.reduce((longest, timer) => {
      const elapsed = Date.now() - timer.startTime.getTime();
      return (!longest || elapsed > (Date.now() - longest.startTime.getTime())) ? timer : longest;
    }, null as Timer | null);

    const upcomingExpirations = activeTimers
      .filter(t => t.remainingTime <= 24 * 60 * 60 * 1000) // 24h
      .sort((a, b) => a.remainingTime - b.remainingTime)
      .slice(0, 5);

    return {
      activeTimers: activeTimers.length,
      expiredTimers: expiredTimers.length,
      totalTimers: allTimers.length,
      criticalAlerts,
      pendingAlerts,
      averageDuration,
      longestRunning,
      upcomingExpirations
    };
  }, [timers]);

  // =================== UTILITAIRES ===================

  const getTimer = useCallback((timerId: string): Timer | undefined => {
    return timers.get(timerId);
  }, [timers]);

  const getTimersByType = useCallback((type: TimerType): Timer[] => {
    return Array.from(timers.values()).filter(timer => timer.type === type);
  }, [timers]);

  const getTimersByContext = useCallback((context: TimerContext): Timer[] => {
    return Array.from(timers.values()).filter(timer => timer.context === context);
  }, [timers]);

  const getActiveTimers = useCallback((): Timer[] => {
    return Array.from(timers.values()).filter(timer => timer.status === 'active');
  }, [timers]);

  const clearExpiredTimers = useCallback((): number => {
    const expiredTimers = Array.from(timers.values()).filter(timer => timer.status === 'expired');
    
    setTimers(prev => {
      const newMap = new Map(prev);
      expiredTimers.forEach(timer => newMap.delete(timer.id));
      return newMap;
    });

    log('Timers expirés nettoyés', { count: expiredTimers.length });
    return expiredTimers.length;
  }, [timers, log]);

  // =================== TEMPLATES RAPIDES ===================

  const createPermitValidityTimer = useCallback((permitId: string, duration?: number) => {
    return createTimer('permit_validity', {
      duration: duration || 8 * 60 * 60 * 1000, // 8h par défaut
      metadata: { permitId, description: `Validité permis ${permitId}` }
    });
  }, [createTimer]);

  const createAtmosphericTestTimer = useCallback((spaceId: string) => {
    return createTimer('atmospheric_testing', {
      metadata: { spaceId, description: `Tests atmosphériques ${spaceId}` }
    });
  }, [createTimer]);

  const createCertificationExpiryTimer = useCallback((userId: string, certificationName: string, expiryDate: Date) => {
    const duration = expiryDate.getTime() - Date.now();
    return createTimer('certification_expiry', {
      duration,
      metadata: { userId, description: `Expiration ${certificationName}` }
    });
  }, [createTimer]);

  // =================== EFFETS ===================

  // Boucle principale des timers
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Mettre à jour les temps restants
      setTimers(prev => {
        const newTimers = new Map(prev);
        let hasChanges = false;

        for (const [timerId, timer] of newTimers.entries()) {
          if (timer.status === 'active') {
            const newRemainingTime = calculateRemainingTime(timer);
            if (newRemainingTime !== timer.remainingTime) {
              newTimers.set(timerId, { ...timer, remainingTime: newRemainingTime });
              hasChanges = true;
            }
          }
        }

        return hasChanges ? newTimers : prev;
      });
    }, 1000); // Mise à jour chaque seconde

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, calculateRemainingTime]);

  // Vérification des alertes
  useEffect(() => {
    if (!isRunning) return;

    alertIntervalRef.current = setInterval(() => {
      checkAndTriggerAlerts();
    }, 5000); // Vérifier alertes toutes les 5 secondes

    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, [isRunning, checkAndTriggerAlerts]);

  // Nettoyage automatique
  useEffect(() => {
    if (!finalConfig.autoCleanupExpired) return;

    const cleanupInterval = setInterval(() => {
      clearExpiredTimers();
    }, 60 * 60 * 1000); // Nettoyage chaque heure

    return () => clearInterval(cleanupInterval);
  }, [finalConfig.autoCleanupExpired, clearExpiredTimers]);

  // Demander permission notifications
  useEffect(() => {
    if (finalConfig.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        log('Permission notifications', permission);
      });
    }
  }, [finalConfig.enableNotifications, log]);

  // =================== CONTRÔLES ===================

  const startTimers = useCallback(() => {
    setIsRunning(true);
    log('Timers démarrés');
  }, [log]);

  const stopTimers = useCallback(() => {
    setIsRunning(false);
    log('Timers arrêtés');
  }, [log]);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    timers: Array.from(timers.values()),
    scheduledTasks: Array.from(scheduledTasks.values()),
    isRunning,

    // Gestion timers
    createTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer,
    deleteTimer,

    // Templates rapides
    createPermitValidityTimer,
    createAtmosphericTestTimer,
    createCertificationExpiryTimer,

    // Alertes
    silenceAlert,

    // Planification
    scheduleTask,
    cancelScheduledTask,

    // Recherche et filtres
    getTimer,
    getTimersByType,
    getTimersByContext,
    getActiveTimers,

    // Statistiques
    getTimerStats,

    // Utilitaires
    clearExpiredTimers,
    formatDuration,
    startTimers,
    stopTimers,

    // Configuration
    config: finalConfig,

    // Templates disponibles
    availableTypes: Object.keys(TIMER_TEMPLATES) as TimerType[]
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseTimersReturn = ReturnType<typeof useTimers>;

export default useTimers;
