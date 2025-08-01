// components/steps/Step4Permits/index.tsx - SECTION 1/2
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, 
  Briefcase, Copy, Check, AlertTriangle, Camera, Upload, X, Settings,
  Shield, Activity, Eye, Globe, Smartphone, Database, QrCode, Printer,
  Mail, Share, Download, Save, CheckCircle, Wrench, BarChart3, TrendingUp,
  Search, Plus, Edit3, Trash2, RefreshCw, ArrowRight, ArrowLeft, Star,
  Target, Zap, Wind, History, Thermometer, Bluetooth, Battery, Signal,
  Play, Pause, RotateCcw, PenTool, Home
} from 'lucide-react';
import { useSafetyManager } from './ConfinedSpace/SafetyManager';

// =================== INTERFACE COMPATIBLE ASTFORM ===================
interface Step4PermitsProps {
  // ✅ TOUTES LES PROPS QUE ASTFORM PASSE (OBLIGATOIRES)
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
  
  // Props existantes PermitManager (pour compatibilité)
  selectedProvince?: string;
  PROVINCIAL_REGULATIONS?: Record<string, any>;
  isMobile?: boolean;
}

// =================== TYPES DES COMPOSANTS ===================
interface PermitComponent {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  description: { fr: string; en: string };
  icon: string;
  status: 'active' | 'development' | 'disabled';
  requiredProps?: string[];
  category: 'primary' | 'secondary' | 'specialized';
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  csaStandards?: string[];
  provincialRegs?: string[];
}

interface PermitStats {
  totalPermits: number;
  activePermits: number;
  completedPermits: number;
  draftPermits: number;
  recentActivity: string;
  compliance: number;
}

// =================== IMPORTS DYNAMIQUES ===================
const ConfinedSpace = React.lazy(() => import('./ConfinedSpace'));

// =================== DONNÉES RÉGLEMENTAIRES PAR DÉFAUT ===================
const DEFAULT_PROVINCIAL_REGULATIONS: Record<string, any> = {
  QC: {
    name: "Règlement sur la santé et la sécurité du travail (RSST)",
    authority: "CNESST",
    authority_phone: "1-844-838-0808",
    website: "https://www.cnesst.gouv.qc.ca",
    atmospheric_testing: {
      frequency_minutes: 30,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    },
    training_requirements: ["CSA Z1006", "Formation espace clos CNESST"],
    rescue_requirements: {
      on_site_team: true,
      external_service: false,
      response_time_minutes: 5
    }
  },
  ON: {
    name: "Ontario Regulation 632/05 - Confined Spaces",
    authority: "Ministry of Labour (MOL)",
    authority_phone: "1-877-202-0008",
    website: "https://www.ontario.ca/laws/regulation/632",
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    },
    training_requirements: ["CSA Z1006", "Ontario Confined Space Training"],
    rescue_requirements: {
      on_site_team: true,
      external_service: true,
      response_time_minutes: 3
    }
  },
  BC: {
    name: "WorkSafeBC Occupational Health and Safety Regulation",
    authority: "WorkSafeBC",
    authority_phone: "1-888-621-7233",
    website: "https://www.worksafebc.com",
    atmospheric_testing: {
      frequency_minutes: 20,
      continuous_monitoring_required: true,
      limits: {
        oxygen: { min: 19.5, max: 23.0, critical_low: 16.0, critical_high: 25.0 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 15 },
        co: { max: 35, critical: 100 }
      }
    },
    training_requirements: ["CSA Z1006", "WorkSafeBC Confined Space"],
    rescue_requirements: {
      on_site_team: true,
      external_service: true,
      response_time_minutes: 4
    }
  }
};

