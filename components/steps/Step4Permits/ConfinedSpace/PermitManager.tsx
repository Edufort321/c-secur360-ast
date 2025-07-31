// PermitManager.tsx - VERSION RÉVISÉE COMPLÈTE - SECTION 1
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

// =================== TYPES BASÉS SUR LA STRUCTURE RÉELLE ===================
interface PermitManagerProps {
  selectedProvince: string;
  PROVINCIAL_REGULATIONS: Record<string, any>;
  isMobile?: boolean;
  language?: 'fr' | 'en';
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

// =================== DÉTECTION MOBILE ET STYLES COHÉRENTS ===================
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobileDevice ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobileDevice ? '8px' : '16px',
    padding: isMobileDevice ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobileDevice ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  headerCard: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobileDevice ? '12px' : '20px',
    padding: isMobileDevice ? '20px' : '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginBottom: isMobileDevice ? '16px' : '24px'
  },
  button: {
    padding: isMobileDevice ? '8px 12px' : '14px 24px',
    borderRadius: isMobileDevice ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobileDevice ? '4px' : '8px',
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
    padding: isMobileDevice ? '12px 16px' : '14px 16px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid #374151',
    borderRadius: isMobileDevice ? '6px' : '8px',
    color: 'white',
    fontSize: isMobileDevice ? '16px' : '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    minHeight: isMobileDevice ? '48px' : '50px',
    fontFamily: 'inherit'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 1fr',
    gap: isMobileDevice ? '8px' : '20px',
    width: '100%'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobileDevice ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobileDevice ? '8px' : '16px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobileDevice ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobileDevice ? '8px' : '16px',
    width: '100%'
  }
};

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
// PermitManager.tsx - VERSION RÉVISÉE COMPLÈTE - SECTION 2
// =================== COMPOSANT PRINCIPAL ===================
const PermitManager: React.FC<PermitManagerProps> = ({
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile = false,
  language = 'fr'
}): JSX.Element => {
  const safetyManager = useSafetyManager();
  const t = translations[language];
  
  // États locaux
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

  // Validation globale
  const validation = safetyManager.validatePermitCompleteness();
  const permit = safetyManager.currentPermit;

  // =================== GÉNÉRATION QR CODE ===================
  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    try {
      const qrUrl = await safetyManager.generateQRCode();
      setQrCodeUrl(qrUrl);
      showNotification(t.qrGenerated, 'success');
    } catch (error) {
      showNotification('Erreur génération QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // =================== GÉNÉRATION PDF ===================
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
      showNotification('Erreur génération PDF', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // =================== SAUVEGARDE ===================
  const handleSave = async () => {
    const permitNumber = await safetyManager.saveToDatabase();
    if (permitNumber) {
      showNotification(t.saveSuccess, 'success');
      // Générer QR automatiquement après sauvegarde
      if (!qrCodeUrl) {
        handleGenerateQR();
      }
    }
  };

  // =================== PARTAGE ===================
  const handleShare = async () => {
    try {
      await safetyManager.sharePermit(selectedShareMethod);
      showNotification(t.emailSent, 'success');
    } catch (error) {
      showNotification('Erreur lors du partage', 'error');
    }
  };

  // =================== COPIE LIEN ===================
  const handleCopyLink = async () => {
    const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
    try {
      await navigator.clipboard.writeText(permitUrl);
      setLinkCopied(true);
      showNotification(t.linkCopied, 'success');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      showNotification('Erreur copie du lien', 'error');
    }
  };

  // =================== RECHERCHE DANS L'HISTORIQUE ===================
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const allPermits = await safetyManager.loadPermitHistory();
      const filtered = allPermits.filter(permit => 
        permit.permit_number?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.projectNumber?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.workLocation?.toLowerCase().includes(query.toLowerCase()) ||
        permit.siteInformation?.contractor?.toLowerCase().includes(query.toLowerCase())
      );
      
      const results: PermitHistoryEntry[] = filtered.map(permit => ({
        id: permit.id || '',
        permitNumber: permit.permit_number,
        projectNumber: permit.siteInformation?.projectNumber || '',
        workLocation: permit.siteInformation?.workLocation || '',
        contractor: permit.siteInformation?.contractor || '',
        spaceType: permit.siteInformation?.spaceType || '',
        csaClass: permit.siteInformation?.csaClass || '',
        status: permit.status,
        createdAt: permit.created_at,
        lastModified: permit.last_modified,
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

  // =================== CHARGEMENT D'UN PERMIS ===================
  const handleLoadPermit = async (permitNumber: string) => {
    try {
      await safetyManager.loadFromDatabase(permitNumber);
      setCurrentView('main');
      showNotification(`Permis ${permitNumber} chargé`, 'success');
    } catch (error) {
      showNotification(`Erreur chargement ${permitNumber}`, 'error');
    }
  };

  // =================== VALIDATION DES SECTIONS ===================
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

  // =================== STATISTIQUES ===================
  const getPermitStatistics = () => {
    return {
      totalSections: 4,
      completedSections: getSectionValidation().filter(s => s.isComplete).length,
      totalPersonnel: permit.entryRegistry?.personnel?.length || 0,
      activeEntrants: safetyManager.activeEntrants?.length || 0,
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
                  <h2 style={{ fontSize: isMobileDevice ? '20px' : '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                    <Database style={{ display: 'inline', marginRight: '12px', width: '24px', height: '24px' }} />
                    {t.database}
                  </h2>
                  <p style={{ color: '#d1d5db', fontSize: isMobileDevice ? '14px' : '16px', margin: '4px 0 0 0' }}>
                    {selectedProvince} - {PROVINCIAL_REGULATIONS[selectedProvince]?.authority}
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
                        <span>🕒 {new Date(result.lastModified).toLocaleDateString()}</span>
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
  // PermitManager.tsx - VERSION RÉVISÉE COMPLÈTE - SECTION 3
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
            marginBottom: isMobileDevice ? '20px' : '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobileDevice ? '16px' : '20px' }}>
              <div style={{
                width: isMobileDevice ? '48px' : '60px',
                height: isMobileDevice ? '48px' : '60px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}>
                <Wrench style={{ 
                  width: isMobileDevice ? '24px' : '30px', 
                  height: isMobileDevice ? '24px' : '30px', 
                  color: '#60a5fa' 
                }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: isMobileDevice ? '20px' : '28px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                  lineHeight: 1.2
                }}>
                  ⚙️ {t.title}
                </h1>
                <p style={{
                  color: '#d1d5db',
                  fontSize: isMobileDevice ? '14px' : '16px',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {t.subtitle}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: isMobileDevice ? '24px' : '32px',
                fontWeight: '700',
                color: validation.isValid ? '#10b981' : '#f59e0b',
                marginBottom: '4px'
              }}>
                {validation.percentage}%
              </div>
              <div style={{ 
                fontSize: isMobileDevice ? '12px' : '14px', 
                color: '#d1d5db' 
              }}>
                {validation.isValid ? '✅ Valide' : '⚠️ Incomplet'}
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div style={{
            display: 'flex',
            gap: isMobileDevice ? '8px' : '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentView('database')}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                flex: isMobileDevice ? '1' : 'none',
                fontSize: isMobileDevice ? '12px' : '14px'
              }}
            >
              <Database size={16} />
              {t.searchDatabase}
            </button>
            <button
              onClick={() => safetyManager.createNewPermit(selectedProvince)}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                flex: isMobileDevice ? '1' : 'none',
                fontSize: isMobileDevice ? '12px' : '14px'
              }}
            >
              <Plus size={16} />
              {t.newPermit}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard - Statistiques */}
      <div style={styles.grid4}>
        {/* Validation Globale */}
        <div style={{
          ...styles.card,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#9ca3af', margin: '0 0 4px 0' }}>Validation</p>
              <p style={{ 
                fontSize: isMobileDevice ? '20px' : '24px', 
                fontWeight: '700', 
                color: validation.isValid ? '#10b981' : '#f59e0b',
                margin: 0
              }}>
                {stats.completedSections}/{stats.totalSections}
              </p>
            </div>
            {validation.isValid ? (
              <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
            ) : (
              <AlertTriangle style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
            )}
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ width: '100%', background: '#374151', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
              <div 
                style={{
                  height: '100%',
                  background: validation.isValid ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                  transition: 'width 0.3s ease',
                  width: `${validation.percentage}%`
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
              {validation.isValid ? t.validationPassed : t.validationErrors}
            </p>
          </div>
        </div>

        {/* Personnel */}
        <div style={{
          ...styles.card,
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#c4b5fd', margin: '0 0 4px 0' }}>Personnel</p>
              <p style={{ fontSize: isMobileDevice ? '20px' : '24px', fontWeight: '700', color: '#a78bfa', margin: 0 }}>
                {stats.totalPersonnel}
              </p>
            </div>
            <Users style={{ width: '32px', height: '32px', color: '#8b5cf6' }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c4b5fd' }}>
              <span>À l'intérieur:</span>
              <span style={{ fontWeight: '600', color: stats.activeEntrants > 0 ? '#f59e0b' : '#10b981' }}>
                {stats.activeEntrants}
              </span>
            </div>
          </div>
        </div>

        {/* Dangers */}
        <div style={{
          ...styles.card,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fca5a5', margin: '0 0 4px 0' }}>Dangers</p>
              <p style={{ fontSize: isMobileDevice ? '20px' : '24px', fontWeight: '700', color: '#f87171', margin: 0 }}>
                {stats.hazardCount}
              </p>
            </div>
            <AlertTriangle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fca5a5' }}>
              <span>Photos:</span>
              <span style={{ fontWeight: '600', color: '#60a5fa' }}>
                {stats.photoCount}
              </span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div style={{
          ...styles.card,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          margin: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#6ee7b7', margin: '0 0 4px 0' }}>Volume</p>
              <p style={{ fontSize: isMobileDevice ? '20px' : '24px', fontWeight: '700', color: '#34d399', margin: 0 }}>
                {stats.volume}
              </p>
            </div>
            <BarChart3 style={{ width: '32px', height: '32px', color: '#10b981' }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ee7b7' }}>
              <span>Unité:</span>
              <span style={{ fontWeight: '600' }}>
                {stats.unitSystem === 'metric' ? 'm³' : 'ft³'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation des Sections */}
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
            fontSize: isMobileDevice ? '18px' : '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {t.validation}
          </h2>
        </div>
        
        <div style={styles.grid2}>
          {sections.map((section, index) => (
            <div 
              key={index}
              style={{
                padding: isMobileDevice ? '16px' : '20px',
                borderRadius: '12px',
                border: `2px solid ${section.isComplete ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                background: section.isComplete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: section.isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {section.icon}
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: section.isComplete ? '#86efac' : '#fca5a5',
                      margin: '0 0 4px 0',
                      fontSize: isMobileDevice ? '14px' : '15px'
                    }}>
                      {section.sectionName}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      margin: 0
                    }}>
                      {section.isComplete ? t.complete : t.incomplete}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: isMobileDevice ? '16px' : '18px',
                    fontWeight: '700',
                    color: section.isComplete ? '#10b981' : '#ef4444'
                  }}>
                    {section.completionPercentage}%
                  </div>
                </div>
              </div>
              
              {section.errors.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  {section.errors.map((error, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '12px',
                      color: '#fca5a5',
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      marginTop: i > 0 ? '4px' : 0
                    }}>
                      <AlertTriangle size={12} />
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions du Permis */}
      <div style={styles.grid2}>
        {/* Actions Principales */}
        <div style={styles.card}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #374151'
          }}>
            <Wrench style={{ width: '24px', height: '24px', color: '#10b981' }} />
            <h2 style={{
              fontSize: isMobileDevice ? '18px' : '20px',
              fontWeight: '600',
              color: 'white',
              margin: 0
            }}>
              {t.actions}
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Sauvegarder */}
            <button
              onClick={handleSave}
              disabled={safetyManager.isSaving}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
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

            {/* Imprimer PDF */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
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

            {/* Email */}
            <button
              onClick={() => safetyManager.sharePermit('email')}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white'
              }}
            >
              <Mail size={20} />
              {t.emailPermit}
            </button>

            {/* Partage */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedShareMethod}
                onChange={(e) => setSelectedShareMethod(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="email">📧 Email</option>
                <option value="sms">📱 SMS</option>
                <option value="whatsapp">💬 WhatsApp</option>
              </select>
              <button
                onClick={handleShare}
                style={{
                  ...styles.button,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  width: 'auto',
                  minWidth: '60px'
                }}
              >
                <Share size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div style={styles.card}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #374151'
          }}>
            <QrCode style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
            <h2 style={{
              fontSize: isMobileDevice ? '18px' : '20px',
              fontWeight: '600',
              color: 'white',
              margin: 0
            }}>
              {t.qrCode}
            </h2>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            {qrCodeUrl ? (
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    style={{
                      width: isMobileDevice ? '150px' : '200px',
                      height: isMobileDevice ? '150px' : '200px',
                      display: 'block'
                    }}
                  />
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#d1d5db',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  📱 Scanner pour accès mobile instantané
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      ...styles.button,
                      ...styles.buttonSecondary,
                      flex: 1
                    }}
                  >
                    {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                    {linkCopied ? 'Copié!' : 'Copier Lien'}
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    disabled={isGeneratingQR}
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      width: 'auto',
                      minWidth: '60px',
                      opacity: isGeneratingQR ? 0.7 : 1
                    }}
                  >
                    <QrCode size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  width: isMobileDevice ? '150px' : '200px',
                  height: isMobileDevice ? '150px' : '200px',
                  margin: '0 auto 16px',
                  background: '#374151',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QrCode style={{ width: '48px', height: '48px', color: '#6b7280' }} />
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé du Permis */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #374151'
        }}>
          <BarChart3 style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
          <h2 style={{
            fontSize: isMobileDevice ? '18px' : '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {t.summary}
          </h2>
        </div>
        
        <div style={styles.grid3}>
          {/* Informations Générales */}
          <div>
            <h3 style={{ fontWeight: '600', color: '#a78bfa', marginBottom: '16px', fontSize: '16px' }}>
              Informations Générales
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Numéro:</span>
                <span style={{ color: 'white', fontFamily: 'monospace', fontWeight: '600' }}>
                  {permit.permit_number || 'Non généré'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Statut:</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: permit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: permit.status === 'active' ? '#10b981' : '#f59e0b'
                }}>
                  {permit.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Province:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{permit.province}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Créé:</span>
                <span style={{ color: 'white' }}>
                  {permit.created_at ? new Date(permit.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Détails du Site */}
          <div>
            <h3 style={{ fontWeight: '600', color: '#34d399', marginBottom: '16px', fontSize: '16px' }}>
              Détails du Site
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div>
                <span style={{ color: '#9ca3af', display: 'block', marginBottom: '2px' }}>Projet:</span>
                <p style={{ color: 'white', margin: 0, wordWrap: 'break-word' }}>
                  {permit.siteInformation?.projectNumber || 'Non défini'}
                </p>
              </div>
              <div>
                <span style={{ color: '#9ca3af', display: 'block', marginBottom: '2px' }}>Lieu:</span>
                <p style={{ color: 'white', margin: 0, wordWrap: 'break-word' }}>
                  {permit.siteInformation?.workLocation || 'Non défini'}
                </p>
              </div>
              <div>
                <span style={{ color: '#9ca3af', display: 'block', marginBottom: '2px' }}>Entrepreneur:</span>
                <p style={{ color: 'white', margin: 0, wordWrap: 'break-word' }}>
                  {permit.siteInformation?.contractor || 'Non défini'}
                </p>
              </div>
            </div>
          </div>

          {/* Statut de Sécurité */}
          <div>
            <h3 style={{ fontWeight: '600', color: '#f87171', marginBottom: '16px', fontSize: '16px' }}>
              Statut de Sécurité
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Personnel total:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{stats.totalPersonnel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>À l'intérieur:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: stats.activeEntrants > 0 ? '#f59e0b' : '#10b981'
                }}>
                  {stats.activeEntrants}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Alertes actives:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: (safetyManager.activeAlerts?.length || 0) > 0 ? '#ef4444' : '#10b981'
                }}>
                  {safetyManager.activeAlerts?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Tests atmosphériques:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{stats.atmosphericReadings}</span>
              </div>
            </div>
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

// =================== FONCTIONS UTILITAIRES ===================
const getFieldCompletionPercentage = (obj: any, requiredFields: string[]): number => {
  const completedFields = requiredFields.filter(field => obj?.[field]).length;
  return Math.round((completedFields / requiredFields.length) * 100);
};

const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('C-SECUR360', {
      body: message,
      icon: '/c-secur360-logo.png'
    });
  }
};

export default PermitManager;
