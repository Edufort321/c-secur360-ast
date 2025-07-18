// =================== SECTION 1: INTERFACES ET TRADUCTIONS COMPLÈTES ===================
// À coller au début de votre fichier Step4Permits.tsx

"use client";
import React, { useState, useMemo, useEffect } from 'react';
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
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  formData?: any;
  formFields?: FormField[];
  complianceLevel: 'basic' | 'standard' | 'enhanced' | 'critical';
  lastUpdated: string;
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

interface WorkerEntry {
  id: number;
  name: string;
  age: number;
  certification: string;
  entryTime: string;
  exitTime: string | null;
  date: string;
  oxygenLevel?: number;
  gasLevel?: number;
  over18: boolean;
}

interface PhotoEntry {
  id: number;
  url: string;
  name: string;
  timestamp: string;
  description: string;
  gpsLocation?: string;
  compliance?: boolean;
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
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  reference: string;
}

// =================== FONCTION DE TRADUCTION BILINGUE SANS DOUBLONS ===================
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
        available: 'Permis disponibles',
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
        modifySearch: 'Modifiez vos critères de recherche pour voir plus de permis',
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
        addDescription: 'Ajouter une description à cette photo...',
        photo: 'photo',
        photos: 'photos',
        photoOf: 'Photo',
        of: 'sur',
        provinces: 'provinces',
        criticalViolation: 'VIOLATION CRITIQUE - Arrêt des travaux requis',
        complianceCheck: 'Vérification de conformité en cours...',
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
        certifyOver18: 'Je certifie que ce travailleur a 18 ans ou plus (OBLIGATOIRE - Art. 298 RSST)',
        legalViolationMinor: 'VIOLATION LÉGALE: Travailleur mineur détecté. Accès en espace clos interdit par l\'Article 298 RSST.',
        selectCertification: 'Sélectionner certification',
        basicTraining: 'Formation de base',
        advancedTraining: 'Formation avancée',
        supervisor: 'Superviseur',
        rescuer: 'Sauveteur',
        authorizedWorkers: 'Travailleurs Autorisés',
        sitePhotos: 'Photos du Site',
        toggleView: 'Basculer vue',
        addPhotos: '📷 Ajouter des photos',
        noPhotosAdded: 'Aucune photo ajoutée',
        clickToAddPhotos: 'Cliquez sur "Ajouter Photos" pour commencer',
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
        available: 'Available permits',
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
        modifySearch: 'Modify your search criteria to see more permits',
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
        addDescription: 'Add description to this photo...',
        photo: 'photo',
        photos: 'photos',
        photoOf: 'Photo',
        of: 'of',
        provinces: 'provinces',
        criticalViolation: 'CRITICAL VIOLATION - Work stoppage required',
        complianceCheck: 'Compliance verification in progress...',
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
        certifyOver18: 'I certify this worker is 18+ years old (MANDATORY - Art. 298 RSST)',
        legalViolationMinor: 'LEGAL VIOLATION: Minor worker detected. Confined space access prohibited by Article 298 RSST.',
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
        clickToAddPhotos: 'Click "Add Photos" to start',
        savePermit: 'Save Permit',
        downloadPDF: 'Download PDF'
      }
    };
  }
};
// =================== SECTION 2: BASE DE DONNÉES PERMIS CONFORMES SANS ERREURS ===================
// À coller après la Section 1

