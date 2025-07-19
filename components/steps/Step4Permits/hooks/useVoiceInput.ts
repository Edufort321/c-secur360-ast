// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USEVOICEINPUT.TS ===================
// Hook React pour saisie vocale multilingue avec commandes et transcription temps réel
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

// =================== INTERFACES ===================

interface VoiceInputConfig {
  language?: string;                    // 'fr-CA', 'en-CA', 'auto'
  continuous?: boolean;                 // Écoute continue
  interimResults?: boolean;            // Résultats intermédiaires
  maxAlternatives?: number;            // Alternatives de transcription
  enableCommands?: boolean;            // Commandes vocales
  enableHapticFeedback?: boolean;      // Feedback haptique
  enableAutoCorrection?: boolean;      // Correction automatique
  noiseReduction?: boolean;            // Réduction bruit
  confidenceThreshold?: number;        // Seuil confiance minimum
  timeoutDuration?: number;            // Timeout inactivité (ms)
  enableLogging?: boolean;             // Logs détaillés
}

interface VoiceCommand {
  id: string;
  patterns: string[];                  // Motifs reconnaissance
  action: (params?: any) => void;      // Action à exécuter
  description: string;                 // Description commande
  parameters?: VoiceParameter[];       // Paramètres extractibles
  context?: string[];                  // Contextes applicables
  language?: string;                   // Langue spécifique
  confidence?: number;                 // Confiance minimum
}

interface VoiceParameter {
  name: string;                        // Nom paramètre
  type: 'text' | 'number' | 'date' | 'time' | 'boolean' | 'enum';
  pattern: RegExp;                     // Pattern extraction
  required?: boolean;                  // Obligatoire
  enumValues?: string[];               // Valeurs enum
  validation?: (value: any) => boolean; // Validation custom
}

interface TranscriptionResult {
  transcript: string;                  // Texte transcrit
  confidence: number;                  // Confiance 0-1
  isFinal: boolean;                   // Résultat final
  alternatives: Array<{               // Alternatives
    transcript: string;
    confidence: number;
  }>;
  startTime: number;                  // Timestamp début
  endTime?: number;                   // Timestamp fin
  language: string;                   // Langue détectée
  correctedTranscript?: string;       // Version corrigée
}

interface VoiceSession {
  id: string;                         // ID session
  startTime: number;                  // Début session
  endTime?: number;                   // Fin session
  language: string;                   // Langue utilisée
  transcriptions: TranscriptionResult[]; // Transcriptions
  commands: VoiceCommandExecution[];  // Commandes exécutées
  audioBlob?: Blob;                   // Enregistrement audio
  statistics: VoiceStatistics;        // Statistiques session
}

interface VoiceCommandExecution {
  commandId: string;                  // ID commande
  timestamp: number;                  // Moment exécution
  transcript: string;                 // Texte déclenché
  parameters: Record<string, any>;    // Paramètres extraits
  confidence: number;                 // Confiance
  success: boolean;                   // Succès exécution
  error?: string;                     // Erreur si échec
}

interface VoiceStatistics {
  totalDuration: number;              // Durée totale (ms)
  speechDuration: number;             // Durée parole (ms)
  silenceDuration: number;            // Durée silence (ms)
  wordCount: number;                  // Nombre mots
  averageConfidence: number;          // Confiance moyenne
  commandsExecuted: number;           // Commandes exécutées
  correctionsApplied: number;         // Corrections appliquées
}

interface BrowserCompatibility {
  hasSpeechRecognition: boolean;      // Support SpeechRecognition
  hasWebkitSpeechRecognition: boolean; // Support Webkit
  supportedLanguages: string[];       // Langues supportées
  maxContinuousDuration: number;      // Durée max continue
  supportsInterimResults: boolean;    // Support résultats interim
  supportsConfidence: boolean;        // Support scores confiance
}

// =================== CONSTANTES ===================

