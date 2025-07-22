"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge
} from 'lucide-react';

// =================== IMPORTS CONDITIONNELS (évite les erreurs) ===================
let usePermitsHook, useQRCodeHook, useSupabaseHook, ConfinedSpaceFormComponent, AtmosphericSectionComponent;

try {
  const permitsModule = require('./hooks/usePermits');
  usePermitsHook = {
    usePermits: permitsModule.usePermits || (() => [{}, {}]),
    usePermitData: permitsModule.usePermitData || (() => ({ permits: [], loading: false })),
    usePermitValidation: permitsModule.usePermitValidation || (() => ({ validatePermit: () => {}, validationResults: null })),
    useSurveillance: permitsModule.useSurveillance || (() => ({ isActive: false, startSurveillance: () => {}, stopSurveillance: () => {} })),
    useNotifications: permitsModule.useNotifications || (() => ({ notifications: [], addNotification: () => {} }))
  };
} catch (e) {
  console.log('⚠️ usePermits hook not found - using fallbacks');
  usePermitsHook = {
    usePermits: () => [{}, {}],
    usePermitData: () => ({ permits: [], loading: false, addPermit: () => {}, updatePermit: () => {}, deletePermit: () => {} }),
    usePermitValidation: () => ({ validatePermit: () => {}, validationResults: null, isValidating: false }),
    useSurveillance: () => ({ isActive: false, startSurveillance: () => {}, stopSurveillance: () => {}, timeRemaining: 0 }),
    useNotifications: () => ({ notifications: [], addNotification: () => {}, removeNotification: () => {} })
  };
}

try {
  const qrModule = require('./hooks/useQRCode');
  useQRCodeHook = qrModule.useQRCode || (() => ({ 
    createConfinedSpace: () => Promise.resolve(null), 
    generateSpaceQR: () => Promise.resolve(null) 
  }));
} catch (e) {
  console.log('⚠️ useQRCode hook not found - using fallback');
  useQRCodeHook = () => ({ 
    createConfinedSpace: () => Promise.resolve(null), 
    generateSpaceQR: () => Promise.resolve(null),
    isLoading: false,
    error: null
  });
}

try {
  const supabaseModule = require('./hooks/useSupabase');
  useSupabaseHook = supabaseModule.useSupabase || (() => ({ 
    create: () => Promise.resolve({ data: null, error: null }), 
    user: null 
  }));
} catch (e) {
  console.log('⚠️ useSupabase hook not found - using fallback');
  useSupabaseHook = () => ({ 
    create: () => Promise.resolve({ data: null, error: null }), 
    user: null,
    isConnected: false
  });
}

try {
  ConfinedSpaceFormComponent = require('./components/forms/ConfinedSpaceForm').default;
} catch (e) {
  console.log('⚠️ ConfinedSpaceForm not found - using fallback');
  ConfinedSpaceFormComponent = null;
}

try {
  const atmosphericModule = require('./components/forms/shared/AtmosphericSection');
  AtmosphericSectionComponent = atmosphericModule.AtmosphericSection;
} catch (e) {
  console.log('⚠️ AtmosphericSection not found - using fallback');
  AtmosphericSectionComponent = null;
}

// =================== TYPES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
}

interface LegalPermit {
  id: string;
  name: string;
  description: string;
  category: string;
  authority: string;
  province: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData: any;
  code: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  dateCreated: string;
  dateModified: string;
  legalRequirements: any;
  validity: any;
  compliance: Record<string, boolean>;
}

type PermitType = 'espace-clos' | 'travail-chaud' | 'excavation' | 'levage' | 'hauteur' | 'isolation-energetique' | 'pression' | 'radiographie' | 'toiture' | 'demolition';
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

