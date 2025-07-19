// components/steps/Step4Permits/utils/validators/index.ts - SYNTAX CORRECTED

// =================== EXPORTS DES VALIDATEURS EXISTANTS ===================

// Validateurs atmosphériques
export * from './atmospheric';

// Validateurs équipement
export * from './equipment';

// Validateurs personnel
export * from './personnel';

// Validateurs procédures
export * from './procedures';

// =================== TYPES POUR VALIDATION MOBILE ===================
export interface MobileValidationOptions {
  realTimeValidation: boolean;
  autoCorrection: boolean;
  hapticFeedback: boolean;
  touchOptimized: boolean;
}

export interface MobileValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
  sectionProgress: Record<string, number>;
  overallProgress: number;
  autoCorrections: Array<{
    field: string;
    originalValue: any;
    correctedValue: any;
    reason: string;
  }>;
  mobileFeedback: {
    haptic: 'light' | 'success' | 'warning' | 'error';
    visual: 'blue' | 'green' | 'yellow' | 'red';
  };
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface ValidationSummary {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completionPercentage: number;
  sections: Record<string, {
    isValid: boolean;
    progress: number;
    errors: ValidationError[];
  }>;
}

// =================== CLASSE MOBILEFORMVALIDATOR SIMPLIFIÉE ===================
export class MobileFormValidator {
  private permitType: string;
  private province: string;
  private language: 'fr' | 'en';
  private options: MobileValidationOptions;
  private validationCache: Map<string, MobileValidationResult>;

  constructor(
    permitType: string, 
    province: string, 
    language: 'fr' | 'en', 
    options: MobileValidationOptions
  ) {
    this.permitType = permitType;
    this.province = province;
    this.language = language;
    this.options = options;
    this.validationCache = new Map();
  }

