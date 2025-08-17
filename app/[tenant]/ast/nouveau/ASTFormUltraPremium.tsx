// =================== AST SECTION 1/8 - IMPORTS & INTERFACES CORRIGÉES ===================
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock, RefreshCw, Info, ExternalLink, Thermometer, Wind, Droplets, 
  Sun, Cloud, CloudRain, Snowflake
} from 'lucide-react';

// =================== INTERFACES PRINCIPALES ===================
interface ASTFormProps {
  tenant: string;
}

interface WorkType {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  baseHazards: string[];
  requiredPermits: string[]; // Ajout de la propriété requise
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

interface TeamConsultationStatus {
  consulted: boolean;
  consentGiven: boolean;
  timestamp: string;
  ipAddress: string;
  comments: string;
}

interface TeamNotification {
  employeeId: string;
  method: 'sms' | 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  timestamp: string;
}

interface ASTFormData {
  id: string;
  astNumber: string;
  created: string;
  lastModified: string;
  language: 'fr' | 'en';
  status: 'draft' | 'completed' | 'team_validation' | 'approved' | 'archived';
  industry: 'electrical' | 'construction' | 'industrial' | 'office' | 'manufacturing' | 'other';
  
  projectInfo: {
    date: string;
    time: string;
    client: string;
    clientPhone: string;
    projectNumber: string;
    astClientNumber: string;
    workLocation: string;
    workDescription: string;
    estimatedDuration: string;
    workerCount: number;
    clientRepresentative: string;
    clientRepresentativePhone: string;
    emergencyContact: string;
    emergencyPhone: string;
    workPermitRequired: boolean;
    workPermitNumber?: string;
    weatherConditions: string;
    specialConditions: string;
    // Nouvelles propriétés
    workType?: WorkType;
    coordinates?: { lat: number; lng: number };
  };
  
  teamDiscussion: {
    electricalCutoffPoints: string;
    electricalHazardExplanation: string;
    epiSpecificNotes: string;
    specialWorkConditions: string;
    emergencyProcedures: string;
    discussions: TeamDiscussion[];
    briefingCompleted: boolean;
    briefingDate: string;
    briefingTime: string;
    emergencyProceduresList: EmergencyProcedure[];
  };
  
  safetyEquipment: SafetyEquipment[];
  electricalHazards: ElectricalHazard[];
  riskAssessments: RiskAssessment[];
  
  team: {
    supervisor: string;
    supervisorCertification: string;
    supervisorSignature?: string;
    members: TeamMember[];
    briefingCompleted: boolean;
    briefingDate: string;
    briefingTime: string;
    totalMembers: number;
    acknowledgedMembers: number;
    validations: any[];
    allApproved: boolean;
  };
  
  isolationPoints: IsolationPoint[];
  
  documentation: {
    photos: Photo[];
    additionalDocuments: string[];
    inspectionNotes: string;
    correctiveActions: string;
  };
  
  validation: {
    completedBy: string;
    completedDate: string;
    reviewedBy: string;
    reviewedDate: string;
    approvedBy: string;
    approvedDate: string;
    clientApproval: boolean;
    finalApproval: boolean;
    submissionDate?: string;
    revisionNumber: number;
    comments: string;
    emailSent: boolean;
    archivedDate?: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  qualification: string;
  hasAcknowledged: boolean;
  acknowledgmentTime?: string;
  signature?: string;
  joinedAt: string;
  validationStatus: 'pending' | 'approved' | 'rejected';
  validationComments?: string;
  consultationAst: boolean;
  cadenasAppose: boolean;
  cadenasReleve: boolean;
  phone?: string;
  email?: string;
}

interface Photo {
  id: string;
  name: string;
  data: string;
  description: string;
  timestamp: string;
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'isolation' | 'other';
}

interface IsolationPoint {
  id: string;
  name: string;
  type: 'electrical' | 'mechanical' | 'pneumatic' | 'hydraulic' | 'chemical' | 'thermal';
  isActive: boolean;
  createdAt: string;
  photos: Photo[];
  checklist: {
    cadenasAppose: boolean;
    absenceTension: boolean;
    miseALaTerre: boolean;
    cadenasReleve: boolean;
  };
}

interface ControlMeasure {
  id: string;
  hazardId?: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  priority?: number;
  measure: string;
  description: string;
  implementation: string;
  responsible: string;
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  effectiveness: number;
  compliance: string[];
  isSelected: boolean;
  photos: Photo[];
  notes: string;
}

interface ElectricalHazard {
  id: string;
  code: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isSelected: boolean;
  additionalNotes?: string;
  controlMeasures: ControlMeasure[];
  showControls: boolean;
}

interface SafetyEquipment {
  id: string;
  name: string;
  required: boolean;
  available: boolean;
  notes: string;
  verified: boolean;
  category: 'head' | 'eye' | 'respiratory' | 'hand' | 'foot' | 'body' | 'fall' | 'electrical' | 'detection' | 'other';
  description?: string;
  certifications?: string[];
  inspectionFrequency?: string;
  lifespan?: string;
  cost: 'low' | 'medium' | 'high'; // Changement pour rendre le coût obligatoire
  supplier: string; // Changement pour rendre le fournisseur obligatoire
}

interface TeamDiscussion {
  id: string;
  topic: string;
  description: string; // Changement pour ajouter la description
  notes: string;
  completed: boolean;
  discussedBy: string;
  discussedAt?: string;
  priority: 'low' | 'medium' | 'high';
  keyQuestions: string[]; // Ajout de la propriété keyQuestions
  targetRoles: string[]; // Ajout de la propriété targetRoles
}

interface EmergencyProcedure {
  id: string;
  type: 'medical' | 'fire' | 'evacuation' | 'spill' | 'electrical' | 'other';
  procedure: string;
  responsiblePerson: string;
  contactInfo: string;
  isVerified: boolean;
}

interface RiskAssessment {
  id: string;
  hazardType: string;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  controlMeasures: string[];
  residualRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  isAcceptable: boolean;
  notes: string;
}

// =================== GÉNÉRATEUR DE NUMÉRO AST ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`;
};

// =================== LOGO ENTREPRISE ===================
const CLIENT_POTENTIEL_LOGO = `
<svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="50%" style="stop-color:#1d4ed8"/>
      <stop offset="100%" style="stop-color:#1e40af"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="120" height="60" fill="url(#logoGradient)" rx="8"/>
  <text x="60" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="12">CLIENT</text>
  <text x="60" y="40" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="12">POTENTIEL</text>
  <circle cx="20" cy="30" r="8" fill="white" opacity="0.2"/>
  <circle cx="100" cy="30" r="8" fill="white" opacity="0.2"/>
</svg>
`;
// =================== AST SECTION 2/8 - TYPES DE TRAVAUX ET CONFIGURATIONS ===================

// =================== TYPES DE TRAVAUX PRÉDÉFINIS ===================
const WORK_TYPES: WorkType[] = [
  // ÉLECTRICITÉ
  {
    id: 'electrical_maintenance',
    name: 'Maintenance électrique',
    icon: '⚡',
    category: 'Électricité',
description: 'Travaux de maintenance sur installations électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'electrical_burns', 'falls']
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
description: 'Inspection et tests d&rsquo;équipements électriques',
    baseHazards: ['electrical_shock', 'arc_flash', 'asphyxiation']
  },

  // GAZ ET PIPELINE
  {
    id: 'gas_maintenance',
    name: 'Maintenance gazière',
    icon: '🔥',
    category: 'Gaz & Pipeline',
    description: 'Maintenance sur réseaux de distribution de gaz',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'toxic_exposure', 'asphyxiation']
  },
  {
    id: 'pipeline_inspection',
    name: 'Inspection pipeline',
    icon: '🚰',
    category: 'Gaz & Pipeline',
    description: 'Inspection et contrôle de pipelines',
    baseHazards: ['gas_leak', 'explosion', 'asphyxiation', 'toxic_exposure']
  },
  {
    id: 'gas_installation',
    name: 'Installation gazière',
    icon: '⛽',
    category: 'Gaz & Pipeline',
    description: 'Installation de nouveaux équipements gaziers',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'cave_in', 'heavy_equipment']
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
description: 'Travaux d&#39;excavation et terrassement',
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
    baseHazards: ['mechanical_hazards', 'toxic_exposure', 'noise', 'heat_stress', 'lockout_tagout']
  },
  {
    id: 'welding',
    name: 'Soudage',
    icon: '🔥',
    category: 'Industriel',
    description: 'Travaux de soudage et découpage',
    baseHazards: ['electrical_burns', 'fire', 'toxic_exposure', 'radiation', 'electrical_shock']
  },
  {
    id: 'confined_space_entry',
    name: 'Espaces confinés',
    icon: '🕳️',
    category: 'Industriel',
    description: 'Travaux en espaces confinés',
    baseHazards: ['asphyxiation', 'toxic_exposure', 'oxygen_deficiency', 'engulfment']
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
    baseHazards: ['toxic_exposure', 'biological_hazards', 'toxic_exposure', 'cuts_lacerations']
  },
  {
    id: 'tree_work',
    name: 'Élagage',
    icon: '🌳',
    category: 'Environnement',
description: 'Travaux d&#39;élagage et abattage',
    baseHazards: ['falls', 'cuts_lacerations', 'struck_by_objects', 'electrical_lines']
  },

  // TÉLÉCOMMUNICATIONS
  {
    id: 'telecom_installation',
    name: 'Installation télécom',
    icon: '📡',
    category: 'Télécommunications',
description: 'Installation d&#39;équipements de télécommunication',
    baseHazards: ['falls', 'electrical_shock', 'electromagnetic_fields', 'weather_exposure']
  },
  {
    id: 'fiber_optic',
    name: 'Fibre optique',
    icon: '💡',
    category: 'Télécommunications',
    description: 'Installation et maintenance de fibre optique',
    baseHazards: ['radiation', 'cuts_lacerations', 'asphyxiation', 'falls']
  },

  // URGENCE
  {
    id: 'emergency_response',
    name: 'Intervention d\'urgence',
    icon: '🚨',
    category: 'Urgence',
    description: 'Interventions d\'urgence et réparations critiques',
    baseHazards: ['weather_exposure', 'falls', 'electrical_shock', 'gas_leak']
  },
  {
    id: 'storm_restoration',
    name: 'Restauration tempête',
    icon: '⛈️',
    category: 'Urgence',
    description: 'Restauration après événements météorologiques',
    baseHazards: ['weather_exposure', 'electrical_shock', 'falls', 'struck_by_objects']
  }
];

// =================== CONFIGURATIONS CLIENTS ===================
const CLIENT_CONFIGURATIONS = {
  'hydro-quebec': {
    logo: '/c-secur360-logo.png',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    requiredFields: ['permit_number', 'safety_officer', 'emergency_contacts'],
    customHazards: ['electrical_shock', 'arc_flash', 'electrical_lines'],
    templates: ['electrical_maintenance', 'emergency_response', 'storm_restoration']
  },
  'energir': {
    logo: '/c-secur360-logo.png',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    requiredFields: ['gas_permit', 'excavation_permit', 'pipeline_clearance'],
    customHazards: ['gas_leak', 'explosion', 'underground_utilities'],
    templates: ['gas_maintenance', 'pipeline_inspection', 'gas_installation']
  },
  'bell': {
    logo: '/c-secur360-logo.png',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    requiredFields: ['telecom_permit', 'fiber_clearance', 'rf_safety'],
    customHazards: ['electromagnetic_fields', 'radiation', 'falls'],
    templates: ['telecom_installation', 'fiber_optic']
  },
  'rogers': {
    logo: '/c-secur360-logo.png',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    requiredFields: ['telecom_permit', 'antenna_clearance', 'rf_compliance'],
    customHazards: ['electromagnetic_fields', 'radiation', 'falls'],
    templates: ['telecom_installation']
  }
};

// =================== DISCUSSIONS D'ÉQUIPE PRÉDÉFINIES ===================
const predefinedDiscussions: TeamDiscussion[] = [
  { 
    id: 'disc-001', 
    topic: 'Points de coupure électrique', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'high' 
  },
  { 
    id: 'disc-002', 
    topic: 'Explication des dangers électriques', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'high' 
  },
  { 
    id: 'disc-003', 
    topic: 'EPI spécifiques requis', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'medium' 
  },
  { 
    id: 'disc-004', 
    topic: 'Conditions particulières de travail', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'medium' 
  },
  { 
    id: 'disc-005', 
    topic: 'Procédures d\'urgence', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'high' 
  },
  { 
    id: 'disc-006', 
    topic: 'Communications et signalisation', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'medium' 
  },
  { 
    id: 'disc-007', 
    topic: 'Analyse des risques spécifiques', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'high' 
  },
  { 
    id: 'disc-008', 
    topic: 'Plan d\'évacuation d\'urgence', 
    notes: '', 
    completed: false, 
    discussedBy: '', 
    priority: 'medium' 
  }
];

