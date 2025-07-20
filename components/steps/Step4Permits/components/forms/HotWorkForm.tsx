// =================== COMPONENTS/FORMS/HOTWORKFORM.TSX - FORMULAIRE TRAVAIL À CHAUD ULTRA-COMPLET ===================
// Formulaire travail à chaud révolutionnaire avec surveillance incendie, zones chaudes et monitoring température

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Save, Send, CheckCircle, XCircle, 
  AlertTriangle, Activity, Users, Shield, Zap, FileText,
  Settings, Flame
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

// =================== TYPES LOCAUX SPÉCIFIQUES TRAVAIL À CHAUD ===================

// Interface ProcedureStep locale pour éviter conflit
interface HotWorkProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  acceptanceCriteria: { fr: string[]; en: string[] };
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  required: boolean;
  estimatedTime?: number;
  fireRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface PersonnelMember locale pour éviter conflit
interface HotWorkPersonnelMember {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  entreprise: string;
  age: number;
  experience: number;
  certifications: Certification[];
  photo?: string;
  statut: 'actif' | 'inactif' | 'formation';
  hotWorkCertifications: string[];
  fireWatchTrained: boolean;
  lastFireSafetyTraining: Date;
  medicalValid: boolean;
}

interface ValidationStep {
  id: string;
  description: string;
  completed: boolean;
  notes?: string;
}

interface HotWorkFormData {
  // Section 1 - Identification
  identification: {
    permitType: 'travail-chaud';
    permitNumber: string;
    workType: 'soudage' | 'coupage' | 'meulage' | 'brasage' | 'oxycoupage' | 'autre';
    location: {
      address: string;
      coordinates?: { lat: number; lng: number };
      building?: string;
      floor?: string;
      room?: string;
      specificLocation: string;
      hotZoneRadius: number; // metres
      ventilationAdequate: boolean;
      floorType: string;
    };
    workDescription: string;
    equipmentUsed: string[];
    materials: string[];
    startDate: Date;
    endDate: Date;
    estimatedDuration: number;
    emergencyContact: {
      name: string;
      phone: string;
      role: string;
    };
    contractor: {
      name: string;
      license: string;
      hotWorkLicense: string;
      contact: string;
      insurance: string;
    };
  };

  // Section 2 - Personnel
  personnel: {
    operateur: HotWorkPersonnelMember[];
    surveillantIncendie: HotWorkPersonnelMember[];
    superviseur: HotWorkPersonnelMember[];
    securite: HotWorkPersonnelMember[];
    sauveteurs?: HotWorkPersonnelMember[];
  };

  // Section 3 - Évaluation Risques Incendie
  fireRisk: {
    materialsCombustibles: {
      present: boolean;
      types: string[];
      distance: number; // metres
      protection: string[];
      fireRating: string;
      removalPossible: boolean;
    };
    flammableLiquids: {
      present: boolean;
      types: string[];
      containers: string[];
      ventilation: string;
      spillContainment: boolean;
      flashPoint: number; // °C
    };
    gasesFlammables: {
      present: boolean;
      types: string[];
      concentration: number; // %LEL
      monitoring: boolean;
      ventilationRate: number; // m³/min
      detectionSystem: boolean;
    };
    structuresAdjacentes: {
      description: string[];
      fireResistance: string;
      protectionRequired: boolean;
      fireBarriers: string[];
      sprinklerSystem: boolean;
    };
    weatherConditions: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      windDirection: string;
      weatherImpact: 'low' | 'medium' | 'high';
      precipitationRisk: boolean;
    };
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  };

  // Section 4 - Mesures Préventives
  preventiveMeasures: {
    fireWatch: {
      required: boolean;
      duration: number; // minutes après travaux
      personnel: string[];
      equipment: string[];
      communicationMethod: string;
      checkInterval: number; // minutes
    };
    fireExtinguishers: {
      types: string[];
      locations: string[];
      inspectionDate: Date;
      quantity: number;
      capacity: string;
      accessibility: boolean;
    };
    protectionBarriers: {
      type: string[];
      coverage: string[];
      fireResistance: string;
      heatShields: boolean;
      sparkScreens: boolean;
    };
    ventilation: {
      required: boolean;
      type: 'naturelle' | 'forcée' | 'aspiration';
      capacity: number; // m³/min
      smokeEvacuation: boolean;
      filterSystem: boolean;
    };
    emergencyProcedures: HotWorkProcedureStep[];
    hotWorkProtocol: {
      preWorkInspection: boolean;
      continuousMonitoring: boolean;
      postWorkInspection: boolean;
      cooldownPeriod: number; // minutes
    };
  };

  // Section 5 - Équipements
  equipment: {
    hotWorkEquipment: EquipmentItem[];
    fireSuppressionEquipment: EquipmentItem[];
    monitoringEquipment: EquipmentItem[];
    ppe: PPEItem[];
    communicationEquipment: EquipmentItem[];
    testingEquipment: EquipmentItem[];
  };

  // Section 6 - Validation
  validation: {
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    finalChecklist: ValidationStep[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    fireWatchLog: FireWatchEntry[];
    issuedBy?: SignatureData;
    issuedAt?: Date;
    validUntil?: Date;
    fireMarshallApproval?: SignatureData;
    safetyOfficerApproval?: SignatureData;
  };
}

