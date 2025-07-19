// =================== UTILS/VALIDATORS.TS - VALIDATION TEMPS RÉEL MOBILE-FIRST ===================
// Validation progressive, auto-correction et feedback bilingue optimisé mobile

import type { 
  PermitFormData, 
  PermitType, 
  AtmosphericData,
  FormValidationResult,
  FormValidationError,
  IncidentSurveillance
} from '../types/forms';
import type { LegalPermit, Entrant, Surveillant, Superviseur } from '../types/permits';
import type { ProvinceCode } from '../constants/provinces';
import { PROVINCIAL_REGULATIONS } from '../constants/provinces';

// =================== INTERFACES VALIDATION MOBILE ===================
export interface MobileValidationConfig {
  realTimeValidation: boolean;
  showProgressIndicator: boolean;
  autoCorrection: boolean;
  hapticFeedback: boolean;
  voiceGuidance: boolean;
  touchOptimized: boolean;
  keyboardSupport: boolean;
  gestureNavigation: boolean;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'pattern' | 'range' | 'custom' | 'conditional';
  message: {
    fr: string;
    en: string;
  };
  severity: 'error' | 'warning' | 'info';
  autoCorrect?: (value: any) => any;
  mobileHint?: {
    fr: string;
    en: string;
  };
  dependsOn?: string[];
  condition?: (formData: PermitFormData) => boolean;
}

export interface RealTimeValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, FormValidationError>;
  sectionProgress: Record<string, number>;
  overallProgress: number;
  nextRequiredField?: string;
  autoCorrections: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: {
      fr: string;
      en: string;
    };
  }>;
  mobileFeedback: {
    haptic: 'success' | 'error' | 'warning' | 'light';
    visual: 'green' | 'red' | 'orange' | 'blue';
    sound?: 'beep' | 'chime' | 'alert';
  };
}

// =================== VALIDATEUR PRINCIPAL TEMPS RÉEL ===================
export class MobileFormValidator {
  private config: MobileValidationConfig;
  private language: 'fr' | 'en';
  private province: ProvinceCode;
  private permitType: PermitType;
  private rules: ValidationRule[];

  constructor(
    permitType: PermitType,
    province: ProvinceCode,
    language: 'fr' | 'en' = 'fr',
    config: Partial<MobileValidationConfig> = {}
  ) {
    this.permitType = permitType;
    this.province = province;
    this.language = language;
    this.config = {
      realTimeValidation: true,
      showProgressIndicator: true,
      autoCorrection: true,
      hapticFeedback: true,
      voiceGuidance: false,
      touchOptimized: true,
      keyboardSupport: true,
      gestureNavigation: true,
      ...config
    };
    this.rules = this.generateValidationRules();
  }

  // =================== VALIDATION TEMPS RÉEL ===================
  validateField(fieldPath: string, value: any, formData: PermitFormData): RealTimeValidationResult {
    const fieldRules = this.rules.filter(rule => 
      rule.field === fieldPath || fieldPath.startsWith(rule.field)
    );

    const fieldErrors: Record<string, FormValidationError> = {};
    const autoCorrections: any[] = [];
    let correctedValue = value;

    for (const rule of fieldRules) {
      // Vérifier condition si applicable
      if (rule.condition && !rule.condition(formData)) {
        continue;
      }

      const validationResult = this.validateFieldRule(fieldPath, correctedValue, rule, formData);
      
      if (!validationResult.isValid) {
        fieldErrors[fieldPath] = validationResult.error!;
        
        // Auto-correction si activée et possible
        if (this.config.autoCorrection && rule.autoCorrect) {
          const newValue = rule.autoCorrect(correctedValue);
          if (newValue !== correctedValue) {
            autoCorrections.push({
              field: fieldPath,
              oldValue: correctedValue,
              newValue,
              reason: rule.mobileHint || rule.message
            });
            correctedValue = newValue;
          }
        }
      }
    }

    const sectionProgress = this.calculateSectionProgress(formData);
    const overallProgress = this.calculateOverallProgress(sectionProgress);
    
    return {
      isValid: Object.keys(fieldErrors).length === 0,
      fieldErrors,
      sectionProgress,
      overallProgress,
      nextRequiredField: this.findNextRequiredField(formData),
      autoCorrections,
      mobileFeedback: this.generateMobileFeedback(fieldErrors, autoCorrections)
    };
  }

