"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, Users, Clock, 
  Eye, Zap, Wind, Flame, Construction, Building, Activity, BarChart3, Star, 
  Plus, Wrench, Home, Target, ChevronDown, ChevronRight, Camera, MapPin
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
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  moduleCard: {
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '24px',
    border: '2px solid #374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const
  },
  moduleCardHover: {
    transform: 'translateY(-4px)',
    borderColor: '#3b82f6',
    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)'
  }
};

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type PermitStatus = 'available' | 'in-progress' | 'completed';

interface PermitModule {
  id: string;
  icon: React.ComponentType<any>;
  status: PermitStatus;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'safety' | 'electrical' | 'mechanical' | 'environmental';
  features: string[];
  regulations: {
    fr: string;
    en: string;
  };
  lastUpdated?: string;
  completionRate?: number;
}

interface Step4PermitsProps {
  selectedProvince: ProvinceCode;
  language: 'fr' | 'en';
  onDataChange: (data: any) => void;
  formData: any;
}

interface ConfinedSpaceComponent {
  default: React.ComponentType<any>;
}

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  selectedProvince,
  language,
  onDataChange,
  formData
}) => {
  // =================== ÉTATS LOCAUX ===================
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PermitStatus>('all');
  const [confinedSpaceComponent, setConfinedSpaceComponent] = useState<ConfinedSpaceComponent | null>(null);
  const [permitModules, setPermitModules] = useState<PermitModule[]>([]);

  // =================== TRADUCTIONS ===================
  const getTexts = (language: 'fr' | 'en') => ({
    fr: {
      title: "Modules de Permis de Travail",
      subtitle: "Sélectionnez et complétez les permis requis selon la réglementation provinciale",
      search: "Rechercher un permis...",
      filters: {
        all: "Tous",
        available: "Disponibles", 
        inProgress: "En cours",
        completed: "Complétés"
      },
      status: {
        available: "Disponible",
        inProgress: "En cours",
        completed: "Complété"
      },
      difficulty: {
        beginner: "Débutant",
        intermediate: "Intermédiaire", 
        advanced: "Avancé"
      },
      category: {
        safety: "Sécurité",
        electrical: "Électrique",
        mechanical: "Mécanique",
        environmental: "Environnemental"
      },
      actions: {
        start: "Commencer",
        continue: "Continuer",
        review: "Réviser",
        backToSelection: "← Retour à la sélection"
      },
      stats: {
        totalModules: "Modules totaux",
        completed: "Complétés",
        inProgress: "En cours",
        estimatedTime: "Temps estimé"
      },
      loading: "Chargement du module...",
      development: "Module en Développement",
      developmentDesc: "Ce module est actuellement en cours de développement et sera disponible prochainement."
    },
    en: {
      title: "Work Permit Modules",
      subtitle: "Select and complete required permits according to provincial regulations",
      search: "Search for a permit...",
      filters: {
        all: "All",
        available: "Available",
        inProgress: "In Progress", 
        completed: "Completed"
      },
      status: {
        available: "Available",
        inProgress: "In Progress",
        completed: "Completed"
      },
      difficulty: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced"
      },
      category: {
        safety: "Safety",
        electrical: "Electrical", 
        mechanical: "Mechanical",
        environmental: "Environmental"
      },
      actions: {
        start: "Start",
        continue: "Continue",
        review: "Review",
        backToSelection: "← Back to Selection"
      },
      stats: {
        totalModules: "Total Modules",
        completed: "Completed",
        inProgress: "In Progress", 
        estimatedTime: "Estimated Time"
      },
      loading: "Loading module...",
      development: "Module in Development",
      developmentDesc: "This module is currently under development and will be available soon."
    }
  })[language];

  const texts = getTexts(language);

  // =================== GÉNÉRATION DES MODULES ===================
  const getPermitModules = (language: 'fr' | 'en'): PermitModule[] => [
    {
      id: 'confined-space',
      icon: Shield,
      status: 'available',
      estimatedTime: language === 'fr' ? '45-60 min' : '45-60 min',
      difficulty: 'advanced',
      category: 'safety',
      features: language === 'fr' ? [
        'Tests atmosphériques obligatoires',
        'Plan de sauvetage détaillé', 
        'Surveillance continue requise',
        'Documentation complète'
      ] : [
        'Mandatory atmospheric testing',
        'Detailed rescue plan',
        'Continuous monitoring required', 
        'Complete documentation'
      ],
      regulations: {
        fr: selectedProvince === 'QC' ? 'RSST Art. 302-317' : 
            selectedProvince === 'ON' ? 'O.Reg 632/05' :
            selectedProvince === 'BC' ? 'WCA Part 3 Div 8' :
            selectedProvince === 'AB' ? 'OHS Code Part 5' : 'Provincial OHS',
        en: selectedProvince === 'QC' ? 'RSST Art. 302-317' :
            selectedProvince === 'ON' ? 'O.Reg 632/05' :
            selectedProvince === 'BC' ? 'WCA Part 3 Div 8' :
            selectedProvince === 'AB' ? 'OHS Code Part 5' : 'Provincial OHS'
      },
      completionRate: formData?.permitModules?.['confined-space']?.status === 'completed' ? 100 :
                     formData?.permitModules?.['confined-space']?.status === 'in-progress' ? 50 : 0
    },
    {
      id: 'electrical',
      icon: Zap,
      status: 'available',
      estimatedTime: language === 'fr' ? '30-45 min' : '30-45 min',
      difficulty: 'intermediate',
      category: 'electrical',
      features: language === 'fr' ? [
        'Verrouillage/Étiquetage (LOTO)',
        'Isolation électrique vérifiée',
        'Équipement de protection',
        'Procédures d\'urgence'
      ] : [
        'Lockout/Tagout (LOTO)',
        'Verified electrical isolation',
        'Protective equipment',
        'Emergency procedures'
      ],
      regulations: {
        fr: language === 'fr' ? 'Code électrique canadien' : 'Canadian Electrical Code',
        en: 'Canadian Electrical Code'
      },
      completionRate: 0
    },
    {
      id: 'excavation',
      icon: Construction,
      status: 'available', 
      estimatedTime: language === 'fr' ? '35-50 min' : '35-50 min',
      difficulty: 'advanced',
      category: 'safety',
      features: language === 'fr' ? [
        'Analyse du sol requise',
        'Système de protection',
        'Détection de services publics',
        'Plan d\'évacuation d\'urgence'
      ] : [
        'Required soil analysis',
        'Protection system',
        'Utility detection', 
        'Emergency evacuation plan'
      ],
      regulations: {
        fr: language === 'fr' ? 'Réglementation provinciale' : 'Provincial regulation',
        en: 'Provincial regulation'
      },
      completionRate: 0
    },
    {
      id: 'height',
      icon: Building,
      status: 'available',
      estimatedTime: language === 'fr' ? '25-40 min' : '25-40 min', 
      difficulty: 'intermediate',
      category: 'safety',
      features: language === 'fr' ? [
        'Équipement antichute obligatoire',
        'Points d\'ancrage certifiés',
        'Plan de sauvetage en hauteur',
        'Conditions météorologiques'
      ] : [
        'Mandatory fall protection equipment',
        'Certified anchor points',
        'Height rescue plan',
        'Weather conditions'
      ],
      regulations: {
        fr: language === 'fr' ? 'Norme CSA Z259' : 'CSA Z259 Standard',
        en: 'CSA Z259 Standard'
      },
      completionRate: 0
    },
    {
      id: 'hot-work',
      icon: Flame,
      status: 'available',
      estimatedTime: language === 'fr' ? '20-35 min' : '20-35 min',
      difficulty: 'beginner',
      category: 'safety', 
      features: language === 'fr' ? [
        'Surveillance d\'incendie obligatoire',
        'Équipement d\'extinction',
        'Zone de sécurité établie',
        'Ventilation adéquate'
      ] : [
        'Mandatory fire watch',
        'Fire extinguishing equipment',
        'Established safety zone',
        'Adequate ventilation'
      ],
      regulations: {
        fr: language === 'fr' ? 'NFPA 51B' : 'NFPA 51B',
        en: 'NFPA 51B'
      },
      completionRate: 0
    },
    {
      id: 'lifting',
      icon: Wrench,
      status: 'available',
      estimatedTime: language === 'fr' ? '30-45 min' : '30-45 min',
      difficulty: 'intermediate',
      category: 'mechanical',
      features: language === 'fr' ? [
        'Calcul de charge certifié',
        'Inspection d\'équipement',
        'Plan de levage détaillé', 
        'Personnel qualifié requis'
      ] : [
        'Certified load calculation',
        'Equipment inspection',
        'Detailed lifting plan',
        'Qualified personnel required'
      ],
      regulations: {
        fr: language === 'fr' ? 'CSA B167' : 'CSA B167',
        en: 'CSA B167'
      },
      completionRate: 0
    }
  ];

  // =================== EFFETS ===================
  useEffect(() => {
    setPermitModules(getPermitModules(language));
  }, [language, selectedProvince, formData]);

  // =================== FONCTIONS ===================
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
    
    // Mettre à jour le statut du permis
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
    
    // Marquer le permis comme complété
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

  // =================== FILTRAGE DES MODULES ===================
  const filteredModules = permitModules.filter(module => {
    const matchesSearch = module.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         texts.category[module.category].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || module.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // =================== STATISTIQUES ===================
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
    
    console.log('Props passées au module ConfinedSpace:', {
      province: selectedProvince || 'QC',
      language: language || 'fr'
    });
    
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
            {texts.actions.backToSelection}
          </button>
        </div>
        
        {/* Module ConfinedSpace */}
        <ConfinedSpaceModule
          province={selectedProvince || 'QC'}
          language={language || 'fr'}
          onSave={handleSavePermit}
          onSubmit={handleSubmitPermit}
          onCancel={handleBackToSelection}
          initialData={formData?.permitModules?.['confined-space'] || {}}
        />
      </div>
    );
  }
  
  // Affichage du fallback pour les autres modules ou ConfinedSpace non chargé
  if (selectedPermit) {
    const module = permitModules.find(m => m.id === selectedPermit);
    
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
                {texts.loading}
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
                {module && <module.icon style={{ width: '40px', height: '40px', color: '#9ca3af' }} />}
              </div>
              <h2 style={{ color: 'white', marginBottom: '16px' }}>
                {texts.development}
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                {texts.developmentDesc}
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
                {texts.actions.backToSelection}
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

  // =================== RENDU PRINCIPAL (SÉLECTION) ===================
  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        border: '2px solid #3b82f6',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '20px'
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
              <Shield style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
              {texts.title}
            </h1>
            <p style={{
              color: '#9ca3af',
              fontSize: isMobile ? '14px' : '16px',
              margin: 0
            }}>
              {texts.subtitle}
            </p>
          </div>
          
          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            minWidth: isMobile ? '100%' : '300px'
          }}>
            <div style={{
              textAlign: 'center' as const,
              padding: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {texts.stats.totalModules}
              </div>
            </div>
            <div style={{
              textAlign: 'center' as const,
              padding: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {texts.stats.completed}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        ...styles.card,
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder={texts.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '12px',
                padding: '14px 16px 14px 48px',
                width: '100%',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box' as const
              }}
            />
          </div>
          
          {/* Filtres */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'available', 'in-progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: filterStatus === status ? '#3b82f6' : '#4b5563',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap' as const
                }}
              >
                {texts.filters[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des modules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {filteredModules.map(module => {
          const Icon = module.icon;
          const statusColor = module.status === 'completed' ? '#10b981' :
                             module.status === 'in-progress' ? '#f59e0b' : '#6b7280';
          
          return (
            <div
              key={module.id}
              onClick={() => handlePermitSelect(module.id)}
              style={{
                ...styles.moduleCard,
                ':hover': styles.moduleCardHover
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
              }}
            >
              {/* En-tête du module */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#374151',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      margin: 0,
                      textTransform: 'capitalize'
                    }}>
                      {module.id.replace('-', ' ')}
                    </h3>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginTop: '4px'
                    }}>
                      {texts.category[module.category]} • {texts.difficulty[module.difficulty]}
                    </div>
                  </div>
                </div>
                
                {/* Indicateur de statut */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  boxShadow: `0 0 8px ${statusColor}40`
                }} />
              </div>

              {/* Fonctionnalités */}
              <div style={{ flex: 1, marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#d1d5db',
                  marginBottom: '8px'
                }}>
                  Fonctionnalités principales:
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {module.features.slice(0, 3).map((feature, index) => (
                    <li key={index} style={{
                      fontSize: '13px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pied de module */}
              <div style={{
                borderTop: '1px solid #374151',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '4px'
                  }}>
                    {texts.stats.estimatedTime}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    {module.estimatedTime}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  textAlign: 'right' as const
                }}>
                  <div>{module.regulations[language]}</div>
                  <div style={{
                    marginTop: '4px',
                    color: statusColor,
                    fontWeight: '600'
                  }}>
                    {texts.status[module.status]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {filteredModules.length === 0 && (
        <div style={{
          ...styles.card,
          textAlign: 'center' as const,
          padding: '48px 32px'
        }}>
          <AlertTriangle style={{
            width: '48px',
            height: '48px',
            color: '#f59e0b',
            margin: '0 auto 16px'
          }} />
          <h3 style={{ color: 'white', marginBottom: '8px' }}>
            Aucun module trouvé
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Essayez de modifier vos critères de recherche ou de filtrage.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step4Permits;
