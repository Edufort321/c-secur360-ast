// =================== HOOKS/USEPERMITS.TS - HOOK REACT MOBILE-FIRST ===================
// Hook React pour gestion complète des permis avec Supabase, cache mobile et sync offline

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// =================== TYPES DÉFINIS LOCALEMENT ===================

export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

export interface LegalPermit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: ProvinceCode[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData: any;
  code: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
  };
  compliance: Record<string, boolean>;
}

export interface PermitFormData {
  identification: {
    codePermis: string;
    numeroFormulaire: string;
    lieuTravail: { fr: string; en: string; };
    descriptionTravaux: { fr: string; en: string; };
    dateDebut: string;
    dateFin: string;
    dureeEstimee: string;
    typePermis: PermitType;
    province: ProvinceCode;
    adresseComplete: { fr: string; en: string; };
    contactUrgenceLocal: string;
  };
  personnel: {
    superviseur: any;
    surveillants: any[];
    entrants: any[];
    specialisedPersonnel: Record<string, any>;
  };
  testsEtMesures: {
    atmospherique: {
      oxygene: any;
      gazToxiques: any;
      gazCombustibles: any;
      ventilation: any;
      conditionsEnvironnementales: any;
    };
  };
  equipements: {
    protection: any[];
    detection: any[];
    sauvetage: any[];
    communication: any[];
    specialises: Record<string, any>;
  };
  procedures: Record<string, any>;
  surveillance: {
    travauxTermines: boolean;
    heureFin: string;
    surveillanceActive: boolean;
    timerActif: boolean;
    dureeRequise: number;
    tempsRestant: number;
    interventionEnCours: boolean;
    incidents: any[];
    typesSurveillance: any[];
  };
  validation: {
    tousTestsCompletes: boolean;
    documentationComplete: boolean;
    formationVerifiee: boolean;
    equipementsVerifies: boolean;
    conformeReglementation: boolean;
    signatureResponsable: string;
    dateValidation: string;
    certificationsValides: boolean;
    planUrgenceApprouve: boolean;
    numeroFormulaireFinal: string;
    commentairesValidation: { fr: string; en: string; };
    restrictions: { fr: string[]; en: string[]; };
  };
}

export interface FormValidationResult {
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  completionPercentage: number;
}

export interface PermitSearchCriteria {
  motsCles?: { fr?: string; en?: string; };
  typePermis?: PermitType[];
  province?: ProvinceCode[];
  priorite?: string[];
  statut?: string[];
}

export interface PermitCreationOptions {
  typePermis: PermitType;
  province: ProvinceCode;
  langue: 'fr' | 'en';
  urgence?: boolean;
}

export interface RealTimeValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  sectionProgress: Record<string, number>;
  overallProgress: number;
  autoCorrections: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  mobileFeedback: {
    haptic: 'light' | 'medium' | 'heavy';
    visual: 'green' | 'yellow' | 'red' | 'blue';
  };
}

// =================== FONCTIONS TEMPORAIRES ===================
const generateCompliantPermits = (language: string, province: string, options: any): LegalPermit[] => {
  return [
    {
      id: `${province.toLowerCase()}-espace-clos-${Date.now()}`,
      name: language === 'fr' ? 'Permis Espace Clos' : 'Confined Space Permit',
      description: language === 'fr' ? 'Permis pour travaux en espace clos' : 'Permit for confined space work',
      category: 'Espaces Clos',
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province as ProvinceCode],
      priority: 'critical',
      selected: false,
      formData: {},
      code: `EC-${Date.now()}`,
      status: 'draft',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: true,
        entryProcedure: true,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: true,
        documentation: true
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      },
      compliance: {
        [province.toLowerCase()]: true
      }
    }
  ];
};

const searchPermitsOptimized = (criteria: PermitSearchCriteria, permits: LegalPermit[], language: string, mobile: boolean): LegalPermit[] => {
  return permits.filter(permit => {
    if (criteria.motsCles?.fr && language === 'fr') {
      return permit.name.toLowerCase().includes(criteria.motsCles.fr.toLowerCase()) ||
             permit.description.toLowerCase().includes(criteria.motsCles.fr.toLowerCase());
    }
    if (criteria.motsCles?.en && language === 'en') {
      return permit.name.toLowerCase().includes(criteria.motsCles.en.toLowerCase()) ||
             permit.description.toLowerCase().includes(criteria.motsCles.en.toLowerCase());
    }
    return true;
  });
};

