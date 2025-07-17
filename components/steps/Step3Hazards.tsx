"use client";

import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, Search, CheckCircle, Shield, Eye, 
  Zap, Wrench, Wind, Thermometer, Volume2, Activity,
  Plus, BarChart3, Star
} from 'lucide-react';

// =================== INTERFACES ===================
interface Step3HazardsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Hazard {
  id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  legislation: string;
  icon: string;
  selected: boolean;
  controlMeasures: ControlMeasure[];
}

interface ControlMeasure {
  id: string;
  name: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  priority: number;
  implemented: boolean;
  responsible?: string;
  deadline?: string;
  notes?: string;
  standards?: Standard[];
}

interface Standard {
  id: string;
  name: string;
  fullName: string;
  url?: string;
  section?: string;
  description: string;
  mandatory: boolean;
}

// =================== SYSTÈME DE TRADUCTIONS COMPLET ===================
const translations = {
  fr: {
    // En-tête
    title: "⚠️ Identification des Dangers & Risques",
    subtitle: "Sélectionnez les dangers potentiels et définissez les moyens de contrôle requis",
    
    // Statistiques
    stats: {
      totalHazards: "Dangers identifiés",
      criticalHazards: "Risques critiques",
      selectedHazards: "Dangers sélectionnés",
      implementationRate: "Taux d'implantation"
    },
    
    // Recherche
    searchPlaceholder: "Rechercher un danger...",
    allCategories: "Toutes catégories",
    allRisks: "Tous les risques",
    
    // Messages d'affichage
    noHazardsFound: "Aucun danger trouvé",
    noHazardsMessage: "Modifiez vos critères de recherche pour voir plus de dangers",
    
    // Niveaux de risque
    riskLevels: {
      critical: "Critique",
      high: "Élevé", 
      medium: "Moyen",
      low: "Faible"
    },
    
    // Catégories de dangers
    hazardCategories: {
      electrical: "Électrique",
      mechanical: "Mécanique", 
      physical: "Physique",
      chemical: "Chimique",
      ergonomic: "Ergonomique",
      environmental: "Environnemental",
      psychosocial: "Psychosocial",
      fire: "Incendie",
      transport: "Transport"
    },
    
    // Messages
    controlMeasures: "Moyens de contrôle",
    
    // Standards
    standards: {
      title: "Normes & Références",
      description: "Standards applicables et documentation officielle",
      viewDocument: "Voir document"
    },
    
    // Dangers spécifiques
    hazards: {
      "elec-shock": {
        name: "Électrocution / Électrisation",
        description: "Contact direct ou indirect avec parties sous tension"
      },
      "arc-flash": {
        name: "Arc électrique",
        description: "Arc électrique lors de manœuvres sous tension"
      },
      "moving-parts": {
        name: "Pièces mobiles",
        description: "Écrasement, coincement par pièces mobiles"
      },
      "falls": {
        name: "Chutes de hauteur",
        description: "Chutes de plus de 3 mètres"
      },
      "confined-spaces": {
        name: "Espaces clos",
        description: "Atmosphères dangereuses, engloutissement"
      },
      "toxic-vapors": {
        name: "Vapeurs toxiques",
        description: "Inhalation de substances dangereuses"
      },
      "fire-explosion": {
        name: "Incendie/Explosion",
        description: "Feu, explosion de matières inflammables"
      },
      "vehicle-traffic": {
        name: "Circulation véhiculaire",
        description: "Collision avec véhicules, engins"
      }
    },
    
    // Mesures de contrôle
    controlMeasuresData: {
      "cm-elec-1": {
        name: "Consignation LOTO complète",
        description: "Isolation complète des sources d'énergie"
      },
      "cm-elec-2": {
        name: "Vérification absence de tension (VAT)",
        description: "Test avec voltmètre certifié"
      },
      "cm-fall-1": {
        name: "Garde-corps permanents",
        description: "Barrières de protection"
      },
      "cm-fall-2": {
        name: "Harnais de sécurité",
        description: "Système antichute"
      },
      "cm-conf-1": {
        name: "Permis d'entrée",
        description: "Autorisation documentée"
      },
      "cm-conf-2": {
        name: "Test atmosphérique",
        description: "Détection 4 gaz minimum"
      },
      "cm-chem-1": {
        name: "Ventilation mécanique",
        description: "Extraction d'air"
      },
      "cm-fire-1": {
        name: "Permis de travail à chaud",
        description: "Autorisation soudage/coupage"
      },
      "cm-traf-1": {
        name: "Signalisation temporaire",
        description: "Cônes, panneaux, feux"
      }
    }
  },
  
  en: {
    // Header
    title: "⚠️ Hazard & Risk Identification",
    subtitle: "Select potential hazards and define required control measures",
    
    // Statistics
    stats: {
      totalHazards: "Hazards identified",
      criticalHazards: "Critical risks",
      selectedHazards: "Selected hazards",
      implementationRate: "Implementation rate"
    },
    
    // Search
    searchPlaceholder: "Search for a hazard...",
    allCategories: "All categories",
    allRisks: "All risks",
    
    // Display messages
    noHazardsFound: "No hazards found",
    noHazardsMessage: "Modify your search criteria to see more hazards",
    
    // Risk levels
    riskLevels: {
      critical: "Critical",
      high: "High",
      medium: "Medium", 
      low: "Low"
    },
    
    // Hazard categories
    hazardCategories: {
      electrical: "Electrical",
      mechanical: "Mechanical",
      physical: "Physical",
      chemical: "Chemical",
      ergonomic: "Ergonomic",
      environmental: "Environmental",
      psychosocial: "Psychosocial",
      fire: "Fire",
      transport: "Transport"
    },
    
    // Messages
    controlMeasures: "Control measures",
    
    // Standards
    standards: {
      title: "Standards & References",
      description: "Applicable standards and official documentation",
      viewDocument: "View document"
    },
    
    // Specific hazards
    hazards: {
      "elec-shock": {
        name: "Electrocution / Electric shock",
        description: "Direct or indirect contact with live parts"
      },
      "arc-flash": {
        name: "Arc flash",
        description: "Electric arc during live work operations"
      },
      "moving-parts": {
        name: "Moving parts",
        description: "Crushing, pinching by moving parts"
      },
      "falls": {
        name: "Falls from height",
        description: "Falls from more than 3 meters"
      },
      "confined-spaces": {
        name: "Confined spaces",
        description: "Dangerous atmospheres, engulfment"
      },
      "toxic-vapors": {
        name: "Toxic vapors",
        description: "Inhalation of hazardous substances"
      },
      "fire-explosion": {
        name: "Fire/Explosion",
        description: "Fire, explosion of flammable materials"
      },
      "vehicle-traffic": {
        name: "Vehicle traffic",
        description: "Collision with vehicles, equipment"
      }
    },
    
    // Control measures
    controlMeasuresData: {
      "cm-elec-1": {
        name: "Complete LOTO lockout",
        description: "Complete isolation of energy sources"
      },
      "cm-elec-2": {
        name: "Absence of voltage verification",
        description: "Test with certified voltmeter"
      },
      "cm-fall-1": {
        name: "Permanent guardrails",
        description: "Protection barriers"
      },
      "cm-fall-2": {
        name: "Safety harness",
        description: "Fall arrest system"
      },
      "cm-conf-1": {
        name: "Entry permit",
        description: "Documented authorization"
      },
      "cm-conf-2": {
        name: "Atmospheric testing",
        description: "Minimum 4-gas detection"
      },
      "cm-chem-1": {
        name: "Mechanical ventilation",
        description: "Air extraction"
      },
      "cm-fire-1": {
        name: "Hot work permit",
        description: "Welding/cutting authorization"
      },
      "cm-traf-1": {
        name: "Temporary signaling",
        description: "Cones, signs, lights"
      }
    }
  }
};

