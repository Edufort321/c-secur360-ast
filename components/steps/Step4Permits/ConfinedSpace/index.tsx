"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// 🔧 IMPORTS CORRIGÉS: Modules de ConfinedSpace
import { useSafetyManager } from './SafetyManager';
import SiteInformation from './SiteInformation';
import RescuePlan from './RescuePlan';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';

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
  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
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
  province: ProvinceCode;
  language: 'fr' | 'en';
  onSave: (data: any) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

interface AtmosphericReading {
  id: string;
  timestamp: string;
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  tester_name: string;
  status: 'safe' | 'warning' | 'danger';
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
      registry: "Registre d'Entrée"
    },
    navigation: {
      previous: "Précédent",
      next: "Suivant",
      save: "Enregistrer",
      cancel: "Annuler",
      submit: "Soumettre le Permis"
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
    progressTracker: "Progression du permis"
  },
  en: {
    title: "Confined Space Entry Permit",
    subtitle: "Mandatory legal document according to Canadian provincial regulations",
    sections: {
      site: "Site Information",
      rescue: "Rescue Plan",
      atmospheric: "Atmospheric Testing",
      registry: "Entry Registry"
    },
    navigation: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      cancel: "Cancel",
      submit: "Submit Permit"
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
    progressTracker: "Permit Progress"
  }
})[language];

