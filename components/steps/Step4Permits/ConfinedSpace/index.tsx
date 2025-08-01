// components/steps/Step4Permits/ConfinedSpace/index.tsx - VERSION STABILISÉE SANS ÉJECTION
"use client";

import React, { useState, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  // Props ASTForm compatibles
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
  
  // Props Step4Permits
  selectedProvince?: string;
  PROVINCIAL_REGULATIONS?: Record<string, any>;
  isMobile?: boolean;
  
  // Props ConfinedSpace spécifiques
  permitData?: any;
  safetyManager?: any;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  regulations?: any;
  onCancel?: () => void;
}

// =================== DONNÉES RÉGLEMENTAIRES ===================
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

// =================== STYLES RESPONSIFS ===================
const getStyles = (isMobile: boolean) => ({
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '8px' : '20px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '20px' : '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: isMobile ? '16px' : '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  navigation: {
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    marginBottom: '20px',
    overflowX: 'auto' as const,
    padding: '8px 0'
  },
  navButton: {
    padding: isMobile ? '12px 16px' : '16px 20px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    minWidth: isMobile ? '120px' : '160px',
    justifyContent: 'center',
    whiteSpace: 'nowrap' as const
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '20px' : '32px',
    border: '1px solid #374151',
    minHeight: '500px'
  },
  sectionContent: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  }
});

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Permis d'Espace Clos",
    subtitle: "Configuration complète selon les normes CSA Z1006",
    sections: {
      site: "Informations du Site",
      rescue: "Plan de Sauvetage", 
      atmospheric: "Tests Atmosphériques",
      registry: "Registre d'Entrée",
      finalization: "Finalisation"
    },
    progress: "Progression",
    status: {
      inProgress: "En cours",
      completed: "Complété"
    },
    actions: {
      save: "Sauvegarder",
      cancel: "Retour",
      next: "Suivant",
      previous: "Précédent"
    }
  },
  en: {
    title: "Confined Space Permit",
    subtitle: "Complete configuration according to CSA Z1006 standards",
    sections: {
      site: "Site Information",
      rescue: "Rescue Plan",
      atmospheric: "Atmospheric Testing", 
      registry: "Entry Registry",
      finalization: "Finalization"
    },
    progress: "Progress",
    status: {
      inProgress: "In Progress",
      completed: "Completed"
    },
    actions: {
      save: "Save",
      cancel: "Back",
      next: "Next",
      previous: "Previous"
    }
  }
};

