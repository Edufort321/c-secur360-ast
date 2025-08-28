'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Users, Shield, 
  User, Clock, Award, MessageSquare, ThumbsUp,
  Edit, Save, Star, Calendar, Plus
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
      validate: "Valider l'AST"
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
      validate: "Validate JSA"
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
  errors
}) => {
  // =================== TRADUCTIONS ===================
  const t = translations[language];
  
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
      console.log('Nom ou rôle requis');
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
    
    console.log('Ajout du réviseur:', reviewer);
    
    const newReviewers = [...reviewers, reviewer];
    setReviewers(newReviewers);
    updateFormData(criteria, newReviewers);
    
    // Reset du formulaire
    setNewReviewer({ name: '', role: '', email: '', comments: '' });
    setIsAddingReviewer(false);
    
    console.log('Réviseur ajouté avec succès, nouveau total:', newReviewers.length);
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
    <>
      {/* CSS Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .validation-container {
            padding: 0;
            color: #ffffff;
          }
          
          .validation-header {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 16px;
            padding: window.innerWidth < 768 ? 16px : 24px;
            margin-bottom: window.innerWidth < 768 ? 16px : 24px;
            position: relative;
            overflow: hidden;
          }
          
          .validation-title {
            color: #22c55e;
            font-size: window.innerWidth < 768 ? 18px : 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: window.innerWidth < 768 ? 8px : 12px;
            flex-wrap: wrap;
          }
          
          .validation-subtitle {
            color: #16a34a;
            margin: 0;
            font-size: 14px;
          }
          
          .validation-stats {
            display: grid;
            grid-template-columns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))';
            gap: window.innerWidth < 768 ? 12px : 16px;
            margin-top: window.innerWidth < 768 ? 16px : 20px;
          }
          
          .stat-card {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-2px);
            background: rgba(15, 23, 42, 0.8);
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 800;
            color: #22c55e;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #16a34a;
            font-weight: 500;
          }
          
          .section-card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 16px;
            padding: window.innerWidth < 768 ? 16px : 24px;
            margin-bottom: window.innerWidth < 768 ? 16px : 24px;
          }
          
          .section-title {
            color: #e2e8f0;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .criteria-grid {
            display: grid;
            grid-template-columns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))';
            gap: window.innerWidth < 768 ? 12px : 16px;
          }
          
          .criteria-item {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .criteria-item:hover {
            background: rgba(15, 23, 42, 0.8);
            border-color: rgba(34, 197, 94, 0.5);
          }
          
          .criteria-item.valid {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
          }
          
          .criteria-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .criteria-name {
            color: #e2e8f0;
            font-weight: 500;
            font-size: 14px;
          }
          
          .criteria-status {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
          }
          
          .reviewer-list {
            display: grid;
            gap: 16px;
          }
          
          .reviewer-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
          }
          
          .reviewer-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }
          
          .reviewer-info h4 {
            color: #e2e8f0;
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
          }
          
          .reviewer-info p {
            color: #94a3b8;
            margin: 0;
            font-size: 14px;
          }
          
          .reviewer-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
          }
          
          .reviewer-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-approve {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.4);
          }
          
          .btn-reject {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.4);
          }
          
          .btn-edit {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.4);
          }
          
          .btn:hover {
            transform: translateY(-1px);
            opacity: 0.9;
          }
          
          .add-reviewer-form {
            background: rgba(15, 23, 42, 0.8);
            border-radius: 12px;
            padding: 20px;
            margin-top: 16px;
          }
          
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 16px;
          }
          
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          
          .form-label {
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 500;
          }
          
          .form-input {
            padding: 10px 12px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 8px;
            color: #ffffff;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #22c55e;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          }
          
          .form-textarea {
            min-height: 80px;
            resize: vertical;
            grid-column: 1 / -1;
          }
          
          .comments-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(100, 116, 139, 0.3);
          }
          
          .comments-text {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.5;
            margin: 8px 0;
          }
          
          .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 4px;
            overflow: hidden;
            margin: 16px 0;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            transition: width 0.5s ease;
          }
          
          .validation-complete {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-top: 24px;
          }
          
          .validation-complete .icon {
            color: #22c55e;
            margin-bottom: 12px;
          }
          
          .validation-complete h3 {
            color: #22c55e;
            margin: 0 0 8px 0;
            font-size: 18px;
          }
          
          .validation-complete p {
            color: #16a34a;
            margin: 0;
            font-size: 14px;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .validation-stats {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .criteria-grid {
              grid-template-columns: 1fr;
            }
            
            .form-grid {
              grid-template-columns: 1fr;
            }
            
            .reviewer-header {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }
            
            .reviewer-actions {
              flex-wrap: wrap;
            }
          }
        `
      }} />

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
          marginBottom: window.innerWidth < 768 ? '16px' : '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{
            color: '#22c55e',
            fontSize: window.innerWidth < 768 ? '18px' : '20px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: window.innerWidth < 768 ? '8px' : '12px',
            flexWrap: 'wrap'
          }}>
            <CheckCircle size={24} />
            {t.title}
          </h2>
          <p style={{
            color: '#16a34a',
            margin: 0,
            fontSize: window.innerWidth < 768 ? '12px' : '14px'
          }}>{t.subtitle}</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: window.innerWidth < 768 ? '12px' : '16px',
            marginTop: window.innerWidth < 768 ? '16px' : '20px'
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
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <Users size={window.innerWidth < 768 ? 18 : 20} />
            {language === 'fr' ? 'Registre des Travailleurs' : 'Worker Registry'}
          </h3>
          <WorkerRegistryAST
            astId={formData?.astNumber || 'AST-TEMP'}
            astTitle={formData?.projectInfo?.title || 'AST'}
            language={language}
            projectManagerPhone={formData?.projectInfo?.supervisorPhone}
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
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <MessageSquare size={window.innerWidth < 768 ? 18 : 20} />
            {language === 'fr' ? 'Notifications Équipe' : 'Team Notifications'}
          </h3>
          <SMSNotification
            astId={formData?.astNumber}
            defaultType="general_alert"
            defaultMessage={`AST ${formData?.astNumber}: ${formData?.projectInfo?.title || 'Nouveau projet'} - Mise à jour importante de l'équipe.`}
            defaultRecipients={[
              formData?.projectInfo?.supervisorPhone,
              ...(formData?.projectInfo?.teamMembers || []).map((m: any) => m.phone).filter(Boolean)
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
            gap: '10px',
            flexWrap: 'wrap'
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
            gap: '10px',
            flexWrap: 'wrap'
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
                          border: 'none',
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
                          border: 'none',
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
                          border: 'none',
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
                            border: 'none',
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
                            border: 'none',
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
                padding: window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
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
                console.log('Bouton ajouter réviseur cliqué');
                setIsAddingReviewer(true);
              }}
            >
              <Plus size={window.innerWidth < 768 ? 14 : 16} />
              {t.actions.addReviewer}
            </button>
          ) : (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '16px' : '20px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    fontWeight: '500'
                  }}>{t.form.reviewerName}</label>
                  <input
                    type="text"
                    value={newReviewer.name}
                    onChange={(e) => setNewReviewer({...newReviewer, name: e.target.value})}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Nom complet"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    fontWeight: '500'
                  }}>{t.form.reviewerRole}</label>
                  <input
                    type="text"
                    value={newReviewer.role}
                    onChange={(e) => setNewReviewer({...newReviewer, role: e.target.value})}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Ex: Superviseur sécurité"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    fontWeight: '500'
                  }}>{t.form.reviewerEmail}</label>
                  <input
                    type="email"
                    value={newReviewer.email}
                    onChange={(e) => setNewReviewer({...newReviewer, email: e.target.value})}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="email@example.com"
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px',
                  gridColumn: window.innerWidth < 768 ? '1' : '1 / -1'
                }}>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    fontWeight: '500'
                  }}>{t.form.comments}</label>
                  <textarea
                    value={newReviewer.comments}
                    onChange={(e) => setNewReviewer({...newReviewer, comments: e.target.value})}
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      transition: 'all 0.3s ease',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder={t.form.commentsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  style={{
                    padding: window.innerWidth < 768 ? '8px 16px' : '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? 'rgba(100, 116, 139, 0.3)' : 'rgba(34, 197, 94, 0.2)',
                    color: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? '#64748b' : '#22c55e',
                    border: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? '1px solid rgba(100, 116, 139, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                    opacity: (!newReviewer.name.trim() || !newReviewer.role.trim()) ? 0.6 : 1
                  }}
                  onClick={() => {
                    console.log('Clic sur ajouter réviseur', { newReviewer });
                    handleAddReviewer();
                  }}
                  disabled={!newReviewer.name.trim() || !newReviewer.role.trim()}
                >
                  <Save size={window.innerWidth < 768 ? 12 : 14} />
                  {t.actions.addReviewer}
                </button>
                <button 
                  style={{
                    padding: window.innerWidth < 768 ? '8px 16px' : '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
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
                    console.log('Clic sur annuler');
                    setIsAddingReviewer(false);
                    setNewReviewer({ name: '', role: '', email: '', comments: '' });
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Validation finale */}
        {canValidate && (
          <div className="validation-complete">
            <Award size={48} className="icon" />
            <h3>{t.messages.validationComplete}</h3>
            <p>L'AST est prête pour l'étape de finalisation et partage.</p>
          </div>
        )}

        {/* Erreurs de validation */}
        {errors?.validation && (
          <div className="section-card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
              <AlertTriangle size={20} />
              <span>Erreurs de validation</span>
            </div>
            <ul style={{ color: '#fca5a5', marginTop: '8px', paddingLeft: '20px' }}>
              {errors.validation.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Validation;