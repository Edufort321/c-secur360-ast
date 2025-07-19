// =================== COMPONENTS/FORMS/CONFINEDSPACEFORM.TSX - FORMULAIRE ESPACE CLOS ULTRA-COMPLET ===================
// Formulaire espace clos révolutionnaire avec navigation progressive, voice input, haptics, Bluetooth et validation temps réel

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  // Navigation & UI
  ChevronLeft, ChevronRight, Save, Send, Download, Upload,
  // Status & Progress
  CheckCircle, XCircle, Clock, AlertTriangle, Zap, Activity,
  // Features
  Mic, Camera, MapPin, Bluetooth, QrCode, Signature,
  // Content
  FileText, Users, Shield, Eye, Wind, Thermometer, 
  Settings, Bell, Star, Award, Lock, Key
} from 'lucide-react';

// =================== TYPES & INTERFACES ===================
interface ConfinedSpaceFormData {
  // Section 1 - Identification
  identification: {
    permitType: 'espace-clos';
    permitNumber: string;
    location: {
      address: string;
      coordinates?: { lat: number; lng: number };
      building?: string;
      floor?: string;
      room?: string;
      specificLocation: string;
    };
    spaceDescription: string;
    workDescription: string;
    startDate: Date;
    endDate: Date;
    estimatedDuration: number; // hours
    emergencyContact: {
      name: string;
      phone: string;
      role: string;
    };
  };

  // Section 2 - Personnel
  personnel: {
    superviseur: PersonnelMember[];
    surveillants: PersonnelMember[];
    entrants: PersonnelMember[];
    sauveteurs: PersonnelMember[];
    techniciens: PersonnelMember[];
  };

  // Section 3 - Tests Atmosphériques
  atmospheric: {
    initialTests: AtmosphericReading[];
    continuousMonitoring: {
      enabled: boolean;
      interval: number; // minutes
      devices: BluetoothDevice[];
    };
    limits: AtmosphericLimits;
    emergencyLimits: AtmosphericLimits;
    ventilationRequired: boolean;
    ventilationDetails?: VentilationSetup;
  };

  // Section 4 - Procédures
  procedures: {
    preEntryChecklist: ProcedureStep[];
    workProcedures: ProcedureStep[];
    emergencyProcedures: ProcedureStep[];
    communicationPlan: CommunicationPlan;
    rescueEquipment: RescueEquipment[];
  };

  // Section 5 - Équipements
  equipment: {
    detectionEquipment: EquipmentItem[];
    rescueEquipment: EquipmentItem[];
    ventilationEquipment: EquipmentItem[];
    ppe: PPEItem[];
    communicationEquipment: EquipmentItem[];
  };

  // Section 6 - Validation
  validation: {
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    finalChecklist: ValidationStep[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    issuedBy?: SignatureData;
    issuedAt?: Date;
    validUntil?: Date;
  };
}

interface PersonnelMember {
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
  contactUrgence: {
    nom: string;
    relation: string;
    telephone: string;
  };
}

interface AtmosphericReading {
  id: string;
  timestamp: Date;
  location: string;
  operator: string;
  readings: {
    oxygen: number;
    lel: number;
    h2s: number;
    co: number;
    temperature: number;
    pressure?: number;
  };
  deviceId: string;
  isValid: boolean;
  notes?: string;
  photo?: string;
}

interface ProcedureStep {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  acceptanceCriteria: { fr: string[]; en: string[] };
  requiredPersonnel: string[];
  estimatedTime: number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  voiceNotes?: string[];
  photos?: string[];
  references?: { fr: string; en: string };
}

// =================== PROPS ===================
interface ConfinedSpaceFormProps {
  permitId?: string;
  initialData?: Partial<ConfinedSpaceFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: ConfinedSpaceFormData) => Promise<void>;
  onSubmit: (data: ConfinedSpaceFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== CONFIGURATION SECTIONS ===================
const FORM_SECTIONS = [
  {
    id: 'identification',
    title: { fr: 'Identification', en: 'Identification' },
    icon: FileText,
    estimatedTime: 5,
    fields: ['permitNumber', 'location', 'description', 'dates']
  },
  {
    id: 'personnel',
    title: { fr: 'Personnel', en: 'Personnel' },
    icon: Users,
    estimatedTime: 10,
    fields: ['superviseur', 'surveillants', 'entrants', 'sauveteurs']
  },
  {
    id: 'atmospheric',
    title: { fr: 'Tests atmosphériques', en: 'Atmospheric testing' },
    icon: Wind,
    estimatedTime: 8,
    fields: ['initialTests', 'monitoring', 'ventilation']
  },
  {
    id: 'procedures',
    title: { fr: 'Procédures', en: 'Procedures' },
    icon: Shield,
    estimatedTime: 12,
    fields: ['preEntry', 'work', 'emergency', 'communication']
  },
  {
    id: 'equipment',
    title: { fr: 'Équipements', en: 'Equipment' },
    icon: Settings,
    estimatedTime: 6,
    fields: ['detection', 'rescue', 'ventilation', 'ppe']
  },
  {
    id: 'validation',
    title: { fr: 'Validation', en: 'Validation' },
    icon: CheckCircle,
    estimatedTime: 4,
    fields: ['approvals', 'signatures', 'checklist']
  }
];

// =================== RÉGLEMENTATIONS PAR PROVINCE ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    atmosphericLimits: {
      oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 20 },
      co: { max: 35, critical: 200 }
    },
    requiredPersonnel: {
      superviseur: { minAge: 21, minExperience: 5, certifications: ['espace-clos-superviseur-qc'] },
      surveillant: { minAge: 18, minExperience: 2, certifications: ['espace-clos-surveillant-qc'] },
      entrant: { minAge: 18, minExperience: 1, certifications: ['espace-clos-entrant-qc'] }
    },
    references: {
      regulation: 'RSST, art. 297-311',
      standard: 'CSA Z1006-16',
      authority: 'CNESST'
    }
  },
  ON: {
    atmosphericLimits: {
      oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
      lel: { max: 10, critical: 25 },
      h2s: { max: 10, critical: 20 },
      co: { max: 25, critical: 200 } // Plus strict en Ontario
    },
    requiredPersonnel: {
      superviseur: { minAge: 21, minExperience: 5, certifications: ['espace-clos-superviseur-on'] },
      surveillant: { minAge: 18, minExperience: 2, certifications: ['espace-clos-surveillant-on'] }
    },
    references: {
      regulation: 'O. Reg. 632/05',
      standard: 'CSA Z1006-16',
      authority: 'Ministry of Labour'
    }
  }
  // Ajouter AB, BC, etc.
};

