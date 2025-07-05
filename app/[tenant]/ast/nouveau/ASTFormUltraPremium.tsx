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
// =================== AST SECTION 2/5 - MOYENS DE CONTRÔLE CNESST & DONNÉES ===================
// Section 2: Moyens de contrôle réels selon CNESST/CSA Z462 et données professionnelles

// =================== HIÉRARCHIE DES MOYENS DE CONTRÔLE SELON CNESST ===================
// 1. ÉLIMINATION (le plus efficace)
// 2. SUBSTITUTION 
// 3. MESURES D'INGÉNIERIE
// 4. MESURES ADMINISTRATIVES
// 5. ÉQUIPEMENT DE PROTECTION INDIVIDUELLE (le moins efficace)

// =================== MOYENS DE CONTRÔLE PROFESSIONNELS PAR RISQUE ===================
const professionalControlMeasures: Record<string, ControlMeasure[]> = {
  // Électrocution - CSA Z462 conforme
  'ELEC-001': [
    // ÉLIMINATION
    { id: 'elec-001-elim-1', name: 'Mise hors tension complète', description: 'Couper complètement l\'alimentation électrique et vérifier l\'absence de tension', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-elim-2', name: 'Travail différé', description: 'Reporter les travaux pour permettre une mise hors tension sécuritaire', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'elec-001-sub-1', name: 'Outils isolés certifiés', description: 'Utiliser des outils isolés 1000V certifiés CSA/IEC', category: 'substitution', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-sub-2', name: 'Équipement basse tension', description: 'Remplacer par des équipements fonctionnant à tension réduite (<50V)', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'elec-001-eng-1', name: 'Consignation LOTO complète', description: 'Lockout/Tagout selon CSA Z460 avec cadenas personnels', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-eng-2', name: 'Vérification absence tension (VAT)', description: 'Utiliser VAT certifié et testé selon CSA Z462', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-eng-3', name: 'Mise à la terre temporaire', description: 'Installer équipotentialité et mise à la terre de sécurité', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-eng-4', name: 'Barrières de protection', description: 'Installer barrières physiques autour des zones sous tension', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'elec-001-adm-1', name: 'Formation CSA Z462', description: 'Formation électrique qualifiée selon standard canadien', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-adm-2', name: 'Permis travail électrique', description: 'Émission permis travail énergisé avec analyse risques', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-adm-3', name: 'Surveillance constante', description: 'Présence surveillant électrique qualifié en permanence', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'elec-001-epi-1', name: 'Gants isolants classe appropriée', description: 'Gants isolants testés selon tension de travail', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-epi-2', name: 'Chaussures isolantes CSA', description: 'Chaussures électriques certifiées CSA', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'elec-001-epi-3', name: 'Casque classe E', description: 'Casque de sécurité classe électrique', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // Arc électrique - CSA Z462 2024
  'ELEC-002': [
    // ÉLIMINATION
    { id: 'elec-002-elim-1', name: 'Mise hors tension systématique', description: 'Éliminer complètement le risque d\'arc par mise hors tension', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'elec-002-sub-1', name: 'Équipement télécommandé', description: 'Utiliser perches isolantes et commandes à distance', category: 'substitution', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-sub-2', name: 'Technologie sans arc', description: 'Remplacer par équipements à coupure sous vide ou SF6', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'elec-002-eng-1', name: 'Calcul énergie incidente', description: 'Analyse arc flash selon IEEE 1584 et CSA Z462', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-eng-2', name: 'Réduction courant défaut', description: 'Installer limiteurs de courant et protections rapides', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-eng-3', name: 'Distance de sécurité', description: 'Maintenir distance minimale selon calcul arc flash', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-eng-4', name: 'Blindage arc flash', description: 'Installer écrans et blindages anti-arc', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'elec-002-adm-1', name: 'Étiquetage arc flash', description: 'Affichage énergie incidente et PPE requis', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-adm-2', name: 'Procédures spécifiques', description: 'Modes opératoires détaillés pour chaque équipement', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'elec-002-epi-1', name: 'Vêtements arc flash certifiés', description: 'Habits résistants arc selon catégorie PPE calculée', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-epi-2', name: 'Casque arc flash', description: 'Casque avec écran facial arc flash intégré', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'elec-002-epi-3', name: 'Gants cuir par-dessus isolants', description: 'Gants cuir de protection pour les gants isolants', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // Chute de hauteur - Réglementation québécoise
  'FALL-001': [
    // ÉLIMINATION
    { id: 'fall-001-elim-1', name: 'Travail au sol', description: 'Modifier méthode pour effectuer travail au niveau du sol', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-elim-2', name: 'Préfabrication au sol', description: 'Assembler les composants au sol avant installation', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'fall-001-sub-1', name: 'Plateforme élévatrice', description: 'Utiliser nacelle ou plateforme sécurisée au lieu d\'échelle', category: 'substitution', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-sub-2', name: 'Échafaudage sécurisé', description: 'Monter échafaudage conforme avec garde-corps', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'fall-001-eng-1', name: 'Garde-corps permanents', description: 'Installer garde-corps 1070mm avec lisse intermédiaire', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-eng-2', name: 'Filets de sécurité', description: 'Installer filets certifiés sous zone de travail', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-eng-3', name: 'Points d\'ancrage certifiés', description: 'Installer ancrages 22,2 kN certifiés CSA Z259', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'fall-001-adm-1', name: 'Formation travail en hauteur', description: 'Formation protection contre chutes CNESST', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-adm-2', name: 'Plan de sauvetage', description: 'Procédure secours en cas de chute avec suspension', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-adm-3', name: 'Inspection quotidienne', description: 'Vérification EPI et équipements avant utilisation', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'fall-001-epi-1', name: 'Harnais complet CSA Z259', description: 'Harnais dorsal et sternal certifié', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-epi-2', name: 'Longe avec absorbeur', description: 'Cordon rétractable ou absorbeur d\'énergie', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'fall-001-epi-3', name: 'Casque mentonnière', description: 'Casque avec jugulaire pour éviter perte', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // Happement mécanique
  'MECH-001': [
    // ÉLIMINATION
    { id: 'mech-001-elim-1', name: 'Arrêt machine complet', description: 'Stopper complètement machine avant intervention', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'mech-001-sub-1', name: 'Outils à distance', description: 'Utiliser outils prolongateurs pour éviter proximité', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'mech-001-eng-1', name: 'Protecteurs de machine', description: 'Installer garde de sécurité avec verrouillage', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'mech-001-eng-2', name: 'Consignation mécanique', description: 'LOTO complet avec blocage mécanique', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'mech-001-eng-3', name: 'Détecteurs de présence', description: 'Capteurs laser ou rideaux lumineux', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'mech-001-eng-4', name: 'Arrêts d\'urgence', description: 'Boutons coup de poing accessibles', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'mech-001-adm-1', name: 'Formation sécurité machine', description: 'Formation spécifique aux dangers mécaniques', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'mech-001-adm-2', name: 'Procédures LOTO', description: 'Méthodes de cadenassage documentées', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'mech-001-epi-1', name: 'Gants résistants coupures', description: 'Gants niveau 3-5 selon ISO 13997', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'mech-001-epi-2', name: 'Vêtements ajustés', description: 'Éviter vêtements amples près machines', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // Espace clos - Réglementation CNESST
  'SPACE-001': [
    // ÉLIMINATION
    { id: 'space-001-elim-1', name: 'Travail extérieur', description: 'Modifier processus pour éviter entrée espace clos', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'space-001-sub-1', name: 'Télécommande/robotique', description: 'Utiliser équipement télécommandé ou robots', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'space-001-eng-1', name: 'Ventilation mécanique', description: 'Ventilation forcée continue avec débit calculé', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-eng-2', name: 'Ouvertures multiples', description: 'Créer entrées/sorties supplémentaires sécurisées', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-eng-3', name: 'Systèmes de communication', description: 'Radio bidirectionnelle continue avec extérieur', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'space-001-adm-1', name: 'Permis espace clos', description: 'Autorisation écrite avec analyses atmosphère', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-adm-2', name: 'Surveillant formé', description: 'Surveillant qualifié en permanence à l\'extérieur', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-adm-3', name: 'Plan de sauvetage', description: 'Équipe secours formée avec équipement', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-adm-4', name: 'Tests atmosphère continus', description: 'Monitoring O2, LIE, H2S, CO en continu', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'space-001-epi-1', name: 'Appareil respiratoire', description: 'ARI ou adduction d\'air selon analyse', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-epi-2', name: 'Harnais de récupération', description: 'Harnais avec point dorsal pour extraction', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'space-001-epi-3', name: 'Détecteur de gaz portable', description: 'Détecteur 4 gaz porté en permanence', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ],

  // Moyens de contrôle génériques (pour autres risques)
  'default': [
    // ÉLIMINATION
    { id: 'def-elim-1', name: 'Suppression du danger', description: 'Éliminer complètement la source du risque', category: 'elimination', isSelected: false, photos: [], notes: '' },
    { id: 'def-elim-2', name: 'Modification du processus', description: 'Changer la méthode de travail pour éviter le risque', category: 'elimination', isSelected: false, photos: [], notes: '' },
    
    // SUBSTITUTION
    { id: 'def-sub-1', name: 'Remplacement sécuritaire', description: 'Substituer par solution moins dangereuse', category: 'substitution', isSelected: false, photos: [], notes: '' },
    { id: 'def-sub-2', name: 'Matériaux alternatifs', description: 'Utiliser substances ou équipements plus sûrs', category: 'substitution', isSelected: false, photos: [], notes: '' },
    
    // INGÉNIERIE
    { id: 'def-eng-1', name: 'Protections collectives', description: 'Installer dispositifs de protection groupe', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'def-eng-2', name: 'Isolement/confinement', description: 'Séparer physiquement danger et travailleurs', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'def-eng-3', name: 'Ventilation adéquate', description: 'Système ventilation pour évacuer contaminants', category: 'engineering', isSelected: false, photos: [], notes: '' },
    { id: 'def-eng-4', name: 'Automatisation', description: 'Mécaniser tâches dangereuses', category: 'engineering', isSelected: false, photos: [], notes: '' },
    
    // ADMINISTRATIF
    { id: 'def-adm-1', name: 'Formation spécialisée', description: 'Formation adaptée aux risques spécifiques', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def-adm-2', name: 'Procédures sécuritaires', description: 'Modes opératoires normalisés documentés', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def-adm-3', name: 'Supervision renforcée', description: 'Surveillance par personne compétente', category: 'administrative', isSelected: false, photos: [], notes: '' },
    { id: 'def-adm-4', name: 'Rotation des tâches', description: 'Limiter temps exposition individuelle', category: 'administrative', isSelected: false, photos: [], notes: '' },
    
    // EPI
    { id: 'def-epi-1', name: 'EPI adapté au risque', description: 'Équipement protection selon danger identifié', category: 'ppe', isSelected: false, photos: [], notes: '' },
    { id: 'def-epi-2', name: 'Entretien EPI', description: 'Maintenance et remplacement selon programme', category: 'ppe', isSelected: false, photos: [], notes: '' }
  ]
};

// =================== DANGERS ACTUALISÉS AVEC VRAIS CONTRÔLES ===================
const updatedElectricalHazards: ElectricalHazard[] = [
  // Dangers électriques critiques
  { id: 'ELEC-001', code: 'ELEC-001', title: 'Électrocution', description: 'Contact direct ou indirect avec pièces sous tension pouvant causer arrêt cardiaque', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['ELEC-001'], showControls: false },
  { id: 'ELEC-002', code: 'ELEC-002', title: 'Arc électrique', description: 'Dégagement d\'énergie causant brûlures graves et explosion', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['ELEC-002'], showControls: false },
  
  // Dangers de chute - Tolérance zéro CNESST
  { id: 'FALL-001', code: 'FALL-001', title: 'Chute de hauteur', description: 'Chute depuis surface élevée >3m ou près ouverture', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['FALL-001'], showControls: false },
  { id: 'FALL-002', code: 'FALL-002', title: 'Chute de plain-pied', description: 'Glissade/trébuchement sur surface niveau', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'FALL-003', code: 'FALL-003', title: 'Chute d\'objets', description: 'Objets tombant et frappant personnes en bas', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers mécaniques
  { id: 'MECH-001', code: 'MECH-001', title: 'Happement/entraînement', description: 'Capture par pièces mobiles machines/équipements', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['MECH-001'], showControls: false },
  { id: 'MECH-002', code: 'MECH-002', title: 'Coupure/lacération', description: 'Blessures par surfaces/objets tranchants', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'MECH-003', code: 'MECH-003', title: 'Écrasement', description: 'Compression par objets lourds/équipements', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers incendie/explosion
  { id: 'FIRE-001', code: 'FIRE-001', title: 'Incendie', description: 'Combustion matières inflammables', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'FIRE-002', code: 'FIRE-002', title: 'Explosion', description: 'Déflagration gaz/vapeurs/poussières', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers chimiques
  { id: 'CHEM-001', code: 'CHEM-001', title: 'Exposition substances toxiques', description: 'Contact cutané/ingestion/inhalation produits chimiques', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'CHEM-002', code: 'CHEM-002', title: 'Inhalation vapeurs nocives', description: 'Respiration contaminants atmosphériques', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers physiques
  { id: 'NOISE-001', code: 'NOISE-001', title: 'Exposition bruit excessif', description: 'Niveau sonore >85 dBA causant surdité', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'TEMP-001', code: 'TEMP-001', title: 'Stress thermique', description: 'Exposition chaleur excessive >WBGT', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'TEMP-002', code: 'TEMP-002', title: 'Hypothermie', description: 'Exposition froid extrême <-10°C', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'VIB-001', code: 'VIB-001', title: 'Vibrations main-bras', description: 'Exposition vibrations >2,5 m/s² sur 8h', riskLevel: 'low', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  { id: 'RAD-001', code: 'RAD-001', title: 'Radiations ionisantes', description: 'Exposition rayonnements nucléaires', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers biologiques
  { id: 'BIO-001', code: 'BIO-001', title: 'Agents biologiques', description: 'Exposition microorganismes pathogènes', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers ergonomiques
  { id: 'ERGO-001', code: 'ERGO-001', title: 'Troubles musculo-squelettiques', description: 'Lésions par mouvements répétitifs/manutention', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers d'espace clos - Tolérance zéro
  { id: 'SPACE-001', code: 'SPACE-001', title: 'Espace clos', description: 'Travail espace confiné avec risques atmosphériques', riskLevel: 'critical', isSelected: false, controlMeasures: professionalControlMeasures['SPACE-001'], showControls: false },
  
  // Dangers circulation/véhicules
  { id: 'VEH-001', code: 'VEH-001', title: 'Collision véhicules', description: 'Accident avec équipements mobiles/véhicules', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers manutention
  { id: 'LIFT-001', code: 'LIFT-001', title: 'Manutention manuelle', description: 'Soulèvement >23kg ou postures contraignantes', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers équipements
  { id: 'EQUIP-001', code: 'EQUIP-001', title: 'Défaillance équipement', description: 'Panne équipement critique ou surpression', riskLevel: 'high', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers environnementaux
  { id: 'ENV-001', code: 'ENV-001', title: 'Conditions météo dangereuses', description: 'Intempéries compromettant sécurité travail', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Dangers psychosociaux
  { id: 'PSY-001', code: 'PSY-001', title: 'Stress/fatigue excessive', description: 'Épuisement affectant vigilance sécuritaire', riskLevel: 'low', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false },
  
  // Autres dangers spécifiques
  { id: 'OTHER-001', code: 'OTHER-001', title: 'Dangers spécifiques au site', description: 'Risques particuliers identifiés sur site', riskLevel: 'medium', isSelected: false, controlMeasures: professionalControlMeasures['default'], showControls: false }
];

// =================== ÉQUIPEMENTS SÉCURITÉ CERTIFIÉS ===================
const professionalSafetyEquipment: SafetyEquipment[] = [
  // Protection tête - CSA Z94.1
  { id: 'head-001', name: 'Casque CSA Type 1 Classe E', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-002', name: 'Casque escalade CSA Z259.1', required: false, available: false, verified: false, notes: '', category: 'head' },
  { id: 'head-003', name: 'Casque arc flash avec écran', required: false, available: false, verified: false, notes: '', category: 'head' },
  
  // Protection yeux/visage - CSA Z94.3
  { id: 'eye-001', name: 'Lunettes CSA Z94.3 impact', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-002', name: 'Écran facial polycarbonate', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-003', name: 'Lunettes soudage teinte variable', required: false, available: false, verified: false, notes: '', category: 'eye' },
  { id: 'eye-004', name: 'Lunettes chimiques étanches', required: false, available: false, verified: false, notes: '', category: 'eye' },
  
  // Protection respiratoire - CSA Z94.4
  { id: 'resp-001', name: 'Masque N95 certifié NIOSH', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-002', name: 'ARI 30min certifié CSA', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-003', name: 'Demi-masque P100 + cartouches', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  { id: 'resp-004', name: 'Masque complet adduction air', required: false, available: false, verified: false, notes: '', category: 'respiratory' },
  
  // Protection mains - ASTM/EN
  { id: 'hand-001', name: 'Gants isolants Classe 0 (1kV)', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-002', name: 'Gants isolants Classe 1 (7.5kV)', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-003', name: 'Gants anti-coupure niveau 5', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-004', name: 'Gants chimiques nitrile', required: false, available: false, verified: false, notes: '', category: 'hand' },
  { id: 'hand-005', name: 'Gants cuir protection isolants', required: false, available: false, verified: false, notes: '', category: 'hand' },
  
  // Protection pieds - CSA Z195
  { id: 'foot-001', name: 'Bottes CSA électriques EH', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-002', name: 'Chaussures CSA Vert/Triangle', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-003', name: 'Couvre-chaussures isolants', required: false, available: false, verified: false, notes: '', category: 'foot' },
  { id: 'foot-004', name: 'Bottes chimiques Viton', required: false, available: false, verified: false, notes: '', category: 'foot' },
  
  // Protection corps - ASTM F1506
  { id: 'body-001', name: 'Vêtements arc flash Cat 2 (8 cal/cm²)', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-002', name: 'Vêtements arc flash Cat 4 (40 cal/cm²)', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-003', name: 'Veste haute visibilité Classe 2', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-004', name: 'Combinaison Tyvek QC', required: false, available: false, verified: false, notes: '', category: 'body' },
  { id: 'body-005', name: 'Tablier soudeur cuir', required: false, available: false, verified: false, notes: '', category: 'body' },
  
  // Protection chute - CSA Z259
  { id: 'fall-001', name: 'Harnais CSA Z259.10 Classe A', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-002', name: 'Longe avec absorbeur 1.8m', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-003', name: 'Antichute rétractable 3m', required: false, available: false, verified: false, notes: '', category: 'fall' },
  { id: 'fall-004', name: 'Point ancrage temporaire', required: false, available: false, verified: false, notes: '', category: 'fall' },
  
  // Protection électrique spécialisée
  { id: 'elec-001', name: 'Tapis isolant Classe 2', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-002', name: 'Perche isolante 1m testée', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-003', name: 'VAT Fluke T6-1000 certifié', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-004', name: 'Cadenas consignation rouge', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  { id: 'elec-005', name: 'Étiquettes LOTO personnalisées', required: false, available: false, verified: false, notes: '', category: 'electrical' },
  
  // Détection atmosphère
  { id: 'detect-001', name: 'Détecteur 4 gaz BW Honeywell', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-002', name: 'Détecteur O2 portable calibré', required: false, available: false, verified: false, notes: '', category: 'detection' },
  { id: 'detect-003', name: 'Détecteur LIE/H2S portable', required: false, available: false, verified: false, notes: '', category: 'detection' },
  
  // Équipements urgence/secours
  { id: 'other-001', name: 'Trousse premiers soins CSA', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-002', name: 'Douche oculaire portable', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-003', name: 'Radio bidirectionnelle', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-004', name: 'Éclairage LED explosion-proof', required: false, available: false, verified: false, notes: '', category: 'other' },
  { id: 'other-005', name: 'Extincteur CO2 5 lbs', required: false, available: false, verified: false, notes: '', category: 'other' }
];

// =================== DISCUSSIONS ÉQUIPE PROFESSIONNELLES ===================
const professionalDiscussions: TeamDiscussion[] = [
  { id: 'disc-001', topic: 'Identification dangers tolérance zéro', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'disc-002', topic: 'Procédures LOTO spécifiques site', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'disc-003', topic: 'EPI obligatoires et vérifications', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'disc-004', topic: 'Permis de travail requis', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-005', topic: 'Plans d\'urgence et évacuation', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'disc-006', topic: 'Communications sécuritaires', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-007', topic: 'Surveillance et supervision', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'disc-008', topic: 'Signalement incidents/presqu\'accidents', notes: '', completed: false, discussedBy: '', priority: 'medium' }
];

// =================== PROCÉDURES URGENCE RÉGLEMENTAIRES ===================
const regulatoryEmergencyProcedures: EmergencyProcedure[] = [
  { id: 'emerg-001', type: 'medical', procedure: 'Composer 911 - Premiers soins certifiés - Évacuation médicale', responsiblePerson: 'Secouriste certifié CNESST', contactInfo: '911 + Contact interne urgence', isVerified: false },
  { id: 'emerg-002', type: 'fire', procedure: 'Alarme incendie - Évacuation totale - Point rassemblement', responsiblePerson: 'Responsable évacuation', contactInfo: 'Service incendie municipal', isVerified: false },
  { id: 'emerg-003', type: 'electrical', procedure: 'Coupure urgence secteur - Consignation - VAT - Secours électrique', responsiblePerson: 'Électricien qualifié CSA Z462', contactInfo: 'Hydro-Québec + Électricien', isVerified: false },
  { id: 'emerg-004', type: 'evacuation', procedure: 'Signal évacuation - Routes primaires/secondaires - Décompte personnel', responsiblePerson: 'Coordonnateur urgence', contactInfo: 'Poste commandement', isVerified: false },
  { id: 'emerg-005', type: 'spill', procedure: 'Confinement déversement - Ventilation - Évacuation zone - Équipe HAZMAT', responsiblePerson: 'Responsable matières dangereuses', contactInfo: 'URGENCE-ENVIRONNEMENT', isVerified: false }
];
// =================== AST SECTION 3/5 - OPTIMISATION MOBILE & BRANDING C-SECUR360 ===================
// Section 3: Traductions professionnelles, CSS mobile et branding premium

// =================== TRADUCTIONS PROFESSIONNELLES MISES À JOUR ===================
const professionalTranslations = {
  fr: {
    title: "Analyse Sécuritaire de Tâches - C-Secur360",
    subtitle: "Plateforme professionnelle conforme CNESST/CSA Z462",
    saving: "Sauvegarde en cours...",
    saved: "✅ Enregistré avec succès",
    
    counters: {
      onJob: "Travailleurs",
      approved: "Validés AST", 
      approvalRate: "Taux validation",
      completion: "Progression"
    },
    
    steps: {
      general: "Informations Projet",
      discussion: "Briefing Sécurité", 
      equipment: "EPI & Équipements",
      hazards: "Analyse Risques",
      isolation: "Consignation LOTO",
      team: "Validation Équipe",
      documentation: "Documentation", 
      validation: "Approbation Finale"
    },
    
    projectInfo: {
      title: "Informations du Projet",
      industry: "Secteur d'Activité",
      astNumber: "# AST",
      astClientNumber: "# Référence Client", 
      date: "Date",
      client: "Client",
      clientPhone: "Téléphone Client",
      projectNumber: "Numéro Projet",
      workDescription: "Description Travaux",
      workLocation: "Lieu d'Intervention",
      clientRepresentative: "Responsable Client",
      clientRepresentativePhone: "Téléphone Responsable",
      workerCount: "Nombre Travailleurs",
      estimatedDuration: "Durée Estimée",
      emergencyContact: "Contact Urgence",
      emergencyPhone: "Numéro Urgence",
      astInfo: "Numéro unique généré automatiquement",
      astClientInfo: "Référence fournie par le client (optionnel)"
    },
    
    teamDiscussion: {
      title: "Briefing Sécuritaire Équipe",
      subtitle: "Points obligatoires à discuter avec l'équipe",
      completed: "✅ Discuté",
      pending: "⏳ À faire", 
      discussedBy: "Animé par",
      notes: "Notes du briefing",
      priority: "Priorité",
      toleranceZero: "Tolérance Zéro CNESST"
    },
    
    safetyEquipment: {
      title: "Équipements de Protection Individuelle et Collective",
      required: "Obligatoire",
      available: "Disponible",
      verified: "Vérifié/Testé", 
      notes: "Observations",
      inspection: "Inspection pré-utilisation",
      categories: {
        head: "Protection Crânienne",
        eye: "Protection Oculaire/Faciale",
        respiratory: "Protection Respiratoire",
        hand: "Protection des Mains", 
        foot: "Protection des Pieds",
        body: "Protection Corporelle",
        fall: "Protection Antichute",
        electrical: "Protection Électrique",
        detection: "Détection Atmosphérique",
        other: "Équipements Urgence"
      }
    },
    
    hazards: {
      title: "Identification et Analyse des Risques",
      selected: "Identifié",
      riskLevel: "Niveau Criticité",
      notes: "Observations complémentaires",
      controlMeasures: "Moyens de Contrôle",
      controlsRequired: "⚠️ MOYENS DE CONTRÔLE REQUIS",
      controlsInPlace: "✅ MESURES DE PRÉVENTION EN PLACE",
      hierarchyTitle: "Hiérarchie des Mesures (CNESST)",
      addCustomHazard: "Ajouter risque spécifique",
      toleranceZero: "🚨 TOLÉRANCE ZÉRO",
      levels: {
        low: "Faible",
        medium: "Modéré",
        high: "Élevé", 
        critical: "Critique"
      },
      categories: {
        elimination: "1. Élimination",
        substitution: "2. Substitution",
        engineering: "3. Ingénierie",
        administrative: "4. Administrative",
        ppe: "5. EPI"
      }
    },
    
    industries: {
      electrical: "Électrique",
      construction: "Construction",
      industrial: "Industriel",
      office: "Bureau/Services",
      manufacturing: "Manufacturier",
      other: "Autre Secteur"
    },
    
    team: {
      title: "Validation de l'Équipe",
      supervisor: "Superviseur/Chargé Projet",
      addMember: "Ajouter Travailleur",
      memberName: "Nom Complet",
      employeeId: "Matricule",
      department: "Service/Département", 
      qualification: "Qualification/Certification",
      validation: "Statut Validation",
      consultationAst: "Consultation AST",
      cadenasAppose: "Cadenas Posé",
      cadenasReleve: "Fin Travaux",
      status: "Statut",
      actions: "Actions",
      pending: "En attente",
      approved: "✅ Validé",
      rejected: "❌ Refusé",
      competency: "Personne compétente"
    },
    
    isolation: {
      title: "Points de Consignation LOTO",
      addPoint: "Nouveau Point LOTO",
      pointName: "Identification Point",
      isolationType: "Type Énergie",
      selectType: "Sélectionner type énergie...",
      noPoints: "Aucun point de consignation configuré",
      lotozero: "Tolérance ZÉRO - Consignation obligatoire",
      checklist: {
        cadenasAppose: "Cadenas Personnel Posé",
        absenceTension: "Absence Tension Vérifiée", 
        miseALaTerre: "Mise à la Terre Sécurité",
        verified: "Vérifié Personne Compétente"
      }
    },
    
    actions: {
      sendByEmail: "Transmettre par Courriel",
      archive: "Archiver Document",
      generatePDF: "Rapport PDF",
      print: "Imprimer",
      finalApproval: "Approbation Finale",
      export: "Exporter Données"
    },
    
    buttons: {
      previous: "‹ Précédent",
      next: "Suivant ›", 
      save: "Sauvegarder",
      approve: "Approuver",
      reject: "Refuser",
      add: "+ Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      validate: "Valider",
      cancel: "Annuler"
    },

    email: {
      subject: "AST C-Secur360 - Analyse Sécuritaire de Tâches",
      body: "Veuillez trouver ci-joint l'Analyse Sécuritaire de Tâches générée via la plateforme C-Secur360 pour votre validation."
    },

    validation: {
      errors: "Erreurs de validation",
      missing: "Champs manquants",
      incomplete: "Analyse incomplète",
      success: "Validation réussie"
    }
  },
  
  en: {
    title: "Job Safety Analysis - C-Secur360",
    subtitle: "Professional platform compliant with CNESST/CSA Z462", 
    saving: "Saving...",
    saved: "✅ Successfully saved",
    
    counters: {
      onJob: "Workers",
      approved: "JSA Validated",
      approvalRate: "Approval Rate",
      completion: "Progress"
    },
    
    steps: {
      general: "Project Information",
      discussion: "Safety Briefing", 
      equipment: "PPE & Equipment",
      hazards: "Risk Analysis",
      isolation: "LOTO Lockout",
      team: "Team Validation",
      documentation: "Documentation",
      validation: "Final Approval"
    },
    
    projectInfo: {
      title: "Project Information",
      industry: "Industry Sector",
      astNumber: "# JSA",
      astClientNumber: "# Client Reference",
      date: "Date",
      client: "Client", 
      clientPhone: "Client Phone",
      projectNumber: "Project Number",
      workDescription: "Work Description",
      workLocation: "Work Location",
      clientRepresentative: "Client Representative",
      clientRepresentativePhone: "Representative Phone",
      workerCount: "Number of Workers",
      estimatedDuration: "Estimated Duration",
      emergencyContact: "Emergency Contact",
      emergencyPhone: "Emergency Phone",
      astInfo: "Auto-generated unique number",
      astClientInfo: "Client-provided reference (optional)"
    },
    
    teamDiscussion: {
      title: "Team Safety Briefing",
      subtitle: "Mandatory points to discuss with team",
      completed: "✅ Discussed",
      pending: "⏳ Pending",
      discussedBy: "Led by", 
      notes: "Briefing notes",
      priority: "Priority",
      toleranceZero: "CNESST Zero Tolerance"
    },
    
    safetyEquipment: {
      title: "Individual and Collective Protection Equipment",
      required: "Required",
      available: "Available",
      verified: "Verified/Tested",
      notes: "Observations",
      inspection: "Pre-use inspection",
      categories: {
        head: "Head Protection",
        eye: "Eye/Face Protection", 
        respiratory: "Respiratory Protection",
        hand: "Hand Protection",
        foot: "Foot Protection",
        body: "Body Protection", 
        fall: "Fall Protection",
        electrical: "Electrical Protection",
        detection: "Atmospheric Detection",
        other: "Emergency Equipment"
      }
    },
    
    hazards: {
      title: "Risk Identification and Analysis",
      selected: "Identified",
      riskLevel: "Criticality Level", 
      notes: "Additional observations",
      controlMeasures: "Control Measures",
      controlsRequired: "⚠️ CONTROL MEASURES REQUIRED",
      controlsInPlace: "✅ PREVENTION MEASURES IN PLACE",
      hierarchyTitle: "Hierarchy of Controls (CNESST)",
      addCustomHazard: "Add specific hazard",
      toleranceZero: "🚨 ZERO TOLERANCE",
      levels: {
        low: "Low",
        medium: "Moderate",
        high: "High",
        critical: "Critical"
      },
      categories: {
        elimination: "1. Elimination",
        substitution: "2. Substitution", 
        engineering: "3. Engineering",
        administrative: "4. Administrative",
        ppe: "5. PPE"
      }
    },
    
    industries: {
      electrical: "Electrical",
      construction: "Construction",
      industrial: "Industrial",
      office: "Office/Services",
      manufacturing: "Manufacturing",
      other: "Other Sector"
    },
    
    team: {
      title: "Team Validation",
      supervisor: "Supervisor/Project Lead",
      addMember: "Add Worker",
      memberName: "Full Name",
      employeeId: "Employee ID",
      department: "Department/Service",
      qualification: "Qualification/Certification",
      validation: "Validation Status",
      consultationAst: "JSA Consultation", 
      cadenasAppose: "Lock Applied",
      cadenasReleve: "Work Complete",
      status: "Status",
      actions: "Actions",
      pending: "Pending",
      approved: "✅ Approved",
      rejected: "❌ Rejected",
      competency: "Competent person"
    },
    
    isolation: {
      title: "LOTO Lockout Points",
      addPoint: "New LOTO Point",
      pointName: "Point Identification",
      isolationType: "Energy Type",
      selectType: "Select energy type...",
      noPoints: "No lockout points configured",
      lotozero: "ZERO Tolerance - Lockout mandatory",
      checklist: {
        cadenasAppose: "Personal Lock Applied",
        absenceTension: "Absence of Voltage Verified",
        miseALaTerre: "Safety Grounding",
        verified: "Verified by Competent Person"
      }
    },
    
    actions: {
      sendByEmail: "Send by Email",
      archive: "Archive Document", 
      generatePDF: "PDF Report",
      print: "Print",
      finalApproval: "Final Approval",
      export: "Export Data"
    },
    
    buttons: {
      previous: "‹ Previous",
      next: "Next ›",
      save: "Save",
      approve: "Approve",
      reject: "Reject",
      add: "+ Add",
      edit: "Edit",
      delete: "Delete",
      validate: "Validate",
      cancel: "Cancel"
    },

    email: {
      subject: "JSA C-Secur360 - Job Safety Analysis",
      body: "Please find attached the Job Safety Analysis generated via C-Secur360 platform for your validation."
    },

    validation: {
      errors: "Validation errors",
      missing: "Missing fields",
      incomplete: "Incomplete analysis",
      success: "Validation successful"
    }
  }
};

// =================== DONNÉES INITIALES MISES À JOUR ===================
const initialProfessionalFormData: ASTFormData = {
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
    discussions: [...professionalDiscussions],
    briefingCompleted: false,
    briefingDate: '',
    briefingTime: '',
    emergencyProceduresList: [...regulatoryEmergencyProcedures]
  },
  
  safetyEquipment: [...professionalSafetyEquipment],
  electricalHazards: [...updatedElectricalHazards],
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

// =================== STYLES CSS OPTIMISÉS MOBILE ===================
const mobileOptimizedStyles = `
/* Variables CSS pour cohérence */
:root {
  --primary-blue: #3b82f6;
  --dark-blue: #1d4ed8;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --dark-bg: #0f172a;
  --card-bg: rgba(15, 23, 42, 0.8);
  --border-color: rgba(100, 116, 139, 0.3);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --border-radius: 12px;
  --border-radius-lg: 24px;
}

/* Base responsive */
.form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #1e293b 50%, #334155 100%);
  padding: 10px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

@media (min-width: 768px) {
  .form-container {
    padding: 20px;
  }
}

/* Conteneur principal adaptatif */
.glass-effect {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-lg);
  max-width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
}

@media (min-width: 768px) {
  .glass-effect {
    padding: 32px;
    max-width: 1200px;
  }
}

/* Header mobile-first */
.header-counters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

@media (min-width: 768px) {
  .header-counters {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
  }
}

/* Logo et info entreprise */
.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: center;
}

@media (min-width: 768px) {
  .company-info {
    text-align: left;
    gap: 16px;
  }
}

.company-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .company-logo {
    width: 50px;
    height: 50px;
    border-radius: var(--border-radius);
    font-size: 14px;
  }
}

/* Compteurs mobiles */
.counters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 576px) {
  .counters-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (min-width: 768px) {
  .counters-grid {
    display: flex;
    gap: 24px;
  }
}

.counter-item {
  text-align: center;
  padding: 12px 8px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-width: 0;
}

@media (min-width: 768px) {
  .counter-item {
    padding: 12px 20px;
    border-radius: var(--border-radius);
  }
}

.counter-number {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-blue);
  line-height: 1;
}

@media (min-width: 768px) {
  .counter-number {
    font-size: 24px;
  }
}

.counter-label {
  display: block;
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .counter-label {
    font-size: 12px;
  }
}

/* Indicateur d'étapes responsive */
.step-indicator {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

@media (min-width: 576px) {
  .step-indicator {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .step-indicator {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;
  }
}

.step-item {
  flex: 1;
  min-width: 0;
  padding: 8px 6px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-align: center;
  position: relative;
}

@media (min-width: 768px) {
  .step-item {
    padding: 12px 10px;
    border-radius: var(--border-radius);
    flex-direction: row;
    text-align: left;
  }
}

@media (min-width: 1024px) {
  .step-item {
    min-width: 140px;
    padding: 12px 16px;
  }
}

.step-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.step-item.active {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: white;
  border-color: var(--primary-blue);
}

.step-item.completed {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-green);
}

/* Texte des étapes responsive */
.step-text {
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .step-text {
    font-size: 12px;
    margin-top: 0;
    margin-left: 8px;
  }
}

@media (min-width: 1024px) {
  .step-text {
    font-size: 13px;
  }
}

/* Progress badge mobile */
.progress-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: rgba(255,255,255,0.9);
  color: var(--primary-blue);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 8px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

@media (min-width: 768px) {
  .progress-badge {
    position: static;
    background: rgba(255,255,255,0.1);
    color: inherit;
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
  }
}

/* Grilles responsives */
.equipment-grid,
.hazard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .equipment-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  .hazard-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (min-width: 1200px) {
  .equipment-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
  .hazard-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }
}

/* Boutons adaptés mobile */
.btn-mobile-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

@media (min-width: 576px) {
  .btn-mobile-stack {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.btn-premium,
.btn-secondary,
.btn-success,
.btn-danger {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  min-height: 44px; /* Touch target */
  font-size: 14px;
}

@media (min-width: 768px) {
  .btn-premium,
  .btn-secondary,
  .btn-success,
  .btn-danger {
    padding: 12px 24px;
    min-height: auto;
  }
}

/* Tableaux responsives */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.approval-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  background: rgba(30, 41, 59, 0.6);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.approval-table th,
.approval-table td {
  padding: 8px 6px;
  text-align: left;
  font-size: 12px;
  border-bottom: 1px solid var(--border-color);
}

@media (min-width: 768px) {
  .approval-table th,
  .approval-table td {
    padding: 16px 12px;
    font-size: 14px;
  }
}

/* Navigation mobile */
.navigation-mobile {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(20px);
  z-index: 100;
}

@media (min-width: 768px) {
  .navigation-mobile {
    position: static;
    background: none;
    border-top: 1px solid var(--border-color);
    margin-top: 32px;
    padding-top: 24px;
    backdrop-filter: none;
  }
}

/* Inputs optimisés mobile */
.input-premium {
  width: 100%;
  padding: 12px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 16px; /* Évite zoom iOS */
  transition: all 0.3s ease;
}

.input-premium:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Animations optimisées performance */
.slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Photo carousel mobile */
.photo-carousel-mobile {
  margin-top: 24px;
}

.photo-carousel-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

@media (min-width: 576px) {
  .photo-carousel-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

/* Classes utilitaires mobile */
.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: block;
  }
}

.show-mobile {
  display: block;
}

@media (min-width: 768px) {
  .show-mobile {
    display: none;
  }
}

.text-xs-mobile {
  font-size: 12px;
}

@media (min-width: 768px) {
  .text-xs-mobile {
    font-size: 14px;
  }
}

/* Performance et accessibilité */
* {
  box-sizing: border-box;
}

button, input, select, textarea {
  font-family: inherit;
}

/* Indicateur sauvegarde mobile */
.save-indicator {
  position: fixed;
  top: 10px;
  right: 10px;
  left: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 1000;
  transition: all 0.3s ease;
  font-size: 14px;
}

@media (min-width: 768px) {
  .save-indicator {
    top: 20px;
    right: 20px;
    left: auto;
    padding: 12px 20px;
    width: auto;
  }
}

/* États de sauvegarde */
.save-indicator.saving {
  background: linear-gradient(135deg, var(--warning-orange) 0%, #d97706 100%);
  animation: pulse 2s infinite;
}

.save-indicator.saved {
  background: linear-gradient(135deg, var(--success-green) 0%, #059669 100%);
}

.save-indicator.error {
  background: linear-gradient(135deg, var(--danger-red) 0%, #dc2626 100%);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
`;

// =================== GÉNÉRATION PDF PROFESSIONNELLE AVEC BRANDING C-SECUR360 ===================
const generateProfessionalPDFWithBranding = async (formData: ASTFormData, tenant: Tenant): Promise<boolean> => {
  try {
    console.log('📄 Génération PDF C-Secur360...');
    
    // Import dynamique jsPDF
    let jsPDF;
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.jsPDF;
    } catch (error) {
      console.warn('jsPDF non disponible');
      alert('Module PDF indisponible. Veuillez installer jsPDF.');
      return false;
    }
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    let currentY = 20;
    const margin = 20;
    const lineHeight = 6;
    
    // =================== EN-TÊTE PREMIUM C-SECUR360 ===================
    // Fond dégradé header
    doc.setFillColor(15, 23, 42); // --dark-bg
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo C-Secur360 stylisé
    doc.setFillColor(59, 130, 246); // --primary-blue
    doc.circle(35, 25, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('C', 32, 28);
    
    // Cercle intérieur
    doc.setFillColor(29, 78, 216); // --dark-blue
    doc.circle(35, 25, 8, 'F');
    doc.setFontSize(10);
    doc.text('360', 28, 28);
    
    // Nom entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('C-SECUR360', 55, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Plateforme Professionnelle SST', 55, 32);
    
    // Numéro AST en vedette
    doc.setFillColor(16, 185, 129); // --success-green
    doc.roundedRect(140, 15, 50, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('AST N°', 145, 22);
    doc.setFontSize(12);
    doc.text(formData.astNumber, 145, 28);
    
    currentY = 60;
    
    // =================== TITRE PRINCIPAL ===================
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALYSE SÉCURITAIRE DE TÂCHES', margin, currentY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Conforme CNESST/CSA Z462 • Généré le ${new Date().toLocaleDateString('fr-CA')}`, margin, currentY + 8);
    
    currentY += 25;
    
    // =================== INFORMATIONS PROJET ===================
    // Encadré principal
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 45, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 45, 3, 3, 'S');
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS PROJET', margin + 5, currentY + 5);
    
    // Données en colonnes
    const projectData = [
      ['Client:', formData.projectInfo.client || 'Non spécifié'],
      ['Téléphone:', formData.projectInfo.clientPhone || 'Non spécifié'],
      ['Projet:', formData.projectInfo.projectNumber || 'Non spécifié'],
      ['Lieu:', formData.projectInfo.workLocation || 'Non spécifié'],
      ['Date:', formData.projectInfo.date || 'Non spécifié'],
      ['Durée:', formData.projectInfo.estimatedDuration || 'Non spécifié'],
      ['Équipe:', `${formData.team.members.length} personne(s)`],
      ['Urgence:', formData.projectInfo.emergencyPhone || '911']
    ];
    
    doc.setFontSize(10);
    let colX = margin + 10;
    let colY = currentY + 15;
    
    projectData.forEach((item, index) => {
      if (index === 4) { // Nouvelle colonne après 4 items
        colX = margin + 100;
        colY = currentY + 15;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(item[0], colX, colY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(item[1], colX + 25, colY);
      
      colY += lineHeight;
    });
    
    currentY += 55;
    
    // =================== DESCRIPTION TRAVAUX ===================
    if (formData.projectInfo.workDescription) {
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 25, 3, 3, 'F');
      doc.setDrawColor(147, 197, 253);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 25, 3, 3, 'S');
      
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION DES TRAVAUX', margin + 5, currentY + 5);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(formData.projectInfo.workDescription, pageWidth - 2 * margin - 10);
      doc.text(descLines, margin + 5, currentY + 12);
      
      currentY += 35;
    }
    
    // =================== DANGERS IDENTIFIÉS ===================
    const selectedHazards = formData.electricalHazards.filter(h => h.isSelected);
    
    if (selectedHazards.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, Math.min(selectedHazards.length * 8 + 15, 60), 3, 3, 'F');
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, Math.min(selectedHazards.length * 8 + 15, 60), 3, 3, 'S');
      
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DANGERS IDENTIFIÉS & MESURES DE CONTRÔLE', margin + 5, currentY + 5);
      
      doc.setFontSize(10);
      let hazardY = currentY + 15;
      
      selectedHazards.forEach((hazard, index) => {
        if (hazardY > pageHeight - 30) {
          doc.addPage();
          hazardY = 20;
        }
        
        // Indicateur de criticité
        const riskColors = {
          critical: [220, 38, 38],
          high: [245, 158, 11],
          medium: [234, 179, 8],
          low: [34, 197, 94]
        };
        
        const color = riskColors[hazard.riskLevel] || [100, 116, 139];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(margin + 8, hazardY - 1, 2, 'F');
        
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${hazard.code} - ${hazard.title}`, margin + 15, hazardY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        const descText = doc.splitTextToSize(hazard.description, pageWidth - 2 * margin - 20);
        doc.text(descText, margin + 18, hazardY + 4);
        
        hazardY += 8;
      });
      
      currentY = hazardY + 10;
    }
    
    // =================== ÉQUIPE DE TRAVAIL ===================
    if (formData.team.members.length > 0) {
      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, formData.team.members.length * 6 + 20, 3, 3, 'F');
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, formData.team.members.length * 6 + 20, 3, 3, 'S');
      
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ÉQUIPE DE TRAVAIL VALIDÉE', margin + 5, currentY + 5);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      let teamY = currentY + 15;
      
      formData.team.members.forEach(member => {
        const statusIcon = member.validationStatus === 'approved' ? '✓' : 
                          member.validationStatus === 'rejected' ? '✗' : '⏳';
        const statusColor = member.validationStatus === 'approved' ? [34, 197, 94] :
                           member.validationStatus === 'rejected' ? [239, 68, 68] : [251, 191, 36];
        
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(statusIcon, margin + 8, teamY);
        
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(`${member.name} - ${member.department} (${member.qualification})`, margin + 15, teamY);
        
        teamY += 6;
      });
      
      currentY = teamY + 10;
    }
    
    // =================== SECTION SIGNATURES ===================
    if (currentY > pageHeight - 70) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 50, 3, 3, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, 50, 3, 3, 'S');
    
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURES ET APPROBATIONS', margin + 5, currentY + 5);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Lignes de signature
    const signatureY = currentY + 20;
    
    doc.setTextColor(75, 85, 99);
    doc.text('Superviseur/Chargé de projet:', margin + 10, signatureY);
    doc.line(margin + 60, signatureY, margin + 120, signatureY);
    doc.text('Date:', margin + 130, signatureY);
    doc.line(margin + 145, signatureY, margin + 180, signatureY);
    
    doc.text('Responsable sécurité:', margin + 10, signatureY + 15);
    doc.line(margin + 60, signatureY + 15, margin + 120, signatureY + 15);
    doc.text('Date:', margin + 130, signatureY + 15);
    doc.line(margin + 145, signatureY + 15, margin + 180, signatureY + 15);
    
    // =================== PIED DE PAGE ===================
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Document généré par C-Secur360 • ${new Date().toLocaleString('fr-CA')} • Page 1`, margin, pageHeight - 10);
    doc.text(`AST ${formData.astNumber} • Conforme CNESST/CSA Z462`, pageWidth - margin - 80, pageHeight - 10);
    
    // Sauvegarde du PDF
    const fileName = `AST_C-Secur360_${formData.astNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF C-Secur360 généré:', fileName);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    return false;
  }
};

// =================== FONCTIONS EMAIL PROFESSIONNELLES ===================
const sendProfessionalEmail = async (formData: ASTFormData, tenant: Tenant, language: 'fr' | 'en'): Promise<boolean> => {
  try {
    console.log('📧 Envoi email professionnel...');
    
    const t = professionalTranslations[language];
    const subject = `${t.email.subject} - ${formData.astNumber} - ${formData.projectInfo.client}`;
    
    const emailBody = language === 'fr' ? 
      `Bonjour,

Veuillez trouver ci-joint l'Analyse Sécuritaire de Tâches générée via la plateforme C-Secur360.

DÉTAILS DU PROJET:
• Numéro AST: ${formData.astNumber}
• Client: ${formData.projectInfo.client}
• Projet: ${formData.projectInfo.projectNumber}
• Lieu: ${formData.projectInfo.workLocation}
• Date: ${formData.projectInfo.date}
• Équipe: ${formData.team.members.length} travailleur(s)

STATUT VALIDATION:
• Dangers identifiés: ${formData.electricalHazards.filter(h => h.isSelected).length}
• Membres validés: ${formData.team.members.filter(m => m.validationStatus === 'approved').length}/${formData.team.members.length}
• Statut: ${formData.validation.finalApproval ? 'Approuvé final' : 'En cours'}

Ce document a été généré en conformité avec les normes CNESST et CSA Z462.

Cordialement,
Plateforme C-Secur360` :
      `Hello,

Please find attached the Job Safety Analysis generated via the C-Secur360 platform.

PROJECT DETAILS:
• JSA Number: ${formData.astNumber}
• Client: ${formData.projectInfo.client}
• Project: ${formData.projectInfo.projectNumber}
• Location: ${formData.projectInfo.workLocation}
• Date: ${formData.projectInfo.date}
• Team: ${formData.team.members.length} worker(s)

VALIDATION STATUS:
• Hazards identified: ${formData.electricalHazards.filter(h => h.isSelected).length}
• Members validated: ${formData.team.members.filter(m => m.validationStatus === 'approved').length}/${formData.team.members.length}
• Status: ${formData.validation.finalApproval ? 'Final approval' : 'In progress'}

This document was generated in compliance with CNESST and CSA Z462 standards.

Best regards,
C-Secur360 Platform`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl);
    
    console.log('✅ Email professionnel ouvert');
    return true;
  } catch (error) {
    console.error('❌ Erreur email professionnel:', error);
    return false;
  }
};
// =================== AST SECTION 4/5 - STRUCTURE CORRIGÉE (FIN DES FONCTIONS + DÉBUT RETURN) ===================
// Section 4: Fin des fonctions utilitaires et début du return principal

  // =================== COMPOSANT PHOTOCAROUSEL MOBILE-FRIENDLY ===================
  const PhotoCarousel: React.FC<{
    photos: Photo[];
    onAddPhoto: (file: File) => Promise<void>;
    onRemovePhoto: (index: number) => void;
    maxPhotos?: number;
  }> = ({ photos, onAddPhoto, onRemovePhoto, maxPhotos = 5 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        if (photos.length < maxPhotos) {
          try {
            await onAddPhoto(file);
          } catch (error) {
            console.error('Erreur upload photo:', error);
            alert('Erreur lors de l\'ajout de la photo');
          }
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <div className="space-y-3">
        {/* Photos existantes */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.nom}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => onRemovePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded truncate">
                  {photo.nom}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton d'ajout */}
        {photos.length < maxPhotos && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Camera className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <div className="text-sm text-gray-600">
                Ajouter des photos ({photos.length}/{maxPhotos})
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Formats acceptés: JPG, PNG, HEIC
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  // =================== FIN DE TOUTES LES FONCTIONS UTILITAIRES ===================
  // Toutes les fonctions du composant sont maintenant définies
  // Le return principal du composant ASTFormUltraPremium commence ici

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern Mobile-Friendly */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23000000\" fill-opacity=\"0.1\"><circle cx=\"30\" cy=\"30\" r=\"1.5\"/></g></g></svg>')] bg-repeat"></div>
      </div>

      {/* Header Mobile Optimisé */}
      <div className="relative z-10">
        <div className="bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Logo et titre responsive */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent truncate">
                    {translations[language].title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm text-gray-600">
                      AST #{formData.numeroAST}
                    </span>
                    {isAutoSaving && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="hidden sm:inline">Sauvegarde...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions header mobile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-all duration-200 font-medium text-gray-700 hover:text-blue-600"
                >
                  {language === 'fr' ? 'EN' : 'FR'}
                </button>
                <button className="p-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-all duration-200 text-gray-600 hover:text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Barre de progression mobile optimisée */}
            <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${((currentStep + 1) / 8) * 100}%` }}
              />
            </div>
            
            {/* Navigation étapes mobile */}
            <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600 font-medium">
                Étape {currentStep + 1} sur 8
              </span>
              <span className="text-blue-600 font-semibold">
                {Math.round(((currentStep + 1) / 8) * 100)}% complété
              </span>
            </div>

            {/* Compteurs temps réel mobile */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 text-center">
                <div className="text-lg sm:text-xl font-bold text-green-700">{formData.equipe.length}</div>
                <div className="text-xs text-green-600">Personnes</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1.5 text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-700">
                  {formData.dangersIdentifies.filter(d => d.present).length}
                </div>
                <div className="text-xs text-orange-600">Risques</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-700">
                  {formData.equipementsSecurite.filter(e => e.utilise).length}
                </div>
                <div className="text-xs text-blue-600">EPI</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-1.5 text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-700">
                  {formData.pointsIsolement.filter(p => p.isole).length}
                </div>
                <div className="text-xs text-purple-600">Isolements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal mobile-first */}
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            
            {/* ÉTAPE 1: INFORMATIONS GÉNÉRALES */}
            {currentStep === 0 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].generalInfo}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Informations de base pour l'analyse sécuritaire du travail
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Colonne gauche */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {translations[language].project} *
                      </label>
                      <input
                        type="text"
                        value={formData.projet}
                        onChange={(e) => setFormData(prev => ({ ...prev, projet: e.target.value }))}
                        className="input-field"
                        placeholder="Ex: Installation électrique Bâtiment A"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {translations[language].location} *
                      </label>
                      <input
                        type="text"
                        value={formData.lieu}
                        onChange={(e) => setFormData(prev => ({ ...prev, lieu: e.target.value }))}
                        className="input-field"
                        placeholder="Ex: 123 Rue Industrielle, Montréal, QC"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {translations[language].taskDescription} *
                      </label>
                      <textarea
                        value={formData.descriptionTache}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionTache: e.target.value }))}
                        className="input-field resize-none"
                        rows={3}
                        placeholder="Décrivez en détail la tâche à effectuer..."
                        required
                      />
                    </div>
                  </div>

                  {/* Colonne droite */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Heure *
                        </label>
                        <input
                          type="time"
                          value={formData.heure}
                          onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {translations[language].responsible} *
                      </label>
                      <input
                        type="text"
                        value={formData.responsable}
                        onChange={(e) => setFormData(prev => ({ ...prev, responsable: e.target.value }))}
                        className="input-field"
                        placeholder="Nom du responsable de l'équipe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durée estimée
                      </label>
                      <select
                        value={formData.dureeEstimee}
                        onChange={(e) => setFormData(prev => ({ ...prev, dureeEstimee: e.target.value }))}
                        className="input-field"
                      >
                        <option value="">Sélectionner la durée</option>
                        <option value="< 1 heure">Moins d'1 heure</option>
                        <option value="1-4 heures">1 à 4 heures</option>
                        <option value="4-8 heures">4 à 8 heures (journée)</option>
                        <option value="1-3 jours">1 à 3 jours</option>
                        <option value="+ 3 jours">Plus de 3 jours</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Conditions météorologiques
                      </label>
                      <select
                        value={formData.conditionsMeteo}
                        onChange={(e) => setFormData(prev => ({ ...prev, conditionsMeteo: e.target.value }))}
                        className="input-field"
                      >
                        <option value="">Conditions actuelles</option>
                        <option value="Ensoleillé">☀️ Ensoleillé</option>
                        <option value="Nuageux">☁️ Nuageux</option>
                        <option value="Pluvieux">🌧️ Pluvieux</option>
                        <option value="Neigeux">❄️ Neigeux</option>
                        <option value="Venteux">💨 Venteux</option>
                        <option value="Froid extrême">🥶 Froid extrême</option>
                        <option value="Chaleur extrême">🥵 Chaleur extrême</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTINUER AVEC LES SECTIONS 5A ET 5B POUR LES AUTRES ÉTAPES */}
            // =================== AST SECTION 5A/5 - CONTINUATION JSX (ÉTAPES 2-4) ===================
// Section 5A: Continuation du JSX - Étapes 2 à 4 (SANS nouveau return)

            {/* ÉTAPE 2: DISCUSSION D'ÉQUIPE */}
            {currentStep === 1 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].teamDiscussion}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Points de discussion obligatoires et communication d'équipe
                  </p>
                </div>

                {/* Points de discussion obligatoires */}
                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Points de discussion obligatoires
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {formData.discussionsEquipe.map((discussion, index) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <CustomCheckbox
                            checked={discussion.discute}
                            onChange={(checked) => {
                              const newDiscussions = [...formData.discussionsEquipe];
                              newDiscussions[index].discute = checked;
                              setFormData(prev => ({ ...prev, discussionsEquipe: newDiscussions }));
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                              {discussion.sujet}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">
                              {discussion.description}
                            </p>
                            
                            {discussion.discute && (
                              <div className="mt-3">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Notes et observations:
                                </label>
                                <textarea
                                  value={discussion.notes}
                                  onChange={(e) => {
                                    const newDiscussions = [...formData.discussionsEquipe];
                                    newDiscussions[index].notes = e.target.value;
                                    setFormData(prev => ({ ...prev, discussionsEquipe: newDiscussions }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  rows={2}
                                  placeholder="Ajoutez vos notes..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication d'urgence */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Procédures d'urgence
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-red-700 mb-2">
                        Numéro d'urgence principal
                      </label>
                      <input
                        type="tel"
                        value={formData.numeroUrgence}
                        onChange={(e) => setFormData(prev => ({ ...prev, numeroUrgence: e.target.value }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                        placeholder="911 ou numéro interne"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-red-700 mb-2">
                        Responsable sécurité sur site
                      </label>
                      <input
                        type="text"
                        value={formData.responsableSecurite}
                        onChange={(e) => setFormData(prev => ({ ...prev, responsableSecurite: e.target.value }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                        placeholder="Nom et poste #"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-red-700 mb-2">
                      Point de rassemblement d'urgence
                    </label>
                    <input
                      type="text"
                      value={formData.pointRassemblement}
                      onChange={(e) => setFormData(prev => ({ ...prev, pointRassemblement: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                      placeholder="Localisation précise du point de rassemblement"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3: ÉQUIPEMENTS DE SÉCURITÉ */}
            {currentStep === 2 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].safetyEquipment}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Équipements de protection individuelle et collective requis
                  </p>
                </div>

                {/* Résumé en haut mobile */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {formData.equipementsSecurite.filter(e => e.utilise).length} équipements sélectionnés
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Vérifiez que tous les équipements requis sont disponibles et conformes
                  </div>
                </div>

                {/* Équipements par catégorie */}
                <div className="space-y-6">
                  {Object.entries(
                    formData.equipementsSecurite.reduce((acc, equip) => {
                      if (!acc[equip.categorie]) acc[equip.categorie] = [];
                      acc[equip.categorie].push(equip);
                      return acc;
                    }, {} as Record<string, typeof formData.equipementsSecurite>)
                  ).map(([categorie, equipements]) => (
                    <div key={categorie} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          {categorie}
                          <span className="text-sm text-gray-500 ml-auto">
                            {equipements.filter(e => e.utilise).length}/{equipements.length}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-3">
                          {equipements.map((equip, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <CustomCheckbox
                                checked={equip.utilise}
                                onChange={(checked) => updateEquipementSecurite(equip.nom, checked, equip.conforme, equip.notes)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-gray-900 text-sm">{equip.nom}</h4>
                                  {equip.utilise && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <CustomCheckbox
                                        checked={equip.conforme}
                                        onChange={(checked) => updateEquipementSecurite(equip.nom, equip.utilise, checked, equip.notes)}
                                        variant="success"
                                      />
                                      <span className="text-xs text-gray-600">Conforme</span>
                                    </div>
                                  )}
                                </div>
                                
                                {equip.norme && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Norme: {equip.norme}
                                  </p>
                                )}
                                
                                {equip.utilise && (
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      value={equip.notes}
                                      onChange={(e) => updateEquipementSecurite(equip.nom, equip.utilise, equip.conforme, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      placeholder="Notes (état, quantité, etc.)"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Équipement personnalisé mobile */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter un équipement spécifique
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newEquipment.nom}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, nom: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="Nom de l'équipement"
                      />
                      <select
                        value={newEquipment.categorie}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, categorie: e.target.value }))}
                        className="input-field text-sm"
                      >
                        <option value="">Catégorie</option>
                        <option value="Protection individuelle">Protection individuelle</option>
                        <option value="Protection collective">Protection collective</option>
                        <option value="Outils sécuritaires">Outils sécuritaires</option>
                        <option value="Équipement d'urgence">Équipement d'urgence</option>
                      </select>
                    </div>
                    
                    <input
                      type="text"
                      value={newEquipment.norme}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, norme: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="Norme applicable (optionnel)"
                    />
                    
                    <button
                      onClick={addCustomEquipment}
                      disabled={!newEquipment.nom || !newEquipment.categorie}
                      className="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter l'équipement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 4: IDENTIFICATION DES DANGERS */}
            {currentStep === 3 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].hazardIdentification}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Identification et évaluation des risques avec moyens de contrôle CNESST
                  </p>
                </div>

                {/* Résumé des risques mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-red-700">
                      {formData.dangersIdentifies.filter(d => d.present && d.niveauRisque === 'Élevé').length}
                    </div>
                    <div className="text-xs text-red-600">Risque élevé</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-orange-700">
                      {formData.dangersIdentifies.filter(d => d.present && d.niveauRisque === 'Moyen').length}
                    </div>
                    <div className="text-xs text-orange-600">Risque moyen</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-yellow-700">
                      {formData.dangersIdentifies.filter(d => d.present && d.niveauRisque === 'Faible').length}
                    </div>
                    <div className="text-xs text-yellow-600">Risque faible</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-green-700">
                      {formData.dangersIdentifies.filter(d => d.present && d.moyensControle.length > 0).length}
                    </div>
                    <div className="text-xs text-green-600">Contrôlés</div>
                  </div>
                </div>

                {/* Dangers par catégorie mobile-first */}
                <div className="space-y-4">
                  {Object.entries(
                    formData.dangersIdentifies.reduce((acc, danger) => {
                      if (!acc[danger.categorie]) acc[danger.categorie] = [];
                      acc[danger.categorie].push(danger);
                      return acc;
                    }, {} as Record<string, typeof formData.dangersIdentifies>)
                  ).map(([categorie, dangers]) => (
                    <div key={categorie} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            {categorie}
                          </span>
                          <span className="text-sm text-gray-500">
                            {dangers.filter(d => d.present).length}/{dangers.length}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {dangers.map((danger, index) => (
                          <div key={index} className={`border rounded-xl p-4 transition-all duration-200 ${
                            danger.present ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}>
                            <div className="flex items-start gap-3">
                              <CustomCheckbox
                                checked={danger.present}
                                onChange={(checked) => updateDanger(danger.nom, checked, danger.niveauRisque, danger.moyensControle, danger.notes)}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                                  {danger.nom}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                                  {danger.description}
                                </p>
                                
                                {danger.present && (
                                  <div className="space-y-3">
                                    {/* Niveau de risque */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Niveau de risque:
                                      </label>
                                      <select
                                        value={danger.niveauRisque}
                                        onChange={(e) => updateDanger(danger.nom, danger.present, e.target.value, danger.moyensControle, danger.notes)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      >
                                        <option value="Faible">🟡 Faible</option>
                                        <option value="Moyen">🟠 Moyen</option>
                                        <option value="Élevé">🔴 Élevé</option>
                                      </select>
                                    </div>

                                    {/* Moyens de contrôle CNESST */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Moyens de contrôle CNESST (hiérarchie):
                                      </label>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {moyensControleCNESST[danger.nom] && moyensControleCNESST[danger.nom].map((moyen, moyenIndex) => (
                                          <div key={moyenIndex} className="flex items-start gap-2">
                                            <CustomCheckbox
                                              checked={danger.moyensControle.includes(moyen.nom)}
                                              onChange={(checked) => {
                                                const nouveauxMoyens = checked 
                                                  ? [...danger.moyensControle, moyen.nom]
                                                  : danger.moyensControle.filter(m => m !== moyen.nom);
                                                updateDanger(danger.nom, danger.present, danger.niveauRisque, nouveauxMoyens, danger.notes);
                                              }}
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-xs font-medium text-gray-800">{moyen.nom}</div>
                                              <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                                                moyen.niveau === 'Élimination' ? 'bg-green-100 text-green-700' :
                                                moyen.niveau === 'Substitution' ? 'bg-blue-100 text-blue-700' :
                                                moyen.niveau === 'Ingénierie' ? 'bg-purple-100 text-purple-700' :
                                                moyen.niveau === 'Administrative' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                              }`}>
                                                {moyen.niveau}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Notes et mesures spécifiques:
                                      </label>
                                      <textarea
                                        value={danger.notes}
                                        onChange={(e) => updateDanger(danger.nom, danger.present, danger.niveauRisque, danger.moyensControle, e.target.value)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                        rows={2}
                                        placeholder="Mesures spécifiques, observations..."
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTINUER AVEC LA SECTION 5B POUR LES ÉTAPES 5-8 ET NAVIGATION FINALE */}
            // =================== AST SECTION 5B/5 FINALE - INTERFACE COMPLÈTE (ÉTAPES 5-8 + NAVIGATION) ===================
// Section 5B: Étapes 5 à 8, navigation complète et actions finales

            {/* ÉTAPE 5: ISOLEMENT DES ÉNERGIES */}
            {currentStep === 4 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].energyIsolation}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Procédures de cadenassage et isolation des énergies (LOTO)
                  </p>
                </div>

                {/* Résumé isolation mobile */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">
                      {formData.pointsIsolement.filter(p => p.isole).length} points isolés
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    Vérifiez que tous les points d'énergie sont identifiés et sécurisés
                  </div>
                </div>

                {/* Points d'isolement */}
                <div className="space-y-4">
                  {formData.pointsIsolement.map((point, index) => (
                    <div key={index} className={`bg-white rounded-xl border p-4 transition-all duration-200 ${
                      point.isole ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <CustomCheckbox
                          checked={point.isole}
                          onChange={(checked) => updatePointIsolement(index, { ...point, isole: checked })}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Source d'énergie:
                              </label>
                              <input
                                type="text"
                                value={point.source}
                                onChange={(e) => updatePointIsolement(index, { ...point, source: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Ex: Panneau électrique #A-1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Type d'énergie:
                              </label>
                              <select
                                value={point.type}
                                onChange={(e) => updatePointIsolement(index, { ...point, type: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">Sélectionner</option>
                                <option value="Électrique">⚡ Électrique</option>
                                <option value="Mécanique">⚙️ Mécanique</option>
                                <option value="Hydraulique">🔧 Hydraulique</option>
                                <option value="Pneumatique">💨 Pneumatique</option>
                                <option value="Thermique">🔥 Thermique</option>
                                <option value="Chimique">🧪 Chimique</option>
                                <option value="Gravitationnelle">📏 Gravitationnelle</option>
                              </select>
                            </div>
                          </div>

                          {point.isole && (
                            <div className="space-y-3 pt-3 border-t border-purple-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Méthode d'isolement:
                                  </label>
                                  <select
                                    value={point.methode}
                                    onChange={(e) => updatePointIsolement(index, { ...point, methode: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Sélectionner</option>
                                    <option value="Cadenas">🔒 Cadenas</option>
                                    <option value="Étiquette">🏷️ Étiquette</option>
                                    <option value="Disjoncteur">🔌 Disjoncteur</option>
                                    <option value="Vanne">🚰 Vanne</option>
                                    <option value="Disconnecteur">⚡ Disconnecteur</option>
                                    <option value="Blocage mécanique">🔧 Blocage mécanique</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Responsable du cadenas:
                                  </label>
                                  <input
                                    type="text"
                                    value={point.responsable}
                                    onChange={(e) => updatePointIsolement(index, { ...point, responsable: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Nom du responsable"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Notes de vérification:
                                </label>
                                <textarea
                                  value={point.notes}
                                  onChange={(e) => updatePointIsolement(index, { ...point, notes: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  rows={2}
                                  placeholder="Test de vérification, numéro de cadenas, observations..."
                                />
                              </div>

                              {/* Photos d'isolement */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Photos du point d'isolement:
                                </label>
                                <PhotoCarousel
                                  photos={point.photos}
                                  onAddPhoto={(file) => addPhotoToIsolationPoint(point.id, file)}
                                  onRemovePhoto={(photoIndex) => removePhotoFromIsolationPoint(point.id, photoIndex)}
                                  maxPhotos={3}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ajouter point d'isolement */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                  <button
                    onClick={addPointIsolement}
                    className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un point d'isolement
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 6: GESTION D'ÉQUIPE */}
            {currentStep === 5 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].teamManagement}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Membres de l'équipe, rôles et qualifications
                  </p>
                </div>

                {/* Résumé équipe mobile */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {formData.equipe.length} personnes dans l'équipe
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    Vérifiez les qualifications et formations de chaque membre
                  </div>
                </div>

                {/* Membres d'équipe */}
                <div className="space-y-4">
                  {formData.equipe.map((membre, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Membre {index + 1}
                        </h3>
                        <button
                          onClick={() => removeMember(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            value={membre.nom}
                            onChange={(e) => updateMember(index, { ...membre, nom: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Prénom et nom"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Poste/Fonction *
                          </label>
                          <input
                            type="text"
                            value={membre.poste}
                            onChange={(e) => updateMember(index, { ...membre, poste: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ex: Électricien"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Entreprise
                          </label>
                          <input
                            type="text"
                            value={membre.entreprise}
                            onChange={(e) => updateMember(index, { ...membre, entreprise: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Nom de l'entreprise"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Années d'expérience
                          </label>
                          <select
                            value={membre.experience}
                            onChange={(e) => updateMember(index, { ...membre, experience: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Sélectionner</option>
                            <option value="< 1 an">Moins d'1 an</option>
                            <option value="1-3 ans">1 à 3 ans</option>
                            <option value="3-5 ans">3 à 5 ans</option>
                            <option value="5-10 ans">5 à 10 ans</option>
                            <option value="10+ ans">Plus de 10 ans</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Formations et certifications:
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {membre.qualifications.map((qual, qualIndex) => (
                            <span key={qualIndex} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {qual}
                              <button
                                onClick={() => {
                                  const newQuals = membre.qualifications.filter((_, i) => i !== qualIndex);
                                  updateMember(index, { ...membre, qualifications: newQuals });
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newQualification}
                            onChange={(e) => setNewQualification(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Ex: RCR, Hauteur, SIMDUT..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newQualification.trim()) {
                                updateMember(index, { 
                                  ...membre, 
                                  qualifications: [...membre.qualifications, newQualification.trim()] 
                                });
                                setNewQualification('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newQualification.trim()) {
                                updateMember(index, { 
                                  ...membre, 
                                  qualifications: [...membre.qualifications, newQualification.trim()] 
                                });
                                setNewQualification('');
                              }
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Rôle spécifique dans cette tâche:
                        </label>
                        <textarea
                          value={membre.roleSpecifique}
                          onChange={(e) => updateMember(index, { ...membre, roleSpecifique: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                          placeholder="Responsabilités spécifiques pour cette AST..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ajouter membre */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
                  <button
                    onClick={addMember}
                    className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajouter un membre à l'équipe
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 7: DOCUMENTATION */}
            {currentStep === 6 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].documentation}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Photos, schémas et documentation de support
                  </p>
                </div>

                {/* Photos générales */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Photos du site et de la tâche
                  </h3>
                  
                  <PhotoCarousel
                    photos={formData.photos}
                    onAddPhoto={addPhoto}
                    onRemovePhoto={removePhoto}
                    maxPhotos={10}
                  />
                </div>

                {/* Observations */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Observations et notes importantes
                  </h3>
                  
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows={6}
                    placeholder="Ajoutez vos observations, conditions particulières, défis identifiés, recommandations..."
                  />
                </div>

                {/* Documents de référence */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Documents de référence
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procédures applicables
                      </label>
                      <textarea
                        value={formData.proceduresApplicables}
                        onChange={(e) => setFormData(prev => ({ ...prev, proceduresApplicables: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={4}
                        placeholder="• Procédure LOTO-001&#10;• Guide sécurité électrique&#10;• Instructions fabricant..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Normes et réglementations
                      </label>
                      <textarea
                        value={formData.normesReglementations}
                        onChange={(e) => setFormData(prev => ({ ...prev, normesReglementations: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={4}
                        placeholder="• CSA Z462&#10;• Code électrique du Québec&#10;• CNESST..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 8: VALIDATION FINALE */}
            {currentStep === 7 && (
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {translations[language].finalValidation}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Vérification finale et approbations requises
                  </p>
                </div>

                {/* Résumé final mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-blue-700">{formData.equipe.length}</div>
                    <div className="text-xs text-blue-600">Personnes</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-orange-700">
                      {formData.dangersIdentifies.filter(d => d.present).length}
                    </div>
                    <div className="text-xs text-orange-600">Risques</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-green-700">
                      {formData.equipementsSecurite.filter(e => e.utilise).length}
                    </div>
                    <div className="text-xs text-green-600">Équipements</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <div className="text-lg sm:text-xl font-bold text-purple-700">
                      {formData.pointsIsolement.filter(p => p.isole).length}
                    </div>
                    <div className="text-xs text-purple-600">Isolements</div>
                  </div>
                </div>

                {/* Vérifications finales */}
                <div className="space-y-6">
                  {/* Validation des informations */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                      Validation des informations
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'infoComplete', label: 'Toutes les informations requises sont complètes' },
                        { key: 'risquesEvalues', label: 'Tous les risques ont été évalués et des contrôles sont en place' },
                        { key: 'equipementVerifie', label: 'Tous les équipements de sécurité ont été vérifiés' },
                        { key: 'equipeFormee', label: 'Tous les membres de l\'équipe sont formés et qualifiés' },
                        { key: 'proceduresComprises', label: 'Les procédures de sécurité sont comprises par tous' }
                      ].map((validation) => (
                        <div key={validation.key} className="flex items-start gap-3">
                          <CustomCheckbox
                            checked={formData.validations[validation.key] || false}
                            onChange={(checked) => setFormData(prev => ({
                              ...prev,
                              validations: { ...prev.validations, [validation.key]: checked }
                            }))}
                          />
                          <span className="text-sm text-gray-700">{validation.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approbations */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      Approbations requises
                    </h3>
                    
                    <div className="space-y-4">
                      {formData.approbations.map((approbation, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Rôle:
                              </label>
                              <input
                                type="text"
                                value={approbation.role}
                                onChange={(e) => {
                                  const newApprobations = [...formData.approbations];
                                  newApprobations[index].role = e.target.value;
                                  setFormData(prev => ({ ...prev, approbations: newApprobations }));
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Ex: Superviseur"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nom:
                              </label>
                              <input
                                type="text"
                                value={approbation.nom}
                                onChange={(e) => {
                                  const newApprobations = [...formData.approbations];
                                  newApprobations[index].nom = e.target.value;
                                  setFormData(prev => ({ ...prev, approbations: newApprobations }));
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Nom complet"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Date/Heure:
                              </label>
                              <input
                                type="datetime-local"
                                value={approbation.dateHeure}
                                onChange={(e) => {
                                  const newApprobations = [...formData.approbations];
                                  newApprobations[index].dateHeure = e.target.value;
                                  setFormData(prev => ({ ...prev, approbations: newApprobations }));
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <CustomCheckbox
                              checked={approbation.approuve}
                              onChange={(checked) => {
                                const newApprobations = [...formData.approbations];
                                newApprobations[index].approuve = checked;
                                if (checked) {
                                  newApprobations[index].dateHeure = new Date().toISOString().slice(0, 16);
                                }
                                setFormData(prev => ({ ...prev, approbations: newApprobations }));
                              }}
                              variant="success"
                            />
                            <span className="text-sm text-gray-700">
                              {approbation.approuve ? '✅ Approuvé' : '⏳ En attente d\'approbation'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions finales */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Actions finales
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        onClick={() => generateProfessionalPDF(formData, tenant)}
                        className="btn-primary text-sm flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        PDF C-Secur360
                      </button>
                      
                      <button
                        onClick={() => sendEmailNotification(formData, tenant)}
                        className="btn-secondary text-sm flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Envoyer par email
                      </button>
                      
                      <button
                        onClick={() => archiveAST(formData)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archiver
                      </button>
                      
                      <button
                        onClick={() => submitAST(formData)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Soumettre
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation entre les étapes - Optimisée mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50 gap-4">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      i === currentStep
                        ? 'bg-blue-600 text-white'
                        : i < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  if (currentStep === 7) {
                    // Validation finale et soumission
                    const allValidated = Object.values(formData.validations).every(v => v);
                    const allApproved = formData.approbations.every(a => a.approuve);
                    
                    if (!allValidated || !allApproved) {
                      alert('Toutes les validations et approbations sont requises avant la soumission.');
                      return;
                    }
                    
                    submitAST(formData);
                  } else {
                    setCurrentStep(prev => Math.min(7, prev + 1));
                  }
                }}
                className={`flex items-center gap-2 w-full sm:w-auto justify-center transition-colors ${
                  currentStep === 7 
                    ? 'bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg'
                    : 'btn-primary'
                }`}
              >
                <span>{currentStep === 7 ? 'Finaliser AST' : 'Suivant'}</span>
                {currentStep === 7 ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer mobile sticky */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 p-3 sm:hidden sticky bottom-0">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <span>AST #{formData.numeroAST}</span>
          <span>•</span>
          <span>C-Secur360</span>
          <span>•</span>
          <span>{formData.equipe.length} personnes</span>
        </div>
      </div>
    </div>
  );
};

// Export du composant
export default ASTFormUltraPremium;
