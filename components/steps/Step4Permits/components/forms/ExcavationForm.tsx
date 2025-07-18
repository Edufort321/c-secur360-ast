// =================== COMPONENTS/FORMS/EXCAVATIONFORM.TSX - FORMULAIRE EXCAVATION ULTRA-COMPLET ===================
// Formulaire excavation révolutionnaire avec analyse sol, services publics et protection tranchées

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Save, Send, CheckCircle, XCircle, 
  AlertTriangle, Activity, FileText, Users, Shield, Mountain, 
  Zap as Electric, Settings, Mic, Camera, MapPin
} from 'lucide-react';

// =================== TYPES ESSENTIELS ===================
interface ExcavationFormData {
  identification: {
    permitType: 'excavation';
    permitNumber: string;
    excavationType: 'tranchee' | 'fosse' | 'puits' | 'tunnel' | 'fondation';
    location: { address: string; coordinates?: { lat: number; lng: number }; specificLocation: string };
    workDescription: string;
    startDate: Date;
    endDate: Date;
    estimatedDuration: number;
    contractor: { name: string; license: string; contact: string };
  };
  dimensions: {
    length: number; width: number; depth: number; volume: number;
    soilType: 'type-a' | 'type-b' | 'type-c' | 'roc';
    waterTable: { present: boolean; depth?: number; drainageRequired: boolean };
    shoring: { required: boolean; type?: string; certification?: string };
  };
  utilities: {
    callBeforeDigging: { called: boolean; callNumber: string; ticketNumber: string; expiryDate: Date };
    markedUtilities: Array<{ id: string; type: string; provider: string; depth: number; marked: boolean }>;
    clearances: { electrical: number; gas: number; water: number; sewer: number };
    handDigging: { required: boolean; depth: number; equipment: string[] };
  };
  personnel: {
    superviseur: PersonnelMember[];
    operateurs: PersonnelMember[];
    signaleurs: PersonnelMember[];
  };
  safety: {
    entryExit: { ladders: number; spacing: number; condition: string };
    atmosphericTesting: { required: boolean; frequency: number; parameters: string[] };
    trafficControl: { required: boolean; signage: string[]; flaggers: number };
    emergencyProcedures: ProcedureStep[];
  };
  validation: {
    approvals: ApprovalLevel[];
    signatures: SignatureData[];
    inspections: InspectionRecord[];
    permitStatus: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  };
}

interface PersonnelMember {
  id: string; prenom: string; nom: string; poste: string; entreprise: string;
  age: number; experience: number; certifications: Certification[];
}

interface ProcedureStep {
  id: string; title: { fr: string; en: string }; description: { fr: string; en: string };
  isCompleted: boolean; completedBy?: string; completedAt?: Date;
}

// =================== CONFIGURATION ===================
const EXCAVATION_TYPES = {
  'tranchee': { icon: '🏗️', title: { fr: 'Tranchée', en: 'Trench' }, maxDepth: 6, minWidth: 0.6 },
  'fosse': { icon: '🕳️', title: { fr: 'Fosse', en: 'Pit' }, maxDepth: 4, minWidth: 1.2 },
  'puits': { icon: '⬇️', title: { fr: 'Puits', en: 'Shaft' }, maxDepth: 20, minWidth: 1.0 },
  'tunnel': { icon: '🚇', title: { fr: 'Tunnel', en: 'Tunnel' }, maxDepth: 50, minWidth: 2.0 },
  'fondation': { icon: '🏢', title: { fr: 'Fondation', en: 'Foundation' }, maxDepth: 8, minWidth: 1.5 }
};

const SOIL_TYPES = {
  'type-a': { title: { fr: 'Type A - Sol stable', en: 'Type A - Stable soil' }, angle: 53, color: 'green' },
  'type-b': { title: { fr: 'Type B - Sol moyennement stable', en: 'Type B - Moderately stable' }, angle: 45, color: 'yellow' },
  'type-c': { title: { fr: 'Type C - Sol instable', en: 'Type C - Unstable soil' }, angle: 34, color: 'red' },
  'roc': { title: { fr: 'Roc solide', en: 'Solid rock' }, angle: 90, color: 'gray' }
};

