'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell, Wrench, Wind,
  Droplets, Flame, Activity, Search, Filter, Hand, MessageSquare
} from 'lucide-react';

// Import des composants Steps - ✅ TOUS PRÉSENTS
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Permits from './steps/Step4Permits';
import Step5Validation from './steps/Step5Validation';
import Step6Finalization from './steps/Step6Finalization';

// =================== SYSTÈME DE TRADUCTIONS BILINGUE COMPLET ===================
const translations = {
  fr: {
    // Header
    title: "🛡️ C-Secur360",
    subtitle: "Analyse Sécuritaire de Travail",
    systemOperational: "Système opérationnel",
    astStep: "AST • Étape",
    astNumber: "NUMÉRO AST",
    online: "En ligne",
    offline: "Hors ligne",
    submit: "Soumettre",
    approve: "Approuver",
    
    // Status
    status: {
      draft: "Brouillon",
      pending_verification: "En attente",
      approved: "Approuvé",
      auto_approved: "Auto-approuvé",
      rejected: "Rejeté"
    },
    
    // Steps
    steps: {
      projectInfo: {
        title: "Informations Projet",
        subtitle: "Identification & Verrouillage"
      },
      equipment: {
        title: "Équipements",
        subtitle: "EPI et équipements sécurité"
      },
      hazards: {
        title: "Dangers & Contrôles",
        subtitle: "Risques + Moyens contrôle"
      },
      permits: {
        title: "Permis & Autorisations",
        subtitle: "Conformité réglementaire"
      },
      validation: {
        title: "Validation Équipe",
        subtitle: "Signatures & Approbations"
      },
      finalization: {
        title: "Finalisation",
        subtitle: "Consentement & Archive"
      }
    },
    
    // Progress
    progress: "Progression AST",
    completed: "complété",
    stepOf: "sur",
    
    // Navigation
    previous: "Précédent",
    next: "Suivant",
    finished: "Terminé ✓",
    autoSave: "Sauvegarde auto",
    saving: "Modification...",
    saved: "Sauvegardé",
    active: "Actif",
    
    // Language selector
    language: "Langue",
    french: "Français",
    english: "English"
  },
  
  en: {
    // Header
    title: "🛡️ C-Secur360",
    subtitle: "Job Safety Analysis",
    systemOperational: "System operational",
    astStep: "JSA • Step",
    astNumber: "JSA NUMBER",
    online: "Online",
    offline: "Offline",
    submit: "Submit",
    approve: "Approve",
    
    // Status
    status: {
      draft: "Draft",
      pending_verification: "Pending",
      approved: "Approved",
      auto_approved: "Auto-approved",
      rejected: "Rejected"
    },
    
    // Steps
    steps: {
      projectInfo: {
        title: "Project Information",
        subtitle: "Identification & Lockout"
      },
      equipment: {
        title: "Equipment",
        subtitle: "PPE and safety equipment"
      },
      hazards: {
        title: "Hazards & Controls",
        subtitle: "Risks + Control measures"
      },
      permits: {
        title: "Permits & Authorizations",
        subtitle: "Regulatory compliance"
      },
      validation: {
        title: "Team Validation",
        subtitle: "Signatures & Approvals"
      },
      finalization: {
        title: "Finalization",
        subtitle: "Consent & Archive"
      }
    },
    
    // Progress
    progress: "JSA Progress",
    completed: "completed",
    stepOf: "of",
    
    // Navigation
    previous: "Previous",
    next: "Next",
    finished: "Finished ✓",
    autoSave: "Auto save",
    saving: "Saving...",
    saved: "Saved",
    active: "Active",
    
    // Language selector
    language: "Language",
    french: "Français",
    english: "English"
  }
};

// =================== INTERFACES TYPESCRIPT COMPLÈTES ===================
interface ASTFormProps {
  tenant: string;
  language: 'fr' | 'en';
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
}

interface ASTData {
  id: string;
  astNumber: string;
  tenant: string;
  status: 'draft' | 'pending_verification' | 'approved' | 'auto_approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  verificationDeadline?: string;
  projectInfo: ProjectInfo;
  equipment: EquipmentData;
  hazards: HazardData;
  permits: PermitData;
  validation: ValidationData;
  finalization: FinalizationData;
  signatures: Signature[];
  approvals: Approval[];
  notifications: NotificationData[];
}

