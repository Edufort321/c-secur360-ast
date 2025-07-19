// =================== UTILS/REGULATIONS.TS - FONCTIONS RÉGLEMENTAIRES MOBILE-FIRST ===================
// Fonctions de validation, génération et conformité réglementaire avec optimisation mobile

import { 
  PROVINCIAL_REGULATIONS, 
  OFFICIAL_PERMITS, 
  PERMIT_CATEGORIES,
  type ProvinceCode, 
  type RegulationInfo,
  type OfficialPermit
} from '../constants/provinces';

import type { 
  PermitFormData, 
  PermitType, 
  AtmosphericData,
  FormValidationResult,
  FormValidationError,
  PermitSearchCriteria,
  PermitCreationOptions
} from '../types/forms';

import type { LegalPermit } from '../types/permits';

// =================== GÉNÉRATION CODE PERMIS CONFORME ===================
export const generateLegalPermitCode = (
  permitType: PermitType, 
  province: ProvinceCode, 
  language: 'fr' | 'en' = 'fr'
): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  // Mapping types vers codes officiels
  const typeCodeMap: Record<PermitType, string> = {
    'espace-clos': province === 'QC' ? 'EC' : 'CS',
    'travail-chaud': province === 'QC' ? 'TC' : 'HW',
    'excavation': 'EX',
    'levage-grue': province === 'QC' ? 'LG' : 'CL',
    'travail-hauteur': province === 'QC' ? 'TH' : province === 'ON' ? 'WH' : 'FP',
    'loto-electrique': province === 'QC' ? 'IE' : 'LOTO',
    'equipement-pression': 'EP',
    'radiographie-industrielle': 'RI',
    'travail-toiture': province === 'QC' ? 'TT' : 'RW',
    'demolition': 'DM'
  };

  const typeCode = typeCodeMap[permitType] || 'GP'; // GP = General Permit
  
  // Format conforme: PROVINCE-TYPE-YYYYMMDD-XXXXXX
  return `${province}-${typeCode}-${year}${month}${day}-${timestamp}`;
};