interface FireWatchEntry {
  id: string;
  timestamp: Date;
  operator: string;
  location: string;
  temperature: number;
  observations: string;
  hazards: string[];
  actions: string[];
  photo?: string;
  equipmentChecked: boolean;
  allClear: boolean;
}

// =================== CONFIGURATION ===================

// Types de travaux à chaud avec spécifications techniques
const HOT_WORK_TYPES = {
  'soudage': {
    icon: '⚡',
    title: { fr: 'Soudage électrique', en: 'Electric welding' },
    risks: { fr: ['Étincelles', 'Arc électrique', 'Fumées'], en: ['Sparks', 'Electric arc', 'Fumes'] },
    equipment: ['poste-soudure', 'electrodes', 'cables'],
    temperature: { min: 3000, max: 6000 }, // °C
    sparkRange: 10, // mètres
    requiredCertifications: ['soudage-CSA-W47.1', 'arc-electrique']
  },
  'coupage': {
    icon: '🔥',
    title: { fr: 'Coupage thermique', en: 'Thermal cutting' },
    risks: { fr: ['Étincelles', 'Scories', 'Gaz chauds'], en: ['Sparks', 'Slag', 'Hot gases'] },
    equipment: ['chalumeau', 'oxygene', 'acetylene'],
    temperature: { min: 2500, max: 3500 },
    sparkRange: 15,
    requiredCertifications: ['coupage-thermique', 'gaz-comprimes']
  },
  'meulage': {
    icon: '💫',
    title: { fr: 'Meulage/Polissage', en: 'Grinding/Polishing' },
    risks: { fr: ['Étincelles métalliques', 'Poussières', 'Friction'], en: ['Metal sparks', 'Dust', 'Friction'] },
    equipment: ['meuleuse', 'disques', 'aspiration'],
    temperature: { min: 800, max: 1500 },
    sparkRange: 8,
    requiredCertifications: ['meulage-securite', 'outils-electriques']
  },
  'brasage': {
    icon: '🔥',
    title: { fr: 'Brasage/Soudure', en: 'Brazing/Soldering' },
    risks: { fr: ['Flamme nue', 'Métal fondu', 'Vapeurs'], en: ['Open flame', 'Molten metal', 'Vapors'] },
    equipment: ['chalumeau', 'metal-apport', 'flux'],
    temperature: { min: 400, max: 900 },
    sparkRange: 5,
    requiredCertifications: ['brasage-specialise', 'flamme-nue']
  },
  'oxycoupage': {
    icon: '💥',
    title: { fr: 'Oxycoupage', en: 'Oxyfuel cutting' },
    risks: { fr: ['Flamme haute température', 'Projection métal', 'Gaz sous pression'], en: ['High temp flame', 'Metal projection', 'Pressurized gas'] },
    equipment: ['chalumeau-oxycoupage', 'oxygene', 'gaz-combustible'],
    temperature: { min: 3000, max: 4000 },
    sparkRange: 20,
    requiredCertifications: ['oxycoupage-avance', 'haute-pression']
  },
  'autre': {
    icon: '🛠️',
    title: { fr: 'Autre travail à chaud', en: 'Other hot work' },
    risks: { fr: ['Variable selon type'], en: ['Variable by type'] },
    equipment: ['selon-travail'],
    temperature: { min: 200, max: 5000 },
    sparkRange: 12,
    requiredCertifications: ['travail-chaud-general']
  }
};