const validateAtmosphericData = (data: any) => ({ valid: true });
const validatePersonnelRequirements = (data: any) => ({ valid: true });
const generatePermitPDF = async (permit: any, formData: any, options: any) => ({ success: true, downloadUrl: '' });
const exportPermitData = async (permit: any, formData: any, options: any) => ({ success: true });

// MobileFormValidator temporaire
class MobileFormValidator {
  constructor(permitType: any, province: any, language: any, options: any) {}
  validateForm(formData: any): FormValidationResult { 
    return { errors: [], completionPercentage: 0 }; 
  }
  validateField(path: string, value: any, formData: any): RealTimeValidationResult { 
    return { 
      isValid: true, 
      fieldErrors: {}, 
      sectionProgress: {}, 
      overallProgress: 0, 
      autoCorrections: [], 
      mobileFeedback: { haptic: 'light' as any, visual: 'blue' } 
    }; 
  }
}

// =================== INTERFACES HOOK MOBILE ===================
export interface UsePermitsConfig {
  tenant: string;
  province: ProvinceCode;
  language: 'fr' | 'en';
  mobileOptimized: boolean;
  enableOffline: boolean;
  enableRealTimeValidation: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number; // millisecondes
  enableHaptics: boolean;
  enableNotifications: boolean;
  supabaseEnabled: boolean;
}

export interface UsePermitsState {
  // Données permis
  permits: LegalPermit[];
  archivedPermits: LegalPermit[];
  currentPermit: LegalPermit | null;
  formData: PermitFormData | null;
  
  // États interface mobile
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  offline: boolean;
  
  // Validation temps réel
  validation: FormValidationResult | null;
  fieldValidation: Record<string, RealTimeValidationResult>;
  
  // Navigation mobile
  currentSection: string;
  sectionProgress: Record<string, number>;
  overallProgress: number;
  
  // Recherche et filtres
  searchTerm: string;
  selectedCategory: string;
  searchResults: LegalPermit[];
  
  // États spéciaux mobile
  isScrolling: boolean;
  keyboardOpen: boolean;
  backgrounded: boolean;
  networkStatus: 'online' | 'offline' | 'slow';
  
  // Cache et sync
  lastSync: Date | null;
  pendingChanges: number;
  cacheSize: number;
}

export interface UsePermitsActions {
  // CRUD Operations
  createPermit: (options: PermitCreationOptions) => Promise<LegalPermit>;
  loadPermit: (permitId: string) => Promise<LegalPermit | null>;
  savePermit: (permit: LegalPermit, formData: PermitFormData) => Promise<boolean>;
  deletePermit: (permitId: string) => Promise<boolean>;
  archivePermit: (permitId: string) => Promise<boolean>;
  duplicatePermit: (permitId: string) => Promise<LegalPermit>;
  
  // Formulaire mobile
  updateFormData: (section: string, data: any) => void;
  validateField: (fieldPath: string, value: any) => RealTimeValidationResult;
  autoSaveForm: () => Promise<void>;
  resetForm: () => void;
  
  // Navigation mobile
  navigateToSection: (section: string) => void;
  nextSection: () => void;
  previousSection: () => void;
  scrollToField: (fieldPath: string) => void;
  
  // Recherche optimisée mobile
  searchPermits: (criteria: PermitSearchCriteria) => void;
  filterByCategory: (category: string) => void;
  clearSearch: () => void;
  
  // Export et partage mobile
  generatePDF: (permitId: string) => Promise<string>; // URL de partage
  sharePermit: (permitId: string, format: 'pdf' | 'json') => Promise<void>;
  exportToCloud: (permitId: string, service: 'google_drive' | 'dropbox') => Promise<void>;
  
  // Sync et cache mobile
  syncWithServer: () => Promise<void>;
  enableOfflineMode: () => void;
  clearCache: () => Promise<void>;
  
  // États interface mobile
  setScrolling: (scrolling: boolean) => void;
  setKeyboardOpen: (open: boolean) => void;
  setBackgrounded: (backgrounded: boolean) => void;
}

