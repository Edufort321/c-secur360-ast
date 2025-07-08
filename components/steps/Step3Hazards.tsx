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
// =================== DANGERS PRÉDÉFINIS PARTIE 1 ===================
const hazardsList_Part1: Hazard[] = [
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
      { 
        id: 'cm-elec-1', 
        name: 'Consignation LOTO complète', 
        category: 'elimination', 
        description: 'Isolation complète des sources d\'énergie', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z460', name: 'CSA Z460', fullName: 'Maîtrise des énergies dangereuses', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z460', section: 'Art. 5.2', description: 'Procédures de consignation', mandatory: true },
          { id: 'rsst-185', name: 'RSST Art. 185', fullName: 'Règlement SST - Travaux électriques', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 185-190', description: 'Obligations consignation électrique', mandatory: true }
        ]
      },
      { 
        id: 'cm-elec-2', 
        name: 'Vérification absence de tension (VAT)', 
        category: 'engineering', 
        description: 'Test avec voltmètre certifié', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z462', name: 'CSA Z462', fullName: 'Sécurité en milieu de travail - Énergie électrique', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z462', section: 'Art. 6.3', description: 'Procédures de vérification', mandatory: true },
          { id: 'ieee-1048', name: 'IEEE 1048', fullName: 'Guide for Protective Grounding', url: 'https://standards.ieee.org/ieee/1048/', section: 'Section 4', description: 'Tests de vérification', mandatory: false }
        ]
      },
      { 
        id: 'cm-elec-3', 
        name: 'Gants isolants classe appropriée', 
        category: 'ppe', 
        description: 'Gants diélectriques testés', 
        priority: 3, 
        implemented: false,
        standards: [
          { id: 'astm-d120', name: 'ASTM D120', fullName: 'Rubber Insulating Gloves', url: 'https://www.astm.org/d0120-20.html', section: 'Table 1', description: 'Classification des gants isolants', mandatory: true },
          { id: 'csa-z94.4', name: 'CSA Z94.4', fullName: 'Sélection des protecteurs oculaires et faciaux', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-4', section: 'Section 5', description: 'EPI électrique', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-arc-1', 
        name: 'Analyse d\'arc électrique', 
        category: 'engineering', 
        description: 'Calcul énergie incidente', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'ieee-1584', name: 'IEEE 1584', fullName: 'Guide for Performing Arc-Flash Hazard Calculations', url: 'https://standards.ieee.org/ieee/1584/5507/', section: 'Section 4', description: 'Calculs d\'arc électrique', mandatory: true },
          { id: 'nfpa-70e', name: 'NFPA 70E', fullName: 'Standard for Electrical Safety', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70E', section: 'Art. 130', description: 'Analyse des risques d\'arc', mandatory: true }
        ]
      },
      { 
        id: 'cm-arc-2', 
        name: 'Vêtements résistants à l\'arc', 
        category: 'ppe', 
        description: 'Habit arc-flash certifié', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'astm-f1506', name: 'ASTM F1506', fullName: 'Standard for Flame Resistant Textile Materials', url: 'https://www.astm.org/f1506-20a.html', section: 'Section 5', description: 'Vêtements résistants aux arcs', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-mech-1', 
        name: 'Arrêt complet des équipements', 
        category: 'elimination', 
        description: 'Immobilisation totale', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z432', name: 'CSA Z432', fullName: 'Safeguarding of Machinery', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z432', section: 'Art. 4.2', description: 'Arrêt sécuritaire machines', mandatory: true }
        ]
      },
      { 
        id: 'cm-mech-2', 
        name: 'Consignation mécanique', 
        category: 'elimination', 
        description: 'Blocage physique', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z460', name: 'CSA Z460', fullName: 'Maîtrise des énergies dangereuses', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z460', section: 'Art. 8', description: 'Consignation mécanique', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-press-1', 
        name: 'Dépressurisation complète', 
        category: 'elimination', 
        description: 'Évacuation totale pression', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-b51', name: 'CSA B51', fullName: 'Boiler, Pressure Vessel, and Pressure Piping Code', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-b51', section: 'Art. 7.1', description: 'Procédures dépressurisation', mandatory: true }
        ]
      }
    ]
  }
];
// =================== DANGERS PRÉDÉFINIS PARTIE 2 ===================
const hazardsList_Part2: Hazard[] = [
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
      { 
        id: 'cm-fall-1', 
        name: 'Garde-corps permanents', 
        category: 'engineering', 
        description: 'Barrières de protection', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-347', name: 'RSST Art. 347', fullName: 'Protection contre chutes', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 347-350', description: 'Garde-corps obligatoires', mandatory: true }
        ]
      },
      { 
        id: 'cm-fall-2', 
        name: 'Harnais de sécurité', 
        category: 'ppe', 
        description: 'Système antichute', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z259.10', name: 'CSA Z259.10', fullName: 'Full Body Harnesses', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z259-10', section: 'Art. 5', description: 'Harnais complets', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'confined-spaces',
    name: 'Espaces clos',
    category: 'Physique',
    description: 'Atmosphères dangereuses, engloutissement',
    riskLevel: 'critical',
    legislation: 'RSST Art. 302-317',
    icon: '🕳️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-conf-1', 
        name: 'Permis d\'entrée', 
        category: 'administrative', 
        description: 'Autorisation documentée', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-302', name: 'RSST Art. 302', fullName: 'Espaces clos - Permis', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 302-317', description: 'Permis d\'entrée obligatoire', mandatory: true }
        ]
      },
      { 
        id: 'cm-conf-2', 
        name: 'Test atmosphérique', 
        category: 'engineering', 
        description: 'Détection 4 gaz minimum', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z1006', name: 'CSA Z1006', fullName: 'Management of Work in Confined Spaces', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1006', section: 'Art. 7.3', description: 'Tests atmosphère obligatoires', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-chem-1', 
        name: 'Ventilation mécanique', 
        category: 'engineering', 
        description: 'Extraction d\'air', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-44', name: 'RSST Art. 44', fullName: 'Qualité de l\'air', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 44-55', description: 'Normes qualité air', mandatory: true }
        ]
      },
      { 
        id: 'cm-chem-2', 
        name: 'Appareil respiratoire', 
        category: 'ppe', 
        description: 'Protection respiratoire', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z94.4', name: 'CSA Z94.4', fullName: 'Sélection des protecteurs respiratoires', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-4', section: 'Art. 8', description: 'Protection respiratoire', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'asbestos',
    name: 'Amiante',
    category: 'Chimique',
    description: 'Exposition aux fibres d\'amiante',
    riskLevel: 'critical',
    legislation: 'RSST Art. 30-52',
    icon: '🫁',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-asb-1', 
        name: 'Caractérisation préalable', 
        category: 'engineering', 
        description: 'Identification matériaux', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-30', name: 'RSST Art. 30', fullName: 'Travaux amiante', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 30-52', description: 'Réglementation amiante', mandatory: true }
        ]
      }
    ]
  },
  // ENVIRONNEMENTAUX
  {
    id: 'spills',
    name: 'Déversements',
    category: 'Environnemental',
    description: 'Déversement de fluides (huile, carburant, produits chimiques)',
    riskLevel: 'high',
    legislation: 'RSST Art. 44, LQE, SIMDUT',
    icon: '🛢️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-spill-1', 
        name: 'Rétention primaire', 
        category: 'engineering', 
        description: 'Bacs de rétention, plateformes étanches', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'lqe-art-20', name: 'LQE Art. 20', fullName: 'Loi sur la qualité de l\'environnement', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/Q-2/', section: 'Art. 20-22', description: 'Interdiction contamination', mandatory: true }
        ]
      }
    ]
  },
  // INCENDIE
  {
    id: 'fire-explosion',
    name: 'Incendie/Explosion',
    category: 'Incendie',
    description: 'Feu, explosion de matières inflammables',
    riskLevel: 'critical',
    legislation: 'Code de construction, NFPA',
    icon: '🔥',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-fire-1', 
        name: 'Permis de travail à chaud', 
        category: 'administrative', 
        description: 'Autorisation soudage/coupage', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'nfpa-51b', name: 'NFPA 51B', fullName: 'Standard for Fire Prevention During Welding', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=51B', section: 'Chapter 4', description: 'Prévention incendie soudage', mandatory: true }
        ]
      }
    ]
  },
  // TRANSPORT
  {
    id: 'vehicle-traffic',
    name: 'Circulation véhiculaire',
    category: 'Transport',
    description: 'Collision avec véhicules, engins',
    riskLevel: 'high',
    legislation: 'RSST Art. 320-340, Code sécurité routière',
    icon: '🚛',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-traf-1', 
        name: 'Signalisation temporaire', 
        category: 'engineering', 
        description: 'Cônes, panneaux, feux', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'mtq-signalisation', name: 'MTQ Signalisation', fullName: 'Norme signalisation temporaire', url: 'https://www.transports.gouv.qc.ca/fr/entreprises-partenaires/entreprises-construction/signalisation-temporaire/', section: 'Tome VII', description: 'Signalisation chantiers routiers', mandatory: true }
        ]
      },
      { 
        id: 'cm-traf-2', 
        name: 'Vêtements haute visibilité', 
        category: 'ppe', 
        description: 'Gilets rétroréfléchissants', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z96', name: 'CSA Z96', fullName: 'High-Visibility Safety Apparel', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z96', section: 'Class 2', description: 'Vêtements haute visibilité', mandatory: true }
        ]
      }
    ]
  }
];