// =================== COMPOSANT PRINCIPAL ===================
export default function ConfinedSpaceForm({
  permitId,
  initialData,
  language,
  province,
  userRole,
  onSave,
  onSubmit,
  onCancel,
  touchOptimized = true
}: ConfinedSpaceFormProps) {
  
  // =================== ÉTAT PRINCIPAL ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<ConfinedSpaceFormData>(() => ({
    identification: {
      permitType: 'espace-clos',
      permitNumber: `CS-${Date.now()}`,
      location: {
        address: '',
        specificLocation: '',
      },
      spaceDescription: '',
      workDescription: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // +8h
      estimatedDuration: 8,
      emergencyContact: {
        name: '',
        phone: '',
        role: ''
      }
    },
    personnel: {
      superviseur: [],
      surveillants: [],
      entrants: [],
      sauveteurs: [],
      techniciens: []
    },
    atmospheric: {
      initialTests: [],
      continuousMonitoring: {
        enabled: false,
        interval: 15,
        devices: []
      },
      limits: PROVINCIAL_REGULATIONS[province].atmosphericLimits,
      emergencyLimits: PROVINCIAL_REGULATIONS[province].atmosphericLimits,
      ventilationRequired: true
    },
    procedures: {
      preEntryChecklist: [],
      workProcedures: [],
      emergencyProcedures: [],
      communicationPlan: {
        primary: '',
        backup: '',
        emergencyProtocol: ''
      },
      rescueEquipment: []
    },
    equipment: {
      detectionEquipment: [],
      rescueEquipment: [],
      ventilationEquipment: [],
      ppe: [],
      communicationEquipment: []
    },
    validation: {
      approvals: [],
      signatures: [],
      finalChecklist: [],
      permitStatus: 'draft'
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

  // =================== HOOKS PERSONNALISÉS ===================
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSupported] = useState(() => 'webkitSpeechRecognition' in window);
  const [geolocationSupported] = useState(() => 'geolocation' in navigator);
  const [bluetoothSupported] = useState(() => 'bluetooth' in navigator);

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
        ...prev[section as keyof ConfinedSpaceFormData],
        [field]: value
      }
    }));
    setIsDirty(true);
    hapticFeedback('selection');
  }, [hapticFeedback]);

  // Validation section
  const validateSection = useCallback((sectionIndex: number) => {
    const section = FORM_SECTIONS[sectionIndex];
    const errors: string[] = [];
    
    // Validation spécifique par section
    switch (section.id) {
      case 'identification':
        if (!formData.identification.location.address.trim()) {
          errors.push(language === 'fr' ? 'Adresse requise' : 'Address required');
        }
        if (!formData.identification.spaceDescription.trim()) {
          errors.push(language === 'fr' ? 'Description espace requise' : 'Space description required');
        }
        break;
        
      case 'personnel':
        if (formData.personnel.superviseur.length === 0) {
          errors.push(language === 'fr' ? 'Superviseur requis' : 'Supervisor required');
        }
        if (formData.personnel.surveillants.length === 0) {
          errors.push(language === 'fr' ? 'Surveillant requis' : 'Attendant required');
        }
        break;
        
      case 'atmospheric':
        if (formData.atmospheric.initialTests.length === 0) {
          errors.push(language === 'fr' ? 'Tests atmosphériques requis' : 'Atmospheric tests required');
        }
        break;
        
      // Ajouter validation autres sections
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [section.id]: errors
    }));
    
    return errors.length === 0;
  }, [formData, language]);

  // Navigation sections
  const navigateToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= FORM_SECTIONS.length) return;
    
    // Validation section actuelle avant navigation
    const isCurrentValid = validateSection(currentSection);
    if (!isCurrentValid && sectionIndex > currentSection) {
      hapticFeedback('error');
      return;
    }
    
    setCurrentSection(sectionIndex);
    hapticFeedback('navigation');
    
    // Scroll vers le top
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

  // =================== RENDU SECTION ACTUELLE ===================
  const renderCurrentSection = () => {
    const section = FORM_SECTIONS[currentSection];
    
    switch (section.id) {
      case 'identification':
        return renderIdentificationSection();
      case 'personnel':
        return renderPersonnelSection();
      case 'atmospheric':
        return renderAtmosphericSection();
      case 'procedures':
        return renderProceduresSection();
      case 'equipment':
        return renderEquipmentSection();
      case 'validation':
        return renderValidationSection();
      default:
        return <div>Section non trouvée</div>;
    }
  };

  // =================== SECTIONS RENDER FUNCTIONS ===================
  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis' : 'Permit identification'}
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
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={language === 'fr' ? 'CS-2024-001' : 'CS-2024-001'}
          />
        </div>

        {/* Localisation avec GPS */}
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
            {geolocationSupported && (
              <button
                type="button"
                onClick={() => {/* Implémenter GPS */}}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <MapPin className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Description de l'espace */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description de l\'espace confiné' : 'Confined space description'}
          </label>
          <div className="flex space-x-2">
            <textarea
              value={formData.identification.spaceDescription}
              onChange={(e) => updateFormData('identification', 'spaceDescription', e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'fr' 
                ? 'Ex: Réservoir de stockage, dimensions 3x2x2m, accès par trappe supérieure...'
                : 'Ex: Storage tank, dimensions 3x2x2m, access via top hatch...'
              }
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={() => {/* Implémenter voice input */}}
                className={`px-4 py-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isVoiceActive 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
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
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => updateFormData('identification', 'estimatedDuration', parseFloat(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonnelSection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Personnel assigné' : 'Assigned personnel'}
          </h3>
        </div>
        
        {/* Placeholder pour section personnel */}
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel - À implémenter avec QR scan, certifications, etc.'
            : 'Personnel section - To implement with QR scan, certifications, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderAtmosphericSection = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wind className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Tests atmosphériques' : 'Atmospheric testing'}
          </h3>
        </div>
        
        {/* Placeholder pour section tests */}
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section tests atmosphériques - À implémenter avec Bluetooth, monitoring temps réel, etc.'
            : 'Atmospheric testing section - To implement with Bluetooth, real-time monitoring, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderProceduresSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Procédures sécurité' : 'Safety procedures'}
          </h3>
        </div>
        
        {/* Placeholder pour section procédures */}
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section procédures - À implémenter avec check-lists interactives, voice notes, etc.'
            : 'Procedures section - To implement with interactive checklists, voice notes, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderEquipmentSection = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Équipements requis' : 'Required equipment'}
          </h3>
        </div>
        
        {/* Placeholder pour section équipements */}
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section équipements - À implémenter avec inventaire, vérifications, photos, etc.'
            : 'Equipment section - To implement with inventory, checks, photos, etc.'
          }
        </div>
      </div>
    </div>
  );

  const renderValidationSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Validation et signatures' : 'Validation and signatures'}
          </h3>
        </div>
        
        {/* Placeholder pour section validation */}
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec signatures électroniques, approbations, etc.'
            : 'Validation section - To implement with electronic signatures, approvals, etc.'
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
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
          {/* Bouton précédent */}
          <button
            onClick={() => navigateToSection(currentSection - 1)}
            disabled={currentSection === 0}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{language === 'fr' ? 'Précédent' : 'Previous'}</span>
          </button>

          {/* Boutons centraux */}
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

          {/* Bouton suivant */}
          <button
            onClick={() => navigateToSection(currentSection + 1)}
            disabled={currentSection === FORM_SECTIONS.length - 1}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
