"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Activity, Shield, Plus, AlertTriangle, FileText, Thermometer,
  Volume2, Gauge, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock
} from 'lucide-react';

// =================== DÉTECTION MOBILE ET STYLES IDENTIQUES AU CODE ORIGINAL ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '6px' : '8px',
    padding: isMobile ? '10px 12px' : '14px',
    width: '100%',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'textfield' as const
  },
  button: {
    padding: isMobile ? '8px 12px' : '14px 24px',
    borderRadius: isMobile ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    boxSizing: 'border-box' as const,
    width: '100%',
    justifyContent: 'center' as const
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: isMobile ? '13px' : '15px',
    fontWeight: '500',
    marginBottom: isMobile ? '4px' : '8px'
  },
  cardTitle: {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: isMobile ? '12px' : '20px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '12px'
  },
  readingCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease'
  },
  readingSafe: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  readingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  readingDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
  }
};

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface AtmosphericLimits {
  oxygen: {
    min: number;
    max: number;
    critical_low: number;
    critical_high: number;
  };
  lel: {
    max: number;
    critical: number;
  };
  h2s: {
    max: number;
    critical: number;
  };
  co: {
    max: number;
    critical: number;
  };
}

interface AtmosphericReading {
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
  timer_remaining?: number;
  timer_active?: boolean;
  next_test_due?: string;
}

// Session de test pour un niveau spécifique
interface AtmosphericSession {
  id: string;
  timestamp: string;
  reading: AtmosphericReading;
  timer_remaining?: number;
  timer_active: boolean;
  status: 'active' | 'expired' | 'completed';
  next_test_due?: string;
}

// Données groupées par niveau
interface LevelData {
  level: 'top' | 'middle' | 'bottom';
  sessions: AtmosphericSession[];
  current_timer?: number;
  needs_retest: boolean;
  last_reading?: AtmosphericReading;
  timer_active: boolean;
}

interface RegulationData {
  name: string;
  authority: string;
  authority_phone: string;
  code: string;
  url?: string;
  atmospheric_testing: {
    frequency_minutes: number;
    continuous_monitoring_required?: boolean;
    documentation_required?: boolean;
    limits: AtmosphericLimits;
  };
  personnel_requirements: {
    min_age: number;
    attendant_required: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
}

interface AtmosphericTestingProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  atmosphericReadings: AtmosphericReading[];
  setAtmosphericReadings: (readings: AtmosphericReading[] | ((prev: AtmosphericReading[]) => AtmosphericReading[])) => void;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
  // Nouvelles props pour communication avec EntryRegistry
  personnelStatus?: {
    totalPersonnel: number;
    personnelInside: number;
    surveillantActive: boolean;
  };
  onRetestRequired?: (level: string, timeRemaining: number) => void;
  onEmergencyEvacuation?: (level: string, reason: string) => void;
  onSafetyAlert?: (alert: any) => void;
}
// AtmosphericTesting.tsx - Section 2

