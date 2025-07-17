'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, FileText, Download, Archive, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Share2, Save, Calendar, User, MapPin, Shield, Award,
  Target, BarChart3, Globe, Printer, Mail, Smartphone, Image, X,
  Plus, Upload, Copy, Check, RefreshCw, Lock, Unlock, Users, MessageSquare
} from 'lucide-react';

// =================== INTERFACES ===================
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
  formData: any;
  onDataChange: (section: string, data: FinalizationData) => void;
  language: string;
  tenant: string;
  errors?: any;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Finalisation AST",
    subtitle: "Équipe, Partage et Validation Finale",
    
    // Onglets
    workersTab: "Équipe Chantier",
    sharingTab: "Partage",
    finalizationTab: "Finalisation",
    
    // Équipe
    teamManagement: "Gestion de l'Équipe",
    addWorker: "Ajouter Travailleur",
    workers: "Travailleurs",
    consents: "Consentements",
    approvals: "Approbations",
    readingRate: "Taux Lecture",
    fullName: "Nom complet",
    company: "Entreprise",
    consent: "Je consens avoir lu et compris cette AST",
    consentGiven: "Consentement donné le",
    approve: "Approuver",
    reject: "Rejeter",
    approved: "Approuvé",
    rejected: "Rejeté",
    pending: "En attente",
    noWorkersYet: "Aucun travailleur ajouté. Cliquez sur \"Ajouter Travailleur\" pour commencer.",
    
    // Partage
    astSharing: "Partage de l'AST",
    secureShareLink: "Lien de partage sécurisé",
    copy: "Copier",
    copied: "Copié!",
    shareInstructions: "Instructions de partage",
    shareEmail: "Email",
    shareSMS: "SMS",
    shareWhatsApp: "WhatsApp",
    shareFacebook: "Facebook",
    sendByEmail: "Envoyer par courriel",
    sendBySMS: "Envoyer par texto",
    shareOnWhatsApp: "Partager sur WhatsApp",
    shareOnFacebook: "Partager sur Facebook",
    
    // Finalisation
    globalCompletion: "État de Complétion Globale",
    completed: "Complété",
    projectInfo: "Informations projet",
    hazardsIdentified: "Dangers identifiés",
    equipmentSelected: "Équipements sélectionnés",
    teamValidation: "Validation équipe",
    reportOptions: "Options de Génération Rapport",
    includePhotos: "Inclure photos",
    includeSignatures: "Inclure signatures",
    includeQRCode: "Inclure QR Code",
    includeBranding: "Inclure branding",
    finalComments: "Commentaires Finaux",
    finalActions: "Actions Finales",
    printReport: "Imprimer Rapport",
    save: "Sauvegarder",
    archive: "Archiver",
    lock: "Verrouiller",
    locked: "Verrouillé",
    
    // Modal
    addWorkerTitle: "Ajouter un Travailleur",
    add: "Ajouter",
    cancel: "Annuler",
    confirmLock: "Confirmer le Verrouillage",
    lockWarning: "ATTENTION: Cette action est irréversible !",
    lockPermanently: "Verrouiller Définitivement",
    
    // Messages
    workerAdded: "Travailleur ajouté avec succès",
    fillNameCompany: "Veuillez remplir le nom et la compagnie",
    astSaved: "AST sauvegardée avec succès!",
    astArchived: "AST archivée avec succès!",
    astLocked: "AST verrouillée avec succès",
    linkCopied: "Lien copié dans le presse-papiers",
    copyError: "Erreur lors de la copie du lien",
    lockedDocument: "Document verrouillé - Modification impossible",
    automaticChecks: "Vérifications automatiques",
    lockDescription: "Une fois verrouillée, l'AST ne pourra plus être modifiée mais restera consultable par l'équipe."
  },
  en: {
    title: "AST Finalization",
    subtitle: "Team, Sharing and Final Validation",
    
    // Onglets
    workersTab: "Site Team",
    sharingTab: "Sharing",
    finalizationTab: "Finalization",
    
    // Équipe
    teamManagement: "Team Management",
    addWorker: "Add Worker",
    workers: "Workers",
    consents: "Consents",
    approvals: "Approvals",
    readingRate: "Reading Rate",
    fullName: "Full name",
    company: "Company",
    consent: "I consent to having read and understood this AST",
    consentGiven: "Consent given on",
    approve: "Approve",
    reject: "Reject",
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    noWorkersYet: "No workers added yet. Click \"Add Worker\" to start.",
    
    // Partage
    astSharing: "AST Sharing",
    secureShareLink: "Secure sharing link",
    copy: "Copy",
    copied: "Copied!",
    shareInstructions: "Sharing instructions",
    shareEmail: "Email",
    shareSMS: "SMS",
    shareWhatsApp: "WhatsApp",
    shareFacebook: "Facebook",
    sendByEmail: "Send by email",
    sendBySMS: "Send by text",
    shareOnWhatsApp: "Share on WhatsApp",
    shareOnFacebook: "Share on Facebook",
    
    // Finalisation
    globalCompletion: "Global Completion Status",
    completed: "Completed",
    projectInfo: "Project information",
    hazardsIdentified: "Hazards identified",
    equipmentSelected: "Equipment selected",
    teamValidation: "Team validation",
    reportOptions: "Report Generation Options",
    includePhotos: "Include photos",
    includeSignatures: "Include signatures",
    includeQRCode: "Include QR Code",
    includeBranding: "Include branding",
    finalComments: "Final Comments",
    finalActions: "Final Actions",
    printReport: "Print Report",
    save: "Save",
    archive: "Archive",
    lock: "Lock",
    locked: "Locked",
    
    // Modal
    addWorkerTitle: "Add a Worker",
    add: "Add",
    cancel: "Cancel",
    confirmLock: "Confirm Lock",
    lockWarning: "WARNING: This action is irreversible!",
    lockPermanently: "Lock Permanently",
    
    // Messages
    workerAdded: "Worker added successfully",
    fillNameCompany: "Please fill in name and company",
    astSaved: "AST saved successfully!",
    astArchived: "AST archived successfully!",
    astLocked: "AST locked successfully",
    linkCopied: "Link copied to clipboard",
    copyError: "Error copying link",
    lockedDocument: "Document locked - Cannot modify",
    automaticChecks: "Automatic checks",
    lockDescription: "Once locked, the AST can no longer be modified but will remain viewable by the team."
  }
};

