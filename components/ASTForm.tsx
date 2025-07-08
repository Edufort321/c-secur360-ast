'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand
} from 'lucide-react';

// Import des composants Steps - CORRECTION STEP 5
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Permits from './steps/Step4Permits';
import Step5Validation from './steps/Step5Validation';  // ← IMPORT RÉEL AU LIEU DU PLACEHOLDER
import Step6Finalization from './steps/Step6Finalization';

// =================== INTERFACES ENTERPRISE ===================
interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
}

interface ASTData {
  // Métadonnées
  id: string;
  astNumber: string;
  tenant: string;
  status: 'draft' | 'pending_verification' | 'approved' | 'auto_approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  verificationDeadline?: string;
  
  // Étapes de l'AST (6 steps maintenant)
  projectInfo: ProjectInfo;
  equipment: EquipmentData;
  hazards: HazardData;
  permits: PermitData;
  validation: ValidationData;
  finalization: FinalizationData;
  
  // Workflow
  signatures: Signature[];
  approvals: Approval[];
  notifications: NotificationData[];
}

interface ProjectInfo {
  // Client et localisation
  client: string;
  clientPhone?: string;
  clientRepresentative?: string;
  clientRepresentativePhone?: string;
  workLocation: string;
  gpsCoordinates?: string;
  industry: string;
  
  // Projet
  projectNumber: string;
  astClientNumber?: string;
  date: string;
  time: string;
  workDescription: string;
  workerCount: number;
  estimatedDuration?: string;
  
  // Contacts d'urgence
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Verrouillage/Cadenassage
  lockoutPoints?: LockoutPoint[];
  lockoutPhotos?: LockoutPhoto[];
}

interface LockoutPoint {
  id: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'chemical' | 'thermal' | 'gravity';
  equipmentName: string;
  location: string;
  lockType: string;
  tagNumber: string;
  isLocked: boolean;
  verifiedBy: string;
  verificationTime: string;
  photos: string[];
  notes: string;
  completedProcedures: number[];
}

interface LockoutPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before_lockout' | 'during_lockout' | 'lockout_device' | 'client_form' | 'verification';
  timestamp: string;
  lockoutPointId?: string;
}

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

// =================== INTERFACE VALIDATION CORRIGÉE ===================
interface ValidationData {
  // Compatible avec Step5Validation
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
  
  // Données étendues pour entreprise
  teamMembers?: TeamMember[];
  discussionPoints?: DiscussionPoint[];
  meetingMinutes?: MeetingMinutes;
  approvals?: TeamApproval[];
  concerns?: string[];
  improvements?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  experience?: string;
  certifications?: string[];
  phoneNumber?: string;
  hasParticipated?: boolean;
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
// =================== INTERFACES FINALIZATION ===================
interface FinalizationData {
  // Données fusionnées de TeamShare + Finalization
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

interface Signature {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureData: string;
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
}

interface Approval {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  approved: boolean;
  comments?: string;
  timestamp: string;
  conditions?: string[];
}

interface NotificationData {
  id: string;
  recipientId: string;
  recipientName: string;
  type: 'signature_request' | 'approval_request' | 'status_change' | 'reminder';
  message: string;
  sent: boolean;
  sentAt?: string;
  readAt?: string;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function ASTForm({ tenant, language = 'fr', userId, userRole = 'worker' }: ASTFormProps) {
  // =================== ÉTAT PRINCIPAL ===================
  const [astData, setAstData] = useState<ASTData>({
    id: '',
    astNumber: '',
    tenant,
    status: 'draft',
    createdBy: userId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectInfo: {} as ProjectInfo,
    equipment: {
      list: [],
      selected: [],
      totalCost: 0,
      inspectionStatus: {
        total: 0,
        verified: 0,
        available: 0,
        verificationRate: 0,
        availabilityRate: 0
      }
    },
    hazards: {
      list: [],
      selected: [],
      stats: {
        totalHazards: 0,
        categories: {}
      }
    },
    permits: {
      permits: [],
      authorities: [],
      generalRequirements: [],
      timeline: [],
      notifications: [],
      regulatory: {
        rsst: false,
        cnesst: false,
        municipalPermits: [],
        environmentalConsiderations: [],
        specialConditions: []
      }
    },
    // =================== VALIDATION CORRIGÉE ===================
    validation: {
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
      // Données étendues optionnelles
      teamMembers: [],
      discussionPoints: [],
      meetingMinutes: {} as MeetingMinutes,
      approvals: [],
      concerns: [],
      improvements: []
    },
    finalization: {
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
          subject: '',
          message: ''
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
        projectInfo: false,
        equipment: false,
        hazards: false,
        permits: false,
        validation: false
      },
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        lastModified: new Date().toISOString()
      }
    },
    signatures: [],
    approvals: [],
    notifications: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copied, setCopied] = useState(false);

