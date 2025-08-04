// ConfinedSpace/index.tsx - PARTIE 1/2 - VERSION FINALE COMPLÈTE Build Ready
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
  readOnly?: boolean;
  customValidators?: any[];
  onValidationChange?: (validation: any) => void;
  theme?: 'dark' | 'light';
}

// ✅ CORRECTION BUILD CRITIQUE : Interface PermitData compatible avec ConfinedSpacePermit
interface PermitData {
  // ✅ Propriétés OBLIGATOIRES pour ConfinedSpacePermit (pas undefined)
  permit_number: string; // ✅ CORRECTION: string au lieu de string | undefined
  province: ProvinceCode; // ✅ CORRECTION: ProvinceCode au lieu de ProvinceCode | undefined
  updated_at: string; // ✅ CORRECTION: string au lieu de string | undefined
  status: 'completed' | 'active' | 'draft' | 'cancelled'; // ✅ CORRECTION: union type strict
  created_at: string; // ✅ CORRECTION: string au lieu de string | undefined
  issue_date: string; // ✅ CORRECTION: string au lieu de string | undefined
  
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
// ConfinedSpace/index.tsx - PARTIE 2/2 - Composant Principal et Logique Complète

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
  enableAutoSave = true,
  readOnly = false,
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
  
  const texts = getTexts(language);
  const actualIsMobile = externalIsMobile !== undefined ? externalIsMobile : getIsMobile();
  const actualStyles = externalStyles || styles;
  const actualRegulations = externalRegulations || legacyRegulations || PROVINCIAL_REGULATIONS;

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

  // =================== AUTO-SAVE INTELLIGENT ===================
  useEffect(() => {
    if (enableAutoSave && !readOnly) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        savePermitData(false, true);
      }, 30000); // Auto-save toutes les 30 secondes
      
      setAutoSaveTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [permitData, enableAutoSave, readOnly]);

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

  const savePermitData = async (showNotification = true, isAutoSave = false) => {
    if (readOnly) return;
    
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
      
      if (onSave) {
        await onSave(dataToSave);
      }
      
      setLastSaveTime(new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA'));
      
      if (showNotification) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), isAutoSave ? 1000 : 3000);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
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

  const handleSectionDataChange = useCallback((field: string, value: any) => {
    updatePermitData({ [field]: value });
  }, [updatePermitData]);

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
        unitSystem: permitData.siteInformation?.unitSystem || 'metric',
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

    const commonProps: ConfinedSpaceComponentProps = {
      language,
      permitData: compatiblePermitData,
      selectedProvince,
      regulations: actualRegulations,
      isMobile: actualIsMobile,
      safetyManager: isSafetyManagerEnabled ? safetyManager : undefined
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

  // =================== GESTION FULLSCREEN MANAGER ===================
  if (showManager) {
    return (
      <PermitManager
        language={language}
        permitData={compatiblePermitData}
        selectedProvince={selectedProvince}
        regulations={actualRegulations}
        isMobile={actualIsMobile}
        safetyManager={isSafetyManagerEnabled ? safetyManager : undefined}
      />
    );
  }

  // =================== CALCUL PROGRESSION ===================
  const completedSections = Object.values(sectionValidation).filter(Boolean).length;
  const totalSections = 5;
  const progressPercentage = Math.round((completedSections / totalSections) * 100);

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{
      ...actualStyles.container,
      minHeight: isFullScreen ? '100vh' : 'auto',
      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: actualIsMobile ? '20px' : '24px',
        maxWidth: expandedView ? '1600px' : '1200px',
        margin: '0 auto'
      }}>
        
        {/* En-tête principal */}
        <div style={{
          ...actualStyles.card,
          background: theme === 'dark' ? 
            'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))' :
            'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme === 'dark' ?
              'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)' :
              'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(16, 185, 129, 0.05) 100%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: actualIsMobile ? 'column' : 'row',
              gap: actualIsMobile ? '24px' : '0',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: actualIsMobile ? '28px' : '36px',
                  fontWeight: '900',
                  color: theme === 'dark' ? 'white' : '#111827',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  lineHeight: 1.2
                }}>
                  <div style={{
                    width: actualIsMobile ? '48px' : '60px',
                    height: actualIsMobile ? '48px' : '60px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
                  }}>
                    <Shield style={{ 
                      width: actualIsMobile ? '28px' : '36px', 
                      height: actualIsMobile ? '28px' : '36px', 
                      color: 'white' 
                    }} />
                  </div>
                  {texts.title}
                </h1>
                <p style={{
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                  fontSize: actualIsMobile ? '16px' : '18px',
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
                    {texts.complianceNote} {actualRegulations[selectedProvince].authority}
                  </div>
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: `rgba(${isSafetyManagerEnabled ? '59, 130, 246' : '156, 163, 175'}, 0.2)`,
                    border: `1px solid rgba(${isSafetyManagerEnabled ? '59, 130, 246' : '156, 163, 175'}, 0.3)`,
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: isSafetyManagerEnabled ? '#93c5fd' : '#9ca3af'
                  }}>
                    <Activity style={{ width: '16px', height: '16px' }} />
                    {isSafetyManagerEnabled ? texts.safetyManager : texts.basicMode}
                  </div>
                  
                  {showAdvancedFeatures && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#c4b5fd'
                    }}>
                      <Star style={{ width: '16px', height: '16px' }} />
                      {texts.advancedFeatures}
                    </div>
                  )}
                  
                  {saveStatus === 'saved' && (
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
                      <Save style={{ width: '16px', height: '16px' }} />
                      {texts.status.saved}
                    </div>
                  )}
                  
                  {saveStatus === 'autoSaving' && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#fcd34d'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid #fcd34d',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {texts.status.autoSaving}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions rapides */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexDirection: actualIsMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setExpandedView(!expandedView)}
                  style={{
                    ...actualStyles.button,
                    background: 'rgba(75, 85, 99, 0.3)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    width: 'auto',
                    padding: actualIsMobile ? '10px 16px' : '12px 20px'
                  }}
                >
                  <Eye style={{ width: '16px', height: '16px' }} />
                  {!actualIsMobile && (expandedView ? texts.compactView : texts.expandedView)}
                </button>
                
                <button
                  onClick={() => setShowManager(true)}
                  style={{
                    ...actualStyles.button,
                    background: 'rgba(75, 85, 99, 0.3)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: theme === 'dark' ? '#d1d5db' : '#374151',
                    width: 'auto',
                    padding: actualIsMobile ? '10px 16px' : '12px 20px'
                  }}
                >
                  <Wrench style={{ width: '16px', height: '16px' }} />
                  {!actualIsMobile && texts.navigation.manager}
                </button>
                
                <button
                  onClick={() => savePermitData(true)}
                  disabled={isLoading || readOnly}
                  style={{
                    ...actualStyles.button,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'white',
                    width: 'auto',
                    padding: actualIsMobile ? '10px 16px' : '12px 20px',
                    opacity: (isLoading || readOnly) ? 0.7 : 1
                  }}
                >
                  {isLoading ? (
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Save style={{ width: '16px', height: '16px' }} />
                  )}
                  {!actualIsMobile && texts.navigation.save}
                </button>
              </div>
            </div>
            
            {/* Informations du permis */}
            {permitData.permit_number && (
              <div style={{
                padding: '20px',
                backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                borderRadius: '16px',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: actualIsMobile ? '1fr' : expandedView ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', 
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.permitNumber}
                    </span>
                    <span style={{ color: theme === 'dark' ? 'white' : '#111827', fontWeight: '700', fontSize: '16px', fontFamily: 'monospace' }}>
                      {permitData.permit_number}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.province}
                    </span>
                    <span style={{ color: theme === 'dark' ? 'white' : '#111827', fontWeight: '700', fontSize: '16px' }}>
                      {actualRegulations[selectedProvince].authority} ({selectedProvince})
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.issueDate}
                    </span>
                    <span style={{ color: theme === 'dark' ? 'white' : '#111827', fontWeight: '700', fontSize: '16px' }}>
                      {permitData.issue_date ? new Date(permitData.issue_date).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                      {texts.validation.processing}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        color: validationData?.isValid ? '#10b981' : '#f59e0b', 
                        fontWeight: '700', 
                        fontSize: '16px' 
                      }}>
                        {validationData ? `${validationData.percentage}%` : `${progressPercentage}%`}
                      </span>
                      {getValidationIcon(validationData?.isValid || progressPercentage === 100)}
                    </div>
                  </div>
                  {expandedView && (
                    <div>
                      <span style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                        {texts.lastSaved}
                      </span>
                      <span style={{ color: theme === 'dark' ? 'white' : '#111827', fontWeight: '700', fontSize: '16px' }}>
                        {lastSaveTime || texts.status.draft}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation des sections avec progression */}
        <div style={{
          ...actualStyles.card,
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: theme === 'dark' ? 'white' : '#111827',
              fontSize: actualIsMobile ? '18px' : '20px',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Target style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
              {texts.progressTracker}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '100px',
                height: '8px',
                backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  backgroundColor: progressPercentage === 100 ? '#10b981' : '#3b82f6',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: progressPercentage === 100 ? '#10b981' : '#3b82f6'
              }}>
                {progressPercentage}%
              </span>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: actualIsMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: actualIsMobile ? '12px' : '16px',
            marginBottom: '20px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const).map((section, index) => {
              const Icon = getSectionIcon(section);
              const isActive = currentSection === section;
              const isValid = sectionValidation[section] || false;
              
              return (
                <button
                  key={section}
                  onClick={() => navigateToSection(section)}
                  disabled={readOnly}
                  style={{
                    padding: actualIsMobile ? '20px 16px' : '24px 20px',
                    backgroundColor: isActive ? '#3b82f6' : 
                      theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(249, 250, 251, 0.6)',
                    border: `2px solid ${isActive ? '#60a5fa' : 
                      isValid ? '#10b981' : 
                      theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
                    borderRadius: '16px',
                    color: isActive ? 'white' : 
                      theme === 'dark' ? '#9ca3af' : '#6b7280',
                    cursor: readOnly ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: actualIsMobile ? '14px' : '15px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isActive ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: readOnly ? 0.6 : 1
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Icon style={{ 
                      width: actualIsMobile ? '28px' : '32px', 
                      height: actualIsMobile ? '28px' : '32px'
                    }} />
                    {isValid && !isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle style={{ width: '10px', height: '10px', color: 'white' }} />
                      </div>
                    )}
                  </div>
                  <span style={{ textAlign: 'center', lineHeight: 1.3 }}>
                    {texts.sections[section]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de la section active */}
        <div style={{
          ...actualStyles.card,
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          minHeight: '600px'
        }}>
          <div style={{ padding: actualIsMobile ? '20px' : '28px' }}>
            {renderSectionContent()}
          </div>
        </div>

        {/* Navigation bas de page */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: actualIsMobile ? '16px' : '20px',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderRadius: '16px',
          border: `2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => {
              const sections = ['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const;
              const currentIndex = sections.indexOf(currentSection);
              if (currentIndex > 0) {
                navigateToSection(sections[currentIndex - 1]);
              }
            }}
            disabled={currentSection === 'site' || readOnly}
            style={{
              ...actualStyles.button,
              background: 'rgba(75, 85, 99, 0.3)',
              border: '1px solid rgba(156, 163, 175, 0.3)',
              color: theme === 'dark' ? '#d1d5db' : '#374151',
              opacity: (currentSection === 'site' || readOnly) ? 0.5 : 1,
              cursor: (currentSection === 'site' || readOnly) ? 'not-allowed' : 'pointer',
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
            {saveStatus === 'saving' && (
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
              disabled={isLoading || readOnly}
              style={{
                ...actualStyles.button,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'white',
                width: 'auto',
                padding: '12px 16px',
                opacity: (isLoading || readOnly) ? 0.7 : 1
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {texts.navigation.save}
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  ...actualStyles.button,
                  background: 'rgba(75, 85, 99, 0.3)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  color: theme === 'dark' ? '#d1d5db' : '#374151',
                  width: 'auto',
                  padding: '12px 16px'
                }}
              >
                <XCircle style={{ width: '16px', height: '16px' }} />
                {texts.navigation.cancel}
              </button>
            )}
            
            <button
              onClick={() => {
                const sections = ['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const;
                const currentIndex = sections.indexOf(currentSection);
                if (currentIndex < sections.length - 1) {
                  navigateToSection(sections[currentIndex + 1]);
                } else if (onSubmit) {
                  onSubmit(permitData);
                }
              }}
              disabled={readOnly}
              style={{
                ...actualStyles.button,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'white',
                opacity: readOnly ? 0.5 : 1,
                cursor: readOnly ? 'not-allowed' : 'pointer',
                width: 'auto',
                padding: '12px 20px'
              }}
            >
              {currentSection === 'finalization' ? texts.navigation.finish : texts.navigation.next}
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConfinedSpace;
