// =================== COMPONENTS/FORMS/LIFTINGFORM.TSX - FORMULAIRE LEVAGE/GRUTAGE ULTRA-COMPLET ===================
// Formulaire levage révolutionnaire avec calculs charges, inspection équipements et plans de levage

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Save, Send, CheckCircle, XCircle, 
  AlertTriangle, Activity, Users, Shield, FileText,
  Calculator, Truck, MapPin, Mic
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

// =================== TYPES LOCAUX SPÉCIFIQUES LEVAGE ===================

// Interface ProcedureStep locale pour éviter conflit
interface LiftingProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  required: boolean;
  estimatedTime?: number;
  safetyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface PersonnelMember locale pour éviter conflit
interface LiftingPersonnelMember {
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
  liftingCertifications: string[];
  maxLiftCapacity: number; // tonnes
  lastLiftingTraining: Date;
  signalCertified: boolean;
}

interface LiftingFormData {
  identification: {
    permitType: 'levage';
    permitNumber: string;
    liftType: 'grue-mobile' | 'grue-tour' | 'palan' | 'treuil' | 'chariot-elevateur' | 'levage-manuel';
    location: { 
      address: string; 
      coordinates?: { lat: number; lng: number }; 
      specificLocation: string;
      groundConditions: string;
      obstacles: string[];
      accessRoutes: string[];
      soilBearing: number; // kN/m²
    };
    workDescription: string;
    liftPlan: {
      hasLiftPlan: boolean;
      planNumber?: string;
      preparedBy?: string;
      approvedBy?: string;
      planDate?: Date;
      engineerSigned?: boolean;
    };
    startDate: Date;
    endDate: Date;
    estimatedDuration: number;
    contractor: { 
      name: string; 
      license: string; 
      contact: string; 
      insurance: string;
      liftingLicense: string;
      craneOperatorCert: string;
    };
  };

  loadCalculations: {
    loadWeight: number; // kg
    loadDimensions: { length: number; width: number; height: number; };
    centerOfGravity: { x: number; y: number; z: number; };
    liftRadius: number; // metres
    liftHeight: number; // metres
    craneCapacity: number; // kg
    workingLoadLimit: number; // kg (with safety factors)
    safetyFactor: number;
    dynamicFactor: number;
    windSpeed: number; // km/h
    maxAllowableWind: number; // km/h
    riggingWeight: number; // kg
    totalLoad: number; // kg (load + rigging)
    momentCalculation: number; // kNm
    stabilitySafety: number;
    loadChart: string; // reference
  };

  equipment: {
    crane: {
      make: string;
      model: string;
      serialNumber: string;
      capacity: number; // tonnes
      boom: { length: number; angle: number; telescopic: boolean; };
      counterweight: number; // kg
      outriggers: { extended: boolean; pressure: number; };
      lastInspection: Date;
      nextInspection: Date;
      certificationNumber: string;
      operator: string;
      operatorLicense: string;
      operatorExpiry: Date;
    };
    rigging: RiggingEquipment[];
    accessories: AccessoryEquipment[];
    signaling: SignalingEquipment[];
    loadBlocks: LoadBlock[];
  };

  personnel: {
    operateur: LiftingPersonnelMember[];
    signaleur: LiftingPersonnelMember[];
    grutier: LiftingPersonnelMember[];
    superviseur: LiftingPersonnelMember[];
    rigger: LiftingPersonnelMember[];
    inspecteur?: LiftingPersonnelMember[];
  };

  safetyMeasures: {
    exclusionZone: {
      radius: number; // metres
      barriers: string[];
      signage: string[];
      personnel: string[];
      markings: string[];
    };
    communicationPlan: {
      primary: 'radio' | 'hand-signals' | 'phone';
      backup: string;
      frequencies: string[];
      testPerformed: boolean;
      emergencyChannel: string;
    };
    weatherMonitoring: {
      required: boolean;
      parameters: string[];
      limits: { 
        windSpeed: number; 
        visibility: number; 
        precipitation: boolean;
        temperature: { min: number; max: number; };
      };
      monitoringFrequency: number; // minutes
      weatherStation: string;
    };
    emergencyProcedures: LiftingProcedureStep[];
    riskMitigation: {
      powerLines: { present: boolean; distance: number; protection: string; };
      publicAccess: { restricted: boolean; barriers: string[]; signage: string[]; };
      adjacentStructures: { present: boolean; protection: string[]; monitoring: boolean; };
    };
  };

