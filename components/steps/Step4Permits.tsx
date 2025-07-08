'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat
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
  requiredDocuments: string[];
  applicableFor: string[];
  legislation: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  notes?: string;
  selected: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  submissionDate?: string;
  expiryDate?: string;
  permitNumber?: string;
  responsible?: string;
}

// =================== BASE DE DONNÉES PERMIS CANADA ===================
const permitsDatabase: Permit[] = [
  // PERMIS DE TRAVAIL SPÉCIALISÉS
  {
    id: 'hot-work-permit',
    name: 'Permis de travail à chaud',
    category: 'Travail spécialisé',
    description: 'Autorisation pour soudage, découpage, meulage et tout travail générant étincelles ou flammes',
    authority: 'Provincial/Municipal',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '24 heures maximum',
    cost: 'Variable selon municipalité',
    processingTime: 'Immédiat à 24h',
    renewalRequired: true,
    renewalPeriod: 'Quotidien',
    requiredDocuments: [
      'Plan de sécurité incendie',
      'Vérification équipements extinction',
      'Formation personnel',
      'Autorisation superviseur',
      'Analyse des risques'
    ],
    applicableFor: [
      'Soudage et coupage',
      'Meulage et polissage',
      'Travaux de toiture',
      'Maintenance équipements',
      'Démolition partielle'
    ],
    legislation: 'Code sécurité incendie, NFPA 51B, Règlements municipaux',
    contactInfo: {
      website: 'Service incendie local'
    },
    selected: false,
    status: 'pending'
  },
  {
    id: 'confined-space-permit',
    name: 'Permis d\'entrée en espace clos',
    category: 'Travail spécialisé',
    description: 'Autorisation pour travaux dans espaces clos avec atmosphères potentiellement dangereuses',
    authority: 'Employeur/Provincial',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '8 heures maximum',
    cost: 'Interne (formation requise)',
    processingTime: 'Avant chaque entrée',
    renewalRequired: true,
    renewalPeriod: 'Quotidien ou par entrée',
    requiredDocuments: [
      'Tests atmosphériques',
      'Plan de sauvetage',
      'Formation personnel',
      'Équipements détection gaz',
      'Surveillance continue'
    ],
    applicableFor: [
      'Réservoirs et cuves',
      'Égouts et regards',
      'Silos et trémies',
      'Chaudières',
      'Espaces souterrains'
    ],
    legislation: 'RSST Art. 302-317 (QC), Règlement fédéral Partie XI, Codes provinciaux',
    selected: false,
    status: 'pending'
  },
  {
    id: 'excavation-permit',
    name: 'Permis d\'excavation',
    category: 'Construction',
    description: 'Autorisation pour travaux d\'excavation et terrassement',
    authority: 'Municipal',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: 'Durée des travaux',
    cost: '200$ - 2000$ selon ampleur',
    processingTime: '5-15 jours ouvrables',
    renewalRequired: false,
    requiredDocuments: [
      'Plans d\'excavation',
      'Localisation des services publics',
      'Plan de protection des travailleurs',
      'Assurance responsabilité',
      'Études géotechniques si requises'
    ],
    applicableFor: [
      'Fondations bâtiments',
      'Installation services publics',
      'Travaux de drainage',
      'Aménagement paysager',
      'Réparations souterraines'
    ],
    legislation: 'Règlements municipaux, Code de construction',
    contactInfo: {
      website: 'Bureau des permis municipal'
    },
    selected: false,
    status: 'pending'
  },
  {
    id: 'height-work-permit',
    name: 'Permis de travail en hauteur',
    category: 'Travail spécialisé',
    description: 'Autorisation pour travaux à plus de 3 mètres de hauteur',
    authority: 'Employeur/Provincial',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: 'Durée des travaux',
    cost: 'Formation + équipements',
    processingTime: 'Avant début travaux',
    renewalRequired: true,
    renewalPeriod: 'Selon conditions météo',
    requiredDocuments: [
      'Plan de protection contre chutes',
      'Inspection équipements',
      'Formation personnel',
      'Points d\'ancrage certifiés',
      'Conditions météorologiques'
    ],
    applicableFor: [
      'Toitures et charpentes',
      'Échafaudages',
      'Tours et pylônes',
      'Maintenance équipements',
      'Nettoyage de façades'
    ],
    legislation: 'RSST Art. 347, CSA Z259, Codes provinciaux SST',
    selected: false,
    status: 'pending'
  },

  // RADIOPROTECTION
  {
    id: 'radiation-permit',
    name: 'Permis de radioprotection',
    category: 'Radioprotection',
    description: 'Autorisation pour utilisation de substances nucléaires et appareils à rayonnement',
    authority: 'Commission canadienne de sûreté nucléaire (CCSN)',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '1-10 ans selon type',
    cost: '500$ - 50,000$ selon complexité',
    processingTime: '30-180 jours',
    renewalRequired: true,
    renewalPeriod: 'Selon permis',
    requiredDocuments: [
      'Programme de radioprotection',
      'Qualifications personnel',
      'Plans installations',
      'Procédures d\'urgence',
      'Dosimétrie personnel'
    ],
    applicableFor: [
      'Radiographie industrielle',
      'Sources scellées',
      'Appareils médicaux',
      'Jauges nucléaires',
      'Sources de neutrons'
    ],
    legislation: 'Loi sûreté réglementation nucléaires, Règlement radioprotection',
    contactInfo: {
      phone: '1-888-229-2672',
      website: 'https://www.cnsc-ccsn.gc.ca/'
    },
    selected: false,
    status: 'pending'
  },

  // ÉQUIPEMENTS ET MACHINES
  {
    id: 'crane-permit',
    name: 'Permis d\'opération de grue',
    category: 'Équipements',
    description: 'Certification pour opération grues mobiles et tours',
    authority: 'Provincial',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: '3-5 ans',
    cost: '300$ - 1500$ formation + examen',
    processingTime: '2-4 semaines après formation',
    renewalRequired: true,
    renewalPeriod: '3-5 ans',
    requiredDocuments: [
      'Formation certifiée',
      'Examen médical',
      'Expérience documentée',
      'Évaluation pratique',
      'Vérification antécédents'
    ],
    applicableFor: [
      'Grues mobiles',
      'Grues tour',
      'Grues télescopiques',
      'Grues sur chenilles',
      'Grues marines'
    ],
    legislation: 'RSST Art. 260-290, CSA B335, Règlements provinciaux',
    selected: false,
    status: 'pending'
  },
  {
    id: 'scaffolding-permit',
    name: 'Permis d\'échafaudage',
    category: 'Équipements',
    description: 'Autorisation installation et utilisation échafaudages',
    authority: 'Municipal/Provincial',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'high',
    duration: 'Durée des travaux',
    cost: '200$ - 1000$ selon hauteur',
    processingTime: '3-7 jours',
    renewalRequired: false,
    requiredDocuments: [
      'Plans d\'installation',
      'Calculs de charge',
      'Certification monteur',
      'Inspection quotidienne',
      'Assurance responsabilité'
    ],
    applicableFor: [
      'Échafaudages >4 mètres',
      'Structures temporaires',
      'Accès façades',
      'Supports charges',
      'Plates-formes travail'
    ],
    legislation: 'RSST Art. 347-350, CSA S269.2, Règlements municipaux',
    selected: false,
    status: 'pending'
  },

  // CONSTRUCTION ET BÂTIMENT
  {
    id: 'construction-permit',
    name: 'Permis de construction',
    category: 'Construction',
    description: 'Autorisation générale pour travaux de construction',
    authority: 'Municipal',
    province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    required: true,
    priority: 'critical',
    duration: '6 mois - 2 ans',
    cost: '0.5% - 2% valeur projet',
    processingTime: '15-60 jours',
    renewalRequired: true,
    renewalPeriod: 'Si prolongation',
    requiredDocuments: [
      'Plans architecturaux',
      'Plans ingénierie',
      'Conformité zonage',
      'Études environnementales',
      'Assurances',
      'Qualification entrepreneurs'
    ],
    applicableFor: [
      'Nouveaux bâtiments',
      'Agrandissements',
      'Rénovations majeures',
      'Changements d\'usage',
      'Structures temporaires'
    ],
    legislation: 'Code national du bâtiment, Règlements municipaux',
    selected: false,
    status: 'pending'
  }
];

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Permis & Autorisations',
    subtitle: 'Gérez tous les permis requis pour vos travaux au Canada',
    searchPlaceholder: 'Rechercher un permis...',
    allCategories: 'Toutes catégories',
    allProvinces: 'Toutes provinces',
    selectedPermits: 'Permis sélectionnés',
    permitDetails: 'Détails du permis',
    requiredDocs: 'Documents requis',
    applicableFor: 'Applicable pour',
    contactInfo: 'Informations de contact',
    status: 'Statut',
    priority: 'Priorité',
    duration: 'Durée',
    cost: 'Coût',
    processingTime: 'Délai de traitement',
    renewal: 'Renouvellement',
    submitApplication: 'Soumettre demande',
    trackStatus: 'Suivre le statut',
    categories: {
      'Travail spécialisé': 'Travail spécialisé',
      'Construction': 'Construction',
      'Radioprotection': 'Radioprotection',
      'Équipements': 'Équipements',
      'Environnement': 'Environnement',
      'Transport': 'Transport',
      'Sécurité': 'Sécurité',
      'Substances dangereuses': 'Substances dangereuses',
      'Électricité': 'Électricité'
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
    provinces: {
      QC: 'Québec',
      ON: 'Ontario',
      BC: 'Colombie-Britannique',
      AB: 'Alberta',
      SK: 'Saskatchewan',
      MB: 'Manitoba',
      NB: 'Nouveau-Brunswick',
      NS: 'Nouvelle-Écosse',
      PE: 'Île-du-Prince-Édouard',
      NL: 'Terre-Neuve-et-Labrador',
      YT: 'Yukon',
      NT: 'Territoires du Nord-Ouest',
      NU: 'Nunavut'
    },
    summary: {
      totalPermits: 'Permis totaux',
      selected: 'Sélectionnés',
      critical: 'Critiques',
      pending: 'En attente'
    }
  },
  en: {
    title: 'Permits & Authorizations',
    subtitle: 'Manage all permits required for your work across Canada',
    searchPlaceholder: 'Search permit...',
    allCategories: 'All categories',
    allProvinces: 'All provinces',
    selectedPermits: 'Selected permits',
    permitDetails: 'Permit details',
    requiredDocs: 'Required documents',
    applicableFor: 'Applicable for',
    contactInfo: 'Contact information',
    status: 'Status',
    priority: 'Priority',
    duration: 'Duration',
    cost: 'Cost',
    processingTime: 'Processing time',
    renewal: 'Renewal',
    submitApplication: 'Submit application',
    trackStatus: 'Track status',
    categories: {
      'Travail spécialisé': 'Specialized Work',
      'Construction': 'Construction',
      'Radioprotection': 'Radiation Protection',
      'Équipements': 'Equipment',
      'Environnement': 'Environment',
      'Transport': 'Transportation',
      'Sécurité': 'Safety',
      'Substances dangereuses': 'Hazardous Materials',
      'Électricité': 'Electrical'
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
    provinces: {
      QC: 'Quebec',
      ON: 'Ontario',
      BC: 'British Columbia',
      AB: 'Alberta',
      SK: 'Saskatchewan',
      MB: 'Manitoba',
      NB: 'New Brunswick',
      NS: 'Nova Scotia',
      PE: 'Prince Edward Island',
      NL: 'Newfoundland and Labrador',
      YT: 'Yukon',
      NT: 'Northwest Territories',
      NU: 'Nunavut'
    },
    summary: {
      totalPermits: 'Total Permits',
      selected: 'Selected',
      critical: 'Critical',
      pending: 'Pending'
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const t = translations[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [permits, setPermits] = useState<Permit[]>(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return permitsDatabase;
  });

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
  const handlePermitToggle = (permitId: string) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updatePermitField = (permitId: string, field: keyof Permit, value: any) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, [field]: value }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };

  const updateFormData = (updatedPermits: Permit[]) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Travail spécialisé': return '🔥';
      case 'Construction': return '🏗️';
      case 'Radioprotection': return '☢️';
      case 'Équipements': return '⚙️';
      case 'Environnement': return '🌍';
      case 'Transport': return '🚛';
      case 'Sécurité': return '🛡️';
      case 'Substances dangereuses': return '⚠️';
      case 'Électricité': return '⚡';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'submitted': return 'blue';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <>
      {/* CSS pour Step 4 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; }
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
          .permit-card.high::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #f97316; border-radius: 16px 0 0 16px; }
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
          .priority-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; }
          .priority-high { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
          .priority-medium { background: rgba(234, 179, 8, 0.2); color: #facc15; }
          .priority-low { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
          .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
          .status-approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
          .status-submitted { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
          .status-pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }
          .status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; }
          .status-expired { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
          .permit-details { margin-top: 16px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 16px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          .detail-item { font-size: 12px; }
          .detail-label { color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
          .detail-value { color: #ffffff; }
          .required-docs { margin-bottom: 12px; }
          .docs-list { list-style: none; padding: 0; margin: 0; }
          .docs-list li { color: #cbd5e1; font-size: 11px; margin-bottom: 2px; padding-left: 16px; position: relative; }
          .docs-list li::before { content: '•'; color: #60a5fa; position: absolute; left: 0; }
          .applicable-for { margin-bottom: 12px; }
          .applicable-list { display: flex; flex-wrap: wrap; gap: 4px; }
          .applicable-tag { background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .contact-info { margin-bottom: 12px; }
          .contact-link { color: #60a5fa; text-decoration: none; font-size: 11px; }
          .contact-link:hover { text-decoration: underline; }
          .permit-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .permit-input { padding: 6px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 11px; }
          .permit-input:focus { outline: none; border-color: #2563eb; }
          .permit-input[type="date"] { 
            background: rgba(30, 41, 59, 0.9); 
            border: 2px solid rgba(59, 130, 246, 0.3); 
            color: #ffffff; 
          }
          .permit-input[type="date"]::-webkit-calendar-picker-indicator {
            background-color: #2563eb;
            border-radius: 3px;
            cursor: pointer;
            filter: invert(1);
            padding: 2px;
          }
          .permit-select { padding: 6px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 6px; color: #ffffff; font-size: 11px; cursor: pointer; }
          .permit-select:focus { outline: none; border-color: #2563eb; }
          .no-results { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); }
          @media (max-width: 768px) {
            .permits-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .permits-stats { grid-template-columns: repeat(2, 1fr); }
            .details-grid { grid-template-columns: 1fr; }
            .permit-actions { grid-template-columns: 1fr; }
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
              <div className="stat-label">{t.summary.totalPermits}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.selected}</div>
              <div className="stat-label">{t.summary.selected}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">{t.summary.critical}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">{t.summary.pending}</div>
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
              {provinces.map(province => (
                <option key={province} value={province}>
                  {(t.provinces as any)[province] || province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille des permis */}
        <div className="permits-grid">
          {filteredPermits.map(permit => {
            const isSelected = permit.selected;
            
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
                    <span className={`priority-badge priority-${permit.priority}`}>
                      {(t.priorities as any)[permit.priority]}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className={`status-badge status-${permit.status}`}>
                      {(t.statuses as any)[permit.status]}
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

                {/* Détails du permis (si sélectionné) */}
                {isSelected && (
                  <div className="permit-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <div className="detail-label">{t.duration}</div>
                        <div className="detail-value">{permit.duration}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">{t.cost}</div>
                        <div className="detail-value">{permit.cost}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">{t.processingTime}</div>
                        <div className="detail-value">{permit.processingTime}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">{t.renewal}</div>
                        <div className="detail-value">
                          {permit.renewalRequired ? permit.renewalPeriod : 'Non requis'}
                        </div>
                      </div>
                    </div>

                    {/* Documents requis */}
                    <div className="required-docs">
                      <div className="detail-label" style={{ marginBottom: '8px' }}>{t.requiredDocs}:</div>
                      <ul className="docs-list">
                        {permit.requiredDocuments.map((doc, index) => (
                          <li key={index}>{doc}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Applicable pour */}
                    <div className="applicable-for">
                      <div className="detail-label" style={{ marginBottom: '6px' }}>{t.applicableFor}:</div>
                      <div className="applicable-list">
                        {permit.applicableFor.map((item, index) => (
                          <span key={index} className="applicable-tag">{item}</span>
                        ))}
                      </div>
                    </div>

                    {/* Informations de contact */}
                    {permit.contactInfo && (
                      <div className="contact-info">
                        <div className="detail-label" style={{ marginBottom: '6px' }}>{t.contactInfo}:</div>
                        {permit.contactInfo.phone && (
                          <div><Phone size={10} style={{ display: 'inline', marginRight: '4px' }} />
                          <a href={`tel:${permit.contactInfo.phone}`} className="contact-link">
                            {permit.contactInfo.phone}
                          </a></div>
                        )}
                        {permit.contactInfo.website && (
                          <div><Eye size={10} style={{ display: 'inline', marginRight: '4px' }} />
                          <a href={permit.contactInfo.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                            Site web
                          </a></div>
                        )}
                      </div>
                    )}

                    {/* Actions du permis */}
                    <div className="permit-actions">
                      <input
                        type="text"
                        placeholder="Responsable..."
                        value={permit.responsible || ''}
                        onChange={(e) => updatePermitField(permit.id, 'responsible', e.target.value)}
                        className="permit-input"
                        onClick={e => e.stopPropagation()}
                      />
                      <input
                        type="date"
                        value={permit.submissionDate || ''}
                        onChange={(e) => updatePermitField(permit.id, 'submissionDate', e.target.value)}
                        className="permit-input"
                        onClick={e => e.stopPropagation()}
                      />
                      <select
                        value={permit.status}
                        onChange={(e) => updatePermitField(permit.id, 'status', e.target.value)}
                        className="permit-select"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="pending">{(t.statuses as any).pending}</option>
                        <option value="submitted">{(t.statuses as any).submitted}</option>
                        <option value="approved">{(t.statuses as any).approved}</option>
                        <option value="rejected">{(t.statuses as any).rejected}</option>
                        <option value="expired">{(t.statuses as any).expired}</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Numéro de permis..."
                        value={permit.permitNumber || ''}
                        onChange={(e) => updatePermitField(permit.id, 'permitNumber', e.target.value)}
                        className="permit-input"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div className="no-results">
            <FileText size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun permis trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus de permis</p>
          </div>
        )}

        {/* Validation d'erreurs */}
        {errors?.permits && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '12px', 
            padding: '16px', 
            marginTop: '24px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#f87171', 
              marginBottom: '8px', 
              fontWeight: '600' 
            }}>
              <AlertTriangle size={20} />
              Erreurs de validation :
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5' }}>
              {errors.permits.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;