// =================== SECTIONS CONFIGURATION ===================
const SECTIONS = [
  {
    id: 'site',
    name: { fr: 'Informations du Site', en: 'Site Information' },
    icon: Building,
    description: { 
      fr: 'Informations générales sur le site et l\'espace clos',
      en: 'General information about the site and confined space'
    }
  },
  {
    id: 'rescue',
    name: { fr: 'Plan de Sauvetage', en: 'Rescue Plan' },
    icon: Shield,
    description: { 
      fr: 'Équipes de sauvetage et procédures d\'urgence',
      en: 'Rescue teams and emergency procedures'
    }
  },
  {
    id: 'atmospheric',
    name: { fr: 'Tests Atmosphériques', en: 'Atmospheric Testing' },
    icon: Wind,
    description: { 
      fr: 'Surveillance continue de l\'atmosphère',
      en: 'Continuous atmospheric monitoring'
    }
  },
  {
    id: 'registry',
    name: { fr: 'Registre d\'Entrée', en: 'Entry Registry' },
    icon: Users,
    description: { 
      fr: 'Suivi du personnel entrant et sortant',
      en: 'Personnel entry and exit tracking'
    }
  },
  {
    id: 'finalization',
    name: { fr: 'Finalisation', en: 'Finalization' },
    icon: CheckCircle,
    description: { 
      fr: 'Validation finale et génération du permis',
      en: 'Final validation and permit generation'
    }
  }
];

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
  safetyManager,
  onSave,
  onSubmit,
  regulations,
  onCancel
}) => {
  
  // =================== GESTION INTELLIGENTE DES PROPS ===================
  const actualProvince = selectedProvince || province || 'QC';
  const actualIsMobile = isMobile !== undefined ? isMobile : touchOptimized || false;
  const actualRegulations = PROVINCIAL_REGULATIONS || DEFAULT_PROVINCIAL_REGULATIONS;
  
  const t = translations[language];
  const styles = getStyles(actualIsMobile);
  
  // =================== ÉTATS LOCAUX (SIMPLIFIÉS POUR ÉVITER L'ÉJECTION) ===================
  const [currentSection, setCurrentSection] = useState<string>('site');
  const [sectionProgress] = useState<Record<string, number>>({
    site: 75,
    rescue: 50,
    atmospheric: 80,
    registry: 25,
    finalization: 0
  });
  
  // =================== FONCTIONS STABLES (SANS AUTO-SAVE) ===================
  const handleSectionChange = useCallback((sectionId: string) => {
    if (sectionId === currentSection) return;
    setCurrentSection(sectionId);
  }, [currentSection]);

  const handleSave = useCallback(() => {
    // Sauvegarde manuelle seulement (pas d'auto-save)
    if (onSave) {
      onSave({
        currentSection,
        province: actualProvince,
        timestamp: new Date().toISOString()
      });
    }
    
    // Informer ASTForm si nécessaire
    if (onDataChange) {
      onDataChange('confinedSpace', {
        currentSection,
        progress: sectionProgress
      });
    }
  }, [currentSection, actualProvince, onSave, onDataChange, sectionProgress]);

  const getOverallProgress = (): number => {
    const totalProgress = Object.values(sectionProgress).reduce((sum, val) => sum + val, 0);
    return Math.round(totalProgress / SECTIONS.length);
  };

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSectionChange(section.id);
              }}
              style={{
                ...styles.navButton,
                background: isActive 
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : progress > 50 
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'rgba(75, 85, 99, 0.5)',
                color: 'white',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              <IconComponent size={18} />
              <span>{section.name[language]}</span>
              {progress > 0 && (
                <div style={{
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  marginLeft: '6px'
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
    const currentSectionData = SECTIONS.find(s => s.id === currentSection);
    if (!currentSectionData) return null;

    const IconComponent = currentSectionData.icon;

    return (
      <div style={styles.sectionContent}>
        <div style={{ marginBottom: '24px' }}>
          <IconComponent 
            size={actualIsMobile ? 48 : 64} 
            style={{ 
              color: '#60a5fa',
              marginBottom: '16px'
            }} 
          />
          <h2 style={{
            fontSize: actualIsMobile ? '24px' : '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px'
          }}>
            {currentSectionData.name[language]}
          </h2>
          <p style={{
            fontSize: actualIsMobile ? '16px' : '18px',
            color: '#d1d5db',
            lineHeight: 1.5,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {currentSectionData.description[language]}
          </p>
        </div>

        {/* Indicateur de progression de la section */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto 24px',
          background: '#374151',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${sectionProgress[currentSection] || 0}%`,
            height: '100%',
            background: sectionProgress[currentSection] > 50 
              ? 'linear-gradient(90deg, #10b981, #059669)'
              : 'linear-gradient(90deg, #f59e0b, #d97706)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: actualIsMobile ? 'column' : 'row',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '12px 20px',
            background: sectionProgress[currentSection] > 50 
              ? 'rgba(16, 185, 129, 0.2)' 
              : 'rgba(245, 158, 11, 0.2)',
            border: `1px solid ${sectionProgress[currentSection] > 50 ? '#10b981' : '#f59e0b'}`,
            borderRadius: '8px',
            color: sectionProgress[currentSection] > 50 ? '#86efac' : '#fde047',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {sectionProgress[currentSection] > 50 ? '✅ Section avancée' : '⚠️ Section en cours'}
          </div>
        </div>

        {/* Message informatif */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          maxWidth: '500px',
          margin: '32px auto 0'
        }}>
          <h4 style={{ color: '#93c5fd', marginBottom: '8px', fontSize: '16px' }}>
            📋 Module Intégré
          </h4>
          <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.5 }}>
            {language === 'fr' 
              ? 'Cette section sera prochainement intégrée avec les vrais modules SiteInformation, RescuePlan, AtmosphericTesting, etc.'
              : 'This section will soon be integrated with the real modules SiteInformation, RescuePlan, AtmosphericTesting, etc.'
            }
          </p>
        </div>
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
          zIndex: 0
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <div>
              <h1 style={{
                fontSize: actualIsMobile ? '24px' : '32px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Shield size={actualIsMobile ? 32 : 40} style={{ color: '#60a5fa' }} />
                {t.title}
              </h1>
              <p style={{
                color: '#d1d5db',
                fontSize: actualIsMobile ? '14px' : '16px',
                margin: 0
              }}>
                {t.subtitle}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: actualIsMobile ? '24px' : '32px',
                fontWeight: '700',
                color: getOverallProgress() >= 70 ? '#10b981' : '#f59e0b',
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
            marginBottom: '20px'
          }}>
            <div style={{
              width: `${getOverallProgress()}%`,
              height: '100%',
              background: getOverallProgress() >= 70 
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
      </div>

      {/* Navigation */}
      {renderNavigationButtons()}

      {/* Contenu */}
      <div style={styles.content}>
        {renderSectionContent()}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
        gap: '16px'
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onCancel) onCancel();
          }}
          style={{
            padding: actualIsMobile ? '12px 16px' : '14px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronRight 
            size={16} 
            style={{ transform: 'rotate(180deg)' }} 
          />
          {t.actions.cancel}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            style={{
              padding: actualIsMobile ? '12px 16px' : '14px 20px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Save size={16} />
            {t.actions.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
