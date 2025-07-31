"use client";

import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, Bluetooth, Battery, Signal, 
  CheckCircle, XCircle, Play, Pause, RotateCcw, Save, Upload, Download, PenTool, Shield, 
  Eye, Thermometer, Volume2, Gauge, Plus, FileText, Activity, Settings, Search, Star,
  Wrench, Target, ChevronDown, ChevronRight, Building, Construction, Flame, Zap, BarChart3
} from 'lucide-react';

// 🔧 CORRECTION: Import du SafetyManager + Imports lazy
import { useSafetyManager } from './SafetyManager';

const SiteInformation = lazy(() => import('./SiteInformation'));
const RescuePlan = lazy(() => import('./RescuePlan'));
const AtmosphericTesting = lazy(() => import('./AtmosphericTesting'));
const EntryRegistry = lazy(() => import('./EntryRegistry'));

// =================== DÉTECTION MOBILE ET STYLES IDENTIQUES AU CODE ORIGINAL ===================
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
  }
};

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpaceProps {
  province: ProvinceCode;
  language: 'fr' | 'en';
  onSave: (data: any) => void;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

// =================== DONNÉES RÉGLEMENTAIRES (SIMPLIFIÉES) ===================
const PROVINCIAL_REGULATIONS: Record<ProvinceCode, any> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808"
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008"
  },
  BC: {
    name: "Workers Compensation Act - Part 3, Division 8",
    authority: "WorkSafeBC",
    authority_phone: "1-888-621-7233"
  },
  AB: {
    name: "Occupational Health and Safety Code - Part 5",
    authority: "Alberta Labour",
    authority_phone: "1-866-415-8690"
  },
  SK: {
    name: "Saskatchewan Employment Act - Part III",
    authority: "Ministry of Labour Relations",
    authority_phone: "1-800-567-7233"
  },
  MB: {
    name: "Workplace Safety and Health Act",
    authority: "Manitoba Labour",
    authority_phone: "1-855-957-7233"
  },
  NB: {
    name: "General Regulation - Occupational Health and Safety Act",
    authority: "WorkSafeNB",
    authority_phone: "1-800-222-9775"
  },
  NS: {
    name: "Occupational Health and Safety Act",
    authority: "Nova Scotia Labour",
    authority_phone: "1-800-952-2687"
  },
  PE: {
    name: "Occupational Health and Safety Act",
    authority: "PEI Workers Compensation Board",
    authority_phone: "1-800-237-5049"
  },
  NL: {
    name: "Occupational Health and Safety Regulations",
    authority: "Workplace NL",
    authority_phone: "1-800-563-9000"
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpace: React.FC<ConfinedSpaceProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData = {}
}) => {

  // =================== ÉTATS LOCAUX + SAFETYMANAGER ===================
  const safetyManager = useSafetyManager();
  const [currentSection, setCurrentSection] = useState<'site' | 'rescue' | 'atmospheric' | 'registry'>('site');
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province);
  const [permitData, setPermitData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // =================== TRADUCTIONS ===================
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
      loading: "Chargement..."
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
      loading: "Loading..."
    }
  })[language];

  const texts = getTexts(language);

  // =================== FONCTIONS UTILITAIRES ===================
  // Génération automatique du numéro de permis
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

  // Mise à jour des données de permis
  const updatePermitData = useCallback((updates: any) => {
    setPermitData((prev: any) => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Validation des sections (simplifiée)
  const validateSection = (section: string): boolean => {
    switch (section) {
      case 'site':
        return !!(permitData.projectNumber && permitData.workLocation);
      case 'rescue':
        return !!(permitData.rescue_plan_type);
      case 'atmospheric':
        return !!(permitData.gas_detector_calibrated);
      case 'registry':
        return !!(permitData.supervisor_name);
      default:
        return false;
    }
  };

  // Navigation entre sections
  const navigateToSection = (section: 'site' | 'rescue' | 'atmospheric' | 'registry') => {
    setCurrentSection(section);
  };

  // Sauvegarde des données
  const savePermitData = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      await onSave({
        ...permitData,
        currentSection,
        selectedProvince
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul du statut global
  const getOverallStatus = (): 'draft' | 'inProgress' | 'completed' => {
    const sectionsValidated = [
      validateSection('site'),
      validateSection('rescue'),
      validateSection('atmospheric'),
      validateSection('registry')
    ];
    
    const completedSections = sectionsValidated.filter(Boolean).length;
    
    if (completedSections === 0) return 'draft';
    if (completedSections === 4) return 'completed';
    return 'inProgress';
  };

  // 🔧 CORRECTION: Composant de loading pour Suspense
  const LoadingSpinner = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(59, 130, 246, 0.3)',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#9ca3af', fontSize: '16px' }}>{texts.loading}</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // =================== RENDU DES SECTIONS AVEC SUSPENSE ===================
  const renderSectionContent = () => {
    const commonProps = {
      permitData,
      updatePermitData,
      selectedProvince,
      PROVINCIAL_REGULATIONS,
      isMobile,
      language,
      styles,
      safetyManager, // 🔧 AJOUT: Passer le SafetyManager aux composants
      updateParentData: (section: string, data: any) => {
        updatePermitData({ [section]: data });
      }
    };

    return (
      <Suspense fallback={<LoadingSpinner />}>
        {currentSection === 'site' && (
          <SiteInformation {...commonProps} />
        )}
        {currentSection === 'rescue' && (
          <RescuePlan {...commonProps} />
        )}
        {currentSection === 'atmospheric' && (
          <AtmosphericTesting {...commonProps} atmosphericReadings={[]} setAtmosphericReadings={() => {}} />
        )}
        {currentSection === 'registry' && (
          <EntryRegistry {...commonProps} atmosphericReadings={[]} />
        )}
      </Suspense>
    );
  };

  // Icônes des sections
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '20px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px'
    }}>
      
      {/* En-tête principal */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '20px',
        padding: isMobile ? '24px' : '32px',
        border: '2px solid #374151',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Gradient de fond */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : '0'
          }}>
            <div>
              <h1 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '900',
                color: 'white',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <Shield style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#3b82f6' }} />
                {texts.title}
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: isMobile ? '14px' : '16px',
                margin: 0,
                maxWidth: isMobile ? 'none' : '600px'
              }}>
                {texts.subtitle}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
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
                gap: '8px'
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
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  onClick={savePermitData}
                  disabled={isLoading}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    padding: '12px 20px',
                    fontSize: '14px',
                    minWidth: '120px',
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
              </div>
            </div>
          </div>
          
          {/* Informations permis */}
          {permitData.permit_number && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid #374151'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
                gap: '16px',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? 'Numéro de permis' : 'Permit Number'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {permitData.permit_number}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? 'Province' : 'Province'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {PROVINCIAL_REGULATIONS[selectedProvince].authority} ({selectedProvince})
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>
                    {language === 'fr' ? "Date d'émission" : 'Issue Date'}
                  </span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>
                    {permitData.issue_date ? new Date(permitData.issue_date).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CSS pour l'animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {/* Navigation des sections */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        border: '2px solid #374151',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px'
        }}>
          {(['site', 'rescue', 'atmospheric', 'registry'] as const).map((section, index) => {
            const Icon = getSectionIcon(section);
            const isActive = currentSection === section;
            const isCompleted = validateSection(section);
            
            return (
              <button
                key={section}
                onClick={() => navigateToSection(section)}
                style={{
                  padding: isMobile ? '16px 12px' : '20px 16px',
                  backgroundColor: isActive ? '#3b82f6' : isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(75, 85, 99, 0.3)',
                  border: `2px solid ${isActive ? '#60a5fa' : isCompleted ? '#10b981' : '#6b7280'}`,
                  borderRadius: '12px',
                  color: isActive ? 'white' : isCompleted ? '#86efac' : '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
              >
                {/* Indicateur de progression */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10b981' : 'rgba(107, 114, 128, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCompleted ? (
                    <CheckCircle style={{ width: '12px', height: '12px', color: 'white' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <Icon style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px' }} />
                <span style={{ textAlign: 'center', lineHeight: 1.2 }}>
                  {texts.sections[section]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de la section active avec Suspense */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '16px',
        border: '2px solid #374151',
        minHeight: '600px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ padding: isMobile ? '20px' : '28px' }}>
          {renderSectionContent()}
        </div>
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
            width: 'auto'
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
                backgroundColor: currentSection === section ? '#3b82f6' : validateSection(section) ? '#10b981' : '#6b7280',
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
              width: 'auto'
            }}
          >
            {texts.navigation.next}
            <ChevronRight style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpace;
