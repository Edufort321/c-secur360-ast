"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target
} from 'lucide-react';

// =================== IMPORTS HOOKS EXISTANTS ===================
import { 
  usePermitData,
  usePermitValidation,
  useSurveillance,
  useNotifications,
  type LegalPermit as HookLegalPermit,
  type PermitType as HookPermitType,
  type ProvinceCode
} from './hooks/usePermits';

// =================== INTERFACES LOCALES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  // Propriétés supplémentaires (optionnelles pour compatibilité)
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

export type PermitStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'active' | 'completed' | 'cancelled' | 'suspended';
export type PermitTypeEnum = 'confined_space' | 'hot_work' | 'excavation' | 'lifting' | 'height_work' | 'electrical';

interface LegalPermit {
  // Propriétés du hook (compatibilité)
  id: string;
  name: string;
  category: string;
  authority: string;
  province: ProvinceCode[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  selected: boolean;
  formData: any;
  code: string;
  status: PermitStatus;
  dateCreated: string;
  dateModified: string;
  legalRequirements: {
    permitRequired: boolean;
    atmosphericTesting: boolean;
    entryProcedure: boolean;
    emergencyPlan: boolean;
    equipmentCheck: boolean;
    attendantRequired: boolean;
    documentation: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isValid: boolean;
  };
  compliance: Record<string, boolean>;
  
  // Propriétés enrichies pour l'interface
  type: PermitTypeEnum;
  description: BilingualText;
  dateCreation: Date;
  dateExpiration: Date;
  location: string;
  site: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  progress: number;
  tags: string[];
  
  // Validation avancée
  validationPanels: ValidationPanel[];
  standardsReferences: Standard[];
  
  // Métadonnées
  lastModified: Date;
  modifiedBy: string;
  estimatedDuration: number; // en minutes
}

interface ValidationPanel {
  id: string;
  name: BilingualText;
  category: 'atmospheric' | 'equipment' | 'personnel' | 'procedures' | 'regulatory';
  icon: string;
  priority: 'high' | 'medium' | 'low';
  required: boolean;
  validated: boolean;
  validationItems: ValidationItem[];
  progress: number;
}

interface ValidationItem {
  id: string;
  name: BilingualText;
  description: BilingualText;
  required: boolean;
  completed: boolean;
  responsible?: string;
  deadline?: string;
  notes?: string;
  standard?: Standard;
}

interface Standard {
  id: string;
  name: string;
  fullName: string;
  url?: string;
  section?: string;
  description: string;
  mandatory: boolean;
  jurisdiction: ProvinceCode[];
}

// =================== TRADUCTIONS COMPLÈTES ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "📄 Work Permits & Authorizations",
      subtitle: "Select required permits and complete all validation requirements",
      searchPlaceholder: "Search for a permit...",
      allCategories: "All categories",
      permitsSelected: "Permits selected",
      criticalPermits: "Critical permits",
      validationRate: "Validation rate",
      implementationRate: "Implementation rate",
      validationPanels: "Validation panels",
      noPermitsFound: "No permits found",
      noPermitsMessage: "Modify your search criteria to see more permits",
      validationRequired: "Validation required",
      validationComplete: "Validation complete",
      mandatory: "Mandatory",
      recommended: "Recommended",
      responsible: "Responsible...",
      standardsReferences: "📋 Standards & References:",
      estimatedTime: "Estimated time",
      minutes: "min",
      riskLevels: {
        critical: "🔴 Critical",
        high: "🟠 High", 
        medium: "🟡 Medium",
        low: "🟢 Low"
      },
      validationCategories: {
        atmospheric: "🌬️ Atmospheric",
        equipment: "🔧 Equipment",
        personnel: "👥 Personnel", 
        procedures: "📋 Procedures",
        regulatory: "⚖️ Regulatory"
      },
      permitTypes: {
        confined_space: "Confined Space",
        hot_work: "Hot Work",
        excavation: "Excavation",
        lifting: "Lifting Operations", 
        height_work: "Work at Height",
        electrical: "Electrical Work"
      }
    };
  }
  
  return {
    title: "📄 Permis de Travail & Autorisations",
    subtitle: "Sélectionnez les permis requis et complétez toutes les validations",
    searchPlaceholder: "Rechercher un permis...",
    allCategories: "Toutes catégories",
    permitsSelected: "Permis sélectionnés",
    criticalPermits: "Permis critiques",
    validationRate: "Taux validation",
    implementationRate: "Taux implantation",
    validationPanels: "Panneaux validation",
    noPermitsFound: "Aucun permis trouvé",
    noPermitsMessage: "Modifiez vos critères de recherche pour voir plus de permis",
    validationRequired: "Validation requise",
    validationComplete: "Validation complète", 
    mandatory: "Obligatoire",
    recommended: "Recommandé",
    responsible: "Responsable...",
    standardsReferences: "📋 Normes & Références :",
    estimatedTime: "Temps estimé",
    minutes: "min",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    },
    validationCategories: {
      atmospheric: "🌬️ Atmosphérique",
      equipment: "🔧 Équipement",
      personnel: "👥 Personnel",
      procedures: "📋 Procédures", 
      regulatory: "⚖️ Réglementaire"
    },
    permitTypes: {
      confined_space: "Espace Clos",
      hot_work: "Travail à Chaud", 
      excavation: "Excavation",
      lifting: "Opérations Levage",
      height_work: "Travail en Hauteur",
      electrical: "Travaux Électriques"
    }
  };
};