// Combinaison des deux parties
const hazardsList: Hazard[] = [...hazardsList_Part1, ...hazardsList_Part2];
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
      case 'Psychosocial': return '🧠';
      case 'Incendie': return '🔥';
      case 'Transport': return '🚛';
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
          .control-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
          .control-category { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 500; }
          .priority-indicator { width: 12px; height: 12px; border-radius: 50%; }
          .priority-1 { background: #ef4444; }
          .priority-2 { background: #f97316; }
          .priority-3 { background: #eab308; }
          .control-standards { margin-top: 8px; padding: 8px; background: rgba(15, 23, 42, 0.6); border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2); }
          .standards-label { color: #60a5fa; font-size: 10px; font-weight: 600; margin-bottom: 6px; }
          .standards-list { display: flex; flex-wrap: wrap; gap: 4px; }
          .standard-item { position: relative; }
          .standard-link { text-decoration: none; display: block; transition: all 0.2s ease; }
          .standard-link:hover { transform: translateY(-1px); }
          .standard-badge { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; padding: 3px 6px; display: inline-flex; align-items: center; gap: 2px; cursor: pointer; transition: all 0.2s ease; }
          .standard-badge:hover { background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.5); }
          .standard-name { color: #60a5fa; font-size: 9px; font-weight: 600; }
          .mandatory-indicator { color: #ef4444; font-size: 8px; font-weight: 700; }
          .standard-section { color: #94a3b8; font-size: 8px; text-align: center; margin-top: 1px; }
          .standard-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.9); color: white; padding: 8px; border-radius: 6px; font-size: 10px; white-space: nowrap; max-width: 200px; white-space: normal; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
          .standard-item:hover .standard-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-8px); }
          .control-inputs { margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .control-input { padding: 4px 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 4px; color: #ffffff; font-size: 11px; }
          .control-input:focus { outline: none; border-color: #f59e0b; }
          .no-results { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); }
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

                              {/* Standards/Normes associées */}
                              {control.standards && control.standards.length > 0 && (
                                <div className="control-standards">
                                  <div className="standards-label">📋 Normes & Références :</div>
                                  <div className="standards-list">
                                    {control.standards.map((standard, index) => (
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
                                          <em>{standard.mandatory ? 'Obligatoire' : 'Recommandé'}</em>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

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
      </div>
    </>
  );
};

export default Step3Hazards;
