// =================== STEP4PERMITS VERSION FINALE CORRIGÉE ===================
// Remplacez TOUT le contenu de votre fichier Step4Permits.tsx par ceci :

"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer
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
  complianceLevel: 'basic' | 'standard' | 'enhanced' | 'critical';
  lastUpdated: string;
}

interface FormField {
  id: string;
  type: string;
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
}

interface ComplianceCheck {
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  reference: string;
}

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'fr') {
    return {
      title: 'Permis & Autorisations Conformes 2024-2025',
      subtitle: 'Formulaires authentiques conformes aux dernières normes CNESST, NFPA et municipales',
      searchPlaceholder: 'Rechercher un permis...',
      allCategories: 'Toutes catégories',
      allProvinces: 'Toutes provinces',
      categories: { 'Sécurité': 'Sécurité', 'Construction': 'Construction', 'Radioprotection': 'Radioprotection', 'Équipements': 'Équipements' },
      priorities: { low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' },
      statuses: { pending: 'En attente', submitted: 'Soumis', approved: 'Approuvé', rejected: 'Rejeté', expired: 'Expiré' },
      complianceLevels: { basic: 'Basique', standard: 'Standard', enhanced: 'Renforcé', critical: 'Critique' },
      stats: { available: 'Permis disponibles', selected: 'Sélectionnés', critical: 'Critiques', pending: 'En attente', compliant: 'Conformes', nonCompliant: 'Non conformes' },
      actions: { fill: 'Remplir', close: 'Fermer', preview: 'Aperçu', download: 'PDF', save: 'Sauvegarder', print: 'Imprimer', submit: 'Soumettre', validate: 'Valider conformité', calculate: 'Calculer automatiquement' },
      alerts: { critical: 'CRITIQUE - Action immédiate requise', warning: 'ATTENTION - Vérification nécessaire', info: 'Information importante', danger: 'DANGER - Conditions non sécuritaires' },
      messages: { noResults: 'Aucun permis trouvé', modifySearch: 'Modifiez vos critères de recherche pour voir plus de permis', select: 'Sélectionner...' }
    };
  } else {
    return {
      title: 'Compliant Permits & Authorizations 2024-2025',
      subtitle: 'Authentic forms compliant with latest CNESST, NFPA and municipal standards',
      searchPlaceholder: 'Search permits...',
      allCategories: 'All categories',
      allProvinces: 'All provinces',
      categories: { 'Sécurité': 'Safety', 'Construction': 'Construction', 'Radioprotection': 'Radiation Protection', 'Équipements': 'Equipment' },
      priorities: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' },
      statuses: { pending: 'Pending', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', expired: 'Expired' },
      complianceLevels: { basic: 'Basic', standard: 'Standard', enhanced: 'Enhanced', critical: 'Critical' },
      stats: { available: 'Available permits', selected: 'Selected', critical: 'Critical', pending: 'Pending', compliant: 'Compliant', nonCompliant: 'Non-compliant' },
      actions: { fill: 'Fill', close: 'Close', preview: 'Preview', download: 'PDF', save: 'Save', print: 'Print', submit: 'Submit', validate: 'Validate compliance', calculate: 'Auto-calculate' },
      alerts: { critical: 'CRITICAL - Immediate action required', warning: 'WARNING - Verification needed', info: 'Important information', danger: 'DANGER - Unsafe conditions' },
      messages: { noResults: 'No permits found', modifySearch: 'Modify your search criteria to see more permits', select: 'Select...' }
    };
  }
};

// =================== BASE DE DONNÉES PERMIS ===================
const translatePermitsDatabase = (language: 'fr' | 'en'): Permit[] => {
  return [
    {
      id: 'confined-space-entry-2025',
      name: language === 'fr' ? 'Permis d\'Entrée en Espace Clos Conforme RSST 2023' : 'Confined Space Entry Permit RSST 2023 Compliant',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme aux modifications RSST 2023-2025 avec surveillance atmosphérique continue' : 'Permit compliant with RSST 2023-2025 modifications including continuous atmospheric monitoring',
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
      contactInfo: { phone: '514-355-6190', website: 'https://www.cnesst.gouv.qc.ca', email: 'info@asp-construction.org' },
      selected: false,
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      formFields: [
        { id: 'space_identification', type: 'text', label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification', required: true, section: 'identification', placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...', validation: { legalRequirement: true }, complianceRef: 'RSST Art. 300' },
        { id: 'oxygen_level', type: 'gas_meter', label: language === 'fr' ? 'Niveau oxygène (%)' : 'Oxygen level (%)', required: true, section: 'gas_monitoring', validation: { min: 19.5, max: 23.5, critical: true, legalRequirement: true, message: language === 'fr' ? 'CRITIQUE: O2 doit être entre 19.5% et 23.5%' : 'CRITICAL: O2 must be between 19.5% and 23.5%' }, complianceRef: 'RSST Art. 302 modifié' },
        { id: 'combustible_gas_level', type: 'gas_meter', label: language === 'fr' ? 'Gaz combustibles (% LIE)' : 'Combustible gas (% LEL)', required: true, section: 'gas_monitoring', validation: { min: 0, max: 10, critical: true, legalRequirement: true }, complianceRef: 'RSST Art. 302' }
      ]
    },
    {
      id: 'hot-work-permit-nfpa2019',
      name: language === 'fr' ? 'Permis Travail à Chaud Conforme NFPA 51B-2019' : 'Hot Work Permit NFPA 51B-2019 Compliant',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme NFPA 51B-2019 avec surveillance incendie 1 heure' : 'NFPA 51B-2019 compliant permit with 1-hour fire watch',
      authority: language === 'fr' ? 'Service incendie / Employeur / NFPA' : 'Fire Department / Employer / NFPA',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'critical',
      duration: language === 'fr' ? '24 heures maximum + surveillance 1h post-travaux' : '24 hours maximum + 1h post-work monitoring',
      cost: language === 'fr' ? 'Variable selon municipalité + équipements' : 'Variable by municipality + equipment',
      processingTime: language === 'fr' ? 'Immédiat à 24h + inspections' : 'Immediate to 24h + inspections',
      renewalRequired: true,
      renewalPeriod: language === 'fr' ? 'Quotidien avec réinspection par quart' : 'Daily with shift reinspection',
      legislation: 'NFPA 51B-2019, CNPI Section 5.2, CAN/CSA W117.2-M87',
      contactInfo: { phone: language === 'fr' ? 'Service incendie local' : 'Local fire department' },
      selected: false,
      status: 'pending',
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      formFields: [
        { id: 'work_type_hot', type: 'select', label: language === 'fr' ? 'Type de travail à chaud' : 'Hot work type', required: true, section: 'work_type', options: language === 'fr' ? ['Soudage', 'Découpage', 'Meulage'] : ['Welding', 'Cutting', 'Grinding'], validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019' },
        { id: 'fire_watch_duration', type: 'select', label: language === 'fr' ? 'Durée surveillance incendie POST-TRAVAUX' : 'POST-WORK fire watch duration', required: true, section: 'fire_watch', options: ['1 heure (NFPA 51B-2019)', '2 heures', 'Plus de 2 heures'], validation: { legalRequirement: true }, complianceRef: 'NFPA 51B-2019' }
      ]
    },
    {
      id: 'excavation-permit-municipal-2024',
      name: language === 'fr' ? 'Permis d\'Excavation Conforme Municipal 2024' : 'Municipal Excavation Permit 2024 Compliant',
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 'Permis conforme réglements municipaux 2024 avec calculs automatiques' : 'Municipal regulations 2024 compliant permit with automatic calculations',
      authority: language === 'fr' ? 'Municipal / Ville de Montréal / MAMH' : 'Municipal / City of Montreal / MAMH',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux + période garantie' : 'Work duration + warranty period',
      cost: language === 'fr' ? '200$ - 2000$ + dépôts garantie selon ampleur' : '$200 - $2000 + guarantee deposits by scope',
      processingTime: language === 'fr' ? '2-4 semaines + inspections obligatoires' : '2-4 weeks + mandatory inspections',
      renewalRequired: false,
      legislation: language === 'fr' ? 'Règlements municipaux 2024, Code construction Québec' : 'Municipal regulations 2024, Quebec Building Code',
      contactInfo: { phone: '311', email: 'permis@montreal.ca' },
      selected: false,
      status: 'pending',
      complianceLevel: 'enhanced',
      lastUpdated: '2025-01-20',
      formFields: [
        { id: 'excavation_depth', type: 'number', label: language === 'fr' ? 'Profondeur excavation (m)' : 'Excavation depth (m)', required: true, section: 'excavation', validation: { min: 0, legalRequirement: true } },
        { id: 'info_excavation_request', type: 'checkbox', label: language === 'fr' ? 'Demande Info-Excavation COMPLÉTÉE' : 'Info-Excavation request COMPLETED', required: true, section: 'safety', validation: { legalRequirement: true, critical: true }, complianceRef: 'Loi fédérale' }
      ]
    }
  ];
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({ formData, onDataChange, language = 'fr', tenant, errors }) => {
  const t = getTexts(language);
  
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [expandedForms, setExpandedForms] = useState<{ [key: string]: boolean }>({});
  const [complianceChecks, setComplianceChecks] = useState<{ [key: string]: ComplianceCheck[] }>({});
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);
  
  const [permits, setPermits] = useState(() => {
    if (formData.permits?.list && formData.permits.list.length > 0) {
      return formData.permits.list;
    }
    return translatePermitsDatabase(language);
  });

  // Traduction dynamique
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

  // Validation conformité
  useEffect(() => {
    const alerts: string[] = [];
    const checks: { [key: string]: ComplianceCheck[] } = {};

    permits.forEach((permit: Permit) => {
      if (permit.selected && permit.formData) {
        const permitChecks: ComplianceCheck[] = [];

        if (permit.id === 'confined-space-entry-2025') {
          const o2Level = parseFloat(permit.formData.oxygen_level || '0');
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
        }

        checks[permit.id] = permitChecks;
      }
    });

    setCriticalAlerts(alerts);
    setComplianceChecks(checks);
  }, [permits]);

  // Filtrage
  const filteredPermits = useMemo(() => {
    return permits.filter((permit: Permit) => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Handlers
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
      stats: stats,
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

  // Fonctions utilitaires
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sécurité': case 'Safety': return '🛡️';
      case 'Construction': return '🏗️';
      case 'Radioprotection': case 'Radiation Protection': return '☢️';
      case 'Équipements': case 'Equipment': return '⚙️';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
          
          {/* Stats */}
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

        {/* Alertes critiques */}
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

        {/* Filtres */}
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

        {/* Liste des permis */}
        <div className="space-y-6">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t.messages.noResults}</h3>
              <p className="text-gray-500">{t.messages.modifySearch}</p>
            </div>
          ) : (
            filteredPermits.map((permit: Permit) => (
              <div key={permit.id} className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                permit.selected ? 'border-blue-500 shadow-2xl' : 'border-gray-200'
              }`}>
                
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
                      <button
                        onClick={() => handlePermitToggle(permit.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          permit.selected 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                        }`}
                      >
                        {permit.selected ? (
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

                {/* Contenu du permis sélectionné */}
                {permit.selected && (
                  <div className="p-6 space-y-6">
                    
                    {/* Vérifications de conformité */}
                    {complianceChecks[permit.id] && complianceChecks[permit.id].length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Vérifications de Conformité
                        </h4>
                        <div className="space-y-2">
                          {complianceChecks[permit.id].map((check, index) => (
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

                    {/* Bouton pour étendre le formulaire */}
                    <button
                      onClick={() => toggleFormExpansion(permit.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                    >
                      {expandedForms[permit.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      <span>{expandedForms[permit.id] ? 'Réduire le formulaire' : 'Remplir le formulaire'}</span>
                    </button>

                    {/* Formulaire étendu */}
                    {expandedForms[permit.id] && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                          Informations du Permis
                        </h4>
                        
                        {permit.formFields?.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                              {field.validation?.legalRequirement && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">LÉGAL</span>
                              )}
                            </label>
                            
                            {field.type === 'text' || field.type === 'number' || field.type === 'date' || field.type === 'time' ? (
                              <input
                                type={field.type}
                                value={permit.formData?.[field.id] || ''}
                                onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
                                placeholder={field.placeholder}
                                required={field.required}
                                min={field.validation?.min}
                                max={field.validation?.max}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              />
                            ) : field.type === 'select' ? (
                              <select
                                value={permit.formData?.[field.id] || ''}
                                onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
                                required={field.required}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              >
                                <option value="">{t.messages.select}</option>
                                {field.options?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : field.type === 'checkbox' ? (
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={permit.formData?.[field.id] || false}
                                  onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.checked)}
                                  required={field.required}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </span>
                              </div>
                            ) : field.type === 'gas_meter' ? (
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={permit.formData?.[field.id] || ''}
                                  onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
                                  required={field.required}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  Range: {field.validation?.min || 0} - {field.validation?.max || 100}
                                  {field.validation?.critical && (
                                    <span className="text-red-600 font-medium"> (CRITIQUE)</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={permit.formData?.[field.id] || ''}
                                onChange={(e) => handleFormFieldChange(permit.id, field.id, e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              />
                            )}
                            
                            {field.validation?.message && (
                              <div className={`text-xs ${field.validation.critical ? 'text-red-600' : 'text-gray-500'}`}>
                                {field.validation.message}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Actions */}
                        <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <Save className="w-5 h-5" />
                            <span>{t.actions.save}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <Download className="w-5 h-5" />
                            <span>{t.actions.download}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <Eye className="w-5 h-5" />
                            <span>{t.actions.preview}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Permits;
