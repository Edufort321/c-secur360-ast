// hooks/useFormValidation.ts
import { useState, useCallback, useEffect } from 'react';
import type { ASTFormData } from '@/types/astForm';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: any) => boolean | string;
  dependsOn?: string; // Nom du champ dont dépend cette validation
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  touched: boolean;
}

export interface FormValidationState {
  [fieldName: string]: FieldValidation;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export const useFormValidation = (
  initialValues: Record<string, any>,
  validationSchema: ValidationSchema,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    revalidateOnSubmit?: boolean;
  } = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    revalidateOnSubmit = true
  } = options;

  const [values, setFormValues] = useState(initialValues);
  const [validationState, setValidationState] = useState<FormValidationState>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Fonction pour valider un champ individuel
  const validateField = useCallback((fieldName: string, value: any, allValues: Record<string, any> = values): FieldValidation => {
    const rule = validationSchema[fieldName];
    if (!rule) {
      return { isValid: true, touched: false };
    }

    let error: string | undefined;
    let warning: string | undefined;

    // Validation required
    if (rule.required && (value === undefined || value === null || value === '')) {
      error = 'Ce champ est requis';
    }

    // Validation minLength
    if (!error && rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      error = `Minimum ${rule.minLength} caractères requis`;
    }

    // Validation maxLength
    if (!error && rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      error = `Maximum ${rule.maxLength} caractères autorisés`;
    }

    // Validation min/max pour les nombres
    if (!error && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        error = `La valeur minimum est ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        error = `La valeur maximum est ${rule.max}`;
      }
    }

    // Validation pattern
    if (!error && rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      error = 'Format invalide';
    }

    // Validation email
    if (!error && rule.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Adresse email invalide';
      }
    }

    // Validation téléphone
    if (!error && rule.phone && typeof value === 'string') {
      const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        error = 'Numéro de téléphone invalide';
      }
    }

    // Validation personnalisée
    if (!error && rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        error = typeof customResult === 'string' ? customResult : 'Valeur invalide';
      }
    }

    // Validation conditionnelle (dependsOn)
    if (!error && rule.dependsOn) {
      const dependentValue = allValues[rule.dependsOn];
      if (!dependentValue && rule.required) {
        error = `Ce champ dépend de "${rule.dependsOn}"`;
      }
    }

    // Warnings spécifiques AST
    if (!error && fieldName === 'temperature' && typeof value === 'number') {
      if (value < -20) {
        warning = 'Température très froide - Équipement spécialisé requis';
      } else if (value > 35) {
        warning = 'Température élevée - Risque de coup de chaleur';
      }
    }

    if (!error && fieldName === 'windSpeed' && typeof value === 'number') {
      if (value > 30) {
        warning = 'Vents forts - Travail en hauteur déconseillé';
      }
    }

    return {
      isValid: !error,
      error,
      warning,
      touched: validationState[fieldName]?.touched || false
    };
  }, [validationSchema, values, validationState]);

  // Fonction pour valider tous les champs
  const validateAllFields = useCallback((valuesToValidate: Record<string, any> = values): FormValidationState => {
    const newValidationState: FormValidationState = {};

    Object.keys(validationSchema).forEach(fieldName => {
      newValidationState[fieldName] = validateField(fieldName, valuesToValidate[fieldName], valuesToValidate);
    });

    return newValidationState;
  }, [validationSchema, validateField, values]);

  // Fonction pour mettre à jour une valeur
  const setValue = useCallback((fieldName: string, value: any) => {
    setFormValues(prev => {
      const newValues = { ...prev, [fieldName]: value };
      
      // Validation en temps réel si activée
      if (validateOnChange) {
        setValidationState(prevValidation => ({
          ...prevValidation,
          [fieldName]: validateField(fieldName, value, newValues)
        }));
      }

      return newValues;
    });

    setIsDirty(true);
  }, [validateOnChange, validateField]);

  // Fonction pour mettre à jour plusieurs valeurs
  const setMultipleValues = useCallback((newValues: Record<string, any>) => {
    setFormValues(prev => {
      const updatedValues = { ...prev, ...newValues };
      
      if (validateOnChange) {
        setValidationState(validateAllFields(updatedValues));
      }

      return updatedValues;
    });

    setIsDirty(true);
  }, [validateOnChange, validateAllFields]);

  // Fonction pour marquer un champ comme touché
  const setFieldTouched = useCallback((fieldName: string, touched: boolean = true) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched
      }
    }));

    // Validation onBlur si activée
    if (touched && validateOnBlur) {
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validateField(fieldName, values[fieldName])
      }));
    }
  }, [validateOnBlur, validateField, values]);

  // Fonction pour réinitialiser la validation
  const resetValidation = useCallback(() => {
    setValidationState({});
    setIsSubmitted(false);
    setIsDirty(false);
  }, []);

  // Fonction pour réinitialiser complètement le formulaire
  const resetForm = useCallback((newInitialValues?: Record<string, any>) => {
    setFormValues(newInitialValues || initialValues);
    resetValidation();
  }, [initialValues, resetValidation]);

  // Fonction pour valider le formulaire complet
  const validateForm = useCallback(() => {
    const newValidationState = validateAllFields();
    setValidationState(newValidationState);
    
    const isValid = Object.values(newValidationState).every(field => field.isValid);
    return isValid;
  }, [validateAllFields]);

  // Fonction pour soumettre le formulaire
  const handleSubmit = useCallback((onSubmit: (values: Record<string, any>) => void) => {
    return (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitted(true);

      if (revalidateOnSubmit || !Object.keys(validationState).length) {
        const isValid = validateForm();
        if (isValid) {
          onSubmit(values);
        }
      } else {
        const isValid = Object.values(validationState).every(field => field.isValid);
        if (isValid) {
          onSubmit(values);
        }
      }
    };
  }, [values, validationState, validateForm, revalidateOnSubmit]);

  // Fonction pour obtenir les erreurs d'un champ
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const field = validationState[fieldName];
    return field && (field.touched || isSubmitted) ? field.error : undefined;
  }, [validationState, isSubmitted]);

  // Fonction pour obtenir les warnings d'un champ
  const getFieldWarning = useCallback((fieldName: string): string | undefined => {
    const field = validationState[fieldName];
    return field && (field.touched || isSubmitted) ? field.warning : undefined;
  }, [validationState, isSubmitted]);

  // Fonction pour vérifier si un champ est valide
  const isFieldValid = useCallback((fieldName: string): boolean => {
    const field = validationState[fieldName];
    return !field || field.isValid;
  }, [validationState]);

  // Fonction pour vérifier si le formulaire est valide
  const isFormValid = useCallback((): boolean => {
    if (!Object.keys(validationState).length) {
      return validateForm();
    }
    return Object.values(validationState).every(field => field.isValid);
  }, [validationState, validateForm]);

  // Fonction pour obtenir des statistiques sur le formulaire
  const getFormStats = useCallback(() => {
    const totalFields = Object.keys(validationSchema).length;
    const touchedFields = Object.values(validationState).filter(field => field.touched).length;
    const validFields = Object.values(validationState).filter(field => field.isValid).length;
    const fieldsWithErrors = Object.values(validationState).filter(field => field.error).length;
    const fieldsWithWarnings = Object.values(validationState).filter(field => field.warning).length;

    return {
      totalFields,
      touchedFields,
      validFields,
      fieldsWithErrors,
      fieldsWithWarnings,
      completionRate: totalFields > 0 ? Math.round((touchedFields / totalFields) * 100) : 0,
      validationRate: totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0
    };
  }, [validationSchema, validationState]);

  // Effet pour valider initialement si nécessaire
  useEffect(() => {
    if (Object.keys(values).length && validateOnChange) {
      setValidationState(validateAllFields());
    }
  }, []); // Seulement au montage

  return {
    values,
    validationState,
    errors: validationState,
    isSubmitted,
    isDirty,
    setValue,
    setValues: setMultipleValues,
    setFieldTouched,
    resetValidation,
    resetForm,
    validateForm,
    handleSubmit,
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFormValid,
    getFormStats
  };
};

// Hook spécialisé pour la validation AST
export const useASTFormValidation = (initialData: ASTFormData) => {
  const validationSchema: ValidationSchema = {
    // Validation étape 1 - Informations projet
    'projectInfo.projectName': {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    'projectInfo.location': {
      required: true,
      minLength: 5
    },
    'projectInfo.workType': {
      required: true
    },
    'projectInfo.client': {
      required: true
    },
    'projectInfo.supervisor': {
      required: true,
      minLength: 2
    },
    'projectInfo.startDate': {
      required: true,
      custom: (value) => {
        if (!value) return false;
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          return 'La date de début ne peut pas être dans le passé';
        }
        return true;
      }
    },
    'projectInfo.teamSize': {
      required: true,
      min: 1,
      max: 50,
      custom: (value) => {
        if (!Number.isInteger(Number(value))) {
          return 'Le nombre d\'équipiers doit être un nombre entier';
        }
        return true;
      }
    },

    // Validation étape 2 - Équipements
    'equipment': {
      custom: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Au moins un équipement de sécurité doit être sélectionné';
        }
        return true;
      }
    },

    // Validation étape 3 - Dangers
    'hazards': {
      custom: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Au moins un danger doit être identifié';
        }
        return true;
      }
    },

    // Validation étape 4 - Mesures de contrôle
    'controls': {
      custom: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Des mesures de contrôle doivent être définies';
        }
        return true;
      }
    }
  };

  return useFormValidation(initialData, validationSchema, {
    validateOnChange: true,
    validateOnBlur: true,
    revalidateOnSubmit: true
  });
};

export default useFormValidation;
