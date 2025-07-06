// =================== AST SECTION 1/5 - IMPORTS & INTERFACES ===================
// Section 1: Imports et Interfaces complètes avec tous les nouveaux champs

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock
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
// =================== AST SECTION 2/5 - DONNÉES & TRADUCTIONS ===================
// Section 2: Données complètes SANS DUPLICATIONS

// =================== LOGO CLIENT POTENTIEL SVG (UNIQUE) ===================
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

// =================== MOYENS DE CONTRÔLE PRÉDÉFINIS (UNIQUE) ===================
const predefinedControlMeasures: Record<string, ControlMeasure[]> = {
  // Moyens de contrôle pour Électrocution
  'ELEC-001': [
    { id: 'ctrl-elec-001-1', name: 'Consignation/Verrouillage', description: 'Appliquer la procédure LOTO complète', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-2', name: 'Vérification absence de tension', description: 'Utiliser un VAT certifié et testé', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-3', name: 'Mise à la terre temporaire', description: 'Installer des mises à la terre de sécurité', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-4', name: 'EPI électrique', description: 'Porter gants isolants, casque classe E, chaussures isolantes', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-001-5', name: 'Formation électrique', description: 'Personnel qualifié selon CSA Z462', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],
  
  // Moyens de contrôle pour Arc électrique
  'ELEC-002': [
    { id: 'ctrl-elec-002-1', name: 'Analyse arc flash', description: 'Effectuer calcul d\'énergie incidente', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-2', name: 'EPI arc flash', description: 'Vêtements résistants à l\'arc selon catégorie', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-3', name: 'Équipement télécommandé', description: 'Utiliser perches isolantes et outils télécommandés', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-elec-002-4', name: 'Distance de sécurité', description: 'Respecter les limites d\'approche', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ],

  // Moyens de contrôle génériques pour autres dangers
  'default': [
    { id: 'ctrl-def-001', name: 'Formation du personnel', description: 'Formation sur les risques et procédures', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-def-002', name: 'Supervision directe', description: 'Surveillance constante par personne qualifiée', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-def-003', name: 'EPI approprié', description: 'Équipement de protection selon le risque', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'ctrl-def-004', name: 'Procédures écrites', description: 'Mode opératoire normalisé documenté', category: 'administrative', isSelected: false, photos: [], notes: '' }
  ]
};

// =================== TOUS LES DANGERS POTENTIELS ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  { id: 'ELEC-001', code: 'ELEC-001', title: 'Électrocution', description: 'Contact direct ou indirect avec des pièces sous tension', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['ELEC-001'], showControls: false },
  { id: 'ELEC-002', code: 'ELEC-002', title: 'Arc électrique', description: 'Formation d\'arc électrique causant brûlures et explosion', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['ELEC-002'], showControls: false },
  { id: 'FALL-001', code: 'FALL-001', title: 'Chute de hauteur', description: 'Chute depuis une surface élevée', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FALL-002', code: 'FALL-002', title: 'Chute de plain-pied', description: 'Glissade, trébuchement sur surface de niveau', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FALL-003', code: 'FALL-003', title: 'Chute d\'objets', description: 'Objets tombant d\'une hauteur', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MECH-001', code: 'MECH-001', title: 'Happement', description: 'Entraînement par pièces en mouvement', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MECH-002', code: 'MECH-002', title: 'Coupure', description: 'Blessure par objets tranchants', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'MECH-003', code: 'MECH-003', title: 'Écrasement', description: 'Compression par objets lourds', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FIRE-001', code: 'FIRE-001', title: 'Incendie', description: 'Combustion non contrôlée', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'FIRE-002', code: 'FIRE-002', title: 'Explosion', description: 'Expansion rapide de gaz avec onde de choc', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CHEM-001', code: 'CHEM-001', title: 'Exposition chimique', description: 'Contact avec substances dangereuses', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'CHEM-002', code: 'CHEM-002', title: 'Inhalation de vapeurs', description: 'Respiration de substances toxiques', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'NOISE-001', code: 'NOISE-001', title: 'Exposition au bruit', description: 'Niveau sonore élevé causant perte auditive', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'TEMP-001', code: 'TEMP-001', title: 'Exposition à la chaleur', description: 'Température élevée causant stress thermique', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'TEMP-002', code: 'TEMP-002', title: 'Exposition au froid', description: 'Température basse causant hypothermie', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'VIB-001', code: 'VIB-001', title: 'Vibrations', description: 'Exposition aux vibrations mécaniques', riskLevel: 'low', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'RAD-001', code: 'RAD-001', title: 'Radiations', description: 'Exposition aux rayonnements ionisants', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'BIO-001', code: 'BIO-001', title: 'Agents biologiques', description: 'Exposition à microorganismes pathogènes', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ERGO-001', code: 'ERGO-001', title: 'Troubles musculo-squelettiques', description: 'Lésions par efforts répétitifs', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'SPACE-001', code: 'SPACE-001', title: 'Espace clos', description: 'Travail en espace confiné', riskLevel: 'critical', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'VEHICLE-001', code: 'VEHICLE-001', title: 'Circulation de véhicules', description: 'Collision avec véhicules mobiles', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'LIFT-001', code: 'LIFT-001', title: 'Manutention manuelle', description: 'Soulèvement et transport manuel', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'EQUIP-001', code: 'EQUIP-001', title: 'Défaillance d\'équipement', description: 'Panne ou bris d\'équipement critique', riskLevel: 'high', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'ENV-001', code: 'ENV-001', title: 'Conditions météo défavorables', description: 'Intempéries affectant la sécurité', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'STRESS-001', code: 'STRESS-001', title: 'Stress et fatigue', description: 'Épuisement physique et mental', riskLevel: 'low', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false },
  { id: 'OTHER-001', code: 'OTHER-001', title: 'Autres dangers spécifiques', description: 'Dangers particuliers au site de travail', riskLevel: 'medium', isSelected: false, controlMeasures: predefinedControlMeasures['default'], showControls: false }
];

// =================== ÉQUIPEMENTS DE SÉCURITÉ ===================
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

// =================== DISCUSSIONS D'ÉQUIPE ===================
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
// =================== AST SECTION 3/5 - TRADUCTIONS & FONCTIONS ===================
// Section 3: Traductions complètes, données initiales et fonctions Supabase

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
      rejected: "Rejeté"
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
      print: "Imprimer",
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
      emergencyPhone: "Emergency Phone #",
      astInfo: "Auto-generated unique number",
      astClientInfo: "Client-provided number (optional)"
    },
    
    teamDiscussion: {
      title: "Team Discussion",
      subtitle: "Information to discuss with team",
      completed: "Completed",
      pending: "Pending",
      discussedBy: "Discussed by", 
      notes: "Notes",
      priority: "Priority"
    },
    
    safetyEquipment: {
      title: "Individual and Collective Protection Equipment",
      required: "Required",
      available: "Available",
      verified: "Verified",
      notes: "Notes",
      categories: {
        head: "Head Protection",
        eye: "Eye Protection", 
        respiratory: "Respiratory Protection",
        hand: "Hand Protection",
        foot: "Foot Protection",
        body: "Body Protection", 
        fall: "Fall Protection",
        electrical: "Electrical Protection",
        detection: "Detection",
        other: "Other"
      }
    },
    
    hazards: {
      title: "Potential Hazards",
      selected: "Selected",
      riskLevel: "Risk Level", 
      notes: "Additional notes",
      controlMeasures: "Control Measures",
      controlsRequired: "⚠️ Control measures required",
      controlsInPlace: "VIGILANCE - Control measures in place",
      addCustomHazard: "Add custom hazard",
      levels: {
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical"
      },
      categories: {
        elimination: "Elimination",
        substitution: "Substitution", 
        engineering: "Engineering",
        administrative: "Administrative",
        ppe: "PPE"
      }
    },
    
    industries: {
      electrical: "Electrical",
      construction: "Construction",
      industrial: "Industrial",
      office: "Office/Administrative",
      manufacturing: "Manufacturing",
      other: "Other"
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
      rejected: "Rejected"
    },
    
    isolation: {
      title: "Isolation Points",
      addPoint: "Add Isolation Point",
      pointName: "Isolation Point Name",
      isolationType: "Isolation Type",
      selectType: "Select type...",
      noPoints: "No isolation points configured",
      checklist: {
        cadenasAppose: "Lock Applied",
        absenceTension: "Absence of Voltage",
        miseALaTerre: "Grounded"
      }
    },
    
    actions: {
      sendByEmail: "Send by Email",
      archive: "Archive", 
      generatePDF: "Generate PDF",
      print: "Print",
      finalApproval: "Final Submission"
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

// =================== DONNÉES INITIALES ===================
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

// =================== FONCTIONS SUPABASE ===================
const saveToSupabase = async (formData: ASTFormData): Promise<boolean> => {
  try {
    console.log('💾 Sauvegarde Supabase en cours...', formData.astNumber);
    
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
    
    // Simuler l'archivage
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Archivage Supabase réussi');
    return archivedData;
  } catch (error) {
    console.error('❌ Erreur archivage Supabase:', error);
    throw error;
  }
};

// =================== FONCTIONS PDF & EMAIL ===================
const generateProfessionalPDF = async (formData: ASTFormData, tenant: Tenant): Promise<boolean> => {
  try {
    console.log('📄 Génération PDF en cours...');
    
    // Import dynamique pour éviter les erreurs SSR
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let currentY = 20;
    const margin = 20;
    const lineHeight = 7;
    
    // EN-TÊTE
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, currentY, 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT', margin + 20, currentY + 8, { align: 'center' });
    doc.text('POTENTIEL', margin + 20, currentY + 14, { align: 'center' });
    
    // TITRE
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(20);
    doc.text('ANALYSE SÉCURITAIRE DE TÂCHES', margin + 50, currentY + 12);
    doc.setFontSize(12);
    doc.text(`# ${formData.astNumber}`, margin + 50, currentY + 20);
    
    currentY += 35;
    
    // INFORMATIONS GÉNÉRALES
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS GÉNÉRALES', margin, currentY);
    currentY += 10;
    
    const info = [
      ['Client:', formData.projectInfo.client],
      ['Téléphone:', formData.projectInfo.clientPhone],
      ['Projet:', formData.projectInfo.projectNumber],
      ['Lieu:', formData.projectInfo.workLocation],
      ['Date:', formData.projectInfo.date],
      ['Équipe:', formData.team.members.length.toString()],
      ['Description:', formData.projectInfo.workDescription]
    ];
    
    doc.setFontSize(10);
    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'Non spécifié', margin + 40, currentY);
      currentY += lineHeight;
    });
    
    // DANGERS
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DANGERS IDENTIFIÉS', margin, currentY);
    currentY += 10;
    
    const selectedHazards = formData.electricalHazards.filter(h => h.isSelected);
    if (selectedHazards.length > 0) {
      selectedHazards.forEach((hazard, index) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${hazard.title}`, margin, currentY);
        currentY += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(hazard.description, margin + 5, currentY);
        currentY += lineHeight + 3;
      });
    }
    
    // ÉQUIPE
    if (formData.team.members.length > 0) {
      currentY += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ÉQUIPE DE TRAVAIL', margin, currentY);
      currentY += 10;
      
      formData.team.members.forEach(member => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${member.name} - ${member.department}`, margin, currentY);
        currentY += lineHeight;
      });
    }
    
    // SIGNATURES
    currentY += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES', margin, currentY);
    currentY += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Superviseur:', margin, currentY);
    doc.line(margin + 30, currentY, margin + 100, currentY);
    doc.text('Date:', margin + 110, currentY);
    doc.line(margin + 125, currentY, margin + 170, currentY);
    
    // Sauvegarde
    const fileName = `AST_${formData.astNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF généré:', fileName);
    return true;
  } catch (error) {
    console.error('❌ Erreur PDF:', error);
    return false;
  }
};

const sendByEmail = async (formData: ASTFormData, tenant: Tenant, language: 'fr' | 'en'): Promise<boolean> => {
  try {
    console.log('📧 Envoi email...');
    
    const t = translations[language];
    const subject = `${t.email.subject} - ${formData.astNumber}`;
    const body = encodeURIComponent(`${t.email.body}\n\nDétails:\nClient: ${formData.projectInfo.client}\nProjet: ${formData.projectInfo.projectNumber}\nDate: ${formData.projectInfo.date}`);
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(mailtoUrl);
    
    console.log('✅ Email ouvert');
    return true;
  } catch (error) {
    console.error('❌ Erreur email:', error);
    return false;
  }
};

// =================== COMPOSANT PHOTO CAROUSEL ===================
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
// =================== AST SECTION 4/5 - COMPOSANT PRINCIPAL & LOGIQUE CORRIGÉE ===================
// Section 4: Composant principal avec toutes les fonctions et logique métier CORRIGÉE

// =================== STYLES CSS PREMIUM ===================
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

.discussion-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.discussion-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
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

.hazard-controls-required {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
}

.hazard-controls-vigilance {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
}

.control-measures-section {
  margin-top: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.control-measure-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(100, 116, 139, 0.1);
}

.control-measure-item:last-child {
  border-bottom: none;
}

.isolation-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checklist-item:hover {
  background: rgba(59, 130, 246, 0.1);
}

.checklist-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
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

.worker-name-cell {
  font-weight: 600;
}

.lock-button {
  background: none;
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lock-icon.locked {
  color: #10b981;
}

.lock-icon.unlocked {
  color: #64748b;
}

.lock-button:hover {
  background: rgba(100, 116, 139, 0.1);
}

.status-approved {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .header-counters {
    flex-direction: column;
    gap: 16px;
  }
  
  .counters-grid {
    justify-content: center;
  }
  
  .step-indicator {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .equipment-grid,
  .hazard-grid {
    grid-template-columns: 1fr;
  }
}
`;