// =================== CONFIGURATION TYPES PERMIS ===================
const getPermitTypesConfig = (language: 'fr' | 'en') => {
  const texts = getTexts(language);
  
  return {
    confined_space: {
      icon: Home,
      iconEmoji: '🏠',
      title: texts.permitTypes.confined_space,
      color: '#dc2626',
      riskLevel: 'critical' as const,
      estimatedTime: 45,
      tags: language === 'fr' ? ['espace', 'atmosphère', 'urgence'] : ['space', 'atmosphere', 'emergency'],
      legislation: 'RSST Art. 302-317, CSA Z1006'
    },
    hot_work: {
      icon: Flame,
      iconEmoji: '🔥',
      title: texts.permitTypes.hot_work,
      color: '#ea580c',
      riskLevel: 'critical' as const,
      estimatedTime: 30,
      tags: language === 'fr' ? ['soudage', 'feu', 'surveillance'] : ['welding', 'fire', 'watch'],
      legislation: 'NFPA 51B, RSST Art. 323'
    },
    excavation: {
      icon: Construction,
      iconEmoji: '🏗️',
      title: texts.permitTypes.excavation,
      color: '#d97706',
      riskLevel: 'high' as const,
      estimatedTime: 35,
      tags: language === 'fr' ? ['tranchée', 'effondrement', 'services'] : ['trench', 'collapse', 'utilities'],
      legislation: 'RSST Art. 3.20, CSA Z271'
    },
    lifting: {
      icon: Wrench,
      iconEmoji: '🏗️',
      title: texts.permitTypes.lifting,
      color: '#059669',
      riskLevel: 'high' as const,
      estimatedTime: 40,
      tags: language === 'fr' ? ['grue', 'charge', 'stabilité'] : ['crane', 'load', 'stability'],
      legislation: 'ASME B30, CSA B335'
    },
    height_work: {
      icon: Building,
      iconEmoji: '🏢',
      title: texts.permitTypes.height_work,
      color: '#7c3aed',
      riskLevel: 'critical' as const,
      estimatedTime: 50,
      tags: language === 'fr' ? ['hauteur', 'harnais', 'chute'] : ['height', 'harness', 'fall'],
      legislation: 'RSST Art. 347, CSA Z259'
    },
    electrical: {
      icon: Zap,
      iconEmoji: '⚡',
      title: texts.permitTypes.electrical,
      color: '#dc2626',
      riskLevel: 'critical' as const,
      estimatedTime: 55,
      tags: language === 'fr' ? ['tension', 'LOTO', 'arc'] : ['voltage', 'LOTO', 'arc'],
      legislation: 'CSA Z462, RSST Art. 185'
    }
  } as const;
};