// Langues supportées avec configurations
const SUPPORTED_LANGUAGES = {
  'fr-CA': {
    name: 'Français (Canada)',
    flag: '🇨🇦',
    grammar: 'french_canadian',
    corrections: true,
    commands: true
  },
  'en-CA': {
    name: 'English (Canada)',
    flag: '🇨🇦',
    grammar: 'english_canadian',
    corrections: true,
    commands: true
  },
  'fr-FR': {
    name: 'Français (France)',
    flag: '🇫🇷',
    grammar: 'french_france',
    corrections: true,
    commands: false
  },
  'en-US': {
    name: 'English (US)',
    flag: '🇺🇸',
    grammar: 'english_us',
    corrections: true,
    commands: false
  }
} as const;

// Commandes vocales prédéfinies pour permis de travail
const DEFAULT_VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation
  {
    id: 'navigate_next',
    patterns: ['suivant', 'next', 'continuer', 'continue'],
    action: () => console.log('Navigation: Suivant'),
    description: 'Passer à l\'étape suivante',
    context: ['form', 'wizard'],
    language: 'both'
  },
  {
    id: 'navigate_previous',
    patterns: ['précédent', 'previous', 'retour', 'back'],
    action: () => console.log('Navigation: Précédent'),
    description: 'Retourner à l\'étape précédente',
    context: ['form', 'wizard'],
    language: 'both'
  },
  
  // Actions permis
  {
    id: 'create_permit',
    patterns: ['créer permis', 'create permit', 'nouveau permis', 'new permit'],
    action: () => console.log('Action: Créer permis'),
    description: 'Créer un nouveau permis',
    context: ['permits'],
    language: 'both'
  },
  {
    id: 'approve_permit',
    patterns: ['approuver', 'approve', 'valider', 'validate'],
    action: () => console.log('Action: Approuver permis'),
    description: 'Approuver le permis',
    context: ['permits', 'approval'],
    language: 'both'
  },
  
  // Saisie données
  {
    id: 'set_oxygen_level',
    patterns: [
      'oxygène (\\d+(?:\\.\\d+)?) pour cent',
      'oxygen (\\d+(?:\\.\\d+)?) percent'
    ],
    action: (params) => console.log('Oxygène:', params.level),
    description: 'Définir niveau d\'oxygène',
    parameters: [{
      name: 'level',
      type: 'number',
      pattern: /(\\d+(?:\\.\\d+)?)/,
      required: true,
      validation: (val) => val >= 0 && val <= 100
    }],
    context: ['atmospheric'],
    language: 'both'
  },
  {
    id: 'add_worker',
    patterns: [
      'ajouter travailleur (.+)',
      'add worker (.+)'
    ],
    action: (params) => console.log('Ajouter:', params.name),
    description: 'Ajouter un travailleur',
    parameters: [{
      name: 'name',
      type: 'text',
      pattern: /(.+)/,
      required: true
    }],
    context: ['personnel'],
    language: 'both'
  },
  
  // Contrôles interface
  {
    id: 'save_form',
    patterns: ['sauvegarder', 'save', 'enregistrer', 'record'],
    action: () => console.log('Action: Sauvegarder'),
    description: 'Sauvegarder le formulaire',
    context: ['form'],
    language: 'both'
  },
  {
    id: 'cancel_action',
    patterns: ['annuler', 'cancel', 'arrêter', 'stop'],
    action: () => console.log('Action: Annuler'),
    description: 'Annuler l\'action courante',
    context: ['all'],
    language: 'both'
  },
  
  // Urgences
  {
    id: 'emergency_stop',
    patterns: [
      'arrêt d\'urgence',
      'emergency stop',
      'urgence',
      'emergency'
    ],
    action: () => console.log('URGENCE: Arrêt d\'urgence'),
    description: 'Déclencher arrêt d\'urgence',
    context: ['emergency'],
    language: 'both',
    confidence: 0.8
  }
];

// Corrections automatiques communes
const AUTO_CORRECTIONS = {
  'fr-CA': {
    'oxigène': 'oxygène',
    'pemis': 'permis',
    'travayeur': 'travailleur',
    'sécurité': 'sécurité',
    'inspecttion': 'inspection'
  },
  'en-CA': {
    'permitt': 'permit',
    'safty': 'safety',
    'workker': 'worker',
    'oxigen': 'oxygen',
    'inspecttion': 'inspection'
  }
} as const;

