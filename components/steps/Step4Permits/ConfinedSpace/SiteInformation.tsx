"use client";

import React, { useState, useRef } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase, 
  Copy, Check, AlertTriangle, Camera, Upload, X, Settings, Wrench, Droplets, 
  Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home, Layers, 
  Ruler, Gauge, Thermometer, Activity, Shield, Zap, Save, Download, 
  Mail, MessageSquare, Share, Printer, CheckCircle, Search, Database, QrCode
} from 'lucide-react';
import { styles, isMobile } from './styles';

// =================== TYPES ET INTERFACES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

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

interface SiteInformationProps {
  permitData: any;
  updatePermitData: (updates: any) => void;
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, RegulationData>;
  isMobile: boolean;
  language: 'fr' | 'en';
  styles: any;
  updateParentData: (section: string, data: any) => void;
}

interface SpacePhoto {
  id: string;
  url: string;
  category: string;
  caption: string;
  timestamp: string;
  location: string;
  measurements?: string;
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

  // Photos de l'espace - AJOUTÉ POUR CORRIGER L'ERREUR
  spacePhotos: SpacePhoto[];
}

interface PermitReport {
  metadata: {
    permitNumber: string;
    issueDate: string;
    province: string;
    authority: string;
    generatedAt: string;
  };
  siteInformation: ConfinedSpaceDetails;
  atmosphericTesting: any;
  entryRegistry: any;
  rescuePlan: any;
}

interface RegulationData {
  name: string;
  authority: string;
  authority_phone: string;
  code: string;
  url?: string;
  atmospheric_testing: {
    frequency_minutes: number;
    continuous_monitoring_required?: boolean;
    documentation_required?: boolean;
    limits: any;
  };
  personnel_requirements: {
    min_age: number;
    attendant_required: boolean;
    bidirectional_communication_required?: boolean;
    rescue_plan_required?: boolean;
    competent_person_required?: boolean;
    max_work_period_hours?: number;
  };
  emergency_contacts: Array<{
    name: string;
    role: string;
    phone: string;
    available_24h: boolean;
  }>;
}

