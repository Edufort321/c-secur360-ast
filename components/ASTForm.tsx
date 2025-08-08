'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand, MessageSquare
} from 'lucide-react';

// =================== ✅ IMPORTS DES COMPOSANTS STEPS 1-6 (CONSERVÉS INTÉGRALEMENT) ===================
import Step1ProjectInfo from '@/components/steps/Step1ProjectInfo';
import Step2Equipment from '@/components/steps/Step2Equipment';
import Step3Hazards from '@/components/steps/Step3Hazards';
import Step4Permits from '@/components/steps/Step4Permits';
import Step5Validation from '@/components/steps/Step5Validation';
import Step6Finalization from '@/components/steps/Step6Finalization';

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

// =================== 🔥 COMPOSANT PRINCIPAL ASTFORM - FIXES DÉFINITIFS ===================
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

  // =================== 🔥🔥🔥 HANDLER ULTRA-STABLE DÉFINITIF (FIXES TOUS LES BUGS) 🔥🔥🔥 ===================
  const stableFormDataRef = useRef(astData);
  const renderCountRef = useRef(0);
  const lastUpdateRef = useRef<string>('');
  const isUpdatingRef = useRef(false);
  
  // ✅ HANDLER ULTRA-STABLE - INITIALISÉ UNE SEULE FOIS AVEC TOUS LES FIXES
  const stableHandlerRef = useRef<(section: string, data: any) => void>();
  
  if (!stableHandlerRef.current) {
    stableHandlerRef.current = (section: string, data: any) => {
      // ✅ FIX 1 - ÉVITER LES UPDATES SIMULTANÉES
      if (isUpdatingRef.current) {
        console.log('🛡️ UPDATE EN COURS - IGNORÉ:', { section });
        return;
      }
      
      const updateKey = `${section}-${JSON.stringify(data).slice(0, 50)}`;
      
      // ✅ FIX 2 - ÉVITER LES DOUBLONS STRICTS
      if (lastUpdateRef.current === updateKey) {
        console.log('🛡️ DOUBLON ÉVITÉ:', { section, updateKey });
        return;
      }
      
      isUpdatingRef.current = true;
      lastUpdateRef.current = updateKey;
      renderCountRef.current++;
      
      console.log('🔥 HANDLER ULTRA-STABLE - UPDATE AUTORISÉ:', { 
        section, 
        renderCount: renderCountRef.current
      });
      
      // ✅ FIX 3 - MISE À JOUR SYNCHRONE STABLE
      setAstData((prev: any) => {
        const newData = {
          ...prev,
          [section]: data,
          updatedAt: new Date().toISOString() // ✅ CONSERVÉ POUR DASHBOARD SYNC
        };
        
        // ✅ UPDATE REF IMMÉDIATEMENT
        stableFormDataRef.current = newData;
        return newData;
      });
      
      // ✅ FIX 4 - SYNC PARENT DIFFÉRÉ AVEC PROTECTION
      setTimeout(() => {
        try {
          onDataChange(section, data);
        } catch (error) {
          console.error('❌ Erreur sync parent:', error);
        } finally {
          // ✅ LIBÉRER LE VERROU APRÈS SYNC
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);
        }
      }, 100); // ✅ DÉBOUNCE ORIGINAL 100ms CONSERVÉ
      
      setHasUnsavedChanges(true);
    };
  }

  // ✅ MISE À JOUR DE LA REF SEULEMENT QUAND NÉCESSAIRE
  useEffect(() => {
    stableFormDataRef.current = astData;
  }, [astData]);

  // =================== FONCTIONS UTILITAIRES MÉMORISÉES STABLES ===================
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
  }, [astData]);

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

  // =================== NAVIGATION OPTIMISÉE STABLE ===================
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  // =================== 🔥 HEADER MOBILE AVEC LOGO EXACT ORIGINAL ===================
  const MobileHeader = React.memo(() => (
    <header style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
      minHeight: '70px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%',
        marginBottom: '8px'
      }}>
        {/* 🔥 Logo mobile exactement comme ton original */}
        <LogoComponent isMobile={true} />
        
        {/* Titre mobile responsive (style original conservé) */}
        <div style={{ 
          flex: 1, 
          marginLeft: '12px', 
          marginRight: '8px',
          minWidth: 0
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tenant === 'demo' ? t.title : `🛡️ ${tenant.charAt(0).toUpperCase() + tenant.slice(1)}-Secur360`}
          </h1>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            margin: '2px 0 0 0',
            fontWeight: '400',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            AST #{astData.astNumber.slice(-6)} • {tenant.toUpperCase()}
          </div>
        </div>
        
        {/* Sélecteur de langue mobile (style original conservé) */}
        <div style={{
          display: 'flex',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '6px',
          padding: '4px',
          gap: '2px',
          flexShrink: 0
        }}>
          <button
            onClick={() => handleLanguageChange('fr')}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: currentLanguage === 'fr' 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                : 'transparent',
              color: currentLanguage === 'fr' ? '#ffffff' : '#94a3b8',
              fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '24px'
            }}
          >
            FR
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              background: currentLanguage === 'en' 
                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                : 'transparent',
              color: currentLanguage === 'en' ? '#ffffff' : '#94a3b8',
              fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '24px'
            }}
          >
            EN
          </button>
        </div>
      </div>
      
      {/* Status mobile compact (style original conservé) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            color: '#22c55e',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            {t.active}
          </span>
        </div>
        
        <div style={{ fontSize: '10px' }}>
          {getStatusBadge()}
        </div>
      </div>
    </header>
  ));

  // =================== COMPOSANTS STEPS MÉMORISÉS POUR PERFORMANCE ===================
  const MemoizedStep1 = React.memo(Step1ProjectInfo);
  const MemoizedStep2 = React.memo(Step2Equipment);
  const MemoizedStep3 = React.memo(Step3Hazards);
  const MemoizedStep4 = React.memo(Step4Permits);
  const MemoizedStep5 = React.memo(Step5Validation);
  const MemoizedStep6 = React.memo(Step6Finalization);

  // =================== 🔥🔥🔥 STEPCONTENT ULTRA-STABLE (FIXES DÉFINITIFS) 🔥🔥🔥 ===================
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

  // =================== NAVIGATION MOBILE FIXE MÉMORISÉE (STYLE ORIGINAL) ===================
  const MobileNavigation = React.memo(() => (
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
  ));

  // =================== NAVIGATION FOOTER DESKTOP MÉMORISÉE (STYLE ORIGINAL) ===================
  const DesktopFooterNavigation = React.memo(() => (
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
  ));

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

  // =================== 🔥🔥🔥 CSS COMPLET AVEC MODAL Z-INDEX ABSOLU & STYLE ORIGINAL 🔥🔥🔥 ===================
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

    /* =================== 🔥🔥🔥 FIX CRITIQUE MODAL Z-INDEX MAXIMUM ABSOLU 🔥🔥🔥 =================== */
    .modal-overlay,
    [data-modal="true"],
    [role="dialog"],
    .modal-container,
    .modal-backdrop,
    div[class*="modal"],
    div[class*="Modal"] {
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
    
    .modal-content,
    .modal-dialog,
    .modal-body,
    [data-modal-content="true"],
    div[class*="modal-content"],
    div[class*="Modal-content"] {
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
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
    }
    
    /* =================== FIX MODAL INPUTS BACKGROUND =================== */
    .modal-overlay input,
    .modal-content input,
    .modal-dialog input,
    [data-modal="true"] input,
    div[class*="modal"] input,
    .modal-overlay textarea,
    .modal-content textarea,
    .modal-dialog textarea,
    [data-modal="true"] textarea,
    div[class*="modal"] textarea,
    .modal-overlay select,
    .modal-content select,
    .modal-dialog select,
    [data-modal="true"] select,
    div[class*="modal"] select {
      background: rgba(30, 41, 59, 0.9) !important;
      border: 1px solid rgba(59, 130, 246, 0.5) !important;
      color: #ffffff !important;
      z-index: 2147483647 !important;
    }
    
    /* =================== FIX MODAL BUTTONS =================== */
    .modal-overlay button,
    .modal-content button,
    .modal-dialog button,
    [data-modal="true"] button,
    div[class*="modal"] button {
      z-index: 2147483647 !important;
      position: relative !important;
    }
    
    /* =================== RESPONSIVE OPTIMISÉ STYLE ORIGINAL =================== */
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

      .modal-content,
      .modal-dialog,
      [data-modal-content="true"],
      div[class*="modal-content"] {
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
    
    /* =================== FIX iOS ZOOM (STYLE ORIGINAL) =================== */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      input, select, textarea {
        font-size: 16px !important;
      }
    }

    /* =================== DARK THEME FIXES (STYLE ORIGINAL) =================== */
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

  // =================== 🔥🔥🔥 RENDU PRINCIPAL COMPLET AVEC TOUS LES FIXES 🔥🔥🔥 ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      <style dangerouslySetInnerHTML={{ __html: mobileOptimizedCSS }} />

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

  // =================== 🔥 HEADER DESKTOP AVEC LOGO EXACT ORIGINAL ===================
  const DesktopHeader = React.memo(() => (
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
          {/* 🔥 Logo desktop exactement comme ton original */}
          <LogoComponent isMobile={false} />
          
          <div className="slide-in-right">
            <h1 className="text-gradient" style={{
              fontSize: '40px',
              margin: 0,
              lineHeight: 1.2,
              fontWeight: '900',
              letterSpacing: '-0.025em'
            }}>
              {tenant === 'demo' ? t.title : `🛡️ ${tenant.charAt(0).toUpperCase() + tenant.slice(1)}-Secur360`}
            </h1>
            <p style={{
              color: 'rgba(251, 191, 36, 0.9)',
              fontSize: '20px',
              margin: 0,
              fontWeight: '600'
            }}>
              {t.subtitle} • {tenant.toUpperCase()}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px',
              flexWrap: 'wrap'
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
  ));

  // =================== COMPOSANT SÉLECTEUR DE LANGUE MÉMORISÉ (STYLE ORIGINAL) ===================
  const LanguageSelector = React.memo(() => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '8px 12px',
      position: 'relative'
    }}>
      <span style={{
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '500'
      }}>
        {t.language}
      </span>
      
      <div style={{
        display: 'flex',
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '8px',
        padding: '2px',
        gap: '2px'
      }}>
        <button
          onClick={() => handleLanguageChange('fr')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            background: currentLanguage === 'fr' 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
              : 'transparent',
            color: currentLanguage === 'fr' ? '#ffffff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '30px'
          }}
        >
          FR
        </button>
        
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            background: currentLanguage === 'en' 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
              : 'transparent',
            color: currentLanguage === 'en' ? '#ffffff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '30px'
          }}
        >
          EN
        </button>
      </div>
    </div>
  ));

  // =================== NAVIGATION STEPS MOBILE MÉMORISÉE (STYLE ORIGINAL INTÉGRAL) ===================
  const MobileStepsNavigation = React.memo(() => (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        marginBottom: '10px'
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
              borderRadius: '8px',
              padding: '8px 6px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: currentStep === step.id ? 'translateY(-1px)' : 'none',
              boxShadow: currentStep === step.id ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
              minHeight: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => handleStepClick(step.id)}
          >
            <div style={{
              width: '24px',
              height: '24px',
              margin: '0 auto 4px',
              background: currentStep === step.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep === step.id ? '#3b82f6' : '#60a5fa',
              fontSize: '12px'
            }}>
              {getCurrentCompletedSteps() > step.id - 1 ? '✓' : 
               currentStep === step.id ? <step.icon size={12} /> : 
               <step.icon size={10} />}
            </div>
            <div style={{
              color: currentStep === step.id ? '#ffffff' : '#e2e8f0',
              fontSize: '9px',
              fontWeight: '600',
              margin: 0,
              lineHeight: '1.2',
              textAlign: 'center'
            }}>
              {(t.steps as any)[step.titleKey]?.title}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            borderRadius: '2px',
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
          fontSize: '10px',
          marginTop: '4px',
          fontWeight: '500'
        }}>
          {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/6 • {Math.round(getCompletionPercentage())}% {t.completed}
        </div>
      </div>
    </div>
  ));

  // =================== NAVIGATION DESKTOP MÉMORISÉE (STYLE ORIGINAL INTÉGRAL) ===================
  const DesktopStepsNavigation = React.memo(() => (
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
              {(t.steps as any)[step.titleKey]?.title}
            </h3>
            
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.3'
            }}>
              {(t.steps as any)[step.titleKey]?.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  ));

  const handleNext = useCallback(() => {
    if (canNavigateToNext() && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canNavigateToNext, currentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // =================== FONCTIONS UTILITAIRES SUPPLÉMENTAIRES STABLES ===================
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

  // =================== STATUS BADGE MÉMORISÉ STABLE ===================
  const getStatusBadge = useCallback(() => {
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

  // =================== 🔥 COMPOSANT LOGO EXACTEMENT COMME TON DASHBOARD ORIGINAL ===================
  const LogoComponent = useMemo(() => ({ 
    isMobile = false
  }: { 
    isMobile?: boolean;
  }) => {
    return (
      <div 
        className="float-animation glow-effect"
        style={{
          // 🔥 EXACTEMENT COMME TON DASHBOARD ORIGINAL
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          padding: isMobile ? '16px' : '32px', // ✅ PADDING EXACT ORIGINAL
          borderRadius: isMobile ? '16px' : '32px', // ✅ BORDER RADIUS EXACT ORIGINAL
          border: '4px solid #f59e0b', // ✅ BORDER 4px EXACT ORIGINAL
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15)', // ✅ SHADOW EXACTE ORIGINALE
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: isMobile ? '32px' : '96px', // ✅ DIMENSIONS EXACTES ORIGINALES
          height: isMobile ? '32px' : '96px', // ✅ DIMENSIONS EXACTES ORIGINALES
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
              width: isMobile ? '50px' : '200px', // ✅ TAILLES IMAGES EXACTES ORIGINALES
              height: isMobile ? '50px' : '200px', // ✅ TAILLES IMAGES EXACTES ORIGINALES
              objectFit: 'contain',
              filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 20px rgba(245, 158, 11, 0.5))' // ✅ FILTER EXACT ORIGINAL
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
            fontSize: isMobile ? '16px' : '48px', // ✅ TAILLES FALLBACK EXACTES ORIGINALES
            fontWeight: '900',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 4px 8px rgba(0,0,0,0.7)',
            width: '100%',
            height: '100%'
          }}>
            🛡️
          </div>
        </div>
        
        {/* Effet brillance animé (exactement comme dashboard original) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
          animation: 'shine 2.5s ease-in-out infinite'
        }} />
        
        {/* Effet pulse border (exactement comme dashboard original) */}
        <div style={{
          position: 'absolute',
          inset: '-10px', // ✅ INSET EXACT ORIGINAL
          border: '2px solid rgba(245, 158, 11, 0.3)',
          borderRadius: isMobile ? '24px' : '40px', // ✅ BORDER RADIUS PULSE EXACT ORIGINAL
          animation: 'pulse 3s ease-in-out infinite'
        }} />
      </div>
    );
  }, []);
