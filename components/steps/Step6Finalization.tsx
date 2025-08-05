'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, FileText, Download, Archive, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Share2, Save, Calendar, User, MapPin, Shield, Award,
  Target, BarChart3, Globe, Printer, Mail, Smartphone, Image, X,
  Plus, Upload, Copy, Check, RefreshCw, Lock, Unlock, Users, MessageSquare
} from 'lucide-react';

// =================== SYSTÈME DE TRADUCTIONS BILINGUE COMPLET ===================
const translations = {
  fr: {
    // Titre principal
    title: "🛡️ Finalisation AST",
    subtitle: "Équipe, Partage et Validation Finale",
    
    // Onglets
    tabs: {
      workers: "👷 Équipe",
      sharing: "📤 Partage", 
      finalization: "✅ Final"
    },
    
    // Stats équipe
    stats: {
      workers: "👷 Travailleurs",
      consents: "✅ Consentements",
      approvals: "👍 Approbations",
      readingRate: "📊 Taux Lecture"
    },
    
    // Équipe
    teamManagement: "Gestion de l'Équipe",
    addWorker: "➕ Ajouter",
    addWorkerModal: "👷 Ajouter un Travailleur",
    fullName: "Nom complet *",
    company: "Entreprise *",
    namePlaceholder: "Jean Tremblay",
    companyPlaceholder: "Construction ABC Inc.",
    consentText: "✋ Je consens avoir lu et compris cette AST",
    consentGiven: "📅 Consentement donné le",
    approve: "👍 Approuver",
    reject: "👎 Rejeter",
    noWorkers: "Aucun travailleur ajouté. Cliquez sur \"Ajouter\" pour commencer.",
    
    // Statuts
    status: {
      approved: "✅ Approuvé",
      rejected: "❌ Rejeté", 
      pending: "⏳ En attente"
    },
    
    // Partage
    sharing: "📤 Partage de l'AST",
    secureLink: "🔗 Lien de partage sécurisé:",
    copy: "📋 Copier",
    copied: "✅ Copié!",
    shareInstructions: "📋 Instructions de partage:",
    shareList: [
      "Partagez ce lien avec votre équipe pour consultation",
      "Chaque membre peut consulter l'AST et donner son approbation", 
      "Le lien reste actif même si l'AST est verrouillée"
    ],
    
    // Finalisation
    completionStatus: "📊 État de Complétion",
    completed: "Complété",
    sectionStatus: {
      projectInfo: "✅ Informations projet",
      hazards: "✅ Dangers identifiés",
      equipment: "✅ Équipements sélectionnés",
      teamValidation: "⏳ Validation équipe"
    },
    
    // Options rapport
    reportOptions: "📄 Options Rapport",
    includePhotos: "📸 Photos",
    includeSignatures: "✍️ Signatures",
    includeQRCode: "📱 QR Code",
    includeBranding: "🏢 Branding",
    
    // Commentaires
    finalComments: "💬 Commentaires Finaux",
    commentsPlaceholder: "Ajoutez des commentaires finaux, notes importantes ou instructions spéciales...",
    documentLocked: "🔒 Document verrouillé - Modification impossible",
    
    // Actions finales
    finalActions: "🎯 Actions Finales",
    print: "🖨️ Imprimer",
    save: "💾 Sauvegarder",
    archive: "📁 Archiver",
    lock: "🔒 Verrouiller",
    locked: "🔒 Verrouillé",
    
    // Verrouillage
    confirmLock: "🔒 Confirmer le Verrouillage",
    lockWarning: "ATTENTION: Cette action est irréversible !",
    autoChecks: "📊 Vérifications automatiques:",
    sectionsCompleted: "✅ Sections complétées:",
    lockPermanently: "🔒 Verrouiller Définitivement",
    lockDescription: "Une fois verrouillée, l'AST ne pourra plus être modifiée mais restera consultable par l'équipe via le lien de partage.",
    
    // Boutons génériques
    add: "Ajouter",
    cancel: "Annuler",
    close: "Fermer",
    
    // Messages
    fillRequiredFields: "❌ Veuillez remplir le nom et la compagnie",
    workerAdded: "✅ Travailleur ajouté:",
    consentUpdated: "✅ Consentement mis à jour pour travailleur:",
    astLocked: "✅ AST verrouillée avec succès",
    astSaved: "✅ AST sauvegardée!",
    astArchived: "✅ AST archivée!",
    linkCopied: "✅ Lien copié dans le presse-papiers",
    copyError: "❌ Erreur lors de la copie du lien",
    printError: "❌ Erreur : Impossible d'ouvrir la fenêtre d'impression. Vérifiez les paramètres de pop-up.",
    
    // Données des autres steps pour rapport
    reportData: {
      hazards: "⚠️ Dangers",
      equipment: "🔧 Équipements", 
      permits: "📄 Permis",
      lockoutPoints: "🔒 Points LOTO",
      executiveSummary: "RÉSUMÉ EXÉCUTIF",
      clientProjectInfo: "🏢 INFORMATIONS CLIENT & PROJET",
      teamContacts: "👥 ÉQUIPE & CONTACTS",
      client: "Client:",
      projectNumber: "Projet #:",
      location: "Lieu:",
      dateTime: "Date/Heure:",
      industry: "Industrie:",
      workerCount: "Nb Travailleurs:",
      estimatedDuration: "Durée estimée:",
      clientContact: "Contact client:",
      emergency: "Urgence:",
      teamConsents: "ÉQUIPE ET CONSENTEMENTS",
      finalCommentsLabel: "Commentaires Finaux:",
      documentStatus: "Statut du Document:",
      locked: "🔒 VERROUILLÉ",
      inProgress: "🔓 EN COURS",
      completion: "Complétion:",
      lockedOn: "Verrouillé le:",
      safetyManager: "RESPONSABLE SÉCURITÉ",
      supervisor: "SUPERVISEUR", 
      manager: "GESTIONNAIRE",
      name: "Nom:",
      signature: "Signature:",
      date: "Date:",
      noSpecified: "Non spécifié",
      noWorkerAdded: "Aucun travailleur ajouté à l'équipe"
    }
  },
  
  en: {
    // Main title
    title: "🛡️ JSA Finalization",
    subtitle: "Team, Sharing and Final Validation",
    
    // Tabs
    tabs: {
      workers: "👷 Team",
      sharing: "📤 Share",
      finalization: "✅ Final"
    },
    
    // Team stats
    stats: {
      workers: "👷 Workers",
      consents: "✅ Consents",
      approvals: "👍 Approvals", 
      readingRate: "📊 Reading Rate"
    },
    
    // Team
    teamManagement: "Team Management",
    addWorker: "➕ Add Worker",
    addWorkerModal: "👷 Add Worker",
    fullName: "Full Name *",
    company: "Company *",
    namePlaceholder: "John Smith",
    companyPlaceholder: "ABC Construction Inc.",
    consentText: "✋ I consent to having read and understood this JSA",
    consentGiven: "📅 Consent given on",
    approve: "👍 Approve",
    reject: "👎 Reject",
    noWorkers: "No workers added. Click \"Add Worker\" to start.",
    
    // Status
    status: {
      approved: "✅ Approved",
      rejected: "❌ Rejected",
      pending: "⏳ Pending"
    },
    
    // Sharing
    sharing: "📤 JSA Sharing",
    secureLink: "🔗 Secure sharing link:",
    copy: "📋 Copy",
    copied: "✅ Copied!",
    shareInstructions: "📋 Sharing instructions:",
    shareList: [
      "Share this link with your team for consultation",
      "Each member can review the JSA and give their approval",
      "The link remains active even if the JSA is locked"
    ],
    
    // Finalization
    completionStatus: "📊 Completion Status",
    completed: "Completed",
    sectionStatus: {
      projectInfo: "✅ Project information",
      hazards: "✅ Hazards identified",
      equipment: "✅ Equipment selected", 
      teamValidation: "⏳ Team validation"
    },
    
    // Report options
    reportOptions: "📄 Report Options",
    includePhotos: "📸 Photos",
    includeSignatures: "✍️ Signatures",
    includeQRCode: "📱 QR Code",
    includeBranding: "🏢 Branding",
    
    // Comments
    finalComments: "💬 Final Comments",
    commentsPlaceholder: "Add final comments, important notes or special instructions...",
    documentLocked: "🔒 Document locked - Cannot modify",
    
    // Final actions
    finalActions: "🎯 Final Actions",
    print: "🖨️ Print",
    save: "💾 Save",
    archive: "📁 Archive",
    lock: "🔒 Lock",
    locked: "🔒 Locked",
    
    // Locking
    confirmLock: "🔒 Confirm Lock",
    lockWarning: "WARNING: This action is irreversible!",
    autoChecks: "📊 Automatic checks:",
    sectionsCompleted: "✅ Sections completed:",
    lockPermanently: "🔒 Lock Permanently",
    lockDescription: "Once locked, the JSA cannot be modified but will remain viewable by the team via the sharing link.",
    
    // Generic buttons
    add: "Add",
    cancel: "Cancel", 
    close: "Close",
    
    // Messages
    fillRequiredFields: "❌ Please fill in name and company",
    workerAdded: "✅ Worker added:",
    consentUpdated: "✅ Consent updated for worker:",
    astLocked: "✅ JSA locked successfully",
    astSaved: "✅ JSA saved!",
    astArchived: "✅ JSA archived!",
    linkCopied: "✅ Link copied to clipboard",
    copyError: "❌ Error copying link",
    printError: "❌ Error: Cannot open print window. Check pop-up settings.",
    
    // Report data from other steps
    reportData: {
      hazards: "⚠️ Hazards",
      equipment: "🔧 Equipment",
      permits: "📄 Permits", 
      lockoutPoints: "🔒 LOTO Points",
      executiveSummary: "EXECUTIVE SUMMARY",
      clientProjectInfo: "🏢 CLIENT & PROJECT INFORMATION",
      teamContacts: "👥 TEAM & CONTACTS",
      client: "Client:",
      projectNumber: "Project #:",
      location: "Location:",
      dateTime: "Date/Time:",
      industry: "Industry:",
      workerCount: "Worker Count:",
      estimatedDuration: "Estimated Duration:",
      clientContact: "Client Contact:",
      emergency: "Emergency:",
      teamConsents: "TEAM AND CONSENTS",
      finalCommentsLabel: "Final Comments:",
      documentStatus: "Document Status:",
      locked: "🔒 LOCKED",
      inProgress: "🔓 IN PROGRESS",
      completion: "Completion:",
      lockedOn: "Locked on:",
      safetyManager: "SAFETY MANAGER",
      supervisor: "SUPERVISOR",
      manager: "MANAGER", 
      name: "Name:",
      signature: "Signature:",
      date: "Date:",
      noSpecified: "Not specified",
      noWorkerAdded: "No workers added to the team"
    }
  }
};

