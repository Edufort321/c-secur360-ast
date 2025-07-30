"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase, 
  Copy, Check, AlertTriangle, Camera, Upload, X, Settings, Wrench, Droplets, 
  Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home, Layers, 
  Ruler, Gauge, Thermometer, Activity, Shield, Zap, Save, Download, 
  Mail, MessageSquare, Share, Printer, CheckCircle, Search, Database, QrCode,
  Menu, ChevronDown, ChevronUp, Info, Star, Globe, Wifi, Navigation
} from 'lucide-react';

// =================== TYPES ET INTERFACES COMPLÈTES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';
type UnitSystem = 'metric' | 'imperial';

interface PermitHistoryEntry {
  id: string;
  permitNumber: string;
  projectNumber: string;
  workLocation: string;
  contractor: string;
  spaceType: string;
  csaClass: string;
  entryDate: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  createdAt: string;
  lastModified: string;
  entryCount: number;
  hazardCount: number;
  qrCode?: string;
}

interface PermitSearchResult {
  permits: PermitHistoryEntry[];
  total: number;
  page: number;
  hasMore: boolean;
}

interface SpacePhoto {
  id: string;
  url: string;
  category: string;
  caption: string;
  timestamp: string;
  location: string;
  measurements?: string;
  gpsCoords?: { lat: number; lng: number };
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  diameter: number;
  volume: number;
  spaceShape: 'rectangular' | 'cylindrical' | 'spherical' | 'irregular';
}

interface ConfinedSpaceDetails {
  // Informations principales
  projectNumber: string;
  workLocation: string;
  contractor: string;
  supervisor: string;
  entryDate: string;
  duration: string;
  workerCount: number;
  workDescription: string;

  // Identification de l'espace
  spaceType: string;
  csaClass: string;
  entryMethod: string;
  accessType: string;
  spaceLocation: string;
  spaceDescription: string;

  // Dimensions avec forme
  dimensions: Dimensions;
  unitSystem: UnitSystem;

  // Points d'entrée
  entryPoints: Array<{
    id: string;
    type: string;
    dimensions: string;
    location: string;
    condition: string;
    accessibility: string;
    photos: string[];
  }>;

  // Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];

  // Conditions environnementales
  environmentalConditions: {
    ventilationRequired: boolean;
    ventilationType: string;
    lightingConditions: string;
    temperatureRange: string;
    moistureLevel: string;
    noiseLevel: string;
    weatherConditions: string;
  };

  // Contenu de l'espace
  spaceContent: {
    contents: string;
    residues: string;
    previousUse: string;
    lastEntry: string;
    cleaningStatus: string;
  };

  // Mesures de sécurité
  safetyMeasures: {
    emergencyEgress: string;
    communicationMethod: string;
    monitoringEquipment: string[];
    ventilationEquipment: string[];
    emergencyEquipment: string[];
  };

  // Photos de l'espace
  spacePhotos: SpacePhoto[];
}

interface PermitReport {
  metadata: {
    permitNumber: string;
    issueDate: string;
    province: ProvinceCode;
    authority: string;
    generatedAt: string;
    version: string;
    language: Language;
    companyLogo: string;
    qrCode: string;
    classification: any;
  };
  siteInformation: ConfinedSpaceDetails & {
    spacePhotos: SpacePhoto[];
    csaClassification: any;
    provincialRegulations: any;
  };
  atmosphericTesting: any;
  entryRegistry: any;
  rescuePlan: any;
  validationChecklist: Array<{
    category: string;
    items: string[];
  }>;
}

interface SiteInformationProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, any>;
  isMobile: boolean;
  language: Language;
  styles?: any;
  updateParentData: (section: string, data: any) => void;
}

