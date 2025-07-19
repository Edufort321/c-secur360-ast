// =================== UTILS/GENERATORS.TS - GÉNÉRATION & EXPORT MOBILE-FIRST ===================
// Fonctions de génération PDF, templates, export avec optimisation mobile et bilingue

import type { 
  LegalPermit, 
  PermitFormData, 
  PermitType,
  FormValidationResult 
} from '../types';
import type { ProvinceCode } from '../constants/provinces';
import { 
  PROVINCIAL_REGULATIONS, 
  OFFICIAL_PERMITS, 
  PERMIT_CATEGORIES 
} from '../constants/provinces';

// =================== INTERFACES GÉNÉRATION MOBILE ===================
export interface PDFGenerationOptions {
  language: 'fr' | 'en';
  includeQRCode: boolean;
  mobileOptimized: boolean;
  includePhotos: boolean;
  includeSignatures: boolean;
  watermark?: string;
  headerLogo?: string;
  footerText?: {
    fr: string;
    en: string;
  };
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json' | 'csv';
  includeAttachments: boolean;
  compressImages: boolean;
  mobileShare: boolean; // Optimiser pour partage mobile
  emailIntegration: boolean;
  cloudUpload?: {
    service: 'google_drive' | 'dropbox' | 'onedrive';
    folder?: string;
  };
}

export interface TemplateOptions {
  permitType: PermitType;
  province: ProvinceCode;
  language: 'fr' | 'en';
  customFields?: CustomField[];
  branding?: {
    logo: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      header: string;
      body: string;
    };
  };
}

export interface CustomField {
  id: string;
  label: {
    fr: string;
    en: string;
  };
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message: {
      fr: string;
      en: string;
    };
  };
}

