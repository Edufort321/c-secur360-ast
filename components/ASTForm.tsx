'use client';

import React from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Shield, AlertTriangle, 
  Edit, Users, CheckCircle, Copy, Check, Wifi, WifiOff, 
  Save, Bell, Star, Settings
} from 'lucide-react';

// ✅ IMPORT NOUVEAU CONTEXT
import { ASTProvider, useAST, TenantConfig, DEFAULT_TENANT_CONFIGS } from './ASTContext';

// ✅ IMPORTS STEPS EXISTANTS
import Step1ProjectInfo from '@/components/steps/Step1ProjectInfo';
import Step2Equipment from '@/components/steps/Step2Equipment';
import Step3Hazards from '@/components/steps/Step3Hazards';
import Step4Permits from '@/components/steps/Step4Permits';
import Step5Validation from '@/components/steps/Step5Validation';
import Step6Finalization from '@/components/steps/Step6Finalization';

// =================== INTERFACES SIMPLIFIÉES ===================
interface ASTFormProps {
  tenant?: TenantConfig | string; // Config complète ou ID
  language?: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
  initialData?: any;
}

// =================== TRADUCTIONS COMPACTES ===================
const translations = {
  fr: {
    title: "🛡️ C-Secur360",
    subtitle: "Analyse Sécuritaire de Travail",
    previous: "Précédent",
    next: "Suivant",
    finished: "Terminé ✓",
    saving: "Sauvegarde...",
    saved: "Sauvegardé",
    online: "En ligne",
    offline: "Hors ligne",
    submit: "Soumettre",
    approve: "Approuver",
    steps: {
      1: { title: "Informations Projet", subtitle: "Identification & Verrouillage" },
      2: { title: "Équipements", subtitle: "EPI et équipements sécurité" },
      3: { title: "Dangers & Contrôles", subtitle: "Risques + Moyens contrôle" },
      4: { title: "Permis & Autorisations", subtitle: "Conformité réglementaire" },
      5: { title: "Validation Équipe", subtitle: "Signatures & Approbations" },
      6: { title: "Finalisation", subtitle: "Consentement & Archive" }
    }
  },
  en: {
    title: "🛡️ C-Secur360",
    subtitle: "Job Safety Analysis",
    previous: "Previous",
    next: "Next",
    finished: "Finished ✓",
    saving: "Saving...",
    saved: "Saved",
    online: "Online",
    offline: "Offline",
    submit: "Submit",
    approve: "Approve",
    steps: {
      1: { title: "Project Information", subtitle: "Identification & Lockout" },
      2: { title: "Equipment", subtitle: "PPE and safety equipment" },
      3: { title: "Hazards & Controls", subtitle: "Risks + Control measures" },
      4: { title: "Permits & Authorizations", subtitle: "Regulatory compliance" },
      5: { title: "Team Validation", subtitle: "Signatures & Approvals" },
      6: { title: "Finalization", subtitle: "Consent & Archive" }
    }
  }
};

// =================== DÉTECTION MOBILE SIMPLE ===================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// =================== COMPOSANT PRINCIPAL SIMPLIFIÉ ===================
export default function ASTForm({ 
  tenant = 'demo',
  language = 'fr',
  userId,
  userRole = 'worker',
  initialData = {}
}: ASTFormProps) {
  
  // ✅ RÉSOLUTION TENANT CONFIG
  const tenantConfig = React.useMemo(() => {
    if (typeof tenant === 'string') {
      return DEFAULT_TENANT_CONFIGS[tenant] || DEFAULT_TENANT_CONFIGS.demo;
    }
    return tenant;
  }, [tenant]);

  // ✅ WRAPPER AVEC PROVIDER
  return (
    <ASTProvider 
      tenant={tenantConfig}
      language={language}
      userId={userId}
      initialData={initialData}
    >
      <ASTFormContent userRole={userRole} />
    </ASTProvider>
  );
}

