// =================== COMPONENTS/TIMERSURVEILLANCE.TSX - MONITORING TEMPS RÉEL MOBILE-FIRST ===================
// Composant surveillance temps réel avec notifications, alertes et check-ins automatiques

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Pause, 
  Play, 
  StopCircle,
  Timer,
  Zap,
  Activity,
  PhoneCall,
  MessageSquare,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2,
  Battery,
  Wifi,
  Signal
} from 'lucide-react';
import { StatusBadge, useSmartStatus } from './StatusBadge';

// =================== TYPES ===================
export interface TimerConfig {
  permitId: string;
  permitType: string;
  workingTime: number; // minutes
  warningTime: number; // minutes before expiry
  criticalTime: number; // minutes before expiry
  checkInInterval: number; // minutes
  autoExtendEnabled: boolean;
  autoExtendDuration: number; // minutes
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: number; // 1 = primary
  autoCall: boolean;
  autoSms: boolean;
}

export interface TimerAlert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'emergency';
  title: { fr: string; en: string };
  message: { fr: string; en: string };
  timestamp: Date;
  acknowledged: boolean;
  autoResolve: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: { fr: string; en: string };
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export interface CheckInEvent {
  id: string;
  timestamp: Date;
  type: 'automatic' | 'manual' | 'emergency';
  status: 'ok' | 'delayed' | 'missed' | 'emergency';
  location?: { lat: number; lng: number };
  notes?: string;
  acknowledgedBy?: string;
}

export interface TimerSurveillanceProps {
  config: TimerConfig;
  language: 'fr' | 'en';
  isActive: boolean;
  onTimerExpired: () => void;
  onEmergencyTriggered: () => void;
  onCheckInMissed: (event: CheckInEvent) => void;
  onAlertGenerated: (alert: TimerAlert) => void;
  touchOptimized?: boolean;
  fullScreen?: boolean;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
}

// =================== CONFIGURATION ALERTES ===================
const ALERT_TYPES = {
  'check-in-due': {
    type: 'info' as const,
    title: { fr: 'Check-in requis', en: 'Check-in required' },
    sound: 'notification',
    vibration: [100, 50, 100]
  },
  'check-in-overdue': {
    type: 'warning' as const,
    title: { fr: 'Check-in en retard', en: 'Check-in overdue' },
    sound: 'warning',
    vibration: [200, 100, 200, 100, 200]
  },
  'permit-warning': {
    type: 'warning' as const,
    title: { fr: 'Permis expire bientôt', en: 'Permit expiring soon' },
    sound: 'warning',
    vibration: [150, 75, 150, 75, 150]
  },
  'permit-critical': {
    type: 'critical' as const,
    title: { fr: 'Permis expire!', en: 'Permit expiring!' },
    sound: 'critical',
    vibration: [300, 150, 300, 150, 300]
  },
  'permit-expired': {
    type: 'emergency' as const,
    title: { fr: 'PERMIS EXPIRÉ', en: 'PERMIT EXPIRED' },
    sound: 'emergency',
    vibration: [500, 200, 500, 200, 500, 200, 500]
  },
  'emergency-triggered': {
    type: 'emergency' as const,
    title: { fr: 'URGENCE DÉCLENCHÉE', en: 'EMERGENCY TRIGGERED' },
    sound: 'emergency',
    vibration: [1000, 500, 1000, 500, 1000]
  }
};

// =================== HOOKS PERSONNALISÉS ===================
const useTimer = (initialTime: number, isActive: boolean) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(!isActive);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, timeRemaining]);

  const toggle = () => setIsPaused(!isPaused);
  const reset = (newTime?: number) => {
    setTimeRemaining((newTime ?? initialTime) * 60);
    setIsPaused(false);
  };

  return { timeRemaining, isPaused, toggle, reset };
};