// =================== TRADUCTIONS ULTRA-COMPLÈTES ===================
const translations = {
  fr: {
    // Navigation et interface
    title: "Informations du Site - Espace Clos",
    subtitle: "Identification et évaluation complète de l'espace de travail confiné",
    loading: "Chargement...",
    saving: "Sauvegarde...",
    success: "Succès!",
    error: "Erreur",
    confirm: "Confirmer",
    cancel: "Annuler",
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Retirer",
    select: "Sélectionner",
    required: "Requis",
    optional: "Optionnel",
    yes: "Oui",
    no: "Non",

    // Actions du permis
    permitActions: "Actions du Permis",
    searchDatabase: "Base de Données",
    savePermit: "Sauvegarder",
    printPermit: "Imprimer PDF",
    emailPermit: "Envoyer Email",
    sharePermit: "Partager",
    generateQR: "Générer QR",

    // Sections principales
    projectInfo: "Informations du Projet",
    planning: "Planification",
    spaceIdentification: "Identification de l'Espace Clos",
    spaceDimensions: "Dimensions et Volume",
    entryPoints: "Points d'Entrée et Accès",
    hazardAssessment: "Évaluation des Dangers",
    environmentalConditions: "Conditions Environnementales",
    spaceContent: "Contenu et Historique",
    safetyMeasures: "Mesures de Sécurité",
    photoDocumentation: "Documentation Photographique",
    qrCodeSection: "Code QR - Accès Mobile",

    // Champs du formulaire
    projectNumber: "Numéro de projet",
    workLocation: "Lieu des travaux",
    contractor: "Entrepreneur",
    supervisor: "Superviseur",
    entryDate: "Date d'entrée prévue",
    duration: "Durée estimée",
    workerCount: "Nombre de travailleurs",
    workDescription: "Description des travaux",

    // Unités
    unitSystem: "Système d'unités",
    metric: "Métrique (m)",
    imperial: "Impérial (ft)",

    // Formes d'espaces
    spaceShape: "Forme de l'espace",
    rectangular: "Rectangulaire",
    cylindrical: "Cylindrique",
    spherical: "Sphérique",
    irregular: "Irrégulier",

    // Types d'espaces
    spaceType: "Type d'espace",
    spaceTypes: {
      tank: "Réservoir",
      vessel: "Cuve/Récipient", 
      silo: "Silo",
      pit: "Fosse",
      vault: "Voûte",
      tunnel: "Tunnel",
      trench: "Tranchée",
      manhole: "Regard d'égout",
      storage: "Espace de stockage",
      boiler: "Chaudière",
      duct: "Conduit",
      chamber: "Chambre",
      other: "Autre"
    },

    // Classifications CSA
    csaClass: "Classification CSA",
    csaClasses: {
      class1: "Classe 1 - Danger immédiat pour la vie",
      class2: "Classe 2 - Risque potentiel",
      class3: "Classe 3 - Risque minimal"
    },

    // Dimensions
    length: "Longueur",
    width: "Largeur", 
    height: "Hauteur",
    diameter: "Diamètre",
    volume: "Volume calculé",
    calculateVolume: "Calculer Volume",

    // Points d'entrée
    entryPoint: "Point d'entrée",
    entryType: "Type d'entrée",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "État",
    entryAccessibility: "Accessibilité",
    addEntryPoint: "Ajouter point d'entrée",

    // Dangers
    atmosphericHazards: "Dangers Atmosphériques",
    physicalHazards: "Dangers Physiques",
    selectHazards: "Sélectionnez tous les dangers présents",
    hazardsIdentified: "Dangers identifiés",

    // Types de dangers atmosphériques
    atmosphericHazardTypes: {
      oxygen_deficiency: "Déficience en oxygène (<19.5%)",
      oxygen_enrichment: "Enrichissement en oxygène (>23%)",
      flammable_gases: "Gaz inflammables/combustibles",
      toxic_gases: "Gaz toxiques",
      hydrogen_sulfide: "Sulfure d'hydrogène (H2S)",
      carbon_monoxide: "Monoxyde de carbone (CO)",
      carbon_dioxide: "Dioxyde de carbone (CO2)",
      methane: "Méthane (CH4)",
      ammonia: "Ammoniac (NH3)",
      chlorine: "Chlore (Cl2)",
      nitrogen: "Azote (N2)",
      argon: "Argon (Ar)",
      welding_fumes: "Fumées de soudage"
    },

    // Types de dangers physiques
    physicalHazardTypes: {
      engulfment: "Ensevelissement/Engloutissement",
      crushing: "Écrasement par équipement",
      electrical: "Dangers électriques",
      mechanical: "Dangers mécaniques",
      structural_collapse: "Effondrement structural",
      falls: "Chutes de hauteur",
      temperature_extreme: "Températures extrêmes",
      noise: "Bruit excessif",
      vibration: "Vibrations",
      radiation: "Radiation",
      chemical_exposure: "Exposition chimique",
      biological: "Dangers biologiques",
      confined_space_hazard: "Configuration de l'espace",
      traffic: "Circulation/Trafic"
    },

    // Conditions environnementales
    ventilationRequired: "Ventilation requise",
    ventilationType: "Type de ventilation",
    lightingConditions: "Conditions d'éclairage",
    temperatureRange: "Plage de température",
    moistureLevel: "Niveau d'humidité",
    noiseLevel: "Niveau de bruit",
    weatherConditions: "Conditions météorologiques",

    // Contenu de l'espace
    contents: "Contenu actuel",
    residues: "Résidus/Substances",
    previousUse: "Usage antérieur",
    lastEntry: "Dernière entrée",
    cleaningStatus: "État de nettoyage",

    // Mesures de sécurité
    emergencyEgress: "Plan de sortie d'urgence",
    communicationMethod: "Méthode de communication",
    monitoringEquipment: "Équipement de surveillance",
    ventilationEquipment: "Équipement de ventilation",
    emergencyEquipment: "Équipement d'urgence",

    // Photos
    addPhoto: "Ajouter photo",
    takePhoto: "Prendre photo",
    noPhotos: "Aucune photo",
    photoCategories: {
      exterior: "Extérieur",
      interior: "Intérieur",
      entry: "Points d'entrée",
      hazards: "Dangers",
      equipment: "Équipement",
      safety: "Sécurité"
    },

    // Messages
    saveSuccess: "Permis sauvegardé avec succès!",
    saveError: "Erreur lors de la sauvegarde",
    validationError: "Veuillez compléter tous les champs requis",
    validationPassed: "Validation réussie",
    validationErrors: "Erreurs de validation",
    qrGenerated: "Code QR généré automatiquement",
    qrWillGenerate: "Le QR Code sera généré lors de la sauvegarde"
  },
  en: {
    // Navigation et interface
    title: "Site Information - Confined Space",
    subtitle: "Complete identification and assessment of the confined workspace",
    loading: "Loading...",
    saving: "Saving...",
    success: "Success!",
    error: "Error",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    select: "Select",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",

    // Actions du permis
    permitActions: "Permit Actions",
    searchDatabase: "Database",
    savePermit: "Save",
    printPermit: "Print PDF",
    emailPermit: "Send Email",
    sharePermit: "Share",
    generateQR: "Generate QR",

    // Sections principales
    projectInfo: "Project Information",
    planning: "Planning",
    spaceIdentification: "Confined Space Identification",
    spaceDimensions: "Dimensions and Volume",
    entryPoints: "Entry Points and Access",
    hazardAssessment: "Hazard Assessment",
    environmentalConditions: "Environmental Conditions",
    spaceContent: "Content and History",
    safetyMeasures: "Safety Measures",
    photoDocumentation: "Photo Documentation",
    qrCodeSection: "QR Code - Mobile Access",

    // Champs du formulaire
    projectNumber: "Project number",
    workLocation: "Work location",
    contractor: "Contractor",
    supervisor: "Supervisor",
    entryDate: "Planned entry date",
    duration: "Estimated duration",
    workerCount: "Number of workers",
    workDescription: "Work description",

    // Unités
    unitSystem: "Unit system",
    metric: "Metric (m)",
    imperial: "Imperial (ft)",

    // Formes d'espaces
    spaceShape: "Space shape",
    rectangular: "Rectangular",
    cylindrical: "Cylindrical",
    spherical: "Spherical",
    irregular: "Irregular",

    // Types d'espaces
    spaceType: "Space type",
    spaceTypes: {
      tank: "Tank",
      vessel: "Vessel/Container",
      silo: "Silo", 
      pit: "Pit",
      vault: "Vault",
      tunnel: "Tunnel",
      trench: "Trench",
      manhole: "Manhole",
      storage: "Storage space",
      boiler: "Boiler",
      duct: "Duct",
      chamber: "Chamber",
      other: "Other"
    },

    // Classifications CSA
    csaClass: "CSA Classification",
    csaClasses: {
      class1: "Class 1 - Immediate danger to life",
      class2: "Class 2 - Potential risk",
      class3: "Class 3 - Minimal risk"
    },

    // Dimensions
    length: "Length",
    width: "Width",
    height: "Height",
    diameter: "Diameter",
    volume: "Calculated volume",
    calculateVolume: "Calculate Volume",

    // Points d'entrée
    entryPoint: "Entry point",
    entryType: "Entry type",
    entryDimensions: "Dimensions",
    entryLocation: "Location",
    entryCondition: "Condition",
    entryAccessibility: "Accessibility",
    addEntryPoint: "Add entry point",

    // Dangers
    atmosphericHazards: "Atmospheric Hazards",
    physicalHazards: "Physical Hazards",
    selectHazards: "Select all present hazards",
    hazardsIdentified: "Hazards identified",

    // Types de dangers atmosphériques
    atmosphericHazardTypes: {
      oxygen_deficiency: "Oxygen deficiency (<19.5%)",
      oxygen_enrichment: "Oxygen enrichment (>23%)",
      flammable_gases: "Flammable/combustible gases",
      toxic_gases: "Toxic gases",
      hydrogen_sulfide: "Hydrogen sulfide (H2S)",
      carbon_monoxide: "Carbon monoxide (CO)",
      carbon_dioxide: "Carbon dioxide (CO2)",
      methane: "Methane (CH4)",
      ammonia: "Ammonia (NH3)",
      chlorine: "Chlorine (Cl2)",
      nitrogen: "Nitrogen (N2)",
      argon: "Argon (Ar)",
      welding_fumes: "Welding fumes"
    },

    // Types de dangers physiques
    physicalHazardTypes: {
      engulfment: "Engulfment",
      crushing: "Crushing by equipment",
      electrical: "Electrical hazards",
      mechanical: "Mechanical hazards",
      structural_collapse: "Structural collapse",
      falls: "Falls from height",
      temperature_extreme: "Extreme temperatures",
      noise: "Excessive noise",
      vibration: "Vibrations",
      radiation: "Radiation",
      chemical_exposure: "Chemical exposure",
      biological: "Biological hazards",
      confined_space_hazard: "Space configuration",
      traffic: "Traffic/Circulation"
    },

    // Conditions environnementales
    ventilationRequired: "Ventilation required",
    ventilationType: "Ventilation type",
    lightingConditions: "Lighting conditions",
    temperatureRange: "Temperature range",
    moistureLevel: "Moisture level",
    noiseLevel: "Noise level",
    weatherConditions: "Weather conditions",

    // Contenu de l'espace
    contents: "Current contents",
    residues: "Residues/Substances",
    previousUse: "Previous use",
    lastEntry: "Last entry",
    cleaningStatus: "Cleaning status",

    // Mesures de sécurité
    emergencyEgress: "Emergency egress plan",
    communicationMethod: "Communication method",
    monitoringEquipment: "Monitoring equipment",
    ventilationEquipment: "Ventilation equipment",
    emergencyEquipment: "Emergency equipment",

    // Photos
    addPhoto: "Add photo",
    takePhoto: "Take photo",
    noPhotos: "No photos",
    photoCategories: {
      exterior: "Exterior",
      interior: "Interior",
      entry: "Entry points",
      hazards: "Hazards",
      equipment: "Equipment",
      safety: "Safety"
    },

    // Messages
    saveSuccess: "Permit saved successfully!",
    saveError: "Error saving permit",
    validationError: "Please complete all required fields",
    validationPassed: "Validation passed",
    validationErrors: "Validation errors",
    qrGenerated: "QR Code generated automatically",
    qrWillGenerate: "QR Code will be generated upon saving"
  }
};
// =================== COMPOSANT PRINCIPAL AVEC ÉTATS 100% ISOLÉS ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  updateParentData
}) => {

  // =================== ÉTATS LOCAUX COMPLÈTEMENT ISOLÉS - AUCUNE COMMUNICATION PARENT ===================
  const [confinedSpaceDetails, setConfinedSpaceDetails] = useState<ConfinedSpaceDetails>(() => ({
    // Informations principales
    projectNumber: permitData.projectNumber || '',
    workLocation: permitData.workLocation || '',
    contractor: permitData.contractor || '',
    supervisor: permitData.supervisor || '',
    entryDate: permitData.entryDate || '',
    duration: permitData.duration || '',
    workerCount: permitData.workerCount || 1,
    workDescription: permitData.workDescription || '',

    // Identification de l'espace
    spaceType: permitData.spaceType || '',
    csaClass: permitData.csaClass || '',
    entryMethod: permitData.entryMethod || '',
    accessType: permitData.accessType || '',
    spaceLocation: permitData.spaceLocation || '',
    spaceDescription: permitData.spaceDescription || '',

    // Dimensions avec forme et unités
    dimensions: {
      length: permitData.dimensions?.length || 0,
      width: permitData.dimensions?.width || 0,
      height: permitData.dimensions?.height || 0,
      diameter: permitData.dimensions?.diameter || 0,
      volume: permitData.dimensions?.volume || 0,
      spaceShape: permitData.dimensions?.spaceShape || 'rectangular'
    },
    unitSystem: permitData.unitSystem || 'metric',

    // Points d'entrée
    entryPoints: permitData.entryPoints || [{
      id: 'entry-1',
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    }],

    // Dangers
    atmosphericHazards: permitData.atmosphericHazards || [],
    physicalHazards: permitData.physicalHazards || [],

    // Conditions environnementales
    environmentalConditions: {
      ventilationRequired: permitData.environmentalConditions?.ventilationRequired || false,
      ventilationType: permitData.environmentalConditions?.ventilationType || '',
      lightingConditions: permitData.environmentalConditions?.lightingConditions || '',
      temperatureRange: permitData.environmentalConditions?.temperatureRange || '',
      moistureLevel: permitData.environmentalConditions?.moistureLevel || '',
      noiseLevel: permitData.environmentalConditions?.noiseLevel || '',
      weatherConditions: permitData.environmentalConditions?.weatherConditions || '',
    },

    // Contenu de l'espace
    spaceContent: {
      contents: permitData.spaceContent?.contents || '',
      residues: permitData.spaceContent?.residues || '',
      previousUse: permitData.spaceContent?.previousUse || '',
      lastEntry: permitData.spaceContent?.lastEntry || '',
      cleaningStatus: permitData.spaceContent?.cleaningStatus || '',
    },

    // Mesures de sécurité
    safetyMeasures: {
      emergencyEgress: permitData.safetyMeasures?.emergencyEgress || '',
      communicationMethod: permitData.safetyMeasures?.communicationMethod || '',
      monitoringEquipment: permitData.safetyMeasures?.monitoringEquipment || [],
      ventilationEquipment: permitData.safetyMeasures?.ventilationEquipment || [],
      emergencyEquipment: permitData.safetyMeasures?.emergencyEquipment || [],
    },

    // Photos de l'espace
    spacePhotos: permitData.spacePhotos || []
  }));

  // États pour l'interface utilisateur - PAS DE RE-RENDER
  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>(() => permitData.spacePhotos || []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPermitDatabase, setShowPermitDatabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showClassificationWizard, setShowClassificationWizard] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PermitSearchResult>({
    permits: [],
    total: 0,
    page: 1,
    hasMore: false
  });

  // Réfs - seulement pour les éléments nécessaires
  const photoInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Traductions
  const t = translations[language];

  // =================== HANDLERS ULTRA-ISOLÉS - ZERO COMMUNICATION PARENT ===================
  const handleConfinedSpaceChange = useCallback((field: string, value: any) => {
    // SEULEMENT mise à jour de l'état local - JAMAIS RIEN D'AUTRE
    setConfinedSpaceDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEnvironmentalChange = useCallback((field: string, value: any) => {
    setConfinedSpaceDetails(prev => ({
      ...prev,
      environmentalConditions: {
        ...prev.environmentalConditions,
        [field]: value
      }
    }));
  }, []);

  const handleContentChange = useCallback((field: string, value: any) => {
    setConfinedSpaceDetails(prev => ({
      ...prev,
      spaceContent: {
        ...prev.spaceContent,
        [field]: value
      }
    }));
  }, []);

  const handleSafetyChange = useCallback((field: string, value: any) => {
    setConfinedSpaceDetails(prev => ({
      ...prev,
      safetyMeasures: {
        ...prev.safetyMeasures,
        [field]: value
      }
    }));
  }, []);

  // =================== HANDLERS D'ÉQUIPEMENTS DE SÉCURITÉ ===================
  const handleEquipmentChange = useCallback((equipmentType: 'monitoringEquipment' | 'ventilationEquipment' | 'emergencyEquipment', equipment: string) => {
    setConfinedSpaceDetails(prev => {
      const currentEquipment = prev.safetyMeasures[equipmentType];
      const updatedEquipment = currentEquipment.includes(equipment)
        ? currentEquipment.filter(e => e !== equipment)
        : [...currentEquipment, equipment];
      
      return {
        ...prev,
        safetyMeasures: {
          ...prev.safetyMeasures,
          [equipmentType]: updatedEquipment
        }
      };
    });
  }, []);

  // =================== CALCUL VOLUME SANS COMMUNICATION PARENT ===================
  const calculateVolume = useCallback(() => {
    const { length, width, height, diameter, spaceShape } = confinedSpaceDetails.dimensions;
    const { unitSystem } = confinedSpaceDetails;
    let volume = 0;
    let formulaUsed = '';
    let unitSuffix = unitSystem === 'metric' ? 'm³' : 'ft³';

    switch (spaceShape) {
      case 'rectangular':
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height;
          formulaUsed = `Rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
        
      case 'cylindrical':
        if (diameter > 0 && height > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
          formulaUsed = `Cylindrique: π × (${radius.toFixed(2)})² × ${height}`;
        } else if (diameter > 0 && length > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * length;
          formulaUsed = `Cylindrique: π × (${radius.toFixed(2)})² × ${length}`;
        }
        break;
        
      case 'spherical':
        if (diameter > 0) {
          const radius = diameter / 2;
          volume = (4/3) * Math.PI * Math.pow(radius, 3);
          formulaUsed = `Sphérique: (4/3) × π × (${radius.toFixed(2)})³`;
        }
        break;
        
      case 'irregular':
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height * 0.85;
          formulaUsed = `Irrégulier (approx.): ${length} × ${width} × ${height} × 0.85`;
        }
        break;
        
      default:
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height;
          formulaUsed = `Par défaut: ${length} × ${width} × ${height}`;
        }
        break;
    }

    const updatedDimensions = {
      ...confinedSpaceDetails.dimensions,
      volume: Math.round(volume * 100) / 100
    };

    // SEULEMENT mise à jour locale - PAS de communication avec le parent
    handleConfinedSpaceChange('dimensions', updatedDimensions);
    
    console.log(`Volume calculé: ${updatedDimensions.volume} ${unitSuffix} - Formule: ${formulaUsed}`);
  }, [confinedSpaceDetails.dimensions, confinedSpaceDetails.unitSystem, handleConfinedSpaceChange]);

  // =================== CONVERSION D'UNITÉS ISOLÉE ===================
  const convertUnits = useCallback((fromSystem: UnitSystem, toSystem: UnitSystem) => {
    if (fromSystem === toSystem) return;
    
    const { dimensions } = confinedSpaceDetails;
    let conversionFactor = 1;
    
    if (fromSystem === 'metric' && toSystem === 'imperial') {
      conversionFactor = 3.28084;
    } else if (fromSystem === 'imperial' && toSystem === 'metric') {
      conversionFactor = 0.3048;
    }
    
    const convertedDimensions = {
      ...dimensions,
      length: Math.round(dimensions.length * conversionFactor * 100) / 100,
      width: Math.round(dimensions.width * conversionFactor * 100) / 100,
      height: Math.round(dimensions.height * conversionFactor * 100) / 100,
      diameter: Math.round(dimensions.diameter * conversionFactor * 100) / 100,
      volume: 0 // Reset volume when units change
    };
    
    // SEULEMENT mise à jour locale
    setConfinedSpaceDetails(prev => ({
      ...prev,
      dimensions: convertedDimensions,
      unitSystem: toSystem
    }));
  }, [confinedSpaceDetails]);

  // =================== VALIDATION COMPLÈTE SANS EFFETS DE BORD ===================
  const validateSiteInformation = useCallback((details: ConfinedSpaceDetails = confinedSpaceDetails) => {
    const errors: string[] = [];
    
    // Validation des champs obligatoires
    if (!details.projectNumber.trim()) errors.push(language === 'fr' ? 'Numéro de projet manquant' : 'Project number missing');
    if (!details.workLocation.trim()) errors.push(language === 'fr' ? 'Lieu des travaux manquant' : 'Work location missing');
    if (!details.contractor.trim()) errors.push(language === 'fr' ? 'Entrepreneur manquant' : 'Contractor missing');
    if (!details.supervisor.trim()) errors.push(language === 'fr' ? 'Superviseur manquant' : 'Supervisor missing');
    if (!details.entryDate) errors.push(language === 'fr' ? 'Date d\'entrée manquante' : 'Entry date missing');
    if (!details.spaceType) errors.push(language === 'fr' ? 'Type d\'espace manquant' : 'Space type missing');
    if (!details.csaClass) errors.push(language === 'fr' ? 'Classification CSA manquante' : 'CSA classification missing');
    
    // Validation des dimensions selon la forme
    const { dimensions } = details;
    switch (dimensions.spaceShape) {
      case 'rectangular':
      case 'irregular':
        if (dimensions.length <= 0 || dimensions.width <= 0 || dimensions.height <= 0) {
          errors.push(language === 'fr' ? 'Longueur, largeur et hauteur requises pour forme rectangulaire' : 'Length, width and height required for rectangular shape');
        }
        break;
      case 'cylindrical':
        if (dimensions.diameter <= 0 || (dimensions.height <= 0 && dimensions.length <= 0)) {
          errors.push(language === 'fr' ? 'Diamètre et hauteur (ou longueur) requis pour forme cylindrique' : 'Diameter and height (or length) required for cylindrical shape');
        }
        break;
      case 'spherical':
        if (dimensions.diameter <= 0) {
          errors.push(language === 'fr' ? 'Diamètre requis pour forme sphérique' : 'Diameter required for spherical shape');
        }
        break;
    }
    
    // Validation du volume
    if (dimensions.volume === 0) {
      errors.push(language === 'fr' ? 'Volume doit être calculé' : 'Volume must be calculated');
    }
    
    // Validation des dangers selon la classification
    if ((details.csaClass === 'class1' || details.csaClass === 'class2') && 
        details.atmosphericHazards.length === 0 && details.physicalHazards.length === 0) {
      errors.push(language === 'fr' ? 'Au moins un danger doit être identifié pour cette classification' : 'At least one hazard must be identified for this classification');
    }
    
    // Validation des points d'entrée
    if (details.entryPoints.length === 0) {
      errors.push(language === 'fr' ? 'Au moins un point d\'entrée requis' : 'At least one entry point required');
    } else {
      details.entryPoints.forEach((entry, index) => {
        if (!entry.dimensions.trim()) {
          errors.push(language === 'fr' ? `Dimensions manquantes pour le point d'entrée ${index + 1}` : `Missing dimensions for entry point ${index + 1}`);
        }
        if (!entry.location.trim()) {
          errors.push(language === 'fr' ? `Localisation manquante pour le point d'entrée ${index + 1}` : `Missing location for entry point ${index + 1}`);
        }
      });
    }
    
    return errors;
  }, [confinedSpaceDetails, language]);

  // =================== GESTION DES DANGERS ISOLÉE ===================
  const toggleAtmosphericHazard = useCallback((hazardType: string) => {
    setConfinedSpaceDetails(prev => {
      const currentHazards = prev.atmosphericHazards;
      const updatedHazards = currentHazards.includes(hazardType)
        ? currentHazards.filter(h => h !== hazardType)
        : [...currentHazards, hazardType];
      
      return { ...prev, atmosphericHazards: updatedHazards };
    });
  }, []);

  const togglePhysicalHazard = useCallback((hazardType: string) => {
    setConfinedSpaceDetails(prev => {
      const currentHazards = prev.physicalHazards;
      const updatedHazards = currentHazards.includes(hazardType)
        ? currentHazards.filter(h => h !== hazardType)
        : [...currentHazards, hazardType];
      
      return { ...prev, physicalHazards: updatedHazards };
    });
  }, []);

  // =================== GESTION DES SECTIONS COLLAPSIBLES ===================
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // =================== GESTION DES POINTS D'ENTRÉE ISOLÉE ===================
  const addEntryPoint = useCallback(() => {
    const newEntryPoint = {
      id: `entry-${Date.now()}`,
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    };
    
    setConfinedSpaceDetails(prev => ({
      ...prev,
      entryPoints: [...prev.entryPoints, newEntryPoint]
    }));
  }, []);

  const removeEntryPoint = useCallback((entryId: string) => {
    setConfinedSpaceDetails(prev => {
      if (prev.entryPoints.length <= 1) {
        alert(language === 'fr' ? 'Au moins un point d\'entrée est requis' : 'At least one entry point is required');
        return prev;
      }
      
      return {
        ...prev,
        entryPoints: prev.entryPoints.filter(entry => entry.id !== entryId)
      };
    });
  }, [language]);

  const updateEntryPoint = useCallback((entryId: string, field: string, value: any) => {
    setConfinedSpaceDetails(prev => ({
      ...prev,
      entryPoints: prev.entryPoints.map(entry =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  }, []);

  // =================== GESTION DES PHOTOS SANS COMMUNICATION PARENT ===================
  const handlePhotoCapture = useCallback(async (category: string) => {
    if (photoInputRef.current) {
      photoInputRef.current.accept = "image/*";
      photoInputRef.current.capture = "environment";
      photoInputRef.current.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const newPhoto: SpacePhoto = {
              id: `photo-${Date.now()}`,
              url: event.target?.result as string,
              category,
              caption: `${t.photoCategories?.[category as keyof typeof t.photoCategories] || category} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
              timestamp: new Date().toISOString(),
              location: 'Localisation en cours...',
              measurements: category === 'interior' || category === 'entry' ? 'Mesures à ajouter' : undefined
            };

            // Géolocalisation sans effet de bord
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                  newPhoto.gpsCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  // SEULEMENT mise à jour locale des photos
                  setSpacePhotos(prev => [...prev, newPhoto]);
                }, 
                () => {
                  newPhoto.location = 'Localisation non disponible';
                  // SEULEMENT mise à jour locale des photos
                  setSpacePhotos(prev => [...prev, newPhoto]);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
              );
            } else {
              newPhoto.location = 'Géolocalisation non supportée';
              // SEULEMENT mise à jour locale des photos
              setSpacePhotos(prev => [...prev, newPhoto]);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  }, [t.photoCategories, language]);

  const removePhoto = useCallback((photoId: string) => {
    setSpacePhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const updatePhotoCaption = useCallback((photoId: string, newCaption: string) => {
    setSpacePhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, caption: newCaption } : photo
    ));
  }, []);

  // =================== GÉNÉRATION QR CODE SIMPLE ===================
  const generatePermitQRCode = useCallback(async (permitNumber: string): Promise<string> => {
    try {
      const QRCode = (await import('qrcode')).default;
      
      const permitUrl = `${window.location.origin}/permits/confined-space/${permitNumber}`;
      
      const qrData = {
        permitNumber,
        type: 'confined_space',
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité Compétente',
        issueDate: new Date().toISOString(),
        url: permitUrl,
        projectNumber: confinedSpaceDetails.projectNumber,
        location: confinedSpaceDetails.workLocation,
        contractor: confinedSpaceDetails.contractor,
        spaceType: confinedSpaceDetails.spaceType,
        csaClass: confinedSpaceDetails.csaClass,
        hazardCount: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length,
        logo: '/c-secur360-logo.png'
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      return '';
    }
  }, [selectedProvince, PROVINCIAL_REGULATIONS, confinedSpaceDetails]);

  // =================== AUCUN useEffect QUI PEUT CAUSER UN RE-RENDER ===================
  // SUPPRESSION TOTALE de tous les useEffect sauf celui pour les notifications une seule fois
  useEffect(() => {
    // Seulement demander permission notifications une fois
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []); // SEULEMENT une fois au montage - AUCUNE dépendance
  // =================== CLASSIFICATIONS CSA PAR PROVINCE CANADIENNE COMPLÈTES ===================
  const getCSAClassifications = useCallback((province: ProvinceCode, language: Language) => {
    const baseClassifications = {
      fr: {
        class1: {
          title: "Classe 1 - Danger immédiat pour la vie",
          description: "Atmosphère dangereuse ou risque immédiat de mort",
          criteria: [
            "Oxygène < 19,5% ou > 23%",
            "Gaz inflammables > 10% LIE",
            "H2S > 10 ppm",
            "CO > 35 ppm",
            "Substances toxiques au-dessus des VLEP"
          ],
          examples: ["Réservoirs de produits chimiques", "Espaces avec historique de contamination", "Cuves de fermentation"],
          regulations: {},
          monitoring: "Continue obligatoire",
          permits: "Superviseur certifié requis"
        },
        class2: {
          title: "Classe 2 - Risque potentiel",
          description: "Conditions dangereuses possibles nécessitant précautions",
          criteria: [
            "Risque d'atmosphère dangereuse",
            "Configuration pouvant piéger",
            "Dangers mécaniques/électriques",
            "Température extrême possible"
          ],
          examples: ["Regards d'égout", "Réservoirs nettoyés", "Tunnels utilitaires"],
          regulations: {},
          monitoring: "Tests initiaux + périodiques",
          permits: "Personne compétente requise"
        },
        class3: {
          title: "Classe 3 - Risque minimal",
          description: "Espace avec configuration d'espace clos mais risques minimes",
          criteria: [
            "Pas d'atmosphère dangereuse",
            "Accès et sortie sécuritaires",
            "Pas de dangers significatifs",
            "Ventilation naturelle adéquate"
          ],
          examples: ["Réservoirs d'eau potable", "Tunnels ventilés", "Espaces de stockage secs"],
          regulations: {},
          monitoring: "Tests d'entrée seulement",
          permits: "Formation de base suffisante"
        }
      },
      en: {
        class1: {
          title: "Class 1 - Immediate danger to life",
          description: "Hazardous atmosphere or immediate risk of death",
          criteria: [
            "Oxygen < 19.5% or > 23%",
            "Flammable gases > 10% LEL",
            "H2S > 10 ppm",
            "CO > 35 ppm",
            "Toxic substances above OELs"
          ],
          examples: ["Chemical storage tanks", "Spaces with contamination history", "Fermentation vessels"],
          regulations: {},
          monitoring: "Continuous monitoring required",
          permits: "Certified supervisor required"
        },
        class2: {
          title: "Class 2 - Potential risk",
          description: "Potentially hazardous conditions requiring precautions",
          criteria: [
            "Risk of hazardous atmosphere",
            "Configuration that could trap",
            "Mechanical/electrical hazards",
            "Possible extreme temperature"
          ],
          examples: ["Manholes", "Cleaned tanks", "Utility tunnels"],
          regulations: {},
          monitoring: "Initial + periodic testing",
          permits: "Competent person required"
        },
        class3: {
          title: "Class 3 - Minimal risk",
          description: "Confined space configuration but minimal hazards",
          criteria: [
            "No hazardous atmosphere",
            "Safe access and egress",
            "No significant hazards",
            "Adequate natural ventilation"
          ],
          examples: ["Potable water tanks", "Ventilated tunnels", "Dry storage spaces"],
          regulations: {},
          monitoring: "Entry testing only",
          permits: "Basic training sufficient"
        }
      }
    };

    // Réglementations spécifiques par province - COMPLÈTES
    const provincialRegulations = {
      QC: {
        authority: "CNESST",
        mainRegulation: "RSST Articles 302-317",
        additionalRegs: ["CSA Z1006", "Loi sur la santé et sécurité du travail"],
        class1: {
          specific: "Art. 302-305 RSST - Espaces clos dangereux",
          attendant: "Surveillant qualifié obligatoire (Art. 308)",
          rescue: "Plan sauvetage détaillé requis (Art. 311)",
          testing: "Tests continus O2, LIE, CO, H2S (Art. 306)"
        },
        class2: {
          specific: "Art. 306-309 RSST - Précautions spéciales",
          attendant: "Personne compétente requise",
          rescue: "Procédures d'urgence établies",
          testing: "Tests initiaux + aux 2h minimum"
        },
        class3: {
          specific: "Art. 302 RSST - Définition espace clos",
          attendant: "Formation base sécurité",
          rescue: "Procédures d'évacuation standard",
          testing: "Tests d'entrée obligatoires"
        }
      },
      ON: {
        authority: "Ministry of Labour",
        mainRegulation: "O. Reg. 632/05 - Confined Spaces",
        additionalRegs: ["OHSA Section 25.2(h)", "CSA Z1006"],
        class1: {
          specific: "Reg. 632/05 s.8-12 - Hazardous atmosphere",
          attendant: "Competent worker + attendant (s.11)",
          rescue: "Written rescue procedures (s.12)",
          testing: "Continuous monitoring required (s.9)"
        },
        class2: {
          specific: "Reg. 632/05 s.6-7 - Entry procedures",
          attendant: "Competent worker required",
          rescue: "Emergency procedures documented",
          testing: "Testing before entry + periodic (s.7)"
        },
        class3: {
          specific: "Reg. 632/05 s.4-5 - Assessment required",
          attendant: "Trained worker sufficient",
          rescue: "Basic emergency procedures",
          testing: "Pre-entry testing (s.5)"
        }
      },
      BC: {
        authority: "WorkSafeBC",
        mainRegulation: "OHSR Part 9 - Confined Space",
        additionalRegs: ["WCA Section 115", "CSA Z1006"],
        class1: {
          specific: "OHSR 9.19-9.23 - Hazardous atmosphere",
          attendant: "Qualified attendant required (9.21)",
          rescue: "Rescue plan with trained team (9.23)",
          testing: "Continuous monitoring (9.20)"
        },
        class2: {
          specific: "OHSR 9.15-9.18 - Entry procedures",
          attendant: "Competent person required",
          rescue: "Emergency response procedures",
          testing: "Testing before/during entry (9.16)"
        },
        class3: {
          specific: "OHSR 9.3-9.8 - Hazard assessment",
          attendant: "Trained worker adequate",
          rescue: "Standard emergency procedures",
          testing: "Pre-entry testing required (9.7)"
        }
      },
      AB: {
        authority: "Alberta OHS",
        mainRegulation: "OHS Code Part 46 - Confined Space",
        additionalRegs: ["OHS Act Section 13", "CSA Z1006"],
        class1: {
          specific: "OHS Code 460-468 - Hazardous atmosphere",
          attendant: "Qualified attendant mandatory (465)",
          rescue: "Written rescue plan required (468)",
          testing: "Continuous atmospheric monitoring (462)"
        },
        class2: {
          specific: "OHS Code 459-464 - Entry requirements",
          attendant: "Competent worker required",
          rescue: "Emergency procedures documented",
          testing: "Testing before entry + hourly (461)"
        },
        class3: {
          specific: "OHS Code 457-459 - Hazard identification",
          attendant: "Trained worker sufficient",
          rescue: "Basic emergency response",
          testing: "Pre-entry testing (458)"
        }
      },
      SK: {
        authority: "Saskatchewan OHS",
        mainRegulation: "OHS Regs Part XVIII - Confined Space",
        additionalRegs: ["OHS Act Section 3-11", "CSA Z1006"],
        class1: {
          specific: "Reg. 18-1 to 18-8 - Hazardous space",
          attendant: "Qualified attendant required (18-6)",
          rescue: "Rescue procedures written (18-8)",
          testing: "Continuous monitoring required (18-4)"
        },
        class2: {
          specific: "Reg. 18-2 to 18-5 - Entry protocols",
          attendant: "Competent person needed",
          rescue: "Emergency procedures established",
          testing: "Pre-entry + periodic testing (18-3)"
        },
        class3: {
          specific: "Reg. 18-1 - Space identification",
          attendant: "Basic training required",
          rescue: "Standard safety procedures",
          testing: "Entry testing mandatory (18-2)"
        }
      },
      MB: {
        authority: "Manitoba Workplace Safety",
        mainRegulation: "WSH Reg. Part 39 - Confined Space",
        additionalRegs: ["WSH Act Section 7.4", "CSA Z1006"],
        class1: {
          specific: "Reg. 39.1-39.10 - Hazardous atmosphere",
          attendant: "Qualified supervisor required (39.7)",
          rescue: "Detailed rescue plan (39.10)",
          testing: "Continuous monitoring (39.5)"
        },
        class2: {
          specific: "Reg. 39.3-39.6 - Safety procedures",
          attendant: "Competent person required",
          rescue: "Emergency response plan",
          testing: "Testing before/during entry (39.4)"
        },
        class3: {
          specific: "Reg. 39.1-39.2 - Basic requirements",
          attendant: "Trained worker adequate",
          rescue: "Standard emergency procedures",
          testing: "Pre-entry testing (39.2)"
        }
      },
      NB: {
        authority: "WorkSafeNB",
        mainRegulation: "NBOSH Reg. Part XVI - Confined Space",
        additionalRegs: ["NBOSH Act Section 9", "CSA Z1006"],
        class1: {
          specific: "Regulation 16.1-16.12 - Hazardous entry",
          attendant: "Qualified attendant mandatory (16.8)",
          rescue: "Written rescue procedures (16.12)",
          testing: "Continuous monitoring required (16.6)"
        },
        class2: {
          specific: "Regulation 16.3-16.7 - Entry requirements",
          attendant: "Competent worker required",
          rescue: "Emergency procedures documented",
          testing: "Testing before entry + hourly (16.5)"
        },
        class3: {
          specific: "Regulation 16.1-16.2 - Space assessment",
          attendant: "Basic training sufficient",
          rescue: "Standard safety procedures",
          testing: "Pre-entry testing (16.2)"
        }
      },
      NS: {
        authority: "Workers' Compensation Board",
        mainRegulation: "OHS Reg. Part 25 - Confined Space",
        additionalRegs: ["OHSA Section 52", "CSA Z1006"],
        class1: {
          specific: "Reg. 25.1-25.15 - Hazardous atmosphere",
          attendant: "Qualified attendant required (25.10)",
          rescue: "Rescue plan with team (25.15)",
          testing: "Continuous monitoring (25.8)"
        },
        class2: {
          specific: "Reg. 25.5-25.9 - Entry procedures",
          attendant: "Competent person needed",
          rescue: "Emergency response procedures",
          testing: "Testing before/during work (25.7)"
        },
        class3: {
          specific: "Reg. 25.1-25.4 - Basic requirements",
          attendant: "Trained worker sufficient",
          rescue: "Standard emergency procedures",
          testing: "Pre-entry testing mandatory (25.3)"
        }
      },
      PE: {
        authority: "PEI Workers Compensation Board",
        mainRegulation: "OHS Reg. Section 8 - Confined Space",
        additionalRegs: ["OHSA Section 28", "CSA Z1006"],
        class1: {
          specific: "Reg. 8.1-8.12 - Hazardous entry",
          attendant: "Qualified supervisor required (8.8)",
          rescue: "Written rescue plan (8.12)",
          testing: "Continuous monitoring (8.6)"
        },
        class2: {
          specific: "Reg. 8.3-8.7 - Safety requirements",
          attendant: "Competent person required",
          rescue: "Emergency procedures established",
          testing: "Pre-entry + periodic testing (8.5)"
        },
        class3: {
          specific: "Reg. 8.1-8.2 - Basic assessment",
          attendant: "Basic training adequate",
          rescue: "Standard safety procedures",
          testing: "Entry testing required (8.2)"
        }
      },
      NL: {
        authority: "WorkplaceNL",
        mainRegulation: "OHS Reg. Part IV.7 - Confined Space",
        additionalRegs: ["OHSA Section 37", "CSA Z1006"],
        class1: {
          specific: "Reg. IV.7.1-IV.7.15 - Hazardous atmosphere",
          attendant: "Qualified attendant mandatory (IV.7.10)",
          rescue: "Rescue procedures documented (IV.7.15)",
          testing: "Continuous monitoring required (IV.7.8)"
        },
        class2: {
          specific: "Reg. IV.7.5-IV.7.9 - Entry protocols",
          attendant: "Competent worker required",
          rescue: "Emergency response plan",
          testing: "Testing before/during entry (IV.7.7)"
        },
        class3: {
          specific: "Reg. IV.7.1-IV.7.4 - Assessment requirements",
          attendant: "Trained worker sufficient",
          rescue: "Basic emergency procedures",
          testing: "Pre-entry testing (IV.7.3)"
        }
      }
    };

    const classifications = baseClassifications[language];
    const provinceRegs = provincialRegulations[province];

    // Intégrer les réglementations provinciales
    Object.keys(classifications).forEach(classKey => {
      const classData = classifications[classKey as keyof typeof classifications];
      const provinceClassData = provinceRegs[classKey as 'class1' | 'class2' | 'class3'];
      
      classData.regulations = {
        authority: provinceRegs.authority,
        main: provinceRegs.mainRegulation,
        additional: provinceRegs.additionalRegs,
        specific: provinceClassData.specific,
        attendant: provinceClassData.attendant,
        rescue: provinceClassData.rescue,
        testing: provinceClassData.testing
      };
    });

    return classifications;
  }, []);

  // =================== QUESTIONNAIRE DE CLASSIFICATION INTELLIGENTE COMPLET ===================
  const getClassificationQuestions = useCallback((language: Language) => {
    return {
      fr: [
        {
          id: 'atmosphere_current',
          question: "L'espace contient-il actuellement une atmosphère dangereuse?",
          type: 'radio',
          options: [
            { value: 'class1', label: "Oui - Atmosphère dangereuse confirmée", weight: 100 },
            { value: 'unknown', label: "Inconnu - Tests requis", weight: 50 },
            { value: 'safe', label: "Non - Atmosphère sécuritaire confirmée", weight: 0 }
          ],
          critical: true
        },
        {
          id: 'atmosphere_history',
          question: "L'espace a-t-il un historique de contamination ou de substances dangereuses?",
          type: 'radio',
          options: [
            { value: 'yes', label: "Oui - Historique de contamination", weight: 80 },
            { value: 'possible', label: "Possiblement - Usage industriel antérieur", weight: 40 },
            { value: 'no', label: "Non - Jamais utilisé pour substances dangereuses", weight: 0 }
          ]
        },
        {
          id: 'access_egress',
          question: "Comment évaluez-vous l'accès et la sortie de l'espace?",
          type: 'radio',
          options: [
            { value: 'difficult', label: "Difficile - Sortie compliquée/limitée", weight: 60 },
            { value: 'restricted', label: "Restreint - Une seule voie d'accès", weight: 30 },
            { value: 'good', label: "Bon - Accès et sortie multiples/faciles", weight: 0 }
          ]
        },
        {
          id: 'ventilation',
          question: "Quelle est la situation de ventilation de l'espace?",
          type: 'radio',
          options: [
            { value: 'none', label: "Aucune - Espace fermé/étanche", weight: 70 },
            { value: 'poor', label: "Faible - Ventilation naturelle limitée", weight: 35 },
            { value: 'good', label: "Bonne - Ventilation naturelle adéquate", weight: 0 }
          ]
        },
        {
          id: 'hazards_physical',
          question: "Y a-t-il des dangers physiques dans l'espace?",
          type: 'checkbox',
          options: [
            { value: 'mechanical', label: "Équipements mécaniques", weight: 25 },
            { value: 'electrical', label: "Dangers électriques", weight: 30 },
            { value: 'engulfment', label: "Risque d'ensevelissement", weight: 40 },
            { value: 'temperature', label: "Températures extrêmes", weight: 25 },
            { value: 'none', label: "Aucun danger physique significatif", weight: 0 }
          ]
        },
        {
          id: 'work_type',
          question: "Quel type de travail sera effectué?",
          type: 'radio',
          options: [
            { value: 'hot_work', label: "Travail à chaud (soudage, coupage)", weight: 50 },
            { value: 'chemical', label: "Manipulation de produits chimiques", weight: 60 },
            { value: 'maintenance', label: "Maintenance générale", weight: 20 },
            { value: 'inspection', label: "Inspection visuelle seulement", weight: 5 }
          ]
        },
        {
          id: 'space_configuration',
          question: "Comment décririez-vous la configuration de l'espace?",
          type: 'radio',
          options: [
            { value: 'complex', label: "Complexe - Multiples niveaux/compartiments", weight: 30 },
            { value: 'standard', label: "Standard - Configuration simple", weight: 15 },
            { value: 'open', label: "Ouvert - Espace dégagé", weight: 0 }
          ]
        }
      ],
      en: [
        {
          id: 'atmosphere_current',
          question: "Does the space currently contain a hazardous atmosphere?",
          type: 'radio',
          options: [
            { value: 'class1', label: "Yes - Hazardous atmosphere confirmed", weight: 100 },
            { value: 'unknown', label: "Unknown - Testing required", weight: 50 },
            { value: 'safe', label: "No - Safe atmosphere confirmed", weight: 0 }
          ],
          critical: true
        },
        {
          id: 'atmosphere_history',
          question: "Does the space have a history of contamination or hazardous substances?",
          type: 'radio',
          options: [
            { value: 'yes', label: "Yes - History of contamination", weight: 80 },
            { value: 'possible', label: "Possibly - Previous industrial use", weight: 40 },
            { value: 'no', label: "No - Never used for hazardous substances", weight: 0 }
          ]
        },
        {
          id: 'access_egress',
          question: "How would you rate the access and egress of the space?",
          type: 'radio',
          options: [
            { value: 'difficult', label: "Difficult - Complicated/limited exit", weight: 60 },
            { value: 'restricted', label: "Restricted - Single access route", weight: 30 },
            { value: 'good', label: "Good - Multiple/easy access and exit", weight: 0 }
          ]
        },
        {
          id: 'ventilation',
          question: "What is the ventilation situation of the space?",
          type: 'radio',
          options: [
            { value: 'none', label: "None - Closed/sealed space", weight: 70 },
            { value: 'poor', label: "Poor - Limited natural ventilation", weight: 35 },
            { value: 'good', label: "Good - Adequate natural ventilation", weight: 0 }
          ]
        },
        {
          id: 'hazards_physical',
          question: "Are there physical hazards in the space?",
          type: 'checkbox',
          options: [
            { value: 'mechanical', label: "Mechanical equipment", weight: 25 },
            { value: 'electrical', label: "Electrical hazards", weight: 30 },
            { value: 'engulfment', label: "Engulfment risk", weight: 40 },
            { value: 'temperature', label: "Extreme temperatures", weight: 25 },
            { value: 'none', label: "No significant physical hazards", weight: 0 }
          ]
        },
        {
          id: 'work_type',
          question: "What type of work will be performed?",
          type: 'radio',
          options: [
            { value: 'hot_work', label: "Hot work (welding, cutting)", weight: 50 },
            { value: 'chemical', label: "Chemical handling", weight: 60 },
            { value: 'maintenance', label: "General maintenance", weight: 20 },
            { value: 'inspection', label: "Visual inspection only", weight: 5 }
          ]
        },
        {
          id: 'space_configuration',
          question: "How would you describe the space configuration?",
          type: 'radio',
          options: [
            { value: 'complex', label: "Complex - Multiple levels/compartments", weight: 30 },
            { value: 'standard', label: "Standard - Simple configuration", weight: 15 },
            { value: 'open', label: "Open - Clear space", weight: 0 }
          ]
        }
      ]
    };
  }, []);

  // =================== SYSTÈME DE CLASSIFICATION AUTOMATIQUE ===================
  const calculateCSAClass = useCallback((answers: Record<string, any>) => {
    let totalWeight = 0;
    const questions = getClassificationQuestions(language);

    questions[language].forEach(question => {
      const answer = answers[question.id];
      if (!answer) return;

      if (question.type === 'radio') {
        const option = question.options.find(opt => opt.value === answer);
        if (option) totalWeight += option.weight;
      } else if (question.type === 'checkbox' && Array.isArray(answer)) {
        answer.forEach(value => {
          const option = question.options.find(opt => opt.value === value);
          if (option && value !== 'none') totalWeight += option.weight;
        });
      }
    });

    // Classification basée sur le poids total
    if (totalWeight >= 150) return 'class1';
    if (totalWeight >= 50) return 'class2';
    return 'class3';
  }, [language, getClassificationQuestions]);

  const handleClassificationComplete = useCallback((classification: string, answers: Record<string, any>) => {
    handleConfinedSpaceChange('csaClass', classification);
    
    // Notification de succès simple (sans re-render du parent)
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const selectedClassification = csaClassifications[classification as keyof typeof csaClassifications];
    
    // Notification simple sans effet de bord
    console.log(`✅ Classification déterminée: ${selectedClassification?.title || classification}`);
    
    // Optionnellement sauvegarder les réponses pour audit
    // updatePermitData({ classificationAnswers: answers, classificationDate: new Date().toISOString() });
  }, [handleConfinedSpaceChange, getCSAClassifications, selectedProvince, language]);

  // =================== RECHERCHE DANS LA BASE DE DONNÉES COMPLÈTE ===================
  const searchPermitsDatabase = useCallback(async (query: string, page: number = 1): Promise<PermitSearchResult> => {
    setIsSearching(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      let queryBuilder = supabase
        .from('confined_space_permits')
        .select(`
          id,
          permit_number,
          project_number,
          work_location,
          contractor,
          supervisor,
          space_type,
          csa_class,
          entry_date,
          status,
          created_at,
          last_modified,
          entry_count,
          hazard_count,
          qr_code,
          dimensions,
          atmospheric_hazards,
          physical_hazards,
          space_photos
        `)
        .order('created_at', { ascending: false });

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`
          permit_number.ilike.%${query}%,
          project_number.ilike.%${query}%,
          work_location.ilike.%${query}%,
          contractor.ilike.%${query}%,
          supervisor.ilike.%${query}%,
          space_type.ilike.%${query}%,
          csa_class.ilike.%${query}%
        `);
      }

      queryBuilder = queryBuilder.eq('province', selectedProvince);

      const startRange = (page - 1) * 10;
      const endRange = page * 10 - 1;
      queryBuilder = queryBuilder.range(startRange, endRange);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      const permits: PermitHistoryEntry[] = (data || []).map(permit => ({
        id: permit.id,
        permitNumber: permit.permit_number,
        projectNumber: permit.project_number || '',
        workLocation: permit.work_location || '',
        contractor: permit.contractor || '',
        spaceType: permit.space_type || '',
        csaClass: permit.csa_class || '',
        entryDate: permit.entry_date || '',
        status: permit.status as any,
        createdAt: permit.created_at,
        lastModified: permit.last_modified,
        entryCount: permit.entry_count || 0,
        hazardCount: permit.hazard_count || 0,
        qrCode: permit.qr_code
      }));

      return {
        permits,
        total: count || 0,
        page: page,
        hasMore: (count || 0) > page * 10
      };

    } catch (error) {
      console.error('Erreur recherche base de données:', error);
      return { permits: [], total: 0, page: 1, hasMore: false };
    } finally {
      setIsSearching(false);
    }
  }, [selectedProvince]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults({ permits: [], total: 0, page: 1, hasMore: false });
      return;
    }
    
    const results = await searchPermitsDatabase(query);
    setSearchResults(results);
  }, [searchPermitsDatabase]);

  // =================== CHARGEMENT D'UN PERMIS EXISTANT SANS RE-RENDER ===================
  const loadPermitFromHistory = useCallback(async (permitNumber: string) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('confined_space_permits')
        .select('*')
        .eq('permit_number', permitNumber)
        .single();

      if (error) throw error;

      if (data) {
        const loadedPermit: ConfinedSpaceDetails = {
          projectNumber: data.project_number || '',
          workLocation: data.work_location || '',
          contractor: data.contractor || '',
          supervisor: data.supervisor || '',
          entryDate: data.entry_date || '',
          duration: data.duration || '',
          workerCount: data.worker_count || 1,
          workDescription: data.work_description || '',
          spaceType: data.space_type || '',
          csaClass: data.csa_class || '',
          entryMethod: data.entry_method || '',
          accessType: data.access_type || '',
          spaceLocation: data.space_location || '',
          spaceDescription: data.space_description || '',
          dimensions: data.dimensions || {
            length: 0, width: 0, height: 0, diameter: 0, volume: 0, spaceShape: 'rectangular'
          },
          unitSystem: data.unit_system || 'metric',
          entryPoints: data.entry_points || [{
            id: 'entry-1', type: 'circular', dimensions: '', location: '', 
            condition: 'good', accessibility: 'normal', photos: []
          }],
          atmosphericHazards: data.atmospheric_hazards || [],
          physicalHazards: data.physical_hazards || [],
          environmentalConditions: data.environmental_conditions || {
            ventilationRequired: false, ventilationType: '', lightingConditions: '',
            temperatureRange: '', moistureLevel: '', noiseLevel: '', weatherConditions: ''
          },
          spaceContent: data.space_content || {
            contents: '', residues: '', previousUse: '', lastEntry: '', cleaningStatus: ''
          },
          safetyMeasures: data.safety_measures || {
            emergencyEgress: '', communicationMethod: '', 
            monitoringEquipment: [], ventilationEquipment: [], emergencyEquipment: []
          },
          spacePhotos: data.space_photos || []
        };

        // CHARGEMENT DIRECT sans communication avec le parent
        setConfinedSpaceDetails(loadedPermit);
        setSpacePhotos(data.space_photos || []);
        
        alert(`✅ Permis ${permitNumber} chargé: ${loadedPermit.projectNumber} - ${loadedPermit.workLocation}`);
      }
      
      setShowPermitDatabase(false);
      
    } catch (error) {
      console.error('Erreur chargement permis:', error);
      alert(`❌ Erreur chargement: Impossible de charger le permis ${permitNumber}`);
    }
  }, []);

  // =================== DUPLICATION DE PERMIS ===================
  const duplicatePermit = useCallback(async (permitNumber: string) => {
    try {
      await loadPermitFromHistory(permitNumber);
      
      // Réinitialiser les champs spécifiques pour le nouveau permis
      setConfinedSpaceDetails(prev => ({
        ...prev,
        projectNumber: `${prev.projectNumber} - COPIE`,
        entryDate: '', // Nouvelle date à définir
        spacePhotos: [] // Nouvelles photos requises
      }));
      setSpacePhotos([]);
      
      alert(language === 'fr' ? 
        '✅ Permis dupliqué ! Veuillez mettre à jour les informations nécessaires.' : 
        '✅ Permit duplicated! Please update the necessary information.');
        
    } catch (error) {
      console.error('Erreur duplication permis:', error);
      alert(`❌ Erreur duplication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [language, loadPermitFromHistory]);

  // =================== EXPORTATION DE DONNÉES ===================
  const exportPermitData = useCallback(async (format: 'json' | 'csv') => {
    try {
      const dataToExport = {
        ...confinedSpaceDetails,
        spacePhotos,
        metadata: {
          exportDate: new Date().toISOString(),
          province: selectedProvince,
          authority: PROVINCIAL_REGULATIONS[selectedProvince]?.authority,
          language,
          version: '2.0'
        }
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permit-${confinedSpaceDetails.projectNumber || 'new'}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvData = [
          ['Champ', 'Valeur'],
          ['Numéro de projet', confinedSpaceDetails.projectNumber],
          ['Lieu', confinedSpaceDetails.workLocation],
          ['Entrepreneur', confinedSpaceDetails.contractor],
          ['Superviseur', confinedSpaceDetails.supervisor],
          ['Date d\'entrée', confinedSpaceDetails.entryDate],
          ['Type d\'espace', confinedSpaceDetails.spaceType],
          ['Classification CSA', confinedSpaceDetails.csaClass],
          ['Volume', `${confinedSpaceDetails.dimensions.volume} ${confinedSpaceDetails.unitSystem === 'metric' ? 'm³' : 'ft³'}`],
          ['Dangers atmosphériques', confinedSpaceDetails.atmosphericHazards.join('; ')],
          ['Dangers physiques', confinedSpaceDetails.physicalHazards.join('; ')],
          ['Nombre de photos', spacePhotos.length.toString()]
        ];
        
        const csvContent = csvData.map(row => 
          row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permit-${confinedSpaceDetails.projectNumber || 'new'}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      alert(`✅ ${language === 'fr' ? 'Données exportées avec succès' : 'Data exported successfully'} (${format.toUpperCase()})`);
      
    } catch (error) {
      console.error('Erreur exportation:', error);
      alert(`❌ ${language === 'fr' ? 'Erreur lors de l\'exportation' : 'Error during export'}`);
    }
  }, [confinedSpaceDetails, spacePhotos, selectedProvince, PROVINCIAL_REGULATIONS, language]);
  // =================== SAUVEGARDE AVEC SYNCHRONISATION UNIQUE ===================
  const handleSave = useCallback(async () => {
    const errors = validateSiteInformation();
    
    if (errors.length > 0) {
      alert(`${t.validationError}:\n${errors.join('\n')}`);
      return false;
    }
    
    // SYNCHRONISER avec le parent SEULEMENT ici lors de la sauvegarde
    const completeData = {
      ...confinedSpaceDetails,
      spacePhotos
    };
    
    updatePermitData(completeData);
    updateParentData('siteInformation', completeData);
    
    const permitNumber = await savePermitToDatabase();
    if (permitNumber) {
      return true;
    }
    
    return false;
  }, [validateSiteInformation, t.validationError, confinedSpaceDetails, spacePhotos, updatePermitData, updateParentData]);

  // =================== SAUVEGARDE COMPLÈTE SANS RE-RENDER ===================
  const savePermitToDatabase = useCallback(async (): Promise<string | null> => {
    setIsSaving(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const qrCodeDataUrl = await generatePermitQRCode(permitNumber);
      
      const permitToSave = {
        permit_number: permitNumber,
        project_number: confinedSpaceDetails.projectNumber,
        work_location: confinedSpaceDetails.workLocation,
        contractor: confinedSpaceDetails.contractor,
        supervisor: confinedSpaceDetails.supervisor,
        space_type: confinedSpaceDetails.spaceType,
        csa_class: confinedSpaceDetails.csaClass,
        entry_date: confinedSpaceDetails.entryDate,
        duration: confinedSpaceDetails.duration,
        worker_count: confinedSpaceDetails.workerCount,
        work_description: confinedSpaceDetails.workDescription,
        entry_method: confinedSpaceDetails.entryMethod,
        access_type: confinedSpaceDetails.accessType,
        space_location: confinedSpaceDetails.spaceLocation,
        space_description: confinedSpaceDetails.spaceDescription,
        dimensions: confinedSpaceDetails.dimensions,
        unit_system: confinedSpaceDetails.unitSystem,
        entry_points: confinedSpaceDetails.entryPoints,
        atmospheric_hazards: confinedSpaceDetails.atmosphericHazards,
        physical_hazards: confinedSpaceDetails.physicalHazards,
        environmental_conditions: confinedSpaceDetails.environmentalConditions,
        space_content: confinedSpaceDetails.spaceContent,
        safety_measures: confinedSpaceDetails.safetyMeasures,
        space_photos: spacePhotos,
        status: 'active',
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité Compétente',
        qr_code: qrCodeDataUrl,
        entry_count: 0,
        hazard_count: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length,
        photo_count: spacePhotos.length,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        compliance_version: '2.0',
        language: language
      };

      const { data, error } = await supabase
        .from('confined_space_permits')
        .upsert(permitToSave, { 
          onConflict: 'permit_number',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;

      // PAS de updatePermitData ici pour éviter les re-renders
      alert(`✅ ${t.saveSuccess}: ${permitNumber}`);
      
      return permitNumber;
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert(`❌ ${t.saveError}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [permitData.permit_number, selectedProvince, generatePermitQRCode, confinedSpaceDetails, spacePhotos, PROVINCIAL_REGULATIONS, t.saveSuccess, t.saveError, language]);

  // =================== GÉNÉRATION QR CODE HAUTE QUALITÉ POUR IMPRESSION ===================
  const generatePermitQRCodeForPrint = useCallback(async (permitNumber: string): Promise<string> => {
    try {
      const QRCode = (await import('qrcode')).default;
      
      const permitUrl = `${window.location.origin}/permits/confined-space/${permitNumber}`;
      
      const qrData = {
        permitNumber,
        type: 'confined_space',
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité Compétente',
        issueDate: new Date().toISOString(),
        url: permitUrl,
        projectNumber: confinedSpaceDetails.projectNumber,
        location: confinedSpaceDetails.workLocation,
        contractor: confinedSpaceDetails.contractor,
        spaceType: confinedSpaceDetails.spaceType,
        csaClass: confinedSpaceDetails.csaClass,
        hazardCount: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length,
        volume: confinedSpaceDetails.dimensions.volume,
        unitSystem: confinedSpaceDetails.unitSystem,
        photoCount: spacePhotos.length,
        entryPoints: confinedSpaceDetails.entryPoints.length,
        complianceVersion: '2.0'
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 512
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erreur génération QR Code pour impression:', error);
      return '';
    }
  }, [selectedProvince, PROVINCIAL_REGULATIONS, confinedSpaceDetails, spacePhotos]);

  // =================== GÉNÉRATION CHECKLIST DE VALIDATION COMPLÈTE ===================
  const generateValidationChecklist = useCallback(() => {
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
    
    const baseChecklist = [
      {
        category: language === 'fr' ? 'Tests Atmosphériques' : 'Atmospheric Testing',
        items: [
          language === 'fr' ? 'Tests d\'oxygène (19.5% - 23%)' : 'Oxygen testing (19.5% - 23%)',
          language === 'fr' ? 'Tests de gaz inflammables (<10% LIE)' : 'Flammable gas testing (<10% LEL)',
          language === 'fr' ? 'Tests de gaz toxiques (H2S, CO)' : 'Toxic gas testing (H2S, CO)',
          language === 'fr' ? 'Tests de gaz inertes (N2, Ar)' : 'Inert gas testing (N2, Ar)',
          (currentClassification?.regulations as any)?.testing || (language === 'fr' ? 'Surveillance selon réglementation' : 'Monitoring per regulations')
        ]
      },
      {
        category: language === 'fr' ? 'Personnel et Formation' : 'Personnel and Training',
        items: [
          (currentClassification?.regulations as any)?.attendant || (language === 'fr' ? 'Personnel qualifié requis' : 'Qualified personnel required'),
          language === 'fr' ? 'Formation sur les dangers spécifiques' : 'Training on specific hazards',
          language === 'fr' ? 'Certification des équipements' : 'Equipment certification',
          language === 'fr' ? 'Procédures d\'urgence connues' : 'Emergency procedures known',
          (currentClassification?.regulations as any)?.rescue || (language === 'fr' ? 'Plan de sauvetage établi' : 'Rescue plan established')
        ]
      },
      {
        category: language === 'fr' ? 'Équipements de Sécurité' : 'Safety Equipment',
        items: [
          language === 'fr' ? 'Équipement de surveillance atmosphérique' : 'Atmospheric monitoring equipment',
          language === 'fr' ? 'Équipement de protection individuelle' : 'Personal protective equipment',
          language === 'fr' ? 'Système de communication' : 'Communication system',
          language === 'fr' ? 'Équipement de ventilation' : 'Ventilation equipment',
          language === 'fr' ? 'Équipement de sauvetage d\'urgence' : 'Emergency rescue equipment',
          language === 'fr' ? 'Éclairage de sécurité' : 'Safety lighting'
        ]
      },
      {
        category: language === 'fr' ? 'Accès et Sortie' : 'Access and Egress',
        items: [
          language === 'fr' ? 'Points d\'entrée identifiés et sécurisés' : 'Entry points identified and secured',
          language === 'fr' ? 'Voies d\'évacuation dégagées' : 'Evacuation routes clear',
          language === 'fr' ? 'Signalisation appropriée' : 'Appropriate signage',
          language === 'fr' ? 'Éclairage adéquat' : 'Adequate lighting'
        ]
      },
      {
        category: language === 'fr' ? 'Documentation' : 'Documentation',
        items: [
          language === 'fr' ? 'Permis d\'entrée signé' : 'Entry permit signed',
          language === 'fr' ? 'Analyse des dangers complétée' : 'Hazard analysis completed',
          language === 'fr' ? 'Photos documentaires prises' : 'Documentary photos taken',
          language === 'fr' ? 'Registre d\'entrée/sortie' : 'Entry/exit log',
          language === 'fr' ? 'Plan d\'urgence accessible' : 'Emergency plan accessible'
        ]
      }
    ];

    // Ajout d'éléments spécifiques selon la classification
    if (confinedSpaceDetails.csaClass === 'class1') {
      baseChecklist.push({
        category: language === 'fr' ? 'Classe 1 - Exigences Spéciales' : 'Class 1 - Special Requirements',
        items: [
          language === 'fr' ? 'Surveillance continue obligatoire' : 'Continuous monitoring mandatory',
          language === 'fr' ? 'Équipe de sauvetage sur site' : 'Rescue team on site',
          language === 'fr' ? 'Tests atmosphériques toutes les 30 minutes' : 'Atmospheric testing every 30 minutes',
          language === 'fr' ? 'Autorisation écrite requise' : 'Written authorization required'
        ]
      });
    }

    return baseChecklist;
  }, [getCSAClassifications, selectedProvince, language, confinedSpaceDetails.csaClass]);

  // =================== GÉNÉRATION DE RAPPORT PROFESSIONNEL COMPLET ===================
  const generateCompletePermitReport = useCallback(async (): Promise<PermitReport> => {
    const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
    
    const provinceAuthority = PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité Compétente';
    
    return {
      metadata: {
        permitNumber,
        issueDate: new Date().toISOString(),
        province: selectedProvince,
        authority: provinceAuthority,
        generatedAt: new Date().toISOString(),
        version: '2.0',
        language,
        companyLogo: '/c-secur360-logo.png',
        qrCode: await generatePermitQRCodeForPrint(permitNumber),
        classification: currentClassification
      },
      siteInformation: {
        ...confinedSpaceDetails,
        spacePhotos: spacePhotos,
        csaClassification: currentClassification,
        provincialRegulations: currentClassification?.regulations
      },
      atmosphericTesting: permitData.atmosphericTesting || {
        oxygenLevel: null,
        flammableGases: null,
        toxicGases: null,
        lastTested: null,
        testingFrequency: currentClassification?.monitoring || 'Initial testing'
      },
      entryRegistry: permitData.entryRegistry || {
        entries: [],
        totalEntries: 0,
        currentOccupants: 0
      },
      rescuePlan: permitData.rescuePlan || {
        emergencyContacts: [],
        rescueTeam: currentClassification?.regulations?.attendant || 'To be assigned',
        emergencyProcedures: currentClassification?.regulations?.rescue || 'Standard procedures'
      },
      validationChecklist: generateValidationChecklist()
    };
  }, [permitData, selectedProvince, getCSAClassifications, language, confinedSpaceDetails, PROVINCIAL_REGULATIONS, generatePermitQRCodeForPrint, spacePhotos, generateValidationChecklist]);

  // =================== IMPRESSION LÉGALE PROFESSIONNELLE COMPLÈTE ===================
  const handlePrintPermit = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const csaClassifications = getCSAClassifications(selectedProvince, language);
      const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
      
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${language}">
            <head>
              <title>Permis d'Espace Clos - ${report.metadata.permitNumber}</title>
              <meta charset="utf-8">
              <style>
                @page { size: A4; margin: 15mm; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  font-size: 11pt; 
                  line-height: 1.4; 
                  color: #000; 
                  background: white; 
                }
                .header { 
                  border-bottom: 4px solid #dc2626; 
                  padding: 20px; 
                  margin-bottom: 25px; 
                  text-align: center; 
                  page-break-inside: avoid;
                }
                .permit-number { 
                  font-size: 24pt; 
                  font-weight: bold; 
                  color: #dc2626; 
                  margin-bottom: 10px; 
                }
                .subtitle {
                  font-size: 14pt;
                  color: #666;
                  margin-bottom: 15px;
                }
                .info-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px; 
                  margin: 20px 0; 
                }
                .info-item { 
                  border: 1px solid #ccc; 
                  padding: 10px; 
                  border-radius: 4px; 
                  page-break-inside: avoid;
                }
                .label { 
                  font-weight: bold; 
                  color: #333; 
                  font-size: 9pt; 
                  margin-bottom: 3px; 
                }
                .value { 
                  color: #000; 
                  font-size: 11pt; 
                }
                .classification-box {
                  background: ${currentClassification?.title.includes('1') ? '#fee2e2' : 
                              currentClassification?.title.includes('2') ? '#fef3c7' : '#dcfce7'};
                  border: 2px solid ${currentClassification?.title.includes('1') ? '#dc2626' : 
                                    currentClassification?.title.includes('2') ? '#f59e0b' : '#16a34a'};
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 8px;
                  page-break-inside: avoid;
                }
                .hazards-section {
                  margin: 20px 0;
                  padding: 15px;
                  border: 1px solid #ccc;
                  border-radius: 8px;
                  page-break-inside: avoid;
                }
                .hazard-list {
                  columns: 2;
                  column-gap: 20px;
                  list-style: none;
                  padding: 0;
                }
                .hazard-list li {
                  margin: 5px 0;
                  padding: 3px 0;
                  font-size: 10pt;
                  break-inside: avoid;
                }
                .dimensions-box {
                  background: #f8fafc;
                  border: 1px solid #cbd5e1;
                  padding: 15px;
                  margin: 15px 0;
                  border-radius: 8px;
                  text-align: center;
                }
                .qr-section { 
                  text-align: center; 
                  margin: 30px 0; 
                  border: 2px solid #3b82f6; 
                  padding: 20px; 
                  border-radius: 8px; 
                  page-break-inside: avoid;
                }
                .checklist {
                  margin: 20px 0;
                  page-break-inside: avoid;
                }
                .checklist-category {
                  background: #f1f5f9;
                  padding: 10px;
                  margin: 10px 0;
                  border-left: 4px solid #3b82f6;
                  border-radius: 4px;
                }
                .checklist-items {
                  columns: 2;
                  column-gap: 20px;
                  list-style: none;
                  padding: 10px 0;
                }
                .checklist-items li {
                  margin: 5px 0;
                  padding: 2px 0;
                  font-size: 10pt;
                  break-inside: avoid;
                }
                .signatures { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 20px; 
                  margin-top: 30px; 
                  page-break-inside: avoid;
                }
                .signature-box { 
                  border: 1px solid #ccc; 
                  padding: 15px; 
                  min-height: 100px; 
                }
                .signature-line { 
                  border-bottom: 1px solid #000; 
                  margin-top: 50px; 
                  margin-bottom: 5px; 
                }
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  border-top: 2px solid #ccc;
                  padding-top: 20px;
                  font-size: 9pt;
                  color: #666;
                  page-break-inside: avoid;
                }
                .page-break {
                  page-break-before: always;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="permit-number">🚨 ${language === 'fr' ? 'PERMIS D\'ENTRÉE EN ESPACE CLOS' : 'CONFINED SPACE ENTRY PERMIT'}</div>
                <div class="subtitle">${report.metadata.permitNumber}</div>
                <div style="font-size: 12pt; color: #666;">
                  ${report.metadata.authority} - ${selectedProvince} | ${language === 'fr' ? 'Émis le' : 'Issued on'} ${new Date(report.metadata.issueDate).toLocaleDateString()}
                </div>
              </div>

              <div class="classification-box">
                <h3 style="margin-bottom: 10px; color: ${currentClassification?.title.includes('1') ? '#dc2626' : 
                                                          currentClassification?.title.includes('2') ? '#f59e0b' : '#16a34a'};">
                  🛡️ ${currentClassification?.title || 'Classification non définie'}
                </h3>
                <p style="margin: 0; font-style: italic;">
                  ${currentClassification?.description || 'Description non disponible'}
                </p>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Projet' : 'Project'}</div>
                  <div class="value">${report.siteInformation.projectNumber || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Lieu' : 'Location'}</div>
                  <div class="value">${report.siteInformation.workLocation || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Entrepreneur' : 'Contractor'}</div>
                  <div class="value">${report.siteInformation.contractor || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Superviseur' : 'Supervisor'}</div>
                  <div class="value">${report.siteInformation.supervisor || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Date d\'entrée' : 'Entry Date'}</div>
                  <div class="value">${report.siteInformation.entryDate ? new Date(report.siteInformation.entryDate).toLocaleString() : 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Durée' : 'Duration'}</div>
                  <div class="value">${report.siteInformation.duration || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Type d\'espace' : 'Space Type'}</div>
                  <div class="value">${t.spaceTypes[report.siteInformation.spaceType as keyof typeof t.spaceTypes] || report.siteInformation.spaceType || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">${language === 'fr' ? 'Nombre de travailleurs' : 'Worker Count'}</div>
                  <div class="value">${report.siteInformation.workerCount || 'N/A'}</div>
                </div>
              </div>

              <div class="dimensions-box">
                <h4 style="margin-bottom: 10px; color: #1e40af;">📏 ${language === 'fr' ? 'Dimensions de l\'Espace' : 'Space Dimensions'}</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
                  <div>
                    <div style="font-weight: bold; color: #333;">${report.siteInformation.dimensions?.volume || 0}</div>
                    <div style="font-size: 10pt; color: #666;">${report.siteInformation.unitSystem === 'metric' ? 'm³' : 'ft³'}</div>
                    <div style="font-size: 9pt; color: #999;">${language === 'fr' ? 'Volume' : 'Volume'}</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #333;">${report.siteInformation.dimensions?.length || 0}</div>
                    <div style="font-size: 10pt; color: #666;">${report.siteInformation.unitSystem === 'metric' ? 'm' : 'ft'}</div>
                    <div style="font-size: 9pt; color: #999;">${language === 'fr' ? 'Longueur' : 'Length'}</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #333;">${report.siteInformation.dimensions?.width || 0}</div>
                    <div style="font-size: 10pt; color: #666;">${report.siteInformation.unitSystem === 'metric' ? 'm' : 'ft'}</div>
                    <div style="font-size: 9pt; color: #999;">${language === 'fr' ? 'Largeur' : 'Width'}</div>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #333;">${report.siteInformation.dimensions?.height || 0}</div>
                    <div style="font-size: 10pt; color: #666;">${report.siteInformation.unitSystem === 'metric' ? 'm' : 'ft'}</div>
                    <div style="font-size: 9pt; color: #999;">${language === 'fr' ? 'Hauteur' : 'Height'}</div>
                  </div>
                </div>
                <div style="margin-top: 10px; font-size: 10pt; color: #666;">
                  ${language === 'fr' ? 'Forme' : 'Shape'}: ${t[report.siteInformation.dimensions?.spaceShape as keyof typeof t] || report.siteInformation.dimensions?.spaceShape || 'N/A'}
                </div>
              </div>

              <div class="hazards-section">
                <h4 style="margin-bottom: 15px; color: #dc2626;">⚠️ ${language === 'fr' ? 'Dangers Identifiés' : 'Identified Hazards'}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div>
                    <h5 style="color: #f59e0b; margin-bottom: 10px;">🌪️ ${language === 'fr' ? 'Dangers Atmosphériques' : 'Atmospheric Hazards'}</h5>
                    <ul class="hazard-list">
                      ${report.siteInformation.atmosphericHazards.length > 0 ? 
                        report.siteInformation.atmosphericHazards.map(hazard => 
                          `<li>• ${t.atmosphericHazardTypes[hazard as keyof typeof t.atmosphericHazardTypes] || hazard}</li>`
                        ).join('') : 
                        `<li style="color: #16a34a;">• ${language === 'fr' ? 'Aucun danger identifié' : 'No hazards identified'}</li>`
                      }
                    </ul>
                  </div>
                  <div>
                    <h5 style="color: #dc2626; margin-bottom: 10px;">⚡ ${language === 'fr' ? 'Dangers Physiques' : 'Physical Hazards'}</h5>
                    <ul class="hazard-list">
                      ${report.siteInformation.physicalHazards.length > 0 ? 
                        report.siteInformation.physicalHazards.map(hazard => 
                          `<li>• ${t.physicalHazardTypes[hazard as keyof typeof t.physicalHazardTypes] || hazard}</li>`
                        ).join('') : 
                        `<li style="color: #16a34a;">• ${language === 'fr' ? 'Aucun danger identifié' : 'No hazards identified'}</li>`
                      }
                    </ul>
                  </div>
                </div>
              </div>

              <div class="page-break"></div>

              <div class="checklist">
                <h3 style="margin-bottom: 20px; color: #1e40af;">📋 ${language === 'fr' ? 'Liste de Vérification' : 'Validation Checklist'}</h3>
                ${report.validationChecklist.map(category => `
                  <div class="checklist-category">
                    <h4 style="margin: 0 0 5px 0; color: #1e40af;">${category.category}</h4>
                    <ul class="checklist-items">
                      ${category.items.map(item => `<li>☐ ${item}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>

              <div class="qr-section">
                ${report.metadata.qrCode ? `<img src="${report.metadata.qrCode}" alt="QR Code" style="width: 150px; height: 150px;" />` : '<div>QR Code indisponible</div>'}
                <div style="margin-top: 10px; font-weight: bold;">📱 ${language === 'fr' ? 'Scanner pour accès mobile instantané' : 'Scan for instant mobile access'}</div>
                <div style="margin-top: 5px; font-size: 10pt; color: #666;">
                  ${language === 'fr' ? 'Contient toutes les informations du permis' : 'Contains all permit information'}
                </div>
              </div>

              <div class="signatures">
                <div class="signature-box">
                  <div style="font-weight: bold; margin-bottom: 10px;">
                    ${language === 'fr' ? 'Superviseur / Personne Compétente' : 'Supervisor / Competent Person'}
                  </div>
                  <div style="margin: 10px 0; font-size: 10pt; color: #666;">
                    ${currentClassification?.regulations?.attendant || (language === 'fr' ? 'Qualification requise selon réglementation' : 'Qualification required per regulations')}
                  </div>
                  <div class="signature-line"></div>
                  <div style="font-size: 8pt; color: #666;">
                    ${language === 'fr' ? 'Nom, signature et date' : 'Name, signature and date'}
                  </div>
                </div>
                <div class="signature-box">
                  <div style="font-weight: bold; margin-bottom: 10px;">
                    ${language === 'fr' ? 'Surveillant d\'Espace Clos' : 'Confined Space Attendant'}
                  </div>
                  <div style="margin: 10px 0; font-size: 10pt; color: #666;">
                    ${currentClassification?.regulations?.rescue || (language === 'fr' ? 'Plan de sauvetage requis' : 'Rescue plan required')}
                  </div>
                  <div class="signature-line"></div>
                  <div style="font-size: 8pt; color: #666;">
                    ${language === 'fr' ? 'Nom, signature et date' : 'Name, signature and date'}
                  </div>
                </div>
              </div>

              <div class="footer">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>C-SECUR360</strong> - ${language === 'fr' ? 'Système de Gestion de Sécurité Industrielle' : 'Industrial Safety Management System'}
                  </div>
                  <div>
                    ${language === 'fr' ? 'Document généré le' : 'Document generated on'} ${new Date().toLocaleDateString()} - v${report.metadata.version}
                  </div>
                </div>
                <div style="margin-top: 10px; font-size: 8pt;">
                  ${language === 'fr' ? 'Conforme aux exigences' : 'Compliant with'} ${currentClassification?.regulations?.main || 'CSA Z1006'} | 
                  ${language === 'fr' ? 'Autorité' : 'Authority'}: ${report.metadata.authority}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    } finally {
      setIsGeneratingReport(false);
    }
  }, [generateCompletePermitReport, getCSAClassifications, selectedProvince, language, confinedSpaceDetails.csaClass, t]);

  // =================== ENVOI EMAIL ET PARTAGE COMPLETS ===================
  const handleEmailPermit = useCallback(async () => {
    const subject = `${language === 'fr' ? 'Permis d\'Espace Clos' : 'Confined Space Permit'} - ${permitData.permit_number || 'Nouveau'}`;
    const body = `${language === 'fr' ? 'Permis d\'entrée en espace clos' : 'Confined space entry permit'}:
    
📋 ${language === 'fr' ? 'Projet' : 'Project'}: ${confinedSpaceDetails.projectNumber}
📍 ${language === 'fr' ? 'Lieu' : 'Location'}: ${confinedSpaceDetails.workLocation}
🏗️ ${language === 'fr' ? 'Entrepreneur' : 'Contractor'}: ${confinedSpaceDetails.contractor}
👷 ${language === 'fr' ? 'Superviseur' : 'Supervisor'}: ${confinedSpaceDetails.supervisor}
📅 ${language === 'fr' ? 'Date d\'entrée' : 'Entry Date'}: ${confinedSpaceDetails.entryDate ? new Date(confinedSpaceDetails.entryDate).toLocaleDateString() : 'À définir'}
🏷️ ${language === 'fr' ? 'Type' : 'Type'}: ${t.spaceTypes[confinedSpaceDetails.spaceType as keyof typeof t.spaceTypes] || confinedSpaceDetails.spaceType}
🛡️ ${language === 'fr' ? 'Classification' : 'Classification'}: ${t.csaClasses[confinedSpaceDetails.csaClass as keyof typeof t.csaClasses] || confinedSpaceDetails.csaClass}
📐 ${language === 'fr' ? 'Volume' : 'Volume'}: ${confinedSpaceDetails.dimensions.volume} ${confinedSpaceDetails.unitSystem === 'metric' ? 'm³' : 'ft³'}
⚠️ ${language === 'fr' ? 'Dangers' : 'Hazards'}: ${confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length}
📸 ${language === 'fr' ? 'Photos' : 'Photos'}: ${spacePhotos.length}

${language === 'fr' ? 'Autorité' : 'Authority'}: ${PROVINCIAL_REGULATIONS[selectedProvince]?.authority} (${selectedProvince})

${language === 'fr' ? 'Document généré par C-SECUR360' : 'Document generated by C-SECUR360'}`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  }, [language, permitData.permit_number, confinedSpaceDetails, spacePhotos, t, selectedProvince, PROVINCIAL_REGULATIONS]);

  const handleSharePermit = useCallback(async () => {
    const shareData = {
      title: `${language === 'fr' ? 'Permis Espace Clos' : 'Confined Space Permit'}`,
      text: `📋 ${confinedSpaceDetails.projectNumber}
📍 ${confinedSpaceDetails.workLocation}
🏗️ ${confinedSpaceDetails.contractor}
🛡️ ${t.csaClasses[confinedSpaceDetails.csaClass as keyof typeof t.csaClasses] || confinedSpaceDetails.csaClass}
📐 ${confinedSpaceDetails.dimensions.volume} ${confinedSpaceDetails.unitSystem === 'metric' ? 'm³' : 'ft³'}
⚠️ ${confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length} ${language === 'fr' ? 'dangers identifiés' : 'hazards identified'}`,
      url: window.location.href
    };
    
    if (navigator.share && isMobile) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Partage annulé');
      }
    } else if (navigator.clipboard) {
      const textToShare = `${shareData.title}\n\n${shareData.text}\n\n🔗 ${shareData.url}`;
      await navigator.clipboard.writeText(textToShare);
      alert(`✅ ${language === 'fr' ? 'Copié dans le presse-papiers' : 'Copied to clipboard'}`);
    }
  }, [language, confinedSpaceDetails, t, isMobile]);

  // =================== GÉNÉRATION RAPPORT DÉTAILLÉ POUR AUDIT ===================
  const generateDetailedAuditReport = useCallback(async () => {
    const report = await generateCompletePermitReport();
    const auditData = {
      ...report,
      auditTrail: {
        createdBy: 'C-SECUR360 System',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '2.0',
        complianceChecks: generateValidationChecklist(),
        riskAssessment: {
          overallRisk: confinedSpaceDetails.csaClass,
          atmosphericRisks: confinedSpaceDetails.atmosphericHazards.length,
          physicalRisks: confinedSpaceDetails.physicalHazards.length,
          totalHazards: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length
        },
        documentation: {
          photoCount: spacePhotos.length,
          entryPointsDocumented: confinedSpaceDetails.entryPoints.length,
          dimensionsCalculated: confinedSpaceDetails.dimensions.volume > 0,
          qrCodeGenerated: !!report.metadata.qrCode
        }
      }
    };

    return auditData;
  }, [generateCompletePermitReport, generateValidationChecklist, confinedSpaceDetails, spacePhotos]);
  // =================== COMPOSANT CARROUSEL PHOTOS OPTIMISÉ MOBILE COMPLET ===================
  const PhotoCarousel = ({ photos, onAddPhoto, category }: {
    photos: SpacePhoto[];
    onAddPhoto: () => void;
    category?: string;
  }) => {
    const currentIndex = currentPhotoIndex;
    const totalSlides = photos.length + 1; // +1 pour le bouton "Ajouter"

    const nextSlide = useCallback(() => {
      setCurrentPhotoIndex((currentIndex + 1) % totalSlides);
    }, [currentIndex, totalSlides]);

    const prevSlide = useCallback(() => {
      setCurrentPhotoIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    }, [currentIndex, totalSlides]);

    const goToSlide = useCallback((index: number) => {
      setCurrentPhotoIndex(index);
    }, []);

    return (
      <div className="photo-carousel" style={{
        position: 'relative',
        margin: '20px 0',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <div className="carousel-container" style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '300px' : '400px',
          overflow: 'hidden'
        }}>
          <div className="carousel-track" style={{
            display: 'flex',
            transition: 'transform 0.3s ease',
            height: '100%',
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {photos.map((photo: SpacePhoto, index: number) => (
              <div key={photo.id} className="carousel-slide" style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <div className="photo-info" style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                  color: 'white',
                  padding: isMobile ? '15px 12px 12px' : '20px 16px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div className="photo-caption" style={{ flex: 1, marginRight: '12px' }}>
                    <h4 style={{
                      margin: '0 0 4px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600'
                    }}>
                      {t.photoCategories[photo.category as keyof typeof t.photoCategories] || photo.category}
                    </h4>
                    <p style={{
                      margin: '0 0 2px',
                      fontSize: isMobile ? '11px' : '12px',
                      opacity: 0.8
                    }}>
                      {new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                    {photo.gpsCoords && (
                      <p className="gps-coords" style={{
                        margin: '0 0 2px',
                        fontSize: isMobile ? '10px' : '11px',
                        opacity: 0.7
                      }}>
                        📍 GPS: {photo.gpsCoords.lat.toFixed(6)}, {photo.gpsCoords.lng.toFixed(6)}
                      </p>
                    )}
                    {photo.measurements && (
                      <p className="measurements" style={{
                        margin: 0,
                        fontSize: isMobile ? '10px' : '11px',
                        opacity: 0.7
                      }}>
                        📏 {photo.measurements}
                      </p>
                    )}
                  </div>
                  <div className="photo-actions" style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="photo-action-btn edit" 
                      onClick={() => {
                        const newCaption = prompt(
                          language === 'fr' ? 'Nouvelle légende:' : 'New caption:', 
                          photo.caption
                        );
                        if (newCaption) {
                          updatePhotoCaption(photo.id, newCaption);
                        }
                      }}
                      title={language === 'fr' ? "Modifier la légende" : "Edit caption"}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        minHeight: '28px',
                        touchAction: 'manipulation'
                      }}
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      className="photo-action-btn delete" 
                      onClick={() => {
                        if (confirm(language === 'fr' ? 'Supprimer cette photo?' : 'Delete this photo?')) {
                          removePhoto(photo.id);
                        }
                      }} 
                      title={language === 'fr' ? "Supprimer cette photo" : "Delete this photo"}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        minHeight: '28px',
                        touchAction: 'manipulation'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Slide pour ajouter une photo */}
            <div className="carousel-slide add-photo" style={{
              minWidth: '100%',
              height: '100%',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '2px dashed rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }} onClick={onAddPhoto}>
              <div className="add-photo-content" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--primary-color)',
                textAlign: 'center'
              }}>
                <div className="add-photo-icon" style={{
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)'
                }}>
                  <Camera size={isMobile ? 24 : 28} />
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '600'
                }}>
                  {t.addPhoto}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: isMobile ? '14px' : '15px',
                  opacity: 0.8
                }}>
                  {t.takePhoto}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <>
              <button 
                className="carousel-nav prev" 
                onClick={prevSlide} 
                disabled={totalSlides <= 1}
                aria-label={language === 'fr' ? 'Photo précédente' : 'Previous photo'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: isMobile ? '12px' : '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)',
                  zIndex: 10,
                  touchAction: 'manipulation'
                }}
              >
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <button 
                className="carousel-nav next" 
                onClick={nextSlide} 
                disabled={totalSlides <= 1}
                aria-label={language === 'fr' ? 'Photo suivante' : 'Next photo'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: isMobile ? '12px' : '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  width: isMobile ? '36px' : '44px',
                  height: isMobile ? '36px' : '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition)',
                  zIndex: 10,
                  touchAction: 'manipulation'
                }}
              >
                <ArrowRight size={isMobile ? 16 : 20} />
              </button>
            </>
          )}

          {/* Indicators */}
          {totalSlides > 1 && (
            <div className="carousel-indicators" style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`${language === 'fr' ? 'Aller à la photo' : 'Go to photo'} ${index + 1}`}
                  style={{
                    width: isMobile ? '8px' : '10px',
                    height: isMobile ? '8px' : '10px',
                    borderRadius: '50%',
                    background: index === currentIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    padding: 0,
                    transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // =================== COMPOSANT PLACEHOLDER PHOTOS VIDES ===================
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
    <div 
      className="empty-photo-placeholder"
      style={{ 
        border: `2px dashed ${color}50`, 
        background: `${color}20`,
        borderRadius: 'var(--radius)',
        padding: isMobile ? '30px 20px' : '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        minHeight: isMobile ? '120px' : '150px',
        justifyContent: 'center'
      }}
      onClick={onClick}
    >
      <Camera size={isMobile ? 32 : 40} color={color} />
      <h4 style={{ 
        color, 
        margin: 0, 
        fontSize: isMobile ? '14px' : '16px', 
        fontWeight: '600' 
      }}>
        {title}
      </h4>
      <p style={{ 
        margin: 0, 
        fontSize: isMobile ? '12px' : '14px', 
        color: 'var(--text-muted)' 
      }}>
        {description}
      </p>
    </div>
  );

  // =================== COMPOSANT SÉLECTEUR DE FORME ET UNITÉS COMPLET ===================
  const DimensionsSelector = () => (
    <div style={{
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: 'var(--radius)',
      padding: '20px'
    }}>
      {/* Sélecteurs de forme et unités */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            <Layers style={{ width: '18px', height: '18px' }} />
            {t.spaceShape}<span style={{ color: 'var(--danger-color)' }}>*</span>
          </label>
          <select
            value={confinedSpaceDetails.dimensions.spaceShape}
            onChange={(e) => handleConfinedSpaceChange('dimensions', {
              ...confinedSpaceDetails.dimensions,
              spaceShape: e.target.value as any,
              volume: 0 // Reset volume when shape changes
            })}
            className="premium-select"
          >
            <option value="rectangular">📐 {t.rectangular}</option>
            <option value="cylindrical">🔵 {t.cylindrical}</option>
            <option value="spherical">⚪ {t.spherical}</option>
            <option value="irregular">🔷 {t.irregular}</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            <Ruler style={{ width: '18px', height: '18px' }} />
            {t.unitSystem}
          </label>
          <select
            value={confinedSpaceDetails.unitSystem}
            onChange={(e) => {
              const newSystem = e.target.value as UnitSystem;
              convertUnits(confinedSpaceDetails.unitSystem, newSystem);
            }}
            className="premium-select"
          >
            <option value="metric">📏 {t.metric}</option>
            <option value="imperial">📐 {t.imperial}</option>
          </select>
        </div>
      </div>

      {/* Champs de dimensions adaptatifs selon la forme */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginBottom: '20px'
      }}>
        {/* Longueur - toujours visible sauf pour sphérique */}
        {confinedSpaceDetails.dimensions.spaceShape !== 'spherical' && (
          <div>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              marginBottom: '6px',
              display: 'block'
            }}>
              {t.length} ({confinedSpaceDetails.unitSystem === 'metric' ? 'm' : 'ft'})
              {(confinedSpaceDetails.dimensions.spaceShape === 'rectangular' || confinedSpaceDetails.dimensions.spaceShape === 'irregular') && 
               <span style={{ color: 'var(--danger-color)' }}>*</span>}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={confinedSpaceDetails.dimensions.length || ''}
              onChange={(e) => handleConfinedSpaceChange('dimensions', {
                ...confinedSpaceDetails.dimensions,
                length: parseFloat(e.target.value) || 0
              })}
              className="premium-input"
              placeholder="0.0"
            />
          </div>
        )}

        {/* Largeur - seulement pour rectangulaire et irrégulier */}
        {(confinedSpaceDetails.dimensions.spaceShape === 'rectangular' || 
          confinedSpaceDetails.dimensions.spaceShape === 'irregular') && (
          <div>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              marginBottom: '6px',
              display: 'block'
            }}>
              {t.width} ({confinedSpaceDetails.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={confinedSpaceDetails.dimensions.width || ''}
              onChange={(e) => handleConfinedSpaceChange('dimensions', {
                ...confinedSpaceDetails.dimensions,
                width: parseFloat(e.target.value) || 0
              })}
              className="premium-input"
              placeholder="0.0"
            />
          </div>
        )}

        {/* Hauteur - pour toutes les formes sauf sphérique */}
        {confinedSpaceDetails.dimensions.spaceShape !== 'spherical' && (
          <div>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              marginBottom: '6px',
              display: 'block'
            }}>
              {t.height} ({confinedSpaceDetails.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={confinedSpaceDetails.dimensions.height || ''}
              onChange={(e) => handleConfinedSpaceChange('dimensions', {
                ...confinedSpaceDetails.dimensions,
                height: parseFloat(e.target.value) || 0
              })}
              className="premium-input"
              placeholder="0.0"
            />
          </div>
        )}

        {/* Diamètre - pour cylindrique et sphérique */}
        {(confinedSpaceDetails.dimensions.spaceShape === 'cylindrical' || 
          confinedSpaceDetails.dimensions.spaceShape === 'spherical') && (
          <div>
            <label style={{
              color: 'var(--text-secondary)',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              marginBottom: '6px',
              display: 'block'
            }}>
              {t.diameter} ({confinedSpaceDetails.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={confinedSpaceDetails.dimensions.diameter || ''}
              onChange={(e) => handleConfinedSpaceChange('dimensions', {
                ...confinedSpaceDetails.dimensions,
                diameter: parseFloat(e.target.value) || 0
              })}
              className="premium-input"
              placeholder="0.0"
            />
          </div>
        )}
      </div>

      {/* Bouton de calcul et affichage du volume */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={calculateVolume}
          style={{
            padding: isMobile ? '12px 20px' : '14px 24px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'var(--transition)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: isMobile ? '48px' : '50px',
            fontSize: isMobile ? '14px' : '15px',
            background: 'linear-gradient(135deg, var(--success-color), #059669)',
            color: 'white',
            boxShadow: 'var(--shadow-sm)',
            margin: '0 auto',
            touchAction: 'manipulation'
          }}
        >
          <Gauge size={20} />
          {t.calculateVolume}
        </button>
      </div>

      {/* Affichage du volume calculé */}
      {confinedSpaceDetails.dimensions.volume > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: isMobile ? '24px' : '28px', 
            fontWeight: '700', 
            color: 'var(--success-color)', 
            marginBottom: '8px'
          }}>
            {confinedSpaceDetails.dimensions.volume}
          </div>
          <div style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            color: '#6ee7b7',
            fontWeight: '600'
          }}>
            {confinedSpaceDetails.unitSystem === 'metric' ? 'm³' : 'ft³'} - {t.volume}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#86efac',
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {language === 'fr' ? 'Forme' : 'Shape'}: {t[confinedSpaceDetails.dimensions.spaceShape as keyof typeof t] || confinedSpaceDetails.dimensions.spaceShape}
          </div>
        </div>
      )}
    </div>
  );

  // =================== COMPOSANT QR CODE RÉEL AVEC ÉTAT ===================
  const QRCodeDisplay = () => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
      if (permitData.permit_number) {
        setIsGenerating(true);
        generatePermitQRCode(permitData.permit_number)
          .then(setQrCodeDataUrl)
          .finally(() => setIsGenerating(false));
      }
    }, [permitData.permit_number]);

    if (permitData.permit_number && qrCodeDataUrl) {
      return (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            display: 'inline-block',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {isGenerating ? (
              <div style={{
                width: isMobile ? '150px' : '200px',
                height: isMobile ? '150px' : '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
              </div>
            ) : (
              <img 
                src={qrCodeDataUrl} 
                alt={`QR Code pour ${permitData.permit_number}`}
                style={{
                  width: isMobile ? '150px' : '200px',
                  height: isMobile ? '150px' : '200px',
                  display: 'block'
                }}
              />
            )}
          </div>
          <h4 style={{ 
            color: '#10b981', 
            margin: '0 0 8px 0', 
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '600'
          }}>
            ✅ {language === 'fr' ? `QR Code généré pour : ${permitData.permit_number}` : `QR Code generated for: ${permitData.permit_number}`}
          </h4>
          <p style={{ 
            color: '#6ee7b7', 
            margin: '0 0 12px 0', 
            fontSize: '14px' 
          }}>
            {t.qrGenerated}
          </p>
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#047857'
          }}>
            📱 {language === 'fr' ? 'Scanner pour accès mobile instantané' : 'Scan for instant mobile access'}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#6ee7b7'
          }}>
            {language === 'fr' ? 'Contient toutes les informations du permis' : 'Contains all permit information'}
          </div>
        </div>
      );
    } else {
      return (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: isMobile ? '80px' : '100px',
            height: isMobile ? '80px' : '100px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <QrCode size={isMobile ? 40 : 50} color="#3b82f6" />
          </div>
          <p style={{ 
            color: '#93c5fd', 
            margin: 0, 
            fontSize: '14px' 
          }}>
            💡 {t.qrWillGenerate}
          </p>
        </div>
      );
    }
  };

  // =================== COMPOSANT BOUTONS CAPTURE PHOTO ===================
  const PhotoCaptureButtons = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
      gap: '8px', 
      marginBottom: '16px' 
    }}>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('exterior')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--primary-color)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <Camera size={14} />
        {t.photoCategories.exterior}
      </button>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('interior')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--success-color)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <Home size={14} />
        {t.photoCategories.interior}
      </button>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('entry')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--warning-color)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <ArrowRight size={14} />
        {t.photoCategories.entry}
      </button>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('hazards')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--danger-color)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <AlertTriangle size={14} />
        {t.photoCategories.hazards}
      </button>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('equipment')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#8b5cf6',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <Shield size={14} />
        {t.photoCategories.equipment}
      </button>
      <button 
        className="photo-capture-btn" 
        onClick={() => handlePhotoCapture('safety')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#22c55e',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: isMobile ? '12px' : '13px',
          fontWeight: '600',
          minHeight: isMobile ? '36px' : '40px',
          touchAction: 'manipulation'
        }}
      >
        <Shield size={14} />
        {t.photoCategories.safety}
      </button>
    </div>
  );
  // =================== COMPOSANT QUESTIONNAIRE CLASSIFICATION CSA COMPLET ===================
  const CSAClassificationWizard = ({ 
    isOpen, 
    onClose, 
    onClassificationComplete 
  }: {
    isOpen: boolean;
    onClose: () => void;
    onClassificationComplete: (classification: string, answers: Record<string, any>) => void;
  }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const questions = getClassificationQuestions(language)[language];

    if (!isOpen) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswer = (questionId: string, answer: any) => {
      const newAnswers = { ...answers, [questionId]: answer };
      setAnswers(newAnswers);
    };

    const nextQuestion = () => {
      if (isLastQuestion) {
        const classification = calculateCSAClass(answers);
        onClassificationComplete(classification, answers);
        onClose();
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    const prevQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '20px',
          maxWidth: isMobile ? '95vw' : '600px',
          width: '100%',
          maxHeight: isMobile ? '90vh' : '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header du questionnaire avec progression */}
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <h2 style={{
                margin: '0 0 12px 0',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                🎯 {language === 'fr' ? 'Assistant de Classification CSA' : 'CSA Classification Wizard'}
              </h2>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-color), var(--success-color))',
                  transition: 'width 0.3s ease',
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                }} />
              </div>
              <span style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#94a3b8',
                fontWeight: '600'
              }}>
                {language === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenu du questionnaire */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px' : '24px'
          }}>
            <div>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                lineHeight: 1.4
              }}>
                {currentQuestion.critical && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '4px',
                    flexShrink: 0
                  }}>
                    <AlertTriangle color="#ef4444" size={16} />
                  </div>
                )}
                <span>{currentQuestion.question}</span>
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {currentQuestion.options.map((option) => (
                  <label key={option.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isMobile ? '12px' : '16px',
                    background: answers[currentQuestion.id] === option.value || 
                                (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id]?.includes(option.value)) ? 
                                'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: `2px solid ${answers[currentQuestion.id] === option.value || 
                                        (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id]?.includes(option.value)) ? 
                                        '#3b82f6' : 'rgba(100, 116, 139, 0.3)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontSize: isMobile ? '14px' : '15px'
                  }}>
                    <input
                      type={currentQuestion.type}
                      name={currentQuestion.id}
                      value={option.value}
                      checked={
                        currentQuestion.type === 'radio' 
                          ? answers[currentQuestion.id] === option.value
                          : answers[currentQuestion.id]?.includes(option.value)
                      }
                      onChange={(e) => {
                        if (currentQuestion.type === 'radio') {
                          handleAnswer(currentQuestion.id, option.value);
                        } else {
                          const currentAnswers = answers[currentQuestion.id] || [];
                          if (e.target.checked) {
                            if (option.value === 'none') {
                              handleAnswer(currentQuestion.id, ['none']);
                            } else {
                              const newAnswers = currentAnswers.filter((a: string) => a !== 'none');
                              handleAnswer(currentQuestion.id, [...newAnswers, option.value]);
                            }
                          } else {
                            handleAnswer(currentQuestion.id, currentAnswers.filter((a: string) => a !== option.value));
                          }
                        }
                      }}
                      style={{ 
                        margin: 0, 
                        flexShrink: 0,
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b82f6'
                      }}
                    />
                    <span style={{
                      flex: 1,
                      color: '#ffffff',
                      fontWeight: '500'
                    }}>
                      {option.label}
                    </span>
                    <span style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: '#94a3b8',
                      background: option.weight > 50 ? 'rgba(239, 68, 68, 0.2)' : 
                                  option.weight > 20 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      border: `1px solid ${option.weight > 50 ? 'rgba(239, 68, 68, 0.3)' : 
                                          option.weight > 20 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {option.weight}
                    </span>
                  </label>
                ))}
              </div>

              {/* Aide contextuelle */}
              {currentQuestion.critical && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#fca5a5'
                }}>
                  ⚠️ {language === 'fr' ? 
                    'Question critique : Cette réponse aura un impact majeur sur la classification finale.' : 
                    'Critical question: This answer will have a major impact on the final classification.'}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            padding: isMobile ? '16px' : '20px',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: isMobile ? '12px 16px' : '12px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                minHeight: '44px',
                background: currentQuestionIndex === 0 ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.6)',
                color: currentQuestionIndex === 0 ? '#64748b' : '#ffffff',
                border: 'none',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
            >
              <ArrowLeft size={16} />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </button>

            <button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion.id] || 
                       (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)}
              style={{
                padding: isMobile ? '12px 16px' : '12px 20px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: (!answers[currentQuestion.id] || 
                        (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) ? 
                        'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                minHeight: '44px',
                background: (!answers[currentQuestion.id] || 
                           (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) ? 
                           'rgba(59, 130, 246, 0.3)' : 'linear-gradient(135deg, var(--primary-color), #2563eb)',
                color: 'white',
                border: 'none',
                opacity: (!answers[currentQuestion.id] || 
                         (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) ? 0.6 : 1
              }}
            >
              {isLastQuestion ? (language === 'fr' ? 'Terminer' : 'Finish') : (language === 'fr' ? 'Suivant' : 'Next')}
              {isLastQuestion ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =================== COMPOSANT SECTION COLLAPSIBLE MOBILE OPTIMISÉ ===================
  const CollapsibleSection = ({ 
    id, 
    title, 
    icon, 
    children, 
    className = '',
    defaultCollapsed = false,
    validationErrors = 0 
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    defaultCollapsed?: boolean;
    validationErrors?: number;
  }) => {
    const isCollapsed = collapsedSections.has(id) || (defaultCollapsed && !collapsedSections.has(id));

    return (
      <div className={`collapsible-section ${className}`} style={{
        background: 'rgba(31, 41, 59, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        marginBottom: isMobile ? '16px' : '24px',
        overflow: 'hidden',
        transition: 'var(--transition)',
        ...(validationErrors > 0 ? { 
          borderColor: 'var(--danger-color)',
          boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.2)'
        } : {})
      }}>
        <button 
          className="section-toggle"
          onClick={() => toggleSection(id)}
          aria-expanded={!isCollapsed}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            transition: 'var(--transition)',
            minHeight: isMobile ? '60px' : '70px',
            touchAction: 'manipulation'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
            flex: 1
          }}>
            <div style={{
              width: isMobile ? '20px' : '24px',
              height: isMobile ? '20px' : '24px',
              color: validationErrors > 0 ? 'var(--danger-color)' : 'var(--primary-color)',
              flexShrink: 0
            }}>{icon}</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>{title}</h3>
              {validationErrors > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: 'var(--danger-color)',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertTriangle size={12} />
                  {validationErrors} {language === 'fr' ? 'erreur(s)' : 'error(s)'}
                </div>
              )}
            </div>
          </div>
          <div style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.2s ease',
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
          }}>
            <ChevronDown size={20} />
          </div>
        </button>
        
        {!isCollapsed && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid var(--border-color)',
            animation: 'slideDown 0.3s ease'
          }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  // =================== COMPOSANT INDICATEUR DE VALIDATION AVANCÉ ===================
  const ValidationIndicator = () => {
    const errors = validateSiteInformation();
    const isValid = errors.length === 0;
    const completionPercentage = Math.max(0, Math.min(100, 
      ((15 - errors.length) / 15) * 100 // Estimation basée sur ~15 champs requis
    ));

    return (
      <div style={{
        background: isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderRadius: 'var(--radius)',
        padding: isMobile ? '16px' : '20px',
        marginBottom: '20px',
        borderLeft: `4px solid ${isValid ? 'var(--success-color)' : 'var(--danger-color)'}`,
        border: `1px solid ${isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: errors.length > 0 ? '16px' : '8px'
        }}>
          <div style={{ 
            color: isValid ? 'var(--success-color)' : 'var(--danger-color)',
            flexShrink: 0
          }}>
            {isValid ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{
              margin: '0 0 4px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              color: isValid ? '#86efac' : '#fca5a5'
            }}>
              {isValid ? 
                (language === 'fr' ? '✅ Informations Complètes' : '✅ Information Complete') :
                (language === 'fr' ? '⚠️ Informations Incomplètes' : '⚠️ Incomplete Information')
              }
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px'
            }}>
              <div style={{
                flex: 1,
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: isValid ? 'var(--success-color)' : 'var(--warning-color)',
                  transition: 'width 0.3s ease',
                  width: `${completionPercentage}%`
                }} />
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isValid ? '#86efac' : '#fbbf24',
                minWidth: '35px'
              }}>
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <h5 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--danger-color)'
            }}>
              {language === 'fr' ? 'Éléments à compléter :' : 'Items to complete:'}
            </h5>
            {errors.slice(0, 5).map((error, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '12px' : '13px',
                color: 'var(--danger-color)',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <AlertTriangle size={14} />
                <span style={{ flex: 1, wordWrap: 'break-word' }}>{error}</span>
              </div>
            ))}
            {errors.length > 5 && (
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                ... {language === 'fr' ? 'et' : 'and'} {errors.length - 5} {language === 'fr' ? 'autres' : 'more'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // =================== COMPOSANT BOUTONS D'ACTION RAPIDE RESPONSIFS ===================
  const QuickActionButtons = () => (
    <div style={{
      position: isMobile ? 'fixed' : 'sticky',
      ...(isMobile ? { 
        bottom: '20px', 
        right: '20px',
        zIndex: 1000
      } : { 
        top: '20px', 
        zIndex: 100,
        marginBottom: '20px'
      }),
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '16px',
      ...(isMobile ? {} : { justifyContent: 'center' })
    }}>
      {/* Base de données */}
      <button
        onClick={() => setShowPermitDatabase(true)}
        style={{
          ...(isMobile ? {
            width: '56px',
            height: '56px',
            borderRadius: '50%'
          } : {
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)'
          }),
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: 'var(--shadow)',
          touchAction: 'manipulation',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white'
        }}
        title={t.searchDatabase}
      >
        <Database size={16} />
        {!isMobile && <span>{t.searchDatabase}</span>}
      </button>

      {/* Sauvegarder */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          ...(isMobile ? {
            width: '56px',
            height: '56px',
            borderRadius: '50%'
          } : {
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)'
          }),
          border: 'none',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: 'var(--shadow)',
          touchAction: 'manipulation',
          background: 'linear-gradient(135deg, var(--success-color), #059669)',
          color: 'white',
          opacity: isSaving ? 0.7 : 1
        }}
        title={t.savePermit}
      >
        {isSaving ? <div className="spinner" /> : <Save size={16} />}
        {!isMobile && <span>{isSaving ? t.saving : t.savePermit}</span>}
      </button>

      {/* Imprimer */}
      <button
        onClick={handlePrintPermit}
        disabled={isGeneratingReport}
        style={{
          ...(isMobile ? {
            width: '56px',
            height: '56px',
            borderRadius: '50%'
          } : {
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)'
          }),
          border: 'none',
          cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: 'var(--shadow)',
          touchAction: 'manipulation',
          background: 'linear-gradient(135deg, var(--primary-color), #2563eb)',
          color: 'white',
          opacity: isGeneratingReport ? 0.7 : 1
        }}
        title={t.printPermit}
      >
        {isGeneratingReport ? <div className="spinner" /> : <Printer size={16} />}
        {!isMobile && <span>{t.printPermit}</span>}
      </button>

      {/* Partager */}
      <button
        onClick={handleSharePermit}
        style={{
          ...(isMobile ? {
            width: '56px',
            height: '56px',
            borderRadius: '50%'
          } : {
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)'
          }),
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: 'var(--shadow)',
          touchAction: 'manipulation',
          background: 'linear-gradient(135deg, var(--warning-color), #d97706)',
          color: 'white'
        }}
        title={t.sharePermit}
      >
        <Share size={16} />
        {!isMobile && <span>{t.sharePermit}</span>}
      </button>

      {/* Menu supplémentaire pour mobile */}
      {isMobile && (
        <button
          onClick={() => {
            const menu = [
              { label: t.emailPermit, action: handleEmailPermit, icon: '📧' },
              { label: language === 'fr' ? 'Exporter JSON' : 'Export JSON', action: () => exportPermitData('json'), icon: '📄' },
              { label: language === 'fr' ? 'Exporter CSV' : 'Export CSV', action: () => exportPermitData('csv'), icon: '📊' }
            ];
            
            const choice = window.prompt(
              `${language === 'fr' ? 'Actions supplémentaires' : 'Additional actions'}:\n` +
              menu.map((item, index) => `${index + 1}. ${item.icon} ${item.label}`).join('\n') +
              `\n\n${language === 'fr' ? 'Choisissez un numéro (1-3):' : 'Choose a number (1-3):'}`
            );
            
            const index = parseInt(choice || '0') - 1;
            if (index >= 0 && index < menu.length) {
              menu[index].action();
            }
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: 'var(--shadow)',
            touchAction: 'manipulation',
            background: 'linear-gradient(135deg, #64748b, #475569)',
            color: 'white'
          }}
          title={language === 'fr' ? 'Plus d\'actions' : 'More actions'}
        >
          <Menu size={16} />
        </button>
      )}
    </div>
  );

  // =================== COMPOSANT SÉLECTEUR CSA AVEC ASSISTANT INTÉGRÉ ===================
  const CSAClassificationSelector = () => {
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const currentClassification = confinedSpaceDetails.csaClass ? 
      csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications] : null;

    return (
      <div style={{ width: '100%' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontSize: isMobile ? '14px' : '15px',
          fontWeight: '600',
          marginBottom: '8px',
          minHeight: '20px'
        }}>
          <Shield style={{ width: '18px', height: '18px' }} />
          {t.csaClass}<span style={{ color: 'var(--danger-color)' }}>*</span>
        </label>

        {/* Sélecteur et assistant côte à côte */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          marginBottom: '12px'
        }}>
          <select
            value={confinedSpaceDetails.csaClass}
            onChange={(e) => handleConfinedSpaceChange('csaClass', e.target.value)}
            className="premium-select"
            style={{ flex: isMobile ? 'none' : '1' }}
          >
            <option value="">{t.select}</option>
            <option value="class1">🔴 {t.csaClasses.class1}</option>
            <option value="class2">🟡 {t.csaClasses.class2}</option>
            <option value="class3">🟢 {t.csaClasses.class3}</option>
          </select>

          {/* Assistant de classification */}
          <button
            type="button"
            onClick={() => setShowClassificationWizard(true)}
            style={{
              minWidth: isMobile ? '100%' : '140px',
              whiteSpace: 'nowrap',
              padding: isMobile ? '12px 16px' : '14px 20px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minHeight: isMobile ? '48px' : '50px',
              fontSize: isMobile ? '14px' : '15px',
              touchAction: 'manipulation',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Star size={16} />
            <span>{language === 'fr' ? 'Assistant' : 'Wizard'}</span>
          </button>
        </div>

        {/* Affichage de la classification sélectionnée */}
        {currentClassification && (
          <div style={{
            padding: '12px 16px',
            background: confinedSpaceDetails.csaClass === 'class1' ? 'rgba(239, 68, 68, 0.1)' : 
                       confinedSpaceDetails.csaClass === 'class2' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${confinedSpaceDetails.csaClass === 'class1' ? 'var(--danger-color)' : 
                                confinedSpaceDetails.csaClass === 'class2' ? 'var(--warning-color)' : 'var(--success-color)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: isMobile ? '12px' : '13px',
            lineHeight: 1.4
          }}>
            <div style={{
              fontWeight: '600',
              color: confinedSpaceDetails.csaClass === 'class1' ? '#fca5a5' : 
                     confinedSpaceDetails.csaClass === 'class2' ? '#fbbf24' : '#86efac',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>
                {confinedSpaceDetails.csaClass === 'class1' ? '🔴' : 
                 confinedSpaceDetails.csaClass === 'class2' ? '🟡' : '🟢'}
              </span>
              {currentClassification.title}
            </div>
            <div style={{
              color: confinedSpaceDetails.csaClass === 'class1' ? '#fecaca' : 
                     confinedSpaceDetails.csaClass === 'class2' ? '#fde68a' : '#bbf7d0',
              marginBottom: '8px'
            }}>
              {currentClassification.description}
            </div>
            {currentClassification.regulations && (
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '8px',
                marginTop: '8px'
              }}>
                📋 {currentClassification.regulations.main} - {currentClassification.regulations.authority}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  // =================== CSS RESPONSIVE MOBILE ULTRA-OPTIMISÉ COMPLET ===================
  const mobileOptimizedStyles = `
    :root {
      --primary-color: #3b82f6;
      --success-color: #10b981;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
      --info-color: #06b6d4;
      --purple-color: #8b5cf6;
      --dark-bg: #111827;
      --card-bg: #1f2937;
      --border-color: #374151;
      --text-primary: #ffffff;
      --text-secondary: #d1d5db;
      --text-muted: #9ca3af;
      --radius: 12px;
      --radius-sm: 8px;
      --radius-lg: 16px;
      --shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15);
      --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.4);
      --transition: all 0.3s ease;
      --transition-fast: all 0.15s ease;
      --gradient-primary: linear-gradient(135deg, var(--primary-color), #2563eb);
      --gradient-success: linear-gradient(135deg, var(--success-color), #059669);
      --gradient-danger: linear-gradient(135deg, var(--danger-color), #dc2626);
      --gradient-warning: linear-gradient(135deg, var(--warning-color), #d97706);
    }

    * {
      box-sizing: border-box;
    }

    .site-information-container {
      padding: ${isMobile ? '8px' : '24px'};
      max-width: 100%;
      margin: 0 auto;
      background: var(--dark-bg);
      min-height: 100vh;
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      overflow-x: hidden;
      line-height: 1.5;
    }

    /* =================== GRILLES RESPONSIVES =================== */
    .premium-grid {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))'};
      gap: ${isMobile ? '16px' : '24px'};
      margin-bottom: ${isMobile ? '20px' : '32px'};
      align-items: start;
    }

    .two-column {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : '1fr 1fr'};
      gap: ${isMobile ? '12px' : '16px'};
      align-items: start;
    }

    .three-column {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(3, 1fr)'};
      gap: ${isMobile ? '12px' : '16px'};
      align-items: start;
    }

    .four-column {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr 1fr' : 'repeat(4, 1fr)'};
      gap: ${isMobile ? '12px' : '16px'};
      align-items: start;
    }

    .six-column {
      display: grid;
      grid-template-columns: ${isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)'};
      gap: ${isMobile ? '8px' : '12px'};
      align-items: start;
    }

    /* =================== SECTIONS COLLAPSIBLES =================== */
    .collapsible-section {
      background: rgba(31, 41, 59, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      margin-bottom: ${isMobile ? '16px' : '24px'};
      overflow: hidden;
      transition: var(--transition);
    }

    .collapsible-section:hover {
      transform: ${isMobile ? 'none' : 'translateY(-2px)'};
      box-shadow: var(--shadow);
    }

    .section-toggle {
      width: 100%;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: var(--transition);
      touch-action: manipulation;
    }

    .section-toggle:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .section-toggle:active {
      transform: scale(0.98);
    }

    /* =================== FORMULAIRES =================== */
    .form-field {
      margin-bottom: ${isMobile ? '16px' : '20px'};
      display: flex;
      flex-direction: column;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: ${isMobile ? '14px' : '15px'};
      font-weight: 600;
      margin-bottom: 8px;
      min-height: 20px;
    }

    .premium-input,
    .premium-select,
    .premium-textarea {
      width: 100%;
      padding: ${isMobile ? '12px 16px' : '14px 16px'};
      background: rgba(15, 23, 42, 0.8);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: ${isMobile ? '16px' : '15px'};
      font-weight: 500;
      transition: var(--transition);
      backdrop-filter: blur(10px);
      box-sizing: border-box;
      min-height: ${isMobile ? '48px' : '50px'};
      font-family: inherit;
      -webkit-appearance: none;
      appearance: none;
    }

    .premium-input:focus,
    .premium-select:focus,
    .premium-textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: rgba(15, 23, 42, 0.9);
    }

    .premium-input:invalid {
      border-color: var(--danger-color);
    }

    .premium-textarea {
      min-height: ${isMobile ? '100px' : '120px'};
      resize: vertical;
      line-height: 1.5;
    }

    /* =================== BOUTONS =================== */
    .btn-primary,
    .btn-success,
    .btn-danger,
    .btn-warning,
    .btn-secondary,
    .btn-outline {
      padding: ${isMobile ? '12px 16px' : '14px 20px'};
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: ${isMobile ? '48px' : '50px'};
      font-size: ${isMobile ? '14px' : '15px'};
      touch-action: manipulation;
      text-decoration: none;
      user-select: none;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-success {
      background: var(--gradient-success);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-danger {
      background: var(--gradient-danger);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-warning {
      background: var(--gradient-warning);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary {
      background: var(--card-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-outline {
      background: transparent;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
    }

    .btn-primary:hover,
    .btn-success:hover,
    .btn-danger:hover,
    .btn-warning:hover {
      transform: ${isMobile ? 'none' : 'translateY(-2px)'};
      box-shadow: var(--shadow);
    }

    .btn-secondary:hover,
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: ${isMobile ? 'none' : 'translateY(-1px)'};
    }

    .btn-primary:active,
    .btn-success:active,
    .btn-danger:active,
    .btn-warning:active,
    .btn-secondary:active,
    .btn-outline:active {
      transform: scale(0.98);
    }

    .btn-primary:disabled,
    .btn-success:disabled,
    .btn-danger:disabled,
    .btn-warning:disabled,
    .btn-secondary:disabled,
    .btn-outline:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* =================== CARROUSEL PHOTOS =================== */
    .photo-carousel {
      position: relative;
      margin: 20px 0;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: ${isMobile ? '300px' : '400px'};
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
      border-radius: var(--radius-sm);
    }

    .carousel-slide.add-photo {
      background: rgba(59, 130, 246, 0.1);
      border: 2px dashed rgba(59, 130, 246, 0.3);
      cursor: pointer;
      transition: var(--transition);
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
      color: var(--primary-color);
      text-align: center;
    }

    .add-photo-icon {
      width: ${isMobile ? '48px' : '56px'};
      height: ${isMobile ? '48px' : '56px'};
      background: rgba(59, 130, 246, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
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
      width: ${isMobile ? '36px' : '44px'};
      height: ${isMobile ? '36px' : '44px'};
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      z-index: 10;
      touch-action: manipulation;
    }

    .carousel-nav:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: translateY(-50%) scale(1.1);
    }

    .carousel-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .carousel-nav.prev {
      left: ${isMobile ? '12px' : '16px'};
    }

    .carousel-nav.next {
      right: ${isMobile ? '12px' : '16px'};
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
      width: ${isMobile ? '8px' : '10px'};
      height: ${isMobile ? '8px' : '10px'};
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      cursor: pointer;
      transition: var(--transition);
      padding: 0;
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
      padding: ${isMobile ? '15px 12px 12px' : '20px 16px 16px'};
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
      font-size: ${isMobile ? '13px' : '14px'};
      font-weight: 600;
    }

    .photo-caption p {
      margin: 0 0 2px;
      font-size: ${isMobile ? '11px' : '12px'};
      opacity: 0.8;
    }

    .gps-coords,
    .measurements {
      font-size: ${isMobile ? '10px' : '11px'};
      opacity: 0.7;
    }

    .photo-actions {
      display: flex;
      gap: 6px;
    }

    .photo-action-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      min-height: 28px;
      touch-action: manipulation;
    }

    .photo-action-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .photo-action-btn.delete:hover {
      background: rgba(239, 68, 68, 0.8);
      border-color: var(--danger-color);
    }

    .photo-action-btn.edit:hover {
      background: rgba(59, 130, 246, 0.8);
      border-color: var(--primary-color);
    }

    /* =================== PLACEHOLDERS =================== */
    .empty-photo-placeholder {
      border: 2px dashed;
      border-radius: var(--radius);
      padding: ${isMobile ? '30px 20px' : '40px 20px'};
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-height: ${isMobile ? '120px' : '150px'};
      justify-content: center;
    }

    .empty-photo-placeholder:hover {
      transform: ${isMobile ? 'none' : 'translateY(-2px)'};
      box-shadow: var(--shadow-sm);
    }

    .empty-photo-placeholder h4 {
      margin: 0;
      font-size: ${isMobile ? '14px' : '16px'};
      font-weight: 600;
    }

    .empty-photo-placeholder p {
      margin: 0;
      font-size: ${isMobile ? '12px' : '14px'};
      color: var(--text-muted);
    }

    /* =================== BOUTONS CAPTURE PHOTO =================== */
    .photo-capture-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: ${isMobile ? '8px 12px' : '10px 16px'};
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      font-size: ${isMobile ? '12px' : '13px'};
      font-weight: 600;
      min-height: ${isMobile ? '36px' : '40px'};
      touch-action: manipulation;
      border: 1px solid;
    }

    .photo-capture-btn:hover {
      transform: ${isMobile ? 'none' : 'translateY(-1px)'};
      box-shadow: var(--shadow-sm);
    }

    .photo-capture-btn:active {
      transform: scale(0.98);
    }

    /* =================== ANIMATIONS ET TRANSITIONS =================== */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .fade-in {
      animation: fadeIn 0.3s ease;
    }

    .slide-up {
      animation: slideUp 0.3s ease;
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    /* =================== SÉLECTEURS DE TYPES D'ESPACES =================== */
    .space-type-grid {
      display: grid;
      grid-template-columns: ${isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'};
      gap: 12px;
      margin: 16px 0;
    }

    .space-type-card {
      padding: 16px 12px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.8);
    }

    .space-type-card:hover {
      transform: ${isMobile ? 'none' : 'translateY(-2px)'};
      box-shadow: var(--shadow-sm);
    }

    .space-type-card.selected {
      border-color: var(--primary-color);
      background: rgba(59, 130, 246, 0.2);
    }

    .space-type-emoji {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .space-type-label {
      font-size: ${isMobile ? '12px' : '13px'};
      font-weight: 600;
      text-align: center;
      word-wrap: break-word;
      hyphens: auto;
    }

    /* =================== SÉLECTEURS DE DANGERS =================== */
    .hazard-grid {
      display: grid;
      grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))'};
      gap: 12px;
    }

    .hazard-item {
      padding: 12px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(15, 23, 42, 0.8);
    }

    .hazard-item:hover {
      background: rgba(15, 23, 42, 0.9);
    }

    .hazard-item.selected {
      border-color: var(--danger-color);
      background: rgba(239, 68, 68, 0.1);
    }

    .hazard-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      transition: var(--transition);
    }

    .hazard-item.selected .hazard-checkbox {
      border-color: var(--danger-color);
      background: var(--danger-color);
    }

    .hazard-label {
      font-size: ${isMobile ? '13px' : '14px'};
      font-weight: 500;
      line-height: 1.4;
      word-wrap: break-word;
      hyphens: auto;
      flex: 1;
    }

    .hazard-item.selected .hazard-label {
      color: #fecaca;
    }

    /* =================== INDICATEURS DE VALIDATION =================== */
    .validation-indicator {
      border-radius: var(--radius);
      padding: ${isMobile ? '16px' : '20px'};
      margin-bottom: 20px;
      border-left: 4px solid;
    }

    .validation-indicator.valid {
      background: rgba(16, 185, 129, 0.1);
      border-left-color: var(--success-color);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .validation-indicator.invalid {
      background: rgba(239, 68, 68, 0.1);
      border-left-color: var(--danger-color);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .validation-progress {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin: 8px 0;
    }

    .validation-progress-bar {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 3px;
    }

    .validation-errors {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .validation-error {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: ${isMobile ? '12px' : '13px'};
      color: var(--danger-color);
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    /* =================== RESPONSIVE DESIGN =================== */
    @media (max-width: 768px) {
      .premium-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .two-column,
      .three-column,
      .four-column,
      .six-column {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .space-type-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .hazard-grid {
        grid-template-columns: 1fr;
      }
      
      .premium-input,
      .premium-select,
      .premium-textarea {
        font-size: 16px; /* Évite le zoom sur iOS */
      }
    }

    @media (max-width: 480px) {
      .site-information-container {
        padding: 4px;
      }
      
      .collapsible-section {
        margin-bottom: 12px;
      }
      
      .carousel-container {
        height: 250px;
      }
      
      .space-type-grid {
        grid-template-columns: 1fr;
      }
      
      .photo-capture-btn {
        font-size: 11px;
        padding: 6px 10px;
      }
    }

    @media (max-width: 320px) {
      .site-information-container {
        padding: 2px;
      }
      
      .btn-primary,
      .btn-success,
      .btn-danger,
      .btn-warning,
      .btn-secondary {
        padding: 10px 12px;
        font-size: 13px;
      }
    }

    /* =================== AMÉLIORATION ACCESSIBILITÉ =================== */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (prefers-contrast: high) {
      :root {
        --border-color: #ffffff;
        --text-muted: #ffffff;
      }
    }

    /* =================== FOCUS ET ÉTATS =================== */
    .premium-input:focus,
    .premium-select:focus,
    .premium-textarea:focus,
    .btn-primary:focus,
    .btn-success:focus,
    .btn-danger:focus,
    .btn-warning:focus,
    .btn-secondary:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .section-toggle:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    /* =================== UTILITAIRES =================== */
    .full-width {
      grid-column: 1 / -1;
    }

    .text-center {
      text-align: center;
    }

    .text-left {
      text-align: left;
    }

    .text-right {
      text-align: right;
    }

    .hidden {
      display: none;
    }

    .visible {
      display: block;
    }

    .flex {
      display: flex;
    }

    .flex-col {
      flex-direction: column;
    }

    .items-center {
      align-items: center;
    }

    .justify-center {
      justify-content: center;
    }

    .gap-2 {
      gap: 8px;
    }

    .gap-4 {
      gap: 16px;
    }

    .mb-4 {
      margin-bottom: 16px;
    }

    .mt-4 {
      margin-top: 16px;
    }

    .p-4 {
      padding: 16px;
    }

    .rounded {
      border-radius: var(--radius-sm);
    }

    .shadow {
      box-shadow: var(--shadow-sm);
    }

    /* =================== PRINT STYLES =================== */
    @media print {
      .site-information-container {
        background: white;
        color: black;
        padding: 0;
      }
      
      .collapsible-section {
        background: white;
        border: 1px solid #ccc;
        box-shadow: none;
      }
      
      .btn-primary,
      .btn-success,
      .btn-danger,
      .btn-warning {
        background: white !important;
        color: black !important;
        border: 1px solid #ccc !important;
      }
      
      .carousel-nav,
      .carousel-indicators,
      .photo-actions {
        display: none;
      }
    }

    /* =================== DARK MODE SUPPORT =================== */
    @media (prefers-color-scheme: light) {
      :root {
        --dark-bg: #ffffff;
        --card-bg: #f8fafc;
        --border-color: #e2e8f0;
        --text-primary: #1a202c;
        --text-secondary: #4a5568;
        --text-muted: #718096;
      }
    }
  `;

  // =================== FONCTION D'INJECTION CSS SÉCURISÉE ===================
  const injectStyles = useCallback(() => {
    const styleId = 'site-information-styles';
    let existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = mobileOptimizedStyles;
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [mobileOptimizedStyles]);

  // Injecter les styles au montage du composant
  useEffect(() => {
    const cleanup = injectStyles();
    return cleanup;
  }, [injectStyles]);
  // =================== SECTION 8/8 - RENDU JSX COMPLET ET FINAL ===================

  // =================== RENDU JSX PRINCIPAL ===================
  return (
    <div className="site-information-container">
      <style>{mobileOptimizedStyles}</style>
      
      {/* =================== HEADER AVEC VALIDATION =================== */}
      <ValidationIndicator />
      
      {/* =================== SECTION 1: INFORMATIONS DE BASE =================== */}
      <CollapsibleSection
        title={translations.basicInfo}
        icon={<Building size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.basicInfo}
        onToggle={() => toggleSection('basicInfo')}
      >
        <div className="premium-grid">
          <div className="form-field">
            <label className="field-label">
              <Building size={16} />
              {translations.siteName}
            </label>
            <input
              type="text"
              className="premium-input"
              value={formData.basicInfo.siteName}
              onChange={(e) => updateBasicInfo('siteName', e.target.value)}
              placeholder={translations.enterSiteName}
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <MapPin size={16} />
              {translations.location}
            </label>
            <input
              type="text"
              className="premium-input"
              value={formData.basicInfo.location}
              onChange={(e) => updateBasicInfo('location', e.target.value)}
              placeholder={translations.enterLocation}
              maxLength={200}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <User size={16} />
              {translations.inspector}
            </label>
            <input
              type="text"
              className="premium-input"
              value={formData.basicInfo.inspector}
              onChange={(e) => updateBasicInfo('inspector', e.target.value)}
              placeholder={translations.enterInspector}
              maxLength={100}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <Calendar size={16} />
              {translations.inspectionDate}
            </label>
            <input
              type="date"
              className="premium-input"
              value={formData.basicInfo.inspectionDate}
              onChange={(e) => updateBasicInfo('inspectionDate', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <Clock size={16} />
              {translations.inspectionTime}
            </label>
            <input
              type="time"
              className="premium-input"
              value={formData.basicInfo.inspectionTime}
              onChange={(e) => updateBasicInfo('inspectionTime', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <Briefcase size={16} />
              {translations.company}
            </label>
            <input
              type="text"
              className="premium-input"
              value={formData.basicInfo.company}
              onChange={(e) => updateBasicInfo('company', e.target.value)}
              placeholder={translations.enterCompany}
              maxLength={100}
            />
          </div>

          <div className="form-field full-width">
            <label className="field-label">
              <FileText size={16} />
              {translations.description}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.basicInfo.description}
              onChange={(e) => updateBasicInfo('description', e.target.value)}
              placeholder={translations.enterDescription}
              maxLength={500}
              rows={4}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 2: TYPE D'ESPACE =================== */}
      <CollapsibleSection
        title={translations.spaceType}
        icon={<Building size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.spaceType}
        onToggle={() => toggleSection('spaceType')}
      >
        <SpaceTypeSelector />
        
        {formData.spaceType.type === 'other' && (
          <div className="form-field mt-4">
            <label className="field-label">
              {translations.specifyOther}
            </label>
            <input
              type="text"
              className="premium-input"
              value={formData.spaceType.customType}
              onChange={(e) => updateSpaceType('customType', e.target.value)}
              placeholder={translations.enterCustomType}
              maxLength={100}
            />
          </div>
        )}

        <div className="form-field">
          <label className="field-label">
            <FileText size={16} />
            {translations.spaceDescription}
          </label>
          <textarea
            className="premium-textarea"
            value={formData.spaceType.description}
            onChange={(e) => updateSpaceType('description', e.target.value)}
            placeholder={translations.enterSpaceDescription}
            maxLength={300}
            rows={3}
          />
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 3: DIMENSIONS =================== */}
      <CollapsibleSection
        title={translations.dimensions}
        icon={<Settings size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.dimensions}
        onToggle={() => toggleSection('dimensions')}
      >
        <DimensionsSelector />
      </CollapsibleSection>

      {/* =================== SECTION 4: POINTS D'ENTRÉE =================== */}
      <CollapsibleSection
        title={translations.entryPoints}
        icon={<MapPin size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.entryPoints}
        onToggle={() => toggleSection('entryPoints')}
      >
        <div className="mb-4">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              const newEntry = {
                id: Date.now().toString(),
                type: 'hatch',
                location: '',
                dimensions: '',
                description: '',
                accessibility: 'easy'
              };
              setFormData(prev => ({
                ...prev,
                entryPoints: {
                  ...prev.entryPoints,
                  entries: [...prev.entryPoints.entries, newEntry]
                }
              }));
            }}
          >
            <Plus size={16} />
            {translations.addEntryPoint}
          </button>
        </div>

        {formData.entryPoints.entries.map((entry, index) => (
          <div key={entry.id} className="collapsible-section mb-4">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  {translations.entryPoint} {index + 1}
                </h4>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      entryPoints: {
                        ...prev.entryPoints,
                        entries: prev.entryPoints.entries.filter(e => e.id !== entry.id)
                      }
                    }));
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    {translations.entryType}
                  </label>
                  <select
                    className="premium-select"
                    value={entry.type}
                    onChange={(e) => updateEntryPoint(entry.id, 'type', e.target.value)}
                  >
                    <option value="hatch">{translations.hatch}</option>
                    <option value="door">{translations.door}</option>
                    <option value="window">{translations.window}</option>
                    <option value="opening">{translations.opening}</option>
                    <option value="other">{translations.other}</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    {translations.accessibility}
                  </label>
                  <select
                    className="premium-select"
                    value={entry.accessibility}
                    onChange={(e) => updateEntryPoint(entry.id, 'accessibility', e.target.value)}
                  >
                    <option value="easy">{translations.easy}</option>
                    <option value="moderate">{translations.moderate}</option>
                    <option value="difficult">{translations.difficult}</option>
                    <option value="restricted">{translations.restricted}</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    {translations.location}
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    value={entry.location}
                    onChange={(e) => updateEntryPoint(entry.id, 'location', e.target.value)}
                    placeholder={translations.enterLocation}
                    maxLength={100}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    {translations.dimensions}
                  </label>
                  <input
                    type="text"
                    className="premium-input"
                    value={entry.dimensions}
                    onChange={(e) => updateEntryPoint(entry.id, 'dimensions', e.target.value)}
                    placeholder="ex: 60cm x 80cm"
                    maxLength={50}
                  />
                </div>

                <div className="form-field full-width">
                  <label className="field-label">
                    {translations.description}
                  </label>
                  <textarea
                    className="premium-textarea"
                    value={entry.description}
                    onChange={(e) => updateEntryPoint(entry.id, 'description', e.target.value)}
                    placeholder={translations.enterDescription}
                    maxLength={200}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleSection>

      {/* =================== SECTION 5: ÉVALUATION DES DANGERS =================== */}
      <CollapsibleSection
        title={translations.hazardAssessment}
        icon={<AlertTriangle size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.hazardAssessment}
        onToggle={() => toggleSection('hazardAssessment')}
      >
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wind size={18} />
            {translations.atmosphericHazards}
          </h4>
          <div className="hazard-grid">
            {Object.entries(hazardTypes.atmospheric).map(([key, hazard]) => (
              <div
                key={key}
                className={`hazard-item ${formData.hazardAssessment.atmospheric[key] ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard(key)}
              >
                <div className="hazard-checkbox">
                  {formData.hazardAssessment.atmospheric[key] && <Check size={14} />}
                </div>
                <div className="hazard-label">{hazard}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench size={18} />
            {translations.physicalHazards}
          </h4>
          <div className="hazard-grid">
            {Object.entries(hazardTypes.physical).map(([key, hazard]) => (
              <div
                key={key}
                className={`hazard-item ${formData.hazardAssessment.physical[key] ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard(key)}
              >
                <div className="hazard-checkbox">
                  {formData.hazardAssessment.physical[key] && <Check size={14} />}
                </div>
                <div className="hazard-label">{hazard}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">
            <FileText size={16} />
            {translations.additionalNotes}
          </label>
          <textarea
            className="premium-textarea"
            value={formData.hazardAssessment.notes}
            onChange={(e) => updateHazardAssessment('notes', e.target.value)}
            placeholder={translations.enterAdditionalNotes}
            maxLength={500}
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 6: CONDITIONS ENVIRONNEMENTALES =================== */}
      <CollapsibleSection
        title={translations.environmentalConditions}
        icon={<Droplets size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.environmentalConditions}
        onToggle={() => toggleSection('environmentalConditions')}
      >
        <div className="four-column">
          <div className="form-field">
            <label className="field-label">
              <Droplets size={16} />
              {translations.humidity} (%)
            </label>
            <input
              type="number"
              className="premium-input"
              value={formData.environmentalConditions.humidity}
              onChange={(e) => updateEnvironmentalConditions('humidity', e.target.value)}
              placeholder="0-100"
              min="0"
              max="100"
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <Wind size={16} />
              {translations.temperature} (°C)
            </label>
            <input
              type="number"
              className="premium-input"
              value={formData.environmentalConditions.temperature}
              onChange={(e) => updateEnvironmentalConditions('temperature', e.target.value)}
              placeholder="-50 à 60"
              min="-50"
              max="60"
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              <Eye size={16} />
              {translations.visibility}
            </label>
            <select
              className="premium-select"
              value={formData.environmentalConditions.visibility}
              onChange={(e) => updateEnvironmentalConditions('visibility', e.target.value)}
            >
              <option value="excellent">{translations.excellent}</option>
              <option value="good">{translations.good}</option>
              <option value="moderate">{translations.moderate}</option>
              <option value="poor">{translations.poor}</option>
              <option value="very-poor">{translations.veryPoor}</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">
              <Wind size={16} />
              {translations.airflow}
            </label>
            <select
              className="premium-select"
              value={formData.environmentalConditions.airflow}
              onChange={(e) => updateEnvironmentalConditions('airflow', e.target.value)}
            >
              <option value="none">{translations.none}</option>
              <option value="natural">{translations.natural}</option>
              <option value="forced">{translations.forced}</option>
              <option value="mechanical">{translations.mechanical}</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">
            <FileText size={16} />
            {translations.environmentalNotes}
          </label>
          <textarea
            className="premium-textarea"
            value={formData.environmentalConditions.notes}
            onChange={(e) => updateEnvironmentalConditions('notes', e.target.value)}
            placeholder={translations.enterEnvironmentalNotes}
            maxLength={300}
            rows={3}
          />
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 7: CONTENU DE L'ESPACE =================== */}
      <CollapsibleSection
        title={translations.spaceContent}
        icon={<Settings size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.spaceContent}
        onToggle={() => toggleSection('spaceContent')}
      >
        <div className="two-column">
          <div className="form-field">
            <label className="field-label">
              {translations.equipment}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.spaceContent.equipment}
              onChange={(e) => updateSpaceContent('equipment', e.target.value)}
              placeholder={translations.enterEquipment}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.materials}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.spaceContent.materials}
              onChange={(e) => updateSpaceContent('materials', e.target.value)}
              placeholder={translations.enterMaterials}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.chemicals}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.spaceContent.chemicals}
              onChange={(e) => updateSpaceContent('chemicals', e.target.value)}
              placeholder={translations.enterChemicals}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.otherContents}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.spaceContent.other}
              onChange={(e) => updateSpaceContent('other', e.target.value)}
              placeholder={translations.enterOtherContents}
              maxLength={300}
              rows={3}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 8: MESURES DE SÉCURITÉ =================== */}
      <CollapsibleSection
        title={translations.safetyMeasures}
        icon={<Wrench size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.safetyMeasures}
        onToggle={() => toggleSection('safetyMeasures')}
      >
        <div className="two-column">
          <div className="form-field">
            <label className="field-label">
              {translations.requiredPPE}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.safetyMeasures.requiredPPE}
              onChange={(e) => updateSafetyMeasures('requiredPPE', e.target.value)}
              placeholder={translations.enterRequiredPPE}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.ventilationRequirements}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.safetyMeasures.ventilation}
              onChange={(e) => updateSafetyMeasures('ventilation', e.target.value)}
              placeholder={translations.enterVentilationRequirements}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.monitoringEquipment}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.safetyMeasures.monitoring}
              onChange={(e) => updateSafetyMeasures('monitoring', e.target.value)}
              placeholder={translations.enterMonitoringEquipment}
              maxLength={300}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              {translations.emergencyProcedures}
            </label>
            <textarea
              className="premium-textarea"
              value={formData.safetyMeasures.emergency}
              onChange={(e) => updateSafetyMeasures('emergency', e.target.value)}
              placeholder={translations.enterEmergencyProcedures}
              maxLength={300}
              rows={3}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 9: DOCUMENTATION PHOTOGRAPHIQUE =================== */}
      <CollapsibleSection
        title={translations.photographicDocumentation}
        icon={<Camera size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.photographicDocumentation}
        onToggle={() => toggleSection('photographicDocumentation')}
      >
        <PhotoCarousel />
      </CollapsibleSection>

      {/* =================== SECTION 10: CLASSIFICATION CSA =================== */}
      <CollapsibleSection
        title={translations.csaClassification}
        icon={<Settings size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.csaClassification}
        onToggle={() => toggleSection('csaClassification')}
      >
        <CSAClassificationSelector />
        
        <div className="form-field mt-4">
          <label className="field-label">
            {translations.justification}
          </label>
          <textarea
            className="premium-textarea"
            value={formData.csaClassification.justification}
            onChange={(e) => updateCSAClassification('justification', e.target.value)}
            placeholder={translations.enterJustification}
            maxLength={500}
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* =================== SECTION 11: CODES QR =================== */}
      <CollapsibleSection
        title={translations.qrCodes}
        icon={<Settings size={isMobile ? 18 : 20} />}
        isOpen={expandedSections.qrCodes}
        onToggle={() => toggleSection('qrCodes')}
      >
        <QRCodeSection />
      </CollapsibleSection>

      {/* =================== ACTIONS RAPIDES =================== */}
      <QuickActions />

      {/* =================== BOUTONS DE SAUVEGARDE =================== */}
      <div className="flex gap-4 justify-center mt-8 mb-4">
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="spinner" />
              {translations.saving}
            </>
          ) : (
            <>
              <Check size={16} />
              {translations.saveInformation}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleGenerateReport}
          disabled={isSaving}
        >
          <FileText size={16} />
          {translations.generateReport}
        </button>

        <button
          type="button"
          className="btn-warning"
          onClick={() => setShowDatabaseModal(true)}
        >
          <Settings size={16} />
          {translations.database}
        </button>
      </div>

      {/* =================== MODAUX =================== */}
      {showDatabaseModal && (
        <DatabaseModal />
      )}

      {showPhotoModal && selectedPhotoForEdit && (
        <PhotoEditModal />
      )}

      {showQuestionnaire && (
        <CSAQuestionnaireModal />
      )}

      {/* =================== NOTIFICATIONS =================== */}
      {notification && (
        <div className={`validation-indicator ${notification.type === 'success' ? 'valid' : 'invalid'} fade-in`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
