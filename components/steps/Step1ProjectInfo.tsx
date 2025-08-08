// =================== SECTION 1/5 - IMPORTS & INTERFACES COMPATIBLES ===================
'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, BarChart3,
  TrendingUp, Activity, Shield
} from 'lucide-react';

// =================== 🔥 INTERFACES COMPATIBLES AVEC ASTFORM EXISTANT ===================
interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

// =================== INTERFACES MÉTIER CONSERVÉES ===================
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

// =================== TRADUCTIONS COMPLÈTES CONSERVÉES ===================
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
    workDescriptionPlaceholder: "Décrivez en détail les travaux à effectuer :\n\n• Méthodes utilisées\n• Équipements impliqués\n• Zones d'intervention\n• Procédures spéciales\n• Conditions particulières\n\nPlus la description est détaillée, plus l'analyse de sécurité sera précise.",
    workDescriptionHelp: "Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.",
    
    // Lockout
    lockoutDescription: "Documentation des procédures de verrouillage/étiquetage des énergies dangereuses selon les normes RSST. Photographiez chaque étape pour assurer une traçabilité complète.",
    generalPhotos: "Photos Générales de Verrouillage",
    beforeLockout: "Avant verrouillage",
    clientForm: "Fiche client",
    verification: "Vérification finale",
    duringLockout: "Pendant verrouillage",
    lockoutDevice: "Dispositif",
    
    // Points de verrouillage
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
    
    // Messages d'erreur
    required: "*",
    
    // Boutons
    add: "Ajouter",
    cancel: "Annuler",
    save: "Sauvegarder",
    edit: "Modifier",
    adding: "Ajout en cours...",
    
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
    // AST Generator
    astNumberTitle: "🔢 Unique JSA Number",
    astNumberGenerated: "Automatically generated number - Single use for this JSA",
    copyNumber: "Copy number",
    generateNew: "Generate new number",
    
    // Main sections
    clientInfo: "🏢 Client Information",
    projectDetails: "📋 Project Details",
    location: "📍 Location",
    workLocations: "🏗️ Work Locations",
    locationStats: "📊 Real-Time Statistics",
    emergency: "🚨 Emergency Contacts",
    workDescription: "📝 Detailed Work Description",
    lockoutSection: "🔒 Lockout / Tagout (LOTO)",
    
    // Client fields
    clientName: "Client Name",
    clientNamePlaceholder: "Ex: Hydro-Quebec, Bell Canada...",
    clientPhone: "Client Phone",
    clientPhonePlaceholder: "Ex: (514) 555-0123",
    clientRepresentative: "Client Representative",
    clientRepPlaceholder: "Project manager name",
    repPhone: "Representative Phone",
    repPhonePlaceholder: "Ex: (514) 555-0456",
    
    // Project fields
    projectNumber: "Project Number",
    projectNumberPlaceholder: "Ex: PRJ-2025-001",
    astClientNumber: "# Client JSA (Optional)",
    astClientPlaceholder: "Number provided by client",
    astClientHelp: "Client reference number (if applicable)",
    date: "Date",
    time: "Time",
    
    // Location
    workLocation: "Work Location",
    workLocationPlaceholder: "Complete address of work site",
    industryType: "Industry Type",
    
    // Multiple locations
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
    
    // Industries
    electrical: "⚡ Electrical",
    construction: "🏗️ Construction",
    industrial: "🏭 Industrial",
    manufacturing: "⚙️ Manufacturing",
    office: "🏢 Office/Administrative",
    other: "🔧 Other",
    
    // Emergency
    emergencyContact: "Emergency Contact",
    emergencyContactPlaceholder: "Emergency contact name",
    emergencyPhone: "Emergency Phone",
    emergencyPhonePlaceholder: "911 or specific number",
    
    // Description
    workDescriptionLabel: "Complete Description",
    workDescriptionPlaceholder: "Describe in detail the work to be performed:\n\n• Methods used\n• Equipment involved\n• Work areas\n• Special procedures\n• Particular conditions\n\nThe more detailed the description, the more accurate the safety analysis.",
    workDescriptionHelp: "A complete description helps identify all potential risks and choose appropriate safety measures.",
    
    // Lockout
    lockoutDescription: "Documentation of lockout/tagout procedures for hazardous energies according to OHSA standards. Photograph each step to ensure complete traceability.",
    generalPhotos: "General Lockout Photos",
    beforeLockout: "Before lockout",
    clientForm: "Client form",
    verification: "Final verification",
    duringLockout: "During lockout",
    lockoutDevice: "Device",
    
    // Lockout points
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
    
    // Photos
    noPhotos: "No photos",
    addPhoto: "Add photo",
    addPhotoDescription: "Document this step with a photo",
    clickToPhoto: "Click to take your first lockout photo",
    clickToPhotoDevice: "Click to take a photo with device",
    noLockoutPoints: "No Lockout Points",
    noLockoutDescription: "Click \"Add Lockout Point\" to document LOTO procedures",
    
    // Procedures
    proceduresToFollow: "🔧 Procedures to Follow:",
    stepsCompleted: "steps completed",
    
    // Error messages
    required: "*",
    
    // Buttons
    add: "Add",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    adding: "Adding...",
    
    // Statistics
    totalWorkers: "Total Workers",
    totalLocations: "Active Locations",
    totalLockouts: "Applied Locks",
    peakUtilization: "Peak Utilization",
    locationBreakdown: "Breakdown by Location",
    workersCount: "workers",
    lockoutsCount: "locks",
    currentWorkers: "current",
    maxReached: "max reached",
    
    // Photo categories
    categories: {
      before_lockout: "Before lockout",
      during_lockout: "During lockout",
      lockout_device: "Lockout device",
      client_form: "Client form",
      verification: "Verification"
    }
  }
};

// =================== TYPES D'ÉNERGIE AVEC PROCÉDURES CONSERVÉS ===================
const getEnergyTypes = (language: 'fr' | 'en') => ({
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
      'Supporter les charges suspendues', 
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
});

// =================== GÉNÉRATEUR NUMÉRO AST CONSERVÉ ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

