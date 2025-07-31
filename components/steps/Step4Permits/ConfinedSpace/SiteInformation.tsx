// SiteInformation.tsx - VERSION SIMPLIFIÉE - SEULEMENT SAISIE DES DONNÉES
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase, 
  AlertTriangle, Camera, Upload, X, Settings, Wrench, Droplets, 
  Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home, Layers, 
  Ruler, Gauge, Thermometer, Activity, Shield, Zap, CheckCircle, 
  ChevronDown, ChevronUp, Info, Star, Globe, Wifi, Navigation, Check
} from 'lucide-react';
import { useSafetyManager } from './SafetyManager'; // Import du hook centralisé

// =================== TYPES (gardés du fichier original) ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';
type UnitSystem = 'metric' | 'imperial';

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

interface SiteInformationProps {
  selectedProvince: ProvinceCode;
  PROVINCIAL_REGULATIONS: Record<ProvinceCode, any>;
  isMobile: boolean;
  language: Language;
}

// =================== DÉTECTION MOBILE ET STYLES IDENTIQUES AU CODE ORIGINAL ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  headerCard: {
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '12px' : '20px',
    padding: isMobile ? '20px' : '32px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginBottom: isMobile ? '16px' : '24px'
  },
  button: {
    padding: isMobile ? '8px 12px' : '14px 24px',
    borderRadius: isMobile ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    boxSizing: 'border-box' as const,
    width: '100%',
    justifyContent: 'center' as const
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  input: {
    width: '100%',
    padding: isMobile ? '12px 16px' : '14px 16px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid #374151',
    borderRadius: isMobile ? '6px' : '8px',
    color: 'white',
    fontSize: isMobile ? '16px' : '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    minHeight: isMobile ? '48px' : '50px',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: isMobile ? '12px 16px' : '14px 16px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid #374151',
    borderRadius: isMobile ? '6px' : '8px',
    color: 'white',
    fontSize: isMobile ? '16px' : '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    minHeight: isMobile ? '48px' : '50px',
    fontFamily: 'inherit',
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const
  },
  textarea: {
    width: '100%',
    padding: isMobile ? '12px 16px' : '14px 16px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '2px solid #374151',
    borderRadius: isMobile ? '6px' : '8px',
    color: 'white',
    fontSize: isMobile ? '16px' : '15px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box' as const,
    minHeight: isMobile ? '100px' : '120px',
    fontFamily: 'inherit',
    resize: 'vertical' as const
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  formField: {
    marginBottom: isMobile ? '16px' : '20px',
    display: 'flex',
    flexDirection: 'column' as const
  },
  fieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#d1d5db',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    marginBottom: '8px',
    minHeight: '20px'
  },
  collapsibleSection: {
    backgroundColor: 'rgba(31, 41, 59, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid #374151',
    borderRadius: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '16px' : '24px',
    overflow: 'hidden' as const,
    transition: 'all 0.3s ease'
  }
};

