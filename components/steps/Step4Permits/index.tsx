"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge,
  ArrowRight
} from 'lucide-react';

// =================== DÉTECTION MOBILE ET STYLES ===================
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
    overflow: 'hidden' as const,
    marginBottom: isMobile ? '16px' : '24px'
  },
  permitCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '12px' : '20px',
    padding: isMobile ? '20px' : '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const
  }
};

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type PermitStatus = 'available' | 'in-progress' | 'completed' | 'locked';

interface Step4PermitsProps {
  selectedProvince: ProvinceCode;
  language: 'fr' | 'en';
  onDataChange: (data: any) => void;
  formData: any;
}

interface PermitModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  iconEmoji: string;
  color: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number;
  status: PermitStatus;
  completionRate: number;
  regulations: string[];
  features: string[];
}

interface ConfinedSpaceComponent {
  default: React.ComponentType<any>;
}

// =================== DONNÉES PROVINCIALES ===================
const PROVINCES_DATA = {
  QC: { name: 'Québec', authority: 'CNESST', color: '#1e40af' },
  ON: { name: 'Ontario', authority: 'MOL', color: '#dc2626' },
  BC: { name: 'Colombie-Britannique', authority: 'WorkSafeBC', color: '#059669' },
  AB: { name: 'Alberta', authority: 'Alberta OHS', color: '#7c2d12' },
  SK: { name: 'Saskatchewan', authority: 'Saskatchewan OHS', color: '#a21caf' },
  MB: { name: 'Manitoba', authority: 'Manitoba Workplace Safety', color: '#ea580c' },
  NB: { name: 'Nouveau-Brunswick', authority: 'WorkSafeNB', color: '#0891b2' },
  NS: { name: 'Nouvelle-Écosse', authority: 'Workers\' Compensation Board', color: '#be123c' },
  PE: { name: 'Île-du-Prince-Édouard', authority: 'PEI Workers Compensation Board', color: '#9333ea' },
  NL: { name: 'Terre-Neuve-et-Labrador', authority: 'WorkplaceNL', color: '#0d9488' }
};

