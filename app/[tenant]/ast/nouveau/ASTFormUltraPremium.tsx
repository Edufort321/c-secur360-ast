// =================== AST FORM ULTRA PREMIUM COMPLET - SECTION 1/5 V2 ===================
// Client Potentiel - Version avec Approbations et Checklists
// Section 1: Imports et Interfaces mises à jour

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock
} from 'lucide-react';

// =================== INTERFACES & TYPES COMPLETS ===================
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
  // Nouveaux champs pour approbation avec cadenas selon votre image
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
  // Nouvelle checklist pour points d'isolement selon votre image
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
    projectNumber: string;
    astClientNumber: string;
    workLocation: string;
    workDescription: string;
    estimatedDuration: string;
    workerCount: number;
    clientRepresentative: string;
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
// =================== AST SECTION 2/5 V2 - DONNÉES COMPLÈTES ===================
// Section 2: Données avec TOUS les dangers + PDF professionnel

// =================== MOYENS DE CONTRÔLE PRÉDÉFINIS ===================
const getControlMeasuresForHazard = (hazardId: string): ControlMeasure[] => {
  const commonControls: ControlMeasure[] = [
    {
      id: `ctrl-${hazardId}-elim-1`,
      name: 'Élimination à la source',
      description: 'Retirer complètement le danger',
      category: 'elimination',
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: `ctrl-${hazardId}-sub-1`, 
      name: 'Substitution par alternative plus sûre',
      description: 'Remplacer par une méthode moins dangereuse',
      category: 'substitution',
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: `ctrl-${hazardId}-eng-1`,
      name: 'Mesures d\'ingénierie',
      description: 'Contrôles techniques et d\'ingénierie',
      category: 'engineering',
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: `ctrl-${hazardId}-admin-1`,
      name: 'Contrôles administratifs',
      description: 'Formation, procédures et signalisation',
      category: 'administrative',
      isSelected: false,
      photos: [],
      notes: ''
    },
    {
      id: `ctrl-${hazardId}-ppe-1`,
      name: 'Équipement de protection individuelle',
      description: 'Port d\'EPI approprié',
      category: 'ppe',
      isSelected: false,
      photos: [],
      notes: ''
    }
  ];

  // Moyens de contrôle spécifiques selon le danger
  const specificControls: Record<string, ControlMeasure[]> = {
    'h0': [ // Risque électrique
      {
        id: 'ctrl-h0-spec-1',
        name: 'Coupure électrique et verrouillage',
        description: 'Couper l\'alimentation et verrouiller les disjoncteurs',
        category: 'engineering',
        isSelected: false,
        photos: [],
        notes: ''
      },
      {
        id: 'ctrl-h0-spec-2',
        name: 'Vérification absence de tension',
        description: 'Utiliser un détecteur de tension certifié',
        category: 'administrative',
        isSelected: false,
        photos: [],
        notes: ''
      }
    ],
    'h9': [ // Risque de chute
      {
        id: 'ctrl-h9-spec-1',
        name: 'Garde-corps temporaires',
        description: 'Installation de garde-corps sécuritaires',
        category: 'engineering',
        isSelected: false,
        photos: [],
        notes: ''
      },
      {
        id: 'ctrl-h9-spec-2',
        name: 'Harnais anti-chute',
        description: 'Système complet d\'arrêt de chute',
        category: 'ppe',
        isSelected: false,
        photos: [],
        notes: ''
      }
    ]
  };

  return [...commonControls, ...(specificControls[hazardId] || [])];
};

// =================== LISTE COMPLÈTE DES DANGERS POTENTIELS ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  {
    id: 'h0',
    code: '0',
    title: 'RISQUE ÉLECTRIQUE',
    description: 'Exposition aux tensions électriques dangereuses',
    riskLevel: 'critical',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h0'),
    showControls: false
  },
  {
    id: 'h1',
    code: '1',
    title: 'APPAREILLAGE SOUS-TENSION',
    description: 'Travail à proximité d\'équipement électrique énergisé',
    riskLevel: 'critical',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h1'),
    showControls: false
  },
  {
    id: 'h2',
    code: '2',
    title: 'MACHINE - OUTIL ROTATIF',
    description: 'Risques liés aux outils et machines rotatives',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h2'),
    showControls: false
  },
  {
    id: 'h3',
    code: '3',
    title: 'CIRCUIT SOUS CHARGE CAPACITIVE',
    description: 'Circuits avec charge capacitive résiduelle',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h3'),
    showControls: false
  },
  {
    id: 'h4',
    code: '4',
    title: 'GÉNÉRATRICE (RÉSEAU D\'URGENCE)',
    description: 'Risques liés aux génératrices et réseaux d\'urgence',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h4'),
    showControls: false
  },
  {
    id: 'h5',
    code: '5',
    title: 'CIRCUIT ADJACENT / AUXILIAIRE',
    description: 'Circuits adjacents ou auxiliaires sous tension',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h5'),
    showControls: false
  },
  {
    id: 'h6',
    code: '6',
    title: 'ZONE DE TRAVAIL SUPERPOSÉE',
    description: 'Zones de travail superposées avec d\'autres équipes',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h6'),
    showControls: false
  },
  {
    id: 'h7',
    code: '7',
    title: 'TRAVAIL ISOLÉ ET SEUL',
    description: 'Travail effectué en isolement sans supervision',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h7'),
    showControls: false
  },
  {
    id: 'h8',
    code: '8',
    title: 'TRAVAUX DE LEVAGE',
    description: 'Opérations de levage et manutention',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h8'),
    showControls: false
  },
  {
    id: 'h9',
    code: '9',
    title: 'RISQUE DE CHUTE',
    description: 'Travail en hauteur ou sur surfaces glissantes',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h9'),
    showControls: false
  },
  {
    id: 'h10',
    code: '10',
    title: 'ÉCHELLE / ESCABEAU (3 POINTS D\'APPUI)',
    description: 'Utilisation d\'échelles et escabeaux',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h10'),
    showControls: false
  },
  {
    id: 'h11',
    code: '11',
    title: 'RÉALIMENTATION PARTIELLE DURANT TRAVAUX',
    description: 'Réalimentation partielle pendant les travaux',
    riskLevel: 'critical',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h11'),
    showControls: false
  },
  {
    id: 'h12',
    code: '12',
    title: 'PRODUITS CHIMIQUES',
    description: 'Exposition à des substances chimiques dangereuses',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h12'),
    showControls: false
  },
  {
    id: 'h13',
    code: '13',
    title: 'ZONE DE TRAVAIL PARTAGÉE (CO-ACTIVITÉ)',
    description: 'Zones de travail partagées avec d\'autres activités',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h13'),
    showControls: false
  },
  {
    id: 'h14',
    code: '14',
    title: 'ÉTAT DES LIEUX',
    description: 'Évaluation de l\'état et des conditions du lieu de travail',
    riskLevel: 'low',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h14'),
    showControls: false
  },
  {
    id: 'h15',
    code: '15',
    title: 'ERGONOMIE',
    description: 'Risques ergonomiques et postures de travail',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h15'),
    showControls: false
  },
  {
    id: 'h16',
    code: '16',
    title: 'ÉCLAIRAGE',
    description: 'Éclairage insuffisant ou inadéquat',
    riskLevel: 'low',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h16'),
    showControls: false
  },
  {
    id: 'h17',
    code: '17',
    title: 'LIGNE DE TIR',
    description: 'Risques liés aux lignes de tir et projections',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h17'),
    showControls: false
  },
  {
    id: 'h18',
    code: '18',
    title: 'DÉVERSEMENT',
    description: 'Risques de déversement de liquides dangereux',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h18'),
    showControls: false
  },
  {
    id: 'h19',
    code: '19',
    title: 'TRAVAUX EN ESPACE CLOS (REMPLIR LE FORMULAIRE)',
    description: 'Travail dans des espaces confinés',
    riskLevel: 'critical',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h19'),
    showControls: false
  },
  {
    id: 'h20',
    code: '20',
    title: 'TRAVAIL À CHAUD',
    description: 'Travaux à chaud avec risque d\'incendie',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h20'),
    showControls: false
  },
  {
    id: 'h21',
    code: '21',
    title: 'LIGNE ÉLECTRIQUE À PROXIMITÉ',
    description: 'Travail à proximité de lignes électriques',
    riskLevel: 'critical',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h21'),
    showControls: false
  },
  {
    id: 'h22',
    code: '22',
    title: 'CLIMAT (VENT, PLUIE, BRUME, GLACE ET NEIGE)',
    description: 'Conditions climatiques défavorables',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h22'),
    showControls: false
  },
  {
    id: 'h23',
    code: '23',
    title: 'CONTRAINTE THERMIQUE',
    description: 'Exposition à des températures extrêmes',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h23'),
    showControls: false
  },
  {
    id: 'h24',
    code: '24',
    title: 'CO-ACTIVITÉ AVEC ENGIN MOTORISÉ (CHARIOT ÉLÉVATEUR, ETC.)',
    description: 'Travail avec des engins motorisés',
    riskLevel: 'high',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h24'),
    showControls: false
  },
  {
    id: 'h25',
    code: '25',
    title: 'AUTRE',
    description: 'Autres dangers non listés ci-dessus',
    riskLevel: 'medium',
    isSelected: false,
    controlMeasures: getControlMeasuresForHazard('h25'),
    showControls: false
  }
];

