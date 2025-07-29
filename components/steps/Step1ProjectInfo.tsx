'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase,
  Copy, Check, AlertTriangle, Camera, Upload, X, Lock, Zap, Settings, Wrench,
  Droplets, Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home,
  Ruler, Thermometer, Activity, Shield, Volume2, Gauge, Info, Search,
  Heart, RotateCcw, Layers, Square, Circle, Triangle
} from 'lucide-react';

// =================== INTERFACES TYPESCRIPT ===================
interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
}

interface ConfinedSpaceDetails {
  spaceType: string;
  spaceCategory: string;
  entryMethod: string;
  accessType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    diameter?: number;
    volume: number;
  };

// =================== GÉNÉRATEUR DE NUMÉRO AST UNIQUE ===================
const generateASTNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `AST-${year}${month}${day}-${hour}${minute}${second}-${random}`;
};
  entryPoints: Array<{
    id: string;
    type: string;
    dimensions: string;
    location: string;
    condition: string;
    photos: string[];
  }>;
  atmosphericHazards: string[];
  physicalHazards: string[];
  previousHistory: string;
  lastEntry: string;
  ventilationRequired: boolean;
  ventilationType: string;
  emergencyEgress: string;
  communicationMethod: string;
  lightingConditions: string;
  temperatureConditions: string;
  moistureLevel: string;
  noiseLevel: string;
  structuralIntegrity: string;
  contents: string;
  residues: string;
  workSpace: string;
  photos: string[];
}

interface SpacePhoto {
  id: string;
  url: string;
  caption: string;
  category: 'space_exterior' | 'space_interior' | 'entry_point' | 'hazard_identification' | 'equipment_staging' | 'atmospheric_testing';
  timestamp: string;
  location?: string;
  measurements?: string;
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
    confinedSpaceDetails: "🏠 Caractéristiques de l'Espace Clos",
    
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
    wastewater: "💧 Traitement des eaux",
    mining: "⛏️ Minier",
    petrochemical: "🛢️ Pétrochimique",
    marine: "🚢 Maritime",
    food: "🍕 Alimentaire",
    pharmaceutical: "💊 Pharmaceutique",
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
    
    // Espace Clos - Caractéristiques générales
    spaceIdentification: "🏠 Identification de l'Espace",
    spaceType: "Type d'Espace Clos",
    spaceCategory: "Catégorie",
    entryMethod: "Méthode d'Entrée",
    accessType: "Type d'Accès",
    spaceDimensions: "📏 Dimensions et Volume",
    length: "Longueur (m)",
    width: "Largeur (m)", 
    height: "Hauteur (m)",
    diameter: "Diamètre (m)",
    volume: "Volume Calculé",
    volumeUnit: "m³",
    calculateVolume: "Calculer Volume",
    
    // Points d'entrée
    entryPoints: "🚪 Points d'Entrée",
    addEntryPoint: "Ajouter Point d'Entrée",
    entryPoint: "Point d'Entrée #",
    entryType: "Type d'Ouverture",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "État/Condition",
    entryPhotos: "Photos du Point d'Entrée",
    
    // Contenu et risques
    contentAndHazards: "⚠️ Contenu et Dangers",
    contents: "Contenu de l'Espace",
    residues: "Résidus/Substances",
    workSpace: "Espace de Travail Disponible",
    atmosphericHazards: "Dangers Atmosphériques",
    physicalHazards: "Dangers Physiques",
    previousHistory: "Historique d'Entrées",
    lastEntry: "Dernière Entrée",
    
    // Photos d'archives
    spaceDocumentation: "📸 Documentation Photographique",
    spaceExterior: "Extérieur de l'espace",
    spaceInterior: "Intérieur de l'espace",
    entryPointPhoto: "Point d'entrée",
    hazardIdentification: "Identification des dangers",
    equipmentStaging: "Mise en place équipements",
    atmosphericTesting: "Tests atmosphériques",
    
    // Actions
    yes: "Oui",
    no: "Non",
    select: "Sélectionner",
    selectMultiple: "Sélectionner (multiple)",
    
    // Unités
    meters: "mètres",
    cubicMeters: "mètres cubes",
    