// =================== GÉNÉRATION DES MODULES ===================
const getPermitModules = (language: 'fr' | 'en'): PermitModule[] => [
  {
    id: 'confined-space',
    name: language === 'en' ? 'Confined Space Entry Permit' : 'Permis d\'Espace Clos',
    description: language === 'en' 
      ? 'Confined space entry permit with atmospheric testing and continuous monitoring'
      : 'Permis d\'entrée en espace clos avec tests atmosphériques et surveillance continue',
    icon: Home,
    iconEmoji: '🏠',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 45,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en' 
      ? ['OHSA Confined Space', 'CSA Z1006', 'Provincial Regs']
      : ['RSST Art. 302-317', 'CSA Z1006', 'CNESST'],
    features: language === 'en' ? [
      '4-gas atmospheric testing',
      'Real-time Bluetooth monitoring',
      'Automatic regulatory timer',
      'Timestamped electronic signatures',
      'Geolocated photos',
      'Integrated rescue plan'
    ] : [
      'Tests atmosphériques 4-gaz',
      'Surveillance Bluetooth temps réel',
      'Timer réglementaire automatique',
      'Signatures électroniques horodatées',
      'Photos géolocalisées',
      'Plan de sauvetage intégré'
    ]
  },
  {
    id: 'electrical-work',
    name: language === 'en' ? 'Electrical Work Permit' : 'Permis Travaux Électriques',
    description: language === 'en'
      ? 'Electrical work permit with LOTO lockout and VAT verification'
      : 'Permis pour travaux électriques avec consignation LOTO et vérification VAT',
    icon: Zap,
    iconEmoji: '⚡',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 35,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en'
      ? ['CSA Z462', 'NFPA 70E', 'Provincial Electrical Code']
      : ['CSA Z462', 'RSST Art. 185', 'NFPA 70E'],
    features: language === 'en' ? [
      'Complete LOTO lockout',
      'Voltage absence testing (VAT)',
      'Arc flash incident energy calculation',
      'Required arc-flash PPE',
      'Automatic safety distances'
    ] : [
      'Consignation LOTO complète',
      'Vérification absence tension (VAT)',
      'Calcul énergie incidente arc',
      'EPI arc-flash requis',
      'Distances sécurité automatiques'
    ]
  },
  {
    id: 'excavation',
    name: language === 'en' ? 'Excavation Permit' : 'Permis d\'Excavation',
    description: language === 'en'
      ? 'Excavation work permit with soil analysis and slope protection'
      : 'Permis pour travaux d\'excavation avec analyse sol et protection talus',
    icon: Construction,
    iconEmoji: '🏗️',
    color: '#d97706',
    riskLevel: 'high',
    estimatedTime: 40,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en'
      ? ['OHSA Excavation', 'CSA Z271', 'Call Before You Dig']
      : ['RSST Art. 3.20', 'CSA Z271', 'Info-Excavation'],
    features: language === 'en' ? [
      'Public utilities location',
      'Soil stability analysis',
      'Slope protection calculation',
      'Emergency evacuation plan',
      'Continuous monitoring'
    ] : [
      'Localisation services publics',
      'Analyse stabilité du sol',
      'Calcul protection talus',
      'Plan évacuation d\'urgence',
      'Surveillance continue'
    ]
  },
  {
    id: 'height-work',
    name: language === 'en' ? 'Work at Height Permit' : 'Permis Travail en Hauteur',
    description: language === 'en'
      ? 'Work at height permit with fall protection and rescue plan'
      : 'Permis pour travaux en hauteur avec protection antichute et plan sauvetage',
    icon: Building,
    iconEmoji: '🏢',
    color: '#7c3aed',
    riskLevel: 'critical',
    estimatedTime: 50,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en'
      ? ['OHSA Fall Protection', 'CSA Z259', 'Height Safety Regs']
      : ['RSST Art. 347', 'CSA Z259', 'CNESST Hauteur'],
    features: language === 'en' ? [
      'Complete fall protection',
      'Certified anchor points',
      'Height rescue plan',
      'Weather verification',
      'On-site rescue team'
    ] : [
      'Protection antichute complète',
      'Points ancrage certifiés',
      'Plan sauvetage en hauteur',
      'Vérification météo',
      'Équipe sauvetage sur site'
    ]
  },
  {
    id: 'hot-work',
    name: language === 'en' ? 'Hot Work Permit' : 'Permis Travail à Chaud',
    description: language === 'en'
      ? 'Hot work permit for welding/cutting with fire watch and post-work timer'
      : 'Permis pour soudage/coupage avec surveillance incendie et timer post-travaux',
    icon: Flame,
    iconEmoji: '🔥',
    color: '#ea580c',
    riskLevel: 'critical',
    estimatedTime: 30,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en'
      ? ['NFPA 51B', 'Fire Prevention Code', 'Provincial Fire Regs']
      : ['NFPA 51B', 'RSST Art. 323', 'Code prévention incendie'],
    features: language === 'en' ? [
      '60min post-work fire watch',
      'Automatic regulatory timer',
      'Specialized fire extinguishers required',
      'Combustible clearance zone',
      'Qualified fire guard'
    ] : [
      'Surveillance incendie 60min post-travaux',
      'Timer automatique réglementaire',
      'Extincteurs spécialisés requis',
      'Zone dégagement combustibles',
      'Garde-feu qualifié'
    ]
  },
  {
    id: 'lifting',
    name: language === 'en' ? 'Lifting Operations Permit' : 'Permis Opérations Levage',
    description: language === 'en'
      ? 'Lifting operations permit with load calculations and equipment inspection'
      : 'Permis pour opérations de levage avec calcul charges et inspection équipements',
    icon: Wrench,
    iconEmoji: '🏗️',
    color: '#059669',
    riskLevel: 'high',
    estimatedTime: 55,
    status: 'available',
    completionRate: 0,
    regulations: language === 'en'
      ? ['ASME B30', 'CSA B335', 'Provincial Lifting Regs']
      : ['ASME B30', 'CSA B335', 'RSST Art. 260-290'],
    features: language === 'en' ? [
      'Safe working load calculation',
      'Pre-use inspection',
      'Detailed lifting plan',
      'Certified signaler required',
      'Automatic safety perimeter'
    ] : [
      'Calcul charge de travail sécuritaire',
      'Inspection pré-utilisation',
      'Plan de levage détaillé',
      'Signaleur certifié requis',
      'Périmètre sécurité automatique'
    ]
  }
];

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => ({
  fr: {
    title: "Permis de Travail & Autorisations Légales",
    subtitle: "Sélectionnez et configurez vos permis de travail avec conformité réglementaire complète",
    selectPermit: "Sélectionner le Type de Permis",
    backToSelection: "← Retour à la Sélection",
    estimatedTime: "Temps Estimé",
    minutes: "min",
    riskLevel: "Niveau de Risque",
    regulations: "Réglementations",
    features: "Fonctionnalités Clés",
    startPermit: "Démarrer Permis",
    continuePermit: "Continuer",
    completed: "Complété",
    inProgress: "En Cours",
    moduleInDevelopment: "Module en Développement",
    plannedFeatures: "🚀 Fonctionnalités Prévues :",
    modulesAvailable: "Modules Disponibles",
    completedCount: "Complétés",
    inProgressCount: "En Cours",
    province: "Province",
    provinceSelection: "🍁 Sélection de la Province",
    selectedProvince: "Province sélectionnée :",
    competentAuthority: "Autorité compétente :",
    autoAdaptation: "Les permis seront adaptés automatiquement aux réglementations de cette province",
    importantInfo: "ℹ️ Information Importante",
    complianceText: "Tous les permis sont conçus pour respecter les réglementations provinciales en vigueur.",
    featuresText: "Chaque module intègre les fonctionnalités avancées requises : signatures électroniques, horodatage sécurisé, photos géolocalisées, et archivage automatique dans Supabase.",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    }
  },
  en: {
    title: "Work Permits & Legal Authorizations",
    subtitle: "Select and configure work permits with full regulatory compliance",
    selectPermit: "Select Permit Type",
    backToSelection: "← Back to Selection",
    estimatedTime: "Estimated Time",
    minutes: "min",
    riskLevel: "Risk Level",
    regulations: "Regulations",
    features: "Key Features",
    startPermit: "Start Permit",
    continuePermit: "Continue",
    completed: "Completed",
    inProgress: "In Progress",
    moduleInDevelopment: "Module in Development",
    plannedFeatures: "🚀 Planned Features:",
    modulesAvailable: "Available Modules",
    completedCount: "Completed",
    inProgressCount: "In Progress",
    province: "Province",
    provinceSelection: "🍁 Province Selection",
    selectedProvince: "Selected province:",
    competentAuthority: "Competent authority:",
    autoAdaptation: "Permits will be automatically adapted to this province's regulations",
    importantInfo: "ℹ️ Important Information",
    complianceText: "All permits are designed to comply with current provincial regulations.",
    featuresText: "Each module integrates required advanced features: electronic signatures, secure timestamping, geolocated photos, and automatic archiving in Supabase.",
    riskLevels: {
      critical: "🔴 Critical",
      high: "🟠 High",
      medium: "🟡 Medium",
      low: "🟢 Low"
    }
  }
})[language];

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  selectedProvince,
  language,
  onDataChange,
  formData
}) => {
  const texts = getTexts(language);
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [currentProvince, setCurrentProvince] = useState<ProvinceCode>(selectedProvince);
  const [isLoading, setIsLoading] = useState(false);
  const [confinedSpaceComponent, setConfinedSpaceComponent] = useState<ConfinedSpaceComponent | null>(null);
  const [permitModules, setPermitModules] = useState<PermitModule[]>([]);

  // =================== EFFECTS ===================
  useEffect(() => {
    setPermitModules(getPermitModules(language));
  }, [language, selectedProvince, formData]);

  // =================== HANDLERS ===================
  const handlePermitSelect = async (permitId: string) => {
    setIsLoading(true);
    setSelectedPermit(permitId);
    
    console.log(`Permis sélectionné: ${permitId}`);
    
    // Simulation de chargement pour UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Traitement spécial pour ConfinedSpace
    if (permitId === 'confined-space') {
      try {
        console.log('Tentative de chargement ConfinedSpace...');
        const ConfinedSpaceModule = await import('./ConfinedSpace/index');
        console.log('Module ConfinedSpace importé avec succès:', !!ConfinedSpaceModule.default);
        setConfinedSpaceComponent(ConfinedSpaceModule);
      } catch (error) {
        console.log('Impossible de charger ConfinedSpace, utilisation du fallback:', error);
        setConfinedSpaceComponent(null);
      }
    }
    
    setIsLoading(false);
  };

  const handleBackToSelection = () => {
    setSelectedPermit(null);
    setConfinedSpaceComponent(null);
  };

  const handleSavePermit = (data: any) => {
    console.log('Sauvegarde du permis:', data);
    
    const updatedData = {
      ...formData,
      permitModules: {
        ...formData.permitModules,
        [selectedPermit!]: {
          ...data,
          status: 'in-progress',
          progress: 50,
          lastUpdated: new Date().toISOString()
        }
      }
    };
    
    onDataChange(updatedData);
  };

  const handleSubmitPermit = (data: any) => {
    console.log('Soumission du permis:', data);
    
    const updatedData = {
      ...formData,
      permitModules: {
        ...formData.permitModules,
        [selectedPermit!]: {
          ...data,
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString()
        }
      }
    };
    
    onDataChange(updatedData);
    handleBackToSelection();
  };

  // =================== STATS ===================
  const stats = {
    total: permitModules.length,
    completed: permitModules.filter(m => m.status === 'completed').length,
    inProgress: permitModules.filter(m => m.status === 'in-progress').length,
    available: permitModules.filter(m => m.status === 'available').length
  };

  // =================== RENDU CONDITIONNEL ===================
  // Affichage du module ConfinedSpace
  if (selectedPermit === 'confined-space' && confinedSpaceComponent) {
    const ConfinedSpaceModule = confinedSpaceComponent.default;
    
    return (
      <div style={styles.container}>
        {/* Header de retour */}
        <div style={{
          ...styles.card,
          marginBottom: '16px',
          padding: '16px 24px'
        }}>
          <button
            onClick={handleBackToSelection}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              width: 'auto',
              padding: '12px 20px'
            }}
          >
            <ChevronRight style={{ width: '18px', height: '18px', transform: 'rotate(180deg)' }} />
            {texts.backToSelection}
          </button>
        </div>
        
        {/* Module ConfinedSpace */}
        <ConfinedSpaceModule
          province={currentProvince}
          language={language}
          onSave={handleSavePermit}
          onSubmit={handleSubmitPermit}
          onCancel={handleBackToSelection}
          initialData={formData?.permitModules?.['confined-space'] || {}}
        />
      </div>
    );
  }
  
  // Fallback pour autres modules ou loading
  if (selectedPermit) {
    const permit = permitModules.find(m => m.id === selectedPermit);
    
    return (
      <div style={styles.container}>
        {/* Header avec loading ou fallback */}
        <div style={{
          ...styles.card,
          textAlign: 'center' as const,
          padding: isMobile ? '32px 20px' : '48px 32px'
        }}>
          {isLoading ? (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #374151',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px'
              }} />
              <h2 style={{ color: 'white', marginBottom: '16px' }}>
                {language === 'en' ? 'Loading module...' : 'Chargement du module...'}
              </h2>
            </>
          ) : (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#374151',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                {permit && <permit.icon style={{ width: '40px', height: '40px', color: '#9ca3af' }} />}
              </div>
              <h2 style={{ color: 'white', marginBottom: '16px' }}>
                {texts.moduleInDevelopment}
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                {language === 'en' 
                  ? 'This module is currently under development and will be available soon.'
                  : 'Ce module est actuellement en cours de développement et sera disponible prochainement.'
                }
              </p>
              <button
                onClick={handleBackToSelection}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  width: 'auto',
                  padding: '12px 24px'
                }}
              >
                <ChevronRight style={{ width: '18px', height: '18px', transform: 'rotate(180deg)' }} />
                {texts.backToSelection}
              </button>
            </>
          )}
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // =================== INTERFACE PRINCIPALE ===================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(245, 158, 11, 0.05))',
          zIndex: 0
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '16px' : '20px', 
            marginBottom: isMobile ? '20px' : '24px' 
          }}>
            <div style={{
              width: isMobile ? '48px' : '60px',
              height: isMobile ? '48px' : '60px',
              background: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(220, 38, 38, 0.3)'
            }}>
              <Shield style={{ 
                width: isMobile ? '24px' : '30px', 
                height: isMobile ? '24px' : '30px', 
                color: '#f87171' 
              }} />
            </div>
            <div>
              <h2 style={{
                fontSize: isMobile ? '20px' : '28px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px',
                lineHeight: 1.2
              }}>
                📄 {texts.title}
              </h2>
              <p style={{
                color: '#d1d5db',
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: 1.5
              }}>
                {texts.subtitle}
              </p>
            </div>
          </div>
          
          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '20px',
            marginTop: '24px'
          }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center' as const
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: 'white',
                marginBottom: '4px'
              }}>
                {stats.total}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {texts.modulesAvailable}
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center' as const
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#10b981',
                marginBottom: '4px'
              }}>
                {stats.completed}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {texts.completedCount}
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center' as const
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#fbbf24',
                marginBottom: '4px'
              }}>
                {stats.inProgress}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {texts.inProgressCount}
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center' as const
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#60a5fa',
                marginBottom: '4px'
              }}>
                {currentProvince}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                {texts.province}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection province */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <MapPin style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
          <h3 style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {texts.provinceSelection}
          </h3>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {Object.entries(PROVINCES_DATA).map(([code, data]) => (
            <button
              key={code}
              onClick={() => setCurrentProvince(code as ProvinceCode)}
              style={{
                padding: isMobile ? '12px 8px' : '16px 12px',
                borderRadius: '12px',
                border: currentProvince === code 
                  ? '2px solid #3b82f6' 
                  : '2px solid #374151',
                backgroundColor: currentProvince === code 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(17, 24, 39, 0.6)',
                color: currentProvince === code ? 'white' : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                textAlign: 'center' as const
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>{data.name}</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.8 }}>{data.authority}</div>
            </button>
          ))}
        </div>
        
        <div style={{
          padding: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px'
        }}>
          <div style={{
            color: '#93c5fd',
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: 1.6
          }}>
            <strong>{texts.selectedProvince}</strong> {PROVINCES_DATA[currentProvince].name} ({currentProvince})
            <br />
            <strong>{texts.competentAuthority}</strong> {PROVINCES_DATA[currentProvince].authority}
            <br />
            <span style={{ fontSize: isMobile ? '12px' : '13px', opacity: 0.8 }}>
              {texts.autoAdaptation}
            </span>
          </div>
        </div>
      </div>

      {/* Grille des modules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {permitModules.map(permit => (
          <div 
            key={permit.id}
            style={styles.permitCard}
            onClick={() => handlePermitSelect(permit.id)}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${permit.color}10, ${permit.color}05)`,
              borderRadius: isMobile ? '12px' : '20px',
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '16px', 
                marginBottom: '16px' 
              }}>
                <div style={{
                  width: isMobile ? '48px' : '60px',
                  height: isMobile ? '48px' : '60px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '20px' : '28px',
                  background: `${permit.color}20`,
                  border: `2px solid ${permit.color}30`
                }}>
                  {permit.iconEmoji}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '8px',
                    lineHeight: 1.3
                  }}>
                    {permit.name}
                  </h4>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '13px' : '14px',
                    lineHeight: 1.4
                  }}>
                    {permit.description}
                  </p>
                </div>

                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: '1px solid',
                  background: 'rgba(107, 114, 128, 0.2)', 
                  color: '#d1d5db', 
                  borderColor: 'rgba(107, 114, 128, 0.3)'
                }}>
                  Disponible
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>{texts.riskLevel}:</span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: `${permit.color}20`,
                    color: permit.color,
                    border: `1px solid ${permit.color}30`
                  }}>
                    {texts.riskLevels[permit.riskLevel]}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>{texts.estimatedTime}:</span>
                  <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '600' }}>
                    {permit.estimatedTime} {texts.minutes}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>
                  {texts.regulations}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {permit.regulations.slice(0, 2).map((reg, index) => (
                    <span 
                      key={index}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {reg}
                    </span>
                  ))}
                  {permit.regulations.length > 2 && (
                    <span style={{
                      padding: '4px 8px',
                      background: 'rgba(107, 114, 128, 0.2)',
                      color: '#d1d5db',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '500',
                      border: '1px solid rgba(107, 114, 128, 0.3)'
                    }}>
                      +{permit.regulations.length - 2}
                    </span>
                  )}
                </div>
              </div>

              <button
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600'
                }}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
                {texts.startPermit}
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informatif */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px' 
        }}>
          <AlertTriangle style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
          <h3 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {texts.importantInfo}
          </h3>
        </div>
        <p style={{
          color: '#d1d5db',
          fontSize: isMobile ? '13px' : '14px',
          lineHeight: 1.6,
          margin: 0
        }}>
          {texts.complianceText}
          <br />
          {language === 'en' 
            ? `Selected province: **${PROVINCES_DATA[currentProvince].name} (${currentProvince})** - ${PROVINCES_DATA[currentProvince].authority}.`
            : `Province sélectionnée : **${PROVINCES_DATA[currentProvince].name} (${currentProvince})** - ${PROVINCES_DATA[currentProvince].authority}.`
          }
          <br /><br />
          {texts.featuresText}
        </p>
      </div>
    </div>
  );
};

export default Step4Permits;