  // =================== VALIDATION COMPLÈTE FORMULAIRE ===================
  validateForm(formData: PermitFormData): FormValidationResult {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // Validation section par section pour mobile
    const sections = ['identification', 'personnel', 'testsEtMesures', 'equipements', 'procedures', 'validation'];
    
    for (const section of sections) {
      const sectionResult = this.validateSection(section, formData);
      errors.push(...sectionResult.errors);
      warnings.push(...sectionResult.warnings);
      autoCorrections.push(...sectionResult.autoCorrections);
    }

    const completionPercentage = this.calculateOverallProgress(this.calculateSectionProgress(formData));
    const missingFields = this.getMissingRequiredFields(formData);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionPercentage,
      missingRequiredFields: missingFields,
      estimatedTimeToComplete: this.calculateTimeToComplete(missingFields, completionPercentage)
    };
  }

  // =================== VALIDATION SPÉCIALISÉE PAR SECTION ===================
  private validateSection(section: string, formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    switch (section) {
      case 'identification':
        return this.validateIdentificationSection(formData);
      case 'personnel':
        return this.validatePersonnelSection(formData);
      case 'testsEtMesures':
        return this.validateTestingSection(formData);
      case 'equipements':
        return this.validateEquipmentSection(formData);
      case 'procedures':
        return this.validateProceduresSection(formData);
      case 'validation':
        return this.validateValidationSection(formData);
      default:
        return { errors, warnings, autoCorrections };
    }
  }

  // =================== VALIDATION IDENTIFICATION ===================
  private validateIdentificationSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // Lieu de travail obligatoire
    if (!formData.identification.lieuTravail[this.language]?.trim()) {
      errors.push({
        field: 'identification.lieuTravail',
        message: {
          fr: 'Lieu de travail obligatoire. Spécifiez l\'adresse exacte avec coordonnées GPS si possible.',
          en: 'Work location required. Specify exact address with GPS coordinates if possible.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Utilisez la géolocalisation pour obtenir les coordonnées précises',
          en: 'Use geolocation to get precise coordinates'
        }
      });
    }

    // Description des travaux obligatoire
    if (!formData.identification.descriptionTravaux[this.language]?.trim()) {
      errors.push({
        field: 'identification.descriptionTravaux',
        message: {
          fr: 'Description détaillée des travaux obligatoire selon réglementation provinciale.',
          en: 'Detailed work description required per provincial regulations.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Incluez le type, la durée, les équipements et les risques potentiels',
          en: 'Include type, duration, equipment and potential hazards'
        }
      });
    } else if (formData.identification.descriptionTravaux[this.language].length < 20) {
      warnings.push({
        field: 'identification.descriptionTravaux',
        message: {
          fr: 'Description trop courte. Détaillez davantage pour conformité réglementaire.',
          en: 'Description too short. Provide more details for regulatory compliance.'
        },
        severity: 'warning',
        suggestion: {
          fr: 'Minimum 20 caractères recommandés. Ajoutez équipements et procédures.',
          en: 'Minimum 20 characters recommended. Add equipment and procedures.'
        }
      });
    }

    // Validation dates
    const startDate = new Date(formData.identification.dateDebut);
    const endDate = formData.identification.dateFin ? new Date(formData.identification.dateFin) : null;
    const now = new Date();

    if (startDate < now) {
      warnings.push({
        field: 'identification.dateDebut',
        message: {
          fr: 'Date de début dans le passé. Vérifiez si c\'est correct.',
          en: 'Start date in the past. Verify if this is correct.'
        },
        severity: 'warning',
        suggestion: {
          fr: 'Utilisez la date actuelle si les travaux commencent maintenant',
          en: 'Use current date if work starts now'
        }
      });
    }

    if (endDate && endDate <= startDate) {
      errors.push({
        field: 'identification.dateFin',
        message: {
          fr: 'Date de fin doit être postérieure à la date de début.',
          en: 'End date must be after start date.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Ajustez la date de fin selon la durée estimée des travaux',
          en: 'Adjust end date based on estimated work duration'
        }
      });
    }

    // Auto-correction coordonnées GPS si possible
    if (!formData.identification.coordinatesGPS && this.config.autoCorrection) {
      // Simulation auto-correction GPS
      if (navigator.geolocation) {
        autoCorrections.push({
          field: 'identification.coordinatesGPS',
          oldValue: null,
          newValue: 'Géolocalisation disponible',
          reason: {
            fr: 'Coordonnées GPS peuvent être obtenues automatiquement',
            en: 'GPS coordinates can be obtained automatically'
          }
        });
      }
    }

    return { errors, warnings, autoCorrections };
  }

  // =================== VALIDATION PERSONNEL ===================
  private validatePersonnelSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];
    const regulation = PROVINCIAL_REGULATIONS[this.province];

    // Superviseur obligatoire
    if (!formData.personnel.superviseur) {
      errors.push({
        field: 'personnel.superviseur',
        message: {
          fr: 'Superviseur obligatoire selon réglementation. Désignez une personne compétente.',
          en: 'Supervisor required per regulations. Designate a competent person.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Le superviseur doit avoir formation et expérience appropriées',
          en: 'Supervisor must have appropriate training and experience'
        }
      });
    } else {
      // Validation superviseur
      const supervisor = formData.personnel.superviseur;
      
      if (!supervisor.nom?.trim()) {
        errors.push({
          field: 'personnel.superviseur.nom',
          message: {
            fr: 'Nom du superviseur obligatoire.',
            en: 'Supervisor name required.'
          },
          severity: 'error'
        });
      }

      if (!supervisor.certification?.trim()) {
        errors.push({
          field: 'personnel.superviseur.certification',
          message: {
            fr: 'Certification du superviseur obligatoire selon type de permis.',
            en: 'Supervisor certification required per permit type.'
          },
          severity: 'error',
          suggestion: {
            fr: this.getRequiredCertification(this.permitType, 'supervisor', 'fr'),
            en: this.getRequiredCertification(this.permitType, 'supervisor', 'en')
          }
        });
      }

      if (supervisor.experienceAnnees < this.getMinimumExperience(this.permitType)) {
        errors.push({
          field: 'personnel.superviseur.experienceAnnees',
          message: {
            fr: `Expérience insuffisante. Minimum ${this.getMinimumExperience(this.permitType)} ans requis pour ${this.permitType}.`,
            en: `Insufficient experience. Minimum ${this.getMinimumExperience(this.permitType)} years required for ${this.permitType}.`
          },
          severity: 'error',
          suggestion: {
            fr: 'Désignez un superviseur avec expérience suffisante',
            en: 'Designate supervisor with sufficient experience'
          }
        });
      }
    }

    // Validation entrants/travailleurs
    if (formData.personnel.entrants.length === 0) {
      errors.push({
        field: 'personnel.entrants',
        message: {
          fr: 'Au moins un travailleur/entrant doit être désigné.',
          en: 'At least one worker/entrant must be designated.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Ajoutez les travailleurs qui effectueront les travaux',
          en: 'Add workers who will perform the work'
        }
      });
    } else {
      formData.personnel.entrants.forEach((entrant, index) => {
        // Âge minimum selon province
        if (entrant.age < regulation.minimumAge) {
          errors.push({
            field: `personnel.entrants.${index}.age`,
            message: {
              fr: `${entrant.nom}: âge ${entrant.age} < minimum ${regulation.minimumAge} ans selon ${regulation.name}`,
              en: `${entrant.nom}: age ${entrant.age} < minimum ${regulation.minimumAge} years per ${regulation.name}`
            },
            severity: 'error',
            suggestion: {
              fr: `Remplacer par travailleur âgé d'au moins ${regulation.minimumAge} ans`,
              en: `Replace with worker aged at least ${regulation.minimumAge} years`
            }
          });
        }

        // Formation vérifiée
        if (!entrant.formationVerifiee) {
          warnings.push({
            field: `personnel.entrants.${index}.formationVerifiee`,
            message: {
              fr: `Formation non vérifiée pour ${entrant.nom}. Conformité réglementaire requise.`,
              en: `Training not verified for ${entrant.nom}. Regulatory compliance required.`
            },
            severity: 'warning',
            suggestion: {
              fr: 'Vérifiez certificats avant début des travaux',
              en: 'Verify certificates before work begins'
            }
          });
        }

        // Clearance médicale pour espaces clos
        if (this.permitType === 'espace-clos' && !entrant.medicaleClearance) {
          warnings.push({
            field: `personnel.entrants.${index}.medicaleClearance`,
            message: {
              fr: `Clearance médicale recommandée pour ${entrant.nom} en espace clos.`,
              en: `Medical clearance recommended for ${entrant.nom} in confined space.`
            },
            severity: 'warning',
            suggestion: {
              fr: 'Examen médical spécialisé espaces clos recommandé',
              en: 'Specialized confined space medical exam recommended'
            }
          });
        }
      });
    }

    // Personnel spécialisé selon type de permis
    this.validateSpecializedPersonnel(formData, errors, warnings);

    return { errors, warnings, autoCorrections };
  }

  // =================== VALIDATION TESTS ATMOSPHÉRIQUES ===================
  private validateTestingSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // Tests requis selon type de permis
    if (!this.isTestingRequired()) {
      return { errors, warnings, autoCorrections };
    }

    if (!formData.testsEtMesures.atmospherique) {
      errors.push({
        field: 'testsEtMesures.atmospherique',
        message: {
          fr: 'Tests atmosphériques obligatoires pour ce type de permis.',
          en: 'Atmospheric testing required for this permit type.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Effectuez tests O₂, gaz combustibles et toxiques avant entrée',
          en: 'Perform O₂, flammable and toxic gas tests before entry'
        }
      });
      return { errors, warnings, autoCorrections };
    }

    const atmo = formData.testsEtMesures.atmospherique;
    const regulation = PROVINCIAL_REGULATIONS[this.province];

    // Validation Oxygène
    if (atmo.oxygene.niveau <= 0) {
      errors.push({
        field: 'testsEtMesures.atmospherique.oxygene.niveau',
        message: {
          fr: 'Niveau d\'oxygène doit être mesuré et enregistré.',
          en: 'Oxygen level must be measured and recorded.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Utilisez détecteur calibré et enregistrez résultat',
          en: 'Use calibrated detector and record result'
        }
      });
    } else {
      // Validation selon limites provinciales
      const o2Level = atmo.oxygene.niveau;
      const minO2 = regulation.oxygenRange.min;
      const maxO2 = regulation.oxygenRange.max;

      if (o2Level < minO2 || o2Level > maxO2) {
        errors.push({
          field: 'testsEtMesures.atmospherique.oxygene.niveau',
          message: {
            fr: `O₂ ${o2Level}% non conforme. Requis: ${minO2}-${maxO2}% selon ${regulation.name}`,
            en: `O₂ ${o2Level}% non-compliant. Required: ${minO2}-${maxO2}% per ${regulation.name}`
          },
          severity: 'error',
          suggestion: {
            fr: 'ARRÊT TRAVAUX. Ventilation forcée requise avant entrée.',
            en: 'STOP WORK. Forced ventilation required before entry.'
          }
        });
      } else if (o2Level <= minO2 + 1 || o2Level >= maxO2 - 1) {
        warnings.push({
          field: 'testsEtMesures.atmospherique.oxygene.niveau',
          message: {
            fr: `O₂ ${o2Level}% proche des limites. Surveillance renforcée recommandée.`,
            en: `O₂ ${o2Level}% near limits. Enhanced monitoring recommended.`
          },
          severity: 'warning',
          suggestion: {
            fr: 'Tests continus recommandés. Vérifiez ventilation.',
            en: 'Continuous testing recommended. Check ventilation.'
          }
        });
      }
    }

    // Validation Gaz Combustibles
    const lieLevel = atmo.gazCombustibles.pourcentageLIE;
    const lieLimit = regulation.flammableGasLimit;

    if (lieLevel > lieLimit) {
      errors.push({
        field: 'testsEtMesures.atmospherique.gazCombustibles.pourcentageLIE',
        message: {
          fr: `🚨 DANGER: ${lieLevel}% LIE > limite ${lieLimit}%. ARRÊT IMMÉDIAT.`,
          en: `🚨 DANGER: ${lieLevel}% LEL > limit ${lieLimit}%. IMMEDIATE STOP.`
        },
        severity: 'error',
        suggestion: {
          fr: 'Ventilation forcée + élimination sources ignition obligatoires',
          en: 'Forced ventilation + ignition source elimination required'
        }
      });
    } else if (lieLevel > lieLimit * 0.5) {
      warnings.push({
        field: 'testsEtMesures.atmospherique.gazCombustibles.pourcentageLIE',
        message: {
          fr: `⚠️ Attention: ${lieLevel}% LIE détecté. Surveillance accrue.`,
          en: `⚠️ Warning: ${lieLevel}% LEL detected. Enhanced monitoring.`
        },
        severity: 'warning',
        suggestion: {
          fr: 'Augmentez fréquence tests. Vérifiez ventilation.',
          en: 'Increase testing frequency. Check ventilation.'
        }
      });
    }

    // Validation équipement de test
    if (!atmo.oxygene.equipementUtilise?.trim()) {
      warnings.push({
        field: 'testsEtMesures.atmospherique.oxygene.equipementUtilise',
        message: {
          fr: 'Équipement de test non spécifié. Traçabilité requise.',
          en: 'Testing equipment not specified. Traceability required.'
        },
        severity: 'warning',
        suggestion: {
          fr: 'Marque, modèle et date étalonnage requis',
          en: 'Brand, model and calibration date required'
        }
      });
    }

    // Auto-correction heures de test si manquantes
    if (!atmo.oxygene.heureTest && this.config.autoCorrection) {
      autoCorrections.push({
        field: 'testsEtMesures.atmospherique.oxygene.heureTest',
        oldValue: '',
        newValue: new Date().toLocaleTimeString('fr-CA', { hour12: false }),
        reason: {
          fr: 'Heure actuelle utilisée comme heure de test',
          en: 'Current time used as test time'
        }
      });
    }

    return { errors, warnings, autoCorrections };
  }

  // =================== VALIDATION ÉQUIPEMENTS ===================
  private validateEquipmentSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // EPI obligatoires selon type de permis
    const requiredEPI = this.getRequiredEPI(this.permitType);
    const availableEPI = formData.equipements.protection.map(e => e.type);

    for (const epi of requiredEPI) {
      if (!availableEPI.includes(epi)) {
        errors.push({
          field: 'equipements.protection',
          message: {
            fr: `EPI manquant: ${this.getEPIName(epi, 'fr')} obligatoire pour ${this.permitType}`,
            en: `Missing PPE: ${this.getEPIName(epi, 'en')} required for ${this.permitType}`
          },
          severity: 'error',
          suggestion: {
            fr: `Ajoutez ${this.getEPIName(epi, 'fr')} conforme CSA`,
            en: `Add CSA compliant ${this.getEPIName(epi, 'en')}`
          }
        });
      }
    }

    // Vérification état des équipements
    formData.equipements.protection.forEach((equip, index) => {
      if (equip.etatEquipement === 'a-remplacer') {
        errors.push({
          field: `equipements.protection.${index}.etatEquipement`,
          message: {
            fr: `${equip.nom[this.language]} à remplacer. État non conforme pour utilisation.`,
            en: `${equip.nom[this.language]} needs replacement. Not suitable for use.`
          },
          severity: 'error',
          suggestion: {
            fr: 'Remplacez avant début des travaux',
            en: 'Replace before work begins'
          }
        });
      }

      // Inspection récente
      if (equip.dateInspection) {
        const inspectionDate = new Date(equip.dateInspection);
        const daysSinceInspection = (Date.now() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceInspection > 30) {
          warnings.push({
            field: `equipements.protection.${index}.dateInspection`,
            message: {
              fr: `${equip.nom[this.language]}: inspection datant de ${Math.round(daysSinceInspection)} jours.`,
              en: `${equip.nom[this.language]}: inspection ${Math.round(daysSinceInspection)} days old.`
            },
            severity: 'warning',
            suggestion: {
              fr: 'Inspection mensuelle recommandée pour EPI critiques',
              en: 'Monthly inspection recommended for critical PPE'
            }
          });
        }
      }
    });

    // Équipements spécialisés selon type de permis
    this.validateSpecializedEquipment(formData, errors, warnings);

    return { errors, warnings, autoCorrections };
  }

  // =================== VALIDATION PROCÉDURES ===================
  private validateProceduresSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // Validation selon type de permis
    switch (this.permitType) {
      case 'travail-chaud':
        this.validateHotWorkProcedures(formData, errors, warnings);
        break;
      case 'espace-clos':
        this.validateConfinedSpaceProcedures(formData, errors, warnings);
        break;
      case 'excavation':
        this.validateExcavationProcedures(formData, errors, warnings);
        break;
      case 'levage-grue':
        this.validateLiftingProcedures(formData, errors, warnings);
        break;
      case 'travail-hauteur':
        this.validateHeightProcedures(formData, errors, warnings);
        break;
      case 'loto-electrique':
        this.validateLOTOProcedures(formData, errors, warnings);
        break;
    }

    return { errors, warnings, autoCorrections };
  }

  // =================== VALIDATION FINALE ===================
  private validateValidationSection(formData: PermitFormData): {
    errors: FormValidationError[];
    warnings: FormValidationError[];
    autoCorrections: any[];
  } {
    const errors: FormValidationError[] = [];
    const warnings: FormValidationError[] = [];
    const autoCorrections: any[] = [];

    // Signature responsable obligatoire
    if (!formData.validation.signatureResponsable?.trim()) {
      errors.push({
        field: 'validation.signatureResponsable',
        message: {
          fr: 'Signature du responsable obligatoire pour validation du permis.',
          en: 'Responsible person signature required for permit validation.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Nom complet + titre de la personne autorisée',
          en: 'Full name + title of authorized person'
        }
      });
    }

    // Date de validation
    if (!formData.validation.dateValidation) {
      // Auto-correction date actuelle
      if (this.config.autoCorrection) {
        autoCorrections.push({
          field: 'validation.dateValidation',
          oldValue: '',
          newValue: new Date().toISOString().slice(0, 16),
          reason: {
            fr: 'Date/heure actuelle utilisée pour validation',
            en: 'Current date/time used for validation'
          }
        });
      } else {
        errors.push({
          field: 'validation.dateValidation',
          message: {
            fr: 'Date et heure de validation requises.',
            en: 'Validation date and time required.'
          },
          severity: 'error'
        });
      }
    }

    // Vérifications finales
    if (!formData.validation.tousTestsCompletes && this.isTestingRequired()) {
      errors.push({
        field: 'validation.tousTestsCompletes',
        message: {
          fr: 'Tous les tests obligatoires doivent être complétés avant validation.',
          en: 'All required tests must be completed before validation.'
        },
        severity: 'error',
        suggestion: {
          fr: 'Complétez section Tests et Mesures',
          en: 'Complete Testing and Measurements section'
        }
      });
    }

    if (!formData.validation.equipementsVerifies) {
      warnings.push({
        field: 'validation.equipementsVerifies',
        message: {
          fr: 'Vérification des équipements recommandée avant validation.',
          en: 'Equipment verification recommended before validation.'
        },
        severity: 'warning',
        suggestion: {
          fr: 'Inspectez tous les équipements de sécurité',
          en: 'Inspect all safety equipment'
        }
      });
    }

    return { errors, warnings, autoCorrections };
  }

  // =================== FONCTIONS UTILITAIRES ===================
  private generateValidationRules(): ValidationRule[] {
    const rules: ValidationRule[] = [];
    const regulation = PROVINCIAL_REGULATIONS[this.province];

    // Règles universelles
    rules.push(
      {
        field: 'identification.lieuTravail',
        type: 'required',
        message: {
          fr: 'Lieu de travail obligatoire',
          en: 'Work location required'
        },
        severity: 'error',
        mobileHint: {
          fr: 'Tapez pour utiliser géolocalisation',
          en: 'Tap to use geolocation'
        }
      },
      {
        field: 'personnel.superviseur.nom',
        type: 'required',
        message: {
          fr: 'Nom du superviseur obligatoire',
          en: 'Supervisor name required'
        },
        severity: 'error'
      }
    );

    // Règles spécifiques selon province
    if (regulation) {
      rules.push({
        field: 'personnel.entrants.*.age',
        type: 'range',
        message: {
          fr: `Âge minimum ${regulation.minimumAge} ans selon ${regulation.name}`,
          en: `Minimum age ${regulation.minimumAge} years per ${regulation.name}`
        },
        severity: 'error',
        autoCorrect: (age: number) => Math.max(age, regulation.minimumAge)
      });
    }

    // Règles spécifiques selon type de permis
    this.addPermitSpecificRules(rules);

    return rules;
  }

  private addPermitSpecificRules(rules: ValidationRule[]) {
    const regulation = PROVINCIAL_REGULATIONS[this.province];

    switch (this.permitType) {
      case 'espace-clos':
        rules.push({
          field: 'testsEtMesures.atmospherique.oxygene.niveau',
          type: 'range',
          message: {
            fr: `O₂ doit être entre ${regulation.oxygenRange.min}-${regulation.oxygenRange.max}%`,
            en: `O₂ must be between ${regulation.oxygenRange.min}-${regulation.oxygenRange.max}%`
          },
          severity: 'error',
          condition: (formData) => this.isTestingRequired()
        });
        break;

      case 'travail-chaud':
        rules.push({
          field: 'procedures.travailChaud.zoneDegagee',
          type: 'range',
          message: {
            fr: 'Zone dégagée minimum 11 mètres selon NFPA 51B',
            en: 'Clearance zone minimum 11 meters per NFPA 51B'
          },
          severity: 'error',
          autoCorrect: (zone: number) => Math.max(zone, 11)
        });
        break;
    }
  }

  // =================== CALCULS PROGRESS ET FEEDBACK ===================
  private calculateSectionProgress(formData: PermitFormData): Record<string, number> {
    return {
      identification: this.calculateIdentificationProgress(formData),
      personnel: this.calculatePersonnelProgress(formData),
      testing: this.calculateTestingProgress(formData),
      equipment: this.calculateEquipmentProgress(formData),
      procedures: this.calculateProceduresProgress(formData),
      validation: this.calculateValidationProgress(formData)
    };
  }

  private calculateOverallProgress(sectionProgress: Record<string, number>): number {
    const values = Object.values(sectionProgress);
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private generateMobileFeedback(errors: Record<string, FormValidationError>, autoCorrections: any[]): any {
    if (Object.keys(errors).length > 0) {
      return { haptic: 'error', visual: 'red', sound: 'alert' };
    } else if (autoCorrections.length > 0) {
      return { haptic: 'warning', visual: 'orange', sound: 'chime' };
    } else {
      return { haptic: 'success', visual: 'green', sound: 'beep' };
    }
  }

  // Fonctions de calcul de progress simplifiées (à implémenter complètement)
  private calculateIdentificationProgress(formData: PermitFormData): number {
    let completed = 0;
    const total = 4;
    
    if (formData.identification.lieuTravail[this.language]) completed++;
    if (formData.identification.descriptionTravaux[this.language]) completed++;
    if (formData.identification.dateDebut) completed++;
    if (formData.identification.dureeEstimee) completed++;
    
    return Math.round((completed / total) * 100);
  }

  private calculatePersonnelProgress(formData: PermitFormData): number {
    let completed = 0;
    let total = 2;
    
    if (formData.personnel.superviseur?.nom) completed++;
    if (formData.personnel.entrants.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }

  private calculateTestingProgress(formData: PermitFormData): number {
    if (!this.isTestingRequired()) return 100;
    
    let completed = 0;
    const total = 3;
    
    if (formData.testsEtMesures.atmospherique?.oxygene.niveau > 0) completed++;
    if (formData.testsEtMesures.atmospherique?.gazCombustibles.pourcentageLIE >= 0) completed++;
    if (formData.testsEtMesures.atmospherique?.oxygene.equipementUtilise) completed++;
    
    return Math.round((completed / total) * 100);
  }

  private calculateEquipmentProgress(formData: PermitFormData): number {
    const requiredCount = this.getRequiredEPI(this.permitType).length;
    const availableCount = formData.equipements.protection.length;
    
    return Math.min(Math.round((availableCount / requiredCount) * 100), 100);
  }

  private calculateProceduresProgress(formData: PermitFormData): number {
    // Simplifié - à implémenter selon type de permis
    return 80; // Placeholder
  }

  private calculateValidationProgress(formData: PermitFormData): number {
    let completed = 0;
    const total = 3;
    
    if (formData.validation.signatureResponsable) completed++;
    if (formData.validation.dateValidation) completed++;
    if (formData.validation.conformeReglementation) completed++;
    
    return Math.round((completed / total) * 100);
  }

  // Fonctions utilitaires simplifiées
  private isTestingRequired(): boolean {
    return ['espace-clos', 'equipement-pression', 'radiographie-industrielle'].includes(this.permitType);
  }

  private getRequiredEPI(permitType: PermitType): string[] {
    const epiMap: Record<PermitType, string[]> = {
      'espace-clos': ['casque', 'chaussures', 'gants', 'harnais', 'masque'],
      'travail-chaud': ['casque', 'chaussures', 'gants', 'lunettes'],
      'excavation': ['casque', 'chaussures', 'gants', 'veste'],
      'levage-grue': ['casque', 'chaussures', 'veste'],
      'travail-hauteur': ['casque', 'chaussures', 'harnais'],
      'loto-electrique': ['casque', 'chaussures', 'gants'],
      'equipement-pression': ['casque', 'chaussures', 'gants', 'lunettes'],
      'radiographie-industrielle': ['casque', 'chaussures', 'gants'],
      'travail-toiture': ['casque', 'chaussures', 'harnais'],
      'demolition': ['casque', 'chaussures', 'gants', 'masque', 'lunettes']
    };
    return epiMap[permitType] || ['casque', 'chaussures', 'gants'];
  }

  private getEPIName(type: string, language: 'fr' | 'en'): string {
    const names = {
      fr: {
        'casque': 'Casque de sécurité',
        'chaussures': 'Chaussures de sécurité',
        'gants': 'Gants de protection',
        'veste': 'Veste haute visibilité',
        'lunettes': 'Lunettes de protection',
        'masque': 'Protection respiratoire',
        'harnais': 'Harnais de sécurité'
      },
      en: {
        'casque': 'Safety helmet',
        'chaussures': 'Safety shoes',
        'gants': 'Protective gloves',
        'veste': 'High-visibility vest',
        'lunettes': 'Safety glasses',
        'masque': 'Respiratory protection',
        'harnais': 'Safety harness'
      }
    };
    return names[language][type as keyof typeof names.fr] || type;
  }

  private getRequiredCertification(permitType: PermitType, role: string, language: 'fr' | 'en'): string {
    // Simplifié - à implémenter complètement
    return language === 'fr' ? 'Certification spécialisée requise' : 'Specialized certification required';
  }

  private getMinimumExperience(permitType: PermitType): number {
    const experienceMap: Record<PermitType, number> = {
      'espace-clos': 2,
      'travail-chaud': 1,
      'excavation': 2,
      'levage-grue': 3,
      'travail-hauteur': 1,
      'loto-electrique': 2,
      'equipement-pression': 3,
      'radiographie-industrielle': 5,
      'travail-toiture': 1,
      'demolition': 3
    };
    return experienceMap[permitType] || 1;
  }

  // Fonctions de validation spécialisées (simplifiées)
  private validateSpecializedPersonnel(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter selon type de permis
  }

  private validateSpecializedEquipment(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter selon type de permis
  }

  private validateHotWorkProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateConfinedSpaceProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateExcavationProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateLiftingProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateHeightProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateLOTOProcedures(formData: PermitFormData, errors: FormValidationError[], warnings: FormValidationError[]) {
    // À implémenter
  }

  private validateFieldRule(fieldPath: string, value: any, rule: ValidationRule, formData: PermitFormData): {
    isValid: boolean;
    error?: FormValidationError;
  } {
    // Implémentation simplifiée
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return { isValid: false, error: { field: fieldPath, message: rule.message, severity: rule.severity } };
        }
        break;
      case 'range':
        // À implémenter selon le contexte
        break;
    }
    return { isValid: true };
  }

  private findNextRequiredField(formData: PermitFormData): string | undefined {
    // Logique pour trouver le prochain champ requis
    return undefined;
  }

  private getMissingRequiredFields(formData: PermitFormData): string[] {
    // Logique pour identifier champs manquants
    return [];
  }

  private calculateTimeToComplete(missingFields: string[], completionPercentage: number): { fr: string; en: string } {
    const remainingMinutes = Math.ceil((100 - completionPercentage) / 10);
    return {
      fr: `${remainingMinutes} minutes restantes`,
      en: `${remainingMinutes} minutes remaining`
    };
  }
}

// =================== EXPORT CLASSE ET FONCTIONS ===================
export { MobileFormValidator };
export type { MobileValidationConfig, ValidationRule, RealTimeValidationResult };
