'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  FileText, Database, QrCode, Printer, Mail, Share, Download, 
  Save, CheckCircle, AlertTriangle, Clock, Shield, Users, 
  Wrench, Activity, Eye, Globe, Smartphone, Copy, Check,
  BarChart3, TrendingUp, Calendar, MapPin, Building, User,
  Search, X, Plus, Edit3, Trash2, RefreshCw, Upload,
  ArrowRight, ArrowLeft, Star, Target, Zap, Wind, History,
  Camera, Archive, Send, MessageSquare, Lock, Unlock
} from 'lucide-react';

// =================== INTERFACES PRINCIPALES ===================
interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
}

interface ASTHistoryEntry {
  id: string;
  astNumber: string;
  projectNumber: string;
  workLocation: string;
  client: string;
  industry: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'archived';
  createdAt: string;
  lastModified: string;
  hazardCount: number;
  equipmentCount: number;
  workerCount: number;
  photoCount: number;
  qrCode?: string;
  completionPercentage: number;
}

interface DocumentGeneration {
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  includeBranding: boolean;
  includeTimestamps: boolean;
  includeComments: boolean;
  includeStatistics: boolean;
  includeValidation: boolean;
  format: 'pdf' | 'word' | 'html';
  template: 'standard' | 'detailed' | 'executive' | 'mobile';
}

interface FinalizationData {
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  isLocked: boolean;
  lockTimestamp?: string;
  lockReason?: string;
  completionPercentage: number;
  qrCodeUrl?: string;
  shareableLink?: string;
  lastSaved?: string;
}

interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'hazard' | 'equipment' | 'site' | 'team' | 'safety' | 'other';
  location?: string;
  tags?: string[];
}

