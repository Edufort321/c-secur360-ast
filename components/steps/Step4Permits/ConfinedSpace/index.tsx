// components/steps/Step4Permits/ConfinedSpace/index.tsx - VERSION PROPRE
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// 🔧 IMPORTS DES MODULES EXISTANTS
import SiteInformation from './SiteInformation';
import RescuePlan from './RescuePlan';
import AtmosphericTesting from './AtmosphericTesting';
import EntryRegistry from './EntryRegistry';
import PermitManager from './PermitManager';
import { useSafetyManager } from './SafetyManager';

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  // Props reçues depuis ASTForm - COMPATIBILITÉ COMPLÈTE
  formData?: any;
  onDataChange?: (section: string, data: any) => void;
  language?: 'fr' | 'en';
  tenant?: string;
  errors?: any;
  province?: ProvinceCode;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
  
  // Props PermitManager (pour compatibilité)
  selectedProvince?: string;
  PROVINCIAL_REGULATIONS?: Record<string, any>;
  isMobile?: boolean;
  
  // Props ConfinedSpace spécifiques
  permitData?: any;
  safetyManager?: any;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  regulations?: any;
}

interface SectionConfig {
  id: string;
  name: { fr: string; en: string };
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  description: { fr: string; en: string };
  estimatedTime: number;
  required: boolean;
  status: 'not-started' | 'in-progress' | 'completed' | 'error';
}

// =================== DONNÉES RÉGLEMENTAIRES PAR DÉFAUT ===================
const DEFAULT_PROVINCIAL_REGULATIONS: Record<string, any> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808",
    atmospheric_testing: { frequency_minutes: 30, continuous_monitoring_required: true }
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008",
    atmospheric_testing: { frequency_minutes: 15, continuous_monitoring_required: true }
  }
};

// =================== CONFIGURATION DES SECTIONS ===================
const SECTIONS: SectionConfig[] = [
  {
    id: 'site',
    name: { fr: 'Informations du Site', en: 'Site Information' },
    icon: Building,
    component: SiteInformation,
    description: { 
      fr: 'Informations générales sur le site et l\'espace clos',
      en: 'General information about the site and confined space'
    },
    estimatedTime: 10,
    required: true,
    status: 'not-started'
  },
  {
    id: 'rescue',
    name: { fr: 'Plan de Sauvetage', en: 'Rescue Plan' },
    icon: Shield,
    component: RescuePlan,
    description: { 
      fr: 'Équipes de sauvetage et procédures d\'urgence',
      en: 'Rescue teams and emergency procedures'
    },
    estimatedTime: 15,
    required: true,
    status: 'not-started'
  },
  {
    id: 'atmospheric',
    name: { fr: 'Tests Atmosphériques', en: 'Atmospheric Testing' },
    icon: Wind,
    component: AtmosphericTesting,
    description: { 
      fr: 'Surveillance continue de l\'atmosphère',
      en: 'Continuous atmospheric monitoring'
    },
    estimatedTime: 20,
    required: true,
    status: 'not-started'
  },
  {
    id: 'registry',
    name: { fr: 'Registre d\'Entrée', en: 'Entry Registry' },
    icon: Users,
    component: EntryRegistry,
    description: { 
      fr: 'Suivi du personnel entrant et sortant',
      en: 'Personnel entry and exit tracking'
    },
    estimatedTime: 8,
    required: true,
    status: 'not-started'
  },
  {
    id: 'finalization',
    name: { fr: 'Finalisation', en: 'Finalization' },
    icon: CheckCircle,
    component: PermitManager,
    description: { 
      fr: 'Validation finale et génération du permis',
      en: 'Final validation and permit generation'
    },
    estimatedTime: 5,
    required: true,
    status: 'not-started'
  }
];

