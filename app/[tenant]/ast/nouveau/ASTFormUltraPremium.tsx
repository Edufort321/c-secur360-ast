// =================== AST SECTION 1/6 - IMPORTS & INTERFACES ===================
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Shield, 
  Zap, 
  Settings, 
  Users, 
  Camera, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Eye, 
  Lock, 
  Unlock,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Zap as Lightning,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  Copy,
  Share2,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Star,
  Heart,
  Bookmark,
  Flag,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

// =================== INTERFACES TYPESCRIPT ===================

interface ASTFormProps {
  tenant?: string | {
    id: string;
    subdomain: string;
    companyName: string;
  };
}

interface WorkType {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  baseHazards: string[];
}

interface Hazard {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost_certain';
  riskLevel: number;
  description: string;
  consequences: string[];
  workTypes: string[];
  tags: string[];
}

interface ControlMeasure {
  id: string;
  hazardId: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  priority: number;
  measure: string;
  description: string;
  implementation: string;
  responsible: string;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  effectiveness: number;
  compliance: string[];
}

interface SafetyEquipment {
  id: string;
  name: string;
  category: string;
  mandatory: boolean;
  workTypes: string[];
  description: string;
  certifications: string[];
  inspectionFrequency: string;
  lifespan: string;
  cost: string;
  supplier: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  certifications: string[];
  experience: number;
  email: string;
  phone: string;
  emergencyContact: string;
  medicalRestrictions: string[];
  lastTraining: string;
  signature?: string;
  signatureTimestamp?: string;
  consultationStatus: 'pending' | 'consulted' | 'approved' | 'rejected';
  comments: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  conditions: string;
  warnings: string[];
  impact: 'low' | 'medium' | 'high';
}

interface ASTData {
  id: string;
  projectInfo: {
    name: string;
    location: string;
    client: string;
    contractor: string;
    supervisor: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    permits: string[];
    workType: WorkType;
    description: string;
    coordinates: { lat: number; lng: number };
    weather: WeatherData;
    emergencyContacts: Array<{
      name: string;
      role: string;
      phone: string;
      email: string;
    }>;
  };
  hazards: Array<{
    hazard: Hazard;
    identified: boolean;
    riskLevel: number;
    controlMeasures: ControlMeasure[];
    residualRisk: number;
    comments: string;
    photos: string[];
  }>;
  team: Employee[];
  equipment: Array<{
    equipment: SafetyEquipment;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    inspected: boolean;
    inspectionDate: string;
    inspector: string;
    comments: string;
  }>;
  signatures: Array<{
    employeeId: string;
    role: 'worker' | 'supervisor' | 'safety_officer' | 'client_rep';
    signature: string;
    timestamp: string;
    ipAddress: string;
    location: { lat: number; lng: number };
    device: string;
    consented: boolean;
  }>;
  status: 'draft' | 'review' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  auditTrail: Array<{
    timestamp: string;
    userId: string;
    action: string;
    details: string;
    ipAddress: string;
    location: { lat: number; lng: number };
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    language: 'fr' | 'en';
    timezone: string;
    compliance: {
      csa: boolean;
      ohsa: boolean;
      iso45001: boolean;
      client: boolean;
    };
    documentNumber: string;
    revisionNumber: number;
    approvals: Array<{
      role: string;
      name: string;
      signature: string;
      timestamp: string;
    }>;
  };
}
// =================== AST SECTION 2/6 - LOGO & TYPES DE TRAVAUX ===================

// Logo SVG Sécur360
const SECUR360_LOGO = `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="30" cy="30" r="20" fill="url(#logoGradient)" stroke="#ffffff" stroke-width="2"/>
  <path d="M20 30 L26 36 L40 22" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="65" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1e40af">Sécur</text>
  <text x="65" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#3b82f6">360</text>
  <text x="130" y="20" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">Analyse Sécuritaire</text>
  <text x="130" y="35" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">du Travail</text>
</svg>`;

// Types de travaux prédéfinis avec catégories
const WORK_TYPES: WorkType[] = [
  // ÉLECTRICITÉ
  {
    id: 'electrical_maintenance',
    name: 'Maintenance électrique',
    icon: '⚡',
    category: 'Électricité',
    description: 'Travaux de maintenance sur installations électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'burns', 'falls']
  },
  {
    id: 'electrical_installation',
    name: 'Installation électrique',
    icon: '🔌',
    category: 'Électricité',
    description: 'Installation de nouveaux équipements électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'cuts_lacerations', 'falls']
  },
  {
    id: 'electrical_inspection',
    name: 'Inspection électrique',
    icon: '🔍',
    category: 'Électricité',
    description: 'Inspection et tests d\'équipements électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'confined_spaces']
  },

  // GAZ ET PIPELINE
  {
    id: 'gas_maintenance',
    name: 'Maintenance gazière',
    icon: '🔥',
    category: 'Gaz & Pipeline',
    description: 'Maintenance sur réseaux de distribution de gaz',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'toxic_exposure', 'confined_spaces']
  },
  {
    id: 'pipeline_inspection',
    name: 'Inspection pipeline',
    icon: '🚰',
    category: 'Gaz & Pipeline',
    description: 'Inspection et contrôle de pipelines',
    baseHazards: ['gas_leak', 'explosion', 'confined_spaces', 'toxic_exposure']
  },
  {
    id: 'gas_installation',
    name: 'Installation gazière',
    icon: '⛽',
    category: 'Gaz & Pipeline',
    description: 'Installation de nouveaux équipements gaziers',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'excavation', 'heavy_equipment']
  },

  // CONSTRUCTION
  {
    id: 'construction_general',
    name: 'Construction générale',
    icon: '🏗️',
    category: 'Construction',
    description: 'Travaux de construction et rénovation',
    baseHazards: ['falls', 'struck_by_objects', 'cuts_lacerations', 'heavy_equipment', 'noise']
  },
  {
    id: 'excavation',
    name: 'Excavation',
    icon: '⛏️',
    category: 'Construction',
    description: 'Travaux d\'excavation et terrassement',
    baseHazards: ['cave_in', 'struck_by_objects', 'heavy_equipment', 'underground_utilities', 'falls']
  },
  {
    id: 'roofing',
    name: 'Couverture',
    icon: '🏠',
    category: 'Construction',
    description: 'Travaux de toiture et couverture',
    baseHazards: ['falls', 'weather_exposure', 'heat_stress', 'cuts_lacerations']
  },

  // INDUSTRIEL
  {
    id: 'industrial_maintenance',
    name: 'Maintenance industrielle',
    icon: '⚙️',
    category: 'Industriel',
    description: 'Maintenance d\'équipements industriels',
    baseHazards: ['mechanical_hazards', 'chemical_exposure', 'noise', 'heat_stress', 'lockout_tagout']
  },
  {
    id: 'welding',
    name: 'Soudage',
    icon: '🔥',
    category: 'Industriel',
    description: 'Travaux de soudage et découpage',
    baseHazards: ['burns', 'fire', 'toxic_fumes', 'radiation', 'electrical_shock']
  },
  {
    id: 'confined_space_entry',
    name: 'Espaces confinés',
    icon: '🕳️',
    category: 'Industriel',
    description: 'Travaux en espaces confinés',
    baseHazards: ['confined_spaces', 'toxic_exposure', 'oxygen_deficiency', 'engulfment']
  },

  // TRANSPORT
  {
    id: 'road_work',
    name: 'Travaux routiers',
    icon: '🚧',
    category: 'Transport',
    description: 'Travaux sur voies de circulation',
    baseHazards: ['vehicle_traffic', 'struck_by_objects', 'weather_exposure', 'noise']
  },
  {
    id: 'railway_maintenance',
    name: 'Maintenance ferroviaire',
    icon: '🚂',
    category: 'Transport',
    description: 'Maintenance d\'infrastructures ferroviaires',
    baseHazards: ['train_traffic', 'electrical_shock', 'noise', 'vibration', 'weather_exposure']
  },

  // ENVIRONNEMENT
  {
    id: 'environmental_cleanup',
    name: 'Décontamination',
    icon: '♻️',
    category: 'Environnement',
    description: 'Travaux de décontamination environnementale',
    baseHazards: ['chemical_exposure', 'biological_hazards', 'toxic_exposure', 'respiratory']
  },
  {
    id: 'tree_work',
    name: 'Élagage',
    icon: '🌳',
    category: 'Environnement',
    description: 'Travaux d\'élagage et abattage',
    baseHazards: ['falls', 'cuts_lacerations', 'struck_by_objects', 'electrical_lines']
  },

  // TÉLÉCOMMUNICATIONS
  {
    id: 'telecom_installation',
    name: 'Installation télécom',
    icon: '📡',
    category: 'Télécommunications',
    description: 'Installation d\'équipements de télécommunication',
    baseHazards: ['falls', 'electrical_shock', 'radio_frequency', 'weather_exposure']
  },
  {
    id: 'fiber_optic',
    name: 'Fibre optique',
    icon: '💡',
    category: 'Télécommunications',
    description: 'Installation et maintenance de fibre optique',
    baseHazards: ['laser_radiation', 'cuts_lacerations', 'confined_spaces', 'falls']
  },

  // URGENCE
  {
    id: 'emergency_response',
    name: 'Intervention d\'urgence',
    icon: '🚨',
    category: 'Urgence',
    description: 'Interventions d\'urgence et réparations critiques',
    baseHazards: ['time_pressure', 'weather_exposure', 'unknown_hazards', 'stress']
  },
  {
    id: 'storm_restoration',
    name: 'Restauration tempête',
    icon: '⛈️',
    category: 'Urgence',
    description: 'Restauration après événements météorologiques',
    baseHazards: ['weather_exposure', 'electrical_shock', 'falls', 'debris', 'fatigue']
  }
];

// Configuration clients spécifiques
const CLIENT_CONFIGURATIONS = {
  'hydro-quebec': {
    logo: '⚡ Hydro-Québec',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    requiredFields: ['permit_number', 'safety_officer', 'emergency_contacts'],
    customHazards: ['electrical_specific', 'high_voltage', 'substations'],
    templates: ['electrical_maintenance', 'emergency_response', 'storm_restoration']
  },
  'energir': {
    logo: '🔥 Énergir',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    requiredFields: ['gas_permit', 'excavation_permit', 'pipeline_clearance'],
    customHazards: ['gas_specific', 'pipeline_integrity', 'odorization'],
    templates: ['gas_maintenance', 'pipeline_inspection', 'gas_installation']
  },
  'bell': {
    logo: '📡 Bell Canada',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    requiredFields: ['telecom_permit', 'fiber_clearance', 'rf_safety'],
    customHazards: ['rf_radiation', 'fiber_safety', 'tower_climbing'],
    templates: ['telecom_installation', 'fiber_optic']
  },
  'rogers': {
    logo: '📱 Rogers',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    requiredFields: ['telecom_permit', 'antenna_clearance', 'rf_compliance'],
    customHazards: ['rf_radiation', 'antenna_work', 'microwave_links'],
    templates: ['telecom_installation', 'telecom_maintenance']
  }
};

