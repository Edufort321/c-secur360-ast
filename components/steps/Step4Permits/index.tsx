"use client";

import React, { useState } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge,
  ArrowRight
} from 'lucide-react';

// ✅ CORRECTION : Pas d'import pour éviter les erreurs de build
// Le composant sera défini plus bas de manière conditionnelle

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

// =================== INTERFACES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
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
  status: 'available' | 'in-progress' | 'completed' | 'locked';
  completionRate: number;
  regulations: string[];
  features: string[];
  component?: React.ComponentType<any>;
}

// =================== CONFIGURATION DES MODULES DE PERMIS ===================
// Définition conditionnelle du composant ConfinedSpace
let ConfinedSpaceComponent: React.ComponentType<any> | null = null;

// Tentative de chargement dynamique du composant
if (typeof window !== 'undefined') {
  try {
    // Import dynamique côté client seulement
    import('./permits/ConfinedSpace/index')
      .then(module => {
        ConfinedSpaceComponent = module.default;
      })
      .catch(() => {
        console.log('ConfinedSpace module not available');
      });
  } catch (error) {
    console.log('ConfinedSpace import error:', error);
  }
}

const PERMIT_MODULES: PermitModule[] = [
  {
    id: 'confined-space',
    name: 'Permis d\'Espace Clos',
    description: 'Permis d\'entrée en espace clos avec tests atmosphériques et surveillance continue',
    icon: Home,
    iconEmoji: '🏠',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 45,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 302-317', 'CSA Z1006', 'CNESST'],
    features: [
      'Tests atmosphériques 4-gaz',
      'Surveillance Bluetooth temps réel',
      'Timer réglementaire automatique',
      'Signatures électroniques horodatées',
      'Photos géolocalisées',
      'Plan de sauvetage intégré'
    ],
    component: undefined // Sera défini dynamiquement côté client
  },
  {
    id: 'electrical-work',
    name: 'Permis Travaux Électriques',
    description: 'Permis pour travaux électriques avec consignation LOTO et vérification VAT',
    icon: Zap,
    iconEmoji: '⚡',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 35,
    status: 'available',
    completionRate: 0,
    regulations: ['CSA Z462', 'RSST Art. 185', 'NFPA 70E'],
    features: [
      'Consignation LOTO complète',
      'Vérification absence tension (VAT)',
      'Calcul énergie incidente arc',
      'EPI arc-flash requis',
      'Distances sécurité automatiques'
    ]
  },
  {
    id: 'excavation',
    name: 'Permis d\'Excavation',
    description: 'Permis pour travaux d\'excavation avec analyse sol et protection talus',
    icon: Construction,
    iconEmoji: '🏗️',
    color: '#d97706',
    riskLevel: 'high',
    estimatedTime: 40,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 3.20', 'CSA Z271', 'Info-Excavation'],
    features: [
      'Localisation services publics',
      'Analyse stabilité du sol',
      'Calcul protection talus',
      'Plan évacuation d\'urgence',
      'Surveillance continue'
    ]
  },
  {
    id: 'height-work',
    name: 'Permis Travail en Hauteur',
    description: 'Permis pour travaux en hauteur avec protection antichute et plan sauvetage',
    icon: Building,
    iconEmoji: '🏢',
    color: '#7c3aed',
    riskLevel: 'critical',
    estimatedTime: 50,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 347', 'CSA Z259', 'CNESST Hauteur'],
    features: [
      'Protection antichute complète',
      'Points ancrage certifiés',
      'Plan sauvetage en hauteur',
      'Vérification météo',
      'Équipe sauvetage sur site'
    ]
  },
  {
    id: 'hot-work',
    name: 'Permis Travail à Chaud',
    description: 'Permis pour soudage/coupage avec surveillance incendie et timer post-travaux',
    icon: Flame,
    iconEmoji: '🔥',
    color: '#ea580c',
    riskLevel: 'critical',
    estimatedTime: 30,
    status: 'available',
    completionRate: 0,
    regulations: ['NFPA 51B', 'RSST Art. 323', 'Code prévention incendie'],
    features: [
      'Surveillance incendie 60min post-travaux',
      'Timer automatique réglementaire',
      'Extincteurs spécialisés requis',
      'Zone dégagement combustibles',
      'Garde-feu qualifié'
    ]
  },
  {
    id: 'lifting',
    name: 'Permis Opérations Levage',
    description: 'Permis pour opérations de levage avec calcul charges et inspection équipements',
    icon: Wrench,
    iconEmoji: '🏗️',
    color: '#059669',
    riskLevel: 'high',
    estimatedTime: 55,
    status: 'available',
    completionRate: 0,
    regulations: ['ASME B30', 'CSA B335', 'RSST Art. 260-290'],
    features: [
      'Calcul charge de travail sécuritaire',
      'Inspection pré-utilisation',
      'Plan de levage détaillé',
      'Signaleur certifié requis',
      'Périmètre sécurité automatique'
    ]
  }
];

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
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
      riskLevels: {
        critical: "🔴 Critical",
        high: "🟠 High",
        medium: "🟡 Medium",
        low: "🟢 Low"
      }
    };
  }
  
  return {
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
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    }
  };
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province = 'QC',
  userRole,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  const texts = getTexts(language);
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province as ProvinceCode || 'QC');

  // États pour le chargement dynamique
  const [loadedComponents, setLoadedComponents] = useState<{[key: string]: React.ComponentType<any>}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Chargement dynamique du composant au moment de la sélection
  const loadPermitComponent = async (permitId: string) => {
    if (permitId === 'confined-space' && !loadedComponents['confined-space']) {
      setIsLoading(true);
      try {
        const module = await import('./permits/ConfinedSpace/index');
        setLoadedComponents(prev => ({
          ...prev,
          'confined-space': module.default
        }));
      } catch (error) {
        console.log('Impossible de charger le module ConfinedSpace:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Mettre à jour les statuts des permis selon les données sauvegardées
  const [permits, setPermits] = useState<PermitModule[]>(() => {
    if (formData.permits?.completed) {
      return PERMIT_MODULES.map(permit => ({
        ...permit,
        status: formData.permits.completed.includes(permit.id) ? 'completed' : 
                formData.permits.inProgress?.includes(permit.id) ? 'in-progress' : 'available',
        completionRate: formData.permits.completion?.[permit.id] || 0
      }));
    }
    return PERMIT_MODULES;
  });

  const handlePermitSelect = async (permitId: string) => {
    setSelectedPermit(permitId);
    await loadPermitComponent(permitId);
    console.log(`Chargement du permis: ${permitId}`);
  };

  const handleBackToSelection = () => {
    setSelectedPermit(null);
  };

  const updatePermitStatus = (permitId: string, status: PermitModule['status'], completionRate: number = 0) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, status, completionRate }
        : permit
    );
    setPermits(updatedPermits);

    // Sauvegarder dans formData
    const completedPermits = updatedPermits.filter(p => p.status === 'completed').map(p => p.id);
    const inProgressPermits = updatedPermits.filter(p => p.status === 'in-progress').map(p => p.id);
    const completion = Object.fromEntries(updatedPermits.map(p => [p.id, p.completionRate]));

    onDataChange('permits', {
      completed: completedPermits,
      inProgress: inProgressPermits,
      completion,
      total: permits.length
    });
  };

  // Si un permis est sélectionné, charger son composant
  if (selectedPermit) {
    const permit = permits.find(p => p.id === selectedPermit);
    const LoadedComponent = loadedComponents[selectedPermit];
    
    // Afficher le loading pendant le chargement
    if (isLoading) {
      return (
        <div style={styles.container}>
          <div style={{ ...styles.card, textAlign: 'center', padding: isMobile ? '40px 20px' : '60px 40px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(59, 130, 246, 0.3)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>
              Chargement du module...
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Préparation de {permit?.name}
            </p>
          </div>
        </div>
      );
    }
    
    if (LoadedComponent) {
      // Rendu du composant spécifique du permis
      const PermitComponent = LoadedComponent as React.ComponentType<{
        province: ProvinceCode;
        language: 'fr' | 'en';
        onSave: (data: any) => void;
        onSubmit: (data: any) => void;
        onCancel: () => void;
        initialData?: any;
      }>;
      
      return (
        <div style={{ ...styles.container }}>
          {/* Header de retour avec style cohérent */}
          <div style={{ ...styles.card, marginBottom: '20px' }}>
            <button
              onClick={handleBackToSelection}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: isMobile ? '12px 16px' : '16px 20px',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              <ArrowRight style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
              {texts.backToSelection}
            </button>
          </div>

          {/* ✅ CORRECTION : Composant de permis sans wrapper qui écrase les styles */}
          <PermitComponent
            province={selectedProvince}
            language={language}
            onSave={(data: any) => {
              console.log('Permis sauvegardé:', data);
              updatePermitStatus(permit.id, 'in-progress', 50);
            }}
            onSubmit={(data: any) => {
              console.log('Permis soumis:', data);
              updatePermitStatus(permit.id, 'completed', 100);
              handleBackToSelection();
            }}
            onCancel={handleBackToSelection}
            initialData={formData[`permit_${permit.id}`] || {}}
          />
        </div>
      );
    } else {
      // Fallback pour les permis sans composant
      return (
        <div style={styles.container}>
          {/* Header de retour avec style cohérent */}
          <div style={{ ...styles.card, marginBottom: '20px' }}>
            <button
              onClick={handleBackToSelection}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                width: 'auto',
                padding: isMobile ? '12px 16px' : '16px 20px',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              <ArrowRight style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
              {texts.backToSelection}
            </button>
          </div>
          
          {/* En-tête du permis */}
          <div style={styles.headerCard}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${permit?.color}10, ${permit?.color}05)`,
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '20px' }}>
                <div style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '28px' : '36px',
                  background: `${permit?.color}20`,
                  border: `2px solid ${permit?.color}40`,
                  boxShadow: `0 8px 32px ${permit?.color}30`
                }}>
                  {permit?.iconEmoji}
                </div>
                <div>
                  <h2 style={{
                    fontSize: isMobile ? '20px' : '28px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '8px',
                    lineHeight: 1.2
                  }}>
                    {permit?.name}
                  </h2>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: 1.5,
                    maxWidth: '600px'
                  }}>
                    {permit?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu en développement */}
          <div style={{ ...styles.card, textAlign: 'center', padding: isMobile ? '32px 20px' : '48px 32px' }}>
            <div style={{
              width: isMobile ? '80px' : '120px',
              height: isMobile ? '80px' : '120px',
              background: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '2px solid rgba(245, 158, 11, 0.3)'
            }}>
              <Construction style={{ 
                width: isMobile ? '40px' : '60px', 
                height: isMobile ? '40px' : '60px', 
                color: '#fbbf24' 
              }} />
            </div>
            
            <h3 style={{
              fontSize: isMobile ? '20px' : '28px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '16px'
            }}>
              Module en Développement
            </h3>
            
            <p style={{
              color: '#d1d5db',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Le module <strong style={{ color: '#60a5fa' }}>{permit?.name}</strong> est actuellement en développement pour la province <strong style={{ color: '#34d399' }}>{PROVINCES_DATA[selectedProvince].name}</strong>. 
              Il intégrera toutes les fonctionnalités avancées prévues selon les réglementations de {PROVINCES_DATA[selectedProvince].authority}.
            </p>

            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '32px',
              maxWidth: '500px',
              margin: '0 auto 32px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '20px'
              }}>
                🚀 Fonctionnalités Prévues :
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                {permit?.features.map((feature, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#d1d5db'
                  }}>
                    <CheckCircle style={{ 
                      width: '16px', 
                      height: '16px', 
                      color: '#10b981', 
                      flexShrink: 0 
                    }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBackToSelection}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                width: 'auto',
                padding: isMobile ? '12px 24px' : '16px 32px',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              Retourner à la Sélection
            </button>
          </div>
        </div>
      );
    }
  }

  // Vue principale - Sélection des permis
  return (
    <div style={styles.container}>
      
      {/* Header avec style cohérent des autres étapes */}
      <div style={styles.headerCard}>
        {/* Gradient overlay */}
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
          
          {/* Statistiques globales */}
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
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: 'white',
                marginBottom: '4px'
              }}>
                {permits.length}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                Modules Disponibles
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#10b981',
                marginBottom: '4px'
              }}>
                {permits.filter(p => p.status === 'completed').length}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                Complétés
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#fbbf24',
                marginBottom: '4px'
              }}>
                {permits.filter(p => p.status === 'in-progress').length}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                En Cours
              </div>
            </div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: '700', 
                color: '#60a5fa',
                marginBottom: '4px'
              }}>
                {selectedProvince}
              </div>
              <div style={{ 
                color: '#9ca3af', 
                fontSize: isMobile ? '12px' : '14px'
              }}>
                Province
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section sélection province avec style cohérent */}
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
            🍁 Sélection de la Province
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
              onClick={() => setSelectedProvince(code as ProvinceCode)}
              style={{
                padding: isMobile ? '12px 8px' : '16px 12px',
                borderRadius: '12px',
                border: selectedProvince === code 
                  ? '2px solid #3b82f6' 
                  : '2px solid #374151',
                backgroundColor: selectedProvince === code 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(17, 24, 39, 0.6)',
                color: selectedProvince === code ? 'white' : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedProvince !== code) {
                  e.currentTarget.style.borderColor = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.6)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProvince !== code) {
                  e.currentTarget.style.borderColor = '#374151';
                  e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.6)';
                  e.currentTarget.style.color = '#d1d5db';
                }
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
            <strong>Province sélectionnée :</strong> {PROVINCES_DATA[selectedProvince].name} ({selectedProvince})
            <br />
            <strong>Autorité compétente :</strong> {PROVINCES_DATA[selectedProvince].authority}
            <br />
            <span style={{ fontSize: isMobile ? '12px' : '13px', opacity: 0.8 }}>
              Les permis seront adaptés automatiquement aux réglementations de cette province
            </span>
          </div>
        </div>
      </div>

      {/* Grille des modules de permis avec style cohérent */}
      <div style={styles.grid3}>
        {permits.map(permit => (
          <div 
            key={permit.id}
            style={{
              ...styles.permitCard,
              transform: 'scale(1)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => handlePermitSelect(permit.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            }}
          >
            {/* Gradient overlay */}
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
              {/* Header du module */}
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
                  border: `2px solid ${permit.color}30`,
                  transition: 'all 0.3s ease'
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
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {permit.description}
                  </p>
                </div>

                {/* Statut */}
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: '1px solid',
                  ...(permit.status === 'completed' 
                    ? { 
                        background: 'rgba(16, 185, 129, 0.2)', 
                        color: '#6ee7b7', 
                        borderColor: 'rgba(16, 185, 129, 0.3)' 
                      }
                    : permit.status === 'in-progress' 
                    ? { 
                        background: 'rgba(245, 158, 11, 0.2)', 
                        color: '#fcd34d', 
                        borderColor: 'rgba(245, 158, 11, 0.3)' 
                      }
                    : { 
                        background: 'rgba(107, 114, 128, 0.2)', 
                        color: '#d1d5db', 
                        borderColor: 'rgba(107, 114, 128, 0.3)' 
                      })
                }}>
                  {permit.status === 'completed' ? texts.completed :
                   permit.status === 'in-progress' ? texts.inProgress :
                   'Disponible'}
                </div>
              </div>

              {/* Métadonnées avec style cohérent */}
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

              {/* Réglementations */}
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

              {/* Action avec style cohérent */}
              <button
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600'
                }}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
                {permit.status === 'in-progress' ? texts.continuePermit : texts.startPermit}
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informatif avec style cohérent */}
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
            ℹ️ Information Importante
          </h3>
        </div>
        <p style={{
          color: '#d1d5db',
          fontSize: isMobile ? '13px' : '14px',
          lineHeight: 1.6,
          margin: 0
        }}>
          Tous les permis sont conçus pour respecter les réglementations provinciales en vigueur. 
          Province sélectionnée : <strong style={{ color: '#60a5fa' }}>{PROVINCES_DATA[selectedProvince].name} ({selectedProvince})</strong> - {PROVINCES_DATA[selectedProvince].authority}.
          <br /><br />
          Chaque module intègre les fonctionnalités avancées requises : signatures électroniques, 
          horodatage sécurisé, photos géolocalisées, et archivage automatique dans Supabase.
        </p>
      </div>

      {/* CSS pour l'animation du spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Step4Permits;