  // =================== GÉNÉRATION NUMÉRO AST ===================
  const generateASTNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `AST-${year}${month}${day}-${random}`;
  }, []);

  // =================== INITIALISATION ===================
  useEffect(() => {
    const astNumber = generateASTNumber();
    setAstData(prev => ({
      ...prev,
      id: astNumber,
      astNumber
    }));

    // Détection en ligne/hors ligne
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [generateASTNumber]);

  // =================== GESTION DES DONNÉES ===================
  const updateASTData = useCallback((section: keyof ASTData, data: any) => {
    setAstData(prev => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString()
    }));
    setHasUnsavedChanges(true);
  }, []);

  // =================== HANDLERS POUR CHAQUE STEP ===================
  const handleStep1DataChange = useCallback((section: string, data: any) => {
    if (section === 'projectInfo') {
      updateASTData('projectInfo', data);
    } else if (section === 'astNumber') {
      setAstData(prev => ({
        ...prev,
        astNumber: data,
        updatedAt: new Date().toISOString()
      }));
      setHasUnsavedChanges(true);
    }
  }, [updateASTData]);

  const handleStep2DataChange = useCallback((section: string, data: any) => {
    if (section === 'equipment') {
      updateASTData('equipment', data);
    }
  }, [updateASTData]);

  const handleStep3DataChange = useCallback((section: string, data: any) => {
    if (section === 'hazards') {
      updateASTData('hazards', data);
    }
  }, [updateASTData]);

  const handleStep4DataChange = useCallback((section: string, data: any) => {
    if (section === 'permits') {
      updateASTData('permits', data);
    }
  }, [updateASTData]);

  // =================== HANDLER STEP 5 CORRIGÉ ===================
  const handleStep5DataChange = useCallback((section: string, data: ValidationData) => {
    if (section === 'validation') {
      updateASTData('validation', data);
    }
  }, [updateASTData]);

  const handleStep6DataChange = useCallback((section: string, data: any) => {
    if (section === 'finalization') {
      updateASTData('finalization', data);
    }
  }, [updateASTData]);

  // =================== SAUVEGARDE AUTOMATIQUE ===================
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const saveTimer = setTimeout(async () => {
      if (isOnline) {
        try {
          setIsLoading(true);
          // TODO: Sauvegarder vers Supabase
          console.log('Sauvegarde automatique:', astData);
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Sauvegarde locale si hors ligne
        localStorage.setItem(`ast_draft_${astData.id}`, JSON.stringify(astData));
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [astData, hasUnsavedChanges, isOnline]);

  // =================== COPIE NUMÉRO AST ===================
  const handleCopyAST = useCallback(() => {
    navigator.clipboard.writeText(astData.astNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [astData.astNumber]);

  // =================== WORKFLOW MANAGEMENT ===================
  const changeStatus = useCallback((newStatus: ASTData['status']) => {
    setAstData(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      verificationDeadline: newStatus === 'pending_verification' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h deadline
        : prev.verificationDeadline
    }));
  }, []);

  // =================== CONFIGURATION STEPS (6 STEPS) ===================
  const steps = [
    { 
      id: 1, 
      title: 'Informations Projet', 
      subtitle: 'Identification & Verrouillage',
      icon: FileText, 
      color: '#3b82f6',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 2, 
      title: 'Équipements', 
      subtitle: 'EPI et équipements sécurité',
      icon: Shield, 
      color: '#f59e0b',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 3, 
      title: 'Dangers & Contrôles', 
      subtitle: 'Risques + Moyens contrôle',
      icon: AlertTriangle, 
      color: '#ef4444',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 4, 
      title: 'Permis & Autorisations', 
      subtitle: 'Conformité réglementaire',
      icon: FileText, 
      color: '#10b981',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 5, 
      title: 'Validation Équipe', 
      subtitle: 'Signatures & Approbations',
      icon: Users, 
      color: '#06b6d4',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 6, 
      title: 'Finalisation', 
      subtitle: 'Consentement & Archive',
      icon: CheckCircle, 
      color: '#059669',
      required: true,
      mobileOptimized: true
    }
  ];
  // =================== STATUS BADGE ===================
  const getStatusBadge = () => {
    const statusConfig = {
      'draft': { color: '#64748b', text: 'Brouillon', icon: Edit },
      'pending_verification': { color: '#f59e0b', text: 'En attente', icon: Clock },
      'approved': { color: '#10b981', text: 'Approuvé', icon: CheckCircle },
      'auto_approved': { color: '#059669', text: 'Auto-approuvé', icon: CheckCircle },
      'rejected': { color: '#ef4444', text: 'Rejeté', icon: AlertTriangle }
    };

    const config = statusConfig[astData.status];
    const Icon = config.icon;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        borderRadius: '20px',
        color: config.color,
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <Icon size={16} />
        {config.text}
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      {/* =================== STYLES CSS =================== */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes shine {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15);
          }
          50% { 
            box-shadow: 0 0 70px rgba(245, 158, 11, 0.8), inset 0 0 40px rgba(245, 158, 11, 0.25);
          }
        }
        
        @keyframes logoGlow {
          0%, 100% { 
            filter: brightness(1.2) contrast(1.1) drop-shadow(0 0 15px rgba(245, 158, 11, 0.4));
          }
          50% { 
            filter: brightness(1.5) contrast(1.3) drop-shadow(0 0 25px rgba(245, 158, 11, 0.7));
          }
        }
        
        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-animation { animation: pulse 4s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.5s ease-out; }
        .slide-in-right { animation: slideIn 0.6s ease-out; }
        .glow-effect { animation: glow 4s ease-in-out infinite; }
        .logo-glow { animation: logoGlow 3s ease-in-out infinite; }
        
        .shine-effect {
          background: linear-gradient(90deg, transparent 30%, rgba(245, 158, 11, 0.3) 50%, transparent 70%);
          background-size: 200px 100%;
          animation: shine 2.5s infinite;
        }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 20px;
        }
        
        .mobile-touch {
          min-height: 44px;
          padding: 12px 16px;
          font-size: 16px;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-premium {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 16px;
          padding: 14px 28px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }
        
        .btn-premium:hover {
          transform: translateY(-2px);
          background-position: 100% 0;
          box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .step-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          
          .glass-effect {
            padding: 20px !important;
            margin: 12px !important;
            border-radius: 16px !important;
          }
          
          .mobile-touch {
            min-height: 48px !important;
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .step-grid {
            grid-template-columns: 1fr !important;
          }
          
          .glass-effect {
            padding: 16px !important;
            margin: 8px !important;
          }
        }
      `}</style>

      {/* =================== HEADER PREMIUM IDENTIQUE DASHBOARD =================== */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(0, 0, 0, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 50px rgba(251, 191, 36, 0.1)',
        padding: '24px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '20px' 
        }}>
          
          {/* Logo Premium Ultra Grossi - IDENTIQUE DASHBOARD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div 
              className="float-animation glow-effect"
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                padding: '32px',
                borderRadius: '32px',
                border: '4px solid #f59e0b',
                boxShadow: '0 0 50px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: '96px',
                height: '96px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <img 
                  src="/c-secur360-logo.png" 
                  alt="C-Secur360"
                  className="logo-glow"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span style={{ 
                  display: 'none',
                  color: '#f59e0b', 
                  fontSize: '48px', 
                  fontWeight: '900' 
                }}>
                  C🛡️
                </span>
              </div>
              
              {/* Effet brillance animé renforcé */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
                animation: 'shine 2.5s ease-in-out infinite'
              }} />
              
              {/* Effet de pulse en arrière-plan */}
              <div style={{
                position: 'absolute',
                inset: '-10px',
                border: '2px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '40px',
                animation: 'pulse 3s ease-in-out infinite'
              }} />
            </div>
            
            {/* Titre et status - MISE À JOUR */}
            <div className="slide-in-right">
              <h1 className="text-gradient" style={{
                fontSize: '40px',
                margin: 0,
                lineHeight: 1.2,
                fontWeight: '900',
                letterSpacing: '-0.025em'
              }}>
                🛡️ C-Secur360
              </h1>
              <p style={{
                color: 'rgba(251, 191, 36, 0.9)',
                fontSize: '20px',
                margin: 0,
                fontWeight: '600'
              }}>
                Analyse Sécuritaire de Travail • {tenant}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '12px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#22c55e'
                }} className="pulse-animation" />
                <span style={{
                  color: '#22c55e',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Système opérationnel
                </span>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#94a3b8', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  AST • Étape {currentStep} sur {steps.length}
                </p>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Numéro AST et actions - MISE À JOUR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            
            {/* Numéro AST */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield size={16} color="#3b82f6" />
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                  NUMÉRO AST
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {astData.astNumber}
                  <button
                    onClick={handleCopyAST}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copied ? '#10b981' : '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      borderRadius: '4px',
                      transition: 'color 0.2s'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Indicateur en ligne/hors ligne */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isOnline ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#ef4444" />}
              <span style={{ fontSize: '12px', color: isOnline ? '#10b981' : '#ef4444' }}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            {/* Actions rapides */}
            {userRole === 'supervisor' || userRole === 'manager' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => changeStatus('pending_verification')}
                  disabled={astData.status !== 'draft'}
                  className="btn-premium"
                  style={{
                    opacity: astData.status === 'draft' ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}
                >
                  <Bell size={12} />
                  Soumettre
                </button>
                
                <button
                  onClick={() => changeStatus('approved')}
                  disabled={astData.status !== 'pending_verification'}
                  className="btn-premium"
                  style={{
                    opacity: astData.status === 'pending_verification' ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)'
                  }}
                >
                  <CheckCircle size={12} />
                  Approuver
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* =================== CONTENU PRINCIPAL =================== */}
      <main style={{ padding: '20px 16px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Progress bar et navigation steps */}
        <div className="glass-effect slide-in" style={{ padding: '24px', marginBottom: '24px' }}>
          
          {/* Barre de progression */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Progression AST
              </h2>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                {Math.round((currentStep / steps.length) * 100)}% complété
              </span>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '12px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: `linear-gradient(90deg, ${steps[0]?.color || '#3b82f6'}, ${steps[Math.min(currentStep - 1, steps.length - 1)]?.color || '#10b981'})`,
                height: '100%',
                width: `${(currentStep / steps.length) * 100}%`,
                transition: 'width 0.5s ease',
                borderRadius: '12px'
              }} />
            </div>
          </div>

          {/* Navigation steps - Mobile optimized */}
          <div className="step-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px'
          }}>
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                style={{
                  background: currentStep === step.id 
                    ? `linear-gradient(135deg, ${step.color}25, ${step.color}15)`
                    : 'rgba(30, 41, 59, 0.5)',
                  border: currentStep === step.id 
                    ? `2px solid ${step.color}` 
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                className="mobile-touch"
              >
                {step.required && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    background: '#ef4444',
                    borderRadius: '50%'
                  }} />
                )}
                
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: currentStep === step.id ? step.color : 'rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <step.icon size={20} color={currentStep === step.id ? '#ffffff' : '#94a3b8'} />
                </div>
                
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: currentStep === step.id ? '#ffffff' : '#94a3b8',
                  margin: '0 0 4px',
                  lineHeight: '1.2'
                }}>
                  {step.title}
                </h3>
                
                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.3'
                }}>
                  {step.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="glass-effect slide-in" style={{ padding: '32px 24px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#ffffff',
              marginBottom: '8px',
              background: `linear-gradient(135deg, ${steps[currentStep - 1]?.color}, ${steps[currentStep - 1]?.color}CC)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {steps[currentStep - 1]?.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
              {steps[currentStep - 1]?.subtitle}
            </p>
          </div>

          {/* =================== CONTENU SPÉCIFIQUE À CHAQUE ÉTAPE =================== */}
          <div style={{ minHeight: '400px' }}>
            {/* ÉTAPE 1: Informations Projet + Verrouillage */}
            {currentStep === 1 && (
              <Step1ProjectInfo
                formData={astData}
                onDataChange={handleStep1DataChange}
                language={language}
                tenant={tenant}
                errors={{}}
              />
            )}

            {/* ÉTAPE 2: Équipements de Protection */}
            {currentStep === 2 && (
              <Step2Equipment
                formData={astData}
                onDataChange={handleStep2DataChange}
                language={language}
                tenant={tenant}
                errors={{}}
              />
            )}

            {/* ÉTAPE 3: Dangers & Risques + Moyens de Contrôle */}
            {currentStep === 3 && (
              <Step3Hazards
                formData={astData}
                onDataChange={handleStep3DataChange}
                language={language}
                tenant={tenant}
                errors={{}}
              />
            )}

            {/* ÉTAPE 4: Permis & Autorisations */}
            {currentStep === 4 && (
              <Step4Permits
                formData={astData}
                onDataChange={handleStep4DataChange}
                language={language}
                tenant={tenant}
                errors={{}}
              />
            )}

            {/* =================== ÉTAPE 5: VALIDATION ÉQUIPE CORRIGÉE =================== */}
            {currentStep === 5 && (
              <Step5Validation
                formData={astData}
                onDataChange={handleStep5DataChange}
                language={language}
                tenant={tenant}
              />
            )}

            {/* ÉTAPE 6: Finalisation (Consentement Travailleurs + Archive) */}
            {currentStep === 6 && (
              <Step6Finalization
                formData={astData}
                onDataChange={handleStep6DataChange}
                language={language}
                tenant={tenant}
              />
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="glass-effect" style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          bottom: '16px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="mobile-touch"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 20px',
              background: currentStep === 1 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(59, 130, 246, 0.2)',
              border: currentStep === 1 ? '1px solid rgba(75, 85, 99, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              color: currentStep === 1 ? '#9ca3af' : '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={18} />
            Précédent
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: '#94a3b8',
            fontSize: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={14} />
              <span>Sauvegarde auto</span>
            </div>
            <div style={{
              width: '6px',
              height: '6px',
              background: hasUnsavedChanges ? '#f59e0b' : '#10b981',
              borderRadius: '50%',
              animation: hasUnsavedChanges ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ fontSize: '12px', color: hasUnsavedChanges ? '#f59e0b' : '#10b981' }}>
              {hasUnsavedChanges ? 'Modification...' : 'Sauvegardé'}
            </span>
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="mobile-touch"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 20px',
              background: currentStep === steps.length 
                ? 'rgba(75, 85, 99, 0.3)' 
                : `linear-gradient(135deg, ${steps[currentStep]?.color || '#10b981'}, ${steps[currentStep]?.color || '#059669'}CC)`,
              border: `1px solid ${steps[currentStep]?.color || '#10b981'}80`,
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: currentStep === steps.length ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Suivant
            <ArrowRight size={18} />
          </button>
        </div>

      </main>
    </div>
  );
}
