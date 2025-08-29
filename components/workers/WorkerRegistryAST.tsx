'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserCheck, UserX, Clock, Timer, Play, Pause, Square,
  Phone, Building, FileText, PenTool, CheckCircle, AlertTriangle,
  Lock, Unlock, Save, Search, Filter, Download, RefreshCw, Bell,
  Calendar, BarChart3, TrendingUp, Activity, Shield, Hash,
  MapPin, Eye, Edit, Trash2, Plus, X, Copy, Check
} from 'lucide-react';

// =================== INTERFACES ===================

interface WorkerRegistryEntry {
  id: string;
  name: string;
  company: string;
  phoneNumber: string;
  employeeNumber: string;
  certification: string[];
  signature: string; // Base64 de la signature
  consentTimestamp: string;
  astValidated: boolean;
  
  // Timer de travail
  workTimer: {
    startTime?: string;
    endTime?: string;
    totalTime: number; // en millisecondes
    isActive: boolean;
    breaks: WorkBreak[];
  };
  
  // Cadenas LOTO assignés
  assignedLocks: LOTOLockEntry[];
  
  // Métadonnées
  registeredAt: string;
  lastActivity: string;
  ipAddress?: string;
  deviceInfo?: string;
}

interface WorkBreak {
  id: string;
  startTime: string;
  endTime?: string;
  reason: string;
  duration?: number;
}

interface LOTOLockEntry {
  id: string;
  lockNumber: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical';
  equipment: string;
  location: string;
  appliedTime?: string;
  removedTime?: string;
  isApplied: boolean; // État coché/décoché par le travailleur
  appliedByWorker: boolean; // Ce travailleur l'a-t-il appliqué?
  status: 'available' | 'applied' | 'verified' | 'removed';
  photos: string[];
  workerId?: string; // ID du travailleur qui l'a appliqué
}

interface WorkerRegistryStats {
  totalRegistered: number;
  activeWorkers: number;
  completedWorkers: number;
  totalWorkTime: number;
  totalLocks: number;
  activeLocks: number;
  averageWorkTime: number;
  companiesCount: number;
}

interface WorkerRegistryProps {
  astId: string;
  astTitle: string;
  language: 'fr' | 'en';
  onStatsChange?: (stats: WorkerRegistryStats) => void;
  readOnly?: boolean;
  compactMode?: boolean;
  projectManagerPhone?: string; // Pour les alertes SMS
  availableLocks?: LOTOLockEntry[]; // Cadenas disponibles du projet
  onLockStatusChange?: (lockId: string, isApplied: boolean, workerId: string) => void;
}

interface SMSAlert {
  id: string;
  type: 'lock_applied' | 'lock_removed' | 'general_alert' | 'emergency' | 'work_completion';
  message: string;
  recipients: string[]; // Numéros de téléphone
  sentAt: string;
  sentBy: string;
}

// =================== TRADUCTIONS ===================

