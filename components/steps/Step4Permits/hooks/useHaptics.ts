// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USEHAPTICS.TS ===================
// Hook React pour feedback haptique natif et patterns personnalisés
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

// =================== INTERFACES ===================

export interface HapticConfig {
  isEnabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  duration: number; // milliseconds
  delay: number; // milliseconds between patterns
  maxPatternLength: number;
  enableWebVibration: boolean;
  enableiOSHaptics: boolean;
  enableAndroidVibration: boolean;
  respectUserPreferences: boolean;
  debugMode: boolean;
}

export interface HapticPattern {
  id: string;
  name: string;
  description: string;
  pattern: number[]; // Vibration pattern in ms [vibrate, pause, vibrate, pause...]
  intensity?: 'light' | 'medium' | 'heavy';
  category: 'feedback' | 'notification' | 'alert' | 'custom';
  context: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'navigation' | 'bluetooth' | 'atmospheric';
}

export interface HapticEvent {
  id: string;
  timestamp: Date;
  patternId: string;
  success: boolean;
  duration: number;
  context: string;
  deviceType: 'ios' | 'android' | 'web' | 'unknown';
  userAgent: string;
}

export interface HapticState {
  isSupported: boolean;
  isEnabled: boolean;
  isPlaying: boolean;
  currentPattern: string | null;
  lastEvent: HapticEvent | null;
  supportedMethods: HapticMethod[];
  deviceCapabilities: DeviceCapabilities;
  eventHistory: HapticEvent[];
}

export interface HapticMethod {
  type: 'vibration' | 'haptic' | 'gamepad';
  name: string;
  isSupported: boolean;
  api: string;
  limitations: string[];
}

export interface DeviceCapabilities {
  hasVibration: boolean;
  hasHapticEngine: boolean;
  hasGamepadVibration: boolean;
  maxIntensity: number;
  maxDuration: number;
  supportsCustomPatterns: boolean;
  platformSpecific: {
    ios: {
      hasHapticEngine: boolean;
      supportedTypes: string[];
    };
    android: {
      hasVibrator: boolean;
      supportsAmplitude: boolean;
      apiLevel: number;
    };
    web: {
      hasVibrationAPI: boolean;
      hasGamepadAPI: boolean;
    };
  };
}

// =================== PATTERNS PRÉDÉFINIS ===================

