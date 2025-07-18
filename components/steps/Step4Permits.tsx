// =================== SECTION 1: INTERFACES ET TRADUCTIONS CORRIGÉES ===================
// À coller au début de votre fichier Step4Permits.tsx

"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer, ChevronLeft, 
  ChevronRight, Upload, UserPlus, UserMinus, Grid, List
} from 'lucide-react';

// =================== INTERFACES CONFORMES NORMES 2024-2025 ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Permit {
  id: string;
  name: string;
  type: string;
  norm: string;
  status: string;
  category: string;
  description: string;
  authority: string;
  province: string[];
  required: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  cost: string;
  processingTime: string;
  renewalRequired: boolean;
  renewalPeriod?: string;
  legislation: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  selected: boolean;
  complianceLevel: 'basic' | 'standard' | 'enhanced' | 'critical';
  lastUpdated: string;
  requiredFields: number;
  sections?: any;
  formData?: any;
  formFields?: FormField[];
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature' | 'workers_tracking' | 'time_picker' | 'photo_gallery' | 'gas_meter' | 'calculation' | 'compliance_check' | 'alert_indicator';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  section?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    critical?: boolean;
    legalRequirement?: boolean;
  };
  complianceRef?: string;
  calculation?: {
    formula?: string;
    dependencies?: string[];
    autoCalculate?: boolean;
  };
  alert?: {
    level: 'info' | 'warning' | 'danger' | 'critical';
    condition?: string;
    message?: string;
  };
}

interface Worker {
  id?: number;
  name: string;
  age: number;
  certification: string;
  phone: string;
  entryTime?: string;
  exitTime?: string | null;
  date?: string;
  oxygenLevel?: number;
  gasLevel?: number;
  over18?: boolean;
}

interface WorkerEntry {
  id?: number;
  name: string;
  age: number;
  certification: string;
  phone: string;
  entryTime?: string;
  exitTime?: string | null;
  date?: string;
  oxygenLevel?: number;
  gasLevel?: number;
  over18?: boolean;
}

interface Photo {
  id?: number;
  url: string;
  name: string;
  timestamp?: string;
  description?: string;
  gpsLocation?: string;
  compliance?: boolean;
  size?: number;
  uploadedAt?: string;
}

interface PhotoEntry {
  id?: number;
  url: string;
  name: string;
  timestamp?: string;
  description?: string;
  gpsLocation?: string;
  compliance?: boolean;
  size?: number;
  uploadedAt?: string;
}

interface SignatureMetadata {
  name: string;
  title: string;
  certification: string;
  date: string;
  time: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  legalBinding: boolean;
}

interface GasReading {
  timestamp: string;
  oxygen: number;
  combustibleGas: number;
  carbonMonoxide: number;
  hydrogenSulfide: number;
  temperature: number;
  calibrationValid: boolean;
}

interface ComplianceCheck {
  key?: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  reference: string;
  value?: any;
  isValid?: boolean;
  section?: string;
}

// =================== FONCTION DE TRADUCTION BILINGUE OPTIMISÉE MOBILE ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Conformes 2024-2025',
      subtitle: 'Formulaires authentiques conformes aux dernières normes CNESST, NFPA et municipales',
      searchPlaceholder: 'Rechercher un permis...',
      allCategories: 'Toutes catégories',
      allProvinces: 'Toutes provinces',
      categories: {
        'Sécurité': 'Sécurité',
        'Construction': 'Construction',
        'Radioprotection': 'Radioprotection',
        'Équipements': 'Équipements'
      },
      priorities: {
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevé',
        critical: 'Critique'
      },
      statuses: {
        pending: 'En attente',
        submitted: 'Soumis',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        expired: 'Expiré'
      },
      complianceLevels: {
        basic: 'Basique',
        standard: 'Standard',
        enhanced: 'Renforcé',
        critical: 'Critique'
      },
      sections: {
        identification: 'Identification',
        applicant: 'Demandeur',
        access: 'Accès',
        atmosphere: 'Atmosphère',
        signatures: 'Signatures',
        work_type: 'Type de travaux',
        precautions: 'Précautions',
        project: 'Projet',
        excavation: 'Excavation',
        safety: 'Sécurité',
        documents: 'Documents',
        compliance: 'Conformité',
        gas_monitoring: 'Surveillance Gaz',
        rescue_plan: 'Plan de Sauvetage',
        fire_watch: 'Surveillance Incendie',
        municipal_requirements: 'Exigences Municipales'
      },
      stats: {
        available: 'Disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        pending: 'En attente',
        compliant: 'Conformes',
        nonCompliant: 'Non conformes'
      },
      actions: {
        fill: 'Remplir',
        close: 'Fermer',
        preview: 'Aperçu',
        download: 'PDF',
        save: 'Sauvegarder',
        print: 'Imprimer',
        submit: 'Soumettre',
        validate: 'Valider conformité',
        calculate: 'Calculer automatiquement'
      },
      alerts: {
        critical: 'CRITIQUE - Action immédiate requise',
        warning: 'ATTENTION - Vérification nécessaire',
        info: 'Information importante',
        danger: 'DANGER - Conditions non sécuritaires'
      },
      gasMeasurements: {
        oxygen: 'Oxygène (%)',
        combustibleGas: 'Gaz combustibles (% LIE)',
        carbonMonoxide: 'Monoxyde de carbone (ppm)',
        hydrogenSulfide: 'Sulfure d\'hydrogène (ppm)',
        temperature: 'Température (°C)',
        calibrationDate: 'Date calibration détecteur',
        readingTime: 'Heure de lecture',
        compliant: 'Conforme',
        nonCompliant: 'NON CONFORME'
      },
      calculations: {
        excavationPermitRequired: 'Permis excavation requis (auto-calculé)',
        insuranceAmount: 'Montant assurance requis',
        guaranteeDeposit: 'Dépôt de garantie estimé',
        fireWatchDuration: 'Durée surveillance incendie requise'
      },
      compliance: {
        rsst2023: 'RSST 2023 Art. 297-312',
        nfpa51b2019: 'NFPA 51B-2019',
        municipal2024: 'Règlements municipaux 2024',
        age18Required: 'Âge minimum 18 ans obligatoire',
        gasLevelsCompliant: 'Niveaux de gaz conformes',
        rescuePlanValid: 'Plan de sauvetage valide',
        insuranceValid: 'Assurance conforme'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
        workerName: 'Nom du travailleur',
        workerAge: 'Âge du travailleur',
        workerCertification: 'Certification SST',
        recordEntry: 'Enregistrer entrée',
        exit: 'Sortie',
        remove: 'Supprimer',
        entryExitLog: 'Registre des entrées/sorties',
        noEntries: 'Aucune entrée enregistrée',
        selectTime: 'Sélectionner l\'heure',
        now: 'Maintenant',
        select: 'Sélectionner...',
        signatureRequired: 'Signature électronique requise',
        enterName: 'Entrez votre nom complet',
        enterTitle: 'Titre/Fonction',
        enterCertification: 'Numéro de certification',
        signElectronically: 'Signer électroniquement',
        clear: 'Effacer',
        signedBy: 'Signé par',
        on: 'Le',
        at: 'à',
        takePhoto: '📸 Prendre une photo',
        photoCaptured: 'Photo capturée',
        addDescription: 'Ajouter une description...',
        photo: 'photo',
        photos: 'photos',
        photoOf: 'Photo',
        of: 'sur',
        provinces: 'provinces',
        criticalViolation: 'VIOLATION CRITIQUE',
        complianceCheck: 'Vérification de conformité...',
        gasReadingTaken: 'Lecture de gaz effectuée',
        calibrationRequired: 'Calibration détecteur requise',
        emergencyContact: 'Contact d\'urgence',
        rescueTeamReady: 'Équipe de sauvetage prête',
        fireWatchActive: 'Surveillance incendie active',
        municipalNotified: 'Municipalité avisée',
        addWorker: 'Ajouter Travailleur',
        removeWorker: 'Retirer Travailleur',
        workerNumber: 'Travailleur #',
        fullName: 'Nom complet',
        age: 'Âge',
        certification: 'Certification',
        certifyOver18: 'Je certifie que ce travailleur a 18 ans ou plus',
        legalViolationMinor: 'VIOLATION LÉGALE: Travailleur mineur détecté',
        selectCertification: 'Sélectionner certification',
        basicTraining: 'Formation de base',
        advancedTraining: 'Formation avancée',
        supervisor: 'Superviseur',
        rescuer: 'Sauveteur',
        authorizedWorkers: 'Travailleurs Autorisés',
        sitePhotos: 'Photos du Site',
        toggleView: 'Basculer vue',
        addPhotos: '📷 Ajouter photos',
        noPhotosAdded: 'Aucune photo ajoutée',
        clickToAddPhotos: 'Cliquez pour ajouter des photos',
        savePermit: 'Sauvegarder le Permis',
        downloadPDF: 'Télécharger PDF'
      }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2024-2025',
      subtitle: 'Authentic forms compliant with latest CNESST, NFPA and municipal standards',
      searchPlaceholder: 'Search permits...',
      allCategories: 'All categories',
      allProvinces: 'All provinces',
      categories: {
        'Sécurité': 'Safety',
        'Construction': 'Construction',
        'Radioprotection': 'Radiation Protection',
        'Équipements': 'Equipment'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      statuses: {
        pending: 'Pending',
        submitted: 'Submitted',
        approved: 'Approved',
        rejected: 'Rejected',
        expired: 'Expired'
      },
      complianceLevels: {
        basic: 'Basic',
        standard: 'Standard',
        enhanced: 'Enhanced',
        critical: 'Critical'
      },
      sections: {
        identification: 'Identification',
        applicant: 'Applicant',
        access: 'Access',
        atmosphere: 'Atmosphere',
        signatures: 'Signatures',
        work_type: 'Work Type',
        precautions: 'Precautions',
        project: 'Project',
        excavation: 'Excavation',
        safety: 'Safety',
        documents: 'Documents',
        compliance: 'Compliance',
        gas_monitoring: 'Gas Monitoring',
        rescue_plan: 'Rescue Plan',
        fire_watch: 'Fire Watch',
        municipal_requirements: 'Municipal Requirements'
      },
      stats: {
        available: 'Available',
        selected: 'Selected',
        critical: 'Critical',
        pending: 'Pending',
        compliant: 'Compliant',
        nonCompliant: 'Non-compliant'
      },
      actions: {
        fill: 'Fill',
        close: 'Close',
        preview: 'Preview',
        download: 'PDF',
        save: 'Save',
        print: 'Print',
        submit: 'Submit',
        validate: 'Validate compliance',
        calculate: 'Auto-calculate'
      },
      alerts: {
        critical: 'CRITICAL - Immediate action required',
        warning: 'WARNING - Verification needed',
        info: 'Important information',
        danger: 'DANGER - Unsafe conditions'
      },
      gasMeasurements: {
        oxygen: 'Oxygen (%)',
        combustibleGas: 'Combustible gas (% LEL)',
        carbonMonoxide: 'Carbon monoxide (ppm)',
        hydrogenSulfide: 'Hydrogen sulfide (ppm)',
        temperature: 'Temperature (°C)',
        calibrationDate: 'Detector calibration date',
        readingTime: 'Reading time',
        compliant: 'Compliant',
        nonCompliant: 'NON-COMPLIANT'
      },
      calculations: {
        excavationPermitRequired: 'Excavation permit required (auto-calculated)',
        insuranceAmount: 'Required insurance amount',
        guaranteeDeposit: 'Estimated guarantee deposit',
        fireWatchDuration: 'Required fire watch duration'
      },
      compliance: {
        rsst2023: 'RSST 2023 Art. 297-312',
        nfpa51b2019: 'NFPA 51B-2019',
        municipal2024: 'Municipal regulations 2024',
        age18Required: '18+ years mandatory',
        gasLevelsCompliant: 'Gas levels compliant',
        rescuePlanValid: 'Valid rescue plan',
        insuranceValid: 'Insurance compliant'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        workerName: 'Worker name',
        workerAge: 'Worker age',
        workerCertification: 'HSE certification',
        recordEntry: 'Record entry',
        exit: 'Exit',
        remove: 'Remove',
        entryExitLog: 'Entry/exit log',
        noEntries: 'No entries recorded',
        selectTime: 'Select time',
        now: 'Now',
        select: 'Select...',
        signatureRequired: 'Electronic signature required',
        enterName: 'Enter your full name',
        enterTitle: 'Title/Position',
        enterCertification: 'Certification number',
        signElectronically: 'Sign electronically',
        clear: 'Clear',
        signedBy: 'Signed by',
        on: 'On',
        at: 'at',
        takePhoto: '📸 Take photo',
        photoCaptured: 'Photo captured',
        addDescription: 'Add description...',
        photo: 'photo',
        photos: 'photos',
        photoOf: 'Photo',
        of: 'of',
        provinces: 'provinces',
        criticalViolation: 'CRITICAL VIOLATION',
        complianceCheck: 'Compliance verification...',
        gasReadingTaken: 'Gas reading taken',
        calibrationRequired: 'Detector calibration required',
        emergencyContact: 'Emergency contact',
        rescueTeamReady: 'Rescue team ready',
        fireWatchActive: 'Fire watch active',
        municipalNotified: 'Municipality notified',
        addWorker: 'Add Worker',
        removeWorker: 'Remove Worker',
        workerNumber: 'Worker #',
        fullName: 'Full name',
        age: 'Age',
        certification: 'Certification',
        certifyOver18: 'I certify this worker is 18+ years old',
        legalViolationMinor: 'LEGAL VIOLATION: Minor worker detected',
        selectCertification: 'Select certification',
        basicTraining: 'Basic training',
        advancedTraining: 'Advanced training',
        supervisor: 'Supervisor',
        rescuer: 'Rescuer',
        authorizedWorkers: 'Authorized Workers',
        sitePhotos: 'Site Photos',
        toggleView: 'Toggle view',
        addPhotos: '📷 Add photos',
        noPhotosAdded: 'No photos added',
        clickToAddPhotos: 'Click to add photos',
        savePermit: 'Save Permit',
        downloadPDF: 'Download PDF'
      }
    };
  }
};
// =================== SECTION 2: BASE DE DONNÉES PERMIS CONFORMES 2024-2025 ===================
// À coller après la Section 1

