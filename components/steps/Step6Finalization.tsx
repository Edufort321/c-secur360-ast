'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, FileText, Download, Archive, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Share2, Save, Calendar, User, MapPin, Shield, Award,
  Target, BarChart3, Globe, Printer, Mail, Smartphone, Image, X,
  Plus, Upload, Users, Copy, Check, MessageSquare, Phone, Bell,
  QrCode, Link, Settings, Lock, Edit, Trash2, UserPlus, PenTool,
  HardHat, FileCheck, Briefcase, Building, Star, ExternalLink,
  RefreshCw, Zap, Crown, Sparkles
} from 'lucide-react';

// =================== INTERFACES WORKER ===================
interface Worker {
  id: string;
  name: string;
  position: string;
  employeeId?: string;
  company: string;
  phone?: string;
  email?: string;
  certifications: string[];
  experience: string;
  hasConsented: boolean;
  consentDate?: string;
  consentTime?: string;
  signature?: string;
  digitalSignature?: boolean;
  consultationTime?: number; // Temps en minutes passé à consulter l'AST
  approbationStatus?: 'pending' | 'approved' | 'rejected';
  approbationComments?: string;
  lastAccessDate?: string;
}

// =================== INTERFACES PARTAGE ===================
interface ShareRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  method: 'email' | 'sms' | 'both';
  role: 'worker' | 'supervisor' | 'manager';
  status: 'sent' | 'viewed' | 'approved' | 'rejected';
  sentAt?: string;
  viewedAt?: string;
  responseAt?: string;
}

// =================== INTERFACE PRINCIPALE FINALIZATION ===================
interface FinalizationData {
  workers: Worker[];
  shareRecipients: ShareRecipient[];
  photos: any[];
  finalComments: string;
  documentGeneration: {
    format: 'pdf' | 'word' | 'excel' | 'html';
    template: 'standard' | 'detailed' | 'summary' | 'regulatory';
    language: 'fr' | 'en' | 'both';
    includePhotos: boolean;
    includeSignatures: boolean;
    includeQRCode: boolean;
    branding: boolean;
    watermark: boolean;
    includeAllFields: boolean;
    onlyFilledFields: boolean;
  };
  distribution: {
    email: {
      enabled: boolean;
      recipients: string[];
      subject: string;
      message: string;
      sendReminders: boolean;
      reminderInterval: number;
    };
    sms: {
      enabled: boolean;
      recipients: string[];
      message: string;
    };
    portal: {
      enabled: boolean;
      publish: boolean;
      category: string;
      accessLevel: 'public' | 'restricted' | 'private';
    };
    archive: {
      enabled: boolean;
      retention: number;
      location: 'local' | 'cloud' | 'both';
    };
    compliance: {
      enabled: boolean;
      authorities: string[];
      submissionDate?: string;
    };
  };
  completionStatus: {
    projectInfo: boolean;
    equipment: boolean;
    hazards: boolean;
    permits: boolean;
    validation: boolean;
  };
  supervisorSignature?: {
    signedBy: string;
    signedAt: string;
    signature: string;
    title: string;
  };
  metadata: {
    createdAt: string;
    completedAt?: string;
    version: string;
    lastModified: string;
    totalDuration?: number;
  };
  shareLink?: string;
  qrCode?: string;
  lockSettings: {
    isLocked: boolean;
    lockedBy?: string;
    lockedAt?: string;
    allowTeamView: boolean;
    requireApproval: boolean;
    autoLockAfterApproval: boolean;
  };
}