// =================== CONTENU PRINCIPAL AVEC CONTEXT ===================
function ASTFormContent({ userRole }: { userRole: string }) {
  const { 
    tenant, 
    state, 
    setLanguage, 
    nextStep, 
    previousStep, 
    canNavigateToNext, 
    canNavigateToPrevious,
    getCompletionPercentage 
  } = useAST();
  
  const isMobile = useIsMobile();
  const t = translations[state.language];
  const [isOnline, setIsOnline] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  // ✅ HANDLERS SIMPLES
  const handleCopyAST = async () => {
    try {
      await navigator.clipboard.writeText(state.formData.astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const handleLanguageChange = (newLang: 'fr' | 'en') => {
    setLanguage(newLang);
  };

  // ✅ ÉTAT ONLINE/OFFLINE
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${tenant.theme.primary}15 0%, ${tenant.theme.secondary}15 50%, ${tenant.theme.accent}15 100%)`,
      color: '#ffffff'
    }}>
      
      {/* ✅ HEADER RESPONSIVE */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      
      {/* ✅ NAVIGATION STEPS */}
      {isMobile ? <MobileStepsNav /> : <DesktopStepsNav />}
      
      {/* ✅ CONTENU PRINCIPAL */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '0' : '20px',
        paddingBottom: isMobile ? '100px' : '20px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: isMobile ? '16px' : '20px',
          padding: isMobile ? '20px 16px' : '32px 24px',
          margin: isMobile ? '16px' : '0 auto 24px',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          
          {/* Titre Step Desktop */}
          {!isMobile && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: tenant.theme.primary,
                marginBottom: '8px'
              }}>
                {t.steps[state.currentStep as keyof typeof t.steps]?.title}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                {t.steps[state.currentStep as keyof typeof t.steps]?.subtitle}
              </p>
            </div>
          )}

          {/* ✅ RENDU STEPS ULTRA-SIMPLE */}
          <StepRenderer />
        </div>
      </main>

      {/* ✅ NAVIGATION FOOTER */}
      {isMobile ? <MobileFooterNav /> : <DesktopFooterNav />}

      {/* ✅ CSS INLINE OPTIMISÉ */}
      <GlobalStyles />
    </div>
  );

  // =================== HEADERS ===================
  function MobileHeader() {
    const { tenant, state } = useAST();
    
    return (
      <header style={{
        background: `linear-gradient(135deg, ${tenant.theme.primary} 0%, ${tenant.theme.secondary} 100%)`,
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${tenant.theme.accent}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={tenant.logo} 
              alt={tenant.name}
              style={{ width: '40px', height: '40px', borderRadius: '8px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                {tenant.name}
              </h1>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                AST #{state.formData.astNumber?.slice(-6)}
              </div>
            </div>
          </div>
          
          <LanguageSelector />
        </div>
      </header>
    );
  }

  function DesktopHeader() {
    const { tenant, state } = useAST();
    
    return (
      <header style={{
        background: `linear-gradient(135deg, ${tenant.theme.primary} 0%, ${tenant.theme.secondary} 100%)`,
        padding: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${tenant.theme.accent}30`
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <img 
              src={tenant.logo} 
              alt={tenant.name}
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '16px',
                boxShadow: `0 0 30px ${tenant.theme.accent}40`
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            <div>
              <h1 style={{ fontSize: '32px', margin: 0, fontWeight: '900' }}>
                {tenant.name}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
                {t.subtitle} • AST #{state.formData.astNumber}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopyAST}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {state.formData.astNumber?.slice(-6)}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isOnline ? <Wifi size={16} color="#10b981" /> : <WifiOff size={16} color="#ef4444" />}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // =================== NAVIGATION STEPS ===================
  function MobileStepsNav() {
    const { state, setCurrentStep, tenant } = useAST();
    
    return (
      <nav style={{
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px'
      }}>
        {[1,2,3,4,5,6].map(step => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            style={{
              background: state.currentStep === step 
                ? `${tenant.theme.primary}40` 
                : 'rgba(30, 41, 59, 0.6)',
              border: state.currentStep === step 
                ? `1px solid ${tenant.theme.primary}` 
                : '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              padding: '8px 4px',
              color: state.currentStep === step ? '#ffffff' : '#94a3b8',
              fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ marginBottom: '2px' }}>
              {getCompletionPercentage() >= (step * 16.67) ? '✓' : step}
            </div>
            <div style={{ fontSize: '8px', lineHeight: '1.2' }}>
              {t.steps[step as keyof typeof t.steps]?.title.split(' ')[0]}
            </div>
          </button>
        ))}
      </nav>
    );
  }

  function DesktopStepsNav() {
    const { state, setCurrentStep, tenant } = useAST();
    
    return (
      <nav style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '16px'
        }}>
          {[1,2,3,4,5,6].map(step => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              style={{
                background: state.currentStep === step 
                  ? `linear-gradient(135deg, ${tenant.theme.primary}, ${tenant.theme.secondary})` 
                  : 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${state.currentStep === step ? tenant.theme.primary : 'rgba(100, 116, 139, 0.3)'}`,
                borderRadius: '12px',
                padding: '16px 12px',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                {getCompletionPercentage() >= (step * 16.67) ? '✅' : step}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>
                {t.steps[step as keyof typeof t.steps]?.title}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                {t.steps[step as keyof typeof t.steps]?.subtitle}
              </div>
            </button>
          ))}
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${tenant.theme.primary}, ${tenant.theme.accent})`,
              width: `${getCompletionPercentage()}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
            Progression: {getCompletionPercentage()}% complété
          </div>
        </div>
      </nav>
    );
  }

  // =================== FOOTER NAVIGATION ===================
  function MobileFooterNav() {
    return (
      <footer style={{
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={previousStep}
            disabled={!canNavigateToPrevious()}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: !canNavigateToPrevious() ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.6)',
              color: '#ffffff',
              fontWeight: '600',
              cursor: !canNavigateToPrevious() ? 'not-allowed' : 'pointer',
              opacity: !canNavigateToPrevious() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            {t.previous}
          </button>
          
          <button
            onClick={nextStep}
            disabled={!canNavigateToNext() || state.currentStep === 6}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: (!canNavigateToNext() || state.currentStep === 6) 
                ? 'rgba(100, 116, 139, 0.3)' 
                : `linear-gradient(135deg, ${tenant.theme.primary}, ${tenant.theme.secondary})`,
              color: '#ffffff',
              fontWeight: '600',
              cursor: (!canNavigateToNext() || state.currentStep === 6) ? 'not-allowed' : 'pointer',
              opacity: (!canNavigateToNext() || state.currentStep === 6) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {state.currentStep === 6 ? t.finished : t.next}
            {state.currentStep !== 6 && <ArrowRight size={16} />}
          </button>
        </div>
      </footer>
    );
  }

  function DesktopFooterNav() {
    return (
      <footer style={{
        padding: '20px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={previousStep}
          disabled={!canNavigateToPrevious()}
          style={{
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            background: !canNavigateToPrevious() ? 'rgba(100, 116, 139, 0.3)' : 'rgba(59, 130, 246, 0.2)',
            color: '#ffffff',
            fontWeight: '600',
            cursor: !canNavigateToPrevious() ? 'not-allowed' : 'pointer',
            opacity: !canNavigateToPrevious() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={18} />
          {t.previous}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
          <Save size={16} />
          <span>{state.isDirty ? t.saving : t.saved}</span>
          <div style={{
            width: '8px',
            height: '8px',
            background: state.isDirty ? '#f59e0b' : '#10b981',
            borderRadius: '50%'
          }} />
        </div>

        <button
          onClick={nextStep}
          disabled={!canNavigateToNext() || state.currentStep === 6}
          style={{
            padding: '14px 24px',
            borderRadius: '12px',
            border: 'none',
            background: (!canNavigateToNext() || state.currentStep === 6) 
              ? 'rgba(100, 116, 139, 0.3)' 
              : `linear-gradient(135deg, ${tenant.theme.primary}, ${tenant.theme.secondary})`,
            color: '#ffffff',
            fontWeight: '600',
            cursor: (!canNavigateToNext() || state.currentStep === 6) ? 'not-allowed' : 'pointer',
            opacity: (!canNavigateToNext() || state.currentStep === 6) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {state.currentStep === 6 ? t.finished : t.next}
          {state.currentStep !== 6 && <ArrowRight size={18} />}
        </button>
      </footer>
    );
  }

  // =================== SÉLECTEUR LANGUE ===================
  function LanguageSelector() {
    const { state, setLanguage } = useAST();
    
    return (
      <div style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '4px'
      }}>
        <button
          onClick={() => setLanguage('fr')}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: state.language === 'fr' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          FR
        </button>
        <button
          onClick={() => setLanguage('en')}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: state.language === 'en' ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          EN
        </button>
      </div>
    );
  }
}

// =================== RENDU STEPS ULTRA-SIMPLE ===================
function StepRenderer() {
  const { state, updateStepData, tenant } = useAST();
  
  // ✅ HANDLER STABLE DEPUIS CONTEXT - JAMAIS DE RE-RENDER
  const stableHandler = updateStepData;
  
  // ✅ PROPS STABLES POUR TOUS LES STEPS
  const commonProps = {
    formData: state.formData,
    onDataChange: stableHandler,
    language: state.language,
    tenant: tenant.id,
    errors: state.errors
  };

  switch (state.currentStep) {
    case 1:
      return <Step1ProjectInfo {...commonProps} />;
    case 2:
      return <Step2Equipment {...commonProps} />;
    case 3:
      return <Step3Hazards {...commonProps} />;
    case 4:
      return (
        <Step4Permits 
          {...commonProps}
          province="QC"
          userRole="worker"
          touchOptimized={true}
          compactMode={false}
          onPermitChange={(permits) => stableHandler('permits', permits)}
          initialPermits={[]}
        />
      );
    case 5:
      return <Step5Validation {...commonProps} />;
    case 6:
      return <Step6Finalization {...commonProps} />;
    default:
      return <div>Étape {state.currentStep}</div>;
  }
}

// =================== CSS GLOBAL OPTIMISÉ ===================
function GlobalStyles() {
  return (
    <style dangerouslySetInnerHTML={{ 
      __html: `
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        input, textarea, select {
          font-size: 16px !important;
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
        
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          overscroll-behavior: none;
        }
      `
    }} />
  );
}
