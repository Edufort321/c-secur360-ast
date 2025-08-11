// =================== STEP 1 / 3 — IMPORTS, TYPES, TRADUCTIONS, SETUP STATE/REFS ===================
'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, BarChart3,
  TrendingUp, Activity, Shield
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step1ProjectInfoProps {
  formData: any; // structure parent (ASTForm) – on reste flexible
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, any>;
}

interface WorkLocation {
  id: string;
  name: string;
  description: string;
  zone: string;
  building?: string;
  floor?: string;
  maxWorkersReached: number;
  currentWorkers: number;
  lockoutPoints: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
  estimatedDuration: string;
  startTime?: string;
  endTime?: string;
}

interface LocationStats {
  totalWorkers: number;
  totalLocations: number;
  activeLockouts: number;
  peakUtilization: number;
  locationBreakdown: {
    locationId: string;
    name: string;
    currentWorkers: number;
    maxReached: number;
    lockouts: number;
    utilizationCurrent: number;
    estimatedDuration: string;
  }[];
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
  assignedLocation?: string;
}

interface LockoutPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before_lockout' | 'during_lockout' | 'lockout_device' | 'client_form' | 'verification';
  timestamp: string;
  lockoutPointId?: string;
}

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    // Générateur AST
    astNumberTitle: "🔢 Numéro AST Unique",
    astNumberGenerated: "Numéro généré automatiquement - Usage unique pour cette AST",
    copyNumber: "Copier le numéro",
    generateNew: "Générer un nouveau numéro",

    // Sections principales
    clientInfo: "🏢 Informations Client",
    projectDetails: "📋 Détails du Projet",
    location: "📍 Localisation",
    workLocations: "🏗️ Emplacements de Travail",
    locationStats: "📊 Statistiques Temps Réel",
    emergency: "🚨 Contacts d'Urgence",
    workDescription: "📝 Description Détaillée des Travaux",
    lockoutSection: "🔒 Verrouillage / Cadenassage (LOTO)",

    // Champs client
    clientName: "Nom du Client",
    clientNamePlaceholder: "Ex: Hydro-Québec, Bell Canada...",
    clientPhone: "Téléphone Client",
    clientPhonePlaceholder: "Ex: (514) 555-0123",
    clientRepresentative: "Représentant Client",
    clientRepPlaceholder: "Nom du responsable projet",
    repPhone: "Téléphone Représentant",
    repPhonePlaceholder: "Ex: (514) 555-0456",

    // Champs projet
    projectNumber: "Numéro de Projet",
    projectNumberPlaceholder: "Ex: PRJ-2025-001",
    astClientNumber: "# AST Client (Optionnel)",
    astClientPlaceholder: "Numéro fourni par le client",
    astClientHelp: "Numéro de référence du client (si applicable)",
    date: "Date",
    time: "Heure",

    // Localisation
    workLocation: "Lieu des Travaux",
    workLocationPlaceholder: "Adresse complète du site de travail",
    industryType: "Type d'Industrie",

    // Emplacements multiples
    addLocation: "Ajouter Emplacement",
    locationName: "Nom de l'Emplacement",
    locationNamePlaceholder: "Ex: Bâtiment A - Étage 2",
    locationDescription: "Description",
    locationDescriptionPlaceholder: "Ex: Zone des équipements électriques",
    zone: "Zone",
    zonePlaceholder: "Ex: Production, Bureau, Maintenance",
    building: "Bâtiment",
    buildingPlaceholder: "Ex: Bâtiment A",
    floor: "Étage",
    floorPlaceholder: "Ex: Sous-sol, RDC, Étage 2",
    workDuration: "Durée des Travaux",
    workDurationPlaceholder: "Ex: 8 heures, 2 jours",
    startTime: "Heure Début",
    endTime: "Heure Fin",
    removeLocation: "Supprimer cet emplacement",
    noLocations: "Aucun emplacement défini",
    noLocationsDescription: "Ajoutez des emplacements pour organiser vos équipes",

    // Statistiques
    totalWorkers: "Total Travailleurs",
    totalLocations: "Emplacements Actifs",
    totalLockouts: "Cadenas Apposés",
    peakUtilization: "Pic d'Utilisation",
    locationBreakdown: "Répartition par Emplacement",
    workersCount: "travailleurs",
    lockoutsCount: "cadenas",
    currentWorkers: "actuels",
    maxReached: "max atteint",

    // Industries
    electrical: "⚡ Électrique",
    construction: "🏗️ Construction",
    industrial: "🏭 Industriel",
    manufacturing: "⚙️ Manufacturier",
    office: "🏢 Bureau/Administratif",
    other: "🔧 Autre",

    // Urgence
    emergencyContact: "Contact d'Urgence",
    emergencyContactPlaceholder: "Nom du contact d'urgence",
    emergencyPhone: "Téléphone d'Urgence",
    emergencyPhonePlaceholder: "911 ou numéro spécifique",

    // Description
    workDescriptionLabel: "Description Complète",
    workDescriptionPlaceholder:
      "Décrivez en détail les travaux à effectuer:\n\n• Méthodes utilisées\n• Équipements impliqués\n• Zones d'intervention\n• Procédures spéciales\n• Conditions particulières\n\nPlus la description est détaillée, plus l'analyse de sécurité sera précise.",
    workDescriptionHelp:
      "Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.",

    // Verrouillage
    lockoutDescription:
      "Documentation des procédures de verrouillage/étiquetage des énergies dangereuses selon les normes RSST. Photographiez chaque étape pour assurer une traçabilité complète.",
    generalPhotos: "Photos Générales de Verrouillage",
    beforeLockout: "Avant verrouillage",
    clientForm: "Fiche client",
    verification: "Vérification finale",
    duringLockout: "Pendant verrouillage",
    lockoutDevice: "Dispositif",

    // Lockout points
    lockoutPoint: "🔒 Point de Verrouillage #",
    delete: "Supprimer",
    energyType: "Type d'Énergie",
    equipmentName: "Nom de l'Équipement",
    equipmentPlaceholder: "Ex: Disjoncteur principal",
    locationLabel: "Localisation",
    locationPlaceholder: "Ex: Panneau électrique B-2",
    lockType: "Type de Cadenas/Dispositif",
    lockTypePlaceholder: "Ex: Cadenas rouge C-Secur360",
    tagNumber: "Numéro d'Étiquette",
    tagPlaceholder: "TAG-123456",
    verifiedBy: "Vérifié par",
    verifiedByPlaceholder: "Nom de la personne",
    verificationTime: "Heure de Vérification",
    now: "Maintenant",
    notes: "Notes et Observations",
    notesPlaceholder: "Observations particulières, difficultés rencontrées, modifications apportées...",
    pointPhotos: "Photos de ce Point de Verrouillage",
    addLockoutPoint: "Ajouter Point de Verrouillage",

    // Photos
    noPhotos: "Aucune photo",
    addPhoto: "Ajouter une photo",
    addPhotoDescription: "Documentez cette étape avec une photo",
    clickToPhoto: "Cliquez pour prendre votre première photo de verrouillage",
    clickToPhotoDevice: "Cliquez pour prendre une photo avec l'appareil",
    noLockoutPoints: "Aucun Point de Verrouillage",
    noLockoutDescription: "Cliquez sur \"Ajouter Point de Verrouillage\" pour documenter les procédures LOTO",

    // Procédures
    proceduresToFollow: "🔧 Procédures à Suivre:",
    stepsCompleted: "étapes complétées",

    // Erreur
    required: "*",

    // Boutons
    add: "Ajouter",
    cancel: "Annuler",
    save: "Sauvegarder",
    edit: "Modifier",
    adding: "Ajout en cours...",

    // Catégories photo
    categories: {
      before_lockout: "Avant verrouillage",
      during_lockout: "Pendant verrouillage",
      lockout_device: "Dispositif de verrouillage",
      client_form: "Fiche client",
      verification: "Vérification"
    }
  },
  en: {
    astNumberTitle: "🔢 Unique JSA Number",
    astNumberGenerated: "Automatically generated number - Single use for this JSA",
    copyNumber: "Copy number",
    generateNew: "Generate new number",

    clientInfo: "🏢 Client Information",
    projectDetails: "📋 Project Details",
    location: "📍 Location",
    workLocations: "🏗️ Work Locations",
    locationStats: "📊 Real-Time Statistics",
    emergency: "🚨 Emergency Contacts",
    workDescription: "📝 Detailed Work Description",
    lockoutSection: "🔒 Lockout / Tagout (LOTO)",

    clientName: "Client Name",
    clientNamePlaceholder: "Ex: Hydro-Quebec, Bell Canada...",
    clientPhone: "Client Phone",
    clientPhonePlaceholder: "Ex: (514) 555-0123",
    clientRepresentative: "Client Representative",
    clientRepPlaceholder: "Project manager name",
    repPhone: "Representative Phone",
    repPhonePlaceholder: "Ex: (514) 555-0456",

    projectNumber: "Project Number",
    projectNumberPlaceholder: "Ex: PRJ-2025-001",
    astClientNumber: "# Client JSA (Optional)",
    astClientPlaceholder: "Number provided by client",
    astClientHelp: "Client reference number (if applicable)",
    date: "Date",
    time: "Time",

    workLocation: "Work Location",
    workLocationPlaceholder: "Complete address of work site",
    industryType: "Industry Type",

    addLocation: "Add Location",
    locationName: "Location Name",
    locationNamePlaceholder: "Ex: Building A - Floor 2",
    locationDescription: "Description",
    locationDescriptionPlaceholder: "Ex: Electrical equipment zone",
    zone: "Zone",
    zonePlaceholder: "Ex: Production, Office, Maintenance",
    building: "Building",
    buildingPlaceholder: "Ex: Building A",
    floor: "Floor",
    floorPlaceholder: "Ex: Basement, Ground, Floor 2",
    workDuration: "Work Duration",
    workDurationPlaceholder: "Ex: 8 hours, 2 days",
    startTime: "Start Time",
    endTime: "End Time",
    removeLocation: "Remove this location",
    noLocations: "No locations defined",
    noLocationsDescription: "Add locations to organize your teams",

    totalWorkers: "Total Workers",
    totalLocations: "Active Locations",
    totalLockouts: "Applied Locks",
    peakUtilization: "Peak Utilization",
    locationBreakdown: "Breakdown by Location",
    workersCount: "workers",
    lockoutsCount: "locks",
    currentWorkers: "current",
    maxReached: "max reached",

    electrical: "⚡ Electrical",
    construction: "🏗️ Construction",
    industrial: "🏭 Industrial",
    manufacturing: "⚙️ Manufacturing",
    office: "🏢 Office/Administrative",
    other: "🔧 Other",

    emergencyContact: "Emergency Contact",
    emergencyContactPlaceholder: "Emergency contact name",
    emergencyPhone: "Emergency Phone",
    emergencyPhonePlaceholder: "911 or specific number",

    workDescriptionLabel: "Complete Description",
    workDescriptionPlaceholder:
      "Describe in detail the work to be performed:\n\n• Methods used\n• Equipment involved\n• Work areas\n• Special procedures\n• Particular conditions\n\nThe more detailed the description, the more accurate the safety analysis.",
    workDescriptionHelp:
      "A complete description helps identify all potential risks and choose appropriate safety measures.",

    lockoutDescription:
      "Documentation of lockout/tagout procedures for hazardous energies according to OHSA standards. Photograph each step to ensure complete traceability.",
    generalPhotos: "General Lockout Photos",
    beforeLockout: "Before lockout",
    clientForm: "Client form",
    verification: "Final verification",
    duringLockout: "During lockout",
    lockoutDevice: "Device",

    lockoutPoint: "🔒 Lockout Point #",
    delete: "Delete",
    energyType: "Energy Type",
    equipmentName: "Equipment Name",
    equipmentPlaceholder: "Ex: Main breaker",
    locationLabel: "Location",
    locationPlaceholder: "Ex: Electrical panel B-2",
    lockType: "Lock/Device Type",
    lockTypePlaceholder: "Ex: Red C-Secur360 lock",
    tagNumber: "Tag Number",
    tagPlaceholder: "TAG-123456",
    verifiedBy: "Verified by",
    verifiedByPlaceholder: "Person's name",
    verificationTime: "Verification Time",
    now: "Now",
    notes: "Notes and Observations",
    notesPlaceholder: "Particular observations, difficulties encountered, modifications made...",
    pointPhotos: "Photos of this Lockout Point",
    addLockoutPoint: "Add Lockout Point",

    noPhotos: "No photos",
    addPhoto: "Add photo",
    addPhotoDescription: "Document this step with a photo",
    clickToPhoto: "Click to take your first lockout photo",
    clickToPhotoDevice: "Click to take a photo with device",
    noLockoutPoints: "No Lockout Points",
    noLockoutDescription: "Click \"Add Lockout Point\" to document LOTO procedures",

    proceduresToFollow: "🔧 Procedures to Follow:",
    stepsCompleted: "steps completed",

    required: "*",

    add: "Add",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    adding: "Adding...",

    categories: {
      before_lockout: "Before lockout",
      during_lockout: "During lockout",
      lockout_device: "Lockout device",
      client_form: "Client form",
      verification: "Verification"
    }
  }
} as const;

