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
    const compliantCount = selectedPermits.filter(p => {
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

  // =================== COMPOSANT FORMULAIRE AVEC VALIDATION ===================
  const PermitForm = ({ permit }: { permit: Permit }) => {
    const isExpanded = expandedForms[permit.id];
    if (!isExpanded) return null;

    const fieldsBySection = permit.formFields?.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {} as { [key: string]: FormField[] }) || {};

    const permitChecks = complianceChecks[permit.id] || [];
    const hasViolations = permitChecks.some(check => check.status === 'non-compliant');

    const renderField = (field: FormField) => {
      const value = permit.formData?.[field.id] || '';
      const hasError = field.validation?.critical && !value;
      
      // Rendu des champs selon type avec validation
      switch (field.type) {
        case 'gas_meter':
          const numValue = parseFloat(value) || 0;
          const isCompliant = field.validation ? 
            numValue >= (field.validation.min || 0) && 
            numValue <= (field.validation.max || 100) : true;
          
          return (
            <div className="gas-meter-container">
              <div className="gas-meter-display">
                <input
                  type="number"
                  step="0.1"
                  id={field.id}
                  value={value}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFormFieldChange(permit.id, field.id, e.target.value);
                  }}
                  className={`gas-meter-input ${!isCompliant ? 'critical-violation' : 'compliant'}`}
                  placeholder={field.placeholder}
                  required={field.required}
                />
                <div className={`gas-status ${!isCompliant ? 'non-compliant' : 'compliant'}`}>
                  {!isCompliant ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span>{!isCompliant ? t.gasMeasurements.nonCompliant : t.gasMeasurements.compliant}</span>
                </div>
              </div>
              {!isCompliant && field.validation?.message && (
                <div className="critical-alert">
                  <AlertCircle size={14} />
                  {field.validation.message}
                </div>
              )}
            </div>
          );

        case 'calculation':
          const calculatedValue = field.calculation?.autoCalculate ? 'AUTO' : value;
          return (
            <div className="calculation-field">
              <div className="calculation-display">
                <span className="calculation-label">{calculatedValue}</span>
                <button
                  type="button"
                  className="calculate-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger calculation
                    if (field.calculation?.autoCalculate) {
                      // Auto-calculation logic here
                    }
                  }}
                >
                  {t.actions.calculate}
                </button>
              </div>
            </div>
          );

        case 'compliance_check':
          const isChecked = !!value;
          return (
            <div className="compliance-check">
              <label className="compliance-label">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFormFieldChange(permit.id, field.id, e.target.checked);
                  }}
                  required={field.required}
                />
                <span className={`compliance-text ${isChecked ? 'compliant' : 'pending'}`}>
                  {field.label}
                </span>
                {field.complianceRef && (
                  <span className="compliance-ref">({field.complianceRef})</span>
                )}
              </label>
            </div>
          );

        case 'alert_indicator':
          return (
            <div className={`alert-indicator ${field.alert?.level || 'info'}`}>
              <AlertTriangle size={16} />
              <span>{field.alert?.message || field.label}</span>
            </div>
          );

        // Types de champs standards (text, number, etc.)
        default:
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              placeholder={field.placeholder}
              required={field.required}
              className={`form-input ${hasError ? 'error' : ''}`}
            />
          );
      }
    };

    return (
      <div className="permit-form">
        <div className="form-header">
          <div className="form-title-section">
            <h3>{permit.name}</h3>
            <div className="compliance-badges">
              <span className={`compliance-badge ${permit.complianceLevel}`}>
                {(t.complianceLevels as any)[permit.complianceLevel]}
              </span>
              <span className="last-updated">
                Mis à jour: {permit.lastUpdated}
              </span>
            </div>
          </div>
          <div className="form-actions">
            <button className="form-action-btn validate" onClick={() => validateCompliance()}>
              <Shield size={16} />
              {t.actions.validate}
            </button>
            <button className="form-action-btn save">
              <Save size={16} />
              {t.actions.save}
            </button>
            <button className="form-action-btn submit">
              <Mail size={16} />
              {t.actions.submit}
            </button>
          </div>
        </div>

        {/* Alertes critiques */}
        {hasViolations && (
          <div className="critical-violations-panel">
            <div className="violations-header">
              <AlertTriangle size={20} />
              <span>{t.alerts.critical}</span>
            </div>
            {permitChecks.filter(check => check.status === 'non-compliant').map((check, index) => (
              <div key={index} className="violation-item">
                <span className="violation-requirement">{check.requirement}</span>
                <span className="violation-details">{check.details}</span>
                <span className="violation-reference">{check.reference}</span>
              </div>
            ))}
          </div>
        )}

        {/* Vérifications de conformité */}
        {permitChecks.length > 0 && (
          <div className="compliance-panel">
            <h4>📋 Vérifications de conformité</h4>
            <div className="compliance-grid">
              {permitChecks.map((check, index) => (
                <div key={index} className={`compliance-item ${check.status}`}>
                  <div className="compliance-status">
                    {check.status === 'compliant' ? 
                      <CheckCircle size={16} /> : 
                      <AlertTriangle size={16} />
                    }
                  </div>
                  <div className="compliance-details">
                    <span className="compliance-requirement">{check.requirement}</span>
                    <span className="compliance-reference">{check.reference}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-content">
          {Object.entries(fieldsBySection).map(([sectionName, fields]: [string, FormField[]]) => (
            <div key={sectionName} className="form-section-group">
              <h4 className="form-section-title">
                {(t.sections as any)[sectionName] || sectionName}
              </h4>
              <div className="form-fields">
                {fields.map((field: FormField) => (
                  <div key={field.id} className="form-field">
                    <label className="form-label" htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                      {field.validation?.legalRequirement && (
                        <span className="legal-requirement">⚖️ LÉGAL</span>
                      )}
                      {field.validation?.critical && (
                        <span className="critical-requirement">🚨 CRITIQUE</span>
                      )}
                    </label>
                    {renderField(field)}
                    {field.validation?.message && (
                      <div className="field-help">{field.validation.message}</div>
                    )}
                    {field.complianceRef && (
                      <div className="compliance-reference">
                        📖 Réf: {field.complianceRef}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; }
          .permits-header { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          
          .critical-alerts { background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .critical-alerts h3 { color: #ef4444; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
          .alert-item { background: rgba(239, 68, 68, 0.2); padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; color: #fee2e2; font-size: 14px; }
          
          .permits-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-item.compliant { border: 2px solid #22c55e; }
          .stat-item.non-compliant { border: 2px solid #ef4444; }
          
          .permit-card.critical::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 16px 0 0 16px; }
          .compliance-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
          .compliance-badge.critical { background: #dc2626; color: white; }
          .compliance-badge.enhanced { background: #059669; color: white; }
          .compliance-badge.standard { background: #2563eb; color: white; }
          
          .gas-meter-container { display: flex; flex-direction: column; gap: 8px; }
          .gas-meter-display { display: flex; align-items: center; gap: 12px; }
          .gas-meter-input { flex: 1; }
          .gas-meter-input.critical-violation { border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.1); }
          .gas-meter-input.compliant { border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.1); }
          .gas-status { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
          .gas-status.non-compliant { color: #ef4444; }
          .gas-status.compliant { color: #22c55e; }
          
          .critical-alert { background: rgba(239, 68, 68, 0.2); color: #fee2e2; padding: 8px; border-radius: 4px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
          
          .compliance-check { margin: 8px 0; }
          .compliance-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
          .compliance-text.compliant { color: #22c55e; }
          .compliance-text.pending { color: #eab308; }
          .compliance-ref { font-size: 10px; color: #94a3b8; }
          
          .calculation-field { background: rgba(30, 41, 59, 0.6); border-radius: 8px; padding: 12px; }
          .calculation-display { display: flex; justify-content: space-between; align-items: center; }
          .calculation-label { font-family: monospace; color: #22c55e; font-weight: 600; }
          .calculate-btn { padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 10px; }
          
          .critical-violations-panel { background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          .violations-header { display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: 700; margin-bottom: 12px; }
          .violation-item { background: rgba(239, 68, 68, 0.2); padding: 8px; border-radius: 4px; margin-bottom: 8px; }
          .violation-requirement { display: block; font-weight: 600; color: #fee2e2; }
          .violation-details { display: block; font-size: 12px; color: #fca5a5; }
          .violation-reference { display: block; font-size: 10px; color: #f87171; }
          
          .compliance-panel { background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          .compliance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 8px; }
          .compliance-item { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; }
          .compliance-item.compliant { background: rgba(34, 197, 94, 0.2); }
          .compliance-item.non-compliant { background: rgba(239, 68, 68, 0.2); }
          .compliance-status { color: #22c55e; }
          .compliance-item.non-compliant .compliance-status { color: #ef4444; }
          .compliance-requirement { font-size: 12px; font-weight: 600; }
          .compliance-reference { font-size: 10px; color: #94a3b8; }
          
          .legal-requirement { background: #059669; color: white; padding: 1px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px; }
          .critical-requirement { background: #dc2626; color: white; padding: 1px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px; }
          .compliance-reference { font-size: 10px; color: #3b82f6; margin-top: 2px; }
          
          .form-title-section { display: flex; flex-direction: column; gap: 8px; }
          .compliance-badges { display: flex; gap: 8px; align-items: center; }
          .last-updated { font-size: 10px; color: #94a3b8; }
          
          .form-action-btn.validate { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
          
          .alert-indicator { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; font-size: 12px; }
          .alert-indicator.critical { background: rgba(239, 68, 68, 0.2); color: #fee2e2; }
          .alert-indicator.warning { background: rgba(245, 158, 11, 0.2); color: #fde68a; }
          .alert-indicator.info { background: rgba(59, 130, 246, 0.2); color: #dbeafe; }
          
          @media (max-width: 768px) {
            .permits-stats { grid-template-columns: repeat(2, 1fr); }
            .compliance-grid { grid-template-columns: 1fr; }
            .form-title-section { align-items: flex-start; }
            .compliance-badges { flex-wrap: wrap; }
          }
        `
      }} />

      <div className="step4-container">
        {/* Alertes critiques */}
        {criticalAlerts.length > 0 && (
          <div className="critical-alerts">
            <h3>
              <AlertTriangle size={20} />
              {t.alerts.critical}
            </h3>
            {criticalAlerts.map((alert, index) => (
              <div key={index} className="alert-item">
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* En-tête avec résumé de conformité */}
        <div className="permits-header">
          <div className="permits-title">
            <FileText size={24} />
            📋 {t.title}
          </div>
          <p style={{ color: '#3b82f6', margin: '0 0 8px', fontSize: '14px' }}>
            {t.subtitle}
          </p>
          
          <div className="permits-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.totalPermits}</div>
              <div className="stat-label">{t.stats.available}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">{t.stats.selected}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">{t.stats.critical}</div>
            </div>
            <div className={`stat-item ${stats.compliant === stats.selected && stats.selected > 0 ? 'compliant' : stats.nonCompliant > 0 ? 'non-compliant' : ''}`}>
              <div className="stat-value">{stats.compliant}/{stats.selected}</div>
              <div className="stat-label">{t.stats.compliant}</div>
            </div>
          </div>
        </div>

        {/* Section de recherche et filtres */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((category: any) => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {(t.categories as any)[category] || category}
                </option>
              ))}
            </select>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t.allProvinces}</option>
              {provinces.map((province: string) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des permis avec conformité */}
        <div className="permits-grid">
          {filteredPermits.map((permit: Permit) => {
            const isSelected = permit.selected;
            const isFormExpanded = expandedForms[permit.id];
            const permitChecks = complianceChecks[permit.id] || [];
            const hasViolations = permitChecks.some(check => check.status === 'non-compliant');
            
            return (
              <div 
                key={permit.id} 
                className={`permit-card ${isSelected ? 'selected' : ''} ${permit.priority} ${hasViolations ? 'non-compliant' : ''}`}
              >
                {/* Header avec sélection */}
                <div className="permit-header" onClick={() => handlePermitToggle(permit.id)}>
                  <div className="permit-icon">{getCategoryIcon(permit.category)}</div>
                  <div className="permit-content">
                    <h3 className="permit-name">{permit.name}</h3>
                    <div className="permit-category">{(t.categories as any)[permit.category] || permit.category}</div>
                    <div className="permit-description">{permit.description}</div>
                    <div className="permit-authority">{permit.authority}</div>
                    <div className="compliance-info">
                      <span 
                        className="compliance-badge" 
                        style={{ 
                          backgroundColor: `${getComplianceColor(permit.complianceLevel)}20`, 
                          color: getComplianceColor(permit.complianceLevel) 
                        }}
                      >
                        {(t.complianceLevels as any)[permit.complianceLevel]}
                      </span>
                      <span className="last-updated-small">
                        {permit.lastUpdated}
                      </span>
                    </div>
                  </div>
                  <div className={`permit-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Métadonnées avec conformité */}
                <div className="permit-meta">
                  <div className="meta-item">
                    <span className="priority-badge" style={{ backgroundColor: `${getPriorityColor(permit.priority)}20`, color: getPriorityColor(permit.priority) }}>
                      {(t.priorities as any)[permit.priority]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(permit.status)}20`, color: getStatusColor(permit.status) }}>
                      {(t.statuses as any)[permit.status]}
                    </span>
                  </div>
                  {hasViolations && (
                    <div className="meta-item">
                      <span className="violation-badge" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
                        ⚠️ Non conforme
                      </span>
                    </div>
                  )}
                  <div className="meta-item">
                    <Clock size={12} />
                    {permit.processingTime}
                  </div>
                </div>

                {/* Actions du permis */}
                {isSelected && (
                  <div className="permit-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => toggleFormExpansion(permit.id)}
                    >
                      <Edit size={14} />
                      {isFormExpanded ? t.actions.close : t.actions.fill}
                      {isFormExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => validateCompliance()}
                    >
                      <Shield size={14} />
                      {t.actions.validate}
                    </button>
                    <button className="action-btn secondary">
                      <Download size={14} />
                      {t.actions.download}
                    </button>
                  </div>
                )}

                {/* Formulaire du permis avec conformité */}
                {isSelected && <PermitForm permit={permit} />}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#94a3b8', 
            background: 'rgba(30, 41, 59, 0.6)', 
            borderRadius: '16px', 
            border: '1px solid rgba(100, 116, 139, 0.3)' 
          }}>
            <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>{t.messages.noResults}</h3>
            <p style={{ margin: 0 }}>{t.messages.modifySearch}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;
