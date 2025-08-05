'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand, MessageSquare
} from 'lucide-react';

// =================== ✅ IMPORTS DES COMPOSANTS STEPS 1-6 ===================
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Permits from './steps/Step4Permits';
import Step5Validation from './steps/Step5Validation';
import Step6Finalization from './steps/Step6Finalization';

// =================== INTERFACES PRINCIPALES ===================
interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
  formData: any;
  onDataChange: (section: string, data: any) => void;
}

interface StepConfig {
  id: string;
  title: { fr: string; en: string };
  icon: React.ComponentType<{ size?: number; className?: string }>;
  component: React.ComponentType<any>;
  isRequired: boolean;
  minCompletionTime: number; // en secondes
}

interface ValidationError {
  field: string;
  message: { fr: string; en: string };
  severity: 'error' | 'warning' | 'info';
}

interface ASTState {
  currentStep: number;
  isNavigating: boolean;
  hasChanges: boolean;
  lastSaved: Date | null;
  errors: { [stepId: string]: ValidationError[] };
  completedSteps: number[];
  stepStartTimes: { [stepId: string]: Date };
  networkStatus: 'online' | 'offline';
  autoSaveEnabled: boolean;
}

// =================== CONFIGURATION DES STEPS ===================
const STEPS_CONFIG: StepConfig[] = [
  {
    id: 'projectInfo',
    title: { 
      fr: '📋 Informations Projet', 
      en: '📋 Project Information' 
    },
    icon: Building,
    component: Step1ProjectInfo,
    isRequired: true,
    minCompletionTime: 120
  },
  {
    id: 'equipment',
    title: { 
      fr: '🔧 Équipements & Outils', 
      en: '🔧 Equipment & Tools' 
    },
    icon: Wrench,
    component: Step2Equipment,
    isRequired: true,
    minCompletionTime: 180
  },
  {
    id: 'hazards',
    title: { 
      fr: '⚠️ Identification Dangers', 
      en: '⚠️ Hazard Identification' 
    },
    icon: AlertTriangle,
    component: Step3Hazards,
    isRequired: true,
    minCompletionTime: 240
  },
  {
    id: 'permits',
    title: { 
      fr: '📄 Permis & Autorisations', 
      en: '📄 Permits & Authorizations' 
    },
    icon: FileText,
    component: Step4Permits,
    isRequired: true,
    minCompletionTime: 150
  },
  {
    id: 'validation',
    title: { 
      fr: '✅ Validation & Révision', 
      en: '✅ Validation & Review' 
    },
    icon: CheckCircle,
    component: Step5Validation,
    isRequired: true,
    minCompletionTime: 180
  },
  {
    id: 'finalization',
    title: { 
      fr: '🛡️ Finalisation & Équipe', 
      en: '🛡️ Finalization & Team' 
    },
    icon: Shield,
    component: Step6Finalization,
    isRequired: false,
    minCompletionTime: 300
  }
];