// =================== VALIDATION ATMOSPHÉRIQUE AUTOMATIQUE ===================
export const validateAtmosphericData = (
  data: AtmosphericData, 
  province: ProvinceCode,
  language: 'fr' | 'en' = 'fr'
): FormValidationResult => {
  const regulation = PROVINCIAL_REGULATIONS[province];
  const errors: FormValidationError[] = [];
  const warnings: FormValidationError[] = [];

  // Validation Oxygène selon province
  const oxygenLevel = data.oxygene.niveau;
  const oxygenMin = regulation.oxygenRange.min;
  const oxygenMax = regulation.oxygenRange.max;

  if (oxygenLevel < oxygenMin || oxygenLevel > oxygenMax) {
    errors.push({
      field: 'atmospherique.oxygene.niveau',
      message: {
        fr: `Niveau O₂ non conforme: ${oxygenLevel}%. Requis: ${oxygenMin}-${oxygenMax}% selon ${regulation.name}`,
        en: `O₂ level non-compliant: ${oxygenLevel}%. Required: ${oxygenMin}-${oxygenMax}% per ${regulation.name}`
      },
      severity: 'error',
      suggestion: {
        fr: 'Ventiler l\'espace ou reporter l\'entrée. Tests obligatoires toutes les heures.',
        en: 'Ventilate space or postpone entry. Testing required every hour.'
      }
    });
  }

  // Validation Gaz Combustibles selon limite provinciale
  const lieLevel = data.gazCombustibles.pourcentageLIE;
  const lieLimit = regulation.flammableGasLimit;

  if (lieLevel > lieLimit) {
    errors.push({
      field: 'atmospherique.gazCombustibles.pourcentageLIE',
      message: {
        fr: `Gaz combustibles dangereux: ${lieLevel}% LIE. Limite: ≤${lieLimit}% selon ${regulation.regulation}`,
        en: `Dangerous flammable gas: ${lieLevel}% LEL. Limit: ≤${lieLimit}% per ${regulation.regulation}`
      },
      severity: 'error',
      suggestion: {
        fr: 'ARRÊT IMMÉDIAT. Ventilation forcée obligatoire. Éliminer sources d\'ignition.',
        en: 'IMMEDIATE STOP. Forced ventilation required. Eliminate ignition sources.'
      }
    });
  } else if (lieLevel > lieLimit * 0.5) {
    warnings.push({
      field: 'atmospherique.gazCombustibles.pourcentageLIE',
      message: {
        fr: `Attention: ${lieLevel}% LIE détecté. Surveillance renforcée recommandée.`,
        en: `Warning: ${lieLevel}% LEL detected. Enhanced monitoring recommended.`
      },
      severity: 'warning',
      suggestion: {
        fr: 'Augmenter fréquence des tests. Vérifier ventilation.',
        en: 'Increase testing frequency. Check ventilation.'
      }
    });
  }

  // Validation Équipement d'étalonnage
  if (!data.oxygene.equipementUtilise || !data.gazCombustibles.equipementTest) {
    errors.push({
      field: 'atmospherique.equipement',
      message: {
        fr: 'Équipement de test atmosphérique non spécifié ou non étalonné',
        en: 'Atmospheric testing equipment not specified or not calibrated'
      },
      severity: 'error',
      suggestion: {
        fr: 'Utiliser équipement certifié CSA avec étalonnage récent (<6 mois)',
        en: 'Use CSA certified equipment with recent calibration (<6 months)'
      }
    });
  }

  // Validation Ventilation pour espaces clos
  if (!data.ventilation.active && (lieLevel > 0 || oxygenLevel < oxygenMin + 1)) {
    warnings.push({
      field: 'atmospherique.ventilation.active',
      message: {
        fr: 'Ventilation mécanique recommandée pour ces conditions atmosphériques',
        en: 'Mechanical ventilation recommended for these atmospheric conditions'
      },
      severity: 'warning',
      suggestion: {
        fr: 'Installer ventilation avec débit minimum 6 renouvellements/heure',
        en: 'Install ventilation with minimum 6 air changes per hour'
      }
    });
  }

  const completionPercentage = calculateAtmosphericCompletion(data);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completionPercentage,
    missingRequiredFields: getMissingAtmosphericFields(data),
    estimatedTimeToComplete: {
      fr: `${Math.ceil((100 - completionPercentage) / 10)} minutes restantes`,
      en: `${Math.ceil((100 - completionPercentage) / 10)} minutes remaining`
    }
  };
};

// =================== CALCUL COMPLETION FORMULAIRE MOBILE-OPTIMISÉ ===================
const calculateAtmosphericCompletion = (data: AtmosphericData): number => {
  let completed = 0;
  let total = 0;

  // Tests obligatoires
  total += 4;
  if (data.oxygene.niveau > 0) completed++;
  if (data.oxygene.heureTest) completed++;
  if (data.gazCombustibles.pourcentageLIE >= 0) completed++;
  if (data.gazCombustibles.typeGaz) completed++;

  // Équipements
  total += 2;
  if (data.oxygene.equipementUtilise) completed++;
  if (data.gazCombustibles.equipementTest) completed++;

  // Ventilation si requise
  if (data.ventilation.active) {
    total += 2;
    if (data.ventilation.debitAir) completed++;
    if (data.ventilation.directionFlux) completed++;
  }

  return Math.round((completed / total) * 100);
};