export default function Step6Finalization({ 
  formData, 
  onDataChange, 
  language = 'fr',
  tenant 
}: FinalizationStepProps) {
  const t = translations[language as keyof typeof translations];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== ÉTAT PRINCIPAL ===================
  const [activeTab, setActiveTab] = useState('workers');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Générer le lien de partage
  const [shareLink, setShareLink] = useState(() => {
    const baseUrl = `https://${tenant}.csecur360.com`;
    const astId = Math.random().toString(36).substr(2, 12).toUpperCase();
    const secureToken = Math.random().toString(36).substr(2, 16);
    return `${baseUrl}/ast/view/${astId}?token=${secureToken}`;
  });

  // État travailleur
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    company: '',
    hasConsented: false,
    approbationStatus: 'pending'
  });

  // État finalisation
  const [finalizationData, setFinalizationData] = useState<FinalizationData>({
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
  });

  // =================== EFFECTS ===================
  useEffect(() => {
    onDataChange('finalization', finalizationData);
  }, [finalizationData, onDataChange]);

  // =================== HANDLERS ===================
  const addWorker = () => {
    if (!newWorker.name || !newWorker.company) {
      alert(`❌ ${t.fillNameCompany}`);
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
    console.log('✅ Travailleur ajouté:', worker);
  };

  const toggleConsent = (workerId: string) => {
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
  };

  const updateApprobation = (workerId: string, status: 'approved' | 'rejected', comments?: string) => {
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
  };

  // =================== PARTAGE ===================
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}`);
    const body = encodeURIComponent(`Bonjour,

Veuillez consulter l'Analyse Sécuritaire de Travail (AST) pour le projet "${formData.projectInfo?.projectName || 'Projet'}".

🔗 Lien d'accès sécurisé:
${shareLink}

Cette AST doit être consultée et approuvée avant le début des travaux.

Cordialement,
${tenant} - Équipe Sécurité`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`🛡️ AST ${formData.projectInfo?.projectName || 'Projet'}: ${shareLink}`);
    window.open(`sms:?body=${message}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}

