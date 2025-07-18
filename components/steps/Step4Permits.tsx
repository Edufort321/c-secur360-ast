// =================== SECTION 1: INTERFACES ET TRADUCTIONS CORRIGÉES ===================
// À coller au début de votre fichier Step4Permits.tsx

"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, CheckCircle, AlertTriangle, Clock, Download, Eye,
  Shield, Users, MapPin, Calendar, Building, Phone, User, Briefcase,
  Search, Filter, Plus, BarChart3, Star, Award, Zap, HardHat,
  Camera, Save, X, Edit, ChevronDown, ChevronUp, Printer, Mail,
  AlertCircle, ThermometerSun, Gauge, Wind, Hammer, ChevronLeft, 
  ChevronRight, Upload, UserPlus, UserMinus, Grid, List, Trash2
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
  type: string;
  norm: string;
  status: string;
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
  complianceLevel: 'basic' | 'standard' | 'enhanced' | 'critical';
  lastUpdated: string;
  requiredFields: number;
  sections?: any;
  formData?: any;
}

interface WorkerEntry {
  id?: number;
  name: string;
  age: number;
  certification: string;
  phone: string;
  entryTime?: string;
  exitTime?: string | null;
  date?: string;
  oxygenLevel?: number;
  gasLevel?: number;
  over18?: boolean;
}

interface PhotoEntry {
  id?: number;
  url: string;
  name: string;
  timestamp?: string;
  description?: string;
  gpsLocation?: string;
  compliance?: boolean;
  size?: number;
  uploadedAt?: string;
}

interface ComplianceCheck {
  key?: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  details: string;
  reference: string;
  value?: any;
  isValid?: boolean;
  section?: string;
}

// =================== FONCTION DE TRADUCTION BILINGUE OPTIMISÉE MOBILE ===================
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
      stats: {
        available: 'Disponibles',
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
      messages: {
        noResults: 'Aucun permis trouvé',
        modifySearch: 'Modifiez vos critères de recherche',
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
      stats: {
        available: 'Available',
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
      messages: {
        noResults: 'No permits found',
        modifySearch: 'Modify your search criteria',
        savePermit: 'Save Permit',
        downloadPDF: 'Download PDF'
      }
    };
  }
};
// =================== SECTION 2: BASE DE DONNÉES PERMIS CONFORMES 2024-2025 ===================
// À coller après la Section 1

