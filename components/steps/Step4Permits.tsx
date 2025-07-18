"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  type: 'text' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature' | 'workers_tracking' | 'time_picker' | 'photo_gallery';
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

interface WorkerEntry {
  id: number;
  name: string;
  entryTime: string;
  exitTime: string | null;
  date: string;
}

interface PhotoEntry {
  id: number;
  url: string;
  name: string;
  timestamp: string;
  description: string;
}

interface SignatureMetadata {
  name: string;
  date: string;
  time: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// =================== FONCTION DE TRADUCTION BILINGUE ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Réels',
      subtitle: 'Formulaires authentiques de permis utilisés au Canada',
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
        documents: 'Documents'
      },
      stats: {
        available: 'Permis disponibles',
        selected: 'Sélectionnés',
        critical: 'Critiques',
        pending: 'En attente'
      },
      actions: {
        fill: 'Remplir',
        close: 'Fermer',
        preview: 'Aperçu',
        download: 'PDF',
        save: 'Sauvegarder',
        print: 'Imprimer',
        submit: 'Soumettre'
      },
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche pour voir plus de permis',
        workerName: 'Nom du travailleur',
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
        provinces: 'provinces'
      }
    };
  } else {
    return {
      title: 'Real Permits & Authorizations',
      subtitle: 'Authentic permit forms used in Canada',
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
        documents: 'Documents'
      },
      stats: {
        available: 'Available permits',
        selected: 'Selected',
        critical: 'Critical',
        pending: 'Pending'
      },
      actions: {
        fill: 'Fill',
        close: 'Close',
        preview: 'Preview',
        download: 'PDF',
        save: 'Save',
        print: 'Print',
        submit: 'Submit'
      },
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria to see more permits',
        workerName: 'Worker name',
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
        provinces: 'provinces'
      }
    };
  }
};

