'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';

interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
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

// =================== SYSTÈME DE TRADUCTIONS COMPLET ===================
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
    team: "👥 Équipe de Travail",
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
    
    // Industries
    electrical: "⚡ Électrique",
    construction: "🏗️ Construction",
    industrial: "🏭 Industriel",
    manufacturing: "⚙️ Manufacturier",
    office: "🏢 Bureau/Administratif",
    other: "🔧 Autre",
    
    // Équipe
    workerCount: "Nombre de Personnes",
    workerCountPlaceholder: "Ex: 5",
    workerCountHelp: "Ce nombre sera comparé aux approbations d'équipe",
    estimatedDuration: "Durée Estimée",
    durationPlaceholder: "Ex: 4 heures, 2 jours, 1 semaine",
    
    // Urgence
    emergencyContact: "Contact d'Urgence",
    emergencyContactPlaceholder: "Nom du contact d'urgence",
    emergencyPhone: "Téléphone d'Urgence",
    emergencyPhonePlaceholder: "911 ou numéro spécifique",
    
    // Description
    workDescriptionLabel: "Description Complète",
    workDescriptionPlaceholder: "Décrivez en détail les travaux à effectuer :\n\n• Méthodes utilisées\n• Équipements impliqués\n• Zones d'intervention\n• Procédures spéciales\n• Conditions particulières\n\nPlus la description est détaillée, plus l'analyse de sécurité sera précise.",
    workDescriptionHelp: "Une description complète aide à identifier tous les risques potentiels et à choisir les mesures de sécurité appropriées.",
    
    // Verrouillage
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
    team: "👥 Work Team",
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
    
    // Industries
    electrical: "⚡ Electrical",
    construction: "🏗️ Construction",
    industrial: "🏭 Industrial",
    manufacturing: "⚙️ Manufacturing",
    office: "🏢 Office/Administrative",
    other: "🔧 Other",
    
    // Team
    workerCount: "Number of People",
    workerCountPlaceholder: "Ex: 5",
    workerCountHelp: "This number will be compared to team approvals",
    estimatedDuration: "Estimated Duration",
    durationPlaceholder: "Ex: 4 hours, 2 days, 1 week",
    
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

// Types d'énergie avec icônes et couleurs + traductions
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

// Générateur de numéro AST
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