const getMissingAtmosphericFields = (data: AtmosphericData): string[] => {
  const missing: string[] = [];
  
  if (!data.oxygene.niveau) missing.push('oxygene.niveau');
  if (!data.oxygene.heureTest) missing.push('oxygene.heureTest');
  if (!data.oxygene.equipementUtilise) missing.push('oxygene.equipementUtilise');
  if (data.gazCombustibles.pourcentageLIE < 0) missing.push('gazCombustibles.pourcentageLIE');
  if (!data.gazCombustibles.equipementTest) missing.push('gazCombustibles.equipementTest');
  
  return missing;
};

// =================== VALIDATION PERSONNEL SELON RÉGLEMENTATIONS ===================
export const validatePersonnelRequirements = (
  formData: PermitFormData,
  permitType: PermitType,
  province: ProvinceCode,
  language: 'fr' | 'en' = 'fr'
): FormValidationResult => {
  const regulation = PROVINCIAL_REGULATIONS[province];
  const errors: FormValidationError[] = [];
  const warnings: FormValidationError[] = [];

  // Validation âge minimum selon province
  const minimumAge = regulation.minimumAge;
  
  formData.personnel.entrants.forEach((entrant, index) => {
    if (entrant.age < minimumAge) {
      errors.push({
        field: `personnel.entrants.${index}.age`,
        message: {
          fr: `${entrant.nom}: âge ${entrant.age} ans < minimum ${minimumAge} ans selon ${regulation.name}`,
          en: `${entrant.nom}: age ${entrant.age} < minimum ${minimumAge} years per ${regulation.name}`
        },
        severity: 'error',
        suggestion: {
          fr: 'Remplacer par travailleur qualifié âgé d\'au moins ' + minimumAge + ' ans',
          en: 'Replace with qualified worker aged at least ' + minimumAge + ' years'
        }
      });
    }

    // Validation formation selon type de permis
    if (!entrant.formationVerifiee) {
      const requiredTraining = getRequiredTraining(permitType, language);
      warnings.push({
        field: `personnel.entrants.${index}.formationVerifiee`,
        message: {
          fr: `Formation non vérifiée pour ${entrant.nom}. Requis: ${requiredTraining.fr}`,
          en: `Training not verified for ${entrant.nom}. Required: ${requiredTraining.en}`
        },
        severity: 'warning',
        suggestion: {
          fr: 'Vérifier certificats de formation avant début des travaux',
          en: 'Verify training certificates before work begins'
        }
      });
    }
  });

  // Validation personnel spécialisé selon type
  validateSpecializedPersonnel(formData, permitType, province, language, errors, warnings);

  const completionPercentage = calculatePersonnelCompletion(formData);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completionPercentage,
    missingRequiredFields: getMissingPersonnelFields(formData, permitType),
    estimatedTimeToComplete: {
      fr: `${Math.ceil((100 - completionPercentage) / 15)} minutes`,
      en: `${Math.ceil((100 - completionPercentage) / 15)} minutes`
    }
  };
};