// =================== PROCÉDURES D'URGENCE ===================
const emergencyProcedures: EmergencyProcedure[] = [
  { 
    id: 'emerg-001', 
    type: 'medical', 
    procedure: 'Appeler le 911, premiers soins, évacuation médicale', 
    responsiblePerson: 'Superviseur de chantier', 
    contactInfo: '911 / Contact urgence', 
    isVerified: false 
  },
  { 
    id: 'emerg-002', 
    type: 'fire', 
    procedure: 'Alarme incendie, évacuation, point de rassemblement', 
    responsiblePerson: 'Chef d\'équipe', 
    contactInfo: 'Service incendie 911', 
    isVerified: false 
  },
  { 
    id: 'emerg-003', 
    type: 'electrical', 
    procedure: 'Coupure d\'urgence, consignation, vérification', 
    responsiblePerson: 'Électricien qualifié', 
    contactInfo: 'Responsable électrique', 
    isVerified: false 
  },
  { 
    id: 'emerg-004', 
    type: 'evacuation', 
    procedure: 'Signal d\'évacuation, routes d\'évacuation, décompte', 
    responsiblePerson: 'Responsable sécurité', 
    contactInfo: 'Poste de commandement', 
    isVerified: false 
  }
];

// =================== FONCTION POUR FILTRER DANGERS PAR TYPE DE TRAVAIL ===================
const getHazardsByWorkType = (workTypeId: string): ElectricalHazard[] => {
  const workType = WORK_TYPES.find(wt => wt.id === workTypeId);
  if (!workType) return [];
  
  // Cette fonction sera utilisée avec la liste complète des dangers
  // qui sera définie dans la section suivante
  return [];
};

// =================== FONCTION POUR OBTENIR ICÔNE CATÉGORIE ===================
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'head': '🪖',
    'eye': '👁️',
    'respiratory': '😷',
    'hand': '🧤',
    'foot': '🥾',
    'body': '🦺',
    'fall': '🪢',
    'electrical': '⚡',
    'detection': '📡',
    'other': '🔧'
  };
  return icons[category] || '🛡️';
};
// =================== AST SECTION 3/8 - BASE DE DONNÉES COMPLÈTE DES DANGERS ===================

