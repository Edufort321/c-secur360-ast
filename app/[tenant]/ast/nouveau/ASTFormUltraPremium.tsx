// =================== AST SECTION 1/6 - IMPORTS & INTERFACES COMPLETS ===================

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock, Filter
} from 'lucide-react';

// =================== INTERFACES COMPLÈTES ===================
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
  };
  
  // Nouveau système de filtrage des dangers
  hazardFiltering: HazardFiltering;
  
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

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
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
    essaisEffectues: boolean; // Nouveau champ
  };
}

interface ControlMeasure {
  id: string;
  name: string;
  description: string;
  category: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
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
}

interface TeamDiscussion {
  id: string;
  topic: string;
  notes: string;
  completed: boolean;
  discussedBy: string;
  discussedAt?: string;
  priority: 'low' | 'medium' | 'high';
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

// =================== INTERFACES SYSTÈME PRÉFILTRAGE ===================
interface WorkTypeFilter {
  id: string;
  name: string;
  icon: string;
  description: string;
  associatedHazards: string[];
  isSelected: boolean;
}

interface HazardFiltering {
  workTypes: WorkTypeFilter[];
  showAllHazards: boolean;
  filteredHazards: string[];
}

interface ASTFormProps {
  tenant: Tenant;
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
// =================== AST SECTION 2/6 - DONNÉES & TYPES DE TRAVAUX ===================

// =================== LOGO CLIENT POTENTIEL SVG ===================
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

// =================== TYPES DE TRAVAUX PRÉDÉFINIS ===================
const workTypeFilters: WorkTypeFilter[] = [
  {
    id: 'electrical',
    name: 'Travaux Électriques',
    icon: '⚡',
    description: 'Installation, maintenance, réparation systèmes électriques',
    associatedHazards: [
      'ELEC-001', 'ELEC-002', 'ENERGY-002', 'ELECT-003', 'FIRE-001', 'FIRE-002',
      'FALL-001', 'FALL-003', 'LIFT-002', 'SPACE-001'
    ],
    isSelected: false
  },
  {
    id: 'mechanical',
    name: 'Travaux Mécaniques',
    icon: '⚙️',
    description: 'Maintenance machines, systèmes mécaniques, moteurs',
    associatedHazards: [
      'MECH-001', 'MECH-002', 'MECH-003', 'MANUF-001', 'MANUF-003', 'VIB-001',
      'NOISE-001', 'TEMP-001', 'LIFT-001', 'ERGO-001', 'CHEM-001'
    ],
    isSelected: false
  },
  {
    id: 'lifting',
    name: 'Travaux de Levage',
    icon: '🏗️',
    description: 'Grues, palans, chariots élévateurs, manutention lourde',
    associatedHazards: [
      'LIFT-002', 'LIFT-003', 'LIFT-004', 'LIFT-005', 'LIFT-006', 'MECH-003',
      'FALL-003', 'ELECT-003', 'WIND-001', 'VEHICLE-001', 'ERGO-001'
    ],
    isSelected: false
  },
  {
    id: 'heights',
    name: 'Travaux en Hauteur',
    icon: '🪜',
    description: 'Toitures, échafaudages, nacelles, structures élevées',
    associatedHazards: [
      'FALL-001', 'FALL-003', 'CONST-003', 'WIND-001', 'ENV-001',
      'ELECT-003', 'STRESS-001', 'VEHICLE-001'
    ],
    isSelected: false
  },
  {
    id: 'excavation',
    name: 'Excavation/Terrassement',
    icon: '🚜',
    description: 'Tranchées, fondations, services souterrains',
    associatedHazards: [
      'CONST-001', 'MARINE-001', 'VEHICLE-001', 'CHEM-001', 'SPACE-001',
      'FALL-001', 'MECH-003', 'ENERGY-001', 'LIFT-002', 'ENV-001'
    ],
    isSelected: false
  },
  {
    id: 'welding',
    name: 'Soudage/Travaux à Chaud',
    icon: '🔥',
    description: 'Soudage, découpage, meulage, travaux thermiques',
    associatedHazards: [
      'FIRE-001', 'FIRE-002', 'MANUF-002', 'CHEM-002', 'RAD-001',
      'MECH-002', 'FALL-001', 'SPACE-001', 'TEMP-001', 'ELEC-001'
    ],
    isSelected: false
  },
  {
    id: 'confined',
    name: 'Espaces Clos',
    icon: '🕳️',
    description: 'Réservoirs, silos, égouts, cuves, tunnels',
    associatedHazards: [
      'SPACE-001', 'CHEM-002', 'ENERGY-001', 'FIRE-002', 'MARINE-001',
      'TEMP-002', 'STRESS-001', 'BIO-001', 'ERGO-001', 'ELEC-001'
    ],
    isSelected: false
  },
  {
    id: 'demolition',
    name: 'Démolition',
    icon: '🔨',
    description: 'Démolition structures, désamiantage, déconstruction',
    associatedHazards: [
      'CONST-002', 'FALL-001', 'FALL-003', 'CHEM-001', 'DUST-001',
      'NOISE-001', 'VIB-001', 'MECH-003', 'LIFT-002', 'VEHICLE-001', 'FIRE-001'
    ],
    isSelected: false
  },
  {
    id: 'chemical',
    name: 'Travaux Chimiques',
    icon: '🧪',
    description: 'Manipulation produits chimiques, laboratoires, procédés',
    associatedHazards: [
      'CHEM-001', 'CHEM-002', 'FIRE-001', 'FIRE-002', 'BIO-001',
      'FOOD-001', 'RAD-001', 'TEMP-001', 'ERGO-001', 'SPACE-001'
    ],
    isSelected: false
  },
  {
    id: 'office',
    name: 'Travaux Bureau/Administratifs',
    icon: '💻',
    description: 'Bureaux, centres données, espaces administratifs',
    associatedHazards: [
      'OFFICE-001', 'OFFICE-002', 'OFFICE-003', 'CYBER-001', 'ELEC-001',
      'FIRE-001', 'ERGO-001', 'FALL-002', 'STRESS-001', 'TEMP-001'
    ],
    isSelected: false
  }
];

// =================== DISCUSSIONS D'ÉQUIPE PRÉDÉFINIES ===================
const predefinedDiscussions: TeamDiscussion[] = [
  { id: 'disc-001', topic: 'Points de coupure électrique', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-002', topic: 'Explication des dangers électriques', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-003', topic: 'EPI spécifiques requis', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-004', topic: 'Conditions particulières de travail', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-005', topic: 'Procédures d\'urgence', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-006', topic: 'Communications et signalisation', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-007', topic: 'Analyse des risques spécifiques', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-008', topic: 'Plan d\'évacuation d\'urgence', notes: '', completed: false, discussedBy: '', priority: 'medium' }
];

// =================== PROCÉDURES D'URGENCE ===================
const emergencyProcedures: EmergencyProcedure[] = [
  { id: 'emerg-001', type: 'medical', procedure: 'Appeler le 911, premiers soins, évacuation médicale', responsiblePerson: 'Superviseur de chantier', contactInfo: '911 / Contact urgence', isVerified: false },
  { id: 'emerg-002', type: 'fire', procedure: 'Alarme incendie, évacuation, point de rassemblement', responsiblePerson: 'Chef d\'équipe', contactInfo: 'Service incendie 911', isVerified: false },
  { id: 'emerg-003', type: 'electrical', procedure: 'Coupure d\'urgence, consignation, vérification', responsiblePerson: 'Électricien qualifié', contactInfo: 'Responsable électrique', isVerified: false },
  { id: 'emerg-004', type: 'evacuation', procedure: 'Signal d\'évacuation, routes d\'évacuation, décompte', responsiblePerson: 'Responsable sécurité', contactInfo: 'Poste de commandement', isVerified: false }
];

// =================== ÉTAT INITIAL FILTRAGE ===================
const initialFilteringState: HazardFiltering = {
  workTypes: workTypeFilters,
  showAllHazards: false,
  filteredHazards: []
};
// =================== AST SECTION 3/6 - BASE DE DONNÉES COMPLÈTE DANGERS ===================

// =================== MOYENS DE CONTRÔLE COMPLETS ===================
const predefinedControlMeasures: Record<string, ControlMeasure[]> = {
  // Dangers électriques
  'ELEC-001': [
    { id: 'ctrl-elec-001-1', name: 'Consignation/Verrouillage LOTO', description: 'Procédure selon CSA Z460', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-2', name: 'Vérification absence de tension', description: 'VAT selon CSA Z462', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-3', name: 'Mise à la terre temporaire', description: 'MALT selon CSA Z462', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-4', name: 'EPI électrique certifié', description: 'Gants isolants classe 00-4, casque classe E', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-5', name: 'Formation électrique', description: 'Personnel qualifié selon CSA Z462', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'ELEC-002': [
    { id: 'ctrl-elec-002-1', name: 'Analyse arc flash', description: 'Calcul énergie incidente selon CSA Z462', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-2', name: 'Vêtements arc flash', description: 'Catégorie EPI selon analyse', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-3', name: 'Équipement télécommandé', description: 'Perches isolantes, déclencheurs télécommandés', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-4', name: 'Limites d\'approche', description: 'Zones de protection selon CSA Z462', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  
  // Chutes
  'FALL-001': [
    { id: 'ctrl-fall-001-1', name: 'Système de retenue', description: 'Harnais + longe selon CSA Z259', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-001-2', name: 'Garde-corps permanents', description: 'Installation selon Code du bâtiment', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-001-3', name: 'Filets de sécurité', description: 'Installation selon CSA Z259.16', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-001-4', name: 'Formation travail en hauteur', description: 'Certification selon juridiction provinciale', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'FALL-002': [
    { id: 'ctrl-fall-002-1', name: 'Nettoyage des surfaces', description: 'Élimination déversements immédiate', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-002-2', name: 'Chaussures antidérapantes', description: 'Semelles selon CSA Z195', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-002-3', name: 'Éclairage adéquat', description: 'Minimum 200 lux selon CSA Z1000', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],
  'FALL-003': [
    { id: 'ctrl-fall-003-1', name: 'Casque de sécurité', description: 'Classe A ou E selon CSA Z94.1', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-003-2', name: 'Filets de protection', description: 'Installation sous zones de travail', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-fall-003-3', name: 'Périmètre de sécurité', description: 'Délimitation zone de danger', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  
  // Dangers mécaniques
  'MECH-001': [
    { id: 'ctrl-mech-001-1', name: 'Protecteurs fixes', description: 'Installation selon CSA Z432', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-mech-001-2', name: 'Dispositifs de verrouillage', description: 'Interrupteurs de sécurité', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-mech-001-3', name: 'Consignation mécanique', description: 'LOTO selon CSA Z460', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'MECH-002': [
    { id: 'ctrl-mech-002-1', name: 'Gants résistants coupures', description: 'Niveau ANSI A2-A5 selon besoin', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-mech-002-2', name: 'Techniques sécuritaires', description: 'Formation manipulation objets tranchants', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'MECH-003': [
    { id: 'ctrl-mech-003-1', name: 'Chaussures de sécurité', description: 'Embout protecteur selon CSA Z195', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-mech-003-2', name: 'Équipement de levage', description: 'Grues, palans selon CSA B167', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],
  
  // Travaux de levage
  'LIFT-002': [
    { id: 'ctrl-lift-002-1', name: 'Certification grutier', description: 'Opérateur certifié selon CSA B167', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-002-2', name: 'Plan de levage', description: 'Calculs charges, rayons, stabilité', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-002-3', name: 'Signaleur certifié', description: 'Communications selon CSA', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-002-4', name: 'Périmètre de sécurité', description: 'Zone d\'exclusion rayon + 3m', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'LIFT-003': [
    { id: 'ctrl-lift-003-1', name: 'Montage par spécialiste', description: 'Installation selon fabricant CSA B167', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-003-2', name: 'Inspection mensuelle', description: 'Vérification par personne compétente', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  'LIFT-004': [
    { id: 'ctrl-lift-004-1', name: 'Inspection avant usage', description: 'Vérification visuelle quotidienne', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-004-2', name: 'Ancrage sécurisé', description: 'Points d\'ancrage certifiés > 22kN', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],
  'LIFT-005': [
    { id: 'ctrl-lift-005-1', name: 'Permis de conduire', description: 'Formation certifiée selon CSA B335', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-005-2', name: 'Ceinture de sécurité', description: 'Port obligatoire si équipé ROPS', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],
  'LIFT-006': [
    { id: 'ctrl-lift-006-1', name: 'Coordination équipe', description: 'Chef d\'équipe pour coordination', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-lift-006-2', name: 'Calcul charge/personne', description: 'Maximum 23kg par personne', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  
  // Default pour autres dangers
  'default': [
    { id: 'ctrl-def-001', name: 'Formation du personnel', description: 'Formation sur les risques et procédures', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-def-002', name: 'EPI approprié', description: 'Équipement de protection selon le risque', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-def-003', name: 'Procédures écrites', description: 'Mode opératoire normalisé documenté', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ]
};
// =================== AST SECTION 4/6 - LISTE COMPLÈTE DES DANGERS ===================

const predefinedElectricalHazards: ElectricalHazard[] = [
  // DANGERS ÉLECTRIQUES
  { id: 'ELEC-001', code: 'ELEC-001', title: 'Électrocution', description: 'Contact direct ou indirect avec pièces sous tension', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['ELEC-001'], showControls: false },
  { id: 'ELEC-002', code: 'ELEC-002', title: 'Arc électrique', description: 'Formation d\'arc causant brûlures et explosion', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['ELEC-002'], showControls: false },
  
  // CHUTES
  { id: 'FALL-001', code: 'FALL-001', title: 'Chute de hauteur', description: 'Chute depuis surface élevée (> 3m)', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['FALL-001'], showControls: false },
  { id: 'FALL-002', code: 'FALL-002', title: 'Chute de plain-pied', description: 'Glissade, trébuchement sur surface niveau', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['FALL-002'], showControls: false },
  { id: 'FALL-003', code: 'FALL-003', title: 'Chute d\'objets', description: 'Objets tombant depuis hauteur', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['FALL-003'], showControls: false },
  
  // DANGERS MÉCANIQUES
  { id: 'MECH-001', code: 'MECH-001', title: 'Happement/Entraînement', description: 'Entraînement par pièces mobiles', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['MECH-001'], showControls: false },
  { id: 'MECH-002', code: 'MECH-002', title: 'Coupure/Lacération', description: 'Blessure par objets tranchants', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['MECH-002'], showControls: false },
  { id: 'MECH-003', code: 'MECH-003', title: 'Écrasement', description: 'Compression par objets lourds', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['MECH-003'], showControls: false },
  
  // TRAVAUX DE LEVAGE
  { id: 'LIFT-002', code: 'LIFT-002', title: 'Grue mobile/Grue sur chenilles', description: 'Renversement, contact lignes électriques, chute charges', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['LIFT-002'], showControls: false },
  { id: 'LIFT-003', code: 'LIFT-003', title: 'Grue à tour fixe', description: 'Effondrement, surcharge, interférence autres grues', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['LIFT-003'], showControls: false },
  { id: 'LIFT-004', code: 'LIFT-004', title: 'Palans/Treuils électriques', description: 'Rupture câbles, chute charges, écrasement', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['LIFT-004'], showControls: false },
  { id: 'LIFT-005', code: 'LIFT-005', title: 'Chariots élévateurs', description: 'Renversement, chute charges, collision piétons', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['LIFT-005'], showControls: false },
  { id: 'LIFT-006', code: 'LIFT-006', title: 'Levage manuel en équipe', description: 'Coordination défaillante, charges > 23kg/personne', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['LIFT-006'], showControls: false },
  
  // INCENDIE/EXPLOSION
  { id: 'FIRE-001', code: 'FIRE-001', title: 'Incendie', description: 'Combustion non contrôlée matières inflammables', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FIRE-002', code: 'FIRE-002', title: 'Explosion', description: 'Expansion rapide gaz avec onde choc', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // DANGERS CHIMIQUES
  { id: 'CHEM-001', code: 'CHEM-001', title: 'Exposition chimique', description: 'Contact substances dangereuses SIMDUT', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CHEM-002', code: 'CHEM-002', title: 'Inhalation vapeurs toxiques', description: 'Respiration substances toxiques', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // DANGERS PHYSIQUES
  { id: 'NOISE-001', code: 'NOISE-001', title: 'Exposition au bruit', description: 'Niveau sonore > 85 dBA sur 8h', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'TEMP-001', code: 'TEMP-001', title: 'Exposition à la chaleur', description: 'Stress thermique > 28°C WBGT', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'TEMP-002', code: 'TEMP-002', title: 'Exposition au froid', description: 'Hypothermie/engelures < -7°C', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'VIB-001', code: 'VIB-001', title: 'Exposition vibrations', description: 'Vibrations main-bras/corps entier', riskLevel: 'low', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // SECTEUR ÉNERGÉTIQUE
  { id: 'ENERGY-001', code: 'ENERGY-001', title: 'Gaz naturel sous pression', description: 'Fuite, explosion pipeline/équipements haute pression', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ENERGY-002', code: 'ENERGY-002', title: 'Haute tension (>1000V)', description: 'Électrocution, arc flash postes/lignes transmission', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ENERGY-003', code: 'ENERGY-003', title: 'Substances radioactives', description: 'Exposition radiations équipements nucléaires/médicaux', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // SECTEUR CONSTRUCTION
  { id: 'CONST-001', code: 'CONST-001', title: 'Excavation/Tranchées', description: 'Effondrement parois, ensevelissement, noyade', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CONST-002', code: 'CONST-002', title: 'Démolition structurelle', description: 'Effondrement non contrôlé, projection débris', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CONST-003', code: 'CONST-003', title: 'Travaux sur toiture', description: 'Chute hauteur, perforation, conditions glissantes', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // SECTEUR MANUFACTURIER
  { id: 'MANUF-001', code: 'MANUF-001', title: 'Machines-outils automatisées', description: 'Happement robots, démarrage inattendu CNC', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MANUF-002', code: 'MANUF-002', title: 'Procédés haute température', description: 'Brûlures fours, coulée métaux, vapeurs chaudes', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MANUF-003', code: 'MANUF-003', title: 'Systèmes sous pression', description: 'Explosion chaudières, rupture tuyauterie vapeur', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // SECTEUR BUREAU
  { id: 'OFFICE-001', code: 'OFFICE-001', title: 'TMS postes informatiques', description: 'TMS cou/dos/poignets postes informatiques', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'OFFICE-002', code: 'OFFICE-002', title: 'Qualité air intérieur', description: 'Syndrome bâtiment hermétique, moisissures', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'OFFICE-003', code: 'OFFICE-003', title: 'Stress psychosocial', description: 'Épuisement professionnel, harcèlement, surcharge', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  
  // DANGERS SPÉCIALISÉS
  { id: 'RAD-001', code: 'RAD-001', title: 'Exposition radiations', description: 'Rayonnements ionisants/non-ionisants', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'BIO-001', code: 'BIO-001', title: 'Agents biologiques', description: 'Microorganismes pathogènes', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ERGO-001', code: 'ERGO-001', title: 'Troubles musculo-squelettiques', description: 'TMS par efforts répétitifs', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'SPACE-001', code: 'SPACE-001', title: 'Espace clos', description: 'Travail milieu confiné selon CSA Z1006', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'VEHICLE-001', code: 'VEHICLE-001', title: 'Circulation véhicules', description: 'Collision véhicules/équipements mobiles', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'LIFT-001', code: 'LIFT-001', title: 'Manutention manuelle', description: 'Soulèvement/transport charges > 23kg', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'EQUIP-001', code: 'EQUIP-001', title: 'Défaillance équipement', description: 'Panne/bris équipement critique', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ENV-001', code: 'ENV-001', title: 'Conditions météorologiques', description: 'Intempéries affectant sécurité travail', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'STRESS-001', code: 'STRESS-001', title: 'Stress et fatigue', description: 'Épuisement physique/mental', riskLevel: 'low', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MARINE-001', code: 'MARINE-001', title: 'Travaux aquatiques/Noyade', description: 'Noyade, hypothermie, courants forts', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FOOD-001', code: 'FOOD-001', title: 'Contamination alimentaire', description: 'Intoxication, allergènes, contamination croisée', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CYBER-001', code: 'CYBER-001', title: 'Cybersécurité systèmes critiques', description: 'Piratage SCADA, ransomware, perte données', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ELECT-003', code: 'ELECT-003', title: 'Contact lignes électriques aériennes', description: 'Électrocution par contact équipement levage avec lignes', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'WIND-001', code: 'WIND-001', title: 'Conditions de vent excessif', description: 'Instabilité grues/charges par vent > 39 km/h', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'DUST-001', code: 'DUST-001', title: 'Poussières de silice cristalline', description: 'Exposition silicose par découpage béton/maçonnerie', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'OTHER-001', code: 'OTHER-001', title: 'Autres dangers spécifiques', description: 'Dangers particuliers site/tâche', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false }
];
// =================== AST SECTION 5/6 - ÉQUIPEMENTS ET TRADUCTIONS ===================

// =================== ÉQUIPEMENTS DE SÉCURITÉ COMPLETS ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  // Protection de la tête
  { id: 'head-001', name: 'Casque de sécurité classe E', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-002', name: 'Casque d\'escalade', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-003', name: 'Casque avec mentonnière', required: false, available: false, verified: false, notes: '', category: 'head' },
  
  // Protection des yeux
  { id: 'eye-001', name: 'Lunettes de sécurité', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-002', name: 'Écran facial', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-003', name: 'Lunettes de soudage', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-004', name: 'Écran facial anti-projection', required: false, available: false, verified: false, notes: '', category: 'eye' },
  
  // Protection respiratoire
  { id: 'resp-001', name: 'Masque anti-poussière N95', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-002', name: 'Appareil respiratoire autonome', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-003', name: 'Demi-masque avec cartouches', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-004', name: 'Masque P100 silice', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  
  // Protection des mains
  { id: 'hand-001', name: 'Gants isolants électriques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-002', name: 'Gants de travail mécaniques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-003', name: 'Gants résistants aux coupures', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-004', name: 'Gants chimiques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-005', name: 'Gants haute température', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-006', name: 'Gants pour élingues', required: false, available: false, verified: false, notes: '', category: 'hand' },
  
  // Protection des pieds
  { id: 'foot-001', name: 'Chaussures de sécurité isolantes', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-002', name: 'Bottes de sécurité CSA', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-003', name: 'Bottes étanches', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-004', name: 'Chaussures antidérapantes', required: false, available: false, verified: false, notes: '', category: 'foot' },
  
  // Protection du corps
  { id: 'body-001', name: 'Vêtements arc flash', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-002', name: 'Veste haute visibilité classe 3', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-003', name: 'Combinaison Tyvek', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-004', name: 'Tablier résistant chimique', required: false, available: false, verified: false, notes: '', category: 'body' },
  
  // Protection contre les chutes
  { id: 'fall-001', name: 'Harnais de sécurité complet', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-002', name: 'Longe avec absorbeur', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-003', name: 'Harnais grutier', required: false, available: false, verified: false, notes: '', category: 'fall' },
  
  // Protection électrique
  { id: 'elec-001', name: 'Tapis isolant', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-002', name: 'Perche isolante', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-003', name: 'Vérificateur d\'absence de tension', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  
  // Détection et mesure
  { id: 'detect-001', name: 'Détecteur multigaz H2S/CH4/O2', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-002', name: 'Dosimètre personnel radiations', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-003', name: 'Anémomètre portable', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-004', name: 'Dynamomètre élingues', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-005', name: 'Thermomètre infrarouge', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-006', name: 'Moniteur qualité air CO2', required: false, available: false, verified: false, notes: '', category: 'detection' },
  
  // Autres équipements
  { id: 'other-001', name: 'Trousse de premiers soins', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-002', name: 'Radio bidirectionnelle', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-003', name: 'Vêtement flottaison individuel', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-004', name: 'Support ergonomique écran', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-005', name: 'Token sécurité multifacteur', required: false, available: false, verified: false, notes: '', category: 'other' }
];

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Nouvelle Analyse Sécuritaire de Tâches",
    subtitle: "Formulaire adaptatif conforme aux normes SST",
    saving: "Sauvegarde en cours...",
    saved: "✅ Sauvegardé avec succès",
    
    counters: {
      onJob: "Sur la job",
      approved: "Approuvé AST", 
      approvalRate: "Taux d'approbation"
    },
    
    steps: {
      general: "Informations Générales",
      isolation: "Points d'Isolement", // DÉPLACÉ EN POSITION 2
      discussion: "Discussion Équipe", // DÉPLACÉ EN POSITION 3
      equipment: "Équipements Sécurité",
      hazards: "Dangers & Risques",
      team: "Équipe de Travail",
      documentation: "Photos & Documentation", 
      validation: "Validation & Signatures"
    },
    
    workTypeFiltering: {
      title: "Type de Travaux",
      subtitle: "Sélectionnez le(s) type(s) de travaux pour filtrer les dangers pertinents",
      showAll: "Voir Tous les Dangers",
      showFiltered: "Dangers Filtrés",
      noSelection: "Aucun type sélectionné",
      selectedTypes: "Types sélectionnés"
    },
    
    projectInfo: {
      title: "Informations du Projet",
      industry: "Type d'Industrie",
      astNumber: "# AST",
      astClientNumber: "# AST du Client", 
      date: "Date",
      client: "Client",
      clientPhone: "# Téléphone Client",
      projectNumber: "Numéro de Projet",
      workDescription: "Description des Travaux",
      workLocation: "Lieu des Travaux",
      clientRepresentative: "Nom du Responsable",
      clientRepresentativePhone: "# Téléphone Responsable",
      workerCount: "Nombre de personnes sur la job",
      estimatedDuration: "Durée Estimée",
      emergencyContact: "Contact d'Urgence",
      emergencyPhone: "# Urgence",
      astInfo: "Numéro généré automatiquement - usage unique",
      astClientInfo: "Numéro fourni par le client (optionnel)"
    },
    
    isolation: {
      title: "Points d'Isolement et Verrouillage",
      subtitle: "Configuration LOTO avant discussion d'équipe",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      checklist: {
        cadenasAppose: "🔒 Cadenas Apposé",
        absenceTension: "⚡ Absence de Tension/Énergie", 
        miseALaTerre: "🌍 Mise à la Terre/Neutralisation",
        essaisEffectues: "🔄 Essais de Démarrage Effectués"
      },
      types: {
        electrical: "⚡ Électrique",
        mechanical: "⚙️ Mécanique", 
        pneumatic: "💨 Pneumatique",
        hydraulic: "🌊 Hydraulique",
        chemical: "🧪 Chimique",
        thermal: "🔥 Thermique"
      }
    },
    
    teamDiscussion: {
      title: "Discussion avec l'Équipe",
      subtitle: "Information à discuter avec l'équipe",
      completed: "Complété",
      pending: "En attente", 
      discussedBy: "Discuté par",
      notes: "Notes",
      priority: "Priorité"
    },
    
    safetyEquipment: {
      title: "Équipement de Protection Individuel et Collectif",
      required: "Requis",
      available: "Disponible",
      verified: "Vérifié", 
      notes: "Notes",
      categories: {
        head: "Protection Tête",
        eye: "Protection Yeux",
        respiratory: "Protection Respiratoire",
        hand: "Protection Mains", 
        foot: "Protection Pieds",
        body: "Protection Corps",
        fall: "Protection Chute",
        electrical: "Protection Électrique",
        detection: "Détection",
        other: "Autre"
      }
    },
    
    hazards: {
      title: "Dangers Potentiels",
      selected: "Sélectionné",
      riskLevel: "Niveau de Risque",
      notes: "Notes supplémentaires",
      controlMeasures: "Moyens de Contrôle",
      controlsRequired: "⚠️ Moyens de contrôle requis",
      controlsInPlace: "VIGILANCE - Moyens de contrôle en place",
      addCustomHazard: "Ajouter un danger personnalisé",
      levels: {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé", 
        critical: "Critique"
      },
      categories: {
        elimination: "Élimination",
        substitution: "Substitution",
        engineering: "Ingénierie",
        administrative: "Administrative",
        ppe: "EPI"
      }
    },
    
    industries: {
      electrical: "Électrique",
      construction: "Construction",
      industrial: "Industriel",
      office: "Bureau/Administratif",
      manufacturing: "Manufacturier",
      other: "Autre"
    },
    
    team: {
      title: "Équipe de Travail",
      supervisor: "Superviseur",
      // =================== AST SECTION 5/6 - ÉQUIPEMENTS ET TRADUCTIONS ===================

// =================== ÉQUIPEMENTS DE SÉCURITÉ COMPLETS ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  // Protection de la tête
  { id: 'head-001', name: 'Casque de sécurité classe E', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-002', name: 'Casque d\'escalade', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-003', name: 'Casque avec mentonnière', required: false, available: false, verified: false, notes: '', category: 'head' },
  
  // Protection des yeux
  { id: 'eye-001', name: 'Lunettes de sécurité', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-002', name: 'Écran facial', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-003', name: 'Lunettes de soudage', required: false, available: false, verified: false, notes: '', category: 'eye' },
  
  // Protection respiratoire
  { id: 'resp-001', name: 'Masque anti-poussière N95', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-002', name: 'Appareil respiratoire autonome', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-003', name: 'Masque P100 silice', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  
  // Protection des mains
  { id: 'hand-001', name: 'Gants isolants électriques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-002', name: 'Gants résistants aux coupures', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-003', name: 'Gants haute température', required: false, available: false, verified: false, notes: '', category: 'hand' },
  
  // Protection des pieds
  { id: 'foot-001', name: 'Chaussures de sécurité isolantes', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-002', name: 'Bottes de sécurité CSA', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-003', name: 'Chaussures antidérapantes', required: false, available: false, verified: false, notes: '', category: 'foot' },
  
  // Protection du corps
  { id: 'body-001', name: 'Vêtements arc flash', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-002', name: 'Veste haute visibilité classe 3', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-003', name: 'Combinaison Tyvek', required: false, available: false, verified: false, notes: '', category: 'body' },
  
  // Protection contre les chutes
  { id: 'fall-001', name: 'Harnais de sécurité complet', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-002', name: 'Longe avec absorbeur', required: false, available: false, verified: false, notes: '', category: 'fall' },
  
  // Protection électrique
  { id: 'elec-001', name: 'Tapis isolant', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-002', name: 'Vérificateur d\'absence de tension', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  
  // Détection et mesure
  { id: 'detect-001', name: 'Détecteur multigaz H2S/CH4/O2', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-002', name: 'Anémomètre portable', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-003', name: 'Dosimètre personnel radiations', required: false, available: false, verified: false, notes: '', category: 'detection' },
  
  // Autres équipements
  { id: 'other-001', name: 'Trousse de premiers soins', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-002', name: 'Radio bidirectionnelle', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-003', name: 'Vêtement flottaison individuel', required: false, available: false, verified: false, notes: '', category: 'other' }
];

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Nouvelle Analyse Sécuritaire de Tâches",
    subtitle: "Formulaire adaptatif conforme aux normes SST",
    saving: "Sauvegarde en cours...",
    saved: "✅ Sauvegardé avec succès",
    
    counters: {
      onJob: "Sur la job",
      approved: "Approuvé AST", 
      approvalRate: "Taux d'approbation"
    },
    
    steps: {
      general: "Informations Générales",
      isolation: "Points d'Isolement", // DÉPLACÉ EN POSITION 2
      discussion: "Discussion Équipe", // DÉPLACÉ EN POSITION 3
      equipment: "Équipements Sécurité",
      hazards: "Dangers & Risques",
      team: "Équipe de Travail",
      documentation: "Photos & Documentation", 
      validation: "Validation & Signatures"
    },
    
    workTypeFiltering: {
      title: "Type de Travaux",
      subtitle: "Sélectionnez le(s) type(s) de travaux pour filtrer les dangers pertinents",
      showAll: "Voir Tous les Dangers",
      showFiltered: "Dangers Filtrés",
      noSelection: "Aucun type sélectionné"
    },
    
    projectInfo: {
      title: "Informations du Projet",
      astNumber: "# AST",
      date: "Date",
      client: "Client",
      clientPhone: "# Téléphone Client",
      projectNumber: "Numéro de Projet",
      workDescription: "Description des Travaux",
      workLocation: "Lieu des Travaux",
      clientRepresentative: "Nom du Responsable",
      clientRepresentativePhone: "# Téléphone Responsable",
      workerCount: "Nombre de personnes sur la job",
      estimatedDuration: "Durée Estimée",
      emergencyContact: "Contact d'Urgence",
      emergencyPhone: "# Urgence"
    },
    
    isolation: {
      title: "Points d'Isolement et Verrouillage",
      subtitle: "Configuration LOTO avant discussion d'équipe",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      checklist: {
        cadenasAppose: "🔒 Cadenas Apposé",
        absenceTension: "⚡ Absence de Tension/Énergie", 
        miseALaTerre: "🌍 Mise à la Terre/Neutralisation",
        essaisEffectues: "🔄 Essais de Démarrage Effectués"
      },
      types: {
        electrical: "⚡ Électrique",
        mechanical: "⚙️ Mécanique", 
        pneumatic: "💨 Pneumatique",
        hydraulic: "🌊 Hydraulique",
        chemical: "🧪 Chimique",
        thermal: "🔥 Thermique"
      }
    },
    
    teamDiscussion: {
      title: "Discussion avec l'Équipe",
      subtitle: "Information à discuter avec l'équipe",
      completed: "Complété",
      pending: "En attente", 
      discussedBy: "Discuté par",
      notes: "Notes",
      priority: "Priorité"
    },
    
    safetyEquipment: {
      title: "Équipement de Protection Individuel et Collectif",
      required: "Requis",
      available: "Disponible",
      verified: "Vérifié", 
      notes: "Notes",
      categories: {
        head: "Protection Tête",
        eye: "Protection Yeux",
        respiratory: "Protection Respiratoire",
        hand: "Protection Mains", 
        foot: "Protection Pieds",
        body: "Protection Corps",
        fall: "Protection Chute",
        electrical: "Protection Électrique",
        detection: "Détection",
        other: "Autre"
      }
    },
    
    hazards: {
      title: "Dangers Potentiels",
      selected: "Sélectionné",
      riskLevel: "Niveau de Risque",
      notes: "Notes supplémentaires",
      controlMeasures: "Moyens de Contrôle",
      controlsRequired: "⚠️ Moyens de contrôle requis",
      controlsInPlace: "VIGILANCE - Moyens de contrôle en place",
      levels: {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé", 
        critical: "Critique"
      },
      categories: {
        elimination: "Élimination",
        substitution: "Substitution",
        engineering: "Ingénierie",
        administrative: "Administrative",
        ppe: "EPI"
      }
    },
    
    team: {
      title: "Équipe de Travail",
      supervisor: "Superviseur",
      addMember: "Ajouter Membre d'Équipe",
      memberName: "Nom du Membre",
      employeeId: "ID Employé",
      department: "Département", 
      qualification: "Qualification",
      consultationAst: "Consultation AST",
      cadenasAppose: "Cadenas Apposé",
      status: "Statut",
      actions: "Actions",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté"
    },
    
    buttons: {
      previous: "Précédent",
      next: "Suivant", 
      save: "Sauvegarder",
      approve: "Approuver",
      reject: "Rejeter",
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer"
    },

    actions: {
      sendByEmail: "Envoyer par Courriel",
      archive: "Archiver",
      generatePDF: "Générer PDF",
      print: "Imprimer",
      finalApproval: "Soumission Finale"
    },

    email: {
      subject: "AST - Analyse Sécuritaire de Tâches",
      body: "Veuillez trouver ci-joint l'Analyse Sécuritaire de Tâches pour votre révision."
    }
  },
  
  en: {
    title: "New Job Safety Analysis",
    subtitle: "Adaptive form compliant with OHS standards", 
    saving: "Saving...",
    saved: "✅ Successfully saved",
    
    counters: {
      onJob: "On Job",
      approved: "JSA Approved",
      approvalRate: "Approval Rate"
    },
    
    steps: {
      general: "General Information",
      isolation: "Isolation Points", // MOVED TO POSITION 2
      discussion: "Team Discussion", // MOVED TO POSITION 3
      equipment: "Safety Equipment",
      hazards: "Hazards & Risks",
      team: "Work Team",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    
    workTypeFiltering: {
      title: "Work Type",
      subtitle: "Select work type(s) to filter relevant hazards",
      showAll: "Show All Hazards",
      showFiltered: "Filtered Hazards",
      noSelection: "No type selected"
    },
    
    buttons: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      approve: "Approve",
      reject: "Reject",
      add: "Add",
      edit: "Edit",
      delete: "Delete"
    },

    email: {
      subject: "JSA - Job Safety Analysis",
      body: "Please find attached the Job Safety Analysis for your review."
    }
  }
};
  // =================== AST SECTION 6A/6 - DONNÉES INITIALES ET FONCTIONS DE BASE ===================

// =================== DONNÉES INITIALES COMPLÈTES ===================
const initialFormData: ASTFormData = {
  id: `AST-${Date.now()}`,
  astNumber: generateASTNumber(),
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  language: 'fr',
  status: 'draft',
  industry: 'electrical',
  
  projectInfo: {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    client: '',
    clientPhone: '',
    projectNumber: '',
    astClientNumber: '',
    workLocation: '',
    workDescription: '',
    estimatedDuration: '',
    workerCount: 1,
    clientRepresentative: '',
    clientRepresentativePhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    workPermitRequired: false,
    workPermitNumber: '',
    weatherConditions: '',
    specialConditions: ''
  },
  
  // Nouveau système de filtrage
  hazardFiltering: {
    workTypes: [...workTypeFilters],
    showAllHazards: false,
    filteredHazards: []
  },
  
  teamDiscussion: {
    electricalCutoffPoints: '',
    electricalHazardExplanation: '',
    epiSpecificNotes: '',
    specialWorkConditions: '',
    emergencyProcedures: '',
    discussions: [...predefinedDiscussions],
    briefingCompleted: false,
    briefingDate: '',
    briefingTime: '',
    emergencyProceduresList: [...emergencyProcedures]
  },
  
  safetyEquipment: [...requiredSafetyEquipment],
  electricalHazards: [...predefinedElectricalHazards],
  riskAssessments: [],
  
  team: {
    supervisor: '',
    supervisorCertification: '',
    members: [],
    briefingCompleted: false,
    briefingDate: '',
    briefingTime: '',
    totalMembers: 0,
    acknowledgedMembers: 0,
    validations: [],
    allApproved: false
  },
  
  isolationPoints: [],
  
  documentation: {
    photos: [],
    additionalDocuments: [],
    inspectionNotes: '',
    correctiveActions: ''
  },
  
  validation: {
    completedBy: '',
    completedDate: '',
    reviewedBy: '',
    reviewedDate: '',
    approvedBy: '',
    approvedDate: '',
    clientApproval: false,
    finalApproval: false,
    revisionNumber: 1,
    comments: '',
    emailSent: false
  }
};

// =================== FONCTIONS SUPABASE AVEC AUDIT TRAIL ===================
interface AuditLogEntry {
  id: string;
  astId: string;
  userId: string;
  action: 'create' | 'update' | 'approve' | 'reject' | 'view' | 'sign';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes?: any;
  geoLocation?: { lat: number; lng: number };
}

const createAuditLog = async (astId: string, action: string, changes?: any): Promise<void> => {
  try {
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      astId,
      userId: 'current-user-id', // À remplacer par vraie auth
      action: action as any,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      changes,
      geoLocation: await getCurrentLocation()
    };
    
    // Sauvegarder dans Supabase audit_logs table
    console.log('Audit log created:', auditEntry);
  } catch (error) {
    console.error('Erreur création audit log:', error);
  }
};

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

const getCurrentLocation = (): Promise<{ lat: number; lng: number } | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      () => resolve(undefined),
      { timeout: 5000 }
    );
  });
};

const saveToSupabase = async (formData: ASTFormData, isAutoSave = false): Promise<boolean> => {
  try {
    console.log('💾 Sauvegarde Supabase en cours...', formData.astNumber);
    
    // Créer audit log
    await createAuditLog(formData.id, isAutoSave ? 'update' : 'create', formData);
    
    // Simuler la sauvegarde (remplacer par vraie logique Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Sauvegarde Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde Supabase:', error);
    return false;
  }
};

const archiveToSupabase = async (formData: ASTFormData, tenant: Tenant): Promise<ASTFormData> => {
  try {
    console.log('📁 Archivage Supabase en cours...');
    
    const archivedData: ASTFormData = {
      ...formData,
      status: 'archived',
      validation: {
        ...formData.validation,
        archivedDate: new Date().toISOString()
      }
    };
    
    await createAuditLog(formData.id, 'update', { status: 'archived' });
    
    // Simuler l'archivage
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Archivage Supabase réussi');
    return archivedData;
  } catch (error) {
    console.error('❌ Erreur archivage Supabase:', error);
    throw error;
  }
};

// =================== FONCTIONS VALIDATION INTELLIGENTE ===================
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const validateFormData = (formData: ASTFormData, language: 'fr' | 'en'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validation champs obligatoires
  if (!formData.projectInfo.client.trim()) {
    errors.push(language === 'fr' ? 'Client requis' : 'Client required');
  }
  
  if (!formData.projectInfo.projectNumber.trim()) {
    errors.push(language === 'fr' ? 'Numéro de projet requis' : 'Project number required');
  }
  
  if (!formData.projectInfo.workDescription.trim()) {
    errors.push(language === 'fr' ? 'Description des travaux requise' : 'Work description required');
  }
  
  // Validation équipe vs nombre déclaré
  if (formData.team.members.length !== formData.projectInfo.workerCount) {
    warnings.push(
      language === 'fr' 
        ? `Équipe (${formData.team.members.length}) différente du nombre déclaré (${formData.projectInfo.workerCount})`
        : `Team size (${formData.team.members.length}) differs from declared (${formData.projectInfo.workerCount})`
    );
  }
  
  // Validation dangers sélectionnés avec moyens de contrôle
  const selectedHazardsWithoutControls = formData.electricalHazards.filter(h => 
    h.isSelected && !h.controlMeasures.some(c => c.isSelected)
  );
  
  if (selectedHazardsWithoutControls.length > 0) {
    errors.push(
      language === 'fr'
        ? `${selectedHazardsWithoutControls.length} danger(s) sans moyens de contrôle`
        : `${selectedHazardsWithoutControls.length} hazard(s) without control measures`
    );
  }
  
  // Validation équipements requis vs vérifiés
  const requiredEquipment = formData.safetyEquipment.filter(eq => eq.required);
  const verifiedEquipment = requiredEquipment.filter(eq => eq.verified);
  
  if (requiredEquipment.length > 0 && verifiedEquipment.length < requiredEquipment.length) {
    warnings.push(
      language === 'fr'
        ? `${requiredEquipment.length - verifiedEquipment.length} équipement(s) requis non vérifiés`
        : `${requiredEquipment.length - verifiedEquipment.length} required equipment(s) not verified`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// =================== FONCTIONS SIGNATURES ÉLECTRONIQUES ===================
interface ElectronicSignature {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  ipAddress: string;
  geoLocation?: { lat: number; lng: number };
  consentText: string;
  signatureHash: string; // Hash cryptographique
}

const createElectronicSignature = async (
  employeeId: string, 
  employeeName: string, 
  consentText: string
): Promise<ElectronicSignature> => {
  const timestamp = new Date().toISOString();
  const ipAddress = await getClientIP();
  const geoLocation = await getCurrentLocation();
  
  // Créer hash cryptographique pour intégrité
  const dataToHash = `${employeeId}-${employeeName}-${timestamp}-${ipAddress}`;
  const signatureHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataToHash))
    .then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  return {
    id: `sig-${Date.now()}`,
    employeeId,
    employeeName,
    timestamp,
    ipAddress,
    geoLocation,
    consentText,
    signatureHash
  };
};

// =================== FONCTIONS TEMPLATES ET CLIENTS ===================
interface ClientTemplate {
  id: string;
  clientName: string;
  defaultWorkTypes: string[];
  requiredFields: string[];
  customHazards: string[];
  emergencyContacts: { name: string; phone: string }[];
}

const clientTemplates: ClientTemplate[] = [
  {
    id: 'hydro-qc',
    clientName: 'Hydro-Québec',
    defaultWorkTypes: ['electrical', 'heights'],
    requiredFields: ['workPermitNumber', 'emergencyContact'],
    customHazards: ['ENERGY-002', 'ELECT-003'],
    emergencyContacts: [
      { name: 'Dispatching', phone: '1-800-HYDRO-1' },
      { name: 'Sécurité', phone: '514-289-5555' }
    ]
  },
  {
    id: 'gaz-metro',
    clientName: 'Énergir (Gaz Métro)',
    defaultWorkTypes: ['excavation', 'chemical'],
    requiredFields: ['workPermitNumber'],
    customHazards: ['ENERGY-001', 'CONST-001'],
    emergencyContacts: [
      { name: 'Urgence Gaz', phone: '911' },
      { name: 'Info-Excavation', phone: '1-800-663-9228' }
    ]
  }
];

const getClientTemplate = (clientName: string): ClientTemplate | undefined => {
  return clientTemplates.find(template => 
    template.clientName.toLowerCase().includes(clientName.toLowerCase())
  );
};

const applyClientTemplate = (formData: ASTFormData, template: ClientTemplate): ASTFormData => {
  return {
    ...formData,
    // Appliquer types de travaux par défaut
    hazardFiltering: {
      ...formData.hazardFiltering,
      workTypes: formData.hazardFiltering.workTypes.map(wt => ({
        ...wt,
        isSelected: template.defaultWorkTypes.includes(wt.id)
      }))
    },
    // Pré-sélectionner dangers spécifiques client
    electricalHazards: formData.electricalHazards.map(h => ({
      ...h,
      isSelected: template.customHazards.includes(h.id)
    })),
    // Ajouter contacts d'urgence
    projectInfo: {
      ...formData.projectInfo,
      emergencyContact: template.emergencyContacts[0]?.name || '',
      emergencyPhone: template.emergencyContacts[0]?.phone || ''
    }
  };
};
// =================== AST SECTION 6B/6 - FONCTIONS AVANCÉES ET GESTION ÉQUIPE ===================

// =================== SYSTÈME DE FILTRAGE INTELLIGENT DES DANGERS ===================
const filterHazardsByWorkType = (
  allHazards: ElectricalHazard[], 
  selectedWorkTypes: string[], 
  showAll: boolean
): ElectricalHazard[] => {
  if (showAll || selectedWorkTypes.length === 0) {
    return allHazards;
  }
  
  const workTypeFilters = workTypeFilters.filter(wt => selectedWorkTypes.includes(wt.id));
  const associatedHazardIds = new Set(
    workTypeFilters.flatMap(wt => wt.associatedHazards)
  );
  
  return allHazards.filter(hazard => associatedHazardIds.has(hazard.id));
};

const updateWorkTypeSelection = (
  filtering: HazardFiltering, 
  workTypeId: string, 
  isSelected: boolean
): HazardFiltering => {
  const updatedWorkTypes = filtering.workTypes.map(wt => 
    wt.id === workTypeId ? { ...wt, isSelected } : wt
  );
  
  const selectedTypes = updatedWorkTypes.filter(wt => wt.isSelected).map(wt => wt.id);
  const filteredHazardIds = updatedWorkTypes
    .filter(wt => wt.isSelected)
    .flatMap(wt => wt.associatedHazards);
  
  return {
    workTypes: updatedWorkTypes,
    showAllHazards: filtering.showAllHazards,
    filteredHazards: [...new Set(filteredHazardIds)]
  };
};

// =================== GESTION ÉQUIPE AVEC HORODATAGE PRÉCIS ===================
interface TeamMemberConsultation {
  memberId: string;
  consultationStarted: string;
  knowledgeAcknowledged?: string;
  lockoutApplied?: string;
  finalConsent?: string;
  ipAddress: string;
  deviceInfo: string;
  signature: ElectronicSignature;
}

const startEmployeeConsultation = async (memberId: string): Promise<void> => {
  const consultation: TeamMemberConsultation = {
    memberId,
    consultationStarted: new Date().toISOString(),
    ipAddress: await getClientIP(),
    deviceInfo: navigator.userAgent,
    signature: await createElectronicSignature(memberId, '', 'Consultation démarrée')
  };
  
  // Sauvegarder dans localStorage pour persistance
  localStorage.setItem(`consultation-${memberId}`, JSON.stringify(consultation));
  
  // Audit log
  await createAuditLog('ast-current', 'view', { memberId, action: 'consultation_started' });
};

const acknowledgeKnowledge = async (memberId: string, memberName: string): Promise<void> => {
  const consultationData = localStorage.getItem(`consultation-${memberId}`);
  if (!consultationData) throw new Error('Consultation non démarrée');
  
  const consultation = JSON.parse(consultationData);
  consultation.knowledgeAcknowledged = new Date().toISOString();
  
  localStorage.setItem(`consultation-${memberId}`, JSON.stringify(consultation));
  
  await createAuditLog('ast-current', 'update', { 
    memberId, 
    action: 'knowledge_acknowledged',
    memberName 
  });
};

const confirmLockoutApplied = async (memberId: string, memberName: string): Promise<void> => {
  const consultationData = localStorage.getItem(`consultation-${memberId}`);
  if (!consultationData) throw new Error('Consultation non démarrée');
  
  const consultation = JSON.parse(consultationData);
  consultation.lockoutApplied = new Date().toISOString();
  
  localStorage.setItem(`consultation-${memberId}`, JSON.stringify(consultation));
  
  await createAuditLog('ast-current', 'update', { 
    memberId, 
    action: 'lockout_applied',
    memberName 
  });
};

const provideFinalConsent = async (
  memberId: string, 
  memberName: string, 
  consentText: string
): Promise<ElectronicSignature> => {
  const consultationData = localStorage.getItem(`consultation-${memberId}`);
  if (!consultationData) throw new Error('Consultation non démarrée');
  
  const consultation = JSON.parse(consultationData);
  
  if (!consultation.knowledgeAcknowledged) {
    throw new Error('Connaissance AST non confirmée');
  }
  
  if (!consultation.lockoutApplied) {
    throw new Error('Application cadenas non confirmée');
  }
  
  const signature = await createElectronicSignature(memberId, memberName, consentText);
  
  consultation.finalConsent = new Date().toISOString();
  consultation.signature = signature;
  
  localStorage.setItem(`consultation-${memberId}`, JSON.stringify(consultation));
  
  await createAuditLog('ast-current', 'sign', { 
    memberId, 
    memberName,
    signature: signature.signatureHash 
  });
  
  return signature;
};

// =================== MODE HORS-LIGNE / PWA ===================
interface OfflineQueue {
  id: string;
  action: 'save' | 'update' | 'approve';
  data: any;
  timestamp: string;
  retryCount: number;
}

const offlineQueue: OfflineQueue[] = [];

const addToOfflineQueue = (action: string, data: any): void => {
  const queueItem: OfflineQueue = {
    id: `offline-${Date.now()}`,
    action: action as any,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0
  };
  
  offlineQueue.push(queueItem);
  localStorage.setItem('ast-offline-queue', JSON.stringify(offlineQueue));
};

const processOfflineQueue = async (): Promise<void> => {
  if (!navigator.onLine) return;
  
  const queue = JSON.parse(localStorage.getItem('ast-offline-queue') || '[]');
  
  for (const item of queue) {
    try {
      switch (item.action) {
        case 'save':
          await saveToSupabase(item.data);
          break;
        case 'update':
          await saveToSupabase(item.data, true);
          break;
        case 'approve':
          await approveTeamMember(item.data.memberId, item.data.approved);
          break;
      }
      
      // Retirer de la queue si succès
      const updatedQueue = queue.filter((q: OfflineQueue) => q.id !== item.id);
      localStorage.setItem('ast-offline-queue', JSON.stringify(updatedQueue));
      
    } catch (error) {
      console.error('Erreur traitement queue offline:', error);
      item.retryCount++;
      
      // Abandonner après 3 tentatives
      if (item.retryCount >= 3) {
        const updatedQueue = queue.filter((q: OfflineQueue) => q.id !== item.id);
        localStorage.setItem('ast-offline-queue', JSON.stringify(updatedQueue));
      }
    }
  }
};

// Écouter le retour en ligne
window.addEventListener('online', processOfflineQueue);

// =================== INTÉGRATION MÉTÉO ENVIRONNEMENT CANADA ===================
interface WeatherData {
  location: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  conditions: string;
  alerts: string[];
  workSafetyStatus: 'safe' | 'caution' | 'stop';
}

const getWeatherData = async (location: string): Promise<WeatherData | null> => {
  try {
    // API Environnement Canada (exemple - remplacer par vraie API)
    const response = await fetch(`https://api.weather.gc.ca/conditions/${encodeURIComponent(location)}`);
    
    if (!response.ok) {
      // Fallback vers service tiers
      return await getFallbackWeather(location);
    }
    
    const data = await response.json();
    
    // Évaluer conditions sécurité travail
    const workSafetyStatus = evaluateWorkSafety(data);
    
    return {
      location: data.location,
      temperature: data.temperature,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      visibility: data.visibility,
      conditions: data.conditions,
      alerts: data.alerts || [],
      workSafetyStatus
    };
  } catch (error) {
    console.error('Erreur récupération météo:', error);
    return null;
  }
};

const getFallbackWeather = async (location: string): Promise<WeatherData | null> => {
  try {
    // Utiliser OpenWeatherMap ou autre service de secours
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=YOUR_API_KEY&units=metric&lang=fr`);
    const data = await response.json();
    
    return {
      location: data.name,
      temperature: data.main.temp,
      windSpeed: data.wind.speed * 3.6, // Convertir m/s en km/h
      windDirection: getWindDirection(data.wind.deg),
      visibility: (data.visibility || 10000) / 1000, // Convertir en km
      conditions: data.weather[0].description,
      alerts: [],
      workSafetyStatus: evaluateWorkSafety({
        windSpeed: data.wind.speed * 3.6,
        temperature: data.main.temp,
        conditions: data.weather[0].main
      })
    };
  } catch (error) {
    console.error('Erreur météo fallback:', error);
    return null;
  }
};

const evaluateWorkSafety = (weatherData: any): 'safe' | 'caution' | 'stop' => {
  // Arrêt obligatoire si vent > 39 km/h (grues)
  if (weatherData.windSpeed > 39) {
    return 'stop';
  }
  
  // Prudence si conditions difficiles
  if (
    weatherData.windSpeed > 25 ||
    weatherData.temperature < -20 ||
    weatherData.temperature > 35 ||
    ['thunderstorm', 'snow', 'fog'].includes(weatherData.conditions?.toLowerCase())
  ) {
    return 'caution';
  }
  
  return 'safe';
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  return directions[Math.round(degrees / 22.5) % 16];
};

// =================== NOTIFICATIONS INTELLIGENTES ===================
interface NotificationRule {
  id: string;
  type: 'equipment_expiry' | 'training_expiry' | 'weather_alert' | 'signature_missing';
  condition: any;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
}

const checkNotificationRules = async (formData: ASTFormData): Promise<void> => {
  const notifications: string[] = [];
  
  // Vérifier équipements expirés
  const expiredEquipment = formData.safetyEquipment.filter(eq => {
    // Logique vérification expiration basée sur notes ou autre champ
    return eq.required && !eq.verified;
  });
  
  if (expiredEquipment.length > 0) {
    notifications.push(`${expiredEquipment.length} équipement(s) non vérifiés`);
  }
  
  // Vérifier signatures manquantes
  const pendingSignatures = formData.team.members.filter(m => m.validationStatus === 'pending');
  if (pendingSignatures.length > 0) {
    notifications.push(`${pendingSignatures.length} signature(s) en attente`);
  }
  
  // Vérifier conditions météo
  const weather = await getWeatherData(formData.projectInfo.workLocation);
  if (weather && weather.workSafetyStatus === 'stop') {
    notifications.push(`Conditions météo dangereuses: ${weather.conditions}`);
  }
  
  // Afficher notifications si nécessaire
  if (notifications.length > 0) {
    showNotifications(notifications);
  }
};

const showNotifications = (messages: string[]): void => {
  // Créer toast notifications ou modal
  messages.forEach(message => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('AST - Alerte Sécurité', {
        body: message,
        icon: '/ast-icon.png'
      });
    } else {
      console.log('Notification:', message);
    }
  });
};

// Demander permission notifications
const requestNotificationPermission = (): void => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// =================== SAUVEGARDE AUTOMATIQUE INTELLIGENTE ===================
let autoSaveTimeout: NodeJS.Timeout;
let lastSaveData: string = '';

const scheduleAutoSave = (formData: ASTFormData, saveFunction: Function): void => {
  clearTimeout(autoSaveTimeout);
  
  // Éviter sauvegarde si pas de changement
  const currentDataString = JSON.stringify(formData);
  if (currentDataString === lastSaveData) return;
  
  autoSaveTimeout = setTimeout(async () => {
    try {
      if (navigator.onLine) {
        await saveFunction(formData, true); // auto-save
        lastSaveData = currentDataString;
      } else {
        addToOfflineQueue('update', formData);
      }
    } catch (error) {
      console.error('Erreur auto-save:', error);
    }
  }, 30000); // 30 secondes
};

// =================== VALIDATION AVANCÉE EN TEMPS RÉEL ===================
const validateField = (fieldName: string, value: any, formData: ASTFormData): string[] => {
  const errors: string[] = [];
  
  switch (fieldName) {
    case 'client':
      if (!value.trim()) {
        errors.push('Client requis');
      } else {
        // Vérifier si client existe dans base
        const template = getClientTemplate(value);
        if (template) {
          // Suggérer application template
          console.log('Template trouvé pour client:', template.clientName);
        }
      }
      break;
      
    case 'workerCount':
      if (value < 1 || value > 100) {
        errors.push('Nombre de travailleurs invalide (1-100)');
      }
      if (formData.team.members.length > 0 && value !== formData.team.members.length) {
        errors.push(`Incohérence: ${formData.team.members.length} membres vs ${value} déclarés`);
      }
      break;
      
    case 'emergencyPhone':
      if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
        errors.push('Format téléphone invalide');
      }
      break;
  }
  
  return errors;
};
// =================== AST SECTION 6C/6 - COMPOSANT PRINCIPAL ET INTERFACE JSX ===================

// =================== STYLES CSS PREMIUM MOBILE OPTIMISÉ ===================
const premiumStyles = `
.form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.glass-effect {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 1200px;
  margin: 0 auto;
}

.save-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.save-indicator.saving {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  animation: pulse 2s infinite;
}

.save-indicator.saved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.save-indicator.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.work-type-filter {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.work-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.work-type-item {
  padding: 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.work-type-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
}

.work-type-item.selected {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.work-type-icon {
  font-size: 32px;
  line-height: 1;
}

.weather-widget {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.weather-alert {
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  font-weight: 600;
}

.weather-alert.safe {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.weather-alert.caution {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #f59e0b;
}

.weather-alert.stop {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.employee-consultation {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.consultation-step {
  padding: 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #64748b;
}

.consultation-step.completed {
  border-left-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.consultation-step.current {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.signature-pad {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  width: 100%;
  height: 200px;
  margin: 16px 0;
}

/* Styles responsifs mobiles */
@media (max-width: 768px) {
  .form-container {
    padding: 10px;
  }

  .glass-effect {
    padding: 16px;
    border-radius: 16px;
  }

  .work-type-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .work-type-item {
    padding: 12px;
  }

  .work-type-icon {
    font-size: 24px;
  }

  .employee-consultation {
    padding: 16px;
    margin: 0 10px;
  }
}
`;

// =================== COMPOSANT PRINCIPAL AST ULTRA PREMIUM ===================
export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ASTFormData>(initialFormData);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isEmployeeMode, setIsEmployeeMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<string>('');

  const steps = [
    { icon: FileText, key: 'general' as const },
    { icon: Settings, key: 'isolation' as const }, // Position 2
    { icon: MessageSquare, key: 'discussion' as const }, // Position 3
    { icon: Shield, key: 'equipment' as const },
    { icon: Zap, key: 'hazards' as const },
    { icon: Users, key: 'team' as const },
    { icon: Camera, key: 'documentation' as const },
    { icon: CheckCircle, key: 'validation' as const }
  ];

  const t = translations[language];

  // Injection styles CSS
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = premiumStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  // Auto-save intelligent
  useEffect(() => {
    scheduleAutoSave(formData, handleSave);
  }, [formData]);

  // Validation temps réel
  useEffect(() => {
    const validation = validateFormData(formData, language);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
  }, [formData, language]);

  // Charger météo
  useEffect(() => {
    if (formData.projectInfo.workLocation) {
      getWeatherData(formData.projectInfo.workLocation).then(setWeatherData);
    }
  }, [formData.projectInfo.workLocation]);

  // Demander permissions notifications
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ========== FONCTIONS PRINCIPALES ==========
  const handleSave = async (isDraft = true, isAutoSave = false) => {
    setSaveStatus('saving');
    
    try {
      const success = navigator.onLine 
        ? await saveToSupabase(formData, isAutoSave)
        : (addToOfflineQueue(isDraft ? 'update' : 'save', formData), true);
      
      if (success) {
        setSaveStatus('saved');
        setFormData(prev => ({
          ...prev,
          lastModified: new Date().toISOString(),
          status: isDraft ? 'draft' : 'completed'
        }));
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), isAutoSave ? 2000 : 3000);
    }
  };

  // ========== FONCTIONS FILTRAGE DANGERS ==========
  const handleWorkTypeToggle = (workTypeId: string) => {
    const currentlySelected = formData.hazardFiltering.workTypes.find(wt => wt.id === workTypeId)?.isSelected || false;
    
    const updatedFiltering = updateWorkTypeSelection(
      formData.hazardFiltering, 
      workTypeId, 
      !currentlySelected
    );
    
    setFormData(prev => ({
      ...prev,
      hazardFiltering: updatedFiltering
    }));
  };

  const toggleShowAllHazards = () => {
    setFormData(prev => ({
      ...prev,
      hazardFiltering: {
        ...prev.hazardFiltering,
        showAllHazards: !prev.hazardFiltering.showAllHazards
      }
    }));
  };

  const getFilteredHazards = (): ElectricalHazard[] => {
    const selectedWorkTypes = formData.hazardFiltering.workTypes
      .filter(wt => wt.isSelected)
      .map(wt => wt.id);
    
    return filterHazardsByWorkType(
      formData.electricalHazards,
      selectedWorkTypes,
      formData.hazardFiltering.showAllHazards
    );
  };

  // ========== FONCTIONS ÉQUIPE ==========
  const addTeamMember = (memberData: Partial<TeamMember>) => {
    if (!memberData.name?.trim()) return;
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: memberData.name.trim(),
      employeeId: memberData.employeeId || '',
      department: memberData.department || '',
      qualification: memberData.qualification || '',
      hasAcknowledged: false,
      joinedAt: new Date().toISOString(),
      validationStatus: 'pending',
      consultationAst: false,
      cadenasAppose: false,
      cadenasReleve: false
    };
    
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: [...prev.team.members, newMember]
      }
    }));
  };

  const approveTeamMember = async (memberId: string, approved: boolean) => {
    try {
      if (navigator.onLine) {
        await createAuditLog(formData.id, approved ? 'approve' : 'reject', { memberId });
      }
      
      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          members: prev.team.members.map(m =>
            m.id === memberId 
              ? { ...m, validationStatus: approved ? 'approved' : 'rejected' as any }
              : m
          ),
          allApproved: prev.team.members.every(m => 
            m.id === memberId ? approved : m.validationStatus === 'approved'
          )
        }
      }));
    } catch (error) {
      console.error('Erreur approbation membre:', error);
    }
  };

  // ========== COMPOSANT WIDGET MÉTÉO ==========
  const WeatherWidget = () => {
    if (!weatherData) return null;

    return (
      <div className="weather-widget">
        <h4 style={{ color: '#3b82f6', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          🌤️ Conditions Météo - {weatherData.location}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Température:</span>
            <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{weatherData.temperature}°C</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Vent:</span>
            <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{weatherData.windSpeed} km/h {weatherData.windDirection}</div>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Conditions:</span>
            <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{weatherData.conditions}</div>
          </div>
        </div>
        
        <div className={`weather-alert ${weatherData.workSafetyStatus}`}>
          {weatherData.workSafetyStatus === 'safe' && '✅ Conditions sécuritaires pour travail'}
          {weatherData.workSafetyStatus === 'caution' && '⚠️ Prudence recommandée'}
          {weatherData.workSafetyStatus === 'stop' && '🛑 Conditions dangereuses - Arrêt travaux recommandé'}
        </div>
      </div>
    );
  };

  // ========== COMPOSANT CONSULTATION EMPLOYÉ ==========
  const EmployeeConsultationMode = () => {
    const [consultationStep, setConsultationStep] = useState(0);
    const [employeeName, setEmployeeName] = useState('');
    const [hasAcknowledged, setHasAcknowledged] = useState(false);
    const [hasAppliedLock, setHasAppliedLock] = useState(false);
    const [finalConsent, setFinalConsent] = useState(false);

    const consultationSteps = [
      { title: 'Identification', description: 'Entrez votre nom complet' },
      { title: 'Consultation AST', description: 'Prenez connaissance de l\'AST' },
      { title: 'Application cadenas', description: 'Confirmez l\'application de votre cadenas' },
      { title: 'Consentement final', description: 'Donnez votre consentement final' }
    ];

    const handleFinalSubmit = async () => {
      try {
        const signature = await provideFinalConsent(
          currentEmployee,
          employeeName,
          'J\'ai pris connaissance de l\'AST et j\'accepte les conditions de sécurité'
        );
        
        // Mettre à jour le membre dans formData
        await approveTeamMember(currentEmployee, true);
        
        alert('Consultation complétée avec succès !');
        setIsEmployeeMode(false);
      } catch (error) {
        alert('Erreur lors de la finalisation: ' + error.message);
      }
    };

    return (
      <div className="employee-consultation">
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '24px' }}>
          🔐 Consultation AST - Employé
        </h2>

        {/* Étapes de consultation */}
        {consultationSteps.map((step, index) => (
          <div 
            key={index}
            className={`consultation-step ${
              index < consultationStep ? 'completed' : 
              index === consultationStep ? 'current' : ''
            }`}
          >
            <h4 style={{ margin: '0 0 8px 0', color: 'white' }}>
              {index + 1}. {step.title}
            </h4>
            <p style={{ margin: '0', color: '#94a3b8', fontSize: '14px' }}>
              {step.description}
            </p>

            {/* Contenu spécifique à chaque étape */}
            {index === consultationStep && (
              <div style={{ marginTop: '16px' }}>
                {consultationStep === 0 && (
                  <div>
                    <input
                      type="text"
                      placeholder="Votre nom complet"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (employeeName.trim()) {
                          startEmployeeConsultation(currentEmployee);
                          setConsultationStep(1);
                        }
                      }}
                      disabled={!employeeName.trim()}
                      className="btn-premium"
                    >
                      Commencer Consultation
                    </button>
                  </div>
                )}

                {consultationStep === 1 && (
                  <div>
                    <div style={{ 
                      background: 'rgba(15, 23, 42, 0.8)', 
                      padding: '16px', 
                      borderRadius: '8px',
                      marginBottom: '16px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      <h5 style={{ color: '#3b82f6', marginBottom: '12px' }}>
                        Résumé AST - {formData.astNumber}
                      </h5>
                      <p><strong>Client:</strong> {formData.projectInfo.client}</p>
                      <p><strong>Travaux:</strong> {formData.projectInfo.workDescription}</p>
                      <p><strong>Dangers identifiés:</strong> {formData.electricalHazards.filter(h => h.isSelected).length}</p>
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasAcknowledged}
                        onChange={(e) => {
                          setHasAcknowledged(e.target.checked);
                          if (e.target.checked) {
                            acknowledgeKnowledge(currentEmployee, employeeName);
                          }
                        }}
                      />
                      <span style={{ color: '#e2e8f0' }}>
                        J'ai pris connaissance de l'AST et des dangers identifiés
                      </span>
                    </label>
                    
                    <button
                      onClick={() => setConsultationStep(2)}
                      disabled={!hasAcknowledged}
                      className="btn-premium"
                      style={{ marginTop: '16px' }}
                    >
                      Étape Suivante
                    </button>
                  </div>
                )}

                {consultationStep === 2 && (
                  <div>
                    <p style={{ color: '#e2e8f0', marginBottom: '16px' }}>
                      Confirmez que vous avez appliqué votre cadenas personnel sur tous les points d'isolement requis.
                    </p>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasAppliedLock}
                        onChange={(e) => {
                          setHasAppliedLock(e.target.checked);
                          if (e.target.checked) {
                            confirmLockoutApplied(currentEmployee, employeeName);
                          }
                        }}
                      />
                      <span style={{ color: '#e2e8f0' }}>
                        Mon cadenas personnel a été appliqué
                      </span>
                    </label>
                    
                    <button
                      onClick={() => setConsultationStep(3)}
                      disabled={!hasAppliedLock}
                      className="btn-premium"
                      style={{ marginTop: '16px' }}
                    >
                      Étape Finale
                    </button>
                  </div>
                )}

                {consultationStep === 3 && (
                  <div>
                    <p style={{ color: '#e2e8f0', marginBottom: '16px' }}>
                      En cochant cette case, je confirme avoir pris connaissance de l'AST, 
                      avoir appliqué mon cadenas et accepte de travailler selon les conditions de sécurité établies.
                    </p>
                    
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ color: '#ef4444', fontSize: '14px', margin: '0' }}>
                        <strong>ATTENTION:</strong> Cette signature électronique a valeur légale. 
                        L'heure, votre adresse IP et votre localisation seront enregistrées.
                      </p>
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={finalConsent}
                        onChange={(e) => setFinalConsent(e.target.checked)}
                      />
                      <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
                        JE CONSENS - {new Date().toLocaleString('fr-CA')}
                      </span>
                    </label>
                    
                    <button
                      onClick={handleFinalSubmit}
                      disabled={!finalConsent}
                      className="btn-success"
                      style={{ marginTop: '16px', width: '100%', padding: '16px' }}
                    >
                      ✅ Finaliser ma Consultation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => setIsEmployeeMode(false)}
          className="btn-secondary"
          style={{ marginTop: '24px' }}
        >
          Retour Mode Gestionnaire
        </button>
      </div>
    );
  };
  // =================== AST SECTION 6D/6 - INTERFACE JSX ÉTAPES 1-4 ===================

// =================== CALCULS POUR COMPTEURS ET INDICATEURS ===================
const approvedMembersCount = formData.team.members.filter(m => m.validationStatus === 'approved').length;
const approvalRate = formData.team.members.length > 0 ? 
  Math.round((approvedMembersCount / formData.team.members.length) * 100) : 0;

const completedIsolationPoints = formData.isolationPoints.filter(point => 
  point.checklist.cadenasAppose && 
  point.checklist.absenceTension && 
  point.checklist.miseALaTerre && 
  point.checklist.essaisEffectues
).length;

const totalSafetyEquipment = formData.requiredEquipment.length;
const selectedHazards = formData.selectedHazards.length;

// =================== RETOUR JSX PRINCIPAL ===================
return (
  <div className="form-container">
    <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />
    
    {/* OVERLAY DE CONSULTATION EMPLOYÉ */}
    {showEmployeeConsultation && (
      <div className="modal-overlay" onClick={() => setShowEmployeeConsultation(false)}>
        <div className="modal-content employee-consultation" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              <Users style={{ width: '20px', height: '20px' }} />
              {currentLanguage === 'fr' ? 'Consultation AST' : 'AST Consultation'}
            </h3>
            <button 
              className="modal-close"
              onClick={() => setShowEmployeeConsultation(false)}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          
          <div className="consultation-content">
            <div className="ast-summary">
              <h4>{currentLanguage === 'fr' ? 'Résumé AST' : 'AST Summary'}</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>{currentLanguage === 'fr' ? 'Projet' : 'Project'}:</span>
                  <strong>{formData.project.name}</strong>
                </div>
                <div className="summary-item">
                  <span>{currentLanguage === 'fr' ? 'Client' : 'Client'}:</span>
                  <strong>{formData.project.client}</strong>
                </div>
                <div className="summary-item">
                  <span>{currentLanguage === 'fr' ? 'Dangers identifiés' : 'Identified Hazards'}:</span>
                  <strong>{selectedHazards}</strong>
                </div>
                <div className="summary-item">
                  <span>{currentLanguage === 'fr' ? 'Points d\'isolement' : 'Isolation Points'}:</span>
                  <strong>{completedIsolationPoints}/{formData.isolationPoints.length}</strong>
                </div>
              </div>
            </div>
            
            <div className="employee-checklist">
              <h4>{currentLanguage === 'fr' ? 'Confirmation Employé' : 'Employee Confirmation'}</h4>
              
              <div className="form-group">
                <label>{currentLanguage === 'fr' ? 'Nom complet' : 'Full Name'} *</label>
                <input
                  type="text"
                  value={employeeConsultation.employeeName}
                  onChange={(e) => setEmployeeConsultation(prev => ({
                    ...prev,
                    employeeName: e.target.value
                  }))}
                  placeholder={currentLanguage === 'fr' ? 'Entrez votre nom complet' : 'Enter your full name'}
                />
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={employeeConsultation.acknowledgedAST}
                    onChange={(e) => {
                      setEmployeeConsultation(prev => ({
                        ...prev,
                        acknowledgedAST: e.target.checked,
                        acknowledgeTime: e.target.checked ? new Date().toISOString() : null
                      }));
                    }}
                  />
                  <span className="checkmark"></span>
                  {currentLanguage === 'fr' ? 'J\'ai pris connaissance de l\'AST' : 'I have reviewed the AST'}
                </label>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={employeeConsultation.lockApplied}
                    onChange={(e) => {
                      setEmployeeConsultation(prev => ({
                        ...prev,
                        lockApplied: e.target.checked,
                        lockTime: e.target.checked ? new Date().toISOString() : null
                      }));
                    }}
                  />
                  <span className="checkmark"></span>
                  {currentLanguage === 'fr' ? 'Mon cadenas a été appliqué' : 'My lock has been applied'}
                </label>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label consent-checkbox">
                  <input
                    type="checkbox"
                    checked={employeeConsultation.consented}
                    onChange={(e) => {
                      setEmployeeConsultation(prev => ({
                        ...prev,
                        consented: e.target.checked,
                        consentTime: e.target.checked ? new Date().toISOString() : null
                      }));
                    }}
                  />
                  <span className="checkmark"></span>
                  <strong>{currentLanguage === 'fr' ? 'Je consens - Heure exacte enregistrée' : 'I consent - Exact time recorded'}</strong>
                </label>
              </div>
              
              {employeeConsultation.consentTime && (
                <div className="consent-timestamp">
                  <Clock style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Consentement enregistré le' : 'Consent recorded on'}: {' '}
                  <strong>{new Date(employeeConsultation.consentTime).toLocaleString('fr-CA')}</strong>
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowEmployeeConsultation(false)}
                >
                  {currentLanguage === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button 
                  className="btn-premium"
                  onClick={submitEmployeeConsultation}
                  disabled={!employeeConsultation.employeeName || !employeeConsultation.acknowledgedAST || 
                           !employeeConsultation.lockApplied || !employeeConsultation.consented}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Confirmer' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* INDICATEUR DE SAUVEGARDE */}
    {saveStatus !== 'idle' && (
      <div className={`save-indicator ${saveStatus}`}>
        {saveStatus === 'saving' && (
          <>
            <div className="spinner"></div>
            {t.saving}
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check style={{ width: '16px', height: '16px' }} />
            {t.saved}
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <AlertCircle style={{ width: '16px', height: '16px' }} />
            {currentLanguage === 'fr' ? 'Erreur de sauvegarde' : 'Save error'}
          </>
        )}
        {saveStatus === 'offline' && (
          <>
            <WifiOff style={{ width: '16px', height: '16px' }} />
            {currentLanguage === 'fr' ? 'Sauvegardé hors-ligne' : 'Saved offline'}
          </>
        )}
      </div>
    )}

    {/* EN-TÊTE AVEC LOGO ET INFORMATIONS */}
    <div className="header-section">
      <div className="header-brand">
        <div 
          className="company-logo"
          dangerouslySetInnerHTML={{ __html: CLIENT_POTENTIEL_LOGO }}
        />
        <div className="header-info">
          <h1>{t.title}</h1>
          <div className="header-meta">
            <span className="ast-number">AST #{formData.id}</span>
            <span className="creation-date">
              {new Date(formData.createdAt).toLocaleDateString(currentLanguage === 'fr' ? 'fr-CA' : 'en-CA')}
            </span>
            {formData.status && (
              <span className={`status-badge ${formData.status}`}>
                {formData.status === 'draft' && (currentLanguage === 'fr' ? 'Brouillon' : 'Draft')}
                {formData.status === 'in_progress' && (currentLanguage === 'fr' ? 'En cours' : 'In Progress')}
                {formData.status === 'completed' && (currentLanguage === 'fr' ? 'Complété' : 'Completed')}
                {formData.status === 'approved' && (currentLanguage === 'fr' ? 'Approuvé' : 'Approved')}
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setCurrentLanguage(currentLanguage === 'fr' ? 'en' : 'fr')}
            className="language-toggle"
            title={currentLanguage === 'fr' ? 'Switch to English' : 'Passer au français'}
          >
            {currentLanguage === 'fr' ? '🇺🇸 EN' : '🇫🇷 FR'}
          </button>
          
          <button
            onClick={() => setShowEmployeeConsultation(true)}
            className="btn-secondary employee-consultation-btn"
            title={currentLanguage === 'fr' ? 'Consultation Employé' : 'Employee Consultation'}
          >
            <Users style={{ width: '16px', height: '16px' }} />
            {currentLanguage === 'fr' ? 'Consultation' : 'Consultation'}
          </button>
        </div>
      </div>

      {/* COMPTEURS DE PROGRESSION */}
      <div className="header-counters">
        <div className="counters-grid">
          <div className="counter-item team">
            <Users style={{ width: '20px', height: '20px' }} />
            <div className="counter-content">
              <span className="counter-value">{approvedMembersCount}/{formData.team.members.length}</span>
              <span className="counter-label">{t.counters.team}</span>
            </div>
            <div className="progress-ring">
              <svg width="40" height="40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#334155" strokeWidth="3"/>
                <circle 
                  cx="20" 
                  cy="20" 
                  r="16" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - approvalRate / 100)}`}
                  transform="rotate(-90 20 20)"
                />
              </svg>
            </div>
          </div>

          <div className="counter-item isolation">
            <Settings style={{ width: '20px', height: '20px' }} />
            <div className="counter-content">
              <span className="counter-value">{completedIsolationPoints}/{formData.isolationPoints.length}</span>
              <span className="counter-label">{t.counters.isolation}</span>
            </div>
          </div>

          <div className="counter-item hazards">
            <Zap style={{ width: '20px', height: '20px' }} />
            <div className="counter-content">
              <span className="counter-value">{selectedHazards}</span>
              <span className="counter-label">{t.counters.hazards}</span>
            </div>
          </div>

          <div className="counter-item equipment">
            <Shield style={{ width: '20px', height: '20px' }} />
            <div className="counter-content">
              <span className="counter-value">{totalSafetyEquipment}</span>
              <span className="counter-label">{t.counters.equipment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET MÉTÉO */}
      {weatherData && (
        <div className={`weather-widget ${weatherData.alerts.length > 0 ? 'has-alerts' : ''}`}>
          <div className="weather-info">
            <div className="weather-icon">
              {getWeatherIcon(weatherData.condition)}
            </div>
            <div className="weather-details">
              <span className="temperature">{weatherData.temperature}°C</span>
              <span className="condition">{weatherData.condition}</span>
              <span className="wind">{currentLanguage === 'fr' ? 'Vent' : 'Wind'}: {weatherData.windSpeed} km/h</span>
            </div>
          </div>
          
          {weatherData.alerts.length > 0 && (
            <div className="weather-alerts">
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              <span>
                {weatherData.alerts.length} {currentLanguage === 'fr' ? 'alerte(s) météo' : 'weather alert(s)'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>

    {/* INDICATEUR D'ÉTAPES */}
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          onClick={() => setCurrentStep(index)}
        >
          <div className="step-icon">
            <step.icon style={{ width: '16px', height: '16px' }} />
          </div>
          <span className="step-label">{t.steps[step.key]}</span>
        </div>
      ))}
    </div>

    {/* CONTENU PRINCIPAL */}
    <div className="content-container">
      
      {/* ÉTAPE 1 - INFORMATIONS GÉNÉRALES */}
      {currentStep === 0 && (
        <div className="step-content">
          <div className="step-header">
            <FileText style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.general}</h2>
              <p>{currentLanguage === 'fr' ? 'Informations de base du projet et localisation' : 'Basic project information and location'}</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>{t.form.projectName} *</label>
              <input
                type="text"
                value={formData.project.name}
                onChange={(e) => updateFormData('project', { ...formData.project, name: e.target.value })}
                placeholder={currentLanguage === 'fr' ? 'Nom du projet' : 'Project name'}
              />
            </div>

            <div className="form-group">
              <label>{t.form.client} *</label>
              <select
                value={formData.project.client}
                onChange={(e) => {
                  updateFormData('project', { ...formData.project, client: e.target.value });
                  if (e.target.value !== 'custom') {
                    applyClientTemplate(e.target.value);
                  }
                }}
              >
                <option value="">{currentLanguage === 'fr' ? 'Sélectionner un client' : 'Select a client'}</option>
                <option value="hydro-quebec">Hydro-Québec</option>
                <option value="energir">Énergir (Gaz Métro)</option>
                <option value="bell-canada">Bell Canada</option>
                <option value="custom">{currentLanguage === 'fr' ? 'Autre client...' : 'Other client...'}</option>
              </select>
            </div>

            {formData.project.client === 'custom' && (
              <div className="form-group">
                <label>{currentLanguage === 'fr' ? 'Nom du client personnalisé' : 'Custom client name'} *</label>
                <input
                  type="text"
                  value={formData.project.customClient || ''}
                  onChange={(e) => updateFormData('project', { 
                    ...formData.project, 
                    customClient: e.target.value 
                  })}
                  placeholder={currentLanguage === 'fr' ? 'Entrez le nom du client' : 'Enter client name'}
                />
              </div>
            )}

            <div className="form-group">
              <label>{t.form.location} *</label>
              <input
                type="text"
                value={formData.project.location}
                onChange={(e) => updateFormData('project', { ...formData.project, location: e.target.value })}
                placeholder={currentLanguage === 'fr' ? 'Adresse ou localisation' : 'Address or location'}
              />
            </div>

            <div className="form-group">
              <label>{t.form.date} *</label>
              <input
                type="date"
                value={formData.project.date}
                onChange={(e) => updateFormData('project', { ...formData.project, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>{t.form.supervisor} *</label>
              <input
                type="text"
                value={formData.project.supervisor}
                onChange={(e) => updateFormData('project', { ...formData.project, supervisor: e.target.value })}
                placeholder={currentLanguage === 'fr' ? 'Nom du superviseur' : 'Supervisor name'}
              />
            </div>

            <div className="form-group">
              <label>{currentLanguage === 'fr' ? 'Chargé de projet' : 'Project Manager'} *</label>
              <input
                type="text"
                value={formData.project.projectManager || ''}
                onChange={(e) => updateFormData('project', { 
                  ...formData.project, 
                  projectManager: e.target.value 
                })}
                placeholder={currentLanguage === 'fr' ? 'Nom du chargé de projet' : 'Project manager name'}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.form.description}</label>
            <textarea
              value={formData.project.description}
              onChange={(e) => updateFormData('project', { ...formData.project, description: e.target.value })}
              placeholder={currentLanguage === 'fr' ? 'Description détaillée des travaux à effectuer' : 'Detailed description of work to be performed'}
              rows={4}
            />
          </div>
        </div>
      )}

      {/* ÉTAPE 2 - POINTS D'ISOLEMENT */}
      {currentStep === 1 && (
        <div className="step-content">
          <div className="step-header">
            <Settings style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.isolation}</h2>
              <p>{currentLanguage === 'fr' ? 'Identification et verrouillage des sources d\'énergie' : 'Identification and lockout of energy sources'}</p>
            </div>
          </div>

          <div className="isolation-points-container">
            <div className="section-actions">
              <button
                onClick={addIsolationPoint}
                className="btn-premium"
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                {currentLanguage === 'fr' ? 'Ajouter un point d\'isolement' : 'Add isolation point'}
              </button>
            </div>

            {formData.isolationPoints.length === 0 ? (
              <div className="empty-state">
                <Settings style={{ width: '48px', height: '48px', opacity: 0.3 }} />
                <p>{currentLanguage === 'fr' ? 'Aucun point d\'isolement ajouté' : 'No isolation points added'}</p>
              </div>
            ) : (
              <div className="isolation-grid">
                {formData.isolationPoints.map((point, index) => (
                  <div key={point.id} className="isolation-card">
                    <div className="isolation-header">
                      <div className="isolation-info">
                        <h4>🔒 {point.name}</h4>
                        <span className={`isolation-type ${point.type}`}>
                          {getIsolationTypeLabel(point.type)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeIsolationPoint(point.id)}
                        className="btn-danger-outline"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>{currentLanguage === 'fr' ? 'Nom du point' : 'Point name'} *</label>
                      <input
                        type="text"
                        value={point.name}
                        onChange={(e) => updateIsolationPoint(point.id, { name: e.target.value })}
                        placeholder={currentLanguage === 'fr' ? 'Ex: Disjoncteur principal' : 'Ex: Main breaker'}
                      />
                    </div>

                    <div className="form-group">
                      <label>{currentLanguage === 'fr' ? 'Type d\'énergie' : 'Energy type'} *</label>
                      <select
                        value={point.type}
                        onChange={(e) => updateIsolationPoint(point.id, { 
                          type: e.target.value as IsolationPoint['type'] 
                        })}
                      >
                        <option value="electrical">⚡ {currentLanguage === 'fr' ? 'Électrique' : 'Electrical'}</option>
                        <option value="mechanical">⚙️ {currentLanguage === 'fr' ? 'Mécanique' : 'Mechanical'}</option>
                        <option value="pneumatic">💨 {currentLanguage === 'fr' ? 'Pneumatique' : 'Pneumatic'}</option>
                        <option value="hydraulic">🌊 {currentLanguage === 'fr' ? 'Hydraulique' : 'Hydraulic'}</option>
                        <option value="chemical">🧪 {currentLanguage === 'fr' ? 'Chimique' : 'Chemical'}</option>
                        <option value="thermal">🔥 {currentLanguage === 'fr' ? 'Thermique' : 'Thermal'}</option>
                      </select>
                    </div>

                    <div className="isolation-checklist">
                      <h5>{currentLanguage === 'fr' ? 'Liste de vérification LOTO' : 'LOTO Checklist'}</h5>
                      
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={point.checklist.cadenasAppose}
                          onChange={(e) => updateIsolationPoint(point.id, {
                            checklist: { ...point.checklist, cadenasAppose: e.target.checked }
                          })}
                        />
                        <span className="checkmark"></span>
                        🔒 {currentLanguage === 'fr' ? 'Cadenas Apposé - Verrouillage physique' : 'Lock Applied - Physical lockout'}
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={point.checklist.absenceTension}
                          onChange={(e) => updateIsolationPoint(point.id, {
                            checklist: { ...point.checklist, absenceTension: e.target.checked }
                          })}
                        />
                        <span className="checkmark"></span>
                        ⚡ {currentLanguage === 'fr' ? 'Absence de Tension/Énergie - Vérification zéro énergie' : 'Zero Energy Verified - Energy absence confirmed'}
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={point.checklist.miseALaTerre}
                          onChange={(e) => updateIsolationPoint(point.id, {
                            checklist: { ...point.checklist, miseALaTerre: e.target.checked }
                          })}
                        />
                        <span className="checkmark"></span>
                        🌍 {currentLanguage === 'fr' ? 'Mise à la Terre/Neutralisation - Sécurisation' : 'Grounding/Neutralization - Secured'}
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={point.checklist.essaisEffectues}
                          onChange={(e) => updateIsolationPoint(point.id, {
                            checklist: { ...point.checklist, essaisEffectues: e.target.checked }
                          })}
                        />
                        <span className="checkmark"></span>
                        🔄 {currentLanguage === 'fr' ? 'Essais de Démarrage Effectués - Validation finale' : 'Startup Tests Performed - Final validation'}
                      </label>
                    </div>

                    <div className="isolation-status">
                      {getIsolationStatus(point) === 'complete' && (
                        <div className="status-badge success">
                          <Check style={{ width: '16px', height: '16px' }} />
                          {currentLanguage === 'fr' ? 'Complet' : 'Complete'}
                        </div>
                      )}
                      {getIsolationStatus(point) === 'partial' && (
                        <div className="status-badge warning">
                          <AlertTriangle style={{ width: '16px', height: '16px' }} />
                          {currentLanguage === 'fr' ? 'Partiel' : 'Partial'}
                        </div>
                      )}
                      {getIsolationStatus(point) === 'pending' && (
                        <div className="status-badge danger">
                          <Clock style={{ width: '16px', height: '16px' }} />
                          {currentLanguage === 'fr' ? 'En attente' : 'Pending'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 3 - DISCUSSION ÉQUIPE */}
      {currentStep === 2 && (
        <div className="step-content">
          <div className="step-header">
            <MessageSquare style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.discussion}</h2>
              <p>{currentLanguage === 'fr' ? 'Communication des risques et procédures à l\'équipe' : 'Risk communication and procedures to the team'}</p>
            </div>
          </div>

          <div className="discussion-container">
            <div className="form-group">
              <label>{currentLanguage === 'fr' ? 'Points discutés avec l\'équipe' : 'Points discussed with team'} *</label>
              <textarea
                value={formData.discussion.mainPoints}
                onChange={(e) => updateFormData('discussion', { 
                  ...formData.discussion, 
                  mainPoints: e.target.value 
                })}
                placeholder={currentLanguage === 'fr' ? 
                  'Décrivez les principaux points de sécurité discutés avec l\'équipe...' :
                  'Describe the main safety points discussed with the team...'
                }
                rows={6}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>{currentLanguage === 'fr' ? 'Responsable de la discussion' : 'Discussion leader'} *</label>
                <input
                  type="text"
                  value={formData.discussion.leader}
                  onChange={(e) => updateFormData('discussion', { 
                    ...formData.discussion, 
                    leader: e.target.value 
                  })}
                  placeholder={currentLanguage === 'fr' ? 'Nom du responsable' : 'Leader name'}
                />
              </div>

              <div className="form-group">
                <label>{currentLanguage === 'fr' ? 'Date et heure' : 'Date and time'} *</label>
                <input
                  type="datetime-local"
                  value={formData.discussion.timestamp}
                  onChange={(e) => updateFormData('discussion', { 
                    ...formData.discussion, 
                    timestamp: e.target.value 
                  })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{currentLanguage === 'fr' ? 'Questions ou préoccupations soulevées' : 'Questions or concerns raised'}</label>
              <textarea
                value={formData.discussion.concerns}
                onChange={(e) => updateFormData('discussion', { 
                  ...formData.discussion, 
                  concerns: e.target.value 
                })}
                placeholder={currentLanguage === 'fr' ? 
                  'Notez toutes les questions ou préoccupations soulevées par l\'équipe...' :
                  'Note any questions or concerns raised by the team...'
                }
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>{currentLanguage === 'fr' ? 'Actions correctives décidées' : 'Corrective actions decided'}</label>
              <textarea
                value={formData.discussion.actions}
                onChange={(e) => updateFormData('discussion', { 
                  ...formData.discussion, 
                  actions: e.target.value 
                })}
                placeholder={currentLanguage === 'fr' ? 
                  'Décrivez les actions correctives ou améliorations convenues...' :
                  'Describe corrective actions or improvements agreed upon...'
                }
                rows={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* ÉTAPE 4 - ÉQUIPEMENTS DE SÉCURITÉ */}
      {currentStep === 3 && (
        <div className="step-content">
          <div className="step-header">
            <Shield style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.equipment}</h2>
              <p>{currentLanguage === 'fr' ? 'Sélection des équipements de protection requis' : 'Selection of required protective equipment'}</p>
            </div>
          </div>

          <div className="equipment-container">
            <div className="equipment-categories">
              {Object.entries(groupEquipmentByCategory()).map(([category, equipment]) => (
                <div key={category} className="equipment-category">
                  <h3 className="category-title">
                    {getCategoryIcon(category)}
                    {getCategoryLabel(category)}
                  </h3>
                  
                  <div className="equipment-grid">
                    {equipment.map((item) => (
                      <label key={item.id} className={`equipment-item ${formData.requiredEquipment.includes(item.id) ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={formData.requiredEquipment.includes(item.id)}
                          onChange={(e) => toggleEquipment(item.id, e.target.checked)}
                        />
                        <div className="equipment-content">
                          <div className="equipment-icon">{item.icon}</div>
                          <div className="equipment-details">
                            <span className="equipment-name">{item.name}</span>
                            <span className="equipment-desc">{item.description}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    {/* NAVIGATION MOBILE OPTIMISÉE */}
    <div className="mobile-nav">
      <button
        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
        className="btn-secondary"
        disabled={currentStep === 0}
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} />
        <span style={{ display: 'none' }}>{t.buttons.previous}</span>
      </button>
      
      <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
        <div>{steps[currentStep].key}</div>
        <div>{currentStep + 1}/{steps.length}</div>
      </div>
      
      <button
        onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
        className="btn-premium"
        disabled={currentStep === steps.length - 1}
      >
        <span style={{ display: 'none' }}>{t.buttons.next}</span>
        <ChevronRight style={{ width: '16px', height: '16px' }} />
      </button>
    </div>

    </div>
  </div>
);
  // =================== AST SECTION 6E/6 - INTERFACE JSX FINALE (ÉTAPES 5-8) ===================

      {/* ÉTAPE 5 - DANGERS ET RISQUES */}
      {currentStep === 4 && (
        <div className="step-content">
          <div className="step-header">
            <Zap style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.hazards}</h2>
              <p>{currentLanguage === 'fr' ? 'Identification des dangers et moyens de contrôle' : 'Hazard identification and control measures'}</p>
            </div>
          </div>

          {/* SYSTÈME DE PRÉFILTRAGE */}
          <div className="work-type-filter">
            <h3>{currentLanguage === 'fr' ? 'Type de travaux (préfiltrage)' : 'Work type (pre-filtering)'}</h3>
            <div className="filter-grid">
              {workTypeFilters.map((filter) => (
                <label key={filter.id} className={`filter-item ${selectedWorkTypes.includes(filter.id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedWorkTypes.includes(filter.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedWorkTypes(prev => [...prev, filter.id]);
                      } else {
                        setSelectedWorkTypes(prev => prev.filter(id => id !== filter.id));
                      }
                    }}
                  />
                  <div className="filter-content">
                    <span className="filter-icon">{filter.icon}</span>
                    <div className="filter-details">
                      <span className="filter-name">{filter.name}</span>
                      <span className="filter-desc">{filter.description}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="filter-actions">
              <button
                onClick={() => setShowAllHazards(!showAllHazards)}
                className="btn-secondary"
              >
                <Eye style={{ width: '16px', height: '16px' }} />
                {showAllHazards ? 
                  (currentLanguage === 'fr' ? 'Masquer filtrés' : 'Hide filtered') :
                  (currentLanguage === 'fr' ? 'Voir tous' : 'Show all')
                }
              </button>
            </div>
          </div>

          {/* LISTE DES DANGERS */}
          <div className="hazards-container">
            {filteredHazards.map((hazard) => (
              <div
                key={hazard.id}
                className={`hazard-card ${formData.selectedHazards.includes(hazard.id) ? 'selected' : ''} ${hazard.riskLevel}`}
                onClick={() => toggleHazard(hazard.id)}
              >
                <div className="hazard-header">
                  <div className="hazard-info">
                    <div className="hazard-title">
                      <h4>{hazard.title}</h4>
                      <span className={`risk-badge ${hazard.riskLevel}`}>
                        {hazard.riskLevel === 'critical' && (currentLanguage === 'fr' ? 'CRITIQUE' : 'CRITICAL')}
                        {hazard.riskLevel === 'high' && (currentLanguage === 'fr' ? 'ÉLEVÉ' : 'HIGH')}
                        {hazard.riskLevel === 'medium' && (currentLanguage === 'fr' ? 'MOYEN' : 'MEDIUM')}
                        {hazard.riskLevel === 'low' && (currentLanguage === 'fr' ? 'FAIBLE' : 'LOW')}
                      </span>
                    </div>
                    <p className="hazard-description">{hazard.description}</p>
                  </div>
                  <div className="hazard-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.selectedHazards.includes(hazard.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleHazard(hazard.id);
                      }}
                    />
                  </div>
                </div>

                {formData.selectedHazards.includes(hazard.id) && (
                  <div className="hazard-controls">
                    <h5>{currentLanguage === 'fr' ? 'Moyens de contrôle sélectionnés' : 'Selected control measures'}</h5>
                    <div className="controls-grid">
                      {getControlMeasures(hazard.id).map((measure) => (
                        <label
                          key={measure.id}
                          className={`control-item ${getSelectedControlMeasures(hazard.id).includes(measure.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={getSelectedControlMeasures(hazard.id).includes(measure.id)}
                            onChange={(e) => toggleControlMeasure(hazard.id, measure.id, e.target.checked)}
                          />
                          <div className="control-content">
                            <span className={`control-priority ${measure.priority}`}>
                              {measure.priority === 'elimination' && '🚫'}
                              {measure.priority === 'substitution' && '🔄'}
                              {measure.priority === 'engineering' && '⚙️'}
                              {measure.priority === 'administrative' && '📋'}
                              {measure.priority === 'ppe' && '🦺'}
                            </span>
                            <span className="control-name">{measure.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredHazards.length === 0 && (
              <div className="empty-state">
                <Zap style={{ width: '48px', height: '48px', opacity: 0.3 }} />
                <p>{currentLanguage === 'fr' ? 'Aucun danger trouvé pour les types de travaux sélectionnés' : 'No hazards found for selected work types'}</p>
                <button
                  onClick={() => setShowAllHazards(true)}
                  className="btn-secondary"
                >
                  {currentLanguage === 'fr' ? 'Voir tous les dangers' : 'Show all hazards'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 6 - ÉQUIPE DE TRAVAIL */}
      {currentStep === 5 && (
        <div className="step-content">
          <div className="step-header">
            <Users style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.team}</h2>
              <p>{currentLanguage === 'fr' ? 'Composition de l\'équipe et approbations' : 'Team composition and approvals'}</p>
            </div>
          </div>

          <div className="team-container">
            <div className="section-actions">
              <button
                onClick={addTeamMember}
                className="btn-premium"
              >
                <UserPlus style={{ width: '16px', height: '16px' }} />
                {currentLanguage === 'fr' ? 'Ajouter un membre' : 'Add member'}
              </button>
            </div>

            {formData.team.members.length === 0 ? (
              <div className="empty-state">
                <Users style={{ width: '48px', height: '48px', opacity: 0.3 }} />
                <p>{currentLanguage === 'fr' ? 'Aucun membre d\'équipe ajouté' : 'No team members added'}</p>
              </div>
            ) : (
              <div className="team-grid">
                {formData.team.members.map((member, index) => (
                  <div key={member.id} className="team-card">
                    <div className="team-header">
                      <div className="member-info">
                        <h4>{member.name || `${currentLanguage === 'fr' ? 'Membre' : 'Member'} ${index + 1}`}</h4>
                        <span className="member-role">{member.role}</span>
                      </div>
                      <div className="member-actions">
                        <span className={`status-badge ${member.validationStatus}`}>
                          {member.validationStatus === 'pending' && (currentLanguage === 'fr' ? 'En attente' : 'Pending')}
                          {member.validationStatus === 'approved' && (currentLanguage === 'fr' ? 'Approuvé' : 'Approved')}
                          {member.validationStatus === 'rejected' && (currentLanguage === 'fr' ? 'Rejeté' : 'Rejected')}
                        </span>
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="btn-danger-outline"
                        >
                          <UserMinus style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>{currentLanguage === 'fr' ? 'Nom complet' : 'Full name'} *</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                          placeholder={currentLanguage === 'fr' ? 'Nom du membre' : 'Member name'}
                        />
                      </div>

                      <div className="form-group">
                        <label>{currentLanguage === 'fr' ? 'Rôle' : 'Role'} *</label>
                        <select
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, { role: e.target.value })}
                        >
                          <option value="">{currentLanguage === 'fr' ? 'Sélectionner un rôle' : 'Select role'}</option>
                          <option value="supervisor">{currentLanguage === 'fr' ? 'Superviseur' : 'Supervisor'}</option>
                          <option value="technician">{currentLanguage === 'fr' ? 'Technicien' : 'Technician'}</option>
                          <option value="apprentice">{currentLanguage === 'fr' ? 'Apprenti' : 'Apprentice'}</option>
                          <option value="specialist">{currentLanguage === 'fr' ? 'Spécialiste' : 'Specialist'}</option>
                          <option value="security">{currentLanguage === 'fr' ? 'Sécurité' : 'Security'}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>{currentLanguage === 'fr' ? 'Certifications' : 'Certifications'}</label>
                        <input
                          type="text"
                          value={member.certifications.join(', ')}
                          onChange={(e) => updateTeamMember(member.id, { 
                            certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          })}
                          placeholder={currentLanguage === 'fr' ? 'Ex: RCR, Hauteur, LOTO' : 'Ex: CPR, Heights, LOTO'}
                        />
                      </div>

                      <div className="form-group">
                        <label>{currentLanguage === 'fr' ? 'Contact' : 'Contact'}</label>
                        <input
                          type="text"
                          value={member.contact || ''}
                          onChange={(e) => updateTeamMember(member.id, { contact: e.target.value })}
                          placeholder={currentLanguage === 'fr' ? 'Téléphone ou email' : 'Phone or email'}
                        />
                      </div>
                    </div>

                    {member.consultationDetails && (
                      <div className="consultation-details">
                        <h5>{currentLanguage === 'fr' ? 'Détails de consultation' : 'Consultation details'}</h5>
                        <div className="consultation-timeline">
                          {member.consultationDetails.acknowledgeTime && (
                            <div className="timeline-item">
                              <Check style={{ width: '16px', height: '16px' }} />
                              <span>
                                {currentLanguage === 'fr' ? 'Pris connaissance' : 'Acknowledged'}: {' '}
                                {new Date(member.consultationDetails.acknowledgeTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {member.consultationDetails.lockTime && (
                            <div className="timeline-item">
                              <Shield style={{ width: '16px', height: '16px' }} />
                              <span>
                                {currentLanguage === 'fr' ? 'Cadenas appliqué' : 'Lock applied'}: {' '}
                                {new Date(member.consultationDetails.lockTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {member.consultationDetails.consentTime && (
                            <div className="timeline-item">
                              <CheckCircle style={{ width: '16px', height: '16px' }} />
                              <span>
                                {currentLanguage === 'fr' ? 'Consentement' : 'Consent'}: {' '}
                                {new Date(member.consultationDetails.consentTime).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÉTAPE 7 - PHOTOS ET DOCUMENTATION */}
      {currentStep === 6 && (
        <div className="step-content">
          <div className="step-header">
            <Camera style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.documentation}</h2>
              <p>{currentLanguage === 'fr' ? 'Documentation visuelle et notes complémentaires' : 'Visual documentation and additional notes'}</p>
            </div>
          </div>

          <div className="documentation-container">
            <div className="photo-section">
              <div className="section-header">
                <h3>{currentLanguage === 'fr' ? 'Photos de documentation' : 'Documentation photos'}</h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-premium"
                >
                  <Camera style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Ajouter photos' : 'Add photos'}
                </button>
              </div>

              {formData.photos.length === 0 ? (
                <div className="empty-state">
                  <Camera style={{ width: '48px', height: '48px', opacity: 0.3 }} />
                  <p>{currentLanguage === 'fr' ? 'Aucune photo ajoutée' : 'No photos added'}</p>
                </div>
              ) : (
                <div className="photos-grid">
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id} className="photo-card">
                      <div className="photo-container">
                        <img src={photo.url} alt={photo.description} />
                        <div className="photo-overlay">
                          <button
                            onClick={() => setSelectedPhotoIndex(index)}
                            className="btn-secondary btn-sm"
                          >
                            <Eye style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="btn-danger btn-sm"
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>
                      <div className="photo-details">
                        <input
                          type="text"
                          value={photo.description}
                          onChange={(e) => updatePhoto(photo.id, { description: e.target.value })}
                          placeholder={currentLanguage === 'fr' ? 'Description de la photo' : 'Photo description'}
                        />
                        <span className="photo-date">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="notes-section">
              <h3>{currentLanguage === 'fr' ? 'Notes complémentaires' : 'Additional notes'}</h3>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                placeholder={currentLanguage === 'fr' ? 
                  'Ajoutez toute information complémentaire pertinente...' :
                  'Add any relevant additional information...'
                }
                rows={6}
              />
            </div>
          </div>

          {/* MODAL CAROUSEL PHOTOS */}
          {selectedPhotoIndex !== null && (
            <div className="modal-overlay" onClick={() => setSelectedPhotoIndex(null)}>
              <div className="photo-modal" onClick={e => e.stopPropagation()}>
                <div className="photo-modal-header">
                  <h3>{currentLanguage === 'fr' ? 'Photo' : 'Photo'} {selectedPhotoIndex + 1}/{formData.photos.length}</h3>
                  <button
                    onClick={() => setSelectedPhotoIndex(null)}
                    className="modal-close"
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
                <div className="photo-modal-content">
                  <button
                    onClick={() => setSelectedPhotoIndex(prev => 
                      prev === null ? null : Math.max(0, prev - 1)
                    )}
                    className="photo-nav prev"
                    disabled={selectedPhotoIndex === 0}
                  >
                    <ChevronLeft style={{ width: '20px', height: '20px' }} />
                  </button>
                  
                  <img 
                    src={formData.photos[selectedPhotoIndex].url} 
                    alt={formData.photos[selectedPhotoIndex].description}
                  />
                  
                  <button
                    onClick={() => setSelectedPhotoIndex(prev => 
                      prev === null ? null : Math.min(formData.photos.length - 1, prev + 1)
                    )}
                    className="photo-nav next"
                    disabled={selectedPhotoIndex === formData.photos.length - 1}
                  >
                    <ChevronRight style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
                <div className="photo-modal-description">
                  <p>{formData.photos[selectedPhotoIndex].description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 8 - VALIDATION ET SIGNATURES */}
      {currentStep === 7 && (
        <div className="step-content">
          <div className="step-header">
            <CheckCircle style={{ width: '24px', height: '24px' }} />
            <div>
              <h2>{t.steps.validation}</h2>
              <p>{currentLanguage === 'fr' ? 'Validation finale et signatures électroniques' : 'Final validation and electronic signatures'}</p>
            </div>
          </div>

          <div className="validation-container">
            <div className="ast-summary-section">
              <h3>{currentLanguage === 'fr' ? 'Résumé de l\'AST' : 'AST Summary'}</h3>
              <div className="summary-grid">
                <div className="summary-card">
                  <FileText style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'Projet' : 'Project'}</h4>
                    <p>{formData.project.name}</p>
                    <p>{formData.project.client}</p>
                  </div>
                </div>
                
                <div className="summary-card">
                  <Users style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'Équipe' : 'Team'}</h4>
                    <p>{formData.team.members.length} {currentLanguage === 'fr' ? 'membres' : 'members'}</p>
                    <p>{approvedMembersCount} {currentLanguage === 'fr' ? 'approuvés' : 'approved'}</p>
                  </div>
                </div>
                
                <div className="summary-card">
                  <Settings style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'Points d\'isolement' : 'Isolation points'}</h4>
                    <p>{formData.isolationPoints.length} {currentLanguage === 'fr' ? 'points' : 'points'}</p>
                    <p>{completedIsolationPoints} {currentLanguage === 'fr' ? 'complétés' : 'completed'}</p>
                  </div>
                </div>
                
                <div className="summary-card">
                  <Zap style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'Dangers' : 'Hazards'}</h4>
                    <p>{selectedHazards} {currentLanguage === 'fr' ? 'identifiés' : 'identified'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="signatures-section">
              <h3>{currentLanguage === 'fr' ? 'Signatures électroniques' : 'Electronic signatures'}</h3>
              
              <div className="signature-grid">
                <div className="signature-card">
                  <h4>{currentLanguage === 'fr' ? 'Chargé de projet' : 'Project manager'}</h4>
                  <input
                    type="text"
                    value={formData.signatures.projectManager.name}
                    onChange={(e) => updateFormData('signatures', {
                      ...formData.signatures,
                      projectManager: { 
                        ...formData.signatures.projectManager, 
                        name: e.target.value 
                      }
                    })}
                    placeholder={currentLanguage === 'fr' ? 'Nom du chargé de projet' : 'Project manager name'}
                  />
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.signatures.projectManager.signed}
                      onChange={(e) => {
                        updateFormData('signatures', {
                          ...formData.signatures,
                          projectManager: {
                            ...formData.signatures.projectManager,
                            signed: e.target.checked,
                            timestamp: e.target.checked ? new Date().toISOString() : '',
                            ipAddress: e.target.checked ? '192.168.1.1' : '',
                            location: e.target.checked ? 'Sherbrooke, QC' : ''
                          }
                        });
                      }}
                    />
                    <span className="checkmark"></span>
                    {currentLanguage === 'fr' ? 'Je certifie avoir vérifié et approuvé cette AST' : 'I certify having verified and approved this AST'}
                  </label>
                  
                  {formData.signatures.projectManager.signed && (
                    <div className="signature-details">
                      <p><strong>{currentLanguage === 'fr' ? 'Signé le' : 'Signed on'}:</strong> {new Date(formData.signatures.projectManager.timestamp).toLocaleString()}</p>
                      <p><strong>IP:</strong> {formData.signatures.projectManager.ipAddress}</p>
                    </div>
                  )}
                </div>

                <div className="signature-card">
                  <h4>{currentLanguage === 'fr' ? 'Superviseur sécurité' : 'Safety supervisor'}</h4>
                  <input
                    type="text"
                    value={formData.signatures.safetySupervisor.name}
                    onChange={(e) => updateFormData('signatures', {
                      ...formData.signatures,
                      safetySupervisor: { 
                        ...formData.signatures.safetySupervisor, 
                        name: e.target.value 
                      }
                    })}
                    placeholder={currentLanguage === 'fr' ? 'Nom du superviseur sécurité' : 'Safety supervisor name'}
                  />
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.signatures.safetySupervisor.signed}
                      onChange={(e) => {
                        updateFormData('signatures', {
                          ...formData.signatures,
                          safetySupervisor: {
                            ...formData.signatures.safetySupervisor,
                            signed: e.target.checked,
                            timestamp: e.target.checked ? new Date().toISOString() : '',
                            ipAddress: e.target.checked ? '192.168.1.1' : '',
                            location: e.target.checked ? 'Sherbrooke, QC' : ''
                          }
                        });
                      }}
                    />
                    <span className="checkmark"></span>
                    {currentLanguage === 'fr' ? 'Je certifie la conformité sécuritaire de cette AST' : 'I certify the safety compliance of this AST'}
                  </label>
                  
                  {formData.signatures.safetySupervisor.signed && (
                    <div className="signature-details">
                      <p><strong>{currentLanguage === 'fr' ? 'Signé le' : 'Signed on'}:</strong> {new Date(formData.signatures.safetySupervisor.timestamp).toLocaleString()}</p>
                      <p><strong>IP:</strong> {formData.signatures.safetySupervisor.ipAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="final-actions">
              <div className="action-grid">
                <button
                  onClick={generatePDF}
                  className="btn-premium"
                  disabled={!canGenerateFinalDocument()}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Générer PDF final' : 'Generate final PDF'}
                </button>

                <button
                  onClick={saveToSupabase}
                  className="btn-secondary"
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Sauvegarder' : 'Save'}
                </button>

                <button
                  onClick={archiveAST}
                  className="btn-warning"
                  disabled={!formData.signatures.projectManager.signed || !formData.signatures.safetySupervisor.signed}
                >
                  <Archive style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Archiver' : 'Archive'}
                </button>

                <button
                  onClick={sendEmailNotification}
                  className="btn-info"
                  disabled={!formData.signatures.projectManager.signed}
                >
                  <Mail style={{ width: '16px', height: '16px' }} />
                  {currentLanguage === 'fr' ? 'Envoyer notification' : 'Send notification'}
                </button>
              </div>
            </div>

            {/* STATUT FINAL */}
            <div className="final-status">
              {canGenerateFinalDocument() ? (
                <div className="status-success">
                  <CheckCircle style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'AST prête à finaliser' : 'AST ready to finalize'}</h4>
                    <p>{currentLanguage === 'fr' ? 'Toutes les signatures sont complètes' : 'All signatures are complete'}</p>
                  </div>
                </div>
              ) : (
                <div className="status-warning">
                  <AlertTriangle style={{ width: '24px', height: '24px' }} />
                  <div>
                    <h4>{currentLanguage === 'fr' ? 'Signatures manquantes' : 'Missing signatures'}</h4>
                    <p>{currentLanguage === 'fr' ? 'Toutes les signatures sont requises avant finalisation' : 'All signatures required before finalization'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>

    {/* NAVIGATION MOBILE OPTIMISÉE FINALE */}
    <div className="mobile-nav">
      <button
        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
        className="btn-secondary"
        disabled={currentStep === 0}
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} />
        <span style={{ display: 'none' }}>{t.buttons.previous}</span>
      </button>
      
      <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
        <div>{steps[currentStep].key}</div>
        <div>{currentStep + 1}/{steps.length}</div>
      </div>
      
      <button
        onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
        className="btn-premium"
        disabled={currentStep === steps.length - 1}
      >
        <span style={{ display: 'none' }}>{t.buttons.next}</span>
        <ChevronRight style={{ width: '16px', height: '16px' }} />
      </button>
    </div>

  </div>
);

// =================== FERMETURE DU COMPOSANT PRINCIPAL ===================
}

// =================== EXPORT DEFAULT ===================
export default ASTFormUltraPremium;
  
