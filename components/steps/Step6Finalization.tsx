'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  FileText, 
  Download, 
  Archive, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  Share2,
  Save,
  Calendar,
  User,
  MapPin,
  Shield,
  Award,
  Target,
  BarChart3,
  Globe,
  Printer,
  Mail,
  Smartphone,
  Image,
  X,
  Plus,
  Upload,
  Users,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Bell,
  QrCode,
  Link,
  Settings,
  Lock,
  Edit,
  Trash2,
  UserPlus,
  PenTool,
  HardHat
} from 'lucide-react';

interface EquipmentData {
  list: Equipment[];
  selected: Equipment[];
  totalCost: number;
  inspectionStatus: {
    total: number;
    verified: number;
    available: number;
    verificationRate: number;
    availabilityRate: number;
  };
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  required: boolean;
  available: boolean;
  verified: boolean;
  notes?: string;
  certification?: string;
  inspectionDate?: string;
  inspectedBy?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  cost?: number;
  supplier?: string;
  photos?: EquipmentPhoto[];
  priority?: 'high' | 'medium' | 'low';
  mandatoryFor?: string[];
}

interface EquipmentPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'inspection' | 'condition' | 'certification' | 'use';
}

interface HazardData {
  list: Hazard[];
  selected: Hazard[];
  stats: {
    totalHazards: number;
    categories: Record<string, number>;
  };
}

interface Hazard {
  id: string;
  category: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  selected: boolean;
  controlMeasures: ControlMeasure[];
}

interface ControlMeasure {
  id: string;
  name: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  priority: number;
  implemented: boolean;
  responsible?: string;
  deadline?: string;
  notes?: string;
}

interface PermitData {
  permits: WorkPermit[];
  authorities: Authority[];
  generalRequirements: GeneralRequirement[];
  timeline: TimelineItem[];
  notifications: NotificationItem[];
  hotWorkPermit?: HotWorkPermit;
  confinedSpacePermit?: ConfinedSpacePermit;
  heightWorkPermit?: HeightWorkPermit;
  electricalPermit?: ElectricalPermit;
  regulatory: RegulatoryCompliance;
}

interface WorkPermit {
  id: string;
  type: string;
  number: string;
  issuedBy: string;
  validFrom: string;
  validTo: string;
  conditions: string[];
  isRequired: boolean;
  isObtained: boolean;
  documents?: PermitDocument[];
}

interface PermitDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  timestamp: string;
}

interface Authority {
  id: string;
  name: string;
  type: string;
  contactInfo: string;
  jurisdiction: string;
  requirements: string[];
  isRequired: boolean;
}