// =================== CONFIGURATION COMPLÈTE ===================
const PERMIT_TYPES_CONFIG = {
  'espace-clos': {
    name: { fr: 'Permis d\'Espace Clos', en: 'Confined Space Permit' },
    icon: Home,
    iconEmoji: '🏠',
    color: '#dc2626',
    riskLevel: 'critical' as const,
    estimatedTime: 45,
    tags: { fr: ['espace', 'atmosphère', 'urgence'], en: ['space', 'atmosphere', 'emergency'] },
    legislation: 'RSST Art. 302-317, CSA Z1006',
    hasForm: true,
    hasBluetooth: true,
    hasAtmospheric: true,
    requiredSections: ['identification', 'personnel', 'atmospheric', 'procedures', 'equipment', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'travail-chaud': {
    name: { fr: 'Permis de Travail à Chaud', en: 'Hot Work Permit' },
    icon: Flame,
    iconEmoji: '🔥',
    color: '#ea580c',
    riskLevel: 'critical' as const,
    estimatedTime: 30,
    tags: { fr: ['soudage', 'feu', 'surveillance'], en: ['welding', 'fire', 'watch'] },
    legislation: 'NFPA 51B, RSST Art. 323',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'fire-safety', 'equipment', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'excavation': {
    name: { fr: 'Permis d\'Excavation', en: 'Excavation Permit' },
    icon: Construction,
    iconEmoji: '🏗️',
    color: '#d97706',
    riskLevel: 'high' as const,
    estimatedTime: 35,
    tags: { fr: ['tranchée', 'effondrement', 'services'], en: ['trench', 'collapse', 'utilities'] },
    legislation: 'RSST Art. 3.20, CSA Z271',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'soil-analysis', 'shoring', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'levage': {
    name: { fr: 'Permis d\'Opérations de Levage', en: 'Lifting Operations Permit' },
    icon: Wrench,
    iconEmoji: '🏗️',
    color: '#059669',
    riskLevel: 'high' as const,
    estimatedTime: 40,
    tags: { fr: ['grue', 'charge', 'stabilité'], en: ['crane', 'load', 'stability'] },
    legislation: 'ASME B30, CSA B335',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'load-analysis', 'crane-setup', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'hauteur': {
    name: { fr: 'Permis de Travail en Hauteur', en: 'Work at Height Permit' },
    icon: Building,
    iconEmoji: '🏢',
    color: '#7c3aed',
    riskLevel: 'critical' as const,
    estimatedTime: 50,
    tags: { fr: ['hauteur', 'harnais', 'chute'], en: ['height', 'harness', 'fall'] },
    legislation: 'RSST Art. 347, CSA Z259',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'fall-protection', 'rescue-plan', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'isolation-energetique': {
    name: { fr: 'Permis d\'Isolation Énergétique', en: 'Energy Isolation Permit' },
    icon: Zap,
    iconEmoji: '⚡',
    color: '#dc2626',
    riskLevel: 'critical' as const,
    estimatedTime: 55,
    tags: { fr: ['tension', 'LOTO', 'arc'], en: ['voltage', 'LOTO', 'arc'] },
    legislation: 'CSA Z462, RSST Art. 185',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'energy-isolation', 'verification', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'pression': {
    name: { fr: 'Permis de Travail sous Pression', en: 'Pressure Work Permit' },
    icon: Gauge,
    iconEmoji: '⚡',
    color: '#b91c1c',
    riskLevel: 'critical' as const,
    estimatedTime: 45,
    tags: { fr: ['pression', 'explosion', 'test'], en: ['pressure', 'explosion', 'test'] },
    legislation: 'CSA B51, RSST',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'pressure-test', 'safety-systems', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'radiographie': {
    name: { fr: 'Permis de Radiographie Industrielle', en: 'Industrial Radiography Permit' },
    icon: Target,
    iconEmoji: '☢️',
    color: '#7c2d12',
    riskLevel: 'critical' as const,
    estimatedTime: 60,
    tags: { fr: ['radiation', 'protection', 'zone'], en: ['radiation', 'protection', 'zone'] },
    legislation: 'CCSN, Transport Canada',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'radiation-safety', 'zone-control', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'toiture': {
    name: { fr: 'Permis de Travail sur Toiture', en: 'Roofing Work Permit' },
    icon: Home,
    iconEmoji: '🏠',
    color: '#0891b2',
    riskLevel: 'high' as const,
    estimatedTime: 35,
    tags: { fr: ['toiture', 'chute', 'météo'], en: ['roofing', 'fall', 'weather'] },
    legislation: 'RSST, CSA Z259',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'weather-check', 'fall-protection', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  },
  'demolition': {
    name: { fr: 'Permis de Démolition', en: 'Demolition Permit' },
    icon: Construction,
    iconEmoji: '🧨',
    color: '#991b1b',
    riskLevel: 'critical' as const,
    estimatedTime: 65,
    tags: { fr: ['démolition', 'structure', 'amiante'], en: ['demolition', 'structure', 'asbestos'] },
    legislation: 'Code du bâtiment, RSST',
    hasForm: false,
    hasBluetooth: false,
    hasAtmospheric: false,
    requiredSections: ['identification', 'personnel', 'structural-analysis', 'hazmat-survey', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  }
} as const;

// =================== GÉNÉRATION PERMIS ===================
const generateAllPermitsWithStructure = (
  province: ProvinceCode, 
  language: 'fr' | 'en',
  tenant: string
): LegalPermit[] => {
  console.log('🚀 Generating all permits with structure for province:', province);
  
  const now = new Date();
  const permits: LegalPermit[] = [];

  Object.entries(PERMIT_TYPES_CONFIG).forEach(([permitType, config]) => {
    if (!config.provinces.includes(province)) return;

    const permit: LegalPermit = {
      id: `${permitType}_${province}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name[language],
      description: `${config.name[language]} - ${config.legislation}`,
      category: config.name[language],
      authority: province === 'QC' ? 'CNESST' : 
                province === 'BC' ? 'WorkSafeBC' : 
                province === 'ON' ? 'MOL' : 'OHS',
      province: [province],
      priority: config.riskLevel,
      selected: false,
      formData: {},
      code: `${permitType.toUpperCase().slice(0, 3)}-${province}-${Date.now().toString().slice(-6)}`,
      status: 'draft',
      dateCreated: now.toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: config.hasAtmospheric,
        entryProcedure: config.hasForm,
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: config.riskLevel === 'critical',
        documentation: true
      },
      validity: {
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      },
      compliance: {
        [province.toLowerCase()]: false
      }
    };

    permits.push(permit);
  });

  return permits;
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "📄 Work Permits & Legal Authorizations",
      subtitle: "Complete Canadian work permits with real-time validation and advanced features",
      searchPlaceholder: "Search permits by type, location, or regulation...",
      allCategories: "All permit types",
      generateQR: "Generate QR Code",
      generatePDF: "Generate PDF",
      savePermit: "Save Permit",
      openForm: "Open Form",
      openBluetooth: "Bluetooth Devices",
      openAtmospheric: "Atmospheric Tests",
      completionRate: "Completion Rate",
      riskLevel: "Risk Level",
      estimatedTime: "Estimated Time",
      minutes: "min",
      selected: "selected",
      total: "total",
      critical: "critical",
      high: "high",
      medium: "medium",
      low: "low",
      formAvailable: "Advanced Form Available",
      bluetoothSupported: "Bluetooth Monitoring",
      atmosphericTesting: "Atmospheric Testing",
      noPermitsFound: "No permits found",
      modifySearch: "Modify your search criteria to see more permits",
      riskLevels: {
        critical: "🔴 Critical",
        high: "🟠 High", 
        medium: "🟡 Medium",
        low: "🟢 Low"
      }
    };
  }
  
  return {
    title: "📄 Permis de Travail & Autorisations Légales",
    subtitle: "Permis de travail canadiens complets avec validation temps réel et fonctionnalités avancées",
    searchPlaceholder: "Rechercher par type, lieu ou réglementation...",
    allCategories: "Tous les types de permis",
    generateQR: "Générer QR Code",
    generatePDF: "Générer PDF",
    savePermit: "Sauvegarder",
    openForm: "Ouvrir Formulaire",
    openBluetooth: "Appareils Bluetooth",
    openAtmospheric: "Tests Atmosphériques",
    completionRate: "Taux de Completion",
    riskLevel: "Niveau de Risque",
    estimatedTime: "Temps Estimé",
    minutes: "min",
    selected: "sélectionnés",
    total: "total",
    critical: "critique",
    high: "élevé",
    medium: "moyen",
    low: "faible",
    formAvailable: "Formulaire Avancé Disponible",
    bluetoothSupported: "Monitoring Bluetooth",
    atmosphericTesting: "Tests Atmosphériques",
    noPermitsFound: "Aucun permis trouvé",
    modifySearch: "Modifiez vos critères de recherche pour voir plus de permis",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    }
  };
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province = 'QC',
  userRole,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  const texts = getTexts(language);
  
  // =================== HOOKS AVEC FALLBACKS ===================
  const { notifications, addNotification } = usePermitsHook.useNotifications();
  const { validatePermit, validationResults, isValidating } = usePermitsHook.usePermitValidation();
  const { isActive: isSurveillanceActive, startSurveillance, stopSurveillance } = usePermitsHook.useSurveillance();
  const qrCodeHook = useQRCodeHook();
  const supabaseHook = useSupabaseHook();
  
  // =================== ÉTAT ===================
  const [permits, setPermits] = useState<LegalPermit[]>(() => {
    console.log('🍁 Initializing permits with complete Canadian structure');
    if (initialPermits && initialPermits.length > 0) {
      return initialPermits;
    }
    return generateAllPermitsWithStructure(province as ProvinceCode, language, tenant);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPermits, setExpandedPermits] = useState<Set<string>>(new Set());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [openFormPermitId, setOpenFormPermitId] = useState<string | null>(null);
  const [showBluetoothModal, setShowBluetoothModal] = useState<string | null>(null);
  const [showAtmosphericModal, setShowAtmosphericModal] = useState<string | null>(null);

  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter(permit => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             permit.category === selectedCategory ||
                             permit.priority === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [permits, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    permits.forEach(permit => {
      cats.add(permit.category);
      cats.add(permit.priority);
    });
    return Array.from(cats);
  }, [permits]);

  // =================== STATISTIQUES ===================
  const stats = useMemo(() => {
    const selectedPermits = permits.filter(p => p.selected);
    return {
      totalPermits: permits.length,
      selectedPermits: selectedPermits.length,
      criticalPermits: selectedPermits.filter(p => p.priority === 'critical').length,
      highRiskPermits: selectedPermits.filter(p => p.priority === 'high').length,
      averageProgress: selectedPermits.length > 0 ? 
        Math.round(selectedPermits.reduce((sum, p) => sum + (p.status === 'approved' ? 100 : p.status === 'pending' ? 50 : 25), 0) / selectedPermits.length) : 0
    };
  }, [permits]);

  // =================== HANDLERS ===================
  const handlePermitToggle = useCallback((permitId: string) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, selected: !permit.selected }
        : permit
    );
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  }, [permits]);

  const handlePermitExpand = useCallback((permitId: string) => {
    setExpandedPermits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permitId)) {
        newSet.delete(permitId);
      } else {
        newSet.add(permitId);
      }
      return newSet;
    });
  }, []);

  const handleGenerateQR = useCallback(async (permit: LegalPermit) => {
    try {
      console.log('📱 Generating QR Code...');
      
      if (qrCodeHook.createConfinedSpace && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const spaceData = {
            name: permit.name,
            type: 'other' as const,
            description: permit.description,
            status: 'active' as const,
            company_id: tenant,
            risk_assessment: permit.priority as any,
            metadata: {
              permitId: permit.id,
              permitCode: permit.code,
              permitType: permit.category
            }
          };

          const address = {
            formattedAddress: `Permis ${permit.code}`,
            city: 'Montreal',
            province: province,
            postalCode: 'H1H 1H1',
            country: 'Canada',
            confidence: 0.95
          };

          const spaceId = await qrCodeHook.createConfinedSpace(
            spaceData,
            position.coords as any,
            address
          );

          if (spaceId) {
            const qrCode = await qrCodeHook.generateSpaceQR(spaceId);
            if (qrCode) {
              addNotification({
                type: 'success',
                message: `QR Code généré pour ${permit.name}`
              });
            }
          }
        });
      } else {
        addNotification({
          type: 'info',
          message: `QR Code simulé pour ${permit.name}`
        });
      }
    } catch (error) {
      console.error('QR Generation error:', error);
      addNotification({
        type: 'error',
        message: `Erreur génération QR: ${error}`
      });
    }
  }, [qrCodeHook, tenant, province, addNotification]);

  const updateFormData = useCallback((updatedPermits: LegalPermit[]) => {
    const selectedList = updatedPermits.filter(p => p.selected);
    
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: selectedList.length,
        criticalPermits: selectedList.filter(p => p.priority === 'critical').length,
        validationRate: stats.averageProgress,
        averageProgress: stats.averageProgress
      }
    };
    
    onDataChange('permits', permitsData);
    
    if (onPermitChange) {
      onPermitChange(selectedList);
    }
  }, [stats, onDataChange, onPermitChange]);

  // =================== RENDU FONCTIONNALITÉS AVANCÉES ===================
  const renderAdvancedFeatures = (permit: LegalPermit) => {
    const permitTypeKey = permit.code.split('-')[0] as keyof typeof PERMIT_TYPES_CONFIG;
    const config = PERMIT_TYPES_CONFIG[permitTypeKey];
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
        {/* Fonctionnalités disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {config?.hasForm && (
            <button
              onClick={() => setOpenFormPermitId(permit.id)}
              className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <FileText size={16} className="text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-blue-800">{texts.openForm}</div>
                <div className="text-blue-600 text-xs">{texts.formAvailable}</div>
              </div>
            </button>
          )}

          {config?.hasBluetooth && (
            <button
              onClick={() => setShowBluetoothModal(permit.id)}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm"
            >
              <Bluetooth size={16} className="text-green-600" />
              <div className="text-left">
                <div className="font-medium text-green-800">{texts.openBluetooth}</div>
                <div className="text-green-600 text-xs">{texts.bluetoothSupported}</div>
              </div>
            </button>
          )}

          {config?.hasAtmospheric && (
            <button
              onClick={() => setShowAtmosphericModal(permit.id)}
              className="flex items-center gap-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors text-sm"
            >
              <Wind size={16} className="text-cyan-600" />
              <div className="text-left">
                <div className="font-medium text-cyan-800">{texts.openAtmospheric}</div>
                <div className="text-cyan-600 text-xs">{texts.atmosphericTesting}</div>
              </div>
            </button>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateQR(permit)}
            className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex-1"
          >
            <Target size={14} />
            {texts.generateQR}
          </button>
          
          <button
            onClick={() => console.log('Save to Supabase:', permit)}
            className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm flex-1"
          >
            <Upload size={14} />
            {texts.savePermit}
          </button>
        </div>

        {/* Sections requises */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Sections requises:</div>
          <div className="grid grid-cols-2 gap-1">
            {config?.requiredSections.map(section => (
              <div
                key={section}
                className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded border"
              >
                <CheckCircle size={12} className="text-green-500" />
                <span className="capitalize">{section.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Réglementation */}
        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
          📋 {config?.legislation} • {permit.authority} • {permit.province.join(', ')}
        </div>
      </div>
    );
  };

  // =================== MODALS ===================
  const renderFormModal = () => {
    if (!openFormPermitId || !ConfinedSpaceFormComponent) return null;

    const permit = permits.find(p => p.id === openFormPermitId);
    if (!permit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <ConfinedSpaceFormComponent
            permitId={permit.id}
            initialData={permit.formData}
            language={language}
            province={province as any}
            userRole={userRole || 'user'}
            touchOptimized={touchOptimized}
            onSave={async (data: any) => {
              const updatedPermits = permits.map(p => 
                p.id === permit.id ? { ...p, formData: data } : p
              );
              setPermits(updatedPermits);
              updateFormData(updatedPermits);
            }}
            onSubmit={async (data: any) => {
              const updatedPermits = permits.map(p => 
                p.id === permit.id ? { ...p, formData: data, status: 'pending' as const } : p
              );
              setPermits(updatedPermits);
              updateFormData(updatedPermits);
              setOpenFormPermitId(null);
            }}
            onCancel={() => setOpenFormPermitId(null)}
          />
        </div>
      </div>
    );
  };

  const renderBluetoothModal = () => {
    if (!showBluetoothModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🔵 Appareils Bluetooth</h3>
            <button
              onClick={() => setShowBluetoothModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <Bluetooth size={48} className="mx-auto mb-4 text-blue-500" />
              <p>Fonctionnalité Bluetooth en développement</p>
              <p className="text-sm">Détection automatique des équipements 4-gaz</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAtmosphericModal = () => {
    if (!showAtmosphericModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🌬️ Tests Atmosphériques</h3>
            <button
              onClick={() => setShowAtmosphericModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {AtmosphericSectionComponent ? (
            <AtmosphericSectionComponent
              data={{
                initialReadings: [],
                continuousMonitoring: { enabled: false, interval: 15, devices: [] },
                limits: { oxygen: { min: 20.5, max: 23.0, critical: 19.5 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } },
                emergencyLimits: { oxygen: { min: 20.5, max: 23.0, critical: 19.5 }, lel: { max: 10, critical: 25 }, h2s: { max: 10, critical: 20 }, co: { max: 35, critical: 200 } },
                ventilationRequired: true
              }}
              onChange={() => {}}
              errors={{}}
              language={language}
              province={province as any}
              permitType="espace-clos"
              touchOptimized={touchOptimized}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wind size={48} className="mx-auto mb-4 text-cyan-500" />
              <p>Section tests atmosphériques en développement</p>
              <p className="text-sm">Monitoring temps réel avec validation provinciale</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
          .header { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; }
          .header::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent); animation: shine 3s ease-in-out infinite; }
          @keyframes shine { 0% { left: -100%; } 50% { left: 100%; } 100% { left: 100%; } }
          .header-title { color: #ef4444; font-size: 20px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
          .header-subtitle { color: #dc2626; font-size: 14px; line-height: 1.5; position: relative; z-index: 1; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; position: relative; z-index: 1; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 16px; border-radius: 12px; transition: all 0.3s ease; backdrop-filter: blur(10px); }
          .stat-item:hover { transform: translateY(-2px); background: rgba(15, 23, 42, 0.8); }
          .stat-value { font-size: 24px; font-weight: 800; color: #ef4444; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #dc2626; font-weight: 600; }
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
          .category-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; min-width: 180px; }
          .category-select:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
          .permits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
          .permit-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
          .permit-card:hover { transform: translateY(-4px); border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); }
          .permit-card.selected { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
          .permit-header { padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.2); }
          .permit-header:hover { background: rgba(30, 41, 59, 0.3); }
          .permit-icon { font-size: 32px; width: 50px; height: 50px; display: flex; align-items: center; justify-center; background: rgba(239, 68, 68, 0.1); border-radius: 12px; }
          .permit-main-info { flex: 1; }
          .permit-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 6px; }
          .permit-code { color: #94a3b8; font-size: 11px; font-weight: 500; margin-bottom: 4px; }
          .permit-authority { color: #60a5fa; font-size: 11px; font-weight: 500; }
          .permit-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
          .permit-status { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .status-draft { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
          .status-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
          .status-approved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
          .permit-checkbox { width: 20px; height: 20px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 4px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .permit-checkbox.checked { background: #ef4444; border-color: #ef4444; color: white; }
          .permit-details { padding: 0; max-height: 0; overflow: hidden; transition: all 0.3s ease; }
          .permit-details.expanded { max-height: 1000px; padding: 0 20px 20px; }
          .expand-icon { color: #94a3b8; transition: transform 0.3s ease; }
          .expand-icon.expanded { transform: rotate(90deg); }
          .risk-badge { padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
          .time-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
          .no-permits { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); backdrop-filter: blur(20px); }
          @media (max-width: 768px) { .permits-grid { grid-template-columns: 1fr; } .search-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        `
      }} />

      <div className="step4-container">
        {/* En-tête avec statistiques */}
        <div className="header">
          <div className="header-title">
            <Shield size={28} />
            {texts.title}
          </div>
          <p className="header-subtitle">
            {texts.subtitle}
          </p>
          
          {stats.selectedPermits > 0 && (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalPermits}</div>
                <div className="stat-label">{texts.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.selectedPermits}</div>
                <div className="stat-label">{texts.selected}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.criticalPermits}</div>
                <div className="stat-label">{texts.critical}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.averageProgress}%</div>
                <div className="stat-label">Progression</div>
              </div>
            </div>
          )}
        </div>

        {/* Section de recherche */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={texts.searchPlaceholder}
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">{texts.allCategories} ({permits.length})</option>
              {categories.map(category => {
                const count = permits.filter(p => p.category === category || p.priority === category).length;
                return (
                  <option key={category} value={category}>
                    {category} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Grille des permis */}
        <div className="permits-grid">
          {filteredPermits.map(permit => {
            const isSelected = permit.selected;
            const isExpanded = expandedPermits.has(permit.id);
            const permitTypeKey = permit.code.split('-')[0] as keyof typeof PERMIT_TYPES_CONFIG;
            const config = PERMIT_TYPES_CONFIG[permitTypeKey];
            
            return (
              <div 
                key={permit.id} 
                className={`permit-card ${isSelected ? 'selected' : ''}`}
              >
                {/* Header du permis */}
                <div className="permit-header">
                  <div className="permit-icon">
                    {config?.iconEmoji || '📄'}
                  </div>
                  
                  <div className="permit-main-info">
                    <h3 className="permit-name">{permit.name}</h3>
                    <div className="permit-code">{permit.code}</div>
                    <div className="permit-authority">{permit.authority}</div>
                  </div>
                  
                  <div className="permit-meta">
                    <div className={`permit-status status-${permit.status}`}>
                      {permit.status}
                    </div>
                    
                    <div
                      className="risk-badge"
                      style={{ 
                        background: `${config?.color || '#6b7280'}20`,
                        color: config?.color || '#6b7280'
                      }}
                    >
                      {texts.riskLevels[permit.priority as keyof typeof texts.riskLevels]}
                    </div>
                    
                    <div className="time-badge">
                      {config?.estimatedTime || 30} {texts.minutes}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className={`permit-checkbox ${isSelected ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermitToggle(permit.id);
                      }}
                    >
                      {isSelected && <CheckCircle size={16} />}
                    </div>
                    
                    <ChevronRight 
                      className={`expand-icon ${isExpanded ? 'expanded' : ''}`} 
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermitExpand(permit.id);
                      }}
                    />
                  </div>
                </div>

                {/* Détails expandables */}
                <div className={`permit-details ${isExpanded ? 'expanded' : ''}`}>
                  {isExpanded && renderAdvancedFeatures(permit)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div className="no-permits">
            <Shield size={48} />
            <h3 style={{ margin: '16px 0 8px', fontSize: '18px', color: '#e2e8f0' }}>
              {texts.noPermitsFound}
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {texts.modifySearch}
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '300px'
          }}>
            {notifications.slice(0, 3).map((notification: any, index: number) => (
              <div
                key={notification.id || `notification-${index}`}
                style={{
                  background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                             notification.type === 'warning' ? 'rgba(251, 191, 36, 0.9)' :
                             'rgba(34, 197, 94, 0.9)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Auto-save indicator */}
        {(isAutoSaving || lastSaved) && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isAutoSaving ? (
              <>
                <Activity size={14} className="animate-spin" />
                Sauvegarde...
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle size={14} />
                Sauvé {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Modals */}
      {renderFormModal()}
      {renderBluetoothModal()}
      {renderAtmosphericModal()}
    </>
  );
};

export default Step4Permits;
