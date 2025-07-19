// =================== COMPONENTS/PERMITFORM.TSX - FORMULAIRE MOBILE-FIRST ===================
// Formulaire principal avec validation temps réel, navigation progressive et optimisation mobile

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Info, 
  MapPin, 
  Users, 
  Calendar,
  Clock,
  FileText,
  Shield,
  Zap,
  Settings,
  Save,
  Send,
  Eye,
  Camera,
  Mic,
  Download,
  Upload
} from 'lucide-react';
import { usePermits } from '../hooks/usePermits';
import { useSupabase } from '../hooks/useSupabase';
import { validateFormSection, generateFormErrors } from '../utils/validators';
import { generatePermitCode } from '../utils/generators';
import type { 
  PermitFormData,
  PermitType,
  FormSection,
  ValidationResult,
  MobileFormProps,
  FormProgress,
  FieldError
} from '../types';

// =================== CONFIGURATION SECTIONS FORMULAIRE ===================
const FORM_SECTIONS: Record<FormSection, {
  id: FormSection;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  icon: React.ReactNode;
  fields: string[];
  required: boolean;
  estimatedTime: number; // minutes
}> = {
  'identification': {
    id: 'identification',
    title: { fr: 'Identification', en: 'Identification' },
    description: { fr: 'Informations générales du permis', en: 'General permit information' },
    icon: <FileText className="w-5 h-5" />,
    fields: ['name', 'type', 'location', 'site', 'secteur', 'description'],
    required: true,
    estimatedTime: 2
  },
  'personnel': {
    id: 'personnel',
    title: { fr: 'Personnel', en: 'Personnel' },
    description: { fr: 'Équipe et responsabilités', en: 'Team and responsibilities' },
    icon: <Users className="w-5 h-5" />,
    fields: ['superviseur', 'surveillant', 'entrants', 'personneCompetente'],
    required: true,
    estimatedTime: 3
  },
  'tests': {
    id: 'tests',
    title: { fr: 'Tests & Mesures', en: 'Tests & Measurements' },
    description: { fr: 'Tests atmosphériques et sécurité', en: 'Atmospheric tests and safety' },
    icon: <Shield className="w-5 h-5" />,
    fields: ['atmospheric', 'equipment', 'procedures', 'monitoring'],
    required: true,
    estimatedTime: 4
  },
  'procedures': {
    id: 'procedures',
    title: { fr: 'Procédures', en: 'Procedures' },
    description: { fr: 'Procédures de sécurité spécialisées', en: 'Specialized safety procedures' },
    icon: <Settings className="w-5 h-5" />,
    fields: ['workProcedures', 'emergencyProcedures', 'communication'],
    required: true,
    estimatedTime: 3
  },
  'validation': {
    id: 'validation',
    title: { fr: 'Validation', en: 'Validation' },
    description: { fr: 'Révision et signatures', en: 'Review and signatures' },
    icon: <Check className="w-5 h-5" />,
    fields: ['signatures', 'approvals', 'finalValidation'],
    required: true,
    estimatedTime: 2
  },
  'surveillance': {
    id: 'surveillance',
    title: { fr: 'Surveillance', en: 'Monitoring' },
    description: { fr: 'Surveillance continue et rapports', en: 'Continuous monitoring and reports' },
    icon: <Eye className="w-5 h-5" />,
    fields: ['monitoring', 'reports', 'incidents'],
    required: false,
    estimatedTime: 1
  }
};

// =================== INTERFACE PROPS COMPOSANT ===================
interface PermitFormProps extends MobileFormProps {
  initialData?: Partial<PermitFormData>;
  permitType: PermitType;
  province: string;
  language: 'fr' | 'en';
  mode: 'create' | 'edit' | 'view';
  
  // Callbacks
  onSave?: (data: PermitFormData) => Promise<void>;
  onSubmit?: (data: PermitFormData) => Promise<void>;
  onCancel?: () => void;
  onSectionChange?: (section: FormSection, progress: FormProgress) => void;
  
  // Optimisations mobile
  enableAutoSave?: boolean;
  enableOfflineMode?: boolean;
  enableVoiceInput?: boolean;
  enablePhotoCapture?: boolean;
  touchOptimized?: boolean;
}