interface GeneralRequirement {
  id: string;
  category: string;
  description: string;
  isRequired: boolean;
  deadline?: string;
  responsible?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TimelineItem {
  id: string;
  date: string;
  activity: string;
  responsible: string;
  status: 'pending' | 'completed' | 'overdue';
  dependencies?: string[];
}

interface NotificationItem {
  id: string;
  recipient: string;
  type: string;
  message: string;
  scheduledDate: string;
  sent: boolean;
  acknowledged: boolean;
}

interface HotWorkPermit {
  fireWatchRequired: boolean;
  fireWatchName?: string;
  extinguisherLocation: string;
  hotWorkType: string[];
  precautions: string[];
  validityHours: number;
}

interface ConfinedSpacePermit {
  spaceType: string;
  entryProcedure: string[];
  gasMonitoring: boolean;
  attendantName?: string;
  ventilationRequired: boolean;
  emergencyProcedures: string[];
}

interface HeightWorkPermit {
  workHeight: number;
  fallProtectionType: string[];
  anchoragePoints: string[];
  weatherRestrictions: string[];
  rescuePlan: string;
}

interface ElectricalPermit {
  voltageLevel: string;
  lockoutRequired: boolean;
  qualifiedPersonnel: string[];
  testingRequired: boolean;
  isolationVerified: boolean;
}

interface RegulatoryCompliance {
  rsst: boolean;
  cnesst: boolean;
  municipalPermits: string[];
  environmentalConsiderations: string[];
  specialConditions: string[];
}

interface ValidationData {
  teamMembers: TeamMember[];
  discussionPoints: DiscussionPoint[];
  meetingMinutes: MeetingMinutes;
  approvals: TeamApproval[];
  concerns: string[];
  improvements: string[];
  finalValidation: FinalValidation;
  reviewers: TeamMember[];
  approvalRequired: boolean;
  minimumReviewers: number;
  validationCriteria: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  experience: string;
  certifications: string[];
  phoneNumber?: string;
  hasParticipated: boolean;
  signature?: string;
  signatureDate?: string;
  feedback?: string;
  certification?: string;
  status: 'approved' | 'pending' | 'rejected' | 'reviewing';
  comments?: string;
  rating?: number;
  validatedAt?: string;
}

interface DiscussionPoint {
  id: string;
  category: 'safety' | 'procedure' | 'equipment' | 'environment' | 'emergency';
  title: string;
  description: string;
  raisedBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolution?: string;
  isResolved: boolean;
  timestamp: string;
}

interface MeetingMinutes {
  date: string;
  duration: number;
  location: string;
  facilitator: string;
  participants: string[];
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface TeamApproval {
  memberId: string;
  memberName: string;
  role: string;
  approved: boolean;
  signature?: string;
  timestamp?: string;
  conditions?: string;
  digitalSignature?: string;
}

interface FinalValidation {
  allMembersParticipated: boolean;
  allConcernsAddressed: boolean;
  consensusReached: boolean;
  validatorName: string;
  validationDate: string;
  validationSignature: string;
}

interface Worker {
  id: string;
  name: string;
  position: string;
  employeeId?: string;
  company: string;
  phone?: string;
  email?: string;
  certifications: string[];
  experience: string;
  hasConsented: boolean;
  consentDate?: string;
  consentTime?: string;
  signature?: string;
  digitalSignature?: boolean;
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  type: 'before' | 'during' | 'after' | 'equipment' | 'hazard' | 'general';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  tags: string[];
}

interface DocumentGeneration {
  format: 'pdf' | 'word' | 'excel' | 'html';
  template: 'standard' | 'detailed' | 'summary' | 'regulatory';
  language: 'fr' | 'en' | 'both';
  includePhotos: boolean;
  includeSignatures: boolean;
  includeQRCode: boolean;
  branding: boolean;
  watermark: boolean;
}

interface Distribution {
  email: {
    enabled: boolean;
    recipients: string[];
    subject: string;
    message: string;
  };
  portal: {
    enabled: boolean;
    publish: boolean;
    category: string;
  };
  archive: {
    enabled: boolean;
    retention: number;
    location: 'local' | 'cloud' | 'both';
  };
  compliance: {
    enabled: boolean;
    authorities: string[];
    submissionDate?: string;
  };
}

interface FinalizationData {
  workers: Worker[];
  photos: Photo[];
  finalComments: string;
  documentGeneration: DocumentGeneration;
  distribution: Distribution;
  completionStatus: {
    projectInfo: boolean;
    equipment: boolean;
    hazards: boolean;
    permits: boolean;
    validation: boolean;
  };
  supervisorSignature?: {
    signedBy: string;
    signedAt: string;
    signature: string;
    title: string;
  };
  metadata: {
    createdAt: string;
    completedAt?: string;
    version: string;
    lastModified: string;
    totalDuration?: number;
  };
  shareLink?: string;
  qrCode?: string;
}

interface FinalizationStepProps {
  formData: {
    finalization?: FinalizationData;
    projectInfo?: any;
    equipment?: EquipmentData;
    hazards?: HazardData;
    permits?: PermitData;
    validation?: ValidationData;
  };
  onDataChange: (section: string, data: FinalizationData) => void;
  language: 'fr' | 'en';
  tenant: string;
}

export default function Step6Finalization({ 
  formData, 
  onDataChange, 
  language,
  tenant 
}: FinalizationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [finalizationData, setFinalizationData] = useState<FinalizationData>({
    workers: [],
    photos: [],
    finalComments: '',
    documentGeneration: {
      format: 'pdf',
      template: 'standard',
      language: 'fr',
      includePhotos: true,
      includeSignatures: true,
      includeQRCode: true,
      branding: true,
      watermark: true
    },
    distribution: {
      email: {
        enabled: true,
        recipients: [],
        subject: `AST - ${formData.projectInfo?.title || 'Nouveau projet'}`,
        message: 'Veuillez trouver ci-joint l\'Analyse Sécuritaire de Tâches complétée.'
      },
      portal: {
        enabled: true,
        publish: false,
        category: 'safety'
      },
      archive: {
        enabled: true,
        retention: 7,
        location: 'cloud'
      },
      compliance: {
        enabled: false,
        authorities: []
      }
    },
    completionStatus: {
      projectInfo: !!formData.projectInfo,
      equipment: !!(formData.equipment?.selected?.length),
      hazards: !!(formData.hazards?.selected?.length),
      permits: !!(formData.permits?.permits?.length),
      validation: !!formData.validation
    },
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0',
      lastModified: new Date().toISOString()
    },
    ...formData.finalization
  });

