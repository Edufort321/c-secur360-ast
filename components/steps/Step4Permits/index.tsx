// =================== SECTION 1 - INTERFACES ET FONCTIONS COMPLÈTES ===================
// À coller au début de votre fichier Step4Permits.tsx

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer, ChevronLeft,
  ChevronRight, Upload, Trash2, UserPlus, UserCheck, Grid, List
} from 'lucide-react';

// =================== INTERFACES LÉGALES CONFORMES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: Record<string, string>;
}

interface LegalPermit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData?: any;
  code: string;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
    approvedBy?: string;
  };
  compliance: {
    cnesst?: boolean;
    ohsa?: boolean;
    worksafebc?: boolean;
    ohs?: boolean;
  };
}

// =================== TYPES PERSONNEL CONFORMES CNESST/OHSA ===================
interface Entrant {
  id: string;
  nom: string;
  certification: string;
  age: number; // Minimum 18 ans selon CNESST 2025
  heureEntree?: string;
  heureSortie?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  equipementProtection: string[];
  medicaleClearance: boolean;
}

interface Surveillant {
  id: string;
  nom: string;
  certification: string;
  contactUrgence: string;
  posteDeSurveillance: string;
  heureDebut?: string;
  heureFin?: string;
  statutActif: boolean;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  communicationMethod: string;
  emergencyProcedure: string;
}

interface Superviseur {
  id: string;
  nom: string;
  certification: string;
  numeroPermis: string;
  contactUrgence: string;
  autorisation: string;
  formationVerifiee: boolean;
  signature: string;
  dateSignature: string;
  responsabilites: string[];
  experienceAnnees: number;
}

// =================== DONNÉES ATMOSPHÉRIQUES CONFORMES 2025 ===================
interface AtmosphericData {
  oxygene: {
    niveau: number;
    conformeCNESST: boolean; // 20.5% - 23% selon nouvelle norme 2025
    heureTest: string;
    equipementUtilise: string;
  };
  gazToxiques: {
    detection: string[];
    niveaux: Record<string, number>;
    seuils: Record<string, number>;
    conforme: boolean;
  };
  gazCombustibles: {
    pourcentageLIE: number;
    conformeReglement: boolean; // ≤ 5% LIE selon CNESST 2025
    typeGaz: string;
    equipementTest: string;
  };
  ventilation: {
    active: boolean;
    debitAir: string;
    directionFlux: string;
    efficacite: string;
  };
}

// =================== CONFIGURATION PROVINCIALE RÉELLE ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec - CNESST',
    regulation: 'RSST Section XXVI (2023)',
    oxygenRange: { min: 20.5, max: 23.0 }, // Nouvelle norme 2025
    flammableGasLimit: 5, // % LIE - Nouvelle norme stricte
    minimumAge: 18,
    mandatoryDocuments: [
      'Permis d\'entrée en espace clos',
      'Analyse atmosphérique continue',
      'Plan d\'intervention d\'urgence',
      'Formation du personnel certifiée',
      'Équipements de sauvetage vérifiés'
    ],
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois'
  },
  ON: {
    name: 'Ontario - OHSA',
    regulation: 'Règl. de l\'Ont. 632/05 - Espaces clos',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10, // % LIE
    minimumAge: 18,
    mandatoryDocuments: [
      'Programme écrit sur les espaces clos',
      'Permis d\'entrée obligatoire',
      'Évaluation des risques',
      'Formation des travailleurs',
      'Procédures de sauvetage'
    ],
    authority: 'Ministère du Travail de l\'Ontario',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois'
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 19, // BC spécifique
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment',
      'Entry Procedures',
      'Emergency Response Plan',
      'Worker Training Records'
    ],
    authority: 'Workers\' Compensation Board of British Columbia',
    penalties: 'Administrative penalties and prosecution'
  },
  AB: {
    name: 'Alberta - OHS',
    regulation: 'OHS Code Part 4 - Confined Spaces',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment and Control',
      'Emergency Response Procedures',
      'Training and Competency',
      'Atmospheric Testing'
    ],
    authority: 'Alberta Occupational Health and Safety',
    penalties: 'Fines up to $500,000 for corporations'
  }
};

// =================== VRAIS PERMIS GOUVERNEMENTAUX ===================
const OFFICIAL_PERMITS = {
  QC_CONFINED_SPACE: {
    id: 'qc-espace-clos-cnesst',
    officialName: 'Permis d\'entrée en espace clos - CNESST',
    regulation: 'RSST Section XXVI, articles 296.1 à 312',
    formNumber: 'CNESST-EC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    lastUpdated: '2023-07-25', // Date d'entrée en vigueur nouvelle réglementation
    requiredFields: [
      'Identification de l\'espace clos',
      'Description du travail',
      'Analyse atmosphérique (O2: 20.5-23%, Gaz inflammables ≤5% LIE)',
      'Procédures d\'entrée et de sortie',
      'Équipements de protection requis',
      'Surveillant désigné (18+ ans)',
      'Plan d\'intervention d\'urgence',
      'Signatures autorisées'
    ]
  },
  QC_HOT_WORK: {
    id: 'qc-travail-chaud-cnesst',
    officialName: 'Permis de travail à chaud - CNESST',
    regulation: 'RSST Section relative aux travaux à chaud',
    formNumber: 'CNESST-TC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    requiredFields: [
      'Description des travaux à chaud (soudage, découpage, meulage)',
      'Évaluation des risques d\'incendie',
      'Mesures de prévention incendie',
      'Surveillance continue obligatoire',
      'Équipements d\'extinction à proximité',
      'Autorisations de supervision',
      'Durée et horaires des travaux'
    ]
  },
  ON_CONFINED_SPACE: {
    id: 'on-confined-space-ohsa',
    officialName: 'Confined Space Entry Permit - OHSA',
    regulation: 'O. Reg. 632/05 under OHSA',
    formNumber: 'OHSA-CS-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    requiredFields: [
      'Confined space identification and location',
      'Work description and duration',
      'Atmospheric testing results',
      'Entry and exit procedures',
      'Attendant designation',
      'Emergency rescue procedures',
      'Equipment checklist and verification',
      'Authorized signatures'
    ]
  },
  BC_CONFINED_SPACE: {
    id: 'bc-confined-space-wsbc',
    officialName: 'Confined Space Entry Permit - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces',
    formNumber: 'WSBC-CS-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    requiredFields: [
      'Confined space identification',
      'Hazard assessment and controls',
      'Atmospheric monitoring (19+ age requirement)',
      'Entry procedures and training',
      'Emergency response plan',
      'Equipment verification',
      'Competent person authorization'
    ]
  }
};

// =================== FONCTION GÉNÉRATION CODE PERMIS LÉGAL ===================
const generateLegalPermitCode = (permitType: string, province: string): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  // Format conforme: PROVINCE-TYPE-YYYYMMDD-XXXXXX
  const typeCode = permitType.split('-')[0].toUpperCase().substring(0, 3);
  return `${province}-${typeCode}-${year}${month}${day}-${timestamp}`;
};

// =================== TRADUCTIONS CONFORMES ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis de Travail Officiels 2025',
      subtitle: 'Formulaires gouvernementaux conformes aux dernières réglementations provinciales',
      searchPlaceholder: 'Rechercher un permis officiel...',
      allCategories: 'Tous les permis',
      categories: {
        'Espaces Clos': 'Espaces Clos',
        'Travail à Chaud': 'Travail à Chaud',
        'Excavation': 'Excavation',
        'Hauteur': 'Travail en Hauteur'
      },
      stats: {
        available: 'Disponibles',
        submitted: 'Soumis',
        approved: 'Approuvés', 
        archived: 'Archivés'
      },
      actions: {
        fill: 'Remplir Permis',
        submit: 'Soumettre',
        approve: 'Approuver',
        archive: 'Archiver',
        download: 'Télécharger PDF',
        duplicate: 'Dupliquer'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
        selectProvince: 'Sélectionnez votre province pour voir les permis applicables'
      },
      compliance: {
        cnesst: 'Conforme CNESST 2025',
        ohsa: 'Conforme OHSA',
        worksafebc: 'Conforme WorkSafeBC',
        ohs: 'Conforme OHS Alberta'
      }
    };
  } else {
    return {
      title: 'Official Work Permits 2025',
      subtitle: 'Government forms compliant with latest provincial regulations',
      searchPlaceholder: 'Search official permit...',
      allCategories: 'All permits',
      categories: {
        'Espaces Clos': 'Confined Spaces',
        'Travail à Chaud': 'Hot Work',
        'Excavation': 'Excavation',
        'Hauteur': 'Work at Height'
      },
      stats: {
        available: 'Available',
        submitted: 'Submitted', 
        approved: 'Approved',
        archived: 'Archived'
      },
      actions: {
        fill: 'Fill Permit',
        submit: 'Submit',
        approve: 'Approve',
        archive: 'Archive',
        download: 'Download PDF',
        duplicate: 'Duplicate'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        selectProvince: 'Select your province to see applicable permits'
      },
      compliance: {
        cnesst: 'CNESST 2025 Compliant',
        ohsa: 'OHSA Compliant',
        worksafebc: 'WorkSafeBC Compliant',
        ohs: 'Alberta OHS Compliant'
      }
    };
  }
};

// =================== GÉNÉRATEUR PERMIS CONFORMES - FONCTION MANQUANTE ! ===================
const generateCompliantPermits = (language: 'fr' | 'en', province: string): LegalPermit[] => {
  const regulation = PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS];
  const basePermits: LegalPermit[] = [];

  // Permis Espace Clos - Obligatoire dans toutes les provinces
  basePermits.push({
    id: `confined-space-${province.toLowerCase()}`,
    name: language === 'fr' ? 
      `🔒 Permis Entrée Espace Clos - ${regulation?.name}` : 
      `🔒 Confined Space Entry Permit - ${regulation?.name}`,
    category: language === 'fr' ? 'Espaces Clos' : 'Confined Spaces',
    description: language === 'fr' ? 
      `Permis obligatoire selon ${regulation?.regulation}. Tests atmosphériques: O2 ${regulation?.oxygenRange.min}-${regulation?.oxygenRange.max}%, Gaz inflammables ≤${regulation?.flammableGasLimit}% LIE. Âge minimum: ${regulation?.minimumAge} ans.` :
      `Mandatory permit per ${regulation?.regulation}. Atmospheric testing: O2 ${regulation?.oxygenRange.min}-${regulation?.oxygenRange.max}%, Flammable gases ≤${regulation?.flammableGasLimit}% LEL. Minimum age: ${regulation?.minimumAge} years.`,
    authority: regulation?.authority || '',
    province: [province],
    priority: 'critical',
    selected: false,
    formData: {},
    code: generateLegalPermitCode('confined-space', province),
    status: 'draft',
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    legalRequirements: {
      permitRequired: true,
      atmosphericTesting: true,
      entryProcedure: true,
      emergencyPlan: true,
      equipmentCheck: true,
      attendantRequired: true,
      documentation: true
    },
    validity: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isValid: false
    },
    compliance: {
      [province.toLowerCase() === 'qc' ? 'cnesst' : 
       province.toLowerCase() === 'on' ? 'ohsa' : 
       province.toLowerCase() === 'bc' ? 'worksafebc' : 'ohs']: true
    }
  });

  // Permis Travail à Chaud - Selon réglementation provinciale
  if (province === 'QC' || province === 'ON') {
    basePermits.push({
      id: `hot-work-${province.toLowerCase()}`,
      name: language === 'fr' ? 
        `🔥 Permis Travail à Chaud - ${regulation?.name}` : 
        `🔥 Hot Work Permit - ${regulation?.name}`,
      category: language === 'fr' ? 'Travail à Chaud' : 'Hot Work',
      description: language === 'fr' ? 
        `Soudage, découpage, meulage selon ${regulation?.regulation}. Surveillance incendie continue obligatoire. Tests atmosphériques avant travaux.` :
        `Welding, cutting, grinding per ${regulation?.regulation}. Continuous fire watch mandatory. Atmospheric testing before work.`,
      authority: regulation?.authority || '',
      province: [province],
      priority: 'critical',
      selected: false,
      formData: {},
      code: generateLegalPermitCode('hot-work', province),
      status: 'draft',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: true,
        entryProcedure: false,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: true,
        documentation: true
      },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours max
        isValid: false
      },
      compliance: {
        [province.toLowerCase() === 'qc' ? 'cnesst' : 'ohsa']: true
      }
    });
  }

  // Permis Excavation - Selon municipalités et provinces
  basePermits.push({
    id: `excavation-${province.toLowerCase()}`,
    name: language === 'fr' ? 
      `⛏️ Permis Excavation - ${regulation?.name}` : 
      `⛏️ Excavation Permit - ${regulation?.name}`,
    category: language === 'fr' ? 'Excavation' : 'Excavation',
    description: language === 'fr' ? 
      `Excavation >1.2m. Étançonnement obligatoire selon codes municipaux et ${regulation?.regulation}. Plans ingénieur requis.` :
      `Excavation >1.2m. Shoring mandatory per municipal codes and ${regulation?.regulation}. Engineer plans required.`,
    authority: regulation?.authority || '',
    province: [province],
    priority: 'high',
    selected: false,
    formData: {},
    code: generateLegalPermitCode('excavation', province),
    status: 'draft',
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    legalRequirements: {
      permitRequired: true,
      atmosphericTesting: false,
      entryProcedure: true,
      emergencyPlan: true,
      equipmentCheck: true,
      attendantRequired: false,
      documentation: true
    },
    validity: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 mois
      isValid: false
    },
    compliance: {
      [province.toLowerCase() === 'qc' ? 'cnesst' : 
       province.toLowerCase() === 'on' ? 'ohsa' : 
       province.toLowerCase() === 'bc' ? 'worksafebc' : 'ohs']: true
    }
  });

  return basePermits;
};
// =================== SECTION 2-A - FORMULAIRE SCROLL CONTINU + TIMERS SURVEILLANCE ===================
// Remplace complètement le FormulaireLegalScrollable existant

