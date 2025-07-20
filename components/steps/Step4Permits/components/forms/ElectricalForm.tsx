// =================== COMPONENTS/FORMS/ELECTRICALFORM.TSX - FORMULAIRE TRAVAUX ÉLECTRIQUES ULTRA-COMPLET ===================
// Formulaire travaux électriques révolutionnaire avec consignation, vérification absence tension et EPI spécialisés

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Save, Send, CheckCircle, XCircle, 
  AlertTriangle, Activity, FileText, Users, Shield, Zap,
  Lock, Eye, Settings, Mic, Camera, MapPin, Power
} from 'lucide-react';
import type {
  InspectionRecord,
  ApprovalLevel,
  SignatureData,
  ProcedureStep,
  Certification,
  PersonnelMember,
  TestResult,
  CalibrationRecord,
  EquipmentItem,
  PPEItem,
  CommunicationPlan,
  ContactInfo
} from '../../types/shared';

// =================== TYPES SPÉCIFIQUES ÉLECTRIQUES ===================
interface ElectricalFormData {
  identification: {
    permitType: 'electrique';
    permitNumber: string;
    workType: 'installation' | 'maintenance' | 'reparation' | 'mise-service' | 'consignation' | 'verification' | 'urgence';
    electricalSystem: {
      type: 'basse-tension' | 'moyenne-tension' | 'haute-tension' | 'tres-haute-tension';
      voltage: number; // volts
      frequency: number; // Hz
      phases: 1 | 3;
      current: number; // amperes
      power: number; // kW
    };
    location: { 
      address: string; 
      coordinates?: { lat: number; lng: number }; 
      specificLocation: string;
      electricalRoom: string;
      panelIdentification: string;
      circuitNumbers: string[];
    };
    workDescription: string;
    riskAssessment: {
      arcFlashRisk: 'category-0' | 'category-1' | 'category-2' | 'category-3' | 'category-4';
      shockRisk: 'low' | 'medium' | 'high' | 'extreme';
      environmentalFactors: string[];
      proximityLiveEquipment: boolean;
      workingSpace: 'adequate' | 'restricted' | 'confined';
    };
    startDate: Date;
    endDate: Date;
    estimatedDuration: number;
    contractor: { name: string; license: string; contact: string; electricalLicense: string };
  };

  lockoutTagout: {
    lotoRequired: boolean;
    lotoNumber?: string;
    isolationPoints: IsolationPoint[];
    verificationSteps: VerificationStep[];
    lockoutDevices: LockoutDevice[];
    authorizedPersonnel: string[];
    lotoCoordinator: string;
    removalProcedure: string;
  };

  safetyMeasures: {
    ppe: ElectricalPPE[];
    protectiveEquipment: ProtectiveEquipment[];
    safetyBoundaries: SafetyBoundary[];
    arcFlashProtection: ArcFlashProtection;
    groundingEquipment: GroundingEquipment[];
    testEquipment: TestEquipment[];
  };

  personnel: {
    electricians: ElectricalPersonnel[];
    superviseur: ElectricalPersonnel[];
    safetyWatcher: ElectricalPersonnel[];
    apprentices?: ElectricalPersonnel[];
  };

  procedures: {
    preWorkChecklist: ProcedureStep[];
    safetyProcedures: ProcedureStep[];
    testingProcedures: ProcedureStep[];
    emergencyProcedures: ProcedureStep[];
    energizationProcedure?: ProcedureStep[];
  };

  testing: {
    continuityTests: TestResult[];
    insulationTests: TestResult[];
    groundTests: TestResult[];
    functionalTests: TestResult[];
    voltageVerification: VoltageTest[];
    testEquipmentCalibration: CalibrationRecord[];
  };

  validation: {
    inspections: InspectionRecord[];
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    electricalApproval?: ElectricalApproval;
    issuedBy?: SignatureData;
    issuedAt?: Date;
    validUntil?: Date;
  };
}

// =================== INTERFACES SPÉCIFIQUES ÉLECTRIQUES ===================
interface IsolationPoint {
  id: string;
  description: string;
  location: string;
  voltage: number;
  isolationMethod: 'breaker' | 'disconnect' | 'fuse' | 'remove-links';
  lockoutDevice: string;
  tagNumber: string;
  verifiedBy: string;
  verificationTime: Date;
}

interface VerificationStep {
  id: string;
  step: number;
  description: string;
  expectedResult: string;
  actualResult: string;
  testEquipment: string;
  performedBy: string;
  timestamp: Date;
  passed: boolean;
}