Lien d'accès: ${shareLink}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      alert(`❌ ${t.copyError}`);
    }
  };

  // =================== IMPRESSION ===================
  const printAST = () => {
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
      } else {
        alert('❌ Erreur : Impossible d\'ouvrir la fenêtre d\'impression');
        setIsLoading(false);
      }
    }, 500);
  };

  const generateCompleteAST = () => {
    const currentDate = new Date().toLocaleDateString('fr-CA');
    const currentTime = new Date().toLocaleTimeString('fr-CA');
    const astNumber = formData?.astNumber || `AST-${Date.now().toString().slice(-6)}`;
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport AST Complet - ${formData.projectInfo?.client || 'Client'}</title>
    <style>
        @media print { @page { margin: 15mm; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.4; color: #1f2937; background: white; font-size: 11px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; position: relative; }
        .logo-container { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; background: #000; border: 2px solid #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .logo-container img { width: 50px; height: 50px; object-fit: contain; }
        .logo-fallback { color: #f59e0b; font-size: 18px; font-weight: bold; }
        .header h1 { font-size: 24px; margin-bottom: 8px; font-weight: bold; }
        .header .subtitle { font-size: 14px; opacity: 0.9; }
        .section { margin-bottom: 25px; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .section-header { background: #f3f4f6; padding: 12px 15px; border-bottom: 1px solid #d1d5db; }
        .section-title { font-size: 14px; font-weight: bold; color: #1f2937; }
        .section-content { padding: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; padding: 4px 0; }
        .info-label { font-weight: 600; color: #4b5563; min-width: 120px; }
        .info-value { color: #1f2937; font-weight: 500; flex: 1; text-align: right; }
        .workers-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .workers-table th, .workers-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 9px; }
        .workers-table th { background: #f3f4f6; font-weight: bold; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; font-size: 9px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container">
            <img src="/c-secur360-logo.png" alt="C-Secur360" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback" style="display: none;">C🛡️</div>
        </div>
        <h1>🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL (AST)</h1>
        <div class="subtitle">Rapport Officiel Complet - ${tenant} | N° ${astNumber}</div>
    </div>

    <div class="section">
        <div class="section-header">
            <div class="section-title">🏢 INFORMATIONS GÉNÉRALES</div>
        </div>
        <div class="section-content">
            <div class="info-row">
                <span class="info-label">Client:</span>
                <span class="info-value">${formData.projectInfo?.client || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Projet #:</span>
                <span class="info-value">${formData.projectInfo?.projectNumber || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Lieu:</span>
                <span class="info-value">${formData.projectInfo?.workLocation || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date/Heure:</span>
                <span class="info-value">${formData.projectInfo?.date || currentDate} ${formData.projectInfo?.time || currentTime}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <div class="section-title">👷 ÉQUIPE ET CONSENTEMENTS</div>
        </div>
        <div class="section-content">
            ${finalizationData.workers.length > 0 ? `
                <table class="workers-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Entreprise</th>
                            <th>Consentement</th>
                            <th>Date/Heure</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${finalizationData.workers.map(worker => `
                            <tr>
                                <td>${worker.name}</td>
                                <td>${worker.company}</td>
                                <td class="${worker.hasConsented ? 'status-approved' : 'status-pending'}">
                                    ${worker.hasConsented ? '✅ Oui' : '❌ Non'}
                                </td>
                                <td>${worker.consentTimestamp ? new Date(worker.consentTimestamp).toLocaleString('fr-CA') : '-'}</td>
                                <td class="status-${worker.approbationStatus}">
                                    ${worker.approbationStatus === 'approved' ? '✅ Approuvé' : 
                                      worker.approbationStatus === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p style="text-align: center; color: #6b7280; font-style: italic;">Aucun travailleur ajouté à l\'équipe</p>'}
            
            ${finalizationData.finalComments ? `
                <div style="margin-top: 20px;">
                    <strong>Commentaires Finaux:</strong>
                    <div style="white-space: pre-wrap; line-height: 1.5; padding: 10px; background: #f9fafb; border-radius: 4px; margin-top: 8px;">
                        ${finalizationData.finalComments}
                    </div>
                </div>
            ` : ''}
        </div>
    </div>

    <div class="footer">
        <p><strong>Ce document a été généré automatiquement par le système C-Secur360</strong></p>
        <p>Conforme aux normes de santé et sécurité au travail du Canada | Généré le ${currentDate} à ${currentTime}</p>
        <p>🔗 Lien d'accès: ${shareLink}</p>
    </div>
</body>
</html>`;
  };

  const lockAST = () => {
    setFinalizationData(prev => ({
      ...prev,
      isLocked: true,
      lockTimestamp: new Date().toISOString(),
      lockReason: 'permanent'
    }));
    setShowLockConfirm(false);
    alert(`✅ ${t.astLocked}`);
  };

  // =================== COMPUTED VALUES ===================
  const totalWorkers = finalizationData.workers.length;
  const consentedWorkers = finalizationData.workers.filter(w => w.hasConsented).length;
  const approvedWorkers = finalizationData.workers.filter(w => w.approbationStatus === 'approved').length;
  const readingRate = totalWorkers > 0 ? Math.round((consentedWorkers / totalWorkers) * 100) : 0;

  return (
    <div style={{ 
      background: 'transparent', 
      color: '#ffffff', 
      padding: '0',
      width: '100%',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.2) 0%, rgba(15, 23, 42, 0.2) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle size={28} />
        </div>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          margin: '0 0 8px',
          color: '#ffffff'
        }}>
          {t.title}
        </h2>
        <p style={{
          fontSize: '14px',
          opacity: 0.9,
          color: '#e2e8f0',
          margin: 0
        }}>
          {t.subtitle}
        </p>
      </div>

      {/* Navigation onglets */}
      <div style={{
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        gap: '4px'
      }}>
        <button 
          onClick={() => setActiveTab('workers')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            background: activeTab === 'workers' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
            color: activeTab === 'workers' ? 'white' : '#94a3b8',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px'
          }}
        >
          <Users size={16} />
          {t.workersTab}
        </button>
        <button 
          onClick={() => setActiveTab('sharing')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            background: activeTab === 'sharing' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
            color: activeTab === 'sharing' ? 'white' : '#94a3b8',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px'
          }}
        >
          <Share2 size={16} />
          {t.sharingTab}
        </button>
        <button 
          onClick={() => setActiveTab('finalization')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            background: activeTab === 'finalization' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent',
            color: activeTab === 'finalization' ? 'white' : '#94a3b8',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '44px'
          }}
        >
          <FileText size={16} />
          {t.finalizationTab}
        </button>
      </div>

      {/* ONGLET 1: ÉQUIPE CHANTIER */}
      {activeTab === 'workers' && (
        <div>
          {/* Stats équipe */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.2))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#ffffff',
              padding: '16px 12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                {totalWorkers}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                👷 {t.workers}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              padding: '16px 12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                {consentedWorkers}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                ✅ {t.consents}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#ffffff',
              padding: '16px 12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                {approvedWorkers}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                👍 {t.approvals}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#ffffff',
              padding: '16px 12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                {readingRate}%
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                📊 {t.readingRate}
              </div>
            </div>
          </div>

          {/* Section équipe */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users size={20} />
                {t.teamManagement}
              </h3>
              <button
                onClick={() => setShowAddWorker(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  minHeight: '40px'
                }}
              >
                <Plus size={16} />
                {t.addWorker}
              </button>
            </div>

            {/* Liste des travailleurs */}
            {finalizationData.workers.length > 0 ? (
              finalizationData.workers.map(worker => (
                <div key={worker.id} style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '12px'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        margin: '0 0 4px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff',
                        wordBreak: 'break-word'
                      }}>
                        {worker.name}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#94a3b8',
                        wordBreak: 'break-word'
                      }}>
                        {worker.company}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: worker.approbationStatus === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                  worker.approbationStatus === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${worker.approbationStatus === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 
                                          worker.approbationStatus === 'rejected' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      color: worker.approbationStatus === 'approved' ? '#10b981' : 
                             worker.approbationStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                      whiteSpace: 'nowrap'
                    }}>
                      {worker.approbationStatus === 'approved' ? '✅' : 
                       worker.approbationStatus === 'rejected' ? '❌' : '⏳'}
                      {worker.approbationStatus === 'approved' ? t.approved : 
                       worker.approbationStatus === 'rejected' ? t.rejected : t.pending}
                    </div>
                  </div>

                  {/* Section consentement */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        marginBottom: worker.hasConsented && worker.consentTimestamp ? '8px' : '0'
                      }}
                      onClick={() => toggleConsent(worker.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={worker.hasConsented}
                        onChange={() => {}}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#3b82f6',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{
                        fontWeight: '500',
                        color: '#e2e8f0',
                        fontSize: '14px'
                      }}>
                        ✋ {t.consent}
                      </span>
                    </div>
                    {worker.hasConsented && worker.consentTimestamp && (
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontStyle: 'italic'
                      }}>
                        📅 {t.consentGiven} {new Date(worker.consentTimestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      </div>
                    )}
                  </div>

                  {/* Boutons approbation */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      onClick={() => updateApprobation(worker.id, 'approved', 'Approuvé par le superviseur')}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '32px'
                      }}
                    >
                      👍 {t.approve}
                    </button>
                    <button 
                      onClick={() => updateApprobation(worker.id, 'rejected', 'Formation supplémentaire requise')}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '32px'
                      }}
                    >
                      👎 {t.reject}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#94a3b8'
              }}>
                <Users size={40} style={{ margin: '0 auto 12px', color: '#64748b' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {t.noWorkersYet}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET 2: PARTAGE */}
      {activeTab === 'sharing' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Share2 size={20} />
            📤 {t.astSharing}
          </h3>
          
          {/* Lien de partage */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#e2e8f0',
              fontWeight: '600',
              marginBottom: '8px',
              display: 'block',
              fontSize: '14px'
            }}>
              🔗 {t.secureShareLink}:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={shareLink}
                readOnly
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={copyShareLink}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '100px',
                  fontSize: '14px'
                }}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                {copySuccess ? t.copied : t.copy}
              </button>
            </div>
          </div>
