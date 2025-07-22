"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge
} from 'lucide-react';

// =================== IMPORTS DE TA STRUCTURE EXISTANTE ===================
import { usePermits, usePermitData, usePermitValidation, useSurveillance, useNotifications } from './hooks/usePermits';
import { useQRCode } from './hooks/useQRCode';
import { useSupabase } from './hooks/useSupabase';
import ConfinedSpaceForm from './components/forms/ConfinedSpaceForm';
import { AtmosphericSection } from './components/forms/shared/AtmosphericSection';

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
    formComponent: null, // À créer
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
      title: "📄 Work Permits & Legal Authorizations",
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
    title: "📄 Permis de Travail & Autorisations Légales",
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
  
  // =================== HOOKS AVEC TA STRUCTURE ===================
  const [permits, setPermits] = useState<LegalPermit[]>(() => {
    console.log('🍁 Initializing permits with complete Canadian structure');
    if (initialPermits && initialPermits.length > 0) {
      return initialPermits;
    }
    return generateAllPermitsWithStructure(province as ProvinceCode, language, tenant);
  });

  // Utilisation de tes hooks
  const { notifications, addNotification } = useNotifications();
  const { validatePermit, validationResults, isValidating } = usePermitValidation();
  const { isActive: isSurveillanceActive, startSurveillance, stopSurveillance } = useSurveillance();
  
  // Hook QR Code avec ta structure
  const qrCodeHook = useQRCode();
  
  // Hook Supabase avec ta structure
  const supabaseHook = useSupabase({
    enableRealtime: true,
    enableAuth: true,
    enableOfflineMode: true
  });

  // =================== ÉTAT LOCAL ===================
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
    const FormComponent = config?.formComponent;

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
            onSave={async (data) => {
              const updatedPermits = permits.map(p => 
                p.id === permit.id ? { ...p, formData: data } : p
              );
              setPermits(updatedPermits);
              updateFormData(updatedPermits);
            }}
            onSubmit={async (data) => {
              const updatedPermits = permits.map(p => 
                p.id === permit.id ? { ...p, formData: data, status: 'pending' } : p
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
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-top: 16px; position: relative; z-index: 1; }
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
          .category-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; min-width: 200px; }
          .category-select:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
          .permits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
          .permit-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
          .permit-card:hover { transform: translateY(-4px); border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); }
          .permit-card.selected { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
          .permit-header { padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(100, 116, 139, 0.2); }
          .permit-header:hover { background: rgba(30, 41, 59, 0.3); }
          .permit-icon { font-size: 36px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); border-radius: 16px; }
          .permit-main-info { flex: 1; }
          .permit-name { color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 8px; }
          .permit-code { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .permit-authority { color: #60a5fa; font-size: 12px; font-weight: 500; }
          .permit-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
          .permit-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-draft { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
          .status-pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
          .status-approved { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
          .permit-checkbox { width: 24px; height: 24px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 6px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .permit-checkbox.checked { background: #ef4444; border-color: #ef4444; color: white; }
          .permit-details { padding: 0; max-height: 0; overflow: hidden; transition: all 0.3s ease; }
          .permit-details.expanded { max-height: 1000px; padding: 0 20px 20px; }
          .expand-icon { color: #94a3b8; transition: transform 0.3s ease; }
          .expand-icon.expanded { transform: rotate(90deg); }
          .risk-badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
          .time-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
          .legislation-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 500; text-align: center; margin-top: 8px; }
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
                <div className="stat-label">Total Disponible</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.selectedPermits}</div>
                <div className="stat-label">Sélectionnés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.criticalPermits}</div>
                <div className="stat-label">Critiques</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.validationRate}%</div>
                <div className="stat-label">Validation</div>
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
                      {isSelected && <CheckCircle size={18} />}
                    </div>
                    
                    <ChevronRight 
                      className={`expand-icon ${isExpanded ? 'expanded' : ''}`} 
                      size={20}
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

                {/* Législation footer */}
                <div className="legislation-badge">
                  📋 {config?.legislation || 'Réglementation provinciale'}
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
              Aucun permis trouvé
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Modifiez vos critères de recherche pour voir plus de permis
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
            {notifications.slice(0, 3).map((notification, index) => (
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
                {texts.autoSaving}
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle size={14} />
                {texts.lastSaved} {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {renderFormModal()}
    </>
  );
};

export default Step4Permits;
