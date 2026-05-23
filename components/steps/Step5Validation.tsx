'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  Shield, 
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Calendar,
  User,
  Badge,
  Plus,
  Send,
  MapPin,
  Building,
  Award,
  X,
  Edit,
  Save,
  Trash2,
  BarChart3,
  Phone,
  Lock,
  Unlock,
  PenTool,
  Timer,
  UserCheck,
  PlayCircle,
  StopCircle
} from 'lucide-react';

// =================== INTERFACES ===================
interface Worker {
  id: string;
  name: string;
  company: string;
  phoneNumber: string;
  location: string;
  signature: string;
  signatureTimestamp: string; // Horodatage de la signature
  acknowledgedAST: boolean;
  lockApplied: boolean; // Cadenas apposé par ce travailleur
  lockRemovedAt?: string; // Quand le cadenas a été enlevé
  workStartTime?: string; // Début des travaux
  workEndTime?: string; // Fin des travaux
  workDuration?: number; // Durée en minutes
  createdAt: string;
}

interface LockoutStatus {
  totalLocks: number; // Nombre total de cadenas
  locksApplied: number; // Cadenas apposés
  locksRemoved: number; // Cadenas enlevés
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  certification?: string;
  status: 'approved' | 'pending' | 'rejected' | 'reviewing';
  comments?: string;
  rating?: number;
  validatedAt?: string;
  signature?: string;
}

interface ValidationData {
  // Données existantes
  reviewers: TeamMember[];
  approvalRequired: boolean;
  minimumReviewers: number;
  reviewDeadline?: string;
  validationCriteria: {
    hazardIdentification: boolean;
    controlMeasures: boolean;
    equipmentSelection: boolean;
    procedural: boolean;
    regulatory: boolean;
  };
  finalApproval?: {
    approvedBy: string;
    approvedAt: string;
    signature: string;
    conditions?: string;
  };
  
  // Nouvelles données
  workers: Worker[];
  lockoutStatus: LockoutStatus;
  totalWorkTime?: number; // Temps total de travail en minutes
}