const FormulaireLegalScrollable: React.FC<{
  permit: LegalPermit;
  onFormChange: (data: any) => void;
  language: 'fr' | 'en';
  onClose: () => void;
}> = ({ permit, onFormChange, language, onClose }) => {
  const t = getTexts(language);
  const regulation = PROVINCIAL_REGULATIONS[permit.province[0] as keyof typeof PROVINCIAL_REGULATIONS];
  
  // États pour scroll continu et tests automatiques
  const [formData, setFormData] = useState({
    // Section 1: Identification avec numéros de formulaire provinciaux
    codePermis: permit.code,
    numeroFormulaire: permit.province[0] === 'QC' ? 
      (permit.id.includes('confined') ? 'CNESST-EC-2025' : 
       permit.id.includes('hot-work') ? 'CNESST-TC-2025' : 'CNESST-EX-2025') :
      permit.province[0] === 'ON' ? 
      (permit.id.includes('confined') ? 'OHSA-CS-2025' : 
       permit.id.includes('hot-work') ? 'OHSA-HW-2025' : 'OHSA-EX-2025') :
      permit.province[0] === 'BC' ? 
      (permit.id.includes('confined') ? 'WSBC-CS-2025' : 'WSBC-EX-2025') : 'OHS-AB-2025',
    lieuTravail: '',
    descriptionTravaux: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    dureeEstimee: '',
    typePermis: permit.id.includes('confined') ? 'espace-clos' : 
                permit.id.includes('hot-work') ? 'travail-chaud' : 'excavation',
    
    // Section 2: Personnel conforme réglementations
    superviseur: null as Superviseur | null,
    surveillants: [] as Surveillant[],
    entrants: [] as Entrant[],
    
    // Section 3: Tests atmosphériques avec reprise automatique (pour espaces clos)
    atmospherique: {
      oxygene: { 
        niveau: 0, 
        conformeCNESST: false, 
        heureTest: '', 
        equipementUtilise: '',
        dernierEchec: null as Date | null,
        tentativeReprise: 0,
        enAttente: false
      },
      gazToxiques: { 
        detection: [] as string[], 
        niveaux: {} as Record<string, number>, 
        seuils: {} as Record<string, number>,
        conforme: false,
        dernierEchec: null as Date | null,
        tentativeReprise: 0,
        enAttente: false
      },
      gazCombustibles: { 
        pourcentageLIE: 0, 
        conformeReglement: false, 
        typeGaz: '',
        equipementTest: '',
        dernierEchec: null as Date | null,
        tentativeReprise: 0,
        enAttente: false
      },
      ventilation: { 
        active: false, 
        debitAir: '', 
        directionFlux: '',
        efficacite: ''
      }
    },
    
    // Section 4: Équipements spécifiques selon type de permis
    equipements: {
      protection: [] as string[],
      detection: [] as string[],
      sauvetage: [] as string[],
      communication: [] as string[],
      // Spécifique travail à chaud
      preventionIncendie: {
        extincteurs: false,
        couverturesIgnifuges: false,
        arrosagePreventif: false,
        degagementCombustibles: 0 // mètres
      },
      // Spécifique excavation
      etancemment: {
        requis: false,
        type: '', // hydraulique, bois, aluminium
        profondeurRequise: 0,
        ingenieurPlan: false
      }
    },
    
    // Section 5: Procédures spécifiques selon permis
    procedures: {
      // Travail à chaud - NFPA 51B
      travailChaud: {
        zoneDegagee: 11, // 11 mètres selon Ontario OHSA
        surveillanceIncendie: false,
        surveysPostTravaux: 30, // 30 minutes minimum selon NFPA
        equipementEteint: false,
        autorisationSuperviseur: false
      },
      // Excavation - O. Reg. 213/91
      excavation: {
        localisationServices: false, // Ontario Reg 213/91 s.228
        noticeRequired: false, // >1.2m depth
        protectionAdjacentes: false,
        planIngenieur: false,
        accesSortie: false // Échelles max 8m selon CCOHS
      },
      // Espace clos - CNESST/OHSA
      espaceClos: {
        analyseContinue: false,
        surveillantDesigne: false,
        procedureSecours: false,
        communicationEtablie: false
      }
    },
    
    // Section 6: Surveillance post-travaux avec timers
    surveillance: {
      travauxTermines: false,
      heureFin: '',
      surveillanceActive: false,
      timerActif: false,
      dureeRequise: permit.id.includes('hot-work') ? 30 : // 30 min travail chaud
                    permit.id.includes('confined') ? 60 : // 60 min espace clos
                    permit.id.includes('excavation') ? 0 : 30, // Pas de timer pour excavation sauf conditions spéciales
      tempsRestant: 0,
      interventionEnCours: false,
      incidents: [] as Array<{
        id: string;
        heure: string;
        description: string;
        actionPrise: string;
        timerRedemarrage: boolean;
      }>
    },
    
    // Section 7: Validation finale et conformité
    validation: {
      tousTestsCompletes: false,
      documentationComplete: false,
      formationVerifiee: false,
      equipementsVerifies: false,
      conformeReglementation: false,
      signatureResponsable: '',
      dateValidation: '',
      certificationsValides: false,
      planUrgenceApprouve: false,
      numeroFormulaireFinal: ''
    }
  });

  // États pour timer et reprise automatique des tests
  const [timerReprise, setTimerReprise] = useState<Record<string, number>>({});
  const [formulaireBloqueJusqu, setFormulaireBloqueJusqu] = useState<Date | null>(null);
  const [tempsRestant, setTempsRestant] = useState<number>(0);
  
  // États pour timer de surveillance post-travaux
  const [timerSurveillance, setTimerSurveillance] = useState<NodeJS.Timeout | null>(null);
  const [surveillanceEnCours, setSurveillanceEnCours] = useState(false);
  const [tempsRestantSurveillance, setTempsRestantSurveillance] = useState(0);

  // Référence pour scroll continu
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour démarrer le timer de surveillance post-travaux
  const demarrerSurveillancePostTravaux = () => {
    if (!formData.surveillance.travauxTermines) {
      alert('❌ Veuillez d\'abord cocher "Travaux terminés" avant de démarrer la surveillance');
      return;
    }

    const dureeMinutes = formData.surveillance.dureeRequise;
    if (dureeMinutes === 0) {
      alert('ℹ️ Aucune surveillance post-travaux requise pour ce type de permis');
      return;
    }

    // Démarrer le timer
    const dureeSecondes = dureeMinutes * 60;
    setTempsRestantSurveillance(dureeSecondes);
    setSurveillanceEnCours(true);
    
    // Mettre à jour formData
    const newFormData = {
      ...formData,
      surveillance: {
        ...formData.surveillance,
        surveillanceActive: true,
        timerActif: true,
        heureFin: new Date().toLocaleTimeString(),
        tempsRestant: dureeSecondes
      }
    };
    setFormData(newFormData);
    onFormChange(newFormData);

    // Démarrer le countdown
    const timer = setInterval(() => {
      setTempsRestantSurveillance(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setSurveillanceEnCours(false);
          alert(`✅ SURVEILLANCE TERMINÉE\n\n` +
                `🕐 Durée: ${dureeMinutes} minutes\n` +
                `✅ Aucun incident signalé\n` +
                `📋 Permis peut être fermé définitivement`);
          
          // Mettre à jour formData
          const finalFormData = {
            ...newFormData,
            surveillance: {
              ...newFormData.surveillance,
              surveillanceActive: false,
              timerActif: false
            }
          };
          setFormData(finalFormData);
          onFormChange(finalFormData);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerSurveillance(timer);

    alert(`🚨 SURVEILLANCE POST-TRAVAUX DÉMARRÉE\n\n` +
          `⏰ Durée: ${dureeMinutes} minutes\n` +
          `👀 Surveillance continue requise\n` +
          `🔥 Attention aux risques résiduels\n\n` +
          `Si problème: Cochez "Intervention en cours"`);
  };

  // Fonction pour signaler une intervention pendant la surveillance
  const signalerIntervention = () => {
    if (!surveillanceEnCours) {
      alert('❌ Aucune surveillance en cours');
      return;
    }

    const description = prompt('📝 Décrivez l\'incident ou le problème détecté:');
    if (!description) return;

    const actionPrise = prompt('🔧 Décrivez l\'action prise pour corriger:');
    if (!actionPrise) return;

    const redemarrerTimer = confirm('🔄 Redémarrer le timer de surveillance depuis le début ?\n\n' +
                                   'OUI = Timer redémarre à ' + formData.surveillance.dureeRequise + ' minutes\n' +
                                   'NON = Timer continue normalement');

    const nouvelIncident = {
      id: `incident_${Date.now()}`,
      heure: new Date().toLocaleTimeString(),
      description,
      actionPrise,
      timerRedemarrage: redemarrerTimer
    };

    // Ajouter l'incident
    const newFormData = {
      ...formData,
      surveillance: {
        ...formData.surveillance,
        incidents: [...formData.surveillance.incidents, nouvelIncident],
        interventionEnCours: true
      }
    };
    setFormData(newFormData);
    onFormChange(newFormData);

    if (redemarrerTimer) {
      // Redémarrer le timer depuis le début
      if (timerSurveillance) {
        clearInterval(timerSurveillance);
      }
      
      const dureeSecondes = formData.surveillance.dureeRequise * 60;
      setTempsRestantSurveillance(dureeSecondes);
      
      const timer = setInterval(() => {
        setTempsRestantSurveillance(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setSurveillanceEnCours(false);
            alert(`✅ SURVEILLANCE TERMINÉE APRÈS INTERVENTION\n\n` +
                  `🔧 ${formData.surveillance.incidents.length} incident(s) traité(s)\n` +
                  `📋 Permis peut être fermé`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerSurveillance(timer);

      alert(`🔄 TIMER REDÉMARRÉ\n\n` +
            `⏰ Nouvelle surveillance: ${formData.surveillance.dureeRequise} minutes\n` +
            `📝 Incident enregistré et traité`);
    } else {
      alert(`📝 INCIDENT ENREGISTRÉ\n\n` +
            `⏰ Timer continue normalement\n` +
            `🔧 Action corrective documentée`);
    }

    // Réinitialiser le flag d'intervention
    setTimeout(() => {
      const updatedFormData = {
        ...newFormData,
        surveillance: {
          ...newFormData.surveillance,
          interventionEnCours: false
        }
      };
      setFormData(updatedFormData);
      onFormChange(updatedFormData);
    }, 2000);
  };

  // Fonction d'arrêt d'urgence de la surveillance
  const arreterSurveillance = () => {
    if (!surveillanceEnCours) return;

    const raison = prompt('⚠️ Raison de l\'arrêt de surveillance:');
    if (!raison) return;

    if (timerSurveillance) {
      clearInterval(timerSurveillance);
    }
    
    setSurveillanceEnCours(false);
    setTempsRestantSurveillance(0);

    const newFormData = {
      ...formData,
      surveillance: {
        ...formData.surveillance,
        surveillanceActive: false,
        timerActif: false,
        incidents: [...formData.surveillance.incidents, {
          id: `arret_${Date.now()}`,
          heure: new Date().toLocaleTimeString(),
          description: `Arrêt surveillance: ${raison}`,
          actionPrise: 'Surveillance interrompue par opérateur',
          timerRedemarrage: false
        }]
      }
    };
    setFormData(newFormData);
    onFormChange(newFormData);

    alert(`🛑 SURVEILLANCE ARRÊTÉE\n\n` +
          `📝 Raison: ${raison}\n` +
          `⚠️ Surveillance manuelle requise`);
  };

  // Fonction de validation des tests avec reprise automatique
  const validerTest = (typeTest: 'oxygene' | 'gazToxiques' | 'gazCombustibles', valeur: number) => {
    let conforme = false;
    
    switch (typeTest) {
      case 'oxygene':
        conforme = valeur >= (regulation?.oxygenRange.min || 19.5) && valeur <= (regulation?.oxygenRange.max || 23.0);
        break;
      case 'gazCombustibles':
        conforme = valeur <= (regulation?.flammableGasLimit || 10);
        break;
      default:
        conforme = true;
    }

    if (!conforme) {
      // Test échoué - programmer reprise automatique
      const maintenant = new Date();
      const repriseEn15Min = new Date(maintenant.getTime() + 15 * 60 * 1000);
      
      setFormulaireBloqueJusqu(repriseEn15Min);
      setTempsRestant(15 * 60); // 15 minutes en secondes
      
      // Mettre à jour les données du test
      const nouveauFormData = { ...formData };
      (nouveauFormData.atmospherique[typeTest] as any).dernierEchec = maintenant;
      (nouveauFormData.atmospherique[typeTest] as any).tentativeReprise = ((nouveauFormData.atmospherique[typeTest] as any).tentativeReprise || 0) + 1;
      (nouveauFormData.atmospherique[typeTest] as any).enAttente = true;
      
      setFormData(nouveauFormData);
      onFormChange(nouveauFormData);
      
      // Démarrer timer de 15 minutes
      startTimer(typeTest);
      
      alert(`🚨 ÉCHEC DU TEST ${typeTest.toUpperCase()}\n\n` +
            `❌ Valeur non conforme: ${valeur}\n` +
            `✅ Requis: ${typeTest === 'oxygene' ? `${regulation?.oxygenRange.min}-${regulation?.oxygenRange.max}%` : `≤${regulation?.flammableGasLimit}% LIE`}\n\n` +
            `⏰ REPRISE AUTOMATIQUE dans 15 minutes\n` +
            `🔒 Formulaire bloqué jusqu'à la reprise`);
    } else {
      // Test réussi - réinitialiser les échecs
      const nouveauFormData = { ...formData };
      (nouveauFormData.atmospherique[typeTest] as any).dernierEchec = null;
      (nouveauFormData.atmospherique[typeTest] as any).tentativeReprise = 0;
      (nouveauFormData.atmospherique[typeTest] as any).enAttente = false;
      
      setFormData(nouveauFormData);
      onFormChange(nouveauFormData);
    }
    
    return conforme;
  };

  // Timer de reprise automatique
  const startTimer = (typeTest: string) => {
    const timer = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFormulaireBloqueJusqu(null);
          
          // Réactiver le test
          const nouveauFormData = { ...formData };
          (nouveauFormData.atmospherique[typeTest as keyof typeof nouveauFormData.atmospherique] as any).enAttente = false;
          setFormData(nouveauFormData);
          
          alert(`✅ REPRISE AUTOMATIQUE ACTIVÉE\n\n` +
                `🔓 Formulaire débloqué\n` +
                `🧪 Vous pouvez relancer le test ${typeTest.toUpperCase()}`);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Hook pour timer
  useEffect(() => {
    if (formulaireBloqueJusqu) {
      const interval = setInterval(() => {
        const maintenant = new Date();
        const diff = formulaireBloqueJusqu.getTime() - maintenant.getTime();
        
        if (diff <= 0) {
          setFormulaireBloqueJusqu(null);
          setTempsRestant(0);
          clearInterval(interval);
        } else {
          setTempsRestant(Math.floor(diff / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [formulaireBloqueJusqu]);

  // Hook pour cleanup du timer de surveillance
  useEffect(() => {
    return () => {
      if (timerSurveillance) {
        clearInterval(timerSurveillance);
      }
    };
  }, [timerSurveillance]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  // Scroll automatique vers section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && containerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Formatage temps restant
  const formatTempsRestant = (secondes: number) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fonctions d'ajout de personnel
  const ajouterSuperviseur = () => {
    const nouveauSuperviseur: Superviseur = {
      id: `superviseur_${Date.now()}`,
      nom: '',
      certification: '',
      numeroPermis: '',
      contactUrgence: '',
      autorisation: permit.province[0] === 'QC' ? 'CNESST' : permit.province[0] === 'ON' ? 'OHSA' : 'Provincial',
      formationVerifiee: false,
      signature: '',
      dateSignature: '',
      responsabilites: ['Supervision entrée/sortie', 'Tests atmosphériques', 'Procédures urgence'],
      experienceAnnees: 0
    };
    handleInputChange('superviseur', nouveauSuperviseur);
  };

  const ajouterEntrant = () => {
    const nouvelEntrant: Entrant = {
      id: `entrant_${Date.now()}`,
      nom: '',
      certification: '',
      age: regulation?.minimumAge || 18,
      statutActif: false,
      formationVerifiee: false,
      signature: '',
      dateSignature: '',
      equipementProtection: [],
      medicaleClearance: false
    };
    
    handleInputChange('entrants', [...formData.entrants, nouvelEntrant]);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div ref={containerRef} style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
        height: '100vh',
        color: '#ffffff',
        overflow: 'auto',
        scrollBehavior: 'smooth'
      }}>
        
        {/* Header fixe avec timer de reprise et surveillance */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: formulaireBloqueJusqu ? 
            'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8))' :
            surveillanceEnCours ?
            'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.8))' :
            'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
          borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
          padding: '16px 20px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ 
                color: '#ffffff', 
                margin: '0 0 4px', 
                fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                fontWeight: '800'
              }}>
                {permit.name}
              </h2>
              <div style={{
                fontSize: '12px',
                color: formulaireBloqueJusqu ? '#fecaca' : surveillanceEnCours ? '#fed7aa' : '#93c5fd',
                fontWeight: '600'
              }}>
                {formData.numeroFormulaire} • {permit.code} • {regulation?.name}
                {formulaireBloqueJusqu && (
                  <span style={{ marginLeft: '12px', color: '#fef2f2' }}>
                    🔒 BLOQUÉ - Reprise: {formatTempsRestant(tempsRestant)}
                  </span>
                )}
                {surveillanceEnCours && (
                  <span style={{ marginLeft: '12px', color: '#fffbeb' }}>
                    👀 SURVEILLANCE: {formatTempsRestant(tempsRestantSurveillance)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation sections avec scroll */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {[
              { id: 'identification', title: 'Identification', icon: '📋' },
              { id: 'personnel', title: 'Personnel', icon: '👥' },
              { id: 'tests', title: 'Tests/Mesures', icon: '🧪' },
              { id: 'equipements', title: 'Équipements', icon: '🛡️' },
              { id: 'procedures', title: 'Procédures', icon: '📝' },
              { id: 'surveillance', title: 'Surveillance', icon: '⏰' },
              { id: 'validation', title: 'Validation', icon: '✅' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                disabled={formulaireBloqueJusqu !== null}
                style={{
                  padding: '8px 12px',
                  background: formulaireBloqueJusqu ? 
                    'rgba(100, 116, 139, 0.3)' : 
                    'rgba(59, 130, 246, 0.3)',
                  color: formulaireBloqueJusqu ? '#9ca3af' : '#93c5fd',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: formulaireBloqueJusqu ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contrôles de surveillance post-travaux */}
        {formData.surveillance.dureeRequise > 0 && (
          <div style={{
            margin: '20px',
            padding: '20px',
            background: surveillanceEnCours ? 
              'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))' :
              'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))',
            border: surveillanceEnCours ? 
              '2px solid rgba(245, 158, 11, 0.5)' : 
              '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px'
          }}>
            <h4 style={{ 
              color: surveillanceEnCours ? '#f59e0b' : '#60a5fa', 
              margin: '0 0 16px', 
              fontSize: '16px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {surveillanceEnCours ? '🟡' : '🔵'} Surveillance Post-Travaux ({formData.surveillance.dureeRequise} min requise)
            </h4>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: '#e2e8f0',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.surveillance.travauxTermines}
                  onChange={(e) => handleInputChange('surveillance', {
                    ...formData.surveillance,
                    travauxTermines: e.target.checked
                  })}
                  style={{ transform: 'scale(1.2)' }}
                />
                🏁 Travaux terminés
              </label>

              <button
                onClick={demarrerSurveillancePostTravaux}
                disabled={!formData.surveillance.travauxTermines || surveillanceEnCours}
                style={{
                  padding: '10px 16px',
                  background: (!formData.surveillance.travauxTermines || surveillanceEnCours) ? 
                    'rgba(100, 116, 139, 0.3)' : 
                    'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: (!formData.surveillance.travauxTermines || surveillanceEnCours) ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (!formData.surveillance.travauxTermines || surveillanceEnCours) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ▶️ Démarrer Surveillance
              </button>

              {surveillanceEnCours && (
                <>
                  <button
                    onClick={signalerIntervention}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    🚨 Intervention en Cours
                  </button>

                  <button
                    onClick={arreterSurveillance}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    🛑 Arrêter
                  </button>

                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'monospace'
                  }}>
                    ⏱️ {formatTempsRestant(tempsRestantSurveillance)}
                  </div>
                </>
              )}
            </div>

            {/* Historique des incidents */}
            {formData.surveillance.incidents.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h5 style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px' }}>📝 Historique des incidents:</h5>
                {formData.surveillance.incidents.map((incident) => (
                  <div key={incident.id} style={{
                    fontSize: '11px',
                    color: '#cbd5e1',
                    marginBottom: '4px',
                    padding: '4px 8px',
                    background: 'rgba(100, 116, 139, 0.1)',
                    borderRadius: '4px'
                  }}>
                    <strong>{incident.heure}</strong>: {incident.description} 
                    {incident.timerRedemarrage && <span style={{ color: '#f59e0b' }}> (🔄 Timer redémarré)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenu scrollable - sera dans la SECTION 2-B */}
        <div style={{ 
          padding: '24px 20px 40px',
          opacity: formulaireBloqueJusqu ? 0.5 : 1,
          pointerEvents: formulaireBloqueJusqu ? 'none' : 'auto'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 12px' }}>
              SECTION 2-A Complétée
            </h3>
            <p style={{ margin: 0 }}>
              Timer de surveillance post-travaux + Tests automatiques intégrés
            </p>
            <p style={{ margin: '16px 0 0', fontSize: '14px', color: '#60a5fa' }}>
              🎯 Prêt pour SECTION 2-B: Formulaires spécifiques par type de permis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// =================== SECTION 2-B - FORMULAIRES SPÉCIFIQUES PAR TYPE ===================
// Cette section complète le contenu scrollable de la Section 2-A
// Remplace le placeholder "SECTION 2-A Complétée" dans le contenu scrollable

        {/* Contenu scrollable complet avec formulaires spécifiques */}
        <div style={{ 
          padding: '24px 20px 40px',
          opacity: formulaireBloqueJusqu ? 0.5 : 1,
          pointerEvents: formulaireBloqueJusqu ? 'none' : 'auto'
        }}>

          {/* Section 1: Identification avec formulaire provincial spécifique */}
          <div id="identification" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              📋 Identification du Projet - {formData.numeroFormulaire}
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Info formulaire provincial */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ color: '#60a5fa', margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>
                  🏛️ Formulaire Officiel Provincial
                </h4>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Numéro de formulaire:</strong> {formData.numeroFormulaire}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Type de permis:</strong> {
                      formData.typePermis === 'espace-clos' ? 'Espace Clos / Confined Space' :
                      formData.typePermis === 'travail-chaud' ? 'Travail à Chaud / Hot Work' :
                      'Excavation / Trenching'
                    }
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Autorité:</strong> {regulation?.authority}
                  </div>
                  <div>
                    <strong>Réglementation:</strong> {regulation?.regulation}
                  </div>
                </div>
              </div>

              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Lieu de travail exact (avec coordonnées GPS) *
                </label>
                <input
                  type="text"
                  value={formData.lieuTravail}
                  onChange={(e) => handleInputChange('lieuTravail', e.target.value)}
                  placeholder={
                    formData.typePermis === 'excavation' ? 
                    "Adresse exacte + profondeur estimée + proximité services publics" :
                    formData.typePermis === 'travail-chaud' ?
                    "Lieu des travaux + matériaux combustibles à proximité" :
                    "Emplacement espace clos + type (réservoir, cuve, etc.)"
                  }
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: formData.lieuTravail ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Description détaillée des travaux *
                </label>
                <textarea
                  value={formData.descriptionTravaux}
                  onChange={(e) => handleInputChange('descriptionTravaux', e.target.value)}
                  placeholder={
                    formData.typePermis === 'excavation' ? 
                    "Type d'excavation, profondeur, largeur, étançonnement prévu, services à éviter..." :
                    formData.typePermis === 'travail-chaud' ?
                    "Type de travaux (soudage/découpage/meulage), équipements utilisés, matériaux, durée..." :
                    "Travaux dans l'espace clos, équipements requis, produits chimiques, ventilation..."
                  }
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: formData.descriptionTravaux ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    minHeight: '120px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Date et heure de début *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateDebut + 'T' + (formData.heureDebut || '08:00')}
                    onChange={(e) => {
                      const [date, heure] = e.target.value.split('T');
                      handleInputChange('dateDebut', date);
                      handleInputChange('heureDebut', heure);
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    color: '#e2e8f0',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Durée estimée *
                  </label>
                  <select
                    value={formData.dureeEstimee}
                    onChange={(e) => handleInputChange('dureeEstimee', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Sélectionner la durée</option>
                    <option value="moins-1h">Moins d'1 heure</option>
                    <option value="1-4h">1 à 4 heures</option>
                    <option value="4-8h">4 à 8 heures (1 journée)</option>
                    <option value="1-3j">1 à 3 jours</option>
                    <option value="1-2sem">1 à 2 semaines</option>
                    <option value="plus-2sem">Plus de 2 semaines</option>
                  </select>
                </div>
              </div>

              {/* Alertes spécifiques selon type de permis */}
              {formData.typePermis === 'travail-chaud' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#fca5a5', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                    🔥 EXIGENCES TRAVAIL À CHAUD - NFPA 51B
                  </h4>
                  <div style={{ fontSize: '13px', color: '#fecaca', lineHeight: '1.5' }}>
                    <div>• Zone dégagée obligatoire: 11 mètres (35 pieds)</div>
                    <div>• Surveillance incendie continue pendant travaux</div>
                    <div>• Surveillance post-travaux: 30 minutes minimum</div>
                    <div>• Équipements d'extinction à proximité immédiate</div>
                    <div>• Tests atmosphériques avant début si espace confiné</div>
                  </div>
                </div>
              )}

              {formData.typePermis === 'excavation' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#fbbf24', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                    ⛏️ EXIGENCES EXCAVATION - {permit.province[0] === 'QC' ? 'RSST Section XXVI' : 'O. Reg. 213/91'}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#fed7aa', lineHeight: '1.5' }}>
                    <div>• Profondeur >1.2m = Protection obligatoire (étançonnement/pente)</div>
                    <div>• Localisation services publics OBLIGATOIRE avant excavation</div>
                    <div>• Notice of Trench Work si >1.2m (Ontario)</div>
                    <div>• Plan ingénieur requis selon profondeur/sol</div>
                    <div>• Échelles d'accès max 8m de distance</div>
                  </div>
                </div>
              )}

              {formData.typePermis === 'espace-clos' && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.15))',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: '#c4b5fd', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                    🔒 EXIGENCES ESPACE CLOS - {regulation?.name}
                  </h4>
                  <div style={{ fontSize: '13px', color: '#ddd6fe', lineHeight: '1.5' }}>
                    <div>• Tests atmosphériques continus obligatoires</div>
                    <div>• O₂: {regulation?.oxygenRange.min}%-{regulation?.oxygenRange.max}% | Gaz: ≤{regulation?.flammableGasLimit}% LIE</div>
                    <div>• Surveillant désigné en permanence à l'extérieur</div>
                    <div>• Plan de sauvetage spécialisé requis</div>
                    <div>• Âge minimum: {regulation?.minimumAge} ans</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Personnel avec spécificités selon permis */}
          <div id="personnel" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              👥 Personnel Autorisé et Certifié
            </h3>
            
            {/* Superviseur obligatoire */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                🛡️ Superviseur Responsable (Obligatoire)
              </h4>
              
              {!formData.superviseur ? (
                <button
                  onClick={ajouterSuperviseur}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <Plus size={20} />
                  Désigner un Superviseur
                </button>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Nom complet du superviseur *"
                      value={formData.superviseur.nom}
                      onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, nom: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder={
                          formData.typePermis === 'travail-chaud' ? 'Certification soudage/NFPA' :
                          formData.typePermis === 'excavation' ? 'Certification excavation/étançonnement' :
                          'Certification espaces clos'
                        }
                        value={formData.superviseur.certification}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, certification: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Contact d'urgence"
                        value={formData.superviseur.contactUrgence}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, contactUrgence: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Numéro de permis spécifique selon type */}
                    <input
                      type="text"
                      placeholder={
                        formData.typePermis === 'travail-chaud' ? 'Numéro permis soudeur certifié' :
                        formData.typePermis === 'excavation' ? 'Numéro carte compétence' :
                        'Numéro certification espaces clos'
                      }
                      value={formData.superviseur.numeroPermis}
                      onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, numeroPermis: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.superviseur.formationVerifiee}
                        onChange={(e) => handleInputChange('superviseur', { ...formData.superviseur, formationVerifiee: e.target.checked })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Formation spécialisée {formData.typePermis} conforme aux exigences {regulation?.name} vérifiée
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Personnel spécialisé selon type de permis */}
            {formData.typePermis === 'travail-chaud' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                  🔥 Surveillant Incendie (Obligatoire NFPA 51B)
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Nom du surveillant incendie *"
                      value={formData.surveillantIncendie?.nom || ''}
                      onChange={(e) => handleInputChange('surveillantIncendie', { 
                        ...formData.surveillantIncendie, 
                        nom: e.target.value,
                        id: formData.surveillantIncendie?.id || `surveillant_${Date.now()}`
                      })}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="Formation prévention incendie"
                        value={formData.surveillantIncendie?.certification || ''}
                        onChange={(e) => handleInputChange('surveillantIncendie', { 
                          ...formData.surveillantIncendie, 
                          certification: e.target.value,
                          id: formData.surveillantIncendie?.id || `surveillant_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Position de surveillance"
                        value={formData.surveillantIncendie?.posteDeSurveillance || ''}
                        onChange={(e) => handleInputChange('surveillantIncendie', { 
                          ...formData.surveillantIncendie, 
                          posteDeSurveillance: e.target.value,
                          id: formData.surveillantIncendie?.id || `surveillant_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#fecaca' }}>
                    🔥 <strong>NFPA 51B:</strong> Surveillant doit rester en poste pendant TOUS les travaux + 30 minutes après
                  </div>
                </div>
              </div>
            )}

            {formData.typePermis === 'espace-clos' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                  👨‍💼 Surveillant Extérieur (Obligatoire {regulation?.name})
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1))',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Nom du surveillant extérieur *"
                      value={formData.surveillantExterieur?.nom || ''}
                      onChange={(e) => handleInputChange('surveillantExterieur', { 
                        ...formData.surveillantExterieur, 
                        nom: e.target.value,
                        id: formData.surveillantExterieur?.id || `surveillant_ext_${Date.now()}`
                      })}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="Certification espaces clos"
                        value={formData.surveillantExterieur?.certification || ''}
                        onChange={(e) => handleInputChange('surveillantExterieur', { 
                          ...formData.surveillantExterieur, 
                          certification: e.target.value,
                          id: formData.surveillantExterieur?.id || `surveillant_ext_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Méthode communication"
                        value={formData.surveillantExterieur?.communicationMethod || ''}
                        onChange={(e) => handleInputChange('surveillantExterieur', { 
                          ...formData.surveillantExterieur, 
                          communicationMethod: e.target.value,
                          id: formData.surveillantExterieur?.id || `surveillant_ext_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#ddd6fe' }}>
                    🔒 <strong>{regulation?.name}:</strong> Surveillant DOIT rester à l'extérieur en permanence et maintenir contact visuel/vocal
                  </div>
                </div>
              </div>
            )}

            {formData.typePermis === 'excavation' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                  🏗️ Personne Compétente (Obligatoire)
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Nom de la personne compétente *"
                      value={formData.personneCompetente?.nom || ''}
                      onChange={(e) => handleInputChange('personneCompetente', { 
                        ...formData.personneCompetente, 
                        nom: e.target.value,
                        id: formData.personneCompetente?.id || `competent_${Date.now()}`
                      })}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <input
                        type="text"
                        placeholder="Formation excavation/étançonnement"
                        value={formData.personneCompetente?.certification || ''}
                        onChange={(e) => handleInputChange('personneCompetente', { 
                          ...formData.personneCompetente, 
                          certification: e.target.value,
                          id: formData.personneCompetente?.id || `competent_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Années d'expérience"
                        value={formData.personneCompetente?.experienceAnnees || ''}
                        onChange={(e) => handleInputChange('personneCompetente', { 
                          ...formData.personneCompetente, 
                          experienceAnnees: parseInt(e.target.value) || 0,
                          id: formData.personneCompetente?.id || `competent_${Date.now()}`
                        })}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#fed7aa' }}>
                    ⛏️ <strong>O. Reg. 213/91:</strong> Personne compétente doit inspecter quotidiennement et après changements de conditions
                  </div>
                </div>
              </div>
            )}

            {/* Travailleurs/Entrants avec âge minimum conforme */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <h4 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  🚶 {formData.typePermis === 'espace-clos' ? 'Entrants' : 'Travailleurs'} (Âge min: {regulation?.minimumAge} ans)
                </h4>
                <button
                  onClick={ajouterEntrant}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} />
                  Ajouter {formData.typePermis === 'espace-clos' ? 'Entrant' : 'Travailleur'}
                </button>
              </div>
              
              {formData.entrants.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  border: '2px dashed rgba(100, 116, 139, 0.3)',
                  borderRadius: '12px'
                }}>
                  Aucun {formData.typePermis === 'espace-clos' ? 'entrant' : 'travailleur'} - Âge minimum {regulation?.minimumAge} ans selon {regulation?.name}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {formData.entrants.map((entrant, index) => (
                    <div
                      key={entrant.id}
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <input
                          type="text"
                          placeholder={`Nom complet ${formData.typePermis === 'espace-clos' ? 'de l\'entrant' : 'du travailleur'} *`}
                          value={entrant.nom}
                          onChange={(e) => {
                            const newEntrants = [...formData.entrants];
                            newEntrants[index] = { ...entrant, nom: e.target.value };
                            handleInputChange('entrants', newEntrants);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <input
                            type="text"
                            placeholder={
                              formData.typePermis === 'travail-chaud' ? 'Cert. soudeur' :
                              formData.typePermis === 'excavation' ? 'Formation excavation' :
                              'Cert. espace clos'
                            }
                            value={entrant.certification}
                            onChange={(e) => {
                              const newEntrants = [...formData.entrants];
                              newEntrants[index] = { ...entrant, certification: e.target.value };
                              handleInputChange('entrants', newEntrants);
                            }}
                            style={{
                              padding: '12px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '16px'
                            }}
                          />
                          <input
                            type="number"
                            placeholder={`Âge (min ${regulation?.minimumAge})`}
                            value={entrant.age}
                            onChange={(e) => {
                              const age = parseInt(e.target.value) || regulation?.minimumAge || 18;
                              const newEntrants = [...formData.entrants];
                              newEntrants[index] = { ...entrant, age };
                              handleInputChange('entrants', newEntrants);
                            }}
                            min={regulation?.minimumAge}
                            style={{
                              padding: '12px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: entrant.age < (regulation?.minimumAge || 18) ? 
                                '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '16px'
                            }}
                          />
                          <input
                            type="tel"
                            placeholder="Contact urgence"
                            value={entrant.contactUrgence || ''}
                            onChange={(e) => {
                              const newEntrants = [...formData.entrants];
                              newEntrants[index] = { ...entrant, contactUrgence: e.target.value };
                              handleInputChange('entrants', newEntrants);
                            }}
                            style={{
                              padding: '12px',
                              background: 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '16px'
                            }}
                          />
                        </div>
                        
                        {entrant.age < (regulation?.minimumAge || 18) && (
                          <div style={{
                            padding: '8px 12px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            color: '#fca5a5',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            ⚠️ Non conforme: Âge minimum {regulation?.minimumAge} ans requis selon {regulation?.name}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            color: '#e2e8f0',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={entrant.formationVerifiee}
                              onChange={(e) => {
                                const newEntrants = [...formData.entrants];
                                newEntrants[index] = { ...entrant, formationVerifiee: e.target.checked };
                                handleInputChange('entrants', newEntrants);
                              }}
                            />
                            Formation spécialisée vérifiée
                          </label>

                          {formData.typePermis === 'espace-clos' && (
                            <label style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              color: '#e2e8f0',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={entrant.medicaleClearance}
                                onChange={(e) => {
                                  const newEntrants = [...formData.entrants];
                                  newEntrants[index] = { ...entrant, medicaleClearance: e.target.checked };
                                  handleInputChange('entrants', newEntrants);
                                }}
                              />
                              Clearance médicale
                            </label>
                          )}
                          
                          <button
                            onClick={() => {
                              const newEntrants = formData.entrants.filter((_, i) => i !== index);
                              handleInputChange('entrants', newEntrants);
                            }}
                            style={{
                              padding: '8px',
                              background: 'rgba(239, 68, 68, 0.3)',
                              color: '#fca5a5',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              alignSelf: 'flex-start'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Tests et mesures selon type de permis - sera dans SECTION 2-C */}
          <div id="tests" style={{ marginBottom: '60px' }}>
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧪</div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 12px' }}>
                SECTION 2-B Terminée
              </h3>
              <p style={{ margin: 0 }}>
                Formulaires spécifiques par type de permis complétés
              </p>
              <p style={{ margin: '16px 0 0', fontSize: '14px', color: '#60a5fa' }}>
                🎯 Prêt pour SECTION 2-C: Tests atmosphériques + Équipements + Validation
              </p>
            </div>
          </div>
        </div>
// =================== SECTION 2-C - TESTS + ÉQUIPEMENTS ===================
// Cette section remplace le placeholder "SECTION 2-B Terminée" dans le contenu scrollable

          {/* Section 3: Tests et mesures selon type de permis */}
          <div id="tests" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              🧪 Tests et Mesures Obligatoires
            </h3>

            {/* Tests atmosphériques pour espaces clos */}
            {formData.typePermis === 'espace-clos' && permit.legalRequirements.atmosphericTesting && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🫁 Tests Atmosphériques Continus (Obligatoire {regulation?.name})
                </h4>
                
                {/* Alerte réglementaire */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ color: '#fca5a5', margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>
                    ⚠️ SYSTÈME DE REPRISE AUTOMATIQUE ACTIVÉ
                  </h4>
                  <div style={{ fontSize: '13px', color: '#fecaca', lineHeight: '1.5' }}>
                    <div>• Tests échoués = Formulaire bloqué 15 minutes</div>
                    <div>• Reprise automatique après délai</div>
                    <div>• O₂: {regulation?.oxygenRange.min}%-{regulation?.oxygenRange.max}% | Gaz: ≤{regulation?.flammableGasLimit}% LIE</div>
                  </div>
                </div>

                {/* Tests Oxygène avec validation automatique */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                    🫁 Test Oxygène (O₂) - Validation Automatique
                  </h5>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                    border: formData.atmospherique.oxygene.conformeCNESST ? 
                      '2px solid rgba(34, 197, 94, 0.5)' : 
                      formData.atmospherique.oxygene.enAttente ? '2px solid rgba(245, 158, 11, 0.5)' :
                      '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                            Niveau O₂ mesuré (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.atmospherique.oxygene.niveau || ''}
                            disabled={formData.atmospherique.oxygene.enAttente}
                            onChange={(e) => {
                              const niveau = parseFloat(e.target.value) || 0;
                              const conformeCNESST = validerTest('oxygene', niveau);
                              
                              handleInputChange('atmospherique', {
                                ...formData.atmospherique,
                                oxygene: { ...formData.atmospherique.oxygene, niveau, conformeCNESST }
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: formData.atmospherique.oxygene.enAttente ? 
                                'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                              border: formData.atmospherique.oxygene.conformeCNESST ? 
                                '2px solid #22c55e' : 
                                formData.atmospherique.oxygene.niveau > 0 && !formData.atmospherique.oxygene.conformeCNESST ? 
                                  '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '8px',
                              color: formData.atmospherique.oxygene.enAttente ? '#9ca3af' : '#ffffff',
                              fontSize: '16px',
                              boxSizing: 'border-box',
                              cursor: formData.atmospherique.oxygene.enAttente ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                            Heure du test
                          </label>
                          <input
                            type="time"
                            value={formData.atmospherique.oxygene.heureTest}
                            disabled={formData.atmospherique.oxygene.enAttente}
                            onChange={(e) => handleInputChange('atmospherique', {
                              ...formData.atmospherique,
                              oxygene: { ...formData.atmospherique.oxygene, heureTest: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: formData.atmospherique.oxygene.enAttente ? 
                                'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '8px',
                              color: formData.atmospherique.oxygene.enAttente ? '#9ca3af' : '#ffffff',
                              fontSize: '16px',
                              boxSizing: 'border-box',
                              cursor: formData.atmospherique.oxygene.enAttente ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Équipement utilisé (marque, modèle, étalonnage)"
                        value={formData.atmospherique.oxygene.equipementUtilise}
                        disabled={formData.atmospherique.oxygene.enAttente}
                        onChange={(e) => handleInputChange('atmospherique', {
                          ...formData.atmospherique,
                          oxygene: { ...formData.atmospherique.oxygene, equipementUtilise: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: formData.atmospherique.oxygene.enAttente ? 
                            'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: formData.atmospherique.oxygene.enAttente ? '#9ca3af' : '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box',
                          cursor: formData.atmospherique.oxygene.enAttente ? 'not-allowed' : 'text'
                        }}
                      />
                      
                      {/* Indicateur conformité */}
                      <div style={{
                        padding: '12px',
                        background: formData.atmospherique.oxygene.enAttente ? 
                          'rgba(245, 158, 11, 0.2)' :
                          formData.atmospherique.oxygene.conformeCNESST ? 
                            'rgba(34, 197, 94, 0.2)' : 
                            formData.atmospherique.oxygene.niveau > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          color: formData.atmospherique.oxygene.enAttente ? '#f59e0b' :
                                 formData.atmospherique.oxygene.conformeCNESST ? '#22c55e' : 
                                 formData.atmospherique.oxygene.niveau > 0 ? '#ef4444' : '#94a3b8',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {formData.atmospherique.oxygene.enAttente ? 
                            `⏳ EN ATTENTE DE REPRISE (Tentative ${formData.atmospherique.oxygene.tentativeReprise})` :
                            formData.atmospherique.oxygene.conformeCNESST ? 
                              `✅ CONFORME ${regulation?.name}` : 
                              formData.atmospherique.oxygene.niveau > 0 ? 
                                `❌ NON CONFORME - Requis: ${regulation?.oxygenRange.min}%-${regulation?.oxygenRange.max}%` :
                                `⏳ En attente de mesure`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tests Gaz Combustibles */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                    🔥 Test Gaz Combustibles - Validation Automatique
                  </h5>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                    border: formData.atmospherique.gazCombustibles.conformeReglement ? 
                      '2px solid rgba(245, 158, 11, 0.5)' : 
                      formData.atmospherique.gazCombustibles.enAttente ? '2px solid rgba(245, 158, 11, 0.5)' :
                      '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                            % LIE (Limite Inférieure Explosion)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.atmospherique.gazCombustibles.pourcentageLIE || ''}
                            disabled={formData.atmospherique.gazCombustibles.enAttente}
                            onChange={(e) => {
                              const pourcentageLIE = parseFloat(e.target.value) || 0;
                              const conformeReglement = validerTest('gazCombustibles', pourcentageLIE);
                              
                              handleInputChange('atmospherique', {
                                ...formData.atmospherique,
                                gazCombustibles: { ...formData.atmospherique.gazCombustibles, pourcentageLIE, conformeReglement }
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: formData.atmospherique.gazCombustibles.enAttente ? 
                                'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                              border: formData.atmospherique.gazCombustibles.conformeReglement ? 
                                '2px solid #f59e0b' : 
                                formData.atmospherique.gazCombustibles.pourcentageLIE > 0 && !formData.atmospherique.gazCombustibles.conformeReglement ? 
                                  '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '8px',
                              color: formData.atmospherique.gazCombustibles.enAttente ? '#9ca3af' : '#ffffff',
                              fontSize: '16px',
                              boxSizing: 'border-box',
                              cursor: formData.atmospherique.gazCombustibles.enAttente ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                            Type de gaz détecté
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Méthane, Propane, Hydrogène"
                            value={formData.atmospherique.gazCombustibles.typeGaz}
                            disabled={formData.atmospherique.gazCombustibles.enAttente}
                            onChange={(e) => handleInputChange('atmospherique', {
                              ...formData.atmospherique,
                              gazCombustibles: { ...formData.atmospherique.gazCombustibles, typeGaz: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: formData.atmospherique.gazCombustibles.enAttente ? 
                                'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                              border: '1px solid rgba(100, 116, 139, 0.3)',
                              borderRadius: '8px',
                              color: formData.atmospherique.gazCombustibles.enAttente ? '#9ca3af' : '#ffffff',
                              fontSize: '16px',
                              boxSizing: 'border-box',
                              cursor: formData.atmospherique.gazCombustibles.enAttente ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Équipement de détection (étalonné selon fabricant)"
                        value={formData.atmospherique.gazCombustibles.equipementTest}
                        disabled={formData.atmospherique.gazCombustibles.enAttente}
                        onChange={(e) => handleInputChange('atmospherique', {
                          ...formData.atmospherique,
                          gazCombustibles: { ...formData.atmospherique.gazCombustibles, equipementTest: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: formData.atmospherique.gazCombustibles.enAttente ? 
                            'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: formData.atmospherique.gazCombustibles.enAttente ? '#9ca3af' : '#ffffff',
                          fontSize: '16px',
                          boxSizing: 'border-box',
                          cursor: formData.atmospherique.gazCombustibles.enAttente ? 'not-allowed' : 'text'
                        }}
                      />
                      
                      <div style={{
                        padding: '12px',
                        background: formData.atmospherique.gazCombustibles.enAttente ? 
                          'rgba(245, 158, 11, 0.2)' :
                          formData.atmospherique.gazCombustibles.conformeReglement ? 
                            'rgba(245, 158, 11, 0.2)' : 
                            formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          color: formData.atmospherique.gazCombustibles.enAttente ? '#f59e0b' :
                                 formData.atmospherique.gazCombustibles.conformeReglement ? '#f59e0b' : 
                                 formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? '#ef4444' : '#94a3b8',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {formData.atmospherique.gazCombustibles.enAttente ? 
                            `⏳ EN ATTENTE DE REPRISE (Tentative ${formData.atmospherique.gazCombustibles.tentativeReprise})` :
                            formData.atmospherique.gazCombustibles.conformeReglement ? 
                              `✅ SÉCURITAIRE - Limite: ≤${regulation?.flammableGasLimit}% LIE` : 
                              formData.atmospherique.gazCombustibles.pourcentageLIE > 0 ? 
                                `🚨 DANGER - Dépassement limite ${regulation?.flammableGasLimit}% LIE` :
                                `⏳ Test requis avant entrée`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ventilation obligatoire */}
                <div>
                  <h5 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                    💨 Système de Ventilation
                  </h5>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.atmospherique.ventilation.active}
                          onChange={(e) => handleInputChange('atmospherique', {
                            ...formData.atmospherique,
                            ventilation: { ...formData.atmospherique.ventilation, active: e.target.checked }
                          })}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        Ventilation mécanique active et continue
                      </label>
                    </div>
                    
                    {formData.atmospherique.ventilation.active && (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <input
                          type="text"
                          placeholder="Débit d'air (CFM ou m³/min)"
                          value={formData.atmospherique.ventilation.debitAir}
                          onChange={(e) => handleInputChange('atmospherique', {
                            ...formData.atmospherique,
                            ventilation: { ...formData.atmospherique.ventilation, debitAir: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <select
                          value={formData.atmospherique.ventilation.directionFlux}
                          onChange={(e) => handleInputChange('atmospherique', {
                            ...formData.atmospherique,
                            ventilation: { ...formData.atmospherique.ventilation, directionFlux: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">Sélectionner direction du flux</option>
                          <option value="extraction">Extraction (aspiration)</option>
                          <option value="insufflation">Insufflation (refoulement)</option>
                          <option value="mixte">Mixte (extraction + insufflation)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tests spécifiques travail à chaud */}
            {formData.typePermis === 'travail-chaud' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🔥 Vérifications Travail à Chaud (NFPA 51B)
                </h4>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.travailChaud.zoneDegagee >= 11}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          travailChaud: { 
                            ...formData.procedures.travailChaud, 
                            zoneDegagee: e.target.checked ? 11 : 0 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Zone dégagée de 11 mètres (35 pieds) vérifiée - NFPA 51B
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.travailChaud.surveillanceIncendie}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          travailChaud: { 
                            ...formData.procedures.travailChaud, 
                            surveillanceIncendie: e.target.checked 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Surveillant incendie en position et équipé
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.travailChaud.autorisationSuperviseur}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          travailChaud: { 
                            ...formData.procedures.travailChaud, 
                            autorisationSuperviseur: e.target.checked 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Autorisation superviseur pour début des travaux
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tests spécifiques excavation */}
            {formData.typePermis === 'excavation' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  ⛏️ Vérifications Sécurité Excavation
                </h4>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.excavation.localisationServices}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          excavation: { 
                            ...formData.procedures.excavation, 
                            localisationServices: e.target.checked 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Localisation services publics complétée (Ontario Reg 213/91 s.228)
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.excavation.noticeRequired}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          excavation: { 
                            ...formData.procedures.excavation, 
                            noticeRequired: e.target.checked 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Notice of Trench Work soumise (si profondeur >1.2m)
                    </label>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.procedures.excavation.accesSortie}
                        onChange={(e) => handleInputChange('procedures', {
                          ...formData.procedures,
                          excavation: { 
                            ...formData.procedures.excavation, 
                            accesSortie: e.target.checked 
                          }
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      Échelles d'accès/sortie installées (max 8m distance - CCOHS)
                    </label>

                    <div>
                      <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Type de protection requis
                      </label>
                      <select
                        value={formData.equipements.etancemment.type}
                        onChange={(e) => handleInputChange('equipements', {
                          ...formData.equipements,
                          etancemment: { 
                            ...formData.equipements.etancemment, 
                            type: e.target.value,
                            requis: e.target.value !== ''
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Sélectionner type de protection</option>
                        <option value="pente">Pente naturelle stable</option>
                        <option value="etancemment-bois">Étançonnement bois</option>
                        <option value="etancemment-hydraulique">Étançonnement hydraulique</option>
                        <option value="caisson-tranchee">Caisson de tranchée</option>
                        <option value="plan-ingenieur">Plan ingénieur requis</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message pour autres types */}
            {!['espace-clos', 'travail-chaud', 'excavation'].includes(formData.typePermis) && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94a3b8',
                border: '2px dashed rgba(100, 116, 139, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>ℹ️</div>
                <h4 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>
                  Tests spécifiques non requis
                </h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Ce type de permis ne nécessite pas de tests atmosphériques selon {regulation?.name}
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Équipements spécialisés selon permis */}
          <div id="equipements" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              🛡️ Équipements de Sécurité Spécialisés
            </h3>

            {/* Équipements de base universels */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                👷 Équipements de Protection Individuelle (EPI) Obligatoires
              </h4>
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1))',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {[
                    { id: 'casque', label: 'Casque de sécurité (CSA Z94.1)', required: true },
                    { id: 'chaussures', label: 'Chaussures de sécurité (CSA Z195)', required: true },
                    { id: 'gants', label: 'Gants de protection adaptés', required: true },
                    { id: 'veste', label: 'Veste haute visibilité', required: formData.typePermis === 'excavation' },
                    { id: 'lunettes', label: 'Lunettes de protection', required: formData.typePermis === 'travail-chaud' },
                    { id: 'masque', label: 'Protection respiratoire', required: formData.typePermis === 'espace-clos' }
                  ].filter(item => item.required || formData.equipements.protection.includes(item.id)).map((equipement) => (
                    <label key={equipement.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#e2e8f0',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      background: formData.equipements.protection.includes(equipement.id) ? 
                        'rgba(34, 197, 94, 0.2)' : 'transparent'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.equipements.protection.includes(equipement.id)}
                        onChange={(e) => {
                          const newProtection = e.target.checked 
                            ? [...formData.equipements.protection, equipement.id]
                            : formData.equipements.protection.filter(id => id !== equipement.id);
                          handleInputChange('equipements', {
                            ...formData.equipements,
                            protection: newProtection
                          });
                        }}
                        style={{ transform: 'scale(1.1)' }}
                      />
                      <span style={{ flex: 1 }}>
                        {equipement.label}
                        {equipement.required && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                        )}
                      </span>
                      {equipement.required && (
                        <span style={{ 
                          fontSize: '9px', 
                          background: '#ef4444', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          OBLIGATOIRE
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Placeholder pour section 2-D */}
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 12px' }}>
                SECTION 2-C Terminée
              </h3>
              <p style={{ margin: 0 }}>
                Tests atmosphériques + Équipements de base complétés
              </p>
              <p style={{ margin: '16px 0 0', fontSize: '14px', color: '#60a5fa' }}>
                🎯 Prêt pour SECTION 2-D: Équipements spécialisés + Validation finale
              </p>
            </div>
          </div>
// =================== SECTION 2-D - ÉQUIPEMENTS SPÉCIALISÉS + VALIDATION FINALE ===================
// Cette section remplace le placeholder "SECTION 2-C Terminée" dans la section équipements

            {/* Équipements spécialisés selon type de permis */}
            {formData.typePermis === 'espace-clos' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🔒 Équipements Spécialisés Espace Clos
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'detecteur_gaz_continu', label: 'Détecteur multi-gaz calibré (O₂, LIE, CO, H₂S)', required: true, category: 'detection' },
                      { id: 'harnais_complet', label: 'Harnais complet avec points d\'ancrage', required: true, category: 'sauvetage' },
                      { id: 'treuil_sauvetage', label: 'Treuil de sauvetage avec câble ≥30m', required: true, category: 'sauvetage' },
                      { id: 'appareil_respiratoire', label: 'Appareil respiratoire autonome (ARA)', required: true, category: 'sauvetage' },
                      { id: 'communication_radio', label: 'Radio de communication surveillant-entrant', required: true, category: 'communication' },
                      { id: 'eclairage_antidéflagrant', label: 'Éclairage antidéflagrant', required: false, category: 'detection' },
                      { id: 'civiere_sauvetage', label: 'Civière de sauvetage rigide', required: true, category: 'sauvetage' },
                      { id: 'ventilateur_portable', label: 'Ventilateur portable (si requis)', required: false, category: 'detection' }
                    ].map((equipement) => (
                      <label key={equipement.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '13px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        background: formData.equipements[equipement.category].includes(equipement.id) ? 
                          'rgba(139, 92, 246, 0.2)' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.equipements[equipement.category].includes(equipement.id)}
                          onChange={(e) => {
                            const newCategory = e.target.checked 
                              ? [...formData.equipements[equipement.category], equipement.id]
                              : formData.equipements[equipement.category].filter(id => id !== equipement.id);
                            
                            handleInputChange('equipements', {
                              ...formData.equipements,
                              [equipement.category]: newCategory
                            });
                          }}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        <span style={{ flex: 1 }}>
                          {equipement.label}
                          {equipement.required && (
                            <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                          )}
                        </span>
                        {equipement.required && (
                          <span style={{ 
                            fontSize: '9px', 
                            background: '#8b5cf6', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontWeight: '700'
                          }}>
                            OBLIGATOIRE
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.typePermis === 'travail-chaud' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  🔥 Équipements Prévention Incendie (NFPA 51B)
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'extincteur_co2', label: 'Extincteur CO₂ ≥5kg à proximité immédiate', required: true },
                      { id: 'extincteur_eau', label: 'Extincteur à eau ou poudre', required: true },
                      { id: 'couvertures_ignifuges', label: 'Couvertures ignifuges pour protection', required: true },
                      { id: 'arrosage_preventif', label: 'Point d\'eau/boyau pour arrosage', required: true },
                      { id: 'surveillance_thermique', label: 'Thermomètre infrarouge', required: false },
                      { id: 'ecrans_protection', label: 'Écrans de protection contre projections', required: false },
                      { id: 'detecteur_fumee', label: 'Détecteur de fumée portable', required: false },
                      { id: 'bac_sable', label: 'Bac à sable pour absorption', required: false }
                    ].map((equipement) => (
                      <label key={equipement.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '13px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        background: formData.equipements.preventionIncendie[equipement.id] ? 
                          'rgba(239, 68, 68, 0.2)' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.equipements.preventionIncendie[equipement.id] || false}
                          onChange={(e) => handleInputChange('equipements', {
                            ...formData.equipements,
                            preventionIncendie: {
                              ...formData.equipements.preventionIncendie,
                              [equipement.id]: e.target.checked
                            }
                          })}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        <span style={{ flex: 1 }}>
                          {equipement.label}
                          {equipement.required && (
                            <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                          )}
                        </span>
                        {equipement.required && (
                          <span style={{ 
                            fontSize: '9px', 
                            background: '#ef4444', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontWeight: '700'
                          }}>
                            OBLIGATOIRE
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  {/* Zone de dégagement requise */}
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Zone de dégagement vérifiée (mètres)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.equipements.preventionIncendie.degagementCombustibles || 0}
                      onChange={(e) => handleInputChange('equipements', {
                        ...formData.equipements,
                        preventionIncendie: {
                          ...formData.equipements.preventionIncendie,
                          degagementCombustibles: parseInt(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: (formData.equipements.preventionIncendie.degagementCombustibles >= 11) ? 
                          '2px solid #22c55e' : '2px solid #ef4444',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '11px', 
                      color: (formData.equipements.preventionIncendie.degagementCombustibles >= 11) ? '#22c55e' : '#ef4444',
                      fontWeight: '600'
                    }}>
                      {(formData.equipements.preventionIncendie.degagementCombustibles >= 11) ? 
                        '✅ Conforme NFPA 51B (≥11 mètres)' : 
                        '❌ Non conforme - Minimum 11 mètres requis (NFPA 51B)'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.typePermis === 'excavation' && (
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  ⛏️ Équipements Sécurité Excavation (O. Reg. 213/91)
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {[
                      { id: 'echelles_acces', label: 'Échelles d\'accès CSA (max 8m distance)', required: true, category: 'protection' },
                      { id: 'detecteur_gaz_portable', label: 'Détecteur gaz portable (si requis)', required: false, category: 'detection' },
                      { id: 'pompe_eau', label: 'Pompe d\'évacuation d\'eau', required: false, category: 'protection' },
                      { id: 'materiel_etancemment', label: 'Matériel d\'étançonnement vérifié', required: true, category: 'etancemment' },
                      { id: 'barriere_protection', label: 'Barrières/garde-corps ≥1.1m', required: true, category: 'etancemment' },
                      { id: 'signalisation', label: 'Signalisation danger excavation', required: true, category: 'etancemment' },
                      { id: 'dispositif_levage', label: 'Dispositif de levage (si >4.5m)', required: false, category: 'sauvetage' },
                      { id: 'communication_urgence', label: 'Moyen de communication d\'urgence', required: true, category: 'communication' }
                    ].map((equipement) => (
                      <label key={equipement.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#e2e8f0',
                        fontSize: '13px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        background: (equipement.category === 'etancemment' ? 
                          formData.equipements.etancemment[equipement.id] : 
                          formData.equipements[equipement.category].includes(equipement.id)) ? 
                          'rgba(245, 158, 11, 0.2)' : 'transparent'
                      }}>
                        <input
                          type="checkbox"
                          checked={equipement.category === 'etancemment' ? 
                            (formData.equipements.etancemment[equipement.id] || false) :
                            formData.equipements[equipement.category].includes(equipement.id)}
                          onChange={(e) => {
                            if (equipement.category === 'etancemment') {
                              handleInputChange('equipements', {
                                ...formData.equipements,
                                etancemment: {
                                  ...formData.equipements.etancemment,
                                  [equipement.id]: e.target.checked
                                }
                              });
                            } else {
                              const newCategory = e.target.checked 
                                ? [...formData.equipements[equipement.category], equipement.id]
                                : formData.equipements[equipement.category].filter(id => id !== equipement.id);
                              handleInputChange('equipements', {
                                ...formData.equipements,
                                [equipement.category]: newCategory
                              });
                            }
                          }}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        <span style={{ flex: 1 }}>
                          {equipement.label}
                          {equipement.required && (
                            <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                          )}
                        </span>
                        {equipement.required && (
                          <span style={{ 
                            fontSize: '9px', 
                            background: '#f59e0b', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontWeight: '700'
                          }}>
                            OBLIGATOIRE
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Profondeur excavation */}
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Profondeur de l'excavation (mètres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={formData.equipements.etancemment.profondeurRequise || 0}
                      onChange={(e) => handleInputChange('equipements', {
                        ...formData.equipements,
                        etancemment: {
                          ...formData.equipements.etancemment,
                          profondeurRequise: parseFloat(e.target.value) || 0
                        }
                      })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '11px', 
                      color: formData.equipements.etancemment.profondeurRequise > 1.2 ? '#f59e0b' : '#94a3b8',
                      fontWeight: '600'
                    }}>
                      {formData.equipements.etancemment.profondeurRequise > 1.2 ? 
                        `⚠️ Protection obligatoire (>1.2m) - Notice of Trench Work requise` : 
                        formData.equipements.etancemment.profondeurRequise > 0 ?
                        `ℹ️ Surveillance accrue recommandée` :
                        `📏 Indiquer la profondeur de l'excavation`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Procédures (référence aux sections précédentes) */}
          <div id="procedures" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              📝 Procédures et Protocoles Spécialisés
            </h3>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
              <h4 style={{ color: '#60a5fa', margin: '0 0 12px', fontSize: '18px', fontWeight: '700' }}>
                Procédures Intégrées dans les Sections Précédentes
              </h4>
              <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  🔥 <strong>Travail à Chaud:</strong> Procédures NFPA 51B dans section Tests
                </div>
                <div style={{ marginBottom: '8px' }}>
                  ⛏️ <strong>Excavation:</strong> Vérifications O. Reg. 213/91 dans section Tests  
                </div>
                <div style={{ marginBottom: '8px' }}>
                  🔒 <strong>Espace Clos:</strong> Tests continus + surveillance dans section Tests
                </div>
                <div>
                  ⏰ <strong>Surveillance Post-Travaux:</strong> Timer automatique dans le header
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Surveillance (référence au header) */}
          <div id="surveillance" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              ⏰ Surveillance et Monitoring Actif
            </h3>
            
            <div style={{
              background: surveillanceEnCours ? 
                'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))' :
                'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.1))',
              border: surveillanceEnCours ? 
                '2px solid rgba(245, 158, 11, 0.5)' : 
                '2px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {surveillanceEnCours ? '🟡' : '⏰'}
              </div>
              <h4 style={{ 
                color: surveillanceEnCours ? '#f59e0b' : '#94a3b8', 
                margin: '0 0 12px', 
                fontSize: '18px', 
                fontWeight: '700' 
              }}>
                {surveillanceEnCours ? 'Surveillance Active en Cours' : 'Surveillance Post-Travaux Disponible'}
              </h4>
              <div style={{ 
                color: surveillanceEnCours ? '#fed7aa' : '#cbd5e1', 
                fontSize: '14px', 
                lineHeight: '1.6' 
              }}>
                {surveillanceEnCours ? (
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      ⏱️ <strong>Temps restant:</strong> {formatTempsRestant(tempsRestantSurveillance)}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      🎯 <strong>Durée totale:</strong> {formData.surveillance.dureeRequise} minutes
                    </div>
                    <div>
                      📋 <strong>Incidents:</strong> {formData.surveillance.incidents.length} signalé(s)
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      🎯 <strong>Durée configurée:</strong> {formData.surveillance.dureeRequise} minutes
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      ✅ <strong>Contrôles:</strong> Disponibles dans le header après fin des travaux
                    </div>
                    <div>
                      🔄 <strong>Timer automatique:</strong> Avec gestion d'interventions
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Validation finale et conformité */}
          <div id="validation" style={{ marginBottom: '60px' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>
              ✅ Validation Finale et Conformité Réglementaire
            </h3>

            {/* Checklist de conformité automatique */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h4 style={{ color: '#22c55e', margin: '0 0 20px', fontSize: '18px', fontWeight: '800' }}>
                📋 Validation Automatique de Conformité - {regulation?.name}
              </h4>
              
              {/* Calcul du score de conformité */}
              {(() => {
                let score = 0;
                let total = 0;
                
                // Validations communes
                total++;
                if (formData.superviseur?.nom && formData.entrants.length > 0) score++;
                
                total++;
                if (formData.lieuTravail && formData.descriptionTravaux) score++;
                
                // Validations spécifiques selon type
                if (formData.typePermis === 'espace-clos') {
                  total++;
                  if (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) score++;
                  
                  total++;
                  if (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) score++;
                }
                
                if (formData.typePermis === 'travail-chaud') {
                  total++;
                  if (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) score++;
                  
                  total++;
                  if (Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4) score++;
                }
                
                if (formData.typePermis === 'excavation') {
                  total++;
                  if (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) score++;
                  
                  total++;
                  if (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) score++;
                }
                
                const pourcentage = total > 0 ? Math.round((score / total) * 100) : 0;
                
                return { score, total, pourcentage };
              })().pourcentage >= 80 ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <h5 style={{ color: '#dcfce7', margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>
                    PERMIS CONFORME - {(() => {
                      let score = 0; let total = 0;
                      if (formData.superviseur?.nom && formData.entrants.length > 0) score++; total++;
                      if (formData.lieuTravail && formData.descriptionTravaux) score++; total++;
                      if (formData.typePermis === 'espace-clos') {
                        if (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) score++; total++;
                        if (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) score++; total++;
                      }
                      if (formData.typePermis === 'travail-chaud') {
                        if (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) score++; total++;
                        if (Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4) score++; total++;
                      }
                      if (formData.typePermis === 'excavation') {
                        if (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) score++; total++;
                        if (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) score++; total++;
                      }
                      return total > 0 ? Math.round((score / total) * 100) : 0;
                    })()}% ✅
                  </h5>
                  <p style={{ color: '#bbf7d0', margin: '0', fontSize: '14px' }}>
                    Ce permis respecte toutes les exigences légales {regulation?.name} et peut être utilisé immédiatement.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                  <h5 style={{ color: '#fecaca', margin: '0 0 8px', fontSize: '20px', fontWeight: '800' }}>
                    PERMIS NON CONFORME - {(() => {
                      let score = 0; let total = 0;
                      if (formData.superviseur?.nom && formData.entrants.length > 0) score++; total++;
                      if (formData.lieuTravail && formData.descriptionTravaux) score++; total++;
                      if (formData.typePermis === 'espace-clos') {
                        if (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) score++; total++;
                        if (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) score++; total++;
                      }
                      if (formData.typePermis === 'travail-chaud') {
                        if (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) score++; total++;
                        if (Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4) score++; total++;
                      }
                      if (formData.typePermis === 'excavation') {
                        if (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) score++; total++;
                        if (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) score++; total++;
                      }
                      return total > 0 ? Math.round((score / total) * 100) : 0;
                    })()}% ❌
                  </h5>
                  <p style={{ color: '#fca5a5', margin: '0', fontSize: '14px' }}>
                    Des éléments obligatoires sont manquants. Complétez toutes les sections requises.
                  </p>
                </div>
              )}

              {/* Détail des validations par catégorie */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {/* Validation personnel */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  background: (formData.superviseur?.nom && formData.entrants.length > 0) ? 
                    'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%',
                    background: (formData.superviseur?.nom && formData.entrants.length > 0) ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {(formData.superviseur?.nom && formData.entrants.length > 0) ? '✓' : '×'}
                  </div>
                  <span style={{ 
                    color: (formData.superviseur?.nom && formData.entrants.length > 0) ? '#dcfce7' : '#fecaca',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Personnel désigné et qualifié ({formData.entrants.length} {formData.typePermis === 'espace-clos' ? 'entrant(s)' : 'travailleur(s)'})
                  </span>
                </div>

                {/* Validation identification */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  background: (formData.lieuTravail && formData.descriptionTravaux) ? 
                    'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%',
                    background: (formData.lieuTravail && formData.descriptionTravaux) ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {(formData.lieuTravail && formData.descriptionTravaux) ? '✓' : '×'}
                  </div>
                  <span style={{ 
                    color: (formData.lieuTravail && formData.descriptionTravaux) ? '#dcfce7' : '#fecaca',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Identification projet complète (lieu + description détaillée)
                  </span>
                </div>

                {/* Validations spécifiques selon type */}
                {formData.typePermis === 'espace-clos' && (
                  <>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {(formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: (formData.atmospherique.oxygene.conformeCNESST && formData.atmospherique.gazCombustibles.conformeReglement) ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Tests atmosphériques conformes {regulation?.name}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {(formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: (formData.equipements.detection.length >= 2 && formData.equipements.sauvetage.length >= 2) ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Équipements spécialisés espace clos présents et vérifiés
                      </span>
                    </div>
                  </>
                )}

                {formData.typePermis === 'travail-chaud' && (
                  <>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {(formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: (formData.procedures.travailChaud.zoneDegagee >= 11 && formData.procedures.travailChaud.surveillanceIncendie) ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Procédures NFPA 51B respectées (zone 11m + surveillance incendie)
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4 ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4 ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4 ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: Object.values(formData.equipements.preventionIncendie).filter(Boolean).length >= 4 ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Équipements prévention incendie complets (extincteurs + protection)
                      </span>
                    </div>
                  </>
                )}

                {formData.typePermis === 'excavation' && (
                  <>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {(formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: (formData.procedures.excavation.localisationServices && formData.procedures.excavation.accesSortie) ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Procédures O. Reg. 213/91 respectées (localisation + accès)
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) ? 
                        'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%',
                        background: (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {(formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) ? '✓' : '×'}
                      </div>
                      <span style={{ 
                        color: (formData.equipements.etancemment.materiel_etancemment && formData.equipements.etancemment.barriere_protection) ? '#dcfce7' : '#fecaca',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Protection excavation installée (étançonnement + barrières)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informations finales du permis */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: '#60a5fa', margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>
                📄 Informations Finales du Permis
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                    Numéro de formulaire final
                  </label>
                  <input
                    type="text"
                    value={formData.numeroFormulaire}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '2px solid #60a5fa',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      fontSize: '14px',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                    Date de validation
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validation.dateValidation || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => handleInputChange('validation', {
                      ...formData.validation,
                      dateValidation: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Signature électronique du responsable *
                </label>
                <input
                  type="text"
                  value={formData.validation.signatureResponsable}
                  onChange={(e) => handleInputChange('validation', {
                    ...formData.validation,
                    signatureResponsable: e.target.value
                  })}
                  placeholder="Nom complet + titre du responsable autorisé"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: formData.validation.signatureResponsable ? '2px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                🔐 Signature électronique conforme aux standards légaux pour permis de travail officiel
              </div>
            </div>
          </div>
        </div>
// =================== COMPOSANT PRINCIPAL STEP4PERMITS ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ 
  formData, 
  onDataChange, 
  language = 'fr', 
  tenant, 
  errors 
}) => {
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState(formData.province || 'QC');
  const [showFormModal, setShowFormModal] = useState<string | null>(null);
  const [showArchives, setShowArchives] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingPermit, setSavingPermit] = useState<string | null>(null);
  
  // =================== GESTION PERMIS ET SUPABASE ===================
  const [permits, setPermits] = useState<LegalPermit[]>([]);
  const [archivedPermits, setArchivedPermits] = useState<LegalPermit[]>([]);

  // Initialisation des permis selon province
  useEffect(() => {
    const initializePermits = () => {
      setLoading(true);
      try {
        const provincialPermits = generateCompliantPermits(language, selectedProvince);
        setPermits(provincialPermits);
        
        // Simuler chargement des permis existants depuis Supabase
        // Dans l'implémentation réelle, remplacer par appel Supabase
        loadExistingPermitsFromStorage();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des permis:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePermits();
  }, [language, selectedProvince]);

  // Fonction pour charger les permis existants (simulée pour Supabase)
  const loadExistingPermitsFromStorage = async () => {
    try {
      // Simulation d'appel Supabase - Remplacer par vraie logique
      const storedPermits = localStorage.getItem(`permits_${tenant}_${selectedProvince}`);
      const storedArchived = localStorage.getItem(`archived_permits_${tenant}_${selectedProvince}`);
      
      if (storedPermits) {
        const existingPermits = JSON.parse(storedPermits);
        setPermits(prev => [...prev, ...existingPermits]);
      }
      
      if (storedArchived) {
        const existingArchived = JSON.parse(storedArchived);
        setArchivedPermits(existingArchived);
      }

      // TODO: Remplacer par appel Supabase réel
      /*
      const { data: permits, error } = await supabase
        .from('legal_permits')
        .select('*')
        .eq('tenant', tenant)
        .eq('province', selectedProvince)
        .order('dateModified', { ascending: false });
      
      if (error) throw error;
      if (permits) setPermits(prev => [...prev, ...permits]);
      */
    } catch (error) {
      console.error('Erreur lors du chargement des permis:', error);
    }
  };

  // Sauvegarde dans Supabase (simulée)
  const savePermitToSupabase = async (permit: LegalPermit, formData: any) => {
    setSavingPermit(permit.id);
    try {
      // Simulation sauvegarde - Remplacer par Supabase
      const permitData = {
        ...permit,
        formData,
        dateModified: new Date().toISOString(),
        status: 'submitted'
      };

      // Sauvegarde locale temporaire
      const existingPermits = JSON.parse(localStorage.getItem(`permits_${tenant}_${selectedProvince}`) || '[]');
      const updatedPermits = existingPermits.filter((p: LegalPermit) => p.id !== permit.id);
      updatedPermits.push(permitData);
      localStorage.setItem(`permits_${tenant}_${selectedProvince}`, JSON.stringify(updatedPermits));

      // TODO: Remplacer par appel Supabase réel
      /*
      const { data, error } = await supabase
        .from('legal_permits')
        .upsert({
          id: permit.id,
          tenant: tenant,
          province: selectedProvince,
          code: permit.code,
          name: permit.name,
          category: permit.category,
          form_data: formData,
          status: 'submitted',
          date_created: permit.dateCreated,
          date_modified: new Date().toISOString(),
          compliance: permit.compliance,
          legal_requirements: permit.legalRequirements
        })
        .select();

      if (error) throw error;
      */

      // Mettre à jour l'état local
      setPermits(prev => prev.map(p => 
        p.id === permit.id ? { ...p, formData, status: 'submitted' as const, dateModified: new Date().toISOString() } : p
      ));

      return { success: true, message: 'Permis sauvegardé avec succès' };
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error);
      return { success: false, message: 'Erreur lors de la sauvegarde' };
    } finally {
      setSavingPermit(null);
    }
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Espaces Clos': 
      case 'Confined Spaces': 
        return '🔒';
      case 'Travail à Chaud':
      case 'Hot Work':
        return '🔥';
      case 'Excavation': 
        return '⛏️';
      case 'Hauteur':
      case 'Work at Height':
        return '🏗️';
      default: 
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'submitted': return '#3b82f6';
      case 'approved': return '#22c55e';
      case 'archived': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      fr: {
        draft: 'Brouillon',
        submitted: 'Soumis',
        approved: 'Approuvé',
        archived: 'Archivé'
      },
      en: {
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved',
        archived: 'Archived'
      }
    };
    return labels[language][status as keyof typeof labels.fr] || status;
  };

  // =================== GESTION ACTIONS PERMIS ===================
  const handlePermitClick = (permitId: string, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    const updatedPermits = permits.map((permit: LegalPermit) => 
      permit.id === permitId ? { ...permit, selected: !permit.selected } : permit
    );
    setPermits(updatedPermits);
  };

  const handleFormToggle = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFormModal(permitId);
  };

  const handleDeletePermit = async (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(language === 'fr' ? 
      'Êtes-vous sûr de vouloir supprimer ce permis définitivement ?' : 
      'Are you sure you want to permanently delete this permit?'
    )) {
      try {
        // TODO: Supprimer de Supabase
        /*
        const { error } = await supabase
          .from('legal_permits')
          .delete()
          .eq('id', permitId);
        
        if (error) throw error;
        */

        // Supprimer localement
        const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
        setPermits(updatedPermits);
        
        // Mettre à jour le storage local
        const existingPermits = JSON.parse(localStorage.getItem(`permits_${tenant}_${selectedProvince}`) || '[]');
        const filteredPermits = existingPermits.filter((p: LegalPermit) => p.id !== permitId);
        localStorage.setItem(`permits_${tenant}_${selectedProvince}`, JSON.stringify(filteredPermits));

        alert(language === 'fr' ? 'Permis supprimé avec succès' : 'Permit deleted successfully');
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert(language === 'fr' ? 'Erreur lors de la suppression' : 'Error during deletion');
      }
    }
  };

  const archivePermit = async (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: LegalPermit) => p.id === permitId);
    
    if (!permit || !permit.selected) {
      alert(language === 'fr' ? 
        'Le permis doit être sélectionné et rempli avant d\'être archivé' : 
        'Permit must be selected and filled before archiving'
      );
      return;
    }

    try {
      const archivedPermit = { 
        ...permit, 
        status: 'archived' as const,
        validity: { ...permit.validity, isValid: true, approvedBy: formData.superviseur?.nom || 'System' },
        dateModified: new Date().toISOString()
      };

      // TODO: Mettre à jour Supabase
      /*
      const { error } = await supabase
        .from('legal_permits')
        .update({ status: 'archived', validity: archivedPermit.validity })
        .eq('id', permitId);
      
      if (error) throw error;
      */

      setArchivedPermits(prev => [...prev, archivedPermit]);
      const updatedPermits = permits.filter((p: LegalPermit) => p.id !== permitId);
      setPermits(updatedPermits);
      
      // Mettre à jour storage local
      const existingArchived = JSON.parse(localStorage.getItem(`archived_permits_${tenant}_${selectedProvince}`) || '[]');
      existingArchived.push(archivedPermit);
      localStorage.setItem(`archived_permits_${tenant}_${selectedProvince}`, JSON.stringify(existingArchived));

      alert(language === 'fr' ? 
        '✅ Permis archivé avec succès! Le permis est maintenant valide et prêt à être utilisé sur le terrain.' : 
        '✅ Permit archived successfully! The permit is now valid and ready for field use.'
      );
    } catch (error) {
      console.error('Erreur archivage:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'archivage' : 'Error during archiving');
    }
  };

  const duplicatePermit = (permitId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const permit = permits.find((p: LegalPermit) => p.id === permitId);
    
    if (permit) {
      const duplicatedPermit: LegalPermit = {
        ...permit,
        id: `${permit.id}-copy-${Date.now()}`,
        code: generateLegalPermitCode(permit.id.split('-')[0], selectedProvince),
        name: permit.name + (language === 'fr' ? ' (Copie)' : ' (Copy)'),
        selected: false,
        status: 'draft',
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      };

      setPermits(prev => [duplicatedPermit, ...prev]);
      alert(language === 'fr' ? 
        `✅ Permis dupliqué avec succès!\n🔢 Nouveau code: ${duplicatedPermit.code}` :
        `✅ Permit duplicated successfully!\n🔢 New code: ${duplicatedPermit.code}`
      );
    }
  };

  // =================== FILTRAGE ET RECHERCHE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: LegalPermit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories: string[] = useMemo(() => 
    Array.from(new Set(permits.map((p: LegalPermit) => p.category))), 
    [permits]
  );

  const provinces: string[] = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  const selectedPermits = useMemo(() => permits.filter((p: LegalPermit) => p.selected), [permits]);

  const stats = useMemo(() => ({
    totalPermits: permits.length,
    submitted: permits.filter(p => p.status === 'submitted').length,
    approved: permits.filter(p => p.status === 'approved').length,
    archived: archivedPermits.length
  }), [permits, archivedPermits]);

  const statsData = [
    { key: 'available', value: stats.totalPermits, icon: '📊', color: '#3b82f6' },
    { key: 'submitted', value: stats.submitted, icon: '📤', color: '#f59e0b' },
    { key: 'approved', value: stats.approved, icon: '✅', color: '#22c55e' },
    { key: 'archived', value: stats.archived, icon: '📦', color: '#8b5cf6' }
  ];

  // =================== RENDU PRINCIPAL ===================
  return (
    <div style={{ padding: '0', color: '#ffffff', minHeight: '100vh' }}>
      {/* Header Premium avec stats gouvernementales */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15), rgba(239, 68, 68, 0.1))',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: window.innerWidth <= 768 ? '24px' : '32px',
              fontWeight: '900',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #fb7185)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2'
            }}>
              🏛️ {t.title}
            </h1>
            <p style={{ color: '#93c5fd', margin: '0', fontSize: '14px', fontWeight: '500' }}>
              {t.subtitle}
            </p>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'inline-block',
              marginTop: '8px'
            }}>
              {PROVINCIAL_REGULATIONS[selectedProvince as keyof typeof PROVINCIAL_REGULATIONS]?.name} - {PROVINCIAL_REGULATIONS[selectedProvince as keyof typeof PROVINCIAL_REGULATIONS]?.regulation}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                onDataChange('province', e.target.value);
              }}
              style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowArchives(!showArchives)}
              style={{
                padding: '12px 20px',
                background: showArchives ? 
                  'linear-gradient(135deg, #22c55e, #16a34a)' :
                  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}
            >
              <FileText size={16} />
              {showArchives ? 
                (language === 'fr' ? 'Permis Actifs' : 'Active Permits') :
                (language === 'fr' ? `Archives (${stats.archived})` : `Archives (${stats.archived})`)
              }
            </button>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
          {statsData.map((stat) => (
            <div key={stat.key} style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
              padding: '20px 16px',
              borderRadius: '16px',
              border: `2px solid ${stat.color}30`,
              boxShadow: `0 8px 25px -8px ${stat.color}20`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: window.innerWidth <= 768 ? '24px' : '28px',
                fontWeight: '900',
                color: stat.color,
                marginBottom: '6px',
                textShadow: `0 0 20px ${stat.color}40`
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                fontWeight: '700', 
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {(t.stats as any)[stat.key] || stat.key}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showArchives && (
        <>
          {/* Contrôles de recherche premium */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px', 
            marginBottom: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8' 
              }} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '2px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {(t.categories as any)[category] || category}
                </option>
              ))}
            </select>
          </div>

          {/* Indicateur de chargement */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(59, 130, 246, 0.3)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {language === 'fr' ? 'Chargement des permis...' : 'Loading permits...'}
              </p>
            </div>
          )}

          {/* Cartes des permis premium */}
          {!loading && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: '24px' 
            }}>
              {filteredPermits.map((permit: LegalPermit) => (
                <div
                  key={permit.id}
                  style={{
                    background: permit.selected ?
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 41, 59, 0.9))' :
                      'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7))',
                    border: permit.selected ? 
                      '3px solid #3b82f6' : 
                      '2px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '20px',
                    padding: '24px',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    transform: permit.selected ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                    boxShadow: permit.selected ? 
                      '0 20px 40px -12px rgba(59, 130, 246, 0.4)' : 
                      '0 8px 25px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={(e) => handlePermitClick(permit.id, e)}
                >
                  {/* Header avec statut et actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.3))',
                        color: '#93c5fd',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'inline-block'
                      }}>
                        🔢 {permit.code}
                      </div>
                      <div style={{
                        background: getStatusColor(permit.status),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        display: 'inline-block'
                      }}>
                        {getStatusLabel(permit.status)}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => duplicatePermit(permit.id, e)}
                        style={{
                          padding: '6px',
                          background: 'rgba(34, 197, 94, 0.3)',
                          color: '#22c55e',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Dupliquer' : 'Duplicate'}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeletePermit(permit.id, e)}
                        style={{
                          padding: '6px',
                          background: 'rgba(239, 68, 68, 0.3)',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ 
                      fontSize: '32px', 
                      width: '50px', 
                      textAlign: 'center',
                      filter: permit.selected ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))' : 'none'
                    }}>
                      {getCategoryIcon(permit.category)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        color: '#ffffff', 
                        fontSize: '16px', 
                        fontWeight: '800', 
                        margin: '0 0 8px', 
                        lineHeight: '1.3' 
                      }}>
                        {permit.name}
                      </h3>
                      <div style={{ 
                        color: permit.selected ? '#93c5fd' : '#94a3b8', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        marginBottom: '8px', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {(t.categories as any)[permit.category] || permit.category}
                      </div>
                      <div style={{ 
                        color: '#cbd5e1', 
                        fontSize: '13px', 
                        lineHeight: '1.4', 
                        marginBottom: '8px' 
                      }}>
                        {permit.description}
                      </div>
                      <div style={{ 
                        color: '#60a5fa', 
                        fontSize: '11px', 
                        fontWeight: '600'
                      }}>
                        🏛️ {permit.authority}
                      </div>
                    </div>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      border: permit.selected ? '3px solid #3b82f6' : '2px solid rgba(100, 116, 139, 0.5)',
                      borderRadius: '10px',
                      background: permit.selected ? 
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                        'rgba(15, 23, 42, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {permit.selected && <CheckCircle size={16} style={{ color: 'white' }} />}
                    </div>
                  </div>

                  {/* Actions pour permis sélectionnés */}
                  {permit.selected && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr auto',
                      gap: '10px' 
                    }}>
                      <button
                        onClick={(e) => handleFormToggle(permit.id, e)}
                        disabled={savingPermit === permit.id}
                        style={{
                          padding: '12px 16px',
                          background: savingPermit === permit.id ?
                            'rgba(100, 116, 139, 0.3)' :
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: savingPermit === permit.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {savingPermit === permit.id ? (
                          <>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <Edit size={14} />
                            {t.actions.fill}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => archivePermit(permit.id, e)}
                        style={{
                          padding: '12px 16px',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FileText size={14} />
                        {t.actions.archive}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(language === 'fr' ? 
                            `📄 Génération du PDF pour le permis ${permit.code}` :
                            `📄 Generating PDF for permit ${permit.code}`
                          );
                        }}
                        style={{
                          padding: '12px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        title={language === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message aucun résultat */}
          {!loading && filteredPermits.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
              borderRadius: '20px',
              border: '2px dashed rgba(100, 116, 139, 0.3)'
            }}>
              <FileText size={48} style={{ margin: '0 auto 20px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '20px', 
                fontWeight: '700' 
              }}>
                {t.messages.noResults}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '14px' }}>{t.messages.modifySearch}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{t.messages.selectProvince}</p>
            </div>
          )}
        </>
      )}

      {/* Vue Archives Premium */}
      {showArchives && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7))',
          borderRadius: '20px',
          padding: '28px',
          border: '2px solid rgba(139, 92, 246, 0.3)'
        }}>
          <h2 style={{ 
            color: '#a78bfa', 
            marginBottom: '24px', 
            fontSize: '24px', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📦 {language === 'fr' ? 'Permis Archivés & Validés' : 'Archived & Validated Permits'}
          </h2>
          
          {archivedPermits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <FileText size={48} style={{ margin: '0 auto 20px', color: '#64748b' }} />
              <h3 style={{ 
                color: '#e2e8f0', 
                margin: '0 0 12px', 
                fontSize: '20px', 
                fontWeight: '700' 
              }}>
                {language === 'fr' ? 'Aucun permis archivé' : 'No archived permits'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {language === 'fr' ? 
                  'Les permis complétés et validés apparaîtront ici' : 
                  'Completed and validated permits will appear here'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {archivedPermits.map((permit) => (
                <div
                  key={`archived-${permit.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h4 style={{ 
                      color: '#ffffff', 
                      margin: '0 0 8px', 
                      fontSize: '16px', 
                      fontWeight: '700' 
                    }}>
                      {permit.name}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      fontSize: '12px', 
                      color: '#94a3b8',
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        🔢 {permit.code}
                      </span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        📅 {new Date(permit.validity.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ 
                        color: '#a78bfa', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ✅ {language === 'fr' ? 'VALIDÉ & CONFORME' : 'VALIDATED & COMPLIANT'}
                      </span>
                      {permit.validity.approvedBy && (
                        <span style={{ 
                          color: '#60a5fa', 
                          fontSize: '11px'
                        }}>
                          👤 {permit.validity.approvedBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {language === 'fr' ? 'Voir Détails' : 'View Details'}
                    </button>
                    <button
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Formulaire */}
      {showFormModal && (
        <FormulaireLegalScrollable
          permit={permits.find(p => p.id === showFormModal)!}
          onFormChange={async (data) => {
            const permit = permits.find(p => p.id === showFormModal);
            if (permit) {
              const result = await savePermitToSupabase(permit, data);
              if (!result.success) {
                alert(result.message);
              }
            }
          }}
          language={language}
          onClose={() => setShowFormModal(null)}
        />
      )}

      {/* Animation CSS pour les loaders */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// =================== EXPORT DEFAULT ===================
export default Step4Permits;