interface LockoutDevice {
  id: string;
  type: 'lock' | 'tag' | 'block' | 'chain' | 'cover';
  serialNumber: string;
  assignedTo: string;
  location: string;
  applied: boolean;
  appliedTime?: Date;
}

interface ElectricalPPE {
  id: string;
  type: 'arc-rated-suit' | 'insulated-gloves' | 'face-shield' | 'hard-hat' | 'safety-glasses' | 'insulated-tools';
  arcRating?: number; // cal/cm²
  voltageRating?: number; // volts
  standard: string; // ASTM F1506, IEC 61482, etc.
  condition: 'excellent' | 'good' | 'acceptable' | 'needs-replacement';
  lastInspection: Date;
  assignedTo: string;
}

interface ProtectiveEquipment {
  id: string;
  type: 'insulating-mats' | 'barriers' | 'covers' | 'blankets' | 'sleeves';
  voltageRating: number;
  standard: string;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  location: string;
}

interface SafetyBoundary {
  type: 'limited-approach' | 'restricted-approach' | 'prohibited-approach' | 'arc-flash-boundary';
  distance: number; // metres
  voltage: number;
  qualified: boolean; // qualified person required
  ppe: string[];
}

interface ArcFlashProtection {
  category: 'category-0' | 'category-1' | 'category-2' | 'category-3' | 'category-4';
  incidentEnergy: number; // cal/cm²
  arcRatedPPE: string[];
  facialProtection: string;
  handProtection: string;
  bodyProtection: string;
}

interface GroundingEquipment {
  id: string;
  type: 'portable-grounds' | 'grounding-rods' | 'ground-cables';
  voltage: number;
  current: number; // amperes
  lastTested: Date;
  condition: 'excellent' | 'good' | 'acceptable' | 'defective';
  location: string;
}

interface TestEquipment {
  id: string;
  type: 'multimeter' | 'insulation-tester' | 'ground-tester' | 'voltage-detector' | 'oscilloscope';
  manufacturer: string;
  model: string;
  serialNumber: string;
  lastCalibration: Date;
  nextCalibration: Date;
  accuracy: string;
  range: string;
}

interface ElectricalPersonnel {
  id: string; 
  prenom: string; 
  nom: string; 
  poste: string; 
  entreprise: string;
  age: number; 
  experience: number; 
  certifications: Certification[];
  electricalLicense: string;
  qualifiedPerson: boolean;
  arcFlashTraining: boolean;
  cprCertified: boolean;
  lastSafetyTraining: Date;
}

interface VoltageTest {
  id: string;
  location: string;
  phaseToPhase?: number;
  phaseToGround?: number;
  expectedVoltage: number;
  testEquipment: string;
  performedBy: string;
  timestamp: Date;
  safe: boolean; // zero energy confirmed
}

interface ElectricalApproval {
  inspectorName: string;
  inspectorLicense: string;
  inspectionDate: Date;
  approved: boolean;
  conditions: string[];
  certificateNumber?: string;
}

// =================== CONFIGURATION ===================
const ELECTRICAL_WORK_TYPES = {
  'installation': {
    icon: '🔧',
    title: { fr: 'Installation', en: 'Installation' },
    description: { fr: 'Nouvelle installation électrique', en: 'New electrical installation' },
    requiredCertifications: ['maitre-electricien', 'compagnon-electricien']
  },
  'maintenance': {
    icon: '🔧',
    title: { fr: 'Maintenance préventive', en: 'Preventive maintenance' },
    description: { fr: 'Maintenance programmée équipements', en: 'Scheduled equipment maintenance' },
    requiredCertifications: ['electricien-industriel', 'maintenance-electrique']
  },
  'reparation': {
    icon: '⚡',
    title: { fr: 'Réparation', en: 'Repair' },
    description: { fr: 'Réparation équipement défaillant', en: 'Faulty equipment repair' },
    requiredCertifications: ['electricien-certifie', 'depannage-electrique']
  },
  'mise-service': {
    icon: '🔌',
    title: { fr: 'Mise en service', en: 'Commissioning' },
    description: { fr: 'Mise en service nouvel équipement', en: 'New equipment commissioning' },
    requiredCertifications: ['maitre-electricien', 'mise-service-specialiste']
  },
  'consignation': {
    icon: '🔒',
    title: { fr: 'Consignation/Déconsignation', en: 'Lockout/Tagout' },
    description: { fr: 'Procédures LOTO électriques', en: 'Electrical LOTO procedures' },
    requiredCertifications: ['loto-electrique', 'personne-autorisee']
  },
  'verification': {
    icon: '🔍',
    title: { fr: 'Vérification/Tests', en: 'Verification/Testing' },
    description: { fr: 'Tests et vérifications conformité', en: 'Compliance testing and verification' },
    requiredCertifications: ['verification-electrique', 'mesures-electriques']
  },
  'urgence': {
    icon: '🚨',
    title: { fr: 'Travaux d\'urgence', en: 'Emergency work' },
    description: { fr: 'Intervention électrique urgente', en: 'Emergency electrical intervention' },
    requiredCertifications: ['electricien-urgence', 'intervention-rapide']
  }
};

