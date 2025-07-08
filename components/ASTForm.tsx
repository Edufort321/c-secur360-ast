'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, Save, Eye, Download, CheckCircle, 
  AlertTriangle, Clock, Shield, Users, MapPin, Calendar, Building, 
  Phone, User, Briefcase, Copy, Check, Camera, HardHat, Zap, Settings,
  Plus, Trash2, Edit, Star, Wifi, WifiOff, Upload, Bell
} from 'lucide-react';

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
  
  // Étapes de l'AST
  projectInfo: ProjectInfo;
  teamDiscussion: TeamDiscussion;
  equipment: EquipmentData[];
  hazards: HazardData[];
  controls: ControlData[];
  teamValidation: TeamValidation;
  documentation: DocumentationData;
  finalization: FinalizationData;
  
  // Workflow
  signatures: Signature[];
  approvals: Approval[];
  notifications: NotificationData[];
}

interface ProjectInfo {
  // Client et localisation
  clientName: string;
  clientPhone?: string;
  clientContact?: string;
  workLocation: string;
  gpsCoordinates?: string;
  industryType: string;
  
  // Projet
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate?: string;
  workerCount: number;
  
  // Responsable AST
  responsibleName: string;
  responsibleTitle: string;
  responsiblePhone: string;
  
  // Contexte légal
  permits: string[];
  regulations: string[];
  specialConditions: string[];
}

interface TeamDiscussion {
  participants: TeamMember[];
  discussionPoints: DiscussionPoint[];
  lockoutProcedures: LockoutProcedure[];
  emergencyProcedures: EmergencyProcedure[];
  communicationPlan: CommunicationPlan;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  certifications: string[];
  phoneNumber?: string;
  hasParticipated: boolean;
  signature?: string;
  signatureDate?: string;
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
}

interface LockoutProcedure {
  id: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'chemical' | 'thermal' | 'gravity';
  equipmentName: string;
  isolationPoints: IsolationPoint[];
  lockoutSteps: string[];
  verificationSteps: string[];
  responsiblePerson: string;
  isRequired: boolean;
}

interface IsolationPoint {
  id: string;
  type: string;
  location: string;
  lockType: string;
  tagNumber?: string;
  verificationMethod: string;
}

interface EquipmentData {
  id: string;
  category: 'ppe' | 'tools' | 'machinery' | 'safety' | 'communication';
  name: string;
  description?: string;
  isRequired: boolean;
  quantity: number;
  condition: 'excellent' | 'good' | 'acceptable' | 'needs_inspection' | 'defective';
  inspectionDate?: string;
  certificationNumber?: string;
  assignedTo?: string[];
  notes?: string;
}

interface HazardData {
  id: string;
  category: string;
  name: string;
  description: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  affectedPersons: number;
  potentialConsequences: string[];
  isApplicable: boolean;
  customHazard?: boolean;
}

interface ControlData {
  id: string;
  hazardId: string;
  hierarchyLevel: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  name: string;
  description: string;
  implementation: string;
  responsiblePerson: string;
  deadline?: string;
  isImplemented: boolean;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  verificationMethod: string;
  customControl?: boolean;
}

interface TeamValidation {
  validationMeeting: {
    date: string;
    participants: string[];
    duration: number;
    location: string;
  };
  workerFeedback: WorkerFeedback[];
  approvals: TeamApproval[];
  concerns: string[];
  improvements: string[];
}

interface WorkerFeedback {
  workerId: string;
  workerName: string;
  feedback: string;
  rating: 1 | 2 | 3 | 4 | 5;
  suggestions: string[];
  timestamp: string;
}

interface TeamApproval {
  workerId: string;
  workerName: string;
  role: string;
  approved: boolean;
  signature: string;
  timestamp: string;
  conditions?: string;
}

interface DocumentationData {
  photos: PhotoData[];
  documents: DocumentData[];
  videos: VideoData[];
  attachments: AttachmentData[];
}

interface PhotoData {
  id: string;
  url: string;
  caption: string;
  category: 'site' | 'equipment' | 'hazard' | 'control' | 'team' | 'other';
  timestamp: string;
  gpsLocation?: string;
}

interface DocumentData {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  timestamp: string;
}

interface VideoData {
  id: string;
  url: string;
  caption: string;
  duration: number;
  timestamp: string;
}