interface FinalizationStepProps {
  formData: any; // ✅ ACCÈS À TOUTES LES DONNÉES DES STEPS 1-5
  onDataChange: (section: string, data: FinalizationData) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

// =================== TYPES DE SÉCURITÉ ===================
type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack';
type LockType = 'temporary' | 'permanent' | 'review' | 'archive';
type ValidationLevel = 'basic' | 'standard' | 'comprehensive' | 'regulatory';

// =================== SYSTÈME DE TRADUCTIONS BILINGUE COMPLET ===================
const translations = {
  fr: {
    // Titre principal
    title: "🛡️ Finalisation et Gestion AST",
    subtitle: "Validation, Sauvegarde, Partage et Archivage Professionnel",
    
    // Onglets principaux
    tabs: {
      validation: "✅ Validation",
      actions: "⚡ Actions", 
      sharing: "📤 Partage",
      database: "🗄️ Base de Données",
      reports: "📊 Rapports"
    },
    
    // Validation et conformité
    validation: "Validation et Conformité",
    validationSummary: "Résumé de Validation",
    allValidationsPassed: "Toutes les validations sont réussies",
    validationErrors: "Erreurs de validation détectées",
    sectionsComplete: "Sections complétées",
    overallCompletion: "Complétion globale",
    
    // Actions principales AST
    saveAST: "💾 Sauvegarder AST",
    printPDF: "🖨️ Rapport PDF",
    generateQR: "📱 Générer QR Code",
    shareAST: "📤 Partager AST",
    exportData: "📊 Exporter Données", 
    searchDatabase: "🔍 Rechercher Base",
    viewHistory: "📚 Voir Historique",
    newAST: "➕ Nouvelle AST",
    archiveAST: "📁 Archiver",
    lockAST: "🔒 Verrouiller",
    
    // Sections AST
    projectInformation: "Informations Projet",
    equipmentSafety: "Équipements Sécurité",
    hazardsControls: "Dangers et Contrôles",
    permitsAuthorizations: "Permis et Autorisations",
    teamValidation: "Validation Équipe",
    
    // Statuts
    complete: "Complété",
    incomplete: "Incomplet",
    valid: "Valide",
    invalid: "Non valide",
    saving: "Sauvegarde...",
    saved: "Sauvegardé",
    loading: "Chargement...",
    searching: "Recherche...",
    generating: "Génération...",
    
    // Messages de succès/erreur
    saveSuccess: "AST sauvegardée avec succès dans Supabase!",
    validationPassed: "Toutes les validations sont réussies",
    validationFailed: "Certaines validations ont échoué",
    qrGenerated: "Code QR généré avec succès",
    linkCopied: "Lien copié dans le presse-papiers",
    pdfGenerated: "Rapport PDF généré avec succès",
    emailSent: "Email envoyé avec succès",
    astLocked: "AST verrouillée définitivement",
    astArchived: "AST archivée avec succès",
    noResults: "Aucun résultat trouvé",
    searchPlaceholder: "Rechercher par numéro AST, projet, client...",
    
    // Options de génération de rapport
    reportOptions: "Options de Rapport",
    includePhotos: "📸 Inclure Photos",
    includeSignatures: "✍️ Inclure Signatures",
    includeQRCode: "📱 Inclure QR Code",
    includeBranding: "🏢 Inclure Branding",
    includeTimestamps: "🕒 Inclure Horodatage",
    includeComments: "💬 Inclure Commentaires",
    includeStatistics: "📊 Inclure Statistiques",
    includeValidation: "✅ Inclure Validation",
    
    // Templates de rapport
    reportTemplates: "Modèles de Rapport",
    standardTemplate: "📄 Standard",
    detailedTemplate: "📋 Détaillé",
    executiveTemplate: "👔 Exécutif",
    mobileTemplate: "📱 Mobile",
    
    // Partage et distribution
    sharing: "Partage et Distribution",
    shareInstructions: "Instructions de partage:",
    shareList: [
      "Partagez ce lien avec votre équipe pour consultation",
      "Chaque membre peut consulter l'AST et donner son approbation",
      "Le rapport PDF peut être téléchargé directement",
      "Le QR Code permet un accès mobile rapide"
    ],
    
    // Commentaires finaux
    finalComments: "💬 Commentaires Finaux et Notes",
    commentsPlaceholder: "Ajoutez des commentaires finaux, recommandations, leçons apprises ou instructions spéciales pour cette AST...",
    documentLocked: "🔒 Document verrouillé - Modification impossible",
    
    // Verrouillage et archivage
    confirmLock: "🔒 Confirmer le Verrouillage",
    lockWarning: "ATTENTION: Cette action est irréversible !",
    autoChecks: "📊 Vérifications automatiques:",
    sectionsCompleted: "✅ Sections complétées:",
    lockPermanently: "🔒 Verrouiller Définitivement",
    lockDescription: "Une fois verrouillée, l'AST ne pourra plus être modifiée mais restera consultable et partageable.",
    
    // Statistiques AST
    statistics: "📊 Statistiques AST",
    totalSections: "Sections Totales",
    completedSections: "Sections Complétées", 
    identifiedHazards: "Dangers Identifiés",
    selectedEquipment: "Équipements Sélectionnés",
    requiredPermits: "Permis Requis",
    teamMembers: "Membres Équipe",
    documentsPhotos: "Documents/Photos",
    lastActivity: "Dernière Activité",
    creationDate: "Date de Création",
    
    // Types d'industries
    industries: {
      construction: "🏗️ Construction",
      industrial: "🏭 Industriel",
      manufacturing: "⚙️ Manufacturier",
      electrical: "⚡ Électrique",
      mining: "⛏️ Minier",
      oil_gas: "🛢️ Pétrole et Gaz",
      transportation: "🚛 Transport",
      healthcare: "🏥 Santé",
      education: "🎓 Éducation",
      office: "🏢 Bureau",
      retail: "🛒 Commerce",
      hospitality: "🏨 Hôtellerie",
      other: "🔧 Autre"
    },
    
    // Statuts AST
    draft: "📝 Brouillon",
    active: "🟢 Actif",
    completed: "✅ Complété",
    cancelled: "❌ Annulé",
    archived: "📁 Archivé",
    
    // Boutons génériques
    add: "Ajouter",
    cancel: "Annuler",
    close: "Fermer",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    download: "Télécharger",
    print: "Imprimer",
    share: "Partager",
    copy: "Copier",
    export: "Exporter",
    import: "Importer",
    refresh: "Actualiser",
    back: "Retour"
  },
  
  en: {
    // Main title
    title: "🛡️ JSA Finalization and Management", 
    subtitle: "Professional Validation, Saving, Sharing and Archiving",
    
    // Main tabs
    tabs: {
      validation: "✅ Validation",
      actions: "⚡ Actions",
      sharing: "📤 Sharing", 
      database: "🗄️ Database",
      reports: "📊 Reports"
    },
    
    // Validation and compliance
    validation: "Validation and Compliance",
    validationSummary: "Validation Summary",
    allValidationsPassed: "All validations passed",
    validationErrors: "Validation errors detected",
    sectionsComplete: "Sections completed",
    overallCompletion: "Overall completion",
    
    // Main JSA actions
    saveAST: "💾 Save JSA",
    printPDF: "🖨️ PDF Report", 
    generateQR: "📱 Generate QR Code",
    shareAST: "📤 Share JSA",
    exportData: "📊 Export Data",
    searchDatabase: "🔍 Search Database",
    viewHistory: "📚 View History",
    newAST: "➕ New JSA",
    archiveAST: "📁 Archive",
    lockAST: "🔒 Lock",
    
    // JSA sections
    projectInformation: "Project Information",
    equipmentSafety: "Safety Equipment",
    hazardsControls: "Hazards and Controls", 
    permitsAuthorizations: "Permits and Authorizations",
    teamValidation: "Team Validation",
    
    // Status
    complete: "Complete",
    incomplete: "Incomplete",
    valid: "Valid",
    invalid: "Invalid",
    saving: "Saving...",
    saved: "Saved",
    loading: "Loading...",
    searching: "Searching...",
    generating: "Generating...",
    
    // Success/error messages
    saveSuccess: "JSA saved successfully to Supabase!",
    validationPassed: "All validations passed",
    validationFailed: "Some validations failed",
    qrGenerated: "QR Code generated successfully", 
    linkCopied: "Link copied to clipboard",
    pdfGenerated: "PDF report generated successfully",
    emailSent: "Email sent successfully",
    astLocked: "JSA locked permanently",
    astArchived: "JSA archived successfully",
    noResults: "No results found",
    searchPlaceholder: "Search by JSA number, project, client...",
    
    // Report generation options
    reportOptions: "Report Options",
    includePhotos: "📸 Include Photos",
    includeSignatures: "✍️ Include Signatures", 
    includeQRCode: "📱 Include QR Code",
    includeBranding: "🏢 Include Branding",
    includeTimestamps: "🕒 Include Timestamps",
    includeComments: "💬 Include Comments",
    includeStatistics: "📊 Include Statistics",
    includeValidation: "✅ Include Validation",
    
    // Report templates
    reportTemplates: "Report Templates",
    standardTemplate: "📄 Standard",
    detailedTemplate: "📋 Detailed",
    executiveTemplate: "👔 Executive", 
    mobileTemplate: "📱 Mobile",
    
    // Sharing and distribution
    sharing: "Sharing and Distribution",
    shareInstructions: "Sharing instructions:",
    shareList: [
      "Share this link with your team for consultation",
      "Each member can review the JSA and give approval",
      "PDF report can be downloaded directly", 
      "QR Code allows quick mobile access"
    ],
    
    // Final comments
    finalComments: "💬 Final Comments and Notes",
    commentsPlaceholder: "Add final comments, recommendations, lessons learned or special instructions for this JSA...",
    documentLocked: "🔒 Document locked - Cannot modify",
    
    // Locking and archiving
    confirmLock: "🔒 Confirm Lock",
    lockWarning: "WARNING: This action is irreversible!",
    autoChecks: "📊 Automatic checks:",
    sectionsCompleted: "✅ Sections completed:",
    lockPermanently: "🔒 Lock Permanently",
    lockDescription: "Once locked, the JSA cannot be modified but will remain viewable and shareable.",
    
    // JSA statistics
    statistics: "📊 JSA Statistics",
    totalSections: "Total Sections",
    completedSections: "Completed Sections",
    identifiedHazards: "Identified Hazards", 
    selectedEquipment: "Selected Equipment",
    requiredPermits: "Required Permits",
    teamMembers: "Team Members",
    documentsPhotos: "Documents/Photos",
    lastActivity: "Last Activity",
    creationDate: "Creation Date",
    
    // Industry types
    industries: {
      construction: "🏗️ Construction",
      industrial: "🏭 Industrial",
      manufacturing: "⚙️ Manufacturing",
      electrical: "⚡ Electrical", 
      mining: "⛏️ Mining",
      oil_gas: "🛢️ Oil and Gas",
      transportation: "🚛 Transportation",
      healthcare: "🏥 Healthcare",
      education: "🎓 Education",
      office: "🏢 Office",
      retail: "🛒 Retail",
      hospitality: "🏨 Hospitality",
      other: "🔧 Other"
    },
    
    // JSA status
    draft: "📝 Draft",
    active: "🟢 Active", 
    completed: "✅ Completed",
    cancelled: "❌ Cancelled",
    archived: "📁 Archived",
    
    // Generic buttons
    add: "Add",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete", 
    edit: "Edit",
    view: "View",
    download: "Download",
    print: "Print",
    share: "Share",
    copy: "Copy",
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    back: "Back"
  }
};

// =================== FONCTION PRINCIPALE STEP6 ===================
function Step6Finalization({ 
  formData, // ✅ CONTIENT TOUTES LES DONNÉES : projectInfo, equipment, hazards, permits, validation
  onDataChange, 
  language = 'fr',
  tenant 
}: FinalizationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== TRADUCTIONS ===================
  const t = translations[language] || translations.fr;
  
  // =================== DÉTECTION MOBILE RESPONSIVE ===================
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // =================== ÉTATS PRINCIPAUX ULTRA-STABLES ===================
  const [activeTab, setActiveTab] = useState('validation');
  const [currentView, setCurrentView] = useState<'main' | 'history' | 'database'>('main');
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ASTHistoryEntry[]>([]);
  
  // États de partage
  const [selectedShareMethod, setSelectedShareMethod] = useState<ShareMethod>('email');
  
  // ✅ FIX CRITIQUE : État finalisation STABLE SANS BOUCLE
  const [finalizationData, setFinalizationData] = useState<FinalizationData>(() => ({
    photos: [],
    finalComments: '',
    documentGeneration: {
      includePhotos: true,
      includeSignatures: true,
      includeQRCode: true,
      includeBranding: true,
      includeTimestamps: true,
      includeComments: true,
      includeStatistics: true,
      includeValidation: true,
      format: 'pdf',
      template: 'detailed'
    },
    isLocked: false,
    completionPercentage: 85,
    qrCodeUrl: '',
    shareableLink: '',
    lastSaved: ''
  }));

  // =================== FONCTIONS UTILITAIRES ===================
  
  /**
   * ✅ FONCTION NOTIFICATION AVEC GESTION D'ERREURS
   */
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`[${type.toUpperCase()}] Step6 - ${message}`);
    
