'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, BarChart3,
  TrendingUp, Activity, Shield, Bell, Send, MessageSquare, Hash, Star, Globe, Save,
  Unlock, Navigation, RotateCw, ZoomIn, ZoomOut, CheckCircle, Download,
  ChevronLeft, ChevronRight, Edit
} from 'lucide-react';
import LOTOPhotoCarousel from '../loto/LOTOPhotoCarousel';
import LOTONotificationSystem from '../notifications/LOTONotificationSystem';

// =================== INTERFACES ===================
interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  userId?: string;
  userRole?: 'worker' | 'supervisor' | 'manager' | 'admin';
}

interface WorkLocation {
  id: string;
  name: string;
  description: string;
  zone: string;
  building?: string;
  floor?: string;
  maxWorkers: number;
  currentWorkers: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  estimatedDuration: string;
  startTime?: string;
  endTime?: string;
  coordinates?: { lat: number; lng: number };
}

interface TeamMember {
  id: string;
  name: string;
  company: string;
  role: 'supervisor' | 'worker' | 'observer' | 'specialist';
  phoneNumber: string;
  email?: string;
  certifications: string[];
  location: string;
  signature?: string;
  signatureTimestamp?: string;
}

interface LOTOPoint {
  id: string;
  equipmentName: string;
  location: string;
  energyType: EnergyType;
  isolationMethod: string;
  lockNumber?: string;
  appliedBy?: string;
  verifiedBy?: string;
  status: LOTOStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  photos: LOTOPhoto[];
  coordinates?: Coordinates;
  notes?: string;
  timestamp?: string;
}

interface LOTOPhoto {
  id: string;
  url: string;
  thumbnail: string;
  lockState: LockState;
  photoType: PhotoType;
  timestamp: string;
  gpsLocation?: Coordinates;
  description: { fr: string; en: string };
  mandatory: boolean;
  validated: boolean;
  validatedBy?: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  deviceInfo?: string;
  cameraSettings?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    flash?: boolean;
  };
  quality: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
}

interface LOTOProcedure {
  id: string;
  points: LOTOPoint[];
  sequence: string[];
  validated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  metadata: {
    projectNumber: string;
    location: string;
    supervisor: string;
    startTime: string;
    estimatedDuration: number;
  };
}

type EnergyType = 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic' | 'thermal' | 'chemical' | 'gravitational';
type LOTOStatus = 'pending' | 'isolated' | 'verified' | 'completed' | 'removed';
type LockState = 'before_isolation' | 'during_isolation' | 'isolated' | 'verification' | 'removal' | 'completed';
type PhotoType = 'isolation' | 'verification' | 'lock_application' | 'energy_test' | 'completion' | 'incident';

interface ProjectInfo {
  // Numéro AST unique
  astNumber: string;
  
  // Client et projet
  clientName: string;
  clientRep: string;
  clientPhone: string;
  clientEmail: string;
  projectNumber: string;
  projectName: string;
  
  // Dates et planning
  startDate: string;
  endDate: string;
  estimatedDuration: string;
  
  // Localisation
  workSite: string;
  workAddress: string;
  workZone: string;
  workBuilding: string;
  workFloor: string;
  
  // Équipe
  supervisor: string;
  supervisorPhone: string;
  supervisorEmail: string;
  teamMembers: TeamMember[];
  
  // Emplacements de travail
  workLocations: WorkLocation[];
  
  // Urgence
  emergencyContact: string;
  emergencyPhone: string;
  
  // Description
  workDescription: string;
  workObjectives: string[];
  specialRequirements: string;
  
  // Météo et conditions
  weatherConditions: string;
  temperature: string;
  visibility: string;
  workingConditions: string;
  
  // LOTO - Nouveauté dans Step 1
  lotoProcedure: LOTOProcedure;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: "Informations du Projet",
    subtitle: "Détails généraux et équipe de travail",
    
    // AST
    astNumber: "Numéro AST",
    generateAst: "Générer nouveau numéro",
    astGenerated: "Numéro généré automatiquement",
    
    // Client
    clientSection: "Informations Client",
    clientName: "Nom du client",
    clientRep: "Représentant client",
    clientPhone: "Téléphone client",
    clientEmail: "Email client",
    
    // Projet
    projectSection: "Détails du Projet",
    projectNumber: "Numéro de projet",
    projectName: "Nom du projet",
    startDate: "Date de début",
    endDate: "Date de fin",
    estimatedDuration: "Durée estimée",
    
    // Localisation
    locationSection: "Localisation des Travaux",
    workSite: "Site de travail",
    workAddress: "Adresse complète",
    workZone: "Zone/Secteur",
    workBuilding: "Bâtiment",
    workFloor: "Étage",
    
    // Équipe
    teamSection: "Équipe de Travail",
    supervisor: "Superviseur",
    supervisorPhone: "Téléphone superviseur",
    supervisorEmail: "Email superviseur",
    teamMembers: "Membres de l'équipe",
    addMember: "Ajouter membre",
    removeMember: "Retirer membre",
    
    // Membre équipe
    memberName: "Nom complet",
    memberCompany: "Entreprise",
    memberRole: "Rôle",
    memberPhone: "Téléphone",
    memberEmail: "Email",
    memberCertifications: "Certifications",
    memberLocation: "Emplacement assigné",
    
    // Rôles
    roles: {
      supervisor: "Superviseur",
      worker: "Travailleur",
      observer: "Observateur",
      specialist: "Spécialiste"
    },
    