const PROVINCIAL_REGULATIONS = {
  QC: {
    maxDepthWithoutShoring: 1.5,
    callBeforeDigging: 'Info-Excavation',
    callNumber: '1-800-663-9228',
    requiredClearances: { electrical: 3.0, gas: 1.0, water: 0.5, sewer: 0.3 }
  },
  ON: {
    maxDepthWithoutShoring: 1.2,
    callBeforeDigging: 'Ontario One Call',
    callNumber: '1-800-400-2255',
    requiredClearances: { electrical: 3.0, gas: 1.5, water: 0.6, sewer: 0.3 }
  }
};

const FORM_SECTIONS = [
  { id: 'identification', title: { fr: 'Identification', en: 'Identification' }, icon: FileText, estimatedTime: 5 },
  { id: 'dimensions', title: { fr: 'Dimensions & Sol', en: 'Dimensions & Soil' }, icon: Mountain, estimatedTime: 8 },
  { id: 'utilities', title: { fr: 'Services publics', en: 'Utilities' }, icon: Electric, estimatedTime: 12 },
  { id: 'personnel', title: { fr: 'Personnel', en: 'Personnel' }, icon: Users, estimatedTime: 7 },
  { id: 'safety', title: { fr: 'Sécurité & Accès', en: 'Safety & Access' }, icon: Shield, estimatedTime: 10 },
  { id: 'validation', title: { fr: 'Validation', en: 'Validation' }, icon: CheckCircle, estimatedTime: 4 }
];