function Step1ProjectInfo({ formData, onDataChange, language, tenant, errors }: Step1ProjectInfoProps) {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = translations[language];
  const ENERGY_TYPES = getEnergyTypes(language);
  
  // =================== ÉTATS LOCAUX (SOLUTION ANTI-ÉJECTION) ===================
  const projectInfo = formData?.projectInfo || {};
  const lockoutPoints = projectInfo?.lockoutPoints || [];
  const lockoutPhotos = projectInfo?.lockoutPhotos || [];
  
  // 🔥 ÉTAT LOCAL POUR ÉVITER LES RE-RENDERS - TOUS LES CHAMPS PRINCIPAUX
  const [localState, setLocalState] = useState({
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
    workerCount: projectInfo.workerCount || 1,
    estimatedDuration: projectInfo.estimatedDuration || '',
    emergencyContact: projectInfo.emergencyContact || '',
    emergencyPhone: projectInfo.emergencyPhone || '',
    workDescription: projectInfo.workDescription || ''
  });

  // États pour AST et photos
  const [astNumber, setAstNumber] = useState(formData?.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentLockoutPhotoIndex, setCurrentLockoutPhotoIndex] = useState<{[key: string]: number}>({});

  // =================== HANDLERS ÉTAT LOCAL (SAISIE FLUIDE) ===================
  const updateLocalState = (field: string, value: any) => {
    setLocalState(prev => ({ ...prev, [field]: value }));
  };

  // Sync vers ASTForm (onBlur uniquement pour éviter re-renders)
  const syncToParent = (field: string, value: any) => {
    onDataChange('projectInfo', { ...projectInfo, [field]: value });
  };

  // Sync complet (pour les cas où on a besoin de tout synchroniser)
  const syncAllToParent = () => {
    onDataChange('projectInfo', { ...projectInfo, ...localState });
  };

  // =================== HANDLERS AST ET UTILITAIRES ===================
  const copyASTNumber = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText(astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  const regenerateASTNumber = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newNumber = generateASTNumber();
    setAstNumber(newNumber);
    onDataChange('astNumber', newNumber);
  };

  // =================== GESTION PHOTOS ===================
  const handlePhotoCapture = async (category: string, lockoutPointId?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
  };

  const processPhoto = async (file: File, category: string, lockoutPointId?: string) => {
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
      
      const updatedPhotos = [...lockoutPhotos, newPhoto];
      onDataChange('projectInfo', {
        ...projectInfo,
        ...localState, // Sync état local
        lockoutPhotos: updatedPhotos
      });
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  };

  const getCategoryLabel = (category: string): string => {
    return t.categories[category as keyof typeof t.categories] || category;
  };

  const deletePhoto = (photoId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updatedPhotos = lockoutPhotos.filter((photo: LockoutPhoto) => photo.id !== photoId);
    onDataChange('projectInfo', {
      ...projectInfo,
      ...localState, // Sync état local
      lockoutPhotos: updatedPhotos
    });
  };
  // =================== GESTION POINTS DE VERROUILLAGE ===================
  const addLockoutPoint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      completedProcedures: []
    };
    const updatedPoints = [...lockoutPoints, newPoint];
    onDataChange('projectInfo', {
      ...projectInfo,
      ...localState, // Sync état local
      lockoutPoints: updatedPoints
    });
  };

  const updateLockoutPoint = (pointId: string, field: string, value: any) => {
    const updatedPoints = lockoutPoints.map((point: LockoutPoint) => 
      point.id === pointId ? { ...point, [field]: value } : point
    );
    onDataChange('projectInfo', {
      ...projectInfo,
      ...localState, // Sync état local
      lockoutPoints: updatedPoints
    });
  };

  const toggleProcedureComplete = (pointId: string, procedureIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const point = lockoutPoints.find((p: LockoutPoint) => p.id === pointId);
    if (!point) return;

    const completedProcedures = point.completedProcedures || [];
    const isCompleted = completedProcedures.includes(procedureIndex);
    
    const updatedCompleted = isCompleted 
      ? completedProcedures.filter((index: number) => index !== procedureIndex)
      : [...completedProcedures, procedureIndex];

    updateLockoutPoint(pointId, 'completedProcedures', updatedCompleted);
  };

  const getProcedureProgress = (point: LockoutPoint): { completed: number; total: number; percentage: number } => {
    const energyType = ENERGY_TYPES[point.energyType as keyof typeof ENERGY_TYPES];
    const total = energyType?.procedures.length || 0;
    const completed = (point.completedProcedures || []).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const deleteLockoutPoint = (pointId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updatedPoints = lockoutPoints.filter((point: LockoutPoint) => point.id !== pointId);
    const updatedPhotos = lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId !== pointId);
    
    onDataChange('projectInfo', {
      ...projectInfo,
      ...localState, // Sync état local
      lockoutPoints: updatedPoints,
      lockoutPhotos: updatedPhotos
    });
  };

  // =================== FONCTIONS GESTION TEMPS ===================
  const setTimeNow = (pointId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    updateLockoutPoint(pointId, 'verificationTime', timeString);
  };

  const setTimePlus = (pointId: string, minutes: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const timeString = now.toTimeString().substring(0, 5);
    updateLockoutPoint(pointId, 'verificationTime', timeString);
  };

  const selectEnergyType = (pointId: string, energyType: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    updateLockoutPoint(pointId, 'energyType', energyType);
  };

  // =================== CARROUSEL PHOTOS ===================
  const PhotoCarousel = ({ photos, onAddPhoto, lockoutPointId }: {
    photos: LockoutPhoto[];
    onAddPhoto: () => void;
    lockoutPointId?: string;
  }) => {
    const currentIndex = lockoutPointId ? (currentLockoutPhotoIndex[lockoutPointId] || 0) : currentPhotoIndex;
    const totalSlides = photos.length + 1;

    const setCurrentIndex = (index: number) => {
      if (lockoutPointId) {
        setCurrentLockoutPhotoIndex(prev => ({ ...prev, [lockoutPointId]: index }));
      } else {
        setCurrentPhotoIndex(index);
      }
    };

    const nextSlide = (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex((currentIndex + 1) % totalSlides);
    };

    const prevSlide = (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    };

    const goToSlide = (index: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex(index);
    };

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
                      onClick={(e) => deletePhoto(photo.id, e)} 
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
                onClick={prevSlide} 
                disabled={totalSlides <= 1}
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                type="button"
                className="carousel-nav next" 
                onClick={nextSlide} 
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
                  onClick={(e) => goToSlide(index, e)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // =================== COMPOSANT SÉLECTEUR D'INDUSTRIE ===================
  const IndustrySelector = () => (
    <select 
      className="premium-select" 
      value={localState.industry}
      onChange={(e) => updateLocalState('industry', e.target.value)}
      onBlur={(e) => syncToParent('industry', e.target.value)}
    >
      <option value="electrical">{t.electrical}</option>
      <option value="construction">{t.construction}</option>
      <option value="industrial">{t.industrial}</option>
      <option value="manufacturing">{t.manufacturing}</option>
      <option value="office">{t.office}</option>
      <option value="other">{t.other}</option>
    </select>
  );

  // =================== COMPOSANT VIDE POUR PHOTOS ===================
  const EmptyPhotoPlaceholder = ({ 
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
    <div style={{
      background: `${color}20`, 
      border: `2px dashed ${color}50`,
      borderRadius: '12px', 
      padding: '40px 20px', 
      textAlign: 'center', 
      cursor: 'pointer', 
      transition: 'all 0.3s ease'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      (e.target as HTMLDivElement).style.background = `${color}30`;
      (e.target as HTMLDivElement).style.borderColor = `${color}70`;
    }}
    onMouseLeave={(e) => {
      (e.target as HTMLDivElement).style.background = `${color}20`;
      (e.target as HTMLDivElement).style.borderColor = `${color}50`;
    }}>
      <Camera size={32} color={color} style={{ marginBottom: '12px' }} />
      <h4 style={{ margin: '0 0 8px', color }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
        {description}
      </p>
    </div>
  );
  return (
    <>
      {/* CSS Optimisé Complet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* =================== CONTAINER PRINCIPAL =================== */
          .step1-container { 
            padding: 0; 
            margin: 0;
            max-width: 100%;
            color: #ffffff;
          }

          /* =================== GRILLE PREMIUM =================== */
          .premium-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
            gap: 24px; 
            margin-bottom: 32px;
            align-items: start;
          }

          /* =================== SECTIONS =================== */
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

          /* =================== HEADERS DE SECTION =================== */
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

          /* =================== CHAMPS DE FORMULAIRE =================== */
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

          /* =================== GRILLES =================== */
          .two-column { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px;
            align-items: start;
          }

          /* =================== CARTE AST =================== */
          .ast-number-card { 
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); 
            border: 2px solid #22c55e; 
            border-radius: 20px; 
            padding: 24px; 
            margin-bottom: 32px; 
            position: relative; 
            overflow: hidden;
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

          @keyframes shine { 
            0% { left: -100%; } 
            50% { left: 100%; } 
            100% { left: 100%; } 
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

          /* =================== BOUTONS =================== */
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

          /* =================== SÉLECTEUR TYPE D'ÉNERGIE =================== */
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

          /* =================== POINTS DE VERROUILLAGE =================== */
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

          /* =================== PROCÉDURES =================== */
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

          /* =================== BARRE DE PROGRESSION =================== */
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

          /* =================== BOUTONS TEMPS =================== */
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

          /* =================== BOUTONS PHOTO =================== */
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

          /* =================== CARROUSEL PHOTOS =================== */
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

          /* =================== RESPONSIVE =================== */
          @media (max-width: 768px) {
            .premium-grid { 
              grid-template-columns: 1fr; 
              gap: 16px; 
            }
            
            .form-section { 
              padding: 16px; 
            }
            
            .two-column { 
              grid-template-columns: 1fr; 
              gap: 12px; 
            }
            
            .ast-number-value { 
              font-size: 18px; 
            }
            
            .section-title { 
              font-size: 16px; 
            }
            
            .premium-input, .premium-select, .premium-textarea { 
              font-size: 16px; 
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
            
            .ast-number-card { 
              padding: 16px; 
            }
            
            .ast-actions { 
              flex-direction: column; 
              gap: 8px;
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
        {/* Carte Numéro AST Premium */}
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
                onClick={copyASTNumber} 
                title={t.copyNumber}
              >
                {copied ? <Check style={{ width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              </button>
              <button 
                type="button"
                className="btn-icon" 
                onClick={regenerateASTNumber} 
                title={t.generateNew}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          <div className="ast-number-value">{astNumber}</div>
          <div className="field-help">{t.astNumberGenerated}</div>
        </div>

        {/* Grille Premium des Sections */}
        <div className="premium-grid">
          {/* Section Client avec ÉTAT LOCAL + onBlur */}
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
                value={localState.client} 
                onChange={(e) => updateLocalState('client', e.target.value)}
                onBlur={(e) => syncToParent('client', e.target.value)}
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
                value={localState.clientPhone} 
                onChange={(e) => updateLocalState('clientPhone', e.target.value)}
                onBlur={(e) => syncToParent('clientPhone', e.target.value)}
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
                value={localState.clientRepresentative} 
                onChange={(e) => updateLocalState('clientRepresentative', e.target.value)}
                onBlur={(e) => syncToParent('clientRepresentative', e.target.value)}
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
                value={localState.clientRepresentativePhone} 
                onChange={(e) => updateLocalState('clientRepresentativePhone', e.target.value)}
                onBlur={(e) => syncToParent('clientRepresentativePhone', e.target.value)}
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
                value={localState.projectNumber} 
                onChange={(e) => updateLocalState('projectNumber', e.target.value)}
                onBlur={(e) => syncToParent('projectNumber', e.target.value)}
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
                value={localState.astClientNumber} 
                onChange={(e) => updateLocalState('astClientNumber', e.target.value)}
                onBlur={(e) => syncToParent('astClientNumber', e.target.value)}
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
                  value={localState.date}
                  onChange={(e) => updateLocalState('date', e.target.value)}
                  onBlur={(e) => syncToParent('date', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="field-label">
                  <Clock style={{ width: '18px', height: '18px' }} />{t.time}
                </label>
                <input 
                  type="time" 
                  className="premium-input"
                  value={localState.time}
                  onChange={(e) => updateLocalState('time', e.target.value)}
                  onBlur={(e) => syncToParent('time', e.target.value)}
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
                value={localState.workLocation} 
                onChange={(e) => updateLocalState('workLocation', e.target.value)}
                onBlur={(e) => syncToParent('workLocation', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="field-label">
                <Briefcase style={{ width: '18px', height: '18px' }} />{t.industryType}
              </label>
              <IndustrySelector />
            </div>
          </div>

          {/* Section Équipe */}
          <div className="form-section">
            <div className="section-header">
              <Users className="section-icon" />
              <h3 className="section-title">{t.team}</h3>
            </div>
            <div className="form-field">
              <label className="field-label">
                <Users style={{ width: '18px', height: '18px' }} />
                {t.workerCount}<span className="required-indicator">{t.required}</span>
              </label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                className="premium-input" 
                placeholder={t.workerCountPlaceholder}
                value={localState.workerCount} 
                onChange={(e) => updateLocalState('workerCount', parseInt(e.target.value) || 1)}
                onBlur={(e) => syncToParent('workerCount', parseInt(e.target.value) || 1)}
              />
              <div className="field-help">{t.workerCountHelp}</div>
            </div>
            <div className="form-field">
              <label className="field-label">
                <Clock style={{ width: '18px', height: '18px' }} />{t.estimatedDuration}
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={t.durationPlaceholder}
                value={localState.estimatedDuration} 
                onChange={(e) => updateLocalState('estimatedDuration', e.target.value)}
                onBlur={(e) => syncToParent('estimatedDuration', e.target.value)}
              />
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
                  value={localState.emergencyContact} 
                  onChange={(e) => updateLocalState('emergencyContact', e.target.value)}
                  onBlur={(e) => syncToParent('emergencyContact', e.target.value)}
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
                  value={localState.emergencyPhone} 
                  onChange={(e) => updateLocalState('emergencyPhone', e.target.value)}
                  onBlur={(e) => syncToParent('emergencyPhone', e.target.value)}
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
                value={localState.workDescription} 
                onChange={(e) => updateLocalState('workDescription', e.target.value)}
                onBlur={(e) => syncToParent('workDescription', e.target.value)}
              />
              <div className="field-help">{t.workDescriptionHelp}</div>
            </div>
          </div>
        </div>

        {/* SECTION VERROUILLAGE/CADENASSAGE COMPLÈTE */}
        <div className="form-section lockout-section">
          <div className="section-header">
            <Lock className="section-icon lockout-icon" />
            <h3 className="section-title">{t.lockoutSection}</h3>
          </div>
          <div className="field-help" style={{ marginBottom: '24px' }}>
            {t.lockoutDescription}
          </div>

          {/* Photos générales de verrouillage */}
          <div className="form-field">
            <label className="field-label">
              <Camera style={{ width: '18px', height: '18px' }} />{t.generalPhotos}
            </label>
            <div className="photo-capture-buttons">
              <button 
                type="button"
                className="photo-capture-btn" 
                onClick={(e) => handlePhotoCapture('before_lockout', undefined, e)}
              >
                <Camera size={14} />{t.beforeLockout}
              </button>
              <button 
                type="button"
                className="photo-capture-btn" 
                onClick={(e) => handlePhotoCapture('client_form', undefined, e)}
              >
                <FileText size={14} />{t.clientForm}
              </button>
              <button 
                type="button"
                className="photo-capture-btn" 
                onClick={(e) => handlePhotoCapture('verification', undefined, e)}
              >
                <Eye size={14} />{t.verification}
              </button>
            </div>

            {lockoutPhotos.filter((photo: LockoutPhoto) => !photo.lockoutPointId).length > 0 ? (
              <PhotoCarousel 
                photos={lockoutPhotos.filter((photo: LockoutPhoto) => !photo.lockoutPointId)}
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

          {/* POINTS DE VERROUILLAGE DYNAMIQUES */}
          {lockoutPoints.map((point: LockoutPoint, index: number) => (
            <div key={point.id} className="lockout-point">
              <div className="lockout-point-header">
                <h4 style={{ color: '#ef4444', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  {t.lockoutPoint}{index + 1}
                </h4>
                <button 
                  type="button"
                  className="btn-danger" 
                  onClick={(e) => deleteLockoutPoint(point.id, e)}
                >
                  <Trash2 size={14} />
                  {t.delete}
                </button>
              </div>

              {/* Type d'énergie avec procédures */}
              <div className="form-field">
                <label className="field-label">{t.energyType}<span className="required-indicator">{t.required}</span></label>
                <div className="energy-type-selector">
                  {Object.entries(ENERGY_TYPES).map(([key, type]) => {
                    const IconComponent = type.icon;
                    return (
                      <div 
                        key={key} 
                        className={`energy-type-option ${point.energyType === key ? 'selected' : ''}`}
                        onClick={(e) => selectEnergyType(point.id, key, e)}
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
                            onClick={(e) => toggleProcedureComplete(point.id, idx, e)}
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

              {/* Détails équipement */}
              <div className="two-column">
                <div className="form-field">
                  <label className="field-label"><Settings style={{ width: '18px', height: '18px' }} />{t.equipmentName}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={t.equipmentPlaceholder}
                    value={point.equipmentName} 
                    onChange={(e) => updateLockoutPoint(point.id, 'equipmentName', e.target.value)} 
                  />
                </div>
                <div className="form-field">
                  <label className="field-label"><MapPin style={{ width: '18px', height: '18px' }} />{t.locationLabel}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={t.locationPlaceholder}
                    value={point.location} 
                    onChange={(e) => updateLockoutPoint(point.id, 'location', e.target.value)} 
                  />
                </div>
              </div>

              <div className="two-column">
                <div className="form-field">
                  <label className="field-label"><Lock style={{ width: '18px', height: '18px' }} />{t.lockType}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={t.lockTypePlaceholder}
                    value={point.lockType} 
                    onChange={(e) => updateLockoutPoint(point.id, 'lockType', e.target.value)} 
                  />
                </div>
                <div className="form-field">
                  <label className="field-label"><FileText style={{ width: '18px', height: '18px' }} />{t.tagNumber}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={t.tagPlaceholder}
                    value={point.tagNumber} 
                    onChange={(e) => updateLockoutPoint(point.id, 'tagNumber', e.target.value)} 
                  />
                </div>
              </div>

              {/* Vérification avec boutons temps */}
              <div className="two-column">
                <div className="form-field">
                  <label className="field-label"><User style={{ width: '18px', height: '18px' }} />{t.verifiedBy}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={t.verifiedByPlaceholder}
                    value={point.verifiedBy} 
                    onChange={(e) => updateLockoutPoint(point.id, 'verifiedBy', e.target.value)} 
                  />
                </div>
                <div className="form-field">
                  <label className="field-label"><Clock style={{ width: '18px', height: '18px' }} />{t.verificationTime}</label>
                  <input 
                    type="time" 
                    className="premium-input" 
                    value={point.verificationTime}
                    onChange={(e) => updateLockoutPoint(point.id, 'verificationTime', e.target.value)} 
                  />
                  
                  {/* Boutons sélection rapide temps */}
                  <div className="time-quick-select">
                    <button 
                      type="button"
                      className="time-btn now" 
                      onClick={(e) => setTimeNow(point.id, e)}
                    >
                      <Clock size={12} />{t.now}
                    </button>
                    <button 
                      type="button"
                      className="time-btn plus5" 
                      onClick={(e) => setTimePlus(point.id, 5, e)}
                    >
                      +5min
                    </button>
                    <button 
                      type="button"
                      className="time-btn plus15" 
                      onClick={(e) => setTimePlus(point.id, 15, e)}
                    >
                      +15min
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="form-field">
                <label className="field-label"><FileText style={{ width: '18px', height: '18px' }} />{t.notes}</label>
                <textarea 
                  className="premium-textarea" 
                  style={{ minHeight: '80px' }}
                  placeholder={t.notesPlaceholder}
                  value={point.notes} 
                  onChange={(e) => updateLockoutPoint(point.id, 'notes', e.target.value)} 
                />
              </div>

              {/* Photos spécifiques au point */}
              <div className="form-field">
                <label className="field-label"><Camera style={{ width: '18px', height: '18px' }} />{t.pointPhotos}</label>
                
                <div className="photo-capture-buttons">
                  <button 
                    type="button"
                    className="photo-capture-btn" 
                    onClick={(e) => handlePhotoCapture('during_lockout', point.id, e)}
                  >
                    <Camera size={14} />{t.duringLockout}
                  </button>
                  <button 
                    type="button"
                    className="photo-capture-btn" 
                    onClick={(e) => handlePhotoCapture('lockout_device', point.id, e)}
                  >
                    <Lock size={14} />{t.lockoutDevice}
                  </button>
                  <button 
                    type="button"
                    className="photo-capture-btn" 
                    onClick={(e) => handlePhotoCapture('verification', point.id, e)}
                  >
                    <Eye size={14} />{t.verification}
                  </button>
                </div>
                
                {lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId === point.id).length > 0 ? (
                  <PhotoCarousel 
                    photos={lockoutPhotos.filter((photo: LockoutPhoto) => photo.lockoutPointId === point.id)}
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
            </div>
          ))}

          {/* Bouton ajouter point */}
          <div style={{ marginTop: lockoutPoints.length > 0 ? '24px' : '0', marginBottom: '24px' }}>
            <button 
              type="button"
              className="btn-primary" 
              onClick={addLockoutPoint}
            >
              <Plus size={20} />{t.addLockoutPoint}
            </button>
          </div>

          {/* Message si aucun point */}
          {lockoutPoints.length === 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#60a5fa'
            }}>
              <Lock size={32} style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#60a5fa' }}>{t.noLockoutPoints}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {t.noLockoutDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Step1ProjectInfo;