// =================== FONCTIONS VALIDATION SPÉCIALISÉES ===================
const validateSpecializedPersonnel = (
  formData: PermitFormData,
  permitType: PermitType,
  province: ProvinceCode,
  language: 'fr' | 'en',
  errors: FormValidationError[],
  warnings: FormValidationError[]
) => {
  switch (permitType) {
    case 'travail-chaud':
      if (!formData.personnel.specialisedPersonnel.surveillantIncendie) {
        errors.push({
          field: 'personnel.specialisedPersonnel.surveillantIncendie',
          message: {
            fr: 'Surveillant incendie obligatoire selon NFPA 51B',
            en: 'Fire watch required per NFPA 51B'
          },
          severity: 'error',
          suggestion: {
            fr: 'Désigner surveillant avec formation prévention incendie',
            en: 'Designate attendant with fire prevention training'
          }
        });
      }
      break;

    case 'espace-clos':
      if (!formData.personnel.specialisedPersonnel.surveillantExterieur) {
        errors.push({
          field: 'personnel.specialisedPersonnel.surveillantExterieur',
          message: {
            fr: `Surveillant extérieur obligatoire selon ${PROVINCIAL_REGULATIONS[province].regulation}`,
            en: `External attendant required per ${PROVINCIAL_REGULATIONS[province].regulation}`
          },
          severity: 'error',
          suggestion: {
            fr: 'Désigner surveillant certifié espaces clos restant à l\'extérieur',
            en: 'Designate certified confined space attendant remaining outside'
          }
        });
      }
      break;

    case 'levage-grue':
      if (!formData.personnel.specialisedPersonnel.operateurGrue) {
        errors.push({
          field: 'personnel.specialisedPersonnel.operateurGrue',
          message: {
            fr: `Opérateur grue certifié obligatoire selon réglementation ${province}`,
            en: `Certified crane operator required per ${province} regulations`
          },
          severity: 'error',
          suggestion: {
            fr: province === 'BC' ? 'Opérateur BC Crane Safety requis' : 'Certification provinciale requise',
            en: province === 'BC' ? 'BC Crane Safety operator required' : 'Provincial certification required'
          }
        });
      }
      break;

    case 'loto-electrique':
      if (!formData.personnel.specialisedPersonnel.electicienQualifie) {
        errors.push({
          field: 'personnel.specialisedPersonnel.electicienQualifie',
          message: {
            fr: 'Électricien qualifié obligatoire pour tension ≥50VAC',
            en: 'Qualified electrician required for voltage ≥50VAC'
          },
          severity: 'error',
          suggestion: {
            fr: 'Désigner électricien avec licence provinciale et formation LOTO',
            en: 'Designate electrician with provincial license and LOTO training'
          }
        });
      }
      break;

    case 'radiographie-industrielle':
      if (!formData.personnel.specialisedPersonnel.inspecteurRadiation) {
        errors.push({
          field: 'personnel.specialisedPersonnel.inspecteurRadiation',
          message: {
            fr: 'Inspecteur radiation avec licence CCSN obligatoire',
            en: 'Radiation inspector with CNSC license required'
          },
          severity: 'error',
          suggestion: {
            fr: 'Personnel certifié Commission canadienne sûreté nucléaire requis',
            en: 'Canadian Nuclear Safety Commission certified personnel required'
          }
        });
      }
      break;
  }
};

// =================== FORMATION REQUISE SELON TYPE ===================
const getRequiredTraining = (permitType: PermitType, language: 'fr' | 'en') => {
  const trainingMap: Record<PermitType, { fr: string; en: string }> = {
    'espace-clos': {
      fr: 'Formation espaces clos, sauvetage, premiers soins',
      en: 'Confined space training, rescue, first aid'
    },
    'travail-chaud': {
      fr: 'Certification soudage, prévention incendie',
      en: 'Welding certification, fire prevention'
    },
    'excavation': {
      fr: 'Formation excavation sécuritaire, étançonnement',
      en: 'Safe excavation training, shoring'
    },
    'levage-grue': {
      fr: 'Certification opérateur grue, signaleur',
      en: 'Crane operator certification, signaller'
    },
    'travail-hauteur': {
      fr: 'Formation travail en hauteur, protection chutes',
      en: 'Working at heights training, fall protection'
    },
    'loto-electrique': {
      fr: 'Formation LOTO, sécurité électrique',
      en: 'LOTO training, electrical safety'
    },
    'equipement-pression': {
      fr: 'Certification soudage haute pression, CSA B51',
      en: 'High pressure welding certification, CSA B51'
    },
    'radiographie-industrielle': {
      fr: 'Licence CCSN, radioprotection',
      en: 'CNSC license, radiation protection'
    },
    'travail-toiture': {
      fr: 'Formation toiture, protection chutes spécialisée',
      en: 'Roofing training, specialized fall protection'
    },
    'demolition': {
      fr: 'Formation démolition, amiante, structures',
      en: 'Demolition training, asbestos, structures'
    }
  };

  return trainingMap[permitType];
};

