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
  Award,
  X,
  Edit,
  Save,
  Trash2,
  BarChart3,
  Phone,
  Building,
  MapPin,
  Lock,
  Unlock,
  PenTool,
  Timer,
  UserCheck
} from 'lucide-react';

// =================== INTERFACES ===================
interface Worker {
  id: string;
  name: string;
  company: string;
  phoneNumber: string;
  location: string;
  signature: string;
  acknowledgedAST: boolean;
  startTime: string;
  endTime?: string;
  workDuration?: number; // en minutes
  createdAt: string;
}

interface LockoutStatus {
  applied: boolean;
  removed: boolean;
  notApplicable: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  lockoutPoints?: string[];
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
    lockoutSection: "Statut du Verrouillage LOTO",
    
    // Workers
    addWorker: "Ajouter un Travailleur",
    workerName: "Nom du Travailleur",
    company: "Compagnie",
    phoneNumber: "Numéro de Cellulaire",
    location: "Emplacement de Travail",
    signature: "Signature",
    acknowledgeAST: "J'ai pris connaissance de l'AST",
    startTime: "Heure de Début",
    endTime: "Heure de Fin",
    duration: "Durée",
    removeWorker: "Retirer ce travailleur",
    noWorkersYet: "Aucun travailleur enregistré",
    signHere: "Signer ici",
    workerVerified: "Travailleur vérifié",
    
    // Lockout
    lockoutApplied: "Cadenas Apposé",
    lockoutRemoved: "Cadenas Enlevé",
    lockoutNA: "Non Applicable (N/A)",
    lockoutVerification: "Vérification du Verrouillage",
    lockoutNotes: "Notes sur le verrouillage",
    lockoutPoints: "Points de verrouillage",
    
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
    
    // Form fields
    enterName: "Entrer le nom complet",
    enterCompany: "Entrer le nom de la compagnie",
    enterPhone: "Ex: 514-555-0123",
    selectLocation: "Sélectionner l'emplacement",
    enterNotes: "Entrer des notes (optionnel)",
    
    // Summary
    totalWorkers: "Travailleurs Présents",
    activeWorkers: "Travailleurs Actifs",
    completedWork: "Travaux Terminés",
    averageDuration: "Durée Moyenne",
    
    // Buttons
    add: "Ajouter",
    cancel: "Annuler",
    close: "Fermer",
    startWork: "Débuter",
    endWork: "Terminer",
    
    // Time
    hours: "heures",
    minutes: "minutes"
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
    startTime: "Start Time",
    endTime: "End Time",
    duration: "Duration",
    removeWorker: "Remove this worker",
    noWorkersYet: "No workers registered yet",
    signHere: "Sign here",
    workerVerified: "Worker verified",
    
    // Lockout
    lockoutApplied: "Lock Applied",
    lockoutRemoved: "Lock Removed",
    lockoutNA: "Not Applicable (N/A)",
    lockoutVerification: "Lockout Verification",
    lockoutNotes: "Lockout notes",
    lockoutPoints: "Lockout points",
    
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
    
    // Form fields
    enterName: "Enter full name",
    enterCompany: "Enter company name",
    enterPhone: "Ex: 514-555-0123",
    selectLocation: "Select location",
    enterNotes: "Enter notes (optional)",
    
    // Summary
    totalWorkers: "Workers Present",
    activeWorkers: "Active Workers",
    completedWork: "Work Completed",
    averageDuration: "Average Duration",
    
    // Buttons
    add: "Add",
    cancel: "Cancel",
    close: "Close",
    startWork: "Start",
    endWork: "End",
    