const VOLTAGE_CLASSIFICATIONS = {
  'basse-tension': { 
    range: { min: 0, max: 1000 }, 
    title: { fr: 'Basse tension', en: 'Low voltage' },
    color: 'green',
    arcFlashCategory: 'category-1'
  },
  'moyenne-tension': { 
    range: { min: 1001, max: 35000 }, 
    title: { fr: 'Moyenne tension', en: 'Medium voltage' },
    color: 'yellow',
    arcFlashCategory: 'category-2'
  },
  'haute-tension': { 
    range: { min: 35001, max: 138000 }, 
    title: { fr: 'Haute tension', en: 'High voltage' },
    color: 'orange',
    arcFlashCategory: 'category-3'
  },
  'tres-haute-tension': { 
    range: { min: 138001, max: 1000000 }, 
    title: { fr: 'Très haute tension', en: 'Extra high voltage' },
    color: 'red',
    arcFlashCategory: 'category-4'
  }
};

const ARC_FLASH_CATEGORIES = {
  'category-0': { 
    energy: 1.2, // cal/cm²
    ppe: ['safety-glasses', 'hard-hat', 'leather-gloves'],
    color: 'gray'
  },
  'category-1': { 
    energy: 4, 
    ppe: ['arc-rated-shirt', 'arc-rated-pants', 'face-shield', 'hard-hat'],
    color: 'green'
  },
  'category-2': { 
    energy: 8, 
    ppe: ['arc-rated-shirt', 'arc-rated-pants', 'arc-rated-coverall', 'arc-rated-hood'],
    color: 'yellow'
  },
  'category-3': { 
    energy: 25, 
    ppe: ['arc-rated-shirt', 'arc-rated-pants', 'arc-rated-coverall', 'arc-rated-hood', 'insulated-gloves'],
    color: 'orange'
  },
  'category-4': { 
    energy: 40, 
    ppe: ['arc-rated-shirt', 'arc-rated-pants', 'arc-rated-coverall', 'arc-rated-hood', 'arc-rated-suit'],
    color: 'red'
  }
};

const PROVINCIAL_REGULATIONS = {
  QC: {
    electricalCode: 'Code de construction - Chapitre V Électricité',
    authority: 'CMEQ - Corporation des maîtres électriciens du Québec',
    requiredLicenses: {
      maitre: 'Maître électricien',
      compagnon: 'Compagnon électricien'
    },
    arcFlashStandard: 'CSA Z462',
    inspectionRequired: true,
    maxVoltageWithoutInspector: 750, // volts
    references: {
      regulation: 'Code de construction du Québec, Chapitre V',
      standard: 'CSA Z462 - Sécurité en milieu de travail lors de travaux d\'électricité',
      authority: 'RBQ - Régie du bâtiment du Québec'
    }
  },
  ON: {
    electricalCode: 'Ontario Electrical Safety Code',
    authority: 'ESA - Electrical Safety Authority',
    requiredLicenses: {
      master: 'Master Electrician',
      journeyman: 'Construction Electrician'
    },
    arcFlashStandard: 'CSA Z462',
    inspectionRequired: true,
    maxVoltageWithoutInspector: 750,
    references: {
      regulation: 'Ontario Regulation 570/05',
      standard: 'CSA Z462 - Workplace electrical safety',
      authority: 'ESA - Electrical Safety Authority'
    }
  }
};