// =================== FONCTION POUR TRADUIRE LES PERMIS ===================
const translatePermitsDatabase = (language: 'fr' | 'en'): Permit[] => {
  const basePermits: Permit[] = [
    // 1. PERMIS ESPACE CLOS - Basé sur ASP Construction
    {
      id: 'confined-space-entry',
      name: language === 'fr' ? 'Fiche de Contrôle en Espace Clos' : 'Confined Space Entry Control Sheet',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis d\'entrée obligatoire pour tous travaux en espace clos selon RSST et CSTC' : 'Mandatory entry permit for all confined space work according to RSST and CSTC',
      authority: language === 'fr' ? 'Employeur / ASP Construction' : 'Employer / ASP Construction',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? 'Maximum 8 heures ou fin des travaux' : 'Maximum 8 hours or end of work',
      cost: language === 'fr' ? 'Inclus dans formation' : 'Included in training',
      processingTime: language === 'fr' ? 'Avant chaque entrée' : 'Before each entry',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien' : 'Daily',
      legislation: 'RSST Art. 297-312, CSTC Section 3.21',
      contactInfo: {
        phone: '514-355-6190',
        website: 'https://www.asp-construction.org'
      },
      selected: false,
      status: 'pending',
      formFields: [
        { id: 'space_identification', type: 'text', label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification', required: true, section: 'identification', placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...' },
        { id: 'project_name', type: 'text', label: language === 'fr' ? 'Nom du projet' : 'Project name', required: true, section: 'identification' },
        { id: 'location', type: 'text', label: language === 'fr' ? 'Localisation exacte' : 'Exact location', required: true, section: 'identification' },
        { id: 'permit_date', type: 'date', label: language === 'fr' ? 'Date du permis' : 'Permit date', required: true, section: 'identification' },
        { id: 'permit_time', type: 'time_picker', label: language === 'fr' ? 'Heure d\'émission' : 'Issue time', required: true, section: 'identification' },
        { id: 'entry_mandatory', type: 'radio', label: language === 'fr' ? 'L\'entrée est-elle obligatoire ?' : 'Is entry mandatory?', required: true, section: 'access', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'] },
        { id: 'authorized_workers', type: 'textarea', label: language === 'fr' ? 'Noms des travailleurs autorisés' : 'Names of authorized workers', required: true, section: 'signatures', placeholder: language === 'fr' ? 'Un travailleur par ligne...' : 'One worker per line...' },
        { id: 'workers_log', type: 'workers_tracking', label: language === 'fr' ? 'Registre des entrées/sorties' : 'Entry/exit log', required: true, section: 'signatures' },
        { id: 'photos_documentation', type: 'photo_gallery', label: language === 'fr' ? 'Photos de documentation' : 'Documentation photos', required: false, section: 'atmosphere' },
        { id: 'supervisor_signature', type: 'signature', label: language === 'fr' ? 'Signature du surveillant' : 'Supervisor signature', required: true, section: 'signatures' }
      ]
    },

    // 2. PERMIS TRAVAIL À CHAUD - Basé sur NFPA 51B et CNESST
    {
      id: 'hot-work-permit',
      name: language === 'fr' ? 'Permis de Travail à Chaud' : 'Hot Work Permit',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Autorisation pour soudage, découpage, meulage et travaux générant étincelles selon NFPA 51B' : 'Authorization for welding, cutting, grinding and spark-generating work according to NFPA 51B',
      authority: language === 'fr' ? 'Service incendie / Employeur' : 'Fire Department / Employer',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? '24 heures maximum' : '24 hours maximum',
      cost: language === 'fr' ? 'Variable selon municipalité' : 'Variable by municipality',
      processingTime: language === 'fr' ? 'Immédiat à 24h' : 'Immediate to 24h',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien' : 'Daily',
      legislation: 'NFPA 51B-2019, Code sécurité incendie, RSST',
      contactInfo: {
        phone: language === 'fr' ? 'Service incendie local' : 'Local fire department',
        website: 'Municipal'
      },
      selected: false,
      status: 'pending',
      formFields: [
        { id: 'permit_number', type: 'text', label: language === 'fr' ? 'Numéro de permis' : 'Permit number', required: true, section: 'identification' },
        { id: 'work_location', type: 'text', label: language === 'fr' ? 'Lieu des travaux' : 'Work location', required: true, section: 'identification' },
        { id: 'work_type', type: 'checkbox', label: language === 'fr' ? 'Type de travail à chaud' : 'Type of hot work', required: true, section: 'work_type', options: language === 'fr' ? ['Soudage à l\'arc', 'Soudage au gaz', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage', 'Perçage', 'Brasage', 'Autre'] : ['Arc welding', 'Gas welding', 'Torch cutting', 'Plasma cutting', 'Grinding', 'Drilling', 'Brazing', 'Other'] },
        { id: 'work_description', type: 'textarea', label: language === 'fr' ? 'Description détaillée des travaux' : 'Detailed work description', required: true, section: 'work_type' },
        { id: 'fire_watch', type: 'radio', label: language === 'fr' ? 'Surveillance incendie assignée' : 'Fire watch assigned', required: true, section: 'precautions', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'] },
        { id: 'photos_precautions', type: 'photo_gallery', label: language === 'fr' ? 'Photos des mesures de précaution' : 'Precautionary measures photos', required: false, section: 'precautions' },
        { id: 'applicant_signature', type: 'signature', label: language === 'fr' ? 'Signature du demandeur' : 'Applicant signature', required: true, section: 'signatures' }
      ]
    },

    // 3. PERMIS D'EXCAVATION - Basé sur Ville de Montréal
    {
      id: 'excavation-permit',
      name: language === 'fr' ? 'Permis d\'Excavation' : 'Excavation Permit',
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 'Autorisation pour travaux d\'excavation près du domaine public selon règlements municipaux' : 'Authorization for excavation work near public domain according to municipal regulations',
      authority: language === 'fr' ? 'Municipal' : 'Municipal',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux' : 'Duration of work',
      cost: language === 'fr' ? '200$ - 2000$ selon ampleur' : '$200 - $2000 depending on scope',
      processingTime: language === 'fr' ? '5-15 jours ouvrables' : '5-15 business days',
      renewalRequired: false,
      legislation: language === 'fr' ? 'Règlements municipaux, Code de construction' : 'Municipal regulations, Building code',
      contactInfo: {
        website: language === 'fr' ? 'Bureau des permis municipal' : 'Municipal permit office'
      },
      selected: false,
      status: 'pending',
      formFields: [
        { id: 'applicant_name', type: 'text', label: language === 'fr' ? 'Nom du demandeur' : 'Applicant name', required: true, section: 'applicant' },
        { id: 'work_address', type: 'textarea', label: language === 'fr' ? 'Adresse des travaux' : 'Work address', required: true, section: 'project' },
        { id: 'project_description', type: 'textarea', label: language === 'fr' ? 'Description du projet' : 'Project description', required: true, section: 'project' },
        { id: 'excavation_depth', type: 'number', label: language === 'fr' ? 'Profondeur d\'excavation (m)' : 'Excavation depth (m)', required: true, section: 'excavation', validation: { min: 0 } },
        { id: 'soil_type', type: 'select', label: language === 'fr' ? 'Type de sol' : 'Soil type', required: true, section: 'excavation', options: language === 'fr' ? ['Argile', 'Sable', 'Gravier', 'Roc', 'Remblai', 'Mixte'] : ['Clay', 'Sand', 'Gravel', 'Rock', 'Fill', 'Mixed'] },
        { id: 'safety_plan', type: 'radio', label: language === 'fr' ? 'Plan de sécurité préparé' : 'Safety plan prepared', required: true, section: 'safety', options: language === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No'] },
        { id: 'photos_safety', type: 'photo_gallery', label: language === 'fr' ? 'Photos de sécurité du site' : 'Site safety photos', required: false, section: 'safety' },
        { id: 'site_plan', type: 'file', label: language === 'fr' ? 'Plan de site' : 'Site plan', required: true, section: 'documents' },
        { id: 'applicant_signature_excavation', type: 'signature', label: language === 'fr' ? 'Signature du demandeur' : 'Applicant signature', required: true, section: 'signatures' }
      ]
    }
  ];

  return basePermits;
};
// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = getTexts(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  
  // =================== GESTION DES DONNÉES AVEC TRADUCTION ===================
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return translatePermitsDatabase(language);
  });

  // =================== TRADUCTION DYNAMIQUE ===================
  useEffect(() => {
    const translatedPermits = translatePermitsDatabase(language);
    // Préserver les sélections et données de formulaire existantes
    const updatedPermits = translatedPermits.map(translatedPermit => {
      const existingPermit = permits.find(p => p.id === translatedPermit.id);
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

  const stats = useMemo(() => ({
    totalPermits: permits.length,
    selected: selectedPermits.length,
    critical: selectedPermits.filter((p: Permit) => p.priority === 'critical').length,
    pending: selectedPermits.filter((p: Permit) => p.status === 'pending').length
  }), [permits, selectedPermits]);

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
      }
    };
    onDataChange('permits', permitsData);
  };

  const handleFormFieldChange = (permitId: string, fieldId: string, value: any) => {
    const updatedPermits = permits.map((permit: Permit) => {
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

  const toggleFormExpansion = (permitId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [permitId]: !prev[permitId]
    }));
  };

  // =================== FONCTIONS UTILITAIRES ===================
  const getCategoryIcon = (category: string) => {
    // Gestion bilingue des catégories
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

  // =================== COMPOSANT FORMULAIRE ===================
  const PermitForm = ({ permit }: { permit: Permit }) => {
    const isExpanded = expandedForms[permit.id];
    if (!isExpanded) return null;

    const fieldsBySection = permit.formFields?.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {} as { [key: string]: FormField[] }) || {};

    const renderField = (field: FormField) => {
      const value = permit.formData?.[field.id] || '';
      
      switch (field.type) {
        case 'text':
        case 'number':
          return (
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              onInput={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              onInput={(e) => e.stopPropagation()}
              required={field.required}
              className="form-input"
            />
          );
        
        case 'time_picker':
          const [showTimePicker, setShowTimePicker] = useState(false);
          const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
          const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
          const currentTime = value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
          const [selectedHour, selectedMinute] = currentTime.split(':');
          
          return (
            <div className="time-picker-container">
              <div 
                className="time-display"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimePicker(!showTimePicker);
                }}
              >
                <span className="time-value">{currentTime}</span>
                <span className="time-icon">🕐</span>
              </div>
              
              {showTimePicker && (
                <div className="time-picker-dropdown">
                  <div className="time-picker-header">
                    <span>{t.messages.selectTime}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTimePicker(false);
                      }}
                      className="time-picker-close"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="time-picker-selectors">
                    <div className="time-selector">
                      <div className="time-selector-label">{language === 'fr' ? 'Heure' : 'Hour'}</div>
                      <div className="time-options">
                        {hours.map((hour: string) => (
                          <div
                            key={hour}
                            className={`time-option ${selectedHour === hour ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTime = `${hour}:${selectedMinute}`;
                              handleFormFieldChange(permit.id, field.id, newTime);
                            }}
                          >
                            {hour}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="time-separator">:</div>
                    
                    <div className="time-selector">
                      <div className="time-selector-label">{language === 'fr' ? 'Minutes' : 'Minutes'}</div>
                      <div className="time-options">
                        {minutes.filter((_, i) => i % 5 === 0).map((minute: string) => (
                          <div
                            key={minute}
                            className={`time-option ${selectedMinute === minute ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTime = `${selectedHour}:${minute}`;
                              handleFormFieldChange(permit.id, field.id, newTime);
                            }}
                          >
                            {minute}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="time-picker-actions">
                    <button
                      type="button"
                      className="time-picker-now"
                      onClick={(e) => {
                        e.stopPropagation();
                        const now = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
                        handleFormFieldChange(permit.id, field.id, now);
                        setShowTimePicker(false);
                      }}
                    >
                      {t.messages.now}
                    </button>
                    <button
                      type="button"
                      className="time-picker-ok"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTimePicker(false);
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'textarea':
          return (
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              onInput={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                handleFormFieldChange(permit.id, field.id, e.target.value);
              }}
              required={field.required}
              className="form-select"
            >
              <option value="">{t.messages.select}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        
        case 'radio':
          return (
            <div className="radio-group">
              {field.options?.map((option: string) => (
                <label key={option} className="radio-label">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFormFieldChange(permit.id, field.id, e.target.value);
                    }}
                    required={field.required}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          );
        
        case 'checkbox':
          const checkedValues: string[] = Array.isArray(value) ? value : [];
          return (
            <div className="checkbox-group">
              {field.options?.map((option: string) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkedValues.includes(option)}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter((v: string) => v !== option);
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
                e.preventDefault();
                e.stopPropagation();
                const file = e.target.files?.[0];
                if (file) {
                  handleFormFieldChange(permit.id, field.id, file.name);
                }
              }}
              required={field.required}
              className="form-file"
            />
          );
          case 'workers_tracking':
          const workersLog: WorkerEntry[] = Array.isArray(value) ? value : [];
          return (
            <div className="workers-tracking-container">
              <div className="worker-entry-form">
                <div className="worker-entry-inputs">
                  <input
                    type="text"
                    placeholder={t.messages.workerName}
                    className="worker-name-input"
                    onKeyPress={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const container = (e.target as HTMLElement).closest('.worker-entry-form');
                        const nameInput = container?.querySelector('.worker-name-input') as HTMLInputElement;
                        const timeInput = container?.querySelector('.worker-time-input') as HTMLInputElement;
                        
                        if (nameInput?.value.trim()) {
                          const newEntry: WorkerEntry = {
                            id: Date.now(),
                            name: nameInput.value.trim(),
                            entryTime: timeInput.value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                            exitTime: null,
                            date: new Date().toLocaleDateString('fr-CA')
                          };
                          const updatedLog = [...workersLog, newEntry];
                          handleFormFieldChange(permit.id, field.id, updatedLog);
                          nameInput.value = '';
                          timeInput.value = '';
                        }
                      }
                    }}
                  />
                  <input
                    type="time"
                    className="worker-time-input"
                  />
                  <button
                    type="button"
                    className="worker-entry-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const container = (e.target as HTMLElement).closest('.worker-entry-form');
                      const nameInput = container?.querySelector('.worker-name-input') as HTMLInputElement;
                      const timeInput = container?.querySelector('.worker-time-input') as HTMLInputElement;
                      
                      if (nameInput?.value.trim()) {
                        const newEntry: WorkerEntry = {
                          id: Date.now(),
                          name: nameInput.value.trim(),
                          entryTime: timeInput.value || new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
                          exitTime: null,
                          date: new Date().toLocaleDateString('fr-CA')
                        };
                        const updatedLog = [...workersLog, newEntry];
                        handleFormFieldChange(permit.id, field.id, updatedLog);
                        nameInput.value = '';
                        timeInput.value = '';
                      }
                    }}
                  >
                    {t.messages.recordEntry}
                  </button>
                </div>
              </div>
              
              <div className="workers-log-list">
                <h5>{t.messages.entryExitLog}</h5>
                {workersLog.length === 0 ? (
                  <p className="no-entries">{t.messages.noEntries}</p>
                ) : (
                  <div className="workers-table">
                    <div className="workers-table-header">
                      <span>{language === 'fr' ? 'Nom' : 'Name'}</span>
                      <span>{language === 'fr' ? 'Entrée' : 'Entry'}</span>
                      <span>{language === 'fr' ? 'Sortie' : 'Exit'}</span>
                      <span>{language === 'fr' ? 'Actions' : 'Actions'}</span>
                    </div>
                    {workersLog.map((worker: WorkerEntry) => (
                      <div key={worker.id} className="workers-table-row">
                        <span className="worker-name">{worker.name}</span>
                        <span className="worker-time">{worker.entryTime}</span>
                        <span className="worker-time">
                          {worker.exitTime || (
                            <button
                              type="button"
                              className="exit-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const updatedLog = workersLog.map((w: WorkerEntry) =>
                                  w.id === worker.id
                                    ? { ...w, exitTime: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }) }
                                    : w
                                );
                                handleFormFieldChange(permit.id, field.id, updatedLog);
                              }}
                            >
                              {t.messages.exit}
                            </button>
                          )}
                        </span>
                        <span>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const updatedLog = workersLog.filter((w: WorkerEntry) => w.id !== worker.id);
                              handleFormFieldChange(permit.id, field.id, updatedLog);
                            }}
                          >
                            {t.messages.remove}
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        
        case 'photo_gallery':
          const photos: PhotoEntry[] = Array.isArray(value) ? value : [];
          const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
          
          return (
            <div className="photo-gallery-container">
              <div className="photo-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="photo-input"
                  id={`photo-input-${field.id}`}
                  onChange={(e) => {
                    e.stopPropagation();
                    const files = Array.from(e.target.files || []);
                    
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newPhoto: PhotoEntry = {
                          id: Date.now() + Math.random(),
                          url: event.target?.result as string,
                          name: file.name,
                          timestamp: new Date().toISOString(),
                          description: ''
                        };
                        const updatedPhotos = [...photos, newPhoto];
                        handleFormFieldChange(permit.id, field.id, updatedPhotos);
                      };
                      reader.readAsDataURL(file);
                    });
                    
                    (e.target as HTMLInputElement).value = '';
                  }}
                  style={{ display: 'none' }}
                />
                
                <div className="photo-upload-buttons">
                  <button
                    type="button"
                    className="photo-upload-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      document.getElementById(`photo-input-${field.id}`)?.click();
                    }}
                  >
                    {t.messages.addPhotos}
                  </button>
                  
                  <button
                    type="button"
                    className="photo-camera-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const canvas = document.createElement('canvas');
                      canvas.width = 640;
                      canvas.height = 480;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
                        gradient.addColorStop(0, '#1e293b');
                        gradient.addColorStop(1, '#334155');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 640, 480);
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(t.messages.photoCaptured, 320, 220);
                        ctx.font = '16px Arial';
                        ctx.fillText(new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA'), 320, 260);
                        
                        const dataUrl = canvas.toDataURL('image/png');
                        const newPhoto: PhotoEntry = {
                          id: Date.now(),
                          url: dataUrl,
                          name: `Capture_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`,
                          timestamp: new Date().toISOString(),
                          description: ''
                        };
                        const updatedPhotos = [...photos, newPhoto];
                        handleFormFieldChange(permit.id, field.id, updatedPhotos);
                      }
                    }}
                  >
                    {t.messages.takePhoto}
                  </button>
                </div>
              </div>
              
              {photos.length > 0 && (
                <div className="photo-gallery">
                  <div className="photo-carousel">
                    <div className="photo-main-container">
                      {photos.length > 1 && (
                        <button
                          type="button"
                          className="photo-nav-btn prev"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentPhotoIndex((prev) => 
                              prev === 0 ? photos.length - 1 : prev - 1
                            );
                          }}
                        >
                          ←
                        </button>
                      )}
                      
                      <div className="photo-main">
                        <img
                          src={photos[currentPhotoIndex]?.url}
                          alt={photos[currentPhotoIndex]?.name}
                          className="photo-main-image"
                        />
                        <div className="photo-info">
                          <div className="photo-name">{photos[currentPhotoIndex]?.name}</div>
                          <div className="photo-timestamp">
                            {new Date(photos[currentPhotoIndex]?.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="photo-delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updatedPhotos = photos.filter((_, index) => index !== currentPhotoIndex);
                            handleFormFieldChange(permit.id, field.id, updatedPhotos);
                            if (currentPhotoIndex >= updatedPhotos.length && updatedPhotos.length > 0) {
                              setCurrentPhotoIndex(updatedPhotos.length - 1);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {photos.length > 1 && (
                        <button
                          type="button"
                          className="photo-nav-btn next"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentPhotoIndex((prev) => 
                              prev === photos.length - 1 ? 0 : prev + 1
                            );
                          }}
                        >
                          →
                        </button>
                      )}
                    </div>
                    
                    {photos.length > 1 && (
                      <div className="photo-thumbnails">
                        {photos.map((photo: PhotoEntry, index: number) => (
                          <div
                            key={photo.id}
                            className={`photo-thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCurrentPhotoIndex(index);
                            }}
                          >
                            <img src={photo.url} alt={photo.name} />
                            <div className="thumbnail-overlay">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="photo-description">
                      <textarea
                        placeholder={t.messages.addDescription}
                        value={photos[currentPhotoIndex]?.description || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          const updatedPhotos = photos.map((photo: PhotoEntry, index: number) =>
                            index === currentPhotoIndex
                              ? { ...photo, description: e.target.value }
                              : photo
                          );
                          handleFormFieldChange(permit.id, field.id, updatedPhotos);
                        }}
                        className="photo-description-input"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="photo-gallery-info">
                    <span className="photo-count">
                      {photos.length} {photos.length > 1 ? t.messages.photos : t.messages.photo}
                    </span>
                    {photos.length > 1 && (
                      <span className="photo-current">
                        {t.messages.photoOf} {currentPhotoIndex + 1} {t.messages.of} {photos.length}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'signature':
          const signatureValue = permit.formData?.[field.id] || '';
          const signatureMetadata: SignatureMetadata | undefined = permit.formData?.[field.id + '_metadata'];
          
          return (
            <div className="signature-field">
              <div className="signature-pad">
                {signatureValue ? (
                  <div className="signature-content">
                    <div className="signature-text">✓ {t.messages.signedBy} : {signatureValue}</div>
                    <div className="signature-timestamp">
                      {t.messages.on} {signatureMetadata?.date || new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')} {t.messages.at} {signatureMetadata?.time || new Date().toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <span className="signature-placeholder">
                    {t.messages.signatureRequired}
                  </span>
                )}
              </div>
              <div className="signature-controls">
                <input
                  type="text"
                  placeholder={t.messages.enterName}
                  className="signature-name-input"
                  onKeyPress={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      e.preventDefault();
                      const signerName = (e.target as HTMLInputElement).value.trim();
                      const timestamp = new Date();
                      const fullSignature: SignatureMetadata = {
                        name: signerName,
                        date: timestamp.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA'),
                        time: timestamp.toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: timestamp.toISOString(),
                        ipAddress: 'XXX.XXX.XXX.XXX',
                        userAgent: navigator.userAgent
                      };
                      
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: signerName,
                              [field.id + '_metadata']: fullSignature
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="signature-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = (e.target as HTMLElement).parentElement?.querySelector('.signature-name-input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      const signerName = input.value.trim();
                      const timestamp = new Date();
                      const fullSignature: SignatureMetadata = {
                        name: signerName,
                        date: timestamp.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA'),
                        time: timestamp.toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: timestamp.toISOString(),
                        ipAddress: 'XXX.XXX.XXX.XXX',
                        userAgent: navigator.userAgent
                      };
                      
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: signerName,
                              [field.id + '_metadata']: fullSignature
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                      input.value = '';
                    } else {
                      alert(language === 'fr' ? 'Veuillez entrer votre nom complet pour signer' : 'Please enter your full name to sign');
                    }
                  }}
                >
                  {t.messages.signElectronically}
                </button>
                {signatureValue && (
                  <button 
                    type="button" 
                    className="signature-clear-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const updatedPermits = permits.map((permitItem: Permit) => {
                        if (permitItem.id === permit.id) {
                          return {
                            ...permitItem,
                            formData: {
                              ...permitItem.formData,
                              [field.id]: '',
                              [field.id + '_metadata']: null
                            }
                          };
                        }
                        return permitItem;
                      });
                      
                      setPermits(updatedPermits);
                      updateFormData(updatedPermits);
                    }}
                  >
                    {t.messages.clear}
                  </button>
                )}
              </div>
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
              {t.actions.save}
            </button>
            <button className="form-action-btn print">
              <Printer size={16} />
              {t.actions.print}
            </button>
            <button className="form-action-btn submit">
              <Mail size={16} />
              {t.actions.submit}
            </button>
          </div>
        </div>

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

  // =================== RENDU PRINCIPAL ===================
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; scroll-behavior: auto !important; }
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
          .form-input, .form-textarea, .form-select { padding: 8px 10px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; transition: all 0.3s ease; scroll-behavior: auto !important; scroll-margin: 0 !important; }
          .form-input:focus, .form-textarea:focus, .form-select:focus { outline: none; border-color: #2563eb; }
          .form-file { padding: 4px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 11px; }
          
          .radio-group, .checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; }
          .radio-label, .checkbox-label { display: flex; align-items: center; gap: 4px; color: #cbd5e1; font-size: 11px; cursor: pointer; }
          .radio-label input, .checkbox-label input { margin: 0; }
          
          .time-picker-container { position: relative; }
          .time-display { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
          .time-display:hover { border-color: #2563eb; }
          .time-value { color: #ffffff; font-family: monospace; font-size: 14px; }
          .time-icon { font-size: 16px; }
          .time-picker-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(100, 116, 139, 0.5); border-radius: 8px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); z-index: 1000; backdrop-filter: blur(20px); }
          .time-picker-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); color: #ffffff; font-weight: 600; }
          .time-picker-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; padding: 4px; }
          .time-picker-close:hover { color: #ef4444; }
          .time-picker-selectors { display: flex; align-items: flex-start; gap: 8px; padding: 16px; }
          .time-selector { flex: 1; }
          .time-selector-label { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 8px; text-align: center; }
          .time-options { max-height: 150px; overflow-y: auto; border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; }
          .time-option { padding: 8px 12px; text-align: center; color: #cbd5e1; cursor: pointer; border-bottom: 1px solid rgba(100, 116, 139, 0.2); font-family: monospace; }
          .time-option:last-child { border-bottom: none; }
          .time-option:hover { background: rgba(59, 130, 246, 0.2); color: #ffffff; }
          .time-option.selected { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; font-weight: 600; }
          .time-separator { font-size: 24px; color: #94a3b8; align-self: center; margin-top: 20px; font-weight: bold; }
          .time-picker-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid rgba(100, 116, 139, 0.3); }
          .time-picker-now { padding: 6px 12px; background: rgba(100, 116, 139, 0.2); color: #cbd5e1; border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 4px; cursor: pointer; font-size: 12px; }
          .time-picker-now:hover { background: rgba(100, 116, 139, 0.3); }
          .time-picker-ok { padding: 6px 12px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; margin-left: auto; }
          .time-picker-ok:hover { transform: translateY(-1px); }
          
          .signature-field { display: flex; flex-direction: column; gap: 12px; }
          .signature-pad { flex: 1; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 8px; padding: 12px; min-height: 60px; display: flex; align-items: center; background: rgba(15, 23, 42, 0.9); }
          .signature-content { width: 100%; }
          .signature-text { color: #22c55e; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .signature-timestamp { color: #94a3b8; font-size: 11px; font-style: italic; }
          .signature-placeholder { color: #94a3b8; font-size: 12px; font-style: italic; }
          .signature-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
          .signature-name-input { flex: 1; min-width: 200px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; transition: all 0.3s ease; scroll-behavior: auto !important; scroll-margin: 0 !important; }
          .signature-name-input:focus { outline: none; border-color: #2563eb; }
          .signature-name-input::placeholder { color: #64748b; }
          .signature-btn { padding: 8px 16px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s ease; }
          .signature-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3); }
          .signature-clear-btn { padding: 6px 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; cursor: pointer; font-size: 11px; }
          .signature-clear-btn:hover { background: rgba(239, 68, 68, 0.3); }
          
          .workers-tracking-container { display: flex; flex-direction: column; gap: 16px; }
          .worker-entry-form { background: rgba(30, 41, 59, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .worker-entry-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
          .worker-name-input { flex: 2; min-width: 200px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; scroll-behavior: auto !important; scroll-margin: 0 !important; }
          .worker-time-input { flex: 1; min-width: 120px; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; scroll-behavior: auto !important; scroll-margin: 0 !important; }
          .worker-entry-btn { padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; }
          .worker-entry-btn:hover { transform: translateY(-1px); }
          
          .workers-log-list h5 { color: #2563eb; margin: 0 0 12px; font-size: 14px; font-weight: 600; }
          .no-entries { color: #64748b; font-style: italic; text-align: center; padding: 20px; }
          .workers-table { border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 8px; overflow: hidden; }
          .workers-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; background: rgba(59, 130, 246, 0.1); padding: 12px; font-weight: 600; color: #2563eb; font-size: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); }
          .workers-table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.2); align-items: center; }
          .workers-table-row:last-child { border-bottom: none; }
          .workers-table-row:hover { background: rgba(100, 116, 139, 0.1); }
          .worker-name { color: #ffffff; font-weight: 500; }
          .worker-time { color: #94a3b8; font-family: monospace; }
          .exit-btn { padding: 4px 8px; background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px; cursor: pointer; font-size: 10px; }
          .exit-btn:hover { background: rgba(34, 197, 94, 0.3); }
          .remove-btn { padding: 4px 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; cursor: pointer; font-size: 10px; }
          .remove-btn:hover { background: rgba(239, 68, 68, 0.3); }
          
          .photo-gallery-container { display: flex; flex-direction: column; gap: 16px; }
          .photo-upload-section { background: rgba(30, 41, 59, 0.6); padding: 16px; border-radius: 8px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .photo-upload-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
          .photo-upload-btn, .photo-camera-btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; }
          .photo-upload-btn { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
          .photo-upload-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .photo-camera-btn { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
          .photo-camera-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
          
          .photo-gallery { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 20px; }
          .photo-carousel { display: flex; flex-direction: column; gap: 16px; }
          .photo-main-container { position: relative; display: flex; align-items: center; gap: 12px; }
          .photo-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 40px; height: 40px; border-radius: 50%; background: rgba(0, 0, 0, 0.7); color: white; border: none; cursor: pointer; font-size: 18px; font-weight: bold; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
          .photo-nav-btn:hover { background: rgba(0, 0, 0, 0.9); transform: translateY(-50%) scale(1.1); }
          .photo-nav-btn.prev { left: 10px; }
          .photo-nav-btn.next { right: 10px; }
          
          .photo-main { position: relative; flex: 1; border-radius: 8px; overflow: hidden; background: rgba(30, 41, 59, 0.6); }
          .photo-main-image { width: 100%; height: 300px; object-fit: cover; display: block; }
          .photo-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); padding: 16px; color: white; }
          .photo-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
          .photo-timestamp { font-size: 12px; color: #cbd5e1; }
          .photo-delete-btn { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(239, 68, 68, 0.8); color: white; border: none; cursor: pointer; font-size: 14px; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
          .photo-delete-btn:hover { background: rgba(239, 68, 68, 1); transform: scale(1.1); }
          
          .photo-thumbnails { display: flex; gap: 8px; overflow-x: auto; padding: 8px 0; }
          .photo-thumbnails::-webkit-scrollbar { height: 4px; }
          .photo-thumbnails::-webkit-scrollbar-track { background: rgba(100, 116, 139, 0.2); border-radius: 2px; }
          .photo-thumbnails::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.5); border-radius: 2px; }
          .photo-thumbnail { position: relative; width: 60px; height: 60px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease; flex-shrink: 0; }
          .photo-thumbnail:hover { border-color: rgba(59, 130, 246, 0.5); transform: scale(1.05); }
          .photo-thumbnail.active { border-color: #3b82f6; transform: scale(1.1); }
          .photo-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
          .thumbnail-overlay { position: absolute; bottom: 0; right: 0; background: rgba(0, 0, 0, 0.7); color: white; font-size: 10px; padding: 2px 4px; border-radius: 3px 0 0 0; }
          
          .photo-description { margin-top: 12px; }
          .photo-description-input { width: 100%; padding: 8px 12px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 12px; resize: vertical; transition: all 0.3s ease; scroll-behavior: auto !important; scroll-margin: 0 !important; }
          .photo-description-input:focus { outline: none; border-color: #2563eb; }
          .photo-description-input::placeholder { color: #64748b; }
          
          .photo-gallery-info { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(100, 116, 139, 0.3); }
          .photo-count { color: #3b82f6; font-weight: 600; font-size: 12px; }
          .photo-current { color: #94a3b8; font-size: 11px; }
          
          .field-help { font-size: 10px; color: #64748b; margin-top: 2px; font-style: italic; }
          
          @media (max-width: 768px) {
            .permits-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .permits-stats { grid-template-columns: repeat(2, 1fr); }
            .form-fields { grid-template-columns: 1fr; }
            .permit-actions { flex-direction: column; }
            .photo-main-image { height: 200px; }
            .photo-nav-btn { width: 32px; height: 32px; font-size: 14px; }
            .photo-thumbnails { gap: 6px; }
            .photo-thumbnail { width: 50px; height: 50px; }
            .worker-entry-inputs { flex-direction: column; align-items: stretch; }
            .worker-name-input, .worker-time-input { min-width: auto; flex: none; }
            .signature-controls { flex-direction: column; align-items: stretch; }
            .signature-name-input { min-width: auto; }
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
            <div className="stat-item">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">{t.stats.pending}</div>
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
              {categories.map((category: string) => (
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

        {/* Grille des permis */}
        <div className="permits-grid">
          {filteredPermits.map((permit: Permit) => {
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
                    <div className="permit-category">{(t.categories as any)[permit.category] || permit.category}</div>
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
                      {(t.priorities as any)[permit.priority]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(permit.status)}20`, color: getStatusColor(permit.status) }}>
                      {(t.statuses as any)[permit.status]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <Clock size={12} />
                    {permit.processingTime}
                  </div>
                  <div className="meta-item">
                    <MapPin size={12} />
                    {permit.province.length} {t.messages.provinces}
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
                    <button className="action-btn secondary">
                      <Eye size={14} />
                      {t.actions.preview}
                    </button>
                    <button className="action-btn secondary">
                      <Download size={14} />
                      {t.actions.download}
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
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>{t.messages.noResults}</h3>
            <p style={{ margin: 0 }}>{t.messages.modifySearch}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;