// =================== BASE DE DONNÉES PERMIS CONFORMES AUX NORMES 2024-2025 ===================
const translatePermitsDatabase = (language: 'fr' | 'en'): Permit[] => {
  const basePermits: Permit[] = [
    
    // 1. PERMIS ESPACE CLOS CONFORME RSST 2023-2025
    {
      id: 'confined-space-entry-2025',
      name: language === 'fr' ? 'Permis d\'Entrée en Espace Clos Conforme RSST 2023' : 'Confined Space Entry Permit RSST 2023 Compliant',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme aux modifications RSST 2023-2025 avec surveillance atmosphérique continue et plan de sauvetage personnalisé' : 'Permit compliant with RSST 2023-2025 modifications including continuous atmospheric monitoring and personalized rescue plan',
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
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      formFields: [
        // SECTION IDENTIFICATION
        { 
          id: 'space_identification', 
          type: 'text', 
          label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification', 
          required: true, 
          section: 'identification', 
          placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 300' 
        },
        { 
          id: 'project_name', 
          type: 'text', 
          label: language === 'fr' ? 'Nom du projet' : 'Project name', 
          required: true, 
          section: 'identification' 
        },
        { 
          id: 'location_precise', 
          type: 'text', 
          label: language === 'fr' ? 'Localisation GPS précise' : 'Precise GPS location', 
          required: true, 
          section: 'identification', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'permit_date', 
          type: 'date', 
          label: language === 'fr' ? 'Date du permis' : 'Permit date', 
          required: true, 
          section: 'identification' 
        },
        { 
          id: 'permit_time', 
          type: 'time', 
          label: language === 'fr' ? 'Heure d\'émission' : 'Issue time', 
          required: true, 
          section: 'identification' 
        },
        { 
          id: 'permit_duration', 
          type: 'select', 
          label: language === 'fr' ? 'Durée validité (max 8h)' : 'Validity duration (max 8h)', 
          required: true, 
          section: 'identification', 
          options: ['1h', '2h', '4h', '6h', '8h'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 300' 
        },
        
        // SECTION GAS MONITORING OBLIGATOIRE
        { 
          id: 'oxygen_level', 
          type: 'gas_meter', 
          label: language === 'fr' ? 'Niveau oxygène (%)' : 'Oxygen level (%)', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { 
            min: 19.5, 
            max: 23.5, 
            critical: true, 
            legalRequirement: true, 
            message: language === 'fr' ? 'CRITIQUE: O2 doit être entre 19.5% et 23.5%' : 'CRITICAL: O2 must be between 19.5% and 23.5%' 
          }, 
          complianceRef: 'RSST Art. 302 modifié' 
        },
        { 
          id: 'combustible_gas_level', 
          type: 'gas_meter', 
          label: language === 'fr' ? 'Gaz combustibles (% LIE)' : 'Combustible gas (% LEL)', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { 
            min: 0, 
            max: 10, 
            critical: true, 
            legalRequirement: true, 
            message: language === 'fr' ? 'CRITIQUE: Gaz combustibles < 10% LIE obligatoire' : 'CRITICAL: Combustible gas < 10% LEL mandatory' 
          }, 
          complianceRef: 'RSST Art. 302' 
        },
        { 
          id: 'carbon_monoxide_level', 
          type: 'gas_meter', 
          label: language === 'fr' ? 'Monoxyde de carbone (ppm)' : 'Carbon monoxide (ppm)', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { 
            min: 0, 
            max: 35, 
            critical: true, 
            legalRequirement: true, 
            message: language === 'fr' ? 'CRITIQUE: CO < 35 ppm obligatoire' : 'CRITICAL: CO < 35 ppm mandatory' 
          }, 
          complianceRef: 'RSST Annexe I' 
        },
        { 
          id: 'hydrogen_sulfide_level', 
          type: 'gas_meter', 
          label: language === 'fr' ? 'Sulfure d\'hydrogène (ppm)' : 'Hydrogen sulfide (ppm)', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { 
            min: 0, 
            max: 10, 
            critical: true, 
            legalRequirement: true, 
            message: language === 'fr' ? 'CRITIQUE: H2S < 10 ppm obligatoire' : 'CRITICAL: H2S < 10 ppm mandatory' 
          }, 
          complianceRef: 'RSST Annexe I' 
        },
        { 
          id: 'continuous_monitoring', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Surveillance atmosphérique CONTINUE pendant travaux' : 'CONTINUOUS atmospheric monitoring during work', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 302' 
        },
        { 
          id: 'detector_calibration_date', 
          type: 'date', 
          label: language === 'fr' ? 'Date calibration détecteur' : 'Detector calibration date', 
          required: true, 
          section: 'gas_monitoring', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'detector_serial_number', 
          type: 'text', 
          label: language === 'fr' ? 'Numéro série détecteur' : 'Detector serial number', 
          required: true, 
          section: 'gas_monitoring' 
        },
        
        // SECTION ACCÈS ET ÂGE OBLIGATOIRE
        { 
          id: 'entry_mandatory', 
          type: 'radio', 
          label: language === 'fr' ? 'L\'entrée est-elle obligatoire ?' : 'Is entry mandatory?', 
          required: true, 
          section: 'access', 
          options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 297.1' 
        },
        { 
          id: 'external_control_possible', 
          type: 'radio', 
          label: language === 'fr' ? 'Contrôle depuis l\'extérieur possible ?' : 'External control possible?', 
          required: true, 
          section: 'access', 
          options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 297.1 nouveau' 
        },
        { 
          id: 'worker_age_verification', 
          type: 'compliance_check', 
          label: language === 'fr' ? 'VÉRIFICATION: Tous travailleurs ≥ 18 ans' : 'VERIFICATION: All workers ≥ 18 years', 
          required: true, 
          section: 'access', 
          validation: { critical: true, legalRequirement: true }, 
          complianceRef: 'RSST Art. 298 modifié 2023' 
        },
        { 
          id: 'worker_certification_check', 
          type: 'compliance_check', 
          label: language === 'fr' ? 'Certification formation espace clos valide' : 'Valid confined space training certification', 
          required: true, 
          section: 'access', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 298' 
        },
        
        // SECTION PLAN DE SAUVETAGE PERSONNALISÉ
        { 
          id: 'rescue_plan_personalized', 
          type: 'textarea', 
          label: language === 'fr' ? 'Plan de sauvetage PERSONNALISÉ pour cet espace' : 'PERSONALIZED rescue plan for this space', 
          required: true, 
          section: 'rescue_plan', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 309 enrichi', 
          placeholder: language === 'fr' ? 'Décrire procédure spécifique, équipements, points d\'accès...' : 'Describe specific procedure, equipment, access points...' 
        },
        { 
          id: 'rescue_responsible_person', 
          type: 'text', 
          label: language === 'fr' ? 'Responsable sauvetage DÉSIGNÉ' : 'DESIGNATED rescue responsible', 
          required: true, 
          section: 'rescue_plan', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 309' 
        },
        { 
          id: 'communication_protocol', 
          type: 'select', 
          label: language === 'fr' ? 'Protocole communication obligatoire' : 'Mandatory communication protocol', 
          required: true, 
          section: 'rescue_plan', 
          options: language === 'fr' ? ['Radio bidirectionnelle', 'Téléphone cellulaire', 'Signaux visuels/sonores', 'Système fixe'] : ['Two-way radio', 'Cell phone', 'Visual/audio signals', 'Fixed system'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 309' 
        },
        { 
          id: 'rescue_equipment_onsite', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Équipements sauvetage SUR SITE avant entrée' : 'Rescue equipment ON SITE before entry', 
          required: true, 
          section: 'rescue_plan', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 309' 
        },
        { 
          id: 'response_time_target', 
          type: 'select', 
          label: language === 'fr' ? 'Temps de réponse sauvetage' : 'Rescue response time', 
          required: true, 
          section: 'rescue_plan', 
          options: ['< 3 minutes', '< 5 minutes', '< 10 minutes'], 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'emergency_contact_primary', 
          type: 'text', 
          label: language === 'fr' ? 'Contact urgence primaire (nom + tél)' : 'Primary emergency contact (name + phone)', 
          required: true, 
          section: 'rescue_plan', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'emergency_contact_secondary', 
          type: 'text', 
          label: language === 'fr' ? 'Contact urgence secondaire' : 'Secondary emergency contact', 
          required: true, 
          section: 'rescue_plan' 
        },
        
        // SECTION MATIÈRES À ÉCOULEMENT LIBRE
        { 
          id: 'free_flowing_materials', 
          type: 'radio', 
          label: language === 'fr' ? 'Matières à écoulement libre présentes ?' : 'Free-flowing materials present?', 
          required: true, 
          section: 'safety', 
          options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 311-312 séparés' 
        },
        { 
          id: 'burial_risk_assessment', 
          type: 'textarea', 
          label: language === 'fr' ? 'Évaluation risque ensevelissement/noyade' : 'Burial/drowning risk assessment', 
          required: false, 
          section: 'safety', 
          complianceRef: 'RSST Art. 311-312' 
        },
        { 
          id: 'fall_prevention_measures', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Mesures prévention chutes installées' : 'Fall prevention measures installed', 
          required: true, 
          section: 'safety', 
          validation: { legalRequirement: true }, 
          complianceRef: 'RSST Art. 297.1' 
        },
        
        // SECTION TRAVAILLEURS AUTORISÉS
        { 
          id: 'authorized_workers', 
          type: 'textarea', 
          label: language === 'fr' ? 'Travailleurs autorisés (nom, âge, certification)' : 'Authorized workers (name, age, certification)', 
          required: true, 
          section: 'signatures', 
          placeholder: language === 'fr' ? 'Format: Nom, Prénom - Âge: XX ans - Cert: XXXXX' : 'Format: Last, First - Age: XX years - Cert: XXXXX', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'workers_log', 
          type: 'workers_tracking', 
          label: language === 'fr' ? 'Registre entrées/sorties avec surveillance gaz' : 'Entry/exit log with gas monitoring', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'photos_documentation', 
          type: 'photo_gallery', 
          label: language === 'fr' ? 'Photos documentation sécurité obligatoires' : 'Mandatory safety documentation photos', 
          required: true, 
          section: 'atmosphere', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'supervisor_signature', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature surveillant qualifié' : 'Qualified supervisor signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'attendant_signature', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature préposé à l\'entrée' : 'Entry attendant signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        }
      ]
    },

    // 2. PERMIS TRAVAIL À CHAUD CONFORME NFPA 51B-2019
    {
      id: 'hot-work-permit-nfpa2019',
      name: language === 'fr' ? 'Permis Travail à Chaud Conforme NFPA 51B-2019' : 'Hot Work Permit NFPA 51B-2019 Compliant',
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
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      formFields: [
        // SECTION IDENTIFICATION
        { 
          id: 'permit_number_hot', 
          type: 'text', 
          label: language === 'fr' ? 'Numéro de permis unique' : 'Unique permit number', 
          required: true, 
          section: 'identification', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'work_location_precise', 
          type: 'text', 
          label: language === 'fr' ? 'Lieu précis des travaux' : 'Precise work location', 
          required: true, 
          section: 'identification', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'contractor_company', 
          type: 'text', 
          label: language === 'fr' ? 'Entreprise contractante' : 'Contracting company', 
          required: true, 
          section: 'identification' 
        },
        { 
          id: 'work_order_number', 
          type: 'text', 
          label: language === 'fr' ? 'Numéro bon de travail' : 'Work order number', 
          required: true, 
          section: 'identification' 
        },
        
        // SECTION TYPE DE TRAVAIL À CHAUD
        { 
          id: 'work_type_hot', 
          type: 'select', 
          label: language === 'fr' ? 'Type de travail à chaud principal' : 'Primary hot work type', 
          required: true, 
          section: 'work_type', 
          options: language === 'fr' ? ['Soudage à l\'arc électrique', 'Soudage au gaz (oxyacétylénique)', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage avec étincelles', 'Perçage métaux', 'Brasage/Soudage tendre', 'Travaux de toiture à chaud', 'Autre (spécifier)'] : ['Electric arc welding', 'Gas welding (oxyacetylene)', 'Torch cutting', 'Plasma cutting', 'Grinding with sparks', 'Metal drilling', 'Brazing/Soft soldering', 'Hot roofing work', 'Other (specify)'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'NFPA 51B-2019' 
        },
        { 
          id: 'work_description_detailed', 
          type: 'textarea', 
          label: language === 'fr' ? 'Description détaillée des travaux et équipements' : 'Detailed work and equipment description', 
          required: true, 
          section: 'work_type', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'start_date_time', 
          type: 'date', 
          label: language === 'fr' ? 'Date début prévue' : 'Planned start date', 
          required: true, 
          section: 'work_type' 
        },
        { 
          id: 'start_time', 
          type: 'time', 
          label: language === 'fr' ? 'Heure début' : 'Start time', 
          required: true, 
          section: 'work_type' 
        },
        { 
          id: 'end_date_time', 
          type: 'date', 
          label: language === 'fr' ? 'Date fin prévue' : 'Planned end date', 
          required: true, 
          section: 'work_type' 
        },
        { 
          id: 'end_time', 
          type: 'time', 
          label: language === 'fr' ? 'Heure fin' : 'End time', 
          required: true, 
          section: 'work_type' 
        },
        
        // SECTION SURVEILLANCE INCENDIE NFPA 51B-2019
        { 
          id: 'fire_watch_duration', 
          type: 'select', 
          label: language === 'fr' ? 'Durée surveillance incendie POST-TRAVAUX (OBLIGATOIRE)' : 'POST-WORK fire watch duration (MANDATORY)', 
          required: true, 
          section: 'fire_watch', 
          options: ['1 heure (NFPA 51B-2019)', '2 heures', 'Plus de 2 heures'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'NFPA 51B-2019 - Modif majeure: 1h au lieu de 30min' 
        },
        { 
          id: 'continuous_vs_spot_watch', 
          type: 'radio', 
          label: language === 'fr' ? 'Type de surveillance incendie' : 'Fire watch type', 
          required: true, 
          section: 'fire_watch', 
          options: language === 'fr' ? ['Surveillance CONTINUE', 'Surveillance PONCTUELLE'] : ['CONTINUOUS monitoring', 'SPOT monitoring'], 
          validation: { legalRequirement: true }, 
          complianceRef: 'NFPA 51B-2019 - Distinction formelle' 
        },
        { 
          id: 'fire_watch_person_assigned', 
          type: 'text', 
          label: language === 'fr' ? 'Préposé surveillance incendie désigné' : 'Designated fire watch person', 
          required: true, 
          section: 'fire_watch', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'fire_watch_training_valid', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Formation surveillance incendie valide' : 'Valid fire watch training', 
          required: true, 
          section: 'fire_watch', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION RÉINSPECTION PAR QUART
        { 
          id: 'shift_reinspection', 
          type: 'compliance_check', 
          label: language === 'fr' ? 'Réinspection OBLIGATOIRE à chaque quart' : 'MANDATORY reinspection each shift', 
          required: true, 
          section: 'fire_watch', 
          validation: { legalRequirement: true }, 
          complianceRef: 'NFPA 51B-2019 - Nouvelle annexe' 
        },
        { 
          id: 'reinspection_documentation', 
          type: 'textarea', 
          label: language === 'fr' ? 'Documentation des réinspections par quart' : 'Shift reinspection documentation', 
          required: true, 
          section: 'fire_watch', 
          placeholder: language === 'fr' ? 'Heure, responsable, observations, actions...' : 'Time, responsible person, observations, actions...', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION EXTINCTEURS
        { 
          id: 'extinguisher_class_a', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Extincteur Classe A (combustibles ordinaires)' : 'Class A extinguisher (ordinary combustibles)', 
          required: false, 
          section: 'precautions', 
          complianceRef: 'NFPA 51B harmonisé avec NFPA 10' 
        },
        { 
          id: 'extinguisher_class_b', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Extincteur Classe B (liquides inflammables)' : 'Class B extinguisher (flammable liquids)', 
          required: false, 
          section: 'precautions', 
          complianceRef: 'NFPA 10' 
        },
        { 
          id: 'extinguisher_positioning', 
          type: 'textarea', 
          label: language === 'fr' ? 'Positionnement et accessibilité extincteurs' : 'Extinguisher positioning and accessibility', 
          required: true, 
          section: 'precautions', 
          validation: { legalRequirement: true }, 
          complianceRef: 'NFPA 10' 
        },
        
        // SECTION SIGNATURES
        { 
          id: 'applicant_signature', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature demandeur/contractant' : 'Applicant/contractor signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'fire_marshal_signature', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature autorité incendie' : 'Fire authority signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        }
      ]
    },

    // 3. PERMIS EXCAVATION CONFORME MUNICIPAL 2024
    {
      id: 'excavation-permit-municipal-2024',
      name: language === 'fr' ? 'Permis d\'Excavation Conforme Municipal 2024' : 'Municipal Excavation Permit 2024 Compliant',
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 'Permis conforme réglements municipaux 2024 avec calculs automatiques profondeur/distance et assurances obligatoires' : 'Municipal regulations 2024 compliant permit with automatic depth/distance calculations and mandatory insurance',
      authority: language === 'fr' ? 'Municipal / Ville de Montréal / MAMH' : 'Municipal / City of Montreal / MAMH',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux + période garantie' : 'Work duration + warranty period',
      cost: language === 'fr' ? '200$ - 2000$ + dépôts garantie selon ampleur' : '$200 - $2000 + guarantee deposits by scope',
      processingTime: language === 'fr' ? '2-4 semaines + inspections obligatoires' : '2-4 weeks + mandatory inspections',
      renewalRequired: false,
      legislation: language === 'fr' ? 'Règlements municipaux 2024, Code construction Québec, Règlement excavation domaine public' : 'Municipal regulations 2024, Quebec Building Code, Public domain excavation regulation',
      contactInfo: {
        website: language === 'fr' ? 'Bureau des permis municipal' : 'Municipal permit office',
        phone: '311',
        email: 'permis@montreal.ca'
      },
      selected: false,
      status: 'pending',
      complianceLevel: 'enhanced',
      lastUpdated: '2025-01-20',
      formFields: [
        // SECTION DEMANDEUR
        { 
          id: 'applicant_name_excavation', 
          type: 'text', 
          label: language === 'fr' ? 'Nom du demandeur' : 'Applicant name', 
          required: true, 
          section: 'applicant', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'applicant_company', 
          type: 'text', 
          label: language === 'fr' ? 'Entreprise/Organisation' : 'Company/Organization', 
          required: true, 
          section: 'applicant' 
        },
        { 
          id: 'professional_engineer', 
          type: 'text', 
          label: language === 'fr' ? 'Ingénieur responsable (OIQ)' : 'Responsible engineer (OIQ)', 
          required: true, 
          section: 'applicant', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION CALCULS AUTOMATIQUES
        { 
          id: 'excavation_depth_calc', 
          type: 'number', 
          label: language === 'fr' ? 'Profondeur excavation (m)' : 'Excavation depth (m)', 
          required: true, 
          section: 'excavation', 
          validation: { min: 0, legalRequirement: true } 
        },
        { 
          id: 'domain_public_distance', 
          type: 'number', 
          label: language === 'fr' ? 'Distance domaine public (m)' : 'Public domain distance (m)', 
          required: true, 
          section: 'excavation', 
          validation: { min: 0, legalRequirement: true } 
        },
        { 
          id: 'permit_required_auto', 
          type: 'compliance_check', 
          label: language === 'fr' ? 'PERMIS REQUIS (auto-calculé)' : 'PERMIT REQUIRED (auto-calculated)', 
          required: true, 
          section: 'excavation', 
          validation: { legalRequirement: true }, 
          complianceRef: 'Règlement municipal excavation' 
        },
        
        // SECTION ASSURANCES OBLIGATOIRES
        { 
          id: 'insurance_amount_calc', 
          type: 'text', 
          label: language === 'fr' ? 'Montant assurance OBLIGATOIRE (auto-calculé)' : 'MANDATORY insurance amount (auto-calculated)', 
          required: true, 
          section: 'municipal_requirements', 
          validation: { legalRequirement: true }, 
          complianceRef: 'Règlement municipal assurances' 
        },
        { 
          id: 'co_insurance_city', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Co-assurance Ville AJOUTÉE à la police' : 'City co-insurance ADDED to policy', 
          required: true, 
          section: 'municipal_requirements', 
          validation: { legalRequirement: true, critical: true }, 
          complianceRef: 'Avenant obligatoire Ville' 
        },
        
        // SECTION INFO-EXCAVATION
        { 
          id: 'info_excavation_request', 
          type: 'compliance_check', 
          label: language === 'fr' ? 'Demande Info-Excavation COMPLÉTÉE' : 'Info-Excavation request COMPLETED', 
          required: true, 
          section: 'safety', 
          validation: { legalRequirement: true, critical: true }, 
          complianceRef: 'https://www.info-ex.com - Loi fédérale' 
        },
        { 
          id: 'municipal_networks_located', 
          type: 'checkbox', 
          label: language === 'fr' ? 'Réseaux municipaux localisés (aqueduc/égout)' : 'Municipal networks located (water/sewer)', 
          required: true, 
          section: 'safety', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION PROJET
        { 
          id: 'work_address_complete', 
          type: 'textarea', 
          label: language === 'fr' ? 'Adresse complète des travaux' : 'Complete work address', 
          required: true, 
          section: 'project', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'project_description_detailed', 
          type: 'textarea', 
          label: language === 'fr' ? 'Description détaillée du projet' : 'Detailed project description', 
          required: true, 
          section: 'project', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION DÉPÔTS DE GARANTIE
        { 
          id: 'surface_guarantee_deposit', 
          type: 'text', 
          label: language === 'fr' ? 'Dépôt garantie SURFACE (auto-calculé)' : 'SURFACE guarantee deposit (auto-calculated)', 
          required: true, 
          section: 'municipal_requirements', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'underground_guarantee_deposit', 
          type: 'text', 
          label: language === 'fr' ? 'Dépôt garantie SOUTERRAIN (auto-calculé)' : 'UNDERGROUND guarantee deposit (auto-calculated)', 
          required: true, 
          section: 'municipal_requirements', 
          validation: { legalRequirement: true } 
        },
        
        // SECTION SIGNATURES
        { 
          id: 'applicant_signature_excavation', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature demandeur' : 'Applicant signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        },
        { 
          id: 'engineer_signature', 
          type: 'signature', 
          label: language === 'fr' ? 'Signature ingénieur responsable' : 'Responsible engineer signature', 
          required: true, 
          section: 'signatures', 
          validation: { legalRequirement: true } 
        }
      ]
    }
  ];

  return basePermits;
};
// =================== SECTION 3A: LOGIQUE COMPLÈTE AVEC LOOK PREMIUM ===================
// À coller après la Section 2

// =================== COMPOSANT PRINCIPAL PREMIUM ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language, tenant, errors }) => {
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [expandedPermit, setExpandedPermit] = useState<string | null>(null);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // =================== ÉTATS POUR FONCTIONNALITÉS AVANCÉES ===================
  const [workers, setWorkers] = useState<{ [permitId: string]: WorkerEntry[] }>({});
  const [photos, setPhotos] = useState<{ [permitId: string]: PhotoEntry[] }>({});
  const [signatures, setSignatures] = useState<{ [permitId: string]: SignatureMetadata[] }>({});
  const [gasReadings, setGasReadings] = useState<{ [permitId: string]: GasReading[] }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [permitId: string]: ComplianceCheck[] }>({});
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [permitId: string]: number }>({});
  const [photoViewMode, setPhotoViewMode] = useState<{ [permitId: string]: 'carousel' | 'grid' }>({});

  // =================== INITIALISATION DES PERMIS ===================
  React.useEffect(() => {
    const translatedPermits = translatePermitsDatabase(language);
    setPermits(translatedPermits);
    
    // Initialiser workers et photos pour les permis déjà sélectionnés
    translatedPermits.forEach((permit: Permit) => {
      if (permit.selected) {
        if (!workers[permit.id]) {
          setWorkers(prev => ({
            ...prev,
            [permit.id]: [{
              id: 1,
              name: '',
              age: 0,
              certification: '',
              entryTime: '',
              exitTime: null,
              date: new Date().toISOString().split('T')[0],
              over18: false
            }]
          }));
        }
        if (!photos[permit.id]) {
          setPhotos(prev => ({
            ...prev,
            [permit.id]: []
          }));
        }
        if (!currentPhotoIndex[permit.id]) {
          setCurrentPhotoIndex(prev => ({
            ...prev,
            [permit.id]: 0
          }));
        }
        if (!photoViewMode[permit.id]) {
          setPhotoViewMode(prev => ({
            ...prev,
            [permit.id]: 'carousel'
          }));
        }
      }
    });
  }, [language]);

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
        
        // Initialiser ou nettoyer les données associées
        if (newSelected) {
          // Initialiser workers
          if (!workers[permitId]) {
            setWorkers(prevWorkers => ({
              ...prevWorkers,
              [permitId]: [{
                id: 1,
                name: '',
                age: 0,
                certification: '',
                entryTime: '',
                exitTime: null,
                date: new Date().toISOString().split('T')[0],
                over18: false
              }]
            }));
          }
          
          // Initialiser photos
          if (!photos[permitId]) {
            setPhotos(prevPhotos => ({
              ...prevPhotos,
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
        } else {
          // Nettoyer les données quand le permis est désélectionné
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
        }
        
        return { ...permit, selected: newSelected };
      }
      return permit;
    }));
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
    const field = permit?.formFields?.find(f => f.id === fieldId);
    
    if (field?.validation?.critical) {
      validateField(permitId, fieldId, value, field);
    }
  };

  // =================== VALIDATION TEMPS RÉEL ===================
  const validateField = (permitId: string, fieldId: string, value: any, field: FormField) => {
    const checks: ComplianceCheck[] = [];
    
    if (field.type === 'gas_meter' && field.validation) {
      const numValue = parseFloat(value) || 0;
      const min = field.validation.min || 0;
      const max = field.validation.max || 100;
      
      if (numValue < min || numValue > max) {
        checks.push({
          requirement: field.label,
          status: 'non-compliant',
          details: `Valeur ${numValue} hors limites (${min}-${max})`,
          reference: field.complianceRef || 'Validation automatique'
        });
      } else {
        checks.push({
          requirement: field.label,
          status: 'compliant',
          details: `Valeur ${numValue} conforme`,
          reference: field.complianceRef || 'Validation automatique'
        });
      }
    }
    
    if (field.id === 'worker_age_verification') {
      const permitWorkers = workers[permitId] || [];
      const hasMinors = permitWorkers.some(w => w.age > 0 && w.age < 18);
      
      if (hasMinors) {
        checks.push({
          requirement: 'Vérification âge travailleurs',
          status: 'non-compliant',
          details: 'Travailleur(s) mineur(s) détecté(s) - Violation Article 298 RSST',
          reference: 'RSST Art. 298 modifié 2023'
        });
      } else {
        checks.push({
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
        ...(prev[permitId] || []).filter(c => c.requirement !== field.label),
        ...checks
      ]
    }));
  };

  // =================== GESTION DES TRAVAILLEURS ===================
  const addWorker = (permitId: string) => {
    setWorkers(prev => {
      const currentWorkers = prev[permitId] || [];
      const newWorker: WorkerEntry = {
        id: Math.max(...currentWorkers.map(w => w.id), 0) + 1,
        name: '',
        age: 0,
        certification: '',
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
                id: 'worker_age_verification',
                type: 'compliance_check',
                label: 'Vérification âge travailleurs',
                required: true,
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
  const handlePhotoUpload = (permitId: string, files: FileList) => {
    const newPhotos: PhotoEntry[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = Math.max(...(photos[permitId] || []).map(p => p.id), 0) + i + 1;
      
      // Créer URL pour prévisualisation
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        id: photoId,
        url: url,
        name: file.name,
        timestamp: new Date().toISOString(),
        description: '',
        gpsLocation: '',
        compliance: true
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

  const nextPhoto = (permitId: string) => {
    const permitPhotos = photos[permitId] || [];
    if (permitPhotos.length > 0) {
      setCurrentPhotoIndex(prev => ({
        ...prev,
        [permitId]: ((prev[permitId] || 0) + 1) % permitPhotos.length
      }));
    }
  };

  const prevPhoto = (permitId: string) => {
    const permitPhotos = photos[permitId] || [];
    if (permitPhotos.length > 0) {
      setCurrentPhotoIndex(prev => ({
        ...prev,
        [permitId]: ((prev[permitId] || 0) - 1 + permitPhotos.length) % permitPhotos.length
      }));
    }
  };

  const togglePhotoViewMode = (permitId: string) => {
    setPhotoViewMode(prev => ({
      ...prev,
      [permitId]: prev[permitId] === 'carousel' ? 'grid' : 'carousel'
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

  // =================== RENDU DU COMPOSANT PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* En-tête avec titre et statistiques PREMIUM */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {t.title}
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 blur-3xl opacity-20 -z-10"></div>
            </div>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Statistiques temps réel PREMIUM */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { value: stats.available, label: t.stats.available, color: 'from-blue-500 to-cyan-500', icon: '📊' },
              { value: stats.selected, label: t.stats.selected, color: 'from-green-500 to-emerald-500', icon: '✅' },
              { value: stats.critical, label: t.stats.critical, color: 'from-red-500 to-rose-500', icon: '🚨' },
              { value: stats.pending, label: t.stats.pending, color: 'from-yellow-500 to-orange-500', icon: '⏳' },
              { value: stats.compliant, label: t.stats.compliant, color: 'from-green-500 to-teal-500', icon: '🛡️' },
              { value: stats.nonCompliant, label: t.stats.nonCompliant, color: 'from-red-500 to-pink-500', icon: '⚠️' }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de recherche PREMIUM */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover/search:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
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
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
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
        <div className="space-y-8">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <FileText className="w-24 h-24 mx-auto text-gray-400 mb-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-20"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">{t.messages.noResults}</h3>
              <p className="text-gray-400 text-lg">{t.messages.modifySearch}</p>
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
                currentPhotoIndex={currentPhotoIndex[permit.id] || 0}
                viewMode={photoViewMode[permit.id] || 'carousel'}
                onToggle={() => togglePermit(permit.id)}
                onExpand={() => expandPermit(permit.id)}
                onFieldChange={(fieldId, value) => handleFieldChange(permit.id, fieldId, value)}
                onAddWorker={() => addWorker(permit.id)}
                onRemoveWorker={(workerId) => removeWorker(permit.id, workerId)}
                onUpdateWorker={(workerId, field, value) => updateWorker(permit.id, workerId, field, value)}
                onPhotoUpload={(files) => handlePhotoUpload(permit.id, files)}
                onRemovePhoto={(photoId) => removePhoto(permit.id, photoId)}
                onNextPhoto={() => nextPhoto(permit.id)}
                onPrevPhoto={() => prevPhoto(permit.id)}
                onToggleViewMode={() => togglePhotoViewMode(permit.id)}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                getComplianceColor={getComplianceColor}
                getCategoryIcon={getCategoryIcon}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
// =================== SECTION 3B: COMPOSANTS PREMIUM =================== //
// À coller après la Section 3 dans votre fichier Step4Permits.tsx

// Composant PermitCard premium
const PermitCard: React.FC<{
  permit: Permit;
  isSelected: boolean;
  onSelect: () => void;
  onFill: () => void;
  onValidate: () => void;
  onGeneratePDF: () => void;
}> = ({ permit, isSelected, onSelect, onFill, onValidate, onGeneratePDF }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Attente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'En Cours': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Validé': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Critique': return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Espace Clos': return '🛡️';
      case 'Travail à Chaud': return '🔥';
      case 'Excavation': return '🏗️';
      default: return '📋';
    }
  };

  return (
    <div className={`relative bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
      isSelected 
        ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
        : 'border-slate-700/50 hover:border-slate-600/50'
    }`}>
      {/* Header de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getIconForType(permit.type)}</div>
          <div>
            <h3 className="font-semibold text-white text-lg">{permit.type}</h3>
            <p className="text-gray-400 text-sm">{permit.norm}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(permit.status)}`}>
          {permit.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
        {permit.description}
      </p>

      {/* Champs obligatoires */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-400 text-sm font-medium">
          {permit.requiredFields} champs obligatoires
        </span>
        <div className="flex-1 h-px bg-slate-700"></div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onFill}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Remplir</span>
        </button>
        
        <button
          onClick={onValidate}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg ${
            permit.status === 'Validé'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
          }`}
          disabled={permit.status !== 'En Cours'}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Valider</span>
        </button>
        
        <button
          onClick={onGeneratePDF}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
          disabled={permit.status === 'En Attente'}
        >
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">PDF</span>
        </button>
      </div>

      {/* Indicateur de sélection */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

// Composant FormField avec validation premium
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
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-white">
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
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 ${
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
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 resize-none ${
              hasValidation
                ? isValid
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 ${
              hasValidation
                ? isValid
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        )}
        
        {hasValidation && (
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

// Composant PhotoGallery avec carousel et grille premium
const PhotoGallery: React.FC<{
  photos: Photo[];
  currentIndex: number;
  viewMode: 'carousel' | 'grid';
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRemove: (index: number) => void;
  onAdd: (files: File[]) => void;
}> = ({ photos, currentIndex, viewMode, onViewModeChange, onNavigate, onRemove, onAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📸 Photos du Site
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
            {photos.length}
          </span>
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Sélecteur de vue */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('carousel')}
              className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                viewMode === 'carousel'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Carrousel
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
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
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter
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
        /* Zone de drop vide */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-slate-800/30"
        >
          <div className="space-y-3">
            <Camera className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-400">Cliquez pour ajouter des photos</p>
            <p className="text-sm text-gray-500">JPG, PNG jusqu'à 10MB</p>
          </div>
        </div>
      ) : (
        /* Galerie photos */
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          {viewMode === 'carousel' ? (
            /* Mode Carrousel */
            <div className="space-y-4">
              {/* Image principale */}
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <img
                  src={photos[currentIndex]?.url}
                  alt={photos[currentIndex]?.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Contrôles de navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => onNavigate('prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onNavigate('next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Bouton suppression */}
                <button
                  onClick={() => onRemove(currentIndex)}
                  className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                
                {/* Indicateur position */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentIndex + 1} / {photos.length}
                </div>
              </div>
              
              {/* Miniatures */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => onNavigate(index === currentIndex ? 'next' : index > currentIndex ? 'next' : 'prev')}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
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
            /* Mode Grille */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={() => onRemove(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
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

// Composant WorkerCard premium
const WorkerCard: React.FC<{
  worker: Worker;
  index: number;
  onUpdate: (index: number, worker: Worker) => void;
  onRemove: (index: number) => void;
}> = ({ worker, index, onUpdate, onRemove }) => {
  const isMinor = worker.age < 18;
  
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4 space-y-4 transition-all duration-300 ${
      isMinor 
        ? 'border-red-500/50 bg-red-500/10 shadow-red-500/20 shadow-lg' 
        : 'border-slate-700/50 hover:border-slate-600/50'
    }`}>
      {/* Header de la carte */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white flex items-center gap-2">
          👷 Travailleur #{index + 1}
          {isMinor && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse">
              MINEUR INTERDIT
            </span>
          )}
        </h4>
        <button
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Alerte mineur */}
      {isMinor && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            LÉGALEMENT INTERDIT: Travailleur mineur (moins de 18 ans)
          </p>
          <p className="text-red-300 text-xs mt-1">
            RSST Art. 53: Accès interdit aux espaces clos pour les mineurs
          </p>
        </div>
      )}

      {/* Formulaire travailleur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nom complet"
          value={worker.name}
          onChange={(value) => onUpdate(index, { ...worker, name: value })}
          placeholder="Nom du travailleur"
          required
          isValid={worker.name.length >= 2}
          errorMessage="Nom requis (minimum 2 caractères)"
        />
        
        <FormField
          label="Âge"
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
          label="Certification"
          type="select"
          value={worker.certification}
          onChange={(value) => onUpdate(index, { ...worker, certification: value })}
          options={['Base', 'Avancé', 'Superviseur', 'Sauveteur']}
          required
          isValid={worker.certification !== ''}
          isLegal={worker.certification === 'Sauveteur'}
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
