// ConfinedSpace/index.tsx - PARTIE 1/2 - Fix Saisie et Timer Build Ready
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// Import des composants des sections - ARCHITECTURE UNIFIÉE
import SiteInformation from './SiteInformation';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import RescuePlan from './RescuePlan';
import PermitManager from './PermitManager';

// Import SafetyManager et styles - INTÉGRATION COMPLÈTE
import { ConfinedSpaceComponentProps, useSafetyManager, ConfinedSpacePermit } from './SafetyManager';
import { styles } from './styles';

// =================== TYPES ET INTERFACES UNIVERSELLES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  // Props de base - COMPATIBILITÉ UNIVERSELLE
  language?: 'fr' | 'en';
  onDataChange?: (field: string, value: any) => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  
  // Props ASTForm (optionnelles)
  permitData?: any;
  updatePermitData?: (data: any) => void;
  selectedProvince?: ProvinceCode;
  PROVINCIAL_REGULATIONS?: any;
  atmosphericReadings?: any[];
  isMobile?: boolean;
  styles?: any;
  updateParentData?: (data: any) => void;
  
  // Props version précédente (compatibilité)
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
  
  // Props étendues (flexibilité maximale)
  regulations?: any;
  showAdvancedFeatures?: boolean;
  enableAutoSave?: boolean;
  readOnly?: boolean; // ✅ FIX: Explicitement typé
  customValidators?: any[];
  onValidationChange?: (validation: any) => void;
  theme?: 'dark' | 'light';
}

// ✅ CORRECTION BUILD CRITIQUE : Interface PermitData compatible avec ConfinedSpacePermit
interface PermitData {
  // ✅ Propriétés OBLIGATOIRES pour ConfinedSpacePermit (pas undefined)
  permit_number: string;
  province: ProvinceCode;
  updated_at: string;
  status: 'completed' | 'active' | 'draft' | 'cancelled';
  created_at: string;
  issue_date: string;
  
  // ✅ Structures de données OBLIGATOIRES pour ConfinedSpacePermit
  siteInformation: {
    projectNumber?: string;
    workLocation?: string;
    spaceDescription?: string;
    workDescription?: string;
    contractor?: string;
    supervisor?: string;
    entry_supervisor?: string;
    permit_valid_from?: string;
    permit_valid_to?: string;
    spaceType?: string;
    csaClass?: string;
    dimensions?: any;
    hazards?: any[];
    atmosphericHazards?: any[];
    physicalHazards?: any[];
    spacePhotos?: any[];
    unitSystem?: string;
  };
  
  atmosphericTesting: {
    readings?: any[];
    equipment?: any;
    continuousMonitoring?: boolean;
    lastUpdated?: string;
    testingFrequency?: number;
  };
  
  rescuePlan: {
    emergencyContacts?: any[];
    rescueTeam?: any[];
    evacuationProcedure?: string;
    rescueEquipment?: any[];
    hospitalInfo?: any;
    communicationPlan?: string;
    lastUpdated?: string;
    responseTime?: number;
    rescue_plan_type?: 'internal' | 'external' | 'hybrid';
  };
  
  entryRegistry: {
    personnel?: any[];
    entryLog?: any[];
    activeEntrants?: any[];
    maxOccupancy?: number;
    communicationProtocol?: any;
    lastUpdated?: string;
    supervisor?: any;
  };
  
  compliance: Record<string, boolean>;
  
  validation: {
    isValid?: boolean;
    percentage?: number;
    completedSections?: string[];
    errors?: string[];
    warnings?: string[];
    lastValidated?: string;
  };
  
  auditTrail: Array<any>;
  attachments: Array<any>;
  
  // Propriétés optionnelles supplémentaires
  id?: string;
  last_modified?: string;
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
}