  validation: {
    preInspections: InspectionRecord[];
    loadTests: LoadTest[];
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    issuedBy?: SignatureData;
    issuedAt?: Date;
    validUntil?: Date;
    engineerApproval?: SignatureData;
    liftDirectorApproval?: SignatureData;
  };
}

interface RiggingEquipment {
  id: string;
  type: 'elingue' | 'chaine' | 'cable' | 'sangles' | 'crochets' | 'manilles';
  capacity: number; // kg
  workingLoadLimit: number; // kg
  material: string;
  diameter?: number; // mm
  length?: number; // metres
  angle: number; // degrees
  safetyFactor: number;
  lastInspection: Date;
  nextInspection: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  serialNumber: string;
  manufacturer: string;
  certificationStandard: string;
}

interface AccessoryEquipment {
  id: string;
  type: 'palonnier' | 'ventouse' | 'pince' | 'grappin' | 'crochet-supplementaire';
  capacity: number;
  weight: number;
  application: string;
  lastInspection: Date;
  nextInspection: Date;
  certified: boolean;
  serialNumber: string;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
}

interface SignalingEquipment {
  id: string;
  type: 'radio' | 'klaxon' | 'signalisation-visuelle' | 'drapeaux';
  model: string;
  frequency?: string;
  tested: boolean;
  backup: boolean;
  batteryLevel?: number;
  range?: number; // metres
}

interface LoadBlock {
  id: string;
  capacity: number; // tonnes
  numberOfSheaves: number;
  reeving: string;
  weight: number; // kg
  lastInspection: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
}

interface LoadTest {
  id: string;
  testType: 'pre-lift' | 'trial-lift' | 'dynamic-test' | 'proof-load';
  testWeight: number; // kg
  testHeight: number; // metres
  testRadius: number; // metres
  result: 'passed' | 'failed' | 'conditional';
  performedBy: string;
  performedAt: Date;
  notes: string;
  photos?: string[];
  witnessedBy?: string;
}

// =================== CONFIGURATION ===================
const LIFTING_TYPES = {
  'grue-mobile': {
    icon: '🏗️',
    title: { fr: 'Grue mobile', en: 'Mobile crane' },
    description: { fr: 'Grue automotrice sur chenilles/pneus', en: 'Self-propelled crane on tracks/wheels' },
    maxCapacity: 1200, // tonnes
    requiredCertifications: ['grutier-mobile', 'operateur-grue'],
    specialRequirements: ['plan-levage', 'sol-porteur', 'stabilisateurs']
  },
  'grue-tour': {
    icon: '🏢',
    title: { fr: 'Grue à tour', en: 'Tower crane' },
    description: { fr: 'Grue fixe de construction', en: 'Fixed construction crane' },
    maxCapacity: 100,
    requiredCertifications: ['grutier-tour', 'monteur-grue'],
    specialRequirements: ['ancrage', 'contrepoids', 'haubanage']
  },
  'palan': {
    icon: '⛓️',
    title: { fr: 'Palan/Treuil électrique', en: 'Electric hoist/winch' },
    description: { fr: 'Système de levage électrique', en: 'Electric lifting system' },
    maxCapacity: 50,
    requiredCertifications: ['operateur-palan'],
    specialRequirements: ['ancrage-poutre', 'alimentation-electrique']
  },
  'treuil': {
    icon: '🔧',
    title: { fr: 'Treuil manuel', en: 'Manual winch' },
    description: { fr: 'Système levage manuel/hydraulique', en: 'Manual/hydraulic lifting system' },
    maxCapacity: 20,
    requiredCertifications: ['operateur-treuil'],
    specialRequirements: ['ancrage-solide', 'angle-approche']
  },
  'chariot-elevateur': {
    icon: '🚜',
    title: { fr: 'Chariot élévateur', en: 'Forklift' },
    description: { fr: 'Chariot élévateur télescopique', en: 'Telescopic forklift' },
    maxCapacity: 15,
    requiredCertifications: ['operateur-chariot-elevateur'],
    specialRequirements: ['stabilite', 'centre-gravite', 'charge-nominale']
  },
  'levage-manuel': {
    icon: '💪',
    title: { fr: 'Levage manuel', en: 'Manual lifting' },
    description: { fr: 'Levage à la force humaine', en: 'Human-powered lifting' },
    maxCapacity: 0.5,
    requiredCertifications: ['formation-manutention'],
    specialRequirements: ['technique-levage', 'travail-equipe', 'echauffement']
  }
};

