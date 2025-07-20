// =================== COMPONENTS/FORMS/SHARED/VALIDATIONSECTION.TSX - SECTION VALIDATION MOBILE-FIRST ===================
// Section validation avec signatures électroniques, workflow approbation et archivage sécurisé

"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Users,
  Edit3,
  Save,
  Send,
  Download,
  Upload,
  Share2,
  Copy,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Camera,
  Mic,
  Phone,
  Mail,
  Bell,
  Star,
  Flag,
  Lock,
  Unlock,
  Key,
  QrCode,
  Printer,
  Archive,
  RefreshCw,
  Settings,
  Info,
  HelpCircle,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Zap,
  Activity,
  Radio,
  Bluetooth,
  Wifi,
  Battery
} from 'lucide-react';

// =================== TYPES ET INTERFACES ===================
export type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';

export interface PermitFormData {
  id?: string;
  name?: string;
  status?: string;
  signatures?: SignatureCapture[];
  validationWorkflow?: ValidationWorkflow;
  [key: string]: any;
}

export interface FieldError {
  message: { fr: string; en: string };
  code: string;
}

export interface ValidationStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  assignedTo: string[];
  startDate: Date;
  endDate?: Date;
  timeLimit?: number;
  isRequired: boolean;
  order: number;
}

export interface SignatureData {
  id: string;
  signerId: string;
  signerName: string;
  timestamp: Date;
  signatureImage: string;
}