// =================== 🔥 COMPOSANT PRINCIPAL - ARCHITECTURE ULTRA-STABLE ===================
function Step1ProjectInfo({ formData, onDataChange, language, tenant, errors = {} }: Step1ProjectInfoProps) {
  
  // =================== CONFIGURATION & TRADUCTIONS ===================
  const t = translations[language];
  const ENERGY_TYPES = getEnergyTypes(language);
  
  // =================== 🔥 EXTRACTION DONNÉES EXISTANTES - COMPATIBLE AVEC ASTFORM ===================
  const projectInfo = useMemo(() => formData?.projectInfo || {}, [formData?.projectInfo]);
  const lockoutPoints = useMemo(() => projectInfo?.lockoutPoints || [], [projectInfo?.lockoutPoints]);
  const lockoutPhotos = useMemo(() => projectInfo?.lockoutPhotos || [], [projectInfo?.lockoutPhotos]);
  const workLocations = useMemo(() => projectInfo?.workLocations || [], [projectInfo?.workLocations]);
  
  // =================== 🔥 ÉTAT LOCAL ULTRA-MINIMAL (STYLE STEP5) ===================
  const [localData, setLocalData] = useState(() => ({
    // ✅ INITIALISATION DIRECTE SANS BOUCLE - Compatible avec formData existant
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
    // ✅ Données complexes référencées directement
    workLocations: workLocations,
    lockoutPoints: lockoutPoints,
    lockoutPhotos: lockoutPhotos
  }));

  // =================== ÉTATS UI SÉPARÉS (ISOLATION CRITIQUE) ===================
  const [astNumber, setAstNumber] = useState(() => formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentLockoutPhotoIndex, setCurrentLockoutPhotoIndex] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== 🔥 ÉTATS MODAL AVEC ISOLATION ULTRA-CRITIQUE ===================
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    zone: '',
    building: '',
    floor: '',
    estimatedDuration: '',
    startTime: '',
    endTime: ''
  });
  const [isModalSaving, setIsModalSaving] = useState(false);

  // =================== 🔥 NOTIFICATION PARENT ULTRA-STABLE (COMPATIBLE ASTFORM) ===================
  const stableFormDataRef = useRef(localData);
  const lastUpdateRef = useRef<string>('');
  
  // ✅ HANDLER PARENT FIGÉ UNE SEULE FOIS
  const notifyParentStable = useCallback((updatedData: any) => {
    const updateKey = JSON.stringify(updatedData).slice(0, 100);
    
    // 🛡️ ÉVITER DOUBLONS
    if (lastUpdateRef.current === updateKey) {
      console.log('🛡️ Step1 - Doublon évité');
      return;
    }
    
    lastUpdateRef.current = updateKey;
    console.log('🔥 Step1 - Notification parent stable:', Object.keys(updatedData));
    
    // ✅ SYNC DIFFÉRÉE POUR ÉVITER BOUCLES
    setTimeout(() => {
      try {
        onDataChange('projectInfo', updatedData);
      } catch (error) {
        console.error('❌ Step1 - Erreur sync parent:', error);
      }
    }, 50);
  }, [onDataChange]);

  // =================== 🔥 HANDLERS ULTRA-STABLES ===================
  const updateField = useCallback((field: string, value: any) => {
    console.log('🔥 Step1 - Update field:', field, value);
    
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      stableFormDataRef.current = updated;
      
      // ✅ Notification parent immédiate
      notifyParentStable(updated);
      
      return updated;
    });
  }, [notifyParentStable]);

  // =================== HANDLERS SPÉCIALISÉS ===================
  const updateLockoutPoint = useCallback((pointId: string, field: string, value: any) => {
    const updatedPoints = localData.lockoutPoints.map((point: LockoutPoint) => 
      point.id === pointId ? { ...point, [field]: value } : point
    );
    
    setLocalData(prev => {
      const updated = { ...prev, lockoutPoints: updatedPoints };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
  }, [localData.lockoutPoints, notifyParentStable]);

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
      assignedLocation: localData.workLocations.length > 0 ? localData.workLocations[0].id : undefined
    };

    setLocalData(prev => {
      const updated = { ...prev, lockoutPoints: [...prev.lockoutPoints, newPoint] };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
  }, [localData.workLocations, notifyParentStable]);

  const deleteLockoutPoint = useCallback((pointId: string) => {
    const updatedPoints = localData.lockoutPoints.filter((point: LockoutPoint) => point.id !== pointId);
    const updatedPhotos = localData.lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId !== pointId);
    
    setLocalData(prev => {
      const updated = { 
        ...prev, 
        lockoutPoints: updatedPoints,
        lockoutPhotos: updatedPhotos 
      };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
  }, [localData.lockoutPoints, localData.lockoutPhotos, notifyParentStable]);

  // =================== 🔥 HANDLER MODAL ISOLÉ (SANS SYNC) ===================
  const updateModalField = useCallback((field: string, value: string) => {
    setNewLocation(prev => ({ ...prev, [field]: value }));
    // ✅ PAS de sync vers parent - isolation complète
  }, []);

  // =================== SECTION 2/5 - FONCTIONS UTILITAIRES & HANDLERS COMPLEXES ===================

  // =================== GESTION EMPLACEMENTS DE TRAVAIL OPTIMISÉE ===================
  const addWorkLocation = useCallback(() => {
    if (!newLocation.name.trim() || !newLocation.zone.trim()) {
      return;
    }

    if (isModalSaving) return;
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
      estimatedDuration: newLocation.estimatedDuration.trim() || '8 heures',
      startTime: newLocation.startTime || '08:00',
      endTime: newLocation.endTime || '16:00'
    };

    setLocalData(prev => {
      const updated = { ...prev, workLocations: [...prev.workLocations, location] };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });

    // Reset formulaire modal
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
    console.log('✅ Step1 - Emplacement ajouté:', location.name);
  }, [newLocation, notifyParentStable, isModalSaving]);

  const removeWorkLocation = useCallback((locationId: string) => {
    const updatedLocations = localData.workLocations.filter((loc: WorkLocation) => loc.id !== locationId);
    
    // Retirer l'assignation des lockout points
    const updatedLockouts = localData.lockoutPoints.map((point: LockoutPoint) => 
      point.assignedLocation === locationId 
        ? { ...point, assignedLocation: undefined }
        : point
    );
    
    setLocalData(prev => {
      const updated = { 
        ...prev, 
        workLocations: updatedLocations,
        lockoutPoints: updatedLockouts 
      };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
    
    console.log('✅ Step1 - Emplacement supprimé:', locationId);
  }, [localData.workLocations, localData.lockoutPoints, notifyParentStable]);

  // =================== MISE À JOUR STATISTIQUES WORKERS ===================
  const updateLocationWorkerCount = useCallback((locationId: string, newWorkerCount: number) => {
    const updatedLocations = localData.workLocations.map((loc: WorkLocation) => {
      if (loc.id === locationId) {
        const updatedMaxReached = Math.max(loc.maxWorkersReached, newWorkerCount);
        return { 
          ...loc, 
          currentWorkers: newWorkerCount,
          maxWorkersReached: updatedMaxReached
        };
      }
      return loc;
    });
    
    setLocalData(prev => {
      const updated = { ...prev, workLocations: updatedLocations };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
    
    console.log(`✅ Step1 - Emplacement ${locationId} - Travailleurs: ${newWorkerCount}`);
  }, [localData.workLocations, notifyParentStable]);

  // =================== GESTION PHOTOS OPTIMISÉE ===================
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
      const newPhoto: LockoutPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
        category: category as any,
        timestamp: new Date().toISOString(),
        lockoutPointId
      };
      
      setLocalData(prev => {
        const updated = { ...prev, lockoutPhotos: [...prev.lockoutPhotos, newPhoto] };
        stableFormDataRef.current = updated;
        notifyParentStable(updated);
        return updated;
      });
      
      console.log('✅ Step1 - Photo ajoutée:', newPhoto.id);
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  }, [language, notifyParentStable]);

  const deletePhoto = useCallback((photoId: string) => {
    setLocalData(prev => {
      const updated = { 
        ...prev, 
        lockoutPhotos: prev.lockoutPhotos.filter((photo: LockoutPhoto) => photo.id !== photoId) 
      };
      stableFormDataRef.current = updated;
      notifyParentStable(updated);
      return updated;
    });
    
    console.log('✅ Step1 - Photo supprimée:', photoId);
  }, [notifyParentStable]);

  // =================== HANDLERS AST ET UTILITAIRES ===================
  const copyASTNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  }, [astNumber]);

  const regenerateASTNumber = useCallback(() => {
    const newNumber = generateASTNumber();
    setAstNumber(newNumber);
    console.log('✅ Step1 - Nouveau numéro AST:', newNumber);
  }, []);

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryLabel = useCallback((category: string): string => {
    return t.categories[category as keyof typeof t.categories] || category;
  }, [t.categories]);

  const toggleProcedureComplete = useCallback((pointId: string, procedureIndex: number) => {
    const point = localData.lockoutPoints.find((p: LockoutPoint) => p.id === pointId);
    if (!point) return;

    const completedProcedures = point.completedProcedures || [];
    const isCompleted = completedProcedures.includes(procedureIndex);
    
    const updatedCompleted = isCompleted 
      ? completedProcedures.filter((index: number) => index !== procedureIndex)
      : [...completedProcedures, procedureIndex];

    updateLockoutPoint(pointId, 'completedProcedures', updatedCompleted);
  }, [localData.lockoutPoints, updateLockoutPoint]);

  const getProcedureProgress = useCallback((point: LockoutPoint): { completed: number; total: number; percentage: number } => {
    const energyType = ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES];
    const total = energyType?.procedures.length || 0;
    const completed = (point.completedProcedures || []).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [ENERGY_TYPES]);

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

  const selectEnergyType = useCallback((pointId: string, energyType: string) => {
    updateLockoutPoint(pointId, 'energyType', energyType);
  }, [updateLockoutPoint]);

  // =================== STATISTIQUES TEMPS RÉEL ===================
  const calculateLocationStats = useCallback((): LocationStats => {
    const totalLocations = localData.workLocations.filter((loc: WorkLocation) => loc.isActive).length;
    const totalWorkers = localData.workLocations.reduce((sum: number, loc: WorkLocation) => sum + loc.currentWorkers, 0);
    const activeLockouts = localData.lockoutPoints.filter((point: LockoutPoint) => point.isLocked).length;
    
    const totalMaxReached = localData.workLocations.reduce((sum: number, loc: WorkLocation) => sum + loc.maxWorkersReached, 0);
    const peakUtilization = totalMaxReached > 0 ? Math.round((totalWorkers / totalMaxReached) * 100) : 0;
    
    const locationBreakdown = localData.workLocations.map((loc: WorkLocation) => {
      const locationLockouts = localData.lockoutPoints.filter((point: LockoutPoint) => 
        point.assignedLocation === loc.id && point.isLocked
      ).length;
      
      const utilizationCurrent = loc.maxWorkersReached > 0 
        ? Math.round((loc.currentWorkers / loc.maxWorkersReached) * 100) 
        : 0;
      
      return {
        locationId: loc.id,
        name: loc.name,
        currentWorkers: loc.currentWorkers,
        maxReached: loc.maxWorkersReached,
        lockouts: locationLockouts,
        utilizationCurrent,
        estimatedDuration: loc.estimatedDuration
      };
    });

    return {
      totalWorkers,
      totalLocations,
      activeLockouts,
      peakUtilization,
      locationBreakdown
    };
  }, [localData.workLocations, localData.lockoutPoints]);

  // =================== NAVIGATION CARROUSEL PHOTOS ===================
  const nextSlide = useCallback((photos: LockoutPhoto[], lockoutPointId?: string) => {
    const totalSlides = photos.length + 1;
    const currentIndex = lockoutPointId ? (currentLockoutPhotoIndex[lockoutPointId] || 0) : currentPhotoIndex;
    const newIndex = (currentIndex + 1) % totalSlides;
    
    if (lockoutPointId) {
      setCurrentLockoutPhotoIndex(prev => ({ ...prev, [lockoutPointId]: newIndex }));
    } else {
      setCurrentPhotoIndex(newIndex);
    }
  }, [currentPhotoIndex, currentLockoutPhotoIndex]);

  const prevSlide = useCallback((photos: LockoutPhoto[], lockoutPointId?: string) => {
    const totalSlides = photos.length + 1;
    const currentIndex = lockoutPointId ? (currentLockoutPhotoIndex[lockoutPointId] || 0) : currentPhotoIndex;
    const newIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    
    if (lockoutPointId) {
      setCurrentLockoutPhotoIndex(prev => ({ ...prev, [lockoutPointId]: newIndex }));
    } else {
      setCurrentPhotoIndex(newIndex);
    }
  }, [currentPhotoIndex, currentLockoutPhotoIndex]);

  const goToSlide = useCallback((index: number, lockoutPointId?: string) => {
    if (lockoutPointId) {
      setCurrentLockoutPhotoIndex(prev => ({ ...prev, [lockoutPointId]: index }));
    } else {
      setCurrentPhotoIndex(index);
    }
  }, []);

  // =================== SECTION 3/5 - COMPOSANTS UI OPTIMISÉS & MODALS CRITIQUES ===================

  // =================== CALCUL STATISTIQUES EN TEMPS RÉEL ===================
  const locationStats = calculateLocationStats();

  // =================== COMPOSANT CARROUSEL PHOTOS OPTIMISÉ ===================
  const PhotoCarousel = React.memo(({ photos, onAddPhoto, lockoutPointId }: {
    photos: LockoutPhoto[];
    onAddPhoto: () => void;
    lockoutPointId?: string;
  }) => {
    const currentIndex = lockoutPointId ? (currentLockoutPhotoIndex[lockoutPointId] || 0) : currentPhotoIndex;
    const totalSlides = photos.length + 1;

    const handleNextSlide = useCallback((e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      nextSlide(photos, lockoutPointId);
    }, [photos, lockoutPointId]);

    const handlePrevSlide = useCallback((e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      prevSlide(photos, lockoutPointId);
    }, [photos, lockoutPointId]);

    const handleGoToSlide = useCallback((index: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      goToSlide(index, lockoutPointId);
    }, [lockoutPointId]);

    return (
      <div className="photo-carousel">
        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {photos.map((photo: LockoutPhoto, index: number) => (
              <div key={photo.id} className="carousel-slide">
                <img src={photo.url} alt={photo.caption} />
                <div className="photo-info">
                  <div className="photo-caption">
                    <h4>{getCategoryLabel(photo.category)}</h4>
                    <p>{new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      type="button"
                      className="photo-action-btn delete" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deletePhoto(photo.id);
                      }} 
                      title={language === 'fr' ? "Supprimer cette photo" : "Delete this photo"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="carousel-slide add-photo" onClick={onAddPhoto}>
              <div className="add-photo-content">
                <div className="add-photo-icon"><Camera size={24} /></div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{t.addPhoto}</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textAlign: 'center' }}>
                  {t.addPhotoDescription}
                </p>
              </div>
            </div>
          </div>
          {totalSlides > 1 && (
            <>
              <button 
                type="button"
                className="carousel-nav prev" 
                onClick={handlePrevSlide} 
                disabled={totalSlides <= 1}
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                type="button"
                className="carousel-nav next" 
                onClick={handleNextSlide} 
                disabled={totalSlides <= 1}
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}
          {totalSlides > 1 && (
            <div className="carousel-indicators">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div 
                  key={index} 
                  className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`} 
                  onClick={(e) => handleGoToSlide(index, e)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  });

  // =================== COMPOSANT SÉLECTEUR D'INDUSTRIE OPTIMISÉ ===================
  const IndustrySelector = React.memo(() => (
    <select 
      className="premium-select" 
      value={localData.industry}
      onChange={(e) => {
        e.preventDefault();
        e.stopPropagation();
        updateField('industry', e.target.value);
      }}
    >
      <option value="electrical">{t.electrical}</option>
      <option value="construction">{t.construction}</option>
      <option value="industrial">{t.industrial}</option>
      <option value="manufacturing">{t.manufacturing}</option>
      <option value="office">{t.office}</option>
      <option value="other">{t.other}</option>
    </select>
  ));

  // =================== COMPOSANT VIDE POUR PHOTOS OPTIMISÉ ===================
  const EmptyPhotoPlaceholder = React.memo(({ 
    onClick, 
    title, 
    description, 
    color = "#60a5fa" 
  }: {
    onClick: () => void;
    title: string;
    description: string;
    color?: string;
  }) => (
    <div 
      className="empty-photo-placeholder"
      style={{
        background: `${color}20`, 
        border: `2px dashed ${color}50`,
        borderColor: `${color}50`,
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
      onClick={onClick}
      onMouseEnter={(e) => {
        const target = e.target as HTMLDivElement;
        target.style.background = `${color}30`;
        target.style.borderColor = `${color}70`;
      }}
      onMouseLeave={(e) => {
        const target = e.target as HTMLDivElement;
        target.style.background = `${color}20`;
        target.style.borderColor = `${color}50`;
      }}
    >
      <Camera size={32} color={color} style={{ marginBottom: '12px' }} />
      <h4 style={{ margin: '0 0 8px', color }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
        {description}
      </p>
    </div>
  ));

  // =================== COMPOSANT DASHBOARD STATISTIQUES TEMPS RÉEL ===================
  const LocationStatsCard = React.memo(() => (
    <div className="location-stats-card">
      <div className="stats-header">
        <BarChart3 size={20} />
        <h3>{t.locationStats}</h3>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon total-workers">
            <Users size={18} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{locationStats.totalWorkers}</div>
            <div className="stat-label">{t.totalWorkers}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon total-locations">
            <Building size={18} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{locationStats.totalLocations}</div>
            <div className="stat-label">{t.totalLocations}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon total-lockouts">
            <Lock size={18} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{locationStats.activeLockouts}</div>
            <div className="stat-label">{t.totalLockouts}</div>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon utilization-rate">
            <TrendingUp size={18} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{locationStats.peakUtilization}%</div>
            <div className="stat-label">{t.peakUtilization}</div>
          </div>
        </div>
      </div>

      {/* Détail par emplacement */}
      {locationStats.locationBreakdown.length > 0 && (
        <div className="location-breakdown">
          <h4 className="breakdown-title">{t.locationBreakdown}</h4>
          <div className="breakdown-list">
            {locationStats.locationBreakdown.map((loc) => (
              <div key={loc.locationId} className="breakdown-item">
                <div className="breakdown-info">
                  <span className="location-name">{loc.name}</span>
                  <span className="location-details">
                    {loc.currentWorkers}/{loc.maxReached} {t.workersCount} • {loc.lockouts} {t.lockoutsCount}
                  </span>
                </div>
                <div className="breakdown-utilization">
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill" 
                      style={{ 
                        width: `${Math.min(loc.utilizationCurrent, 100)}%`,
                        backgroundColor: loc.utilizationCurrent > 90 ? '#ef4444' : loc.utilizationCurrent > 70 ? '#f59e0b' : '#10b981'
                      }} 
                    />
                  </div>
                  <span className="utilization-text">{loc.utilizationCurrent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ));

  // =================== COMPOSANT GESTION EMPLACEMENTS AVEC MODAL Z-INDEX CRITIQUE ===================
  const WorkLocationManager = React.memo(() => (
    <div className="work-locations-section">
      <div className="locations-header">
        <div className="section-header">
          <MapPin className="section-icon" />
          <h3 className="section-title">{t.workLocations}</h3>
        </div>
        <button 
          type="button"
          className="btn-primary" 
          onClick={() => setShowAddLocation(true)}
        >
          <Plus size={16} />
          {t.addLocation}
        </button>
      </div>

      {/* Liste des emplacements */}
      {localData.workLocations.length > 0 ? (
        <div className="locations-list">
          {localData.workLocations.map((location: WorkLocation) => (
            <div key={location.id} className="location-item">
              <div className="location-main">
                <div className="location-info">
                  <h4 className="location-name">{location.name}</h4>
                  <p className="location-description">{location.description}</p>
                  <div className="location-metadata">
                    <span className="location-zone">🏢 {location.zone}</span>
                    {location.building && <span className="location-building">🏗️ {location.building}</span>}
                    {location.floor && <span className="location-floor">📍 {location.floor}</span>}
                  </div>
                </div>
                <div className="location-stats">
                  <div className="location-stat">
                    <Users size={14} />
                    <span>{location.currentWorkers}/{location.maxWorkersReached}</span>
                  </div>
                  <div className="location-stat">
                    <Lock size={14} />
                    <span>{location.lockoutPoints}</span>
                  </div>
                  <div className="location-stat">
                    <Clock size={14} />
                    <span>{location.estimatedDuration}</span>
                  </div>
                </div>
                <button 
                  type="button"
                  className="location-remove" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeWorkLocation(location.id);
                  }}
                  title={t.removeLocation}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {/* Barre de capacité */}
              <div className="location-capacity-bar">
                <div 
                  className="capacity-fill" 
                  style={{ 
                    width: `${location.maxWorkersReached > 0 ? Math.min((location.currentWorkers / location.maxWorkersReached) * 100, 100) : 0}%`,
                    backgroundColor: location.currentWorkers > location.maxWorkersReached * 0.9
                      ? '#ef4444' 
                      : location.currentWorkers > location.maxWorkersReached * 0.7 
                        ? '#f59e0b' 
                        : '#10b981'
                  }} 
                />
              </div>
              <div className="capacity-text">
                {location.maxWorkersReached > 0 ? Math.round((location.currentWorkers / location.maxWorkersReached) * 100) : 0}% {t.currentWorkers}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-locations">
          <MapPin size={40} style={{ marginBottom: '12px', color: '#64748b' }} />
          <h4 style={{ margin: '0 0 8px', color: '#94a3b8' }}>{t.noLocations}</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            {t.noLocationsDescription}
          </p>
        </div>
      )}

      {/* =================== 🔥 MODAL CRITIQUE AVEC Z-INDEX ABSOLU MAXIMUM =================== */}
      {showAddLocation && (
        <div 
          className="modal-overlay-ultra-critical" 
          onClick={() => setShowAddLocation(false)}
          style={{ 
            position: 'fixed !important' as any,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.98) !important',
            zIndex: 2147483647,
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            className="modal-content-ultra-critical" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'rgba(15, 23, 42, 1) !important',
              backdropFilter: 'blur(30px)',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              zIndex: 2147483647,
              position: 'relative',
              boxShadow: '0 50px 100px rgba(0, 0, 0, 0.95)'
            }}
          >
            <div className="modal-header">
              <h3>{t.addLocation}</h3>
              <button 
                type="button"
                className="modal-close" 
                onClick={() => setShowAddLocation(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <Building size={16} />
                    {t.locationName} <span className="required-indicator">*</span>
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.locationNamePlaceholder}
                    value={newLocation.name}
                    onChange={(e) => updateModalField('name', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <FileText size={16} />
                    {t.locationDescription}
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.locationDescriptionPlaceholder}
                    value={newLocation.description}
                    onChange={(e) => updateModalField('description', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-field">
                  <label className="field-label">
                    <MapPin size={16} />
                    {t.zone} <span className="required-indicator">*</span>
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.zonePlaceholder}
                    value={newLocation.zone}
                    onChange={(e) => updateModalField('zone', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    <Clock size={16} />
                    {t.workDuration}
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.workDurationPlaceholder}
                    value={newLocation.estimatedDuration}
                    onChange={(e) => updateModalField('estimatedDuration', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-field">
                  <label className="field-label">
                    <Clock size={16} />
                    {t.startTime}
                  </label>
                  <input
                    type="time"
                    className="premium-input modal-input-critical"
                    value={newLocation.startTime}
                    onChange={(e) => updateModalField('startTime', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    <Clock size={16} />
                    {t.endTime}
                  </label>
                  <input
                    type="time"
                    className="premium-input modal-input-critical"
                    value={newLocation.endTime}
                    onChange={(e) => updateModalField('endTime', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
              </div>

              <div className="form-row two-columns">
                <div className="form-field">
                  <label className="field-label">
                    <Building size={16} />
                    {t.building}
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.buildingPlaceholder}
                    value={newLocation.building}
                    onChange={(e) => updateModalField('building', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    <Activity size={16} />
                    {t.floor}
                  </label>
                  <input
                    type="text"
                    className="premium-input modal-input-critical"
                    placeholder={t.floorPlaceholder}
                    value={newLocation.floor}
                    onChange={(e) => updateModalField('floor', e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 1) !important',
                      border: '2px solid rgba(100, 116, 139, 0.5) !important',
                      position: 'relative',
                      zIndex: 2147483647
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => setShowAddLocation(false)}
              >
                {t.cancel}
              </button>
              <button 
                type="button"
                className="btn-primary" 
                onClick={addWorkLocation}
                disabled={!newLocation.name.trim() || !newLocation.zone.trim() || isModalSaving}
              >
                <Plus size={16} />
                {isModalSaving ? t.adding : t.add}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ));

  // =================== COMPOSANT SÉLECTEUR EMPLACEMENT POUR LOCKOUT POINTS ===================
  const LocationSelector = React.memo(({ currentLocationId, onLocationChange }: {
    currentLocationId?: string;
    onLocationChange: (locationId: string) => void;
  }) => (
    <select 
      className="premium-select location-selector" 
      value={currentLocationId || ''}
      onChange={(e) => onLocationChange(e.target.value)}
    >
      <option value="">{language === 'fr' ? 'Sélectionner un emplacement' : 'Select a location'}</option>
      {localData.workLocations.map((location: WorkLocation) => (
        <option key={location.id} value={location.id}>
          {location.name} - {location.zone}
        </option>
      ))}
    </select>
  ));

  // =================== COMPOSANT CARTE AST PREMIUM ===================
  const ASTNumberCard = React.memo(() => (
    <div className="ast-number-card">
      <div className="ast-number-header">
        <div className="ast-number-title">
          <FileText style={{ width: '20px', height: '20px' }} />
          {t.astNumberTitle}
        </div>
        <div className="ast-actions">
          <button 
            type="button"
            className={`btn-icon ${copied ? 'copied' : ''}`} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyASTNumber();
            }} 
            title={t.copyNumber}
          >
            {copied ? <Check style={{ width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
          </button>
          <button 
            type="button"
            className="btn-icon" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              regenerateASTNumber();
            }} 
            title={t.generateNew}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
      <div className="ast-number-value">{astNumber}</div>
      <div className="field-help">{t.astNumberGenerated}</div>
    </div>
  ));

  // =================== SECTION 4/5 - COMPOSANTS LOCKOUT POINTS & SYSTÈME ÉNERGIES ===================

  // =================== COMPOSANT ÉNERGIE AVEC PROCÉDURES INTERACTIVES ===================
  const EnergyTypeSelector = React.memo(({ point }: { point: LockoutPoint }) => (
    <div className="form-field">
      <label className="field-label">{t.energyType}<span className="required-indicator">{t.required}</span></label>
      <div className="energy-type-selector">
        {Object.entries(ENERGY_TYPES).map(([key, type]) => {
          const IconComponent = type.icon;
          return (
            <div 
              key={key} 
              className={`energy-type-option ${point.energyType === key ? 'selected' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                selectEnergyType(point.id, key);
              }}
              style={{ 
                borderColor: point.energyType === key ? type.color : undefined,
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
        <div className="procedures-list">
          <h4>{t.proceduresToFollow}</h4>
          <ul className="procedures-checklist">
            {ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES].procedures.map((procedure, idx) => {
              const isCompleted = (point.completedProcedures || []).includes(idx);
              return (
                <li 
                  key={idx} 
                  className={`procedure-item ${isCompleted ? 'completed' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleProcedureComplete(point.id, idx);
                  }}
                >
                  <div className={`procedure-checkbox ${isCompleted ? 'checked' : ''}`}>
                    {isCompleted && <Check size={12} />}
                  </div>
                  <span className="procedure-text">{procedure}</span>
                </li>
              );
            })}
          </ul>
          <div className="procedures-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${getProcedureProgress(point).percentage}%` }} />
            </div>
            <div className="progress-text">
              {getProcedureProgress(point).completed} / {getProcedureProgress(point).total} {t.stepsCompleted} 
              ({getProcedureProgress(point).percentage}%)
            </div>
          </div>
        </div>
      )}
    </div>
  ));

  // =================== COMPOSANT BOUTONS TEMPS RAPIDES ===================
  const TimeQuickButtons = React.memo(({ pointId }: { pointId: string }) => (
    <div className="time-quick-select">
      <button 
        type="button"
        className="time-btn now" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimeNow(pointId);
        }}
      >
        <Clock size={12} />{t.now}
      </button>
      <button 
        type="button"
        className="time-btn plus5" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimePlus(pointId, 5);
        }}
      >
        +5min
      </button>
      <button 
        type="button"
        className="time-btn plus15" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimePlus(pointId, 15);
        }}
      >
        +15min
      </button>
    </div>
  ));

  // =================== COMPOSANT PHOTOS LOCKOUT POINTS ===================
  const LockoutPhotosSection = React.memo(({ point }: { point: LockoutPoint }) => {
    const pointPhotos = localData.lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId === point.id);
    
    return (
      <div className="form-field">
        <label className="field-label">
          <Camera style={{ width: '18px', height: '18px' }} />
          {t.pointPhotos}
        </label>
        
        <div className="photo-capture-buttons">
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('during_lockout', point.id);
            }}
          >
            <Camera size={14} />{t.duringLockout}
          </button>
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('lockout_device', point.id);
            }}
          >
            <Lock size={14} />{t.lockoutDevice}
          </button>
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('verification', point.id);
            }}
          >
            <Eye size={14} />{t.verification}
          </button>
        </div>
        
        {pointPhotos.length > 0 ? (
          <PhotoCarousel 
            photos={pointPhotos}
            onAddPhoto={() => handlePhotoCapture('lockout_device', point.id)}
            lockoutPointId={point.id}
          />
        ) : (
          <EmptyPhotoPlaceholder
            onClick={() => handlePhotoCapture('during_lockout', point.id)}
            title={t.noPhotos}
            description={t.clickToPhotoDevice}
            color="#f87171"
          />
        )}
      </div>
    );
  });

  // =================== COMPOSANT LOCKOUT POINT COMPLET ===================
  const LockoutPointCard = React.memo(({ point, index }: { point: LockoutPoint; index: number }) => (
    <div className="lockout-point">
      <div className="lockout-point-header">
        <h4 style={{ color: '#ef4444', margin: 0, fontSize: '16px', fontWeight: '600' }}>
          {t.lockoutPoint}{index + 1}
        </h4>
        <button 
          type="button"
          className="btn-danger" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteLockoutPoint(point.id);
          }}
        >
          <Trash2 size={14} />
          {t.delete}
        </button>
      </div>

      {/* Assignation Emplacement */}
      {localData.workLocations.length > 0 && (
        <div className="form-field">
          <label className="field-label">
            <MapPin style={{ width: '18px', height: '18px' }} />
            {language === 'fr' ? 'Emplacement Assigné' : 'Assigned Location'}
          </label>
          <LocationSelector 
            currentLocationId={point.assignedLocation}
            onLocationChange={(locationId) => updateLockoutPoint(point.id, 'assignedLocation', locationId)}
          />
        </div>
      )}

      {/* Type d'énergie avec procédures */}
      <EnergyTypeSelector point={point} />

      {/* Détails équipement */}
      <div className="two-column">
        <div className="form-field">
          <label className="field-label">
            <Settings style={{ width: '18px', height: '18px' }} />
            {t.equipmentName}
          </label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder={t.equipmentPlaceholder}
            value={point.equipmentName} 
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'equipmentName', e.target.value);
            }} 
          />
        </div>
        <div className="form-field">
          <label className="field-label">
            <MapPin style={{ width: '18px', height: '18px' }} />
            {t.locationLabel}
          </label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder={t.locationPlaceholder}
            value={point.location} 
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'location', e.target.value);
            }} 
          />
        </div>
      </div>

      <div className="two-column">
        <div className="form-field">
          <label className="field-label">
            <Lock style={{ width: '18px', height: '18px' }} />
            {t.lockType}
          </label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder={t.lockTypePlaceholder}
            value={point.lockType} 
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'lockType', e.target.value);
            }} 
          />
        </div>
        <div className="form-field">
          <label className="field-label">
            <FileText style={{ width: '18px', height: '18px' }} />
            {t.tagNumber}
          </label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder={t.tagPlaceholder}
            value={point.tagNumber} 
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'tagNumber', e.target.value);
            }} 
          />
        </div>
      </div>

      {/* Vérification avec boutons temps */}
      <div className="two-column">
        <div className="form-field">
          <label className="field-label">
            <User style={{ width: '18px', height: '18px' }} />
            {t.verifiedBy}
          </label>
          <input 
            type="text" 
            className="premium-input" 
            placeholder={t.verifiedByPlaceholder}
            value={point.verifiedBy} 
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'verifiedBy', e.target.value);
            }} 
          />
        </div>
        <div className="form-field">
          <label className="field-label">
            <Clock style={{ width: '18px', height: '18px' }} />
            {t.verificationTime}
          </label>
          <input 
            type="time" 
            className="premium-input" 
            value={point.verificationTime}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateLockoutPoint(point.id, 'verificationTime', e.target.value);
            }} 
          />
          <TimeQuickButtons pointId={point.id} />
        </div>
      </div>

      {/* Notes */}
      <div className="form-field">
        <label className="field-label">
          <FileText style={{ width: '18px', height: '18px' }} />
          {t.notes}
        </label>
        <textarea 
          className="premium-textarea" 
          style={{ minHeight: '80px' }}
          placeholder={t.notesPlaceholder}
          value={point.notes} 
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateLockoutPoint(point.id, 'notes', e.target.value);
          }} 
        />
      </div>

      {/* Photos spécifiques au point */}
      <LockoutPhotosSection point={point} />
    </div>
  ));

  // =================== COMPOSANT PHOTOS GÉNÉRALES ===================
  const GeneralPhotosSection = React.memo(() => {
    const generalPhotos = localData.lockoutPhotos.filter((photo: LockoutPhoto) => !photo.lockoutPointId);
    
    return (
      <div className="form-field">
        <label className="field-label">
          <Camera style={{ width: '18px', height: '18px' }} />
          {t.generalPhotos}
        </label>
        <div className="photo-capture-buttons">
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('before_lockout');
            }}
          >
            <Camera size={14} />{t.beforeLockout}
          </button>
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('client_form');
            }}
          >
            <FileText size={14} />{t.clientForm}
          </button>
          <button 
            type="button"
            className="photo-capture-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePhotoCapture('verification');
            }}
          >
            <Eye size={14} />{t.verification}
          </button>
        </div>

        {generalPhotos.length > 0 ? (
          <PhotoCarousel 
            photos={generalPhotos}
            onAddPhoto={() => handlePhotoCapture('verification')}
          />
        ) : (
          <EmptyPhotoPlaceholder
            onClick={() => handlePhotoCapture('before_lockout')}
            title={t.noPhotos}
            description={t.clickToPhoto}
          />
        )}
      </div>
    );
  });

  // =================== SECTION LOCKOUT COMPLÈTE ===================
  const LockoutSection = React.memo(() => (
    <div className="form-section lockout-section">
      <div className="section-header">
        <Lock className="section-icon lockout-icon" />
        <h3 className="section-title">{t.lockoutSection}</h3>
      </div>
      <div className="field-help" style={{ marginBottom: '24px' }}>
        {t.lockoutDescription}
      </div>

      {/* Photos générales de verrouillage */}
      <GeneralPhotosSection />

      {/* Points de verrouillage dynamiques */}
      {localData.lockoutPoints.map((point: LockoutPoint, index: number) => (
        <LockoutPointCard key={point.id} point={point} index={index} />
      ))}

      {/* Bouton ajouter point */}
      <div style={{ marginTop: localData.lockoutPoints.length > 0 ? '24px' : '0', marginBottom: '24px' }}>
        <button 
          type="button"
          className="btn-primary" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addLockoutPoint();
          }}
        >
          <Plus size={20} />{t.addLockoutPoint}
        </button>
      </div>

      {/* Message si aucun point */}
      {localData.lockoutPoints.length === 0 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px', 
          padding: '24px', 
          textAlign: 'center', 
          color: '#60a5fa'
        }}>
          <Lock size={32} style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px', color: '#60a5fa' }}>{t.noLockoutPoints}</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {t.noLockoutDescription}
          </p>
        </div>
      )}
    </div>
  ));

  // =================== COMPOSANT VALIDATION ÉTAT LOCKOUT ===================
  const LockoutValidationSummary = React.memo(() => {
    const totalPoints = localData.lockoutPoints.length;
    const completedPoints = localData.lockoutPoints.filter((point: LockoutPoint) => {
      const progress = getProcedureProgress(point);
      return progress.percentage >= 80 && point.equipmentName && point.verifiedBy;
    }).length;
    
    const completionPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
    
    if (totalPoints === 0) return null;
    
    return (
      <div className="lockout-validation-summary" style={{
        background: completionPercentage >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${completionPercentage >= 80 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '12px',
        padding: '16px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Shield size={20} color={completionPercentage >= 80 ? '#22c55e' : '#f59e0b'} />
          <h4 style={{ margin: 0, color: completionPercentage >= 80 ? '#22c55e' : '#f59e0b' }}>
            {language === 'fr' ? 'État Verrouillage' : 'Lockout Status'}
          </h4>
        </div>
        <div style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '8px' }}>
          {completedPoints}/{totalPoints} points complétés ({completionPercentage}%)
        </div>
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '8px',
          height: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: completionPercentage >= 80 ? '#22c55e' : '#f59e0b',
            height: '100%',
            width: `${completionPercentage}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    );
  });

  // =================== SECTION 5/5 FINALE - RENDU JSX COMPLET + CSS OPTIMISÉ ===================

  console.log('🔥 Step1 - Render avec localData:', Object.keys(localData));

  return (
    <>
      {/* =================== CSS OPTIMISÉ COMPLET AVEC MODAL Z-INDEX CRITIQUE =================== */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* =================== CONTAINER PRINCIPAL OPTIMISÉ =================== */
          .step1-container { 
            padding: 0; 
            margin: 0;
            max-width: 100%;
            color: #ffffff;
            position: relative;
            z-index: 1;
          }

          /* =================== GRILLE PREMIUM RESPONSIVE =================== */
          .premium-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
            gap: 24px; 
            margin-bottom: 32px;
            align-items: start;
          }

          /* =================== SECTIONS DE BASE OPTIMISÉES =================== */
          .form-section { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 20px; 
            padding: 24px; 
            transition: all 0.3s ease;
            height: fit-content;
            min-height: auto;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
          }

          .form-section:hover { 
            transform: translateY(-4px); 
            border-color: rgba(59, 130, 246, 0.5); 
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); 
          }

          .lockout-section { 
            background: rgba(239, 68, 68, 0.1); 
            border: 1px solid rgba(239, 68, 68, 0.3);
            grid-column: 1 / -1;
            margin-top: 0;
          }

          .lockout-section:hover { 
            border-color: rgba(239, 68, 68, 0.5); 
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); 
          }

          .full-width-section {
            grid-column: 1 / -1;
          }

          /* =================== DASHBOARD STATISTIQUES OPTIMISÉ =================== */
          .location-stats-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
            border: 2px solid rgba(16, 185, 129, 0.3);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
            z-index: 2;
          }

          .location-stats-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
          }

          @keyframes shine { 
            0% { left: -100%; } 
            50% { left: 100%; } 
            100% { left: 100%; } 
          }

          .stats-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            color: #10b981;
            font-size: 18px;
            font-weight: 700;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .stat-item {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
            min-height: 70px;
          }

          .stat-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .stat-icon.total-workers { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
          .stat-icon.total-locations { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          .stat-icon.total-lockouts { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
          .stat-icon.utilization-rate { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

          .stat-content {
            flex: 1;
            min-width: 0;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .location-breakdown {
            border-top: 1px solid rgba(100, 116, 139, 0.2);
            padding-top: 16px;
          }

          .breakdown-title {
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 12px;
          }

          .breakdown-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .breakdown-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 8px;
            gap: 16px;
          }

          .breakdown-info {
            flex: 1;
            min-width: 0;
          }

          .location-name {
            display: block;
            font-weight: 600;
            color: #ffffff;
            font-size: 13px;
            margin-bottom: 2px;
          }

          .location-details {
            display: block;
            font-size: 11px;
            color: #94a3b8;
          }

          .breakdown-utilization {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          .utilization-bar {
            width: 60px;
            height: 6px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 3px;
            overflow: hidden;
          }

          .utilization-fill {
            height: 100%;
            transition: width 0.5s ease;
            border-radius: 3px;
          }

          .utilization-text {
            font-size: 11px;
            font-weight: 600;
            color: #e2e8f0;
            min-width: 32px;
            text-align: right;
          }

          /* =================== GESTION EMPLACEMENTS OPTIMISÉE =================== */
          .work-locations-section {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
            position: relative;
            z-index: 2;
          }

          .locations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .locations-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .location-item {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.3s ease;
          }

          .location-item:hover {
            transform: translateY(-2px);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
          }

          .location-main {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 12px;
          }

          .location-info {
            flex: 1;
            min-width: 0;
          }

          .location-name {
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px;
          }

          .location-description {
            color: #94a3b8;
            font-size: 13px;
            margin: 0 0 8px;
            line-height: 1.4;
          }

          .location-metadata {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .location-zone, .location-building, .location-floor {
            font-size: 11px;
            color: #64748b;
            background: rgba(100, 116, 139, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .location-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-shrink: 0;
          }

          .location-stat {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 500;
          }

          .location-remove {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 36px;
            min-height: 36px;
          }

          .location-remove:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
          }

          .location-capacity-bar {
            width: 100%;
            height: 6px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
          }

          .capacity-fill {
            height: 100%;
            transition: width 0.5s ease;
            border-radius: 3px;
          }

          .capacity-text {
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
          }

          .empty-locations {
            text-align: center;
            padding: 40px 20px;
            color: #64748b;
          }

          /* =================== 🔥 MODAL ULTRA-CRITIQUE Z-INDEX MAXIMUM ABSOLU =================== */
          .modal-overlay-ultra-critical {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.98) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
            padding: 16px;
            backdrop-filter: blur(15px) !important;
            pointer-events: all !important;
          }

          .modal-content-ultra-critical {
            background: rgba(15, 23, 42, 1) !important;
            backdrop-filter: blur(30px) !important;
            border: 3px solid rgba(59, 130, 246, 0.8) !important;
            border-radius: 20px;
            max-width: 700px;
            width: 100%;
            max-height: calc(100vh - 32px);
            overflow-y: auto;
            z-index: 2147483647 !important;
            position: relative !important;
            box-shadow: 0 50px 100px rgba(0, 0, 0, 0.95) !important;
            pointer-events: all !important;
          }

          .modal-input-critical {
            background: rgba(15, 23, 42, 1) !important;
            border: 2px solid rgba(100, 116, 139, 0.5) !important;
            position: relative !important;
            z-index: 2147483647 !important;
          }

          .modal-input-critical:focus {
            background: rgba(15, 23, 42, 1) !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
            z-index: 2147483647 !important;
            outline: none !important;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 24px 0;
            margin-bottom: 20px;
            position: relative;
            z-index: 2147483647 !important;
          }

          .modal-header h3 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          }

          .modal-close {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ef4444;
            cursor: pointer;
            padding: 10px;
            border-radius: 8px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647 !important;
          }

          .modal-close:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: scale(1.05);
          }

          .modal-body {
            padding: 0 24px;
            position: relative;
            z-index: 2147483647 !important;
          }

          .modal-footer {
            display: flex;
            gap: 12px;
            padding: 20px 24px 24px;
            justify-content: flex-end;
            position: relative;
            z-index: 2147483647 !important;
          }

          .form-row {
            margin-bottom: 20px;
          }

          .form-row.two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          /* =================== STYLES EXISTANTS CONSERVÉS =================== */
          .section-header { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin-bottom: 20px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
            min-height: 44px;
            flex-shrink: 0;
          }

          .section-icon { 
            width: 24px; 
            height: 24px; 
            color: #3b82f6; 
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            flex-shrink: 0;
          }

          .lockout-icon { 
            color: #ef4444 !important; 
          }

          .section-title { 
            color: #ffffff; 
            font-size: 18px; 
            font-weight: 700; 
            margin: 0; 
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            line-height: 1.2;
            flex-grow: 1;
          }

          .form-field { 
            margin-bottom: 20px; 
            display: flex;
            flex-direction: column;
          }

          .form-field:last-child {
            margin-bottom: 0;
          }

          .field-label { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            color: #e2e8f0; 
            font-size: 14px; 
            font-weight: 600; 
            margin-bottom: 8px;
            min-height: 20px;
            flex-shrink: 0;
          }

          .premium-input, .premium-select, .premium-textarea { 
            width: 100%; 
            padding: 14px 16px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 15px; 
            font-weight: 500; 
            transition: all 0.3s ease; 
            backdrop-filter: blur(10px);
            box-sizing: border-box;
            min-height: 50px;
            font-family: inherit;
          }

          .premium-input:focus, .premium-select:focus, .premium-textarea:focus { 
            outline: none; 
            border-color: #3b82f6; 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
            background: rgba(15, 23, 42, 0.9); 
          }

          .premium-textarea { 
            min-height: 120px; 
            resize: vertical; 
          }

          .premium-input::placeholder, .premium-textarea::placeholder { 
            color: #64748b; 
            font-weight: 400; 
          }

          .premium-select { 
            cursor: pointer; 
          }

          .required-indicator { 
            color: #ef4444; 
            margin-left: 4px; 
          }

          .field-help { 
            font-size: 12px; 
            color: #64748b; 
            margin-top: 6px; 
            font-style: italic; 
          }

          .two-column { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px;
            align-items: start;
          }

          .empty-photo-placeholder {
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 140px;
          }

          .location-selector {
            margin-top: 8px;
          }

          /* =================== CARTE AST PREMIUM =================== */
          .ast-number-card { 
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); 
            border: 2px solid #22c55e; 
            border-radius: 20px; 
            padding: 24px; 
            margin-bottom: 32px; 
            position: relative; 
            overflow: hidden;
            z-index: 2;
          }

          .ast-number-card::before { 
            content: ''; 
            position: absolute; 
            top: 0; 
            left: -100%; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent); 
            animation: shine 3s ease-in-out infinite; 
          }

          .ast-number-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 16px;
            min-height: 32px;
          }

          .ast-number-title { 
            color: #22c55e; 
            font-size: 16px; 
            font-weight: 700; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
          }

          .ast-number-value { 
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace; 
            font-size: 24px; 
            font-weight: 800; 
            color: #22c55e; 
            letter-spacing: 1px; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3); 
            margin-bottom: 12px; 
          }

          .ast-actions { 
            display: flex; 
            gap: 12px;
            align-items: center;
          }

          .btn-icon { 
            background: rgba(34, 197, 94, 0.1); 
            border: 1px solid #22c55e; 
            color: #22c55e; 
            padding: 8px; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-width: 36px;
            min-height: 36px;
          }

          .btn-icon:hover { 
            background: rgba(34, 197, 94, 0.2); 
            transform: translateY(-2px); 
          }

          .btn-icon.copied { 
            background: rgba(34, 197, 94, 0.2); 
            color: #22c55e; 
          }

          .btn-primary { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            border: none; 
            color: white; 
            padding: 12px 20px; 
            border-radius: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 8px;
            min-height: 48px;
            font-size: 14px;
          }

          .btn-primary:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); 
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          .btn-secondary {
            background: rgba(100, 116, 139, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.3);
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            min-height: 40px;
          }

          .btn-secondary:hover {
            background: rgba(100, 116, 139, 0.8);
            transform: translateY(-1px);
          }

          .btn-danger { 
            background: linear-gradient(135deg, #ef4444, #dc2626); 
            border: none; 
            color: white; 
            padding: 8px 12px; 
            border-radius: 8px; 
            font-weight: 500; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 14px;
            min-height: 36px;
          }

          .btn-danger:hover { 
            transform: translateY(-1px); 
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); 
          }

          /* =================== STYLES LOCKOUT CONSERVÉS ET OPTIMISÉS =================== */
          .energy-type-selector { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 12px; 
            margin-bottom: 16px;
          }

          .energy-type-option { 
            padding: 12px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            text-align: center; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 8px;
            min-height: 80px;
            justify-content: center;
          }

          .energy-type-option.selected { 
            border-color: #ef4444; 
            background: rgba(239, 68, 68, 0.1); 
          }

          .energy-type-option:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
          }

          .lockout-point { 
            background: rgba(15, 23, 42, 0.8); 
            border: 1px solid rgba(239, 68, 68, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 20px; 
            position: relative;
          }

          .lockout-point:last-child {
            margin-bottom: 0;
          }

          .lockout-point-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 16px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid rgba(239, 68, 68, 0.2);
            min-height: 40px;
          }

          .procedures-list { 
            background: rgba(15, 23, 42, 0.6); 
            border: 1px solid rgba(100, 116, 139, 0.2); 
            border-radius: 12px; 
            padding: 16px; 
            margin-top: 12px; 
          }

          .procedures-list h4 { 
            color: #e2e8f0; 
            font-size: 14px; 
            font-weight: 600; 
            margin: 0 0 12px 0; 
          }

          .procedures-checklist { 
            margin: 0; 
            padding: 0; 
            list-style: none; 
          }

          .procedure-item { 
            display: flex; 
            align-items: flex-start; 
            gap: 12px; 
            margin-bottom: 12px; 
            padding: 8px; 
            border-radius: 8px; 
            transition: all 0.3s ease; 
            cursor: pointer; 
          }

          .procedure-item:hover { 
            background: rgba(59, 130, 246, 0.1); 
          }

          .procedure-item.completed { 
            background: rgba(34, 197, 94, 0.1); 
            border: 1px solid rgba(34, 197, 94, 0.3); 
          }

          .procedure-checkbox { 
            width: 18px; 
            height: 18px; 
            border: 2px solid rgba(100, 116, 139, 0.5); 
            border-radius: 4px; 
            background: rgba(15, 23, 42, 0.8); 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s ease; 
            flex-shrink: 0; 
            margin-top: 2px; 
          }

          .procedure-checkbox.checked { 
            background: #22c55e; 
            border-color: #22c55e; 
            color: white; 
          }

          .procedure-checkbox:hover { 
            border-color: #3b82f6; 
            transform: scale(1.05); 
          }

          .procedure-text { 
            color: #94a3b8; 
            font-size: 13px; 
            line-height: 1.5; 
            flex: 1; 
          }

          .procedure-item.completed .procedure-text { 
            color: #a7f3d0; 
          }

          .procedures-progress { 
            margin-top: 12px; 
            padding-top: 12px; 
            border-top: 1px solid rgba(100, 116, 139, 0.2); 
          }

          .progress-bar { 
            background: rgba(15, 23, 42, 0.8); 
            border-radius: 8px; 
            height: 6px; 
            overflow: hidden; 
            margin-bottom: 8px; 
          }

          .progress-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #22c55e, #16a34a); 
            transition: width 0.5s ease; 
            border-radius: 8px; 
          }

          .progress-text { 
            font-size: 12px; 
            color: #64748b; 
            text-align: center; 
          }

          .time-quick-select { 
            display: flex; 
            gap: 6px; 
            margin-top: 8px; 
          }

          .time-btn { 
            background: rgba(59, 130, 246, 0.1); 
            border: 1px solid rgba(59, 130, 246, 0.3); 
            color: #60a5fa; 
            padding: 6px 10px; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 4px; 
            font-size: 11px; 
            font-weight: 500; 
            flex: 1; 
            justify-content: center;
            min-height: 32px;
          }

          .time-btn:hover { 
            background: rgba(59, 130, 246, 0.2); 
            border-color: rgba(59, 130, 246, 0.5); 
            transform: translateY(-1px); 
          }

          .time-btn.now { 
            background: rgba(34, 197, 94, 0.1); 
            border-color: rgba(34, 197, 94, 0.3); 
            color: #4ade80; 
          }

          .time-btn.now:hover { 
            background: rgba(34, 197, 94, 0.2); 
            border-color: rgba(34, 197, 94, 0.5); 
          }

          .time-btn.plus5 { 
            background: rgba(245, 158, 11, 0.1); 
            border-color: rgba(245, 158, 11, 0.3); 
            color: #fbbf24; 
          }

          .time-btn.plus5:hover { 
            background: rgba(245, 158, 11, 0.2); 
            border-color: rgba(245, 158, 11, 0.5); 
          }

          .time-btn.plus15 { 
            background: rgba(139, 92, 246, 0.1); 
            border-color: rgba(139, 92, 246, 0.3); 
            color: #a78bfa; 
          }

          .time-btn.plus15:hover { 
            background: rgba(139, 92, 246, 0.2); 
            border-color: rgba(139, 92, 246, 0.5); 
          }

          .photo-capture-buttons { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin-top: 12px; 
          }

          .photo-capture-btn { 
            background: rgba(59, 130, 246, 0.1); 
            border: 1px solid rgba(59, 130, 246, 0.3); 
            color: #60a5fa; 
            padding: 8px 12px; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 12px; 
            font-weight: 500;
            min-height: 36px;
          }

          .photo-capture-btn:hover { 
            background: rgba(59, 130, 246, 0.2); 
            transform: translateY(-1px); 
          }

          .photo-carousel { 
            position: relative; 
            margin-top: 16px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            overflow: hidden; 
          }

          .carousel-container { 
            position: relative; 
            width: 100%; 
            height: 300px; 
            overflow: hidden; 
          }

          .carousel-track { 
            display: flex; 
            transition: transform 0.3s ease; 
            height: 100%; 
          }

          .carousel-slide { 
            min-width: 100%; 
            height: 100%; 
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
          }

          .carousel-slide img { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
            border-radius: 8px; 
          }

          .carousel-slide.add-photo { 
            background: rgba(59, 130, 246, 0.1); 
            border: 2px dashed rgba(59, 130, 246, 0.3); 
            cursor: pointer; 
            transition: all 0.3s ease; 
            flex-direction: column; 
            gap: 16px; 
          }

          .carousel-slide.add-photo:hover { 
            background: rgba(59, 130, 246, 0.2); 
            border-color: rgba(59, 130, 246, 0.5); 
          }

          .add-photo-content { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 12px; 
            color: #60a5fa; 
          }

          .add-photo-icon { 
            width: 48px; 
            height: 48px; 
            background: rgba(59, 130, 246, 0.2); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s ease; 
          }

          .carousel-slide.add-photo:hover .add-photo-icon { 
            transform: scale(1.1); 
            background: rgba(59, 130, 246, 0.3); 
          }

          .carousel-nav { 
            position: absolute; 
            top: 50%; 
            transform: translateY(-50%); 
            background: rgba(0, 0, 0, 0.7); 
            border: none; 
            color: white; 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s ease; 
            z-index: 10; 
          }

          .carousel-nav:hover { 
            background: rgba(0, 0, 0, 0.9); 
            transform: translateY(-50%) scale(1.1); 
          }

          .carousel-nav:disabled { 
            opacity: 0.3; 
            cursor: not-allowed; 
          }

          .carousel-nav.prev { 
            left: 16px; 
          }

          .carousel-nav.next { 
            right: 16px; 
          }

          .carousel-indicators { 
            position: absolute; 
            bottom: 16px; 
            left: 50%; 
            transform: translateX(-50%); 
            display: flex; 
            gap: 8px; 
            z-index: 10; 
          }

          .carousel-indicator { 
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            background: rgba(255, 255, 255, 0.4); 
            cursor: pointer; 
            transition: all 0.3s ease; 
          }

          .carousel-indicator.active { 
            background: rgba(255, 255, 255, 0.9); 
            transform: scale(1.2); 
          }

          .photo-info { 
            position: absolute; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); 
            color: white; 
            padding: 20px 16px 16px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
          }

          .photo-caption { 
            flex: 1; 
            margin-right: 12px; 
          }

          .photo-caption h4 { 
            margin: 0 0 4px; 
            font-size: 14px; 
            font-weight: 600; 
          }

          .photo-caption p { 
            margin: 0; 
            font-size: 12px; 
            opacity: 0.8; 
          }

          .photo-actions { 
            display: flex; 
            gap: 8px; 
          }

          .photo-action-btn { 
            background: rgba(255, 255, 255, 0.2); 
            border: 1px solid rgba(255, 255, 255, 0.3); 
            color: white; 
            padding: 6px; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            min-width: 28px;
            min-height: 28px;
          }

          .photo-action-btn:hover { 
            background: rgba(255, 255, 255, 0.3); 
          }

          .photo-action-btn.delete:hover { 
            background: rgba(239, 68, 68, 0.8); 
            border-color: #ef4444; 
          }

          /* =================== RESPONSIVE OPTIMISÉ =================== */
          @media (max-width: 768px) {
            .premium-grid { 
              grid-template-columns: 1fr; 
              gap: 16px; 
            }
            
            .form-section { 
              padding: 16px; 
            }
            
            .two-column, .form-row.two-columns { 
              grid-template-columns: 1fr; 
              gap: 12px; 
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            
            .locations-header {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }
            
            .location-main {
              flex-direction: column;
              gap: 12px;
            }
            
            .location-stats {
              flex-direction: row;
              justify-content: space-between;
            }

            .modal-content-ultra-critical {
              margin: 8px;
              max-height: calc(100vh - 16px);
            }

            .modal-header, .modal-body, .modal-footer {
              padding-left: 16px;
              padding-right: 16px;
            }

            .energy-type-selector { 
              grid-template-columns: repeat(2, 1fr); 
            }
            
            .photo-capture-buttons { 
              flex-direction: column; 
            }
            
            .time-quick-select { 
              flex-direction: column; 
              gap: 4px; 
            }
            
            .time-btn { 
              flex: none; 
            }
          }

          @media (max-width: 480px) {
            .form-section { 
              padding: 12px; 
            }
            
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .stat-item {
              padding: 12px;
            }

            .ast-number-value {
              font-size: 18px;
            }

            .ast-actions {
              flex-wrap: wrap;
            }

            .energy-type-selector { 
              grid-template-columns: 1fr; 
            }

            .lockout-point-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }

            .carousel-nav {
              width: 36px;
              height: 36px;
            }

            .carousel-nav.prev {
              left: 8px;
            }

            .carousel-nav.next {
              right: 8px;
            }
          }
        `
      }} />

      {/* Input caché pour capture photo */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />
      
      <div className="step1-container">
        {/* =================== CARTE NUMÉRO AST PREMIUM =================== */}
        <ASTNumberCard />

        {/* =================== DASHBOARD STATISTIQUES TEMPS RÉEL =================== */}
        {localData.workLocations.length > 0 && <LocationStatsCard />}

        {/* =================== GESTION EMPLACEMENTS DE TRAVAIL =================== */}
        <WorkLocationManager />

        {/* =================== GRILLE PREMIUM DES SECTIONS PRINCIPALES =================== */}
        <div className="premium-grid">
          {/* Section Client */}
          <div className="form-section">
            <div className="section-header">
              <Building className="section-icon" />
              <h3 className="section-title">{t.clientInfo}</h3>
            </div>
            <div className="form-field">
              <label className="field-label">
                <Building style={{ width: '18px', height: '18px' }} />
                {t.clientName}<span className="required-indicator">{t.required}</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.clientNamePlaceholder}
                value={localData.client} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('client', e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <Phone style={{ width: '18px', height: '18px' }} />{t.clientPhone}
              </label>
              <input 
                type="tel" 
                className="premium-input" 
                placeholder={t.clientPhonePlaceholder}
                value={localData.clientPhone} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('clientPhone', e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />{t.clientRepresentative}
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.clientRepPlaceholder}
                value={localData.clientRepresentative} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('clientRepresentative', e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <Phone style={{ width: '18px', height: '18px' }} />{t.repPhone}
              </label>
              <input 
                type="tel" 
                className="premium-input" 
                placeholder={t.repPhonePlaceholder}
                value={localData.clientRepresentativePhone} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('clientRepresentativePhone', e.target.value);
                }}
              />
            </div>
          </div>

          {/* Section Projet */}
          <div className="form-section">
            <div className="section-header">
              <Briefcase className="section-icon" />
              <h3 className="section-title">{t.projectDetails}</h3>
            </div>
            <div className="form-field">
              <label className="field-label">
                <Briefcase style={{ width: '18px', height: '18px' }} />
                {t.projectNumber}<span className="required-indicator">{t.required}</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.projectNumberPlaceholder}
                value={localData.projectNumber} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('projectNumber', e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />{t.astClientNumber}
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.astClientPlaceholder}
                value={localData.astClientNumber} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('astClientNumber', e.target.value);
                }}
              />
              <div className="field-help">{t.astClientHelp}</div>
            </div>
            <div className="two-column">
              <div className="form-field">
                <label className="field-label">
                  <Calendar style={{ width: '18px', height: '18px' }} />{t.date}
                </label>
                <input 
                  type="date" 
                  className="premium-input"
                  value={localData.date}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateField('date', e.target.value);
                  }}
                />
              </div>
              <div className="form-field">
                <label className="field-label">
                  <Clock style={{ width: '18px', height: '18px' }} />{t.time}
                </label>
                <input 
                  type="time" 
                  className="premium-input"
                  value={localData.time}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateField('time', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section Localisation */}
          <div className="form-section">
            <div className="section-header">
              <MapPin className="section-icon" />
              <h3 className="section-title">{t.location}</h3>
            </div>
            <div className="form-field">
              <label className="field-label">
                <MapPin style={{ width: '18px', height: '18px' }} />
                {t.workLocation}<span className="required-indicator">{t.required}</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.workLocationPlaceholder}
                value={localData.workLocation} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('workLocation', e.target.value);
                }}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <Briefcase style={{ width: '18px', height: '18px' }} />{t.industryType}
              </label>
              <IndustrySelector />
            </div>
          </div>

          {/* Section Contacts d'Urgence */}
          <div className="form-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" />
              <h3 className="section-title">{t.emergency}</h3>
            </div>
            <div className="two-column">
              <div className="form-field">
                <label className="field-label">
                  <AlertTriangle style={{ width: '18px', height: '18px' }} />{t.emergencyContact}
                </label>
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder={t.emergencyContactPlaceholder}
                  value={localData.emergencyContact} 
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateField('emergencyContact', e.target.value);
                  }}
                />
              </div>
              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />{t.emergencyPhone}
                </label>
                <input 
                  type="tel" 
                  className="premium-input" 
                  placeholder={t.emergencyPhonePlaceholder}
                  value={localData.emergencyPhone} 
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateField('emergencyPhone', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section Description AVEC TEXTAREA */}
          <div className="form-section full-width-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3 className="section-title">{t.workDescription}</h3>
            </div>
            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                {t.workDescriptionLabel}<span className="required-indicator">{t.required}</span>
              </label>
              <textarea 
                className="premium-textarea" 
                style={{ width: '100%', minHeight: '200px', maxWidth: 'none', resize: 'vertical' }}
                placeholder={t.workDescriptionPlaceholder}
                value={localData.workDescription} 
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateField('workDescription', e.target.value);
                }}
              />
              <div className="field-help">{t.workDescriptionHelp}</div>
            </div>
          </div>
        </div>

        {/* =================== SECTION VERROUILLAGE/CADENASSAGE COMPLÈTE =================== */}
        <LockoutSection />

        {/* =================== VALIDATION ÉTAT LOCKOUT =================== */}
        <LockoutValidationSummary />
      </div>
    </>
  );
}

export default Step1ProjectInfo;