const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  // Feedback de base
  tap: {
    id: 'tap',
    name: 'Tap',
    description: 'Feedback tactile simple pour sélections',
    pattern: [10],
    intensity: 'light',
    category: 'feedback',
    context: 'selection'
  },
  
  click: {
    id: 'click',
    name: 'Click',
    description: 'Feedback pour boutons et interactions',
    pattern: [25],
    intensity: 'medium',
    category: 'feedback',
    context: 'selection'
  },
  
  double_tap: {
    id: 'double_tap',
    name: 'Double Tap',
    description: 'Double feedback rapide',
    pattern: [15, 50, 15],
    intensity: 'light',
    category: 'feedback',
    context: 'selection'
  },

  // Notifications de succès
  success: {
    id: 'success',
    name: 'Succès',
    description: 'Confirmation d\'action réussie',
    pattern: [30, 80, 15, 50, 40],
    intensity: 'medium',
    category: 'notification',
    context: 'success'
  },

  checkmark: {
    id: 'checkmark',
    name: 'Validation',
    description: 'Validation de formulaire ou étape',
    pattern: [20, 30, 60],
    intensity: 'medium',
    category: 'notification',
    context: 'success'
  },

  // Alertes et erreurs
  error: {
    id: 'error',
    name: 'Erreur',
    description: 'Feedback pour erreurs et échecs',
    pattern: [100, 50, 100, 50, 100],
    intensity: 'heavy',
    category: 'alert',
    context: 'error'
  },

  warning: {
    id: 'warning',
    name: 'Avertissement',
    description: 'Attention requise',
    pattern: [80, 100, 80],
    intensity: 'medium',
    category: 'alert',
    context: 'warning'
  },

  critical_alert: {
    id: 'critical_alert',
    name: 'Alerte Critique',
    description: 'Situation critique nécessitant attention immédiate',
    pattern: [200, 100, 200, 100, 200, 100, 200],
    intensity: 'heavy',
    category: 'alert',
    context: 'error'
  },

  // Navigation
  navigation_start: {
    id: 'navigation_start',
    name: 'Début Navigation',
    description: 'Début d\'une nouvelle section',
    pattern: [40, 60, 20],
    intensity: 'light',
    category: 'navigation',
    context: 'navigation'
  },

  navigation_end: {
    id: 'navigation_end',
    name: 'Fin Navigation',
    description: 'Fin de section ou retour',
    pattern: [20, 60, 40],
    intensity: 'light',
    category: 'navigation',
    context: 'navigation'
  },

  page_change: {
    id: 'page_change',
    name: 'Changement Page',
    description: 'Transition entre pages',
    pattern: [15, 30, 25],
    intensity: 'light',
    category: 'navigation',
    context: 'navigation'
  },

  // Bluetooth et connexions
  bluetooth_connect: {
    id: 'bluetooth_connect',
    name: 'Connexion Bluetooth',
    description: 'Équipement Bluetooth connecté',
    pattern: [50, 100, 30, 80, 20],
    intensity: 'medium',
    category: 'notification',
    context: 'bluetooth'
  },

  bluetooth_disconnect: {
    id: 'bluetooth_disconnect',
    name: 'Déconnexion Bluetooth',
    description: 'Équipement Bluetooth déconnecté',
    pattern: [80, 50, 80],
    intensity: 'medium',
    category: 'notification',
    context: 'bluetooth'
  },

  bluetooth_scan: {
    id: 'bluetooth_scan',
    name: 'Scan Bluetooth',
    description: 'Recherche d\'équipements en cours',
    pattern: [20, 50, 20, 50, 20],
    intensity: 'light',
    category: 'feedback',
    context: 'bluetooth'
  },

  // Tests atmosphériques
  atmospheric_reading: {
    id: 'atmospheric_reading',
    name: 'Lecture Atmosphérique',
    description: 'Nouvelle mesure atmosphérique reçue',
    pattern: [15, 40, 15],
    intensity: 'light',
    category: 'feedback',
    context: 'atmospheric'
  },

  atmospheric_warning: {
    id: 'atmospheric_warning',
    name: 'Alarme Atmosphérique',
    description: 'Seuil d\'alarme atmosphérique atteint',
    pattern: [100, 80, 100, 80, 100],
    intensity: 'heavy',
    category: 'alert',
    context: 'atmospheric'
  },

  atmospheric_critical: {
    id: 'atmospheric_critical',
    name: 'Critique Atmosphérique',
    description: 'Niveau critique détecté - évacuation',
    pattern: [200, 50, 200, 50, 200, 50, 200, 50, 200],
    intensity: 'heavy',
    category: 'alert',
    context: 'atmospheric'
  },

  // Voice input
  voice_start: {
    id: 'voice_start',
    name: 'Début Enregistrement',
    description: 'Début d\'enregistrement vocal',
    pattern: [30, 20, 50],
    intensity: 'light',
    category: 'feedback',
    context: 'selection'
  },

  voice_stop: {
    id: 'voice_stop',
    name: 'Fin Enregistrement',
    description: 'Fin d\'enregistrement vocal',
    pattern: [50, 20, 30],
    intensity: 'light',
    category: 'feedback',
    context: 'selection'
  },

  voice_error: {
    id: 'voice_error',
    name: 'Erreur Vocale',
    description: 'Erreur reconnaissance vocale',
    pattern: [60, 40, 60],
    intensity: 'medium',
    category: 'alert',
    context: 'error'
  },

  // QR Code scanning
  qr_scan_success: {
    id: 'qr_scan_success',
    name: 'QR Scan Réussi',
    description: 'QR code scanné avec succès',
    pattern: [25, 50, 75],
    intensity: 'medium',
    category: 'notification',
    context: 'success'
  },

  qr_scan_error: {
    id: 'qr_scan_error',
    name: 'QR Scan Échec',
    description: 'Échec scan QR code',
    pattern: [80, 40, 80],
    intensity: 'medium',
    category: 'alert',
    context: 'error'
  },

  // Formulaires
  form_field_error: {
    id: 'form_field_error',
    name: 'Erreur Champ',
    description: 'Erreur validation champ formulaire',
    pattern: [40, 30, 40],
    intensity: 'light',
    category: 'feedback',
    context: 'error'
  },

  form_submit_success: {
    id: 'form_submit_success',
    name: 'Soumission Réussie',
    description: 'Formulaire soumis avec succès',
    pattern: [50, 100, 30, 60, 40],
    intensity: 'medium',
    category: 'notification',
    context: 'success'
  },

  // Custom patterns
  pulse: {
    id: 'pulse',
    name: 'Pulsation',
    description: 'Pattern de pulsation continue',
    pattern: [100, 100, 100, 100, 100],
    intensity: 'light',
    category: 'custom',
    context: 'info'
  },

  heartbeat: {
    id: 'heartbeat',
    name: 'Battement',
    description: 'Pattern battement de cœur',
    pattern: [30, 50, 60, 200, 30, 50, 60],
    intensity: 'medium',
    category: 'custom',
    context: 'info'
  }
};