const RIGGING_TYPES = {
  'elingue': { capacity: 10000, safetyFactor: 5, angle: 60 },
  'chaine': { capacity: 15000, safetyFactor: 4, angle: 45 },
  'cable': { capacity: 20000, safetyFactor: 6, angle: 30 },
  'sangles': { capacity: 5000, safetyFactor: 7, angle: 90 }
};

const PROVINCIAL_REGULATIONS = {
  QC: {
    maxLiftWithoutPlan: 5000, // kg
    requiredInspections: {
      daily: true,
      weekly: false,
      monthly: true,
      annual: true
    },
    windLimits: {
      normal: 40, // km/h
      critical: 50 // km/h
    },
    exclusionZoneMultiplier: 1.5, // x boom length
    engineerRequired: 10000, // kg
    references: {
      regulation: 'RSST, art. 345-380',
      standard: 'CSA B167',
      authority: 'CNESST'
    }
  },
  ON: {
    maxLiftWithoutPlan: 4500,
    requiredInspections: {
      daily: true,
      weekly: true,
      monthly: true,
      annual: true
    },
    windLimits: {
      normal: 35,
      critical: 45
    },
    exclusionZoneMultiplier: 2.0,
    engineerRequired: 9000,
    references: {
      regulation: 'O. Reg. 213/91',
      standard: 'ANSI B30.5',
      authority: 'Ministry of Labour'
    }
  },
  AB: {
    maxLiftWithoutPlan: 4500,
    requiredInspections: {
      daily: true,
      weekly: false,
      monthly: true,
      annual: true
    },
    windLimits: {
      normal: 50, // Plus élevé en Alberta
      critical: 60
    },
    exclusionZoneMultiplier: 1.5,
    engineerRequired: 10000,
    references: {
      regulation: 'OHS Code Part 15',
      standard: 'CSA B167',
      authority: 'Alberta Labour'
    }
  },
  BC: {
    maxLiftWithoutPlan: 4500,
    requiredInspections: {
      daily: true,
      weekly: true,
      monthly: true,
      annual: true
    },
    windLimits: {
      normal: 40,
      critical: 50
    },
    exclusionZoneMultiplier: 2.0,
    engineerRequired: 9000,
    references: {
      regulation: 'OHS Regulation Part 14',
      standard: 'CSA B167',
      authority: 'WorkSafeBC'
    }
  }
};

const FORM_SECTIONS = [
  { id: 'identification', title: { fr: 'Identification', en: 'Identification' }, icon: FileText, estimatedTime: 6 },
  { id: 'loadCalculations', title: { fr: 'Calculs de charge', en: 'Load calculations' }, icon: Calculator, estimatedTime: 10 },
  { id: 'equipment', title: { fr: 'Équipements', en: 'Equipment' }, icon: Truck, estimatedTime: 12 },
  { id: 'personnel', title: { fr: 'Personnel', en: 'Personnel' }, icon: Users, estimatedTime: 8 },
  { id: 'safetyMeasures', title: { fr: 'Mesures sécurité', en: 'Safety measures' }, icon: Shield, estimatedTime: 9 },
  { id: 'validation', title: { fr: 'Validation', en: 'Validation' }, icon: CheckCircle, estimatedTime: 5 }
];

