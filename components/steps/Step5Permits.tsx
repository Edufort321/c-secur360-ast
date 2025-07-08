'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Bell,
  User,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Archive
} from 'lucide-react';

interface Permit {
  id: string;
  type: 'work' | 'hot_work' | 'confined_space' | 'electrical' | 'excavation' | 'chemical' | 'height' | 'crane' | 'custom';
  title: string;
  description: string;
  required: boolean;
  status: 'not_started' | 'in_progress' | 'pending_approval' | 'approved' | 'expired' | 'rejected';
  issueDate?: string;
  expiryDate?: string;
  validityPeriod?: number; // hours
  authority: {
    name: string;
    contact: string;
    phone?: string;
    email?: string;
  };
  conditions: string[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'document';
    uploadDate: string;
  }>;
  approver?: {
    name: string;
    title: string;
    signature?: string;
    approvedAt?: string;
  };
  relatedHazards: string[];
  prerequisites: string[];
  cost?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface Authority {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory';
  contact: string;
  phone?: string;
  email?: string;
  address?: string;
  specialties: string[];
  responseTime: string; // "2-3 jours ouvrables"
  processingFee?: number;
}

interface PermitsData {
  permits: Permit[];
  authorities: Authority[];
  generalRequirements: {
    projectInsurance: boolean;
    safetyPlan: boolean;
    emergencyPlan: boolean;
    communicationPlan: boolean;
    environmentalAssessment: boolean;
  };
  timeline: {
    applicationDeadline?: string;
    workStartDate?: string;
    permitBuffer: number; // days before work starts
  };
  notifications: {
    reminderDays: number[];
    notifyExpiry: boolean;
    escalationRules: boolean;
  };
}

interface PermitsStepProps {
  formData: {
    permits?: PermitsData;
    projectInfo?: any;
    hazards?: any[];
  };
  onDataChange: (section: string, data: PermitsData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

const translations = {
  fr: {
    title: "Permis et Autorisations",
    subtitle: "Gérez tous les permis requis pour votre projet",
    
    // Sections
    requiredPermits: "Permis Requis",
    authorities: "Autorités",
    generalRequirements: "Exigences Générales",
    timeline: "Échéancier",
    notifications: "Notifications",
    
    // Permit types
    permitTypes: {
      work: "Permis de Travail",
      hot_work: "Travail à Chaud",
      confined_space: "Espace Confiné",
      electrical: "Travail Électrique",
      excavation: "Excavation",
      chemical: "Manipulation Chimique",
      height: "Travail en Hauteur",
      crane: "Opération de Grue",
      custom: "Personnalisé"
    },
    
    // Status
    status: {
      not_started: "Non Démarré",
      in_progress: "En Cours",
      pending_approval: "En Attente d'Approbation",
      approved: "Approuvé",
      expired: "Expiré",
      rejected: "Rejeté"
    },
    
    // Urgency
    urgency: {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      critical: "Critique"
    },
    
    // Actions
    addPermit: "Ajouter Permis",
    editPermit: "Modifier Permis",
    deletePermit: "Supprimer Permis",
    viewDetails: "Voir Détails",
    downloadPermit: "Télécharger",
    uploadDocument: "Téléverser Document",
    applyForPermit: "Demander Permis",
    renewPermit: "Renouveler",
    
    // Fields
    permitTitle: "Titre du Permis",
    description: "Description",
    isRequired: "Requis",
    issueDate: "Date d'Émission",
    expiryDate: "Date d'Expiration",
    validityPeriod: "Période de Validité (heures)",
    authority: "Autorité",
    conditions: "Conditions",
    attachments: "Pièces Jointes",
    relatedHazards: "Dangers Associés",
    prerequisites: "Prérequis",
    cost: "Coût",
    urgencyLevel: "Niveau d'Urgence",
    
    // Authority fields
    authorityName: "Nom de l'Autorité",
    authorityType: "Type",
    contact: "Contact",
    phone: "Téléphone",
    email: "Email",
    address: "Adresse",
    specialties: "Spécialités",
    responseTime: "Temps de Réponse",
    processingFee: "Frais de Traitement",
    
    // Authority types
    authorityTypes: {
      internal: "Interne",
      external: "Externe", 
      regulatory: "Réglementaire"
    },
    
    // General requirements
    projectInsurance: "Assurance Projet",
    safetyPlan: "Plan de Sécurité",
    emergencyPlan: "Plan d'Urgence",
    communicationPlan: "Plan de Communication",
    environmentalAssessment: "Évaluation Environnementale",
    
    // Timeline
    applicationDeadline: "Date Limite de Demande",
    workStartDate: "Date de Début des Travaux",
    permitBuffer: "Délai de Sécurité (jours)",
    
    // Notifications
    reminderDays: "Rappels (jours avant expiration)",
    notifyExpiry: "Notifier les Expirations",
    escalationRules: "Règles d'Escalade",
    
    // Messages
    noPermits: "Aucun permis ajouté",
    permitAdded: "Permis ajouté avec succès",
    permitUpdated: "Permis mis à jour",
    permitDeleted: "Permis supprimé",
    allPermitsApproved: "Tous les permis sont approuvés",
    expiringPermits: "Permis bientôt expirés",
    
    // Validation
    titleRequired: "Le titre est requis",
    authorityRequired: "L'autorité est requise",
    expiryBeforeStart: "La date d'expiration doit être après le début des travaux",
    
    // Summary
    totalPermits: "Total des Permis",
    approvedPermits: "Permis Approuvés",
    pendingPermits: "En Attente",
    expiredPermits: "Expirés",
    totalCost: "Coût Total",
    averageProcessingTime: "Temps Moyen de Traitement"
  },
  en: {
    title: "Permits and Authorizations",
    subtitle: "Manage all required permits for your project",
    
    // Sections
    requiredPermits: "Required Permits",
    authorities: "Authorities",
    generalRequirements: "General Requirements",
    timeline: "Timeline",
    notifications: "Notifications",
    
    // Permit types
    permitTypes: {
      work: "Work Permit",
      hot_work: "Hot Work",
      confined_space: "Confined Space",
      electrical: "Electrical Work",
      excavation: "Excavation",
      chemical: "Chemical Handling",
      height: "Work at Height",
      crane: "Crane Operation",
      custom: "Custom"
    },
    
    // Status
    status: {
      not_started: "Not Started",
      in_progress: "In Progress",
      pending_approval: "Pending Approval",
      approved: "Approved",
      expired: "Expired",
      rejected: "Rejected"
    },
    
    // Urgency
    urgency: {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical"
    },
    
    // Actions
    addPermit: "Add Permit",
    editPermit: "Edit Permit",
    deletePermit: "Delete Permit",
    viewDetails: "View Details",
    downloadPermit: "Download",
    uploadDocument: "Upload Document",
    applyForPermit: "Apply for Permit",
    renewPermit: "Renew",
    
    // Fields
    permitTitle: "Permit Title",
    description: "Description",
    isRequired: "Required",
    issueDate: "Issue Date",
    expiryDate: "Expiry Date",
    validityPeriod: "Validity Period (hours)",
    authority: "Authority",
    conditions: "Conditions",
    attachments: "Attachments",
    relatedHazards: "Related Hazards",
    prerequisites: "Prerequisites",
    cost: "Cost",
    urgencyLevel: "Urgency Level",
    
    // Authority fields
    authorityName: "Authority Name",
    authorityType: "Type",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    address: "Address",
    specialties: "Specialties",
    responseTime: "Response Time",
    processingFee: "Processing Fee",
    
    // Authority types
    authorityTypes: {
      internal: "Internal",
      external: "External",
      regulatory: "Regulatory"
    },
    
    // General requirements
    projectInsurance: "Project Insurance",
    safetyPlan: "Safety Plan",
    emergencyPlan: "Emergency Plan",
    communicationPlan: "Communication Plan",
    environmentalAssessment: "Environmental Assessment",
    
    // Timeline
    applicationDeadline: "Application Deadline",
    workStartDate: "Work Start Date",
    permitBuffer: "Permit Buffer (days)",
    
    // Notifications
    reminderDays: "Reminders (days before expiry)",
    notifyExpiry: "Notify Expiry",
    escalationRules: "Escalation Rules",
    
    // Messages
    noPermits: "No permits added",
    permitAdded: "Permit added successfully",
    permitUpdated: "Permit updated",
    permitDeleted: "Permit deleted",
    allPermitsApproved: "All permits are approved",
    expiringPermits: "Permits expiring soon",
    
    // Validation
    titleRequired: "Title is required",
    authorityRequired: "Authority is required",
    expiryBeforeStart: "Expiry date must be after work start date",
    
    // Summary
    totalPermits: "Total Permits",
    approvedPermits: "Approved Permits",
    pendingPermits: "Pending",
    expiredPermits: "Expired",
    totalCost: "Total Cost",
    averageProcessingTime: "Average Processing Time"
  }
};

// Mock data pour les autorités
const defaultAuthorities: Authority[] = [
  {
    id: '1',
    name: 'CNESST',
    type: 'regulatory',
    contact: 'Service des permis',
    phone: '1-844-838-0808',
    email: 'permis@cnesst.gouv.qc.ca',
    specialties: ['Sécurité du travail', 'Santé occupationnelle'],
    responseTime: '5-10 jours ouvrables',
    processingFee: 150
  },
  {
    id: '2',
    name: 'Service de Sécurité Interne',
    type: 'internal',
    contact: 'Marie Dubois',
    phone: '514-555-0123',
    email: 'marie.dubois@company.com',
    specialties: ['Permis de travail', 'Espaces confinés'],
    responseTime: '1-2 jours ouvrables',
    processingFee: 0
  },
  {
    id: '3',
    name: 'Régie du bâtiment du Québec',
    type: 'regulatory',
    contact: 'Service technique',
    phone: '1-800-361-0761',
    email: 'info@rbq.gouv.qc.ca',
    specialties: ['Construction', 'Électricité'],
    responseTime: '3-5 jours ouvrables',
    processingFee: 75
  }
];

export default function Step5Permits({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: PermitsStepProps) {
  const t = translations[language];
  
  const [permitsData, setPermitsData] = useState<PermitsData>({
    permits: [],
    authorities: defaultAuthorities,
    generalRequirements: {
      projectInsurance: false,
      safetyPlan: false,
      emergencyPlan: false,
      communicationPlan: false,
      environmentalAssessment: false
    },
    timeline: {
      permitBuffer: 5
    },
    notifications: {
      reminderDays: [7, 3, 1],
      notifyExpiry: true,
      escalationRules: true
    },
    ...formData.permits
  });

  const [showAddPermit, setShowAddPermit] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    onDataChange('permits', permitsData);
  }, [permitsData, onDataChange]);

  const addPermit = (permitData: Partial<Permit>) => {
    const newPermit: Permit = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'work',
      title: '',
      description: '',
      required: true,
      status: 'not_started',
      authority: {
        name: '',
        contact: ''
      },
      conditions: [],
      attachments: [],
      relatedHazards: [],
      prerequisites: [],
      urgency: 'medium',
      ...permitData
    };

    setPermitsData(prev => ({
      ...prev,
      permits: [...prev.permits, newPermit]
    }));
    setShowAddPermit(false);
  };

