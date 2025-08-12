'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  FileText, Database, QrCode, Printer, Mail, Share, Download,
  Save, CheckCircle, AlertTriangle, Clock, Shield, Users,
  Eye, Globe, Smartphone, Copy, Check, BarChart3, Calendar,
  MapPin, Building, User, Search, X, Plus, RefreshCw, Upload,
  ArrowRight, ArrowLeft, Target, Zap, History, Camera, Archive,
  Send, MessageSquare, Lock, Unlock, Award, Cog, Hash, Share2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// =================== TYPES DE BASE ===================
type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'teams' | 'slack';
type LockType = 'temporary' | 'permanent' | 'review' | 'archive';
type NotificationType = 'success' | 'error' | 'warning';
type ReportType = 'standard' | 'executive' | 'technical' | 'compact';
type ViewType = 'main' | 'database';

// =================== INTERFACES PHOTOS ET DOCUMENTS ===================
interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'hazard' | 'equipment' | 'site' | 'team' | 'safety' | 'permit' | 'other';
  location?: string;
  tags?: string[];
  stepSource?: string;
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
  includePermits: boolean;
  includeHazards: boolean;
  includeEquipment: boolean;
  format: 'pdf' | 'word' | 'html';
  template: ReportType;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  url: string;
  generatedAt: string;
  fileSize?: string;
  astNumber: string;
}

// =================== INTERFACE FINALISATION DONNÉES ===================
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
  generatedReports: GeneratedReport[];
}

// =================== INTERFACES AST PRINCIPALES ===================
interface ASTData {
  astNumber: string;
  tenant: string;
  language: 'fr' | 'en';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  
  // Step 1 - Informations projet
  projectInfo: {
    client: string;
    projectNumber: string;
    workLocation: string;
    date: string;
    time: string;
    industry: string;
    workerCount: number;
    estimatedDuration: string;
    workDescription: string;
    clientContact: string;
    emergencyContact: string;
    lockoutPoints: string[];
    weatherConditions?: string;
    accessRestrictions?: string;
  };
  
  // Step 2 - Équipements de sécurité
  equipment: {
    selected: string[];
    categories: string[];
    mandatory: string[];
    optional: string[];
    totalCost: number;
    inspectionRequired: boolean;
    certifications: string[];
  };
  
  // Step 3 - Dangers et contrôles
  hazards: {
    identified: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    controlMeasures: string[];
    residualRisk: 'low' | 'medium' | 'high';
    emergencyProcedures: string[];
    monitoringRequired: boolean;
  };
  
  // Step 4 - Permis et autorisations
  permits: {
    required: string[];
    authorities: string[];
    validations: string[];
    expiry: string[];
    documents: string[];
    specialRequirements: string[];
  };
  
  // Step 5 - Validation équipe
  validation: {
    reviewers: string[];
    approvals: string[];
    signatures: string[];
    finalApproval: boolean;
    criteria: Record<string, boolean>;
    comments: string[];
  };
  
  // Step 6 - Finalisation
  finalization: FinalizationData;
}

interface ASTStatistics {
  astNumber: string;
  tenant: string;
  createdAt: string;
  lastModified: string;
  status: string;
  
  // Complétion
  totalSections: number;
  completedSections: number;
  overallCompletion: number;
  
  // Contenu AST
  identifiedHazards: number;
  selectedEquipment: number;
  requiredPermits: number;
  teamMembers: number;
  lockoutPoints: number;
  
  // Documentation
  photosCount: number;
  documentsCount: number;
  signaturesCount: number;
  
  // Projet
  industry: string;
  client: string;
  projectNumber: string;
  workLocation: string;
  estimatedDuration: string;
  workerCount: number;
  
  // État
  lastSaved: string;
  isLocked: boolean;
  hasQRCode: boolean;
  hasShareableLink: boolean;
}

interface ValidationSummary {
  sectionName: string;
  icon: React.ReactNode;
  isComplete: boolean;
  completionPercentage: number;
  errors: string[];
  lastModified?: string;
  stepNumber: number;
}

interface ASTHistoryEntry {
  id: string;
  astNumber: string;
  projectNumber: string;
  workLocation: string;
  client: string;
  industry: string;
  status: 'draft' | 'active' | 'completed' | 'locked' | 'archived';
  createdAt: string;
  lastModified: string;
  hazardCount: number;
  equipmentCount: number;
  workerCount: number;
  photoCount: number;
  permitCount: number;
  completionPercentage: number;
  qrCodeUrl?: string;
}

