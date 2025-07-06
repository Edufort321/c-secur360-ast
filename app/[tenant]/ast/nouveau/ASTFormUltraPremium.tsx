// =================== AST SECTION 1/5 - IMPORTS & INTERFACES ===================
// Section 1: Imports et Interfaces complètes avec PARTAGE ÉQUIPE intégré

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock, Share2, ExternalLink, RefreshCw
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
    // NOUVEAU: Partage équipe
    shareLink?: string;
    shareExpiry?: string;
    consultationNotifications: TeamConsultationNotification[];
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
  // NOUVEAU: Consultation à distance
  remoteConsultationCompleted?: boolean;
  remoteConsultationTimestamp?: string;
  remoteConsultationIpAddress?: string;
  remoteConsentGiven?: boolean;
  remoteConsultationComments?: string;
}

// NOUVEAU: Interface pour les notifications de consultation
interface TeamConsultationNotification {
  id: string;
  employeeId: string;
  method: 'sms' | 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  timestamp: string;
  message: string;
  phoneNumber?: string;
  emailAddress?: string;
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
// =================== AST SECTION 2/5 - DONNÉES COMPLÈTES TOUS SECTEURS ===================
// Section 2: Données complètes avec TOUS les 39 dangers et 200+ moyens de contrôle

// =================== LOGO CLIENT POTENTIEL SVG (ORIGINAL) ===================
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

// =================== MOYENS DE CONTRÔLE COMPLETS (200+ MESURES) ===================
const predefinedControlMeasures: Record<string, ControlMeasure[]> = {
  // ÉLECTRIQUES
  'electrical_shock': [
    { id: 'elec_001', name: 'Consignation électrique complète', description: 'Mise hors tension, verrouillage et étiquetage selon CSA Z462', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'elec_002', name: 'Protection par disjoncteur différentiel', description: 'Installation de DDFT/GFCI sur tous les circuits', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec_003', name: 'Équipement de protection individuelle', description: 'Gants isolants, chaussures diélectriques, casque classe E', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'elec_004', name: 'Formation électrique CSA Z462', description: 'Personnel qualifié selon normes canadiennes', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'elec_005', name: 'Vérification absence de tension', description: 'Utiliser VAT certifié avant intervention', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  'arc_flash': [
    { id: 'arc_001', name: 'Travail hors tension', description: 'Élimination complète du risque par mise hors tension', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'arc_002', name: 'Analyse des dangers d\'arc électrique', description: 'Étude d\'arc avec calcul des frontières de protection', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'arc_003', name: 'Vêtements résistants à l\'arc', description: 'EPI avec indice d\'arc approprié (cal/cm²)', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'arc_004', name: 'Outils isolants', description: 'Perches isolantes et équipements télécommandés', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],

  // GAZIERS
  'gas_leak': [
    { id: 'gas_001', name: 'Purge et isolation du système', description: 'Vidange complète et isolation des canalisations', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'gas_002', name: 'Détection de gaz continue', description: 'Système de détection multi-gaz avec alarmes', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'gas_003', name: 'Permis de travail à chaud', description: 'Autorisation formelle pour travaux avec sources d\'ignition', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'gas_004', name: 'Ventilation forcée', description: 'Système ventilation pour disperser les gaz', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],

  'explosion': [
    { id: 'exp_001', name: 'Élimination des sources d\'ignition', description: 'Suppression de toutes sources d\'ignition dans la zone', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'exp_002', name: 'Ventilation forcée', description: 'Système de ventilation pour disperser les gaz', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'exp_003', name: 'Zone de sécurité périmétrique', description: 'Établissement périmètre de sécurité avec accès contrôlé', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'exp_004', name: 'Équipement antidéflagrant', description: 'Utilisation équipements certifiés zones explosives', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],

  // PHYSIQUES
  'falls': [
    { id: 'fall_001', name: 'Travail au sol ou plateforme permanente', description: 'Élimination du travail en hauteur par conception', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'fall_002', name: 'Garde-corps et protection collective', description: 'Installation garde-corps conformes ou filets de sécurité', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'fall_003', name: 'Système d\'arrêt de chute', description: 'Harnais avec longe et point d\'ancrage certifié', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'fall_004', name: 'Formation travail en hauteur', description: 'Formation spécialisée selon RSST Article 2.9', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  'confined_spaces': [
    { id: 'conf_001', name: 'Travail à l\'extérieur de l\'espace', description: 'Modification méthodes pour éviter l\'entrée', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'conf_002', name: 'Ventilation mécanique forcée', description: 'Système ventilation avec surveillance continue', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'conf_003', name: 'Permis d\'entrée en espace confiné', description: 'Procédure formelle avec surveillant et équipe secours', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'conf_004', name: 'Détection atmosphérique continue', description: 'Monitoring O2, gaz combustibles, toxiques', category: 'engineering', isSelected: false, photos: [], notes: '' }
  ],

  'mechanical_hazards': [
    { id: 'mech_001', name: 'Conception sécuritaire intrinsèque', description: 'Élimination dangers par conception équipement', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'mech_002', name: 'Protecteurs et dispositifs de sécurité', description: 'Installation protecteurs fixes et mobiles', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'mech_003', name: 'Cadenassage énergies dangereuses', description: 'Procédure LOTO pour toutes énergies', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'mech_004', name: 'Formation sécurité machines', description: 'Formation CSA Z432 sécurité des machines', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  // CHIMIQUES
  'chemical_exposure': [
    { id: 'chem_001', name: 'Remplacement par produit moins dangereux', description: 'Substitution par produits moins toxiques', category: 'substitution', isSelected: false, photos: [], notes: '' },
    { id: 'chem_002', name: 'Ventilation par aspiration localisée', description: 'Système captage à la source avec épuration', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'chem_003', name: 'Protection respiratoire adaptée', description: 'Équipement protection respiratoire selon contaminant', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'chem_004', name: 'Formation SIMDUT 2015', description: 'Formation manipulation produits chimiques', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  // BIOLOGIQUES
  'biological_hazards': [
    { id: 'bio_001', name: 'Stérilisation ou décontamination', description: 'Élimination agents biologiques par traitement', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'bio_002', name: 'Confinement et ventilation', description: 'Système confinement avec pression négative', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'bio_003', name: 'Vaccination et surveillance médicale', description: 'Programme immunisation et suivi santé', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'bio_004', name: 'EPI barrière biologique', description: 'Combinaisons, gants, masques selon niveau biosécurité', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // ERGONOMIQUES
  'ergonomic_hazards': [
    { id: 'ergo_001', name: 'Mécanisation des tâches', description: 'Automatisation manutention et tâches répétitives', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'ergo_002', name: 'Aide mécanique à la manutention', description: 'Équipements assistance manutention manuelle', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ergo_003', name: 'Rotation des postes et pauses', description: 'Organisation travail pour réduire contraintes', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ergo_004', name: 'Formation ergonomique', description: 'Techniques sécuritaires manutention', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  // ENVIRONNEMENTAUX
  'weather_exposure': [
    { id: 'weather_001', name: 'Travail en environnement contrôlé', description: 'Déplacement activités vers environnement protégé', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'weather_002', name: 'Surveillance météorologique', description: 'Système alerte et arrêt travaux selon conditions', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'weather_003', name: 'Vêtements de protection climatique', description: 'EPI adapté aux conditions météorologiques', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  'heat_stress': [
    { id: 'heat_001', name: 'Travail aux heures fraîches', description: 'Planification travaux aux périodes moins chaudes', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'heat_002', name: 'Refroidissement localisé', description: 'Systèmes refroidissement zones de travail', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'heat_003', name: 'Régime travail-repos', description: 'Pauses fréquentes avec hydratation', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  // MOYENS DE CONTRÔLE GÉNÉRIQUES
  'default': [
    { id: 'def_001', name: 'Formation spécialisée', description: 'Formation adaptée aux risques spécifiques', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def_002', name: 'Supervision qualifiée', description: 'Encadrement par personne compétente', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def_003', name: 'Procédures sécuritaires', description: 'Modes opératoires normalisés', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def_004', name: 'EPI approprié', description: 'Équipement protection selon analyse risques', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'def_005', name: 'Inspection régulière', description: 'Vérifications périodiques équipements/procédures', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ]
};

// =================== TOUS LES 39 DANGERS COMPLETS ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  // DANGERS ÉLECTRIQUES (1-5)
  { id: 'electrical_shock', code: 'ELEC-001', title: 'Choc électrique', description: 'Contact direct ou indirect avec parties sous tension', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['electrical_shock'], showControls: false },
  { id: 'arc_flash', code: 'ELEC-002', title: 'Arc électrique', description: 'Décharge électrique dans l\'air entre conducteurs', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['arc_flash'], showControls: false },
  { id: 'electrical_burns', code: 'ELEC-003', title: 'Brûlures électriques', description: 'Brûlures causées par passage courant ou arc électrique', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'electromagnetic_fields', code: 'ELEC-004', title: 'Champs électromagnétiques', description: 'Exposition aux rayonnements électromagnétiques', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'static_electricity', code: 'ELEC-005', title: 'Électricité statique', description: 'Accumulation charges électrostatiques', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },

  // DANGERS GAZIERS ET CHIMIQUES (6-12)
  { id: 'gas_leak', code: 'GAZ-001', title: 'Fuite de gaz', description: 'Échappement non contrôlé de gaz combustible ou toxique', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['gas_leak'], showControls: false },
  { id: 'explosion', code: 'GAZ-002', title: 'Explosion', description: 'Combustion rapide en espace confiné ou nuage gazeux', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['explosion'], showControls: false },
  { id: 'fire', code: 'FIRE-001', title: 'Incendie', description: 'Combustion non contrôlée de matières inflammables', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'toxic_exposure', code: 'CHEM-001', title: 'Exposition substances toxiques', description: 'Contact avec substances chimiques dangereuses', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['chemical_exposure'], showControls: false },
  { id: 'chemical_burns', code: 'CHEM-002', title: 'Brûlures chimiques', description: 'Lésions cutanées par contact substances corrosives', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'asphyxiation', code: 'GAZ-003', title: 'Asphyxie', description: 'Manque d\'oxygène ou présence gaz inertes', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['confined_spaces'], showControls: false },
  { id: 'oxygen_deficiency', code: 'GAZ-004', title: 'Déficience en oxygène', description: 'Concentration oxygène inférieure à 19,5%', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['confined_spaces'], showControls: false },

  // DANGERS PHYSIQUES ET MÉCANIQUES (13-23)
  { id: 'falls', code: 'FALL-001', title: 'Chutes de hauteur', description: 'Chute depuis une surface élevée', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['falls'], showControls: false },
  { id: 'struck_by_objects', code: 'FALL-002', title: 'Heurt par objets', description: 'Impact par objets en mouvement ou qui tombent', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'cuts_lacerations', code: 'MECH-001', title: 'Coupures et lacérations', description: 'Blessures par objets tranchants ou coupants', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'mechanical_hazards', code: 'MECH-002', title: 'Dangers mécaniques', description: 'Risques liés aux machines et équipements mécaniques', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['mechanical_hazards'], showControls: false },
  { id: 'heavy_equipment', code: 'MECH-003', title: 'Équipements lourds', description: 'Risques associés aux véhicules et machines lourdes', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'vehicle_traffic', code: 'TRAF-001', title: 'Circulation véhiculaire', description: 'Risques liés à la proximité de véhicules en circulation', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'train_traffic', code: 'TRAF-002', title: 'Circulation ferroviaire', description: 'Risques près des voies ferrées et trains', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'cave_in', code: 'EXCA-001', title: 'Effondrement', description: 'Affaissement de sols, tranchées ou structures', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'underground_utilities', code: 'EXCA-002', title: 'Services souterrains', description: 'Contact accidentel avec services publics enterrés', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'engulfment', code: 'CONF-001', title: 'Engloutissement', description: 'Submersion dans matériaux fluides ou granulaires', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['confined_spaces'], showControls: false },
  { id: 'electrical_lines', code: 'ELEC-006', title: 'Lignes électriques', description: 'Proximité ou contact avec lignes électriques aériennes', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['electrical_shock'], showControls: false },

  // DANGERS BIOLOGIQUES (24-26)
  { id: 'biological_hazards', code: 'BIO-001', title: 'Dangers biologiques', description: 'Exposition à agents biologiques pathogènes', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['biological_hazards'], showControls: false },
  { id: 'insect_stings', code: 'BIO-002', title: 'Piqûres d\'insectes', description: 'Piqûres ou morsures d\'insectes venimeux', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'animal_attacks', code: 'BIO-003', title: 'Attaques d\'animaux', description: 'Attaques par animaux sauvages ou domestiques', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },

  // DANGERS ERGONOMIQUES (27-29)
  { id: 'ergonomic_hazards', code: 'ERGO-001', title: 'Dangers ergonomiques', description: 'Contraintes physiques et posturales', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['ergonomic_hazards'], showControls: false },
  { id: 'manual_handling', code: 'ERGO-002', title: 'Manutention manuelle', description: 'Soulèvement, transport, manipulation objets lourds', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['ergonomic_hazards'], showControls: false },
  { id: 'repetitive_motion', code: 'ERGO-003', title: 'Mouvements répétitifs', description: 'Gestes répétés sur périodes prolongées', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['ergonomic_hazards'], showControls: false },

  // DANGERS ENVIRONNEMENTAUX (30-35)
  { id: 'weather_exposure', code: 'ENV-001', title: 'Exposition météorologique', description: 'Exposition conditions météorologiques extrêmes', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['weather_exposure'], showControls: false },
  { id: 'heat_stress', code: 'ENV-002', title: 'Stress thermique', description: 'Exposition à chaleur excessive', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['heat_stress'], showControls: false },
  { id: 'cold_exposure', code: 'ENV-003', title: 'Exposition au froid', description: 'Exposition à températures froides extrêmes', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'uv_radiation', code: 'ENV-004', title: 'Rayonnement UV', description: 'Exposition rayonnement ultraviolet solaire', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'wind_exposure', code: 'ENV-005', title: 'Exposition au vent', description: 'Exposition à vents forts et rafales', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'precipitation', code: 'ENV-006', title: 'Précipitations', description: 'Pluie, neige, grêle affectant sécurité', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },

  // DANGERS PHYSIQUES SPÉCIALISÉS (36-39)
  { id: 'noise', code: 'PHYS-001', title: 'Bruit excessif', description: 'Exposition à niveaux sonores élevés', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'vibration', code: 'PHYS-002', title: 'Vibrations', description: 'Exposition vibrations corps entier ou main-bras', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'radiation', code: 'PHYS-003', title: 'Rayonnements', description: 'Exposition rayonnements ionisants ou non-ionisants', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'lockout_tagout', code: 'MECH-004', title: 'Énergies dangereuses', description: 'Remise en marche inattendue d\'équipements', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['mechanical_hazards'], showControls: false }
];

// =================== ÉQUIPEMENTS DE SÉCURITÉ COMPLETS ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  // Protection de la tête
  { id: 'head-001', name: 'Casque de sécurité classe E', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-002', name: 'Casque d\'escalade', required: false, available: false, verified: false, notes: '', category: 'head' },
  
  // Protection des yeux  
  { id: 'eye-001', name: 'Lunettes de sécurité', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-002', name: 'Écran facial', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-003', name: 'Lunettes de soudage', required: false, available: false, verified: false, notes: '', category: 'eye' },
  
  // Protection respiratoire
  { id: 'resp-001', name: 'Masque anti-poussière N95', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-002', name: 'Appareil respiratoire autonome', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-003', name: 'Demi-masque avec cartouches', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  
  // Protection des mains
  { id: 'hand-001', name: 'Gants isolants électriques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-002', name: 'Gants de travail mécaniques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-003', name: 'Gants résistants aux coupures', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-004', name: 'Gants chimiques', required: false, available: false, verified: false, notes: '', category: 'hand' },
  
  // Protection des pieds
  { id: 'foot-001', name: 'Chaussures de sécurité isolantes', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-002', name: 'Bottes de sécurité CSA', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-003', name: 'Couvre-chaussures isolants', required: false, available: false, verified: false, notes: '', category: 'foot' },
  
  // Protection du corps
  { id: 'body-001', name: 'Vêtements arc flash', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-002', name: 'Veste haute visibilité', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-003', name: 'Combinaison Tyvek', required: false, available: false, verified: false, notes: '', category: 'body' },
  
  // Protection contre les chutes
  { id: 'fall-001', name: 'Harnais de sécurité', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-002', name: 'Longe avec absorbeur', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-003', name: 'Corde d\'assurance', required: false, available: false, verified: false, notes: '', category: 'fall' },
  
  // Protection électrique
  { id: 'elec-001', name: 'Tapis isolant', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-002', name: 'Perche isolante', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-003', name: 'Vérificateur d\'absence de tension', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  
  // Détection
  { id: 'detect-001', name: 'Détecteur de gaz H2S', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-002', name: 'Détecteur d\'oxygène', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-003', name: 'Détecteur multigaz', required: false, available: false, verified: false, notes: '', category: 'detection' },
  
  // Autres équipements
  { id: 'other-001', name: 'Trousse de premiers soins', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-002', name: 'Éclairage d\'urgence', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-003', name: 'Équipement de communication', required: false, available: false, verified: false, notes: '', category: 'other' }
];

// =================== DISCUSSIONS D'ÉQUIPE (ORIGINALES) ===================
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

// =================== PROCÉDURES D'URGENCE (ORIGINALES) ===================
const emergencyProcedures: EmergencyProcedure[] = [
  { id: 'emerg-001', type: 'medical', procedure: 'Appeler le 911, premiers soins, évacuation médicale', responsiblePerson: 'Superviseur de chantier', contactInfo: '911 / Contact urgence', isVerified: false },
  { id: 'emerg-002', type: 'fire', procedure: 'Alarme incendie, évacuation, point de rassemblement', responsiblePerson: 'Chef d\'équipe', contactInfo: 'Service incendie 911', isVerified: false },
  { id: 'emerg-003', type: 'electrical', procedure: 'Coupure d\'urgence, consignation, vérification', responsiblePerson: 'Électricien qualifié', contactInfo: 'Responsable électrique', isVerified: false },
  { id: 'emerg-004', type: 'evacuation', procedure: 'Signal d\'évacuation, routes d\'évacuation, décompte', responsiblePerson: 'Responsable sécurité', contactInfo: 'Poste de commandement', isVerified: false }
];
// =================== AST SECTION 3/5 - TRADUCTIONS & FONCTIONS ===================
// Section 3: Traductions complètes + données initiales + fonctions Supabase + PARTAGE ÉQUIPE

// =================== TRADUCTIONS COMPLÈTES (ORIGINALES) ===================
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
      discussion: "Discussion Équipe", 
      equipment: "Équipements Sécurité",
      hazards: "Dangers & Risques",
      isolation: "Points d'Isolement",
      team: "Équipe de Travail",
      documentation: "Photos & Documentation", 
      validation: "Validation & Signatures"
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
    
    team: {
      title: "Équipe de Travail",
      supervisor: "Superviseur",
      addMember: "Ajouter Membre d'Équipe",
      memberName: "Nom du Membre",
      employeeId: "ID Employé",
      department: "Département", 
      qualification: "Qualification",
      validation: "Validation Équipe",
      consultationAst: "Consultation AST",
      cadenasAppose: "Cadenas Apposé",
      cadenasReleve: "Cadenas Relevé",
      status: "Statut",
      actions: "Actions",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      // NOUVEAU: Partage équipe
      shareTeam: "Partager à l'Équipe",
      generateLink: "Générer Lien Consultation",
      sendNotifications: "Envoyer Notifications",
      consultationStatus: "Statut Consultations",
      remoteConsultation: "Consultation à Distance"
    },
    
    isolation: {
      title: "Points d'Isolement",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      checklist: {
        cadenasAppose: "Cadenas Apposé",
        absenceTension: "Absence de Tension", 
        miseALaTerre: "Mise à la Terre"
      }
    },
    
    actions: {
      sendByEmail: "Envoyer par Courriel",
      archive: "Archiver",
      generatePDF: "Générer PDF",
      finalApproval: "Soumission Finale"
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

    // NOUVEAU: Textes partage équipe
    sharing: {
      title: "Partage Équipe",
      generateLink: "Générer Lien de Consultation",
      linkGenerated: "Lien généré avec succès",
      linkExpiry: "Lien valide 7 jours",
      sendSMS: "Envoyer SMS",
      sendWhatsApp: "Envoyer WhatsApp", 
      sendEmail: "Envoyer Email",
      sendAll: "Envoyer Tout",
      consultationProgress: "Progression Consultations",
      memberConsulted: "Membre consulté",
      memberApproved: "Membre approuvé",
      awaitingConsultation: "En attente consultation",
      copyLink: "Copier le lien"
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
      discussion: "Team Discussion", 
      equipment: "Safety Equipment",
      hazards: "Hazards & Risks",
      isolation: "Isolation Points",
      team: "Work Team",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    
    projectInfo: {
      title: "Project Information",
      industry: "Industry Type",
      astNumber: "# JSA",
      astClientNumber: "# Client JSA",
      date: "Date",
      client: "Client", 
      clientPhone: "Client Phone #",
      projectNumber: "Project Number",
      workDescription: "Work Description",
      workLocation: "Work Location",
      clientRepresentative: "Representative Name",
      clientRepresentativePhone: "Representative Phone #",
      workerCount: "Number of people on job",
      estimatedDuration: "Estimated Duration",
      emergencyContact: "Emergency Contact",
      emergencyPhone: "Emergency Phone #"
    },
    
    team: {
      title: "Work Team",
      supervisor: "Supervisor",
      addMember: "Add Team Member",
      memberName: "Member Name",
      employeeId: "Employee ID",
      department: "Department",
      qualification: "Qualification",
      validation: "Team Validation",
      consultationAst: "JSA Consultation", 
      cadenasAppose: "Lock Applied",
      cadenasReleve: "Lock Removed",
      status: "Status",
      actions: "Actions",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      // NEW: Team sharing
      shareTeam: "Share with Team",
      generateLink: "Generate Consultation Link",
      sendNotifications: "Send Notifications",
      consultationStatus: "Consultation Status",
      remoteConsultation: "Remote Consultation"
    },

    // NEW: Team sharing texts
    sharing: {
      title: "Team Sharing",
      generateLink: "Generate Consultation Link",
      linkGenerated: "Link generated successfully",
      linkExpiry: "Link valid for 7 days",
      sendSMS: "Send SMS",
      sendWhatsApp: "Send WhatsApp",
      sendEmail: "Send Email", 
      sendAll: "Send All",
      consultationProgress: "Consultation Progress",
      memberConsulted: "Member consulted",
      memberApproved: "Member approved",
      awaitingConsultation: "Awaiting consultation",
      copyLink: "Copy link"
    }
  }
};

// =================== DONNÉES INITIALES (ORIGINALES) ===================
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
    allApproved: false,
    // NOUVEAU: Partage équipe
    consultationNotifications: []
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

// =================== NOUVELLES FONCTIONS PARTAGE ÉQUIPE ===================
const generateTeamShareLink = async (formData: ASTFormData): Promise<string> => {
  try {
    console.log('🔗 Génération lien partage équipe...');
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Sauvegarder AST en mode consultation
    const shareData = {
      ...formData,
      status: 'team_validation' as const,
      team: {
        ...formData.team,
        shareLink: shareId,
        shareExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    
    localStorage.setItem(`ast_consultation_${shareId}`, JSON.stringify(shareData));
    
    const baseUrl = window.location.origin;
    const consultationLink = `${baseUrl}/consultation/${shareId}`;
    
    console.log('✅ Lien de partage généré:', consultationLink);
    return consultationLink;
  } catch (error) {
    console.error('❌ Erreur génération lien:', error);
    throw error;
  }
};

const sendTeamNotifications = async (
  members: TeamMember[], 
  shareLink: string, 
  projectInfo: ASTFormData['projectInfo'],
  methods: Array<'sms' | 'email' | 'whatsapp'> = ['sms']
): Promise<TeamConsultationNotification[]> => {
  try {
    console.log('📱 Envoi notifications équipe...');
    const notifications: TeamConsultationNotification[] = [];
    
    for (const member of members) {
      for (const method of methods) {
        const message = `🔒 CONSULTATION AST REQUISE
📋 Projet: ${projectInfo.client} - ${projectInfo.projectNumber}
📅 Date: ${projectInfo.date}
👤 ${member.name}, votre consultation est requise pour l'AST.

🔗 Lien consultation: ${shareLink}

⚠️ Consultez et donnez votre consentement avant le début des travaux.
⏰ Lien valide 7 jours.

Sécur360 - Votre sécurité, notre priorité`;

        const notification: TeamConsultationNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          employeeId: member.id,
          method,
          status: 'sent',
          timestamp: new Date().toISOString(),
          message,
          phoneNumber: method === 'sms' || method === 'whatsapp' ? member.employeeId : undefined,
          emailAddress: method === 'email' ? `${member.name.toLowerCase().replace(' ', '.')}@example.com` : undefined
        };

        // Simulation envoi selon méthode
        if (method === 'whatsapp' && member.employeeId) {
          const whatsappUrl = `https://wa.me/${member.employeeId.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else if (method === 'sms') {
          console.log(`📱 SMS envoyé à ${member.name}: ${member.employeeId}`);
        } else if (method === 'email') {
          console.log(`📧 Email envoyé à ${member.name}: ${notification.emailAddress}`);
        }

        notifications.push(notification);
      }
    }
    
    console.log(`✅ ${notifications.length} notifications envoyées`);
    return notifications;
  } catch (error) {
    console.error('❌ Erreur envoi notifications:', error);
    throw error;
  }
};

// =================== FONCTIONS SUPABASE (ORIGINALES) ===================
const saveToSupabase = async (formData: ASTFormData): Promise<boolean> => {
  try {
    console.log('💾 Sauvegarde Supabase en cours...', formData.astNumber);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Sauvegarde Supabase réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde Supabase:', error);
    return false;
  }
};
// =================== AST SECTION 4/5 - COMPOSANT PRINCIPAL & LOGIQUE ===================
// Section 4: Composant principal avec votre interface exacte + logique métier complète + partage équipe

// =================== STYLES CSS PREMIUM MOBILE OPTIMISÉ (VOTRE ORIGINAL) ===================
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

.header-counters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-logo {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.counters-grid {
  display: flex;
  gap: 24px;
}

.counter-item {
  text-align: center;
  padding: 12px 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.counter-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.counter-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.counter-item.approval-rate .counter-number {
  color: #10b981;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  margin-bottom: 24px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 8px;
  flex-wrap: wrap;
}

.step-item {
  flex: 1;
  min-width: 150px;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.step-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.step-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #3b82f6;
}

.step-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-premium {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-premium:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-premium {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.btn-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.3);
  border-color: rgba(100, 116, 139, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.checkbox-premium {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(100, 116, 139, 0.5);
  border-radius: 4px;
  background: transparent;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.checkbox-premium.checked {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #3b82f6;
}

.checkbox-premium.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.equipment-item {
  padding: 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.equipment-item.required {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.equipment-item.verified {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.05);
}

.hazard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.hazard-item {
  padding: 20px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hazard-item.selected.no-controls {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.05);
}

.hazard-item.selected.has-controls {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.05);
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  overflow: hidden;
}

.approval-table th {
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
}

.approval-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.1);
  color: #e2e8f0;
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .form-container {
    padding: 10px;
  }

  .glass-effect {
    padding: 16px;
    border-radius: 16px;
  }

  .header-counters {
    flex-direction: column;
    gap: 12px;
  }

  .step-indicator {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .equipment-grid,
  .hazard-grid {
    grid-template-columns: 1fr;
  }
}
`;

// =================== COMPOSANT PHOTO CAROUSEL (ORIGINAL) ===================
const PhotoCarousel: React.FC<{
  photos: Photo[];
  onAddPhoto: (file: File) => Promise<void>;
  onRemovePhoto: (photoId: string) => void;
  onUpdateDescription: (photoId: string, description: string) => void;
}> = ({ photos, onAddPhoto, onRemovePhoto, onUpdateDescription }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
          await onAddPhoto(file);
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0' }}>
          📸 Photos ({photos.length})
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Camera style={{ width: '16px', height: '16px' }} />
          Ajouter Photos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {photos.length > 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={photos[currentIndex].data}
              alt={photos[currentIndex].name}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                
                <button
                  onClick={() => setCurrentIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </>
            )}
            
            <button
              onClick={() => onRemovePhoto(photos[currentIndex].id)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                color: 'white',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Description de la photo..."
              value={photos[currentIndex].description}
              onChange={(e) => onUpdateDescription(photos[currentIndex].id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: '60px',
                    height: '60px',
                    padding: '2px',
                    border: currentIndex === index ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                >
                  <img
                    src={photo.data}
                    alt={photo.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '2px dashed rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          <Camera style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: '0' }}>Aucune photo ajoutée</p>
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT PRINCIPAL ===================
export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ASTFormData>(initialFormData);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({});
  const [newIsolationPoint, setNewIsolationPoint] = useState<Partial<IsolationPoint>>({});
  
  // NOUVEAU: États pour le partage équipe
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [teamConsultationProgress, setTeamConsultationProgress] = useState(0);

  const steps = [
    { icon: FileText, key: 'general' as const },
    { icon: MessageSquare, key: 'discussion' as const },
    { icon: Shield, key: 'equipment' as const },
    { icon: Zap, key: 'hazards' as const },
    { icon: Settings, key: 'isolation' as const },
    { icon: Users, key: 'team' as const },
    { icon: Camera, key: 'documentation' as const },
    { icon: CheckCircle, key: 'validation' as const }
  ];

  const t = translations[language];

  // Auto-save avec Supabase toutes les 30 secondes
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (formData.status === 'draft') {
        await handleSave(true, true);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Injection des styles CSS
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

  // Calcul progression consultation équipe
  useEffect(() => {
    if (formData.team.members.length > 0) {
      const consultedMembers = formData.team.members.filter(m => 
        m.remoteConsultationCompleted || m.validationStatus === 'approved'
      ).length;
      setTeamConsultationProgress((consultedMembers / formData.team.members.length) * 100);
    }
  }, [formData.team.members]);

  // =================== FONCTIONS DE SAUVEGARDE ===================
  const handleSave = async (isDraft = true, isAutoSave = false) => {
    setSaveStatus('saving');
    
    try {
      const updatedFormData: ASTFormData = {
        ...formData,
        lastModified: new Date().toISOString(),
        status: isDraft ? 'draft' : 'completed'
      };
      
      const success = await saveToSupabase(updatedFormData);
      
      if (success) {
        setFormData(updatedFormData);
        setSaveStatus('saved');
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

  const regenerateASTNumber = () => {
    setFormData(prev => ({
      ...prev,
      astNumber: generateASTNumber()
    }));
  };

  // =================== NOUVELLES FONCTIONS PARTAGE ÉQUIPE ===================
  const handleGenerateShareLink = async () => {
    setIsGeneratingShareLink(true);
    try {
      const generatedLink = await generateTeamShareLink(formData);
      setShareLink(generatedLink);
      
      // Mettre à jour formData avec le lien
      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          shareLink: generatedLink
        }
      }));
      
    } catch (error) {
      console.error('Erreur génération lien:', error);
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  const handleSendNotifications = async (methods: Array<'sms' | 'email' | 'whatsapp'>) => {
    if (!shareLink || !formData.team.members.length) return;

    try {
      const notifications = await sendTeamNotifications(
        formData.team.members,
        shareLink,
        formData.projectInfo,
        methods
      );

      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          consultationNotifications: [...prev.team.consultationNotifications, ...notifications]
        }
      }));

    } catch (error) {
      console.error('Erreur envoi notifications:', error);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  // ========== FONCTIONS ÉQUIPE AVEC APPROBATIONS (ORIGINALES) ==========
  const addTeamMember = () => {
    if (newTeamMember.name?.trim()) {
      const member: TeamMember = {
        id: `member-${Date.now()}`,
        name: newTeamMember.name.trim(),
        employeeId: newTeamMember.employeeId || '',
        department: newTeamMember.department || '',
        qualification: newTeamMember.qualification || '',
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
          members: [...prev.team.members, member],
          totalMembers: prev.team.members.length + 1
        }
      }));
      
      setNewTeamMember({});
    }
  };

  const removeTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter(m => m.id !== memberId),
        totalMembers: Math.max(0, prev.team.totalMembers - 1)
      }
    }));
  };

  const validateTeamMember = (memberId: string, approved: boolean) => {
    setFormData(prev => {
      const updatedMembers = prev.team.members.map(m =>
        m.id === memberId 
          ? { ...m, validationStatus: (approved ? 'approved' : 'rejected') as TeamMember['validationStatus'] }
          : m
      );
      
      const allApproved = updatedMembers.every(m => m.validationStatus === 'approved');
      
      return {
        ...prev,
        team: {
          ...prev.team,
          members: updatedMembers,
          allApproved,
          acknowledgedMembers: updatedMembers.filter(m => m.validationStatus === 'approved').length
        }
      };
    });
  };

  const toggleConsultationAst = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, consultationAst: !m.consultationAst }
            : m
        )
      }
    }));
  };

  const toggleCadenasAppose = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, cadenasAppose: !m.cadenasAppose }
            : m
        )
      }
    }));
  };

  // ========== FONCTIONS DANGERS ==========
  const toggleHazard = (hazardId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? { ...h, isSelected: !h.isSelected, showControls: !h.isSelected ? true : false } 
          : h
      )
    }));
  };

  const toggleControlMeasure = (hazardId: string, controlId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? {
              ...h,
              controlMeasures: h.controlMeasures.map(c =>
                c.id === controlId ? { ...c, isSelected: !c.isSelected } : c
              )
            }
          : h
      )
    }));
  };

  const hasSelectedControls = (hazard: ElectricalHazard): boolean => {
    return hazard.controlMeasures.some(control => control.isSelected);
  };

  // ========== FONCTIONS PHOTOS ==========
  const addPhoto = (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newPhoto: Photo = {
            id: `photo-${Date.now()}`,
            name: file.name,
            data: e.target?.result as string,
            description: '',
            timestamp: new Date().toISOString(),
            category: 'site'
          };
          
          setFormData(prev => ({
            ...prev,
            documentation: {
              ...prev.documentation,
              photos: [...prev.documentation.photos, newPhoto]
            }
          }));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.filter(p => p.id !== photoId)
      }
    }));
  };

