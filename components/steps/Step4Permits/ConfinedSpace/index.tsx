// ConfinedSpace/index.tsx - VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, 
  Briefcase, Copy, Check, AlertTriangle, Camera, Upload, Download,
  Shield, Activity, Wind, Wrench, Eye, Save, Printer, Mail, Share,
  Database, QrCode, Home, ChevronRight, ArrowLeft, ArrowRight,
  Settings, Bell, Search, Filter, RefreshCw, Plus, Edit3,
  Thermometer, Volume2, Gauge, Star, Target, ChevronDown,
  Construction, Flame, Zap, BarChart3, XCircle, Play, Pause,
  RotateCcw, PenTool, Bluetooth, Battery, Signal, CheckCircle
} from 'lucide-react';

// Import des composants des sections
import SiteInformation from './SiteInformation';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import RescuePlan from './RescuePlan';
import PermitManager from './PermitManager';

// Import du gestionnaire de sécurité
import { useSafetyManager } from './SafetyManager';

// =================== DÉTECTION MOBILE ET STYLES COMPLETS ===================
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobileDevice ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobileDevice ? '8px' : '16px',
    padding: isMobileDevice ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobileDevice ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  headerCard: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobileDevice ? '12px' : '20px',
    padding: isMobileDevice ? '20px' : '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  button: {
    padding: isMobileDevice ? '8px 12px' : '14px 24px',
    borderRadius: isMobileDevice ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobileDevice ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    boxSizing: 'border-box' as const,
    width: '100%',
    justifyContent: 'center' as const
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  sectionCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobileDevice ? '12px' : '16px',
    padding: isMobileDevice ? '16px' : '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const
  }
};

// =================== TYPES ET INTERFACES COMPLETS ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  // Props de base
  language?: 'fr' | 'en';
  onDataChange: (field: string, value: any) => void;
  onSave: (data: any) => void;
  onCancel?: () => void;
  
  // Props ASTForm (ajoutées pour compatibilité complète)
  permitData?: any;
  updatePermitData?: (data: any) => void;
  selectedProvince?: ProvinceCode;
  PROVINCIAL_REGULATIONS?: any;
  atmosphericReadings?: any[];
  isMobile?: boolean;
  styles?: any;
  updateParentData?: (data: any) => void;
  
  // Props SafetyManager
  externalSafetyManager?: any;
  
  // Props supplémentaires de la version précédente
  province?: ProvinceCode;
  onSubmit?: (data: any) => void;
  initialData?: any;
  formData?: any;
  tenant?: string;
  errors?: any;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
}

interface PermitData {
  permit_number?: string;
  issue_date?: string;
  selected_province?: ProvinceCode;
  projectNumber?: string;
  workLocation?: string;
  spaceDescription?: string;
  workDescription?: string;
  entry_supervisor?: string;
  rescue_plan_type?: 'internal' | 'external' | 'hybrid';
  gas_detector_calibrated?: boolean;
  calibration_date?: string;
  supervisor_name?: string;
  permit_valid_from?: string;
  permit_valid_to?: string;
  // Données des sections
  siteData?: any;
  rescueData?: any;
  atmosphericData?: any;
  registryData?: any;
  finalizationData?: any;
}

interface NavigationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
  hasErrors: boolean;
}