// =================== FONCTION POUR GÉNÉRER LA LISTE DE DANGERS ===================
const getHazardsList = (language: 'fr' | 'en'): Hazard[] => {
  const t = translations[language];
  
  return [
    {
      id: 'elec-shock',
      name: t.hazards['elec-shock'].name,
      category: t.hazardCategories.electrical,
      description: t.hazards['elec-shock'].description,
      riskLevel: 'critical' as const,
      legislation: 'CSA Z462, RSST Art. 185',
      icon: '⚡',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-elec-1', 
          name: t.controlMeasuresData['cm-elec-1'].name,
          category: 'elimination' as const,
          description: t.controlMeasuresData['cm-elec-1'].description,
          priority: 1, 
          implemented: false
        },
        { 
          id: 'cm-elec-2', 
          name: t.controlMeasuresData['cm-elec-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-elec-2'].description,
          priority: 2, 
          implemented: false
        }
      ]
    },
    {
      id: 'arc-flash',
      name: t.hazards['arc-flash'].name,
      category: t.hazardCategories.electrical,
      description: t.hazards['arc-flash'].description,
      riskLevel: 'critical' as const,
      legislation: 'CSA Z462, NFPA 70E',
      icon: '🔥',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-arc-1', 
          name: "Analyse d'arc électrique",
          category: 'engineering' as const,
          description: "Calcul énergie incidente",
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'moving-parts',
      name: t.hazards['moving-parts'].name,
      category: t.hazardCategories.mechanical,
      description: t.hazards['moving-parts'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 182-184',
      icon: '⚙️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-mech-1', 
          name: "Arrêt complet des équipements",
          category: 'elimination' as const,
          description: "Immobilisation totale",
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'falls',
      name: t.hazards['falls'].name,
      category: t.hazardCategories.physical,
      description: t.hazards['falls'].description,
      riskLevel: 'critical' as const,
      legislation: 'RSST Art. 347, CSA Z259',
      icon: '🪂',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-fall-1', 
          name: t.controlMeasuresData['cm-fall-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-fall-1'].description,
          priority: 1, 
          implemented: false
        },
        { 
          id: 'cm-fall-2', 
          name: t.controlMeasuresData['cm-fall-2'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-fall-2'].description,
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'confined-spaces',
      name: t.hazards['confined-spaces'].name,
      category: t.hazardCategories.physical,
      description: t.hazards['confined-spaces'].description,
      riskLevel: 'critical' as const,
      legislation: 'RSST Art. 302-317',
      icon: '🕳️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-conf-1', 
          name: t.controlMeasuresData['cm-conf-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-conf-1'].description,
          priority: 1, 
          implemented: false
        },
        { 
          id: 'cm-conf-2', 
          name: t.controlMeasuresData['cm-conf-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-conf-2'].description,
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'toxic-vapors',
      name: t.hazards['toxic-vapors'].name,
      category: t.hazardCategories.chemical,
      description: t.hazards['toxic-vapors'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 44, SIMDUT',
      icon: '☠️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-chem-1', 
          name: t.controlMeasuresData['cm-chem-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-chem-1'].description,
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'fire-explosion',
      name: t.hazards['fire-explosion'].name,
      category: t.hazardCategories.fire,
      description: t.hazards['fire-explosion'].description,
      riskLevel: 'critical' as const,
      legislation: 'Code de construction, NFPA',
      icon: '🔥',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-fire-1', 
          name: t.controlMeasuresData['cm-fire-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-fire-1'].description,
          priority: 1, 
          implemented: false
        }
      ]
    },
    {
      id: 'vehicle-traffic',
      name: t.hazards['vehicle-traffic'].name,
      category: t.hazardCategories.transport,
      description: t.hazards['vehicle-traffic'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 320-340',
      icon: '🚛',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-traf-1', 
          name: t.controlMeasuresData['cm-traf-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-traf-1'].description,
          priority: 1, 
          implemented: false
        }
      ]
    }
  ];
};

