// =================== COMPONENTS/FORMS/HEIGHTWORKFORM.TSX - FORMULAIRE TRAVAIL EN HAUTEUR ULTRA-COMPLET ===================
// Formulaire travail en hauteur révolutionnaire avec systèmes anti-chute, échafaudages et protection individuelle

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Save, Send, CheckCircle, XCircle, 
  AlertTriangle, Activity, Users, Shield, Zap, FileText,
  Building2, MapPin, Mic, Wind
} from 'lucide-react';
import type {
  ApprovalLevel,
  SignatureData,
  InspectionRecord,
  Certification,
  TestResult,
  CalibrationRecord,
  EquipmentItem,
  PPEItem,
  CommunicationPlan,
  ContactInfo
} from '../../types/shared';

// =================== TYPES LOCAUX SPÉCIFIQUES HAUTEUR ===================

// Interface ProcedureStep locale pour éviter conflit
interface HeightProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  required: boolean;
  estimatedTime?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface PersonnelMember locale pour éviter conflit
interface HeightPersonnelMember {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  entreprise: string;
  age: number;
  experience: number;
  certifications: Certification[];
  medicalValid: boolean;
  medicalExpiry?: Date;
  heightCertifications: string[];
  heightExperience: number; // years
  lastHeightTraining: Date;
  maxWorkHeight: number; // metres
}

interface HeightWorkFormData {
  identification: {
    permitType: 'hauteur';
    permitNumber: string;
    workType: 'echafaudage' | 'echelle' | 'toiture' | 'facade' | 'mur-rideau' | 'installation-antenne' | 'nettoyage-vitres' | 'maintenance-hvac';
    location: { 
      address: string; 
      coordinates?: { lat: number; lng: number }; 
      specificLocation: string;
      buildingHeight: number; // metres
      workHeight: number; // metres
      accessType: string;
      buildingType: string;
      constructionYear?: number;
    };
    workDescription: string;
    riskAssessment: {
      fallRisk: 'low' | 'medium' | 'high' | 'critical';
      weatherSensitive: boolean;
      publicExposure: boolean;
      structuralRisk: boolean;
      proximityPowerLines: boolean;
      roofAccess: boolean;
    };
    startDate: Date;
    endDate: Date;
    estimatedDuration: number;
    contractor: { 
      name: string; 
      license: string; 
      contact: string; 
      insuranceHeight: string;
      specialtyLicense: string;
    };
  };

  fallProtection: {
    primarySystem: {
      type: 'garde-corps' | 'harnais-longe' | 'filet-securite' | 'plateforme-elevatrice' | 'echafaudage-certifie';
      manufacturer: string;
      model: string;
      certification: string;
      lastInspection: Date;
      nextInspection: Date;
      anchoragePoints: AnchoragePoint[];
      capacity: number; // kN
      standard: string;
    };
    backupSystem?: {
      type: string;
      certification: string;
      anchoragePoints: AnchoragePoint[];
      capacity: number;
    };
    rescueEquipment: RescueEquipment[];
    ppe: HeightPPE[];
    safetySystems: SafetySystem[];
  };

  accessEquipment: {
    scaffolding?: ScaffoldingSystem;
    ladders?: LadderEquipment[];
    aerialPlatforms?: AerialPlatform[];
    ropeSystems?: RopeAccessSystem[];
    liftingSystems?: LiftingSystem[];
  };

  personnel: {
    superviseur: HeightPersonnelMember[];
    travailleurs: HeightPersonnelMember[];
    surveillants: HeightPersonnelMember[];
    sauveteurs: HeightPersonnelMember[];
    riggers?: HeightPersonnelMember[];
    inspecteurs?: HeightPersonnelMember[];
  };

  environmentalConditions: {
    weatherLimits: {
      maxWindSpeed: number; // km/h
      minVisibility: number; // metres
      maxPrecipitation: boolean;
      temperatureRange: { min: number; max: number; };
      lightningRestrictions: boolean;
      iceConditions: boolean;
    };
    currentConditions: {
      windSpeed: number;
      visibility: number;
      precipitation: boolean;
      temperature: number;
      forecast: string;
      uvIndex?: number;
      airQuality?: string;
    };
    monitoring: {
      required: boolean;
      frequency: number; // minutes
      parameters: string[];
      alertThresholds: Record<string, number>;
      monitoringEquipment: string[];
    };
  };