interface ConfinedSpaceState {
  currentStep: string;
  completedSteps: Set<string>;
  validationErrors: Record<string, string[]>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  showManager: boolean;
  sectionProgress: Record<string, number>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

// =================== DONNÉES RÉGLEMENTAIRES PROVINCIALES COMPLÈTES ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, any> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808",
    atmospheric_testing: {
      frequency_minutes: 30,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008",
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  BC: {
    name: "Workers Compensation Act - Part 3, Division 8",
    authority: "WorkSafeBC",
    authority_phone: "1-888-621-7233",
    atmospheric_testing: {
      frequency_minutes: 10,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  AB: {
    name: "Occupational Health and Safety Code - Part 5",
    authority: "Alberta Labour",
    authority_phone: "1-866-415-8690",
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  SK: {
    name: "Saskatchewan Employment Act - Part III",
    authority: "Ministry of Labour Relations",
    authority_phone: "1-800-567-7233",
    atmospheric_testing: {
      frequency_minutes: 20,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  MB: {
    name: "Workplace Safety and Health Act",
    authority: "Manitoba Labour",
    authority_phone: "1-855-957-7233",
    atmospheric_testing: {
      frequency_minutes: 20,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  NB: {
    name: "General Regulation - Occupational Health and Safety Act",
    authority: "WorkSafeNB",
    authority_phone: "1-800-222-9775",
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  NS: {
    name: "Occupational Health and Safety Act",
    authority: "Nova Scotia Labour",
    authority_phone: "1-800-952-2687",
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  PE: {
    name: "Occupational Health and Safety Act",
    authority: "PEI Workers Compensation Board",
    authority_phone: "1-800-237-5049",
    atmospheric_testing: {
      frequency_minutes: 20,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  },
  NL: {
    name: "Occupational Health and Safety Regulations",
    authority: "Workplace NL",
    authority_phone: "1-800-563-9000",
    atmospheric_testing: {
      frequency_minutes: 20,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    }
  }
};

// =================== CONFIGURATION ÉTAPES ===================
const STEPS_CONFIG = {
  site: {
    id: 'site',
    labelFr: 'Informations du Site',
    labelEn: 'Site Information',
    icon: Building,
    component: SiteInformation
  },
  atmospheric: {
    id: 'atmospheric',
    labelFr: 'Tests Atmosphériques',
    labelEn: 'Atmospheric Testing',
    icon: Wind,
    component: AtmosphericTesting
  },
  registry: {
    id: 'registry',
    labelFr: 'Registre d\'Entrée',
    labelEn: 'Entry Registry',
    icon: Users,
    component: EntryRegistry
  },
  rescue: {
    id: 'rescue',
    labelFr: 'Plan de Sauvetage',
    labelEn: 'Rescue Plan',
    icon: Shield,
    component: RescuePlan
  },
  finalization: {
    id: 'finalization',
    labelFr: 'Finalisation',
    labelEn: 'Finalization',
    icon: CheckCircle,
    component: PermitManager
  }
};

// =================== TRADUCTIONS COMPLÈTES ===================
const getTexts = (language: 'fr' | 'en') => ({
  fr: {
    title: "Permis d'Entrée en Espace Clos",
    subtitle: "Document légal obligatoire selon les réglementations provinciales canadiennes",
    sections: {
      site: "Information du Site",
      rescue: "Plan de Sauvetage",
      atmospheric: "Tests Atmosphériques",
      registry: "Registre d'Entrée",
      finalization: "Finalisation"
    },
    navigation: {
      previous: "Précédent",
      next: "Suivant",
      save: "Enregistrer",
      cancel: "Annuler",
      submit: "Soumettre le Permis",
      finish: "Terminer",
      manager: "Gestionnaire",
      export: "Exporter",
      print: "Imprimer"
    },
    status: {
      draft: "Brouillon",
      active: "Actif",
      completed: "Complété",
      cancelled: "Annulé",
      inProgress: "En cours",
      saving: "Sauvegarde...",
      saved: "Sauvegardé",
      error: "Erreur"
    },
    validation: {
      required: "Ce champ est obligatoire",
      invalid: "Données invalides",
      incomplete: "Section incomplète"
    },
    loading: "Chargement...",
    permitNumber: "Numéro de permis",
    issueDate: "Date d'émission",
    province: "Province",
    emergencyContact: "Contact d'urgence",
    complianceNote: "Conforme aux réglementations de",
    autoSaveEnabled: "Sauvegarde automatique activée",
    progressTracker: "Progression du permis",
    moduleIntegrated: "Module intégré avec succès"
  },
  en: {
    title: "Confined Space Entry Permit",
    subtitle: "Mandatory legal document according to Canadian provincial regulations",
    sections: {
      site: "Site Information",
      rescue: "Rescue Plan",
      atmospheric: "Atmospheric Testing",
      registry: "Entry Registry", 
      finalization: "Finalization"
    },
    navigation: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      cancel: "Cancel",
      submit: "Submit Permit",
      finish: "Finish",
      manager: "Manager",
      export: "Export",
      print: "Print"
    },
    status: {
      draft: "Draft",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
      inProgress: "In Progress",
      saving: "Saving...",
      saved: "Saved",
      error: "Error"
    },
    validation: {
      required: "This field is required",
      invalid: "Invalid data",
      incomplete: "Incomplete section"
    },
    loading: "Loading...",
    permitNumber: "Permit Number",
    issueDate: "Issue Date",
    province: "Province",
    emergencyContact: "Emergency Contact",
    complianceNote: "Compliant with regulations of",
    autoSaveEnabled: "Auto-save enabled",
    progressTracker: "Permit Progress",
    moduleIntegrated: "Module integrated successfully"
  }
});

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  language = 'fr',
  onDataChange,
  onSave,
  onCancel,
  
  // Props ASTForm
  permitData: externalPermitData,
  updatePermitData: externalUpdatePermitData,
  selectedProvince: externalSelectedProvince,
  PROVINCIAL_REGULATIONS: externalRegulations,
  atmosphericReadings: externalAtmosphericReadings = [],
  isMobile = isMobileDevice,
  styles: externalStyles,
  updateParentData,
  
  // Props SafetyManager
  externalSafetyManager,
  
  // Props version précédente
  province = 'QC',
  onSubmit,
  initialData = {},
  formData,
  tenant,
  errors,
  userRole,
  touchOptimized,
  compactMode,
  onPermitChange,
  initialPermits
}) => {
  // =================== HOOKS ET ÉTAT ===================
  const safetyManager = useSafetyManager();
  const activeSafetyManager = externalSafetyManager || safetyManager;
  
  // État consolidé de tous les éléments de la version précédente
  const [state, setState] = useState<ConfinedSpaceState>({
    currentStep: 'site',
    completedSteps: new Set(),
    validationErrors: {},
    isLoading: false,
    isSaving: false,
    lastSaved: null,
    showManager: false,
    sectionProgress: {
      site: 0,
      rescue: 0,
      atmospheric: 0,
      registry: 0,
      finalization: 0
    },
    saveStatus: 'idle'
  });

  // États de la version précédente pour compatibilité complète
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry' | 'finalization'>('site');
  const [activeSelectedProvince, setActiveSelectedProvince] = useState<ProvinceCode>(externalSelectedProvince || province);
  const [permitData, setPermitData] = useState<PermitData>(() => ({
    ...initialData,
    ...(formData?.permitData || {}),
    ...(externalPermitData || {}),
    selected_province: externalSelectedProvince || province
  }));
  const [atmosphericReadings, setAtmosphericReadings] = useState<any[]>(externalAtmosphericReadings);
  const [entryRecords, setEntryRecords] = useState<any[]>([]);

  const texts = getTexts(language);
  const activeRegulations = externalRegulations || PROVINCIAL_REGULATIONS;
  const activeStyles = externalStyles || styles;

  // =================== GÉNÉRATION AUTOMATIQUE DU NUMÉRO DE PERMIS ===================
  useEffect(() => {
    if (!permitData.permit_number) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newPermitData = { 
        ...permitData,
        permit_number: `CS-${activeSelectedProvince}-${timestamp}-${random}`,
        issue_date: new Date().toISOString().slice(0, 16),
        selected_province: activeSelectedProvince
      };
      
      setPermitData(newPermitData);
      
      // Notifier les parents
      if (onDataChange) {
        onDataChange('permitData', newPermitData);
      }
      if (externalUpdatePermitData) {
        externalUpdatePermitData(newPermitData);
      }
    }
  }, [activeSelectedProvince, permitData.permit_number, onDataChange, externalUpdatePermitData]);

  // =================== FONCTIONS UTILITAIRES ===================
  const validateStep = useCallback((stepId: string): string[] => {
    const errors: string[] = [];
    const permit = activeSafetyManager.currentPermit;
    
    switch (stepId) {
      case 'site':
        const site = permit.siteInformation;
        if (!site.projectNumber?.trim()) errors.push('Numéro de projet requis');
        if (!site.workLocation?.trim()) errors.push('Lieu de travail requis');
        if (!site.contractor?.trim()) errors.push('Entrepreneur requis');
        if (!site.supervisor?.trim()) errors.push('Superviseur requis');
        if (!site.entryDate) errors.push('Date d\'entrée requise');
        if (!site.spaceType) errors.push('Type d\'espace requis');
        break;
        
      case 'atmospheric':
        const atmo = permit.atmosphericTesting;
        if (!atmo.readings?.length) errors.push('Tests atmosphériques requis');
        if (!atmo.equipment?.deviceModel) errors.push('Équipement de test requis');
        break;
        
      case 'registry':
        const registry = permit.entryRegistry;
        if (!registry.personnel?.length) errors.push('Personnel requis');
        if (!registry.maxOccupancy || registry.maxOccupancy < 1) errors.push('Occupation maximale requise');
        break;
        
      case 'rescue':
        const rescue = permit.rescuePlan;
        if (!rescue.emergencyContacts?.length) errors.push('Contacts d\'urgence requis');
        if (!rescue.evacuationProcedure?.trim()) errors.push('Procédure d\'évacuation requise');
        break;
    }
    
    return errors;
  }, [activeSafetyManager]);

  const updateValidationErrors = useCallback(() => {
    const newErrors: Record<string, string[]> = {};
    
    Object.keys(STEPS_CONFIG).forEach(stepId => {
      const stepErrors = validateStep(stepId);
      if (stepErrors.length > 0) {
        newErrors[stepId] = stepErrors;
      }
    });
    
    setState(prev => ({ ...prev, validationErrors: newErrors }));
  }, [validateStep]);

  // =================== GESTION DES DONNÉES CONSOLIDÉE ===================
  const updatePermitDataConsolidated = useCallback((updates: Partial<PermitData>) => {
    setPermitData(prev => {
      const newData = { ...prev, ...updates };
      
      // Notifier tous les parents possibles
      if (onDataChange) {
        onDataChange('permitData', newData);
      }
      if (externalUpdatePermitData) {
        externalUpdatePermitData(newData);
      }
      if (updateParentData) {
        updateParentData(newData);
      }
      
      return newData;
    });
  }, [onDataChange, externalUpdatePermitData, updateParentData]);

  const updateSectionData = useCallback((section: string, data: any) => {
    const sectionKey = `${section}Data` as keyof PermitData;
    
    updatePermitDataConsolidated({
      [sectionKey]: data
    });
    
    // Mise à jour SafetyManager
    switch (section) {
      case 'site':
        activeSafetyManager.updateSiteInformation(data);
        break;
      case 'atmospheric':
        activeSafetyManager.updateAtmosphericTesting(data);
        break;
      case 'registry':
        activeSafetyManager.updateEntryRegistry(data);
        break;
      case 'rescue':
        activeSafetyManager.updateRescuePlan(data);
        break;
    }
    
    // Calculer le progrès de la section
    const completionPercentage = data && Object.keys(data).length > 0 ? 75 : 0;
    setState(prev => ({
      ...prev,
      sectionProgress: {
        ...prev.sectionProgress,
        [section]: completionPercentage
      }
    }));
  }, [updatePermitDataConsolidated, activeSafetyManager]);

  const handleSectionDataChange = useCallback((field: string, value: any) => {
    // Mise à jour via SafetyManager selon la section
    const currentStep = state.currentStep;
    
    switch (currentStep) {
      case 'site':
        activeSafetyManager.updateSiteInformation({ [field]: value });
        break;
      case 'atmospheric':
        activeSafetyManager.updateAtmosphericTesting({ [field]: value });
        break;
      case 'registry':
        activeSafetyManager.updateEntryRegistry({ [field]: value });
        break;
      case 'rescue':
        activeSafetyManager.updateRescuePlan({ [field]: value });
        break;
    }
    
    // Callbacks externes
    onDataChange?.(field, value);
    externalUpdatePermitData?.({ [field]: value });
    updateParentData?.({ [field]: value });
    
    // Validation mise à jour
    setTimeout(() => updateValidationErrors(), 100);
  }, [state.currentStep, activeSafetyManager, onDataChange, externalUpdatePermitData, updateParentData, updateValidationErrors]);

  const savePermitData = useCallback(async (showNotification = true) => {
    if (showNotification) {
      setState(prev => ({ ...prev, isLoading: true, saveStatus: 'saving' }));
    }
    
    try {
      const dataToSave = {
        ...permitData,
        currentSection,
        selectedProvince: activeSelectedProvince,
        sectionProgress: state.sectionProgress
      };
      
      // Sauvegarder via SafetyManager
      const permitNumber = await activeSafetyManager.saveToDatabase();
      
      if (onSave) {
        await onSave(dataToSave);
      }
      
      if (onDataChange) {
        onDataChange('confinedSpacePermit', dataToSave);
      }
      
      if (showNotification) {
        setState(prev => ({ 
          ...prev, 
          saveStatus: 'saved',
          lastSaved: new Date().toISOString()
        }));
        setTimeout(() => setState(prev => ({ ...prev, saveStatus: 'idle' })), 3000);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      if (showNotification) {
        setState(prev => ({ ...prev, saveStatus: 'error' }));
        setTimeout(() => setState(prev => ({ ...prev, saveStatus: 'idle' })), 3000);
      }
    } finally {
      if (showNotification) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [permitData, currentSection, activeSelectedProvince, state.sectionProgress, activeSafetyManager, onSave, onDataChange]);

  // =================== NAVIGATION ===================
  const navigationSteps: NavigationStep[] = useMemo(() => {
    return Object.values(STEPS_CONFIG).map(step => ({
      id: step.id,
      label: language === 'fr' ? step.labelFr : step.labelEn,
      icon: React.createElement(step.icon, { size: 20 }),
      isComplete: state.completedSteps.has(step.id) && !state.validationErrors[step.id]?.length,
      isActive: state.currentStep === step.id,
      hasErrors: (state.validationErrors[step.id]?.length || 0) > 0
    }));
  }, [language, state.currentStep, state.completedSteps, state.validationErrors]);

  const navigateToSection = useCallback((section: 'site' | 'rescue' | 'atmospheric' | 'registry' | 'finalization') => {
    // Sauvegarder automatiquement lors du changement de section (sans notification)
    savePermitData(false);
    setCurrentSection(section);
    setState(prev => ({ ...prev, currentStep: section }));
  }, [savePermitData]);

  const handleStepChange = useCallback((stepId: string) => {
    // Valider l'étape actuelle avant de changer
    const currentErrors = validateStep(state.currentStep);
    
    if (currentErrors.length === 0) {
      setState(prev => ({
        ...prev,
        currentStep: stepId,
        completedSteps: new Set([...prev.completedSteps, prev.currentStep])
      }));
      setCurrentSection(stepId as any);
    }
    
    updateValidationErrors();
  }, [state.currentStep, validateStep, updateValidationErrors]);

  const canNavigateNext = useMemo(() => {
    const currentIndex = Object.keys(STEPS_CONFIG).indexOf(state.currentStep);
    return currentIndex < Object.keys(STEPS_CONFIG).length - 1;
  }, [state.currentStep]);

  const canNavigatePrevious = useMemo(() => {
    const currentIndex = Object.keys(STEPS_CONFIG).indexOf(state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep]);

  const handleNext = useCallback(() => {
    if (canNavigateNext) {
      const steps = Object.keys(STEPS_CONFIG);
      const currentIndex = steps.indexOf(state.currentStep);
      const nextStep = steps[currentIndex + 1];
      handleStepChange(nextStep);
    }
  }, [canNavigateNext, state.currentStep, handleStepChange]);

  const handlePrevious = useCallback(() => {
    if (canNavigatePrevious) {
      const steps = Object.keys(STEPS_CONFIG);
      const currentIndex = steps.indexOf(state.currentStep);
      const prevStep = steps[currentIndex - 1];
      handleStepChange(prevStep);
    }
  }, [canNavigatePrevious, state.currentStep, handleStepChange]);

  // =================== UTILITAIRES POUR COMPATIBILITÉ ===================
  const getSectionIcon = (section: string) => {
    const iconMap = {
      site: Building,
      rescue: Shield,
      atmospheric: Gauge,
      registry: Users,
      finalization: CheckCircle
    };
    return iconMap[section as keyof typeof iconMap] || FileText;
  };

  const calculateOverallProgress = () => {
    const sections = Object.values(state.sectionProgress);
    const totalProgress = sections.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / sections.length);
  };

  // =================== EFFETS ===================
  useEffect(() => {
    updateValidationErrors();
  }, [updateValidationErrors]);

  // Synchronisation avec currentSection et state.currentStep
  useEffect(() => {
    if (currentSection !== state.currentStep) {
      setState(prev => ({ ...prev, currentStep: currentSection }));
    }
  }, [currentSection, state.currentStep]);

  // =================== RENDU CONDITIONNEL DES SECTIONS ===================
  const renderSectionContent = () => {
    try {
      const commonProps = {
        language,
        onDataChange: handleSectionDataChange,
        onSave: (data: any) => updateSectionData(state.currentStep, data),
        onCancel: onCancel || (() => {}),
        
        // Props ASTForm pour compatibilité
        permitData: permitData || activeSafetyManager.currentPermit,
        updatePermitData: updatePermitDataConsolidated,
        selectedProvince: activeSelectedProvince,
        PROVINCIAL_REGULATIONS: activeRegulations,
        atmosphericReadings: atmosphericReadings.length > 0 ? atmosphericReadings : activeSafetyManager.currentPermit.atmosphericTesting?.readings || [],
        isMobile,
        styles: activeStyles,
        updateParentData: updateParentData || handleSectionDataChange,
        
        // Props SafetyManager
        safetyManager: activeSafetyManager,
        externalSafetyManager: activeSafetyManager,
        
        // Props supplémentaires de la version précédente
        setAtmosphericReadings,
        formData,
        tenant,
        errors,
        userRole,
        touchOptimized,
        compactMode
      };

      switch (state.currentStep) {
        case 'site':
          return <SiteInformation {...commonProps} />;
          
        case 'atmospheric':
          return <AtmosphericTesting {...commonProps} />;
          
        case 'registry':
          return <EntryRegistry {...commonProps} />;
          
        case 'rescue':
          return <RescuePlan {...commonProps} />;
          
        case 'finalization':
          return (
            <PermitManager
              {...commonProps}
              onSubmit={(finalData: any) => {
                if (onSubmit) {
                  onSubmit(finalData);
                }
              }}
            />
          );
          
        default:
          return <SiteInformation {...commonProps} />;
      }
    } catch (error) {
      console.error('Erreur rendu section:', error);
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          border: '2px dashed #dc2626',
          borderRadius: '12px',
          backgroundColor: 'rgba(220, 38, 38, 0.1)'
        }}>
          <AlertTriangle style={{ width: '64px', height: '64px', color: '#ef4444', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Erreur de chargement</h3>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
            Impossible de charger le module {state.currentStep}
          </p>
          <button
            onClick={() => navigateToSection('site')}
            style={{
              ...activeStyles.button,
              ...activeStyles.buttonSecondary,
              width: 'auto',
              padding: '8px 16px'
            }}
          >
            Retourner au début
          </button>
        </div>
      );
    }
  };

  // =================== LOADING FALLBACK ===================
  const LoadingFallback = () => (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      color: '#9ca3af'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(59, 130, 246, 0.3)',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p>{texts.loading}</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // =================== RENDU PRINCIPAL ===================
  if (state.showManager) {
    return (
      <PermitManager
        language={language}
        onDataChange={onDataChange}
        onSave={onSave}
        onCancel={() => setState(prev => ({ ...prev, showManager: false }))}
        permitData={permitData || activeSafetyManager.currentPermit}
        updatePermitData={updatePermitDataConsolidated}
        selectedProvince={activeSelectedProvince}
        PROVINCIAL_REGULATIONS={activeRegulations}
        isMobile={isMobile}
        safetyManager={activeSafetyManager}
        externalSafetyManager={activeSafetyManager}
      />
    );
  }

  return (
    <div style={activeStyles.container}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '20px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* En-tête principal avec informations de statut - Style version précédente */}
        <div style={activeStyles.headerCard}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '24px' : '0',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: isMobile ? '28px' : '36px',
                  fontWeight: '900',
                  color: 'white',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  lineHeight: 1.2
                }}>
                  <div style={{
                    width: isMobile ? '48px' : '60px',
                    height: isMobile ? '48px' : '60px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
                  }}>
                    <Shield style={{ 
                      width: isMobile ? '28px' : '36px', 
                      height: isMobile ? '28px' : '36px', 
                      color: 'white' 
                    }} />
                  </div>
                  {texts.title}
                </h1>
                <p style={{
                  color: '#d1d5db',
                  fontSize: isMobile ? '16px' : '18px',
                  margin: 0,
                  maxWidth: '700px',
                  lineHeight: 1.5
                }}>
                  {texts.subtitle}
                </p>
                
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#86efac'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                    {texts.complianceNote} {activeRegulations[activeSelectedProvince].authority}
                  </div>
                  
                  {state.saveStatus === 'saved' && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#93c5fd'
                    }}>
                      <Save style={{ width: '16px', height: '16px' }} />
                      {texts.status.saved}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#c4b5fd'
                  }}>
                    <Activity style={{ width: '16px', height: '16px' }} />
                    {texts.moduleIntegrated} ({calculateOverallProgress()}%)
                  </div>
                </div>
              </div>
              
              {/* Actions rapides */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {state.lastSaved && (
                  <div style={{
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#9ca3af'
                  }}>
                    <Check style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Sauvegardé {new Date(state.lastSaved).toLocaleTimeString()}
                  </div>
                )}
                
                <button
                  onClick={() => setState(prev => ({ ...prev, showManager: true }))}
                  style={{
                    ...activeStyles.button,
                    ...activeStyles.buttonSecondary,
                    width: 'auto',
                    padding: isMobile ? '10px 16px' : '12px 20px'
                  }}
                >
                  <Database style={{ width: '16px', height: '16px' }} />
                  {!isMobile && texts.navigation.manager}
                </button>
                
                <button
                  onClick={() => savePermitData(true)}
                  disabled={state.isLoading}
                  style={{
                    ...activeStyles.button,
                    ...activeStyles.buttonSuccess,
                    width: 'auto',
                    padding: isMobile ? '10px 16px' : '12px 20px',
                    opacity: state.isLoading ? 0.7 : 1
                  }}
                >
                  {state.isLoading ? (
                    <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Save style={{ width: '16px', height: '16px' }} />
                  )}
                  {!isMobile && texts.navigation.save}
                </button>
              </div>
            </div>
            
            {/* Informations du permis */}
            {permitData.permit_number && (
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.permitNumber}
                    </span>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', fontFamily: 'monospace' }}>
                      {permitData.permit_number}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.province}
                    </span>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
                      {activeRegulations[activeSelectedProvince].authority} ({activeSelectedProvince})
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.issueDate}
                    </span>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
                      {permitData.issue_date ? new Date(permitData.issue_date).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.emergencyContact}
                    </span>
                    <span style={{ color: '#60a5fa', fontWeight: '700', fontSize: '16px' }}>
                      {activeRegulations[activeSelectedProvince].authority_phone}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation des sections avec indicateurs de progrès - Style version précédente */}
        <div style={activeStyles.sectionCard}>
          <h3 style={{
            color: 'white',
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            {texts.progressTracker} ({calculateOverallProgress()}%)
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: isMobile ? '12px' : '16px',
            marginBottom: '20px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const).map((section, index) => {
              const Icon = getSectionIcon(section);
              const isActive = state.currentStep === section;
              const progress = state.sectionProgress[section];
              
              return (
                <button
                  key={section}
                  onClick={() => navigateToSection(section)}
                  style={{
                    padding: isMobile ? '20px 16px' : '24px 20px',
                    backgroundColor: isActive ? '#3b82f6' : 'rgba(75, 85, 99, 0.3)',
                    border: `2px solid ${isActive ? '#60a5fa' : '#6b7280'}`,
                    borderRadius: '16px',
                    color: isActive ? 'white' : '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isActive ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Icon style={{ 
                    width: isMobile ? '28px' : '32px', 
                    height: isMobile ? '28px' : '32px'
                  }} />
                  <span style={{ textAlign: 'center', lineHeight: 1.3 }}>
                    {texts.sections[section]}
                  </span>
                  
                  {/* Barre de progression */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: isActive ? '#ffffff' : '#10b981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de la section active avec Suspense */}
        <div style={activeStyles.sectionCard}>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <Suspense fallback={<LoadingFallback />}>
              {renderSectionContent()}
            </Suspense>
          </div>
        </div>

        {/* Navigation bas de page avec sauvegarde automatique - Style version précédente */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '16px' : '20px',
          backgroundColor: '#1f2937',
          borderRadius: '16px',
          border: '2px solid #374151'
        }}>
          <button
            onClick={handlePrevious}
            disabled={!canNavigatePrevious}
            style={{
              ...activeStyles.button,
              ...activeStyles.buttonSecondary,
              opacity: !canNavigatePrevious ? 0.5 : 1,
              cursor: !canNavigatePrevious ? 'not-allowed' : 'pointer',
              width: 'auto',
              padding: '12px 20px'
            }}
          >
            <ChevronRight style={{ width: '18px', height: '18px', transform: 'rotate(180deg)' }} />
            {texts.navigation.previous}
          </button>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Indicateur de sauvegarde */}
            {state.saveStatus === 'saving' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fbbf24',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #fbbf24',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {texts.status.saving}
              </div>
            )}
            
            <button
              onClick={() => savePermitData(true)}
              disabled={state.isLoading}
              style={{
                ...activeStyles.button,
                ...activeStyles.buttonSuccess,
                width: 'auto',
                padding: '12px 16px',
                opacity: state.isLoading ? 0.7 : 1
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {texts.navigation.save}
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  ...activeStyles.button,
                  ...activeStyles.buttonSecondary,
                  width: 'auto',
                  padding: '12px 16px'
                }}
              >
                <XCircle style={{ width: '16px', height: '16px' }} />
                {texts.navigation.cancel}
              </button>
            )}
            
            {canNavigateNext ? (
              <button
                onClick={handleNext}
                style={{
                  ...activeStyles.button,
                  ...activeStyles.buttonPrimary,
                  width: 'auto',
                  padding: '12px 20px'
                }}
              >
                {texts.navigation.next}
                <ChevronRight style={{ width: '18px', height: '18px' }} />
              </button>
            ) : (
              <button
                onClick={() => savePermitData(true)}
                disabled={state.isLoading}
                style={{
                  ...activeStyles.button,
                  ...activeStyles.buttonSuccess,
                  width: 'auto',
                  padding: '12px 20px',
                  opacity: state.isLoading ? 0.7 : 1
                }}
              >
                {state.isLoading ? (
                  <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Check style={{ width: '16px', height: '16px' }} />
                )}
                {texts.navigation.finish}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
