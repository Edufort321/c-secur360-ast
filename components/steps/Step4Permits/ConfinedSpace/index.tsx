// ConfinedSpace/index.tsx - VERSION PROGRESSIVE AVEC INTÉGRATION SAFETYMANAGER
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// Import des composants des sections (progressif)
import SiteInformation from './SiteInformation';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import RescuePlan from './RescuePlan';
import PermitManager from './PermitManager';

// Import SafetyManager - INTÉGRATION PROGRESSIVE
import { useSafetyManager } from './SafetyManager';

// =================== DÉTECTION MOBILE ET STYLES COMPLETS ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  headerCard: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '12px' : '20px',
    padding: isMobile ? '20px' : '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  button: {
    padding: isMobile ? '8px 12px' : '14px 24px',
    borderRadius: isMobile ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
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
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
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
  // Props de base - MÊME SIGNATURE QUE VERSION FONCTIONNELLE
  language?: 'fr' | 'en';
  onDataChange: (field: string, value: any) => void;
  onSave: (data: any) => void;
  onCancel?: () => void;
  
  // Props ASTForm (optionnelles pour compatibilité)
  permitData?: any;
  updatePermitData?: (data: any) => void;
  selectedProvince?: ProvinceCode;
  PROVINCIAL_REGULATIONS?: any;
  atmosphericReadings?: any[];
  isMobile?: boolean;
  styles?: any;
  updateParentData?: (data: any) => void;
  
  // Props SafetyManager (optionnelles)
  externalSafetyManager?: any;
  
  // Props version précédente (optionnelles)
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
}