// =================== STANDARDS ET NORMES ===================
const getStandards = (language: 'fr' | 'en') => [
  {
    name: 'CSA Z462',
    description: language === 'fr' ? 'Sécurité en milieu de travail - Énergie électrique' : 'Workplace electrical safety',
    url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z462'
  },
  {
    name: 'RSST Québec',
    description: language === 'fr' ? 'Règlement sur la santé et la sécurité du travail' : 'Occupational Health and Safety Regulation',
    url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/'
  },
  {
    name: 'CSA Z259',
    description: language === 'fr' ? 'Protection contre les chutes' : 'Fall protection',
    url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z259-10'
  },
  {
    name: 'NFPA 70E',
    description: language === 'fr' ? 'Norme sécurité électrique' : 'Standard for Electrical Safety',
    url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70E'
  }
];

// =================== FONCTION ICÔNES CATÉGORIES ===================
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: string } = {
    'Électrique': '⚡',
    'Electrical': '⚡',
    'Mécanique': '⚙️',
    'Mechanical': '⚙️',
    'Physique': '🏗️',
    'Physical': '🏗️',
    'Chimique': '🧪',
    'Chemical': '🧪',
    'Ergonomique': '🏋️',
    'Ergonomic': '🏋️',
    'Environnemental': '🌪️',
    'Environmental': '🌪️',
    'Psychosocial': '🧠',
    'Incendie': '🔥',
    'Fire': '🔥',
    'Transport': '🚛'
  };
  
  return iconMap[category] || '⚠️';
};
// =================== COMPOSANT PRINCIPAL ===================
const Step3Hazards: React.FC<Step3HazardsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = translations[language];
  const standards = getStandards(language);
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  
  // Initialiser avec la liste complète des dangers traduits
  const [hazards, setHazards] = useState<Hazard[]>(() => {
    if (formData.step3?.hazards?.list && formData.step3.hazards.list.length > 0) {
      // Si nous avons déjà des dangers sauvegardés, les utiliser mais mettre à jour les traductions
      const savedHazards = formData.step3.hazards.list;
      const translatedHazards = getHazardsList(language);
      
      // Fusionner les données sauvegardées avec les nouvelles traductions
      return translatedHazards.map(translatedItem => {
        const savedItem = savedHazards.find((saved: Hazard) => saved.id === translatedItem.id);
        return savedItem ? { 
          ...translatedItem, 
          selected: savedItem.selected,
          controlMeasures: translatedItem.controlMeasures.map(translatedControl => {
            const savedControl = savedItem.controlMeasures?.find((sc: ControlMeasure) => sc.id === translatedControl.id);
            return savedControl ? { 
              ...translatedControl, 
              implemented: savedControl.implemented,
              responsible: savedControl.responsible,
              deadline: savedControl.deadline,
              notes: savedControl.notes
            } : translatedControl;
          })
        } : translatedItem;
      });
    }
    return getHazardsList(language);
  });

  // =================== FONCTIONS UTILITAIRES ===================
  
  // Filtrage des dangers avec recherche intelligente
  const filteredHazards = useMemo(() => {
    return hazards.filter(hazard => {
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        hazard.name.toLowerCase().includes(searchLower) ||
        hazard.description.toLowerCase().includes(searchLower) ||
        hazard.category.toLowerCase().includes(searchLower) ||
        hazard.legislation.toLowerCase().includes(searchLower);
      
      const matchesCategory = filterCategory === '' || hazard.category === t.hazardCategories[filterCategory as keyof typeof t.hazardCategories];
      const matchesRisk = filterRisk === '' || hazard.riskLevel === filterRisk;
      
      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [hazards, searchTerm, filterCategory, filterRisk, t.hazardCategories]);

  // Dangers sélectionnés
  const selectedHazards = useMemo(() => {
    return hazards.filter(h => h.selected);
  }, [hazards]);

  // =================== CALCUL DES STATISTIQUES CORRIGÉ ===================
  const stats = useMemo(() => {
    const totalHazards = selectedHazards.length;
    const criticalHazards = selectedHazards.filter(h => h.riskLevel === 'critical').length;
    const highRiskHazards = selectedHazards.filter(h => h.riskLevel === 'high').length;
    
    const totalControls = selectedHazards.reduce((acc, hazard) => acc + hazard.controlMeasures.length, 0);
    const implementedControls = selectedHazards.reduce((acc, hazard) => {
      return acc + hazard.controlMeasures.filter(control => control.implemented).length;
    }, 0);
    
    // Calcul du taux d'implémentation - CORRECTION ICI
    const implementationRate = totalControls > 0 
      ? Math.round((implementedControls / totalControls) * 100) 
      : 0;
    
    return {
      totalHazards,
      totalControls,
      implementedControls,
      criticalHazards,
      highRiskHazards,
      implementationRate // ← AJOUT de cette propriété manquante
    };
  }, [selectedHazards]);

  // =================== FONCTIONS UTILITAIRES POUR LES CONTRÔLES ===================
  
  const isControlImplemented = (hazardId: string, controlId: string): boolean => {
    const hazard = hazards.find(h => h.id === hazardId);
    if (!hazard) return false;
    const control = hazard.controlMeasures.find(c => c.id === controlId);
    return control?.implemented || false;
  };

  const getSelectedControlsCount = (hazardId: string): number => {
    const hazard = hazards.find(h => h.id === hazardId);
    if (!hazard) return 0;
    return hazard.controlMeasures.filter(c => c.implemented).length;
  };

  // =================== HANDLERS ===================
  
  const handleHazardToggle = (hazardId: string) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? { ...hazard, selected: !hazard.selected }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const toggleControl = (hazardId: string, controlId: string) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? {
            ...hazard,
            controlMeasures: hazard.controlMeasures.map(control =>
              control.id === controlId
                ? { ...control, implemented: !control.implemented }
                : control
            )
          }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const updateControlMeasure = (hazardId: string, controlId: string, field: keyof ControlMeasure, value: any) => {
    const updatedHazards = hazards.map(hazard => 
      hazard.id === hazardId 
        ? {
            ...hazard,
            controlMeasures: hazard.controlMeasures.map(control =>
              control.id === controlId
                ? { ...control, [field]: value }
                : control
            )
          }
        : hazard
    );
    setHazards(updatedHazards);
    updateFormData(updatedHazards);
  };

  const updateFormData = (updatedHazards: Hazard[]) => {
    const selectedList = updatedHazards.filter(h => h.selected);
    
    const hazardsData = {
      list: updatedHazards,
      selected: selectedList,
      stats: {
        totalHazards: selectedList.length,
        totalControls: selectedList.reduce((acc, h) => acc + h.controlMeasures.length, 0),
        implementedControls: selectedList.reduce((acc, h) => 
          acc + h.controlMeasures.filter(c => c.implemented).length, 0
        ),
        implementationRate: selectedList.reduce((acc, h) => acc + h.controlMeasures.length, 0) > 0 
          ? Math.round((selectedList.reduce((acc, h) => 
              acc + h.controlMeasures.filter(c => c.implemented).length, 0
            ) / selectedList.reduce((acc, h) => acc + h.controlMeasures.length, 0)) * 100)
          : 0,
        criticalHazards: selectedList.filter(h => h.riskLevel === 'critical').length,
        highRiskHazards: selectedList.filter(h => h.riskLevel === 'high').length,
        categories: Array.from(new Set(selectedList.map(h => h.category)))
      }
    };
    
    onDataChange('step3', { ...formData.step3, hazards: hazardsData });
  };

  // =================== FONCTIONS DE STYLE ===================
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskLabel = (level: string) => {
    return t.riskLevels[level as keyof typeof t.riskLevels] || level;
  };

  const getControlCategoryColor = (category: string) => {
    switch (category) {
      case 'elimination': return '#dc2626';
      case 'substitution': return '#ea580c';
      case 'engineering': return '#3b82f6';
      case 'administrative': return '#8b5cf6';
      case 'ppe': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getControlCategoryIcon = (category: string) => {
    switch (category) {
      case 'elimination': return '❌';
      case 'substitution': return '🔄';
      case 'engineering': return '🔧';
      case 'administrative': return '📋';
      case 'ppe': return '🛡️';
      default: return '❓';
    }
  };

  // =================== EFFET POUR METTRE À JOUR LES TRADUCTIONS ===================
  React.useEffect(() => {
    // Mettre à jour les traductions quand la langue change
    const translatedHazards = getHazardsList(language);
    const updatedHazards = translatedHazards.map(translatedItem => {
      const currentItem = hazards.find(item => item.id === translatedItem.id);
      return currentItem ? { 
        ...translatedItem, 
        selected: currentItem.selected,
        controlMeasures: translatedItem.controlMeasures.map(translatedControl => {
          const currentControl = currentItem.controlMeasures?.find(cc => cc.id === translatedControl.id);
          return currentControl ? { 
            ...translatedControl, 
            implemented: currentControl.implemented,
            responsible: currentControl.responsible,
            deadline: currentControl.deadline,
            notes: currentControl.notes
          } : translatedControl;
        })
      } : translatedItem;
    });
    setHazards(updatedHazards);
  }, [language]);

  // =================== EFFET POUR SAUVEGARDER AUTOMATIQUEMENT ===================
  React.useEffect(() => {
    updateFormData(hazards);
  }, [hazards]);

  // =================== COMPOSANTS UTILITAIRES ===================
  
  const SearchControls = () => (
    <div style={{
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            opacity: 0.6,
            color: '#ffffff'
          }} 
        />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            padding: '12px 16px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px'
          }}
        />
      </div>
      
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        style={{
          padding: '12px 16px',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#ffffff',
          minWidth: '150px'
        }}
      >
        <option value="">{t.allCategories}</option>
        {Object.entries(t.hazardCategories).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
      
      <select
        value={filterRisk}
        onChange={(e) => setFilterRisk(e.target.value)}
        style={{
          padding: '12px 16px',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#ffffff',
          minWidth: '150px'
        }}
      >
        <option value="">{t.allRisks}</option>
        {Object.entries(t.riskLevels).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
    </div>
  );

  const StatsGrid = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '25px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          color: '#f59e0b'
        }}>
          {filteredHazards.length}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {t.stats.totalHazards}
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          color: '#dc2626'
        }}>
          {filteredHazards.filter(h => h.riskLevel === 'critical').length}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {t.stats.criticalHazards}
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          color: '#3b82f6'
        }}>
          {selectedHazards.length}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {t.stats.selectedHazards}
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          color: '#16a34a'
        }}>
          {stats.implementationRate}%
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {t.stats.implementationRate}
        </div>
      </div>
    </div>
  );
  return (
    <>
      {/* CSS pour le design optimisé et responsive */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hazards-container { 
            padding: 0; 
            color: #ffffff;
            background: transparent;
          }
          
          .hazards-header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .hazards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
          }
          
          .hazard-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .hazard-card:hover {
            transform: translateY(-2px);
            border-color: rgba(59, 130, 246, 0.6);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }
          
          .hazard-card.selected {
            border-color: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          
          .hazard-header {
            padding: 15px;
            border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          }
          
          .hazard-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
            flex-wrap: wrap;
          }
          
          .hazard-name {
            font-weight: bold;
            font-size: 16px;
            flex: 1;
          }
          
          .risk-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
          }
          
          .hazard-description {
            font-size: 13px;
            opacity: 0.9;
            line-height: 1.4;
            margin-bottom: 8px;
          }
          
          .hazard-legislation {
            font-size: 11px;
            opacity: 0.7;
            font-style: italic;
          }
          
          .controls-section {
            padding: 15px;
          }
          
          .controls-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-weight: bold;
            font-size: 14px;
          }
          
          .controls-grid {
            display: grid;
            gap: 8px;
          }
          
          .control-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 6px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .control-item:hover {
            border-color: rgba(59, 130, 246, 0.4);
            background: rgba(15, 23, 42, 0.8);
          }
          
          .control-item.implemented {
            border-color: #3b82f6;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
          }
          
          .control-info {
            flex: 1;
          }
          
          .control-name {
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .control-description {
            font-size: 11px;
            opacity: 0.7;
            line-height: 1.3;
          }
          
          .control-checkbox {
            width: 18px;
            height: 18px;
            border-radius: 4px;
            border: 2px solid rgba(59, 130, 246, 0.5);
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .control-checkbox.checked {
            background: #3b82f6;
            border-color: #3b82f6;
          }
          
          .standards-section {
            margin-top: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          
          .standards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .standard-card {
            padding: 12px;
            background: rgba(15, 23, 42, 0.6);
            border-radius: 8px;
            border: 1px solid rgba(59, 130, 246, 0.2);
            transition: all 0.2s ease;
          }
          
          .standard-card:hover {
            border-color: rgba(59, 130, 246, 0.5);
            transform: translateY(-1px);
          }
          
          .standard-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
            color: #60a5fa;
          }
          
          .standard-description {
            font-size: 12px;
            opacity: 0.8;
            line-height: 1.3;
            margin-bottom: 8px;
          }
          
          .standard-link {
            font-size: 11px;
            color: #3b82f6;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .standard-link:hover {
            text-decoration: underline;
          }
          
          .no-hazards {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.7;
          }
          
          .no-hazards-icon {
            margin-bottom: 15px;
            opacity: 0.5;
          }
          
          @media (max-width: 768px) {
            .hazards-container {
              padding: 0 10px;
            }
            
            .hazards-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .standards-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            
            .hazard-title {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
          }
          
          @media (max-width: 480px) {
            .hazard-header,
            .controls-section {
              padding: 12px;
            }
            
            .standards-section {
              padding: 15px;
            }
          }
        `
      }} />

      <div className="hazards-container">
        {/* Header avec titre */}
        <div className="hazards-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <AlertTriangle size={24} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              {t.title}
            </h2>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Contrôles de recherche */}
        <SearchControls />

        {/* Statistiques */}
        <StatsGrid />

        {/* Grille des dangers */}
        {filteredHazards.length > 0 ? (
          <div className="hazards-grid">
            {filteredHazards.map((hazard) => {
              const isSelected = hazard.selected;
              
              return (
                <div 
                  key={hazard.id}
                  className={`hazard-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleHazardToggle(hazard.id)}
                >
                  {/* Header du danger */}
                  <div className="hazard-header">
                    <div className="hazard-title">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ fontSize: '20px' }}>
                          {getCategoryIcon(hazard.category)}
                        </span>
                        <span className="hazard-name">{hazard.name}</span>
                      </div>
                      <div 
                        className="risk-badge"
                        style={{ 
                          backgroundColor: getRiskColor(hazard.riskLevel)
                        }}
                      >
                        {getRiskLabel(hazard.riskLevel)}
                      </div>
                    </div>
                    <p className="hazard-description">
                      {hazard.description}
                    </p>
                    <p className="hazard-legislation">
                      📋 {hazard.legislation}
                    </p>
                  </div>

                  {/* Section des contrôles - seulement si sélectionné */}
                  {isSelected && (
                    <div className="controls-section">
                      <div className="controls-title">
                        <Shield size={16} color="#3b82f6" />
                        <span>{t.controlMeasures}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          opacity: 0.7,
                          marginLeft: 'auto'
                        }}>
                          {getSelectedControlsCount(hazard.id)}/{hazard.controlMeasures.length}
                        </span>
                      </div>
                      
                      <div className="controls-grid">
                        {hazard.controlMeasures.map((control) => {
                          const isImplemented = isControlImplemented(hazard.id, control.id);
                          
                          return (
                            <div
                              key={control.id}
                              className={`control-item ${isImplemented ? 'implemented' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleControl(hazard.id, control.id);
                              }}
                            >
                              <div className="control-info">
                                <div className="control-name">
                                  <span style={{ color: getControlCategoryColor(control.category) }}>
                                    {getControlCategoryIcon(control.category)}
                                  </span>
                                  {control.name}
                                </div>
                                <div className="control-description">
                                  {control.description}
                                </div>
                              </div>
                              <div className={`control-checkbox ${isImplemented ? 'checked' : ''}`}>
                                {isImplemented && <CheckCircle size={12} color="white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-hazards">
            <div className="no-hazards-icon">
              <AlertTriangle size={48} color="#6b7280" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
              {t.noHazardsFound}
            </h3>
            <p style={{ margin: 0, opacity: 0.7 }}>
              {t.noHazardsMessage}
            </p>
          </div>
        )}

        {/* Section Standards et Normes */}
        <div className="standards-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <BarChart3 size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              {t.standards.title}
            </h3>
          </div>
          <p style={{ margin: '0 0 15px 0', opacity: 0.8, fontSize: '13px' }}>
            {t.standards.description}
          </p>
          
          <div className="standards-grid">
            {standards.map((standard, index) => (
              <div key={index} className="standard-card">
                <div className="standard-name">{standard.name}</div>
                <div className="standard-description">{standard.description}</div>
                <a 
                  href={standard.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="standard-link"
                >
                  <Eye size={12} />
                  {t.standards.viewDocument}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé des dangers sélectionnés */}
        {selectedHazards.length > 0 && (
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <CheckCircle size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                Résumé des dangers identifiés
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>Dangers sélectionnés:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {selectedHazards.length}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>Contrôles identifiés:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {stats.totalControls}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>Contrôles implantés:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.implementedControls}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '5px' }}>Taux d'implantation:</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: stats.implementationRate >= 80 ? '#10b981' : stats.implementationRate >= 50 ? '#f59e0b' : '#dc2626' }}>
                  {stats.implementationRate}%
                </div>
              </div>
            </div>

            {/* Liste des catégories sélectionnées */}
            <div style={{ marginTop: '15px' }}>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>Catégories de dangers identifiées:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Array.from(new Set(selectedHazards.map(h => h.category))).map(category => (
                  <span 
                    key={category}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Step3Hazards;