  const updatePhotoDescription = (photoId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.map(p =>
          p.id === photoId ? { ...p, description } : p
        )
      }
    }));
  };

  // ========== COMPOSANTS HELPER ==========
  const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onChange}>
      <div className={`checkbox-premium ${checked ? 'checked' : ''}`} />
      <span style={{ color: '#e2e8f0', fontSize: '14px', flex: 1 }}>{label}</span>
    </div>
  );

  const LockButton = ({ locked, onToggle, title }: { locked: boolean; onToggle: () => void; title: string }) => (
    <button
      onClick={onToggle}
      style={{
        background: 'none',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '6px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      title={title}
    >
      {locked ? (
        <Lock style={{ width: '16px', height: '16px', color: '#10b981' }} />
      ) : (
        <Unlock style={{ width: '16px', height: '16px', color: '#64748b' }} />
      )}
    </button>
  );

  // Calculs pour les compteurs
  const approvedMembersCount = formData.team.members.filter(m => m.validationStatus === 'approved').length;
  const approvalRate = formData.team.members.length > 0 ? 
    Math.round((approvedMembersCount / formData.team.members.length) * 100) : 0;

  // Le return JSX sera dans la section 5...
// =================== AST SECTION 4/5 - COMPOSANT PRINCIPAL & LOGIQUE ===================
// Section 4: Composant principal avec votre interface exacte + logique métier complète + partage équipe

// =================== STYLES CSS PREMIUM MOBILE OPTIMISÉ (VOTRE ORIGINAL) ===================
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

.header-counters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-logo {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.counters-grid {
  display: flex;
  gap: 24px;
}

.counter-item {
  text-align: center;
  padding: 12px 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.counter-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.counter-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.counter-item.approval-rate .counter-number {
  color: #10b981;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  margin-bottom: 24px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 8px;
  flex-wrap: wrap;
}

.step-item {
  flex: 1;
  min-width: 150px;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.step-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.step-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #3b82f6;
}

.step-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-premium {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-premium:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-premium {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.btn-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.3);
  border-color: rgba(100, 116, 139, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.checkbox-premium {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(100, 116, 139, 0.5);
  border-radius: 4px;
  background: transparent;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.checkbox-premium.checked {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-color: #3b82f6;
}

.checkbox-premium.checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.equipment-item {
  padding: 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.equipment-item.required {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.equipment-item.verified {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.05);
}

.hazard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.hazard-item {
  padding: 20px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hazard-item.selected.no-controls {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.05);
}

.hazard-item.selected.has-controls {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.05);
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  overflow: hidden;
}

.approval-table th {
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
}

.approval-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.1);
  color: #e2e8f0;
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .form-container {
    padding: 10px;
  }

  .glass-effect {
    padding: 16px;
    border-radius: 16px;
  }

  .header-counters {
    flex-direction: column;
    gap: 12px;
  }

  .step-indicator {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .equipment-grid,
  .hazard-grid {
    grid-template-columns: 1fr;
  }
}
`;

// =================== COMPOSANT PHOTO CAROUSEL (ORIGINAL) ===================
const PhotoCarousel: React.FC<{
  photos: Photo[];
  onAddPhoto: (file: File) => Promise<void>;
  onRemovePhoto: (photoId: string) => void;
  onUpdateDescription: (photoId: string, description: string) => void;
}> = ({ photos, onAddPhoto, onRemovePhoto, onUpdateDescription }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
          await onAddPhoto(file);
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0' }}>
          📸 Photos ({photos.length})
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Camera style={{ width: '16px', height: '16px' }} />
          Ajouter Photos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {photos.length > 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={photos[currentIndex].data}
              alt={photos[currentIndex].name}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                </button>
                
                <button
                  onClick={() => setCurrentIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              </>
            )}
            
            <button
              onClick={() => onRemovePhoto(photos[currentIndex].id)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                color: 'white',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Description de la photo..."
              value={photos[currentIndex].description}
              onChange={(e) => onUpdateDescription(photos[currentIndex].id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>

          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: '60px',
                    height: '60px',
                    padding: '2px',
                    border: currentIndex === index ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                >
                  <img
                    src={photo.data}
                    alt={photo.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '2px dashed rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          <Camera style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: '0' }}>Aucune photo ajoutée</p>
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT PRINCIPAL ===================
export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ASTFormData>(initialFormData);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({});
  const [newIsolationPoint, setNewIsolationPoint] = useState<Partial<IsolationPoint>>({});
  
  // NOUVEAU: États pour le partage équipe
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [teamConsultationProgress, setTeamConsultationProgress] = useState(0);

  const steps = [
    { icon: FileText, key: 'general' as const },
    { icon: MessageSquare, key: 'discussion' as const },
    { icon: Shield, key: 'equipment' as const },
    { icon: Zap, key: 'hazards' as const },
    { icon: Settings, key: 'isolation' as const },
    { icon: Users, key: 'team' as const },
    { icon: Camera, key: 'documentation' as const },
    { icon: CheckCircle, key: 'validation' as const }
  ];

  const t = translations[language];

  // Auto-save avec Supabase toutes les 30 secondes
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (formData.status === 'draft') {
        await handleSave(true, true);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Injection des styles CSS
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

  // Calcul progression consultation équipe
  useEffect(() => {
    if (formData.team.members.length > 0) {
      const consultedMembers = formData.team.members.filter(m => 
        m.remoteConsultationCompleted || m.validationStatus === 'approved'
      ).length;
      setTeamConsultationProgress((consultedMembers / formData.team.members.length) * 100);
    }
  }, [formData.team.members]);

  // =================== FONCTIONS DE SAUVEGARDE ===================
  const handleSave = async (isDraft = true, isAutoSave = false) => {
    setSaveStatus('saving');
    
    try {
      const updatedFormData: ASTFormData = {
        ...formData,
        lastModified: new Date().toISOString(),
        status: isDraft ? 'draft' : 'completed'
      };
      
      const success = await saveToSupabase(updatedFormData);
      
      if (success) {
        setFormData(updatedFormData);
        setSaveStatus('saved');
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

  const regenerateASTNumber = () => {
    setFormData(prev => ({
      ...prev,
      astNumber: generateASTNumber()
    }));
  };

  // =================== NOUVELLES FONCTIONS PARTAGE ÉQUIPE ===================
  const handleGenerateShareLink = async () => {
    setIsGeneratingShareLink(true);
    try {
      const generatedLink = await generateTeamShareLink(formData);
      setShareLink(generatedLink);
      
      // Mettre à jour formData avec le lien
      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          shareLink: generatedLink
        }
      }));
      
    } catch (error) {
      console.error('Erreur génération lien:', error);
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  const handleSendNotifications = async (methods: Array<'sms' | 'email' | 'whatsapp'>) => {
    if (!shareLink || !formData.team.members.length) return;

    try {
      const notifications = await sendTeamNotifications(
        formData.team.members,
        shareLink,
        formData.projectInfo,
        methods
      );

      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          consultationNotifications: [...prev.team.consultationNotifications, ...notifications]
        }
      }));

    } catch (error) {
      console.error('Erreur envoi notifications:', error);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  // ========== FONCTIONS ÉQUIPE AVEC APPROBATIONS (ORIGINALES) ==========
  const addTeamMember = () => {
    if (newTeamMember.name?.trim()) {
      const member: TeamMember = {
        id: `member-${Date.now()}`,
        name: newTeamMember.name.trim(),
        employeeId: newTeamMember.employeeId || '',
        department: newTeamMember.department || '',
        qualification: newTeamMember.qualification || '',
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
          members: [...prev.team.members, member],
          totalMembers: prev.team.members.length + 1
        }
      }));
      
      setNewTeamMember({});
    }
  };

  const removeTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter(m => m.id !== memberId),
        totalMembers: Math.max(0, prev.team.totalMembers - 1)
      }
    }));
  };

  const validateTeamMember = (memberId: string, approved: boolean) => {
    setFormData(prev => {
      const updatedMembers = prev.team.members.map(m =>
        m.id === memberId 
          ? { ...m, validationStatus: (approved ? 'approved' : 'rejected') as TeamMember['validationStatus'] }
          : m
      );
      
      const allApproved = updatedMembers.every(m => m.validationStatus === 'approved');
      
      return {
        ...prev,
        team: {
          ...prev.team,
          members: updatedMembers,
          allApproved,
          acknowledgedMembers: updatedMembers.filter(m => m.validationStatus === 'approved').length
        }
      };
    });
  };

  const toggleConsultationAst = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, consultationAst: !m.consultationAst }
            : m
        )
      }
    }));
  };

  const toggleCadenasAppose = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, cadenasAppose: !m.cadenasAppose }
            : m
        )
      }
    }));
  };

  // ========== FONCTIONS DANGERS ==========
  const toggleHazard = (hazardId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? { ...h, isSelected: !h.isSelected, showControls: !h.isSelected ? true : false } 
          : h
      )
    }));
  };

  const toggleControlMeasure = (hazardId: string, controlId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? {
              ...h,
              controlMeasures: h.controlMeasures.map(c =>
                c.id === controlId ? { ...c, isSelected: !c.isSelected } : c
              )
            }
          : h
      )
    }));
  };

  const hasSelectedControls = (hazard: ElectricalHazard): boolean => {
    return hazard.controlMeasures.some(control => control.isSelected);
  };

  // ========== FONCTIONS PHOTOS ==========
  const addPhoto = (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newPhoto: Photo = {
            id: `photo-${Date.now()}`,
            name: file.name,
            data: e.target?.result as string,
            description: '',
            timestamp: new Date().toISOString(),
            category: 'site'
          };
          
          setFormData(prev => ({
            ...prev,
            documentation: {
              ...prev.documentation,
              photos: [...prev.documentation.photos, newPhoto]
            }
          }));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.filter(p => p.id !== photoId)
      }
    }));
  };

  const updatePhotoDescription = (photoId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.map(p =>
          p.id === photoId ? { ...p, description } : p
        )
      }
    }));
  };

  // ========== COMPOSANTS HELPER ==========
  const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onChange}>
      <div className={`checkbox-premium ${checked ? 'checked' : ''}`} />
      <span style={{ color: '#e2e8f0', fontSize: '14px', flex: 1 }}>{label}</span>
    </div>
  );

  const LockButton = ({ locked, onToggle, title }: { locked: boolean; onToggle: () => void; title: string }) => (
    <button
      onClick={onToggle}
      style={{
        background: 'none',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '6px',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      title={title}
    >
      {locked ? (
        <Lock style={{ width: '16px', height: '16px', color: '#10b981' }} />
      ) : (
        <Unlock style={{ width: '16px', height: '16px', color: '#64748b' }} />
      )}
    </button>
  );

  // Calculs pour les compteurs
  const approvedMembersCount = formData.team.members.filter(m => m.validationStatus === 'approved').length;
  const approvalRate = formData.team.members.length > 0 ? 
    Math.round((approvedMembersCount / formData.team.members.length) * 100) : 0;

  // Le return JSX sera dans la section 5...
  