// =================== BASE DE DONNÉES PERMIS CONFORMES AUX NORMES 2024-2025 ===================
const translatePermitsDatabase = (language: 'fr' | 'en'): Permit[] => {
  const basePermits: Permit[] = [
    
    // 1. PERMIS ESPACE CLOS CONFORME RSST 2023-2025
    {
      id: 'confined-space-entry-2025',
      name: language === 'fr' ? 'Permis d\'Entrée en Espace Clos RSST 2023' : 'Confined Space Entry Permit RSST 2023',
      type: language === 'fr' ? 'Espace Clos' : 'Confined Space',
      norm: 'RSST 2023 Art. 297-312',
      status: language === 'fr' ? 'Critique' : 'Critical',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme RSST 2023-2025 avec surveillance atmosphérique continue et plan de sauvetage personnalisé' : 'RSST 2023-2025 compliant permit with continuous atmospheric monitoring and personalized rescue plan',
      authority: language === 'fr' ? 'CNESST / Employeur / ASP Construction' : 'CNESST / Employer / ASP Construction',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? 'Maximum 8 heures ou fin des travaux' : 'Maximum 8 hours or end of work',
      cost: language === 'fr' ? 'Inclus dans formation + équipements surveillance' : 'Included in training + monitoring equipment',
      processingTime: language === 'fr' ? 'Avant chaque entrée + tests atmosphériques' : 'Before each entry + atmospheric tests',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien avec surveillance continue' : 'Daily with continuous monitoring',
      legislation: 'RSST Art. 297-312 modifié 2023, Décret 43-2023, Art. 297.1 nouveau',
      contactInfo: {
        phone: '514-355-6190',
        website: 'https://www.cnesst.gouv.qc.ca',
        email: 'info@asp-construction.org'
      },
      selected: false,
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      requiredFields: 27,
      sections: {
        identification: {
          title: language === 'fr' ? 'Identification' : 'Identification',
          fields: [
            {
              key: 'space_identification',
              label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification',
              type: 'text',
              required: true,
              placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...',
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 300',
              isLegal: true
            },
            {
              key: 'project_name',
              label: language === 'fr' ? 'Nom du projet' : 'Project name',
              type: 'text',
              required: true
            },
            {
              key: 'location_precise',
              label: language === 'fr' ? 'Localisation GPS précise' : 'Precise GPS location',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'permit_date',
              label: language === 'fr' ? 'Date du permis' : 'Permit date',
              type: 'date',
              required: true
            },
            {
              key: 'permit_time',
              label: language === 'fr' ? 'Heure d\'émission' : 'Issue time',
              type: 'time',
              required: true
            },
            {
              key: 'permit_duration',
              label: language === 'fr' ? 'Durée validité (max 8h)' : 'Validity duration (max 8h)',
              type: 'select',
              required: true,
              options: ['1h', '2h', '4h', '6h', '8h'],
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 300',
              isLegal: true
            }
          ]
        },
        gas_monitoring: {
          title: language === 'fr' ? 'Surveillance Gaz' : 'Gas Monitoring',
          fields: [
            {
              key: 'oxygen_level',
              label: language === 'fr' ? 'Niveau oxygène (%)' : 'Oxygen level (%)',
              type: 'number',
              required: true,
              validation: {
                min: 19.5,
                max: 23.5,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: O2 doit être entre 19.5% et 23.5%' : 'CRITICAL: O2 must be between 19.5% and 23.5%'
              },
              legalRef: 'RSST Art. 302 modifié',
              isCritical: true
            },
            {
              key: 'combustible_gas_level',
              label: language === 'fr' ? 'Gaz combustibles (% LIE)' : 'Combustible gas (% LEL)',
              type: 'number',
              required: true,
              validation: {
                min: 0,
                max: 10,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: Gaz combustibles < 10% LIE obligatoire' : 'CRITICAL: Combustible gas < 10% LEL mandatory'
              },
              legalRef: 'RSST Art. 302',
              isCritical: true
            },
            {
              key: 'carbon_monoxide_level',
              label: language === 'fr' ? 'Monoxyde de carbone (ppm)' : 'Carbon monoxide (ppm)',
              type: 'number',
              required: true,
              validation: {
                min: 0,
                max: 35,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: CO < 35 ppm obligatoire' : 'CRITICAL: CO < 35 ppm mandatory'
              },
              legalRef: 'RSST Annexe I',
              isCritical: true
            },
            {
              key: 'hydrogen_sulfide_level',
              label: language === 'fr' ? 'Sulfure d\'hydrogène (ppm)' : 'Hydrogen sulfide (ppm)',
              type: 'number',
              required: true,
              validation: {
                min: 0,
                max: 10,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: H2S < 10 ppm obligatoire' : 'CRITICAL: H2S < 10 ppm mandatory'
              },
              legalRef: 'RSST Annexe I',
              isCritical: true
            }
          ]
        },
        access: {
          title: language === 'fr' ? 'Accès' : 'Access',
          fields: [
            {
              key: 'worker_age_verification',
              label: language === 'fr' ? 'VÉRIFICATION: Tous travailleurs ≥ 18 ans' : 'VERIFICATION: All workers ≥ 18 years',
              type: 'checkbox',
              required: true,
              validation: { critical: true, legalRequirement: true },
              legalRef: 'RSST Art. 298 modifié 2023',
              isCritical: true
            },
            {
              key: 'worker_certification_check',
              label: language === 'fr' ? 'Certification formation espace clos valide' : 'Valid confined space training certification',
              type: 'checkbox',
              required: true,
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 298',
              isLegal: true
            }
          ]
        },
        rescue_plan: {
          title: language === 'fr' ? 'Plan de Sauvetage' : 'Rescue Plan',
          fields: [
            {
              key: 'rescue_plan_personalized',
              label: language === 'fr' ? 'Plan de sauvetage PERSONNALISÉ pour cet espace' : 'PERSONALIZED rescue plan for this space',
              type: 'textarea',
              required: true,
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 309 enrichi',
              placeholder: language === 'fr' ? 'Décrire procédure spécifique, équipements, points d\'accès...' : 'Describe specific procedure, equipment, access points...',
              isLegal: true
            },
            {
              key: 'rescue_responsible_person',
              label: language === 'fr' ? 'Responsable sauvetage DÉSIGNÉ' : 'DESIGNATED rescue responsible',
              type: 'text',
              required: true,
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 309',
              isLegal: true
            }
          ]
        }
      }
    },

    // 2. PERMIS TRAVAIL À CHAUD CONFORME NFPA 51B-2019
    {
      id: 'hot-work-permit-nfpa2019',
      name: language === 'fr' ? 'Permis Travail à Chaud NFPA 51B-2019' : 'Hot Work Permit NFPA 51B-2019',
      type: language === 'fr' ? 'Travail à Chaud' : 'Hot Work',
      norm: 'NFPA 51B-2019',
      status: language === 'fr' ? 'En Attente' : 'Pending',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme NFPA 51B-2019 avec surveillance incendie 1 heure et réinspection par quart' : 'NFPA 51B-2019 compliant permit with 1-hour fire watch and shift reinspection',
      authority: language === 'fr' ? 'Service incendie / Employeur / NFPA' : 'Fire Department / Employer / NFPA',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? '24 heures maximum + surveillance 1h post-travaux' : '24 hours maximum + 1h post-work monitoring',
      cost: language === 'fr' ? 'Variable selon municipalité + équipements' : 'Variable by municipality + equipment',
      processingTime: language === 'fr' ? 'Immédiat à 24h + inspections' : 'Immediate to 24h + inspections',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien avec réinspection par quart' : 'Daily with shift reinspection',
      legislation: 'NFPA 51B-2019, CNPI Section 5.2, CAN/CSA W117.2-M87, RSST Art. 313-332',
      contactInfo: {
        phone: language === 'fr' ? 'Service incendie local' : 'Local fire department',
        website: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=51B'
      },
      selected: false,
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      requiredFields: 18,
      sections: {
        identification: {
          title: language === 'fr' ? 'Identification' : 'Identification',
          fields: [
            {
              key: 'permit_number_hot',
              label: language === 'fr' ? 'Numéro de permis unique' : 'Unique permit number',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'work_location_precise',
              label: language === 'fr' ? 'Lieu précis des travaux' : 'Precise work location',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'contractor_company',
              label: language === 'fr' ? 'Entreprise contractante' : 'Contracting company',
              type: 'text',
              required: true
            }
          ]
        },
        work_type: {
          title: language === 'fr' ? 'Type de Travail' : 'Work Type',
          fields: [
            {
              key: 'work_type_hot',
              label: language === 'fr' ? 'Type de travail à chaud principal' : 'Primary hot work type',
              type: 'select',
              required: true,
              options: language === 'fr' ? 
                ['Soudage à l\'arc électrique', 'Soudage au gaz', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage avec étincelles', 'Autre'] :
                ['Electric arc welding', 'Gas welding', 'Torch cutting', 'Plasma cutting', 'Grinding with sparks', 'Other'],
              validation: { legalRequirement: true },
              legalRef: 'NFPA 51B-2019'
            },
            {
              key: 'work_description_detailed',
              label: language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description',
              type: 'textarea',
              required: true,
              validation: { legalRequirement: true }
            }
          ]
        },
        fire_watch: {
          title: language === 'fr' ? 'Surveillance Incendie' : 'Fire Watch',
          fields: [
            {
              key: 'fire_watch_duration',
              label: language === 'fr' ? 'Durée surveillance incendie POST-TRAVAUX' : 'POST-WORK fire watch duration',
              type: 'select',
              required: true,
              options: ['1 heure (NFPA 51B-2019)', '2 heures', 'Plus de 2 heures'],
              validation: { legalRequirement: true },
              legalRef: 'NFPA 51B-2019',
              isCritical: true
            },
            {
              key: 'fire_watch_person_assigned',
              label: language === 'fr' ? 'Préposé surveillance incendie désigné' : 'Designated fire watch person',
              type: 'text',
              required: true,
              validation: { legalRequirement: true },
              isLegal: true
            }
          ]
        }
      }
    },

    // 3. PERMIS EXCAVATION CONFORME MUNICIPAL 2024
    {
      id: 'excavation-permit-municipal-2024',
      name: language === 'fr' ? 'Permis d\'Excavation Municipal 2024' : 'Municipal Excavation Permit 2024',
      type: language === 'fr' ? 'Excavation' : 'Excavation',
      norm: 'Municipal 2024',
      status: language === 'fr' ? 'En Cours' : 'In Progress',
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 'Permis conforme réglements municipaux 2024 avec calculs automatiques et assurances obligatoires' : 'Municipal regulations 2024 compliant permit with automatic calculations and mandatory insurance',
      authority: language === 'fr' ? 'Municipal / Ville de Montréal / MAMH' : 'Municipal / City of Montreal / MAMH',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux + période garantie' : 'Work duration + warranty period',
      cost: language === 'fr' ? '200$ - 2000$ + dépôts garantie' : '$200 - $2000 + guarantee deposits',
      processingTime: language === 'fr' ? '2-4 semaines + inspections' : '2-4 weeks + inspections',
      renewalRequired: false,
      legislation: language === 'fr' ? 'Règlements municipaux 2024, Code construction Québec' : 'Municipal regulations 2024, Quebec Building Code',
      contactInfo: {
        website: language === 'fr' ? 'Bureau des permis municipal' : 'Municipal permit office',
        phone: '311',
        email: 'permis@montreal.ca'
      },
      selected: false,
      complianceLevel: 'enhanced',
      lastUpdated: '2025-01-20',
      requiredFields: 15,
      sections: {
        applicant: {
          title: language === 'fr' ? 'Demandeur' : 'Applicant',
          fields: [
            {
              key: 'applicant_name_excavation',
              label: language === 'fr' ? 'Nom du demandeur' : 'Applicant name',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'applicant_company',
              label: language === 'fr' ? 'Entreprise/Organisation' : 'Company/Organization',
              type: 'text',
              required: true
            },
            {
              key: 'professional_engineer',
              label: language === 'fr' ? 'Ingénieur responsable (OIQ)' : 'Responsible engineer (OIQ)',
              type: 'text',
              required: true,
              validation: { legalRequirement: true },
              isLegal: true
            }
          ]
        },
        excavation: {
          title: language === 'fr' ? 'Excavation' : 'Excavation',
          fields: [
            {
              key: 'excavation_depth_calc',
              label: language === 'fr' ? 'Profondeur excavation (m)' : 'Excavation depth (m)',
              type: 'number',
              required: true,
              validation: { min: 0, legalRequirement: true }
            },
            {
              key: 'domain_public_distance',
              label: language === 'fr' ? 'Distance domaine public (m)' : 'Public domain distance (m)',
              type: 'number',
              required: true,
              validation: { min: 0, legalRequirement: true }
            }
          ]
        },
        municipal_requirements: {
          title: language === 'fr' ? 'Exigences Municipales' : 'Municipal Requirements',
          fields: [
            {
              key: 'co_insurance_city',
              label: language === 'fr' ? 'Co-assurance Ville AJOUTÉE à la police' : 'City co-insurance ADDED to policy',
              type: 'checkbox',
              required: true,
              validation: { legalRequirement: true, critical: true },
              legalRef: 'Avenant obligatoire Ville',
              isCritical: true
            },
            {
              key: 'info_excavation_request',
              label: language === 'fr' ? 'Demande Info-Excavation COMPLÉTÉE' : 'Info-Excavation request COMPLETED',
              type: 'checkbox',
              required: true,
              validation: { legalRequirement: true, critical: true },
              legalRef: 'https://www.info-ex.com',
              isCritical: true
            }
          ]
        }
      }
    }
  ];

  return basePermits;
};
// =================== SECTION 3: LOGIQUE COMPLÈTE PREMIUM MOBILE ===================
// À coller après la Section 2

// =================== COMPOSANT PRINCIPAL PREMIUM OPTIMISÉ MOBILE ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language, tenant, errors }) => {
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [expandedPermit, setExpandedPermit] = useState<string | null>(null);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<{ [permitId: string]: string }>({});
  
  // =================== ÉTATS POUR FONCTIONNALITÉS AVANCÉES ===================
  const [workers, setWorkers] = useState<{ [permitId: string]: WorkerEntry[] }>({});
  const [photos, setPhotos] = useState<{ [permitId: string]: PhotoEntry[] }>({});
  const [signatures, setSignatures] = useState<{ [permitId: string]: SignatureMetadata[] }>({});
  const [gasReadings, setGasReadings] = useState<{ [permitId: string]: GasReading[] }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [permitId: string]: ComplianceCheck[] }>({});
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [permitId: string]: number }>({});
  const [photoViewMode, setPhotoViewMode] = useState<{ [permitId: string]: 'carousel' | 'grid' }>({});

  // =================== INITIALISATION DES PERMIS ===================
  useEffect(() => {
    const translatedPermits = translatePermitsDatabase(language);
    setPermits(translatedPermits);
    
    // Initialiser les sections par défaut
    translatedPermits.forEach((permit: Permit) => {
      if (permit.sections) {
        const firstSectionKey = Object.keys(permit.sections)[0];
        setCurrentSection(prev => ({
          ...prev,
          [permit.id]: firstSectionKey
        }));
      }
      
      if (permit.selected) {
        initializePermitData(permit.id);
      }
    });
  }, [language]);

  // =================== INITIALISATION DES DONNÉES PERMIS ===================
  const initializePermitData = (permitId: string) => {
    // Initialiser workers
    if (!workers[permitId]) {
      setWorkers(prev => ({
        ...prev,
        [permitId]: [{
          id: 1,
          name: '',
          age: 0,
          certification: '',
          phone: '',
          entryTime: '',
          exitTime: null,
          date: new Date().toISOString().split('T')[0],
          over18: false
        }]
      }));
    }
    
    // Initialiser photos
    if (!photos[permitId]) {
      setPhotos(prev => ({
        ...prev,
        [permitId]: []
      }));
    }
    
    // Initialiser index photos
    if (!currentPhotoIndex[permitId]) {
      setCurrentPhotoIndex(prev => ({
        ...prev,
        [permitId]: 0
      }));
    }
    
    // Initialiser mode vue photos
    if (!photoViewMode[permitId]) {
      setPhotoViewMode(prev => ({
        ...prev,
        [permitId]: 'carousel'
      }));
    }
  };

  // =================== FILTRAGE DES PERMIS ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || permit.category === selectedCategory;
      const matchesProvince = !selectedProvince || permit.province.includes(selectedProvince);
      
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories = useMemo(() => 
    Array.from(new Set(permits.map((p: Permit) => p.category))) as string[], 
    [permits]
  );

  const provinces = useMemo(() => 
    Array.from(new Set(permits.flatMap((p: Permit) => p.province))) as string[], 
    [permits]
  );

  // =================== STATISTIQUES TEMPS RÉEL ===================
  const stats = useMemo(() => {
    const selectedPermits = permits.filter(p => p.selected);
    const criticalPermits = permits.filter(p => p.priority === 'critical');
    const pendingPermits = permits.filter(p => p.status === 'pending');
    
    return {
      available: permits.length,
      selected: selectedPermits.length,
      critical: criticalPermits.length,
      pending: pendingPermits.length,
      compliant: Object.values(complianceChecks).flat().filter(c => c.status === 'compliant').length,
      nonCompliant: Object.values(complianceChecks).flat().filter(c => c.status === 'non-compliant').length
    };
  }, [permits, complianceChecks]);

  // =================== FONCTIONS UTILITAIRES ===================
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'submitted': return '#3B82F6';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'expired': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getComplianceColor = (level: string): string => {
    switch (level) {
      case 'basic': return '#10B981';
      case 'standard': return '#3B82F6';
      case 'enhanced': return '#8B5CF6';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Sécurité':
      case 'Safety':
        return '🛡️';
      case 'Construction':
        return '🏗️';
      case 'Radioprotection':
      case 'Radiation Protection':
        return '☢️';
      case 'Équipements':
      case 'Equipment':
        return '⚙️';
      default:
        return '📋';
    }
  };

  // =================== GESTION DES PERMIS ===================
  const togglePermit = (permitId: string) => {
    setPermits(prev => prev.map(permit => {
      if (permit.id === permitId) {
        const newSelected = !permit.selected;
        
        if (newSelected) {
          initializePermitData(permitId);
        } else {
          // Nettoyer les données quand désélectionné
          cleanupPermitData(permitId);
        }
        
        return { ...permit, selected: newSelected };
      }
      return permit;
    }));
  };

  const cleanupPermitData = (permitId: string) => {
    setWorkers(prev => {
      const newWorkers = { ...prev };
      delete newWorkers[permitId];
      return newWorkers;
    });
    
    setPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[permitId];
      return newPhotos;
    });
    
    setCurrentPhotoIndex(prev => {
      const newIndex = { ...prev };
      delete newIndex[permitId];
      return newIndex;
    });
    
    setPhotoViewMode(prev => {
      const newMode = { ...prev };
      delete newMode[permitId];
      return newMode;
    });
  };

  const expandPermit = (permitId: string) => {
    setExpandedPermit(expandedPermit === permitId ? null : permitId);
  };

  const handleFieldChange = (permitId: string, fieldId: string, value: any) => {
    setPermits(prev => prev.map(permit => {
      if (permit.id === permitId) {
        return {
          ...permit,
          formData: {
            ...permit.formData,
            [fieldId]: value
          }
        };
      }
      return permit;
    }));

    // Déclencher validations temps réel si nécessaire
    const permit = permits.find(p => p.id === permitId);
    if (permit?.sections) {
      const currentSectionData = permit.sections[currentSection[permitId]];
      const field = currentSectionData?.fields?.find((f: any) => f.key === fieldId);
      
      if (field?.validation?.critical) {
        validateField(permitId, fieldId, value, field);
      }
    }
  };

  // =================== VALIDATION TEMPS RÉEL ===================
  const validateField = (permitId: string, fieldId: string, value: any, field: any) => {
    const checks: ComplianceCheck[] = [];
    
    if (field.type === 'number' && field.validation) {
      const numValue = parseFloat(value) || 0;
      const min = field.validation.min || 0;
      const max = field.validation.max || 100;
      
      if (numValue < min || numValue > max) {
        checks.push({
          key: `${permitId}_${fieldId}`,
          requirement: field.label,
          status: 'non-compliant',
          details: `Valeur ${numValue} hors limites (${min}-${max})`,
          reference: field.legalRef || 'Validation automatique'
        });
      } else {
        checks.push({
          key: `${permitId}_${fieldId}`,
          requirement: field.label,
          status: 'compliant',
          details: `Valeur ${numValue} conforme`,
          reference: field.legalRef || 'Validation automatique'
        });
      }
    }
    
    if (fieldId === 'worker_age_verification') {
      const permitWorkers = workers[permitId] || [];
      const hasMinors = permitWorkers.some(w => w.age > 0 && w.age < 18);
      
      if (hasMinors) {
        checks.push({
          key: `${permitId}_age_check`,
          requirement: 'Vérification âge travailleurs',
          status: 'non-compliant',
          details: 'Travailleur(s) mineur(s) détecté(s) - Violation Article 298 RSST',
          reference: 'RSST Art. 298 modifié 2023'
        });
      } else {
        checks.push({
          key: `${permitId}_age_check`,
          requirement: 'Vérification âge travailleurs',
          status: 'compliant',
          details: 'Tous les travailleurs sont âgés de 18 ans ou plus',
          reference: 'RSST Art. 298 modifié 2023'
        });
      }
    }
    
    setComplianceChecks(prev => ({
      ...prev,
      [permitId]: [
        ...(prev[permitId] || []).filter(c => c.key !== `${permitId}_${fieldId}` && c.key !== `${permitId}_age_check`),
        ...checks
      ]
    }));
  };

  // =================== GESTION DES TRAVAILLEURS ===================
  const addWorker = (permitId: string) => {
    setWorkers(prev => {
      const currentWorkers = prev[permitId] || [];
      const newWorker: WorkerEntry = {
        id: Math.max(...currentWorkers.map(w => w.id || 0), 0) + 1,
        name: '',
        age: 0,
        certification: '',
        phone: '',
        entryTime: '',
        exitTime: null,
        date: new Date().toISOString().split('T')[0],
        over18: false
      };
      
      return {
        ...prev,
        [permitId]: [...currentWorkers, newWorker]
      };
    });
  };

  const removeWorker = (permitId: string, workerId: number) => {
    setWorkers(prev => ({
      ...prev,
      [permitId]: (prev[permitId] || []).filter(w => w.id !== workerId)
    }));
  };

  const updateWorker = (permitId: string, workerId: number, field: keyof WorkerEntry, value: any) => {
    setWorkers(prev => ({
      ...prev,
      [permitId]: (prev[permitId] || []).map(worker => {
        if (worker.id === workerId) {
          const updatedWorker = { ...worker, [field]: value };
          
          // Validation automatique âge 18+
          if (field === 'age') {
            updatedWorker.over18 = value >= 18;
            
            // Déclencher validation compliance
            setTimeout(() => {
              validateField(permitId, 'worker_age_verification', value, {
                key: 'worker_age_verification',
                label: 'Vérification âge travailleurs',
                validation: { critical: true, legalRequirement: true }
              });
            }, 100);
          }
          
          return updatedWorker;
        }
        return worker;
      })
    }));
  };

  // =================== GESTION DES PHOTOS ===================
  const handlePhotoUpload = (permitId: string, files: File[]) => {
    const newPhotos: PhotoEntry[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = Math.max(...(photos[permitId] || []).map(p => p.id || 0), 0) + i + 1;
      
      // Créer URL pour prévisualisation
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        id: photoId,
        url: url,
        name: file.name,
        timestamp: new Date().toISOString(),
        description: '',
        gpsLocation: '',
        compliance: true,
        size: file.size,
        uploadedAt: new Date().toISOString()
      });
    }
    
    setPhotos(prev => ({
      ...prev,
      [permitId]: [...(prev[permitId] || []), ...newPhotos]
    }));
  };

  const removePhoto = (permitId: string, photoId: number) => {
    setPhotos(prev => {
      const updatedPhotos = (prev[permitId] || []).filter(p => p.id !== photoId);
      
      // Ajuster l'index si nécessaire
      const currentIndex = currentPhotoIndex[permitId] || 0;
      if (currentIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
        setCurrentPhotoIndex(prevIndex => ({
          ...prevIndex,
          [permitId]: updatedPhotos.length - 1
        }));
      }
      
      return {
        ...prev,
        [permitId]: updatedPhotos
      };
    });
  };

  const updatePhotoIndex = (permitId: string, index: number) => {
    setCurrentPhotoIndex(prev => ({
      ...prev,
      [permitId]: index
    }));
  };

  const updateViewMode = (permitId: string, mode: 'carousel' | 'grid') => {
    setPhotoViewMode(prev => ({
      ...prev,
      [permitId]: mode
    }));
  };

  // =================== CALCULS AUTOMATIQUES ===================
  const calculateExcavationRequirements = (permitId: string, depth: number, distance: number) => {
    let permitRequired = false;
    let insuranceAmount = '1M$';
    let surfaceDeposit = '5000$';
    let undergroundDeposit = '10000$';
    
    // Logique calculs municipaux
    if (depth > 1.2 || distance < 3) {
      permitRequired = true;
      
      if (depth > 3) {
        insuranceAmount = '2M$';
        surfaceDeposit = '15000$';
        undergroundDeposit = '25000$';
      } else if (depth > 2) {
        insuranceAmount = '1.5M$';
        surfaceDeposit = '10000$';
        undergroundDeposit = '20000$';
      }
    }
    
    // Mettre à jour les champs calculés
    handleFieldChange(permitId, 'permit_required_auto', permitRequired);
    handleFieldChange(permitId, 'insurance_amount_calc', insuranceAmount);
    handleFieldChange(permitId, 'surface_guarantee_deposit', surfaceDeposit);
    handleFieldChange(permitId, 'underground_guarantee_deposit', undergroundDeposit);
  };

  // =================== SAUVEGARDE DES DONNÉES ===================
  const saveProgress = (permitId: string) => {
    const permitData = {
      workers: workers[permitId] || [],
      photos: photos[permitId] || [],
      complianceChecks: complianceChecks[permitId] || [],
      currentSection: currentSection[permitId] || 'identification',
      lastSaved: new Date().toISOString()
    };
    
    // Sauvegarder via la prop onDataChange
    onDataChange('permits', {
      ...formData.permits,
      [permitId]: permitData
    });
  };

  // =================== RENDU DU COMPOSANT PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        
        {/* En-tête avec titre et statistiques PREMIUM */}
        <div className="mb-6 lg:mb-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="relative inline-block">
              <h1 className="text-2xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 lg:mb-3">
                {t.title}
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 blur-3xl opacity-20 -z-10"></div>
            </div>
            <p className="text-gray-300 text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed px-4">
              {t.subtitle}
            </p>
          </div>

          {/* Statistiques temps réel PREMIUM - Layout mobile optimisé */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4 mb-6 lg:mb-8">
            {[
              { value: stats.available, label: t.stats.available, color: 'from-blue-500 to-cyan-500', icon: '📊' },
              { value: stats.selected, label: t.stats.selected, color: 'from-green-500 to-emerald-500', icon: '✅' },
              { value: stats.critical, label: t.stats.critical, color: 'from-red-500 to-rose-500', icon: '🚨' },
              { value: stats.pending, label: t.stats.pending, color: 'from-yellow-500 to-orange-500', icon: '⏳' },
              { value: stats.compliant, label: t.stats.compliant, color: 'from-green-500 to-teal-500', icon: '🛡️' },
              { value: stats.nonCompliant, label: t.stats.nonCompliant, color: 'from-red-500 to-pink-500', icon: '⚠️' }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl lg:rounded-2xl blur-lg lg:blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-lg lg:text-4xl mb-1 lg:mb-2">{stat.icon}</div>
                    <div className={`text-xl lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de recherche PREMIUM - Mobile optimisée */}
          <div className="relative group mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl lg:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/20 p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-hover/search:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
                >
                  <option value="" className="bg-slate-800">{t.allCategories}</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {(t.categories as any)[category] || category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
                >
                  <option value="" className="bg-slate-800">{t.allProvinces}</option>
                  {provinces.map((province: string) => (
                    <option key={province} value={province} className="bg-slate-800">{province}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des permis PREMIUM */}
        <div className="space-y-4 lg:space-y-8">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="relative inline-block">
                <FileText className="w-16 h-16 lg:w-24 lg:h-24 mx-auto text-gray-400 mb-4 lg:mb-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-20"></div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-300 mb-2 lg:mb-3">{t.messages.noResults}</h3>
              <p className="text-gray-400 text-base lg:text-lg">{t.messages.modifySearch}</p>
            </div>
          ) : (
            filteredPermits.map((permit: Permit) => (
              <PermitCard
                key={permit.id}
                permit={permit}
                isSelected={permit.selected}
                isExpanded={expandedPermit === permit.id}
                complianceChecks={complianceChecks[permit.id] || []}
                workers={workers[permit.id] || []}
                photos={photos[permit.id] || []}
                currentSection={currentSection[permit.id] || 'identification'}
                currentPhotoIndex={currentPhotoIndex[permit.id] || 0}
                viewMode={photoViewMode[permit.id] || 'carousel'}
                onSelect={() => togglePermit(permit.id)}
                onFill={() => expandPermit(permit.id)}
                onValidate={() => {/* Logique validation */}}
                onGeneratePDF={() => {/* Logique PDF */}}
                onExpand={() => expandPermit(permit.id)}
                onToggle={() => togglePermit(permit.id)}
                onSectionChange={(section) => setCurrentSection(prev => ({ ...prev, [permit.id]: section }))}
                onComplianceUpdate={(checks) => setComplianceChecks(prev => ({ ...prev, [permit.id]: checks }))}
                onWorkersUpdate={(newWorkers) => setWorkers(prev => ({ ...prev, [permit.id]: newWorkers }))}
                onPhotosUpdate={(newPhotos) => setPhotos(prev => ({ ...prev, [permit.id]: newPhotos }))}
                onPhotoIndexChange={(index) => updatePhotoIndex(permit.id, index)}
                onViewModeChange={(mode) => updateViewMode(permit.id, mode)}
                onSaveProgress={() => saveProgress(permit.id)}
                onFieldChange={(fieldId, value) => handleFieldChange(permit.id, fieldId, value)}
                onAddWorker={() => addWorker(permit.id)}
                onRemoveWorker={(workerId) => removeWorker(permit.id, workerId)}
                onUpdateWorker={(workerId, field, value) => updateWorker(permit.id, workerId, field, value)}
                onPhotoUpload={(files) => handlePhotoUpload(permit.id, files)}
                onRemovePhoto={(photoId) => removePhoto(permit.id, photoId)}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
// =================== SECTION 4A: PermitCard Ultra-Premium ===================
// À coller après votre Section 3 dans Step4Permits.tsx

// Composant PermitCard ultra-premium (COMPATIBLE avec votre code existant)
const PermitCardUltraPremium: React.FC<{
  permit: Permit;
  isSelected: boolean;
  isExpanded: boolean;
  complianceChecks: ComplianceCheck[];
  workers: WorkerEntry[];
  photos: PhotoEntry[];
  currentSection: string;
  currentPhotoIndex: number;
  viewMode: 'carousel' | 'grid';
  onToggle: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddWorker: (worker: WorkerEntry) => void;
  onRemoveWorker: (workerId: number) => void;
  onPhotoIndexChange: (index: number) => void;
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
}> = ({ 
  permit, 
  isSelected, 
  isExpanded, 
  complianceChecks, 
  workers, 
  photos, 
  currentSection,
  currentPhotoIndex,
  viewMode,
  onToggle, 
  onFieldChange,
  onAddWorker,
  onRemoveWorker,
  onPhotoIndexChange,
  onViewModeChange
}) => {
  // État local pour la gestion du formulaire
  const [currentFormSection, setCurrentFormSection] = useState('identification');
  const hasViolations = complianceChecks.some(check => check.status === 'non-compliant');

  // IMPORTANT: Utilise EXACTEMENT votre logique existante
  const getCategoryIcon = () => {
    const categoryKey = permit.category === 'Safety' ? 'Sécurité' : 
                       permit.category === 'Construction' ? 'Construction' :
                       permit.category === 'Radiation Protection' ? 'Radioprotection' :
                       permit.category === 'Equipment' ? 'Équipements' : permit.category;
    
    switch (categoryKey) {
      case 'Sécurité': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': return '☢️';
      case 'Équipements': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = () => {
    switch (permit.priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = () => {
    switch (permit.status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getComplianceColor = () => {
    switch (permit.complianceLevel) {
      case 'critical': return '#dc2626';
      case 'enhanced': return '#059669';
      case 'standard': return '#2563eb';
      case 'basic': return '#64748b';
      default: return '#6b7280';
    }
  };

  // Sections disponibles pour le formulaire
  const formSections = {
    identification: ['space_identification', 'project_name', 'location_precise', 'permit_date'],
    gas_monitoring: ['oxygen_level', 'combustible_gas_level', 'carbon_monoxide_level', 'continuous_monitoring'],
    workers: ['worker_age_verification', 'authorized_workers'],
    photos: ['photos_documentation'],
    signatures: ['supervisor_signature', 'attendant_signature']
  };

  // Fonction pour rendre le modal du formulaire avec VOTRE style glassmorphisme
  const renderFormModal = () => {
    if (!isExpanded) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.95) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}>
          {/* Header Premium avec glassmorphisme */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '40px' }}>{getCategoryIcon()}</div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 8px'
                  }}>
                    {permit.name}
                  </h2>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>{permit.description}</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Navigation par sections avec design premium */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {Object.keys(formSections).map((section) => (
                <button
                  key={section}
                  onClick={() => setCurrentFormSection(section)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    ...(currentFormSection === section ? {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    } : {
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      border: '1px solid rgba(100, 116, 139, 0.3)'
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (currentFormSection !== section) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentFormSection !== section) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.color = '#94a3b8';
                    }
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu du formulaire - sera complété dans Section 4B */}
          <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#94a3b8' 
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Section {currentFormSection} - Composants en cours de développement...</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                FormField, PhotoGallery et WorkerCard seront ajoutés en Section 4B
              </p>
            </div>
          </div>

          {/* Footer avec actions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                color: '#cbd5e1',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Save size={18} />
                Précédent
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.2))',
                  color: '#22d3ee',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Save size={18} />
                  Sauvegarder
                </button>
                <button style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2))',
                  color: '#4ade80',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={18} />
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Interface de la carte principale (UTILISE VOS STYLES EXISTANTS)
  return (
    <>
      {/* Carte Principale avec VOTRE style exact */}
      <div 
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          ...(isSelected ? {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))',
            border: '1px solid #3b82f6',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
          } : {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          })
        }}
        onClick={onToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : 'rgba(100, 116, 139, 0.3)';
          e.currentTarget.style.boxShadow = isSelected ? '0 8px 32px rgba(59, 130, 246, 0.3)' : 'none';
        }}
      >
        {/* Effet de brillance au hover */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }} />
        
        {/* Indicateur de priorité critique */}
        {permit.priority === 'critical' && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: 'linear-gradient(180deg, #ef4444, #dc2626)',
            borderRadius: '20px 0 0 20px'
          }} />
        )}

        {/* Header avec votre layout exact */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', width: '48px', textAlign: 'center', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            {getCategoryIcon()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '700', 
              margin: '0 0 6px', 
              lineHeight: 1.3,
              transition: 'color 0.3s ease'
            }}>
              {permit.name}
            </h3>
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '6px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {permit.category}
            </div>
            <div style={{ 
              color: '#cbd5e1', 
              fontSize: '14px', 
              lineHeight: 1.5, 
              marginBottom: '8px' 
            }}>
              {permit.description}
            </div>
            <div style={{ 
              color: '#60a5fa', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              {permit.authority}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <span style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: `${getComplianceColor()}20`,
                color: getComplianceColor()
              }}>
                {permit.complianceLevel.toUpperCase()}
              </span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>
                {permit.lastUpdated}
              </span>
            </div>
          </div>
          
          {/* Checkbox premium avec votre style */}
          <div style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(100, 116, 139, 0.5)',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            ...(isSelected && {
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderColor: '#3b82f6',
              color: 'white',
              transform: 'scale(1.1)'
            })
          }}>
            {isSelected && <CheckCircle size={18} />}
          </div>
        </div>

        {/* Métadonnées avec votre grid exact */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: `${getPriorityColor()}20`,
              color: getPriorityColor()
            }}>
              {permit.priority}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: `${getStatusColor()}20`,
              color: getStatusColor()
            }}>
              {permit.status}
            </span>
          </div>
          {hasViolations && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backgroundColor: '#ef444420',
                color: '#ef4444'
              }}>
                ⚠️ NON CONFORME
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <Clock size={12} />
            {permit.processingTime}
          </div>
        </div>

        {/* Actions (visible si sélectionné) avec votre style exact */}
        {isSelected && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Votre logique de remplissage
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Edit size={14} />
              Remplir
            </button>
            
            <button style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
              color: '#cbd5e1'
            }}>
              <Shield size={14} />
              Valider
            </button>
            
            <button style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
              color: '#cbd5e1'
            }}>
              <Download size={14} />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Modal du formulaire */}
      {renderFormModal()}
    </>
  );
};

// Export du composant pour utilisation dans votre code principal
export default PermitCardUltraPremium;
// =================== SECTION 4A: PermitCard Ultra-Premium ===================
// À coller après votre Section 3 dans Step4Permits.tsx

// Composant PermitCard ultra-premium (COMPATIBLE avec votre code existant)
const PermitCardUltraPremium: React.FC<{
  permit: Permit;
  isSelected: boolean;
  isExpanded: boolean;
  complianceChecks: ComplianceCheck[];
  workers: WorkerEntry[];
  photos: PhotoEntry[];
  currentSection: string;
  currentPhotoIndex: number;
  viewMode: 'carousel' | 'grid';
  onToggle: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddWorker: (worker: WorkerEntry) => void;
  onRemoveWorker: (workerId: number) => void;
  onPhotoIndexChange: (index: number) => void;
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
}> = ({ 
  permit, 
  isSelected, 
  isExpanded, 
  complianceChecks, 
  workers, 
  photos, 
  currentSection,
  currentPhotoIndex,
  viewMode,
  onToggle, 
  onFieldChange,
  onAddWorker,
  onRemoveWorker,
  onPhotoIndexChange,
  onViewModeChange
}) => {
  // État local pour la gestion du formulaire
  const [currentFormSection, setCurrentFormSection] = useState('identification');
  const hasViolations = complianceChecks.some(check => check.status === 'non-compliant');

  // IMPORTANT: Utilise EXACTEMENT votre logique existante
  const getCategoryIcon = () => {
    const categoryKey = permit.category === 'Safety' ? 'Sécurité' : 
                       permit.category === 'Construction' ? 'Construction' :
                       permit.category === 'Radiation Protection' ? 'Radioprotection' :
                       permit.category === 'Equipment' ? 'Équipements' : permit.category;
    
    switch (categoryKey) {
      case 'Sécurité': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': return '☢️';
      case 'Équipements': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = () => {
    switch (permit.priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = () => {
    switch (permit.status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getComplianceColor = () => {
    switch (permit.complianceLevel) {
      case 'critical': return '#dc2626';
      case 'enhanced': return '#059669';
      case 'standard': return '#2563eb';
      case 'basic': return '#64748b';
      default: return '#6b7280';
    }
  };

  // Sections disponibles pour le formulaire
  const formSections = {
    identification: ['space_identification', 'project_name', 'location_precise', 'permit_date'],
    gas_monitoring: ['oxygen_level', 'combustible_gas_level', 'carbon_monoxide_level', 'continuous_monitoring'],
    workers: ['worker_age_verification', 'authorized_workers'],
    photos: ['photos_documentation'],
    signatures: ['supervisor_signature', 'attendant_signature']
  };

  // Fonction pour rendre le modal du formulaire avec VOTRE style glassmorphisme
  const renderFormModal = () => {
    if (!isExpanded) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.95) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}>
          {/* Header Premium avec glassmorphisme */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '40px' }}>{getCategoryIcon()}</div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 8px'
                  }}>
                    {permit.name}
                  </h2>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>{permit.description}</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Navigation par sections avec design premium */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {Object.keys(formSections).map((section) => (
                <button
                  key={section}
                  onClick={() => setCurrentFormSection(section)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    ...(currentFormSection === section ? {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    } : {
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      border: '1px solid rgba(100, 116, 139, 0.3)'
                    })
                  }}
                  onMouseEnter={(e) => {
                    if (currentFormSection !== section) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentFormSection !== section) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.target.style.color = '#94a3b8';
                    }
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu du formulaire avec composants ultra-premium */}
          <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
            {currentFormSection === 'workers' && (
              <WorkerCardUltraPremium 
                workers={workers}
                onAddWorker={onAddWorker}
                onRemoveWorker={onRemoveWorker}
              />
            )}
            
            {currentFormSection === 'photos' && (
              <PhotoGalleryUltraPremium
                photos={photos}
                currentIndex={currentPhotoIndex}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                onNavigate={onPhotoIndexChange}
              />
            )}
            
            {!['workers', 'photos'].includes(currentFormSection) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {formSections[currentFormSection]?.map((fieldId) => (
                  <FormFieldUltraPremium
                    key={fieldId}
                    label={fieldId.replace('_', ' ').charAt(0).toUpperCase() + fieldId.slice(1).replace('_', ' ')}
                    value={permit.formData?.[fieldId] || ''}
                    onChange={(value) => onFieldChange(fieldId, value)}
                    type={fieldId.includes('date') ? 'date' : fieldId.includes('level') ? 'number' : 'text'}
                    required={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(100, 116, 139, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                color: '#cbd5e1',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Save size={18} />
                Précédent
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.2))',
                  color: '#22d3ee',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Save size={18} />
                  Sauvegarder
                </button>
                <button style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2))',
                  color: '#4ade80',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={18} />
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  };

// =================== EXPORT FINAL ===================
// Remplacez votre PermitForm existant par PermitCardUltraPremium dans votre code principal
export default PermitCardUltraPremium;
  };

  // Interface de la carte principale (UTILISE VOS STYLES EXISTANTS)
  return (
    <>
      {/* Carte Principale avec VOTRE style exact */}
      <div 
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          ...(isSelected ? {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))',
            border: '1px solid #3b82f6',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
          } : {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6))',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          })
        }}
        onClick={onToggle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : 'rgba(100, 116, 139, 0.3)';
          e.currentTarget.style.boxShadow = isSelected ? '0 8px 32px rgba(59, 130, 246, 0.3)' : 'none';
        }}
      >
        {/* Effet de brillance au hover */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }} />
        
        {/* Indicateur de priorité critique */}
        {permit.priority === 'critical' && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: 'linear-gradient(180deg, #ef4444, #dc2626)',
            borderRadius: '20px 0 0 20px'
          }} />
        )}

        {/* Header avec votre layout exact */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', width: '48px', textAlign: 'center', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>
            {getCategoryIcon()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '700', 
              margin: '0 0 6px', 
              lineHeight: 1.3,
              transition: 'color 0.3s ease'
            }}>
              {permit.name}
            </h3>
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '6px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {permit.category}
            </div>
            <div style={{ 
              color: '#cbd5e1', 
              fontSize: '14px', 
              lineHeight: 1.5, 
              marginBottom: '8px' 
            }}>
              {permit.description}
            </div>
            <div style={{ 
              color: '#60a5fa', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              {permit.authority}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <span style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: `${getComplianceColor()}20`,
                color: getComplianceColor()
              }}>
                {permit.complianceLevel.toUpperCase()}
              </span>
              <span style={{ fontSize: '9px', color: '#64748b' }}>
                {permit.lastUpdated}
              </span>
            </div>
          </div>
          
          {/* Checkbox premium avec votre style */}
          <div style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(100, 116, 139, 0.5)',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            ...(isSelected && {
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderColor: '#3b82f6',
              color: 'white',
              transform: 'scale(1.1)'
            })
          }}>
            {isSelected && <CheckCircle size={18} />}
          </div>
        </div>

        {/* Métadonnées avec votre grid exact */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: `${getPriorityColor()}20`,
              color: getPriorityColor()
            }}>
              {permit.priority}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: `${getStatusColor()}20`,
              color: getStatusColor()
            }}>
              {permit.status}
            </span>
          </div>
          {hasViolations && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backgroundColor: '#ef444420',
                color: '#ef4444'
              }}>
                ⚠️ NON CONFORME
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <Clock size={12} />
            {permit.processingTime}
          </div>
        </div>

        {/* Actions (visible si sélectionné) avec votre style exact */}
        {isSelected && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Votre logique de remplissage
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Edit size={14} />
              Remplir
            </button>
            
            <button style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
              color: '#cbd5e1'
            }}>
              <Shield size={14} />
              Valider
            </button>
            
            <button style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
              color: '#cbd5e1'
            }}>
              <Download size={14} />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Modal du formulaire */}
      {renderFormModal()}
    </>
  );
};

// =================== SECTION 4B: Composants Ultra-Premium ===================

// Composant FormField ultra-premium (COMPATIBLE avec votre validation)
const FormFieldUltraPremium: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  options?: string[];
  validation?: any;
}> = ({ label, value, onChange, type = 'text', required = false, options, validation }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = required && !value;
  const isValid = validation ? validation.isValid : !hasError;

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '13px', 
        fontWeight: '600', 
        color: '#e2e8f0', 
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
        {validation?.critical && (
          <span style={{
            padding: '2px 6px',
            fontSize: '8px',
            fontWeight: '700',
            textTransform: 'uppercase',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            color: 'white',
            animation: 'pulse 1s infinite'
          }}>
            🚨 CRITIQUE
          </span>
        )}
        {validation?.legal && (
          <span style={{
            padding: '2px 6px',
            fontSize: '8px',
            fontWeight: '700',
            textTransform: 'uppercase',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white'
          }}>
            ⚖️ LÉGAL
          </span>
        )}
      </label>
      
      {type === 'select' && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            backdropFilter: 'blur(20px)',
            color: '#ffffff',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            ...(isFocused && {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
            }),
            ...(hasError && {
              borderColor: '#ef4444',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.9))'
            })
          }}
          required={required}
        >
          <option value="" style={{ background: '#1e293b', color: '#ffffff' }}>Sélectionner...</option>
          {options.map((option) => (
            <option key={option} value={option} style={{ background: '#1e293b', color: '#ffffff' }}>
              {option}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            backdropFilter: 'blur(20px)',
            color: '#ffffff',
            fontSize: '14px',
            minHeight: '100px',
            resize: 'none',
            transition: 'all 0.3s ease',
            ...(isFocused && {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
            }),
            ...(hasError && {
              borderColor: '#ef4444',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.9))'
            })
          }}
          required={required}
        />
      ) : type === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.3s ease' }}>
          <input
            type="checkbox"
            checked={(() => {
              if (typeof value === 'boolean') return value;
              if (typeof value === 'string') return value === 'true' || value === '1';
              if (typeof value === 'number') return value === 1;
              return false;
            })()}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '8px',
            border: '2px solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            ...(value ? {
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderColor: '#3b82f6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            } : {
              borderColor: '#64748b',
              background: 'rgba(15, 23, 42, 0.5)'
            })
          }}>
            {value && <CheckCircle size={16} style={{ color: 'white' }} />}
          </div>
          <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{label}</span>
        </label>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            backdropFilter: 'blur(20px)',
            color: '#ffffff',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            ...(isFocused && {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
            }),
            ...(hasError && {
              borderColor: '#ef4444',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.9))'
            })
          }}
          required={required}
        />
      )}
      
      {hasError && (
        <p style={{ 
          color: '#ef4444', 
          fontSize: '12px', 
          marginTop: '4px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px' 
        }}>
          <AlertCircle size={12} />
          Ce champ est requis
        </p>
      )}
      
      {validation?.message && (
        <p style={{ color: '#60a5fa', fontSize: '12px', marginTop: '4px' }}>
          {validation.message}
        </p>
      )}
    </div>
  );
};

// Composant PhotoGallery ultra-premium avec carrousel/grille
const PhotoGalleryUltraPremium: React.FC<{
  photos: PhotoEntry[];
  currentIndex: number;
  viewMode: 'carousel' | 'grid';
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
  onNavigate: (index: number) => void;
}> = ({ photos, currentIndex, viewMode, onViewModeChange, onNavigate }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Votre logique d'upload - intégration avec votre système existant
    console.log('Files dropped:', e.dataTransfer.files);
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Header avec contrôles premium */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📸 Galerie Photos ({photos.length})
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onViewModeChange('carousel')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
              fontWeight: '600',
              ...(viewMode === 'carousel' ? {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              } : {
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              })
            }}
          >
            🎠 Carrousel
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
              fontWeight: '600',
              ...(viewMode === 'grid' ? {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              } : {
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              })
            }}
          >
            🏗️ Grille
          </button>
        </div>
      </div>

      {/* Zone de drop premium avec glassmorphisme */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.02))',
          backdropFilter: 'blur(10px)',
          marginBottom: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.02))';
        }}
      >
        <Upload size={48} style={{ margin: '0 auto 16px', color: '#60a5fa' }} />
        <p style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>
          📁 Glissez vos photos ici ou
        </p>
        <button style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
          color: '#60a5fa',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          📂 Parcourir les fichiers
        </button>
      </div>

      {/* Affichage des photos selon le mode */}
      {photos.length > 0 ? (
        <div style={viewMode === 'carousel' ? { marginBottom: '16px' } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {viewMode === 'carousel' ? (
            <div style={{ position: 'relative' }}>
              <div style={{
                aspectRatio: '16/9',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <img
                  src={photos[currentIndex]?.url || '/api/placeholder/800/450'}
                  alt={photos[currentIndex]?.description || 'Photo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              {/* Navigation premium avec points illuminés */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '8px' }}>
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      ...(index === currentIndex ? {
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        transform: 'scale(1.25)',
                        boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)'
                      } : {
                        background: 'rgba(255, 255, 255, 0.2)'
                      })
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            photos.map((photo, index) => (
              <div
                key={photo.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => onNavigate(index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.description}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.3s ease'
                }}>
                  <button style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    border: 'none',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Eye size={20} style={{ color: 'white' }} />
                  </button>
                </div>
                <button style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '50%',
                  border: 'none',
                  backdropFilter: 'blur(10px)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}>
                  <Trash2 size={16} style={{ color: '#fca5a5' }} />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#64748b',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '16px',
          border: '1px dashed rgba(100, 116, 139, 0.3)'
        }}>
          <Camera size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Aucune photo ajoutée</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>
            Glissez des photos ou cliquez sur "Parcourir"
          </p>
        </div>
      )}
    </div>
  );
};

// Composant WorkerCard avec validation âge 18+ premium
const WorkerCardUltraPremium: React.FC<{
  workers: WorkerEntry[];
  onAddWorker: (worker: WorkerEntry) => void;
  onRemoveWorker: (workerId: number) => void;
}> = ({ workers, onAddWorker, onRemoveWorker }) => {
  const [showForm, setShowForm] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    age: '',
    certification: '',
    entryTime: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddWorker = () => {
    const age = parseInt(newWorker.age);
    if (newWorker.name && newWorker.age && age >= 18) {
      onAddWorker({
        id: Date.now(),
        name: newWorker.name,
        age: age,
        certification: newWorker.certification,
        entryTime: newWorker.entryTime,
        exitTime: null,
        date: newWorker.date
      });
      setNewWorker({ name: '', age: '', certification: '', entryTime: '', date: newWorker.date });
      setShowForm(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👥 Travailleurs Autorisés ({workers.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2))',
            color: '#4ade80',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Plus size={16} />
          Ajouter Travailleur
        </button>
      </div>

      {/* Formulaire d'ajout premium */}
      {showForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <FormFieldUltraPremium
              label="Nom complet"
              value={newWorker.name}
              onChange={(value) => setNewWorker({...newWorker, name: value})}
              required
            />
            <FormFieldUltraPremium
              label="Âge"
              value={newWorker.age}
              onChange={(value) => setNewWorker({...newWorker, age: value})}
              type="number"
              required
              validation={{
                isValid: parseInt(newWorker.age) >= 18,
                critical: parseInt(newWorker.age) < 18 && newWorker.age !== '',
                message: parseInt(newWorker.age) < 18 && newWorker.age !== '' ? "⚠️ CRITIQUE: Âge minimum 18 ans requis (RSST Art. 298)" : ""
              }}
            />
            <FormFieldUltraPremium
              label="Certification SST"
              value={newWorker.certification}
              onChange={(value) => setNewWorker({...newWorker, certification: value})}
              required
            />
            <FormFieldUltraPremium
              label="Heure d'entrée"
              value={newWorker.entryTime}
              onChange={(value) => setNewWorker({...newWorker, entryTime: value})}
              type="time"
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddWorker}
              disabled={!newWorker.name || !newWorker.age || parseInt(newWorker.age) < 18}
              style={{
                padding: '12px 24px',
                background: parseInt(newWorker.age) >= 18 && newWorker.name ? 
                  'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.2))' : 
                  'rgba(100, 116, 139, 0.2)',
                color: parseInt(newWorker.age) >= 18 && newWorker.name ? '#4ade80' : '#64748b',
                borderRadius: '12px',
                border: `1px solid ${parseInt(newWorker.age) >= 18 && newWorker.name ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                cursor: parseInt(newWorker.age) >= 18 && newWorker.name ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              ✅ Ajouter Travailleur
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2))',
                color: '#cbd5e1',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              ❌ Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des travailleurs avec design premium */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {workers.map((worker) => (
          <div
            key={worker.id}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))',
              backdropFilter: 'blur(20px)',
              border: worker.age < 18 ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s ease',
              ...(worker.age < 18 && {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.8))',
                animation: 'pulse 2s infinite'
              })
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = worker.age < 18 ? '#ef4444' : 'rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = worker.age < 18 ? '#ef4444' : 'rgba(100, 116, 139, 0.3)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: worker.age < 18 ? 
                    'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))' :
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={24} style={{ color: worker.age < 18 ? '#fca5a5' : '#60a5fa' }} />
                </div>
                <div>
                  <h4 style={{ 
                    fontWeight: '600', 
                    color: '#ffffff', 
                    margin: '0 0 4px',
                    fontSize: '16px'
                  }}>
                    {worker.name}
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#cbd5e1', 
                    margin: '0 0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{worker.age} ans</span>
                    <span>•</span>
                    <span>{worker.certification}</span>
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#94a3b8', 
                    margin: 0 
                  }}>
                    Entrée: {worker.entryTime} {worker.exitTime && `• Sortie: ${worker.exitTime}`}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {worker.age < 18 && (
                  <span style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))',
                    color: '#fca5a5',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    animation: 'pulse 1s infinite'
                  }}>
                    ⚠️ MINEUR - INTERDIT
                  </span>
                )}
                <button
                  onClick={() => onRemoveWorker(worker.id)}
                  style={{
                    padding: '8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {workers.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px', 
          color: '#64748b',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '16px',
          border: '1px dashed rgba(100, 116, 139, 0.3)'
        }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ margin: '0 0 8px', fontSize: '14px' }}>Aucun travailleur enregistré</p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
            Cliquez sur "Ajouter Travailleur" pour commencer
          </p>
        </div>
      )}
    </div>
  );
