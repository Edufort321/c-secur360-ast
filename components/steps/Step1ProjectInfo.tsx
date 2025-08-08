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

  console.log('🔥 Step1 - Render avec localData:', Object.keys(localData));

  return { 
    // Export des variables pour la Section 2
    t, ENERGY_TYPES, localData, astNumber, copied, currentPhotoIndex, 
    currentLockoutPhotoIndex, fileInputRef, showAddLocation, editingLocation,
    newLocation, isModalSaving, updateField, updateLockoutPoint, addLockoutPoint,
    deleteLockoutPoint, updateModalField, setAstNumber, setCopied, setCurrentPhotoIndex,
    setCurrentLockoutPhotoIndex, setShowAddLocation, setEditingLocation, setIsModalSaving,
    notifyParentStable
  };
}

export default Step1ProjectInfo;