export interface ApprovalWorkflow {
  id: string;
  steps: ValidationStep[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface NotificationData {
  id: string;
  type: string;
  title: { fr: string; en: string };
  message: { fr: string; en: string };
  recipients: string[];
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  relatedEntity: string;
  entityId: string;
  actionRequired: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface AuditTrail {
  id: string;
  action: string;
  timestamp: Date;
  userId: string;
  details: string;
  ipAddress: string;
}

// =================== FONCTIONS UTILITAIRES ===================
const generateValidationId = (): string => {
  return `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const validateSignatureData = (signature: SignatureCapture): FieldError | null => {
  if (!signature.signatureData || signature.signatureData.length < 100) {
    return {
      message: {
        fr: 'La signature est requise et doit être valide',
        en: 'Signature is required and must be valid'
      },
      code: 'SIGNATURE_INVALID'
    };
  }
  
  if (!signature.signerName || signature.signerName.trim().length < 2) {
    return {
      message: {
        fr: 'Le nom du signataire est requis',
        en: 'Signer name is required'
      },
      code: 'SIGNER_NAME_REQUIRED'
    };
  }
  
  return null;
};

const generateQRCode = async (data: string): Promise<string> => {
  // Simulation génération QR code - Remplacer par vraie librairie QR
  const qrData = `data:image/svg+xml;base64,${btoa(`<svg>QR_CODE_FOR_${data}</svg>`)}`;
  return qrData;
};

// =================== CONSTANTES RÉGLEMENTATIONS ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    authority: 'CNESST',
    digitalSignatureRequired: true,
    retentionPeriod: 7, // years
    auditRequirements: ['timestamp', 'geolocation', 'identity_verification']
  },
  ON: {
    authority: 'Ministry of Labour',
    digitalSignatureRequired: true,
    retentionPeriod: 5,
    auditRequirements: ['timestamp', 'identity_verification']
  },
  AB: {
    authority: 'Alberta Labour',
    digitalSignatureRequired: false,
    retentionPeriod: 7,
    auditRequirements: ['timestamp']
  },
  BC: {
    authority: 'WorkSafeBC',
    digitalSignatureRequired: true,
    retentionPeriod: 5,
    auditRequirements: ['timestamp', 'geolocation', 'identity_verification']
  }
};

// =================== INTERFACES SECTION ===================
interface ValidationSectionProps {
  data: Partial<PermitFormData>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, FieldError>;
  language: 'fr' | 'en';
  permitType: PermitType;
  province: string;
  userRole: 'employee' | 'supervisor' | 'manager' | 'safety_officer' | 'admin';
  touchOptimized?: boolean;
  enableGeolocation?: boolean;
  enablePhotoCapture?: boolean;
  enableDigitalSignature?: boolean;
  enablePDFGeneration?: boolean;
}

interface SignatureCapture {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureData: string; // Base64 SVG path
  timestamp: Date;
  location?: GeolocationData;
  ipAddress?: string;
  deviceInfo?: string;
  photo?: string;
  voiceNote?: string;
  witnessId?: string;
  isValid: boolean;
  verificationMethod: 'biometric' | 'pin' | 'password' | 'witnessed';
}

interface ValidationWorkflow {
  id: string;
  steps: ValidationStep[];
  currentStep: number;
  status: 'draft' | 'pending' | 'in-review' | 'approved' | 'rejected' | 'expired';
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  expiryDate?: Date;
  rejectionReason?: string;
  escalationLevel: number;
  requiredApprovals: number;
  receivedApprovals: number;
  finalApprover?: string;
  finalApprovalDate?: Date;
}

interface ApprovalStep {
  id: string;
  order: number;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  roleRequired: string[];
  isRequired: boolean;
  isParallel: boolean; // Peut être fait en parallèle
  timeLimit?: number; // heures
  autoApprove?: boolean;
  delegationAllowed: boolean;
  escalationAfter?: number; // heures
  escalationTo?: string[];
  notificationTemplate: { fr: string; en: string };
  conditions?: string[]; // Conditions pré-requises
}

interface DigitalCertificate {
  id: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  keyUsage: string[];
  serialNumber: string;
  fingerprint: string;
  isRevoked: boolean;
  crlUrl?: string;
  ocspUrl?: string;
}

interface PDFTemplate {
  id: string;
  name: { fr: string; en: string };
  permitTypes: PermitType[];
  template: string; // HTML template
  includeQR: boolean;
  includeSignatures: boolean;
  includePhotos: boolean;
  includeMaps: boolean;
  watermark?: string;
  encryption: boolean;
  passwordProtected: boolean;
}

// =================== WORKFLOW APPROBATION PAR TYPE PERMIS ===================
const APPROVAL_WORKFLOWS: Record<PermitType, ApprovalStep[]> = {
  'espace-clos': [
    {
      id: 'safety-review',
      order: 1,
      title: { fr: 'Révision sécurité', en: 'Safety Review' },
      description: { fr: 'Validation procédures et équipements', en: 'Validation of procedures and equipment' },
      roleRequired: ['safety_officer'],
      isRequired: true,
      isParallel: false,
      timeLimit: 2,
      delegationAllowed: false,
      escalationAfter: 4,
      escalationTo: ['safety_manager'],
      notificationTemplate: {
        fr: 'Permis espace clos #{permitId} nécessite votre révision sécurité',
        en: 'Confined space permit #{permitId} requires your safety review'
      },
      conditions: ['atmospheric_tests_completed', 'personnel_assigned', 'equipment_verified']
    },
    {
      id: 'supervisor-approval',
      order: 2,
      title: { fr: 'Approbation superviseur', en: 'Supervisor Approval' },
      description: { fr: 'Approbation finale du superviseur', en: 'Final supervisor approval' },
      roleRequired: ['supervisor', 'manager'],
      isRequired: true,
      isParallel: false,
      timeLimit: 1,
      delegationAllowed: true,
      escalationAfter: 2,
      escalationTo: ['manager'],
      notificationTemplate: {
        fr: 'Permis espace clos #{permitId} nécessite votre approbation finale',
        en: 'Confined space permit #{permitId} requires your final approval'
      },
      conditions: ['safety_review_completed']
    }
  ],
  'travail-chaud': [
    {
      id: 'fire-safety-review',
      order: 1,
      title: { fr: 'Révision sécurité incendie', en: 'Fire Safety Review' },
      description: { fr: 'Validation risques incendie et précautions', en: 'Fire risk validation and precautions' },
      roleRequired: ['safety_officer', 'fire_marshal'],
      isRequired: true,
      isParallel: false,
      timeLimit: 1,
      delegationAllowed: false,
      notificationTemplate: {
        fr: 'Permis travail à chaud #{permitId} nécessite révision sécurité incendie',
        en: 'Hot work permit #{permitId} requires fire safety review'
      },
      conditions: ['fire_watch_assigned', 'extinguishers_verified']
    },
    {
      id: 'area-supervisor-approval',
      order: 2,
      title: { fr: 'Approbation superviseur zone', en: 'Area Supervisor Approval' },
      description: { fr: 'Approbation superviseur de la zone de travail', en: 'Work area supervisor approval' },
      roleRequired: ['supervisor'],
      isRequired: true,
      isParallel: false,
      timeLimit: 0.5,
      delegationAllowed: true,
      notificationTemplate: {
        fr: 'Permis travail à chaud #{permitId} zone {location} nécessite votre approbation',
        en: 'Hot work permit #{permitId} area {location} requires your approval'
      },
      conditions: ['fire_safety_review_completed']
    }
  ],
  'levage': [
    {
      id: 'lifting-plan-review',
      order: 1,
      title: { fr: 'Révision plan de levage', en: 'Lifting Plan Review' },
      description: { fr: 'Validation calculs et procédures levage', en: 'Lifting calculations and procedures validation' },
      roleRequired: ['lifting_engineer', 'safety_officer'],
      isRequired: true,
      isParallel: true,
      timeLimit: 4,
      delegationAllowed: false,
      notificationTemplate: {
        fr: 'Plan de levage #{permitId} nécessite votre validation technique',
        en: 'Lifting plan #{permitId} requires your technical validation'
      },
      conditions: ['load_calculations_completed', 'crane_inspection_valid']
    },
    {
      id: 'operations-approval',
      order: 2,
      title: { fr: 'Approbation opérations', en: 'Operations Approval' },
      description: { fr: 'Approbation finale opérations', en: 'Final operations approval' },
      roleRequired: ['operations_manager'],
      isRequired: true,
      isParallel: false,
      timeLimit: 2,
      delegationAllowed: true,
      notificationTemplate: {
        fr: 'Permis levage #{permitId} nécessite approbation opérations finale',
        en: 'Lifting permit #{permitId} requires final operations approval'
      },
      conditions: ['lifting_plan_approved']
    }
  ],
  'excavation': [
    {
      id: 'utilities-clearance',
      order: 1,
      title: { fr: 'Autorisation services publics', en: 'Utilities Clearance' },
      description: { fr: 'Confirmation dégagement services publics', en: 'Public utilities clearance confirmation' },
      roleRequired: ['utilities_coordinator'],
      isRequired: true,
      isParallel: false,
      timeLimit: 24,
      delegationAllowed: false,
      notificationTemplate: {
        fr: 'Excavation #{permitId} nécessite autorisation services publics',
        en: 'Excavation #{permitId} requires utilities clearance'
      },
      conditions: ['locate_requested', 'maps_reviewed']
    }
  ],
  'hauteur': [
    {
      id: 'fall-protection-review',
      order: 1,
      title: { fr: 'Révision protection chute', en: 'Fall Protection Review' },
      description: { fr: 'Validation systèmes protection antichute', en: 'Fall protection systems validation' },
      roleRequired: ['safety_officer'],
      isRequired: true,
      isParallel: false,
      timeLimit: 1,
      delegationAllowed: false,
      notificationTemplate: {
        fr: 'Permis travail hauteur #{permitId} nécessite révision protection chute',
        en: 'Work at height permit #{permitId} requires fall protection review'
      },
      conditions: ['anchor_points_verified', 'harness_inspection_valid']
    }
  ],
  // Autres types avec workflows simplifiés...
  'isolation-energetique': [],
  'pression': [],
  'radiographie': [],
  'toiture': [],
  'demolition': []
};

const PDF_TEMPLATES: Record<PermitType, PDFTemplate> = {
  'espace-clos': {
    id: 'confined-space-standard',
    name: { fr: 'Permis espace clos standard', en: 'Standard confined space permit' },
    permitTypes: ['espace-clos'],
    template: 'confined-space-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: true,
    watermark: 'CONFIDENTIEL',
    encryption: true,
    passwordProtected: true
  },
  'travail-chaud': {
    id: 'hot-work-standard',
    name: { fr: 'Permis travail à chaud standard', en: 'Standard hot work permit' },
    permitTypes: ['travail-chaud'],
    template: 'hot-work-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: false,
    includeMaps: false,
    encryption: false,
    passwordProtected: false
  },
  // Templates pour autres types...
  'levage': {
    id: 'lifting-standard',
    name: { fr: 'Permis levage standard', en: 'Standard lifting permit' },
    permitTypes: ['levage'],
    template: 'lifting-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: true,
    encryption: true,
    passwordProtected: true
  },
  'excavation': {
    id: 'excavation-standard',
    name: { fr: 'Permis excavation standard', en: 'Standard excavation permit' },
    permitTypes: ['excavation'],
    template: 'excavation-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: true,
    encryption: false,
    passwordProtected: false
  },
  'hauteur': {
    id: 'height-work-standard',
    name: { fr: 'Permis travail hauteur standard', en: 'Standard height work permit' },
    permitTypes: ['hauteur'],
    template: 'height-work-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: false,
    encryption: false,
    passwordProtected: false
  },
  'isolation-energetique': {
    id: 'loto-standard',
    name: { fr: 'Permis LOTO standard', en: 'Standard LOTO permit' },
    permitTypes: ['isolation-energetique'],
    template: 'loto-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: false,
    includeMaps: false,
    encryption: true,
    passwordProtected: true
  },
  'pression': {
    id: 'pressure-standard',
    name: { fr: 'Permis équipements pression', en: 'Pressure equipment permit' },
    permitTypes: ['pression'],
    template: 'pressure-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: false,
    encryption: true,
    passwordProtected: true
  },
  'radiographie': {
    id: 'radiography-standard',
    name: { fr: 'Permis radiographie industrielle', en: 'Industrial radiography permit' },
    permitTypes: ['radiographie'],
    template: 'radiography-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: true,
    watermark: 'RADIOACTIF',
    encryption: true,
    passwordProtected: true
  },
  'toiture': {
    id: 'roofing-standard',
    name: { fr: 'Permis travaux toiture', en: 'Roofing work permit' },
    permitTypes: ['toiture'],
    template: 'roofing-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: false,
    encryption: false,
    passwordProtected: false
  },
  'demolition': {
    id: 'demolition-standard',
    name: { fr: 'Permis démolition', en: 'Demolition permit' },
    permitTypes: ['demolition'],
    template: 'demolition-template.html',
    includeQR: true,
    includeSignatures: true,
    includePhotos: true,
    includeMaps: true,
    watermark: 'DANGER',
    encryption: true,
    passwordProtected: true
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const ValidationSection: React.FC<ValidationSectionProps> = ({
  data,
  onChange,
  errors,
  language = 'fr',
  permitType,
  province,
  userRole,
  touchOptimized = true,
  enableGeolocation = true,
  enablePhotoCapture = true,
  enableDigitalSignature = true,
  enablePDFGeneration = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [validationWorkflow, setValidationWorkflow] = useState<ValidationWorkflow | null>(null);
  const [signatures, setSignatures] = useState<SignatureCapture[]>([]);
  const [currentSignature, setCurrentSignature] = useState<Partial<SignatureCapture>>({});
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [showApprovalFlow, setShowApprovalFlow] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState<NotificationData[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [digitalCertificate, setDigitalCertificate] = useState<DigitalCertificate | null>(null);
  
  // Refs pour signature et fonctionnalités
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<any>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const voiceRecognitionRef = useRef<any>(null);

  // =================== WORKFLOW CONFIGURATION ===================
  const approvalSteps = useMemo(() => {
    return APPROVAL_WORKFLOWS[permitType] || [];
  }, [permitType]);

  const pdfTemplate = useMemo(() => {
    return PDF_TEMPLATES[permitType];
  }, [permitType]);

  const canUserApprove = useMemo(() => {
    if (!validationWorkflow || validationWorkflow.currentStep >= approvalSteps.length) return false;
    
    const currentStepConfig = approvalSteps[validationWorkflow.currentStep];
    return currentStepConfig?.roleRequired.includes(userRole) || false;
  }, [validationWorkflow, approvalSteps, userRole]);

  // =================== WORKFLOW INITIALIZATION ===================
  const initializeWorkflow = useCallback(() => {
    if (validationWorkflow) return;

    const newWorkflow: ValidationWorkflow = {
      id: generateValidationId(),
      steps: approvalSteps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        status: 'pending',
        assignedTo: step.roleRequired,
        startDate: new Date(),
        timeLimit: step.timeLimit,
        isRequired: step.isRequired,
        order: step.order
      })),
      currentStep: 0,
      status: 'pending',
      createdBy: 'current-user-id',
      createdAt: new Date(),
      lastModified: new Date(),
      escalationLevel: 0,
      requiredApprovals: approvalSteps.filter(s => s.isRequired).length,
      receivedApprovals: 0
    };

    setValidationWorkflow(newWorkflow);
    onChange('validationWorkflow', newWorkflow);
  }, [validationWorkflow, approvalSteps, onChange]);

  // =================== SIGNATURE CAPTURE ===================
  const startSignatureCapture = useCallback(async (signerId: string, signerName: string, signerRole: string) => {
    setCurrentSignature({
      id: generateValidationId(),
      signerId,
      signerName,
      signerRole,
      timestamp: new Date(),
      verificationMethod: 'witnessed'
    });

    // Capture géolocalisation si activée
    if (enableGeolocation && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        setCurrentSignature(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          }
        }));
      } catch (error) {
        console.error('Erreur géolocalisation:', error);
      }
    }

    setIsSignaturePadOpen(true);
    
    // Feedback haptic début signature
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }
  }, [enableGeolocation]);

  const captureSignature = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/svg+xml');
    
    const newSignature: SignatureCapture = {
      ...currentSignature,
      signatureData,
      isValid: true,
      deviceInfo: navigator.userAgent
    } as SignatureCapture;

    setSignatures(prev => [...prev, newSignature]);
    setCurrentSignature({});
    setIsSignaturePadOpen(false);

    // Mettre à jour données formulaire
    const currentSignatures = data.signatures || [];
    onChange('signatures', [...currentSignatures, newSignature]);

    // Feedback haptic signature complétée
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50, 25, 50]);
    }

    // Vérifier si l'étape peut être approuvée
    if (validationWorkflow && canUserApprove) {
      advanceWorkflow();
    }
  }, [currentSignature, data.signatures, onChange, validationWorkflow, canUserApprove]);

  // =================== WORKFLOW ADVANCEMENT ===================
  const advanceWorkflow = useCallback(() => {
    if (!validationWorkflow) return;

    const updatedWorkflow = {
      ...validationWorkflow,
      currentStep: validationWorkflow.currentStep + 1,
      receivedApprovals: validationWorkflow.receivedApprovals + 1,
      lastModified: new Date()
    };

    // Vérifier si workflow terminé
    if (updatedWorkflow.currentStep >= approvalSteps.length) {
      updatedWorkflow.status = 'approved';
      updatedWorkflow.finalApprover = 'current-user-id';
      updatedWorkflow.finalApprovalDate = new Date();
    }

    setValidationWorkflow(updatedWorkflow);
    onChange('validationWorkflow', updatedWorkflow);

    // Ajouter au audit trail
    const auditEntry: AuditTrail = {
      id: generateValidationId(),
      action: 'step_approved',
      timestamp: new Date(),
      userId: 'current-user-id',
      details: `Step ${validationWorkflow.currentStep + 1} approved`,
      ipAddress: '192.168.1.1' // À récupérer
    };

    setAuditTrail(prev => [...prev, auditEntry]);

    // Envoyer notifications pour prochaine étape
    if (updatedWorkflow.currentStep < approvalSteps.length) {
      sendStepNotifications(updatedWorkflow.currentStep);
    }
  }, [validationWorkflow, approvalSteps, onChange]);

  const rejectWorkflow = useCallback((reason: string) => {
    if (!validationWorkflow) return;

    const updatedWorkflow = {
      ...validationWorkflow,
      status: 'rejected' as const,
      rejectionReason: reason,
      lastModified: new Date()
    };

    setValidationWorkflow(updatedWorkflow);
    onChange('validationWorkflow', updatedWorkflow);

    // Audit trail
    const auditEntry: AuditTrail = {
      id: generateValidationId(),
      action: 'workflow_rejected',
      timestamp: new Date(),
      userId: 'current-user-id',
      details: `Workflow rejected: ${reason}`,
      ipAddress: '192.168.1.1'
    };

    setAuditTrail(prev => [...prev, auditEntry]);
  }, [validationWorkflow, onChange]);

  // =================== NOTIFICATIONS ===================
  const sendStepNotifications = useCallback((stepIndex: number) => {
    const step = approvalSteps[stepIndex];
    if (!step) return;

    const notification: NotificationData = {
      id: generateValidationId(),
      type: 'approval_required',
      title: {
        fr: `Approbation requise - ${step.title.fr}`,
        en: `Approval required - ${step.title.en}`
      },
      message: step.notificationTemplate,
      recipients: step.roleRequired,
      priority: 'high',
      timestamp: new Date(),
      relatedEntity: 'permit',
      entityId: data.id || '',
      actionRequired: true
    };

    setPendingNotifications(prev => [...prev, notification]);

    // Simulation envoi push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title[language], {
        body: notification.message[language],
        icon: '/icon-approval.png',
        badge: '/badge.png'
      });
      
      // Vibration séparée car non supportée dans NotificationOptions
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [approvalSteps, data.id, language]);

  // =================== PDF GENERATION ===================
  const generatePermitPDF = useCallback(async () => {
    if (!enablePDFGeneration || !pdfTemplate) return;

    setIsGeneratingPDF(true);

    try {
      // Simulation génération PDF - Remplacer par vraie génération
      await new Promise(resolve => setTimeout(resolve, 3000));

      const qrCode = await generateQRCode(data.id || '');
      
      const pdfData = {
        permitData: data,
        signatures: signatures,
        qrCode: qrCode,
        auditTrail: auditTrail,
        template: pdfTemplate,
        generatedAt: new Date(),
        generatedBy: 'current-user-id'
      };

      // Simulation téléchargement
      const blob = new Blob(['PDF_CONTENT_SIMULATION'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `permit-${data.id || Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      // Feedback haptic génération réussie
      if (navigator.vibrate) {
        navigator.vibrate([50, 25, 50, 25, 50, 25, 50]);
      }

    } catch (error) {
      console.error('Erreur génération PDF:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [enablePDFGeneration, pdfTemplate, data, signatures, auditTrail]);

  // =================== PHOTO CAPTURE FOR SIGNATURE ===================
  const captureSignaturePhoto = useCallback(async () => {
    if (!enablePhotoCapture) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Caméra avant pour signature
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
      }

      // Simulation capture - Remplacer par vraie capture
      setTimeout(() => {
        const photoData = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`; // Base64 simulé
        
        setCurrentSignature(prev => ({
          ...prev,
          photo: photoData
        }));
        
        // Arrêter stream
        stream.getTracks().forEach(track => track.stop());
        
        // Feedback haptic capture
        if (navigator.vibrate) {
          navigator.vibrate([25, 25, 25]);
        }
      }, 2000);
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  }, [enablePhotoCapture]);

  // =================== INITIALIZATION ===================
  useEffect(() => {
    initializeWorkflow();
  }, [initializeWorkflow]);

  // =================== RENDU COMPOSANT ===================
  const currentStepConfig = approvalSteps[validationWorkflow?.currentStep || 0];
  const isWorkflowComplete = validationWorkflow?.status === 'approved';
  const isWorkflowRejected = validationWorkflow?.status === 'rejected';

  return (
    <div className="space-y-6">
      {/* =================== HEADER SECTION =================== */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {language === 'fr' ? 'Validation et signatures' : 'Validation and signatures'}
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              {language === 'fr' 
                ? `Workflow d'approbation pour ${permitType} - ${approvalSteps.length} étapes requises`
                : `Approval workflow for ${permitType} - ${approvalSteps.length} required steps`
              }
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {validationWorkflow?.receivedApprovals || 0}/{validationWorkflow?.requiredApprovals || 0} {language === 'fr' ? 'approbations' : 'approvals'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {signatures.length} {language === 'fr' ? 'signatures' : 'signatures'}
              </span>
              <span className={`
                flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${isWorkflowComplete 
                  ? 'bg-green-100 text-green-700' 
                  : isWorkflowRejected
                  ? 'bg-red-100 text-red-700'
                  : 'bg-orange-100 text-orange-700'
                }
              `}>
                {isWorkflowComplete 
                  ? (language === 'fr' ? 'Approuvé' : 'Approved')
                  : isWorkflowRejected
                  ? (language === 'fr' ? 'Rejeté' : 'Rejected')
                  : (language === 'fr' ? 'En cours' : 'In progress')
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================== WORKFLOW PROGRESS =================== */}
      {validationWorkflow && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {language === 'fr' ? 'Progression de l\'approbation' : 'Approval progress'}
            </h4>
            <button
              onClick={() => setShowApprovalFlow(!showApprovalFlow)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all active:bg-gray-200"
            >
              <Eye className="w-4 h-4" />
              <span>{language === 'fr' ? 'Détails' : 'Details'}</span>
              {showApprovalFlow ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {language === 'fr' ? 'Étape' : 'Step'} {(validationWorkflow.currentStep || 0) + 1} / {approvalSteps.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((validationWorkflow.receivedApprovals || 0) / (validationWorkflow.requiredApprovals || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${isWorkflowComplete ? 'bg-green-600' : isWorkflowRejected ? 'bg-red-600' : 'bg-blue-600'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(((validationWorkflow.receivedApprovals || 0) / (validationWorkflow.requiredApprovals || 1)) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Current step info */}
          {currentStepConfig && !isWorkflowComplete && !isWorkflowRejected && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-medium text-blue-900 mb-1">
                    {currentStepConfig.title[language]}
                  </h5>
                  <p className="text-sm text-blue-700 mb-2">
                    {currentStepConfig.description[language]}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span>
                      {language === 'fr' ? 'Rôles requis:' : 'Required roles:'} {currentStepConfig.roleRequired.join(', ')}
                    </span>
                    {currentStepConfig.timeLimit && (
                      <span>
                        {language === 'fr' ? 'Limite:' : 'Limit:'} {currentStepConfig.timeLimit}h
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow details expandable */}
          <AnimatePresence>
            {showApprovalFlow && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  {approvalSteps.map((step, index) => {
                    const isCurrentStep = index === validationWorkflow.currentStep;
                    const isCompleted = index < validationWorkflow.currentStep;
                    const stepSignature = signatures.find(s => s.signerRole === step.roleRequired[0]);

                    return (
                      <div
                        key={step.id}
                        className={`
                          border rounded-lg p-3
                          ${isCurrentStep 
                            ? 'border-blue-300 bg-blue-50' 
                            : isCompleted 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                            ${isCompleted 
                              ? 'bg-green-600 text-white' 
                              : isCurrentStep 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-300 text-gray-600'
                            }
                          `}>
                            {isCompleted ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">
                              {step.title[language]}
                            </h6>
                            <p className="text-sm text-gray-600">
                              {step.description[language]}
                            </p>
                            {stepSignature && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>
                                  {language === 'fr' ? 'Signé par' : 'Signed by'} {stepSignature.signerName} 
                                  le {stepSignature.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {isCurrentStep && canUserApprove && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startSignatureCapture('current-user', 'Current User', userRole)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>{language === 'fr' ? 'Signer' : 'Sign'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt(language === 'fr' ? 'Raison du rejet:' : 'Rejection reason:');
                                  if (reason) rejectWorkflow(reason);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-medium transition-all active:bg-red-700"
                              >
                                <X className="w-4 h-4" />
                                <span>{language === 'fr' ? 'Rejeter' : 'Reject'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* =================== SIGNATURES COLLECTION =================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'fr' ? 'Signatures électroniques' : 'Electronic signatures'}
          </h4>
          {enableDigitalSignature && (
            <button
              onClick={() => startSignatureCapture('manual-user', 'Manual Signature', 'witness')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              <span>{language === 'fr' ? 'Signer' : 'Sign'}</span>
            </button>
          )}
        </div>

        {signatures.length > 0 ? (
          <div className="space-y-3">
            {signatures.map((signature, index) => (
              <SignatureCard
                key={signature.id || index}
                signature={signature}
                language={language}
                onViewDetails={() => {
                  // Modal détails signature
                }}
                touchOptimized={touchOptimized}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'fr' 
                ? 'Aucune signature électronique' 
                : 'No electronic signatures'
              }
            </p>
          </div>
        )}
      </div>

      {/* =================== FINAL ACTIONS =================== */}
      {(isWorkflowComplete || isWorkflowRejected) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">
            {language === 'fr' ? 'Actions finales' : 'Final actions'}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enablePDFGeneration && isWorkflowComplete && (
              <button
                onClick={generatePermitPDF}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{language === 'fr' ? 'Générer PDF' : 'Generate PDF'}</span>
              </button>
            )}
            
            <button
              onClick={() => {
                // Partager permis
                if (navigator.share) {
                  navigator.share({
                    title: `Permit ${data.id}`,
                    text: `Permit validation ${isWorkflowComplete ? 'completed' : 'rejected'}`,
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'fr' ? 'Partager' : 'Share'}</span>
            </button>
            
            <button
              onClick={() => {
                // Archiver permis
                onChange('status', 'archived');
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-lg font-medium transition-all active:bg-gray-700"
            >
              <Archive className="w-4 h-4" />
              <span>{language === 'fr' ? 'Archiver' : 'Archive'}</span>
            </button>
            
            <button
              onClick={() => {
                // Dupliquer permis
                const duplicateData = {
                  ...data,
                  id: generateValidationId(),
                  name: `${data.name} (copie)`,
                  status: 'draft',
                  validationWorkflow: null,
                  signatures: []
                };
                onChange('duplicatePermit', duplicateData);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium transition-all active:bg-purple-700"
            >
              <Copy className="w-4 h-4" />
              <span>{language === 'fr' ? 'Dupliquer' : 'Duplicate'}</span>
            </button>
          </div>
        </div>
      )}

      {/* =================== MODAL SIGNATURE PAD =================== */}
      <AnimatePresence>
        {isSignaturePadOpen && (
          <SignaturePadModal
            signature={currentSignature}
            language={language}
            onSave={captureSignature}
            onCancel={() => setIsSignaturePadOpen(false)}
            onCapturePhoto={captureSignaturePhoto}
            enablePhotoCapture={enablePhotoCapture}
            canvasRef={canvasRef}
            touchOptimized={touchOptimized}
          />
        )}
      </AnimatePresence>

      {/* =================== VIDEO CAPTURE HIDDEN =================== */}
      <video 
        ref={cameraRef}
        className="hidden"
        autoPlay
        playsInline
      />
    </div>
  );
};

// =================== COMPOSANT CARTE SIGNATURE ===================
const SignatureCard: React.FC<{
  signature: SignatureCapture;
  language: 'fr' | 'en';
  onViewDetails: () => void;
  touchOptimized: boolean;
}> = ({ signature, language, onViewDetails, touchOptimized }) => {
  return (
    <div 
      className={`
        border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-50
        ${touchOptimized ? 'active:scale-[0.98]' : ''}
      `}
      onClick={onViewDetails}
    >
      <div className="flex items-start gap-3">
        {/* Signature preview */}
        <div className="flex-shrink-0 w-16 h-12 bg-gray-100 rounded border flex items-center justify-center">
          {signature.signatureData ? (
            <img 
              src={signature.signatureData} 
              alt="Signature"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <Edit3 className="w-6 h-6 text-gray-400" />
          )}
        </div>
        
        {/* Signature info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 truncate">
                {signature.signerName}
              </h5>
              <p className="text-sm text-gray-600 truncate">
                {signature.signerRole}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{signature.timestamp.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}</span>
                <span>{signature.timestamp.toLocaleTimeString()}</span>
                {signature.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    GPS
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {signature.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              {signature.photo && <Camera className="w-4 h-4 text-blue-600" />}
              {signature.voiceNote && <Mic className="w-4 h-4 text-purple-600" />}
            </div>
          </div>
          
          {/* Verification method */}
          <div className="mt-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
              ${signature.verificationMethod === 'biometric' 
                ? 'bg-green-100 text-green-700' 
                : signature.verificationMethod === 'witnessed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
              }
            `}>
              {signature.verificationMethod === 'biometric' && <Shield className="w-3 h-3" />}
              {signature.verificationMethod === 'witnessed' && <Users className="w-3 h-3" />}
              {signature.verificationMethod === 'pin' && <Key className="w-3 h-3" />}
              {signature.verificationMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== MODAL SIGNATURE PAD ===================
const SignaturePadModal: React.FC<{
  signature: Partial<SignatureCapture>;
  language: 'fr' | 'en';
  onSave: () => void;
  onCancel: () => void;
  onCapturePhoto: () => void;
  enablePhotoCapture: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  touchOptimized: boolean;
}> = ({ signature, language, onSave, onCancel, onCapturePhoto, enablePhotoCapture, canvasRef, touchOptimized }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    // Logique dessin signature
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    // Logique dessin signature
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [canvasRef]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Signature électronique' : 'Electronic signature'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signature info */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">
              {signature.signerName}
            </p>
            <p className="text-gray-600">
              {language === 'fr' ? 'Rôle:' : 'Role:'} {signature.signerRole}
            </p>
            <p className="text-gray-600">
              {language === 'fr' ? 'Date:' : 'Date:'} {signature.timestamp?.toLocaleString()}
            </p>
            {signature.location && (
              <p className="text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {language === 'fr' ? 'Position GPS enregistrée' : 'GPS location recorded'}
              </p>
            )}
          </div>
        </div>

        {/* Signature canvas */}
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg mb-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full h-48 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          <div className="text-center text-sm text-gray-600 mb-4">
            {language === 'fr' 
              ? 'Signez dans la zone ci-dessus avec votre doigt ou souris'
              : 'Sign in the area above with your finger or mouse'
            }
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={clearSignature}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all active:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'fr' ? 'Effacer' : 'Clear'}</span>
            </button>
            
            {enablePhotoCapture && (
              <button
                onClick={onCapturePhoto}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg font-medium transition-all active:bg-blue-200"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'fr' ? 'Photo' : 'Photo'}</span>
              </button>
            )}
          </div>

          {/* Photo preview */}
          {signature.photo && (
            <div className="mb-4">
              <img 
                src={signature.photo} 
                alt="Signature photo"
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Save/Cancel buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg font-medium transition-all active:bg-gray-700"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700"
            >
              {language === 'fr' ? 'Enregistrer' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =================== EXPORT DEFAULT ===================
export default ValidationSection;