// =================== TRADUCTIONS ===================
const getTranslations = (language: 'fr' | 'en') => ({
  fr: {
    title: "Informations du Site - Espace Clos",
    subtitle: "Identification et évaluation complète de l'espace de travail confiné",
    
    // Actions du permis
    permitActions: "Actions du Permis",
    generateReport: "Générer Rapport",
    printPermit: "Imprimer PDF",
    emailPermit: "Envoyer par Email",
    sendSMS: "Envoyer par SMS",
    downloadData: "Télécharger Données",
    shareLink: "Partager Lien",
    
    // Informations du projet
    projectInfo: "Informations du Projet",
    projectNumber: "Numéro de projet",
    workLocation: "Lieu des travaux",
    contractor: "Entrepreneur",
    supervisor: "Superviseur",
    entryDate: "Date d'entrée prévue",
    duration: "Durée estimée",
    workerCount: "Nombre de travailleurs",
    workDescription: "Description des travaux",
    
    // Identification de l'espace
    spaceIdentification: "Identification de l'Espace Clos",
    spaceType: "Type d'espace",
    csaClass: "Classification CSA",
    entryMethod: "Méthode d'entrée",
    accessType: "Type d'accès",
    spaceLocation: "Localisation de l'espace",
    spaceDescription: "Description de l'espace",
    
    // Types d'espaces
    spaceTypes: {
      tank: "🏗️ Réservoir",
      vessel: "⚗️ Cuve/Récipient",
      silo: "🌾 Silo",
      pit: "🕳️ Fosse",
      vault: "🏛️ Voûte",
      tunnel: "🚇 Tunnel",
      trench: "🚧 Tranchée",
      manhole: "🔧 Regard d'égout",
      storage: "📦 Espace de stockage",
      boiler: "🔥 Chaudière",
      duct: "🌪️ Conduit",
      chamber: "🏢 Chambre",
      other: "❓ Autre"
    },
    
    // Classifications CSA
    csaClasses: {
      class1: "Classe 1 - Danger immédiat pour la vie",
      class2: "Classe 2 - Risque potentiel",
      class3: "Classe 3 - Risque minimal"
    },
    
    // Dimensions et volume
    spaceDimensions: "Dimensions et Volume",
    length: "Longueur (m)",
    width: "Largeur (m)",
    height: "Hauteur (m)",
    diameter: "Diamètre (m)",
    calculateVolume: "Calculer le Volume",
    volume: "Volume calculé",
    volumeUnit: "m³",
    
    // Points d'entrée
    entryPoints: "Points d'Entrée et Accès",
    entryPoint: "Point d'entrée ",
    entryType: "Type d'entrée",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "État",
    entryAccessibility: "Accessibilité",
    entryPhotos: "Photos",
    addEntryPoint: "Ajouter un point d'entrée",
    remove: "Supprimer",
    
    // Évaluation des dangers
    hazardAssessment: "Évaluation des Dangers",
    selectHazards: "Sélectionnez tous les dangers présents ou potentiels",
    atmosphericHazards: "Dangers Atmosphériques",
    physicalHazards: "Dangers Physiques",
    
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
    environmentalConditions: "Conditions Environnementales",
    ventilationRequired: "Ventilation requise",
    ventilationType: "Type de ventilation",
    lightingConditions: "Conditions d'éclairage",
    temperatureRange: "Plage de température",
    moistureLevel: "Niveau d'humidité",
    noiseLevel: "Niveau de bruit",
    weatherConditions: "Conditions météorologiques",
    yes: "Oui",
    no: "Non",
    select: "Sélectionner",
    
    // Contenu de l'espace
    spaceContent: "Contenu et Historique de l'Espace",
    contents: "Contenu actuel",
    residues: "Résidus/Substances",
    previousUse: "Usage antérieur",
    lastEntry: "Dernière entrée",
    cleaningStatus: "État de nettoyage",
    
    // Mesures de sécurité
    safetyMeasures: "Mesures de Sécurité",
    emergencyEgress: "Plan de sortie d'urgence",
    communicationMethod: "Méthode de communication",
    monitoringEquipment: "Équipement de surveillance",
    ventilationEquipment: "Équipement de ventilation",
    emergencyEquipment: "Équipement d'urgence",
    
    // Documentation photographique
    photoDocumentation: "Documentation Photographique",
    spaceExterior: "Extérieur de l'espace",
    spaceInterior: "Intérieur de l'espace",
    entryPointPhoto: "Points d'entrée",
    hazardIdentification: "Identification des dangers",
    equipmentStaging: "Mise en place équipement",
    atmosphericTesting: "Tests atmosphériques",
    safetyEquipment: "Équipement de sécurité",
    ventilationSystem: "Système de ventilation",
    
    // Boutons et actions
    save: "Sauvegarder",
    cancel: "Annuler",
    next: "Suivant",
    previous: "Précédent",
    loading: "Chargement...",
    generating: "Génération...",
    success: "Succès!",
    addPhoto: "Ajouter photo",
    addPhotoDescription: "Documenter avec une photo",
    noPhotos: "Aucune photo",
    clickToPhoto: "Cliquez pour prendre une photo"
  },
  en: {
    title: "Site Information - Confined Space",
    subtitle: "Complete identification and assessment of the confined workspace",
    
    // Actions du permis
    permitActions: "Permit Actions",
    generateReport: "Generate Report",
    printPermit: "Print PDF",
    emailPermit: "Send by Email",
    sendSMS: "Send by SMS",
    downloadData: "Download Data",
    shareLink: "Share Link",
    
    // Informations du projet
    projectInfo: "Project Information",
    projectNumber: "Project number",
    workLocation: "Work location",
    contractor: "Contractor",
    supervisor: "Supervisor",
    entryDate: "Planned entry date",
    duration: "Estimated duration",
    workerCount: "Number of workers",
    workDescription: "Work description",
    
    // Identification de l'espace
    spaceIdentification: "Confined Space Identification",
    spaceType: "Space type",
    csaClass: "CSA Classification",
    entryMethod: "Entry method",
    accessType: "Access type",
    spaceLocation: "Space location",
    spaceDescription: "Space description",
    
    // Types d'espaces
    spaceTypes: {
      tank: "🏗️ Tank",
      vessel: "⚗️ Vessel/Container",
      silo: "🌾 Silo",
      pit: "🕳️ Pit",
      vault: "🏛️ Vault",
      tunnel: "🚇 Tunnel",
      trench: "🚧 Trench",
      manhole: "🔧 Manhole",
      storage: "📦 Storage space",
      boiler: "🔥 Boiler",
      duct: "🌪️ Duct",
      chamber: "🏢 Chamber",
      other: "❓ Other"
    },
    
    // Classifications CSA
    csaClasses: {
      class1: "Class 1 - Immediate danger to life",
      class2: "Class 2 - Potential risk",
      class3: "Class 3 - Minimal risk"
    },
    
    // Dimensions et volume
    spaceDimensions: "Dimensions and Volume",
    length: "Length (m)",
    width: "Width (m)",
    height: "Height (m)",
    diameter: "Diameter (m)",
    calculateVolume: "Calculate Volume",
    volume: "Calculated volume",
    volumeUnit: "m³",
    
    // Points d'entrée
    entryPoints: "Entry Points and Access",
    entryPoint: "Entry point ",
    entryType: "Entry type",
    entryDimensions: "Dimensions",
    entryLocation: "Location",
    entryCondition: "Condition",
    entryAccessibility: "Accessibility",
    entryPhotos: "Photos",
    addEntryPoint: "Add entry point",
    remove: "Remove",
    
    // Évaluation des dangers
    hazardAssessment: "Hazard Assessment",
    selectHazards: "Select all present or potential hazards",
    atmosphericHazards: "Atmospheric Hazards",
    physicalHazards: "Physical Hazards",
    
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
    environmentalConditions: "Environmental Conditions",
    ventilationRequired: "Ventilation required",
    ventilationType: "Ventilation type",
    lightingConditions: "Lighting conditions",
    temperatureRange: "Temperature range",
    moistureLevel: "Moisture level",
    noiseLevel: "Noise level",
    weatherConditions: "Weather conditions",
    yes: "Yes",
    no: "No",
    select: "Select",
    
    // Contenu de l'espace
    spaceContent: "Space Content and History",
    contents: "Current contents",
    residues: "Residues/Substances",
    previousUse: "Previous use",
    lastEntry: "Last entry",
    cleaningStatus: "Cleaning status",
    
    // Mesures de sécurité
    safetyMeasures: "Safety Measures",
    emergencyEgress: "Emergency egress plan",
    communicationMethod: "Communication method",
    monitoringEquipment: "Monitoring equipment",
    ventilationEquipment: "Ventilation equipment",
    emergencyEquipment: "Emergency equipment",
    
    // Documentation photographique
    photoDocumentation: "Photographic Documentation",
    spaceExterior: "Space exterior",
    spaceInterior: "Space interior",
    entryPointPhoto: "Entry points",
    hazardIdentification: "Hazard identification",
    equipmentStaging: "Equipment staging",
    atmosphericTesting: "Atmospheric testing",
    safetyEquipment: "Safety equipment",
    ventilationSystem: "Ventilation system",
    
    // Boutons et actions
    save: "Save",
    cancel: "Cancel",
    next: "Next",
    previous: "Previous",
    loading: "Loading...",
    generating: "Generating...",
    success: "Success!",
    addPhoto: "Add photo",
    addPhotoDescription: "Document with photo",
    noPhotos: "No photos",
    clickToPhoto: "Click to take a photo"
  }
});

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

    // Photos de l'espace - AJOUTÉ POUR CORRIGER L'ERREUR
    spacePhotos: permitData.spacePhotos || []
  });

  const [spacePhotos, setSpacePhotos] = useState<SpacePhoto[]>(permitData.spacePhotos || []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotos, setShowPhotos] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // États pour la recherche et l'historique des permis
  const [showPermitDatabase, setShowPermitDatabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PermitSearchResult>({
    permits: [],
    total: 0,
    page: 1,
    hasMore: false
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHistoryPermit, setSelectedHistoryPermit] = useState<PermitHistoryEntry | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<string>('');

  // Réf pour upload de photos
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Traductions
  const t = getTranslations(language);
  // =================== FONCTIONS DE RECHERCHE ET BASE DE DONNÉES ===================

  // =================== FONCTIONS DE RECHERCHE ET BASE DE DONNÉES ===================

  // Recherche dans la base de données des permis
  const searchPermitsDatabase = async (query: string, page: number = 1): Promise<PermitSearchResult> => {
    setIsSearching(true);
    try {
      // Import dynamique du client Supabase
      const { supabase } = await import('../../../lib/supabase');
      
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
          hazard_count
        `)
        .order('created_at', { ascending: false });

      // Si une requête est fournie, filtrer les résultats
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`
          permit_number.ilike.%${query}%,
          project_number.ilike.%${query}%,
          work_location.ilike.%${query}%,
          contractor.ilike.%${query}%
        `);
      }

      // Pagination
      const startRange = (page - 1) * 10;
      const endRange = page * 10 - 1;
      queryBuilder = queryBuilder.range(startRange, endRange);

      const { data, error, count } = await queryBuilder;

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      // Transformation des données pour correspondre à notre interface
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
        hazardCount: permit.hazard_count || 0
      }));

      return {
        permits,
        total: count || 0,
        page: page,
        hasMore: (count || 0) > page * 10
      };

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      
      // Fallback vers les données mockées en cas d'erreur
      const mockPermits: PermitHistoryEntry[] = [
        {
          id: '1',
          permitNumber: 'CS-QC-20250730-ABC123',
          projectNumber: 'P-2024-001',
          workLocation: 'Site industriel Montreal',
          contractor: 'Construction ABC Inc.',
          spaceType: 'tank',
          csaClass: 'class2',
          entryDate: '2025-07-30T08:00:00',
          status: 'active',
          createdAt: '2025-07-30T06:00:00',
          lastModified: '2025-07-30T07:30:00',
          entryCount: 3,
          hazardCount: 5
        }
      ];

      const filteredPermits = query 
        ? mockPermits.filter(permit => 
            permit.permitNumber.toLowerCase().includes(query.toLowerCase()) ||
            permit.projectNumber.toLowerCase().includes(query.toLowerCase()) ||
            permit.workLocation.toLowerCase().includes(query.toLowerCase()) ||
            permit.contractor.toLowerCase().includes(query.toLowerCase())
          )
        : mockPermits;

      return {
        permits: filteredPermits,
        total: filteredPermits.length,
        page: page,
        hasMore: false
      };
    } finally {
      setIsSearching(false);
    }
  };

  // Charger un permis existant depuis l'historique
  const loadPermitFromHistory = async (permitNumber: string) => {
    try {
      const { supabase } = await import('../../../lib/supabase');
      
      const { data, error } = await supabase
        .from('confined_space_permits')
        .select('*')
        .eq('permit_number', permitNumber)
        .single();

      if (error) {
        console.error('Erreur chargement permis:', error);
        throw error;
      }

      if (data) {
        // Mapper les données Supabase vers notre état local
        const loadedPermit = {
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
          entryMethod: '',
          accessType: '',
          spaceLocation: '',
          spaceDescription: '',
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

        // Mettre à jour l'état avec les données chargées
        setConfinedSpaceDetails(loadedPermit);
        setSpacePhotos(data.space_photos || []);
        
        // Mettre à jour les données du permis parent
        updatePermitData({
          permit_number: data.permit_number,
          ...loadedPermit
        });

        alert(`✅ Permis ${permitNumber} chargé avec succès!\n\nToutes les données ont été restaurées dans le formulaire.`);
      }
      
      // Fermer la base de données après chargement
      setShowPermitDatabase(false);
      setSelectedHistoryPermit(null);
      
    } catch (error) {
      console.error('Erreur lors du chargement du permis:', error);
      alert('❌ Erreur lors du chargement du permis. Vérifiez que le permis existe.');
    }
  };

  // Sauvegarder le permis actuel dans la base de données
  const savePermitToDatabase = async () => {
    try {
      const { supabase } = await import('../../../lib/supabase');
      
      const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Générer le QR Code
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
        entry_count: 0
      };

      const { data, error } = await supabase
        .from('confined_space_permits')
        .upsert(permitToSave, { 
          onConflict: 'permit_number',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur sauvegarde:', error);
        throw error;
      }

      // Mettre à jour le numéro de permis dans l'état
      updatePermitData({ permit_number: permitNumber });
      
      alert(`✅ Permis ${permitNumber} sauvegardé avec succès!\n\n📊 Données: ${JSON.stringify(permitToSave, null, 2).length} caractères\n🔗 QR Code: ${qrCodeDataUrl ? 'Généré' : 'Erreur'}\n📅 ${new Date().toLocaleString('fr-CA')}`);
      
  // Traitement des données QR scannées
  const handleQRScan = async (qrData: string) => {
    try {
      // Tenter de parser les données JSON du QR
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.permitNumber && parsedData.type === 'confined_space') {
        await loadPermitFromHistory(parsedData.permitNumber);
        setScannedQRData('');
        setShowQRScanner(false);
      } else {
        // Traiter comme un simple numéro de permis
        await loadPermitFromHistory(qrData);
        setScannedQRData('');
        setShowQRScanner(false);
      }
    } catch (error) {
      // Si ce n'est pas du JSON, traiter comme un numéro de permis simple
      if (qrData.trim()) {
        await loadPermitFromHistory(qrData.trim());
        setScannedQRData('');
        setShowQRScanner(false);
      } else {
        alert('Code QR invalide ou non reconnu.');
      }
    }
  };

  // Effectuer une recherche
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults({ permits: [], total: 0, page: 1, hasMore: false });
      return;
    }
    
    const results = await searchPermitsDatabase(query);
    setSearchResults(results);
  };
  
  // Calcul du volume automatique basé sur le type d'espace
  const calculateVolume = () => {
    const { length, width, height, diameter } = confinedSpaceDetails.dimensions;
    let volume = 0;
    let formulaUsed = '';

    // Sélection de la formule basée sur le type d'espace
    switch (confinedSpaceDetails.spaceType) {
      case 'tank':
      case 'vessel':
      case 'silo':
      case 'boiler':
        // Forme cylindrique: π × r² × h
        if (diameter > 0 && height > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
          formulaUsed = `Cylindrique: π × (${radius})² × ${height}`;
        }
        break;
        
      case 'pit':
        // Fosse peut être circulaire ou rectangulaire
        if (diameter > 0 && height > 0) {
          // Fosse circulaire
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
          formulaUsed = `Fosse circulaire: π × (${radius})² × ${height}`;
        } else if (length > 0 && width > 0 && height > 0) {
          // Fosse rectangulaire
          volume = length * width * height;
          formulaUsed = `Fosse rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
        
      case 'tunnel':
      case 'duct':
        // Tunnel/conduit cylindrique
        if (diameter > 0 && length > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * length;
          formulaUsed = `Tunnel cylindrique: π × (${radius})² × ${length}`;
        } else if (width > 0 && height > 0 && length > 0) {
          // Tunnel rectangulaire
          volume = length * width * height;
          formulaUsed = `Tunnel rectangulaire: ${length} × ${width} × ${height}`;
        }
        break;
        
      case 'vault':
      case 'chamber':
      case 'storage':
      case 'trench':
      default:
        // Forme rectangulaire par défaut: L × l × h
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
    
    // Affichage de la formule utilisée
    console.log(`Volume calculé: ${updatedDimensions.volume} m³ - Formule: ${formulaUsed}`);
  };

  // Gestion de la capture photo avec géolocalisation
  const handlePhotoCapture = (category: string) => {
    if (photoInputRef.current) {
      photoInputRef.current.accept = "image/*";
      photoInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const newPhoto: SpacePhoto = {
              id: `photo-${Date.now()}`,
              url: event.target?.result as string,
              category,
              caption: `${t[category as keyof typeof t] || category} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
              timestamp: new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA'),
              location: 'Localisation en cours...',
              measurements: category === 'spaceInterior' || category === 'entryPointPhoto' 
                ? 'Mesures à ajouter' 
                : undefined
            };

            // Géolocalisation si disponible
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                setSpacePhotos(prev => [...prev, newPhoto]);
              }, () => {
                newPhoto.location = 'Localisation non disponible';
                setSpacePhotos(prev => [...prev, newPhoto]);
              });
            } else {
              newPhoto.location = 'Localisation non disponible';
              setSpacePhotos(prev => [...prev, newPhoto]);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  };

  // Ajout d'un point d'entrée avec validation
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

  // Suppression d'un point d'entrée
  const removeEntryPoint = (entryId: string) => {
    const updatedEntryPoints = confinedSpaceDetails.entryPoints.filter(entry => entry.id !== entryId);
    handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
  };

  // Mise à jour d'un point d'entrée spécifique
  const updateEntryPoint = (entryId: string, field: string, value: any) => {
    const updatedEntryPoints = confinedSpaceDetails.entryPoints.map(entry =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    );
    handleConfinedSpaceChange('entryPoints', updatedEntryPoints);
  };

  // Gestion des dangers atmosphériques avec validation
  const toggleAtmosphericHazard = (hazardType: string) => {
    const currentHazards = confinedSpaceDetails.atmosphericHazards;
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    handleConfinedSpaceChange('atmosphericHazards', updatedHazards);
  };

  // Gestion des dangers physiques avec validation
  const togglePhysicalHazard = (hazardType: string) => {
    const currentHazards = confinedSpaceDetails.physicalHazards;
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    handleConfinedSpaceChange('physicalHazards', updatedHazards);
  };

  // =================== FONCTIONS DE GÉNÉRATION DE RAPPORT ===================

  // Génération du rapport complet avec métadonnées - CORRIGÉ
  const generateCompletePermitReport = async (): Promise<PermitReport> => {
    const permitNumber = permitData.permit_number || `CS-${selectedProvince}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    return {
      metadata: {
        permitNumber,
        issueDate: new Date().toISOString(),
        province: selectedProvince,
        authority: PROVINCIAL_REGULATIONS[selectedProvince].authority,
        generatedAt: new Date().toISOString()
      },
      siteInformation: {
        ...confinedSpaceDetails,
        // Assurer que spacePhotos est inclus dans l'objet siteInformation
        spacePhotos: spacePhotos
      },
      atmosphericTesting: permitData.atmosphericTesting || {},
      entryRegistry: permitData.entryRegistry || {},
      rescuePlan: permitData.rescuePlan || {}
    };
  };

  // Génération du QR Code pour le permis
  const generatePermitQRCode = async (permitNumber: string): Promise<string> => {
    try {
      // Importer la fonction depuis utils - CHEMIN CORRIGÉ
      const { generateQRCode } = await import('../../../../app/utils/generateQRCode');
      
      // URL vers le permis (à adapter selon votre structure)
      const permitUrl = `${window.location.origin}/permits/${permitNumber}`;
      
      // Données JSON complètes du permis pour QR plus riche
      const qrData = {
        permitNumber,
        type: 'confined_space',
        province: selectedProvince,
        issueDate: new Date().toISOString(),
        url: permitUrl,
        projectNumber: confinedSpaceDetails.projectNumber,
        location: confinedSpaceDetails.workLocation,
        spaceType: confinedSpaceDetails.spaceType,
        csaClass: confinedSpaceDetails.csaClass,
        hazardCount: confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length
      };
      
      return await generateQRCode(JSON.stringify(qrData));
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      // Fallback vers QR simple avec juste le numéro
      try {
        const { generateQRCode } = await import('../../../../app/utils/generateQRCode');
        return await generateQRCode(permitNumber);
      } catch (fallbackError) {
        console.error('Erreur QR Code fallback:', fallbackError);
        return '';
      }
    }
  };

  // Impression du permis avec mise en page professionnelle
  const handlePrintPermit = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      
      // Création d'une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Permis d'Espace Clos - ${report.metadata.permitNumber}</title>
              <meta charset="utf-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  color: #333;
                  line-height: 1.6;
                }
                .header { 
                  border-bottom: 3px solid #dc2626; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                  text-align: center;
                }
                .header h1 {
                  color: #dc2626;
                  margin: 0 0 10px 0;
                  font-size: 28px;
                }
                .permit-number {
                  background: #dc2626;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 4px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 10px 0;
                }
                .section { 
                  margin-bottom: 30px; 
                  page-break-inside: avoid;
                }
                .section h2 { 
                  color: #1f2937; 
                  border-left: 4px solid #3b82f6; 
                  padding-left: 15px;
                  background: #f8fafc;
                  padding: 10px 15px;
                  margin: 0 0 15px 0;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin-bottom: 20px;
                }
                .info-item {
                  border: 1px solid #e5e7eb;
                  padding: 12px;
                  border-radius: 6px;
                  background: #f9fafb;
                }
                .info-label {
                  font-weight: bold;
                  color: #374151;
                  margin-bottom: 5px;
                }
                .info-value {
                  color: #6b7280;
                }
                .hazard-list {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10px;
                  margin: 15px 0;
                }
                .hazard-item {
                  background: #fef2f2;
                  border: 1px solid #fecaca;
                  padding: 8px 12px;
                  border-radius: 4px;
                  font-size: 14px;
                }
                .footer {
                  margin-top: 40px;
                  border-top: 2px solid #e5e7eb;
                  padding-top: 20px;
                  text-align: center;
                  color: #6b7280;
                  font-size: 12px;
                }
                @media print { 
                  body { margin: 0; }
                  .section { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🚨 PERMIS D'ENTRÉE EN ESPACE CLOS</h1>
                <div class="permit-number">${report.metadata.permitNumber}</div>
                <p><strong>Province:</strong> ${report.metadata.province} - ${report.metadata.authority}</p>
                <p><strong>Date d'émission:</strong> ${new Date(report.metadata.issueDate).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</p>
              </div>

              <div class="section">
                <h2>📋 INFORMATIONS DU PROJET</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Numéro de projet</div>
                    <div class="info-value">${report.siteInformation.projectNumber || 'Non spécifié'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Lieu des travaux</div>
                    <div class="info-value">${report.siteInformation.workLocation || 'Non spécifié'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Entrepreneur</div>
                    <div class="info-value">${report.siteInformation.contractor || 'Non spécifié'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Superviseur</div>
                    <div class="info-value">${report.siteInformation.supervisor || 'Non spécifié'}</div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h2>🏗️ IDENTIFICATION DE L'ESPACE CLOS</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Type d'espace</div>
                    <div class="info-value">${report.siteInformation.spaceType || 'Non spécifié'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Classification CSA</div>
                    <div class="info-value">${report.siteInformation.csaClass || 'Non spécifiée'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Dimensions</div>
                    <div class="info-value">L: ${report.siteInformation.dimensions?.length || 0}m × l: ${report.siteInformation.dimensions?.width || 0}m × H: ${report.siteInformation.dimensions?.height || 0}m</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Volume calculé</div>
                    <div class="info-value">${report.siteInformation.dimensions?.volume || 0} m³</div>
                  </div>
                </div>
                
                <!-- Code QR généré automatiquement -->
                <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
                  <h3 style="color: #0c4a6e; margin: 0 0 10px 0;">Code QR - Accès Numérique</h3>
                  <div style="width: 120px; height: 120px; margin: 0 auto; background: white; border: 2px solid #0ea5e9; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b;">
                    QR: ${report.metadata.permitNumber}
                  </div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569;">Scannez pour accéder aux détails complets du permis</p>
                </div>
              </div>

              ${(report.siteInformation.atmosphericHazards && report.siteInformation.atmosphericHazards.length > 0) || (report.siteInformation.physicalHazards && report.siteInformation.physicalHazards.length > 0) ? `
                <div class="section">
                  <h2>⚠️ DANGERS IDENTIFIÉS</h2>
                  ${report.siteInformation.atmosphericHazards && report.siteInformation.atmosphericHazards.length > 0 ? `
                    <h3 style="color: #dc2626; margin: 15px 0 10px 0;">Dangers Atmosphériques</h3>
                    <div class="hazard-list">
                      ${report.siteInformation.atmosphericHazards.map((hazard: string) => `
                        <div class="hazard-item">🌪️ ${hazard.replace(/_/g, ' ')}</div>
                      `).join('')}
                    </div>
                  ` : ''}
                  ${report.siteInformation.physicalHazards && report.siteInformation.physicalHazards.length > 0 ? `
                    <h3 style="color: #dc2626; margin: 15px 0 10px 0;">Dangers Physiques</h3>
                    <div class="hazard-list">
                      ${report.siteInformation.physicalHazards.map((hazard: string) => `
                        <div class="hazard-item">⚡ ${hazard.replace(/_/g, ' ')}</div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              
              <div class="footer">
                <p><strong>Document généré automatiquement</strong> - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</p>
                <p>Ce permis doit être affiché sur le site et accessible à tous les travailleurs</p>
                <p style="color: #dc2626; font-weight: bold;">⚠️ ATTENTION: Ce permis n'est valide qu'après validation complète de tous les éléments de sécurité</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Envoi par email avec modèle professionnel
  const handleEmailPermit = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const subject = `Permis d'Espace Clos - ${report.metadata.permitNumber}`;
      const body = `Bonjour,

Veuillez trouver ci-joint le permis d'entrée en espace clos suivant :

📋 DÉTAILS DU PERMIS
• Numéro: ${report.metadata.permitNumber}
• Projet: ${report.siteInformation.projectNumber || 'Non spécifié'}
• Lieu: ${report.siteInformation.workLocation || 'Non spécifié'}
• Date d'émission: ${new Date(report.metadata.issueDate).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
• Autorité: ${report.metadata.authority}

⚠️ IMPORTANT: Ce document doit être affiché sur le site et tous les travailleurs doivent en prendre connaissance avant l'entrée.

Cordialement,
Système C-SECUR360`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Envoi par SMS optimisé
  const handleSendSMS = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const message = `🚨 Permis Espace Clos ${report.metadata.permitNumber}
📋 Projet: ${report.siteInformation.projectNumber || 'Non spécifié'}
📍 Lieu: ${report.siteInformation.workLocation || 'Non spécifié'}
📅 ${new Date(report.metadata.issueDate).toLocaleDateString()}
⚠️ Validation requise avant entrée`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Permis d\'Espace Clos',
          text: message
        });
      } else {
        const smsLink = `sms:?body=${encodeURIComponent(message)}`;
        window.open(smsLink);
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Téléchargement des données JSON avec structure complète
  const handleDownloadData = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `permis-espace-clos-${report.metadata.permitNumber}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Partage de lien avec données de contexte
  const handleShareLink = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateCompletePermitReport();
      const shareData = {
        title: `Permis d'Espace Clos - ${report.metadata.permitNumber}`,
        text: `📋 Projet: ${report.siteInformation.projectNumber || 'Non spécifié'}
📍 ${report.siteInformation.workLocation || 'Non spécifié'}
🏗️ Type: ${report.siteInformation.spaceType || 'Non spécifié'}
📅 ${new Date(report.metadata.issueDate).toLocaleDateString()}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        const textToShare = `${shareData.title}\n\n${shareData.text}\n\n🔗 ${shareData.url}`;
        await navigator.clipboard.writeText(textToShare);
        alert('Informations copiées dans le presse-papiers!');
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // =================== HANDLERS DE DONNÉES ===================
  
  const handleConfinedSpaceChange = (field: string, value: any) => {
    setConfinedSpaceDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Synchronisation avec les données du permis
    updatePermitData({
      [field]: value
    });
    
    // Notification au parent
    updateParentData('siteInformation', {
      ...confinedSpaceDetails,
      [field]: value
    });
  };

  const handleEnvironmentalChange = (field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.environmentalConditions,
      [field]: value
    };
    
    handleConfinedSpaceChange('environmentalConditions', updated);
  };

  const handleContentChange = (field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.spaceContent,
      [field]: value
    };
    
    handleConfinedSpaceChange('spaceContent', updated);
  };

  const handleSafetyChange = (field: string, value: any) => {
    const updated = {
      ...confinedSpaceDetails.safetyMeasures,
      [field]: value
    };
    
    handleConfinedSpaceChange('safetyMeasures', updated);
  };

  // Validation des données avec feedback utilisateur
  const validateSiteInformation = () => {
    const errors = [];
    
    if (!confinedSpaceDetails.projectNumber) errors.push('Numéro de projet manquant');
    if (!confinedSpaceDetails.workLocation) errors.push('Lieu des travaux manquant');
    if (!confinedSpaceDetails.contractor) errors.push('Entrepreneur manquant');
    if (!confinedSpaceDetails.supervisor) errors.push('Superviseur manquant');
    if (!confinedSpaceDetails.entryDate) errors.push('Date d\'entrée manquante');
    if (!confinedSpaceDetails.spaceType) errors.push('Type d\'espace manquant');
    if (!confinedSpaceDetails.csaClass) errors.push('Classification CSA manquante');
    
    return errors;
  };

  // Sauvegarde avec validation
  const handleSave = () => {
    const validationErrors = validateSiteInformation();
    
    if (validationErrors.length > 0) {
      alert(`Erreurs de validation :\n${validationErrors.join('\n')}`);
      return false;
    }
    
    // Sauvegarde réussie
    updateParentData('siteInformation', confinedSpaceDetails);
    alert('Informations du site sauvegardées avec succès!');
    return true;
  };
     // =================== CARROUSEL PHOTOS IDENTIQUE AU STEP 1 ===================
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
                    <h4>{photo.category}</h4>
                    <p>{new Date(photo.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}</p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="photo-action-btn delete" 
                      onClick={() => {
                        const updatedPhotos = spacePhotos.filter(p => p.id !== photo.id);
                        setSpacePhotos(updatedPhotos);
                        updatePermitData({ spacePhotos: updatedPhotos });
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
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Ajouter Photo</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, textAlign: 'center' }}>
                  Documenter avec une photo
                </p>
              </div>
            </div>
          </div>
          {totalSlides > 1 && (
            <>
              <button className="carousel-nav prev" onClick={prevSlide} disabled={totalSlides <= 1}>
                <ArrowLeft size={20} />
              </button>
              <button className="carousel-nav next" onClick={nextSlide} disabled={totalSlides <= 1}>
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
                  onClick={() => goToSlide(index)} 
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

  // =================== RENDU PRINCIPAL ===================
  return (
    <>
      {/* CSS IDENTIQUE AU STEP 1 */}
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

          .confined-space-section { 
            background: rgba(59, 130, 246, 0.1); 
            border: 1px solid rgba(59, 130, 246, 0.3);
            grid-column: 1 / -1;
            margin-top: 0;
          }

          .confined-space-section:hover { 
            border-color: rgba(59, 130, 246, 0.5); 
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); 
          }

          .hazard-section { 
            background: rgba(239, 68, 68, 0.1); 
            border: 1px solid rgba(239, 68, 68, 0.3);
            grid-column: 1 / -1;
            margin-top: 0;
          }

          .hazard-section:hover { 
            border-color: rgba(239, 68, 68, 0.5); 
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); 
          }

          .safety-section { 
            background: rgba(16, 185, 129, 0.1); 
            border: 1px solid rgba(16, 185, 129, 0.3);
            grid-column: 1 / -1;
            margin-top: 0;
          }

          .safety-section:hover { 
            border-color: rgba(16, 185, 129, 0.5); 
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15); 
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

          .confined-space-icon { 
            color: #3b82f6 !important; 
          }

          .hazard-icon { 
            color: #ef4444 !important; 
          }

          .safety-icon { 
            color: #10b981 !important; 
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

          .three-column { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 16px;
            align-items: start;
          }

          .four-column { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 16px;
            align-items: start;
          }

          /* =================== BOUTONS =================== */
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

          .btn-success { 
            background: linear-gradient(135deg, #10b981, #059669); 
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

          .btn-success:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); 
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

          /* =================== SÉLECTEURS TYPE D'ESPACE ET DANGERS =================== */
          .space-type-selector { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
            gap: 12px; 
            margin-bottom: 16px;
          }

          .space-type-option { 
            padding: 16px 12px; 
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
            min-height: 100px;
            justify-content: center;
          }

          .space-type-option.selected { 
            border-color: #3b82f6; 
            background: rgba(59, 130, 246, 0.1); 
          }

          .space-type-option:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
          }

          .space-emoji {
            font-size: 24px;
            margin-bottom: 4px;
          }

          .space-name {
            font-size: 12px;
            color: #e2e8f0;
            font-weight: 600;
            text-align: center;
            line-height: 1.2;
          }

          /* =================== SÉLECTEURS DE DANGERS =================== */
          .hazard-selector { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 12px; 
            margin-bottom: 16px;
          }

          .hazard-item { 
            padding: 12px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            gap: 12px;
            min-height: 60px;
          }

          .hazard-item.selected { 
            border-color: #ef4444; 
            background: rgba(239, 68, 68, 0.1); 
          }

          .hazard-item:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); 
          }

          .hazard-checkbox { 
            width: 20px; 
            height: 20px; 
            border: 2px solid rgba(100, 116, 139, 0.5); 
            border-radius: 4px; 
            background: rgba(15, 23, 42, 0.8); 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s ease; 
            flex-shrink: 0; 
          }

          .hazard-checkbox.checked { 
            background: #ef4444; 
            border-color: #ef4444; 
            color: white; 
          }

          .hazard-text { 
            color: #e2e8f0; 
            font-size: 14px; 
            font-weight: 500; 
            flex: 1; 
          }

          .hazard-item.selected .hazard-text { 
            color: #fecaca; 
          }

          /* =================== POINTS D'ENTRÉE =================== */
          .entry-point { 
            background: rgba(15, 23, 42, 0.8); 
            border: 1px solid rgba(139, 92, 246, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 20px; 
            position: relative;
          }

          .entry-point:last-child {
            margin-bottom: 0;
          }

          .entry-point-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 16px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
            min-height: 40px;
          }

          /* =================== CALCULATEUR DE VOLUME =================== */
          .volume-calculator { 
            background: rgba(16, 185, 129, 0.1); 
            border: 1px solid rgba(16, 185, 129, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-top: 16px;
          }

          .volume-result { 
            background: rgba(16, 185, 129, 0.2); 
            border: 1px solid rgba(16, 185, 129, 0.4); 
            border-radius: 12px; 
            padding: 16px; 
            margin-top: 16px;
            text-align: center;
          }

          .volume-value { 
            font-size: 24px; 
            font-weight: 700; 
            color: #10b981; 
            margin-bottom: 4px;
          }

          .volume-unit { 
            font-size: 14px; 
            color: #6ee7b7; 
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

          /* =================== RESPONSIVE =================== */
          @media (max-width: 768px) {
            .premium-grid { 
              grid-template-columns: 1fr; 
              gap: 16px; 
            }
            
            .form-section { 
              padding: 16px; 
            }
            
            .two-column, .three-column, .four-column { 
              grid-template-columns: 1fr; 
              gap: 12px; 
            }
            
            .section-title { 
              font-size: 16px; 
            }
            
            .premium-input, .premium-select, .premium-textarea { 
              font-size: 16px; 
            }
            
            .space-type-selector { 
              grid-template-columns: repeat(2, 1fr); 
            }

            .hazard-selector { 
              grid-template-columns: 1fr; 
            }
            
            .photo-capture-buttons { 
              flex-direction: column; 
            }
          }

          @media (max-width: 480px) {
            .form-section { 
              padding: 12px; 
            }
            
            .space-type-selector { 
              grid-template-columns: 1fr; 
            }

            .entry-point-header {
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
      <input
        type="file"
        ref={photoInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />
      
      <div className="step1-container">
        {/* Modal Base de Données des Permis */}
        {showPermitDatabase && (
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
              padding: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: '20px', fontWeight: '700' }}>
                  🗄️ Base de Données - Espaces Clos
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
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Rechercher par numéro de permis, projet, lieu ou entrepreneur..."
                      className="premium-input"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
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
                    onClick={() => setShowQRScanner(!showQRScanner)}
                    className="btn-primary"
                    style={{ minWidth: '120px' }}
                  >
                    <Camera size={16} />
                    Scanner QR
                  </button>
                </div>

                {/* Scanner QR simple */}
                {showQRScanner && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ color: '#60a5fa', margin: '0 0 12px 0' }}>Scanner Code QR</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="Collez les données du QR code ici..."
                        className="premium-input"
                        value={scannedQRData}
                        onChange={(e) => setScannedQRData(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => handleQRScan(scannedQRData)}
                        className="btn-success"
                        disabled={!scannedQRData.trim()}
                      >
                        Charger
                      </button>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      📱 Utilisez une app de scan QR et collez le résultat ici
                    </p>
                  </div>
                )}
              </div>

              {/* Résultats de recherche */}
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
                  <p style={{ margin: '12px 0 0 0' }}>Recherche en cours...</p>
                </div>
              ) : searchResults.permits.length > 0 ? (
                <div>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 16px 0' }}>
                    📋 {searchResults.total} permis trouvé{searchResults.total > 1 ? 's' : ''}
                  </h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {searchResults.permits.map((permit) => (
                      <div key={permit.id} style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedHistoryPermit(selectedHistoryPermit?.id === permit.id ? null : permit)}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.5)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
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
                              🏢 {permit.contractor} • {permit.spaceType} • {permit.csaClass}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              background: permit.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 
                                         permit.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' :
                                         permit.status === 'expired' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                              color: permit.status === 'active' ? '#10b981' : 
                                     permit.status === 'completed' ? '#3b82f6' :
                                     permit.status === 'expired' ? '#ef4444' : '#9ca3af',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {permit.status === 'active' ? '🟢 ACTIF' :
                               permit.status === 'completed' ? '🔵 TERMINÉ' :
                               permit.status === 'expired' ? '🔴 EXPIRÉ' : '⚪ ANNULÉ'}
                            </span>
                          </div>
                        </div>
                        
                        {selectedHistoryPermit?.id === permit.id && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                              <div>
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Date d'entrée:</span>
                                <p style={{ color: '#e2e8f0', margin: 0, fontSize: '12px' }}>
                                  {new Date(permit.entryDate).toLocaleString('fr-CA')}
                                </p>
                              </div>
                              <div>
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Entrées:</span>
                                <p style={{ color: '#e2e8f0', margin: 0, fontSize: '12px' }}>
                                  {permit.entryCount} • {permit.hazardCount} danger{permit.hazardCount > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadPermitFromHistory(permit.permitNumber);
                              }}
                              className="btn-primary"
                              style={{ width: '100%' }}
                            >
                              📂 Charger ce permis
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>Aucun permis trouvé pour "{searchQuery}"</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <p style={{ margin: 0 }}>💡 Tapez au moins 2 caractères pour rechercher</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* En-tête avec actions du permis */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Settings className="section-icon" />
            <h3 className="section-title">Actions du Permis</h3>
          </div>
          
          <div className="four-column">
            <button
              onClick={() => setShowPermitDatabase(true)}
              className="btn-primary"
              style={{ minHeight: '60px', flexDirection: 'column', gap: '4px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              <Search size={20} />
              <span style={{ fontSize: '12px' }}>Base de Données</span>
            </button>

            <button
              onClick={async () => {
                const permitNumber = await savePermitToDatabase();
                if (permitNumber) {
                  const report = await generateCompletePermitReport();
                  console.log('Rapport généré:', report);
                }
              }}
              disabled={isGeneratingReport}
              className="btn-success"
              style={{ minHeight: '60px', flexDirection: 'column', gap: '4px' }}
            >
              {isGeneratingReport ? (
                <div style={{ animation: 'spin 1s linear infinite' }}>⟳</div>
              ) : (
                <Save size={20} />
              )}
              <span style={{ fontSize: '12px' }}>Sauvegarder</span>
            </button>

            <button
              onClick={handlePrintPermit}
              disabled={isGeneratingReport}
              className="btn-primary"
              style={{ minHeight: '60px', flexDirection: 'column', gap: '4px' }}
            >
              <Printer size={20} />
              <span style={{ fontSize: '12px' }}>Imprimer PDF</span>
            </button>

            <button
              onClick={handleEmailPermit}
              disabled={isGeneratingReport}
              className="btn-primary"
              style={{ minHeight: '60px', flexDirection: 'column', gap: '4px' }}
            >
              <Mail size={20} />
              <span style={{ fontSize: '12px' }}>Envoyer Email</span>
            </button>
          </div>
        </div>

        {/* Grille Premium des Sections */}
        <div className="premium-grid">
          {/* Section Informations du Projet */}
          <div className="form-section">
            <div className="section-header">
              <Building className="section-icon" />
              <h3 className="section-title">Informations du Projet</h3>
            </div>
            
            <div className="form-field">
              <label className="field-label">
                <Building style={{ width: '18px', height: '18px' }} />
                Numéro de projet<span className="required-indicator">*</span>
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
                Lieu des travaux<span className="required-indicator">*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Adresse complète du site"
                value={confinedSpaceDetails.workLocation}
                onChange={(e) => handleConfinedSpaceChange('workLocation', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />
                Entrepreneur<span className="required-indicator">*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Nom de l'entreprise contractante"
                value={confinedSpaceDetails.contractor}
                onChange={(e) => handleConfinedSpaceChange('contractor', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <User style={{ width: '18px', height: '18px' }} />
                Superviseur<span className="required-indicator">*</span>
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Nom du superviseur"
                value={confinedSpaceDetails.supervisor}
                onChange={(e) => handleConfinedSpaceChange('supervisor', e.target.value)}
              />
            </div>
          </div>

          {/* Section Planification */}
          <div className="form-section">
            <div className="section-header">
              <Calendar className="section-icon" />
              <h3 className="section-title">📅 Planification</h3>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Calendar style={{ width: '18px', height: '18px' }} />
                Date d'entrée prévue<span className="required-indicator">*</span>
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
                Durée estimée
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Ex: 4 heures"
                value={confinedSpaceDetails.duration}
                onChange={(e) => handleConfinedSpaceChange('duration', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <Users style={{ width: '18px', height: '18px' }} />
                Nombre de travailleurs
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
                Description des travaux
              </label>
              <textarea 
                className="premium-textarea" 
                style={{ minHeight: '100px' }}
                placeholder="Description détaillée des travaux à effectuer"
                value={confinedSpaceDetails.workDescription}
                onChange={(e) => handleConfinedSpaceChange('workDescription', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section Identification de l'Espace Clos */}
        <div className="form-section confined-space-section">
          <div className="section-header">
            <Home className="section-icon confined-space-icon" />
            <h3 className="section-title">Identification de l'Espace Clos</h3>
          </div>

          <div className="form-field">
            <label className="field-label">
              Type d'espace<span className="required-indicator">*</span>
            </label>
            <div className="space-type-selector">
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'tank' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'tank')}
              >
                <div className="space-emoji">🏗️</div>
                <div className="space-name">Réservoir</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'vessel' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'vessel')}
              >
                <div className="space-emoji">⚗️</div>
                <div className="space-name">Cuve/Récipient</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'silo' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'silo')}
              >
                <div className="space-emoji">🌾</div>
                <div className="space-name">Silo</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'pit' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'pit')}
              >
                <div className="space-emoji">🕳️</div>
                <div className="space-name">Fosse</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'vault' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'vault')}
              >
                <div className="space-emoji">🏛️</div>
                <div className="space-name">Voûte</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'tunnel' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'tunnel')}
              >
                <div className="space-emoji">🚇</div>
                <div className="space-name">Tunnel</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'manhole' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'manhole')}
              >
                <div className="space-emoji">🔧</div>
                <div className="space-name">Regard d'égout</div>
              </div>
              <div
                className={`space-type-option ${confinedSpaceDetails.spaceType === 'other' ? 'selected' : ''}`}
                onClick={() => handleConfinedSpaceChange('spaceType', 'other')}
              >
                <div className="space-emoji">❓</div>
                <div className="space-name">Autre</div>
              </div>
            </div>
          </div>

          <div className="three-column">
            <div className="form-field">
              <label className="field-label">
                <Shield style={{ width: '18px', height: '18px' }} />
                Classification CSA<span className="required-indicator">*</span>
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.csaClass}
                onChange={(e) => handleConfinedSpaceChange('csaClass', e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="class1">Classe 1 - Danger immédiat pour la vie</option>
                <option value="class2">Classe 2 - Risque potentiel</option>
                <option value="class3">Classe 3 - Risque minimal</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <ArrowRight style={{ width: '18px', height: '18px' }} />
                Méthode d'entrée
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.entryMethod}
                onChange={(e) => handleConfinedSpaceChange('entryMethod', e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="top">Entrée par le dessus</option>
                <option value="side">Entrée latérale</option>
                <option value="bottom">Entrée par le dessous</option>
                <option value="multiple">Entrées multiples</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label">
                <Layers style={{ width: '18px', height: '18px' }} />
                Type d'accès
              </label>
              <select
                className="premium-select"
                value={confinedSpaceDetails.accessType}
                onChange={(e) => handleConfinedSpaceChange('accessType', e.target.value)}
              >
                <option value="">Sélectionner</option>
                <option value="ladder">Échelle</option>
                <option value="stairs">Escalier</option>
                <option value="rope">Corde</option>
                <option value="crane">Grue/Palan</option>
                <option value="direct">Accès direct</option>
              </select>
            </div>
          </div>

          <div className="two-column">
            <div className="form-field">
              <label className="field-label">
                <MapPin style={{ width: '18px', height: '18px' }} />
                Localisation de l'espace
              </label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Localisation précise sur le site"
                value={confinedSpaceDetails.spaceLocation}
                onChange={(e) => handleConfinedSpaceChange('spaceLocation', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <FileText style={{ width: '18px', height: '18px' }} />
                Description de l'espace
              </label>
              <textarea 
                className="premium-textarea" 
                style={{ minHeight: '80px' }}
                placeholder="Description détaillée de l'espace confiné"
                value={confinedSpaceDetails.spaceDescription}
                onChange={(e) => handleConfinedSpaceChange('spaceDescription', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section Dimensions et Volume */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Ruler className="section-icon" />
            <h3 className="section-title">Dimensions et Volume</h3>
          </div>

          <div className="volume-calculator">
            {/* Instructions dynamiques basées sur le type d'espace */}
            {confinedSpaceDetails.spaceType && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <p style={{ margin: 0, color: '#93c5fd', fontSize: '14px' }}>
                  <strong>Type sélectionné:</strong> {confinedSpaceDetails.spaceType === 'tank' ? '🏗️ Réservoir (cylindrique)' :
                  confinedSpaceDetails.spaceType === 'vessel' ? '⚗️ Cuve (cylindrique)' :
                  confinedSpaceDetails.spaceType === 'silo' ? '🌾 Silo (cylindrique)' :
                  confinedSpaceDetails.spaceType === 'pit' ? '🕳️ Fosse (circulaire ou rectangulaire)' :
                  confinedSpaceDetails.spaceType === 'tunnel' ? '🚇 Tunnel (cylindrique ou rectangulaire)' :
                  '📦 Rectangulaire'}
                </p>
              </div>
            )}

            <div className="four-column">
              {/* Longueur - toujours visible sauf pour formes purement circulaires */}
              {!(['tank', 'vessel', 'silo', 'boiler'].includes(confinedSpaceDetails.spaceType)) && (
                <div className="form-field">
                  <label className="field-label">
                    Longueur (m) {(['tunnel', 'duct'].includes(confinedSpaceDetails.spaceType)) && <span style={{color: '#10b981'}}>*</span>}
                  </label>
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
              )}

              {/* Largeur - seulement pour formes rectangulaires */}
              {!(['tank', 'vessel', 'silo', 'boiler', 'tunnel', 'duct', 'manhole'].includes(confinedSpaceDetails.spaceType) || 
                (['pit', 'tunnel'].includes(confinedSpaceDetails.spaceType) && !confinedSpaceDetails.dimensions.diameter)) && (
                <div className="form-field">
                  <label className="field-label">
                    Largeur (m) <span style={{color: '#ef4444'}}>*</span>
                  </label>
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
              )}

              {/* Hauteur - toujours visible */}
              <div className="form-field">
                <label className="field-label">
                  Hauteur (m) <span style={{color: '#ef4444'}}>*</span>
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

              {/* Diamètre - seulement pour formes circulaires/cylindriques */}
              {(['tank', 'vessel', 'silo', 'boiler', 'manhole', 'tunnel', 'duct'].includes(confinedSpaceDetails.spaceType) || 
                (confinedSpaceDetails.spaceType === 'pit')) && (
                <div className="form-field">
                  <label className="field-label">
                    Diamètre (m) {(['tank', 'vessel', 'silo', 'boiler', 'manhole'].includes(confinedSpaceDetails.spaceType)) && <span style={{color: '#ef4444'}}>*</span>}
                  </label>
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
                  {confinedSpaceDetails.spaceType === 'pit' && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Laisser vide pour une fosse rectangulaire
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button className="btn-success" onClick={calculateVolume}>
                <Gauge size={20} />
                Calculer le Volume
              </button>
            </div>

            {confinedSpaceDetails.dimensions.volume > 0 && (
              <div className="volume-result">
                <div className="volume-value">
                  {confinedSpaceDetails.dimensions.volume}
                </div>
                <div className="volume-unit">
                  m³ - Volume calculé
                </div>
                <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '8px' }}>
                  Formule utilisée selon le type d'espace sélectionné
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Documentation Photographique */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Camera className="section-icon" />
            <h3 className="section-title">Documentation Photographique</h3>
          </div>

          <div className="photo-capture-buttons">
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('spaceExterior')}>
              <Camera size={14} />Extérieur de l'espace
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('spaceInterior')}>
              <Camera size={14} />Intérieur de l'espace
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('entryPointPhoto')}>
              <Camera size={14} />Points d'entrée
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('hazardIdentification')}>
              <AlertTriangle size={14} />Identification des dangers
            </button>
            <button className="photo-capture-btn" onClick={() => handlePhotoCapture('safetyEquipment')}>
              <Shield size={14} />Équipement de sécurité
            </button>
          </div>

          {spacePhotos.length > 0 ? (
            <PhotoCarousel 
              photos={spacePhotos}
              onAddPhoto={() => handlePhotoCapture('spaceInterior')}
            />
          ) : (
            <EmptyPhotoPlaceholder
              onClick={() => handlePhotoCapture('spaceExterior')}
              title="Aucune photo"
              description="Cliquez pour prendre une photo"
            />
          )}
        </div>
        {/* Section Évaluation des Dangers */}
        <div className="form-section hazard-section">
          <div className="section-header">
            <AlertTriangle className="section-icon hazard-icon" />
            <h3 className="section-title">Évaluation des Dangers</h3>
          </div>
          
          <div className="field-help" style={{ marginBottom: '24px' }}>
            Sélectionnez tous les dangers présents ou potentiels
          </div>

          {/* Dangers Atmosphériques */}
          <div className="form-field">
            <label className="field-label">
              <Wind style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              Dangers Atmosphériques
            </label>
            <div className="hazard-selector">
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('oxygen_deficiency') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('oxygen_deficiency')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('oxygen_deficiency') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('oxygen_deficiency') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Déficience en oxygène (&lt;19.5%)</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('oxygen_enrichment') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('oxygen_enrichment')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('oxygen_enrichment') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('oxygen_enrichment') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Enrichissement en oxygène (&gt;23%)</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('flammable_gases') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('flammable_gases')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('flammable_gases') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('flammable_gases') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Gaz inflammables/combustibles</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('toxic_gases') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('toxic_gases')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('toxic_gases') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('toxic_gases') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Gaz toxiques</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('hydrogen_sulfide') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('hydrogen_sulfide')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('hydrogen_sulfide') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('hydrogen_sulfide') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Sulfure d'hydrogène (H2S)</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('carbon_monoxide') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('carbon_monoxide')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('carbon_monoxide') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('carbon_monoxide') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Monoxyde de carbone (CO)</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('carbon_dioxide') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('carbon_dioxide')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('carbon_dioxide') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('carbon_dioxide') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Dioxyde de carbone (CO2)</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.atmosphericHazards.includes('methane') ? 'selected' : ''}`}
                onClick={() => toggleAtmosphericHazard('methane')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.atmosphericHazards.includes('methane') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.atmosphericHazards.includes('methane') && <Check size={12} />}
                </div>
                <div className="hazard-text">🌪️ Méthane (CH4)</div>
              </div>
            </div>
          </div>

          {/* Dangers Physiques */}
          <div className="form-field">
            <label className="field-label">
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
              Dangers Physiques
            </label>
            <div className="hazard-selector">
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('engulfment') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('engulfment')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('engulfment') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('engulfment') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Ensevelissement/Engloutissement</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('crushing') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('crushing')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('crushing') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('crushing') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Écrasement par équipement</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('electrical') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('electrical')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('electrical') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('electrical') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Dangers électriques</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('mechanical') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('mechanical')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('mechanical') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('mechanical') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Dangers mécaniques</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('falls') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('falls')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('falls') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('falls') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Chutes de hauteur</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('temperature_extreme') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('temperature_extreme')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('temperature_extreme') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('temperature_extreme') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Températures extrêmes</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('noise') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('noise')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('noise') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('noise') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Bruit excessif</div>
              </div>
              <div
                className={`hazard-item ${confinedSpaceDetails.physicalHazards.includes('structural_collapse') ? 'selected' : ''}`}
                onClick={() => togglePhysicalHazard('structural_collapse')}
              >
                <div className={`hazard-checkbox ${confinedSpaceDetails.physicalHazards.includes('structural_collapse') ? 'checked' : ''}`}>
                  {confinedSpaceDetails.physicalHazards.includes('structural_collapse') && <Check size={12} />}
                </div>
                <div className="hazard-text">⚡ Effondrement structural</div>
              </div>
            </div>
          </div>

          {/* Résumé des dangers sélectionnés */}
          {(confinedSpaceDetails.atmosphericHazards.length > 0 || confinedSpaceDetails.physicalHazards.length > 0) && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <h4 style={{ color: '#fecaca', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                ⚠️ Dangers Identifiés ({confinedSpaceDetails.atmosphericHazards.length + confinedSpaceDetails.physicalHazards.length})
              </h4>
              <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.5' }}>
                {confinedSpaceDetails.atmosphericHazards.length > 0 && (
                  <div>🌪️ Atmosphériques: {confinedSpaceDetails.atmosphericHazards.length}</div>
                )}
                {confinedSpaceDetails.physicalHazards.length > 0 && (
                  <div>⚡ Physiques: {confinedSpaceDetails.physicalHazards.length}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section Points d'Entrée */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Home className="section-icon" />
            <h3 className="section-title">Points d'Entrée et Accès</h3>
          </div>

          {/* Liste des points d'entrée */}
          {confinedSpaceDetails.entryPoints.map((entry, index) => (
            <div key={entry.id} className="entry-point">
              <div className="entry-point-header">
                <h4 style={{ color: '#a78bfa', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  🚪 Point d'entrée {index + 1}
                </h4>
                {confinedSpaceDetails.entryPoints.length > 1 && (
                  <button 
                    className="btn-danger" 
                    onClick={() => removeEntryPoint(entry.id)}
                    type="button"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                )}
              </div>

              <div className="three-column">
                <div className="form-field">
                  <label className="field-label">
                    <Settings style={{ width: '18px', height: '18px' }} />
                    Type d'entrée
                  </label>
                  <select
                    className="premium-select"
                    value={entry.type}
                    onChange={(e) => updateEntryPoint(entry.id, 'type', e.target.value)}
                  >
                    <option value="circular">🔵 Circulaire</option>
                    <option value="rectangular">🟨 Rectangulaire</option>
                    <option value="square">🟫 Carré</option>
                    <option value="oval">🥚 Ovale</option>
                    <option value="irregular">🔷 Irrégulier</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <Settings style={{ width: '18px', height: '18px' }} />
                    Dimensions
                  </label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="Ex: 60cm x 40cm ou Ø80cm"
                    value={entry.dimensions}
                    onChange={(e) => updateEntryPoint(entry.id, 'dimensions', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <MapPin style={{ width: '18px', height: '18px' }} />
                    Localisation
                  </label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="Ex: Partie supérieure, côté nord"
                    value={entry.location}
                    onChange={(e) => updateEntryPoint(entry.id, 'location', e.target.value)}
                  />
                </div>
              </div>

              <div className="two-column">
                <div className="form-field">
                  <label className="field-label">
                    <Eye style={{ width: '18px', height: '18px' }} />
                    État
                  </label>
                  <select
                    className="premium-select"
                    value={entry.condition}
                    onChange={(e) => updateEntryPoint(entry.id, 'condition', e.target.value)}
                  >
                    <option value="excellent">✅ Excellent</option>
                    <option value="good">👍 Bon</option>
                    <option value="fair">⚠️ Acceptable</option>
                    <option value="poor">❌ Mauvais</option>
                    <option value="blocked">🚫 Bloqué</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <Users style={{ width: '18px', height: '18px' }} />
                    Accessibilité
                  </label>
                  <select
                    className="premium-select"
                    value={entry.accessibility}
                    onChange={(e) => updateEntryPoint(entry.id, 'accessibility', e.target.value)}
                  >
                    <option value="easy">🟢 Facile</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="difficult">🟠 Difficile</option>
                    <option value="dangerous">🔴 Dangereux</option>
                    <option value="equipment_required">🔧 Équipement requis</option>
                  </select>
                </div>
              </div>

              {/* Photos du point d'entrée */}
              <div className="form-field">
                <label className="field-label">
                  <Camera style={{ width: '18px', height: '18px' }} />
                  Photos
                </label>
                
                <div className="photo-capture-buttons">
                  <button className="photo-capture-btn" onClick={() => handlePhotoCapture('entryPointPhoto')}>
                    <Camera size={14} />Photo du point d'entrée
                  </button>
                  <button className="photo-capture-btn" onClick={() => handlePhotoCapture('hazardIdentification')}>
                    <AlertTriangle size={14} />Dangers visibles
                  </button>
                </div>

                {spacePhotos.filter(photo => photo.category === 'entryPointPhoto').length > 0 ? (
                  <PhotoCarousel 
                    photos={spacePhotos.filter(photo => photo.category === 'entryPointPhoto')}
                    onAddPhoto={() => handlePhotoCapture('entryPointPhoto')}
                    category="entryPointPhoto"
                  />
                ) : (
                  <EmptyPhotoPlaceholder
                    onClick={() => handlePhotoCapture('entryPointPhoto')}
                    title="Aucune photo de ce point d'entrée"
                    description="Documentez ce point d'entrée avec une photo"
                    color="#a78bfa"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Bouton ajouter point d'entrée */}
          <div style={{ marginTop: confinedSpaceDetails.entryPoints.length > 0 ? '24px' : '0' }}>
            <button className="btn-primary" onClick={addEntryPoint}>
              <Plus size={20} />
              Ajouter un point d'entrée
            </button>
          </div>
        </div>

        {/* Section Conditions Environnementales */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Wind style={{ width: '20px', height: '20px' }} />
            <h3 className="section-title">Conditions Environnementales</h3>
          </div>

          <div className="premium-grid">
            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Wind style={{ width: '18px', height: '18px' }} />
                  Ventilation requise
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.environmentalConditions.ventilationRequired ? 'yes' : 'no'}
                  onChange={(e) => handleEnvironmentalChange('ventilationRequired', e.target.value === 'yes')}
                >
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </select>
              </div>

              {confinedSpaceDetails.environmentalConditions.ventilationRequired && (
                <div className="form-field">
                  <label className="field-label">
                    <Wind style={{ width: '18px', height: '18px' }} />
                    Type de ventilation
                  </label>
                  <select
                    className="premium-select"
                    value={confinedSpaceDetails.environmentalConditions.ventilationType}
                    onChange={(e) => handleEnvironmentalChange('ventilationType', e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    <option value="natural">💨 Ventilation naturelle</option>
                    <option value="forced_supply">🌪️ Ventilation forcée - apport</option>
                    <option value="forced_exhaust">💨 Ventilation forcée - extraction</option>
                    <option value="forced_both">🔄 Ventilation forcée - mixte</option>
                  </select>
                </div>
              )}

              <div className="form-field">
                <label className="field-label">
                  <Eye style={{ width: '18px', height: '18px' }} />
                  Conditions d'éclairage
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.environmentalConditions.lightingConditions}
                  onChange={(e) => handleEnvironmentalChange('lightingConditions', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="excellent">☀️ Excellent</option>
                  <option value="good">💡 Bon</option>
                  <option value="poor">🔦 Faible</option>
                  <option value="none">🌑 Aucun - éclairage requis</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Wind style={{ width: '18px', height: '18px' }} />
                  Plage de température
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.environmentalConditions.temperatureRange}
                  onChange={(e) => handleEnvironmentalChange('temperatureRange', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="very_cold">🥶 Très froid (&lt; 0°C)</option>
                  <option value="cold">❄️ Froid (0-10°C)</option>
                  <option value="cool">🌡️ Frais (10-15°C)</option>
                  <option value="normal">🌤️ Normal (15-25°C)</option>
                  <option value="warm">🌞 Chaud (25-35°C)</option>
                  <option value="hot">🔥 Très chaud (&gt; 35°C)</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Droplets style={{ width: '18px', height: '18px' }} />
                  Niveau d'humidité
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.environmentalConditions.moistureLevel}
                  onChange={(e) => handleEnvironmentalChange('moistureLevel', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="dry">🏜️ Sec (&lt; 30%)</option>
                  <option value="normal">🌤️ Normal (30-60%)</option>
                  <option value="humid">💧 Humide (60-80%)</option>
                  <option value="very_humid">🌊 Très humide (&gt; 80%)</option>
                  <option value="wet">💦 Mouillé/Condensation</option>
                </select>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Settings style={{ width: '18px', height: '18px' }} />
                  Niveau de bruit
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.environmentalConditions.noiseLevel}
                  onChange={(e) => handleEnvironmentalChange('noiseLevel', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="quiet">🔇 Silencieux (&lt; 50 dB)</option>
                  <option value="normal">🔉 Normal (50-80 dB)</option>
                  <option value="loud">🔊 Bruyant (80-100 dB)</option>
                  <option value="very_loud">📢 Très bruyant (&gt; 100 dB)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">
              <Wind style={{ width: '18px', height: '18px' }} />
              Conditions météorologiques
            </label>
            <input 
              type="text" 
              className="premium-input" 
              placeholder="Ex: Ensoleillé, vent léger, température 20°C"
              value={confinedSpaceDetails.environmentalConditions.weatherConditions}
              onChange={(e) => handleEnvironmentalChange('weatherConditions', e.target.value)}
            />
          </div>
        </div>

        {/* Section Contenu de l'Espace */}
        <div className="form-section full-width-section">
          <div className="section-header">
            <Settings style={{ width: '20px', height: '20px' }} />
            <h3 className="section-title">Contenu et Historique de l'Espace</h3>
          </div>

          <div className="premium-grid">
            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Eye style={{ width: '18px', height: '18px' }} />
                  Contenu actuel
                </label>
                <textarea 
                  className="premium-textarea" 
                  style={{ minHeight: '80px' }}
                  placeholder="Décrivez le contenu actuel de l'espace (équipements, matériaux, liquides...)"
                  value={confinedSpaceDetails.spaceContent.contents}
                  onChange={(e) => handleContentChange('contents', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <AlertTriangle style={{ width: '18px', height: '18px' }} />
                  Résidus/Substances
                </label>
                <textarea 
                  className="premium-textarea" 
                  style={{ minHeight: '80px' }}
                  placeholder="Résidus chimiques, substances dangereuses, dépôts..."
                  value={confinedSpaceDetails.spaceContent.residues}
                  onChange={(e) => handleContentChange('residues', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Clock style={{ width: '18px', height: '18px' }} />
                  Usage antérieur
                </label>
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder="Ex: Stockage de produits chimiques, réservoir de carburant..."
                  value={confinedSpaceDetails.spaceContent.previousUse}
                  onChange={(e) => handleContentChange('previousUse', e.target.value)}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Calendar style={{ width: '18px', height: '18px' }} />
                  Dernière entrée
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
                  État de nettoyage
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.spaceContent.cleaningStatus}
                  onChange={(e) => handleContentChange('cleaningStatus', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="clean">✅ Nettoyé et décontaminé</option>
                  <option value="partially_clean">⚠️ Partiellement nettoyé</option>
                  <option value="dirty">❌ Non nettoyé</option>
                  <option value="contaminated">☢️ Contaminé</option>
                  <option value="unknown">❓ État inconnu</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Mesures de Sécurité */}
        <div className="form-section safety-section">
          <div className="section-header">
            <Shield className="section-icon safety-icon" />
            <h3 className="section-title">Mesures de Sécurité</h3>
          </div>

          <div className="premium-grid">
            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                  Plan de sortie d'urgence
                </label>
                <textarea 
                  className="premium-textarea" 
                  style={{ minHeight: '100px' }}
                  placeholder="Plan de sortie d'urgence : procédures, équipements, points de rassemblement..."
                  value={confinedSpaceDetails.safetyMeasures.emergencyEgress}
                  onChange={(e) => handleSafetyChange('emergencyEgress', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Phone style={{ width: '18px', height: '18px' }} />
                  Méthode de communication
                </label>
                <select
                  className="premium-select"
                  value={confinedSpaceDetails.safetyMeasures.communicationMethod}
                  onChange={(e) => handleSafetyChange('communicationMethod', e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  <option value="radio">📻 Radio bidirectionnelle</option>
                  <option value="intercom">📞 Intercom</option>
                  <option value="hand_signals">👋 Signaux manuels</option>
                  <option value="rope_signals">🪢 Signaux par corde</option>
                  <option value="electronic">📱 Communication électronique</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Settings style={{ width: '18px', height: '18px' }} />
                  Équipement de surveillance
                </label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { id: 'gas_detector', label: '🔬 Détecteur multi-gaz' },
                    { id: 'oxygen_meter', label: '🫁 Oxymètre' },
                    { id: 'combustible_detector', label: '🔥 Détecteur de gaz combustibles' },
                    { id: 'toxic_detector', label: '☠️ Détecteur de gaz toxiques' },
                    { id: 'h2s_detector', label: '🦨 Détecteur H2S' },
                    { id: 'co_detector', label: '💨 Détecteur CO' }
                  ].map((equipment) => (
                    <div key={equipment.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <input
                        type="checkbox"
                        id={equipment.id}
                        checked={confinedSpaceDetails.safetyMeasures.monitoringEquipment.includes(equipment.id)}
                        onChange={(e) => {
                          const current = confinedSpaceDetails.safetyMeasures.monitoringEquipment;
                          const updated = e.target.checked
                            ? [...current, equipment.id]
                            : current.filter(item => item !== equipment.id);
                          handleSafetyChange('monitoringEquipment', updated);
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#10b981'
                        }}
                      />
                      <label 
                        htmlFor={equipment.id}
                        style={{
                          color: '#a7f3d0',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        {equipment.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="premium-grid">
            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Wind style={{ width: '18px', height: '18px' }} />
                  Équipement de ventilation
                </label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { id: 'exhaust_fan', label: '💨 Ventilateur d\'extraction' },
                    { id: 'supply_fan', label: '🌪️ Ventilateur d\'apport' },
                    { id: 'air_mover', label: '🔄 Circulateur d\'air' },
                    { id: 'ducting', label: '🚇 Conduits de ventilation' },
                    { id: 'air_curtain', label: '🌊 Rideau d\'air' }
                  ].map((equipment) => (
                    <div key={equipment.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <input
                        type="checkbox"
                        id={equipment.id}
                        checked={confinedSpaceDetails.safetyMeasures.ventilationEquipment.includes(equipment.id)}
                        onChange={(e) => {
                          const current = confinedSpaceDetails.safetyMeasures.ventilationEquipment;
                          const updated = e.target.checked
                            ? [...current, equipment.id]
                            : current.filter(item => item !== equipment.id);
                          handleSafetyChange('ventilationEquipment', updated);
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#10b981'
                        }}
                      />
                      <label 
                        htmlFor={equipment.id}
                        style={{
                          color: '#a7f3d0',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        {equipment.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-field">
                <label className="field-label">
                  <Shield style={{ width: '18px', height: '18px' }} />
                  Équipement d'urgence
                </label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { id: 'scba', label: '🫁 Appareil respiratoire autonome' },
                    { id: 'rescue_harness', label: '🦺 Harnais de sauvetage' },
                    { id: 'retrieval_system', label: '⛓️ Système de récupération' },
                    { id: 'emergency_light', label: '🔦 Éclairage d\'urgence' },
                    { id: 'first_aid', label: '🏥 Trousse premiers soins' },
                    { id: 'eyewash', label: '👁️ Douche oculaire portable' }
                  ].map((equipment) => (
                    <div key={equipment.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <input
                        type="checkbox"
                        id={equipment.id}
                        checked={confinedSpaceDetails.safetyMeasures.emergencyEquipment.includes(equipment.id)}
                        onChange={(e) => {
                          const current = confinedSpaceDetails.safetyMeasures.emergencyEquipment;
                          const updated = e.target.checked
                            ? [...current, equipment.id]
                            : current.filter(item => item !== equipment.id);
                          handleSafetyChange('emergencyEquipment', updated);
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#10b981'
                        }}
                      />
                      <label 
                        htmlFor={equipment.id}
                        style={{
                          color: '#a7f3d0',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        {equipment.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Validation finale */}
          <div style={{ 
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <Check size={24} color="#10b981" />
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#86efac', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                ✅ Informations du Site Complétées
              </h4>
              <p style={{ color: '#6ee7b7', margin: 0, fontSize: '14px' }}>
                Toutes les informations nécessaires pour l'identification et l'évaluation de l'espace clos ont été documentées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SiteInformation;