// =================== PROPS ===================
interface LiftingFormProps {
  permitId?: string;
  initialData?: Partial<LiftingFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: LiftingFormData) => Promise<void>;
  onSubmit: (data: LiftingFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function LiftingForm({
  permitId, initialData, language, province, userRole, onSave, onSubmit, onCancel, touchOptimized = true
}: LiftingFormProps) {
  
  // =================== ÉTAT ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<LiftingFormData>(() => ({
    identification: {
      permitType: 'levage',
      permitNumber: `LF-${Date.now()}`,
      liftType: 'grue-mobile',
      location: { 
        address: '', 
        specificLocation: '',
        groundConditions: '',
        obstacles: [],
        accessRoutes: [],
        soilBearing: 0
      },
      workDescription: '',
      liftPlan: { hasLiftPlan: false },
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      estimatedDuration: 8,
      contractor: { 
        name: '', 
        license: '', 
        contact: '', 
        insurance: '',
        liftingLicense: '',
        craneOperatorCert: ''
      }
    },
    loadCalculations: {
      loadWeight: 0,
      loadDimensions: { length: 0, width: 0, height: 0 },
      centerOfGravity: { x: 0, y: 0, z: 0 },
      liftRadius: 0,
      liftHeight: 0,
      craneCapacity: 0,
      workingLoadLimit: 0,
      safetyFactor: 5,
      dynamicFactor: 1.15,
      windSpeed: 0,
      maxAllowableWind: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.windLimits.normal || 40,
      riggingWeight: 0,
      totalLoad: 0,
      momentCalculation: 0,
      stabilitySafety: 1.5,
      loadChart: ''
    },
    equipment: {
      crane: {
        make: '', 
        model: '', 
        serialNumber: '', 
        capacity: 0,
        boom: { length: 0, angle: 45, telescopic: false },
        counterweight: 0,
        outriggers: { extended: false, pressure: 0 },
        lastInspection: new Date(),
        nextInspection: new Date(),
        certificationNumber: '',
        operator: '',
        operatorLicense: '',
        operatorExpiry: new Date()
      },
      rigging: [],
      accessories: [],
      signaling: [],
      loadBlocks: []
    },
    personnel: {
      operateur: [], 
      signaleur: [], 
      grutier: [], 
      superviseur: [], 
      rigger: []
    },
    safetyMeasures: {
      exclusionZone: {
        radius: 0,
        barriers: [],
        signage: [],
        personnel: [],
        markings: []
      },
      communicationPlan: {
        primary: 'radio',
        backup: '',
        frequencies: [],
        testPerformed: false,
        emergencyChannel: ''
      },
      weatherMonitoring: {
        required: true,
        parameters: ['wind-speed', 'visibility', 'precipitation'],
        limits: { 
          windSpeed: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.windLimits.normal || 40,
          visibility: 100,
          precipitation: false,
          temperature: { min: -25, max: 40 }
        },
        monitoringFrequency: 30,
        weatherStation: ''
      },
      emergencyProcedures: [],
      riskMitigation: {
        powerLines: { present: false, distance: 0, protection: '' },
        publicAccess: { restricted: false, barriers: [], signage: [] },
        adjacentStructures: { present: false, protection: [], monitoring: false }
      }
    },
    validation: {
      preInspections: [],
      loadTests: [],
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
      [section]: { ...prev[section as keyof LiftingFormData], [field]: value }
    }));
    setIsDirty(true);
    hapticFeedback('selection');
  }, [hapticFeedback]);

  // Calculs automatiques charge totale et limites de travail
  const calculateTotalLoad = useCallback(() => {
    const total = formData.loadCalculations.loadWeight + formData.loadCalculations.riggingWeight;
    const dynamicLoad = total * formData.loadCalculations.dynamicFactor;
    const wwl = formData.loadCalculations.craneCapacity / formData.loadCalculations.safetyFactor;
    
    setFormData(prev => ({
      ...prev,
      loadCalculations: {
        ...prev.loadCalculations,
        totalLoad: total,
        workingLoadLimit: wwl,
        momentCalculation: total * formData.loadCalculations.liftRadius
      }
    }));
  }, [formData.loadCalculations.loadWeight, formData.loadCalculations.riggingWeight, formData.loadCalculations.craneCapacity, formData.loadCalculations.safetyFactor, formData.loadCalculations.dynamicFactor, formData.loadCalculations.liftRadius]);

  useEffect(() => {
    calculateTotalLoad();
  }, [formData.loadCalculations.loadWeight, formData.loadCalculations.riggingWeight, formData.loadCalculations.craneCapacity, formData.loadCalculations.safetyFactor, formData.loadCalculations.dynamicFactor, formData.loadCalculations.liftRadius]);

  // Calcul automatique zone d'exclusion
  useEffect(() => {
    const boomLength = formData.equipment.crane.boom.length;
    const multiplier = PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.exclusionZoneMultiplier || 1.5;
    const radius = boomLength * multiplier;
    
    if (radius !== formData.safetyMeasures.exclusionZone.radius) {
      updateFormData('safetyMeasures', 'exclusionZone', {
        ...formData.safetyMeasures.exclusionZone,
        radius: Math.max(radius, 10) // minimum 10m
      });
    }
  }, [formData.equipment.crane.boom.length, province, updateFormData]);

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
        if (formData.loadCalculations.loadWeight > (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxLiftWithoutPlan || 5000) && !formData.identification.liftPlan.hasLiftPlan) {
          errors.push(language === 'fr' ? 'Plan de levage requis pour cette charge' : 'Lift plan required for this load');
        }
        if (formData.loadCalculations.loadWeight > (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.engineerRequired || 10000) && !formData.identification.liftPlan.engineerSigned) {
          errors.push(language === 'fr' ? 'Approbation ingénieur requise' : 'Engineer approval required');
        }
        break;
        
      case 'loadCalculations':
        if (formData.loadCalculations.loadWeight <= 0) {
          errors.push(language === 'fr' ? 'Poids de charge requis' : 'Load weight required');
        }
        if (formData.loadCalculations.totalLoad > formData.loadCalculations.workingLoadLimit) {
          errors.push(language === 'fr' ? 'Charge totale dépasse la limite de travail' : 'Total load exceeds working load limit');
        }
        if (formData.loadCalculations.windSpeed > formData.loadCalculations.maxAllowableWind) {
          errors.push(language === 'fr' ? 'Vitesse du vent trop élevée' : 'Wind speed too high');
        }
        if (formData.loadCalculations.safetyFactor < 3) {
          errors.push(language === 'fr' ? 'Facteur de sécurité insuffisant (min 3)' : 'Insufficient safety factor (min 3)');
        }
        break;
        
      case 'equipment':
        if (!formData.equipment.crane.make.trim()) {
          errors.push(language === 'fr' ? 'Informations grue requises' : 'Crane information required');
        }
        if (formData.equipment.rigging.length === 0) {
          errors.push(language === 'fr' ? 'Équipement élingage requis' : 'Rigging equipment required');
        }
        if (!formData.equipment.crane.operatorLicense.trim()) {
          errors.push(language === 'fr' ? 'Licence opérateur requise' : 'Operator license required');
        }
        break;
        
      case 'personnel':
        if (formData.personnel.operateur.length === 0) {
          errors.push(language === 'fr' ? 'Opérateur requis' : 'Operator required');
        }
        if (formData.personnel.signaleur.length === 0) {
          errors.push(language === 'fr' ? 'Signaleur requis' : 'Signaler required');
        }
        if (formData.personnel.superviseur.length === 0) {
          errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
        }
        break;
        
      case 'safetyMeasures':
        if (formData.safetyMeasures.exclusionZone.radius < 10) {
          errors.push(language === 'fr' ? 'Zone d\'exclusion minimale 10m' : 'Minimum exclusion zone 10m');
        }
        if (!formData.safetyMeasures.communicationPlan.testPerformed) {
          errors.push(language === 'fr' ? 'Test communication requis' : 'Communication test required');
        }
        break;
        
      case 'validation':
        if (formData.validation.signatures.length === 0) {
          errors.push(language === 'fr' ? 'Signatures requises' : 'Signatures required');
        }
        if (formData.validation.preInspections.length === 0) {
          errors.push(language === 'fr' ? 'Inspection pré-levage requise' : 'Pre-lift inspection required');
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
      case 'loadCalculations': return renderLoadCalculationsSection();
      case 'equipment': return renderEquipmentSection();
      case 'personnel': return renderPersonnelSection();
      case 'safetyMeasures': return renderSafetyMeasuresSection();
      case 'validation': return renderValidationSection();
      default: return <div>Section non trouvée</div>;
    }
  };

  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Truck className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis de levage' : 'Lifting permit identification'}
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
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="LF-2024-001"
          />
        </div>

        {/* Type de levage */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Type de levage' : 'Lifting type'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(LIFTING_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData('identification', 'liftType', key)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all min-h-[44px]
                  ${formData.identification.liftType === key
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
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

        {/* Localisation */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Localisation' : 'Location'}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.identification.location.address}
              onChange={(e) => updateFormData('identification', 'location', {
                ...formData.identification.location,
                address: e.target.value
              })}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' ? 'Adresse du site' : 'Site address'}
            />
            <button
              type="button"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Plan de levage */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="h-5 w-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">
              {language === 'fr' ? 'Plan de levage' : 'Lift plan'}
            </h4>
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="hasLiftPlan"
              checked={formData.identification.liftPlan.hasLiftPlan}
              onChange={(e) => updateFormData('identification', 'liftPlan', {
                ...formData.identification.liftPlan,
                hasLiftPlan: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasLiftPlan" className="text-sm text-gray-700">
              {language === 'fr' ? 'Plan de levage préparé' : 'Lift plan prepared'}
            </label>
          </div>

          {formData.identification.liftPlan.hasLiftPlan && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.identification.liftPlan.planNumber || ''}
                  onChange={(e) => updateFormData('identification', 'liftPlan', {
                    ...formData.identification.liftPlan,
                    planNumber: e.target.value
                  })}
                  className="px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'fr' ? 'Numéro du plan' : 'Plan number'}
                />
                <input
                  type="text"
                  value={formData.identification.liftPlan.preparedBy || ''}
                  onChange={(e) => updateFormData('identification', 'liftPlan', {
                    ...formData.identification.liftPlan,
                    preparedBy: e.target.value
                  })}
                  className="px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'fr' ? 'Préparé par' : 'Prepared by'}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="engineerSigned"
                  checked={formData.identification.liftPlan.engineerSigned || false}
                  onChange={(e) => updateFormData('identification', 'liftPlan', {
                    ...formData.identification.liftPlan,
                    engineerSigned: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="engineerSigned" className="text-sm text-gray-700">
                  {language === 'fr' ? 'Signé par un ingénieur' : 'Signed by engineer'}
                </label>
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-yellow-700 space-y-1">
            <p>
              {language === 'fr' ? 'Plan requis' : 'Plan required'}: {' '}
              <span className="font-medium">
                &gt; {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxLiftWithoutPlan || 5000}kg ({province})
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Ingénieur requis' : 'Engineer required'}: {' '}
              <span className="font-medium">
                &gt; {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.engineerRequired || 10000}kg
              </span>
            </p>
          </div>
        </div>

        {/* Description des travaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description des travaux de levage' : 'Lifting work description'}
          </label>
          <div className="flex space-x-2">
            <textarea
              value={formData.identification.workDescription}
              onChange={(e) => updateFormData('identification', 'workDescription', e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' 
                ? 'Ex: Levage poutre acier 15T, placement 25m hauteur, grue mobile 50T...'
                : 'Ex: Steel beam lift 15T, placement 25m height, 50T mobile crane...'
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

        {/* Entrepreneur et licence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Entrepreneur' : 'Contractor'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.name}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                name: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Licence levage' : 'Lifting license'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.liftingLicense}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                liftingLicense: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' ? 'Ex: LF-12345-QC' : 'Ex: LF-12345-QC'}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Date début' : 'Start date'}
            </label>
            <input
              type="datetime-local"
              value={formData.identification.startDate.toISOString().slice(0, 16)}
              onChange={(e) => updateFormData('identification', 'startDate', new Date(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Durée (heures)' : 'Duration (hours)'}
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.identification.estimatedDuration}
              onChange={(e) => updateFormData('identification', 'estimatedDuration', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              {language === 'fr' ? 'Plan requis' : 'Plan required'}: {' '}
              <span className="font-medium">
                &gt; {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxLiftWithoutPlan || 5000}kg
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Vent max' : 'Max wind'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.windLimits.normal || 40} km/h
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Référence' : 'Reference'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.references.regulation}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadCalculationsSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Calculs de charge et capacité' : 'Load and capacity calculations'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section calculs - À implémenter avec calculs automatiques charge, facteurs sécurité, limites vent'
            : 'Calculations section - To implement with automatic load calculations, safety factors, wind limits'
          }
        </div>
      </div>
    </div>
  );

  const renderEquipmentSection = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Truck className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Équipements de levage et élingage' : 'Lifting and rigging equipment'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section équipements - À implémenter avec grue, élingage, accessoires, signalisation'
            : 'Equipment section - To implement with crane, rigging, accessories, signaling'
          }
        </div>
      </div>
    </div>
  );

  const renderPersonnelSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Personnel spécialisé levage' : 'Specialized lifting personnel'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel - À implémenter avec grutier, signaleur, rigger, superviseur'
            : 'Personnel section - To implement with crane operator, signaler, rigger, supervisor'
          }
        </div>
      </div>
    </div>
  );

  const renderSafetyMeasuresSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Mesures de sécurité et zones d\'exclusion' : 'Safety measures and exclusion zones'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section sécurité - À implémenter avec zones exclusion, communication, météo, urgence'
            : 'Safety section - To implement with exclusion zones, communication, weather, emergency'
          }
        </div>
      </div>
    </div>
  );

  const renderValidationSection = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Validation et tests de charge' : 'Validation and load tests'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec inspections, tests charge, signatures'
            : 'Validation section - To implement with inspections, load tests, signatures'
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
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
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
              className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 min-h-[44px] transition-colors"
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
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