const useCheckIn = (interval: number, isActive: boolean, onMissed: (event: CheckInEvent) => void) => {
  const [lastCheckIn, setLastCheckIn] = useState<Date>(new Date());
  const [nextCheckInDue, setNextCheckInDue] = useState<Date>(new Date(Date.now() + interval * 60 * 1000));
  const [missedCheckIns, setMissedCheckIns] = useState<CheckInEvent[]>([]);
  const checkInTimeoutRef = useRef<NodeJS.Timeout>();

  const performCheckIn = useCallback((type: 'manual' | 'automatic' = 'manual', notes?: string) => {
    const now = new Date();
    const checkInEvent: CheckInEvent = {
      id: `checkin_${Date.now()}`,
      timestamp: now,
      type,
      status: 'ok',
      notes,
      acknowledgedBy: type === 'manual' ? 'user' : 'system'
    };

    setLastCheckIn(now);
    setNextCheckInDue(new Date(now.getTime() + interval * 60 * 1000));
    
    return checkInEvent;
  }, [interval]);

  useEffect(() => {
    if (!isActive) return;

    const checkForMissedCheckIn = () => {
      const now = new Date();
      if (now > nextCheckInDue) {
        const missedEvent: CheckInEvent = {
          id: `missed_${Date.now()}`,
          timestamp: now,
          type: 'automatic',
          status: 'missed'
        };
        
        setMissedCheckIns(prev => [...prev, missedEvent]);
        onMissed(missedEvent);
        
        // Schedule next check-in
        setNextCheckInDue(new Date(now.getTime() + interval * 60 * 1000));
      }
    };

    checkInTimeoutRef.current = setInterval(checkForMissedCheckIn, 30000); // Check every 30 seconds

    return () => {
      if (checkInTimeoutRef.current) {
        clearInterval(checkInTimeoutRef.current);
      }
    };
  }, [interval, isActive, nextCheckInDue, onMissed]);

  return {
    lastCheckIn,
    nextCheckInDue,
    missedCheckIns,
    performCheckIn,
    timeUntilNextCheckIn: Math.max(0, nextCheckInDue.getTime() - Date.now())
  };
};