    // Types d'espaces clos
    spaceTypes: {
      tank: "🛢️ Réservoir/Citerne",
      vessel: "🏺 Récipient sous pression",
      vault: "🏛️ Voûte/Caveau",
      pit: "🕳️ Fosse/Puits",
      sewer: "🚰 Égout/Conduite",
      silo: "🌾 Silo",
      tunnel: "🚇 Tunnel/Galerie",
      basement: "🏠 Sous-sol/Cave",
      boiler: "🔥 Chaudière",
      duct: "📦 Conduit/Gaine",
      manhole: "🔍 Regard/Puisard",
      bin: "📦 Bac/Conteneur",
      other: "🔧 Autre"
    },
    
    // Dangers atmosphériques
    atmosphericHazardTypes: {
      oxygen_deficiency: "Déficience en oxygène",
      oxygen_enrichment: "Enrichissement en oxygène",
      flammable_gases: "Gaz inflammables",
      toxic_gases: "Gaz toxiques",
      hydrogen_sulfide: "Sulfure d'hydrogène (H2S)",
      carbon_monoxide: "Monoxyde de carbone (CO)",
      methane: "Méthane (CH4)",
      carbon_dioxide: "Dioxyde de carbone (CO2)",
      ammonia: "Ammoniac (NH3)",
      chlorine: "Chlore (Cl2)",
      welding_fumes: "Fumées de soudage",
      solvent_vapors: "Vapeurs de solvants"
    },
    
    // Dangers physiques
    physicalHazardTypes: {
      engulfment: "Ensevelissement",
      crushing: "Écrasement",
      electrical: "Électriques",
      mechanical: "Mécaniques",
      temperature: "Températures extrêmes",
      noise: "Bruit excessif",
      radiation: "Radiations",
      falling_objects: "Chute d'objets",
      slips_falls: "Glissades/Chutes",
      confined_layout: "Configuration confinée",
      poor_visibility: "Visibilité réduite",
      structural_collapse: "Effondrement structural"
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
    confinedSpaceDetails: "🏠 Confined Space Characteristics",
    
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
    wastewater: "💧 Water Treatment",
    mining: "⛏️ Mining",
    petrochemical: "🛢️ Petrochemical",
    marine: "🚢 Marine",
    food: "🍕 Food Processing",
    pharmaceutical: "💊 Pharmaceutical",
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
    
    // Confined Space - General characteristics
    spaceIdentification: "🏠 Space Identification",
    spaceType: "Confined Space Type",
    spaceCategory: "Category",
    entryMethod: "Entry Method",
    accessType: "Access Type",
    spaceDimensions: "📏 Dimensions and Volume",
    length: "Length (m)",
    width: "Width (m)",
    height: "Height (m)",
    diameter: "Diameter (m)",
    volume: "Calculated Volume",
    volumeUnit: "m³",
    calculateVolume: "Calculate Volume",
    
    // Entry points
    entryPoints: "🚪 Entry Points",
    addEntryPoint: "Add Entry Point",
    entryPoint: "Entry Point #",
    entryType: "Opening Type",
    entryDimensions: "Dimensions",
    entryLocation: "Location",
    entryCondition: "State/Condition",
    entryPhotos: "Entry Point Photos",
    
    // Content and hazards
    contentAndHazards: "⚠️ Content and Hazards",
    contents: "Space Contents",
    residues: "Residues/Substances",
    workSpace: "Available Work Space",
    atmosphericHazards: "Atmospheric Hazards",
    physicalHazards: "Physical Hazards",
    previousHistory: "Entry History",
    lastEntry: "Last Entry",
    
    // Photo documentation
    spaceDocumentation: "📸 Photographic Documentation",
    spaceExterior: "Space exterior",
    spaceInterior: "Space interior",
    entryPointPhoto: "Entry point",
    hazardIdentification: "Hazard identification",
    equipmentStaging: "Equipment staging",
    atmosphericTesting: "Atmospheric testing",
    
    // Actions
    yes: "Yes",
    no: "No",
    select: "Select",
    selectMultiple: "Select (multiple)",
    
    // Units
    meters: "meters",
    cubicMeters: "cubic meters",
    
    // Space types
    spaceTypes: {
      tank: "🛢️ Tank/Cistern",
      vessel: "🏺 Pressure Vessel",
      vault: "🏛️ Vault/Chamber",
      pit: "🕳️ Pit/Well",
      sewer: "🚰 Sewer/Pipe",
      silo: "🌾 Silo",
      tunnel: "🚇 Tunnel/Gallery",
      basement: "🏠 Basement/Cellar",
      boiler: "🔥 Boiler",
      duct: "📦 Duct/Vent",
      manhole: "🔍 Manhole/Sump",
      bin: "📦 Bin/Container",
      other: "🔧 Other"
    },
    
    // Atmospheric hazards
    atmosphericHazardTypes: {
      oxygen_deficiency: "Oxygen deficiency",
      oxygen_enrichment: "Oxygen enrichment",
      flammable_gases: "Flammable gases",
      toxic_gases: "Toxic gases",
      hydrogen_sulfide: "Hydrogen sulfide (H2S)",
      carbon_monoxide: "Carbon monoxide (CO)",
      methane: "Methane (CH4)",
      carbon_dioxide: "Carbon dioxide (CO2)",
      ammonia: "Ammonia (NH3)",
      chlorine: "Chlorine (Cl2)",
      welding_fumes: "Welding fumes",
      solvent_vapors: "Solvent vapors"
    },
    
    // Physical hazards
    physicalHazardTypes: {
      engulfment: "Engulfment",
      crushing: "Crushing",
      electrical: "Electrical",
      mechanical: "Mechanical",
      temperature: "Extreme temperatures",
      noise: "Excessive noise",
      radiation: "Radiation",
      falling_objects: "Falling objects",
      slips_falls: "Slips/Falls",
      confined_layout: "Confined layout",
      poor_visibility: "Poor visibility",
      structural_collapse: "Structural collapse"
    }
};

// =================== GÉNÉRATEUR DE NUMÉRO AST UNIQUE ===================
const generateASTNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `AST-${year}${month}${day}-${hour}${minute}${second}-${random}`;
};