// =================== FONCTION GÉNÉRATION PERMIS ===================
const generatePermitsList = (language: 'fr' | 'en', province: ProvinceCode): LegalPermit[] => {
  const texts = getTexts(language);
  const config = getPermitTypesConfig(language);
  const now = new Date();
  
  return Object.entries(config).map(([type, typeConfig], index) => {
    const permit: LegalPermit = {
      // Propriétés du hook
      id: `permit_${type}_${Date.now() + index}`,
      name: `${typeConfig.title} - ${province}`,
      category: typeConfig.title,
      authority: province === 'QC' ? 'CNESST' : 'OHS',
      province: [province],
      priority: typeConfig.riskLevel,
      selected: false,
      formData: {},
      code: `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      status: 'draft',
      dateCreated: now.toISOString(),
      dateModified: now.toISOString(),
      legalRequirements: {
        permitRequired: true,
        atmosphericTesting: type === 'confined_space',
        entryProcedure: type === 'confined_space',
        emergencyPlan: true,
        equipmentCheck: true,
        attendantRequired: type === 'confined_space' || type === 'hot_work',
        documentation: true
      },
      validity: {
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        isValid: false
      },
      compliance: { [province.toLowerCase()]: false },
      
      // Propriétés enrichies
      type: type as PermitTypeEnum,
      description: {
        fr: getPermitDescription(type as PermitTypeEnum, 'fr'),
        en: getPermitDescription(type as PermitTypeEnum, 'en')
      },
      dateCreation: now,
      dateExpiration: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      location: '',
      site: '',
      riskLevel: typeConfig.riskLevel,
      legislation: typeConfig.legislation,
      icon: typeConfig.iconEmoji,
      progress: 0,
      tags: typeConfig.tags,
      validationPanels: generateValidationPanels(type as PermitTypeEnum, language),
      standardsReferences: generateStandardsReferences(type as PermitTypeEnum, province),
      lastModified: now,
      modifiedBy: 'System',
      estimatedDuration: typeConfig.estimatedTime
    };
    
    return permit;
  });
};

// =================== FONCTIONS UTILITAIRES ===================
const getPermitDescription = (type: PermitTypeEnum, language: 'fr' | 'en'): string => {
  const descriptions = {
    fr: {
      confined_space: 'Permis requis pour l\'entrée dans des espaces clos avec risques atmosphériques',
      hot_work: 'Autorisation pour travaux de soudage, coupage et autres travaux générateurs d\'étincelles',
      excavation: 'Permis pour travaux d\'excavation et de tranchée avec risques d\'effondrement',
      lifting: 'Autorisation pour opérations de levage avec grues, palans et équipements similaires',
      height_work: 'Permis pour travaux en hauteur de plus de 3 mètres avec risques de chute',
      electrical: 'Autorisation pour travaux sur installations électriques sous tension ou consignées'
    },
    en: {
      confined_space: 'Permit required for entry into confined spaces with atmospheric hazards',
      hot_work: 'Authorization for welding, cutting and other spark-generating work',
      excavation: 'Permit for excavation and trenching work with collapse risks',
      lifting: 'Authorization for lifting operations with cranes, hoists and similar equipment',
      height_work: 'Permit for work at height over 3 meters with fall risks',
      electrical: 'Authorization for work on live or locked-out electrical installations'
    }
  };
  
  return descriptions[language][type];
};

const generateValidationPanels = (type: PermitTypeEnum, language: 'fr' | 'en'): ValidationPanel[] => {
  const texts = getTexts(language);
  const basePanels: Partial<ValidationPanel>[] = [];
  
  // Panneaux selon le type de permis
  switch (type) {
    case 'confined_space':
      basePanels.push(
        { id: 'atmospheric', category: 'atmospheric', priority: 'high', required: true },
        { id: 'equipment', category: 'equipment', priority: 'high', required: true },
        { id: 'personnel', category: 'personnel', priority: 'medium', required: true },
        { id: 'procedures', category: 'procedures', priority: 'high', required: true }
      );
      break;
    case 'hot_work':
      basePanels.push(
        { id: 'equipment', category: 'equipment', priority: 'high', required: true },
        { id: 'personnel', category: 'personnel', priority: 'high', required: true },
        { id: 'procedures', category: 'procedures', priority: 'high', required: true }
      );
      break;
    case 'electrical':
      basePanels.push(
        { id: 'equipment', category: 'equipment', priority: 'high', required: true },
        { id: 'personnel', category: 'personnel', priority: 'high', required: true },
        { id: 'procedures', category: 'procedures', priority: 'high', required: true },
        { id: 'regulatory', category: 'regulatory', priority: 'medium', required: true }
      );
      break;
    default:
      basePanels.push(
        { id: 'equipment', category: 'equipment', priority: 'medium', required: true },
        { id: 'personnel', category: 'personnel', priority: 'medium', required: true },
        { id: 'procedures', category: 'procedures', priority: 'medium', required: true }
      );
  }
  
  return basePanels.map(panel => ({
    id: panel.id!,
    name: {
      fr: texts.validationCategories[panel.category!] || panel.category!,
      en: texts.validationCategories[panel.category!] || panel.category!
    },
    category: panel.category!,
    icon: getValidationIcon(panel.category!),
    priority: panel.priority!,
    required: panel.required!,
    validated: false,
    validationItems: generateValidationItems(type, panel.category!, language),
    progress: 0
  }));
};

const getValidationIcon = (category: string): string => {
  const icons = {
    atmospheric: '🌬️',
    equipment: '🔧',
    personnel: '👥',
    procedures: '📋',
    regulatory: '⚖️'
  };
  return icons[category as keyof typeof icons] || '📋';
};

const generateValidationItems = (permitType: PermitTypeEnum, category: string, language: 'fr' | 'en'): ValidationItem[] => {
  const items: { [key: string]: { [cat: string]: Array<{id: string, name: any, description: any, required: boolean}> } } = {
    confined_space: {
      atmospheric: [
        {
          id: 'oxygen_test',
          name: {fr: 'Test oxygène (19.5-23.5%)', en: 'Oxygen test (19.5-23.5%)'},
          description: {fr: 'Mesure du taux d\'oxygène', en: 'Oxygen level measurement'},
          required: true
        },
        {
          id: 'toxic_gas_test', 
          name: {fr: 'Test gaz toxiques', en: 'Toxic gas test'},
          description: {fr: 'Détection CO, H2S, vapeurs', en: 'Detection CO, H2S, vapors'},
          required: true
        }
      ],
      equipment: [
        {
          id: 'detection_equipment',
          name: {fr: 'Équipement détection 4 gaz', en: '4-gas detection equipment'},
          description: {fr: 'Détecteur calibré et fonctionnel', en: 'Calibrated and functional detector'},
          required: true
        }
      ],
      personnel: [
        {
          id: 'qualified_entrant',
          name: {fr: 'Entrant qualifié', en: 'Qualified entrant'},
          description: {fr: 'Formation espace clos valide', en: 'Valid confined space training'},
          required: true
        }
      ]
    },
    hot_work: {
      equipment: [
        {
          id: 'fire_extinguisher',
          name: {fr: 'Extincteur disponible', en: 'Fire extinguisher available'},
          description: {fr: 'Extincteur approprié à portée', en: 'Appropriate extinguisher within reach'},
          required: true
        }
      ]
    }
  };
  
  const permitItems = items[permitType]?.[category] || [];
  
  return permitItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    required: item.required,
    completed: false
  }));
};

const generateStandardsReferences = (type: PermitTypeEnum, province: ProvinceCode): Standard[] => {
  const standards: { [key: string]: Standard[] } = {
    confined_space: [
      {
        id: 'csa_z1006',
        name: 'CSA Z1006',
        fullName: 'Management of Work in Confined Spaces',
        url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1006',
        section: 'Entire standard',
        description: 'Management of work in confined spaces',
        mandatory: true,
        jurisdiction: ['QC', 'ON', 'BC']
      }
    ],
    hot_work: [
      {
        id: 'nfpa_51b',
        name: 'NFPA 51B',
        fullName: 'Standard for Fire Prevention During Welding',
        url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=51B',
        section: 'Chapter 4',
        description: 'Fire prevention during welding operations',
        mandatory: true,
        jurisdiction: ['QC', 'ON']
      }
    ],
    electrical: [
      {
        id: 'csa_z462',
        name: 'CSA Z462',
        fullName: 'Workplace Electrical Safety',
        url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z462',
        section: 'Art. 6.3',
        description: 'Electrical safety procedures',
        mandatory: true,
        jurisdiction: ['QC', 'ON', 'BC']
      }
    ]
  };
  
  return standards[type] || [];
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province,
  userRole,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  const texts = getTexts(language);
  const config = getPermitTypesConfig(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Utilisation du hook existant pour les données
  const {
    permits: hookPermits,
    loading: dataLoading,
    error: dataError,
    addPermit: addHookPermit,
    updatePermit: updateHookPermit,
    deletePermit: deleteHookPermit,
    setPermits: setHookPermits
  } = usePermitData(formData.permits?.list || [], (permits) => {
    onDataChange('permits', { list: permits, selected: permits.filter((p: any) => p.selected) });
  });
  
  const {
    validatePermit,
    validationResults,
    isValidating: validationLoading
  } = usePermitValidation();
  
  const { notifications, addNotification } = useNotifications();
  
  // =================== GÉNÉRATION PERMIS ===================
  const [permits, setPermits] = useState<LegalPermit[]>(() => {
    // Prioriser initialPermits, puis hookPermits, puis génération automatique
    if (initialPermits && initialPermits.length > 0) {
      return initialPermits.map(convertHookPermitToLocal);
    }
    if (hookPermits.length > 0) {
      return hookPermits.map(convertHookPermitToLocal);
    }
    // Utiliser province prop, sinon formData, sinon 'QC' par défaut
    const targetProvince = province || formData.projectInfo?.province || 'QC';
    return generatePermitsList(language, targetProvince as ProvinceCode);
  });
  
  // =================== FONCTION CONVERSION ===================
  const convertHookPermitToLocal = (hookPermit: any): LegalPermit => {
    const permitType = convertPermitType(hookPermit.type || 'espace-clos');
    const typeConfig = config[permitType];
    
    return {
      ...hookPermit,
      type: permitType,
      description: {
        fr: getPermitDescription(permitType, 'fr'),
        en: getPermitDescription(permitType, 'en')
      },
      dateCreation: new Date(hookPermit.dateCreated || Date.now()),
      dateExpiration: new Date(hookPermit.validity?.endDate || Date.now() + 24 * 60 * 60 * 1000),
      location: hookPermit.location || '',
      site: hookPermit.site || '',
      riskLevel: typeConfig?.riskLevel || 'medium',
      legislation: typeConfig?.legislation || '',
      icon: typeConfig?.iconEmoji || '📄',
      progress: hookPermit.progress || 0,
      tags: typeConfig?.tags || [],
      validationPanels: generateValidationPanels(permitType, language),
      standardsReferences: generateStandardsReferences(permitType, hookPermit.province?.[0] || 'QC'),
      lastModified: new Date(hookPermit.dateModified || Date.now()),
      modifiedBy: hookPermit.modifiedBy || 'System',
      estimatedDuration: typeConfig?.estimatedTime || 30
    };
  };
  
  const convertPermitType = (hookType: string): PermitTypeEnum => {
    const typeMapping: Record<string, PermitTypeEnum> = {
      'espace-clos': 'confined_space',
      'travail-chaud': 'hot_work',
      'excavation': 'excavation',
      'levage': 'lifting',
      'hauteur': 'height_work',
      'isolation-energetique': 'electrical'
    };
    return typeMapping[hookType] || 'confined_space';
  };
  
  // =================== FILTRAGE ===================
  const filteredPermits = useMemo(() => {
    return permits.filter(permit => {
      const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || permit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [permits, searchTerm, selectedCategory, language]);
  
  // Categories uniques
  const categories = Array.from(new Set(permits.map(p => p.category)));
  
  // Permis sélectionnés
  const selectedPermits = permits.filter(p => p.selected);
  
  // =================== STATISTIQUES ===================
  const stats = useMemo(() => {
    const totalValidationItems = selectedPermits.reduce((sum, permit) => 
      sum + permit.validationPanels.reduce((panelSum, panel) => panelSum + panel.validationItems.length, 0), 0
    );
    
    const completedValidationItems = selectedPermits.reduce((sum, permit) => 
      sum + permit.validationPanels.reduce((panelSum, panel) => 
        panelSum + panel.validationItems.filter(item => item.completed).length, 0
      ), 0
    );
    
    return {
      totalSelected: selectedPermits.length,
      criticalPermits: selectedPermits.filter(p => p.riskLevel === 'critical').length,
      highRiskPermits: selectedPermits.filter(p => p.riskLevel === 'high').length,
      validationRate: totalValidationItems > 0 ? Math.round((completedValidationItems / totalValidationItems) * 100) : 0,
      averageProgress: selectedPermits.length > 0 ? 
        Math.round(selectedPermits.reduce((sum, p) => sum + p.progress, 0) / selectedPermits.length) : 0
    };
  }, [selectedPermits]);
  
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
  
  const handleValidationItemToggle = (permitId: string, panelId: string, itemId: string) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const updatedPanels = permit.validationPanels.map(panel => {
          if (panel.id === panelId) {
            const updatedItems = panel.validationItems.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            const progress = Math.round((updatedItems.filter(item => item.completed).length / updatedItems.length) * 100);
            return { ...panel, validationItems: updatedItems, progress, validated: progress === 100 };
          }
          return panel;
        });
        
        const overallProgress = Math.round(
          updatedPanels.reduce((sum, panel) => sum + panel.progress, 0) / updatedPanels.length
        );
        
        return { ...permit, validationPanels: updatedPanels, progress: overallProgress };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };
  
  const updateValidationItem = (permitId: string, panelId: string, itemId: string, field: string, value: any) => {
    const updatedPermits = permits.map(permit => {
      if (permit.id === permitId) {
        const updatedPanels = permit.validationPanels.map(panel => {
          if (panel.id === panelId) {
            const updatedItems = panel.validationItems.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            );
            return { ...panel, validationItems: updatedItems };
          }
          return panel;
        });
        return { ...permit, validationPanels: updatedPanels };
      }
      return permit;
    });
    
    setPermits(updatedPermits);
    updateFormData(updatedPermits);
  };
  
  const updateFormData = (updatedPermits: LegalPermit[]) => {
    const selectedList = updatedPermits.filter(p => p.selected);
    
    const permitsData = {
      list: updatedPermits,
      selected: selectedList,
      stats: {
        totalPermits: selectedList.length,
        criticalPermits: selectedList.filter(p => p.riskLevel === 'critical').length,
        validationRate: stats.validationRate,
        averageProgress: stats.averageProgress
      }
    };
    
    // Appeler onDataChange pour la compatibilité avec les autres steps
    onDataChange('permits', permitsData);
    
    // Appeler onPermitChange pour la compatibilité avec ASTForm
    if (onPermitChange) {
      onPermitChange(selectedList);
    }
  };
  
  // =================== FONCTIONS UTILITAIRES ===================
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };
  
  const getRiskLabel = (level: string) => {
    return texts.riskLevels[level as keyof typeof texts.riskLevels] || '⚪ Indéterminé';
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };
  
  // =================== MISE À JOUR TRADUCTIONS ===================
  useEffect(() => {
    const translatedPermits = permits.map(permit => ({
      ...permit,
      description: {
        fr: getPermitDescription(permit.type, 'fr'),
        en: getPermitDescription(permit.type, 'en')
      },
      validationPanels: generateValidationPanels(permit.type, language)
    }));
    setPermits(translatedPermits);
  }, [language]);
  
  // =================== RENDU ===================
  return (
    <>
      {/* CSS optimisé pour Step4 - Style cohérent avec les autres steps */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step4-container { padding: 0; color: #ffffff; }
          
          .summary-header { 
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); 
            border: 1px solid rgba(239, 68, 68, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
          }
          
          .summary-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
          }
          
          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          
          .summary-title { 
            color: #ef4444; 
            font-size: 18px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
            position: relative;
            z-index: 1;
          }
          
          .summary-subtitle {
            color: #dc2626;
            margin: '0 0 8px';
            fontSize: '14px';
            position: relative;
            z-index: 1;
          }
          
          .summary-stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 16px; 
            margin-top: 16px;
            position: relative;
            z-index: 1;
          }
          
          .stat-item { 
            text-align: center; 
            background: rgba(15, 23, 42, 0.6); 
            padding: 12px; 
            border-radius: 8px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .stat-item:hover {
            transform: translateY(-2px);
            background: rgba(15, 23, 42, 0.8);
          }
          
          .stat-value { 
            font-size: 20px; 
            font-weight: 800; 
            color: #ef4444; 
            margin-bottom: 4px; 
          }
          
          .stat-label { 
            font-size: 12px; 
            color: #dc2626; 
            font-weight: 500; 
          }
          
          .search-section { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 24px; 
          }
          
          .search-grid { 
            display: grid; 
            grid-template-columns: 1fr auto; 
            gap: 12px; 
            align-items: end; 
          }
          
          .search-input-wrapper { 
            position: relative; 
          }
          
          .search-icon { 
            position: absolute; 
            left: 12px; 
            top: 50%; 
            transform: translateY(-50%); 
            color: #94a3b8; 
            z-index: 10; 
          }
          
          .search-field { 
            width: 100%; 
            padding: 12px 12px 12px 40px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 14px; 
            transition: all 0.3s ease;
            font-family: inherit;
          }
          
          .search-field:focus { 
            outline: none; 
            border-color: #ef4444; 
            background: rgba(15, 23, 42, 0.9);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          
          .search-field::placeholder {
            color: #64748b;
            font-weight: 400;
          }
          
          .category-select { 
            padding: 12px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 14px; 
            cursor: pointer; 
            transition: all 0.3s ease;
            font-family: inherit;
            min-width: 200px;
          }
          
          .category-select:focus { 
            outline: none; 
            border-color: #ef4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          
          .permits-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); 
            gap: 20px; 
          }
          
          .permit-card { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            transition: all 0.3s ease; 
            cursor: pointer; 
            position: relative;
            overflow: hidden;
          }
          
          .permit-card:hover { 
            transform: translateY(-4px); 
            border-color: rgba(239, 68, 68, 0.5); 
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15); 
          }
          
          .permit-card.selected { 
            border-color: #ef4444; 
            background: rgba(239, 68, 68, 0.1); 
          }
          
          .permit-card.critical::before { 
            content: ''; 
            position: absolute; 
            left: 0; 
            top: 0; 
            bottom: 0; 
            width: 4px; 
            background: #ef4444; 
            border-radius: 16px 0 0 16px; 
          }
          
          .permit-card.high::before { 
            content: ''; 
            position: absolute; 
            left: 0; 
            top: 0; 
            bottom: 0; 
            width: 4px; 
            background: #f97316; 
            border-radius: 16px 0 0 16px; 
          }
          
          .permit-header { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            margin-bottom: 16px; 
          }
          
          .permit-icon { 
            font-size: 28px; 
            width: 40px; 
            text-align: center; 
          }
          
          .permit-content { 
            flex: 1; 
          }
          
          .permit-name { 
            color: #ffffff; 
            font-size: 16px; 
            font-weight: 600; 
            margin: 0 0 4px; 
          }
          
          .permit-category { 
            color: #94a3b8; 
            font-size: 12px; 
            font-weight: 500; 
            margin-bottom: 4px; 
          }
          
          .permit-description { 
            color: #cbd5e1; 
            font-size: 13px; 
            line-height: 1.4; 
          }
          
          .permit-checkbox { 
            width: 24px; 
            height: 24px; 
            border: 2px solid rgba(100, 116, 139, 0.5); 
            border-radius: 6px; 
            background: rgba(15, 23, 42, 0.8); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s ease; 
          }
          
          .permit-checkbox.checked { 
            background: #ef4444; 
            border-color: #ef4444; 
            color: white; 
          }
          
          .permit-details { 
            margin-top: 16px; 
          }
          
          .permit-meta { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .risk-badge { 
            padding: 4px 8px; 
            border-radius: 6px; 
            font-size: 11px; 
            font-weight: 500; 
          }
          
          .time-badge {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 500;
          }
          
          .legislation-info { 
            background: rgba(59, 130, 246, 0.1); 
            color: #60a5fa; 
            padding: 4px 8px; 
            border-radius: 6px; 
            font-size: 10px; 
            font-weight: 500;
            text-align: center;
            margin-top: 8px;
          }
          
          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 8px;
          }
          
          .tag-item {
            background: rgba(100, 116, 139, 0.2);
            color: #94a3b8;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
          
          .progress-section {
            margin-top: 12px;
            padding: 12px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            border: 1px solid rgba(100, 116, 139, 0.2);
          }
          
          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .progress-label {
            color: #ef4444;
            font-size: 12px;
            font-weight: 600;
          }
          
          .progress-value {
            color: #ef4444;
            font-size: 12px;
            font-weight: 700;
          }
          
          .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(100, 116, 139, 0.3);
            border-radius: 2px;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #dc2626);
            transition: width 0.3s ease;
            border-radius: 2px;
          }
          
          .validation-panels { 
            margin-top: 16px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            padding: 16px; 
          }
          
          .panels-header { 
            color: #ef4444; 
            font-size: 14px; 
            font-weight: 600; 
            margin-bottom: 12px; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
          }
          
          .panels-grid { 
            display: grid; 
            gap: 8px; 
          }
          
          .panel-item { 
            background: rgba(30, 41, 59, 0.6); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 8px; 
            padding: 12px;
            transition: all 0.3s ease;
          }
          
          .panel-item:hover { 
            background: rgba(30, 41, 59, 0.8); 
            border-color: rgba(239, 68, 68, 0.5);
          }
          
          .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .panel-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
          }
          
          .panel-progress {
            color: #ef4444;
            font-size: 11px;
            font-weight: 700;
          }
          
          .validation-items {
            display: grid;
            gap: 6px;
            margin-top: 8px;
          }
          
          .validation-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 6px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 6px;
            transition: all 0.3s ease;
          }
          
          .validation-item:hover {
            background: rgba(15, 23, 42, 0.8);
          }
          
          .validation-checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(100, 116, 139, 0.5);
            border-radius: 4px;
            background: rgba(15, 23, 42, 0.8);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            margin-top: 2px;
            flex-shrink: 0;
          }
          
          .validation-checkbox.checked {
            background: #22c55e;
            border-color: #22c55e;
            color: white;
          }
          
          .validation-content {
            flex: 1;
            min-width: 0;
          }
          
          .validation-name {
            color: #ffffff;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .validation-description {
            color: #94a3b8;
            font-size: 10px;
            line-height: 1.3;
          }
          
          .validation-inputs {
            margin-top: 6px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          
          .validation-input {
            padding: 4px 6px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 4px;
            color: #ffffff;
            font-size: 10px;
          }
          
          .validation-input:focus {
            outline: none;
            border-color: #ef4444;
          }
          
          .standards-section {
            margin-top: 12px;
            padding: 8px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 6px;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
          
          .standards-label {
            color: #60a5fa;
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          
          .standards-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .standard-item {
            position: relative;
          }
          
          .standard-link {
            text-decoration: none;
            display: block;
            transition: all 0.2s ease;
          }
          
          .standard-link:hover {
            transform: translateY(-1px);
          }
          
          .standard-badge {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 4px;
            padding: 3px 6px;
            display: inline-flex;
            align-items: center;
            gap: 2px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .standard-badge:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.5);
          }
          
          .standard-name {
            color: #60a5fa;
            font-size: 9px;
            font-weight: 600;
          }
          
          .mandatory-indicator {
            color: #ef4444;
            font-size: 8px;
            font-weight: 700;
          }
          
          .standard-section {
            color: #94a3b8;
            font-size: 8px;
            text-align: center;
            margin-top: 1px;
          }
          
          .standard-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px;
            border-radius: 6px;
            font-size: 10px;
            white-space: nowrap;
            max-width: 200px;
            white-space: normal;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          .standard-item:hover .standard-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(-8px);
          }
          
          .no-results { 
            text-align: center; 
            padding: 60px 20px; 
            color: #94a3b8; 
            background: rgba(30, 41, 59, 0.6); 
            border-radius: 16px; 
            border: 1px solid rgba(100, 116, 139, 0.3);
            backdrop-filter: blur(20px);
          }
          
          .no-results-icon {
            margin: '0 auto 16px';
            color: '#64748b';
          }
          
          .no-results-title {
            color: '#e2e8f0';
            margin: '0 0 8px';
            font-size: '18px';
            font-weight: '600';
          }
          
          .no-results-description {
            margin: 0;
            font-size: '14px';
          }
          
          /* Adaptations pour touchOptimized et compactMode */
          .permit-card {
            ${touchOptimized ? 'min-height: 44px; padding: 16px;' : ''}
            ${compactMode ? 'padding: 12px;' : ''}
          }
          
          .permit-checkbox {
            ${touchOptimized ? 'width: 28px; height: 28px;' : ''}
          }
          
          .validation-checkbox {
            ${touchOptimized ? 'width: 20px; height: 20px;' : ''}
          }
          
          ${compactMode ? `
            .summary-header { padding: 16px; margin-bottom: 16px; }
            .search-section { padding: 16px; margin-bottom: 16px; }
            .permits-grid { gap: 12px; }
            .validation-panels { padding: 12px; }
          ` : ''}
          
          /* Debug info pour développement */
          ${process.env.NODE_ENV === 'development' ? `
            .step4-container::before {
              content: 'Step4Permits - Province: ${province || 'default'} - User: ${userRole || 'default'}';
              display: block;
              background: rgba(59, 130, 246, 0.1);
              color: #60a5fa;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              margin-bottom: 8px;
              text-align: center;
            }
          ` : ''}
          
          /* =================== RESPONSIVE =================== */
          @media (max-width: 768px) {
            .permits-grid { 
              grid-template-columns: 1fr; 
              gap: 16px; 
            }
            
            .search-grid { 
              grid-template-columns: 1fr; 
              gap: 8px; 
            }
            
            .summary-stats { 
              grid-template-columns: repeat(2, 1fr); 
            }
            
            .permit-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 6px;
            }
            
            .validation-inputs {
              grid-template-columns: 1fr;
            }
            
            .category-select {
              min-width: auto;
            }
          }
          
          @media (max-width: 480px) {
            .step4-container {
              padding: 0;
            }
            
            .summary-header,
            .search-section {
              padding: 16px;
              margin-bottom: 16px;
            }
            
            .summary-stats {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            
            .permit-card {
              padding: 16px;
            }
            
            .no-results {
              padding: 40px 16px;
            }
          }
          
          /* =================== ANIMATIONS =================== */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .permit-card {
            animation: fadeIn 0.3s ease-out;
          }
          
          .stat-item {
            animation: fadeIn 0.4s ease-out;
          }
        `
      }} />

      <div className="step4-container">
        {/* En-tête avec résumé */}
        <div className="summary-header">
          <div className="summary-title">
            <Shield size={24} />
            {texts.title}
          </div>
          <p className="summary-subtitle">
            {texts.subtitle}
          </p>
          
          {stats.totalSelected > 0 && (
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{stats.totalSelected}</div>
                <div className="stat-label">{texts.permitsSelected}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.criticalPermits}</div>
                <div className="stat-label">{texts.criticalPermits}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.validationRate}%</div>
                <div className="stat-label">{texts.validationRate}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.averageProgress}%</div>
                <div className="stat-label">{texts.implementationRate}</div>
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
              <option value="all">
                {texts.allCategories} ({permits.length})
              </option>
              {categories.map(category => {
                const count = permits.filter(p => p.category === category).length;
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
            const typeConfig = config[permit.type];
            
            return (
              <div 
                key={permit.id} 
                className={`permit-card ${isSelected ? 'selected' : ''} ${permit.riskLevel}`}
              >
                {/* Header avec sélection */}
                <div className="permit-header" onClick={() => handlePermitToggle(permit.id)}>
                  <div className="permit-icon">{permit.icon}</div>
                  <div className="permit-content">
                    <h3 className="permit-name">{permit.name}</h3>
                    <div className="permit-category">{permit.category}</div>
                    <div className="permit-description">{permit.description[language]}</div>
                  </div>
                  <div className={`permit-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Détails du permis */}
                <div className="permit-details">
                  <div className="permit-meta">
                    <div 
                      className="risk-badge"
                      style={{ 
                        background: `${getRiskColor(permit.riskLevel)}20`,
                        color: getRiskColor(permit.riskLevel)
                      }}
                    >
                      {getRiskLabel(permit.riskLevel)}
                    </div>
                    <div className="time-badge">
                      {permit.estimatedDuration} {texts.minutes}
                    </div>
                  </div>
                  
                  {permit.tags.length > 0 && (
                    <div className="tags-container">
                      {permit.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag-item">{tag}</span>
                      ))}
                      {permit.tags.length > 3 && (
                        <span className="tag-item">+{permit.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="legislation-info">{permit.legislation}</div>
                </div>

                {/* Section progression (si sélectionné) */}
                {isSelected && permit.progress > 0 && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progression</span>
                      <span className="progress-value">{permit.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${permit.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Section panneaux de validation (si sélectionné) */}
                {isSelected && (
                  <div className="validation-panels">
                    <div className="panels-header">
                      <Eye size={16} />
                      {texts.validationPanels} ({permit.validationPanels.filter(p => p.validated).length}/{permit.validationPanels.length})
                    </div>
                    
                    <div className="panels-grid">
                      {permit.validationPanels
                        .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0))
                        .map(panel => (
                          <div key={panel.id} className="panel-item">
                            <div className="panel-header">
                              <div className="panel-title">
                                <span style={{ fontSize: '14px' }}>{panel.icon}</span>
                                <span>{panel.name[language]}</span>
                              </div>
                              <div className="panel-progress">
                                {panel.progress}%
                              </div>
                            </div>
                            
                            <div className="validation-items">
                              {panel.validationItems.map(item => (
                                <div key={item.id} className="validation-item">
                                  <div 
                                    className={`validation-checkbox ${item.completed ? 'checked' : ''}`}
                                    onClick={() => handleValidationItemToggle(permit.id, panel.id, item.id)}
                                  >
                                    {item.completed && <CheckCircle size={10} />}
                                  </div>
                                  
                                  <div className="validation-content">
                                    <div className="validation-name">{item.name[language]}</div>
                                    <div className="validation-description">{item.description[language]}</div>
                                    
                                    {item.completed && (
                                      <div className="validation-inputs">
                                        <input
                                          type="text"
                                          value={item.responsible || ''}
                                          onChange={(e) => updateValidationItem(permit.id, panel.id, item.id, 'responsible', e.target.value)}
                                          placeholder={texts.responsible}
                                          className="validation-input"
                                        />
                                        <input
                                          type="date"
                                          value={item.deadline || ''}
                                          onChange={(e) => updateValidationItem(permit.id, panel.id, item.id, 'deadline', e.target.value)}
                                          className="validation-input"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {/* Standards/Normes associées */}
                    {permit.standardsReferences && permit.standardsReferences.length > 0 && (
                      <div className="standards-section">
                        <div className="standards-label">{texts.standardsReferences}</div>
                        <div className="standards-list">
                          {permit.standardsReferences.map((standard) => (
                            <div key={standard.id} className="standard-item">
                              <a
                                href={standard.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="standard-link"
                                title={`${standard.fullName} - ${standard.description}`}
                              >
                                <div className="standard-badge">
                                  <span className="standard-name">{standard.name}</span>
                                  {standard.mandatory && <span className="mandatory-indicator">*</span>}
                                </div>
                                <div className="standard-section">{standard.section}</div>
                              </a>
                              <div className="standard-tooltip">
                                <strong>{standard.fullName}</strong><br/>
                                {standard.description}<br/>
                                <em>{standard.mandatory ? texts.mandatory : texts.recommended}</em>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredPermits.length === 0 && (
          <div className="no-results">
            <Shield size={48} className="no-results-icon" />
            <h3 className="no-results-title">{texts.noPermitsFound}</h3>
            <p className="no-results-description">{texts.noPermitsMessage}</p>
          </div>
        )}

        {/* Section d'erreurs de validation */}
        {errors?.permits && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              marginBottom: '8px',
              fontWeight: 600
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

        {/* Notifications du système */}
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
            {notifications.slice(0, 3).map(notification => (
              <div
                key={notification.id}
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
                  backdropFilter: 'blur(10px)',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {notification.type === 'error' && <AlertTriangle size={16} />}
                  {notification.type === 'warning' && <AlertTriangle size={16} />}
                  {notification.type === 'success' && <CheckCircle size={16} />}
                  <span>{notification.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Indicateur de chargement */}
        {(dataLoading || validationLoading) && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 2000,
            backdropFilter: 'blur(10px)'
          }}>
            <Activity size={20} className="animate-spin" />
            <span>{language === 'fr' ? 'Chargement...' : 'Loading...'}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Step4Permits;