const translations = {
  fr: {
    title: "📋 Registre des Travailleurs - AST",
    subtitle: "Enregistrement, signature et suivi temps réel",
    
    // Actions
    addWorker: "Ajouter Travailleur",
    startWork: "Débuter Travaux", 
    endWork: "Terminer Travaux",
    takeBreak: "Prendre Pause",
    endBreak: "Reprendre Travail",
    sign: "Signer",
    validate: "Valider AST",
    export: "Exporter",
    search: "Rechercher",
    
    // Champs
    workerName: "Nom complet",
    company: "Entreprise",
    phoneNumber: "Téléphone",
    employeeNumber: "Numéro employé",
    certifications: "Certifications",
    signature: "Signature électronique",
    consentText: "Je consens avoir validé l'AST et comprendre les risques associés",
    
    // Statuts
    status: {
      registered: "Enregistré",
      working: "En travail",
      onBreak: "En pause",
      completed: "Terminé",
      notStarted: "Pas commencé"
    },
    
    // Timer
    timer: {
      elapsed: "Temps écoulé",
      total: "Temps total",
      start: "Début",
      end: "Fin",
      duration: "Durée",
      active: "Timer actif",
      paused: "En pause"
    },
    
    // Statistiques
    stats: {
      totalRegistered: "Total Enregistrés",
      activeWorkers: "Travailleurs Actifs",
      completedWorkers: "Travaux Terminés",
      totalWorkTime: "Temps Total Travail",
      totalLocks: "Total Cadenas",
      activeLocks: "Cadenas Actifs",
      averageWorkTime: "Temps Moyen",
      companiesCount: "Entreprises"
    },
    
    // Messages
    messages: {
      signatureRequired: "Signature requise",
      consentRequired: "Consentement requis",
      workStarted: "Travaux débutés",
      workCompleted: "Travaux terminés",
      breakStarted: "Pause débutée",
      breakEnded: "Pause terminée",
      astValidated: "AST validée",
      dataExported: "Données exportées"
    },
    
    // LOTO
    loto: {
      assignedLocks: "Cadenas Assignés",
      lockNumber: "N° Cadenas",
      equipment: "Équipement",
      energyType: "Type Énergie",
      appliedAt: "Appliqué à",
      removedAt: "Retiré à",
      addLock: "Ajouter Cadenas"
    }
  },
  
  en: {
    title: "📋 Worker Registry - JSA",
    subtitle: "Registration, signature and real-time tracking",
    
    // Actions
    addWorker: "Add Worker",
    startWork: "Start Work",
    endWork: "End Work", 
    takeBreak: "Take Break",
    endBreak: "Resume Work",
    sign: "Sign",
    validate: "Validate JSA",
    export: "Export",
    search: "Search",
    
    // Fields
    workerName: "Full name",
    company: "Company",
    phoneNumber: "Phone",
    employeeNumber: "Employee number",
    certifications: "Certifications",
    signature: "Electronic signature",
    consentText: "I consent to having validated the JSA and understand the associated risks",
    
    // Status
    status: {
      registered: "Registered",
      working: "Working",
      onBreak: "On break",
      completed: "Completed",
      notStarted: "Not started"
    },
    
    // Timer
    timer: {
      elapsed: "Elapsed time",
      total: "Total time",
      start: "Start",
      end: "End",
      duration: "Duration",
      active: "Timer active",
      paused: "Paused"
    },
    
    // Statistics
    stats: {
      totalRegistered: "Total Registered",
      activeWorkers: "Active Workers",
      completedWorkers: "Completed Work",
      totalWorkTime: "Total Work Time",
      totalLocks: "Total Locks",
      activeLocks: "Active Locks",
      averageWorkTime: "Average Time",
      companiesCount: "Companies"
    },
    
    // Messages
    messages: {
      signatureRequired: "Signature required",
      consentRequired: "Consent required",
      workStarted: "Work started",
      workCompleted: "Work completed",
      breakStarted: "Break started",
      breakEnded: "Break ended",
      astValidated: "JSA validated",
      dataExported: "Data exported"
    },
    
    // LOTO
    loto: {
      assignedLocks: "Assigned Locks",
      lockNumber: "Lock #",
      equipment: "Equipment",
      energyType: "Energy Type",
      appliedAt: "Applied at",
      removedAt: "Removed at",
      addLock: "Add Lock"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================

const WorkerRegistryAST: React.FC<WorkerRegistryProps> = ({
  astId,
  astTitle,
  language = 'fr',
  onStatsChange,
  readOnly = false,
  compactMode = false,
  projectManagerPhone,
  availableLocks = [],
  onLockStatusChange
}) => {
  // États
  const [workers, setWorkers] = useState<WorkerRegistryEntry[]>([]);
  const [stats, setStats] = useState<WorkerRegistryStats>({
    totalRegistered: 0,
    activeWorkers: 0,
    completedWorkers: 0,
    totalWorkTime: 0,
    totalLocks: 0,
    activeLocks: 0,
    averageWorkTime: 0,
    companiesCount: 0
  });
  
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerRegistryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'withLocks'>('all');
  const [smsAlerts, setSmsAlerts] = useState<SMSAlert[]>([]);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  
  // États pour l'ajout de travailleur
  const [newWorker, setNewWorker] = useState({
    name: '',
    company: '',
    phoneNumber: '',
    employeeNumber: '',
    certification: []
  });
  
  // Refs pour la signature
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const t = translations[language];
  
  // =================== CALCUL DES STATISTIQUES ===================
  
  const calculateStats = (workerList: WorkerRegistryEntry[]): WorkerRegistryStats => {
    const totalRegistered = workerList.length;
    const activeWorkers = workerList.filter(w => w.workTimer.isActive).length;
    const completedWorkers = workerList.filter(w => w.workTimer.endTime).length;
    
    const totalWorkTime = workerList.reduce((total, worker) => {
      return total + worker.workTimer.totalTime;
    }, 0);
    
    const allLocks = workerList.flatMap(w => w.assignedLocks);
    const totalLocks = allLocks.length;
    const activeLocks = allLocks.filter(l => l.status !== 'removed').length;
    
    const averageWorkTime = totalRegistered > 0 ? totalWorkTime / totalRegistered : 0;
    const companies = new Set(workerList.map(w => w.company));
    const companiesCount = companies.size;
    
    return {
      totalRegistered,
      activeWorkers,
      completedWorkers,
      totalWorkTime,
      totalLocks,
      activeLocks,
      averageWorkTime,
      companiesCount
    };
  };
  
  // =================== GESTION DES TRAVAILLEURS ===================
  
  const addWorker = (workerData: Partial<WorkerRegistryEntry>) => {
    if (readOnly) return;
    
    const worker: WorkerRegistryEntry = {
      id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: workerData.name || '',
      company: workerData.company || '',
      phoneNumber: workerData.phoneNumber || '',
      employeeNumber: workerData.employeeNumber || '',
      certification: workerData.certification || [],
      signature: '',
      consentTimestamp: '',
      astValidated: false,
      workTimer: {
        totalTime: 0,
        isActive: false,
        breaks: []
      },
      assignedLocks: [],
      registeredAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    const updatedWorkers = [...workers, worker];
    setWorkers(updatedWorkers);
    const newStats = calculateStats(updatedWorkers);
    setStats(newStats);
    onStatsChange?.(newStats);
  };

  const handleAddWorker = () => {
    if (!newWorker.name.trim() || !newWorker.company.trim()) {
      alert('Nom et entreprise requis');
      return;
    }
    
    addWorker(newWorker);
    
    // Reset du formulaire
    setNewWorker({
      name: '',
      company: '',
      phoneNumber: '',
      employeeNumber: '',
      certification: []
    });
    setShowAddWorker(false);
    
    // Feedback utilisateur
    alert(`Travailleur "${newWorker.name}" ajouté avec succès !`);
  };
  
  const startWork = (workerId: string) => {
    if (readOnly) return;
    
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId && !worker.workTimer.isActive) {
        return {
          ...worker,
          workTimer: {
            ...worker.workTimer,
            startTime: new Date().toISOString(),
            isActive: true
          },
          lastActivity: new Date().toISOString()
        };
      }
      return worker;
    }));
  };
  
  const endWork = (workerId: string) => {
    if (readOnly) return;
    
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId && worker.workTimer.isActive) {
        const endTime = new Date().toISOString();
        const startTime = worker.workTimer.startTime;
        const additionalTime = startTime ? 
          new Date(endTime).getTime() - new Date(startTime).getTime() : 0;
        
        // Vérifier si le travailleur a encore des cadenas actifs
        const hasActiveLocks = worker.assignedLocks.some(lock => lock.isApplied);
        if (hasActiveLocks) {
          sendSMSAlert('work_completion', `⚠️ ${worker.name} termine ses travaux mais a encore ${worker.assignedLocks.filter(l => l.isApplied).length} cadenas actifs!`);
        }
        
        return {
          ...worker,
          workTimer: {
            ...worker.workTimer,
            endTime,
            totalTime: worker.workTimer.totalTime + additionalTime,
            isActive: false
          },
          lastActivity: endTime
        };
      }
      return worker;
    }));
  };
  
  // =================== GESTION DES CADENAS LOTO ===================
  
  const toggleLock = (workerId: string, lockId: string, isApplying: boolean) => {
    if (readOnly) return;
    
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        const updatedLocks = worker.assignedLocks.map(lock => {
          if (lock.id === lockId) {
            const updatedLock = {
              ...lock,
              isApplied: isApplying,
              appliedByWorker: isApplying,
              workerId: isApplying ? workerId : undefined,
              appliedTime: isApplying ? new Date().toISOString() : lock.appliedTime,
              removedTime: !isApplying ? new Date().toISOString() : undefined,
              status: isApplying ? 'applied' : 'removed' as 'applied' | 'removed'
            };
            
            // Callback pour notifier le parent
            onLockStatusChange?.(lockId, isApplying, workerId);
            
            // Envoyer SMS d'alerte
            const action = isApplying ? 'appliqué' : 'retiré';
            sendSMSAlert(
              isApplying ? 'lock_applied' : 'lock_removed',
              `🔒 ${worker.name} a ${action} le cadenas ${lock.lockNumber} sur ${lock.equipment}`
            );
            
            return updatedLock;
          }
          return lock;
        });
        
        return {
          ...worker,
          assignedLocks: updatedLocks,
          lastActivity: new Date().toISOString()
        };
      }
      return worker;
    }));
  };
  
  const addLockToWorker = (workerId: string, lockData: Partial<LOTOLockEntry>) => {
    if (readOnly) return;
    
    const newLock: LOTOLockEntry = {
      id: `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lockNumber: lockData.lockNumber || '',
      energyType: lockData.energyType || 'electrical',
      equipment: lockData.equipment || '',
      location: lockData.location || '',
      isApplied: false,
      appliedByWorker: false,
      status: 'available',
      photos: [],
      workerId
    };
    
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        return {
          ...worker,
          assignedLocks: [...worker.assignedLocks, newLock],
          lastActivity: new Date().toISOString()
        };
      }
      return worker;
    }));
  };
  
  // =================== GESTION SMS ===================
  
  const sendSMSAlert = async (type: SMSAlert['type'], message: string, recipients?: string[]) => {
    const phoneNumbers = recipients || workers
      .filter(w => w.phoneNumber)
      .map(w => w.phoneNumber);
    
    if (phoneNumbers.length === 0) {
      console.warn('Aucun numéro de téléphone disponible pour SMS');
      return;
    }
    
    const alert: SMSAlert = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      recipients: phoneNumbers,
      sentAt: new Date().toISOString(),
      sentBy: 'Chargé de projet'
    };
    
    setSmsAlerts(prev => [alert, ...prev]);
    
    // TODO: Appel API Twilio ici quand disponible
    console.log('📱 SMS Alert:', alert);
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astId,
          type,
          message,
          recipients: phoneNumbers
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur envoi SMS');
      }
      
      console.log('✅ SMS envoyé avec succès');
    } catch (error) {
      console.error('❌ Erreur SMS:', error);
    }
  };
  
  const sendCustomSMS = () => {
    if (!customSmsMessage.trim()) return;
    
    sendSMSAlert('general_alert', customSmsMessage);
    setCustomSmsMessage('');
    setShowSmsDialog(false);
  };
  
  const formatDuration = (milliseconds: number): string => {
    if (milliseconds === 0) return '0h 0m';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // =================== GESTION DE LA SIGNATURE ===================
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  const saveSignature = (workerId: string) => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL();
      setWorkers(prev => prev.map(worker => {
        if (worker.id === workerId) {
          return {
            ...worker,
            signature,
            consentTimestamp: new Date().toISOString(),
            astValidated: true,
            lastActivity: new Date().toISOString()
          };
        }
        return worker;
      }));
      clearSignature();
      setSelectedWorker(null);
    }
  };
  
  // =================== TIMER EN TEMPS RÉEL ===================
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(worker => {
        if (worker.workTimer.isActive && worker.workTimer.startTime) {
          const currentTime = Date.now();
          const startTime = new Date(worker.workTimer.startTime).getTime();
          const elapsedSinceStart = currentTime - startTime;
          
          return {
            ...worker,
            workTimer: {
              ...worker.workTimer,
              totalTime: worker.workTimer.totalTime + 1000 // Ajouter 1 seconde
            }
          };
        }
        return worker;
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mise à jour des stats en temps réel
  useEffect(() => {
    const newStats = calculateStats(workers);
    setStats(newStats);
    onStatsChange?.(newStats);
  }, [workers, onStatsChange]);
  
  // =================== FILTRAGE ===================
  
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && worker.workTimer.isActive) ||
      (filterStatus === 'completed' && worker.workTimer.endTime) ||
      (filterStatus === 'withLocks' && worker.assignedLocks.some(lock => lock.isApplied));
    
    return matchesSearch && matchesStatus;
  });
  
  // =================== RENDU ===================
  
  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        padding: '20px'
      }}>
        <h3 style={{
          color: '#3b82f6',
          fontSize: '20px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Users size={24} />
          {t.title}
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '14px' }}>
          {t.subtitle} - AST: {astTitle}
        </p>
        
        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: compactMode ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)',
          gap: '16px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
              {t.stats.totalRegistered}
            </div>
            <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '800' }}>
              {stats.totalRegistered}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
              {t.stats.activeWorkers}
            </div>
            <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '800' }}>
              {stats.activeWorkers}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
              {t.stats.totalLocks}
            </div>
            <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '800' }}>
              {stats.totalLocks}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
              {t.stats.totalWorkTime}
            </div>
            <div style={{ color: '#8b5cf6', fontSize: '20px', fontWeight: '800' }}>
              {formatDuration(stats.totalWorkTime)}
            </div>
          </div>
          
          {!compactMode && (
            <>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                  {t.stats.activeLocks}
                </div>
                <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: '800' }}>
                  {stats.activeLocks}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                  {t.stats.averageWorkTime}
                </div>
                <div style={{ color: '#06b6d4', fontSize: '18px', fontWeight: '800' }}>
                  {formatDuration(stats.averageWorkTime)}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                  {t.stats.companiesCount}
                </div>
                <div style={{ color: '#84cc16', fontSize: '24px', fontWeight: '800' }}>
                  {stats.companiesCount}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>
                  {t.stats.completedWorkers}
                </div>
                <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '800' }}>
                  {stats.completedWorkers}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Contrôles */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: '20px',
        padding: '16px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid rgba(100, 116, 139, 0.3)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: 'white',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            background: 'rgba(15, 23, 42, 0.8)',
            color: 'white',
            fontSize: '14px'
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="completed">Terminés</option>
          <option value="withLocks">🔒 Avec cadenas actifs</option>
        </select>
        
        {!readOnly && (
          <button
            onClick={() => setShowAddWorker(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            <Plus size={14} />
            {t.addWorker}
          </button>
        )}
        
        <button
          onClick={() => setShowSmsDialog(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#fbbf24',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Bell size={14} />
          📱 Alerte SMS
        </button>
        
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download size={14} />
          {t.export}
        </button>
      </div>
      
      {/* Liste des travailleurs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compactMode ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '16px',
        padding: '20px'
      }}>
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              borderLeft: `4px solid ${worker.workTimer.isActive ? '#22c55e' : worker.workTimer.endTime ? '#3b82f6' : '#6b7280'}`
            }}
          >
            {/* En-tête travailleur */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <h4 style={{
                  color: '#e2e8f0',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  fontSize: '16px'
                }}>
                  {worker.name}
                </h4>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  margin: '0 0 4px 0'
                }}>
                  {worker.company} • #{worker.employeeNumber}
                </p>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  margin: 0
                }}>
                  📞 {worker.phoneNumber}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {worker.astValidated && (
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '10px',
                    color: '#86efac',
                    fontWeight: '600'
                  }}>
                    ✓ AST Validée
                  </div>
                )}
                
                {worker.workTimer.isActive && (
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    fontSize: '10px',
                    color: '#86efac',
                    fontWeight: '600',
                    animation: 'pulse 2s infinite'
                  }}>
                    ⏱️ EN COURS
                  </div>
                )}
              </div>
            </div>
            
            {/* Timer et temps */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>
                    {t.timer.total}
                  </span>
                  <span style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '16px' }}>
                    {formatDuration(worker.workTimer.totalTime)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>
                    Statut
                  </span>
                  <span style={{ 
                    color: worker.workTimer.isActive ? '#22c55e' : worker.workTimer.endTime ? '#3b82f6' : '#94a3b8',
                    fontWeight: '700', 
                    fontSize: '14px' 
                  }}>
                    {worker.workTimer.isActive ? t.status.working : 
                     worker.workTimer.endTime ? t.status.completed : 
                     t.status.notStarted}
                  </span>
                </div>
              </div>
              
              {worker.workTimer.startTime && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>{t.timer.start}: </span>
                    <span style={{ color: '#e2e8f0' }}>{formatTime(worker.workTimer.startTime)}</span>
                  </div>
                  {worker.workTimer.endTime && (
                    <div>
                      <span style={{ color: '#94a3b8' }}>{t.timer.end}: </span>
                      <span style={{ color: '#e2e8f0' }}>{formatTime(worker.workTimer.endTime)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Cadenas LOTO avec checkboxes */}
            {worker.assignedLocks.length > 0 && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                      {t.loto.assignedLocks} ({worker.assignedLocks.filter(l => l.isApplied).length}/{worker.assignedLocks.length})
                    </span>
                  </div>
                  <div style={{
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: worker.assignedLocks.some(l => l.isApplied) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: `1px solid ${worker.assignedLocks.some(l => l.isApplied) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                    fontSize: '10px',
                    color: worker.assignedLocks.some(l => l.isApplied) ? '#fca5a5' : '#86efac',
                    fontWeight: '600'
                  }}>
                    {worker.assignedLocks.some(l => l.isApplied) ? 'CADENAS ACTIFS' : 'TOUT RETIRÉ'}
                  </div>
                </div>
                
                {worker.assignedLocks.map((lock) => (
                  <div key={lock.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    border: lock.isApplied ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(100, 116, 139, 0.3)'
                  }}>
                    <input
                      type="checkbox"
                      checked={lock.isApplied}
                      onChange={(e) => toggleLock(worker.id, lock.id, e.target.checked)}
                      disabled={readOnly}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: lock.isApplied ? '#ef4444' : '#22c55e'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '11px',
                        color: lock.isApplied ? '#fca5a5' : '#fcd34d',
                        fontWeight: lock.isApplied ? '600' : '400'
                      }}>
                        🔒 {lock.lockNumber} - {lock.equipment}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <span>{lock.energyType}</span>
                        <span>📍 {lock.location}</span>
                        {lock.appliedTime && (
                          <span>⏰ {formatTime(lock.appliedTime)}</span>
                        )}
                      </div>
                    </div>
                    {lock.isApplied && (
                      <div style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        fontSize: '9px',
                        color: '#fca5a5',
                        fontWeight: '600'
                      }}>
                        ACTIF
                      </div>
                    )}
                  </div>
                ))}
                
                {!readOnly && (
                  <button
                    onClick={() => {
                      // TODO: Ouvrir modal pour ajouter un nouveau cadenas
                      const lockNumber = prompt('Numéro du cadenas:');
                      const equipment = prompt('Équipement:');
                      if (lockNumber && equipment) {
                        addLockToWorker(worker.id, { lockNumber, equipment, energyType: 'electrical', location: 'Zone A' });
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #f59e0b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      width: '100%',
                      justifyContent: 'center',
                      marginTop: '8px'
                    }}
                  >
                    <Plus size={10} />
                    Ajouter cadenas
                  </button>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {!worker.astValidated && !readOnly && (
                <button
                  onClick={() => setSelectedWorker(worker)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #8b5cf6',
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#c4b5fd',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <PenTool size={12} />
                  {t.sign}
                </button>
              )}
              
              {worker.astValidated && !worker.workTimer.isActive && !worker.workTimer.endTime && !readOnly && (
                <button
                  onClick={() => startWork(worker.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#86efac',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Play size={12} />
                  {t.startWork}
                </button>
              )}
              
              {worker.workTimer.isActive && !readOnly && (
                <button
                  onClick={() => endWork(worker.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Square size={12} />
                  {t.endWork}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal Signature */}
      {selectedWorker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>
                Signature - {selectedWorker.name}
              </h3>
              <button
                onClick={() => setSelectedWorker(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Texte de consentement */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              color: '#93c5fd'
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {t.consentText}
              </p>
            </div>
            
            {/* Zone de signature */}
            <div style={{
              border: '2px dashed #6b7280',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <canvas
                ref={signatureCanvasRef}
                width={500}
                height={200}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'crosshair'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <p style={{ margin: '12px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                Signez avec votre souris ou doigt (écran tactile)
              </p>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={clearSignature}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #6b7280',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Effacer
              </button>
              <button
                onClick={() => saveSignature(selectedWorker.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #22c55e',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#86efac',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✓ Valider et Signer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Ajouter Travailleur */}
      {showAddWorker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>
                {t.addWorker}
              </h3>
              <button
                onClick={() => setShowAddWorker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Formulaire d'ajout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {t.workerName} *
                </label>
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                  placeholder="Nom complet du travailleur"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {t.company} *
                </label>
                <input
                  type="text"
                  value={newWorker.company}
                  onChange={(e) => setNewWorker({...newWorker, company: e.target.value})}
                  placeholder="Nom de l'entreprise"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={newWorker.phoneNumber}
                  onChange={(e) => setNewWorker({...newWorker, phoneNumber: e.target.value})}
                  placeholder="+1 514 123-4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {t.employeeNumber}
                </label>
                <input
                  type="text"
                  value={newWorker.employeeNumber}
                  onChange={(e) => setNewWorker({...newWorker, employeeNumber: e.target.value})}
                  placeholder="Numéro d'employé"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            {/* Certifications */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: '#e2e8f0',
                fontSize: '14px',
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                {t.certifications} (optionnel)
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {['Espaces confinés', 'LOTO', 'Travail en hauteur', 'Soudure', 'Gaz', 'Premiers soins'].map((cert) => (
                  <button
                    key={cert}
                    onClick={() => {
                      if (newWorker.certification.includes(cert)) {
                        setNewWorker({
                          ...newWorker,
                          certification: newWorker.certification.filter(c => c !== cert)
                        });
                      } else {
                        setNewWorker({
                          ...newWorker,
                          certification: [...newWorker.certification, cert]
                        });
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: newWorker.certification.includes(cert) ? 
                        '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                      background: newWorker.certification.includes(cert) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                      color: newWorker.certification.includes(cert) ? '#86efac' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {newWorker.certification.includes(cert) ? '✓ ' : ''}{cert}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowAddWorker(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #6b7280',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddWorker}
                disabled={!newWorker.name.trim() || !newWorker.company.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  background: (!newWorker.name.trim() || !newWorker.company.trim()) ? 
                    'rgba(107, 114, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: (!newWorker.name.trim() || !newWorker.company.trim()) ? 
                    '#6b7280' : '#93c5fd',
                  cursor: (!newWorker.name.trim() || !newWorker.company.trim()) ? 
                    'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: (!newWorker.name.trim() || !newWorker.company.trim()) ? 0.5 : 1
                }}
              >
                <Plus size={16} style={{ marginRight: '6px', display: 'inline' }} />
                {t.addWorker}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal SMS */}
      {showSmsDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: 'white', margin: 0 }}>
                📱 Envoi d'alerte SMS
              </h3>
              <button
                onClick={() => setShowSmsDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Destinataires */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#93c5fd', margin: '0 0 12px 0', fontSize: '14px' }}>
                Destinataires ({workers.filter(w => w.phoneNumber).length} travailleurs)
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '8px',
                maxHeight: '120px',
                overflow: 'auto'
              }}>
                {workers.filter(w => w.phoneNumber).map(worker => (
                  <div key={worker.id} style={{
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0'
                  }}>
                    📱 {worker.name} - {worker.phoneNumber}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Message personnalisé */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                color: '#e2e8f0', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                Message personnalisé
              </label>
              <textarea
                value={customSmsMessage}
                onChange={(e) => setCustomSmsMessage(e.target.value)}
                placeholder="Tapez votre message d'alerte ici..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8', 
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {customSmsMessage.length}/160 caractères
              </div>
            </div>
            
            {/* Messages prédéfinis */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                color: '#e2e8f0', 
                fontSize: '14px', 
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                Messages rapides
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  '🚨 URGENCE: Arrêt immédiat des travaux',
                  '⚠️ Vérification LOTO requise',
                  '🔒 Nouveaux cadenas appliqués',
                  '📋 Réunion sécurité dans 15min',
                  '🎯 Fin des travaux - Retirer tous cadenas'
                ].map((message, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomSmsMessage(message)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    {message}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSmsDialog(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #6b7280',
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={sendCustomSMS}
                disabled={!customSmsMessage.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b',
                  background: customSmsMessage.trim() ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  color: customSmsMessage.trim() ? '#fbbf24' : '#6b7280',
                  cursor: customSmsMessage.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                📱 Envoyer SMS ({workers.filter(w => w.phoneNumber).length})
              </button>
            </div>
            
            {/* Historique SMS récent */}
            {smsAlerts.length > 0 && (
              <div style={{
                marginTop: '20px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ color: '#94a3b8', margin: '0 0 12px 0', fontSize: '12px' }}>
                  Historique récent
                </h4>
                <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                  {smsAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                      {formatTime(alert.sentAt)} - {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default WorkerRegistryAST;