// =================== STYLES RESPONSIFS ===================
const getStyles = (isMobile: boolean) => ({
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '16px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: isMobile ? '12px' : '20px'
  },
  navigation: {
    display: 'flex',
    gap: isMobile ? '4px' : '8px',
    marginBottom: isMobile ? '12px' : '20px',
    overflowX: 'auto',
    padding: '8px 0'
  },
  navButton: {
    padding: isMobile ? '8px 12px' : '12px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    minWidth: isMobile ? '100px' : '140px',
    justifyContent: 'center',
    whiteSpace: 'nowrap'
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '12px',
    border: '1px solid #374151',
    minHeight: '400px',
    overflow: 'hidden'
  }
});

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Permis d'Espace Clos",
    subtitle: "Configuration complète selon les normes CSA Z1006",
    progress: "Progression",
    of: "de",
    completed: "complété",
    estimatedTime: "Temps estimé",
    minutes: "minutes",
    required: "Obligatoire",
    optional: "Optionnel",
    notStarted: "Non commencé",
    inProgress: "En cours",
    error: "Erreur",
    loading: "Chargement..."
  },
  en: {
    title: "Confined Space Permit",
    subtitle: "Complete configuration according to CSA Z1006 standards",
    progress: "Progress",
    of: "of",
    completed: "completed",
    estimatedTime: "Estimated time",
    minutes: "minutes",
    required: "Required",
    optional: "Optional",
    notStarted: "Not started",
    inProgress: "In progress",
    error: "Error",
    loading: "Loading..."
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  // Props ASTForm
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province,
  userRole,
  touchOptimized,
  compactMode,
  onPermitChange,
  initialPermits,
  
  // Props PermitManager (avec fallbacks)
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  
  // Props ConfinedSpace
  permitData,
  safetyManager: externalSafetyManager,
  onSave,
  onSubmit,
  regulations
}) => {
  
  // =================== GESTION INTELLIGENTE DES PROPS ===================
  const actualProvince = selectedProvince || province || 'QC';
  const actualIsMobile = isMobile !== undefined ? isMobile : touchOptimized || false;
  const actualRegulations = PROVINCIAL_REGULATIONS || DEFAULT_PROVINCIAL_REGULATIONS;
  const safetyManager = externalSafetyManager || useSafetyManager();
  
  const t = translations[language];
  const styles = getStyles(actualIsMobile);
  
  // =================== ÉTATS LOCAUX ===================
  const [currentSection, setCurrentSection] = useState<string>('site');
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // =================== FONCTION DE MISE À JOUR DES DONNÉES ===================
  const updateSectionData = useCallback((sectionId: string, data: any) => {
    // Informer ASTForm si la fonction existe
    if (onDataChange) {
      onDataChange(`confinedSpace.${sectionId}`, data);
    }
    
    // Calculer la progression de la section
    const completionPercentage = calculateSectionCompletion(sectionId, data);
    setSectionProgress(prev => ({
      ...prev,
      [sectionId]: completionPercentage
    }));
  }, [onDataChange]);

  // =================== CALCUL DE LA PROGRESSION ===================
  const calculateSectionCompletion = (sectionId: string, data: any): number => {
    if (!data) return 0;
    
    switch (sectionId) {
      case 'site':
        const siteFields = ['projectNumber', 'workLocation', 'contractor', 'supervisor'];
        const completedSiteFields = siteFields.filter(field => data[field]).length;
        return Math.round((completedSiteFields / siteFields.length) * 100);
        
      case 'rescue':
        return data.emergencyContacts?.length > 0 ? 100 : 0;
        
      case 'atmospheric':
        return data.readings?.length > 0 ? 100 : 0;
        
      case 'registry':
        return data.personnel?.length > 0 ? 100 : 0;
        
      case 'finalization':
        const overallProgress = Object.values(sectionProgress).reduce((sum: number, val: number) => sum + val, 0) / SECTIONS.length;
        return Math.round(overallProgress);
        
      default:
        return 0;
    }
  };

  const getOverallProgress = (): number => {
    const totalProgress = Object.values(sectionProgress).reduce((sum, val) => sum + val, 0);
    return Math.round(totalProgress / SECTIONS.length);
  };

  // =================== NAVIGATION ENTRE SECTIONS ===================
  const handleSectionChange = useCallback((sectionId: string) => {
    if (sectionId === currentSection) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSection(sectionId);
      setIsTransitioning(false);
    }, 150);
  }, [currentSection]);

  // =================== RENDU DES BOUTONS DE NAVIGATION ===================
  const renderNavigationButtons = () => {
    return (
      <div style={styles.navigation}>
        {SECTIONS.map((section) => {
          const isActive = currentSection === section.id;
          const progress = sectionProgress[section.id] || 0;
          const IconComponent = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              style={{
                ...styles.navButton,
                background: isActive 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : progress > 0 
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'rgba(75, 85, 99, 0.5)',
                color: 'white',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              <IconComponent size={16} />
              <span>{section.name[language]}</span>
              {progress > 0 && (
                <div style={{
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '2px 6px',
                  marginLeft: '4px'
                }}>
                  {progress}%
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // =================== RENDU DU CONTENU DE SECTION ===================
  const renderSectionContent = () => {
    const commonProps = {
      formData: formData?.confinedSpace?.[currentSection] || {},
      onDataChange: (data: any) => updateSectionData(currentSection, data),
      language,
      tenant,
      touchOptimized: actualIsMobile,
      compactMode,
      permitData,
      province: actualProvince,
      regulations: actualRegulations[actualProvince],
      safetyManager,
      selectedProvince: actualProvince,
      PROVINCIAL_REGULATIONS: actualRegulations,
      isMobile: actualIsMobile
    };

    const currentSectionConfig = SECTIONS.find(s => s.id === currentSection);
    if (!currentSectionConfig) return null;

    const SectionComponent = currentSectionConfig.component;

    return (
      <div style={{
        opacity: isTransitioning ? 0.5 : 1,
        transition: 'opacity 0.15s ease',
        padding: actualIsMobile ? '12px' : '20px'
      }}>
        <SectionComponent {...commonProps} />
      </div>
    );
  };

  // =================== EFFETS ===================
  useEffect(() => {
    // Initialiser la progression des sections si les données existent
    if (formData?.confinedSpace) {
      const newProgress: Record<string, number> = {};
      SECTIONS.forEach(section => {
        const sectionData = formData.confinedSpace[section.id];
        if (sectionData) {
          newProgress[section.id] = calculateSectionCompletion(section.id, sectionData);
        }
      });
      setSectionProgress(newProgress);
    }
  }, [formData]);

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: actualIsMobile ? '18px' : '24px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 4px 0'
            }}>
              🏗️ {t.title}
            </h1>
            <p style={{
              color: '#d1d5db',
              fontSize: actualIsMobile ? '13px' : '15px',
              margin: 0
            }}>
              {t.subtitle}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: actualIsMobile ? '20px' : '28px',
              fontWeight: '700',
              color: getOverallProgress() >= 80 ? '#10b981' : '#f59e0b',
              marginBottom: '4px'
            }}>
              {getOverallProgress()}%
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              {t.progress}
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#374151',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${getOverallProgress()}%`,
            height: '100%',
            background: getOverallProgress() >= 80 
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #f59e0b, #d97706)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Informations provinciales */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          color: '#d1d5db'
        }}>
          <MapPin size={16} />
          <span>{actualRegulations[actualProvince]?.name || 'Réglementation provinciale'}</span>
          <span>•</span>
          <span>{actualRegulations[actualProvince]?.authority || 'Autorité provinciale'}</span>
        </div>
      </div>

      {/* Navigation */}
      {renderNavigationButtons()}

      {/* Contenu */}
      <div style={styles.content}>
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default ConfinedSpace;
