'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, MapPin, Clock, AlertTriangle, CheckCircle, 
  Zap, Flame, Wind, Wrench, Settings, Camera, Lock,
  Eye, Phone, FileText, Plus, X, Edit, Save, Download,
  QrCode, Scan, UserCheck, Activity, Timer
} from 'lucide-react';

// =================== INTERFACES ET TYPES ===================

interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
}

interface Permit {
  id: string;
  type: PermitType;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  status: 'required' | 'optional' | 'not_applicable';
  priority: 'high' | 'medium' | 'low';
  data: any;
  validatedBy?: string;
  validatedAt?: string;
  qrCode?: string;
  photos: Photo[];
  workers: Worker[];
  lotoProcedure?: LOTOProcedure;
}

type PermitType = 
  | 'confined_space' 
  | 'electrical_work' 
  | 'hot_work' 
  | 'excavation' 
  | 'height_work' 
  | 'chemical_handling';

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  timestamp: string;
  gpsLocation?: Coordinates;
  description: { fr: string; en: string };
  mandatory: boolean;
  validated: boolean;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  certification?: string[];
  present: boolean;
  checkedInAt?: string;
  emergencyContact?: string;
  badgeNumber?: string;
  qrCode?: string;
}

interface LOTOProcedure {
  required: boolean;
  points: LOTOPoint[];
  photos: LOTOPhoto[];
  sequence: string[];
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

interface LOTOPoint {
  id: string;
  equipmentName: string;
  location: string;
  energyType: 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical';
  isolationMethod: string;
  lockAppliedBy?: string;
  lockNumber?: string;
  verified: boolean;
  photos: string[]; // Photo IDs
}

interface LOTOPhoto extends Photo {
  pointId: string;
  lockState: 'before' | 'during' | 'after' | 'verification';
  photoType: 'isolation' | 'verification' | 'completion';
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// =================== TRADUCTIONS COMPLÈTES ===================

const translations = {
  fr: {
    title: "🛡️ Gestion des Permis de Travail",
    subtitle: "Sélection et validation des permis requis selon le type de travaux",
    
    // Types de permis
    permitTypes: {
      confined_space: "Espace Clos",
      electrical_work: "Travaux Électriques", 
      hot_work: "Travaux à Chaud",
      excavation: "Excavation",
      height_work: "Travail en Hauteur",
      chemical_handling: "Manipulation Chimique"
    },
    
    permitDescriptions: {
      confined_space: "Espaces confinés nécessitant surveillance atmosphérique",
      electrical_work: "Travaux sur équipements électriques avec LOTO",
      hot_work: "Soudage, découpage, travaux générant chaleur",
      excavation: "Creusage, tranchées, travaux souterrains",
      height_work: "Travaux à plus de 3m de hauteur",
      chemical_handling: "Manipulation de substances dangereuses"
    },
    
    // États et priorités
    status: {
      required: "Requis",
      optional: "Optionnel", 
      not_applicable: "Non applicable"
    },
    
    priority: {
      high: "🔴 Critique",
      medium: "🟡 Important",
      low: "🟢 Standard"
    },
    
    // Actions
    actions: {
      addPermit: "Ajouter Permis",
      editPermit: "Modifier Permis",
      validatePermit: "Valider Permis",
      addWorker: "Ajouter Travailleur",
      addPhoto: "Ajouter Photo",
      generateQR: "Générer QR Code",
      scanWorker: "Scanner Travailleur",
      startLOTO: "Démarrer LOTO",
      completeLOTO: "Finaliser LOTO",
      viewDetails: "Voir Détails",
      download: "Télécharger",
      print: "Imprimer"
    },
    
    // Sections
    sections: {
      permitSelection: "Sélection des Permis",
      workerManagement: "Gestion des Travailleurs",
      lotoManagement: "Gestion LOTO",
      photoDocumentation: "Documentation Photo",
      validation: "Validation",
      summary: "Résumé"
    },
    
    // Gestion travailleurs
    workers: {
      totalPresent: "Présents",
      totalRequired: "Requis",
      missingCertifications: "Certifications Manquantes",
      emergencyContacts: "Contacts d'Urgence",
      checkInOut: "Pointage",
      badgeNumber: "No. Badge",
      role: "Rôle",
      certification: "Certification",
      present: "Présent",
      absent: "Absent",
      checkedIn: "Arrivé à",
      emergencyContact: "Contact d'urgence"
    },
    
    // LOTO
    loto: {
      required: "LOTO Requis",
      points: "Points de Verrouillage",
      sequence: "Séquence",
      verification: "Vérification",
      completed: "Complété",
      pending: "En attente",
      equipmentName: "Nom Équipement",
      location: "Emplacement",
      energyType: "Type Énergie",
      isolationMethod: "Méthode Isolation",
      lockNumber: "No. Cadenas",
      appliedBy: "Appliqué par",
      verified: "Vérifié",
      photoRequired: "Photo Requise"
    },
    
    // Photos
    photos: {
      mandatory: "Obligatoire",
      optional: "Optionnel",
      validated: "Validée",
      pending: "En attente",
      beforeWork: "Avant Travaux",
      duringWork: "Pendant Travaux", 
      afterWork: "Après Travaux",
      verification: "Vérification",
      isolation: "Isolation",
      completion: "Finalisation",
      gpsLocation: "Localisation GPS",
      timestamp: "Horodatage",
      description: "Description"
    },
    
    // Messages
    messages: {
      noPermitsSelected: "Aucun permis sélectionné",
      permitsIncomplete: "Permis incomplets",
      workersRequired: "Travailleurs requis manquants",
      lotoIncomplete: "Procédure LOTO incomplète",
      photosRequired: "Photos obligatoires manquantes",
      validationSuccess: "Validation réussie",
      qrGenerated: "Code QR généré",
      workerCheckedIn: "Travailleur pointé",
      allRequirementsMet: "Toutes les exigences respectées"
    },
    
    // Statistiques
    stats: {
      permitsSelected: "Permis Sélectionnés",
      workersPresent: "Travailleurs Présents",
      lotoProcedures: "Procédures LOTO",
      photosUploaded: "Photos Téléchargées",
      validationProgress: "Progression Validation"
    }
  },
  
  en: {
    title: "🛡️ Work Permit Management",
    subtitle: "Selection and validation of required permits based on work type",
    
    // Permit types
    permitTypes: {
      confined_space: "Confined Space",
      electrical_work: "Electrical Work",
      hot_work: "Hot Work", 
      excavation: "Excavation",
      height_work: "Work at Height",
      chemical_handling: "Chemical Handling"
    },
    
    permitDescriptions: {
      confined_space: "Confined spaces requiring atmospheric monitoring",
      electrical_work: "Work on electrical equipment with LOTO",
      hot_work: "Welding, cutting, heat-generating work",
      excavation: "Digging, trenching, underground work",
      height_work: "Work above 3m height",
      chemical_handling: "Handling of hazardous substances"
    },
    
    // Status and priorities
    status: {
      required: "Required",
      optional: "Optional",
      not_applicable: "Not applicable"
    },
    
    priority: {
      high: "🔴 Critical",
      medium: "🟡 Important", 
      low: "🟢 Standard"
    },
    
    // Actions
    actions: {
      addPermit: "Add Permit",
      editPermit: "Edit Permit",
      validatePermit: "Validate Permit",
      addWorker: "Add Worker",
      addPhoto: "Add Photo",
      generateQR: "Generate QR Code",
      scanWorker: "Scan Worker",
      startLOTO: "Start LOTO",
      completeLOTO: "Complete LOTO",
      viewDetails: "View Details",
      download: "Download",
      print: "Print"
    },
    
    // Sections
    sections: {
      permitSelection: "Permit Selection",
      workerManagement: "Worker Management",
      lotoManagement: "LOTO Management",
      photoDocumentation: "Photo Documentation",
      validation: "Validation",
      summary: "Summary"
    },
    
    // Worker management
    workers: {
      totalPresent: "Present",
      totalRequired: "Required",
      missingCertifications: "Missing Certifications",
      emergencyContacts: "Emergency Contacts",
      checkInOut: "Check In/Out",
      badgeNumber: "Badge No.",
      role: "Role",
      certification: "Certification",
      present: "Present",
      absent: "Absent",
      checkedIn: "Checked in at",
      emergencyContact: "Emergency contact"
    },
    
    // LOTO
    loto: {
      required: "LOTO Required",
      points: "Lockout Points",
      sequence: "Sequence",
      verification: "Verification",
      completed: "Completed",
      pending: "Pending",
      equipmentName: "Equipment Name",
      location: "Location",
      energyType: "Energy Type",
      isolationMethod: "Isolation Method",
      lockNumber: "Lock Number",
      appliedBy: "Applied by",
      verified: "Verified",
      photoRequired: "Photo Required"
    },
    
    // Photos
    photos: {
      mandatory: "Mandatory",
      optional: "Optional",
      validated: "Validated",
      pending: "Pending",
      beforeWork: "Before Work",
      duringWork: "During Work",
      afterWork: "After Work",
      verification: "Verification",
      isolation: "Isolation",
      completion: "Completion",
      gpsLocation: "GPS Location",
      timestamp: "Timestamp",
      description: "Description"
    },
    
    // Messages
    messages: {
      noPermitsSelected: "No permits selected",
      permitsIncomplete: "Incomplete permits",
      workersRequired: "Required workers missing",
      lotoIncomplete: "LOTO procedure incomplete",
      photosRequired: "Mandatory photos missing",
      validationSuccess: "Validation successful",
      qrGenerated: "QR code generated",
      workerCheckedIn: "Worker checked in",
      allRequirementsMet: "All requirements met"
    },
    
    // Statistics
    stats: {
      permitsSelected: "Permits Selected",
      workersPresent: "Workers Present",
      lotoProcedures: "LOTO Procedures",
      photosUploaded: "Photos Uploaded",
      validationProgress: "Validation Progress"
    }
  }
};

// =================== DONNÉES PAR DÉFAUT ===================

const defaultPermitData: Record<PermitType, any> = {
  confined_space: {
    atmosphericTesting: false,
    ventilationRequired: false,
    continuousMonitoring: false,
    retrieval_system: false,
    attendant_required: true,
    communication_method: '',
    emergency_procedures: ''
  },
  electrical_work: {
    voltage_level: 0,
    arc_flash_analysis: false,
    voltage_testing: false,
    loto_required: true,
    ppe_level: 0,
    qualified_person: ''
  },
  hot_work: {
    fire_watch_required: true,
    combustible_clearance: 35, // feet
    fire_extinguisher_present: false,
    cutting_welding_type: '',
    ventilation_adequate: false
  },
  excavation: {
    depth: 0,
    soil_type: '',
    shoring_required: false,
    utilities_located: false,
    slope_angle: 0,
    water_present: false
  },
  height_work: {
    height: 0,
    fall_protection: '',
    anchor_points: 0,
    rescue_plan: false,
    weather_conditions: ''
  },
  chemical_handling: {
    chemicals: [],
    sds_available: false,
    spill_kit_present: false,
    ventilation_adequate: false,
    waste_disposal_plan: ''
  }
};

const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province = 'QC'
}) => {
  // =================== ÉTATS ===================
  const t = translations[language];
  
  const [activeSection, setActiveSection] = useState('permitSelection');
  const [permits, setPermits] = useState<Permit[]>(formData.permits?.permits || []);
  const [workers, setWorkers] = useState<Worker[]>(formData.permits?.workers || []);
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // États pour les forms
  const [newWorker, setNewWorker] = useState({
    name: '',
    role: '',
    certification: '',
    emergencyContact: '',
    badgeNumber: ''
  });

  // =================== DONNÉES DE RÉFÉRENCE ===================
  const availablePermitTypes: PermitType[] = [
    'confined_space',
    'electrical_work', 
    'hot_work',
    'excavation',
    'height_work',
    'chemical_handling'
  ];

  const permitIcons: Record<PermitType, React.ComponentType<any>> = {
    confined_space: Wind,
    electrical_work: Zap,
    hot_work: Flame,
    excavation: Settings,
    height_work: AlertTriangle,
    chemical_handling: Flask
  };

  // =================== CALCULS ===================
  const selectedPermits = permits.filter(p => p.status === 'required');
  const totalWorkers = workers.length;
  const presentWorkers = workers.filter(w => w.present).length;
  const completedLOTO = permits.filter(p => p.lotoProcedure?.validated).length;
  const totalPhotos = permits.reduce((sum, p) => sum + p.photos.length, 0);
  
  const validationProgress = selectedPermits.length > 0 
    ? ((selectedPermits.filter(p => p.validatedBy).length / selectedPermits.length) * 100)
    : 0;

  // =================== HANDLERS ===================
  const handlePermitStatusChange = (permitType: PermitType, status: 'required' | 'optional' | 'not_applicable') => {
    const existingPermit = permits.find(p => p.type === permitType);
    
    if (existingPermit) {
      const updatedPermits = permits.map(p => 
        p.type === permitType ? { ...p, status } : p
      );
      setPermits(updatedPermits);
    } else if (status !== 'not_applicable') {
      const newPermit: Permit = {
        id: `permit-${permitType}-${Date.now()}`,
        type: permitType,
        title: { fr: t.permitTypes[permitType], en: translations.en.permitTypes[permitType] },
        description: { fr: t.permitDescriptions[permitType], en: translations.en.permitDescriptions[permitType] },
        status,
        priority: permitType === 'confined_space' || permitType === 'electrical_work' ? 'high' : 'medium',
        data: defaultPermitData[permitType],
        photos: [],
        workers: [],
        qrCode: generateQRCode(permitType)
      };
      setPermits([...permits, newPermit]);
    }
    
    updateFormData();
  };

  const addWorker = () => {
    if (!newWorker.name || !newWorker.role) return;
    
    const worker: Worker = {
      id: `worker-${Date.now()}`,
      name: newWorker.name,
      role: newWorker.role,
      certification: newWorker.certification ? [newWorker.certification] : [],
      present: false,
      emergencyContact: newWorker.emergencyContact,
      badgeNumber: newWorker.badgeNumber,
      qrCode: generateWorkerQR(newWorker.name)
    };
    
    setWorkers([...workers, worker]);
    setNewWorker({ name: '', role: '', certification: '', emergencyContact: '', badgeNumber: '' });
    setShowWorkerForm(false);
    updateFormData();
  };

  const checkInWorker = (workerId: string) => {
    const updatedWorkers = workers.map(w => 
      w.id === workerId 
        ? { ...w, present: !w.present, checkedInAt: w.present ? undefined : new Date().toISOString() }
        : w
    );
    setWorkers(updatedWorkers);
    updateFormData();
  };

  const generateQRCode = (permitType: PermitType): string => {
    return `${tenant}-${permitType}-${Date.now()}`;
  };

  const generateWorkerQR = (workerName: string): string => {
    return `WORKER-${tenant}-${workerName.replace(/\s+/g, '')}-${Date.now()}`;
  };

  const updateFormData = () => {
    const permitsData = {
      permits,
      workers,
      statistics: {
        selectedPermits: selectedPermits.length,
        totalWorkers,
        presentWorkers,
        completedLOTO,
        totalPhotos,
        validationProgress
      },
      lastUpdated: new Date().toISOString()
    };
    
    onDataChange('permits', permitsData);
  };

  // Mise à jour automatique
  useEffect(() => {
    updateFormData();
  }, [permits, workers]);

  // =================== RENDU ===================
  return (
    <>
      {/* Styles CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .permits-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            color: white;
            padding: 0;
          }
          
          .permits-header {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
          }
          
          .permits-title {
            color: #3b82f6;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .permits-subtitle {
            color: #1d4ed8;
            margin: 0 0 20px 0;
            font-size: 14px;
          }
          
          .permits-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-top: 20px;
          }
          
          .stat-card {
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
          
          .stat-card:hover {
            transform: translateY(-2px);
            border-color: rgba(59, 130, 246, 0.4);
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: #3b82f6;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 11px;
            color: #1d4ed8;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .section-tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 24px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 12px;
            padding: 4px;
            overflow-x: auto;
          }
          
          .section-tab {
            padding: 12px 16px;
            border-radius: 8px;
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .section-tab.active {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .section-tab:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
          }
          
          .section-content {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 16px;
            padding: 24px;
          }
          
          .permit-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 20px;
          }
          
          .permit-card {
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 16px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          
          .permit-card:hover {
            border-color: rgba(59, 130, 246, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
          }
          
          .permit-card.required {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
          }
          
          .permit-card.optional {
            border-color: #f59e0b;
            background: rgba(245, 158, 11, 0.05);
          }
          
          .permit-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .permit-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .permit-title {
            color: #e2e8f0;
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }
          
          .permit-description {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.4;
            margin: 8px 0 16px 0;
          }
          
          .permit-controls {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .permit-status-btn {
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid;
            background: none;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .permit-status-btn.required {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
          
          .permit-status-btn.optional {
            border-color: #f59e0b;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
          
          .permit-status-btn.not_applicable {
            border-color: #6b7280;
            color: #6b7280;
            background: rgba(107, 114, 128, 0.1);
          }
          
          .permit-status-btn.active {
            transform: scale(1.05);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          
          .workers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
          }
          
          .worker-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
          }
          
          .worker-card.present {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.05);
          }
          
          .worker-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }
          
          .worker-name {
            color: #e2e8f0;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          .worker-role {
            color: #94a3b8;
            font-size: 13px;
            margin: 0;
          }
          
          .worker-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .worker-status.present {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }
          
          .worker-status.absent {
            background: rgba(107, 114, 128, 0.2);
            color: #6b7280;
            border: 1px solid rgba(107, 114, 128, 0.3);
          }
          
          .worker-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .btn {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid;
            background: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
          }
          
          .btn-primary {
            border-color: #3b82f6;
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
          }
          
          .btn-primary:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-success {
            border-color: #22c55e;
            color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
          }
          
          .btn-success:hover {
            background: rgba(34, 197, 94, 0.2);
            transform: translateY(-1px);
          }
          
          .btn-warning {
            border-color: #f59e0b;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
          }
          
          .btn-danger {
            border-color: #ef4444;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
          
          .form-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          
          .form-content {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .form-grid {
            display: grid;
            gap: 16px;
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
            padding: 12px;
            background: rgba(15, 23, 42, 0.8);
            border: 2px solid rgba(100, 116, 139, 0.3);
            border-radius: 8px;
            color: #ffffff;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 20px;
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
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            transition: width 0.5s ease;
            border-radius: 4px;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .permits-stats {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .permit-grid {
              grid-template-columns: 1fr;
            }
            
            .workers-grid {
              grid-template-columns: 1fr;
            }
            
            .section-tabs {
              overflow-x: auto;
            }
            
            .form-content {
              width: 95%;
              margin: 10px;
            }
          }
        `
      }} />

      <div className="permits-container">
        {/* Header avec statistiques */}
        <div className="permits-header">
          <h2 className="permits-title">
            <Shield size={28} />
            {t.title}
          </h2>
          <p className="permits-subtitle">{t.subtitle}</p>
          
          <div className="permits-stats">
            <div className="stat-card">
              <div className="stat-value">{selectedPermits.length}</div>
              <div className="stat-label">{t.stats.permitsSelected}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{presentWorkers}/{totalWorkers}</div>
              <div className="stat-label">{t.stats.workersPresent}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{completedLOTO}</div>
              <div className="stat-label">{t.stats.lotoProcedures}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalPhotos}</div>
              <div className="stat-label">{t.stats.photosUploaded}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(validationProgress)}%</div>
              <div className="stat-label">{t.stats.validationProgress}</div>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${validationProgress}%` }}
            />
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="section-tabs">
          {[
            { id: 'permitSelection', icon: Shield, label: t.sections.permitSelection },
            { id: 'workerManagement', icon: Users, label: t.sections.workerManagement },
            { id: 'lotoManagement', icon: Lock, label: t.sections.lotoManagement },
            { id: 'photoDocumentation', icon: Camera, label: t.sections.photoDocumentation },
            { id: 'validation', icon: CheckCircle, label: t.sections.validation }
          ].map(section => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <IconComponent size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Contenu des sections */}
        <div className="section-content">
          {activeSection === 'permitSelection' && (
            <div className="permit-grid">
              {availablePermitTypes.map(permitType => {
                const IconComponent = permitIcons[permitType];
                const permit = permits.find(p => p.type === permitType);
                const status = permit?.status || 'not_applicable';
                
                return (
                  <div 
                    key={permitType}
                    className={`permit-card ${status}`}
                  >
                    <div className="permit-header">
                      <div className="permit-icon">
                        <IconComponent size={20} color="#3b82f6" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="permit-title">{t.permitTypes[permitType]}</h3>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginTop: '4px' 
                        }}>
                          <span style={{ 
                            fontSize: '11px',
                            color: status === 'required' ? '#ef4444' : status === 'optional' ? '#f59e0b' : '#6b7280',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {t.status[status]}
                          </span>
                          {permit && (
                            <span style={{
                              fontSize: '11px',
                              color: '#3b82f6',
                              fontWeight: '500'
                            }}>
                              {permit.priority === 'high' ? '🔴' : permit.priority === 'medium' ? '🟡' : '🟢'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="permit-description">
                      {t.permitDescriptions[permitType]}
                    </p>
                    
                    <div className="permit-controls">
                      {(['required', 'optional', 'not_applicable'] as const).map(statusOption => (
                        <button
                          key={statusOption}
                          className={`permit-status-btn ${statusOption} ${status === statusOption ? 'active' : ''}`}
                          onClick={() => handlePermitStatusChange(permitType, statusOption)}
                        >
                          {t.status[statusOption]}
                        </button>
                      ))}
                    </div>
                    
                    {permit && status !== 'not_applicable' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(100, 116, 139, 0.3)' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button className="btn btn-primary">
                            <FileText size={14} />
                            {t.actions.viewDetails}
                          </button>
                          <button className="btn btn-success">
                            <QrCode size={14} />
                            {t.actions.generateQR}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'workerManagement' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {t.sections.workerManagement}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowWorkerForm(true)}
                  >
                    <Plus size={16} />
                    {t.actions.addWorker}
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowQRScanner(true)}
                  >
                    <Scan size={16} />
                    {t.actions.scanWorker}
                  </button>
                </div>
              </div>
              
              <div className="workers-grid">
                {workers.map(worker => (
                  <div 
                    key={worker.id}
                    className={`worker-card ${worker.present ? 'present' : ''}`}
                  >
                    <div className="worker-header">
                      <div>
                        <h4 className="worker-name">{worker.name}</h4>
                        <p className="worker-role">{worker.role}</p>
                        {worker.badgeNumber && (
                          <p style={{ 
                            color: '#6b7280', 
                            fontSize: '12px', 
                            margin: '4px 0 0 0' 
                          }}>
                            {t.workers.badgeNumber}: {worker.badgeNumber}
                          </p>
                        )}
                      </div>
                      <div className={`worker-status ${worker.present ? 'present' : 'absent'}`}>
                        {worker.present ? t.workers.present : t.workers.absent}
                      </div>
                    </div>
                    
                    {worker.certification && worker.certification.length > 0 && (
                      <div style={{ margin: '8px 0' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#94a3b8',
                          marginRight: '8px'
                        }}>
                          {t.workers.certification}:
                        </span>
                        {worker.certification.map((cert, index) => (
                          <span 
                            key={index}
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginRight: '4px'
                            }}
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {worker.checkedInAt && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        margin: '8px 0' 
                      }}>
                        {t.workers.checkedIn} {new Date(worker.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                    
                    <div className="worker-actions">
                      <button 
                        className={`btn ${worker.present ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => checkInWorker(worker.id)}
                      >
                        <UserCheck size={14} />
                        {worker.present ? 'Check Out' : 'Check In'}
                      </button>
                      <button className="btn btn-primary">
                        <QrCode size={14} />
                        QR Code
                      </button>
                    </div>
                    
                    {worker.emergencyContact && (
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid rgba(100, 116, 139, 0.3)',
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}>
                        <Phone size={12} style={{ marginRight: '6px' }} />
                        {t.workers.emergencyContact}: {worker.emergencyContact}
                      </div>
                    )}
                  </div>
                ))}
                
                {workers.length === 0 && (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#6b7280'
                  }}>
                    <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Aucun travailleur ajouté. Cliquez sur "Ajouter Travailleur" pour commencer.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'lotoManagement' && (
            <div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t.sections.lotoManagement}
              </h3>
              
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <Lock size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                <h4 style={{ color: '#f59e0b', margin: '0 0 8px 0' }}>
                  {t.loto.required}
                </h4>
                <p style={{ color: '#d97706', margin: '0 0 16px 0', fontSize: '14px' }}>
                  La gestion LOTO avec carrousel photo sera disponible dans la prochaine mise à jour.
                </p>
                <button className="btn btn-warning">
                  <Settings size={16} />
                  {t.actions.startLOTO}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'photoDocumentation' && (
            <div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t.sections.photoDocumentation}
              </h3>
              
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <Camera size={48} style={{ color: '#22c55e', marginBottom: '16px' }} />
                <h4 style={{ color: '#22c55e', margin: '0 0 8px 0' }}>
                  {t.sections.photoDocumentation}
                </h4>
                <p style={{ color: '#16a34a', margin: '0 0 16px 0', fontSize: '14px' }}>
                  Le système de photos avec carrousel intégré sera disponible prochainement.
                </p>
                <button className="btn btn-success">
                  <Plus size={16} />
                  {t.actions.addPhoto}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'validation' && (
            <div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                {t.sections.validation}
              </h3>
              
              <div style={{ 
                background: validationProgress === 100 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${validationProgress === 100 
                  ? 'rgba(34, 197, 94, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                {validationProgress === 100 ? (
                  <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '16px' }} />
                ) : (
                  <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
                )}
                <h4 style={{ 
                  color: validationProgress === 100 ? '#22c55e' : '#ef4444', 
                  margin: '0 0 8px 0' 
                }}>
                  {validationProgress === 100 ? t.messages.allRequirementsMet : t.messages.permitsIncomplete}
                </h4>
                <p style={{ 
                  color: validationProgress === 100 ? '#16a34a' : '#dc2626', 
                  margin: '0 0 16px 0', 
                  fontSize: '14px' 
                }}>
                  Progression: {Math.round(validationProgress)}% - {selectedPermits.length} permis sélectionnés, {presentWorkers} travailleurs présents
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className="btn btn-primary">
                    <Download size={16} />
                    {t.actions.download}
                  </button>
                  <button className="btn btn-success">
                    <FileText size={16} />
                    {t.actions.print}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Formulaire Travailleur */}
        {showWorkerForm && (
          <div className="form-modal">
            <div className="form-content">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ color: '#e2e8f0', margin: 0 }}>
                  {t.actions.addWorker}
                </h3>
                <button 
                  onClick={() => setShowWorkerForm(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#9ca3af', 
                    cursor: 'pointer',
                    fontSize: '24px'
                  }}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t.workers.role}</label>
                  <input
                    type="text"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                    className="form-input"
                    placeholder="Nom complet du travailleur"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t.workers.role}</label>
                  <input
                    type="text"
                    value={newWorker.role}
                    onChange={(e) => setNewWorker({...newWorker, role: e.target.value})}
                    className="form-input"
                    placeholder="Ex: Électricien, Soudeur, Superviseur"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t.workers.certification}</label>
                  <input
                    type="text"
                    value={newWorker.certification}
                    onChange={(e) => setNewWorker({...newWorker, certification: e.target.value})}
                    className="form-input"
                    placeholder="Ex: ASP Construction, Carte CCQ"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t.workers.badgeNumber}</label>
                  <input
                    type="text"
                    value={newWorker.badgeNumber}
                    onChange={(e) => setNewWorker({...newWorker, badgeNumber: e.target.value})}
                    className="form-input"
                    placeholder="Numéro de badge ou identifiant"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t.workers.emergencyContact}</label>
                  <input
                    type="tel"
                    value={newWorker.emergencyContact}
                    onChange={(e) => setNewWorker({...newWorker, emergencyContact: e.target.value})}
                    className="form-input"
                    placeholder="Numéro d'urgence"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-primary"
                  onClick={addWorker}
                  disabled={!newWorker.name || !newWorker.role}
                >
                  <Save size={16} />
                  Ajouter
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => setShowWorkerForm(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs de validation */}
        {errors?.permits && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#f87171',
              marginBottom: '8px'
            }}>
              <AlertTriangle size={20} />
              <span style={{ fontWeight: '600' }}>{t.messages.validationErrors}</span>
            </div>
            <ul style={{ color: '#fca5a5', margin: 0, paddingLeft: '20px' }}>
              {errors.permits.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;