const AtmosphericTesting: React.FC<AtmosphericTestingProps> = ({
  data,
  onChange,
  regulations,
  safetyManager
}) => {
  // =================== ÉTATS LOCAUX ===================
  const [isMobile, setIsMobile] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newLevelDepth, setNewLevelDepth] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentReading, setCurrentReading] = useState<AtmosphereReading>({
    oxygen: '',
    combustible: '',
    hydrogen_sulfide: '',
    carbon_monoxide: '',
    temperature: '',
    notes: ''
  });
  const [testTimers, setTestTimers] = useState<{ [key: string]: TestTimer }>({});
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Refs pour les alarmes sonores
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const evacuationAlarmRef = useRef<HTMLAudioElement | null>(null);

  // =================== DÉTECTION MOBILE ===================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // =================== AUDIO CONTEXT ===================
  useEffect(() => {
    const initAudio = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    };

    initAudio();
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // =================== FONCTIONS UTILITAIRES ===================
  const getRetestInterval = (): number => {
    const interval = regulations?.testing?.atmosphere?.retest_interval;
    if (typeof interval === 'string') {
      return parseInt(interval) * 60; // Convert minutes to seconds
    }
    return interval || 1800; // Default 30 minutes
  };

  const generateTimerKey = (levelIndex: number, testIndex: number): string => {
    return `level_${levelIndex}_test_${testIndex}`;
  };

  const playAlarmSound = (type: 'warning' | 'evacuation' = 'warning') => {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'evacuation') {
        // Alarme d'évacuation : son plus aigu et plus fort
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
      } else {
        // Alarme normale : son standard
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Répéter l'alarme plusieurs fois pour évacuation
      if (type === 'evacuation') {
        setTimeout(() => playAlarmSound('evacuation'), 600);
        setTimeout(() => playAlarmSound('evacuation'), 1200);
      }
    } catch (error) {
      console.warn('Cannot play alarm sound:', error);
    }
  };

  const showNotification = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Test Atmosphérique - ${type.toUpperCase()}`, {
        body: message,
        icon: type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️'
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // =================== GESTION DES TIMERS ===================
  const startTestTimer = (levelIndex: number, testIndex: number) => {
    const timerKey = generateTimerKey(levelIndex, testIndex);
    const interval = getRetestInterval();
    
    const timer: TestTimer = {
      levelIndex,
      testIndex,
      startTime: Date.now(),
      interval,
      remaining: interval,
      isActive: true,
      hasWarned: false
    };

    setTestTimers(prev => ({
      ...prev,
      [timerKey]: timer
    }));

    // Démarrer le compte à rebours
    const countdownInterval = setInterval(() => {
      setTestTimers(prev => {
        const currentTimer = prev[timerKey];
        if (!currentTimer || !currentTimer.isActive) {
          clearInterval(countdownInterval);
          return prev;
        }

        const elapsed = Math.floor((Date.now() - currentTimer.startTime) / 1000);
        const remaining = Math.max(0, currentTimer.interval - elapsed);

        // Alarme à 1 minute
        if (remaining <= 60 && !currentTimer.hasWarned) {
          playAlarmSound('warning');
          showNotification(`⚠️ Retest requis dans 1 minute pour le niveau ${levelIndex + 1}`, 'warning');
          currentTimer.hasWarned = true;
        }

        // Timer expiré - démarrer auto-retest
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          handleAutoRetest(levelIndex);
          return prev;
        }

        return {
          ...prev,
          [timerKey]: {
            ...currentTimer,
            remaining
          }
        };
      });
    }, 1000);
  };

  const stopTestTimer = (levelIndex: number, testIndex: number) => {
    const timerKey = generateTimerKey(levelIndex, testIndex);
    setTestTimers(prev => {
      const newTimers = { ...prev };
      if (newTimers[timerKey]) {
        newTimers[timerKey].isActive = false;
      }
      return newTimers;
    });
  };

  const handleAutoRetest = (levelIndex: number) => {
    showNotification(`🔄 Auto-retest démarré pour le niveau ${levelIndex + 1}`, 'warning');
    playAlarmSound('warning');
    
    // Ouvrir automatiquement le modal de test
    setSelectedLevel(levelIndex);
    setShowTestModal(true);
  };

  // =================== VALIDATION DES LECTURES ===================
  const validateReading = (reading: AtmosphereReading): { isValid: boolean; hasFailures: boolean; failures: string[] } => {
    const failures: string[] = [];
    let isValid = true;

    const oxygen = parseFloat(reading.oxygen);
    const combustible = parseFloat(reading.combustible);
    const h2s = parseFloat(reading.hydrogen_sulfide);
    const co = parseFloat(reading.carbon_monoxide);

    // Validation selon les standards OSHA/CSA
    if (isNaN(oxygen) || oxygen < 19.5 || oxygen > 23.5) {
      failures.push(`Oxygène: ${reading.oxygen}% (Normal: 19.5-23.5%)`);
      isValid = false;
    }

    if (isNaN(combustible) || combustible > 10) {
      failures.push(`Combustible: ${reading.combustible}% LIE (Max: 10%)`);
      isValid = false;
    }

    if (isNaN(h2s) || h2s > 10) {
      failures.push(`H₂S: ${reading.hydrogen_sulfide} ppm (Max: 10 ppm)`);
      isValid = false;
    }

    if (isNaN(co) || co > 35) {
      failures.push(`CO: ${reading.carbon_monoxide} ppm (Max: 35 ppm)`);
      isValid = false;
    }

    return {
      isValid,
      hasFailures: failures.length > 0,
      failures
    };
  };

  // =================== GESTION DES NIVEAUX ===================
  const addLevel = () => {
    if (!newLevelDepth.trim()) return;

    const newLevel: TestingLevel = {
      depth: newLevelDepth.trim(),
      readings: []
    };

    const updatedData = {
      ...data,
      levels: [...data.levels, newLevel]
    };

    onChange(updatedData);
    setNewLevelDepth('');
    setShowAddLevelModal(false);
    setActiveLevel(updatedData.levels.length - 1);
  };

  const removeLevel = (index: number) => {
    if (data.levels.length <= 1) return;

    const updatedData = {
      ...data,
      levels: data.levels.filter((_, i) => i !== index)
    };

    onChange(updatedData);
    
    if (activeLevel >= updatedData.levels.length) {
      setActiveLevel(Math.max(0, updatedData.levels.length - 1));
    }
  };
  // AtmosphericTesting.tsx - Section 3

  // =================== GESTION DES TESTS ===================
  const saveTest = () => {
    if (!selectedLevel === null || selectedLevel < 0) return;

    const validation = validateReading(currentReading);
    
    const newReading: AtmosphereReading = {
      ...currentReading,
      timestamp: new Date().toISOString(),
      tester: data.tester || 'Non spécifié',
      status: validation.isValid ? 'pass' : 'fail',
      failures: validation.hasFailures ? validation.failures : undefined
    };

    const updatedLevels = [...data.levels];
    updatedLevels[selectedLevel].readings.push(newReading);
    
    const updatedData = {
      ...data,
      levels: updatedLevels
    };

    onChange(updatedData);

    // Démarrer le timer pour ce test
    const testIndex = updatedLevels[selectedLevel].readings.length - 1;
    startTestTimer(selectedLevel, testIndex);

    // Gestion des échecs
    if (!validation.isValid) {
      handleTestFailure(selectedLevel, newReading);
    } else {
      showNotification(`✅ Test réussi pour le niveau ${selectedLevel + 1}`, 'info');
    }

    // Reset et fermer
    setCurrentReading({
      oxygen: '',
      combustible: '',
      hydrogen_sulfide: '',
      carbon_monoxide: '',
      temperature: '',
      notes: ''
    });
    setShowTestModal(false);
    setSelectedLevel(null);
  };

  const handleTestFailure = (levelIndex: number, failedReading: AtmosphereReading) => {
    const levelName = `Niveau ${levelIndex + 1}`;
    
    // Vérifier s'il y a du personnel dans l'espace clos
    const hasPersonnelInside = safetyManager?.hasPersonnelInside();
    
    if (hasPersonnelInside) {
      // ÉVACUATION IMMÉDIATE
      playAlarmSound('evacuation');
      showNotification(`🚨 ÉVACUATION IMMÉDIATE - Test atmosphérique échoué au ${levelName}`, 'error');
      
      // Informer le SafetyManager pour déclencher l'évacuation
      if (safetyManager) {
        safetyManager.triggerEvacuation(`Test atmosphérique échoué - ${levelName}`, failedReading.failures || []);
      }
    } else {
      // Pas de personnel - juste une alerte de reprise
      playAlarmSound('warning');
      showNotification(`⚠️ Test échoué au ${levelName} - Reprise automatique dans 15 minutes`, 'warning');
      
      // Programmer un retest automatique dans 15 minutes
      setTimeout(() => {
        showNotification(`🔄 Reprise automatique - Test requis pour le ${levelName}`, 'warning');
        setSelectedLevel(levelIndex);
        setShowTestModal(true);
      }, 15 * 60 * 1000); // 15 minutes
    }
  };

  const retestLevel = (levelIndex: number) => {
    // Arrêter le timer actuel s'il existe
    const lastTestIndex = data.levels[levelIndex].readings.length - 1;
    if (lastTestIndex >= 0) {
      stopTestTimer(levelIndex, lastTestIndex);
    }
    
    setSelectedLevel(levelIndex);
    setShowTestModal(true);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // =================== RENDU COMPONENT ===================
  return (
    <div className="space-y-6">
      {/* Header avec informations */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          <Wind className="w-5 h-5 inline mr-2" />
          Tests Atmosphériques Continus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Intervalle de retest:</span>
            <span className="ml-2">{Math.round(getRetestInterval() / 60)} minutes</span>
          </div>
          <div>
            <span className="font-medium">Testeur:</span>
            <span className="ml-2">{data.tester || 'Non spécifié'}</span>
          </div>
          <div>
            <span className="font-medium">Niveaux testés:</span>
            <span className="ml-2">{data.levels.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation des niveaux */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Niveaux:</span>
        {data.levels.map((level, index) => {
          const lastReading = level.readings[level.readings.length - 1];
          const timerKey = generateTimerKey(index, level.readings.length - 1);
          const timer = testTimers[timerKey];
          
          return (
            <button
              key={index}
              onClick={() => setActiveLevel(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeLevel === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.depth}
              {lastReading && (
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  lastReading.status === 'pass' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              )}
              {timer && timer.isActive && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-orange-200 rounded">
                  <div 
                    className="h-full bg-orange-500 rounded transition-all duration-1000"
                    style={{ width: `${(timer.remaining / timer.interval) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
        
        <button
          onClick={() => setShowAddLevelModal(true)}
          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Contenu du niveau actif */}
      {data.levels[activeLevel] && (
        <div className="space-y-4">
          {/* Header du niveau */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              Niveau {activeLevel + 1}: {data.levels[activeLevel].depth}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => retestLevel(activeLevel)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Nouveau Test
              </button>
              {data.levels.length > 1 && (
                <button
                  onClick={() => removeLevel(activeLevel)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Historique des tests avec timers intégrés */}
          <div className="space-y-3">
            {data.levels[activeLevel].readings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wind className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun test effectué pour ce niveau</p>
                <button
                  onClick={() => retestLevel(activeLevel)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Effectuer le premier test
                </button>
              </div>
            ) : (
              data.levels[activeLevel].readings.map((reading, testIndex) => {
                const timerKey = generateTimerKey(activeLevel, testIndex);
                const timer = testTimers[timerKey];
                const isLatestTest = testIndex === data.levels[activeLevel].readings.length - 1;
                
                return (
                  <div
                    key={testIndex}
                    className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(reading.status || 'pending')} ${
                      isLatestTest ? 'ring-2 ring-blue-200' : ''
                    }`}
                  >
                    {/* Header du test avec timer */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reading.status || 'pending')}
                        <span className="font-medium">
                          Test #{testIndex + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {reading.timestamp ? new Date(reading.timestamp).toLocaleString() : 'En cours...'}
                        </span>
                      </div>
                      
                      {/* Timer intégré */}
                      {timer && timer.isActive && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          timer.remaining <= 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-orange-100 text-orange-700'
                        }`}>
                          <Clock className="w-4 h-4 inline mr-1" />
                          Retest dans {formatTime(timer.remaining)}
                        </div>
                      )}
                    </div>

                    {/* Données du test */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">O₂:</span>
                        <span className={`ml-2 ${
                          reading.oxygen && (parseFloat(reading.oxygen) < 19.5 || parseFloat(reading.oxygen) > 23.5) 
                            ? 'text-red-600 font-semibold' : 'text-green-600'
                        }`}>
                          {reading.oxygen || '--'}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">LEL:</span>
                        <span className={`ml-2 ${
                          reading.combustible && parseFloat(reading.combustible) > 10 
                            ? 'text-red-600 font-semibold' : 'text-green-600'
                        }`}>
                          {reading.combustible || '--'}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">H₂S:</span>
                        <span className={`ml-2 ${
                          reading.hydrogen_sulfide && parseFloat(reading.hydrogen_sulfide) > 10 
                            ? 'text-red-600 font-semibold' : 'text-green-600'
                        }`}>
                          {reading.hydrogen_sulfide || '--'} ppm
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">CO:</span>
                        <span className={`ml-2 ${
                          reading.carbon_monoxide && parseFloat(reading.carbon_monoxide) > 35 
                            ? 'text-red-600 font-semibold' : 'text-green-600'
                        }`}>
                          {reading.carbon_monoxide || '--'} ppm
                        </span>
                      </div>
                    </div>

                    {/* Échecs si présents */}
                    {reading.failures && reading.failures.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">Paramètres en échec:</span>
                        </div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {reading.failures.map((failure, idx) => (
                            <li key={idx}>• {failure}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {reading.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {reading.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal d'ajout de niveau */}
      {showAddLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un niveau de test</h3>
            <input
              type="text"
              value={newLevelDepth}
              onChange={(e) => setNewLevelDepth(e.target.value)}
              placeholder="Ex: Surface, -3m, -6m, Fond"
              className="w-full p-3 border rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && addLevel()}
            />
            <div className="flex gap-3">
              <button
                onClick={addLevel}
                disabled={!newLevelDepth.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowAddLevelModal(false);
                  setNewLevelDepth('');
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de test */}
      {showTestModal && selectedLevel !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Nouveau test - {data.levels[selectedLevel]?.depth}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygène (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentReading.oxygen}
                  onChange={(e) => setCurrentReading(prev => ({...prev, oxygen: e.target.value}))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="19.5 - 23.5"
                />
                <span className="text-xs text-gray-500">Normal: 19.5-23.5%</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Combustible (% LIE) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentReading.combustible}
                  onChange={(e) => setCurrentReading(prev => ({...prev, combustible: e.target.value}))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="< 10"
                />
                <span className="text-xs text-gray-500">Maximum: 10% LIE</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  H₂S (ppm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentReading.hydrogen_sulfide}
                  onChange={(e) => setCurrentReading(prev => ({...prev, hydrogen_sulfide: e.target.value}))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="< 10"
                />
                <span className="text-xs text-gray-500">Maximum: 10 ppm</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CO (ppm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentReading.carbon_monoxide}
                  onChange={(e) => setCurrentReading(prev => ({...prev, carbon_monoxide: e.target.value}))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="< 35"
                />
                <span className="text-xs text-gray-500">Maximum: 35 ppm</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Température (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentReading.temperature}
                  onChange={(e) => setCurrentReading(prev => ({...prev, temperature: e.target.value}))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Optionnel"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={currentReading.notes}
                onChange={(e) => setCurrentReading(prev => ({...prev, notes: e.target.value}))}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Observations, conditions particulières..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={saveTest}
                disabled={!currentReading.oxygen || !currentReading.combustible || !currentReading.hydrogen_sulfide || !currentReading.carbon_monoxide}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Enregistrer le test
              </button>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setSelectedLevel(null);
                  setCurrentReading({
                    oxygen: '',
                    combustible: '',
                    hydrogen_sulfide: '',
                    carbon_monoxide: '',
                    temperature: '',
                    notes: ''
                  });
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtmosphericTesting;
