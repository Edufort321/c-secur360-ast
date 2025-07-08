"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, Search, Filter, CheckCircle, Shield, Eye, 
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
}

// =================== DANGERS PRÉDÉFINIS ===================
const hazardsList: Hazard[] = [
  // ÉLECTRIQUES
  {
    id: 'elec-shock',
    name: 'Électrocution / Électrisation',
    category: 'Électrique',
    description: 'Contact direct ou indirect avec parties sous tension',
    riskLevel: 'critical',
    legislation: 'CSA Z462, RSST Art. 185',
    icon: '⚡',
    selected: false,
    controlMeasures: [
      { id: 'cm-elec-1', name: 'Consignation LOTO complète', category: 'elimination', description: 'Isolation complète des sources d\'énergie', priority: 1, implemented: false },
      { id: 'cm-elec-2', name: 'Vérification absence de tension (VAT)', category: 'engineering', description: 'Test avec voltmètre certifié', priority: 2, implemented: false },
      { id: 'cm-elec-3', name: 'Gants isolants classe appropriée', category: 'ppe', description: 'Gants diélectriques testés', priority: 3, implemented: false },
      { id: 'cm-elec-4', name: 'Formation électrique qualifiée', category: 'administrative', description: 'Personnel certifié travaux électriques', priority: 2, implemented: false },
      { id: 'cm-elec-5', name: 'Double vérification par témoin', category: 'administrative', description: 'Validation croisée des procédures', priority: 3, implemented: false }
    ]
  },
  {
    id: 'arc-flash',
    name: 'Arc électrique',
    category: 'Électrique',
    description: 'Arc électrique lors de manœuvres sous tension',
    riskLevel: 'critical',
    legislation: 'CSA Z462, NFPA 70E',
    icon: '🔥',
    selected: false,
    controlMeasures: [
      { id: 'cm-arc-1', name: 'Analyse d\'arc électrique', category: 'engineering', description: 'Calcul énergie incidente', priority: 1, implemented: false },
      { id: 'cm-arc-2', name: 'Vêtements résistants à l\'arc', category: 'ppe', description: 'Habit arc-flash certifié', priority: 1, implemented: false },
      { id: 'cm-arc-3', name: 'Distance de sécurité respectée', category: 'administrative', description: 'Périmètre de protection', priority: 2, implemented: false },
      { id: 'cm-arc-4', name: 'Procédures de manœuvre sécuritaires', category: 'administrative', description: 'Protocoles standardisés', priority: 2, implemented: false }
    ]
  },

  // MÉCANIQUES
  {
    id: 'moving-parts',
    name: 'Pièces mobiles',
    category: 'Mécanique',
    description: 'Écrasement, coincement par pièces mobiles',
    riskLevel: 'high',
    legislation: 'RSST Art. 182-184',
    icon: '⚙️',
    selected: false,
    controlMeasures: [
      { id: 'cm-mech-1', name: 'Arrêt complet des équipements', category: 'elimination', description: 'Immobilisation totale', priority: 1, implemented: false },
      { id: 'cm-mech-2', name: 'Consignation mécanique', category: 'elimination', description: 'Blocage physique', priority: 1, implemented: false },
      { id: 'cm-mech-3', name: 'Protecteurs mécaniques', category: 'engineering', description: 'Barrières physiques', priority: 2, implemented: false },
      { id: 'cm-mech-4', name: 'Détecteurs de présence', category: 'engineering', description: 'Capteurs de sécurité', priority: 3, implemented: false },
      { id: 'cm-mech-5', name: 'Formation LOTO mécanique', category: 'administrative', description: 'Procédures de consignation', priority: 2, implemented: false }
    ]
  },
  {
    id: 'pressure',
    name: 'Systèmes sous pression',
    category: 'Mécanique',
    description: 'Explosion, projection due à la pression',
    riskLevel: 'high',
    legislation: 'CSA B51',
    icon: '💨',
    selected: false,
    controlMeasures: [
      { id: 'cm-press-1', name: 'Dépressurisation complète', category: 'elimination', description: 'Évacuation totale pression', priority: 1, implemented: false },
      { id: 'cm-press-2', name: 'Soupapes de sécurité', category: 'engineering', description: 'Protection surpression', priority: 2, implemented: false },
      { id: 'cm-press-3', name: 'Manomètres de contrôle', category: 'engineering', description: 'Surveillance continue', priority: 3, implemented: false },
      { id: 'cm-press-4', name: 'Procédures de purge', category: 'administrative', description: 'Protocoles standardisés', priority: 2, implemented: false }
    ]
  },

  // PHYSIQUES
  {
    id: 'falls',
    name: 'Chutes de hauteur',
    category: 'Physique',
    description: 'Chutes de plus de 3 mètres',
    riskLevel: 'critical',
    legislation: 'RSST Art. 347, CSA Z259',
    icon: '🪂',
    selected: false,
    controlMeasures: [
      { id: 'cm-fall-1', name: 'Garde-corps permanents', category: 'engineering', description: 'Barrières de protection', priority: 1, implemented: false },
      { id: 'cm-fall-2', name: 'Harnais de sécurité', category: 'ppe', description: 'Système antichute', priority: 1, implemented: false },
      { id: 'cm-fall-3', name: 'Filets de sécurité', category: 'engineering', description: 'Protection collective', priority: 2, implemented: false },
      { id: 'cm-fall-4', name: 'Points d\'ancrage certifiés', category: 'engineering', description: 'Ancrages structuraux', priority: 1, implemented: false },
      { id: 'cm-fall-5', name: 'Formation travail en hauteur', category: 'administrative', description: 'Certification hauteur', priority: 2, implemented: false }
    ]
  },
  {
    id: 'struck-objects',
    name: 'Objets qui tombent',
    category: 'Physique',
    description: 'Impact d\'objets en chute libre',
    riskLevel: 'high',
    legislation: 'RSST Art. 338',
    icon: '⬇️',
    selected: false,
    controlMeasures: [
      { id: 'cm-obj-1', name: 'Casque de protection', category: 'ppe', description: 'Protection crânienne', priority: 1, implemented: false },
      { id: 'cm-obj-2', name: 'Périmètre de sécurité', category: 'administrative', description: 'Zone d\'exclusion', priority: 1, implemented: false },
      { id: 'cm-obj-3', name: 'Filets de protection', category: 'engineering', description: 'Barrières anti-chute', priority: 2, implemented: false },
      { id: 'cm-obj-4', name: 'Inspection outillage', category: 'administrative', description: 'Vérification fixation', priority: 2, implemented: false }
    ]
  },

  // CHIMIQUES
  {
    id: 'toxic-vapors',
    name: 'Vapeurs toxiques',
    category: 'Chimique',
    description: 'Inhalation de substances dangereuses',
    riskLevel: 'high',
    legislation: 'RSST Art. 44, SIMDUT',
    icon: '☠️',
    selected: false,
    controlMeasures: [
      { id: 'cm-chem-1', name: 'Ventilation mécanique', category: 'engineering', description: 'Extraction d\'air', priority: 1, implemented: false },
      { id: 'cm-chem-2', name: 'Appareil respiratoire', category: 'ppe', description: 'Protection respiratoire', priority: 1, implemented: false },
      { id: 'cm-chem-3', name: 'Détection de gaz', category: 'engineering', description: 'Surveillance atmosphère', priority: 2, implemented: false },
      { id: 'cm-chem-4', name: 'Fiches de données sécurité', category: 'administrative', description: 'Information produits', priority: 3, implemented: false }
    ]
  },
  {
    id: 'chemical-burns',
    name: 'Brûlures chimiques',
    category: 'Chimique',
    description: 'Contact avec substances corrosives',
    riskLevel: 'medium',
    legislation: 'SIMDUT 2015',
    icon: '🧪',
    selected: false,
    controlMeasures: [
      { id: 'cm-burn-1', name: 'Gants chimiques', category: 'ppe', description: 'Protection cutanée', priority: 1, implemented: false },
      { id: 'cm-burn-2', name: 'Douche d\'urgence', category: 'engineering', description: 'Rinçage immédiat', priority: 1, implemented: false },
      { id: 'cm-burn-3', name: 'Lunettes de protection', category: 'ppe', description: 'Protection oculaire', priority: 2, implemented: false },
      { id: 'cm-burn-4', name: 'Protocole d\'urgence', category: 'administrative', description: 'Procédures d\'accident', priority: 2, implemented: false }
    ]
  },

  // ERGONOMIQUES
  {
    id: 'manual-handling',
    name: 'Manutention manuelle',
    category: 'Ergonomique',
    description: 'Troubles musculo-squelettiques',
    riskLevel: 'medium',
    legislation: 'RSST Art. 166',
    icon: '🏋️',
    selected: false,
    controlMeasures: [
      { id: 'cm-man-1', name: 'Équipements d\'aide', category: 'engineering', description: 'Outils de levage', priority: 1, implemented: false },
      { id: 'cm-man-2', name: 'Techniques de levage', category: 'administrative', description: 'Formation postures', priority: 2, implemented: false },
      { id: 'cm-man-3', name: 'Rotation des tâches', category: 'administrative', description: 'Limitation exposition', priority: 3, implemented: false },
      { id: 'cm-man-4', name: 'Limites de poids', category: 'administrative', description: 'Restrictions charges', priority: 2, implemented: false }
    ]
  },

  // ENVIRONNEMENTAUX
  {
    id: 'extreme-weather',
    name: 'Conditions météo extrêmes',
    category: 'Environnemental',
    description: 'Exposition aux intempéries',
    riskLevel: 'medium',
    legislation: 'Guide CNESST',
    icon: '🌪️',
    selected: false,
    controlMeasures: [
      { id: 'cm-weather-1', name: 'Surveillance météorologique', category: 'administrative', description: 'Veille conditions', priority: 1, implemented: false },
      { id: 'cm-weather-2', name: 'Vêtements adaptés', category: 'ppe', description: 'Protection climatique', priority: 2, implemented: false },
      { id: 'cm-weather-3', name: 'Abris temporaires', category: 'engineering', description: 'Protection physique', priority: 3, implemented: false },
      { id: 'cm-weather-4', name: 'Arrêt travaux si nécessaire', category: 'administrative', description: 'Protocole suspension', priority: 1, implemented: false }
    ]
  },
  {
    id: 'noise',
    name: 'Exposition au bruit',
    category: 'Environnemental',
    description: 'Dommages auditifs',
    riskLevel: 'medium',
    legislation: 'RSST Art. 141-151',
    icon: '🔊',
    selected: false,
    controlMeasures: [
      { id: 'cm-noise-1', name: 'Protection auditive', category: 'ppe', description: 'Bouchons/casques', priority: 1, implemented: false },
      { id: 'cm-noise-2', name: 'Mesure sonométrique', category: 'engineering', description: 'Évaluation exposition', priority: 2, implemented: false },
      { id: 'cm-noise-3', name: 'Rotation équipes', category: 'administrative', description: 'Limitation temps', priority: 3, implemented: false },
      { id: 'cm-noise-4', name: 'Encoffrement machines', category: 'engineering', description: 'Réduction à la source', priority: 2, implemented: false }
    ]
  }
];

