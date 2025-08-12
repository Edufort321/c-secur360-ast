'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase,  Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star,  Upload,  Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand, MessageSquare
} from 'lucide-react';

// =================== ✅ IMPORTS DES COMPOSANTS STEPS 1-6 (CONSERVÉS INTÉGRALEMENT) ===================
import Step1ProjectInfo from '@/components/steps/Step1ProjectInfo';
import Step2Equipment from '@/components/steps/Step2Equipment';
import Step3Hazards from '@/components/steps/Step3Hazards';
import Step4Permits from '@/components/steps/Step4Permits';
import Step5Validation from '@/components/steps/Step5Validation';
import Step6Finalization from '@/components/steps/Step6Finalization';
import Header from '@/components/layout/Header';
import StepsNav from '@/components/navigation/StepsNav';

// =================== INTERFACES PRINCIPALES (CONSERVÉES) ===================
interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
  formData: any;
  onDataChange: (section: string, data: any) => void;
}

// =================== TRADUCTIONS COMPLÈTES (CONSERVÉES INTÉGRALEMENT) ===================
const translations = {
  fr: {
    title: "🛡️ C-Secur360",
    subtitle: "Analyse Sécuritaire de Travail",
    systemOperational: "Système opérationnel",
    astStep: "AST • Étape",
    astNumber: "NUMÉRO AST",
    online: "En ligne",
    offline: "Hors ligne",
    submit: "Soumettre",
    approve: "Approuver",
    status: {
      draft: "Brouillon",
      pending_verification: "En attente",
      approved: "Approuvé",
      auto_approved: "Auto-approuvé",
      rejected: "Rejeté"
    },
    progress: "Progression AST",
    completed: "complété",
    stepOf: "sur",
    previous: "Précédent",
    next: "Suivant",
    finished: "Terminé ✓",
    autoSave: "Sauvegarde auto",
    saving: "Modification...",
    saved: "Sauvegardé",
    active: "Actif",
    language: "Langue",
    french: "Français",
    english: "English",
    steps: {
      step1: {
        title: "Informations Projet",
        subtitle: "Identification & Verrouillage"
      },
      step2: {
        title: "Équipements", 
        subtitle: "EPI et équipements sécurité"
      },
      step3: {
        title: "Dangers & Contrôles",
        subtitle: "Risques + Moyens contrôle"
      },
      step4: {
        title: "Permis & Autorisations",
        subtitle: "Conformité réglementaire"
      },
      step5: {
        title: "Validation Équipe",
        subtitle: "Signatures & Approbations"
      },
      step6: {
        title: "Finalisation",
        subtitle: "Consentement & Archive"
      }
    }
  },
  en: {
    title: "🛡️ C-Secur360",
    subtitle: "Job Safety Analysis",
    systemOperational: "System operational",
    astStep: "JSA • Step",
    astNumber: "JSA NUMBER",
    online: "Online",
    offline: "Offline",
    submit: "Submit",
    approve: "Approve",
    status: {
      draft: "Draft",
      pending_verification: "Pending",
      approved: "Approved",
      auto_approved: "Auto-approved",
      rejected: "Rejected"
    },
    progress: "JSA Progress",
    completed: "completed",
    stepOf: "of",
    previous: "Previous",
    next: "Next",
    finished: "Finished ✓",
    autoSave: "Auto save",
    saving: "Saving...",
    saved: "Saved",
    active: "Active",
    language: "Language",
    french: "Français",
    english: "English",
    steps: {
      step1: {
        title: "Project Information",
        subtitle: "Identification & Lockout"
      },
      step2: {
        title: "Equipment",
        subtitle: "PPE and safety equipment"
      },
      step3: {
        title: "Hazards & Controls",
        subtitle: "Risks + Control measures"
      },
      step4: {
        title: "Permits & Authorizations",
        subtitle: "Regulatory compliance"
      },
      step5: {
        title: "Team Validation",
        subtitle: "Signatures & Approvals"
      },
      step6: {
        title: "Finalization",
        subtitle: "Consent & Archive"
      }
    }
  }
};