// =================== DÉTECTION MOBILE OPTIMISÉE ===================
const getIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// =================== DONNÉES RÉGLEMENTAIRES COMPLÈTES ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, any> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808",
    code: "RSST",
    atmosphere_testing_frequency: 30,
    continuous_monitoring_required: true,
    rescue_response_time_max: 5,
    max_entrants: 3,
    communication_check_interval: 15,
    permit_validity_hours: 12,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -10, max: 50 },
      humidity: { max: 95 }
    }
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008",
    code: "O. Reg. 632/05",
    atmosphere_testing_frequency: 15,
    continuous_monitoring_required: true,
    rescue_response_time_max: 4,
    max_entrants: 2,
    communication_check_interval: 10,
    permit_validity_hours: 8,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -15, max: 45 },
      humidity: { max: 90 }
    }
  },
  BC: {
    name: "Workers Compensation Act - Part 3, Division 8",
    authority: "WorkSafeBC",
    authority_phone: "1-888-621-7233",
    code: "WCA Part 3 Div 8",
    atmosphere_testing_frequency: 10,
    continuous_monitoring_required: true,
    rescue_response_time_max: 3,
    max_entrants: 2,
    communication_check_interval: 5,
    permit_validity_hours: 6,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -20, max: 40 },
      humidity: { max: 85 }
    }
  },
  AB: {
    name: "Occupational Health and Safety Code - Part 5",
    authority: "Alberta Labour",
    authority_phone: "1-866-415-8690",
    code: "OHS Code Part 5",
    atmosphere_testing_frequency: 15,
    continuous_monitoring_required: true,
    rescue_response_time_max: 5,
    max_entrants: 3,
    communication_check_interval: 15,
    permit_validity_hours: 12,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -25, max: 45 },
      humidity: { max: 90 }
    }
  },
  SK: {
    name: "Saskatchewan Employment Act - Part III",
    authority: "Ministry of Labour Relations",
    authority_phone: "1-800-567-7233",
    code: "SEA Part III",
    atmosphere_testing_frequency: 20,
    continuous_monitoring_required: true,
    rescue_response_time_max: 6,
    max_entrants: 2,
    communication_check_interval: 20,
    permit_validity_hours: 10,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -30, max: 40 },
      humidity: { max: 85 }
    }
  },
  MB: {
    name: "Workplace Safety and Health Act",
    authority: "Manitoba Labour",
    authority_phone: "1-855-957-7233",
    code: "WSHA",
    atmosphere_testing_frequency: 20,
    continuous_monitoring_required: true,
    rescue_response_time_max: 5,
    max_entrants: 2,
    communication_check_interval: 15,
    permit_validity_hours: 8,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -25, max: 35 },
      humidity: { max: 90 }
    }
  },
  NB: {
    name: "General Regulation - Occupational Health and Safety Act",
    authority: "WorkSafeNB",
    authority_phone: "1-800-222-9775",
    code: "Gen. Reg. OHSA",
    atmosphere_testing_frequency: 15,
    continuous_monitoring_required: true,
    rescue_response_time_max: 4,
    max_entrants: 2,
    communication_check_interval: 10,
    permit_validity_hours: 8,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -20, max: 35 },
      humidity: { max: 95 }
    }
  },
  NS: {
    name: "Occupational Health and Safety Act",
    authority: "Nova Scotia Labour",
    authority_phone: "1-800-952-2687",
    code: "OHSA",
    atmosphere_testing_frequency: 15,
    continuous_monitoring_required: true,
    rescue_response_time_max: 4,
    max_entrants: 2,
    communication_check_interval: 10,
    permit_validity_hours: 8,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -15, max: 30 },
      humidity: { max: 95 }
    }
  },
  PE: {
    name: "Occupational Health and Safety Act",
    authority: "PEI Workers Compensation Board",
    authority_phone: "1-800-237-5049",
    code: "OHSA",
    atmosphere_testing_frequency: 20,
    continuous_monitoring_required: true,
    rescue_response_time_max: 6,
    max_entrants: 1,
    communication_check_interval: 15,
    permit_validity_hours: 6,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -10, max: 30 },
      humidity: { max: 95 }
    }
  },
  NL: {
    name: "Occupational Health and Safety Regulations",
    authority: "Workplace NL",
    authority_phone: "1-800-563-9000",
    code: "OHS Regulations",
    atmosphere_testing_frequency: 20,
    continuous_monitoring_required: true,
    rescue_response_time_max: 6,
    max_entrants: 2,
    communication_check_interval: 20,
    permit_validity_hours: 10,
    requirements: {
      entry_supervisor: true,
      attendant: true,
      rescue_plan: true,
      atmospheric_testing: true,
      communication_system: true,
      personal_protective_equipment: true,
      emergency_contacts: true,
      equipment_inspection: true
    },
    limits: {
      oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 15 },
      co: { max: 35, critical: 100 },
      temperature: { min: -20, max: 25 },
      humidity: { max: 95 }
    }
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
      manager: "Gestionnaire",
      finish: "Terminer"
    },
    status: {
      draft: "Brouillon",
      inProgress: "En cours",
      completed: "Complété",
      saving: "Sauvegarde...",
      saved: "Sauvegardé",
      error: "Erreur",
      autoSaving: "Sauvegarde auto...",
      validating: "Validation...",
      valid: "Valide",
      invalid: "Invalide"
    },
    validation: {
      required: "Ce champ est obligatoire",
      incomplete: "Section incomplète",
      complete: "Section complète",
      processing: "Validation en cours..."
    },
    loading: "Chargement...",
    permitNumber: "Numéro de permis",
    issueDate: "Date d'émission",
    province: "Province",
    emergencyContact: "Contact d'urgence",
    complianceNote: "Conforme aux réglementations de",
    autoSaveEnabled: "Sauvegarde automatique activée",
    progressTracker: "Progression du permis",
    safetyManager: "SafetyManager Intégré",
    realTimeValidation: "Validation en temps réel",
    advancedFeatures: "Fonctionnalités avancées",
    basicMode: "Mode basique",
    fullScreen: "Plein écran",
    compactView: "Vue compacte",
    expandedView: "Vue étendue",
    lastSaved: "Dernière sauvegarde",
    lastModified: "Dernière modification",
    validity: "Validité",
    expires: "Expire le",
    active: "Actif",
    inactive: "Inactif",
    expired: "Expiré"
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
      manager: "Manager",
      finish: "Finish"
    },
    status: {
      draft: "Draft",
      inProgress: "In Progress",
      completed: "Completed",
      saving: "Saving...",
      saved: "Saved",
      error: "Error",
      autoSaving: "Auto-saving...",
      validating: "Validating...",
      valid: "Valid",
      invalid: "Invalid"
    },
    validation: {
      required: "This field is required",
      incomplete: "Section incomplete",
      complete: "Section complete",
      processing: "Validation in progress..."
    },
    loading: "Loading...",
    permitNumber: "Permit Number",
    issueDate: "Issue Date",
    province: "Province",
    emergencyContact: "Emergency Contact",
    complianceNote: "Compliant with regulations of",
    autoSaveEnabled: "Auto-save enabled",
    progressTracker: "Permit Progress",
    safetyManager: "SafetyManager Integrated",
    realTimeValidation: "Real-time Validation",
    advancedFeatures: "Advanced Features",
    basicMode: "Basic Mode",
    fullScreen: "Full Screen",
    compactView: "Compact View",
    expandedView: "Expanded View",
    lastSaved: "Last Saved",
    lastModified: "Last Modified",
    validity: "Validity",
    expires: "Expires",
    active: "Active",
    inactive: "Inactive",
    expired: "Expired"
  }
})[language];