    // Time
    hours: "hours",
    minutes: "minutes"
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
      applied: false,
      removed: false,
      notApplicable: false
    },
    ...formData.validation
  }));

  const [showAddReviewer, setShowAddReviewer] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showSignature, setShowSignature] = useState<string | null>(null);
  
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
    acknowledgedAST: false
  });

  // Récupérer les emplacements de Step1
  const workLocations = formData.projectInfo?.workLocations || [];

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

    const worker: Worker = {
      id: Date.now().toString(),
      name: newWorker.name.trim(),
      company: newWorker.company.trim(),
      phoneNumber: newWorker.phoneNumber.trim(),
      location: newWorker.location || workLocations[0]?.name || 'Non spécifié',
      signature: `${newWorker.name} - Signé électroniquement`,
      acknowledgedAST: true,
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const updatedData = {
      ...validationData,
      workers: [...validationData.workers, worker]
    };

    setValidationData(updatedData);
    notifyParent(updatedData);

    // Reset formulaire
    setNewWorker({
      name: '',
      company: '',
      phoneNumber: '',
      location: '',
      acknowledgedAST: false
    });
    setShowAddWorker(false);
    
    console.log('✅ Travailleur ajouté:', worker.name);
  }, [newWorker, validationData, notifyParent, workLocations, t.mustAcknowledgeAST]);

  const removeWorker = useCallback((workerId: string) => {
    const updatedData = {
      ...validationData,
      workers: validationData.workers.filter(w => w.id !== workerId)
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  const endWorkerShift = useCallback((workerId: string) => {
    const updatedData = {
      ...validationData,
      workers: validationData.workers.map(worker => {
        if (worker.id === workerId && !worker.endTime) {
          const endTime = new Date().toISOString();
          const startTime = new Date(worker.startTime);
          const duration = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000); // en minutes
          
          return {
            ...worker,
            endTime,
            workDuration: duration
          };
        }
        return worker;
      })
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

  // =================== HANDLERS LOCKOUT ===================
  const updateLockoutStatus = useCallback((field: 'applied' | 'removed' | 'notApplicable') => {
    const updatedData = {
      ...validationData,
      lockoutStatus: {
        ...validationData.lockoutStatus,
        applied: field === 'applied',
        removed: field === 'removed',
        notApplicable: field === 'notApplicable',
        verifiedBy: 'Superviseur',
        verifiedAt: new Date().toISOString()
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

  const removeReviewer = useCallback((reviewerId: string) => {
    const updatedData = {
      ...validationData,
      reviewers: validationData.reviewers.filter(r => r.id !== reviewerId)
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
  }, [validationData, notifyParent]);

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

  const activeWorkers = validationData.workers.filter(w => !w.endTime).length;
  const completedWorkers = validationData.workers.filter(w => w.endTime).length;

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

        {/* Statistiques des travailleurs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
              {validationData.workers.length}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {t.totalWorkers}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
              {activeWorkers}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {t.activeWorkers}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
              {completedWorkers}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {t.completedWork}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
              {getAverageDuration()}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {t.averageDuration}
            </div>
          </div>
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
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
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
                    <div>
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
                    color: '#94a3b8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {worker.phoneNumber}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {worker.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(worker.startTime).toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {worker.endTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Timer size={12} />
                        {formatDuration(worker.workDuration || 0)}
                      </div>
                    )}
                  </div>

                  {worker.acknowledgedAST && (
                    <div style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#10b981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle size={12} />
                      {t.workerVerified}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {!worker.endTime ? (
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {t.endWork}
                    </button>
                  ) : (
                    <span style={{
                      padding: '8px 12px',
                      background: 'rgba(100, 116, 139, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#94a3b8',
                      textAlign: 'center'
                    }}>
                      {t.completed}
                    </span>
                  )}
                  
                  <button
                    onClick={() => removeWorker(worker.id)}
                    style={{
                      background: '#ef4444',
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

      {/* Section Statut du Verrouillage LOTO */}
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
          <Lock size={20} />
          {t.lockoutSection}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: `2px solid ${validationData.lockoutStatus.applied ? 'rgba(16, 185, 129, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            background: validationData.lockoutStatus.applied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.6)',
            transition: 'all 0.3s'
          }}>
            <input
              type="radio"
              name="lockoutStatus"
              checked={validationData.lockoutStatus.applied}
              onChange={() => updateLockoutStatus('applied')}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#10b981'
              }}
            />
            <Lock size={18} color={validationData.lockoutStatus.applied ? '#10b981' : '#94a3b8'} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: validationData.lockoutStatus.applied ? '#10b981' : '#e2e8f0'
            }}>
              {t.lockoutApplied}
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: `2px solid ${validationData.lockoutStatus.removed ? 'rgba(245, 158, 11, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            background: validationData.lockoutStatus.removed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(30, 41, 59, 0.6)',
            transition: 'all 0.3s'
          }}>
            <input
              type="radio"
              name="lockoutStatus"
              checked={validationData.lockoutStatus.removed}
              onChange={() => updateLockoutStatus('removed')}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#f59e0b'
              }}
            />
            <Unlock size={18} color={validationData.lockoutStatus.removed ? '#f59e0b' : '#94a3b8'} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: validationData.lockoutStatus.removed ? '#f59e0b' : '#e2e8f0'
            }}>
              {t.lockoutRemoved}
            </span>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            border: `2px solid ${validationData.lockoutStatus.notApplicable ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.3)'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            background: validationData.lockoutStatus.notApplicable ? 'rgba(100, 116, 139, 0.2)' : 'rgba(30, 41, 59, 0.6)',
            transition: 'all 0.3s'
          }}>
            <input
              type="radio"
              name="lockoutStatus"
              checked={validationData.lockoutStatus.notApplicable}
              onChange={() => updateLockoutStatus('notApplicable')}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#94a3b8'
              }}
            />
            <X size={18} color={validationData.lockoutStatus.notApplicable ? '#94a3b8' : '#64748b'} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: validationData.lockoutStatus.notApplicable ? '#94a3b8' : '#e2e8f0'
            }}>
              {t.lockoutNA}
            </span>
          </label>
        </div>

        {validationData.lockoutStatus.verifiedAt && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            {t.lockoutVerification}: {validationData.lockoutStatus.verifiedBy} - {' '}
            {new Date(validationData.lockoutStatus.verifiedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
          </div>
        )}
      </div>

      {/* Section Critères de Validation (existante) */}
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
              </div>

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
                  <div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {t.acknowledgeAST} *
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      {t.signature}: {newWorker.name || '_______________'}
                    </span>
                  </div>
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
    </div>
  );
}
