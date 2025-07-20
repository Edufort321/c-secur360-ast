// =================== COMPONENTS/FORMS/PROCEDURESSECTION.TSX - SECTION PROCÉDURES MOBILE-FIRST ===================
// Section procédures sécurité avec check-lists interactives, voice input et templates adaptatifs

"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckSquare, 
  Square, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Mic,
  MicOff,
  Camera,
  Video,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Share2,
  Copy,
  Edit3,
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Settings,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Star,
  Flag,
  MapPin,
  Users,
  Zap,
  HardHat,
  Wrench,
  Activity,
  Radio,
  Phone,
  Bell,
  X,
  Check,
  Gauge
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export interface PermitFormData {
  procedures?: {
    stepExecutions?: Record<string, StepExecution>;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FieldError {
  message: { fr: string; en: string };
  code: string;
}

export interface ProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  order: number;
  isRequired: boolean;
}

export interface SafetyProcedure {
  id: string;
  name: { fr: string; en: string };
  steps: ProcedureStep[];
}

export interface EmergencyProcedure {
  id: string;
  name: { fr: string; en: string };
  steps: ProcedureStep[];
}

export interface CommunicationPlan {
  id: string;
  name: { fr: string; en: string };
  steps: ProcedureStep[];
}

export interface VoiceNote {
  id: string;
  url: string;
  duration: number;
  timestamp: Date;
}

export interface ChecklistItem {
  id: string;
  text: { fr: string; en: string };
  isChecked: boolean;
  isRequired: boolean;
}

// =================== FONCTIONS UTILITAIRES ===================
const generateProcedureId = (): string => {
  return `procedure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validateProcedureStep = (step: ProcedureStepTemplate): FieldError | null => {
  if (!step.title.fr || !step.title.en) {
    return {
      message: {
        fr: 'Le titre de l\'étape est requis',
        en: 'Step title is required'
      },
      code: 'STEP_TITLE_REQUIRED'
    };
  }
  
  if (!step.description.fr || !step.description.en) {
    return {
      message: {
        fr: 'La description de l\'étape est requise',
        en: 'Step description is required'
      },
      code: 'STEP_DESCRIPTION_REQUIRED'
    };
  }
  
  return null;
};

// =================== CONSTANTES RÉGLEMENTATIONS ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    authority: 'CNESST',
    standards: ['CSA Z1006-16', 'NFPA 350'],
    maxWorkHours: 12,
    minRestPeriod: 8
  },
  ON: {
    authority: 'Ministry of Labour',
    standards: ['CSA Z1006-16', 'NFPA 350'],
    maxWorkHours: 12,
    minRestPeriod: 8
  },
  AB: {
    authority: 'Alberta Labour',
    standards: ['CSA Z1006-16', 'NFPA 350'],
    maxWorkHours: 12,
    minRestPeriod: 8
  },
  BC: {
    authority: 'WorkSafeBC',
    standards: ['CSA Z1006-16', 'NFPA 350'],
    maxWorkHours: 12,
    minRestPeriod: 8
  }
};

// =================== INTERFACES SECTION ===================
interface ProceduresSectionProps {
  data: Partial<PermitFormData>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, FieldError>;
  language: 'fr' | 'en';
  permitType: PermitType;
  province: string;
  touchOptimized?: boolean;
  enableVoiceInput?: boolean;
  enableVideoCapture?: boolean;
  enableTemplates?: boolean;
}

interface ProcedureTemplate {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  permitTypes: PermitType[];
  category: 'safety' | 'emergency' | 'communication' | 'evacuation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  steps: ProcedureStepTemplate[];
  estimatedTime: number; // minutes
  requiredPersonnel: string[];
  equipmentRequired: string[];
  regulatoryReference: string[];
}

interface ProcedureStepTemplate {
  id: string;
  order: number;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  type: 'action' | 'verification' | 'measurement' | 'communication' | 'decision';
  isRequired: boolean;
  hasTimer: boolean;
  timerDuration?: number; // secondes
  verificationMethod: 'visual' | 'verbal' | 'measurement' | 'signature';
  personnel: string[];
  equipment?: string[];
  hazards: string[];
  precautions: { fr: string[]; en: string[] };
  acceptanceCriteria: { fr: string; en: string };
}

interface StepExecution {
  stepId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  completedBy: string;
  verifiedBy?: string;
  notes?: string;
  voiceNotes?: VoiceNote[];
  photos?: string[];
  videos?: string[];
  measurements?: Record<string, number>;
  deviations?: string;
  corrective_actions?: string;
}

interface VoiceInputState {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  stepId?: string;
  field?: string;
  error?: string;
}

// =================== TEMPLATES PROCÉDURES PAR TYPE PERMIS ===================
const PROCEDURE_TEMPLATES: Record<PermitType, ProcedureTemplate[]> = {
  'espace-clos': [
    {
      id: 'pre-entry-espace-clos',
      name: { fr: 'Procédure pré-entrée espace clos', en: 'Confined Space Pre-Entry Procedure' },
      description: { fr: 'Vérifications obligatoires avant entrée', en: 'Required checks before entry' },
      permitTypes: ['espace-clos'],
      category: 'safety',
      priority: 'critical',
      estimatedTime: 30,
      requiredPersonnel: ['superviseur', 'surveillant', 'entrants'],
      equipmentRequired: ['detecteur-4-gaz', 'equipements-communication', 'equipements-rescue'],
      regulatoryReference: ['CSA Z1006-16', 'NFPA 350'],
      steps: [
        {
          id: 'isolation-space',
          order: 1,
          title: { fr: 'Isolation de l\'espace', en: 'Space Isolation' },
          description: { fr: 'Isoler tous les accès et sources d\'énergie', en: 'Isolate all access and energy sources' },
          type: 'action',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['superviseur'],
          hazards: ['energie-residuelle', 'acces-non-controle'],
          precautions: {
            fr: ['Verrouiller tous les accès', 'Étiqueter les vannes', 'Vérifier isolation'],
            en: ['Lock all access points', 'Tag valves', 'Verify isolation']
          },
          acceptanceCriteria: { fr: 'Tous accès isolés et verrouillés', en: 'All access isolated and locked' }
        },
        {
          id: 'atmospheric-testing',
          order: 2,
          title: { fr: 'Tests atmosphériques', en: 'Atmospheric Testing' },
          description: { fr: 'Mesurer O₂, LEL, H₂S, CO selon séquence', en: 'Measure O₂, LEL, H₂S, CO in sequence' },
          type: 'measurement',
          isRequired: true,
          hasTimer: true,
          timerDuration: 300, // 5 minutes
          verificationMethod: 'measurement',
          personnel: ['superviseur', 'surveillant'],
          equipment: ['detecteur-4-gaz'],
          hazards: ['atmosphere-deficiente', 'gaz-toxiques'],
          precautions: {
            fr: ['Tester depuis extérieur', 'Séquence O₂→LEL→toxiques', 'Calibrer équipements'],
            en: ['Test from outside', 'Sequence O₂→LEL→toxics', 'Calibrate equipment']
          },
          acceptanceCriteria: { fr: 'O₂: 19.5-23%, LEL: <10%, H₂S: <10ppm, CO: <35ppm', en: 'O₂: 19.5-23%, LEL: <10%, H₂S: <10ppm, CO: <35ppm' }
        },
        {
          id: 'ventilation-setup',
          order: 3,
          title: { fr: 'Installation ventilation', en: 'Ventilation Setup' },
          description: { fr: 'Installer ventilation mécanique si requise', en: 'Install mechanical ventilation if required' },
          type: 'action',
          isRequired: false,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['superviseur', 'entrants'],
          equipment: ['ventilateur-portable', 'gaines-ventilation'],
          hazards: ['atmosphere-stagnante'],
          precautions: {
            fr: ['Ventilation continue', 'Direction air appropriée', 'Vérifier débit'],
            en: ['Continuous ventilation', 'Proper air direction', 'Check flow rate']
          },
          acceptanceCriteria: { fr: 'Ventilation opérationnelle et efficace', en: 'Ventilation operational and effective' }
        },
        {
          id: 'communication-check',
          order: 4,
          title: { fr: 'Vérification communication', en: 'Communication Check' },
          description: { fr: 'Tester systèmes communication entrant-surveillant', en: 'Test communication systems entrant-attendant' },
          type: 'communication',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'verbal',
          personnel: ['surveillant', 'entrants'],
          equipment: ['radios', 'systeme-communication'],
          hazards: ['perte-communication'],
          precautions: {
            fr: ['Test avant entrée', 'Communication continue', 'Protocole check-in'],
            en: ['Test before entry', 'Continuous communication', 'Check-in protocol']
          },
          acceptanceCriteria: { fr: 'Communication claire et fonctionnelle', en: 'Clear and functional communication' }
        },
        {
          id: 'rescue-equipment',
          order: 5,
          title: { fr: 'Équipements de sauvetage', en: 'Rescue Equipment' },
          description: { fr: 'Vérifier disponibilité équipements sauvetage', en: 'Verify rescue equipment availability' },
          type: 'verification',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['superviseur', 'surveillant'],
          equipment: ['harnais-sauvetage', 'treuil-sauvetage', 'equipements-premiers-secours'],
          hazards: ['impossibilite-sauvetage'],
          precautions: {
            fr: ['Équipements inspectés', 'Personnel formé', 'Accès dégagé'],
            en: ['Equipment inspected', 'Personnel trained', 'Clear access']
          },
          acceptanceCriteria: { fr: 'Équipements sauvetage opérationnels', en: 'Rescue equipment operational' }
        },
        {
          id: 'entry-authorization',
          order: 6,
          title: { fr: 'Autorisation d\'entrée', en: 'Entry Authorization' },
          description: { fr: 'Signature autorisation par superviseur', en: 'Entry authorization signature by supervisor' },
          type: 'decision',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'signature',
          personnel: ['superviseur'],
          hazards: ['entree-non-autorisee'],
          precautions: {
            fr: ['Toutes vérifications complétées', 'Personnel briefé', 'Conditions acceptables'],
            en: ['All checks completed', 'Personnel briefed', 'Acceptable conditions']
          },
          acceptanceCriteria: { fr: 'Superviseur autorise entrée par signature', en: 'Supervisor authorizes entry by signature' }
        }
      ]
    },
    {
      id: 'emergency-evacuation-espace-clos',
      name: { fr: 'Procédure évacuation urgence', en: 'Emergency Evacuation Procedure' },
      description: { fr: 'Évacuation immédiate espace clos', en: 'Immediate confined space evacuation' },
      permitTypes: ['espace-clos'],
      category: 'emergency',
      priority: 'critical',
      estimatedTime: 5,
      requiredPersonnel: ['surveillant', 'superviseur'],
      equipmentRequired: ['alarme-evacuation', 'equipements-sauvetage'],
      regulatoryReference: ['CSA Z1006-16 Section 8'],
      steps: [
        {
          id: 'alarm-activation',
          order: 1,
          title: { fr: 'Activation alarme', en: 'Alarm Activation' },
          description: { fr: 'Déclencher alarme évacuation immédiatement', en: 'Trigger evacuation alarm immediately' },
          type: 'action',
          isRequired: true,
          hasTimer: true,
          timerDuration: 30,
          verificationMethod: 'verbal',
          personnel: ['surveillant'],
          hazards: ['retard-evacuation'],
          precautions: {
            fr: ['Signal sonore fort', 'Communication claire', 'Pas d\'hésitation'],
            en: ['Loud audible signal', 'Clear communication', 'No hesitation']
          },
          acceptanceCriteria: { fr: 'Alarme activée dans 30 secondes', en: 'Alarm activated within 30 seconds' }
        }
      ]
    }
  ],
  'travail-chaud': [
    {
      id: 'hot-work-preparation',
      name: { fr: 'Préparation travail à chaud', en: 'Hot Work Preparation' },
      description: { fr: 'Procédures avant début soudage/découpage', en: 'Procedures before welding/cutting start' },
      permitTypes: ['travail-chaud'],
      category: 'safety',
      priority: 'critical',
      estimatedTime: 20,
      requiredPersonnel: ['superviseur', 'surveillant-incendie', 'operateurs'],
      equipmentRequired: ['extincteurs', 'detecteur-gaz', 'equipements-protection'],
      regulatoryReference: ['NFPA 51B'],
      steps: [
        {
          id: 'fire-hazard-assessment',
          order: 1,
          title: { fr: 'Évaluation risques incendie', en: 'Fire Hazard Assessment' },
          description: { fr: 'Identifier combustibles dans rayon 11m', en: 'Identify combustibles within 11m radius' },
          type: 'verification',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['superviseur'],
          hazards: ['materiaux-combustibles', 'vapeurs-inflammables'],
          precautions: {
            fr: ['Inspection visuelle complète', 'Enlever combustibles', 'Protéger surfaces'],
            en: ['Complete visual inspection', 'Remove combustibles', 'Protect surfaces']
          },
          acceptanceCriteria: { fr: 'Zone 11m dégagée ou protégée', en: '11m zone cleared or protected' }
        },
        {
          id: 'fire-watch-setup',
          order: 2,
          title: { fr: 'Installation surveillance incendie', en: 'Fire Watch Setup' },
          description: { fr: 'Positionner surveillant avec extincteurs', en: 'Position fire watch with extinguishers' },
          type: 'action',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['surveillant-incendie'],
          equipment: ['extincteurs-co2', 'extincteurs-poudre'],
          hazards: ['debut-incendie'],
          precautions: {
            fr: ['Extincteurs appropriés', 'Accès dégagé', 'Formation surveillant'],
            en: ['Appropriate extinguishers', 'Clear access', 'Trained fire watch']
          },
          acceptanceCriteria: { fr: 'Surveillant positionné avec équipements', en: 'Fire watch positioned with equipment' }
        }
      ]
    }
  ],
  'levage': [
    {
      id: 'crane-pre-operation',
      name: { fr: 'Pré-inspection grue', en: 'Crane Pre-Operation Inspection' },
      description: { fr: 'Inspection obligatoire avant opération', en: 'Required inspection before operation' },
      permitTypes: ['levage'],
      category: 'safety',
      priority: 'critical',
      estimatedTime: 15,
      requiredPersonnel: ['operateur-grue', 'signaleur'],
      equipmentRequired: ['grue', 'elingues', 'palonniers'],
      regulatoryReference: ['CSA B167'],
      steps: [
        {
          id: 'visual-inspection',
          order: 1,
          title: { fr: 'Inspection visuelle', en: 'Visual Inspection' },
          description: { fr: 'Vérifier état général équipement', en: 'Check general equipment condition' },
          type: 'verification',
          isRequired: true,
          hasTimer: false,
          verificationMethod: 'visual',
          personnel: ['operateur-grue'],
          hazards: ['defaillance-equipement'],
          precautions: {
            fr: ['Inspection systématique', 'Noter anomalies', 'Arrêt si défaut'],
            en: ['Systematic inspection', 'Note anomalies', 'Stop if defective']
          },
          acceptanceCriteria: { fr: 'Aucun défaut visible', en: 'No visible defects' }
        }
      ]
    }
  ],
  // Autres types de permis avec procédures adaptées...
  'excavation': [],
  'hauteur': [],
  'isolation-energetique': [],
  'pression': [],
  'radiographie': [],
  'toiture': [],
  'demolition': []
};

// =================== COMPOSANT PRINCIPAL ===================
export const ProceduresSection: React.FC<ProceduresSectionProps> = ({
  data,
  onChange,
  errors,
  language = 'fr',
  permitType,
  province,
  touchOptimized = true,
  enableVoiceInput = false,
  enableVideoCapture = false,
  enableTemplates = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [executionSteps, setExecutionSteps] = useState<Record<string, StepExecution>>({});
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [voiceInput, setVoiceInput] = useState<VoiceInputState>({
    isActive: false,
    isListening: false,
    transcript: '',
    confidence: 0
  });
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [customProcedures, setCustomProcedures] = useState<ProcedureTemplate[]>([]);
  const [stepTimers, setStepTimers] = useState<Record<string, number>>({});

  // Refs pour fonctionnalités
  const voiceRecognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stepTimerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // =================== PROCÉDURES DISPONIBLES ===================
  const availableProcedures = useMemo(() => {
    const templates = PROCEDURE_TEMPLATES[permitType] || [];
    return [...templates, ...customProcedures];
  }, [permitType, customProcedures]);

  // =================== VOICE INPUT MANAGEMENT ===================
  const startVoiceInput = useCallback((stepId: string, field: string) => {
    if (!enableVoiceInput || !('webkitSpeechRecognition' in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'fr' ? 'fr-CA' : 'en-CA';

    recognition.onstart = () => {
      setVoiceInput(prev => ({
        ...prev,
        isActive: true,
        isListening: true,
        transcript: '',
        stepId,
        field,
        error: undefined
      }));
      
      // Feedback haptic début
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      let confidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        confidence = result[0].confidence;
      }
      
      setVoiceInput(prev => ({
        ...prev,
        transcript,
        confidence
      }));
      
      // Appliquer transcription si final
      if (event.results[event.resultIndex].isFinal) {
        updateStepExecution(stepId, field, transcript.trim());
        stopVoiceInput();
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceInput(prev => ({
        ...prev,
        error: event.error,
        isListening: false
      }));
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    recognition.onend = () => {
      stopVoiceInput();
    };

    recognition.start();
    voiceRecognitionRef.current = recognition;
  }, [enableVoiceInput, language]);

  const stopVoiceInput = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      voiceRecognitionRef.current = null;
    }
    
    setVoiceInput({
      isActive: false,
      isListening: false,
      transcript: '',
      confidence: 0
    });
    
    // Feedback haptic fin
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, []);

  // =================== STEP EXECUTION MANAGEMENT ===================
  const updateStepExecution = useCallback((stepId: string, field: string, value: any) => {
    setExecutionSteps(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        stepId,
        [field]: value,
        ...(field === 'status' && value === 'in-progress' && { startTime: new Date() }),
        ...(field === 'status' && ['completed', 'failed'].includes(value) && { endTime: new Date() })
      } as StepExecution
    }));
    
    // Mettre à jour données formulaire
    const currentProcedures = data.procedures || {};
    onChange('procedures', {
      ...currentProcedures,
      stepExecutions: {
        ...currentProcedures.stepExecutions,
        [stepId]: {
          ...currentProcedures.stepExecutions?.[stepId],
          [field]: value
        }
      }
    });
  }, [data.procedures, onChange]);

  const startStepExecution = useCallback((stepId: string) => {
    updateStepExecution(stepId, 'status', 'in-progress');
    setCurrentStep(stepId);
    
    // Démarrer timer si requis
    const procedure = availableProcedures.find(p => 
      p.steps.some(s => s.id === stepId)
    );
    const step = procedure?.steps.find(s => s.id === stepId);
    
    if (step?.hasTimer && step.timerDuration) {
      setStepTimers(prev => ({ ...prev, [stepId]: step.timerDuration! }));
      
      stepTimerRefs.current[stepId] = setInterval(() => {
        setStepTimers(prev => {
          const newTime = prev[stepId] - 1;
          if (newTime <= 0) {
            clearInterval(stepTimerRefs.current[stepId]);
            delete stepTimerRefs.current[stepId];
            
            // Notification fin timer
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            return { ...prev, [stepId]: 0 };
          }
          return { ...prev, [stepId]: newTime };
        });
      }, 1000);
    }
    
    // Feedback haptic début étape
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }
  }, [availableProcedures, updateStepExecution]);

  const completeStepExecution = useCallback((stepId: string, status: 'completed' | 'failed' | 'skipped') => {
    updateStepExecution(stepId, 'status', status);
    
    // Arrêter timer si actif
    if (stepTimerRefs.current[stepId]) {
      clearInterval(stepTimerRefs.current[stepId]);
      delete stepTimerRefs.current[stepId];
    }
    
    // Feedback haptic selon status
    if (navigator.vibrate) {
      if (status === 'completed') {
        navigator.vibrate([50, 25, 50, 25, 50]);
      } else if (status === 'failed') {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
    
    // Passer à l'étape suivante automatiquement
    if (status === 'completed') {
      const procedure = availableProcedures.find(p => 
        p.steps.some(s => s.id === stepId)
      );
      if (procedure) {
        const currentIndex = procedure.steps.findIndex(s => s.id === stepId);
        const nextStep = procedure.steps[currentIndex + 1];
        if (nextStep) {
          setCurrentStep(nextStep.id);
        } else {
          setCurrentStep(null);
          setIsExecuting(false);
        }
      }
    }
  }, [availableProcedures, updateStepExecution]);

  // =================== VIDEO CAPTURE ===================
  const startVideoCapture = useCallback(async (stepId: string) => {
    if (!enableVideoCapture) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simulation capture - Remplacer par vraie implementation
      setTimeout(() => {
        const videoUrl = `data:video/mp4;base64,AAAA...`; // Base64 simulé
        
        updateStepExecution(stepId, 'videos', [
          ...(executionSteps[stepId]?.videos || []),
          videoUrl
        ]);
        
        // Arrêter stream
        stream.getTracks().forEach(track => track.stop());
        
        // Feedback haptic capture
        if (navigator.vibrate) {
          navigator.vibrate([25, 25, 25, 25, 25]);
        }
      }, 5000);
    } catch (error) {
      console.error('Erreur capture vidéo:', error);
    }
  }, [enableVideoCapture, executionSteps, updateStepExecution]);

  // =================== CLEANUP ===================
  useEffect(() => {
    return () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }
      Object.values(stepTimerRefs.current).forEach(timer => {
        clearInterval(timer);
      });
    };
  }, []);

  // =================== RENDU COMPOSANT ===================
  const selectedProcedureTemplates = availableProcedures.filter(p => 
    selectedProcedures.includes(p.id)
  );

  const totalSteps = selectedProcedureTemplates.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = Object.values(executionSteps).filter(e => e.status === 'completed').length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* =================== HEADER SECTION =================== */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {language === 'fr' ? 'Procédures de sécurité' : 'Safety procedures'}
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              {language === 'fr' 
                ? `Procédures obligatoires et check-lists pour ${permitType}`
                : `Required procedures and checklists for ${permitType}`
              }
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {completedSteps}/{totalSteps} {language === 'fr' ? 'étapes' : 'steps'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {progressPercentage}% {language === 'fr' ? 'complété' : 'completed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================== SÉLECTEUR PROCÉDURES =================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'fr' ? 'Procédures disponibles' : 'Available procedures'}
          </h4>
          {enableTemplates && (
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Ajouter' : 'Add'}</span>
            </button>
          )}
        </div>

        {availableProcedures.length > 0 ? (
          <div className="space-y-3">
            {availableProcedures.map(procedure => {
              const isSelected = selectedProcedures.includes(procedure.id);
              const procedureSteps = procedure.steps;
              const procedureExecutions = procedureSteps.map(s => executionSteps[s.id]).filter(Boolean);
              const procedureProgress = procedureSteps.length > 0 
                ? Math.round((procedureExecutions.filter(e => e.status === 'completed').length / procedureSteps.length) * 100)
                : 0;

              return (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  isSelected={isSelected}
                  progress={procedureProgress}
                  language={language}
                  onToggle={() => {
                    if (isSelected) {
                      setSelectedProcedures(prev => prev.filter(id => id !== procedure.id));
                    } else {
                      setSelectedProcedures(prev => [...prev, procedure.id]);
                    }
                  }}
                  onExecute={() => {
                    if (!isSelected) {
                      setSelectedProcedures(prev => [...prev, procedure.id]);
                    }
                    setIsExecuting(true);
                    setCurrentStep(procedure.steps[0]?.id || null);
                  }}
                  touchOptimized={touchOptimized}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'fr' 
                ? 'Aucune procédure disponible pour ce type de permis' 
                : 'No procedures available for this permit type'
              }
            </p>
          </div>
        )}
      </div>

      {/* =================== EXÉCUTION PROCÉDURES =================== */}
      {selectedProcedureTemplates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {language === 'fr' ? 'Exécution des procédures' : 'Procedure execution'}
            </h4>
            <div className="flex items-center gap-2">
              {!isExecuting ? (
                <button
                  onClick={() => {
                    setIsExecuting(true);
                    const firstStep = selectedProcedureTemplates[0]?.steps[0];
                    if (firstStep) {
                      setCurrentStep(firstStep.id);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700"
                >
                  <Play className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Démarrer' : 'Start'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsExecuting(false);
                    setCurrentStep(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-medium transition-all active:bg-red-700"
                >
                  <Pause className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Arrêter' : 'Stop'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress global */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {language === 'fr' ? 'Progression globale' : 'Overall progress'}
              </span>
              <span className="text-sm text-gray-600">
                {completedSteps}/{totalSteps} ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Liste des étapes */}
          <div className="space-y-4">
            {selectedProcedureTemplates.map(procedure => (
              <div key={procedure.id} className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-3">
                  {procedure.name[language]}
                </h5>
                <div className="space-y-3">
                  {procedure.steps.map(step => {
                    const stepExecution = executionSteps[step.id];
                    const isCurrent = currentStep === step.id;
                    const timer = stepTimers[step.id];

                    return (
                      <StepExecutionCard
                        key={step.id}
                        step={step}
                        execution={stepExecution}
                        isCurrent={isCurrent}
                        isExecuting={isExecuting}
                        timer={timer}
                        language={language}
                        onStart={() => startStepExecution(step.id)}
                        onComplete={(status) => completeStepExecution(step.id, status)}
                        onAddNote={(note) => updateStepExecution(step.id, 'notes', note)}
                        onVoiceInput={() => startVoiceInput(step.id, 'notes')}
                        onVideoCapture={() => startVideoCapture(step.id)}
                        enableVoiceInput={enableVoiceInput}
                        enableVideoCapture={enableVideoCapture}
                        touchOptimized={touchOptimized}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================== MODAL VOICE INPUT =================== */}
      <AnimatePresence>
        {voiceInput.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {voiceInput.isListening ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-6 bg-red-500 rounded animate-pulse" />
                      <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'fr' ? 'Note vocale' : 'Voice note'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {voiceInput.isListening 
                    ? (language === 'fr' ? 'Enregistrement en cours...' : 'Recording...')
                    : (language === 'fr' ? 'Appuyez pour parler' : 'Tap to speak')
                  }
                </p>
                
                {voiceInput.transcript && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">"{voiceInput.transcript}"</p>
                    {voiceInput.confidence > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(voiceInput.confidence * 100)}% {language === 'fr' ? 'confiance' : 'confidence'}
                      </p>
                    )}
                  </div>
                )}
                
                {voiceInput.error && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600">{voiceInput.error}</p>
                  </div>
                )}
                
                <button
                  onClick={stopVoiceInput}
                  className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  {language === 'fr' ? 'Terminer' : 'Finish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== VIDEO CAPTURE HIDDEN =================== */}
      <video 
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
    </div>
  );
};

// =================== COMPOSANT CARTE PROCÉDURE ===================
const ProcedureCard: React.FC<{
  procedure: ProcedureTemplate;
  isSelected: boolean;
  progress: number;
  language: 'fr' | 'en';
  onToggle: () => void;
  onExecute: () => void;
  touchOptimized: boolean;
}> = ({ procedure, isSelected, progress, language, onToggle, onExecute, touchOptimized }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const categoryIcons = {
    safety: <Shield className="w-4 h-4" />,
    emergency: <AlertTriangle className="w-4 h-4" />,
    communication: <Radio className="w-4 h-4" />,
    evacuation: <Activity className="w-4 h-4" />
  };

  return (
    <div className={`
      border rounded-lg transition-all
      ${isSelected 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-gray-200 bg-white hover:bg-gray-50'
      }
    `}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className={`
              flex-shrink-0 w-6 h-6 border-2 rounded flex items-center justify-center transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${touchOptimized ? 'active:scale-95' : ''}
            `}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </button>
          
          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-1">
                  {procedure.name[language]}
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  {procedure.description[language]}
                </p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border
                    ${priorityColors[procedure.priority]}
                  `}>
                    {categoryIcons[procedure.category]}
                    {procedure.priority}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    <Clock className="w-3 h-3" />
                    {procedure.estimatedTime} min
                  </span>
                  
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    <CheckSquare className="w-3 h-3" />
                    {procedure.steps.length} {language === 'fr' ? 'étapes' : 'steps'}
                  </span>
                </div>
                
                {/* Progress si sélectionné */}
                {isSelected && progress > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        {language === 'fr' ? 'Progression' : 'Progress'}
                      </span>
                      <span className="text-xs text-gray-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {isSelected && (
                  <button
                    onClick={onExecute}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium transition-all active:bg-green-700"
                  >
                    <Play className="w-3 h-3" />
                    {language === 'fr' ? 'Exécuter' : 'Execute'}
                  </button>
                )}
                
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Détails expandables */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden mt-3 pt-3 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Personnel requis */}
                <div>
                  <h6 className="font-medium text-gray-900 mb-1">
                    {language === 'fr' ? 'Personnel requis' : 'Required personnel'}
                  </h6>
                  <ul className="text-gray-600 space-y-0.5">
                    {procedure.requiredPersonnel.map((role, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Équipements requis */}
                <div>
                  <h6 className="font-medium text-gray-900 mb-1">
                    {language === 'fr' ? 'Équipements requis' : 'Required equipment'}
                  </h6>
                  <ul className="text-gray-600 space-y-0.5">
                    {procedure.equipmentRequired.map((equipment, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <HardHat className="w-3 h-3" />
                        {equipment}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Références réglementaires */}
              {procedure.regulatoryReference.length > 0 && (
                <div className="mt-3">
                  <h6 className="font-medium text-gray-900 mb-1">
                    {language === 'fr' ? 'Références réglementaires' : 'Regulatory references'}
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {procedure.regulatoryReference.map((ref, index) => (
                      <span key={index} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =================== COMPOSANT CARTE EXÉCUTION ÉTAPE ===================
const StepExecutionCard: React.FC<{
  step: ProcedureStepTemplate;
  execution?: StepExecution;
  isCurrent: boolean;
  isExecuting: boolean;
  timer?: number;
  language: 'fr' | 'en';
  onStart: () => void;
  onComplete: (status: 'completed' | 'failed' | 'skipped') => void;
  onAddNote: (note: string) => void;
  onVoiceInput: () => void;
  onVideoCapture: () => void;
  enableVoiceInput: boolean;
  enableVideoCapture: boolean;
  touchOptimized: boolean;
}> = ({ 
  step, 
  execution, 
  isCurrent, 
  isExecuting,
  timer,
  language, 
  onStart, 
  onComplete, 
  onAddNote, 
  onVoiceInput, 
  onVideoCapture,
  enableVoiceInput,
  enableVideoCapture,
  touchOptimized 
}) => {
  const [noteText, setNoteText] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const statusIcons = {
    pending: <Square className="w-4 h-4 text-gray-400" />,
    'in-progress': <Clock className="w-4 h-4 text-blue-600 animate-pulse" />,
    completed: <CheckCircle className="w-4 h-4 text-green-600" />,
    failed: <AlertTriangle className="w-4 h-4 text-red-600" />,
    skipped: <X className="w-4 h-4 text-gray-400" />
  };

  const statusColors = {
    pending: 'border-gray-200 bg-white',
    'in-progress': 'border-blue-300 bg-blue-50',
    completed: 'border-green-300 bg-green-50',
    failed: 'border-red-300 bg-red-50',
    skipped: 'border-gray-300 bg-gray-50'
  };

  const typeIcons = {
    action: <Activity className="w-4 h-4" />,
    verification: <Eye className="w-4 h-4" />,
    measurement: <Gauge className="w-4 h-4" />,
    communication: <Radio className="w-4 h-4" />,
    decision: <CheckCircle className="w-4 h-4" />
  };

  const status = execution?.status || 'pending';

  return (
    <div className={`
      border rounded-lg p-3 transition-all
      ${statusColors[status]}
      ${isCurrent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    `}>
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="flex-shrink-0 mt-0.5">
          {statusIcons[status]}
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h6 className="font-medium text-gray-900 text-sm">
                  {step.order}. {step.title[language]}
                </h6>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {typeIcons[step.type]}
                  {step.type}
                </span>
                {step.isRequired && (
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                    {language === 'fr' ? 'Requis' : 'Required'}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {step.description[language]}
              </p>
              
              {/* Timer si actif */}
              {timer !== undefined && timer > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              
              {/* Critères d'acceptation */}
              <div className="bg-gray-50 rounded p-2 mb-2">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'fr' ? 'Critères d\'acceptation:' : 'Acceptance criteria:'}
                </p>
                <p className="text-xs text-gray-800">
                  {step.acceptanceCriteria[language]}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              {status === 'pending' && isExecuting && (
                <button
                  onClick={onStart}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium transition-all active:bg-blue-700"
                >
                  <Play className="w-3 h-3" />
                  {language === 'fr' ? 'Démarrer' : 'Start'}
                </button>
              )}
              
              {status === 'in-progress' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onComplete('completed')}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium transition-all active:bg-green-700"
                  >
                    <Check className="w-3 h-3" />
                    {language === 'fr' ? 'Terminé' : 'Complete'}
                  </button>
                  <button
                    onClick={() => onComplete('failed')}
                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium transition-all active:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                    {language === 'fr' ? 'Échec' : 'Fail'}
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          
          {/* Détails expandables */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 border-t border-gray-200 space-y-3">
                  {/* Précautions */}
                  {step.precautions[language].length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-gray-900 mb-1">
                        {language === 'fr' ? 'Précautions:' : 'Precautions:'}
                      </h6>
                      <ul className="space-y-0.5">
                        {step.precautions[language].map((precaution, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-orange-600 mt-0.5">•</span>
                            {precaution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Notes et captures */}
                  <div>
                    <h6 className="text-xs font-medium text-gray-900 mb-2">
                      {language === 'fr' ? 'Notes et observations:' : 'Notes and observations:'}
                    </h6>
                    
                    {/* Zone saisie note */}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder={language === 'fr' ? 'Ajouter une note...' : 'Add a note...'}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && noteText.trim()) {
                            onAddNote(noteText.trim());
                            setNoteText('');
                          }
                        }}
                      />
                      
                      {enableVoiceInput && (
                        <button
                          onClick={onVoiceInput}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          title={language === 'fr' ? 'Note vocale' : 'Voice note'}
                        >
                          <Mic className="w-3 h-3 text-gray-600" />
                        </button>
                      )}
                      
                      {enableVideoCapture && (
                        <button
                          onClick={onVideoCapture}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          title={language === 'fr' ? 'Capture vidéo' : 'Video capture'}
                        >
                          <Video className="w-3 h-3 text-gray-600" />
                        </button>
                      )}
                    </div>
                    
                    {/* Notes existantes */}
                    {execution?.notes && (
                      <div className="bg-gray-50 rounded p-2 text-xs text-gray-700">
                        {execution.notes}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default ProceduresSection;