// =================== CALCUL COMPLETION PERSONNEL ===================
const calculatePersonnelCompletion = (formData: PermitFormData): number => {
  let completed = 0;
  let total = 0;

  // Superviseur obligatoire
  total += 3;
  if (formData.personnel.superviseur?.nom) completed++;
  if (formData.personnel.superviseur?.certification) completed++;
  if (formData.personnel.superviseur?.formationVerifiee) completed++;

  // Entrants/Travailleurs
  if (formData.personnel.entrants.length > 0) {
    total += formData.personnel.entrants.length * 2;
    formData.personnel.entrants.forEach(entrant => {
      if (entrant.nom && entrant.age >= 18) completed++;
      if (entrant.formationVerifiee) completed++;
    });
  } else {
    total += 2; // Au moins un entrant requis
  }

  return Math.round((completed / total) * 100);
};

const getMissingPersonnelFields = (formData: PermitFormData, permitType: PermitType): string[] => {
  const missing: string[] = [];
  
  if (!formData.personnel.superviseur?.nom) missing.push('personnel.superviseur.nom');
  if (!formData.personnel.superviseur?.certification) missing.push('personnel.superviseur.certification');
  
  if (formData.personnel.entrants.length === 0) {
    missing.push('personnel.entrants');
  }

  // Personnel spécialisé selon type
  switch (permitType) {
    case 'travail-chaud':
      if (!formData.personnel.specialisedPersonnel.surveillantIncendie) {
        missing.push('personnel.specialisedPersonnel.surveillantIncendie');
      }
      break;
    case 'espace-clos':
      if (!formData.personnel.specialisedPersonnel.surveillantExterieur) {
        missing.push('personnel.specialisedPersonnel.surveillantExterieur');
      }
      break;
    case 'levage-grue':
      if (!formData.personnel.specialisedPersonnel.operateurGrue) {
        missing.push('personnel.specialisedPersonnel.operateurGrue');
      }
      break;
  }

  return missing;
};