interface FinalizationStepProps {
  formData: any; // Données complètes de ASTForm + Steps 1-5
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

// =================== TRADUCTIONS BILINGUES AST ===================
const translations = {
  fr: {
    // Titres principaux
    title: "🛡️ Finalisation AST Complète",
    subtitle: "Génération, Sauvegarde et Partage du Rapport AST Final",
    
    // Onglets
    tabs: {
      validation: "✅ Validation Globale",
      actions: "⚡ Actions Finales", 
      sharing: "📤 Partage et Distribution",
      reports: "📊 Rapports AST"
    },
    
    // Actions principales
    saveAST: "💾 Sauvegarder AST Complète",
    printPDF: "🖨️ Générer Rapport PDF", 
    generateQR: "📱 Code QR Mobile",
    shareAST: "📤 Partager AST",
    searchDatabase: "🔍 Base de Données AST",
    lockAST: "🔒 Verrouiller AST",
    copy: "Copier",
    
    // Steps AST
    step1ProjectInfo: "📋 Step 1 - Informations Projet",
    step2Equipment: "🛡️ Step 2 - Équipements Sécurité",
    step3Hazards: "⚠️ Step 3 - Dangers et Contrôles",
    step4Permits: "📄 Step 4 - Permis et Autorisations",
    step5Validation: "✅ Step 5 - Validation Équipe",
    step6Finalization: "🏁 Step 6 - Finalisation",
    
    // Validation
    validation: "Validation AST Complète",
    validationSummary: "Résumé de Validation Globale",
    allValidationsPassed: "AST entièrement validée - Prête pour utilisation",
    validationErrors: "Problèmes détectés dans l'AST",
    
    // Statistiques
    statistics: "📊 Statistiques AST Complètes",
    sectionsComplete: "Sections AST Complétées",
    identifiedHazards: "Dangers Identifiés",
    selectedEquipment: "Équipements Sélectionnés",
    requiredPermits: "Permis Requis",
    teamMembers: "Membres Équipe",
    documentsPhotos: "Documents/Photos",
    lastActivity: "Dernière Activité",
    creationDate: "Date de Création",
    
    // Options rapports
    reportOptions: "Options de Rapport AST",
    includePhotos: "📸 Inclure Photos de Terrain",
    includeSignatures: "✍️ Inclure Signatures Équipe",
    includeQRCode: "📱 Inclure Code QR",
    includeBranding: "🏢 Inclure Logo C-Secur360",
    includeTimestamps: "🕒 Inclure Horodatage",
    includeComments: "💬 Inclure Commentaires",
    includeStatistics: "📊 Inclure Statistiques",
    includeValidation: "✅ Inclure Validation",
    includePermits: "📄 Inclure Permis",
    includeHazards: "⚠️ Inclure Dangers",
    includeEquipment: "🛡️ Inclure Équipements",
    
    // Partage
    sharing: "Partage AST",
    shareInstructions: "Instructions de partage AST:",
    shareList: [
      "Partagez cette AST avec votre équipe de travail",
      "Chaque membre peut consulter l'AST avant le début des tâches",
      "Le rapport PDF peut être imprimé pour affichage sur site",
      "Le QR Code permet un accès mobile rapide aux informations"
    ],
    
    // Commentaires
    finalComments: "💬 Commentaires Finaux AST",
    commentsPlaceholder: "Ajoutez des commentaires finaux sur cette AST, recommandations spéciales, leçons apprises, ou instructions particulières pour l'équipe...",
    documentLocked: "🔒 AST verrouillée - Aucune modification possible",
    
    // Verrouillage
    confirmLock: "🔒 Confirmer Verrouillage AST",
    
    // Industries
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
    
    // Statuts
    complete: "Complété",
    incomplete: "Incomplet",
    valid: "Valide",
    invalid: "Non valide",
    saving: "Sauvegarde AST...",
    saved: "AST Sauvegardée",
    loading: "Chargement...",
    searching: "Recherche AST...",
    generating: "Génération...",
    locked: "🔒 Verrouillé",
    unlocked: "🔓 Déverrouillé",
    
    // Messages
    saveSuccess: "AST sauvegardée avec succès dans la base de données!",
    qrGenerated: "Code QR généré pour accès mobile à l'AST",
    linkCopied: "Lien AST copié dans le presse-papiers",
    pdfGenerated: "Rapport AST PDF généré avec succès",
    astLocked: "AST verrouillée définitivement",
    noResults: "Aucune AST trouvée",
    searchPlaceholder: "Rechercher par numéro AST, projet, client...",
    
    // Boutons
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
    export: "Exporter",
    import: "Importer",
    refresh: "Actualiser",
    back: "Retour",
    database: "🗄️ Base de Données"
  },
  
  en: {
    // Main titles
    title: "🛡️ Complete JSA Finalization", 
    subtitle: "Generation, Saving and Sharing of Final JSA Report",
    
    // Tabs
    tabs: {
      validation: "✅ Global Validation",
      actions: "⚡ Final Actions",
      sharing: "📤 Sharing & Distribution", 
      reports: "📊 JSA Reports"
    },
    
    // Main actions
    saveAST: "💾 Save Complete JSA",
    printPDF: "🖨️ Generate PDF Report", 
    generateQR: "📱 Mobile QR Code",
    shareAST: "📤 Share JSA",
    searchDatabase: "🔍 JSA Database",
    lockAST: "🔒 Lock JSA",
    copy: "Copy",
    
    // JSA steps
    step1ProjectInfo: "📋 Step 1 - Project Information",
    step2Equipment: "🛡️ Step 2 - Safety Equipment",
    step3Hazards: "⚠️ Step 3 - Hazards & Controls",
    step4Permits: "📄 Step 4 - Permits & Authorizations",
    step5Validation: "✅ Step 5 - Team Validation",
    step6Finalization: "🏁 Step 6 - Finalization",
    
    // Validation
    validation: "Complete JSA Validation",
    validationSummary: "Global Validation Summary",
    allValidationsPassed: "JSA fully validated - Ready for use",
    validationErrors: "Issues detected in JSA",
    
    // Statistics
    statistics: "📊 Complete JSA Statistics",
    sectionsComplete: "JSA Sections Completed",
    identifiedHazards: "Identified Hazards", 
    selectedEquipment: "Selected Equipment",
    requiredPermits: "Required Permits",
    teamMembers: "Team Members",
    documentsPhotos: "Documents/Photos",
    lastActivity: "Last Activity",
    creationDate: "Creation Date",
    
    // Report options
    reportOptions: "JSA Report Options",
    includePhotos: "📸 Include Field Photos",
    includeSignatures: "✍️ Include Team Signatures", 
    includeQRCode: "📱 Include QR Code",
    includeBranding: "🏢 Include C-Secur360 Logo",
    includeTimestamps: "🕒 Include Timestamps",
    includeComments: "💬 Include Comments",
    includeStatistics: "📊 Include Statistics",
    includeValidation: "✅ Include Validation",
    includePermits: "📄 Include Permits",
    includeHazards: "⚠️ Include Hazards",
    includeEquipment: "🛡️ Include Equipment",
    
    // Sharing
    sharing: "JSA Sharing",
    shareInstructions: "JSA sharing instructions:",
    shareList: [
      "Share this JSA with your work team",
      "Each member can review the JSA before starting tasks",
      "PDF report can be printed for on-site display", 
      "QR Code allows quick mobile access to information"
    ],
    
    // Comments
    finalComments: "💬 Final JSA Comments",
    commentsPlaceholder: "Add final comments on this JSA, special recommendations, lessons learned, or particular instructions for the team...",
    documentLocked: "🔒 JSA locked - No modifications possible",
    
    // Locking
    confirmLock: "🔒 Confirm JSA Lock",
    
    // Industries
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
    
    // Status
    complete: "Complete",
    incomplete: "Incomplete",
    valid: "Valid",
    invalid: "Invalid",
    saving: "Saving JSA...",
    saved: "JSA Saved",
    loading: "Loading...",
    searching: "Searching JSA...",
    generating: "Generating...",
    locked: "🔒 Locked",
    unlocked: "🔓 Unlocked",
    
    // Messages
    saveSuccess: "JSA saved successfully to database!",
    qrGenerated: "QR Code generated for mobile JSA access", 
    linkCopied: "JSA link copied to clipboard",
    pdfGenerated: "JSA PDF report generated successfully",
    astLocked: "JSA locked permanently",
    noResults: "No JSA found",
    searchPlaceholder: "Search by JSA number, project, client...",
    
    // Buttons
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
    export: "Export",
    import: "Import",
    refresh: "Refresh",
    back: "Back",
    database: "🗄️ Database"
  }
};

// =================== FONCTION PRINCIPALE STEP6 ===================
function Step6Finalization({ 
  formData,
  onDataChange, 
  language = 'fr',
  tenant 
}: FinalizationStepProps) {
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
  const [currentView, setCurrentView] = useState<ViewType>('main');
  
  // États de confirmation et modales
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // États de recherche base de données
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ASTHistoryEntry[]>([]);
  
  // États de partage
  const [selectedShareMethod, setSelectedShareMethod] = useState<ShareMethod>('email');
  
  // États de notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<NotificationType>('success');
  
  // ✅ ÉTAT FINALISATION AST STABLE AVEC TYPE EXPLICITE
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
      includePermits: true,
      includeHazards: true,
      includeEquipment: true,
      format: 'pdf' as const,
      template: 'standard' as const
    },
    isLocked: false,
    completionPercentage: 0,
    qrCodeUrl: '',
    shareableLink: '',
    lastSaved: '',
    generatedReports: []
  }));

  // =================== FONCTIONS UTILITAIRES OPTIMISÉES ===================
  
  /**
   * ✅ FONCTION NOTIFICATION SYSTÈME STABLE
   */
  const showNotificationToast = useCallback((message: string, type: NotificationType = 'success') => {
    console.log(`[${type.toUpperCase()}] Step6 AST - ${message}`);
    
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Auto-hide après 4 secondes
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  }, []);

  /**
   * ✅ EXTRACTION DONNÉES COMPLÈTES AST (FONCTION CORE)
   */
  const extractCompleteASTData = useCallback((): ASTData => {
    console.log('📊 Step6 AST - Extraction données complètes formData:', formData);
    
    // Génération numéro AST unique si manquant
    const astNumber = formData?.astNumber || 
      `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    return {
      astNumber,
      tenant,
      language,
      createdAt: formData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: formData?.status || 'draft',
      
      // ✅ Step 1 - Informations projet (récupérées de ASTForm)
      projectInfo: {
        client: formData?.projectInfo?.client || formData?.client || 'Non spécifié',
        projectNumber: formData?.projectInfo?.projectNumber || formData?.projectNumber || 'Non spécifié',
        workLocation: formData?.projectInfo?.workLocation || formData?.workLocation || 'Non spécifié',
        date: formData?.projectInfo?.date || formData?.date || new Date().toISOString().split('T')[0],
        time: formData?.projectInfo?.time || formData?.time || new Date().toTimeString().slice(0, 5),
        industry: formData?.projectInfo?.industry || formData?.industry || 'other',
        workerCount: formData?.projectInfo?.workerCount || formData?.workerCount || 0,
        estimatedDuration: formData?.projectInfo?.estimatedDuration || formData?.estimatedDuration || 'Non spécifié',
        workDescription: formData?.projectInfo?.workDescription || formData?.workDescription || 'Non spécifié',
        clientContact: formData?.projectInfo?.clientContact || formData?.clientContact || 'Non spécifié',
        emergencyContact: formData?.projectInfo?.emergencyContact || formData?.emergencyContact || 'Non spécifié',
        lockoutPoints: formData?.projectInfo?.lockoutPoints || formData?.lockoutPoints || [],
        weatherConditions: formData?.projectInfo?.weatherConditions || formData?.weatherConditions,
        accessRestrictions: formData?.projectInfo?.accessRestrictions || formData?.accessRestrictions
      },
      
      // ✅ Step 2 - Équipements de sécurité
      equipment: {
        selected: formData?.equipment?.selected || formData?.selectedEquipment || [],
        categories: formData?.equipment?.categories || [],
        mandatory: formData?.equipment?.mandatory || [],
        optional: formData?.equipment?.optional || [],
        totalCost: formData?.equipment?.totalCost || 0,
        inspectionRequired: formData?.equipment?.inspectionRequired || false,
        certifications: formData?.equipment?.certifications || []
      },
      
      // ✅ Step 3 - Dangers et contrôles
      hazards: {
        identified: formData?.hazards?.identified || formData?.selectedHazards || [],
        riskLevel: formData?.hazards?.riskLevel || 'medium',
        controlMeasures: formData?.hazards?.controlMeasures || [],
        residualRisk: formData?.hazards?.residualRisk || 'low',
        emergencyProcedures: formData?.hazards?.emergencyProcedures || [],
        monitoringRequired: formData?.hazards?.monitoringRequired || false
      },
      
      // ✅ Step 4 - Permis et autorisations
      permits: {
        required: formData?.permits?.required || formData?.selectedPermits || [],
        authorities: formData?.permits?.authorities || [],
        validations: formData?.permits?.validations || [],
        expiry: formData?.permits?.expiry || [],
        documents: formData?.permits?.documents || [],
        specialRequirements: formData?.permits?.specialRequirements || []
      },
      
      // ✅ Step 5 - Validation équipe
      validation: {
        reviewers: formData?.validation?.reviewers || formData?.teamMembers || [],
        approvals: formData?.validation?.approvals || [],
        signatures: formData?.validation?.signatures || [],
        finalApproval: formData?.validation?.finalApproval || false,
        criteria: formData?.validation?.criteria || {},
        comments: formData?.validation?.comments || []
      },
      
      // ✅ Step 6 - Finalisation (état actuel)
      finalization: finalizationData
    };
  }, [formData, finalizationData, tenant, language]);

  /**
   * ✅ VALIDATION GLOBALE AST AVEC MÉMO OPTIMISÉ
   */
  const getASTValidation = useMemo(() => {
    const astData = extractCompleteASTData();
    
    // Validation Step 1 - Informations projet requises
    const step1Complete = Boolean(
      astData.projectInfo.client !== 'Non spécifié' &&
      astData.projectInfo.projectNumber !== 'Non spécifié' &&
      astData.projectInfo.workLocation !== 'Non spécifié' &&
      astData.projectInfo.workDescription !== 'Non spécifié'
    );
    
    // Validation Step 2 - Au moins un équipement sélectionné
    const step2Complete = Boolean(astData.equipment.selected.length > 0);
    
    // Validation Step 3 - Au moins un danger identifié
    const step3Complete = Boolean(astData.hazards.identified.length > 0);
    
    // Validation Step 4 - Au moins un permis requis
    const step4Complete = Boolean(astData.permits.required.length > 0);
    
    // Validation Step 5 - Au moins un reviewer dans l'équipe
    const step5Complete = Boolean(astData.validation.reviewers.length > 0);
    
    // Validation Step 6 - Commentaires ou photos ajoutés
    const step6Complete = Boolean(
      astData.finalization.finalComments.length > 0 ||
      astData.finalization.photos.length > 0
    );
    
    const completedSteps = [step1Complete, step2Complete, step3Complete, step4Complete, step5Complete, step6Complete]
      .filter(Boolean).length;
    const totalSteps = 6;
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    
    // Construction des erreurs détaillées
    const errors = [];
    if (!step1Complete) errors.push(language === 'fr' ? 'Informations projet incomplètes' : 'Project information incomplete');
    if (!step2Complete) errors.push(language === 'fr' ? 'Équipements non sélectionnés' : 'Equipment not selected');
    if (!step3Complete) errors.push(language === 'fr' ? 'Dangers non identifiés' : 'Hazards not identified');
    if (!step4Complete) errors.push(language === 'fr' ? 'Permis non configurés' : 'Permits not configured');
    if (!step5Complete) errors.push(language === 'fr' ? 'Validation équipe manquante' : 'Team validation missing');
    if (!step6Complete) errors.push(language === 'fr' ? 'Finalisation incomplète' : 'Finalization incomplete');
    
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
        step5Complete,
        step6Complete
      }
    };
  }, [extractCompleteASTData, language]);

  /**
   * ✅ VALIDATION DÉTAILLÉE PAR SECTION AST
   */
  const getSectionValidation = useCallback((): ValidationSummary[] => {
    const astData = extractCompleteASTData();
    const validation = getASTValidation;
    
    return [
      {
        stepNumber: 1,
        sectionName: t.step1ProjectInfo,
        icon: <Building size={20} color={validation.sections.step1Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step1Complete,
        completionPercentage: validation.sections.step1Complete ? 100 : 
          Math.round((
            (astData.projectInfo.client !== 'Non spécifié' ? 25 : 0) +
            (astData.projectInfo.projectNumber !== 'Non spécifié' ? 25 : 0) +
            (astData.projectInfo.workLocation !== 'Non spécifié' ? 25 : 0) +
            (astData.projectInfo.workDescription !== 'Non spécifié' ? 25 : 0)
          )),
        errors: validation.sections.step1Complete ? [] : [language === 'fr' ? 'Informations projet incomplètes' : 'Project information incomplete'],
        lastModified: astData.updatedAt
      },
      {
        stepNumber: 2,
        sectionName: t.step2Equipment,
        icon: <Shield size={20} color={validation.sections.step2Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step2Complete,
        completionPercentage: validation.sections.step2Complete ? 100 : 0,
        errors: validation.sections.step2Complete ? [] : [language === 'fr' ? 'Équipements de sécurité non sélectionnés' : 'Safety equipment not selected'],
        lastModified: astData.updatedAt
      },
      {
        stepNumber: 3,
        sectionName: t.step3Hazards,
        icon: <AlertTriangle size={20} color={validation.sections.step3Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step3Complete,
        completionPercentage: validation.sections.step3Complete ? 100 : 0,
        errors: validation.sections.step3Complete ? [] : [language === 'fr' ? 'Dangers et contrôles non identifiés' : 'Hazards and controls not identified'],
        lastModified: astData.updatedAt
      },
      {
        stepNumber: 4,
        sectionName: t.step4Permits,
        icon: <FileText size={20} color={validation.sections.step4Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step4Complete,
        completionPercentage: validation.sections.step4Complete ? 100 : 0,
        errors: validation.sections.step4Complete ? [] : [language === 'fr' ? 'Permis et autorisations non configurés' : 'Permits and authorizations not configured'],
        lastModified: astData.updatedAt
      },
      {
        stepNumber: 5,
        sectionName: t.step5Validation,
        icon: <Users size={20} color={validation.sections.step5Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step5Complete,
        completionPercentage: validation.sections.step5Complete ? 100 : 0,
        errors: validation.sections.step5Complete ? [] : [language === 'fr' ? 'Validation équipe manquante' : 'Team validation missing'],
        lastModified: astData.updatedAt
      },
      {
        stepNumber: 6,
        sectionName: t.step6Finalization,
        icon: <CheckCircle size={20} color={validation.sections.step6Complete ? '#10b981' : '#f59e0b'} />,
        isComplete: validation.sections.step6Complete,
        completionPercentage: validation.sections.step6Complete ? 100 : 
          (finalizationData.finalComments.length > 0 ? 50 : 0) + (finalizationData.photos.length > 0 ? 50 : 0),
        errors: validation.sections.step6Complete ? [] : [language === 'fr' ? 'Finalisation AST incomplète' : 'JSA finalization incomplete'],
        lastModified: astData.updatedAt
      }
    ];
  }, [extractCompleteASTData, getASTValidation, t, language, finalizationData]);

  /**
   * ✅ STATISTIQUES COMPLÈTES AST OPTIMISÉES
   */
  const getASTStatistics = useCallback((): ASTStatistics => {
    const astData = extractCompleteASTData();
    const validation = getASTValidation;
    
    return {
      // Métadonnées générales
      astNumber: astData.astNumber,
      tenant,
      createdAt: astData.createdAt,
      lastModified: astData.updatedAt,
      status: astData.status,
      
      // Complétion globale
      totalSections: validation.totalSteps,
      completedSections: validation.completedSteps,
      overallCompletion: validation.percentage,
      
      // Contenu AST détaillé par step
      identifiedHazards: astData.hazards.identified.length,
      selectedEquipment: astData.equipment.selected.length,
      requiredPermits: astData.permits.required.length,
      teamMembers: astData.validation.reviewers.length,
      lockoutPoints: astData.projectInfo.lockoutPoints.length,
      
      // Documentation et médias
      photosCount: astData.finalization.photos.length,
      documentsCount: astData.permits.documents.length,
      signaturesCount: astData.validation.signatures.length,
      
      // Informations projet complètes
      industry: astData.projectInfo.industry,
      client: astData.projectInfo.client,
      projectNumber: astData.projectInfo.projectNumber,
      workLocation: astData.projectInfo.workLocation,
      estimatedDuration: astData.projectInfo.estimatedDuration,
      workerCount: astData.projectInfo.workerCount,
      
      // État AST et accès
      lastSaved: astData.finalization.lastSaved || (language === 'fr' ? 'Jamais' : 'Never'),
      isLocked: astData.finalization.isLocked,
      hasQRCode: Boolean(astData.finalization.qrCodeUrl),
      hasShareableLink: Boolean(astData.finalization.shareableLink)
    };
  }, [extractCompleteASTData, getASTValidation, tenant, language]);

  /**
   * ✅ HANDLER MISE À JOUR COMMENTAIRES FINAUX
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
   * ✅ HANDLER TOGGLE OPTIONS DOCUMENT GÉNÉRATION (SÉCURISÉ)
   */
  const toggleDocumentOption = useCallback((option: keyof DocumentGeneration) => {
    try {
      console.log('🔧 Step6 AST - Toggle option:', option);
      
      const currentValue = finalizationData.documentGeneration[option];
      let newValue: any = currentValue;
      
      // Seulement toggle les booléens, pas les strings/objects
      if (typeof currentValue === 'boolean') {
        newValue = !currentValue;
      }
      
      const updatedData = {
        ...finalizationData,
        documentGeneration: {
          ...finalizationData.documentGeneration,
          [option]: newValue
        }
      };

      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
      
      console.log('✅ Step6 AST - Option mise à jour:', option, '=', newValue);
    } catch (error) {
      console.error('❌ Step6 AST - Erreur toggle option:', error);
    }
  }, [finalizationData, onDataChange]);

  /**
   * ✅ MISE À JOUR AUTOMATIQUE POURCENTAGE COMPLÉTION
   */
  React.useEffect(() => {
    const validation = getASTValidation;
    
    if (validation.percentage !== finalizationData.completionPercentage) {
      const updatedData = {
        ...finalizationData,
        completionPercentage: validation.percentage
      };
      
      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
    }
  }, [getASTValidation, finalizationData, onDataChange]);
  // =================== HANDLERS PRINCIPAUX COMME PERMITMANAGER ===================
  
  /**
   * ✅ HANDLER SAUVEGARDE SUPABASE AST COMPLÈTE
   */
  const handleSaveToSupabase = useCallback(async () => {
    console.log('💾 Step6 AST - Début sauvegarde Supabase...');
    setIsSaving(true);
    
    try {
      const astData = extractCompleteASTData();
      const stats = getASTStatistics();
      
      // Structure données Supabase pour AST complète avec tous les steps
      const supabaseData = {
        // Métadonnées principales
        ast_number: astData.astNumber,
        tenant: astData.tenant,
        language: astData.language,
        status: astData.status,
        created_at: astData.createdAt,
        updated_at: astData.updatedAt,
        completion_percentage: stats.overallCompletion,
        is_locked: astData.finalization.isLocked,
        
        // Step 1 - Informations projet complètes
        project_info: {
          client: astData.projectInfo.client,
          project_number: astData.projectInfo.projectNumber,
          work_location: astData.projectInfo.workLocation,
          date: astData.projectInfo.date,
          time: astData.projectInfo.time,
          industry: astData.projectInfo.industry,
          worker_count: astData.projectInfo.workerCount,
          estimated_duration: astData.projectInfo.estimatedDuration,
          work_description: astData.projectInfo.workDescription,
          client_contact: astData.projectInfo.clientContact,
          emergency_contact: astData.projectInfo.emergencyContact,
          lockout_points: astData.projectInfo.lockoutPoints,
          weather_conditions: astData.projectInfo.weatherConditions,
          access_restrictions: astData.projectInfo.accessRestrictions
        },
        
        // Step 2 - Équipements sécurité avec détails
        equipment: {
          selected: astData.equipment.selected,
          categories: astData.equipment.categories,
          mandatory: astData.equipment.mandatory,
          optional: astData.equipment.optional,
          total_cost: astData.equipment.totalCost,
          inspection_required: astData.equipment.inspectionRequired,
          certifications: astData.equipment.certifications
        },
        
        // Step 3 - Dangers et contrôles détaillés
        hazards: {
          identified: astData.hazards.identified,
          risk_level: astData.hazards.riskLevel,
          control_measures: astData.hazards.controlMeasures,
          residual_risk: astData.hazards.residualRisk,
          emergency_procedures: astData.hazards.emergencyProcedures,
          monitoring_required: astData.hazards.monitoringRequired
        },
        
        // Step 4 - Permis et autorisations complets
        permits: {
          required: astData.permits.required,
          authorities: astData.permits.authorities,
          validations: astData.permits.validations,
          expiry: astData.permits.expiry,
          documents: astData.permits.documents,
          special_requirements: astData.permits.specialRequirements
        },
        
        // Step 5 - Validation équipe avec signatures
        validation: {
          reviewers: astData.validation.reviewers,
          approvals: astData.validation.approvals,
          signatures: astData.validation.signatures,
          final_approval: astData.validation.finalApproval,
          criteria: astData.validation.criteria,
          comments: astData.validation.comments
        },
        
        // Step 6 - Finalisation avec documents générés
        finalization: {
          photos: astData.finalization.photos,
          final_comments: astData.finalization.finalComments,
          document_generation: astData.finalization.documentGeneration,
          qr_code_url: astData.finalization.qrCodeUrl,
          shareable_link: astData.finalization.shareableLink,
          generated_reports: astData.finalization.generatedReports
        },
        
        // Statistiques pour recherche rapide et analytics
        statistics: {
          identified_hazards: stats.identifiedHazards,
          selected_equipment: stats.selectedEquipment,
          required_permits: stats.requiredPermits,
          team_members: stats.teamMembers,
          photos_count: stats.photosCount,
          documents_count: stats.documentsCount,
          signatures_count: stats.signaturesCount,
          lockout_points: stats.lockoutPoints
        }
      };

      console.log('📤 Step6 AST - Données pour Supabase:', supabaseData);
      const { data, error } = await supabase
        .from('ast_complete_records')
        .upsert(supabaseData, { onConflict: 'ast_number' });

      if (error) {
        throw error;
      }

      // Mise à jour état local avec timestamp de sauvegarde
      const updatedData = {
        ...finalizationData,
        lastSaved: new Date().toISOString()
      };
      
      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
      
      showNotificationToast(t.saveSuccess, 'success');
      console.log('✅ Step6 AST - Sauvegarde Supabase réussie', data);
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur sauvegarde Supabase:', error);
      showNotificationToast(language === 'fr' ? 'Erreur lors de la sauvegarde AST' : 'Error saving JSA', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [extractCompleteASTData, getASTStatistics, finalizationData, onDataChange, t.saveSuccess, showNotificationToast, language]);

  /**
   * ✅ HANDLER GÉNÉRATION QR CODE AST SÉCURISÉ
   */
  const handleGenerateQR = useCallback(async () => {
    console.log('📱 Step6 AST - Début génération QR Code...');
    setIsGeneratingQR(true);
    
    try {
      const astData = extractCompleteASTData();
      const astUrl = `https://${tenant}.csecur360.com/ast/view/${astData.astNumber}`;
      
      // Génération QR Code haute qualité avec API externe
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(astUrl)}&bgcolor=FFFFFF&color=000000&format=png&ecc=M&margin=10`;
      
      const updatedData = {
        ...finalizationData,
        qrCodeUrl,
        shareableLink: astUrl
      };
      
      setFinalizationData(updatedData);
      onDataChange('finalization', updatedData);
      
      showNotificationToast(t.qrGenerated, 'success');
      console.log('✅ Step6 AST - QR Code généré:', qrCodeUrl);
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur génération QR:', error);
      showNotificationToast(language === 'fr' ? 'Erreur génération QR Code' : 'Error generating QR Code', 'error');
    } finally {
      setIsGeneratingQR(false);
    }
  }, [extractCompleteASTData, tenant, finalizationData, onDataChange, t.qrGenerated, showNotificationToast, language]);

  /**
   * ✅ HANDLER GÉNÉRATION PDF PROFESSIONNEL AVEC LOGO C-SECUR360
   */
  const handleGeneratePDF = useCallback(async (reportType: ReportType = 'standard') => {
    console.log(`🖨️ Step6 AST - Début génération PDF ${reportType}...`);
    setIsGeneratingPDF(true);
    
    try {
      const astData = extractCompleteASTData();
      const stats = getASTStatistics();
      const sections = getSectionValidation();
      
      const currentDate = new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA');
      const currentTime = new Date().toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA');
      
      // ✅ GÉNÉRATION HTML PROFESSIONNEL OPTIMISÉ POUR 8.5x11
      const pdfContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${language === 'en' ? 'Complete JSA Report' : 'Rapport AST Complet'} - ${stats.client}</title>
    <style>
        @media print { 
          @page { 
            margin: 12mm; 
            size: 8.5in 11in; 
          } 
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          } 
          .page-break { 
            page-break-before: always; 
          } 
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.3; 
          color: #1f2937; 
          background: white; 
          font-size: 10px; 
          max-width: 8.5in;
          margin: 0 auto;
        }
        
        /* ✅ HEADER OPTIMISÉ POUR 8.5x11 */
        .header { 
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
          color: white; 
          padding: 15px 20px; 
          text-align: center; 
          margin-bottom: 20px; 
          border-radius: 6px; 
          position: relative; 
          overflow: hidden;
          height: auto;
          min-height: 80px;
        }
        .logo-container { 
          position: absolute; 
          left: 15px; 
          top: 50%; 
          transform: translateY(-50%); 
          width: 60px; 
          height: 60px; 
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          border: 2px solid #f59e0b; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justifyContent: center;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
        }
        .logo-image { 
          width: 48px; 
          height: 48px; 
          object-fit: contain;
          filter: brightness(1.2) contrast(1.1);
        }
        .logo-fallback { 
          color: #f59e0b; 
          font-size: 20px; 
          font-weight: bold; 
          display: none;
        }
        .header-content {
          margin-left: 80px;
          text-align: left;
        }
        .header h1 { 
          font-size: 18px; 
          margin-bottom: 6px; 
          font-weight: bold; 
          text-shadow: 0 1px 2px rgba(0,0,0,0.3); 
          line-height: 1.2;
        }
        .header .subtitle { 
          font-size: 12px; 
          opacity: 0.9; 
          font-weight: 500; 
          line-height: 1.2;
        }
        
        /* ✅ WATERMARK DISCRET */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          opacity: 0.02;
          font-size: 120px;
          font-weight: bold;
          color: #f59e0b;
          z-index: -1;
          pointer-events: none;
        }
        
        .stats-summary { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
          color: white; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); 
          gap: 12px; 
          margin-top: 10px; 
        }
        .stat-item { 
          text-align: center; 
          background: rgba(255, 255, 255, 0.15); 
          padding: 10px; 
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .stat-number { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
        .stat-label { font-size: 9px; opacity: 0.9; font-weight: 500; }
        
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          margin-bottom: 20px; 
        }
        .info-box { 
          border: 1px solid #e5e7eb; 
          padding: 12px; 
          border-radius: 8px; 
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .info-box h3 { 
          font-size: 11px; 
          color: #374151; 
          margin-bottom: 10px; 
          font-weight: bold; 
          border-bottom: 1px solid #3b82f6; 
          padding-bottom: 5px;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 5px; 
          padding: 3px 0; 
          align-items: center;
        }
        .info-label { 
          font-weight: 600; 
          color: #4b5563; 
          min-width: 100px; 
          font-size: 9px;
        }
        .info-value { 
          color: #1f2937; 
          font-weight: 500; 
          flex: 1; 
          text-align: right; 
          font-size: 9px;
          word-break: break-word;
        }
        
        .section { 
          margin-bottom: 20px; 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); 
          page-break-inside: avoid;
        }
        .section-header { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          padding: 10px 15px; 
          border-bottom: 1px solid #d1d5db;
        }
        .section-title { font-size: 12px; font-weight: bold; color: #1f2937; }
        .section-content { padding: 12px; }
        
        .validation-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px; 
        }
        .validation-table th, .validation-table td { 
          border: 1px solid #d1d5db; 
          padding: 8px; 
          text-align: left; 
          font-size: 9px; 
        }
        .validation-table th { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          font-weight: bold; 
          color: #374151;
        }
        .status-complete { background: #dcfce7; color: #166534; font-weight: 600; }
        .status-incomplete { background: #fef3c7; color: #92400e; font-weight: 600; }
        
        .step-section { 
          margin-bottom: 15px; 
          padding: 12px; 
          border: 1px solid #e5e7eb; 
          border-radius: 6px; 
          background: #fafafa;
        }
        .step-title { 
          font-size: 11px; 
          font-weight: bold; 
          margin-bottom: 8px; 
          color: #1f2937;
        }
        .step-content { font-size: 9px; line-height: 1.4; color: #4b5563; }
        .step-list { padding-left: 15px; margin-top: 5px; }
        .step-list li { margin-bottom: 3px; font-size: 9px; }
        
        .footer { 
          margin-top: 25px; 
          padding: 12px; 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          text-align: center; 
          font-size: 8px; 
          color: #6b7280;
          position: relative;
          page-break-inside: avoid;
        }
        .footer-logo {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border: 2px solid #f59e0b;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
        }
        
        .signature-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr; 
          gap: 25px; 
          margin-top: 30px; 
          page-break-inside: avoid;
        }
        .signature-box { 
          border-top: 2px solid #374151; 
          padding-top: 10px; 
          text-align: center;
          min-height: 60px;
        }
        .signature-label { 
          font-size: 9px; 
          color: #4b5563; 
          font-weight: 700; 
          text-transform: uppercase; 
          letter-spacing: 0.3px; 
        }
        
        .qr-section { 
          text-align: center; 
          margin: 20px 0; 
          page-break-inside: avoid; 
        }
        .qr-code { 
          border: 3px solid #f59e0b; 
          border-radius: 10px; 
          padding: 10px; 
          background: white; 
          display: inline-block;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
        }
        
        /* ✅ RESPONSIVE POUR DIFFÉRENTES TAILLES */
        @media screen and (max-width: 8.5in) {
          body { padding: 10px; }
          .header { padding: 12px 15px; }
          .logo-container { width: 50px; height: 50px; }
          .logo-image { width: 40px; height: 40px; }
          .header h1 { font-size: 16px; }
          .header .subtitle { font-size: 11px; }
        }
    </style>
</head>
<body>
    <!-- ✅ WATERMARK DISCRET -->
    <div class="watermark">C-SECUR360</div>
    
    <div class="header">
        <div class="logo-container">
            <img src="/c-secur360-logo.png" alt="C-Secur360" class="logo-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="logo-fallback">C🛡️</div>
        </div>
        <div class="header-content">
            <h1>${language === 'en' ? '🛡️ COMPLETE JOB SAFETY ANALYSIS (JSA)' : '🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL COMPLÈTE (AST)'}</h1>
            <div class="subtitle">${language === 'en' ? 'Professional Safety Report' : 'Rapport de Sécurité Professionnel'} - ${tenant} | N° ${stats.astNumber}</div>
        </div>
    </div>
        
        .stats-summary { 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
          color: white; 
          padding: 20px; 
          border-radius: 12px; 
          margin-bottom: 25px;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 18px; margin-top: 15px; }
        .stat-item { 
          text-align: center; 
          background: rgba(255, 255, 255, 0.15); 
          padding: 15px; 
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
        .stat-number { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
        .stat-label { font-size: 11px; opacity: 0.9; margin-top: 4px; font-weight: 500; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px; }
        .info-box { 
          border: 2px solid #e5e7eb; 
          padding: 20px; 
          border-radius: 12px; 
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .info-box h3 { 
          font-size: 14px; 
          color: #374151; 
          margin-bottom: 15px; 
          font-weight: bold; 
          border-bottom: 2px solid #3b82f6; 
          padding-bottom: 8px;
        }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 6px 0; }
        .info-label { font-weight: 600; color: #4b5563; min-width: 140px; }
        .info-value { color: #1f2937; font-weight: 500; flex: 1; text-align: right; }
        
        .section { margin-bottom: 30px; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .section-header { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          padding: 15px 20px; 
          border-bottom: 2px solid #d1d5db;
        }
        .section-title { font-size: 16px; font-weight: bold; color: #1f2937; }
        .section-content { padding: 20px; }
        
        .validation-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .validation-table th, .validation-table td { 
          border: 1px solid #d1d5db; 
          padding: 12px; 
          text-align: left; 
          font-size: 10px; 
        }
        .validation-table th { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          font-weight: bold; 
          color: #374151;
        }
        .status-complete { background: #dcfce7; color: #166534; font-weight: 600; }
        .status-incomplete { background: #fef3c7; color: #92400e; font-weight: 600; }
        
        .step-section { 
          margin-bottom: 25px; 
          padding: 18px; 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          background: #fafafa;
        }
        .step-title { 
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 12px; 
          color: #1f2937;
        }
        .step-content { font-size: 10px; line-height: 1.5; color: #4b5563; }
        .step-list { padding-left: 20px; margin-top: 8px; }
        .step-list li { margin-bottom: 4px; }
        
        .footer { 
          margin-top: 40px; 
          padding: 20px; 
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
          border: 2px solid #e5e7eb; 
          border-radius: 12px; 
          text-align: center; 
          font-size: 10px; 
          color: #6b7280;
          position: relative;
        }
        .footer-logo {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          border: 3px solid #f59e0b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
        }
        
        .signature-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 50px; }
        .signature-box { 
          border-top: 3px solid #374151; 
          padding-top: 15px; 
          text-align: center;
          min-height: 80px;
        }
        .signature-label { font-size: 11px; color: #4b5563; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .qr-section { text-align: center; margin: 30px 0; page-break-inside: avoid; }
        .qr-code { 
          border: 4px solid #f59e0b; 
          border-radius: 16px; 
          padding: 15px; 
          background: white; 
          display: inline-block;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
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
        <h1>${language === 'en' ? '🛡️ COMPLETE JOB SAFETY ANALYSIS (JSA)' : '🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL COMPLÈTE (AST)'}</h1>
        <div class="subtitle">${language === 'en' ? 'Professional Safety Report' : 'Rapport de Sécurité Professionnel'} - ${tenant} | N° ${stats.astNumber}</div>
    </div>
    
    <div class="stats-summary">
        <h3 style="margin-bottom: 15px; font-size: 16px;">📊 ${language === 'en' ? 'EXECUTIVE SUMMARY' : 'RÉSUMÉ EXÉCUTIF'}</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${stats.completedSections}/${stats.totalSections}</div>
                <div class="stat-label">${language === 'en' ? 'Completed Steps' : 'Étapes Complétées'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.identifiedHazards}</div>
                <div class="stat-label">${language === 'en' ? 'Identified Hazards' : 'Dangers Identifiés'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.selectedEquipment}</div>
                <div class="stat-label">${language === 'en' ? 'Safety Equipment' : 'Équipements Sécurité'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.requiredPermits}</div>
                <div class="stat-label">${language === 'en' ? 'Required Permits' : 'Permis Requis'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.teamMembers}</div>
                <div class="stat-label">${language === 'en' ? 'Team Members' : 'Membres Équipe'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.overallCompletion}%</div>
                <div class="stat-label">${language === 'en' ? 'Completion' : 'Complétion'}</div>
            </div>
        </div>
    </div>
    
    <div class="info-grid">
        <div class="info-box">
            <h3>🏢 ${language === 'en' ? 'PROJECT INFORMATION' : 'INFORMATIONS PROJET'}</h3>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Client:' : 'Client:'}</span>
                <span class="info-value">${stats.client}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Project #:' : 'Projet #:'}</span>
                <span class="info-value">${stats.projectNumber}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Location:' : 'Lieu:'}</span>
                <span class="info-value">${stats.workLocation}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Industry:' : 'Industrie:'}</span>
                <span class="info-value">${t.industries[stats.industry as keyof typeof t.industries] || stats.industry}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Duration:' : 'Durée:'}</span>
                <span class="info-value">${stats.estimatedDuration}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Workers:' : 'Travailleurs:'}</span>
                <span class="info-value">${stats.workerCount}</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3>🛡️ ${language === 'en' ? 'SAFETY OVERVIEW' : 'APERÇU SÉCURITÉ'}</h3>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Risk Level:' : 'Niveau Risque:'}</span>
                <span class="info-value">${astData.hazards.riskLevel.toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Lockout Points:' : 'Points LOTO:'}</span>
                <span class="info-value">${stats.lockoutPoints}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Photos:' : 'Photos:'}</span>
                <span class="info-value">${stats.photosCount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Documents:' : 'Documents:'}</span>
                <span class="info-value">${stats.documentsCount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Signatures:' : 'Signatures:'}</span>
                <span class="info-value">${stats.signaturesCount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${language === 'en' ? 'Status:' : 'Statut:'}</span>
                <span class="info-value" style="color: ${astData.finalization.isLocked ? '#dc2626' : '#059669'}; font-weight: bold;">
                    ${astData.finalization.isLocked ? (language === 'en' ? '🔒 LOCKED' : '🔒 VERROUILLÉ') : (language === 'en' ? '🔓 ACTIVE' : '🔓 ACTIF')}
                </span>
            </div>
        </div>
    </div>
    
    <!-- Détail par steps selon le type de rapport -->
    ${reportType === 'standard' || reportType === 'technical' ? `
    <div class="section">
        <div class="section-header">
            <div class="section-title">📋 ${language === 'en' ? 'DETAILED BREAKDOWN BY STEPS' : 'DÉTAIL PAR ÉTAPES'}</div>
        </div>
        <div class="section-content">
            <div class="step-section">
                <div class="step-title">🏢 ${t.step1ProjectInfo}</div>
                <div class="step-content">
                    <strong>${language === 'en' ? 'Work Description:' : 'Description du travail:'}</strong> ${astData.projectInfo.workDescription}<br>
                    <strong>${language === 'en' ? 'Emergency Contact:' : 'Contact d\'urgence:'}</strong> ${astData.projectInfo.emergencyContact}<br>
                    ${astData.projectInfo.weatherConditions ? `<strong>${language === 'en' ? 'Weather:' : 'Météo:'}</strong> ${astData.projectInfo.weatherConditions}<br>` : ''}
                    ${astData.projectInfo.accessRestrictions ? `<strong>${language === 'en' ? 'Access:' : 'Accès:'}</strong> ${astData.projectInfo.accessRestrictions}` : ''}
                </div>
            </div>
            
            ${astData.equipment.selected.length > 0 ? `
            <div class="step-section">
                <div class="step-title">🛡️ ${t.step2Equipment}</div>
                <div class="step-content">
                    <ul class="step-list">
                        ${astData.equipment.selected.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            ${astData.hazards.identified.length > 0 ? `
            <div class="step-section">
                <div class="step-title">⚠️ ${t.step3Hazards}</div>
                <div class="step-content">
                    <strong>${language === 'en' ? 'Identified Hazards:' : 'Dangers identifiés:'}</strong>
                    <ul class="step-list">
                        ${astData.hazards.identified.map(hazard => `<li>${hazard}</li>`).join('')}
                    </ul>
                    ${astData.hazards.controlMeasures.length > 0 ? `
                    <strong style="margin-top: 10px; display: block;">${language === 'en' ? 'Control Measures:' : 'Mesures de contrôle:'}</strong>
                    <ul class="step-list">
                        ${astData.hazards.controlMeasures.map(measure => `<li>${measure}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            ${astData.permits.required.length > 0 ? `
            <div class="step-section">
                <div class="step-title">📄 ${t.step4Permits}</div>
                <div class="step-content">
                    <ul class="step-list">
                        ${astData.permits.required.map(permit => `<li>${permit}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
            
            ${astData.validation.reviewers.length > 0 ? `
            <div class="step-section">
                <div class="step-title">✅ ${t.step5Validation}</div>
                <div class="step-content">
                    <strong>${language === 'en' ? 'Team Members:' : 'Membres de l\'équipe:'}</strong>
                    <ul class="step-list">
                        ${astData.validation.reviewers.map(reviewer => `<li>${reviewer}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}
    
    <!-- Validation globale -->
    <div class="section">
        <div class="section-header">
            <div class="section-title">✅ ${language === 'en' ? 'GLOBAL VALIDATION STATUS' : 'STATUT DE VALIDATION GLOBALE'}</div>
        </div>
        <div class="section-content">
            <table class="validation-table">
                <thead>
                    <tr>
                        <th>${language === 'en' ? 'Step' : 'Étape'}</th>
                        <th>${language === 'en' ? 'Section' : 'Section'}</th>
                        <th>${language === 'en' ? 'Status' : 'Statut'}</th>
                        <th>${language === 'en' ? 'Completion' : 'Complétion'}</th>
                        <th>${language === 'en' ? 'Notes' : 'Notes'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${sections.map(section => `
                        <tr>
                            <td><strong>${section.stepNumber}</strong></td>
                            <td><strong>${section.sectionName}</strong></td>
                            <td class="${section.isComplete ? 'status-complete' : 'status-incomplete'}">
                                ${section.isComplete ? (language === 'en' ? '✅ Complete' : '✅ Complété') : (language === 'en' ? '⚠️ Incomplete' : '⚠️ Incomplet')}
                            </td>
                            <td><strong>${section.completionPercentage}%</strong></td>
                            <td>${section.errors.length > 0 ? section.errors[0] : (language === 'en' ? 'No issues' : 'Aucun problème')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            ${astData.finalization.finalComments ? `
                <div style="margin-top: 25px; padding: 20px; background: #f9fafb; border-radius: 12px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px;">💬 ${language === 'en' ? 'Final Comments:' : 'Commentaires Finaux:'}</h4>
                    <p style="margin: 0; color: #4b5563; font-size: 11px; line-height: 1.5;">${astData.finalization.finalComments}</p>
                </div>
            ` : ''}
        </div>
    </div>
    
    ${astData.finalization.qrCodeUrl ? `
        <div class="qr-section">
            <h3 style="margin-bottom: 20px; color: #1f2937;">📱 ${language === 'en' ? 'Mobile Access QR Code' : 'Code QR Accès Mobile'}</h3>
            <div class="qr-code">
                <img src="${astData.finalization.qrCodeUrl}" alt="QR Code AST" style="width: 180px; height: 180px; display: block;" />
            </div>
            <p style="margin-top: 15px; color: #6b7280; font-size: 11px;">
                ${language === 'en' ? 'Scan this QR code to access the JSA from a mobile device' : 'Scannez ce code QR pour accéder à l\'AST depuis un appareil mobile'}
            </p>
        </div>
    ` : ''}
    
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'SAFETY MANAGER' : 'RESPONSABLE SÉCURITÉ'}</div>
            <div style="margin-top: 40px; font-size: 9px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ________________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'SUPERVISOR' : 'SUPERVISEUR'}</div>
            <div style="margin-top: 40px; font-size: 9px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ________________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${language === 'en' ? 'PROJECT MANAGER' : 'GESTIONNAIRE PROJET'}</div>
            <div style="margin-top: 40px; font-size: 9px;">
                ${language === 'en' ? 'Name:' : 'Nom:'} _________________________________<br><br>
                ${language === 'en' ? 'Signature:' : 'Signature:'} ________________________<br><br>
                ${language === 'en' ? 'Date:' : 'Date:'} ________________________________
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-logo">
            <img src="/c-secur360-logo.png" alt="C-Secur360" style="width: 40px; height: 40px; object-fit: contain;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="display: none; color: #f59e0b; font-size: 16px; font-weight: bold;">C🛡️</div>
        </div>
        <p><strong>${language === 'en' ? 'This JSA was automatically generated by the C-Secur360 system' : 'Cette AST a été générée automatiquement par le système C-Secur360'}</strong></p>
        <p>${language === 'en' ? 'Compliant with Canadian occupational health and safety standards' : 'Conforme aux normes de santé et sécurité au travail du Canada'} | ${language === 'en' ? 'Generated on' : 'Généré le'} ${currentDate} ${language === 'en' ? 'at' : 'à'} ${currentTime}</p>
        <p>${language === 'en' ? 'Official document valid for safety inspections, committees and investigations' : 'Document officiel valide pour inspections sécurité, comités et enquêtes'}</p>
        ${astData.finalization.shareableLink ? `<p>🔗 ${language === 'en' ? 'Access link:' : 'Lien d\'accès:'} ${astData.finalization.shareableLink}</p>` : ''}
    </div>
</body>
</html>`;

      // Création et ouverture PDF dans nouvelle fenêtre
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          
          // Enregistrement du rapport généré dans l'historique
          const newReport: GeneratedReport = {
            id: Date.now().toString(),
            type: reportType,
            url: astData.finalization.shareableLink || `#${astData.astNumber}`,
            generatedAt: new Date().toISOString(),
            fileSize: '2.5 MB',
            astNumber: astData.astNumber
          };
          
          const updatedData = {
            ...finalizationData,
            generatedReports: [...finalizationData.generatedReports, newReport]
          };
          
          setFinalizationData(updatedData);
          onDataChange('finalization', updatedData);
          
          setIsGeneratingPDF(false);
          showNotificationToast(t.pdfGenerated, 'success');
        };
        
        console.log(`✅ Step6 AST - PDF ${reportType} généré avec logo officiel`);
      } else {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
      }
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur génération PDF:', error);
      showNotificationToast(language === 'fr' ? 'Erreur génération PDF' : 'Error generating PDF', 'error');
      setIsGeneratingPDF(false);
    }
  }, [extractCompleteASTData, getASTStatistics, getSectionValidation, finalizationData, onDataChange, language, t, showNotificationToast]);

  /**
   * ✅ HANDLER PARTAGE AST MULTI-CANAUX SÉCURISÉ
   */
  const handleShare = useCallback(async () => {
    console.log(`📤 Step6 AST - Début partage via ${selectedShareMethod}...`);
    
    try {
      const astData = extractCompleteASTData();
      const stats = getASTStatistics();
      const shareUrl = astData.finalization.shareableLink || `https://${tenant}.csecur360.com/ast/view/${astData.astNumber}`;
      
      const shareText = language === 'fr' ? 
        `🛡️ AST Complète - ${stats.client}\n\n📋 Analyse Sécuritaire de Travail\nProjet: ${stats.projectNumber}\n📍 Lieu: ${stats.workLocation}\n👥 Équipe: ${stats.teamMembers} membres\n⚠️ Dangers: ${stats.identifiedHazards} identifiés\n🛡️ Équipements: ${stats.selectedEquipment} requis\n📄 Permis: ${stats.requiredPermits} nécessaires\n\n✅ Complétion: ${stats.overallCompletion}%\n🔗 Accès: ${shareUrl}\n\nCette AST doit être consultée avant le début des travaux.\n\n${tenant} - Équipe Sécurité C-Secur360` :
        `🛡️ Complete JSA - ${stats.client}\n\n📋 Job Safety Analysis\nProject: ${stats.projectNumber}\n📍 Location: ${stats.workLocation}\n👥 Team: ${stats.teamMembers} members\n⚠️ Hazards: ${stats.identifiedHazards} identified\n🛡️ Equipment: ${stats.selectedEquipment} required\n📄 Permits: ${stats.requiredPermits} needed\n\n✅ Completion: ${stats.overallCompletion}%\n🔗 Access: ${shareUrl}\n\nThis JSA must be reviewed before work begins.\n\n${tenant} - C-Secur360 Safety Team`;
      
      switch (selectedShareMethod) {
        case 'email':
          const emailSubject = encodeURIComponent(language === 'fr' ? 
            `🛡️ AST ${astData.astNumber} - ${stats.projectNumber}` : 
            `🛡️ JSA ${astData.astNumber} - ${stats.projectNumber}`);
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
          // Intégration Microsoft Teams (future implementation)
          console.log('🔄 Step6 AST - Partage Teams à implémenter');
          showNotificationToast(language === 'fr' ? 'Intégration Teams bientôt disponible' : 'Teams integration coming soon', 'warning');
          break;
          
        case 'slack':
          // Intégration Slack (future implementation)
          console.log('🔄 Step6 AST - Partage Slack à implémenter');
          showNotificationToast(language === 'fr' ? 'Intégration Slack bientôt disponible' : 'Slack integration coming soon', 'warning');
          break;
      }
      
      showNotificationToast(`${language === 'fr' ? 'Partage AST initié via' : 'JSA sharing initiated via'} ${selectedShareMethod}`, 'success');
      console.log(`✅ Step6 AST - Partage ${selectedShareMethod} initié`);
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur partage:', error);
      showNotificationToast(language === 'fr' ? 'Erreur lors du partage' : 'Error sharing', 'error');
    }
  }, [selectedShareMethod, extractCompleteASTData, getASTStatistics, tenant, language, showNotificationToast]);

  /**
   * ✅ HANDLER COPIE LIEN AST RAPIDE
   */
  const handleCopyLink = useCallback(async () => {
    try {
      const astData = extractCompleteASTData();
      const shareUrl = astData.finalization.shareableLink || `https://${tenant}.csecur360.com/ast/view/${astData.astNumber}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      showNotificationToast(t.linkCopied, 'success');
      console.log('✅ Step6 AST - Lien copié:', shareUrl);
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur copie lien:', error);
      showNotificationToast(language === 'fr' ? 'Erreur copie du lien' : 'Error copying link', 'error');
    }
  }, [extractCompleteASTData, tenant, t.linkCopied, showNotificationToast, language]);

  /**
   * ✅ HANDLER VERROUILLAGE AST DÉFINITIF
   */
  const handleLockDocument = useCallback(() => {
    console.log('🔒 Step6 AST - Verrouillage AST...');
    
    const updatedData = {
      ...finalizationData,
      isLocked: true,
      lockTimestamp: new Date().toISOString()
    };

    setFinalizationData(updatedData);
    onDataChange('finalization', updatedData);
    
    showNotificationToast(t.astLocked, 'success');
    console.log('✅ Step6 AST - AST verrouillée');
  }, [finalizationData, onDataChange, t.astLocked, showNotificationToast]);

  /**
   * ✅ HANDLER RECHERCHE BASE DE DONNÉES AST AVEC FILTRES
   */
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Simulation recherche base de données AST avec délai réaliste
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées pour démonstration (future: vraie API Supabase)
      const mockResults: ASTHistoryEntry[] = [
        {
          id: '1',
          astNumber: `AST-${tenant}-2024-001`,
          projectNumber: 'PRJ-2024-001',
          workLocation: 'Site Construction ABC',
          client: 'Client Test 1',
          industry: 'construction',
          status: 'completed' as const,
          createdAt: '2024-01-15T10:00:00Z',
          lastModified: '2024-01-15T16:30:00Z',
          hazardCount: 5,
          equipmentCount: 12,
          workerCount: 8,
          photoCount: 15,
          permitCount: 3,
          completionPercentage: 100,
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=demo'
        },
        {
          id: '2',
          astNumber: `AST-${tenant}-2024-002`,
          projectNumber: 'PRJ-2024-002',
          workLocation: 'Usine Manufacturière XYZ',
          client: 'Client Test 2',
          industry: 'manufacturing',
          status: 'active' as const,
          createdAt: '2024-02-01T09:00:00Z',
          lastModified: '2024-02-05T14:20:00Z',
          hazardCount: 8,
          equipmentCount: 18,
          workerCount: 12,
          photoCount: 22,
          permitCount: 5,
          completionPercentage: 85
        },
        {
          id: '3',
          astNumber: `AST-${tenant}-2024-003`,
          projectNumber: 'PRJ-2024-003',
          workLocation: 'Chantier Électrique DEF',
          client: 'Client Test 3',
          industry: 'electrical',
          status: 'draft' as const,
          createdAt: '2024-03-10T08:00:00Z',
          lastModified: '2024-03-12T11:45:00Z',
          hazardCount: 3,
          equipmentCount: 7,
          workerCount: 4,
          photoCount: 8,
          permitCount: 2,
          completionPercentage: 60
        }
      ].filter(item => 
        item.astNumber.toLowerCase().includes(query.toLowerCase()) ||
        item.projectNumber.toLowerCase().includes(query.toLowerCase()) ||
        item.workLocation.toLowerCase().includes(query.toLowerCase()) ||
        item.client.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      console.log('🔍 Step6 AST - Recherche terminée:', mockResults.length, 'résultats');
      
    } catch (error) {
      console.error('❌ Step6 AST - Erreur recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [tenant]);

  // ✅ EFFET RECHERCHE AVEC DEBOUNCE OPTIMISÉ
  React.useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, handleSearch]);
  // =================== EFFETS AUTOMATIQUES OPTIMISÉS ===================
  
  /**
   * ✅ GÉNÉRATION AUTOMATIQUE QR CODE À 80% COMPLÉTION
   */
  React.useEffect(() => {
    const validation = getASTValidation;
    if (validation.percentage >= 80 && !finalizationData.qrCodeUrl && !isGeneratingQR) {
      console.log('🚀 Step6 AST - Auto-génération QR Code à', validation.percentage, '%');
      handleGenerateQR();
    }
  }, [getASTValidation, finalizationData.qrCodeUrl, isGeneratingQR, handleGenerateQR]);

  /**
   * ✅ SAUVEGARDE AUTOMATIQUE PÉRIODIQUE (5 MINUTES)
   */
  React.useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const validation = getASTValidation;
      if (validation.percentage > 0 && !isSaving && !finalizationData.isLocked) {
        console.log('💾 Step6 AST - Sauvegarde automatique...');
        handleSaveToSupabase();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSaveInterval);
  }, [getASTValidation, isSaving, finalizationData.isLocked, handleSaveToSupabase]);

  /**
   * ✅ NETTOYAGE NOTIFICATIONS AUTO (4 SECONDES)
   */
  React.useEffect(() => {
    if (showNotification) {
      const timeoutId = setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [showNotification]);

  // =================== CSS THÈME SOMBRE ULTRA-RESPONSIVE ===================
  const responsiveCSS = `
    .step6-container { 
      padding: 0; 
      background: transparent; 
      min-height: 100vh; 
      color: #ffffff !important; 
      font-family: 'Inter', 'Arial', sans-serif;
    }
    
    /* ✅ HEADER AVEC LOGO RESPONSIVE */
    .ast-header { 
      text-align: center; 
      margin-bottom: ${isMobile ? '20px' : '28px'}; 
      padding: ${isMobile ? '20px 16px' : '32px 24px'}; 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%); 
      color: white; 
      border-radius: ${isMobile ? '12px' : '16px'}; 
      border: 1px solid rgba(148, 163, 184, 0.2); 
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
    }
    
    .ast-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent);
      animation: shimmer 3s ease-in-out infinite;
    }
    
    .ast-header-content {
      position: relative;
      z-index: 1;
    }
    
    .ast-logo {
      width: ${isMobile ? '56px' : '72px'};
      height: ${isMobile ? '56px' : '72px'};
      margin: 0 auto ${isMobile ? '16px' : '20px'};
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
      border: 3px solid #f59e0b;
      border-radius: ${isMobile ? '12px' : '16px'};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
      animation: float 6s ease-in-out infinite;
    }
    
    .ast-title { 
      font-size: ${isMobile ? '22px' : '32px'}; 
      margin-bottom: ${isMobile ? '8px' : '12px'}; 
      font-weight: 800; 
      color: #ffffff !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .ast-subtitle { 
      font-size: ${isMobile ? '14px' : '18px'}; 
      opacity: 0.9; 
      color: #e2e8f0 !important; 
      margin: 0;
      font-weight: 500;
    }
    
    /* ✅ NAVIGATION ONGLETS RESPONSIVE */
    .tabs-container { 
      display: flex; 
      background: rgba(15, 23, 42, 0.8); 
      border: 1px solid rgba(148, 163, 184, 0.2); 
      border-radius: ${isMobile ? '12px' : '16px'}; 
      padding: ${isMobile ? '4px' : '6px'}; 
      margin-bottom: ${isMobile ? '16px' : '24px'}; 
      backdrop-filter: blur(10px);
      ${isMobile ? 'flex-direction: column; gap: 4px;' : 'flex-direction: row;'}
    }
    
    .tab-button { 
      flex: 1; 
      padding: ${isMobile ? '14px 12px' : '16px 20px'}; 
      border: none; 
      background: transparent; 
      color: #94a3b8; 
      font-weight: 600; 
      border-radius: ${isMobile ? '8px' : '12px'}; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      font-size: ${isMobile ? '14px' : '16px'}; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: ${isMobile ? '6px' : '8px'}; 
      min-height: ${isMobile ? '48px' : '56px'};
      position: relative;
      overflow: hidden;
    }
    
    .tab-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .tab-button:hover::before {
      left: 100%;
    }
    
    .tab-button.active { 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white; 
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); 
      transform: translateY(-2px);
      border: 1px solid rgba(59, 130, 246, 0.5);
    }
    
    .tab-button:hover:not(.active) { 
      background: rgba(59, 130, 246, 0.1); 
      color: #60a5fa; 
      transform: translateY(-1px);
    }
    
    /* ✅ SECTIONS PRINCIPALES RESPONSIVE */
    .ast-section { 
      background: rgba(15, 23, 42, 0.8); 
      border: 1px solid rgba(148, 163, 184, 0.2); 
      border-radius: ${isMobile ? '12px' : '16px'}; 
      padding: ${isMobile ? '16px' : '24px'}; 
      margin-bottom: ${isMobile ? '16px' : '20px'}; 
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
    }
    
    .ast-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
    }
    
    .section-title { 
      font-size: ${isMobile ? '16px' : '20px'}; 
      font-weight: 700; 
      margin-bottom: ${isMobile ? '16px' : '20px'}; 
      color: #ffffff !important; 
      display: flex; 
      align-items: center; 
      gap: ${isMobile ? '8px' : '12px'};
    }
    
    /* ✅ GRILLES RESPONSIVE OPTIMISÉES */
    .stats-grid { 
      display: grid; 
      grid-template-columns: ${isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))'}; 
      gap: ${isMobile ? '8px' : '12px'}; 
      margin-bottom: ${isMobile ? '16px' : '20px'}; 
    }
    
    .stat-card { 
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.15) 100%); 
      color: white; 
      padding: ${isMobile ? '12px' : '16px'}; 
      border-radius: ${isMobile ? '8px' : '12px'}; 
      text-align: center; 
      border: 1px solid rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.5);
    }
    
    .stat-number { 
      font-size: ${isMobile ? '18px' : '24px'}; 
      font-weight: 800; 
      margin-bottom: ${isMobile ? '4px' : '6px'};
      color: #60a5fa;
    }
    
    .stat-label { 
      font-size: ${isMobile ? '10px' : '12px'}; 
      opacity: 0.9;
      font-weight: 500;
      color: #e2e8f0;
    }
    
    .info-grid { 
      display: grid; 
      grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'}; 
      gap: ${isMobile ? '16px' : '20px'}; 
      margin-bottom: ${isMobile ? '20px' : '25px'}; 
    }
    
    .info-box { 
      border: 2px solid rgba(148, 163, 184, 0.2); 
      padding: ${isMobile ? '16px' : '20px'}; 
      border-radius: ${isMobile ? '12px' : '16px'}; 
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
    
    .info-box:hover {
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .info-box h3 { 
      font-size: ${isMobile ? '14px' : '16px'}; 
      color: #e2e8f0; 
      margin-bottom: ${isMobile ? '12px' : '16px'}; 
      font-weight: 700; 
      border-bottom: 1px solid rgba(148, 163, 184, 0.3); 
      padding-bottom: ${isMobile ? '6px' : '8px'};
    }
    
    .info-row { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: ${isMobile ? '6px' : '8px'}; 
      padding: ${isMobile ? '4px 0' : '6px 0'}; 
      align-items: center;
      ${isMobile ? 'flex-wrap: wrap; gap: 4px;' : ''}
    }
    
    .info-label { 
      font-weight: 600; 
      color: #9ca3af; 
      min-width: ${isMobile ? '80px' : '120px'};
      font-size: ${isMobile ? '12px' : '14px'};
    }
    
    .info-value { 
      color: #ffffff; 
      font-weight: 500; 
      flex: 1; 
      text-align: right;
      font-size: ${isMobile ? '12px' : '14px'};
      word-break: break-word;
    }
    
    /* ✅ BOUTONS RESPONSIVE ULTRA-OPTIMISÉS */
    .ast-button { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: ${isMobile ? '6px' : '8px'}; 
      padding: ${isMobile ? '12px 16px' : '16px 24px'}; 
      border: none; 
      border-radius: ${isMobile ? '8px' : '12px'}; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      font-size: ${isMobile ? '14px' : '16px'}; 
      min-height: ${isMobile ? '44px' : '52px'};
      position: relative;
      overflow: hidden;
    }
    
    .ast-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .ast-button:hover::before {
      left: 100%;
    }
    
    .ast-button:active {
      transform: scale(0.98);
    }
    
    .button-primary { 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .button-primary:hover { 
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    
    .button-success { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .button-success:hover { 
      background: linear-gradient(135deg, #059669 0%, #047857 100%); 
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }
    
    .button-warning { 
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    
    .button-warning:hover { 
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%); 
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
    }
    
    .button-danger { 
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    
    .button-danger:hover { 
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    }
    
    .button-secondary { 
      background: rgba(100, 116, 139, 0.3); 
      color: #e2e8f0; 
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    
    .button-secondary:hover { 
      background: rgba(100, 116, 139, 0.5); 
      border-color: rgba(148, 163, 184, 0.5);
      transform: translateY(-1px);
    }
    
    .button-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      pointer-events: none;
    }
    
    .buttons-grid { 
      display: grid; 
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'}; 
      gap: ${isMobile ? '8px' : '12px'}; 
      margin-top: ${isMobile ? '16px' : '20px'}; 
    }
    
    /* ✅ FORMULAIRES RESPONSIVE */
    .form-input { 
      width: 100%; 
      padding: ${isMobile ? '14px 16px' : '16px 20px'}; 
      border: 2px solid rgba(148, 163, 184, 0.2); 
      border-radius: ${isMobile ? '8px' : '12px'}; 
      font-size: ${isMobile ? '16px' : '18px'}; 
      transition: all 0.3s ease; 
      background: rgba(30, 41, 59, 0.6) !important; 
      color: #ffffff !important; 
      backdrop-filter: blur(5px);
      box-sizing: border-box;
    }
    
    .form-input:focus { 
      outline: none; 
      border-color: #3b82f6; 
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      background: rgba(30, 41, 59, 0.8) !important;
    }
    
    .form-input::placeholder { 
      color: #9ca3af !important; 
    }
    
    .form-textarea {
      min-height: ${isMobile ? '100px' : '120px'};
      resize: vertical;
      font-family: inherit;
      line-height: 1.5;
    }
    
    .checkbox-field { 
      display: flex; 
      align-items: center; 
      gap: ${isMobile ? '10px' : '12px'}; 
      padding: ${isMobile ? '12px' : '16px'}; 
      border: 2px solid rgba(148, 163, 184, 0.2); 
      border-radius: ${isMobile ? '8px' : '12px'}; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      background: rgba(30, 41, 59, 0.6) !important; 
      backdrop-filter: blur(5px);
      margin-bottom: ${isMobile ? '8px' : '12px'};
    }
    
    .checkbox-field:hover { 
      border-color: #3b82f6; 
      background: rgba(59, 130, 246, 0.1) !important; 
      transform: translateY(-1px);
    }
    
    .checkbox-field.checked { 
      border-color: #10b981; 
      background: rgba(16, 185, 129, 0.1) !important; 
    }
    
    .checkbox-field input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #3b82f6;
      cursor: pointer;
    }
    
    .checkbox-field span { 
      color: #e2e8f0 !important; 
      font-weight: 500 !important;
      font-size: ${isMobile ? '14px' : '16px'};
      flex: 1;
    }
    
    /* ✅ VALIDATION ET STATUTS AMÉLIORÉS */
    .validation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${isMobile ? '12px' : '16px'};
      border-radius: ${isMobile ? '8px' : '12px'};
      margin-bottom: ${isMobile ? '8px' : '12px'};
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .validation-complete {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }
    
    .validation-incomplete {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
    }
    
    .validation-error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }
    
    .status-badge {
      padding: ${isMobile ? '4px 8px' : '6px 12px'};
      border-radius: ${isMobile ? '6px' : '8px'};
      font-size: ${isMobile ? '10px' : '12px'};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    
    .status-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }
    
    .status-error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    
    /* ✅ MODALES RESPONSIVE PARFAITES */
    .modal-overlay { 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(0, 0, 0, 0.8); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
      backdrop-filter: blur(8px);
      padding: ${isMobile ? '16px' : '24px'};
    }
    
    .modal-content { 
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%); 
      border: 1px solid rgba(148, 163, 184, 0.2); 
      border-radius: ${isMobile ? '12px' : '16px'}; 
      padding: ${isMobile ? '20px' : '28px'}; 
      max-width: ${isMobile ? '100%' : '500px'}; 
      width: 100%; 
      max-height: calc(100vh - ${isMobile ? '32px' : '48px'}); 
      overflow-y: auto; 
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); 
      color: #ffffff !important;
      backdrop-filter: blur(20px);
    }
    
    /* ✅ ANIMATIONS AVANCÉES */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(1deg); }
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
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
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    .pulsing {
      animation: pulse 2s ease-in-out infinite;
    }
    
    .floating {
      animation: float 6s ease-in-out infinite;
    }
    
    /* ✅ BREAKPOINTS RESPONSIFS SPÉCIFIQUES */
    @media (max-width: 480px) {
      .ast-header { padding: 16px 12px; }
      .ast-title { font-size: 18px; }
      .ast-subtitle { font-size: 12px; }
      .tabs-container { padding: 3px; }
      .tab-button { padding: 12px 8px; font-size: 12px; min-height: 44px; }
      .ast-section { padding: 12px; }
      .section-title { font-size: 14px; margin-bottom: 12px; }
      .stats-grid { grid-template-columns: 1fr; gap: 6px; }
      .stat-card { padding: 10px; }
      .stat-number { font-size: 16px; }
      .stat-label { font-size: 9px; }
      .buttons-grid { gap: 6px; }
      .ast-button { padding: 10px 12px; font-size: 12px; min-height: 40px; }
      .info-grid { grid-template-columns: 1fr; }
      .form-input { padding: 12px 14px; font-size: 14px; }
      .checkbox-field { padding: 10px; }
    }
    
    @media (max-width: 380px) {
      .ast-header { padding: 12px 8px; }
      .ast-title { font-size: 16px; }
      .ast-subtitle { font-size: 11px; }
      .ast-logo { width: 48px; height: 48px; }
      .tab-button { padding: 10px 6px; font-size: 11px; min-height: 40px; }
      .ast-section { padding: 10px; }
      .section-title { font-size: 13px; }
      .ast-button { padding: 8px 10px; font-size: 11px; min-height: 36px; }
    }
    
    @media (min-width: 1200px) {
      .ast-header { padding: 40px 32px; }
      .ast-title { font-size: 36px; }
      .ast-subtitle { font-size: 20px; }
      .ast-section { padding: 28px; }
      .section-title { font-size: 22px; }
      .stats-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
      .info-grid { gap: 24px; }
      .ast-button { padding: 18px 28px; font-size: 18px; min-height: 56px; }
    }
    
    @media (min-width: 1440px) {
      .ast-header { padding: 48px 40px; }
      .ast-title { font-size: 40px; }
      .ast-subtitle { font-size: 22px; }
      .stats-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    }
    
    /* ✅ MODES SPÉCIAUX */
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    @media (prefers-contrast: high) {
      .ast-section { border-width: 3px; }
      .tab-button { border: 2px solid transparent; }
      .tab-button.active { border-color: #ffffff; }
      .ast-button { border: 2px solid rgba(255, 255, 255, 0.3); }
    }
    
    /* ✅ PRINT STYLES OPTIMISÉS */
    @media print {
      .step6-container { background: white !important; color: black !important; }
      .ast-header { background: white !important; border: 2px solid #000 !important; }
      .ast-title, .ast-subtitle { color: #000 !important; }
      .tabs-container { display: none !important; }
      .ast-button { display: none !important; }
      .modal-overlay { display: none !important; }
      .ast-section { border: 1px solid #ccc !important; }
      .section-title { color: #000 !important; }
      .info-value, .stat-number { color: #000 !important; }
      
      /* Page breaks optimisés */
      .ast-section { page-break-inside: avoid; }
      .stats-grid { page-break-inside: avoid; }
      .info-grid { page-break-inside: avoid; }
    }
    
    /* ✅ DARK MODE FORCÉ */
    [data-theme="dark"], .dark {
      --bg-primary: rgba(15, 23, 42, 0.95);
      --bg-secondary: rgba(30, 41, 59, 0.8);
      --text-primary: #ffffff;
      --text-secondary: #e2e8f0;
      --border-color: rgba(148, 163, 184, 0.2);
    }
    
    /* ✅ LOADING SKELETON ANIMATIONS */
    .skeleton {
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    .skeleton-text {
      height: 1em;
      margin-bottom: 0.5em;
      border-radius: 4px;
    }
    
    .skeleton-button {
      height: 2.5em;
      border-radius: 8px;
    }
    
    /* ✅ FOCUS STATES ACCESSIBILITÉ */
    .ast-button:focus,
    .tab-button:focus,
    .form-input:focus,
    .checkbox-field:focus {
      outline: 3px solid rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
    }
    
    /* ✅ HOVER EFFECTS AMÉLIORÉS */
    .ast-section:hover {
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
    }
    
    .validation-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    /* ✅ SCROLLBAR CUSTOMISÉ */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(30, 41, 59, 0.3);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.5);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(59, 130, 246, 0.7);
    }
  `;
  // =================== RENDU VUE DATABASE/HISTORIQUE ===================
  if (currentView === 'database') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
        <div className="step6-container">
          {/* Header de retour avec navigation */}
          <div className="ast-section">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '20px', 
              flexWrap: 'wrap', 
              gap: '12px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setCurrentView('main')}
                  className="ast-button button-secondary"
                  style={{ width: 'auto', minWidth: isMobile ? '100px' : '120px' }}
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </button>
                <div>
                  <h2 className="section-title" style={{ margin: 0, marginBottom: '4px' }}>
                    <Database size={24} />
                    {t.database}
                  </h2>
                  <p style={{ 
                    color: '#d1d5db', 
                    fontSize: isMobile ? '12px' : '14px', 
                    margin: 0 
                  }}>
                    {tenant} - {language === 'fr' ? 'Base de données AST complètes' : 'Complete JSA Database'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Barre de recherche optimisée */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: isMobile ? '44px' : '48px' }}
              />
              <Search 
                size={isMobile ? 18 : 20} 
                style={{ 
                  position: 'absolute', 
                  left: isMobile ? '12px' : '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#9ca3af' 
                }} 
              />
              {isSearching && (
                <div style={{ 
                  position: 'absolute', 
                  right: isMobile ? '12px' : '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }}>
                  <div className="spinning" style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #3b82f6', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%' 
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Résultats de recherche avec états */}
          <div className="ast-section">
            {isSearching ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '30px' : '40px', 
                color: '#9ca3af' 
              }}>
                <div className="spinning" style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: '3px solid #3b82f6', 
                  borderTop: '3px solid transparent', 
                  borderRadius: '50%', 
                  margin: '0 auto 16px' 
                }} />
                <p>{t.searching}</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div style={{ display: 'grid', gap: isMobile ? '10px' : '12px' }}>
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="ast-section"
                    style={{
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #4b5563'
                    }}
                    onClick={() => {
                      console.log('🔄 Step6 AST - Chargement AST:', result.astNumber);
                      setCurrentView('main');
                      showNotificationToast(`AST ${result.astNumber} chargée`, 'success');
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start', 
                      marginBottom: '12px', 
                      flexWrap: 'wrap', 
                      gap: '8px' 
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          color: '#3b82f6', 
                          margin: '0 0 6px 0', 
                          fontSize: isMobile ? '14px' : '16px', 
                          fontWeight: '700' 
                        }}>
                          🛡️ {result.astNumber}
                        </h4>
                        <p style={{ 
                          color: 'white', 
                          margin: '0 0 4px 0', 
                          fontSize: isMobile ? '12px' : '14px' 
                        }}>
                          📋 {result.projectNumber} • 📍 {result.workLocation}
                        </p>
                        <p style={{ 
                          color: '#9ca3af', 
                          margin: '0 0 6px 0', 
                          fontSize: isMobile ? '11px' : '13px' 
                        }}>
                          🏢 {result.client} • {t.industries[result.industry as keyof typeof t.industries] || result.industry}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          gap: isMobile ? '8px' : '12px', 
                          flexWrap: 'wrap', 
                          fontSize: isMobile ? '10px' : '12px', 
                          color: '#6b7280' 
                        }}>
                          <span>⚠️ {result.hazardCount} {language === 'fr' ? 'dangers' : 'hazards'}</span>
                          <span>🛡️ {result.equipmentCount} {language === 'fr' ? 'équipements' : 'equipment'}</span>
                          <span>📄 {result.permitCount} {language === 'fr' ? 'permis' : 'permits'}</span>
                          <span>👥 {result.workerCount} {language === 'fr' ? 'travailleurs' : 'workers'}</span>
                          <span>📷 {result.photoCount} photos</span>
                          <span>🕒 {new Date(result.lastModified || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end', 
                        gap: '8px' 
                      }}>
                        <span className={`status-badge ${
                          result.status === 'completed' ? 'status-success' : 
                          result.status === 'active' ? 'status-warning' : 'status-error'
                        }`}>
                          {(() => {
                            const statusTranslations = {
                              draft: language === 'fr' ? 'Brouillon' : 'Draft',
                              active: language === 'fr' ? 'Actif' : 'Active',
                              completed: language === 'fr' ? 'Complété' : 'Completed',
                              locked: language === 'fr' ? 'Verrouillé' : 'Locked',
                              archived: language === 'fr' ? 'Archivé' : 'Archived'
                            };
                            return statusTranslations[result.status as keyof typeof statusTranslations] || result.status;
                          })()}
                        </span>
                        <span style={{ 
                          fontSize: isMobile ? '10px' : '12px', 
                          color: '#9ca3af' 
                        }}>
                          {result.completionPercentage}% {t.complete}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '30px' : '40px', 
                color: '#9ca3af' 
              }}>
                <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>{t.noResults}</p>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '30px' : '40px', 
                color: '#9ca3af' 
              }}>
                <p>💡 {language === 'fr' ? 'Tapez au moins 2 caractères pour rechercher' : 'Type at least 2 characters to search'}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // =================== RENDU PRINCIPAL AST COMPLET ===================
  const validation = getASTValidation;
  const stats = getASTStatistics();
  const sections = getSectionValidation();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
      
      <div className="step6-container">
        {/* Header Principal avec Logo Officiel C-Secur360 */}
        <div className="ast-header">
          <div className="ast-header-content">
            <div className="ast-logo">
              <img 
                src="/c-secur360-logo.png" 
                alt="C-Secur360"
                style={{ 
                  width: isMobile ? '48px' : '64px', 
                  height: isMobile ? '48px' : '64px', 
                  objectFit: 'contain',
                  filter: 'brightness(1.2) contrast(1.1)'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div style={{ 
                display: 'none',
                color: '#f59e0b', 
                fontSize: isMobile ? '20px' : '28px', 
                fontWeight: 'bold',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                C🛡️
              </div>
            </div>
            <h1 className="ast-title">{t.title}</h1>
            <p className="ast-subtitle">{t.subtitle}</p>
            
            {/* Indicateur de complétion dynamique */}
            <div style={{ 
              marginTop: isMobile ? '16px' : '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: isMobile ? '12px' : '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                fontSize: isMobile ? '20px' : '28px',
                fontWeight: '800',
                color: validation.isValid ? '#10b981' : '#f59e0b',
              }}>
                {validation.percentage}%
              </div>
              <span className={`status-badge ${validation.isValid ? 'status-success' : 'status-warning'}`}>
                {validation.isValid ? t.valid : t.incomplete}
              </span>
              <div style={{ 
                fontSize: isMobile ? '11px' : '13px', 
                color: '#d1d5db',
                textAlign: 'center'
              }}>
                AST #{stats.astNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation onglets responsive */}
        <div className="tabs-container">
          {[
            { id: 'validation', label: t.tabs.validation, icon: CheckCircle },
            { id: 'actions', label: t.tabs.actions, icon: Zap },
            { id: 'sharing', label: t.tabs.sharing, icon: Share2 },
            { id: 'reports', label: t.tabs.reports, icon: BarChart3 }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={isMobile ? 16 : 18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ONGLET 1: VALIDATION GLOBALE */}
        {activeTab === 'validation' && (
          <div>
            {/* Statistiques générales complètes */}
            <div className="ast-section">
              <h2 className="section-title">
                <BarChart3 size={24} />
                {t.statistics}
              </h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.completedSections}/{stats.totalSections}</div>
                  <div className="stat-label">{t.sectionsComplete}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.identifiedHazards}</div>
                  <div className="stat-label">{t.identifiedHazards}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.selectedEquipment}</div>
                  <div className="stat-label">{t.selectedEquipment}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.requiredPermits}</div>
                  <div className="stat-label">{t.requiredPermits}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.teamMembers}</div>
                  <div className="stat-label">{t.teamMembers}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.photosCount}</div>
                  <div className="stat-label">{t.documentsPhotos}</div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-box">
                  <h3>🏢 {language === 'fr' ? 'Informations Projet' : 'Project Information'}</h3>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'N° AST:' : 'JSA #:'}</span>
                    <span className="info-value">{stats.astNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Client:' : 'Client:'}</span>
                    <span className="info-value">{stats.client}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Projet:' : 'Project:'}</span>
                    <span className="info-value">{stats.projectNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Lieu:' : 'Location:'}</span>
                    <span className="info-value">{stats.workLocation}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Industrie:' : 'Industry:'}</span>
                    <span className="info-value">{t.industries[stats.industry as keyof typeof t.industries] || stats.industry}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Travailleurs:' : 'Workers:'}</span>
                    <span className="info-value">{stats.workerCount}</span>
                  </div>
                </div>
                
                <div className="info-box">
                  <h3>⏱️ {language === 'fr' ? 'Suivi Temporel' : 'Time Tracking'}</h3>
                  <div className="info-row">
                    <span className="info-label">{t.creationDate}:</span>
                    <span className="info-value">{new Date(stats.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t.lastActivity}:</span>
                    <span className="info-value">{new Date(stats.lastModified).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Dernière sauvegarde:' : 'Last saved:'}</span>
                    <span className="info-value" style={{ fontSize: isMobile ? '10px' : '12px' }}>
                      {stats.lastSaved !== 'Jamais' && stats.lastSaved !== 'Never' ? 
                        new Date(stats.lastSaved).toLocaleString() : stats.lastSaved}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Statut:' : 'Status:'}</span>
                    <span className={`status-badge ${stats.isLocked ? 'status-error' : 'status-warning'}`}>
                      {stats.isLocked ? t.locked : (language === 'fr' ? '🔓 EN COURS' : '🔓 IN PROGRESS')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'QR Code:' : 'QR Code:'}</span>
                    <span className="info-value">
                      {stats.hasQRCode ? '✅' : '❌'} {stats.hasQRCode ? 
                        (language === 'fr' ? 'Généré' : 'Generated') : 
                        (language === 'fr' ? 'Non généré' : 'Not generated')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{language === 'fr' ? 'Lien partage:' : 'Share link:'}</span>
                    <span className="info-value">
                      {stats.hasShareableLink ? '✅' : '❌'} {stats.hasShareableLink ? 
                        (language === 'fr' ? 'Disponible' : 'Available') : 
                        (language === 'fr' ? 'Non disponible' : 'Not available')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation des sections par step avec détails */}
            <div className="ast-section">
              <h2 className="section-title">
                <CheckCircle size={24} />
                {t.validationSummary}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
                {sections.map((section, index) => (
                  <div 
                    key={index}
                    className={`validation-item ${section.isComplete ? 'validation-complete' : 'validation-incomplete'}`}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: isMobile ? '10px' : '12px', 
                      flex: 1 
                    }}>
                      {section.icon}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          color: section.isComplete ? '#86efac' : '#fde047', 
                          margin: 0, 
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '700'
                        }}>
                          {section.sectionName}
                        </h4>
                        {section.errors.length > 0 && (
                          <p style={{ 
                            color: '#fca5a5', 
                            margin: '4px 0 0 0', 
                            fontSize: isMobile ? '12px' : '14px' 
                          }}>
                            {section.errors[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: isMobile ? '16px' : '20px',
                        fontWeight: '800',
                        color: section.isComplete ? '#10b981' : '#f59e0b'
                      }}>
                        {section.completionPercentage}%
                      </div>
                      <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#9ca3af' }}>
                        Step {section.stepNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Affichage des erreurs de validation */}
              {validation.errors.length > 0 && (
                <div style={{
                  marginTop: isMobile ? '16px' : '20px',
                  padding: isMobile ? '12px' : '16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: isMobile ? '8px' : '12px'
                }}>
                  <h4 style={{ 
                    color: '#fca5a5', 
                    margin: '0 0 8px 0', 
                    fontSize: isMobile ? '14px' : '16px' 
                  }}>
                    ⚠️ {t.validationErrors}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#fecaca' }}>
                    {validation.errors.map((error, index) => (
                      <li key={index} style={{ 
                        marginBottom: '4px', 
                        fontSize: isMobile ? '12px' : '14px' 
                      }}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Message de validation réussie */}
              {validation.isValid && (
                <div style={{
                  marginTop: isMobile ? '16px' : '20px',
                  padding: isMobile ? '12px' : '16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: isMobile ? '8px' : '12px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ 
                    color: '#86efac', 
                    margin: '0 0 8px 0', 
                    fontSize: isMobile ? '14px' : '16px' 
                  }}>
                    ✅ {t.allValidationsPassed}
                  </h4>
                  <p style={{ 
                    color: '#bbf7d0', 
                    margin: 0, 
                    fontSize: isMobile ? '12px' : '14px' 
                  }}>
                    {language === 'fr' ? 
                      'Votre AST est prête pour la finalisation et le partage.' : 
                      'Your JSA is ready for finalization and sharing.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET 2: ACTIONS FINALES */}
        {activeTab === 'actions' && (
          <div>
            {/* Actions principales comme PermitManager */}
            <div className="ast-section">
              <h2 className="section-title">
                <Zap size={24} />
                {t.tabs.actions}
              </h2>

              <div className="buttons-grid">
                <button
                  onClick={handleSaveToSupabase}
                  disabled={isSaving}
                  className={`ast-button button-success ${isSaving ? 'button-disabled' : ''}`}
                >
                  {isSaving ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <Save size={20} />
                  )}
                  {isSaving ? t.saving : t.saveAST}
                </button>

                <button
                  onClick={handleGenerateQR}
                  disabled={isGeneratingQR}
                  className={`ast-button button-primary ${isGeneratingQR ? 'button-disabled' : ''}`}
                >
                  {isGeneratingQR ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <QrCode size={20} />
                  )}
                  {t.generateQR}
                </button>

                <button
                  onClick={() => handleGeneratePDF('standard')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-warning ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <Printer size={20} />
                  )}
                  {t.printPDF}
                </button>

                <button
                  onClick={() => setCurrentView('database')}
                  className="ast-button button-secondary"
                >
                  <Database size={20} />
                  {t.searchDatabase}
                </button>

                <button
                  onClick={handleCopyLink}
                  className={`ast-button ${copySuccess ? 'button-success' : 'button-secondary'}`}
                >
                  {copySuccess ? <Check size={20} /> : <Copy size={20} />}
                  {copySuccess ? (language === 'fr' ? 'Copié!' : 'Copied!') : t.copy}
                </button>

                <button
                  onClick={() => setShowLockConfirm(true)}
                  disabled={finalizationData.isLocked}
                  className={`ast-button ${finalizationData.isLocked ? 'button-disabled' : 'button-danger'}`}
                >
                  {finalizationData.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                  {finalizationData.isLocked ? t.locked : t.lockAST}
                </button>
              </div>
            </div>

            {/* Commentaires finaux avec verrouillage */}
            <div className="ast-section">
              <h2 className="section-title">
                <MessageSquare size={24} />
                {t.finalComments}
              </h2>
              
              <textarea
                value={finalizationData.finalComments}
                onChange={(e) => updateComments(e.target.value)}
                placeholder={t.commentsPlaceholder}
                className="form-input form-textarea"
                disabled={finalizationData.isLocked}
              />
              
              {finalizationData.isLocked && (
                <p style={{
                  marginTop: '8px',
                  color: '#ef4444',
                  fontSize: isMobile ? '12px' : '14px',
                  fontStyle: 'italic'
                }}>
                  {t.documentLocked}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ONGLET 3: PARTAGE MULTI-CANAUX */}
        {activeTab === 'sharing' && (
          <div>
            <div className="ast-section">
              <h2 className="section-title">
                <Share2 size={24} />
                {t.sharing}
              </h2>
              
              {/* Méthodes de partage sélectionnables */}
              <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
                <h3 style={{ 
                  color: '#d1d5db', 
                  fontSize: isMobile ? '14px' : '16px', 
                  marginBottom: isMobile ? '12px' : '16px' 
                }}>
                  {language === 'fr' ? 'Méthodes de partage:' : 'Sharing methods:'}
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? '8px' : '12px', 
                  marginBottom: isMobile ? '16px' : '20px', 
                  flexWrap: 'wrap' 
                }}>
                  {(['email', 'sms', 'whatsapp', 'teams', 'slack'] as ShareMethod[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedShareMethod(method)}
                      className={`ast-button ${selectedShareMethod === method ? 'button-primary' : 'button-secondary'}`}
                      style={{ flex: isMobile ? '1' : 'none', minWidth: isMobile ? '0' : '120px' }}
                    >
                      {method === 'email' && <Mail size={16} />}
                      {method === 'sms' && <Smartphone size={16} />}
                      {method === 'whatsapp' && <MessageSquare size={16} />}
                      {method === 'teams' && <Users size={16} />}
                      {method === 'slack' && <Hash size={16} />}
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleShare}
                  className="ast-button button-success"
                  style={{ width: '100%' }}
                >
                  <Share size={20} />
                  {language === 'fr' ? 'Partager via' : 'Share via'} {selectedShareMethod.charAt(0).toUpperCase() + selectedShareMethod.slice(1)}
                </button>
              </div>

              {/* Instructions de partage détaillées */}
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: isMobile ? '8px' : '12px', 
                padding: isMobile ? '12px' : '16px'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: '#60a5fa',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '700'
                }}>
                  {t.shareInstructions}
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#94a3b8',
                  fontSize: isMobile ? '11px' : '13px'
                }}>
                  {t.shareList.map((item, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* QR Code pour accès mobile */}
            {finalizationData.qrCodeUrl && (
              <div className="ast-section">
                <h2 className="section-title">
                  <QrCode size={24} />
                  {language === 'fr' ? '📱 Code QR - Accès Mobile AST' : '📱 QR Code - Mobile JSA Access'}
                </h2>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: isMobile ? '15px' : '20px',
                    backgroundColor: 'white',
                    borderRadius: isMobile ? '12px' : '16px',
                    marginBottom: isMobile ? '12px' : '16px',
                    border: '3px solid #f59e0b',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                  }}>
                    <img 
                      src={finalizationData.qrCodeUrl} 
                      alt="QR Code AST" 
                      style={{ 
                        width: isMobile ? '180px' : '220px', 
                        height: isMobile ? '180px' : '220px',
                        display: 'block'
                      }} 
                    />
                  </div>
                  <p style={{ 
                    color: '#d1d5db', 
                    fontSize: isMobile ? '12px' : '14px', 
                    lineHeight: 1.5 
                  }}>
                    {language === 'fr' ? 
                      '📱 Scannez ce code QR pour accéder à l\'AST depuis un appareil mobile' :
                      '📱 Scan this QR code to access the JSA from a mobile device'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 4: RAPPORTS PROFESSIONNELS */}
        {activeTab === 'reports' && (
          <div>
            <div className="ast-section">
              <h2 className="section-title">
                <BarChart3 size={24} />
                {t.reportOptions}
              </h2>
              
              {/* Options de génération détaillées */}
              <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
                <h3 style={{ 
                  color: '#d1d5db', 
                  fontSize: isMobile ? '14px' : '16px', 
                  marginBottom: isMobile ? '12px' : '16px' 
                }}>
                  {language === 'fr' ? 'Options d\'inclusion:' : 'Inclusion options:'}
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: isMobile ? '8px' : '12px'
                }}>
                  {Object.entries({
                    includePhotos: t.includePhotos,
                    includeSignatures: t.includeSignatures,
                    includeQRCode: t.includeQRCode,
                    includeBranding: t.includeBranding,
                    includeTimestamps: t.includeTimestamps,
                    includeComments: t.includeComments,
                    includeStatistics: t.includeStatistics,
                    includeValidation: t.includeValidation,
                    includePermits: t.includePermits,
                    includeHazards: t.includeHazards,
                    includeEquipment: t.includeEquipment
                  }).map(([key, label]) => (
                    <div 
                      key={key}
                      className={`checkbox-field ${
                        finalizationData.documentGeneration[key as keyof typeof finalizationData.documentGeneration] ? 'checked' : ''
                      }`}
                      onClick={() => toggleDocumentOption(key as keyof DocumentGeneration)}
                    >
                      <input
                        type="checkbox"
                        checked={finalizationData.documentGeneration[key as keyof typeof finalizationData.documentGeneration] as boolean}
                        onChange={() => toggleDocumentOption(key as keyof DocumentGeneration)}
                        style={{ pointerEvents: 'none' }}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons génération rapports professionnels */}
              <div className="buttons-grid">
                <button
                  onClick={() => handleGeneratePDF('standard')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-primary ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <FileText size={20} />
                  )}
                  {language === 'fr' ? 'Rapport Standard' : 'Standard Report'}
                </button>

                <button
                  onClick={() => handleGeneratePDF('executive')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-warning ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <Award size={20} />
                  )}
                  {language === 'fr' ? 'Résumé Exécutif' : 'Executive Summary'}
                </button>

                <button
                  onClick={() => handleGeneratePDF('technical')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-success ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  {isGeneratingPDF ? (
                    <div className="spinning" style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderTop: '2px solid white', 
                      borderRadius: '50%' 
                    }} />
                  ) : (
                    <Cog size={20} />
                  )}
                  {language === 'fr' ? 'Rapport Technique' : 'Technical Report'}
                </button>

                <button
                  onClick={() => handleGeneratePDF('compact')}
                  disabled={isGeneratingPDF}
                  className={`ast-button button-secondary ${isGeneratingPDF ? 'button-disabled' : ''}`}
                >
                  <Smartphone size={20} />
                  {language === 'fr' ? 'Version Compacte' : 'Compact Version'}
                </button>
              </div>

              {/* Aperçu format avec statistiques temps réel */}
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

        {/* Notification Toast système */}
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
      </div>
    </>
  );
};

// =================== EXPORT FINAL ===================
export default Step6Finalization;