// =================== COMPOSANT PRINCIPAL ===================
export const TimerSurveillance: React.FC<TimerSurveillanceProps> = ({
  config,
  language,
  isActive,
  onTimerExpired,
  onEmergencyTriggered,
  onCheckInMissed,
  onAlertGenerated,
  touchOptimized = true,
  fullScreen = false,
  soundEnabled = true,
  notificationsEnabled = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [alerts, setAlerts] = useState<TimerAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled,
    notificationsEnabled,
    vibrationsEnabled: true,
    autoCheckIn: false
  });
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    signal: 'strong' as 'strong' | 'weak' | 'none'
  });

  // =================== CUSTOM HOOKS ===================
  const { timeRemaining, isPaused, toggle: toggleTimer, reset: resetTimer } = useTimer(config.workingTime, isActive);
  const { 
    lastCheckIn, 
    nextCheckInDue, 
    missedCheckIns, 
    performCheckIn, 
    timeUntilNextCheckIn 
  } = useCheckIn(config.checkInInterval, isActive, onCheckInMissed);

  // =================== AUDIO CONTEXT ===================
  const audioContextRef = useRef<AudioContext>();
  const oscillatorRef = useRef<OscillatorNode>();

  // =================== FORMATAGE TEMPS ===================
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // =================== GESTION ALERTES ===================
  const createAlert = useCallback((alertType: keyof typeof ALERT_TYPES, customMessage?: string) => {
    const alertConfig = ALERT_TYPES[alertType];
    const alert: TimerAlert = {
      id: `alert_${Date.now()}`,
      type: alertConfig.type,
      title: alertConfig.title,
      message: { 
        fr: customMessage || `Alerte ${alertType}`, 
        en: customMessage || `Alert ${alertType}` 
      },
      timestamp: new Date(),
      acknowledged: false,
      autoResolve: alertConfig.type === 'info'
    };

    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep only 10 most recent
    onAlertGenerated(alert);

    // Feedback sonore
    if (settings.soundEnabled) {
      playAlertSound(alertConfig.sound);
    }

    // Feedback haptic
    if (settings.vibrationsEnabled && navigator.vibrate) {
      navigator.vibrate(alertConfig.vibration);
    }

    // Notification push
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title[language], {
  body: alert.message[language],
  icon: '/timer-icon.png',
  tag: alert.id
});

if (navigator.vibrate && alertConfig.vibration) {
  navigator.vibrate(alertConfig.vibration);
}

    return alert;
  }, [language, settings, onAlertGenerated]);

  const playAlertSound = useCallback((soundType: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configuration selon type d'alerte
    switch (soundType) {
      case 'notification':
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'warning':
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'critical':
        // Double beep
        for (let i = 0; i < 2; i++) {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 1200;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            osc.start();
            osc.stop(audioContext.currentTime + 0.3);
          }, i * 400);
        }
        break;
      case 'emergency':
        // Sirène
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1);
        break;
    }
  }, []);

  // =================== SURVEILLANCE AUTOMATIQUE ===================
  useEffect(() => {
    if (!isActive) return;

    const warningThreshold = config.warningTime * 60; // seconds
    const criticalThreshold = config.criticalTime * 60; // seconds

    if (timeRemaining <= 0) {
      createAlert('permit-expired');
      onTimerExpired();
    } else if (timeRemaining <= criticalThreshold) {
      createAlert('permit-critical', 
        language === 'fr' 
          ? `Permis expire dans ${formatTime(timeRemaining)}!`
          : `Permit expires in ${formatTime(timeRemaining)}!`
      );
    } else if (timeRemaining <= warningThreshold) {
      createAlert('permit-warning',
        language === 'fr'
          ? `Permis expire dans ${formatTime(timeRemaining)}`
          : `Permit expires in ${formatTime(timeRemaining)}`
      );
    }
  }, [timeRemaining, isActive, config.warningTime, config.criticalTime, createAlert, onTimerExpired, formatTime, language]);

  // =================== CHECK-IN SURVEILLANCE ===================
  useEffect(() => {
    if (!isActive) return;

    const checkInWarningThreshold = 5 * 60 * 1000; // 5 minutes before due
    const timeUntilCheckIn = timeUntilNextCheckIn;

    if (timeUntilCheckIn <= 0) {
      createAlert('check-in-overdue');
    } else if (timeUntilCheckIn <= checkInWarningThreshold) {
      createAlert('check-in-due');
    }
  }, [timeUntilNextCheckIn, isActive, createAlert]);

  // =================== NETWORK MONITORING ===================
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, online: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =================== CALCULS PROGRESS ===================
  const progress = useMemo(() => {
    const totalTime = config.workingTime * 60;
    const elapsed = totalTime - timeRemaining;
    return (elapsed / totalTime) * 100;
  }, [timeRemaining, config.workingTime]);

  const checkInProgress = useMemo(() => {
    const totalInterval = config.checkInInterval * 60 * 1000;
    const elapsed = totalInterval - timeUntilNextCheckIn;
    return (elapsed / totalInterval) * 100;
  }, [timeUntilNextCheckIn, config.checkInInterval]);

  // =================== ACTIONS ===================
  const handleEmergency = useCallback(() => {
    createAlert('emergency-triggered');
    onEmergencyTriggered();
    
    // Auto-call emergency contacts
    const primaryContact = config.emergencyContacts.find(c => c.priority === 1 && c.autoCall);
    if (primaryContact) {
      window.open(`tel:${primaryContact.phone}`);
    }
  }, [createAlert, onEmergencyTriggered, config.emergencyContacts]);

  const handleCheckIn = useCallback(() => {
    const event = performCheckIn('manual');
    createAlert('check-in-due', 
      language === 'fr' 
        ? 'Check-in effectué avec succès'
        : 'Check-in completed successfully'
    );
  }, [performCheckIn, createAlert, language]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  // =================== COMPOSANT TIMER PRINCIPAL ===================
  const TimerDisplay = () => (
    <div className="text-center">
      <motion.div
        className={`text-6xl font-mono font-bold ${
          timeRemaining <= config.criticalTime * 60 ? 'text-red-600' : 
          timeRemaining <= config.warningTime * 60 ? 'text-orange-600' : 'text-green-600'
        }`}
        animate={timeRemaining <= config.criticalTime * 60 ? {
          scale: [1, 1.1, 1],
          transition: { duration: 1, repeat: Infinity }
        } : {}}
      >
        {formatTime(timeRemaining)}
      </motion.div>
      
      <div className="mt-2 text-lg text-gray-600">
        {language === 'fr' ? 'Temps restant' : 'Time remaining'}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className={`h-3 rounded-full transition-colors duration-500 ${
            timeRemaining <= config.criticalTime * 60 ? 'bg-red-500' : 
            timeRemaining <= config.warningTime * 60 ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );

  // =================== RENDU PRINCIPAL ===================
  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden
        ${fullScreen ? 'fixed inset-4 z-50' : 'w-full max-w-md mx-auto'}
        ${touchOptimized ? 'touch-manipulation select-none' : ''}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header avec status et contrôles */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: isActive ? '#10B981' : '#EF4444' }}
              animate={isActive ? {
                scale: [1, 1.2, 1],
                transition: { duration: 2, repeat: Infinity }
              } : {}}
            />
            <h3 className="font-semibold text-gray-900">
              {language === 'fr' ? 'Surveillance Permis' : 'Permit Monitoring'}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Network status */}
            <div className={`w-4 h-4 ${networkStatus.online ? 'text-green-500' : 'text-red-500'}`}>
              {networkStatus.online ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            
            {/* Settings */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
        
        <StatusBadge
          status={
            timeRemaining <= 0 ? 'expired' :
            timeRemaining <= config.criticalTime * 60 ? 'critical' :
            timeRemaining <= config.warningTime * 60 ? 'expiring-soon' : 'active'
          }
          language={language}
          timeRemaining={formatTime(timeRemaining)}
          showProgress={true}
          progressValue={progress}
          size="lg"
        />
      </div>

      {/* Timer principal */}
      <div className="p-6">
        <TimerDisplay />
        
        {/* Contrôles timer */}
        <div className="flex justify-center gap-3 mt-6">
          <motion.button
            onClick={toggleTimer}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${isPaused ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}
              min-h-[44px] min-w-[120px]
            `}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
            <span>{isPaused ? (language === 'fr' ? 'Reprendre' : 'Resume') : (language === 'fr' ? 'Pause' : 'Pause')}</span>
          </motion.button>
          
          <motion.button
            onClick={handleCheckIn}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors min-h-[44px] min-w-[120px]"
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={20} />
            <span>{language === 'fr' ? 'Check-in' : 'Check-in'}</span>
          </motion.button>
        </div>
        
        {/* Bouton urgence */}
        <motion.button
          onClick={handleEmergency}
          className="w-full mt-4 py-4 bg-red-600 text-white rounded-lg font-bold text-lg transition-colors min-h-[56px]"
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
              '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
              '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🚨 {language === 'fr' ? 'URGENCE' : 'EMERGENCY'}
        </motion.button>
      </div>

      {/* Informations check-in */}
      <div className="px-6 pb-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{language === 'fr' ? 'Prochain check-in:' : 'Next check-in:'}</span>
          <span className="font-mono">{formatTime(Math.floor(timeUntilNextCheckIn / 1000))}</span>
        </div>
        
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${checkInProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${checkInProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Alertes */}
      <AnimatePresence>
        {alerts.filter(alert => !alert.acknowledged).length > 0 && (
          <motion.div
            className="border-t border-gray-100 bg-red-50"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
          >
            <div className="p-4 space-y-2">
              {alerts.filter(alert => !alert.acknowledged).slice(0, 3).map(alert => (
                <motion.div
                  key={alert.id}
                  className={`
                    p-3 rounded-lg border-l-4 
                    ${alert.type === 'emergency' ? 'bg-red-100 border-red-500' :
                      alert.type === 'critical' ? 'bg-orange-100 border-orange-500' :
                      alert.type === 'warning' ? 'bg-yellow-100 border-yellow-500' :
                      'bg-blue-100 border-blue-500'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.title[language]}</p>
                      <p className="text-sm text-gray-600">{alert.message[language]}</p>
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-3 text-gray-400 hover:text-gray-600"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// =================== EXPORTS ===================
export default TimerSurveillance;