// Configuration par défaut
const DEFAULT_CONFIG: Required<VoiceInputConfig> = {
  language: 'fr-CA',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  enableCommands: true,
  enableHapticFeedback: true,
  enableAutoCorrection: true,
  noiseReduction: true,
  confidenceThreshold: 0.7,
  timeoutDuration: 30000,
  enableLogging: false
};

// =================== HOOK PRINCIPAL ===================

export function useVoiceInput(config: VoiceInputConfig = {}) {
  // Configuration fusionnée
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // États principaux
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(finalConfig.language);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // États sessions
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<VoiceSession[]>([]);
  
  // États commandes
  const [availableCommands, setAvailableCommands] = useState<VoiceCommand[]>(DEFAULT_VOICE_COMMANDS);
  const [lastCommandExecution, setLastCommandExecution] = useState<VoiceCommandExecution | null>(null);
  
  // Références
  const recognitionRef = useRef<any>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // =================== FONCTIONS UTILITAIRES ===================
  
  // Vérifier compatibilité navigateur
  const checkBrowserCompatibility = useCallback((): BrowserCompatibility => {
    const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
    const hasSpeech = 'SpeechRecognition' in window;
    
    return {
      hasSpeechRecognition: hasSpeech,
      hasWebkitSpeechRecognition: hasWebkitSpeech,
      supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
      maxContinuousDuration: 60000, // 1 minute estimation
      supportsInterimResults: hasWebkitSpeech || hasSpeech,
      supportsConfidence: hasWebkitSpeech || hasSpeech
    };
  }, []);
  
  // Appliquer corrections automatiques
  const applyAutoCorrections = useCallback((text: string, language: string): string => {
    const corrections = AUTO_CORRECTIONS[language as keyof typeof AUTO_CORRECTIONS];
    if (!corrections) return text;
    
    let correctedText = text;
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correct);
    });
    
    return correctedText;
  }, []);
  
  // Détecter et exécuter commandes vocales
  const processVoiceCommands = useCallback((transcript: string, confidence: number): VoiceCommandExecution | null => {
    if (!finalConfig.enableCommands || confidence < finalConfig.confidenceThreshold) {
      return null;
    }
    
    for (const command of availableCommands) {
      for (const pattern of command.patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        const match = transcript.match(regex);
        
        if (match) {
          const execution: VoiceCommandExecution = {
            commandId: command.id,
            timestamp: Date.now(),
            transcript,
            parameters: {},
            confidence,
            success: false
          };
          
          try {
            // Extraire paramètres si définis
            if (command.parameters) {
              for (const param of command.parameters) {
                const paramMatch = transcript.match(param.pattern);
                if (paramMatch && paramMatch[1]) {
                  let value: any = paramMatch[1];
                  
                  // Conversion type
                  switch (param.type) {
                    case 'number':
                      value = parseFloat(value);
                      break;
                    case 'boolean':
                      value = ['oui', 'yes', 'true'].includes(value.toLowerCase());
                      break;
                    case 'date':
                      value = new Date(value);
                      break;
                  }
                  
                  // Validation
                  if (param.validation && !param.validation(value)) {
                    throw new Error(`Validation failed for parameter ${param.name}`);
                  }
                  
                  execution.parameters[param.name] = value;
                } else if (param.required) {
                  throw new Error(`Required parameter ${param.name} not found`);
                }
              }
            }
            
            // Exécuter commande
            command.action(execution.parameters);
            execution.success = true;
            
            // Feedback haptique si activé
            if (finalConfig.enableHapticFeedback && 'vibrate' in navigator) {
              navigator.vibrate([50, 100, 50]); // Pattern succès commande
            }
            
          } catch (error) {
            execution.error = error instanceof Error ? error.message : 'Unknown error';
            console.error('Voice command execution failed:', error);
          }
          
          setLastCommandExecution(execution);
          return execution;
        }
      }
    }
    
    return null;
  }, [availableCommands, finalConfig]);
  
  // Créer nouvelle session
  const createSession = useCallback((): VoiceSession => {
    return {
      id: `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      language: currentLanguage,
      transcriptions: [],
      commands: [],
      statistics: {
        totalDuration: 0,
        speechDuration: 0,
        silenceDuration: 0,
        wordCount: 0,
        averageConfidence: 0,
        commandsExecuted: 0,
        correctionsApplied: 0
      }
    };
  }, [currentLanguage]);
  
  // Initialiser reconnaissance vocale
  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configuration
    recognition.continuous = finalConfig.continuous;
    recognition.interimResults = finalConfig.interimResults;
    recognition.maxAlternatives = finalConfig.maxAlternatives;
    recognition.lang = currentLanguage;
    
    // Événements
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      
      // Créer nouvelle session
      const session = createSession();
      setCurrentSession(session);
      
      // Démarrer enregistrement audio si supporté
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
              audioChunksRef.current.push(event.data);
            };
            
            mediaRecorder.start();
          })
          .catch(console.warn);
      }
      
      if (finalConfig.enableLogging) {
        console.log('Voice recognition started');
      }
    };
    
    recognition.onresult = (event) => {
      setIsProcessing(true);
      
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;
        
        if (result.isFinal) {
          let processedTranscript = transcript;
          
          // Appliquer corrections automatiques
          if (finalConfig.enableAutoCorrection) {
            const corrected = applyAutoCorrections(transcript, currentLanguage);
            if (corrected !== transcript) {
              processedTranscript = corrected;
              // Incrémenter compteur corrections
              if (currentSession) {
                currentSession.statistics.correctionsApplied++;
              }
            }
          }
          
          finalTranscript += processedTranscript + ' ';
          
          // Créer résultat transcription
          const transcriptionResult: TranscriptionResult = {
            transcript: processedTranscript,
            confidence,
            isFinal: true,
            alternatives: Array.from({ length: result.length }, (_, j) => ({
              transcript: result[j].transcript,
              confidence: result[j].confidence || 0
            })),
            startTime: Date.now() - (transcript.length * 100), // Estimation
            endTime: Date.now(),
            language: currentLanguage,
            correctedTranscript: processedTranscript !== transcript ? processedTranscript : undefined
          };
          
          // Ajouter à la session
          if (currentSession) {
            currentSession.transcriptions.push(transcriptionResult);
            currentSession.statistics.wordCount += processedTranscript.split(' ').length;
          }
          
          // Traiter commandes vocales
          const commandExecution = processVoiceCommands(processedTranscript, confidence);
          if (commandExecution && currentSession) {
            currentSession.commands.push(commandExecution);
            currentSession.statistics.commandsExecuted++;
          }
          
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }
      
      setCurrentTranscript(interimTranscript);
      setFinalTranscript(finalTranscript.trim());
      setIsProcessing(false);
    };
    
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsProcessing(false);
      
      if (finalConfig.enableLogging) {
        console.error('Voice recognition error:', event.error);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      
      // Finaliser session
      if (currentSession) {
        const endTime = Date.now();
        const finalSession = {
          ...currentSession,
          endTime,
          statistics: {
            ...currentSession.statistics,
            totalDuration: endTime - currentSession.startTime,
            averageConfidence: currentSession.transcriptions.length > 0
              ? currentSession.transcriptions.reduce((sum, t) => sum + t.confidence, 0) / currentSession.transcriptions.length
              : 0
          }
        };
        
        // Ajouter blob audio si disponible
        if (mediaRecorderRef.current && audioChunksRef.current.length > 0) {
          finalSession.audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        }
        
        setSessionHistory(prev => [...prev, finalSession]);
        setCurrentSession(null);
      }
      
      // Arrêter enregistrement audio
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      if (finalConfig.enableLogging) {
        console.log('Voice recognition ended');
      }
    };
    
    return recognition;
  }, [finalConfig, currentLanguage, createSession, processVoiceCommands, applyAutoCorrections, currentSession]);
  
  // =================== ACTIONS PRINCIPALES ===================
  
  // Démarrer écoute
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }
    
    if (isListening) {
      return;
    }
    
    const recognition = initializeRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      
      // Timeout automatique
      if (finalConfig.timeoutDuration > 0) {
        sessionTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, finalConfig.timeoutDuration);
      }
    }
  }, [isSupported, isListening, initializeRecognition, finalConfig.timeoutDuration]);
  
  // Arrêter écoute
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);
  
  // Changer langue
  const changeLanguage = useCallback((language: string) => {
    if (language in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(language);
      
      // Redémarrer si en cours d'écoute
      if (isListening) {
        stopListening();
        setTimeout(() => startListening(), 100);
      }
    }
  }, [isListening, startListening, stopListening]);
  
  // Ajouter commande personnalisée
  const addCustomCommand = useCallback((command: VoiceCommand) => {
    setAvailableCommands(prev => [...prev, command]);
  }, []);
  
  // Supprimer commande
  const removeCommand = useCallback((commandId: string) => {
    setAvailableCommands(prev => prev.filter(cmd => cmd.id !== commandId));
  }, []);
  
  // Effacer transcription
  const clearTranscripts = useCallback(() => {
    setCurrentTranscript('');
    setFinalTranscript('');
    setConfidence(0);
  }, []);
  
  // Effacer erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Obtenir statistiques globales
  const getGlobalStatistics = useCallback(() => {
    return sessionHistory.reduce((acc, session) => ({
      totalSessions: acc.totalSessions + 1,
      totalDuration: acc.totalDuration + session.statistics.totalDuration,
      totalWords: acc.totalWords + session.statistics.wordCount,
      totalCommands: acc.totalCommands + session.statistics.commandsExecuted,
      totalCorrections: acc.totalCorrections + session.statistics.correctionsApplied,
      averageConfidence: acc.averageConfidence + session.statistics.averageConfidence,
      languageDistribution: {
        ...acc.languageDistribution,
        [session.language]: (acc.languageDistribution[session.language] || 0) + 1
      }
    }), {
      totalSessions: 0,
      totalDuration: 0,
      totalWords: 0,
      totalCommands: 0,
      totalCorrections: 0,
      averageConfidence: 0,
      languageDistribution: {} as Record<string, number>
    });
  }, [sessionHistory]);
  
  // =================== EFFETS ===================
  
  // Vérifier support au montage
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();
    setIsSupported(compatibility.hasSpeechRecognition || compatibility.hasWebkitSpeechRecognition);
  }, [checkBrowserCompatibility]);
  
  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);
  
  // =================== DONNÉES CALCULÉES ===================
  
  const isAnySessionActive = currentSession !== null;
  const totalSessions = sessionHistory.length + (currentSession ? 1 : 0);
  const lastSession = sessionHistory[sessionHistory.length - 1];
  const globalStats = getGlobalStatistics();
  const supportedLanguagesList = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code,
    ...info
  }));
  
  // =================== RETOUR API ===================
  
  return {
    // État principal
    isListening,
    isSupported,
    isProcessing,
    currentTranscript,
    finalTranscript,
    confidence,
    error,
    
    // Session courante
    currentSession,
    isAnySessionActive,
    
    // Historique
    sessionHistory,
    lastSession,
    totalSessions,
    
    // Langues
    currentLanguage,
    supportedLanguagesList,
    
    // Commandes
    availableCommands,
    lastCommandExecution,
    
    // Actions principales
    startListening,
    stopListening,
    changeLanguage,
    clearTranscripts,
    clearError,
    
    // Gestion commandes
    addCustomCommand,
    removeCommand,
    
    // Utilitaires
    checkBrowserCompatibility,
    getGlobalStatistics,
    globalStats,
    
    // Configuration
    config: finalConfig
  };
}

// =================== TYPES EXPORT ===================

export type {
  VoiceInputConfig,
  VoiceCommand,
  VoiceParameter,
  TranscriptionResult,
  VoiceSession,
  VoiceCommandExecution,
  VoiceStatistics,
  BrowserCompatibility
};

// =================== CONSTANTES EXPORT ===================

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_VOICE_COMMANDS,
  AUTO_CORRECTIONS
};
