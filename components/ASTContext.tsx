'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

// =================== INTERFACES MULTI-TENANT ===================
export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  logo: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  modules: ('ast' | 'incidents' | 'inspections' | 'vehicles' | 'improvements')[];
  database: {
    host: string;
    schema: string;
    apiKey: string;
  };
  billing: {
    plan: 'starter' | 'pro' | 'enterprise';
    usersLimit: number;
    modulesLimit: number;
  };
}

export interface ASTState {
  formData: any;
  currentStep: number;
  errors: Record<string, string>;
  isDirty: boolean;
  lastSaved: string;
  language: 'fr' | 'en';
}

// =================== ACTIONS TYPES ===================
type ASTAction = 
  | { type: 'UPDATE_STEP_DATA'; section: string; data: any }
  | { type: 'SET_CURRENT_STEP'; step: number }
  | { type: 'SET_LANGUAGE'; language: 'fr' | 'en' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string };

// =================== REDUCER ANTI-RE-RENDER ===================
const astReducer = (state: ASTState, action: ASTAction): ASTState => {
  switch (action.type) {
    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: action.data
        },
        isDirty: true,
        lastSaved: new Date().toISOString()
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.step
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.language
      };
    
    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    
    case 'CLEAR_ERROR':
      const { [action.field]: removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors
      };
    
    default:
      return state;
  }
};

// =================== CONTEXT INTERFACE ===================
interface ASTContextValue {
  // État
  tenant: TenantConfig;
  state: ASTState;
  dispatch: React.Dispatch<ASTAction>;
  
  // Actions principales
  updateStepData: (section: string, data: any) => void;
  setCurrentStep: (step: number) => void;
  setLanguage: (language: 'fr' | 'en') => void;
  
  // Gestion erreurs
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  
  // Navigation
  canNavigateToNext: () => boolean;
  canNavigateToPrevious: () => boolean;
  nextStep: () => void;
  previousStep: () => void;
  
  // Utilitaires
  getCompletionPercentage: () => number;
  saveData: () => Promise<void>;
}

const ASTContext = createContext<ASTContextValue | null>(null);

// =================== PROVIDER ULTRA-STABLE ===================
export function ASTProvider({ 
  children, 
  tenant, 
  initialData = {},
  language = 'fr',
  userId
}: { 
  children: React.ReactNode;
  tenant: TenantConfig;
  initialData?: any;
  language?: 'fr' | 'en';
  userId?: string;
}) {
  
  // ✅ ÉTAT INITIAL STABLE
  const [state, dispatch] = useReducer(astReducer, {
    formData: {
      ...initialData,
      tenantId: tenant.id,
      astNumber: `AST-${tenant.id.toUpperCase()}-${Date.now()}`,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString()
    },
    currentStep: 1,
    errors: {},
    isDirty: false,
    lastSaved: new Date().toISOString(),
    language
  });

  // ✅ HANDLERS ULTRA-STABLES - Références figées
  const updateStepData = useCallback((section: string, data: any) => {
    logger.debug('🔥 Context Update:', { section, data, tenant: tenant.id });
    
    dispatch({
      type: 'UPDATE_STEP_DATA',
      section,
      data
    });

    // 🚀 Sauvegarde différée automatique
    setTimeout(() => {
      saveToTenantDatabase(tenant.database, section, data, state.formData.astNumber);
    }, 1000);
    
  }, [tenant.database, state.formData.astNumber]);

  const setCurrentStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      dispatch({
        type: 'SET_CURRENT_STEP',
        step
      });
    }
  }, []);

  const setLanguage = useCallback((newLanguage: 'fr' | 'en') => {
    dispatch({
      type: 'SET_LANGUAGE',
      language: newLanguage
    });
    
    // Sauvegarde préférence
    if (typeof window !== 'undefined') {
      localStorage.setItem('ast-language-preference', newLanguage);
    }
  }, []);

  const setError = useCallback((field: string, error: string) => {
    dispatch({
      type: 'SET_ERROR',
      field,
      error
    });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({
      type: 'CLEAR_ERROR',
      field
    });
  }, []);

  // ✅ LOGIQUE NAVIGATION OPTIMISÉE
  const canNavigateToNext = useCallback((): boolean => {
    const { formData, currentStep } = state;
    
    switch (currentStep) {
      case 1:
        return Boolean(formData.projectInfo?.client && formData.projectInfo?.workDescription);
      case 2:
        return Boolean(formData.equipment?.selected?.length > 0);
      case 3:
        return Boolean(formData.hazards?.selected?.length > 0);
      case 4:
        return true; // Permis optionnels
      case 5:
        return true; // Validation optionnelle
      case 6:
        return false; // Dernière étape
      default:
        return false;
    }
  }, [state]);

  const canNavigateToPrevious = useCallback((): boolean => {
    return state.currentStep > 1;
  }, [state.currentStep]);

  const nextStep = useCallback(() => {
    if (canNavigateToNext() && state.currentStep < 6) {
      setCurrentStep(state.currentStep + 1);
    }
  }, [canNavigateToNext, state.currentStep, setCurrentStep]);

  const previousStep = useCallback(() => {
    if (canNavigateToPrevious()) {
      setCurrentStep(state.currentStep - 1);
    }
  }, [canNavigateToPrevious, state.currentStep, setCurrentStep]);

  // ✅ UTILITAIRES
  const getCompletionPercentage = useCallback((): number => {
    const { formData } = state;
    let completed = 0;
    
    if (formData.projectInfo?.client && formData.projectInfo?.workDescription) completed++;
    if (formData.equipment?.selected?.length > 0) completed++;
    if (formData.hazards?.selected?.length > 0) completed++;
    if (formData.permits?.permits?.length > 0) completed++;
    if (formData.validation?.reviewers?.length > 0) completed++;
    if (state.currentStep >= 6) completed++;
    
    return Math.round((completed / 6) * 100);
  }, [state]);

  const saveData = useCallback(async (): Promise<void> => {
    try {
      await saveToTenantDatabase(
        tenant.database, 
        'complete_ast', 
        state.formData, 
        state.formData.astNumber
      );
      dispatch({ type: 'MARK_SAVED' });
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      throw error;
    }
  }, [tenant.database, state.formData]);

  // ✅ VALEUR CONTEXT STABLE avec useRef
  const contextValue = useRef<ASTContextValue>({
    tenant,
    state,
    dispatch,
    updateStepData,
    setCurrentStep,
    setLanguage,
    setError,
    clearError,
    canNavigateToNext,
    canNavigateToPrevious,
    nextStep,
    previousStep,
    getCompletionPercentage,
    saveData
  });

  // Mise à jour seulement des valeurs qui changent
  contextValue.current.state = state;
  contextValue.current.tenant = tenant;

  // ✅ AUTO-SAVE AVEC CLEANUP
  useEffect(() => {
    if (state.isDirty) {
      const saveTimer = setTimeout(() => {
        dispatch({ type: 'MARK_SAVED' });
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [state.isDirty]);

  // ✅ RÉCUPÉRATION LANGUE SAUVEGARDÉE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
      if (savedLanguage && savedLanguage !== state.language) {
        setLanguage(savedLanguage);
      }
    }
  }, [setLanguage, state.language]);

  return (
    <ASTContext.Provider value={contextValue.current}>
      {children}
    </ASTContext.Provider>
  );
}