interface ValidationStepProps {
  formData: {
    validation?: ValidationData;
    projectInfo?: any;
    hazards?: any;
    equipment?: any;
    permits?: any;
  };
  onDataChange: (section: string, data: ValidationData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Validation & Vérification Équipe",
    subtitle: "Processus de validation collaborative et vérification des travailleurs",
    
    // Sections
    reviewersSection: "Réviseurs Désignés",
    validationCriteria: "Critères de Validation",
    validationSummary: "Résumé de Validation",
    workersSection: "Vérification des Travailleurs",
    lockoutSection: "Statut des Cadenas LOTO",
    
    // Workers
    addWorker: "Ajouter un Travailleur",
    workerName: "Nom du Travailleur",
    company: "Compagnie",
    phoneNumber: "Numéro de Cellulaire",
    location: "Emplacement de Travail",
    signature: "Signature",
    acknowledgeAST: "J'ai pris connaissance de l'AST",
    startWork: "Début Travaux",
    endWork: "Fin Travaux",
    duration: "Durée",
    removeWorker: "Retirer ce travailleur",
    noWorkersYet: "Aucun travailleur enregistré",
    signHere: "Signature automatique",
    workerVerified: "Travailleur vérifié",
    workInProgress: "Travaux en cours",
    workCompleted: "Travaux terminés",
    
    // Lockout
    lockoutApplied: "Cadenas Apposé",
    lockoutRemoved: "Cadenas Enlevé",
    lockoutPending: "En attente",
    lockoutSummary: "Résumé des Cadenas",
    totalLocks: "Total Cadenas",
    locksApplied: "Cadenas Apposés",
    locksRemoved: "Cadenas Enlevés",
    locksPending: "En Attente",
    
    // Reviewers
    addReviewer: "Ajouter un Réviseur",
    reviewerName: "Nom du Réviseur",
    reviewerRole: "Rôle",
    reviewerEmail: "Email",
    department: "Département",
    certification: "Certification",
    removeReviewer: "Retirer ce réviseur",
    
    // Status
    pending: "En Attente",
    reviewing: "En Révision",
    approved: "Approuvé",
    rejected: "Rejeté",
    active: "Actif",
    completed: "Terminé",
    
    // Actions
    approve: "Approuver",
    reject: "Rejeter",
    sign: "Signer",
    verify: "Vérifier",
    
    // Validation criteria
    hazardIdentification: "Identification des Dangers",
    controlMeasures: "Mesures de Contrôle",
    equipmentSelection: "Sélection d'Équipements",
    procedural: "Procédures",
    regulatory: "Conformité Réglementaire",
    
    // Messages
    allCriteriaRequired: "Tous les critères doivent être validés",
    readyForApproval: "Prêt pour l'approbation finale",
    documentApproved: "Document Approuvé",
    workerAdded: "Travailleur ajouté avec succès",
    mustAcknowledgeAST: "Le travailleur doit confirmer avoir pris connaissance de l'AST",
    signatureRecorded: "Signature enregistrée",
    
    // Form fields
    enterName: "Entrer le nom complet",
    enterCompany: "Entrer le nom de la compagnie",
    enterPhone: "Ex: 514-555-0123",
    selectLocation: "Sélectionner l'emplacement",
    createNewLocation: "Créer nouvel emplacement",
    newLocationName: "Nom de l'emplacement",
    newLocationZone: "Zone de travail",
    newLocationDescription: "Description (optionnel)",
    enterNotes: "Entrer des notes (optionnel)",
    
    // Summary
    totalWorkers: "Travailleurs Présents",
    activeWorkers: "Travailleurs Actifs",
    completedWork: "Travaux Terminés",
    totalWorkTime: "Temps Total",
    averageDuration: "Durée Moyenne",
    
    // Buttons
    add: "Ajouter",
    cancel: "Annuler",
    close: "Fermer",
    startWorkBtn: "Débuter Travaux",
    endWorkBtn: "Terminer Travaux",
    
    // Time
    hours: "heures",
    minutes: "minutes",
    signedAt: "Signé le"
  },
  en: {
    title: "Team Validation & Verification",
    subtitle: "Collaborative validation process and worker verification",
    
    // Sections
    reviewersSection: "Designated Reviewers",
    validationCriteria: "Validation Criteria",
    validationSummary: "Validation Summary",
    workersSection: "Worker Verification",
    lockoutSection: "LOTO Lockout Status",
    
    // Workers
    addWorker: "Add Worker",
    workerName: "Worker Name",
    company: "Company",
    phoneNumber: "Cell Phone Number",
    location: "Work Location",
    signature: "Signature",
    acknowledgeAST: "I acknowledge the JSA",
    startWork: "Work Start",
    endWork: "Work End",
    duration: "Duration",
    removeWorker: "Remove this worker",
    noWorkersYet: "No workers registered yet",
    signHere: "Automatic signature",
    workerVerified: "Worker verified",
    workInProgress: "Work in progress",
    workCompleted: "Work completed",
    
    // Lockout
    lockoutApplied: "Lock Applied",
    lockoutRemoved: "Lock Removed",
    lockoutPending: "Pending",
    lockoutSummary: "Lockout Summary",
    totalLocks: "Total Locks",
    locksApplied: "Locks Applied",
    locksRemoved: "Locks Removed",
    locksPending: "Pending",
    
    // Reviewers
    addReviewer: "Add Reviewer",
    reviewerName: "Reviewer Name",
    reviewerRole: "Role",
    reviewerEmail: "Email",
    department: "Department",
    certification: "Certification",
    removeReviewer: "Remove this reviewer",
    
    // Status
    pending: "Pending",
    reviewing: "Reviewing",
    approved: "Approved",
    rejected: "Rejected",
    active: "Active",
    completed: "Completed",
    
    // Actions
    approve: "Approve",
    reject: "Reject",
    sign: "Sign",
    verify: "Verify",
    
    // Validation criteria
    hazardIdentification: "Hazard Identification",
    controlMeasures: "Control Measures",
    equipmentSelection: "Equipment Selection",
    procedural: "Procedures",
    regulatory: "Regulatory Compliance",
    
    // Messages
    allCriteriaRequired: "All criteria must be validated",
    readyForApproval: "Ready for final approval",
    documentApproved: "Document Approved",
    workerAdded: "Worker added successfully",
    mustAcknowledgeAST: "Worker must acknowledge the JSA",
    signatureRecorded: "Signature recorded",
    
    // Form fields
    enterName: "Enter full name",
    enterCompany: "Enter company name",
    enterPhone: "Ex: 514-555-0123",
    selectLocation: "Select location",
    createNewLocation: "Create new location",
    newLocationName: "Location name",
    newLocationZone: "Work zone",
    newLocationDescription: "Description (optional)",
    enterNotes: "Enter notes (optional)",
    
    // Summary
    totalWorkers: "Workers Present",
    activeWorkers: "Active Workers",
    completedWork: "Work Completed",
    totalWorkTime: "Total Time",
    averageDuration: "Average Duration",
    
    // Buttons
    add: "Add",
    cancel: "Cancel",
    close: "Close",
    startWorkBtn: "Start Work",
    endWorkBtn: "End Work",
    
    // Time
    hours: "hours",
    minutes: "minutes",
    signedAt: "Signed on"
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export default function Step5Validation({ 
  formData, 
  onDataChange, 
  language = 'fr',
  tenant 
}: ValidationStepProps) {
  const t = translations[language];
  
  // =================== ÉTATS ===================
  const [validationData, setValidationData] = useState<ValidationData>(() => ({
    reviewers: [],
    approvalRequired: true,
    minimumReviewers: 2,
    reviewDeadline: '',
    validationCriteria: {
      hazardIdentification: false,
      controlMeasures: false,
      equipmentSelection: false,
      procedural: false,
      regulatory: false
    },
    workers: [],
    lockoutStatus: {
      totalLocks: 0,
      locksApplied: 0,
      locksRemoved: 0
    },
    totalWorkTime: 0,
    ...formData.validation
  }));

  const [showAddReviewer, setShowAddReviewer] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  
  const [newReviewer, setNewReviewer] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    certification: ''
  });