  emergencyProcedures: {
    rescuePlan: {
      hasRescuePlan: boolean;
      planNumber?: string;
      responseTime: number; // minutes
      rescueTeam: string[];
      equipment: string[];
      trainingDate?: Date;
      drillFrequency: number; // months
    };
    communicationPlan: {
      primary: 'radio' | 'cellular' | 'whistle' | 'hand-signals';
      backup: string;
      emergencyNumbers: string[];
      checkInFrequency: number; // minutes
      escalationProcedure: string;
    };
    evacuationProcedures: HeightProcedureStep[];
    medicalAccess: {
      accessRoute: string;
      evacuationMethod: string;
      nearestHospital: string;
      estimatedTime: number; // minutes
      specializedEquipment: string[];
    };
  };

  validation: {
    inspections: InspectionRecord[];
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    issuedBy?: SignatureData;
    issuedAt?: Date;
    validUntil?: Date;
    engineerApproval?: SignatureData;
    heightSpecialistApproval?: SignatureData;
  };
}

interface AnchoragePoint {
  id: string;
  type: 'structural' | 'temporary' | 'mobile' | 'engineered';
  location: string;
  capacity: number; // kN
  certification: string;
  lastTested: Date;
  nextTest: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  material: string;
  installationDate: Date;
}

interface RescueEquipment {
  id: string;
  type: 'treuil-sauvetage' | 'descenseur' | 'brancard-evacuation' | 'kit-premiers-secours' | 'corde-sauvetage';
  capacity?: number;
  lastInspection: Date;
  nextInspection: Date;
  location: string;
  assignedTo: string;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
}

interface HeightPPE {
  id: string;
  type: 'harnais' | 'longe' | 'casque' | 'chaussures-securite' | 'gants-adherents' | 'protection-oculaire' | 'antichute-mobile';
  standard: string; // CSA Z259.10, ANSI Z359, etc.
  size: string;
  condition: 'new' | 'good' | 'acceptable' | 'retired';
  lastInspection: Date;
  nextInspection: Date;
  assignedTo: string;
  serialNumber: string;
}

interface SafetySystem {
  id: string;
  type: 'collective' | 'individual' | 'administrative';
  description: string;
  effectiveness: 'high' | 'medium' | 'low';
  maintenance: string;
  responsible: string;
}

interface ScaffoldingSystem {
  id: string;
  type: 'cadre' | 'tube-boulon' | 'modulaire' | 'suspendu';
  manufacturer: string;
  height: number; // metres
  levels: number;
  loadCapacity: number; // kg/m²
  certification: string;
  installer: string;
  installerLicense: string;
  lastInspection: Date;
  nextInspection: Date;
  components: ScaffoldingComponent[];
  engineerApproval: boolean;
}

interface ScaffoldingComponent {
  id: string;
  type: 'cadre' | 'plateau' | 'console' | 'garde-corps' | 'ancrage' | 'contreventement';
  quantity: number;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  serialNumbers: string[];
  material: string;
  loadRating: number; // kg
}

interface LadderEquipment {
  id: string;
  type: 'simple' | 'coulissante' | 'articulee' | 'plateforme' | 'escabeau';
  material: 'aluminum' | 'fiberglass' | 'steel' | 'wood';
  height: number; // metres
  loadCapacity: number; // kg
  certification: string;
  lastInspection: Date;
  nextInspection: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  angleRestrictions: { min: number; max: number; }; // degrees
}

interface AerialPlatform {
  id: string;
  type: 'nacelle-ciseaux' | 'nacelle-bras' | 'nacelle-mât' | 'plateforme-suspendue';
  manufacturer: string;
  model: string;
  maxHeight: number; // metres
  loadCapacity: number; // kg
  powerSource: 'electric' | 'diesel' | 'hybrid' | 'manual';
  lastInspection: Date;
  nextInspection: Date;
  operator: string;
  operatorCertification: string;
  operatorExpiry: Date;
}