const FORM_SECTIONS = [
  { id: 'identification', title: { fr: 'Identification', en: 'Identification' }, icon: FileText, estimatedTime: 7 },
  { id: 'lockoutTagout', title: { fr: 'Consignation LOTO', en: 'Lockout/Tagout' }, icon: Lock, estimatedTime: 15 },
  { id: 'safetyMeasures', title: { fr: 'Mesures sécurité', en: 'Safety measures' }, icon: Shield, estimatedTime: 12 },
  { id: 'personnel', title: { fr: 'Personnel qualifié', en: 'Qualified personnel' }, icon: Users, estimatedTime: 8 },
  { id: 'procedures', title: { fr: 'Procédures', en: 'Procedures' }, icon: Settings, estimatedTime: 10 },
  { id: 'testing', title: { fr: 'Tests & Vérifications', en: 'Testing & Verification' }, icon: Eye, estimatedTime: 13 },
  { id: 'validation', title: { fr: 'Validation', en: 'Validation' }, icon: CheckCircle, estimatedTime: 5 }
];

// =================== PROPS ===================
interface ElectricalFormProps {
  permitId?: string;
  initialData?: Partial<ElectricalFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: ElectricalFormData) => Promise<void>;
  onSubmit: (data: ElectricalFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function ElectricalForm({
  permitId, initialData, language, province, userRole, onSave, onSubmit, onCancel, touchOptimized = true
}: ElectricalFormProps) {
  
  // =================== ÉTAT ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<ElectricalFormData>(() => ({
    identification: {
      permitType: 'electrique',
      permitNumber: `EL-${Date.now()}`,
      workType: 'installation',
      electricalSystem: {
        type: 'basse-tension',
        voltage: 120,
        frequency: 60,
        phases: 1,
        current: 15,
        power: 1.8
      },
      location: { 
        address: '', 
        specificLocation: '',
        electricalRoom: '',
        panelIdentification: '',
        circuitNumbers: []
      },
      workDescription: '',
      riskAssessment: {
        arcFlashRisk: 'category-1',
        shockRisk: 'medium',
        environmentalFactors: [],
        proximityLiveEquipment: false,
        workingSpace: 'adequate'
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      estimatedDuration: 8,
      contractor: { name: '', license: '', contact: '', electricalLicense: '' }
    },
    lockoutTagout: {
      lotoRequired: true,
      isolationPoints: [],
      verificationSteps: [],
      lockoutDevices: [],
      authorizedPersonnel: [],
      lotoCoordinator: '',
      removalProcedure: ''
    },
    safetyMeasures: {
      ppe: [],
      protectiveEquipment: [],
      safetyBoundaries: [],
      arcFlashProtection: {
        category: 'category-1',
        incidentEnergy: 4,
        arcRatedPPE: [],
        facialProtection: '',
        handProtection: '',
        bodyProtection: ''
      },
      groundingEquipment: [],
      testEquipment: []
    },
    personnel: {
      electricians: [], superviseur: [], safetyWatcher: []
    },
    procedures: {
      preWorkChecklist: [],
      safetyProcedures: [],
      testingProcedures: [],
      emergencyProcedures: []
    },
    testing: {
      continuityTests: [],
      insulationTests: [],
      groundTests: [],
      functionalTests: [],
      voltageVerification: [],
      testEquipmentCalibration: []
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
      [section]: { ...prev[section as keyof ElectricalFormData], [field]: value }
    }));
    setIsDirty(true);
    hapticFeedback('selection');
  }, [hapticFeedback]);

  // Détermination automatique type système selon voltage
  const determineSystemType = useCallback((voltage: number) => {
    if (voltage <= 1000) return 'basse-tension';
    if (voltage <= 35000) return 'moyenne-tension';
    if (voltage <= 138000) return 'haute-tension';
    return 'tres-haute-tension';
  }, []);

  // Mise à jour automatique catégorie arc flash
  useEffect(() => {
    const systemType = formData.identification.electricalSystem.type;
    const suggestedCategory = VOLTAGE_CLASSIFICATIONS[systemType]?.arcFlashCategory as keyof typeof ARC_FLASH_CATEGORIES;
    
    if (suggestedCategory && formData.safetyMeasures.arcFlashProtection.category !== suggestedCategory) {
      const arcFlashConfig = ARC_FLASH_CATEGORIES[suggestedCategory];
      updateFormData('safetyMeasures', 'arcFlashProtection', {
        ...formData.safetyMeasures.arcFlashProtection,
        category: suggestedCategory,
        incidentEnergy: arcFlashConfig.energy,
        arcRatedPPE: arcFlashConfig.ppe
      });
    }
  }, [formData.identification.electricalSystem.type, formData.safetyMeasures.arcFlashProtection.category, updateFormData]);

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
        if (!formData.identification.contractor.electricalLicense.trim()) {
          errors.push(language === 'fr' ? 'Licence électricien requise' : 'Electrical license required');
        }
        if (formData.identification.electricalSystem.voltage > PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.maxVoltageWithoutInspector && !formData.validation.electricalApproval) {
          errors.push(language === 'fr' ? 'Inspection électrique requise pour cette tension' : 'Electrical inspection required for this voltage');
        }
        break;
      case 'lockoutTagout':
        if (formData.lockoutTagout.lotoRequired) {
          if (formData.lockoutTagout.isolationPoints.length === 0) {
            errors.push(language === 'fr' ? 'Points d\'isolement requis' : 'Isolation points required');
          }
          if (!formData.lockoutTagout.lotoCoordinator.trim()) {
            errors.push(language === 'fr' ? 'Coordinateur LOTO requis' : 'LOTO coordinator required');
          }
        }
        break;
      case 'safetyMeasures':
        if (formData.safetyMeasures.ppe.length === 0) {
          errors.push(language === 'fr' ? 'EPI électriques requis' : 'Electrical PPE required');
        }
        if (formData.safetyMeasures.testEquipment.length === 0) {
          errors.push(language === 'fr' ? 'Équipements de test requis' : 'Test equipment required');
        }
        break;
      case 'personnel':
        if (formData.personnel.electricians.length === 0) {
          errors.push(language === 'fr' ? 'Électriciens qualifiés requis' : 'Qualified electricians required');
        }
        if (formData.personnel.superviseur.length === 0) {
          errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
        }
        break;
      case 'testing':
        if (formData.identification.workType === 'verification' && formData.testing.voltageVerification.length === 0) {
          errors.push(language === 'fr' ? 'Vérification tension requise' : 'Voltage verification required');
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
      case 'lockoutTagout': return renderLockoutTagoutSection();
      case 'safetyMeasures': return renderSafetyMeasuresSection();
      case 'personnel': return renderPersonnelSection();
      case 'procedures': return renderProceduresSection();
      case 'testing': return renderTestingSection();
      case 'validation': return renderValidationSection();
      default: return <div>Section non trouvée</div>;
  };

  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis travaux électriques' : 'Electrical work permit identification'}
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
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            placeholder="EL-2024-001"
          />
        </div>

        {/* Type de travail électrique */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Type de travail électrique' : 'Electrical work type'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ELECTRICAL_WORK_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData('identification', 'workType', key)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all min-h-[44px]
                  ${formData.identification.workType === key
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
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

        {/* Système électrique */}
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-3">
            {language === 'fr' ? 'Caractéristiques du système électrique' : 'Electrical system characteristics'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Tension (V)' : 'Voltage (V)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.identification.electricalSystem.voltage}
                onChange={(e) => {
                  const voltage = parseInt(e.target.value) || 0;
                  const systemType = determineSystemType(voltage);
                  updateFormData('identification', 'electricalSystem', {
                    ...formData.identification.electricalSystem,
                    voltage,
                    type: systemType
                  });
                }}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Courant (A)' : 'Current (A)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.identification.electricalSystem.current}
                onChange={(e) => updateFormData('identification', 'electricalSystem', {
                  ...formData.identification.electricalSystem,
                  current: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Phases' : 'Phases'}
              </label>
              <select
                value={formData.identification.electricalSystem.phases}
                onChange={(e) => updateFormData('identification', 'electricalSystem', {
                  ...formData.identification.electricalSystem,
                  phases: parseInt(e.target.value) as 1 | 3
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value={1}>1φ</option>
                <option value={3}>3φ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Puissance (kW)' : 'Power (kW)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.identification.electricalSystem.power}
                onChange={(e) => updateFormData('identification', 'electricalSystem', {
                  ...formData.identification.electricalSystem,
                  power: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Classification automatique */}
          <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ 
            backgroundColor: `${VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'green' ? '#f0fdf4' : 
              VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'yellow' ? '#fefce8' : 
              VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'orange' ? '#fff7ed' : '#fef2f2'}`
          }}>
            <Power className={`h-5 w-5 ${
              VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'green' ? 'text-green-600' : 
              VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'yellow' ? 'text-yellow-600' : 
              VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.color === 'orange' ? 'text-orange-600' : 'text-red-600'
            }`} />
            <div>
              <span className="font-medium">
                {VOLTAGE_CLASSIFICATIONS[formData.identification.electricalSystem.type]?.title[language]}
              </span>
              <div className="text-xs text-gray-600">
                {language === 'fr' ? 'Catégorie arc flash' : 'Arc flash category'}: {formData.safetyMeasures.arcFlashProtection.category}
              </div>
            </div>
          </div>
        </div>

        {/* Localisation électrique */}
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
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder={language === 'fr' ? 'Adresse du bâtiment' : 'Building address'}
            />
            <button
              type="button"
              className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Salle électrique' : 'Electrical room'}
              </label>
              <input
                type="text"
                value={formData.identification.location.electricalRoom}
                onChange={(e) => updateFormData('identification', 'location', {
                  ...formData.identification.location,
                  electricalRoom: e.target.value
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder={language === 'fr' ? 'Ex: Salle électrique B1-E02' : 'Ex: Electrical room B1-E02'}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {language === 'fr' ? 'Panneau/Tableau' : 'Panel/Board'}
              </label>
              <input
                type="text"
                value={formData.identification.location.panelIdentification}
                onChange={(e) => updateFormData('identification', 'location', {
                  ...formData.identification.location,
                  panelIdentification: e.target.value
                })}
                className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder={language === 'fr' ? 'Ex: TP-HVAC-01' : 'Ex: TP-HVAC-01'}
              />
            </div>
          </div>
        </div>

        {/* Description des travaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description détaillée des travaux électriques' : 'Detailed electrical work description'}
          </label>
          <div className="flex space-x-2">
            <textarea
              value={formData.identification.workDescription}
              onChange={(e) => updateFormData('identification', 'workDescription', e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder={language === 'fr' 
                ? 'Ex: Remplacement disjoncteur 100A, circuits 14-16-18, consignation panneau principal...'
                : 'Ex: Replace 100A breaker, circuits 14-16-18, lockout main panel...'
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

        {/* Entrepreneur et licences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Entrepreneur électricien' : 'Electrical contractor'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.name}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                name: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Licence électricien' : 'Electrical license'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.electricalLicense}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                electricalLicense: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder={language === 'fr' ? 'Ex: ME-12345 (QC), EC-67890 (ON)' : 'Ex: ME-12345 (QC), EC-67890 (ON)'}
            />
            <p className="text-xs text-yellow-700 mt-1">
              {language === 'fr' 
                ?.requiredLicenses?.master || PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredLicenses?.maitre
                : `Required: ${PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredLicenses?.master || PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredLicenses?.maitre || 'Valid license'} (${province})`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLockoutTagoutSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Procédures de consignation électrique (LOTO)' : 'Electrical lockout/tagout procedures (LOTO)'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section LOTO - À implémenter avec points isolement, vérifications absence tension, dispositifs consignation'
            : 'LOTO section - To implement with isolation points, zero energy verification, lockout devices'
          }
        </div>
      </div>
    </div>
  );

  const renderSafetyMeasuresSection = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Mesures de sécurité électrique' : 'Electrical safety measures'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section sécurité - À implémenter avec EPI arc flash, équipements protection, périmètres sécurité'
            : 'Safety section - To implement with arc flash PPE, protective equipment, safety boundaries'
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
            {language === 'fr' ? 'Personnel qualifié électricien' : 'Qualified electrical personnel'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel - À implémenter avec électriciens qualifiés, licences, formations arc flash'
            : 'Personnel section - To implement with qualified electricians, licenses, arc flash training'
          }
        </div>
      </div>
    </div>
  );

  const renderProceduresSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Procédures de travail électrique' : 'Electrical work procedures'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section procédures - À implémenter avec check-lists pré-travail, procédures sécurité, urgence'
            : 'Procedures section - To implement with pre-work checklists, safety procedures, emergency'
          }
        </div>
      </div>
    </div>
  );

  const renderTestingSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Tests et vérifications électriques' : 'Electrical testing and verification'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section tests - À implémenter avec tests continuité, isolement, mise à terre, vérification tension'
            : 'Testing section - To implement with continuity, insulation, ground tests, voltage verification'
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
            {language === 'fr' ? 'Validation et inspection électrique' : 'Electrical validation and inspection'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec inspections électriques, certificats conformité'
            : 'Validation section - To implement with electrical inspections, compliance certificates'
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
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
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
              className="flex items-center space-x-2 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 min-h-[44px] transition-colors"
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
            className="flex items-center space-x-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