// =================== GÉNÉRATION PERMIS CONFORMES MOBILE-OPTIMISÉ ===================
export const generateCompliantPermits = (
  language: 'fr' | 'en', 
  province: ProvinceCode,
  options?: {
    includeAll?: boolean;
    priorityOnly?: boolean;
    mobileOptimized?: boolean;
  }
): LegalPermit[] => {
  const regulation = PROVINCIAL_REGULATIONS[province];
  const permits: LegalPermit[] = [];
  
  // Permis selon disponibilité provinciale avec optimisation mobile
  const availablePermits = Object.values(OFFICIAL_PERMITS).filter(permit => 
    permit.id.startsWith(province.toLowerCase())
  );

  // Si mobile, prioriser les permis les plus utilisés
  const priorityOrder = options?.mobileOptimized ? [
    'espace-clos', 'travail-chaud', 'excavation', 'levage-grue', 'travail-hauteur'
  ] : [];

  availablePermits.forEach(permitTemplate => {
    const permitType = extractPermitType(permitTemplate.id);
    
    // Filtrer selon options
    if (options?.priorityOnly && !priorityOrder.includes(permitType)) {
      return;
    }

    const permit: LegalPermit = {
      id: `${permitTemplate.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: language === 'fr' ? 
        `${getCategoryIcon(permitTemplate.category)} ${permitTemplate.officialName}` :
        `${getCategoryIcon(permitTemplate.category)} ${translatePermitName(permitTemplate.officialName, language)}`,
      description: buildPermitDescription(permitTemplate, regulation, language),
      category: permitTemplate.category,
      authority: permitTemplate.authority,
      province: [province],
      priority: permitTemplate.priority as 'low' | 'medium' | 'high' | 'critical',
      selected: false,
      formData: {},
      code: generateLegalPermitCode(permitType, province, language),
      status: 'draft',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: permitTemplate.testingRequired || permitType === 'espace-clos',
        entryProcedure: permitType === 'espace-clos' || permitType === 'excavation',
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: ['espace-clos', 'travail-chaud', 'levage-grue'].includes(permitType),
        documentation: true
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: calculateValidityEnd(permitTemplate.validityPeriod),
        isValid: false
      },
      compliance: {
        [getComplianceKey(province)]: true
      }
    };

    permits.push(permit);
  });

  // Trier pour mobile: priorité + fréquence d'utilisation
  if (options?.mobileOptimized) {
    permits.sort((a, b) => {
      const aPriority = getPriorityValue(a.priority);
      const bPriority = getPriorityValue(b.priority);
      return bPriority - aPriority;
    });
  }

  return permits;
};

// =================== FONCTIONS UTILITAIRES MOBILE ===================
const extractPermitType = (permitId: string): PermitType => {
  if (permitId.includes('confined') || permitId.includes('espace-clos')) return 'espace-clos';
  if (permitId.includes('hot-work') || permitId.includes('travail-chaud')) return 'travail-chaud';
  if (permitId.includes('excavation')) return 'excavation';
  if (permitId.includes('crane') || permitId.includes('levage')) return 'levage-grue';
  if (permitId.includes('height') || permitId.includes('hauteur')) return 'travail-hauteur';
  if (permitId.includes('loto') || permitId.includes('electrique')) return 'loto-electrique';
  if (permitId.includes('pressure') || permitId.includes('pression')) return 'equipement-pression';
  if (permitId.includes('radiography') || permitId.includes('radiographie')) return 'radiographie-industrielle';
  if (permitId.includes('roofing') || permitId.includes('toiture')) return 'travail-toiture';
  if (permitId.includes('demolition')) return 'demolition';
  return 'espace-clos'; // Défaut
};

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'Espaces Clos': '🔒',
    'Confined Spaces': '🔒',
    'Travail à Chaud': '🔥',
    'Hot Work': '🔥',
    'Excavation': '⛏️',
    'Levage': '🏗️',
    'Lifting': '🏗️',
    'Hauteur': '🪜',
    'Working at Heights': '🪜',
    'Fall Protection': '🪜',
    'Isolation Énergétique': '⚡',
    'Energy Isolation': '⚡',
    'Équipements Pression': '🔧',
    'Pressure Equipment': '🔧',
    'Radiographie': '☢️',
    'Radiography': '☢️',
    'Toiture': '🏠',
    'Roofing': '🏠',
    'Démolition': '🔨',
    'Demolition': '🔨'
  };
  return iconMap[category] || '📋';
};

const translatePermitName = (frenchName: string, language: 'fr' | 'en'): string => {
  if (language === 'fr') return frenchName;
  
  const translations: Record<string, string> = {
    'Permis d\'entrée en espace clos': 'Confined Space Entry Permit',
    'Permis de travail à chaud': 'Hot Work Permit',
    'Permis d\'excavation': 'Excavation Permit',
    'Permis de levage et grutage': 'Lifting & Crane Operations Permit',
    'Permis de travail en hauteur': 'Working at Heights Permit',
    'Permis d\'isolation énergétique électrique': 'Electrical Energy Isolation Permit',
    'Permis de travail sur équipements sous pression': 'Pressure Equipment Work Permit',
    'Permis de radiographie industrielle': 'Industrial Radiography Permit',
    'Permis de travail sur toiture': 'Roofing Work Permit',
    'Permis de démolition': 'Demolition Permit'
  };
  
  return translations[frenchName] || frenchName;
};

const buildPermitDescription = (
  permit: OfficialPermit, 
  regulation: RegulationInfo, 
  language: 'fr' | 'en'
): string => {
  const keyRequirements = permit.requiredFields.slice(0, 3);
  
  if (language === 'fr') {
    return `${permit.regulation}. Personnel requis: ${permit.personnelRequired?.join(', ')}. 
            Exigences: ${keyRequirements.join(', ')}. 
            Validité: ${permit.validityPeriod}. 
            ${permit.testingRequired ? 'Tests obligatoires.' : 'Aucun test requis.'}`;
  } else {
    return `${permit.regulation}. Required personnel: ${permit.personnelRequired?.join(', ')}. 
            Requirements: ${keyRequirements.join(', ')}. 
            Validity: ${permit.validityPeriod}. 
            ${permit.testingRequired ? 'Testing required.' : 'No testing required.'}`;
  }
};

const calculateValidityEnd = (validityPeriod: string): string => {
  const now = new Date();
  let endDate: Date;

  if (validityPeriod.includes('24 hours') || validityPeriod.includes('24 heures')) {
    endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (validityPeriod.includes('8 hours') || validityPeriod.includes('8 heures')) {
    endDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  } else if (validityPeriod.includes('7 days') || validityPeriod.includes('7 jours')) {
    endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (validityPeriod.includes('30 days') || validityPeriod.includes('30 jours')) {
    endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Défaut 24h
  }

  return endDate.toISOString();
};

const getComplianceKey = (province: ProvinceCode): string => {
  const keyMap: Record<ProvinceCode, string> = {
    QC: 'cnesst',
    ON: 'ohsa', 
    BC: 'worksafebc',
    AB: 'ohs',
    SK: 'ohs',
    MB: 'ohs',
    NB: 'ohs',
    NS: 'ohs',
    PE: 'ohs',
    NL: 'ohs',
    YT: 'ohs',
    NT: 'ohs',
    NU: 'ohs'
  };
  return keyMap[province];
};

const getPriorityValue = (priority: string): number => {
  const values = { critical: 4, high: 3, medium: 2, low: 1 };
  return values[priority as keyof typeof values] || 1;
};

// =================== RECHERCHE OPTIMISÉE MOBILE ===================
export const searchPermitsOptimized = (
  criteria: PermitSearchCriteria,
  allPermits: LegalPermit[],
  language: 'fr' | 'en' = 'fr',
  mobileMode: boolean = true
): LegalPermit[] => {
  let filtered = [...allPermits];

  // Filtrage par type
  if (criteria.typePermis && criteria.typePermis.length > 0) {
    filtered = filtered.filter(permit => 
      criteria.typePermis!.some(type => permit.id.includes(type))
    );
  }

  // Filtrage par province
  if (criteria.province && criteria.province.length > 0) {
    filtered = filtered.filter(permit => 
      criteria.province!.some(prov => permit.province.includes(prov))
    );
  }

  // Filtrage par statut
  if (criteria.statut && criteria.statut.length > 0) {
    filtered = filtered.filter(permit => 
      criteria.statut!.includes(permit.status)
    );
  }

  // Recherche par mots-clés (optimisée mobile)
  if (criteria.motsCles && criteria.motsCles[language]) {
    const keywords = criteria.motsCles[language].toLowerCase().split(' ');
    filtered = filtered.filter(permit => 
      keywords.some(keyword => 
        permit.name.toLowerCase().includes(keyword) ||
        permit.description.toLowerCase().includes(keyword) ||
        permit.code.toLowerCase().includes(keyword)
      )
    );
  }

  // Tri pour mobile: pertinence + priorité
  if (mobileMode) {
    filtered.sort((a, b) => {
      // Priorité d'abord
      const aPriority = getPriorityValue(a.priority);
      const bPriority = getPriorityValue(b.priority);
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // Puis date de modification
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    });
  }

  return filtered;
};

// =================== EXPORT FONCTIONS PRINCIPALES ===================
export {
  validateAtmosphericData,
  validatePersonnelRequirements,
  generateCompliantPermits,
  searchPermitsOptimized,
  generateLegalPermitCode
};

// Export types pour TypeScript
export type {
  FormValidationResult,
  FormValidationError
};