// Filtres prédéfinis pour hazards
const HAZARD_FILTERS = {
  bySeverity: {
    low: { color: '#10b981', label: 'Faible' },
    medium: { color: '#f59e0b', label: 'Moyen' },
    high: { color: '#ef4444', label: 'Élevé' },
    critical: { color: '#7c2d12', label: 'Critique' }
  },
  byCategory: {
    physical: { icon: '⚡', label: 'Physique', color: '#3b82f6' },
    chemical: { icon: '🧪', label: 'Chimique', color: '#8b5cf6' },
    biological: { icon: '🦠', label: 'Biologique', color: '#10b981' },
    ergonomic: { icon: '🏃', label: 'Ergonomique', color: '#f59e0b' },
    psychosocial: { icon: '🧠', label: 'Psychosocial', color: '#ef4444' },
    environmental: { icon: '🌍', label: 'Environnemental', color: '#06b6d4' }
  },
  byWorkType: WORK_TYPES.reduce((acc, workType) => {
    acc[workType.id] = {
      label: workType.name,
      icon: workType.icon,
      category: workType.category
    };
    return acc;
  }, {} as Record<string, any>)
};
// =================== AST SECTION 3/6 - BASE DE DONNÉES MESURES DE CONTRÔLE ===================

// Base de données complète des mesures de contrôle selon hiérarchie CSA
const predefinedControlMeasures: Record<string, ControlMeasure[]> = {
  // DANGERS ÉLECTRIQUES
  electrical_shock: [
    {
      id: 'elec_001',
      hazardId: 'electrical_shock',
      type: 'elimination',
      priority: 1,
      measure: 'Consignation électrique complète',
      description: 'Mise hors tension, verrouillage et étiquetage selon CSA Z462',
      implementation: 'Procédure LOTO avec vérification absence de tension',
      responsible: 'Électricien qualifié',
      timeline: 'Avant début travaux',
      cost: 'low',
      effectiveness: 95,
      compliance: ['CSA Z462', 'Code électrique canadien', 'RSST Article 185']
    },
    {
      id: 'elec_002',
      hazardId: 'electrical_shock',
      type: 'engineering',
      priority: 2,
      measure: 'Protection par disjoncteur différentiel',
      description: 'Installation de DDFT/GFCI sur tous les circuits',
      implementation: 'DDFT de classe A (5mA) pour protection personnelle',
      responsible: 'Électricien qualifié',
      timeline: 'Installation permanente',
      cost: 'medium',
      effectiveness: 85,
      compliance: ['Code électrique canadien Section 26', 'CSA C22.1']
    },
    {
      id: 'elec_003',
      hazardId: 'electrical_shock',
      type: 'ppe',
      priority: 3,
      measure: 'Équipement de protection individuelle',
      description: 'Gants isolants, chaussures diélectriques, casque classe E',
      implementation: 'Sélection selon tension et conditions de travail',
      responsible: 'Travailleur qualifié',
      timeline: 'Port obligatoire',
      cost: 'medium',
      effectiveness: 70,
      compliance: ['CSA Z462 Annexe H', 'CSA Z94.4', 'RSST Article 2.10.12']
    }
  ],

  arc_flash: [
    {
      id: 'arc_001',
      hazardId: 'arc_flash',
      type: 'elimination',
      priority: 1,
      measure: 'Travail hors tension',
      description: 'Élimination complète du risque par mise hors tension',
      implementation: 'Consignation selon CSA Z462 avec vérification',
      responsible: 'Personne qualifiée',
      timeline: 'Obligatoire si possible',
      cost: 'low',
      effectiveness: 100,
      compliance: ['CSA Z462 Clause 4.1', 'RSST Article 185']
    },
    {
      id: 'arc_002',
      hazardId: 'arc_flash',
      type: 'administrative',
      priority: 2,
      measure: 'Analyse des dangers d\'arc électrique',
      description: 'Étude d\'arc avec calcul des frontières de protection',
      implementation: 'Analyse par ingénieur selon IEEE 1584',
      responsible: 'Ingénieur électrique',
      timeline: 'Avant travaux sous tension',
      cost: 'high',
      effectiveness: 85,
      compliance: ['CSA Z462 Clause 4.2', 'IEEE 1584']
    },
    {
      id: 'arc_003',
      hazardId: 'arc_flash',
      type: 'ppe',
      priority: 3,
      measure: 'Vêtements résistants à l\'arc',
      description: 'EPI avec indice d\'arc approprié (cal/cm²)',
      implementation: 'Sélection selon étude d\'arc et catégorie EPI',
      responsible: 'Travailleur qualifié',
      timeline: 'Port obligatoire',
      cost: 'high',
      effectiveness: 80,
      compliance: ['CSA Z462 Annexe H', 'ASTM F1506', 'CSA Z94.4']
    }
  ],

  // DANGERS GAZIERS
  gas_leak: [
    {
      id: 'gas_001',
      hazardId: 'gas_leak',
      type: 'elimination',
      priority: 1,
      measure: 'Purge et isolation du système',
      description: 'Vidange complète et isolation des canalisations',
      implementation: 'Procédure de purge avec gaz inerte (azote)',
      responsible: 'Technicien gazier qualifié',
      timeline: 'Avant début travaux',
      cost: 'medium',
      effectiveness: 95,
      compliance: ['CSA Z662', 'Règlement sur la sécurité des pipelines']
    },
    {
      id: 'gas_002',
      hazardId: 'gas_leak',
      type: 'engineering',
      priority: 2,
      measure: 'Détection de gaz continue',
      description: 'Système de détection multi-gaz avec alarmes',
      implementation: 'Détecteurs fixes et portables avec seuils LIE',
      responsible: 'Technicien instrumentation',
      timeline: 'Surveillance continue',
      cost: 'high',
      effectiveness: 90,
      compliance: ['CSA Z662 Clause 10', 'CSA Z1611']
    },
    {
      id: 'gas_003',
      hazardId: 'gas_leak',
      type: 'administrative',
      priority: 3,
      measure: 'Permis de travail à chaud',
      description: 'Autorisation formelle pour travaux avec sources d\'ignition',
      implementation: 'Évaluation des risques et mesures préventives',
      responsible: 'Superviseur qualifié',
      timeline: 'Avant travaux à chaud',
      cost: 'low',
      effectiveness: 80,
      compliance: ['CSA Z662', 'Code de prévention incendie CNPI']
    }
  ],

  explosion: [
    {
      id: 'exp_001',
      hazardId: 'explosion',
      type: 'elimination',
      priority: 1,
      measure: 'Élimination des sources d\'ignition',
      description: 'Suppression de toutes sources d\'ignition dans la zone',
      implementation: 'Contrôle électricité statique, téléphones, véhicules',
      responsible: 'Responsable sécurité',
      timeline: 'Établissement zone de sécurité',
      cost: 'medium',
      effectiveness: 95,
      compliance: ['CSA Z662', 'Code électrique Section 18']
    },
    {
      id: 'exp_002',
      hazardId: 'explosion',
      type: 'engineering',
      priority: 2,
      measure: 'Ventilation forcée',
      description: 'Système de ventilation pour disperser les gaz',
      implementation: 'Ventilateurs antidéflagrants avec débits calculés',
      responsible: 'Ingénieur ventilation',
      timeline: 'Fonctionnement continu',
      cost: 'high',
      effectiveness: 85,
      compliance: ['CSA Z662', 'NFPA 497']
    },
    {
      id: 'exp_003',
      hazardId: 'explosion',
      type: 'administrative',
      priority: 3,
      measure: 'Zone de sécurité périmétrique',
      description: 'Établissement périmètre de sécurité avec accès contrôlé',
      implementation: 'Calcul distances sécuritaires selon type de gaz',
      responsible: 'Responsable chantier',
      timeline: 'Maintien permanent',
      cost: 'low',
      effectiveness: 75,
      compliance: ['CSA Z662 Clause 4.2.3', 'Code de prévention incendie']
    }
  ],

  // DANGERS PHYSIQUES
  falls: [
    {
      id: 'fall_001',
      hazardId: 'falls',
      type: 'elimination',
      priority: 1,
      measure: 'Travail au sol ou plateforme permanente',
      description: 'Élimination du travail en hauteur par conception',
      implementation: 'Réorganisation méthodes de travail, équipements mobiles',
      responsible: 'Planificateur travaux',
      timeline: 'Phase conception',
      cost: 'medium',
      effectiveness: 100,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16']
    },
    {
      id: 'fall_002',
      hazardId: 'falls',
      type: 'engineering',
      priority: 2,
      measure: 'Garde-corps et protection collective',
      description: 'Installation garde-corps conformes ou filets de sécurité',
      implementation: 'Garde-corps h=1070mm avec main courante et plinthe',
      responsible: 'Installateur certifié',
      timeline: 'Avant accès en hauteur',
      cost: 'medium',
      effectiveness: 90,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16', 'Code de construction']
    },
    {
      id: 'fall_003',
      hazardId: 'falls',
      type: 'ppe',
      priority: 3,
      measure: 'Système d\'arrêt de chute',
      description: 'Harnais avec longe et point d\'ancrage certifié',
      implementation: 'Harnais intégral avec longe absorption énergie',
      responsible: 'Travailleur formé',
      timeline: 'Port obligatoire >3m',
      cost: 'medium',
      effectiveness: 75,
      compliance: ['RSST Article 2.10.15', 'CSA Z259 série', 'ANSI Z359']
    }
  ],

  confined_spaces: [
    {
      id: 'conf_001',
      hazardId: 'confined_spaces',
      type: 'elimination',
      priority: 1,
      measure: 'Travail à l\'extérieur de l\'espace',
      description: 'Modification méthodes pour éviter l\'entrée',
      implementation: 'Équipements à distance, ouvertures, robots',
      responsible: 'Ingénieur méthodes',
      timeline: 'Phase planification',
      cost: 'high',
      effectiveness: 100,
      compliance: ['RSST Article 3.9', 'CSA Z1006']
    },
    {
      id: 'conf_002',
      hazardId: 'confined_spaces',
      type: 'engineering',
      priority: 2,
      measure: 'Ventilation mécanique forcée',
      description: 'Système ventilation avec surveillance continue',
      implementation: 'Ventilation extraction/soufflage avec débits calculés',
      responsible: 'Technicien ventilation',
      timeline: 'Fonctionnement continu',
      cost: 'high',
      effectiveness: 85,
      compliance: ['RSST Article 3.9.5', 'CSA Z1006']
    },
    {
      id: 'conf_003',
      hazardId: 'confined_spaces',
      type: 'administrative',
      priority: 3,
      measure: 'Permis d\'entrée en espace confiné',
      description: 'Procédure formelle avec surveillant et équipe secours',
      implementation: 'Évaluation atmosphère, plan secours, communication',
      responsible: 'Personne compétente',
      timeline: 'Avant chaque entrée',
      cost: 'medium',
      effectiveness: 80,
      compliance: ['RSST Article 3.9', 'CSA Z1006', 'Norme CSA Z1620']
    }
  ],

  // DANGERS MÉCANIQUES
  mechanical_hazards: [
    {
      id: 'mech_001',
      hazardId: 'mechanical_hazards',
      type: 'elimination',
      priority: 1,
      measure: 'Conception sécuritaire intrinsèque',
      description: 'Élimination dangers par conception équipement',
      implementation: 'Équipements sans pièces mobiles exposées',
      responsible: 'Concepteur équipement',
      timeline: 'Phase conception',
      cost: 'high',
      effectiveness: 100,
      compliance: ['CSA Z432', 'Directive machines 2006/42/CE']
    },
    {
      id: 'mech_002',
      hazardId: 'mechanical_hazards',
      type: 'engineering',
      priority: 2,
      measure: 'Protecteurs et dispositifs de sécurité',
      description: 'Installation protecteurs fixes et mobiles',
      implementation: 'Protecteurs verrouillés avec dispositifs de coupure',
      responsible: 'Technicien sécurité machine',
      timeline: 'Installation permanente',
      cost: 'medium',
      effectiveness: 90,
      compliance: ['CSA Z432', 'RSST Article 173 à 186']
    },
    {
      id: 'mech_003',
      hazardId: 'mechanical_hazards',
      type: 'administrative',
      priority: 3,
      measure: 'Cadenassage énergies dangereuses',
      description: 'Procédure LOTO pour toutes énergies',
      implementation: 'Consignation électrique, pneumatique, hydraulique',
      responsible: 'Personne autorisée',
      timeline: 'Avant maintenance',
      cost: 'low',
      effectiveness: 85,
      compliance: ['CSA Z460', 'RSST Article 185.1']
    }
  ],

  // DANGERS CHIMIQUES
  chemical_exposure: [
    {
      id: 'chem_001',
      hazardId: 'chemical_exposure',
      type: 'substitution',
      priority: 1,
      measure: 'Remplacement par produit moins dangereux',
      description: 'Substitution par produits moins toxiques',
      implementation: 'Analyse comparative risques et performances',
      responsible: 'Hygiéniste industriel',
      timeline: 'Phase sélection produits',
      cost: 'medium',
      effectiveness: 95,
      compliance: ['SIMDUT 2015', 'RSST Article 62.5']
    },
    {
      id: 'chem_002',
      hazardId: 'chemical_exposure',
      type: 'engineering',
      priority: 2,
      measure: 'Ventilation par aspiration localisée',
      description: 'Système captage à la source avec épuration',
      implementation: 'Hottes, bras aspirants avec débits selon contaminant',
      responsible: 'Ingénieur ventilation',
      timeline: 'Installation permanente',
      cost: 'high',
      effectiveness: 85,
      compliance: ['RSST Article 44', 'ACGIH Industrial Ventilation']
    },
    {
      id: 'chem_003',
      hazardId: 'chemical_exposure',
      type: 'ppe',
      priority: 3,
      measure: 'Protection respiratoire adaptée',
      description: 'Équipement protection respiratoire selon contaminant',
      implementation: 'Sélection selon facteur protection requis',
      responsible: 'Travailleur formé',
      timeline: 'Port selon exposition',
      cost: 'medium',
      effectiveness: 70,
      compliance: ['CSA Z94.4', 'RSST Article 45']
    }
  ],

  // DANGERS BIOLOGIQUES
  biological_hazards: [
    {
      id: 'bio_001',
      hazardId: 'biological_hazards',
      type: 'elimination',
      priority: 1,
      measure: 'Stérilisation ou décontamination',
      description: 'Élimination agents biologiques par traitement',
      implementation: 'Procédés physiques, chimiques ou biologiques',
      responsible: 'Spécialiste décontamination',
      timeline: 'Avant exposition',
      cost: 'high',
      effectiveness: 95,
      compliance: ['RSST Article 62 à 70', 'Guide INSPQ']
    },
    {
      id: 'bio_002',
      hazardId: 'biological_hazards',
      type: 'engineering',
      priority: 2,
      measure: 'Confinement et ventilation',
      description: 'Système confinement avec pression négative',
      implementation: 'Sas, ventilation HEPA, gradients pression',
      responsible: 'Ingénieur biosécurité',
      timeline: 'Installation permanente',
      cost: 'high',
      effectiveness: 85,
      compliance: ['Loi sur la santé publique', 'Guide laboratoires ASPC']
    },
    {
      id: 'bio_003',
      hazardId: 'biological_hazards',
      type: 'administrative',
      priority: 3,
      measure: 'Vaccination et surveillance médicale',
      description: 'Programme immunisation et suivi santé',
      implementation: 'Vaccination préventive, examens périodiques',
      responsible: 'Médecin du travail',
      timeline: 'Selon programme',
      cost: 'medium',
      effectiveness: 80,
      compliance: ['Loi sur la santé publique', 'Guide INSPQ']
    }
  ],

  // DANGERS ERGONOMIQUES
  ergonomic_hazards: [
    {
      id: 'ergo_001',
      hazardId: 'ergonomic_hazards',
      type: 'elimination',
      priority: 1,
      measure: 'Mécanisation des tâches',
      description: 'Automatisation manutention et tâches répétitives',
      implementation: 'Équipements de manutention, robots, convoyeurs',
      responsible: 'Ingénieur méthodes',
      timeline: 'Phase conception',
      cost: 'high',
      effectiveness: 95,
      compliance: ['RSST Article 166 à 168', 'CSA Z412']
    },
    {
      id: 'ergo_002',
      hazardId: 'ergonomic_hazards',
      type: 'engineering',
      priority: 2,
      measure: 'Aide mécanique à la manutention',
      description: 'Équipements assistance manutention manuelle',
      implementation: 'Palans, transpalettes, exosquelettes',
      responsible: 'Responsable équipements',
      timeline: 'Mise à disposition',
      cost: 'medium',
      effectiveness: 80,
      compliance: ['RSST Article 166', 'CSA Z412']
    },
    {
      id: 'ergo_003',
      hazardId: 'ergonomic_hazards',
      type: 'administrative',
      priority: 3,
      measure: 'Rotation des postes et pauses',
      description: 'Organisation travail pour réduire contraintes',
      implementation: 'Planning rotation, pauses actives, étirements',
      responsible: 'Superviseur',
      timeline: 'Organisation quotidienne',
      cost: 'low',
      effectiveness: 65,
      compliance: ['RSST Article 51', 'Guide IRSST']
    }
  ],

  // DANGERS ENVIRONNEMENTAUX
  weather_exposure: [
    {
      id: 'weather_001',
      hazardId: 'weather_exposure',
      type: 'elimination',
      priority: 1,
      measure: 'Travail en environnement contrôlé',
      description: 'Déplacement activités vers environnement protégé',
      implementation: 'Ateliers, hangars, abris temporaires',
      responsible: 'Planificateur travaux',
      timeline: 'Réorganisation activités',
      cost: 'high',
      effectiveness: 100,
      compliance: ['RSST Article 53', 'Code de construction']
    },
    {
      id: 'weather_002',
      hazardId: 'weather_exposure',
      type: 'administrative',
      priority: 2,
      measure: 'Surveillance météorologique',
      description: 'Système alerte et arrêt travaux selon conditions',
      implementation: 'Stations météo, seuils d\'arrêt, procédures',
      responsible: 'Responsable sécurité',
      timeline: 'Surveillance continue',
      cost: 'medium',
      effectiveness: 85,
      compliance: ['RSST Article 53', 'Guide Environnement Canada']
    },
    {
      id: 'weather_003',
      hazardId: 'weather_exposure',
      type: 'ppe',
      priority: 3,
      measure: 'Vêtements de protection climatique',
      description: 'EPI adapté aux conditions météorologiques',
      implementation: 'Couches multiples, imperméables, respirants',
      responsible: 'Travailleur',
      timeline: 'Port selon conditions',
      cost: 'medium',
      effectiveness: 70,
      compliance: ['CSA Z94.4', 'RSST Article 2.10.12']
    }
  ],

  heat_stress: [
    {
      id: 'heat_001',
      hazardId: 'heat_stress',
      type: 'elimination',
      priority: 1,
      measure: 'Travail aux heures fraîches',
      description: 'Planification travaux aux périodes moins chaudes',
      implementation: 'Horaires matinaux ou soirées, arrêt heures chaudes',
      responsible: 'Planificateur',
      timeline: 'Ajustement horaires',
      cost: 'low',
      effectiveness: 90,
      compliance: ['RSST Article 53', 'Guide IRSST contrainte thermique']
    },
    {
      id: 'heat_002',
      hazardId: 'heat_stress',
      type: 'engineering',
      priority: 2,
      measure: 'Refroidissement localisé',
      description: 'Systèmes refroidissement zones de travail',
      implementation: 'Ventilateurs, brumisateurs, climatisation mobile',
      responsible: 'Technicien climatisation',
      timeline: 'Installation temporaire',
      cost: 'medium',
      effectiveness: 80,
      compliance: ['RSST Article 53', 'ACGIH TLV Heat Stress']
    },
    {
      id: 'heat_003',
      hazardId: 'heat_stress',
      type: 'administrative',
      priority: 3,
      measure: 'Régime travail-repos',
      description: 'Pauses fréquentes avec hydratation',
      implementation: 'Cycles 15min travail/15min repos selon WBGT',
      responsible: 'Superviseur',
      timeline: 'Application continue',
      cost: 'low',
      effectiveness: 75,
      compliance: ['RSST Article 53', 'ACGIH TLV Heat Stress']
    }
  ]
};
// =================== AST SECTION 4/6 - LISTE EXHAUSTIVE DES DANGERS ===================

