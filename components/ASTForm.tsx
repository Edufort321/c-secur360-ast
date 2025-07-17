'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand
} from 'lucide-react';

// Import des composants Steps
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Permits from './steps/Step4Permits';
import Step5Validation from './steps/Step5Validation';
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
  
  // Étapes de l'AST (6 steps)
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

// =================== INTERFACE VALIDATION ===================
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

// =================== INTERFACES FINALIZATION ===================
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

// =================== HOOK DÉTECTION MOBILE ===================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
// =================== FONCTIONS MOBILE HELPERS CORRIGÉES ===================
  const getCompletionPercentage = (): number => {
    const completedSteps = getCurrentCompletedSteps();
    return Math.round((completedSteps / 6) * 100);
  };

  const getCurrentCompletedSteps = (): number => {
    let completed = 0;
    
    // Step 1: Informations projet
    if (astData.projectInfo?.client && astData.projectInfo?.workDescription) {
      completed++;
    }
    
    // Step 2: Équipements
    if (astData.equipment?.selected?.length > 0) {
      completed++;
    }
    
    // Step 3: Dangers
    if (astData.hazards?.selected?.length > 0) {
      completed++;
    }
    
    // Step 4: Permis
    if (astData.permits?.permits?.length > 0) {
      completed++;
    }
    
    // Step 5: Validation
    if (astData.validation?.reviewers?.length > 0) {
      completed++;
    }
    
    // Step 6: Finalisation
    if (currentStep >= 6) {
      completed++;
    }
    
    return completed;
  };

  // =================== FONCTION CORRIGÉE - RETOURNE TOUJOURS BOOLEAN ===================
  const canNavigateToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        // Vérification avec conversion explicite en boolean
        return Boolean(astData.projectInfo?.client && astData.projectInfo?.workDescription);
      case 2:
        // Vérification avec conversion explicite en boolean
        return Boolean(astData.equipment?.selected?.length && astData.equipment.selected.length > 0);
      case 3:
        // Vérification avec conversion explicite en boolean
        return Boolean(astData.hazards?.selected?.length && astData.hazards.selected.length > 0);
      case 4:
        return true; // Permis optionnels
      case 5:
        return true; // Validation optionnelle
      case 6:
        return false; // Dernier step
      default:
        return false;
    }
  };

  // =================== NAVIGATION MOBILE ===================
  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleNext = () => {
    if (canNavigateToNext() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };
// =================== CONFIGURATION STEPS MOBILE OPTIMIZED ===================
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
        padding: isMobile ? '6px 12px' : '8px 16px',
        background: `${config.color}20`,
        border: `1px solid ${config.color}40`,
        borderRadius: '20px',
        color: config.color,
        fontSize: isMobile ? '12px' : '14px',
        fontWeight: '500'
      }}>
        <Icon size={isMobile ? 14 : 16} />
        {config.text}
      </div>
    );
  };

  // =================== COMPOSANTS HEADER MOBILE ===================
  const MobileHeader = () => (
    <header style={{
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(0, 0, 0, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%'
      }}>
        {/* Logo mobile */}
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #000 0%, #1e293b 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src="/c-secur360-logo.png" 
            alt="C-Secur360"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <span style={{ 
            display: 'none',
            color: '#f59e0b', 
            fontSize: '16px', 
            fontWeight: 'bold' 
          }}>
            C🛡️
          </span>
        </div>
        
        {/* Titre mobile */}
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '700',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🛡️ C-Secur360
          </h1>
          <div style={{
            color: '#94a3b8',
            fontSize: '12px',
            margin: '2px 0 0 0',
            fontWeight: '400'
          }}>
            AST #{astData.astNumber.slice(-6)} • {tenant}
          </div>
        </div>
        
        {/* Status mobile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '6px 10px',
          borderRadius: '16px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{
            color: '#22c55e',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Actif
          </span>
        </div>
      </div>
    </header>
  );

  // =================== NAVIGATION STEPS MOBILE ===================
  const MobileStepsNavigation = () => (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
    }}>
      {/* Grid des steps */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              background: currentStep === step.id 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(30, 41, 59, 0.6)',
              border: currentStep === step.id 
                ? '1px solid #3b82f6' 
                : '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: '12px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: currentStep === step.id ? 'translateY(-2px)' : 'none',
              boxShadow: currentStep === step.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onClick={() => handleStepClick(step.id)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 6px',
              background: currentStep === step.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStep === step.id ? '#3b82f6' : '#60a5fa',
              fontSize: '14px'
            }}>
              {getCurrentCompletedSteps() > step.id - 1 ? '✓' : 
               currentStep === step.id ? <step.icon size={16} /> : 
               <step.icon size={14} />}
            </div>
            <div style={{
              color: currentStep === step.id ? '#ffffff' : '#e2e8f0',
              fontSize: '11px',
              fontWeight: '600',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {step.title}
            </div>
          </div>
        ))}
      </div>
      
      {/* Barre de progression */}
      <div style={{ marginTop: '12px' }}>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            borderRadius: '3px',
            transition: 'width 0.5s ease',
            width: `${getCompletionPercentage()}%`,
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'progressShine 2s ease-in-out infinite'
            }} />
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          marginTop: '6px',
          fontWeight: '500'
        }}>
          Étape {currentStep}/6 • {Math.round(getCompletionPercentage())}% complété
        </div>
      </div>
    </div>
  );

  // =================== NAVIGATION MOBILE FIXE ===================
  const MobileNavigation = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(100, 116, 139, 0.3)',
      padding: '16px 20px',
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            background: currentStep === 1 ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.2)',
            color: currentStep === 1 ? '#94a3b8' : '#94a3b8',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          <ArrowLeft size={16} />
          Précédent
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentStep === 6 || !canNavigateToNext()}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            cursor: (currentStep === 6 || !canNavigateToNext()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            background: (currentStep === 6 || !canNavigateToNext()) 
              ? 'rgba(100, 116, 139, 0.3)' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#ffffff',
            opacity: (currentStep === 6 || !canNavigateToNext()) ? 0.5 : 1
          }}
        >
          {currentStep === 6 ? 'Terminé ✓' : 'Suivant'}
          {currentStep !== 6 && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
// =================== RENDU PRINCIPAL ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      {/* =================== CSS MOBILE OPTIMISÉ =================== */}
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
        
        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
        
        /* =================== MOBILE RESPONSIVE =================== */
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
          
          .desktop-only {
            display: none !important;
          }
          
          /* Ajuster padding pour navigation mobile fixe */
          .step-content-mobile {
            padding-bottom: 100px !important;
          }
          
          /* Optimisation des formulaires pour mobile */
          .premium-input,
          .premium-select,
          .premium-textarea {
            font-size: 16px !important; /* Empêche le zoom sur iOS */
            padding: 14px 16px !important;
            border-radius: 8px !important;
          }
          
          /* Optimisation des boutons pour touch */
          .btn-primary,
          .premium-button {
            min-height: 48px !important;
            font-size: 16px !important;
            padding: 14px 20px !important;
            border-radius: 12px !important;
          }
          
          /* Grilles responsive */
          .two-column,
          .premium-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          /* Sections form mobile */
          .form-section {
            margin: 0 0 16px 0 !important;
            border-radius: 16px !important;
            padding: 16px !important;
          }
          
          /* Typography mobile */
          .section-title {
            font-size: 16px !important;
          }
          
          .finalization-title {
            font-size: 20px !important;
          }
          
          .ast-number-value {
            font-size: 18px !important;
            word-break: break-all !important;
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
          
          .mobile-steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 360px) {
          .mobile-steps-grid {
            grid-template-columns: 1fr !important;
          }
          
          .form-section {
            padding: 12px !important;
          }
        }
        
        /* Landscape mobile optimizations */
        @media (max-height: 500px) and (orientation: landscape) {
          .mobile-header {
            padding: 8px 16px !important;
          }
          
          .mobile-steps-navigation {
            padding: 8px 16px !important;
          }
          
          .step-content-mobile {
            padding: 12px 16px !important;
            min-height: calc(100vh - 140px) !important;
          }
          
          .mobile-navigation {
            padding: 8px 16px !important;
          }
        }
        
        /* Safe area pour notch */
        @supports (padding: max(0px)) {
          .mobile-header {
            padding-top: max(16px, env(safe-area-inset-top)) !important;
            padding-left: max(20px, env(safe-area-inset-left)) !important;
            padding-right: max(20px, env(safe-area-inset-right)) !important;
          }
          
          .mobile-navigation {
            padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
            padding-left: max(20px, env(safe-area-inset-left)) !important;
            padding-right: max(20px, env(safe-area-inset-right)) !important;
          }
        }
        
        /* Masquer éléments desktop sur mobile */
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>

      {/* =================== HEADER CONDITIONNEL =================== */}
      {isMobile ? (
        <MobileHeader />
      ) : (
        /* HEADER DESKTOP */
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
            
            {/* Logo Premium Desktop */}
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
                
                {/* Effets animés */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
                  animation: 'shine 2.5s ease-in-out infinite'
                }} />
                
                <div style={{
                  position: 'absolute',
                  inset: '-10px',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '40px',
                  animation: 'pulse 3s ease-in-out infinite'
                }} />
              </div>
              
              {/* Titre Desktop */}
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

            {/* Actions Desktop */}
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

              {/* Indicateur en ligne */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isOnline ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#ef4444" />}
                <span style={{ fontSize: '12px', color: isOnline ? '#10b981' : '#ef4444' }}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>

              {/* Actions superviseur */}
              {(userRole === 'supervisor' || userRole === 'manager') && (
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
              )}
            </div>
          </div>
        </header>
      )}

      {/* =================== NAVIGATION STEPS CONDITIONNELLE =================== */}
      {isMobile ? (
        <MobileStepsNavigation />
      ) : (
        /* NAVIGATION DESKTOP */
        <div className="glass-effect slide-in desktop-only" style={{ 
          padding: '24px', 
          marginBottom: '24px',
          maxWidth: '1200px',
          margin: '20px auto 24px'
        }}>
          
          {/* Barre de progression Desktop */}
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

          {/* Navigation steps Desktop */}
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
      )}

      {/* =================== CONTENU PRINCIPAL =================== */}
      <main style={{ 
        padding: isMobile ? '0' : '20px 16px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        paddingBottom: isMobile ? '100px' : '20px'
      }}>
        
        {/* Contenu de l'étape */}
        <div className={`glass-effect slide-in ${isMobile ? 'mobile-content' : ''}`} style={{ 
          padding: isMobile ? '20px 16px' : '32px 24px', 
          marginBottom: isMobile ? '16px' : '24px',
          borderRadius: isMobile ? '16px' : '20px',
          margin: isMobile ? '16px' : '0 auto 24px'
        }}>
          
          {!isMobile && (
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
          )}

          {/* =================== CONTENU SPÉCIFIQUE À CHAQUE ÉTAPE =================== */}
          <div style={{ minHeight: isMobile ? '300px' : '400px' }}>
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

            {/* ÉTAPE 5: Validation Équipe */}
            {currentStep === 5 && (
              <Step5Validation
                formData={astData}
                onDataChange={handleStep5DataChange}
                language={language}
                tenant={tenant}
              />
            )}

            {/* ÉTAPE 6: Finalisation */}
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
      </main>

      {/* =================== NAVIGATION FOOTER CONDITIONNELLE =================== */}
      {isMobile ? (
        <MobileNavigation />
      ) : (
        /* Navigation footer Desktop */
        <div className="glass-effect desktop-only" style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          bottom: '16px',
          flexWrap: 'wrap',
          gap: '16px',
          maxWidth: '1200px',
          margin: '0 auto'
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
      )}
    </div>
  );
}
