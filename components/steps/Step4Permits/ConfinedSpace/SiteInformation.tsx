// SiteInformation.tsx - PARTIE 1/2 - Version ComplÃ¨te CorrigÃ©e Compatible SafetyManager Build Ready
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, Building, Phone, MapPin, Calendar, Clock, Users, User, Briefcase, 
  AlertTriangle, Camera, Upload, X, Settings, Wrench, Droplets, 
  Wind, Flame, Eye, Trash2, Plus, ArrowLeft, ArrowRight, Home, Layers, 
  Ruler, Gauge, Thermometer, Activity, Shield, Zap, CheckCircle, 
  ChevronDown, ChevronUp, Info, Star, Globe, Wifi, Navigation, Check
} from 'lucide-react';

// Import des types et du hook centralisÃ©
import {
  ConfinedSpaceComponentProps,
  ConfinedSpaceDetails,
  Dimensions,
  EntryPoint,
  SpacePhoto,
  generatePermitId
} from './SafetyManager';

import { styles, isMobile } from './styles';

// =================== TYPES LOCAUX ===================
type UnitSystem = 'metric' | 'imperial';

// =================== TRADUCTIONS COMPLÃˆTES ===================
const translations = {
  fr: {
    title: "Informations du Site - Espace Clos",
    subtitle: "Identification et Ã©valuation complÃ¨te de l'espace de travail confinÃ©",
    
    // Sections principales
    projectInfo: "Informations du Projet",
    planning: "Planification",
    spaceIdentification: "Identification de l'Espace Clos",
    spaceDimensions: "Dimensions et Volume",
    entryPoints: "Points d'EntrÃ©e et AccÃ¨s",
    hazardAssessment: "Ã‰valuation des Dangers",
    environmentalConditions: "Conditions Environnementales",
    spaceContent: "Contenu et Historique",
    safetyMeasures: "Mesures de SÃ©curitÃ©",
    photoDocumentation: "Documentation Photographique",
    
    // Champs du formulaire
    projectNumber: "NumÃ©ro de projet",
    workLocation: "Lieu des travaux",
    contractor: "Entrepreneur",
    supervisor: "Superviseur",
    entryDate: "Date d'entrÃ©e prÃ©vue",
    duration: "DurÃ©e estimÃ©e",
    workerCount: "Nombre de travailleurs",
    workDescription: "Description des travaux",
    
    // UnitÃ©s
    unitSystem: "SystÃ¨me d'unitÃ©s",
    metric: "MÃ©trique (m)",
    imperial: "ImpÃ©rial (ft)",
    
    // Formes d'espaces
    spaceShape: "Forme de l'espace",
    rectangular: "Rectangulaire",
    cylindrical: "Cylindrique",
    spherical: "SphÃ©rique",
    irregular: "IrrÃ©gulier",
    
    // Types d'espaces
    spaceType: "Type d'espace",
    spaceTypes: {
      tank: "RÃ©servoir",
      vessel: "Cuve/RÃ©cipient", 
      silo: "Silo",
      pit: "Fosse",
      vault: "VoÃ»te",
      tunnel: "Tunnel",
      trench: "TranchÃ©e",
      manhole: "Regard d'Ã©gout",
      storage: "Espace de stockage",
      boiler: "ChaudiÃ¨re",
      duct: "Conduit",
      chamber: "Chambre",
      other: "Autre"
    },
    
    // Classifications CSA
    csaClass: "Classification CSA",
    csaClasses: {
      class1: "Classe 1 - Danger immÃ©diat pour la vie",
      class2: "Classe 2 - Risque potentiel",
      class3: "Classe 3 - Risque minimal"
    },
    
    // Dimensions
    length: "Longueur",
    width: "Largeur", 
    height: "Hauteur",
    diameter: "DiamÃ¨tre",
    volume: "Volume calculÃ©",
    calculateVolume: "Calculer Volume",
    
    // Points d'entrÃ©e
    entryPoint: "Point d'entrÃ©e",
    entryType: "Type d'entrÃ©e",
    entryDimensions: "Dimensions",
    entryLocation: "Localisation",
    entryCondition: "Ã‰tat",
    entryAccessibility: "AccessibilitÃ©",
    addEntryPoint: "Ajouter point d'entrÃ©e",
    
    // Dangers
    atmosphericHazards: "Dangers AtmosphÃ©riques",
    physicalHazards: "Dangers Physiques",
    selectHazards: "SÃ©lectionnez tous les dangers prÃ©sents",
    
    // Photos
    addPhoto: "Ajouter photo",
    takePhoto: "Prendre photo",
    noPhotos: "Aucune photo",
    photoCategories: {
      exterior: "ExtÃ©rieur",
      interior: "IntÃ©rieur",
      entry: "Points d'entrÃ©e",
      hazards: "Dangers",
      equipment: "Ã‰quipement",
      safety: "SÃ©curitÃ©"
    },
    
    // Dangers atmosphÃ©riques
    atmosphericHazardTypes: {
      oxygen_deficiency: "DÃ©ficience en oxygÃ¨ne (<19.5%)",
      oxygen_enrichment: "Enrichissement en oxygÃ¨ne (>23%)",
      flammable_gases: "Gaz inflammables/combustibles",
      toxic_gases: "Gaz toxiques",
      hydrogen_sulfide: "Sulfure d'hydrogÃ¨ne (H2S)",
      carbon_monoxide: "Monoxyde de carbone (CO)",
      carbon_dioxide: "Dioxyde de carbone (CO2)",
      methane: "MÃ©thane (CH4)",
      ammonia: "Ammoniac (NH3)",
      chlorine: "Chlore (Cl2)",
      nitrogen: "Azote (N2)",
      argon: "Argon (Ar)",
      welding_fumes: "FumÃ©es de soudage"
    },

    // Dangers physiques
    physicalHazardTypes: {
      engulfment: "Ensevelissement/Engloutissement",
      crushing: "Ã‰crasement par Ã©quipement",
      electrical: "Dangers Ã©lectriques",
      mechanical: "Dangers mÃ©caniques",
      structural_collapse: "Effondrement structural",
      falls: "Chutes de hauteur",
      temperature_extreme: "TempÃ©ratures extrÃªmes",
      noise: "Bruit excessif",
      vibration: "Vibrations",
      radiation: "Radiation",
      chemical_exposure: "Exposition chimique",
      biological: "Dangers biologiques",
      confined_space_hazard: "Configuration de l'espace",
      traffic: "Circulation/Trafic"
    },

    // Actions
    save: "Sauvegarder",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Retirer",
    select: "SÃ©lectionner",
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
    
    // UnitÃ©s
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
    
    // Points d'entrÃ©e
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
    
    // Dangers atmosphÃ©riques
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

    // Dangers physiques
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

// =================== COMPOSANT PRINCIPAL REFACTORISÃ‰ ===================
const SiteInformation: React.FC<ConfinedSpaceComponentProps> = ({
  language,
  permitData,
  selectedProvince,
  regulations,
  isMobile,
  safetyManager,
  onUpdate,
  onSectionComplete,
  onValidationChange
}) => {
  // âœ… CORRECTION 1 & 2 : AccÃ¨s sÃ©curisÃ© aux donnÃ©es avec fallbacks SafetyManager
  const siteInfo = React.useMemo(() => {
    // Essai avec permitData fourni en props
    if (permitData?.siteInformation) {
      return permitData.siteInformation;
    }
    
    // Essai avec SafetyManager currentPermit
    if (safetyManager) {
      try {
        const currentPermit = safetyManager.currentPermit;
        if (currentPermit?.siteInformation) {
          return currentPermit.siteInformation;
        }
      } catch (error) {
        console.warn('SafetyManager currentPermit.siteInformation access failed:', error);
      }
    }
    
    // Fallback : objet vide avec structure par dÃ©faut
    return {
      projectNumber: '',
      workLocation: '',
      contractor: '',
      supervisor: '',
      entryDate: '',
      duration: '',
      workerCount: 1,
      workDescription: '',
      spaceType: '',
      csaClass: '',
      unitSystem: 'metric' as UnitSystem,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        diameter: 0,
        volume: 0,
        spaceShape: 'rectangular' as any
      },
      entryPoints: [{
        id: generatePermitId(),
        type: 'circular',
        dimensions: '',
        location: '',
        condition: 'good',
        accessibility: 'normal',
        photos: []
      }],
      atmosphericHazards: [],
      physicalHazards: [],
      environmentalConditions: {},
      spacePhotos: []
    };
  }, [permitData, safetyManager]);
  
  // Ã‰tats pour l'interface seulement
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];

  // =================== HANDLERS CORRIGÃ‰S - UTILISENT SAFETYMANAGER SÃ‰CURISÃ‰ ===================
  // âœ… CORRECTION 3 : Handler updateSiteInfo avec vÃ©rifications SafetyManager
  const updateSiteInfo = useCallback((field: string, value: any) => {
    const updates = { [field]: value };
    
    // VÃ©rification SafetyManager disponible
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation(updates);
      } catch (error) {
        console.warn('SafetyManager updateSiteInformation failed:', error);
      }
    }
    
    // Callback vers le parent si fourni
    if (onUpdate) {
      onUpdate('siteInformation', updates);
    }
    
    // âœ… CORRECTION 4 : Validation avec vÃ©rifications SafetyManager
    if (onValidationChange && safetyManager) {
      try {
        const validation = safetyManager.validateSection('siteInformation');
        onValidationChange(validation.isValid, validation.errors);
      } catch (error) {
        console.warn('SafetyManager validateSection failed:', error);
        // Fallback validation basique
        const isValid = Boolean(updates.projectNumber || siteInfo.projectNumber) && 
                        Boolean(updates.workLocation || siteInfo.workLocation);
        onValidationChange(isValid, isValid ? [] : ['Projet et lieu requis']);
      }
    }
    
    // Fallback : si pas de SafetyManager, log des donnÃ©es
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour updateSiteInfo:', { field, value });
    }
  }, [safetyManager, onUpdate, onValidationChange, siteInfo.projectNumber, siteInfo.workLocation]);

  // âœ… CORRECTION 5 : Handler updateDimensions avec vÃ©rifications SafetyManager
  const updateDimensions = useCallback((dimensionUpdates: Partial<Dimensions>) => {
    const updatedDimensions = { ...siteInfo.dimensions, ...dimensionUpdates };
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ dimensions: updatedDimensions });
      } catch (error) {
        console.warn('SafetyManager updateSiteInformation dimensions failed:', error);
      }
    }
    
    if (onUpdate) {
      onUpdate('siteInformation', { dimensions: updatedDimensions });
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour updateDimensions:', dimensionUpdates);
    }
  }, [safetyManager, siteInfo.dimensions, onUpdate]);

  // âœ… CORRECTION BUILD CRITIQUE 6 : Handler updateEnvironmentalCondition avec conversion des types undefined -> boolean
  const updateEnvironmentalCondition = useCallback((field: string, value: any) => {
    // âœ… SOLUTION POUR L'ERREUR DE BUILD : Conversion des valeurs undefined vers des boolÃ©ens par dÃ©faut
    const sanitizedValue = value === undefined ? false : value;
    const currentConditions = siteInfo.environmentalConditions || {};
    
    // âœ… TYPE ASSERTION EXPLICITE pour Ã©viter l'erreur Property does not exist on type '{}'
    const typedCurrentConditions = currentConditions as {
      ventilationRequired?: boolean;
      ventilationType?: string;
      lightingConditions?: string;
      temperatureRange?: string;
      moistureLevel?: string;
      noiseLevel?: string;
      weatherConditions?: string;
    };
    
    // âœ… Construire updatedConditions avec type assertion
    const updatedConditions = { 
      ...typedCurrentConditions, 
      [field]: sanitizedValue 
    };
    
    // âœ… CONVERSION EXPLICITE pour respecter l'interface EnvironmentalConditions stricte
    const typeSafeConditions = {
      ventilationRequired: Boolean(updatedConditions.ventilationRequired ?? false),
      ventilationType: String(updatedConditions.ventilationType ?? ''),
      lightingConditions: String(updatedConditions.lightingConditions ?? ''),
      temperatureRange: String(updatedConditions.temperatureRange ?? ''),
      moistureLevel: String(updatedConditions.moistureLevel ?? ''),
      noiseLevel: String(updatedConditions.noiseLevel ?? ''),
      weatherConditions: String(updatedConditions.weatherConditions ?? '')
    };
    
    if (safetyManager) {
      try {
        // âœ… UTILISER typeSafeConditions au lieu de updatedConditions pour Ã©liminer l'erreur de build
        safetyManager.updateSiteInformation({ environmentalConditions: typeSafeConditions });
      } catch (error) {
        console.warn('SafetyManager updateSiteInformation environmentalConditions failed:', error);
      }
    }
    
    if (onUpdate) {
      onUpdate('siteInformation', { environmentalConditions: typeSafeConditions });
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour updateEnvironmentalCondition:', { field, value: sanitizedValue });
    }
  }, [safetyManager, siteInfo.environmentalConditions, onUpdate]);
  // SiteInformation.tsx - PARTIE 2/2 - Fonctions AvancÃ©es et Rendu JSX Complet

  // =================== CALCUL VOLUME ===================
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

  // =================== CONVERSION D'UNITÃ‰S ===================
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
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ 
          dimensions: convertedDimensions,
          unitSystem: toSystem 
        });
      } catch (error) {
        console.warn('SafetyManager convertUnits failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour convertUnits');
    }
  }, [safetyManager, siteInfo]);

  // =================== GESTION DES POINTS D'ENTRÃ‰E ===================
  const addEntryPoint = useCallback(() => {
    const newEntryPoint = {
      id: generatePermitId(),
      type: 'circular',
      dimensions: '',
      location: '',
      condition: 'good',
      accessibility: 'normal',
      photos: []
    };
    
    const updatedEntryPoints = [...(siteInfo.entryPoints || []), newEntryPoint];
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
      } catch (error) {
        console.warn('SafetyManager addEntryPoint failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour addEntryPoint');
    }
  }, [safetyManager, siteInfo.entryPoints]);

  const removeEntryPoint = useCallback((entryId: string) => {
    const currentEntryPoints = siteInfo.entryPoints || [];
    if (currentEntryPoints.length <= 1) {
      alert(language === 'fr' ? 'Au moins un point d\'entrÃ©e est requis' : 'At least one entry point is required');
      return;
    }
    
    const updatedEntryPoints = currentEntryPoints.filter(entry => entry.id !== entryId);
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
      } catch (error) {
        console.warn('SafetyManager removeEntryPoint failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour removeEntryPoint');
    }
  }, [safetyManager, siteInfo.entryPoints, language]);

  const updateEntryPoint = useCallback((entryId: string, field: string, value: any) => {
    const currentEntryPoints = siteInfo.entryPoints || [];
    const updatedEntryPoints = currentEntryPoints.map(entry =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    );
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ entryPoints: updatedEntryPoints });
      } catch (error) {
        console.warn('SafetyManager updateEntryPoint failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour updateEntryPoint');
    }
  }, [safetyManager, siteInfo.entryPoints]);

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
    defaultCollapsed = false 
  }: {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultCollapsed?: boolean;
  }) => {
    const isCollapsed = collapsedSections.has(id) || (defaultCollapsed && !collapsedSections.has(id));

    return (
      <div style={styles.card}>
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

  // =================== COMPOSANT SÃ‰LECTEUR CSA ===================
  const CSAClassificationSelector = () => {
    const csaClassifications = {
      fr: {
        class1: {
          title: "Classe 1 - Danger immÃ©diat pour la vie",
          description: "AtmosphÃ¨re dangereuse ou risque immÃ©diat de mort",
          color: '#dc2626'
        },
        class2: {
          title: "Classe 2 - Risque potentiel", 
          description: "Conditions dangereuses possibles nÃ©cessitant prÃ©cautions",
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
        <label style={styles.label}>
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
              const result = window.confirm(
                language === 'fr' 
                  ? 'Assistant de classification CSA disponible dans le module complet de gestion des permis.'
                  : 'CSA classification assistant available in the complete permit management module.'
              );
            }}
            style={{
              ...styles.button,
              ...styles.buttonWarning
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

  // =================== COMPOSANT SÃ‰LECTEUR DIMENSIONS ===================
  const DimensionsSelector = () => (
    <div style={{
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '16px',
      padding: '20px'
    }}>
      {/* SÃ©lecteurs de forme et unitÃ©s */}
      <div style={styles.grid2}>
        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>
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
            <option value="rectangular">ðŸ“ {t.rectangular}</option>
            <option value="cylindrical">ðŸ”µ {t.cylindrical}</option>
            <option value="spherical">âšª {t.spherical}</option>
            <option value="irregular">ðŸ”· {t.irregular}</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={styles.label}>
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
            <option value="metric">ðŸ“ {t.metric}</option>
            <option value="imperial">ðŸ“ {t.imperial}</option>
          </select>
        </div>
      </div>

      {/* Champs de dimensions adaptatifs */}
      <div style={styles.grid4}>
        {/* Longueur - toujours visible sauf pour sphÃ©rique */}
        {siteInfo.dimensions.spaceShape !== 'spherical' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
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

        {/* Largeur - seulement pour rectangulaire et irrÃ©gulier */}
        {(siteInfo.dimensions.spaceShape === 'rectangular' || 
          siteInfo.dimensions.spaceShape === 'irregular') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
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

        {/* Hauteur - pour toutes les formes sauf sphÃ©rique */}
        {siteInfo.dimensions.spaceShape !== 'spherical' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
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

        {/* DiamÃ¨tre - pour cylindrique et sphÃ©rique */}
        {(siteInfo.dimensions.spaceShape === 'cylindrical' || 
          siteInfo.dimensions.spaceShape === 'spherical') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
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

      {/* Affichage du volume calculÃ© */}
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
            {siteInfo.unitSystem === 'metric' ? 'mÂ³' : 'ftÂ³'} - {t.volume}
          </div>
        </div>
      )}
    </div>
  );

  // =================== GESTION DES DANGERS AVEC SAFETYMANAGER SÃ‰CURISÃ‰ ===================
  // âœ… CORRECTION 7 : toggleAtmosphericHazard avec vÃ©rifications SafetyManager
  const toggleAtmosphericHazard = useCallback((hazardType: string) => {
    const currentHazards = (siteInfo.atmosphericHazards || []) as string[];
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ atmosphericHazards: updatedHazards });
      } catch (error) {
        console.warn('SafetyManager toggleAtmosphericHazard failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour toggleAtmosphericHazard:', hazardType);
    }
  }, [safetyManager, siteInfo.atmosphericHazards]);

  // âœ… CORRECTION 8 : togglePhysicalHazard avec vÃ©rifications SafetyManager
  const togglePhysicalHazard = useCallback((hazardType: string) => {
    const currentHazards = (siteInfo.physicalHazards || []) as string[];
    const updatedHazards = currentHazards.includes(hazardType)
      ? currentHazards.filter(h => h !== hazardType)
      : [...currentHazards, hazardType];
    
    if (safetyManager) {
      try {
        safetyManager.updateSiteInformation({ physicalHazards: updatedHazards });
      } catch (error) {
        console.warn('SafetyManager togglePhysicalHazard failed:', error);
      }
    }
    
    if (!safetyManager) {
      console.warn('SafetyManager non disponible pour togglePhysicalHazard:', hazardType);
    }
  }, [safetyManager, siteInfo.physicalHazards]);

  // =================== GESTION DES PHOTOS AVEC SAFETYMANAGER SÃ‰CURISÃ‰ ===================
  // âœ… CORRECTION 9 : handlePhotoCapture avec vÃ©rifications SafetyManager
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
              id: generatePermitId(),
              url: event.target?.result as string,
              category,
              caption: `${t.photoCategories?.[category as keyof typeof t.photoCategories] || category} - ${new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}`,
              timestamp: new Date().toISOString(),
              location: 'Localisation en cours...'
            };

            // GÃ©olocalisation
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  newPhoto.location = `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                  newPhoto.gpsCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  
                  const currentPhotos = siteInfo.spacePhotos || [];
                  const updatedPhotos = [...currentPhotos, newPhoto];
                  
                  // âœ… VÃ©rification SafetyManager pour photos
                  if (safetyManager) {
                    try {
                      safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
                    } catch (error) {
                      console.warn('SafetyManager photo update with GPS failed:', error);
                    }
                  }
                  
                  if (!safetyManager) {
                    console.warn('SafetyManager non disponible pour photo GPS:', newPhoto);
                  }
                }, 
                () => {
                  newPhoto.location = 'Localisation non disponible';
                  const currentPhotos = siteInfo.spacePhotos || [];
                  const updatedPhotos = [...currentPhotos, newPhoto];
                  
                  // âœ… VÃ©rification SafetyManager pour photos sans GPS
                  if (safetyManager) {
                    try {
                      safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
                    } catch (error) {
                      console.warn('SafetyManager photo update without GPS failed:', error);
                    }
                  }
                  
                  if (!safetyManager) {
                    console.warn('SafetyManager non disponible pour photo sans GPS:', newPhoto);
                  }
                }
              );
            } else {
              const currentPhotos = siteInfo.spacePhotos || [];
              const updatedPhotos = [...currentPhotos, newPhoto];
              
              // âœ… VÃ©rification SafetyManager pour photos sans gÃ©olocalisation
              if (safetyManager) {
                try {
                  safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
                } catch (error) {
                  console.warn('SafetyManager photo update no geolocation failed:', error);
                }
              }
              
              if (!safetyManager) {
                console.warn('SafetyManager non disponible pour photo no geolocation:', newPhoto);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      };
      photoInputRef.current.click();
    }
  }, [safetyManager, siteInfo.spacePhotos, t.photoCategories, language]);

  // âœ… CORRECTION 10 : handlePhotoDelete avec vÃ©rifications SafetyManager
  const handlePhotoDelete = useCallback((photoId: string) => {
    if (confirm(language === 'fr' ? 'Supprimer cette photo?' : 'Delete this photo?')) {
      const updatedPhotos = (siteInfo.spacePhotos || []).filter(p => p.id !== photoId);
      
      if (safetyManager) {
        try {
          safetyManager.updateSiteInformation({ spacePhotos: updatedPhotos });
        } catch (error) {
          console.warn('SafetyManager handlePhotoDelete failed:', error);
        }
      }
      
      if (!safetyManager) {
        console.warn('SafetyManager non disponible pour handlePhotoDelete:', photoId);
      }
    }
  }, [safetyManager, siteInfo.spacePhotos, language]);

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
        <div style={{
          ...styles.card,
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
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
                <h2 style={styles.title}>
                  ðŸ—ï¸ {t.title}
                </h2>
                <p style={styles.subtitle}>
                  {t.subtitle}
                </p>
              </div>
            </div>
            
            {/* Statistiques globales */}
            <div style={styles.grid4}>
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
                  {siteInfo.unitSystem === 'metric' ? 'mÂ³' : 'ftÂ³'}
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
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
                <MapPin style={{ width: '18px', height: '18px' }} />
                {t.workLocation}<span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input 
                type="text" 
                style={styles.input}
                placeholder={language === 'fr' ? 'Adresse complÃ¨te du site' : 'Complete site address'}
                value={siteInfo.workLocation}
                onChange={(e) => updateSiteInfo('workLocation', e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
                <FileText style={{ width: '18px', height: '18px' }} />
                {t.workDescription}
              </label>
              <textarea 
                style={styles.textarea}
                placeholder={language === 'fr' ? 'Description dÃ©taillÃ©e des travaux' : 'Detailed work description'}
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
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
              {t.spaceType}<span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={styles.grid4}>
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
                    {key === 'tank' ? 'ðŸ—ï¸' : key === 'vessel' ? 'âš—ï¸' : key === 'silo' ? 'ðŸŒ¾' : 
                     key === 'pit' ? 'ðŸ•³ï¸' : key === 'vault' ? 'ðŸ›ï¸' : key === 'tunnel' ? 'ðŸš‡' : 
                     key === 'trench' ? 'ðŸš§' : key === 'manhole' ? 'ðŸ”§' : key === 'storage' ? 'ðŸ“¦' : 
                     key === 'boiler' ? 'ðŸ”¥' : key === 'duct' ? 'ðŸŒªï¸' : key === 'chamber' ? 'ðŸ¢' : 'â“'}
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

          <CSAClassificationSelector />
        </CollapsibleSection>

        {/* Section Dimensions et Volume */}
        <CollapsibleSection
          id="dimensions"
          title={t.spaceDimensions}
          icon={<Ruler />}
        >
          <DimensionsSelector />
        </CollapsibleSection>

        {/* Section Points d'EntrÃ©e */}
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
                  ðŸšª {t.entryPoint} {index + 1}
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
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>{t.entryType}</label>
                  <select
                    style={styles.select}
                    value={entry.type}
                    onChange={(e) => updateEntryPoint(entry.id, 'type', e.target.value)}
                  >
                    <option value="circular">ðŸ”µ {language === 'fr' ? 'Circulaire' : 'Circular'}</option>
                    <option value="rectangular">ðŸŸ¨ {language === 'fr' ? 'Rectangulaire' : 'Rectangular'}</option>
                    <option value="square">ðŸŸ« {language === 'fr' ? 'CarrÃ©' : 'Square'}</option>
                    <option value="oval">ðŸ¥š {language === 'fr' ? 'Ovale' : 'Oval'}</option>
                    <option value="irregular">ðŸ”· {language === 'fr' ? 'IrrÃ©gulier' : 'Irregular'}</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>{t.entryDimensions}</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder={language === 'fr' ? 'Ex: 60cm x 40cm ou Ã˜80cm' : 'Ex: 60cm x 40cm or Ã˜80cm'}
                    value={entry.dimensions}
                    onChange={(e) => updateEntryPoint(entry.id, 'dimensions', e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>{t.entryLocation}</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    placeholder={language === 'fr' ? 'Ex: Partie supÃ©rieure, cÃ´tÃ© nord' : 'Ex: Top section, north side'}
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

        {/* Section Ã‰valuation des Dangers */}
        <CollapsibleSection
          id="hazard-assessment"
          title={t.hazardAssessment}
          icon={<AlertTriangle />}
        >
          <div style={{ marginBottom: '24px' }}>
            <label style={styles.label}>
              <Wind style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              {t.atmosphericHazards}
            </label>
            <div style={styles.gridMobile}>
              {Object.entries(t.atmosphericHazardTypes).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: ((siteInfo.atmosphericHazards || []) as string[]).includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${((siteInfo.atmosphericHazards || []) as string[]).includes(key) ? '#dc2626' : '#374151'}`,
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
                    border: `2px solid ${((siteInfo.atmosphericHazards || []) as string[]).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '4px',
                    background: ((siteInfo.atmosphericHazards || []) as string[]).includes(key) ? '#dc2626' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {((siteInfo.atmosphericHazards || []) as string[]).includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: ((siteInfo.atmosphericHazards || []) as string[]).includes(key) ? '#fecaca' : '#d1d5db', 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: '500',
                    lineHeight: 1.4
                  }}>
                    ðŸŒªï¸ {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#dc2626' }} />
              {t.physicalHazards}
            </label>
            <div style={styles.gridMobile}>
              {Object.entries(t.physicalHazardTypes).map(([key, label]) => (
                <div
                  key={key}
                  style={{
                    padding: '12px',
                    background: ((siteInfo.physicalHazards || []) as string[]).includes(key) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                    border: `2px solid ${((siteInfo.physicalHazards || []) as string[]).includes(key) ? '#dc2626' : '#374151'}`,
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
                    border: `2px solid ${((siteInfo.physicalHazards || []) as string[]).includes(key) ? '#dc2626' : '#374151'}`,
                    borderRadius: '4px',
                    background: ((siteInfo.physicalHazards || []) as string[]).includes(key) ? '#dc2626' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {((siteInfo.physicalHazards || []) as string[]).includes(key) && <Check size={12} color="white" />}
                  </div>
                  <span style={{ 
                    color: ((siteInfo.physicalHazards || []) as string[]).includes(key) ? '#fecaca' : '#d1d5db', 
                    fontSize: isMobile ? '13px' : '14px', 
                    fontWeight: '500',
                    lineHeight: 1.4
                  }}>
                    âš¡ {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Section Documentation Photographique */}
        <CollapsibleSection
          id="photo-documentation"
          title={t.photoDocumentation}
          icon={<Camera />}
        >
          <div style={styles.grid3}>
            {Object.entries(t.photoCategories).map(([key, label]) => (
              <button 
                key={key}
                onClick={() => handlePhotoCapture(key)}
                style={{
                  ...styles.button,
                  background: key === 'hazards' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${key === 'hazards' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                  color: key === 'hazards' ? '#dc2626' : '#3b82f6',
                  fontSize: isMobile ? '12px' : '13px'
                }}
              >
                <Camera size={14} />
                {label}
              </button>
            ))}
          </div>

          {(siteInfo.spacePhotos || []).length > 0 ? (
            <div style={{
              marginTop: '16px',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {(siteInfo.spacePhotos || []).map((photo) => (
                <div key={photo.id} style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #374151'
                }}>
                  <img 
                    src={photo.url} 
                    alt={photo.caption}
                    style={{
                      width: '100%',
                      height: isMobile ? '120px' : '150px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                    color: 'white',
                    padding: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {t.photoCategories[photo.category as keyof typeof t.photoCategories] || photo.category}
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      {new Date(photo.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePhotoDelete(photo.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(239, 68, 68, 0.8)',
                      border: 'none',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
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
                background: 'rgba(96, 165, 250, 0.1)',
                marginTop: '16px'
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

        {/* Footer avec informations lÃ©gales */}
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
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>C</div>
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
              'SystÃ¨me de Gestion de SÃ©curitÃ© Industrielle - ConformitÃ© RÃ©glementaire Provinciale' :
              'Industrial Safety Management System - Provincial Regulatory Compliance'
            }
            <br />
            {language === 'fr' ? 
              `Province: ${selectedProvince} - ${regulations[selectedProvince]?.authority || 'AutoritÃ© CompÃ©tente'}` :
              `Province: ${selectedProvince} - ${regulations[selectedProvince]?.authority || 'Competent Authority'}`
            }
            <br />
            {language === 'fr' ? 
              'Gestion complÃ¨te via SafetyManager - Sauvegarde automatique activÃ©e' :
              'Complete management via SafetyManager - Auto-save enabled'
            }
          </p>
        </div>
      </div>
    </>
  );
};

export default memo(SiteInformation);
