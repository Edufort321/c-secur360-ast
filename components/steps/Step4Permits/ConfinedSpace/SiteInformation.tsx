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

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';

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

  // Dimensions
  dimensions: {
    length: number;
    width: number;
    height: number;
    diameter: number;
    volume: number;
  };

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

// =================== TRADUCTIONS COMPLÈTES ===================
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
    length: "Longueur (m)",
    width: "Largeur (m)", 
    height: "Hauteur (m)",
    diameter: "Diamètre (m)",
    volume: "Volume calculé",
    volumeUnit: "m³",
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
    length: "Length (m)",
    width: "Width (m)",
    height: "Height (m)",
    diameter: "Diameter (m)",
    volume: "Calculated volume",
    volumeUnit: "m³",
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

// =================== COMPOSANT PRINCIPAL ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  permitData,
  updatePermitData,
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language,
  updateParentData
}) => {

  // =================== ÉTATS LOCAUX ===================
  const [confinedSpaceDetails, setConfinedSpaceDetails] = useState<ConfinedSpaceDetails>({
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

    // Dimensions
    dimensions: {
      length: permitData.dimensions?.length || 0,
      width: permitData.dimensions?.width || 0,
      height: permitData.dimensions?.height || 0,
      diameter: permitData.dimensions?.diameter || 0,
      volume: permitData.dimensions?.volume || 0,
    },

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
  });

  // États pour l'interface utilisateur
  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>(permitData.spacePhotos || []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPermitDatabase, setShowPermitDatabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showClassificationWizard, setShowClassificationWizard] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PermitSearchResult>({
    permits: [],
    total: 0,
    page: 1,
    hasMore: false
  });

  // Réfs
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Traductions
  const t = translations[language];
  // =================== CLASSIFICATIONS CSA PAR PROVINCE CANADIENNE ===================
  const getCSAClassifications = (province: ProvinceCode, language: Language) => {
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

    // Réglementations spécifiques par province
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

    // Intégrer les réglementations provinciales avec typage correct
    Object.keys(classifications).forEach(classKey => {
      // ✅ CORRECTION TYPESCRIPT : Cast explicite et accès sécurisé aux propriétés
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
  };

  // =================== QUESTIONNAIRE DE CLASSIFICATION INTELLIGENTE ===================
  const getClassificationQuestions = (language: Language) => {
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
  };

  // =================== SYSTÈME DE CLASSIFICATION AUTOMATIQUE ===================
  const calculateCSAClass = (answers: Record<string, any>) => {
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
  };

  // =================== FONCTIONS DE BASE DE DONNÉES SUPABASE (IMPORTS CORRIGÉS) ===================
  const searchPermitsDatabase = async (query: string, page: number = 1): Promise<PermitSearchResult> => {
    setIsSearching(true);
    try {
      // ✅ IMPORT SUPABASE CORRIGÉ : 4 niveaux vers le haut depuis components/steps/Step4Permits/ConfinedSpace/SiteInformation.tsx
      const { supabase } = await import('../../../../lib/supabase');
      
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
          atmospheric_hazards,
          physical_hazards,
          dimensions,
          entry_points,
          environmental_conditions,
          space_content,
          safety_measures,
          space_photos,
          province,
          authority
        `)
        .order('created_at', { ascending: false });

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`
          permit_number.ilike.%${query}%,
          project_number.ilike.%${query}%,
          work_location.ilike.%${query}%,
          contractor.ilike.%${query}%,
          supervisor.ilike.%${query}%
        `);
      }

      // Filtrer par province si nécessaire
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
  };

  // =================== SAUVEGARDE COMPLÈTE DANS SUPABASE ===================
  const savePermitToDatabase = async (): Promise<string | null> => {
    setIsSaving(true);
    try {
      // ✅ IMPORT SUPABASE CORRIGÉ : 4 niveaux vers le haut
      const { supabase } = await import('../../../../lib/supabase');
      
      const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Générer le QR Code avec toutes les informations
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
        dimensions: confinedSpaceDetails.dimensions,
        entry_points: confinedSpaceDetails.entryPoints,
        atmospheric_hazards: confinedSpaceDetails.atmosphericHazards,
        physical_hazards: confinedSpaceDetails.physicalHazards,
        environmental_conditions: confinedSpaceDetails.environmentalConditions,
        space_content: confinedSpaceDetails.spaceContent,
        safety_measures: confinedSpaceDetails.safetyMeasures,
        space_photos: spacePhotos,
        status: 'active',
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince].authority,
        qr_code: qrCodeDataUrl,
        entry_count: 0,
        hazard_count: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString()
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

      updatePermitData({ permit_number: permitNumber });
      
      // Notification de succès avec détails
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`✅ ${t.saveSuccess}`, {
            body: `${t.projectNumber}: ${permitToSave.project_number}\n${t.workLocation}: ${permitToSave.work_location}`,
            icon: '/c-secur360-logo.png'
          });
        }
      }
      
      return permitNumber;
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`❌ ${t.saveError}`, {
            body: error instanceof Error ? error.message : 'Erreur inconnue',
            icon: '/c-secur360-logo.png'
          });
        }
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // =================== GÉNÉRATION QR CODE AVEC LOGO ===================
  const generatePermitQRCode = async (permitNumber: string): Promise<string> => {
    try {
      // ✅ IMPORT QR CODE CORRIGÉ : 4 niveaux vers le haut vers app/utils/generateQRCode.ts
      const { generateQRCode } = await import('../../../../app/utils/generateQRCode');
      
      const permitUrl = `${window.location.origin}/permits/confined-space/${permitNumber}`;
      
      const qrData = {
        permitNumber,
        type: 'confined_space',
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince].authority,
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
      
      return await generateQRCode(JSON.stringify(qrData));
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      return '';
    }
  };

  // =================== CHARGEMENT D'UN PERMIS EXISTANT ===================
  const loadPermitFromHistory = async (permitNumber: string) => {
    try {
      // ✅ IMPORT SUPABASE CORRIGÉ : 4 niveaux vers le haut
      const { supabase } = await import('../../../../lib/supabase');
      
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
            length: 0, width: 0, height: 0, diameter: 0, volume: 0
          },
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

        setConfinedSpaceDetails(loadedPermit);
        setSpacePhotos(data.space_photos || []);
        
        updatePermitData({
          permit_number: data.permit_number,
          ...loadedPermit
        });

        // Notification de succès
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`✅ Permis ${permitNumber} chargé`, {
              body: `${loadedPermit.projectNumber} - ${loadedPermit.workLocation}`,
              icon: '/c-secur360-logo.png'
            });
          }
        }
      }
      
      setShowPermitDatabase(false);
      
    } catch (error) {
      console.error('Erreur chargement permis:', error);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`❌ Erreur chargement`, {
            body: `Impossible de charger le permis ${permitNumber}`,
            icon: '/c-secur360-logo.png'
          });
        }
      }
    }
  };
// =================== DÉFINITIONS D'AUTORITÉS PROVINCIALES ===================
  const getProvinceAuthority = (province: ProvinceCode): string => {
    const authorities: Record<ProvinceCode, string> = {
      QC: 'CNESST',
      ON: 'Ministry of Labour',
      BC: 'WorkSafeBC',
      AB: 'Alberta OHS',
      SK: 'Saskatchewan OHS',
      MB: 'Manitoba Workplace Safety',
      NB: 'WorkSafeNB',
      NS: 'Workers\' Compensation Board',
      PE: 'PEI Workers Compensation Board',
      NL: 'WorkplaceNL'
    };
    return authorities[province] || 'Autorité Compétente';
  };

  // =================== GÉNÉRATION DE RAPPORT PROFESSIONNEL COMPLET ===================
  const generateCompletePermitReport = async (): Promise<PermitReport> => {
    const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Obtenir les classifications CSA provinciales
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
    
    // ✅ CORRECTION : Obtenir l'autorité de manière sécurisée
    const provinceAuthority = currentClassification?.regulations?.authority || getProvinceAuthority(selectedProvince);
    
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
        qrCode: await generatePermitQRCode(permitNumber),
        classification: currentClassification
      },
      siteInformation: {
        ...confinedSpaceDetails,
        spacePhotos: spacePhotos,
        csaClassification: currentClassification,
        provincialRegulations: currentClassification?.regulations
      },
      atmosphericTesting: permitData.atmosphericTesting || {},
      entryRegistry: permitData.entryRegistry || {},
      rescuePlan: permitData.rescuePlan || {},
      validationChecklist: generateValidationChecklist()
    };
  };

  // =================== IMPRESSION LÉGALE PROFESSIONNELLE ===================
  const handlePrintPermit = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const csaClassifications = getCSAClassifications(selectedProvince, language);
      const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
      
      // Création d'une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${language}">
            <head>
              <title>Permis d'Espace Clos - ${report.metadata.permitNumber}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                /* =================== STYLES PROFESSIONNELS LÉGAUX =================== */
                @page {
                  size: A4;
                  margin: 15mm;
                  @top-left { content: "C-SECUR360 - Permis d'Espace Clos"; }
                  @top-right { content: "Page " counter(page) " de " counter(pages); }
                  @bottom-center { content: "Document officiel - ${new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}"; }
                }
                
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: 'Arial', 'Helvetica', sans-serif;
                  font-size: 11pt;
                  line-height: 1.4;
                  color: #000;
                  background: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                /* Header officiel avec logo */
                .legal-header {
                  border-bottom: 4px solid #dc2626;
                  padding-bottom: 20px;
                  margin-bottom: 25px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .logo-section {
                  display: flex;
                  align-items: center;
                  gap: 15px;
                }
                
                .company-logo {
                  width: 80px;
                  height: 80px;
                  background: url('/c-secur360-logo.png') no-repeat center;
                  background-size: contain;
                  border: 2px solid #dc2626;
                  border-radius: 8px;
                  padding: 5px;
                }
                
                .header-info h1 {
                  color: #dc2626;
                  font-size: 24pt;
                  font-weight: 700;
                  margin-bottom: 5px;
                  text-transform: uppercase;
                }
                
                .header-info .subtitle {
                  color: #374151;
                  font-size: 14pt;
                  font-weight: 600;
                }
                
                .permit-badge {
                  background: linear-gradient(135deg, #dc2626, #b91c1c);
                  color: white;
                  padding: 15px 20px;
                  border-radius: 8px;
                  text-align: center;
                  min-width: 200px;
                  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                }
                
                .permit-number {
                  font-size: 16pt;
                  font-weight: 700;
                  margin-bottom: 5px;
                }
                
                .permit-status {
                  font-size: 10pt;
                  opacity: 0.9;
                }
                
                /* Classification CSA avec couleurs */
                .csa-classification {
                  background: ${confinedSpaceDetails.csaClass === 'class1' ? '#fef2f2' : 
                               confinedSpaceDetails.csaClass === 'class2' ? '#fef3c7' : '#f0fdf4'};
                  border: 2px solid ${confinedSpaceDetails.csaClass === 'class1' ? '#dc2626' : 
                                     confinedSpaceDetails.csaClass === 'class2' ? '#d97706' : '#059669'};
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
                  page-break-inside: avoid;
                }
                
                .csa-title {
                  color: ${confinedSpaceDetails.csaClass === 'class1' ? '#dc2626' : 
                           confinedSpaceDetails.csaClass === 'class2' ? '#d97706' : '#059669'};
                  font-size: 16pt;
                  font-weight: 700;
                  margin-bottom: 10px;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                
                .csa-icon {
                  width: 24px;
                  height: 24px;
                  background: ${confinedSpaceDetails.csaClass === 'class1' ? '#dc2626' : 
                               confinedSpaceDetails.csaClass === 'class2' ? '#d97706' : '#059669'};
                  border-radius: 50%;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                }
                
                /* Sections du document */
                .section {
                  margin-bottom: 25px;
                  page-break-inside: avoid;
                  border: 1px solid #e5e7eb;
                  border-radius: 6px;
                  overflow: hidden;
                }
                
                .section-header {
                  background: linear-gradient(135deg, #1f2937, #374151);
                  color: white;
                  padding: 12px 16px;
                  font-size: 14pt;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                
                .section-content {
                  padding: 16px;
                  background: white;
                }
                
                /* Grilles d'informations */
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 15px;
                }
                
                .info-item {
                  border: 1px solid #d1d5db;
                  border-radius: 4px;
                  padding: 10px;
                  background: #f9fafb;
                }
                
                .info-label {
                  font-weight: 600;
                  color: #374151;
                  font-size: 9pt;
                  margin-bottom: 3px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                
                .info-value {
                  color: #111827;
                  font-size: 11pt;
                  word-wrap: break-word;
                }
                
                /* Dangers identifiés */
                .hazards-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin: 15px 0;
                }
                
                .hazard-category {
                  border: 1px solid #fecaca;
                  border-radius: 6px;
                  overflow: hidden;
                }
                
                .hazard-header {
                  background: #fef2f2;
                  color: #dc2626;
                  padding: 8px 12px;
                  font-weight: 600;
                  font-size: 12pt;
                }
                
                .hazard-list {
                  padding: 12px;
                  background: white;
                }
                
                .hazard-item {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 6px 0;
                  border-bottom: 1px solid #f3f4f6;
                  font-size: 10pt;
                }
                
                .hazard-item:last-child {
                  border-bottom: none;
                }
                
                .hazard-icon {
                  width: 16px;
                  height: 16px;
                  background: #dc2626;
                  border-radius: 50%;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8pt;
                  font-weight: bold;
                }
                
                /* QR Code et signatures */
                .qr-signature-section {
                  display: grid;
                  grid-template-columns: 200px 1fr;
                  gap: 20px;
                  margin-top: 30px;
                  page-break-inside: avoid;
                  border: 2px solid #3b82f6;
                  border-radius: 8px;
                  padding: 20px;
                  background: #f0f9ff;
                }
                
                .qr-container {
                  text-align: center;
                }
                
                .qr-code {
                  width: 150px;
                  height: 150px;
                  border: 2px solid #3b82f6;
                  border-radius: 8px;
                  background: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 10px;
                  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zM3 15h6v6H3v-6zm2 2v2h2v-2H5zM15 3h6v6h-6V3zm2 2v2h2V5h-2z"/></svg>');
                  background-size: 60px;
                  background-repeat: no-repeat;
                  background-position: center;
                }
                
                .qr-info {
                  font-size: 9pt;
                  color: #1e40af;
                  font-weight: 600;
                }
                
                .signatures-area {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                }
                
                .signature-box {
                  border: 1px solid #d1d5db;
                  border-radius: 4px;
                  padding: 15px;
                  background: white;
                  min-height: 80px;
                }
                
                .signature-label {
                  font-weight: 600;
                  color: #374151;
                  font-size: 10pt;
                  margin-bottom: 40px;
                }
                
                .signature-line {
                  border-bottom: 1px solid #374151;
                  width: 100%;
                  margin-bottom: 5px;
                }
                
                .signature-date {
                  font-size: 8pt;
                  color: #6b7280;
                }
                
                /* Réglementations provinciales */
                .regulations-box {
                  background: #f8fafc;
                  border: 1px solid #cbd5e1;
                  border-radius: 6px;
                  padding: 15px;
                  margin: 15px 0;
                  page-break-inside: avoid;
                }
                
                .regulations-title {
                  font-weight: 700;
                  color: #1e293b;
                  margin-bottom: 10px;
                  font-size: 12pt;
                }
                
                .regulation-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 6px 0;
                  border-bottom: 1px solid #e2e8f0;
                  font-size: 10pt;
                }
                
                .regulation-item:last-child {
                  border-bottom: none;
                }
                
                /* Footer légal */
                .legal-footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #e5e7eb;
                  text-align: center;
                  page-break-inside: avoid;
                }
                
                .footer-warning {
                  background: #fef3c7;
                  border: 1px solid #f59e0b;
                  border-radius: 6px;
                  padding: 15px;
                  margin-bottom: 15px;
                  color: #92400e;
                  font-weight: 600;
                  font-size: 11pt;
                }
                
                .footer-info {
                  color: #6b7280;
                  font-size: 9pt;
                  line-height: 1.4;
                }
                
                /* Responsive pour impression */
                @media print {
                  body { margin: 0; font-size: 10pt; }
                  .section { page-break-inside: avoid; }
                  .qr-signature-section { page-break-inside: avoid; }
                  .legal-footer { page-break-inside: avoid; }
                  .csa-classification { page-break-inside: avoid; }
                }
                
                /* Couleurs de danger */
                .danger-critical { color: #dc2626; font-weight: 700; }
                .danger-high { color: #d97706; font-weight: 600; }
                .danger-medium { color: #059669; font-weight: 500; }
              </style>
            </head>
            <body>
              <!-- Header officiel avec logo -->
              <div class="legal-header">
                <div class="logo-section">
                  <div class="company-logo"></div>
                  <div class="header-info">
                    <h1>🚨 ${language === 'fr' ? 'Permis d\'Entrée en Espace Clos' : 'Confined Space Entry Permit'}</h1>
                    <div class="subtitle">${language === 'fr' ? 'Document Officiel - Conformité Réglementaire' : 'Official Document - Regulatory Compliance'}</div>
                  </div>
                </div>
                <div class="permit-badge">
                  <div class="permit-number">${report.metadata.permitNumber}</div>
                  <div class="permit-status">${language === 'fr' ? 'ACTIF' : 'ACTIVE'}</div>
                </div>
              </div>

              <!-- Classification CSA avec références provinciales -->
              <div class="csa-classification">
                <div class="csa-title">
                  <span class="csa-icon">${confinedSpaceDetails.csaClass === 'class1' ? '1' : confinedSpaceDetails.csaClass === 'class2' ? '2' : '3'}</span>
                  ${currentClassification?.title || 'Classification non définie'}
                </div>
                <p style="margin-bottom: 10px;"><strong>${language === 'fr' ? 'Description' : 'Description'}:</strong> ${currentClassification?.description || ''}</p>
                
                <div class="regulations-box">
                  <div class="regulations-title">📋 ${language === 'fr' ? 'Réglementations Provinciales' : 'Provincial Regulations'} - ${selectedProvince}</div>
                  <div class="regulation-item">
                    <span><strong>${language === 'fr' ? 'Autorité' : 'Authority'}:</strong></span>
                    <span>${currentClassification?.regulations?.authority || getProvinceAuthority(selectedProvince)}</span>
                  </div>
                  <div class="regulation-item">
                    <span><strong>${language === 'fr' ? 'Règlement principal' : 'Main Regulation'}:</strong></span>
                    <span>${currentClassification?.regulations?.main || 'Réglementation applicable'}</span>
                  </div>
                  <div class="regulation-item">
                    <span><strong>${language === 'fr' ? 'Article spécifique' : 'Specific Article'}:</strong></span>
                    <span>${currentClassification?.regulations?.specific || 'Articles applicables'}</span>
                  </div>
                  <div class="regulation-item">
                    <span><strong>${language === 'fr' ? 'Surveillance requise' : 'Monitoring Required'}:</strong></span>
                    <span>${currentClassification?.monitoring || currentClassification?.regulations?.testing || 'Selon classification'}</span>
                  </div>
                </div>
              </div>

              <!-- Informations du projet -->
              <div class="section">
                <div class="section-header">
                  🏢 ${language === 'fr' ? 'Informations du Projet' : 'Project Information'}
                </div>
                <div class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Province/Autorité' : 'Province/Authority'}</div>
                      <div class="info-value">${selectedProvince} - ${report.metadata.authority}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Date d\'émission' : 'Issue Date'}</div>
                      <div class="info-value">${new Date(report.metadata.issueDate).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Numéro de projet' : 'Project Number'}</div>
                      <div class="info-value">${report.siteInformation.projectNumber || (language === 'fr' ? 'Non spécifié' : 'Not specified')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Lieu des travaux' : 'Work Location'}</div>
                      <div class="info-value">${report.siteInformation.workLocation || (language === 'fr' ? 'Non spécifié' : 'Not specified')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Entrepreneur' : 'Contractor'}</div>
                      <div class="info-value">${report.siteInformation.contractor || (language === 'fr' ? 'Non spécifié' : 'Not specified')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Superviseur' : 'Supervisor'}</div>
                      <div class="info-value">${report.siteInformation.supervisor || (language === 'fr' ? 'Non spécifié' : 'Not specified')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Identification de l'espace -->
              <div class="section">
                <div class="section-header">
                  🏗️ ${language === 'fr' ? 'Identification de l\'Espace Clos' : 'Confined Space Identification'}
                </div>
                <div class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Type d\'espace' : 'Space Type'}</div>
                      <div class="info-value">${report.siteInformation.spaceType ? (language === 'fr' ? (t.spaceTypes[report.siteInformation.spaceType as keyof typeof t.spaceTypes] || report.siteInformation.spaceType) : report.siteInformation.spaceType) : (language === 'fr' ? 'Non spécifié' : 'Not specified')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Dimensions' : 'Dimensions'}</div>
                      <div class="info-value">L: ${report.siteInformation.dimensions?.length || 0}m × l: ${report.siteInformation.dimensions?.width || 0}m × H: ${report.siteInformation.dimensions?.height || 0}m</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Volume calculé' : 'Calculated Volume'}</div>
                      <div class="info-value">${report.siteInformation.dimensions?.volume || 0} m³</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">${language === 'fr' ? 'Nombre de travailleurs' : 'Number of Workers'}</div>
                      <div class="info-value">${report.siteInformation.workerCount || 1}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dangers identifiés -->
              ${(report.siteInformation.atmosphericHazards && report.siteInformation.atmosphericHazards.length > 0) || (report.siteInformation.physicalHazards && report.siteInformation.physicalHazards.length > 0) ? `
                <div class="section">
                  <div class="section-header">
                    ⚠️ ${language === 'fr' ? 'Dangers Identifiés' : 'Identified Hazards'} (${(report.siteInformation.atmosphericHazards?.length || 0) + (report.siteInformation.physicalHazards?.length || 0)})
                  </div>
                  <div class="section-content">
                    <div class="hazards-grid">
                      ${report.siteInformation.atmosphericHazards && report.siteInformation.atmosphericHazards.length > 0 ? `
                        <div class="hazard-category">
                          <div class="hazard-header">🌪️ ${language === 'fr' ? 'Dangers Atmosphériques' : 'Atmospheric Hazards'}</div>
                          <div class="hazard-list">
                            ${report.siteInformation.atmosphericHazards.map((hazard: string) => `
                              <div class="hazard-item">
                                <div class="hazard-icon">⚠</div>
                                <span>${language === 'fr' ? (t.atmosphericHazardTypes?.[hazard as keyof typeof t.atmosphericHazardTypes] || hazard) : hazard.replace(/_/g, ' ')}</span>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                      ${report.siteInformation.physicalHazards && report.siteInformation.physicalHazards.length > 0 ? `
                        <div class="hazard-category">
                          <div class="hazard-header">⚡ ${language === 'fr' ? 'Dangers Physiques' : 'Physical Hazards'}</div>
                          <div class="hazard-list">
                            ${report.siteInformation.physicalHazards.map((hazard: string) => `
                              <div class="hazard-item">
                                <div class="hazard-icon">!</div>
                                <span>${language === 'fr' ? (t.physicalHazardTypes?.[hazard as keyof typeof t.physicalHazardTypes] || hazard) : hazard.replace(/_/g, ' ')}</span>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- QR Code et signatures -->
              <div class="qr-signature-section">
                <div class="qr-container">
                  <div class="qr-code"></div>
                  <div class="qr-info">
                    ${language === 'fr' ? 'Scanner pour accès numérique' : 'Scan for digital access'}
                    <br><strong>${report.metadata.permitNumber}</strong>
                  </div>
                </div>
                <div class="signatures-area">
                  <div class="signature-box">
                    <div class="signature-label">${language === 'fr' ? 'Superviseur / Personne Compétente' : 'Supervisor / Competent Person'}</div>
                    <div class="signature-line"></div>
                    <div class="signature-date">${language === 'fr' ? 'Nom et signature' : 'Name and signature'}</div>
                  </div>
                  <div class="signature-box">
                    <div class="signature-label">${language === 'fr' ? 'Surveillant d\'Espace Clos' : 'Confined Space Attendant'}</div>
                    <div class="signature-line"></div>
                    <div class="signature-date">${language === 'fr' ? 'Nom et signature' : 'Name and signature'}</div>
                  </div>
                </div>
              </div>

              <!-- Footer légal -->
              <div class="legal-footer">
                <div class="footer-warning">
                  ⚠️ ${language === 'fr' ? 'AVERTISSEMENT LÉGAL' : 'LEGAL WARNING'}: ${language === 'fr' ? 'Ce permis n\'est valide qu\'après validation complète de tous les éléments de sécurité et tests atmosphériques requis selon' : 'This permit is only valid after complete validation of all safety elements and atmospheric testing required by'} ${currentClassification?.regulations?.main || 'les réglementations applicables'}.
                </div>
                <div class="footer-info">
                  <strong>C-SECUR360</strong> - ${language === 'fr' ? 'Système de Gestion de Sécurité Industrielle' : 'Industrial Safety Management System'}
                  <br>${language === 'fr' ? 'Document généré automatiquement le' : 'Document automatically generated on'} ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                  <br>${language === 'fr' ? 'Conformité réglementaire' : 'Regulatory compliance'}: ${selectedProvince} - ${report.metadata.authority}
                  <br>${language === 'fr' ? 'Ce document doit être conservé selon les exigences réglementaires provinciales' : 'This document must be retained according to provincial regulatory requirements'}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Attendre que le contenu soit chargé avant d'imprimer
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // =================== ENVOI EMAIL PROFESSIONNEL ===================
  const handleEmailPermit = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const csaClassifications = getCSAClassifications(selectedProvince, language);
      const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
      
      const subject = `${language === 'fr' ? 'Permis d\'Espace Clos' : 'Confined Space Permit'} - ${report.metadata.permitNumber}`;
      const body = `${language === 'fr' ? 'Bonjour' : 'Hello'},

${language === 'fr' ? 'Veuillez trouver ci-joint le permis d\'entrée en espace clos suivant' : 'Please find attached the following confined space entry permit'}:

📋 ${language === 'fr' ? 'DÉTAILS DU PERMIS' : 'PERMIT DETAILS'}
• ${language === 'fr' ? 'Numéro' : 'Number'}: ${report.metadata.permitNumber}
• ${language === 'fr' ? 'Province/Autorité' : 'Province/Authority'}: ${selectedProvince} - ${report.metadata.authority}
• ${language === 'fr' ? 'Classification CSA' : 'CSA Classification'}: ${currentClassification?.title || 'Non définie'}
• ${language === 'fr' ? 'Projet' : 'Project'}: ${report.siteInformation.projectNumber || (language === 'fr' ? 'Non spécifié' : 'Not specified')}
• ${language === 'fr' ? 'Lieu' : 'Location'}: ${report.siteInformation.workLocation || (language === 'fr' ? 'Non spécifié' : 'Not specified')}
• ${language === 'fr' ? 'Date d\'émission' : 'Issue Date'}: ${new Date(report.metadata.issueDate).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
• ${language === 'fr' ? 'Type d\'espace' : 'Space Type'}: ${report.siteInformation.spaceType || (language === 'fr' ? 'Non spécifié' : 'Not specified')}
• ${language === 'fr' ? 'Dangers identifiés' : 'Identified Hazards'}: ${(report.siteInformation.atmosphericHazards?.length || 0) + (report.siteInformation.physicalHazards?.length || 0)}

🏛️ ${language === 'fr' ? 'CONFORMITÉ RÉGLEMENTAIRE' : 'REGULATORY COMPLIANCE'}
• ${language === 'fr' ? 'Règlement principal' : 'Main Regulation'}: ${currentClassification?.regulations?.main || 'Réglementation applicable'}
• ${language === 'fr' ? 'Article spécifique' : 'Specific Article'}: ${currentClassification?.regulations?.specific || 'Articles applicables'}
• ${language === 'fr' ? 'Surveillance requise' : 'Monitoring Required'}: ${currentClassification?.regulations?.testing || 'Selon classification'}

⚠️ ${language === 'fr' ? 'IMPORTANT' : 'IMPORTANT'}: ${language === 'fr' ? 'Ce document doit être affiché sur le site et tous les travailleurs doivent en prendre connaissance avant l\'entrée. La validation de tous les éléments de sécurité est obligatoire selon' : 'This document must be displayed on site and all workers must acknowledge it before entry. Validation of all safety elements is mandatory according to'} ${currentClassification?.regulations?.main || (language === 'fr' ? 'les réglementations applicables' : 'applicable regulations')}.

${language === 'fr' ? 'Cordialement' : 'Best regards'},
C-SECUR360 - ${language === 'fr' ? 'Système de Gestion de Sécurité' : 'Safety Management System'}`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // =================== PARTAGE OPTIMISÉ MOBILE ===================
  const handleSharePermit = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const shareData = {
        title: `${language === 'fr' ? 'Permis Espace Clos' : 'Confined Space Permit'} - ${report.metadata.permitNumber}`,
        text: `📋 ${report.siteInformation.projectNumber || (language === 'fr' ? 'Projet non spécifié' : 'Project not specified')}
📍 ${report.siteInformation.workLocation || (language === 'fr' ? 'Lieu non spécifié' : 'Location not specified')}
🏗️ ${language === 'fr' ? 'Type' : 'Type'}: ${report.siteInformation.spaceType || (language === 'fr' ? 'Non spécifié' : 'Not specified')}
⚠️ ${language === 'fr' ? 'Classification' : 'Classification'}: ${confinedSpaceDetails.csaClass?.toUpperCase() || 'Non définie'}
📅 ${new Date(report.metadata.issueDate).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
🏛️ ${selectedProvince} - ${report.metadata.authority}`,
        url: window.location.href
      };
      
      if (navigator.share && isMobile) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        const textToShare = `${shareData.title}\n\n${shareData.text}\n\n🔗 ${shareData.url}`;
        await navigator.clipboard.writeText(textToShare);
        
        // Notification de succès
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`✅ ${language === 'fr' ? 'Copié dans le presse-papiers' : 'Copied to clipboard'}`, {
              body: language === 'fr' ? 'Informations du permis copiées' : 'Permit information copied',
              icon: '/c-secur360-logo.png'
            });
          }
        }
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // =================== TÉLÉCHARGEMENT DONNÉES COMPLÈTES ===================
  const handleDownloadData = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `c-secur360-permis-${report.metadata.permitNumber}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      // Notification de succès
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`📄 ${language === 'fr' ? 'Données téléchargées' : 'Data downloaded'}`, {
            body: exportFileDefaultName,
            icon: '/c-secur360-logo.png'
          });
        }
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // =================== GÉNÉRATION CHECKLIST DE VALIDATION ===================
  const generateValidationChecklist = () => {
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const currentClassification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
    
    const baseChecklist = [
      {
        category: language === 'fr' ? 'Tests Atmosphériques' : 'Atmospheric Testing',
        items: [
          language === 'fr' ? 'Tests d\'oxygène (19.5% - 23%)' : 'Oxygen testing (19.5% - 23%)',
          language === 'fr' ? 'Tests de gaz inflammables (<10% LIE)' : 'Flammable gas testing (<10% LEL)',
          language === 'fr' ? 'Tests de gaz toxiques (H2S, CO)' : 'Toxic gas testing (H2S, CO)',
          currentClassification?.regulations?.testing || (language === 'fr' ? 'Surveillance selon réglementation' : 'Monitoring per regulations')
        ]
      },
      {
        category: language === 'fr' ? 'Personnel et Formation' : 'Personnel and Training',
        items: [
          currentClassification?.regulations?.attendant || (language === 'fr' ? 'Personnel qualifié requis' : 'Qualified personnel required'),
          language === 'fr' ? 'Formation sur les dangers spécifiques' : 'Training on specific hazards',
          language === 'fr' ? 'Certification des équipements' : 'Equipment certification',
          currentClassification?.regulations?.rescue || (language === 'fr' ? 'Plan de sauvetage établi' : 'Rescue plan established')
        ]
      },
      {
        category: language === 'fr' ? 'Équipements de Sécurité' : 'Safety Equipment',
        items: [
          language === 'fr' ? 'Équipement de surveillance atmosphérique' : 'Atmospheric monitoring equipment',
          language === 'fr' ? 'Équipement de protection individuelle' : 'Personal protective equipment',
          language === 'fr' ? 'Système de communication' : 'Communication system',
          language === 'fr' ? 'Équipement de sauvetage d\'urgence' : 'Emergency rescue equipment'
        ]
      }
    ];

    return baseChecklist;
  };

  // =================== HANDLERS DE DONNÉES OPTIMISÉS ===================
  const handleConfinedSpaceChange = useCallback((field: string, value: any) => {
    setConfinedSpaceDetails(prev => {
      const updated = { ...prev, [field]: value };
      
      // Validation en temps réel
      const errors = validateSiteInformation(updated);
      setValidationErrors(errors);
      
      // Synchronisation avec les données du permis
      updatePermitData({ [field]: value });
      
      // Notification au parent
      updateParentData('siteInformation', updated);
      
      return updated;
    });
  }, [updatePermitData, updateParentData]);

  const handleEnvironmentalChange = useCallback((field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.environmentalConditions,
      [field]: value
    };
    
    handleConfinedSpaceChange('environmentalConditions', updated);
  }, [confinedSpaceDetails.environmentalConditions, handleConfinedSpaceChange]);

  const handleContentChange = useCallback((field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.spaceContent,
      [field]: value
    };
    
    handleConfinedSpaceChange('spaceContent', updated);
  }, [confinedSpaceDetails.spaceContent, handleConfinedSpaceChange]);

  const handleSafetyChange = useCallback((field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.safetyMeasures,
      [field]: value
    };
    
    handleConfinedSpaceChange('safetyMeasures', updated);
  }, [confinedSpaceDetails.safetyMeasures, handleConfinedSpaceChange]);

  // =================== VALIDATION COMPLÈTE ===================
  const validateSiteInformation = (details: ConfinedSpaceDetails = confinedSpaceDetails) => {
    const errors: string[] = [];
    
    // Validation des champs obligatoires
    if (!details.projectNumber) errors.push(language === 'fr' ? 'Numéro de projet manquant' : 'Project number missing');
    if (!details.workLocation) errors.push(language === 'fr' ? 'Lieu des travaux manquant' : 'Work location missing');
    if (!details.contractor) errors.push(language === 'fr' ? 'Entrepreneur manquant' : 'Contractor missing');
    if (!details.supervisor) errors.push(language === 'fr' ? 'Superviseur manquant' : 'Supervisor missing');
    if (!details.entryDate) errors.push(language === 'fr' ? 'Date d\'entrée manquante' : 'Entry date missing');
    if (!details.spaceType) errors.push(language === 'fr' ? 'Type d\'espace manquant' : 'Space type missing');
    if (!details.csaClass) errors.push(language === 'fr' ? 'Classification CSA manquante' : 'CSA classification missing');
    
    // Validation des dimensions
    if (details.dimensions.volume === 0) {
      errors.push(language === 'fr' ? 'Dimensions et volume requis' : 'Dimensions and volume required');
    }
    
    // Validation des dangers (au moins un doit être sélectionné pour Class 1 et 2)
    if ((details.csaClass === 'class1' || details.csaClass === 'class2') && 
        details.atmosphericHazards.length === 0 && details.physicalHazards.length === 0) {
      errors.push(language === 'fr' ? 'Au moins un danger doit être identifié pour cette classification' : 'At least one hazard must be identified for this classification');
    }
    
    return errors;
  };

  // =================== SAUVEGARDE AVEC VALIDATION ===================
  const handleSave = async () => {
    const errors = validateSiteInformation();
    
    if (errors.length > 0) {
      // Notification d'erreurs
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`❌ ${t.validationError}`, {
            body: errors.join('\n'),
            icon: '/c-secur360-logo.png'
          });
        }
      }
      return false;
    }
    
    const permitNumber = await savePermitToDatabase();
    if (permitNumber) {
      updateParentData('siteInformation', confinedSpaceDetails);
      return true;
    }
    
    return false;
  };

  // =================== GESTION DES SECTIONS COLLAPSIBLES ===================
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // =================== EFFETS DE SYNCHRONISATION ===================
  useEffect(() => {
    // Synchroniser avec les données du permis au montage
    if (permitData.spacePhotos) {
      setSpacePhotos(permitData.spacePhotos);
    }
  }, [permitData]);

  useEffect(() => {
    // Synchroniser les photos avec les données du permis
    updatePermitData({ spacePhotos });
  }, [spacePhotos, updatePermitData]);

  useEffect(() => {
    // Demander la permission pour les notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // =================== FONCTIONS UTILITAIRES ===================
  const calculateVolume = () => {
    const { length, width, height, diameter } = confinedSpaceDetails.dimensions;
    let volume = 0;
    let formulaUsed = '';

    switch (confinedSpaceDetails.spaceType) {
      case 'tank':
      case 'vessel':
      case 'silo':
      case 'boiler':
        if (diameter > 0 && height > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
          formulaUsed = `Cylindrique: π × (${radius.toFixed(2)})² × ${height}`;
        }
        break;
        
      case 'pit':
        if (diameter > 0 && height > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
          formulaUsed = `Fosse circulaire: π × (${radius.toFixed(2)})² × ${height}`;
        } else if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height;
          formulaUsed = `Fosse rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
        
      case 'tunnel':
      case 'duct':
        if (diameter > 0 && length > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * length;
          formulaUsed = `Tunnel cylindrique: π × (${radius.toFixed(2)})² × ${length}`;
        } else if (width > 0 && height > 0 && length > 0) {
          volume = length * width * height;
          formulaUsed = `Tunnel rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
        
      default:
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height;
          formulaUsed = `Rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
    }

    const updatedDimensions = {
      ...confinedSpaceDetails.dimensions,
      volume: Math.round(volume * 100) / 100
    };

    handleConfinedSpaceChange('dimensions', updatedDimensions);
    
    console.log(`Volume calculé: ${updatedDimensions.volume} m³ - Formule: ${formulaUsed}`);
  };

  // =================== GESTION DES PHOTOS AVEC GPS ===================
  const handlePhotoCapture = async (category: string) => {
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

            // Géolocalisation avec précision élevée
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                  newPhoto.gpsCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  setSpacePhotos(prev => [...prev, newPhoto]);
                }, 
                () => {
                  newPhoto.location = 'Localisation non disponible';
                  setSpacePhotos(prev => [...prev, newPhoto]);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
              );
            } else {
              newPhoto.location = 'Géolocalisation non supportée';
              setSpacePhotos(prev => [...prev, newPhoto]);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  };

  const handleClassificationComplete = (classification: string, answers: Record<string, any>) => {
    handleConfinedSpaceChange('csaClass', classification);
    
    // Sauvegarder les réponses pour référence
    updatePermitData({ 
      classificationAnswers: answers,
      classificationDate: new Date().toISOString()
    });

    // Notification de succès
    const csaClassifications = getCSAClassifications(selectedProvince, language);
    const selectedClassification = csaClassifications[classification as keyof typeof csaClassifications];
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`✅ ${language === 'fr' ? 'Classification déterminée' : 'Classification determined'}`, {
          body: selectedClassification?.title || classification,
          icon: '/c-secur360-logo.png'
        });
      }
    }
  };

  // =================== RECHERCHE DANS LA BASE DE DONNÉES ===================
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults({ permits: [], total: 0, page: 1, hasMore: false });
      return;
    }
    
    const results = await searchPermitsDatabase(query);
    setSearchResults(results);
  };

  // =================== GESTION DES DANGERS AVEC VALIDATION ===================
  const toggleAtmosphericHazard = (hazardType: string) => {
    const currentHazards = confinedSpaceDetails.atmosphericHazards;
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    handleConfinedSpaceChange('atmosphericHazards', updatedHazards);
  };

  const togglePhysicalHazard = (hazardType: string) => {
    const currentHazards = confinedSpaceDetails.physicalHazards;
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    handleConfinedSpaceChange('physicalHazards', updatedHazards);
  };

  // =================== GESTION DES POINTS D'ENTRÉE ===================
  const addEntryPoint = () => {
    const newEntryPoint = {
      id: `entry-${Date.now()}`,
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    };
    
    handleConfinedSpaceChange('entryPoints', [...confinedSpaceDetails.entryPoints, newEntryPoint]);
  };

  const removeEntryPoint = (entryId: string) => {
    if (confinedSpaceDetails.entryPoints.length <= 1) {
      alert(language === 'fr' ? 'Au moins un point d\'entrée est requis' : 'At least one entry point is required');
      return;
    }
    
    const updatedEntryPoints = confinedSpaceDetails.entryPoints.filter(entry => entry.id !== entryId);
    handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
  };

  const updateEntryPoint = (entryId: string, field: string, value: any) => {
    const updatedEntryPoints = confinedSpaceDetails.entryPoints.map(entry =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    );
    handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
  };

  // =================== COMPOSANT CARROUSEL PHOTOS OPTIMISÉ MOBILE ===================
  const PhotoCarousel = ({ photos, onAddPhoto, category }: {
    photos: SpacePhoto[];
    onAddPhoto: () => void;
    category?: string;
  }) => {
    const currentIndex = currentPhotoIndex;
    const totalSlides = photos.length + 1;

    const nextSlide = () => setCurrentPhotoIndex((currentIndex + 1) % totalSlides);
    const prevSlide = () => setCurrentPhotoIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    const goToSlide = (index: number) => setCurrentPhotoIndex(index);

    return (
      <div className="photo-carousel">
        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {photos.map((photo: SpacePhoto, index: number) => (
              <div key={photo.id} className="carousel-slide">
                <img src={photo.url} alt={photo.caption} />
                <div className="photo-info">
                  <div className="photo-caption">
                    <h4>{t.photoCategories[photo.category as keyof typeof t.photoCategories] || photo.category}</h4>
                    <p>{new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</p>
                    {photo.gpsCoords && (
                      <p className="gps-coords">
                        📍 GPS: {photo.gpsCoords.lat.toFixed(6)}, {photo.gpsCoords.lng.toFixed(6)}
                      </p>
                    )}
                    {photo.measurements && (
                      <p className="measurements">📏 {photo.measurements}</p>
                    )}
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="photo-action-btn edit" 
                      onClick={() => {
                        const newCaption = prompt(
                          language === 'fr' ? 'Nouvelle légende:' : 'New caption:', 
                          photo.caption
                        );
                        if (newCaption) {
                          const updatedPhotos = spacePhotos.map(p => 
                            p.id === photo.id ? { ...p, caption: newCaption } : p
                          );
                          setSpacePhotos(updatedPhotos);
                        }
                      }}
                      title={language === 'fr' ? "Modifier la légende" : "Edit caption"}
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      className="photo-action-btn delete" 
                      onClick={() => {
                        if (confirm(language === 'fr' ? 'Supprimer cette photo?' : 'Delete this photo?')) {
                          const updatedPhotos = spacePhotos.filter(p => p.id !== photo.id);
                          setSpacePhotos(updatedPhotos);
                          updatePermitData({ spacePhotos: updatedPhotos });
                        }
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
                <div className="add-photo-icon">
                  <Camera size={isMobile ? 20 : 24} />
                </div>
                <h4>{t.addPhoto}</h4>
                <p>{t.takePhoto}</p>
              </div>
            </div>
          </div>
          {totalSlides > 1 && (
            <>
              <button 
                className="carousel-nav prev" 
                onClick={prevSlide} 
                disabled={totalSlides <= 1}
                aria-label={language === 'fr' ? 'Photo précédente' : 'Previous photo'}
              >
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <button 
                className="carousel-nav next" 
                onClick={nextSlide} 
                disabled={totalSlides <= 1}
                aria-label={language === 'fr' ? 'Photo suivante' : 'Next photo'}
              >
                <ArrowRight size={isMobile ? 16 : 20} />
              </button>
            </>
          )}
          {totalSlides > 1 && (
            <div className="carousel-indicators">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`${language === 'fr' ? 'Aller à la photo' : 'Go to photo'} ${index + 1}`}
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
      style={{ borderColor: `${color}50`, background: `${color}20` }}
      onClick={onClick}
    >
      <Camera size={isMobile ? 28 : 32} color={color} />
      <h4 style={{ color }}>{title}</h4>
      <p>{description}</p>
    </div>
  );

  // =================== COMPOSANT QUESTIONNAIRE CLASSIFICATION CSA ===================
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
      <div className="modal-overlay">
        <div className="classification-wizard">
          <div className="wizard-header">
            <div className="wizard-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <button className="close-wizard" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="wizard-content">
            <div className="question-container">
              <h3 className="question-title">
                {currentQuestion.critical && <AlertTriangle className="critical-icon" />}
                {currentQuestion.question}
              </h3>

              <div className="options-container">
                {currentQuestion.options.map((option) => (
                  <label key={option.value} className="option-label">
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
                    />
                    <span className="option-text">{option.label}</span>
                    <span className="option-weight">
                      {language === 'fr' ? 'Poids' : 'Weight'}: {option.weight}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button 
              className="wizard-btn secondary" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft size={16} />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </button>

            <button 
              className="wizard-btn primary" 
              onClick={nextQuestion}
              disabled={!answers[currentQuestion.id] || 
                       (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)}
            >
              {isLastQuestion ? (language === 'fr' ? 'Terminer' : 'Finish') : (language === 'fr' ? 'Suivant' : 'Next')}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =================== COMPOSANT SECTION COLLAPSIBLE MOBILE ===================
  const CollapsibleSection = ({ 
    id, 
    title, 
    icon, 
    children, 
    className = '',
    defaultCollapsed = false 
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    defaultCollapsed?: boolean;
  }) => {
    const isCollapsed = collapsedSections.has(id) || (defaultCollapsed && !collapsedSections.has(id));

    return (
      <div className={`collapsible-section ${className}`}>
        <button 
          className="section-toggle"
          onClick={() => toggleSection(id)}
          aria-expanded={!isCollapsed}
        >
          <div className="section-header-content">
            <div className="section-icon">{icon}</div>
            <h3 className="section-title">{title}</h3>
          </div>
          <div className="collapse-indicator">
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </button>
        
        {!isCollapsed && (
          <div className="section-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  // =================== COMPOSANT BOUTONS D'ACTION RAPIDE ===================
  const QuickActionButtons = () => (
    <div className="quick-actions">
      <button
        onClick={() => setShowPermitDatabase(true)}
        className="quick-action-btn database"
        title={t.searchDatabase}
      >
        <Database size={16} />
        {!isMobile && <span>{t.searchDatabase}</span>}
      </button>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="quick-action-btn save"
        title={t.savePermit}
      >
        {isSaving ? <div className="spinner" /> : <Save size={16} />}
        {!isMobile && <span>{isSaving ? t.saving : t.savePermit}</span>}
      </button>

      <button
        onClick={handlePrintPermit}
        disabled={isGeneratingReport}
        className="quick-action-btn print"
        title={t.printPermit}
      >
        {isGeneratingReport ? <div className="spinner" /> : <Printer size={16} />}
        {!isMobile && <span>{t.printPermit}</span>}
      </button>

      <button
        onClick={handleSharePermit}
        className="quick-action-btn share"
        title={t.sharePermit}
      >
        <Share size={16} />
        {!isMobile && <span>{t.sharePermit}</span>}
      </button>
    </div>
  );

  // =================== COMPOSANT INDICATEUR DE VALIDATION ===================
  const ValidationIndicator = () => {
    const errors = validateSiteInformation();
    const isValid = errors.length === 0;
    const completionRate = Math.round(((Object.keys(confinedSpaceDetails).length - errors.length) / Object.keys(confinedSpaceDetails).length) * 100);

    return (
      <div className={`validation-indicator ${isValid ? 'valid' : 'invalid'}`}>
        <div className="validation-header">
          <div className="validation-icon">
            {isValid ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div className="validation-info">
            <h4>{isValid ? t.validationPassed : t.validationErrors}</h4>
            <p>{language === 'fr' ? `Complété à ${completionRate}%` : `${completionRate}% Complete`}</p>
          </div>
        </div>
        
        {!isValid && (
          <div className="validation-errors">
            {errors.map((error, index) => (
              <div key={index} className="validation-error">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        <div className="completion-bar">
          <div 
            className="completion-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    );
  };

  // =================== CSS RESPONSIVE MOBILE OPTIMISÉ ===================
  const mobileOptimizedStyles = `
    /* =================== VARIABLES CSS POUR COHÉRENCE =================== */
    :root {
      --primary-color: #3b82f6;
      --success-color: #10b981;
      --danger-color: #ef4444;
      --warning-color: #f59e0b;
      --dark-bg: #111827;
      --card-bg: #1f2937;
      --border-color: #374151;
      --text-primary: #ffffff;
      --text-secondary: #d1d5db;
      --text-muted: #9ca3af;
      --radius: 12px;
      --radius-sm: 8px;
      --shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.15);
      --transition: all 0.3s ease;
    }

    /* =================== CONTAINER PRINCIPAL RESPONSIVE =================== */
    .site-information-container {
      padding: ${isMobile ? '8px' : '24px'};
      max-width: 100%;
      margin: 0 auto;
      background: var(--dark-bg);
      min-height: 100vh;
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: hidden;
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

    /* =================== SECTIONS COLLAPSIBLES MOBILE =================== */
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
      padding: ${isMobile ? '16px' : '20px'};
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: ${isMobile ? '16px' : '18px'};
      font-weight: 600;
      transition: var(--transition);
      min-height: ${isMobile ? '60px' : '70px'};
      touch-action: manipulation;
    }

    .section-toggle:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    .section-toggle:active {
      transform: scale(0.98);
    }

    .section-header-content {
      display: flex;
      align-items: center;
      gap: ${isMobile ? '12px' : '16px'};
      flex: 1;
    }

    .section-icon {
      width: ${isMobile ? '20px' : '24px'};
      height: ${isMobile ? '20px' : '24px'};
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .section-title {
      margin: 0;
      font-size: ${isMobile ? '16px' : '18px'};
      font-weight: 700;
      color: var(--text-primary);
      text-align: left;
    }

    .collapse-indicator {
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .section-content {
      padding: ${isMobile ? '16px' : '24px'};
      border-top: 1px solid var(--border-color);
      animation: slideDown 0.3s ease;
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

    /* =================== CHAMPS DE FORMULAIRE OPTIMISÉS =================== */
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

    .premium-textarea {
      min-height: ${isMobile ? '100px' : '120px'};
      resize: vertical;
    }

    .premium-input::placeholder,
    .premium-textarea::placeholder {
      color: var(--text-muted);
      font-weight: 400;
    }

    /* =================== BOUTONS RESPONSIVES =================== */
    .btn-primary,
    .btn-success,
    .btn-danger,
    .btn-secondary {
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
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color), #2563eb);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-success {
      background: linear-gradient(135deg, var(--success-color), #059669);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--danger-color), #dc2626);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary {
      background: var(--card-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-primary:hover,
    .btn-success:hover,
    .btn-danger:hover,
    .btn-secondary:hover {
      transform: ${isMobile ? 'none' : 'translateY(-2px)'};
      box-shadow: var(--shadow);
    }

    .btn-primary:active,
    .btn-success:active,
    .btn-danger:active,
    .btn-secondary:active {
      transform: scale(0.98);
    }

    .btn-primary:disabled,
    .btn-success:disabled,
    .btn-danger:disabled,
    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* =================== ACTIONS RAPIDES MOBILES =================== */
    .quick-actions {
      position: ${isMobile ? 'fixed' : 'sticky'};
      ${isMobile ? 'bottom: 20px; right: 20px;' : 'top: 20px; z-index: 100;'}
      display: flex;
      ${isMobile ? 'flex-direction: column' : 'flex-direction: row'};
      gap: ${isMobile ? '12px' : '16px'};
      ${isMobile ? '' : 'justify-content: center; margin-bottom: 20px;'}
    }

    .quick-action-btn {
      ${isMobile ? 'width: 56px; height: 56px;' : 'padding: 12px 20px;'}
      border-radius: ${isMobile ? '50%' : 'var(--radius-sm)'};
      border: none;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: var(--shadow);
      touch-action: manipulation;
    }

    .quick-action-btn.database {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .quick-action-btn.save {
      background: linear-gradient(135deg, var(--success-color), #059669);
      color: white;
    }

    .quick-action-btn.print {
      background: linear-gradient(135deg, var(--primary-color), #2563eb);
      color: white;
    }

    .quick-action-btn.share {
      background: linear-gradient(135deg, var(--warning-color), #d97706);
      color: white;
    }

    .quick-action-btn:hover {
      transform: ${isMobile ? 'scale(1.1)' : 'translateY(-2px)'};
    }

    .quick-action-btn:active {
      transform: scale(0.95);
    }

    /* =================== CARROUSEL PHOTOS OPTIMISÉ =================== */
    .photo-carousel {
      position: relative;
      margin-top: 16px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: ${isMobile ? '250px' : '350px'};
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
      width: ${isMobile ? '40px' : '48px'};
      height: ${isMobile ? '40px' : '48px'};
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
      width: ${isMobile ? '6px' : '8px'};
      height: ${isMobile ? '6px' : '8px'};
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

    /* =================== PLACEHOLDER PHOTOS VIDES =================== */
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

    /* =================== QUESTIONNAIRE CLASSIFICATION =================== */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .classification-wizard {
      background: var(--card-bg);
      border-radius: var(--radius);
      max-width: ${isMobile ? '95vw' : '600px'};
      width: 100%;
      max-height: ${isMobile ? '90vh' : '80vh'};
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow);
    }

    .wizard-header {
      padding: ${isMobile ? '16px' : '20px'};
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wizard-progress {
      flex: 1;
      margin-right: 16px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--success-color));
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: ${isMobile ? '12px' : '14px'};
      color: var(--text-secondary);
      font-weight: 600;
    }

    .close-wizard {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: var(--transition);
    }

    .close-wizard:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .wizard-content {
      flex: 1;
      overflow-y: auto;
      padding: ${isMobile ? '16px' : '24px'};
    }

    .question-container {
      max-width: 100%;
    }

    .question-title {
      font-size: ${isMobile ? '16px' : '18px'};
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      line-height: 1.4;
    }

    .critical-icon {
      color: var(--danger-color);
      flex-shrink: 0;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: ${isMobile ? '12px' : '16px'};
      background: rgba(15, 23, 42, 0.6);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      font-size: ${isMobile ? '14px' : '15px'};
    }

    .option-label:hover {
      border-color: var(--primary-color);
      background: rgba(59, 130, 246, 0.1);
    }

    .option-label input {
      margin: 0;
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
      color: var(--text-primary);
      font-weight: 500;
    }

    .option-weight {
      font-size: ${isMobile ? '11px' : '12px'};
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .wizard-footer {
      padding: ${isMobile ? '16px' : '20px'};
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .wizard-btn {
      padding: ${isMobile ? '12px 16px' : '12px 20px'};
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      min-height: 44px;
    }

    .wizard-btn.primary {
      background: linear-gradient(135deg, var(--primary-color), #2563eb);
      color: white;
    }

    .wizard-btn.secondary {
      background: var(--card-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .wizard-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* =================== INDICATEUR DE VALIDATION =================== */
    .validation-indicator {
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: ${isMobile ? '16px' : '20px'};
      margin-bottom: 20px;
      border-left: 4px solid;
    }

    .validation-indicator.valid {
      border-left-color: var(--success-color);
      background: rgba(16, 185, 129, 0.1);
    }

    .validation-indicator.invalid {
      border-left-color: var(--danger-color);
      background: rgba(239, 68, 68, 0.1);
    }

    .validation-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .validation-icon {
      color: inherit;
    }

    .validation-info h4 {
      margin: 0 0 4px;
      font-size: ${isMobile ? '14px' : '16px'};
      font-weight: 600;
    }

    .validation-info p {
      margin: 0;
      font-size: ${isMobile ? '12px' : '14px'};
      opacity: 0.8;
    }

    .validation-errors {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .validation-error {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: ${isMobile ? '12px' : '13px'};
      color: var(--danger-color);
    }

    .completion-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 12px;
    }

    .completion-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--success-color));
      transition: width 0.3s ease;
    }

    /* =================== SPINNER D'ACTIVATION =================== */
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

    /* =================== BOUTONS CAPTURE PHOTO =================== */
    .photo-capture-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: ${isMobile ? '8px 12px' : '10px 16px'};
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: var(--radius-sm);
      color: var(--primary-color);
      cursor: pointer;
      transition: var(--transition);
      font-size: ${isMobile ? '12px' : '13px'};
      font-weight: 600;
      min-height: ${isMobile ? '36px' : '40px'};
    }

    .photo-capture-btn:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.5);
      transform: ${isMobile ? 'none' : 'translateY(-1px)'};
    }

    .photo-capture-btn:active {
      transform: scale(0.98);
    }

    /* =================== RESPONSIVE SPÉCIFIQUE MOBILE =================== */
    @media (max-width: 768px) {
      .premium-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .two-column,
      .three-column,
      .four-column {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .section-title {
        font-size: 16px;
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
      
      .section-toggle {
        padding: 12px;
        min-height: 56px;
      }
      
      .section-content {
        padding: 12px;
      }
      
      .form-field {
        margin-bottom: 12px;
      }
      
      .carousel-container {
        height: 200px;
      }
    }

    /* =================== CLASSES UTILITAIRES =================== */
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

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  // =================== RENDU JSX PRINCIPAL COMPLET ===================
  return (
    <>
      {/* CSS Styles intégrés */}
      <style dangerouslySetInnerHTML={{ __html: mobileOptimizedStyles }} />

      {/* Input caché pour capture photo */}
      <input
        type="file"
        ref={photoInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />

      <div className="site-information-container">
        {/* Actions rapides */}
        <QuickActionButtons />

        {/* Indicateur de validation */}
        <ValidationIndicator />

        {/* Modal Base de Données des Permis */}
        {showPermitDatabase && (
          <div className="modal-overlay">
            <div style={{
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: isMobile ? '95vw' : '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: '700' }}>
                  🗄️ {t.searchDatabase} - {selectedProvince}
                </h2>
                <button
                  onClick={() => setShowPermitDatabase(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Barre de recherche */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Rechercher par numéro, projet, lieu...' : 'Search by number, project, location...'}
                      className="premium-input"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                          handleSearch(e.target.value);
                        }
                      }}
                      style={{ paddingLeft: '40px' }}
                    />
                    <Search 
                      size={16} 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#64748b' 
                      }} 
                    />
                  </div>
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="btn-primary"
                    style={{ minWidth: isMobile ? '100%' : '120px' }}
                  >
                    <Search size={16} />
                    {language === 'fr' ? 'Chercher' : 'Search'}
                  </button>
                </div>
              </div>

              {/* Résultats de recherche */}
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <div className="spinner"></div>
                  <p style={{ margin: '12px 0 0 0' }}>{language === 'fr' ? 'Recherche en cours...' : 'Searching...'}</p>
                </div>
              ) : searchResults.permits.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {searchResults.permits.map((permit) => (
                    <div key={permit.id} style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => loadPermitFromHistory(permit.permitNumber)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      if (!isMobile) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(100, 116, 139, 0.3)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ color: '#3b82f6', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                            {permit.permitNumber}
                          </h5>
                          <p style={{ color: '#e2e8f0', margin: '0 0 4px 0', fontSize: '13px' }}>
                            📋 {permit.projectNumber} • 📍 {permit.workLocation}
                          </p>
                          <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>
                            🏢 {permit.contractor} • {t.spaceTypes[permit.spaceType as keyof typeof t.spaceTypes] || permit.spaceType}
                          </p>
                        </div>
                        <span style={{
                          background: permit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                     permit.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          color: permit.status === 'active' ? '#10b981' : 
                                 permit.status === 'completed' ? '#3b82f6' : '#9ca3af',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {permit.status === 'active' ? (language === 'fr' ? '🟢 ACTIF' : '🟢 ACTIVE') :
                           permit.status === 'completed' ? (language === 'fr' ? '🔵 TERMINÉ' : '🔵 COMPLETED') : 
                           (language === 'fr' ? '⚪ AUTRE' : '⚪ OTHER')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>{language === 'fr' ? `Aucun permis trouvé pour "${searchQuery}"` : `No permits found for "${searchQuery}"`}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <p style={{ margin: 0 }}>{language === 'fr' ? '💡 Tapez au moins 2 caractères pour rechercher' : '💡 Type at least 2 characters to search'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questionnaire Classification CSA */}
        <CSAClassificationWizard 
          isOpen={showClassificationWizard}
          onClose={() => setShowClassificationWizard(false)}
          onClassificationComplete={handleClassificationComplete}
        />

        {/* Header principal */}
        <CollapsibleSection
          id="header"
          title={t.title}
          icon={<Building />}
          className="full-width"
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t.subtitle}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {selectedProvince}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: 'var(--success-color)' }}>
                  {(confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Dangers' : 'Hazards'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: 'var(--warning-color)' }}>
                  {spacePhotos.length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {language === 'fr' ? 'Photos' : 'Photos'}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Informations du Projet */}
        <CollapsibleSection
          id="project-info"
          title={t.projectInfo}
          icon={<Building />}
        >
          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <Building style={{ width: '18px', height: '18px' }} />
                {t.projectNumber}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Ex: CS-2024-001"
                value={confinedSpaceDetails.projectNumber}
                onChange={(e) => handleConfinedSpaceChange('projectNumber', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <MapPin style={{ width: '18px', height: '18px' }} />
                {t.workLocation}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={language === 'fr' ? 'Adresse complète du site' : 'Complete site address'}
                value={confinedSpaceDetails.workLocation}
                onChange={(e) => handleConfinedSpaceChange('workLocation', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />
                {t.contractor}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={language === 'fr' ? 'Nom de l\'entreprise contractante' : 'Contracting company name'}
                value={confinedSpaceDetails.contractor}
                onChange={(e) => handleConfinedSpaceChange('contractor', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />
                {t.supervisor}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={language === 'fr' ? 'Nom du superviseur' : 'Supervisor name'}
                value={confinedSpaceDetails.supervisor}
                onChange={(e) => handleConfinedSpaceChange('supervisor', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Planification */}
        <CollapsibleSection
          id="planning"
          title={t.planning}
          icon={<Calendar />}
        >
          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <Calendar style={{ width: '18px', height: '18px' }} />
                {t.entryDate}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <input 
                type="datetime-local" 
                className="premium-input"
                value={confinedSpaceDetails.entryDate}
                onChange={(e) => handleConfinedSpaceChange('entryDate', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Clock style={{ width: '18px', height: '18px' }} />
                {t.duration}
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder={language === 'fr' ? 'Ex: 4 heures' : 'Ex: 4 hours'}
                value={confinedSpaceDetails.duration}
                onChange={(e) => handleConfinedSpaceChange('duration', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Users style={{ width: '18px', height: '18px' }} />
                {t.workerCount}
              </label>
              <input 
                type="number" 
                min="1" 
                className="premium-input"
                value={confinedSpaceDetails.workerCount}
                onChange={(e) => handleConfinedSpaceChange('workerCount', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                {t.workDescription}
              </label>
              <textarea 
                className="premium-textarea" 
                style={{ minHeight: '80px' }}
                placeholder={language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description'}
                value={confinedSpaceDetails.workDescription}
                onChange={(e) => handleConfinedSpaceChange('workDescription', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Identification de l'Espace Clos */}
        <CollapsibleSection
          id="space-identification"
          title={t.spaceIdentification}
          icon={<Home />}
          className="full-width"
        >
          <div className="form-field">
            <label className="field-label">
              {t.spaceType}<span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              {Object.entries(t.spaceTypes).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '16px 12px',
                    background: confinedSpaceDetails.spaceType === key ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${confinedSpaceDetails.spaceType === key ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => handleConfinedSpaceChange('spaceType', key)}
                >
                  <div style={{ fontSize: '24px' }}>
                    {key === 'tank' ? '🏗️' : key === 'vessel' ? '⚗️' : key === 'silo' ? '🌾' : 
                     key === 'pit' ? '🕳️' : key === 'vault' ? '🏛️' : key === 'tunnel' ? '🚇' : 
                     key === 'trench' ? '🚧' : key === 'manhole' ? '🔧' : key === 'storage' ? '📦' : 
                     key === 'boiler' ? '🔥' : key === 'duct' ? '🌪️' : key === 'chamber' ? '🏢' : '❓'}
                  </div>
                  <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '600', textAlign: 'center' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="three-column">
            <div className="form-field">
              <label className="field-label">
                <Shield style={{ width: '18px', height: '18px' }} />
                {t.csaClass}<span style={{ color: 'var(--danger-color)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.csaClass}
                  onChange={(e) => handleConfinedSpaceChange('csaClass', e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">{t.select}</option>
                  <option value="class1">{t.csaClasses.class1}</option>
                  <option value="class2">{t.csaClasses.class2}</option>
                  <option value="class3">{t.csaClasses.class3}</option>
                </select>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowClassificationWizard(true)}
                  style={{ minWidth: isMobile ? '100%' : 'auto', whiteSpace: 'nowrap' }}
                >
                  <Star size={16} />
                  {language === 'fr' ? 'Assistant' : 'Wizard'}
                </button>
              </div>
              {confinedSpaceDetails.csaClass && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: confinedSpaceDetails.csaClass === 'class1' ? 'rgba(239, 68, 68, 0.1)' : 
                             confinedSpaceDetails.csaClass === 'class2' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${confinedSpaceDetails.csaClass === 'class1' ? 'var(--danger-color)' : 
                                      confinedSpaceDetails.csaClass === 'class2' ? 'var(--warning-color)' : 'var(--success-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px'
                }}>
                  {(() => {
                    const csaClassifications = getCSAClassifications(selectedProvince, language);
                    const classification = csaClassifications[confinedSpaceDetails.csaClass as keyof typeof csaClassifications];
                    return classification?.description || '';
                  })()}
                </div>
              )}
            </div>

            <div className="form-field">
              <label className="field-label">
                <ArrowRight style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Méthode d\'entrée' : 'Entry Method'}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.entryMethod}
                onChange={(e) => handleConfinedSpaceChange('entryMethod', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="top">{language === 'fr' ? 'Entrée par le dessus' : 'Top entry'}</option>
                <option value="side">{language === 'fr' ? 'Entrée latérale' : 'Side entry'}</option>
                <option value="bottom">{language === 'fr' ? 'Entrée par le dessous' : 'Bottom entry'}</option>
                <option value="multiple">{language === 'fr' ? 'Entrées multiples' : 'Multiple entries'}</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Layers style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Type d\'accès' : 'Access Type'}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.accessType}
                onChange={(e) => handleConfinedSpaceChange('accessType', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="ladder">{language === 'fr' ? 'Échelle' : 'Ladder'}</option>
                <option value="stairs">{language === 'fr' ? 'Escalier' : 'Stairs'}</option>
                <option value="rope">{language === 'fr' ? 'Corde' : 'Rope'}</option>
                <option value="crane">{language === 'fr' ? 'Grue/Palan' : 'Crane/Hoist'}</option>
                <option value="direct">{language === 'fr' ? 'Accès direct' : 'Direct access'}</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Dimensions et Volume */}
        <CollapsibleSection
          id="dimensions"
          title={t.spaceDimensions}
          icon={<Ruler />}
          className="full-width"
        >
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '20px'
          }}>
            <div className="four-column">
              <div className="form-field">
                <label className="field-label">{t.length}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="premium-input"
                  value={confinedSpaceDetails.dimensions.length || ''}
                  onChange={(e) => handleConfinedSpaceChange('dimensions', {
                    ...confinedSpaceDetails.dimensions,
                    length: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.width}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="premium-input"
                  value={confinedSpaceDetails.dimensions.width || ''}
                  onChange={(e) => handleConfinedSpaceChange('dimensions', {
                    ...confinedSpaceDetails.dimensions,
                    width: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  {t.height}<span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="premium-input"
                  value={confinedSpaceDetails.dimensions.height || ''}
                  onChange={(e) => handleConfinedSpaceChange('dimensions', {
                    ...confinedSpaceDetails.dimensions,
                    height: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t.diameter}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="premium-input"
                  value={confinedSpaceDetails.dimensions.diameter || ''}
                  onChange={(e) => handleConfinedSpaceChange('dimensions', {
                    ...confinedSpaceDetails.dimensions,
                    diameter: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <button className="btn-success" onClick={calculateVolume}>
                <Gauge size={20} />
                {t.calculateVolume}
              </button>
            </div>

            {confinedSpaceDetails.dimensions.volume > 0 && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: 'var(--success-color)', 
                  marginBottom: '4px'
                }}>
                  {confinedSpaceDetails.dimensions.volume}
                </div>
                <div style={{ fontSize: '14px', color: '#6ee7b7' }}>
                  {t.volumeUnit} - {t.volume}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Section Points d'Entrée */}
        <CollapsibleSection
          id="entry-points"
          title={t.entryPoints}
          icon={<Home />}
          className="full-width"
        >
          {confinedSpaceDetails.entryPoints.map((entry, index) => (
            <div key={entry.id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 'var(--radius)',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <h4 style={{ 
                  color: '#a78bfa', 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '600' 
                }}>
                  🚪 {t.entryPoint} {index + 1}
                </h4>
                {confinedSpaceDetails.entryPoints.length > 1 && (
                  <button 
                    className="btn-danger" 
                    onClick={() => removeEntryPoint(entry.id)}
                    type="button"
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                  >
                    <Trash2 size={14} />
                    {t.remove}
                  </button>
                )}
              </div>

              <div className="three-column">
                <div className="form-field">
                  <label className="field-label">{t.entryType}</label>
                  <select
                    className="premium-select"
                    value={entry.type}
                    onChange={(e) => updateEntryPoint(entry.id, 'type', e.target.value)}
                  >
                    <option value="circular">🔵 {language === 'fr' ? 'Circulaire' : 'Circular'}</option>
                    <option value="rectangular">🟨 {language === 'fr' ? 'Rectangulaire' : 'Rectangular'}</option>
                    <option value="square">🟫 {language === 'fr' ? 'Carré' : 'Square'}</option>
                    <option value="oval">🥚 {language === 'fr' ? 'Ovale' : 'Oval'}</option>
                    <option value="irregular">🔷 {language === 'fr' ? 'Irrégulier' : 'Irregular'}</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">{t.entryDimensions}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={language === 'fr' ? 'Ex: 60cm x 40cm ou Ø80cm' : 'Ex: 60cm x 40cm or Ø80cm'}
                    value={entry.dimensions}
                    onChange={(e) => updateEntryPoint(entry.id, 'dimensions', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">{t.entryLocation}</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder={language === 'fr' ? 'Ex: Partie supérieure, côté nord' : 'Ex: Top section, north side'}
                    value={entry.location}
                    onChange={(e) => updateEntryPoint(entry.id, 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn-primary" onClick={addEntryPoint}>
              <Plus size={20} />
              {t.addEntryPoint}
            </button>
          </div>
        </CollapsibleSection>

        {/* Section Évaluation des Dangers */}
        <CollapsibleSection
          id="hazard-assessment"
          title={t.hazardAssessment}
          icon={<AlertTriangle />}
          className="full-width"
        >
          {/* Dangers Atmosphériques */}
          <div className="form-field">
            <label className="field-label">
              <Wind style={{ width: '18px', height: '18px', color: 'var(--warning-color)' }} />
              {t.atmosphericHazards}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {Object.entries(t.atmosphericHazardTypes).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: confinedSpaceDetails.atmosphericHazards.includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${confinedSpaceDetails.atmosphericHazards.includes(key) ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onClick={() => toggleAtmosphericHazard(key)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${confinedSpaceDetails.atmosphericHazards.includes(key) ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    background: confinedSpaceDetails.atmosphericHazards.includes(key) ? 'var(--danger-color)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {confinedSpaceDetails.atmosphericHazards.includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: confinedSpaceDetails.atmosphericHazards.includes(key) ? '#fecaca' : 'var(--text-secondary)', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>
                    🌪️ {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dangers Physiques */}
          <div className="form-field">
            <label className="field-label">
              <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--danger-color)' }} />
              {t.physicalHazards}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {Object.entries(t.physicalHazardTypes).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: confinedSpaceDetails.physicalHazards.includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${confinedSpaceDetails.physicalHazards.includes(key) ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onClick={() => togglePhysicalHazard(key)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${confinedSpaceDetails.physicalHazards.includes(key) ? 'var(--danger-color)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    background: confinedSpaceDetails.physicalHazards.includes(key) ? 'var(--danger-color)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {confinedSpaceDetails.physicalHazards.includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: confinedSpaceDetails.physicalHazards.includes(key) ? '#fecaca' : 'var(--text-secondary)', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}>
                    ⚡ {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Conditions Environnementales */}
        <CollapsibleSection
          id="environmental-conditions"
          title={t.environmentalConditions}
          icon={<Activity />}
        >
          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <Wind style={{ width: '18px', height: '18px' }} />
                {t.ventilationRequired}
              </label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ventilationRequired"
                    value="true"
                    checked={confinedSpaceDetails.environmentalConditions.ventilationRequired === true}
                    onChange={() => handleEnvironmentalChange('ventilationRequired', true)}
                  />
                  <span>{t.yes}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="ventilationRequired"
                    value="false"
                    checked={confinedSpaceDetails.environmentalConditions.ventilationRequired === false}
                    onChange={() => handleEnvironmentalChange('ventilationRequired', false)}
                  />
                  <span>{t.no}</span>
                </label>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Wind style={{ width: '18px', height: '18px' }} />
                {t.ventilationType}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.environmentalConditions.ventilationType}
                onChange={(e) => handleEnvironmentalChange('ventilationType', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="natural">{language === 'fr' ? 'Naturelle' : 'Natural'}</option>
                <option value="mechanical">{language === 'fr' ? 'Mécanique' : 'Mechanical'}</option>
                <option value="forced">{language === 'fr' ? 'Forcée' : 'Forced'}</option>
                <option value="none">{language === 'fr' ? 'Aucune' : 'None'}</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Eye style={{ width: '18px', height: '18px' }} />
                {t.lightingConditions}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.environmentalConditions.lightingConditions}
                onChange={(e) => handleEnvironmentalChange('lightingConditions', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="natural">{language === 'fr' ? 'Éclairage naturel' : 'Natural lighting'}</option>
                <option value="artificial">{language === 'fr' ? 'Éclairage artificiel requis' : 'Artificial lighting required'}</option>
                <option value="poor">{language === 'fr' ? 'Éclairage faible' : 'Poor lighting'}</option>
                <option value="none">{language === 'fr' ? 'Aucun éclairage' : 'No lighting'}</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Thermometer style={{ width: '18px', height: '18px' }} />
                {t.temperatureRange}
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder={language === 'fr' ? 'Ex: 15-25°C' : 'Ex: 15-25°C'}
                value={confinedSpaceDetails.environmentalConditions.temperatureRange}
                onChange={(e) => handleEnvironmentalChange('temperatureRange', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Droplets style={{ width: '18px', height: '18px' }} />
                {t.moistureLevel}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.environmentalConditions.moistureLevel}
                onChange={(e) => handleEnvironmentalChange('moistureLevel', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="low">{language === 'fr' ? 'Faible (<40%)' : 'Low (<40%)'}</option>
                <option value="normal">{language === 'fr' ? 'Normal (40-70%)' : 'Normal (40-70%)'}</option>
                <option value="high">{language === 'fr' ? 'Élevé (>70%)' : 'High (>70%)'}</option>
                <option value="wet">{language === 'fr' ? 'Humide/Mouillé' : 'Wet/Damp'}</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Activity style={{ width: '18px', height: '18px' }} />
                {t.noiseLevel}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.environmentalConditions.noiseLevel}
                onChange={(e) => handleEnvironmentalChange('noiseLevel', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="low">{language === 'fr' ? 'Faible (<70 dB)' : 'Low (<70 dB)'}</option>
                <option value="moderate">{language === 'fr' ? 'Modéré (70-85 dB)' : 'Moderate (70-85 dB)'}</option>
                <option value="high">{language === 'fr' ? 'Élevé (>85 dB)' : 'High (>85 dB)'}</option>
                <option value="extreme">{language === 'fr' ? 'Extrême (>100 dB)' : 'Extreme (>100 dB)'}</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Contenu et Historique */}
        <CollapsibleSection
          id="space-content"
          title={t.spaceContent}
          icon={<FileText />}
        >
          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                {t.contents}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Décrire le contenu actuel de l\'espace' : 'Describe current space contents'}
                value={confinedSpaceDetails.spaceContent.contents}
                onChange={(e) => handleContentChange('contents', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <AlertTriangle style={{ width: '18px', height: '18px' }} />
                {t.residues}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Résidus chimiques, substances dangereuses...' : 'Chemical residues, hazardous substances...'}
                value={confinedSpaceDetails.spaceContent.residues}
                onChange={(e) => handleContentChange('residues', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Clock style={{ width: '18px', height: '18px' }} />
                {t.previousUse}
              </label>
              <input
                type="text"
                className="premium-input"
                placeholder={language === 'fr' ? 'Usage antérieur de l\'espace' : 'Previous use of space'}
                value={confinedSpaceDetails.spaceContent.previousUse}
                onChange={(e) => handleContentChange('previousUse', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Calendar style={{ width: '18px', height: '18px' }} />
                {t.lastEntry}
              </label>
              <input
                type="date"
                className="premium-input"
                value={confinedSpaceDetails.spaceContent.lastEntry}
                onChange={(e) => handleContentChange('lastEntry', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Wrench style={{ width: '18px', height: '18px' }} />
                {t.cleaningStatus}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.spaceContent.cleaningStatus}
                onChange={(e) => handleContentChange('cleaningStatus', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="clean">{language === 'fr' ? 'Nettoyé et décontaminé' : 'Cleaned and decontaminated'}</option>
                <option value="partial">{language === 'fr' ? 'Partiellement nettoyé' : 'Partially cleaned'}</option>
                <option value="dirty">{language === 'fr' ? 'Non nettoyé' : 'Not cleaned'}</option>
                <option value="unknown">{language === 'fr' ? 'État inconnu' : 'Unknown status'}</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Mesures de Sécurité */}
        <CollapsibleSection
          id="safety-measures"
          title={t.safetyMeasures}
          icon={<Shield />}
        >
          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
                {t.emergencyEgress}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Plan de sortie d\'urgence détaillé' : 'Detailed emergency egress plan'}
                value={confinedSpaceDetails.safetyMeasures.emergencyEgress}
                onChange={(e) => handleSafetyChange('emergencyEgress', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <MessageSquare style={{ width: '18px', height: '18px' }} />
                {t.communicationMethod}
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.safetyMeasures.communicationMethod}
                onChange={(e) => handleSafetyChange('communicationMethod', e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="radio">{language === 'fr' ? 'Radio bidirectionnelle' : 'Two-way radio'}</option>
                <option value="voice">{language === 'fr' ? 'Communication vocale' : 'Voice communication'}</option>
                <option value="visual">{language === 'fr' ? 'Signaux visuels' : 'Visual signals'}</option>
                <option value="rope">{language === 'fr' ? 'Signaux par corde' : 'Rope signals'}</option>
                <option value="electronic">{language === 'fr' ? 'Système électronique' : 'Electronic system'}</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Gauge style={{ width: '18px', height: '18px' }} />
                {t.monitoringEquipment}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Équipements de surveillance requis' : 'Required monitoring equipment'}
                value={confinedSpaceDetails.safetyMeasures.monitoringEquipment.join(', ')}
                onChange={(e) => handleSafetyChange('monitoringEquipment', e.target.value.split(', ').filter(item => item.trim()))}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Wind style={{ width: '18px', height: '18px' }} />
                {t.ventilationEquipment}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Équipements de ventilation nécessaires' : 'Required ventilation equipment'}
                value={confinedSpaceDetails.safetyMeasures.ventilationEquipment.join(', ')}
                onChange={(e) => handleSafetyChange('ventilationEquipment', e.target.value.split(', ').filter(item => item.trim()))}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Shield style={{ width: '18px', height: '18px' }} />
                {t.emergencyEquipment}
              </label>
              <textarea
                className="premium-textarea"
                placeholder={language === 'fr' ? 'Équipements d\'urgence et de sauvetage' : 'Emergency and rescue equipment'}
                value={confinedSpaceDetails.safetyMeasures.emergencyEquipment.join(', ')}
                onChange={(e) => handleSafetyChange('emergencyEquipment', e.target.value.split(', ').filter(item => item.trim()))}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Documentation Photographique */}
        <CollapsibleSection
          id="photo-documentation"
          title={t.photoDocumentation}
          icon={<Camera />}
          className="full-width"
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
            gap: '8px', 
            marginBottom: '16px' 
          }}>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('exterior')}>
              <Camera size={14} />
              {t.photoCategories.exterior}
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('interior')}>
              <Camera size={14} />
              {t.photoCategories.interior}
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('entry')}>
              <Camera size={14} />
              {t.photoCategories.entry}
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('hazards')}>
              <AlertTriangle size={14} />
              {t.photoCategories.hazards}
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('equipment')}>
              <Shield size={14} />
              {t.photoCategories.equipment}
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('safety')}>
              <Shield size={14} />
              {t.photoCategories.safety}
            </button>
          </div>

          {spacePhotos.length > 0 ? (
            <PhotoCarousel 
              photos={spacePhotos}
              onAddPhoto={() => handlePhotoCapture('interior')}
            />
          ) : (
            <EmptyPhotoPlaceholder
              onClick={() => handlePhotoCapture('exterior')}
              title={t.noPhotos}
              description={t.takePhoto}
            />
          )}
        </CollapsibleSection>

        {/* Section Code QR */}
        <CollapsibleSection
          id="qr-code"
          title={t.qrCodeSection}
          icon={<QrCode />}
          className="full-width"
        >
          {permitData.permit_number ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#10b981', margin: '0 0 12px 0' }}>
                ✅ {language === 'fr' ? `QR Code généré pour : ${permitData.permit_number}` : `QR Code generated for: ${permitData.permit_number}`}
              </h4>
              <p style={{ color: '#6ee7b7', margin: 0, fontSize: '14px' }}>
                {t.qrGenerated}
              </p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#93c5fd', margin: 0 }}>
                💡 {t.qrWillGenerate}
              </p>
            </div>
          )}
        </CollapsibleSection>

        {/* Section de Validation Finale */}
        <CollapsibleSection
          id="final-validation"
          title={language === 'fr' ? 'Validation et Finalisation' : 'Validation and Finalization'}
          icon={<CheckCircle />}
          className="full-width"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '16px', 
            background: validateSiteInformation().length === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px', 
            border: `1px solid ${validateSiteInformation().length === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {validateSiteInformation().length === 0 ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <AlertTriangle size={24} color="#ef4444" />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                color: validateSiteInformation().length === 0 ? '#86efac' : '#fca5a5', 
                margin: '0 0 4px 0', 
                fontSize: '16px', 
                fontWeight: '600' 
              }}>
                {validateSiteInformation().length === 0 ? 
                  (language === 'fr' ? '✅ Informations du Site Complétées' : '✅ Site Information Complete') :
                  (language === 'fr' ? '⚠️ Informations Incomplètes' : '⚠️ Incomplete Information')
                }
              </h4>
              <p style={{ 
                color: validateSiteInformation().length === 0 ? '#6ee7b7' : '#fca5a5', 
                margin: 0, 
                fontSize: '14px' 
              }}>
                {validateSiteInformation().length === 0 ?
                  (language === 'fr' ? 'Toutes les informations nécessaires ont été documentées.' : 'All necessary information has been documented.') :
                  (language === 'fr' ? `${validateSiteInformation().length} erreur(s) à corriger` : `${validateSiteInformation().length} error(s) to fix`)
                }
              </p>
            </div>
          </div>

          {/* Actions finales */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '12px', 
            marginTop: '20px' 
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving || validateSiteInformation().length > 0}
              className="btn-success"
              style={{ minHeight: '50px' }}
            >
              {isSaving ? <div className="spinner" /> : <Save size={20} />}
              {isSaving ? t.saving : t.savePermit}
            </button>

            <button
              onClick={handlePrintPermit}
              disabled={isGeneratingReport || validateSiteInformation().length > 0}
              className="btn-primary"
              style={{ minHeight: '50px' }}
            >
              {isGeneratingReport ? <div className="spinner" /> : <Printer size={20} />}
              {t.printPermit}
            </button>
          </div>
        </CollapsibleSection>

        {/* Footer avec informations légales */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(31, 41, 59, 0.6)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'url(/c-secur360-logo.png) no-repeat center',
              backgroundSize: 'contain'
            }}></div>
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '18px', fontWeight: '700' }}>
              C-SECUR360
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            {language === 'fr' ? 
              'Système de Gestion de Sécurité Industrielle - Conformité Réglementaire Provinciale' :
              'Industrial Safety Management System - Provincial Regulatory Compliance'
            }
            <br />
            {language === 'fr' ? 
              `Province: ${selectedProvince} - ${PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Autorité Compétente'}` :
              `Province: ${selectedProvince} - ${PROVINCIAL_REGULATIONS[selectedProvince]?.authority || 'Competent Authority'}`
            }
            <br />
            {language === 'fr' ? 
              'Document généré automatiquement - Validation requise avant utilisation' :
              'Automatically generated document - Validation required before use'
            }
          </p>
        </div>
      </div>
    </>
  );
};

// =================== EXPORT AVEC GESTION D'ERREUR ===================
export default React.memo(SiteInformation);