// =================== HOOK PRINCIPAL USEPERMITS ===================
export const usePermits = (config: UsePermitsConfig): [UsePermitsState, UsePermitsActions] => {
  // =================== ÉTAT PRINCIPAL ===================
  const [state, setState] = useState<UsePermitsState>({
    permits: [],
    archivedPermits: [],
    currentPermit: null,
    formData: null,
    loading: false,
    saving: false,
    syncing: false,
    offline: !navigator.onLine,
    validation: null,
    fieldValidation: {},
    currentSection: 'identification',
    sectionProgress: {},
    overallProgress: 0,
    searchTerm: '',
    selectedCategory: 'all',
    searchResults: [],
    isScrolling: false,
    keyboardOpen: false,
    backgrounded: false,
    networkStatus: navigator.onLine ? 'online' : 'offline',
    lastSync: null,
    pendingChanges: 0,
    cacheSize: 0
  });

  // =================== REFS POUR MOBILE ===================
  const validatorRef = useRef<MobileFormValidator | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Date>(new Date());
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const cacheRef = useRef<Map<string, any>>(new Map());

  // =================== VALIDATION TEMPS RÉEL ===================
  const initializeValidator = useCallback((permitType: PermitType) => {
    validatorRef.current = new MobileFormValidator(
      permitType,
      config.province,
      config.language,
      {
        realTimeValidation: config.enableRealTimeValidation,
        autoCorrection: true,
        hapticFeedback: config.enableHaptics,
        touchOptimized: config.mobileOptimized
      }
    );
  }, [config]);

  // =================== GESTION RÉSEAU MOBILE ===================
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, offline: false, networkStatus: 'online' }));
      if (config.supabaseEnabled) {
        // Auto-sync when back online
        actions.syncWithServer();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, offline: true, networkStatus: 'offline' }));
      if (config.enableNotifications) {
        showNotification('Mode hors ligne activé', 'Vos modifications seront synchronisées lors de la reconnexion');
      }
    };

    // Détection connexion lente
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        const slowTypes = ['slow-2g', '2g', '3g'];
        const isSlow = slowTypes.includes(connection.effectiveType);
        setState(prev => ({ 
          ...prev, 
          networkStatus: isSlow ? 'slow' : 'online' 
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // API Network Information pour détecter connexions lentes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [config]);

  // =================== GESTION CLAVIER MOBILE ===================
  useEffect(() => {
    if (!config.mobileOptimized) return;

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const isKeyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
        setState(prev => ({ ...prev, keyboardOpen: isKeyboardOpen }));
      }
    };

    const handleResize = () => {
      // Fallback pour navigateurs sans Visual Viewport API
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75;
      setState(prev => ({ ...prev, keyboardOpen: isKeyboardOpen }));
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [config.mobileOptimized]);

  // =================== GESTION APP LIFECYCLE MOBILE ===================
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isBackgrounded = document.hidden;
      setState(prev => ({ ...prev, backgrounded: isBackgrounded }));
      
      if (isBackgrounded) {
        // App mise en arrière-plan - sauvegarder immédiatement
        if (config.enableAutoSave && state.currentPermit && state.formData) {
          actions.autoSaveForm();
        }
      } else {
        // App revenue au premier plan - vérifier sync
        if (config.supabaseEnabled && !state.offline) {
          actions.syncWithServer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [config, state.currentPermit, state.formData]);

  // =================== CACHE LOCAL INTELLIGENT ===================
  const getCacheKey = useCallback((permitId: string, type: 'permit' | 'form' | 'validation') => {
    return `${config.tenant}_${type}_${permitId}`;
  }, [config.tenant]);

  const saveToCache = useCallback(async (key: string, data: any) => {
    try {
      // Cache en mémoire pour accès rapide
      cacheRef.current.set(key, data);
      
      // Cache persistant pour offline
      if (config.enableOffline && 'localStorage' in window) {
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          version: '2025.1'
        }));
      }
      
      // Mettre à jour taille cache
      setState(prev => ({ 
        ...prev, 
        cacheSize: cacheRef.current.size 
      }));
    } catch (error) {
      console.warn('Cache save failed:', error);
    }
  }, [config.enableOffline]);

  const loadFromCache = useCallback(async (key: string): Promise<any | null> => {
    try {
      // Vérifier cache mémoire d'abord
      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key);
      }
      
      // Vérifier cache persistant
      if (config.enableOffline && 'localStorage' in window) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Vérifier âge du cache (24h max)
          const age = Date.now() - parsed.timestamp;
          if (age < 24 * 60 * 60 * 1000) {
            cacheRef.current.set(key, parsed.data);
            return parsed.data;
          } else {
            localStorage.removeItem(key);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Cache load failed:', error);
      return null;
    }
  }, [config.enableOffline]);

  // =================== ACTIONS CRUD ===================
  const createPermit = useCallback(async (options: PermitCreationOptions): Promise<LegalPermit> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Générer permis conforme
      const newPermits = generateCompliantPermits(
        options.langue,
        options.province,
        { mobileOptimized: config.mobileOptimized }
      );
      
      const newPermit = newPermits.find(p => 
        p.id.includes(options.typePermis)
      ) || newPermits[0];
      
      if (!newPermit) {
        throw new Error(`Permit type ${options.typePermis} not available in ${options.province}`);
      }
      
      // Initialiser formulaire vide
      const initialFormData: PermitFormData = createInitialFormData(options);
      
      // Sauvegarder en cache
      await saveToCache(getCacheKey(newPermit.id, 'permit'), newPermit);
      await saveToCache(getCacheKey(newPermit.id, 'form'), initialFormData);
      
      // Mettre à jour état
      setState(prev => ({
        ...prev,
        permits: [...prev.permits, newPermit],
        currentPermit: newPermit,
        formData: initialFormData,
        loading: false,
        pendingChanges: prev.pendingChanges + 1
      }));
      
      // Initialiser validateur
      initializeValidator(options.typePermis);
      
      // Sync avec Supabase si en ligne
      if (config.supabaseEnabled && !state.offline) {
        savePermitToSupabase(newPermit, initialFormData);
      }
      
      return newPermit;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [config, state.offline, getCacheKey, saveToCache, initializeValidator]);

  const loadPermit = useCallback(async (permitId: string): Promise<LegalPermit | null> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Vérifier cache d'abord
      let permit = await loadFromCache(getCacheKey(permitId, 'permit'));
      let formData = await loadFromCache(getCacheKey(permitId, 'form'));
      
      // Si pas en cache et en ligne, charger depuis Supabase
      if (!permit && config.supabaseEnabled && !state.offline) {
        const result = await loadPermitFromSupabase(permitId);
        if (result) {
          permit = result.permit;
          formData = result.formData;
          
          // Mettre en cache
          await saveToCache(getCacheKey(permitId, 'permit'), permit);
          await saveToCache(getCacheKey(permitId, 'form'), formData);
        }
      }
      
      if (permit) {
        setState(prev => ({
          ...prev,
          currentPermit: permit,
          formData: formData || null,
          loading: false
        }));
        
        // Initialiser validateur
        const permitType = extractPermitTypeFromPermit(permit);
        initializeValidator(permitType);
        
        return permit;
      } else {
        setState(prev => ({ ...prev, loading: false }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Load permit failed:', error);
      return null;
    }
  }, [config, state.offline, getCacheKey, loadFromCache, saveToCache, initializeValidator]);

  const savePermit = useCallback(async (permit: LegalPermit, formData: PermitFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, saving: true }));
    
    try {
      // Validation complète avant sauvegarde
      if (validatorRef.current) {
        const validation = validatorRef.current.validateForm(formData);
        setState(prev => ({ ...prev, validation }));
        
        // Si erreurs critiques, ne pas sauvegarder
        const criticalErrors = validation.errors.filter(e => e.severity === 'error');
        if (criticalErrors.length > 0 && !permit.id.includes('draft')) {
          setState(prev => ({ ...prev, saving: false }));
          return false;
        }
      }
      
      // Mettre à jour timestamps
      const updatedPermit = {
        ...permit,
        dateModified: new Date().toISOString(),
        formData
      };
      
      // Sauvegarder en cache
      await saveToCache(getCacheKey(permit.id, 'permit'), updatedPermit);
      await saveToCache(getCacheKey(permit.id, 'form'), formData);
      
      // Mettre à jour état local
      setState(prev => ({
        ...prev,
        permits: prev.permits.map(p => p.id === permit.id ? updatedPermit : p),
        currentPermit: updatedPermit,
        formData,
        saving: false,
        pendingChanges: prev.pendingChanges + 1
      }));
      
      // Sync avec Supabase si en ligne
      if (config.supabaseEnabled && !state.offline) {
        await savePermitToSupabase(updatedPermit, formData);
        setState(prev => ({ ...prev, pendingChanges: Math.max(0, prev.pendingChanges - 1) }));
      }
      
      lastSaveRef.current = new Date();
      
      // Feedback haptic success
      if (config.enableHaptics && navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, saving: false }));
      console.error('Save permit failed:', error);
      return false;
    }
  }, [config, state.offline, getCacheKey, saveToCache]);

  // =================== ACTIONS FORMULAIRE MOBILE ===================
  const updateFormData = useCallback((section: string, data: any) => {
    if (!state.formData) return;
    
    const updatedFormData = {
      ...state.formData,
      [section]: { ...state.formData[section as keyof PermitFormData], ...data }
    };
    
    setState(prev => ({ ...prev, formData: updatedFormData }));
    
    // Validation temps réel si activée
    if (config.enableRealTimeValidation && validatorRef.current) {
      const validation = validatorRef.current.validateForm(updatedFormData);
      const sectionProgress = validation.completionPercentage;
      
      setState(prev => ({
        ...prev,
        validation,
        sectionProgress: { ...prev.sectionProgress, [section]: sectionProgress },
        overallProgress: validation.completionPercentage
      }));
    }
    
    // Auto-save si activé
    if (config.enableAutoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (state.currentPermit) {
          savePermit(state.currentPermit, updatedFormData);
        }
      }, config.autoSaveInterval);
    }
  }, [state.formData, state.currentPermit, config, savePermit]);

  const validateField = useCallback((fieldPath: string, value: any): RealTimeValidationResult => {
    if (!validatorRef.current || !state.formData) {
      return {
        isValid: true,
        fieldErrors: {},
        sectionProgress: {},
        overallProgress: 0,
        autoCorrections: [],
        mobileFeedback: { haptic: 'light', visual: 'blue' }
      };
    }
    
    const result = validatorRef.current.validateField(fieldPath, value, state.formData);
    
    // Mettre à jour validation field-level
    setState(prev => ({
      ...prev,
      fieldValidation: { ...prev.fieldValidation, [fieldPath]: result }
    }));
    
    // Feedback haptic
    if (config.enableHaptics && navigator.vibrate) {
      const patterns = {
        success: 50,
        warning: [100, 50, 100],
        error: [100, 50, 100, 50, 100],
        light: 25,
        medium: 50,
        heavy: [100, 50, 100]
      };
      navigator.vibrate(patterns[result.mobileFeedback.haptic] || 25);
    }
    
    return result;
  }, [state.formData, config.enableHaptics]);

  const autoSaveForm = useCallback(async (): Promise<void> => {
    if (state.currentPermit && state.formData && !state.saving) {
      await savePermit(state.currentPermit, state.formData);
    }
  }, [state.currentPermit, state.formData, state.saving, savePermit]);

  // =================== NAVIGATION MOBILE ===================
  const navigateToSection = useCallback((section: string) => {
    setState(prev => ({ ...prev, currentSection: section }));
    
    // Scroll smooth vers section
    if (scrollContainerRef.current) {
      const sectionElement = scrollContainerRef.current.querySelector(`#section-${section}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const nextSection = useCallback(() => {
    const sections = ['identification', 'personnel', 'testing', 'equipment', 'procedures', 'validation'];
    const currentIndex = sections.indexOf(state.currentSection);
    if (currentIndex < sections.length - 1) {
      navigateToSection(sections[currentIndex + 1]);
    }
  }, [state.currentSection, navigateToSection]);

  const previousSection = useCallback(() => {
    const sections = ['identification', 'personnel', 'testing', 'equipment', 'procedures', 'validation'];
    const currentIndex = sections.indexOf(state.currentSection);
    if (currentIndex > 0) {
      navigateToSection(sections[currentIndex - 1]);
    }
  }, [state.currentSection, navigateToSection]);

  const scrollToField = useCallback((fieldPath: string) => {
    if (scrollContainerRef.current) {
      const fieldElement = scrollContainerRef.current.querySelector(`[data-field-path="${fieldPath}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus si c'est un input
        if (fieldElement instanceof HTMLInputElement || fieldElement instanceof HTMLTextAreaElement) {
          setTimeout(() => fieldElement.focus(), 300);
        }
      }
    }
  }, []);

  // =================== RECHERCHE MOBILE ===================
  const searchPermits = useCallback((criteria: PermitSearchCriteria) => {
    const results = searchPermitsOptimized(
      criteria,
      state.permits,
      config.language,
      config.mobileOptimized
    );
    
    setState(prev => ({ 
      ...prev, 
      searchResults: results,
      searchTerm: criteria.motsCles?.[config.language] || ''
    }));
  }, [state.permits, config.language, config.mobileOptimized]);

  const filterByCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
    
    if (category === 'all') {
      setState(prev => ({ ...prev, searchResults: prev.permits }));
    } else {
      const filtered = state.permits.filter(p => p.category === category);
      setState(prev => ({ ...prev, searchResults: filtered }));
    }
  }, [state.permits]);

  // =================== EXPORT MOBILE ===================
  const generatePDF = useCallback(async (permitId: string): Promise<string> => {
    const permit = state.permits.find(p => p.id === permitId);
    const formData = await loadFromCache(getCacheKey(permitId, 'form'));
    
    if (!permit || !formData) {
      throw new Error('Permit or form data not found');
    }
    
    const result = await generatePermitPDF(permit, formData, {
      language: config.language,
      includeQRCode: true,
      mobileOptimized: config.mobileOptimized,
      includePhotos: true,
      includeSignatures: true
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.downloadUrl || '';
  }, [state.permits, config, getCacheKey, loadFromCache]);

  const sharePermit = useCallback(async (permitId: string, format: 'pdf' | 'json'): Promise<void> => {
    const permit = state.permits.find(p => p.id === permitId);
    const formData = await loadFromCache(getCacheKey(permitId, 'form'));
    
    if (!permit || !formData) {
      throw new Error('Permit not found');
    }
    
    const exportResult = await exportPermitData(permit, formData, {
      format,
      includeAttachments: true,
      compressImages: true,
      mobileShare: true,
      emailIntegration: false
    });
    
    if (!exportResult.success) {
      throw new Error(exportResult.error);
    }
    
    // Utiliser Web Share API si disponible
    if (navigator.share && exportResult.mobileShareData) {
      try {
        await navigator.share(exportResult.mobileShareData);
      } catch (error) {
        // Fallback: téléchargement direct
        if (exportResult.exportUrl) {
          const link = document.createElement('a');
          link.href = exportResult.exportUrl;
          link.download = exportResult.fileName || `${permit.code}.${format}`;
          link.click();
        }
      }
    }
  }, [state.permits, getCacheKey, loadFromCache]);

  // =================== SYNC SUPABASE ===================
  const syncWithServer = useCallback(async (): Promise<void> => {
    if (!config.supabaseEnabled || state.offline) return;
    
    setState(prev => ({ ...prev, syncing: true }));
    
    try {
      // Sync permits en attente
      const pendingPermits = state.permits.filter(p => p.dateModified > (state.lastSync?.toISOString() || ''));
      
      for (const permit of pendingPermits) {
        const formData = await loadFromCache(getCacheKey(permit.id, 'form'));
        if (formData) {
          await savePermitToSupabase(permit, formData);
        }
      }
      
      // Charger nouveaux permits du serveur
      const serverPermits = await loadPermitsFromSupabase(config.tenant, config.province);
      
      setState(prev => ({
        ...prev,
        permits: mergePermits(prev.permits, serverPermits),
        syncing: false,
        lastSync: new Date(),
        pendingChanges: 0
      }));
      
    } catch (error) {
      setState(prev => ({ ...prev, syncing: false }));
      console.error('Sync failed:', error);
    }
  }, [config, state.offline, state.permits, state.lastSync, getCacheKey, loadFromCache]);

  // =================== ACTIONS OBJECT ===================
  const actions: UsePermitsActions = {
    createPermit,
    loadPermit,
    savePermit,
    deletePermit: async () => true, // TODO: Implémenter
    archivePermit: async () => true, // TODO: Implémenter
    duplicatePermit: async () => ({} as LegalPermit), // TODO: Implémenter
    updateFormData,
    validateField,
    autoSaveForm,
    resetForm: () => setState(prev => ({ ...prev, formData: null, currentPermit: null })),
    navigateToSection,
    nextSection,
    previousSection,
    scrollToField,
    searchPermits,
    filterByCategory,
    clearSearch: () => setState(prev => ({ ...prev, searchTerm: '', searchResults: prev.permits })),
    generatePDF,
    sharePermit,
    exportToCloud: async () => {}, // TODO: Implémenter
    syncWithServer,
    enableOfflineMode: () => setState(prev => ({ ...prev, offline: true })),
    clearCache: async () => {
      cacheRef.current.clear();
      if ('localStorage' in window) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(config.tenant));
        keys.forEach(key => localStorage.removeItem(key));
      }
      setState(prev => ({ ...prev, cacheSize: 0 }));
    },
    setScrolling: (scrolling) => setState(prev => ({ ...prev, isScrolling: scrolling })),
    setKeyboardOpen: (open) => setState(prev => ({ ...prev, keyboardOpen: open })),
    setBackgrounded: (backgrounded) => setState(prev => ({ ...prev, backgrounded: backgrounded }))
  };

  // =================== INITIALISATION ===================
  useEffect(() => {
    // Charger permis au démarrage
    const loadInitialPermits = async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        const permits = generateCompliantPermits(
          config.language,
          config.province,
          { mobileOptimized: config.mobileOptimized }
        );
        
        setState(prev => ({
          ...prev,
          permits,
          searchResults: permits,
          loading: false
        }));
        
        // Sync avec Supabase si activé
        if (config.supabaseEnabled && !state.offline) {
          syncWithServer();
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
        console.error('Initial load failed:', error);
      }
    };

    loadInitialPermits();
  }, [config.province, config.language]);

  return [state, actions];
};

