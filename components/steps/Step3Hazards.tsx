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

// =================== SYSTÈME DE TRADUCTIONS COMPLET ===================
const translations = {
  fr: {
    // En-tête
    title: "⚠️ Identification des Dangers & Risques",
    subtitle: "Sélectionnez les dangers potentiels et définissez les moyens de contrôle requis",
    
    // Statistiques
    hazardsIdentified: "Dangers identifiés",
    highRisks: "Risques élevés",
    controlsImplemented: "Contrôles implantés",
    implementationRate: "Taux d'implantation",
    
    // Recherche
    searchPlaceholder: "Rechercher un danger...",
    allCategories: "Toutes catégories",
    
    // Niveaux de risque
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé", 
      medium: "🟡 Moyen",
      low: "🟢 Faible",
      default: "⚪ Indéterminé"
    },
    
    // Catégories de contrôle
    controlCategories: {
      elimination: "❌ Élimination",
      substitution: "🔄 Substitution",
      engineering: "🔧 Ingénierie",
      administrative: "📋 Administrative",
      ppe: "🛡️ EPI",
      default: "❓ Autre"
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
    standardsReferences: "📋 Normes & Références :",
    responsible: "Responsable...",
    mandatory: "Obligatoire",
    recommended: "Recommandé",
    priority: "Priorité",
    noResults: "Aucun danger trouvé",
    noResultsDescription: "Modifiez vos critères de recherche pour voir plus de dangers",
    
    // Dangers spécifiques - Électriques
    hazards: {
      "elec-shock": {
        name: "Électrocution / Électrisation",
        description: "Contact direct ou indirect avec parties sous tension"
      },
      "arc-flash": {
        name: "Arc électrique",
        description: "Arc électrique lors de manœuvres sous tension"
      },
      "overhead-lines": {
        name: "Lignes électriques aériennes",
        description: "Contact avec lignes électriques extérieures"
      },
      // Mécaniques
      "moving-parts": {
        name: "Pièces mobiles",
        description: "Écrasement, coincement par pièces mobiles"
      },
      "pressure": {
        name: "Systèmes sous pression",
        description: "Explosion, projection due à la pression"
      },
      "lifting-equipment": {
        name: "Équipements de levage",
        description: "Chute de charge, basculement d'équipement"
      },
      // Physiques
      "falls": {
        name: "Chutes de hauteur",
        description: "Chutes de plus de 3 mètres"
      },
      "scaffolding": {
        name: "Échafaudages",
        description: "Effondrement, instabilité des échafaudages"
      },
      "struck-objects": {
        name: "Objets qui tombent",
        description: "Impact d'objets en chute libre"
      },
      "confined-spaces": {
        name: "Espaces clos",
        description: "Atmosphères dangereuses, engloutissement"
      },
      // Chimiques
      "toxic-vapors": {
        name: "Vapeurs toxiques",
        description: "Inhalation de substances dangereuses"
      },
      "chemical-burns": {
        name: "Brûlures chimiques",
        description: "Contact avec substances corrosives"
      },
      "asbestos": {
        name: "Amiante",
        description: "Exposition aux fibres d'amiante"
      },
      // Ergonomiques
      "manual-handling": {
        name: "Manutention manuelle",
        description: "Troubles musculo-squelettiques"
      },
      "repetitive-work": {
        name: "Travail répétitif",
        description: "Mouvements répétitifs, postures contraignantes"
      },
      // Environnementaux
      "extreme-weather": {
        name: "Conditions météo extrêmes",
        description: "Exposition aux intempéries"
      },
      "heat-stress": {
        name: "Stress thermique",
        description: "Coups de chaleur, épuisement"
      },
      "noise": {
        name: "Exposition au bruit",
        description: "Dommages auditifs"
      },
      "spills": {
        name: "Déversements",
        description: "Déversement de fluides (huile, carburant, produits chimiques)"
      },
      "environmental-contamination": {
        name: "Contamination environnementale",
        description: "Pollution sol, eau, air par substances dangereuses"
      },
      // Psychosociaux
      "workplace-violence": {
        name: "Violence au travail",
        description: "Violence physique ou psychologique"
      },
      "harassment": {
        name: "Harcèlement psychologique",
        description: "Conduites vexatoires répétées"
      },
      // Incendie
      "fire-explosion": {
        name: "Incendie/Explosion",
        description: "Feu, explosion de matières inflammables"
      },
      // Transport
      "vehicle-traffic": {
        name: "Circulation véhiculaire",
        description: "Collision avec véhicules, engins"
      }
    },
    
    // Mesures de contrôle
    controlMeasuresData: {
      // Électriques
      "cm-elec-1": {
        name: "Consignation LOTO complète",
        description: "Isolation complète des sources d'énergie"
      },
      "cm-elec-2": {
        name: "Vérification absence de tension (VAT)",
        description: "Test avec voltmètre certifié"
      },
      "cm-elec-3": {
        name: "Gants isolants classe appropriée",
        description: "Gants diélectriques testés"
      },
      "cm-elec-4": {
        name: "Formation électrique qualifiée",
        description: "Personnel certifié travaux électriques"
      },
      "cm-arc-1": {
        name: "Analyse d'arc électrique",
        description: "Calcul énergie incidente"
      },
      "cm-arc-2": {
        name: "Vêtements résistants à l'arc",
        description: "Habit arc-flash certifié"
      },
      "cm-arc-3": {
        name: "Distance de sécurité respectée",
        description: "Périmètre de protection"
      },
      "cm-lines-1": {
        name: "Distance de sécurité minimale",
        description: "Respecter zones de protection"
      },
      "cm-lines-2": {
        name: "Surveillance dédiée",
        description: "Signaleur spécialisé"
      },
      "cm-lines-3": {
        name: "Isolation/mise hors tension",
        description: "Coordination avec utilités"
      },
      // Mécaniques
      "cm-mech-1": {
        name: "Arrêt complet des équipements",
        description: "Immobilisation totale"
      },
      "cm-mech-2": {
        name: "Consignation mécanique",
        description: "Blocage physique"
      },
      "cm-mech-3": {
        name: "Protecteurs mécaniques",
        description: "Barrières physiques"
      },
      "cm-press-1": {
        name: "Dépressurisation complète",
        description: "Évacuation totale pression"
      },
      "cm-press-2": {
        name: "Soupapes de sécurité",
        description: "Protection surpression"
      },
      "cm-lift-1": {
        name: "Inspection quotidienne",
        description: "Vérification pré-utilisation"
      },
      "cm-lift-2": {
        name: "Certification des équipements",
        description: "Inspection annuelle certifiée"
      },
      "cm-lift-3": {
        name: "Formation opérateurs",
        description: "Certification spécialisée"
      },
      // Physiques
      "cm-fall-1": {
        name: "Garde-corps permanents",
        description: "Barrières de protection"
      },
      "cm-fall-2": {
        name: "Harnais de sécurité",
        description: "Système antichute"
      },
      "cm-fall-3": {
        name: "Points d'ancrage certifiés",
        description: "Ancrages structuraux"
      },
      "cm-scaf-1": {
        name: "Montage par personne compétente",
        description: "Certification échafaudage"
      },
      "cm-scaf-2": {
        name: "Inspection quotidienne",
        description: "Vérification stabilité"
      },
      "cm-obj-1": {
        name: "Casque de protection",
        description: "Protection crânienne"
      },
      "cm-obj-2": {
        name: "Périmètre de sécurité",
        description: "Zone d'exclusion"
      },
      "cm-conf-1": {
        name: "Permis d'entrée",
        description: "Autorisation documentée"
      },
      "cm-conf-2": {
        name: "Test atmosphérique",
        description: "Détection 4 gaz minimum"
      },
      "cm-conf-3": {
        name: "Ventilation forcée",
        description: "Renouvellement d'air"
      },
      // Chimiques
      "cm-chem-1": {
        name: "Ventilation mécanique",
        description: "Extraction d'air"
      },
      "cm-chem-2": {
        name: "Appareil respiratoire",
        description: "Protection respiratoire"
      },
      "cm-burn-1": {
        name: "Gants chimiques",
        description: "Protection cutanée"
      },
      "cm-burn-2": {
        name: "Douche d'urgence",
        description: "Rinçage immédiat"
      },
      "cm-asb-1": {
        name: "Caractérisation préalable",
        description: "Identification matériaux"
      },
      "cm-asb-2": {
        name: "Confinement zone",
        description: "Isolation étanche"
      },
      "cm-asb-3": {
        name: "Respirateur P100",
        description: "Protection respiratoire"
      },
      // Ergonomiques
      "cm-man-1": {
        name: "Équipements d'aide",
        description: "Outils de levage"
      },
      "cm-man-2": {
        name: "Techniques de levage",
        description: "Formation postures"
      },
      "cm-rep-1": {
        name: "Rotation des postes",
        description: "Alternance des tâches"
      },
      "cm-rep-2": {
        name: "Pauses actives",
        description: "Récupération régulière"
      },
      // Environnementaux
      "cm-weather-1": {
        name: "Surveillance météorologique",
        description: "Veille conditions"
      },
      "cm-weather-2": {
        name: "Arrêt travaux si nécessaire",
        description: "Protocole suspension"
      },
      "cm-heat-1": {
        name: "Surveillance température",
        description: "Mesure WBGT"
      },
      "cm-heat-2": {
        name: "Hydratation fréquente",
        description: "Pauses boisson"
      },
      "cm-noise-1": {
        name: "Protection auditive",
        description: "Bouchons/casques"
      },
      "cm-noise-2": {
        name: "Mesure sonométrique",
        description: "Évaluation exposition"
      },
      "cm-spill-1": {
        name: "Rétention primaire",
        description: "Bacs de rétention, plateformes étanches"
      },
      "cm-spill-2": {
        name: "Kit de déversement",
        description: "Absorbants, barrières, contenants"
      },
      "cm-env-1": {
        name: "Caractérisation environnementale",
        description: "Analyse sol/eau existante"
      },
      // Psychosociaux
      "cm-viol-1": {
        name: "Politique tolérance zéro",
        description: "Cadre disciplinaire clair"
      },
      "cm-har-1": {
        name: "Politique anti-harcèlement",
        description: "Cadre préventif"
      },
      // Incendie
      "cm-fire-1": {
        name: "Permis de travail à chaud",
        description: "Autorisation soudage/coupage"
      },
      "cm-fire-2": {
        name: "Surveillance incendie",
        description: "Garde-feu spécialisé"
      },
      // Transport
      "cm-traf-1": {
        name: "Signalisation temporaire",
        description: "Cônes, panneaux, feux"
      },
      "cm-traf-2": {
        name: "Vêtements haute visibilité",
        description: "Gilets rétroréfléchissants"
      },
      "cm-traf-3": {
        name: "Séparation zones",
        description: "Barrières physiques"
      }
    }
  },
  
  en: {
    // Header
    title: "⚠️ Hazard & Risk Identification",
    subtitle: "Select potential hazards and define required control measures",
    
    // Statistics
    hazardsIdentified: "Hazards identified",
    highRisks: "High risks",
    controlsImplemented: "Controls implemented",
    implementationRate: "Implementation rate",
    
    // Search
    searchPlaceholder: "Search for a hazard...",
    allCategories: "All categories",
    
    // Risk levels
    riskLevels: {
      critical: "🔴 Critical",
      high: "🟠 High",
      medium: "🟡 Medium", 
      low: "🟢 Low",
      default: "⚪ Undetermined"
    },
    
    // Control categories
    controlCategories: {
      elimination: "❌ Elimination",
      substitution: "🔄 Substitution",
      engineering: "🔧 Engineering",
      administrative: "📋 Administrative",
      ppe: "🛡️ PPE",
      default: "❓ Other"
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
    standardsReferences: "📋 Standards & References:",
    responsible: "Responsible...",
    mandatory: "Mandatory",
    recommended: "Recommended",
    priority: "Priority",
    noResults: "No hazards found",
    noResultsDescription: "Modify your search criteria to see more hazards",
    
    // Specific hazards - Electrical
    hazards: {
      "elec-shock": {
        name: "Electrocution / Electric shock",
        description: "Direct or indirect contact with live parts"
      },
      "arc-flash": {
        name: "Arc flash",
        description: "Electric arc during live work operations"
      },
      "overhead-lines": {
        name: "Overhead power lines",
        description: "Contact with external power lines"
      },
      // Mechanical
      "moving-parts": {
        name: "Moving parts",
        description: "Crushing, pinching by moving parts"
      },
      "pressure": {
        name: "Pressure systems",
        description: "Explosion, projection due to pressure"
      },
      "lifting-equipment": {
        name: "Lifting equipment",
        description: "Load drop, equipment tipping"
      },
      // Physical
      "falls": {
        name: "Falls from height",
        description: "Falls from more than 3 meters"
      },
      "scaffolding": {
        name: "Scaffolding",
        description: "Collapse, instability of scaffolding"
      },
      "struck-objects": {
        name: "Falling objects",
        description: "Impact from falling objects"
      },
      "confined-spaces": {
        name: "Confined spaces",
        description: "Dangerous atmospheres, engulfment"
      },
      // Chemical
      "toxic-vapors": {
        name: "Toxic vapors",
        description: "Inhalation of hazardous substances"
      },
      "chemical-burns": {
        name: "Chemical burns",
        description: "Contact with corrosive substances"
      },
      "asbestos": {
        name: "Asbestos",
        description: "Exposure to asbestos fibers"
      },
      // Ergonomic
      "manual-handling": {
        name: "Manual handling",
        description: "Musculoskeletal disorders"
      },
      "repetitive-work": {
        name: "Repetitive work",
        description: "Repetitive movements, awkward postures"
      },
      // Environmental
      "extreme-weather": {
        name: "Extreme weather conditions",
        description: "Exposure to severe weather"
      },
      "heat-stress": {
        name: "Heat stress",
        description: "Heat stroke, exhaustion"
      },
      "noise": {
        name: "Noise exposure",
        description: "Hearing damage"
      },
      "spills": {
        name: "Spills",
        description: "Fluid spills (oil, fuel, chemicals)"
      },
      "environmental-contamination": {
        name: "Environmental contamination",
        description: "Soil, water, air pollution by hazardous substances"
      },
      // Psychosocial
      "workplace-violence": {
        name: "Workplace violence",
        description: "Physical or psychological violence"
      },
      "harassment": {
        name: "Psychological harassment",
        description: "Repeated vexatious conduct"
      },
      // Fire
      "fire-explosion": {
        name: "Fire/Explosion",
        description: "Fire, explosion of flammable materials"
      },
      // Transport
      "vehicle-traffic": {
        name: "Vehicle traffic",
        description: "Collision with vehicles, equipment"
      }
    },
    
    // Control measures
    controlMeasuresData: {
      // Electrical
      "cm-elec-1": {
        name: "Complete LOTO lockout",
        description: "Complete isolation of energy sources"
      },
      "cm-elec-2": {
        name: "Absence of voltage verification (AOV)",
        description: "Test with certified voltmeter"
      },
      "cm-elec-3": {
        name: "Appropriate class insulating gloves",
        description: "Tested dielectric gloves"
      },
      "cm-elec-4": {
        name: "Qualified electrical training",
        description: "Certified electrical work personnel"
      },
      "cm-arc-1": {
        name: "Arc flash analysis",
        description: "Incident energy calculation"
      },
      "cm-arc-2": {
        name: "Arc-resistant clothing",
        description: "Certified arc-flash suit"
      },
      "cm-arc-3": {
        name: "Safety distance respected",
        description: "Protection perimeter"
      },
      "cm-lines-1": {
        name: "Minimum safety distance",
        description: "Respect protection zones"
      },
      "cm-lines-2": {
        name: "Dedicated surveillance",
        description: "Specialized spotter"
      },
      "cm-lines-3": {
        name: "Isolation/de-energization",
        description: "Coordination with utilities"
      },
      // Mechanical
      "cm-mech-1": {
        name: "Complete equipment shutdown",
        description: "Total immobilization"
      },
      "cm-mech-2": {
        name: "Mechanical lockout",
        description: "Physical blocking"
      },
      "cm-mech-3": {
        name: "Mechanical guards",
        description: "Physical barriers"
      },
      "cm-press-1": {
        name: "Complete depressurization",
        description: "Total pressure evacuation"
      },
      "cm-press-2": {
        name: "Safety valves",
        description: "Overpressure protection"
      },
      "cm-lift-1": {
        name: "Daily inspection",
        description: "Pre-use verification"
      },
      "cm-lift-2": {
        name: "Equipment certification",
        description: "Certified annual inspection"
      },
      "cm-lift-3": {
        name: "Operator training",
        description: "Specialized certification"
      },
      // Physical
      "cm-fall-1": {
        name: "Permanent guardrails",
        description: "Protection barriers"
      },
      "cm-fall-2": {
        name: "Safety harness",
        description: "Fall arrest system"
      },
      "cm-fall-3": {
        name: "Certified anchor points",
        description: "Structural anchors"
      },
      "cm-scaf-1": {
        name: "Assembly by competent person",
        description: "Scaffolding certification"
      },
      "cm-scaf-2": {
        name: "Daily inspection",
        description: "Stability verification"
      },
      "cm-obj-1": {
        name: "Protective helmet",
        description: "Head protection"
      },
      "cm-obj-2": {
        name: "Safety perimeter",
        description: "Exclusion zone"
      },
      "cm-conf-1": {
        name: "Entry permit",
        description: "Documented authorization"
      },
      "cm-conf-2": {
        name: "Atmospheric testing",
        description: "Minimum 4-gas detection"
      },
      "cm-conf-3": {
        name: "Forced ventilation",
        description: "Air renewal"
      },
      // Chemical
      "cm-chem-1": {
        name: "Mechanical ventilation",
        description: "Air extraction"
      },
      "cm-chem-2": {
        name: "Respiratory equipment",
        description: "Respiratory protection"
      },
      "cm-burn-1": {
        name: "Chemical gloves",
        description: "Skin protection"
      },
      "cm-burn-2": {
        name: "Emergency shower",
        description: "Immediate rinsing"
      },
      "cm-asb-1": {
        name: "Prior characterization",
        description: "Material identification"
      },
      "cm-asb-2": {
        name: "Zone containment",
        description: "Sealed isolation"
      },
      "cm-asb-3": {
        name: "P100 respirator",
        description: "Respiratory protection"
      },
      // Ergonomic
      "cm-man-1": {
        name: "Lifting aids",
        description: "Lifting tools"
      },
      "cm-man-2": {
        name: "Lifting techniques",
        description: "Posture training"
      },
      "cm-rep-1": {
        name: "Job rotation",
        description: "Task alternation"
      },
      "cm-rep-2": {
        name: "Active breaks",
        description: "Regular recovery"
      },
      // Environmental
      "cm-weather-1": {
        name: "Weather monitoring",
        description: "Condition surveillance"
      },
      "cm-weather-2": {
        name: "Work stoppage if necessary",
        description: "Suspension protocol"
      },
      "cm-heat-1": {
        name: "Temperature monitoring",
        description: "WBGT measurement"
      },
      "cm-heat-2": {
        name: "Frequent hydration",
        description: "Drinking breaks"
      },
      "cm-noise-1": {
        name: "Hearing protection",
        description: "Plugs/earmuffs"
      },
      "cm-noise-2": {
        name: "Sound measurement",
        description: "Exposure evaluation"
      },
      "cm-spill-1": {
        name: "Primary containment",
        description: "Containment trays, sealed platforms"
      },
      "cm-spill-2": {
        name: "Spill kit",
        description: "Absorbents, barriers, containers"
      },
      "cm-env-1": {
        name: "Environmental characterization",
        description: "Existing soil/water analysis"
      },
      // Psychosocial
      "cm-viol-1": {
        name: "Zero tolerance policy",
        description: "Clear disciplinary framework"
      },
      "cm-har-1": {
        name: "Anti-harassment policy",
        description: "Preventive framework"
      },
      // Fire
      "cm-fire-1": {
        name: "Hot work permit",
        description: "Welding/cutting authorization"
      },
      "cm-fire-2": {
        name: "Fire watch",
        description: "Specialized fire guard"
      },
      // Transport
      "cm-traf-1": {
        name: "Temporary signaling",
        description: "Cones, signs, lights"
      },
      "cm-traf-2": {
        name: "High-visibility clothing",
        description: "Reflective vests"
      },
      "cm-traf-3": {
        name: "Zone separation",
        description: "Physical barriers"
      }
    }
  }
};

// =================== FONCTION POUR OBTENIR LES ICÔNES DE CATÉGORIES ===================
const getCategoryIcon = (category: string, language: 'fr' | 'en') => {
  const t = translations[language];
  
  // Mapping des catégories traduites vers les icônes
  const categoryMap = language === 'fr' ? {
    'Électrique': '⚡',
    'Mécanique': '⚙️', 
    'Physique': '🏗️',
    'Chimique': '🧪',
    'Ergonomique': '🏋️',
    'Environnemental': '🌪️',
    'Psychosocial': '🧠',
    'Incendie': '🔥',
    'Transport': '🚛'
  } : {
    'Electrical': '⚡',
    'Mechanical': '⚙️',
    'Physical': '🏗️', 
    'Chemical': '🧪',
    'Ergonomic': '🏋️',
    'Environmental': '🌪️',
    'Psychosocial': '🧠',
    'Fire': '🔥',
    'Transport': '🚛'
  };
  
  return categoryMap[category as keyof typeof categoryMap] || '⚠️';
};
// =================== FONCTION POUR GÉNÉRER LA LISTE DE DANGERS TRADUITE ===================
const getHazardsList = (language: 'fr' | 'en'): Hazard[] => {
  const t = translations[language];
  const categoryNames = t.hazardCategories;
  
  return [
    // =================== DANGERS ÉLECTRIQUES ===================
    {
      id: 'elec-shock',
      name: t.hazards['elec-shock'].name,
      category: categoryNames.electrical,
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
          implemented: false,
          standards: [
            { id: 'csa-z460', name: 'CSA Z460', fullName: language === 'fr' ? 'Maîtrise des énergies dangereuses' : 'Control of Hazardous Energy', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z460', section: 'Art. 5.2', description: language === 'fr' ? 'Procédures de consignation' : 'Lockout procedures', mandatory: true },
            { id: 'rsst-185', name: 'RSST Art. 185', fullName: language === 'fr' ? 'Règlement SST - Travaux électriques' : 'OHS Regulation - Electrical work', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 185-190', description: language === 'fr' ? 'Obligations consignation électrique' : 'Electrical lockout obligations', mandatory: true }
          ]
        },
        { 
          id: 'cm-elec-2', 
          name: t.controlMeasuresData['cm-elec-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-elec-2'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'csa-z462', name: 'CSA Z462', fullName: language === 'fr' ? 'Sécurité en milieu de travail - Énergie électrique' : 'Workplace electrical safety', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z462', section: 'Art. 6.3', description: language === 'fr' ? 'Procédures de vérification' : 'Verification procedures', mandatory: true }
          ]
        },
        { 
          id: 'cm-elec-3', 
          name: t.controlMeasuresData['cm-elec-3'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-elec-3'].description,
          priority: 3, 
          implemented: false,
          standards: [
            { id: 'astm-d120', name: 'ASTM D120', fullName: 'Rubber Insulating Gloves', url: 'https://www.astm.org/d0120-20.html', section: 'Table 1', description: language === 'fr' ? 'Classification des gants isolants' : 'Insulating gloves classification', mandatory: true }
          ]
        },
        { 
          id: 'cm-elec-4', 
          name: t.controlMeasuresData['cm-elec-4'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-elec-4'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'cnesst-guide', name: 'Guide CNESST', fullName: language === 'fr' ? 'Guide de prévention - Travaux électriques' : 'Prevention Guide - Electrical work', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/travaux-electriques', section: 'Section 3', description: language === 'fr' ? 'Formation requise' : 'Required training', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'arc-flash',
      name: t.hazards['arc-flash'].name,
      category: categoryNames.electrical,
      description: t.hazards['arc-flash'].description,
      riskLevel: 'critical' as const,
      legislation: 'CSA Z462, NFPA 70E',
      icon: '🔥',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-arc-1', 
          name: t.controlMeasuresData['cm-arc-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-arc-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'ieee-1584', name: 'IEEE 1584', fullName: 'Guide for Performing Arc-Flash Hazard Calculations', url: 'https://standards.ieee.org/ieee/1584/5507/', section: 'Section 4', description: language === 'fr' ? 'Calculs d\'arc électrique' : 'Arc flash calculations', mandatory: true }
          ]
        },
        { 
          id: 'cm-arc-2', 
          name: t.controlMeasuresData['cm-arc-2'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-arc-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'astm-f1506', name: 'ASTM F1506', fullName: 'Standard for Flame Resistant Textile Materials', url: 'https://www.astm.org/f1506-20a.html', section: 'Section 5', description: language === 'fr' ? 'Vêtements résistants aux arcs' : 'Arc-resistant clothing', mandatory: true }
          ]
        },
        { 
          id: 'cm-arc-3', 
          name: t.controlMeasuresData['cm-arc-3'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-arc-3'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'rsst-186', name: 'RSST Art. 186', fullName: language === 'fr' ? 'Règlement SST - Distances sécurité' : 'OHS Regulation - Safety distances', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 186', description: language === 'fr' ? 'Distances minimales électriques' : 'Minimum electrical distances', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'overhead-lines',
      name: t.hazards['overhead-lines'].name,
      category: categoryNames.electrical,
      description: t.hazards['overhead-lines'].description,
      riskLevel: 'critical' as const,
      legislation: 'RSST Art. 185-190',
      icon: '🌩️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-lines-1', 
          name: t.controlMeasuresData['cm-lines-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-lines-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-187', name: 'RSST Art. 187', fullName: language === 'fr' ? 'Distances lignes électriques' : 'Power lines distances', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 187', description: language === 'fr' ? 'Distances minimales selon voltage' : 'Minimum distances by voltage', mandatory: true }
          ]
        },
        { 
          id: 'cm-lines-2', 
          name: t.controlMeasuresData['cm-lines-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-lines-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-188', name: 'RSST Art. 188', fullName: language === 'fr' ? 'Surveillance obligatoire' : 'Mandatory surveillance', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 188', description: language === 'fr' ? 'Surveillance près lignes électriques' : 'Surveillance near power lines', mandatory: true }
          ]
        },
        { 
          id: 'cm-lines-3', 
          name: t.controlMeasuresData['cm-lines-3'].name,
          category: 'elimination' as const,
          description: t.controlMeasuresData['cm-lines-3'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'hydro-quebec', name: 'Hydro-Québec', fullName: language === 'fr' ? 'Procédures coordination travaux' : 'Work coordination procedures', url: 'https://www.hydroquebec.com/securite/', section: 'Guide 2024', description: language === 'fr' ? 'Coordination mise hors tension' : 'De-energization coordination', mandatory: true }
          ]
        }
      ]
    },

    // =================== DANGERS MÉCANIQUES ===================
    {
      id: 'moving-parts',
      name: t.hazards['moving-parts'].name,
      category: categoryNames.mechanical,
      description: t.hazards['moving-parts'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 182-184',
      icon: '⚙️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-mech-1', 
          name: t.controlMeasuresData['cm-mech-1'].name,
          category: 'elimination' as const,
          description: t.controlMeasuresData['cm-mech-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z432', name: 'CSA Z432', fullName: 'Safeguarding of Machinery', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z432', section: 'Art. 4.2', description: language === 'fr' ? 'Arrêt sécuritaire machines' : 'Safe machine shutdown', mandatory: true }
          ]
        },
        { 
          id: 'cm-mech-2', 
          name: t.controlMeasuresData['cm-mech-2'].name,
          category: 'elimination' as const,
          description: t.controlMeasuresData['cm-mech-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z460-mech', name: 'CSA Z460', fullName: language === 'fr' ? 'Maîtrise des énergies dangereuses' : 'Control of Hazardous Energy', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z460', section: 'Art. 8', description: language === 'fr' ? 'Consignation mécanique' : 'Mechanical lockout', mandatory: true }
          ]
        },
        { 
          id: 'cm-mech-3', 
          name: t.controlMeasuresData['cm-mech-3'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-mech-3'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'iso-14120', name: 'ISO 14120', fullName: 'Safety Guards - General requirements', url: 'https://www.iso.org/standard/54630.html', section: 'Section 5', description: language === 'fr' ? 'Protecteurs fixes et mobiles' : 'Fixed and movable guards', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'pressure',
      name: t.hazards['pressure'].name,
      category: categoryNames.mechanical,
      description: t.hazards['pressure'].description,
      riskLevel: 'high' as const,
      legislation: 'CSA B51',
      icon: '💨',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-press-1', 
          name: t.controlMeasuresData['cm-press-1'].name,
          category: 'elimination' as const,
          description: t.controlMeasuresData['cm-press-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-b51', name: 'CSA B51', fullName: 'Boiler, Pressure Vessel, and Pressure Piping Code', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-b51', section: 'Art. 7.1', description: language === 'fr' ? 'Procédures dépressurisation' : 'Depressurization procedures', mandatory: true }
          ]
        },
        { 
          id: 'cm-press-2', 
          name: t.controlMeasuresData['cm-press-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-press-2'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'api-520', name: 'API 520', fullName: 'Sizing, Selection Safety Relief Valves', url: 'https://www.api.org/products-and-services/individual-certification-programs/piping-and-pipeline/publications/api-520', section: 'Part 1', description: language === 'fr' ? 'Dimensionnement soupapes' : 'Valve sizing', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'lifting-equipment',
      name: t.hazards['lifting-equipment'].name,
      category: categoryNames.mechanical,
      description: t.hazards['lifting-equipment'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 260-290, CSA B335',
      icon: '🏗️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-lift-1', 
          name: t.controlMeasuresData['cm-lift-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-lift-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-b335', name: 'CSA B335', fullName: 'Safety Standard for Lift Trucks', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-b335', section: 'Art. 5.2', description: language === 'fr' ? 'Inspections quotidiennes' : 'Daily inspections', mandatory: true }
          ]
        },
        { 
          id: 'cm-lift-2', 
          name: t.controlMeasuresData['cm-lift-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-lift-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'asme-b30', name: 'ASME B30', fullName: 'Overhead and Mobile Cranes', url: 'https://www.asme.org/codes-standards/find-codes-standards/b30-overhead-mobile-cranes', section: 'B30.2', description: language === 'fr' ? 'Certification grues mobiles' : 'Mobile crane certification', mandatory: true }
          ]
        },
        { 
          id: 'cm-lift-3', 
          name: t.controlMeasuresData['cm-lift-3'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-lift-3'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'cnesst-grue', name: 'CNESST Grues', fullName: language === 'fr' ? 'Guide formation opérateurs grues' : 'Crane operator training guide', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/appareils-levage', section: 'Section 2', description: language === 'fr' ? 'Formation obligatoire' : 'Mandatory training', mandatory: true }
          ]
        }
      ]
    },

    // =================== DANGERS PHYSIQUES ===================
    {
      id: 'falls',
      name: t.hazards['falls'].name,
      category: categoryNames.physical,
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
          implemented: false,
          standards: [
            { id: 'rsst-347', name: 'RSST Art. 347', fullName: language === 'fr' ? 'Protection contre chutes' : 'Fall protection', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 347-350', description: language === 'fr' ? 'Garde-corps obligatoires' : 'Mandatory guardrails', mandatory: true }
          ]
        },
        { 
          id: 'cm-fall-2', 
          name: t.controlMeasuresData['cm-fall-2'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-fall-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z259.10', name: 'CSA Z259.10', fullName: 'Full Body Harnesses', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z259-10', section: 'Art. 5', description: language === 'fr' ? 'Harnais complets' : 'Full body harnesses', mandatory: true }
          ]
        },
        { 
          id: 'cm-fall-3', 
          name: t.controlMeasuresData['cm-fall-3'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-fall-3'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z259.16', name: 'CSA Z259.16', fullName: 'Design of Active Fall-Protection Systems', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z259-16', section: 'Art. 6', description: language === 'fr' ? 'Systèmes protection active' : 'Active protection systems', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'scaffolding',
      name: t.hazards['scaffolding'].name,
      category: categoryNames.physical,
      description: t.hazards['scaffolding'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 347-350, CSA S269.2',
      icon: '🚧',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-scaf-1', 
          name: t.controlMeasuresData['cm-scaf-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-scaf-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-s269.2', name: 'CSA S269.2', fullName: 'Access Scaffolding for Construction Purposes', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-s269-2', section: 'Art. 4.2', description: language === 'fr' ? 'Montage par personne qualifiée' : 'Assembly by qualified person', mandatory: true }
          ]
        },
        { 
          id: 'cm-scaf-2', 
          name: t.controlMeasuresData['cm-scaf-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-scaf-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-349', name: 'RSST Art. 349', fullName: language === 'fr' ? 'Inspection échafaudages' : 'Scaffolding inspection', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 349', description: language === 'fr' ? 'Inspection obligatoire quotidienne' : 'Mandatory daily inspection', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'struck-objects',
      name: t.hazards['struck-objects'].name,
      category: categoryNames.physical,
      description: t.hazards['struck-objects'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 338',
      icon: '⬇️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-obj-1', 
          name: t.controlMeasuresData['cm-obj-1'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-obj-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z94.1', name: 'CSA Z94.1', fullName: 'Industrial Protective Headwear', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-1', section: 'Type 1', description: language === 'fr' ? 'Casques protection impact' : 'Impact protection helmets', mandatory: true }
          ]
        },
        { 
          id: 'cm-obj-2', 
          name: t.controlMeasuresData['cm-obj-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-obj-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-338', name: 'RSST Art. 338', fullName: language === 'fr' ? 'Protection chute objets' : 'Falling object protection', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 338', description: language === 'fr' ? 'Zones de protection obligatoires' : 'Mandatory protection zones', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'confined-spaces',
      name: t.hazards['confined-spaces'].name,
      category: categoryNames.physical,
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
          implemented: false,
          standards: [
            { id: 'rsst-302', name: 'RSST Art. 302', fullName: language === 'fr' ? 'Espaces clos - Permis' : 'Confined spaces - Permits', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 302-317', description: language === 'fr' ? 'Permis d\'entrée obligatoire' : 'Mandatory entry permit', mandatory: true }
          ]
        },
        { 
          id: 'cm-conf-2', 
          name: t.controlMeasuresData['cm-conf-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-conf-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z1006', name: 'CSA Z1006', fullName: 'Management of Work in Confined Spaces', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z1006', section: 'Art. 7.3', description: language === 'fr' ? 'Tests atmosphère obligatoires' : 'Mandatory atmosphere testing', mandatory: true }
          ]
        },
        { 
          id: 'cm-conf-3', 
          name: t.controlMeasuresData['cm-conf-3'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-conf-3'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-307', name: 'RSST Art. 307', fullName: language === 'fr' ? 'Ventilation espaces clos' : 'Confined space ventilation', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 307', description: language === 'fr' ? 'Ventilation obligatoire' : 'Mandatory ventilation', mandatory: true }
          ]
        }
      ]
    },

    // =================== DANGERS CHIMIQUES ===================
    {
      id: 'toxic-vapors',
      name: t.hazards['toxic-vapors'].name,
      category: categoryNames.chemical,
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
          implemented: false,
          standards: [
            { id: 'rsst-44', name: 'RSST Art. 44', fullName: language === 'fr' ? 'Qualité de l\'air' : 'Air quality', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 44-55', description: language === 'fr' ? 'Normes qualité air' : 'Air quality standards', mandatory: true }
          ]
        },
        { 
          id: 'cm-chem-2', 
          name: t.controlMeasuresData['cm-chem-2'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-chem-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z94.4-resp', name: 'CSA Z94.4', fullName: language === 'fr' ? 'Sélection des protecteurs respiratoires' : 'Selection of respiratory protectors', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z94-4', section: 'Art. 8', description: language === 'fr' ? 'Protection respiratoire' : 'Respiratory protection', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'chemical-burns',
      name: t.hazards['chemical-burns'].name,
      category: categoryNames.chemical,
      description: t.hazards['chemical-burns'].description,
      riskLevel: 'medium' as const,
      legislation: 'SIMDUT 2015',
      icon: '🧪',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-burn-1', 
          name: t.controlMeasuresData['cm-burn-1'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-burn-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'astm-f739', name: 'ASTM F739', fullName: 'Standard Test Method for Permeation of Liquids', url: 'https://www.astm.org/f0739-20.html', section: 'Section 4', description: language === 'fr' ? 'Tests perméation gants chimiques' : 'Chemical glove permeation tests', mandatory: true }
          ]
        },
        { 
          id: 'cm-burn-2', 
          name: t.controlMeasuresData['cm-burn-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-burn-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'ansi-z358.1', name: 'ANSI Z358.1', fullName: 'Emergency Eyewash and Shower Equipment', url: 'https://webstore.ansi.org/standards/isea/ansiz3581', section: 'Section 4', description: language === 'fr' ? 'Douches et rince-œil d\'urgence' : 'Emergency showers and eyewash', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'asbestos',
      name: t.hazards['asbestos'].name,
      category: categoryNames.chemical,
      description: t.hazards['asbestos'].description,
      riskLevel: 'critical' as const,
      legislation: 'RSST Art. 30-52',
      icon: '🫁',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-asb-1', 
          name: t.controlMeasuresData['cm-asb-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-asb-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-30', name: 'RSST Art. 30', fullName: language === 'fr' ? 'Travaux amiante' : 'Asbestos work', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 30-52', description: language === 'fr' ? 'Réglementation amiante' : 'Asbestos regulations', mandatory: true }
          ]
        },
        { 
          id: 'cm-asb-2', 
          name: t.controlMeasuresData['cm-asb-2'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-asb-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-34', name: 'RSST Art. 34', fullName: language === 'fr' ? 'Confinement amiante' : 'Asbestos containment', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 34-38', description: language === 'fr' ? 'Méthodes confinement' : 'Containment methods', mandatory: true }
          ]
        },
        { 
          id: 'cm-asb-3', 
          name: t.controlMeasuresData['cm-asb-3'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-asb-3'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'niosh-p100', name: 'NIOSH P100', fullName: 'Particulate Filter Efficiency', url: 'https://www.cdc.gov/niosh/npptl/topics/respirators/disp_part/default.html', section: 'P100 Series', description: language === 'fr' ? 'Filtres haute efficacité' : 'High efficiency filters', mandatory: true }
          ]
        }
      ]
    },

    // =================== DANGERS ERGONOMIQUES ===================
    {
      id: 'manual-handling',
      name: t.hazards['manual-handling'].name,
      category: categoryNames.ergonomic,
      description: t.hazards['manual-handling'].description,
      riskLevel: 'medium' as const,
      legislation: 'RSST Art. 166',
      icon: '🏋️',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-man-1', 
          name: t.controlMeasuresData['cm-man-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-man-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-166', name: 'RSST Art. 166', fullName: language === 'fr' ? 'Manutention manuelle' : 'Manual handling', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 166', description: language === 'fr' ? 'Limites manutention' : 'Handling limits', mandatory: true }
          ]
        },
        { 
          id: 'cm-man-2', 
          name: t.controlMeasuresData['cm-man-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-man-2'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'cnesst-tms', name: 'CNESST TMS', fullName: language === 'fr' ? 'Guide prévention TMS' : 'MSD prevention guide', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/troubles-musculo-squelettiques', section: 'Section 3', description: language === 'fr' ? 'Prévention TMS' : 'MSD prevention', mandatory: true }
          ]
        }
      ]
    },
    {
      id: 'repetitive-work',
      name: t.hazards['repetitive-work'].name,
      category: categoryNames.ergonomic,
      description: t.hazards['repetitive-work'].description,
      riskLevel: 'medium' as const,
      legislation: 'Guide CNESST TMS',
      icon: '🔄',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-rep-1', 
          name: t.controlMeasuresData['cm-rep-1'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-rep-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'iso-11228', name: 'ISO 11228', fullName: 'Ergonomics Manual Handling', url: 'https://www.iso.org/standard/51309.html', section: 'Part 3', description: language === 'fr' ? 'Manutention charges faibles haute fréquence' : 'Low load high frequency manual handling', mandatory: false }
          ]
        },
        { 
          id: 'cm-rep-2', 
          name: t.controlMeasuresData['cm-rep-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-rep-2'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'cnesst-tms-rep', name: 'CNESST TMS', fullName: language === 'fr' ? 'Guide prévention TMS répétitifs' : 'Repetitive MSD prevention guide', url: 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/troubles-musculo-squelettiques', section: 'Section 4', description: language === 'fr' ? 'Travail répétitif' : 'Repetitive work', mandatory: true }
          ]
        }
      ]
    },

    // Ajoutez les autres catégories de dangers selon le même pattern...
    // (Environnementaux, Psychosociaux, Incendie, Transport)
    // Je vais continuer avec quelques exemples clés pour ne pas dépasser la limite

    {
      id: 'fire-explosion',
      name: t.hazards['fire-explosion'].name,
      category: categoryNames.fire,
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
          implemented: false,
          standards: [
            { id: 'nfpa-51b', name: 'NFPA 51B', fullName: 'Standard for Fire Prevention During Welding', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=51B', section: 'Chapter 4', description: language === 'fr' ? 'Prévention incendie soudage' : 'Welding fire prevention', mandatory: true }
          ]
        },
        { 
          id: 'cm-fire-2', 
          name: t.controlMeasuresData['cm-fire-2'].name,
          category: 'administrative' as const,
          description: t.controlMeasuresData['cm-fire-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'rsst-323', name: 'RSST Art. 323', fullName: language === 'fr' ? 'Travaux de soudage' : 'Welding work', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 323-325', description: language === 'fr' ? 'Précautions travaux chauds' : 'Hot work precautions', mandatory: true }
          ]
        }
      ]
    },

    {
      id: 'vehicle-traffic',
      name: t.hazards['vehicle-traffic'].name,
      category: categoryNames.transport,
      description: t.hazards['vehicle-traffic'].description,
      riskLevel: 'high' as const,
      legislation: 'RSST Art. 320-340, Code sécurité routière',
      icon: '🚛',
      selected: false,
      controlMeasures: [
        { 
          id: 'cm-traf-1', 
          name: t.controlMeasuresData['cm-traf-1'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-traf-1'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'mtq-signalisation', name: 'MTQ Signalisation', fullName: language === 'fr' ? 'Norme signalisation temporaire' : 'Temporary signaling standard', url: 'https://www.transports.gouv.qc.ca/fr/entreprises-partenaires/entreprises-construction/signalisation-temporaire/', section: 'Tome VII', description: language === 'fr' ? 'Signalisation chantiers routiers' : 'Road construction signaling', mandatory: true }
          ]
        },
        { 
          id: 'cm-traf-2', 
          name: t.controlMeasuresData['cm-traf-2'].name,
          category: 'ppe' as const,
          description: t.controlMeasuresData['cm-traf-2'].description,
          priority: 1, 
          implemented: false,
          standards: [
            { id: 'csa-z96', name: 'CSA Z96', fullName: 'High-Visibility Safety Apparel', url: 'https://www.csagroup.org/fr/standards/find-a-standard/csa-z96', section: 'Class 2', description: language === 'fr' ? 'Vêtements haute visibilité' : 'High-visibility clothing', mandatory: true }
          ]
        },
        { 
          id: 'cm-traf-3', 
          name: t.controlMeasuresData['cm-traf-3'].name,
          category: 'engineering' as const,
          description: t.controlMeasuresData['cm-traf-3'].description,
          priority: 2, 
          implemented: false,
          standards: [
            { id: 'rsst-320', name: 'RSST Art. 320', fullName: language === 'fr' ? 'Protection circulation' : 'Traffic protection', url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013/', section: 'Art. 320-325', description: language === 'fr' ? 'Séparation obligatoire zones' : 'Mandatory zone separation', mandatory: true }
          ]
        }
      ]
    }
  ];
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
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Initialiser avec la liste complète des dangers traduits
  const [hazards, setHazards] = useState<Hazard[]>(() => {
    if (formData.hazards?.list && formData.hazards.list.length > 0) {
      // Si nous avons déjà des dangers sauvegardés, les utiliser mais mettre à jour les traductions
      const savedHazards = formData.hazards.list;
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
  const filteredHazards = hazards.filter(hazard => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      hazard.name.toLowerCase().includes(searchLower) ||
      hazard.description.toLowerCase().includes(searchLower) ||
      hazard.category.toLowerCase().includes(searchLower) ||
      hazard.legislation.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategory === 'all' || hazard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques avec traductions
  const categories = Array.from(new Set(hazards.map(h => h.category))).sort();
  
  // Dangers sélectionnés
  const selectedHazards = hazards.filter(h => h.selected);

  // Statistiques
  const stats = {
    totalHazards: selectedHazards.length,
    totalControls: selectedHazards.reduce((sum, h) => sum + h.controlMeasures.length, 0),
    implementedControls: selectedHazards.reduce((sum, h) => 
      sum + h.controlMeasures.filter(c => c.implemented).length, 0
    ),
    criticalHazards: selectedHazards.filter(h => h.riskLevel === 'critical').length,
    highRiskHazards: selectedHazards.filter(h => h.riskLevel === 'high').length
  };
  
  stats.implementationRate = stats.totalControls > 0 ? 
    Math.round((stats.implementedControls / stats.totalControls) * 100) : 0;

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
    
    const hazardsData = {
      list: updatedHazards,
      selected: selectedList,
      stats: {
        totalHazards: selectedList.length,
        totalControls: stats.totalControls,
        implementedControls: stats.implementedControls,
        implementationRate: stats.implementationRate,
        criticalHazards: stats.criticalHazards,
        highRiskHazards: stats.highRiskHazards,
        categories: Array.from(new Set(selectedList.map(h => h.category)))
      }
    };
    
    onDataChange('hazards', hazardsData);
  };

  // =================== FONCTIONS DE STYLE ===================
  
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
    return t.riskLevels[level as keyof typeof t.riskLevels] || t.riskLevels.default;
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
    return t.controlCategories[category as keyof typeof t.controlCategories] || t.controlCategories.default;
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
          
          .search-controls {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          
          .search-input {
            flex: 1;
            min-width: 200px;
            padding: 12px 16px;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #ffffff;
            font-size: 14px;
          }
          
          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          
          .filter-select {
            padding: 12px 16px;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            color: #ffffff;
            min-width: 150px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .stat-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            text-align: center;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 12px;
            opacity: 0.8;
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
          }
          
          .hazard-card:hover {
            transform: translateY(-2px);
            border-color: rgba(59, 130, 246, 0.6);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
          }
          
          .hazard-name {
            font-weight: bold;
            font-size: 16px;
          }
          
          .risk-level {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .risk-critical {
            background: linear-gradient(135deg, #dc2626, #991b1b);
            color: white;
          }
          
          .risk-high {
            background: linear-gradient(135deg, #ea580c, #c2410c);
            color: white;
          }
          
          .risk-medium {
            background: linear-gradient(135deg, #d97706, #92400e);
            color: white;
          }
          
          .risk-low {
            background: linear-gradient(135deg, #16a34a, #15803d);
            color: white;
          }
          
          .hazard-description {
            font-size: 13px;
            opacity: 0.9;
            line-height: 1.4;
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
          
          .control-item.selected {
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
            
            .search-controls {
              flex-direction: column;
              gap: 10px;
            }
            
            .search-input {
              min-width: auto;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            
            .hazards-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .standards-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
          }
          
          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }
            
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
        {/* Header avec statistiques */}
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

        {/* Contrôles de recherche et filtrage */}
        <div className="search-controls">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                opacity: 0.6 
              }} 
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">{t.allCategories}</option>
            {Object.entries(t.hazardCategories).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="filter-select"
          >
            <option value="">{t.allRisks}</option>
            <option value="critical">{t.riskLevels.critical}</option>
            <option value="high">{t.riskLevels.high}</option>
            <option value="medium">{t.riskLevels.medium}</option>
            <option value="low">{t.riskLevels.low}</option>
          </select>
        </div>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#f59e0b' }}>
              {filteredHazards.length}
            </div>
            <div className="stat-label">{t.stats.totalHazards}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#dc2626' }}>
              {filteredHazards.filter(h => h.riskLevel === 'critical').length}
            </div>
            <div className="stat-label">{t.stats.criticalHazards}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#3b82f6' }}>
              {selectedHazards.length}
            </div>
            <div className="stat-label">{t.stats.selectedHazards}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#16a34a' }}>
              {Math.round(implementationRate)}%
            </div>
            <div className="stat-label">{t.stats.implementationRate}</div>
          </div>
        </div>

        {/* Grille des dangers */}
        {filteredHazards.length > 0 ? (
          <div className="hazards-grid">
            {filteredHazards.map((hazard) => {
              const isSelected = selectedHazards.includes(hazard.id);
              
              return (
                <div 
                  key={hazard.id}
                  className="hazard-card"
                  style={{
                    borderColor: isSelected 
                      ? '#3b82f6' 
                      : 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {/* Header du danger */}
                  <div className="hazard-header">
                    <div className="hazard-title">
                      {getCategoryIcon(hazard.category)}
                      <span className="hazard-name">{hazard.name}</span>
                      <span className={`risk-level risk-${hazard.riskLevel}`}>
                        {t.riskLevels[hazard.riskLevel]}
                      </span>
                    </div>
                    <p className="hazard-description">
                      {hazard.description}
                    </p>
                  </div>

                  {/* Section des contrôles */}
                  <div className="controls-section">
                    <div className="controls-title">
                      <Shield size={16} color="#3b82f6" />
                      <span>{t.controlMeasures}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        opacity: 0.7,
                        marginLeft: 'auto'
                      }}>
                        {getSelectedControlsCount(hazard.id)}/{hazard.controls.length}
                      </span>
                    </div>
                    
                    <div className="controls-grid">
                      {hazard.controls.map((control) => {
                        const isControlSelected = isControlImplemented(hazard.id, control.id);
                        
                        return (
                          <div
                            key={control.id}
                            className={`control-item ${isControlSelected ? 'selected' : ''}`}
                            onClick={() => toggleControl(hazard.id, control.id)}
                          >
                            <div className="control-info">
                              <div className="control-name">{control.name}</div>
                              <div className="control-description">{control.description}</div>
                            </div>
                            <div className={`control-checkbox ${isControlSelected ? 'checked' : ''}`}>
                              {isControlSelected && <CheckCircle size={12} color="white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
      </div>
    </>
  );
};

export default Step3Hazards;
