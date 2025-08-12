// PermitManager.tsx - Version Complète Corrigée Compatible SafetyManager Build Ready
"use client";

import { logger } from '@/lib/logger';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Database, QrCode, Printer, Mail, Share, Download, 
  Save, CheckCircle, AlertTriangle, Clock, Shield, Users, 
  Wrench, Activity, Eye, Globe, Smartphone, Copy, Check,
  BarChart3, TrendingUp, Calendar, MapPin, Building, User,
  Search, X, Plus, Edit3, Trash2, RefreshCw, Upload,
  ArrowRight, ArrowLeft, Star, Target, Zap, Wind, History
} from 'lucide-react';

// Import SafetyManager et styles unifiés
import { ConfinedSpaceComponentProps, ConfinedSpaceDetails } from './SafetyManager';
import { styles } from './styles';

// =================== INTERFACES ===================
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

// ✅ TYPE GUARD FUNCTIONS POUR CORRIGER L'ERREUR BUILD
function isSiteInformationComplete(siteInfo: ConfinedSpaceDetails | {}): siteInfo is ConfinedSpaceDetails {
  return (
    siteInfo && 
    typeof siteInfo === 'object' &&
    'projectNumber' in siteInfo &&
    'workLocation' in siteInfo &&
    'contractor' in siteInfo &&
    'supervisor' in siteInfo
  );
}

function getSiteInfoValue<K extends keyof ConfinedSpaceDetails>(
  siteInfo: ConfinedSpaceDetails | {}, 
  key: K
): ConfinedSpaceDetails[K] | undefined {
  if (siteInfo && typeof siteInfo === 'object' && key in siteInfo) {
    return (siteInfo as ConfinedSpaceDetails)[key];
  }
  return undefined;
}

// ✅ TYPE GUARD POUR RESCUE PLAN
function isRescuePlanComplete(rescuePlan: any): boolean {
  return (
    rescuePlan && 
    typeof rescuePlan === 'object' &&
    'emergencyContacts' in rescuePlan &&
    Array.isArray(rescuePlan.emergencyContacts) &&
    rescuePlan.emergencyContacts.length > 0
  );
}