// =================== HOOKS SIMPLIFIÉS POUR INDEX.TSX ===================

// Hook simplifié pour les données de permis
export const usePermitData = (initialPermits: any[] = [], onPermitChange?: (permits: any[]) => void) => {
  const [permits, setPermits] = useState(initialPermits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePermits = useCallback((newPermits: any[]) => {
    setPermits(newPermits);
    onPermitChange?.(newPermits);
  }, [onPermitChange]);

  const addPermit = useCallback((permit: any) => {
    const newPermits = [...permits, { ...permit, id: Date.now().toString() }];
    updatePermits(newPermits);
  }, [permits, updatePermits]);

  const updatePermit = useCallback((id: string, updates: any) => {
    const newPermits = permits.map(p => p.id === id ? { ...p, ...updates } : p);
    updatePermits(newPermits);
  }, [permits, updatePermits]);

  const deletePermit = useCallback((id: string) => {
    const newPermits = permits.filter(p => p.id !== id);
    updatePermits(newPermits);
  }, [permits, updatePermits]);

  return {
    permits,
    loading,
    error,
    addPermit,
    updatePermit,
    deletePermit,
    setPermits: updatePermits
  };
};

// Hook simplifié pour la validation
export const usePermitValidation = (permit?: any) => {
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePermit = useCallback(async (permitToValidate: any) => {
    setIsValidating(true);
    
    // Simulation de validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const results = {
      overall: { isValid: true, score: 95 },
      atmospheric: { isValid: true, issues: [] },
      equipment: { isValid: true, issues: [] },
      personnel: { isValid: true, issues: [] },
      procedures: { isValid: true, issues: [] }
    };
    
    setValidationResults(results);
    setIsValidating(false);
    
    return results;
  }, []);

  useEffect(() => {
    if (permit) {
      validatePermit(permit);
    }
  }, [permit, validatePermit]);

  return {
    validationResults,
    isValidating,
    validatePermit,
    setValidationResults
  };
};