// =================== HOOK CUSTOM OPTIMISÉ ===================
export function useAST() {
  const context = useContext(ASTContext);
  if (!context) {
    throw new Error('useAST must be used within ASTProvider');
  }
  return context;
}

// =================== API MULTI-TENANT AMÉLIORÉE ===================
async function saveToTenantDatabase(
  dbConfig: TenantConfig['database'], 
  section: string, 
  data: any,
  astNumber: string
) {
  try {
    // 🚀 Mode development - simulation API
    if (process.env.NODE_ENV === 'development') {
      logger.debug('💾 DEV - Sauvegarde simulée:', {
        tenant: dbConfig.schema,
        section,
        astNumber,
        dataSize: JSON.stringify(data).length
      });
      return;
    }

    // 🚀 Mode production - vraie API
    const response = await fetch(`${dbConfig.host}/api/tenants/${dbConfig.schema}/ast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dbConfig.apiKey}`,
        'X-Tenant-Schema': dbConfig.schema,
        'X-AST-Number': astNumber
      },
      body: JSON.stringify({
        section,
        data,
        astNumber,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    logger.info('✅ Sauvegardé dans BD tenant:', dbConfig.schema, result);
    
    } catch (error) {
      logger.error('❌ Erreur sauvegarde tenant:', error);
    // En cas d'erreur, sauvegarde locale de secours
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ast_backup_${astNumber}`, JSON.stringify({
        section,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  }
}

// =================== CONFIGURATION TENANTS PAR DÉFAUT ===================
export const DEFAULT_TENANT_CONFIGS: Record<string, TenantConfig> = {
  'demo': {
    id: 'demo',
    name: 'C-Secur360 Demo',
    domain: 'demo.c-secur360.com',
    logo: '/c-secur360-logo.png',
    theme: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa'
    },
    modules: ['ast'],
    database: {
      host: 'https://api.c-secur360.com',
      schema: 'demo',
      apiKey: 'demo_key_123'
    },
    billing: {
      plan: 'starter',
      usersLimit: 10,
      modulesLimit: 1
    }
  },
  
  'hydro-quebec': {
    id: 'hydro-quebec',
    name: 'Hydro-Québec',
    domain: 'hydro.c-secur360.com',
    logo: '/logos/hydro-quebec.png',
    theme: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#3b82f6'
    },
    modules: ['ast', 'incidents', 'inspections'],
    database: {
      host: 'https://api.c-secur360.com',
      schema: 'hydro_quebec',
      apiKey: 'hq_prod_key_123'
    },
    billing: {
      plan: 'enterprise',
      usersLimit: 1000,
      modulesLimit: 5
    }
  },
  
  'energir': {
    id: 'energir',
    name: 'Énergir',
    domain: 'energir.c-secur360.com',
    logo: '/logos/energir.png',
    theme: {
      primary: '#dc2626',
      secondary: '#991b1b',
      accent: '#ef4444'
    },
    modules: ['ast', 'vehicles', 'improvements'],
    database: {
      host: 'https://api.c-secur360.com',
      schema: 'energir',
      apiKey: 'en_prod_key_456'
    },
    billing: {
      plan: 'pro',
      usersLimit: 500,
      modulesLimit: 3
    }
  }
};

// =================== HELPER FUNCTIONS ===================
export function createTenantConfig(
  id: string,
  name: string,
  customizations: Partial<TenantConfig> = {}
): TenantConfig {
  return {
    id,
    name,
    domain: `${id}.c-secur360.com`,
    logo: `/logos/${id}.png`,
    theme: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa'
    },
    modules: ['ast'],
    database: {
      host: 'https://api.c-secur360.com',
      schema: id,
      apiKey: `${id}_key_${Date.now()}`
    },
    billing: {
      plan: 'starter',
      usersLimit: 50,
      modulesLimit: 1
    },
    ...customizations
  };
}