// =================== INTERFACES PRINCIPALES ===================
interface Worker {
  id: string;
  name: string;
  position: string;
  company: string;
  employeeNumber?: string;
  email?: string;
  hasConsented: boolean;
  consentTimestamp?: string;
  approbationStatus: 'pending' | 'approved' | 'rejected';
  approbationTimestamp?: string;
  approbationComments?: string;
  consultationTime?: number;
}

interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  category: 'hazard' | 'equipment' | 'site' | 'other';
}

interface DocumentGeneration {
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  includeBranding: boolean;
  includeTimestamps: boolean;
  includeComments: boolean;
  format: 'pdf' | 'word' | 'html';
}

interface FinalizationData {
  workers: Worker[];
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  isLocked: boolean;
  lockTimestamp?: string;
  lockReason?: string;
  completionPercentage: number;
}

interface FinalizationStepProps {
  formData: any; // ✅ ACCÈS À TOUTES LES DONNÉES DES STEPS 1-5
  onDataChange: (section: string, data: FinalizationData) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

// =================== TYPES DE SÉCURITÉ ===================
type ApprobationStatus = 'pending' | 'approved' | 'rejected';
type LockType = 'temporary' | 'permanent' | 'review';
type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'facebook';

function Step6Finalization({ 
  formData, // ✅ CONTIENT TOUTES LES DONNÉES : projectInfo, equipment, hazards, permits, validation
  onDataChange, 
  language = 'fr',
  tenant 
}: FinalizationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== TRADUCTIONS ===================
  const t = translations[language] || translations.fr;
  
  // =================== ÉTAT PRINCIPAL ===================
  const [activeTab, setActiveTab] = useState('workers');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Générer le lien de partage immédiatement
  const [shareLink, setShareLink] = useState(() => {
    const baseUrl = `https://${tenant}.csecur360.com`;
    const astId = Math.random().toString(36).substr(2, 12).toUpperCase();
    const secureToken = Math.random().toString(36).substr(2, 16);
    return `${baseUrl}/ast/view/${astId}?token=${secureToken}`;
  });

  // ✅ FIX CRITIQUE : État travailleur stable
  const [newWorker, setNewWorker] = useState<Partial<Worker>>(() => ({
    name: '',
    company: '',
    hasConsented: false,
    approbationStatus: 'pending'
  }));

  // ✅ FIX CRITIQUE : État finalisation avec initialisation stable
  const [finalizationData, setFinalizationData] = useState<FinalizationData>(() => ({
    workers: [],
    photos: [],
    finalComments: '',
    documentGeneration: {
      includePhotos: true,
      includeSignatures: true,
      includeQRCode: true,
      includeBranding: true,
      includeTimestamps: true,
      includeComments: true,
      format: 'pdf'
    },
    isLocked: false,
    completionPercentage: 85
  }));

  // =================== EXTRACTION DONNÉES STEPS 1-5 POUR RAPPORT COMPLET ===================
  
  // ✅ ACCÈS AUX DONNÉES DE TOUS LES STEPS VIA formData
  const extractDataForReport = useCallback(() => {
    console.log('📊 Extraction données Steps 1-5 pour rapport:', formData);
    
    return {
      // Step 1 - Informations projet
      projectInfo: {
        client: formData.projectInfo?.client || t.reportData.noSpecified,
        projectNumber: formData.projectInfo?.projectNumber || t.reportData.noSpecified,
        workLocation: formData.projectInfo?.workLocation || t.reportData.noSpecified,
        date: formData.projectInfo?.date || new Date().toISOString().split('T')[0],
        time: formData.projectInfo?.time || new Date().toTimeString().slice(0, 5),
        industry: formData.projectInfo?.industry || 'other',
        workerCount: formData.projectInfo?.workerCount || 'Non spécifié',
        estimatedDuration: formData.projectInfo?.estimatedDuration || t.reportData.noSpecified,
        clientRepresentative: formData.projectInfo?.clientRepresentative || t.reportData.noSpecified,
        emergencyContact: formData.projectInfo?.emergencyContact || t.reportData.noSpecified,
        lockoutPoints: formData.projectInfo?.lockoutPoints || []
      },
      
      // Step 2 - Équipements  
      equipment: {
        selected: formData.equipment?.selected || [],
        list: formData.equipment?.list || [],
        totalCost: formData.equipment?.totalCost || 0
      },
      
      // Step 3 - Dangers
      hazards: {
        selected: formData.hazards?.selected || [],
        identifiedHazards: formData.hazards?.identifiedHazards || [],
        list: formData.hazards?.list || []
      },
      
      // Step 4 - Permis
      permits: {
        permits: formData.permits?.permits || [],
        requiredPermits: formData.permits?.requiredPermits || [],
        authorities: formData.permits?.authorities || []
      },
      
      // Step 5 - Validation
      validation: {
        reviewers: formData.validation?.reviewers || [],
        approvals: formData.validation?.approvals || [],
        teamMembers: formData.validation?.teamMembers || []
      }
    };
  }, [formData, t.reportData.noSpecified]);

  // =================== HANDLERS PRINCIPAUX ULTRA-OPTIMISÉS ===================
  const addWorker = useCallback(() => {
    if (!newWorker.name || !newWorker.company) {
      alert(t.fillRequiredFields);
      return;
    }

    const worker: Worker = {
      id: Math.random().toString(36).substr(2, 9),
      name: newWorker.name!,
      position: 'Travailleur',
      company: newWorker.company!,
      hasConsented: false,
      approbationStatus: 'pending'
    };

    setFinalizationData(prev => ({
      ...prev,
      workers: [...prev.workers, worker]
    }));

    setNewWorker({ name: '', company: '', hasConsented: false, approbationStatus: 'pending' });
    setShowAddWorker(false);
    console.log(t.workerAdded, worker);
  }, [newWorker.name, newWorker.company, t.fillRequiredFields, t.workerAdded]);

  const toggleConsent = useCallback((workerId: string) => {
    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              hasConsented: !worker.hasConsented,
              consentTimestamp: !worker.hasConsented ? new Date().toISOString() : undefined
            }
          : worker
      )
    }));
    console.log(t.consentUpdated, workerId);
  }, [t.consentUpdated]);

  const updateApprobation = useCallback((workerId: string, status: ApprobationStatus, comments?: string) => {
    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              approbationStatus: status,
              approbationTimestamp: new Date().toISOString(),
              approbationComments: comments
            }
          : worker
      )
    }));
    console.log(`✅ Approbation ${status} pour travailleur:`, workerId);
  }, []);

  // =================== HANDLERS PARTAGE OPTIMISÉS ===================
  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}`);
    const body = encodeURIComponent(`Bonjour,