// =================== COMPOSANT PRINCIPAL - DÉBUT ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData = {}
}) => {

  // =================== ÉTATS LOCAUX ===================
  const safetyManager = useSafetyManager();
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province);
  const [permitData, setPermitData] = useState<PermitData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [atmosphericReadings, setAtmosphericReadings] = useState<AtmosphericReading[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const texts = getTexts(language);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // =================== FONCTIONS UTILITAIRES ===================
  useEffect(() => {
    if (!permitData.permit_number) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      updatePermitData({ 
        permit_number: `CS-${selectedProvince}-${timestamp}-${random}`,
        issue_date: new Date().toISOString().slice(0, 16),
        selected_province: selectedProvince
      });
    }
  }, [selectedProvince]);

  const updatePermitData = useCallback((updates: Partial<PermitData>) => {
    setPermitData((prev) => ({ ...prev, ...updates }));
    
    clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      savePermitData(false);
    }, 2000);
  }, []);

  const validateSection = (section: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (section) {
      case 'site':
        if (!permitData.projectNumber?.trim()) errors.push('projectNumber');
        if (!permitData.workLocation?.trim()) errors.push('workLocation');
        if (!permitData.entry_supervisor?.trim()) errors.push('entry_supervisor');
        break;
      case 'rescue':
        if (!permitData.rescue_plan_type) errors.push('rescue_plan_type');
        break;
      case 'atmospheric':
        if (!permitData.gas_detector_calibrated) errors.push('gas_detector_calibrated');
        if (atmosphericReadings.length === 0) errors.push('atmospheric_readings');
        break;
      case 'registry':
        if (!permitData.supervisor_name?.trim()) errors.push('supervisor_name');
        if (!permitData.permit_valid_from) errors.push('permit_valid_from');
        break;
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const navigateToSection = (section: 'site' | 'rescue' | 'atmospheric' | 'registry') => {
    setCurrentSection(section);
  };

  const savePermitData = async (showNotification = true) => {
    if (showNotification) {
      setIsLoading(true);
      setSaveStatus('saving');
    }
    
    try {
      await onSave({
        ...permitData,
        currentSection,
        selectedProvince,
        atmosphericReadings
      });
      
      if (showNotification) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      if (showNotification) {
        setIsLoading(false);
      }
    }
  };

  const calculateCompletionPercentage = (): number => {
    const sections = ['site', 'rescue', 'atmospheric', 'registry'];
    const validSections = sections.filter(section => validateSection(section).isValid);
    return Math.round((validSections.length / sections.length) * 100);
  };

  const getOverallStatus = (): 'draft' | 'inProgress' | 'completed' => {
    const percentage = calculateCompletionPercentage();
    if (percentage === 0) return 'draft';
    if (percentage === 100) return 'completed';
    return 'inProgress';
  };
  // =================== RENDU DES SECTIONS ===================
  const renderSectionContent = () => {
    const commonProps = {
      permitData,
      updatePermitData,
      selectedProvince,
      PROVINCIAL_REGULATIONS,
      isMobile,
      language,
      styles,
      safetyManager,
      formErrors,
      setFormErrors,
      texts,
      updateParentData: (section: string, data: any) => {
        updatePermitData({ [section]: data });
      }
    };

    try {
      switch (currentSection) {
        case 'site':
          return (
            <div ref={el => sectionRefs.current.site = el}>
              <SiteInformation {...commonProps} />
            </div>
          );
        
        case 'rescue':
          return (
            <div ref={el => sectionRefs.current.rescue = el}>
              <RescuePlan {...commonProps} />
            </div>
          );
        
        case 'atmospheric':
          return (
            <div ref={el => sectionRefs.current.atmospheric = el}>
              <AtmosphericTesting 
                {...commonProps} 
                atmosphericReadings={atmosphericReadings}
                setAtmosphericReadings={setAtmosphericReadings}
              />
            </div>
          );
        
        case 'registry':
          return (
            <div ref={el => sectionRefs.current.registry = el}>
              <EntryRegistry 
                {...commonProps} 
                atmosphericReadings={atmosphericReadings}
              />
            </div>
          );
        
        default:
          return (
            <div ref={el => sectionRefs.current.site = el}>
              <SiteInformation {...commonProps} />
            </div>
          );
      }
    } catch (error) {
      console.error('Erreur rendu section:', error);
      return (
        <div style={{ 
          ...styles.card, 
          textAlign: 'center', 
          padding: '40px',
          border: '2px solid #dc2626' 
        }}>
          <AlertTriangle style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>
            {language === 'fr' ? 'Erreur de chargement' : 'Loading Error'}
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
            {language === 'fr' 
              ? 'Impossible de charger cette section. Veuillez réessayer.'
              : 'Unable to load this section. Please try again.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ ...styles.button, ...styles.buttonPrimary, width: 'auto' }}
          >
            {language === 'fr' ? 'Recharger' : 'Reload'}
          </button>
        </div>
      );
    }
  };

  const getSectionIcon = (section: string) => {
    const iconMap = {
      site: Building,
      rescue: Shield,
      atmospheric: Gauge,
      registry: Users
    };
    return iconMap[section as keyof typeof iconMap] || FileText;
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={styles.container}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '20px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* En-tête principal amélioré */}
        <div style={styles.headerCard}>
          {/* Gradient de fond animé */}
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
                
                {/* Badge de conformité réglementaire */}
                <div style={{
                  marginTop: '16px',
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
                  {texts.complianceNote} {PROVINCIAL_REGULATIONS[selectedProvince].authority}
                </div>
              </div>
              
              {/* Panneau de statut et actions */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                {/* Indicateur de progression circulaire */}
                <div style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="rgba(75, 85, 99, 0.3)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke={getOverallStatus() === 'completed' ? '#10b981' : 
                             getOverallStatus() === 'inProgress' ? '#f59e0b' : '#6b7280'}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - calculateCompletionPercentage() / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    {calculateCompletionPercentage()}%
                  </div>
                </div>
                
                {/* Statut et actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Statut global */}
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: getOverallStatus() === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                    getOverallStatus() === 'inProgress' ? 'rgba(245, 158, 11, 0.2)' : 
                                    'rgba(107, 114, 128, 0.2)',
                    border: `2px solid ${getOverallStatus() === 'completed' ? '#10b981' : 
                                        getOverallStatus() === 'inProgress' ? '#f59e0b' : 
                                        '#6b7280'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}>
                    {getOverallStatus() === 'completed' ? (
                      <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    ) : getOverallStatus() === 'inProgress' ? (
                      <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                    ) : (
                      <FileText style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    )}
                    <span style={{
                      color: getOverallStatus() === 'completed' ? '#86efac' : 
                            getOverallStatus() === 'inProgress' ? '#fde047' : 
                            '#9ca3af',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {texts.status[getOverallStatus()]}
                    </span>
                  </div>
                  
                  {/* Actions principales */}
                  <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                    <button
                      onClick={() => savePermitData(true)}
                      disabled={isLoading}
                      style={{
                        ...styles.button,
                        ...styles.buttonSuccess,
                        padding: '12px 20px',
                        fontSize: '14px',
                        minWidth: '140px',
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        width: 'auto'
                      }}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          {texts.status.saving}
                        </>
                      ) : saveStatus === 'saved' ? (
                        <>
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
                          {texts.status.saved}
                        </>
                      ) : saveStatus === 'error' ? (
                        <>
                          <XCircle style={{ width: '16px', height: '16px' }} />
                          {texts.status.error}
                        </>
                      ) : (
                        <>
                          <Save style={{ width: '16px', height: '16px' }} />
                          {texts.navigation.save}
                        </>
                      )}
                    </button>
                    
                    {/* Bouton de soumission (visible seulement si complété) */}
                    {getOverallStatus() === 'completed' && (
                      <button
                        onClick={onSubmit}
                        disabled={isLoading}
                        style={{
                          ...styles.button,
                          ...styles.buttonPrimary,
                          padding: '12px 20px',
                          fontSize: '14px',
                          minWidth: '140px',
                          width: 'auto'
                        }}
                      >
                        <Upload style={{ width: '16px', height: '16px' }} />
                        {texts.navigation.submit}
                      </button>
                    )}
                  </div>
                </div>
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
                      {PROVINCIAL_REGULATIONS[selectedProvince].authority} ({selectedProvince})
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
                      {PROVINCIAL_REGULATIONS[selectedProvince].authority_phone}
                    </span>
                  </div>
                </div>
                
                {/* Indicateur de sauvegarde automatique */}
                <div style={{
                  marginTop: '16px',
                  padding: '8px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#86efac',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 2s infinite'
                  }} />
                  {texts.autoSaveEnabled}
                </div>
              </div>
            )}
          </div>

          {/* CSS pour les animations */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>

        {/* Navigation des sections améliorée */}
        <div style={styles.sectionCard}>
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: isMobile ? '18px' : '20px',
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
              fontSize: '14px',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock style={{ width: '16px', height: '16px' }} />
              {calculateCompletionPercentage()}% {language === 'fr' ? 'complété' : 'completed'}
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '16px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => {
              const Icon = getSectionIcon(section);
              const isActive = currentSection === section;
              const validation = validateSection(section);
              const isCompleted = validation.isValid;
              const hasErrors = validation.errors.length > 0;
              
              return (
                <button
                  key={section}
                  onClick={() => navigateToSection(section)}
                  style={{
                    padding: isMobile ? '20px 16px' : '24px 20px',
                    backgroundColor: isActive ? '#3b82f6' : 
                                    isCompleted ? 'rgba(16, 185, 129, 0.2)' : 
                                    hasErrors ? 'rgba(220, 38, 38, 0.2)' :
                                    'rgba(75, 85, 99, 0.3)',
                    border: `2px solid ${isActive ? '#60a5fa' : 
                                        isCompleted ? '#10b981' : 
                                        hasErrors ? '#dc2626' :
                                        '#6b7280'}`,
                    borderRadius: '16px',
                    color: isActive ? 'white' : 
                           isCompleted ? '#86efac' : 
                           hasErrors ? '#fca5a5' :
                           '#9ca3af',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '14px' : '15px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isActive ? '0 8px 25px rgba(59, 130, 246, 0.3)' : 
                               isCompleted ? '0 4px 15px rgba(16, 185, 129, 0.2)' :
                               hasErrors ? '0 4px 15px rgba(220, 38, 38, 0.2)' :
                               '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Indicateur de progression */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#10b981' : 
                                    hasErrors ? '#dc2626' :
                                    'rgba(107, 114, 128, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}>
                    {isCompleted ? (
                      <CheckCircle style={{ width: '14px', height: '14px', color: 'white' }} />
                    ) : hasErrors ? (
                      <AlertTriangle style={{ width: '14px', height: '14px', color: 'white' }} />
                    ) : (
                      <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  
                  <Icon style={{ 
                    width: isMobile ? '28px' : '32px', 
                    height: isMobile ? '28px' : '32px',
                    marginTop: '8px'
                  }} />
                  <span style={{ textAlign: 'center', lineHeight: 1.3 }}>
                    {texts.sections[section]}
                  </span>
                  
                  {/* Indicateur d'erreurs */}
                  {hasErrors && !isActive && (
                    <div style={{
                      fontSize: '11px',
                      color: '#fca5a5',
                      marginTop: '-4px'
                    }}>
                      {validation.errors.length} {language === 'fr' ? 'erreur(s)' : 'error(s)'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu de la section active */}
        <div style={{
          ...styles.sectionCard,
          minHeight: '700px',
          position: 'relative'
        }}>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <Suspense fallback={
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(59, 130, 246, 0.3)',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <div>
                  <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>
                    {texts.loading}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                    {language === 'fr' 
                      ? `Chargement de ${texts.sections[currentSection]}`
                      : `Loading ${texts.sections[currentSection]}`
                    }
                  </p>
                </div>
              </div>
            }>
              {renderSectionContent()}
            </Suspense>
          </div>
        </div>

        {/* Navigation bas de page améliorée */}
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
            onClick={() => {
              const sections = ['site', 'rescue', 'atmospheric', 'registry'] as const;
              const currentIndex = sections.indexOf(currentSection);
              if (currentIndex > 0) {
                navigateToSection(sections[currentIndex - 1]);
              }
            }}
            disabled={currentSection === 'site'}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
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
            alignItems: 'center', 
            gap: '8px',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => (
              <div
                key={section}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: currentSection === section ? '#3b82f6' : validateSection(section).isValid ? '#10b981' : '#6b7280',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onCancel}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: '12px 16px'
              }}
            >
              <XCircle style={{ width: '16px', height: '16px' }} />
              {texts.navigation.cancel}
            </button>
            
            <button
              onClick={() => {
                const sections = ['site', 'rescue', 'atmospheric', 'registry'] as const;
                const currentIndex = sections.indexOf(currentSection);
                if (currentIndex < sections.length - 1) {
                  navigateToSection(sections[currentIndex + 1]);
                }
              }}
              disabled={currentSection === 'registry'}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: currentSection === 'registry' ? 0.5 : 1,
                cursor: currentSection === 'registry' ? 'not-allowed' : 'pointer',
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
    </div>
  );
};

export default ConfinedSpace;