// Réglementations provinciales canadiennes
const PROVINCIAL_REGULATIONS = {
  QC: {
    fireWatchDuration: 60, // minutes après travaux
    hotZoneRadius: 10, // mètres minimum
    requiredCertifications: {
      operateur: ['soudage-certifie-qc', 'travail-chaud-qc'],
      surveillantIncendie: ['surveillant-incendie-qc', 'extincteurs-qc']
    },
    temperatureLimits: {
      maxAmbient: 35, // °C
      maxSurface: 60, // °C après travaux
      windSpeedMax: 25 // km/h
    },
    inspectionRequirements: {
      preWork: true,
      postWork: true,
      fireWatchLog: true
    },
    references: {
      regulation: 'RSST, art. 312-325',
      standard: 'NFPA 51B',
      authority: 'CNESST'
    }
  },
  ON: {
    fireWatchDuration: 30,
    hotZoneRadius: 15,
    requiredCertifications: {
      operateur: ['soudage-certifie-on', 'travail-chaud-on'],
      surveillantIncendie: ['surveillant-incendie-on']
    },
    temperatureLimits: {
      maxAmbient: 30,
      maxSurface: 55,
      windSpeedMax: 20
    },
    inspectionRequirements: {
      preWork: true,
      postWork: true,
      fireWatchLog: true
    },
    references: {
      regulation: 'O. Reg. 213/91',
      standard: 'CSA W47.1',
      authority: 'Ministry of Labour'
    }
  },
  AB: {
    fireWatchDuration: 45,
    hotZoneRadius: 12,
    requiredCertifications: {
      operateur: ['soudage-certifie-ab', 'travail-chaud-ab'],
      surveillantIncendie: ['surveillant-incendie-ab']
    },
    temperatureLimits: {
      maxAmbient: 40,
      maxSurface: 65,
      windSpeedMax: 30
    },
    inspectionRequirements: {
      preWork: true,
      postWork: true,
      fireWatchLog: true
    },
    references: {
      regulation: 'OHS Code Part 18',
      standard: 'CSA W47.1',
      authority: 'Alberta Labour'
    }
  },
  BC: {
    fireWatchDuration: 30,
    hotZoneRadius: 10,
    requiredCertifications: {
      operateur: ['soudage-certifie-bc', 'travail-chaud-bc'],
      surveillantIncendie: ['surveillant-incendie-bc']
    },
    temperatureLimits: {
      maxAmbient: 30,
      maxSurface: 55,
      windSpeedMax: 25
    },
    inspectionRequirements: {
      preWork: true,
      postWork: true,
      fireWatchLog: true
    },
    references: {
      regulation: 'OHS Regulation Part 16',
      standard: 'CSA W47.1',
      authority: 'WorkSafeBC'
    }
  }
};

const FORM_SECTIONS = [
  {
    id: 'identification',
    title: { fr: 'Identification', en: 'Identification' },
    icon: FileText,
    estimatedTime: 4,
    fields: ['permitNumber', 'workType', 'location', 'description']
  },
  {
    id: 'personnel',
    title: { fr: 'Personnel', en: 'Personnel' },
    icon: Users,
    estimatedTime: 8,
    fields: ['operateur', 'surveillantIncendie', 'superviseur']
  },
  {
    id: 'fireRisk',
    title: { fr: 'Risques incendie', en: 'Fire risks' },
    icon: Flame,
    estimatedTime: 10,
    fields: ['combustibles', 'liquides', 'gaz', 'structures', 'météo']
  },
  {
    id: 'preventiveMeasures',
    title: { fr: 'Mesures préventives', en: 'Preventive measures' },
    icon: Shield,
    estimatedTime: 12,
    fields: ['fireWatch', 'extinguishers', 'barriers', 'ventilation']
  },
  {
    id: 'equipment',
    title: { fr: 'Équipements', en: 'Equipment' },
    icon: Settings,
    estimatedTime: 5,
    fields: ['hotWork', 'suppression', 'monitoring', 'ppe']
  },
  {
    id: 'validation',
    title: { fr: 'Validation', en: 'Validation' },
    icon: CheckCircle,
    estimatedTime: 3,
    fields: ['approvals', 'signatures', 'checklist']
  }
];