// Base de données complète des 39 dangers tous secteurs
const predefinedHazards: Hazard[] = [
  // DANGERS ÉLECTRIQUES (1-5)
  {
    id: 'electrical_shock',
    name: 'Choc électrique',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Contact direct ou indirect avec parties sous tension',
    consequences: ['Électrisation', 'Électrocution', 'Fibrillation cardiaque', 'Brûlures internes', 'Chute secondaire'],
    workTypes: ['electrical_maintenance', 'electrical_installation', 'electrical_inspection', 'industrial_maintenance'],
    tags: ['électricité', 'contact', 'tension', 'courant']
  },
  {
    id: 'arc_flash',
    name: 'Arc électrique',
    category: 'physical',
    severity: 'critical',
    probability: 'unlikely',
    riskLevel: 12,
    description: 'Décharge électrique dans l\'air entre conducteurs',
    consequences: ['Brûlures graves', 'Lésions oculaires', 'Perte auditive', 'Projection objets', 'Incendie'],
    workTypes: ['electrical_maintenance', 'electrical_installation', 'industrial_maintenance'],
    tags: ['arc', 'décharge', 'brûlures', 'explosion']
  },
  {
    id: 'electrical_burns',
    name: 'Brûlures électriques',
    category: 'physical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Brûlures causées par passage courant ou arc électrique',
    consequences: ['Brûlures superficielles', 'Brûlures profondes', 'Nécroses', 'Infections', 'Cicatrices'],
    workTypes: ['electrical_maintenance', 'electrical_installation', 'welding'],
    tags: ['brûlures', 'courant', 'chaleur', 'peau']
  },
  {
    id: 'electromagnetic_fields',
    name: 'Champs électromagnétiques',
    category: 'physical',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 8,
    description: 'Exposition aux rayonnements électromagnétiques',
    consequences: ['Échauffement tissus', 'Stimulation nerveuse', 'Effets cardiovasculaires', 'Maux de tête'],
    workTypes: ['electrical_maintenance', 'telecom_installation', 'industrial_maintenance'],
    tags: ['rayonnement', 'fréquence', 'exposition', 'santé']
  },
  {
    id: 'static_electricity',
    name: 'Électricité statique',
    category: 'physical',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 8,
    description: 'Accumulation charges électrostatiques',
    consequences: ['Décharge électrostatique', 'Ignition gaz/vapeurs', 'Inconfort', 'Dommages équipements'],
    workTypes: ['gas_maintenance', 'chemical_handling', 'industrial_maintenance'],
    tags: ['statique', 'décharge', 'ignition', 'accumulation']
  },

  // DANGERS GAZIERS ET CHIMIQUES (6-12)
  {
    id: 'gas_leak',
    name: 'Fuite de gaz',
    category: 'chemical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Échappement non contrôlé de gaz combustible ou toxique',
    consequences: ['Explosion', 'Incendie', 'Asphyxie', 'Intoxication', 'Pollution environnementale'],
    workTypes: ['gas_maintenance', 'pipeline_inspection', 'gas_installation'],
    tags: ['fuite', 'gaz', 'combustible', 'toxique']
  },
  {
    id: 'explosion',
    name: 'Explosion',
    category: 'physical',
    severity: 'critical',
    probability: 'unlikely',
    riskLevel: 12,
    description: 'Combustion rapide en espace confiné ou nuage gazeux',
    consequences: ['Traumatismes graves', 'Brûlures', 'Lésions auditives', 'Projections', 'Effondrement'],
    workTypes: ['gas_maintenance', 'welding', 'confined_space_entry', 'chemical_handling'],
    tags: ['explosion', 'déflagration', 'surpression', 'combustion']
  },
  {
    id: 'fire',
    name: 'Incendie',
    category: 'physical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Combustion non contrôlée de matières inflammables',
    consequences: ['Brûlures', 'Intoxication fumées', 'Asphyxie', 'Dommages structures', 'Évacuation urgence'],
    workTypes: ['welding', 'gas_maintenance', 'electrical_maintenance', 'roofing'],
    tags: ['feu', 'combustion', 'fumées', 'chaleur']
  },
  {
    id: 'toxic_exposure',
    name: 'Exposition substances toxiques',
    category: 'chemical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Contact avec substances chimiques dangereuses',
    consequences: ['Empoisonnement aigu', 'Effets chroniques', 'Allergies', 'Cancer', 'Atteintes organes'],
    workTypes: ['chemical_handling', 'environmental_cleanup', 'industrial_maintenance', 'confined_space_entry'],
    tags: ['toxique', 'chimique', 'poison', 'contamination']
  },
  {
    id: 'chemical_burns',
    name: 'Brûlures chimiques',
    category: 'chemical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Lésions cutanées par contact substances corrosives',
    consequences: ['Brûlures acides/bases', 'Nécroses', 'Cicatrices', 'Infections', 'Lésions oculaires'],
    workTypes: ['chemical_handling', 'environmental_cleanup', 'industrial_maintenance'],
    tags: ['corrosif', 'acide', 'base', 'contact']
  },
  {
    id: 'asphyxiation',
    name: 'Asphyxie',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Manque d\'oxygène ou présence gaz inertes',
    consequences: ['Perte conscience', 'Arrêt cardiaque', 'Lésions cérébrales', 'Décès', 'Hypoxie'],
    workTypes: ['confined_space_entry', 'gas_maintenance', 'welding', 'tank_cleaning'],
    tags: ['oxygène', 'suffocation', 'gaz', 'respiration']
  },
  {
    id: 'oxygen_deficiency',
    name: 'Déficience en oxygène',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Concentration oxygène inférieure à 19,5%',
    consequences: ['Hypoxie', 'Étourdissements', 'Perte conscience', 'Arrêt respiratoire', 'Mort'],
    workTypes: ['confined_space_entry', 'tank_cleaning', 'underground_work'],
    tags: ['oxygène', 'concentration', 'respiration', 'déficience']
  },

  // DANGERS PHYSIQUES ET MÉCANIQUES (13-23)
  {
    id: 'falls',
    name: 'Chutes de hauteur',
    category: 'physical',
    severity: 'critical',
    probability: 'likely',
    riskLevel: 20,
    description: 'Chute depuis une surface élevée',
    consequences: ['Fractures', 'Traumatismes crâniens', 'Paralysie', 'Contusions', 'Décès'],
    workTypes: ['roofing', 'electrical_maintenance', 'construction_general', 'tree_work', 'telecom_installation'],
    tags: ['hauteur', 'chute', 'gravité', 'impact']
  },
  {
    id: 'struck_by_objects',
    name: 'Heurt par objets',
    category: 'physical',
    severity: 'high',
    probability: 'likely',
    riskLevel: 16,
    description: 'Impact par objets en mouvement ou qui tombent',
    consequences: ['Contusions', 'Fractures', 'Traumatismes crâniens', 'Coupures', 'Écrasement'],
    workTypes: ['construction_general', 'excavation', 'tree_work', 'industrial_maintenance'],
    tags: ['impact', 'objet', 'projectile', 'chute']
  },
  {
    id: 'cuts_lacerations',
    name: 'Coupures et lacérations',
    category: 'physical',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Blessures par objets tranchants ou coupants',
    consequences: ['Coupures superficielles', 'Lacérations profondes', 'Saignements', 'Infections', 'Cicatrices'],
    workTypes: ['construction_general', 'electrical_installation', 'tree_work', 'fiber_optic'],
    tags: ['tranchant', 'coupant', 'lame', 'blessure']
  },
  {
    id: 'mechanical_hazards',
    name: 'Dangers mécaniques',
    category: 'physical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Risques liés aux machines et équipements mécaniques',
    consequences: ['Écrasement', 'Cisaillement', 'Entraînement', 'Perforation', 'Amputation'],
    workTypes: ['industrial_maintenance', 'construction_general', 'excavation'],
    tags: ['machine', 'mécanique', 'rotation', 'écrasement']
  },
  {
    id: 'heavy_equipment',
    name: 'Équipements lourds',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Risques associés aux véhicules et machines lourdes',
    consequences: ['Écrasement', 'Renversement', 'Collision', 'Happement', 'Projections'],
    workTypes: ['excavation', 'construction_general', 'road_work'],
    tags: ['véhicule', 'machine', 'lourd', 'collision']
  },
  {
    id: 'vehicle_traffic',
    name: 'Circulation véhiculaire',
    category: 'physical',
    severity: 'critical',
    probability: 'likely',
    riskLevel: 20,
    description: 'Risques liés à la proximité de véhicules en circulation',
    consequences: ['Collision piéton-véhicule', 'Écrasement', 'Projections', 'Traumatismes multiples'],
    workTypes: ['road_work', 'electrical_maintenance', 'telecom_installation'],
    tags: ['véhicule', 'circulation', 'route', 'piéton']
  },
  {
    id: 'train_traffic',
    name: 'Circulation ferroviaire',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Risques près des voies ferrées et trains',
    consequences: ['Collision train-piéton', 'Électrocution caténaire', 'Happement', 'Traumatismes graves'],
    workTypes: ['railway_maintenance', 'electrical_maintenance'],
    tags: ['train', 'ferroviaire', 'voie', 'caténaire']
  },
  {
    id: 'cave_in',
    name: 'Effondrement',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Affaissement de sols, tranchées ou structures',
    consequences: ['Ensevelissement', 'Écrasement', 'Asphyxie', 'Fractures multiples', 'Décès'],
    workTypes: ['excavation', 'construction_general', 'underground_work'],
    tags: ['effondrement', 'sol', 'tranchée', 'ensevelissement']
  },
  {
    id: 'underground_utilities',
    name: 'Services souterrains',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Contact accidentel avec services publics enterrés',
    consequences: ['Électrocution', 'Explosion gaz', 'Interruption services', 'Inondation', 'Brûlures'],
    workTypes: ['excavation', 'construction_general', 'gas_installation'],
    tags: ['souterrain', 'électricité', 'gaz', 'eau']
  },
  {
    id: 'engulfment',
    name: 'Engloutissement',
    category: 'physical',
    severity: 'critical',
    probability: 'unlikely',
    riskLevel: 12,
    description: 'Submersion dans matériaux fluides ou granulaires',
    consequences: ['Asphyxie', 'Écrasement', 'Noyade', 'Hypothermie', 'Choc'],
    workTypes: ['confined_space_entry', 'tank_cleaning', 'silo_work'],
    tags: ['engloutissement', 'fluide', 'granulaire', 'submersion']
  },
  {
    id: 'electrical_lines',
    name: 'Lignes électriques',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Proximité ou contact avec lignes électriques aériennes',
    consequences: ['Électrocution', 'Arc électrique', 'Brûlures', 'Chute', 'Incendie'],
    workTypes: ['tree_work', 'construction_general', 'telecom_installation'],
    tags: ['ligne', 'aérien', 'contact', 'proximité']
  },

  // DANGERS BIOLOGIQUES (24-26)
  {
    id: 'biological_hazards',
    name: 'Dangers biologiques',
    category: 'biological',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Exposition à agents biologiques pathogènes',
    consequences: ['Infections', 'Maladies transmissibles', 'Allergies', 'Toxicoses', 'Zoonoses'],
    workTypes: ['environmental_cleanup', 'sewer_work', 'healthcare_work'],
    tags: ['biologique', 'pathogène', 'infection', 'maladie']
  },
  {
    id: 'insect_stings',
    name: 'Piqûres d\'insectes',
    category: 'biological',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Piqûres ou morsures d\'insectes venimeux',
    consequences: ['Réactions allergiques', 'Choc anaphylactique', 'Infections', 'Douleur', 'Enflure'],
    workTypes: ['tree_work', 'construction_general', 'electrical_maintenance'],
    tags: ['insecte', 'piqûre', 'allergie', 'venin']
  },
  {
    id: 'animal_attacks',
    name: 'Attaques d\'animaux',
    category: 'biological',
    severity: 'high',
    probability: 'unlikely',
    riskLevel: 8,
    description: 'Attaques par animaux sauvages ou domestiques',
    consequences: ['Morsures', 'Griffures', 'Infections', 'Rabies', 'Traumatismes'],
    workTypes: ['tree_work', 'environmental_cleanup', 'outdoor_work'],
    tags: ['animal', 'morsure', 'attaque', 'sauvage']
  },

  // DANGERS ERGONOMIQUES (27-29)
  {
    id: 'ergonomic_hazards',
    name: 'Dangers ergonomiques',
    category: 'ergonomic',
    severity: 'medium',
    probability: 'almost_certain',
    riskLevel: 16,
    description: 'Contraintes physiques et posturales',
    consequences: ['TMS', 'Lombalgies', 'Tendinites', 'Fatigue', 'Douleurs chroniques'],
    workTypes: ['industrial_maintenance', 'construction_general', 'electrical_maintenance'],
    tags: ['posture', 'répétitif', 'force', 'manutention']
  },
  {
    id: 'manual_handling',
    name: 'Manutention manuelle',
    category: 'ergonomic',
    severity: 'medium',
    probability: 'almost_certain',
    riskLevel: 16,
    description: 'Soulèvement, transport, manipulation objets lourds',
    consequences: ['Lombalgies', 'Hernies', 'Entorses', 'Claquages', 'TMS'],
    workTypes: ['construction_general', 'industrial_maintenance', 'electrical_installation'],
    tags: ['soulever', 'porter', 'lourd', 'dos']
  },
  {
    id: 'repetitive_motion',
    name: 'Mouvements répétitifs',
    category: 'ergonomic',
    severity: 'medium',
    probability: 'almost_certain',
    riskLevel: 16,
    description: 'Gestes répétés sur périodes prolongées',
    consequences: ['Tendinites', 'Syndrome canal carpien', 'Épicondylite', 'Bursite', 'Fatigue'],
    workTypes: ['industrial_maintenance', 'electrical_installation', 'assembly_work'],
    tags: ['répétitif', 'geste', 'tendon', 'articulation']
  },

  // DANGERS ENVIRONNEMENTAUX (30-35)
  {
    id: 'weather_exposure',
    name: 'Exposition météorologique',
    category: 'environmental',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Exposition conditions météorologiques extrêmes',
    consequences: ['Hypothermie', 'Hyperthermie', 'Engelures', 'Insolation', 'Déshydratation'],
    workTypes: ['construction_general', 'electrical_maintenance', 'road_work', 'tree_work'],
    tags: ['météo', 'température', 'exposition', 'climat']
  },
  {
    id: 'heat_stress',
    name: 'Stress thermique',
    category: 'environmental',
    severity: 'high',
    probability: 'likely',
    riskLevel: 16,
    description: 'Exposition à chaleur excessive',
    consequences: ['Épuisement', 'Coup de chaleur', 'Déshydratation', 'Crampes', 'Syncope'],
    workTypes: ['roofing', 'welding', 'construction_general', 'industrial_maintenance'],
    tags: ['chaleur', 'température', 'déshydratation', 'épuisement']
  },
  {
    id: 'cold_exposure',
    name: 'Exposition au froid',
    category: 'environmental',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Exposition à températures froides extrêmes',
    consequences: ['Hypothermie', 'Engelures', 'Pied de tranchée', 'Raideur articulaire', 'Maladresse'],
    workTypes: ['construction_general', 'electrical_maintenance', 'outdoor_work'],
    tags: ['froid', 'température', 'engelure', 'hypothermie']
  },
  {
    id: 'uv_radiation',
    name: 'Rayonnement UV',
    category: 'environmental',
    severity: 'medium',
    probability: 'almost_certain',
    riskLevel: 16,
    description: 'Exposition rayonnement ultraviolet solaire',
    consequences: ['Coups de soleil', 'Cancer peau', 'Vieillissement prématuré', 'Cataractes', 'Kératoses'],
    workTypes: ['roofing', 'construction_general', 'road_work', 'tree_work'],
    tags: ['UV', 'soleil', 'peau', 'cancer']
  },
  {
    id: 'wind_exposure',
    name: 'Exposition au vent',
    category: 'environmental',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Exposition à vents forts et rafales',
    consequences: ['Déséquilibre', 'Chutes', 'Projections objets', 'Fatigue', 'Refroidissement'],
    workTypes: ['roofing', 'tree_work', 'construction_general', 'telecom_installation'],
    tags: ['vent', 'rafale', 'équilibre', 'projection']
  },
  {
    id: 'precipitation',
    name: 'Précipitations',
    category: 'environmental',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Pluie, neige, grêle affectant sécurité',
    consequences: ['Surfaces glissantes', 'Visibilité réduite', 'Hypothermie', 'Chutes', 'Accidents'],
    workTypes: ['roofing', 'construction_general', 'road_work'],
    tags: ['pluie', 'neige', 'glissant', 'visibilité']
  },

  // DANGERS PHYSIQUES SPÉCIALISÉS (36-39)
  {
    id: 'noise',
    name: 'Bruit excessif',
    category: 'physical',
    severity: 'medium',
    probability: 'almost_certain',
    riskLevel: 16,
    description: 'Exposition à niveaux sonores élevés',
    consequences: ['Perte auditive', 'Acouphènes', 'Fatigue', 'Stress', 'Troubles communication'],
    workTypes: ['construction_general', 'industrial_maintenance', 'excavation', 'railway_maintenance'],
    tags: ['bruit', 'son', 'audition', 'décibel']
  },
  {
    id: 'vibration',
    name: 'Vibrations',
    category: 'physical',
    severity: 'medium',
    probability: 'likely',
    riskLevel: 12,
    description: 'Exposition vibrations corps entier ou main-bras',
    consequences: ['Troubles circulatoires', 'Syndrome vibration', 'Lombalgies', 'Arthrose', 'Engourdissements'],
    workTypes: ['construction_general', 'excavation', 'industrial_maintenance'],
    tags: ['vibration', 'circulation', 'articulation', 'outil']
  },
  {
    id: 'radiation',
    name: 'Rayonnements',
    category: 'physical',
    severity: 'high',
    probability: 'possible',
    riskLevel: 12,
    description: 'Exposition rayonnements ionisants ou non-ionisants',
    consequences: ['Brûlures', 'Cancer', 'Mutations génétiques', 'Stérilité', 'Cataractes'],
    workTypes: ['welding', 'industrial_maintenance', 'medical_work'],
    tags: ['radiation', 'ionisant', 'cancer', 'exposition']
  },
  {
    id: 'lockout_tagout',
    name: 'Énergies dangereuses',
    category: 'physical',
    severity: 'critical',
    probability: 'possible',
    riskLevel: 15,
    description: 'Remise en marche inattendue d\'équipements',
    consequences: ['Écrasement', 'Électrocution', 'Coupures', 'Brûlures', 'Projection'],
    workTypes: ['industrial_maintenance', 'electrical_maintenance', 'mechanical_work'],
    tags: ['énergie', 'cadenassage', 'démarrage', 'maintenance']
  }
];
// =================== AST SECTION 5/6 - ÉQUIPEMENTS DE SÉCURITÉ ET TRADUCTIONS ===================