// =================== TRADUCTIONS COMPLÈTES AVEC photoCategories ===================
const translations = {
  fr: {
    title: "Informations du Site - Espace Clos",
    subtitle: "Identification et évaluation complète de l'espace de travail confiné",
    
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
    
    // Actions
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Retirer",
    select: "Sélectionner",
    required: "Requis",
    optional: "Optionnel",
    yes: "Oui",
    no: "Non"
  },
  en: {
    title: "Site Information - Confined Space",
    subtitle: "Complete identification and assessment of the confined workspace",
    
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
    
    // Photos - CORRECTION: Ajout de photoCategories manquant
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
    
    // Actions
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    select: "Select",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No"
  }
};
// =================== COMPOSANT PRINCIPAL SIMPLIFIÉ ===================
const SiteInformation: React.FC<SiteInformationProps> = ({
  selectedProvince,
  PROVINCIAL_REGULATIONS,
  isMobile,
  language
}) => {
  // Utilisation du hook centralisé au lieu d'états locaux
  const safetyManager = useSafetyManager();
  const siteInfo = safetyManager.currentPermit.siteInformation;
  
  // États pour l'interface seulement
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];

  // =================== HANDLERS SIMPLIFIÉS - UTILISENT LE HOOK CENTRALISÉ ===================
  const updateSiteInfo = useCallback((field: string, value: any) => {
    safetyManager.updateSiteInformation({ [field]: value });
  }, [safetyManager]);

  const updateDimensions = useCallback((dimensionUpdates: Partial<Dimensions>) => {
    const updatedDimensions = { ...siteInfo.dimensions, ...dimensionUpdates };
    safetyManager.updateSiteInformation({ dimensions: updatedDimensions });
  }, [safetyManager, siteInfo.dimensions]);

  const updateEnvironmentalCondition = useCallback((field: string, value: any) => {
    const updatedConditions = { ...siteInfo.environmentalConditions, [field]: value };
    safetyManager.updateSiteInformation({ environmentalConditions: updatedConditions });
  }, [safetyManager, siteInfo.environmentalConditions]);

  const updateSpaceContent = useCallback((field: string, value: any) => {
    const updatedContent = { ...siteInfo.spaceContent, [field]: value };
    safetyManager.updateSiteInformation({ spaceContent: updatedContent });
  }, [safetyManager, siteInfo.spaceContent]);

  const updateSafetyMeasures = useCallback((field: string, value: any) => {
    const updatedMeasures = { ...siteInfo.safetyMeasures, [field]: value };
    safetyManager.updateSiteInformation({ safetyMeasures: updatedMeasures });
  }, [safetyManager, siteInfo.safetyMeasures]);

  // =================== CALCUL VOLUME (gardé local car calcul immédiat) ===================
  const calculateVolume = useCallback(() => {
    const { length, width, height, diameter, spaceShape } = siteInfo.dimensions;
    let volume = 0;

    switch (spaceShape) {
      case 'rectangular':
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height;
        }
        break;
      case 'cylindrical':
        if (diameter > 0 && height > 0) {
          const radius = diameter / 2;
          volume = Math.PI * Math.pow(radius, 2) * height;
        }
        break;
      case 'spherical':
        if (diameter > 0) {
          const radius = diameter / 2;
          volume = (4/3) * Math.PI * Math.pow(radius, 3);
        }
        break;
      case 'irregular':
        if (length > 0 && width > 0 && height > 0) {
          volume = length * width * height * 0.85;
        }
        break;
    }

    updateDimensions({ volume: Math.round(volume * 100) / 100 });
  }, [siteInfo.dimensions, updateDimensions]);

  // =================== CONVERSION D'UNITÉS ===================
  const convertUnits = useCallback((fromSystem: UnitSystem, toSystem: UnitSystem) => {
    if (fromSystem === toSystem) return;
    
    const conversionFactor = fromSystem === 'metric' ? 3.28084 : 0.3048;
    const { dimensions } = siteInfo;
    
    const convertedDimensions = {
      ...dimensions,
      length: Math.round(dimensions.length * conversionFactor * 100) / 100,
      width: Math.round(dimensions.width * conversionFactor * 100) / 100,
      height: Math.round(dimensions.height * conversionFactor * 100) / 100,
      diameter: Math.round(dimensions.diameter * conversionFactor * 100) / 100,
      volume: 0
    };
    
    safetyManager.updateSiteInformation({ 
      dimensions: convertedDimensions,
      unitSystem: toSystem 
    });
  }, [safetyManager, siteInfo]);

  // =================== GESTION DES DANGERS ===================
  const toggleAtmosphericHazard = useCallback((hazardType: string) => {
    const currentHazards = siteInfo.atmosphericHazards || [];
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    safetyManager.updateSiteInformation({ atmosphericHazards: updatedHazards });
  }, [safetyManager, siteInfo.atmosphericHazards]);

  const togglePhysicalHazard = useCallback((hazardType: string) => {
    const currentHazards = siteInfo.physicalHazards || [];
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    safetyManager.updateSiteInformation({ physicalHazards: updatedHazards });
  }, [safetyManager, siteInfo.physicalHazards]);

  // =================== GESTION DES POINTS D'ENTRÉE ===================
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
    
    const updatedEntryPoints = [...(siteInfo.entryPoints || []), newEntryPoint];
    safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
  }, [safetyManager, siteInfo.entryPoints]);

  const removeEntryPoint = useCallback((entryId: string) => {
    const currentEntryPoints = siteInfo.entryPoints || [];
    if (currentEntryPoints.length <= 1) {
      alert(language === 'fr' ? 'Au moins un point d\'entrée est requis' : 'At least one entry point is required');
      return;
    }
    
    const updatedEntryPoints = currentEntryPoints.filter(entry => entry.id !== entryId);
    safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
  }, [safetyManager, siteInfo.entryPoints, language]);

  const updateEntryPoint = useCallback((entryId: string, field: string, value: any) => {
    const currentEntryPoints = siteInfo.entryPoints || [];
    const updatedEntryPoints = currentEntryPoints.map(entry =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    );
    safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
  }, [safetyManager, siteInfo.entryPoints]);

  // =================== GESTION DES PHOTOS SIMPLIFIÉE ===================
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
              location: 'Localisation en cours...'
            };

            // Géolocalisation simple
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                  newPhoto.gpsCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  
                  // Mise à jour via SafetyManager
                  const currentPhotos = siteInfo.spacePhotos || [];
                  safetyManager.updateSiteInformation({ 
                    spacePhotos: [...currentPhotos, newPhoto] 
                  });
                }, 
                () => {
                  newPhoto.location = 'Localisation non disponible';
                  const currentPhotos = siteInfo.spacePhotos || [];
                  safetyManager.updateSiteInformation({ 
                    spacePhotos: [...currentPhotos, newPhoto] 
                  });
                }
              );
            } else {
              const currentPhotos = siteInfo.spacePhotos || [];
              safetyManager.updateSiteInformation({ 
                spacePhotos: [...currentPhotos, newPhoto] 
              });
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  }, [safetyManager, siteInfo.spacePhotos, t.photoCategories, language]);

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

  // =================== COMPOSANT SECTION COLLAPSIBLE ===================
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
      <div style={styles.collapsibleSection}>
        <button 
          onClick={() => toggleSection(id)}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '20px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
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
              color: '#3b82f6',
              flexShrink: 0
            }}>{icon}</div>
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '700',
              color: 'white',
              textAlign: 'left'
            }}>{title}</h3>
          </div>
          <div style={{
            color: '#9ca3af',
            transition: 'transform 0.2s ease'
          }}>
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </button>
        
        {!isCollapsed && (
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderTop: '1px solid #374151'
          }}>
            {children}
          </div>
        )}
      </div>
    );
  };
  // =================== COMPOSANT SÉLECTEUR CSA AVEC ASSISTANT ===================
  const CSAClassificationSelector = () => {
    const csaClassifications = {
      fr: {
        class1: {
          title: "Classe 1 - Danger immédiat pour la vie",
          description: "Atmosphère dangereuse ou risque immédiat de mort",
          color: '#dc2626'
        },
        class2: {
          title: "Classe 2 - Risque potentiel", 
          description: "Conditions dangereuses possibles nécessitant précautions",
          color: '#f59e0b'
        },
        class3: {
          title: "Classe 3 - Risque minimal",
          description: "Espace avec configuration d'espace clos mais risques minimes",
          color: '#059669'
        }
      },
      en: {
        class1: {
          title: "Class 1 - Immediate danger to life",
          description: "Hazardous atmosphere or immediate risk of death",
          color: '#dc2626'
        },
        class2: {
          title: "Class 2 - Potential risk",
          description: "Potentially hazardous conditions requiring precautions", 
          color: '#f59e0b'
        },
        class3: {
          title: "Class 3 - Minimal risk",
          description: "Confined space configuration but minimal hazards",
          color: '#059669'
        }
      }
    };

    const classifications = csaClassifications[language];
    const currentClassification = siteInfo.csaClass ? 
      classifications[siteInfo.csaClass as keyof typeof classifications] : null;

    return (
      <div style={{ width: '100%' }}>
        <label style={styles.fieldLabel}>
          <Shield style={{ width: '18px', height: '18px' }} />
          {t.csaClass}<span style={{ color: '#dc2626' }}>*</span>
        </label>

        <div style={styles.grid2}>
          <select
            value={siteInfo.csaClass}
            onChange={(e) => updateSiteInfo('csaClass', e.target.value)}
            style={styles.select}
          >
            <option value="">{t.select}</option>
            <option value="class1">{t.csaClasses.class1}</option>
            <option value="class2">{t.csaClasses.class2}</option>
            <option value="class3">{t.csaClasses.class3}</option>
          </select>

          <button
            type="button"
            onClick={() => {
              // Assistant de classification (simplifié)
              const result = window.confirm(
                language === 'fr' 
                  ? 'Assistant de classification CSA disponible dans le module complet de gestion des permis.'
                  : 'CSA classification assistant available in the complete permit management module.'
              );
            }}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white'
            }}
          >
            <Star size={16} />
            <span>{language === 'fr' ? 'Assistant' : 'Wizard'}</span>
          </button>
        </div>

        {currentClassification && (
          <div style={{
            padding: '12px 16px',
            background: `${currentClassification.color}10`,
            border: `1px solid ${currentClassification.color}30`,
            borderRadius: '8px',
            fontSize: isMobile ? '12px' : '13px',
            lineHeight: 1.4,
            marginTop: '12px'
          }}>
            <div style={{
              fontWeight: '600',
              color: `${currentClassification.color}`,
              marginBottom: '4px'
            }}>
              {currentClassification.title}
            </div>
            <div style={{ color: '#d1d5db' }}>
              {currentClassification.description}
            </div>
          </div>
        )}
      </div>
    );
  };

  // =================== COMPOSANT SÉLECTEUR DIMENSIONS ===================
  const DimensionsSelector = () => (
    <div style={{
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '16px',
      padding: '20px'
    }}>
      {/* Sélecteurs de forme et unités */}
      <div style={styles.grid2}>
        <div style={styles.formField}>
          <label style={styles.fieldLabel}>
            <Layers style={{ width: '18px', height: '18px' }} />
            {t.spaceShape}<span style={{ color: '#dc2626' }}>*</span>
          </label>
          <select
            value={siteInfo.dimensions.spaceShape}
            onChange={(e) => updateDimensions({
              spaceShape: e.target.value as any,
              volume: 0
            })}
            style={styles.select}
          >
            <option value="rectangular">📐 {t.rectangular}</option>
            <option value="cylindrical">🔵 {t.cylindrical}</option>
            <option value="spherical">⚪ {t.spherical}</option>
            <option value="irregular">🔷 {t.irregular}</option>
          </select>
        </div>

        <div style={styles.formField}>
          <label style={styles.fieldLabel}>
            <Ruler style={{ width: '18px', height: '18px' }} />
            {t.unitSystem}
          </label>
          <select
            value={siteInfo.unitSystem}
            onChange={(e) => {
              const newSystem = e.target.value as UnitSystem;
              convertUnits(siteInfo.unitSystem, newSystem);
            }}
            style={styles.select}
          >
            <option value="metric">📏 {t.metric}</option>
            <option value="imperial">📐 {t.imperial}</option>
          </select>
        </div>
      </div>

      {/* Champs de dimensions adaptatifs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginBottom: '20px'
      }}>
        {/* Longueur - toujours visible sauf pour sphérique */}
        {siteInfo.dimensions.spaceShape !== 'spherical' && (
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              {t.length} ({siteInfo.unitSystem === 'metric' ? 'm' : 'ft'})
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={siteInfo.dimensions.length || ''}
              onChange={(e) => updateDimensions({
                length: parseFloat(e.target.value) || 0
              })}
              style={styles.input}
            />
          </div>
        )}

        {/* Largeur - seulement pour rectangulaire et irrégulier */}
        {(siteInfo.dimensions.spaceShape === 'rectangular' || 
          siteInfo.dimensions.spaceShape === 'irregular') && (
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              {t.width} ({siteInfo.unitSystem === 'metric' ? 'm' : 'ft'})
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={siteInfo.dimensions.width || ''}
              onChange={(e) => updateDimensions({
                width: parseFloat(e.target.value) || 0
              })}
              style={styles.input}
            />
          </div>
        )}

        {/* Hauteur - pour toutes les formes sauf sphérique */}
        {siteInfo.dimensions.spaceShape !== 'spherical' && (
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              {t.height} ({siteInfo.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={siteInfo.dimensions.height || ''}
              onChange={(e) => updateDimensions({
                height: parseFloat(e.target.value) || 0
              })}
              style={styles.input}
            />
          </div>
        )}

        {/* Diamètre - pour cylindrique et sphérique */}
        {(siteInfo.dimensions.spaceShape === 'cylindrical' || 
          siteInfo.dimensions.spaceShape === 'spherical') && (
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              {t.diameter} ({siteInfo.unitSystem === 'metric' ? 'm' : 'ft'})<span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={siteInfo.dimensions.diameter || ''}
              onChange={(e) => updateDimensions({
                diameter: parseFloat(e.target.value) || 0
              })}
              style={styles.input}
            />
          </div>
        )}
      </div>

      {/* Bouton de calcul et affichage du volume */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button 
          onClick={calculateVolume}
          style={{
            ...styles.button,
            ...styles.buttonSuccess,
            width: 'auto',
            margin: '0 auto'
          }}
        >
          <Gauge size={20} />
          {t.calculateVolume}
        </button>
      </div>

      {/* Affichage du volume calculé */}
      {siteInfo.dimensions.volume > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#10b981', 
            marginBottom: '4px'
          }}>
            {siteInfo.dimensions.volume}
          </div>
          <div style={{ fontSize: '14px', color: '#6ee7b7' }}>
            {siteInfo.unitSystem === 'metric' ? 'm³' : 'ft³'} - {t.volume}
          </div>
        </div>
      )}
    </div>
  );

  // =================== COMPOSANT CARROUSEL PHOTOS SIMPLIFIÉ ===================
  const PhotoCarousel = ({ photos, onAddPhoto }: {
    photos: SpacePhoto[];
    onAddPhoto: () => void;
  }) => {
    const currentIndex = currentPhotoIndex;
    const totalSlides = photos.length + 1;

    const nextSlide = () => setCurrentPhotoIndex((currentIndex + 1) % totalSlides);
    const prevSlide = () => setCurrentPhotoIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);

    return (
      <div style={{
        position: 'relative',
        marginTop: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid #374151',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '250px' : '350px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            transition: 'transform 0.3s ease',
            height: '100%',
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {photos.map((photo: SpacePhoto) => (
              <div key={photo.id} style={{
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
                    borderRadius: '8px'
                  }}
                />
                <div style={{
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
                  <div style={{ flex: 1, marginRight: '12px' }}>
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
                      <p style={{
                        fontSize: isMobile ? '10px' : '11px',
                        opacity: 0.7,
                        margin: 0
                      }}>
                        📍 GPS: {photo.gpsCoords.lat.toFixed(6)}, {photo.gpsCoords.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => {
                        const newCaption = prompt(
                          language === 'fr' ? 'Nouvelle légende:' : 'New caption:', 
                          photo.caption
                        );
                        if (newCaption) {
                          const updatedPhotos = (siteInfo.spacePhotos || []).map(p => 
                            p.id === photo.id ? { ...p, caption: newCaption } : p
                          );
                          safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
                        }
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minWidth: '28px',
                        minHeight: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(language === 'fr' ? 'Supprimer cette photo?' : 'Delete this photo?')) {
                          const updatedPhotos = (siteInfo.spacePhotos || []).filter(p => p.id !== photo.id);
                          safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
                        }
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.8)',
                        border: '1px solid #dc2626',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minWidth: '28px',
                        minHeight: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slide d'ajout de photo */}
            <div 
              onClick={onAddPhoto}
              style={{
                minWidth: '100%',
                height: '100%',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px dashed rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}
            >
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={isMobile ? 20 : 24} color="#3b82f6" />
              </div>
              <h4 style={{ color: '#3b82f6', margin: 0 }}>{t.addPhoto}</h4>
              <p style={{ color: '#93c5fd', margin: 0, fontSize: '14px' }}>{t.takePhoto}</p>
            </div>
          </div>
          
          {/* Navigation */}
          {totalSlides > 1 && (
            <>
              <button 
                onClick={prevSlide}
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
                  justifyContent: 'center'
                }}
              >
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <button 
                onClick={nextSlide}
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
                  justifyContent: 'center'
                }}
              >
                <ArrowRight size={isMobile ? 16 : 20} />
              </button>
            </>
          )}
          
          {/* Indicateurs */}
          {totalSlides > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  style={{
                    width: isMobile ? '8px' : '10px',
                    height: isMobile ? '8px' : '10px',
                    borderRadius: '50%',
                    background: index === currentIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  // =================== RENDU JSX PRINCIPAL ===================
  return (
    <>
      <input
        type="file"
        ref={photoInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />

      <div style={styles.container}>
        {/* Header principal */}
        <div style={styles.headerCard}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(245, 158, 11, 0.05))',
            zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? '16px' : '20px', 
              marginBottom: isMobile ? '20px' : '24px' 
            }}>
              <div style={{
                width: isMobile ? '48px' : '60px',
                height: isMobile ? '48px' : '60px',
                background: 'rgba(220, 38, 38, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(220, 38, 38, 0.3)'
              }}>
                <Building style={{ 
                  width: isMobile ? '24px' : '30px', 
                  height: isMobile ? '24px' : '30px', 
                  color: '#f87171' 
                }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px',
                  lineHeight: 1.2
                }}>
                  🏗️ {t.title}
                </h2>
                <p style={{
                  color: '#d1d5db',
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: 1.5
                }}>
                  {t.subtitle}
                </p>
              </div>
            </div>
            
            {/* Statistiques globales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '20px',
              marginTop: '24px'
            }}>
              <div style={{
                background: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700', 
                  color: '#3b82f6',
                  marginBottom: '4px'
                }}>
                  {selectedProvince}
                </div>
                <div style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  Province
                </div>
              </div>
              <div style={{
                background: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700', 
                  color: '#f59e0b',
                  marginBottom: '4px'
                }}>
                  {((siteInfo.atmosphericHazards?.length || 0) + (siteInfo.physicalHazards?.length || 0))}
                </div>
                <div style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  {language === 'fr' ? 'Dangers' : 'Hazards'}
                </div>
              </div>
              <div style={{
                background: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700', 
                  color: '#10b981',
                  marginBottom: '4px'
                }}>
                  {siteInfo.spacePhotos?.length || 0}
                </div>
                <div style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  Photos
                </div>
              </div>
              <div style={{
                background: 'rgba(17, 24, 39, 0.6)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: '700', 
                  color: '#8b5cf6',
                  marginBottom: '4px'
                }}>
                  {siteInfo.dimensions?.volume || 0}
                </div>
                <div style={{ 
                  color: '#9ca3af', 
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  {siteInfo.unitSystem === 'metric' ? 'm³' : 'ft³'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Informations du Projet */}
        <CollapsibleSection
          id="project-info"
          title={t.projectInfo}
          icon={<Building />}
        >
          <div style={styles.grid2}>
            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Building style={{ width: '18px', height: '18px' }} />
                {t.projectNumber}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder="Ex: CS-2024-001"
                value={siteInfo.projectNumber}
                onChange={(e) => updateSiteInfo('projectNumber', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <MapPin style={{ width: '18px', height: '18px' }} />
                {t.workLocation}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Adresse complète du site' : 'Complete site address'}
                value={siteInfo.workLocation}
                onChange={(e) => updateSiteInfo('workLocation', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <User style={{ width: '18px', height: '18px' }} />
                {t.contractor}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Nom de l\'entreprise contractante' : 'Contracting company name'}
                value={siteInfo.contractor}
                onChange={(e) => updateSiteInfo('contractor', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <User style={{ width: '18px', height: '18px' }} />
                {t.supervisor}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Nom du superviseur' : 'Supervisor name'}
                value={siteInfo.supervisor}
                onChange={(e) => updateSiteInfo('supervisor', e.target.value)}
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
          <div style={styles.grid2}>
            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Calendar style={{ width: '18px', height: '18px' }} />
                {t.entryDate}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="datetime-local" 
                style={styles.input}
                value={siteInfo.entryDate}
                onChange={(e) => updateSiteInfo('entryDate', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Clock style={{ width: '18px', height: '18px' }} />
                {t.duration}
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Ex: 4 heures' : 'Ex: 4 hours'}
                value={siteInfo.duration}
                onChange={(e) => updateSiteInfo('duration', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Users style={{ width: '18px', height: '18px' }} />
                {t.workerCount}
              </label>
              <input 
                type="number" 
                min="1" 
                style={styles.input}
                value={siteInfo.workerCount}
                onChange={(e) => updateSiteInfo('workerCount', parseInt(e.target.value) || 1)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <FileText style={{ width: '18px', height: '18px' }} />
                {t.workDescription}
              </label>
              <textarea 
                style={styles.textarea}
                placeholder={language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description'}
                value={siteInfo.workDescription}
                onChange={(e) => updateSiteInfo('workDescription', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Identification de l'Espace Clos */}
        <CollapsibleSection
          id="space-identification"
          title={t.spaceIdentification}
          icon={<Home />}
        >
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              {t.spaceType}<span style={{ color: '#dc2626' }}>*</span>
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
                    background: siteInfo.spaceType === key ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${siteInfo.spaceType === key ? '#3b82f6' : '#374151'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => updateSiteInfo('spaceType', key)}
                >
                  <div style={{ fontSize: '24px' }}>
                    {key === 'tank' ? '🏗️' : key === 'vessel' ? '⚗️' : key === 'silo' ? '🌾' : 
                     key === 'pit' ? '🕳️' : key === 'vault' ? '🏛️' : key === 'tunnel' ? '🚇' : 
                     key === 'trench' ? '🚧' : key === 'manhole' ? '🔧' : key === 'storage' ? '📦' : 
                     key === 'boiler' ? '🔥' : key === 'duct' ? '🌪️' : key === 'chamber' ? '🏢' : '❓'}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '12px' : '13px', 
                    fontWeight: '600', 
                    textAlign: 'center', 
                    wordWrap: 'break-word',
                    color: 'white'
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formField}>
            <CSAClassificationSelector />
          </div>
        </CollapsibleSection>

        {/* Section Dimensions et Volume */}
        <CollapsibleSection
          id="dimensions"
          title={t.spaceDimensions}
          icon={<Ruler />}
        >
          <DimensionsSelector />
        </CollapsibleSection>

        {/* Section Points d'Entrée */}
        <CollapsibleSection
          id="entry-points"
          title={t.entryPoints}
          icon={<Home />}
        >
          {(siteInfo.entryPoints || []).map((entry, index) => (
            <div key={entry.id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
                {(siteInfo.entryPoints || []).length > 1 && (
                  <button 
                    onClick={() => removeEntryPoint(entry.id)}
                    type="button"
                    style={{
                      ...styles.button,
                      ...styles.buttonDanger,
                      width: 'auto',
                      padding: '8px 12px', 
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                    {t.remove}
                  </button>
                )}
              </div>

              <div style={styles.grid3}>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>{t.entryType}</label>
                  <select
                    style={styles.select}
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

                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>{t.entryDimensions}</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder={language === 'fr' ? 'Ex: 60cm x 40cm ou Ø80cm' : 'Ex: 60cm x 40cm or Ø80cm'}
                    value={entry.dimensions}
                    onChange={(e) => updateEntryPoint(entry.id, 'dimensions', e.target.value)}
                  />
                </div>

                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>{t.entryLocation}</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder={language === 'fr' ? 'Ex: Partie supérieure, côté nord' : 'Ex: Top section, north side'}
                    value={entry.location}
                    onChange={(e) => updateEntryPoint(entry.id, 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={addEntryPoint}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                width: 'auto'
              }}
            >
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
        >
          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              <Wind style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              {t.atmosphericHazards}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {Object.entries(translations[language].atmosphericHazardTypes || {
                oxygen_deficiency: language === 'fr' ? "Déficience en oxygène (<19.5%)" : "Oxygen deficiency (<19.5%)",
                oxygen_enrichment: language === 'fr' ? "Enrichissement en oxygène (>23%)" : "Oxygen enrichment (>23%)",
                flammable_gases: language === 'fr' ? "Gaz inflammables/combustibles" : "Flammable/combustible gases",
                toxic_gases: language === 'fr' ? "Gaz toxiques" : "Toxic gases",
                hydrogen_sulfide: language === 'fr' ? "Sulfure d'hydrogène (H2S)" : "Hydrogen sulfide (H2S)",
                carbon_monoxide: language === 'fr' ? "Monoxyde de carbone (CO)" : "Carbon monoxide (CO)",
                carbon_dioxide: language === 'fr' ? "Dioxyde de carbone (CO2)" : "Carbon dioxide (CO2)",
                methane: language === 'fr' ? "Méthane (CH4)" : "Methane (CH4)",
                ammonia: language === 'fr' ? "Ammoniac (NH3)" : "Ammonia (NH3)",
                chlorine: language === 'fr' ? "Chlore (Cl2)" : "Chlorine (Cl2)",
                nitrogen: language === 'fr' ? "Azote (N2)" : "Nitrogen (N2)",
                argon: language === 'fr' ? "Argon (Ar)" : "Argon (Ar)",
                welding_fumes: language === 'fr' ? "Fumées de soudage" : "Welding fumes"
              }).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: (siteInfo.atmosphericHazards || []).includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${(siteInfo.atmosphericHazards || []).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                  onClick={() => toggleAtmosphericHazard(key)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${(siteInfo.atmosphericHazards || []).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '4px',
                    background: (siteInfo.atmosphericHazards || []).includes(key) ? '#dc2626' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {(siteInfo.atmosphericHazards || []).includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: (siteInfo.atmosphericHazards || []).includes(key) ? '#fecaca' : '#d1d5db', 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: '500',
                    lineHeight: 1.4,
                    wordWrap: 'break-word'
                  }}>
                    🌪️ {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.fieldLabel}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
              {t.physicalHazards}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {Object.entries(translations[language].physicalHazardTypes || {
                engulfment: language === 'fr' ? "Ensevelissement/Engloutissement" : "Engulfment",
                crushing: language === 'fr' ? "Écrasement par équipement" : "Crushing by equipment",
                electrical: language === 'fr' ? "Dangers électriques" : "Electrical hazards",
                mechanical: language === 'fr' ? "Dangers mécaniques" : "Mechanical hazards",
                structural_collapse: language === 'fr' ? "Effondrement structural" : "Structural collapse",
                falls: language === 'fr' ? "Chutes de hauteur" : "Falls from height",
                temperature_extreme: language === 'fr' ? "Températures extrêmes" : "Extreme temperatures",
                noise: language === 'fr' ? "Bruit excessif" : "Excessive noise",
                vibration: language === 'fr' ? "Vibrations" : "Vibrations",
                radiation: language === 'fr' ? "Radiation" : "Radiation",
                chemical_exposure: language === 'fr' ? "Exposition chimique" : "Chemical exposure",
                biological: language === 'fr' ? "Dangers biologiques" : "Biological hazards",
                confined_space_hazard: language === 'fr' ? "Configuration de l'espace" : "Space configuration",
                traffic: language === 'fr' ? "Circulation/Trafic" : "Traffic/Circulation"
              }).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: (siteInfo.physicalHazards || []).includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${(siteInfo.physicalHazards || []).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                  onClick={() => togglePhysicalHazard(key)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${(siteInfo.physicalHazards || []).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '4px',
                    background: (siteInfo.physicalHazards || []).includes(key) ? '#dc2626' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {(siteInfo.physicalHazards || []).includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: (siteInfo.physicalHazards || []).includes(key) ? '#fecaca' : '#d1d5db', 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: '500',
                    lineHeight: 1.4,
                    wordWrap: 'break-word'
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
          icon={<Wind />}
        >
          <div style={styles.grid2}>
            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Wind style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Ventilation requise' : 'Ventilation required'}
              </label>
              <select
                style={styles.select}
                value={siteInfo.environmentalConditions?.ventilationRequired ? 'yes' : 'no'}
                onChange={(e) => updateEnvironmentalCondition('ventilationRequired', e.target.value === 'yes')}
              >
                <option value="no">{t.no}</option>
                <option value="yes">{t.yes}</option>
              </select>
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Wind style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Type de ventilation' : 'Ventilation type'}
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Ex: Naturelle, mécanique' : 'Ex: Natural, mechanical'}
                value={siteInfo.environmentalConditions?.ventilationType || ''}
                onChange={(e) => updateEnvironmentalCondition('ventilationType', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Eye style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Conditions d\'éclairage' : 'Lighting conditions'}
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Ex: Éclairage artificiel requis' : 'Ex: Artificial lighting required'}
                value={siteInfo.environmentalConditions?.lightingConditions || ''}
                onChange={(e) => updateEnvironmentalCondition('lightingConditions', e.target.value)}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.fieldLabel}>
                <Thermometer style={{ width: '18px', height: '18px' }} />
                {language === 'fr' ? 'Plage de température' : 'Temperature range'}
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Ex: 15-25°C' : 'Ex: 59-77°F'}
                value={siteInfo.environmentalConditions?.temperatureRange || ''}
                onChange={(e) => updateEnvironmentalCondition('temperatureRange', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Documentation Photographique */}
        <CollapsibleSection
          id="photo-documentation"
          title={t.photoDocumentation}
          icon={<Camera />}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
            gap: '8px', 
            marginBottom: '16px' 
          }}>
            <button 
              onClick={() => handlePhotoCapture('exterior')}
              style={{
                ...styles.button,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <Camera size={14} />
              {t.photoCategories.exterior}
            </button>
            <button 
              onClick={() => handlePhotoCapture('interior')}
              style={{
                ...styles.button,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <Camera size={14} />
              {t.photoCategories.interior}
            </button>
            <button 
              onClick={() => handlePhotoCapture('entry')}
              style={{
                ...styles.button,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <Camera size={14} />
              {t.photoCategories.entry}
            </button>
            <button 
              onClick={() => handlePhotoCapture('hazards')}
              style={{
                ...styles.button,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <AlertTriangle size={14} />
              {t.photoCategories.hazards}
            </button>
            <button 
              onClick={() => handlePhotoCapture('equipment')}
              style={{
                ...styles.button,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <Shield size={14} />
              {t.photoCategories.equipment}
            </button>
            <button 
              onClick={() => handlePhotoCapture('safety')}
              style={{
                ...styles.button,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              <Shield size={14} />
              {t.photoCategories.safety}
            </button>
          </div>

          {(siteInfo.spacePhotos || []).length > 0 ? (
            <PhotoCarousel 
              photos={siteInfo.spacePhotos || []}
              onAddPhoto={() => handlePhotoCapture('interior')}
            />
          ) : (
            <div 
              onClick={() => handlePhotoCapture('exterior')}
              style={{
                border: '2px dashed #60a5fa',
                borderRadius: '16px',
                padding: isMobile ? '30px 20px' : '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                minHeight: isMobile ? '120px' : '150px',
                justifyContent: 'center',
                background: 'rgba(96, 165, 250, 0.1)'
              }}
            >
              <Camera size={isMobile ? 28 : 32} color="#60a5fa" />
              <h4 style={{ color: '#60a5fa', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>
                {t.noPhotos}
              </h4>
              <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', color: '#9ca3af' }}>
                {t.takePhoto}
              </p>
            </div>
          )}
        </CollapsibleSection>

        {/* Footer avec informations légales */}
        <div style={{
          ...styles.card,
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '12px' 
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'url(/c-secur360-logo.png) no-repeat center',
              backgroundSize: 'contain'
            }}></div>
            <h3 style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700' 
            }}>
              C-SECUR360
            </h3>
          </div>
          <p style={{ 
            color: '#d1d5db', 
            fontSize: '12px', 
            margin: 0, 
            lineHeight: 1.5 
          }}>
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
              'Gestion complète via SafetyManager - Sauvegarde automatique activée' :
              'Complete management via SafetyManager - Auto-save enabled'
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default React.memo(SiteInformation);