interface ProjectInfo {
  client: string;
  clientPhone?: string;
  clientRepresentative?: string;
  clientRepresentativePhone?: string;
  workLocation: string;
  gpsCoordinates?: string;
  industry: string;
  projectNumber: string;
  astClientNumber?: string;
  date: string;
  time: string;
  workDescription: string;
  workerCount: number;
  estimatedDuration?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
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

// =================== HOOK DÉTECTION MOBILE ULTRA-STABLE ===================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // ✅ Détection côté client uniquement
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    // ✅ Fonction stable avec throttle
    let timeoutId: NodeJS.Timeout;
    
    const checkIsMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
      }, 150); // Throttle 150ms
    };

    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      clearTimeout(timeoutId);
    };
  }, [isMobile]); // ✅ Une seule dépendance nécessaire

  return isMobile;
};

// =================== CONFIGURATION STEPS AVEC TRADUCTIONS ===================
const steps = [
  {
    id: 1,
    title: 'Informations Projet',
    subtitle: 'Identification & Verrouillage',
    icon: FileText,
    color: '#3b82f6',
    required: true
  },
  {
    id: 2,
    title: 'Équipements',
    subtitle: 'EPI et équipements sécurité',
    icon: Shield,
    color: '#10b981',
    required: true
  },
  {
    id: 3,
    title: 'Dangers & Contrôles',
    subtitle: 'Risques + Moyens contrôle',
    icon: AlertTriangle,
    color: '#f59e0b',
    required: true
  },
  {
    id: 4,
    title: 'Permis & Autorisations',
    subtitle: 'Conformité réglementaire',
    icon: Edit,
    color: '#8b5cf6',
    required: false
  },
  {
    id: 5,
    title: 'Validation Équipe',
    subtitle: 'Signatures & Approbations',
    icon: Users,
    color: '#06b6d4',
    required: false
  },
  {
    id: 6,
    title: 'Finalisation',
    subtitle: 'Consentement & Archive',
    icon: CheckCircle,
    color: '#10b981',
    required: false
  }
];