// =================== CONFIGURATION PAR DÉFAUT ===================

const DEFAULT_CONFIG: HapticConfig = {
  isEnabled: true,
  intensity: 'medium',
  duration: 50,
  delay: 50,
  maxPatternLength: 10,
  enableWebVibration: true,
  enableiOSHaptics: true,
  enableAndroidVibration: true,
  respectUserPreferences: true,
  debugMode: false
};

// =================== HOOK PRINCIPAL ===================

export function useHaptics(config: Partial<HapticConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // État principal
  const [state, setState] = useState<HapticState>({
    isSupported: false,
    isEnabled: finalConfig.isEnabled,
    isPlaying: false,
    currentPattern: null,
    lastEvent: null,
    supportedMethods: [],
    deviceCapabilities: {
      hasVibration: false,
      hasHapticEngine: false,
      hasGamepadVibration: false,
      maxIntensity: 1,
      maxDuration: 5000,
      supportsCustomPatterns: false,
      platformSpecific: {
        ios: { hasHapticEngine: false, supportedTypes: [] },
        android: { hasVibrator: false, supportsAmplitude: false, apiLevel: 0 },
        web: { hasVibrationAPI: false, hasGamepadAPI: false }
      }
    },
    eventHistory: []
  });

  // Références pour gestion
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationRef = useRef<boolean>(false);
  const eventIdCounter = useRef<number>(0);

  // =================== DÉTECTION CAPACITÉS ===================

  const detectDeviceCapabilities = useCallback((): DeviceCapabilities => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent);
    
    const capabilities: DeviceCapabilities = {
      hasVibration: 'vibrate' in navigator,
      hasHapticEngine: isIOS && 'Taptic' in window, // Approximation
      hasGamepadVibration: 'getGamepads' in navigator,
      maxIntensity: 1,
      maxDuration: 5000,
      supportsCustomPatterns: 'vibrate' in navigator,
      platformSpecific: {
        ios: {
          hasHapticEngine: isIOS,
          supportedTypes: isIOS ? ['impact', 'notification', 'selection'] : []
        },
        android: {
          hasVibrator: isAndroid && 'vibrate' in navigator,
          supportsAmplitude: isAndroid,
          apiLevel: isAndroid ? 21 : 0 // Estimation
        },
        web: {
          hasVibrationAPI: 'vibrate' in navigator,
          hasGamepadAPI: 'getGamepads' in navigator
        }
      }
    };

    return capabilities;
  }, []);

  const detectSupportedMethods = useCallback((): HapticMethod[] => {
    const methods: HapticMethod[] = [];

    // Web Vibration API
    if ('vibrate' in navigator) {
      methods.push({
        type: 'vibration',
        name: 'Web Vibration API',
        isSupported: true,
        api: 'navigator.vibrate()',
        limitations: ['Pattern limité', 'Intensité fixe', 'Pas de feedback']
      });
    }

    // iOS Haptic Engine (approximation)
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      methods.push({
        type: 'haptic',
        name: 'iOS Haptic Engine',
        isSupported: true,
        api: 'webkit-taptic-engine',
        limitations: ['Patterns fixes', 'iOS 10+ requis']
      });
    }

    // Gamepad Vibration
    if ('getGamepads' in navigator) {
      methods.push({
        type: 'gamepad',
        name: 'Gamepad Vibration',
        isSupported: true,
        api: 'gamepad.vibrationActuator',
        limitations: ['Gamepad requis', 'Support variable']
      });
    }

    return methods;
  }, []);

  // =================== FONCTIONS UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.debugMode) {
      console.log(`[Haptics] ${message}`, data || '');
    }
  }, [finalConfig.debugMode]);

  const generateEventId = useCallback((): string => {
    return `haptic_${Date.now()}_${++eventIdCounter.current}`;
  }, []);

  const detectDeviceType = useCallback((): 'ios' | 'android' | 'web' | 'unknown' => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if ('vibrate' in navigator) return 'web';
    return 'unknown';
  }, []);

  const checkUserPreferences = useCallback(async (): Promise<boolean> => {
    if (!finalConfig.respectUserPreferences) return true;

    try {
      // Vérifier les préférences d'accessibilité
      if ('requestPermission' in DeviceMotionEvent) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      }

      // Vérifier les préférences système (approximation)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return !prefersReducedMotion;

    } catch (error) {
      log('Erreur vérification préférences utilisateur', error);
      return true; // Par défaut, autoriser
    }
  }, [finalConfig.respectUserPreferences, log]);

  // =================== MÉTHODES DE VIBRATION ===================

  const vibrateWeb = useCallback(async (pattern: number[]): Promise<boolean> => {
    if (!('vibrate' in navigator) || !finalConfig.enableWebVibration) {
      return false;
    }

    try {
      const success = navigator.vibrate(pattern);
      log('Web vibration', { pattern, success });
      return success;
    } catch (error) {
      log('Erreur Web vibration', error);
      return false;
    }
  }, [finalConfig.enableWebVibration, log]);

  const vibrateiOS = useCallback(async (pattern: HapticPattern): Promise<boolean> => {
    if (!finalConfig.enableiOSHaptics || !(/iPad|iPhone|iPod/.test(navigator.userAgent))) {
      return false;
    }

    try {
      // Simulation iOS Haptic Engine (nécessite plugin natif en production)
      const hapticType = pattern.context === 'error' ? 'notificationOccurred' :
                        pattern.context === 'success' ? 'notificationOccurred' :
                        pattern.context === 'selection' ? 'selectionChanged' :
                        'impactOccurred';

      // En production, utiliser un plugin comme react-native-haptic-feedback
      if ('webkit' in window && (window as any).webkit?.messageHandlers?.haptic) {
        (window as any).webkit.messageHandlers.haptic.postMessage({
          type: hapticType,
          intensity: pattern.intensity || 'medium'
        });
        log('iOS haptic', { type: hapticType, intensity: pattern.intensity });
        return true;
      }

      // Fallback vers vibration web
      return vibrateWeb(pattern.pattern);

    } catch (error) {
      log('Erreur iOS haptic', error);
      return vibrateWeb(pattern.pattern);
    }
  }, [finalConfig.enableiOSHaptics, vibrateWeb, log]);

  const vibrateAndroid = useCallback(async (pattern: number[]): Promise<boolean> => {
    if (!finalConfig.enableAndroidVibration) {
      return false;
    }

    try {
      // Android utilise l'API Web Vibration standard
      return vibrateWeb(pattern);
    } catch (error) {
      log('Erreur Android vibration', error);
      return false;
    }
  }, [finalConfig.enableAndroidVibration, vibrateWeb, log]);

  const vibrateGamepad = useCallback(async (pattern: number[], intensity = 0.5): Promise<boolean> => {
    if (!('getGamepads' in navigator)) {
      return false;
    }

    try {
      const gamepads = navigator.getGamepads();
      let success = false;

      for (const gamepad of gamepads) {
        if (gamepad && gamepad.vibrationActuator) {
          // Convertir pattern en vibration gamepad
          for (let i = 0; i < pattern.length; i += 2) {
            const duration = pattern[i] || 0;
            const pause = pattern[i + 1] || 0;

            if (duration > 0) {
              await gamepad.vibrationActuator.playEffect('dual-rumble', {
                duration,
                strongMagnitude: intensity,
                weakMagnitude: intensity * 0.7
              });
              success = true;
            }

            if (pause > 0) {
              await new Promise(resolve => setTimeout(resolve, pause));
            }
          }
        }
      }

      log('Gamepad vibration', { pattern, intensity, success });
      return success;

    } catch (error) {
      log('Erreur Gamepad vibration', error);
      return false;
    }
  }, [log]);

  // =================== FONCTIONS PRINCIPALES ===================

  const checkSupport = useCallback(async (): Promise<boolean> => {
    const capabilities = detectDeviceCapabilities();
    const methods = detectSupportedMethods();
    const userAllowed = await checkUserPreferences();

    const isSupported = methods.length > 0 && userAllowed;

    setState(prev => ({
      ...prev,
      isSupported,
      deviceCapabilities: capabilities,
      supportedMethods: methods,
      isEnabled: isSupported && finalConfig.isEnabled
    }));

    log('Support haptique vérifié', {
      isSupported,
      methodsCount: methods.length,
      userAllowed,
      capabilities
    });

    return isSupported;
  }, [detectDeviceCapabilities, detectSupportedMethods, checkUserPreferences, finalConfig.isEnabled, log]);

  const playPattern = useCallback(async (
    patternId: string,
    options: {
      intensity?: 'light' | 'medium' | 'heavy';
      customPattern?: number[];
      context?: string;
    } = {}
  ): Promise<boolean> => {
    if (!state.isSupported || !state.isEnabled || state.isPlaying) {
      return false;
    }

    const pattern = HAPTIC_PATTERNS[patternId];
    if (!pattern && !options.customPattern) {
      log(`Pattern inconnu: ${patternId}`);
      return false;
    }

    const eventId = generateEventId();
    const startTime = Date.now();

    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentPattern: patternId
    }));

    vibrationRef.current = true;

    try {
      const vibrationPattern = options.customPattern || pattern.pattern;
      const deviceType = detectDeviceType();
      let success = false;

      // Ajuster l'intensité
      const intensityMultiplier = {
        light: 0.6,
        medium: 1.0,
        heavy: 1.4
      }[options.intensity || pattern?.intensity || finalConfig.intensity];

      const adjustedPattern = vibrationPattern.map(duration => 
        Math.round(duration * intensityMultiplier)
      );

      // Sélectionner la méthode de vibration selon la plateforme
      switch (deviceType) {
        case 'ios':
          success = pattern ? await vibrateiOS(pattern) : await vibrateWeb(adjustedPattern);
          break;
        case 'android':
          success = await vibrateAndroid(adjustedPattern);
          break;
        case 'web':
          success = await vibrateWeb(adjustedPattern);
          break;
        default:
          success = await vibrateWeb(adjustedPattern);
      }

      // Essayer gamepad en parallèle si disponible
      if (state.deviceCapabilities.hasGamepadVibration) {
        vibrateGamepad(adjustedPattern, intensityMultiplier * 0.7);
      }

      const duration = Date.now() - startTime;
      const event: HapticEvent = {
        id: eventId,
        timestamp: new Date(),
        patternId,
        success,
        duration,
        context: options.context || pattern?.context || 'custom',
        deviceType,
        userAgent: navigator.userAgent
      };

      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentPattern: null,
        lastEvent: event,
        eventHistory: [event, ...prev.eventHistory.slice(0, 49)]
      }));

      log(`Pattern joué: ${patternId}`, {
        success,
        duration,
        adjustedPattern,
        deviceType
      });

      return success;

    } catch (error) {
      const duration = Date.now() - startTime;
      const event: HapticEvent = {
        id: eventId,
        timestamp: new Date(),
        patternId,
        success: false,
        duration,
        context: options.context || 'error',
        deviceType: detectDeviceType(),
        userAgent: navigator.userAgent
      };

      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentPattern: null,
        lastEvent: event,
        eventHistory: [event, ...prev.eventHistory.slice(0, 49)]
      }));

      log(`Erreur pattern ${patternId}`, error);
      return false;

    } finally {
      vibrationRef.current = false;
    }
  }, [
    state.isSupported,
    state.isEnabled,
    state.isPlaying,
    state.deviceCapabilities.hasGamepadVibration,
    finalConfig.intensity,
    generateEventId,
    detectDeviceType,
    vibrateiOS,
    vibrateAndroid,
    vibrateWeb,
    vibrateGamepad,
    log
  ]);

  const stopVibration = useCallback((): boolean => {
    if (!vibrationRef.current) {
      return false;
    }

    try {
      // Arrêter vibration web
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }

      // Arrêter gamepad vibration
      if ('getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
          if (gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.reset();
          }
        }
      }

      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentPattern: null
      }));

      vibrationRef.current = false;
      log('Vibration arrêtée');
      return true;

    } catch (error) {
      log('Erreur arrêt vibration', error);
      return false;
    }
  }, [log]);

  // =================== PATTERNS RAPIDES ===================

  const tap = useCallback(() => playPattern('tap'), [playPattern]);
  const click = useCallback(() => playPattern('click'), [playPattern]);
  const success = useCallback(() => playPattern('success'), [playPattern]);
  const error = useCallback(() => playPattern('error'), [playPattern]);
  const warning = useCallback(() => playPattern('warning'), [playPattern]);
  const criticalAlert = useCallback(() => playPattern('critical_alert'), [playPattern]);
  const bluetoothConnect = useCallback(() => playPattern('bluetooth_connect'), [playPattern]);
  const bluetoothDisconnect = useCallback(() => playPattern('bluetooth_disconnect'), [playPattern]);
  const atmosphericWarning = useCallback(() => playPattern('atmospheric_warning'), [playPattern]);
  const atmosphericCritical = useCallback(() => playPattern('atmospheric_critical'), [playPattern]);
  const qrScanSuccess = useCallback(() => playPattern('qr_scan_success'), [playPattern]);
  const voiceStart = useCallback(() => playPattern('voice_start'), [playPattern]);
  const voiceStop = useCallback(() => playPattern('voice_stop'), [playPattern]);

  // =================== GESTION ÉTAT ===================

  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isEnabled: enabled }));
    log(`Haptiques ${enabled ? 'activées' : 'désactivées'}`);
  }, [log]);

  const getEventHistory = useCallback((limit = 10) => {
    return state.eventHistory.slice(0, limit);
  }, [state.eventHistory]);

  const clearEventHistory = useCallback(() => {
    setState(prev => ({ ...prev, eventHistory: [] }));
    log('Historique événements effacé');
  }, [log]);

  // =================== EFFETS ===================

  // Vérification support au montage
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopVibration();
    };
  }, [stopVibration]);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    ...state,
    
    // Actions principales
    playPattern,
    stopVibration,
    checkSupport,
    
    // Patterns rapides
    tap,
    click,
    success,
    error,
    warning,
    criticalAlert,
    bluetoothConnect,
    bluetoothDisconnect,
    atmosphericWarning,
    atmosphericCritical,
    qrScanSuccess,
    voiceStart,
    voiceStop,
    
    // Gestion
    setEnabled,
    getEventHistory,
    clearEventHistory,
    
    // Patterns disponibles
    availablePatterns: Object.values(HAPTIC_PATTERNS),
    
    // Configuration
    config: finalConfig
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseHapticsReturn = ReturnType<typeof useHaptics>;

export default useHaptics;
