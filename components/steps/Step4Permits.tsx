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
// =================== SECTION 3: LOGIQUE ET VALIDATION SANS ERREURS ===================
// À coller après la Section 2

// =================== COMPOSANT PRINCIPAL AVEC CONFORMITÉ 2024-2025 ===================
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
  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* En-tête avec titre et statistiques */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Statistiques temps réel */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
                <div className="text-sm text-gray-600">{t.stats.available}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                <div className="text-sm text-gray-600">{t.stats.selected}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-gray-600">{t.stats.critical}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">{t.stats.pending}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
                <div className="text-sm text-gray-600">{t.stats.compliant}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
                <div className="text-sm text-gray-600">{t.stats.nonCompliant}</div>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t.allCategories}</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>
                    {t.categories[category as keyof typeof t.categories] || category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">{t.allProvinces}</option>
                {provinces.map((province: string) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des permis */}
        <div className="space-y-6">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t.messages.noResults}</h3>
              <p className="text-gray-500">{t.messages.modifySearch}</p>
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
// =================== SECTION 4: COMPOSANTS UI PREMIUM ULTRA-MODERNES ===================
// À coller après la Section 3

// =================== COMPOSANT CARTE PERMIS PREMIUM =================== 
interface PermitCardProps {
  permit: Permit;
  isSelected: boolean;
  isExpanded: boolean;
  complianceChecks: ComplianceCheck[];
  workers: WorkerEntry[];
  photos: PhotoEntry[];
  currentPhotoIndex: number;
  viewMode: 'carousel' | 'grid';
  onToggle: () => void;
  onExpand: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddWorker: () => void;
  onRemoveWorker: (workerId: number) => void;
  onUpdateWorker: (workerId: number, field: keyof WorkerEntry, value: any) => void;
  onPhotoUpload: (files: FileList) => void;
  onRemovePhoto: (photoId: number) => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onToggleViewMode: () => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getComplianceColor: (level: string) => string;
  getCategoryIcon: (category: string) => string;
  t: any;
}

const PermitCard: React.FC<PermitCardProps> = ({
  permit,
  isSelected,
  isExpanded,
  complianceChecks,
  workers,
  photos,
  currentPhotoIndex,
  viewMode,
  onToggle,
  onExpand,
  onFieldChange,
  onAddWorker,
  onRemoveWorker,
  onUpdateWorker,
  onPhotoUpload,
  onRemovePhoto,
  onNextPhoto,
  onPrevPhoto,
  onToggleViewMode,
  getPriorityColor,
  getStatusColor,
  getComplianceColor,
  getCategoryIcon,
  t
}) => {
  const nonCompliantChecks = complianceChecks.filter(check => check.status === 'non-compliant');
  const hasViolations = nonCompliantChecks.length > 0;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border transition-all duration-500 transform hover:scale-[1.02] hover:shadow-3xl backdrop-blur-sm ${
      isSelected 
        ? 'border-transparent bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-blue-200/50 ring-2 ring-blue-400/30' 
        : 'border-gray-200/50 hover:border-gray-300/80'
    } ${hasViolations ? 'border-red-400 bg-gradient-to-br from-red-50 via-white to-red-50 shadow-red-200/50' : ''}`}>
      
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* En-tête premium avec glassmorphisme */}
      <div className="relative p-8 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-all duration-300">
                {getCategoryIcon(permit.category)}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                ✓
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                {permit.name}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-4 max-w-2xl">
                {permit.description}
              </p>
              
              {/* Badges premium avec effets */}
              <div className="flex items-center flex-wrap gap-3">
                <span 
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${getPriorityColor(permit.priority)}, ${getPriorityColor(permit.priority)}dd)`,
                    boxShadow: `0 4px 15px ${getPriorityColor(permit.priority)}40`
                  }}
                >
                  ⚡ {t.priorities[permit.priority]}
                </span>
                <span 
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${getStatusColor(permit.status)}, ${getStatusColor(permit.status)}dd)`,
                    boxShadow: `0 4px 15px ${getStatusColor(permit.status)}40`
                  }}
                >
                  📋 {t.statuses[permit.status]}
                </span>
                <span 
                  className="px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${getComplianceColor(permit.complianceLevel)}, ${getComplianceColor(permit.complianceLevel)}dd)`,
                    boxShadow: `0 4px 15px ${getComplianceColor(permit.complianceLevel)}40`
                  }}
                >
                  🛡️ {t.complianceLevels[permit.complianceLevel]}
                </span>
                
                {/* Badge workers et photos */}
                <span className="px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg backdrop-blur-sm">
                  👥 {workers.length} {workers.length === 1 ? 'Travailleur' : 'Travailleurs'}
                </span>
                <span className="px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg backdrop-blur-sm">
                  📸 {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasViolations && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-sm">
                  ⚠️ {nonCompliantChecks.length} Violation{nonCompliantChecks.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
            
            <button
              onClick={onToggle}
              className={`group relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl ${
                isSelected 
                  ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:shadow-red-500/50' 
                  : 'bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white hover:shadow-blue-500/50'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                {isSelected ? (
                  <>
                    <X className="w-5 h-5" />
                    <span>Retirer</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Sélectionner</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu expansible premium */}
      {isSelected && (
        <div className="relative p-8 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl">
          
          {/* Vérifications de conformité avec design premium */}
          {complianceChecks.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
              <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Vérifications de Conformité Premium
              </h4>
              <div className="grid gap-4">
                {complianceChecks.map((check, index) => (
                  <div key={index} className={`group relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    check.status === 'compliant' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 hover:shadow-green-200/50' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 hover:shadow-red-200/50'
                  } shadow-lg hover:shadow-xl`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          check.status === 'compliant' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                        }`}>
                          {check.status === 'compliant' ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-800">{check.requirement}</div>
                          <div className="text-sm text-gray-600 mt-1">{check.details}</div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl text-xs font-medium text-gray-700 border border-gray-200/50">
                        {check.reference}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton pour étendre/réduire le formulaire */}
          <button
            onClick={onExpand}
            className="group relative overflow-hidden w-full flex items-center justify-center space-x-3 px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 text-white rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-[1.02] font-bold text-lg mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              <span>{isExpanded ? '🔼 Réduire le formulaire premium' : '🔽 Ouvrir le formulaire premium'}</span>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            </div>
          </button>

          {/* Formulaire étendu premium */}
          {isExpanded && (
            <div className="space-y-10">
              
              {/* Grille premium des champs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                
                {/* Colonne gauche - Formulaire premium */}
                <div className="space-y-8">
                  <div className="relative p-8 bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-t-3xl"></div>
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      Formulaire Premium
                    </h4>
                    
                    <div className="space-y-6">
                      {permit.formFields?.map((field) => (
                        <FormField
                          key={field.id}
                          field={field}
                          value={permit.formData?.[field.id] || ''}
                          onChange={(value) => onFieldChange(field.id, value)}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Travailleurs et Photos premium */}
                <div className="space-y-8">
                  
                  {/* Section Travailleurs Premium */}
                  <div className="relative p-8 bg-gradient-to-br from-white/90 to-emerald-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 rounded-t-3xl"></div>
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        Équipe ({workers.length})
                      </h4>
                      <button
                        onClick={onAddWorker}
                        className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 font-bold"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <UserPlus className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Ajouter</span>
                      </button>
                    </div>

                    <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
                      {workers.map((worker, index) => (
                        <WorkerCard
                          key={worker.id}
                          worker={worker}
                          index={index}
                          canRemove={workers.length > 1}
                          onUpdate={(field, value) => onUpdateWorker(worker.id, field, value)}
                          onRemove={() => onRemoveWorker(worker.id)}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Section Photos Premium */}
                  <div className="relative p-8 bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-700 rounded-t-3xl"></div>
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        Galerie ({photos.length})
                      </h4>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={onToggleViewMode}
                          className="group relative overflow-hidden p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          title={t.messages.toggleView}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {viewMode === 'carousel' ? <Grid className="w-5 h-5 relative z-10" /> : <List className="w-5 h-5 relative z-10" />}
                        </button>
                        <label className="group relative overflow-hidden flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer font-bold">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Upload className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Upload</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && onPhotoUpload(e.target.files)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <PhotoGallery
                      photos={photos}
                      currentIndex={currentPhotoIndex}
                      viewMode={viewMode}
                      onNext={onNextPhoto}
                      onPrev={onPrevPhoto}
                      onRemove={onRemovePhoto}
                      t={t}
                    />
                  </div>
                </div>
              </div>

              {/* Actions premium du formulaire */}
              <div className="flex justify-center space-x-6 pt-10 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
                <button className="group relative overflow-hidden flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white rounded-3xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 font-bold text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Save className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{t.actions.save}</span>
                </button>
                
                <button className="group relative overflow-hidden flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 text-white rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 font-bold text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Download className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{t.actions.download}</span>
                </button>
                
                <button className="group relative overflow-hidden flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-700 text-white rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 font-bold text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Eye className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{t.actions.preview}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT CHAMP FORMULAIRE PREMIUM ===================
interface FormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  t: any;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, t }) => {
  const getFieldComponent = () => {
    const baseInputClasses = "w-full px-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-lg font-medium placeholder-gray-400 hover:border-gray-300/80";
    
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <div className="relative group">
            <input
              type={field.type}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClasses}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );

      case 'textarea':
        return (
          <div className="relative group">
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={6}
              className={`${baseInputClasses} resize-none`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );

      case 'select':
        return (
          <div className="relative group">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
              className={baseInputClasses}
            >
              <option value="">{t.messages.select}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="group relative p-6 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 hover:border-blue-300/50 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  required={field.required}
                  className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <span className="text-lg font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
              </span>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-4">
            {field.options?.map((option: string) => (
              <div key={option} className="group relative p-4 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 hover:border-blue-300/50 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={value === option}
                      onChange={(e) => onChange(e.target.value)}
                      required={field.required}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <span className="text-lg font-medium text-gray-700">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'gas_meter':
        const numValue = parseFloat(value) || 0;
        const isInRange = numValue >= (field.validation?.min || 0) && numValue <= (field.validation?.max || 100);
        
        return (
          <div className="relative group">
            <div className={`relative p-6 rounded-3xl border-2 transition-all duration-300 backdrop-blur-sm ${
              isInRange 
                ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-300/50 hover:border-green-400/60' 
                : 'bg-gradient-to-r from-red-50/80 to-rose-50/80 border-red-300/50 hover:border-red-400/60'
            }`}>
              <input
                type="number"
                step="0.1"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:border-blue-500 transition-all duration-300 text-lg font-bold text-center ${
                  isInRange 
                    ? 'border-green-300 bg-green-50/50 text-green-700 focus:ring-green-500/20' 
                    : 'border-red-300 bg-red-50/50 text-red-700 focus:ring-red-500/20'
                }`}
              />
              <div className={`absolute right-6 top-1/2 transform -translate-y-1/2 text-3xl ${
                isInRange ? 'text-green-600' : 'text-red-600'
              }`}>
                {isInRange ? '✅' : '⚠️'}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm font-medium text-gray-600">
                  Plage: {field.validation?.min || 0} - {field.validation?.max || 100}
                </div>
                {field.validation?.critical && (
                  <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                    CRITIQUE
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'compliance_check':
        return (
          <div className={`group relative overflow-hidden p-8 rounded-3xl border-2 transition-all duration-300 ${
            value 
              ? 'bg-gradient-to-br from-green-50/90 to-emerald-50/90 border-green-300/60 shadow-green-200/50' 
              : 'bg-gradient-to-br from-red-50/90 to-rose-50/90 border-red-300/60 shadow-red-200/50'
          } shadow-xl hover:shadow-2xl transform hover:scale-[1.02]`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                value ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
              }`}>
                <input
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  required={field.required}
                  className="w-6 h-6 text-white border-white rounded-lg opacity-0"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                  {value ? '✓' : '✗'}
                </div>
              </div>
              <div className="flex-1">
                <span className={`text-xl font-bold ${value ? 'text-green-700' : 'text-red-700'}`}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </span>
                {field.complianceRef && (
                  <div className="mt-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-700 border border-gray-200/50">
                    📋 {field.complianceRef}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'file':
        return (
          <label className="group relative block w-full p-10 border-2 border-dashed border-gray-300/60 rounded-3xl hover:border-blue-400/60 cursor-pointer transition-all duration-300 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-700 block mb-2">Glisser-déposer ou cliquer pour sélectionner</span>
              {value && (
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium mt-2">
                  📎 {value.name || value}
                </div>
              )}
            </div>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0])}
              required={field.required}
              className="hidden"
            />
          </label>
        );

      default:
        return (
          <div className="relative group">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={baseInputClasses}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
    }
  };

  if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'compliance_check') {
    return (
      <div className="space-y-3">
        {getFieldComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent flex items-center">
          {field.label} 
          {field.required && <span className="text-red-500 ml-2 text-xl">*</span>}
          {field.validation?.legalRequirement && (
            <span className="ml-3 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full animate-pulse">
              ⚖️ LÉGAL
            </span>
          )}
        </span>
      </label>
      {getFieldComponent()}
      {field.validation?.message && (
        <div className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border ${
          field.validation.critical 
            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-700' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700'
        }`}>
          <div className="text-lg">
            {field.validation.critical ? '⚠️' : 'ℹ️'}
          </div>
          <span className="font-medium">
            {field.validation.message}
          </span>
        </div>
      )}
    </div>
  );
};// =================== COMPOSANT CARTE TRAVAILLEUR PREMIUM ===================
interface WorkerCardProps {
  worker: WorkerEntry;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof WorkerEntry, value: any) => void;
  onRemove: () => void;
  t: any;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, index, canRemove, onUpdate, onRemove, t }) => {
  const isUnderage = worker.age > 0 && worker.age < 18;

  return (
    <div className={`group relative overflow-hidden p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl backdrop-blur-sm ${
      isUnderage 
        ? 'bg-gradient-to-br from-red-50/90 to-rose-50/90 border-red-300/60 shadow-red-200/50' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50 hover:border-gray-300/80'
    }`}>
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg font-bold text-white text-lg ${
              isUnderage 
                ? 'bg-gradient-to-r from-red-400 to-rose-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}>
              #{index + 1}
            </div>
            <h5 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              {t.messages.workerNumber}{index + 1}
            </h5>
          </div>
          {canRemove && (
            <button
              onClick={onRemove}
              className="group/btn relative overflow-hidden p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              <UserMinus className="w-5 h-5 relative z-10" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">{t.messages.fullName}</label>
            <div className="relative group/input">
              <input
                type="text"
                value={worker.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder={t.messages.workerName}
                className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium hover:border-gray-300/80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">{t.messages.age}</label>
            <div className="relative group/input">
              <input
                type="number"
                value={worker.age || ''}
                onChange={(e) => onUpdate('age', parseInt(e.target.value) || 0)}
                placeholder={t.messages.workerAge}
                min="16"
                max="70"
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm font-medium text-center text-lg ${
                  isUnderage 
                    ? 'border-red-300 bg-red-50/80 text-red-700 focus:ring-red-500/20' 
                    : 'border-gray-200/50 bg-white/80 hover:border-gray-300/80 focus:ring-blue-500/20'
                }`}
              />
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xl ${
                isUnderage ? 'text-red-600' : worker.age >= 18 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isUnderage ? '⚠️' : worker.age >= 18 ? '✅' : '👤'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-bold text-gray-700">{t.messages.certification}</label>
            <div className="relative group/input">
              <select
                value={worker.certification}
                onChange={(e) => onUpdate('certification', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium hover:border-gray-300/80"
              >
                <option value="">{t.messages.selectCertification}</option>
                <option value="basic">🟢 {t.messages.basicTraining}</option>
                <option value="advanced">🟡 {t.messages.advancedTraining}</option>
                <option value="supervisor">🔵 {t.messages.supervisor}</option>
                <option value="rescuer">🔴 {t.messages.rescuer}</option>
              </select>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              worker.over18 
                ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-300/50' 
                : 'bg-gradient-to-r from-red-50/80 to-rose-50/80 border-red-300/50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`worker-${worker.id}-18plus`}
                    checked={worker.over18}
                    onChange={(e) => onUpdate('over18', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <label htmlFor={`worker-${worker.id}-18plus`} className="text-sm font-bold text-gray-700 flex items-center">
                  <span className="text-red-500 text-lg mr-2">*</span> 
                  <span>{t.messages.certifyOver18}</span>
                </label>
              </div>
            </div>
            
            {isUnderage && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-red-700 font-bold">
                    {t.messages.legalViolationMinor}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== COMPOSANT GALERIE PHOTOS PREMIUM ===================
interface PhotoGalleryProps {
  photos: PhotoEntry[];
  currentIndex: number;
  viewMode: 'carousel' | 'grid';
  onNext: () => void;
  onPrev: () => void;
  onRemove: (photoId: number) => void;
  t: any;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, currentIndex, viewMode, onNext, onPrev, onRemove, t }) => {
  if (photos.length === 0) {
    return (
      <div className="relative p-12 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300/60 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">{t.messages.noPhotosAdded}</h3>
          <p className="text-gray-500">{t.messages.clickToAddPhotos}</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'carousel') {
    const currentPhoto = photos[currentIndex];
    
    return (
      <div className="space-y-6">
        <div className="relative group">
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={currentPhoto?.url}
              alt={`Photo ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={() => onRemove(currentPhoto?.id)}
              className="absolute top-4 right-4 p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
          <button
            onClick={onPrev}
            disabled={photos.length <= 1}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft className="w-5 h-5 relative z-10" />
          </button>
          
          <div className="flex items-center space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={onNext}
            disabled={photos.length <= 1}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronRight className="w-5 h-5 relative z-10" />
          </button>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{currentPhoto?.name}</p>
              <p className="text-sm text-gray-600">{new Date(currentPhoto?.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative">
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={() => onRemove(photo.id)}
              className="absolute top-2 right-2 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Step4Permits;