interface RopeAccessSystem {
  id: string;
  type: 'double-corde' | 'corde-statique' | 'descendeur-monte';
  ropeSpecification: string;
  length: number; // metres
  diameter: number; // mm
  breakingStrength: number; // kN
  lastInspection: Date;
  nextInspection: Date;
  certifiedTechnician: string;
  technicanLicense: string;
}

interface LiftingSystem {
  id: string;
  type: 'grue-mobile' | 'palan' | 'treuil' | 'monte-charge';
  capacity: number; // kg
  certification: string;
  operator: string;
  operatorCertification: string;
  lastInspection: Date;
  nextInspection: Date;
}

// =================== CONFIGURATION ===================
const HEIGHT_WORK_TYPES = {
  'echafaudage': {
    icon: '🏗️',
    title: { fr: 'Échafaudage', en: 'Scaffolding' },
    description: { fr: 'Travaux sur échafaudage fixe', en: 'Work on fixed scaffolding' },
    minHeight: 3, // metres
    requiredCertifications: ['echafaudage-monteur', 'travail-hauteur']
  },
  'echelle': {
    icon: '🪜',
    title: { fr: 'Échelle', en: 'Ladder' },
    description: { fr: 'Travaux sur échelle portable', en: 'Work on portable ladder' },
    minHeight: 3,
    requiredCertifications: ['travail-hauteur', 'echelle-securite']
  },
  'toiture': {
    icon: '🏠',
    title: { fr: 'Toiture', en: 'Roofing' },
    description: { fr: 'Travaux de toiture/couverture', en: 'Roofing/covering work' },
    minHeight: 2,
    requiredCertifications: ['travail-toiture', 'harnais-toiture']
  },
  'facade': {
    icon: '🏢',
    title: { fr: 'Façade', en: 'Facade' },
    description: { fr: 'Travaux façade/revêtement', en: 'Facade/cladding work' },
    minHeight: 4,
    requiredCertifications: ['travail-facade', 'nacelle-aerienne']
  },
  'mur-rideau': {
    icon: '🪟',
    title: { fr: 'Mur-rideau', en: 'Curtain wall' },
    description: { fr: 'Installation mur-rideau/vitrage', en: 'Curtain wall/glazing installation' },
    minHeight: 10,
    requiredCertifications: ['vitrier-hauteur', 'mur-rideau-specialiste']
  },
  'installation-antenne': {
    icon: '📡',
    title: { fr: 'Installation antenne', en: 'Antenna installation' },
    description: { fr: 'Télécommunications/antennes', en: 'Telecommunications/antennas' },
    minHeight: 15,
    requiredCertifications: ['telecom-hauteur', 'rf-safety']
  },
  'nettoyage-vitres': {
    icon: '🪟',
    title: { fr: 'Nettoyage vitres', en: 'Window cleaning' },
    description: { fr: 'Nettoyage extérieur bâtiment', en: 'External building cleaning' },
    minHeight: 6,
    requiredCertifications: ['nettoyage-hauteur', 'corde-acces']
  },
  'maintenance-hvac': {
    icon: '❄️',
    title: { fr: 'Maintenance HVAC', en: 'HVAC maintenance' },
    description: { fr: 'Maintenance équipements toit', en: 'Roof equipment maintenance' },
    minHeight: 5,
    requiredCertifications: ['hvac-hauteur', 'refrigeration-safety']
  }
};

const FALL_PROTECTION_TYPES = {
  'garde-corps': { 
    title: { fr: 'Garde-corps', en: 'Guardrails' },
    minHeight: 1.1, // metres
    capacity: 1.5, // kN/m
    standard: 'CSA S269.2'
  },
  'harnais-longe': {
    title: { fr: 'Harnais + longe', en: 'Harness + lanyard' },
    capacity: 22, // kN
    standard: 'CSA Z259.10'
  },
  'filet-securite': {
    title: { fr: 'Filet de sécurité', en: 'Safety net' },
    capacity: 2.3, // kN/m²
    standard: 'ANSI A10.11'
  },
  'plateforme-elevatrice': {
    title: { fr: 'Plateforme élévatrice', en: 'Aerial platform' },
    capacity: 230, // kg/person
    standard: 'CSA B354.6'
  },
  'echafaudage-certifie': {
    title: { fr: 'Échafaudage certifié', en: 'Certified scaffolding' },
    capacity: 4.8, // kN/m²
    standard: 'CSA S269.2'
  }
};

