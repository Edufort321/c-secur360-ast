'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Users, Shield, 
  User, Clock, Award, MessageSquare, ThumbsUp,
  Edit, Save, Star, Calendar, Plus, X
} from 'lucide-react';

// Importer le WorkerRegistryAST et SMS
import WorkerRegistryAST from '@/components/workers/WorkerRegistryAST';
import SMSNotification from '@/components/notifications/SMSNotification';

// =================== INTERFACES ===================
interface Step4ValidationProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any;
}

interface Reviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  rating?: number;
  approvedAt?: string;
  signature?: string;
}

interface ValidationCriteria {
  projectInfo: boolean;
  equipmentPPE: boolean;
  hazardControl: boolean;
  riskAssessment: boolean;
  completeness: boolean;
}

// =================== SYSTÈME DE TRADUCTIONS ===================
const translations = {
  fr: {
    title: "✅ Validation et Approbation",
    subtitle: "Validation finale de l'AST par les superviseurs et responsables sécurité",
    
    // Sections
    validationCriteria: "Critères de validation",
    reviewTeam: "Équipe de révision",
    finalApproval: "Approbation finale",
    
    // Critères
    criteria: {
      projectInfo: "Informations projet complètes",
      equipmentPPE: "EPI et équipements sélectionnés",
      hazardControl: "Dangers identifiés et contrôlés", 
      riskAssessment: "Évaluation des risques acceptable",
      completeness: "Complétude générale de l'AST"
    },
    
    // Statuts
    status: {
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté"
    },
    
    // Actions
    actions: {
      addReviewer: "Ajouter réviseur",
      approve: "Approuver",
      reject: "Rejeter", 
      saveComments: "Sauvegarder commentaires",
      requestChanges: "Demander modifications",
      validate: "Valider l'AST",
      cancel: "Annuler"
    },
    
    // Formulaires
    form: {
      reviewerName: "Nom du réviseur",
      reviewerRole: "Rôle/Fonction",
      reviewerEmail: "Email",
      comments: "Commentaires",
      commentsPlaceholder: "Commentaires sur l'AST...",
      rating: "Note (1-5)",
      signature: "Signature électronique"
    },
    
    // Messages
    messages: {
      allCriteriaRequired: "Tous les critères doivent être validés",
      reviewerAdded: "Réviseur ajouté avec succès",
      validationComplete: "Validation complétée",
      approvalPending: "En attente d'approbation",
      noReviewers: "Aucun réviseur assigné"
    },
    
    // Stats
    stats: {
      criteriaValid: "Critères validés",
      reviewersAssigned: "Réviseurs assignés",
      approvalsReceived: "Approbations reçues",
      overallStatus: "Statut général"
    }
  },
  
  en: {
    title: "✅ Validation and Approval",
    subtitle: "Final JSA validation by supervisors and safety personnel",
    
    // Sections
    validationCriteria: "Validation criteria",
    reviewTeam: "Review team",
    finalApproval: "Final approval",
    
    // Criteria
    criteria: {
      projectInfo: "Complete project information",
      equipmentPPE: "PPE and equipment selected",
      hazardControl: "Hazards identified and controlled",
      riskAssessment: "Acceptable risk assessment",
      completeness: "Overall JSA completeness"
    },
    
    // Status
    status: {
      pending: "Pending",
      approved: "Approved", 
      rejected: "Rejected"
    },
    
    // Actions
    actions: {
      addReviewer: "Add reviewer",
      approve: "Approve",
      reject: "Reject",
      saveComments: "Save comments",
      requestChanges: "Request changes",
      validate: "Validate JSA",
      cancel: "Cancel"
    },
    
    // Forms
    form: {
      reviewerName: "Reviewer name",
      reviewerRole: "Role/Function",
      reviewerEmail: "Email",
      comments: "Comments",
      commentsPlaceholder: "Comments on JSA...",
      rating: "Rating (1-5)",
      signature: "Electronic signature"
    },
    
    // Messages
    messages: {
      allCriteriaRequired: "All criteria must be validated",
      reviewerAdded: "Reviewer added successfully",
      validationComplete: "Validation completed",
      approvalPending: "Pending approval",
      noReviewers: "No reviewers assigned"
    },
    
    // Stats
    stats: {
      criteriaValid: "Criteria validated",
      reviewersAssigned: "Reviewers assigned",
      approvalsReceived: "Approvals received",
      overallStatus: "Overall status"
    }
  }
};