// =================== TRADUCTIONS PRINCIPALES ===================
const translations = {
  fr: {
    title: "🛡️ Nouvelle Analyse Sécuritaire de Travail (AST)",
    subtitle: "Création d'une analyse complète en 6 étapes",
    navigation: {
      previous: "← Précédent",
      next: "Suivant →",
      finish: "Terminer",
      save: "💾 Sauvegarder",
      preview: "👁️ Aperçu",
      export: "📤 Exporter"
    },
    status: {
      draft: "🔄 Brouillon",
      inProgress: "⏳ En cours",
      completed: "✅ Complétée",
      validated: "🛡️ Validée",
      archived: "📁 Archivée"
    },
    progress: {
      stepOf: "Étape {current} sur {total}",
      completion: "Complétion: {percent}%",
      timeSpent: "Temps passé: {time}",
      estimatedTime: "Temps estimé: {time}"
    },
    validation: {
      requiredField: "Ce champ est obligatoire",
      invalidFormat: "Format invalide",
      minimumTime: "Temps minimum requis: {time} secondes",
      unsavedChanges: "Vous avez des modifications non sauvegardées"
    },
    messages: {
      autoSaved: "✅ Sauvegarde automatique",
      saveError: "❌ Erreur de sauvegarde",
      offline: "📡 Mode hors ligne",
      online: "🌐 Connecté",
      dataLoaded: "✅ Données chargées",
      validationComplete: "✅ Validation terminée"
    }
  },
  en: {
    title: "🛡️ New Job Safety Analysis (JSA)",
    subtitle: "Creating a complete analysis in 6 steps",
    navigation: {
      previous: "← Previous",
      next: "Next →",
      finish: "Finish",
      save: "💾 Save",
      preview: "👁️ Preview",
      export: "📤 Export"
    },
    status: {
      draft: "🔄 Draft",
      inProgress: "⏳ In Progress",
      completed: "✅ Completed",
      validated: "🛡️ Validated",
      archived: "📁 Archived"
    },
    progress: {
      stepOf: "Step {current} of {total}",
      completion: "Completion: {percent}%",
      timeSpent: "Time spent: {time}",
      estimatedTime: "Estimated time: {time}"
    },
    validation: {
      requiredField: "This field is required",
      invalidFormat: "Invalid format",
      minimumTime: "Minimum time required: {time} seconds",
      unsavedChanges: "You have unsaved changes"
    },
    messages: {
      autoSaved: "✅ Auto-saved",
      saveError: "❌ Save error",
      offline: "📡 Offline mode",
      online: "🌐 Connected",
      dataLoaded: "✅ Data loaded",
      validationComplete: "✅ Validation complete"
    }
  }
};

