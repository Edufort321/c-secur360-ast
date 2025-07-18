"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer
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

// =================== FONCTION DE TRADUCTION BILINGUE COMPLETE ===================
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
        addPhotos: '📷 Ajouter des photos',
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
        municipalNotified: 'Municipalité avisée'
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
        addPhotos: '📷 Add photos',
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
        municipalNotified: 'Municipality notified'
      }
    };
  }
};
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
        { id: 'space_identification', type: 'text', label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification', required: true, section: 'identification', placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 300' },
        { id: 'project_name', type: 'text', label: language === 'fr' ? 'Nom du projet' : 'Project name', required: true, section: 'identification' },
        { id: 'location_precise', type: 'text', label: language === 'fr' ? 'Localisation GPS précise' : 'Precise GPS location', required: true, section: 'identification', validation: { legalRequirement: true } },
        { id: 'permit_date', type: 'date', label: language === 'fr' ? 'Date du permis' : 'Permit date', required: true, section: 'identification' },
        { id: 'permit_time', type: 'time_picker', label: language === 'fr' ? 'Heure d\'émission' : 'Issue time', required: true, section: 'identification' },
        { id: 'permit_duration', type: 'select', label: language === 'fr' ? 'Durée validité (max 8h)' : 'Validity duration (max 8h)', required: true, section: 'identification', options: ['1h', '2h', '4h', '6h', '8h'], validation: { legalRequirement: true }, complianceRef: 'RSST Art. 300' },
        
        // SECTION GAS MONITORING OBLIGATOIRE
        { id: 'oxygen_level', type: 'gas_meter', label: language === 'fr' ? 'Niveau oxygène (%)' : 'Oxygen level (%)', required: true, section: 'gas_monitoring', validation: { min: 19.5, max: 23.5, critical: true, legalRequirement: true, message: language === 'fr' ? 'CRITIQUE: O2 doit être entre 19.5% et 23.5%' : 'CRITICAL: O2 must be between 19.5% and 23.5%' }, complianceRef: 'RSST Art. 302 modifié' },
        { id: 'combustible_gas_level', type: 'gas_meter', label: language === 'fr' ? 'Gaz combustibles (% LIE)' : 'Combustible gas (% LEL)', required: true, section: 'gas_monitoring', validation: { min: 0, max: 10, critical: true, legalRequirement: true, message: language === 'fr' ? 'CRITIQUE: Gaz combustibles < 10% LIE obligatoire' : 'CRITICAL: Combustible gas < 10% LEL mandatory' }, complianceRef: 'RSST Art. 302' },
        { id: 'carbon_monoxide_level', type: 'gas_meter', label: language === 'fr' ? 'Monoxyde de carbone (ppm)' : 'Carbon monoxide (ppm)', required: true, section: 'gas_monitoring', validation: { min: 0, max: 35, critical: true, legalRequirement: true, message: language === 'fr' ? 'CRITIQUE: CO < 35 ppm obligatoire' : 'CRITICAL: CO < 35 ppm mandatory' }, complianceRef: 'RSST Annexe I' },
        { id: 'hydrogen_sulfide_level', type: 'gas_meter', label: language === 'fr' ? 'Sulfure d\'hydrogène (ppm)' : 'Hydrogen sulfide (ppm)', required: true, section: 'gas_monitoring', validation: { min: 0, max: 10, critical: true, legalRequirement: true, message: language === 'fr' ? 'CRITIQUE: H2S < 10 ppm obligatoire' : 'CRITICAL: H2S < 10 ppm mandatory' }, complianceRef: 'RSST Annexe I' },
        { id: 'continuous_monitoring', type: 'checkbox', label: language === 'fr' ? 'Surveillance atmosphérique CONTINUE pendant travaux' : 'CONTINUOUS atmospheric monitoring during work', required: true, section: 'gas_monitoring', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 302' },
        { id: 'detector_calibration_date', type: 'date', label: language === 'fr' ? 'Date calibration détecteur' : 'Detector calibration date', required: true, section: 'gas_monitoring', validation: { legalRequirement: true } },
        { id: 'detector_serial_number', type: 'text', label: language === 'fr' ? 'Numéro série détecteur' : 'Detector serial number', required: true, section: 'gas_monitoring' },
        
        // SECTION ACCÈS ET ÂGE OBLIGATOIRE
        { id: 'entry_mandatory', type: 'radio', label: language === 'fr' ? 'L\'entrée est-elle obligatoire ?' : 'Is entry mandatory?', required: true, section: 'access', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], validation: { legalRequirement: true }, complianceRef: 'RSST Art. 297.1' },
        { id: 'external_control_possible', type: 'radio', label: language === 'fr' ? 'Contrôle depuis l\'extérieur possible ?' : 'External control possible?', required: true, section: 'access', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], validation: { legalRequirement: true }, complianceRef: 'RSST Art. 297.1 nouveau' },
        { id: 'worker_age_verification', type: 'compliance_check', label: language === 'fr' ? 'VÉRIFICATION: Tous travailleurs ≥ 18 ans' : 'VERIFICATION: All workers ≥ 18 years', required: true, section: 'access', validation: { critical: true, legalRequirement: true }, complianceRef: 'RSST Art. 298 modifié 2023' },
        { id: 'worker_certification_check', type: 'compliance_check', label: language === 'fr' ? 'Certification formation espace clos valide' : 'Valid confined space training certification', required: true, section: 'access', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 298' },
        
        // SECTION PLAN DE SAUVETAGE PERSONNALISÉ
        { id: 'rescue_plan_personalized', type: 'textarea', label: language === 'fr' ? 'Plan de sauvetage PERSONNALISÉ pour cet espace' : 'PERSONALIZED rescue plan for this space', required: true, section: 'rescue_plan', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 309 enrichi', placeholder: language === 'fr' ? 'Décrire procédure spécifique, équipements, points d\'accès...' : 'Describe specific procedure, equipment, access points...' },
        { id: 'rescue_responsible_person', type: 'text', label: language === 'fr' ? 'Responsable sauvetage DÉSIGNÉ' : 'DESIGNATED rescue responsible', required: true, section: 'rescue_plan', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 309' },
        { id: 'communication_protocol', type: 'select', label: language === 'fr' ? 'Protocole communication obligatoire' : 'Mandatory communication protocol', required: true, section: 'rescue_plan', options: language === 'fr' ? ['Radio bidirectionnelle', 'Téléphone cellulaire', 'Signaux visuels/sonores', 'Système fixe'] : ['Two-way radio', 'Cell phone', 'Visual/audio signals', 'Fixed system'], validation: { legalRequirement: true }, complianceRef: 'RSST Art. 309' },
        { id: 'rescue_equipment_onsite', type: 'checkbox', label: language === 'fr' ? 'Équipements sauvetage SUR SITE avant entrée' : 'Rescue equipment ON SITE before entry', required: true, section: 'rescue_plan', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 309' },
        { id: 'response_time_target', type: 'select', label: language === 'fr' ? 'Temps de réponse sauvetage' : 'Rescue response time', required: true, section: 'rescue_plan', options: ['< 3 minutes', '< 5 minutes', '< 10 minutes'], validation: { legalRequirement: true } },
        { id: 'emergency_contact_primary', type: 'text', label: language === 'fr' ? 'Contact urgence primaire (nom + tél)' : 'Primary emergency contact (name + phone)', required: true, section: 'rescue_plan', validation: { legalRequirement: true } },
        { id: 'emergency_contact_secondary', type: 'text', label: language === 'fr' ? 'Contact urgence secondaire' : 'Secondary emergency contact', required: true, section: 'rescue_plan' },
        
        // SECTION MATIÈRES À ÉCOULEMENT LIBRE
        { id: 'free_flowing_materials', type: 'radio', label: language === 'fr' ? 'Matières à écoulement libre présentes ?' : 'Free-flowing materials present?', required: true, section: 'safety', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], validation: { legalRequirement: true }, complianceRef: 'RSST Art. 311-312 séparés' },
        { id: 'burial_risk_assessment', type: 'textarea', label: language === 'fr' ? 'Évaluation risque ensevelissement/noyade' : 'Burial/drowning risk assessment', required: false, section: 'safety', complianceRef: 'RSST Art. 311-312' },
        { id: 'fall_prevention_measures', type: 'checkbox', label: language === 'fr' ? 'Mesures prévention chutes installées' : 'Fall prevention measures installed', required: true, section: 'safety', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 297.1' },
        
        // SECTION TRAVAILLEURS AUTORISÉS
        { id: 'authorized_workers', type: 'textarea', label: language === 'fr' ? 'Travailleurs autorisés (nom, âge, certification)' : 'Authorized workers (name, age, certification)', required: true, section: 'signatures', placeholder: language === 'fr' ? 'Format: Nom, Prénom - Âge: XX ans - Cert: XXXXX' : 'Format: Last, First - Age: XX years - Cert: XXXXX', validation: { legalRequirement: true } },
        { id: 'workers_log', type: 'workers_tracking', label: language === 'fr' ? 'Registre entrées/sorties avec surveillance gaz' : 'Entry/exit log with gas monitoring', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'photos_documentation', type: 'photo_gallery', label: language === 'fr' ? 'Photos documentation sécurité obligatoires' : 'Mandatory safety documentation photos', required: true, section: 'atmosphere', validation: { legalRequirement: true } },
        { id: 'supervisor_signature', type: 'signature', label: language === 'fr' ? 'Signature surveillant qualifié' : 'Qualified supervisor signature', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'attendant_signature', type: 'signature', label: language === 'fr' ? 'Signature préposé à l\'entrée' : 'Entry attendant signature', required: true, section: 'signatures', validation: { legalRequirement: true } }
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
        { id: 'permit_number_hot', type: 'text', label: language === 'fr' ? 'Numéro de permis unique' : 'Unique permit number', required: true, section: 'identification', validation: { legalRequirement: true } },
        { id: 'work_location_precise', type: 'text', label: language === 'fr' ? 'Lieu précis des travaux' : 'Precise work location', required: true, section: 'identification', validation: { legalRequirement: true } },
        { id: 'contractor_company', type: 'text', label: language === 'fr' ? 'Entreprise contractante' : 'Contracting company', required: true, section: 'identification' },
        { id: 'work_order_number', type: 'text', label: language === 'fr' ? 'Numéro bon de travail' : 'Work order number', required: true, section: 'identification' },
        
        // SECTION TYPE DE TRAVAIL À CHAUD
        { id: 'work_type_hot', type: 'checkbox', label: language === 'fr' ? 'Type de travail à chaud (sélection multiple)' : 'Hot work type (multiple selection)', required: true, section: 'work_type', options: language === 'fr' ? ['Soudage à l\'arc électrique', 'Soudage au gaz (oxyacétylénique)', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage avec étincelles', 'Perçage métaux', 'Brasage/Soudage tendre', 'Travaux de toiture à chaud', 'Autre (spécifier)'] : ['Electric arc welding', 'Gas welding (oxyacetylene)', 'Torch cutting', 'Plasma cutting', 'Grinding with sparks', 'Metal drilling', 'Brazing/Soft soldering', 'Hot roofing work', 'Other (specify)'], validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019' },
        { id: 'work_description_detailed', type: 'textarea', label: language === 'fr' ? 'Description détaillée des travaux et équipements' : 'Detailed work and equipment description', required: true, section: 'work_type', validation: { legalRequirement: true } },
        { id: 'start_date_time', type: 'time_picker', label: language === 'fr' ? 'Date et heure début prévues' : 'Planned start date and time', required: true, section: 'work_type' },
        { id: 'end_date_time', type: 'time_picker', label: language === 'fr' ? 'Date et heure fin prévues' : 'Planned end date and time', required: true, section: 'work_type' },
        
        // SECTION SURVEILLANCE INCENDIE NFPA 51B-2019
        { id: 'fire_watch_duration', type: 'select', label: language === 'fr' ? 'Durée surveillance incendie POST-TRAVAUX' : 'POST-WORK fire watch duration', required: true, section: 'fire_watch', options: ['1 heure (NFPA 51B-2019)', '2 heures', 'Plus de 2 heures'], validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019 - Modif majeure: 1h au lieu de 30min' },
        { id: 'continuous_vs_spot_watch', type: 'radio', label: language === 'fr' ? 'Type de surveillance incendie' : 'Fire watch type', required: true, section: 'fire_watch', options: language === 'fr' ? ['Surveillance CONTINUE', 'Surveillance PONCTUELLE'] : ['CONTINUOUS monitoring', 'SPOT monitoring'], validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019 - Distinction formelle' },
        { id: 'fire_watch_person_assigned', type: 'text', label: language === 'fr' ? 'Préposé surveillance incendie désigné' : 'Designated fire watch person', required: true, section: 'fire_watch', validation: { legalRequirement: true } },
        { id: 'fire_watch_training_valid', type: 'checkbox', label: language === 'fr' ? 'Formation surveillance incendie valide' : 'Valid fire watch training', required: true, section: 'fire_watch', validation: { legalRequirement: true } },
        
        // SECTION RÉINSPECTION PAR QUART (NOUVEAU NFPA)
        { id: 'shift_reinspection', type: 'compliance_check', label: language === 'fr' ? 'Réinspection OBLIGATOIRE à chaque quart' : 'MANDATORY reinspection each shift', required: true, section: 'fire_watch', validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019 - Nouvelle annexe' },
        { id: 'reinspection_documentation', type: 'textarea', label: language === 'fr' ? 'Documentation des réinspections par quart' : 'Shift reinspection documentation', required: true, section: 'fire_watch', placeholder: language === 'fr' ? 'Heure, responsable, observations, actions...' : 'Time, responsible person, observations, actions...', validation: { legalRequirement: true } },
        
        // SECTION EXTINCTEURS HARMONISÉS NFPA 10
        { id: 'extinguisher_type_class_a', type: 'checkbox', label: language === 'fr' ? 'Extincteur Classe A (combustibles ordinaires)' : 'Class A extinguisher (ordinary combustibles)', required: false, section: 'precautions', complianceRef: 'NFPA 51B harmonisé avec NFPA 10' },
        { id: 'extinguisher_type_class_b', type: 'checkbox', label: language === 'fr' ? 'Extincteur Classe B (liquides inflammables)' : 'Class B extinguisher (flammable liquids)', required: false, section: 'precautions', complianceRef: 'NFPA 10' },
        { id: 'extinguisher_type_class_c', type: 'checkbox', label: language === 'fr' ? 'Extincteur Classe C (équipements électriques)' : 'Class C extinguisher (electrical equipment)', required: false, section: 'precautions', complianceRef: 'NFPA 10' },
        { id: 'extinguisher_positioning', type: 'textarea', label: language === 'fr' ? 'Positionnement et accessibilité extincteurs' : 'Extinguisher positioning and accessibility', required: true, section: 'precautions', validation: { legalRequirement: true }, complianceRef: 'NFPA 10' },
        
        // SECTION ZONES NON PERMISSIBLES
        { id: 'non_permissible_zone_prep', type: 'textarea', label: language === 'fr' ? 'Préparation zones non permissibles' : 'Non-permissible zone preparation', required: true, section: 'precautions', validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019 - Précisions annexes' },
        { id: 'protection_system_compromise', type: 'radio', label: language === 'fr' ? 'Systèmes de protection incendie compromis ?' : 'Fire protection systems compromised?', required: true, section: 'precautions', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], validation: { legalRequirement: true } },
        { id: 'material_ignition_points', type: 'textarea', label: language === 'fr' ? 'Points d\'inflammation matériaux présents' : 'Ignition points of present materials', required: true, section: 'precautions', validation: { legalRequirement: true } },
        { id: 'temperature_vs_ignition_table', type: 'compliance_check', label: language === 'fr' ? 'Tableau températures vs points inflammation consulté' : 'Temperature vs ignition points table consulted', required: true, section: 'precautions', validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019 - Nouvelles comparaisons' },
        
        // SECTION PHOTOS ET DOCUMENTATION
        { id: 'photos_precautions', type: 'photo_gallery', label: language === 'fr' ? 'Photos mesures précaution et zones' : 'Precautionary measures and zone photos', required: true, section: 'precautions', validation: { legalRequirement: true } },
        { id: 'area_clearance_radius', type: 'number', label: language === 'fr' ? 'Rayon dégagement sécuritaire (m)' : 'Safety clearance radius (m)', required: true, section: 'precautions', validation: { min: 10, legalRequirement: true } },
        
        // SECTION SIGNATURES
        { id: 'applicant_signature', type: 'signature', label: language === 'fr' ? 'Signature demandeur/contractant' : 'Applicant/contractor signature', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'fire_marshal_signature', type: 'signature', label: language === 'fr' ? 'Signature autorité incendie' : 'Fire authority signature', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'safety_officer_signature', type: 'signature', label: language === 'fr' ? 'Signature responsable sécurité' : 'Safety officer signature', required: true, section: 'signatures', validation: { legalRequirement: true } }
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
        { id: 'applicant_name_excavation', type: 'text', label: language === 'fr' ? 'Nom du demandeur' : 'Applicant name', required: true, section: 'applicant', validation: { legalRequirement: true } },
        { id: 'applicant_company', type: 'text', label: language === 'fr' ? 'Entreprise/Organisation' : 'Company/Organization', required: true, section: 'applicant' },
        { id: 'professional_engineer', type: 'text', label: language === 'fr' ? 'Ingénieur responsable (OIQ)' : 'Responsible engineer (OIQ)', required: true, section: 'applicant', validation: { legalRequirement: true } },
        { id: 'contractor_excavator', type: 'text', label: language === 'fr' ? 'Entreprise excavatrice' : 'Excavating company', required: true, section: 'applicant', validation: { legalRequirement: true } },
        
        // SECTION CALCULS AUTOMATIQUES OBLIGATOIRES
        { id: 'excavation_depth_calc', type: 'calculation', label: language === 'fr' ? 'Profondeur excavation (m)' : 'Excavation depth (m)', required: true, section: 'excavation', validation: { min: 0, legalRequirement: true }, calculation: { autoCalculate: true } },
        { id: 'domain_public_distance', type: 'calculation', label: language === 'fr' ? 'Distance domaine public (m)' : 'Public domain distance (m)', required: true, section: 'excavation', validation: { min: 0, legalRequirement: true }, calculation: { autoCalculate: true } },
        { id: 'permit_required_auto', type: 'compliance_check', label: language === 'fr' ? 'PERMIS REQUIS (auto-calculé)' : 'PERMIT REQUIRED (auto-calculated)', required: true, section: 'excavation', validation: { legalRequirement: true }, calculation: { formula: 'if(depth < 2 && distance < 2) OR (depth >= 2 && distance < depth*2) then REQUIRED', dependencies: ['excavation_depth_calc', 'domain_public_distance'], autoCalculate: true }, complianceRef: 'Règlement municipal excavation' },
        
        // SECTION ASSURANCES OBLIGATOIRES SPÉCIFIQUES
        { id: 'insurance_amount_calc', type: 'calculation', label: language === 'fr' ? 'Montant assurance OBLIGATOIRE' : 'MANDATORY insurance amount', required: true, section: 'municipal_requirements', validation: { legalRequirement: true }, calculation: { formula: 'if(depth <= 4.5) then 1000000 else if(depth > 4.5) then 2000000 else 5000000', dependencies: ['excavation_depth_calc'], autoCalculate: true }, complianceRef: 'Règlement municipal assurances' },
        { id: 'co_insurance_city', type: 'checkbox', label: language === 'fr' ? 'Co-assurance Ville AJOUTÉE à la police' : 'City co-insurance ADDED to policy', required: true, section: 'municipal_requirements', validation: { legalRequirement: true, critical: true }, complianceRef: 'Avenant obligatoire Ville' },
        { id: 'insurance_certificate', type: 'file', label: language === 'fr' ? 'Certificat assurance avec avenant' : 'Insurance certificate with endorsement', required: true, section: 'municipal_requirements', validation: { legalRequirement: true } },
        
        // SECTION ÉTUDES TECHNIQUES OBLIGATOIRES
        { id: 'geotechnical_study', type: 'file', label: language === 'fr' ? 'Étude géotechnique par ingénieur (≥2m)' : 'Geotechnical study by engineer (≥2m)', required: true, section: 'documents', validation: { legalRequirement: true }, complianceRef: 'Code construction' },
        { id: 'shoring_plan_engineer', type: 'file', label: language === 'fr' ? 'Plan étançonnement signé ingénieur' : 'Shoring plan signed by engineer', required: true, section: 'documents', validation: { legalRequirement: true } },
        { id: 'calculation_notes_engineer', type: 'file', label: language === 'fr' ? 'Notes de calculs ingénieur' : 'Engineer calculation notes', required: true, section: 'documents', validation: { legalRequirement: true } },
        { id: 'blasting_plan_if_rock', type: 'file', label: language === 'fr' ? 'Plan dynamitage (si roc)' : 'Blasting plan (if rock)', required: false, section: 'documents', complianceRef: 'Règlement dynamitage municipal' },
        
        // SECTION LOCALISATION INFRASTRUCTURES OBLIGATOIRE
        { id: 'info_excavation_request', type: 'compliance_check', label: language === 'fr' ? 'Demande Info-Excavation COMPLÉTÉE' : 'Info-Excavation request COMPLETED', required: true, section: 'safety', validation: { legalRequirement: true, critical: true }, complianceRef: 'https://www.info-ex.com - Loi fédérale' },
        { id: 'municipal_networks_located', type: 'checkbox', label: language === 'fr' ? 'Réseaux municipaux localisés (aqueduc/égout)' : 'Municipal networks located (water/sewer)', required: true, section: 'safety', validation: { legalRequirement: true } },
        { id: 'bell_energir_hydro_located', type: 'checkbox', label: language === 'fr' ? 'Bell/Énergir/Hydro-Québec localisés' : 'Bell/Energir/Hydro-Quebec located', required: true, section: 'safety', validation: { legalRequirement: true } },
        { id: 'location_plans_provided', type: 'file', label: language === 'fr' ? 'Plans localisation infrastructures' : 'Infrastructure location plans', required: true, section: 'safety', validation: { legalRequirement: true } },
        
        // SECTION PROJET ET DESCRIPTION
        { id: 'work_address_complete', type: 'textarea', label: language === 'fr' ? 'Adresse complète des travaux' : 'Complete work address', required: true, section: 'project', validation: { legalRequirement: true } },
        { id: 'project_description_detailed', type: 'textarea', label: language === 'fr' ? 'Description détaillée du projet' : 'Detailed project description', required: true, section: 'project', validation: { legalRequirement: true } },
        { id: 'soil_type_identified', type: 'select', label: language === 'fr' ? 'Type de sol identifié' : 'Identified soil type', required: true, section: 'excavation', options: language === 'fr' ? ['Argile', 'Sable fin', 'Sable grossier', 'Gravier', 'Roc altéré', 'Roc massif', 'Remblai', 'Sol mixte', 'Sol contaminé'] : ['Clay', 'Fine sand', 'Coarse sand', 'Gravel', 'Weathered rock', 'Solid rock', 'Fill', 'Mixed soil', 'Contaminated soil'], validation: { legalRequirement: true } },
        { id: 'contamination_risk', type: 'radio', label: language === 'fr' ? 'Risque de contamination identifié ?' : 'Contamination risk identified?', required: true, section: 'excavation', options: language === 'fr' ? ['Oui', 'Non', 'Inconnu'] : ['Yes', 'No', 'Unknown'], validation: { legalRequirement: true } },
        
        // SECTION DÉPÔTS DE GARANTIE CALCULÉS
        { id: 'surface_guarantee_deposit', type: 'calculation', label: language === 'fr' ? 'Dépôt garantie SURFACE (trottoir, arbres)' : 'SURFACE guarantee deposit (sidewalk, trees)', required: true, section: 'municipal_requirements', validation: { legalRequirement: true }, calculation: { formula: 'superficie * tarif_saison', autoCalculate: true } },
        { id: 'underground_guarantee_deposit', type: 'calculation', label: language === 'fr' ? 'Dépôt garantie SOUTERRAIN (égout, aqueduc)' : 'UNDERGROUND guarantee deposit (sewer, water)', required: true, section: 'municipal_requirements', validation: { legalRequirement: true }, calculation: { formula: 'longueur * profondeur * tarif', autoCalculate: true } },
        { id: 'seasonal_rate_applied', type: 'radio', label: language === 'fr' ? 'Période des travaux (tarifs différents)' : 'Work period (different rates)', required: true, section: 'municipal_requirements', options: language === 'fr' ? ['Été (1 avril - 30 nov)', 'Hiver (1 déc - 31 mars)'] : ['Summer (Apr 1 - Nov 30)', 'Winter (Dec 1 - Mar 31)'], validation: { legalRequirement: true } },
        { id: 'material_type_repair', type: 'select', label: language === 'fr' ? 'Type matériau réparation' : 'Repair material type', required: true, section: 'municipal_requirements', options: language === 'fr' ? ['Asphalte enrobé', 'Béton standard', 'Pavé béton', 'Trottoir asphalte', 'Gazon/Terre', 'Piste cyclable'] : ['Asphalt pavement', 'Standard concrete', 'Concrete pavers', 'Asphalt sidewalk', 'Grass/Soil', 'Bike path'], validation: { legalRequirement: true } },
        
        // SECTION PLAN DE SÉCURITÉ
        { id: 'safety_plan_detailed', type: 'radio', label: language === 'fr' ? 'Plan de sécurité détaillé préparé' : 'Detailed safety plan prepared', required: true, section: 'safety', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'], validation: { legalRequirement: true } },
        { id: 'safety_fencing', type: 'checkbox', label: language === 'fr' ? 'Clôturage sécuritaire installé' : 'Safety fencing installed', required: true, section: 'safety', validation: { legalRequirement: true } },
        { id: 'municipal_inspection_scheduled', type: 'compliance_check', label: language === 'fr' ? 'Inspection municipale PLANIFIÉE' : 'Municipal inspection SCHEDULED', required: true, section: 'municipal_requirements', validation: { legalRequirement: true }, complianceRef: 'Obligation inspection avant/pendant/après' },
        
        // SECTION PHOTOS ET DOCUMENTATION
        { id: 'photos_safety_site', type: 'photo_gallery', label: language === 'fr' ? 'Photos sécurité et état initial du site' : 'Safety and initial site condition photos', required: true, section: 'safety', validation: { legalRequirement: true } },
        { id: 'site_plan_implementation', type: 'file', label: language === 'fr' ? 'Plan d\'implantation du site' : 'Site implementation plan', required: true, section: 'documents', validation: { legalRequirement: true } },
        
        // SECTION SIGNATURES
        { id: 'applicant_signature_excavation', type: 'signature', label: language === 'fr' ? 'Signature demandeur' : 'Applicant signature', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'engineer_signature', type: 'signature', label: language === 'fr' ? 'Signature ingénieur responsable' : 'Responsible engineer signature', required: true, section: 'signatures', validation: { legalRequirement: true } },
        { id: 'municipal_approval_signature', type: 'signature', label: language === 'fr' ? 'Approbation municipale' : 'Municipal approval', required: false, section: 'signatures' }
      ]
    }
  ];

  return basePermits;
};
// =================== COMPOSANT PRINCIPAL AVEC CONFORMITÉ 2024-2025 ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = getTexts(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: ComplianceCheck[] }>({});
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  
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
  }, [permits]);

  const validateCompliance = () => {
    const alerts: string[] = [];
    const checks: { [key: string]: ComplianceCheck[] } = {};

    permits.forEach((permit: Permit) => {
      if (permit.selected && permit.formData) {
        const permitChecks: ComplianceCheck[] = [];

        // Validation espace clos
        if (permit.id === 'confined-space-entry-2025') {
          const o2Level = parseFloat(permit.formData.oxygen_level);
          const gasLevel = parseFloat(permit.formData.combustible_gas_level);
          const coLevel = parseFloat(permit.formData.carbon_monoxide_level);
          const h2sLevel = parseFloat(permit.formData.hydrogen_sulfide_level);

          if (o2Level < 19.5 || o2Level > 23.5) {
            alerts.push(`CRITIQUE: Niveau O2 non conforme (${o2Level}%) - ARRÊT TRAVAUX REQUIS`);
            permitChecks.push({
              requirement: 'Oxygène 19.5-23.5%',
              status: 'non-compliant',
              details: `Niveau actuel: ${o2Level}%`,
              reference: 'RSST Art. 302'
            });
          } else {
            permitChecks.push({
              requirement: 'Oxygène 19.5-23.5%',
              status: 'compliant',
              details: `Niveau conforme: ${o2Level}%`,
              reference: 'RSST Art. 302'
            });
          }

          if (gasLevel >= 10) {
            alerts.push(`CRITIQUE: Gaz combustibles trop élevés (${gasLevel}% LIE) - ÉVACUATION IMMÉDIATE`);
            permitChecks.push({
              requirement: 'Gaz combustibles < 10% LIE',
              status: 'non-compliant',
              details: `Niveau critique: ${gasLevel}%`,
              reference: 'RSST Art. 302'
            });
          }

          if (!permit.formData.worker_age_verification) {
            alerts.push('CRITIQUE: Vérification âge 18+ manquante - Obligation légale RSST Art. 298');
            permitChecks.push({
              requirement: 'Âge minimum 18 ans',
              status: 'non-compliant',
              details: 'Vérification non effectuée',
              reference: 'RSST Art. 298 modifié 2023'
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
          }

          if (!permit.formData.shift_reinspection) {
            alerts.push('REQUIS: Réinspection par quart obligatoire selon NFPA 51B-2019');
          }
        }

        // Validation excavation
        if (permit.id === 'excavation-permit-municipal-2024') {
          const depth = parseFloat(permit.formData.excavation_depth_calc || '0');
          const distance = parseFloat(permit.formData.domain_public_distance || '0');
          
          const requiresPermit = (depth < 2 && distance < 2) || (depth >= 2 && distance < depth * 2);
          
          if (requiresPermit && !permit.formData.permit_required_auto) {
            alerts.push('REQUIS: Permis excavation obligatoire selon calculs profondeur/distance');
          }

          if (!permit.formData.info_excavation_request) {
            alerts.push('CRITIQUE: Info-Excavation obligatoire - Risque d\'accident grave');
            permitChecks.push({
              requirement: 'Info-Excavation complétée',
              status: 'non-compliant',
              details: 'Demande non effectuée',
              reference: 'Loi fédérale'
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
        const requiresPermit = (depth < 2 && distance < 2) || (depth >= 2 && distance < depth * 2);
        const insuranceAmount = depth <= 4.5 ? 1000000 : depth > 4.5 ? 2000000 : 5000000;
        
        return {
          ...permit,
          formData: {
            ...permit.formData,
            permit_required_auto: requiresPermit,
            insurance_amount_calc: insuranceAmount,
            surface_guarantee_deposit: Math.round(depth * distance * 73), // Tarif été
            underground_guarantee_deposit: Math.round(depth * 500) // Estimation
          }
        };
      }
      return permit;
    });
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
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

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map((permit: Permit) => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
    const selectedList = updatedPermits.filter((p: Permit) => p.selected);
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter((p: Permit) => p.priority === 'critical').length,
        pending: selectedList.filter((p: Permit) => p.status === 'pending').length
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
            
            if (depth > 0 && distance >= 0) {
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

  return { permits, filteredPermits, stats, criticalAlerts, complianceChecks, expandedForms, handlePermitToggle, handleFormFieldChange, toggleFormExpansion, validateCompliance, getCategoryIcon, getPriorityColor, getStatusColor, getComplianceColor, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, selectedProvince, setSelectedProvince, categories, provinces, t };
};

export default Step4Permits;
"use client";
import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, Clock, Download, Eye, Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase, Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat, Camera, Save, X, ChevronLeft, ChevronRight, Upload, UserPlus, UserMinus, Grid, List } from 'lucide-react';

// Section 3B - Rendu Final avec Multi-travailleurs et Carrousel
const Step4PermitsSection3B = () => {
  const [selectedPermit, setSelectedPermit] = useState('confined_space');
  const [formData, setFormData] = useState({});
  const [workers, setWorkers] = useState([{ id: 1, name: '', age: '', over18: false, certification: '' }]);
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' ou 'grid'
  const [language, setLanguage] = useState('fr');

  // Gestion des travailleurs
  const addWorker = () => {
    const newWorker = {
      id: workers.length + 1,
      name: '',
      age: '',
      over18: false,
      certification: ''
    };
    setWorkers([...workers, newWorker]);
  };

  const removeWorker = (id) => {
    if (workers.length > 1) {
      setWorkers(workers.filter(w => w.id !== id));
    }
  };

  const updateWorker = (id, field, value) => {
    setWorkers(workers.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  // Gestion des photos
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          id: photos.length + 1,
          url: event.target.result,
          name: file.name,
          timestamp: new Date().toISOString()
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id) => {
    setPhotos(photos.filter(p => p.id !== id));
    if (currentPhotoIndex >= photos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, photos.length - 2));
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Données des permis
  const permits = {
    confined_space: {
      title: { fr: "Permis Espace Clos", en: "Confined Space Permit" },
      icon: Shield,
      color: "red",
      fields: [
        { id: 'location', type: 'text', label: { fr: 'Lieu de travail', en: 'Work Location' }, required: true },
        { id: 'entry_date', type: 'date', label: { fr: 'Date d\'entrée', en: 'Entry Date' }, required: true },
        { id: 'entry_time', type: 'time', label: { fr: 'Heure d\'entrée', en: 'Entry Time' }, required: true },
        { id: 'exit_time', type: 'time', label: { fr: 'Heure de sortie prévue', en: 'Planned Exit Time' }, required: true },
        { id: 'o2_level', type: 'gas_meter', label: { fr: 'Niveau O2 (%)', en: 'O2 Level (%)' }, required: true, min: 19.5, max: 23.5 },
        { id: 'co_level', type: 'gas_meter', label: { fr: 'Niveau CO (ppm)', en: 'CO Level (ppm)' }, required: true, max: 35 },
        { id: 'h2s_level', type: 'gas_meter', label: { fr: 'Niveau H2S (ppm)', en: 'H2S Level (ppm)' }, required: true, max: 10 },
        { id: 'lie_level', type: 'gas_meter', label: { fr: 'Niveau LIE (%)', en: 'LEL Level (%)' }, required: true, max: 10 },
        { id: 'rescue_plan', type: 'textarea', label: { fr: 'Plan de sauvetage', en: 'Rescue Plan' }, required: true },
        { id: 'attendant', type: 'text', label: { fr: 'Surveillant externe', en: 'External Attendant' }, required: true },
        { id: 'communication', type: 'select', label: { fr: 'Moyen de communication', en: 'Communication Method' }, options: [
          { value: 'radio', label: { fr: 'Radio', en: 'Radio' } },
          { value: 'phone', label: { fr: 'Téléphone', en: 'Phone' } },
          { value: 'visual', label: { fr: 'Signaux visuels', en: 'Visual Signals' } }
        ], required: true }
      ]
    },
    hot_work: {
      title: { fr: "Permis Travail à Chaud", en: "Hot Work Permit" },
      icon: Zap,
      color: "orange",
      fields: [
        { id: 'work_type', type: 'select', label: { fr: 'Type de travail', en: 'Work Type' }, options: [
          { value: 'welding', label: { fr: 'Soudage', en: 'Welding' } },
          { value: 'cutting', label: { fr: 'Découpage', en: 'Cutting' } },
          { value: 'grinding', label: { fr: 'Meulage', en: 'Grinding' } }
        ], required: true },
        { id: 'location', type: 'text', label: { fr: 'Lieu de travail', en: 'Work Location' }, required: true },
        { id: 'start_date', type: 'date', label: { fr: 'Date de début', en: 'Start Date' }, required: true },
        { id: 'start_time', type: 'time', label: { fr: 'Heure de début', en: 'Start Time' }, required: true },
        { id: 'end_time', type: 'time', label: { fr: 'Heure de fin', en: 'End Time' }, required: true },
        { id: 'fire_extinguisher', type: 'text', label: { fr: 'Extincteur disponible', en: 'Fire Extinguisher Available' }, required: true },
        { id: 'fire_watch', type: 'text', label: { fr: 'Surveillant incendie', en: 'Fire Watch' }, required: true },
        { id: 'watch_duration', type: 'number', label: { fr: 'Durée surveillance (min)', en: 'Watch Duration (min)' }, required: true, min: 60 },
        { id: 'combustible_removal', type: 'checkbox', label: { fr: 'Matières combustibles retirées', en: 'Combustible Materials Removed' }, required: true }
      ]
    },
    excavation: {
      title: { fr: "Permis d'Excavation", en: "Excavation Permit" },
      icon: HardHat,
      color: "yellow",
      fields: [
        { id: 'location', type: 'text', label: { fr: 'Lieu d\'excavation', en: 'Excavation Location' }, required: true },
        { id: 'depth', type: 'number', label: { fr: 'Profondeur prévue (m)', en: 'Planned Depth (m)' }, required: true },
        { id: 'width', type: 'number', label: { fr: 'Largeur (m)', en: 'Width (m)' }, required: true },
        { id: 'length', type: 'number', label: { fr: 'Longueur (m)', en: 'Length (m)' }, required: true },
        { id: 'start_date', type: 'date', label: { fr: 'Date de début', en: 'Start Date' }, required: true },
        { id: 'end_date', type: 'date', label: { fr: 'Date de fin', en: 'End Date' }, required: true },
        { id: 'info_excavation', type: 'checkbox', label: { fr: 'Info-Excavation contacté', en: 'Dig Safe Contacted' }, required: true },
        { id: 'utilities_marked', type: 'checkbox', label: { fr: 'Services publics marqués', en: 'Utilities Marked' }, required: true },
        { id: 'shoring_required', type: 'checkbox', label: { fr: 'Étaiement requis', en: 'Shoring Required' } },
        { id: 'insurance_amount', type: 'calculated', label: { fr: 'Assurance requise', en: 'Required Insurance' }, 
          calculation: (depth) => depth > 3 ? '2M$' : '1M$' }
      ]
    }
  };

  const currentPermit = permits[selectedPermit];

  const renderField = (field) => {
    const label = field.label[language];
    const fieldId = `${selectedPermit}_${field.id}`;
    
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'time':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 select-none">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required={field.required}
              min={field.min}
              max={field.max}
              value={formData[fieldId] || ''}
              onChange={(e) => setFormData({...formData, [fieldId]: e.target.value})}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 select-none">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={fieldId}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              required={field.required}
              value={formData[fieldId] || ''}
              onChange={(e) => setFormData({...formData, [fieldId]: e.target.value})}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 select-none">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={fieldId}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required={field.required}
              value={formData[fieldId] || ''}
              onChange={(e) => setFormData({...formData, [fieldId]: e.target.value})}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Sélectionner...</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label[language]}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={fieldId}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required={field.required}
              checked={formData[fieldId] || false}
              onChange={(e) => setFormData({...formData, [fieldId]: e.target.checked})}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 select-none">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );

      case 'gas_meter':
        const value = parseFloat(formData[fieldId]) || 0;
        const isInRange = value >= (field.min || 0) && value <= (field.max || 100);
        
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 select-none">
              {label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="number"
                id={fieldId}
                step="0.1"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-blue-500 transition-all duration-200 ${
                  isInRange ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
                required={field.required}
                value={formData[fieldId] || ''}
                onChange={(e) => setFormData({...formData, [fieldId]: e.target.value})}
                onFocus={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-bold ${
                isInRange ? 'text-green-600' : 'text-red-600'
              }`}>
                {isInRange ? '✓' : '⚠️'}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Range: {field.min || 0} - {field.max || 100}
            </div>
          </div>
        );

      case 'calculated':
        const calculatedValue = field.calculation ? field.calculation(formData[`${selectedPermit}_depth`]) : '';
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 select-none">
              {label}
            </label>
            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 font-mono">
              {calculatedValue}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Step4Permits - Conforme 2024-2025
          </h1>
          <p className="text-gray-600">Système de permis avec conformité légale garantie</p>
        </div>

        {/* Sélection du permis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(permits).map(([key, permit]) => {
            const Icon = permit.icon;
            return (
              <div
                key={key}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedPermit === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl'
                    : 'bg-white hover:bg-gray-50 shadow-lg'
                }`}
                onClick={() => setSelectedPermit(key)}
              >
                <div className="flex items-center space-x-4">
                  <Icon className="w-8 h-8" />
                  <div>
                    <h3 className="text-lg font-semibold">{permit.title[language]}</h3>
                    <p className={`text-sm ${selectedPermit === key ? 'text-blue-100' : 'text-gray-500'}`}>
                      Conforme 2024-2025
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <currentPermit.icon className="w-6 h-6 mr-3" />
              {currentPermit.title[language]}
            </h2>

            <div className="space-y-6">
              {currentPermit.fields.map(renderField)}
            </div>
          </div>

          {/* Section Travailleurs */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  Travailleurs Autorisés
                </h3>
                <button
                  type="button"
                  onClick={addWorker}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="space-y-4">
                {workers.map((worker, index) => (
                  <div key={worker.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-700">Travailleur #{index + 1}</h4>
                      {workers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWorker(worker.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                        <input
                          type="text"
                          value={worker.name}
                          onChange={(e) => updateWorker(worker.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nom du travailleur"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                        <input
                          type="number"
                          value={worker.age}
                          onChange={(e) => updateWorker(worker.id, 'age', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Âge"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`worker-${worker.id}-18plus`}
                            checked={worker.over18}
                            onChange={(e) => updateWorker(worker.id, 'over18', e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`worker-${worker.id}-18plus`} className="text-sm font-medium text-gray-700">
                            <span className="text-red-500">*</span> Je certifie que ce travailleur a 18 ans ou plus (OBLIGATOIRE - Art. 298 RSST)
                          </label>
                        </div>
                        {worker.age && parseInt(worker.age) < 18 && (
                          <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                              ⚠️ VIOLATION LÉGALE: Travailleur mineur détecté. Accès en espace clos interdit par l'Article 298 RSST.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                        <select
                          value={worker.certification}
                          onChange={(e) => updateWorker(worker.id, 'certification', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner certification</option>
                          <option value="basic">Formation de base</option>
                          <option value="advanced">Formation avancée</option>
                          <option value="supervisor">Superviseur</option>
                          <option value="rescue">Sauveteur</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Photos */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Camera className="w-6 h-6 mr-3" />
                  Photos du Site ({photos.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {viewMode === 'carousel' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                  <label className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Ajouter Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {photos.length > 0 ? (
                viewMode === 'carousel' ? (
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={photos[currentPhotoIndex]?.url}
                        alt={`Photo ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(photos[currentPhotoIndex]?.id)}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={prevPhoto}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={photos.length <= 1}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex space-x-2">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentPhotoIndex ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={nextPhoto}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={photos.length <= 1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-center mt-2">
                      <p className="text-sm text-gray-600">
                        {photos[currentPhotoIndex]?.name} • {new Date(photos[currentPhotoIndex]?.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Aucune photo ajoutée</p>
                  <p className="text-sm">Cliquez sur "Ajouter Photos" pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            type="button"
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="w-5 h-5" />
            <span>Sauvegarder le Permis</span>
          </button>
          
          <button
            type="button"
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4PermitsSection3B;