// ✅ FONCTION UTILITAIRE pour créer un PermitData valide compatible ConfinedSpacePermit
const createDefaultPermitData = (selectedProvince: ProvinceCode): PermitData => {
  const now = new Date().toISOString();
  const timestamp = now.slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return {
    // ✅ Propriétés OBLIGATOIRES non-undefined
    permit_number: `CS-${selectedProvince}-${timestamp}-${random}`,
    province: selectedProvince,
    updated_at: now,
    status: 'draft',
    created_at: now,
    issue_date: now.slice(0, 16),
    
    // ✅ Structures OBLIGATOIRES avec objets initialisés
    siteInformation: {},
    atmosphericTesting: { readings: [] },
    rescuePlan: { emergencyContacts: [] },
    entryRegistry: { personnel: [], entryLog: [], activeEntrants: [] },
    compliance: {},
    validation: { isValid: false, percentage: 0, completedSections: [], errors: [], warnings: [] },
    auditTrail: [],
    attachments: [],
    
    // Propriétés optionnelles pour compatibilité
    last_modified: now,
    selected_province: selectedProvince
  };
};
// ConfinedSpace/index.tsx - PARTIE 2/2 - Fix Build TypeScript Complet

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  // Props de base
  language = 'fr',
  onDataChange,
  onSave,
  onCancel,
  
  // Props ASTForm (optionnelles)
  permitData: externalPermitData,
  updatePermitData: externalUpdatePermitData,
  selectedProvince: externalSelectedProvince,
  PROVINCIAL_REGULATIONS: externalRegulations,
  atmosphericReadings: externalAtmosphericReadings = [],
  isMobile: externalIsMobile,
  styles: externalStyles,
  updateParentData,
  
  // Props version précédente (optionnelles)
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
  initialPermits,
  
  // Props étendues
  regulations: legacyRegulations,
  showAdvancedFeatures = true,
  enableAutoSave = false, // ✅ FIX: Désactivé par défaut pour éviter les problèmes
  readOnly = false, // ✅ FIX: Explicitement false par défaut
  customValidators = [],
  onValidationChange,
  theme = 'dark'
}) => {

  // =================== INTÉGRATION SAFETYMANAGER ===================
  const [isSafetyManagerEnabled, setIsSafetyManagerEnabled] = useState(false);
  const [safetyManager, setSafetyManager] = useState<any>(null);
  
  useEffect(() => {
    try {
      const manager = useSafetyManager();
      setSafetyManager(manager);
      setIsSafetyManagerEnabled(true);
    } catch (error) {
      console.log('SafetyManager non disponible, mode basique activé');
      setIsSafetyManagerEnabled(false);
    }
  }, []);

  // =================== ÉTATS LOCAUX ===================
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry' | 'finalization'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(externalSelectedProvince || province);
  
  // ✅ CORRECTION BUILD CRITIQUE : Initialisation avec createDefaultPermitData pour garantir la compatibilité
  const [permitData, setPermitData] = useState<PermitData>(() => {
    // Fusionner les données externes avec les valeurs par défaut
    const defaultData = createDefaultPermitData(externalSelectedProvince || province);
    
    return {
      ...defaultData,
      ...initialData,
      ...(formData?.permitData || {}),
      ...(externalPermitData || {}),
      // ✅ Assurer que les propriétés critiques sont toujours définies
      permit_number: externalPermitData?.permit_number || initialData?.permit_number || defaultData.permit_number,
      province: externalSelectedProvince || province || defaultData.province,
      status: (externalPermitData?.status || initialData?.status || defaultData.status) as 'completed' | 'active' | 'draft' | 'cancelled',
      created_at: externalPermitData?.created_at || initialData?.created_at || defaultData.created_at,
      updated_at: externalPermitData?.updated_at || initialData?.updated_at || defaultData.updated_at,
      issue_date: externalPermitData?.issue_date || initialData?.issue_date || defaultData.issue_date,
      last_modified: new Date().toISOString()
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'autoSaving'>('idle');
  const [showManager, setShowManager] = useState(false);
  const [atmosphericReadings, setAtmosphericReadings] = useState<any[]>(externalAtmosphericReadings);
  const [validationData, setValidationData] = useState<any>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [sectionValidation, setSectionValidation] = useState<Record<string, boolean>>({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedView, setExpandedView] = useState(!compactMode);
  
  // ✅ FIX CRITIQUE: État pour forcer la non-lecture seule
  const [forceEditable, setForceEditable] = useState(true);
  
  const texts = getTexts(language);
  const actualIsMobile = externalIsMobile !== undefined ? externalIsMobile : getIsMobile();
  const actualStyles = externalStyles || styles;
  const actualRegulations = externalRegulations || legacyRegulations || PROVINCIAL_REGULATIONS;

  // ✅ FIX CRITIQUE: Calculer readOnly final en tenant compte de forceEditable
  const isActuallyReadOnly = readOnly && !forceEditable;

  // =================== SYNCHRONISATION SAFETYMANAGER ===================
  useEffect(() => {
    if (isSafetyManagerEnabled && safetyManager && permitData.permit_number) {
      try {
        const validation = safetyManager.validatePermitCompleteness();
        setValidationData(validation);
        
        if (onValidationChange) {
          onValidationChange(validation);
        }
        
        const currentPermit = safetyManager.currentPermit;
        if (currentPermit?.atmosphericTesting?.readings) {
          setAtmosphericReadings(currentPermit.atmosphericTesting.readings);
        }
      } catch (error) {
        console.log('Erreur SafetyManager:', error);
      }
    }
  }, [permitData, currentSection, isSafetyManagerEnabled, safetyManager, onValidationChange]);

  // ✅ FIX CRITIQUE: AUTO-SAVE SÉCURISÉ POUR ÉVITER LES REDIRECTIONS
  useEffect(() => {
    // ⚠️ Auto-save désactivé si readOnly OU enableAutoSave false OU showManager actif
    if (!enableAutoSave || isActuallyReadOnly || showManager) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        setAutoSaveTimer(null);
      }
      return;
    }
    
    // ✅ Nettoyage du timer précédent
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // ✅ Nouveau timer sécurisé avec vérifications supplémentaires
    const timer = setTimeout(() => {
      // ✅ Double vérification avant auto-save
      if (!isActuallyReadOnly && !showManager && permitData.permit_number) {
        console.log('🔄 Auto-save sécurisé déclenché');
        savePermitData(false, true); // Auto-save silencieux
      }
    }, 60000); // ✅ FIX: Augmenté à 60 secondes pour réduire la fréquence
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [permitData, enableAutoSave, isActuallyReadOnly, showManager, permitData.permit_number]); // ✅ Dépendances optimisées

  // =================== VALIDATION EN TEMPS RÉEL ===================
  useEffect(() => {
    const validateCurrentSection = () => {
      let isValid = false;
      
      switch (currentSection) {
        case 'site':
          isValid = Boolean(
            permitData.projectNumber && 
            permitData.workLocation && 
            permitData.entry_supervisor
          );
          break;
        case 'rescue':
          isValid = Boolean(permitData.rescue_plan_type);
          break;
        case 'atmospheric':
          isValid = atmosphericReadings.length > 0;
          break;
        case 'registry':
          isValid = Boolean(permitData.supervisor_name);
          break;
        case 'finalization':
          isValid = Boolean(
            permitData.projectNumber && 
            permitData.workLocation && 
            permitData.rescue_plan_type &&
            atmosphericReadings.length > 0
          );
          break;
      }
      
      setSectionValidation(prev => ({
        ...prev,
        [currentSection]: isValid
      }));
    };
    
    validateCurrentSection();
  }, [permitData, currentSection, atmosphericReadings]);

  // =================== FONCTIONS UTILITAIRES ===================
  const updatePermitData = useCallback((updates: Partial<PermitData>) => {
    console.log('📝 updatePermitData appelé avec:', updates);
    
    const newData = { 
      ...permitData, 
      ...updates, 
      last_modified: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPermitData(newData);
    
    // Synchronisation SafetyManager
    if (isSafetyManagerEnabled && safetyManager) {
      try {
        switch (currentSection) {
          case 'site':
            const siteData = {
              projectNumber: updates.projectNumber || permitData.projectNumber || '',
              workLocation: updates.workLocation || permitData.workLocation || '',
              spaceDescription: updates.spaceDescription || permitData.spaceDescription || '',
              workDescription: updates.workDescription || permitData.workDescription || '',
              entry_supervisor: updates.entry_supervisor || permitData.entry_supervisor || '',
              contractor: updates.supervisor_name || permitData.supervisor_name || '',
              permit_number: newData.permit_number || '',
              issue_date: newData.issue_date || '',
              selected_province: selectedProvince
            };
            safetyManager.updateSiteInformation(siteData);
            break;
            
          case 'atmospheric':
            const atmosphericData = {
              readings: atmosphericReadings || [],
              equipment: {
                deviceModel: updates.gas_detector_calibrated ? 'Détecteur 4-gaz' : '',
                calibrationDate: updates.calibration_date || '',
                serialNumber: `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                nextCalibration: updates.calibration_date ? 
                  new Date(new Date(updates.calibration_date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : ''
              },
              continuousMonitoring: actualRegulations[selectedProvince]?.continuous_monitoring_required || true,
              lastUpdated: new Date().toISOString(),
              testingFrequency: actualRegulations[selectedProvince]?.atmosphere_testing_frequency || 30
            };
            safetyManager.updateAtmosphericTesting(atmosphericData);
            break;
            
          case 'registry':
            const registryData = {
              personnel: [],
              entryLog: [],
              activeEntrants: [],
              maxOccupancy: actualRegulations[selectedProvince]?.max_entrants || 2,
              communicationProtocol: {
                type: 'radio' as const,
                frequency: '462.725 MHz',
                checkInterval: actualRegulations[selectedProvince]?.communication_check_interval || 15
              },
              lastUpdated: new Date().toISOString(),
              supervisor: {
                name: updates.supervisor_name || permitData.supervisor_name || '',
                certification: 'Superviseur d\'espace clos',
                contact: actualRegulations[selectedProvince]?.authority_phone || ''
              }
            };
            safetyManager.updateEntryRegistry(registryData);
            break;
            
          case 'rescue':
            const rescueData = {
              emergencyContacts: [
                {
                  name: actualRegulations[selectedProvince]?.authority || 'Services d\'urgence',
                  phone: actualRegulations[selectedProvince]?.authority_phone || '911',
                  role: 'Autorité provinciale'
                }
              ],
              rescueTeam: [],
              evacuationProcedure: updates.rescue_plan_type || permitData.rescue_plan_type || 'external',
              rescueEquipment: [],
              hospitalInfo: {
                name: 'Hôpital le plus proche',
                address: 'À déterminer selon le lieu de travail',
                phone: '911',
                distance: 0
              },
              communicationPlan: `Plan de communication selon ${actualRegulations[selectedProvince]?.name}`,
              lastUpdated: new Date().toISOString(),
              responseTime: actualRegulations[selectedProvince]?.rescue_response_time_max || 5
            };
            safetyManager.updateRescuePlan(rescueData);
            break;
        }
      } catch (error) {
        console.log('Erreur mise à jour SafetyManager:', error);
      }
    }
    
    // Callbacks externes
    if (onDataChange) {
      onDataChange('permitData', newData);
    }
    if (externalUpdatePermitData) {
      externalUpdatePermitData(newData);
    }
    if (updateParentData) {
      updateParentData(newData);
    }
  }, [permitData, isSafetyManagerEnabled, safetyManager, currentSection, selectedProvince, actualRegulations, atmosphericReadings, onDataChange, externalUpdatePermitData, updateParentData]);

  // ✅ FIX BUILD: Fonction wrapper pour compatibilité updatePermitData
  const handleSectionDataChange = useCallback((field: string, value: any) => {
    console.log(`📊 handleSectionDataChange: ${field} =`, value);
    updatePermitData({ [field]: value });
  }, [updatePermitData]);

  // ✅ FIX BUILD: Fonction wrapper compatible avec le type attendu (data: any) => void
  const handleUpdatePermitData = useCallback((data: any) => {
    console.log(`📋 handleUpdatePermitData:`, data);
    updatePermitData(data);
  }, [updatePermitData]);

  // ✅ FIX CRITIQUE: Fonction savePermitData sécurisée pour éviter les redirections
  const savePermitData = async (showNotification = true, isAutoSave = false) => {
    if (isActuallyReadOnly) {
      console.log('🚫 Sauvegarde bloquée: mode lecture seule');
      return;
    }
    
    console.log(`💾 savePermitData: showNotification=${showNotification}, isAutoSave=${isAutoSave}`);
    
    if (showNotification) {
      setIsLoading(true);
      setSaveStatus(isAutoSave ? 'autoSaving' : 'saving');
    }
    
    try {
      let dataToSave = {
        ...permitData,
        currentSection,
        selectedProvince,
        last_modified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        atmosphericReadings,
        sectionValidation,
        validationData
      };
      
      // ✅ SafetyManager sécurisé sans redirection
      if (isSafetyManagerEnabled && safetyManager) {
        try {
          const permitNumber = await safetyManager.saveToDatabase();
          if (permitNumber) {
            dataToSave = { ...dataToSave, permit_number: permitNumber };
          }
        } catch (error) {
          console.log('Erreur sauvegarde SafetyManager:', error);
        }
      }
      
      // ✅ Callback onSave sécurisé
      if (onSave) {
        await onSave(dataToSave);
      }
      
      setLastSaveTime(new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA'));
      
      if (showNotification) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), isAutoSave ? 1000 : 3000);
      }
      
      console.log('✅ Sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      if (showNotification) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } finally {
      if (showNotification) {
        setIsLoading(false);
      }
    }
  };

  const navigateToSection = (section: 'site' | 'rescue' | 'atmospheric' | 'registry' | 'finalization') => {
    console.log(`🧭 Navigation vers: ${section}`);
    setCurrentSection(section);
  };

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

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? 
      <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} /> : 
      <XCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
  };

  // =================== RENDU DES SECTIONS ===================
  const renderSectionContent = () => {
    // ✅ CORRECTION BUILD CRITIQUE : Cast compatible ConfinedSpacePermit avec propriétés garanties
    const compatiblePermitData: ConfinedSpacePermit = {
      // ✅ Propriétés requises ConfinedSpacePermit avec garanties non-undefined
      permit_number: permitData.permit_number,
      province: permitData.province,
      updated_at: permitData.updated_at,
      status: permitData.status,
      created_at: permitData.created_at,
      issue_date: permitData.issue_date,
      
      // ✅ Structures de données avec fallbacks garantis
      siteInformation: {
        projectNumber: permitData.siteInformation?.projectNumber || permitData.projectNumber || '',
        workLocation: permitData.siteInformation?.workLocation || permitData.workLocation || '',
        contractor: permitData.siteInformation?.contractor || permitData.supervisor_name || '',
        supervisor: permitData.siteInformation?.supervisor || permitData.entry_supervisor || '',
        entryDate: permitData.siteInformation?.permit_valid_from || permitData.permit_valid_from || '',
        duration: permitData.siteInformation?.permit_valid_to || permitData.permit_valid_to || '',
        workerCount: 1,
        workDescription: permitData.siteInformation?.workDescription || permitData.workDescription || '',
        spaceType: permitData.siteInformation?.spaceType || '',
        csaClass: permitData.siteInformation?.csaClass || '',
        entryMethod: '',
        accessType: '',
        spaceLocation: '',
        spaceDescription: permitData.siteInformation?.spaceDescription || permitData.spaceDescription || '',
        dimensions: permitData.siteInformation?.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          diameter: 0,
          volume: 0,
          spaceShape: 'rectangular'
        },
        unitSystem: (permitData.siteInformation?.unitSystem || 'metric') as 'metric' | 'imperial',
        entryPoints: [],
        atmosphericHazards: permitData.siteInformation?.atmosphericHazards || [],
        physicalHazards: permitData.siteInformation?.physicalHazards || [],
        environmentalConditions: {
          ventilationRequired: false,
          ventilationType: '',
          lightingConditions: '',
          temperatureRange: '',
          moistureLevel: '',
          noiseLevel: '',
          weatherConditions: ''
        },
        spaceContent: {
          contents: '',
          residues: '',
          previousUse: '',
          lastEntry: '',
          cleaningStatus: ''
        },
        safetyMeasures: {
          emergencyEgress: '',
          communicationMethod: '',
          monitoringEquipment: [],
          ventilationEquipment: [],
          emergencyEquipment: []
        },
        spacePhotos: permitData.siteInformation?.spacePhotos || []
      },
      
      atmosphericTesting: {
        equipment: permitData.atmosphericTesting?.equipment || {
          deviceModel: '',
          serialNumber: '',
          calibrationDate: permitData.calibration_date || '',
          nextCalibration: ''
        },
        readings: permitData.atmosphericTesting?.readings || atmosphericReadings || [],
        continuousMonitoring: permitData.atmosphericTesting?.continuousMonitoring || false,
        alarmSettings: {
          oxygen: { min: 19.5, max: 23.5 },
          combustibleGas: { max: 10 },
          hydrogenSulfide: { max: 10 },
          carbonMonoxide: { max: 35 }
        },
        testingFrequency: permitData.atmosphericTesting?.testingFrequency || 30,
        lastUpdated: permitData.atmosphericTesting?.lastUpdated || new Date().toISOString()
      },
      
      entryRegistry: {
        personnel: permitData.entryRegistry?.personnel || [],
        entryLog: permitData.entryRegistry?.entryLog || [],
        entryLogs: permitData.entryRegistry?.entryLog || [],
        activeEntrants: permitData.entryRegistry?.activeEntrants || [],
        maxOccupancy: permitData.entryRegistry?.maxOccupancy || 1,
        communicationProtocol: permitData.entryRegistry?.communicationProtocol || {
          type: 'radio',
          frequency: '',
          checkInterval: 15
        },
        lastUpdated: permitData.entryRegistry?.lastUpdated || new Date().toISOString(),
        equipment: [],
        compliance: permitData.compliance || {},
        supervisor: permitData.entryRegistry?.supervisor || {
          name: permitData.supervisor_name || '',
          certification: '',
          contact: ''
        },
        attendantPresent: false,
        entryAuthorized: false,
        emergencyProcedures: false,
        communicationEstablished: false,
        communicationSystemActive: false,
        rescueTeamNotified: false,
        atmosphericTestingCurrent: false,
        equipmentInspected: false,
        safetyBriefingCompleted: false,
        permitReviewed: false,
        hazardsIdentified: false,
        controlMeasuresImplemented: false,
        emergencyEquipmentAvailable: false,
        emergencyContactsNotified: false,
        currentOccupancy: 0
      },
      
      rescuePlan: {
        emergencyContacts: permitData.rescuePlan?.emergencyContacts || [],
        rescueTeam: permitData.rescuePlan?.rescueTeam || [],
        evacuationProcedure: permitData.rescuePlan?.evacuationProcedure || '',
        rescueEquipment: permitData.rescuePlan?.rescueEquipment || [],
        hospitalInfo: permitData.rescuePlan?.hospitalInfo || {
          name: '',
          address: '',
          phone: '',
          distance: 0
        },
        communicationPlan: permitData.rescuePlan?.communicationPlan || '',
        lastUpdated: permitData.rescuePlan?.lastUpdated || new Date().toISOString(),
        responseTime: permitData.rescuePlan?.responseTime || 5
      },
      
      compliance: permitData.compliance || {},
      
      validation: {
        isComplete: permitData.validation?.isValid || false,
        isValid: permitData.validation?.isValid || false,
        percentage: permitData.validation?.percentage || 0,
        completedSections: permitData.validation?.completedSections || [],
        errors: permitData.validation?.errors || [],
        warnings: permitData.validation?.warnings || [],
        lastValidated: permitData.validation?.lastValidated || new Date().toISOString()
      },
      
      auditTrail: permitData.auditTrail || [],
      attachments: permitData.attachments || [],
      
      // Propriétés optionnelles préservées
      id: permitData.id,
      last_modified: permitData.last_modified || permitData.updated_at,
      
      // Propriétés pour compatibilité EntryRegistry
      attendant_present: false,
      communication_system_tested: false,
      emergency_retrieval_ready: false
    };

    // ✅ FIX BUILD CRITIQUE: Props communes avec types compatibles
    const commonProps: ConfinedSpaceComponentProps = {
      language,
      permitData: compatiblePermitData,
      selectedProvince,
      regulations: actualRegulations,
      isMobile: actualIsMobile,
      safetyManager: isSafetyManagerEnabled ? safetyManager : undefined,
      readOnly: false, // ✅ FIX: Toujours false pour permettre la saisie dans les composants enfants
      // ✅ FIX BUILD: Utiliser la fonction wrapper compatible avec le type (data: any) => void
      updatePermitData: handleUpdatePermitData,
      // ✅ Callback alternatif pour les composants qui attendent (field: string, value: any) => void
      onDataChange: handleSectionDataChange
    };

    switch (currentSection) {
      case 'site':
        return <SiteInformation {...commonProps} />;
        
      case 'atmospheric':
        return (
          <AtmosphericTesting 
            {...commonProps}
            atmosphericReadings={atmosphericReadings}
            setAtmosphericReadings={setAtmosphericReadings}
            updateParentData={handleSectionDataChange}
          />
        );
        
      case 'registry':
        return (
          <EntryRegistry 
            {...commonProps}
            atmosphericReadings={atmosphericReadings}
            updateParentData={handleSectionDataChange}
          />
        );
        
      case 'rescue':
        return <RescuePlan {...commonProps} />;
        
      case 'finalization':
        return <PermitManager {...commonProps} />;
        
      default:
        return renderFallbackContent();
    }
  };

  const renderFallbackContent = () => {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        border: '2px dashed #ef4444',
        borderRadius: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            ⚠️
          </div>
          
          <h3 style={{ 
            color: '#ef4444', 
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {texts.status.error}
          </h3>
          
          <p style={{ 
            color: '#fca5a5', 
            lineHeight: 1.6,
            marginBottom: '32px',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto 32px auto'
          }}>
            {language === 'fr' 
              ? 'Cette section devrait afficher le composant réel. Vérifiez que tous les composants sont correctement importés.'
              : 'This section should display the real component. Check that all components are properly imported.'
            }
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              ...actualStyles.button,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              width: 'auto',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {language === 'fr' ? 'Recharger la Page' : 'Reload Page'}
          </button>
        </div>
      </div>
    );
  };
