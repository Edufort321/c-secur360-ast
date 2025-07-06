// app/hooks/useFormValidation.ts
import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  validateField: (field: string, value: any) => string | null;
  validateForm: (data: any) => boolean;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
}

export function useFormValidation(rules: ValidationRules): FormValidationResult {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Vérification required
    if (rule.required && (!value || value.toString().trim() === '')) {
      return 'Ce champ est requis';
    }

    // Si pas de valeur et pas requis, pas d'erreur
    if (!value && !rule.required) return null;

    const stringValue = value.toString();

    // Vérification minLength
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `Minimum ${rule.minLength} caractères requis`;
    }

    // Vérification maxLength
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} caractères autorisés`;
    }

    // Vérification pattern
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return 'Format invalide';
    }

    // Validation personnalisée
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError
  };
}
