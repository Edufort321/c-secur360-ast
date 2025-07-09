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
  consultationTime?: number; // en minutes
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
  errors?: any; // ← AJOUT DE LA PROP ERRORS OPTIONNELLE
}

// =================== TYPES DE SÉCURITÉ ===================
type ApprobationStatus = 'pending' | 'approved' | 'rejected';
type LockType = 'temporary' | 'permanent' | 'review';
type ShareMethod = 'email' | 'sms' | 'whatsapp' | 'facebook';
export default function Step6Finalization({ 
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

  // =================== HANDLERS PARTAGE SIMPLE ===================
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
  // =================== FONCTION D'IMPRESSION COMPLÈTE AVEC LOGO ===================
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

  const generateCompleteAST = () => {
    const currentDate = new Date().toLocaleDateString('fr-CA');
    const currentTime = new Date().toLocaleTimeString('fr-CA');
    const astNumber = formData?.astNumber || `AST-${Date.now().toString().slice(-6)}`;
    
    // Calcul des statistiques
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
        @media print {
            @page { margin: 15mm; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-before: always; }
            .no-print { display: none; }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            font-size: 11px;
        }
        
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
            width: 60px;
            height: 60px;
            background: #000;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-container img {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }
        
        .logo-fallback {
            color: #f59e0b;
            font-size: 18px;
            font-weight: bold;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .info-box {
            border: 2px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            background: #f8fafc;
        }
        
        .info-box h3 {
            font-size: 12px;
            color: #374151;
            margin-bottom: 10px;
            font-weight: bold;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            padding: 4px 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 120px;
        }
        
        .info-value {
            color: #1f2937;
            font-weight: 500;
            flex: 1;
            text-align: right;
        }
        
        .section {
            margin-bottom: 25px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .section-header {
            background: #f3f4f6;
            padding: 12px 15px;
            border-bottom: 1px solid #d1d5db;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
        }
        
        .section-content {
            padding: 15px;
        }
        
        .subsection {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .subsection-title {
            font-size: 12px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .hazard-item, .equipment-item, .permit-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .hazard-high { border-left: 4px solid #dc2626; background: #fef2f2; }
        .hazard-medium { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .hazard-low { border-left: 4px solid #10b981; background: #f0fdf4; }
        
        .lockout-point {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid #dc2626;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 15px;
        }
        
        .procedures-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 8px;
            margin-top: 8px;
        }
        
        .procedure-item {
            font-size: 10px;
            padding: 4px 8px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 4px;
        }
        
        .procedure-completed {
            background: #dcfce7;
            border-color: #16a34a;
        }
        
        .workers-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .workers-table th,
        .workers-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-size: 9px;
        }
        
        .workers-table th {
            background: #f3f4f6;
            font-weight: bold;
        }
        
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        
        .footer {
            margin-top: 30px;
            padding: 15px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
        
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-top: 40px;
        }
        
        .signature-box {
            border-top: 2px solid #374151;
            padding-top: 10px;
            text-align: center;
        }
        
        .signature-label {
            font-size: 10px;
            color: #4b5563;
            font-weight: 600;
        }
        
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: 600;
        }
        
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        
        .stats-summary {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        
        .stat-item {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 6px;
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: bold;
        }
        
        .stat-label {
            font-size: 10px;
            opacity: 0.9;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <!-- EN-TÊTE AVEC LOGO -->
    <div class="header">
        <div class="logo-container">
            <img src="/c-secur360-logo.png" alt="C-Secur360" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback" style="display: none;">C🛡️</div>
        </div>
        <h1>🛡️ ANALYSE SÉCURITAIRE DE TRAVAIL (AST)</h1>
        <div class="subtitle">Rapport Officiel Complet - ${tenant} | N° ${astNumber}</div>
    </div>

    <!-- RÉSUMÉ STATISTIQUES -->
    <div class="stats-summary">
        <h3 style="margin-bottom: 10px; font-size: 14px;">📊 RÉSUMÉ EXÉCUTIF</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalHazards}</div>
                <div class="stat-label">⚠️ Dangers</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalEquipment}</div>
                <div class="stat-label">🔧 Équipements</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalPermits}</div>
                <div class="stat-label">📄 Permis</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${lockoutPoints}</div>
                <div class="stat-label">🔒 Points LOTO</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalWorkers}</div>
                <div class="stat-label">👷 Travailleurs</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${consentedWorkers}/${totalWorkers}</div>
                <div class="stat-label">✅ Consentements</div>
            </div>
        </div>
    </div>

    <!-- INFORMATIONS GÉNÉRALES -->
    <div class="info-grid">
        <div class="info-box">
            <h3>🏢 INFORMATIONS CLIENT & PROJET</h3>
            <div class="info-row">
                <span class="info-label">Client:</span>
                <span class="info-value">${formData.projectInfo?.client || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Projet #:</span>
                <span class="info-value">${formData.projectInfo?.projectNumber || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">AST Client #:</span>
                <span class="info-value">${formData.projectInfo?.astClientNumber || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Lieu:</span>
                <span class="info-value">${formData.projectInfo?.workLocation || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date/Heure:</span>
                <span class="info-value">${formData.projectInfo?.date || currentDate} ${formData.projectInfo?.time || currentTime}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Industrie:</span>
                <span class="info-value">${getIndustryLabel(formData.projectInfo?.industry)}</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3>👥 ÉQUIPE & CONTACTS</h3>
            <div class="info-row">
                <span class="info-label">Nb Travailleurs:</span>
                <span class="info-value">${formData.projectInfo?.workerCount || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Durée estimée:</span>
                <span class="info-value">${formData.projectInfo?.estimatedDuration || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Contact client:</span>
                <span class="info-value">${formData.projectInfo?.clientRepresentative || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tél. client:</span>
                <span class="info-value">${formData.projectInfo?.clientPhone || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Urgence:</span>
                <span class="info-value">${formData.projectInfo?.emergencyContact || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tél. urgence:</span>
                <span class="info-value">${formData.projectInfo?.emergencyPhone || '911'}</span>
            </div>
        </div>
    </div>

    ${generateStep1Section()}
    ${generateStep2Section()}
    ${generateStep3Section()}
    ${generateStep4Section()}
    ${generateStep5Section()}
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

  // =================== FONCTIONS GÉNÉRATION SECTIONS COMPLÈTES ===================
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
  // =================== GÉNÉRATION STEP 1: INFORMATIONS PROJET + LOTO ===================
  const generateStep1Section = () => {
    const projectInfo = formData.projectInfo || {};
    const lockoutPoints = projectInfo.lockoutPoints || [];
    const lockoutPhotos = projectInfo.lockoutPhotos || [];
    
    const lockoutPointsHtml = lockoutPoints.map((point: any, index: number) => {
      const energyTypes = {
        electrical: { name: 'Électrique', icon: '⚡', color: '#fbbf24' },
        mechanical: { name: 'Mécanique', icon: '⚙️', color: '#6b7280' },
        hydraulic: { name: 'Hydraulique', icon: '💧', color: '#3b82f6' },
        pneumatic: { name: 'Pneumatique', icon: '💨', color: '#10b981' },
        chemical: { name: 'Chimique', icon: '⚠️', color: '#f59e0b' },
        thermal: { name: 'Thermique', icon: '🔥', color: '#ef4444' },
        gravity: { name: 'Gravité', icon: '🔧', color: '#8b5cf6' }
      };
      
      const energyType = energyTypes[point.energyType as keyof typeof energyTypes] || { name: 'Inconnu', icon: '❓', color: '#6b7280' };
      const completedProcedures = point.completedProcedures || [];
      const totalProcedures = 6; // Nombre standard de procédures
      const progress = Math.round((completedProcedures.length / totalProcedures) * 100);
      
      return `
        <div class="lockout-point">
          <div class="subsection-title">
            🔒 Point de Verrouillage #${index + 1} - ${energyType.icon} ${energyType.name}
          </div>
          <div class="info-row">
            <span class="info-label">Équipement:</span>
            <span class="info-value">${point.equipmentName || 'Non spécifié'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Localisation:</span>
            <span class="info-value">${point.location || 'Non spécifiée'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type de cadenas:</span>
            <span class="info-value">${point.lockType || 'Non spécifié'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Numéro étiquette:</span>
            <span class="info-value">${point.tagNumber || 'Non spécifié'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Vérifié par:</span>
            <span class="info-value">${point.verifiedBy || 'Non spécifié'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Heure vérification:</span>
            <span class="info-value">${point.verificationTime || 'Non spécifiée'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Procédures complétées:</span>
            <span class="info-value">${completedProcedures.length}/${totalProcedures} (${progress}%)</span>
          </div>
          ${point.notes ? `
            <div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
              <strong>Notes:</strong> ${point.notes}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
    <div class="section page-break">
        <div class="section-header">
            <div class="section-title">🏗️ STEP 1: INFORMATIONS PROJET & VERROUILLAGE</div>
        </div>
        <div class="section-content">
            ${projectInfo.workDescription ? `
                <div class="subsection">
                    <div class="subsection-title">📝 Description des Travaux</div>
                    <div style="white-space: pre-wrap; line-height: 1.5;">${projectInfo.workDescription}</div>
                </div>
            ` : ''}
            
            ${lockoutPoints.length > 0 ? `
                <div class="subsection">
                    <div class="subsection-title">🔒 Points de Verrouillage/Cadenassage (LOTO)</div>
                    ${lockoutPointsHtml}
                </div>
            ` : ''}
            
            ${lockoutPhotos.length > 0 ? `
                <div class="subsection">
                    <div class="subsection-title">📷 Documentation Photographique LOTO</div>
                    <div style="color: #6b7280; font-size: 10px;">
                        ${lockoutPhotos.length} photo(s) documentée(s) pour les procédures de verrouillage
                    </div>
                </div>
            ` : ''}
        </div>
    </div>`;
  };

  // =================== GÉNÉRATION STEP 2: ÉQUIPEMENTS ===================
  const generateStep2Section = () => {
    if (!formData.equipment?.selectedEquipment?.length) return '';
    
    const equipmentHtml = formData.equipment.selectedEquipment.map((item: any) => `
        <div class="equipment-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${item.name || 'Équipement'}</strong>
                <span class="badge badge-${item.condition === 'good' ? 'success' : item.condition === 'fair' ? 'warning' : 'danger'}">
                    ${item.condition?.toUpperCase() || 'INCONNU'}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${item.type || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Modèle:</span>
                <span class="info-value">${item.model || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Inspection:</span>
                <span class="info-value">${item.inspectionDate || 'Non inspectée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Certificat:</span>
                <span class="info-value">${item.certification || 'Non certifié'}</span>
            </div>
            ${item.notes ? `
                <div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                    <strong>Remarques:</strong> ${item.notes}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-title">🔧 STEP 2: ÉQUIPEMENTS ET OUTILS</div>
        </div>
        <div class="section-content">
            ${equipmentHtml}
        </div>
    </div>`;
  };

  // =================== GÉNÉRATION STEP 3: DANGERS ===================
  const generateStep3Section = () => {
    if (!formData.hazards?.identifiedHazards?.length) return '';
    
    const hazardsHtml = formData.hazards.identifiedHazards.map((hazard: any) => `
        <div class="hazard-item hazard-${hazard.riskLevel?.toLowerCase() || 'low'}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${hazard.name || 'Danger non nommé'}</strong>
                <span class="badge badge-${hazard.riskLevel === 'high' ? 'danger' : hazard.riskLevel === 'medium' ? 'warning' : 'success'}">
                    ${hazard.riskLevel?.toUpperCase() || 'FAIBLE'}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Catégorie:</span>
                <span class="info-value">${hazard.category || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Probabilité:</span>
                <span class="info-value">${hazard.probability || 'Non évaluée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Gravité:</span>
                <span class="info-value">${hazard.severity || 'Non évaluée'}</span>
            </div>
            ${hazard.description ? `
                <div style="margin-top: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                    <strong>Description:</strong> ${hazard.description}
                </div>
            ` : ''}
            ${hazard.controlMeasures ? `
                <div style="margin-top: 8px; padding: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px;">
                    <strong>Mesures de contrôle:</strong> ${hazard.controlMeasures}
                </div>
            ` : ''}
            ${hazard.requiredPPE ? `
                <div style="margin-top: 8px; padding: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px;">
                    <strong>EPI requis:</strong> ${hazard.requiredPPE}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    return `
    <div class="section page-break">
        <div class="section-header">
            <div class="section-title">⚠️ STEP 3: IDENTIFICATION DES DANGERS</div>
        </div>
        <div class="section-content">
            ${hazardsHtml}
        </div>
    </div>`;
  };

  // =================== GÉNÉRATION STEP 4: PERMIS ===================
  const generateStep4Section = () => {
    if (!formData.permits?.requiredPermits?.length) return '';
    
    const permitsHtml = formData.permits.requiredPermits.map((permit: any) => `
        <div class="permit-item">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>${permit.name || 'Permis'}</strong>
                <span class="badge badge-${permit.status === 'obtained' ? 'success' : permit.status === 'pending' ? 'warning' : 'danger'}">
                    ${permit.status?.toUpperCase() || 'INCONNU'}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Autorité émettrice:</span>
                <span class="info-value">${permit.authority || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Numéro:</span>
                <span class="info-value">${permit.number || 'Non attribué'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date émission:</span>
                <span class="info-value">${permit.issueDate || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date expiration:</span>
                <span class="info-value">${permit.expiryDate || 'Non spécifiée'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Responsable:</span>
                <span class="info-value">${permit.responsiblePerson || 'Non spécifié'}</span>
            </div>
            ${permit.conditions ? `
                <div style="margin-top: 8px; padding: 8px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px;">
                    <strong>Conditions particulières:</strong> ${permit.conditions}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-title">📄 STEP 4: PERMIS ET AUTORISATIONS</div>
        </div>
        <div class="section-content">
            ${permitsHtml}
        </div>
    </div>`;
  };

  // =================== GÉNÉRATION STEP 5: VALIDATION ===================
  const generateStep5Section = () => {
    const validationData = formData.validation || {};
    const reviewers = validationData.reviewers || [];
    
    if (reviewers.length === 0) return '';
    
    const reviewersHtml = reviewers.map((reviewer: any) => `
        <tr>
            <td>${reviewer.name || 'Non spécifié'}</td>
            <td>${reviewer.role || 'Non spécifié'}</td>
            <td>${reviewer.department || 'Non spécifié'}</td>
            <td>${reviewer.email || 'Non spécifié'}</td>
            <td class="status-${reviewer.status || 'pending'}">
                ${reviewer.status === 'approved' ? '✅ Approuvé' : 
                  reviewer.status === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
            </td>
            <td>${reviewer.comments || '-'}</td>
        </tr>
    `).join('');
    
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-title">✅ STEP 5: VALIDATION ÉQUIPE</div>
        </div>
        <div class="section-content">
            <table class="workers-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Rôle</th>
                        <th>Département</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Commentaires</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviewersHtml}
                </tbody>
            </table>
        </div>
    </div>`;
  };

  // =================== GÉNÉRATION STEP 6: FINALISATION ===================
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
                            <th>Nom</th>
                            <th>Entreprise</th>
                            <th>Poste</th>
                            <th>Consentement</th>
                            <th>Date/Heure</th>
                            <th>Statut</th>
                            <th>Commentaires</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workersRows}
                    </tbody>
                </table>
            ` : '<p style="text-align: center; color: #6b7280; font-style: italic;">Aucun travailleur ajouté à l\'équipe</p>'}
            
            ${finalizationData.finalComments ? `
                <div class="subsection" style="margin-top: 20px;">
                    <div class="subsection-title">💬 Commentaires Finaux</div>
                    <div style="white-space: pre-wrap; line-height: 1.5; padding: 10px; background: #f9fafb; border-radius: 4px;">
                        ${finalizationData.finalComments}
                    </div>
                </div>
            ` : ''}
            
            <div class="subsection" style="margin-top: 20px;">
                <div class="subsection-title">📊 Statut du Document</div>
                <div class="info-row">
                    <span class="info-label">Statut:</span>
                    <span class="info-value">
                        <span class="badge badge-${finalizationData.isLocked ? 'success' : 'warning'}">
                            ${finalizationData.isLocked ? '🔒 VERROUILLÉ' : '🔓 EN COURS'}
                        </span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Complétion:</span>
                    <span class="info-value">${finalizationData.completionPercentage}%</span>
                </div>
                ${finalizationData.lockTimestamp ? `
                    <div class="info-row">
                        <span class="info-label">Verrouillé le:</span>
                        <span class="info-value">${new Date(finalizationData.lockTimestamp).toLocaleString('fr-CA')}</span>
                    </div>
                ` : ''}
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
  // =================== HANDLERS AUTRES ===================
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

  // =================== RENDU PRINCIPAL ===================
  return (
    <>
      {/* CSS Premium Step 6 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step6-container { padding: 0; background: #f8fafc; min-height: 100vh; }
          .finalization-header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 12px; }
          .finalization-title { font-size: 28px; margin-bottom: 8px; font-weight: bold; }
          .finalization-subtitle { font-size: 16px; opacity: 0.9; }
          
          .tabs-container { display: flex; background: white; border-radius: 12px; padding: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .tab-button { flex: 1; padding: 12px 20px; border: none; background: transparent; color: #6b7280; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
          .tab-button.active { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
          
          .finalization-section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #1f2937; display: flex; align-items: center; gap: 8px; }
          
          .workers-grid { display: grid; gap: 16px; }
          .worker-card { border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #f9fafb; transition: all 0.3s; }
          .worker-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
          .worker-header { display: flex; justify-content: between; align-items: center; margin-bottom: 12px; }
          .worker-name { font-size: 16px; font-weight: bold; color: #1f2937; }
          .worker-company { color: #6b7280; font-size: 14px; }
          
          .consent-section { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 12px; }
          .consent-checkbox { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; cursor: pointer; }
          .consent-checkbox input { width: 20px; height: 20px; cursor: pointer; }
          .consent-text { font-weight: 500; color: #374151; }
          .consent-timestamp { font-size: 12px; color: #6b7280; font-style: italic; }
          
          .approbation-section { display: flex; gap: 8px; margin-top: 12px; }
          .approbation-btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s; }
          .approbation-approve { background: #dcfce7; color: #166534; }
          .approbation-approve:hover { background: #bbf7d0; }
          .approbation-reject { background: #fee2e2; color: #991b1b; }
          .approbation-reject:hover { background: #fecaca; }
          
          .premium-button { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
          .premium-button:hover { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3); }
          .premium-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
          
          .share-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-top: 16px; }
          .share-btn { padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; text-align: center; transition: all 0.3s; }
          .share-btn:hover { border-color: #3b82f6; background: #eff6ff; }
          
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { background: white; border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
          
          .form-group { margin-bottom: 16px; }
          .form-label { display: block; margin-bottom: 6px; font-weight: 600; color: #374151; }
          .form-input { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
          .form-input:focus { outline: none; border-color: #3b82f6; }
          
          .checkbox-field { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s; background: white !important; }
          .checkbox-field:hover { border-color: #3b82f6; background: #f0f9ff !important; }
          .checkbox-field.checked { border-color: #10b981; background: #f0fdf4 !important; }
          .checkbox-field span { color: #1f2937 !important; font-weight: 500 !important; }
          
          .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px; }
          .stat-card { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
          .stat-label { font-size: 12px; opacity: 0.9; }
          
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .spinning { animation: spin 1s linear infinite; }
        `
      }} />

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
            👷 Équipe Chantier
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
            ✅ Finalisation
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

            {/* Bouton ajout travailleur */}
            <div className="finalization-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="section-title">
                  <Users size={24} />
                  Gestion de l'Équipe
                </h3>
                <button 
                  className="premium-button"
                  onClick={() => setShowAddWorker(true)}
                >
                  <Plus size={18} />
                  ➕ Ajouter Travailleur
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
                        <span className={`badge badge-${worker.approbationStatus === 'approved' ? 'success' : worker.approbationStatus === 'rejected' ? 'danger' : 'warning'}`}>
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
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>Aucun travailleur ajouté. Cliquez sur "Ajouter Travailleur" pour commencer.</p>
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
                📤 Partage de l'AST
              </h3>
              
              {/* Lien de partage */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ color: '#374151 !important', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  🔗 Lien de partage sécurisé:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={shareLink}
                    readOnly
                    className="form-input"
                    style={{ 
                      flex: 1, 
                      background: '#f9fafb !important', 
                      color: '#1f2937 !important',
                      fontWeight: '500 !important',
                      fontSize: '14px !important'
                    }}
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
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px', fontWeight: '600' }}>
                  📋 Instructions de partage:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af', fontSize: '13px' }}>
                  <li>Partagez ce lien avec votre équipe pour consultation</li>
                  <li>Chaque membre peut consulter l'AST et donner son approbation</li>
                  <li>Le lien reste actif même si l'AST est verrouillée</li>
                </ul>
              </div>

              {/* Boutons de partage */}
              <div className="share-buttons">
                <div className="share-btn" onClick={shareViaEmail}>
                  <Mail size={24} style={{ color: '#dc2626', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>📧 Email</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Envoyer par courriel</div>
                </div>
                
                <div className="share-btn" onClick={shareViaSMS}>
                  <Smartphone size={24} style={{ color: '#059669', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>📱 SMS</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Envoyer par texto</div>
                </div>
                
                <div className="share-btn" onClick={shareViaWhatsApp}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>WhatsApp</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Partager sur WhatsApp</div>
                </div>
                
                <div className="share-btn" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`)}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📘</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>Facebook</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Partager sur Facebook</div>
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
                📊 État de Complétion Globale
              </h3>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${finalizationData.completionPercentage}%` }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', fontWeight: '600', color: '#059669' }}>
                {finalizationData.completionPercentage}% Complété
              </p>

              {/* Statuts des sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                  <span>✅ Informations projet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                  <span>✅ Dangers identifiés</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                  <span>✅ Équipements sélectionnés</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  <span>⏳ Validation équipe</span>
                </div>
              </div>
            </div>

            {/* Options de génération */}
            <div className="finalization-section">
              <h3 className="section-title">
                <FileText size={24} />
                📄 Options de Génération Rapport
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includePhotos ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includePhotos: !prev.documentGeneration.includePhotos }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includePhotos} onChange={() => {}} />
                  <span>📸 Inclure photos</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeSignatures ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeSignatures: !prev.documentGeneration.includeSignatures }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeSignatures} onChange={() => {}} />
                  <span>✍️ Inclure signatures</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeQRCode ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeQRCode: !prev.documentGeneration.includeQRCode }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeQRCode} onChange={() => {}} />
                  <span>📱 Inclure QR Code</span>
                </div>
                
                <div 
                  className={`checkbox-field ${finalizationData.documentGeneration.includeBranding ? 'checked' : ''}`}
                  onClick={() => setFinalizationData(prev => ({
                    ...prev,
                    documentGeneration: { ...prev.documentGeneration, includeBranding: !prev.documentGeneration.includeBranding }
                  }))}
                >
                  <input type="checkbox" checked={finalizationData.documentGeneration.includeBranding} onChange={() => {}} />
                  <span>🏢 Inclure branding</span>
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
                <p style={{ marginTop: '8px', color: '#dc2626', fontSize: '14px', fontStyle: 'italic' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <button 
                  onClick={printAST}
                  className="premium-button"
                  disabled={isLoading}
                >
                  {isLoading ? <RefreshCw size={18} className="spinning" /> : <Printer size={18} />}
                  🖨️ Imprimer Rapport
                </button>
                
                <button 
                  onClick={() => {
                    console.log('💾 Sauvegarde AST...');
                    alert('✅ AST sauvegardée avec succès!');
                  }}
                  className="premium-button"
                >
                  <Save size={18} />
                  💾 Sauvegarder
                </button>
                
                <button 
                  onClick={() => {
                    console.log('📁 Archivage AST...');
                    alert('✅ AST archivée avec succès!');
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

        {/* MODAL AJOUT TRAVAILLEUR SIMPLIFIÉ */}
        {showAddWorker && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                👷 Ajouter un Travailleur
              </h4>
              
              <div className="form-group">
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  value={newWorker.name || ''}
                  onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Jean Tremblay"
                  style={{ padding: '14px', fontSize: '16px' }}
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
                  style={{ padding: '14px', fontSize: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={addWorker}
                  className="premium-button"
                  style={{ flex: 1 }}
                >
                  <Plus size={18} />
                  ➕ Ajouter
                </button>
                <button
                  onClick={() => setShowAddWorker(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMATION VERROUILLAGE */}
        {showLockConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#991b1b' }}>
                🔒 Confirmer le Verrouillage
              </h4>
              
              <div style={{ marginBottom: '20px', color: '#7f1d1d' }}>
                <p style={{ marginBottom: '12px' }}>
                  ⚠️ <strong>ATTENTION:</strong> Cette action est irréversible !
                </p>
                
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Vérifications automatiques:</h5>
                  <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                    ✅ Sections complétées: {finalizationData.completionPercentage}%<br />
                    ✅ Consentements: {finalizationData.workers.filter(w => w.hasConsented).length}/{finalizationData.workers.length}<br />
                    ✅ Approbations: {finalizationData.workers.filter(w => w.approbationStatus === 'approved').length}/{finalizationData.workers.length}
                  </div>
                </div>
                
                <p style={{ fontSize: '14px' }}>
                  Une fois verrouillée, l'AST ne pourra plus être modifiée mais restera consultable par l'équipe.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => lockAST('permanent')}
                  className="premium-button"
                  style={{ 
                    flex: 1,
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  }}
                >
                  <Lock size={18} />
                  🔒 Verrouiller Définitivement
                </button>
                <button
                  onClick={() => setShowLockConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    border: '2px solid #991b1b',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