// =================== ÉQUIPEMENTS DE SÉCURITÉ ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  { id: 'eq1', name: 'Casque de sécurité', required: true, available: false, notes: '', verified: false, category: 'head' },
  { id: 'eq2', name: 'Bottes de sécurité', required: true, available: false, notes: '', verified: false, category: 'foot' },
  { id: 'eq3', name: 'Lunettes de protection', required: true, available: false, notes: '', verified: false, category: 'eye' },
  { id: 'eq4', name: 'Lunettes monocoque', required: false, available: false, notes: '', verified: false, category: 'eye' },
  { id: 'eq5', name: 'Visière', required: false, available: false, notes: '', verified: false, category: 'eye' },
  { id: 'eq6', name: 'Gants', required: true, available: false, notes: '', verified: false, category: 'hand' },
  { id: 'eq7', name: 'Gants anti-coupures', required: false, available: false, notes: '', verified: false, category: 'hand' },
  { id: 'eq8', name: 'Détecteur de tension', required: true, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq9', name: 'Mise à la terre (MALT)', required: false, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq10', name: 'Cadenas individuels / collectifs (boîte)', required: true, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq11', name: 'Affiches et rubans (périmètre de sécurité)', required: true, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq12', name: 'EPI énergie incidente de moins de 1.2 cal/cm²', required: false, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq13', name: 'EPI énergie incidente de 1.2 cal/cm² à 12 cal/cm²', required: false, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq14', name: 'EPI énergie incidente plus grand que 12 cal/cm²', required: false, available: false, notes: '', verified: false, category: 'electrical' },
  { id: 'eq15', name: 'Dossard', required: false, available: false, notes: '', verified: false, category: 'body' },
  { id: 'eq16', name: 'Protection auditive', required: false, available: false, notes: '', verified: false, category: 'respiratory' },
  { id: 'eq17', name: 'Protection respiratoire (rasage de près)', required: false, available: false, notes: '', verified: false, category: 'respiratory' },
  { id: 'eq18', name: 'Harnais anti-chutes', required: false, available: false, notes: '', verified: false, category: 'fall' },
  { id: 'eq19', name: 'Détecteur quatre (4) gaz', required: false, available: false, notes: '', verified: false, category: 'detection' },
  { id: 'eq20', name: 'Prise avec protection GFI', required: false, available: false, notes: '', verified: false, category: 'electrical' }
];

// =================== DISCUSSIONS D'ÉQUIPE ===================
const predefinedDiscussions: TeamDiscussion[] = [
  { id: 'td1', topic: 'Trousse de premiers soins', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'td2', topic: 'Matériel de contrôle de déversement', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'td3', topic: 'Évacuation, point de rassemblement', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'td4', topic: 'Extincteur portatif', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'td5', topic: 'Douche d\'urgence / Bain oculaire', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'td6', topic: 'Sécurité désigné / Infirmerie au site', notes: '', completed: false, discussedBy: '', priority: 'medium' },
  { id: 'td7', topic: 'Plan d\'intervention d\'urgence', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'td8', topic: 'EPI', notes: '', completed: false, discussedBy: '', priority: 'high' },
  { id: 'td9', topic: 'Emplacement des pauses', notes: '', completed: false, discussedBy: '', priority: 'low' }
];

// =================== PROCÉDURES D'URGENCE ===================
const emergencyProcedures: EmergencyProcedure[] = [
  { id: 'ep1', type: 'medical', procedure: 'Premiers secours et évacuation médicale', responsiblePerson: '', contactInfo: '911', isVerified: false },
  { id: 'ep2', type: 'fire', procedure: 'Extinction et évacuation incendie', responsiblePerson: '', contactInfo: '911', isVerified: false },
  { id: 'ep3', type: 'electrical', procedure: 'Coupure d\'urgence électrique', responsiblePerson: '', contactInfo: '', isVerified: false }
];

// =================== LOGO CLIENT POTENTIEL EN SVG ===================
const ClientPotentielLogo = () => (
  <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    {/* Bouclier principal */}
    <path
      d="M60 5 L85 15 L85 35 Q85 50 60 65 Q35 50 35 35 L35 15 Z"
      fill="url(#shieldGradient)"
      stroke="#ffffff"
      strokeWidth="2"
    />
    
    {/* Lettre C */}
    <path
      d="M50 25 Q45 20 40 25 Q40 30 40 35 Q40 40 45 45 Q50 50 55 45"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
    />
    
    {/* Éléments décoratifs */}
    <circle cx="70" cy="30" r="3" fill="#ffaa00"/>
    <circle cx="68" cy="38" r="2" fill="#ffaa00"/>
    <circle cx="72" cy="42" r="2" fill="#ffaa00"/>
    
    {/* Définition du gradient */}
    <defs>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af"/>
        <stop offset="50%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#1e293b"/>
      </linearGradient>
    </defs>
    
    {/* Texte Client Potentiel */}
    <text x="60" y="75" textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">
      CLIENT POTENTIEL
    </text>
  </svg>
);