  const updatePermit = (permitId: string, updates: Partial<Permit>) => {
    setPermitsData(prev => ({
      ...prev,
      permits: prev.permits.map(permit => 
        permit.id === permitId ? { ...permit, ...updates } : permit
      )
    }));
  };

  const deletePermit = (permitId: string) => {
    setPermitsData(prev => ({
      ...prev,
      permits: prev.permits.filter(permit => permit.id !== permitId)
    }));
  };

  const updateGeneralRequirements = (field: keyof PermitsData['generalRequirements'], value: boolean) => {
    setPermitsData(prev => ({
      ...prev,
      generalRequirements: {
        ...prev.generalRequirements,
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: Permit['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: Permit['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: Permit['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredPermits = permitsData.permits.filter(permit => {
    const matchesStatus = filterStatus === 'all' || permit.status === filterStatus;
    const matchesSearch = permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const permitStats = {
    total: permitsData.permits.length,
    approved: permitsData.permits.filter(p => p.status === 'approved').length,
    pending: permitsData.permits.filter(p => p.status === 'pending_approval' || p.status === 'in_progress').length,
    expired: permitsData.permits.filter(p => p.status === 'expired').length,
    totalCost: permitsData.permits.reduce((sum, p) => sum + (p.cost || 0), 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
          <FileText className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-300">{t.subtitle}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
          <div className="text-2xl font-bold text-blue-400">{permitStats.total}</div>
          <div className="text-sm text-gray-300">{t.totalPermits}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
          <div className="text-2xl font-bold text-green-400">{permitStats.approved}</div>
          <div className="text-sm text-gray-300">{t.approvedPermits}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
          <div className="text-2xl font-bold text-yellow-400">{permitStats.pending}</div>
          <div className="text-sm text-gray-300">{t.pendingPermits}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
          <div className="text-2xl font-bold text-red-400">{permitStats.expired}</div>
          <div className="text-sm text-gray-300">{t.expiredPermits}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center">
          <div className="text-2xl font-bold text-purple-400">${permitStats.totalCost}</div>
          <div className="text-sm text-gray-300">{t.totalCost}</div>
        </div>
      </div>

      {/* Permits Management */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Shield className="w-5 h-5 text-orange-400 mr-2" />
            {t.requiredPermits}
          </h3>
          <button
            onClick={() => setShowAddPermit(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addPermit}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un permis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white"
          >
            <option value="all" className="text-gray-800">Tous les statuts</option>
            {Object.entries(t.status).map(([key, value]) => (
              <option key={key} value={key} className="text-gray-800">{value}</option>
            ))}
          </select>
        </div>

        {/* Permits List */}
        <div className="space-y-4">
          {filteredPermits.length > 0 ? (
            filteredPermits.map(permit => (
              <div key={permit.id} className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-white">{permit.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(permit.status)}`}>
                        {getStatusIcon(permit.status)}
                        <span className="ml-1">{t.status[permit.status]}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(permit.urgency)}`}>
                        {t.urgency[permit.urgency]}
                      </span>
                      {permit.required && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                          Requis
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{permit.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {permit.authority.name}
                      </span>
                      {permit.expiryDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Expire: {new Date(permit.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                      {permit.cost && (
                        <span className="flex items-center">
                          ${permit.cost}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingPermit(permit)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"
                      title={t.editPermit}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* View details */}}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded"
                      title={t.viewDetails}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePermit(permit.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                      title={t.deletePermit}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {permit.conditions.length > 0 && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-200 mb-2">Conditions:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {permit.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-400 mr-2">•</span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>{searchTerm || filterStatus !== 'all' ? 'Aucun permis trouvé' : t.noPermits}</p>
            </div>
          )}
        </div>

        {/* Add/Edit Permit Modal */}
        {(showAddPermit || editingPermit) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPermit ? t.editPermit : t.addPermit}
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.permitTitle} *
                    </label>
                    <input
                      type="text"
                      defaultValue={editingPermit?.title || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ex: Permis de travail à chaud"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de Permis
                    </label>
                    <select
                      defaultValue={editingPermit?.type || 'work'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Object.entries(t.permitTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.description}
                  </label>
                  <textarea
                    defaultValue={editingPermit?.description || ''}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Description détaillée du permis..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.authority} *
                    </label>
                    <select
                      defaultValue={editingPermit?.authority.name || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Sélectionner une autorité</option>
                      {permitsData.authorities.map(authority => (
                        <option key={authority.id} value={authority.name}>
                          {authority.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.urgencyLevel}
                    </label>
                    <select
                      defaultValue={editingPermit?.urgency || 'medium'}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Object.entries(t.urgency).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.issueDate}
                    </label>
                    <input
                      type="date"
                      defaultValue={editingPermit?.issueDate || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.expiryDate}
                    </label>
                    <input
                      type="date"
                      defaultValue={editingPermit?.expiryDate || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.cost} ($)
                    </label>
                    <input
                      type="number"
                      defaultValue={editingPermit?.cost || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      defaultChecked={editingPermit?.required ?? true}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{t.isRequired}</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => {
                    // Logic to save permit
                    setShowAddPermit(false);
                    setEditingPermit(null);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {editingPermit ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  onClick={() => {
                    setShowAddPermit(false);
                    setEditingPermit(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* General Requirements */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
          {t.generalRequirements}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(permitsData.generalRequirements).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateGeneralRequirements(key as keyof PermitsData['generalRequirements'], e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-200">
                {String((t as any)[key] || key)}
              </span>
              {value && <CheckCircle className="w-4 h-4 text-green-400" />}
            </label>
          ))}
        </div>
      </div>

      {/* Timeline & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-blue-400 mr-2" />
            {t.timeline}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.applicationDeadline}
              </label>
              <input
                type="date"
                value={permitsData.timeline.applicationDeadline || ''}
                onChange={(e) => setPermitsData(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, applicationDeadline: e.target.value }
                }))}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.workStartDate}
              </label>
              <input
                type="date"
                value={permitsData.timeline.workStartDate || ''}
                onChange={(e) => setPermitsData(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, workStartDate: e.target.value }
                }))}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.permitBuffer}
              </label>
              <input
                type="number"
                value={permitsData.timeline.permitBuffer}
                onChange={(e) => setPermitsData(prev => ({
                  ...prev,
                  timeline: { ...prev.timeline, permitBuffer: parseInt(e.target.value) }
                }))}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 text-yellow-400 mr-2" />
            {t.notifications}
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={permitsData.notifications.notifyExpiry}
                onChange={(e) => setPermitsData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, notifyExpiry: e.target.checked }
                }))}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-200">{t.notifyExpiry}</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={permitsData.notifications.escalationRules}
                onChange={(e) => setPermitsData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, escalationRules: e.target.checked }
                }))}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-200">{t.escalationRules}</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.reminderDays}
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 7, 14, 30].map(days => (
                  <label key={days} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permitsData.notifications.reminderDays.includes(days)}
                      onChange={(e) => {
                        const newDays = e.target.checked 
                          ? [...permitsData.notifications.reminderDays, days]
                          : permitsData.notifications.reminderDays.filter(d => d !== days);
                        setPermitsData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, reminderDays: newDays }
                        }));
                      }}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-200">{days}j</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