// =================== TYPES D'ÉNERGIE + PROCÉDURES ===================
const getEnergyTypes = (language: 'fr' | 'en') => ({
  electrical: {
    name: language === 'fr' ? 'Électrique' : 'Electrical',
    icon: Zap,
    color: '#fbbf24',
    procedures: language === 'fr'
      ? [
          "Identifier la source d'alimentation (disjoncteur, sectionneur, etc...)",
          "Couper l'alimentation électrique",
          "Verrouiller la source d'alimentation",
          "Tester l'absence de tension",
          "Poser les étiquettes de sécurité",
          "Installation des mises à la terre"
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          'Arrêter les équipements mécaniques',
          'Bloquer les parties mobiles',
          'Verrouiller les commandes',
          "Vérifier l'immobilisation",
          'Signaler la zone',
          'Installer les dispositifs de blocage'
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          'Fermer les vannes principales',
          'Purger la pression résiduelle',
          'Verrouiller les vannes',
          'Vérifier la dépressurisation',
          'Installer des bouchons de sécurité',
          "Tester l'étanchéité du système"
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          "Couper l'alimentation en air",
          "Purger les réservoirs d'air",
          'Verrouiller les vannes',
          'Vérifier la dépressurisation',
          'Isoler les circuits',
          "Contrôler l'absence de pression"
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          "Fermer les vannes d'alimentation",
          'Purger les conduites',
          'Neutraliser les résidus',
          "Verrouiller les accès",
          'Installer la signalisation',
          "Vérifier l'absence de vapeurs"
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          "Couper l'alimentation de chauffage",
          'Laisser refroidir les équipements',
          'Isoler les sources de chaleur',
          'Vérifier la température',
          'Signaler les zones chaudes',
          'Installer les protections thermiques'
        ]
      : [
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
    procedures: language === 'fr'
      ? [
          'Supporter les charges suspendues',
          'Bloquer les mécanismes de levage',
          'Installer des supports de sécurité',
          'Vérifier la stabilité',
          'Baliser la zone',
          "Contrôler les points d'ancrage"
        ]
      : [
          'Support suspended loads',
          'Block lifting mechanisms',
          'Install safety supports',
          'Verify stability',
          'Mark the area',
          'Check anchor points'
        ]
  }
});

// =================== UTIL — GÉNÉRATEUR DE NUMÉRO AST ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

// =================== COMPOSANT PRINCIPAL (OUVERT ICI — on fermera en Section 3) ===================
function Step1ProjectInfo({
  formData,
  onDataChange,
  language,
  tenant,
  errors = {}
}: Step1ProjectInfoProps) {
  // Traductions + config énergie
  const t = translations[language];
  const ENERGY_TYPES = useMemo(() => getEnergyTypes(language), [language]);

  // ======= Extraction des données initiales du parent (stables) =======
  const projectInfo = formData?.projectInfo || {};
  const workLocationsInit: WorkLocation[] = projectInfo?.workLocations || [];
  const lockoutPointsInit: LockoutPoint[] = projectInfo?.lockoutPoints || [];
  const lockoutPhotosInit: LockoutPhoto[] = projectInfo?.lockoutPhotos || [];

  // ======= État local stable (on évite de lire formData après init pour ne pas override) =======
  const [projectData, setProjectData] = useState(() => ({
    client: projectInfo.client || '',
    clientPhone: projectInfo.clientPhone || '',
    clientRepresentative: projectInfo.clientRepresentative || '',
    clientRepresentativePhone: projectInfo.clientRepresentativePhone || '',
    projectNumber: projectInfo.projectNumber || '',
    astClientNumber: projectInfo.astClientNumber || '',
    date: projectInfo.date || new Date().toISOString().split('T')[0],
    time: projectInfo.time || new Date().toTimeString().substring(0, 5),
    workLocation: projectInfo.workLocation || '',
    industry: projectInfo.industry || 'electrical',
    emergencyContact: projectInfo.emergencyContact || '',
    emergencyPhone: projectInfo.emergencyPhone || '',
    workDescription: projectInfo.workDescription || '',
    workLocations: workLocationsInit,
    lockoutPoints: lockoutPointsInit,
    lockoutPhotos: lockoutPhotosInit
  }));

  // ======= Numéro AST + feedback copie =======
  const [astNumber, setAstNumber] = useState<string>(formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState<boolean>(false);

  // ======= Refs & index de carrousel photo =======
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [currentLockoutPhotoIndex, setCurrentLockoutPhotoIndex] = useState<Record<string, number>>({});

  // ======= État modal d’ajout d’emplacement =======
  const [showAddLocation, setShowAddLocation] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<{
    name: string;
    description: string;
    zone: string;
    building: string;
    floor: string;
    estimatedDuration: string;
    startTime: string;
    endTime: string;
  }>({
    name: '',
    description: '',
    zone: '',
    building: '',
    floor: '',
    estimatedDuration: '',
    startTime: '',
    endTime: ''
  });
  const [isModalSaving, setIsModalSaving] = useState<boolean>(false);

  // ======= Références stables pour éviter les boucles/ré-render (pattern A1) =======
  const stableDataRef = useRef(projectData);
  const lastNotifyKeyRef = useRef<string>('');
  const rendersRef = useRef<number>(0);
  rendersRef.current += 1;

  // Sync ref à chaque changement local
  if (stableDataRef.current !== projectData) {
    stableDataRef.current = projectData;
  }

  // ======= Notif parent (stable, anti-doublon) =======
  const notifyParent = useCallback((next: any, section: string = 'projectInfo') => {
    const key = `${section}-${JSON.stringify(next).slice(0, 120)}`;
    if (lastNotifyKeyRef.current === key) return;
    lastNotifyKeyRef.current = key;
    try {
      onDataChange(section, next);
    } catch (e) {
      console.error('onDataChange error:', e);
    }
  }, [onDataChange]);

  // ======= Placeholders des handlers (implémentés en Section 2) =======
  // (on les déclare ici pour que TS connaisse les symboles dans la suite)
  const updateProjectField = useCallback((field: string, value: any) => {}, []);
  const updateLockoutPoint = useCallback((pointId: string, field: string, value: any) => {}, []);
  const addLockoutPoint = useCallback(() => {}, []);
  const deleteLockoutPoint = useCallback((pointId: string) => {}, []);
  const updateModalField = useCallback((field: string, value: string) => {}, []);
  const addWorkLocation = useCallback(() => {}, []);
  const removeWorkLocation = useCallback((locationId: string) => {}, []);
  const handlePhotoCapture = useCallback(async (category: string, lockoutPointId?: string) => {}, []);
  const processPhoto = useCallback(async (file: File, category: string, lockoutPointId?: string) => {}, []);
  const deletePhoto = useCallback((photoId: string) => {}, []);
  const copyASTNumber = useCallback(async () => {}, [astNumber]);
  const regenerateASTNumber = useCallback(() => {}, []);
  const getCategoryLabel = useCallback((category: string) => category, []);
  const toggleProcedureComplete = useCallback((pointId: string, idx: number) => {}, []);
  const getProcedureProgress = useCallback((point: LockoutPoint) => ({ completed: 0, total: 0, percentage: 0 }), []);
  const setTimeNow = useCallback((pointId: string) => {}, []);
  const setTimePlus = useCallback((pointId: string, minutes: number) => {}, []);
  const selectEnergyType = useCallback((pointId: string, energy: string) => {}, []);
  const calculateLocationStats = useCallback((): LocationStats => ({
    totalWorkers: 0,
    totalLocations: 0,
    activeLockouts: 0,
    peakUtilization: 0,
    locationBreakdown: []
  }), []);
  const updateLocationWorkerCount = useCallback((locationId: string, count: number) => {}, []);
// =================== STEP 2 / 3 — HANDLERS (définitions uniques, sans alias) ===================

// ---------- Project fields ----------
const updateProjectField = useCallback((field: string, value: any) => {
  const next = { ...stableDataRef.current, [field]: value };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

// ---------- Lockout points CRUD ----------
const updateLockoutPoint = useCallback((pointId: string, field: string, value: any) => {
  const updated = stableDataRef.current.lockoutPoints.map((p: LockoutPoint) =>
    p.id === pointId ? { ...p, [field]: value } : p
  );
  const next = { ...stableDataRef.current, lockoutPoints: updated };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

const addLockoutPoint = useCallback(() => {
  const newPoint: LockoutPoint = {
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
    completedProcedures: [],
    assignedLocation: stableDataRef.current.workLocations[0]?.id
  };
  const next = { ...stableDataRef.current, lockoutPoints: [...stableDataRef.current.lockoutPoints, newPoint] };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

const deleteLockoutPoint = useCallback((pointId: string) => {
  const lockoutPoints = stableDataRef.current.lockoutPoints.filter((p: LockoutPoint) => p.id !== pointId);
  const lockoutPhotos = stableDataRef.current.lockoutPhotos.filter((ph: LockoutPhoto) => ph.lockoutPointId !== pointId);
  const next = { ...stableDataRef.current, lockoutPoints, lockoutPhotos };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

// ---------- Modal (work location) ----------
const updateModalField = useCallback((field: string, value: string) => {
  setNewLocation(prev => ({ ...prev, [field]: value }));
}, []);

const addWorkLocation = useCallback(() => {
  if (!newLocation.name.trim() || !newLocation.zone.trim() || isModalSaving) return;
  setIsModalSaving(true);

  const location: WorkLocation = {
    id: `location_${Date.now()}`,
    name: newLocation.name.trim(),
    description: newLocation.description.trim(),
    zone: newLocation.zone.trim(),
    building: newLocation.building.trim() || undefined,
    floor: newLocation.floor.trim() || undefined,
    maxWorkersReached: 0,
    currentWorkers: 0,
    lockoutPoints: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    estimatedDuration: newLocation.estimatedDuration.trim() || (language === 'fr' ? '8 heures' : '8 hours'),
    startTime: newLocation.startTime || '08:00',
    endTime: newLocation.endTime || '16:00'
  };

  const next = { ...stableDataRef.current, workLocations: [...stableDataRef.current.workLocations, location] };
  setProjectData(next);
  notifyParent(next);

  setNewLocation({
    name: '',
    description: '',
    zone: '',
    building: '',
    floor: '',
    estimatedDuration: '',
    startTime: '',
    endTime: ''
  });
  setShowAddLocation(false);
  setTimeout(() => setIsModalSaving(false), 200);
}, [newLocation, isModalSaving, notifyParent, language]);

const removeWorkLocation = useCallback((locationId: string) => {
  const workLocations = stableDataRef.current.workLocations.filter((l: WorkLocation) => l.id !== locationId);
  const lockoutPoints = stableDataRef.current.lockoutPoints.map((p: LockoutPoint) =>
    p.assignedLocation === locationId ? { ...p, assignedLocation: undefined } : p
  );
  const next = { ...stableDataRef.current, workLocations, lockoutPoints };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

// ---------- Photos ----------
const handlePhotoCapture = useCallback(async (category: string, lockoutPointId?: string) => {
  const input = fileInputRef.current;
  if (!input) return;
  input.accept = 'image/*';
  // @ts-expect-error capture est accepté par la plupart des mobiles
  input.capture = 'environment';
  input.multiple = true;
  input.onchange = (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    files.forEach(f => processPhoto(f, category, lockoutPointId));
  };
  input.click();
}, []);

const processPhoto = useCallback(async (file: File, category: string, lockoutPointId?: string) => {
  const url = URL.createObjectURL(file);
  const photo: LockoutPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    url,
    caption: `${(t.categories as any)[category] ?? category} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
    category: category as any,
    timestamp: new Date().toISOString(),
    lockoutPointId
  };
  const next = { ...stableDataRef.current, lockoutPhotos: [...stableDataRef.current.lockoutPhotos, photo] };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent, t.categories, language]);

const deletePhoto = useCallback((photoId: string) => {
  const next = { ...stableDataRef.current, lockoutPhotos: stableDataRef.current.lockoutPhotos.filter((p: LockoutPhoto) => p.id !== photoId) };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

// ---------- AST number ----------
const copyASTNumber = useCallback(async () => {
  try {
    await navigator.clipboard.writeText(astNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (e) {
    console.error('copy error', e);
  }
}, [astNumber]);

const regenerateASTNumber = useCallback(() => {
  const newNum = generateASTNumber();
  setAstNumber(newNum);
}, []);

// ---------- Lockout helpers ----------
const getCategoryLabel = useCallback((category: string): string => {
  return (t.categories as any)[category] ?? category;
}, [t.categories]);

const toggleProcedureComplete = useCallback((pointId: string, idx: number) => {
  const point = stableDataRef.current.lockoutPoints.find((p: LockoutPoint) => p.id === pointId);
  if (!point) return;
  const done = new Set(point.completedProcedures || []);
  done.has(idx) ? done.delete(idx) : done.add(idx);
  updateLockoutPoint(pointId, 'completedProcedures', Array.from(done));
}, [updateLockoutPoint]);

const getProcedureProgress = useCallback((point: LockoutPoint) => {
  const type = ENERGY_TYPES[point.energyType];
  const total = type?.procedures.length ?? 0;
  const completed = (point.completedProcedures || []).length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}, [ENERGY_TYPES]);

const setTimeNow = useCallback((pointId: string) => {
  const ts = new Date().toTimeString().slice(0, 5);
  updateLockoutPoint(pointId, 'verificationTime', ts);
}, [updateLockoutPoint]);

const setTimePlus = useCallback((pointId: string, minutes: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  updateLockoutPoint(pointId, 'verificationTime', d.toTimeString().slice(0, 5));
}, [updateLockoutPoint]);

const selectEnergyType = useCallback((pointId: string, energy: string) => {
  updateLockoutPoint(pointId, 'energyType', energy);
}, [updateLockoutPoint]);

// ---------- Stats ----------
const calculateLocationStats = useCallback((): LocationStats => {
  const locs: WorkLocation[] = stableDataRef.current.workLocations || [];
  const pts: LockoutPoint[] = stableDataRef.current.lockoutPoints || [];
  const totalLocations = locs.filter(l => l.isActive).length;
  const totalWorkers = locs.reduce((acc, l) => acc + l.currentWorkers, 0);
  const activeLockouts = pts.filter(p => p.isLocked).length;
  const totalMax = locs.reduce((acc, l) => acc + l.maxWorkersReached, 0);
  const peakUtilization = totalMax ? Math.round((totalWorkers / totalMax) * 100) : 0;

  const locationBreakdown = locs.map(l => {
    const locks = pts.filter(p => p.assignedLocation === l.id && p.isLocked).length;
    const utilizationCurrent = l.maxWorkersReached ? Math.round((l.currentWorkers / l.maxWorkersReached) * 100) : 0;
    return {
      locationId: l.id,
      name: l.name,
      currentWorkers: l.currentWorkers,
      maxReached: l.maxWorkersReached,
      lockouts: locks,
      utilizationCurrent,
      estimatedDuration: l.estimatedDuration
    };
  });

  return { totalWorkers, totalLocations, activeLockouts, peakUtilization, locationBreakdown };
}, []);

const updateLocationWorkerCount = useCallback((locationId: string, count: number) => {
  const locs = stableDataRef.current.workLocations.map((l: WorkLocation) => {
    if (l.id !== locationId) return l;
    const maxReached = Math.max(l.maxWorkersReached, count);
    return { ...l, currentWorkers: count, maxWorkersReached: maxReached };
  });
  const next = { ...stableDataRef.current, workLocations: locs };
  setProjectData(next);
  notifyParent(next);
}, [notifyParent]);

// -------------------- 🔽🔽🔽 COLLER LA SECTION 3 ENSUITE (CSS + RENDER JSX + export default) 🔽🔽🔽
// =================== STEP 3 / 3 — CSS + RENDER JSX + EXPORT ===================

return (
  <>
    {/* =================== CSS (toutes les classes utilisées) =================== */}
    <style
      dangerouslySetInnerHTML={{
        __html: `
/* ---------- Container ---------- */
.step1-container{padding:0;margin:0;max-width:100%;color:#fff;position:relative;z-index:1;}
.premium-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;margin-bottom:32px;align-items:start;}
.full-width-section{grid-column:1/-1;}
/* ---------- Sections ---------- */
.form-section{background:rgba(30,41,59,.6);backdrop-filter:blur(20px);border:1px solid rgba(100,116,139,.3);border-radius:20px;padding:24px;transition:.3s;height:fit-content;display:flex;flex-direction:column;position:relative;z-index:2;}
.form-section:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.5);box-shadow:0 8px 25px rgba(59,130,246,.15);}
.lockout-section{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);grid-column:1/-1;}
.lockout-section:hover{border-color:rgba(239,68,68,.5);box-shadow:0 8px 25px rgba(239,68,68,.15);}
/* ---------- Headers ---------- */
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid rgba(100,116,139,.2);min-height:44px;}
.section-icon{width:24px;height:24px;color:#3b82f6;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3));}
.lockout-icon{color:#ef4444!important;}
.section-title{color:#fff;font-size:18px;font-weight:700;margin:0;text-shadow:0 1px 2px rgba(0,0,0,.3);line-height:1.2;}
/* ---------- Fields ---------- */
.form-field{margin-bottom:20px;display:flex;flex-direction:column;}
.field-label{display:flex;align-items:center;gap:8px;color:#e2e8f0;font-size:14px;font-weight:600;margin-bottom:8px;}
.required-indicator{color:#ef4444;margin-left:4px;}
.field-help{font-size:12px;color:#64748b;margin-top:6px;font-style:italic;}
.two-column{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
.premium-input,.premium-select,.premium-textarea{width:100%;padding:14px 16px;background:rgba(15,23,42,.8);border:2px solid rgba(100,116,139,.3);border-radius:12px;color:#fff;font-size:15px;font-weight:500;transition:.3s;backdrop-filter:blur(10px);box-sizing:border-box;min-height:50px;font-family:inherit;}
.premium-input:focus,.premium-select:focus,.premium-textarea:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);background:rgba(15,23,42,.9);}
.premium-textarea{min-height:120px;resize:vertical;}
.premium-input::placeholder,.premium-textarea::placeholder{color:#64748b;font-weight:400;}
/* ---------- Buttons ---------- */
.btn-primary{background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;color:#fff;padding:12px 20px;border-radius:12px;font-weight:600;cursor:pointer;transition:.3s;display:flex;align-items:center;gap:8px;min-height:48px;font-size:14px;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(59,130,246,.3);}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-secondary{background:rgba(100,116,139,.6);border:1px solid rgba(148,163,184,.3);color:#fff;padding:10px 16px;border-radius:8px;font-weight:600;cursor:pointer;transition:.3s;display:flex;align-items:center;gap:6px;font-size:14px;min-height:40px;}
.btn-secondary:hover{background:rgba(100,116,139,.8);transform:translateY(-1px);}
.btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);border:none;color:#fff;padding:8px 12px;border-radius:8px;font-weight:500;cursor:pointer;transition:.3s;display:flex;align-items:center;gap:6px;font-size:14px;min-height:36px;}
.btn-danger:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(239,68,68,.3);}
.btn-icon{background:rgba(34,197,94,.1);border:1px solid #22c55e;color:#22c55e;padding:8px;border-radius:8px;cursor:pointer;transition:.3s;display:flex;align-items:center;justify-content:center;min-width:36px;min-height:36px;}
.btn-icon:hover{background:rgba(34,197,94,.2);transform:translateY(-2px);}
.btn-icon.copied{background:rgba(34,197,94,.2);}
/* ---------- AST Card ---------- */
.ast-number-card{background:linear-gradient(135deg,rgba(34,197,94,.1) 0%,rgba(16,185,129,.1) 100%);border:2px solid #22c55e;border-radius:20px;padding:24px;margin-bottom:32px;position:relative;overflow:hidden;z-index:2;}
.ast-number-card::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(34,197,94,.1),transparent);animation:shine 3s ease-in-out infinite;}
.ast-number-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;min-height:32px;}
.ast-number-title{color:#22c55e;font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
.ast-number-value{font-family:Menlo,Monaco,'Courier New',monospace;font-size:24px;font-weight:800;color:#22c55e;letter-spacing:1px;text-shadow:0 2px 4px rgba(0,0,0,.3);margin-bottom:12px;}
@keyframes shine{0%{left:-100%}50%{left:100%}100%{left:100%}}
/* ---------- Stats Card ---------- */
.location-stats-card{background:linear-gradient(135deg,rgba(16,185,129,.1) 0%,rgba(5,150,105,.1) 100%);border:2px solid rgba(16,185,129,.3);border-radius:20px;padding:24px;margin-bottom:24px;position:relative;overflow:hidden;z-index:2;}
.stats-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;color:#10b981;font-size:18px;font-weight:700;}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:20px;}
.stat-item{background:rgba(15,23,42,.8);border:1px solid rgba(100,116,139,.3);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;transition:.3s;min-height:70px;}
.stat-item:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(0,0,0,.2);}
.stat-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.stat-icon.total-workers{background:rgba(59,130,246,.2);color:#3b82f6;}
.stat-icon.total-locations{background:rgba(16,185,129,.2);color:#10b981;}
.stat-icon.total-lockouts{background:rgba(239,68,68,.2);color:#ef4444;}
.stat-icon.utilization-rate{background:rgba(245,158,11,.2);color:#f59e0b;}
.stat-content{flex:1;min-width:0;}
.stat-value{font-size:24px;font-weight:800;color:#fff;line-height:1;margin-bottom:4px;}
.stat-label{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.location-breakdown{border-top:1px solid rgba(100,116,139,.2);padding-top:16px;}
.breakdown-title{color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 12px;}
.breakdown-list{display:flex;flex-direction:column;gap:12px;}
.breakdown-item{display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.2);border-radius:8px;gap:16px;}
.location-name{display:block;font-weight:600;color:#fff;font-size:13px;margin-bottom:2px;}
.location-details{display:block;font-size:11px;color:#94a3b8;}
.breakdown-utilization{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.utilization-bar{width:60px;height:6px;background:rgba(100,116,139,.3);border-radius:3px;overflow:hidden;}
.utilization-fill{height:100%;transition:width .5s;border-radius:3px;}
.utilization-text{font-size:11px;font-weight:600;color:#e2e8f0;min-width:32px;text-align:right;}
/* ---------- Work Locations ---------- */
.work-locations-section{background:rgba(30,41,59,.6);backdrop-filter:blur(20px);border:1px solid rgba(100,116,139,.3);border-radius:20px;padding:24px;margin-bottom:24px;position:relative;z-index:2;}
.locations-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
.locations-list{display:flex;flex-direction:column;gap:16px;}
.location-item{background:rgba(15,23,42,.8);border:1px solid rgba(100,116,139,.3);border-radius:12px;padding:16px;transition:.3s;}
.location-item:hover{transform:translateY(-2px);border-color:rgba(59,130,246,.5);box-shadow:0 4px 15px rgba(59,130,246,.1);}
.location-main{display:flex;align-items:flex-start;gap:16px;margin-bottom:12px;}
.location-info{flex:1;min-width:0;}
.location-description{color:#94a3b8;font-size:13px;margin:0 0 8px;line-height:1.4;}
.location-metadata{display:flex;flex-wrap:wrap;gap:12px;}
.location-zone,.location-building,.location-floor{font-size:11px;color:#64748b;background:rgba(100,116,139,.1);padding:2px 6px;border-radius:4px;display:flex;align-items:center;gap:4px;}
.location-stats{display:flex;flex-direction:column;gap:8px;flex-shrink:0;}
.location-stat{display:flex;align-items:center;gap:6px;color:#e2e8f0;font-size:12px;font-weight:500;}
.location-remove{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:8px;border-radius:8px;cursor:pointer;transition:.3s;display:flex;align-items:center;justify-content:center;min-width:36px;min-height:36px;}
.location-remove:hover{background:rgba(239,68,68,.2);transform:translateY(-1px);}
.location-capacity-bar{width:100%;height:6px;background:rgba(100,116,139,.3);border-radius:3px;overflow:hidden;margin-bottom:4px;}
.capacity-fill{height:100%;transition:width .5s;border-radius:3px;}
.capacity-text{font-size:11px;color:#94a3b8;text-align:center;}
.empty-locations{text-align:center;padding:40px 20px;color:#64748b;}
/* ---------- Modal Ultra-Critique ---------- */
.modal-overlay-ultra-critical{position:fixed!important;inset:0!important;background:rgba(0,0,0,.98)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:2147483647!important;padding:16px;backdrop-filter:blur(15px)!important;}
.modal-content-ultra-critical{background:rgba(15,23,42,1)!important;border:3px solid rgba(59,130,246,.8)!important;border-radius:20px;max-width:700px;width:100%;max-height:calc(100vh - 32px);overflow-y:auto;z-index:2147483647!important;position:relative!important;box-shadow:0 50px 100px rgba(0,0,0,.95)!important;}
.modal-input-critical{background:rgba(15,23,42,1)!important;border:2px solid rgba(100,116,139,.5)!important;}
.modal-input-critical:focus{border-color:#3b82f6!important;box-shadow:0 0 0 4px rgba(59,130,246,.2)!important;outline:none!important;}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:24px 24px 0;margin-bottom:20px;}
.modal-header h3{color:#fff;font-size:20px;font-weight:700;margin:0;}
.modal-close{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;cursor:pointer;padding:10px;border-radius:8px;transition:.3s;display:flex;align-items:center;justify-content:center;}
.modal-close:hover{background:rgba(239,68,68,.2);transform:scale(1.05);}
.modal-body{padding:0 24px;}
.modal-footer{display:flex;gap:12px;padding:20px 24px 24px;justify-content:flex-end;}
.form-row{margin-bottom:20px;}
.form-row.two-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
/* ---------- Lockout & Photos ---------- */
.energy-type-selector{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:16px;}
.energy-type-option{padding:12px;background:rgba(15,23,42,.8);border:2px solid rgba(100,116,139,.3);border-radius:12px;cursor:pointer;transition:.3s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;min-height:80px;justify-content:center;}
.energy-type-option.selected{border-color:#ef4444;background:rgba(239,68,68,.1);}
.energy-type-option:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(0,0,0,.2);}
.lockout-point{background:rgba(15,23,42,.8);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:20px;margin-bottom:20px;position:relative;}
.lockout-point-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(239,68,68,.2);min-height:40px;}
.procedures-list{background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.2);border-radius:12px;padding:16px;margin-top:12px;}
.procedures-list h4{color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 12px;}
.procedures-checklist{margin:0;padding:0;list-style:none;}
.procedure-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;padding:8px;border-radius:8px;transition:.3s;cursor:pointer;}
.procedure-item:hover{background:rgba(59,130,246,.1);}
.procedure-item.completed{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);}
.procedure-checkbox{width:18px;height:18px;border:2px solid rgba(100,116,139,.5);border-radius:4px;background:rgba(15,23,42,.8);display:flex;align-items:center;justify-content:center;transition:.3s;flex-shrink:0;margin-top:2px;}
.procedure-checkbox.checked{background:#22c55e;border-color:#22c55e;color:#fff;}
.procedure-text{color:#94a3b8;font-size:13px;line-height:1.5;flex:1;}
.procedure-item.completed .procedure-text{color:#a7f3d0;}
.procedures-progress{margin-top:12px;padding-top:12px;border-top:1px solid rgba(100,116,139,.2);}
.progress-bar{background:rgba(15,23,42,.8);border-radius:8px;height:6px;overflow:hidden;margin-bottom:8px;}
.progress-fill{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);transition:width .5s;border-radius:8px;}
.progress-text{font-size:12px;color:#64748b;text-align:center;}
.time-quick-select{display:flex;gap:6px;margin-top:8px;}
.time-btn{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#60a5fa;padding:6px 10px;border-radius:6px;cursor:pointer;transition:.3s;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:500;flex:1;justify-content:center;min-height:32px;}
.time-btn:hover{background:rgba(59,130,246,.2);border-color:rgba(59,130,246,.5);transform:translateY(-1px);}
.time-btn.now{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:#4ade80;}
.time-btn.plus5{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:#fbbf24;}
.time-btn.plus15{background:rgba(139,92,246,.1);border-color:rgba(139,92,246,.3);color:#a78bfa;}
.photo-capture-buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.photo-capture-btn{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);color:#60a5fa;padding:8px 12px;border-radius:8px;cursor:pointer;transition:.3s;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;min-height:36px;}
.photo-capture-btn:hover{background:rgba(59,130,246,.2);transform:translateY(-1px);}
.empty-photo-placeholder{border-radius:12px;padding:40px 20px;text-align:center;cursor:pointer;transition:.3s;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:140px;}
.photo-carousel{position:relative;margin-top:16px;background:rgba(15,23,42,.8);border:1px solid rgba(100,116,139,.3);border-radius:16px;overflow:hidden;}
.carousel-container{position:relative;width:100%;height:300px;overflow:hidden;}
.carousel-track{display:flex;transition:transform .3s;height:100%;}
.carousel-slide{min-width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;}
.carousel-slide img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;}
.carousel-slide.add-photo{background:rgba(59,130,246,.1);border:2px dashed rgba(59,130,246,.3);cursor:pointer;transition:.3s;flex-direction:column;gap:16px;}
.carousel-slide.add-photo:hover{background:rgba(59,130,246,.2);border-color:rgba(59,130,246,.5);}
.add-photo-content{display:flex;flex-direction:column;align-items:center;gap:12px;color:#60a5fa;}
.add-photo-icon{width:48px;height:48px;background:rgba(59,130,246,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.3s;}
.carousel-slide.add-photo:hover .add-photo-icon{transform:scale(1.1);background:rgba(59,130,246,.3);}
.carousel-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.7);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.3s;z-index:10;}
.carousel-nav:hover{background:rgba(0,0,0,.9);transform:translateY(-50%) scale(1.1);}
.carousel-nav.prev{left:16px;}
.carousel-nav.next{right:16px;}
.carousel-indicators{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}
.carousel-indicator{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.4);cursor:pointer;transition:.3s;}
.carousel-indicator.active{background:rgba(255,255,255,.9);transform:scale(1.2);}
.photo-info{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.8));color:#fff;padding:20px 16px 16px;display:flex;justify-content:space-between;align-items:flex-end;}
.photo-caption h4{margin:0 0 4px;font-size:14px;font-weight:600;}
.photo-caption p{margin:0;font-size:12px;opacity:.8;}
.photo-actions{display:flex;gap:8px;}
.photo-action-btn{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:#fff;padding:6px;border-radius:6px;cursor:pointer;transition:.3s;display:flex;align-items:center;justify-content:center;min-width:28px;min-height:28px;}
.photo-action-btn:hover{background:rgba(255,255,255,.3);}
.photo-action-btn.delete:hover{background:rgba(239,68,68,.8);border-color:#ef4444;}
/* ---------- Responsive ---------- */
@media (max-width:768px){
  .premium-grid{grid-template-columns:1fr;gap:16px;}
  .form-section{padding:16px;}
  .two-column,.form-row.two-columns{grid-template-columns:1fr;gap:12px;}
  .stats-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
  .locations-header{flex-direction:column;align-items:stretch;gap:16px;}
  .location-main{flex-direction:column;gap:12px;}
  .location-stats{flex-direction:row;justify-content:space-between;}
  .modal-content-ultra-critical{margin:8px;max-height:calc(100vh - 16px);}
  .modal-header,.modal-body,.modal-footer{padding-left:16px;padding-right:16px;}
  .energy-type-selector{grid-template-columns:repeat(2,1fr);}
  .photo-capture-buttons{flex-direction:column;}
  .time-quick-select{flex-direction:column;gap:4px;}
  .time-btn{flex:none;}
}
@media (max-width:480px){
  .form-section{padding:12px;}
  .stats-grid{grid-template-columns:1fr;}
  .stat-item{padding:12px;}
  .ast-number-value{font-size:18px;}
  .energy-type-selector{grid-template-columns:1fr;}
  .lockout-point-header{flex-direction:column;align-items:flex-start;gap:12px;}
  .carousel-nav{width:36px;height:36px;}
  .carousel-nav.prev{left:8px;}
  .carousel-nav.next{right:8px;}
}
        `,
      }}
    />

    {/* input caché pour la capture/photo */}
    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />

    <div className="step1-container">
      {/* Carte AST */}
      <ASTNumberCard />

      {/* Stats temps réel (si emplacements) */}
      {projectData.workLocations.length > 0 && <LocationStatsCard />}

      {/* Gestion des emplacements */}
      <WorkLocationManager />

      {/* Grille principale */}
      <div className="premium-grid">
        {/* Client */}
        <div className="form-section">
          <div className="section-header">
            <Building className="section-icon" />
            <h3 className="section-title">{t.clientInfo}</h3>
          </div>

          <div className="form-field">
            <label className="field-label">
              <Building style={{ width: 18, height: 18 }} />
              {t.clientName}<span className="required-indicator">{t.required}</span>
            </label>
            <input
              type="text"
              className="premium-input"
              placeholder={t.clientNamePlaceholder}
              value={projectData.client}
              onChange={(e) => updateProjectField('client', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label"><Phone style={{ width: 18, height: 18 }} />{t.clientPhone}</label>
            <input
              type="tel"
              className="premium-input"
              placeholder={t.clientPhonePlaceholder}
              value={projectData.clientPhone}
              onChange={(e) => updateProjectField('clientPhone', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label"><User style={{ width: 18, height: 18 }} />{t.clientRepresentative}</label>
            <input
              type="text"
              className="premium-input"
              placeholder={t.clientRepPlaceholder}
              value={projectData.clientRepresentative}
              onChange={(e) => updateProjectField('clientRepresentative', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label"><Phone style={{ width: 18, height: 18 }} />{t.repPhone}</label>
            <input
              type="tel"
              className="premium-input"
              placeholder={t.repPhonePlaceholder}
              value={projectData.clientRepresentativePhone}
              onChange={(e) => updateProjectField('clientRepresentativePhone', e.target.value)}
            />
          </div>
        </div>

        {/* Projet */}
        <div className="form-section">
          <div className="section-header">
            <Briefcase className="section-icon" />
            <h3 className="section-title">{t.projectDetails}</h3>
          </div>

          <div className="form-field">
            <label className="field-label">
              <Briefcase style={{ width: 18, height: 18 }} />
              {t.projectNumber}<span className="required-indicator">{t.required}</span>
            </label>
            <input
              type="text"
              className="premium-input"
              placeholder={t.projectNumberPlaceholder}
              value={projectData.projectNumber}
              onChange={(e) => updateProjectField('projectNumber', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label"><FileText style={{ width: 18, height: 18 }} />{t.astClientNumber}</label>
            <input
              type="text"
              className="premium-input"
              placeholder={t.astClientPlaceholder}
              value={projectData.astClientNumber}
              onChange={(e) => updateProjectField('astClientNumber', e.target.value)}
            />
            <div className="field-help">{t.astClientHelp}</div>
          </div>

          <div className="two-column">
            <div className="form-field">
              <label className="field-label"><Calendar style={{ width: 18, height: 18 }} />{t.date}</label>
              <input
                type="date"
                className="premium-input"
                value={projectData.date}
                onChange={(e) => updateProjectField('date', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label"><Clock style={{ width: 18, height: 18 }} />{t.time}</label>
              <input
                type="time"
                className="premium-input"
                value={projectData.time}
                onChange={(e) => updateProjectField('time', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="form-section">
          <div className="section-header">
            <MapPin className="section-icon" />
            <h3 className="section-title">{t.location}</h3>
          </div>

          <div className="form-field">
            <label className="field-label">
              <MapPin style={{ width: 18, height: 18 }} />
              {t.workLocation}<span className="required-indicator">{t.required}</span>
            </label>
            <input
              type="text"
              className="premium-input"
              placeholder={t.workLocationPlaceholder}
              value={projectData.workLocation}
              onChange={(e) => updateProjectField('workLocation', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label"><Briefcase style={{ width: 18, height: 18 }} />{t.industryType}</label>
            <IndustrySelector />
          </div>
        </div>

        {/* Urgence */}
        <div className="form-section">
          <div className="section-header">
            <AlertTriangle className="section-icon" />
            <h3 className="section-title">{t.emergency}</h3>
          </div>

          <div className="two-column">
            <div className="form-field">
              <label className="field-label"><AlertTriangle style={{ width: 18, height: 18 }} />{t.emergencyContact}</label>
              <input
                type="text"
                className="premium-input"
                placeholder={t.emergencyContactPlaceholder}
                value={projectData.emergencyContact}
                onChange={(e) => updateProjectField('emergencyContact', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label"><Phone style={{ width: 18, height: 18 }} />{t.emergencyPhone}</label>
              <input
                type="tel"
                className="premium-input"
                placeholder={t.emergencyPhonePlaceholder}
                value={projectData.emergencyPhone}
                onChange={(e) => updateProjectField('emergencyPhone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h3 className="section-title">{t.workDescription}</h3>
          </div>
          <div className="form-field">
            <label className="field-label">
              <FileText style={{ width: 18, height: 18 }} />
              {t.workDescriptionLabel}<span className="required-indicator">{t.required}</span>
            </label>
            <textarea
              className="premium-textarea"
              style={{ width: '100%', minHeight: '200px', maxWidth: 'none', resize: 'vertical' }}
              placeholder={t.workDescriptionPlaceholder}
              value={projectData.workDescription}
              onChange={(e) => updateProjectField('workDescription', e.target.value)}
            />
            <div className="field-help">{t.workDescriptionHelp}</div>
          </div>
        </div>
      </div>

      {/* Verrouillage / Cadenassage */}
      <LockoutSection />
    </div>
  </>
);

// =================== EXPORT ===================
}

export default Step1ProjectInfo;