// =================== GÉNÉRATION PDF PROFESSIONNELLE ===================
const generateProfessionalPDF = async (formData: ASTFormData, tenant: Tenant) => {
  console.log('🔄 Génération PDF professionnel avec logo Client Potentiel...');
  
  try {
    // Template HTML professionnel pour PDF
    const pdfTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AST ${formData.astNumber} - ${formData.projectInfo.client}</title>
        <style>
          @page { 
            size: letter; 
            margin: 0.75in; 
            @top-left { content: "AST ${formData.astNumber}"; }
            @bottom-center { content: "Page " counter(page) " de " counter(pages); }
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            font-size: 11px; 
            line-height: 1.3; 
            color: #333;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .company-info h1 {
            color: #1e40af;
            font-size: 24px;
            margin: 0;
            font-weight: bold;
          }
          
          .company-info p {
            margin: 2px 0;
            color: #666;
            font-size: 12px;
          }
          
          .ast-info {
            text-align: right;
            background: #f8fafc;
            padding: 10px;
            border-radius: 8px;
            border-left: 4px solid #1e40af;
          }
          
          .ast-number {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            font-family: monospace;
          }
          
          .section {
            margin: 20px 0;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: linear-gradient(90deg, #1e40af, #3b82f6);
            color: white;
            padding: 8px 15px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 10px 0;
          }
          
          .field {
            margin: 8px 0;
          }
          
          .field-label {
            font-weight: bold;
            color: #1e40af;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .field-value {
            margin-top: 2px;
            padding: 4px;
            background: #f8fafc;
            border-radius: 3px;
            min-height: 20px;
          }
          
          .hazard-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
          }
          
          .hazard-item {
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
            background: white;
          }
          
          .hazard-selected {
            border-left: 4px solid #ef4444;
            background: #fef2f2;
          }
          
          .hazard-code {
            background: #ef4444;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 5px;
          }
          
          .equipment-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          
          .equipment-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 10px;
          }
          
          .check-box {
            width: 12px;
            height: 12px;
            border: 1px solid #666;
            display: inline-block;
            position: relative;
          }
          
          .checked::after {
            content: '✓';
            position: absolute;
            left: 1px;
            top: -2px;
            color: #22c55e;
            font-weight: bold;
            font-size: 10px;
          }
          
          .team-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          
          .team-table th,
          .team-table td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
            font-size: 10px;
          }
          
          .team-table th {
            background: #1e40af;
            color: white;
            font-weight: bold;
          }
          
          .status-approved { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-size: 10px;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          
          .signature-box {
            border: 1px solid #e2e8f0;
            padding: 15px;
            min-height: 80px;
            text-align: center;
            background: #f8fafc;
          }
        </style>
      </head>
      <body>
        <!-- HEADER AVEC LOGO -->
        <div class="header">
          <div class="logo-section">
            ${ClientPotentielLogo().props.dangerouslySetInnerHTML ? ClientPotentielLogo().props.dangerouslySetInnerHTML.__html : ''}
            <div class="company-info">
              <h1>ANALYSE SÉCURITAIRE DE TÂCHES</h1>
              <p><strong>Client:</strong> ${tenant.companyName}</p>
              <p><strong>Projet:</strong> ${formData.projectInfo.projectNumber}</p>
              <p><strong>Date:</strong> ${new Date(formData.projectInfo.date).toLocaleDateString('fr-CA')}</p>
            </div>
          </div>
          <div class="ast-info">
            <div class="ast-number">${formData.astNumber}</div>
            <p>Statut: ${formData.status.toUpperCase()}</p>
            <p>Révision: ${formData.validation.revisionNumber}</p>
          </div>
        </div>

        <!-- INFORMATIONS GÉNÉRALES -->
        <div class="section">
          <div class="section-title">📋 INFORMATIONS GÉNÉRALES</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Client</div>
              <div class="field-value">${formData.projectInfo.client || 'Non spécifié'}</div>
            </div>
            <div class="field">
              <div class="field-label">Numéro de Projet</div>
              <div class="field-value">${formData.projectInfo.projectNumber || 'Non spécifié'}</div>
            </div>
            <div class="field">
              <div class="field-label">Lieu des Travaux</div>
              <div class="field-value">${formData.projectInfo.workLocation || 'Non spécifié'}</div>
            </div>
            <div class="field">
              <div class="field-label">Durée Estimée</div>
              <div class="field-value">${formData.projectInfo.estimatedDuration || 'Non spécifié'}</div>
            </div>
          </div>
          <div class="field">
            <div class="field-label">Description des Travaux</div>
            <div class="field-value">${formData.projectInfo.workDescription || 'Non spécifiée'}</div>
          </div>
        </div>

        <!-- DANGERS IDENTIFIÉS -->
        <div class="section">
          <div class="section-title">⚠️ DANGERS POTENTIELS IDENTIFIÉS</div>
          <div class="hazard-list">
            ${formData.electricalHazards.filter(h => h.isSelected).map(hazard => `
              <div class="hazard-item hazard-selected">
                <div class="hazard-code">${hazard.code}</div>
                <strong>${hazard.title}</strong>
                <p>${hazard.description}</p>
                ${hazard.additionalNotes ? `<p><em>Notes: ${hazard.additionalNotes}</em></p>` : ''}
              </div>
            `).join('')}
          </div>
          ${formData.electricalHazards.filter(h => h.isSelected).length === 0 ? '<p>Aucun danger identifié.</p>' : ''}
        </div>

        <!-- ÉQUIPEMENTS DE SÉCURITÉ -->
        <div class="section">
          <div class="section-title">🛡️ ÉQUIPEMENTS DE SÉCURITÉ REQUIS</div>
          <div class="equipment-grid">
            ${formData.safetyEquipment.filter(eq => eq.required).map(equipment => `
              <div class="equipment-item">
                <span class="check-box ${equipment.verified ? 'checked' : ''}"></span>
                ${equipment.name}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ÉQUIPE DE TRAVAIL -->
        <div class="section">
          <div class="section-title">👥 ÉQUIPE DE TRAVAIL</div>
          <table class="team-table">
            <thead>
              <tr>
                <th>Nom du Travailleur</th>
                <th>Département</th>
                <th>Consultation AST</th>
                <th>Cadenas Apposé</th>
                <th>Cadenas Relevé</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${formData.team.members.map(member => `
                <tr>
                  <td>${member.name}</td>
                  <td>${member.department}</td>
                  <td><span class="check-box ${member.consultationAst ? 'checked' : ''}"></span></td>
                  <td><span class="check-box ${member.cadenasAppose ? 'checked' : ''}"></span></td>
                  <td><span class="check-box ${member.cadenasReleve ? 'checked' : ''}"></span></td>
                  <td class="status-${member.validationStatus}">
                    ${member.validationStatus === 'approved' ? 'Approuvé' : 
                      member.validationStatus === 'rejected' ? 'Rejeté' : 'En attente'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- POINTS D'ISOLEMENT -->
        ${formData.isolationPoints.length > 0 ? `
        <div class="section">
          <div class="section-title">⚙️ POINTS D'ISOLEMENT</div>
          ${formData.isolationPoints.map(point => `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
              <strong>${point.name} (${point.type})</strong>
              <div style="margin-top: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div>
                  <span class="check-box ${point.checklist.cadenasAppose ? 'checked' : ''}"></span>
                  Cadenas Apposé
                </div>
                <div>
                  <span class="check-box ${point.checklist.absenceTension ? 'checked' : ''}"></span>
                  Absence de Tension
                </div>
                <div>
                  <span class="check-box ${point.checklist.miseALaTerre ? 'checked' : ''}"></span>
                  Mise à la Terre
                </div>
                <div>
                  <span class="check-box ${point.checklist.cadenasReleve ? 'checked' : ''}"></span>
                  Cadenas Relevé
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- SIGNATURES -->
        <div class="section">
          <div class="section-title">✅ VALIDATION ET SIGNATURES</div>
          <div class="signature-section">
            <div class="signature-box">
              <strong>Superviseur</strong><br>
              ${formData.team.supervisor || '_________________'}<br><br>
              Signature: ________________<br>
              Date: ${formData.validation.completedDate || '________________'}
            </div>
            <div class="signature-box">
              <strong>Révisé par</strong><br>
              ${formData.validation.reviewedBy || '_________________'}<br><br>
              Signature: ________________<br>
              Date: ${formData.validation.reviewedDate || '________________'}
            </div>
            <div class="signature-box">
              <strong>Approuvé par</strong><br>
              ${formData.validation.approvedBy || '_________________'}<br><br>
              Signature: ________________<br>
              Date: ${formData.validation.approvedDate || '________________'}
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p><strong>Client Potentiel</strong> - Analyse Sécuritaire de Tâches</p>
          <p>Document généré le ${new Date().toLocaleString('fr-CA')} | AST ${formData.astNumber}</p>
          <p>Ce document est confidentiel et propriétaire.</p>
        </div>
      </body>
      </html>
    `;

    // Simulation de génération PDF (en production, utilisez une librairie comme jsPDF + html2canvas ou puppeteer)
    console.log('📄 Template PDF généré:', pdfTemplate.length, 'caractères');
    
    // Ici vous pourriez utiliser:
    // - html2pdf.js pour conversion côté client
    // - API backend avec Puppeteer pour PDF serveur
    // - Service PDF tiers comme PDFShift
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulation de téléchargement
    const blob = new Blob([pdfTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AST-${formData.astNumber}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF professionnel généré avec succès!');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    return false;
  }
};

// =================== FONCTIONS EMAIL PROFESSIONNELLES ===================
const sendByEmail = async (formData: ASTFormData, tenant: Tenant, language: string) => {
  const t = translations[language as keyof typeof translations];
  
  try {
    console.log('📧 Envoi email professionnel...');
    
    const emailData = {
      to: formData.projectInfo.clientRepresentative || 'client@example.com',
      subject: `AST ${formData.astNumber} - ${formData.projectInfo.client}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .highlight { background: #fef3c7; padding: 8px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Client Potentiel</h1>
            <p>Analyse Sécuritaire de Tâches</p>
          </div>
          
          <div class="content">
            <h2>AST ${formData.astNumber} - ${formData.projectInfo.client}</h2>
            
            <div class="highlight">
              <strong>Projet:</strong> ${formData.projectInfo.projectNumber}<br>
              <strong>Date:</strong> ${new Date(formData.projectInfo.date).toLocaleDateString('fr-CA')}<br>
              <strong>Statut:</strong> ${formData.status.toUpperCase()}
            </div>
            
            <p>Bonjour,</p>
            
            <p>Veuillez trouver ci-joint l'Analyse Sécuritaire de Tâches pour le projet <strong>${formData.projectInfo.projectNumber}</strong>.</p>
            
            <h3>Résumé:</h3>
            <ul>
              <li><strong>Dangers identifiés:</strong> ${formData.electricalHazards.filter(h => h.isSelected).length}</li>
              <li><strong>Équipe validée:</strong> ${formData.team.members.filter(m => m.validationStatus === 'approved').length}/${formData.team.members.length} membres</li>
              <li><strong>Points d'isolement:</strong> ${formData.isolationPoints.length}</li>
              <li><strong>Documentation:</strong> ${formData.documentation.photos.length} photos</li>
            </ul>
            
            <p>Cette AST a été ${formData.validation.finalApproval ? 'approuvée' : 'préparée'} et est prête pour révision.</p>
            
            <p>Cordialement,<br>
            <strong>Équipe Client Potentiel</strong></p>
          </div>
          
          <div class="footer">
            <p>Client Potentiel - Solutions de sécurité industrielle</p>
            <p>Ce message est confidentiel et destiné uniquement au destinataire.</p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `AST-${formData.astNumber}.pdf`,
          content: 'PDF_CONTENT_PLACEHOLDER' // En production, attachez le vrai PDF
        }
      ]
    };
    
    // Simulation d'envoi email (en production, utilisez un service comme SendGrid, Nodemailer, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Email envoyé:', emailData.to);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Nouvelle Analyse Sécuritaire de Tâches",
    subtitle: "Formulaire adaptatif conforme aux normes SST",
    saving: "Sauvegarde en cours...",
    saved: "✅ Sauvegardé avec succès",
    
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
      projectNumber: "Numéro de Projet",
      workDescription: "Description des Travaux",
      workLocation: "Lieu des Travaux",
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
      cadenasReleve: "Cadenas Relevé"
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
        miseALaTerre: "Mise à la Terre",
        cadenasReleve: "Cadenas Relevé"
      }
    },
    
    actions: {
      sendByEmail: "Envoyer par Courriel",
      archive: "Archiver",
      generatePDF: "Générer PDF",
      print: "Imprimer",
      finalApproval: "Approbation Finale"
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
      projectNumber: "Project Number",
      workDescription: "Work Description",
      workLocation: "Work Location",
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
      consultationAst: "AST Consultation",
      cadenasAppose: "Lock Applied",
      cadenasReleve: "Lock Removed"
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
        miseALaTerre: "Grounded",
        cadenasReleve: "Lock Removed"
      }
    },
    
    actions: {
      sendByEmail: "Send by Email",
      archive: "Archive",
      generatePDF: "Generate PDF",
      print: "Print",
      finalApproval: "Final Approval"
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

// =================== DONNÉES INITIALES MISES À JOUR ===================
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
    projectNumber: '',
    astClientNumber: '',
    workLocation: '',
    workDescription: '',
    estimatedDuration: '',
    workerCount: 1,
    clientRepresentative: '',
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
// =================== AST SECTION 3/5 V2 - STYLES & FONCTIONS ===================
// Section 3: Styles CSS Premium et Fonctions Supabase mises à jour

// =================== STYLES CSS PREMIUM AVEC NOUVELLES FONCTIONNALITÉS ===================
const premiumStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .form-container {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }
  
  .form-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .glass-effect {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
  }
  
  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 16px;
    border: 1px solid rgba(100, 116, 139, 0.2);
    flex-wrap: wrap;
  }
  
  .step-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    background: rgba(51, 65, 85, 0.3);
    border: 1px solid rgba(100, 116, 139, 0.2);
    min-width: 160px;
    justify-content: center;
  }
  
  .step-item.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #3b82f6;
    transform: scale(1.05);
  }
  
  .step-item.completed {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-color: #22c55e;
  }
  
  .input-premium {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    padding: 14px 18px;
    color: white;
    font-size: 14px;
    transition: all 0.3s ease;
    width: 100%;
  }
  
  .input-premium:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(30, 41, 59, 0.9);
  }
  
  .input-premium::placeholder {
    color: #64748b;
  }
  
  .btn-premium {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .btn-premium:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
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
  }
  
  .btn-secondary:hover {
    background: rgba(100, 116, 139, 0.3);
    transform: translateY(-2px);
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .btn-success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }
  
  /* NOUVEAUX STYLES POUR APPROBATIONS */
  .approval-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 12px;
    overflow: hidden;
    margin: 16px 0;
  }
  
  .approval-table th {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .approval-table td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid rgba(100, 116, 139, 0.2);
    color: #e2e8f0;
  }
  
  .approval-table tr:hover {
    background: rgba(51, 65, 85, 0.3);
  }
  
  .worker-name-cell {
    text-align: left !important;
    font-weight: 600;
    color: white;
  }
  
  /* STYLES POUR CHECKLIST ISOLATION */
  .isolation-checklist {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 16px 0;
    padding: 16px;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(100, 116, 139, 0.3);
  }
  
  .checklist-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .checklist-item:hover {
    background: rgba(51, 65, 85, 0.3);
  }
  
  .checklist-item.completed {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  .checkbox-premium {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(100, 116, 139, 0.5);
    border-radius: 6px;
    background: rgba(30, 41, 59, 0.8);
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .checkbox-premium.checked {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #3b82f6;
  }
  
  .checkbox-premium.checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }
  
  /* STYLES POUR CADENAS */
  .lock-icon {
    transition: all 0.3s ease;
  }
  
  .lock-icon.locked {
    color: #ef4444;
  }
  
  .lock-icon.unlocked {
    color: #22c55e;
  }
  
  .lock-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }
  
  .lock-button:hover {
    background: rgba(100, 116, 139, 0.2);
  }
  
  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .equipment-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  
  .equipment-item:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
  }
  
  .equipment-item.required {
    border-left: 4px solid #f59e0b;
  }
  
  .equipment-item.verified {
    border-left: 4px solid #22c55e;
  }
  
  .hazard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .hazard-item {
    padding: 20px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .hazard-item.selected {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
  }
  
  .hazard-item.critical {
    border-left: 4px solid #dc2626;
  }
  
  .hazard-item.high {
    border-left: 4px solid #f59e0b;
  }
  
  .hazard-item.medium {
    border-left: 4px solid #eab308;
  }
  
  .hazard-item.low {
    border-left: 4px solid #22c55e;
  }
  
  .discussion-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.3s ease;
  }
  
  .discussion-item.completed {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
  }
  
  .discussion-item.high-priority {
    border-left: 4px solid #ef4444;
  }
  
  .discussion-item.medium-priority {
    border-left: 4px solid #f59e0b;
  }
  
  .discussion-item.low-priority {
    border-left: 4px solid #22c55e;
  }
  
  .save-indicator {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 1000;
    padding: 12px 20px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .save-indicator.saving {
    background: rgba(251, 191, 36, 0.9);
    color: #92400e;
  }
  
  .save-indicator.saved {
    background: rgba(34, 197, 94, 0.9);
    color: white;
  }
  
  .save-indicator.error {
    background: rgba(239, 68, 68, 0.9);
    color: white;
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #22c55e 100%);
    transition: width 0.5s ease;
    border-radius: 8px;
  }
  
  .company-logo {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 20px;
  }
  
  /* ANIMATIONS AMÉLIORÉES */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes checkmark {
    0% { transform: scale(0) rotate(45deg); }
    50% { transform: scale(1.2) rotate(45deg); }
    100% { transform: scale(1) rotate(45deg); }
  }
  
  @keyframes lockSpin {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(10deg); }
    75% { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
  }
  
  .slide-in {
    animation: slideInUp 0.5s ease-out;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  .checkbox-premium.checked::after {
    animation: checkmark 0.3s ease-out;
  }
  
  .lock-icon.locked {
    animation: lockSpin 0.5s ease-out;
  }
  
  /* STYLES RESPONSIVE */
  @media (max-width: 768px) {
    .step-indicator {
      gap: 4px;
      padding: 16px;
    }
    
    .step-item {
      padding: 8px 12px;
      font-size: 12px;
      min-width: 120px;
    }
    
    .glass-effect {
      margin: 16px;
      padding: 20px;
    }
    
    .equipment-grid {
      grid-template-columns: 1fr;
    }
    
    .hazard-grid {
      grid-template-columns: 1fr;
    }
    
    .approval-table {
      font-size: 12px;
    }
    
    .approval-table th,
    .approval-table td {
      padding: 8px 4px;
    }
    
    .isolation-checklist {
      grid-template-columns: 1fr;
    }
  }
  
  /* STYLES POUR IMPRESSION */
  @media print {
    .form-container {
      background: white;
    }
    
    .glass-effect {
      background: white;
      box-shadow: none;
      border: 1px solid #ccc;
    }
    
    .btn-premium,
    .btn-secondary,
    .save-indicator {
      display: none;
    }
    
    .step-indicator {
      display: none;
    }
  }
`;

// =================== FONCTIONS SUPABASE MISES À JOUR ===================
const saveToSupabase = async (formData: ASTFormData) => {
  try {
    console.log('💾 Sauvegarde Supabase en cours...', formData.astNumber);
    
    // Structure de données pour Supabase
    const supabaseData = {
      id: formData.id,
      ast_number: formData.astNumber,
      created_at: formData.created,
      updated_at: new Date().toISOString(),
      status: formData.status,
      language: formData.language,
      industry: formData.industry,
      
      // Informations projet
      project_info: formData.projectInfo,
      
      // Discussions équipe
      team_discussion: formData.teamDiscussion,
      
      // Équipements de sécurité
      safety_equipment: formData.safetyEquipment,
      
      // Dangers avec moyens de contrôle
      electrical_hazards: formData.electricalHazards,
      
      // Équipe avec approbations
      team: {
        ...formData.team,
        members: formData.team.members.map(member => ({
          ...member,
          // S'assurer que les nouveaux champs sont présents
          consultationAst: member.consultationAst || false,
          cadenasAppose: member.cadenasAppose || false,
          cadenasReleve: member.cadenasReleve || false
        }))
      },
      
      // Points d'isolement avec checklist
      isolation_points: formData.isolationPoints.map(point => ({
        ...point,
        // S'assurer que la checklist est présente
        checklist: point.checklist || {
          cadenasAppose: false,
          absenceTension: false,
          miseALaTerre: false,
          cadenasReleve: false
        }
      })),
      
      // Documentation
      documentation: formData.documentation,
      
      // Validation
      validation: formData.validation,
      
      // Métadonnées pour recherche et tri
      client_name: formData.projectInfo.client,
      project_number: formData.projectInfo.projectNumber,
      work_location: formData.projectInfo.workLocation,
      hazards_count: formData.electricalHazards.filter(h => h.isSelected).length,
      team_size: formData.team.members.length,
      approved_members: formData.team.members.filter(m => m.validationStatus === 'approved').length,
      photos_count: formData.documentation.photos.length,
      isolation_points_count: formData.isolationPoints.length
    };
    
    // En production, remplacez par votre client Supabase
    /*
    const { data, error } = await supabase
      .from('ast_forms')
      .upsert(supabaseData, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    // Sauvegarde des photos séparément si nécessaire
    if (formData.documentation.photos.length > 0) {
      const { data: photoData, error: photoError } = await supabase
        .from('ast_photos')
        .upsert(
          formData.documentation.photos.map(photo => ({
            id: photo.id,
            ast_id: formData.id,
            name: photo.name,
            data: photo.data,
            description: photo.description,
            timestamp: photo.timestamp,
            category: photo.category
          }))
        );
      
      if (photoError) {
        console.error('Erreur sauvegarde photos:', photoError);
      }
    }
    
    console.log('✅ Sauvegarde Supabase réussie:', data);
    */
    
    // Simulation temporaire avec localStorage pour test
    localStorage.setItem(`ast_${formData.id}`, JSON.stringify(supabaseData));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Sauvegarde Supabase simulée réussie');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde Supabase:', error);
    return false;
  }
};

const archiveToSupabase = async (formData: ASTFormData, tenant: Tenant) => {
  try {
    console.log('📦 Archivage Supabase en cours...', formData.astNumber);
    
    const archivedData: ASTFormData = {
      ...formData,
      status: 'archived',
      validation: {
        ...formData.validation,
        archivedDate: new Date().toISOString()
      }
    };
    
    // Archivage avec métadonnées supplémentaires
    const archiveData = {
      ...archivedData,
      archived_at: new Date().toISOString(),
      archived_by: tenant.companyName,
      final_status: archivedData.status,
      completion_percentage: calculateOverallCompletion(archivedData),
      summary: {
        client: archivedData.projectInfo.client,
        project: archivedData.projectInfo.projectNumber,
        dangers_identified: archivedData.electricalHazards.filter(h => h.isSelected).length,
        team_approved: archivedData.team.members.filter(m => m.validationStatus === 'approved').length,
        isolation_points: archivedData.isolationPoints.length,
        photos_attached: archivedData.documentation.photos.length,
        final_approval: archivedData.validation.finalApproval
      }
    };
    
    // En production:
    /*
    const { data, error } = await supabase
      .from('ast_archives')
      .insert(archiveData);
    
    if (error) throw error;
    
    // Optionnel: déplacer vers table d'archive et supprimer de la table active
    const { error: deleteError } = await supabase
      .from('ast_forms')
      .delete()
      .eq('id', formData.id);
    
    if (deleteError) {
      console.error('Erreur suppression après archivage:', deleteError);
    }
    */
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.setItem(`ast_archive_${formData.id}`, JSON.stringify(archiveData));
    
    console.log('✅ Archivage Supabase réussi');
    return archivedData;
    
  } catch (error) {
    console.error('❌ Erreur archivage Supabase:', error);
    throw error;
  }
};

// =================== FONCTION DE CALCUL DE COMPLETION ===================
const calculateOverallCompletion = (formData: ASTFormData): number => {
  let totalFields = 0;
  let completedFields = 0;
  
  // Informations de base (25%)
  const basicFields = [
    formData.projectInfo.client,
    formData.projectInfo.projectNumber,
    formData.projectInfo.workLocation,
    formData.projectInfo.workDescription
  ];
  totalFields += basicFields.length;
  completedFields += basicFields.filter(field => field?.trim()).length;
  
  // Discussions d'équipe (15%)
  const discussions = formData.teamDiscussion.discussions;
  totalFields += discussions.length;
  completedFields += discussions.filter(d => d.completed).length;
  
  // Équipements requis (15%)
  const requiredEquipment = formData.safetyEquipment.filter(eq => eq.required);
  totalFields += requiredEquipment.length;
  completedFields += requiredEquipment.filter(eq => eq.verified).length;
  
  // Dangers identifiés (20%)
  const selectedHazards = formData.electricalHazards.filter(h => h.isSelected);
  if (selectedHazards.length > 0) {
    totalFields += 1;
    completedFields += 1;
  }
  
  // Équipe validée (15%)
  const teamMembers = formData.team.members;
  totalFields += teamMembers.length;
  completedFields += teamMembers.filter(m => m.validationStatus === 'approved').length;
  
  // Documentation (10%)
  if (formData.documentation.photos.length > 0) {
    totalFields += 1;
    completedFields += 1;
  }
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

// =================== COMPOSANT CARROUSEL PHOTOS AMÉLIORÉ ===================
const PhotoCarousel = ({ photos, onAddPhoto, onRemovePhoto, onUpdateDescription }: {
  photos: Photo[];
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (photoId: string) => void;
  onUpdateDescription: (photoId: string, description: string) => void;
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Validation du fichier
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        alert('La taille du fichier ne peut pas dépasser 10MB');
        setIsUploading(false);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Seules les images sont acceptées');
        setIsUploading(false);
        return;
      }
      
      try {
        await onAddPhoto(file);
      } catch (error) {
        console.error('Erreur upload photo:', error);
        alert('Erreur lors de l\'ajout de la photo');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0',
      border: '1px solid rgba(100, 116, 139, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
          📸 Photos ({photos.length})
        </h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-premium"
          style={{ padding: '8px 16px', fontSize: '12px' }}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="pulse" style={{ width: '14px', height: '14px', marginRight: '8px' }}>⏳</div>
              Upload...
            </>
          ) : (
            <>
              <Plus style={{ width: '14px', height: '14px' }} />
              Ajouter Photo
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {photos.length > 0 ? (
        <div style={{ position: 'relative' }}>
          <img
            src={photos[currentPhotoIndex].data}
            alt={photos[currentPhotoIndex].name}
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover', 
              borderRadius: '8px',
              border: '1px solid rgba(100, 116, 139, 0.3)'
            }}
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={nextPhoto}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '16px',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
              >
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </>
          )}

          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {currentPhotoIndex + 1} / {photos.length}
          </div>

          <button
            onClick={() => onRemovePhoto(photos[currentPhotoIndex].id)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(239, 68, 68, 0.9)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>

          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              className="input-premium"
              placeholder="Description de la photo..."
              value={photos[currentPhotoIndex].description}
              onChange={(e) => onUpdateDescription(photos[currentPhotoIndex].id, e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          border: '2px dashed rgba(100, 116, 139, 0.3)',
          borderRadius: '8px',
          color: '#64748b'
        }}>
          📷 Aucune photo ajoutée<br/>
          <small>Formats acceptés: JPG, PNG, GIF (max 10MB)</small>
        </div>
      )}
    </div>
  );
};
// =================== AST SECTION 4/5 V2 - COMPOSANT PRINCIPAL ===================
// Section 4: Composant principal avec nouvelles fonctionnalités d'approbation

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

  // ========== NOUVELLES FONCTIONS ÉQUIPE AVEC APPROBATIONS ==========
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
        // Nouveaux champs d'approbation
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

  const toggleCadenasReleve = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, cadenasReleve: !m.cadenasReleve }
            : m
        )
      }
    }));
  };

  const validateTeamMember = (memberId: string, approved: boolean, comments: string) => {
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
          allApproved
        }
      };
    });
  };

  // ========== NOUVELLES FONCTIONS POINTS D'ISOLEMENT AVEC CHECKLIST ==========
  const addIsolationPoint = () => {
    if (newIsolationPoint.name?.trim() && newIsolationPoint.type) {
      const point: IsolationPoint = {
        id: `isolation-${Date.now()}`,
        name: newIsolationPoint.name.trim(),
        type: newIsolationPoint.type,
        isActive: true,
        createdAt: new Date().toISOString(),
        photos: [],
        // Nouvelle checklist
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

  const addPhotoToIsolationPoint = (pointId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
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
    };
    reader.readAsDataURL(file);
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

  // ========== FONCTIONS DANGERS CORRIGÉES ==========
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

  // ========== FONCTIONS PHOTOS ==========
  const addPhoto = (file: File) => {
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
          window.location.href = `/${tenant.subdomain}/dashboard`;
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
  const LockButton = ({ locked, onToggle, memberId }: { locked: boolean; onToggle: () => void; memberId: string }) => (
    <button
      onClick={onToggle}
      className="lock-button"
      title={locked ? 'Cadenas posé' : 'Cadenas non posé'}
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
  // =================== AST SECTION 5/5 V2 FINALE - JSX RENDER COMPLET ===================
// Section 5: Rendu JSX final avec compteurs de personnes et approbations

  return (
    <>
      {/* CSS PREMIUM INTÉGRÉ */}
      <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />

      <div className="form-container">
        {/* Indicateur de sauvegarde */}
        {saveStatus !== 'idle' && (
          <div className={`save-indicator ${saveStatus}`}>
            {saveStatus === 'saving' && (
              <>
                <div className="pulse" style={{ display: 'inline-block', marginRight: '8px' }}>💾</div>
                {t.saving}
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                {t.saved}
                {lastSaveTime && ` • ${lastSaveTime}`}
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <X style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Erreur de sauvegarde
              </>
            )}
          </div>
        )}

        {/* Header avec logo Client Potentiel */}
        <header style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="company-logo">CP</div>
                <div>
                  <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                    {t.title}
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    {tenant.companyName} • {formData.astNumber} • {t.industries[formData.industry]}
                  </p>
                </div>
              </div>
              
              {/* NOUVEAU: Compteur de personnes dans le header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#3b82f6', fontSize: '20px', fontWeight: '700' }}>
                    {formData.projectInfo.workerCount || formData.team.members.length}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>Personnes sur la job</div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(100, 116, 139, 0.3)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: '700' }}>
                    {formData.team.members.filter(m => m.validationStatus === 'approved').length}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>Approuvé AST</div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(100, 116, 139, 0.3)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    color: formData.team.members.length > 0 && formData.team.members.filter(m => m.validationStatus === 'approved').length === formData.team.members.length 
                      ? '#22c55e' : '#f59e0b', 
                    fontSize: '20px', 
                    fontWeight: '700' 
                  }}>
                    {formData.team.members.length > 0 
                      ? Math.round((formData.team.members.filter(m => m.validationStatus === 'approved').length / formData.team.members.length) * 100)
                      : 0}%
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>Taux d'approbation</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                  className="input-premium"
                  style={{ padding: '8px 12px', minWidth: '120px' }}
                >
                  <option value="fr">🇨🇦 Français</option>
                  <option value="en">🇨🇦 English</option>
                </select>
                
                <button 
                  onClick={handleGeneratePDF}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                  title={t.actions.generatePDF}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                </button>
                
                <button 
                  onClick={handleSendByEmail}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                  title={t.actions.sendByEmail}
                >
                  <Mail style={{ width: '16px', height: '16px' }} />
                </button>

                <button 
                  onClick={handleArchive}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                  title={t.actions.archive}
                >
                  <Archive style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
          <div className="glass-effect slide-in" style={{ padding: '32px' }}>
            
            {/* Barre de progression */}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            {/* Indicateur d'étapes */}
            <div className="step-indicator">
              {steps.map((step, index) => {
                const completion = calculateStepCompletion(index);
                return (
                  <div
                    key={step.key}
                    className={`step-item ${index === currentStep ? 'active' : completion === 100 ? 'completed' : ''}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <step.icon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>
                      {t.steps[step.key]}
                    </span>
                    {completion > 0 && completion < 100 && (
                      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>
                        ({Math.round(completion)}%)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contenu des étapes */}
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
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🔢 {t.projectInfo.astNumber}
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

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🏢 {t.projectInfo.client} *
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

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🔢 {t.projectInfo.projectNumber} *
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

                    {/* NOUVEAU: Champ nombre de personnes */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        👥 Nombre de personnes sur la job *
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
                  </div>

                  {formData.teamDiscussion.discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className={`discussion-item ${discussion.completed ? 'completed' : ''} ${discussion.priority}-priority`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CustomCheckbox
                          checked={discussion.completed}
                          onChange={() => toggleDiscussion(discussion.id)}
                          label=""
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                            {discussion.topic}
                          </h4>
                          <input
                            type="text"
                            className="input-premium"
                            placeholder="Notes..."
                            value={discussion.notes}
                            onChange={(e) => updateDiscussionNotes(discussion.id, e.target.value)}
                            style={{ fontSize: '12px', padding: '8px 12px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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

                  <div className="equipment-grid">
                    {formData.safetyEquipment.map((item) => (
                      <div
                        key={item.id}
                        className={`equipment-item ${item.required ? 'required' : ''} ${item.verified ? 'verified' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <CustomCheckbox
                            checked={item.required}
                            onChange={() => toggleEquipmentRequired(item.id)}
                            label=""
                          />
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>Requis</span>
                          
                          <CustomCheckbox
                            checked={item.available}
                            onChange={() => toggleEquipmentAvailable(item.id)}
                            label=""
                          />
                          <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>Disponible</span>
                          
                          <CustomCheckbox
                            checked={item.verified}
                            onChange={() => toggleEquipmentVerified(item.id)}
                            label=""
                          />
                          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>Vérifié</span>
                        </div>
                        
                        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                          {item.name}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ÉTAPE 4: Dangers Potentiels */}
              {currentStep === 3 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ⚠️ {t.hazards.title}
                    </h2>
                  </div>

                  <div className="hazard-grid">
                    {formData.electricalHazards.map((hazard) => (
                      <div key={hazard.id} style={{ gridColumn: '1 / -1' }}>
                        <div
                          className={`hazard-item ${hazard.isSelected ? 'selected' : ''} ${hazard.riskLevel}`}
                          onClick={() => toggleHazard(hazard.id)}
                          style={{ cursor: 'pointer', marginBottom: hazard.isSelected ? '0' : '16px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <CustomCheckbox
                              checked={hazard.isSelected}
                              onChange={() => toggleHazard(hazard.id)}
                              label=""
                            />
                            <div style={{
                              background: hazard.riskLevel === 'critical' ? '#dc2626' : '#f59e0b',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {hazard.code}
                            </div>
                          </div>
                          
                          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                            {hazard.title}
                          </h4>
                          
                          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                            {hazard.description}
                          </p>

                          {hazard.isSelected && (
                            <div style={{ marginTop: '12px' }}>
                              <span style={{ 
                                color: '#22c55e', 
                                fontSize: '12px', 
                                fontWeight: '600',
                                background: 'rgba(34, 197, 94, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}>
                                ✅ Danger sélectionné
                              </span>
                            </div>
                          )}
                        </div>

                        {hazard.isSelected && hazard.showControls && hazard.controlMeasures && (
                          <div style={{
                            background: 'rgba(20, 30, 48, 0.9)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '16px'
                          }}>
                            <h5 style={{ color: '#22c55e', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                              🛡️ Moyens de contrôle pour: {hazard.title}
                            </h5>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                              {hazard.controlMeasures.map((control) => (
                                <div
                                  key={control.id}
                                  style={{
                                    background: 'rgba(51, 65, 85, 0.3)',
                                    border: '1px solid rgba(100, 116, 139, 0.3)',
                                    borderRadius: '8px',
                                    padding: '16px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <CustomCheckbox
                                      checked={control.isSelected}
                                      onChange={() => toggleControlMeasure(hazard.id, control.id)}
                                      label=""
                                    />
                                    <div style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: '600'
                                    }}>
                                      {control.category.toUpperCase()}
                                    </div>
                                  </div>

                                  <h6 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0' }}>
                                    {control.name}
                                  </h6>
                                  
                                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0' }}>
                                    {control.description}
                                  </p>

                                  {control.isSelected && (
                                    <input
                                      type="text"
                                      className="input-premium"
                                      placeholder="Notes spécifiques..."
                                      value={control.notes}
                                      onChange={(e) => updateControlNotes(hazard.id, control.id, e.target.value)}
                                      style={{ fontSize: '12px', padding: '8px' }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      ➕ {t.isolation.addPoint}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                      <input
                        type="text"
                        className="input-premium"
                        placeholder={t.isolation.pointName}
                        value={newIsolationPoint.name || ''}
                        onChange={(e) => setNewIsolationPoint(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <select
                        className="input-premium"
                        value={newIsolationPoint.type || ''}
                        onChange={(e) => setNewIsolationPoint(prev => ({ ...prev, type: e.target.value as any }))}
                      >
                        <option value="">Sélectionner le type...</option>
                        <option value="electrical">⚡ Électrique</option>
                        <option value="mechanical">⚙️ Mécanique</option>
                        <option value="pneumatic">🌪️ Pneumatique</option>
                        <option value="hydraulic">💧 Hydraulique</option>
                        <option value="chemical">🧪 Chimique</option>
                        <option value="thermal">🔥 Thermique</option>
                      </select>
                      <button
                        onClick={addIsolationPoint}
                        className="btn-premium"
                        style={{ padding: '14px 20px' }}
                      >
                        <Plus style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>

                  {formData.isolationPoints.map((point) => (
                    <div key={point.id} style={{ 
                      background: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '16px', 
                      padding: '24px', 
                      marginBottom: '16px' 
                    }}>
                      <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                        {point.type === 'electrical' ? '⚡' : 
                         point.type === 'mechanical' ? '⚙️' :
                         point.type === 'pneumatic' ? '🌪️' :
                         point.type === 'hydraulic' ? '💧' :
                         point.type === 'chemical' ? '🧪' : '🔥'} {point.name}
                      </h4>

                      {/* NOUVELLE CHECKLIST SELON VOTRE IMAGE */}
                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                          📋 Points d'Isolement - Checklist
                        </h5>
                        <div className="isolation-checklist">
                          <div 
                            className={`checklist-item ${point.checklist.cadenasAppose ? 'completed' : ''}`}
                            onClick={() => updateIsolationChecklist(point.id, 'cadenasAppose')}
                          >
                            <div className={`checkbox-premium ${point.checklist.cadenasAppose ? 'checked' : ''}`} />
                            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Cadenas Apposé</span>
                          </div>
                          
                          <div 
                            className={`checklist-item ${point.checklist.absenceTension ? 'completed' : ''}`}
                            onClick={() => updateIsolationChecklist(point.id, 'absenceTension')}
                          >
                            <div className={`checkbox-premium ${point.checklist.absenceTension ? 'checked' : ''}`} />
                            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Absence de Tension</span>
                          </div>
                          
                          <div 
                            className={`checklist-item ${point.checklist.miseALaTerre ? 'completed' : ''}`}
                            onClick={() => updateIsolationChecklist(point.id, 'miseALaTerre')}
                          >
                            <div className={`checkbox-premium ${point.checklist.miseALaTerre ? 'checked' : ''}`} />
                            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Mise à la Terre</span>
                          </div>
                          
                          <div 
                            className={`checklist-item ${point.checklist.cadenasReleve ? 'completed' : ''}`}
                            onClick={() => updateIsolationChecklist(point.id, 'cadenasReleve')}
                          >
                            <div className={`checkbox-premium ${point.checklist.cadenasReleve ? 'checked' : ''}`} />
                            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Cadenas Relevé</span>
                          </div>
                        </div>
                      </div>

                      <PhotoCarousel
                        photos={point.photos}
                        onAddPhoto={(file) => addPhotoToIsolationPoint(point.id, file)}
                        onRemovePhoto={(photoId) => removePhotoFromIsolationPoint(point.id, photoId)}
                        onUpdateDescription={(photoId, description) => updateIsolationPhotoDescription(point.id, photoId, description)}
                      />
                    </div>
                  ))}

                  {formData.isolationPoints.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                      <Settings style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', margin: 0 }}>Aucun point d'isolement configuré</p>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 6: Validation Équipe avec Tableau d'Approbation */}
              {currentStep === 5 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      👥 {t.team.validation}
                    </h2>
                    
                    {/* NOUVEAU: Indicateur de progression d'équipe */}
                    <div style={{ 
                      background: 'rgba(30, 41, 59, 0.6)', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      margin: '16px 0',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '32px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '700' }}>
                          {formData.projectInfo.workerCount || formData.team.members.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Personnes attendues</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '700' }}>
                          {formData.team.members.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Ajoutées à l'équipe</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                          {formData.team.members.filter(m => m.validationStatus === 'approved').length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Ont approuvé l'AST</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          color: formData.team.members.length > 0 && 
                                 formData.team.members.filter(m => m.validationStatus === 'approved').length >= (formData.projectInfo.workerCount || formData.team.members.length)
                            ? '#22c55e' : '#ef4444', 
                          fontSize: '24px', 
                          fontWeight: '700' 
                        }}>
                          {formData.team.members.length > 0 && (formData.projectInfo.workerCount || formData.team.members.length) > 0
                            ? Math.round((formData.team.members.filter(m => m.validationStatus === 'approved').length / (formData.projectInfo.workerCount || formData.team.members.length)) * 100)
                            : 0}%
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Couverture d'approbation</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      ➕ {t.team.addMember}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
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
                        placeholder={t.team.department}
                        value={newTeamMember.department || ''}
                        onChange={(e) => setNewTeamMember(prev => ({ ...prev, department: e.target.value }))}
                      />
                      <button
                        onClick={addTeamMember}
                        className="btn-premium"
                        style={{ padding: '14px 20px' }}
                      >
                        <Plus style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>

                  {/* NOUVEAU: Tableau d'approbation selon votre image */}
                  {formData.team.members.length > 0 && (
                    <table className="approval-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>NOM DU TRAVAILLEUR</th>
                          <th>CONSULTATION AST</th>
                          <th>CADENAS APPOSÉ</th>
                          <th>CADENAS RELEVÉ</th>
                          <th>STATUT</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.team.members.map((member) => (
                          <tr key={member.id}>
                            <td className="worker-name-cell">
                              <div>
                                <div style={{ fontWeight: '600' }}>{member.name}</div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>{member.department}</div>
                              </div>
                            </td>
                            <td>
                              <LockButton
                                locked={member.consultationAst}
                                onToggle={() => toggleConsultationAst(member.id)}
                                memberId={member.id}
                              />
                            </td>
                            <td>
                              <LockButton
                                locked={member.cadenasAppose}
                                onToggle={() => toggleCadenasAppose(member.id)}
                                memberId={member.id}
                              />
                            </td>
                            <td>
                              <LockButton
                                locked={member.cadenasReleve}
                                onToggle={() => toggleCadenasReleve(member.id)}
                                memberId={member.id}
                              />
                            </td>
                            <td>
                              <div style={{ 
                                color: member.validationStatus === 'approved' ? '#22c55e' : 
                                       member.validationStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                                fontSize: '12px', 
                                fontWeight: '600'
                              }}>
                                {member.validationStatus === 'approved' && '✅ Approuvé'}
                                {member.validationStatus === 'rejected' && '❌ Rejeté'}
                                {member.validationStatus === 'pending' && '⏳ En attente'}
                              </div>
                            </td>
                            <td>
                              {member.validationStatus === 'pending' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => validateTeamMember(member.id, true, 'Approuvé')}
                                    className="btn-success"
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                  >
                                    <Check style={{ width: '12px', height: '12px' }} />
                                  </button>
                                  <button
                                    onClick={() => validateTeamMember(member.id, false, 'Rejeté')}
                                    className="btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '11px' }}
                                  >
                                    <X style={{ width: '12px', height: '12px' }} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {formData.team.members.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                      <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', margin: 0 }}>Aucun membre d'équipe ajouté</p>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 7: Documentation */}
              {currentStep === 6 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      📸 Documentation
                    </h2>
                  </div>

                  <PhotoCarousel
                    photos={formData.documentation.photos}
                    onAddPhoto={addPhoto}
                    onRemovePhoto={removePhoto}
                    onUpdateDescription={updatePhotoDescription}
                  />
                </div>
              )}

              {/* ÉTAPE 8: Validation Finale */}
              {currentStep === 7 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ✅ Validation Finale
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <button
                      onClick={handleGeneratePDF}
                      className="btn-premium"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Download style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>Générer PDF</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Format 8.5"×11"</div>
                      </div>
                    </button>

                    <button
                      onClick={handleSendByEmail}
                      className="btn-success"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Mail style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>Envoyer Email</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Au client</div>
                      </div>
                    </button>

                    <button
                      onClick={handleArchive}
                      className="btn-secondary"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Archive style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>Archiver</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Dans Supabase</div>
                      </div>
                    </button>
                  </div>

                  <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      📊 Résumé Final
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '700' }}>
                          {formData.projectInfo.workerCount || formData.team.members.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Personnes sur la job</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                          {formData.team.members.filter(m => m.validationStatus === 'approved').length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Approbations AST</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: '700' }}>
                          {formData.electricalHazards.filter(h => h.isSelected).length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dangers identifiés</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#a855f7', fontSize: '24px', fontWeight: '700' }}>
                          {formData.isolationPoints.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Points d'isolement</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                          {formData.documentation.photos.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Photos ajoutées</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
                        <div style={{ 
                          color: formData.team.members.length > 0 && 
                                 formData.team.members.filter(m => m.validationStatus === 'approved').length >= (formData.projectInfo.workerCount || formData.team.members.length)
                            ? '#22c55e' : '#f59e0b', 
                          fontSize: '24px', 
                          fontWeight: '700' 
                        }}>
                          {formData.team.members.length > 0 && (formData.projectInfo.workerCount || formData.team.members.length) > 0
                            ? Math.round((formData.team.members.filter(m => m.validationStatus === 'approved').length / (formData.projectInfo.workerCount || formData.team.members.length)) * 100)
                            : 0}%
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Taux de couverture</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '48px', 
              paddingTop: '24px', 
              borderTop: '1px solid rgba(100, 116, 139, 0.2)' 
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  opacity: currentStep === 0 ? 0.5 : 1,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} /> 
                Précédent
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => handleSave(true)} 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save style={{ width: '16px', height: '16px' }} /> 
                  Sauvegarder
                </button>
                
                {currentStep === steps.length - 1 ? (
                  <button 
                    onClick={handleFinalSubmission} 
                    className="btn-success"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={formData.team.members.length > 0 && 
                             formData.team.members.filter(m => m.validationStatus === 'approved').length < (formData.projectInfo.workerCount || formData.team.members.length)}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    Soumission Finale
                  </button>
                ) : (
                  <button 
                    className="btn-premium" 
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    Suivant 
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