// =================== BASE DE DONNÉES PERMIS CONFORMES AUX NORMES 2024-2025 ===================
const translatePermitsDatabase = (language: 'fr' | 'en'): Permit[] => {
  const basePermits: Permit[] = [
    
    // 1. PERMIS ESPACE CLOS CONFORME RSST 2023-2025
    {
      id: 'confined-space-entry-2025',
      name: language === 'fr' ? 'Permis d\'Entrée en Espace Clos RSST 2023' : 'Confined Space Entry Permit RSST 2023',
      type: language === 'fr' ? 'Espace Clos' : 'Confined Space',
      norm: 'RSST 2023 Art. 297-312',
      status: language === 'fr' ? 'Critique' : 'Critical',
      category: language === 'fr' ? 'Sécurité' : 'Safety',
      description: language === 'fr' ? 'Permis conforme RSST 2023-2025 avec surveillance atmosphérique continue et plan de sauvetage personnalisé' : 'RSST 2023-2025 compliant permit with continuous atmospheric monitoring and personalized rescue plan',
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
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      requiredFields: 27,
      sections: {
        identification: {
          title: language === 'fr' ? 'Identification' : 'Identification',
          fields: [
            {
              key: 'space_identification',
              label: language === 'fr' ? 'Identification de l\'espace clos' : 'Confined space identification',
              type: 'text',
              required: true,
              placeholder: language === 'fr' ? 'Ex: Réservoir A-12, Regard municipal...' : 'Ex: Tank A-12, Municipal manhole...',
              validation: { legalRequirement: true },
              legalRef: 'RSST Art. 300',
              isLegal: true
            },
            {
              key: 'project_name',
              label: language === 'fr' ? 'Nom du projet' : 'Project name',
              type: 'text',
              required: true
            },
            {
              key: 'location_precise',
              label: language === 'fr' ? 'Localisation GPS précise' : 'Precise GPS location',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'permit_date',
              label: language === 'fr' ? 'Date du permis' : 'Permit date',
              type: 'date',
              required: true
            }
          ]
        },
        gas_monitoring: {
          title: language === 'fr' ? 'Surveillance Gaz' : 'Gas Monitoring',
          fields: [
            {
              key: 'oxygen_level',
              label: language === 'fr' ? 'Niveau oxygène (%)' : 'Oxygen level (%)',
              type: 'number',
              required: true,
              validation: {
                min: 19.5,
                max: 23.5,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: O2 doit être entre 19.5% et 23.5%' : 'CRITICAL: O2 must be between 19.5% and 23.5%'
              },
              legalRef: 'RSST Art. 302 modifié',
              isCritical: true
            },
            {
              key: 'combustible_gas_level',
              label: language === 'fr' ? 'Gaz combustibles (% LIE)' : 'Combustible gas (% LEL)',
              type: 'number',
              required: true,
              validation: {
                min: 0,
                max: 10,
                critical: true,
                legalRequirement: true,
                message: language === 'fr' ? 'CRITIQUE: Gaz combustibles < 10% LIE obligatoire' : 'CRITICAL: Combustible gas < 10% LEL mandatory'
              },
              legalRef: 'RSST Art. 302',
              isCritical: true
            }
          ]
        }
      }
    },

    // 2. PERMIS TRAVAIL À CHAUD CONFORME NFPA 51B-2019
    {
      id: 'hot-work-permit-nfpa2019',
      name: language === 'fr' ? 'Permis Travail à Chaud NFPA 51B-2019' : 'Hot Work Permit NFPA 51B-2019',
      type: language === 'fr' ? 'Travail à Chaud' : 'Hot Work',
      norm: 'NFPA 51B-2019',
      status: language === 'fr' ? 'En Attente' : 'Pending',
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
      complianceLevel: 'critical',
      lastUpdated: '2025-01-20',
      requiredFields: 18,
      sections: {
        identification: {
          title: language === 'fr' ? 'Identification' : 'Identification',
          fields: [
            {
              key: 'permit_number_hot',
              label: language === 'fr' ? 'Numéro de permis unique' : 'Unique permit number',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'work_location_precise',
              label: language === 'fr' ? 'Lieu précis des travaux' : 'Precise work location',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            }
          ]
        },
        work_type: {
          title: language === 'fr' ? 'Type de Travail' : 'Work Type',
          fields: [
            {
              key: 'work_type_hot',
              label: language === 'fr' ? 'Type de travail à chaud principal' : 'Primary hot work type',
              type: 'select',
              required: true,
              options: language === 'fr' ? 
                ['Soudage à l\'arc électrique', 'Soudage au gaz', 'Découpage au chalumeau', 'Découpage plasma', 'Meulage avec étincelles', 'Autre'] :
                ['Electric arc welding', 'Gas welding', 'Torch cutting', 'Plasma cutting', 'Grinding with sparks', 'Other'],
              validation: { legalRequirement: true },
              legalRef: 'NFPA 51B-2019'
            }
          ]
        }
      }
    },

    // 3. PERMIS EXCAVATION CONFORME MUNICIPAL 2024
    {
      id: 'excavation-permit-municipal-2024',
      name: language === 'fr' ? 'Permis d\'Excavation Municipal 2024' : 'Municipal Excavation Permit 2024',
      type: language === 'fr' ? 'Excavation' : 'Excavation',
      norm: 'Municipal 2024',
      status: language === 'fr' ? 'En Cours' : 'In Progress',
      category: language === 'fr' ? 'Construction' : 'Construction',
      description: language === 'fr' ? 'Permis conforme réglements municipaux 2024 avec calculs automatiques et assurances obligatoires' : 'Municipal regulations 2024 compliant permit with automatic calculations and mandatory insurance',
      authority: language === 'fr' ? 'Municipal / Ville de Montréal / MAMH' : 'Municipal / City of Montreal / MAMH',
      province: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
      required: true,
      priority: 'high',
      duration: language === 'fr' ? 'Durée des travaux + période garantie' : 'Work duration + warranty period',
      cost: language === 'fr' ? '200$ - 2000$ + dépôts garantie' : '$200 - $2000 + guarantee deposits',
      processingTime: language === 'fr' ? '2-4 semaines + inspections' : '2-4 weeks + inspections',
      renewalRequired: false,
      legislation: language === 'fr' ? 'Règlements municipaux 2024, Code construction Québec' : 'Municipal regulations 2024, Quebec Building Code',
      contactInfo: {
        website: language === 'fr' ? 'Bureau des permis municipal' : 'Municipal permit office',
        phone: '311',
        email: 'permis@montreal.ca'
      },
      selected: false,
      complianceLevel: 'enhanced',
      lastUpdated: '2025-01-20',
      requiredFields: 15,
      sections: {
        applicant: {
          title: language === 'fr' ? 'Demandeur' : 'Applicant',
          fields: [
            {
              key: 'applicant_name_excavation',
              label: language === 'fr' ? 'Nom du demandeur' : 'Applicant name',
              type: 'text',
              required: true,
              validation: { legalRequirement: true }
            },
            {
              key: 'professional_engineer',
              label: language === 'fr' ? 'Ingénieur responsable (OIQ)' : 'Responsible engineer (OIQ)',
              type: 'text',
              required: true,
              validation: { legalRequirement: true },
              isLegal: true
            }
          ]
        },
        excavation: {
          title: language === 'fr' ? 'Excavation' : 'Excavation',
          fields: [
            {
              key: 'excavation_depth_calc',
              label: language === 'fr' ? 'Profondeur excavation (m)' : 'Excavation depth (m)',
              type: 'number',
              required: true,
              validation: { min: 0, legalRequirement: true }
            }
          ]
        }
      }
    }
  ];

  return basePermits;
};
// =================== SECTION 3: COMPOSANT PRINCIPAL + LOGIQUE COMPLÈTE ===================
// À coller après la Section 2