const PROVINCIAL_REGULATIONS = {
  QC: {
    minHeightRequiringProtection: 3.0, // metres
    maxWindSpeed: 40, // km/h
    requiredRescueTime: 10, // minutes
    inspectionFrequency: {
      daily: true,
      weekly: false,
      monthly: true
    },
    anchorageStrength: 22, // kN minimum
    references: {
      regulation: 'RSST, art. 2.9.1-2.9.3',
      standard: 'CSA Z259 series',
      authority: 'CNESST'
    }
  },
  ON: {
    minHeightRequiringProtection: 3.0,
    maxWindSpeed: 35,
    requiredRescueTime: 15,
    inspectionFrequency: {
      daily: true,
      weekly: true,
      monthly: true
    },
    anchorageStrength: 22,
    references: {
      regulation: 'O. Reg. 213/91, Part III',
      standard: 'CAN/CSA Z259 series',
      authority: 'Ministry of Labour'
    }
  },
  AB: {
    minHeightRequiringProtection: 3.0,
    maxWindSpeed: 50, // Plus élevé en Alberta
    requiredRescueTime: 12,
    inspectionFrequency: {
      daily: true,
      weekly: false,
      monthly: true
    },
    anchorageStrength: 22,
    references: {
      regulation: 'OHS Code Part 9',
      standard: 'CSA Z259 series',
      authority: 'Alberta Labour'
    }
  },
  BC: {
    minHeightRequiringProtection: 3.0,
    maxWindSpeed: 40,
    requiredRescueTime: 10,
    inspectionFrequency: {
      daily: true,
      weekly: true,
      monthly: true
    },
    anchorageStrength: 22,
    references: {
      regulation: 'OHS Regulation Part 11',
      standard: 'CSA Z259 series',
      authority: 'WorkSafeBC'
    }
  }
};

const FORM_SECTIONS = [
  { id: 'identification', title: { fr: 'Identification', en: 'Identification' }, icon: FileText, estimatedTime: 6 },
  { id: 'fallProtection', title: { fr: 'Protection chute', en: 'Fall protection' }, icon: Shield, estimatedTime: 12 },
  { id: 'accessEquipment', title: { fr: 'Équipements accès', en: 'Access equipment' }, icon: Building2, estimatedTime: 10 },
  { id: 'personnel', title: { fr: 'Personnel', en: 'Personnel' }, icon: Users, estimatedTime: 8 },
  { id: 'environmentalConditions', title: { fr: 'Conditions environnementales', en: 'Environmental conditions' }, icon: Wind, estimatedTime: 7 },
  { id: 'emergencyProcedures', title: { fr: 'Procédures urgence', en: 'Emergency procedures' }, icon: Zap, estimatedTime: 9 },
  { id: 'validation', title: { fr: 'Validation', en: 'Validation' }, icon: CheckCircle, estimatedTime: 4 }
];

