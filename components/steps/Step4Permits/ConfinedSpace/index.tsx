"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

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
  province?: ProvinceCode;
  language?: 'fr' | 'en';
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
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

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData = {}
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province);
  const [permitData, setPermitData] = useState<PermitData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const texts = getTexts(language);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

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

  const savePermitData = async (showNotification = true) => {
    if (showNotification) {
      setIsLoading(true);
      setSaveStatus('saving');
    }
    
    try {
      if (onSave) {
        await onSave({
          ...permitData,
          currentSection,
          selectedProvince
        });
      }
      
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

  const handleResetSection = () => {
    // Réinitialise les données de la section actuelle avec types corrects
    const sectionDefaults: Record<string, Partial<PermitData>> = {
      site: {
        projectNumber: '',
        workLocation: '',
        spaceDescription: '',
        workDescription: '',
        entry_supervisor: ''
      },
      rescue: {
        rescue_plan_type: 'internal' as const,
        supervisor_name: ''
      },
      atmospheric: {
        gas_detector_calibrated: false,
        calibration_date: ''
      },
      registry: {
        permit_valid_from: '',
        permit_valid_to: ''
      }
    };

    const resetData = sectionDefaults[currentSection];
    if (resetData) {
      updatePermitData(resetData);
    }
    setSaveStatus('idle');
  };

  const handleSubmitPermit = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      if (onSubmit) {
        await onSubmit({
          ...permitData,
          currentSection,
          selectedProvince,
          submitted_at: new Date().toISOString(),
          status: 'submitted'
        });
      }
      
      setSaveStatus('saved');
      
      // Notification de succès
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickExit = () => {
    // Fonction spéciale pour quitter avec confirmation
    const confirmExit = window.confirm(
      language === 'fr' 
        ? 'Êtes-vous sûr de vouloir quitter ? Les modifications non sauvegardées seront perdues.'
        : 'Are you sure you want to exit? Unsaved changes will be lost.'
    );
    
    if (confirmExit) {
      onCancel();
    }
  };

  const navigateToSection = (section: 'site' | 'rescue' | 'atmospheric' | 'registry') => {
    setCurrentSection(section);
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

  // =================== RENDU DES SECTIONS AMÉLIORÉ ===================
  const renderSectionContent = () => {
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
      }
    };

    const current = sectionData[currentSection];

    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        border: '2px dashed #374151',
        borderRadius: '12px',
        backgroundColor: 'rgba(17, 24, 39, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Arrière-plan décoratif */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          pointerEvents: 'none',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        
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

          {/* Liste des fonctionnalités */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
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

          {/* Indicateur de progression */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              marginBottom: '8px'
            }}>
              {language === 'fr' ? 'Contenu à venir...' : 'Content coming soon...'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {language === 'fr' 
                ? 'Les vrais modules seront intégrés progressivement'
                : 'Real modules will be integrated progressively'
              }
            </div>
          </div>
        </div>
      </div>
    );
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
        
        {/* Indicateur de statut de sauvegarde */}
        {saveStatus !== 'idle' && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            ...(saveStatus === 'saving' && {
              backgroundColor: '#1f2937',
              color: '#60a5fa',
              border: '1px solid #3b82f6'
            }),
            ...(saveStatus === 'saved' && {
              backgroundColor: '#065f46',
              color: '#86efac',
              border: '1px solid #10b981'
            }),
            ...(saveStatus === 'error' && {
              backgroundColor: '#7f1d1d',
              color: '#fca5a5',
              border: '1px solid #ef4444'
            })
          }}>
            {saveStatus === 'saving' && <Clock style={{ width: '16px', height: '16px' }} />}
            {saveStatus === 'saved' && <CheckCircle style={{ width: '16px', height: '16px' }} />}
            {saveStatus === 'error' && <AlertTriangle style={{ width: '16px', height: '16px' }} />}
            {texts.status[saveStatus]}
          </div>
        )}

        {/* En-tête principal */}
        <div style={styles.headerCard}>
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
              </div>
            )}
          </div>
        </div>

        {/* Navigation des sections */}
        <div style={styles.sectionCard}>
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
            {texts.progressTracker}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '16px',
            marginBottom: '20px'
          }}>
            {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => {
              const Icon = getSectionIcon(section);
              const isActive = currentSection === section;
              
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
                    boxShadow: isActive ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Icon style={{ 
                    width: isMobile ? '28px' : '32px', 
                    height: isMobile ? '28px' : '32px'
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
        <div style={styles.sectionCard}>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            {renderSectionContent()}
          </div>
        </div>

        {/* Menu d'actions rapides optimisé */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={handleQuickExit}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              border: '3px solid #ef4444',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.3s ease',
              fontSize: '12px',
              fontWeight: '600'
            }}
            title={language === 'fr' ? 'Quitter le permis (avec confirmation)' : 'Exit permit (with confirmation)'}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
          >
            <XCircle style={{ width: '24px', height: '24px' }} />
          </button>
          
          <button
            onClick={() => setCurrentSection('site')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#374151',
              border: '2px solid #6b7280',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
            title={language === 'fr' ? 'Retour au début' : 'Back to start'}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
          >
            <Home style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Bouton d'aide rapide */}
          <button
            onClick={() => {
              const helpText = language === 'fr' 
                ? `Section actuelle: ${texts.sections[currentSection]}\n\nNavigation:\n• Cliquez sur les 4 sections en haut\n• Utilisez Précédent/Suivant en bas\n• Enregistrer sauvegarde vos données\n• Réinitialiser vide la section actuelle`
                : `Current section: ${texts.sections[currentSection]}\n\nNavigation:\n• Click on the 4 sections above\n• Use Previous/Next at bottom\n• Save preserves your data\n• Reset clears current section`;
              alert(helpText);
            }}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              border: '2px solid #10b981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
            title={language === 'fr' ? 'Aide rapide' : 'Quick help'}
          >
            <AlertTriangle style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Navigation bas de page */}
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
            gap: '12px'
          }}>
            <button
              onClick={() => savePermitData(true)}
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                width: 'auto',
                padding: '12px 16px',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  {texts.navigation.save}
                </>
              )}
            </button>
            
            <button
              onClick={handleResetSection}
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: '12px 16px',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              {language === 'fr' ? 'Réinitialiser' : 'Reset'}
            </button>
            
            <button
              onClick={() => {
                const sections = ['site', 'rescue', 'atmospheric', 'registry'] as const;
                const currentIndex = sections.indexOf(currentSection);
                if (currentIndex < sections.length - 1) {
                  navigateToSection(sections[currentIndex + 1]);
                } else {
                  // Dernière section - proposer de soumettre
                  handleSubmitPermit();
                }
              }}
              disabled={isLoading}
              style={{
                ...styles.button,
                ...(currentSection === 'registry' ? styles.buttonSuccess : styles.buttonPrimary),
                width: 'auto',
                padding: '12px 20px',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {currentSection === 'registry' ? (
                <>
                  <CheckCircle style={{ width: '18px', height: '18px' }} />
                  {texts.navigation.submit}
                </>
              ) : (
                <>
                  {texts.navigation.next}
                  <ChevronRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