// =================== MESURES DE CONTRÔLE SELON HIÉRARCHIE CSA ===================
const predefinedControlMeasures: Record<string, ControlMeasure[]> = {
  // DANGERS ÉLECTRIQUES
  electrical_shock: [
    {
      id: 'elec_shock_001',
      hazardId: 'electrical_shock',
      type: 'elimination',
      measure: 'Consignation électrique complète',
      description: 'Mise hors tension, verrouillage et étiquetage selon CSA Z462',
      implementation: 'Procédure LOTO avec vérification absence de tension',
      responsible: 'Électricien qualifié',
      timeline: 'Avant début travaux',
      cost: 'low',
      effectiveness: 95,
      compliance: ['CSA Z462', 'Code électrique canadien', 'RSST Article 185'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'elec_shock_002',
      hazardId: 'electrical_shock',
      type: 'engineering',
      measure: 'Protection par disjoncteur différentiel',
      description: 'Installation de DDFT/GFCI sur tous les circuits',
      implementation: 'DDFT de classe A (5mA) pour protection personnelle',
      responsible: 'Électricien qualifié',
      timeline: 'Installation permanente',
cost: 'medium',
name: 'Protection par disjoncteur différentiel',
hierarchy: 'engineering',
timeToImplement: 'Installation permanente',
applicableHazards: ['electrical_shock'],
certification: 'CSA Z94.1, ANSI Z89.1 Classe E',
      effectiveness: 85,
      compliance: ['Code électrique canadien Section 26', 'CSA C22.1'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'elec_shock_003',
      hazardId: 'electrical_shock',
      type: 'ppe',
      measure: 'Équipement de protection individuelle',
      description: 'Gants isolants, chaussures diélectriques, casque classe E',
      implementation: 'Sélection selon tension et conditions de travail',
      responsible: 'Travailleur qualifié',
      timeline: 'Port obligatoire',
cost: 'medium',
name: 'Équipement de protection individuelle',
hierarchy: 'ppe',
timeToImplement: 'Port obligatoire',
applicableHazards: ['electrical_shock'],
      effectiveness: 70,
      compliance: ['CSA Z462 Annexe H', 'CSA Z94.4', 'RSST Article 2.10.12'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  arc_flash: [
    {
      id: 'arc_001',
      hazardId: 'arc_flash',
      type: 'elimination',
      measure: 'Travail hors tension',
      description: 'Élimination complète du risque par mise hors tension',
      implementation: 'Consignation selon CSA Z462 avec vérification',
      responsible: 'Personne qualifiée',
      timeline: 'Obligatoire si possible',
cost: 'low',
certification: 'CSA Z94.1, ANSI Z89.1 Classe G',
      effectiveness: 100,
      compliance: ['CSA Z462 Clause 4.1', 'RSST Article 185'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'arc_002',
      hazardId: 'arc_flash',
      type: 'administrative',
      measure: 'Analyse des dangers d\'arc électrique',
      description: 'Étude d\'arc avec calcul des frontières de protection',
      implementation: 'Analyse par ingénieur selon IEEE 1584',
      responsible: 'Ingénieur électrique',
      timeline: 'Avant travaux sous tension',
cost: 'high',
name: 'Vêtements résistants à l\'arc',
hierarchy: 'ppe',
timeToImplement: 'Port obligatoire',
applicableHazards: ['arc_flash'],
      effectiveness: 85,
      compliance: ['CSA Z462 Clause 4.2', 'IEEE 1584'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'arc_003',
      hazardId: 'arc_flash',
      type: 'ppe',
      measure: 'Vêtements résistants à l\'arc',
      description: 'EPI avec indice d\'arc approprié (cal/cm²)',
      implementation: 'Sélection selon étude d\'arc et catégorie EPI',
      responsible: 'Travailleur qualifié',
      timeline: 'Port obligatoire',
      cost: 'high',
      effectiveness: 80,
      compliance: ['CSA Z462 Annexe H', 'ASTM F1506', 'CSA Z94.4'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // DANGERS GAZIERS
  gas_leak: [
    {
      id: 'gas_001',
      hazardId: 'gas_leak',
      type: 'elimination',
      measure: 'Purge et isolation du système',
      description: 'Vidange complète et isolation des canalisations',
      implementation: 'Procédure de purge avec gaz inerte (azote)',
      responsible: 'Technicien gazier qualifié',
      timeline: 'Avant début travaux',
cost: 'medium',
name: 'Protection par disjoncteur différentiel',
hierarchy: 'engineering',
timeToImplement: 'Installation permanente',
applicableHazards: ['electrical_shock'],
      effectiveness: 95,
      compliance: ['CSA Z662', 'Règlement sur la sécurité des pipelines'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'gas_002',
      hazardId: 'gas_leak',
      type: 'engineering',
      measure: 'Détection de gaz continue',
      description: 'Système de détection multi-gaz avec alarmes',
      implementation: 'Détecteurs fixes et portables avec seuils LIE',
      responsible: 'Technicien instrumentation',
      timeline: 'Surveillance continue',
cost: 'high',
name: 'Équipements de protection individuelle',
hierarchy: 'ppe',
timeToImplement: 'Port obligatoire',
applicableHazards: ['electrical_shock'],
      effectiveness: 90,
      compliance: ['CSA Z662 Clause 10', 'CSA Z1611'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // DANGERS DE CHUTE
  falls: [
    {
      id: 'fall_001',
      hazardId: 'falls',
      type: 'elimination',
      measure: 'Travail au sol ou plateforme permanente',
      description: 'Élimination du travail en hauteur par conception',
      implementation: 'Réorganisation méthodes de travail, équipements mobiles',
      responsible: 'Planificateur travaux',
      timeline: 'Phase conception',
      cost: 'medium',
      effectiveness: 100,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'fall_002',
      hazardId: 'falls',
      type: 'engineering',
      measure: 'Garde-corps et protection collective',
      description: 'Installation garde-corps conformes ou filets de sécurité',
      implementation: 'Garde-corps h=1070mm avec main courante et plinthe',
      responsible: 'Installateur certifié',
      timeline: 'Avant accès en hauteur',
      cost: 'medium',
      effectiveness: 90,
      compliance: ['RSST Article 2.9.1', 'CSA Z259.16'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'fall_003',
      hazardId: 'falls',
      type: 'ppe',
      measure: 'Système d\'arrêt de chute',
      description: 'Harnais avec longe et point d\'ancrage certifié',
      implementation: 'Harnais intégral avec longe absorption énergie',
      responsible: 'Travailleur formé',
      timeline: 'Port obligatoire >3m',
      cost: 'medium',
      effectiveness: 75,
      compliance: ['RSST Article 2.10.15', 'CSA Z259 série', 'ANSI Z359'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ],

  // MESURES GÉNÉRIQUES POUR AUTRES DANGERS
  default: [
    {
      id: 'def_001',
      hazardId: 'default',
      type: 'elimination',
      measure: 'Élimination du danger',
      description: 'Suppression complète du danger par conception',
      implementation: 'Modification process, équipements, méthodes',
      responsible: 'Concepteur/Ingénieur',
      timeline: 'Phase conception',
      cost: 'high',
      effectiveness: 100,
      compliance: ['Hiérarchie CSA Z1002'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_002',
      hazardId: 'default',
      type: 'substitution',
      measure: 'Substitution par alternative plus sûre',
      description: 'Remplacement par solution moins dangereuse',
      implementation: 'Analyse comparative risques/bénéfices',
      responsible: 'Spécialiste technique',
      timeline: 'Phase planification',
      cost: 'medium',
      effectiveness: 85,
      compliance: ['Hiérarchie CSA Z1002'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_003',
      hazardId: 'default',
      type: 'engineering',
      measure: 'Contrôles techniques',
      description: 'Mesures techniques de protection',
      implementation: 'Installation dispositifs, systèmes automatiques',
      responsible: 'Ingénieur sécurité',
      timeline: 'Installation avant travaux',
      cost: 'medium',
      effectiveness: 75,
      compliance: ['Normes techniques applicables'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_004',
      hazardId: 'default',
      type: 'administrative',
      measure: 'Contrôles administratifs',
      description: 'Procédures, formation, surveillance',
      implementation: 'Rédaction procédures, formation personnel',
      responsible: 'Responsable sécurité',
      timeline: 'Avant début travaux',
cost: 'low',
certification: 'CSA Z94.3, ANSI Z87.1',
      effectiveness: 60,
      compliance: ['Système de gestion SST'],
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: 'def_005',
      hazardId: 'default',
      type: 'ppe',
      measure: 'Équipements de protection individuelle',
      description: 'EPI adaptés au risque spécifique',
      implementation: 'Sélection, formation, maintenance EPI',
      responsible: 'Travailleur formé',
      timeline: 'Port obligatoire',
      cost: 'low',
      effectiveness: 50,
      compliance: ['CSA Z94 série', 'RSST Article 2.10'],
      isSelected: false,
      photos: [],
      notes: ''
    }
  ]
};

// =================== BASE DE DONNÉES COMPLÈTE DES 39 DANGERS ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  // DANGERS ÉLECTRIQUES (1-5)
  {
    id: 'electrical_shock',
    code: 'ELEC-001',
    title: 'Choc électrique',
    description: 'Contact direct ou indirect avec parties sous tension',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['electrical_shock'],
    showControls: false
  },
  {
    id: 'arc_flash',
    code: 'ELEC-002',
    title: 'Arc électrique',
    description: 'Décharge électrique dans l\'air entre conducteurs',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['arc_flash'],
    showControls: false
  },
  {
    id: 'electrical_burns',
    code: 'ELEC-003',
    title: 'Brûlures électriques',
    description: 'Brûlures causées par passage courant ou arc électrique',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'electromagnetic_fields',
    code: 'ELEC-004',
    title: 'Champs électromagnétiques',
    description: 'Exposition aux rayonnements électromagnétiques',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'static_electricity',
    code: 'ELEC-005',
    title: 'Électricité statique',
    description: 'Accumulation charges électrostatiques',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS GAZIERS ET CHIMIQUES (6-12)
  {
    id: 'gas_leak',
    code: 'GAZ-001',
    title: 'Fuite de gaz',
    description: 'Échappement non contrôlé de gaz combustible ou toxique',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['gas_leak'],
    showControls: false
  },
  {
    id: 'explosion',
    code: 'GAZ-002',
    title: 'Explosion',
    description: 'Combustion rapide en espace confiné ou nuage gazeux',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'fire',
    code: 'FEU-001',
    title: 'Incendie',
    description: 'Combustion non contrôlée de matières inflammables',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'toxic_exposure',
    code: 'CHIM-001',
    title: 'Exposition substances toxiques',
    description: 'Contact avec substances chimiques dangereuses',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'chemical_burns',
    code: 'CHIM-002',
    title: 'Brûlures chimiques',
    description: 'Lésions cutanées par contact substances corrosives',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'asphyxiation',
    code: 'RESP-001',
    title: 'Asphyxie',
    description: 'Manque d\'oxygène ou présence gaz inertes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'oxygen_deficiency',
    code: 'RESP-002',
    title: 'Déficience en oxygène',
    description: 'Concentration oxygène inférieure à 19,5%',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS PHYSIQUES ET MÉCANIQUES (13-23)
  {
    id: 'falls',
    code: 'CHUTE-001',
    title: 'Chutes de hauteur',
    description: 'Chute depuis une surface élevée',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['falls'],
    showControls: false
  },
  {
    id: 'struck_by_objects',
    code: 'IMPACT-001',
    title: 'Heurt par objets',
    description: 'Impact par objets en mouvement ou qui tombent',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'cuts_lacerations',
    code: 'COUP-001',
    title: 'Coupures et lacérations',
    description: 'Blessures par objets tranchants ou coupants',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'mechanical_hazards',
    code: 'MECA-001',
    title: 'Dangers mécaniques',
    description: 'Risques liés aux machines et équipements mécaniques',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'heavy_equipment',
    code: 'EQUIP-001',
    title: 'Équipements lourds',
    description: 'Risques associés aux véhicules et machines lourdes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'vehicle_traffic',
    code: 'CIRC-001',
    title: 'Circulation véhiculaire',
    description: 'Risques liés à la proximité de véhicules en circulation',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'train_traffic',
    code: 'FERRO-001',
    title: 'Circulation ferroviaire',
    description: 'Risques près des voies ferrées et trains',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'cave_in',
    code: 'EFFON-001',
    title: 'Effondrement',
    description: 'Affaissement de sols, tranchées ou structures',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'underground_utilities',
    code: 'SOUS-001',
    title: 'Services souterrains',
    description: 'Contact accidentel avec services publics enterrés',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'engulfment',
    code: 'ENGL-001',
    title: 'Engloutissement',
    description: 'Submersion dans matériaux fluides ou granulaires',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'electrical_lines',
    code: 'LIGNE-001',
    title: 'Lignes électriques',
    description: 'Proximité ou contact avec lignes électriques aériennes',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS BIOLOGIQUES (24-26)
  {
    id: 'biological_hazards',
    code: 'BIO-001',
    title: 'Dangers biologiques',
    description: 'Exposition à agents biologiques pathogènes',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'insect_stings',
    code: 'BIO-002',
    title: 'Piqûres d\'insectes',
    description: 'Piqûres ou morsures d\'insectes venimeux',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'animal_attacks',
    code: 'BIO-003',
    title: 'Attaques d\'animaux',
    description: 'Attaques par animaux sauvages ou domestiques',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS ERGONOMIQUES (27-29)
  {
    id: 'ergonomic_hazards',
    code: 'ERGO-001',
    title: 'Dangers ergonomiques',
    description: 'Contraintes physiques et posturales',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'manual_handling',
    code: 'MANU-001',
    title: 'Manutention manuelle',
    description: 'Soulèvement, transport, manipulation objets lourds',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'repetitive_motion',
    code: 'REPE-001',
    title: 'Mouvements répétitifs',
    description: 'Gestes répétés sur périodes prolongées',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS ENVIRONNEMENTAUX (30-35)
  {
    id: 'weather_exposure',
    code: 'METEO-001',
    title: 'Exposition météorologique',
    description: 'Exposition conditions météorologiques extrêmes',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'heat_stress',
    code: 'CHAL-001',
    title: 'Stress thermique',
    description: 'Exposition à chaleur excessive',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'cold_exposure',
    code: 'FROID-001',
    title: 'Exposition au froid',
    description: 'Exposition à températures froides extrêmes',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'uv_radiation',
    code: 'UV-001',
    title: 'Rayonnement UV',
    description: 'Exposition rayonnement ultraviolet solaire',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'wind_exposure',
    code: 'VENT-001',
    title: 'Exposition au vent',
    description: 'Exposition à vents forts et rafales',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'precipitation',
    code: 'PREC-001',
    title: 'Précipitations',
    description: 'Pluie, neige, grêle affectant sécurité',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },

  // DANGERS PHYSIQUES SPÉCIALISÉS (36-39)
  {
    id: 'noise',
    code: 'BRUIT-001',
    title: 'Bruit excessif',
    description: 'Exposition à niveaux sonores élevés',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'vibration',
    code: 'VIBR-001',
    title: 'Vibrations',
    description: 'Exposition vibrations corps entier ou main-bras',
    riskLevel: 'medium',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'radiation',
    code: 'RAD-001',
    title: 'Rayonnements',
    description: 'Exposition rayonnements ionisants ou non-ionisants',
    riskLevel: 'high',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  },
  {
    id: 'lockout_tagout',
    code: 'LOTO-001',
    title: 'Énergies dangereuses',
    description: 'Remise en marche inattendue d\'équipements',
    riskLevel: 'critical',
    isSelected: false,
    additionalNotes: '',
    controlMeasures: predefinedControlMeasures['default'],
    showControls: false
  }
];

// =================== FONCTION POUR ASSIGNER LES MESURES DE CONTRÔLE ===================
const assignControlMeasures = (hazardId: string): ControlMeasure[] => {
  return predefinedControlMeasures[hazardId] || predefinedControlMeasures['default'];
};

// =================== FONCTION MISE À JOUR POUR FILTRER DANGERS PAR TYPE DE TRAVAIL ===================
const getHazardsByWorkTypeComplete = (workTypeId: string): ElectricalHazard[] => {
  const workType = WORK_TYPES.find(wt => wt.id === workTypeId);
  if (!workType) return [];
  
  return predefinedElectricalHazards.filter(hazard => 
    workType.baseHazards.includes(hazard.id)
  );
};

// =================== FONCTION DE CALCUL DE RISQUE ===================
const calculateRiskScore = (hazard: ElectricalHazard): number => {
  const riskValues = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  const baseRisk = riskValues[hazard.riskLevel];
  const selectedControlsEffectiveness = hazard.controlMeasures
    .filter(c => c.isSelected)
    .reduce((sum, c) => sum + c.effectiveness, 0) / 100;
  
  const residualRisk = Math.max(0.1, baseRisk * (1 - selectedControlsEffectiveness * 0.8));
  return Math.round(residualRisk * 100) / 100;
};
// =================== AST SECTION 4/8 - ÉQUIPEMENTS DE SÉCURITÉ ÉTENDUS ===================

// =================== BASE DE DONNÉES COMPLÈTE DES ÉQUIPEMENTS DE SÉCURITÉ ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  // PROTECTION TÊTE
  {
    id: 'hardhat_class_e',
    name: 'Casque de sécurité Classe E',
    category: 'head',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Casque isolant électrique jusqu\'à 20 000V',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe E'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
cost: 'medium',
certification: 'CSA Z94.3, ANSI Z87.1, CSA W117.2',
    supplier: 'MSA, 3M, Honeywell'
  },
  {
    id: 'hardhat_standard',
    name: 'Casque de sécurité standard',
    category: 'head',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre chocs et objets qui tombent',
    certifications: ['CSA Z94.1', 'ANSI Z89.1 Classe G'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '5 ans ou selon usure',
cost: 'low',
certification: 'CSA Z94.3, ANSI Z87.1',
    supplier: 'MSA, 3M, Honeywell, Bullard'
  },

  // PROTECTION OCULAIRE
  {
    id: 'safety_glasses',
    name: 'Lunettes de sécurité',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre impacts et projections',
    certifications: ['CSA Z94.3', 'ANSI Z87.1'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2 ans ou selon rayures',
cost: 'low',
    supplier: 'Uvex, 3M, Honeywell, Jackson Safety'
  },
  {
    id: 'welding_helmet',
    name: 'Masque de soudage',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre rayonnements de soudage',
    certifications: ['CSA Z94.3', 'ANSI Z87.1', 'CSA W117.2'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '3-5 ans selon usage',
cost: 'medium',
    supplier: 'Lincoln Electric, Miller, ESAB, 3M'
  },
  {
    id: 'face_shield',
    name: 'Écran facial',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection complète du visage',
    certifications: ['CSA Z94.3', 'ANSI Z87.1'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2 ans ou selon dommages',
cost: 'low',
    supplier: '3M, Honeywell, Uvex'
  },

  // PROTECTION RESPIRATOIRE
  {
    id: 'n95_respirator',
    name: 'Masque N95',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre particules non-huileuses',
    certifications: ['NIOSH N95', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Usage unique ou selon contamination',
cost: 'low',
    supplier: '3M, Honeywell, Moldex'
  },
  {
    id: 'half_face_respirator',
    name: 'Demi-masque respiratoire',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre vapeurs et gaz avec cartouches',
    certifications: ['NIOSH', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans (masque), cartouches selon exposition',
cost: 'medium',
    supplier: '3M, Honeywell, MSA, Moldex'
  },
  {
    id: 'scba',
    name: 'Appareil respiratoire autonome',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Air respirable autonome pour espaces confinés',
    certifications: ['NIOSH', 'CSA Z94.4', 'NFPA 1981'],
    inspectionFrequency: 'Quotidienne et après chaque usage',
    lifespan: '15 ans selon maintenance',
cost: 'high',
    supplier: 'MSA, Scott Safety, Dräger'
  },

  // PROTECTION MAINS
  {
    id: 'electrical_gloves',
    name: 'Gants isolants électriques',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Gants diélectriques avec surgants cuir',
    certifications: ['ASTM D120', 'IEC 60903', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation + test 6 mois',
    lifespan: '3 ans ou selon tests',
cost: 'medium',
    supplier: 'Salisbury, Cementex, Regeltex'
  },
  {
    id: 'cut_resistant_gloves',
    name: 'Gants anti-coupure',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre coupures niveau A2-A5',
    certifications: ['ANSI/ISEA 105', 'EN 388', 'CSA Z94.4'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '3-6 mois selon usage',
cost: 'low',
    supplier: 'Ansell, HexArmor, MCR Safety, Superior Glove'
  },
  {
    id: 'chemical_gloves',
    name: 'Gants chimiques',
    category: 'hand',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre produits chimiques spécifiques',
    certifications: ['ASTM F739', 'EN 374', 'CSA Z94.4'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: 'Selon tableau perméation',
cost: 'low',
    supplier: 'Ansell, Showa, Mapa, MCR Safety'
  },

  // PROTECTION PIEDS
  {
    id: 'safety_boots_steel',
    name: 'Bottes à embout d\'acier',
    category: 'foot',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre écrasement et perforation',
    certifications: ['CSA Z195', 'ASTM F2413'],
    inspectionFrequency: 'Hebdomadaire',
    lifespan: '12-18 mois selon usage',
cost: 'medium',
    supplier: 'Dakota, Terra, Timberland PRO, Caterpillar'
  },
  {
    id: 'dielectric_boots',
    name: 'Bottes diélectriques',
    category: 'foot',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Isolation électrique et protection mécanique',
    certifications: ['ASTM F2413 EH', 'CSA Z195', 'ASTM F1117'],
    inspectionFrequency: 'Quotidienne + test annuel',
    lifespan: '2-3 ans selon tests',
cost: 'high',
    supplier: 'Salisbury, Cementex, NASCO'
  },

  // PROTECTION CORPS
  {
    id: 'high_vis_vest',
    name: 'Veste haute visibilité',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Visibilité jour/nuit avec bandes rétroréfléchissantes',
    certifications: ['CSA Z96', 'ANSI/ISEA 107'],
    inspectionFrequency: 'Quotidienne',
    lifespan: '2-3 ans selon lavages',
cost: 'low',
    supplier: 'Forcefield, ML Kishigo, PIP, Radians'
  },
  {
    id: 'arc_flash_suit',
    name: 'Vêtement résistant à l\'arc',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Protection contre arc électrique selon cal/cm²',
    certifications: ['ASTM F1506', 'NFPA 70E', 'CSA Z462'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans ou selon dommages',
cost: 'high',
    supplier: 'Salisbury, Oberon, National Safety Apparel'
  },
  {
    id: 'chemical_suit',
    name: 'Combinaison chimique',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    notes: '',
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
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    notes: '',
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
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    notes: '',
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
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Point d\'ancrage mobile ou permanent >22kN',
    certifications: ['CSA Z259.15', 'ANSI Z359.18'],
    inspectionFrequency: 'Avant installation',
    lifespan: '10 ans selon inspection',
cost: 'high',
    supplier: '3M, MSA, Miller, Guardian Fall'
  },

  // PROTECTION ÉLECTRIQUE
  {
    id: 'electrical_mat',
    name: 'Tapis isolant',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Isolation au sol pour travaux électriques',
    certifications: ['ASTM D178', 'IEC 61111'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '10 ans ou selon tests',
    cost: '200-800 CAD',
    supplier: 'Salisbury, Cementex, NASCO'
  },
  {
    id: 'insulating_stick',
    name: 'Perche isolante',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Perche isolante pour manœuvres à distance',
    certifications: ['ASTM F711', 'IEC 60855'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '10 ans selon tests',
cost: 'high',
    supplier: 'Salisbury, Cementex, NASCO'
  },
  {
    id: 'voltage_tester',
    name: 'Vérificateur d\'absence de tension',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'VAT certifié pour vérification sécuritaire',
    certifications: ['CSA Z462', 'IEC 61243-3'],
    inspectionFrequency: 'Avant chaque utilisation',
    lifespan: '5 ans selon calibration',
    cost: '150-500 CAD',
    supplier: 'Fluke, Klein Tools, Ideal'
  },

  // DÉTECTION
  {
    id: 'gas_detector_4_gas',
    name: 'Détecteur 4 gaz',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Détection O₂, LIE, CO, H₂S avec alarmes',
    certifications: ['CSA C22.2', 'ATEX', 'IECEx'],
    inspectionFrequency: 'Calibration quotidienne',
    lifespan: '3-5 ans selon capteurs',
    cost: '800-2000 CAD',
    supplier: 'Honeywell, MSA, Dräger, Industrial Scientific'
  },
  {
    id: 'h2s_detector',
    name: 'Détecteur H₂S personnel',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Détection sulfure d\'hydrogène personnel',
    certifications: ['CSA C22.2', 'ATEX'],
    inspectionFrequency: 'Calibration hebdomadaire',
    lifespan: '2-3 ans selon capteur',
    cost: '300-600 CAD',
    supplier: 'Honeywell, MSA, Dräger'
  },
  {
    id: 'sound_level_meter',
    name: 'Sonomètre',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    notes: '',
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
    category: 'other',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Trousse conforme réglementation provinciale',
    certifications: ['CSA Z1220', 'Réglementation provinciale'],
    inspectionFrequency: 'Mensuelle',
    lifespan: 'Remplacement selon péremption',
    cost: '50-200 CAD',
    supplier: 'Johnson & Johnson, Honeywell, Acme United'
  },
  {
    id: 'emergency_shower',
    name: 'Douche d\'urgence portable',
    category: 'other',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Douche et lave-yeux d\'urgence portable',
    certifications: ['ANSI Z358.1', 'CSA Z1611'],
    inspectionFrequency: 'Hebdomadaire',
    lifespan: '5 ans avec maintenance',
    cost: '500-2000 CAD',
    supplier: 'Haws, Bradley, Speakman, Guardian'
  },
  {
    id: 'emergency_stretcher',
    name: 'Civière d\'évacuation',
    category: 'other',
    required: false,
    available: false,
    verified: false,
    notes: '',
    description: 'Civière pour évacuation d\'urgence',
    certifications: ['CSA Z1220'],
    inspectionFrequency: 'Mensuelle',
    lifespan: '10 ans selon entretien',
    cost: '200-800 CAD',
    supplier: 'Ferno, Stryker, Spencer'
  }
];

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    // Interface générale
    title: 'Nouvelle Analyse Sécuritaire de Tâches',
    subtitle: 'Formulaire adaptatif conforme aux normes SST',
    saving: 'Sauvegarde en cours...',
    saved: '✅ Sauvegardé avec succès',
    
    counters: {
      onJob: 'Sur la job',
      approved: 'Approuvé AST', 
      approvalRate: 'Taux d\'approbation',
      consultation: 'Consultation',
      criticalHazards: 'Dangers critiques'
    },
    
    steps: {
      general: 'Informations Générales',
      equipment: 'Équipements Sécurité',
      hazards: 'Dangers & Risques',
      discussion: 'Discussion Équipe', 
      isolation: 'Points d\'Isolement',
      team: 'Équipe de Travail',
      documentation: 'Photos & Documentation', 
      validation: 'Validation & Signatures'
    },
    
    projectInfo: {
      title: 'Informations du Projet',
      industry: 'Type d\'Industrie',
      astNumber: '# AST',
      astClientNumber: '# AST du Client', 
      date: 'Date',
      client: 'Client',
      clientPhone: '# Téléphone Client',
      projectNumber: 'Numéro de Projet',
      workDescription: 'Description des Travaux',
      workLocation: 'Lieu des Travaux',
      clientRepresentative: 'Nom du Responsable',
      clientRepresentativePhone: '# Téléphone Responsable',
      workerCount: 'Nombre de personnes sur la job',
      estimatedDuration: 'Durée Estimée',
      emergencyContact: 'Contact d\'Urgence',
      emergencyPhone: '# Urgence',
      astInfo: 'Numéro généré automatiquement - usage unique',
      astClientInfo: 'Numéro fourni par le client (optionnel)'
    },
    
    teamDiscussion: {
      title: 'Discussion avec l\'Équipe',
      subtitle: 'Information à discuter avec l\'équipe',
      completed: 'Complété',
      pending: 'En attente', 
      discussedBy: 'Discuté par',
      notes: 'Notes',
      priority: 'Priorité'
    },
    
    safetyEquipment: {
      title: 'Équipement de Protection Individuel et Collectif',
      required: 'Requis',
      available: 'Disponible',
      verified: 'Vérifié', 
      notes: 'Notes',
      categories: {
        head: 'Protection Tête',
        eye: 'Protection Yeux',
        respiratory: 'Protection Respiratoire',
        hand: 'Protection Mains', 
        foot: 'Protection Pieds',
        body: 'Protection Corps',
        fall: 'Protection Chute',
        electrical: 'Protection Électrique',
        detection: 'Détection',
        other: 'Autre'
      }
    },
    
    hazards: {
      title: 'Dangers Potentiels',
      selected: 'Sélectionné',
      riskLevel: 'Niveau de Risque',
      notes: 'Notes supplémentaires',
      controlMeasures: 'Mesures de Contrôle',
      controlsRequired: '⚠️ Mesures de contrôle requises',
      controlsInPlace: 'VIGILANCE - Mesures de contrôle en place',
      addCustomHazard: 'Ajouter un danger personnalisé',
      levels: {
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevé', 
        critical: 'Critique'
      },
      categories: {
        elimination: 'Élimination',
        substitution: 'Substitution',
        engineering: 'Contrôles techniques',
        administrative: 'Contrôles administratifs',
        ppe: 'EPI'
      }
    },
    
    team: {
      title: 'Équipe de Travail',
      supervisor: 'Superviseur',
      addMember: 'Ajouter Membre d\'Équipe',
      memberName: 'Nom du Membre',
      employeeId: 'ID Employé',
      department: 'Département', 
      qualification: 'Qualification',
      validation: 'Validation Équipe',
      consultationAst: 'Consultation AST',
      cadenasAppose: 'Cadenas Apposé',
      cadenasReleve: 'Cadenas Relevé',
      status: 'Statut',
      actions: 'Actions',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    },
    
    isolation: {
      title: 'Points d\'Isolement',
      addPoint: 'Ajouter Point d\'Isolement',
      pointName: 'Nom du Point d\'Isolement',
      isolationType: 'Type d\'Isolement',
      selectType: 'Sélectionner le type...',
      noPoints: 'Aucun point d\'isolement configuré',
      checklist: {
        cadenasAppose: 'Cadenas Apposé',
        absenceTension: 'Absence de Tension', 
        miseALaTerre: 'Mise à la Terre'
      }
    },
    
    actions: {
      sendByEmail: 'Envoyer par Courriel',
      archive: 'Archiver',
      generatePDF: 'Générer PDF',
      print: 'Imprimer',
      finalApproval: 'Soumission Finale'
    },
    
    buttons: {
      previous: 'Précédent',
      next: 'Suivant', 
      save: 'Sauvegarder',
      approve: 'Approuver',
      reject: 'Rejeter',
      add: 'Ajouter',
      edit: 'Modifier',
      delete: 'Supprimer'
    },

    email: {
      subject: 'AST - Analyse Sécuritaire de Tâches',
      body: 'Veuillez trouver ci-joint l\'Analyse Sécuritaire de Tâches pour votre révision.'
    }
  },
  
  en: {
    // Interface générale
    title: 'New Job Safety Analysis',
    subtitle: 'Adaptive form compliant with OHS standards', 
    saving: 'Saving...',
    saved: '✅ Successfully saved',
    
    counters: {
      onJob: 'On Job',
      approved: 'JSA Approved',
      approvalRate: 'Approval Rate',
      consultation: 'Consultation',
      criticalHazards: 'Critical Hazards'
    },
    
    steps: {
      general: 'General Information',
      equipment: 'Safety Equipment',
      hazards: 'Hazards & Risks',
      discussion: 'Team Discussion', 
      isolation: 'Isolation Points',
      team: 'Work Team',
      documentation: 'Photos & Documentation',
      validation: 'Validation & Signatures'
    },
    
    projectInfo: {
      title: 'Project Information',
      industry: 'Industry Type',
      astNumber: '# JSA',
      astClientNumber: '# Client JSA',
      date: 'Date',
      client: 'Client', 
      clientPhone: 'Client Phone #',
      projectNumber: 'Project Number',
      workDescription: 'Work Description',
      workLocation: 'Work Location',
      clientRepresentative: 'Representative Name',
      clientRepresentativePhone: 'Representative Phone #',
      workerCount: 'Number of people on job',
      estimatedDuration: 'Estimated Duration',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: 'Emergency Phone #',
      astInfo: 'Auto-generated unique number',
      astClientInfo: 'Client-provided number (optional)'
    },
    
    teamDiscussion: {
      title: 'Team Discussion',
      subtitle: 'Information to discuss with team',
      completed: 'Completed',
      pending: 'Pending',
      discussedBy: 'Discussed by', 
      notes: 'Notes',
      priority: 'Priority'
    },
    
    safetyEquipment: {
      title: 'Individual and Collective Protection Equipment',
      required: 'Required',
      available: 'Available',
      verified: 'Verified',
      notes: 'Notes',
      categories: {
        head: 'Head Protection',
        eye: 'Eye Protection', 
        respiratory: 'Respiratory Protection',
        hand: 'Hand Protection',
        foot: 'Foot Protection',
        body: 'Body Protection', 
        fall: 'Fall Protection',
        electrical: 'Electrical Protection',
        detection: 'Detection',
        other: 'Other'
      }
    },
    
    hazards: {
      title: 'Potential Hazards',
      selected: 'Selected',
      riskLevel: 'Risk Level', 
      notes: 'Additional notes',
      controlMeasures: 'Control Measures',
      controlsRequired: '⚠️ Control measures required',
      controlsInPlace: 'VIGILANCE - Control measures in place',
      addCustomHazard: 'Add custom hazard',
      levels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      categories: {
        elimination: 'Elimination',
        substitution: 'Substitution', 
        engineering: 'Engineering Controls',
        administrative: 'Administrative Controls',
        ppe: 'PPE'
      }
    },
    
    team: {
      title: 'Work Team',
      supervisor: 'Supervisor',
      addMember: 'Add Team Member',
      memberName: 'Member Name',
      employeeId: 'Employee ID',
      department: 'Department',
      qualification: 'Qualification',
      validation: 'Team Validation',
      consultationAst: 'JSA Consultation', 
      cadenasAppose: 'Lock Applied',
      cadenasReleve: 'Lock Removed',
      status: 'Status',
      actions: 'Actions',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    },
    
    isolation: {
      title: 'Isolation Points',
      addPoint: 'Add Isolation Point',
      pointName: 'Isolation Point Name',
      isolationType: 'Isolation Type',
      selectType: 'Select type...',
      noPoints: 'No isolation points configured',
      checklist: {
        cadenasAppose: 'Lock Applied',
        absenceTension: 'Absence of Voltage',
        miseALaTerre: 'Grounded'
      }
    },
    
    actions: {
      sendByEmail: 'Send by Email',
      archive: 'Archive', 
      generatePDF: 'Generate PDF',
      print: 'Print',
      finalApproval: 'Final Submission'
    },
    
    buttons: {
      previous: 'Previous',
      next: 'Next',
      save: 'Save',
      approve: 'Approve',
      reject: 'Reject',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete'
    },

    email: {
      subject: 'JSA - Job Safety Analysis',
      body: 'Please find attached the Job Safety Analysis for your review.'
    }
  }
};
// =================== AST SECTION 5/8 - DONNÉES INITIALES & UTILITAIRES ===================

// État initial complet du formulaire
const initialProjectInfo: ProjectInfo = {
  projectName: '',
  location: '',
  coordinates: { lat: 0, lng: 0 },
  description: '',
  startDate: '',
  duration: '',
  teamSize: '',
  workType: 'electrical',
  client: 'hydro-quebec',
  supervisor: '',
  contact: '',
  emergencyContact: '',
  permits: []
};

// Messages d'urgence prédéfinis
const emergencyMessages = {
  'hydro-quebec': {
    fr: "URGENCE ÉLECTRIQUE - Composez le 911 et Hydro-Québec au 1-800-790-2424",
    en: "ELECTRICAL EMERGENCY - Call 911 and Hydro-Québec at 1-800-790-2424"
  },
  'energir': {
    fr: "URGENCE GAZ - Composez le 911 et Énergir au 1-800-361-8003",
    en: "GAS EMERGENCY - Call 911 and Énergir at 1-800-361-8003"
  },
  'bell': {
    fr: "URGENCE TÉLÉCOMS - Composez le 911 et Bell au 1-800-667-0123",
    en: "TELECOM EMERGENCY - Call 911 and Bell at 1-800-667-0123"
  },
  'rogers': {
    fr: "URGENCE TÉLÉCOMS - Composez le 911 et Rogers au 1-888-764-3771",
    en: "TELECOM EMERGENCY - Call 911 and Rogers at 1-888-764-3771"
  },
  'videotron': {
    fr: "URGENCE TÉLÉCOMS - Composez le 911 et Vidéotron au 1-888-433-6876",
    en: "TELECOM EMERGENCY - Call 911 and Vidéotron at 1-888-433-6876"
  },
  'other': {
    fr: "URGENCE - Composez le 911 et contactez votre superviseur",
    en: "EMERGENCY - Call 911 and contact your supervisor"
  }
};

// Hook personnalisé pour la géolocalisation Google Maps
const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }
  }, []);

  return isLoaded;
};

// Hook pour les données météo
const useWeatherData = (coordinates: { lat: number; lng: number }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!coordinates.lat || !coordinates.lng) return;
    
    setLoading(true);
    try {
      // Simulation d'API météo - remplacer par vraie API
      const mockWeather: WeatherData = {
        temperature: Math.round(Math.random() * 30 - 10),
        condition: ['ensoleillé', 'nuageux', 'pluvieux', 'neigeux'][Math.floor(Math.random() * 4)] as any,
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 50),
        visibility: Math.round(Math.random() * 10 + 5),
        uvIndex: Math.round(Math.random() * 11),
        alerts: []
      };

      // Ajouter des alertes météo si conditions dangereuses
      if (mockWeather.temperature < -20) {
        mockWeather.alerts.push('Froid extrême - Risque d\'hypothermie');
      }
      if (mockWeather.windSpeed > 30) {
        mockWeather.alerts.push('Vents forts - Travail en hauteur déconseillé');
      }
      if (mockWeather.visibility < 3) {
        mockWeather.alerts.push('Visibilité réduite - Prudence accrue requise');
      }

      setWeather(mockWeather);
    } catch (error) {
      console.error('Erreur météo:', error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchWeather();
  }, [coordinates.lat, coordinates.lng, fetchWeather]);

  return { weather, loading, refetch: fetchWeather };
};

// Hook pour le partage équipe
const useTeamSharing = () => {
  const [consultationStatus, setConsultationStatus] = useState<TeamConsultationStatus>({
    sharedWith: [],
    responses: [],
    isActive: false,
    expiresAt: null
  });

  const shareWithTeam = async (members: string[], method: 'email' | 'sms' | 'whatsapp', astData: any) => {
    const shareId = `ast-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    try {
      // Simulation d'envoi - remplacer par vraie API
      console.log(`Partage AST via ${method} avec:`, members);
      
      setConsultationStatus({
        sharedWith: members,
        responses: [],
        isActive: true,
        expiresAt
      });

      // Générer lien de consultation
      const consultationLink = `${window.location.origin}/consultation/${shareId}`;
      
      return {
        success: true,
        shareId,
        consultationLink,
        message: `AST partagée avec ${members.length} membre(s) via ${method}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du partage'
      };
    }
  };

  const addResponse = (member: string, response: TeamResponse) => {
    setConsultationStatus(prev => ({
      ...prev,
      responses: [...prev.responses.filter(r => r.member !== member), { member, ...response }]
    }));
  };

  return {
    consultationStatus,
    shareWithTeam,
    addResponse
  };
};

// Fonctions utilitaires pour les calculs de risque
const calculateRiskLevel = (hazards: SelectedHazard[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (!hazards.length) return 'LOW';
  
  const maxSeverity = Math.max(...hazards.map(h => h.severity));
  const maxProbability = Math.max(...hazards.map(h => h.probability));
  const riskScore = maxSeverity * maxProbability;
  
  if (riskScore >= 15) return 'CRITICAL';
  if (riskScore >= 10) return 'HIGH';
  if (riskScore >= 5) return 'MEDIUM';
  return 'LOW';
};

const calculateResidualRisk = (hazard: SelectedHazard): number => {
  if (!hazard.controlMeasures?.length) return hazard.severity * hazard.probability;
  
  const totalEffectiveness = hazard.controlMeasures.reduce((total, measure) => {
    const controlMeasure = controlMeasuresDatabase.find(cm => cm.id === measure.id);
    return total + (controlMeasure?.effectiveness || 0);
  }, 0);
  
  const reductionFactor = Math.min(0.9, totalEffectiveness / 100);
  return Math.round((hazard.severity * hazard.probability) * (1 - reductionFactor));
};

const generateRiskMatrix = (hazards: SelectedHazard[]) => {
  const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
  
  hazards.forEach(hazard => {
    const residualRisk = calculateResidualRisk(hazard);
    const severity = Math.min(4, Math.max(0, Math.floor(residualRisk / 5)));
    const probability = Math.min(4, Math.max(0, Math.floor(residualRisk % 5)));
    matrix[severity][probability]++;
  });
  
  return matrix;
};

// Fonctions de validation et conformité
const validateComplianceRequirements = (hazards: SelectedHazard[], equipment: SelectedEquipment[]): {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Vérification des équipements obligatoires par danger
  hazards.forEach(hazard => {
    const hazardData = hazardsDatabase.find(h => h.id === hazard.hazardId);
    if (hazardData?.requiredEquipment?.length) {
      const missingEquipment = hazardData.requiredEquipment.filter(reqEquip => 
        !equipment.some(equip => equip.equipmentId === reqEquip)
      );
      
      if (missingEquipment.length > 0) {
        violations.push(`Équipement manquant pour ${hazardData.name}: ${missingEquipment.join(', ')}`);
      }
    }
  });
  
  // Vérifications spécifiques par type de danger
  const electricalHazards = hazards.filter(h => h.hazardId.startsWith('ELEC-'));
  if (electricalHazards.length > 0) {
    const hasElectricalPPE = equipment.some(e => 
      ['ELC-001', 'ELC-002', 'ELC-003'].includes(e.equipmentId)
    );
    if (!hasElectricalPPE) {
      violations.push('Équipement électrique spécialisé requis pour travaux électriques');
    }
  }
  
  const heightHazards = hazards.filter(h => h.hazardId === 'PHY-003');
  if (heightHazards.length > 0) {
    const hasFallProtection = equipment.some(e => 
      ['CHU-001', 'CHU-002', 'CHU-003'].includes(e.equipmentId)
    );
    if (!hasFallProtection) {
      violations.push('Équipement antichute obligatoire pour travail en hauteur');
    }
  }
  
  // Recommandations d'amélioration
  if (hazards.length > 5) {
    recommendations.push('Considérer la division du travail pour réduire l\'exposition aux risques');
  }
  
  const highRiskHazards = hazards.filter(h => h.severity * h.probability >= 15);
  if (highRiskHazards.length > 0) {
    recommendations.push('Révision par un superviseur requise pour les risques critiques');
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    recommendations
  };
};

// Fonctions de génération de documentation
const generateASTDocument = (formData: any): string => {
  const currentDate = new Date().toLocaleDateString('fr-CA');
  const riskLevel = calculateRiskLevel(formData.hazards || []);
  
  return `
ANALYSE DE SÉCURITÉ DU TRAVAIL (AST)
=====================================

INFORMATIONS GÉNÉRALES
----------------------
Projet: ${formData.projectInfo?.projectName || 'N/A'}
Lieu: ${formData.projectInfo?.location || 'N/A'}
Date: ${currentDate}
Type de travail: ${workTypes.find(w => w.id === formData.projectInfo?.workType)?.name || 'N/A'}
Client: ${clientConfigurations.find(c => c.id === formData.projectInfo?.client)?.name || 'N/A'}
Superviseur: ${formData.projectInfo?.supervisor || 'N/A'}

DANGERS IDENTIFIÉS
------------------
${formData.hazards?.map((h: SelectedHazard, index: number) => {
  const hazardData = hazardsDatabase.find(hd => hd.id === h.hazardId);
  return `${index + 1}. ${hazardData?.name || 'N/A'}
   Sévérité: ${h.severity}/5, Probabilité: ${h.probability}/5
   Risque résiduel: ${calculateResidualRisk(h)}/25`;
}).join('\n') || 'Aucun danger identifié'}

ÉQUIPEMENTS DE SÉCURITÉ
-----------------------
${formData.equipment?.map((e: SelectedEquipment, index: number) => {
  const equipData = equipmentDatabase.find(ed => ed.id === e.equipmentId);
  return `${index + 1}. ${equipData?.name || 'N/A'}
   Certification: ${equipData?.certification || 'N/A'}
   Inspection: ${e.inspectionDate || 'Non spécifiée'}`;
}).join('\n') || 'Aucun équipement spécifié'}

NIVEAU DE RISQUE GLOBAL: ${riskLevel}

VALIDATION
----------
Créé par: ${formData.projectInfo?.contact || 'N/A'}
Date de création: ${currentDate}
Statut: ${formData.consultationStatus?.isActive ? 'En consultation équipe' : 'Complété'}
  `;
};

// Export des fonctions utilitaires
export {
  initialProjectInfo,
  emergencyMessages,
  useGoogleMaps,
  useWeatherData,
  useTeamSharing,
  calculateRiskLevel,
  calculateResidualRisk,
  generateRiskMatrix,
  validateComplianceRequirements,
  generateASTDocument
};
// =================== AST SECTION 6/8 - COMPOSANT PRINCIPAL & ÉTAPES 1-4 ===================

const ASTFormUltraPremium: React.FC<ASTFormProps> = ({ tenant }) => {
  // États principaux
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initialProjectInfo);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [selectedHazards, setSelectedHazards] = useState<SelectedHazard[]>([]);
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTeamShare, setShowTeamShare] = useState(false);

  // Hooks personnalisés
  const isGoogleMapsLoaded = useGoogleMaps();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeatherData(projectInfo.coordinates);
  const { consultationStatus, shareWithTeam, addResponse } = useTeamSharing();

  // Référence pour Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  // Initialisation Google Maps
  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !map) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 45.5017, lng: -73.5673 }, // Montréal par défaut
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          setProjectInfo(prev => ({
            ...prev,
            coordinates: { lat, lng }
          }));

          if (marker) {
            marker.setPosition(e.latLng);
          } else {
            const newMarker = new google.maps.Marker({
              position: e.latLng,
              map: mapInstance,
              title: 'Lieu du travail'
            });
            setMarker(newMarker);
          }

          // Géocodage inverse pour obtenir l'adresse
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setProjectInfo(prev => ({
                ...prev,
                location: results[0].formatted_address
              }));
            }
          });
        }
      });

      setMap(mapInstance);
    }
  }, [isGoogleMapsLoaded, map, marker]);

  // Auto-sélection des dangers par type de travail
  useEffect(() => {
    if (projectInfo.workType) {
      const workTypeData = workTypes.find(wt => wt.id === projectInfo.workType);
      if (workTypeData?.baseHazards) {
        const autoSelectedHazards = workTypeData.baseHazards.map(hazardId => ({
          hazardId,
          severity: 3,
          probability: 3,
          notes: '',
          controlMeasures: []
        }));
        setSelectedHazards(autoSelectedHazards);
      }
    }
  }, [projectInfo.workType]);

  // Fonctions de navigation
  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Calculs de progression et statistiques
  const completionStats = {
    projectInfo: projectInfo.projectName && projectInfo.location && projectInfo.workType ? 100 : 50,
    equipment: selectedEquipment.length > 0 ? 100 : 0,
    hazards: selectedHazards.length > 0 ? 100 : 0,
    permits: workPermits.length > 0 ? 100 : 0
  };

  const overallProgress = Math.round(
    (completionStats.projectInfo + completionStats.equipment + completionStats.hazards + completionStats.permits) / 4
  );

  const riskLevel = calculateRiskLevel(selectedHazards);
  const complianceCheck = validateComplianceRequirements(selectedHazards, selectedEquipment);

  // Rendu des étapes
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                {translations[language].projectInfo}
              </h3>
              
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {translations[language].projectName} *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.projectName}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'fr' ? 'Ex: Installation transformateur' : 'Ex: Transformer installation'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de travail *
                  </label>
                  <select
                    value={projectInfo.workType}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, workType: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {workTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {getWorkTypeIcon(type.id)} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    value={projectInfo.client}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, client: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {clientConfigurations.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superviseur *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.supervisor}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, supervisor: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom du superviseur"
                  />
                </div>
              </div>

              {/* Sélection de lieu avec Google Maps */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu du travail *
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={projectInfo.location}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse du projet ou cliquez sur la carte"
                  />
                  
                  {isGoogleMapsLoaded && (
                    <div className="relative">
                      <div 
                        ref={mapRef} 
                        className="w-full h-64 rounded-lg border border-gray-300"
                      />
                      <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
                        📍 Cliquez pour sélectionner le lieu exact
                      </div>
                      {projectInfo.coordinates.lat !== 0 && (
                        <div className="absolute bottom-2 right-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
                          {projectInfo.coordinates.lat.toFixed(6)}, {projectInfo.coordinates.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates et équipe */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={projectInfo.startDate}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée
                  </label>
                  <input
                    type="text"
                    value={projectInfo.duration}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 4 heures, 2 jours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de l'équipe
                  </label>
                  <input
                    type="number"
                    value={projectInfo.teamSize}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, teamSize: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de personnes"
                    min="1"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du travail
                </label>
                <textarea
                  value={projectInfo.description}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Décrivez brièvement les tâches à effectuer..."
                />
              </div>

              {/* Contacts d'urgence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact principal
                  </label>
                  <input
                    type="text"
                    value={projectInfo.contact}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, contact: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom et téléphone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact d'urgence
                  </label>
                  <input
                    type="text"
                    value={projectInfo.emergencyContact}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact d'urgence"
                  />
                </div>
              </div>

              {/* Message d'urgence spécifique au client */}
              {projectInfo.client && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Procédure d'urgence</span>
                  </div>
                  <p className="text-red-700">
                    {emergencyMessages[projectInfo.client]?.[language] || emergencyMessages.other[language]}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                {translations[language].safetyEquipment}
              </h3>

              {/* Filtre par catégorie */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', ...new Set(equipmentDatabase.map(e => e.category))].map(category => (
                    <button
                      key={category}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Logique de filtrage (à implémenter si nécessaire)
                      }}
                    >
                      {category === 'all' ? 'Tous' : translations[language].equipmentCategories?.[category] || category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des équipements */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentDatabase.map(equipment => {
                  const isSelected = selectedEquipment.some(e => e.equipmentId === equipment.id);
                  const selectedEquip = selectedEquipment.find(e => e.equipmentId === equipment.id);

                  return (
                    <div
                      key={equipment.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedEquipment(prev => prev.filter(e => e.equipmentId !== equipment.id));
                        } else {
                          setSelectedEquipment(prev => [...prev, {
                            equipmentId: equipment.id,
                            quantity: 1,
                            inspectionDate: '',
                            condition: 'good'
                          }]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{equipment.name}</h4>
                        {isSelected && <CheckCircle className="w-5 h-5 text-green-600" />}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Certification:</strong> {equipment.certification}</p>
                        <p><strong>Fournisseur:</strong> {equipment.supplier}</p>
                        <p><strong>Coût:</strong> ${equipment.cost}</p>
                        <p><strong>Inspection:</strong> {equipment.inspectionFrequency}</p>
                      </div>

                      {isSelected && (
                        <div className="mt-4 space-y-2" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="1"
                              value={selectedEquip?.quantity || 1}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value);
                                setSelectedEquipment(prev => prev.map(eq => 
                                  eq.equipmentId === equipment.id 
                                    ? { ...eq, quantity }
                                    : eq
                                ));
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Qté"
                            />
                            <select
                              value={selectedEquip?.condition || 'good'}
                              onChange={(e) => {
                                setSelectedEquipment(prev => prev.map(eq => 
                                  eq.equipmentId === equipment.id 
                                    ? { ...eq, condition: e.target.value as any }
                                    : eq
                                ));
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              <option value="excellent">Excellent</option>
                              <option value="good">Bon</option>
                              <option value="fair">Acceptable</option>
                              <option value="poor">Mauvais</option>
                            </select>
                          </div>
                          
                          <input
                            type="date"
                            value={selectedEquip?.inspectionDate || ''}
                            onChange={(e) => {
                              setSelectedEquipment(prev => prev.map(eq => 
                                eq.equipmentId === equipment.id 
                                  ? { ...eq, inspectionDate: e.target.value }
                                  : eq
                              ));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Date d'inspection"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Résumé des équipements sélectionnés */}
              {selectedEquipment.length > 0 && (
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Équipements sélectionnés ({selectedEquipment.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedEquipment.map(equip => {
                      const equipData = equipmentDatabase.find(e => e.id === equip.equipmentId);
                      return (
                        <div key={equip.equipmentId} className="flex justify-between text-sm">
                          <span>{equipData?.name} (x{equip.quantity})</span>
                          <span className="text-green-700">${((equipData?.cost || 0) * equip.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-green-300 pt-2 font-semibold">
                      <div className="flex justify-between">
                        <span>Total estimé:</span>
                        <span>${selectedEquipment.reduce((total, equip) => {
                          const equipData = equipmentDatabase.find(e => e.id === equip.equipmentId);
                          return total + ((equipData?.cost || 0) * equip.quantity);
                        }, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                {translations[language].hazardIdentification}
              </h3>

              {/* Filtre par type de danger */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'electrical', 'gas', 'physical', 'biological', 'ergonomic', 'environmental'].map(type => (
                    <button
                      key={type}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Logique de filtrage par type
                      }}
                    >
                      {type === 'all' ? 'Tous' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des dangers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hazardsDatabase.map(hazard => {
                  const isSelected = selectedHazards.some(h => h.hazardId === hazard.id);
                  const selectedHazard = selectedHazards.find(h => h.hazardId === hazard.id);

                  return (
                    <div
                      key={hazard.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedHazards(prev => prev.filter(h => h.hazardId !== hazard.id));
                        } else {
                          setSelectedHazards(prev => [...prev, {
                            hazardId: hazard.id,
                            severity: 3,
                            probability: 3,
                            notes: '',
                            controlMeasures: []
                          }]);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{hazard.name}</h4>
                          <p className="text-xs text-gray-500">{hazard.code}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-yellow-600" />}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{hazard.description}</p>
                      
                      {hazard.regulations && (
                        <div className="text-xs text-blue-600 mb-2">
                          📋 {hazard.regulations.join(', ')}
                        </div>
                      )}

                      {isSelected && (
                        <div className="mt-4 space-y-3" onClick={e => e.stopPropagation()}>
                          {/* Évaluation de risque */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Sévérité (1-5)
                              </label>
                              <select
                                value={selectedHazard?.severity || 3}
                                onChange={(e) => {
                                  const severity = parseInt(e.target.value);
                                  setSelectedHazards(prev => prev.map(h => 
                                    h.hazardId === hazard.id 
                                      ? { ...h, severity }
                                      : h
                                  ));
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              >
                                <option value={1}>1 - Négligeable</option>
                                <option value={2}>2 - Mineur</option>
                                <option value={3}>3 - Modéré</option>
                                <option value={4}>4 - Majeur</option>
                                <option value={5}>5 - Catastrophique</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Probabilité (1-5)
                              </label>
                              <select
                                value={selectedHazard?.probability || 3}
                                onChange={(e) => {
                                  const probability = parseInt(e.target.value);
                                  setSelectedHazards(prev => prev.map(h => 
                                    h.hazardId === hazard.id 
                                      ? { ...h, probability }
                                      : h
                                  ));
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              >
                                <option value={1}>1 - Très rare</option>
                                <option value={2}>2 - Peu probable</option>
                                <option value={3}>3 - Possible</option>
                                <option value={4}>4 - Probable</option>
                                <option value={5}>5 - Très probable</option>
                              </select>
                            </div>
                          </div>

                          {/* Indicateur de risque */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Niveau de risque:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 15 ? 'bg-red-100 text-red-800' :
                              (selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 10 ? 'bg-orange-100 text-orange-800' :
                              (selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {(selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 15 ? 'CRITIQUE' :
                               (selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 10 ? 'ÉLEVÉ' :
                               (selectedHazard?.severity || 3) * (selectedHazard?.probability || 3) >= 5 ? 'MOYEN' : 'FAIBLE'}
                            </span>
                          </div>

                          {/* Notes */}
                          <textarea
                            value={selectedHazard?.notes || ''}
                            onChange={(e) => {
                              setSelectedHazards(prev => prev.map(h => 
                                h.hazardId === hazard.id 
                                  ? { ...h, notes: e.target.value }
                                  : h
                              ));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            rows={2}
                            placeholder="Notes additionnelles..."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Résumé des dangers */}
              {selectedHazards.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Analyse de risque ({selectedHazards.length} dangers identifiés)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-green-100 p-3 rounded">
                      <div className="text-2xl font-bold text-green-800">
                        {selectedHazards.filter(h => h.severity * h.probability < 5).length}
                      </div>
                      <div className="text-sm text-green-700">Risques faibles</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-800">
                        {selectedHazards.filter(h => h.severity * h.probability >= 5 && h.severity * h.probability < 10).length}
                      </div>
                      <div className="text-sm text-yellow-700">Risques moyens</div>
                    </div>
                    <div className="bg-orange-100 p-3 rounded">
                      <div className="text-2xl font-bold text-orange-800">
                        {selectedHazards.filter(h => h.severity * h.probability >= 10 && h.severity * h.probability < 15).length}
                      </div>
                      <div className="text-sm text-orange-700">Risques élevés</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded">
                      <div className="text-2xl font-bold text-red-800">
                        {selectedHazards.filter(h => h.severity * h.probability >= 15).length}
                      </div>
                      <div className="text-sm text-red-700">Risques critiques</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-600" />
                Mesures de contrôle
              </h3>

              {selectedHazards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucun danger identifié.</p>
                  <p className="text-sm">Retournez à l'étape précédente pour identifier les dangers.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedHazards.map((selectedHazard, index) => {
                    const hazardData = hazardsDatabase.find(h => h.id === selectedHazard.hazardId);
                    if (!hazardData) return null;

                    const relevantControls = controlMeasuresDatabase.filter(cm => 
                      cm.applicableHazards.includes(selectedHazard.hazardId)
                    );

                    return (
                      <div key={selectedHazard.hazardId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-800">{hazardData.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedHazard.severity * selectedHazard.probability >= 15 ? 'bg-red-100 text-red-800' :
                            selectedHazard.severity * selectedHazard.probability >= 10 ? 'bg-orange-100 text-orange-800' :
                            selectedHazard.severity * selectedHazard.probability >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Risque initial: {selectedHazard.severity * selectedHazard.probability}/25
                          </span>
                        </div>

                        {/* Hiérarchie des contrôles */}
                        <div className="space-y-4">
                          {['elimination', 'substitution', 'engineering', 'administrative', 'ppe'].map(hierarchy => {
                            const controlsInHierarchy = relevantControls.filter(cm => cm.hierarchy === hierarchy);
                            if (controlsInHierarchy.length === 0) return null;

                            return (
                              <div key={hierarchy} className="border border-gray-100 rounded p-3">
                                <h5 className="font-medium text-gray-700 mb-2 capitalize">
                                  {hierarchy === 'elimination' ? '🚫 Élimination' :
                                   hierarchy === 'substitution' ? '🔄 Substitution' :
                                   hierarchy === 'engineering' ? '⚙️ Contrôles techniques' :
                                   hierarchy === 'administrative' ? '📋 Contrôles administratifs' :
                                   '🦺 Équipements de protection'}
                                </h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {controlsInHierarchy.map(control => {
                                    const isSelected = selectedHazard.controlMeasures?.some(cm => cm.id === control.id);
                                    
                                    return (
                                      <div
                                        key={control.id}
                                        className={`p-3 rounded border cursor-pointer transition-all ${
                                          isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                        onClick={() => {
                                          setSelectedHazards(prev => prev.map(h => {
                                            if (h.hazardId === selectedHazard.hazardId) {
                                              const currentMeasures = h.controlMeasures || [];
                                              if (isSelected) {
                                                return {
                                                  ...h,
                                                  controlMeasures: currentMeasures.filter(cm => cm.id !== control.id)
                                                };
                                              } else {
                                                return {
                                                  ...h,
                                                  controlMeasures: [...currentMeasures, { id: control.id, implemented: false }]
                                                };
                                              }
                                            }
                                            return h;
                                          }));
                                        }}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h6 className="font-medium text-sm">{control.name}</h6>
                                            <p className="text-xs text-gray-600">{control.description}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                              <span>Efficacité: {control.effectiveness}%</span>
                                              <span className="ml-2">Coût: ${control.cost}</span>
                                            </div>
                                            {control.regulations && (
                                              <div className="text-xs text-blue-600 mt-1">
                                                📋 {control.regulations.join(', ')}
                                              </div>
                                            )}
                                          </div>
                                          {isSelected && <CheckCircle className="w-4 h-4 text-purple-600 mt-1" />}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Risque résiduel */}
                        {selectedHazard.controlMeasures && selectedHazard.controlMeasures.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Risque résiduel estimé:</span>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                calculateResidualRisk(selectedHazard) >= 15 ? 'bg-red-100 text-red-800' :
                                calculateResidualRisk(selectedHazard) >= 10 ? 'bg-orange-100 text-orange-800' :
                                calculateResidualRisk(selectedHazard) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {calculateResidualRisk(selectedHazard)}/25
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Réduction de {((1 - calculateResidualRisk(selectedHazard) / (selectedHazard.severity * selectedHazard.probability)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Étape non implémentée</div>;
    }
  };

  // Rendu principal (partie 1)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AST Ultra Premium
                </h1>
                <p className="text-sm text-gray-600">Analyse de Sécurité du Travail - {tenant}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>

              {/* Widget météo */}
              {weather && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg">
                  <span className="text-lg">
                    {weather.condition === 'ensoleillé' ? '☀️' :
                     weather.condition === 'nuageux' ? '☁️' :
                     weather.condition === 'pluvieux' ? '🌧️' : '❄️'}
                  </span>
                  <span className="text-sm font-medium">{weather.temperature}°C</span>
                  {weather.alerts.length > 0 && (
                    <span className="text-xs text-red-600">⚠️</span>
                  )}
                </div>
              )}

              {/* Bouton sidebar */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Étape {currentStep} sur 8
              </span>
              <span className="text-sm font-medium text-gray-600">
                {overallProgress}% complété
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Contenu principal */}
          <div className="flex-1">
            {renderStep()}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </button>

              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(step => (
                  <button
                    key={step}
                    onClick={() => goToStep(step)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      step === currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === 8}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// =================== AST SECTION 8/8 - ASSEMBLY FINAL COMPLET ===================

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
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Download,
  Share2,
  Print,
  Save
} from 'lucide-react';

// =================== INTERFACES COMPLÈTES ===================
interface ASTFormProps {
  tenant: string;
}

interface ProjectInfo {
  projectName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  startDate: string;
  duration: string;
  teamSize: string;
  workType: 'electrical' | 'gas' | 'construction' | 'telecom' | 'maintenance' | 'excavation' | 'height-work' | 'confined-space' | 'hot-work' | 'chemical' | 'road-work' | 'forestry' | 'welding' | 'plumbing' | 'hvac' | 'roofing' | 'demolition' | 'painting' | 'insulation' | 'glazing';
  client: 'hydro-quebec' | 'energir' | 'bell' | 'rogers' | 'videotron' | 'other';
  supervisor: string;
  contact: string;
  emergencyContact: string;
  permits: string[];
}

interface SelectedEquipment {
  equipmentId: string;
  quantity: number;
  inspectionDate: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SelectedHazard {
  hazardId: string;
  severity: number;
  probability: number;
  notes: string;
  controlMeasures?: ControlMeasureSelection[];
}

interface ControlMeasureSelection {
  id: string;
  implemented: boolean;
}

interface WorkPermit {
  id: string;
  type: string;
  number: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected';
  conditions: string[];
}

interface WeatherData {
  temperature: number;
  condition: 'ensoleillé' | 'nuageux' | 'pluvieux' | 'neigeux';
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  alerts: string[];
}

interface TeamResponse {
  approved: boolean;
  comments: string;
  timestamp: Date;
}

interface TeamConsultationStatus {
  sharedWith: string[];
  responses: (TeamResponse & { member: string })[];
  isActive: boolean;
  expiresAt: Date | null;
}

interface WorkType {
  id: string;
  name: string;
  category: string;
  description: string;
  baseHazards: string[];
  requiredPermits: string[];
  icon: string;
}

interface ClientConfiguration {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  emergencyProtocol: string;
  requiredDocuments: string[];
  contactInfo: {
    emergency: string;
    supervisor: string;
    dispatch: string;
  };
}

interface HazardData {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'electrical' | 'gas' | 'physical' | 'biological' | 'ergonomic' | 'environmental';
  severity: number;
  regulations?: string[];
  requiredEquipment?: string[];
}

interface ControlMeasure {
  id: string;
  name: string;
  description: string;
  hierarchy: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  effectiveness: number;
  cost: number;
  timeToImplement: string;
  applicableHazards: string[];
  regulations?: string[];
}

interface SafetyEquipment {
  id: string;
  name: string;
  description: string;
  category: string;
  certification: string;
  supplier: string;
  cost: number;
  lifespan: string;
  inspectionFrequency: string;
}

interface TeamDiscussion {
  id: string;
  topic: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  keyQuestions: string[];
  targetRoles: string[];
}

interface Translations {
  fr: { [key: string]: string };
  en: { [key: string]: string };
}

// =================== DONNÉES PRÉDÉFINIES ===================
const workTypes: WorkType[] = [
  {
    id: 'electrical',
    name: 'Travaux électriques',
    category: 'Énergie',
    description: 'Installation, maintenance et réparation d\'équipements électriques',
    baseHazards: ['ELEC-001', 'ELEC-002', 'ELEC-003'],
    requiredPermits: ['electrical'],
    icon: '⚡'
  },
  {
    id: 'gas',
    name: 'Travaux gaziers',
    category: 'Énergie', 
    description: 'Installation et maintenance de réseaux gaziers',
    baseHazards: ['GAZ-001', 'GAZ-002', 'GAZ-003'],
    requiredPermits: ['gas', 'excavation'],
    icon: '🔥'
  },
  {
    id: 'height-work',
    name: 'Travail en hauteur',
    category: 'Construction',
    description: 'Travaux effectués à plus de 3 mètres de hauteur',
    baseHazards: ['PHY-003', 'PHY-004'],
    requiredPermits: ['height-work'],
    icon: '🏗️'
  },
  {
    id: 'confined-space',
    name: 'Espace confiné',
    category: 'Spécialisé',
    description: 'Travaux dans des espaces restreints',
    baseHazards: ['ENV-001', 'GAZ-004'],
    requiredPermits: ['confined-space'],
    icon: '🕳️'
  },
  {
    id: 'hot-work',
    name: 'Travail à chaud',
    category: 'Spécialisé',
    description: 'Soudage, découpage, meulage avec production d\'étincelles',
    baseHazards: ['PHY-001', 'ENV-002'],
    requiredPermits: ['hot-work'],
    icon: '🔥'
  }
];

const clientConfigurations: ClientConfiguration[] = [
  {
    id: 'hydro-quebec',
    name: 'Hydro-Québec',
    logo: '/c-secur360-logo.png',
    primaryColor: '#0066CC',
    emergencyProtocol: 'Composez le 911 puis Hydro-Québec au 1-800-790-2424',
    requiredDocuments: ['electrical', 'environmental'],
    contactInfo: {
      emergency: '1-800-790-2424',
      supervisor: '1-800-HYDRO-QC',
      dispatch: '1-800-463-9999'
    }
  },
  {
    id: 'energir',
    name: 'Énergir',
    logo: '/c-secur360-logo.png',
    primaryColor: '#FF6600',
    emergencyProtocol: 'Composez le 911 puis Énergir au 1-800-361-8003',
    requiredDocuments: ['gas', 'excavation'],
    contactInfo: {
      emergency: '1-800-361-8003',
      supervisor: '1-800-ENERGIR',
      dispatch: '1-888-463-7447'
    }
  }
];

const hazardsDatabase: HazardData[] = [
  {
    id: 'ELEC-001',
    code: 'ELEC-001',
    name: 'Choc électrique',
    description: 'Contact direct ou indirect avec des parties sous tension',
    category: 'electrical',
    severity: 5,
    regulations: ['CSA Z462', 'RSST Art. 185'],
    requiredEquipment: ['ELC-001', 'ELC-002']
  },
  {
    id: 'ELEC-002', 
    code: 'ELEC-002',
    name: 'Arc électrique',
    description: 'Décharge électrique dans l\'air entre conducteurs',
    category: 'electrical',
    severity: 5,
    regulations: ['CSA Z462', 'NFPA 70E'],
    requiredEquipment: ['ELC-003', 'ELC-004']
  },
  {
    id: 'GAZ-001',
    code: 'GAZ-001', 
    name: 'Fuite de gaz naturel',
    description: 'Échappement de gaz combustible dans l\'environnement',
    category: 'gas',
    severity: 4,
    regulations: ['CSA Z662', 'RSST Art. 280'],
    requiredEquipment: ['DET-001', 'RES-001']
  },
  {
    id: 'PHY-001',
    code: 'PHY-001',
    name: 'Brûlures thermiques',
    description: 'Contact avec surfaces chaudes ou flammes',
    category: 'physical',
    severity: 4,
    regulations: ['RSST Art. 338'],
    requiredEquipment: ['COR-003', 'MAN-003']
  },
  {
    id: 'PHY-003',
    code: 'PHY-003',
    name: 'Chute de hauteur',
    description: 'Chute depuis une élévation supérieure à 3 mètres',
    category: 'physical',
    severity: 5,
    regulations: ['RSST Art. 347', 'CSA Z259'],
    requiredEquipment: ['CHU-001', 'CHU-002', 'CHU-003']
  }
];

const controlMeasuresDatabase: ControlMeasure[] = [
  {
    id: 'CM-001',
    name: 'Mise hors tension',
    description: 'Élimination de l\'énergie électrique par consignation',
    hierarchy: 'elimination',
    effectiveness: 95,
    cost: 50,
    timeToImplement: '30 min',
    applicableHazards: ['ELEC-001', 'ELEC-002'],
    regulations: ['CSA Z462']
  },
  {
    id: 'CM-002',
    name: 'Cadenassage/Étiquetage',
    description: 'Procédure LOTO pour isolation énergétique',
    hierarchy: 'administrative',
    effectiveness: 90,
    cost: 25,
    timeToImplement: '15 min',
    applicableHazards: ['ELEC-001', 'ELEC-002'],
    regulations: ['CSA Z460']
  },
  {
    id: 'CM-003',
    name: 'Équipement de protection arc',
    description: 'Vêtements résistants à l\'arc électrique',
    hierarchy: 'ppe',
    effectiveness: 80,
    cost: 500,
    timeToImplement: '5 min',
    applicableHazards: ['ELEC-002'],
    regulations: ['CSA Z462', 'NFPA 70E']
  }
];

const equipmentDatabase: SafetyEquipment[] = [
  {
    id: 'ELC-001',
    name: 'Gants diélectriques Classe 2',
    description: 'Protection contre 17,000V AC',
    category: 'electrical',
    certification: 'CSA Z462, ASTM D120',
    supplier: 'Honeywell Safety',
    cost: 85,
    lifespan: '6 mois',
    inspectionFrequency: 'Avant chaque utilisation'
  },
  {
    id: 'CHU-001',
    name: 'Harnais de sécurité',
    description: 'Harnais complet avec points d\'attache dorsaux',
    category: 'fall-protection',
    certification: 'CSA Z259.10',
    supplier: 'MSA Safety',
    cost: 125,
    lifespan: '5 ans',
    inspectionFrequency: 'Mensuelle'
  },
  {
    id: 'DET-001',
    name: 'Détecteur 4 gaz',
    description: 'Détection O2, LEL, CO, H2S',
    category: 'detection',
    certification: 'CSA C22.2',
    supplier: '3M Canada',
    cost: 450,
    lifespan: '2 ans',
    inspectionFrequency: 'Hebdomadaire'
  }
];

const teamDiscussions: TeamDiscussion[] = [
  {
    id: 'TD-001',
    topic: 'Procédures d\'urgence',
    description: 'Révision des procédures en cas d\'accident',
    priority: 'high',
    keyQuestions: [
      'Qui contacter en cas d\'urgence?',
      'Où sont les sorties de secours?',
      'Procédure d\'évacuation?'
    ],
    targetRoles: ['superviseur', 'secouriste', 'équipe']
  },
  {
    id: 'TD-002',
    topic: 'Équipements de protection',
    description: 'Vérification et utilisation correcte des EPI',
    priority: 'medium',
    keyQuestions: [
      'Tous les EPI sont-ils disponibles?',
      'Formation sur l\'utilisation?',
      'Dates d\'inspection validées?'
    ],
    targetRoles: ['équipe', 'responsable-équipement']
  }
];

const translations: { [key: string]: { fr: string; en: string } } = {
  projectInfo: { fr: 'Informations du projet', en: 'Project Information' },
  safetyEquipment: { fr: 'Équipements de sécurité', en: 'Safety Equipment' },
  hazardIdentification: { fr: 'Identification des dangers', en: 'Hazard Identification' },
  projectName: { fr: 'Nom du projet', en: 'Project Name' }
};

// =================== FONCTIONS UTILITAIRES ===================
const initialProjectInfo: ProjectInfo = {
  projectName: '',
  location: '',
  coordinates: { lat: 0, lng: 0 },
  description: '',
  startDate: '',
  duration: '',
  teamSize: '',
  workType: 'electrical',
  client: 'hydro-quebec',
  supervisor: '',
  contact: '',
  emergencyContact: '',
  permits: []
};

const emergencyMessages = {
  'hydro-quebec': {
    fr: "URGENCE ÉLECTRIQUE - Composez le 911 et Hydro-Québec au 1-800-790-2424",
    en: "ELECTRICAL EMERGENCY - Call 911 and Hydro-Québec at 1-800-790-2424"
  },
  'energir': {
    fr: "URGENCE GAZ - Composez le 911 et Énergir au 1-800-361-8003", 
    en: "GAS EMERGENCY - Call 911 and Énergir at 1-800-361-8003"
  },
  'other': {
    fr: "URGENCE - Composez le 911 et contactez votre superviseur",
    en: "EMERGENCY - Call 911 and contact your supervisor"
  }
};

const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }
  }, []);
  return isLoaded;
};

const useWeatherData = (coordinates: { lat: number; lng: number }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!coordinates.lat || !coordinates.lng) return;
    setLoading(true);
    try {
      const mockWeather: WeatherData = {
        temperature: Math.round(Math.random() * 30 - 10),
        condition: ['ensoleillé', 'nuageux', 'pluvieux', 'neigeux'][Math.floor(Math.random() * 4)] as any,
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 50),
        visibility: Math.round(Math.random() * 10 + 5),
        uvIndex: Math.round(Math.random() * 11),
        alerts: []
      };

      if (mockWeather.temperature < -20) {
        mockWeather.alerts.push('Froid extrême - Risque d\'hypothermie');
      }
      if (mockWeather.windSpeed > 30) {
        mockWeather.alerts.push('Vents forts - Travail en hauteur déconseillé');
      }

      setWeather(mockWeather);
    } catch (error) {
      console.error('Erreur météo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [coordinates.lat, coordinates.lng]);

  return { weather, loading, refetch: fetchWeather };
};

const useTeamSharing = () => {
  const [consultationStatus, setConsultationStatus] = useState<TeamConsultationStatus>({
    sharedWith: [],
    responses: [],
    isActive: false,
    expiresAt: null
  });

  const shareWithTeam = async (members: string[], method: 'email' | 'sms' | 'whatsapp', astData: any) => {
    const shareId = `ast-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    try {
      console.log(`Partage AST via ${method} avec:`, members);
      setConsultationStatus({
        sharedWith: members,
        responses: [],
        isActive: true,
        expiresAt
      });

      return {
        success: true,
        shareId,
        consultationLink: `${window.location.origin}/consultation/${shareId}`,
        message: `AST partagée avec ${members.length} membre(s) via ${method}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du partage'
      };
    }
  };

  const addResponse = (member: string, response: TeamResponse) => {
    setConsultationStatus(prev => ({
      ...prev,
      responses: [...prev.responses.filter(r => r.member !== member), { member, ...response }]
    }));
  };

  return { consultationStatus, shareWithTeam, addResponse };
};

const calculateRiskLevel = (hazards: SelectedHazard[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (!hazards.length) return 'LOW';
  const maxSeverity = Math.max(...hazards.map(h => h.severity));
  const maxProbability = Math.max(...hazards.map(h => h.probability));
  const riskScore = maxSeverity * maxProbability;
  
  if (riskScore >= 15) return 'CRITICAL';
  if (riskScore >= 10) return 'HIGH';
  if (riskScore >= 5) return 'MEDIUM';
  return 'LOW';
};

const calculateResidualRisk = (hazard: SelectedHazard): number => {
  if (!hazard.controlMeasures?.length) return hazard.severity * hazard.probability;
  
  const totalEffectiveness = hazard.controlMeasures.reduce((total, measure) => {
    const controlMeasure = controlMeasuresDatabase.find(cm => cm.id === measure.id);
    return total + (controlMeasure?.effectiveness || 0);
  }, 0);
  
  const reductionFactor = Math.min(0.9, totalEffectiveness / 100);
  return Math.round((hazard.severity * hazard.probability) * (1 - reductionFactor));
};

const validateComplianceRequirements = (hazards: SelectedHazard[], equipment: SelectedEquipment[]): {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  hazards.forEach(hazard => {
    const hazardData = hazardsDatabase.find(h => h.id === hazard.hazardId);
    if (hazardData?.requiredEquipment?.length) {
      const missingEquipment = hazardData.requiredEquipment.filter(reqEquip => 
        !equipment.some(equip => equip.equipmentId === reqEquip)
      );
      
      if (missingEquipment.length > 0) {
        violations.push(`Équipement manquant pour ${hazardData.name}: ${missingEquipment.join(', ')}`);
      }
    }
  });
  
  if (hazards.length > 5) {
    recommendations.push('Considérer la division du travail pour réduire l\'exposition aux risques');
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    recommendations
  };
};

const generateASTDocument = (formData: any): string => {
  const currentDate = new Date().toLocaleDateString('fr-CA');
  const riskLevel = calculateRiskLevel(formData.hazards || []);
  
  return `
ANALYSE DE SÉCURITÉ DU TRAVAIL (AST)
=====================================

INFORMATIONS GÉNÉRALES
----------------------
Projet: ${formData.projectInfo?.projectName || 'N/A'}
Lieu: ${formData.projectInfo?.location || 'N/A'}
Date: ${currentDate}
Type de travail: ${workTypes.find(w => w.id === formData.projectInfo?.workType)?.name || 'N/A'}
Client: ${clientConfigurations.find(c => c.id === formData.projectInfo?.client)?.name || 'N/A'}
Superviseur: ${formData.projectInfo?.supervisor || 'N/A'}

NIVEAU DE RISQUE GLOBAL: ${riskLevel}

VALIDATION
----------
Créé par: ${formData.projectInfo?.contact || 'N/A'}
Date de création: ${currentDate}
Statut: ${formData.consultationStatus?.isActive ? 'En consultation équipe' : 'Complété'}
  `;
};

// =================== COMPOSANT PRINCIPAL ===================
const ASTFormUltraPremium: React.FC<ASTFormProps> = ({ tenant }) => {
  // États principaux
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initialProjectInfo);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [selectedHazards, setSelectedHazards] = useState<SelectedHazard[]>([]);
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Hooks personnalisés
  const isGoogleMapsLoaded = useGoogleMaps();
  const { weather, loading: weatherLoading, refetch: refetchWeather } = useWeatherData(projectInfo.coordinates);
  const { consultationStatus, shareWithTeam, addResponse } = useTeamSharing();

  // Référence pour Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  // Fonctions de navigation
  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Calculs de progression
  const completionStats = {
    projectInfo: projectInfo.projectName && projectInfo.location && projectInfo.workType ? 100 : 50,
    equipment: selectedEquipment.length > 0 ? 100 : 0,
    hazards: selectedHazards.length > 0 ? 100 : 0,
    permits: workPermits.length > 0 ? 100 : 0
  };

  const overallProgress = Math.round(
    (completionStats.projectInfo + completionStats.equipment + completionStats.hazards + completionStats.permits) / 4
  );

  const riskLevel = calculateRiskLevel(selectedHazards);
  const complianceCheck = validateComplianceRequirements(selectedHazards, selectedEquipment);

  // Rendu simplifié pour éviter les erreurs
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Informations du projet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.projectName}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Installation transformateur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de travail *
                  </label>
                  <select
                    value={projectInfo.workType}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, workType: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {workTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu du travail *
                  </label>
                  <input
                    type="text"
                    value={projectInfo.location}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse du projet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={projectInfo.startDate}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {projectInfo.client && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800">Procédure d'urgence</span>
                  </div>
                  <p className="text-red-700">
                    {emergencyMessages[projectInfo.client]?.[language] || emergencyMessages.other[language]}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Étape {currentStep} en développement</p>
          </div>
        );
    }
  };

  // Rendu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AST Ultra Premium
                </h1>
                <p className="text-sm text-gray-600">Analyse de Sécurité du Travail - {tenant}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>

              {/* Widget météo */}
              {weather && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg">
                  <span className="text-lg">
                    {weather.condition === 'ensoleillé' ? '☀️' :
                     weather.condition === 'nuageux' ? '☁️' :
                     weather.condition === 'pluvieux' ? '🌧️' : '❄️'}
                  </span>
                  <span className="text-sm font-medium">{weather.temperature}°C</span>
                  {weather.alerts.length > 0 && (
                    <span className="text-xs text-red-600">⚠️</span>
                  )}
                </div>
              )}

              {/* Bouton sidebar */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Étape {currentStep} sur 8
              </span>
              <span className="text-sm font-medium text-gray-600">
                {overallProgress}% complété
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Contenu principal */}
          <div className="flex-1">
            {renderStep()}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </button>

              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(step => (
                  <button
                    key={step}
                    onClick={() => goToStep(step)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      step === currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === 8}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASTFormUltraPremium;
