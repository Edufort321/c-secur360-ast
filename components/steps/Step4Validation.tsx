'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, Users, Shield, 
  User, Clock, Award, MessageSquare, ThumbsUp,
  Edit, Save, Star, Calendar
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step4ValidationProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
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
    if (!newReviewer.name || !newReviewer.role) return;
    
    const reviewer: Reviewer = {
      id: `reviewer-${Date.now()}`,
      name: newReviewer.name,
      role: newReviewer.role,
      email: newReviewer.email,
      status: 'pending',
      comments: newReviewer.comments
    };
    
    const newReviewers = [...reviewers, reviewer];
    setReviewers(newReviewers);
    updateFormData(criteria, newReviewers);
    
    setNewReviewer({ name: '', role: '', email: '', comments: '' });
    setIsAddingReviewer(false);
  };

  const handleReviewerAction = (reviewerId: string, action: 'approve' | 'reject', rating?: number) => {
    const newReviewers = reviewers.map(reviewer => 
      reviewer.id === reviewerId 
        ? { 
            ...reviewer, 
            status: action === 'approve' ? 'approved' : 'rejected',
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
            padding: 24px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
          }
          
          .validation-title {
            color: #22c55e;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .validation-subtitle {
            color: #16a34a;
            margin: 0;
            font-size: 14px;
          }
          
          .validation-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-top: 20px;
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
            padding: 24px;
            margin-bottom: 24px;
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
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
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

      <div className="validation-container">
        {/* Header avec statistiques */}
        <div className="validation-header">
          <h2 className="validation-title">
            <CheckCircle size={24} />
            {t.title}
          </h2>
          <p className="validation-subtitle">{t.subtitle}</p>
          
          <div className="validation-stats">
            <div className="stat-card">
              <div className="stat-value">{validCriteria}/{totalCriteria}</div>
              <div className="stat-label">{t.stats.criteriaValid}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{reviewers.length}</div>
              <div className="stat-label">{t.stats.reviewersAssigned}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{approvedReviewers}</div>
              <div className="stat-label">{t.stats.approvalsReceived}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(overallProgress * 100)}%</div>
              <div className="stat-label">{t.stats.overallStatus}</div>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${overallProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Critères de validation */}
        <div className="section-card">
          <h3 className="section-title">
            <Shield size={20} />
            {t.validationCriteria}
          </h3>
          
          <div className="criteria-grid">
            {(Object.keys(criteria) as Array<keyof ValidationCriteria>).map(key => (
              <div 
                key={key}
                className={`criteria-item ${criteria[key] ? 'valid' : ''}`}
                onClick={() => handleCriteriaChange(key, !criteria[key])}
              >
                <div className="criteria-header">
                  <span className="criteria-name">{t.criteria[key]}</span>
                  <div 
                    className="criteria-status"
                    style={{ backgroundColor: getCriteriaColor(criteria[key]) }}
                  >
                    {criteria[key] ? '✓' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe de révision */}
        <div className="section-card">
          <h3 className="section-title">
            <Users size={20} />
            {t.reviewTeam}
          </h3>
          
          {reviewers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>{t.messages.noReviewers}</p>
            </div>
          ) : (
            <div className="reviewer-list">
              {reviewers.map(reviewer => (
                <div key={reviewer.id} className="reviewer-card">
                  <div className="reviewer-header">
                    <div className="reviewer-info">
                      <h4>{reviewer.name}</h4>
                      <p>{reviewer.role} • {reviewer.email}</p>
                    </div>
                    <div 
                      className="reviewer-status"
                      style={{ 
                        backgroundColor: `${getStatusColor(reviewer.status)}20`,
                        color: getStatusColor(reviewer.status)
                      }}
                    >
                      {t.status[reviewer.status]}
                    </div>
                  </div>
                  
                  {reviewer.status === 'pending' && (
                    <div className="reviewer-actions">
                      <button 
                        className="btn btn-approve"
                        onClick={() => handleReviewerAction(reviewer.id, 'approve', 5)}
                      >
                        <ThumbsUp size={14} />
                        {t.actions.approve}
                      </button>
                      <button 
                        className="btn btn-reject"
                        onClick={() => handleReviewerAction(reviewer.id, 'reject')}
                      >
                        <AlertTriangle size={14} />
                        {t.actions.reject}
                      </button>
                      <button 
                        className="btn btn-edit"
                        onClick={() => {
                          setEditingComments(reviewer.id);
                          setTempComments(reviewer.comments || '');
                        }}
                      >
                        <Edit size={14} />
                        {t.actions.saveComments}
                      </button>
                    </div>
                  )}
                  
                  {reviewer.comments && (
                    <div className="comments-section">
                      <div className="comments-text">{reviewer.comments}</div>
                    </div>
                  )}
                  
                  {editingComments === reviewer.id && (
                    <div className="comments-section">
                      <textarea
                        value={tempComments}
                        onChange={(e) => setTempComments(e.target.value)}
                        placeholder={t.form.commentsPlaceholder}
                        className="form-input form-textarea"
                        rows={3}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleSaveComments(reviewer.id)}
                        >
                          <Save size={14} />
                          {t.actions.saveComments}
                        </button>
                        <button 
                          className="btn btn-edit"
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
              className="btn btn-edit"
              style={{ marginTop: '16px' }}
              onClick={() => setIsAddingReviewer(true)}
            >
              <Plus size={16} />
              {t.actions.addReviewer}
            </button>
          ) : (
            <div className="add-reviewer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t.form.reviewerName}</label>
                  <input
                    type="text"
                    value={newReviewer.name}
                    onChange={(e) => setNewReviewer({...newReviewer, name: e.target.value})}
                    className="form-input"
                    placeholder="Nom complet"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.form.reviewerRole}</label>
                  <input
                    type="text"
                    value={newReviewer.role}
                    onChange={(e) => setNewReviewer({...newReviewer, role: e.target.value})}
                    className="form-input"
                    placeholder="Ex: Superviseur sécurité"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.form.reviewerEmail}</label>
                  <input
                    type="email"
                    value={newReviewer.email}
                    onChange={(e) => setNewReviewer({...newReviewer, email: e.target.value})}
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.form.comments}</label>
                  <textarea
                    value={newReviewer.comments}
                    onChange={(e) => setNewReviewer({...newReviewer, comments: e.target.value})}
                    className="form-input form-textarea"
                    placeholder={t.form.commentsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-approve"
                  onClick={handleAddReviewer}
                  disabled={!newReviewer.name || !newReviewer.role}
                >
                  <Save size={14} />
                  {t.actions.addReviewer}
                </button>
                <button 
                  className="btn btn-edit"
                  onClick={() => {
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