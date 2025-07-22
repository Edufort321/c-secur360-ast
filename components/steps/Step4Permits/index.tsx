"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge
} from 'lucide-react';

// =================== IMPORTS CONDITIONNELS SÉCURISÉS ===================
// Utilise tes vrais hooks existants
let usePermitsHook: any, useQRCodeHook: any, useSupabaseHook: any, ConfinedSpaceFormComponent: any, AtmosphericSectionComponent: any;

try {
  // Tes vrais hooks individuels
  const usePermitsModule = require('./hooks/usePermits');
  const useQRCodeModule = require('./hooks/useQRCode');
  const useSupabaseModule = require('./hooks/useSupabase');
  const useBluetoothModule = require('./hooks/useBluetooth');
  const useGeolocationModule = require('./hooks/useGeolocation');
  const useHapticsModule = require('./hooks/useHaptics');
  const useSignatureModule = require('./hooks/useSignature');
  const useTimersModule = require('./hooks/useTimers');
  const useVoiceInputModule = require('./hooks/useVoiceInput');
  
  usePermitsHook = {
    usePermits: usePermitsModule.usePermits || usePermitsModule.default,
    // Créer des hooks composés à partir de tes hooks individuels
    usePermitData: () => ({ permits: [], loading: false, addPermit: () => {}, updatePermit: () => {}, deletePermit: () => {} }),
    usePermitValidation: () => ({ validatePermit: () => {}, validationResults: null, isValidating: false }),
    useSurveillance: useTimersModule.useTimers || (() => ({ isActive: false, startSurveillance: () => {}, stopSurveillance: () => {} })),
    useNotifications: () => ({ notifications: [], addNotification: () => {}, removeNotification: () => {} })
  };
  
  useQRCodeHook = useQRCodeModule.useQRCode || useQRCodeModule.default;
  useSupabaseHook = useSupabaseModule.useSupabase || useSupabaseModule.default;
  
  console.log('✅ Hooks chargés avec succès:', {
    usePermits: !!usePermitsHook.usePermits,
    useQRCode: !!useQRCodeHook,
    useSupabase: !!useSupabaseHook
  });
  
} catch (e) {
  console.log('⚠️ Hooks non trouvés, utilisation des fallbacks:', e.message);
  usePermitsHook = {
    usePermits: () => [[], {}],
    usePermitData: () => ({ permits: [], loading: false, addPermit: () => {}, updatePermit: () => {}, deletePermit: () => {} }),
    usePermitValidation: () => ({ validatePermit: () => {}, validationResults: null, isValidating: false }),
    useSurveillance: () => ({ isActive: false, startSurveillance: () => {}, stopSurveillance: () => {} }),
    useNotifications: () => ({ notifications: [], addNotification: () => {}, removeNotification: () => {} })
  };
  
  useQRCodeHook = () => ({ 
    createConfinedSpace: () => Promise.resolve(null), 
    generateSpaceQR: () => Promise.resolve(null),
    isLoading: false,
    error: null
  });
  
  useSupabaseHook = () => ({ 
    create: () => Promise.resolve({ data: null, error: null }), 
    user: null,
    isConnected: false
  });
}

try {
  ConfinedSpaceFormComponent = require('./components/forms/ConfinedSpaceForm').default;
} catch (e) {
  console.log('⚠️ ConfinedSpaceForm non trouvé');
  ConfinedSpaceFormComponent = null;
}

try {
  AtmosphericSectionComponent = require('./components/forms/shared/AtmosphericSection').AtmosphericSection;
} catch (e) {
  console.log('⚠️ AtmosphericSection non trouvé');
  AtmosphericSectionComponent = null;
}

// Types de ta structure
import type { 
  LegalPermit, 
  PermitType, 
  ProvinceCode, 
  PermitFormData,
  FormValidationResult 
} from './hooks/usePermits';

import type { 
  ConfinedSpaceRow,
  QRCodeRow 
} from './hooks/useQRCode';

// =================== TYPES LOCAUX ===================
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

interface BilingualText {
  fr: string;
  en: string;
}