// =================== PROPS ===================
interface ExcavationFormProps {
  permitId?: string;
  initialData?: Partial<ExcavationFormData>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  userRole: string;
  onSave: (data: ExcavationFormData) => Promise<void>;
  onSubmit: (data: ExcavationFormData) => Promise<void>;
  onCancel: () => void;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL ===================
export default function ExcavationForm({
  permitId, initialData, language, province, userRole, onSave, onSubmit, onCancel, touchOptimized = true
}: ExcavationFormProps) {
  
  // =================== ÉTAT ===================
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<ExcavationFormData>(() => ({
    identification: {
      permitType: 'excavation',
      permitNumber: `EX-${Date.now()}`,
      excavationType: 'tranchee',
      location: { address: '', specificLocation: '' },
      workDescription: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
      estimatedDuration: 8,
      contractor: { name: '', license: '', contact: '' }
    },
    dimensions: {
      length: 0, width: 0, depth: 0, volume: 0,
      soilType: 'type-b',
      waterTable: { present: false, drainageRequired: false },
      shoring: { required: false }
    },
    utilities: {
      callBeforeDigging: {
        called: false,
        callNumber: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.callNumber || '',
        ticketNumber: '',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      markedUtilities: [],
      clearances: PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS]?.requiredClearances || { electrical: 3, gas: 1, water: 0.5, sewer: 0.3 },
      handDigging: { required: false, depth: 0.5, equipment: [] }
    },
    personnel: { superviseur: [], operateurs: [], signaleurs: [] },
    safety: {
      entryExit: { ladders: 0, spacing: 7.5, condition: '' },
      atmosphericTesting: { required: false, frequency: 15, parameters: [] },
      trafficControl: { required: false, signage: [], flaggers: 0 },
      emergencyProcedures: []
    },
    validation: { approvals: [], signatures: [], inspections: [], permitStatus: 'draft' },
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
      [section]: { ...prev[section as keyof ExcavationFormData], [field]: value }
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
        break;
      case 'dimensions':
        if (formData.dimensions.depth <= 0) {
          errors.push(language === 'fr' ? 'Profondeur requise' : 'Depth required');
        }
        break;
      case 'utilities':
        if (!formData.utilities.callBeforeDigging.called) {
          errors.push(language === 'fr' ? 'Appel avant excavation requis' : 'Call before digging required');
        }
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [section.id]: errors }));
    return errors.length === 0;
  }, [formData, language]);

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
      case 'dimensions': return renderDimensionsSection();
      case 'utilities': return renderUtilitiesSection();
      case 'personnel': return renderPersonnelSection();
      case 'safety': return renderSafetySection();
      case 'validation': return renderValidationSection();
      default: return <div>Section non trouvée</div>;
    }
  };

  const renderIdentificationSection = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mountain className="h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Identification du permis excavation' : 'Excavation permit identification'}
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
            className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="EX-2024-001"
          />
        </div>

        {/* Type d'excavation */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Type d\'excavation' : 'Excavation type'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(EXCAVATION_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData('identification', 'excavationType', key)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all min-h-[44px]
                  ${formData.identification.excavationType === key
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{config.title[language]}</div>
                    <div className="text-xs text-gray-500">
                      Max: {config.maxDepth}m | Min: {config.minWidth}m
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
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder={language === 'fr' ? 'Adresse du site' : 'Site address'}
            />
            <button
              type="button"
              className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Description des travaux */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'fr' ? 'Description des travaux' : 'Work description'}
          </label>
          <div className="flex space-x-2">
            <textarea
              value={formData.identification.workDescription}
              onChange={(e) => updateFormData('identification', 'workDescription', e.target.value)}
              rows={3}
              className="flex-1 px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder={language === 'fr' 
                ? 'Ex: Installation conduite d\'eau, tranchée 50m x 0.8m x 1.2m profondeur...'
                : 'Ex: Water line installation, trench 50m x 0.8m x 1.2m depth...'
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

        {/* Dates et entreprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Date début' : 'Start date'}
            </label>
            <input
              type="datetime-local"
              value={formData.identification.startDate.toISOString().slice(0, 16)}
              onChange={(e) => updateFormData('identification', 'startDate', new Date(e.target.value))}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'fr' ? 'Entreprise' : 'Contractor'}
            </label>
            <input
              type="text"
              value={formData.identification.contractor.name}
              onChange={(e) => updateFormData('identification', 'contractor', {
                ...formData.identification.contractor,
                name: e.target.value
              })}
              className="w-full px-4 py-3 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDimensionsSection = () => (
    <div className="space-y-6">
      <div className="bg-stone-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mountain className="h-6 w-6 text-stone-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Dimensions et analyse du sol' : 'Dimensions and soil analysis'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section dimensions - À implémenter avec calculs volume, type sol, étaiement'
            : 'Dimensions section - To implement with volume calculations, soil type, shoring'
          }
        </div>
      </div>
    </div>
  );

  const renderUtilitiesSection = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Electric className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Services publics et marquage' : 'Utilities and marking'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section services publics - À implémenter avec Info-Excavation, marquage, dégagements'
            : 'Utilities section - To implement with Call Before Dig, marking, clearances'
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
            {language === 'fr' ? 'Personnel et équipement' : 'Personnel and equipment'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section personnel - À implémenter avec superviseur, opérateurs, signaleurs'
            : 'Personnel section - To implement with supervisor, operators, flaggers'
          }
        </div>
      </div>
    </div>
  );

  const renderSafetySection = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Sécurité et contrôle d\'accès' : 'Safety and access control'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section sécurité - À implémenter avec échelles, tests atmosphériques, circulation'
            : 'Safety section - To implement with ladders, atmospheric testing, traffic control'
          }
        </div>
      </div>
    </div>
  );

  const renderValidationSection = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Validation et inspections' : 'Validation and inspections'}
          </h3>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          {language === 'fr' 
            ? 'Section validation - À implémenter avec inspections quotidiennes, signatures'
            : 'Validation section - To implement with daily inspections, signatures'
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
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
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
              className="flex items-center space-x-2 px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 min-h-[44px] transition-colors"
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
            className="flex items-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
