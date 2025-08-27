'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand, MessageSquare
} from 'lucide-react';

// =================== ✅ IMPORTS DES COMPOSANTS STEPS 1-5 ===================
import Step1ProjectInfo from '@/components/steps/Step1ProjectInfo';
import Step2Equipment from '@/components/steps/Step2Equipment';
import Step3Hazards from '@/components/steps/Step3Hazards';
import Step4Validation from '@/components/steps/Step4Validation';
import Step5Finalization from '@/components/steps/Step5Finalization';
import Logo from '@/components/ui/Logo';
import Header from '@/components/ui/Header';

// =================== INTERFACES PRINCIPALES ===================
interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
  formData: any;
  onDataChange: (section: string, data: any) => void;
}

interface FormDataStructure {
  id: string;
  astNumber: string;
  tenant: string;
  status: 'draft' | 'pending_verification' | 'approved' | 'auto_approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  language: 'fr' | 'en';
  projectInfo?: any;
  equipment?: any;
  hazards?: any;
  permits?: any;
  validation?: any;
  finalization?: any;
}

// =================== TRADUCTIONS BILINGUES COMPLÈTES ===================
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
        title: "Autorisation et validation de l'équipe",
        subtitle: "Signatures et gestion des travailleurs"
      },
      step5: {
        title: "Finalisation",
        subtitle: "Signatures & Archive"
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
        title: "Authorization and Team Validation",
        subtitle: "Signatures and worker management"
      },
      step5: {
        title: "Finalization",
        subtitle: "Signatures & Archive"
      }
    }
  }
};

// =================== CONFIGURATION DES STEPS ===================
const steps = [
  {
    id: 1,
    titleKey: 'step1',
    icon: FileText,
    color: 'var(--color-primary)',
    required: true
  },
  {
    id: 2,
    titleKey: 'step2',
    icon: Shield,
    color: 'var(--color-success)',
    required: true
  },
  {
    id: 3,
    titleKey: 'step3',
    icon: AlertTriangle,
    color: 'var(--color-warning)',
    required: true
  },
  {
    id: 4,
    titleKey: 'step4',
    icon: Edit,
    color: 'var(--color-primary)',
    required: false
  },
  {
    id: 5,
    titleKey: 'step5',
    icon: CheckCircle,
    color: 'var(--color-success)',
    required: false
  }
];

// =================== HOOK DÉTECTION MOBILE ===================
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

// =================== DEBUG ET SURVEILLANCE ===================
let debugCounter = 0;
let updateOperations: any[] = [];

