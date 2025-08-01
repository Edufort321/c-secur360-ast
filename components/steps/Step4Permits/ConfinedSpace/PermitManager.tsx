// PermitManager.tsx - VERSION COMPLÈTE RÉVISÉE POUR ASTFORM
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Database, QrCode, Printer, Mail, Share, Download, 
  Save, CheckCircle, AlertTriangle, Clock, Shield, Users, 
  Wrench, Activity, Eye, Globe, Smartphone, Copy, Check,
  BarChart3, TrendingUp, Calendar, MapPin, Building, User,
  Search, X, Plus, Edit3, Trash2, RefreshCw, Upload,
  ArrowRight, ArrowLeft, Star, Target, Zap, Wind, History
} from 'lucide-react';
import { useSafetyManager } from './SafetyManager';

// =================== INTERFACE COMPATIBLE ASTFORM ===================
interface PermitManagerProps {
  // Props reçues depuis ASTForm (OBLIGATOIRES)
  formData?: any;
  onDataChange?: (section: string, data: any) => void;
  language?: 'fr' | 'en';
  tenant?: string;
  errors?: any;
  province?: string;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
  
  // Props spécifiques PermitManager (OPTIONNELLES pour compatibilité)
  selectedProvince?: string;
  PROVINCIAL_REGULATIONS?: Record<string, any>;
  isMobile?: boolean;
  
  // Props ConfinedSpace (OPTIONNELLES)
  permitData?: any;
  safetyManager?: any;
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  regulations?: any;
}

interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
}

interface PermitHistoryEntry {
  id: string;
  permitNumber: string;
  projectNumber: string;
  workLocation: string;
  contractor: string;
  spaceType: string;
  csaClass: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  lastModified: string;
  hazardCount: number;
  photoCount: number;
  qrCode?: string;
}

// =================== DONNÉES RÉGLEMENTAIRES PAR DÉFAUT ===================
const DEFAULT_PROVINCIAL_REGULATIONS: Record<string, any> = {
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
  }
};