// =================== CONFIGURATION TYPES PERMIS COMPLETS ===================
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
    formComponent: ConfinedSpaceForm,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
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
    formComponent: null,
    requiredSections: ['identification', 'personnel', 'structural-analysis', 'hazmat-survey', 'validation'],
    provinces: ['QC', 'ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as ProvinceCode[]
  }
} as const;

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "Work Permits & Legal Authorizations",
      subtitle: "Complete Canadian work permits with real-time validation and QR code generation",
      searchPlaceholder: "Search permits by type, location, or regulation...",
      allCategories: "All permit types",
      expandPermit: "Click to view and edit details",
      collapsePermit: "Click to collapse",
      generateQR: "Generate QR Code",
      generatePDF: "Generate PDF",
      savePermit: "Save Permit",
      openForm: "Open Form",
      completionRate: "Completion Rate",
      riskLevel: "Risk Level",
      estimatedTime: "Estimated Time",
      minutes: "min",
      requiredSections: "Required Sections",
      bluetoothDevices: "Bluetooth Devices",
      scanDevices: "Scan Devices",
      connectDevice: "Connect Device",
      takePhoto: "Take Photo",
      getLocation: "Get Location",
      voiceInput: "Voice Input",
      uploadDocument: "Upload Document",
      exportData: "Export Data",
      lastSaved: "Last saved",
      autoSaving: "Auto-saving...",
      validationErrors: "Validation errors",
      permitExpired: "⚠️ Permit Expired",
      permitValid: "✅ Valid Permit",
      permitDraft: "📝 Draft Permit",
      riskLevels: {
        critical: "🔴 Critical",
        high: "🟠 High", 
        medium: "🟡 Medium",
        low: "🟢 Low"
      }
    };
  }
  
  return {
    title: "Permis de Travail & Autorisations Légales",
    subtitle: "Permis de travail canadiens complets avec validation temps réel et génération QR",
    searchPlaceholder: "Rechercher par type, lieu ou réglementation...",
    allCategories: "Tous les types de permis",
    expandPermit: "Cliquer pour voir et modifier les détails",
    collapsePermit: "Cliquer pour fermer",
    generateQR: "Générer QR Code",
    generatePDF: "Générer PDF",
    savePermit: "Sauvegarder",
    openForm: "Ouvrir Formulaire",
    completionRate: "Taux de Completion",
    riskLevel: "Niveau de Risque",
    estimatedTime: "Temps Estimé",
    minutes: "min",
    requiredSections: "Sections Requises",
    bluetoothDevices: "Appareils Bluetooth",
    scanDevices: "Scanner Appareils",
    connectDevice: "Connecter Appareil",
    takePhoto: "Prendre Photo",
    getLocation: "Obtenir Position",
    voiceInput: "Saisie Vocale",
    uploadDocument: "Télécharger Document",
    exportData: "Exporter Données",
    lastSaved: "Dernière sauvegarde",
    autoSaving: "Sauvegarde auto...",
    validationErrors: "Erreurs de validation",
    permitExpired: "⚠️ Permis Expiré",
    permitValid: "✅ Permis Valide",
    permitDraft: "📝 Brouillon",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    }
  };
};

// =================== GÉNÉRATION PERMIS AVEC TA STRUCTURE ===================
const generateAllPermitsWithStructure = (
  province: ProvinceCode, 
  language: 'fr' | 'en',
  tenant: string
): LegalPermit[] => {
  console.log('🚀 Generating all permits with real structure for province:', province);
  
  const now = new Date();
  const permits: LegalPermit[] = [];

  // Générer tous les types de permis de ta structure
  Object.entries(PERMIT_TYPES_CONFIG).forEach(([permitType, config]) => {
    // Vérifier si disponible dans cette province
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

      // Exigences légales basées sur le type de permis
      legalRequirements: generateLegalRequirements(permitType as PermitType, province, language),

      validity: {
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + getPermitValidityDuration(permitType as PermitType)).toISOString(),
        isValid: false
      },

      compliance: {
        [province.toLowerCase()]: false
      }
    };

    permits.push(permit);
    console.log(`✅ Generated permit: ${permit.name} (${permit.code})`);
  });

  return permits;
};

