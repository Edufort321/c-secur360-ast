'use client';

import React, { useState, useCallback } from 'react';
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
    validationSummary: "Résumé de Validation",
    
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
    
    // Actions
    approve: "Approuver",
    reject: "Rejeter",
    
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
    
    // Comments
    comments: "Commentaires",
    rating: "Évaluation",
    needsModifications: "Nécessite des modifications",
    
    // Final approval
    approvedBy: "Approuvé par",
    approvedAt: "Approuvé le",
    signDocument: "Signer le Document",
    
    // Summary
    totalReviewers: "Réviseurs Assignés",
    approvals: "Approbations",
    rejections: "Rejets",
    pendingReviews: "En Attente",
    noReviewersAssigned: "Aucun réviseur assigné pour le moment",
    additionalReviewersRequired: "réviseur(s) supplémentaire(s) requis",
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
    close: "Fermer"
  },
  en: {
    title: "Team Validation & Approval",
    subtitle: "Collaborative validation process and final approval",
    
    // Sections
    reviewersSection: "Designated Reviewers",
    validationCriteria: "Validation Criteria",
    validationSummary: "Validation Summary",
    
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
    
    // Actions
    approve: "Approve",
    reject: "Reject",
    
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
    
    // Comments
    comments: "Comments",
    rating: "Rating",
    needsModifications: "Needs modifications",
    
    // Final approval
    approvedBy: "Approved by",
    approvedAt: "Approved on",
    signDocument: "Sign Document",
    
    // Summary
    totalReviewers: "Assigned Reviewers",
    approvals: "Approvals",
    rejections: "Rejections",
    pendingReviews: "Pending",
    noReviewersAssigned: "No reviewers assigned yet",
    additionalReviewersRequired: "additional reviewer(s) required",
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
    close: "Close"
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
  
  // ✅ FIX CRITIQUE : État local stable SANS useEffect problématique
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
    ...formData.validation
  }));

  const [showAddReviewer, setShowAddReviewer] = useState(false);
  
  const [newReviewer, setNewReviewer] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    certification: ''
  });

  // ✅ FIX CRITIQUE : NOTIFICATION PARENT DIRECTE SANS BOUCLE
  const notifyParent = useCallback((newData: ValidationData) => {
    console.log('🔥 Step5 - Notification parent directe:', newData);
    onDataChange('validation', newData);
  }, [onDataChange]);

  // =================== HANDLERS OPTIMISÉS SANS BOUCLES ===================
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

    // ✅ Mise à jour locale + notification parent en une seule fois
    setValidationData(updatedData);
    notifyParent(updatedData);

    // Reset formulaire
    setNewReviewer({
      name: '',
      role: '',
      email: '',
      department: '',
      certification: ''
    });
    setShowAddReviewer(false);
    
    console.log('✅ Step5 - Réviseur ajouté:', reviewer.name);
  }, [newReviewer, validationData, notifyParent]);

  const removeReviewer = useCallback((reviewerId: string) => {
    const updatedData = {
      ...validationData,
      reviewers: validationData.reviewers.filter(r => r.id !== reviewerId)
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
    console.log('✅ Step5 - Réviseur supprimé:', reviewerId);
  }, [validationData, notifyParent]);

  const updateReviewerStatus = useCallback((reviewerId: string, status: 'approved' | 'rejected', comment?: string, rating?: number) => {
    const updatedData = {
      ...validationData,
      reviewers: validationData.reviewers.map(reviewer => 
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
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
    console.log(`✅ Step5 - Statut ${status} pour réviseur:`, reviewerId);
  }, [validationData, notifyParent, language]);

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
    console.log(`✅ Step5 - Critère ${criteria} mis à jour:`, value);
  }, [validationData, notifyParent]);

  const finalizeApproval = useCallback(() => {
    const updatedData = {
      ...validationData,
      finalApproval: {
        approvedBy: 'Superviseur HSE',
        approvedAt: new Date().toISOString(),
        signature: 'Signature électronique - ' + new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')
      }
    };
    
    setValidationData(updatedData);
    notifyParent(updatedData);
    console.log('✅ Step5 - Approbation finalisée');
  }, [validationData, notifyParent, language]);

  // =================== FONCTIONS UTILITAIRES ===================
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
      case 'reviewing': return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' };
      default: return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <ThumbsDown size={14} />;
      case 'reviewing': return <Eye size={14} />;
      default: return <Clock size={14} />;
    }
  };

  // =================== VALEURS CALCULÉES ===================
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

      {/* Validation Summary */}
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
          {t.validationSummary}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#3b82f6' }}>
              {validationData.reviewers.length}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.totalReviewers}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#10b981' }}>
              {approvedReviewers}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.approvals}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#ef4444' }}>
              {rejectedReviewers}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.rejections}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#f59e0b' }}>
              {pendingReviewers}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.pendingReviews}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#ffffff' }}>
              {criteriaCount}/{totalCriteria}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              Critères
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '16px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#3b82f6' }}>
              {completionRate}%
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {t.completionRate}
            </div>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(100, 116, 139, 0.3)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #059669)',
            width: `${completionRate}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Validation Criteria */}
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

        {!allCriteriaValidated && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            color: '#fbbf24'
          }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '14px' }}>{t.allCriteriaRequired}</span>
          </div>
        )}
      </div>

      {/* Reviewers Section */}
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
            <Users size={20} />
            {t.reviewersSection}
          </h3>
          <button
            onClick={() => setShowAddReviewer(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
            {t.addReviewer}
          </button>
        </div>

        {/* Reviewers List */}
        {validationData.reviewers.length > 0 ? (
          validationData.reviewers.map(reviewer => {
            const statusColors = getStatusColor(reviewer.status);
            return (
              <div key={reviewer.id} style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {reviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        margin: '0 0 4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        wordBreak: 'break-word'
                      }}>
                        {reviewer.name}
                      </h4>
                      <p style={{
                        margin: '0 0 2px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        wordBreak: 'break-word'
                      }}>
                        {reviewer.role} - {reviewer.department}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '11px',
                        color: '#9ca3af',
                        wordBreak: 'break-word'
                      }}>
                        {reviewer.email}
                      </p>
                      {reviewer.certification && (
                        <span style={{
                          fontSize: '10px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '4px'
                        }}>
                          {reviewer.certification}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: statusColors.bg,
                      border: `1px solid ${statusColors.border}`,
                      color: statusColors.text,
                      whiteSpace: 'nowrap'
                    }}>
                      {getStatusIcon(reviewer.status)}
                      <span>{t[reviewer.status as keyof typeof t]}</span>
                    </div>
                    <button
                      onClick={() => removeReviewer(reviewer.id)}
                      title={t.removeReviewer}
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minHeight: '28px',
                        minWidth: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {reviewer.status === 'pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => updateReviewerStatus(reviewer.id, 'approved', '', 5)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '32px'
                      }}
                    >
                      <ThumbsUp size={12} />
                      {t.approve}
                    </button>
                    <button
                      onClick={() => updateReviewerStatus(reviewer.id, 'rejected', t.needsModifications)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '32px'
                      }}
                    >
                      <ThumbsDown size={12} />
                      {t.reject}
                    </button>
                  </div>
                )}

                {reviewer.comments && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(100, 116, 139, 0.3)'
                  }}>
                    <strong style={{ fontSize: '12px', color: '#e2e8f0' }}>{t.comments}:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                      {reviewer.comments}
                    </p>
                    {reviewer.rating && (
                      <div style={{ display: 'flex', gap: '2px', margin: '6px 0' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12}
                            style={{ color: i < reviewer.rating! ? '#fbbf24' : '#64748b' }}
                          />
                        ))}
                      </div>
                    )}
                    {reviewer.validatedAt && (
                      <p style={{ fontSize: '9px', color: '#9ca3af', margin: '4px 0 0' }}>
                        {new Date(reviewer.validatedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#94a3b8'
          }}>
            <Users size={40} style={{ margin: '0 auto 12px', color: '#64748b' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>{t.noReviewersAssigned}</p>
          </div>
        )}

        {/* Validation Messages */}
        {!sufficientReviewers && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            color: '#fbbf24'
          }}>
            <Users size={18} />
            <span style={{ fontSize: '14px' }}>
              {validationData.minimumReviewers - validationData.reviewers.length} {t.additionalReviewersRequired}
            </span>
          </div>
        )}
      </div>

      {/* Final Approval */}
      {allCriteriaValidated && sufficientReviewers && allReviewersResponded && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          {!validationData.finalApproval ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{t.readyForApproval}</h3>
              <p style={{ margin: '0 0 16px', fontSize: '14px', opacity: 0.9 }}>
                Tous les critères sont validés et les réviseurs ont répondu
              </p>
              <button 
                onClick={finalizeApproval}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '14px'
                }}
              >
                {t.signDocument}
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#10b981'
            }}>
              <CheckCircle size={18} />
              <div>
                <strong>{t.documentApproved}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
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
                {t.addReviewer}
              </h3>
              <button
                onClick={() => setShowAddReviewer(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#94a3b8',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
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
                  {t.reviewerName} *
                </label>
                <input
                  type="text"
                  value={newReviewer.name}
                  onChange={(e) => setNewReviewer(prev => ({...prev, name: e.target.value}))}
                  placeholder={t.enterName}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    minHeight: '48px'
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
                  {t.reviewerRole} *
                </label>
                <input
                  type="text"
                  value={newReviewer.role}
                  onChange={(e) => setNewReviewer(prev => ({...prev, role: e.target.value}))}
                  placeholder={t.enterRole}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    minHeight: '48px'
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
                  {t.reviewerEmail} *
                </label>
                <input
                  type="email"
                  value={newReviewer.email}
                  onChange={(e) => setNewReviewer(prev => ({...prev, email: e.target.value}))}
                  placeholder={t.enterEmail}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    minHeight: '48px'
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
                  {t.department}
                </label>
                <input
                  type="text"
                  value={newReviewer.department}
                  onChange={(e) => setNewReviewer(prev => ({...prev, department: e.target.value}))}
                  placeholder={t.enterDepartment}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    minHeight: '48px'
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
                  {t.certification}
                </label>
                <input
                  type="text"
                  value={newReviewer.certification}
                  onChange={(e) => setNewReviewer(prev => ({...prev, certification: e.target.value}))}
                  placeholder={t.enterCertification}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    minHeight: '48px'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={addReviewer}
                disabled={!newReviewer.name.trim() || !newReviewer.email.trim() || !newReviewer.role.trim()}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '48px',
                  fontSize: '14px',
                  opacity: (!newReviewer.name.trim() || !newReviewer.email.trim() || !newReviewer.role.trim()) ? 0.5 : 1
                }}
              >
                {t.add}
              </button>
              <button
                onClick={() => setShowAddReviewer(false)}
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
