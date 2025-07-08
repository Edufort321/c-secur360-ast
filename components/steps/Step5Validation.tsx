'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  FileText, 
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
  BarChart3
} from 'lucide-react';

// =================== INTERFACES ===================
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
    title: "Validation & Approbation Équipe",
    subtitle: "Processus de validation collaborative et approbation finale",
    
    // Sections
    reviewersSection: "Réviseurs Désignés",
    validationCriteria: "Critères de Validation",
    approvalProcess: "Processus d'Approbation",
    finalApproval: "Approbation Finale",
    validationSummary: "Résumé de Validation",
    
    // Reviewers
    addReviewer: "Ajouter un Réviseur",
    reviewerName: "Nom du Réviseur",
    reviewerRole: "Rôle",
    reviewerEmail: "Email",
    department: "Département",
    certification: "Certification",
    selectReviewer: "Sélectionner un réviseur",
    removeReviewer: "Retirer ce réviseur",
    
    // Status
    pending: "En Attente",
    reviewing: "En Révision",
    approved: "Approuvé",
    rejected: "Rejeté",
    
    // Actions
    sendForReview: "Envoyer pour Révision",
    requestApproval: "Demander l'Approbation",
    addComment: "Ajouter un Commentaire",
    signDocument: "Signer le Document",
    approve: "Approuver",
    reject: "Rejeter",
    edit: "Modifier",
    save: "Sauvegarder",
    
    // Validation criteria
    hazardIdentification: "Identification des Dangers",
    controlMeasures: "Mesures de Contrôle",
    equipmentSelection: "Sélection d'Équipements",
    procedural: "Procédures",
    regulatory: "Conformité Réglementaire",
    
    // Messages
    allCriteriaRequired: "Tous les critères doivent être validés",
    minimumReviewers: "Nombre minimum de réviseurs requis",
    reviewDeadline: "Échéance de révision",
    approvalRequired: "Approbation superviseur requise",
    readyForApproval: "Prêt pour l'approbation finale",
    documentApproved: "Document Approuvé",
    validationInProgress: "Validation en cours",
    allApproved: "Tous les réviseurs ont approuvé",
    
    // Comments
    comments: "Commentaires",
    addYourComment: "Ajoutez votre commentaire...",
    rating: "Évaluation",
    noComments: "Aucun commentaire pour le moment",
    needsModifications: "Nécessite des modifications",
    writeComment: "Rédiger un commentaire...",
    
    // Final approval
    approvedBy: "Approuvé par",
    approvedAt: "Approuvé le",
    conditions: "Conditions d'approbation",
    signature: "Signature électronique",
    electronicSigned: "Signé électroniquement",
    finalSignature: "Signature finale",
    
    // Summary
    totalReviewers: "Réviseurs Assignés",
    approvals: "Approbations",
    rejections: "Rejets",
    pendingReviews: "En Attente",
    noReviewersAssigned: "Aucun réviseur assigné pour le moment",
    additionalReviewersRequired: "réviseur(s) supplémentaire(s) requis",
    allCriteriaFirst: "Tous les critères doivent être validés avant approbation",
    completionRate: "Taux de Complétion",
    
    // Form fields
    enterName: "Entrer le nom complet",
    enterRole: "Entrer le rôle/poste",
    enterEmail: "Entrer l'adresse email",
    enterDepartment: "Entrer le département",
    enterCertification: "Certification (optionnel)",
    
    // Buttons
    add: "Ajouter",
    cancel: "Annuler",
    submit: "Soumettre",
    close: "Fermer",
    delete: "Supprimer",
    
    // Placeholders
    enterComment: "Entrez votre commentaire ici...",
    selectDate: "Sélectionner une date",
    
    // Validation messages
    criteriaMustBeCompleted: "critère(s) restant(s) à valider",
    reviewersMustRespond: "réviseur(s) en attente de réponse",
    validationComplete: "Validation complétée avec succès",
    readyForFinalApproval: "Prêt pour l'approbation finale",
    nameRequired: "Le nom est requis",
    emailRequired: "L'email est requis",
    roleRequired: "Le rôle est requis"
  },
  en: {
    title: "Team Validation & Approval",
    subtitle: "Collaborative validation process and final approval",
    
    // Sections
    reviewersSection: "Designated Reviewers",
    validationCriteria: "Validation Criteria",
    approvalProcess: "Approval Process",
    finalApproval: "Final Approval",
    validationSummary: "Validation Summary",
    
    // Reviewers
    addReviewer: "Add Reviewer",
    reviewerName: "Reviewer Name",
    reviewerRole: "Role",
    reviewerEmail: "Email",
    department: "Department",
    certification: "Certification",
    selectReviewer: "Select a reviewer",
    removeReviewer: "Remove this reviewer",
    
    // Status
    pending: "Pending",
    reviewing: "Reviewing",
    approved: "Approved",
    rejected: "Rejected",
    
    // Actions
    sendForReview: "Send for Review",
    requestApproval: "Request Approval",
    addComment: "Add Comment",
    signDocument: "Sign Document",
    approve: "Approve",
    reject: "Reject",
    edit: "Edit",
    save: "Save",
    
    // Validation criteria
    hazardIdentification: "Hazard Identification",
    controlMeasures: "Control Measures",
    equipmentSelection: "Equipment Selection",
    procedural: "Procedures",
    regulatory: "Regulatory Compliance",
    
    // Messages
    allCriteriaRequired: "All criteria must be validated",
    minimumReviewers: "Minimum number of reviewers required",
    reviewDeadline: "Review deadline",
    approvalRequired: "Supervisor approval required",
    readyForApproval: "Ready for final approval",
    documentApproved: "Document Approved",
    validationInProgress: "Validation in progress",
    allApproved: "All reviewers have approved",
    
    // Comments
    comments: "Comments",
    addYourComment: "Add your comment...",
    rating: "Rating",
    noComments: "No comments yet",
    needsModifications: "Needs modifications",
    writeComment: "Write a comment...",
    
    // Final approval
    approvedBy: "Approved by",
    approvedAt: "Approved on",
    conditions: "Approval conditions",
    signature: "Electronic signature",
    electronicSigned: "Electronically signed",
    finalSignature: "Final signature",
    
    // Summary
    totalReviewers: "Assigned Reviewers",
    approvals: "Approvals",
    rejections: "Rejections",
    pendingReviews: "Pending",
    noReviewersAssigned: "No reviewers assigned yet",
    additionalReviewersRequired: "additional reviewer(s) required",
    allCriteriaFirst: "All criteria must be validated before approval",
    completionRate: "Completion Rate",
    
    // Form fields
    enterName: "Enter full name",
    enterRole: "Enter role/position",
    enterEmail: "Enter email address",
    enterDepartment: "Enter department",
    enterCertification: "Certification (optional)",
    
    // Buttons
    add: "Add",
    cancel: "Cancel",
    submit: "Submit",
    close: "Close",
    delete: "Delete",
    
    // Placeholders
    enterComment: "Enter your comment here...",
    selectDate: "Select a date",
    
    // Validation messages
    criteriaMustBeCompleted: "criteria remaining to validate",
    reviewersMustRespond: "reviewer(s) pending response",
    validationComplete: "Validation completed successfully",
    readyForFinalApproval: "Ready for final approval",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    roleRequired: "Role is required"
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
  
  const [validationData, setValidationData] = useState<ValidationData>({
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
    ...formData.validation
  });

  const [showAddReviewer, setShowAddReviewer] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Nouveau formulaire pour ajouter un réviseur
  const [newReviewer, setNewReviewer] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    certification: ''
  });

  // =================== EFFECTS ===================
  useEffect(() => {
    onDataChange('validation', validationData);
  }, [validationData, onDataChange]);

  // =================== HANDLERS ===================
  const addReviewer = () => {
    // Validation des champs requis
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

    setValidationData(prev => ({
      ...prev,
      reviewers: [...prev.reviewers, reviewer]
    }));

    // Reset du formulaire
    setNewReviewer({
      name: '',
      role: '',
      email: '',
      department: '',
      certification: ''
    });
    setShowAddReviewer(false);
  };

  const removeReviewer = (reviewerId: string) => {
    setValidationData(prev => ({
      ...prev,
      reviewers: prev.reviewers.filter(r => r.id !== reviewerId)
    }));
  };

  const updateReviewerStatus = (reviewerId: string, status: 'approved' | 'rejected', comment?: string, rating?: number) => {
    setValidationData(prev => ({
      ...prev,
      reviewers: prev.reviewers.map(reviewer => 
        reviewer.id === reviewerId 
          ? { 
              ...reviewer, 
              status, 
              comments: comment,
              rating,
              validatedAt: new Date().toISOString(),
              signature: `${reviewer.name} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`
            }
          : reviewer
      )
    }));
  };

  const updateCriteria = (criteria: keyof ValidationData['validationCriteria'], value: boolean) => {
    setValidationData(prev => ({
      ...prev,
      validationCriteria: {
        ...prev.validationCriteria,
        [criteria]: value
      }
    }));
  };

  const saveComment = (reviewerId: string) => {
    setValidationData(prev => ({
      ...prev,
      reviewers: prev.reviewers.map(reviewer => 
        reviewer.id === reviewerId 
          ? { ...reviewer, comments: commentText }
          : reviewer
      )
    }));
    setEditingComment(null);
    setCommentText('');
  };

  const finalizeApproval = () => {
    setValidationData(prev => ({
      ...prev,
      finalApproval: {
        approvedBy: 'Superviseur HSE',
        approvedAt: new Date().toISOString(),
        signature: 'Signature électronique - ' + new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')
      }
    }));
  };

  // =================== UTILS ===================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'reviewing': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <ThumbsDown className="w-4 h-4" />;
      case 'reviewing': return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // =================== COMPUTED VALUES ===================
  const allCriteriaValidated = Object.values(validationData.validationCriteria).every(Boolean);
  const sufficientReviewers = validationData.reviewers.length >= validationData.minimumReviewers;
  const allReviewersResponded = validationData.reviewers.every(r => r.status !== 'pending');
  const approvedReviewers = validationData.reviewers.filter(r => r.status === 'approved').length;
  const rejectedReviewers = validationData.reviewers.filter(r => r.status === 'rejected').length;
  const pendingReviewers = validationData.reviewers.filter(r => r.status === 'pending').length;
  const completionRate = validationData.reviewers.length > 0 
    ? Math.round(((approvedReviewers + rejectedReviewers) / validationData.reviewers.length) * 100)
    : 0;

  const criteriaCount = Object.values(validationData.validationCriteria).filter(Boolean).length;
  const totalCriteria = Object.keys(validationData.validationCriteria).length;

  return (
    <>
      {/* CSS Premium pour Step 5 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step5-container { padding: 0; background: #f8fafc; min-height: 100vh; }
          .validation-header { text-align: center; margin-bottom: 32px; padding: 32px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; color: white; }
          .header-icon { width: 64px; height: 64px; margin: 0 auto 16px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .header-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
          .header-subtitle { font-size: 16px; opacity: 0.9; }
          .validation-section { background: white; border: none; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
          .criteria-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
          .criteria-item { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.3s; cursor: pointer; background: white; }
          .criteria-item:hover { border-color: #3b82f6; background: #f1f5f9; }
          .criteria-item.validated { border-color: #10b981; background: #ecfdf5; }
          .criteria-checkbox { width: 20px; height: 20px; accent-color: #3b82f6; }
          .criteria-label { font-size: 15px; font-weight: 500; color: #374151; }
          .criteria-validated { color: #059669; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
          .stat-card { text-align: center; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
          .stat-value { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
          .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }
          .stat-green { color: #10b981; }
          .stat-red { color: #ef4444; }
          .stat-blue { color: #3b82f6; }
          .stat-orange { color: #f59e0b; }
          .add-reviewer-btn { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
          .add-reviewer-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.3); }
          .reviewer-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; transition: all 0.3s; }
          .reviewer-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .reviewer-header { display: flex; align-items: center; justify-between; margin-bottom: 16px; }
          .reviewer-info { display: flex; align-items: center; gap: 12px; }
          .reviewer-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
          .reviewer-details h4 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1e293b; }
          .reviewer-details p { margin: 0; font-size: 14px; color: #64748b; }
          .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid; }
          .action-buttons { display: flex; gap: 8px; margin-top: 12px; }
          .btn-approve { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
          .btn-reject { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
          .btn-remove { background: #6b7280; color: white; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; }
          .comment-section { margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .rating-stars { display: flex; gap: 2px; margin: 8px 0; }
          .rating-star { color: #fbbf24; cursor: pointer; }
          .rating-star.empty { color: #d1d5db; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .form-field { margin-bottom: 16px; }
          .form-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151; }
          .form-input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; transition: border-color 0.3s; }
          .form-input:focus { outline: none; border-color: #3b82f6; }
          .form-textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; resize: vertical; }
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
          .modal-header { display: flex; justify-content: between; align-items: center; margin-bottom: 20px; }
          .modal-title { font-size: 18px; font-weight: 600; color: #1e293b; }
          .close-btn { background: none; border: none; cursor: pointer; padding: 4px; }
          .progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 16px 0; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s; }
          .warning-banner { background: #fef3cd; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 8px; margin: 16px 0; }
          .success-banner { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 8px; margin: 16px 0; }
          .final-approval { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; border-radius: 16px; text-align: center; }
          .final-approval-btn { background: white; color: #059669; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 16px; }
          @media (max-width: 768px) {
            .form-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .criteria-grid { grid-template-columns: 1fr; }
          }
        `
      }} />

      <div className="step5-container">
        {/* Header */}
        <div className="validation-header">
          <div className="header-icon">
            <Shield size={32} />
          </div>
          <h2 className="header-title">{t.title}</h2>
          <p className="header-subtitle">{t.subtitle}</p>
        </div>

        {/* Validation Summary */}
        <div className="validation-section">
          <h3 className="section-title">
            <BarChart3 size={24} />
            {t.validationSummary}
          </h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value stat-blue">{validationData.reviewers.length}</div>
              <div className="stat-label">{t.totalReviewers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-green">{approvedReviewers}</div>
              <div className="stat-label">{t.approvals}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-red">{rejectedReviewers}</div>
              <div className="stat-label">{t.rejections}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-orange">{pendingReviewers}</div>
              <div className="stat-label">{t.pendingReviews}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{criteriaCount}/{totalCriteria}</div>
              <div className="stat-label">{t.validationCriteria}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-blue">{completionRate}%</div>
              <div className="stat-label">{t.completionRate}</div>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* Validation Criteria */}
        <div className="validation-section">
          <h3 className="section-title">
            <CheckCircle size={24} />
            {t.validationCriteria}
          </h3>
          
          <div className="criteria-grid">
            {Object.entries(validationData.validationCriteria).map(([key, value]) => (
              <label key={key} className={`criteria-item ${value ? 'validated' : ''}`}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateCriteria(key as keyof ValidationData['validationCriteria'], e.target.checked)}
                  className="criteria-checkbox"
                />
                <span className={`criteria-label ${value ? 'criteria-validated' : ''}`}>
                  {t[key as keyof typeof t] || key}
                </span>
                {value && <CheckCircle size={20} className="criteria-validated" />}
              </label>
            ))}
          </div>

          {!allCriteriaValidated && (
            <div className="warning-banner">
              <AlertTriangle size={20} />
              <span>{t.allCriteriaRequired}</span>
            </div>
          )}
        </div>

        {/* Reviewers Section */}
        <div className="validation-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="section-title">
              <Users size={24} />
              {t.reviewersSection}
            </h3>
            <button
              onClick={() => setShowAddReviewer(true)}
              className="add-reviewer-btn"
            >
              <Plus size={18} />
              {t.addReviewer}
            </button>
          </div>

          {/* Reviewers List */}
          {validationData.reviewers.length > 0 ? (
            validationData.reviewers.map(reviewer => (
              <div key={reviewer.id} className="reviewer-card">
                <div className="reviewer-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {reviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <h4>{reviewer.name}</h4>
                      <p>{reviewer.role} - {reviewer.department}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{reviewer.email}</p>
                      {reviewer.certification && (
                        <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>
                          {reviewer.certification}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={`status-badge ${getStatusColor(reviewer.status)}`}>
                      {getStatusIcon(reviewer.status)}
                      <span>{t[reviewer.status as keyof typeof t]}</span>
                    </div>
                    <button
                      onClick={() => removeReviewer(reviewer.id)}
                      className="btn-remove"
                      title={t.removeReviewer}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {reviewer.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      onClick={() => updateReviewerStatus(reviewer.id, 'approved', '', 5)}
                      className="btn-approve"
                    >
                      <ThumbsUp size={14} />
                      {t.approve}
                    </button>
                    <button
                      onClick={() => updateReviewerStatus(reviewer.id, 'rejected', t.needsModifications)}
                      className="btn-reject"
                    >
                      <ThumbsDown size={14} />
                      {t.reject}
                    </button>
                  </div>
                )}

                {reviewer.comments && (
                  <div className="comment-section">
                    <strong style={{ fontSize: '14px', color: '#374151' }}>{t.comments}:</strong>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>{reviewer.comments}</p>
                    {reviewer.rating && (
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16}
                            className={i < reviewer.rating! ? 'rating-star' : 'rating-star empty'} 
                          />
                        ))}
                      </div>
                    )}
                    {reviewer.validatedAt && (
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>
                        {new Date(reviewer.validatedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <Users size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
              <p>{t.noReviewersAssigned}</p>
            </div>
          )}

          {/* Validation Messages */}
          {!sufficientReviewers && (
            <div className="warning-banner">
              <Users size={20} />
              <span>
                {validationData.minimumReviewers - validationData.reviewers.length} {t.additionalReviewersRequired}
              </span>
            </div>
          )}
        </div>

        {/* Final Approval */}
        {allCriteriaValidated && sufficientReviewers && allReviewersResponded && (
          <div className="validation-section">
            {!validationData.finalApproval ? (
              <div className="final-approval">
                <h3>{t.readyForApproval}</h3>
                <p>Tous les critères sont validés et les réviseurs ont répondu</p>
                <button onClick={finalizeApproval} className="final-approval-btn">
                  {t.signDocument}
                </button>
              </div>
            ) : (
              <div className="success-banner">
                <CheckCircle size={20} />
                <div>
                  <strong>{t.documentApproved}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                    {t.approvedBy}: {validationData.finalApproval.approvedBy} - 
                    {new Date(validationData.finalApproval.approvedAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Reviewer Modal */}
        {showAddReviewer && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{t.addReviewer}</h3>
                <button onClick={() => setShowAddReviewer(false)} className="close-btn">
                  <X size={20} />
                </button>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">{t.reviewerName} *</label>
                  <input
                    type="text"
                    value={newReviewer.name}
                    onChange={(e) => setNewReviewer(prev => ({...prev, name: e.target.value}))}
                    placeholder={t.enterName}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">{t.reviewerRole} *</label>
                  <input
                    type="text"
                    value={newReviewer.role}
                    onChange={(e) => setNewReviewer(prev => ({...prev, role: e.target.value}))}
                    placeholder={t.enterRole}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">{t.reviewerEmail} *</label>
                  <input
                    type="email"
                    value={newReviewer.email}
                    onChange={(e) => setNewReviewer(prev => ({...prev, email: e.target.value}))}
                    placeholder={t.enterEmail}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">{t.department}</label>
                  <input
                    type="text"
                    value={newReviewer.department}
                    onChange={(e) => setNewReviewer(prev => ({...prev, department: e.target.value}))}
                    placeholder={t.enterDepartment}
                    className="form-input"
                  />
                </div>

                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t.certification}</label>
                  <input
                    type="text"
                    value={newReviewer.certification}
                    onChange={(e) => setNewReviewer(prev => ({...prev, certification: e.target.value}))}
                    placeholder={t.enterCertification}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={addReviewer}
                  disabled={!newReviewer.name.trim() || !newReviewer.email.trim() || !newReviewer.role.trim()}
                  className="add-reviewer-btn"
                  style={{ opacity: (!newReviewer.name.trim() || !newReviewer.email.trim() || !newReviewer.role.trim()) ? 0.5 : 1 }}
                >
                  {t.add}
                </button>
                <button
                  onClick={() => setShowAddReviewer(false)}
                  style={{ background: '#6b7280', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}
                >
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