// =================== CONFIGURATION DES PERMIS ===================
const PERMIT_COMPONENTS: PermitComponent[] = [
  {
    id: 'confined-space',
    name: 'Confined Space / Espace Clos',
    component: ConfinedSpace,
    description: {
      fr: 'Permis pour travail en espace clos selon les normes CSA Z1006 et réglementations provinciales. Inclut évaluation des risques, tests atmosphériques, plan de sauvetage et surveillance continue.',
      en: 'Permit for confined space work according to CSA Z1006 standards and provincial regulations. Includes risk assessment, atmospheric testing, rescue plan and continuous monitoring.'
    },
    icon: '🏗️',
    status: 'active',
    category: 'primary',
    complexity: 'advanced',
    estimatedTime: 45,
    csaStandards: ['Z1006', 'Z462'],
    provincialRegs: ['RSST-QC', 'O.Reg.632/05-ON', 'OHSR-BC'],
    requiredProps: ['formData', 'onDataChange', 'language', 'province']
  },
  {
    id: 'hot-work',
    name: 'Hot Work / Travail à Chaud',
    component: ConfinedSpace, // Placeholder temporaire
    description: {
      fr: 'Permis pour travaux de soudage, découpage, meulage et autres opérations générant de la chaleur ou des étincelles. Inclut prévention incendie et surveillance.',
      en: 'Permit for welding, cutting, grinding and other operations generating heat or sparks. Includes fire prevention and monitoring.'
    },
    icon: '🔥',
    status: 'development',
    category: 'primary',
    complexity: 'intermediate',
    estimatedTime: 30,
    csaStandards: ['W117.2', 'Z462'],
    provincialRegs: ['Code de prévention incendie'],
    requiredProps: ['formData', 'onDataChange', 'language']
  },
  {
    id: 'height-work',
    name: 'Work at Height / Travail en Hauteur',
    component: ConfinedSpace, // Placeholder temporaire
    description: {
      fr: 'Permis pour travaux en hauteur incluant échafaudages, plateformes élévatrices, toitures et structures. Protection contre les chutes obligatoire.',
      en: 'Permit for work at height including scaffolding, aerial platforms, roofing and structures. Fall protection required.'
    },
    icon: '🏗️',
    status: 'development',
    category: 'primary',
    complexity: 'intermediate',
    estimatedTime: 25,
    csaStandards: ['Z259', 'Z271'],
    provincialRegs: ['RSST-QC', 'O.Reg.213/91-ON'],
    requiredProps: ['formData', 'onDataChange', 'language']
  },
  {
    id: 'lockout-tagout',
    name: 'Lockout/Tagout / Cadenassage',
    component: ConfinedSpace, // Placeholder temporaire
    description: {
      fr: 'Procédure de cadenassage pour isoler les sources d\'énergie dangereuses lors de maintenance ou réparation d\'équipements.',
      en: 'Lockout procedure to isolate hazardous energy sources during equipment maintenance or repair.'
    },
    icon: '🔒',
    status: 'development',
    category: 'secondary',
    complexity: 'basic',
    estimatedTime: 15,
    csaStandards: ['Z460'],
    provincialRegs: ['RSST-QC', 'O.Reg.851-ON'],
    requiredProps: ['formData', 'onDataChange']
  },
  {
    id: 'excavation',
    name: 'Excavation Work / Travaux d\'Excavation',
    component: ConfinedSpace, // Placeholder temporaire
    description: {
      fr: 'Permis pour travaux d\'excavation incluant tranchées, fouilles et terrassements. Protection contre les éboulements et accumulation de gaz.',
      en: 'Permit for excavation work including trenches, pits and earthworks. Protection against cave-ins and gas accumulation.'
    },
    icon: '⛏️',
    status: 'development',
    category: 'specialized',
    complexity: 'intermediate',
    estimatedTime: 35,
    csaStandards: ['Z142'],
    provincialRegs: ['RSST-QC', 'O.Reg.213/91-ON'],
    requiredProps: ['formData', 'onDataChange', 'language']
  },
  {
    id: 'chemical-handling',
    name: 'Chemical Handling / Manipulation Chimique',
    component: ConfinedSpace, // Placeholder temporaire
    description: {
      fr: 'Permis pour manipulation, stockage et transport de produits chimiques dangereux. Inclut équipements de protection et procédures d\'urgence.',
      en: 'Permit for handling, storage and transport of hazardous chemicals. Includes protective equipment and emergency procedures.'
    },
    icon: '🧪',
    status: 'development',
    category: 'specialized',
    complexity: 'advanced',
    estimatedTime: 40,
    csaStandards: ['Z1000', 'Z94.4'],
    provincialRegs: ['SIMDUT', 'TMD'],
    requiredProps: ['formData', 'onDataChange', 'language']
  }
];