// =================== GÉNÉRATION PDF MOBILE-OPTIMISÉ ===================
export const generatePermitPDF = async (
  permit: LegalPermit,
  formData: PermitFormData,
  options: PDFGenerationOptions
): Promise<{
  success: boolean;
  pdfBlob?: Blob;
  downloadUrl?: string;
  mobileShareUrl?: string;
  error?: string;
}> => {
  try {
    const regulation = PROVINCIAL_REGULATIONS[permit.province[0] as ProvinceCode];
    const permitTemplate = Object.values(OFFICIAL_PERMITS).find(p => 
      p.id.startsWith(permit.province[0].toLowerCase()) && 
      permit.id.includes(extractPermitTypeFromId(p.id))
    );

    // Configuration PDF mobile-optimisé
    const pdfConfig = {
      format: options.mobileOptimized ? 'A4' : 'Letter',
      orientation: 'portrait',
      margins: {
        top: options.mobileOptimized ? 15 : 20,
        bottom: options.mobileOptimized ? 15 : 20,
        left: options.mobileOptimized ? 10 : 15,
        right: options.mobileOptimized ? 10 : 15
      },
      fontSize: {
        title: options.mobileOptimized ? 16 : 18,
        header: options.mobileOptimized ? 12 : 14,
        body: options.mobileOptimized ? 10 : 11,
        small: options.mobileOptimized ? 8 : 9
      }
    };

    // Génération contenu PDF bilingue
    const pdfContent = buildPDFContent(permit, formData, regulation, permitTemplate, options, pdfConfig);
    
    // Simulation génération PDF (remplacer par vraie lib PDF)
    const pdfBlob = await generatePDFBlob(pdfContent, pdfConfig);
    
    // URL pour partage mobile
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const mobileShareUrl = generateMobileShareUrl(permit, downloadUrl, options);

    return {
      success: true,
      pdfBlob,
      downloadUrl,
      mobileShareUrl
    };
  } catch (error) {
    return {
      success: false,
      error: `Erreur génération PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
};

// =================== CONSTRUCTION CONTENU PDF BILINGUE ===================
const buildPDFContent = (
  permit: LegalPermit,
  formData: PermitFormData,
  regulation: any,
  permitTemplate: any,
  options: PDFGenerationOptions,
  config: any
) => {
  const isEnglish = options.language === 'en';
  
  return {
    // En-tête avec logos et codes QR mobile-friendly
    header: {
      title: isEnglish ? 'Official Work Permit' : 'Permis de Travail Officiel',
      subtitle: permit.name,
      permitCode: permit.code,
      authority: regulation?.authority,
      qrCode: options.includeQRCode ? generateQRCodeData(permit) : null,
      logo: options.headerLogo,
      mobileOptimized: options.mobileOptimized
    },

    // Informations réglementaires
    regulatory: {
      title: isEnglish ? 'Regulatory Information' : 'Informations Réglementaires',
      regulation: regulation?.regulation,
      provinceName: regulation?.name,
      formNumber: permitTemplate?.formNumber,
      lastUpdated: permitTemplate?.lastUpdated,
      penalties: regulation?.penalties,
      emergencyNumber: regulation?.emergencyNumber
    },

    // Section identification
    identification: buildIdentificationSection(formData, options.language),
    
    // Section personnel
    personnel: buildPersonnelSection(formData, options.language),
    
    // Section tests (si applicable)
    testing: formData.testsEtMesures ? buildTestingSection(formData, options.language) : null,
    
    // Section équipements
    equipment: buildEquipmentSection(formData, options.language),
    
    // Section procédures
    procedures: buildProceduresSection(formData, options.language),
    
    // Validation et signatures
    validation: buildValidationSection(formData, permit, options.language),
    
    // Pied de page mobile-friendly
    footer: {
      generatedDate: new Date().toLocaleDateString(isEnglish ? 'en-CA' : 'fr-CA'),
      generatedTime: new Date().toLocaleTimeString(isEnglish ? 'en-CA' : 'fr-CA'),
      version: '2025.1',
      customText: options.footerText?.[options.language],
      companyInfo: options.companyInfo,
      watermark: options.watermark
    }
  };
};

// =================== SECTIONS PDF SPÉCIALISÉES ===================
const buildIdentificationSection = (formData: PermitFormData, language: 'fr' | 'en') => ({
  title: language === 'en' ? 'Project Identification' : 'Identification du Projet',
  fields: [
    {
      label: language === 'en' ? 'Work Location' : 'Lieu de Travail',
      value: formData.identification.lieuTravail[language],
      icon: '📍'
    },
    {
      label: language === 'en' ? 'Work Description' : 'Description des Travaux',
      value: formData.identification.descriptionTravaux[language],
      icon: '📋'
    },
    {
      label: language === 'en' ? 'Start Date' : 'Date de Début',
      value: new Date(formData.identification.dateDebut).toLocaleDateString(language === 'en' ? 'en-CA' : 'fr-CA'),
      icon: '📅'
    },
    {
      label: language === 'en' ? 'Estimated Duration' : 'Durée Estimée',
      value: formData.identification.dureeEstimee,
      icon: '⏱️'
    },
    {
      label: language === 'en' ? 'GPS Coordinates' : 'Coordonnées GPS',
      value: formData.identification.coordinatesGPS ? 
        `${formData.identification.coordinatesGPS.latitude}, ${formData.identification.coordinatesGPS.longitude}` : 
        language === 'en' ? 'Not specified' : 'Non spécifiées',
      icon: '🛰️'
    }
  ]
});

const buildPersonnelSection = (formData: PermitFormData, language: 'fr' | 'en') => ({
  title: language === 'en' ? 'Authorized Personnel' : 'Personnel Autorisé',
  supervisor: formData.personnel.superviseur ? {
    title: language === 'en' ? 'Supervisor' : 'Superviseur',
    name: formData.personnel.superviseur.nom,
    certification: formData.personnel.superviseur.certification,
    permit: formData.personnel.superviseur.numeroPermis,
    experience: `${formData.personnel.superviseur.experienceAnnees} ${language === 'en' ? 'years' : 'ans'}`,
    emergency: formData.personnel.superviseur.contactUrgence,
    icon: '👨‍💼'
  } : null,
  workers: formData.personnel.entrants.map(entrant => ({
    name: entrant.nom,
    age: entrant.age,
    certification: entrant.certification,
    training: entrant.formationVerifiee ? 
      (language === 'en' ? 'Verified' : 'Vérifiée') : 
      (language === 'en' ? 'Pending' : 'En attente'),
    medical: entrant.medicaleClearance ? 
      (language === 'en' ? 'Cleared' : 'Conforme') : 
      (language === 'en' ? 'Required' : 'Requis'),
    emergency: entrant.contactUrgence || '',
    icon: '👷'
  })),
  specialized: buildSpecializedPersonnel(formData, language)
});

const buildSpecializedPersonnel = (formData: PermitFormData, language: 'fr' | 'en') => {
  const specialized = [];
  
  if (formData.personnel.specialisedPersonnel.surveillantIncendie) {
    specialized.push({
      role: language === 'en' ? 'Fire Watch' : 'Surveillant Incendie',
      name: formData.personnel.specialisedPersonnel.surveillantIncendie.nom,
      certification: formData.personnel.specialisedPersonnel.surveillantIncendie.certification,
      position: formData.personnel.specialisedPersonnel.surveillantIncendie.posteDeSurveillance,
      icon: '🔥'
    });
  }
  
  if (formData.personnel.specialisedPersonnel.operateurGrue) {
    specialized.push({
      role: language === 'en' ? 'Crane Operator' : 'Opérateur Grue',
      name: formData.personnel.specialisedPersonnel.operateurGrue.nom,
      certification: formData.personnel.specialisedPersonnel.operateurGrue.certificationProvinciale,
      capacity: `${formData.personnel.specialisedPersonnel.operateurGrue.capaciteMaximale}T`,
      icon: '🏗️'
    });
  }
  
  // Ajouter autres personnel spécialisé...
  
  return specialized;
};

const buildTestingSection = (formData: PermitFormData, language: 'fr' | 'en') => {
  if (!formData.testsEtMesures.atmospherique) return null;
  
  const atmo = formData.testsEtMesures.atmospherique;
  
  return {
    title: language === 'en' ? 'Atmospheric Testing' : 'Tests Atmosphériques',
    oxygen: {
      label: language === 'en' ? 'Oxygen Level' : 'Niveau Oxygène',
      value: `${atmo.oxygene.niveau}%`,
      status: atmo.oxygene.conformeCNESST ? 
        (language === 'en' ? 'COMPLIANT' : 'CONFORME') : 
        (language === 'en' ? 'NON-COMPLIANT' : 'NON CONFORME'),
      time: atmo.oxygene.heureTest,
      equipment: atmo.oxygene.equipementUtilise,
      icon: atmo.oxygene.conformeCNESST ? '✅' : '❌'
    },
    flammable: {
      label: language === 'en' ? 'Flammable Gas' : 'Gaz Combustibles',
      value: `${atmo.gazCombustibles.pourcentageLIE}% LEL`,
      status: atmo.gazCombustibles.conformeReglement ? 
        (language === 'en' ? 'SAFE' : 'SÉCURITAIRE') : 
        (language === 'en' ? 'DANGEROUS' : 'DANGEREUX'),
      type: atmo.gazCombustibles.typeGaz,
      equipment: atmo.gazCombustibles.equipementTest,
      icon: atmo.gazCombustibles.conformeReglement ? '✅' : '🚨'
    },
    ventilation: atmo.ventilation.active ? {
      label: language === 'en' ? 'Ventilation' : 'Ventilation',
      flow: atmo.ventilation.debitAir,
      direction: atmo.ventilation.directionFlux,
      type: atmo.ventilation.typeVentilation,
      icon: '💨'
    } : null
  };
};

const buildEquipmentSection = (formData: PermitFormData, language: 'fr' | 'en') => ({
  title: language === 'en' ? 'Safety Equipment' : 'Équipements de Sécurité',
  protection: formData.equipements.protection.map(equip => ({
    name: equip.nom[language],
    type: equip.type,
    standard: equip.normeCSA,
    required: equip.obligatoire,
    status: equip.etatEquipement,
    inspection: equip.dateInspection,
    inspector: equip.responsableVerification,
    icon: getEquipmentIcon(equip.type)
  })),
  detection: formData.equipements.detection.map(equip => ({
    name: equip.nom[language],
    type: equip.type,
    calibration: equip.dernierEtalonnage,
    certificate: equip.certificatEtalonnage,
    operator: equip.operateurAutorise,
    range: equip.gammeDetection,
    icon: getDetectionIcon(equip.type)
  })),
  rescue: formData.equipements.sauvetage.map(equip => ({
    name: equip.nom[language],
    type: equip.type,
    capacity: equip.capaciteCharge,
    inspection: equip.derniereInspection,
    certified: equip.etatCertification,
    responsible: equip.responsableEntretien,
    icon: getRescueIcon(equip.type)
  }))
});

const buildProceduresSection = (formData: PermitFormData, language: 'fr' | 'en') => {
  const procedures: any = {
    title: language === 'en' ? 'Safety Procedures' : 'Procédures de Sécurité'
  };

  // Procédures spécifiques selon type de permis
  if (formData.procedures.travailChaud) {
    procedures.hotWork = {
      title: language === 'en' ? 'Hot Work Procedures (NFPA 51B)' : 'Procédures Travail à Chaud (NFPA 51B)',
      clearanceZone: `${formData.procedures.travailChaud.zoneDegagee}m`,
      fireWatch: formData.procedures.travailChaud.surveillanceIncendie,
      postWorkWatch: `${formData.procedures.travailChaud.surveysPostTravaux} min`,
      extinguisher: formData.procedures.travailChaud.equipementExtinction,
      weather: formData.procedures.travailChaud.conditionsMeteo,
      icon: '🔥'
    };
  }

  if (formData.procedures.excavation) {
    procedures.excavation = {
      title: language === 'en' ? 'Excavation Procedures' : 'Procédures Excavation',
      utilityLocation: formData.procedures.excavation.localisationServices,
      notice: formData.procedures.excavation.noticeRequired,
      protection: formData.procedures.excavation.typeProtection,
      depth: `${formData.procedures.excavation.profondeur}m`,
      access: formData.procedures.excavation.accesSortie,
      waterTable: formData.procedures.excavation.nappe,
      icon: '⛏️'
    };
  }

  if (formData.procedures.espaceClos) {
    procedures.confinedSpace = {
      title: language === 'en' ? 'Confined Space Procedures' : 'Procédures Espace Clos',
      continuousTesting: formData.procedures.espaceClos.analyseContinue,
      attendant: formData.procedures.espaceClos.surveillantDesigne,
      rescue: formData.procedures.espaceClos.procedureSecours,
      communication: formData.procedures.espaceClos.communicationEtablie,
      ventilation: formData.procedures.espaceClos.equipementVentilation,
      control: formData.procedures.espaceClos.controleAtmosphere,
      icon: '🔒'
    };
  }

  return procedures;
};

const buildValidationSection = (formData: PermitFormData, permit: LegalPermit, language: 'fr' | 'en') => ({
  title: language === 'en' ? 'Validation & Signatures' : 'Validation et Signatures',
  completion: {
    label: language === 'en' ? 'Form Completion' : 'Completion Formulaire',
    testing: formData.validation.tousTestsCompletes,
    documentation: formData.validation.documentationComplete,
    training: formData.validation.formationVerifiee,
    equipment: formData.validation.equipementsVerifies,
    compliance: formData.validation.conformeReglementation,
    icon: '✅'
  },
  signatures: {
    responsible: {
      name: formData.validation.signatureResponsable,
      date: formData.validation.dateValidation,
      role: language === 'en' ? 'Responsible Person' : 'Personne Responsable'
    },
    supervisor: formData.personnel.superviseur ? {
      name: formData.personnel.superviseur.nom,
      signature: formData.personnel.superviseur.signature,
      date: formData.personnel.superviseur.dateSignature,
      role: language === 'en' ? 'Supervisor' : 'Superviseur'
    } : null
  },
  validity: {
    start: permit.validity.startDate,
    end: permit.validity.endDate,
    valid: permit.validity.isValid,
    approver: permit.validity.approvedBy
  },
  restrictions: formData.validation.restrictions[language],
  comments: formData.validation.commentairesValidation[language]
});

// =================== GÉNÉRATION TEMPLATES MOBILE ===================
export const generatePermitTemplate = (
  options: TemplateOptions
): {
  success: boolean;
  template?: any;
  mobileConfig?: any;
  error?: string;
} => {
  try {
    const regulation = PROVINCIAL_REGULATIONS[options.province];
    const permitTemplate = Object.values(OFFICIAL_PERMITS).find(p => 
      p.id.startsWith(options.province.toLowerCase()) && 
      p.id.includes(options.permitType)
    );

    if (!permitTemplate) {
      return {
        success: false,
        error: `Template not found for ${options.permitType} in ${options.province}`
      };
    }

    const template = {
      // Métadonnées template
      metadata: {
        id: `template-${options.permitType}-${options.province}-${Date.now()}`,
        name: permitTemplate.officialName,
        type: options.permitType,
        province: options.province,
        language: options.language,
        regulation: regulation.regulation,
        version: '2025.1',
        created: new Date().toISOString()
      },

      // Structure formulaire mobile-optimisée
      structure: generateMobileFormStructure(options, permitTemplate, regulation),
      
      // Validations automatiques
      validations: generateValidationRules(options, regulation),
      
      // Styles et branding
      styling: generateMobileStyling(options),
      
      // Configuration mobile
      mobileConfig: {
        scrollBehavior: 'smooth',
        touchOptimized: true,
        keyboardSupport: true,
        gestureNavigation: true,
        progressIndicator: true,
        autoSave: true,
        offlineCapable: true
      }
    };

    return {
      success: true,
      template,
      mobileConfig: template.mobileConfig
    };
  } catch (error) {
    return {
      success: false,
      error: `Template generation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// =================== STRUCTURE FORMULAIRE MOBILE ===================
const generateMobileFormStructure = (options: TemplateOptions, permitTemplate: any, regulation: any) => {
  const isEnglish = options.language === 'en';
  
  return {
    sections: [
      {
        id: 'identification',
        title: isEnglish ? 'Project Identification' : 'Identification Projet',
        icon: '📋',
        order: 1,
        mobileOptimized: true,
        fields: generateIdentificationFields(options),
        validation: 'required'
      },
      {
        id: 'personnel',
        title: isEnglish ? 'Personnel' : 'Personnel',
        icon: '👥',
        order: 2,
        mobileOptimized: true,
        fields: generatePersonnelFields(options, regulation),
        validation: 'required'
      },
      {
        id: 'testing',
        title: isEnglish ? 'Testing & Measurements' : 'Tests et Mesures',
        icon: '🧪',
        order: 3,
        mobileOptimized: true,
        fields: generateTestingFields(options, permitTemplate),
        validation: permitTemplate.testingRequired ? 'required' : 'optional',
        conditional: permitTemplate.testingRequired
      },
      {
        id: 'equipment',
        title: isEnglish ? 'Equipment' : 'Équipements',
        icon: '🛡️',
        order: 4,
        mobileOptimized: true,
        fields: generateEquipmentFields(options),
        validation: 'required'
      },
      {
        id: 'procedures',
        title: isEnglish ? 'Procedures' : 'Procédures',
        icon: '📝',
        order: 5,
        mobileOptimized: true,
        fields: generateProcedureFields(options),
        validation: 'required'
      },
      {
        id: 'validation',
        title: isEnglish ? 'Validation' : 'Validation',
        icon: '✅',
        order: 6,
        mobileOptimized: true,
        fields: generateValidationFields(options),
        validation: 'required'
      }
    ],
    navigation: {
      type: 'vertical_scroll',
      showProgress: true,
      stickyHeader: true,
      jumpToSection: true,
      autoFocus: true
    }
  };
};

// =================== EXPORT FONCTIONS PRINCIPALES ===================
export const exportPermitData = async (
  permit: LegalPermit,
  formData: PermitFormData,
  options: ExportOptions
): Promise<{
  success: boolean;
  exportUrl?: string;
  fileName?: string;
  mobileShareData?: any;
  error?: string;
}> => {
  try {
    let exportData: any;
    let fileName: string;
    let mimeType: string;

    switch (options.format) {
      case 'pdf':
        const pdfResult = await generatePermitPDF(permit, formData, {
          language: 'fr', // Default
          includeQRCode: true,
          mobileOptimized: options.mobileShare,
          includePhotos: options.includeAttachments,
          includeSignatures: true
        });
        if (!pdfResult.success) throw new Error(pdfResult.error);
        exportData = pdfResult.pdfBlob;
        fileName = `${permit.code}.pdf`;
        mimeType = 'application/pdf';
        break;

      case 'json':
        exportData = new Blob([JSON.stringify({ permit, formData }, null, 2)], 
          { type: 'application/json' });
        fileName = `${permit.code}.json`;
        mimeType = 'application/json';
        break;

      case 'excel':
        exportData = await generateExcelExport(permit, formData);
        fileName = `${permit.code}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;

      case 'csv':
        exportData = generateCSVExport(permit, formData);
        fileName = `${permit.code}.csv`;
        mimeType = 'text/csv';
        break;

      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    const exportUrl = URL.createObjectURL(exportData);
    
    // Génération données partage mobile
    const mobileShareData = options.mobileShare ? {
      title: permit.name,
      text: `Permis de travail: ${permit.code}`,
      url: exportUrl,
      files: [new File([exportData], fileName, { type: mimeType })]
    } : undefined;

    return {
      success: true,
      exportUrl,
      fileName,
      mobileShareData
    };
  } catch (error) {
    return {
      success: false,
      error: `Export error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// =================== FONCTIONS UTILITAIRES ===================
const extractPermitTypeFromId = (id: string): string => {
  if (id.includes('confined') || id.includes('espace-clos')) return 'espace-clos';
  if (id.includes('hot-work') || id.includes('travail-chaud')) return 'travail-chaud';
  if (id.includes('excavation')) return 'excavation';
  if (id.includes('crane') || id.includes('levage')) return 'levage-grue';
  if (id.includes('height') || id.includes('hauteur')) return 'travail-hauteur';
  if (id.includes('loto') || id.includes('electrique')) return 'loto-electrique';
  if (id.includes('pressure') || id.includes('pression')) return 'equipement-pression';
  if (id.includes('radiography') || id.includes('radiographie')) return 'radiographie-industrielle';
  if (id.includes('roofing') || id.includes('toiture')) return 'travail-toiture';
  if (id.includes('demolition')) return 'demolition';
  return 'espace-clos';
};

const generateQRCodeData = (permit: LegalPermit): string => {
  return JSON.stringify({
    code: permit.code,
    type: permit.category,
    province: permit.province[0],
    status: permit.status,
    created: permit.dateCreated,
    authority: permit.authority
  });
};

const generateMobileShareUrl = (permit: LegalPermit, downloadUrl: string, options: PDFGenerationOptions): string => {
  const params = new URLSearchParams({
    permit_code: permit.code,
    download_url: downloadUrl,
    language: options.language,
    mobile: 'true'
  });
  
  return `${window.location.origin}/permits/share?${params.toString()}`;
};

const getEquipmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'casque': '⛑️',
    'chaussures': '👟',
    'gants': '🧤',
    'veste': '🦺',
    'lunettes': '🥽',
    'masque': '😷',
    'harnais': '🔗'
  };
  return icons[type] || '🛡️';
};

const getDetectionIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'detecteur-gaz': '📡',
    'thermometre': '🌡️',
    'luxmetre': '💡',
    'dosimetre': '☢️',
    'multimetre': '⚡'
  };
  return icons[type] || '📊';
};

const getRescueIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'treuil': '🔗',
    'civiere': '🏥',
    'ara': '🤿',
    'echelle': '🪜',
    'corde': '🪢',
    'harnais-sauvetage': '🎯'
  };
  return icons[type] || '🚑';
};