interface AttachmentData {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  timestamp: string;
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

interface EmergencyProcedure {
  id: string;
  type: 'evacuation' | 'medical' | 'fire' | 'chemical_spill' | 'electrical' | 'fall' | 'entrapment';
  title: string;
  steps: string[];
  emergencyContacts: EmergencyContact[];
  equipmentRequired: string[];
  responsiblePerson: string;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  isExternal: boolean;
}

interface CommunicationPlan {
  channels: string[];
  frequencies: string[];
  emergencySignals: string[];
  checkInSchedule: string;
  responsiblePerson: string;
}

interface FinalizationData {
  finalReview: {
    reviewedBy: string;
    reviewDate: string;
    reviewComments: string;
    approved: boolean;
  };
  qualityCheck: {
    completeness: number;
    accuracy: number;
    compliance: number;
    overallScore: number;
  };
  distribution: {
    recipients: string[];
    distributionMethod: 'email' | 'print' | 'digital' | 'portal';
    distributionDate?: string;
  };
  archiving: {
    archiveLocation: string;
    retentionPeriod: number;
    accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
  };
}

// =================== DONNÉES DE RÉFÉRENCE ===================
const HAZARD_CATEGORIES = {
  'physical': {
    name: 'Dangers Physiques',
    color: '#ef4444',
    icon: '⚡',
    hazards: [
      'Électrocution/Électrisation',
      'Chute de hauteur',
      'Chute de plain-pied',
      'Chute d\'objets',
      'Coupure/Lacération',
      'Écrasement/Coincement',
      'Projection de particules',
      'Bruit excessif',
      'Vibrations',
      'Températures extrêmes',
      'Rayonnements ionisants',
      'Rayonnements non-ionisants'
    ]
  },
  'chemical': {
    name: 'Dangers Chimiques',
    color: '#f59e0b',
    icon: '🧪',
    hazards: [
      'Inhalation de vapeurs toxiques',
      'Contact cutané avec produits chimiques',
      'Ingestion accidentelle',
      'Réactions chimiques dangereuses',
      'Incendie de produits chimiques',
      'Explosion chimique',
      'Corrosion',
      'Sensibilisation allergique'
    ]
  },
  'biological': {
    name: 'Dangers Biologiques',
    color: '#10b981',
    icon: '🦠',
    hazards: [
      'Exposition à des agents pathogènes',
      'Morsures/Piqûres d\'animaux',
      'Contamination microbienne',
      'Allergies biologiques',
      'Maladies transmissibles'
    ]
  },
  'ergonomic': {
    name: 'Dangers Ergonomiques',
    color: '#8b5cf6',
    icon: '👤',
    hazards: [
      'Manutention manuelle',
      'Postures contraignantes',
      'Mouvements répétitifs',
      'Efforts excessifs',
      'Vibrations main-bras',
      'Fatigue visuelle',
      'Stress physique'
    ]
  },
  'psychosocial': {
    name: 'Dangers Psychosociaux',
    color: '#06b6d4',
    icon: '🧠',
    hazards: [
      'Stress au travail',
      'Surcharge de travail',
      'Isolement',
      'Harcèlement',
      'Violence au travail',
      'Facteurs organisationnels'
    ]
  },
  'environmental': {
    name: 'Dangers Environnementaux',
    color: '#84cc16',
    icon: '🌍',
    hazards: [
      'Conditions météorologiques',
      'Espaces confinés',
      'Atmosphères explosives',
      'Terrains instables',
      'Présence d\'eau',
      'Circulation véhiculaire',
      'Travail en hauteur',
      'Éclairage insuffisant'
    ]
  }
};

const CONTROL_HIERARCHY = {
  'elimination': {
    name: 'Élimination',
    level: 1,
    color: '#dc2626',
    effectiveness: 95,
    examples: [
      'Supprimer la tâche dangereuse',
      'Éliminer la source de danger',
      'Automatisation complète',
      'Changement de procédé'
    ]
  },
  'substitution': {
    name: 'Substitution',
    level: 2,
    color: '#ea580c',
    effectiveness: 80,
    examples: [
      'Remplacer par moins dangereux',
      'Utiliser des produits moins toxiques',
      'Changer d\'équipement',
      'Modifier la méthode de travail'
    ]
  },
  'engineering': {
    name: 'Contrôles d\'Ingénierie',
    level: 3,
    color: '#f59e0b',
    effectiveness: 65,
    examples: [
      'Ventilation',
      'Isolation/Encoffrement',
      'Garde-corps',
      'Systèmes de sécurité',
      'Dispositifs de protection'
    ]
  },
  'administrative': {
    name: 'Contrôles Administratifs',
    level: 4,
    color: '#eab308',
    effectiveness: 50,
    examples: [
      'Procédures de travail',
      'Formation',
      'Signalisation',
      'Rotation du personnel',
      'Surveillance médicale'
    ]
  },
  'ppe': {
    name: 'Équipements de Protection Individuelle',
    level: 5,
    color: '#84cc16',
    effectiveness: 35,
    examples: [
      'Casques de sécurité',
      'Lunettes de protection',
      'Gants de protection',
      'Chaussures de sécurité',
      'Harnais de sécurité',
      'Masques respiratoires'
    ]
  }
};

const EQUIPMENT_CATEGORIES = {
  'ppe': {
    name: 'Équipements de Protection Individuelle',
    color: '#3b82f6',
    icon: '🦺',
    items: [
      'Casque de sécurité',
      'Lunettes de protection',
      'Écran facial',
      'Bouchons d\'oreilles',
      'Casque antibruit',
      'Masque respiratoire',
      'Gants de protection',
      'Chaussures de sécurité',
      'Bottes de sécurité',
      'Harnais de sécurité',
      'Vêtements haute visibilité',
      'Combinaison de protection'
    ]
  },
  'tools': {
    name: 'Outils et Équipements',
    color: '#f59e0b',
    icon: '🔧',
    items: [
      'Outils électriques',
      'Outils pneumatiques',
      'Échelles',
      'Échafaudages',
      'Plateformes élévatrices',
      'Grues',
      'Chariots élévateurs',
      'Véhicules de chantier'
    ]
  },
  'safety': {
    name: 'Équipements de Sécurité',
    color: '#ef4444',
    icon: '🚨',
    items: [
      'Détecteurs de gaz',
      'Extincteurs',
      'Trousse de premiers soins',
      'Douche d\'urgence',
      'Lave-œil d\'urgence',
      'Système d\'alarme',
      'Éclairage d\'urgence',
      'Barrières de sécurité'
    ]
  },
  'communication': {
    name: 'Communication',
    color: '#8b5cf6',
    icon: '📱',
    items: [
      'Radios de communication',
      'Téléphones d\'urgence',
      'Sifflets de sécurité',
      'Système d\'alerte',
      'Signalisation'
    ]
  }
};

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
    teamDiscussion: { participants: [], discussionPoints: [], lockoutProcedures: [], emergencyProcedures: [], communicationPlan: {} } as TeamDiscussion,
    equipment: [],
    hazards: [],
    controls: [],
    teamValidation: {} as TeamValidation,
    documentation: { photos: [], documents: [], videos: [], attachments: [] },
    finalization: {} as FinalizationData,
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