// =================== COMPOSANT PRINCIPAL PREMIUM OPTIMISÉ MOBILE ===================
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
  const [complianceChecks, setComplianceChecks] = useState<{ [permitId: string]: ComplianceCheck[] }>({});

  // =================== INITIALISATION DES PERMIS ===================
  useEffect(() => {
    const translatedPermits = translatePermitsDatabase(language);
    setPermits(translatedPermits);
    
    // Initialiser les données des permis sélectionnés
    translatedPermits.forEach((permit: Permit) => {
      if (permit.selected) {
        initializePermitData(permit.id);
      }
    });
  }, [language]);

  // =================== INITIALISATION DES DONNÉES PERMIS ===================
  const initializePermitData = (permitId: string) => {
    // Initialiser workers
    if (!workers[permitId]) {
      setWorkers(prev => ({
        ...prev,
        [permitId]: [{
          id: 1,
          name: '',
          age: 0,
          certification: '',
          phone: '',
          entryTime: '',
          exitTime: null,
          date: new Date().toISOString().split('T')[0],
          over18: false
        }]
      }));
    }
    
    // Initialiser photos
    if (!photos[permitId]) {
      setPhotos(prev => ({
        ...prev,
        [permitId]: []
      }));
    }
  };

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
        
        if (newSelected) {
          initializePermitData(permitId);
        } else {
          cleanupPermitData(permitId);
        }
        
        return { ...permit, selected: newSelected };
      }
      return permit;
    }));
  };

  const cleanupPermitData = (permitId: string) => {
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
  };

  // =================== GESTION DES TRAVAILLEURS ===================
  const addWorker = (permitId: string) => {
    setWorkers(prev => {
      const currentWorkers = prev[permitId] || [];
      const newWorker: WorkerEntry = {
        id: Math.max(...currentWorkers.map(w => w.id || 0), 0) + 1,
        name: '',
        age: 0,
        certification: '',
        phone: '',
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
          }
          
          return updatedWorker;
        }
        return worker;
      })
    }));
  };

  // =================== SAUVEGARDE DES DONNÉES ===================
  const saveProgress = (permitId: string) => {
    const permitData = {
      workers: workers[permitId] || [],
      photos: photos[permitId] || [],
      complianceChecks: complianceChecks[permitId] || [],
      lastSaved: new Date().toISOString()
    };
    
    onDataChange('permits', {
      ...formData.permits,
      [permitId]: permitData
    });
  };

  // =================== RENDU DU COMPOSANT PRINCIPAL ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        
        {/* En-tête avec titre et statistiques PREMIUM */}
        <div className="mb-6 lg:mb-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="relative inline-block">
              <h1 className="text-2xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 lg:mb-3">
                {t.title}
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 blur-3xl opacity-20 -z-10"></div>
            </div>
            <p className="text-gray-300 text-sm lg:text-lg max-w-4xl mx-auto leading-relaxed px-4">
              {t.subtitle}
            </p>
          </div>

          {/* Statistiques temps réel PREMIUM - Layout mobile optimisé */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4 mb-6 lg:mb-8">
            {[
              { value: stats.available, label: t.stats.available, color: 'from-blue-500 to-cyan-500', icon: '📊' },
              { value: stats.selected, label: t.stats.selected, color: 'from-green-500 to-emerald-500', icon: '✅' },
              { value: stats.critical, label: t.stats.critical, color: 'from-red-500 to-rose-500', icon: '🚨' },
              { value: stats.pending, label: t.stats.pending, color: 'from-yellow-500 to-orange-500', icon: '⏳' },
              { value: stats.compliant, label: t.stats.compliant, color: 'from-green-500 to-teal-500', icon: '🛡️' },
              { value: stats.nonCompliant, label: t.stats.nonCompliant, color: 'from-red-500 to-pink-500', icon: '⚠️' }
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl lg:rounded-2xl blur-lg lg:blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-lg lg:text-4xl mb-1 lg:mb-2">{stat.icon}</div>
                    <div className={`text-xl lg:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de recherche PREMIUM - Mobile optimisée */}
          <div className="relative group mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl lg:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/20 p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-hover/search:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
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
                  className="w-full px-4 py-3 lg:py-4 bg-white/10 border border-white/20 rounded-xl lg:rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm lg:text-base"
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
        <div className="space-y-4 lg:space-y-8">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="relative inline-block">
                <FileText className="w-16 h-16 lg:w-24 lg:h-24 mx-auto text-gray-400 mb-4 lg:mb-6" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-20"></div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-300 mb-2 lg:mb-3">{t.messages.noResults}</h3>
              <p className="text-gray-400 text-base lg:text-lg">{t.messages.modifySearch}</p>
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
                onToggle={() => togglePermit(permit.id)}
                onExpand={() => expandPermit(permit.id)}
                onFieldChange={(fieldId, value) => handleFieldChange(permit.id, fieldId, value)}
                onAddWorker={() => addWorker(permit.id)}
                onRemoveWorker={(workerId) => removeWorker(permit.id, workerId)}
                onUpdateWorker={(workerId, field, value) => updateWorker(permit.id, workerId, field, value)}
                onSaveProgress={() => saveProgress(permit.id)}
                t={t}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                getComplianceColor={getComplianceColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
// =================== SECTION 4: COMPOSANT PERMITCARD ULTRA-PREMIUM ===================
// À coller après la Section 3

// =================== INTERFACE PERMITCARD ===================
interface PermitCardProps {
  permit: Permit;
  isSelected: boolean;
  isExpanded: boolean;
  complianceChecks: ComplianceCheck[];
  workers: WorkerEntry[];
  photos: PhotoEntry[];
  onToggle: () => void;
  onExpand: () => void;
  onFieldChange: (fieldId: string, value: any) => void;
  onAddWorker: () => void;
  onRemoveWorker: (workerId: number) => void;
  onUpdateWorker: (workerId: number, field: keyof WorkerEntry, value: any) => void;
  onSaveProgress: () => void;
  t: any;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getComplianceColor: (level: string) => string;
  getCategoryIcon: (category: string) => string;
}

// =================== COMPOSANT PERMITCARD ULTRA-PREMIUM ===================
const PermitCard: React.FC<PermitCardProps> = ({
  permit,
  isSelected,
  isExpanded,
  complianceChecks,
  workers,
  photos,
  onToggle,
  onExpand,
  onFieldChange,
  onAddWorker,
  onRemoveWorker,
  onUpdateWorker,
  onSaveProgress,
  t,
  getPriorityColor,
  getStatusColor,
  getComplianceColor,
  getCategoryIcon
}) => {
  const [currentSection, setCurrentSection] = useState('identification');
  const hasViolations = complianceChecks.some(check => check.status === 'non-compliant');

  // =================== MODAL FORMULAIRE PREMIUM ===================
  const renderFormModal = () => {
    if (!isExpanded) return null;

    const sections = permit.sections ? Object.keys(permit.sections) : ['identification'];

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 backdrop-blur-3xl border border-white/20 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
          
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-cyan-500/15 backdrop-blur-2xl border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getCategoryIcon(permit.category)}</div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {permit.name}
                  </h2>
                  <p className="text-gray-300 text-sm">{permit.description}</p>
                </div>
              </div>
              <button
                onClick={onExpand}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/10 backdrop-blur-2xl border border-red-500/30 text-red-400 hover:scale-110 transition-all duration-300 flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Navigation sections */}
            <div className="flex gap-2 mt-6 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setCurrentSection(section)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                    currentSection === section
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/20 text-blue-400 border border-blue-500/50 shadow-lg'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu du formulaire */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {currentSection === 'workers' ? (
              <WorkerSection 
                workers={workers}
                onAddWorker={onAddWorker}
                onRemoveWorker={onRemoveWorker}
                onUpdateWorker={onUpdateWorker}
                t={t}
              />
            ) : currentSection === 'photos' ? (
              <PhotoSection 
                photos={photos}
                t={t}
              />
            ) : (
              <FormSection
                permit={permit}
                section={currentSection}
                onFieldChange={onFieldChange}
                t={t}
              />
            )}
          </div>

          {/* Footer actions */}
          <div className="bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-2xl border-t border-white/20 p-6">
            <div className="flex justify-between items-center">
              <button className="px-6 py-3 bg-gradient-to-r from-gray-500/30 to-gray-600/20 text-gray-300 rounded-xl border border-gray-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <ChevronLeft size={18} />
                Précédent
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={onSaveProgress}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Save size={18} />
                  {t.actions.save}
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-green-500/30 to-emerald-500/20 text-green-400 rounded-xl border border-green-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =================== CARTE PRINCIPALE ===================
  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer p-6 backdrop-blur-2xl ${
          isSelected
            ? 'bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-cyan-500/15 border border-blue-500/50 shadow-2xl shadow-blue-500/25'
            : 'bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 border border-white/10 hover:border-blue-500/30'
        }`}
        onClick={onToggle}
        style={{
          transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        {/* Indicateur priorité critique */}
        {permit.priority === 'critical' && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-l-2xl"></div>
        )}

        {/* Header carte */}
        <div className="flex items-start gap-4 mb-6">
          <div className="text-3xl filter drop-shadow-lg">
            {getCategoryIcon(permit.category)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">
              {permit.name}
            </h3>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {permit.category}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {permit.description}
            </p>
            <div className="text-blue-400 text-xs font-semibold">
              {permit.authority}
            </div>
            <div className="flex gap-2 items-center mt-2">
              <span 
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${getComplianceColor(permit.complianceLevel)}20`,
                  color: getComplianceColor(permit.complianceLevel)
                }}
              >
                {permit.complianceLevel.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                {permit.lastUpdated}
              </span>
            </div>
          </div>
          
          {/* Checkbox premium */}
          <div className={`w-7 h-7 border-2 rounded-lg backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            isSelected 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 text-white scale-110' 
              : 'border-gray-500 bg-slate-800/50'
          }`}>
            {isSelected && <CheckCircle size={18} />}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs">
            <span 
              className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${getPriorityColor(permit.priority)}20`,
                color: getPriorityColor(permit.priority)
              }}
            >
              {permit.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span 
              className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${getStatusColor(permit.status)}20`,
                color: getStatusColor(permit.status)
              }}
            >
              {permit.status}
            </span>
          </div>
          {hasViolations && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-red-500/20 text-red-400 animate-pulse">
                ⚠️ NON CONFORME
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            {permit.processingTime}
          </div>
        </div>

        {/* Actions (visible si sélectionné) */}
        {isSelected && (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <Edit size={16} />
              {t.actions.fill}
            </button>
            
            <button className="px-4 py-3 bg-gradient-to-r from-gray-500/30 to-gray-600/20 text-gray-300 rounded-xl border border-gray-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              <Shield size={16} />
              {t.actions.validate}
            </button>
            
            <button className="px-4 py-3 bg-gradient-to-r from-gray-500/30 to-gray-600/20 text-gray-300 rounded-xl border border-gray-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              <Download size={16} />
              {t.actions.download}
            </button>
          </div>
        )}
      </div>

      {/* Modal du formulaire */}
      {renderFormModal()}
    </>
  );
};
// =================== SECTION 5: COMPOSANTS FORMULAIRE ULTRA-PREMIUM ===================
// À coller après la Section 4

// =================== COMPOSANT FORM SECTION ===================
const FormSection: React.FC<{
  permit: Permit;
  section: string;
  onFieldChange: (fieldId: string, value: any) => void;
  t: any;
}> = ({ permit, section, onFieldChange, t }) => {
  const sectionData = permit.sections?.[section];
  
  if (!sectionData || !sectionData.fields) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
        <p className="text-gray-400">Section en cours de développement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
        {sectionData.title}
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectionData.fields.map((field: any) => (
          <FormField
            key={field.key}
            field={field}
            value={permit.formData?.[field.key] || ''}
            onChange={(value) => onFieldChange(field.key, value)}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

// =================== COMPOSANT FORM FIELD ===================
const FormField: React.FC<{
  field: any;
  value: any;
  onChange: (value: any) => void;
  t: any;
}> = ({ field, value, onChange, t }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = field.required && !value;
  const isCritical = field.validation?.critical;
  const isLegal = field.validation?.legalRequirement;

  const renderField = () => {
    const baseClasses = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm text-white placeholder-gray-400 ${
      isFocused 
        ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/5 shadow-lg shadow-blue-500/25' 
        : hasError 
          ? 'border-red-500/50 bg-gradient-to-r from-red-500/10 to-pink-500/5' 
          : 'border-white/20 bg-gradient-to-r from-slate-800/50 to-slate-700/30 hover:border-blue-500/30'
    }`;

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={baseClasses}
            required={field.required}
          >
            <option value="" className="bg-slate-800 text-white">
              {t.messages?.select || 'Sélectionner...'}
            </option>
            {field.options?.map((option: string) => (
              <option key={option} value={option} className="bg-slate-800 text-white">
                {option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={field.placeholder}
            className={`${baseClasses} min-h-[120px] resize-none`}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gradient-to-r from-slate-800/30 to-slate-700/20 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(e.target.checked)}
              className="hidden"
            />
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              value ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500 shadow-lg' : 'border-gray-500 bg-slate-800/50'
            }`}>
              {value && <CheckCircle size={16} className="text-white" />}
            </div>
            <span className="text-white font-medium">{field.label}</span>
          </label>
        );

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseClasses}
              required={field.required}
            />
            {field.validation && value && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {(() => {
                  const numValue = parseFloat(value) || 0;
                  const min = field.validation.min || 0;
                  const max = field.validation.max || 100;
                  const isValid = numValue >= min && numValue <= max;
                  
                  return isValid ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400 animate-pulse" />
                  );
                })()}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-200 flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-400">*</span>}
        {isCritical && (
          <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md animate-pulse">
            🚨 CRITIQUE
          </span>
        )}
        {isLegal && (
          <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md">
            ⚖️ LÉGAL
          </span>
        )}
      </label>
      
      {renderField()}
      
      {hasError && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} />
          Ce champ est requis
        </p>
      )}
      
      {field.validation?.message && (
        <p className="text-blue-400 text-xs">
          {field.validation.message}
        </p>
      )}
      
      {field.legalRef && (
        <p className="text-green-400 text-xs font-medium">
          📋 Référence: {field.legalRef}
        </p>
      )}
    </div>
  );
};

// =================== COMPOSANT WORKER SECTION ===================
const WorkerSection: React.FC<{
  workers: WorkerEntry[];
  onAddWorker: () => void;
  onRemoveWorker: (workerId: number) => void;
  onUpdateWorker: (workerId: number, field: keyof WorkerEntry, value: any) => void;
  t: any;
}> = ({ workers, onAddWorker, onRemoveWorker, onUpdateWorker, t }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
          👥 Travailleurs Autorisés ({workers.length})
        </h3>
        <button
          onClick={() => {
            onAddWorker();
            setShowAddForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-green-500/30 to-emerald-500/20 text-green-400 rounded-xl border border-green-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={16} />
          Ajouter Travailleur
        </button>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-r from-slate-800/30 to-slate-700/20 rounded-2xl border border-white/10">
          <Users size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
          <p className="text-gray-400 mb-2">Aucun travailleur enregistré</p>
          <p className="text-gray-500 text-sm">Cliquez sur "Ajouter Travailleur" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onUpdate={(field, value) => onUpdateWorker(worker.id!, field, value)}
              onRemove={() => onRemoveWorker(worker.id!)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT WORKER CARD ===================
const WorkerCard: React.FC<{
  worker: WorkerEntry;
  onUpdate: (field: keyof WorkerEntry, value: any) => void;
  onRemove: () => void;
  t: any;
}> = ({ worker, onUpdate, onRemove, t }) => {
  const isMinor = worker.age > 0 && worker.age < 18;
  
  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
      isMinor 
        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/10 border-2 border-red-500/50 animate-pulse' 
        : 'bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-white/10 hover:border-blue-500/30'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isMinor 
              ? 'bg-gradient-to-r from-red-500/30 to-pink-500/20' 
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/20'
          }`}>
            <User size={24} className={isMinor ? 'text-red-400' : 'text-blue-400'} />
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">
              {worker.name || `Travailleur #${worker.id}`}
            </h4>
            <p className="text-gray-300 text-sm">
              {worker.age > 0 ? `${worker.age} ans` : 'Âge non spécifié'} • {worker.certification || 'Certification non spécifiée'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isMinor && (
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-lg animate-pulse">
              ⚠️ MINEUR - INTERDIT
            </span>
          )}
          <button
            onClick={onRemove}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 hover:scale-110"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Nom complet</label>
          <input
            type="text"
            value={worker.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Nom du travailleur"
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-500/50 transition-all duration-300"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Âge {isMinor && <span className="text-red-400 font-bold">(⚠️ < 18 ans)</span>}
          </label>
          <input
            type="number"
            value={worker.age || ''}
            onChange={(e) => onUpdate('age', parseInt(e.target.value) || 0)}
            placeholder="Âge"
            min="16"
            max="70"
            className={`w-full px-3 py-2 rounded-lg text-white placeholder-gray-400 transition-all duration-300 ${
              isMinor 
                ? 'bg-red-500/20 border-2 border-red-500/50' 
                : 'bg-slate-800/50 border border-white/20 focus:border-blue-500/50'
            }`}
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Certification SST</label>
          <select
            value={worker.certification}
            onChange={(e) => onUpdate('certification', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-blue-500/50 transition-all duration-300"
          >
            <option value="" className="bg-slate-800">Sélectionner...</option>
            <option value="Formation de base" className="bg-slate-800">Formation de base</option>
            <option value="Formation avancée" className="bg-slate-800">Formation avancée</option>
            <option value="Superviseur" className="bg-slate-800">Superviseur</option>
            <option value="Sauveteur" className="bg-slate-800">Sauveteur</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Heure d'entrée</label>
          <input
            type="time"
            value={worker.entryTime || ''}
            onChange={(e) => onUpdate('entryTime', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-blue-500/50 transition-all duration-300"
          />
        </div>
      </div>

      {isMinor && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertTriangle size={16} />
            VIOLATION LÉGALE: L'entrée en espace clos est interdite aux mineurs (RSST Art. 298)
          </div>
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT PHOTO SECTION ===================
const PhotoSection: React.FC<{
  photos: PhotoEntry[];
  t: any;
}> = ({ photos, t }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Logique d'upload des photos à implémenter
    console.log('Photos déposées:', e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
        📸 Galerie Photos ({photos.length})
      </h3>

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragOver 
            ? 'border-blue-500/50 bg-blue-500/10' 
            : 'border-white/20 bg-gradient-to-r from-slate-800/30 to-slate-700/20 hover:border-blue-500/30'
        }`}
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-300 mb-2">Glissez vos photos ici ou</p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/20 text-blue-400 rounded-xl border border-blue-500/30 hover:scale-105 transition-all duration-300">
          📂 Parcourir les fichiers
        </button>
      </div>

      {/* Grille des photos */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-800/50 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <img
                src={photo.url}
                alt={photo.description}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Eye size={20} className="text-white" />
                </button>
              </div>
              <button className="absolute top-2 right-2 p-1 bg-red-500/20 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-r from-slate-800/30 to-slate-700/20 rounded-2xl border border-white/10">
          <Camera size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
          <p className="text-gray-400 mb-2">Aucune photo ajoutée</p>
          <p className="text-gray-500 text-sm">Glissez des photos ou cliquez sur "Parcourir"</p>
        </div>
      )}
    </div>
  );
};

// =================== EXPORT DU COMPOSANT PRINCIPAL ===================
export default Step4Permits;
      