    // Emplacements
    workLocationsSection: "Emplacements de Travail",
    addLocation: "Ajouter emplacement",
    locationName: "Nom de l'emplacement",
    locationDescription: "Description",
    locationZone: "Zone",
    locationBuilding: "Bâtiment",
    locationFloor: "Étage",
    maxWorkers: "Nombre max de travailleurs",
    estimatedTime: "Temps estimé",
    locationNotes: "Notes",
    
    // Urgence
    emergencySection: "Contacts d'Urgence",
    emergencyContact: "Contact d'urgence",
    emergencyPhone: "Téléphone d'urgence",
    
    // Description
    descriptionSection: "Description des Travaux",
    workDescription: "Description détaillée",
    workObjectives: "Objectifs de travail",
    addObjective: "Ajouter objectif",
    specialRequirements: "Exigences spéciales",
    
    // Conditions
    conditionsSection: "Conditions de Travail",
    weatherConditions: "Conditions météo",
    temperature: "Température",
    visibility: "Visibilité",
    workingConditions: "Conditions générales",
    
    // LOTO
    lotoSection: "Verrouillage/Étiquetage (LOTO)",
    lotoDescription: "Procédures de sécurité énergétique",
    addLotoPoint: "Ajouter point LOTO",
    lotoEquipment: "Équipement",
    lotoLocation: "Emplacement",
    lotoEnergyType: "Type d'énergie",
    lotoIsolationMethod: "Méthode d'isolation",
    lotoLockNumber: "Numéro de cadenas",
    lotoAppliedBy: "Appliqué par",
    lotoVerifiedBy: "Vérifié par",
    lotoStatus: "Statut",
    lotoPriority: "Priorité",
    lotoNotes: "Notes",
    lotoPhotoCarousel: "Carrousel Photo LOTO",
    lotoNotifications: "Alertes aux travailleurs",
    
    // LOTO Energy Types
    energyTypes: {
      electrical: "⚡ Électrique",
      mechanical: "⚙️ Mécanique",
      hydraulic: "🔧 Hydraulique",
      pneumatic: "💨 Pneumatique",
      thermal: "🔥 Thermique",
      chemical: "🧪 Chimique",
      gravitational: "⬇️ Gravitationnelle"
    },
    
    // LOTO Statuses
    lotoStatuses: {
      pending: "En attente",
      isolated: "Isolé",
      verified: "Vérifié",
      completed: "Complété",
      removed: "Retiré"
    },
    
    // LOTO Priorities
    lotoPriorities: {
      critical: "🔴 Critique",
      high: "🟠 Élevée",
      medium: "🟡 Moyenne",
      low: "🟢 Faible"
    },
    
    // Actions
    save: "Sauvegarder",
    next: "Suivant",
    copy: "Copier",
    copied: "Copié!",
    generate: "Générer",
    delete: "Supprimer",
    edit: "Modifier",
    removeLotoPoint: "Retirer point LOTO",
    validateLoto: "Valider LOTO",
    
    // Validation
    required: "Champ requis",
    phoneFormat: "Format: 123-456-7890",
    emailFormat: "Format email valide requis",
    
    // Placeholders
    placeholders: {
      clientName: "ex: Hydro-Québec",
      projectNumber: "ex: HQ-2024-001",
      workSite: "ex: Centrale électrique Beauharnois",
      phoneNumber: "ex: 514-123-4567",
      email: "ex: contact@entreprise.com",
      duration: "ex: 8 heures",
      description: "Décrivez en détail les travaux à effectuer...",
      objective: "ex: Maintenance préventive"
    },
    