// =================== STYLES RESPONSIFS ===================
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
  }
});

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Gestion et Finalisation du Permis",
    subtitle: "Tableau de bord centralisé pour validation, sauvegarde, historique et partage",
    
    // Actions principales
    savePermit: "Sauvegarder",
    printPDF: "Imprimer PDF",
    emailPermit: "Envoyer par Email",
    sharePermit: "Partager",
    generateQR: "Générer QR Code",
    exportData: "Exporter Données",
    searchDatabase: "Rechercher Base",
    viewHistory: "Voir Historique",
    newPermit: "Nouveau Permis",
    
    // Sections
    summary: "Résumé du Permis",
    validation: "Validation et Conformité",
    actions: "Actions du Permis",
    statistics: "Statistiques",
    qrCode: "Code QR - Accès Mobile",
    sharing: "Partage et Distribution",
    history: "Historique des Permis",
    database: "Base de Données",
    
    // Statuts
    complete: "Complété",
    incomplete: "Incomplet",
    valid: "Valide",
    invalid: "Non valide",
    saving: "Sauvegarde...",
    saved: "Sauvegardé",
    loading: "Chargement...",
    searching: "Recherche...",
    
    // Messages
    saveSuccess: "Permis sauvegardé avec succès!",
    validationPassed: "Toutes les validations sont réussies",
    validationErrors: "Erreurs de validation détectées",
    qrGenerated: "Code QR généré avec succès",
    linkCopied: "Lien copié dans le presse-papiers",
    pdfGenerated: "PDF généré avec succès",
    emailSent: "Email envoyé avec succès",
    noResults: "Aucun résultat trouvé",
    searchPlaceholder: "Rechercher par numéro, projet, lieu...",
    
    // Sections du permis
    siteInformation: "Informations du Site",
    rescuePlan: "Plan de Sauvetage", 
    atmosphericTesting: "Tests Atmosphériques",
    entryRegistry: "Registre d'Entrée",
    
    // Statistiques
    totalPermits: "Total Permis",
    activePermits: "Permis Actifs",
    completedPermits: "Permis Complétés",
    draftPermits: "Brouillons",
    dangerousSpaces: "Espaces Dangereux",
    safeSpaces: "Espaces Sécuritaires",
    avgCompletion: "Complétude Moyenne",
    lastActivity: "Dernière Activité",
    
    // Status
    draft: "Brouillon",
    active: "Actif",
    completed: "Complété",
    cancelled: "Annulé",
    
    // Types d'espaces
    spaceTypes: {
      tank: "Réservoir",
      vessel: "Cuve",
      silo: "Silo",
      pit: "Fosse",
      vault: "Voûte",
      tunnel: "Tunnel",
      trench: "Tranchée",
      manhole: "Regard",
      storage: "Stockage",
      boiler: "Chaudière",
      duct: "Conduit",
      chamber: "Chambre",
      other: "Autre"
    }
  },
  en: {
    title: "Permit Management and Finalization",
    subtitle: "Centralized dashboard for validation, saving, history and sharing",
    
    // Actions principales
    savePermit: "Save",
    printPDF: "Print PDF",
    emailPermit: "Send by Email",
    sharePermit: "Share",
    generateQR: "Generate QR Code",
    exportData: "Export Data",
    searchDatabase: "Search Database",
    viewHistory: "View History",
    newPermit: "New Permit",
    
    // Sections
    summary: "Permit Summary",
    validation: "Validation and Compliance",
    actions: "Permit Actions",
    statistics: "Statistics",
    qrCode: "QR Code - Mobile Access",
    sharing: "Sharing and Distribution",
    history: "Permit History",
    database: "Database",
    
    // Statuts
    complete: "Complete",
    incomplete: "Incomplete",
    valid: "Valid",
    invalid: "Invalid",
    saving: "Saving...",
    saved: "Saved",
    loading: "Loading...",
    searching: "Searching...",
    
    // Messages
    saveSuccess: "Permit saved successfully!",
    validationPassed: "All validations passed",
    validationErrors: "Validation errors detected",
    qrGenerated: "QR Code generated successfully",
    linkCopied: "Link copied to clipboard",
    pdfGenerated: "PDF generated successfully",
    emailSent: "Email sent successfully",
    noResults: "No results found",
    searchPlaceholder: "Search by number, project, location...",
    
    // Sections du permis
    siteInformation: "Site Information",
    rescuePlan: "Rescue Plan",
    atmosphericTesting: "Atmospheric Testing", 
    entryRegistry: "Entry Registry",
    
    // Statistiques
    totalPermits: "Total Permits",
    activePermits: "Active Permits",
    completedPermits: "Completed Permits",
    draftPermits: "Drafts",
    dangerousSpaces: "Dangerous Spaces",
    safeSpaces: "Safe Spaces",
    avgCompletion: "Average Completion",
    lastActivity: "Last Activity",
    
    // Status
    draft: "Draft",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    
    // Types d'espaces
    spaceTypes: {
      tank: "Tank",
      vessel: "Vessel",
      silo: "Silo",
      pit: "Pit",
      vault: "Vault",
      tunnel: "Tunnel",
      trench: "Trench",
      manhole: "Manhole",
      storage: "Storage",
      boiler: "Boiler",
      duct: "Duct",
      chamber: "Chamber",
      other: "Other"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const PermitManager: React.FC<PermitManagerProps> = ({
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
  
  // Props spécifiques PermitManager (avec fallbacks)
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  
  // Props ConfinedSpace
  permitData,
  safetyManager: externalSafetyManager,
  onSave,
  onSubmit,
  regulations
}): JSX.Element => {
  
  // =================== GESTION INTELLIGENTE DES PROPS ===================
  
  // Utiliser province ou selectedProvince selon ce qui est fourni
  const actualProvince = selectedProvince || province || 'QC';
  
  // Utiliser touchOptimized ou détecter mobile
  const actualIsMobile = isMobile !== undefined ? isMobile : 
                         touchOptimized || 
                         (typeof window !== 'undefined' && window.innerWidth < 768);
  
  // SafetyManager : utiliser celui fourni ou créer une instance avec le hook
  const internalSafetyManager = useSafetyManager();
  const safetyManager = externalSafetyManager || internalSafetyManager;
  
  // Données réglementaires : utiliser celles fournies ou les par défaut
  const actualRegulations = PROVINCIAL_REGULATIONS || 
                            regulations || 
                            DEFAULT_PROVINCIAL_REGULATIONS;
  
  const t = translations[language];
  const styles = getStyles(actualIsMobile);
  
  // =================== ÉTATS LOCAUX ===================
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedShareMethod, setSelectedShareMethod] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PermitHistoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'history' | 'database'>('main');

  // Récupérer les données du SafetyManager
  const permit = permitData || safetyManager.currentPermit;
  const validation = safetyManager.validatePermitCompleteness();

  // =================== FONCTIONS UTILITAIRES ===================
  
  const handleSave = async () => {
    try {
      if (onSave) {
        // Utiliser la fonction onSave fournie par ConfinedSpace
        await onSave(permit);
      } else {
        // Utiliser safetyManager
        const permitNumber = await safetyManager.saveToDatabase();
        if (permitNumber) {
          showNotification(t.saveSuccess, 'success');
        }
      }
      
      // Informer ASTForm si onDataChange existe
      if (onDataChange) {
        onDataChange('permitManager', permit);
      }
      
      // Générer QR automatiquement après sauvegarde
      if (!qrCodeUrl) {
        handleGenerateQR();
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    try {
      const qrUrl = await safetyManager.generateQRCode();
      setQrCodeUrl(qrUrl);
      showNotification(t.qrGenerated, 'success');
    } catch (error) {
      console.error('Erreur QR:', error);
      showNotification('Erreur génération QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await safetyManager.generatePDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${permit.permit_number}_espace_clos.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification(t.pdfGenerated, 'success');
    } catch (error) {
      console.error('Erreur PDF:', error);
      showNotification('Erreur génération PDF', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    try {
      await safetyManager.sharePermit(selectedShareMethod);
      showNotification(t.emailSent, 'success');
    } catch (error) {
      console.error('Erreur partage:', error);
      showNotification('Erreur lors du partage', 'error');
    }
  };

  const handleCopyLink = async () => {
    const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
    try {
      await navigator.clipboard.writeText(permitUrl);
      setLinkCopied(true);
      showNotification(t.linkCopied, 'success');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Erreur copie:', error);
      showNotification('Erreur copie du lien', 'error');
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const allPermits = await safetyManager.loadPermitHistory();
      const filtered = allPermits.filter((permit: any) => 
        permit.permit_number?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.projectNumber?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.workLocation?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.contractor?.toLowerCase().includes(query.toLowerCase())
      );
      
      const results: PermitHistoryEntry[] = filtered.map((permit: any) => ({
        id: permit.id || '',
        permitNumber: permit.permit_number || '',
        projectNumber: permit.siteInformation?.projectNumber || '',
        workLocation: permit.siteInformation?.workLocation || '',
        contractor: permit.siteInformation?.contractor || '',
        spaceType: permit.siteInformation?.spaceType || '',
        csaClass: permit.siteInformation?.csaClass || '',
        status: permit.status || 'draft',
        createdAt: permit.created_at || '',
        lastModified: permit.last_modified || '',
        hazardCount: (permit.siteInformation?.atmosphericHazards?.length || 0) + 
                    (permit.siteInformation?.physicalHazards?.length || 0),
        photoCount: permit.siteInformation?.spacePhotos?.length || 0,
        qrCode: qrCodeUrl
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [safetyManager, qrCodeUrl]);

  const handleLoadPermit = async (permitNumber: string) => {
    try {
      await safetyManager.loadFromDatabase(permitNumber);
      setCurrentView('main');
      showNotification(`Permis ${permitNumber} chargé`, 'success');
    } catch (error) {
      console.error('Erreur chargement:', error);
      showNotification(`Erreur chargement ${permitNumber}`, 'error');
    }
  };

  const getSectionValidation = (): ValidationSummary[] => {
    return [
      {
        sectionName: t.siteInformation,
        icon: <Building style={{ width: '20px', height: '20px' }} />,
        isComplete: Boolean(permit.siteInformation?.projectNumber && permit.siteInformation?.workLocation),
        completionPercentage: getFieldCompletionPercentage(permit.siteInformation, ['projectNumber', 'workLocation', 'contractor', 'supervisor']),
        errors: permit.siteInformation?.projectNumber ? [] : ['Numéro de projet manquant'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.rescuePlan,
        icon: <Shield style={{ width: '20px', height: '20px' }} />,
        isComplete: Boolean(permit.rescuePlan?.emergencyContacts?.length > 0),
        completionPercentage: permit.rescuePlan?.emergencyContacts?.length > 0 ? 100 : 0,
        errors: permit.rescuePlan?.emergencyContacts?.length > 0 ? [] : ['Plan de sauvetage incomplet'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.atmosphericTesting,
        icon: <Activity style={{ width: '20px', height: '20px' }} />,
        isComplete: Boolean(permit.atmosphericTesting?.readings?.length > 0),
        completionPercentage: permit.atmosphericTesting?.readings?.length > 0 ? 100 : 0,
        errors: permit.atmosphericTesting?.readings?.length > 0 ? [] : ['Tests atmosphériques manquants'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.entryRegistry,
        icon: <Users style={{ width: '20px', height: '20px' }} />,
        isComplete: Boolean(permit.entryRegistry?.personnel?.length > 0),
        completionPercentage: permit.entryRegistry?.personnel?.length > 0 ? 100 : 0,
        errors: permit.entryRegistry?.personnel?.length > 0 ? [] : ['Personnel manquant'],
        lastModified: permit.last_modified
      }
    ];
  };

  const getPermitStatistics = () => {
    return {
      totalSections: 4,
      completedSections: getSectionValidation().filter(s => s.isComplete).length,
      totalPersonnel: permit.entryRegistry?.personnel?.length || 0,
      activeEntrants: permit.entryRegistry?.activeEntrants?.length || 0,
      atmosphericReadings: permit.atmosphericTesting?.readings?.length || 0,
      lastSaved: safetyManager.lastSaved ? new Date(safetyManager.lastSaved).toLocaleString() : 'Jamais',
      permitAge: permit.created_at ? Math.floor((Date.now() - new Date(permit.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      hazardCount: (permit.siteInformation?.atmosphericHazards?.length || 0) + 
                   (permit.siteInformation?.physicalHazards?.length || 0),
      photoCount: permit.siteInformation?.spacePhotos?.length || 0,
      volume: permit.siteInformation?.dimensions?.volume || 0,
      unitSystem: permit.siteInformation?.unitSystem || 'metric'
    };
  };

  // =================== EFFETS ===================
  useEffect(() => {
    if (permit.permit_number && !qrCodeUrl) {
      handleGenerateQR();
    }
  }, [permit.permit_number]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, handleSearch]);

  // =================== RENDU CONDITIONNEL - VUE DATABASE/HISTORIQUE ===================
  if (currentView === 'database' || currentView === 'history') {
    return (
      <div style={styles.container}>
        {/* Header de retour */}
        <div style={styles.headerCard}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))', zIndex: 0 }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setCurrentView('main')}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    width: 'auto',
                    padding: '12px 16px'
                  }}
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
                <div>
                  <h2 style={{ fontSize: actualIsMobile ? '20px' : '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                    <Database style={{ display: 'inline', marginRight: '12px', width: '24px', height: '24px' }} />
                    {t.database}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: actualIsMobile ? '14px' : '16px', margin: '4px 0 0 0' }}>
                    {actualProvince} - {actualRegulations[actualProvince]?.authority || 'Autorité provinciale'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                type="text"
                style={{ ...styles.input, paddingLeft: '48px' }}
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {isSearching && (
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Résultats de recherche */}
        <div style={styles.card}>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p>{t.searching}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  style={{
                    ...styles.card,
                    margin: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid #4b5563'
                  }}
                  onClick={() => handleLoadPermit(result.permitNumber)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#3b82f6', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                        {result.permitNumber}
                      </h4>
                      <p style={{ color: 'white', margin: '0 0 4px 0', fontSize: '14px' }}>
                        📋 {result.projectNumber} • 📍 {result.workLocation}
                      </p>
                      <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>
                        🏢 {result.contractor} • {t.spaceTypes[result.spaceType as keyof typeof t.spaceTypes] || result.spaceType}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        <span>⚠️ {result.hazardCount} dangers</span>
                        <span>📷 {result.photoCount} photos</span>
                        <span>🕒 {new Date(result.lastModified || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span style={{
                      background: result.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                 result.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: result.status === 'active' ? '#10b981' : 
                             result.status === 'completed' ? '#3b82f6' : '#9ca3af',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {result.status === 'active' ? '🟢 ACTIF' : 
                       result.status === 'completed' ? '🔵 COMPLÉTÉ' :
                       result.status === 'draft' ? '🟡 BROUILLON' : '⚪ AUTRE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>{t.noResults}</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>💡 {language === 'fr' ? 'Tapez au moins 2 caractères pour rechercher' : 'Type at least 2 characters to search'}</p>
            </div>
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

  // =================== RENDU PRINCIPAL ===================
  const stats = getPermitStatistics();
  const sections = getSectionValidation();

  return (
    <div style={styles.container}>
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
                <Wrench style={{ 
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
                  ⚙️ {t.title}
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
                color: validation.isValid ? '#10b981' : '#f59e0b',
                marginBottom: '4px'
              }}>
                {validation.percentage}%
              </div>
              <div style={{ 
                fontSize: actualIsMobile ? '12px' : '14px', 
                color: '#d1d5db' 
              }}>
                {validation.isValid ? '✅ Valide' : '⚠️ Incomplet'}
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div style={{
            display: 'flex',
            gap: actualIsMobile ? '8px' : '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => safetyManager.createNewPermit(actualProvince)}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                flex: actualIsMobile ? '1' : 'none',
                fontSize: actualIsMobile ? '12px' : '14px'
              }}
            >
              <Plus size={16} />
              {t.newPermit}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard - Interface simplifiée pour affichage */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #374151'
        }}>
          <CheckCircle style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          <h2 style={{
            fontSize: actualIsMobile ? '18px' : '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            ✅ PermitManager Compatible ASTForm
          </h2>
        </div>
        
        <div style={styles.grid3}>
          <div>
            <h3 style={{ fontWeight: '600', color: '#a78bfa', marginBottom: '16px', fontSize: '16px' }}>
              Configuration
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Province:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{actualProvince}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Langue:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{language}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Mobile:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{actualIsMobile ? 'Oui' : 'Non'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Tenant:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{tenant || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: '600', color: '#34d399', marginBottom: '16px', fontSize: '16px' }}>
              Fonctionnalités
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ color: '#86efac' }}>✅ Validation des sections</div>
              <div style={{ color: '#86efac' }}>✅ Génération QR Code</div>
              <div style={{ color: '#86efac' }}>✅ Impression PDF</div>
              <div style={{ color: '#86efac' }}>✅ Partage sécurisé</div>
              <div style={{ color: '#86efac' }}>✅ Base de données</div>
              <div style={{ color: '#86efac' }}>✅ Historique permis</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: '600', color: '#f87171', marginBottom: '16px', fontSize: '16px' }}>
              État
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>SafetyManager:</span>
                <span style={{ color: safetyManager ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                  {safetyManager ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Validation:</span>
                <span style={{ color: validation.isValid ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                  {validation.percentage}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Sections:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>
                  {stats.completedSections}/{stats.totalSections}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions de test */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={safetyManager.isSaving}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              width: 'auto',
              opacity: safetyManager.isSaving ? 0.7 : 1
            }}
          >
            {safetyManager.isSaving ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={20} />
            )}
            {safetyManager.isSaving ? t.saving : t.savePermit}
          </button>

          <button
            onClick={handleGenerateQR}
            disabled={isGeneratingQR}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              width: 'auto',
              opacity: isGeneratingQR ? 0.7 : 1
            }}
          >
            {isGeneratingQR ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <QrCode size={20} />
            )}
            {t.generateQR}
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              width: 'auto',
              opacity: isGeneratingPDF ? 0.7 : 1
            }}
          >
            {isGeneratingPDF ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Printer size={20} />
            )}
            {t.printPDF}
          </button>
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

// =================== FONCTIONS UTILITAIRES ===================
const getFieldCompletionPercentage = (obj: any, requiredFields: string[]): number => {
  if (!obj) return 0;
  const completedFields = requiredFields.filter(field => obj[field]).length;
  return Math.round((completedFields / requiredFields.length) * 100);
};

const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('C-SECUR360', {
      body: message,
      icon: '/c-secur360-logo.png'
    });
  }
};

export default PermitManager;