  const [activeTab, setActiveTab] = useState<'workers' | 'finalization'>('workers');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    position: '',
    company: '',
    certifications: [],
    experience: '',
    hasConsented: false
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    onDataChange('finalization', finalizationData);
  }, [finalizationData, onDataChange]);

  useEffect(() => {
    // Générer le lien de partage
    if (formData.projectInfo?.title) {
      const baseUrl = `https://${tenant}.csecur360.com`;
      const astId = Math.random().toString(36).substr(2, 9);
      const link = `${baseUrl}/ast/shared/${astId}`;
      setShareLink(link);
      setFinalizationData(prev => ({
        ...prev,
        shareLink: link
      }));
    }
  }, [formData.projectInfo?.title, tenant]);

  const addWorker = () => {
    if (newWorker.name && newWorker.position) {
      const worker: Worker = {
        id: Math.random().toString(36).substr(2, 9),
        name: newWorker.name || '',
        position: newWorker.position || '',
        employeeId: newWorker.employeeId,
        company: newWorker.company || '',
        phone: newWorker.phone,
        email: newWorker.email,
        certifications: newWorker.certifications || [],
        experience: newWorker.experience || '',
        hasConsented: false
      };
      
      setFinalizationData(prev => ({
        ...prev,
        workers: [...prev.workers, worker]
      }));
      
      setNewWorker({
        name: '',
        position: '',
        company: '',
        certifications: [],
        experience: '',
        hasConsented: false
      });
      setShowAddWorker(false);
    }
  };

  const updateWorkerConsent = (workerId: string, consented: boolean) => {
    const now = new Date();
    const currentDate = now.toLocaleDateString('fr-CA'); // YYYY-MM-DD format
    const currentTime = now.toLocaleTimeString('fr-CA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }); // HH:MM format

    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              hasConsented: consented,
              consentDate: consented ? currentDate : undefined,
              consentTime: consented ? currentTime : undefined,
              signature: consented ? `${worker.name} - ${currentDate} ${currentTime}` : undefined,
              digitalSignature: consented
            }
          : worker
      )
    }));
  };

  const removeWorker = (workerId: string) => {
    setFinalizationData(prev => ({
      ...prev,
      workers: prev.workers.filter(worker => worker.id !== workerId)
    }));
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert('Document généré avec succès');
  };

  const publishAST = async () => {
    setIsPublishing(true);
    
    setFinalizationData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        completedAt: new Date().toISOString(),
        totalDuration: Math.round((new Date().getTime() - new Date(prev.metadata.createdAt).getTime()) / 60000)
      },
      supervisorSignature: {
        signedBy: 'Superviseur Actuel',
        signedAt: new Date().toISOString(),
        signature: 'Electronic Signature - ' + new Date().toISOString(),
        title: 'Superviseur HSE'
      }
    }));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsPublishing(false);
    alert('AST publié avec succès');
  };

  const completionPercentage = Object.values(finalizationData.completionStatus).filter(Boolean).length / 
                               Object.values(finalizationData.completionStatus).length * 100;

  const consentedWorkers = finalizationData.workers.filter(w => w.hasConsented).length;
  const totalWorkers = finalizationData.workers.length;
  const allWorkersConsented = totalWorkers > 0 && consentedWorkers === totalWorkers;

  const isReadyToPublish = completionPercentage === 100 && 
                          allWorkersConsented &&
                          (finalizationData.distribution.email.enabled || 
                           finalizationData.distribution.portal.enabled ||
                           finalizationData.distribution.archive.enabled);

  const getWorkerStatusColor = (worker: Worker) => {
    if (worker.hasConsented) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getWorkerStatusText = (worker: Worker) => {
    if (worker.hasConsented) return 'Consentement donné';
    return 'En attente';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Consentement Équipe & Finalisation</h2>
        <p className="text-gray-300">Obtenez le consentement des travailleurs et finalisez l'AST</p>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('workers')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'workers'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <HardHat className="w-5 h-5 inline mr-2" />
            Équipe Chantier
          </button>
          <button
            onClick={() => setActiveTab('finalization')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'finalization'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Award className="w-5 h-5 inline mr-2" />
            Finalisation
          </button>
        </div>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          {/* Workers Management */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="w-5 h-5 text-blue-400 mr-2" />
                Travailleurs sur le Chantier
              </h3>
              <button
                onClick={() => setShowAddWorker(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter Travailleur
              </button>
            </div>

            {/* Worker Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{totalWorkers}</div>
                <div className="text-sm text-blue-300">Total Travailleurs</div>
              </div>
              <div className="bg-green-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{consentedWorkers}</div>
                <div className="text-sm text-green-300">Consentement donné</div>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{totalWorkers - consentedWorkers}</div>
                <div className="text-sm text-yellow-300">En attente</div>
              </div>
            </div>

            {/* Add Worker Modal */}
            {showAddWorker && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ajouter Travailleur</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du Travailleur *
                      </label>
                      <input
                        type="text"
                        value={newWorker.name || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Jean Tremblay"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poste *
                      </label>
                      <select
                        value={newWorker.position || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner un poste...</option>
                        <option value="Opérateur">Opérateur</option>
                        <option value="Technicien">Technicien</option>
                        <option value="Superviseur">Superviseur</option>
                        <option value="Ingénieur">Ingénieur</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Électricien">Électricien</option>
                        <option value="Soudeur">Soudeur</option>
                        <option value="Aide">Aide</option>
                        <option value="Contremaître">Contremaître</option>
                        <option value="Agent de sécurité">Agent de sécurité</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        # Employé
                      </label>
                      <input
                        type="text"
                        value={newWorker.employeeId || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, employeeId: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: EMP-12345"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entreprise
                      </label>
                      <select
                        value={newWorker.company || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner une entreprise...</option>
                        <option value="Interne">Interne</option>
                        <option value="Entrepreneur A">Entrepreneur A</option>
                        <option value="Entrepreneur B">Entrepreneur B</option>
                        <option value="Sous-traitant">Sous-traitant</option>
                        <option value="Consultant">Consultant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={newWorker.phone || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: (514) 555-0123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newWorker.email || ''}
                        onChange={(e) => setNewWorker(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: jean.tremblay@company.com"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expérience
                    </label>
                    <textarea
                      value={newWorker.experience || ''}
                      onChange={(e) => setNewWorker(prev => ({ ...prev, experience: e.target.value }))}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 5 ans d'expérience en soudage..."
                    />
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <button
                      onClick={addWorker}
                      disabled={!newWorker.name || !newWorker.position}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowAddWorker(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Workers List */}
            <div className="space-y-4">
              {finalizationData.workers.map((worker, index) => (
                <div key={worker.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Travailleur {index + 1}: {worker.name}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {worker.position} - {worker.company}
                        </p>
                        {worker.employeeId && (
                          <p className="text-xs text-gray-400">#{worker.employeeId}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getWorkerStatusColor(worker)}`}>
                        {getWorkerStatusText(worker)}
                      </span>
                      <button
                        onClick={() => removeWorker(worker.id)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Consent Section */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`consent-${worker.id}`}
                        checked={worker.hasConsented}
                        onChange={(e) => updateWorkerConsent(worker.id, e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={`consent-${worker.id}`} className="text-sm font-medium text-white cursor-pointer">
                          Je consens avoir lu l'AST
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                          Je consens avoir lu l'AST et accepte de suivre toutes les procédures de sécurité
                        </p>
                        
                        {worker.hasConsented && worker.consentDate && worker.consentTime && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4 text-green-400" />
                                <span className="text-green-300">
                                  Date: {worker.consentDate}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-green-400" />
                                <span className="text-green-300">
                                  Heure: {worker.consentTime}
                                </span>
                              </div>
                            </div>
                            {worker.signature && (
                              <div className="mt-2 flex items-center space-x-1">
                                <PenTool className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-300 font-mono">
                                  {worker.signature}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {finalizationData.workers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Aucun travailleur ajouté</p>
              </div>
            )}

            {/* Consent Summary */}
            {totalWorkers > 0 && (
              <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Résumé des Consentements</h4>
                    <p className="text-sm text-gray-300">
                      {consentedWorkers} sur {totalWorkers} travailleurs ont consenti
                    </p>
                  </div>
                  <div className="text-right">
                    {allWorkersConsented ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="font-medium">Tous les travailleurs ont consenti</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-400">
                        <Clock className="w-5 h-5 mr-1" />
                        <span className="font-medium">Consentements en attente</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalWorkers > 0 ? (consentedWorkers / totalWorkers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finalization Tab */}
      {activeTab === 'finalization' && (
        <div className="space-y-6">
          {/* Completion Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              État de Complétion
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">Progression</span>
                <span className="text-sm font-medium text-gray-200">{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(finalizationData.completionStatus).map(([section, completed]) => (
                <div key={section} className={`p-3 rounded-lg border ${completed ? 'border-green-200/30 bg-green-500/20' : 'border-yellow-200/30 bg-yellow-500/20'}`}>
                  <div className="flex items-center space-x-2">
                    {completed ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className={`text-sm font-medium ${completed ? 'text-green-300' : 'text-yellow-300'}`}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {completionPercentage === 100 && allWorkersConsented && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-200/30 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-300 font-medium">Toutes les sections et consentements sont complets</span>
              </div>
            )}
          </div>

          {/* Share Link */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Link className="w-5 h-5 text-blue-400 mr-2" />
              Partage
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400"
                />
                <button
                  onClick={copyLinkToClipboard}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              {copySuccess && (
                <div className="text-sm text-green-400 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Lien copié dans le presse-papier
                </div>
              )}

              <button
                onClick={() => {/* Generate QR code */}}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Générer Code QR
              </button>
            </div>
          </div>

          {/* Final Comments */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 text-blue-400 mr-2" />
              Commentaires finaux
            </h3>
            
            <textarea
              value={finalizationData.finalComments}
              onChange={(e) => setFinalizationData(prev => ({ ...prev, finalComments: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400"
              placeholder="Ajoutez vos commentaires finaux sur cette AST..."
            />
          </div>

          {/* Final Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={publishAST}
                disabled={!isReadyToPublish || isPublishing}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isPublishing ? (
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Award className="w-5 h-5 mr-2" />
                )}
                {isPublishing ? 'Publication...' : 'Finaliser l\'AST'}
              </button>
              
              <button 
                onClick={generateDocument}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              >
                {isGenerating ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Génération...' : 'Télécharger PDF'}
              </button>
              
              <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Sauvegarder
              </button>
            </div>

            {!isReadyToPublish && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-200/30 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-300 text-sm">
                  {!allWorkersConsented 
                    ? 'Tous les travailleurs doivent consentir avant la finalisation.'
                    : 'Complétez toutes les sections pour finaliser l\'AST.'
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