// Fonctions de génération simulées (à implémenter avec vraies librairies)
const generatePDFBlob = async (content: any, config: any): Promise<Blob> => {
  // Simulation - remplacer par jsPDF ou équivalent
  const mockPDF = `PDF Content: ${JSON.stringify(content)}`;
  return new Blob([mockPDF], { type: 'application/pdf' });
};

const generateExcelExport = async (permit: LegalPermit, formData: PermitFormData): Promise<Blob> => {
  // Simulation - remplacer par SheetJS
  const mockExcel = `Excel Content: ${permit.code}`;
  return new Blob([mockExcel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const generateCSVExport = (permit: LegalPermit, formData: PermitFormData): Blob => {
  const csvContent = [
    'Code,Name,Category,Province,Status,Created',
    `${permit.code},${permit.name},${permit.category},${permit.province[0]},${permit.status},${permit.dateCreated}`
  ].join('\n');
  
  return new Blob([csvContent], { type: 'text/csv' });
};

// Fonctions de génération de champs (simplifiées)
const generateIdentificationFields = (options: TemplateOptions) => [
  { id: 'lieuTravail', type: 'textarea', required: true },
  { id: 'descriptionTravaux', type: 'textarea', required: true },
  { id: 'dateDebut', type: 'datetime-local', required: true },
  { id: 'dureeEstimee', type: 'select', required: true }
];

const generatePersonnelFields = (options: TemplateOptions, regulation: any) => [
  { id: 'superviseur', type: 'object', required: true },
  { id: 'entrants', type: 'array', required: true },
  { id: 'specialisedPersonnel', type: 'object', required: false }
];

const generateTestingFields = (options: TemplateOptions, permitTemplate: any) => 
  permitTemplate.testingRequired ? [
    { id: 'atmospherique', type: 'object', required: true }
  ] : [];

const generateEquipmentFields = (options: TemplateOptions) => [
  { id: 'protection', type: 'array', required: true },
  { id: 'detection', type: 'array', required: false },
  { id: 'sauvetage', type: 'array', required: false }
];

const generateProcedureFields = (options: TemplateOptions) => [
  { id: 'procedures', type: 'object', required: true }
];

const generateValidationFields = (options: TemplateOptions) => [
  { id: 'signatureResponsable', type: 'text', required: true },
  { id: 'dateValidation', type: 'datetime-local', required: true }
];

const generateValidationRules = (options: TemplateOptions, regulation: any) => ({
  minimumAge: regulation.minimumAge,
  oxygenRange: regulation.oxygenRange,
  flammableGasLimit: regulation.flammableGasLimit
});

const generateMobileStyling = (options: TemplateOptions) => ({
  colors: options.branding?.colors || {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#06b6d4'
  },
  fonts: options.branding?.fonts || {
    header: 'system-ui',
    body: 'system-ui'
  },
  mobile: {
    fontSize: {
      base: '16px',
      small: '14px',
      large: '18px'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    touchTargets: {
      minimum: '44px'
    }
  }
});

// =================== EXPORTS ===================
export {
  generatePermitPDF,
  generatePermitTemplate,
  exportPermitData
};

export type {
  PDFGenerationOptions,
  ExportOptions,
  TemplateOptions,
  CustomField
};