  // =================== VALIDATION FORMULAIRE COMPLET ===================
  validateForm(formData: any): ValidationSummary {
    const sections = [
      'identification',
      'personnel', 
      'testsEtMesures',
      'equipements',
      'procedures',
      'surveillance',
      'validation'
    ];

    const sectionResults: Record<string, any> = {};
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    let totalProgress = 0;

    // Valider chaque section
    sections.forEach(section => {
      const sectionData = formData[section] || {};
      const result = this.validateSection(section, sectionData, formData);
      
      sectionResults[section] = result;
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      totalProgress += result.progress;
    });

    const averageProgress = totalProgress / sections.length;
    const isValid = allErrors.length === 0;

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      completionPercentage: Math.round(averageProgress),
      sections: sectionResults
    };
  }

  // =================== VALIDATION SECTION SPÉCIFIQUE - SYNTAX CORRIGÉE ===================
  validateSection(section: string, sectionData: any, fullFormData: any) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let progress = 0;

    try {
      switch (section) {
        case 'identification': {
          const result = this.validateIdentification(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'personnel': {
          const result = this.validatePersonnelSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'testsEtMesures': {
          const result = this.validateTestsSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'equipements': {
          const result = this.validateEquipmentSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'procedures': {
          const result = this.validateProceduresSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'surveillance': {
          const result = this.validateSurveillanceSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        case 'validation': {
          const result = this.validateValidationSection(sectionData);
          errors.push(...result.errors);
          progress = result.progress;
          break;
        }
        
        default:
          progress = 100; // Section inconnue considérée comme complète
      }
    } catch (error) {
      errors.push({
        field: section,
        message: `Erreur lors de la validation de la section ${section}`,
        severity: 'error',
        code: 'SECTION_VALIDATION_ERROR'
      });
      progress = 0;
    }

    return {
      isValid: errors.length === 0,
      progress: Math.min(100, Math.max(0, progress)),
      errors,
      warnings
    };
  }

  // =================== VALIDATION FIELD INDIVIDUEL ===================
  validateField(fieldPath: string, value: any, formData: any): MobileValidationResult {
    const cacheKey = `${fieldPath}_${JSON.stringify(value)}`;
    
    // Vérifier cache si pas en temps réel
    if (!this.options.realTimeValidation && this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const result: MobileValidationResult = {
      isValid: true,
      fieldErrors: {},
      sectionProgress: {},
      overallProgress: 0,
      autoCorrections: [],
      mobileFeedback: { haptic: 'light', visual: 'blue' }
    };

    try {
      // Validation basique
      const validationError = this.validateSingleField(fieldPath, value);
      
      if (validationError) {
        result.isValid = false;
        result.fieldErrors[fieldPath] = [validationError.message];
        result.mobileFeedback = {
          haptic: validationError.severity === 'error' ? 'error' : 'warning',
          visual: validationError.severity === 'error' ? 'red' : 'yellow'
        };
      } else {
        result.mobileFeedback = { haptic: 'success', visual: 'green' };
      }

      // Auto-corrections si activées
      if (this.options.autoCorrection) {
        const correction = this.suggestCorrection(fieldPath, value);
        if (correction) {
          result.autoCorrections.push(correction);
        }
      }

      // Calculer progression de section
      const section = fieldPath.split('.')[0];
      const sectionData = formData[section] || {};
      const sectionValidation = this.validateSection(section, sectionData, formData);
      result.sectionProgress[section] = sectionValidation.progress;

      // Calculer progression globale
      result.overallProgress = this.calculateOverallProgress(formData);

    } catch (error) {
      result.isValid = false;
      result.fieldErrors[fieldPath] = ['Erreur de validation'];
      result.mobileFeedback = { haptic: 'error', visual: 'red' };
    }

    // Mettre en cache
    this.validationCache.set(cacheKey, result);

    return result;
  }

  // =================== MÉTHODES DE VALIDATION SPÉCIFIQUES ===================
  private validateIdentification(data: any) {
    const errors: ValidationError[] = [];
    let progress = 0;
    const requiredFields = ['lieuTravail', 'descriptionTravaux', 'dateDebut', 'typePermis'];
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (data[field] && data[field] !== '') {
        completedFields++;
      } else {
        errors.push({
          field,
          message: this.language === 'fr' ? `Le champ ${field} est requis` : `Field ${field} is required`,
          severity: 'error',
          code: 'REQUIRED_FIELD'
        });
      }
    });

    progress = (completedFields / requiredFields.length) * 100;
    return { errors, progress };
  }

  private validatePersonnelSection(data: any) {
    const errors: ValidationError[] = [];
    let progress = 50; // Base progress

    if (!data.superviseur) {
      errors.push({
        field: 'superviseur',
        message: this.language === 'fr' ? 'Un superviseur est requis' : 'A supervisor is required',
        severity: 'error',
        code: 'SUPERVISOR_REQUIRED'
      });
    } else {
      progress += 25;
    }

    if (!data.entrants || data.entrants.length === 0) {
      errors.push({
        field: 'entrants',
        message: this.language === 'fr' ? 'Au moins un entrant est requis' : 'At least one entrant is required',
        severity: 'error',
        code: 'ENTRANT_REQUIRED'
      });
    } else {
      progress += 25;
    }

    return { errors, progress };
  }

  private validateTestsSection(data: any) {
    const errors: ValidationError[] = [];
    let progress = 0;
    
    if (data.atmospherique) {
      const atmo = data.atmospherique;
      let testsPassed = 0;
      const totalTests = 3;

      // Test oxygène
      if (atmo.oxygene && atmo.oxygene.niveau >= 19.5 && atmo.oxygene.niveau <= 23.5) {
        testsPassed++;
      } else {
        errors.push({
          field: 'testsEtMesures.atmospherique.oxygene',
          message: this.language === 'fr' ? 'Niveau d\'oxygène non conforme' : 'Oxygen level non-compliant',
          severity: 'error',
          code: 'OXYGEN_NON_COMPLIANT'
        });
      }

      // Test gaz toxiques
      if (atmo.gazToxiques && atmo.gazToxiques.conforme) {
        testsPassed++;
      }

      // Test gaz combustibles  
      if (atmo.gazCombustibles && atmo.gazCombustibles.conformeReglement) {
        testsPassed++;
      }

      progress = (testsPassed / totalTests) * 100;
    }

    return { errors, progress };
  }

  private validateEquipmentSection(data: any) {
    const errors: ValidationError[] = [];
    let progress = 0;

    const requiredEquipment = ['protection', 'detection', 'communication'];
    let availableEquipment = 0;

    requiredEquipment.forEach(type => {
      if (data[type] && data[type].length > 0) {
        availableEquipment++;
      } else {
        errors.push({
          field: `equipements.${type}`,
          message: this.language === 'fr' ? `Équipement ${type} requis` : `${type} equipment required`,
          severity: 'error',
          code: 'EQUIPMENT_REQUIRED'
        });
      }
    });

    progress = (availableEquipment / requiredEquipment.length) * 100;
    return { errors, progress };
  }

  private validateProceduresSection(data: any) {
    const errors: ValidationError[] = [];
    const progress = Object.keys(data || {}).length > 0 ? 80 : 20;
    return { errors, progress };
  }

  private validateSurveillanceSection(data: any) {
    const errors: ValidationError[] = [];
    const progress = 100; // Section optionnelle
    return { errors, progress };
  }

  private validateValidationSection(data: any) {
    const errors: ValidationError[] = [];
    let progress = 0;

    const checks = [
      'tousTestsCompletes',
      'documentationComplete', 
      'formationVerifiee',
      'equipementsVerifies',
      'conformeReglementation'
    ];

    let passedChecks = 0;

    checks.forEach(check => {
      if (data[check]) {
        passedChecks++;
      }
    });

    progress = (passedChecks / checks.length) * 100;

    if (progress < 100) {
      errors.push({
        field: 'validation',
        message: this.language === 'fr' ? 'Validation incomplète' : 'Validation incomplete',
        severity: 'warning',
        code: 'VALIDATION_INCOMPLETE'
      });
    }

    return { errors, progress };
  }

  // =================== MÉTHODES UTILITAIRES ===================
  private validateSingleField(fieldPath: string, value: any): ValidationError | null {
    // Validation champ requis
    if (this.isRequiredField(fieldPath) && (!value || value === '')) {
      return {
        field: fieldPath,
        message: this.language === 'fr' ? 'Champ requis' : 'Required field',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      };
    }

    // Validation email
    if (fieldPath.includes('email') && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          field: fieldPath,
          message: this.language === 'fr' ? 'Email invalide' : 'Invalid email',
          severity: 'error',
          code: 'INVALID_EMAIL'
        };
      }
    }

    return null;
  }

  private isRequiredField(fieldPath: string): boolean {
    const requiredFields = [
      'identification.lieuTravail',
      'identification.descriptionTravaux',
      'identification.dateDebut',
      'identification.typePermis'
    ];
    return requiredFields.includes(fieldPath);
  }

  private suggestCorrection(fieldPath: string, value: any) {
    // Auto-corrections basiques
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== value) {
        return {
          field: fieldPath,
          originalValue: value,
          correctedValue: trimmed,
          reason: this.language === 'fr' ? 'Espaces supprimés' : 'Spaces trimmed'
        };
      }
    }
    return null;
  }

  private calculateOverallProgress(formData: any): number {
    const sections = Object.keys(formData || {});
    if (sections.length === 0) return 0;

    let totalProgress = 0;
    sections.forEach(section => {
      const sectionValidation = this.validateSection(section, formData[section], formData);
      totalProgress += sectionValidation.progress;
    });

    return Math.round(totalProgress / sections.length);
  }

  // =================== MÉTHODES PUBLIQUES UTILITAIRES ===================
  public clearCache(): void {
    this.validationCache.clear();
  }

  public getValidationSummary(formData: any): ValidationSummary {
    return this.validateForm(formData);
  }

  public isFormComplete(formData: any): boolean {
    const summary = this.validateForm(formData);
    return summary.isValid && summary.completionPercentage >= 90;
  }
}

// =================== FONCTIONS UTILITAIRES PUBLIQUES ===================

export const createMobileValidator = (
  permitType: string,
  province: string, 
  language: 'fr' | 'en',
  options: Partial<MobileValidationOptions> = {}
): MobileFormValidator => {
  const defaultOptions: MobileValidationOptions = {
    realTimeValidation: true,
    autoCorrection: true,
    hapticFeedback: true,
    touchOptimized: true,
    ...options
  };

  return new MobileFormValidator(permitType, province, language, defaultOptions);
};

export const validatePermitForm = (
  formData: any,
  permitType: string,
  province: string,
  language: 'fr' | 'en' = 'fr'
): ValidationSummary => {
  const validator = createMobileValidator(permitType, province, language);
  return validator.validateForm(formData);
};

export const validateFormField = (
  fieldPath: string,
  value: any,
  formData: any,
  permitType: string,
  province: string,
  language: 'fr' | 'en' = 'fr'
): MobileValidationResult => {
  const validator = createMobileValidator(permitType, province, language);
  return validator.validateField(fieldPath, value, formData);
};

// =================== EXPORTS PAR DÉFAUT ===================
export default {
  MobileFormValidator,
  createMobileValidator,
  validatePermitForm,
  validateFormField
};