// Hook simplifié pour la surveillance
export const useSurveillance = (config?: any) => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [status, setStatus] = useState<'normal' | 'warning' | 'critical'>('normal');

  const startSurveillance = useCallback(() => {
    setIsActive(true);
    setTimeRemaining(config?.workingTime * 60 || 3600);
  }, [config]);

  const stopSurveillance = useCallback(() => {
    setIsActive(false);
  }, []);

  const extendTime = useCallback((minutes: number) => {
    setTimeRemaining(prev => prev + (minutes * 60));
  }, []);

  return {
    isActive,
    timeRemaining,
    status,
    startSurveillance,
    stopSurveillance,
    extendTime,
    setTimeRemaining,
    setStatus
  };
};

// Hook simplifié pour les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback((notification: any) => {
    const newNotif = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotif]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
};

// =================== FONCTIONS UTILITAIRES ===================
const createInitialFormData = (options: PermitCreationOptions): PermitFormData => {
  return {
    identification: {
      codePermis: '',
      numeroFormulaire: '',
      lieuTravail: { fr: '', en: '' },
      descriptionTravaux: { fr: '', en: '' },
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      dureeEstimee: '',
      typePermis: options.typePermis,
      province: options.province,
      adresseComplete: { fr: '', en: '' },
      contactUrgenceLocal: ''
    },
    personnel: {
      superviseur: null,
      surveillants: [],
      entrants: [],
      specialisedPersonnel: {}
    },
    testsEtMesures: {
      atmospherique: {
        oxygene: {
          niveau: 0,
          conformeCNESST: false,
          heureTest: '',
          equipementUtilise: '',
          dernierEchec: null,
          tentativeReprise: 0,
          enAttente: false,
          operateurTest: '',
          certificatEtalonnage: ''
        },
        gazToxiques: {
          detection: [],
          niveaux: {},
          seuils: {},
          conforme: false,
          dernierEchec: null,
          tentativeReprise: 0,
          enAttente: false,
          equipementUtilise: '',
          methodesDetection: []
        },
        gazCombustibles: {
          pourcentageLIE: 0,
          conformeReglement: false,
          typeGaz: '',
          equipementTest: '',
          dernierEchec: null,
          tentativeReprise: 0,
          enAttente: false,
          concentrationMaxDetectee: 0,
          heuresDerniereCalibration: 0
        },
        ventilation: {
          active: false,
          debitAir: '',
          directionFlux: '',
          efficacite: '',
          typeVentilation: 'naturelle',
          verificationDebit: false
        },
        conditionsEnvironnementales: {
          temperature: 20,
          humidite: 50,
          pression: 101.3,
          conditionsMeteo: '',
          visibilite: 'excellente'
        }
      }
    },
    equipements: {
      protection: [],
      detection: [],
      sauvetage: [],
      communication: [],
      specialises: {}
    },
    procedures: {},
    surveillance: {
      travauxTermines: false,
      heureFin: '',
      surveillanceActive: false,
      timerActif: false,
      dureeRequise: 0,
      tempsRestant: 0,
      interventionEnCours: false,
      incidents: [],
      typesSurveillance: []
    },
    validation: {
      tousTestsCompletes: false,
      documentationComplete: false,
      formationVerifiee: false,
      equipementsVerifies: false,
      conformeReglementation: false,
      signatureResponsable: '',
      dateValidation: '',
      certificationsValides: false,
      planUrgenceApprouve: false,
      numeroFormulaireFinal: '',
      commentairesValidation: { fr: '', en: '' },
      restrictions: { fr: [], en: [] }
    }
  };
};

// Fonctions Supabase simulées (à implémenter)
const savePermitToSupabase = async (permit: LegalPermit, formData: PermitFormData): Promise<void> => {
  // TODO: Implémenter avec vraie connexion Supabase
  console.log('Saving to Supabase:', permit.id);
};

const loadPermitFromSupabase = async (permitId: string): Promise<{ permit: LegalPermit; formData: PermitFormData } | null> => {
  // TODO: Implémenter avec vraie connexion Supabase
  return null;
};

const loadPermitsFromSupabase = async (tenant: string, province: ProvinceCode): Promise<LegalPermit[]> => {
  // TODO: Implémenter avec vraie connexion Supabase
  return [];
};

const extractPermitTypeFromPermit = (permit: LegalPermit): PermitType => {
  // TODO: Implémenter logique d'extraction
  return 'espace-clos';
};

const mergePermits = (local: LegalPermit[], server: LegalPermit[]): LegalPermit[] => {
  // TODO: Implémenter logique de merge intelligent
  return local;
};

const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};

// =================== EXPORTS ===================
export type { UsePermitsConfig, UsePermitsState, UsePermitsActions };
export default usePermits;
