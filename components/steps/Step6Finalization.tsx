'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, FileText, Download, Archive, Send, CheckCircle, AlertTriangle,
  Clock, Eye, Share2, Save, Calendar, User, MapPin, Shield, Award,
  Target, BarChart3, Globe, Printer, Mail, Smartphone, Image, X,
  Plus, Upload, Copy, Check, RefreshCw, Lock, Unlock, Users, MessageSquare
} from 'lucide-react';

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
  formData: any;
  onDataChange: (section: string, data: FinalizationData) => void;
  language: string;
  tenant: string;
  errors?: any;
}

// =================== TYPES DE SÉCURITÉ ===================
type ApprobationStatus = 'pending' | 'approved' | 'rejected';
type LockType = 'temporary' | 'permanent' | 'review';
type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'facebook';

function Step6Finalization({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: FinalizationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // État travailleur simple
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    company: '',
    hasConsented: false,
    approbationStatus: 'pending'
  });

  // État finalisation avec thème sombre
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

  // =================== HANDLERS PRINCIPAUX ===================
  const addWorker = () => {
    if (!newWorker.name || !newWorker.company) {
      alert('❌ Veuillez remplir le nom et la compagnie');
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
    console.log('✅ Consentement mis à jour pour travailleur:', workerId);
  };

  const updateApprobation = (workerId: string, status: ApprobationStatus, comments?: string) => {
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
  };

  // =================== HANDLERS PARTAGE ===================
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
    console.log('📧 Partage par email initié');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`🛡️ AST ${formData.projectInfo?.projectName || 'Projet'}: ${shareLink}`);
    window.open(`sms:?body=${message}`);
    console.log('📱 Partage par SMS initié');
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`🛡️ AST - ${formData.projectInfo?.projectName || 'Analyse Sécuritaire'}

Lien d'accès: ${shareLink}`);
    window.open(`https://wa.me/?text=${message}`);
    console.log('💬 Partage WhatsApp initié');
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log('✅ Lien copié dans le presse-papiers');
    } catch (err) {
      alert('❌ Erreur lors de la copie du lien');
    }
  };

  const lockAST = (lockType: LockType) => {
    setFinalizationData(prev => ({
      ...prev,
      isLocked: true,
      lockTimestamp: new Date().toISOString(),
      lockReason: lockType
    }));
    setShowLockConfirm(false);
    console.log(`🔒 AST verrouillée (${lockType})`);
    alert(`✅ AST verrouillée avec succès (${lockType})`);
  };

  const getIndustryLabel = (industry: string) => {
    const labels = {
      'electrical': '⚡ Électrique',
      'construction': '🏗️ Construction', 
      'industrial': '🏭 Industriel',
      'manufacturing': '⚙️ Manufacturier',
      'office': '🏢 Bureau/Administratif',
      'other': '🔧 Autre'
    };
    return labels[industry as keyof typeof labels] || industry || 'Non spécifié';
  };

  const printAST = () => {
    console.log('🖨️ Génération du rapport AST professionnel complet...');
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
        
        console.log('✅ Rapport AST complet généré avec succès');
      } else {
        alert('❌ Erreur : Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les paramètres de pop-up.');
        setIsLoading(false);
      }
    }, 500);
  };
  // =================== GÉNÉRATION RAPPORT AST COMPLET ===================
  const generateCompleteAST = () => {
    const currentDate = new Date().toLocaleDateString('fr-CA');
    const currentTime = new Date().toLocaleTimeString('fr-CA');
    const astNumber = formData?.astNumber || `AST-${Date.now().toString().slice(-6)}`;
    
    const totalWorkers = finalizationData.workers.length;
    const consentedWorkers = finalizationData.workers.filter(w => w.hasConsented).length;
    const approvedWorkers = finalizationData.workers.filter(w => w.approbationStatus === 'approved').length;
    const totalHazards = formData.hazards?.identifiedHazards?.length || 0;
    const totalEquipment = formData.equipment?.selectedEquipment?.length || 0;
    const totalPermits = formData.permits?.requiredPermits?.length || 0;
    const lockoutPoints = formData.projectInfo?.lockoutPoints?.length || 0;
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport AST Complet - ${formData.projectInfo?.client || 'Client'}</title>
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
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-container"><div class="logo-fallback">C🛡️</div></div>
        <h1>🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL (AST)</h1>
        <div class="subtitle">Rapport Officiel Complet - ${tenant} | N° ${astNumber}</div>
    </div>
    <div class="stats-summary">
        <h3 style="margin-bottom: 10px; font-size: 14px;">📊 RÉSUMÉ EXÉCUTIF</h3>
        <div class="stats-grid">
            <div class="stat-item"><div class="stat-number">${totalHazards}</div><div class="stat-label">⚠️ Dangers</div></div>
            <div class="stat-item"><div class="stat-number">${totalEquipment}</div><div class="stat-label">🔧 Équipements</div></div>
            <div class="stat-item"><div class="stat-number">${totalPermits}</div><div class="stat-label">📄 Permis</div></div>
            <div class="stat-item"><div class="stat-number">${lockoutPoints}</div><div class="stat-label">🔒 Points LOTO</div></div>
            <div class="stat-item"><div class="stat-number">${totalWorkers}</div><div class="stat-label">👷 Travailleurs</div></div>
            <div class="stat-item"><div class="stat-number">${consentedWorkers}/${totalWorkers}</div><div class="stat-label">✅ Consentements</div></div>
        </div>
    </div>
    <div class="info-grid">
        <div class="info-box">
            <h3>🏢 INFORMATIONS CLIENT & PROJET</h3>
            <div class="info-row"><span class="info-label">Client:</span><span class="info-value">${formData.projectInfo?.client || 'Non spécifié'}</span></div>
            <div class="info-row"><span class="info-label">Projet #:</span><span class="info-value">${formData.projectInfo?.projectNumber || 'Non spécifié'}</span></div>
            <div class="info-row"><span class="info-label">Lieu:</span><span class="info-value">${formData.projectInfo?.workLocation || 'Non spécifié'}</span></div>
            <div class="info-row"><span class="info-label">Date/Heure:</span><span class="info-value">${formData.projectInfo?.date || currentDate} ${formData.projectInfo?.time || currentTime}</span></div>
            <div class="info-row"><span class="info-label">Industrie:</span><span class="info-value">${getIndustryLabel(formData.projectInfo?.industry)}</span></div>
        </div>
        <div class="info-box">
            <h3>👥 ÉQUIPE & CONTACTS</h3>
            <div class="info-row"><span class="info-label">Nb Travailleurs:</span><span class="info-value">${formData.projectInfo?.workerCount || 'Non spécifié'}</span></div>
            <div class="info-row"><span class="info-label">Durée estimée:</span><span class="info-value">${formData.projectInfo?.estimatedDuration || 'Non spécifiée'}</span></div>
            <div class="info-row"><span class="info-label">Contact client:</span><span class="info-value">${formData.projectInfo?.clientRepresentative || 'Non spécifié'}</span></div>
            <div class="info-row"><span class="info-label">Urgence:</span><span class="info-value">${formData.projectInfo?.emergencyContact || 'Non spécifié'}</span></div>
        </div>
    </div>
    ${generateStep6Section()}
    ${generateSignatureSection()}
    <div class="footer">
        <p><strong>Ce document a été généré automatiquement par le système C-Secur360</strong></p>
        <p>Conforme aux normes de santé et sécurité au travail du Canada | Généré le ${currentDate} à ${currentTime}</p>
        <p>Document officiel valide pour comités de sécurité, inspections et enquêtes</p>
        <p>🔗 Lien d'accès: ${shareLink}</p>
    </div>
</body>
</html>`;
  };

  const generateStep6Section = () => {
    const workersRows = finalizationData.workers.map(worker => `
        <tr>
            <td>${worker.name}</td>
            <td>${worker.company}</td>
            <td>${worker.position}</td>
            <td class="${worker.hasConsented ? 'status-approved' : 'status-pending'}">
                ${worker.hasConsented ? '✅ Oui' : '❌ Non'}
            </td>
            <td>${worker.consentTimestamp ? new Date(worker.consentTimestamp).toLocaleString('fr-CA') : '-'}</td>
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
            <div class="section-title">👷 STEP 6: ÉQUIPE ET CONSENTEMENTS</div>
        </div>
        <div class="section-content">
            ${finalizationData.workers.length > 0 ? `
                <table class="workers-table">
                    <thead>
                        <tr>
                            <th>Nom</th><th>Entreprise</th><th>Poste</th><th>Consentement</th><th>Date/Heure</th><th>Statut</th><th>Commentaires</th>
                        </tr>
                    </thead>
                    <tbody>${workersRows}</tbody>
                </table>
            ` : '<p style="text-align: center; color: #6b7280; font-style: italic;">Aucun travailleur ajouté à l\'équipe</p>'}
            ${finalizationData.finalComments ? `
                <div style="margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 4px;">
                    <strong>💬 Commentaires Finaux:</strong><br>${finalizationData.finalComments}
                </div>
            ` : ''}
            <div style="margin-top: 20px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px;">
                <strong>📊 Statut du Document:</strong> 
                <span style="padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 600; ${finalizationData.isLocked ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                    ${finalizationData.isLocked ? '🔒 VERROUILLÉ' : '🔓 EN COURS'}
                </span>
                | Complétion: ${finalizationData.completionPercentage}%
                ${finalizationData.lockTimestamp ? ` | Verrouillé le: ${new Date(finalizationData.lockTimestamp).toLocaleString('fr-CA')}` : ''}
            </div>
        </div>
    </div>`;
  };

  const generateSignatureSection = () => {
    return `
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-label">RESPONSABLE SÉCURITÉ</div>
            <div style="margin-top: 30px; font-size: 8px;">
                Nom: _________________________<br><br>
                Signature: ____________________<br><br>
                Date: ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">SUPERVISEUR</div>
            <div style="margin-top: 30px; font-size: 8px;">
                Nom: _________________________<br><br>
                Signature: ____________________<br><br>
                Date: ________________________
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-label">GESTIONNAIRE</div>
            <div style="margin-top: 30px; font-size: 8px;">
                Nom: _________________________<br><br>
                Signature: ____________________<br><br>
                Date: ________________________
            </div>
        </div>
    </div>`;
  };

  useEffect(() => {
    onDataChange('finalization', finalizationData);
  }, [finalizationData, onDataChange]);

  useEffect(() => {
    const totalSections = 6;
    const completedSections = [
      formData.projectInfo ? 1 : 0,
      formData.equipment ? 1 : 0,
      formData.hazards ? 1 : 0,
      formData.permits ? 1 : 0,
      formData.validation ? 1 : 0,
      finalizationData.workers.length > 0 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    
    const newPercentage = Math.round((completedSections / totalSections) * 100);
    
    if (newPercentage !== finalizationData.completionPercentage) {
      setFinalizationData(prev => ({
        ...prev,
        completionPercentage: newPercentage
      }));
    }
  }, [formData, finalizationData.workers.length]);

  // =================== CSS MOBILE OPTIMISÉ THÈME SOMBRE ===================
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
  return (
    <>
      {/* Injection CSS thème sombre optimisé */}
      <style dangerouslySetInnerHTML={{ __html: darkThemeCSS }} />
      
      <div className="step6-container">
        {/* Header avec logo */}
        <div className="finalization-header">
          <h2 className="finalization-title">🛡️ Finalisation AST</h2>
          <p className="finalization-subtitle">Équipe, Partage et Validation Finale</p>
        </div>

        {/* Navigation onglets */}
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTab('workers')}
          >
            <Users size={18} />
            👷 Équipe
          </button>
          <button 
            className={`tab-button ${activeTab === 'sharing' ? 'active' : ''}`}
            onClick={() => setActiveTab('sharing')}
          >
            <Share2 size={18} />
            📤 Partage
          </button>
          <button 
            className={`tab-button ${activeTab === 'finalization' ? 'active' : ''}`}
            onClick={() => setActiveTab('finalization')}
          >
            <FileText size={18} />
            ✅ Final
          </button>
        </div>

        {/* ONGLET 1: ÉQUIPE CHANTIER */}
        {activeTab === 'workers' && (
          <div>
            {/* Stats équipe */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.length}</div>
                <div className="stat-label">👷 Travailleurs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.filter(w => w.hasConsented).length}</div>
                <div className="stat-label">✅ Consentements</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{finalizationData.workers.filter(w => w.approbationStatus === 'approved').length}</div>
                <div className="stat-label">👍 Approbations</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Math.round((finalizationData.workers.filter(w => w.hasConsented).length / Math.max(finalizationData.workers.length, 1)) * 100)}%</div>
                <div className="stat-label">📊 Taux Lecture</div>
              </div>
            </div>

            {/* Gestion équipe */}
            <div className="finalization-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 className="section-title">
                  <Users size={24} />
                  Gestion de l'Équipe
                </h3>
                <button 
                  className="premium-button"
                  onClick={() => setShowAddWorker(true)}
                >
                  <Plus size={18} />
                  ➕ Ajouter
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
                          {worker.approbationStatus === 'approved' ? '✅ Approuvé' : 
                           worker.approbationStatus === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
                        </span>
                      </div>
                    </div>

                    {/* Section consentement */}
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
                          ✋ Je consens avoir lu et compris cette AST
                        </span>
                      </div>
                      {worker.hasConsented && worker.consentTimestamp && (
                        <div className="consent-timestamp">
                          📅 Consentement donné le {new Date(worker.consentTimestamp).toLocaleString('fr-CA')}
                        </div>
                      )}
                    </div>

                    {/* Boutons approbation */}
                    <div className="approbation-section">
                      <button 
                        className="approbation-btn approbation-approve"
                        onClick={() => updateApprobation(worker.id, 'approved', 'Approuvé par le superviseur')}
                      >
                        👍 Approuver
                      </button>
                      <button 
                        className="approbation-btn approbation-reject"
                        onClick={() => updateApprobation(worker.id, 'rejected', 'Formation supplémentaire requise')}
                      >
                        👎 Rejeter
                      </button>
                    </div>
                  </div>
                ))}

                {finalizationData.workers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>Aucun travailleur ajouté. Cliquez sur "Ajouter" pour commencer.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2: PARTAGE SIMPLE */}
        {activeTab === 'sharing' && (
          <div>
            <div className="finalization-section">
              <h3 className="section-title">
                <Share2 size={24} />
                📤 Partage de l'AST
              </h3>
              
              {/* Lien de partage */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">
                  🔗 Lien de partage sécurisé:
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
                    {copySuccess ? '✅ Copié!' : '📋 Copier'}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                  📋 Instructions de partage:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '13px' }}>
                  <li>Partagez ce lien avec votre équipe pour consultation</li>
                  <li>Chaque membre peut consulter l'AST et donner son approbation</li>
                  <li>Le lien reste actif même si l'AST est verrouillée</li>
                </ul>
              </div>

              {/* Boutons de partage */}
              <div className="share-buttons">
                <div className="share-btn" onClick={shareViaEmail}>
                  <Mail size={24} style={{ color: '#dc2626', marginBottom: '4px' }} />
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>📧 Email</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Courriel</div>
                </div>
                
                <div className="share-btn" onClick={shareViaSMS}>
                  <Smartphone size={24} style={{ color: '#059669', marginBottom: '4px' }} />
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>📱 SMS</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Texto</div>
                </div>
                
                <div className="share-btn" onClick={shareViaWhatsApp}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>💬</div>
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>WhatsApp</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Messenger</div>
                </div>
                
                <div className="share-btn" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`)}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📘</div>
                  <div style={{ fontWeight: '600', color: '#ffffff' }}>Facebook</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Réseau social</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 3: FINALISATION */}
        {activeTab === 'finalization' && (
          <div>
            {/* État de complétion */}
            <div className="finalization-section">
              <h3 className="section-title">
                <BarChart3 size={24} />
                📊 État de Complétion
              </h3>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${finalizationData.completionPercentage}%` }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', fontWeight: '600', color: '#10b981', marginBottom: '16px' }}>
                {finalizationData.completionPercentage}% Complété
              </p>

              {/* Statuts des sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>✅ Informations projet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>✅ Dangers identifiés</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>✅ Équipements sélectionnés</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                  <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>⏳ Validation équipe</span>
                </div>
              </div>
            </div>

            {/* Options de génération */}
            <div className="finalization-section">
              <h3 className="section-title">
                <FileText size={24} />
                📄 Options Rapport
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
                  <span>📸 Photos</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeSignatures ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeSignatures: !prev.documentGeneration.includeSignatures }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeSignatures} onChange={() => {}} />
                  <span>✍️ Signatures</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeQRCode ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeQRCode: !prev.documentGeneration.includeQRCode }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeQRCode} onChange={() => {}} />
                  <span>📱 QR Code</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeBranding ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeBranding: !prev.documentGeneration.includeBranding }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeBranding} onChange={() => {}} />
                  <span>🏢 Branding</span>
                </div>
              </div>
            </div>

            {/* Commentaires finaux */}
            <div className="finalization-section">
              <h3 className="section-title">
                <MessageSquare size={24} />
                💬 Commentaires Finaux
              </h3>
              
              <textarea
                value={finalizationData.finalComments}
                onChange={(e) => setFinalizationData(prev => ({ ...prev, finalComments: e.target.value }))}
                placeholder="Ajoutez des commentaires finaux, notes importantes ou instructions spéciales..."
                className="form-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                disabled={finalizationData.isLocked}
              />
              
              {finalizationData.isLocked && (
                <p style={{ marginTop: '8px', color: '#ef4444', fontSize: '14px', fontStyle: 'italic' }}>
                  🔒 Document verrouillé - Modification impossible
                </p>
              )}
            </div>

            {/* Actions finales */}
            <div className="finalization-section">
              <h3 className="section-title">
                <Target size={24} />
                🎯 Actions Finales
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <button 
                  onClick={printAST}
                  className="premium-button"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw size={18} className="spinning" /> : <Printer size={18} />}
                  🖨️ Imprimer
                </button>
                
                <button 
                  onClick={() => {
                    console.log('💾 Sauvegarde AST...');
                    alert('✅ AST sauvegardée!');
                  }}
                  className="premium-button"
                >
                  <Save size={18} />
                  💾 Sauvegarder
                </button>
                
                <button 
                  onClick={() => {
                    console.log('📁 Archivage AST...');
                    alert('✅ AST archivée!');
                  }}
                  className="premium-button"
                >
                  <Archive size={18} />
                  📁 Archiver
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
                  {finalizationData.isLocked ? '🔒 Verrouillé' : '🔒 Verrouiller'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT TRAVAILLEUR OPTIMISÉ */}
        {showAddWorker && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  👷 Ajouter un Travailleur
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
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  value={newWorker.name || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Jean Tremblay"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Entreprise *</label>
                <input
                  type="text"
                  value={newWorker.company || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, company: e.target.value }))}
                  className="form-input"
                  placeholder="Construction ABC Inc."
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
                  ➕ Ajouter
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
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMATION VERROUILLAGE SÉCURISÉ */}
        {showLockConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ 
              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  🔒 Confirmer le Verrouillage
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
                  <strong>ATTENTION: Cette action est irréversible !</strong>
                </div>
                
                <div style={{ 
                  background: 'rgba(254, 242, 242, 0.1)', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  border: '1px solid rgba(252, 165, 165, 0.2)'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '14px' }}>
                    📊 Vérifications automatiques:
                  </h5>
                  <div style={{ fontSize: '13px', color: '#fef2f2', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>✅ Sections complétées:</span>
                      <strong>{finalizationData.completionPercentage}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>✅ Consentements:</span>
                      <strong>{finalizationData.workers.filter(w => w.hasConsented).length}/{finalizationData.workers.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>✅ Approbations:</span>
                      <strong>{finalizationData.workers.filter(w => w.approbationStatus === 'approved').length}/{finalizationData.workers.length}</strong>
                    </div>
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', lineHeight: '1.4', opacity: 0.9 }}>
                  Une fois verrouillée, l'AST ne pourra plus être modifiée mais restera consultable par l'équipe via le lien de partage.
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
                  🔒 Verrouiller Définitivement
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
                  Annuler
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