// =================== PROPS ===================
interface HotWorkFormProps {
  permitId?: string;
  initialData?: Partial<HotWorkFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: HotWorkFormData) => Promise<void>;
  onSubmit: (data: HotWorkFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function HotWorkForm({
  permitId,
  initialData,
  language,
  province,
  userRole,
  onSave,
  onSubmit,
  onCancel,
  touchOptimized = true
}: HotWorkFormProps) {
  
  // =================== ÉTAT PRINCIPAL ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<HotWorkFormData>(() => ({
    identification: {
      permitType: 'travail-chaud',
      permitNumber: `HW-${Date.now()}`,
      workType: 'soudage',
      location: {
        address: '',
        specificLocation: '',
        hotZoneRadius: (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.hotZoneRadius || 10),
        ventilationAdequate: false,
        floorType: ''
      },
      workDescription: '',
      equipmentUsed: [],
      materials: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      estimatedDuration: 8,
      emergencyContact: {
        name: '',
        phone: '',
        role: ''
      },
      contractor: {
        name: '',
        license: '',
        hotWorkLicense: '',
        contact: '',
        insurance: ''
      }
    },
    personnel: {
      operateur: [],
      surveillantIncendie: [],
      superviseur: [],
      securite: []
    },
    fireRisk: {
      materialsCombustibles: {
        present: false,
        types: [],
        distance: 0,
        protection: [],
        fireRating: '',
        removalPossible: false
      },
      flammableLiquids: {
        present: false,
        types: [],
        containers: [],
        ventilation: '',
        spillContainment: false,
        flashPoint: 0
      },
      gasesFlammables: {
        present: false,
        types: [],
        concentration: 0,
        monitoring: false,
        ventilationRate: 0,
        detectionSystem: false
      },
      structuresAdjacentes: {
        description: [],
        fireResistance: '',
        protectionRequired: false,
        fireBarriers: [],
        sprinklerSystem: false
      },
      weatherConditions: {
        temperature: 20,
        humidity: 50,
        windSpeed: 0,
        windDirection: 'N',
        weatherImpact: 'low',
        precipitationRisk: false
      },
      overallRiskLevel: 'medium'
    },
    preventiveMeasures: {
      fireWatch: {
        required: true,
        duration: (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.fireWatchDuration || 60),
        personnel: [],
        equipment: [],
        communicationMethod: '',
        checkInterval: 15
      },
      fireExtinguishers: {
        types: [],
        locations: [],
        inspectionDate: new Date(),
        quantity: 0,
        capacity: '',
        accessibility: false
      },
      protectionBarriers: {
        type: [],
        coverage: [],
        fireResistance: '',
        heatShields: false,
        sparkScreens: false
      },
      ventilation: {
        required: false,
        type: 'naturelle',
        capacity: 0,
        smokeEvacuation: false,
        filterSystem: false
      },
      emergencyProcedures: [],
      hotWorkProtocol: {
        preWorkInspection: true,
        continuousMonitoring: true,
        postWorkInspection: true,
        cooldownPeriod: 30
      }
    },
    equipment: {
      hotWorkEquipment: [],
      fireSuppressionEquipment: [],
      monitoringEquipment: [],
      ppe: [],
      communicationEquipment: [],
      testingEquipment: []
    },
    validation: {
      approvals: [],
      signatures: [],
      finalChecklist: [],
      permitStatus: 'draft',
      fireWatchLog: []
    },
    ...initialData
  }));

  // =================== ÉTAT UI ===================
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =================== REFS ===================
  const formRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // =================== FONCTIONS UTILITAIRES ===================
  
  // Feedback haptic intelligent
  const hapticFeedback = useCallback((type: 'success' | 'error' | 'warning' | 'selection' | 'navigation') => {
    if (!touchOptimized || !navigator.vibrate) return;
    
    const patterns = {
      success: [50, 25, 50],
      error: [100, 50, 100, 50, 100],
      warning: [100, 50, 100],
      selection: [25],
      navigation: [10]
    };
    
    navigator.vibrate(patterns[type]);
  }, [touchOptimized]);

  // Auto-save intelligent
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

  // Auto-save avec debounce
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, autoSave]);

  // Mise à jour données formulaire
  const updateFormData = useCallback((section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof HotWorkFormData],
        [field]: value
      }
    }));
    setIsDirty(true);
    hapticFeedback('selection');
  }, [hapticFeedback]);

  // Calcul automatique rayon zone chaude selon type de travail
  useEffect(() => {
    const workType = formData.identification.workType;
    const workConfig = HOT_WORK_TYPES[workType];
    if (workConfig && workConfig.sparkRange) {
      const minRadius = PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.hotZoneRadius || 10;
      const suggestedRadius = Math.max(minRadius, workConfig.sparkRange);
      
      if (formData.identification.location.hotZoneRadius !== suggestedRadius) {
        updateFormData('identification', 'location', {
          ...formData.identification.location,
          hotZoneRadius: suggestedRadius
        });
      }
    }
  }, [formData.identification.workType, province, updateFormData]);

  // Validation section
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
        if (!formData.identification.contractor.hotWorkLicense.trim()) {
          errors.push(language === 'fr' ? 'Licence travail à chaud requise' : 'Hot work license required');
        }
        break;
        
      case 'personnel':
        if (formData.personnel.operateur.length === 0) {
          errors.push(language === 'fr' ? 'Opérateur requis' : 'Operator required');
        }
        if (formData.personnel.surveillantIncendie.length === 0) {
          errors.push(language === 'fr' ? 'Surveillant incendie requis' : 'Fire watch required');
        }
        if (formData.personnel.superviseur.length === 0) {
          errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
        }
        break;
        
      case 'fireRisk':
        if (formData.fireRisk.overallRiskLevel === 'critical' && !formData.preventiveMeasures.fireWatch.required) {
          errors.push(language === 'fr' ? 'Surveillance incendie obligatoire pour risque critique' : 'Fire watch mandatory for critical risk');
        }
        if (formData.fireRisk.weatherConditions.windSpeed > (PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.temperatureLimits.windSpeedMax || 25)) {
          errors.push(language === 'fr' ? 'Vitesse du vent trop élevée' : 'Wind speed too high');
        }
        break;
        
      case 'preventiveMeasures':
        if (formData.preventiveMeasures.fireWatch.required && formData.preventiveMeasures.fireWatch.personnel.length === 0) {
          errors.push(language === 'fr' ? 'Personnel surveillance incendie requis' : 'Fire watch personnel required');
        }
        if (formData.preventiveMeasures.fireExtinguishers.quantity === 0) {
          errors.push(language === 'fr' ? 'Extincteurs requis' : 'Fire extinguishers required');
        }
        break;
        
      case 'equipment':
        if (formData.equipment.hotWorkEquipment.length === 0) {
          errors.push(language === 'fr' ? 'Équipement travail à chaud requis' : 'Hot work equipment required');
        }
        if (formData.equipment.ppe.length === 0) {
          errors.push(language === 'fr' ? 'EPI requis' : 'PPE required');
        }
        break;
        
      case 'validation':
        if (formData.validation.signatures.length === 0) {
          errors.push(language === 'fr' ? 'Signatures requises' : 'Signatures required');
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [section.id]: errors
    }));
    
    return errors.length === 0;
  }, [formData, language, province]);

  // Navigation sections
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

  // Calcul progression
  const calculateProgress = useCallback(() => {
    const completedSections = FORM_SECTIONS.filter((_, index) => 
      validateSection(index)
    ).length;
    
    return {
      percentage: (completedSections / FORM_SECTIONS.length) * 100,
      completedSections,
      totalSections: FORM_SECTIONS.length,
      estimatedTimeRemaining: FORM_SECTIONS
        .slice(currentSection + 1)
        .reduce((acc, section) => acc + section.estimatedTime, 0)
    };
  }, [currentSection, validateSection]);

  const progress = calculateProgress();

  // =================== RENDU SECTIONS ===================
  const renderCurrentSection = () => {
    const section = FORM_SECTIONS[currentSection];
    
    switch (section.id) {
      case 'identification':
        return renderIdentificationSection();
      case 'personnel':
        return renderPersonnelSection();
      case 'fireRisk':
        return renderFireRiskSection();
      case 'preventiveMeasures':
        return renderPreventiveMeasuresSection();
      case 'equipment':
        return renderEquipmentSection();
      case 'validation':
        return renderValidationSection();
      default:
        return <div>Section non trouvée</div>;
    }
  };

  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Flame className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis travail à chaud' : 'Hot work permit identification'}
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
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="HW-2024-001"
          />
        </div>

        {/* Type de travail */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Type de travail à chaud' : 'Hot work type'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(HOT_WORK_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData('identification', 'workType', key)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all min-h-[44px]
                  ${formData.identification.workType === key
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{config.title[language]}</div>
                    <div className="text-sm text-gray-500">
                      {config.temperature.min}-{config.temperature.max}°C
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {config.risks[language].join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone chaude et localisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Localisation' : 'Location'}
            </label>
            <input
              type="text"
              value={formData.identification.location.address}
              onChange={(e) => updateFormData('identification', 'location', {
                ...formData.identification.location,
                address: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder={language === 'fr' ? 'Adresse du site' : 'Site address'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Rayon zone chaude (m)' : 'Hot zone radius (m)'}
            </label>
            <input
              type="number"
              min={PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.hotZoneRadius || 10}
              value={formData.identification.location.hotZoneRadius}
              onChange={(e) => updateFormData('identification', 'location', {
                ...formData.identification.location,
                hotZoneRadius: parseInt(e.target.value) || 10
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === 'fr' ? 'Minimum' : 'Minimum'}: {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.hotZoneRadius || 10}m ({province})
            </p>
          </div>
        </div>

        {/* Description des travaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description'}
          </label>
          <textarea
            value={formData.identification.workDescription}
            onChange={(e) => updateFormData('identification', 'workDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder={language === 'fr' 
              ? 'Ex: Soudage de réparation sur tuyauterie, 3 soudures bout à bout, acier inoxydable...'
              : 'Ex: Repair welding on piping, 3 butt welds, stainless steel...'
            }
          />
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
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Licence travail à chaud' : 'Hot work license'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.hotWorkLicense}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                hotWorkLicense: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder={language === 'fr' ? 'Ex: HW-12345-QC' : 'Ex: HW-12345-QC'}
            />
          </div>
        </div>

        {/* Dates et durée */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Date début' : 'Start date'}
            </label>
            <input
              type="datetime-local"
              value={formData.identification.startDate.toISOString().slice(0, 16)}
              onChange={(e) => updateFormData('identification', 'startDate', new Date(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Date fin' : 'End date'}
            </label>
            <input
              type="datetime-local"
              value={formData.identification.endDate.toISOString().slice(0, 16)}
              onChange={(e) => updateFormData('identification', 'endDate', new Date(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Information réglementaire */}
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">
            {language === 'fr' ? `Réglementation ${province}` : `${province} Regulation`}
          </h4>
          <div className="text-sm text-red-700 space-y-1">
            <p>
              {language === 'fr' ? 'Surveillance incendie' : 'Fire watch'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.fireWatchDuration || 60} min
              </span>
            </p>
            <p>
              {language === 'fr' ? 'Zone chaude min' : 'Hot zone min'}: {' '}
              <span className="font-medium">
                {PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.hotZoneRadius || 10}m
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

  const renderPersonnelSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Personnel spécialisé' : 'Specialized personnel'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel travail à chaud - À implémenter avec certifications spécialisées'
            : 'Hot work personnel section - To implement with specialized certifications'
          }
        </div>
      </div>
    </div>
  );

  const renderFireRiskSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Flame className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Évaluation des risques incendie' : 'Fire risk assessment'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section risques incendie - À implémenter avec matériaux combustibles, liquides inflammables, etc.'
            : 'Fire risk section - To implement with combustible materials, flammable liquids, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderPreventiveMeasuresSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Mesures préventives' : 'Preventive measures'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section mesures préventives - À implémenter avec surveillance incendie, extincteurs, etc.'
            : 'Preventive measures section - To implement with fire watch, extinguishers, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderEquipmentSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Équipements spécialisés' : 'Specialized equipment'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section équipements - À implémenter avec matériel soudage, extinction, monitoring'
            : 'Equipment section - To implement with welding, suppression, monitoring equipment'
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
            {language === 'fr' ? 'Validation et surveillance' : 'Validation and monitoring'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec log surveillance incendie, signatures'
            : 'Validation section - To implement with fire watch log, signatures'
          }
        </div>
      </div>
    </div>
  );

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header sticky avec progression */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          {/* Barre de progression */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {language === 'fr' ? 'Progression' : 'Progress'}: {Math.round(progress.percentage)}%
              </span>
              <span className="text-xs text-gray-500">
                {progress.estimatedTimeRemaining > 0 && (
                  <>
                    {progress.estimatedTimeRemaining} {language === 'fr' ? 'min restantes' : 'min remaining'}
                  </>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Navigation sections */}
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
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
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
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  {hasErrors && (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Status auto-save */}
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
                  <span>
                    {language === 'fr' ? 'Sauvé à' : 'Saved at'} {lastSaved.toLocaleTimeString()}
                  </span>
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

      {/* Navigation bottom sticky */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateToSection(currentSection - 1)}
            disabled={currentSection === 0}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{language === 'fr' ? 'Précédent' : 'Previous'}</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={autoSave}
              disabled={!isDirty || isAutoSaving}
              className="flex items-center space-x-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 min-h-[44px] transition-colors"
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
            className="flex items-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