// =================== DONNÉES RÉGLEMENTAIRES PROVINCIALES ===================
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
      manager: "Gestionnaire"
    },
    status: {
      draft: "Brouillon",
      inProgress: "En cours",
      completed: "Complété",
      saving: "Sauvegarde...",
      saved: "Sauvegardé",
      error: "Erreur"
    },
    validation: {
      required: "Ce champ est obligatoire"
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
    realTimeValidation: "Validation en temps réel"
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
      manager: "Manager"
    },
    status: {
      draft: "Draft",
      inProgress: "In Progress",
      completed: "Completed",
      saving: "Saving...",
      saved: "Saved",
      error: "Error"
    },
    validation: {
      required: "This field is required"
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
    realTimeValidation: "Real-time Validation"
  }
})[language];

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  // Props de base - signature compatible
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
  
  // Props SafetyManager (optionnelles)
  externalSafetyManager,
  
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
  initialPermits
}) => {

  // =================== INTÉGRATION PROGRESSIVE SAFETYMANAGER ===================
  
  // 🔧 ÉTAPE 1 : Intégration SafetyManager (optionnelle et sécurisée)
  let safetyManager = null;
  let isSafetyManagerEnabled = false;
  
  try {
    // Essayer d'utiliser SafetyManager s'il est disponible
    safetyManager = useSafetyManager();
    isSafetyManagerEnabled = true;
  } catch (error) {
    // Si SafetyManager n'est pas disponible, continuer sans lui
    console.log('SafetyManager non disponible, mode basique activé');
    isSafetyManagerEnabled = false;
  }

  // =================== ÉTATS LOCAUX - BASÉS SUR VERSION FONCTIONNELLE ===================
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry' | 'finalization'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(externalSelectedProvince || province);
  const [permitData, setPermitData] = useState<PermitData>({
    ...initialData,
    ...(formData?.permitData || {}),
    ...(externalPermitData || {})
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showManager, setShowManager] = useState(false);
  
  // États SafetyManager (si disponible)
  const [atmosphericReadings, setAtmosphericReadings] = useState<any[]>(externalAtmosphericReadings);
  const [validationData, setValidationData] = useState<any>(null);
  
  const texts = getTexts(language);
  const actualIsMobile = externalIsMobile !== undefined ? externalIsMobile : isMobile;
  const actualStyles = externalStyles || styles;
  const actualRegulations = externalRegulations || PROVINCIAL_REGULATIONS;

  // =================== GÉNÉRATION NUMÉRO DE PERMIS - MÊME LOGIQUE ===================
  useEffect(() => {
    if (!permitData.permit_number) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newPermitData = { 
        ...permitData,
        permit_number: `CS-${selectedProvince}-${timestamp}-${random}`,
        issue_date: new Date().toISOString().slice(0, 16),
        selected_province: selectedProvince
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
  }, [selectedProvince, permitData.permit_number, onDataChange, externalUpdatePermitData]);

  // =================== INTÉGRATION PROGRESSIVE DES DONNÉES SAFETYMANAGER ===================
  
  // 🔧 ÉTAPE 2 : Synchronisation avec SafetyManager (si disponible)
  useEffect(() => {
    if (isSafetyManagerEnabled && safetyManager && permitData.permit_number) {
      try {
        // Validation temps réel avec SafetyManager
        const validation = safetyManager.validatePermitCompleteness();
        setValidationData(validation);
        
        // Mise à jour des lectures atmosphériques depuis SafetyManager
        const currentPermit = safetyManager.currentPermit;
        if (currentPermit?.atmosphericTesting?.readings) {
          setAtmosphericReadings(currentPermit.atmosphericTesting.readings);
        }
      } catch (error) {
        console.log('Erreur SafetyManager:', error);
      }
    }
  }, [permitData, currentSection, isSafetyManagerEnabled, safetyManager]);

  // =================== FONCTIONS UTILITAIRES AMÉLIORÉES ===================
  const updatePermitData = (updates: Partial<PermitData>) => {
    const newData = { ...permitData, ...updates };
    setPermitData(newData);
    
    // 🔧 ÉTAPE 3 : Mise à jour SafetyManager (si disponible)
    if (isSafetyManagerEnabled && safetyManager) {
      try {
        // Synchroniser avec SafetyManager selon la section avec conversion de types
        switch (currentSection) {
          case 'site':
            // Convertir PermitData vers SiteInformationData
            const siteData = {
              projectNumber: updates.projectNumber || '',
              workLocation: updates.workLocation || '',
              spaceDescription: updates.spaceDescription || '',
              workDescription: updates.workDescription || '',
              entry_supervisor: updates.entry_supervisor || '',
              // Ajouter d'autres champs si nécessaires
            };
            safetyManager.updateSiteInformation(siteData);
            break;
          case 'atmospheric':
            // Convertir vers AtmosphericTestingData
            const atmosphericData = {
              readings: atmosphericReadings || [],
              equipment: {
                deviceModel: updates.gas_detector_calibrated ? 'Détecteur 4-gaz' : '',
                calibrationDate: updates.calibration_date || '',
                serialNumber: '',
                nextCalibration: ''
              },
              continuousMonitoring: true,
              lastUpdated: new Date().toISOString()
            };
            safetyManager.updateAtmosphericTesting(atmosphericData);
            break;
          case 'registry':
            // Convertir vers EntryRegistryData
            const registryData = {
              personnel: [],
              entryLog: [],
              activeEntrants: [],
              maxOccupancy: 1,
              communicationProtocol: {
                type: 'radio' as const,
                frequency: '',
                checkInterval: 15
              },
              lastUpdated: new Date().toISOString()
            };
            safetyManager.updateEntryRegistry(registryData);
            break;
          case 'rescue':
            // Convertir vers RescuePlanData
            const rescueData = {
              emergencyContacts: [],
              rescueTeam: [],
              evacuationProcedure: updates.rescue_plan_type || '',
              rescueEquipment: [],
              hospitalInfo: {
                name: '',
                address: '',
                phone: '',
                distance: 0
              },
              communicationPlan: '',
              lastUpdated: new Date().toISOString()
            };
            safetyManager.updateRescuePlan(rescueData);
            break;
        }
      } catch (error) {
        console.log('Erreur mise à jour SafetyManager:', error);
      }
    }
    
    // Notifier les parents
    if (onDataChange) {
      onDataChange('permitData', newData);
    }
    if (externalUpdatePermitData) {
      externalUpdatePermitData(newData);
    }
  };

  const savePermitData = async (showNotification = true) => {
    if (showNotification) {
      setIsLoading(true);
      setSaveStatus('saving');
    }
    
    try {
      let dataToSave = {
        ...permitData,
        currentSection,
        selectedProvince
      };
      
      // 🔧 ÉTAPE 4 : Sauvegarde via SafetyManager (si disponible)
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
      
      if (showNotification) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
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

  // =================== FONCTIONS POUR GESTION DES COMPOSANTS ===================
  
  const handleSectionDataChange = useCallback((field: string, value: any) => {
    updatePermitData({ [field]: value });
    
    // Callbacks externes
    if (updateParentData) {
      updateParentData({ [field]: value });
    }
  }, [updateParentData]);

  // =================== RENDU DES SECTIONS AVEC INTÉGRATION PROGRESSIVE ===================
  const renderSectionContent = () => {
    // Props de base communes
    const commonProps = {
      language,
      onDataChange: handleSectionDataChange,
      onSave: (data: any) => updatePermitData(data),
      onCancel: onCancel || (() => {}),
      permitData,
      updatePermitData,
      selectedProvince,
      PROVINCIAL_REGULATIONS: actualRegulations,
      atmosphericReadings,
      isMobile: actualIsMobile,
      styles: actualStyles
    };

    // Adaptateur updateParentData pour compatibilité
    const updateParentDataAdapter = (data: any) => {
      if (updateParentData) {
        updateParentData(data);
      }
    };

    switch (currentSection) {
      case 'site':
        return (
          <SiteInformation 
            language={commonProps.language}
            onSave={commonProps.onSave}
            onCancel={commonProps.onCancel}
          />
        );
        
      case 'atmospheric':
        return (
          <AtmosphericTesting 
            language={commonProps.language}
            onDataChange={commonProps.onDataChange}
            onSave={commonProps.onSave}
            onCancel={commonProps.onCancel}
            permitData={commonProps.permitData}
            updatePermitData={commonProps.updatePermitData}
            selectedProvince={commonProps.selectedProvince}
            PROVINCIAL_REGULATIONS={commonProps.PROVINCIAL_REGULATIONS}
            atmosphericReadings={commonProps.atmosphericReadings}
            isMobile={commonProps.isMobile}
            styles={commonProps.styles}
            setAtmosphericReadings={setAtmosphericReadings}
            updateParentData={updateParentDataAdapter}
          />
        );
        
      case 'registry':
        return (
          <EntryRegistry 
            language={commonProps.language}
            onDataChange={commonProps.onDataChange}
            onSave={commonProps.onSave}
          />
        );
        
      case 'rescue':
        return (
          <RescuePlan 
            language={commonProps.language}
            onDataChange={commonProps.onDataChange}
            onSave={commonProps.onSave}
          />
        );
        
      case 'finalization':
        return (
          <PermitManager
            language={language}
            onDataChange={handleSectionDataChange}
            onSave={onSave}
            onCancel={onCancel || (() => {})}
            onSubmit={(finalData: any) => {
              if (onSubmit) {
                onSubmit(finalData);
              }
            }}
            // Props PermitManager spécifiques
            formData={formData}
            selectedProvince={selectedProvince}
            PROVINCIAL_REGULATIONS={actualRegulations}
            isMobile={actualIsMobile}
            permitData={permitData}
            safetyManager={isSafetyManagerEnabled ? safetyManager : undefined}
            tenant={tenant}
            errors={errors}
            userRole={userRole}
            touchOptimized={touchOptimized}
            compactMode={compactMode}
            onPermitChange={onPermitChange}
            initialPermits={initialPermits}
          />
        );
        
      default:
        return renderTestContent();
    }
  };

  // =================== CONTENU DE TEST POUR DÉVELOPPEMENT ===================
  const renderTestContent = () => {
    const sectionData = {
      site: {
        emoji: '🏢',
        title: texts.sections.site,
        description: language === 'fr' 
          ? 'Configuration des informations du site de travail, description de l\'espace clos et détails du projet.'
          : 'Configure work site information, confined space description and project details.',
        features: language === 'fr' 
          ? ['Localisation GPS', 'Description détaillée', 'Responsable d\'entrée', 'Photos du site']
          : ['GPS Location', 'Detailed Description', 'Entry Supervisor', 'Site Photos']
      },
      rescue: {
        emoji: '🛡️',
        title: texts.sections.rescue,
        description: language === 'fr' 
          ? 'Plan de sauvetage d\'urgence avec contacts, équipements et procédures de secours.'
          : 'Emergency rescue plan with contacts, equipment and rescue procedures.',
        features: language === 'fr' 
          ? ['Plan d\'évacuation', 'Équipe de secours', 'Équipements d\'urgence', 'Contacts d\'urgence']
          : ['Evacuation Plan', 'Rescue Team', 'Emergency Equipment', 'Emergency Contacts']
      },
      atmospheric: {
        emoji: '🌬️',
        title: texts.sections.atmospheric,
        description: language === 'fr' 
          ? 'Tests atmosphériques continus avec surveillance en temps réel des gaz dangereux.'
          : 'Continuous atmospheric testing with real-time monitoring of hazardous gases.',
        features: language === 'fr' 
          ? ['Tests 4-gaz', 'Surveillance Bluetooth', 'Alarmes automatiques', 'Calibration équipements']
          : ['4-Gas Testing', 'Bluetooth Monitoring', 'Automatic Alarms', 'Equipment Calibration']
      },
      registry: {
        emoji: '👥',
        title: texts.sections.registry,
        description: language === 'fr' 
          ? 'Registre d\'entrée et de sortie avec horodatage et signatures électroniques.'
          : 'Entry and exit registry with timestamps and electronic signatures.',
        features: language === 'fr' 
          ? ['Horodatage précis', 'Signatures électroniques', 'Durée d\'exposition', 'Validation finale']
          : ['Precise Timestamps', 'Electronic Signatures', 'Exposure Duration', 'Final Validation']
      },
      finalization: {
        emoji: '✅',
        title: texts.sections.finalization,
        description: language === 'fr' 
          ? 'Finalisation du permis avec validation, impression, génération QR et partage.'
          : 'Permit finalization with validation, printing, QR generation and sharing.',
        features: language === 'fr' 
          ? ['Validation complète', 'Impression PDF', 'Code QR mobile', 'Partage sécurisé']
          : ['Complete Validation', 'PDF Printing', 'Mobile QR Code', 'Secure Sharing']
      }
    };

    const current = sectionData[currentSection];

    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        border: `2px dashed ${isSafetyManagerEnabled ? '#10b981' : '#374151'}`,
        borderRadius: '12px',
        backgroundColor: `rgba(${isSafetyManagerEnabled ? '16, 185, 129' : '17, 24, 39'}, 0.1)`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            {current.emoji}
          </div>
          
          <h3 style={{ 
            color: 'white', 
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {current.title}
          </h3>
          
          <p style={{ 
            color: '#d1d5db', 
            lineHeight: 1.6,
            marginBottom: '32px',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto 32px auto'
          }}>
            {current.description}
          </p>

          {/* État SafetyManager */}
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            backgroundColor: `rgba(${isSafetyManagerEnabled ? '16, 185, 129' : '156, 163, 175'}, 0.2)`,
            borderRadius: '8px',
            border: `1px solid rgba(${isSafetyManagerEnabled ? '16, 185, 129' : '156, 163, 175'}, 0.3)`
          }}>
            <div style={{
              fontSize: '14px',
              color: isSafetyManagerEnabled ? '#86efac' : '#9ca3af',
              marginBottom: '8px'
            }}>
              {isSafetyManagerEnabled ? '✅ ' + texts.safetyManager : '⚠️ Mode basique'}
            </div>
            <div style={{
              fontSize: '12px',
              color: isSafetyManagerEnabled ? '#6ee7b7' : '#6b7280'
            }}>
              {isSafetyManagerEnabled 
                ? texts.realTimeValidation + (validationData ? ` (${validationData.percentage}%)` : '')
                : (language === 'fr' ? 'SafetyManager non disponible' : 'SafetyManager not available')
              }
            </div>
          </div>

          {/* Liste des fonctionnalités */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: actualIsMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '12px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {current.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '14px',
                  color: '#93c5fd'
                }}
              >
                <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  
  // Gestion du PermitManager en mode plein écran
  if (showManager) {
    return (
      <PermitManager
        language={language}
        onDataChange={onDataChange}
        onSave={onSave}
        onCancel={() => setShowManager(false)}
        onSubmit={onSubmit}
        permitData={permitData}
        updatePermitData={updatePermitData}
        selectedProvince={selectedProvince}
        PROVINCIAL_REGULATIONS={actualRegulations}
        isMobile={actualIsMobile}
        styles={actualStyles}
        safetyManager={isSafetyManagerEnabled ? safetyManager : undefined}
        formData={formData}
        tenant={tenant}
        errors={errors}
        userRole={userRole}
        touchOptimized={touchOptimized}
        compactMode={compactMode}
        onPermitChange={onPermitChange}
        initialPermits={initialPermits}
      />
    );
  }

  return (
    <div style={actualStyles.container}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: actualIsMobile ? '20px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* En-tête principal avec indicateur SafetyManager */}
        <div style={actualStyles.headerCard}>
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
              flexDirection: actualIsMobile ? 'column' : 'row',
              gap: actualIsMobile ? '24px' : '0',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: actualIsMobile ? '28px' : '36px',
                  fontWeight: '900',
                  color: 'white',
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
                  color: '#d1d5db',
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
                  
                  {/* Indicateur SafetyManager */}
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
                    {isSafetyManagerEnabled ? texts.safetyManager : 'Mode basique'}
                  </div>
                  
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
                </div>
              </div>
              
              {/* Actions rapides */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={() => setShowManager(true)}
                  style={{
                    ...actualStyles.button,
                    ...actualStyles.buttonSecondary,
                    width: 'auto',
                    padding: actualIsMobile ? '10px 16px' : '12px 20px'
                  }}
                >
                  <Wrench style={{ width: '16px', height: '16px' }} />
                  {!actualIsMobile && texts.navigation.manager}
                </button>
                
                <button
                  onClick={() => savePermitData(true)}
                  disabled={isLoading}
                  style={{
                    ...actualStyles.button,
                    ...actualStyles.buttonSuccess,
                    width: 'auto',
                    padding: actualIsMobile ? '10px 16px' : '12px 20px',
                    opacity: isLoading ? 0.7 : 1
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
            
            {/* Informations du permis avec validation SafetyManager */}
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
                  gridTemplateColumns: actualIsMobile ? '1fr' : 'repeat(4, 1fr)', 
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
                      {actualRegulations[selectedProvince].authority} ({selectedProvince})
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
                      {language === 'fr' ? 'Validation' : 'Validation'}
                    </span>
                    <span style={{ 
                      color: validationData?.isValid ? '#10b981' : '#f59e0b', 
                      fontWeight: '700', 
                      fontSize: '16px' 
                    }}>
                      {validationData ? `${validationData.percentage}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation des sections */}
        <div style={actualStyles.sectionCard}>
          <h3 style={{
            color: 'white',
            fontSize: actualIsMobile ? '18px' : '20px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            {texts.progressTracker}
            {isSafetyManagerEnabled && validationData && (
              <span style={{ 
                fontSize: '14px', 
                color: validationData.isValid ? '#10b981' : '#f59e0b',
                fontWeight: '600' 
              }}>
                ({validationData.percentage}%)
              </span>
            )}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: actualIsMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: actualIsMobile ? '12px' : '16px',
            marginBottom: '20px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const).map((section, index) => {
              const Icon = getSectionIcon(section);
              const isActive = currentSection === section;
              
              return (
                <button
                  key={section}
                  onClick={() => navigateToSection(section)}
                  style={{
                    padding: actualIsMobile ? '20px 16px' : '24px 20px',
                    backgroundColor: isActive ? '#3b82f6' : 'rgba(75, 85, 99, 0.3)',
                    border: `2px solid ${isActive ? '#60a5fa' : '#6b7280'}`,
                    borderRadius: '16px',
                    color: isActive ? 'white' : '#9ca3af',
                    cursor: 'pointer',
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
                    overflow: 'hidden'
                  }}
                >
                  <Icon style={{ 
                    width: actualIsMobile ? '28px' : '32px', 
                    height: actualIsMobile ? '28px' : '32px'
                  }} />
                  <span style={{ textAlign: 'center', lineHeight: 1.3 }}>
                    {texts.sections[section]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de la section active */}
        <div style={actualStyles.sectionCard}>
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
          backgroundColor: '#1f2937',
          borderRadius: '16px',
          border: '2px solid #374151'
        }}>
          <button
            onClick={() => {
              const sections = ['site', 'rescue', 'atmospheric', 'registry', 'finalization'] as const;
              const currentIndex = sections.indexOf(currentSection);
              if (currentIndex > 0) {
                navigateToSection(sections[currentIndex - 1]);
              }
            }}
            disabled={currentSection === 'site'}
            style={{
              ...actualStyles.button,
              ...actualStyles.buttonSecondary,
              opacity: currentSection === 'site' ? 0.5 : 1,
              cursor: currentSection === 'site' ? 'not-allowed' : 'pointer',
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
              disabled={isLoading}
              style={{
                ...actualStyles.button,
                ...actualStyles.buttonSuccess,
                width: 'auto',
                padding: '12px 16px',
                opacity: isLoading ? 0.7 : 1
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
                  ...actualStyles.buttonSecondary,
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
                }
              }}
              disabled={currentSection === 'finalization'}
              style={{
                ...actualStyles.button,
                ...actualStyles.buttonPrimary,
                opacity: currentSection === 'finalization' ? 0.5 : 1,
                cursor: currentSection === 'finalization' ? 'not-allowed' : 'pointer',
                width: 'auto',
                padding: '12px 20px'
              }}
            >
              {texts.navigation.next}
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