    // Notification toast simple
    if (typeof window !== 'undefined') {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }, []);

  /**
   * ✅ FONCTION EXTRACTION DONNÉES COMPLÈTE DE TOUS LES STEPS
   */
  const extractCompleteASTData = useCallback(() => {
    console.log('📊 Step6 - Extraction données complètes AST:', formData);
    
    return {
      // Métadonnées AST
      metadata: {
        astNumber: formData?.astNumber || `AST-${tenant.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        tenant,
        language,
        createdAt: formData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        status: formData?.status || 'draft'
      },
      
      // Step 1 - Informations projet
      projectInfo: {
        client: formData.projectInfo?.client || 'Non spécifié',
        projectNumber: formData.projectInfo?.projectNumber || 'Non spécifié',
        workLocation: formData.projectInfo?.workLocation || 'Non spécifié',
        date: formData.projectInfo?.date || new Date().toISOString().split('T')[0],
        time: formData.projectInfo?.time || new Date().toTimeString().slice(0, 5),
        industry: formData.projectInfo?.industry || 'other',
        workerCount: formData.projectInfo?.workerCount || 0,
        estimatedDuration: formData.projectInfo?.estimatedDuration || 'Non spécifié',
        workDescription: formData.projectInfo?.workDescription || 'Non spécifié',
        clientContact: formData.projectInfo?.clientContact || 'Non spécifié',
        emergencyContact: formData.projectInfo?.emergencyContact || 'Non spécifié',
        lockoutPoints: formData.projectInfo?.lockoutPoints || []
      },
      
      // Step 2 - Équipements  
      equipment: {
        selected: formData.equipment?.selected || [],
        list: formData.equipment?.list || [],
        totalCost: formData.equipment?.totalCost || 0,
        categories: formData.equipment?.categories || [],
        mandatory: formData.equipment?.mandatory || [],
        optional: formData.equipment?.optional || []
      },
      
      // Step 3 - Dangers
      hazards: {
        selected: formData.hazards?.selected || [],
        identified: formData.hazards?.identified || [],
        list: formData.hazards?.list || [],
        riskLevel: formData.hazards?.riskLevel || 'medium',
        controlMeasures: formData.hazards?.controlMeasures || [],
        residualRisk: formData.hazards?.residualRisk || 'low'
      },
      
      // Step 4 - Permis
      permits: {
        permits: formData.permits?.permits || [],
        required: formData.permits?.required || [],
        authorities: formData.permits?.authorities || [],
        validations: formData.permits?.validations || [],
        expiry: formData.permits?.expiry || []
      },
      
      // Step 5 - Validation
      validation: {
        reviewers: formData.validation?.reviewers || [],
        approvals: formData.validation?.approvals || [],
        signatures: formData.validation?.signatures || [],
        finalApproval: formData.validation?.finalApproval || null,
        criteria: formData.validation?.criteria || {}
      },
      
      // Step 6 - Finalisation
      finalization: finalizationData
    };
  }, [formData, finalizationData, tenant, language]);
  // =================== VALIDATION GLOBALE AST ===================
  
  /**
   * ✅ VALIDATION COMPLÈTE DE L'AST AVEC VÉRIFICATIONS MULTI-NIVEAUX
   */
  const validation = useMemo(() => {
    const astData = extractCompleteASTData();
    
    // Validation Step 1 - Informations projet
    const step1Complete = Boolean(
      astData.projectInfo.client !== 'Non spécifié' &&
      astData.projectInfo.projectNumber !== 'Non spécifié' &&
      astData.projectInfo.workLocation !== 'Non spécifié' &&
      astData.projectInfo.workDescription !== 'Non spécifié'
    );
    
    // Validation Step 2 - Équipements
    const step2Complete = Boolean(
      astData.equipment.selected.length > 0
    );
    
    // Validation Step 3 - Dangers
    const step3Complete = Boolean(
      astData.hazards.selected.length > 0 ||
      astData.hazards.identified.length > 0
    );
    
    // Validation Step 4 - Permis
    const step4Complete = Boolean(
      astData.permits.permits.length > 0 ||
      astData.permits.required.length > 0
    );
    
    // Validation Step 5 - Validation équipe
    const step5Complete = Boolean(
      astData.validation.reviewers.length > 0
    );
    
    const completedSteps = [step1Complete, step2Complete, step3Complete, step4Complete, step5Complete].filter(Boolean).length;
    const totalSteps = 5;
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    
    const errors = [];
    if (!step1Complete) errors.push('Informations projet incomplètes');
    if (!step2Complete) errors.push('Équipements non sélectionnés');
    if (!step3Complete) errors.push('Dangers non identifiés');
    if (!step4Complete) errors.push('Permis non configurés');
    if (!step5Complete) errors.push('Validation équipe manquante');
    
    return {
      isValid: completedSteps === totalSteps,
      percentage,
      completedSteps,
      totalSteps,
      errors,
      sections: {
        step1Complete,
        step2Complete,
        step3Complete,
        step4Complete,
        step5Complete
      }
    };
  }, [extractCompleteASTData]);

  /**
   * ✅ VALIDATION DÉTAILLÉE PAR SECTION
   */
  const getSectionValidation = useCallback((): ValidationSummary[] => {
    const astData = extractCompleteASTData();
    
    return [
      {
        sectionName: t.projectInformation,
        icon: <Building size={20} />,
        isComplete: validation.sections.step1Complete,
        completionPercentage: validation.sections.step1Complete ? 100 : 
          (astData.projectInfo.client !== 'Non spécifié' ? 25 : 0) +
          (astData.projectInfo.projectNumber !== 'Non spécifié' ? 25 : 0) +
          (astData.projectInfo.workLocation !== 'Non spécifié' ? 25 : 0) +
          (astData.projectInfo.workDescription !== 'Non spécifié' ? 25 : 0),
        errors: validation.sections.step1Complete ? [] : ['Informations projet incomplètes'],
        lastModified: astData.metadata.updatedAt
      },
      {
        sectionName: t.equipmentSafety,
        icon: <Shield size={20} />,
        isComplete: validation.sections.step2Complete,
        completionPercentage: validation.sections.step2Complete ? 100 : 0,
        errors: validation.sections.step2Complete ? [] : ['Équipements de sécurité non sélectionnés'],
        lastModified: astData.metadata.updatedAt
      },
      {
        sectionName: t.hazardsControls,
        icon: <AlertTriangle size={20} />,
        isComplete: validation.sections.step3Complete,
        completionPercentage: validation.sections.step3Complete ? 100 : 0,
        errors: validation.sections.step3Complete ? [] : ['Dangers et contrôles non identifiés'],
        lastModified: astData.metadata.updatedAt
      },
      {
        sectionName: t.permitsAuthorizations,
        icon: <FileText size={20} />,
        isComplete: validation.sections.step4Complete,
        completionPercentage: validation.sections.step4Complete ? 100 : 0,
        errors: validation.sections.step4Complete ? [] : ['Permis et autorisations non configurés'],
        lastModified: astData.metadata.updatedAt
      },
      {
        sectionName: t.teamValidation,
        icon: <Users size={20} />,
        isComplete: validation.sections.step5Complete,
        completionPercentage: validation.sections.step5Complete ? 100 : 0,
        errors: validation.sections.step5Complete ? [] : ['Validation équipe manquante'],
        lastModified: astData.metadata.updatedAt
      }
    ];
  }, [validation, extractCompleteASTData, t]);

  /**
   * ✅ STATISTIQUES COMPLÈTES AST
   */
  const getASTStatistics = useCallback(() => {
    const astData = extractCompleteASTData();
    
    return {
      // Métadonnées générales
      astNumber: astData.metadata.astNumber,
      tenant,
      createdAt: astData.metadata.createdAt,
      lastModified: astData.metadata.updatedAt,
      status: astData.metadata.status,
      
      // Complétion
      totalSections: validation.totalSteps,
      completedSections: validation.completedSteps,
      overallCompletion: validation.percentage,
      
      // Contenu
      identifiedHazards: astData.hazards.selected.length + astData.hazards.identified.length,
      selectedEquipment: astData.equipment.selected.length,
      requiredPermits: astData.permits.permits.length + astData.permits.required.length,
      teamMembers: astData.validation.reviewers.length,
      lockoutPoints: astData.projectInfo.lockoutPoints.length,
      
      // Photos et documents
      photosCount: finalizationData.photos.length,
      documentsCount: astData.permits.permits.length + astData.validation.signatures.length,
      
      // Industrie et projet
      industry: astData.projectInfo.industry,
      client: astData.projectInfo.client,
      projectNumber: astData.projectInfo.projectNumber,
      workLocation: astData.projectInfo.workLocation,
      estimatedDuration: astData.projectInfo.estimatedDuration,
      workerCount: astData.projectInfo.workerCount,
      
      // Sauvegarde
      lastSaved: finalizationData.lastSaved || 'Jamais',
      isLocked: finalizationData.isLocked,
      hasQRCode: Boolean(finalizationData.qrCodeUrl),
      hasShareableLink: Boolean(finalizationData.shareableLink)
    };
  }, [extractCompleteASTData, validation, finalizationData, tenant]);

  // =================== HANDLERS PRINCIPAUX ULTRA-OPTIMISÉS ===================
  
  /**
   * ✅ HANDLER SAUVEGARDE SUPABASE - COMME PERMITMANAGER
   */
  const handleSaveToSupabase = useCallback(async () => {
    console.log('💾 Step6 - Début sauvegarde Supabase...');
    setIsSaving(true);
    
    try {
      const astData = extractCompleteASTData();
      
      // Simulation sauvegarde Supabase (à remplacer par vraie intégration)
      const supabaseData = {
        ast_number: astData.metadata.astNumber,
        tenant: astData.metadata.tenant,
        project_info: astData.projectInfo,
        equipment: astData.equipment,
        hazards: astData.hazards,
        permits: astData.permits,
        validation: astData.validation,
        finalization: astData.finalization,
        created_at: astData.metadata.createdAt,
        updated_at: astData.metadata.updatedAt,
        status: astData.metadata.status,
        completion_percentage: validation.percentage
      };
      
      console.log('📤 Step6 - Données pour Supabase:', supabaseData);
      
      // TODO: Intégrer vraie API Supabase
      // const { data, error } = await supabase.from('ast_records').upsert(supabaseData);
      
      // Simulation délai réseau
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mise à jour état local
      const updatedData = {
        ...finalizationData,
        lastSaved: new Date().toISOString()
      };
      
      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
      
      showNotification(t.saveSuccess, 'success');
      console.log('✅ Step6 - Sauvegarde Supabase réussie');
      
    } catch (error) {
      console.error('❌ Step6 - Erreur sauvegarde Supabase:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [extractCompleteASTData, validation.percentage, finalizationData, onDataChange, t.saveSuccess, showNotification]);

  /**
   * ✅ HANDLER GÉNÉRATION QR CODE - COMME PERMITMANAGER
   */
  const handleGenerateQR = useCallback(async () => {
    console.log('📱 Step6 - Début génération QR Code...');
    setIsGeneratingQR(true);
    
    try {
      const astData = extractCompleteASTData();
      const astUrl = `https://${tenant}.csecur360.com/ast/view/${astData.metadata.astNumber}`;
      
      // Génération QR Code (simulation - à remplacer par vraie lib)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(astUrl)}&bgcolor=FFFFFF&color=000000&format=png`;
      
      const updatedData = {
        ...finalizationData,
        qrCodeUrl,
        shareableLink: astUrl
      };
      
      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
      
      showNotification(t.qrGenerated, 'success');
      console.log('✅ Step6 - QR Code généré:', qrCodeUrl);
      
    } catch (error) {
      console.error('❌ Step6 - Erreur génération QR:', error);
      showNotification('Erreur génération QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  }, [extractCompleteASTData, tenant, finalizationData, onDataChange, t.qrGenerated, showNotification]);

  /**
   * ✅ HANDLER GÉNÉRATION PDF PROFESSIONNEL AVEC LOGO OFFICIEL
   */
  const handleGeneratePDF = useCallback(async () => {
    console.log('🖨️ Step6 - Début génération PDF professionnel...');
    setIsGeneratingPDF(true);
    
    try {
      const astData = extractCompleteASTData();
      const stats = getASTStatistics();
      const sections = getSectionValidation();
      
      const currentDate = new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA');
      const currentTime = new Date().toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA');
      
      // ✅ GÉNÉRATION HTML AVEC LOGO OFFICIEL INTÉGRÉ
      const pdfContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${language === 'en' ? 'Complete JSA Report' : 'Rapport AST Complet'} - ${stats.client}</title>
    <style>
        @media print { @page { margin: 15mm; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page-break { page-break-before: always; } .no-print { display: none; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #1f2937; background: white; font-size: 11px; }
        
        /* ✅ HEADER AVEC LOGO OFFICIEL C-SECUR360 */
        .header { 
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
          color: white; 
          padding: 20px; 
          text-align: center; 
          margin-bottom: 20px; 
          border-radius: 8px; 
          position: relative; 
        }
        .logo-container { 
          position: absolute; 
          left: 20px; 
          top: 50%; 
          transform: translateY(-50%); 
          width: 80px; 
          height: 80px; 
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          border: 3px solid #f59e0b; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justifyContent: center;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        }
        .logo-image { 
          width: 64px; 
          height: 64px; 
          object-fit: contain;
          filter: brightness(1.2) contrast(1.1);
        }
        .logo-fallback { 
          color: #f59e0b; 
          font-size: 24px; 
          font-weight: bold; 
          display: none;
        }
        .header h1 { font-size: 28px; margin-bottom: 8px; font-weight: bold; }
        .header .subtitle { font-size: 16px; opacity: 0.9; }
        
        /* ✅ WATERMARK LOGO EN ARRIÈRE-PLAN */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.05;
          font-size: 120px;
          font-weight: bold;
          color: #f59e0b;
          z-index: -1;
          pointer-events: none;
        }
        
        .stats-summary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-top: 10px; }
        .stat-item { text-align: center; background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 6px; }
        .stat-number { font-size: 20px; font-weight: bold; }
        .stat-label { font-size: 10px; opacity: 0.9; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .info-box { border: 2px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f8fafc; }
        .info-box h3 { font-size: 12px; color: #374151; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #d1d5db; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; padding: 4px 0; }
        .info-label { font-weight: 600; color: #4b5563; min-width: 120px; }
        .info-value { color: #1f2937; font-weight: 500; flex: 1; text-align: right; }
        .section { margin-bottom: 25px; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .section-header { background: #f3f4f6; padding: 12px 15px; border-bottom: 1px solid #d1d5db; }
        .section-title { font-size: 14px; font-weight: bold; color: #1f2937; }
        .section-content { padding: 15px; }
        .validation-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .validation-table th, .validation-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 9px; }
        .validation-table th { background: #f3f4f6; font-weight: bold; }
        .status-complete { background: #dcfce7; color: #166534; }
        .status-incomplete { background: #fef3c7; color: #92400e; }
        .footer { 
          margin-top: 30px; 
          padding: 15px; 
          background: #f9fafb; 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          text-align: center; 
          font-size: 9px; 
          color: #6b7280;
          position: relative;
        }
        .footer-logo {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: #000;
          border: 2px solid #f59e0b;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .signature-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 40px; }
        .signature-box { border-top: 2px solid #374151; padding-top: 10px; text-align: center; }
        .signature-label { font-size: 10px; color: #4b5563; font-weight: 600; }
        .qr-section { text-align: center; margin: 20px 0; }
        .qr-code { border: 3px solid #f59e0b; border-radius: 12px; padding: 10px; background: white; display: inline-block; }
    </style>
</head>
<body>
    <!-- ✅ WATERMARK LOGO EN ARRIÈRE-PLAN -->
    <div class="watermark">C-SECUR360</div>
    
    <div class="header">
        <div class="logo-container">
            <img src="/c-secur360-logo.png" alt="C-Secur360" class="logo-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="logo-fallback">C🛡️</div>
        </div>
        <h1>${language === 'en' ? '🛡️ JOB SAFETY ANALYSIS (JSA)' : '🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL (AST)'}</h1>
        <div class="subtitle">${language === 'en' ? 'Complete Official Report' : 'Rapport Officiel Complet'} - ${tenant} | N° ${stats.astNumber}</div>
    </div>
    
    <div class="stats-summary">
        <h3 style="margin-bottom: 10px; font-size: 14px;">📊 ${language === 'en' ? 'EXECUTIVE SUMMARY' : 'RÉSUMÉ EXÉCUTIF'}</h3>
        <div class="stats-grid">
            <div class="stat-item"><div class="stat-number">${stats.completedSections}</div><div class="stat-label">${language === 'en' ? 'Completed Sections' : 'Sections Complétées'}</div></div>
            <div class="stat-item"><div class="stat-number">${stats.identifiedHazards}</div><div class="stat-label">${language === 'en' ? 'Identified Hazards' : 'Dangers Identifiés'}</div></div>
            <div class="stat-item"><div class="stat-number">${stats.selectedEquipment}</div><div class="stat-label">${language === 'en' ? 'Safety Equipment' : 'Équipements Sécurité'}</div></div>
            <div class="stat-item"><div class="stat-number">${stats.requiredPermits}</div><div class="stat-label">${language === 'en' ? 'Required Permits' : 'Permis Requis'}</div></div>
            <div class="stat-item"><div class="stat-number">${stats.teamMembers}</div><div class="stat-label">${language === 'en' ? 'Team Members' : 'Membres Équipe'}</div></div>
            <div class="stat-item"><div class="stat-number">${stats.overallCompletion}%</div><div class="stat-label">${language === 'en' ? 'Completion' : 'Complétion'}</div></div>
        </div>
    </div>
    
    <div class="info-grid">
        <div class="info-box">
            <h3>${language === 'en' ? '🏢 CLIENT & PROJECT INFORMATION' : '🏢 INFORMATIONS CLIENT & PROJET'}</h3>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Client:' : 'Client:'}</span><span class="info-value">${stats.client}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Project #:' : 'Projet #:'}</span><span class="info-value">${stats.projectNumber}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Location:' : 'Lieu:'}</span><span class="info-value">${stats.workLocation}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Industry:' : 'Industrie:'}</span><span class="info-value">${t.industries[stats.industry as keyof typeof t.industries] || stats.industry}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Duration:' : 'Durée:'}</span><span class="info-value">${stats.estimatedDuration}</span></div>
        </div>
        <div class="info-box">
            <h3>${language === 'en' ? '👥 TEAM & SAFETY' : '👥 ÉQUIPE & SÉCURITÉ'}</h3>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Worker Count:' : 'Nb Travailleurs:'}</span><span class="info-value">${stats.workerCount}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Team Members:' : 'Membres Équipe:'}</span><span class="info-value">${stats.teamMembers}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Lockout Points:' : 'Points LOTO:'}</span><span class="info-value">${stats.lockoutPoints}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Photos:' : 'Photos:'}</span><span class="info-value">${stats.photosCount}</span></div>
            <div class="info-row"><span class="info-label">${language === 'en' ? 'Documents:' : 'Documents:'}</span><span class="info-value">${stats.documentsCount}</span></div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-header">
            <div class="section-title">✅ ${language === 'en' ? 'VALIDATION SUMMARY' : 'RÉSUMÉ DE VALIDATION'}</div>
        </div>
        <div class="section-content">
            <table class="validation-table">
                <thead>
                    <tr>
                        <th>${language === 'en' ? 'Section' : 'Section'}</th>
                        <th>${language === 'en' ? 'Status' : 'Statut'}</th>
                        <th>${language === 'en' ? 'Completion' : 'Complétion'}</th>
                        <th>${language === 'en' ? 'Last Modified' : 'Dernière Modification'}</th>
                        <th>${language === 'en' ? 'Notes' : 'Notes'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${sections.map(section => `
                        <tr>
                            <td><strong>${section.sectionName}</strong></td>
                            <td class="${section.isComplete ? 'status-complete' : 'status-incomplete'}">
                                ${section.isComplete ? (language === 'en' ? '✅ Complete' : '✅ Complété') : (language === 'en' ? '⚠️ Incomplete' : '⚠️ Incomplet')}
                            </td>
                            <td><strong>${section.completionPercentage}%</strong></td>
                            <td>${section.lastModified ? new Date(section.lastModified).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}</td>
                            <td>${section.errors.length > 0 ? section.errors[0] : (language === 'en' ? 'No issues' : 'Aucun problème')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${finalizationData.finalComments ? `
                <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 12px;">💬 ${language === 'en' ? 'Final Comments:' : 'Commentaires Finaux:'}</h4>
                    <p style="margin: 0; color: #4b5563; font-size: 10px; line-height: 1.4;">${finalizationData.finalComments}</p>
                </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f8fafc;">
                <strong>📊 ${language === 'en' ? 'Document Status:' : 'Statut du Document:'}</strong> 
                <span style="padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 600; ${finalizationData.isLocked ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                    ${finalizationData.isLocked ? (language === 'en' ? '🔒 LOCKED' : '🔒 VERROUILLÉ') : (language === 'en' ? '🔓 IN PROGRESS' : '🔓 EN COURS')}
                </span>
                | ${language === 'en' ? 'Completion:' : 'Complétion:'} ${stats.overallCompletion}%
                ${finalizationData.lockTimestamp ? ` | ${language === 'en' ? 'Locked on:' : 'Verrouillé le:'} ${new Date(finalizationData.lockTimestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}` : ''}
            </div>
        </div>
    </div>
    
    ${finalizationData.qrCodeUrl ? `
        <div class="qr-section">
            <h3 style="margin-bottom: 15px; color: #1f2937;">📱 ${language === 'en' ? 'Mobile Access QR Code' : 'Code QR Accès Mobile'}</h3>
            <div class="qr-code">
                <img src="${finalizationData.qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; display: block;" />
            </div>
            <p style="margin-top: 10px; color: #6b7280; font-size: 10px;">
                ${language === 'en' ? 'Scan this QR code to access the JSA from a mobile device' : 'Scannez ce code QR pour accéder à l\'AST depuis un appareil mobile'}
            </p>
        </div>
    ` : ''}
    
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'SAFETY MANAGER' : 'RESPONSABLE SÉCURITÉ'}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ____________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'SUPERVISOR' : 'SUPERVISEUR'}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ____________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'MANAGER' : 'GESTIONNAIRE'}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ____________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-logo">
            <img src="/c-secur360-logo.png" alt="C-Secur360" style="width: 32px; height: 32px; object-fit: contain;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="display: none; color: #f59e0b; font-size: 14px; font-weight: bold;">C🛡️</div>
        </div>
        <p><strong>${language === 'en' ? 'This document was automatically generated by the C-Secur360 system' : 'Ce document a été généré automatiquement par le système C-Secur360'}</strong></p>
        <p>${language === 'en' ? 'Compliant with Canadian occupational health and safety standards' : 'Conforme aux normes de santé et sécurité au travail du Canada'} | ${language === 'en' ? 'Generated on' : 'Généré le'} ${currentDate} ${language === 'en' ? 'at' : 'à'} ${currentTime}</p>
        <p>${language === 'en' ? 'Official document valid for safety committees, inspections and investigations' : 'Document officiel valide pour comités de sécurité, inspections et enquêtes'}</p>
        ${finalizationData.shareableLink ? `<p>🔗 ${language === 'en' ? 'Access link:' : 'Lien d\'accès:'} ${finalizationData.shareableLink}</p>` : ''}
    </div>
</body>
</html>`;

      // Création et téléchargement du PDF
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setIsGeneratingPDF(false);
          showNotification(t.pdfGenerated, 'success');
        };
        
        console.log('✅ Step6 - PDF professionnel généré avec logo officiel');
      } else {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
      }
      
    } catch (error) {
      console.error('❌ Step6 - Erreur génération PDF:', error);
      showNotification('Erreur génération PDF', 'error');
      setIsGeneratingPDF(false);
    }
  }, [extractCompleteASTData, getASTStatistics, getSectionValidation, finalizationData, language, t, showNotification]);

  /**
   * ✅ HANDLER PARTAGE MULTI-CANAUX
   */
  const handleShare = useCallback(async () => {
    console.log(`📤 Step6 - Début partage via ${selectedShareMethod}...`);
    
    try {
      const astData = extractCompleteASTData();
      const shareUrl = finalizationData.shareableLink || `https://${tenant}.csecur360.com/ast/view/${astData.metadata.astNumber}`;
      
      const shareText = language === 'fr' ? 
        `🛡️ AST - ${astData.projectInfo.client}\n\nAnalyse Sécuritaire de Travail pour le projet "${astData.projectInfo.projectNumber}"\n\n📍 Lieu: ${astData.projectInfo.workLocation}\n🔗 Accès: ${shareUrl}\n\nCette AST doit être consultée avant le début des travaux.\n\n${tenant} - Équipe Sécurité` :
        `🛡️ JSA - ${astData.projectInfo.client}\n\nJob Safety Analysis for project "${astData.projectInfo.projectNumber}"\n\n📍 Location: ${astData.projectInfo.workLocation}\n🔗 Access: ${shareUrl}\n\nThis JSA must be reviewed before work begins.\n\n${tenant} - Safety Team`;
      
      switch (selectedShareMethod) {
        case 'email':
          const emailSubject = encodeURIComponent(language === 'fr' ? 
            `🛡️ AST - ${astData.projectInfo.projectNumber}` : 
            `🛡️ JSA - ${astData.projectInfo.projectNumber}`);
          const emailBody = encodeURIComponent(shareText);
          window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
          break;
          
        case 'sms':
          const smsText = encodeURIComponent(shareText);
          window.open(`sms:?body=${smsText}`);
          break;
          
        case 'whatsapp':
          const whatsappText = encodeURIComponent(shareText);
          window.open(`https://wa.me/?text=${whatsappText}`);
          break;
          
        case 'teams':
          // Intégration Microsoft Teams (future)
          console.log('🔄 Step6 - Partage Teams à implémenter');
          break;
          
        case 'slack':
          // Intégration Slack (future)
          console.log('🔄 Step6 - Partage Slack à implémenter');
          break;
      }
      
      showNotification(`${language === 'fr' ? 'Partage initié via' : 'Sharing initiated via'} ${selectedShareMethod}`, 'success');
      console.log(`✅ Step6 - Partage ${selectedShareMethod} initié`);
      
    } catch (error) {
      console.error('❌ Step6 - Erreur partage:', error);
      showNotification('Erreur lors du partage', 'error');
    }
  }, [selectedShareMethod, extractCompleteASTData, finalizationData.shareableLink, tenant, language, showNotification]);

  /**
   * ✅ HANDLER COPIE LIEN
   */
  const handleCopyLink = useCallback(async () => {
    try {
      const astData = extractCompleteASTData();
      const shareUrl = finalizationData.shareableLink || `https://${tenant}.csecur360.com/ast/view/${astData.metadata.astNumber}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      showNotification(t.linkCopied, 'success');
      console.log('✅ Step6 - Lien copié:', shareUrl);
      
    } catch (error) {
      console.error('❌ Step6 - Erreur copie lien:', error);
      showNotification('Erreur copie du lien', 'error');
    }
  }, [extractCompleteASTData, finalizationData.shareableLink, tenant, t.linkCopied, showNotification]);

  /**
   * ✅ HANDLER VERROUILLAGE AST
   */
  const handleLockAST = useCallback((lockType: LockType) => {
    console.log(`🔒 Step6 - Verrouillage AST type: ${lockType}`);
    
    const updatedData = {
      ...finalizationData,
      isLocked: true,
      lockTimestamp: new Date().toISOString(),
      lockReason: lockType
    };

    setFinalizationData(updatedData);
    onDataChange('finalization', updatedData);
    setShowLockConfirm(false);
    
    showNotification(`${t.astLocked} (${lockType})`, 'success');
    console.log(`✅ Step6 - AST verrouillée (${lockType})`);
  }, [finalizationData, onDataChange, t.astLocked, showNotification]);

  /**
   * ✅ HANDLER COMMENTAIRES FINAUX
   */
  const updateComments = useCallback((comments: string) => {
    const updatedData = {
      ...finalizationData,
      finalComments: comments
    };

    setFinalizationData(updatedData);
    onDataChange('finalization', updatedData);
  }, [finalizationData, onDataChange]);

  /**
   * ✅ HANDLER OPTIONS DOCUMENT
   */
  const updateDocumentOption = useCallback((option: keyof DocumentGeneration, value: boolean | string) => {
    const updatedData = {
      ...finalizationData,
      documentGeneration: {
        ...finalizationData.documentGeneration,
        [option]: value
      }
    };

    setFinalizationData(updatedData);
    onDataChange('finalization', updatedData);
  }, [finalizationData, onDataChange]);

  // =================== EFFETS ===================
  React.useEffect(() => {
    // Génération automatique du QR Code si AST complète
    if (validation.percentage >= 80 && !finalizationData.qrCodeUrl) {
      handleGenerateQR();
    }
  }, [validation.percentage, finalizationData.qrCodeUrl, handleGenerateQR]);

  React.useEffect(() => {
    // Sauvegarde automatique périodique (toutes les 5 minutes)
    const autoSaveInterval = setInterval(() => {
      if (validation.percentage > 0 && !isSaving) {
        console.log('💾 Step6 - Sauvegarde automatique...');
        handleSaveToSupabase();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSaveInterval);
  }, [validation.percentage, isSaving, handleSaveToSupabase]);
  <div 
                      key={key}
                      className={`checkbox-field ${finalizationData.documentGeneration[key as keyof typeof finalizationData.documentGeneration] ? 'checked' : ''}`}
                      onClick={() => toggleDocumentOption(key as keyof typeof finalizationData.documentGeneration)}
                    >
                      <input
                        type="checkbox"
                        checked={finalizationData.documentGeneration[key as keyof typeof finalizationData.documentGeneration] as boolean}
                        onChange={() => toggleDocumentOption(key as keyof typeof finalizationData.documentGeneration)}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons génération rapports */}
              <div className="buttons-grid">
                <button
                  onClick={() => handleGeneratePDF('standard')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-primary ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                  ) : (
                    <FileText size={20} />
                  )}
                  {t.generateStandardReport}
                </button>

                <button
                  onClick={() => handleGeneratePDF('executive')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-warning ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                  ) : (
                    <Award size={20} />
                  )}
                  {t.generateExecutiveReport}
                </button>

                <button
                  onClick={() => handleGeneratePDF('technical')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-success ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                  ) : (
                    <Cog size={20} />
                  )}
                  {t.generateTechnicalReport}
                </button>

                <button
                  onClick={() => handleGeneratePDF('compact')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-secondary ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  <Smartphone size={20} />
                  {t.generateCompactReport}
                </button>
              </div>

              {/* Aperçu format */}
              <div style={{ 
                marginTop: isMobile ? '16px' : '20px',
                background: 'rgba(100, 116, 139, 0.1)', 
                border: '1px solid rgba(148, 163, 184, 0.2)', 
                borderRadius: isMobile ? '8px' : '12px', 
                padding: isMobile ? '12px' : '16px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: '#94a3b8',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '700'
                }}>
                  📋 {language === 'fr' ? 'Aperçu du format sélectionné:' : 'Selected format preview:'}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '8px' : '12px',
                  fontSize: isMobile ? '11px' : '13px',
                  color: '#d1d5db'
                }}>
                  <div>📄 {language === 'fr' ? 'Pages estimées:' : 'Estimated pages:'} <strong>8-12</strong></div>
                  <div>📊 {language === 'fr' ? 'Graphiques:' : 'Charts:'} <strong>{finalizationData.documentGeneration.includeStatistics ? '✅' : '❌'}</strong></div>
                  <div>📷 {language === 'fr' ? 'Photos:' : 'Photos:'} <strong>{finalizationData.documentGeneration.includePhotos ? `✅ ${stats.photosCount}` : '❌'}</strong></div>
                  <div>🔗 {language === 'fr' ? 'Code QR:' : 'QR Code:'} <strong>{finalizationData.documentGeneration.includeQRCode ? '✅' : '❌'}</strong></div>
                </div>
              </div>
            </div>

            {/* Historique des rapports générés */}
            <div className="ast-section">
              <h2 className="section-title">
                <Clock size={24} />
                {language === 'fr' ? '📋 Historique des Rapports' : '📋 Report History'}
              </h2>
              
              {finalizationData.generatedReports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
                  {finalizationData.generatedReports.map((report, index) => (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: isMobile ? '10px' : '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: isMobile ? '6px' : '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: isMobile ? '12px' : '14px', 
                          fontWeight: '600', 
                          color: '#60a5fa',
                          marginBottom: '2px'
                        }}>
                          📄 {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                        </div>
                        <div style={{ 
                          fontSize: isMobile ? '10px' : '12px', 
                          color: '#9ca3af' 
                        }}>
                          🕒 {new Date(report.generatedAt).toLocaleDateString()} {new Date(report.generatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px' }}>
                        <button
                          onClick={() => window.open(report.url, '_blank')}
                          className="ast-button button-secondary"
                          style={{ 
                            padding: isMobile ? '6px 10px' : '8px 12px',
                            fontSize: isMobile ? '11px' : '12px',
                            minHeight: 'auto'
                          }}
                        >
                          <Eye size={14} />
                          {language === 'fr' ? 'Voir' : 'View'}
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = report.url;
                            link.download = `AST-${stats.astNumber}-${report.type}-${new Date(report.generatedAt).toISOString().split('T')[0]}.pdf`;
                            link.click();
                          }}
                          className="ast-button button-primary"
                          style={{ 
                            padding: isMobile ? '6px 10px' : '8px 12px',
                            fontSize: isMobile ? '11px' : '12px',
                            minHeight: 'auto'
                          }}
                        >
                          <Download size={14} />
                          {language === 'fr' ? 'Télécharger' : 'Download'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? '24px' : '32px', 
                  color: '#9ca3af' 
                }}>
                  <FileText size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px' }}>
                    {language === 'fr' ? 
                      'Aucun rapport généré pour le moment. Utilisez les boutons ci-dessus pour créer votre premier rapport.' :
                      'No reports generated yet. Use the buttons above to create your first report.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== MODALES ET CONFIRMATIONS =================== */}

        {/* Modal confirmation verrouillage */}
        {showLockConfirm && (
          <div className="modal-overlay" onClick={() => setShowLockConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
                <div style={{
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  <Lock size={isMobile ? 20 : 24} color="white" />
                </div>
                <h3 style={{ 
                  color: '#ffffff', 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '700'
                }}>
                  ⚠️ {t.confirmLock}
                </h3>
                <p style={{ 
                  color: '#d1d5db', 
                  margin: 0, 
                  fontSize: isMobile ? '12px' : '14px',
                  lineHeight: 1.5
                }}>
                  {language === 'fr' ?
                    'Cette action est irréversible. Une fois verrouillée, l\'AST ne pourra plus être modifiée.' :
                    'This action is irreversible. Once locked, the JSA cannot be modified anymore.'
                  }
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '8px' : '12px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setShowLockConfirm(false)}
                  className="ast-button button-secondary"
                  style={{ flex: 1 }}
                >
                  <X size={18} />
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    handleLockDocument();
                    setShowLockConfirm(false);
                  }}
                  className="ast-button button-danger"
                  style={{ flex: 1 }}
                >
                  <Lock size={18} />
                  {t.confirmLock}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal sélection partageurs */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                <h3 style={{ 
                  color: '#ffffff', 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Share2 size={20} />
                  {language === 'fr' ? 'Partager l\'AST' : 'Share JSA'}
                </h3>
                <p style={{ 
                  color: '#d1d5db', 
                  margin: 0, 
                  fontSize: isMobile ? '12px' : '14px' 
                }}>
                  {language === 'fr' ?
                    'Sélectionnez les destinataires pour le partage:' :
                    'Select recipients for sharing:'
                  }
                </p>
              </div>

              {/* Liste des contacts suggérés */}
              <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                <h4 style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>
                  {language === 'fr' ? 'Contacts suggérés:' : 'Suggested contacts:'}
                </h4>
                
                <div style={{ 
                  maxHeight: isMobile ? '150px' : '200px', 
                  overflowY: 'auto',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: isMobile ? '6px' : '8px'
                }}>
                  {[
                    { name: 'Superviseur Projet', email: 'superviseur@exemple.com', role: 'Supervisor' },
                    { name: 'Équipe Sécurité', email: 'securite@exemple.com', role: 'Safety Team' },
                    { name: 'Manager Client', email: 'client@exemple.com', role: 'Client' },
                    { name: 'Inspecteur QA', email: 'qa@exemple.com', role: 'QA Inspector' }
                  ].map((contact, index) => (
                    <div 
                      key={index}
                      className="checkbox-field"
                      style={{ 
                        margin: 0, 
                        borderRadius: 0,
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: index === 0 ? 'none' : undefined
                      }}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={index < 2}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#e2e8f0',
                          fontSize: isMobile ? '12px' : '14px'
                        }}>
                          {contact.name}
                        </div>
                        <div style={{ 
                          fontSize: isMobile ? '10px' : '12px', 
                          color: '#9ca3af' 
                        }}>
                          {contact.email} • {contact.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message personnalisé */}
              <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                <label style={{ 
                  display: 'block',
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px', 
                  marginBottom: '6px',
                  fontWeight: '600'
                }}>
                  {language === 'fr' ? 'Message personnalisé (optionnel):' : 'Custom message (optional):'}
                </label>
                <textarea
                  className="form-input form-textarea"
                  placeholder={language === 'fr' ? 
                    'Ajouter un message personnalisé pour les destinataires...' :
                    'Add a custom message for recipients...'
                  }
                  style={{ minHeight: isMobile ? '80px' : '100px' }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '8px' : '12px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="ast-button button-secondary"
                  style={{ flex: 1 }}
                >
                  <X size={18} />
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    handleShare(selectedShareMethod);
                    setShowShareModal(false);
                  }}
                  className="ast-button button-success"
                  style={{ flex: 1 }}
                >
                  <Send size={18} />
                  {language === 'fr' ? 'Envoyer' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal aperçu PDF */}
        {showPDFPreview && (
          <div className="modal-overlay" onClick={() => setShowPDFPreview(false)}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: isMobile ? '100%' : '800px', maxHeight: '90vh' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: isMobile ? '16px' : '20px'
              }}>
                <h3 style={{ 
                  color: '#ffffff', 
                  margin: 0, 
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Eye size={20} />
                  {language === 'fr' ? 'Aperçu du Rapport PDF' : 'PDF Report Preview'}
                </h3>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="ast-button button-secondary"
                  style={{ padding: isMobile ? '6px 8px' : '8px 10px', minHeight: 'auto' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{
                background: 'white',
                borderRadius: isMobile ? '6px' : '8px',
                padding: isMobile ? '16px' : '20px',
                marginBottom: isMobile ? '16px' : '20px',
                color: '#1f2937',
                fontSize: isMobile ? '11px' : '13px',
                lineHeight: 1.4,
                maxHeight: isMobile ? '300px' : '400px',
                overflowY: 'auto'
              }}>
                {/* Aperçu stylé du PDF avec logo */}
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #f59e0b', paddingBottom: '16px' }}>
                  <img 
                    src="/c-secur360-logo.png" 
                    alt="C-Secur360"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      marginBottom: '12px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div style={{ 
                    display: 'none',
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    margin: '0 auto 12px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    C🛡️
                  </div>
                  <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>
                    {language === 'fr' ? 'ANALYSE SÉCURITAIRE DE TÂCHE' : 'JOB SAFETY ANALYSIS'}
                  </h1>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    N° {stats.astNumber} • {stats.client} • {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px' }}>📋 Informations Projet</h3>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Projet:</strong> {stats.projectNumber}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Lieu:</strong> {stats.workLocation}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Industrie:</strong> {stats.industry}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Statut:</strong> {validation.isValid ? '✅ Validé' : '⚠️ En cours'}</p>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px' }}>📊 Statistiques</h3>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Dangers identifiés:</strong> {stats.identifiedHazards}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Équipements:</strong> {stats.selectedEquipment}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Travailleurs:</strong> {stats.teamMembers}</p>
                    <p style={{ margin: '0 0 4px 0' }}><strong>Photos:</strong> {stats.photosCount}</p>
                  </div>
                </div>

                {finalizationData.documentGeneration.includePhotos && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px' }}>📷 Documentation Photographique</h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                      gap: '8px',
                      background: '#f9fafb',
                      padding: '12px',
                      borderRadius: '6px'
                    }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          width: '80px',
                          height: '60px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '10px'
                        }}>
                          📷 Photo {i}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {finalizationData.documentGeneration.includeQRCode && (
                  <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '14px' }}>📱 Accès Mobile</h3>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: '#f3f4f6',
                      border: '2px solid #d1d5db',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      fontSize: '10px',
                      color: '#6b7280'
                    }}>
                      QR Code
                    </div>
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '8px' : '12px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="ast-button button-secondary"
                  style={{ flex: 1 }}
                >
                  <ArrowLeft size={18} />
                  {t.back}
                </button>
                <button
                  onClick={() => {
                    handleGeneratePDF('standard');
                    setShowPDFPreview(false);
                  }}
                  className="ast-button button-success"
                  style={{ flex: 1 }}
                >
                  <Download size={18} />
                  {language === 'fr' ? 'Générer PDF' : 'Generate PDF'}
                </button>
              </div>
            </div>
          </div>
        )}
{/* Notification Toast */}
        {showNotification && (
          <div style={{
            position: 'fixed',
            top: isMobile ? '16px' : '24px',
            right: isMobile ? '16px' : '24px',
            background: notificationType === 'success' ? 
              'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
              notificationType === 'error' ?
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
              'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: isMobile ? '12px 16px' : '16px 20px',
            borderRadius: isMobile ? '8px' : '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
            maxWidth: isMobile ? '280px' : '400px',
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: '600',
            animation: 'slideInRight 0.3s ease-out',
            border: `1px solid ${
              notificationType === 'success' ? 'rgba(16, 185, 129, 0.5)' :
              notificationType === 'error' ? 'rgba(239, 68, 68, 0.5)' :
              'rgba(245, 158, 11, 0.5)'
            }`,
            backdropFilter: 'blur(10px)'
          }}>
            {notificationType === 'success' ? <CheckCircle size={20} /> :
             notificationType === 'error' ? <AlertTriangle size={20} /> :
             <Clock size={20} />}
            <span style={{ flex: 1 }}>{notificationMessage}</span>
            <button
              onClick={() => setShowNotification(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Progress Loader pour actions asynchrones */}
        {(isSaving || isGeneratingPDF || isGeneratingQR) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '24px' : '32px',
              textAlign: 'center',
              color: 'white',
              minWidth: isMobile ? '280px' : '320px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px',
                border: '4px solid rgba(59, 130, 246, 0.3)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }} />
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                {isSaving ? t.saving :
                 isGeneratingPDF ? (language === 'fr' ? 'Génération PDF...' : 'Generating PDF...') :
                 (language === 'fr' ? 'Génération QR Code...' : 'Generating QR Code...')
                }
              </h3>
              <p style={{
                margin: 0,
                fontSize: isMobile ? '12px' : '14px',
                color: '#94a3b8'
              }}>
                {language === 'fr' ? 'Veuillez patienter...' : 'Please wait...'}
              </p>
            </div>
          </div>
        )}

        {/* Animations CSS supplémentaires */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          /* Animations d'entrée pour les sections */
          .ast-section {
            animation: slideInUp 0.4s ease-out;
          }
          
          .tab-button {
            animation: slideDown 0.3s ease-out;
          }
          
          .tab-button:nth-child(1) { animation-delay: 0s; }
          .tab-button:nth-child(2) { animation-delay: 0.1s; }
          .tab-button:nth-child(3) { animation-delay: 0.2s; }
          .tab-button:nth-child(4) { animation-delay: 0.3s; }
          
          .stat-card {
            animation: slideInUp 0.5s ease-out;
          }
          
          .stat-card:nth-child(1) { animation-delay: 0s; }
          .stat-card:nth-child(2) { animation-delay: 0.1s; }
          .stat-card:nth-child(3) { animation-delay: 0.2s; }
          .stat-card:nth-child(4) { animation-delay: 0.3s; }
          .stat-card:nth-child(5) { animation-delay: 0.4s; }
          .stat-card:nth-child(6) { animation-delay: 0.5s; }
          
          /* Effet hover amélioré pour les boutons */
          .ast-button:hover {
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
          }
          
          /* Focus states pour accessibilité */
          .ast-button:focus,
          .form-input:focus,
          .tab-button:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
          
          /* Smooth scroll pour mobile */
          .modal-content {
            scroll-behavior: smooth;
          }
          
          /* Loading skeleton pour les éléments en cours de chargement */
          .loading-skeleton {
            background: linear-gradient(90deg, rgba(100, 116, 139, 0.2) 25%, rgba(148, 163, 184, 0.3) 50%, rgba(100, 116, 139, 0.2) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          
          /* Responsive improvements */
          @media (max-width: 380px) {
            .ast-header { margin: 0 -8px; }
            .tabs-container { margin: 0 -8px; }
            .ast-section { margin: 0 -8px 16px; padding: 14px; }
            .buttons-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
            .info-grid { grid-template-columns: 1fr; gap: 12px; }
          }
          
          /* Print optimization */
          @media print {
            .tab-button,
            .ast-button,
            .modal-overlay {
              display: none !important;
            }
            
            .ast-section {
              break-inside: avoid;
              margin-bottom: 20px;
            }
            
            .step6-container {
              padding: 0;
              background: white !important;
              color: black !important;
            }
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .ast-section {
              border: 2px solid #ffffff;
            }
            
            .ast-button {
              border: 2px solid currentColor;
            }
            
            .tab-button.active {
              background: #ffffff !important;
              color: #000000 !important;
            }
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}} />
      </div>
    </>
  );
};

export default Step6Finalization;
