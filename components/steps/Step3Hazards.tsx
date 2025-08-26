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

// =================== SYSTÈME DE TRADUCTIONS ===================
const translations = {
  fr: {
    title: "⚠️ Identification des Dangers & Risques",
    subtitle: "Sélectionnez les dangers potentiels et définissez les moyens de contrôle requis",
    searchPlaceholder: "Rechercher un danger...",
    allCategories: "Toutes catégories",
    hazardsIdentified: "Dangers identifiés",
    highRisks: "Risques élevés", 
    controlsImplemented: "Contrôles implémentés",
    implementationRate: "Taux d'implémentation",
    controlMeasures: "Mesures de contrôle",
    noHazardsFound: "Aucun danger trouvé",
    noHazardsMessage: "Modifiez vos critères de recherche pour voir plus de dangers",
    responsible: "Responsable...",
    standardsReferences: "📋 Normes & Références:",
    mandatory: "Obligatoire",
    recommended: "Recommandé",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    },
    controlCategories: {
      elimination: "❌ Élimination",
      substitution: "🔄 Substitution", 
      engineering: "🔧 Ingénierie",
      administrative: "📋 Administratif",
      ppe: "🛡️ EPI"
    },
    categories: {
      'Électrique': 'Électrique',
      'Mécanique': 'Mécanique',
      'Physique': 'Physique', 
      'Chimique': 'Chimique',
      'Ergonomique': 'Ergonomique',
      'Environnemental': 'Environnemental',
      'Psychosocial': 'Psychosocial',
      'Incendie': 'Incendie',
      'Transport': 'Transport'
    }
  },
  en: {
    title: "⚠️ Hazard & Risk Identification",
    subtitle: "Select potential hazards and define required control measures",
    searchPlaceholder: "Search for a hazard...",
    allCategories: "All categories",
    hazardsIdentified: "Hazards identified",
    highRisks: "High risks", 
    controlsImplemented: "Controls implemented",
    implementationRate: "Implementation rate",
    controlMeasures: "Control measures",
    noHazardsFound: "No hazards found",
    noHazardsMessage: "Modify your search criteria to see more hazards",
    responsible: "Responsible...",
    standardsReferences: "📋 Standards & References:",
    mandatory: "Mandatory",
    recommended: "Recommended",
    riskLevels: {
      critical: "🔴 Critical",
      high: "🟠 High",
      medium: "🟡 Medium",
      low: "🟢 Low"
    },
    controlCategories: {
      elimination: "❌ Elimination",
      substitution: "🔄 Substitution", 
      engineering: "🔧 Engineering",
      administrative: "📋 Administrative",
      ppe: "🛡️ PPE"
    },
    categories: {
      'Électrique': 'Electrical',
      'Mécanique': 'Mechanical',
      'Physique': 'Physical', 
      'Chimique': 'Chemical',
      'Ergonomique': 'Ergonomic',
      'Environnemental': 'Environmental',
      'Psychosocial': 'Psychosocial',
      'Incendie': 'Fire',
      'Transport': 'Transport'
    }
  }
};