// =================== COMPOSANT PRINCIPAL ===================
const Step1ProjectInfo: React.FC<Step1ProjectInfoProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // =================== ÉTATS DU COMPOSANT ===================
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotos, setShowPhotos] = useState(false);
  const [isGeneratingAST, setIsGeneratingAST] = useState(false);
  const [astNumber, setAstNumber] = useState(formData.astNumber || generateASTNumber());
  const [copied, setCopied] = useState(false);
  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>(formData.spacePhotos || []);
  const [confinedSpaceDetails, setConfinedSpaceDetails] = useState<ConfinedSpaceDetails>(
    formData.confinedSpaceDetails || {
      spaceType: '',
      spaceCategory: '',
      entryMethod: '',
      accessType: '',
      dimensions: { length: 0, width: 0, height: 0, diameter: 0, volume: 0 },
      entryPoints: [],
      atmosphericHazards: [],
      physicalHazards: [],
      previousHistory: '',
      lastEntry: '',
      ventilationRequired: false,
      ventilationType: '',
      emergencyEgress: '',
      communicationMethod: '',
      lightingConditions: '',
      temperatureConditions: '',
      moistureLevel: '',
      noiseLevel: '',
      structuralIntegrity: '',
      contents: '',
      residues: '',
      workSpace: '',
      photos: []
    }
  );

  // =================== FONCTIONS UTILITAIRES ===================
  
  // Calculer le volume selon la géométrie
  const calculateVolume = () => {
    const { length, width, height, diameter } = confinedSpaceDetails.dimensions;
    let volume = 0;
    
    if (confinedSpaceDetails.spaceType === 'tank' && diameter && diameter > 0 && height > 0) {
      // Volume cylindrique: π × r² × h
      const radius = diameter / 2;
      volume = Math.PI * radius * radius * height;
    } else if (length > 0 && width > 0 && height > 0) {
      // Volume rectangulaire: l × w × h
      volume = length * width * height;
    }
    
    setConfinedSpaceDetails(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, volume: Math.round(volume * 100) / 100 }
    }));
  };

  // Copier le numéro AST
  const copyASTNumber = async () => {
    try {
      await navigator.clipboard.writeText(astNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Générer un nouveau numéro AST
  const generateNewASTNumber = () => {
    setIsGeneratingAST(true);
    setTimeout(() => {
      const newNumber = generateASTNumber();
      setAstNumber(newNumber);
      onDataChange('astNumber', newNumber);
      setIsGeneratingAST(false);
    }, 500);
  };

  // Ajouter un point d'entrée à l'espace clos
  const addEntryPoint = () => {
    const newEntryPoint = {
      id: `entry_${Date.now()}`,
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      photos: []
    };
    
    const updatedDetails = {
      ...confinedSpaceDetails,
      entryPoints: [...confinedSpaceDetails.entryPoints, newEntryPoint]
    };
    
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  // Gestion des photos
  const handlePhotoCapture = (category: string) => {
    // Simulation de capture photo
    const newPhoto: SpacePhoto = {
      id: `photo_${Date.now()}`,
      url: `https://via.placeholder.com/400x300?text=Photo+${Date.now()}`,
      caption: `Photo ${category} - ${new Date().toLocaleString()}`,
      category: category as any,
      timestamp: new Date().toISOString(),
      location: 'GPS: 45.5017, -73.5673',
      measurements: category.includes('space') ? 'L:2.5m W:1.8m H:2.1m' : undefined
    };

    const updatedPhotos = [...spacePhotos, newPhoto];
    setSpacePhotos(updatedPhotos);
    onDataChange('spacePhotos', updatedPhotos);
  };

  // Gestion des modifications de données
  const handleInputChange = (field: string, value: any) => {
    onDataChange(field, value);
  };

  const handleConfinedSpaceChange = (field: string, value: any) => {
    const updatedDetails = { ...confinedSpaceDetails, [field]: value };
    setConfinedSpaceDetails(updatedDetails);
    onDataChange('confinedSpaceDetails', updatedDetails);
  };

  // =================== RENDU DU COMPOSANT ===================
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .glass-header {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .confined-space-card {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(59, 130, 246, 0.05));
          border: 2px solid rgba(34, 197, 94, 0.2);
        }
        
        .input-field {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        
        .input-field.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          transition: all 0.3s ease;
          transform: translateY(0);
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
          transform: translateY(-1px);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transition: all 0.3s ease;
        }
        
        .btn-danger:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }
        
        .grid-responsive {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        
        .grid-2 {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .grid-3 {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        
        .hazard-selector {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        
        .hazard-item {
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .hazard-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .hazard-item.selected {
          border-color: #3b82f6;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
        }
        
        .volume-calculator {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border: 2px solid rgba(16, 185, 129, 0.2);
        }
        
        .entry-point-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(124, 58, 237, 0.05));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr;
          }
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .photo-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        
        .photo-item {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .photo-item:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* =================== SECTION NUMÉRO AST UNIQUE =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {t.astNumberTitle}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={copyASTNumber}
                className={`btn-secondary px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                  copied ? 'bg-green-500' : ''
                }`}
                disabled={copied}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '✓ Copié!' : t.copyNumber}
              </button>
              <button
                onClick={generateNewASTNumber}
                className="btn-primary px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                disabled={isGeneratingAST}
              >
                {isGeneratingAST ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {t.generateNew}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-xl font-mono font-bold tracking-wider shadow-lg">
            {astNumber}
          </div>
          <p className="text-gray-600 mt-3 text-sm">{t.astNumberGenerated}</p>
        </div>
      </div>

      {/* =================== SECTION ESPACE CLOS COMPLET =================== */}
      <div className="confined-space-card glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Home className="w-7 h-7 text-green-600" />
            {t.confinedSpaceDetails}
          </h2>
        </div>

        {/* Identification de l'espace */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-green-600" />
            {t.spaceIdentification}
          </h3>
          
          <div className="grid-2 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.spaceType}
              </label>
              <div className="grid-responsive">
                {Object.entries(t.spaceTypes).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleConfinedSpaceChange('spaceType', key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                      confinedSpaceDetails.spaceType === key
                        ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white/50 hover:border-green-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{value}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.spaceCategory}
                </label>
                <select
                  value={confinedSpaceDetails.spaceCategory}
                  onChange={(e) => handleConfinedSpaceChange('spaceCategory', e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                >
                  <option value="">{t.select}</option>
                  <option value="class1">Classe 1 - Dangers immédiats</option>
                  <option value="class2">Classe 2 - Dangers potentiels</option>
                  <option value="class3">Classe 3 - Aucun danger identifié</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.entryMethod}
                </label>
                <select
                  value={confinedSpaceDetails.entryMethod}
                  onChange={(e) => handleConfinedSpaceChange('entryMethod', e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                >
                  <option value="">{t.select}</option>
                  <option value="top">Par le haut</option>
                  <option value="side">Par le côté</option>
                  <option value="bottom">Par le bas</option>
                  <option value="multiple">Entrées multiples</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.accessType}
                </label>
                <select
                  value={confinedSpaceDetails.accessType}
                  onChange={(e) => handleConfinedSpaceChange('accessType', e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                >
                  <option value="">{t.select}</option>
                  <option value="manhole">Trou d'homme</option>
                  <option value="hatch">Trappe</option>
                  <option value="door">Porte</option>
                  <option value="removable_cover">Couvercle amovible</option>
                  <option value="cut_opening">Ouverture découpée</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions et volume */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-blue-600" />
            {t.spaceDimensions}
          </h3>
          
          <div className="volume-calculator rounded-xl p-6">
            <div className="grid-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.length}
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
                  className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.width}
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
                  className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.height}
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
                  className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
                />
              </div>

              {(confinedSpaceDetails.spaceType === 'tank' || confinedSpaceDetails.spaceType === 'vessel') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.diameter}
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
                    className="input-field w-full px-3 py-2 rounded-lg bg-white/50"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={calculateVolume}
                className="btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2"
              >
                <Gauge className="w-4 h-4" />
                {t.calculateVolume}
              </button>
              
              {confinedSpaceDetails.dimensions.volume > 0 && (
                <div className="bg-white/80 px-4 py-2 rounded-lg border border-green-300">
                  <span className="text-sm font-medium text-gray-700">
                    {t.volume}: <span className="font-bold text-green-600">
                      {confinedSpaceDetails.dimensions.volume} {t.volumeUnit}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points d'entrée */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            {t.entryPoints}
          </h3>

          <div className="space-y-4">
            {confinedSpaceDetails.entryPoints.map((entryPoint, index) => (
              <div key={entryPoint.id} className="entry-point-card rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  {t.entryPoint}{index + 1}
                </h4>
                
                <div className="grid-2">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.entryType}
                      </label>
                      <select
                        value={entryPoint.type}
                        onChange={(e) => {
                          const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                          updatedEntryPoints[index] = { ...entryPoint, type: e.target.value };
                          handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                        }}
                        className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                      >
                        <option value="circular">Circulaire</option>
                        <option value="rectangular">Rectangulaire</option>
                        <option value="square">Carré</option>
                        <option value="oval">Ovale</option>
                        <option value="irregular">Irrégulière</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.entryDimensions}
                      </label>
                      <input
                        type="text"
                        value={entryPoint.dimensions}
                        onChange={(e) => {
                          const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                          updatedEntryPoints[index] = { ...entryPoint, dimensions: e.target.value };
                          handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                        }}
                        className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                        placeholder="Ex: 60cm x 80cm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.entryLocation}
                      </label>
                      <input
                        type="text"
                        value={entryPoint.location}
                        onChange={(e) => {
                          const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                          updatedEntryPoints[index] = { ...entryPoint, location: e.target.value };
                          handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                        }}
                        className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                        placeholder="Ex: Sommet ouest"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.entryCondition}
                      </label>
                      <select
                        value={entryPoint.condition}
                        onChange={(e) => {
                          const updatedEntryPoints = [...confinedSpaceDetails.entryPoints];
                          updatedEntryPoints[index] = { ...entryPoint, condition: e.target.value };
                          handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                        }}
                        className="input-field w-full px-3 py-2 rounded-lg bg-white/50 text-sm"
                      >
                        <option value="good">Bon état</option>
                        <option value="rust">Rouille présente</option>
                        <option value="damage">Endommagé</option>
                        <option value="stuck">Coincé/Bloqué</option>
                        <option value="missing_parts">Pièces manquantes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <button
                    onClick={() => handlePhotoCapture('entry_point')}
                    className="btn-secondary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {t.entryPhotos} ({entryPoint.photos.length})
                  </button>

                  <button
                    onClick={() => {
                      const updatedEntryPoints = confinedSpaceDetails.entryPoints.filter(ep => ep.id !== entryPoint.id);
                      handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
                    }}
                    className="btn-danger px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addEntryPoint}
              className="w-full border-2 border-dashed border-purple-300 rounded-xl p-6 text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.addEntryPoint}
            </button>
          </div>
        </div>

        {/* Dangers et conditions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {t.contentAndHazards}
          </h3>

          <div className="grid-2 gap-6">
            {/* Dangers atmosphériques */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">
                💨 {t.atmosphericHazards}
              </h4>
              <div className="hazard-selector">
                {Object.entries(t.atmosphericHazardTypes).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const current = confinedSpaceDetails.atmosphericHazards;
                      const updated = current.includes(key)
                        ? current.filter(h => h !== key)
                        : [...current, key];
                      handleConfinedSpaceChange('atmosphericHazards', updated);
                    }}
                    className={`hazard-item p-3 rounded-lg text-sm text-left ${
                      confinedSpaceDetails.atmosphericHazards.includes(key)
                        ? 'selected'
                        : 'bg-white/50 border-gray-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Dangers physiques */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">
                ⚙️ {t.physicalHazards}
              </h4>
              <div className="hazard-selector">
                {Object.entries(t.physicalHazardTypes).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const current = confinedSpaceDetails.physicalHazards;
                      const updated = current.includes(key)
                        ? current.filter(h => h !== key)
                        : [...current, key];
                      handleConfinedSpaceChange('physicalHazards', updated);
                    }}
                    className={`hazard-item p-3 rounded-lg text-sm text-left ${
                      confinedSpaceDetails.physicalHazards.includes(key)
                        ? 'selected'
                        : 'bg-white/50 border-gray-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documentation photographique */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            {t.spaceDocumentation}
          </h3>

          <div className="grid-3">
            {[
              { key: 'space_exterior', label: t.spaceExterior, icon: Home },
              { key: 'space_interior', label: t.spaceInterior, icon: Eye },
              { key: 'entry_point', label: t.entryPointPhoto, icon: Layers },
              { key: 'hazard_identification', label: t.hazardIdentification, icon: AlertTriangle },
              { key: 'equipment_staging', label: t.equipmentStaging, icon: Settings },
              { key: 'atmospheric_testing', label: t.atmosphericTesting, icon: Activity }
            ].map(({ key, label, icon: IconComponent }) => {
              const categoryPhotos = spacePhotos.filter(photo => photo.category === key);
              return (
                <button
                  key={key}
                  onClick={() => handlePhotoCapture(key)}
                  className="p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 text-center"
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium text-gray-800">{label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {categoryPhotos.length} photo{categoryPhotos.length !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Affichage des photos */}
          {spacePhotos.length > 0 && (
            <div className="mt-6 p-4 bg-white/50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-3">
                Photos Récentes ({spacePhotos.length})
              </h4>
              <div className="photo-grid">
                {spacePhotos.slice(-8).map((photo) => (
                  <div
                    key={photo.id}
                    className="photo-item"
                    onClick={() => {
                      setCurrentPhotoIndex(spacePhotos.findIndex(p => p.id === photo.id));
                      setShowPhotos(true);
                    }}
                  >
                    <div
                      className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        backgroundImage: `url(${photo.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <Camera className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================== CARROUSEL PHOTOS =================== */}
      {showPhotos && spacePhotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPhotos(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative">
              <img
                src={spacePhotos[currentPhotoIndex]?.url}
                alt={spacePhotos[currentPhotoIndex]?.caption}
                className="max-w-full max-h-[80vh] rounded-lg"
              />

              {spacePhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex(prev => 
                      prev === 0 ? spacePhotos.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setCurrentPhotoIndex(prev => 
                      prev === spacePhotos.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-white text-center">
              <h3 className="text-lg font-medium">{spacePhotos[currentPhotoIndex]?.caption}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {spacePhotos[currentPhotoIndex]?.timestamp} • {spacePhotos[currentPhotoIndex]?.location}
              </p>
              {spacePhotos[currentPhotoIndex]?.measurements && (
                <p className="text-sm text-gray-300 mt-1">
                  📏 {spacePhotos[currentPhotoIndex]?.measurements}
                </p>
              )}
            </div>

            {spacePhotos.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {spacePhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1ProjectInfo;

      {/* =================== SECTION INFORMATIONS CLIENT =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Building className="w-7 h-7 text-blue-600" />
            {t.clientInfo}
          </h2>
        </div>

        <div className="grid-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.clientName} {errors?.clientName && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.clientName || ''}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className={`input-field w-full px-4 py-3 rounded-lg bg-white/50 ${
                  errors?.clientName ? 'error' : ''
                }`}
                placeholder={t.clientNamePlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.clientPhone}
              </label>
              <input
                type="tel"
                value={formData.clientPhone || ''}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.clientPhonePlaceholder}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.clientRepresentative}
              </label>
              <input
                type="text"
                value={formData.clientRepresentative || ''}
                onChange={(e) => handleInputChange('clientRepresentative', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.clientRepPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.repPhone}
              </label>
              <input
                type="tel"
                value={formData.repPhone || ''}
                onChange={(e) => handleInputChange('repPhone', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.repPhonePlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================== SECTION DÉTAILS DU PROJET =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-7 h-7 text-green-600" />
            {t.projectDetails}
          </h2>
        </div>

        <div className="grid-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.projectNumber}
            </label>
            <input
              type="text"
              value={formData.projectNumber || ''}
              onChange={(e) => handleInputChange('projectNumber', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              placeholder={t.projectNumberPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.astClientNumber}
              <span className="text-xs text-gray-500 block">{t.astClientHelp}</span>
            </label>
            <input
              type="text"
              value={formData.astClientNumber || ''}
              onChange={(e) => handleInputChange('astClientNumber', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
              placeholder={t.astClientPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t.date}
              </label>
              <input
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input-field w-full px-3 py-3 rounded-lg bg-white/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t.time}
              </label>
              <input
                type="time"
                value={formData.time || new Date().toTimeString().split(' ')[0].slice(0, 5)}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="input-field w-full px-3 py-3 rounded-lg bg-white/50 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================== SECTION LOCALISATION =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="w-7 h-7 text-red-600" />
            {t.location}
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.workLocation}
            </label>
            <textarea
              value={formData.workLocation || ''}
              onChange={(e) => handleInputChange('workLocation', e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg bg-white/50 h-20 resize-none"
              placeholder={t.workLocationPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t.industryType}
            </label>
            <div className="grid-responsive">
              {Object.entries(t).filter(([key]) => ['electrical', 'construction', 'industrial', 'manufacturing', 'office', 'wastewater', 'mining', 'petrochemical', 'marine', 'food', 'pharmaceutical', 'other'].includes(key)).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleInputChange('industryType', key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    formData.industryType === key
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className="font-medium text-gray-800">{value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================== SECTION ÉQUIPE ET CONTACTS D'URGENCE =================== */}
      <div className="grid-2">
        {/* Équipe de travail */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              {t.team}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.workerCount}
                <span className="text-xs text-gray-500 block">{t.workerCountHelp}</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.workerCount || ''}
                onChange={(e) => handleInputChange('workerCount', parseInt(e.target.value) || 0)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.workerCountPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.estimatedDuration}
              </label>
              <input
                type="text"
                value={formData.estimatedDuration || ''}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.durationPlaceholder}
              />
            </div>
          </div>
        </div>

        {/* Contacts d'urgence */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              {t.emergency}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.emergencyContact}
              </label>
              <input
                type="text"
                value={formData.emergencyContact || ''}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.emergencyContactPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.emergencyPhone}
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone || ''}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg bg-white/50"
                placeholder={t.emergencyPhonePlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================== SECTION DESCRIPTION DES TRAVAUX =================== */}
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="glass-header -m-6 mb-6 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            {t.workDescription}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.workDescriptionLabel}
            </label>
            <textarea
              value={formData.workDescription || ''}
              onChange={(e) => handleInputChange('workDescription', e.target.value)}
              className="input-field w-full px-4 py-4 rounded-lg bg-white/50 h-40 resize-none"
              placeholder={t.workDescriptionPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-2">{t.workDescriptionHelp}</p>
          </div>
        </div>
      </div>