  const [newWorker, setNewWorker] = useState({
    name: '',
    company: '',
    phoneNumber: '',
    location: '',
    acknowledgedAST: false,
    lockApplied: false
  });

  const [newLocation, setNewLocation] = useState({
    name: '',
    zone: '',
    description: ''
  });

  // Récupérer les emplacements de Step1
  const workLocations = formData.projectInfo?.workLocations || [];

  // =================== CALCUL TEMPS TOTAL ===================
  useEffect(() => {
    const calculateTotalTime = () => {
      const total = validationData.workers.reduce((sum, worker) => {
        if (worker.workDuration) {
          return sum + worker.workDuration;
        }
        return sum;
      }, 0);
      
      if (total !== validationData.totalWorkTime) {
        const updatedData = {
          ...validationData,
          totalWorkTime: total
        };
        setValidationData(updatedData);
        notifyParent(updatedData);
      }
    };
    
    calculateTotalTime();
  }, [validationData.workers]);

  // =================== NOTIFICATION PARENT ===================
  const notifyParent = useCallback((newData: ValidationData) => {
    console.log('🔄 Step5 - Mise à jour:', newData);
    onDataChange('validation', newData);
  }, [onDataChange]);

  // =================== HANDLERS WORKERS ===================
  const addWorker = useCallback(() => {
    if (!newWorker.name.trim() || !newWorker.company.trim() || !newWorker.phoneNumber.trim()) {
      return;
    }

    if (!newWorker.acknowledgedAST) {
      alert(t.mustAcknowledgeAST);
      return;
    }

    const now = new Date();
    const signatureTimestamp = now.toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const worker: Worker = {
      id: Date.now().toString(),
      name: newWorker.name.trim(),
      company: newWorker.company.trim(),
      phoneNumber: newWorker.phoneNumber.trim(),
      location: newWorker.location || workLocations[0]?.name || 'Non spécifié',
      signature: `${newWorker.name.trim()} - Signé électroniquement`,
      signatureTimestamp: signatureTimestamp,
      acknowledgedAST: true,
      lockApplied: newWorker.lockApplied,
      createdAt: now.toISOString()
    };

    const updatedData = {
      ...validationData,
      workers: [...validationData.workers, worker],
      lockoutStatus: {
        ...validationData.lockoutStatus,
        totalLocks: validationData.lockoutStatus.totalLocks + 1,
        locksApplied: newWorker.lockApplied 
          ? validationData.lockoutStatus.locksApplied + 1 
          : validationData.lockoutStatus.locksApplied
      }
    };

    setValidationData(updatedData);
    notifyParent(updatedData);

    // Reset formulaire
    setNewWorker({
      name: '',
      company: '',
      phoneNumber: '',
      location: '',
      acknowledgedAST: false,
      lockApplied: false
    });
    setShowAddWorker(false);
    
    console.log('✅ Travailleur ajouté:', worker.name);
  }, [newWorker, validationData, notifyParent, workLocations, t.mustAcknowledgeAST, language]);