// =================== STYLES RESPONSIVE ===================
const getStyles = (isMobile: boolean) => ({
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
    boxSizing: 'border-box' as const,
    transition: 'all 0.3s ease'
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
  input: {
    width: '100%',
    padding: isMobile ? '12px 16px' : '14px 16px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid #374151',
    borderRadius: isMobile ? '6px' : '8px',
    color: 'white',
    fontSize: isMobile ? '16px' : '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    minHeight: isMobile ? '48px' : '50px',
    fontFamily: 'inherit'
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
  permitCard: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden' as const
  },
  permitCardActive: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
    border: '2px solid rgba(16, 185, 129, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
  },
  permitCardDevelopment: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
    border: '2px solid rgba(245, 158, 11, 0.3)',
    opacity: 0.8
  },
  permitCardDisabled: {
    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.1))',
    border: '2px solid rgba(107, 114, 128, 0.3)',
    opacity: 0.5,
    cursor: 'not-allowed'
  }
});

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Gestion des Permis de Travail",
    subtitle: "Système centralisé pour tous les types de permis selon les normes CSA et réglementations provinciales",
    selectPermit: "Sélectionner un Type de Permis",
    activePermits: "Permis Actifs",
    recentActivity: "Activité Récente",
    statistics: "Statistiques",
    compliance: "Conformité",
    searchPermits: "Rechercher des permis...",
    createNew: "Créer Nouveau",
    viewAll: "Voir Tout",
    refresh: "Actualiser",
    
    // Status
    active: "Actif",
    development: "En Développement",
    disabled: "Désactivé",
    draft: "Brouillon",
    completed: "Complété",
    expired: "Expiré",
    
    // Categories
    primary: "Primaires",
    secondary: "Secondaires", 
    specialized: "Spécialisés",
    
    // Complexity
    basic: "Basique",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    
    // Time
    estimatedTime: "Temps estimé",
    minutes: "minutes",
    lastUpdate: "Dernière mise à jour",
    
    // Actions
    select: "Sélectionner",
    configure: "Configurer",
    preview: "Aperçu",
    edit: "Modifier",
    duplicate: "Dupliquer",
    archive: "Archiver",
    
    // Messages
    comingSoon: "Bientôt disponible",
    underDevelopment: "En cours de développement",
    contactSupport: "Contactez le support pour plus d'informations",
    noPermitsFound: "Aucun permis trouvé",
    loadingPermits: "Chargement des permis...",
    
    // Requirements
    csaStandards: "Normes CSA",
    provincialRegs: "Réglementations Provinciales",
    requiredTraining: "Formation Requise",
    
    // Provinces
    provinces: {
      QC: "Québec",
      ON: "Ontario", 
      BC: "Colombie-Britannique",
      AB: "Alberta",
      SK: "Saskatchewan",
      MB: "Manitoba",
      NB: "Nouveau-Brunswick",
      NS: "Nouvelle-Écosse",
      PE: "Île-du-Prince-Édouard",
      NL: "Terre-Neuve-et-Labrador",
      NT: "Territoires du Nord-Ouest",
      NU: "Nunavut",
      YT: "Yukon"
    }
  },
  en: {
    title: "Work Permit Management",
    subtitle: "Centralized system for all permit types according to CSA standards and provincial regulations",
    selectPermit: "Select a Permit Type",
    activePermits: "Active Permits",
    recentActivity: "Recent Activity",
    statistics: "Statistics",
    compliance: "Compliance",
    searchPermits: "Search permits...",
    createNew: "Create New",
    viewAll: "View All",
    refresh: "Refresh",
    
    // Status
    active: "Active",
    development: "In Development",
    disabled: "Disabled",
    draft: "Draft",
    completed: "Completed",
    expired: "Expired",
    
    // Categories
    primary: "Primary",
    secondary: "Secondary",
    specialized: "Specialized",
    
    // Complexity
    basic: "Basic",
    intermediate: "Intermediate", 
    advanced: "Advanced",
    
    // Time
    estimatedTime: "Estimated time",
    minutes: "minutes",
    lastUpdate: "Last update",
    
    // Actions
    select: "Select",
    configure: "Configure",
    preview: "Preview",
    edit: "Edit",
    duplicate: "Duplicate",
    archive: "Archive",
    
    // Messages
    comingSoon: "Coming soon",
    underDevelopment: "Under development",
    contactSupport: "Contact support for more information",
    noPermitsFound: "No permits found",
    loadingPermits: "Loading permits...",
    
    // Requirements
    csaStandards: "CSA Standards",
    provincialRegs: "Provincial Regulations",
    requiredTraining: "Required Training",
    
    // Provinces
    provinces: {
      QC: "Quebec",
      ON: "Ontario",
      BC: "British Columbia", 
      AB: "Alberta",
      SK: "Saskatchewan",
      MB: "Manitoba",
      NB: "New Brunswick",
      NS: "Nova Scotia",
      PE: "Prince Edward Island",
      NL: "Newfoundland and Labrador",
      NT: "Northwest Territories",
      NU: "Nunavut",
      YT: "Yukon"
    }
  }
};