const Step4Validation: React.FC<Step4ValidationProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  // =================== TRADUCTIONS ===================
  const t = translations[language];
  
  // =================== FONCTIONS UTILITAIRES ===================
  
  const formatWorkTime = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes === 0) return '0h 0m 0s';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    // Pour les secondes, on utilise la partie décimale des minutes * 60
    const seconds = Math.floor((totalMinutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // =================== ÉTATS ===================
  const [criteria, setCriteria] = useState<ValidationCriteria>(
    formData.validation?.criteria || {
      projectInfo: false,
      equipmentPPE: false,
      hazardControl: false,
      riskAssessment: false,
      completeness: false
    }
  );
  
  const [reviewers, setReviewers] = useState<Reviewer[]>(
    formData.validation?.reviewers || []
  );
  
  const [newReviewer, setNewReviewer] = useState({
    name: '',
    role: '',
    email: '',
    comments: ''
  });
  
  const [isAddingReviewer, setIsAddingReviewer] = useState(false);
  const [editingComments, setEditingComments] = useState<string | null>(null);
  const [tempComments, setTempComments] = useState('');

  // =================== ÉTATS STATISTIQUES TRAVAILLEURS ===================
  const [workerStats, setWorkerStats] = useState({
    totalWorkers: 0,
    activeWorkers: 0,
    locksApplied: 0,
    locksRemoved: 0,
    locksNA: 0,
    signedAST: 0,
    pendingSignatures: 0,
    totalWorkTime: 0,
    averageWorkTime: 0,
    workLocations: [] as string[]
  });

  // =================== CALLBACK STATISTIQUES TRAVAILLEURS ===================
  const handleWorkerStatsChange = (stats: any) => {
    setWorkerStats({
      totalWorkers: stats.totalWorkers,
      activeWorkers: stats.activeWorkers,
      locksApplied: stats.locksApplied,
      locksRemoved: stats.locksRemoved,
      locksNA: stats.locksNA,
      signedAST: stats.signedAST,
      pendingSignatures: stats.totalWorkers - stats.signedAST,
      totalWorkTime: stats.totalWorkTime,
      averageWorkTime: stats.totalWorkers > 0 ? Math.round(stats.totalWorkTime / stats.totalWorkers) : 0,
      workLocations: stats.workLocations || []
    });
  };

  // =================== CALLBACKS EXPORT SYSTÈME ===================
  const handleWorkersExport = (data: any) => {
    console.log('🔄 Export Workers Data:', data);
    // Ici, les données peuvent être envoyées à un store global, API, ou autre système
    // Exemple : dispatch(updateWorkersData(data));
  };

  const handleHRDataExport = (hrData: any[]) => {
    console.log('👥 Export HR Data:', hrData);
    // Données formatées pour le module RH
    // Exemple : sendToHRSystem(hrData);
  };

  const handleDashboardSummaryExport = (summary: any) => {
    console.log('📊 Export Dashboard Summary:', summary);
    // Données pour le dashboard principal tenant
    // Exemple : updateTenantDashboard(tenant, summary);
  };

  // =================== PERSISTANCE DONNÉES TRAVAILLEURS ===================
  const handleWorkersDataChange = (workersData: any[]) => {
    console.log('💾 Sauvegarde Workers dans formData:', workersData);
    // Sauvegarder les données des travailleurs dans formData pour persistance entre étapes
    onDataChange('workers', {
      list: workersData,
      lastUpdated: new Date().toISOString(),
      totalCount: workersData.length
    });
    
    // Mettre à jour aussi les données pour les SMS
    setCurrentWorkers(workersData);
  };

  // =================== GESTION SMS AVEC CIBLAGE ===================
  const [currentWorkers, setCurrentWorkers] = useState<any[]>(formData?.workers?.list || []);
  const [smsTargetMode, setSmsTargetMode] = useState<'all' | 'location' | 'custom'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Fonction pour obtenir les numéros de téléphone selon le ciblage
  const getTargetedPhoneNumbers = (): string[] => {
    const workers = currentWorkers.filter(w => w.phoneNumber && w.phoneNumber.trim());
    
    switch (smsTargetMode) {
      case 'all':
        return workers.map(w => w.phoneNumber);
      
      case 'location':
        if (!selectedLocation) return [];
        return workers
          .filter(w => w.workLocation === selectedLocation)
          .map(w => w.phoneNumber);
      
      case 'custom':
      default:
        return [];
    }
  };

  // Fonction pour obtenir la liste des emplacements uniques
  const getUniqueWorkLocations = (): string[] => {
    return [...new Set(currentWorkers
      .map(w => w.workLocation)
      .filter(Boolean)
    )];
  };

  // =================== CALCULS ===================
  const validCriteria = Object.values(criteria).filter(Boolean).length;
  const totalCriteria = Object.keys(criteria).length;
  const approvedReviewers = reviewers.filter(r => r.status === 'approved').length;
  const rejectedReviewers = reviewers.filter(r => r.status === 'rejected').length;
  const pendingReviewers = reviewers.filter(r => r.status === 'pending').length;
  
  const overallProgress = (validCriteria / totalCriteria + Math.min(approvedReviewers / Math.max(reviewers.length, 1), 1)) / 2;
  const canValidate = validCriteria === totalCriteria && approvedReviewers > 0 && rejectedReviewers === 0;

  // =================== HANDLERS ===================
  const handleCriteriaChange = (criteriaKey: keyof ValidationCriteria, value: boolean) => {
    const newCriteria = { ...criteria, [criteriaKey]: value };
    setCriteria(newCriteria);
    updateFormData(newCriteria, reviewers);
  };

  const handleAddReviewer = () => {
    if (!newReviewer.name.trim() || !newReviewer.role.trim()) {
      alert('Nom et rôle requis');
      return;
    }
    
    const reviewer: Reviewer = {
      id: `reviewer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newReviewer.name.trim(),
      role: newReviewer.role.trim(),
      email: newReviewer.email.trim(),
      status: 'pending',
      comments: newReviewer.comments.trim()
    };
    
    const newReviewers = [...reviewers, reviewer];
    setReviewers(newReviewers);
    updateFormData(criteria, newReviewers);
    
    // Reset du formulaire
    setNewReviewer({ name: '', role: '', email: '', comments: '' });
    setIsAddingReviewer(false);
    
    // Feedback utilisateur
    alert(`Réviseur "${reviewer.name}" ajouté avec succès !`);
  };

  const handleReviewerAction = (reviewerId: string, action: 'approve' | 'reject', rating?: number) => {
    const newReviewers = reviewers.map(reviewer => 
      reviewer.id === reviewerId 
        ? { 
            ...reviewer, 
            status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected',
            rating: rating,
            approvedAt: new Date().toISOString()
          }
        : reviewer
    );
    setReviewers(newReviewers);
    updateFormData(criteria, newReviewers);
  };

  const handleSaveComments = (reviewerId: string) => {
    const newReviewers = reviewers.map(reviewer => 
      reviewer.id === reviewerId 
        ? { ...reviewer, comments: tempComments }
        : reviewer
    );
    setReviewers(newReviewers);
    updateFormData(criteria, newReviewers);
    setEditingComments(null);
    setTempComments('');
  };

  const updateFormData = (newCriteria: ValidationCriteria, newReviewers: Reviewer[]) => {
    const validationData = {
      criteria: newCriteria,
      reviewers: newReviewers,
      progress: {
        criteriaValid: Object.values(newCriteria).filter(Boolean).length,
        totalCriteria: Object.keys(newCriteria).length,
        reviewersCount: newReviewers.length,
        approvalsCount: newReviewers.filter(r => r.status === 'approved').length,
        canValidate: Object.values(newCriteria).every(Boolean) && newReviewers.filter(r => r.status === 'approved').length > 0
      },
      lastUpdated: new Date().toISOString()
    };
    
    onDataChange('validation', validationData);
  };

  // =================== STYLES ===================
  const getCriteriaColor = (isValid: boolean) => isValid ? '#22c55e' : '#6b7280';
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div style={{
      padding: window.innerWidth < 768 ? '12px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#ffffff'
    }}>
      {/* Header avec statistiques */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <h2 style={{
          color: '#22c55e',
          fontSize: window.innerWidth < 768 ? '18px' : '20px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: window.innerWidth < 768 ? '8px' : '12px'
        }}>
          <CheckCircle size={24} />
          {t.title}
        </h2>
        <p style={{
          color: '#16a34a',
          margin: '0 0 16px 0',
          fontSize: window.innerWidth < 768 ? '12px' : '14px'
        }}>{t.subtitle}</p>
          
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: window.innerWidth < 768 ? '12px' : '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#22c55e',
              marginBottom: '4px'
            }}>{validCriteria}/{totalCriteria}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#16a34a',
              fontWeight: '500'
            }}>{t.stats.criteriaValid}</div>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#22c55e',
              marginBottom: '4px'
            }}>{reviewers.length}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#16a34a',
              fontWeight: '500'
            }}>{t.stats.reviewersAssigned}</div>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#22c55e',
              marginBottom: '4px'
            }}>{approvedReviewers}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#16a34a',
              fontWeight: '500'
            }}>{t.stats.approvalsReceived}</div>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#22c55e',
              marginBottom: '4px'
            }}>{Math.round(overallProgress * 100)}%</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#16a34a',
              fontWeight: '500'
            }}>{t.stats.overallStatus}</div>
          </div>
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(100, 116, 139, 0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '16px 0'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            transition: 'width 0.5s ease',
            width: `${overallProgress * 100}%`
          }} />
        </div>

        {/* Statistiques Travailleurs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: window.innerWidth < 768 ? '12px' : '16px',
          marginTop: '20px'
        }}>
          {/* Travailleurs Actifs */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#60a5fa',
              marginBottom: '4px'
            }}>{workerStats.activeWorkers}/{workerStats.totalWorkers}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#93c5fd',
              fontWeight: '500'
            }}>👷‍♂️ Travailleurs Actifs</div>
          </div>

          {/* Cadenas Status */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#22c55e',
              marginBottom: '4px'
            }}>{workerStats.locksApplied}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#86efac',
              fontWeight: '500'
            }}>🔒 Cadenas Apposés</div>
          </div>

          {/* Signatures AST */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(168, 85, 247, 0.2)'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#a855f7',
              marginBottom: '4px'
            }}>{workerStats.signedAST}/{workerStats.totalWorkers}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#c4b5fd',
              fontWeight: '500'
            }}>✍️ Signatures AST</div>
          </div>

          {/* Temps Total */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '20px' : '24px',
              fontWeight: '800',
              color: '#f59e0b',
              marginBottom: '4px'
            }}>{formatWorkTime(workerStats.totalWorkTime)}</div>
            <div style={{
              fontSize: window.innerWidth < 768 ? '11px' : '12px',
              color: '#fbbf24',
              fontWeight: '500'
            }}>⏱️ Temps Total</div>
          </div>
        </div>

        {/* Emplacements de travail */}
        {workerStats.workLocations.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '6px',
              fontWeight: '600'
            }}>📍 Emplacements actifs:</div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {workerStats.workLocations.map((location, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#93c5fd',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section WorkerRegistry - Gestion des travailleurs avec signatures */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <h3 style={{
          color: '#e2e8f0',
          fontSize: window.innerWidth < 768 ? '16px' : '18px',
          fontWeight: '600',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Users size={window.innerWidth < 768 ? 18 : 20} />
          {language === 'fr' ? 'Registre des Travailleurs' : 'Worker Registry'}
        </h3>
          <WorkerRegistryAST
            astId={formData?.astNumber || 'AST-TEMP'}
            astTitle={formData?.projectInfo?.title || 'AST'}
            language={language}
            projectManagerPhone={formData?.projectInfo?.supervisorPhone}
            workLocations={formData?.projectInfo?.workLocations || []}
            availableLocks={formData?.lotoProcedure?.points?.map((point: any) => ({
              id: point.id,
              lockNumber: `LOTO-${point.equipmentName}`,
              equipment: point.equipmentName,
              energyType: (point.energyType === 'gravitational' ? 'mechanical' : point.energyType) as 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical',
              location: point.location,
              status: (point.status === 'completed' ? 'applied' : 'available') as 'available' | 'applied' | 'verified' | 'removed',
              isApplied: point.status === 'completed',
              appliedByWorker: point.status === 'completed',
              appliedTime: point.status === 'completed' ? new Date().toISOString() : undefined,
              removedTime: undefined,
              photos: point.photos?.map((p: any) => p.url) || []
            })) || []}
            onLockStatusChange={(lockId: string, isApplied: boolean, workerId: string) => {
              // Mettre à jour le statut LOTO correspondant
              const updatedProcedure = {
                ...formData.lotoProcedure,
                points: formData.lotoProcedure.points.map((point: any) => 
                  point.id === lockId 
                    ? { 
                        ...point, 
                        status: isApplied ? 'completed' : 'pending',
                        assignedWorker: isApplied ? workerId : undefined
                      }
                    : point
                )
              };
              onDataChange('lotoProcedure', updatedProcedure);
            }}
            onStatsChange={handleWorkerStatsChange}
            onWorkersExport={handleWorkersExport}
            onHRDataExport={handleHRDataExport}
            onDashboardSummaryExport={handleDashboardSummaryExport}
            onWorkersDataChange={handleWorkersDataChange}
            initialWorkers={formData?.workers?.list || []}
          />
      </div>

      {/* Section Notifications SMS */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <h3 style={{
          color: '#e2e8f0',
          fontSize: window.innerWidth < 768 ? '16px' : '18px',
          fontWeight: '600',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <MessageSquare size={window.innerWidth < 768 ? 18 : 20} />
          {language === 'fr' ? 'Notifications Équipe' : 'Team Notifications'}
        </h3>

        {/* Interface de ciblage des destinataires */}
        {currentWorkers.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 12px 0'
            }}>
              🎯 {language === 'fr' ? 'Cibler les destinataires' : 'Target Recipients'}
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {/* Tous les travailleurs */}
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: smsTargetMode === 'all' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                  color: smsTargetMode === 'all' ? '#22c55e' : '#94a3b8',
                  border: '1px solid ' + (smsTargetMode === 'all' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.3)'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSmsTargetMode('all')}
              >
                👥 {language === 'fr' ? `Tous (${currentWorkers.length})` : `All (${currentWorkers.length})`}
              </button>

              {/* Par emplacement */}
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: smsTargetMode === 'location' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                  color: smsTargetMode === 'location' ? '#3b82f6' : '#94a3b8',
                  border: '1px solid ' + (smsTargetMode === 'location' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSmsTargetMode('location')}
              >
                📍 {language === 'fr' ? 'Par emplacement' : 'By Location'}
              </button>

              {/* Sélection manuelle */}
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: smsTargetMode === 'custom' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                  color: smsTargetMode === 'custom' ? '#a855f7' : '#94a3b8',
                  border: '1px solid ' + (smsTargetMode === 'custom' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(100, 116, 139, 0.3)'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSmsTargetMode('custom')}
              >
                ✋ {language === 'fr' ? 'Sélection manuelle' : 'Manual Selection'}
              </button>
            </div>

            {/* Sélecteur d'emplacement */}
            {smsTargetMode === 'location' && getUniqueWorkLocations().length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="">{language === 'fr' ? 'Choisir un emplacement...' : 'Choose location...'}</option>
                  {getUniqueWorkLocations().map(location => (
                    <option key={location} value={location}>
                      {location} ({currentWorkers.filter(w => w.workLocation === location).length} {language === 'fr' ? 'travailleurs' : 'workers'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Aperçu des destinataires ciblés */}
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              padding: '8px',
              backgroundColor: 'rgba(100, 116, 139, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              📱 {language === 'fr' ? 'Destinataires ciblés' : 'Targeted recipients'}: {getTargetedPhoneNumbers().length} {language === 'fr' ? 'numéro(s)' : 'number(s)'}
              {getTargetedPhoneNumbers().length > 0 && (
                <div style={{ marginTop: '4px', fontSize: '11px' }}>
                  {getTargetedPhoneNumbers().slice(0, 3).join(', ')}
                  {getTargetedPhoneNumbers().length > 3 && ` + ${getTargetedPhoneNumbers().length - 3} ${language === 'fr' ? 'autres' : 'others'}`}
                </div>
              )}
            </div>
          </div>
        )}

          <SMSNotification
            astId={formData?.astNumber}
            defaultType="general_alert"
            defaultMessage={`AST ${formData?.astNumber}: ${formData?.projectInfo?.title || 'Nouveau projet'} - Mise à jour importante de l'équipe.`}
            language={language}
            defaultRecipients={[
              ...(smsTargetMode === 'custom' ? [
                formData?.projectInfo?.supervisorPhone,
                ...(formData?.projectInfo?.teamMembers || []).map((m: any) => m.phone).filter(Boolean)
              ] : getTargetedPhoneNumbers())
            ].filter(Boolean)}
            compact={false}
            autoExpand={false}
          />
      </div>

      {/* Critères de validation */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <h3 style={{
          color: '#e2e8f0',
          fontSize: window.innerWidth < 768 ? '16px' : '18px',
          fontWeight: '600',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Shield size={window.innerWidth < 768 ? 18 : 20} />
          {t.validationCriteria}
        </h3>
          
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: window.innerWidth < 768 ? '12px' : '16px'
        }}>
            {(Object.keys(criteria) as Array<keyof ValidationCriteria>).map(key => (
              <div 
                key={key}
                style={{
                  background: criteria[key] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                  border: criteria[key] ? '1px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleCriteriaChange(key, !criteria[key])}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    color: '#e2e8f0',
                    fontWeight: '500',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px'
                  }}>{t.criteria[key]}</span>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    backgroundColor: getCriteriaColor(criteria[key])
                  }}>
                    {criteria[key] ? '✓' : ''}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Équipe de révision */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        <h3 style={{
          color: '#e2e8f0',
          fontSize: window.innerWidth < 768 ? '16px' : '18px',
          fontWeight: '600',
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Users size={window.innerWidth < 768 ? 18 : 20} />
          {t.reviewTeam}
        </h3>
          
          {reviewers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>{t.messages.noReviewers}</p>
          </div>
          ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
              {reviewers.map(reviewer => (
              <div key={reviewer.id} style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: window.innerWidth < 768 ? '16px' : '20px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                  marginBottom: '16px',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                  gap: window.innerWidth < 768 ? '12px' : '0'
                }}>
                  <div>
                    <h4 style={{
                      color: '#e2e8f0',
                      margin: '0 0 4px 0',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px',
                      fontWeight: '600'
                    }}>{reviewer.name}</h4>
                    <p style={{
                      color: '#94a3b8',
                      margin: 0,
                      fontSize: window.innerWidth < 768 ? '12px' : '14px'
                    }}>{reviewer.role} • {reviewer.email}</p>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: window.innerWidth < 768 ? '11px' : '12px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    backgroundColor: `${getStatusColor(reviewer.status)}20`,
                    color: getStatusColor(reviewer.status)
                  }}>
                      {t.status[reviewer.status]}
                    </div>
                  </div>
                  
                  {reviewer.status === 'pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap'
                  }}>
                    <button 
                      style={{
                        padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth < 768 ? '11px' : '12px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        border: '1px solid rgba(34, 197, 94, 0.4)'
                      }}
                      onClick={() => handleReviewerAction(reviewer.id, 'approve', 5)}
                    >
                      <ThumbsUp size={window.innerWidth < 768 ? 12 : 14} />
                      {t.actions.approve}
                    </button>
                    <button 
                      style={{
                        padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth < 768 ? '11px' : '12px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)'
                      }}
                      onClick={() => handleReviewerAction(reviewer.id, 'reject')}
                    >
                      <AlertTriangle size={window.innerWidth < 768 ? 12 : 14} />
                      {t.actions.reject}
                    </button>
                    <button 
                      style={{
                        padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth < 768 ? '11px' : '12px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.4)'
                      }}
                      onClick={() => {
                        setEditingComments(reviewer.id);
                        setTempComments(reviewer.comments || '');
                      }}
                    >
                      <Edit size={window.innerWidth < 768 ? 12 : 14} />
                      {t.actions.saveComments}
                    </button>
                    </div>
                  )}
                  
                  {reviewer.comments && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                      <div style={{
                        color: '#94a3b8',
                        fontSize: window.innerWidth < 768 ? '12px' : '14px',
                        lineHeight: 1.5,
                        margin: '8px 0'
                      }}>{reviewer.comments}</div>
                    </div>
                  )}
                  
                  {editingComments === reviewer.id && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                      <textarea
                        value={tempComments}
                        onChange={(e) => setTempComments(e.target.value)}
                        placeholder={t.form.commentsPlaceholder}
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: window.innerWidth < 768 ? '12px' : '14px',
                          transition: 'all 0.3s ease',
                          minHeight: '80px',
                          resize: 'vertical',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        rows={3}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          style={{
                            padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: window.innerWidth < 768 ? '11px' : '12px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            border: '1px solid rgba(34, 197, 94, 0.4)'
                          }}
                          onClick={() => handleSaveComments(reviewer.id)}
                        >
                          <Save size={window.innerWidth < 768 ? 12 : 14} />
                          {t.actions.saveComments}
                        </button>
                        <button 
                          style={{
                            padding: window.innerWidth < 768 ? '6px 12px' : '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: window.innerWidth < 768 ? '11px' : '12px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(100, 116, 139, 0.2)',
                            color: '#64748b',
                            border: '1px solid rgba(100, 116, 139, 0.4)'
                          }}
                          onClick={() => {
                            setEditingComments(null);
                            setTempComments('');
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {reviewer.rating && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < reviewer.rating! ? '#fbbf24' : 'transparent'}
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!isAddingReviewer ? (
            <button 
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              onClick={() => {
                setIsAddingReviewer(true);
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              {t.actions.addReviewer}
            </button>
          ) : (
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>{t.form.reviewerName}</label>
                  <input
                    type="text"
                    value={newReviewer.name}
                    onChange={(e) => setNewReviewer({...newReviewer, name: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="Nom complet"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>{t.form.reviewerRole}</label>
                  <input
                    type="text"
                    value={newReviewer.role}
                    onChange={(e) => setNewReviewer({...newReviewer, role: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="Ex: Superviseur sécurité"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>{t.form.reviewerEmail}</label>
                  <input
                    type="email"
                    value={newReviewer.email}
                    onChange={(e) => setNewReviewer({...newReviewer, email: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                    placeholder="email@example.com"
                  />
                </div>
                <div style={{ 
                  gridColumn: window.innerWidth < 768 ? '1' : '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#e2e8f0'
                  }}>{t.form.comments}</label>
                  <textarea
                    value={newReviewer.comments}
                    onChange={(e) => setNewReviewer({...newReviewer, comments: e.target.value})}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '14px',
                      height: '80px',
                      resize: 'none'
                    }}
                    placeholder={t.form.commentsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? 'not-allowed' : 'pointer',
                    backgroundColor: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? 'rgba(148, 163, 184, 0.3)' : 'rgba(34, 197, 94, 0.1)',
                    color: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? '#94a3b8' : '#22c55e',
                    border: '1px solid ' + ((!newReviewer.name.trim() || !newReviewer.role.trim()) ? 'rgba(148, 163, 184, 0.3)' : 'rgba(34, 197, 94, 0.3)'),
                    opacity: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!newReviewer.name.trim() || !newReviewer.role.trim())) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!newReviewer.name.trim() || !newReviewer.role.trim())) {
                      e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                    }
                  }}
                  onClick={() => {
                    handleAddReviewer();
                  }}
                  disabled={!newReviewer.name.trim() || !newReviewer.role.trim()}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  {t.actions.addReviewer}
                </button>
                <button 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    color: '#94a3b8',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.2)'}
                  onClick={() => {
                    setIsAddingReviewer(false);
                    setNewReviewer({ name: '', role: '', email: '', comments: '' });
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  {t.actions.cancel}
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Validation finale */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        padding: window.innerWidth < 768 ? '16px' : '24px',
        marginBottom: window.innerWidth < 768 ? '16px' : '24px'
      }}>
        {canValidate && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Award size={48} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
            <h3 style={{
              color: '#22c55e',
              fontWeight: '600',
              fontSize: '18px',
              marginBottom: '8px'
            }}>{t.messages.validationComplete}</h3>
            <p style={{
              color: '#16a34a',
              fontSize: '14px'
            }}>L'AST est prête pour l'étape de finalisation et partage.</p>
          </div>
        )}

        {/* Erreurs de validation */}
        {errors?.validation && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              <AlertTriangle size={20} />
              <span style={{ fontWeight: '500' }}>Erreurs de validation</span>
            </div>
            <ul style={{
              color: '#dc2626',
              fontSize: '14px',
              listStyle: 'disc',
              marginLeft: '28px'
            }}>
              {errors.validation.map((error: string, index: number) => (
                <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Validation;