  const createNewLocationAndSync = useCallback(() => {
    if (!newLocation.name.trim() || !newLocation.zone.trim()) {
      console.log('Nom et zone requis pour créer un emplacement');
      return;
    }

    // Créer le nouvel emplacement
    const location = {
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newLocation.name.trim(),
      description: newLocation.description?.trim() || '',
      zone: newLocation.zone.trim(),
      building: undefined,
      floor: undefined,
      maxWorkersReached: 0,
      currentWorkers: 0,
      lockoutPoints: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      estimatedDuration: '8 hours',
      startTime: '08:00',
      endTime: '16:00'
    };

    // Mettre à jour Step1 - ajouter à la liste des emplacements
    const updatedStep1 = {
      ...formData.projectInfo,
      workLocations: [...(formData.projectInfo?.workLocations || []), location]
    };

    // Notifier le parent pour synchroniser Step1
    onDataChange('projectInfo', updatedStep1);

    // Sélectionner automatiquement le nouvel emplacement pour le travailleur
    setNewWorker(prev => ({ ...prev, location: location.name }));

    // Réinitialiser le formulaire
    setNewLocation({
      name: '',
      zone: '',
      description: ''
    });
    setShowCreateLocation(false);
    
    console.log('✅ Emplacement créé et synchronisé:', location.name);
  }, [newLocation, formData.projectInfo, onDataChange]);