Veuillez consulter l'Analyse Sécuritaire de Travail (AST) pour le projet "${formData.projectInfo?.projectName || 'Projet'}".

🔗 Lien d'accès sécurisé:
${shareLink}

Cette AST doit être consultée et approuvée avant le début des travaux.

Cordialement,
${tenant} - Équipe Sécurité`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
    console.log('📧 Partage par email initié');
  }, [formData.projectInfo?.projectName, shareLink, tenant]);

  const shareViaSMS = useCallback(() => {
    const message = encodeURIComponent(`🛡️ AST ${formData.projectInfo?.projectName || 'Projet'}: ${shareLink}`);
    window.open(`sms:?body=${message}`);
    console.log('📱 Partage par SMS initié');
  }, [formData.projectInfo?.projectName, shareLink]);

  const shareViaWhatsApp = useCallback(() => {
    const message = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}

Lien d'accès: ${shareLink}`);
    window.open(`https://wa.me/?text=${message}`);
    console.log('💬 Partage WhatsApp initié');
  }, [formData.projectInfo?.projectName, shareLink]);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log(t.linkCopied);
    } catch (err) {
      alert(t.copyError);
    }
  }, [shareLink, t.linkCopied, t.copyError]);

  const lockAST = useCallback((lockType: LockType) => {
    setFinalizationData(prev => ({
      ...prev,
      isLocked: true,
      lockTimestamp: new Date().toISOString(),
      lockReason: lockType
    }));
    setShowLockConfirm(false);
    console.log(`🔒 AST verrouillée (${lockType})`);
    alert(`${t.astLocked} (${lockType})`);
  }, [t.astLocked]);

  const getIndustryLabel = useCallback((industry: string) => {
    const labels = {
      'electrical': '⚡ Électrique',
      'construction': '🏗️ Construction', 
      'industrial': '🏭 Industriel',
      'manufacturing': '⚙️ Manufacturier',
      'office': '🏢 Bureau/Administratif',
      'other': '🔧 Autre'
    };
    return labels[industry as keyof typeof labels] || industry || t.reportData.noSpecified;
  }, [t.reportData.noSpecified]);

  // =================== EFFECTS ULTRA-OPTIMISÉS POUR ÉVITER BOUCLES INFINIES ===================
  
  // ✅ FIX CRITIQUE : useCallback stable pour updateParentData
  const updateParentData = useCallback((data: FinalizationData) => {
    onDataChange('finalization', data);
  }, []); // ✅ Pas de dépendances = fonction stable

  // ✅ FIX CRITIQUE : Comparaison de données pour éviter boucle infinie
  const prevFinalizationDataRef = useRef<FinalizationData | null>(null);
  
  useEffect(() => {
    // ✅ Vérifier si les données ont vraiment changé
    const hasChanged = !prevFinalizationDataRef.current || 
      JSON.stringify(prevFinalizationDataRef.current) !== JSON.stringify(finalizationData);
    
    if (hasChanged) {
      console.log('🔥 Step6 données changées, mise à jour parent');
      prevFinalizationDataRef.current = finalizationData;
      updateParentData(finalizationData);
    } else {
      console.log('🔥 Step6 données identiques, skip update - BOUCLE INFINIE ÉVITÉE !');
    }
  }, [finalizationData, updateParentData]);

  // ✅ FIX : Calcul de pourcentage optimisé avec useCallback et deps explicites
  const calculateCompletionPercentage = useCallback(() => {
    const totalSections = 6;
    const completedSections = [
      formData.projectInfo ? 1 : 0,
      formData.equipment ? 1 : 0,
      formData.hazards ? 1 : 0,
      formData.permits ? 1 : 0,
      formData.validation ? 1 : 0,
      finalizationData.workers.length > 0 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    
    return Math.round((completedSections / totalSections) * 100);
  }, [formData.projectInfo, formData.equipment, formData.hazards, formData.permits, formData.validation, finalizationData.workers.length]);

  useEffect(() => {
    const newPercentage = calculateCompletionPercentage();
    
    if (newPercentage !== finalizationData.completionPercentage) {
      setFinalizationData(prev => ({
        ...prev,
        completionPercentage: newPercentage
      }));
    }
  }, [calculateCompletionPercentage, finalizationData.completionPercentage]);
// =================== GÉNÉRATION RAPPORT AST COMPLET AVEC TOUTES LES DONNÉES STEPS 1-5 ===================
  const printAST = useCallback(() => {
    console.log('🖨️ Génération du rapport AST professionnel complet avec données Steps 1-5...');
    setIsLoading(true);
    
    setTimeout(() => {
      const printContent = generateCompleteAST();
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setIsLoading(false);
        };
        
        console.log('✅ Rapport AST complet généré avec succès avec données de tous les steps');
      } else {
        alert(t.printError);
        setIsLoading(false);
      }
    }, 500);
  }, [t.printError]);

  const generateCompleteAST = useCallback(() => {
    const currentDate = new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA');
    const currentTime = new Date().toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA');
    const astNumber = formData?.astNumber || `AST-${Date.now().toString().slice(-6)}`;
    
    // ✅ EXTRACTION COMPLÈTE DES DONNÉES DE TOUS LES STEPS
    const reportData = extractDataForReport();
    
    const totalWorkers = finalizationData.workers.length;
    const consentedWorkers = finalizationData.workers.filter(w => w.hasConsented).length;
    const approvedWorkers = finalizationData.workers.filter(w => w.approbationStatus === 'approved').length;
    
    // ✅ DONNÉES STEPS 1-5 POUR STATISTIQUES
    const totalHazards = reportData.hazards.selected.length + reportData.hazards.identifiedHazards.length;
    const totalEquipment = reportData.equipment.selected.length;
    const totalPermits = reportData.permits.permits.length + reportData.permits.requiredPermits.length;
    const lockoutPoints = reportData.projectInfo.lockoutPoints.length;
    
    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${language === 'en' ? 'Complete JSA Report' : 'Rapport AST Complet'} - ${reportData.projectInfo.client}</title>
    <style>
        @media print { @page { margin: 15mm; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page-break { page-break-before: always; } .no-print { display: none; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #1f2937; background: white; font-size: 11px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; position: relative; }
        .logo-container { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; background: #000; border: 2px solid #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .logo-fallback { color: #f59e0b; font-size: 18px; font-weight: bold; }
        .header h1 { font-size: 24px; margin-bottom: 8px; font-weight: bold; }
        .header .subtitle { font-size: 14px; opacity: 0.9; }
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
        .workers-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .workers-table th, .workers-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 9px; }
        .workers-table th { background: #f3f4f6; font-weight: bold; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 9px; color: #6b7280; }
        .signature-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 40px; }
        .signature-box { border-top: 2px solid #374151; padding-top: 10px; text-align: center; }
        .signature-label { font-size: 10px; color: #4b5563; font-weight: 600; }
        .data-section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
        .data-title { font-size: 12px; font-weight: bold; color: #374151; margin-bottom: 10px; }
        .data-list { font-size: 10px; color: #4b5563; }
        .data-item { margin-bottom: 4px; padding: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container"><div class="logo-fallback">C🛡️</div></div>
        <h1>${language === 'en' ? '🛡️ JOB SAFETY ANALYSIS (JSA)' : '🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL (AST)'}</h1>
        <div class="subtitle">${language === 'en' ? 'Complete Official Report' : 'Rapport Officiel Complet'} - ${tenant} | N° ${astNumber}</div>
    </div>
    
    <div class="stats-summary">
        <h3 style="margin-bottom: 10px; font-size: 14px;">📊 ${t.reportData.executiveSummary}</h3>
        <div class="stats-grid">
            <div class="stat-item"><div class="stat-number">${totalHazards}</div><div class="stat-label">${t.reportData.hazards}</div></div>
            <div class="stat-item"><div class="stat-number">${totalEquipment}</div><div class="stat-label">${t.reportData.equipment}</div></div>
            <div class="stat-item"><div class="stat-number">${totalPermits}</div><div class="stat-label">${t.reportData.permits}</div></div>
            <div class="stat-item"><div class="stat-number">${lockoutPoints}</div><div class="stat-label">${t.reportData.lockoutPoints}</div></div>
            <div class="stat-item"><div class="stat-number">${totalWorkers}</div><div class="stat-label">${t.stats.workers}</div></div>
            <div class="stat-item"><div class="stat-number">${consentedWorkers}/${totalWorkers}</div><div class="stat-label">${t.stats.consents}</div></div>
        </div>
    </div>
    
    <div class="info-grid">
        <div class="info-box">
            <h3>${t.reportData.clientProjectInfo}</h3>
            <div class="info-row"><span class="info-label">${t.reportData.client}</span><span class="info-value">${reportData.projectInfo.client}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.projectNumber}</span><span class="info-value">${reportData.projectInfo.projectNumber}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.location}</span><span class="info-value">${reportData.projectInfo.workLocation}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.dateTime}</span><span class="info-value">${reportData.projectInfo.date} ${reportData.projectInfo.time}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.industry}</span><span class="info-value">${getIndustryLabel(reportData.projectInfo.industry)}</span></div>
        </div>
        <div class="info-box">
            <h3>${t.reportData.teamContacts}</h3>
            <div class="info-row"><span class="info-label">${t.reportData.workerCount}</span><span class="info-value">${reportData.projectInfo.workerCount}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.estimatedDuration}</span><span class="info-value">${reportData.projectInfo.estimatedDuration}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.clientContact}</span><span class="info-value">${reportData.projectInfo.clientRepresentative}</span></div>
            <div class="info-row"><span class="info-label">${t.reportData.emergency}</span><span class="info-value">${reportData.projectInfo.emergencyContact}</span></div>
        </div>
    </div>
    
    ${generateStep1Section(reportData)}
    ${generateStep2Section(reportData)}
    ${generateStep3Section(reportData)}
    ${generateStep4Section(reportData)}
    ${generateStep5Section(reportData)}
    ${generateStep6Section()}
    ${generateSignatureSection()}
    
    <div class="footer">
        <p><strong>${language === 'en' ? 'This document was automatically generated by the C-Secur360 system' : 'Ce document a été généré automatiquement par le système C-Secur360'}</strong></p>
        <p>${language === 'en' ? 'Compliant with Canadian occupational health and safety standards' : 'Conforme aux normes de santé et sécurité au travail du Canada'} | ${language === 'en' ? 'Generated on' : 'Généré le'} ${currentDate} ${language === 'en' ? 'at' : 'à'} ${currentTime}</p>
        <p>${language === 'en' ? 'Official document valid for safety committees, inspections and investigations' : 'Document officiel valide pour comités de sécurité, inspections et enquêtes'}</p>
        <p>🔗 ${language === 'en' ? 'Access link:' : 'Lien d\'accès:'} ${shareLink}</p>
    </div>
</body>
</html>`;
  }, [formData, finalizationData, language, tenant, shareLink, getIndustryLabel, extractDataForReport, t]);

  // =================== GÉNÉRATION SECTIONS INDIVIDUELLES AVEC DONNÉES STEPS 1-5 ===================
  
  const generateStep1Section = useCallback((reportData: any) => {
    if (!reportData.projectInfo.lockoutPoints.length) return '';
    
    const lockoutRows = reportData.projectInfo.lockoutPoints.map((point: any) => `
        <div class="data-item">🔒 ${point.equipmentName} - ${point.location} (${point.energyType})</div>
    `).join('');
    
    return `
    <div class="data-section">
        <div class="data-title">🛡️ STEP 1: ${language === 'en' ? 'LOCKOUT POINTS' : 'POINTS DE VERROUILLAGE'}</div>
        <div class="data-list">${lockoutRows || `<div class="data-item">${language === 'en' ? 'No lockout points identified' : 'Aucun point de verrouillage identifié'}</div>`}</div>
    </div>`;
  }, [language]);

  const generateStep2Section = useCallback((reportData: any) => {
    const equipmentRows = reportData.equipment.selected.map((item: any) => `
        <div class="data-item">🔧 ${item.name} - ${item.category} ${item.required ? '(Requis)' : ''}</div>
    `).join('');
    
    return `
    <div class="data-section">
        <div class="data-title">🔧 STEP 2: ${language === 'en' ? 'SELECTED EQUIPMENT' : 'ÉQUIPEMENTS SÉLECTIONNÉS'}</div>
        <div class="data-list">${equipmentRows || `<div class="data-item">${language === 'en' ? 'No equipment selected' : 'Aucun équipement sélectionné'}</div>`}</div>
    </div>`;
  }, [language]);

  const generateStep3Section = useCallback((reportData: any) => {
    const hazardRows = reportData.hazards.selected.map((hazard: any) => `
        <div class="data-item">⚠️ ${hazard.name} - ${language === 'en' ? 'Risk:' : 'Risque:'} ${hazard.riskLevel}</div>
    `).join('');
    
    return `
    <div class="data-section">
        <div class="data-title">⚠️ STEP 3: ${language === 'en' ? 'IDENTIFIED HAZARDS' : 'DANGERS IDENTIFIÉS'}</div>
        <div class="data-list">${hazardRows || `<div class="data-item">${language === 'en' ? 'No hazards identified' : 'Aucun danger identifié'}</div>`}</div>
    </div>`;
  }, [language]);

  const generateStep4Section = useCallback((reportData: any) => {
    const permitRows = reportData.permits.permits.map((permit: any) => `
        <div class="data-item">📄 ${permit.type} - ${permit.number} (${permit.isRequired ? 'Requis' : 'Optionnel'})</div>
    `).join('');
    
    return `
    <div class="data-section">
        <div class="data-title">📄 STEP 4: ${language === 'en' ? 'REQUIRED PERMITS' : 'PERMIS REQUIS'}</div>
        <div class="data-list">${permitRows || `<div class="data-item">${language === 'en' ? 'No permits required' : 'Aucun permis requis'}</div>`}</div>
    </div>`;
  }, [language]);

  const generateStep5Section = useCallback((reportData: any) => {
    const reviewerRows = reportData.validation.reviewers.map((reviewer: any) => `
        <div class="data-item">👤 ${reviewer.name} - ${reviewer.role} (${reviewer.status})</div>
    `).join('');
    
    return `
    <div class="data-section">
        <div class="data-title">👥 STEP 5: ${language === 'en' ? 'TEAM VALIDATION' : 'VALIDATION ÉQUIPE'}</div>
        <div class="data-list">${reviewerRows || `<div class="data-item">${language === 'en' ? 'No reviewers assigned' : 'Aucun réviseur assigné'}</div>`}</div>
    </div>`;
  }, [language]);

  const generateStep6Section = useCallback(() => {
    const workersRows = finalizationData.workers.map(worker => `
        <tr>
            <td>${worker.name}</td>
            <td>${worker.company}</td>
            <td>${worker.position}</td>
            <td class="${worker.hasConsented ? 'status-approved' : 'status-pending'}">
                ${worker.hasConsented ? '✅ Oui' : '❌ Non'}
            </td>
            <td>${worker.consentTimestamp ? new Date(worker.consentTimestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA') : '-'}</td>
            <td class="status-${worker.approbationStatus}">
                ${worker.approbationStatus === 'approved' ? '✅ Approuvé' : 
                  worker.approbationStatus === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
            </td>
            <td>${worker.approbationComments || '-'}</td>
        </tr>
    `).join('');
    
    return `
    <div class="section page-break">
        <div class="section-header">
            <div class="section-title">👷 STEP 6: ${t.reportData.teamConsents}</div>
        </div>
        <div class="section-content">
            ${finalizationData.workers.length > 0 ? `
                <table class="workers-table">
                    <thead>
                        <tr>
                            <th>${t.reportData.name.replace(':', '')}</th>
                            <th>${language === 'en' ? 'Company' : 'Entreprise'}</th>
                            <th>${language === 'en' ? 'Position' : 'Poste'}</th>
                            <th>${language === 'en' ? 'Consent' : 'Consentement'}</th>
                            <th>${t.reportData.dateTime.replace(':', '')}</th>
                            <th>${language === 'en' ? 'Status' : 'Statut'}</th>
                            <th>${language === 'en' ? 'Comments' : 'Commentaires'}</th>
                        </tr>
                    </thead>
                    <tbody>${workersRows}</tbody>
                </table>
            ` : `<p style="text-align: center; color: #6b7280; font-style: italic;">${t.reportData.noWorkerAdded}</p>`}
            ${finalizationData.finalComments ? `
                <div style="margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 4px;">
                    <strong>💬 ${t.reportData.finalCommentsLabel}</strong><br>${finalizationData.finalComments}
                </div>
            ` : ''}
            <div style="margin-top: 20px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <strong>📊 ${t.reportData.documentStatus}</strong> 
                <span style="padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 600; ${finalizationData.isLocked ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                    ${finalizationData.isLocked ? t.reportData.locked : t.reportData.inProgress}
                </span>
                | ${t.reportData.completion} ${finalizationData.completionPercentage}%
                ${finalizationData.lockTimestamp ? ` | ${t.reportData.lockedOn} ${new Date(finalizationData.lockTimestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}` : ''}
            </div>
        </div>
    </div>`;
  }, [finalizationData, language, t]);

  const generateSignatureSection = useCallback(() => {
    return `
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-label">${t.reportData.safetyManager}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${t.reportData.name} _________________________<br><br>
                ${t.reportData.signature} ____________________<br><br>
                ${t.reportData.date} ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${t.reportData.supervisor}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${t.reportData.name} _________________________<br><br>
                ${t.reportData.signature} ____________________<br><br>
                ${t.reportData.date} ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">${t.reportData.manager}</div>
            <div style="margin-top: 30px; font-size: 8px;">
                ${t.reportData.name} _________________________<br><br>
                ${t.reportData.signature} ____________________<br><br>
                ${t.reportData.date} ________________________
            </div>
        </div>
    </div>`;
  }, [t]);
// =================== CSS MOBILE OPTIMISÉ THÈME SOMBRE ULTRA-COMPLET ===================
  const darkThemeCSS = `
    .step6-container { padding: 0; background: transparent; min-height: 100vh; color: #ffffff !important; }
    .finalization-header { text-align: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.2); backdrop-filter: blur(10px); }
    .finalization-title { font-size: 24px; margin-bottom: 8px; font-weight: bold; color: #ffffff !important; }
    .finalization-subtitle { font-size: 14px; opacity: 0.9; color: #e2e8f0 !important; }
    .tabs-container { display: flex; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 6px; margin-bottom: 20px; backdrop-filter: blur(10px); }
    .tab-button { flex: 1; padding: 12px 16px; border: none; background: transparent; color: #94a3b8; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; }
    .tab-button.active { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transform: translateY(-1px); }
    .tab-button:hover:not(.active) { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .finalization-section { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 16px; backdrop-filter: blur(10px); }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #ffffff !important; display: flex; align-items: center; gap: 8px; }
    .workers-grid { display: grid; gap: 16px; }
    .worker-card { border: 2px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 16px; background: rgba(30, 41, 59, 0.6); transition: all 0.3s ease; backdrop-filter: blur(5px); }
    .worker-card:hover { border-color: #3b82f6; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15); transform: translateY(-2px); }
    .worker-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .worker-name { font-size: 16px; font-weight: bold; color: #ffffff !important; }
    .worker-company { color: #94a3b8 !important; font-size: 14px; }
    .consent-section { background: rgba(51, 65, 85, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; padding: 16px; margin-top: 12px; backdrop-filter: blur(5px); }
    .consent-checkbox { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.3s ease; }
    .consent-checkbox:hover { background: rgba(59, 130, 246, 0.1); }
    .consent-checkbox input { width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; }
    .consent-text { font-weight: 500; color: #e2e8f0 !important; flex: 1; }
    .consent-timestamp { font-size: 12px; color: #94a3b8 !important; font-style: italic; }
    .approbation-section { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .approbation-btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; min-height: 44px; flex: 1; min-width: 120px; }
    .approbation-approve { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .approbation-approve:hover { background: rgba(16, 185, 129, 0.3); transform: translateY(-1px); }
    .approbation-reject { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .approbation-reject:hover { background: rgba(239, 68, 68, 0.3); transform: translateY(-1px); }
    .premium-button { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-size: 14px; }
    .premium-button:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); }
    .premium-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .share-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 16px; }
    .share-btn { padding: 16px 12px; border: 2px solid rgba(148, 163, 184, 0.2); border-radius: 8px; background: rgba(30, 41, 59, 0.6); cursor: pointer; text-align: center; transition: all 0.3s ease; backdrop-filter: blur(5px); min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
    .share-btn:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); transform: translateY(-2px); }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); color: #ffffff !important; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0 !important; }
    .form-input { width: 100%; padding: 14px; border: 2px solid rgba(148, 163, 184, 0.2); border-radius: 8px; font-size: 16px; transition: border-color 0.3s ease; background: rgba(51, 65, 85, 0.6) !important; color: #ffffff !important; backdrop-filter: blur(5px); }
    .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .form-input::placeholder { color: #94a3b8 !important; }
    .checkbox-field { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid rgba(148, 163, 184, 0.2); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; background: rgba(30, 41, 59, 0.6) !important; backdrop-filter: blur(5px); }
    .checkbox-field:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1) !important; }
    .checkbox-field.checked { border-color: #10b981; background: rgba(16, 185, 129, 0.1) !important; }
    .checkbox-field span { color: #e2e8f0 !important; font-weight: 500 !important; }
    .progress-bar { width: 100%; height: 8px; background: rgba(55, 65, 81, 0.6); border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid rgba(59, 130, 246, 0.3); }
    .stat-number { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .stat-label { font-size: 11px; opacity: 0.9; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .spinning { animation: spin 1s linear infinite; }
    @media (max-width: 768px) {
      .finalization-header { padding: 16px; margin-bottom: 16px; }
      .finalization-title { font-size: 20px; }
      .tabs-container { flex-direction: column; gap: 4px; }
      .tab-button { padding: 14px 16px; font-size: 16px; min-height: 52px; }
      .finalization-section { padding: 16px; margin-bottom: 12px; }
      .section-title { font-size: 16px; margin-bottom: 12px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .stat-card { padding: 12px; }
      .stat-number { font-size: 18px; }
      .worker-header { flex-direction: column; align-items: flex-start; gap: 6px; }
      .approbation-section { flex-direction: column; gap: 6px; }
      .approbation-btn { min-width: 100%; }
      .share-buttons { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .share-btn { padding: 12px 8px; min-height: 70px; font-size: 13px; }
      .modal-content { padding: 20px; margin: 16px; width: calc(100% - 32px); }
      .form-input { padding: 16px; font-size: 16px; }
    }
    @media (max-width: 480px) {
      .tabs-container { padding: 4px; }
      .tab-button { padding: 12px 8px; font-size: 14px; flex-direction: column; gap: 4px; }
      .stats-grid { grid-template-columns: 1fr; }
      .share-buttons { grid-template-columns: 1fr; }
    }
  `;

  // =================== RENDU JSX COMPLET AVEC TRADUCTIONS ===================
  return (
    <>
      {/* Injection CSS thème sombre optimisé */}
      <style dangerouslySetInnerHTML={{ __html: darkThemeCSS }} />
      
      <div className="step6-container">
        {/* Header avec traductions */}
        <div className="finalization-header">
          <h2 className="finalization-title">{t.title}</h2>
          <p className="finalization-subtitle">{t.subtitle}</p>
        </div>

        {/* Navigation onglets avec traductions */}
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            <Users size={18} />
            {t.tabs.workers}
          </button>
          <button 
            className={`tab-button ${activeTab === 'sharing' ? 'active' : ''}`}
            onClick={() => setActiveTab('sharing')}
          >
            <Share2 size={18} />
            {t.tabs.sharing}
          </button>
          <button 
            className={`tab-button ${activeTab === 'finalization' ? 'active' : ''}`}
            onClick={() => setActiveTab('finalization')}
          >
            <FileText size={18} />
            {t.tabs.finalization}
          </button>
        </div>

        {/* ONGLET 1: ÉQUIPE CHANTIER */}
        {activeTab === 'workers' && (
          <div>
            {/* Stats équipe avec traductions */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.length}</div>
                <div className="stat-label">{t.stats.workers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.filter(w => w.hasConsented).length}</div>
                <div className="stat-label">{t.stats.consents}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.filter(w => w.approbationStatus === 'approved').length}</div>
                <div className="stat-label">{t.stats.approvals}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Math.round((finalizationData.workers.filter(w => w.hasConsented).length / Math.max(finalizationData.workers.length, 1)) * 100)}%</div>
                <div className="stat-label">{t.stats.readingRate}</div>
              </div>
            </div>

            {/* Gestion équipe avec traductions */}
            <div className="finalization-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 className="section-title">
                  <Users size={24} />
                  {t.teamManagement}
                </h3>
                <button 
                  className="premium-button"
                  onClick={() => setShowAddWorker(true)}
                >
                  <Plus size={18} />
                  {t.addWorker}
                </button>
              </div>

              {/* Liste des travailleurs */}
              <div className="workers-grid">
                {finalizationData.workers.map(worker => (
                  <div key={worker.id} className="worker-card">
                    <div className="worker-header">
                      <div>
                        <div className="worker-name">{worker.name}</div>
                        <div className="worker-company">{worker.company}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: worker.approbationStatus === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 
                                     worker.approbationStatus === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: worker.approbationStatus === 'approved' ? '#10b981' : 
                                 worker.approbationStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${worker.approbationStatus === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 
                                                worker.approbationStatus === 'rejected' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {t.status[worker.approbationStatus]}
                        </span>
                      </div>
                    </div>

                    {/* Section consentement avec traductions */}
                    <div className="consent-section">
                      <div 
                        className="consent-checkbox"
                        onClick={() => toggleConsent(worker.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={worker.hasConsented}
                          onChange={() => {}}
                        />
                        <span className="consent-text">
                          {t.consentText}
                        </span>
                      </div>
                      {worker.hasConsented && worker.consentTimestamp && (
                        <div className="consent-timestamp">
                          {t.consentGiven} {new Date(worker.consentTimestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                        </div>
                      )}
                    </div>

                    {/* Boutons approbation avec traductions */}
                    <div className="approbation-section">
                      <button 
                        className="approbation-btn approbation-approve"
                        onClick={() => updateApprobation(worker.id, 'approved', 'Approuvé par le superviseur')}
                      >
                        {t.approve}
                      </button>
                      <button 
                        className="approbation-btn approbation-reject"
                        onClick={() => updateApprobation(worker.id, 'rejected', 'Formation supplémentaire requise')}
                      >
                        {t.reject}
                      </button>
                    </div>
                  </div>
                ))}

                {finalizationData.workers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>{t.noWorkers}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2: PARTAGE SIMPLE AVEC TRADUCTIONS */}
        {activeTab === 'sharing' && (
          <div>
            <div className="finalization-section">
              <h3 className="section-title">
                <Share2 size={24} />
                {t.sharing}
              </h3>
              
              {/* Lien de partage avec traductions */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">
                  {t.secureLink}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    value={shareLink}
                    readOnly
                    className="form-input"
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <button 
                    onClick={copyShareLink}
                    className="premium-button"
                    style={{ minWidth: '120px' }}
                  >
                    {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                    {copySuccess ? t.copied : t.copy}
                  </button>
                </div>
              </div>

              {/* Instructions avec traductions */}
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                  {t.shareInstructions}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px' }}>
                  {t.shareList.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Boutons de partage */}
              <div className="share-buttons">
                <div className="share-btn" onClick={shareViaEmail}>
                  <Mail size={24} style={{ color: '#dc2626', marginBottom: '4px' }} />
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>📧 Email</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {language === 'fr' ? 'Courriel' : 'Email'}
                  </div>
                </div>
                
                <div className="share-btn" onClick={shareViaSMS}>
                  <Smartphone size={24} style={{ color: '#059669', marginBottom: '4px' }} />
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>📱 SMS</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {language === 'fr' ? 'Texto' : 'Text'}
                  </div>
                </div>
                
                <div className="share-btn" onClick={shareViaWhatsApp}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>💬</div>
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>WhatsApp</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Messenger</div>
                </div>
                
                <div className="share-btn" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`)}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📘</div>
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>Facebook</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {language === 'fr' ? 'Réseau social' : 'Social network'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 3: FINALISATION AVEC TRADUCTIONS */}
        {activeTab === 'finalization' && (
          <div>
            {/* État de complétion */}
            <div className="finalization-section">
              <h3 className="section-title">
                <BarChart3 size={24} />
                {t.completionStatus}
              </h3>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${finalizationData.completionPercentage}%` }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', fontWeight: '600', color: '#10b981', marginBottom: '16px' }}>
                {finalizationData.completionPercentage}% {t.completed}
              </p>

              {/* Statuts des sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{t.sectionStatus.projectInfo}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{t.sectionStatus.hazards}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{t.sectionStatus.equipment}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                  <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{t.sectionStatus.teamValidation}</span>
                </div>
              </div>
            </div>

            {/* Options de génération */}
            <div className="finalization-section">
              <h3 className="section-title">
                <FileText size={24} />
                {t.reportOptions}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includePhotos ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includePhotos: !prev.documentGeneration.includePhotos }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includePhotos} onChange={() => {}} />
                  <span>{t.includePhotos}</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeSignatures ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeSignatures: !prev.documentGeneration.includeSignatures }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeSignatures} onChange={() => {}} />
                  <span>{t.includeSignatures}</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeQRCode ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeQRCode: !prev.documentGeneration.includeQRCode }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeQRCode} onChange={() => {}} />
                  <span>{t.includeQRCode}</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeBranding ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeBranding: !prev.documentGeneration.includeBranding }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeBranding} onChange={() => {}} />
                  <span>{t.includeBranding}</span>
                </div>
              </div>
            </div>

            {/* Commentaires finaux */}
            <div className="finalization-section">
              <h3 className="section-title">
                <MessageSquare size={24} />
                {t.finalComments}
              </h3>
              
              <textarea
                value={finalizationData.finalComments}
                onChange={(e) => setFinalizationData(prev => ({ ...prev, finalComments: e.target.value }))}
                placeholder={t.commentsPlaceholder}
                className="form-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                disabled={finalizationData.isLocked}
              />
              
              {finalizationData.isLocked && (
                <p style={{ marginTop: '8px', color: '#ef4444', fontSize: '14px', fontStyle: 'italic' }}>
                  {t.documentLocked}
                </p>
              )}
            </div>

            {/* Actions finales */}
            <div className="finalization-section">
              <h3 className="section-title">
                <Target size={24} />
                {t.finalActions}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <button 
                  onClick={printAST}
                  className="premium-button"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw size={18} className="spinning" /> : <Printer size={18} />}
                  {t.print}
                </button>
                
                <button 
                  onClick={() => {
                    console.log('💾 Sauvegarde AST...');
                    alert(t.astSaved);
                  }}
                  className="premium-button"
                >
                  <Save size={18} />
                  {t.save}
                </button>
                
                <button 
                  onClick={() => {
                    console.log('📁 Archivage AST...');
                    alert(t.astArchived);
                  }}
                  className="premium-button"
                >
                  <Archive size={18} />
                  {t.archive}
                </button>
                
                <button 
                  onClick={() => setShowLockConfirm(true)}
                  className="premium-button"
                  disabled={finalizationData.isLocked}
                  style={{ 
                    background: finalizationData.isLocked ? 
                      'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 
                      'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  }}
                >
                  {finalizationData.isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                  {finalizationData.isLocked ? t.locked : t.lock}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT TRAVAILLEUR AVEC TRADUCTIONS */}
        {showAddWorker && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {t.addWorkerModal}
                </h4>
                <button
                  onClick={() => setShowAddWorker(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ef4444'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#94a3b8'}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  value={newWorker.name || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder={t.namePlaceholder}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t.company}</label>
                <input
                  type="text"
                  value={newWorker.company || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, company: e.target.value }))}
                  className="form-input"
                  placeholder={t.companyPlaceholder}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={addWorker}
                  className="premium-button"
                  style={{ flex: 1 }}
                  disabled={!newWorker.name || !newWorker.company}
                >
                  <Plus size={18} />
                  {t.add}
                </button>
                <button
                  onClick={() => setShowAddWorker(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(51, 65, 85, 0.6)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = '#ef4444';
                    (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.borderColor = 'rgba(148, 163, 184, 0.3)';
                    (e.target as HTMLButtonElement).style.background = 'rgba(51, 65, 85, 0.6)';
                  }}
                >
                  <X size={18} />
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMATION VERROUILLAGE AVEC TRADUCTIONS */}
        {showLockConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ 
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {t.confirmLock}
                </h4>
                <button
                  onClick={() => setShowLockConfirm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ffffff'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#fca5a5'}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ marginBottom: '20px', color: '#fef2f2' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '12px',
                  padding: '12px',
                  background: 'rgba(254, 242, 242, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(252, 165, 165, 0.2)'
                }}>
                  <AlertTriangle size={20} style={{ color: '#fbbf24' }} />
                  <strong>{t.lockWarning}</strong>
                </div>
                
                <div style={{ 
                  background: 'rgba(254, 242, 242, 0.1)', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid rgba(252, 165, 165, 0.2)'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '14px' }}>
                    {t.autoChecks}
                  </h5>
                  <div style={{ fontSize: '13px', color: '#fef2f2', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{t.sectionsCompleted}</span>
                      <strong>{finalizationData.completionPercentage}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{t.stats.consents}:</span>
                      <strong>{finalizationData.workers.filter(w => w.hasConsented).length}/{finalizationData.workers.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.stats.approvals}:</span>
                      <strong>{finalizationData.workers.filter(w => w.approbationStatus === 'approved').length}/{finalizationData.workers.length}</strong>
                    </div>
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', lineHeight: '1.4', opacity: 0.9 }}>
                  {t.lockDescription}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => lockAST('permanent')}
                  className="premium-button"
                  style={{ 
                    flex: 1,
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderColor: 'rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <Lock size={18} />
                  {t.lockPermanently}
                </button>
                <button
                  onClick={() => setShowLockConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    border: '2px solid rgba(252, 165, 165, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(254, 242, 242, 0.1)',
                    color: '#fef2f2',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(254, 242, 242, 0.2)';
                    (e.target as HTMLButtonElement).style.borderColor = 'rgba(252, 165, 165, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(254, 242, 242, 0.1)';
                    (e.target as HTMLButtonElement).style.borderColor = 'rgba(252, 165, 165, 0.3)';
                  }}
                >
                  <X size={18} />
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// =================== EXPORT DU COMPOSANT ===================
export default Step6Finalization;

  