  // =================== CONFIGURATION STEPS ===================
  const steps = [
    { 
      id: 1, 
      title: 'Informations Projet', 
      subtitle: 'Identification légale du chantier',
      icon: FileText, 
      color: '#3b82f6',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 2, 
      title: 'Discussion Équipe', 
      subtitle: 'Consultation et verrouillage',
      icon: Users, 
      color: '#10b981',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 3, 
      title: 'Équipements', 
      subtitle: 'EPI et équipements sécurité',
      icon: Shield, 
      color: '#f59e0b',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 4, 
      title: 'Dangers & Risques', 
      subtitle: 'Identification selon RSST',
      icon: AlertTriangle, 
      color: '#ef4444',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 5, 
      title: 'Contrôles', 
      subtitle: 'Hiérarchie des contrôles',
      icon: CheckCircle, 
      color: '#8b5cf6',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 6, 
      title: 'Validation Équipe', 
      subtitle: 'Signatures travailleurs',
      icon: Users, 
      color: '#06b6d4',
      required: true,
      mobileOptimized: true
    },
    { 
      id: 7, 
      title: 'Documentation', 
      subtitle: 'Photos et documents',
      icon: Camera, 
      color: '#84cc16',
      required: false,
      mobileOptimized: true
    },
    { 
      id: 8, 
      title: 'Finalisation', 
      subtitle: 'Validation finale',
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
        
        .float-animation { animation: float 6s ease-in-out infinite; }
        .pulse-animation { animation: pulse 4s ease-in-out infinite; }
        .slide-in { animation: slideIn 0.5s ease-out; }
        
        .shine-effect {
          background: linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
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
        
        .dropdown-cascade {
          transition: all 0.3s ease;
          max-height: 0;
          overflow: hidden;
        }
        
        .dropdown-cascade.open {
          max-height: 500px;
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
          
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
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

      {/* =================== HEADER PREMIUM =================== */}
      <header style={{
        background: 'linear-gradient(135deg, #1e2a3a 0%, #2d3748 50%, #1a202c 100%)',
        borderBottom: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, #3b82f6, #f59e0b, #10b981, #ef4444, #8b5cf6) 1',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          
          {/* Logo et info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo C-Secur360 */}
            <div 
              className="float-animation"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                borderRadius: '16px',
                border: '3px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="shine-effect" style={{ position: 'absolute', inset: 0 }} />
              <img 
                src="/c-secur360-logo.png" 
                alt="C-Secur360"
                style={{ 
                  width: '48px', 
                  height: '48px',
                  filter: 'brightness(1.2) contrast(1.1)'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="color: #f59e0b; font-size: 24px; font-weight: 900;">C🛡️</span>';
                }}
              />
            </div>
            
            {/* Titre et status */}
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: 0, 
                background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                C-Secur360
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#94a3b8', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  AST • Étape {currentStep} sur {steps.length}
                </p>
                {getStatusBadge()}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isOnline ? <Wifi size={14} color="#10b981" /> : <WifiOff size={14} color="#ef4444" />}
                  <span style={{ fontSize: '12px', color: isOnline ? '#10b981' : '#ef4444' }}>
                    {isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Numéro AST et actions */}
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

            {/* Actions rapides */}
            {userRole === 'supervisor' || userRole === 'manager' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => changeStatus('pending_verification')}
                  disabled={astData.status !== 'draft'}
                  style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: astData.status === 'draft' ? 'pointer' : 'not-allowed',
                    opacity: astData.status === 'draft' ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Bell size={12} />
                  Soumettre
                </button>
                
                <button
                  onClick={() => changeStatus('approved')}
                  disabled={astData.status !== 'pending_verification'}
                  style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: astData.status === 'pending_verification' ? 'pointer' : 'not-allowed',
                    opacity: astData.status === 'pending_verification' ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
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

          {/* Contenu spécifique à chaque étape */}
          <div style={{ minHeight: '400px' }}>
            {/* ÉTAPE 1: Informations Projet */}
            {currentStep === 1 && (
              <div className="slide-in">
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  marginBottom: '32px'
                }}>
                  <FileText size={32} color="#3b82f6" style={{ marginBottom: '12px' }} />
                  <h3 style={{ color: '#ffffff', margin: '0 0 8px' }}>Étape 1 - Informations du Projet</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>
                    Interface complète en développement avec formulaires intelligents,<br />
                    validation cascade et sauvegarde automatique
                  </p>
                </div>
                
                {/* Preview des fonctionnalités */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <Building size={24} color="#3b82f6" style={{ marginBottom: '12px' }} />
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px' }}>Client & Localisation</h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                      Identification complète avec géolocalisation automatique
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <Briefcase size={24} color="#10b981" style={{ marginBottom: '12px' }} />
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px' }}>Détails Projet</h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                      Description détaillée avec validation légale RSST
                    </p>
                  </div>
                  
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <User size={24} color="#f59e0b" style={{ marginBottom: '12px' }} />
                    <h4 style={{ color: '#ffffff', margin: '0 0 8px' }}>Responsable AST</h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                      Identification du responsable avec signatures digitales
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders pour les autres étapes */}
            {currentStep !== 1 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${steps[currentStep - 1]?.color}40`,
                borderRadius: '20px',
                padding: '60px 40px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: `linear-gradient(135deg, ${steps[currentStep - 1]?.color}40, ${steps[currentStep - 1]?.color}20)`,
                  borderRadius: '20px',
                  margin: '0 auto 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${steps[currentStep - 1]?.color}60`
                }}>
                  {React.createElement(steps[currentStep - 1]?.icon || FileText, {
                    size: 32,
                    color: steps[currentStep - 1]?.color
                  })}
                </div>
                
                <h3 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '12px' }}>
                  {steps[currentStep - 1]?.title}
                </h3>
                
                <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                  Interface complète avec {currentStep === 2 ? 'système de verrouillage/cadenassage' : 
                  currentStep === 3 ? 'sélection d\'équipements intelligente' :
                  currentStep === 4 ? 'identification des 33+ dangers' :
                  currentStep === 5 ? 'hiérarchie des contrôles automatique' :
                  currentStep === 6 ? 'signatures digitales équipe' :
                  currentStep === 7 ? 'upload photos et documents' :
                  'validation finale et archivage'}
                </p>
                
                <div style={{
                  background: `rgba(${steps[currentStep - 1]?.color?.slice(1, 3) ? parseInt(steps[currentStep - 1]?.color?.slice(1, 3), 16) : 59}, ${steps[currentStep - 1]?.color?.slice(3, 5) ? parseInt(steps[currentStep - 1]?.color?.slice(3, 5), 16) : 130}, ${steps[currentStep - 1]?.color?.slice(5, 7) ? parseInt(steps[currentStep - 1]?.color?.slice(5, 7), 16) : 246}, 0.1)`,
                  border: `1px solid ${steps[currentStep - 1]?.color}40`,
                  borderRadius: '12px',
                  padding: '20px',
                  color: steps[currentStep - 1]?.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Settings size={20} className="pulse-animation" />
                  <span style={{ fontWeight: '500' }}>Section en développement avancé</span>
                </div>
              </div>
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