// Génération des exigences légales par type de permis
const generateLegalRequirements = (permitType: PermitType, province: ProvinceCode, language: 'fr' | 'en') => {
  const baseRequirements = {
    permitRequired: true,
    atmosphericTesting: false,
    entryProcedure: false,
    emergencyPlan: true,
    equipmentCheck: true,
    attendantRequired: false,
    documentation: true
  };

  switch (permitType) {
    case 'espace-clos':
      return {
        ...baseRequirements,
        atmosphericTesting: true,
        entryProcedure: true,
        attendantRequired: true
      };
    case 'travail-chaud':
      return {
        ...baseRequirements,
        fireWatch: true,
        areaClearing: true,
        extinguishersReady: true
      };
    case 'excavation':
      return {
        ...baseRequirements,
        soilAnalysis: true,
        utilityLocate: true,
        shoringRequired: true
      };
    case 'hauteur':
      return {
        ...baseRequirements,
        fallProtection: true,
        rescuePlan: true,
        weatherCheck: true
      };
    case 'isolation-energetique':
      return {
        ...baseRequirements,
        energyIsolation: true,
        lockoutTagout: true,
        zeroEnergyVerification: true
      };
    default:
      return baseRequirements;
  }
};

// Durée de validité par type de permis
const getPermitValidityDuration = (permitType: PermitType): number => {
  const durations = {
    'espace-clos': 24 * 60 * 60 * 1000,      // 24h
    'travail-chaud': 8 * 60 * 60 * 1000,     // 8h
    'excavation': 7 * 24 * 60 * 60 * 1000,   // 7 jours
    'levage': 24 * 60 * 60 * 1000,           // 24h
    'hauteur': 24 * 60 * 60 * 1000,          // 24h
    'isolation-energetique': 8 * 60 * 60 * 1000, // 8h
    'pression': 24 * 60 * 60 * 1000,         // 24h
    'radiographie': 7 * 24 * 60 * 60 * 1000, // 7 jours
    'toiture': 24 * 60 * 60 * 1000,          // 24h
    'demolition': 30 * 24 * 60 * 60 * 1000   // 30 jours
  };
  return durations[permitType] || 24 * 60 * 60 * 1000;
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
  
  // =================== HOOKS AVEC TA STRUCTURE (sécurisés) ===================
  const { notifications, addNotification } = usePermitsHook.useNotifications();
  const { validatePermit, validationResults, isValidating } = usePermitsHook.usePermitValidation();
  const { isActive: isSurveillanceActive, startSurveillance, stopSurveillance } = usePermitsHook.useSurveillance();
  
  // Hook QR Code avec ta structure
  const qrCodeHook = useQRCodeHook();
  
  // Hook Supabase avec ta structure
  const supabaseHook = useSupabaseHook({
    enableRealtime: true,
    enableAuth: true,
    enableOfflineMode: true
  });

  // =================== ÉTAT LOCAL ===================
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

  // =================== FILTRAGE ET RECHERCHE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter(permit => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           PERMIT_TYPES_CONFIG[permit.code.split('-')[0] as keyof typeof PERMIT_TYPES_CONFIG]?.legislation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             permit.category === selectedCategory ||
                             permit.priority === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [permits, searchTerm, selectedCategory]);

  // Categories pour filtrage
  const categories = useMemo(() => {
    const cats = new Set<string>();
    permits.forEach(permit => {
      cats.add(permit.category);
      cats.add(permit.priority);
    });
    return Array.from(cats);
  }, [permits]);

  // =================== CALCUL STATISTIQUES ===================
  const stats = useMemo(() => {
    const selectedPermits = permits.filter(p => p.selected);
    const totalValidationItems = selectedPermits.length * 10; // Simulation
    const completedValidationItems = selectedPermits.filter(p => p.status === 'approved').length * 10;
    
    return {
      totalPermits: permits.length,
      selectedPermits: selectedPermits.length,
      criticalPermits: selectedPermits.filter(p => p.priority === 'critical').length,
      highRiskPermits: selectedPermits.filter(p => p.priority === 'high').length,
      validationRate: totalValidationItems > 0 ? Math.round((completedValidationItems / totalValidationItems) * 100) : 0,
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

  const handleOpenForm = useCallback((permitId: string) => {
    setOpenFormPermitId(permitId);
  }, []);

  // =================== INTÉGRATION QR CODE ===================
  const handleGenerateQR = useCallback(async (permit: LegalPermit) => {
    try {
      console.log('📱 Generating QR Code with your QRCode hook...');
      
      // Utiliser ton hook QR Code
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
        // Fallback sans géolocalisation
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

  // =================== INTÉGRATION SUPABASE ===================
  const handleSaveToSupabase = useCallback(async (permit: LegalPermit) => {
    try {
      console.log('💾 Saving to Supabase with your hook...');
      setIsAutoSaving(true);

      // Utiliser ton hook Supabase
      const result = await supabaseHook.create('permits', {
        id: permit.id,
        name: permit.name,
        description: permit.description,
        type: permit.category,
        status: permit.status,
        province: permit.province[0],
        authority: permit.authority,
        code: permit.code,
        priority: permit.priority,
        legal_requirements: permit.legalRequirements,
        validity: permit.validity,
        compliance: permit.compliance,
        created_by: supabaseHook.user?.id || 'anonymous',
        tenant_id: tenant
      });

      if (result.data) {
        setLastSaved(new Date());
        addNotification({
          type: 'success',
          message: `${permit.name} sauvegardé dans Supabase`
        });
      } else {
        throw new Error(result.error || 'Erreur de sauvegarde');
      }
    } catch (error) {
      console.error('Supabase save error:', error);
      addNotification({
        type: 'error',
        message: `Erreur sauvegarde: ${error}`
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, [supabaseHook, tenant, addNotification]);

  const updateFormData = useCallback((updatedPermits: LegalPermit[]) => {
    const selectedList = updatedPermits.filter(p => p.selected);
    
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: selectedList.length,
        criticalPermits: selectedList.filter(p => p.priority === 'critical').length,
        validationRate: stats.validationRate,
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
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            {texts.requiredSections}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerateQR(permit)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              title={texts.generateQR}
            >
              <Target size={14} />
              QR
            </button>
            <button
              onClick={() => handleSaveToSupabase(permit)}
              disabled={isAutoSaving}
              className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm disabled:opacity-50"
              title={texts.savePermit}
            >
              <Upload size={14} />
              {isAutoSaving ? '...' : 'DB'}
            </button>
            {config?.formComponent && (
              <button
                onClick={() => handleOpenForm(permit.id)}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                title={texts.openForm}
              >
                <FileText size={14} />
                Form
              </button>
            )}
          </div>
        </div>

        {/* Sections requises */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {config?.requiredSections.map(section => (
            <div
              key={section}
              className="flex items-center gap-2 p-2 bg-white rounded border text-sm"
            >
              <CheckCircle size={14} className="text-green-500" />
              <span className="capitalize">{section.replace('-', ' ')}</span>
            </div>
          ))}
        </div>

        {/* Intégrations spéciales pour espace-clos */}
        {permitTypeKey === 'espace-clos' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-cyan-50 rounded border border-cyan-200">
              <div className="flex items-center gap-2">
                <Wind size={16} className="text-cyan-600" />
                <span className="text-sm font-medium">Tests Atmosphériques</span>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs hover:bg-cyan-200">
                  <Bluetooth size={12} />
                </button>
                <button className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs hover:bg-cyan-200">
                  <Activity size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-600" />
                <span className="text-sm font-medium">Personnel & QR Scan</span>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                  <Camera size={12} />
                </button>
                <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                  <Target size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Réglementation spécifique */}
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-blue-700 font-medium">
            📋 {config?.legislation}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Autorité: {permit.authority} • Province: {permit.province.join(', ')}
          </div>
        </div>
      </div>
    );
  };

  // =================== FORMULAIRE MODAL ===================
  const renderFormModal = () => {
    if (!openFormPermitId) return null;

    const permit = permits.find(p => p.id === openFormPermitId);
    if (!permit) return null;

    const permitTypeKey = permit.code.split('-')[0] as keyof typeof PERMIT_TYPES_CONFIG;
    const config = PERMIT_TYPES_CONFIG[permitTypeKey];
    const FormComponent = ConfinedSpaceFormComponent;

    if (!FormComponent) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Formulaire {permit.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Le formulaire pour ce type de permis sera bientôt disponible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenFormPermitId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <FormComponent
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

  // =================== RENDU PRINCIPAL (MÊME STYLE QUE TES STEPS) ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header dans le style de tes Steps 1-2-3 */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  📄 {texts.title}
                </h1>
                <p className="text-red-200 text-lg">
                  {texts.subtitle}
                </p>
              </div>
            </div>
            
            {/* Statistiques dans le style de tes Steps */}
            {stats.selectedPermits > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="text-2xl font-bold text-white">{stats.totalPermits}</div>
                  <div className="text-slate-300 text-sm">Total Disponible</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="text-2xl font-bold text-red-400">{stats.selectedPermits}</div>
                  <div className="text-slate-300 text-sm">Sélectionnés</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="text-2xl font-bold text-orange-400">{stats.criticalPermits}</div>
                  <div className="text-slate-300 text-sm">Critiques</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="text-2xl font-bold text-blue-400">{stats.validationRate}%</div>
                  <div className="text-slate-300 text-sm">Validation</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="text-2xl font-bold text-green-400">{stats.averageProgress}%</div>
                  <div className="text-slate-300 text-sm">Progression</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section de recherche dans le style de tes Steps */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={texts.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/30 rounded-xl text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
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
        </div>

        {/* Grille des permis dans le style de tes Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPermits.map(permit => {
            const isSelected = permit.selected;
            const isExpanded = expandedPermits.has(permit.id);
            const permitTypeKey = permit.code.split('-')[0] as keyof typeof PERMIT_TYPES_CONFIG;
            const config = PERMIT_TYPES_CONFIG[permitTypeKey];
            
            return (
              <div 
                key={permit.id} 
                className={`
                  bg-slate-800/30 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02]
                  ${isSelected 
                    ? 'border-red-500/50 bg-red-900/20 shadow-lg shadow-red-500/20' 
                    : 'border-slate-600/30 hover:border-slate-500/50'
                  }
                `}
              >
                {/* Header du permis */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ 
                      background: `${config?.color || '#6b7280'}20`,
                      border: `1px solid ${config?.color || '#6b7280'}30`
                    }}
                  >
                    {config?.iconEmoji || '📄'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {permit.name}
                    </h3>
                    <div className="text-slate-400 text-sm mb-1">
                      {permit.code}
                    </div>
                    <div className="text-blue-400 text-xs">
                      {permit.authority}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handlePermitToggle(permit.id)}
                      className={`
                        w-6 h-6 rounded border-2 transition-all flex items-center justify-center
                        ${isSelected 
                          ? 'bg-red-500 border-red-500' 
                          : 'border-slate-500 hover:border-slate-400'
                        }
                      `}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    
                    <button
                      onClick={() => handlePermitExpand(permit.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronRight 
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Badges de statut */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      background: `${config?.color || '#6b7280'}20`,
                      color: config?.color || '#6b7280'
                    }}
                  >
                    {texts.riskLevels[permit.priority as keyof typeof texts.riskLevels]}
                  </span>
                  
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium">
                    {config?.estimatedTime || 30} {texts.minutes}
                  </span>
                  
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${permit.status === 'draft' ? 'bg-gray-900/30 text-gray-300' :
                      permit.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                      permit.status === 'approved' ? 'bg-green-900/30 text-green-300' :
                      'bg-gray-900/30 text-gray-300'
                    }
                  `}>
                    {permit.status.toUpperCase()}
                  </span>
                </div>

                {/* Détails expandables */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-600/30">
                    {renderAdvancedFeatures(permit)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun permis trouvé
            </h3>
            <p className="text-slate-400">
              Modifiez vos critères de recherche pour voir plus de permis
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
            {notifications.slice(0, 3).map((notification: any, index: number) => (
              <div
                key={notification.id || `notification-${index}`}
                className={`
                  p-4 rounded-xl backdrop-blur-sm border font-medium
                  ${notification.type === 'error' ? 'bg-red-900/50 border-red-500/50 text-red-100' :
                    notification.type === 'warning' ? 'bg-yellow-900/50 border-yellow-500/50 text-yellow-100' :
                    'bg-green-900/50 border-green-500/50 text-green-100'
                  }
                `}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Auto-save indicator */}
        {(isAutoSaving || lastSaved) && (
          <div className="fixed bottom-6 left-6 bg-slate-900/90 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-2 text-white text-sm flex items-center gap-2">
            {isAutoSaving ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                {texts.autoSaving}
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                {texts.lastSaved} {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {renderFormModal()}
    </div>
  );
};

export default Step4Permits;