// Base de données des équipements de sécurité requis
const requiredSafetyEquipment: SafetyEquipment[] = [
  // PROTECTION TÊTE
  {
    id: 'hardhat_class_e',
    name: 'Casque de sécurité Classe E',
    category: 'Protection tête',
    mandatory: true,
    workTypes: ['electrical_maintenance', 'electrical_installation', 'construction_general'],
    description: 'Casque isolant électrique jusqu\'à 20 000V',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe E'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
    cost: '50-150 CAD',
    supplier: 'MSA, 3M, Honeywell'
  },
  {
    id: 'hardhat_standard',
    name: 'Casque de sécurité standard',
    category: 'Protection tête',
    mandatory: true,
    workTypes: ['construction_general', 'excavation', 'industrial_maintenance'],
    description: 'Protection contre chocs et objets qui tombent',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe G'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
    cost: '25-75 CAD',
    supplier: 'MSA, 3M, Honeywell, Bullard'
  },

  // PROTECTION OCULAIRE
  {
    id: 'safety_glasses',
    name: 'Lunettes de sécurité',
    category: 'Protection oculaire',
    mandatory: true,
    workTypes: ['construction_general', 'industrial_maintenance', 'welding'],
    description: 'Protection contre impacts et projections',
    certifications: ['CSA Z94.3', 'ANSI Z87.1'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2 ans ou selon rayures',
    cost: '10-50 CAD',
    supplier: 'Uvex, 3M, Honeywell, Jackson Safety'
  },
  {
    id: 'welding_helmet',
    name: 'Masque de soudage',
    category: 'Protection oculaire',
    mandatory: true,
    workTypes: ['welding'],
    description: 'Protection contre rayonnements de soudage',
    certifications: ['CSA Z94.3', 'ANSI Z87.1', 'CSA W117.2'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '3-5 ans selon usage',
    cost: '100-500 CAD',
    supplier: 'Lincoln Electric, Miller, ESAB, 3M'
  },

  // PROTECTION RESPIRATOIRE
  {
    id: 'n95_respirator',
    name: 'Masque N95',
    category: 'Protection respiratoire',
    mandatory: false,
    workTypes: ['construction_general', 'environmental_cleanup'],
    description: 'Protection contre particules non-huileuses',
    certifications: ['NIOSH N95', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Usage unique ou selon contamination',
    cost: '2-5 CAD',
    supplier: '3M, Honeywell, Moldex'
  },
  {
    id: 'half_face_respirator',
    name: 'Demi-masque respiratoire',
    category: 'Protection respiratoire',
    mandatory: false,
    workTypes: ['chemical_handling', 'environmental_cleanup', 'industrial_maintenance'],
    description: 'Protection contre vapeurs et gaz avec cartouches',
    certifications: ['NIOSH', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans (masque), cartouches selon exposition',
    cost: '50-200 CAD',
    supplier: '3M, Honeywell, MSA, Moldex'
  },
  {
    id: 'scba',
    name: 'Appareil respiratoire autonome',
    category: 'Protection respiratoire',
    mandatory: true,
    workTypes: ['confined_space_entry', 'emergency_response'],
    description: 'Air respirable autonome pour espaces confinés',
    certifications: ['NIOSH', 'CSA Z94.4', 'NFPA 1981'],
    inspectionFrequency: 'Quotidienne et après chaque usage',
    lifespan: '15 ans selon maintenance',
    cost: '3000-8000 CAD',
    supplier: 'MSA, Scott Safety, Dräger'
  },

  // PROTECTION MAINS
  {
    id: 'electrical_gloves',
    name: 'Gants isolants électriques',
    category: 'Protection mains',
    mandatory: true,
    workTypes: ['electrical_maintenance', 'electrical_installation'],
    description: 'Gants diélectriques avec surgants cuir',
    certifications: ['ASTM D120', 'IEC 60903', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation + test 6 mois',
    lifespan: '3 ans ou selon tests',
    cost: '100-300 CAD',
    supplier: 'Salisbury, Cementex, Regeltex'
  },
  {
    id: 'cut_resistant_gloves',
    name: 'Gants anti-coupure',
    category: 'Protection mains',
    mandatory: false,
    workTypes: ['construction_general', 'glass_handling', 'metal_work'],
    description: 'Protection contre coupures niveau A2-A5',
    certifications: ['ANSI/ISEA 105', 'EN 388', 'CSA Z94.4'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '3-6 mois selon usage',
    cost: '15-50 CAD',
    supplier: 'Ansell, HexArmor, MCR Safety, Superior Glove'
  },
  {
    id: 'chemical_gloves',
    name: 'Gants chimiques',
    category: 'Protection mains',
    mandatory: false,
    workTypes: ['chemical_handling', 'environmental_cleanup'],
    description: 'Protection contre produits chimiques spécifiques',
    certifications: ['ASTM F739', 'EN 374', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Selon tableau perméation',
    cost: '5-30 CAD',
    supplier: 'Ansell, Showa, Mapa, MCR Safety'
  },

  // PROTECTION PIEDS
  {
    id: 'safety_boots_steel',
    name: 'Bottes à embout d\'acier',
    category: 'Protection pieds',
    mandatory: true,
    workTypes: ['construction_general', 'industrial_maintenance', 'excavation'],
    description: 'Protection contre écrasement et perforation',
    certifications: ['CSA Z195', 'ASTM F2413'],
    inspectionFrequency: 'Hebdomadaire',
    lifespan: '12-18 mois selon usage',
    cost: '150-400 CAD',
    supplier: 'Dakota, Terra, Timberland PRO, Caterpillar'
  },
  {
    id: 'dielectric_boots',
    name: 'Bottes diélectriques',
    category: 'Protection pieds',
    mandatory: true,
    workTypes: ['electrical_maintenance', 'electrical_installation'],
    description: 'Isolation électrique et protection mécanique',
    certifications: ['ASTM F2413 EH', 'CSA Z195', 'ASTM F1117'],
    inspectionFrequency: 'Quotidienne + test annuel',
    lifespan: '2-3 ans selon tests',
    cost: '200-500 CAD',
    supplier: 'Salisbury, Cementex, NASCO'
  },

  // PROTECTION CORPS
  {
    id: 'high_vis_vest',
    name: 'Veste haute visibilité',
    category: 'Protection corps',
    mandatory: true,
    workTypes: ['road_work', 'construction_general', 'railway_maintenance'],
    description: 'Visibilité jour/nuit avec bandes rétroréfléchissantes',
    certifications: ['CSA Z96', 'ANSI/ISEA 107'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2-3 ans selon lavages',
    cost: '25-75 CAD',
    supplier: 'Forcefield, ML Kishigo, PIP, Radians'
  },
  {
    id: 'arc_flash_suit',
    name: 'Vêtement résistant à l\'arc',
    category: 'Protection corps',
    mandatory: true,
    workTypes: ['electrical_maintenance'],
    description: 'Protection contre arc électrique selon cal/cm²',
    certifications: ['ASTM F1506', 'NFPA 70E', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou selon dommages',
    cost: '500-2000 CAD',
    supplier: 'Salisbury, Oberon, National Safety Apparel'
  },
  {
    id: 'chemical_suit',
    name: 'Combinaison chimique',
    category: 'Protection corps',
    mandatory: false,
    workTypes: ['chemical_handling', 'environmental_cleanup'],
    description: 'Protection intégrale contre substances chimiques',
    certifications: ['NFPA 1991', 'NFPA 1992', 'EN 943'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Usage unique ou selon contamination',
    cost: '100-500 CAD',
    supplier: 'DuPont, Lakeland, Kappler, 3M'
  },

  // PROTECTION CHUTE
  {
    id: 'full_body_harness',
    name: 'Harnais intégral',
    category: 'Protection chute',
    mandatory: true,
    workTypes: ['roofing', 'construction_general', 'tree_work', 'telecom_installation'],
    description: 'Harnais avec points d\'attache dorsal et pectoral',
    certifications: ['CSA Z259.10', 'ANSI Z359.11'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou selon usure',
    cost: '150-400 CAD',
    supplier: '3M, MSA, Miller, Honeywell'
  },
  {
    id: 'shock_absorbing_lanyard',
    name: 'Longe avec absorbeur',
    category: 'Protection chute',
    mandatory: true,
    workTypes: ['roofing', 'construction_general', 'tree_work'],
    description: 'Longe avec système absorption d\'énergie',
    certifications: ['CSA Z259.11', 'ANSI Z359.13'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou après choc',
    cost: '100-250 CAD',
    supplier: '3M, MSA, Miller, Honeywell'
  },
  {
    id: 'anchor_point',
    name: 'Point d\'ancrage temporaire',
    category: 'Protection chute',
    mandatory: true,
    workTypes: ['roofing', 'construction_general'],
    description: 'Point d\'ancrage mobile ou permanent >22kN',
    certifications: ['CSA Z259.15', 'ANSI Z359.18'],
    inspectionFrequency: 'Avant installation',
    lifespan: '10 ans selon inspection',
    cost: '200-800 CAD',
    supplier: '3M, MSA, Miller, Guardian Fall'
  },

  // DÉTECTION ET SURVEILLANCE
  {
    id: 'gas_detector_4_gas',
    name: 'Détecteur 4 gaz',
    category: 'Détection',
    mandatory: true,
    workTypes: ['confined_space_entry', 'gas_maintenance'],
    description: 'Détection O₂, LIE, CO, H₂S avec alarmes',
    certifications: ['CSA C22.2', 'ATEX', 'IECEx'],
    inspectionFrequency: 'Calibration quotidienne',
    lifespan: '3-5 ans selon capteurs',
    cost: '800-2000 CAD',
    supplier: 'Honeywell, MSA, Dräger, Industrial Scientific'
  },
  {
    id: 'sound_level_meter',
    name: 'Sonomètre',
    category: 'Détection',
    mandatory: false,
    workTypes: ['industrial_maintenance', 'construction_general'],
    description: 'Mesure niveaux sonores pour protection auditive',
    certifications: ['IEC 61672', 'ANSI S1.4'],
    inspectionFrequency: 'Calibration annuelle',
    lifespan: '10+ ans avec calibration',
    cost: '500-3000 CAD',
    supplier: 'Brüel & Kjær, Larson Davis, 3M, Casella'
  },

  // PREMIERS SECOURS
  {
    id: 'first_aid_kit',
    name: 'Trousse premiers secours',
    category: 'Premiers secours',
    mandatory: true,
    workTypes: ['all_work_types'],
    description: 'Trousse conforme réglementation provinciale',
    certifications: ['CSA Z1220', 'Réglementation provinciale'],
    inspectionFrequency: 'Mensuelle',
    lifespan: 'Remplacement selon péremption',
    cost: '50-200 CAD',
    supplier: 'Johnson & Johnson, Honeywell, Acme United'
  },
  {
    id: 'emergency_shower',
    name: 'Douche d\'urgence',
    category: 'Premiers secours',
    mandatory: false,
    workTypes: ['chemical_handling', 'laboratory_work'],
    description: 'Douche et lave-yeux d\'urgence 15 min',
    certifications: ['ANSI Z358.1', 'CSA Z1611'],
    inspectionFrequency: 'Hebdomadaire',
    lifespan: '15+ ans avec maintenance',
    cost: '2000-8000 CAD',
    supplier: 'Haws, Bradley, Speakman, Guardian'
  }
];

// Traductions complètes français/anglais
const translations = {
  fr: {
    // Interface générale
    title: 'Analyse Sécuritaire du Travail (AST)',
    subtitle: 'Formulaire d\'évaluation des risques conforme CSA',
    loading: 'Chargement en cours...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    continue: 'Continuer',
    previous: 'Précédent',
    next: 'Suivant',
    finish: 'Terminer',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    
    // Étapes du formulaire
    step1: 'Informations projet',
    step2: 'Identification dangers',
    step3: 'Mesures de contrôle',
    step4: 'Équipe de travail',
    step5: 'Équipements sécurité',
    step6: 'Conditions météo',
    step7: 'Documentation',
    step8: 'Signatures',
    
    // Champs de base
    projectName: 'Nom du projet',
    location: 'Lieu de travail',
    client: 'Client',
    contractor: 'Entrepreneur',
    supervisor: 'Superviseur',
    date: 'Date',
    startTime: 'Heure début',
    endTime: 'Heure fin',
    duration: 'Durée (heures)',
    workType: 'Type de travail',
    description: 'Description des travaux',
    
    // Informations équipe
    teamMember: 'Membre d\'équipe',
    position: 'Poste',
    experience: 'Expérience (années)',
    certifications: 'Certifications',
    medicalRestrictions: 'Restrictions médicales',
    
    // Dangers et risques
    hazardIdentification: 'Identification des dangers',
    riskAssessment: 'Évaluation des risques',
    controlMeasures: 'Mesures de contrôle',
    severity: 'Gravité',
    probability: 'Probabilité',
    riskLevel: 'Niveau de risque',
    residualRisk: 'Risque résiduel',
    
    // Niveaux de risque
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    critical: 'Critique',
    
    // Probabilité
    rare: 'Rare',
    unlikely: 'Improbable',
    possible: 'Possible',
    likely: 'Probable',
    almostCertain: 'Quasi-certain',
    
    // Mesures de contrôle
    elimination: 'Élimination',
    substitution: 'Substitution',
    engineering: 'Contrôles techniques',
    administrative: 'Contrôles administratifs',
    ppe: 'Équipements protection individuelle',
    
    // Équipements
    equipment: 'Équipement',
    quantity: 'Quantité',
    condition: 'État',
    inspected: 'Inspecté',
    inspector: 'Inspecteur',
    inspectionDate: 'Date inspection',
    
    // États d'équipement
    excellent: 'Excellent',
    good: 'Bon',
    fair: 'Acceptable',
    poor: 'Défaillant',
    
    // Météo
    weather: 'Conditions météorologiques',
    temperature: 'Température (°C)',
    humidity: 'Humidité (%)',
    windSpeed: 'Vitesse vent (km/h)',
    windDirection: 'Direction vent',
    precipitation: 'Précipitations (mm)',
    visibility: 'Visibilité (km)',
    uvIndex: 'Indice UV',
    
    // Signatures
    signatures: 'Signatures et approbations',
    worker: 'Travailleur',
    safety_officer: 'Agent sécurité',
    client_rep: 'Représentant client',
    signatureRequired: 'Signature requise',
    signatureDate: 'Date signature',
    
    // Statuts
    draft: 'Brouillon',
    review: 'En révision',
    approved: 'Approuvé',
    inProgress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    
    // Messages
    saveSuccess: 'AST sauvegardée avec succès',
    saveError: 'Erreur lors de la sauvegarde',
    requiredField: 'Champ obligatoire',
    invalidEmail: 'Adresse courriel invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    
    // Validation
    validation: {
      required: 'Ce champ est obligatoire',
      email: 'Format d\'adresse courriel invalide',
      phone: 'Format de numéro de téléphone invalide',
      minLength: 'Longueur minimale requise',
      maxLength: 'Longueur maximale dépassée',
      numeric: 'Valeur numérique requise',
      positive: 'Valeur positive requise'
    },
    
    // Documentation
    documents: 'Documents associés',
    permits: 'Permis requis',
    procedures: 'Procédures',
    emergencyPlan: 'Plan d\'urgence',
    evacuationPlan: 'Plan d\'évacuation',
    msds: 'Fiches signalétiques',
    
    // Conformité
    compliance: 'Conformité réglementaire',
    csa: 'Normes CSA',
    ohsa: 'LSST Ontario',
    iso45001: 'ISO 45001',
    clientStandards: 'Normes client'
  },
  
  en: {
    // General interface
    title: 'Job Safety Analysis (JSA)',
    subtitle: 'CSA-compliant risk assessment form',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    
    // Form steps
    step1: 'Project Information',
    step2: 'Hazard Identification',
    step3: 'Control Measures',
    step4: 'Work Team',
    step5: 'Safety Equipment',
    step6: 'Weather Conditions',
    step7: 'Documentation',
    step8: 'Signatures',
    
    // Basic fields
    projectName: 'Project Name',
    location: 'Work Location',
    client: 'Client',
    contractor: 'Contractor',
    supervisor: 'Supervisor',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration (hours)',
    workType: 'Work Type',
    description: 'Work Description',
    
    // Team information
    teamMember: 'Team Member',
    position: 'Position',
    experience: 'Experience (years)',
    certifications: 'Certifications',
    medicalRestrictions: 'Medical Restrictions',
    
    // Hazards and risks
    hazardIdentification: 'Hazard Identification',
    riskAssessment: 'Risk Assessment',
    controlMeasures: 'Control Measures',
    severity: 'Severity',
    probability: 'Probability',
    riskLevel: 'Risk Level',
    residualRisk: 'Residual Risk',
    
    // Risk levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    
    // Probability
    rare: 'Rare',
    unlikely: 'Unlikely',
    possible: 'Possible',
    likely: 'Likely',
    almostCertain: 'Almost Certain',
    
    // Control measures
    elimination: 'Elimination',
    substitution: 'Substitution',
    engineering: 'Engineering Controls',
    administrative: 'Administrative Controls',
    ppe: 'Personal Protective Equipment',
    
    // Equipment
    equipment: 'Equipment',
    quantity: 'Quantity',
    condition: 'Condition',
    inspected: 'Inspected',
    inspector: 'Inspector',
    inspectionDate: 'Inspection Date',
    
    // Equipment conditions
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    
    // Weather
    weather: 'Weather Conditions',
    temperature: 'Temperature (°C)',
    humidity: 'Humidity (%)',
    windSpeed: 'Wind Speed (km/h)',
    windDirection: 'Wind Direction',
    precipitation: 'Precipitation (mm)',
    visibility: 'Visibility (km)',
    uvIndex: 'UV Index',
    
    // Signatures
    signatures: 'Signatures and Approvals',
    worker: 'Worker',
    safety_officer: 'Safety Officer',
    client_rep: 'Client Representative',
    signatureRequired: 'Signature Required',
    signatureDate: 'Signature Date',
    
    // Status
    draft: 'Draft',
    review: 'Under Review',
    approved: 'Approved',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Messages
    saveSuccess: 'JSA saved successfully',
    saveError: 'Error saving JSA',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    
    // Validation
    validation: {
      required: 'This field is required',
      email: 'Invalid email format',
      phone: 'Invalid phone format',
      minLength: 'Minimum length required',
      maxLength: 'Maximum length exceeded',
      numeric: 'Numeric value required',
      positive: 'Positive value required'
    },
    
    // Documentation
    documents: 'Associated Documents',
    permits: 'Required Permits',
    procedures: 'Procedures',
    emergencyPlan: 'Emergency Plan',
    evacuationPlan: 'Evacuation Plan',
    msds: 'Material Safety Data Sheets',
    
    // Compliance
    compliance: 'Regulatory Compliance',
    csa: 'CSA Standards',
    ohsa: 'OHSA Ontario',
    iso45001: 'ISO 45001',
    clientStandards: 'Client Standards'
  }
};
// =================== AST SECTION 6/6 - COMPOSANT PRINCIPAL COMPLET ===================

// Composant principal AST avec partage équipe
export default function ASTFormUltraPremium({ tenant = 'default' }: ASTFormProps) {
  // Normaliser le tenant
  const tenantId = typeof tenant === 'string' ? tenant : tenant?.subdomain || 'default';
  const tenantName = typeof tenant === 'string' ? tenant : tenant?.companyName || 'Default Company';
  // États principaux
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [astData, setAstData] = useState<Partial<ASTData>>({
    id: '',
    projectInfo: {
      name: '',
      location: '',
      client: '',
      contractor: '',
      supervisor: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      duration: 0,
      permits: [],
      workType: WORK_TYPES[0],
      description: '',
      coordinates: { lat: 0, lng: 0 },
      weather: {
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        windDirection: '',
        precipitation: 0,
        visibility: 0,
        uvIndex: 0,
        conditions: '',
        warnings: [],
        impact: 'low'
      },
      emergencyContacts: []
    },
    hazards: [],
    team: [],
    equipment: [],
    signatures: [],
    status: 'draft',
    auditTrail: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      language: 'fr',
      timezone: 'America/Toronto',
      compliance: {
        csa: false,
        ohsa: false,
        iso45001: false,
        client: false
      },
      documentNumber: '',
      revisionNumber: 1,
      approvals: []
    }
  });

  // États pour le partage équipe
  const [shareMode, setShareMode] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [teamConsultationStatus, setTeamConsultationStatus] = useState<Record<string, {
    consulted: boolean;
    consentGiven: boolean;
    timestamp: string;
    ipAddress: string;
    comments: string;
  }>>({});
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [teamNotifications, setTeamNotifications] = useState<Array<{
    employeeId: string;
    method: 'sms' | 'email' | 'whatsapp';
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
    timestamp: string;
  }>>([]);

  // États interface
  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>>([]);

  // Références
  const signaturePadRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fonctions utilitaires
  const t = (key: string) => (translations[language] as any)[key] || key;

  const generateUniqueId = () => {
    return `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const notification = {
      id: generateUniqueId(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Fonctions de partage équipe
  const generateShareLink = async () => {
    setIsGeneratingShareLink(true);
    try {
      // Sauvegarder l'AST en mode "consultation"
      const shareId = generateUniqueId();
      const shareData = {
        ...astData,
        id: shareId,
        status: 'review',
        shareMode: true,
        shareExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      };

      // Simulation sauvegarde (remplacer par vraie API)
      localStorage.setItem(`ast_share_${shareId}`, JSON.stringify(shareData));
      
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/ast/consultation/${shareId}`;
      setShareLink(generatedLink);
      
      // Initialiser le statut de consultation pour chaque membre
      const initialStatus: Record<string, any> = {};
      astData.team?.forEach(member => {
        initialStatus[member.id] = {
          consulted: false,
          consentGiven: false,
          timestamp: '',
          ipAddress: '',
          comments: ''
        };
      });
      setTeamConsultationStatus(initialStatus);

      addNotification('success', 'Lien de partage généré avec succès');
    } catch (error) {
      addNotification('error', 'Erreur lors de la génération du lien');
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  const sendTeamNotifications = async (methods: Array<'sms' | 'email' | 'whatsapp'>) => {
    if (!shareLink || !astData.team) return;

    const notifications: Array<any> = [];

    for (const member of astData.team) {
      for (const method of methods) {
        try {
          let message = '';
          
          if (method === 'sms' || method === 'whatsapp') {
            message = `🔒 CONSULTATION AST REQUISE
📋 Projet: ${astData.projectInfo?.name}
📅 Date: ${astData.projectInfo?.date}
👤 ${member.name}, votre consultation est requise pour l'AST.

🔗 Lien consultation: ${shareLink}

⚠️ Consultez et donnez votre consentement avant le début des travaux.
⏰ Lien valide 7 jours.

Sécur360 - Votre sécurité, notre priorité`;
          }

          // Simulation envoi (remplacer par vraies APIs)
          console.log(`Envoi ${method} à ${member.name} (${member.phone || member.email}):`, message);
          
          notifications.push({
            employeeId: member.id,
            method,
            status: 'sent',
            timestamp: new Date().toISOString()
          });

          // Simulation WhatsApp API
          if (method === 'whatsapp' && member.phone) {
            const whatsappUrl = `https://wa.me/${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }

          // Simulation SMS API
          if (method === 'sms' && member.phone) {
            // Ici, intégrer vraie API SMS (Twilio, etc.)
            console.log('SMS envoyé via API à:', member.phone);
          }

          // Simulation Email API
          if (method === 'email' && member.email) {
            // Ici, intégrer vraie API Email
            console.log('Email envoyé via API à:', member.email);
          }

        } catch (error) {
          console.error(`Erreur envoi ${method} à ${member.name}:`, error);
          notifications.push({
            employeeId: member.id,
            method,
            status: 'error',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    setTeamNotifications(notifications);
    addNotification('success', `Notifications envoyées à ${astData.team.length} membres`);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    addNotification('success', 'Lien copié dans le presse-papiers');
  };

  // Fonction pour traiter les consultations (côté consultation)
  const processTeamConsultation = (employeeId: string, consent: boolean, comments: string = '') => {
    const consultation = {
      consulted: true,
      consentGiven: consent,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1', // Obtenir vraie IP
      comments
    };

    setTeamConsultationStatus(prev => ({
      ...prev,
      [employeeId]: consultation
    }));

    // Sauvegarder dans l'AST
    const updatedAst = {
      ...astData,
      team: astData.team?.map(member => 
        member.id === employeeId 
          ? { ...member, consultationStatus: consent ? 'approved' : 'rejected', comments }
          : member
      ) || []
    };

    localStorage.setItem(`ast_share_${astData.id}`, JSON.stringify(updatedAst));
    
    addNotification('success', consent ? 'Consentement accordé' : 'Consultation refusée');
  };

  // Fonctions de gestion des données
  const updateProjectInfo = (field: string, value: any) => {
    setAstData(prev => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo!,
        [field]: value
      }
    }));
  };

  const addTeamMember = () => {
    const newMember: Employee = {
      id: generateUniqueId(),
      name: '',
      position: '',
      department: '',
      certifications: [],
      experience: 0,
      email: '',
      phone: '',
      emergencyContact: '',
      medicalRestrictions: [],
      lastTraining: '',
      consultationStatus: 'pending',
      comments: ''
    };

    setAstData(prev => ({
      ...prev,
      team: [...(prev.team || []), newMember]
    }));
  };

  const updateTeamMember = (id: string, field: string, value: any) => {
    setAstData(prev => ({
      ...prev,
      team: prev.team?.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      ) || []
    }));
  };

  const removeTeamMember = (id: string) => {
    setAstData(prev => ({
      ...prev,
      team: prev.team?.filter(member => member.id !== id) || []
    }));
  };

  const addHazard = (hazardId: string) => {
    const hazard = predefinedHazards.find(h => h.id === hazardId);
    if (!hazard) return;

    const hazardData = {
      hazard,
      identified: true,
      riskLevel: hazard.riskLevel,
      controlMeasures: predefinedControlMeasures[hazardId] || [],
      residualRisk: hazard.riskLevel,
      comments: '',
      photos: []
    };

    setAstData(prev => ({
      ...prev,
      hazards: [...(prev.hazards || []), hazardData]
    }));

    setSelectedHazards(prev => [...prev, hazardId]);
  };

  const removeHazard = (hazardId: string) => {
    setAstData(prev => ({
      ...prev,
      hazards: prev.hazards?.filter(h => h.hazard.id !== hazardId) || []
    }));

    setSelectedHazards(prev => prev.filter(id => id !== hazardId));
  };

  const saveAst = async () => {
    setIsLoading(true);
    try {
      const astId = astData.id || generateUniqueId();
      const updatedAst = {
        ...astData,
        id: astId,
        metadata: {
          ...astData.metadata!,
          updatedAt: new Date().toISOString()
        }
      };

      // Simulation sauvegarde (remplacer par vraie API)
      localStorage.setItem(`ast_${astId}`, JSON.stringify(updatedAst));
      setAstData(updatedAst);
      
      addNotification('success', 'AST sauvegardée avec succès');
    } catch (error) {
      addNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    addNotification('info', 'Génération PDF en cours...');
    // Ici, implémenter la génération PDF
    setTimeout(() => {
      addNotification('success', 'PDF généré avec succès');
    }, 2000);
  };

  // Filtrage des dangers
  const filteredHazards = predefinedHazards.filter(hazard => {
    const matchesSearch = hazard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || hazard.category === filterCategory;
    const matchesWorkType = astData.projectInfo?.workType ? 
                           hazard.workTypes.includes(astData.projectInfo.workType.id) : true;
    
    return matchesSearch && matchesCategory && matchesWorkType;
  });

  // Calcul statistiques
  const totalRisk = astData.hazards?.reduce((sum, h) => sum + h.riskLevel, 0) || 0;
  const avgRisk = astData.hazards?.length ? totalRisk / astData.hazards.length : 0;
  const criticalHazards = astData.hazards?.filter(h => h.hazard.severity === 'critical').length || 0;
  const teamConsultationProgress = astData.team?.length ? 
    Object.values(teamConsultationStatus).filter(s => s.consulted).length / astData.team.length * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* En-tête avec logo et navigation */}
      <header className="bg-white shadow-lg border-b-2 border-blue-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12" 
                dangerouslySetInnerHTML={{ __html: SECUR360_LOGO }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
                <p className="text-sm text-gray-600">{t('subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>

              {/* Statut AST */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                astData.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                astData.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                astData.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {t(astData.status || 'draft')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <X className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <div 
                  key={step}
                  className={`flex items-center space-x-2 cursor-pointer ${
                    currentStep === step ? 'text-blue-600' : 
                    currentStep > step ? 'text-green-600' : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentStep(step)}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    currentStep === step ? 'border-blue-600 bg-blue-600 text-white' :
                    currentStep > step ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300'
                  }`}>
                    {currentStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {t(`step${step}`)}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions principales */}
            <div className="flex items-center space-x-3">
              <button
                onClick={saveAst}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>

              {currentStep === 8 && (
                <button
                  onClick={() => setShareMode(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager équipe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              {/* ÉTAPE 1: Informations projet */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 {t('step1')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('projectName')} *
                      </label>
                      <input
                        type="text"
                        value={astData.projectInfo?.name || ''}
                        onChange={(e) => updateProjectInfo('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Maintenance ligne électrique"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('location')} *
                      </label>
                      <input
                        type="text"
                        value={astData.projectInfo?.location || ''}
                        onChange={(e) => updateProjectInfo('location', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 123 Rue Principale, Québec"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('client')} *
                      </label>
                      <input
                        type="text"
                        value={astData.projectInfo?.client || ''}
                        onChange={(e) => updateProjectInfo('client', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Hydro-Québec"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('supervisor')} *
                      </label>
                      <input
                        type="text"
                        value={astData.projectInfo?.supervisor || ''}
                        onChange={(e) => updateProjectInfo('supervisor', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Jean Tremblay"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('date')} *
                      </label>
                      <input
                        type="date"
                        value={astData.projectInfo?.date || ''}
                        onChange={(e) => updateProjectInfo('date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('workType')} *
                      </label>
                      <select
                        value={astData.projectInfo?.workType?.id || ''}
                        onChange={(e) => {
                          const workType = WORK_TYPES.find(wt => wt.id === e.target.value);
                          updateProjectInfo('workType', workType);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un type</option>
                        {WORK_TYPES.map(workType => (
                          <option key={workType.id} value={workType.id}>
                            {workType.icon} {workType.name} - {workType.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('description')}
                    </label>
                    <textarea
                      value={astData.projectInfo?.description || ''}
                      onChange={(e) => updateProjectInfo('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Description détaillée des travaux à effectuer..."
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 2: Identification des dangers */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">⚠️ {t('step2')}</h2>
                  
                  {/* Filtres et recherche */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Rechercher un danger..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Toutes catégories</option>
                      <option value="physical">Physiques</option>
                      <option value="chemical">Chimiques</option>
                      <option value="biological">Biologiques</option>
                      <option value="ergonomic">Ergonomiques</option>
                      <option value="environmental">Environnementaux</option>
                    </select>
                  </div>

                  {/* Liste des dangers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHazards.map(hazard => (
                      <div
                        key={hazard.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedHazards.includes(hazard.id)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (selectedHazards.includes(hazard.id)) {
                            removeHazard(hazard.id);
                          } else {
                            addHazard(hazard.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{hazard.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{hazard.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                hazard.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                hazard.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                hazard.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {t(hazard.severity)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Risque: {hazard.riskLevel}/25
                              </span>
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedHazards.includes(hazard.id)
                              ? 'bg-red-500 border-red-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedHazards.includes(hazard.id) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredHazards.length === 0 && (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun danger trouvé pour ces critères</p>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 4: Équipe de travail */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">👥 {t('step4')}</h2>
                    <button
                      onClick={addTeamMember}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter membre</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {astData.team?.map((member, index) => (
                      <div key={member.id} className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">
                            Membre {index + 1}
                          </h3>
                          <button
                            onClick={() => removeTeamMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom complet *
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Jean Tremblay"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Poste
                            </label>
                            <input
                              type="text"
                              value={member.position}
                              onChange={(e) => updateTeamMember(member.id, 'position', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Électricien"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expérience (années)
                            </label>
                            <input
                              type="number"
                              value={member.experience}
                              onChange={(e) => updateTeamMember(member.id, 'experience', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Téléphone *
                            </label>
                            <input
                              type="tel"
                              value={member.phone}
                              onChange={(e) => updateTeamMember(member.id, 'phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: (514) 555-0123"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: jean@exemple.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Statut consultation
                            </label>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              member.consultationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              member.consultationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              member.consultationStatus === 'consulted' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.consultationStatus === 'approved' ? '✅ Approuvé' :
                               member.consultationStatus === 'rejected' ? '❌ Refusé' :
                               member.consultationStatus === 'consulted' ? '👁️ Consulté' :
                               '⏳ En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!astData.team || astData.team.length === 0) && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun membre d'équipe ajouté</p>
                        <button
                          onClick={addTeamMember}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Ajouter le premier membre
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ÉTAPE 8: Signatures et partage équipe */}
              {currentStep === 8 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800">✍️ {t('step8')}</h2>

                  {/* Statistiques de consultation */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-4">📊 État des consultations équipe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {astData.team?.length || 0}
                        </div>
                        <div className="text-sm text-blue-600">Membres équipe</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.values(teamConsultationStatus).filter(s => s.consulted).length}
                        </div>
                        <div className="text-sm text-green-600">Consultations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Object.values(teamConsultationStatus).filter(s => s.consentGiven).length}
                        </div>
                        <div className="text-sm text-green-600">Approbations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round(teamConsultationProgress)}%
                        </div>
                        <div className="text-sm text-yellow-600">Progression</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${teamConsultationProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Partage équipe */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">🔗 Partage équipe pour consultation</h3>
                    
                    {!shareLink ? (
                      <div className="text-center py-6">
                        <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Générez un lien de consultation pour permettre à votre équipe de consulter et approuver l'AST
                        </p>
                        <button
                          onClick={generateShareLink}
                          disabled={isGeneratingShareLink || !astData.team?.length}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingShareLink ? (
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Génération...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Share2 className="w-4 h-4" />
                              <span>Générer lien consultation</span>
                            </div>
                          )}
                        </button>
                        {!astData.team?.length && (
                          <p className="text-red-500 text-sm mt-2">
                            Ajoutez des membres d'équipe avant de générer le lien
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Lien généré */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            🔗 Lien de consultation (valide 7 jours)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={shareLink}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={copyShareLink}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options d'envoi */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-3">📱 Envoyer aux membres équipe</h4>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => sendTeamNotifications(['sms'])}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>SMS</span>
                            </button>
                            <button
                              onClick={() => sendTeamNotifications(['whatsapp'])}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => sendTeamNotifications(['email'])}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </button>
                            <button
                              onClick={() => sendTeamNotifications(['sms', 'whatsapp', 'email'])}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Tous</span>
                            </button>
                          </div>
                        </div>

                        {/* Statut des notifications */}
                        {teamNotifications.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3">📬 Statut des envois</h4>
                            <div className="space-y-2">
                              {astData.team?.map(member => {
                                const memberNotifications = teamNotifications.filter(n => n.employeeId === member.id);
                                return (
                                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="font-medium">{member.name}</span>
                                    <div className="flex space-x-2">
                                      {memberNotifications.map((notif, index) => (
                                        <span
                                          key={index}
                                          className={`px-2 py-1 rounded text-xs ${
                                            notif.status === 'sent' ? 'bg-green-100 text-green-800' :
                                            notif.status === 'error' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {notif.method.toUpperCase()}: {notif.status}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Suivi des consultations */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">👁️ Suivi consultations individuelles</h4>
                          <div className="space-y-3">
                            {astData.team?.map(member => {
                              const consultation = teamConsultationStatus[member.id];
                              return (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-gray-600">{member.position}</div>
                                  </div>
                                  <div className="text-right">
                                    {consultation?.consulted ? (
                                      <div>
                                        <div className={`font-medium ${
                                          consultation.consentGiven ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {consultation.consentGiven ? '✅ Approuvé' : '❌ Refusé'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(consultation.timestamp).toLocaleString('fr-CA')}
                                        </div>
                                        {consultation.comments && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            💬 {consultation.comments}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-yellow-600 font-medium">⏳ En attente</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions finales */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={generatePDF}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Générer PDF</span>
                    </button>
                    <button
                      onClick={() => setAstData(prev => ({ ...prev, status: 'approved' }))}
                      disabled={teamConsultationProgress < 100}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Finaliser AST</span>
                    </button>
                  </div>

                  {teamConsultationProgress < 100 && (
                    <p className="text-center text-yellow-600 text-sm">
                      ⚠️ Toutes les consultations équipe doivent être complétées avant la finalisation
                    </p>
                  )}
                </div>
              )}

              {/* Navigation entre étapes */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('previous')}</span>
                </button>

                <button
                  onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                  disabled={currentStep === 8}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <span>{t('next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau latéral - Statistiques */}
          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📊 Statistiques AST</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dangers identifiés:</span>
                  <span className="font-bold text-red-600">{astData.hazards?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risque moyen:</span>
                  <span className={`font-bold ${
                    avgRisk >= 15 ? 'text-red-600' :
                    avgRisk >= 10 ? 'text-orange-600' :
                    avgRisk >= 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {avgRisk.toFixed(1)}/25
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dangers critiques:</span>
                  <span className="font-bold text-red-600">{criticalHazards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membres équipe:</span>
                  <span className="font-bold text-blue-600">{astData.team?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Widget météo */}
            {showWeatherWidget && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">🌤️ Conditions météo</h3>
                  <button onClick={() => setShowWeatherWidget(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <span>22°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Wind className="w-5 h-5 text-blue-500" />
                    <span>15 km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <span>65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <span>UV: 6</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700 text-sm">
                    ✅ Conditions favorables au travail extérieur
                  </p>
                </div>
              </div>
            )}

            {/* Conformité réglementaire */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">⚖️ Conformité</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">CSA Z1002</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">RSST Québec</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ISO 45001</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Normes client</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
