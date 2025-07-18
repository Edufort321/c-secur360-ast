// =================== SECTION 1: INTERFACES ET TRADUCTIONS SANS ERREURS ===================
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
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = getTexts(language);
  
  // =================== ÉTATS PRINCIPAUX ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: ComplianceCheck[] }>({});
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  
  // ÉTATS MULTI-TRAVAILLEURS
  const [workers, setWorkers] = useState<{ [permitId: string]: WorkerEntry[] }>({});
  
  // ÉTATS PHOTOS AVEC CARROUSEL
  const [photos, setPhotos] = useState<{ [permitId: string]: PhotoEntry[] }>({});
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [permitId: string]: number }>({});
  const [viewMode, setViewMode] = useState<{ [permitId: string]: 'carousel' | 'grid' }>({});
  
  // =================== GESTION DES DONNÉES AVEC CONFORMITÉ ===================
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return translatePermitsDatabase(language);
  });

  // =================== TRADUCTION DYNAMIQUE AVEC CONFORMITÉ ===================
  useEffect(() => {
    const translatedPermits = translatePermitsDatabase(language);
    const updatedPermits = translatedPermits.map(translatedPermit => {
      const existingPermit = permits.find((p: Permit) => p.id === translatedPermit.id);
      if (existingPermit) {
        return {
          ...translatedPermit,
          selected: existingPermit.selected,
          formData: existingPermit.formData,
          status: existingPermit.status
        };
      }
      return translatedPermit;
    });
    setPermits(updatedPermits);
  }, [language]);

  // =================== VALIDATION CONFORMITÉ EN TEMPS RÉEL ===================
  useEffect(() => {
    validateCompliance();
  }, [permits, workers]);

  const validateCompliance = () => {
    const alerts: string[] = [];
    const checks: { [key: string]: ComplianceCheck[] } = {};

    permits.forEach((permit: Permit) => {
      if (permit.selected && permit.formData) {
        const permitChecks: ComplianceCheck[] = [];

        // Validation espace clos
        if (permit.id === 'confined-space-entry-2025') {
          const o2Level = parseFloat(permit.formData.oxygen_level || '0');
          const gasLevel = parseFloat(permit.formData.combustible_gas_level || '0');
          const coLevel = parseFloat(permit.formData.carbon_monoxide_level || '0');
          const h2sLevel = parseFloat(permit.formData.hydrogen_sulfide_level || '0');

          // Validation O2
          if (o2Level < 19.5 || o2Level > 23.5) {
            alerts.push(`CRITIQUE: Niveau O2 non conforme (${o2Level}%) - ARRÊT TRAVAUX REQUIS`);
            permitChecks.push({
              requirement: 'Oxygène 19.5-23.5%',
              status: 'non-compliant',
              details: `Niveau actuel: ${o2Level}%`,
              reference: 'RSST Art. 302 modifié'
            });
          } else if (o2Level > 0) {
            permitChecks.push({
              requirement: 'Oxygène 19.5-23.5%',
              status: 'compliant',
              details: `Niveau conforme: ${o2Level}%`,
              reference: 'RSST Art. 302'
            });
          }

          // Validation gaz combustibles
          if (gasLevel >= 10) {
            alerts.push(`CRITIQUE: Gaz combustibles trop élevés (${gasLevel}% LIE) - ÉVACUATION IMMÉDIATE`);
            permitChecks.push({
              requirement: 'Gaz combustibles < 10% LIE',
              status: 'non-compliant',
              details: `Niveau critique: ${gasLevel}%`,
              reference: 'RSST Art. 302'
            });
          } else if (gasLevel >= 0) {
            permitChecks.push({
              requirement: 'Gaz combustibles < 10% LIE',
              status: 'compliant',
              details: `Niveau sécuritaire: ${gasLevel}%`,
              reference: 'RSST Art. 302'
            });
          }

          // Validation CO
          if (coLevel > 35) {
            alerts.push(`CRITIQUE: Monoxyde de carbone trop élevé (${coLevel} ppm) - ÉVACUATION IMMÉDIATE`);
            permitChecks.push({
              requirement: 'CO < 35 ppm',
              status: 'non-compliant',
              details: `Niveau critique: ${coLevel} ppm`,
              reference: 'RSST Annexe I'
            });
          }

          // Validation H2S
          if (h2sLevel > 10) {
            alerts.push(`CRITIQUE: Sulfure d'hydrogène trop élevé (${h2sLevel} ppm) - ÉVACUATION IMMÉDIATE`);
            permitChecks.push({
              requirement: 'H2S < 10 ppm',
              status: 'non-compliant',
              details: `Niveau critique: ${h2sLevel} ppm`,
              reference: 'RSST Annexe I'
            });
          }

          // Validation âge travailleurs
          const permitWorkers = workers[permit.id] || [];
          const underageWorkers = permitWorkers.filter(w => w.age < 18 && w.age > 0);
          if (underageWorkers.length > 0) {
            alerts.push(`CRITIQUE: ${underageWorkers.length} travailleur(s) mineur(s) détecté(s) - Violation Art. 298 RSST`);
            permitChecks.push({
              requirement: 'Âge minimum 18 ans',
              status: 'non-compliant',
              details: `${underageWorkers.length} travailleur(s) mineur(s)`,
              reference: 'RSST Art. 298 modifié 2023'
            });
          } else if (permitWorkers.length > 0) {
            permitChecks.push({
              requirement: 'Âge minimum 18 ans',
              status: 'compliant',
              details: `Tous les travailleurs ≥ 18 ans`,
              reference: 'RSST Art. 298'
            });
          }

          // Validation surveillance continue
          if (!permit.formData.continuous_monitoring) {
            alerts.push('CRITIQUE: Surveillance atmosphérique continue manquante - Obligation RSST Art. 302');
            permitChecks.push({
              requirement: 'Surveillance continue',
              status: 'non-compliant',
              details: 'Surveillance non activée',
              reference: 'RSST Art. 302'
            });
          }
        }

        // Validation travail à chaud
        if (permit.id === 'hot-work-permit-nfpa2019') {
          if (permit.formData.fire_watch_duration !== '1 heure (NFPA 51B-2019)') {
            alerts.push('ATTENTION: Surveillance incendie doit être 1 heure selon NFPA 51B-2019');
            permitChecks.push({
              requirement: 'Surveillance incendie 1 heure',
              status: 'non-compliant',
              details: 'Durée non conforme NFPA 51B-2019',
              reference: 'NFPA 51B-2019'
            });
          } else {
            permitChecks.push({
              requirement: 'Surveillance incendie 1 heure',
              status: 'compliant',
              details: 'Conforme NFPA 51B-2019',
              reference: 'NFPA 51B-2019'
            });
          }

          if (!permit.formData.shift_reinspection) {
            alerts.push('REQUIS: Réinspection par quart obligatoire selon NFPA 51B-2019');
            permitChecks.push({
              requirement: 'Réinspection par quart',
              status: 'non-compliant',
              details: 'Réinspection non planifiée',
              reference: 'NFPA 51B-2019'
            });
          }

          if (!permit.formData.fire_watch_training_valid) {
            alerts.push('REQUIS: Formation surveillance incendie valide obligatoire');
            permitChecks.push({
              requirement: 'Formation surveillance incendie',
              status: 'non-compliant',
              details: 'Formation non validée',
              reference: 'NFPA 51B-2019'
            });
          }
        }

        // Validation excavation
        if (permit.id === 'excavation-permit-municipal-2024') {
          const depth = parseFloat(permit.formData.excavation_depth_calc || '0');
          const distance = parseFloat(permit.formData.domain_public_distance || '0');
          
          const requiresPermit = depth >= 2 || distance < 2;
          
          if (requiresPermit && !permit.formData.permit_required_auto) {
            alerts.push('REQUIS: Permis excavation obligatoire selon calculs profondeur/distance');
            permitChecks.push({
              requirement: 'Permis excavation requis',
              status: 'non-compliant',
              details: `Profondeur: ${depth}m, Distance: ${distance}m`,
              reference: 'Règlement municipal'
            });
          }

          if (!permit.formData.info_excavation_request) {
            alerts.push('CRITIQUE: Info-Excavation obligatoire - Risque d\'accident grave');
            permitChecks.push({
              requirement: 'Info-Excavation complétée',
              status: 'non-compliant',
              details: 'Demande non effectuée',
              reference: 'Loi fédérale'
            });
          } else {
            permitChecks.push({
              requirement: 'Info-Excavation complétée',
              status: 'compliant',
              details: 'Demande complétée',
              reference: 'Loi fédérale'
            });
          }

          if (!permit.formData.co_insurance_city) {
            alerts.push('CRITIQUE: Co-assurance Ville manquante - Obligation municipale');
            permitChecks.push({
              requirement: 'Co-assurance Ville',
              status: 'non-compliant',
              details: 'Avenant non ajouté',
              reference: 'Règlement municipal'
            });
          }
        }

        checks[permit.id] = permitChecks;
      }
    });

    setCriticalAlerts(alerts);
    setComplianceChecks(checks);
  };

  // =================== CALCULS AUTOMATIQUES ===================
  const calculateExcavationRequirements = (permitId: string, depth: number, distance: number) => {
    const updatedPermits = permits.map((permit: Permit) => {
      if (permit.id === permitId) {
        const requiresPermit = depth >= 2 || distance < 2;
        const insuranceAmount = depth <= 4.5 ? '1 000 000$' : depth > 4.5 ? '2 000 000$' : '5 000 000$';
        
        // Calculs dépôts garantie (tarifs réels municipaux)
        const summerRate = 73; // $/m²
        const winterRate = 95; // $/m²
        const undergroundRate = 500; // $/m linéaire
        
        const surfaceDeposit = Math.round(depth * distance * summerRate);
        const undergroundDeposit = Math.round(depth * undergroundRate);
        
        return {
          ...permit,
          formData: {
            ...permit.formData,
            permit_required_auto: requiresPermit,
            insurance_amount_calc: insuranceAmount,
            surface_guarantee_deposit: `${surfaceDeposit}$ (été) / ${Math.round(depth * distance * winterRate)}$ (hiver)`,
            underground_guarantee_deposit: `${undergroundDeposit}$ estimé`
          }
        };
      }
      return permit;
    });
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  // =================== GESTION MULTI-TRAVAILLEURS ===================
  const addWorker = (permitId: string) => {
    const permitWorkers = workers[permitId] || [];
    const newWorker: WorkerEntry = {
      id: permitWorkers.length + 1,
      name: '',
      age: 0,
      certification: '',
      entryTime: '',
      exitTime: null,
      date: new Date().toISOString().split('T')[0],
      over18: false
    };
    
    setWorkers(prev => ({
      ...prev,
      [permitId]: [...permitWorkers, newWorker]
    }));
  };

  const removeWorker = (permitId: string, workerId: number) => {
    const permitWorkers = workers[permitId] || [];
    if (permitWorkers.length > 1) {
      setWorkers(prev => ({
        ...prev,
        [permitId]: permitWorkers.filter(w => w.id !== workerId)
      }));
    }
  };

  const updateWorker = (permitId: string, workerId: number, field: keyof WorkerEntry, value: any) => {
    const permitWorkers = workers[permitId] || [];
    setWorkers(prev => ({
      ...prev,
      [permitId]: permitWorkers.map(w => 
        w.id === workerId ? { ...w, [field]: value } : w
      )
    }));
  };

  // =================== GESTION PHOTOS AVEC CARROUSEL ===================
  const handlePhotoUpload = (permitId: string, files: FileList) => {
    const permitPhotos = photos[permitId] || [];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: PhotoEntry = {
          id: Date.now() + Math.random(),
          url: event.target?.result as string,
          name: file.name,
          timestamp: new Date().toISOString(),
          description: '',
          gpsLocation: '', // TODO: Ajouter géolocalisation
          compliance: true
        };
        
        setPhotos(prev => ({
          ...prev,
          [permitId]: [...(prev[permitId] || []), newPhoto]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (permitId: string, photoId: number) => {
    const permitPhotos = photos[permitId] || [];
    setPhotos(prev => ({
      ...prev,
      [permitId]: permitPhotos.filter(p => p.id !== photoId)
    }));
    
    // Ajuster l'index du carrousel
    const currentIndex = currentPhotoIndex[permitId] || 0;
    if (currentIndex >= permitPhotos.length - 1) {
      setCurrentPhotoIndex(prev => ({
        ...prev,
        [permitId]: Math.max(0, permitPhotos.length - 2)
      }));
    }
  };

  const nextPhoto = (permitId: string) => {
    const permitPhotos = photos[permitId] || [];
    setCurrentPhotoIndex(prev => ({
      ...prev,
      [permitId]: ((prev[permitId] || 0) + 1) % permitPhotos.length
    }));
  };

  const prevPhoto = (permitId: string) => {
    const permitPhotos = photos[permitId] || [];
    const currentIndex = currentPhotoIndex[permitId] || 0;
    setCurrentPhotoIndex(prev => ({
      ...prev,
      [permitId]: (currentIndex - 1 + permitPhotos.length) % permitPhotos.length
    }));
  };

  const toggleViewMode = (permitId: string) => {
    setViewMode(prev => ({
      ...prev,
      [permitId]: prev[permitId] === 'carousel' ? 'grid' : 'carousel'
    }));
  };

  // =================== FILTRAGE DES PERMIS ===================
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.authority.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      const matchesProvince = selectedProvince === 'all' || permit.province.includes(selectedProvince);
      return matchesSearch && matchesCategory && matchesProvince;
    });
  }, [permits, searchTerm, selectedCategory, selectedProvince]);

  const categories = useMemo(() => 
    Array.from(new Set(permits.map((p: Permit) => p.category))), 
    [permits]
  );
  
  const provinces = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  
  const selectedPermits = useMemo(() => 
    permits.filter((p: Permit) => p.selected), 
    [permits]
  );

  const stats = useMemo(() => {
    const compliantCount = selectedPermits.filter((p: Permit) => {
      const checks = complianceChecks[p.id] || [];
      return checks.length === 0 || checks.every(check => check.status === 'compliant');
    }).length;

    return {
      totalPermits: permits.length,
      selected: selectedPermits.length,
      critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
      pending: selectedPermits.filter((p: Permit) => p.status === 'pending').length,
      compliant: compliantCount,
      nonCompliant: selectedPermits.length - compliantCount
    };
  }, [permits, selectedPermits, complianceChecks]);

  // =================== HANDLERS PRINCIPAUX ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map((permit: Permit) => {
      if (permit.id === permitId) {
        const newSelected = !permit.selected;
        
        // Initialiser travailleurs et photos si sélectionné
        if (newSelected) {
          if (!workers[permitId]) {
            setWorkers(prev => ({
              ...prev,
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
          
          if (!photos[permitId]) {
            setPhotos(prev => ({
              ...prev,
              [permitId]: []
            }));
          }
          
          setViewMode(prev => ({
            ...prev,
            [permitId]: 'carousel'
          }));
          
          setCurrentPhotoIndex(prev => ({
            ...prev,
            [permitId]: 0
          }));
        }
        
        return { ...permit, selected: newSelected };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
    const selectedList = updatedPermits.filter((p: Permit) => p.selected);
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      workers: workers,
      photos: photos,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter((p: Permit) => p.priority === 'critical').length,
        pending: selectedList.filter((p: Permit) => p.status === 'pending').length,
        compliant: stats.compliant,
        nonCompliant: stats.nonCompliant
      },
      compliance: {
        criticalAlerts: criticalAlerts,
        checks: complianceChecks
      }
    };
    onDataChange('permits', permitsData);
  };

  const handleFormFieldChange = (permitId: string, fieldId: string, value: any) => {
    const updatedPermits = permits.map((permit: Permit) => {
      if (permit.id === permitId) {
        const updatedFormData = {
          ...permit.formData,
          [fieldId]: value
        };

        // Calculs automatiques pour excavation
        if (permit.id === 'excavation-permit-municipal-2024') {
          if (fieldId === 'excavation_depth_calc' || fieldId === 'domain_public_distance') {
            const depth = parseFloat(fieldId === 'excavation_depth_calc' ? value : permit.formData?.excavation_depth_calc || '0');
            const distance = parseFloat(fieldId === 'domain_public_distance' ? value : permit.formData?.domain_public_distance || '0');
            
            if (depth >= 0 && distance >= 0) {
              setTimeout(() => calculateExcavationRequirements(permitId, depth, distance), 100);
            }
          }
        }

        return {
          ...permit,
          formData: updatedFormData
        };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const toggleFormExpansion = (permitId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [permitId]: !prev[permitId]
    }));
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string) => {
    const categoryKey = category === 'Safety' ? 'Sécurité' : 
                       category === 'Construction' ? 'Construction' :
                       category === 'Radiation Protection' ? 'Radioprotection' :
                       category === 'Equipment' ? 'Équipements' : category;
    
    switch (categoryKey) {
      case 'Sécurité': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': return '☢️';
      case 'Équipements': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'enhanced': return '#059669';
      case 'standard': return '#2563eb';
      case 'basic': return '#64748b';
      default: return '#6b7280';
    }
  };

  // Initialiser les états au premier rendu
  useEffect(() => {
    // Initialiser workers et photos pour les permis déjà sélectionnés
    permits.forEach((permit: Permit) => {
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
      }
    });
  }, []);

  // =================== RENDU JSX DU COMPOSANT ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* =================== HEADER AVEC TITRE ET STATS =================== */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
          
          {/* Statistiques conformité */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPermits}</div>
              <div className="text-sm text-gray-500">{t.stats.available}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
              <div className="text-sm text-gray-500">{t.stats.selected}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-gray-500">{t.stats.critical}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">{t.stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-emerald-600">{stats.compliant}</div>
              <div className="text-sm text-gray-500">{t.stats.compliant}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-rose-600">{stats.nonCompliant}</div>
              <div className="text-sm text-gray-500">{t.stats.nonCompliant}</div>
            </div>
          </div>
        </div>

        {/* =================== ALERTES CRITIQUES =================== */}
        {criticalAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-2xl animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">{t.alerts.critical}</h3>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-red-200">•</span>
                  <span className="text-sm">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================== FILTRES ET RECHERCHE =================== */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="all">{t.allCategories}</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {t.categories[category] || category}
                </option>
              ))}
            </select>
            
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">{t.allProvinces}</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedProvince('all');
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* =================== LISTE DES PERMIS =================== */}
        <div className="space-y-6">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
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
                isExpanded={expandedForms[permit.id]}
                complianceChecks={complianceChecks[permit.id] || []}
                workers={workers[permit.id] || []}
                photos={photos[permit.id] || []}
                currentPhotoIndex={currentPhotoIndex[permit.id] || 0}
                viewMode={viewMode[permit.id] || 'carousel'}
                onToggle={() => handlePermitToggle(permit.id)}
                onExpand={() => toggleFormExpansion(permit.id)}
                onFieldChange={(fieldId, value) => handleFormFieldChange(permit.id, fieldId, value)}
                onAddWorker={() => addWorker(permit.id)}
                onRemoveWorker={(workerId) => removeWorker(permit.id, workerId)}
                onUpdateWorker={(workerId, field, value) => updateWorker(permit.id, workerId, field, value)}
                onPhotoUpload={(files) => handlePhotoUpload(permit.id, files)}
                onRemovePhoto={(photoId) => removePhoto(permit.id, photoId)}
                onNextPhoto={() => nextPhoto(permit.id)}
                onPrevPhoto={() => prevPhoto(permit.id)}
                onToggleViewMode={() => toggleViewMode(permit.id)}
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
// =================== SECTION 4: COMPOSANTS UI SANS ERREURS ===================
// À coller après la Section 3

// =================== COMPOSANT CARTE PERMIS =================== 
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
    <div className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
      isSelected ? 'border-blue-500 shadow-2xl' : 'border-gray-200'
    } ${hasViolations ? 'border-red-500 bg-red-50' : ''}`}>
      
      {/* En-tête de la carte */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{getCategoryIcon(permit.category)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{permit.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{permit.description}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: getPriorityColor(permit.priority) }}
                >
                  {t.priorities[permit.priority]}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: getStatusColor(permit.status) }}
                >
                  {t.statuses[permit.status]}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: getComplianceColor(permit.complianceLevel) }}
                >
                  {t.complianceLevels[permit.complianceLevel]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasViolations && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                {nonCompliantChecks.length} violation(s)
              </div>
            )}
            
            <button
              onClick={onToggle}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isSelected 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {isSelected ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Retirer</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Sélectionner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu expansible */}
      {isSelected && (
        <div className="p-6 space-y-6">
          
          {/* Vérifications de conformité */}
          {complianceChecks.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Vérifications de Conformité
              </h4>
              <div className="space-y-2">
                {complianceChecks.map((check, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    check.status === 'compliant' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {check.status === 'compliant' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{check.requirement}</div>
                        <div className="text-sm text-gray-600">{check.details}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{check.reference}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton pour étendre/réduire le formulaire */}
          <button
            onClick={onExpand}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            <span>{isExpanded ? 'Réduire le formulaire' : 'Remplir le formulaire'}</span>
          </button>

          {/* Formulaire étendu */}
          {isExpanded && (
            <div className="space-y-8">
              
              {/* Grille des champs de formulaire */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Colonne gauche - Champs du formulaire */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Informations du Permis
                  </h4>
                  
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

                {/* Colonne droite - Travailleurs et Photos */}
                <div className="space-y-6">
                  
                  {/* Section Travailleurs */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        {t.messages.authorizedWorkers} ({workers.length})
                      </h4>
                      <button
                        onClick={onAddWorker}
                        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{t.messages.addWorker}</span>
                      </button>
                    </div>

                    <div className="space-y-4 max-h-64 overflow-y-auto">
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

                  {/* Section Photos */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Camera className="w-5 h-5 mr-2" />
                        {t.messages.sitePhotos} ({photos.length})
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={onToggleViewMode}
                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          title={t.messages.toggleView}
                        >
                          {viewMode === 'carousel' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        </button>
                        <label className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 cursor-pointer text-sm">
                          <Upload className="w-4 h-4" />
                          <span>{t.messages.addPhotos}</span>
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

              {/* Actions du formulaire */}
              <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Save className="w-5 h-5" />
                  <span>{t.actions.save}</span>
                </button>
                
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>{t.actions.download}</span>
                </button>
                
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Eye className="w-5 h-5" />
                  <span>{t.actions.preview}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT CHAMP DE FORMULAIRE ===================
interface FormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  t: any;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, t }) => {
  const getFieldComponent = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">{t.messages.select}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );

      case 'gas_meter':
        const numValue = parseFloat(value) || 0;
        const isInRange = numValue >= (field.validation?.min || 0) && numValue <= (field.validation?.max || 100);
        
        return (
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-blue-500 transition-all duration-200 ${
                isInRange ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}
            />
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-lg ${
              isInRange ? 'text-green-600' : 'text-red-600'
            }`}>
              {isInRange ? '✓' : '⚠️'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {field.validation?.min || 0} - {field.validation?.max || 100}
              {field.validation?.critical && (
                <span className="text-red-600 font-medium"> (CRITIQUE)</span>
              )}
            </div>
          </div>
        );

      case 'compliance_check':
        return (
          <div className={`p-4 rounded-xl border-2 ${
            value ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
          }`}>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                required={field.required}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`font-medium ${value ? 'text-green-700' : 'text-red-700'}`}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </div>
            {field.complianceRef && (
              <div className="text-xs text-gray-600 mt-2">{field.complianceRef}</div>
            )}
          </div>
        );

      case 'file':
        return (
          <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 cursor-pointer transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Cliquer pour sélectionner un fichier</span>
              {value && <div className="text-xs text-blue-600 mt-1">{value.name || value}</div>}
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
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        );
    }
  };

  if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'compliance_check') {
    return (
      <div className="space-y-2">
        {getFieldComponent()}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {field.label} {field.required && <span className="text-red-500">*</span>}
        {field.validation?.legalRequirement && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">LÉGAL</span>
        )}
      </label>
      {getFieldComponent()}
      {field.validation?.message && (
        <div className={`text-xs ${field.validation.critical ? 'text-red-600' : 'text-gray-500'}`}>
          {field.validation.message}
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT CARTE TRAVAILLEUR ===================
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
    <div className={`border rounded-lg p-4 ${isUnderage ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-700">{t.messages.workerNumber}{index + 1}</h5>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.messages.fullName}</label>
          <input
            type="text"
            value={worker.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder={t.messages.workerName}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.messages.age}</label>
          <input
            type="number"
            value={worker.age || ''}
            onChange={(e) => onUpdate('age', parseInt(e.target.value) || 0)}
            placeholder={t.messages.workerAge}
            min="16"
            max="70"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 text-sm ${
              isUnderage ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.messages.certification}</label>
          <select
            value={worker.certification}
            onChange={(e) => onUpdate('certification', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">{t.messages.selectCertification}</option>
            <option value="basic">{t.messages.basicTraining}</option>
            <option value="advanced">{t.messages.advancedTraining}</option>
            <option value="supervisor">{t.messages.supervisor}</option>
            <option value="rescuer">{t.messages.rescuer}</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`worker-${worker.id}-18plus`}
              checked={worker.over18}
              onChange={(e) => onUpdate('over18', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`worker-${worker.id}-18plus`} className="text-xs text-gray-700">
              <span className="text-red-500">*</span> {t.messages.certifyOver18}
            </label>
          </div>
          
          {isUnderage && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-xs text-red-700 font-medium">
                ⚠️ {t.messages.legalViolationMinor}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================== COMPOSANT GALERIE PHOTOS ===================
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
      <div className="text-center py-8 text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">{t.messages.noPhotosAdded}</p>
        <p className="text-xs text-gray-400">{t.messages.clickToAddPhotos}</p>
      </div>
    );
  }

  if (viewMode === 'carousel') {
    const currentPhoto = photos[currentIndex];
    
    return (
      <div className="space-y-3">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={currentPhoto?.url}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onRemove(currentPhoto?.id)}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={photos.length <= 1}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex space-x-1">
            {photos.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={onNext}
            disabled={photos.length <= 1}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-600">
            {currentPhoto?.name} • {new Date(currentPhoto?.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-20 object-cover rounded-lg"
          />
          <button
            onClick={() => onRemove(photo.id)}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Step4Permits;