// =================== FONCTIONS UTILITAIRES ===================
const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('C-SECUR360', {
      body: message,
      icon: '/c-secur360-logo.png'
    });
  }
};
// components/steps/Step4Permits/index.tsx - SECTION 2/2
// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
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
  
  // Props PermitManager existantes (avec fallbacks)
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile
}): JSX.Element => {
  
  // =================== GESTION INTELLIGENTE DES PROPS ===================
  const actualProvince = selectedProvince || province || 'QC';
  const actualIsMobile = isMobile !== undefined ? isMobile : 
                         touchOptimized || 
                         (typeof window !== 'undefined' && window.innerWidth < 768);
  const actualRegulations = PROVINCIAL_REGULATIONS || DEFAULT_PROVINCIAL_REGULATIONS;
  
  const t = translations[language];
  const styles = getStyles(actualIsMobile);
  const safetyManager = useSafetyManager();
  
  // =================== ÉTATS LOCAUX ===================
  const [selectedPermitId, setSelectedPermitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'primary' | 'secondary' | 'specialized'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'development' | 'disabled'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [permitStats, setPermitStats] = useState<PermitStats>({
    totalPermits: 0,
    activePermits: 0,
    completedPermits: 0,
    draftPermits: 0,
    recentActivity: 'Aucune activité récente',
    compliance: 85
  });

  // Ref pour éviter les re-renders
  const containerRef = useRef<HTMLDivElement>(null);

  // =================== FILTRES ET RECHERCHE ===================
  const filteredPermits = PERMIT_COMPONENTS.filter(permit => {
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!permit.name.toLowerCase().includes(query) &&
          !permit.description[language].toLowerCase().includes(query) &&
          !permit.csaStandards?.some(std => std.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Filtre par catégorie
    if (filterCategory !== 'all' && permit.category !== filterCategory) {
      return false;
    }
    
    // Filtre par statut
    if (filterStatus !== 'all' && permit.status !== filterStatus) {
      return false;
    }
    
    // Filtre "seulement disponibles"
    if (showOnlyAvailable && permit.status !== 'active') {
      return false;
    }
    
    return true;
  });

  // =================== GESTIONNAIRES D'ÉVÉNEMENTS ===================
  const handlePermitSelect = useCallback((permitId: string) => {
    const permit = PERMIT_COMPONENTS.find(p => p.id === permitId);
    if (!permit || permit.status === 'disabled') return;
    
    if (permit.status === 'development') {
      showNotification(t.underDevelopment, 'warning');
      return;
    }
    
    setIsLoading(true);
    setSelectedPermitId(permitId);
    
    // Informer ASTForm du changement
    if (onPermitChange) {
      onPermitChange([{ id: permitId, type: permit.name }]);
    }
    
    // Simuler un délai de chargement pour l'UX
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [onPermitChange, t.underDevelopment]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((type: string, value: string) => {
    if (type === 'category') {
      setFilterCategory(value as any);
    } else if (type === 'status') {
      setFilterStatus(value as any);
    }
  }, []);

  const handleBackToSelection = useCallback(() => {
    setSelectedPermitId(null);
    setIsLoading(false);
  }, []);

  const handleRefreshStats = useCallback(async () => {
    try {
      // Simuler le chargement des statistiques
      const mockStats: PermitStats = {
        totalPermits: Math.floor(Math.random() * 100) + 50,
        activePermits: Math.floor(Math.random() * 20) + 5,
        completedPermits: Math.floor(Math.random() * 80) + 30,
        draftPermits: Math.floor(Math.random() * 10) + 2,
        recentActivity: `${Math.floor(Math.random() * 5) + 1} permis créés aujourd'hui`,
        compliance: Math.floor(Math.random() * 15) + 85
      };
      setPermitStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, []);

  // =================== EFFETS ===================
  useEffect(() => {
    handleRefreshStats();
  }, [handleRefreshStats]);

  useEffect(() => {
    // Mettre à jour les données dans ASTForm quand nécessaire
    if (selectedPermitId && onDataChange) {
      onDataChange('selectedPermit', {
        permitId: selectedPermitId,
        timestamp: new Date().toISOString(),
        province: actualProvince
      });
    }
  }, [selectedPermitId, onDataChange, actualProvince]);

  // =================== RENDU CONDITIONNEL - PERMIS SÉLECTIONNÉ ===================
  if (selectedPermitId) {
    const selectedPermit = PERMIT_COMPONENTS.find(p => p.id === selectedPermitId);
    
    if (!selectedPermit) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
              <h3>Permis non trouvé</h3>
              <button onClick={handleBackToSelection} style={{...styles.button, ...styles.buttonPrimary, marginTop: '16px'}}>
                <ArrowLeft size={16} />
                Retour à la sélection
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Rendu du composant de permis sélectionné
    const PermitComponent = selectedPermit.component;
    
    return (
      <div style={styles.container}>
        {/* Header de navigation */}
        <div style={styles.headerCard}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <button
                onClick={handleBackToSelection}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  width: 'auto',
                  padding: actualIsMobile ? '8px 12px' : '12px 16px'
                }}
              >
                <ArrowLeft size={16} />
                {actualIsMobile ? 'Retour' : 'Retour à la sélection'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px 16px',
                  background: selectedPermit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: selectedPermit.status === 'active' ? '#10b981' : '#f59e0b'
                }}>
                  {selectedPermit.status === 'active' ? '✅ Actif' : '⚠️ Développement'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                fontSize: '32px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}>
                {selectedPermit.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: actualIsMobile ? '18px' : '24px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                  lineHeight: 1.2
                }}>
                  {selectedPermit.name}
                </h1>
                <p style={{
                  color: '#d1d5db',
                  fontSize: actualIsMobile ? '13px' : '15px',
                  lineHeight: 1.4,
                  margin: 0
                }}>
                  {selectedPermit.description[language]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rendu du composant de permis avec gestion d'erreur */}
        <React.Suspense fallback={
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p>Chargement du module {selectedPermit.name}...</p>
            </div>
          </div>
        }>
          <PermitComponent
            formData={formData}
            onDataChange={onDataChange}
            language={language}
            tenant={tenant}
            errors={errors}
            province={actualProvince}
            userRole={userRole}
            touchOptimized={actualIsMobile}
            compactMode={compactMode}
            onPermitChange={onPermitChange}
            initialPermits={initialPermits}
            selectedProvince={actualProvince}
            PROVINCIAL_REGULATIONS={actualRegulations}
            isMobile={actualIsMobile}
            safetyManager={safetyManager}
            permitData={formData?.permits?.[selectedPermitId]}
            onSave={(data: any) => onDataChange?.(selectedPermitId, data)}
            regulations={actualRegulations[actualProvince]}
          />
        </React.Suspense>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // =================== RENDU PRINCIPAL - SÉLECTION DES PERMIS ===================
  return (
    <div style={styles.container} ref={containerRef}>
      {/* Header Principal */}
      <div style={styles.headerCard}>
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
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: actualIsMobile ? '20px' : '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: actualIsMobile ? '16px' : '20px' }}>
              <div style={{
                width: actualIsMobile ? '48px' : '60px',
                height: actualIsMobile ? '48px' : '60px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}>
                <FileText style={{ 
                  width: actualIsMobile ? '24px' : '30px', 
                  height: actualIsMobile ? '24px' : '30px', 
                  color: '#60a5fa' 
                }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: actualIsMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                  lineHeight: 1.2
                }}>
                  📋 {t.title}
                </h1>
                <p style={{
                  color: '#d1d5db',
                  fontSize: actualIsMobile ? '14px' : '16px',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: actualIsMobile ? '24px' : '32px',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '4px'
              }}>
                {permitStats.compliance}%
              </div>
              <div style={{ 
                fontSize: actualIsMobile ? '12px' : '14px', 
                color: '#d1d5db' 
              }}>
                {t.compliance}
              </div>
            </div>
          </div>
          
          {/* Province et réglementations */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <MapPin style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: 'white',
                marginBottom: '2px'
              }}>
                {t.provinces[actualProvince as keyof typeof t.provinces]} ({actualProvince})
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#d1d5db' 
              }}>
                {actualRegulations[actualProvince]?.authority || 'Autorité provinciale'} • {actualRegulations[actualProvince]?.name || 'Réglementation provinciale'}
              </div>
            </div>
            <div style={{
              padding: '4px 8px',
              background: 'rgba(16, 185, 129, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#10b981'
            }}>
              Conforme
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div style={styles.grid4}>
        <div style={{
          ...styles.card,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#6ee7b7', margin: '0 0 4px 0' }}>
                {t.activePermits}
              </p>
              <p style={{ fontSize: actualIsMobile ? '20px' : '24px', fontWeight: '700', color: '#34d399', margin: 0 }}>
                {permitStats.activePermits}
              </p>
            </div>
            <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
        </div>

        <div style={{
          ...styles.card,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#93c5fd', margin: '0 0 4px 0' }}>
                Total Permis
              </p>
              <p style={{ fontSize: actualIsMobile ? '20px' : '24px', fontWeight: '700', color: '#60a5fa', margin: 0 }}>
                {permitStats.totalPermits}
              </p>
            </div>
            <FileText style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
          </div>
        </div>

        <div style={{
          ...styles.card,
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#c4b5fd', margin: '0 0 4px 0' }}>
                Complétés
              </p>
              <p style={{ fontSize: actualIsMobile ? '20px' : '24px', fontWeight: '700', color: '#a78bfa', margin: 0 }}>
                {permitStats.completedPermits}
              </p>
            </div>
            <BarChart3 style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
          </div>
        </div>

        <div style={{
          ...styles.card,
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fcd34d', margin: '0 0 4px 0' }}>
                Brouillons
              </p>
              <p style={{ fontSize: actualIsMobile ? '20px' : '24px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
                {permitStats.draftPermits}
              </p>
            </div>
            <Edit3 style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #374151'
        }}>
          <Search style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          <h2 style={{
            fontSize: actualIsMobile ? '18px' : '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {t.selectPermit}
          </h2>
          <div style={{ flex: 1 }}></div>
          <button
            onClick={handleRefreshStats}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              width: 'auto',
              padding: '8px 12px'
            }}
          >
            <RefreshCw size={16} />
            {!actualIsMobile && t.refresh}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {/* Barre de recherche */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              style={{ ...styles.input, paddingLeft: '48px' }}
              placeholder={t.searchPermits}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtres */}
          <div style={{
            display: 'flex',
            gap: actualIsMobile ? '8px' : '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Filtre par catégorie */}
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="all">Toutes catégories</option>
              <option value="primary">{t.primary}</option>
              <option value="secondary">{t.secondary}</option>
              <option value="specialized">{t.specialized}</option>
            </select>

            {/* Filtre par statut */}
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="all">Tous statuts</option>
              <option value="active">{t.active}</option>
              <option value="development">{t.development}</option>
              <option value="disabled">{t.disabled}</option>
            </select>

            {/* Toggle "Seulement disponibles" */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d1d5db',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6'
                }}
              />
              Disponibles seulement
            </label>

            {/* Mode d'affichage */}
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  ...styles.button,
                  ...(viewMode === 'grid' ? styles.buttonPrimary : styles.buttonSecondary),
                  width: 'auto',
                  padding: '8px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', width: '12px', height: '12px' }}>
                  <div style={{ background: 'currentColor', borderRadius: '1px' }}></div>
                  <div style={{ background: 'currentColor', borderRadius: '1px' }}></div>
                  <div style={{ background: 'currentColor', borderRadius: '1px' }}></div>
                  <div style={{ background: 'currentColor', borderRadius: '1px' }}></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  ...styles.button,
                  ...(viewMode === 'list' ? styles.buttonPrimary : styles.buttonSecondary),
                  width: 'auto',
                  padding: '8px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '12px', height: '12px' }}>
                  <div style={{ background: 'currentColor', height: '2px', borderRadius: '1px' }}></div>
                  <div style={{ background: 'currentColor', height: '2px', borderRadius: '1px' }}></div>
                  <div style={{ background: 'currentColor', height: '2px', borderRadius: '1px' }}></div>
                </div>
              </button>
            </div>
          </div>

          {/* Résumé des filtres */}
          {filteredPermits.length !== PERMIT_COMPONENTS.length && (
            <div style={{
              padding: '8px 12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#93c5fd'
            }}>
              {filteredPermits.length} permis sur {PERMIT_COMPONENTS.length} affichés
              {searchQuery && ` • Recherche: "${searchQuery}"`}
              {filterCategory !== 'all' && ` • Catégorie: ${t[filterCategory as keyof typeof t]}`}
              {filterStatus !== 'all' && ` • Statut: ${t[filterStatus as keyof typeof t]}`}
            </div>
          )}
        </div>
      </div>

      {/* Liste des Permis */}
      {filteredPermits.length === 0 ? (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              {t.noPermitsFound}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px' }}>
              Essayez de modifier vos critères de recherche ou filtres
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterStatus('all');
                setShowOnlyAvailable(false);
              }}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                width: 'auto'
              }}
            >
              <RefreshCw size={16} />
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div style={viewMode === 'grid' ? (actualIsMobile ? styles.grid2 : styles.grid3) : { display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPermits.map((permit) => {
            const cardStyle = {
              ...styles.permitCard,
              ...(permit.status === 'active' ? styles.permitCardActive : 
                  permit.status === 'development' ? styles.permitCardDevelopment : 
                  styles.permitCardDisabled),
              ...(viewMode === 'list' ? { display: 'flex', alignItems: 'center', gap: '20px' } : {})
            };

            return (
              <div
                key={permit.id}
                style={cardStyle}
                onClick={() => handlePermitSelect(permit.id)}
                onMouseEnter={permit.status === 'active' ? (e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.3)';
                } : undefined}
                onMouseLeave={permit.status === 'active' ? (e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)';
                } : undefined}
              >
                {/* Badge de statut */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  background: permit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                            permit.status === 'development' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  color: permit.status === 'active' ? '#10b981' : 
                         permit.status === 'development' ? '#f59e0b' : '#6b7280',
                  border: `1px solid ${permit.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 
                                     permit.status === 'development' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`
                }}>
                  {permit.status === 'active' ? '✓ ACTIF' : 
                   permit.status === 'development' ? '⚡ DEV' : '⛔ OFF'}
                </div>

                {/* Icône */}
                <div style={{
                  fontSize: viewMode === 'list' ? '32px' : '48px',
                  marginBottom: viewMode === 'list' ? '0' : '16px',
                  textAlign: 'center',
                  minWidth: viewMode === 'list' ? '48px' : 'auto'
                }}>
                  {permit.icon}
                </div>

                {/* Contenu principal */}
                <div style={{ flex: viewMode === 'list' ? 1 : 'none' }}>
                  {/* Titre */}
                  <h3 style={{
                    fontSize: actualIsMobile || viewMode === 'list' ? '16px' : '18px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '8px',
                    lineHeight: 1.3
                  }}>
                    {permit.name}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: actualIsMobile || viewMode === 'list' ? '13px' : '14px',
                    color: '#d1d5db',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: viewMode === 'list' ? '-webkit-box' : 'block',
                    WebkitLineClamp: viewMode === 'list' ? 2 : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {permit.description[language]}
                  </p>

                  {/* Métadonnées */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '16px',
                    flexWrap: viewMode === 'list' ? 'nowrap' : 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {permit.estimatedTime} {t.minutes}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Target size={12} />
                      {t[permit.complexity as keyof typeof t]}
                    </div>
                    {permit.csaStandards && permit.csaStandards.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} />
                        CSA {permit.csaStandards[0]}
                        {permit.csaStandards.length > 1 && ` +${permit.csaStandards.length - 1}`}
                      </div>
                    )}
                  </div>

                  {/* Catégorie */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: permit.category === 'primary' ? 'rgba(59, 130, 246, 0.2)' : 
                                 permit.category === 'secondary' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: permit.category === 'primary' ? '#60a5fa' : 
                             permit.category === 'secondary' ? '#a78bfa' : '#fbbf24'
                    }}>
                      {t[permit.category as keyof typeof t]}
                    </span>

                    {permit.status === 'active' && (
                      <ArrowRight 
                        size={16} 
                        style={{ 
                          color: '#10b981',
                          transition: 'transform 0.2s ease' 
                        }} 
                      />
                    )}
                  </div>
                </div>

                {permit.status === 'development' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#fbbf24',
                    textAlign: 'center'
                  }}>
                    💡 {t.comingSoon}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Activité récente */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #374151'
        }}>
          <History style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {t.recentActivity}
          </h3>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={16} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <p style={{ color: 'white', margin: '0 0 2px 0', fontSize: '14px', fontWeight: '500' }}>
                {permitStats.recentActivity}
              </p>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>
                Il y a {Math.floor(Math.random() * 60)} minutes
              </p>
            </div>
          </div>
          <div style={{
            padding: '4px 8px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#10b981'
          }}>
            Nouveau
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

export default Step4Permits;