// =================== FONCTION POUR TRADUIRE LES DANGERS ===================
const translateHazards = (hazards: Hazard[], language: 'fr' | 'en'): Hazard[] => {
  if (language === 'fr') return hazards; // Déjà en français
  
  // Traductions EN pour les dangers
  const translations: { [key: string]: { name: string; description: string; category: string; controls: { [key: string]: { name: string; description: string } } } } = {
    'elec-shock': {
      name: 'Electrocution / Electric shock',
      description: 'Direct or indirect contact with live parts',
      category: 'Electrical',
      controls: {
        'cm-elec-1': { name: 'Complete LOTO lockout', description: 'Complete isolation of energy sources' },
        'cm-elec-2': { name: 'Voltage absence verification (VAV)', description: 'Test with certified voltmeter' },
        'cm-elec-3': { name: 'Appropriate class insulating gloves', description: 'Tested dielectric gloves' },
        'cm-elec-4': { name: 'Qualified electrical training', description: 'Certified electrical work personnel' }
      }
    },
    'arc-flash': {
      name: 'Arc flash',
      description: 'Electric arc during live work operations',
      category: 'Electrical',
      controls: {
        'cm-arc-1': { name: 'Arc flash analysis', description: 'Incident energy calculation' },
        'cm-arc-2': { name: 'Arc-resistant clothing', description: 'Certified arc-flash suit' },
        'cm-arc-3': { name: 'Safety distance respected', description: 'Protection perimeter' }
      }
    },
    'overhead-lines': {
      name: 'Overhead power lines',
      description: 'Contact with external power lines',
      category: 'Electrical',
      controls: {
        'cm-lines-1': { name: 'Minimum safety distance', description: 'Respect protection zones' },
        'cm-lines-2': { name: 'Dedicated surveillance', description: 'Specialized spotter' },
        'cm-lines-3': { name: 'Isolation/de-energization', description: 'Coordination with utilities' }
      }
    },
    'moving-parts': {
      name: 'Moving parts',
      description: 'Crushing, pinching by moving parts',
      category: 'Mechanical',
      controls: {
        'cm-mech-1': { name: 'Complete equipment shutdown', description: 'Total immobilization' },
        'cm-mech-2': { name: 'Mechanical lockout', description: 'Physical blocking' },
        'cm-mech-3': { name: 'Mechanical guards', description: 'Physical barriers' }
      }
    },
    'pressure': {
      name: 'Pressure systems',
      description: 'Explosion, projection due to pressure',
      category: 'Mechanical',
      controls: {
        'cm-press-1': { name: 'Complete depressurization', description: 'Total pressure evacuation' },
        'cm-press-2': { name: 'Safety valves', description: 'Overpressure protection' }
      }
    },
    'lifting-equipment': {
      name: 'Lifting equipment',
      description: 'Load drop, equipment tipping',
      category: 'Mechanical',
      controls: {
        'cm-lift-1': { name: 'Daily inspection', description: 'Pre-use verification' },
        'cm-lift-2': { name: 'Equipment certification', description: 'Certified annual inspection' },
        'cm-lift-3': { name: 'Operator training', description: 'Specialized certification' }
      }
    },
    'falls': {
      name: 'Falls from height',
      description: 'Falls from more than 3 meters',
      category: 'Physical',
      controls: {
        'cm-fall-1': { name: 'Permanent guardrails', description: 'Protection barriers' },
        'cm-fall-2': { name: 'Safety harness', description: 'Fall arrest system' },
        'cm-fall-3': { name: 'Certified anchor points', description: 'Structural anchors' }
      }
    },
    'scaffolding': {
      name: 'Scaffolding',
      description: 'Collapse, instability of scaffolding',
      category: 'Physical',
      controls: {
        'cm-scaf-1': { name: 'Assembly by competent person', description: 'Scaffolding certification' },
        'cm-scaf-2': { name: 'Daily inspection', description: 'Stability verification' }
      }
    },
    'struck-objects': {
      name: 'Falling objects',
      description: 'Impact from falling objects',
      category: 'Physical',
      controls: {
        'cm-obj-1': { name: 'Protective helmet', description: 'Head protection' },
        'cm-obj-2': { name: 'Safety perimeter', description: 'Exclusion zone' }
      }
    },
    'confined-spaces': {
      name: 'Confined spaces',
      description: 'Dangerous atmospheres, engulfment',
      category: 'Physical',
      controls: {
        'cm-conf-1': { name: 'Entry permit', description: 'Documented authorization' },
        'cm-conf-2': { name: 'Atmospheric testing', description: 'Minimum 4-gas detection' },
        'cm-conf-3': { name: 'Forced ventilation', description: 'Air renewal' }
      }
    },
    'toxic-vapors': {
      name: 'Toxic vapors',
      description: 'Inhalation of hazardous substances',
      category: 'Chemical',
      controls: {
        'cm-chem-1': { name: 'Mechanical ventilation', description: 'Air extraction' },
        'cm-chem-2': { name: 'Respiratory equipment', description: 'Respiratory protection' }
      }
    },
    'chemical-burns': {
      name: 'Chemical burns',
      description: 'Contact with corrosive substances',
      category: 'Chemical',
      controls: {
        'cm-burn-1': { name: 'Chemical gloves', description: 'Skin protection' },
        'cm-burn-2': { name: 'Emergency shower', description: 'Immediate rinsing' }
      }
    },
    'asbestos': {
      name: 'Asbestos',
      description: 'Exposure to asbestos fibers',
      category: 'Chemical',
      controls: {
        'cm-asb-1': { name: 'Prior characterization', description: 'Material identification' },
        'cm-asb-2': { name: 'Zone containment', description: 'Sealed isolation' },
        'cm-asb-3': { name: 'P100 respirator', description: 'Respiratory protection' }
      }
    },
    'manual-handling': {
      name: 'Manual handling',
      description: 'Musculoskeletal disorders',
      category: 'Ergonomic',
      controls: {
        'cm-man-1': { name: 'Lifting aids', description: 'Lifting tools' },
        'cm-man-2': { name: 'Lifting techniques', description: 'Posture training' }
      }
    },
    'repetitive-work': {
      name: 'Repetitive work',
      description: 'Repetitive movements, awkward postures',
      category: 'Ergonomic',
      controls: {
        'cm-rep-1': { name: 'Job rotation', description: 'Task alternation' },
        'cm-rep-2': { name: 'Active breaks', description: 'Regular recovery' }
      }
    },
    'extreme-weather': {
      name: 'Extreme weather conditions',
      description: 'Exposure to severe weather',
      category: 'Environmental',
      controls: {
        'cm-weather-1': { name: 'Weather monitoring', description: 'Condition surveillance' },
        'cm-weather-2': { name: 'Work stoppage if necessary', description: 'Suspension protocol' }
      }
    },
    'heat-stress': {
      name: 'Heat stress',
      description: 'Heat stroke, exhaustion',
      category: 'Environmental',
      controls: {
        'cm-heat-1': { name: 'Temperature monitoring', description: 'WBGT measurement' },
        'cm-heat-2': { name: 'Frequent hydration', description: 'Drinking breaks' }
      }
    },
    'noise': {
      name: 'Noise exposure',
      description: 'Hearing damage',
      category: 'Environmental',
      controls: {
        'cm-noise-1': { name: 'Hearing protection', description: 'Plugs/earmuffs' },
        'cm-noise-2': { name: 'Sound measurement', description: 'Exposure evaluation' }
      }
    },
    'spills': {
      name: 'Spills',
      description: 'Fluid spills (oil, fuel, chemicals)',
      category: 'Environmental',
      controls: {
        'cm-spill-1': { name: 'Primary containment', description: 'Containment trays, sealed platforms' },
        'cm-spill-2': { name: 'Spill kit', description: 'Absorbents, barriers, containers' }
      }
    },
    'environmental-contamination': {
      name: 'Environmental contamination',
      description: 'Soil, water, air pollution by hazardous substances',
      category: 'Environmental',
      controls: {
        'cm-env-1': { name: 'Environmental characterization', description: 'Existing soil/water analysis' }
      }
    },
    'workplace-violence': {
      name: 'Workplace violence',
      description: 'Physical or psychological violence',
      category: 'Psychosocial',
      controls: {
        'cm-viol-1': { name: 'Zero tolerance policy', description: 'Clear disciplinary framework' }
      }
    },
    'harassment': {
      name: 'Psychological harassment',
      description: 'Repeated vexatious conduct',
      category: 'Psychosocial',
      controls: {
        'cm-har-1': { name: 'Anti-harassment policy', description: 'Preventive framework' }
      }
    },
    'fire-explosion': {
      name: 'Fire/Explosion',
      description: 'Fire, explosion of flammable materials',
      category: 'Fire',
      controls: {
        'cm-fire-1': { name: 'Hot work permit', description: 'Welding/cutting authorization' },
        'cm-fire-2': { name: 'Fire watch', description: 'Specialized fire guard' }
      }
    },
    'vehicle-traffic': {
      name: 'Vehicle traffic',
      description: 'Collision with vehicles, equipment',
      category: 'Transport',
      controls: {
        'cm-traf-1': { name: 'Temporary signaling', description: 'Cones, signs, lights' },
        'cm-traf-2': { name: 'High-visibility clothing', description: 'Reflective vests' },
        'cm-traf-3': { name: 'Zone separation', description: 'Physical barriers' }
      }
    }
  };

  return hazards.map(hazard => {
    const translation = translations[hazard.id];
    if (translation) {
      return {
        ...hazard,
        name: translation.name,
        description: translation.description,
        category: translation.category,
        controlMeasures: hazard.controlMeasures.map(control => {
          const controlTranslation = translation.controls[control.id];
          if (controlTranslation) {
            return {
              ...control,
              name: controlTranslation.name,
              description: controlTranslation.description
            };
          }
          return control;
        })
      };
    }
    return hazard;
  });
};

