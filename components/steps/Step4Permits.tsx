import React, { useState, useMemo } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail
} from 'lucide-react';

// =================== INTERFACES ===================
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
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature';
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
  };
}

// =================== BASE DE DONNÉES PERMIS RÉELS ===================
const realPermitsDatabase: Permit[] = [
  // 1. PERMIS ESPACE CLOS - Basé sur ASP Construction
  {
    id: 'confined-space-entry',
    name: 'Fiche de Contrôle en Espace Clos',
    category: 'Sécurité',
    description: 'Permis d\'entrée obligatoire pour tous travaux en espace clos selon RSST et CSTC',
    authority: 'Employeur / ASP Construction',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: 'Maximum 8 heures ou fin des travaux',
    cost: 'Inclus dans formation',
    processingTime: 'Avant chaque entrée',
    renewalRequired: true,
    renewalPeriod: 'Quotidien',
    legislation: 'RSST Art. 297-312, CSTC Section 3.21',
    contactInfo: {
      phone: '514-355-6190',
      website: 'https://www.asp-construction.org'
    },
    selected: false,
    status: 'pending',
    formFields: [
      // Section Identification
      { id: 'space_identification', type: 'text', label: 'Identification de l\'espace clos', required: true, section: 'identification', placeholder: 'Ex: Réservoir A-12, Regard municipal...' },
      { id: 'project_name', type: 'text', label: 'Nom du projet', required: true, section: 'identification' },
      { id: 'location', type: 'text', label: 'Localisation exacte', required: true, section: 'identification' },
      { id: 'permit_date', type: 'date', label: 'Date du permis', required: true, section: 'identification' },
      { id: 'permit_time', type: 'time', label: 'Heure d\'émission', required: true, section: 'identification' },
      
      // Section Entrées et Sorties
      { id: 'entry_mandatory', type: 'radio', label: 'L\'entrée est-elle obligatoire ?', required: true, section: 'access', options: ['Oui', 'Non'] },
      { id: 'entry_alternatives', type: 'textarea', label: 'Si non, options alternatives', required: false, section: 'access', placeholder: 'Décrire les alternatives...' },
      { id: 'entry_frequency', type: 'text', label: 'Fréquence des entrées', required: false, section: 'access' },
      { id: 'access_number', type: 'number', label: 'Nombre d\'accès', required: true, section: 'access', validation: { min: 1 } },
      { id: 'access_dimensions', type: 'text', label: 'Dimensions des accès', required: true, section: 'access', placeholder: 'Ex: 60cm x 40cm' },
      { id: 'interior_dimensions', type: 'text', label: 'Dimensions intérieures', required: true, section: 'access' },
      { id: 'divisions_number', type: 'number', label: 'Nombre de divisions', required: false, section: 'access' },
      { id: 'access_means', type: 'checkbox', label: 'Moyens d\'accès', required: true, section: 'access', options: ['Échelons', 'Échelle fixe', 'Échelle portative', 'Autre'] },
      { id: 'signage_required', type: 'radio', label: 'Signalisation requise ?', required: true, section: 'access', options: ['Oui', 'Non'] },
      { id: 'access_control', type: 'radio', label: 'Mesures prises pour interdire l\'entrée non autorisée ?', required: true, section: 'access', options: ['Oui', 'Non'] },
      
      // Section Atmosphère
      { id: 'space_contents', type: 'textarea', label: 'Contenu de l\'espace clos', required: true, section: 'atmosphere', placeholder: 'Décrire le contenu, vérifier SDS...' },
      { id: 'atmosphere_types', type: 'checkbox', label: 'Types d\'atmosphère', required: true, section: 'atmosphere', options: ['Inflammable/combustible LIE ≥ 5%', 'Oxygène ≤ 19,5%', 'Oxygène ≥ 23%', 'Gaz toxique', 'Poussières', 'Irritante'] },
      
      // Section Signatures
      { id: 'authorized_workers', type: 'textarea', label: 'Noms des travailleurs autorisés', required: true, section: 'signatures', placeholder: 'Un travailleur par ligne...' },
      { id: 'supervisor_name', type: 'text', label: 'Nom du surveillant', required: true, section: 'signatures' },
      { id: 'qualified_person', type: 'text', label: 'Nom de la personne qualifiée', required: true, section: 'signatures' },
      { id: 'supervisor_signature', type: 'signature', label: 'Signature du surveillant', required: true, section: 'signatures' },
      { id: 'qualified_signature', type: 'signature', label: 'Signature de la personne qualifiée', required: true, section: 'signatures' }
    ]
  },

  // 2. PERMIS TRAVAIL À CHAUD - Basé sur NFPA 51B et CNESST
  {
    id: 'hot-work-permit',
    name: 'Permis de Travail à Chaud',
    category: 'Sécurité',
    description: 'Autorisation pour soudage, découpage, meulage et travaux générant étincelles selon NFPA 51B',
    authority: 'Service incendie / Employeur',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '24 heures maximum',
    cost: 'Variable selon municipalité',
    processingTime: 'Immédiat à 24h',
    renewalRequired: true,
    renewalPeriod: 'Quotidien',
    legislation: 'NFPA 51B-2019, Code sécurité incendie, RSST',
    contactInfo: {
      phone: 'Service incendie local',
      website: 'Municipal'
    },
    selected: false,
    status: 'pending',
    formFields: [
      // Section Identification
      { id: 'permit_number', type: 'text', label: 'Numéro de permis', required: true, section: 'identification' },
      { id: 'work_location', type: 'text', label: 'Lieu des travaux', required: true, section: 'identification' },
      { id: 'work_date', type: 'date', label: 'Date des travaux', required: true, section: 'identification' },
      { id: 'start_time', type: 'time', label: 'Heure de début', required: true, section: 'identification' },
      { id: 'end_time', type: 'time', label: 'Heure de fin', required: true, section: 'identification' },
      { id: 'company_name', type: 'text', label: 'Nom de l\'entreprise', required: true, section: 'identification' },
      
      // Section Type de travaux
      { id: 'work_type', type: 'checkbox', label: 'Type de travail à chaud', required: true, section: 'work_type', options: ['Soudage à l\'arc', 'Soudage au gaz', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage', 'Perçage', 'Brasage', 'Autre'] },
      { id: 'work_description', type: 'textarea', label: 'Description détaillée des travaux', required: true, section: 'work_type' },
      
      // Section Précautions
      { id: 'fire_watch', type: 'radio', label: 'Surveillance incendie assignée', required: true, section: 'precautions', options: ['Oui', 'Non'] },
      { id: 'fire_watch_name', type: 'text', label: 'Nom du surveillant incendie', required: false, section: 'precautions' },
      { id: 'combustibles_removed', type: 'radio', label: 'Matières combustibles éloignées (11m minimum)', required: true, section: 'precautions', options: ['Oui', 'Non', 'Protégées'] },
      
      // Section Signatures
      { id: 'applicant_signature', type: 'signature', label: 'Signature du demandeur', required: true, section: 'signatures' },
      { id: 'supervisor_signature', type: 'signature', label: 'Signature du superviseur', required: true, section: 'signatures' },
      { id: 'permit_expiry', type: 'date', label: 'Date d\'expiration du permis', required: true, section: 'signatures' }
    ]
  },

  // 3. PERMIS D'EXCAVATION - Basé sur Ville de Montréal
  {
    id: 'excavation-permit',
    name: 'Permis d\'Excavation',
    category: 'Construction',
    description: 'Autorisation pour travaux d\'excavation près du domaine public selon règlements municipaux',
    authority: 'Municipal',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: 'Durée des travaux',
    cost: '200$ - 2000$ selon ampleur',
    processingTime: '5-15 jours ouvrables',
    renewalRequired: false,
    legislation: 'Règlements municipaux, Code de construction',
    contactInfo: {
      website: 'Bureau des permis municipal'
    },
    selected: false,
    status: 'pending',
    formFields: [
      // Section Demandeur
      { id: 'applicant_name', type: 'text', label: 'Nom du demandeur', required: true, section: 'applicant' },
      { id: 'applicant_address', type: 'textarea', label: 'Adresse du demandeur', required: true, section: 'applicant' },
      { id: 'applicant_phone', type: 'text', label: 'Téléphone', required: true, section: 'applicant' },
      { id: 'applicant_email', type: 'text', label: 'Courriel', required: true, section: 'applicant' },
      { id: 'contractor_name', type: 'text', label: 'Nom de l\'entrepreneur', required: true, section: 'applicant' },
      { id: 'contractor_license', type: 'text', label: 'Numéro de licence RBQ', required: true, section: 'applicant' },
      
      // Section Projet
      { id: 'work_address', type: 'textarea', label: 'Adresse des travaux', required: true, section: 'project' },
      { id: 'lot_number', type: 'text', label: 'Numéro de lot', required: false, section: 'project' },
      { id: 'project_description', type: 'textarea', label: 'Description du projet', required: true, section: 'project' },
      { id: 'work_start_date', type: 'date', label: 'Date de début prévue', required: true, section: 'project' },
      { id: 'work_duration', type: 'number', label: 'Durée estimée (jours)', required: true, section: 'project' },
      
      // Section Excavation
      { id: 'excavation_depth', type: 'number', label: 'Profondeur d\'excavation (m)', required: true, section: 'excavation', validation: { min: 0 } },
      { id: 'excavation_length', type: 'number', label: 'Longueur (m)', required: true, section: 'excavation', validation: { min: 0 } },
      { id: 'excavation_width', type: 'number', label: 'Largeur (m)', required: true, section: 'excavation', validation: { min: 0 } },
      { id: 'soil_type', type: 'select', label: 'Type de sol', required: true, section: 'excavation', options: ['Argile', 'Sable', 'Gravier', 'Roc', 'Remblai', 'Mixte'] },
      
      // Section Sécurité
      { id: 'safety_plan', type: 'radio', label: 'Plan de sécurité préparé', required: true, section: 'safety', options: ['Oui', 'Non'] },
      { id: 'traffic_control', type: 'radio', label: 'Contrôle de circulation requis', required: true, section: 'safety', options: ['Oui', 'Non'] },
      
      // Section Documents
      { id: 'site_plan', type: 'file', label: 'Plan de site', required: true, section: 'documents' },
      { id: 'excavation_plans', type: 'file', label: 'Plans d\'excavation', required: true, section: 'documents' },
      
      // Section Signatures
      { id: 'applicant_signature', type: 'signature', label: 'Signature du demandeur', required: true, section: 'signatures' },
      { id: 'application_date', type: 'date', label: 'Date de la demande', required: true, section: 'signatures' }
    ]
  },

  // 4. PERMIS RADIOPROTECTION CCSN - Basé sur REGDOC-1.6.1
  {
    id: 'radiation-protection-permit',
    name: 'Permis de Substances Nucléaires et Appareils à Rayonnement',
    category: 'Radioprotection',
    description: 'Autorisation CCSN pour possession et utilisation de substances nucléaires selon LSCRN',
    authority: 'Commission canadienne de sûreté nucléaire (CCSN)',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '1-10 ans selon type',
    cost: '500$ - 50,000$ selon complexité',
    processingTime: '30-180 jours',
    renewalRequired: true,
    renewalPeriod: 'Selon permis',
    legislation: 'LSCRN, Règlement radioprotection, REGDOC-1.6.1',
    contactInfo: {
      phone: '1-888-229-2672',
      email: 'licence-permis@cnsc-ccsn.gc.ca',
      website: 'https://www.cnsc-ccsn.gc.ca/'
    },
    selected: false,
    status: 'pending',
    formFields: [
      // Section A: Renseignements sur le demandeur
      { id: 'legal_name', type: 'text', label: 'Dénomination sociale complète', required: true, section: 'applicant' },
      { id: 'corporation_number', type: 'text', label: 'Numéro de corporation', required: true, section: 'applicant' },
      { id: 'business_address', type: 'textarea', label: 'Adresse d\'affaires', required: true, section: 'applicant' },
      { id: 'primary_contact', type: 'text', label: 'Personne-ressource principale', required: true, section: 'applicant' },
      
      // Section B: Renseignements sur les activités autorisées
      { id: 'use_types', type: 'checkbox', label: 'Types d\'utilisation', required: true, section: 'activities', 
        options: ['Radiographie industrielle', 'Jauges nucléaires fixes', 'Jauges nucléaires portatives', 'Sources d\'étalonnage', 'Recherche et développement', 'Enseignement', 'Sources scellées', 'Substances non scellées'] },
      { id: 'nuclear_substances', type: 'textarea', label: 'Substances nucléaires demandées', required: true, section: 'activities', 
        placeholder: 'Indiquer radionuclide, forme physique/chimique, quantité...' },
      
      // Section C: Programme de radioprotection
      { id: 'rso_name', type: 'text', label: 'Nom du responsable de la radioprotection (RSR)', required: true, section: 'radiation_protection' },
      { id: 'rso_qualifications', type: 'textarea', label: 'Qualifications du RSR', required: true, section: 'radiation_protection' },
      
      // Section Signatures
      { id: 'applicant_signature', type: 'signature', label: 'Signature du demandeur autorisé', required: true, section: 'signatures' },
      { id: 'rso_signature', type: 'signature', label: 'Signature du RSR', required: true, section: 'signatures' },
      { id: 'application_date', type: 'date', label: 'Date de la demande', required: true, section: 'signatures' }
    ]
  },

  // 5. PERMIS DE CONSTRUCTION - Basé sur Code du bâtiment Ontario
  {
    id: 'building-permit',
    name: 'Permis de Construction',
    category: 'Construction',
    description: 'Autorisation municipale pour construction selon Code du bâtiment de l\'Ontario/CNB',
    authority: 'Municipal',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '6 mois - 2 ans',
    cost: '0.5% - 2% valeur projet',
    processingTime: '15-60 jours',
    renewalRequired: true,
    renewalPeriod: 'Si prolongation',
    legislation: 'Code national du bâtiment, Code du bâtiment provincial, Règlements municipaux',
    selected: false,
    status: 'pending',
    formFields: [
      // Section Propriétaire/Demandeur
      { id: 'owner_name', type: 'text', label: 'Nom du propriétaire', required: true, section: 'owner' },
      { id: 'owner_address', type: 'textarea', label: 'Adresse du propriétaire', required: true, section: 'owner' },
      { id: 'owner_phone', type: 'text', label: 'Téléphone du propriétaire', required: true, section: 'owner' },
      { id: 'applicant_name', type: 'text', label: 'Nom du demandeur', required: true, section: 'owner' },
      
      // Section Projet
      { id: 'project_address', type: 'textarea', label: 'Adresse du projet', required: true, section: 'project' },
      { id: 'legal_description', type: 'text', label: 'Description légale', required: true, section: 'project' },
      { id: 'construction_type', type: 'select', label: 'Type de construction', required: true, section: 'construction_type',
        options: ['Nouvelle construction', 'Addition', 'Rénovation', 'Transformation', 'Démolition', 'Changement d\'usage'] },
      { id: 'building_use', type: 'select', label: 'Usage du bâtiment', required: true, section: 'construction_type',
        options: ['Résidentiel - maison unifamiliale', 'Résidentiel - duplex', 'Résidentiel - multifamilial', 'Commercial', 'Industriel', 'Institutionnel', 'Assemblée'] },
      
      // Section Spécifications
      { id: 'building_height', type: 'number', label: 'Hauteur du bâtiment (m)', required: true, section: 'specifications', validation: { min: 0 } },
      { id: 'number_storeys', type: 'number', label: 'Nombre d\'étages', required: true, section: 'specifications', validation: { min: 1 } },
      { id: 'floor_area', type: 'number', label: 'Superficie de plancher (m²)', required: true, section: 'specifications', validation: { min: 0 } },
      
      // Section Documents
      { id: 'architectural_plans', type: 'file', label: 'Plans architecturaux', required: true, section: 'documents' },
      { id: 'structural_plans', type: 'file', label: 'Plans de structure', required: true, section: 'documents' },
      
      // Section Signatures
      { id: 'owner_signature', type: 'signature', label: 'Signature du propriétaire', required: true, section: 'signatures' },
      { id: 'applicant_signature', type: 'signature', label: 'Signature du demandeur', required: true, section: 'signatures' }
    ]
  },

  // 6. PERMIS GRUE MOBILE - Basé sur RSST et CSA B335
  {
    id: 'crane-operator-permit',
    name: 'Permis d\'Opérateur de Grue Mobile',
    category: 'Équipements',
    description: 'Certification pour opération de grues mobiles selon RSST et CSA B335',
    authority: 'Provincial (CNESST/WorkSafeBC/etc.)',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: '3-5 ans',
    cost: '300$ - 1500$ formation + examen',
    processingTime: '2-4 semaines après formation',
    renewalRequired: true,
    renewalPeriod: '3-5 ans',
    legislation: 'RSST Art. 260-290, CSA B335, Règlements provinciaux',
    selected: false,
    status: 'pending',
    formFields: [
      // Section Candidat
      { id: 'candidate_name', type: 'text', label: 'Nom complet du candidat', required: true, section: 'candidate' },
      { id: 'date_of_birth', type: 'date', label: 'Date de naissance', required: true, section: 'candidate' },
      { id: 'address', type: 'textarea', label: 'Adresse résidentielle', required: true, section: 'candidate' },
      { id: 'phone_number', type: 'text', label: 'Téléphone', required: true, section: 'candidate' },
      { id: 'employer_name', type: 'text', label: 'Nom de l\'employeur', required: true, section: 'candidate' },
      
      // Section Expérience
      { id: 'crane_experience', type: 'number', label: 'Années d\'expérience avec grues', required: true, section: 'experience', validation: { min: 0 } },
      { id: 'crane_types', type: 'checkbox', label: 'Types de grues expérimentées', required: true, section: 'experience',
        options: ['Grue mobile conventionnelle', 'Grue tout-terrain', 'Grue sur chenilles', 'Grue téléscopique', 'Grue tour'] },
      
      // Section Formation
      { id: 'training_course', type: 'text', label: 'Cours de formation complété', required: true, section: 'training' },
      { id: 'training_provider', type: 'text', label: 'Fournisseur de formation', required: true, section: 'training' },
      { id: 'training_date', type: 'date', label: 'Date de formation', required: true, section: 'training' },
      
      // Section Type de permis
      { id: 'permit_type', type: 'select', label: 'Type de permis demandé', required: true, section: 'permit_type',
        options: ['Grue mobile - Classe A (0-15 tonnes)', 'Grue mobile - Classe B (15-40 tonnes)', 'Grue mobile - Classe C (40-100 tonnes)', 'Grue mobile - Classe D (plus de 100 tonnes)', 'Grue tout-terrain', 'Grue sur chenilles'] },
      
      // Section Documents
      { id: 'photo_id', type: 'file', label: 'Pièce d\'identité avec photo', required: true, section: 'documents' },
      { id: 'medical_certificate', type: 'file', label: 'Certificat médical', required: true, section: 'documents' },
      
      // Section Signatures
      { id: 'candidate_signature', type: 'signature', label: 'Signature du candidat', required: true, section: 'signatures' },
      { id: 'employer_signature', type: 'signature', label: 'Signature de l\'employeur', required: true, section: 'signatures' },
      { id: 'application_date', type: 'date', label: 'Date de la demande', required: true, section: 'signatures' }
    ]
  }
];

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Permis & Autorisations Réels',
    subtitle: 'Formulaires authentiques de permis utilisés au Canada',
    searchPlaceholder: 'Rechercher un permis...',
    allCategories: 'Toutes catégories',
    allProvinces: 'Toutes provinces',
    selectedPermits: 'Permis sélectionnés',
    fillForm: 'Remplir le formulaire',
    viewForm: 'Voir le formulaire',
    saveForm: 'Sauvegarder',
    submitForm: 'Soumettre',
    printForm: 'Imprimer',
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
    sections: {
      identification: 'Identification',
      applicant: 'Demandeur',
      access: 'Accès',
      lockout: 'Cadenassage',
      atmosphere: 'Atmosphère',
      monitoring: 'Surveillance',
      ventilation: 'Ventilation',
      work: 'Travaux',
      hazards: 'Dangers',
      ppe: 'ÉPI',
      rescue: 'Sauvetage',
      communication: 'Communication',
      signatures: 'Signatures',
      activities: 'Activités',
      radiation_protection: 'Radioprotection',
      security: 'Sécurité',
      waste: 'Déchets',
      emergency: 'Urgence',
      documents: 'Documents',
      declarations: 'Déclarations',
      candidate: 'Candidat',
      experience: 'Expérience',
      training: 'Formation',
      permit_type: 'Type de permis',
      owner: 'Propriétaire',
      project: 'Projet',
      construction_type: 'Type de construction',
      specifications: 'Spécifications',
      work_type: 'Type de travaux',
      precautions: 'Précautions',
      excavation: 'Excavation',
      safety: 'Sécurité'
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4RealPermits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  const t = translations[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return realPermitsDatabase;
  });
  const [expandedForms, setExpandedForms] = useState({});

  // Filtrage des permis
  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.authority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
    const matchesProvince = selectedProvince === 'all' || permit.province.includes(selectedProvince);
    return matchesSearch && matchesCategory && matchesProvince;
  });

  // Catégories et provinces uniques
  const categories = Array.from(new Set(permits.map(p => p.category)));
  const provinces = ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
  
  // Permis sélectionnés
  const selectedPermits = permits.filter(p => p.selected);

  // Statistiques
  const stats = useMemo(() => ({
    totalPermits: permits.length,
    selected: selectedPermits.length,
    critical: selectedPermits.filter(p => p.priority === 'critical').length,
    pending: selectedPermits.filter(p => p.status === 'pending').length
  }), [permits, selectedPermits]);

  // =================== HANDLERS ===================
  const handlePermitToggle = (permitId) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updatePermitField = (permitId, field, value) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, [field]: value }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits) => {
    const selectedList = updatedPermits.filter(p => p.selected);
    
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: updatedPermits.length,
        selected: selectedList.length,
        critical: selectedList.filter(p => p.priority === 'critical').length,
        pending: selectedList.filter(p => p.status === 'pending').length
      }
    };
    
    onDataChange('permits', permitsData);
  };

  const handleFormFieldChange = (permitId, fieldId, value) => {
    const updatedPermits = permits.map(permit => {
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
    });
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const toggleFormExpansion = (permitId) => {
    setExpandedForms(prev => ({
      ...prev,
      [permitId]: !prev[permitId]
    }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Sécurité': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': return '☢️';
      case 'Équipements': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#22c55e';
      case 'submitted': return '#3b82f6';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // =================== COMPOSANT FORMULAIRE ===================
  const PermitForm = ({ permit }) => {
    const isExpanded = expandedForms[permit.id];
    if (!isExpanded) return null;

    // Grouper les champs par section
    const fieldsBySection = permit.formFields?.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {}) || {};

    const renderField = (field) => {
      const value = permit.formData?.[field.id] || '';
      
      switch (field.type) {
        case 'text':
        case 'number':
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className="form-input"
            />
          );
        
        case 'date':
        case 'time':
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
              required={field.required}
              className="form-input"
            />
          );
        
        case 'textarea':
          return (
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
              className="form-textarea"
            />
          );
        
        case 'select':
          return (
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
              required={field.required}
              className="form-select"
            >
              <option value="">Sélectionner...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        
        case 'radio':
          return (
            <div className="radio-group">
              {field.options?.map(option => (
                <label key={option} className="radio-label">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
                    required={field.required}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          );
        
        case 'checkbox':
          const checkedValues = Array.isArray(value) ? value : [];
          return (
            <div className="checkbox-group">
              {field.options?.map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter(v => v !== option);
                      handleFormFieldChange(permit.id, field.id, newValues);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          );
        
        case 'file':
          return (
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFormFieldChange(permit.id, field.id, file.name);
                }
              }}
              required={field.required}
              className="form-file"
            />
          );
        
        case 'signature':
          return (
            <div className="signature-field">
              <div className="signature-pad">
                <span className="signature-placeholder">
                  {value || 'Signature requise'}
                </span>
              </div>
              <button 
                type="button" 
                className="signature-btn"
                onClick={() => handleFormFieldChange(permit.id, field.id, `Signé le ${new Date().toLocaleDateString()}`)}
              >
                Signer
              </button>
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <div className="permit-form">
        <div className="form-header">
          <h3>{permit.name}</h3>
          <div className="form-actions">
            <button className="form-action-btn save">
              <Save size={16} />
              Sauvegarder
            </button>
            <button className="form-action-btn print">
              <Printer size={16} />
              Imprimer
            </button>
            <button className="form-action-btn submit">
              <Mail size={16} />
              Soumettre
            </button>
          </div>
        </div>

        <div className="form-content">
          {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
            <div key={sectionName} className="form-section-group">
              <h4 className="form-section-title">
                {t.sections[sectionName] || sectionName}
              </h4>
              <div className="form-fields">
                {fields.map(field => (
                  <div key={field.id} className="form-field">
                    <label className="form-label" htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                    {field.validation?.message && (
                      <div className="field-help">{field.validation.message}</div>
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

  return (
    <>
      {/* CSS pour Permis Réels */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; }
          .permits-header { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .permits-title { color: #2563eb; font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .permits-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-value { font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #3b82f6; font-weight: 500; }
          
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #2563eb; background: rgba(15, 23, 42, 0.9); }
          .filter-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; min-width: 150px; }
          .filter-select:focus { outline: none; border-color: #2563eb; }
          
          .permits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
          .permit-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; transition: all 0.3s ease; position: relative; }
          .permit-card:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); }
          .permit-card.selected { border-color: #2563eb; background: rgba(59, 130, 246, 0.1); }
          .permit-card.critical::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 16px 0 0 16px; }
          
          .permit-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; cursor: pointer; }
          .permit-icon { font-size: 28px; width: 40px; text-align: center; }
          .permit-content { flex: 1; }
          .permit-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
          .permit-category { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .permit-description { color: #cbd5e1; font-size: 13px; line-height: 1.4; margin-bottom: 8px; }
          .permit-authority { color: #60a5fa; font-size: 11px; font-weight: 500; }
          .permit-checkbox { width: 24px; height: 24px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 6px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .permit-checkbox.checked { background: #2563eb; border-color: #2563eb; color: white; }
          
          .permit-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
          .meta-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94a3b8; }
          .priority-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          
          .permit-actions { display: flex; gap: 8px; margin-top: 16px; }
          .action-btn { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
          .action-btn.primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
          .action-btn.secondary { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; border: 1px solid rgba(100, 116, 139, 0.3); }
          .action-btn:hover { transform: translateY(-1px); }
          
          .permit-form { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; margin-top: 16px; overflow: hidden; }
          .form-header { background: rgba(59, 130, 246, 0.1); padding: 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); display: flex; justify-content: space-between; align-items: center; }
          .form-header h3 { color: #ffffff; margin: 0; font-size: 16px; font-weight: 600; }
          .form-actions { display: flex; gap: 8px; }
          .form-action-btn { padding: 6px 10px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; }
          .form-action-btn.save { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
          .form-action-btn.print { background: rgba(100, 116, 139, 0.2); color: #cbd5e1; }
          .form-action-btn.submit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
          
          .form-content { padding: 20px; max-height: 600px; overflow-y: auto; }
          .form-section-group { margin-bottom: 24px; }
          .form-section-title { color: #2563eb; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(59, 130, 246, 0.3); }
          .form-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
          .form-field { display: flex; flex-direction: column; }
          .form-label { color: #e2e8f0; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .required { color: #ef4444; margin-left: 2px; }
          .form-input, .form-textarea, .form-select { padding: 8px 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; transition: all 0.3s ease; }
          .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: #2563eb; }
          .form-file { padding: 4px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 11px; }
          
          .radio-group, .checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; }
          .radio-label, .checkbox-label { display: flex; align-items: center; gap: 4px; color: #cbd5e1; font-size: 11px; cursor: pointer; }
          .radio-label input, .checkbox-label input { margin: 0; }
          
          .signature-field { display: flex; align-items: center; gap: 8px; }
          .signature-pad { flex: 1; border: 1px dashed rgba(100, 116, 139, 0.5); border-radius: 4px; padding: 8px; min-height: 40px; display: flex; align-items: center; }
          .signature-placeholder { color: #94a3b8; font-size: 11px; font-style: italic; }
          .signature-btn { padding: 6px 12px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; cursor: pointer; font-size: 11px; }
          
          .field-help { font-size: 10px; color: #64748b; margin-top: 2px; font-style: italic; }
          
          @media (max-width: 768px) {
            .permits-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .permits-stats { grid-template-columns: repeat(2, 1fr); }
            .form-fields { grid-template-columns: 1fr; }
            .permit-actions { flex-direction: column; }
          }
        `
      }} />

      <div className="step4-container">
        {/* En-tête avec résumé */}
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
              <div className="stat-label">Permis disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">Sélectionnés</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">Critiques</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">En attente</div>
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
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {t.categories[category] || category}
                </option>
              ))}
            </select>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t.allProvinces}</option>
              {provinces.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des permis */}
        <div className="permits-grid">
          {filteredPermits.map(permit => {
            const isSelected = permit.selected;
            const isFormExpanded = expandedForms[permit.id];
            
            return (
              <div 
                key={permit.id} 
                className={`permit-card ${isSelected ? 'selected' : ''} ${permit.priority}`}
              >
                {/* Header avec sélection */}
                <div className="permit-header" onClick={() => handlePermitToggle(permit.id)}>
                  <div className="permit-icon">{getCategoryIcon(permit.category)}</div>
                  <div className="permit-content">
                    <h3 className="permit-name">{permit.name}</h3>
                    <div className="permit-category">{t.categories[permit.category] || permit.category}</div>
                    <div className="permit-description">{permit.description}</div>
                    <div className="permit-authority">{permit.authority}</div>
                  </div>
                  <div className={`permit-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Métadonnées rapides */}
                <div className="permit-meta">
                  <div className="meta-item">
                    <span className="priority-badge" style={{ backgroundColor: `${getPriorityColor(permit.priority)}20`, color: getPriorityColor(permit.priority) }}>
                      {t.priorities[permit.priority]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(permit.status)}20`, color: getStatusColor(permit.status) }}>
                      {t.statuses[permit.status]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <Clock size={12} />
                    {permit.processingTime}
                  </div>
                  <div className="meta-item">
                    <MapPin size={12} />
                    {permit.province.length} provinces
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
                      {isFormExpanded ? 'Fermer' : 'Remplir'}
                      {isFormExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button className="action-btn secondary">
                      <Eye size={14} />
                      Aperçu
                    </button>
                    <button className="action-btn secondary">
                      <Download size={14} />
                      PDF
                    </button>
                  </div>
                )}

                {/* Formulaire du permis */}
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
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun permis trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus de permis</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4RealPermits;