  const removeWorker = useCallback((workerId: string) => {
    const worker = validationData.workers.find(w => w.id === workerId);
    if (!worker) return;

    const updatedData = {
      ...validationData,
      workers: validationData.workers.filter(w => w.id !== workerId),
      lockoutStatus: {
        ...validationData.lockoutStatus,
        totalLocks: validationData.lockoutStatus.totalLocks - 1,
        locksApplied: worker.lockApplied 
          ? validationData.lockoutStatus.locksApplied - 1 
          : validationData.lockoutStatus.locksApplied,
        locksRemoved: worker.lockRemovedAt 
          ? validationData.lockoutStatus.locksRemoved - 1 
          : validationData.lockoutStatus.locksRemoved
      }
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  const startWorkerShift = useCallback((workerId: string) => {
    const updatedData = {
      ...validationData,
      workers: validationData.workers.map(worker => {
        if (worker.id === workerId && !worker.workStartTime) {
          return {
            ...worker,
            workStartTime: new Date().toISOString()
          };
        }
        return worker;
      })
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  const endWorkerShift = useCallback((workerId: string) => {
    const updatedData = {
      ...validationData,
      workers: validationData.workers.map(worker => {
        if (worker.id === workerId && worker.workStartTime && !worker.workEndTime) {
          const endTime = new Date().toISOString();
          const startTime = new Date(worker.workStartTime);
          const duration = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000); // en minutes
          
          return {
            ...worker,
            workEndTime: endTime,
            workDuration: duration
          };
        }
        return worker;
      })
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  const toggleWorkerLock = useCallback((workerId: string) => {
    const updatedData = {
      ...validationData,
      workers: validationData.workers.map(worker => {
        if (worker.id === workerId) {
          const isRemoving = worker.lockApplied && !worker.lockRemovedAt;
          return {
            ...worker,
            lockRemovedAt: isRemoving ? new Date().toISOString() : undefined
          };
        }
        return worker;
      }),
      lockoutStatus: {
        ...validationData.lockoutStatus,
        locksRemoved: validationData.workers.find(w => w.id === workerId)?.lockApplied && 
                      !validationData.workers.find(w => w.id === workerId)?.lockRemovedAt
          ? validationData.lockoutStatus.locksRemoved + 1
          : validationData.lockoutStatus.locksRemoved - 1
      }
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  // =================== HANDLERS REVIEWERS (existants) ===================
  const addReviewer = useCallback(() => {
    if (!newReviewer.name.trim() || !newReviewer.email.trim() || !newReviewer.role.trim()) {
      return;
    }

    const reviewer: TeamMember = {
      id: Date.now().toString(),
      name: newReviewer.name.trim(),
      role: newReviewer.role.trim(),
      email: newReviewer.email.trim(),
      department: newReviewer.department.trim() || 'Non spécifié',
      certification: newReviewer.certification.trim() || undefined,
      status: 'pending'
    };

    const updatedData = {
      ...validationData,
      reviewers: [...validationData.reviewers, reviewer]
    };

    setValidationData(updatedData);
    notifyParent(updatedData);
    
    setNewReviewer({
      name: '',
      role: '',
      email: '',
      department: '',
      certification: ''
    });
    setShowAddReviewer(false);
  }, [newReviewer, validationData, notifyParent]);

  const updateCriteria = useCallback((criteria: keyof ValidationData['validationCriteria'], value: boolean) => {
    const updatedData = {
      ...validationData,
      validationCriteria: {
        ...validationData.validationCriteria,
        [criteria]: value
      }
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  // =================== FONCTIONS UTILITAIRES ===================
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getAverageDuration = () => {
    const completedWorkers = validationData.workers.filter(w => w.workDuration);
    if (completedWorkers.length === 0) return '0m';
    
    const totalMinutes = completedWorkers.reduce((sum, w) => sum + (w.workDuration || 0), 0);
    return formatDuration(Math.round(totalMinutes / completedWorkers.length));
  };

  const activeWorkers = validationData.workers.filter(w => w.workStartTime && !w.workEndTime).length;
  const completedWorkers = validationData.workers.filter(w => w.workEndTime).length;
  const locksPending = validationData.lockoutStatus.totalLocks - 
                      validationData.lockoutStatus.locksApplied - 
                      validationData.lockoutStatus.locksRemoved;

  // =================== RENDU ===================
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
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
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
          <Shield size={28} />
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

      {/* Dashboard Sommaire Global */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
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
          <BarChart3 size={20} />
          Dashboard - Vue d'ensemble
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          {/* Cadenas */}
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Lock size={20} style={{ margin: '0 auto 8px', color: '#10b981' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {validationData.lockoutStatus.locksApplied}/{validationData.lockoutStatus.totalLocks}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.locksApplied}
            </div>
          </div>
          
          {/* Travailleurs */}
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <Users size={20} style={{ margin: '0 auto 8px', color: '#3b82f6' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
              {validationData.workers.length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.totalWorkers}
            </div>
          </div>
          
          {/* Travaux actifs */}
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <PlayCircle size={20} style={{ margin: '0 auto 8px', color: '#f59e0b' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {activeWorkers}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.activeWorkers}
            </div>
          </div>
          
          {/* Temps total */}
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <Timer size={20} style={{ margin: '0 auto 8px', color: '#8b5cf6' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
              {formatDuration(validationData.totalWorkTime || 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.totalWorkTime}
            </div>
          </div>
        </div>
      </div>

      {/* Section Vérification des Travailleurs */}
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
            <UserCheck size={20} />
            {t.workersSection}
          </h3>
          <button
            onClick={() => setShowAddWorker(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
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
        {validationData.workers.length > 0 ? (
          validationData.workers.map(worker => (
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
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: worker.workStartTime && !worker.workEndTime 
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : worker.workEndTime
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #64748b, #475569)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>
                        {worker.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                        {worker.company}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {worker.phoneNumber}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {worker.location}
                    </div>
                  </div>

                  {/* Signature avec horodatage */}
                  {worker.acknowledgedAST && (
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <PenTool size={14} color="#10b981" />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
                          {t.signatureRecorded}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {worker.signature}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                        {t.signedAt}: {worker.signatureTimestamp}
                      </div>
                    </div>
                  )}

                  {/* Statut cadenas */}
                  {worker.lockApplied && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      background: worker.lockRemovedAt 
                        ? 'rgba(245, 158, 11, 0.1)' 
                        : 'rgba(16, 185, 129, 0.1)',
                      border: `1px solid ${worker.lockRemovedAt 
                        ? 'rgba(245, 158, 11, 0.3)' 
                        : 'rgba(16, 185, 129, 0.3)'}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: worker.lockRemovedAt ? '#f59e0b' : '#10b981',
                      marginBottom: '8px'
                    }}>
                      {worker.lockRemovedAt ? <Unlock size={12} /> : <Lock size={12} />}
                      {worker.lockRemovedAt ? t.lockoutRemoved : t.lockoutApplied}
                    </div>
                  )}

                  {/* Temps de travail */}
                  {worker.workStartTime && (
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      fontSize: '11px',
                      color: '#94a3b8'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {t.startWork}: {new Date(worker.workStartTime).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {worker.workEndTime && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <StopCircle size={12} />
                            {t.endWork}: {new Date(worker.workEndTime).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6' }}>
                            <Timer size={12} />
                            {formatDuration(worker.workDuration || 0)}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Boutons travaux */}
                  {!worker.workStartTime ? (
                    <button
                      onClick={() => startWorkerShift(worker.id)}
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <PlayCircle size={14} />
                      {t.startWorkBtn}
                    </button>
                  ) : !worker.workEndTime ? (
                    <button
                      onClick={() => endWorkerShift(worker.id)}
                      style={{
                        background: '#f59e0b',
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <StopCircle size={14} />
                      {t.endWorkBtn}
                    </button>
                  ) : (
                    <span style={{
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#10b981',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {t.workCompleted}
                    </span>
                  )}

                  {/* Bouton cadenas */}
                  {worker.lockApplied && !worker.lockRemovedAt && worker.workEndTime && (
                    <button
                      onClick={() => toggleWorkerLock(worker.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Unlock size={12} />
                      Enlever cadenas
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeWorker(worker.id)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: '#94a3b8'
          }}>
            <UserCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>{t.noWorkersYet}</p>
          </div>
        )}
      </div>

      {/* Section Critères de Validation */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
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
          <CheckCircle size={20} />
          {t.validationCriteria}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(validationData.validationCriteria).map(([key, value]) => (
            <label key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              border: `2px solid ${value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              background: value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.6)',
              transition: 'all 0.3s',
              minHeight: '56px'
            }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateCriteria(key as keyof ValidationData['validationCriteria'], e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6',
                  minWidth: '18px',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: value ? '#10b981' : '#e2e8f0',
                flex: 1
              }}>
                {t[key as keyof typeof t] || key}
              </span>
              {value && <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />}
            </label>
          ))}
        </div>
      </div>

      {/* Modal Ajouter Travailleur */}
      {showAddWorker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0
              }}>
                {t.addWorker}
              </h3>
              <button
                onClick={() => setShowAddWorker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#94a3b8'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.workerName} *
                </label>
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker(prev => ({...prev, name: e.target.value}))}
                  placeholder={t.enterName}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.company} *
                </label>
                <input
                  type="text"
                  value={newWorker.company}
                  onChange={(e) => setNewWorker(prev => ({...prev, company: e.target.value}))}
                  placeholder={t.enterCompany}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.phoneNumber} *
                </label>
                <input
                  type="tel"
                  value={newWorker.phoneNumber}
                  onChange={(e) => setNewWorker(prev => ({...prev, phoneNumber: e.target.value}))}
                  placeholder={t.enterPhone}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.location}
                </label>
                <select
                  value={newWorker.location}
                  onChange={(e) => setNewWorker(prev => ({...prev, location: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">{t.selectLocation}</option>
                  {workLocations.map((loc: any) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                
                {/* Bouton créer nouvel emplacement */}
                <button
                  type="button"
                  onClick={() => setShowCreateLocation(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    color: '#10b981',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                  }}
                >
                  <Plus size={16} />
                  {t.createNewLocation}
                </button>
              </div>

              {/* Case consentement AST */}
              <div style={{
                padding: '16px',
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={newWorker.acknowledgedAST}
                    onChange={(e) => setNewWorker(prev => ({...prev, acknowledgedAST: e.target.checked}))}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: '#10b981'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      {t.acknowledgeAST} *
                    </span>
                    {newWorker.acknowledgedAST && newWorker.name && (
                      <div style={{
                        padding: '8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#10b981'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {t.signHere}:
                        </div>
                        <div>{newWorker.name} - Signé électroniquement</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                          {new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Case cadenas */}
              <div style={{
                padding: '16px',
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={newWorker.lockApplied}
                    onChange={(e) => setNewWorker(prev => ({...prev, lockApplied: e.target.checked}))}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#f59e0b'
                    }}
                  />
                  <Lock size={18} color={newWorker.lockApplied ? '#f59e0b' : '#64748b'} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: newWorker.lockApplied ? '#f59e0b' : '#e2e8f0'
                  }}>
                    {t.lockoutApplied}
                  </span>
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={addWorker}
                disabled={!newWorker.name.trim() || !newWorker.company.trim() || !newWorker.phoneNumber.trim() || !newWorker.acknowledgedAST}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '14px',
                  opacity: (!newWorker.name.trim() || !newWorker.company.trim() || !newWorker.phoneNumber.trim() || !newWorker.acknowledgedAST) ? 0.5 : 1
                }}
              >
                {t.add}
              </button>
              <button
                onClick={() => setShowAddWorker(false)}
                style={{
                  flex: 1,
                  background: 'rgba(100, 116, 139, 0.6)',
                  color: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'emplacement */}
      {showCreateLocation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <MapPin style={{ color: '#10b981' }} size={24} />
              {t.createNewLocation}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Nom de l'emplacement */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.newLocationName} *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Atelier de soudure"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Zone de travail */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.newLocationZone} *
                </label>
                <input
                  type="text"
                  value={newLocation.zone}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, zone: e.target.value }))}
                  placeholder="Ex: Zone industrielle A"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  {t.newLocationDescription}
                </label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée de l'emplacement..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={createNewLocationAndSync}
                disabled={!newLocation.name.trim() || !newLocation.zone.trim()}
                style={{
                  flex: 1,
                  background: (!newLocation.name.trim() || !newLocation.zone.trim()) 
                    ? 'rgba(100, 116, 139, 0.6)' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: (!newLocation.name.trim() || !newLocation.zone.trim()) ? 'not-allowed' : 'pointer',
                  minHeight: '48px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Building size={16} />
                Créer l'emplacement
              </button>
              <button
                onClick={() => {
                  setShowCreateLocation(false);
                  setNewLocation({ name: '', zone: '', description: '' });
                }}
                style={{
                  flex: 1,
                  background: 'rgba(100, 116, 139, 0.6)',
                  color: 'white',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