// =================== FONCTION PRINCIPALE ASTFORM ===================
function ASTForm({ 
  tenant, 
  language = 'fr', 
  userId, 
  userRole = 'worker',
  formData,
  onDataChange
}: ASTFormProps) {
  
  // =================== TRADUCTIONS ===================
  const t = translations[language] || translations.fr;
  
  // =================== ÉTAT PRINCIPAL OPTIMISÉ ===================
  const [astState, setAstState] = useState<ASTState>(() => ({
    currentStep: 0,
    isNavigating: false,
    hasChanges: false,
    lastSaved: null,
    errors: {},
    completedSteps: [],
    stepStartTimes: { 'projectInfo': new Date() },
    networkStatus: 'online',
    autoSaveEnabled: true
  }));

  // =================== REFS POUR PERFORMANCE ===================
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeTrackingRef = useRef<{ [stepId: string]: number }>({});

  // =================== ÉTAT DONNÉES AST ===================
  const [localFormData, setLocalFormData] = useState(() => ({
    ...formData,
    id: formData.id || `ast_${Date.now()}`,
    astNumber: formData.astNumber || `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId || 'anonymous',
    tenant,
    language
  }));

  // =================== UTILITAIRES TEMPS ===================
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getCurrentStepTime = useCallback((): number => {
    const stepId = STEPS_CONFIG[astState.currentStep]?.id;
    if (!stepId || !astState.stepStartTimes[stepId]) return 0;
    
    return Math.floor((Date.now() - astState.stepStartTimes[stepId].getTime()) / 1000);
  }, [astState.currentStep, astState.stepStartTimes]);

  // =================== GESTIONNAIRES DONNÉES OPTIMISÉS ===================
  
  /**
   * ✅ HANDLER PRINCIPAL - CHANGEMENT DE DONNÉES SECTION
   * Gère les updates de chaque step avec validation et sauvegarde
   */
  const handleDataChange = useCallback((section: string, newData: any) => {
    console.log(`📝 ASTForm - Mise à jour section ${section}:`, newData);
    
    // Mise à jour des données locales
    const updatedFormData = {
      ...localFormData,
      [section]: newData,
      updatedAt: new Date().toISOString()
    };
    
    setLocalFormData(updatedFormData);
    
    // Notification parent
    onDataChange(section, newData);
    
    // Marquer comme modifié
    setAstState(prev => ({ 
      ...prev, 
      hasChanges: true 
    }));
    
    // Auto-sauvegarde avec délai
    if (astState.autoSaveEnabled) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000); // 2 secondes de délai
    }
  }, [localFormData, onDataChange, astState.autoSaveEnabled]);

  /**
   * ✅ HANDLER NAVIGATION - CHANGEMENT D'ÉTAPE
   */
  const handleStepChange = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= STEPS_CONFIG.length) return;
    if (astState.isNavigating) return;
    
    console.log(`🚀 Navigation vers step ${stepIndex + 1}`);
    
    setAstState(prev => ({ ...prev, isNavigating: true }));
    
    // Enregistrer le temps passé sur l'étape actuelle
    const currentStepId = STEPS_CONFIG[astState.currentStep]?.id;
    if (currentStepId) {
      stepTimeTrackingRef.current[currentStepId] = getCurrentStepTime();
    }
    
    // Délai de navigation pour smooth UX
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    navigationTimeoutRef.current = setTimeout(() => {
      const newStepId = STEPS_CONFIG[stepIndex]?.id;
      
      setAstState(prev => ({
        ...prev,
        currentStep: stepIndex,
        isNavigating: false,
        stepStartTimes: {
          ...prev.stepStartTimes,
          [newStepId]: new Date()
        }
      }));
    }, 300);
  }, [astState.currentStep, astState.isNavigating, getCurrentStepTime]);

  /**
   * ✅ HANDLER SAUVEGARDE AUTOMATIQUE
   */
  const handleAutoSave = useCallback(async () => {
    try {
      console.log('💾 Auto-sauvegarde en cours...');
      
      // Simulation sauvegarde (remplacer par API réelle)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAstState(prev => ({
        ...prev,
        hasChanges: false,
        lastSaved: new Date()
      }));
      
      console.log('✅ Auto-sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur auto-sauvegarde:', error);
    }
  }, []);

  /**
   * ✅ HANDLER VALIDATION ÉTAPE
   */
  const validateCurrentStep = useCallback((): boolean => {
    const currentStepConfig = STEPS_CONFIG[astState.currentStep];
    if (!currentStepConfig) return true;
    
    const stepData = localFormData[currentStepConfig.id];
    const errors: ValidationError[] = [];
    
    // Validation temps minimum
    const timeSpent = getCurrentStepTime();
    if (timeSpent < currentStepConfig.minCompletionTime && currentStepConfig.isRequired) {
      errors.push({
        field: 'time',
        message: {
          fr: `Temps minimum requis: ${currentStepConfig.minCompletionTime} secondes`,
          en: `Minimum time required: ${currentStepConfig.minCompletionTime} seconds`
        },
        severity: 'warning'
      });
    }
    
    // Validation données requises (basique)
    if (currentStepConfig.isRequired && (!stepData || Object.keys(stepData).length === 0)) {
      errors.push({
        field: 'data',
        message: {
          fr: 'Cette étape est obligatoire',
          en: 'This step is required'
        },
        severity: 'error'
      });
    }
    
    // Mise à jour des erreurs
    setAstState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [currentStepConfig.id]: errors
      }
    }));
    
    return errors.filter(e => e.severity === 'error').length === 0;
  }, [astState.currentStep, localFormData, getCurrentStepTime]);

  // =================== CALCUL PROGRESSION ===================
  const getCompletionPercentage = useCallback((): number => {
    const totalSteps = STEPS_CONFIG.length;
    const completedSteps = astState.completedSteps.length;
    const currentProgress = (astState.currentStep + 0.5) / totalSteps;
    
    return Math.min(Math.round((completedSteps + currentProgress) / totalSteps * 100), 100);
  }, [astState.completedSteps.length, astState.currentStep]);

  // =================== EFFETS DE CYCLE DE VIE ===================
  
  /**
   * ✅ EFFET DÉTECTION RÉSEAU
   */
  useEffect(() => {
    const handleOnline = () => setAstState(prev => ({ ...prev, networkStatus: 'online' }));
    const handleOffline = () => setAstState(prev => ({ ...prev, networkStatus: 'offline' }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * ✅ EFFET NETTOYAGE TIMEOUTS
   */
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * ✅ EFFET AVERTISSEMENT FERMETURE PAGE
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (astState.hasChanges) {
        e.preventDefault();
        e.returnValue = t.validation.unsavedChanges;
        return t.validation.unsavedChanges;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [astState.hasChanges, t.validation.unsavedChanges]);

  // =================== GESTIONNAIRES NAVIGATION ===================
  const handlePrevious = useCallback(() => {
    if (astState.currentStep > 0) {
      handleStepChange(astState.currentStep - 1);
    }
  }, [astState.currentStep, handleStepChange]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      if (astState.currentStep < STEPS_CONFIG.length - 1) {
        handleStepChange(astState.currentStep + 1);
      }
    }
  }, [astState.currentStep, validateCurrentStep, handleStepChange]);

  const handleFinish = useCallback(async () => {
    if (validateCurrentStep()) {
      console.log('🏁 Finalisation AST...');
      await handleAutoSave();
      
      setLocalFormData(prev => ({
        ...prev,
        status: 'completed',
        completedAt: new Date().toISOString()
      }));
      
      console.log('✅ AST finalisée avec succès');
    }
  }, [validateCurrentStep, handleAutoSave]);

  // =================== VARIABLES CALCULÉES ===================
  const currentStepConfig = STEPS_CONFIG[astState.currentStep];
  const CurrentStepComponent = currentStepConfig?.component;
  const completionPercentage = getCompletionPercentage();
  const currentStepTime = getCurrentStepTime();
  const hasErrors = Object.values(astState.errors).some(errors => 
    errors.some(error => error.severity === 'error')
  );
  const isLastStep = astState.currentStep === STEPS_CONFIG.length - 1;
  // =================== 🚨 FIX DÉFINITIF BOUCLE INFINIE - HANDLERS DIRECTS ===================
  
  /**
   * ✅ FIX CRITIQUE : HANDLERS DIRECTS SANS DÉBOUNCE POUR STEP6
   * Le problème venait du système de débounce qui créait des boucles infinies
   * Solution : Handler direct pour Step6, débounce pour les autres steps
   */
  
  // ✅ STEP 1 HANDLER - INCHANGÉ (fonctionne bien)
  const handleStep1DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep1DataChange appelé:', { section, data });
    
    if (section === 'astNumber') {
      if (astData.astNumber === data) {
        console.log('🛡️ ASTForm astNumber identique, skip');
        return;
      }
      setAstData(prev => ({ ...prev, astNumber: data, updatedAt: new Date().toISOString() }));
      setHasUnsavedChanges(true);
      return;
    }
    
    const debouncedHandler = createDebouncedHandler('Step1');
    debouncedHandler(section, data);
  }, [astData.astNumber, createDebouncedHandler]);

  // ✅ STEP 2-5 HANDLERS - INCHANGÉS (fonctionnent bien)
  const handleStep2DataChange = useCallback(createDebouncedHandler('Step2'), [createDebouncedHandler]);
  const handleStep3DataChange = useCallback(createDebouncedHandler('Step3'), [createDebouncedHandler]);
  const handleStep4DataChange = useCallback(createDebouncedHandler('Step4'), [createDebouncedHandler]);
  const handleStep5DataChange = useCallback(createDebouncedHandler('Step5'), [createDebouncedHandler]);

  // ✅ STEP 6 HANDLER - FIX CRITIQUE : HANDLER DIRECT SANS DÉBOUNCE
  const handleStep6DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm Step6 - Handler DIRECT appelé:', { section, data });
    
    // ✅ Handler direct immédiat pour éviter les boucles infinies
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      const newState = {
        ...prev,
        [section]: newSection,
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ ASTForm Step6 - Mise à jour DIRECTE réussie:', { section, newSection });
      return newState;
    });
    
    setHasUnsavedChanges(true);
  }, []);

  // =================== FONCTIONS UTILITAIRES SUPPLÉMENTAIRES ===================
  const handleCopyAST = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(astData.astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  }, [astData.astNumber]);

  const changeStatus = useCallback((newStatus: ASTData['status']) => {
    setAstData(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // =================== STATUS BADGE AVEC TRADUCTIONS ===================
  const getStatusBadge = useCallback(() => {
    const statusConfig = {
      'draft': { color: '#64748b', text: t.status.draft, icon: Edit },
      'pending_verification': { color: '#f59e0b', text: t.status.pending_verification, icon: Clock },
      'approved': { color: '#10b981', text: t.status.approved, icon: CheckCircle },
      'auto_approved': { color: '#059669', text: t.status.auto_approved, icon: CheckCircle },
      'rejected': { color: '#ef4444', text: t.status.rejected, icon: AlertTriangle }
    };

    const config = statusConfig[astData.status];
    const Icon = config.icon;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isMobile ? '6px 12px' : '8px 16px',
        background: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        borderRadius: '20px',
        color: config.color,
        fontSize: isMobile ? '12px' : '14px',
        fontWeight: '500'
      }}>
        <Icon size={isMobile ? 14 : 16} />
        {config.text}
      </div>
    );
  }, [astData.status, t.status, isMobile]);

  // =================== EFFECTS ULTRA-OPTIMISÉS ===================
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
    if (savedLanguage && savedLanguage !== currentLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveTimer = setTimeout(() => {
        console.log('🔄 Sauvegarde automatique...');
        setHasUnsavedChanges(false);
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      lastUpdateRef.current = {};
      isUpdatingRef.current = {};
    };
  }, []);

  // =================== COMPOSANTS MÉMORISÉS POUR ÉVITER RE-RENDERS ===================
  const MemoizedStep1 = React.memo(Step1ProjectInfo);
  const MemoizedStep2 = React.memo(Step2Equipment);
  const MemoizedStep3 = React.memo(Step3Hazards);
  const MemoizedStep4 = React.memo(Step4Permits);
  const MemoizedStep5 = React.memo(Step5Validation);
  const MemoizedStep6 = React.memo(Step6Finalization);

  // =================== RENDU DU CONTENU DES STEPS - OPTIMISÉ FINAL ===================
  const StepContent = React.memo(() => {
    console.log('🔥 StepContent render - Step:', currentStep);
    
    // ✅ Props stables pour éviter re-render
    const stepProps = {
      formData: astData,
      language: currentLanguage,
      tenant: tenant,
      errors: {}
    };
    
    switch (currentStep) {
      case 1:
        return (
          <MemoizedStep1
            key="step1"
            {...stepProps}
            onDataChange={handleStep1DataChange}
          />
        );
      case 2:
        return (
          <MemoizedStep2
            key="step2"
            {...stepProps}
            onDataChange={handleStep2DataChange}
          />
        );
      case 3:
        return (
          <MemoizedStep3
            key="step3"
            {...stepProps}
            onDataChange={handleStep3DataChange}
          />
        );
      case 4:
        return (
          <MemoizedStep4
            key="step4"
            {...stepProps}
            onDataChange={handleStep4DataChange}
            province={'QC'}
            userRole={'worker'}
            touchOptimized={true}
            compactMode={false}
            onPermitChange={(permits) => {
              handleStep4DataChange('permits', permits);
            }}
            initialPermits={[]}
          />
        );
      case 5:
        return (
          <MemoizedStep5
            key="step5"
            {...stepProps}
            onDataChange={handleStep5DataChange}
          />
        );
      case 6:
        return (
          <MemoizedStep6
            key="step6"
            {...stepProps}
            onDataChange={handleStep6DataChange}
          />
        );
      default:
        return null;
    }
  });

  // =================== HEADER MOBILE AVEC SÉLECTEUR DE LANGUE ===================
  const MobileHeader = () => (
    <header style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #000 0%, #1e293b 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <span style={{ 
            color: '#f59e0b', 
            fontSize: '16px', 
            fontWeight: 'bold' 
          }}>
            C🛡️
          </span>
        </div>
        
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {t.title}
          </h1>
          <div style={{
            color: '#94a3b8',
            fontSize: '12px',
            margin: '2px 0 0 0',
            fontWeight: '400'
          }}>
            AST #{astData.astNumber.slice(-6)} • {tenant}
          </div>
        </div>
        
        <LanguageSelector />
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '6px 10px',
          borderRadius: '16px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            color: '#22c55e',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {t.active}
          </span>
        </div>
        
        {getStatusBadge()}
      </div>
    </header>
  );

  // =================== HEADER DESKTOP AVEC SÉLECTEUR DE LANGUE ===================
  const DesktopHeader = () => (
    <header style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(0, 0, 0, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(251, 191, 36, 0.1)',
      padding: '24px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div 
            className="float-animation glow-effect"
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
              padding: '32px',
              borderRadius: '32px',
              border: '4px solid #f59e0b',
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: '96px',
              height: '96px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <img 
                src="/c-secur360-logo.png" 
                alt="C-Secur360"
                className="logo-glow"
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'contain',
                  filter: 'brightness(1.2) contrast(1.1)'
                }}
                onError={(e) => {
                  console.log('❌ Erreur chargement logo:', e);
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div style={{ 
                display: 'none',
                color: '#f59e0b', 
                fontSize: '48px', 
                fontWeight: '900',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                C🛡️
              </div>
            </div>
            
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
              animation: 'shine 2.5s ease-in-out infinite'
            }} />
            
            <div style={{
              position: 'absolute',
              inset: '-10px',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '40px',
              animation: 'pulse 3s ease-in-out infinite'
            }} />
          </div>
          
          <div className="slide-in-right">
            <h1 className="text-gradient" style={{
              fontSize: '40px',
              margin: 0,
              lineHeight: 1.2,
              fontWeight: '900',
              letterSpacing: '-0.025em'
            }}>
              {t.title}
            </h1>
            <p style={{
              color: 'rgba(251, 191, 36, 0.9)',
              fontSize: '20px',
              margin: 0,
              fontWeight: '600'
            }}>
              {t.subtitle} • {tenant}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#22c55e'
              }} className="pulse-animation" />
              <span style={{
                color: '#22c55e',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {t.systemOperational}
              </span>
              <p style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                margin: 0,
                fontWeight: '500'
              }}>
                {t.astStep} {currentStep} {t.stepOf} {steps.length}
              </p>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          <LanguageSelector />
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield size={16} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                {t.astNumber}
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#ffffff',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {astData.astNumber}
                <button
                  onClick={handleCopyAST}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#10b981' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.2s'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isOnline ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#ef4444" />}
            <span style={{ fontSize: '12px', color: isOnline ? '#10b981' : '#ef4444' }}>
              {isOnline ? t.online : t.offline}
            </span>
          </div>

          {(userRole === 'supervisor' || userRole === 'manager') && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => changeStatus('pending_verification')}
                disabled={astData.status !== 'draft'}
                className="btn-premium"
                style={{
                  opacity: astData.status === 'draft' ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
              >
                <Bell size={12} />
                {t.submit}
              </button>
              
              <button
                onClick={() => changeStatus('approved')}
                disabled={astData.status !== 'pending_verification'}
                className="btn-premium"
                style={{
                  opacity: astData.status === 'pending_verification' ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}
              >
                <CheckCircle size={12} />
                {t.approve}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // =================== NAVIGATION STEPS MOBILE AVEC TRADUCTIONS ===================
  const MobileStepsNavigation = () => (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              background: currentStep === step.id 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(30, 41, 59, 0.6)',
              border: currentStep === step.id 
                ? '1px solid #3b82f6' 
                : '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: '12px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: currentStep === step.id ? 'translateY(-2px)' : 'none',
              boxShadow: currentStep === step.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onClick={() => handleStepClick(step.id)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 6px',
              background: currentStep === step.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep === step.id ? '#3b82f6' : '#60a5fa',
              fontSize: '14px'
            }}>
              {getCurrentCompletedSteps() > step.id - 1 ? '✓' : 
               currentStep === step.id ? <step.icon size={16} /> : 
               <step.icon size={14} />}
            </div>
            <div style={{
              color: currentStep === step.id ? '#ffffff' : '#e2e8f0',
              fontSize: '11px',
              fontWeight: '600',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {step.title}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '12px' }}>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            borderRadius: '3px',
            transition: 'width 0.5s ease',
            width: `${getCompletionPercentage()}%`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'progressShine 2s ease-in-out infinite'
            }} />
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          marginTop: '6px',
          fontWeight: '500'
        }}>
          {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/6 • {Math.round(getCompletionPercentage())}% {t.completed}
        </div>
      </div>
    </div>
  );

  // =================== NAVIGATION DESKTOP AVEC TRADUCTIONS ===================
  const DesktopStepsNavigation = () => (
    <div className="glass-effect slide-in desktop-only" style={{ 
      padding: '24px', 
      marginBottom: '24px',
      maxWidth: '1200px',
      margin: '20px auto 24px'
    }}>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
            {t.progress}
          </h2>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            {Math.round((currentStep / steps.length) * 100)}% {t.completed}
          </span>
        </div>
        
        <div style={{
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '12px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${steps[0]?.color || '#3b82f6'}, ${steps[Math.min(currentStep - 1, steps.length - 1)]?.color || '#10b981'})`,
            height: '100%',
            width: `${(currentStep / steps.length) * 100}%`,
            transition: 'width 0.5s ease',
            borderRadius: '12px'
          }} />
        </div>
      </div>

      <div className="step-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px'
      }}>
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            style={{
              background: currentStep === step.id 
                ? `linear-gradient(135deg, ${step.color}25, ${step.color}15)`
                : 'rgba(30, 41, 59, 0.5)',
              border: currentStep === step.id 
                ? `2px solid ${step.color}` 
                : '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              padding: '16px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              transition: 'all 0.3s ease',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            className="mobile-touch"
          >
            {step.required && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '6px',
                height: '6px',
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            )}
            
            <div style={{
              width: '40px',
              height: '40px',
              background: currentStep === step.id ? step.color : 'rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              margin: '0 auto 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <step.icon size={20} color={currentStep === step.id ? '#ffffff' : '#94a3b8'} />
            </div>
            
            <h3 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: currentStep === step.id ? '#ffffff' : '#94a3b8',
              margin: '0 0 4px',
              lineHeight: '1.2'
            }}>
              {step.title}
            </h3>
            
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.3'
            }}>
              {step.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // =================== NAVIGATION MOBILE FIXE AVEC TRADUCTIONS ===================
  const MobileNavigation = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(100, 116, 139, 0.3)',
      padding: '16px 20px',
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            background: currentStep === 1 ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.2)',
            color: currentStep === 1 ? '#94a3b8' : '#94a3b8',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          <ArrowLeft size={16} />
          {t.previous}
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentStep === 6 || !canNavigateToNext()}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: (currentStep === 6 || !canNavigateToNext()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            background: (currentStep === 6 || !canNavigateToNext()) 
              ? 'rgba(100, 116, 139, 0.3)' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#ffffff',
            opacity: (currentStep === 6 || !canNavigateToNext()) ? 0.5 : 1
          }}
        >
          {currentStep === 6 ? t.finished : t.next}
          {currentStep !== 6 && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );

  // =================== NAVIGATION FOOTER DESKTOP AVEC TRADUCTIONS ===================
  const DesktopFooterNavigation = () => (
    <div className="glass-effect desktop-only" style={{ 
      padding: '20px 24px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      bottom: '16px',
      flexWrap: 'wrap',
      gap: '16px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <button
        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
        disabled={currentStep === 1}
        className="mobile-touch"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 20px',
          background: currentStep === 1 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(59, 130, 246, 0.2)',
          border: currentStep === 1 ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
          borderRadius: '12px',
          color: currentStep === 1 ? '#9ca3af' : '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={18} />
        {t.previous}
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: '#94a3b8',
        fontSize: '14px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Save size={14} />
          <span>{t.autoSave}</span>
        </div>
        <div style={{
          width: '6px',
          height: '6px',
          background: hasUnsavedChanges ? '#f59e0b' : '#10b981',
          borderRadius: '50%',
          animation: hasUnsavedChanges ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '12px', color: hasUnsavedChanges ? '#f59e0b' : '#10b981' }}>
          {hasUnsavedChanges ? t.saving : t.saved}
        </span>
      </div>

      <button
        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
        disabled={currentStep === steps.length}
        className="mobile-touch"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 20px',
          background: currentStep === steps.length 
            ? 'rgba(75, 85, 99, 0.3)' 
            : `linear-gradient(135deg, ${steps[currentStep]?.color || '#10b981'}, ${steps[currentStep]?.color || '#059669'}CC)`,
          border: `1px solid ${steps[currentStep]?.color || '#10b981'}80`,
          borderRadius: '12px',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          cursor: currentStep === steps.length ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {t.next}
        <ArrowRight size={18} />
      </button>
    </div>
  );

  // =================== CSS MOBILE OPTIMISÉ ULTRA-COMPLET ===================
  const mobileOptimizedCSS = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(1deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    @keyframes shine {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15);
      }
      50% { 
        box-shadow: 0 0 70px rgba(245, 158, 11, 0.8), inset 0 0 40px rgba(245, 158, 11, 0.25);
      }
    }
    
    @keyframes progressShine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .float-animation { animation: float 6s ease-in-out infinite; }
    .pulse-animation { animation: pulse 4s ease-in-out infinite; }
    .slide-in { animation: slideIn 0.5s ease-out; }
    .slide-in-right { animation: slideIn 0.6s ease-out; }
    .glow-effect { animation: glow 4s ease-in-out infinite; }
    
    .glass-effect {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 20px;
    }
    
    .mobile-touch {
      min-height: 44px;
      padding: 12px 16px;
      font-size: 16px;
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .btn-premium {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
      background-size: 200% 200%;
      border: none;
      border-radius: 16px;
      padding: 14px 28px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: 'relative';
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
    }
    
    .btn-premium:hover {
      transform: translateY(-2px);
      background-position: 100% 0;
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
    }
    
    @media (max-width: 768px) {
      .step-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
      }
      
      .glass-effect {
        padding: 20px !important;
        margin: 12px !important;
        border-radius: 16px !important;
      }
      
      .mobile-touch {
        min-height: 48px !important;
        font-size: 16px !important;
      }
      
      .desktop-only {
        display: none !important;
      }
      
      .mobile-only {
        display: block !important;
      }
    }
    
    @media (max-width: 480px) {
      .step-grid {
        grid-template-columns: 1fr !important;
      }
      
      .glass-effect {
        padding: 16px !important;
        margin: 8px !important;
      }
    }
    
    @media (min-width: 769px) {
      .mobile-only {
        display: none !important;
      }
    }
    
    .mobile-touch:active {
      transform: scale(0.98);
    }
    
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      .premium-input,
      .premium-select,
      .premium-textarea {
        font-size: 16px !important;
      }
    }
  `;

  // =================== RENDU PRINCIPAL ULTRA-OPTIMISÉ ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      <style jsx>{mobileOptimizedCSS}</style>

      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      
      {isMobile ? <MobileStepsNavigation /> : <DesktopStepsNavigation />}

      <main style={{ 
        padding: isMobile ? '0' : '20px 16px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        paddingBottom: isMobile ? '100px' : '20px'
      }}>
        
        <div className={`glass-effect slide-in ${isMobile ? 'mobile-content' : ''}`} style={{ 
          padding: isMobile ? '20px 16px' : '32px 24px', 
          marginBottom: isMobile ? '16px' : '24px',
          borderRadius: isMobile ? '16px' : '20px',
          margin: isMobile ? '16px' : '0 auto 24px'
        }}>
          
          {!isMobile && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#ffffff',
                marginBottom: '8px',
                background: `linear-gradient(135deg, ${steps[currentStep - 1]?.color}, ${steps[currentStep - 1]?.color}CC)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {steps[currentStep - 1]?.title}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                {steps[currentStep - 1]?.subtitle}
              </p>
            </div>
          )}

          <div style={{ minHeight: isMobile ? '300px' : '400px' }}>
            <StepContent />
          </div>
        </div>
      </main>

      {isMobile ? <MobileNavigation /> : <DesktopFooterNavigation />}
    </div>
  );
}