// Error handler global pour JavaScript
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('🚨 ERROR GLOBAL:', {
      message: e.message,
      filename: e.filename,
      line: e.lineno,
      column: e.colno,
      error: e.error,
      timestamp: new Date().toISOString()
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 PROMISE REJECTION:', {
      reason: e.reason,
      promise: e.promise,
      timestamp: new Date().toISOString()
    });
  });
}
// =================== COMPOSANT PRINCIPAL ASTFORM ===================
const ASTForm: React.FC<ASTFormProps> = ({ 
  tenant, 
  language: initialLanguage = 'fr', 
  userId, 
  userRole = 'worker',
  formData,
  onDataChange
}) => {
  
  // =================== DEBUG COUNTER POUR TRACKING ===================
  const renderCount = ++debugCounter;
  console.log('🔥 ASTForm RENDER #', renderCount, {
    currentStep: 'init',
    timestamp: new Date().toISOString()
  });

  // =================== GESTION DE LA LANGUE ===================
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
      return savedLanguage || initialLanguage;
    }
    return initialLanguage;
  });
  const t = translations[currentLanguage];
  
  // =================== DÉTECTION MOBILE ===================
  const isMobile = useIsMobile();

  // =================== ÉTATS PRINCIPAUX ===================
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // =================== DONNÉES AST AVEC STRUCTURE COMPLÈTE ===================
  const [astData, setAstData] = useState<FormDataStructure>(() => ({
    ...formData,
    id: formData.id || `ast_${Date.now()}`,
    astNumber: formData.astNumber || `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    tenant,
    status: formData.status || 'draft',
    createdAt: formData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: formData.createdBy || userId || 'user_anonymous',
    language: currentLanguage
  }));

  // =================== REFS ULTRA-STABLES ===================
  const stableFormDataRef = useRef(astData);
  const lastUpdateKeyRef = useRef<string>('');
  const debounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const updateInProgressRef = useRef(false);

  // =================== HANDLER ULTRA-STABLE ===================
  const ultraStableHandlerRef = useRef<(section: string, data: any) => void>();
  
  if (!ultraStableHandlerRef.current) {
    ultraStableHandlerRef.current = (section: string, data: any) => {
      const updateKey = `${section}-${JSON.stringify(data).slice(0, 100)}`;
      
      // Éviter les doublons absolus
      if (lastUpdateKeyRef.current === updateKey) {
        console.log('🛡️ DOUBLON ÉVITÉ:', { section, updateKey });
        return;
      }
      
      // Éviter les conflits pendant update
      if (updateInProgressRef.current) {
        console.log('🔒 UPDATE EN COURS, IGNORÉ:', { section });
        return;
      }
      
      lastUpdateKeyRef.current = updateKey;
      updateInProgressRef.current = true;
      
      console.log('🔥 HANDLER ULTRA-STABLE:', { 
        section, 
        renderCount, 
        updateKey: updateKey.slice(0, 50),
        timestamp: new Date().toISOString()
      });

      // Debounce par section
      const sectionKey = `update-${section}`;
      
      if (debounceTimersRef.current[sectionKey]) {
        clearTimeout(debounceTimersRef.current[sectionKey]);
      }

      // Mise à jour locale immédiate
      setAstData((prev: FormDataStructure) => {
        const newData = {
          ...prev,
          [section]: data,
          updatedAt: new Date().toISOString()
        };
        
        stableFormDataRef.current = newData;
        return newData;
      });

      // Sync parent avec debounce
      debounceTimersRef.current[sectionKey] = setTimeout(() => {
        try {
          console.log('🔄 SYNC PARENT:', { section, timestamp: new Date().toISOString() });
          onDataChange(section, data);
          updateOperations.push({
            section,
            timestamp: new Date().toISOString(),
            success: true
          });
        } catch (error: any) {
          console.error('❌ Erreur sync parent:', { section, error });
          updateOperations.push({
            section,
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message
          });
        } finally {
          updateInProgressRef.current = false;
          delete debounceTimersRef.current[sectionKey];
        }
      }, 300);

      setHasUnsavedChanges(true);
    };
  }

  // =================== FONCTIONS UTILITAIRES ===================
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
    return Math.round((completedSteps / 5) * 100);
  }, []);

  const getCurrentCompletedSteps = useCallback((): number => {
    let completed = 0;
    
    // Step 1 - Informations projet
    if (astData.projectInfo?.client && astData.projectInfo?.workDescription) {
      completed++;
    }
    
    // Step 2 - Équipements
    if (astData.equipment?.selected?.length && astData.equipment.selected.length > 0) {
      completed++;
    }
    
    // Step 3 - Dangers
    if (astData.hazards?.selected?.length && astData.hazards.selected.length > 0) {
      completed++;
    }
    
    // Step 4 - Permis (optionnel)
    if (astData.permits?.permits?.length && astData.permits.permits.length > 0) {
      completed++;
    } else if (currentStep > 4) {
      // Si on dépasse l'étape 4 sans permis, on considère comme complété
      completed++;
    }
    
    // Step 5 - Validation (optionnel)
    if (astData.validation?.reviewers?.length && astData.validation.reviewers.length > 0) {
      completed++;
    } else if (currentStep > 5) {
      completed++;
    }
    
    // Step 5 - Finalisation
    if (currentStep >= 5) {
      completed++;
    }
    
    return completed;
  }, [astData, currentStep]);

  const canNavigateToNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(
          astData.projectInfo?.client && 
          astData.projectInfo?.workDescription &&
          astData.projectInfo?.projectNumber
        );
      case 2:
        return Boolean(
          astData.equipment?.selected?.length && 
          astData.equipment.selected.length > 0
        );
      case 3:
        return Boolean(
          astData.hazards?.selected?.length && 
          astData.hazards.selected.length > 0
        );
      case 4:
        // Step 4 est optionnel, toujours autorisé
        return true;
      case 5:
        // Dernière étape
        return false;
      default:
        return false;
    }
  }, [astData, currentStep]);

  // =================== NAVIGATION ===================
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (canNavigateToNext() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canNavigateToNext, currentStep]);

  const handleStepClick = useCallback((step: number) => {
    // Permettre la navigation vers n'importe quelle étape
    // mais afficher un avertissement si les étapes précédentes ne sont pas complétées
    setCurrentStep(step);
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

  const changeStatus = useCallback((newStatus: FormDataStructure['status']) => {
    setAstData((prev: FormDataStructure) => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // =================== STATUS BADGE ===================
  const getStatusBadge = useCallback(() => {
    const statusConfig = {
      'draft': { color: 'var(--text-muted)', text: t.status.draft, icon: Edit },
      'pending_verification': { color: 'var(--color-warning)', text: t.status.pending_verification, icon: Clock },
      'approved': { color: 'var(--color-success)', text: t.status.approved, icon: CheckCircle },
      'auto_approved': { color: 'var(--color-success-dark)', text: t.status.auto_approved, icon: CheckCircle },
      'rejected': { color: 'var(--color-danger)', text: t.status.rejected, icon: AlertTriangle }
    };

    const config = statusConfig[astData.status] || statusConfig.draft;
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

  // =================== COMPOSANT LOGO ===================
  const LogoComponent = useMemo(() => ({ 
    isMobile = false
  }: { 
    isMobile?: boolean;
  }) => {
    return (
      <div 
        className="float-animation glow-effect"
        style={{
          background: 'var(--gradient-bg-primary)',
          padding: isMobile ? '16px' : '32px',
          borderRadius: isMobile ? '16px' : '32px',
          border: '4px solid var(--color-warning)',
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Logo 
            size={isMobile ? 'sm' : 'md'} 
            variant="glow" 
            showText={true}
          />
        </div>
        
        {/* Effet brillance animé */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
          animation: 'shine 2.5s ease-in-out infinite'
        }} />
        
        {/* Effet pulse border */}
        <div style={{
          position: 'absolute',
          inset: '-10px',
          border: '2px solid rgba(245, 158, 11, 0.3)',
          borderRadius: isMobile ? '24px' : '40px',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
      </div>
    );
  }, []);

  // =================== SYNC REF AVEC ASTDATA ===================
  useEffect(() => {
    stableFormDataRef.current = astData;
  }, [astData]);

  // =================== CLEANUP TIMERS ===================
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timer => {
        clearTimeout(timer);
      });
      debounceTimersRef.current = {};
    };
  }, []);

  // =================== EFFETS DE SYNCHRONISATION ===================
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
  // =================== HEADER MOBILE ===================
  const MobileHeader = () => (
    <header style={{
      background: 'var(--gradient-bg-header)',
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
        <LogoComponent isMobile={true} />
        
        <div style={{ 
          flex: 1, 
          marginLeft: '12px', 
          marginRight: '8px',
          minWidth: 0
        }}>
          <h1 style={{
            color: 'var(--text-primary)',
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
            color: 'var(--text-muted)',
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
        
        <LanguageSelector />
      </div>
      
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
            background: 'var(--color-success)',
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
  );

  // =================== HEADER DESKTOP ===================
  const DesktopHeader = () => (
    <header style={{
      background: 'var(--gradient-bg-header)',
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
                background: 'var(--color-success)'
              }} className="pulse-animation" />
              <span style={{
                color: 'var(--color-success)',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {t.systemOperational}
              </span>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-muted)', 
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
                color: 'var(--text-primary)',
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

  // =================== SÉLECTEUR DE LANGUE ===================
  const LanguageSelector = () => (
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
  );

  // =================== NAVIGATION STEPS MOBILE ===================
  const MobileStepsNavigation = () => (
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
          {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/5 • {Math.round(getCompletionPercentage())}% {t.completed}
        </div>
      </div>
    </div>
  );

  // =================== NAVIGATION DESKTOP ===================
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
  );

  // =================== COMPOSANTS MÉMORISÉS ===================
  const MemoizedStep1 = useMemo(() => memo(Step1ProjectInfo), []);
  const MemoizedStep2 = useMemo(() => memo(Step2Equipment), []);
  const MemoizedStep3 = useMemo(() => memo(Step3Hazards), []);
  const MemoizedStep4 = useMemo(() => memo(Step4Validation), []);
  const MemoizedStep5 = useMemo(() => memo(Step5Finalization), []);

  // =================== STEPCONTENT ULTRA-STABLE ===================
  const StepContent = useCallback(() => {
    const ultraStableHandler = ultraStableHandlerRef.current!;
    
    const stepProps = useMemo(() => ({
      formData: stableFormDataRef.current,
      language: currentLanguage,
      tenant: tenant,
      errors: {},
      userId: userId,
      userRole: userRole,
      onDataChange: ultraStableHandler
    }), [currentLanguage, tenant, userId, userRole, ultraStableHandler]);

    console.log('🔥 StepContent ULTRA-STABLE render - Step:', currentStep, 'RenderCount:', renderCount);
    
    switch (currentStep) {
      case 1:
        return (
          <MemoizedStep1
            key="step1-ultra-stable"
            {...stepProps}
          />
        );
      case 2:
        return (
          <MemoizedStep2
            key="step2-ultra-stable"
            {...stepProps}
          />
        );
      case 3:
        return (
          <MemoizedStep3
            key="step3-ultra-stable"
            {...stepProps}
          />
        );
      case 4:
        return (
          <MemoizedStep4
            key="step4-ultra-stable"
            {...stepProps}
            province={'QC'}
            touchOptimized={true}
            compactMode={false}
            onPermitChange={(permits: any) => {
              ultraStableHandler('permits', permits);
            }}
            initialPermits={astData.permits?.permits || []}
          />
        );
      case 4:
        return (
          <MemoizedStep4
            key="step4-ultra-stable"
            {...stepProps}
          />
        );
      case 5:
        return (
          <MemoizedStep5
            key="step5-ultra-stable"
            {...stepProps}
          />
        );
      default:
        return null;
    }
  }, [currentStep, currentLanguage, tenant, userId, userRole, astData.permits?.permits, MemoizedStep1, MemoizedStep2, MemoizedStep3, MemoizedStep4, MemoizedStep5]);

  // =================== NAVIGATION MOBILE FIXE ===================
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
          disabled={currentStep === 5 || !canNavigateToNext()}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: (currentStep === 5 || !canNavigateToNext()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            background: (currentStep === 5 || !canNavigateToNext()) 
              ? 'rgba(100, 116, 139, 0.3)' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'var(--text-primary)',
            opacity: (currentStep === 5 || !canNavigateToNext()) ? 0.5 : 1
          }}
        >
          {currentStep === 5 ? t.finished : t.next}
          {currentStep !== 5 && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );

  // =================== NAVIGATION FOOTER DESKTOP ===================
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

  // =================== CSS COMPLET AVEC ANIMATIONS ===================
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
    
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      input, select, textarea {
        font-size: 16px !important;
      }
    }

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

    html {
      scroll-behavior: smooth;
    }

    body {
      overscroll-behavior: none;
    }

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

  // =================== RENDU PRINCIPAL ===================
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
                color: 'var(--text-primary)',
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
            {StepContent()}
          </div>
        </div>
      </main>

      {isMobile ? <MobileNavigation /> : <DesktopFooterNavigation />}
    </div>
  );
};

// =================== EXPORT DU COMPOSANT ===================
export default ASTForm;