    // Onglets navigation
    tabs: {
      project: "Projet",
      loto: "LOTO"
    }
  },
  en: {
    title: "Project Information",
    subtitle: "General details and work team",
    
    // AST
    astNumber: "JSA Number",
    generateAst: "Generate new number",
    astGenerated: "Automatically generated number",
    
    // Client
    clientSection: "Client Information",
    clientName: "Client name",
    clientRep: "Client representative",
    clientPhone: "Client phone",
    clientEmail: "Client email",
    
    // Projet
    projectSection: "Project Details",
    projectNumber: "Project number",
    projectName: "Project name",
    startDate: "Start date",
    endDate: "End date",
    estimatedDuration: "Estimated duration",
    
    // Localisation
    locationSection: "Work Location",
    workSite: "Work site",
    workAddress: "Complete address",
    workZone: "Zone/Sector",
    workBuilding: "Building",
    workFloor: "Floor",
    
    // Équipe
    teamSection: "Work Team",
    supervisor: "Supervisor",
    supervisorPhone: "Supervisor phone",
    supervisorEmail: "Supervisor email",
    teamMembers: "Team members",
    addMember: "Add member",
    removeMember: "Remove member",
    
    // Membre équipe
    memberName: "Full name",
    memberCompany: "Company",
    memberRole: "Role",
    memberPhone: "Phone",
    memberEmail: "Email",
    memberCertifications: "Certifications",
    memberLocation: "Assigned location",
    
    // Rôles
    roles: {
      supervisor: "Supervisor",
      worker: "Worker",
      observer: "Observer",
      specialist: "Specialist"
    },
    
    // Emplacements
    workLocationsSection: "Work Locations",
    addLocation: "Add location",
    locationName: "Location name",
    locationDescription: "Description",
    locationZone: "Zone",
    locationBuilding: "Building",
    locationFloor: "Floor",
    maxWorkers: "Max workers",
    estimatedTime: "Estimated time",
    locationNotes: "Notes",
    
    // Urgence
    emergencySection: "Emergency Contacts",
    emergencyContact: "Emergency contact",
    emergencyPhone: "Emergency phone",
    
    // Description
    descriptionSection: "Work Description",
    workDescription: "Detailed description",
    workObjectives: "Work objectives",
    addObjective: "Add objective",
    specialRequirements: "Special requirements",
    
    // Conditions
    conditionsSection: "Working Conditions",
    weatherConditions: "Weather conditions",
    temperature: "Temperature",
    visibility: "Visibility",
    workingConditions: "General conditions",
    
    // LOTO
    lotoSection: "Lockout/Tagout (LOTO)",
    lotoDescription: "Energy safety procedures",
    addLotoPoint: "Add LOTO point",
    lotoEquipment: "Equipment",
    lotoLocation: "Location",
    lotoEnergyType: "Energy type",
    lotoIsolationMethod: "Isolation method",
    lotoLockNumber: "Lock number",
    lotoAppliedBy: "Applied by",
    lotoVerifiedBy: "Verified by",
    lotoStatus: "Status",
    lotoPriority: "Priority",
    lotoNotes: "Notes",
    lotoPhotoCarousel: "LOTO Photo Carousel",
    lotoNotifications: "Worker alerts",
    
    // LOTO Energy Types
    energyTypes: {
      electrical: "⚡ Electrical",
      mechanical: "⚙️ Mechanical",
      hydraulic: "🔧 Hydraulic",
      pneumatic: "💨 Pneumatic",
      thermal: "🔥 Thermal",
      chemical: "🧪 Chemical",
      gravitational: "⬇️ Gravitational"
    },
    
    // LOTO Statuses
    lotoStatuses: {
      pending: "Pending",
      isolated: "Isolated",
      verified: "Verified",
      completed: "Completed",
      removed: "Removed"
    },
    
    // LOTO Priorities
    lotoPriorities: {
      critical: "🔴 Critical",
      high: "🟠 High",
      medium: "🟡 Medium",
      low: "🟢 Low"
    },
    
    // Actions
    save: "Save",
    next: "Next",
    copy: "Copy",
    copied: "Copied!",
    generate: "Generate",
    delete: "Delete",
    edit: "Edit",
    removeLotoPoint: "Remove LOTO point",
    validateLoto: "Validate LOTO",
    
    // Validation
    required: "Required field",
    phoneFormat: "Format: 123-456-7890",
    emailFormat: "Valid email format required",
    
    // Placeholders
    placeholders: {
      clientName: "e.g: Hydro-Quebec",
      projectNumber: "e.g: HQ-2024-001",
      workSite: "e.g: Beauharnois Power Station",
      phoneNumber: "e.g: 514-123-4567",
      email: "e.g: contact@company.com",
      duration: "e.g: 8 hours",
      description: "Describe in detail the work to be performed...",
      objective: "e.g: Preventive maintenance"
    },
    
    // Onglets navigation
    tabs: {
      project: "Project",
      loto: "LOTO"
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step1ProjectInfo = memo(({ 
  formData, 
  onDataChange, 
  language = 'fr', 
  tenant,
  errors = {},
  userId,
  userRole = 'worker'
}: Step1ProjectInfoProps) => {
  const t = translations[language];
  const [localData, setLocalData] = useState<ProjectInfo>(() => ({
    // Initialisation avec données existantes ou valeurs par défaut
    astNumber: formData?.projectInfo?.astNumber || '',
    clientName: formData?.projectInfo?.clientName || '',
    clientRep: formData?.projectInfo?.clientRep || '',
    clientPhone: formData?.projectInfo?.clientPhone || '',
    clientEmail: formData?.projectInfo?.clientEmail || '',
    projectNumber: formData?.projectInfo?.projectNumber || '',
    projectName: formData?.projectInfo?.projectName || '',
    startDate: formData?.projectInfo?.startDate || '',
    endDate: formData?.projectInfo?.endDate || '',
    estimatedDuration: formData?.projectInfo?.estimatedDuration || '',
    workSite: formData?.projectInfo?.workSite || '',
    workAddress: formData?.projectInfo?.workAddress || '',
    workZone: formData?.projectInfo?.workZone || '',
    workBuilding: formData?.projectInfo?.workBuilding || '',
    workFloor: formData?.projectInfo?.workFloor || '',
    supervisor: formData?.projectInfo?.supervisor || '',
    supervisorPhone: formData?.projectInfo?.supervisorPhone || '',
    supervisorEmail: formData?.projectInfo?.supervisorEmail || '',
    teamMembers: formData?.projectInfo?.teamMembers || [],
    workLocations: formData?.projectInfo?.workLocations || [],
    emergencyContact: formData?.projectInfo?.emergencyContact || '',
    emergencyPhone: formData?.projectInfo?.emergencyPhone || '',
    workDescription: formData?.projectInfo?.workDescription || '',
    workObjectives: formData?.projectInfo?.workObjectives || [],
    specialRequirements: formData?.projectInfo?.specialRequirements || '',
    weatherConditions: formData?.projectInfo?.weatherConditions || '',
    temperature: formData?.projectInfo?.temperature || '',
    visibility: formData?.projectInfo?.visibility || '',
    workingConditions: formData?.projectInfo?.workingConditions || '',
    // LOTO - Nouveau dans Step 1
    lotoProcedure: formData?.projectInfo?.lotoProcedure || {
      id: `loto_${Date.now()}`,
      points: [],
      sequence: [],
      validated: false,
      metadata: {
        projectNumber: formData?.projectInfo?.projectNumber || '',
        location: formData?.projectInfo?.workSite || '',
        supervisor: formData?.projectInfo?.supervisor || '',
        startTime: new Date().toISOString(),
        estimatedDuration: 8
      }
    }
  }));

  const [copied, setCopied] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [showLotoSection, setShowLotoSection] = useState(false);
  const [newLotoPoint, setNewLotoPoint] = useState<Partial<LOTOPoint>>({});
  const [editingLotoPoint, setEditingLotoPoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'project' | 'loto'>('project');
  const debounceRef = useRef<NodeJS.Timeout>();
  const stableFormDataRef = useRef(localData);

  // Générer numéro AST unique
  const generateASTNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(Date.now()).slice(-4);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const astNumber = `AST-${year}${month}${day}-${time}-${random}`;
    
    updateField('astNumber', astNumber);
  }, []);

  // Copier numéro AST
  const copyASTNumber = useCallback(async () => {
    if (localData.astNumber) {
      try {
        await navigator.clipboard.writeText(localData.astNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erreur copie:', error);
      }
    }
  }, [localData.astNumber]);

  // Mise à jour de champ avec debounce
  const updateField = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      stableFormDataRef.current = updated;
      return updated;
    });
    
    // Debounce pour éviter trop d'appels
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onDataChange('projectInfo', stableFormDataRef.current);
    }, 300);
  }, [onDataChange]);

  // Ajouter membre d'équipe
  const addTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      company: '',
      role: 'worker',
      phoneNumber: '',
      email: '',
      certifications: [],
      location: ''
    };
    
    updateField('teamMembers', [...localData.teamMembers, newMember]);
  }, [localData.teamMembers, updateField]);

  // Supprimer membre d'équipe
  const removeTeamMember = useCallback((memberId: string) => {
    updateField('teamMembers', localData.teamMembers.filter(m => m.id !== memberId));
  }, [localData.teamMembers, updateField]);

  // Mettre à jour membre d'équipe
  const updateTeamMember = useCallback((memberId: string, field: string, value: any) => {
    const updatedMembers = localData.teamMembers.map(member =>
      member.id === memberId ? { ...member, [field]: value } : member
    );
    updateField('teamMembers', updatedMembers);
  }, [localData.teamMembers, updateField]);

  // Ajouter emplacement de travail
  const addWorkLocation = useCallback(() => {
    const newLocation: WorkLocation = {
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      zone: '',
      building: '',
      floor: '',
      maxWorkers: 1,
      currentWorkers: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: '',
      estimatedDuration: ''
    };
    
    updateField('workLocations', [...localData.workLocations, newLocation]);
  }, [localData.workLocations, updateField]);

  // Supprimer emplacement
  const removeWorkLocation = useCallback((locationId: string) => {
    updateField('workLocations', localData.workLocations.filter(l => l.id !== locationId));
  }, [localData.workLocations, updateField]);

  // Mettre à jour emplacement
  const updateWorkLocation = useCallback((locationId: string, field: string, value: any) => {
    const updatedLocations = localData.workLocations.map(location =>
      location.id === locationId ? { ...location, [field]: value } : location
    );
    updateField('workLocations', updatedLocations);
  }, [localData.workLocations, updateField]);

  // Ajouter objectif
  const addObjective = useCallback(() => {
    if (newObjective.trim()) {
      updateField('workObjectives', [...localData.workObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  }, [newObjective, localData.workObjectives, updateField]);

  // Supprimer objectif
  const removeObjective = useCallback((index: number) => {
    updateField('workObjectives', localData.workObjectives.filter((_, i) => i !== index));
  }, [localData.workObjectives, updateField]);

  // =================== FONCTIONS LOTO ===================
  
  // Ajouter point LOTO
  const addLotoPoint = useCallback(() => {
    if (!newLotoPoint.equipmentName || !newLotoPoint.energyType) return;
    
    const lotoPoint: LOTOPoint = {
      id: `loto_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      equipmentName: newLotoPoint.equipmentName,
      location: newLotoPoint.location || localData.workSite,
      energyType: newLotoPoint.energyType as EnergyType,
      isolationMethod: newLotoPoint.isolationMethod || '',
      lockNumber: newLotoPoint.lockNumber || '',
      appliedBy: newLotoPoint.appliedBy || localData.supervisor,
      verifiedBy: newLotoPoint.verifiedBy || '',
      status: 'pending',
      priority: newLotoPoint.priority || 'medium',
      photos: [],
      notes: newLotoPoint.notes || '',
      timestamp: new Date().toISOString()
    };
    
    const updatedProcedure = {
      ...localData.lotoProcedure,
      points: [...localData.lotoProcedure.points, lotoPoint],
      sequence: [...localData.lotoProcedure.sequence, lotoPoint.id]
    };
    
    updateField('lotoProcedure', updatedProcedure);
    setNewLotoPoint({});
  }, [newLotoPoint, localData.workSite, localData.supervisor, localData.lotoProcedure, updateField]);
  
  // Supprimer point LOTO
  const removeLotoPoint = useCallback((pointId: string) => {
    const updatedProcedure = {
      ...localData.lotoProcedure,
      points: localData.lotoProcedure.points.filter(p => p.id !== pointId),
      sequence: localData.lotoProcedure.sequence.filter(id => id !== pointId)
    };
    
    updateField('lotoProcedure', updatedProcedure);
  }, [localData.lotoProcedure, updateField]);
  
  // Mettre à jour point LOTO
  const updateLotoPoint = useCallback((pointId: string, field: string, value: any) => {
    const updatedPoints = localData.lotoProcedure.points.map(point =>
      point.id === pointId ? { ...point, [field]: value } : point
    );
    
    const updatedProcedure = {
      ...localData.lotoProcedure,
      points: updatedPoints
    };
    
    updateField('lotoProcedure', updatedProcedure);
  }, [localData.lotoProcedure, updateField]);
  
  // Gérer mise à jour procédure LOTO depuis le carrousel
  const handleLotoProcedureUpdate = useCallback((procedure: LOTOProcedure) => {
    updateField('lotoProcedure', procedure);
  }, [updateField]);
  
  // Gérer notification LOTO
  const handleLotoNotification = useCallback((pointId: string) => {
    console.log('Notification LOTO envoyée pour le point:', pointId);
    // La notification sera gérée par le composant LOTONotificationSystem
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Styles communs
  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(100, 116, 139, 0.3)',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid rgba(100, 116, 139, 0.3)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t.title}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>
              {t.subtitle}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onDataChange('projectInfo', localData)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              {t.save}
            </button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div style={{
          display: 'flex',
          marginBottom: '24px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '12px',
          padding: '6px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          {(['project', 'loto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'transparent',
                color: activeTab === tab ? 'white' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {tab === 'project' && <Building size={16} />}
              {tab === 'loto' && <Lock size={16} />}
              {t.tabs[tab]}
              {tab === 'loto' && localData.lotoProcedure.points.length > 0 && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px'
                }}>
                  {localData.lotoProcedure.points.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Numéro AST */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Hash size={20} style={{ color: '#10b981' }} />
            {t.astNumber}
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={localData.astNumber}
              readOnly
              style={{
                ...inputStyle,
                flex: 1,
                background: 'rgba(15, 23, 42, 0.5)',
                cursor: 'default'
              }}
              placeholder={t.astGenerated}
            />
            
            <button
              onClick={generateASTNumber}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Star size={16} />
              {t.generate}
            </button>
            
            {localData.astNumber && (
              <button
                onClick={copyASTNumber}
                style={{
                  background: copied ? '#10b981' : 'rgba(100, 116, 139, 0.2)',
                  color: copied ? 'white' : '#94a3b8',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.copied : t.copy}
              </button>
            )}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'project' && (
          <>
        {/* Grid principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Informations Client */}
          <div style={cardStyle}>
            <h3 style={{
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building size={20} style={{ color: '#3b82f6' }} />
              {t.clientSection}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t.clientName} *</label>
                <input
                  type="text"
                  value={localData.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.clientName}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.clientRep}</label>
                <input
                  type="text"
                  value={localData.clientRep}
                  onChange={(e) => updateField('clientRep', e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.clientPhone}</label>
                  <input
                    type="tel"
                    value={localData.clientPhone}
                    onChange={(e) => updateField('clientPhone', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.phoneNumber}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.clientEmail}</label>
                  <input
                    type="email"
                    value={localData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.email}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Détails du Projet */}
          <div style={cardStyle}>
            <h3 style={{
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText size={20} style={{ color: '#8b5cf6' }} />
              {t.projectSection}
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.projectNumber} *</label>
                  <input
                    type="text"
                    value={localData.projectNumber}
                    onChange={(e) => updateField('projectNumber', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.projectNumber}
                    required
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.estimatedDuration}</label>
                  <input
                    type="text"
                    value={localData.estimatedDuration}
                    onChange={(e) => updateField('estimatedDuration', e.target.value)}
                    style={inputStyle}
                    placeholder={t.placeholders.duration}
                  />
                </div>
              </div>
              
              <div>
                <label style={labelStyle}>{t.projectName}</label>
                <input
                  type="text"
                  value={localData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t.startDate} *</label>
                  <input
                    type="date"
                    value={localData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>{t.endDate}</label>
                  <input
                    type="date"
                    value={localData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Localisation des Travaux */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={20} style={{ color: '#f59e0b' }} />
            {t.locationSection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.workSite} *</label>
              <input
                type="text"
                value={localData.workSite}
                onChange={(e) => updateField('workSite', e.target.value)}
                style={inputStyle}
                placeholder={t.placeholders.workSite}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workAddress}</label>
              <input
                type="text"
                value={localData.workAddress}
                onChange={(e) => updateField('workAddress', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workZone}</label>
              <input
                type="text"
                value={localData.workZone}
                onChange={(e) => updateField('workZone', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workBuilding}</label>
              <input
                type="text"
                value={localData.workBuilding}
                onChange={(e) => updateField('workBuilding', e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workFloor}</label>
              <input
                type="text"
                value={localData.workFloor}
                onChange={(e) => updateField('workFloor', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Équipe de Travail */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={20} style={{ color: '#10b981' }} />
              {t.teamSection}
            </h3>
            
            <button
              onClick={addTeamMember}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Plus size={16} />
              {t.addMember}
            </button>
          </div>
          
          {/* Superviseur */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#10b981' }}>{t.supervisor}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <label style={labelStyle}>{t.supervisor} *</label>
                <input
                  type="text"
                  value={localData.supervisor}
                  onChange={(e) => updateField('supervisor', e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.supervisorPhone}</label>
                <input
                  type="tel"
                  value={localData.supervisorPhone}
                  onChange={(e) => updateField('supervisorPhone', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.phoneNumber}
                />
              </div>
              
              <div>
                <label style={labelStyle}>{t.supervisorEmail}</label>
                <input
                  type="email"
                  value={localData.supervisorEmail}
                  onChange={(e) => updateField('supervisorEmail', e.target.value)}
                  style={inputStyle}
                  placeholder={t.placeholders.email}
                />
              </div>
            </div>
          </div>
          
          {/* Membres de l'équipe */}
          {localData.teamMembers.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {localData.teamMembers.map((member, index) => (
                <div key={member.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: '#e2e8f0' }}>
                      Membre {index + 1}
                    </h5>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={labelStyle}>{t.memberName} *</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberCompany}</label>
                      <input
                        type="text"
                        value={member.company}
                        onChange={(e) => updateTeamMember(member.id, 'company', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberRole}</label>
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="worker">{t.roles.worker}</option>
                        <option value="supervisor">{t.roles.supervisor}</option>
                        <option value="observer">{t.roles.observer}</option>
                        <option value="specialist">{t.roles.specialist}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberPhone}</label>
                      <input
                        type="tel"
                        value={member.phoneNumber}
                        onChange={(e) => updateTeamMember(member.id, 'phoneNumber', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.phoneNumber}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberEmail}</label>
                      <input
                        type="email"
                        value={member.email || ''}
                        onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.email}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.memberLocation}</label>
                      <select
                        value={member.location}
                        onChange={(e) => updateTeamMember(member.id, 'location', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Sélectionner...</option>
                        {localData.workLocations.map(location => (
                          <option key={location.id} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emplacements de Travail */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={20} style={{ color: '#ef4444' }} />
              {t.workLocationsSection}
            </h3>
            
            <button
              onClick={addWorkLocation}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Plus size={16} />
              {t.addLocation}
            </button>
          </div>
          
          {localData.workLocations.length > 0 && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {localData.workLocations.map((location, index) => (
                <div key={location.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: '#e2e8f0' }}>
                      Emplacement {index + 1}
                    </h5>
                    <button
                      onClick={() => removeWorkLocation(location.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={labelStyle}>{t.locationName} *</label>
                      <input
                        type="text"
                        value={location.name}
                        onChange={(e) => updateWorkLocation(location.id, 'name', e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.locationZone}</label>
                      <input
                        type="text"
                        value={location.zone}
                        onChange={(e) => updateWorkLocation(location.id, 'zone', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.maxWorkers}</label>
                      <input
                        type="number"
                        min="1"
                        value={location.maxWorkers}
                        onChange={(e) => updateWorkLocation(location.id, 'maxWorkers', parseInt(e.target.value) || 1)}
                        style={inputStyle}
                      />
                    </div>
                    
                    <div>
                      <label style={labelStyle}>{t.estimatedTime}</label>
                      <input
                        type="text"
                        value={location.estimatedDuration}
                        onChange={(e) => updateWorkLocation(location.id, 'estimatedDuration', e.target.value)}
                        style={inputStyle}
                        placeholder={t.placeholders.duration}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>{t.locationDescription}</label>
                      <textarea
                        value={location.description}
                        onChange={(e) => updateWorkLocation(location.id, 'description', e.target.value)}
                        style={{
                          ...inputStyle,
                          minHeight: '60px',
                          resize: 'vertical'
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts d'Urgence */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Phone size={20} style={{ color: '#dc2626' }} />
            {t.emergencySection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.emergencyContact} *</label>
              <input
                type="text"
                value={localData.emergencyContact}
                onChange={(e) => updateField('emergencyContact', e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.emergencyPhone} *</label>
              <input
                type="tel"
                value={localData.emergencyPhone}
                onChange={(e) => updateField('emergencyPhone', e.target.value)}
                style={inputStyle}
                placeholder={t.placeholders.phoneNumber}
                required
              />
            </div>
          </div>
        </div>

        {/* Description des Travaux */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={20} style={{ color: '#8b5cf6' }} />
            {t.descriptionSection}
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t.workDescription} *</label>
              <textarea
                value={localData.workDescription}
                onChange={(e) => updateField('workDescription', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                placeholder={t.placeholders.description}
                rows={5}
                required
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.workObjectives}</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={t.placeholders.objective}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addObjective();
                    }
                  }}
                />
                <button
                  onClick={addObjective}
                  disabled={!newObjective.trim()}
                  style={{
                    background: newObjective.trim() ? 
                      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 
                      'rgba(100, 116, 139, 0.3)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: newObjective.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  {t.addObjective}
                </button>
              </div>
              
              {localData.workObjectives.length > 0 && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {localData.workObjectives.map((objective, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <span style={{ color: '#e2e8f0' }}>{objective}</span>
                      <button
                        onClick={() => removeObjective(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '4px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label style={labelStyle}>{t.specialRequirements}</label>
              <textarea
                value={localData.specialRequirements}
                onChange={(e) => updateField('specialRequirements', e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Carrousel Info Divers - Documents et photos du projet */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Camera size={20} style={{ color: '#8b5cf6' }} />
            Documentation du Projet
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* AST Client */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '2px dashed rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FileText size={32} style={{ color: '#8b5cf6' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '4px' }}>
                    AST Client
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Cliquer pour ajouter
                  </div>
                </div>
              </div>
            </div>

            {/* Fiche de Verrouillage Client */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px dashed rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Lock size={32} style={{ color: '#ef4444' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                    Fiche Verrouillage Client
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Cliquer pour ajouter
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Diverses */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '2px dashed rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Camera size={32} style={{ color: '#06b6d4' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#06b6d4', marginBottom: '4px' }}>
                    Photos Diverses
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Site, équipements, conditions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zone d'affichage des documents ajoutés */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Eye size={16} style={{ color: '#94a3b8' }} />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                Documents ajoutés (0)
              </span>
            </div>
            <div style={{
              color: '#64748b',
              fontSize: '14px',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px'
            }}>
              Aucun document ajouté pour le moment
            </div>
          </div>
        </div>

        {/* Conditions de Travail */}
        <div style={cardStyle}>
          <h3 style={{
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Globe size={20} style={{ color: '#06b6d4' }} />
            {t.conditionsSection}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={labelStyle}>{t.weatherConditions}</label>
              <select
                value={localData.weatherConditions}
                onChange={(e) => updateField('weatherConditions', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="sunny">Ensoleillé</option>
                <option value="cloudy">Nuageux</option>
                <option value="rainy">Pluvieux</option>
                <option value="snowy">Neigeux</option>
                <option value="windy">Venteux</option>
                <option value="foggy">Brouillard</option>
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>{t.temperature}</label>
              <input
                type="text"
                value={localData.temperature}
                onChange={(e) => updateField('temperature', e.target.value)}
                style={inputStyle}
                placeholder="ex: 15°C"
              />
            </div>
            
            <div>
              <label style={labelStyle}>{t.visibility}</label>
              <select
                value={localData.visibility}
                onChange={(e) => updateField('visibility', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="excellent">Excellente</option>
                <option value="good">Bonne</option>
                <option value="moderate">Modérée</option>
                <option value="poor">Faible</option>
                <option value="very-poor">Très faible</option>
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>{t.workingConditions}</label>
              <select
                value={localData.workingConditions}
                onChange={(e) => updateField('workingConditions', e.target.value)}
                style={inputStyle}
              >
                <option value="">Sélectionner...</option>
                <option value="normal">Normales</option>
                <option value="difficult">Difficiles</option>
                <option value="extreme">Extrêmes</option>
                <option value="hazardous">Dangereuses</option>
              </select>
            </div>
          </div>
        </div>
          </>
        )}


        {/* Onglet LOTO */}
        {activeTab === 'loto' && (
          <>
        {/* Section LOTO - Maintenant dans Step 1 */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Lock size={20} style={{ color: '#ef4444' }} />
                {t.lotoSection}
              </h3>
              <p style={{ 
                margin: 0, 
                color: '#94a3b8', 
                fontSize: '14px' 
              }}>
                {t.lotoDescription}
              </p>
            </div>
            
            <button
              onClick={() => setShowLotoSection(!showLotoSection)}
              style={{
                background: showLotoSection 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Lock size={16} />
              {showLotoSection ? 'Masquer LOTO' : 'Configurer LOTO'}
            </button>
          </div>
          
          {/* Statistiques LOTO */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: showLotoSection ? '24px' : '0'
          }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#ef4444',
                marginBottom: '4px'
              }}>
                {localData.lotoProcedure.points.length}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#dc2626',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Points LOTO
              </div>
            </div>
            
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#22c55e',
                marginBottom: '4px'
              }}>
                {localData.lotoProcedure.points.filter(p => p.status === 'completed').length}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#16a34a',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Complétés
              </div>
            </div>
            
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#f59e0b',
                marginBottom: '4px'
              }}>
                {localData.lotoProcedure.points.reduce((sum, point) => sum + point.photos.length, 0)}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#d97706',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Photos
              </div>
            </div>
          </div>
          
          {/* Configuration LOTO */}
          {showLotoSection && (
            <div>
              {/* Formulaire nouveau point LOTO */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Plus size={16} />
                  {t.addLotoPoint}
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={labelStyle}>{t.lotoEquipment} *</label>
                    <input
                      type="text"
                      value={newLotoPoint.equipmentName || ''}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, equipmentName: e.target.value }))}
                      style={inputStyle}
                      placeholder="ex: Disjoncteur principal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>{t.lotoEnergyType} *</label>
                    <select
                      value={newLotoPoint.energyType || ''}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, energyType: e.target.value as EnergyType }))}
                      style={inputStyle}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="electrical">{t.energyTypes.electrical}</option>
                      <option value="mechanical">{t.energyTypes.mechanical}</option>
                      <option value="hydraulic">{t.energyTypes.hydraulic}</option>
                      <option value="pneumatic">{t.energyTypes.pneumatic}</option>
                      <option value="thermal">{t.energyTypes.thermal}</option>
                      <option value="chemical">{t.energyTypes.chemical}</option>
                      <option value="gravitational">{t.energyTypes.gravitational}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={labelStyle}>{t.lotoLocation}</label>
                    <input
                      type="text"
                      value={newLotoPoint.location || localData.workSite}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, location: e.target.value }))}
                      style={inputStyle}
                      placeholder={localData.workSite || "Emplacement"}
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>{t.lotoPriority}</label>
                    <select
                      value={newLotoPoint.priority || 'medium'}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, priority: e.target.value as 'critical' | 'high' | 'medium' | 'low' }))}
                      style={inputStyle}
                    >
                      <option value="critical">{t.lotoPriorities.critical}</option>
                      <option value="high">{t.lotoPriorities.high}</option>
                      <option value="medium">{t.lotoPriorities.medium}</option>
                      <option value="low">{t.lotoPriorities.low}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={labelStyle}>{t.lotoIsolationMethod}</label>
                    <input
                      type="text"
                      value={newLotoPoint.isolationMethod || ''}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, isolationMethod: e.target.value }))}
                      style={inputStyle}
                      placeholder="ex: Coupure disjoncteur"
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>{t.lotoLockNumber}</label>
                    <input
                      type="text"
                      value={newLotoPoint.lockNumber || ''}
                      onChange={(e) => setNewLotoPoint(prev => ({ ...prev, lockNumber: e.target.value }))}
                      style={inputStyle}
                      placeholder="ex: LOT-001"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>{t.lotoNotes}</label>
                  <textarea
                    value={newLotoPoint.notes || ''}
                    onChange={(e) => setNewLotoPoint(prev => ({ ...prev, notes: e.target.value }))}
                    style={{
                      ...inputStyle,
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Instructions spéciales, précautions..."
                    rows={2}
                  />
                </div>
                
                <button
                  onClick={addLotoPoint}
                  disabled={!newLotoPoint.equipmentName || !newLotoPoint.energyType}
                  style={{
                    background: (newLotoPoint.equipmentName && newLotoPoint.energyType) 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'rgba(100, 116, 139, 0.3)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: (newLotoPoint.equipmentName && newLotoPoint.energyType) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <Plus size={16} />
                  {t.addLotoPoint}
                </button>
              </div>
              
              {/* Liste des points LOTO */}
              {localData.lotoProcedure.points.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Lock size={16} />
                    Points LOTO configurés ({localData.lotoProcedure.points.length})
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {localData.lotoProcedure.points.map((point, index) => (
                      <div key={point.id} style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <h5 style={{ 
                              margin: '0 0 4px 0', 
                              color: '#e2e8f0',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {point.equipmentName}
                            </h5>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <MapPin size={12} />
                                {point.location}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: '#94a3b8'
                              }}>
                                {t.energyTypes[point.energyType]}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                color: point.priority === 'critical' ? '#ef4444' : 
                                       point.priority === 'high' ? '#f59e0b' : 
                                       point.priority === 'medium' ? '#3b82f6' : '#22c55e',
                                fontWeight: '600'
                              }}>
                                {t.lotoPriorities[point.priority]}
                              </span>
                              <span style={{
                                fontSize: '12px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: point.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                           point.status === 'verified' ? 'rgba(59, 130, 246, 0.2)' :
                                           point.status === 'isolated' ? 'rgba(245, 158, 11, 0.2)' :
                                           'rgba(107, 114, 128, 0.2)',
                                color: point.status === 'completed' ? '#22c55e' :
                                       point.status === 'verified' ? '#3b82f6' :
                                       point.status === 'isolated' ? '#f59e0b' :
                                       '#6b7280',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {t.lotoStatuses[point.status]}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeLotoPoint(point.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              padding: '6px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {point.notes && (
                          <div style={{
                            background: 'rgba(100, 116, 139, 0.1)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            marginTop: '8px'
                          }}>
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Notes: </span>
                            <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{point.notes}</span>
                          </div>
                        )}
                        
                        {point.photos.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ 
                              color: '#94a3b8', 
                              fontSize: '12px',
                              marginBottom: '6px'
                            }}>
                              Photos: {point.photos.length} • Validées: {point.photos.filter(p => p.validated).length}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {point.photos.slice(0, 4).map(photo => (
                                <img
                                  key={photo.id}
                                  src={photo.thumbnail}
                                  alt={photo.description[language]}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    objectFit: 'cover',
                                    border: photo.validated ? '1px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)'
                                  }}
                                />
                              ))}
                              {point.photos.length > 4 && (
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: 'rgba(100, 116, 139, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  color: '#94a3b8',
                                  fontWeight: '600'
                                }}>
                                  +{point.photos.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Carrousel Photo LOTO */}
              {localData.lotoProcedure.points.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <LOTOPhotoCarousel
                    lotoProcedure={localData.lotoProcedure}
                    onUpdateProcedure={handleLotoProcedureUpdate}
                    language={language}
                    editable={true}
                    compactMode={true}
                    maxPhotosPerPoint={10}
                  />
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          padding: '24px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#94a3b8' }} />
            <span style={{ color: '#94a3b8' }}>Étape 1 sur 5</span>
            {localData.lotoProcedure.points.length > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                marginLeft: '12px',
                padding: '4px 8px',
                background: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '12px'
              }}>
                <Lock size={12} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                  {localData.lotoProcedure.points.length} point{localData.lotoProcedure.points.length > 1 ? 's' : ''} LOTO
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              // Sauvegarder avant de passer à l'étape suivante
              onDataChange('projectInfo', localData);
              // Logique pour passer à l'étape suivante
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {t.next}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Système de notification LOTO - Positionné de manière fixe */}
      {localData.lotoProcedure.points.length > 0 && (
        <LOTONotificationSystem
          lockoutPoints={localData.lotoProcedure.points.map(point => ({
            id: point.id,
            equipmentName: point.equipmentName,
            location: point.location,
            energyType: t.energyTypes[point.energyType]
          }))}
          projectNumber={localData.astNumber || localData.projectNumber}
          language={language}
          onNotificationSent={handleLotoNotification}
        />
      )}
    </div>
  );
});

Step1ProjectInfo.displayName = 'Step1ProjectInfo';

export default Step1ProjectInfo;