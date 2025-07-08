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
  Badge
} from 'lucide-react';

interface ValidationData {
  reviewers: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
    certification?: string;
    status: 'pending' | 'approved' | 'rejected' | 'reviewing';
    comments?: string;
    rating?: number;
    validatedAt?: string;
    signature?: string;
  }>;
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
    hazards?: any[];
    controls?: any[];
    equipment?: any[];
  };
  onDataChange: (section: string, data: ValidationData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

const translations = {
  fr: {
    title: "Validation et Approbation",
    subtitle: "Validation par l'équipe et approbation finale",
    
    // Sections
    reviewersSection: "Réviseurs Désignés",
    validationCriteria: "Critères de Validation",
    approvalProcess: "Processus d'Approbation",
    finalApproval: "Approbation Finale",
    
    // Reviewers
    addReviewer: "Ajouter un Réviseur",
    reviewerName: "Nom du Réviseur",
    reviewerRole: "Rôle",
    reviewerEmail: "Email",
    department: "Département",
    certification: "Certification",
    selectReviewer: "Sélectionner un réviseur",
    
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
    
    // Validation criteria
    hazardIdent: "Identification des Dangers",
    controlMeasures: "Mesures de Contrôle",
    equipmentSel: "Sélection d'Équipements",
    procedural: "Procédures",
    regulatory: "Conformité Réglementaire",
    
    // Messages
    allCriteriaRequired: "Tous les critères doivent être validés",
    minimumReviewers: "Nombre minimum de réviseurs requis",
    reviewDeadline: "Échéance de révision",
    approvalRequired: "Approbation superviseur requise",
    
    // Comments
    comments: "Commentaires",
    addYourComment: "Ajoutez votre commentaire...",
    rating: "Évaluation",
    noComments: "Aucun commentaire pour le moment",
    
    // Final approval
    approvedBy: "Approuvé par",
    approvedAt: "Approuvé le",
    conditions: "Conditions d'approbation",
    signature: "Signature électronique"
  },
  en: {
    title: "Validation and Approval",
    subtitle: "Team validation and final approval",
    
    // Sections
    reviewersSection: "Designated Reviewers",
    validationCriteria: "Validation Criteria",
    approvalProcess: "Approval Process",
    finalApproval: "Final Approval",
    
    // Reviewers
    addReviewer: "Add Reviewer",
    reviewerName: "Reviewer Name",
    reviewerRole: "Role",
    reviewerEmail: "Email",
    department: "Department",
    certification: "Certification",
    selectReviewer: "Select a reviewer",
    
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
    
    // Validation criteria
    hazardIdent: "Hazard Identification",
    controlMeasures: "Control Measures",
    equipmentSel: "Equipment Selection",
    procedural: "Procedures",
    regulatory: "Regulatory Compliance",
    
    // Messages
    allCriteriaRequired: "All criteria must be validated",
    minimumReviewers: "Minimum number of reviewers required",
    reviewDeadline: "Review deadline",
    approvalRequired: "Supervisor approval required",
    
    // Comments
    comments: "Comments",
    addYourComment: "Add your comment...",
    rating: "Rating",
    noComments: "No comments yet",
    
    // Final approval
    approvedBy: "Approved by",
    approvedAt: "Approved on",
    conditions: "Approval conditions",
    signature: "Electronic signature"
  }
};

// Mock data pour les réviseurs disponibles
const availableReviewers = [
  { id: '1', name: 'Marie Dubois', role: 'Superviseur HSE', department: 'Sécurité', email: 'marie.dubois@company.com', certification: 'CRSP' },
  { id: '2', name: 'Jean Martin', role: 'Chef d\'équipe', department: 'Production', email: 'jean.martin@company.com', certification: 'ASP' },
  { id: '3', name: 'Sophie Tremblay', role: 'Ingénieure', department: 'Ingénierie', email: 'sophie.tremblay@company.com', certification: 'Ing.' },
  { id: '4', name: 'Pierre Gagnon', role: 'Contremaître', department: 'Maintenance', email: 'pierre.gagnon@company.com' },
];

export default function Step6Validation({ 
  formData, 
  onDataChange, 
  language,
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
  const [newComment, setNewComment] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');

  useEffect(() => {
    onDataChange('validation', validationData);
  }, [validationData, onDataChange]);

  const addReviewer = (reviewerId: string) => {
    const reviewer = availableReviewers.find(r => r.id === reviewerId);
    if (reviewer && !validationData.reviewers.find(r => r.id === reviewerId)) {
      setValidationData(prev => ({
        ...prev,
        reviewers: [...prev.reviewers, {
          ...reviewer,
          status: 'pending' as const
        }]
      }));
      setSelectedReviewer('');
      setShowAddReviewer(false);
    }
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
              validatedAt: new Date().toISOString()
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

  const allCriteriaValidated = Object.values(validationData.validationCriteria).every(Boolean);
  const sufficientReviewers = validationData.reviewers.length >= validationData.minimumReviewers;
  const allReviewersResponded = validationData.reviewers.every(r => r.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Validation Criteria */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          {t.validationCriteria}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(validationData.validationCriteria).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateCriteria(key as keyof ValidationData['validationCriteria'], e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t[key as keyof typeof t] || key}
              </span>
              {value && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </label>
          ))}
        </div>

        {!allCriteriaValidated && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">{t.allCriteriaRequired}</span>
          </div>
        )}
      </div>

      {/* Reviewers Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            {t.reviewersSection}
          </h3>
          <button
            onClick={() => setShowAddReviewer(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {t.addReviewer}
          </button>
        </div>

        {/* Add Reviewer Modal */}
        {showAddReviewer && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t.selectReviewer}</option>
              {availableReviewers
                .filter(r => !validationData.reviewers.find(vr => vr.id === r.id))
                .map(reviewer => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name} - {reviewer.role} ({reviewer.department})
                  </option>
                ))
              }
            </select>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => selectedReviewer && addReviewer(selectedReviewer)}
                disabled={!selectedReviewer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowAddReviewer(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Reviewers List */}
        <div className="space-y-4">
          {validationData.reviewers.map(reviewer => (
            <div key={reviewer.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{reviewer.name}</h4>
                    <p className="text-sm text-gray-600">{reviewer.role} - {reviewer.department}</p>
                    {reviewer.certification && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Badge className="w-3 h-3 mr-1" />
                        {reviewer.certification}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reviewer.status)}`}>
                  {getStatusIcon(reviewer.status)}
                  <span className="ml-1">{t[reviewer.status as keyof typeof t]}</span>
                </div>
              </div>

              {reviewer.status === 'pending' && (
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => updateReviewerStatus(reviewer.id, 'approved', '', 5)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 inline mr-1" />
                    Approuver
                  </button>
                  <button
                    onClick={() => updateReviewerStatus(reviewer.id, 'rejected', 'Nécessite des modifications')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <ThumbsDown className="w-4 h-4 inline mr-1" />
                    Rejeter
                  </button>
                </div>
              )}

              {reviewer.comments && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t.comments}</span>
                    {reviewer.rating && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < reviewer.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{reviewer.comments}</p>
                  {reviewer.validatedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(reviewer.validatedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {validationData.reviewers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun réviseur assigné pour le moment</p>
          </div>
        )}

        {/* Validation Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{validationData.reviewers.length}</div>
              <div className="text-sm text-gray-600">Réviseurs Assignés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {validationData.reviewers.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approbations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {validationData.reviewers.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Approval */}
      {allCriteriaValidated && sufficientReviewers && allReviewersResponded && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-purple-500 mr-2" />
            {t.finalApproval}
          </h3>

          {!validationData.finalApproval ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Prêt pour l'approbation finale
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setValidationData(prev => ({
                    ...prev,
                    finalApproval: {
                      approvedBy: 'Superviseur HSE',
                      approvedAt: new Date().toISOString(),
                      signature: 'Electronic Signature - ' + new Date().toISOString()
                    }
                  }));
                }}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {t.signDocument}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Document Approuvé</span>
                </div>
                <span className="text-sm text-green-600">
                  {new Date(validationData.finalApproval.approvedAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>{t.approvedBy}:</strong> {validationData.finalApproval.approvedBy}</p>
                <p><strong>{t.signature}:</strong> ✓ Signé électroniquement</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      <div className="space-y-2">
        {!allCriteriaValidated && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">Tous les critères doivent être validés avant approbation</span>
          </div>
        )}
        
        {!sufficientReviewers && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              {validationData.minimumReviewers - validationData.reviewers.length} réviseur(s) supplémentaire(s) requis
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