// =================== PROPS ===================
interface HeightWorkFormProps {
  permitId?: string;
  initialData?: Partial<HeightWorkFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: HeightWorkFormData) => Promise<void>;
  onSubmit: (data: HeightWorkFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function HeightWorkForm({
  permitId, initialData, language, province, userRole, onSave, onSubmit, onCancel, touchOptimized = true
}: HeightWorkFormProps) {
  
  // =================== ÉTAT ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<HeightWorkFormData>(() => ({
    identification: {
      permitType: 'hauteur',
      permitNumber: `HW-${Date.now()}`,
      workType: 'echafaudage',
      location: { 
        address: '', 
        specificLocation: '',
        buildingHeight: 0,
        workHeight: 0,
        accessType: '',
        buildingType: ''
      },
      workDescription: '',
      riskAssessment: {
        fallRisk: 'medium',
        weatherSensitive: true,
        publicExposure: false,
        structuralRisk: false,
        proximityPowerLines: false,
        roofAccess: false
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      estimatedDuration: 8,
      contractor: { 
        name: '', 
        license: '', 
        contact: '', 
        insuranceHeight: '',
        specialtyLicense: ''
      }
    },
    fallProtection: {
      primarySystem: {
        type: 'harnais-longe',
        manufacturer: '',
        model: '',
        certification: '',
        lastInspection: new Date(),
        nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        anchoragePoints: [],
        capacity: 22,
        standard: 'CSA Z259.10'
      },
      rescueEquipment: [],
      ppe: [],
      safetySystems: []
    },
    accessEquipment: {},
    personnel: {
      superviseur: [], 
      travailleurs: [], 
      surveillants: [], 
      sauveteurs: []
    },
    environmentalConditions: {
      weatherLimits: {
        maxWindSpeed: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxWindSpeed || 40,
        minVisibility: 100,
        maxPrecipitation: false,
        temperatureRange: { min: -20, max: 35 },
        lightningRestrictions: true,
        iceConditions: false
      },
      currentConditions: {
        windSpeed: 0,
        visibility: 1000,
        precipitation: false,
        temperature: 20,
        forecast: ''
      },
      monitoring: {
        required: true,
        frequency: 30,
        parameters: ['wind', 'visibility', 'precipitation', 'temperature'],
        alertThresholds: {
          windSpeed: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxWindSpeed || 40,
          visibility: 100
        },
        monitoringEquipment: []
      }
    },
    emergencyProcedures: {
      rescuePlan: {
        hasRescuePlan: false,
        responseTime: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredRescueTime || 10,
        rescueTeam: [],
        equipment: [],
        drillFrequency: 6
      },
      communicationPlan: {
        primary: 'radio',
        backup: '',
        emergencyNumbers: [],
        checkInFrequency: 15,
        escalationProcedure: ''
      },
      evacuationProcedures: [],
      medicalAccess: {
        accessRoute: '',
        evacuationMethod: '',
        nearestHospital: '',
        estimatedTime: 0,
        specializedEquipment: []
      }
    },
    validation: {
      inspections: [],
      approvals: [],
      signatures: [],
      permitStatus: 'draft'
    },
    ...initialData
  }));

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // =================== FONCTIONS ===================
  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'selection' | 'navigation') => {
    if (!touchOptimized || !navigator.vibrate) return;
    const patterns = {
      success: [50, 25, 50], error: [100, 50, 100, 50, 100], warning: [100, 50, 100],
      selection: [25], navigation: [10]
    };
    navigator.vibrate(patterns[type]);
  }, [touchOptimized]);

  const autoSave = useCallback(async () => {
    if (!isDirty || isAutoSaving) return;
    setIsAutoSaving(true);
    try {
      await onSave(formData);
      setLastSaved(new Date());
      setIsDirty(false);
      hapticFeedback('success');
    } catch (error) {
      console.error('Auto-save failed:', error);
      hapticFeedback('error');
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, isDirty, isAutoSaving, onSave, hapticFeedback]);

  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(autoSave, 2000);
    }
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
  }, [isDirty, autoSave]);

  const updateFormData = useCallback((section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof HeightWorkFormData], [field]: value }
    }));
    setIsDirty(true);
    hapticFeedback('selection');
  }, [hapticFeedback]);

  const validateSection = useCallback((sectionIndex: number) => {
    const section = FORM_SECTIONS[sectionIndex];
    const errors: string[] = [];
    
    switch (section.id) {
      case 'identification':
        if (!formData.identification.location.address.trim()) {
          errors.push(language === 'fr' ? 'Adresse requise' : 'Address required');
        }
        if (!formData.identification.workDescription.trim()) {
          errors.push(language === 'fr' ? 'Description travaux requise' : 'Work description required');
        }
        if (formData.identification.location.workHeight < (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3)) {
          errors.push(language === 'fr' ? `Hauteur minimale ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3}m requise` : `Minimum height ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3}m required`);
        }
        break;
      case 'fallProtection':
        if (!formData.fallProtection.primarySystem.manufacturer.trim()) {
          errors.push(language === 'fr' ? 'Système protection primaire requis' : 'Primary protection system required');
        }
        if (formData.fallProtection.primarySystem.anchoragePoints?.length === 0) {
          errors.push(language === 'fr' ? 'Points d\'ancrage requis' : 'Anchorage points required');
        }
        break;
      case 'personnel':
        if (formData.personnel.superviseur.length === 0) {
          errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
        }
        if (formData.personnel.travailleurs.length === 0) {
          errors.push(language === 'fr' ? 'Travailleurs requis' : 'Workers required');
        }
        break;
      case 'environmentalConditions':
        if (formData.environmentalConditions.currentConditions.windSpeed > formData.environmentalConditions.weatherLimits.maxWindSpeed) {
          errors.push(language === 'fr' ? 'Vitesse du vent trop élevée' : 'Wind speed too high');
        }
        if (formData.environmentalConditions.currentConditions.visibility < formData.environmentalConditions.weatherLimits.minVisibility) {
          errors.push(language === 'fr' ? 'Visibilité insuffisante' : 'Insufficient visibility');
        }
        break;
      case 'emergencyProcedures':
        if (!formData.emergencyProcedures.rescuePlan.hasRescuePlan) {
          errors.push(language === 'fr' ? 'Plan de sauvetage requis' : 'Rescue plan required');
        }
        if (formData.emergencyProcedures.rescuePlan.responseTime > (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredRescueTime || 15)) {
          errors.push(language === 'fr' ? `Temps de réponse max ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredRescueTime || 15}min` : `Max response time ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredRescueTime || 15}min`);
        }
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [section.id]: errors }));
    return errors.length === 0;
  }, [formData, language, province]);

  const navigateToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= FORM_SECTIONS.length) return;
    const isCurrentValid = validateSection(currentSection);
    if (!isCurrentValid && sectionIndex > currentSection) {
      hapticFeedback('error');
      return;
    }
    setCurrentSection(sectionIndex);
    hapticFeedback('navigation');
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection, validateSection, hapticFeedback]);

  const calculateProgress = useCallback(() => {
    const completedSections = FORM_SECTIONS.filter((_, index) => validateSection(index)).length;
    return {
      percentage: (completedSections / FORM_SECTIONS.length) * 100,
      completedSections,
      totalSections: FORM_SECTIONS.length,
      estimatedTimeRemaining: FORM_SECTIONS.slice(currentSection + 1).reduce((acc, section) => acc + section.estimatedTime, 0)
    };
  }, [currentSection, validateSection]);

  const progress = calculateProgress();

  // =================== RENDU SECTIONS ===================
  const renderCurrentSection = () => {
    const section = FORM_SECTIONS[currentSection];
    switch (section.id) {
      case 'identification': return renderIdentificationSection();
      case 'fallProtection': return renderFallProtectionSection();
      case 'accessEquipment': return renderAccessEquipmentSection();
      case 'personnel': return renderPersonnelSection();
      case 'environmentalConditions': return renderEnvironmentalConditionsSection();
      case 'emergencyProcedures': return renderEmergencyProceduresSection();
      case 'validation': return renderValidationSection();
      default: return <div>Section non trouvée</div>;
    }
  };

  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-sky-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="h-6 w-6 text-sky-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis travail en hauteur' : 'Height work permit identification'}
          </h3>
        </div>
        
        {/* Numéro de permis */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Numéro de permis' : 'Permit number'}
          </label>
          <input
            type="text"
            value={formData.identification.permitNumber}
            onChange={(e) => updateFormData('identification', 'permitNumber', e.target.value)}
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            placeholder="HW-2024-001"
          />
        </div>

        {/* Type de travail en hauteur */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Type de travail en hauteur' : 'Height work type'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {Object.entries(HEIGHT_WORK_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData('identification', 'workType', key)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all min-h-[44px]
                  ${formData.identification.workType === key
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{config.title[language]}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {config.description[language]}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Localisation et hauteurs */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Localisation' : 'Location'}
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={formData.identification.location.address}
              onChange={(e) => updateFormData('identification', 'location', {
                ...formData.identification.location,
                address: e.target.value
              })}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder={language === 'fr' ? 'Adresse du bâtiment' : 'Building address'}
            />
            <button
              type="button"
              className="px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Hauteur du bâtiment (m)' : 'Building height (m)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.identification.location.buildingHeight}
                onChange={(e) => updateFormData('identification', 'location', {
                  ...formData.identification.location,
                  buildingHeight: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Hauteur de travail (m)' : 'Work height (m)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.identification.location.workHeight}
                onChange={(e) => updateFormData('identification', 'location', {
                  ...formData.identification.location,
                  workHeight: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          
          <div className="mt-2 text-xs text-sky-700">
            {language === 'fr' 
              ? `Protection obligatoire à partir de ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3}m (${province})`
              : `Protection required from ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3}m (${province})`
            }
          </div>
        </div>

        {/* Évaluation des risques */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-3">
            {language === 'fr' ? 'Évaluation des risques' : 'Risk assessment'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Risque de chute' : 'Fall risk'}
              </label>
              <select
                value={formData.identification.riskAssessment.fallRisk}
                onChange={(e) => updateFormData('identification', 'riskAssessment', {
                  ...formData.identification.riskAssessment,
                  fallRisk: e.target.value as 'low' | 'medium' | 'high' | 'critical'
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="low">{language === 'fr' ? 'Faible' : 'Low'}</option>
                <option value="medium">{language === 'fr' ? 'Moyen' : 'Medium'}</option>
                <option value="high">{language === 'fr' ? 'Élevé' : 'High'}</option>
                <option value="critical">{language === 'fr' ? 'Critique' : 'Critical'}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'weatherSensitive', label: { fr: 'Sensible aux conditions météo', en: 'Weather sensitive' } },
                { key: 'publicExposure', label: { fr: 'Exposition du public', en: 'Public exposure' } },
                { key: 'structuralRisk', label: { fr: 'Risque structurel', en: 'Structural risk' } },
                { key: 'proximityPowerLines', label: { fr: 'Proximité lignes électriques', en: 'Proximity to power lines' } }
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={formData.identification.riskAssessment[item.key as keyof typeof formData.identification.riskAssessment] as boolean}
                    onChange={(e) => updateFormData('identification', 'riskAssessment', {
                      ...formData.identification.riskAssessment,
                      [item.key]: e.target.checked
                    })}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <label htmlFor={item.key} className="text-sm text-gray-700">
                    {item.label[language]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description des travaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description'}
          </label>
          <div className="flex space-x-2">
            <textarea
              value={formData.identification.workDescription}
              onChange={(e) => updateFormData('identification', 'workDescription', e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder={language === 'fr' 
                ? 'Ex: Installation revêtement façade, 12 étages, échafaudage suspendu...'
                : 'Ex: Facade cladding installation, 12 floors, suspended scaffolding...'
              }
            />
            <button
              type="button"
              className="px-4 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dates et entrepreneur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Date début' : 'Start date'}
            </label>
            <input
              type="datetime-local"
              value={formData.identification.startDate.toISOString().slice(0, 16)}
              onChange={(e) => updateFormData('identification', 'startDate', new Date(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Entrepreneur spécialisé' : 'Specialized contractor'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.name}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                name: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
            />
          </div>
        </div>

        {/* Information réglementaire */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            {language === 'fr' ? `Réglementation ${province}` : `${province} Regulation`}
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              {language === 'fr' ? 'Hauteur min protection' : 'Min protection height'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.minHeightRequiringProtection || 3}m
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Vitesse vent max' : 'Max wind speed'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxWindSpeed || 40} km/h
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Temps sauvetage max' : 'Max rescue time'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredRescueTime || 15} min
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFallProtectionSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Systèmes de protection contre les chutes' : 'Fall protection systems'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section protection chute - À implémenter avec harnais, points ancrage, systèmes collectifs'
            : 'Fall protection section - To implement with harnesses, anchor points, collective systems'
          }
        </div>
      </div>
    </div>
  );

  const renderAccessEquipmentSection = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Équipements d\'accès en hauteur' : 'Height access equipment'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section équipements accès - À implémenter avec échafaudages, échelles, nacelles, cordes'
            : 'Access equipment section - To implement with scaffolding, ladders, platforms, ropes'
          }
        </div>
      </div>
    </div>
  );

  const renderPersonnelSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Personnel certifié hauteur' : 'Height certified personnel'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel - À implémenter avec certifications hauteur, formations sauvetage'
            : 'Personnel section - To implement with height certifications, rescue training'
          }
        </div>
      </div>
    </div>
  );

  const renderEnvironmentalConditionsSection = () => (
    <div className="space-y-6">
      <div className="bg-cyan-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wind className="h-6 w-6 text-cyan-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Conditions environnementales et météo' : 'Environmental and weather conditions'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section conditions environnementales - À implémenter avec monitoring météo, limites vent'
            : 'Environmental conditions section - To implement with weather monitoring, wind limits'
          }
        </div>
      </div>
    </div>
  );

  const renderEmergencyProceduresSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Procédures d\'urgence et sauvetage' : 'Emergency and rescue procedures'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section urgence - À implémenter avec plans sauvetage, communication, évacuation médicale'
            : 'Emergency section - To implement with rescue plans, communication, medical evacuation'
          }
        </div>
      </div>
    </div>
  );

  const renderValidationSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Validation et inspections sécurité' : 'Validation and safety inspections'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec inspections équipements, signatures spécialisées'
            : 'Validation section - To implement with equipment inspections, specialized signatures'
          }
        </div>
      </div>
    </div>
  );

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header sticky identique aux autres formulaires */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {language === 'fr' ? 'Progression' : 'Progress'}: {Math.round(progress.percentage)}%
              </span>
              <span className="text-xs text-gray-500">
                {progress.estimatedTimeRemaining > 0 && (
                  <>{progress.estimatedTimeRemaining} {language === 'fr' ? 'min restantes' : 'min remaining'}</>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex space-x-1 overflow-x-auto pb-2">
            {FORM_SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isCompleted = validateSection(index);
              const isCurrent = index === currentSection;
              const hasErrors = validationErrors[section.id]?.length > 0;
              
              return (
                <button
                  key={section.id}
                  onClick={() => navigateToSection(index)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors
                    ${isCurrent 
                      ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                      : isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : hasErrors
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{section.title[language]}</span>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                  {hasErrors && <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {isAutoSaving && (
                <>
                  <Activity className="h-3 w-3 animate-spin" />
                  <span>{language === 'fr' ? 'Sauvegarde...' : 'Saving...'}</span>
                </>
              )}
              {lastSaved && !isAutoSaving && (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{language === 'fr' ? 'Sauvé à' : 'Saved at'} {lastSaved.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div ref={formRef} className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentSection()}
          </motion.div>
        </AnimatePresence>

        {/* Erreurs de validation */}
        {validationErrors[FORM_SECTIONS[currentSection].id]?.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="text-sm font-medium text-red-800">
                {language === 'fr' ? 'Erreurs à corriger' : 'Errors to fix'}
              </h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors[FORM_SECTIONS[currentSection].id].map((error, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateToSection(currentSection - 1)}
            disabled={currentSection === 0}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{language === 'fr' ? 'Précédent' : 'Previous'}</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={autoSave}
              disabled={!isDirty || isAutoSaving}
              className="flex items-center space-x-2 px-4 py-3 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 disabled:opacity-50 min-h-[44px] transition-colors"
            >
              <Save className="h-5 w-5" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Sauver' : 'Save'}</span>
            </button>

            {currentSection === FORM_SECTIONS.length - 1 && (
              <button
                onClick={() => onSubmit(formData)}
                disabled={progress.percentage < 100 || isSubmitting}
                className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 min-h-[44px] transition-colors"
              >
                <Send className="h-5 w-5" />
                <span>{language === 'fr' ? 'Soumettre' : 'Submit'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => navigateToSection(currentSection + 1)}
            disabled={currentSection === FORM_SECTIONS.length - 1}
            className="flex items-center space-x-2 px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