interface FinalizationStepProps {
  formData: any;
  onDataChange: (section: string, data: FinalizationData) => void;
  language: 'fr' | 'en';
  tenant: string;
}
export default function Step6Finalization({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: FinalizationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== ÉTAT PRINCIPAL ===================
  const [finalizationData, setFinalizationData] = useState<FinalizationData>({
    workers: [],
    shareRecipients: [],
    photos: [],
    finalComments: '',
    documentGeneration: {
      format: 'pdf',
      template: 'detailed',
      language: 'fr',
      includePhotos: true,
      includeSignatures: true,
      includeQRCode: true,
      branding: true,
      watermark: true,
      includeAllFields: true,
      onlyFilledFields: true
    },
    distribution: {
      email: {
        enabled: true,
        recipients: [],
        subject: `🛡️ AST - ${formData.projectInfo?.projectName || 'Nouveau projet'} - Consultation requise`,
        message: 'Bonjour,\n\nVeuillez consulter l\'Analyse Sécuritaire de Tâches ci-jointe.\n\nVotre consultation et approbation sont requises.\n\nMerci,\nÉquipe Sécurité',
        sendReminders: true,
        reminderInterval: 24
      },
      sms: {
        enabled: true,
        recipients: [],
        message: '🛡️ AST disponible pour consultation. Lien: [LINK]. Consultation requise avant travaux.'
      },
      portal: {
        enabled: true,
        publish: false,
        category: 'safety',
        accessLevel: 'restricted'
      },
      archive: {
        enabled: true,
        retention: 7,
        location: 'cloud'
      },
      compliance: {
        enabled: false,
        authorities: []
      }
    },
    completionStatus: {
      projectInfo: !!formData.projectInfo,
      equipment: !!(formData.equipment?.selected?.length),
      hazards: !!(formData.hazards?.selected?.length),
      permits: !!(formData.permits?.permits?.length),
      validation: !!formData.validation
    },
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0',
      lastModified: new Date().toISOString()
    },
    lockSettings: {
      isLocked: false,
      allowTeamView: true,
      requireApproval: true,
      autoLockAfterApproval: true
    },
    ...formData.finalization
  });

  // =================== ÉTATS SECONDAIRES ===================
  const [activeTab, setActiveTab] = useState<'workers' | 'sharing' | 'finalization'>('workers');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    company: '',
    hasConsented: false,
    approbationStatus: 'pending'
  });
  const [newRecipient, setNewRecipient] = useState<Partial<ShareRecipient>>({
    name: '',
    email: '',
    phone: '',
    method: 'email',
    role: 'worker',
    status: 'sent'
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLink, setShareLink] = useState(() => {
    // Générer le lien immédiatement à l'initialisation
    const baseUrl = `https://${tenant}.csecur360.com`;
    const astId = Math.random().toString(36).substr(2, 12).toUpperCase();
    const secureToken = Math.random().toString(36).substr(2, 16);
    return `${baseUrl}/ast/view/${astId}?token=${secureToken}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSharingAST, setIsSharingAST] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);

  // =================== EFFECTS ===================
  useEffect(() => {
    onDataChange('finalization', finalizationData);
  }, [finalizationData, onDataChange]);

  useEffect(() => {
    // Générer le lien de partage sécurisé IMMÉDIATEMENT
    const baseUrl = `https://${tenant}.csecur360.com`;
    const astId = Math.random().toString(36).substr(2, 12).toUpperCase();
    const secureToken = Math.random().toString(36).substr(2, 16);
    const link = `${baseUrl}/ast/view/${astId}?token=${secureToken}`;
    
    console.log('🔗 Lien généré:', link); // Debug
    
    setShareLink(link);
    setFinalizationData(prev => ({
      ...prev,
      shareLink: link
    }));
  }, [tenant]); // Supprimé la dépendance projectName

  // =================== HANDLERS WORKERS ===================
  const addWorker = () => {
    if (newWorker.name && newWorker.position) {
      const worker: Worker = {
        id: Math.random().toString(36).substr(2, 9),
        name: newWorker.name || '',
        position: newWorker.position || '',
        employeeId: newWorker.employeeId,
        company: newWorker.company || '',
        phone: newWorker.phone,
        email: newWorker.email,
        certifications: newWorker.certifications || [],
        experience: newWorker.experience || '',
        hasConsented: false,
        approbationStatus: 'pending',
        consultationTime: 0
      };
      
      setFinalizationData(prev => ({
        ...prev,
        workers: [...prev.workers, worker]
      }));
      
      setNewWorker({
        name: '',
        position: '',
        company: '',
        certifications: [],
        experience: '',
        hasConsented: false,
        approbationStatus: 'pending'
      });
      setShowAddWorker(false);
    }
  };

  const updateWorkerConsent = (workerId: string, consented: boolean) => {
    const now = new Date();
    const currentDate = now.toLocaleDateString('fr-CA');
    const currentTime = now.toLocaleTimeString('fr-CA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              hasConsented: consented,
              consentDate: consented ? currentDate : undefined,
              consentTime: consented ? currentTime : undefined,
              signature: consented ? `${worker.name} - ${currentDate} ${currentTime}` : undefined,
              digitalSignature: consented,
              lastAccessDate: consented ? now.toISOString() : worker.lastAccessDate,
              consultationTime: consented ? (worker.consultationTime || 0) + 5 : worker.consultationTime
            }
          : worker
      )
    }));
  };

  const updateWorkerApprobation = (workerId: string, status: 'approved' | 'rejected', comments?: string) => {
    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              approbationStatus: status,
              approbationComments: comments,
              lastAccessDate: new Date().toISOString()
            }
          : worker
      )
    }));
  };

  // =================== HANDLERS SHARING ===================
  const addRecipient = () => {
    if (newRecipient.name && newRecipient.email) {
      const recipient: ShareRecipient = {
        id: Math.random().toString(36).substr(2, 9),
        name: newRecipient.name || '',
        email: newRecipient.email || '',
        phone: newRecipient.phone,
        method: newRecipient.method || 'email',
        role: newRecipient.role || 'worker',
        status: 'sent'
      };
      
      setFinalizationData(prev => ({
        ...prev,
        shareRecipients: [...prev.shareRecipients, recipient]
      }));
      
      setNewRecipient({
        name: '',
        email: '',
        phone: '',
        method: 'email',
        role: 'worker',
        status: 'sent'
      });
      setShowAddRecipient(false);
    }
  };

  const shareASTWithTeam = async () => {
    setIsSharingAST(true);
    
    // Simulation d'envoi
    for (const recipient of finalizationData.shareRecipients) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFinalizationData(prev => ({
        ...prev,
        shareRecipients: prev.shareRecipients.map(r => 
          r.id === recipient.id 
            ? { ...r, status: 'sent', sentAt: new Date().toISOString() }
            : r
        )
      }));
    }
    
    setIsSharingAST(false);
    alert(`AST partagé avec ${finalizationData.shareRecipients.length} membres de l'équipe`);
  };

  // =================== HANDLERS PARTAGE SIMPLE ===================
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}`);
    const body = encodeURIComponent(`Bonjour,\n\nVoici le lien pour consulter l'Analyse Sécuritaire de Tâches :\n\n${shareLink}\n\nMerci,\nÉquipe Sécurité`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`🛡️ AST disponible: ${shareLink}`);
    window.open(`sms:?body=${message}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`🛡️ Analyse Sécuritaire de Tâches disponible: ${shareLink}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const printAST = () => {
    console.log('🖨️ Fonction imprimer déclenchée');
    
    // Créer contenu d'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .worker { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ Analyse Sécuritaire de Tâches</h1>
          <p><strong>Projet:</strong> ${formData.projectInfo?.projectName || 'N/A'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-CA')}</p>
          <p><strong>AST#:</strong> ${formData.astNumber || 'N/A'}</p>
        </div>
        
        <div class="section">
          <h2>👷 Équipe (${finalizationData.workers.length} travailleurs)</h2>
          ${finalizationData.workers.map(worker => `
            <div class="worker">
              <p><strong>${worker.name}</strong> - ${worker.position}</p>
              <p>Entreprise: ${worker.company}</p>
              <p>Consentement: ${worker.hasConsented ? '✅ Donné le ' + worker.consentDate + ' à ' + worker.consentTime : '❌ En attente'}</p>
              <p>Approbation: ${worker.approbationStatus === 'approved' ? '✅ Approuvé' : worker.approbationStatus === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>📊 Statistiques</h2>
          <p>Sections complétées: ${Math.round(completionPercentage)}%</p>
          <p>Consentements: ${consentedWorkers}/${totalWorkers}</p>
          <p>Approbations: ${approvedWorkers}/${totalWorkers}</p>
        </div>
        
        <div class="section">
          <h2>💬 Commentaires</h2>
          <p>${finalizationData.finalComments || 'Aucun commentaire'}</p>
        </div>
        
        <div class="section">
          <p><strong>Généré le:</strong> ${new Date().toLocaleString('fr-CA')}</p>
          <p><strong>Lien AST:</strong> ${shareLink}</p>
        </div>
      </body>
      </html>
    `;
    
    // Ouvrir fenêtre d'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      console.log('✅ Fenêtre d\'impression ouverte');
    } else {
      console.error('❌ Impossible d\'ouvrir la fenêtre d\'impression');
      alert('Impossible d\'ouvrir l\'impression. Vérifiez que les popups sont autorisés.');
    }
  };

  // =================== HANDLERS DOCUMENT & LOCK ===================
  const generateFullReport = async () => {
    setIsGenerating(true);
    
    // Compilation de toutes les sections remplies
    const reportSections = [];
    
    if (formData.projectInfo && finalizationData.documentGeneration.includeAllFields) {
      reportSections.push('Informations Projet');
    }
    if (formData.equipment?.selected?.length && finalizationData.documentGeneration.includeAllFields) {
      reportSections.push('Équipements & EPI');
    }
    if (formData.hazards?.selected?.length && finalizationData.documentGeneration.includeAllFields) {
      reportSections.push('Dangers & Contrôles');
    }
    if (formData.permits?.permits?.length && finalizationData.documentGeneration.includeAllFields) {
      reportSections.push('Permis & Autorisations');
    }
    if (formData.validation && finalizationData.documentGeneration.includeAllFields) {
      reportSections.push('Validation Équipe');
    }
    
    // Simulation génération
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    alert(`Rapport complet généré avec ${reportSections.length} sections`);
  };

  const toggleLock = () => {
    if (finalizationData.lockSettings.isLocked) {
      // Déverrouiller
      setFinalizationData(prev => ({
        ...prev,
        lockSettings: {
          ...prev.lockSettings,
          isLocked: false,
          lockedBy: undefined,
          lockedAt: undefined
        }
      }));
    } else {
      // Verrouiller
      setShowLockConfirm(true);
    }
  };

  const confirmLock = () => {
    setFinalizationData(prev => ({
      ...prev,
      lockSettings: {
        ...prev.lockSettings,
        isLocked: true,
        lockedBy: 'Superviseur Actuel',
        lockedAt: new Date().toISOString()
      }
    }));
    setShowLockConfirm(false);
  };

  // =================== COMPUTED VALUES ===================
  const completionPercentage = Object.values(finalizationData.completionStatus).filter(Boolean).length / 
                               Object.values(finalizationData.completionStatus).length * 100;

  const consentedWorkers = finalizationData.workers.filter(w => w.hasConsented).length;
  const approvedWorkers = finalizationData.workers.filter(w => w.approbationStatus === 'approved').length;
  const totalWorkers = finalizationData.workers.length;
  const allWorkersConsented = totalWorkers > 0 && consentedWorkers === totalWorkers;
  const allWorkersApproved = totalWorkers > 0 && approvedWorkers === totalWorkers;

  const sharedCount = finalizationData.shareRecipients.filter(r => r.status !== 'sent').length;
  const viewedCount = finalizationData.shareRecipients.filter(r => ['viewed', 'approved', 'rejected'].includes(r.status)).length;
  const approvedCount = finalizationData.shareRecipients.filter(r => r.status === 'approved').length;

  const isReadyToPublish = completionPercentage === 100 && 
                          allWorkersConsented && 
                          allWorkersApproved &&
                          (finalizationData.distribution.email.enabled || 
                           finalizationData.distribution.portal.enabled ||
                           finalizationData.distribution.archive.enabled);
  return (
    <>
      {/* CSS Premium Step 6 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step6-container { padding: 0; background: #f8fafc; min-height: 100vh; }
          .finalization-header { text-align: center; margin-bottom: 32px; padding: 32px 20px; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 20px; color: white; }
          .header-icon { width: 64px; height: 64px; margin: 0 auto 16px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .header-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header-subtitle { font-size: 16px; opacity: 0.9; }
          .premium-tabs { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 4px; margin-bottom: 24px; }
          .tab-button { flex: 1; padding: 12px 20px; border-radius: 12px; font-weight: 600; transition: all 0.3s; text-align: center; position: relative; overflow: hidden; border: none; cursor: pointer; }
          .tab-button.active { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
          .tab-button:not(.active) { color: #94a3b8; background: transparent; }
          .tab-button:not(.active):hover { background: rgba(148,163,184,0.1); color: white; }
          .finalization-section { background: white; border: none; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
          .premium-button { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
          .premium-button:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.3); }
          .premium-button.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
          .premium-button.success:hover { box-shadow: 0 8px 25px rgba(16,185,129,0.3); }
          .premium-button.danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
          .premium-button.danger:hover { box-shadow: 0 8px 25px rgba(239,68,68,0.3); }
          .premium-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
          .worker-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; position: relative; overflow: hidden; }
          .worker-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b); }
          .worker-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid; }
          .status-pending { background: #fef3cd; color: #92400e; border-color: #f59e0b; }
          .status-consented { background: #d1fae5; color: #065f46; border-color: #10b981; }
          .status-approved { background: #dbeafe; color: #1e40af; border-color: #3b82f6; }
          .status-rejected { background: #fee2e2; color: #991b1b; border-color: #ef4444; }
          .consent-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px; }
          .signature-display { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 12px; margin-top: 8px; font-family: monospace; font-size: 12px; color: #059669; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .stat-card { text-align: center; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
          .stat-value { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
          .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }
          .stat-green { color: #10b981; }
          .stat-blue { color: #3b82f6; }
          .stat-orange { color: #f59e0b; }
          .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 16px 0; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; }
          .lock-banner { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
          .share-recipient { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
          .form-field { margin-bottom: 16px; }
          .form-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
          .form-input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color 0.3s; }
          .form-input:focus { outline: none; border-color: #3b82f6; }
          .form-select { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
          .form-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical; }
          .checkbox-field { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s; background: white !important; }
          .checkbox-field:hover { border-color: #3b82f6; background: #f8fafc !important; }
          .checkbox-field.checked { border-color: #10b981; background: #f0fdf4 !important; }
          .checkbox-field span { color: #1f2937 !important; font-weight: 500 !important; font-size: 14px !important; }
          .form-input, .form-select, .form-textarea { background: white !important; color: #1f2937 !important; border: 2px solid #d1d5db; }
          .form-label { color: #374151 !important; font-weight: 600 !important; }
          .section-title { color: #111827 !important; font-weight: 700 !important; }
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .premium-tabs { flex-direction: column; }
            .tab-button { margin-bottom: 4px; }
          }
        `
      }} />

      <div className="step6-container">
        {/* Header */}
        <div className="finalization-header">
          <div className="header-icon">
            <Award size={32} />
          </div>
          <h2 className="header-title">🏆 Finalisation Premium</h2>
          <p className="header-subtitle">Consentement équipe, partage sécurisé et rapport complet</p>
        </div>

        {/* Lock Status Banner */}
        {finalizationData.lockSettings.isLocked && (
          <div className="lock-banner">
            <Lock size={24} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                🔒 AST Verrouillé
              </h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                Verrouillé par {finalizationData.lockSettings.lockedBy} le {finalizationData.lockSettings.lockedAt ? new Date(finalizationData.lockSettings.lockedAt).toLocaleDateString('fr-CA') : ''}
                {finalizationData.lockSettings.allowTeamView && ' • Consultation équipe autorisée'}
              </p>
            </div>
            <button
              onClick={toggleLock}
              className="premium-button danger"
              style={{ marginLeft: 'auto' }}
            >
              <Lock size={16} />
              Déverrouiller
            </button>
          </div>
        )}

        {/* Premium Tabs */}
        <div className="premium-tabs">
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('workers')}
              className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
            >
              <HardHat size={18} style={{ marginBottom: '4px' }} />
              <div>Équipe Chantier</div>
            </button>
            <button
              onClick={() => setActiveTab('sharing')}
              className={`tab-button ${activeTab === 'sharing' ? 'active' : ''}`}
            >
              <Share2 size={18} style={{ marginBottom: '4px' }} />
              <div>Partage Équipe</div>
            </button>
            <button
              onClick={() => setActiveTab('finalization')}
              className={`tab-button ${activeTab === 'finalization' ? 'active' : ''}`}
            >
              <Crown size={18} style={{ marginBottom: '4px' }} />
              <div>Finalisation</div>
            </button>
          </div>
        </div>

        {/* ONGLET 1: ÉQUIPE CHANTIER */}
        {activeTab === 'workers' && (
          <div>
            {/* Stats Travailleurs */}
            <div className="finalization-section">
              <h3 className="section-title">
                <BarChart3 size={24} />
                Statistiques Équipe
              </h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value stat-blue">{totalWorkers}</div>
                  <div className="stat-label">Total Travailleurs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value stat-green">{consentedWorkers}</div>
                  <div className="stat-label">Consentements</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value stat-orange">{approvedWorkers}</div>
                  <div className="stat-label">Approbations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalWorkers > 0 ? Math.round((approvedWorkers / totalWorkers) * 100) : 0}%</div>
                  <div className="stat-label">Taux Approbation</div>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${totalWorkers > 0 ? (approvedWorkers / totalWorkers) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Gestion Travailleurs */}
            <div className="finalization-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title">
                  <Users size={24} />
                  Travailleurs sur le Chantier
                </h3>
                <button
                  onClick={() => setShowAddWorker(true)}
                  className="premium-button"
                  disabled={finalizationData.lockSettings.isLocked}
                >
                  <UserPlus size={18} />
                  Ajouter Travailleur
                </button>
              </div>

              {/* Liste Travailleurs */}
              <div>
                {finalizationData.workers.map((worker, index) => (
                  <div key={worker.id} className="worker-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {worker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                            {worker.name}
                          </h4>
                          <p style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#64748b' }}>
                            {worker.position} • {worker.company}
                          </p>
                          {worker.employeeId && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                              #{worker.employeeId}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`worker-status ${
                          worker.approbationStatus === 'approved' ? 'status-approved' :
                          worker.approbationStatus === 'rejected' ? 'status-rejected' :
                          worker.hasConsented ? 'status-consented' : 'status-pending'
                        }`}>
                          {worker.approbationStatus === 'approved' ? '✅ Approuvé' :
                           worker.approbationStatus === 'rejected' ? '❌ Rejeté' :
                           worker.hasConsented ? '📋 Consenti' : '⏳ En attente'}
                        </span>
                        <button
                          onClick={() => setFinalizationData(prev => ({
                            ...prev,
                            workers: prev.workers.filter(w => w.id !== worker.id)
                          }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          disabled={finalizationData.lockSettings.isLocked}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Section Consentement */}
                    <div className="consent-section">
                      <div 
                        className={`checkbox-field ${worker.hasConsented ? 'checked' : ''}`}
                        onClick={() => !finalizationData.lockSettings.isLocked && updateWorkerConsent(worker.id, !worker.hasConsented)}
                      >
                        <input
                          type="checkbox"
                          checked={worker.hasConsented}
                          onChange={() => {}}
                          disabled={finalizationData.lockSettings.isLocked}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            📋 Je consens avoir lu l'AST
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            Je consens avoir lu l'Analyse Sécuritaire de Tâches et accepte de suivre toutes les procédures de sécurité
                          </div>
                        </div>
                      </div>

                      {worker.hasConsented && (
                        <div className="signature-display">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <CheckCircle size={16} />
                            <strong>Consentement enregistré automatiquement</strong>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '11px' }}>
                            <div>📅 Date: {worker.consentDate}</div>
                            <div>🕐 Heure: {worker.consentTime}</div>
                            <div>⏱️ Consultation: {worker.consultationTime || 0}min</div>
                          </div>
                          <div style={{ marginTop: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '4px' }}>
                            🖊️ {worker.signature}
                          </div>
                        </div>
                      )}

                      {/* Section Approbation */}
                      {worker.hasConsented && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                            🎯 Approbation AST
                          </h5>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <button
                              onClick={() => updateWorkerApprobation(worker.id, 'approved')}
                              className="premium-button success"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              disabled={finalizationData.lockSettings.isLocked}
                            >
                              <CheckCircle size={14} />
                              Approuver
                            </button>
                            <button
                              onClick={() => updateWorkerApprobation(worker.id, 'rejected', 'Modifications requises')}
                              className="premium-button danger"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              disabled={finalizationData.lockSettings.isLocked}
                            >
                              <X size={14} />
                              Rejeter
                            </button>
                          </div>
                          {worker.approbationComments && (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                              💬 {worker.approbationComments}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {finalizationData.workers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <Users size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
                    <p>Aucun travailleur ajouté pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ONGLET 2: PARTAGE SIMPLE */}
        {activeTab === 'sharing' && (
          <div>
            {/* Partage Simple AST */}
            <div className="finalization-section">
              <h3 className="section-title">
                <Share2 size={24} />
                📡 Partage Simple AST
              </h3>
              
              {/* Lien de partage CORRIGÉ */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ color: '#374151', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  🔗 Lien de partage AST :
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={shareLink || 'Génération du lien...'}
                    readOnly
                    className="form-input"
                    style={{ 
                      fontSize: '12px', 
                      fontFamily: 'monospace',
                      background: '#f8fafc !important',
                      color: '#1f2937 !important',
                      border: '2px solid #e2e8f0',
                      padding: '12px'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (shareLink) {
                        navigator.clipboard.writeText(shareLink);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                        console.log('📋 Lien copié:', shareLink);
                      }
                    }}
                    className="premium-button"
                    disabled={!shareLink}
                  >
                    {copySuccess ? '✅' : '📋'}
                  </button>
                </div>
                {copySuccess && (
                  <p style={{ color: '#10b981', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                    ✅ Lien copié dans le presse-papier !
                  </p>
                )}
                {!shareLink && (
                  <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ Génération du lien en cours...
                  </p>
                )}
              </div>
              
              {/* Boutons partage direct */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <button onClick={shareViaEmail} className="premium-button">
                  <Mail size={16} />
                  📧 Email
                </button>
                <button onClick={shareViaSMS} className="premium-button">
                  <MessageSquare size={16} />
                  📱 SMS
                </button>
                <button onClick={shareViaWhatsApp} className="premium-button success">
                  <Phone size={16} />
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
                    window.open(url, '_blank');
                  }}
                  className="premium-button"
                  style={{ background: '#1877f2' }}
                >
                  <Globe size={16} />
                  📘 Facebook
                </button>
              </div>
              
              {/* Instructions */}
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                background: '#f0f9ff', 
                border: '1px solid #0ea5e9', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '16px' }}>
                  ℹ️ Comment partager l'AST :
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#075985' }}>
                  <li>📧 <strong>Email</strong> : Ouvre votre client email avec le lien</li>
                  <li>📱 <strong>SMS</strong> : Ouvre l'app SMS avec le message</li>
                  <li>💬 <strong>WhatsApp</strong> : Partage directement sur WhatsApp</li>
                  <li>📘 <strong>Facebook</strong> : Publie le lien sur Facebook</li>
                  <li>📋 <strong>Copier</strong> : Copiez le lien pour l'utiliser ailleurs</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 3: FINALISATION */}
        {activeTab === 'finalization' && (
          <div>
            {/* État de Complétion Globale */}
            <div className="finalization-section">
              <h3 className="section-title">
                <Target size={24} />
                🎯 État de Complétion Globale
              </h3>
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {Object.entries(finalizationData.completionStatus).map(([section, completed]) => (
                  <div key={section} style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${completed ? '#10b981' : '#f59e0b'}`,
                    background: completed ? '#ecfdf5' : '#fef3cd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {completed ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="#f59e0b" />}
                    <span style={{ fontSize: '14px', fontWeight: '500', color: completed ? '#059669' : '#92400e' }}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Génération Rapport Complet */}
            <div className="finalization-section">
              <h3 className="section-title">
                <FileText size={24} />
                📄 Génération Rapport Complet AST
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeAllFields ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeAllFields: !prev.documentGeneration.includeAllFields }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.includeAllFields}
                    onChange={() => {}}
                  />
                  <span>📄 Inclure toutes les sections</span>
                </div>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.onlyFilledFields ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, onlyFilledFields: !prev.documentGeneration.onlyFilledFields }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.onlyFilledFields}
                    onChange={() => {}}
                  />
                  <span>✅ Seulement champs remplis</span>
                </div>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includePhotos ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includePhotos: !prev.documentGeneration.includePhotos }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.includePhotos}
                    onChange={() => {}}
                  />
                  <span>📸 Inclure photos</span>
                </div>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeSignatures ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeSignatures: !prev.documentGeneration.includeSignatures }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.includeSignatures}
                    onChange={() => {}}
                  />
                  <span>✍️ Inclure signatures</span>
                </div>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeQRCode ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeQRCode: !prev.documentGeneration.includeQRCode }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.includeQRCode}
                    onChange={() => {}}
                  />
                  <span>📱 Inclure Code QR</span>
                </div>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.branding ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, branding: !prev.documentGeneration.branding }
                  }))}
                >
                  <input 
                    type="checkbox" 
                    checked={finalizationData.documentGeneration.branding}
                    onChange={() => {}}
                  />
                  <span>🏢 Branding entreprise</span>
                </div>
              </div>

              <button
                onClick={generateFullReport}
                className="premium-button success"
                style={{ width: '100%' }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Génération du rapport complet...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    📊 Générer Rapport Complet AST
                  </>
                )}
              </button>
            </div>

            {/* Commentaires Finaux */}
            <div className="finalization-section">
              <h3 className="section-title">
                <MessageSquare size={24} />
                💬 Commentaires Finaux
              </h3>
              
              <textarea
                value={finalizationData.finalComments}
                onChange={(e) => setFinalizationData(prev => ({ ...prev, finalComments: e.target.value }))}
                className="form-textarea"
                placeholder="Ajoutez vos commentaires finaux sur cette AST..."
                rows={4}
                disabled={finalizationData.lockSettings.isLocked}
              />
            </div>

            {/* Système de Verrouillage Premium */}
            <div className="finalization-section">
              <h3 className="section-title">
                <Lock size={24} />
                🔐 Système de Verrouillage Premium
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="checkbox-field">
                  <input 
                    type="checkbox" 
                    checked={finalizationData.lockSettings.allowTeamView}
                    onChange={(e) => setFinalizationData(prev => ({
                      ...prev,
                      lockSettings: { ...prev.lockSettings, allowTeamView: e.target.checked }
                    }))}
                  />
                  <span>👁️ Permettre consultation équipe</span>
                </div>
                <div className="checkbox-field">
                  <input 
                    type="checkbox" 
                    checked={finalizationData.lockSettings.requireApproval}
                    onChange={(e) => setFinalizationData(prev => ({
                      ...prev,
                      lockSettings: { ...prev.lockSettings, requireApproval: e.target.checked }
                    }))}
                  />
                  <span>✅ Requérir approbation</span>
                </div>
                <div className="checkbox-field">
                  <input 
                    type="checkbox" 
                    checked={finalizationData.lockSettings.autoLockAfterApproval}
                    onChange={(e) => setFinalizationData(prev => ({
                      ...prev,
                      lockSettings: { ...prev.lockSettings, autoLockAfterApproval: e.target.checked }
                    }))}
                  />
                  <span>🔐 Verrouillage auto après approbation</span>
                </div>
              </div>

              <button
                onClick={toggleLock}
                className={`premium-button ${finalizationData.lockSettings.isLocked ? 'danger' : 'success'}`}
                style={{ width: '100%' }}
                disabled={!isReadyToPublish && !finalizationData.lockSettings.isLocked}
              >
                {finalizationData.lockSettings.isLocked ? (
                  <>
                    <Lock size={18} />
                    🔓 Déverrouiller AST
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    🔒 Verrouiller & Finaliser AST
                  </>
                )}
              </button>
            </div>

            {/* Actions Finales CORRIGÉES */}
            <div className="finalization-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <button 
                  onClick={() => {
                    console.log('💾 Sauvegarde déclenchée');
                    alert('AST sauvegardé avec succès !');
                  }}
                  className="premium-button"
                >
                  <Save size={18} />
                  💾 Sauvegarder
                </button>
                
                <button 
                  onClick={printAST}
                  className="premium-button"
                >
                  <Printer size={18} />
                  🖨️ Imprimer
                </button>
                
                <button 
                  onClick={() => {
                    console.log('📂 Archivage déclenchée');
                    alert('AST archivé avec succès !');
                  }}
                  className="premium-button"
                >
                  <Archive size={18} />
                  📂 Archiver
                </button>
                
                <button 
                  onClick={() => {
                    console.log('✨ Publication finale déclenchée');
                    if (isReadyToPublish) {
                      alert('AST publié avec succès !');
                    }
                  }}
                  className="premium-button success"
                  disabled={!isReadyToPublish}
                >
                  <Sparkles size={18} />
                  ✨ Publier Final
                </button>
              </div>

              {!isReadyToPublish && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fef3cd',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  <span style={{ fontSize: '14px', color: '#92400e' }}>
                    ⚠️ Complétez toutes les sections et obtenez tous les consentements avant la publication finale.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALS */}
        
        {/* Modal Ajout Travailleur SIMPLIFIÉ */}
        {showAddWorker && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                👷 Ajouter Travailleur
              </h4>
              
              {/* SEULEMENT 2 CHAMPS REQUIS */}
              <div className="form-field">
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  value={newWorker.name || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Ex: Jean Tremblay"
                  style={{ fontSize: '16px', padding: '14px' }}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Entreprise *</label>
                <input
                  type="text"
                  value={newWorker.company || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, company: e.target.value }))}
                  className="form-input"
                  placeholder="Ex: Entreprise ABC Inc."
                  style={{ fontSize: '16px', padding: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    if (newWorker.name && newWorker.company) {
                      const worker = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: newWorker.name,
                        position: 'Travailleur', // Valeur par défaut
                        employeeId: '',
                        company: newWorker.company,
                        phone: '',
                        email: '',
                        certifications: [],
                        experience: '',
                        hasConsented: false,
                        approbationStatus: 'pending' as const,
                        consultationTime: 0
                      };
                      
                      setFinalizationData(prev => ({
                        ...prev,
                        workers: [...prev.workers, worker]
                      }));
                      
                      setNewWorker({ name: '', company: '', hasConsented: false, approbationStatus: 'pending' });
                      setShowAddWorker(false);
                    }
                  }}
                  className="premium-button success"
                  style={{ flex: 1, padding: '16px', fontSize: '16px' }}
                  disabled={!newWorker.name || !newWorker.company}
                >
                  ✅ Ajouter
                </button>
                <button
                  onClick={() => setShowAddWorker(false)}
                  className="premium-button"
                  style={{ flex: 1, background: '#6b7280', padding: '16px', fontSize: '16px' }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ajout Destinataire */}
        {showAddRecipient && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                📧 Ajouter Destinataire Partage
              </h4>
              
              <div className="form-field">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  value={newRecipient.name || ''}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Nom du destinataire"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={newRecipient.email || ''}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder="email@entreprise.com"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Téléphone (optionnel)</label>
                <input
                  type="tel"
                  value={newRecipient.phone || ''}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                  placeholder="(514) 123-4567"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label className="form-label">Rôle</label>
                  <select
                    value={newRecipient.role || 'worker'}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, role: e.target.value as any }))}
                    className="form-select"
                  >
                    <option value="worker">👷 Travailleur</option>
                    <option value="supervisor">👨‍💼 Superviseur</option>
                    <option value="manager">🎖️ Gestionnaire</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label className="form-label">Méthode d'envoi</label>
                  <select
                    value={newRecipient.method || 'email'}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, method: e.target.value as any }))}
                    className="form-select"
                  >
                    <option value="email">📧 Email seulement</option>
                    <option value="sms">📱 SMS seulement</option>
                    <option value="both">📧📱 Email + SMS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={addRecipient}
                  className="premium-button success"
                  style={{ flex: 1 }}
                  disabled={!newRecipient.name || !newRecipient.email}
                >
                  ✅ Ajouter
                </button>
                <button
                  onClick={() => setShowAddRecipient(false)}
                  className="premium-button"
                  style={{ flex: 1, background: '#6b7280' }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmation Verrouillage */}
        {showLockConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                🔒 Confirmer le Verrouillage
              </h4>
              
              <div style={{ 
                background: '#fee2e2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={20} color="#dc2626" />
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>Attention</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
                  Une fois verrouillé, l'AST ne pourra plus être modifié. Assurez-vous que toutes les informations sont correctes et complètes.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                  ✅ Vérifications finales:
                </h5>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {completionPercentage === 100 ? <CheckCircle size={16} color="#10b981" /> : <X size={16} color="#ef4444" />}
                    <span style={{ fontSize: '14px' }}>Toutes les sections complétées ({Math.round(completionPercentage)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {allWorkersConsented ? <CheckCircle size={16} color="#10b981" /> : <X size={16} color="#ef4444" />}
                    <span style={{ fontSize: '14px' }}>Tous les travailleurs ont consenti ({consentedWorkers}/{totalWorkers})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {allWorkersApproved ? <CheckCircle size={16} color="#10b981" /> : <X size={16} color="#ef4444" />}
                    <span style={{ fontSize: '14px' }}>Tous les travailleurs ont approuvé ({approvedWorkers}/{totalWorkers})</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={confirmLock}
                  className="premium-button danger"
                  style={{ flex: 1 }}
                  disabled={!isReadyToPublish}
                >
                  🔒 Confirmer Verrouillage
                </button>
                <button
                  onClick={() => setShowLockConfirm(false)}
                  className="premium-button"
                  style={{ flex: 1, background: '#6b7280' }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSS Animation pour spin */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    </>
  );
}
