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
// =================== SECTION 4: COMPOSANTS UI PREMIUM MOBILE ===================
// À coller après la Section 3 dans votre fichier Step4Permits.tsx

// Composant PermitCard premium avec vue mobile/desktop
const PermitCard: React.FC<{
  permit: Permit;
  isSelected: boolean;
  isExpanded: boolean;
  complianceChecks: ComplianceCheck[];
  workers: WorkerEntry[];
  photos: PhotoEntry[];
  currentSection: string;
  currentPhotoIndex: number;
  viewMode: 'carousel' | 'grid';
  onSelect: () => void;
  onFill: () => void;
  onValidate: () => void;
  onGeneratePDF: () => void;
  onExpand: () => void;
  onToggle: () => void;
  onSectionChange: (section: string) => void;
  onComplianceUpdate: (checks: ComplianceCheck[]) => void;
  onWorkersUpdate: (workers: WorkerEntry[]) => void;
  onPhotosUpdate: (photos: PhotoEntry[]) => void;
  onPhotoIndexChange: (index: number) => void;
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
  onSaveProgress: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddWorker: () => void;
  onRemoveWorker: (workerId: number) => void;
  onUpdateWorker: (workerId: number, field: keyof WorkerEntry, value: any) => void;
  onPhotoUpload: (files: File[]) => void;
  onRemovePhoto: (photoId: number) => void;
  t: any;
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
  onSelect, 
  onFill, 
  onValidate, 
  onGeneratePDF,
  onExpand,
  onToggle,
  onSectionChange,
  onComplianceUpdate,
  onWorkersUpdate,
  onPhotosUpdate,
  onPhotoIndexChange,
  onViewModeChange,
  onSaveProgress,
  onFieldChange,
  onAddWorker,
  onRemoveWorker,
  onUpdateWorker,
  onPhotoUpload,
  onRemovePhoto,
  t
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critique': 
      case 'Critical': 
        return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
      case 'En Attente': 
      case 'Pending': 
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'En Cours': 
      case 'In Progress': 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Validé': 
      case 'Approved': 
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Espace Clos':
      case 'Confined Space':
        return '🛡️';
      case 'Travail à Chaud':
      case 'Hot Work':
        return '🔥';
      case 'Excavation':
        return '🏗️';
      default:
        return '📋';
    }
  };

  if (!isExpanded) {
    // Vue carte compacte - Mobile optimisée
    return (
      <div className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-xl lg:rounded-2xl p-4 lg:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
        isSelected 
          ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
          : 'border-slate-700/50 hover:border-slate-600/50'
      }`}>
        {/* Header de la carte */}
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex items-center gap-2 lg:gap-3 flex-1">
            <div className="text-2xl lg:text-3xl flex-shrink-0">{getIconForType(permit.type)}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-base lg:text-lg truncate">{permit.type}</h3>
              <p className="text-gray-400 text-xs lg:text-sm truncate">{permit.norm}</p>
            </div>
          </div>
          <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium border flex-shrink-0 ${getStatusColor(permit.status)}`}>
            {permit.status}
          </span>
        </div>

        {/* Description - Collapsible sur mobile */}
        <p className="text-gray-300 text-sm lg:text-base mb-3 lg:mb-4 leading-relaxed line-clamp-2 lg:line-clamp-none">
          {permit.description}
        </p>

        {/* Champs obligatoires */}
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <span className="text-blue-400 text-xs lg:text-sm font-medium">
            {permit.requiredFields} champs obligatoires
          </span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Actions - Layout mobile empilé */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
          <button
            onClick={onFill}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm lg:text-base"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">Remplir</span>
          </button>
          
          <button
            onClick={onValidate}
            className={`flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm lg:text-base ${
              permit.status === 'Validé' || permit.status === 'Approved'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Valider</span>
          </button>
          
          <button
            onClick={onGeneratePDF}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg text-sm lg:text-base"
            disabled={permit.status === 'En Attente' || permit.status === 'Pending'}
          >
            <Download className="h-4 w-4" />
            <span className="font-medium">PDF</span>
          </button>
        </div>

        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
          </div>
        )}
      </div>
    );
  }

  // Vue formulaire étendue - Mobile-first
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl lg:rounded-2xl overflow-hidden">
      {/* Header mobile avec navigation */}
      <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onExpand}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors touch-target"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm lg:text-base">Retour</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-gray-300">Sauvegarde auto</span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Titre du formulaire */}
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="text-2xl lg:text-3xl">{getIconForType(permit.type)}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl lg:text-2xl font-bold text-white truncate">{permit.type}</h2>
            <p className="text-gray-400 text-sm lg:text-base truncate">{permit.norm}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs lg:text-sm font-medium border flex-shrink-0 ${getStatusColor(permit.status)}`}>
            {permit.status}
          </span>
        </div>

        {/* Boutons d'action principaux - Mobile stack */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <button
            onClick={onValidate}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg touch-target"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm lg:text-base font-medium">Valider conformité</span>
          </button>
          
          <button
            onClick={onSaveProgress}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg touch-target"
          >
            <Clock className="h-5 w-5" />
            <span className="text-sm lg:text-base font-medium">Sauvegarder</span>
          </button>
          
          <button
            onClick={onGeneratePDF}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg touch-target"
          >
            <Download className="h-5 w-5" />
            <span className="text-sm lg:text-base font-medium">Soumettre</span>
          </button>
        </div>

        {/* Navigation des sections - Horizontal scroll sur mobile */}
        <div className="mb-6 lg:mb-8">
          <div className="flex gap-2 p-2 bg-slate-900/50 rounded-lg overflow-x-auto scrollbar-thin">
            {Object.keys(permit.sections || {}).map((sectionKey) => (
              <button
                key={sectionKey}
                onClick={() => onSectionChange(sectionKey)}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 touch-target ${
                  currentSection === sectionKey
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {sectionKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu du formulaire selon la section */}
        <div className="space-y-4 lg:space-y-6">
          {renderFormSection(permit, currentSection, complianceChecks, onComplianceUpdate, onFieldChange, t)}
          
          {/* Section Travailleurs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                👷 {t.messages.authorizedWorkers}
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs lg:text-sm rounded-full">
                  {workers.length}
                </span>
              </h3>
              <button
                onClick={onAddWorker}
                className="px-3 lg:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 text-xs lg:text-sm touch-target"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t.messages.addWorker}</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              {workers.map((worker, index) => (
                <WorkerCard
                  key={worker.id || index}
                  worker={worker}
                  index={index}
                  onUpdate={(idx, updatedWorker) => {
                    onUpdateWorker(worker.id || idx, 'name', updatedWorker.name);
                    onUpdateWorker(worker.id || idx, 'age', updatedWorker.age);
                    onUpdateWorker(worker.id || idx, 'certification', updatedWorker.certification);
                    onUpdateWorker(worker.id || idx, 'phone', updatedWorker.phone);
                  }}
                  onRemove={() => onRemoveWorker(worker.id || index)}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Section Photos */}
          <PhotoGallery
            photos={photos}
            currentIndex={currentPhotoIndex}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onNavigate={(direction) => {
              if (direction === 'prev') {
                onPhotoIndexChange(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1);
              } else {
                onPhotoIndexChange(currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0);
              }
            }}
            onRemove={onRemovePhoto}
            onAdd={onPhotoUpload}
            t={t}
          />
        </div>

        {/* Navigation bas de page - Mobile optimisée */}
        <div className="flex justify-between items-center mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-700/50">
          <button
            onClick={onExpand}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-400 hover:text-white transition-colors touch-target"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs lg:text-sm">Précédent</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Sauvegarde automatique</span>
            <span className="sm:hidden">Auto-save</span>
          </div>
          
          <button className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-400 hover:text-white transition-colors touch-target">
            <span className="text-xs lg:text-sm">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction helper pour rendre les sections du formulaire
const renderFormSection = (
  permit: Permit, 
  currentSection: string, 
  complianceChecks: ComplianceCheck[], 
  onComplianceUpdate: (checks: ComplianceCheck[]) => void,
  onFieldChange: (fieldId: string, value: any) => void,
  t: any
) => {
  const sectionData = permit.sections?.[currentSection];
  if (!sectionData) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4">
        {sectionData.title || currentSection.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
      </h3>
      
      {sectionData.fields?.map((field: any, index: number) => {
        const checkKey = `${permit.id}_${currentSection}_${field.key}`;
        const existingCheck = complianceChecks.find(c => c.key === checkKey);
        
        return (
          <FormField
            key={field.key}
            label={field.label}
            value={existingCheck?.value || ''}
            onChange={(value) => {
              onFieldChange(field.key, value);
              
              const updatedChecks = complianceChecks.filter(c => c.key !== checkKey);
              updatedChecks.push({
                key: checkKey,
                requirement: field.label,
                value,
                isValid: field.validation ? validateFieldValue(value, field.validation) : true,
                status: field.validation && validateFieldValue(value, field.validation) ? 'compliant' : 'non-compliant',
                section: currentSection,
                details: '',
                reference: field.legalRef || ''
              });
              onComplianceUpdate(updatedChecks);
            }}
            type={field.type || 'text'}
            required={field.required}
            placeholder={field.placeholder}
            options={field.options}
            isValid={existingCheck?.isValid}
            errorMessage={field.validation?.message}
            legalRef={field.legalRef}
            isLegal={field.isLegal}
            isCritical={field.isCritical}
          />
        );
      })}
    </div>
  );
};

// Fonction de validation des valeurs de champs
const validateFieldValue = (value: any, validation: any): boolean => {
  if (validation.min !== undefined || validation.max !== undefined) {
    const numValue = parseFloat(value) || 0;
    if (validation.min !== undefined && numValue < validation.min) return false;
    if (validation.max !== undefined && numValue > validation.max) return false;
  }
  
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    return regex.test(value);
  }
  
  return true;
};

// Composant FormField avec validation premium - Mobile optimisé
const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: string[];
  isValid?: boolean;
  errorMessage?: string;
  legalRef?: string;
  isLegal?: boolean;
  isCritical?: boolean;
}> = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  required = false, 
  disabled = false,
  placeholder = "",
  options = [],
  isValid,
  errorMessage,
  legalRef,
  isLegal = false,
  isCritical = false
}) => {
  const hasValidation = isValid !== undefined;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm lg:text-base font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {isLegal && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
            LÉGAL
          </span>
        )}
        {isCritical && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse">
            CRITIQUE
          </span>
        )}
      </div>
      
      {legalRef && (
        <p className="text-xs text-gray-400 italic">
          Référence: {legalRef}
        </p>
      )}
      
      <div className="relative">
        {type === "select" && options.length > 0 ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-sm lg:text-base touch-target ${
              hasValidation
                ? isValid
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">{placeholder || `Sélectionner ${label.toLowerCase()}`}</option>
            {options.map((option, index) => (
              <option key={index} value={option} className="bg-slate-700 text-white">
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 resize-none text-sm lg:text-base ${
              hasValidation
                ? isValid
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ) : type === "checkbox" ? (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value === "true" || value === true || value === "1" || value === 1)}
              onChange={(e) => onChange(e.target.checked ? "true" : "false")}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm lg:text-base text-white">{placeholder}</span>
          </label>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-sm lg:text-base touch-target ${
              hasValidation
                ? isValid
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        )}
        
        {hasValidation && type !== "checkbox" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
          </div>
        )}
      </div>
      
      {hasValidation && !isValid && errorMessage && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};

// Composant PhotoGallery avec carousel et grille premium - Mobile optimisé
const PhotoGallery: React.FC<{
  photos: PhotoEntry[];
  currentIndex: number;
  viewMode: 'carousel' | 'grid';
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRemove: (index: number) => void;
  onAdd: (files: File[]) => void;
  t: any;
}> = ({ photos, currentIndex, viewMode, onViewModeChange, onNavigate, onRemove, onAdd, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header avec contrôles - Mobile optimisé */}
      <div className="flex items-center justify-between">
        <h3 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
          📸 {t.messages.sitePhotos}
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs lg:text-sm rounded-full">
            {photos.length}
          </span>
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Sélecteur de vue - Hidden sur très petit écran */}
          <div className="hidden sm:flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('carousel')}
              className={`px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-all duration-200 touch-target ${
                viewMode === 'carousel'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Carrousel
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-all duration-200 touch-target ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grille
            </button>
          </div>
          
          {/* Bouton d'ajout */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 lg:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2 text-xs lg:text-sm touch-target"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length === 0 ? (
        /* Zone de drop vide - Mobile optimisée */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-xl p-6 lg:p-8 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-slate-800/30 touch-target"
        >
          <div className="space-y-3">
            <Camera className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto" />
            <p className="text-gray-400 text-sm lg:text-base">{t.messages.clickToAddPhotos}</p>
            <p className="text-xs lg:text-sm text-gray-500">JPG, PNG jusqu'à 10MB</p>
          </div>
        </div>
      ) : (
        /* Galerie photos */
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 lg:p-4">
          {viewMode === 'carousel' ? (
            /* Mode Carrousel - Mobile optimisé */
            <div className="space-y-3 lg:space-y-4">
              {/* Image principale */}
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <img
                  src={photos[currentIndex]?.url}
                  alt={photos[currentIndex]?.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Contrôles de navigation - Plus gros sur mobile */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => onNavigate('prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 lg:p-3 rounded-full hover:bg-black/70 transition-colors touch-target"
                    >
                      <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                    <button
                      onClick={() => onNavigate('next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 lg:p-3 rounded-full hover:bg-black/70 transition-colors touch-target"
                    >
                      <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                  </>
                )}
                
                {/* Bouton suppression */}
                <button
                  onClick={() => onRemove(currentIndex)}
                  className="absolute top-2 right-2 bg-red-500/80 text-white p-2 lg:p-3 rounded-full hover:bg-red-600 transition-colors touch-target"
                >
                  <X className="h-3 w-3 lg:h-4 lg:w-4" />
                </button>
                
                {/* Indicateur position */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs lg:text-sm">
                  {currentIndex + 1} / {photos.length}
                </div>
              </div>
              
              {/* Miniatures - Scroll horizontal sur mobile */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => onNavigate(index === currentIndex ? 'next' : index > currentIndex ? 'next' : 'prev')}
                      className={`flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 touch-target ${
                        index === currentIndex
                          ? 'border-blue-500 shadow-lg scale-110'
                          : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mode Grille - Responsive grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="group relative aspect-square bg-slate-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay au hover - Plus visible sur mobile */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => onRemove(index)}
                      className="bg-red-500 text-white p-2 lg:p-3 rounded-full hover:bg-red-600 transition-colors touch-target"
                    >
                      <X className="h-3 w-3 lg:h-4 lg:w-4" />
                    </button>
                  </div>
                  
                  {/* Info photo */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant WorkerCard premium - Mobile optimisé
const WorkerCard: React.FC<{
  worker: WorkerEntry;
  index: number;
  onUpdate: (index: number, worker: WorkerEntry) => void;
  onRemove: (index: number) => void;
  t: any;
}> = ({ worker, index, onUpdate, onRemove, t }) => {
  const isMinor = worker.age < 18;
  
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-3 lg:p-4 space-y-3 lg:space-y-4 transition-all duration-300 ${
      isMinor 
        ? 'border-red-500/50 bg-red-500/10 shadow-red-500/20 shadow-lg' 
        : 'border-slate-700/50 hover:border-slate-600/50'
    }`}>
      {/* Header de la carte */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white flex items-center gap-2 text-sm lg:text-base">
          👷 {t.messages.workerNumber} {index + 1}
          {isMinor && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse">
              MINEUR INTERDIT
            </span>
          )}
        </h4>
        <button
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 transition-colors p-1 touch-target"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Alerte mineur */}
      {isMinor && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-xs lg:text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            LÉGALEMENT INTERDIT: Travailleur mineur (moins de 18 ans)
          </p>
          <p className="text-red-300 text-xs mt-1">
            RSST Art. 53: Accès interdit aux espaces clos pour les mineurs
          </p>
        </div>
      )}

      {/* Formulaire travailleur - Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <FormField
          label={t.messages.fullName}
          value={worker.name}
          onChange={(value) => onUpdate(index, { ...worker, name: value })}
          placeholder="Nom du travailleur"
          required
          isValid={worker.name.length >= 2}
          errorMessage="Nom requis (minimum 2 caractères)"
        />
        
        <FormField
          label={t.messages.age}
          type="number"
          value={worker.age.toString()}
          onChange={(value) => onUpdate(index, { ...worker, age: parseInt(value) || 0 })}
          placeholder="Âge en années"
          required
          isValid={worker.age >= 18}
          errorMessage={worker.age < 18 ? "Âge minimum 18 ans légalement requis" : ""}
          isCritical={worker.age < 18}
          legalRef="RSST Art. 53"
        />
        
        <FormField
          label={t.messages.certification}
          type="select"
          value={worker.certification}
          onChange={(value) => onUpdate(index, { ...worker, certification: value })}
          options={[t.messages.basicTraining, t.messages.advancedTraining, t.messages.supervisor, t.messages.rescuer]}
          required
          isValid={worker.certification !== ''}
          isLegal={worker.certification === t.messages.rescuer}
        />
        
        <FormField
          label="Téléphone d'urgence"
          value={worker.phone}
          onChange={(value) => onUpdate(index, { ...worker, phone: value })}
          placeholder="(514) 555-0123"
          required
          isValid={worker.phone.length >= 10}
          errorMessage="Numéro de téléphone requis"
        />
      </div>
    </div>
  );
};

// Export du composant principal
export default Step4Permits;