// =================== DANGERS ÉLECTRIQUES ===================
const electricalHazards: Hazard[] = [
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
          { id: 'csa-z462', name: 'CSA Z462', fullName: 'Sécurité en milieu de travail - Énergie électrique', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z462', section: 'Art. 6.3', description: 'Procédures de vérification', mandatory: true }
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
          { id: 'astm-d120', name: 'ASTM D120', fullName: 'Rubber Insulating Gloves', url: 'https://www.astm.org/d0120-20.html', section: 'Table 1', description: 'Classification des gants isolants', mandatory: true }
        ]
      },
      { 
        id: 'cm-elec-4', 
        name: 'Formation électrique qualifiée', 
        category: 'administrative', 
        description: 'Personnel certifié travaux électriques', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'cnesst-guide', name: 'Guide CNESST', fullName: 'Guide de prévention - Travaux électriques', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/travaux-electriques', section: 'Section 3', description: 'Formation requise', mandatory: true }
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
          { id: 'ieee-1584', name: 'IEEE 1584', fullName: 'Guide for Performing Arc-Flash Hazard Calculations', url: 'https://standards.ieee.org/ieee/1584/5507/', section: 'Section 4', description: 'Calculs d\'arc électrique', mandatory: true }
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
      },
      { 
        id: 'cm-arc-3', 
        name: 'Distance de sécurité respectée', 
        category: 'administrative', 
        description: 'Périmètre de protection', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'rsst-186', name: 'RSST Art. 186', fullName: 'Règlement SST - Distances sécurité', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 186', description: 'Distances minimales électriques', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'overhead-lines',
    name: 'Lignes électriques aériennes',
    category: 'Électrique',
    description: 'Contact avec lignes électriques extérieures',
    riskLevel: 'critical',
    legislation: 'RSST Art. 185-190',
    icon: '🌩️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-lines-1', 
        name: 'Distance de sécurité minimale', 
        category: 'administrative', 
        description: 'Respecter zones de protection', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-187', name: 'RSST Art. 187', fullName: 'Distances lignes électriques', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 187', description: 'Distances minimales selon voltage', mandatory: true }
        ]
      },
      { 
        id: 'cm-lines-2', 
        name: 'Surveillance dédiée', 
        category: 'administrative', 
        description: 'Signaleur spécialisé', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-188', name: 'RSST Art. 188', fullName: 'Surveillance obligatoire', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 188', description: 'Surveillance près lignes électriques', mandatory: true }
        ]
      },
      { 
        id: 'cm-lines-3', 
        name: 'Isolation/mise hors tension', 
        category: 'elimination', 
        description: 'Coordination avec utilités', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'hydro-quebec', name: 'Hydro-Québec', fullName: 'Procédures coordination travaux', url: 'https://www.hydroquebec.com/securite/', section: 'Guide 2024', description: 'Coordination mise hors tension', mandatory: true }
        ]
      }
    ]
  }
];
// =================== DANGERS MÉCANIQUES ===================
const mechanicalHazards: Hazard[] = [
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
          { id: 'csa-z460-mech', name: 'CSA Z460', fullName: 'Maîtrise des énergies dangereuses', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z460', section: 'Art. 8', description: 'Consignation mécanique', mandatory: true }
        ]
      },
      { 
        id: 'cm-mech-3', 
        name: 'Protecteurs mécaniques', 
        category: 'engineering', 
        description: 'Barrières physiques', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'iso-14120', name: 'ISO 14120', fullName: 'Safety Guards - General requirements', url: 'https://www.iso.org/standard/54630.html', section: 'Section 5', description: 'Protecteurs fixes et mobiles', mandatory: true }
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
      },
      { 
        id: 'cm-press-2', 
        name: 'Soupapes de sécurité', 
        category: 'engineering', 
        description: 'Protection surpression', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'api-520', name: 'API 520', fullName: 'Sizing, Selection Safety Relief Valves', url: 'https://www.api.org/products-and-services/individual-certification-programs/piping-and-pipeline/publications/api-520', section: 'Part 1', description: 'Dimensionnement soupapes', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'lifting-equipment',
    name: 'Équipements de levage',
    category: 'Mécanique',
    description: 'Chute de charge, basculement d\'équipement',
    riskLevel: 'high',
    legislation: 'RSST Art. 260-290, CSA B335',
    icon: '🏗️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-lift-1', 
        name: 'Inspection quotidienne', 
        category: 'administrative', 
        description: 'Vérification pré-utilisation', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-b335', name: 'CSA B335', fullName: 'Safety Standard for Lift Trucks', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-b335', section: 'Art. 5.2', description: 'Inspections quotidiennes', mandatory: true }
        ]
      },
      { 
        id: 'cm-lift-2', 
        name: 'Certification des équipements', 
        category: 'administrative', 
        description: 'Inspection annuelle certifiée', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'asme-b30', name: 'ASME B30', fullName: 'Overhead and Mobile Cranes', url: 'https://www.asme.org/codes-standards/find-codes-standards/b30-overhead-mobile-cranes', section: 'B30.2', description: 'Certification grues mobiles', mandatory: true }
        ]
      },
      { 
        id: 'cm-lift-3', 
        name: 'Formation opérateurs', 
        category: 'administrative', 
        description: 'Certification spécialisée', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'cnesst-grue', name: 'CNESST Grues', fullName: 'Guide formation opérateurs grues', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/appareils-levage', section: 'Section 2', description: 'Formation obligatoire', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS OUTILS MANUELS ET LIGNE DE TIR ===================
const manualToolsHazards: Hazard[] = [
  {
    id: 'manual-tools-impact',
    name: 'Impact d\'outils manuels',
    category: 'Mécanique',
    description: 'Blessures par impact d\'outils (marteaux, clés, etc.)',
    riskLevel: 'high',
    legislation: 'RSST Art. 45, CSA Z94.1',
    icon: '🔨',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-tool-1', 
        name: 'Inspection pré-utilisation', 
        category: 'administrative', 
        description: 'Vérifier état des outils avant usage', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z94-1', name: 'CSA Z94.1', fullName: 'Industrial Protective Headwear', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-1', section: 'Art. 4.1', description: 'Protection tête obligatoire', mandatory: true }
        ]
      },
      { 
        id: 'cm-tool-2', 
        name: 'Vigilance 360°', 
        category: 'administrative', 
        description: 'Maintenir conscience de l\'environnement complet', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'osha-1926', name: 'OSHA 1926', fullName: 'Construction Industry Standards', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926', section: 'Subpart E', description: 'Personal protective equipment', mandatory: true }
        ]
      },
      { 
        id: 'cm-tool-3', 
        name: 'Zone de sécurité établie', 
        category: 'engineering', 
        description: 'Délimiter périmètre de sécurité autour travaux', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z432', name: 'CSA Z432', fullName: 'Safeguarding of Machinery', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z432', section: 'Art. 5.1', description: 'Zones de sécurité', mandatory: true }
        ]
      },
      { 
        id: 'cm-tool-4', 
        name: 'EPI approprié', 
        category: 'ppe', 
        description: 'Casque, lunettes, gants résistants aux impacts', 
        priority: 3, 
        implemented: false,
        standards: [
          { id: 'csa-z94-3', name: 'CSA Z94.3', fullName: 'Industrial Eye and Face Protectors', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-3', section: 'Art. 6.1', description: 'Protection oculaire obligatoire', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'line-of-fire-hazard',
    name: 'Ligne de tir - objets projetés',
    category: 'Mécanique',
    description: 'Exposition aux objets projetés, éjectés ou en mouvement',
    riskLevel: 'critical',
    legislation: 'OSHA 29 CFR 1926, RSST Art. 51',
    icon: '⚡',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-lof-1', 
        name: 'Élimination de la source', 
        category: 'elimination', 
        description: 'Supprimer ou remplacer le processus dangereux', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'osha-hierarchy', name: 'OSHA Hierarchy', fullName: 'Hierarchy of Controls', url: 'https://www.cdc.gov/niosh/hierarchy-of-controls/', section: 'Level 1', description: 'Élimination prioritaire', mandatory: true }
        ]
      },
      { 
        id: 'cm-lof-2', 
        name: 'Barrières physiques', 
        category: 'engineering', 
        description: 'Écrans, filets, garde-corps pour bloquer projections', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z432', name: 'CSA Z432', fullName: 'Safeguarding of Machinery', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z432', section: 'Art. 4.3', description: 'Dispositifs de protection', mandatory: true }
        ]
      },
      { 
        id: 'cm-lof-3', 
        name: 'Communication active', 
        category: 'administrative', 
        description: 'Signaler déplacements et actions dangereuses', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z1600', name: 'CSA Z1600', fullName: 'Emergency and Continuity Management', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1600', section: 'Art. 8.2', description: 'Communication sécurité', mandatory: false }
        ]
      },
      { 
        id: 'cm-lof-4', 
        name: 'Vigilance ligne de tir', 
        category: 'administrative', 
        description: 'Ne jamais se positionner dans trajectoire potentielle', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'osha-struck-by', name: 'OSHA Struck-by', fullName: 'Struck-by Object Prevention', url: 'https://www.osha.gov/safety-management/', section: 'Fatal Four', description: 'Prévention objets projetés', mandatory: true }
        ]
      },
      { 
        id: 'cm-lof-5', 
        name: 'Ancrage et sécurisation', 
        category: 'engineering', 
        description: 'Attacher outils et matériaux pour éviter chutes', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'ansi-z359', name: 'ANSI Z359', fullName: 'Fall Protection Code', url: 'https://webstore.ansi.org/standards/asse/ansiz359', section: 'Part 4', description: 'Arrimage équipements', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'hand-tool-maintenance',
    name: 'Outils défectueux',
    category: 'Mécanique',
    description: 'Défaillance d\'outils par manque d\'entretien',
    riskLevel: 'medium',
    legislation: 'RSST Art. 51.11, CSA Z142',
    icon: '🔧',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-maint-1', 
        name: 'Programme d\'entretien préventif', 
        category: 'administrative', 
        description: 'Calendrier de maintenance et remplacement', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z142', name: 'CSA Z142', fullName: 'Workplace Electrical Safety', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z142', section: 'Art. 4.1', description: 'Entretien équipements électriques', mandatory: true }
        ]
      },
      { 
        id: 'cm-maint-2', 
        name: 'Formation identification défauts', 
        category: 'administrative', 
        description: 'Reconnaître signes d\'usure et défaillance', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'csa-z1000', name: 'CSA Z1000', fullName: 'Occupational Health and Safety Management', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1000', section: 'Art. 5.4', description: 'Formation sécurité', mandatory: true }
        ]
      },
      { 
        id: 'cm-maint-3', 
        name: 'Retrait immédiat outils défectueux', 
        category: 'administrative', 
        description: 'Procédure de mise hors service', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'osha-1926-95', name: 'OSHA 1926.95', fullName: 'Personal Protective Equipment', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.95', section: 'Para (a)', description: 'Retrait équipement défectueux', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'power-tool-kickback',
    name: 'Contrecoup d\'outils électriques',
    category: 'Mécanique',
    description: 'Perte de contrôle par réaction de l\'outil (scie, meuleuse)',
    riskLevel: 'high',
    legislation: 'RSST Art. 51.12, UL 745',
    icon: '⚙️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-kick-1', 
        name: 'Dispositifs anti-contrecoup', 
        category: 'engineering', 
        description: 'Frein de chaîne, embrayage limiteur de couple', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'ul-745', name: 'UL 745', fullName: 'Standard for Portable Electric Tools', url: 'https://standardscatalog.ul.com/standards/en/standard_745', section: 'Part 2', description: 'Dispositifs sécurité outils', mandatory: true }
        ]
      },
      { 
        id: 'cm-kick-2', 
        name: 'Prise ferme à deux mains', 
        category: 'administrative', 
        description: 'Technique de tenue sécuritaire', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'iec-62841', name: 'IEC 62841', fullName: 'Electric motor-operated hand-held tools', url: 'https://webstore.iec.ch/publication/7468', section: 'Part 2', description: 'Utilisation sécuritaire', mandatory: true }
        ]
      },
      { 
        id: 'cm-kick-3', 
        name: 'Positionnement corps sécuritaire', 
        category: 'administrative', 
        description: 'Éviter alignement avec direction de contrecoup', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z1000', name: 'CSA Z1000', fullName: 'Occupational Health and Safety Management', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1000', section: 'Art. 5.4', description: 'Formation techniques sécuritaires', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS PHYSIQUES ===================
const physicalHazards: Hazard[] = [
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
      },
      { 
        id: 'cm-fall-3', 
        name: 'Points d\'ancrage certifiés', 
        category: 'engineering', 
        description: 'Ancrages structuraux', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z259.16', name: 'CSA Z259.16', fullName: 'Design of Active Fall-Protection Systems', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z259-16', section: 'Art. 6', description: 'Systèmes protection active', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'scaffolding',
    name: 'Échafaudages',
    category: 'Physique',
    description: 'Effondrement, instabilité des échafaudages',
    riskLevel: 'high',
    legislation: 'RSST Art. 347-350, CSA S269.2',
    icon: '🚧',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-scaf-1', 
        name: 'Montage par personne compétente', 
        category: 'administrative', 
        description: 'Certification échafaudage', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-s269.2', name: 'CSA S269.2', fullName: 'Access Scaffolding for Construction Purposes', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-s269-2', section: 'Art. 4.2', description: 'Montage par personne qualifiée', mandatory: true }
        ]
      },
      { 
        id: 'cm-scaf-2', 
        name: 'Inspection quotidienne', 
        category: 'administrative', 
        description: 'Vérification stabilité', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-349', name: 'RSST Art. 349', fullName: 'Inspection échafaudages', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 349', description: 'Inspection obligatoire quotidienne', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-obj-1', 
        name: 'Casque de protection', 
        category: 'ppe', 
        description: 'Protection crânienne', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z94.1', name: 'CSA Z94.1', fullName: 'Industrial Protective Headwear', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-1', section: 'Type 1', description: 'Casques protection impact', mandatory: true }
        ]
      },
      { 
        id: 'cm-obj-2', 
        name: 'Périmètre de sécurité', 
        category: 'administrative', 
        description: 'Zone d\'exclusion', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-338', name: 'RSST Art. 338', fullName: 'Protection chute objets', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 338', description: 'Zones de protection obligatoires', mandatory: true }
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
      },
      { 
        id: 'cm-conf-3', 
        name: 'Ventilation forcée', 
        category: 'engineering', 
        description: 'Renouvellement d\'air', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-307', name: 'RSST Art. 307', fullName: 'Ventilation espaces clos', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 307', description: 'Ventilation obligatoire', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS CHIMIQUES ===================
const chemicalHazards: Hazard[] = [
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
          { id: 'csa-z94.4-resp', name: 'CSA Z94.4', fullName: 'Sélection des protecteurs respiratoires', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-4', section: 'Art. 8', description: 'Protection respiratoire', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-burn-1', 
        name: 'Gants chimiques', 
        category: 'ppe', 
        description: 'Protection cutanée', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'astm-f739', name: 'ASTM F739', fullName: 'Standard Test Method for Permeation of Liquids', url: 'https://www.astm.org/f0739-20.html', section: 'Section 4', description: 'Tests perméation gants chimiques', mandatory: true }
        ]
      },
      { 
        id: 'cm-burn-2', 
        name: 'Douche d\'urgence', 
        category: 'engineering', 
        description: 'Rinçage immédiat', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'ansi-z358.1', name: 'ANSI Z358.1', fullName: 'Emergency Eyewash and Shower Equipment', url: 'https://webstore.ansi.org/standards/isea/ansiz3581', section: 'Section 4', description: 'Douches et rince-œil d\'urgence', mandatory: true }
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
      },
      { 
        id: 'cm-asb-2', 
        name: 'Confinement zone', 
        category: 'engineering', 
        description: 'Isolation étanche', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-34', name: 'RSST Art. 34', fullName: 'Confinement amiante', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 34-38', description: 'Méthodes confinement', mandatory: true }
        ]
      },
      { 
        id: 'cm-asb-3', 
        name: 'Respirateur P100', 
        category: 'ppe', 
        description: 'Protection respiratoire', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'niosh-p100', name: 'NIOSH P100', fullName: 'Particulate Filter Efficiency', url: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html', section: 'P100 Series', description: 'Filtres haute efficacité', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS ERGONOMIQUES ===================
const ergonomicHazards: Hazard[] = [
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
      { 
        id: 'cm-man-1', 
        name: 'Équipements d\'aide', 
        category: 'engineering', 
        description: 'Outils de levage', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-166', name: 'RSST Art. 166', fullName: 'Manutention manuelle', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 166', description: 'Limites manutention', mandatory: true }
        ]
      },
      { 
        id: 'cm-man-2', 
        name: 'Techniques de levage', 
        category: 'administrative', 
        description: 'Formation postures', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'cnesst-tms', name: 'CNESST TMS', fullName: 'Guide prévention TMS', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/troubles-musculo-squelettiques', section: 'Section 3', description: 'Prévention TMS', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'repetitive-work',
    name: 'Travail répétitif',
    category: 'Ergonomique',
    description: 'Mouvements répétitifs, postures contraignantes',
    riskLevel: 'medium',
    legislation: 'Guide CNESST TMS',
    icon: '🔄',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-rep-1', 
        name: 'Rotation des postes', 
        category: 'administrative', 
        description: 'Alternance des tâches', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'iso-11228', name: 'ISO 11228', fullName: 'Ergonomics Manual Handling', url: 'https://www.iso.org/standard/51309.html', section: 'Part 3', description: 'Manutention charges faibles haute fréquence', mandatory: false }
        ]
      },
      { 
        id: 'cm-rep-2', 
        name: 'Pauses actives', 
        category: 'administrative', 
        description: 'Récupération régulière', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'cnesst-tms-rep', name: 'CNESST TMS', fullName: 'Guide prévention TMS répétitifs', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/troubles-musculo-squelettiques', section: 'Section 4', description: 'Travail répétitif', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS ENVIRONNEMENTAUX ===================
const environmentalHazards: Hazard[] = [
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
      { 
        id: 'cm-weather-1', 
        name: 'Surveillance météorologique', 
        category: 'administrative', 
        description: 'Veille conditions', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'env-canada', name: 'Environnement Canada', fullName: 'Alertes météorologiques', url: 'https://meteo.gc.ca/', section: 'Alertes', description: 'Surveillance conditions météo', mandatory: true }
        ]
      },
      { 
        id: 'cm-weather-2', 
        name: 'Arrêt travaux si nécessaire', 
        category: 'administrative', 
        description: 'Protocole suspension', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'cnesst-meteo', name: 'CNESST Météo', fullName: 'Guide conditions météorologiques', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/travail-exterieur', section: 'Section 2', description: 'Suspension travaux extérieurs', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'heat-stress',
    name: 'Stress thermique',
    category: 'Environnemental',
    description: 'Coups de chaleur, épuisement',
    riskLevel: 'high',
    legislation: 'Guide CNESST Coup de chaleur',
    icon: '🌡️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-heat-1', 
        name: 'Surveillance température', 
        category: 'engineering', 
        description: 'Mesure WBGT', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'iso-7243', name: 'ISO 7243', fullName: 'Hot environments - Estimation of heat stress', url: 'https://www.iso.org/standard/13895.html', section: 'Section 5', description: 'Mesure stress thermique WBGT', mandatory: true }
        ]
      },
      { 
        id: 'cm-heat-2', 
        name: 'Hydratation fréquente', 
        category: 'administrative', 
        description: 'Pauses boisson', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'cnesst-chaleur', name: 'CNESST Chaleur', fullName: 'Guide prévention coups de chaleur', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/coup-chaleur', section: 'Section 2', description: 'Prévention stress thermique', mandatory: true }
        ]
      }
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
      { 
        id: 'cm-noise-1', 
        name: 'Protection auditive', 
        category: 'ppe', 
        description: 'Bouchons/casques', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'csa-z94.2', name: 'CSA Z94.2', fullName: 'Hearing Protection Devices', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-2', section: 'Class A', description: 'Protecteurs auditifs', mandatory: true }
        ]
      },
      { 
        id: 'cm-noise-2', 
        name: 'Mesure sonométrique', 
        category: 'engineering', 
        description: 'Évaluation exposition', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'rsst-141', name: 'RSST Art. 141', fullName: 'Exposition au bruit', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 141-151', description: 'Limites exposition bruit', mandatory: true }
        ]
      }
    ]
  },
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
      },
      { 
        id: 'cm-spill-2', 
        name: 'Kit de déversement', 
        category: 'engineering', 
        description: 'Absorbants, barrières, contenants', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'astm-f716', name: 'ASTM F716', fullName: 'Sorbent Performance of Absorbents', url: 'https://www.astm.org/f0716-18.html', section: 'Section 5', description: 'Performance absorbants', mandatory: false }
        ]
      }
    ]
  },
  {
    id: 'environmental-contamination',
    name: 'Contamination environnementale',
    category: 'Environnemental',
    description: 'Pollution sol, eau, air par substances dangereuses',
    riskLevel: 'high',
    legislation: 'LQE, LCPE, Règlements municipaux',
    icon: '🌍',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-env-1', 
        name: 'Caractérisation environnementale', 
        category: 'engineering', 
        description: 'Analyse sol/eau existante', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'lqe-art-31.42', name: 'LQE Art. 31.42', fullName: 'Plans d\'urgence environnementale', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/Q-2/', section: 'Art. 31.42', description: 'Plans intervention obligatoires', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS PSYCHOSOCIAUX ===================
const psychosocialHazards: Hazard[] = [
  {
    id: 'workplace-violence',
    name: 'Violence au travail',
    category: 'Psychosocial',
    description: 'Violence physique ou psychologique',
    riskLevel: 'high',
    legislation: 'LSST Art. 2.1, RSST',
    icon: '⚠️',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-viol-1', 
        name: 'Politique tolérance zéro', 
        category: 'administrative', 
        description: 'Cadre disciplinaire clair', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'lsst-2.1', name: 'LSST Art. 2.1', fullName: 'Prévention violence au travail', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/S-2.1/', section: 'Art. 2.1', description: 'Obligations prévention violence', mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'harassment',
    name: 'Harcèlement psychologique',
    category: 'Psychosocial',
    description: 'Conduites vexatoires répétées',
    riskLevel: 'medium',
    legislation: 'Loi sur les normes du travail',
    icon: '😰',
    selected: false,
    controlMeasures: [
      { 
        id: 'cm-har-1', 
        name: 'Politique anti-harcèlement', 
        category: 'administrative', 
        description: 'Cadre préventif', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'lnt-harcelement', name: 'LNT Harcèlement', fullName: 'Loi normes travail - Harcèlement', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/N-1.1/', section: 'Art. 81.18', description: 'Politique anti-harcèlement obligatoire', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS INCENDIE/EXPLOSION ===================
const fireHazards: Hazard[] = [
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
      },
      { 
        id: 'cm-fire-2', 
        name: 'Surveillance incendie', 
        category: 'administrative', 
        description: 'Garde-feu spécialisé', 
        priority: 1, 
        implemented: false,
        standards: [
          { id: 'rsst-323', name: 'RSST Art. 323', fullName: 'Travaux de soudage', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 323-325', description: 'Précautions travaux chauds', mandatory: true }
        ]
      }
    ]
  }
];

// =================== DANGERS TRANSPORT/CIRCULATION ===================
const transportHazards: Hazard[] = [
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
      },
      { 
        id: 'cm-traf-3', 
        name: 'Séparation zones', 
        category: 'engineering', 
        description: 'Barrières physiques', 
        priority: 2, 
        implemented: false,
        standards: [
          { id: 'rsst-320', name: 'RSST Art. 320', fullName: 'Protection circulation', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 320-325', description: 'Séparation obligatoire zones', mandatory: true }
        ]
      }
    ]
  }
];

// =================== COMBINAISON DE TOUS LES DANGERS ===================
const hazardsList: Hazard[] = [
  ...electricalHazards,
  ...mechanicalHazards,
  ...manualToolsHazards,
  ...physicalHazards,
  ...chemicalHazards,
  ...ergonomicHazards,
  ...environmentalHazards,
  ...psychosocialHazards,
  ...fireHazards,
  ...transportHazards
];

// =================== COMPOSANT PRINCIPAL ===================
const Step3Hazards: React.FC<Step3HazardsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const texts = translations[language];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Initialiser avec les dangers traduits
  const [hazards, setHazards] = useState<Hazard[]>(() => {
    if (formData.hazards?.list && formData.hazards.list.length > 0) {
      // Appliquer les traductions aux données sauvegardées
      return translateHazards(formData.hazards.list, language);
    }
    return translateHazards(hazardsList, language);
  });

  // Filtrage des dangers
  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch = hazard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hazard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques (traduites)
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

  // =================== FONCTIONS UTILITAIRES ===================
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
    return texts.riskLevels[level as keyof typeof texts.riskLevels] || '⚪ Indéterminé';
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Électrique': '⚡', 'Electrical': '⚡',
      'Mécanique': '⚙️', 'Mechanical': '⚙️',
      'Physique': '🏗️', 'Physical': '🏗️',
      'Chimique': '🧪', 'Chemical': '🧪',
      'Ergonomique': '🏋️', 'Ergonomic': '🏋️',
      'Environnemental': '🌪️', 'Environmental': '🌪️',
      'Psychosocial': '🧠',
      'Incendie': '🔥', 'Fire': '🔥',
      'Transport': '🚛'
    };
    return iconMap[category] || '⚠️';
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
    return texts.controlCategories[category as keyof typeof texts.controlCategories] || '❓ Autre';
  };

  // Effet pour mettre à jour les traductions quand la langue change
  React.useEffect(() => {
    const translatedHazards = translateHazards(hazards, language);
    setHazards(translatedHazards);
  }, [language]);
  return (
    <>
      {/* CSS pour Step 3 - Design optimisé et responsive */}
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
          .control-input[type="date"] { 
            background: rgba(30, 41, 59, 0.9); 
            border: 2px solid rgba(251, 191, 36, 0.3); 
            color: #ffffff; 
            position: relative;
          }
          .control-input[type="date"]::-webkit-calendar-picker-indicator {
            background-color: #f59e0b;
            border-radius: 3px;
            cursor: pointer;
            filter: invert(1);
            padding: 2px;
          }
          .control-input[type="date"]::-webkit-datetime-edit {
            color: #ffffff;
          }
          .control-input[type="date"]::-webkit-datetime-edit-text {
            color: #94a3b8;
          }
          .control-input[type="date"]::-webkit-datetime-edit-month-field,
          .control-input[type="date"]::-webkit-datetime-edit-day-field,
          .control-input[type="date"]::-webkit-datetime-edit-year-field {
            color: #ffffff;
            background: transparent;
          }
          .control-input[type="date"]:hover {
            border-color: rgba(251, 191, 36, 0.6);
            background: rgba(30, 41, 59, 1);
          }
          .control-input[type="date"]:focus {
            border-color: #f59e0b;
            background: rgba(30, 41, 59, 1);
            box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
          }
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
            {texts.title}
          </div>
          <p style={{ color: '#d97706', margin: '0 0 8px', fontSize: '14px' }}>
            {texts.subtitle}
          </p>
          
          {selectedHazards.length > 0 && (
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.length}</div>
                <div className="stat-label">{texts.hazardsIdentified}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedHazards.filter(h => h.riskLevel === 'critical' || h.riskLevel === 'high').length}</div>
                <div className="stat-label">{texts.highRisks}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0)}
                </div>
                <div className="stat-label">{texts.controlsImplemented}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0) > 0 
                    ? Math.round((selectedHazards.reduce((sum, h) => sum + h.controlMeasures.filter(c => c.implemented).length, 0) / 
                        selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0)) * 100)
                    : 0}%
                </div>
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
              <option value="all">{texts.allCategories} ({hazards.length})</option>
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
                      {texts.controlMeasures} ({hazard.controlMeasures.filter(c => c.implemented).length}/{hazard.controlMeasures.length})
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
                                  title={`${language === 'fr' ? 'Priorité' : 'Priority'} ${control.priority}`}
                                />
                              </div>

                              {/* Standards/Normes associées */}
                              {control.standards && control.standards.length > 0 && (
                                <div className="control-standards">
                                  <div className="standards-label">{texts.standardsReferences}</div>
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
                                          <em>{standard.mandatory ? texts.mandatory : texts.recommended}</em>
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
                                    placeholder={texts.responsible}
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
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>{texts.noHazardsFound}</h3>
            <p style={{ margin: 0 }}>{texts.noHazardsMessage}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Step3Hazards;