const Step3Hazards: React.FC<Step3HazardsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hazards, setHazards] = useState<Hazard[]>(() => {
    if (formData.hazards?.list && formData.hazards.list.length > 0) {
      return formData.hazards.list;
    }
    return hazardsList;
  });

  // Filtrage des dangers
  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch = hazard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hazard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques
  const categories = Array.from(new Set(hazards.map(h => h.category)));
  
  // Dangers sélectionnés
  const selectedHazards = hazards.filter(h => h.selected);

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

  const handleControlMeasureToggle = (hazardId: string, controlId: string) => {
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
    const totalControls = selectedList.reduce((sum, h) => sum + h.controlMeasures.length, 0);
    const implementedControls = selectedList.reduce((sum, h) => 
      sum + h.controlMeasures.filter(c => c.implemented).length, 0
    );

    const hazardsData = {
      list: updatedHazards,
      selected: selectedList,
      stats: {
        totalHazards: selectedList.length,
        totalControls,
        implementedControls,
        implementationRate: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
        criticalHazards: selectedList.filter(h => h.riskLevel === 'critical').length,
        highRiskHazards: selectedList.filter(h => h.riskLevel === 'high').length
      }
    };
    
    onDataChange('hazards', hazardsData);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return '🔴 Critique';
      case 'high': return '🟠 Élevé';
      case 'medium': return '🟡 Moyen';
      case 'low': return '🟢 Faible';
      default: return '⚪ Indéterminé';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Électrique': return '⚡';
      case 'Mécanique': return '⚙️';
      case 'Physique': return '🏗️';
      case 'Chimique': return '🧪';
      case 'Ergonomique': return '🏋️';
      case 'Environnemental': return '🌪️';
      default: return '⚠️';
    }
  };

  const getControlCategoryColor = (category: string) => {
    switch (category) {
      case 'elimination': return 'red';
      case 'substitution': return 'orange';
      case 'engineering': return 'blue';
      case 'administrative': return 'purple';
      case 'ppe': return 'green';
      default: return 'gray';
    }
  };

  const getControlCategoryLabel = (category: string) => {
    switch (category) {
      case 'elimination': return '❌ Élimination';
      case 'substitution': return '🔄 Substitution';
      case 'engineering': return '🔧 Ingénierie';
      case 'administrative': return '📋 Administrative';
      case 'ppe': return '🛡️ EPI';
      default: return '❓ Autre';
    }
  };

  // Debug
  console.log('Total hazards:', hazards.length);
  console.log('Filtered hazards:', filteredHazards.length);
  console.log('Selected hazards:', selectedHazards.length);

  return (
    <>
      {/* CSS pour Step 3 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step3-container { padding: 0; }
          .summary-header { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .summary-title { color: #f59e0b; font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-value { font-size: 20px; font-weight: 800; color: #f59e0b; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #d97706; font-weight: 500; }
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #f59e0b; background: rgba(15, 23, 42, 0.9); }
          .category-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
          .category-select:focus { outline: none; border-color: #f59e0b; }
          .hazards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
          .hazard-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; transition: all 0.3s ease; cursor: pointer; position: relative; }
          .hazard-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.5); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.15); }
          .hazard-card.selected { border-color: #f59e0b; background: rgba(251, 191, 36, 0.1); }
          .hazard-card.critical::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 16px 0 0 16px; }
          .hazard-card.high::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #f97316; border-radius: 16px 0 0 16px; }
          .hazard-card.medium::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #eab308; border-radius: 16px 0 0 16px; }
          .hazard-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
          .hazard-icon { font-size: 28px; width: 40px; text-align: center; }
          .hazard-content { flex: 1; }
          .hazard-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
          .hazard-category { color: #94a3b8; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
          .hazard-description { color: #cbd5e1; font-size: 13px; line-height: 1.4; }
          .hazard-checkbox { width: 24px; height: 24px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 6px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .hazard-checkbox.checked { background: #f59e0b; border-color: #f59e0b; color: white; }
          .hazard-details { margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
          .risk-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
          .legislation-info { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 500; }
          .controls-section { margin-top: 20px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 16px; }
          .controls-header { color: #f59e0b; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .controls-grid { display: grid; gap: 8px; }
          .control-item { display: flex; align-items: flex-start; gap: 12px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 8px; transition: all 0.3s ease; }
          .control-item:hover { background: rgba(30, 41, 59, 0.8); }
          .control-checkbox { width: 18px; height: 18px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 4px; background: rgba(15, 23, 42, 0.8); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; margin-top: 2px; }
          .control-checkbox.checked { background: #22c55e; border-color: #22c55e; color: white; }
          .control-content { flex: 1; }
          .control-name { color: #ffffff; font-size: 13px; font-weight: 500; margin-bottom: 2px; }
          .control-description { color: #94a3b8; font-size: 11px; line-height: 1.3; margin-bottom: 4px; }
          .control-meta { display: flex; gap: 8px; align-items: center; }
          .control-category { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 500; }
          .priority-indicator { width: 12px; height: 12px; border-radius: 50%; }
          .priority-1 { background: #ef4444; }
          .priority-2 { background: #f97316; }
          .priority-3 { background: #eab308; }
          .control-inputs { margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .control-input { padding: 4px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 4px; color: #ffffff; font-size: 11px; }
          .control-input:focus { outline: none; border-color: #f59e0b; }
          .no-results { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .error-section { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-top: 24px; }
          .error-header { display: flex; align-items: center; gap: 8px; color: #f87171; margin-bottom: 8px; font-weight: 600; }
          .error-list { margin: 0; padding-left: 20px; color: #fca5a5; }
          @media (max-width: 768px) {
            .hazards-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .summary-stats { grid-template-columns: repeat(2, 1fr); }
            .control-inputs { grid-template-columns: 1fr; }
          }
        `
      }} />

      <div className="step3-container">
        {/* En-tête avec résumé */}
        <div className="summary-header">
          <div className="summary-title">
            <AlertTriangle size={24} />
            ⚠️ Identification des Dangers & Risques
          </div>
          <p style={{ color: '#d97706', margin: '0 0 8px', fontSize: '14px' }}>
            Sélectionnez les dangers potentiels et définissez les moyens de contrôle requis
          </p>
          
          {selectedHazards.length > 0 && (
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.length}</div>
                <div className="stat-label">Dangers identifiés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.filter(h => h.riskLevel === 'critical' || h.riskLevel === 'high').length}</div>
                <div className="stat-label">Risques élevés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0)}
                </div>
                <div className="stat-label">Contrôles implantés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0) > 0 
                    ? Math.round((selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0) / 
                        selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0)) * 100)
                    : 0}%
                </div>
                <div className="stat-label">Taux d'implantation</div>
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
                placeholder="Rechercher un danger..."
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Toutes catégories ({hazards.length})</option>
              {categories.map(category => {
                const count = hazards.filter(h => h.category === category).length;
                return (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Grille des dangers */}
        <div className="hazards-grid">
          {filteredHazards.map(hazard => {
            const isSelected = hazard.selected;
            
            return (
              <div 
                key={hazard.id} 
                className={`hazard-card ${isSelected ? 'selected' : ''} ${hazard.riskLevel}`}
              >
                {/* Header avec sélection */}
                <div className="hazard-header" onClick={() => handleHazardToggle(hazard.id)}>
                  <div className="hazard-icon">{hazard.icon}</div>
                  <div className="hazard-content">
                    <h3 className="hazard-name">{hazard.name}</h3>
                    <div className="hazard-category">{getCategoryIcon(hazard.category)} {hazard.category}</div>
                    <div className="hazard-description">{hazard.description}</div>
                  </div>
                  <div className={`hazard-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={18} />}
                  </div>
                </div>

                {/* Détails du danger */}
                <div className="hazard-details">
                  <div 
                    className="risk-badge"
                    style={{ 
                      background: `rgba(${getRiskColor(hazard.riskLevel) === 'red' ? '239, 68, 68' : 
                                          getRiskColor(hazard.riskLevel) === 'orange' ? '249, 115, 22' :
                                          getRiskColor(hazard.riskLevel) === 'yellow' ? '234, 179, 8' : '34, 197, 94'}, 0.2)`,
                      color: getRiskColor(hazard.riskLevel) === 'red' ? '#f87171' : 
                             getRiskColor(hazard.riskLevel) === 'orange' ? '#fb923c' :
                             getRiskColor(hazard.riskLevel) === 'yellow' ? '#facc15' : '#4ade80'
                    }}
                  >
                    {getRiskLabel(hazard.riskLevel)}
                  </div>
                  <div className="legislation-info">{hazard.legislation}</div>
                </div>

                {/* Section moyens de contrôle (si sélectionné) */}
                {isSelected && (
                  <div className="controls-section">
                    <div className="controls-header">
                      <Shield size={16} />
                      Moyens de contrôle ({hazard.controlMeasures.filter(c => c.implemented).length}/{hazard.controlMeasures.length})
                    </div>
                    
                    <div className="controls-grid">
                      {hazard.controlMeasures
                        .sort((a, b) => a.priority - b.priority)
                        .map(control => (
                          <div key={control.id} className="control-item">
                            <div 
                              className={`control-checkbox ${control.implemented ? 'checked' : ''}`}
                              onClick={() => handleControlMeasureToggle(hazard.id, control.id)}
                            >
                              {control.implemented && <CheckCircle size={12} />}
                            </div>
                            
                            <div className="control-content">
                              <div className="control-name">{control.name}</div>
                              <div className="control-description">{control.description}</div>
                              
                              <div className="control-meta">
                                <div 
                                  className="control-category"
                                  style={{ 
                                    background: `rgba(${getControlCategoryColor(control.category) === 'red' ? '239, 68, 68' : 
                                                        getControlCategoryColor(control.category) === 'orange' ? '249, 115, 22' :
                                                        getControlCategoryColor(control.category) === 'blue' ? '59, 130, 246' :
                                                        getControlCategoryColor(control.category) === 'purple' ? '147, 51, 234' :
                                                        getControlCategoryColor(control.category) === 'green' ? '34, 197, 94' : '107, 114, 128'}, 0.2)`,
                                    color: getControlCategoryColor(control.category) === 'red' ? '#f87171' : 
                                           getControlCategoryColor(control.category) === 'orange' ? '#fb923c' :
                                           getControlCategoryColor(control.category) === 'blue' ? '#60a5fa' :
                                           getControlCategoryColor(control.category) === 'purple' ? '#a78bfa' :
                                           getControlCategoryColor(control.category) === 'green' ? '#4ade80' : '#9ca3af'
                                  }}
                                >
                                  {getControlCategoryLabel(control.category)}
                                </div>
                                <div 
                                  className={`priority-indicator priority-${control.priority}`}
                                  title={`Priorité ${control.priority}`}
                                />
                              </div>

                              {/* Inputs additionnels si contrôle sélectionné */}
                              {control.implemented && (
                                <div className="control-inputs">
                                  <input
                                    type="text"
                                    value={control.responsible || ''}
                                    onChange={(e) => updateControlMeasure(hazard.id, control.id, 'responsible', e.target.value)}
                                    placeholder="Responsable..."
                                    className="control-input"
                                  />
                                  <input
                                    type="date"
                                    value={control.deadline || ''}
                                    onChange={(e) => updateControlMeasure(hazard.id, control.id, 'deadline', e.target.value)}
                                    className="control-input"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredHazards.length === 0 && (
          <div className="no-results">
            <AlertTriangle size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun danger trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus de dangers</p>
          </div>
        )}

        {/* Validation d'erreurs */}
        {errors?.hazards && (
          <div className="error-section">
            <div className="error-header">
              <AlertTriangle size={20} />
              Erreurs de validation :
            </div>
            <ul className="error-list">
              {errors.hazards.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step3Hazards;