// =================== TRADUCTIONS ===================
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
    
    savePermit: "Save",
    printPDF: "Print PDF",
    emailPermit: "Send by Email",
    sharePermit: "Share",
    generateQR: "Generate QR Code",
    exportData: "Export Data",
    searchDatabase: "Search Database",
    viewHistory: "View History",
    newPermit: "New Permit",
    
    summary: "Permit Summary",
    validation: "Validation and Compliance",
    actions: "Permit Actions",
    statistics: "Statistics",
    qrCode: "QR Code - Mobile Access",
    sharing: "Sharing and Distribution",
    history: "Permit History",
    database: "Database",
    
    complete: "Complete",
    incomplete: "Incomplete",
    valid: "Valid",
    invalid: "Invalid",
    saving: "Saving...",
    saved: "Saved",
    loading: "Loading...",
    searching: "Searching...",
    
    saveSuccess: "Permit saved successfully!",
    validationPassed: "All validations passed",
    validationErrors: "Validation errors detected",
    qrGenerated: "QR Code generated successfully",
    linkCopied: "Link copied to clipboard",
    pdfGenerated: "PDF generated successfully",
    emailSent: "Email sent successfully",
    noResults: "No results found",
    searchPlaceholder: "Search by number, project, location...",
    
    siteInformation: "Site Information",
    rescuePlan: "Rescue Plan",
    atmosphericTesting: "Atmospheric Testing", 
    entryRegistry: "Entry Registry",
    
    totalPermits: "Total Permits",
    activePermits: "Active Permits",
    completedPermits: "Completed Permits",
    draftPermits: "Drafts",
    dangerousSpaces: "Dangerous Spaces",
    safeSpaces: "Safe Spaces",
    avgCompletion: "Average Completion",
    lastActivity: "Last Activity",
    
    draft: "Draft",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    
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
const PermitManager: React.FC<ConfinedSpaceComponentProps> = ({
  language = 'fr',
  permitData,
  selectedProvince = 'QC',
  regulations,
  isMobile: propIsMobile = false,
  safetyManager
}) => {
  const currentIsMobile = propIsMobile || (typeof window !== 'undefined' && window.innerWidth < 768);
  const t = translations[language];
  
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

  // ✅ CORRECTION 1 & 2 : Validation globale avec vérifications SafetyManager
  const validation = React.useMemo(() => {
    if (safetyManager) {
      try {
        return safetyManager.validatePermitCompleteness();
      } catch (error) {
        logger.warn('SafetyManager validatePermitCompleteness failed:', error);
        return { isValid: false, percentage: 0, errors: ['Erreur de validation'] };
      }
    }
    // Fallback validation basique
    return { isValid: false, percentage: 0, errors: ['SafetyManager non disponible'] };
  }, [safetyManager]);

  const permit = React.useMemo(() => {
    if (permitData) {
      return permitData;
    }
    if (safetyManager) {
      try {
        return safetyManager.currentPermit;
      } catch (error) {
        logger.warn('SafetyManager currentPermit access failed:', error);
        return {
          permit_number: 'N/A',
          siteInformation: {},
          rescuePlan: {},
          atmosphericTesting: {},
          entryRegistry: {},
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        };
      }
    }
    // Fallback permit vide
    return {
      permit_number: 'N/A',
      siteInformation: {},
      rescuePlan: {},
      atmosphericTesting: {},
      entryRegistry: {},
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };
  }, [permitData, safetyManager]);

  // =================== FONCTIONS UTILITAIRES ===================
  
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    logger.info(`[${type.toUpperCase()}] ${message}`);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('C-SECUR360', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // ✅ CORRECTION 3 : Handler sauvegarde avec vérifications SafetyManager
  const handleSave = async () => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

    try {
      const permitNumber = await safetyManager.saveToDatabase();
      if (permitNumber) {
        showNotification(t.saveSuccess, 'success');
        
        // Générer QR automatiquement après sauvegarde
        if (!qrCodeUrl) {
          handleGenerateQR();
        }
      }
    } catch (error) {
      logger.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  // ✅ CORRECTION 3 : Handler QR avec vérifications SafetyManager
  const handleGenerateQR = async () => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

    setIsGeneratingQR(true);
    try {
      const qrUrl = await safetyManager.generateQRCode();
      setQrCodeUrl(qrUrl);
      showNotification(t.qrGenerated, 'success');
    } catch (error) {
      logger.error('Erreur QR:', error);
      showNotification('Erreur génération QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // ✅ CORRECTION 3 : Handler PDF avec vérifications SafetyManager
  const handleGeneratePDF = async () => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

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
      logger.error('Erreur PDF:', error);
      showNotification('Erreur génération PDF', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ✅ CORRECTION 3 : Handler partage avec vérifications SafetyManager
  const handleShare = async () => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

    try {
      await safetyManager.sharePermit(selectedShareMethod);
      showNotification(t.emailSent, 'success');
    } catch (error) {
      logger.error('Erreur partage:', error);
      showNotification('Erreur lors du partage', 'error');
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    
    const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
    try {
      await navigator.clipboard.writeText(permitUrl);
      setLinkCopied(true);
      showNotification(t.linkCopied, 'success');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      logger.error('Erreur copie:', error);
      showNotification('Erreur copie du lien', 'error');
    }
  };

  // ✅ CORRECTION 3 : Handler recherche avec vérifications SafetyManager
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    if (!safetyManager) {
      setSearchResults([]);
      showNotification('SafetyManager non disponible pour la recherche', 'warning');
      return;
    }
    
    setIsSearching(true);
    try {
      const allPermits = await safetyManager.loadPermitHistory();
      const filtered = allPermits.filter((permit: any) => 
        permit.permit_number?.toLowerCase().includes(query.toLowerCase()) ||
        getSiteInfoValue(permit.siteInformation, 'projectNumber')?.toLowerCase().includes(query.toLowerCase()) ||
        getSiteInfoValue(permit.siteInformation, 'workLocation')?.toLowerCase().includes(query.toLowerCase()) ||
        getSiteInfoValue(permit.siteInformation, 'contractor')?.toLowerCase().includes(query.toLowerCase())
      );
      
      const results: PermitHistoryEntry[] = filtered.map((permit: any) => ({
        id: permit.id || '',
        permitNumber: permit.permit_number || '',
        projectNumber: getSiteInfoValue(permit.siteInformation, 'projectNumber') || '',
        workLocation: getSiteInfoValue(permit.siteInformation, 'workLocation') || '',
        contractor: getSiteInfoValue(permit.siteInformation, 'contractor') || '',
        spaceType: getSiteInfoValue(permit.siteInformation, 'spaceType') || '',
        csaClass: getSiteInfoValue(permit.siteInformation, 'csaClass') || '',
        status: permit.status || 'draft',
        createdAt: permit.created_at || '',
        lastModified: permit.last_modified || '',
        hazardCount: (getSiteInfoValue(permit.siteInformation, 'atmosphericHazards')?.length || 0) + 
                    (getSiteInfoValue(permit.siteInformation, 'physicalHazards')?.length || 0),
        photoCount: getSiteInfoValue(permit.siteInformation, 'spacePhotos')?.length || 0,
        qrCode: qrCodeUrl
      }));
      
      setSearchResults(results);
    } catch (error) {
      logger.error('Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [safetyManager, qrCodeUrl]);

  // ✅ CORRECTION 3 : Handler chargement avec vérifications SafetyManager
  const handleLoadPermit = async (permitNumber: string) => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

    try {
      await safetyManager.loadFromDatabase(permitNumber);
      setCurrentView('main');
      showNotification(`Permis ${permitNumber} chargé`, 'success');
    } catch (error) {
      logger.error('Erreur chargement:', error);
      showNotification(`Erreur chargement ${permitNumber}`, 'error');
    }
  };

  // ✅ CORRECTION 3 : Handler nouveau permis avec vérifications SafetyManager
  const handleCreateNewPermit = () => {
    if (!safetyManager) {
      showNotification('SafetyManager non disponible', 'error');
      return;
    }

    try {
      safetyManager.createNewPermit(selectedProvince);
      showNotification('Nouveau permis créé', 'success');
    } catch (error) {
      logger.error('Erreur création permis:', error);
      showNotification('Erreur création nouveau permis', 'error');
    }
  };

  // ✅ CORRECTION BUILD PRINCIPALE - Fonction getSectionValidation avec type guards
  const getSectionValidation = (): ValidationSummary[] => {
    return [
      {
        sectionName: t.siteInformation,
        icon: <Building style={{ width: '20px', height: '20px' }} />,
        // ✅ LIGNE 476 CORRIGÉE - Type guard pour éviter l'erreur union type
        isComplete: Boolean(
          isSiteInformationComplete(permit.siteInformation) &&
          permit.siteInformation.projectNumber && 
          permit.siteInformation.workLocation
        ),
        // ✅ LIGNE 477 CORRIGÉE - Type guard pour getFieldCompletionPercentage
        completionPercentage: isSiteInformationComplete(permit.siteInformation)
          ? getFieldCompletionPercentage(permit.siteInformation, ['projectNumber', 'workLocation', 'contractor', 'supervisor'])
          : 0,
        // ✅ LIGNE 478 CORRIGÉE - Type guard pour errors check
        errors: (
          isSiteInformationComplete(permit.siteInformation) &&
          permit.siteInformation.projectNumber
        ) ? [] : ['Numéro de projet manquant'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.rescuePlan,
        icon: <Shield style={{ width: '20px', height: '20px' }} />,
        // ✅ LIGNES 521-523 CORRIGÉES - Type guard pour RescuePlan
        isComplete: isRescuePlanComplete(permit.rescuePlan),
        completionPercentage: isRescuePlanComplete(permit.rescuePlan) ? 100 : 0,
        errors: isRescuePlanComplete(permit.rescuePlan) ? [] : ['Plan de sauvetage incomplet'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.atmosphericTesting,
        icon: <Activity style={{ width: '20px', height: '20px' }} />,
        // ✅ TYPE GUARD pour atmosphericTesting aussi
        isComplete: Boolean(
          permit.atmosphericTesting && 
          typeof permit.atmosphericTesting === 'object' &&
          'readings' in permit.atmosphericTesting &&
          Array.isArray(permit.atmosphericTesting.readings) &&
          permit.atmosphericTesting.readings.length > 0
        ),
        completionPercentage: (
          permit.atmosphericTesting && 
          typeof permit.atmosphericTesting === 'object' &&
          'readings' in permit.atmosphericTesting &&
          Array.isArray(permit.atmosphericTesting.readings) &&
          permit.atmosphericTesting.readings.length > 0
        ) ? 100 : 0,
        errors: (
          permit.atmosphericTesting && 
          typeof permit.atmosphericTesting === 'object' &&
          'readings' in permit.atmosphericTesting &&
          Array.isArray(permit.atmosphericTesting.readings) &&
          permit.atmosphericTesting.readings.length > 0
        ) ? [] : ['Tests atmosphériques manquants'],
        lastModified: permit.last_modified
      },
      {
        sectionName: t.entryRegistry,
        icon: <Users style={{ width: '20px', height: '20px' }} />,
        // ✅ TYPE GUARD pour entryRegistry aussi
        isComplete: Boolean(
          permit.entryRegistry && 
          typeof permit.entryRegistry === 'object' &&
          'personnel' in permit.entryRegistry &&
          Array.isArray(permit.entryRegistry.personnel) &&
          permit.entryRegistry.personnel.length > 0
        ),
        completionPercentage: (
          permit.entryRegistry && 
          typeof permit.entryRegistry === 'object' &&
          'personnel' in permit.entryRegistry &&
          Array.isArray(permit.entryRegistry.personnel) &&
          permit.entryRegistry.personnel.length > 0
        ) ? 100 : 0,
        errors: (
          permit.entryRegistry && 
          typeof permit.entryRegistry === 'object' &&
          'personnel' in permit.entryRegistry &&
          Array.isArray(permit.entryRegistry.personnel) &&
          permit.entryRegistry.personnel.length > 0
        ) ? [] : ['Personnel manquant'],
        lastModified: permit.last_modified
      }
    ];
  };

  const getPermitStatistics = () => {
    // ✅ CORRECTION 3 : Vérifications SafetyManager pour lastSaved
    const lastSaved = safetyManager?.lastSaved ? 
      new Date(safetyManager.lastSaved).toLocaleString() : 
      'Jamais';

    // ✅ SÉCURISER ACCÈS AUX PROPRIÉTÉS AVEC TYPE GUARDS
    const totalPersonnel = (
      permit.entryRegistry && 
      typeof permit.entryRegistry === 'object' &&
      'personnel' in permit.entryRegistry &&
      Array.isArray(permit.entryRegistry.personnel)
    ) ? permit.entryRegistry.personnel.length : 0;

    const activeEntrants = (
      permit.entryRegistry && 
      typeof permit.entryRegistry === 'object' &&
      'activeEntrants' in permit.entryRegistry &&
      Array.isArray(permit.entryRegistry.activeEntrants)
    ) ? permit.entryRegistry.activeEntrants.length : 0;

    const atmosphericReadings = (
      permit.atmosphericTesting && 
      typeof permit.atmosphericTesting === 'object' &&
      'readings' in permit.atmosphericTesting &&
      Array.isArray(permit.atmosphericTesting.readings)
    ) ? permit.atmosphericTesting.readings.length : 0;

    return {
      totalSections: 4,
      completedSections: getSectionValidation().filter(s => s.isComplete).length,
      totalPersonnel,
      activeEntrants,
      atmosphericReadings,
      lastSaved,
      permitAge: permit.created_at ? Math.floor((Date.now() - new Date(permit.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      hazardCount: (getSiteInfoValue(permit.siteInformation, 'atmosphericHazards')?.length || 0) + 
                   (getSiteInfoValue(permit.siteInformation, 'physicalHazards')?.length || 0),
      photoCount: getSiteInfoValue(permit.siteInformation, 'spacePhotos')?.length || 0,
      volume: getSiteInfoValue(permit.siteInformation, 'dimensions')?.volume || 0,
      unitSystem: getSiteInfoValue(permit.siteInformation, 'unitSystem') || 'metric'
    };
  };

  // =================== EFFETS ===================
  useEffect(() => {
    if (permit.permit_number && !qrCodeUrl && safetyManager) {
      handleGenerateQR();
    }
  }, [permit.permit_number, qrCodeUrl, safetyManager]);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: currentIsMobile ? '20px' : '28px' }}>
        {/* Header de retour */}
        <div style={styles.card}>
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
                <h2 style={{ fontSize: currentIsMobile ? '20px' : '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                  <Database style={{ display: 'inline', marginRight: '12px', width: '24px', height: '24px' }} />
                  {t.database}
                </h2>
                <p style={{ color: '#d1d5db', fontSize: currentIsMobile ? '14px' : '16px', margin: '4px 0 0 0' }}>
                  {selectedProvince} - {'Réglementation provinciale'}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: currentIsMobile ? '20px' : '28px' }}>
      {/* Header Principal */}
      <div style={styles.card}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: currentIsMobile ? '20px' : '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: currentIsMobile ? '16px' : '20px' }}>
            <div style={{
              width: currentIsMobile ? '48px' : '60px',
              height: currentIsMobile ? '48px' : '60px',
              background: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Wrench style={{ 
                width: currentIsMobile ? '24px' : '30px', 
                height: currentIsMobile ? '24px' : '30px', 
                color: '#60a5fa' 
              }} />
            </div>
            <div>
              <h1 style={{
                fontSize: currentIsMobile ? '20px' : '28px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px',
                lineHeight: 1.2
              }}>
                ⚙️ {t.title}
              </h1>
              <p style={{
                color: '#d1d5db',
                fontSize: currentIsMobile ? '14px' : '16px',
                lineHeight: 1.5,
                margin: 0
              }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: currentIsMobile ? '24px' : '32px',
              fontWeight: '700',
              color: validation.isValid ? '#10b981' : '#f59e0b',
              marginBottom: '4px'
            }}>
              {validation.percentage}%
            </div>
            <div style={{ 
              fontSize: currentIsMobile ? '12px' : '14px', 
              color: '#d1d5db' 
            }}>
              {validation.isValid ? '✅ Valide' : '⚠️ Incomplet'}
            </div>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div style={{
          display: 'flex',
          gap: currentIsMobile ? '8px' : '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCurrentView('database')}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              flex: currentIsMobile ? '1' : 'none',
              fontSize: currentIsMobile ? '12px' : '14px'
            }}
          >
            <Database size={16} />
            {t.searchDatabase}
          </button>
          <button
            onClick={handleCreateNewPermit}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              flex: currentIsMobile ? '1' : 'none',
              fontSize: currentIsMobile ? '12px' : '14px'
            }}
          >
            <Plus size={16} />
            {t.newPermit}
          </button>
        </div>
      </div>

      {/* Résumé du Permis */}
      <div style={styles.card}>
        <h2 style={{
          fontSize: currentIsMobile ? '18px' : '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FileText style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
          {t.summary}
        </h2>
        
        <div style={styles.grid2}>
          <div>
            <h3 style={{ color: '#d1d5db', fontSize: '16px', marginBottom: '12px' }}>Informations Principales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Numéro:</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{permit.permit_number || 'Non assigné'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Projet:</span>
                <span style={{ color: 'white' }}>{getSiteInfoValue(permit.siteInformation, 'projectNumber') || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Lieu:</span>
                <span style={{ color: 'white' }}>{getSiteInfoValue(permit.siteInformation, 'workLocation') || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Entrepreneur:</span>
                <span style={{ color: 'white' }}>{getSiteInfoValue(permit.siteInformation, 'contractor') || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 style={{ color: '#d1d5db', fontSize: '16px', marginBottom: '12px' }}>Statistiques</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Sections complètes:</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>{stats.completedSections}/{stats.totalSections}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Personnel:</span>
                <span style={{ color: 'white' }}>{stats.totalPersonnel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Tests atmosphériques:</span>
                <span style={{ color: 'white' }}>{stats.atmosphericReadings}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Dernière sauvegarde:</span>
                <span style={{ color: '#f59e0b', fontSize: '12px' }}>{stats.lastSaved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation des Sections */}
      <div style={styles.card}>
        <h2 style={{
          fontSize: currentIsMobile ? '18px' : '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />
          {t.validation}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map((section, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: section.isComplete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                border: `2px solid ${section.isComplete ? '#10b981' : '#f59e0b'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {section.icon}
                <div>
                  <h4 style={{ 
                    color: section.isComplete ? '#86efac' : '#fde047', 
                    margin: 0, 
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {section.sectionName}
                  </h4>
                  {section.errors.length > 0 && (
                    <p style={{ 
                      color: '#fca5a5', 
                      margin: '4px 0 0 0', 
                      fontSize: '14px' 
                    }}>
                      {section.errors[0]}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: section.isComplete ? '#10b981' : '#f59e0b'
                }}>
                  {section.completionPercentage}%
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {section.isComplete ? 'Complété' : 'Incomplet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions du Permis */}
      <div style={styles.card}>
        <h2 style={{
          fontSize: currentIsMobile ? '18px' : '20px',
          fontWeight: '600',
          color: 'white',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Wrench style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
          {t.actions}
        </h2>

        <div style={styles.grid2}>
          <button
            onClick={handleSave}
            disabled={!safetyManager || (safetyManager && safetyManager.isSaving)}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              opacity: (!safetyManager || (safetyManager && safetyManager.isSaving)) ? 0.7 : 1
            }}
          >
            {safetyManager && safetyManager.isSaving ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={20} />
            )}
            {safetyManager && safetyManager.isSaving ? t.saving : t.savePermit}
          </button>

          <button
            onClick={handleGenerateQR}
            disabled={isGeneratingQR || !safetyManager}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: (isGeneratingQR || !safetyManager) ? 0.7 : 1
            }}
          >
            {isGeneratingQR ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <QrCode size={20} />
            )}
            {t.generateQR}
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF || !safetyManager}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              opacity: (isGeneratingPDF || !safetyManager) ? 0.7 : 1
            }}
          >
            {isGeneratingPDF ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Printer size={20} />
            )}
            {t.printPDF}
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              ...styles.button,
              backgroundColor: linkCopied ? '#10b981' : '#6b7280',
              color: 'white'
            }}
          >
            {linkCopied ? <Check size={20} /> : <Copy size={20} />}
            {linkCopied ? 'Copié!' : 'Copier Lien'}
          </button>
        </div>

        {/* Section Partage */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#d1d5db', fontSize: '16px', marginBottom: '16px' }}>{t.sharing}</h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(['email', 'sms', 'whatsapp'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedShareMethod(method)}
                style={{
                  ...styles.button,
                  backgroundColor: selectedShareMethod === method ? '#3b82f6' : '#4b5563',
                  color: 'white',
                  flex: currentIsMobile ? '1' : 'none'
                }}
              >
                {method === 'email' && <Mail size={16} />}
                {method === 'sms' && <Smartphone size={16} />}
                {method === 'whatsapp' && <Share size={16} />}
                {method === 'email' ? 'Email' : method === 'sms' ? 'SMS' : 'WhatsApp'}
              </button>
            ))}
          </div>

          <button
            onClick={handleShare}
            disabled={!safetyManager}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              width: '100%',
              opacity: !safetyManager ? 0.7 : 1
            }}
          >
            <Share size={20} />
            {t.sharePermit} par {selectedShareMethod === 'email' ? 'Email' : selectedShareMethod === 'sms' ? 'SMS' : 'WhatsApp'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      {qrCodeUrl && (
        <div style={styles.card}>
          <h2 style={{
            fontSize: currentIsMobile ? '18px' : '20px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <QrCode style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
            {t.qrCode}
          </h2>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <img 
                src={qrCodeUrl} 
                alt="QR Code du permis" 
                style={{ 
                  width: currentIsMobile ? '200px' : '250px', 
                  height: currentIsMobile ? '200px' : '250px',
                  display: 'block'
                }} 
              />
            </div>
            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.5 }}>
              📱 Scannez ce code QR pour accéder au permis depuis un appareil mobile
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// =================== FONCTION UTILITAIRE ===================
const getFieldCompletionPercentage = (obj: any, requiredFields: string[]): number => {
  if (!obj) return 0;
  const completedFields = requiredFields.filter(field => obj[field]).length;
  return Math.round((completedFields / requiredFields.length) * 100);
};

export default PermitManager;