// =================== COMPOSANT PRINCIPAL FORMULAIRE ===================
export const PermitForm: React.FC<PermitFormProps> = ({
  initialData = {},
  permitType,
  province,
  language = 'fr',
  mode = 'create',
  onSave,
  onSubmit,
  onCancel,
  onSectionChange,
  enableAutoSave = true,
  enableOfflineMode = true,
  enableVoiceInput = false,
  enablePhotoCapture = true,
  touchOptimized = true
}) => {
  // =================== HOOKS ET STATE ===================
  const [formData, setFormData] = useState<PermitFormData>({
    ...initialData,
    id: initialData.id || generatePermitCode(permitType, province),
    type: permitType,
    province,
    language,
    dateCreation: initialData.dateCreation || new Date(),
    dateModification: new Date(),
    status: initialData.status || 'pending'
  } as PermitFormData);

  const [currentSection, setCurrentSection] = useState<FormSection>('identification');
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, FieldError>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Refs pour navigation mobile
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<Record<FormSection, HTMLDivElement | null>>({});
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Hooks customs
  const { savePermit, loadPermit } = useSupabase();
  const { validateField, validateSection } = usePermits({
    province,
    language,
    mobileOptimized: true
  });

  // =================== CALCULS PROGRESSION ===================
  const formProgress = React.useMemo((): FormProgress => {
    const sections = Object.values(FORM_SECTIONS);
    const totalSections = sections.length;
    const completedCount = completedSections.size;
    
    // Calcul progression par champs
    const totalFields = sections.reduce((acc, section) => acc + section.fields.length, 0);
    const completedFields = sections.reduce((acc, section) => {
      if (completedSections.has(section.id)) {
        return acc + section.fields.length;
      }
      return acc;
    }, 0);
    
    // Temps estimé restant
    const remainingSections = sections.filter(s => !completedSections.has(s.id));
    const estimatedTimeRemaining = remainingSections.reduce((acc, s) => acc + s.estimatedTime, 0);
    
    return {
      currentSection,
      completedSections: Array.from(completedSections),
      totalSections,
      completedCount,
      percentage: Math.round((completedCount / totalSections) * 100),
      fieldProgress: {
        total: totalFields,
        completed: completedFields,
        percentage: Math.round((completedFields / totalFields) * 100)
      },
      estimatedTimeRemaining,
      isValid: completedCount === totalSections && Object.keys(validationErrors).length === 0
    };
  }, [currentSection, completedSections, validationErrors]);

  // =================== VALIDATION TEMPS RÉEL ===================
  const validateCurrentSection = useCallback(async () => {
    const sectionConfig = FORM_SECTIONS[currentSection];
    const sectionData = sectionConfig.fields.reduce((acc, field) => {
      acc[field] = formData[field as keyof PermitFormData];
      return acc;
    }, {} as Record<string, any>);

    const validation = await validateSection(currentSection, sectionData, formData);
    
    // Mise à jour erreurs
    const newErrors = { ...validationErrors };
    sectionConfig.fields.forEach(field => {
      if (validation.fieldErrors[field]) {
        newErrors[field] = validation.fieldErrors[field];
      } else {
        delete newErrors[field];
      }
    });
    
    setValidationErrors(newErrors);
    
    // Marquer section comme complétée si valide
    if (validation.isValid) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
    } else {
      setCompletedSections(prev => {
        const updated = new Set(prev);
        updated.delete(currentSection);
        return updated;
      });
    }
    
    return validation;
  }, [currentSection, formData, validateSection, validationErrors]);

  // =================== AUTO-SAVE MOBILE ===================
  const triggerAutoSave = useCallback(async () => {
    if (!enableAutoSave || !isDirty || mode === 'view') return;
    
    setIsSaving(true);
    try {
      await savePermit(formData, { isAutoSave: true, enableOffline: enableOfflineMode });
      setIsDirty(false);
      
      // Feedback haptic succès
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Erreur auto-save:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      setIsSaving(false);
    }
  }, [enableAutoSave, isDirty, mode, formData, savePermit, enableOfflineMode]);

  // =================== NAVIGATION SECTIONS ===================
  const navigateToSection = useCallback((targetSection: FormSection, smooth = true) => {
    // Validation section actuelle avant navigation
    validateCurrentSection();
    
    // Scroll vers section mobile
    const targetRef = sectionRefs.current[targetSection];
    if (targetRef && smooth) {
      targetRef.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
    
    setCurrentSection(targetSection);
    onSectionChange?.(targetSection, formProgress);
    
    // Feedback haptic navigation
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, [validateCurrentSection, formProgress, onSectionChange]);

  const nextSection = useCallback(() => {
    const sections = Object.keys(FORM_SECTIONS) as FormSection[];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      navigateToSection(sections[currentIndex + 1]);
    }
  }, [currentSection, navigateToSection]);

  const previousSection = useCallback(() => {
    const sections = Object.keys(FORM_SECTIONS) as FormSection[];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      navigateToSection(sections[currentIndex - 1]);
    }
  }, [currentSection, navigateToSection]);

  // =================== GESTION DONNÉES FORMULAIRE ===================
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      dateModification: new Date()
    }));
    setIsDirty(true);
    
    // Validation temps réel du champ
    validateField(field, value, formData).then(validation => {
      if (validation.fieldErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: validation.fieldErrors[field]
        }));
      } else {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    });
    
    // Déclencher auto-save avec délai
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    autoSaveTimer.current = setTimeout(triggerAutoSave, 2000);
  }, [formData, validateField, triggerAutoSave]);

  // =================== ACTIONS FORMULAIRE ===================
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave?.(formData);
      setIsDirty(false);
      
      // Feedback haptic succès
      if (navigator.vibrate) {
        navigator.vibrate([50, 25, 50]);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation complète avant soumission
    setShowValidation(true);
    const finalValidation = await validateCurrentSection();
    
    if (!finalValidation.isValid) {
      // Scroll vers première erreur
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit?.(formData);
      
      // Feedback haptic succès final
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // =================== EFFETS ===================
  useEffect(() => {
    // Validation initiale
    validateCurrentSection();
  }, [validateCurrentSection]);

  useEffect(() => {
    // Cleanup auto-save timer
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  // =================== RENDU COMPOSANT ===================
  const sectionsList = Object.values(FORM_SECTIONS);
  const currentSectionConfig = FORM_SECTIONS[currentSection];
  const isFirstSection = currentSection === 'identification';
  const isLastSection = currentSection === 'surveillance';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =================== HEADER STICKY MOBILE =================== */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {language === 'fr' ? 'Nouveau Permis' : 'New Permit'}
            </h1>
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm font-medium text-gray-600">
                {formProgress.percentage}%
              </span>
            </div>
          </div>
          
          {/* Progress bar visuelle */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${formProgress.percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Section actuelle */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {currentSectionConfig.icon}
              <span className="text-sm font-medium text-gray-700">
                {currentSectionConfig.title[language]}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {language === 'fr' ? 'Étape' : 'Step'} {sectionsList.findIndex(s => s.id === currentSection) + 1}/{sectionsList.length}
            </span>
          </div>
        </div>
      </div>

      {/* =================== NAVIGATION SECTIONS MOBILE =================== */}
      <div className="sticky top-[120px] z-40 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2">
          {sectionsList.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            const isCurrent = section.id === currentSection;
            const hasErrors = section.fields.some(field => validationErrors[field]);
            
            return (
              <button
                key={section.id}
                onClick={() => navigateToSection(section.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${isCurrent 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                    : isCompleted
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : hasErrors
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }
                  active:scale-95
                `}
              >
                {/* Icon status */}
                <div className="w-5 h-5 flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : hasErrors ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                </div>
                
                {/* Label section */}
                <span className="whitespace-nowrap">
                  {section.title[language]}
                </span>
                
                {/* Temps estimé */}
                {!isCompleted && (
                  <span className="text-xs opacity-75">
                    {section.estimatedTime}min
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================== CONTENU FORMULAIRE SCROLLABLE =================== */}
      <form ref={formRef} className="flex-1 pb-20">
        <div className="px-4 py-6 space-y-6">
          {/* Description section actuelle */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {currentSectionConfig.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  {currentSectionConfig.title[language]}
                </h3>
                <p className="text-sm text-blue-700">
                  {currentSectionConfig.description[language]}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentSectionConfig.estimatedTime} {language === 'fr' ? 'min' : 'min'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {currentSectionConfig.fields.length} {language === 'fr' ? 'champs' : 'fields'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu section dynamique */}
          <div 
            ref={el => sectionRefs.current[currentSection] = el}
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Rendu section spécialisée */}
                {currentSection === 'identification' && (
                  <IdentificationSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    touchOptimized={touchOptimized}
                  />
                )}
                
                {currentSection === 'personnel' && (
                  <PersonnelSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    permitType={permitType}
                    touchOptimized={touchOptimized}
                  />
                )}
                
                {currentSection === 'tests' && (
                  <TestsSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    permitType={permitType}
                    province={province}
                    touchOptimized={touchOptimized}
                    enablePhotoCapture={enablePhotoCapture}
                  />
                )}
                
                {currentSection === 'procedures' && (
                  <ProceduresSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    permitType={permitType}
                    touchOptimized={touchOptimized}
                    enableVoiceInput={enableVoiceInput}
                  />
                )}
                
                {currentSection === 'validation' && (
                  <ValidationSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    formProgress={formProgress}
                    touchOptimized={touchOptimized}
                  />
                )}
                
                {currentSection === 'surveillance' && (
                  <SurveillanceSection
                    data={formData}
                    onChange={updateFormData}
                    errors={validationErrors}
                    language={language}
                    touchOptimized={touchOptimized}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Erreurs globales */}
          {showValidation && Object.keys(validationErrors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-2">
                    {language === 'fr' ? 'Erreurs à corriger' : 'Errors to fix'}
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>• {error.message[language]}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </form>

      {/* =================== NAVIGATION MOBILE STICKY =================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          {/* Bouton précédent */}
          <button
            onClick={previousSection}
            disabled={isFirstSection}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
              ${isFirstSection
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'fr' ? 'Précédent' : 'Previous'}</span>
          </button>

          {/* Bouton sauvegarder */}
          <button
            onClick={handleSave}
            disabled={isLoading || !isDirty}
            className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium transition-all active:bg-blue-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'fr' ? 'Sauver' : 'Save'}</span>
          </button>

          {/* Bouton suivant/soumettre */}
          {isLastSection ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formProgress.isValid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{language === 'fr' ? 'Soumettre' : 'Submit'}</span>
            </button>
          ) : (
            <button
              onClick={nextSection}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700"
            >
              <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Indicateur temps estimé */}
        {formProgress.estimatedTimeRemaining > 0 && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">
              {language === 'fr' ? 'Temps restant estimé:' : 'Estimated time remaining:'} {formProgress.estimatedTimeRemaining} min
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// =================== COMPOSANTS SECTIONS SPÉCIALISÉES ===================
// Ces composants seront créés dans des fichiers séparés

const IdentificationSection: React.FC<any> = ({ data, onChange, errors, language, touchOptimized }) => {
  // Section identification avec champs de base
  return <div>Section Identification - À implémenter</div>;
};

const PersonnelSection: React.FC<any> = ({ data, onChange, errors, language, permitType, touchOptimized }) => {
  // Section personnel avec gestion équipe
  return <div>Section Personnel - À implémenter</div>;
};

const TestsSection: React.FC<any> = ({ data, onChange, errors, language, permitType, province, touchOptimized, enablePhotoCapture }) => {
  // Section tests avec mesures atmosphériques
  return <div>Section Tests - À implémenter</div>;
};

const ProceduresSection: React.FC<any> = ({ data, onChange, errors, language, permitType, touchOptimized, enableVoiceInput }) => {
  // Section procédures spécialisées
  return <div>Section Procédures - À implémenter</div>;
};

const ValidationSection: React.FC<any> = ({ data, onChange, errors, language, formProgress, touchOptimized }) => {
  // Section validation et signatures
  return <div>Section Validation - À implémenter</div>;
};

const SurveillanceSection: React.FC<any> = ({ data, onChange, errors, language, touchOptimized }) => {
  // Section surveillance continue
  return <div>Section Surveillance - À implémenter</div>;
};

// =================== EXPORT DEFAULT ===================
export default PermitForm;
