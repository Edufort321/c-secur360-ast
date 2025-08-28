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
import Header from '../ui/Header';

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
  
  // Photos et documentation du projet
  photos?: string[];
  astClientFiles?: string[];
  lockoutClientFiles?: string[];
  
  // Système LOTO complet
  lockoutPoints?: any[];
  lockoutPhotos?: any[];
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
    // Photos et documentation du projet
    photos: formData?.projectInfo?.photos || [],
    astClientFiles: formData?.projectInfo?.astClientFiles || [],
    lockoutClientFiles: formData?.projectInfo?.lockoutClientFiles || [],
    // Système LOTO complet
    lockoutPoints: formData?.projectInfo?.lockoutPoints || [],
    lockoutPhotos: formData?.projectInfo?.lockoutPhotos || [],
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Gestion des photos du projet
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentPhotos = localData.photos || [];
    const newPhotos: string[] = [];
    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPhotos.push(result);
        loadedCount++;
        
        if (loadedCount === totalFiles) {
          updateField('photos', [...currentPhotos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }, [localData.photos, updateField]);

  const removePhoto = useCallback((index: number) => {
    const updatedPhotos = (localData.photos || []).filter((_, i) => i !== index);
    updateField('photos', updatedPhotos);
  }, [localData.photos, updateField]);

  // Gestion des fichiers AST Client
  const handleASTClientUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentFiles = localData.astClientFiles || [];
    const newFiles: string[] = [];
    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newFiles.push(result);
        loadedCount++;
        
        if (loadedCount === totalFiles) {
          updateField('astClientFiles', [...currentFiles, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }, [localData.astClientFiles, updateField]);

  const removeASTClientFile = useCallback((index: number) => {
    const updatedFiles = (localData.astClientFiles || []).filter((_, i) => i !== index);
    updateField('astClientFiles', updatedFiles);
  }, [localData.astClientFiles, updateField]);

  // Gestion des fichiers Fiche Verrouillage Client
  const handleLockoutClientUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentFiles = localData.lockoutClientFiles || [];
    const newFiles: string[] = [];
    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newFiles.push(result);
        loadedCount++;
        
        if (loadedCount === totalFiles) {
          updateField('lockoutClientFiles', [...currentFiles, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }, [localData.lockoutClientFiles, updateField]);

  const removeLockoutClientFile = useCallback((index: number) => {
    const updatedFiles = (localData.lockoutClientFiles || []).filter((_, i) => i !== index);
    updateField('lockoutClientFiles', updatedFiles);
  }, [localData.lockoutClientFiles, updateField]);

  // =================== CONSTANTES LOTO ===================
  const ENERGY_TYPES = useMemo(() => ({
    electrical: { 
      name: language === 'fr' ? 'Électrique' : 'Electrical', 
      icon: Zap, 
      color: '#fbbf24',
      procedures: language === 'fr' ? [
        'Identifier la source d\'alimentation (disjoncteur, sectionneur, etc...)',
        'Couper l\'alimentation électrique', 
        'Verrouiller la source d\'alimentation',
        'Tester l\'absence de tension',
        'Poser les étiquettes de sécurité',
        'Installation des mises à la terre'
      ] : [
        'Identify power source (breaker, disconnect, etc...)',
        'Turn off electrical power',
        'Lock the power source',
        'Test for absence of voltage',
        'Apply safety tags',
        'Install grounding connections'
      ]
    },
    mechanical: { 
      name: language === 'fr' ? 'Mécanique' : 'Mechanical', 
      icon: Settings, 
      color: '#6b7280',
      procedures: language === 'fr' ? [
        'Arrêter les équipements mécaniques', 
        'Bloquer les parties mobiles',
        'Verrouiller les commandes', 
        'Vérifier l\'immobilisation',
        'Signaler la zone', 
        'Installer les dispositifs de blocage'
      ] : [
        'Stop mechanical equipment',
        'Block moving parts',
        'Lock controls',
        'Verify immobilization',
        'Mark the area',
        'Install blocking devices'
      ]
    },
    hydraulic: { 
      name: language === 'fr' ? 'Hydraulique' : 'Hydraulic', 
      icon: Droplets, 
      color: '#3b82f6',
      procedures: language === 'fr' ? [
        'Fermer les vannes principales', 
        'Purger la pression résiduelle',
        'Verrouiller les vannes', 
        'Vérifier la dépressurisation',
        'Installer des bouchons de sécurité', 
        'Tester l\'étanchéité du système'
      ] : [
        'Close main valves',
        'Bleed residual pressure',
        'Lock valves',
        'Verify depressurization',
        'Install safety plugs',
        'Test system tightness'
      ]
    },
    pneumatic: { 
      name: language === 'fr' ? 'Pneumatique' : 'Pneumatic', 
      icon: Wind, 
      color: '#10b981',
      procedures: language === 'fr' ? [
        'Couper l\'alimentation en air', 
        'Purger les réservoirs d\'air',
        'Verrouiller les vannes', 
        'Vérifier la dépressurisation',
        'Isoler les circuits', 
        'Contrôler l\'absence de pression'
      ] : [
        'Cut air supply',
        'Bleed air tanks',
        'Lock valves',
        'Verify depressurization',
        'Isolate circuits',
        'Check absence of pressure'
      ]
    },
    chemical: { 
      name: language === 'fr' ? 'Chimique' : 'Chemical', 
      icon: AlertTriangle, 
      color: '#f59e0b',
      procedures: language === 'fr' ? [
        'Fermer les vannes d\'alimentation', 
        'Purger les conduites',
        'Neutraliser les résidus', 
        'Verrouiller les accès',
        'Installer la signalisation', 
        'Vérifier l\'absence de vapeurs'
      ] : [
        'Close supply valves',
        'Purge lines',
        'Neutralize residues',
        'Lock access points',
        'Install signage',
        'Check absence of vapors'
      ]
    },
    thermal: { 
      name: language === 'fr' ? 'Thermique' : 'Thermal', 
      icon: Flame, 
      color: '#ef4444',
      procedures: language === 'fr' ? [
        'Couper l\'alimentation de chauffage', 
        'Laisser refroidir les équipements',
        'Isoler les sources de chaleur', 
        'Vérifier la température',
        'Signaler les zones chaudes', 
        'Installer les protections thermiques'
      ] : [
        'Cut heating supply',
        'Let equipment cool down',
        'Isolate heat sources',
        'Check temperature',
        'Mark hot zones',
        'Install thermal protections'
      ]
    },
    gravity: { 
      name: language === 'fr' ? 'Gravité' : 'Gravity', 
      icon: Wrench, 
      color: '#8b5cf6',
      procedures: language === 'fr' ? [
        'supporter les charges suspendues', 
        'Bloquer les mécanismes de levage',
        'Installer des supports de sécurité', 
        'Vérifier la stabilité',
        'Baliser la zone', 
        'Contrôler les points d\'ancrage'
      ] : [
        'Support suspended loads',
        'Block lifting mechanisms',
        'Install safety supports',
        'Verify stability',
        'Mark the area',
        'Check anchor points'
      ]
    }
  }), [language]);

  // =================== HANDLERS LOTO MANQUANTS ===================
  const handlePhotoCapture = useCallback(async (category: string, lockoutPointId?: string) => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment';
        fileInputRef.current.multiple = true;
        fileInputRef.current.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            files.forEach(file => processPhoto(file, category, lockoutPointId));
          }
        };
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  }, []);

  const processPhoto = useCallback(async (file: File, category: string, lockoutPointId?: string) => {
    try {
      const photoUrl = URL.createObjectURL(file);
      const newPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
        category: category as any,
        timestamp: new Date().toISOString(),
        lockoutPointId
      };
      
      const updatedPhotos = [...(localData.lockoutPhotos || []), newPhoto];
      updateField('lockoutPhotos', updatedPhotos);
      
      console.log('✅ Step1 - Photo ajoutée:', newPhoto.id);
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  }, [language, localData.lockoutPhotos, updateField]);

  const deletePhoto = useCallback((photoId: string) => {
    const updatedPhotos = (localData.lockoutPhotos || []).filter((photo: any) => photo.id !== photoId);
    updateField('lockoutPhotos', updatedPhotos);
    console.log('✅ Step1 - Photo supprimée:', photoId);
  }, [localData.lockoutPhotos, updateField]);

  const getCategoryLabel = useCallback((category: string): string => {
    const categories = {
      before_lockout: 'Avant verrouillage',
      during_lockout: 'Pendant verrouillage', 
      lockout_device: 'Dispositif de verrouillage',
      client_form: 'Fiche client',
      verification: 'Vérification'
    };
    return categories[category as keyof typeof categories] || category;
  }, []);

  const addLockoutPoint = useCallback(() => {
    const newPoint = {
      id: `lockout_${Date.now()}`,
      energyType: 'electrical',
      equipmentName: '',
      location: '',
      lockType: '',
      tagNumber: `TAG-${Date.now().toString().slice(-6)}`,
      isLocked: false,
      verifiedBy: '',
      verificationTime: '',
      photos: [],
      notes: '',
      completedProcedures: []
    };

    const updatedPoints = [...(localData.lockoutPoints || []), newPoint];
    updateField('lockoutPoints', updatedPoints);
  }, [localData.lockoutPoints, updateField]);

  const deleteLockoutPoint = useCallback((pointId: string) => {
    const updatedPoints = (localData.lockoutPoints || []).filter((point: any) => point.id !== pointId);
    const updatedPhotos = (localData.lockoutPhotos || []).filter((photo: any) => photo.lockoutPointId !== pointId);
    
    updateField('lockoutPoints', updatedPoints);
    updateField('lockoutPhotos', updatedPhotos);
  }, [localData.lockoutPoints, localData.lockoutPhotos, updateField]);

  const updateLockoutPoint = useCallback((pointId: string, field: string, value: any) => {
    const updatedPoints = (localData.lockoutPoints || []).map((point: any) => 
      point.id === pointId ? { ...point, [field]: value } : point
    );
    updateField('lockoutPoints', updatedPoints);
  }, [localData.lockoutPoints, updateField]);

  const toggleProcedureComplete = useCallback((pointId: string, procedureIndex: number) => {
    const point = (localData.lockoutPoints || []).find((p: any) => p.id === pointId);
    if (!point) return;

    const completedProcedures = point.completedProcedures || [];
    const isCompleted = completedProcedures.includes(procedureIndex);
    
    const updatedCompleted = isCompleted 
      ? completedProcedures.filter((index: number) => index !== procedureIndex)
      : [...completedProcedures, procedureIndex];

    updateLockoutPoint(pointId, 'completedProcedures', updatedCompleted);
  }, [localData.lockoutPoints, updateLockoutPoint]);

  const getProcedureProgress = useCallback((point: any): { completed: number; total: number; percentage: number } => {
    const energyType = ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES];
    const total = energyType?.procedures.length || 0;
    const completed = (point.completedProcedures || []).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, []);

  const setTimeNow = useCallback((pointId: string) => {
    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    updateLockoutPoint(pointId, 'verificationTime', timeString);
  }, [updateLockoutPoint]);

  const setTimePlus = useCallback((pointId: string, minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const timeString = now.toTimeString().substring(0, 5);
    updateLockoutPoint(pointId, 'verificationTime', timeString);
  }, [updateLockoutPoint]);

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
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--border-primary)',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid var(--border-primary)',
    background: 'var(--bg-primary)',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-bg-primary)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      {/* Input caché pour capture photo */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />
      
      {/* Header uniforme */}
      <Header 
        title={t.title}
        subtitle={t.subtitle}
        logoSize="sm"
        actions={
          <button
            onClick={() => onDataChange('projectInfo', localData)}
            className="bg-blue-500/10 border border-blue-500/30 text-blue-400 
                       px-6 py-3 rounded-lg cursor-pointer text-sm
                       flex items-center gap-2 hover:bg-blue-500/20 transition-colors"
          >
            <Save size={16} />
            {t.save}
          </button>
        }
      />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: window.innerWidth < 768 ? '12px' : '24px' }}>

        {/* Navigation par onglets */}
        <div style={{
          display: 'flex',
          marginBottom: window.innerWidth < 768 ? '16px' : '24px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: window.innerWidth < 768 ? '4px' : '6px',
          border: '1px solid var(--border-secondary)'
        }}>
          {(['project', 'loto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: window.innerWidth < 768 ? '12px' : '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                background: activeTab === tab 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-muted)',
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
                background: 'var(--bg-primary)',
                cursor: 'default'
              }}
              placeholder={t.astGenerated}
            />
            
            <button
              onClick={generateASTNumber}
              style={{
                background: 'var(--gradient-success)',
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
                  background: copied ? '#10b981' : 'var(--bg-secondary)',
                  color: copied ? 'white' : 'var(--text-muted)',
                  border: '1px solid var(--border-primary)',
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
              
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
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
                background: 'var(--gradient-success)',
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
                  background: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-secondary)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: 'var(--text-secondary)' }}>
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
                  background: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-secondary)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h5 style={{ margin: 0, color: 'var(--text-secondary)' }}>
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
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: window.innerWidth < 768 ? '12px' : '16px'
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
                      <span style={{ color: 'var(--text-secondary)' }}>{objective}</span>
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
            gridTemplateColumns: window.innerWidth < 768 ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: window.innerWidth < 768 ? '8px' : '12px',
            marginBottom: '20px'
          }}>
            {/* AST Client - Fonctionnel */}
            <label style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '2px dashed rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '12px 8px' : '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'block'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={window.innerWidth < 768 ? 20 : 24} style={{ color: '#8b5cf6' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '2px', fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                    AST Client
                  </div>
                  <div style={{ fontSize: window.innerWidth < 768 ? '10px' : '11px', color: 'var(--text-muted)' }}>
                    Cliquer pour ajouter
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                onChange={handleASTClientUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Fiche de Verrouillage Client - Fonctionnel */}
            <label style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px dashed rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'block'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={window.innerWidth < 768 ? 20 : 24} style={{ color: '#ef4444' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '2px', fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                    Fiche Verrouillage Client
                  </div>
                  <div style={{ fontSize: window.innerWidth < 768 ? '10px' : '11px', color: 'var(--text-muted)' }}>
                    Cliquer pour ajouter
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple
                onChange={handleLockoutClientUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Photos Diverses - Fonctionnel */}
            <label style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '2px dashed rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '12px 8px' : '16px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'block'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={window.innerWidth < 768 ? 20 : 24} style={{ color: '#06b6d4' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#06b6d4', marginBottom: '2px', fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                    Photos Diverses
                  </div>
                  <div style={{ fontSize: window.innerWidth < 768 ? '10px' : '11px', color: 'var(--text-muted)' }}>
                    Cliquer pour ajouter
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Zone d'affichage des documents ajoutés - Vue responsive optimisée mobile */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            padding: window.innerWidth < 768 ? '12px' : '16px',
            border: '1px solid var(--border-secondary)'
          }}>
            {/* En-tête avec compteurs */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} style={{ color: '#8b5cf6' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  AST: {(localData.astClientFiles || []).length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} style={{ color: '#ef4444' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Verrouillage: {(localData.lockoutClientFiles || []).length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} style={{ color: '#06b6d4' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Photos: {(localData.photos || []).length}
                </span>
              </div>
            </div>

            {/* Fichiers AST Client */}
            {(localData.astClientFiles && localData.astClientFiles.length > 0) && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  color: '#8b5cf6', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FileText size={14} />
                  AST Client ({localData.astClientFiles.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px'
                }}>
                  {localData.astClientFiles.map((file, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      padding: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '60px',
                        fontSize: '11px',
                        color: '#8b5cf6',
                        fontWeight: '600'
                      }}>
                        AST #{index + 1}
                      </div>
                      <button
                        onClick={() => removeASTClientFile(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fichiers Fiche Verrouillage */}
            {(localData.lockoutClientFiles && localData.lockoutClientFiles.length > 0) && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  color: '#ef4444', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Lock size={14} />
                  Fiche Verrouillage ({localData.lockoutClientFiles.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px'
                }}>
                  {localData.lockoutClientFiles.map((file, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                      padding: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '60px',
                        fontSize: '11px',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}>
                        LOTO #{index + 1}
                      </div>
                      <button
                        onClick={() => removeLockoutClientFile(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {(localData.photos && localData.photos.length > 0) && (
              <div style={{ marginBottom: '8px' }}>
                <h4 style={{ 
                  color: '#06b6d4', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Camera size={14} />
                  Photos Diverses ({localData.photos.length})
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px'
                }}>
                  {localData.photos.map((photo, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid var(--border-secondary)'
                        }}
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucun document */}
            {(!localData.astClientFiles?.length && !localData.lockoutClientFiles?.length && !localData.photos?.length) && (
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px'
              }}>
                Aucun document ajouté pour le moment
              </div>
            )}
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


        {/* Onglet LOTO - Section complète comme ancien Step1 */}
        {activeTab === 'loto' && (
          <>
            {/* =================== SECTION VERROUILLAGE/CADENASSAGE COMPLÈTE =================== */}
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
                    🔒 Verrouillage / Cadenassage (LOTO)
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'var(--text-muted)', 
                    fontSize: '14px' 
                  }}>
                    Documentation des procédures de verrouillage/étiquetage des énergies dangereuses selon les normes RSST. Photographiez chaque étape pour assurer une traçabilité complète.
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
          
              {/* Photos générales de verrouillage */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <Camera size={18} style={{ color: '#06b6d4' }} />
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>Photos Générales de Verrouillage</label>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <button
                    onClick={() => handlePhotoCapture('before_lockout')}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    <Camera size={14} />Avant verrouillage
                  </button>
                  <button
                    onClick={() => handlePhotoCapture('client_form')}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    <FileText size={14} />Fiche client
                  </button>
                  <button
                    onClick={() => handlePhotoCapture('verification')}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    <Eye size={14} />Vérification finale
                  </button>
                </div>
              </div>
          
          {/* =================== SECTION LOTO COMPLÈTE COMME ANCIEN STEP1 =================== */}
              {/* Points de verrouillage dynamiques */}
              {(localData.lockoutPoints || []).map((point, index) => (
                <div key={point.id} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <h4 style={{ color: '#ef4444', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      🔒 Point de Verrouillage #{index + 1}
                    </h4>
                    <button
                      onClick={() => deleteLockoutPoint(point.id)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>

                  {/* Sélecteur type d'énergie avec procédures */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>Type d'Énergie<span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      {Object.entries(ENERGY_TYPES).map(([key, type]) => {
                        const IconComponent = type.icon;
                        return (
                          <div
                            key={key}
                            onClick={() => updateLockoutPoint(point.id, 'energyType', key)}
                            style={{
                              padding: '12px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: `2px solid ${point.energyType === key ? type.color : 'rgba(100, 116, 139, 0.3)'}`,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              minHeight: '80px',
                              justifyContent: 'center',
                              backgroundColor: point.energyType === key ? `${type.color}20` : undefined
                            }}
                          >
                            <IconComponent size={20} color={type.color} />
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#e2e8f0' }}>{type.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Procédures recommandées */}
                    {point.energyType && ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES] && (
                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(100, 116, 139, 0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginTop: '12px'
                      }}>
                        <h4 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', margin: '0 0 12px' }}>🔧 Procédures à Suivre:</h4>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES].procedures.map((procedure, idx) => {
                            const isCompleted = (point.completedProcedures || []).includes(idx);
                            return (
                              <li
                                key={idx}
                                onClick={() => toggleProcedureComplete(point.id, idx)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px',
                                  marginBottom: '12px',
                                  padding: '8px',
                                  borderRadius: '8px',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : undefined,
                                  border: isCompleted ? '1px solid rgba(34, 197, 94, 0.3)' : undefined
                                }}
                              >
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  border: '2px solid rgba(100, 116, 139, 0.5)',
                                  borderRadius: '4px',
                                  background: isCompleted ? '#22c55e' : 'rgba(15, 23, 42, 0.8)',
                                  borderColor: isCompleted ? '#22c55e' : 'rgba(100, 116, 139, 0.5)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s ease',
                                  flexShrink: 0,
                                  marginTop: '2px',
                                  color: isCompleted ? 'white' : undefined
                                }}>
                                  {isCompleted && <Check size={12} />}
                                </div>
                                <span style={{
                                  color: isCompleted ? '#a7f3d0' : '#94a3b8',
                                  fontSize: '13px',
                                  lineHeight: '1.5',
                                  flex: 1
                                }}>{procedure}</span>
                              </li>
                            );
                          })}
                        </ul>
                        <div style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(100, 116, 139, 0.2)'
                        }}>
                          <div style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderRadius: '8px',
                            height: '6px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                              transition: 'width 0.5s ease',
                              borderRadius: '8px',
                              width: `${getProcedureProgress(point).percentage}%`
                            }} />
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            textAlign: 'center'
                          }}>
                            {getProcedureProgress(point).completed} / {getProcedureProgress(point).total} étapes complétées ({getProcedureProgress(point).percentage}%)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Détails équipement */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                    gap: window.innerWidth < 768 ? '12px' : '16px',
                    alignItems: 'start',
                    marginBottom: window.innerWidth < 768 ? '12px' : '16px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Settings style={{ width: '18px', height: '18px' }} />Nom de l'Équipement
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Disjoncteur principal"
                        value={point.equipmentName}
                        onChange={(e) => updateLockoutPoint(point.id, 'equipmentName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <MapPin style={{ width: '18px', height: '18px' }} />Localisation
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Panneau électrique B-2"
                        value={point.location}
                        onChange={(e) => updateLockoutPoint(point.id, 'location', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                    gap: window.innerWidth < 768 ? '12px' : '16px',
                    alignItems: 'start',
                    marginBottom: window.innerWidth < 768 ? '12px' : '16px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: window.innerWidth < 768 ? '12px' : '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Lock style={{ width: window.innerWidth < 768 ? '16px' : '18px', height: window.innerWidth < 768 ? '16px' : '18px' }} />Type de Cadenas/Dispositif
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cadenas rouge C-Secur360"
                        value={point.lockType}
                        onChange={(e) => updateLockoutPoint(point.id, 'lockType', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <FileText style={{ width: '18px', height: '18px' }} />Numéro d'Étiquette
                      </label>
                      <input
                        type="text"
                        placeholder="TAG-123456"
                        value={point.tagNumber}
                        onChange={(e) => updateLockoutPoint(point.id, 'tagNumber', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Vérification avec boutons temps */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                    gap: window.innerWidth < 768 ? '12px' : '16px',
                    alignItems: 'start',
                    marginBottom: window.innerWidth < 768 ? '12px' : '16px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: window.innerWidth < 768 ? '12px' : '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <User style={{ width: window.innerWidth < 768 ? '16px' : '18px', height: window.innerWidth < 768 ? '16px' : '18px' }} />Vérifié par
                      </label>
                      <input
                        type="text"
                        placeholder="Nom de la personne"
                        value={point.verifiedBy}
                        onChange={(e) => updateLockoutPoint(point.id, 'verifiedBy', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        <Clock style={{ width: '18px', height: '18px' }} />Heure de Vérification
                      </label>
                      <input
                        type="time"
                        value={point.verificationTime}
                        onChange={(e) => updateLockoutPoint(point.id, 'verificationTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '2px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '15px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          boxSizing: 'border-box',
                          minHeight: '50px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button
                          onClick={() => setTimeNow(point.id)}
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#4ade80',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          <Clock size={12} />Maintenant
                        </button>
                        <button
                          onClick={() => setTimePlus(point.id, 5)}
                          style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#fbbf24',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '11px',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          +5min
                        </button>
                        <button
                          onClick={() => setTimePlus(point.id, 15)}
                          style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: '#a78bfa',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '11px',
                            fontWeight: '500',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          +15min
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      <FileText style={{ width: '18px', height: '18px' }} />Notes et Observations
                    </label>
                    <textarea
                      placeholder="Observations particulières, difficultés rencontrées, modifications apportées..."
                      value={point.notes}
                      onChange={(e) => updateLockoutPoint(point.id, 'notes', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '14px 16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Photos spécifiques au point */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      <Camera style={{ width: '18px', height: '18px' }} />Photos de ce Point de Verrouillage
                    </label>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <button
                        onClick={() => handlePhotoCapture('during_lockout', point.id)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Camera size={14} />Pendant verrouillage
                      </button>
                      <button
                        onClick={() => handlePhotoCapture('lockout_device', point.id)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: window.innerWidth < 768 ? '6px 10px' : '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: window.innerWidth < 768 ? '11px' : '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Lock size={window.innerWidth < 768 ? 12 : 14} />Dispositif
                      </button>
                      <button
                        onClick={() => handlePhotoCapture('verification', point.id)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: window.innerWidth < 768 ? '6px 10px' : '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: window.innerWidth < 768 ? '11px' : '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Eye size={window.innerWidth < 768 ? 12 : 14} />Vérification
                      </button>
                    </div>
                    
                    {/* Affichage photos du point */}
                    {(localData.lockoutPhotos || []).filter(photo => photo.lockoutPointId === point.id).length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '8px'
                      }}>
                        {(localData.lockoutPhotos || []).filter(photo => photo.lockoutPointId === point.id).map(photo => (
                          <div key={photo.id} style={{
                            position: 'relative',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <img src={photo.url} alt={photo.caption} style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover'
                            }} />
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(239, 68, 68, 0.8)',
                                border: 'none',
                                color: 'white',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: 'white',
                              padding: '4px 6px',
                              fontSize: '10px',
                              textAlign: 'center'
                            }}>
                              {getCategoryLabel(photo.category)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => handlePhotoCapture('during_lockout', point.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '2px dashed rgba(239, 68, 68, 0.3)',
                          borderRadius: '12px',
                          padding: '40px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '140px'
                        }}
                      >
                        <Camera size={32} style={{ color: '#f87171', marginBottom: '12px' }} />
                        <h4 style={{ margin: '0 0 8px', color: '#f87171' }}>Aucune photo</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                          Cliquez pour prendre une photo avec l'appareil
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bouton ajouter point */}
              <div style={{ marginTop: (localData.lockoutPoints || []).length > 0 ? (window.innerWidth < 768 ? '16px' : '24px') : '0', marginBottom: window.innerWidth < 768 ? '16px' : '24px' }}>
                <button
                  onClick={addLockoutPoint}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    color: 'white',
                    padding: window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px'
                  }}
                >
                  <Plus size={window.innerWidth < 768 ? 16 : 20} />Ajouter Point de Verrouillage
                </button>
              </div>

              {/* Message si aucun point */}
              {(localData.lockoutPoints || []).length === 0 && (
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: window.innerWidth < 768 ? '16px' : '24px',
                  textAlign: 'center',
                  color: '#60a5fa'
                }}>
                  <Lock size={window.innerWidth < 768 ? 24 : 32} style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 8px', color: '#60a5fa', fontSize: window.innerWidth < 768 ? '16px' : '18px' }}>Aucun Point de Verrouillage</h4>
                  <p style={{ margin: 0, fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                    Cliquez sur "Ajouter Point de Verrouillage" pour documenter les procédures LOTO
                  </p>
                </div>
              )}

              {/* Validation LOTO */}
              {(localData.lockoutPoints || []).length > 0 && (
                <div style={{
                  background: (localData.lockoutPoints || []).filter(point => {
                    const progress = getProcedureProgress(point);
                    return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
                  }).length >= Math.ceil((localData.lockoutPoints || []).length * 0.8) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${(localData.lockoutPoints || []).filter(point => {
                    const progress = getProcedureProgress(point);
                    return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
                  }).length >= Math.ceil((localData.lockoutPoints || []).length * 0.8) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <Shield size={20} color={(localData.lockoutPoints || []).filter(point => {
                      const progress = getProcedureProgress(point);
                      return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
                    }).length >= Math.ceil((localData.lockoutPoints || []).length * 0.8) ? '#22c55e' : '#f59e0b'} />
                    <h4 style={{
                      margin: 0,
                      color: (localData.lockoutPoints || []).filter(point => {
                        const progress = getProcedureProgress(point);
                        return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
                      }).length >= Math.ceil((localData.lockoutPoints || []).length * 0.8) ? '#22c55e' : '#f59e0b'
                    }}>État Verrouillage</h4>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#e2e8f0',
                    marginBottom: '8px'
                  }}>
                    {(localData.lockoutPoints || []).filter(point => {
                      const progress = getProcedureProgress(point);
                      return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
                    }).length}/{(localData.lockoutPoints || []).length} points complétés
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* =================== FIN DU COMPOSANT =================== */}
    </div>
  );
});

Step1ProjectInfo.displayName = 'Step1ProjectInfo';

export default Step1ProjectInfo;
