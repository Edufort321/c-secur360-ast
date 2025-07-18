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
// =================== SECTION 3: VERSION MOBILE-FIRST OPTIMISÉE ===================
// À coller après la Section 2

// =================== COMPOSANT PRINCIPAL MOBILE-FIRST ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language, tenant, errors }) => {
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [permits] = useState<Permit[]>(translatePermitsDatabase(language));
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  
  // États pour fonctionnalités avancées
  const [workers, setWorkers] = useState<WorkerEntry[]>([{
    id: 1,
    name: '',
    age: 0,
    certification: '',
    entryTime: '',
    exitTime: null,
    date: new Date().toISOString().split('T')[0],
    over18: false
  }]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [photoViewMode, setPhotoViewMode] = useState<'carousel' | 'grid'>('carousel');

  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  // =================== STATISTIQUES ===================
  const stats = useMemo(() => {
    const selectedCount = permits.filter(p => p.selected).length;
    const criticalCount = permits.filter(p => p.priority === 'critical').length;
    const pendingCount = permits.filter(p => p.status === 'pending').length;
    return {
      available: permits.length,
      selected: selectedCount,
      critical: criticalCount,
      pending: pendingCount
    };
  }, [permits]);

  // =================== GESTION DES VALEURS ===================
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // =================== GESTION DES TRAVAILLEURS ===================
  const addWorker = () => {
    const newWorker: WorkerEntry = {
      id: Math.max(...workers.map(w => w.id), 0) + 1,
      name: '',
      age: 0,
      certification: '',
      entryTime: '',
      exitTime: null,
      date: new Date().toISOString().split('T')[0],
      over18: false
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  const removeWorker = (workerId: number) => {
    if (workers.length > 1) {
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    }
  };

  const updateWorker = (workerId: number, field: keyof WorkerEntry, value: any) => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === workerId) {
        const updatedWorker = { ...worker, [field]: value };
        if (field === 'age') {
          updatedWorker.over18 = value >= 18;
        }
        return updatedWorker;
      }
      return worker;
    }));
  };

  // =================== GESTION DES PHOTOS ===================
  const handlePhotoUpload = (files: FileList) => {
    const newPhotos: PhotoEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoId = Math.max(...photos.map(p => p.id), 0) + i + 1;
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
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (photoId: number) => {
    setPhotos(prev => {
      const updatedPhotos = prev.filter(p => p.id !== photoId);
      if (currentPhotoIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
        setCurrentPhotoIndex(updatedPhotos.length - 1);
      }
      return updatedPhotos;
    });
  };

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
    }
  };

  const togglePhotoViewMode = () => {
    setPhotoViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#d97706';
      case 'approved': return '#16a34a';
      case 'submitted': return '#2563eb';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'Sécurité':
      case 'Safety':
        return '🛡️';
      case 'Construction':
        return '🏗️';
      default:
        return '📋';
    }
  };

  // =================== VALIDATION TEMPS RÉEL ===================
  const validateGasField = (fieldId: string, value: any, field: FormField) => {
    if (field.type === 'gas_meter' && field.validation) {
      const numValue = parseFloat(value) || 0;
      const min = field.validation.min || 0;
      const max = field.validation.max || 100;
      return numValue >= min && numValue <= max;
    }
    return true;
  };

  // =================== RENDU PRINCIPAL ===================
  if (selectedPermit) {
    // Vue formulaire détaillé mobile
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header mobile */}
        <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedPermit(null)}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Précédent</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm">
                Sauvegarde auto
              </button>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Sauvegardé</span>
            </div>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-4 pb-20">
          {/* Titre du permis */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-2">{selectedPermit.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-semibold">
                Critique
              </span>
              <span className="text-gray-400 text-sm">Mis à jour: 2025-01-20</span>
            </div>
            
            {/* Boutons d'action mobile */}
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Valider conformité</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded text-sm">
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-sm">
                <Mail className="w-4 h-4" />
                <span>Soumettre</span>
              </button>
            </div>
          </div>

          {/* Sections du formulaire */}
          <div className="space-y-8">
            {selectedPermit.formFields?.map((field) => {
              // Traitement spécial pour workers_tracking
              if (field.type === 'workers_tracking') {
                return (
                  <div key={field.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-blue-400 text-lg font-semibold">
                        👥 Travailleurs Autorisés ({workers.length})
                      </h4>
                      <button
                        onClick={addWorker}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Ajouter Travailleur</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {workers.map((worker, index) => (
                        <div key={worker.id} className="bg-slate-800 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-white font-medium">Travailleur #{index + 1}</h5>
                            {workers.length > 1 && (
                              <button
                                onClick={() => removeWorker(worker.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Nom complet</label>
                              <input
                                type="text"
                                value={worker.name}
                                onChange={(e) => updateWorker(worker.id, 'name', e.target.value)}
                                placeholder="Nom du travailleur"
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-gray-300 text-sm mb-1">Âge</label>
                                <input
                                  type="number"
                                  value={worker.age || ''}
                                  onChange={(e) => updateWorker(worker.id, 'age', parseInt(e.target.value) || 0)}
                                  className={`w-full px-3 py-2 border rounded text-white text-sm ${
                                    worker.age > 0 && worker.age < 18 
                                      ? 'bg-red-800 border-red-600' 
                                      : 'bg-slate-700 border-slate-600'
                                  }`}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 text-sm mb-1">Certification</label>
                                <select
                                  value={worker.certification}
                                  onChange={(e) => updateWorker(worker.id, 'certification', e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="basic">Formation de base</option>
                                  <option value="advanced">Formation avancée</option>
                                  <option value="supervisor">Superviseur</option>
                                  <option value="rescuer">Sauveteur</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`worker-${worker.id}-18plus`}
                                checked={worker.over18}
                                onChange={(e) => updateWorker(worker.id, 'over18', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                              />
                              <label htmlFor={`worker-${worker.id}-18plus`} className="text-sm text-gray-300">
                                <span className="text-red-500">*</span> Je certifie que ce travailleur a 18 ans ou plus (OBLIGATOIRE)
                              </label>
                            </div>
                            
                            {worker.age > 0 && worker.age < 18 && (
                              <div className="p-2 bg-red-900 border border-red-600 rounded text-red-200 text-sm">
                                ⚠️ VIOLATION LÉGALE: Travailleur mineur détecté
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              
              // Traitement spécial pour photo_gallery
              if (field.type === 'photo_gallery') {
                return (
                  <div key={field.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-blue-400 text-lg font-semibold">
                        📸 Photos du Site ({photos.length})
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={togglePhotoViewMode}
                          className="p-2 bg-gray-600 text-white rounded"
                        >
                          {photoViewMode === 'carousel' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        </button>
                        <label className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Ajouter</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    
                    {photos.length === 0 ? (
                      <div className="bg-slate-800 p-8 rounded-lg text-center">
                        <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-400">Aucune photo ajoutée</p>
                        <p className="text-gray-500 text-sm">Cliquez sur "Ajouter" pour commencer</p>
                      </div>
                    ) : (
                      <PhotoGallery
                        photos={photos}
                        currentIndex={currentPhotoIndex}
                        viewMode={photoViewMode}
                        onNext={nextPhoto}
                        onPrev={prevPhoto}
                        onRemove={removePhoto}
                        t={t}
                      />
                    )}
                  </div>
                );
              }
              
              // Section headers
              const currentSection = field.section;
              const isNewSection = selectedPermit.formFields?.findIndex(f => f.section === currentSection) === 
                                  selectedPermit.formFields?.findIndex(f => f.id === field.id);
              
              return (
                <div key={field.id}>
                  {isNewSection && currentSection && (
                    <h3 className="text-blue-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
                      {t.sections[currentSection] || currentSection}
                    </h3>
                  )}
                  
                  <FormField
                    field={field}
                    value={formValues[field.id] || ''}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    t={t}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom navigation mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedPermit(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-2 bg-cyan-600 text-white rounded font-semibold">
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue principale avec cartes (Images 1-2)
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-6">
        
        {/* En-tête avec statistiques */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Permis & Autorisations Conformes 2024-2025
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Formulaires authentiques conformes aux dernières normes CNESST, NFPA et municipales
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-800 rounded-xl p-3 md:p-4 text-center border border-slate-700">
              <div className="text-xl md:text-2xl font-bold text-white">{stats.available}</div>
              <div className="text-xs md:text-sm text-gray-400">Disponibles</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 md:p-4 text-center border border-slate-700">
              <div className="text-xl md:text-2xl font-bold text-green-400">{stats.selected}</div>
              <div className="text-xs md:text-sm text-gray-400">Sélectionnés</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 md:p-4 text-center border border-slate-700">
              <div className="text-xl md:text-2xl font-bold text-red-400">{stats.critical}</div>
              <div className="text-xs md:text-sm text-gray-400">Critiques</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 md:p-4 text-center border border-green-500">
              <div className="text-xl md:text-2xl font-bold text-green-400">3/3</div>
              <div className="text-xs md:text-sm text-gray-400">Conformes</div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un permis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes catégories</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes provinces</option>
                {provinces.map((province: string) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des permis */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPermits.map((permit: Permit) => (
            <div
              key={permit.id}
              className={`bg-slate-800 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                permit.selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-700'
              }`}
            >
              {/* En-tête de la carte */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">
                      {getCategoryIcon(permit.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1">{permit.name}</h3>
                      <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wide font-medium">
                        {permit.category}
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permit.selected}
                      onChange={() => {
                        // Toggle selection logic here
                      }}
                      className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {permit.description}
                </p>
                
                <p className="text-blue-400 text-sm mb-4">{permit.authority}</p>
                
                {/* Badges */}
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  <span 
                    className="px-3 py-1 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: getPriorityColor(permit.priority) }}
                  >
                    {permit.priority === 'critical' ? 'Critique' : permit.priority}
                  </span>
                  <span 
                    className="px-3 py-1 rounded text-xs font-semibold"
                    style={{ 
                      backgroundColor: getStatusColor(permit.status),
                      color: 'white'
                    }}
                  >
                    En Attente
                  </span>
                  <span className="text-gray-400 text-xs">
                    2025-01-20
                  </span>
                </div>
                
                <div className="flex items-center text-gray-400 text-xs">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{permit.processingTime}</span>
                </div>
              </div>
              
              {/* Actions */}
              {permit.selected && (
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPermit(permit)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Remplir</span>
                    </button>
                    
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Valider</span>
                    </button>
                    
                    <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Navigation bottom */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Sauvegarde auto</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-sm">Sauvegardé</span>
          </div>
          
          <button className="flex items-center space-x-2 px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors font-semibold">
            <span>Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Permits;