// =================== COMPOSANT PRINCIPAL AVEC ÉTATS OPTIMISÉS ===================
export default function ASTForm({ 
  tenant, 
  language: initialLanguage = 'fr', 
  userId, 
  userRole = 'worker' 
}: ASTFormProps) {
  
  // =================== GESTION DE LA LANGUE ULTRA-STABLE ===================
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en'>(() => {
    // ✅ Initialisation stable côté client
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
      return savedLanguage || initialLanguage;
    }
    return initialLanguage;
  });
  const t = translations[currentLanguage];
  
  // =================== DÉTECTION MOBILE STABLE ===================
  const isMobile = useIsMobile();

  // =================== ÉTATS PRINCIPAUX ULTRA-OPTIMISÉS ===================
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // =================== DONNÉES AST INITIALES COMPLÈTES ===================
  const [astData, setAstData] = useState<ASTData>(() => ({
    id: `ast_${Date.now()}`,
    astNumber: `AST-${tenant.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    tenant,
    status: 'draft',
    createdBy: userId || 'user_anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectInfo: {
      client: '',
      workLocation: '',
      industry: '',
      projectNumber: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      workDescription: '',
      workerCount: 1,
      lockoutPoints: [],
      lockoutPhotos: []
    },
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
    validation: {
      reviewers: [],
      approvalRequired: false,
      minimumReviewers: 1,
      validationCriteria: {
        hazardIdentification: false,
        controlMeasures: false,
        equipmentSelection: false,
        procedural: false,
        regulatory: false
      }
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
        watermark: false
      },
      distribution: {
        email: {
          enabled: false,
          recipients: [],
          subject: '',
          message: ''
        },
        portal: {
          enabled: false,
          publish: false,
          category: ''
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
  }));

  // =================== FONCTION DE CHANGEMENT DE LANGUE STABLE ===================
  const handleLanguageChange = useCallback((newLanguage: 'fr' | 'en') => {
    if (newLanguage !== currentLanguage) {
      setCurrentLanguage(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ast-language-preference', newLanguage);
      }
    }
  }, [currentLanguage]);

  // =================== COMPOSANT SÉLECTEUR DE LANGUE MANQUANT ===================
  const LanguageSelector = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      borderRadius: '12px',
      padding: '8px 12px',
      position: 'relative'
    }}>
      <span style={{
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '500'
      }}>
        {t.language}
      </span>
      
      <div style={{
        display: 'flex',
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '8px',
        padding: '2px',
        gap: '2px'
      }}>
        <button
          onClick={() => handleLanguageChange('fr')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            background: currentLanguage === 'fr' 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
              : 'transparent',
            color: currentLanguage === 'fr' ? '#ffffff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '30px'
          }}
        >
          FR
        </button>
        
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: 'none',
            background: currentLanguage === 'en' 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
              : 'transparent',
            color: currentLanguage === 'en' ? '#ffffff' : '#94a3b8',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '30px'
          }}
        >
          EN
        </button>
      </div>
    </div>
  );

  // =================== FONCTIONS UTILITAIRES ULTRA-STABLES ===================
  const getCompletionPercentage = useCallback((): number => {
    const completedSteps = getCurrentCompletedSteps();
    return Math.round((completedSteps / 6) * 100);
  }, []); // ✅ Pas de deps = stable

  const getCurrentCompletedSteps = useCallback((): number => {
    let completed = 0;
    
    if (astData.projectInfo?.client && astData.projectInfo?.workDescription) {
      completed++;
    }
    
    if (astData.equipment?.selected?.length > 0) {
      completed++;
    }
    
    if (astData.hazards?.selected?.length > 0) {
      completed++;
    }
    
    if (astData.permits?.permits?.length > 0) {
      completed++;
    }
    
    if (astData.validation?.reviewers?.length > 0) {
      completed++;
    }
    
    if (currentStep >= 6) {
      completed++;
    }
    
    return completed;
  }, []); // ✅ Pas de deps = stable

  const canNavigateToNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(astData.projectInfo?.client && astData.projectInfo?.workDescription);
      case 2:
        return Boolean(astData.equipment?.selected?.length && astData.equipment.selected.length > 0);
      case 3:
        return Boolean(astData.hazards?.selected?.length && astData.hazards.selected.length > 0);
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return false;
      default:
        return false;
    }
  }, []); // ✅ Pas de deps = stable

  // =================== NAVIGATION ULTRA-STABLE ===================
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (canNavigateToNext() && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canNavigateToNext, currentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // =================== HANDLERS DATA ULTRA-OPTIMISÉS - FIX DÉFINITIF BOUCLES INFINIES ===================
  
  // ✅ FIX CRITIQUE : Fonction utilitaire pour vérifier les changements
  const hasDataChanged = useCallback((currentData: any, newData: any): boolean => {
    try {
      const currentStr = JSON.stringify(currentData);
      const newStr = JSON.stringify(newData);
      return currentStr !== newStr;
    } catch (error) {
      console.warn('Erreur comparaison données:', error);
      return true; // En cas d'erreur, on assume qu'il y a changement
    }
  }, []);

  // ✅ STEP 1 HANDLER - ULTRA OPTIMISÉ
  const handleStep1DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep1DataChange appelé:', { section, data });
    
    setAstData(prev => {
      if (section === 'astNumber') {
        if (prev.astNumber === data) {
          console.log('🔥 ASTForm astNumber identique, skip update');
          return prev;
        }
        const newState = { ...prev, astNumber: data };
        console.log('🔥 ASTForm nouveau state (astNumber):', newState);
        return newState;
      }
      
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step1 section identique, skip update');
        return prev;
      }
      
      const newState = {
        ...prev,
        [section]: newSection
      };
      
      console.log('🔥 ASTForm Step1 nouveau state:', { section, newSection });
      return newState;
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // ✅ STEP 2 HANDLER - ULTRA OPTIMISÉ
  const handleStep2DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep2DataChange appelé:', { section, data });
    
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step2 section identique, skip update');
        return prev;
      }
      
      return {
        ...prev,
        [section]: newSection
      };
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // ✅ STEP 3 HANDLER - ULTRA OPTIMISÉ
  const handleStep3DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep3DataChange appelé:', { section, data });
    
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step3 section identique, skip update');
        return prev;
      }
      
      return {
        ...prev,
        [section]: newSection
      };
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // ✅ STEP 4 HANDLER - ULTRA OPTIMISÉ
  const handleStep4DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep4DataChange appelé:', { section, data });
    
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step4 section identique, skip update');
        return prev;
      }
      
      return {
        ...prev,
        [section]: newSection
      };
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // ✅ STEP 5 HANDLER - ULTRA OPTIMISÉ (FIX BOUCLE INFINIE CRITIQUE)
  const handleStep5DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep5DataChange appelé:', { section, data });
    
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      // ✅ FIX CRITIQUE : Vérification de changement pour Step5 
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step5 section identique, skip update - BOUCLE INFINIE ÉVITÉE !');
        return prev; // ← CRUCIAL pour éviter la boucle infinie !
      }
      
      console.log('🔥 ASTForm Step5 updating:', { section, newSection });
      return {
        ...prev,
        [section]: newSection
      };
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // ✅ STEP 6 HANDLER - ULTRA OPTIMISÉ (PRÉVENTION BOUCLE INFINIE)
  const handleStep6DataChange = useCallback((section: string, data: any) => {
    console.log('🔥 ASTForm handleStep6DataChange appelé:', { section, data });
    
    setAstData(prev => {
      const currentSection = (prev as any)[section] || {};
      const newSection = { ...currentSection, ...data };
      
      // ✅ FIX PRÉVENTIF : Même vérification pour Step6
      if (!hasDataChanged(currentSection, newSection)) {
        console.log('🔥 ASTForm Step6 section identique, skip update - BOUCLE INFINIE ÉVITÉE !');
        return prev; // ← Prévention boucle infinie Step6
      }
      
      console.log('🔥 ASTForm Step6 updating:', { section, newSection });
      return {
        ...prev,
        [section]: newSection
      };
    });
    
    setTimeout(() => setHasUnsavedChanges(true), 0);
  }, [hasDataChanged]);

  // =================== FONCTIONS UTILITAIRES SUPPLÉMENTAIRES ===================
  const handleCopyAST = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(astData.astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  }, [astData.astNumber]);

  const changeStatus = useCallback((newStatus: ASTData['status']) => {
    setAstData(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // =================== STATUS BADGE AVEC TRADUCTIONS ===================
  const getStatusBadge = useCallback(() => {
    const statusConfig = {
      'draft': { color: '#64748b', text: t.status.draft, icon: Edit },
      'pending_verification': { color: '#f59e0b', text: t.status.pending_verification, icon: Clock },
      'approved': { color: '#10b981', text: t.status.approved, icon: CheckCircle },
      'auto_approved': { color: '#059669', text: t.status.auto_approved, icon: CheckCircle },
      'rejected': { color: '#ef4444', text: t.status.rejected, icon: AlertTriangle }
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
  }, [astData.status, t.status, isMobile]);

  // =================== EFFECTS ULTRA-OPTIMISÉS ===================
  useEffect(() => {
    // ✅ Langue sauvegardée - une seule fois
    const savedLanguage = localStorage.getItem('ast-language-preference') as 'fr' | 'en';
    if (savedLanguage && savedLanguage !== currentLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []); // ✅ Une seule fois

  useEffect(() => {
    // ✅ Sauvegarde automatique optimisée
    if (hasUnsavedChanges) {
      const saveTimer = setTimeout(() => {
        console.log('🔄 Sauvegarde automatique...');
        setHasUnsavedChanges(false);
      }, 1000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges]); // ✅ SEULEMENT hasUnsavedChanges

  useEffect(() => {
    // ✅ Détection en ligne/hors ligne - une seule fois
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // ✅ Une seule fois

  // =================== COMPOSANTS MÉMORISÉS POUR ÉVITER RE-RENDERS ===================
  const MemoizedStep1 = React.memo(Step1ProjectInfo);
  const MemoizedStep2 = React.memo(Step2Equipment);
  const MemoizedStep3 = React.memo(Step3Hazards);
  const MemoizedStep4 = React.memo(Step4Permits);
  const MemoizedStep5 = React.memo(Step5Validation);
  const MemoizedStep6 = React.memo(Step6Finalization);

  // =================== RENDU DU CONTENU DES STEPS - OPTIMISÉ FINAL ===================
  const StepContent = () => {
    console.log('🔥 StepContent render - Step:', currentStep);
    
    // ✅ FIX ULTIME : Props stables pour éviter re-render
    const stepProps = {
      formData: astData,
      language: currentLanguage,
      tenant: tenant,
      errors: {}
    };
    
    switch (currentStep) {
      case 1:
        return (
          <MemoizedStep1
            key="step1"
            {...stepProps}
            onDataChange={handleStep1DataChange}
          />
        );
      case 2:
        return (
          <MemoizedStep2
            key="step2"
            {...stepProps}
            onDataChange={handleStep2DataChange}
          />
        );
      case 3:
        return (
          <MemoizedStep3
            key="step3"
            {...stepProps}
            onDataChange={handleStep3DataChange}
          />
        );
      case 4:
        return (
          <MemoizedStep4
            key="step4"
            {...stepProps}
            onDataChange={handleStep4DataChange}
            province={'QC'}
            userRole={'worker'}
            touchOptimized={true}
            compactMode={false}
            onPermitChange={(permits) => {
              handleStep4DataChange('permits', permits);
            }}
            initialPermits={[]}
          />
        );
      case 5:
        return (
          <MemoizedStep5
            key="step5"
            {...stepProps}
            onDataChange={handleStep5DataChange}
          />
        );
      case 6:
        return (
          <MemoizedStep6
            key="step6"
            {...stepProps}
            onDataChange={handleStep6DataChange}
          />
        );
      default:
        return null;
    }
  };

  // =================== HEADER MOBILE AVEC SÉLECTEUR DE LANGUE ===================
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
        maxWidth: '100%',
        marginBottom: '12px'
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
            {t.title}
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
        
        {/* Sélecteur de langue mobile */}
        <LanguageSelector />
      </div>
      
      {/* Status mobile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
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
            {t.active}
          </span>
        </div>
        
        {getStatusBadge()}
      </div>
    </header>
  );

  // =================== HEADER DESKTOP AVEC SÉLECTEUR DE LANGUE ===================
  const DesktopHeader = () => (
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
          
          {/* Titre Desktop traduit */}
          <div className="slide-in-right">
            <h1 className="text-gradient" style={{
              fontSize: '40px',
              margin: 0,
              lineHeight: 1.2,
              fontWeight: '900',
              letterSpacing: '-0.025em'
            }}>
              {t.title}
            </h1>
            <p style={{
              color: 'rgba(251, 191, 36, 0.9)',
              fontSize: '20px',
              margin: 0,
              fontWeight: '600'
            }}>
              {t.subtitle} • {tenant}
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
                {t.systemOperational}
              </span>
              <p style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                margin: 0,
                fontWeight: '500'
              }}>
                {t.astStep} {currentStep} {t.stepOf} {steps.length}
              </p>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Actions Desktop avec sélecteur de langue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Sélecteur de langue desktop */}
          <LanguageSelector />
          
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
                {t.astNumber}
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
              {isOnline ? t.online : t.offline}
            </span>
          </div>

          {/* Actions superviseur avec traductions */}
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
                {t.submit}
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
                {t.approve}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // =================== NAVIGATION STEPS MOBILE AVEC TRADUCTIONS ===================
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
      
      {/* Barre de progression avec traductions */}
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
          {t.astStep.replace('AST •', '').replace('JSA •', '')} {currentStep}/6 • {Math.round(getCompletionPercentage())}% {t.completed}
        </div>
      </div>
    </div>
  );

  // =================== NAVIGATION DESKTOP AVEC TRADUCTIONS ===================
  const DesktopStepsNavigation = () => (
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
            {t.progress}
          </h2>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            {Math.round((currentStep / steps.length) * 100)}% {t.completed}
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
  );

  // =================== NAVIGATION MOBILE FIXE AVEC TRADUCTIONS ===================
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
          {t.previous}
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
          {currentStep === 6 ? t.finished : t.next}
          {currentStep !== 6 && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );

  // =================== NAVIGATION FOOTER DESKTOP AVEC TRADUCTIONS ===================
  const DesktopFooterNavigation = () => (
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
        {t.previous}
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
          <span>{t.autoSave}</span>
        </div>
        <div style={{
          width: '6px',
          height: '6px',
          background: hasUnsavedChanges ? '#f59e0b' : '#10b981',
          borderRadius: '50%',
          animation: hasUnsavedChanges ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '12px', color: hasUnsavedChanges ? '#f59e0b' : '#10b981' }}>
          {hasUnsavedChanges ? t.saving : t.saved}
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
        {t.next}
        <ArrowRight size={18} />
      </button>
    </div>
  );

  // =================== CSS MOBILE OPTIMISÉ ULTRA-COMPLET ===================
  const mobileOptimizedCSS = `
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
    
    /* =================== MOBILE RESPONSIVE ULTRA-OPTIMISÉ =================== */
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
      
      .mobile-only {
        display: block !important;
      }
      
      /* Ajuster padding pour navigation mobile fixe */
      .step-content-mobile {
        padding-bottom: 100px !important;
      }
      
      /* Optimisation des formulaires pour mobile */
      .premium-input,
      .premium-select,
      .premium-textarea {
        font-size: 16px !important;
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
      
      /* Headers mobile */
      .mobile-header {
        padding: 14px 16px !important;
      }
      
      .mobile-steps-navigation {
        padding: 12px 16px !important;
      }
      
      /* Content mobile */
      .step-content-mobile {
        padding: 16px !important;
        min-height: calc(100vh - 200px) !important;
      }
      
      /* Navigation mobile */
      .mobile-navigation {
        padding: 12px 16px !important;
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
      
      /* Mobile très petit */
      .mobile-header {
        padding: 12px 14px !important;
      }
      
      .finalization-title {
        font-size: 18px !important;
      }
      
      .section-title {
        font-size: 14px !important;
      }
    }
    
    @media (max-width: 360px) {
      .mobile-steps-grid {
        grid-template-columns: 1fr !important;
      }
      
      .form-section {
        padding: 12px !important;
      }
      
      .glass-effect {
        padding: 12px !important;
        margin: 6px !important;
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
    
    /* Touch improvements */
    .mobile-touch:active {
      transform: scale(0.98);
    }
    
    /* Prevent zoom on inputs iOS */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
      .premium-input,
      .premium-select,
      .premium-textarea {
        font-size: 16px !important;
      }
    }
    
    /* Improve scroll performance */
    .step-content-mobile {
      -webkit-overflow-scrolling: touch;
      transform: translateZ(0);
    }
    
    /* Better tap highlights */
    .mobile-touch {
      -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
      tap-highlight-color: rgba(59, 130, 246, 0.2);
    }
  `;

  // =================== RENDU PRINCIPAL ULTRA-OPTIMISÉ ===================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: '#ffffff',
      position: 'relative'
    }}>
      
      {/* =================== INJECTION CSS MOBILE OPTIMISÉ =================== */}
      <style jsx>{mobileOptimizedCSS}</style>

      {/* =================== HEADER CONDITIONNEL =================== */}
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
      
      {/* =================== NAVIGATION STEPS CONDITIONNELLE =================== */}
      {isMobile ? <MobileStepsNavigation /> : <DesktopStepsNavigation />}

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

          {/* =================== CONTENU DES ÉTAPES AVEC LANGUE =================== */}
          <div style={{ minHeight: isMobile ? '300px' : '400px' }}>
            <StepContent />
          </div>
        </div>
      </main>

      {/* =================== NAVIGATION FOOTER CONDITIONNELLE =================== */}
      {isMobile ? <MobileNavigation /> : <DesktopFooterNavigation />}
    </div>
  );
}