// =================== COMPOSANT PRINCIPAL ===================
export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ASTFormData>(initialFormData);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({});
  const [newIsolationPoint, setNewIsolationPoint] = useState<Partial<IsolationPoint>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Injection des styles CSS - CORRIGÉE
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = premiumStyles;
    document.head.appendChild(styleSheet);
    
    // Fonction de nettoyage correcte
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

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
        setLastSaveTime(new Date().toLocaleTimeString());
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

  // ========== FONCTIONS ÉQUIPE AVEC APPROBATIONS ==========
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

  const validateTeamMember = (memberId: string, approved: boolean, comments: string = '') => {
    setFormData(prev => {
      const updatedMembers: TeamMember[] = prev.team.members.map(m =>
        m.id === memberId 
          ? { 
              ...m, 
              validationStatus: (approved ? 'approved' : 'rejected') as TeamMember['validationStatus'],
              validationComments: comments 
            }
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

  // ========== FONCTIONS POINTS D'ISOLEMENT ==========
  const addIsolationPoint = () => {
    if (newIsolationPoint.name?.trim() && newIsolationPoint.type) {
      const point: IsolationPoint = {
        id: `isolation-${Date.now()}`,
        name: newIsolationPoint.name.trim(),
        type: newIsolationPoint.type,
        isActive: true,
        createdAt: new Date().toISOString(),
        photos: [],
        checklist: {
          cadenasAppose: false,
          absenceTension: false,
          miseALaTerre: false,
          cadenasReleve: false
        }
      };
      
      setFormData(prev => ({
        ...prev,
        isolationPoints: [...prev.isolationPoints, point]
      }));
      
      setNewIsolationPoint({});
    }
  };

  const removeIsolationPoint = (pointId: string) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.filter(p => p.id !== pointId)
    }));
  };

  const updateIsolationChecklist = (pointId: string, checklistItem: keyof IsolationPoint['checklist']) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.map(point =>
        point.id === pointId 
          ? {
              ...point,
              checklist: {
                ...point.checklist,
                [checklistItem]: !point.checklist[checklistItem]
              }
            }
          : point
      )
    }));
  };

  // ========== FONCTIONS PHOTOS CORRIGÉES ==========
  const addPhotoToIsolationPoint = (pointId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newPhoto: Photo = {
            id: `photo-${Date.now()}`,
            name: file.name,
            data: e.target?.result as string,
            description: '',
            timestamp: new Date().toISOString(),
            category: 'isolation'
          };
          
          setFormData(prev => ({
            ...prev,
            isolationPoints: prev.isolationPoints.map(point =>
              point.id === pointId 
                ? { ...point, photos: [...point.photos, newPhoto] }
                : point
            )
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

  const removePhotoFromIsolationPoint = (pointId: string, photoId: string) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.map(p =>
        p.id === pointId 
          ? { ...p, photos: p.photos.filter(photo => photo.id !== photoId) }
          : p
      )
    }));
  };

  const updateIsolationPhotoDescription = (pointId: string, photoId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.map(p =>
        p.id === pointId 
          ? { 
              ...p, 
              photos: p.photos.map(photo => 
                photo.id === photoId ? { ...photo, description } : photo
              ) 
            }
          : p
      )
    }));
  };

  // ========== FONCTIONS DISCUSSION ==========
  const toggleDiscussion = (discussionId: string) => {
    setFormData(prev => ({
      ...prev,
      teamDiscussion: {
        ...prev.teamDiscussion,
        discussions: prev.teamDiscussion.discussions.map(d =>
          d.id === discussionId 
            ? { 
                ...d, 
                completed: !d.completed,
                discussedAt: !d.completed ? new Date().toISOString() : undefined
              }
            : d
        )
      }
    }));
  };

  const updateDiscussionNotes = (discussionId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      teamDiscussion: {
        ...prev.teamDiscussion,
        discussions: prev.teamDiscussion.discussions.map(d =>
          d.id === discussionId ? { ...d, notes } : d
        )
      }
    }));
  };

  const updateDiscussedBy = (discussionId: string, discussedBy: string) => {
    setFormData(prev => ({
      ...prev,
      teamDiscussion: {
        ...prev.teamDiscussion,
        discussions: prev.teamDiscussion.discussions.map(d =>
          d.id === discussionId ? { ...d, discussedBy } : d
        )
      }
    }));
  };

  // ========== FONCTIONS ÉQUIPEMENTS ==========
  const toggleEquipmentRequired = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      safetyEquipment: prev.safetyEquipment.map(eq =>
        eq.id === equipmentId ? { ...eq, required: !eq.required } : eq
      )
    }));
  };

  const toggleEquipmentAvailable = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      safetyEquipment: prev.safetyEquipment.map(eq =>
        eq.id === equipmentId ? { ...eq, available: !eq.available } : eq
      )
    }));
  };

  const toggleEquipmentVerified = (equipmentId: string) => {
    setFormData(prev => ({
      ...prev,
      safetyEquipment: prev.safetyEquipment.map(eq =>
        eq.id === equipmentId ? { ...eq, verified: !eq.verified } : eq
      )
    }));
  };

  const updateEquipmentNotes = (equipmentId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      safetyEquipment: prev.safetyEquipment.map(eq =>
        eq.id === equipmentId ? { ...eq, notes } : eq
      )
    }));
  };

  // ========== FONCTIONS DANGERS AVEC COULEURS DYNAMIQUES ==========
  const toggleHazard = (hazardId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? { 
              ...h, 
              isSelected: !h.isSelected, 
              showControls: !h.isSelected ? true : false
            } 
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

  const updateControlNotes = (hazardId: string, controlId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId 
          ? {
              ...h,
              controlMeasures: h.controlMeasures.map(c =>
                c.id === controlId ? { ...c, notes } : c
              )
            }
          : h
      )
    }));
  };

  const updateHazardNotes = (hazardId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId ? { ...h, additionalNotes: notes } : h
      )
    }));
  };

  // Fonction pour vérifier si un danger a des moyens de contrôle sélectionnés
  const hasSelectedControls = (hazard: ElectricalHazard): boolean => {
    return hazard.controlMeasures.some(control => control.isSelected);
  };

  // ========== FONCTIONS PHOTOS PRINCIPALES CORRIGÉES ==========
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

  // ========== ACTIONS PRINCIPALES ==========
  const handleGeneratePDF = async () => {
    setSaveStatus('saving');
    try {
      const success = await generateProfessionalPDF(formData, tenant);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSendByEmail = async () => {
    setSaveStatus('saving');
    try {
      const success = await sendByEmail(formData, tenant, language);
      if (success) {
        setFormData(prev => ({
          ...prev,
          validation: { ...prev.validation, emailSent: true }
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleArchive = async () => {
    setSaveStatus('saving');
    try {
      const archivedData = await archiveToSupabase(formData, tenant);
      setFormData(archivedData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erreur archivage:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleFinalSubmission = async () => {
    // Vérifications avant soumission finale
    const validationErrors: string[] = [];

    if (!formData.team.allApproved && formData.team.members.length > 0) {
      validationErrors.push('Toutes les validations d\'équipe doivent être complétées');
    }

    if (formData.electricalHazards.filter(h => h.isSelected).length === 0) {
      validationErrors.push('Au moins un danger doit être identifié');
    }

    const requiredEquipment = formData.safetyEquipment.filter(eq => eq.required);
    const verifiedEquipment = requiredEquipment.filter(eq => eq.verified);
    if (verifiedEquipment.length < requiredEquipment.length) {
      validationErrors.push('Tous les équipements requis doivent être vérifiés');
    }

    // Vérifier les moyens de contrôle pour les dangers sélectionnés
    const selectedHazardsWithoutControls = formData.electricalHazards.filter(h => 
      h.isSelected && !hasSelectedControls(h)
    );
    if (selectedHazardsWithoutControls.length > 0) {
      validationErrors.push('Tous les dangers sélectionnés doivent avoir des moyens de contrôle');
    }

    if (validationErrors.length > 0) {
      alert(`Erreurs de validation:\n${validationErrors.join('\n')}`);
      return;
    }
    
    setSaveStatus('saving');
    try {
      const finalData: ASTFormData = {
        ...formData,
        status: 'completed',
        validation: {
          ...formData.validation,
          finalApproval: true,
          submissionDate: new Date().toISOString(),
          completedDate: new Date().toISOString()
        }
      };
      
      const success = await saveToSupabase(finalData);
      if (success) {
        setFormData(finalData);
        setSaveStatus('saved');
        
        // Redirection après soumission réussie
        setTimeout(() => {
          alert('AST soumise avec succès ! Redirection vers le tableau de bord...');
          // window.location.href = `/${tenant.subdomain}/dashboard`;
        }, 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Erreur soumission finale:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // ========== COMPOSANTS CHECKBOX PERSONNALISÉS ==========
  const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onChange}>
      <div className={`checkbox-premium ${checked ? 'checked' : ''}`} />
      <span style={{ color: '#e2e8f0', fontSize: '14px', flex: 1 }}>{label}</span>
    </div>
  );

  // ========== COMPOSANT CADENAS ==========
  const LockButton = ({ locked, onToggle, title }: { locked: boolean; onToggle: () => void; title: string }) => (
    <button
      onClick={onToggle}
      className="lock-button"
      title={title}
    >
      {locked ? (
        <Lock className="lock-icon locked" style={{ width: '16px', height: '16px' }} />
      ) : (
        <Unlock className="lock-icon unlocked" style={{ width: '16px', height: '16px' }} />
      )}
    </button>
  );

  // ========== GROUPEMENT D'ÉQUIPEMENTS PAR CATÉGORIE ==========
  const groupedEquipment = formData.safetyEquipment.reduce((acc, equipment) => {
    const category = equipment.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(equipment);
    return acc;
  }, {} as Record<string, SafetyEquipment[]>);

  // ========== CALCULS DE PROGRESSION ==========
  const calculateStepCompletion = (stepIndex: number): number => {
    switch (stepIndex) {
      case 0: // Général
        const basicFields = [
          formData.projectInfo.client,
          formData.projectInfo.projectNumber,
          formData.projectInfo.workLocation,
          formData.projectInfo.workDescription
        ].filter(Boolean).length;
        return (basicFields / 4) * 100;
      
      case 1: // Discussion
        const completedDiscussions = formData.teamDiscussion.discussions.filter(d => d.completed).length;
        return (completedDiscussions / formData.teamDiscussion.discussions.length) * 100;
      
      case 2: // Équipements
        const verifiedEquipment = formData.safetyEquipment.filter(eq => eq.verified).length;
        const requiredEquipment = formData.safetyEquipment.filter(eq => eq.required).length;
        return requiredEquipment > 0 ? (verifiedEquipment / requiredEquipment) * 100 : 0;
      
      case 3: // Dangers
        const selectedHazards = formData.electricalHazards.filter(h => h.isSelected).length;
        return selectedHazards > 0 ? 100 : 0;
      
      case 4: // Isolation
        return formData.isolationPoints.length > 0 ? 100 : 0;
      
      case 5: // Équipe
        const approvedMembers = formData.team.members.filter(m => m.validationStatus === 'approved').length;
        return formData.team.members.length > 0 ? (approvedMembers / formData.team.members.length) * 100 : 0;
      
      case 6: // Documentation
        return formData.documentation.photos.length > 0 ? 100 : 0;
      
      case 7: // Validation
        return formData.team.allApproved && formData.validation.finalApproval ? 100 : 0;
      
      default:
        return 0;
    }
  };

  const overallProgress = steps.reduce((acc, _, index) => acc + calculateStepCompletion(index), 0) / steps.length;

  // ========== CALCULS POUR COMPTEURS ==========
  const approvedMembersCount = formData.team.members.filter(m => m.validationStatus === 'approved').length;
  const approvalRate = formData.team.members.length > 0 ? 
    Math.round((approvedMembersCount / formData.team.members.length) * 100) : 0;

  // Le JSX return sera dans la section 5...
// =================== AST SECTION 5/5 FINALE - JSX INTERFACE COMPLÈTE ===================
// Section 5: Interface utilisateur complète avec toutes les fonctionnalités

// Continuation du return du composant principal...
return (
    <div className="form-container">
      {/* INDICATEUR DE SAUVEGARDE */}
      {saveStatus !== 'idle' && (
        <div className={`save-indicator ${saveStatus}`}>
          {saveStatus === 'saving' && (
            <>
              <Clock style={{ width: '16px', height: '16px' }} />
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
              <X style={{ width: '16px', height: '16px' }} />
              Erreur de sauvegarde
            </>
          )}
        </div>
      )}

      <div className="glass-effect">
        {/* HEADER AVEC COMPTEURS DE PERSONNES */}
        <div className="header-counters">
          <div className="company-info">
            <div className="company-logo">CP</div>
            <div>
              <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '0' }}>
                {t.title}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="counters-grid">
            <div className="counter-item">
              <span className="counter-number">{formData.projectInfo.workerCount}</span>
              <span className="counter-label">{t.counters.onJob}</span>
            </div>
            <div className="counter-item">
              <span className="counter-number">{approvedMembersCount}</span>
              <span className="counter-label">{t.counters.approved}</span>
            </div>
            <div className="counter-item approval-rate">
              <span className="counter-number">{approvalRate}%</span>
              <span className="counter-label">{t.counters.approvalRate}</span>
            </div>
          </div>
        </div>

        {/* BARRE DE PROGRESSION */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* INDICATEUR D'ÉTAPES */}
        <div className="step-indicator">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completion = calculateStepCompletion(index);
            return (
              <div
                key={index}
                className={`step-item ${currentStep === index ? 'active' : ''} ${completion === 100 ? 'completed' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <Icon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {t.steps[step.key]}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  opacity: 0.8, 
                  marginLeft: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {Math.round(completion)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* CONTENU DES ÉTAPES */}
        <div style={{ minHeight: '600px' }}>

          {/* ÉTAPE 1: Informations Générales */}
          {currentStep === 0 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  📋 {t.projectInfo.title}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* Numéro AST */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🔢 # AST
                  </label>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid #22c55e',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'Monaco, Menlo, Courier New, monospace',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#22c55e',
                        letterSpacing: '0.5px'
                      }}>
                        {formData.astNumber}
                      </div>
                    </div>
                    <button 
                      onClick={regenerateASTNumber}
                      style={{
                        background: 'none',
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>

                {/* Client */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🏢 Client *
                  </label>
                  <input 
                    type="text"
                    className="input-premium"
                    placeholder="Nom du client"
                    value={formData.projectInfo.client}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, client: e.target.value }
                    }))}
                  />
                </div>

                {/* Téléphone Client */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📞 {t.projectInfo.clientPhone}
                  </label>
                  <input 
                    type="tel"
                    className="input-premium"
                    placeholder="Ex: (514) 555-0123"
                    value={formData.projectInfo.clientPhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, clientPhone: e.target.value }
                    }))}
                  />
                </div>

                {/* Numéro de Projet */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    🔢 Numéro de Projet *
                  </label>
                  <input 
                    type="text"
                    className="input-premium"
                    placeholder="Ex: PRJ-2025-001"
                    value={formData.projectInfo.projectNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, projectNumber: e.target.value }
                    }))}
                  />
                </div>

                {/* Nom du Responsable */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    👤 {t.projectInfo.clientRepresentative}
                  </label>
                  <input 
                    type="text"
                    className="input-premium"
                    placeholder="Nom du responsable projet"
                    value={formData.projectInfo.clientRepresentative}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, clientRepresentative: e.target.value }
                    }))}
                  />
                </div>

                {/* Téléphone Responsable */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📞 {t.projectInfo.clientRepresentativePhone}
                  </label>
                  <input 
                    type="tel"
                    className="input-premium"
                    placeholder="Ex: (514) 555-0456"
                    value={formData.projectInfo.clientRepresentativePhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, clientRepresentativePhone: e.target.value }
                    }))}
                  />
                </div>

                {/* Nombre de personnes sur la job */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    👥 {t.projectInfo.workerCount} *
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    className="input-premium"
                    placeholder="Ex: 5"
                    value={formData.projectInfo.workerCount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, workerCount: parseInt(e.target.value) || 1 }
                    }))}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Ce nombre sera comparé aux approbations d'équipe
                  </small>
                </div>

                {/* Lieu des travaux */}
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📍 {t.projectInfo.workLocation}
                  </label>
                  <input 
                    type="text"
                    className="input-premium"
                    placeholder="Adresse ou description du lieu"
                    value={formData.projectInfo.workLocation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, workLocation: e.target.value }
                    }))}
                  />
                </div>

                {/* Description des travaux - Span sur toute la largeur */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    📝 {t.projectInfo.workDescription} *
                  </label>
                  <textarea 
                    className="input-premium"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    placeholder="Description détaillée des travaux à effectuer..."
                    value={formData.projectInfo.workDescription}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, workDescription: e.target.value }
                    }))}
                  />
                </div>

                {/* Section supplémentaire - Informations complémentaires */}
                <div style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
                  <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', paddingBottom: '8px' }}>
                    📋 Informations Complémentaires
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {/* Durée estimée */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        ⏱️ {t.projectInfo.estimatedDuration}
                      </label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Ex: 4 heures, 2 jours"
                        value={formData.projectInfo.estimatedDuration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, estimatedDuration: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Contact d'urgence */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🚨 {t.projectInfo.emergencyContact}
                      </label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Nom du contact d'urgence"
                        value={formData.projectInfo.emergencyContact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, emergencyContact: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Téléphone d'urgence */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📞 {t.projectInfo.emergencyPhone}
                      </label>
                      <input 
                        type="tel"
                        className="input-premium"
                        placeholder="Ex: 911, (514) 555-9999"
                        value={formData.projectInfo.emergencyPhone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, emergencyPhone: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2: Discussion avec l'Équipe */}
          {currentStep === 1 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  💬 {t.teamDiscussion.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0' }}>
                  {t.teamDiscussion.subtitle}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                {formData.teamDiscussion.discussions.map((discussion) => (
                  <div key={discussion.id} className={`discussion-item ${discussion.completed ? 'completed' : ''}`}>
                    <CustomCheckbox
                      checked={discussion.completed}
                      onChange={() => toggleDiscussion(discussion.id)}
                      label=""
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        {discussion.topic}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px', marginTop: '12px' }}>
                        <textarea
                          className="input-premium"
                          style={{ minHeight: '80px', fontSize: '13px' }}
                          placeholder="Notes de discussion..."
                          value={discussion.notes}
                          onChange={(e) => updateDiscussionNotes(discussion.id, e.target.value)}
                        />
                        
                        <input
                          type="text"
                          className="input-premium"
                          style={{ fontSize: '13px' }}
                          placeholder="Discuté par..."
                          value={discussion.discussedBy}
                          onChange={(e) => updateDiscussedBy(discussion.id, e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'rgba(100, 116, 139, 0.2)',
                      color: '#94a3b8',
                      border: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                      {discussion.completed ? t.teamDiscussion.completed : t.teamDiscussion.pending}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ÉTAPE 3: Équipements de Sécurité */}
          {currentStep === 2 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  🛡️ {t.safetyEquipment.title}
                </h2>
              </div>

              {Object.entries(groupedEquipment).map(([category, equipment]) => (
                <div key={category} style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    color: '#3b82f6', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
                    paddingBottom: '8px'
                  }}>
                    {t.safetyEquipment.categories[category as keyof typeof t.safetyEquipment.categories]}
                  </h3>
                  
                  <div className="equipment-grid">
                    {equipment.map((item) => (
                      <div key={item.id} className={`equipment-item ${item.required ? 'required' : ''} ${item.verified ? 'verified' : ''}`}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0' }}>
                            {item.name}
                          </h4>
                          
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <CustomCheckbox
                              checked={item.required}
                              onChange={() => toggleEquipmentRequired(item.id)}
                              label={t.safetyEquipment.required}
                            />
                            <CustomCheckbox
                              checked={item.available}
                              onChange={() => toggleEquipmentAvailable(item.id)}
                              label={t.safetyEquipment.available}
                            />
                            <CustomCheckbox
                              checked={item.verified}
                              onChange={() => toggleEquipmentVerified(item.id)}
                              label={t.safetyEquipment.verified}
                            />
                          </div>
                          
                          <input
                            type="text"
                            className="input-premium"
                            style={{ fontSize: '12px' }}
                            placeholder={t.safetyEquipment.notes}
                            value={item.notes}
                            onChange={(e) => updateEquipmentNotes(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ÉTAPE 4: Dangers et Risques */}
          {currentStep === 3 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  ⚠️ {t.hazards.title}
                </h2>
              </div>

              <div className="hazard-grid">
                {formData.electricalHazards.map((hazard) => {
                  const hasControls = hasSelectedControls(hazard);
                  const showControlsRequired = hazard.isSelected && !hasControls;
                  const showControlsVigilance = hazard.isSelected && hasControls;
                  
                  return (
                    <div 
                      key={hazard.id} 
                      className={`hazard-item ${hazard.riskLevel} ${hazard.isSelected ? (hasControls ? 'selected has-controls' : 'selected no-controls') : ''}`}
                      onClick={() => toggleHazard(hazard.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <CustomCheckbox
                          checked={hazard.isSelected}
                          onChange={() => {}}
                          label=""
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0' }}>
                            {hazard.code} - {hazard.title}
                          </h4>
                          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                            {hazard.description}
                          </p>
                        </div>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: hazard.riskLevel === 'critical' ? 'rgba(220, 38, 38, 0.2)' :
                                     hazard.riskLevel === 'high' ? 'rgba(245, 158, 11, 0.2)' :
                                     hazard.riskLevel === 'medium' ? 'rgba(234, 179, 8, 0.2)' :
                                     'rgba(34, 197, 94, 0.2)',
                          color: hazard.riskLevel === 'critical' ? '#dc2626' :
                                 hazard.riskLevel === 'high' ? '#f59e0b' :
                                 hazard.riskLevel === 'medium' ? '#eab308' :
                                 '#22c55e'
                        }}>
                          {t.hazards.levels[hazard.riskLevel]}
                        </div>
                      </div>

                      {/* Statut des moyens de contrôle */}
                      {showControlsRequired && (
                        <div className="hazard-controls-required">
                          {t.hazards.controlsRequired}
                        </div>
                      )}
                      
                      {showControlsVigilance && (
                        <div className="hazard-controls-vigilance">
                          {t.hazards.controlsInPlace}
                        </div>
                      )}

                      {/* Moyens de contrôle */}
                      {hazard.isSelected && hazard.showControls && (
                        <div className="control-measures-section" onClick={(e) => e.stopPropagation()}>
                          <h5 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
                            {t.hazards.controlMeasures}
                          </h5>
                          
                          {hazard.controlMeasures.map((control) => (
                            <div key={control.id} className="control-measure-item">
                              <CustomCheckbox
                                checked={control.isSelected}
                                onChange={() => toggleControlMeasure(hazard.id, control.id)}
                                label=""
                              />
                              <div style={{ flex: 1 }}>
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                                  {control.name}
                                </span>
                                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0' }}>
                                  {control.description}
                                </p>
                                {control.isSelected && (
                                  <input
                                    type="text"
                                    className="input-premium"
                                    style={{ fontSize: '12px', marginTop: '6px' }}
                                    placeholder="Notes spécifiques..."
                                    value={control.notes}
                                    onChange={(e) => updateControlNotes(hazard.id, control.id, e.target.value)}
                                  />
                                )}
                              </div>
                              <div style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '600',
                                background: 'rgba(100, 116, 139, 0.2)',
                                color: '#94a3b8'
                              }}>
                                {t.hazards.categories[control.category]}
                              </div>
                            </div>
                          ))}
                          
                          <textarea
                            className="input-premium"
                            style={{ fontSize: '12px', marginTop: '12px', minHeight: '60px' }}
                            placeholder="Notes supplémentaires pour ce danger..."
                            value={hazard.additionalNotes || ''}
                            onChange={(e) => updateHazardNotes(hazard.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 5: Points d'Isolement */}
          {currentStep === 4 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  ⚙️ {t.isolation.title}
                </h2>
              </div>

              {/* Formulaire d'ajout */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  {t.isolation.addPoint}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                      {t.isolation.pointName}
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="Nom du point d'isolement"
                      value={newIsolationPoint.name || ''}
                      onChange={(e) => setNewIsolationPoint(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                      {t.isolation.isolationType}
                    </label>
                    <select
                      className="input-premium"
                      value={newIsolationPoint.type || ''}
                      onChange={(e) => setNewIsolationPoint(prev => ({ ...prev, type: e.target.value as IsolationPoint['type'] }))}
                    >
                      <option value="">{t.isolation.selectType}</option>
                      <option value="electrical">Électrique</option>
                      <option value="mechanical">Mécanique</option>
                      <option value="pneumatic">Pneumatique</option>
                      <option value="hydraulic">Hydraulique</option>
                      <option value="chemical">Chimique</option>
                      <option value="thermal">Thermique</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={addIsolationPoint}
                    className="btn-premium"
                    disabled={!newIsolationPoint.name?.trim() || !newIsolationPoint.type}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    {t.buttons.add}
                  </button>
                </div>
              </div>

              {/* Liste des points d'isolement */}
              {formData.isolationPoints.length > 0 ? (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {formData.isolationPoints.map((point) => (
                    <div key={point.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0' }}>
                          {point.name} ({point.type})
                        </h4>
                        <button
                          onClick={() => removeIsolationPoint(point.id)}
                          className="btn-danger"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>

                      {/* Checklist simplifiée (sans Cadenas Relevé) */}
                      <div className="isolation-checklist">
                        <div 
                          className={`checklist-item ${point.checklist.cadenasAppose ? 'completed' : ''}`}
                          onClick={() => updateIsolationChecklist(point.id, 'cadenasAppose')}
                        >
                          <div className={`checkbox-premium ${point.checklist.cadenasAppose ? 'checked' : ''}`} />
                          <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
                            {t.isolation.checklist.cadenasAppose}
                          </span>
                        </div>
                        
                        <div 
                          className={`checklist-item ${point.checklist.absenceTension ? 'completed' : ''}`}
                          onClick={() => updateIsolationChecklist(point.id, 'absenceTension')}
                        >
                          <div className={`checkbox-premium ${point.checklist.absenceTension ? 'checked' : ''}`} />
                          <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
                            {t.isolation.checklist.absenceTension}
                          </span>
                        </div>
                        
                        <div 
                          className={`checklist-item ${point.checklist.miseALaTerre ? 'completed' : ''}`}
                          onClick={() => updateIsolationChecklist(point.id, 'miseALaTerre')}
                        >
                          <div className={`checkbox-premium ${point.checklist.miseALaTerre ? 'checked' : ''}`} />
                          <span style={{ color: '#e2e8f0', fontSize: '14px' }}>
                            {t.isolation.checklist.miseALaTerre}
                          </span>
                        </div>
                      </div>

                      {/* Photos pour ce point d'isolement */}
                      <PhotoCarousel
                        photos={point.photos}
                        onAddPhoto={(file) => addPhotoToIsolationPoint(point.id, file)}
                        onRemovePhoto={(photoId) => removePhotoFromIsolationPoint(point.id, photoId)}
                        onUpdateDescription={(photoId, description) => updateIsolationPhotoDescription(point.id, photoId, description)}
                      />
                    </div>
                  ))}
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
                  <Settings style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px', margin: '0' }}>{t.isolation.noPoints}</p>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 6: Équipe de Travail */}
          {currentStep === 5 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  👥 {t.team.title}
                </h2>
              </div>

              {/* Formulaire d'ajout de membre */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  {t.team.addMember}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                  <input
                    type="text"
                    className="input-premium"
                    placeholder={t.team.memberName}
                    value={newTeamMember.name || ''}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="input-premium"
                    placeholder={t.team.employeeId}
                    value={newTeamMember.employeeId || ''}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, employeeId: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="input-premium"
                    placeholder={t.team.department}
                    value={newTeamMember.department || ''}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, department: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="input-premium"
                    placeholder={t.team.qualification}
                    value={newTeamMember.qualification || ''}
                    onChange={(e) => setNewTeamMember(prev => ({ ...prev, qualification: e.target.value }))}
                  />
                  <button
                    onClick={addTeamMember}
                    className="btn-premium"
                    disabled={!newTeamMember.name?.trim()}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    {t.buttons.add}
                  </button>
                </div>
              </div>

              {/* Tableau d'approbation équipe */}
              {formData.team.members.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="approval-table">
                    <thead>
                      <tr>
                        <th>NOM DU TRAVAILLEUR</th>
                        <th>DÉPARTEMENT</th>
                        <th>{t.team.consultationAst}</th>
                        <th>{t.team.cadenasAppose}</th>
                        <th>{t.team.status}</th>
                        <th>{t.team.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.team.members.map((member) => (
                        <tr key={member.id}>
                          <td className="worker-name-cell">
                            <div>
                              <strong>{member.name}</strong>
                              <br />
                              <small style={{ opacity: 0.7 }}>{member.employeeId}</small>
                            </div>
                          </td>
                          <td>{member.department}</td>
                          <td>
                            <LockButton
                              locked={member.consultationAst}
                              onToggle={() => toggleConsultationAst(member.id)}
                              title={member.consultationAst ? 'Consultation AST effectuée' : 'Consultation AST non effectuée'}
                            />
                          </td>
                          <td>
                            <LockButton
                              locked={member.cadenasAppose}
                              onToggle={() => toggleCadenasAppose(member.id)}
                              title={member.cadenasAppose ? 'Cadenas apposé' : 'Cadenas non apposé'}
                            />
                          </td>
                          <td>
                            <span className={`status-${member.validationStatus}`}>
                              {member.validationStatus === 'approved' ? t.team.approved :
                               member.validationStatus === 'rejected' ? t.team.rejected :
                               t.team.pending}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => validateTeamMember(member.id, true)}
                                className="btn-success"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                disabled={member.validationStatus === 'approved'}
                              >
                                {t.buttons.approve}
                              </button>
                              <button
                                onClick={() => validateTeamMember(member.id, false)}
                                className="btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                disabled={member.validationStatus === 'rejected'}
                              >
                                {t.buttons.reject}
                              </button>
                              <button
                                onClick={() => removeTeamMember(member.id)}
                                className="btn-secondary"
                                style={{ padding: '4px', fontSize: '11px' }}
                              >
                                <Trash2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '16px', margin: '0' }}>Aucun membre d'équipe ajouté</p>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 7: Photos & Documentation */}
          {currentStep === 6 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  📸 {t.steps.documentation}
                </h2>
              </div>

              <PhotoCarousel
                photos={formData.documentation.photos}
                onAddPhoto={addPhoto}
                onRemovePhoto={removePhoto}
                onUpdateDescription={updatePhotoDescription}
              />

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  📝 Notes d'inspection
                </h3>
                <textarea
                  className="input-premium"
                  style={{ minHeight: '120px', marginBottom: '16px' }}
                  placeholder="Notes d'inspection, observations, points à retenir..."
                  value={formData.documentation.inspectionNotes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentation: { ...prev.documentation, inspectionNotes: e.target.value }
                  }))}
                />

                <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  🔧 Actions correctives
                </h3>
                <textarea
                  className="input-premium"
                  style={{ minHeight: '120px' }}
                  placeholder="Actions correctives à entreprendre, améliorations suggérées..."
                  value={formData.documentation.correctiveActions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentation: { ...prev.documentation, correctiveActions: e.target.value }
                  }))}
                />
              </div>
            </div>
          )}

          {/* ÉTAPE 8: Validation & Signatures */}
          {currentStep === 7 && (
            <div className="slide-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  ✅ {t.steps.validation}
                </h2>
              </div>

              {/* Résumé de l'AST */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                  📊 Résumé de l'AST
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                      {formData.electricalHazards.filter(h => h.isSelected).length}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dangers Identifiés</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
                      {formData.team.members.length}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Membres d'Équipe</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#a855f7' }}>
                      {approvedMembersCount}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Approbations</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                      {formData.documentation.photos.length}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Photos</div>
                  </div>
                </div>
              </div>

              {/* Actions finales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <button
                  onClick={() => handleSave(false)}
                  className="btn-premium"
                  disabled={saveStatus === 'saving'}
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  {t.buttons.save}
                </button>
                
                <button
                  onClick={handleGeneratePDF}
                  className="btn-secondary"
                  disabled={saveStatus === 'saving'}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  {t.actions.generatePDF}
                </button>
                
                <button
                  onClick={handleSendByEmail}
                  className="btn-secondary"
                  disabled={saveStatus === 'saving'}
                >
                  <Send style={{ width: '16px', height: '16px' }} />
                  {t.actions.sendByEmail}
                </button>
                
                <button
                  onClick={handleArchive}
                  className="btn-secondary"
                  disabled={saveStatus === 'saving'}
                >
                  <Archive style={{ width: '16px', height: '16px' }} />
                  {t.actions.archive}
                </button>
              </div>

              {/* Soumission finale */}
              <div style={{
                background: formData.team.allApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${formData.team.allApproved ? '#22c55e' : '#ef4444'}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  color: formData.team.allApproved ? '#22c55e' : '#ef4444', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  margin: '0 0 16px 0' 
                }}>
                  {formData.team.allApproved ? '✅ Prêt pour soumission finale' : '⚠️ Validation requise'}
                </h3>
                
                {!formData.team.allApproved && formData.team.members.length > 0 && (
                  <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>
                    Toutes les validations d'équipe doivent être complétées avant la soumission finale.
                  </p>
                )}

                <button
                  onClick={handleFinalSubmission}
                  className={formData.team.allApproved ? 'btn-success' : 'btn-secondary'}
                  disabled={!formData.team.allApproved || saveStatus === 'saving'}
                  style={{ fontSize: '16px', padding: '16px 32px' }}
                >
                  <CheckCircle style={{ width: '20px', height: '20px' }} />
                  {t.actions.finalApproval}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(100, 116, 139, 0.3)' }}>
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className="btn-secondary"
            disabled={currentStep === 0}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            {t.buttons.previous}
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleSave(true)}
              className="btn-secondary"
              disabled={saveStatus === 'saving'}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {t.buttons.save}
            </button>
            
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="btn-secondary"
            >
              {language === 'fr' ? '🇺🇸 EN' : '🇫🇷 FR'}
            </button>
          </div>
          
          <button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            className="btn-premium"
            disabled={currentStep === steps.length - 1}
          >
            {t.buttons.next}
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