// =================== CONFIGURATION DES STEPS (CONSERVÉE) ===================
const steps = [
  {
    id: 1,
    titleKey: 'step1',
    icon: FileText,
    color: '#3b82f6',
    required: true
  },
  {
    id: 2,
    titleKey: 'step2',
    icon: Shield,
    color: '#10b981',
    required: true
  },
  {
    id: 3,
    titleKey: 'step3',
    icon: AlertTriangle,
    color: '#f59e0b',
    required: true
  },
  {
    id: 4,
    titleKey: 'step4',
    icon: Edit,
    color: '#8b5cf6',
    required: false
  },
  {
    id: 5,
    titleKey: 'step5',
    icon: Users,
    color: '#06b6d4',
    required: false
  },
  {
    id: 6,
    titleKey: 'step6',
    icon: CheckCircle,
    color: '#10b981',
    required: false
  }
];

// =================== HOOK DÉTECTION MOBILE OPTIMISÉ (CONSERVÉ) ===================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkIsMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
      }, 150);
    };

    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  return isMobile;
};

// =================== COMPOSANT PRINCIPAL ASTFORM ===================
export default function ASTForm({ 
  tenant, 
  language: initialLanguage = 'fr', 
  userId, 
  userRole = 'worker',
  formData,
  onDataChange
}: ASTFormProps) {
  
  // =================== GESTION DE LA LANGUE OPTIMISÉE (CONSERVÉE) ===================
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
      return savedLanguage || initialLanguage;
    }
    return initialLanguage;
  });
  const t = translations[currentLanguage];
  
  // =================== DÉTECTION MOBILE (CONSERVÉE) ===================
  const isMobile = useIsMobile();

  // =================== ÉTATS PRINCIPAUX STABLES (CONSERVÉS) ===================
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // =================== DONNÉES AST STABLES (CONSERVÉES) ===================
  const [astData, setAstData] = useState(() => ({
    ...formData,
    id: formData.id || `ast_${Date.now()}`,
    astNumber: formData.astNumber || `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    tenant,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId || 'user_anonymous',
    language: currentLanguage
  }));

  // =================== 🔥 FIX ANTI-BOUCLES ULTRA-STABLE ===================
  const stableFormDataRef = useRef(astData);
  const renderCountRef = useRef(0);
  const lastUpdateRef = useRef<string>('');
  
  // ✅ HANDLER ULTRA-STABLE - INITIALISÉ UNE SEULE FOIS AVEC DEBOUNCE
  const stableHandlerRef = useRef<(section: string, data: any) => void>();
  
  if (!stableHandlerRef.current) {
    stableHandlerRef.current = (section: string, data: any) => {
      const updateKey = `${section}-${JSON.stringify(data).slice(0, 50)}`;
      
      // ✅ ÉVITER LES DOUBLONS
      if (lastUpdateRef.current === updateKey) {
        console.log('🛡️ DOUBLON ÉVITÉ:', { section, updateKey });
        return;
      }
      
      lastUpdateRef.current = updateKey;
      console.log('🔥 HANDLER ULTRA-STABLE (ANTI-BOUCLES):', { section, renderCount: renderCountRef.current });
      
      // ✅ MISE À JOUR SYNCHRONE DE L'ÉTAT LOCAL
      setAstData((prev: any) => {
        const newData = {
          ...prev,
          [section]: data,
          updatedAt: new Date().toISOString()
        };
        
        // ✅ MISE À JOUR DE LA REF POUR ÉVITER LES RE-RENDERS
        stableFormDataRef.current = newData;
        return newData;
      });
      
      // ✅ SYNC PARENT DIFFÉRÉE AVEC DEBOUNCE - ÉVITE LES CONFLITS CRITIQUES
      setTimeout(() => {
        try {
          onDataChange(section, data);
        } catch (error) {
          console.error('❌ Erreur sync parent:', error);
        }
      }, 100);
      
      setHasUnsavedChanges(true);
    };
  }

  // ✅ TRACK RENDERS POUR DEBUG
  renderCountRef.current++;
  
  // ✅ MISE À JOUR DE LA REF SEULEMENT QUAND NÉCESSAIRE
  useEffect(() => {
    stableFormDataRef.current = astData;
  }, [astData]);

  // =================== FONCTIONS UTILITAIRES MÉMORISÉES (CONSERVÉES) ===================
  const handleLanguageChange = useCallback((newLanguage: 'fr' | 'en') => {
    if (newLanguage !== currentLanguage) {
      setCurrentLanguage(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ast-language-preference', newLanguage);
      }
    }
  }, [currentLanguage]);

  const getCompletionPercentage = useCallback((): number => {
    const completedSteps = getCurrentCompletedSteps();
    return Math.round((completedSteps / 6) * 100);
  }, []);

  const getCurrentCompletedSteps = useCallback((): number => {
    let completed = 0;
    
    if (astData.projectInfo?.client && astData.projectInfo?.workDescription) {
      completed++;
    }
    
    if (astData.equipment?.selected?.length > 0) {
      completed++;
    }
    
    if (astData.hazards?.selected?.length > 0) {
      completed++;
    }
    
    if (astData.permits?.permits?.length > 0) {
      completed++;
    }
    
    if (astData.validation?.reviewers?.length > 0) {
      completed++;
    }
    
    if (currentStep >= 6) {
      completed++;
    }
    
    return completed;
  }, [astData, currentStep]);

  const canNavigateToNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(astData.projectInfo?.client && astData.projectInfo?.workDescription);
      case 2:
        return Boolean(astData.equipment?.selected?.length && astData.equipment.selected.length > 0);
      case 3:
        return Boolean(astData.hazards?.selected?.length && astData.hazards.selected.length > 0);
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return false;
      default:
        return false;
    }
  }, [astData, currentStep]);

  // =================== NAVIGATION OPTIMISÉE (CONSERVÉE) ===================
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (canNavigateToNext() && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canNavigateToNext, currentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // =================== FONCTIONS UTILITAIRES SUPPLÉMENTAIRES (CONSERVÉES) ===================
  const handleCopyAST = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(astData.astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  }, [astData.astNumber]);

  const changeStatus = useCallback((newStatus: any) => {
    setAstData((prev: any) => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // =================== STATUS BADGE MÉMORISÉ (CONSERVÉ) ===================
  const getStatusBadge = useCallback((mobile = false) => {
    const statusConfig = {
      'draft': { color: '#64748b', text: t.status.draft, icon: Edit },
      'pending_verification': { color: '#f59e0b', text: t.status.pending_verification, icon: Clock },
      'approved': { color: '#10b981', text: t.status.approved, icon: CheckCircle },
      'auto_approved': { color: '#059669', text: t.status.auto_approved, icon: CheckCircle },
      'rejected': { color: '#ef4444', text: t.status.rejected, icon: AlertTriangle }
    };

    const config = statusConfig[astData.status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: mobile ? '6px 12px' : '8px 16px',
        background: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        borderRadius: '20px',
        color: config.color,
        fontSize: mobile ? '12px' : '14px',
        fontWeight: '500'
      }}>
        <Icon size={mobile ? 14 : 16} />
        {config.text}
      </div>
    );

  // =================== COMPOSANTS MÉMORISÉS POUR PERFORMANCE (CONSERVÉS) ===================
  const MemoizedStep1 = React.memo(Step1ProjectInfo);
  const MemoizedStep2 = React.memo(Step2Equipment);
  const MemoizedStep3 = React.memo(Step3Hazards);
  const MemoizedStep4 = React.memo(Step4Permits);
  const MemoizedStep5 = React.memo(Step5Validation);
  const MemoizedStep6 = React.memo(Step6Finalization);

  // =================== 🔥 STEPCONTENT ANTI-BOUCLES ULTRA-STABLE ===================
  const StepContent = React.memo(() => {
    // ✅ HANDLER ULTRA-STABLE - RÉFÉRENCE FIGÉE
    const ultraStableHandler = stableHandlerRef.current!;
    
    // ✅ PROPS STABLES - MÉMORISÉS POUR ÉVITER RE-RENDERS
    const stepProps = useMemo(() => ({
      formData: stableFormDataRef.current,
      language: currentLanguage,
      tenant: tenant,
      errors: {},
      onDataChange: ultraStableHandler
    }), [currentLanguage, tenant, ultraStableHandler]);
    
    console.log('🔥 StepContent render - Step:', currentStep, 'RenderCount:', renderCountRef.current);
    
    switch (currentStep) {
      case 1:
        return (
          <MemoizedStep1
            key="step1-stable"
            {...stepProps}
          />
        );
      case 2:
        return (
          <MemoizedStep2
            key="step2-stable"
            {...stepProps}
          />
        );
      case 3:
        return (
          <MemoizedStep3
            key="step3-stable"
            {...stepProps}
          />
        );
      case 4:
        return (
          <MemoizedStep4
            key="step4-stable"
            {...stepProps}
            province={'QC'}
            userRole={'worker'}
            touchOptimized={true}
            compactMode={false}
            onPermitChange={(permits) => {
              ultraStableHandler('permits', permits);
            }}
            initialPermits={[]}
          />
        );
      case 5:
        return (
          <MemoizedStep5
            key="step5-stable"
            {...stepProps}
          />
        );
      case 6:
        return (
          <MemoizedStep6
            key="step6-stable"
            {...stepProps}
          />
        );
      default:
        return null;
    }
  });

  // =================== NAVIGATION MOBILE FIXE (CONSERVÉE) ===================
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

  // =================== NAVIGATION FOOTER DESKTOP (CONSERVÉE) ===================
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

  // =================== EFFETS ET CLEANUP (CONSERVÉS) ===================
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
    if (savedLanguage && savedLanguage !== currentLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, [currentLanguage]);

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

  // =================== 🔥 CSS AVEC LOGO 200x200 + MODAL Z-INDEX ABSOLU ===================
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
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
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
    .logo-glow { 
      filter: brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(245, 158, 11, 0.5)); 
    }
    
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
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
    }
    
    .btn-premium:hover {
      transform: translateY(-2px);
      background-position: 100% 0;
      box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
    }
    
    .btn-premium:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* =================== 🔥 FIX CRITIQUE MODAL Z-INDEX MAXIMUM ABSOLU =================== */
    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.98) !important;
      z-index: 2147483647 !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
    }
    
    .modal-content {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 2147483647 !important;
      background: rgba(15, 23, 42, 0.98) !important;
      border: 2px solid rgba(59, 130, 246, 0.7) !important;
      border-radius: 16px !important;
      max-width: 90vw !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8) !important;
    }
    
    /* =================== FIX MODAL INPUTS BACKGROUND =================== */
    .modal-content input,
    .modal-content textarea,
    .modal-content select {
      background: rgba(30, 41, 59, 0.9) !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      color: #ffffff !important;
    }
    
    /* =================== RESPONSIVE OPTIMISÉ + LOGO 200x200 =================== */
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

      .text-gradient {
        font-size: 28px !important;
      }

      .float-animation {
        padding: 20px !important;
      }

      .modal-content {
        max-width: 95vw !important;
        max-height: 95vh !important;
        margin: 2.5vh !important;
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

      .text-gradient {
        font-size: 24px !important;
      }

      .float-animation {
        padding: 16px !important;
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
    
    /* =================== FIX iOS ZOOM =================== */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      input, select, textarea {
        font-size: 16px !important;
      }
    }

    /* =================== DARK THEME FIXES =================== */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    input, textarea, [contenteditable] {
      -webkit-user-select: text !important;
      -khtml-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }

    /* =================== SCROLL OPTIMIZATIONS =================== */
    html {
      scroll-behavior: smooth;
    }

    body {
      overscroll-behavior: none;
    }

    /* =================== PRINT STYLES =================== */
    @media print {
      .desktop-only, .mobile-only {
        display: block !important;
      }
      
      .glass-effect {
        background: white !important;
        border: 1px solid #ccc !important;
      }
      
      .text-gradient {
        color: #000 !important;
        -webkit-text-fill-color: #000 !important;
      }
    }
  `;

  // =================== 🔥 RENDU PRINCIPAL AVEC TOUS LES FIXES ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      <style dangerouslySetInnerHTML={{ __html: mobileOptimizedCSS }} />

      <Header tenant={tenant} t={t} astNumber={astData.astNumber} copied={copied} onCopy={handleCopyAST} currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} isOnline={isOnline} getStatusBadge={getStatusBadge} isMobile={isMobile} userRole={userRole} changeStatus={changeStatus} currentStep={currentStep} steps={steps} />
      
      <StepsNav isMobile={isMobile} steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} handleStepClick={handleStepClick} getCompletionPercentage={getCompletionPercentage} getCurrentCompletedSteps={getCurrentCompletedSteps} t={t} />

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
                {(t.steps as any)[steps[currentStep - 1]?.titleKey]?.title}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                {(t.steps as any)[steps[currentStep - 1]?.titleKey]?.subtitle}
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
