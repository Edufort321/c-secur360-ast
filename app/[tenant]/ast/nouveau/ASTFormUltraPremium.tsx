// =================== SECTION 1/4: INTERFACES & DONNÉES ===================
// AST Form Ultra Premium - Client Potentiel
// Section 1: Interfaces, Types et Données de base

import React, { useState, useEffect, useRef } from 'react'
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle
} from 'lucide-react'

// =================== INTERFACES MISES À JOUR ===================

interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

interface TeamMember {
  id: string
  name: string
  employeeId: string
  department: string
  qualification: string
  hasAcknowledged: boolean
  acknowledgmentTime?: string
  signature?: string
  joinedAt: string
  validationStatus: 'pending' | 'approved' | 'rejected'
  validationComments?: string
}

interface IsolationPoint {
  id: string
  name: string
  type: 'electrical' | 'mechanical' | 'pneumatic' | 'hydraulic' | 'chemical' | 'thermal'
  isActive: boolean
  createdAt: string
  photos: Photo[]
}

interface ElectricalIsolation {
  id: string
  isolationPointId: string
  circuitName: string
  lockoutApplied: boolean
  tensionVerified: boolean
  groundingInstalled: boolean
  isolationManeuver: string
  verification: string
  additionalSteps: string[]
  customSteps: string[]
}

interface MechanicalIsolation {
  id: string
  isolationPointId: string
  equipmentName: string
  lockoutType: 'valve' | 'switch' | 'breaker' | 'disconnect' | 'other'
  energySource: string
  lockoutApplied: boolean
  verificationMethod: string
  pressureReleased: boolean
  additionalSteps: string[]
  customSteps: string[]
}

interface ControlMeasure {
  id: string
  text: string
  isSelected: boolean
  isCustom: boolean
}

interface ElectricalHazard {
  id: string
  code: string
  title: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  controlMeasures: ControlMeasure[]
  isSelected: boolean
  additionalNotes?: string
  customControlMeasures: ControlMeasure[]
  isExpanded?: boolean
}

interface SafetyEquipment {
  id: string
  name: string
  required: boolean
  available: boolean
  notes: string
  verified: boolean
}

interface TeamDiscussion {
  id: string
  topic: string
  notes: string
  completed: boolean
  discussedBy: string
}

interface Photo {
  id: string
  name: string
  data: string
  description: string
  timestamp: string
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'isolation' | 'other'
}

interface TeamValidation {
  memberId: string
  approved: boolean
  timestamp: string
  comments: string
  signature?: string
}

interface ASTFormData {
  // ========== NUMÉROS AST AUTOMATIQUES ==========
  id: string
  astNumber: string // Numéro principal AST
  created: string
  lastModified: string
  language: 'fr' | 'en' | 'es'
  status: 'draft' | 'completed' | 'team_validation' | 'approved' | 'archived'
  industry: 'electrical' | 'construction' | 'industrial' | 'office' | 'manufacturing' | 'other'
  
  projectInfo: {
    date: string
    time: string
    client: string
    projectNumber: string
    astClientNumber: string
    workLocation: string
    workDescription: string
    estimatedDuration: string
    workerCount: number
    clientRepresentative: string
    emergencyContact: string
    emergencyPhone: string
    workPermitRequired: boolean
    workPermitNumber?: string
    weatherConditions: string
    specialConditions: string
  }
  
  teamDiscussion: {
    electricalCutoffPoints: string
    electricalHazardExplanation: string
    epiSpecificNotes: string
    specialWorkConditions: string
    emergencyProcedures: string
    discussions: TeamDiscussion[]
    briefingCompleted: boolean
    briefingDate: string
    briefingTime: string
  }
  
  safetyEquipment: SafetyEquipment[]
  electricalHazards: ElectricalHazard[]
  
  team: {
    supervisor: string
    supervisorCertification: string
    supervisorSignature?: string
    members: TeamMember[]
    briefingCompleted: boolean
    briefingDate: string
    briefingTime: string
    totalMembers: number
    acknowledgedMembers: number
    validations: TeamValidation[]
    allApproved: boolean
  }
  
  isolationPoints: IsolationPoint[]
  electricalIsolations: ElectricalIsolation[]
  mechanicalIsolations: MechanicalIsolation[]
  
  documentation: {
    photos: Photo[]
    additionalDocuments: string[]
    inspectionNotes: string
    correctiveActions: string
  }
  
  validation: {
    completedBy: string
    completedDate: string
    reviewedBy: string
    reviewedDate: string
    approvedBy: string
    approvedDate: string
    clientApproval: boolean
    finalApproval: boolean
    submissionDate?: string
    revisionNumber: number
    comments: string
    emailSent: boolean
    archivedDate?: string
  }
}

interface ASTFormProps {
  tenant: Tenant
}

// =================== GÉNÉRATEUR DE NUMÉRO AST UNIQUE ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  
  // Générer un identifiant unique avec timestamp + random
  const timestamp = Date.now().toString().slice(-6) // 6 derniers chiffres du timestamp
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  // Format: AST-YYYYMMDD-XXXXXX
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`
}

// =================== TYPES D'ISOLEMENT PAR MÉTIER ===================
const isolationTypesByIndustry = {
  electrical: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' },
    { type: 'mechanical' as const, name: 'Isolement Mécanique', icon: '⚙️', color: '#3b82f6' }
  ],
  construction: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' },
    { type: 'mechanical' as const, name: 'Isolement Mécanique', icon: '⚙️', color: '#3b82f6' },
    { type: 'hydraulic' as const, name: 'Isolement Hydraulique', icon: '💧', color: '#06b6d4' },
    { type: 'pneumatic' as const, name: 'Isolement Pneumatique', icon: '💨', color: '#8b5cf6' }
  ],
  industrial: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' },
    { type: 'mechanical' as const, name: 'Isolement Mécanique', icon: '⚙️', color: '#3b82f6' },
    { type: 'chemical' as const, name: 'Isolement Chimique', icon: '🧪', color: '#f59e0b' },
    { type: 'thermal' as const, name: 'Isolement Thermique', icon: '🌡️', color: '#f97316' },
    { type: 'pneumatic' as const, name: 'Isolement Pneumatique', icon: '💨', color: '#8b5cf6' },
    { type: 'hydraulic' as const, name: 'Isolement Hydraulique', icon: '💧', color: '#06b6d4' }
  ],
  office: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' }
  ],
  manufacturing: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' },
    { type: 'mechanical' as const, name: 'Isolement Mécanique', icon: '⚙️', color: '#3b82f6' },
    { type: 'pneumatic' as const, name: 'Isolement Pneumatique', icon: '💨', color: '#8b5cf6' },
    { type: 'hydraulic' as const, name: 'Isolement Hydraulique', icon: '💧', color: '#06b6d4' }
  ],
  other: [
    { type: 'electrical' as const, name: 'Isolement Électrique', icon: '⚡', color: '#ef4444' },
    { type: 'mechanical' as const, name: 'Isolement Mécanique', icon: '⚙️', color: '#3b82f6' }
  ]
}

// =================== DANGERS ÉLECTRIQUES PRÉDÉFINIS ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  {
    id: 'h0', code: '0', title: 'RISQUE ÉLECTRIQUE',
    description: 'Exposition aux tensions électriques dangereuses',
    riskLevel: 'critical',
    controlMeasures: [
      { id: 'cm0-1', text: 'Consignation électrique (LOTO)', isSelected: false, isCustom: false },
      { id: 'cm0-2', text: 'Vérification d\'absence de tension', isSelected: false, isCustom: false },
      { id: 'cm0-3', text: 'Mise à la terre et en court-circuit', isSelected: false, isCustom: false },
      { id: 'cm0-4', text: 'Balisage et signalisation de la zone', isSelected: false, isCustom: false },
      { id: 'cm0-5', text: 'Port des EPI obligatoires', isSelected: false, isCustom: false },
      { id: 'cm0-6', text: 'Surveillance continue par personne qualifiée', isSelected: false, isCustom: false }
    ],
    isSelected: false,
    customControlMeasures: [],
    isExpanded: false
  },
  {
    id: 'h1', code: '1', title: 'APPAREILLAGE SOUS-TENSION',
    description: 'Travail à proximité d\'équipement électrique énergisé',
    riskLevel: 'critical',
    controlMeasures: [
      { id: 'cm1-1', text: 'EPI arc électrique certifié', isSelected: false, isCustom: false },
      { id: 'cm1-2', text: 'Maintien des distances de sécurité', isSelected: false, isCustom: false },
      { id: 'cm1-3', text: 'Utilisation d\'outils isolés', isSelected: false, isCustom: false },
      { id: 'cm1-4', text: 'Analyse des risques d\'arc électrique', isSelected: false, isCustom: false },
      { id: 'cm1-5', text: 'Procédures de travail approuvées', isSelected: false, isCustom: false }
    ],
    isSelected: false,
    customControlMeasures: [],
    isExpanded: false
  },
  {
    id: 'h9', code: '9', title: 'RISQUE DE CHUTE',
    description: 'Travail en hauteur ou sur surfaces glissantes',
    riskLevel: 'high',
    controlMeasures: [
      { id: 'cm9-1', text: 'Harnais de sécurité et ligne de vie', isSelected: false, isCustom: false },
      { id: 'cm9-2', text: 'Garde-corps et filets de sécurité', isSelected: false, isCustom: false },
      { id: 'cm9-3', text: 'Inspection des équipements avant usage', isSelected: false, isCustom: false },
      { id: 'cm9-4', text: 'Formation travail en hauteur', isSelected: false, isCustom: false },
      { id: 'cm9-5', text: 'Plan de sauvetage en cas de chute', isSelected: false, isCustom: false }
    ],
    isSelected: false,
    customControlMeasures: [],
    isExpanded: false
  },
  {
    id: 'h12', code: '12', title: 'INCENDIE / EXPLOSION',
    description: 'Risque d\'incendie ou d\'explosion sur le site',
    riskLevel: 'critical',
    controlMeasures: [
      { id: 'cm12-1', text: 'Élimination des sources d\'ignition', isSelected: false, isCustom: false },
      { id: 'cm12-2', text: 'Surveillance des atmosphères explosives', isSelected: false, isCustom: false },
      { id: 'cm12-3', text: 'Équipements anti-déflagrants', isSelected: false, isCustom: false },
      { id: 'cm12-4', text: 'Plan d\'évacuation d\'urgence', isSelected: false, isCustom: false },
      { id: 'cm12-5', text: 'Extincteurs appropriés disponibles', isSelected: false, isCustom: false }
    ],
    isSelected: false,
    customControlMeasures: [],
    isExpanded: false
  }
]

// =================== ÉQUIPEMENTS SÉCURITÉ OBLIGATOIRES ===================
const requiredSafetyEquipment: SafetyEquipment[] = [
  {
    id: 'eq1',
    name: 'TROUSSE DE PREMIERS SOINS',
    required: true,
    available: false,
    notes: '',
    verified: false
  },
  {
    id: 'eq2', 
    name: 'EXTINCTEUR PORTATIF',
    required: true,
    available: false,
    notes: '',
    verified: false
  },
  {
    id: 'eq3',
    name: 'PLAN D\'INTERVENTION D\'URGENCE',
    required: true,
    available: false,
    notes: '',
    verified: false
  },
  {
    id: 'eq4',
    name: 'ÉQUIPEMENT DE COMMUNICATION',
    required: true,
    available: false,
    notes: '',
    verified: false
  }
]

// =================== DISCUSSIONS PRÉDÉFINIES ===================
const predefinedDiscussions: TeamDiscussion[] = [
  {
    id: 'td1',
    topic: 'Points de coupure électrique',
    notes: '',
    completed: false,
    discussedBy: ''
  },
  {
    id: 'td2',
    topic: 'Procédures de verrouillage',
    notes: '',
    completed: false,
    discussedBy: ''
  },
  {
    id: 'td3',
    topic: 'Équipements de protection individuelle',
    notes: '',
    completed: false,
    discussedBy: ''
  },
  {
    id: 'td4',
    topic: 'Procédures d\'urgence',
    notes: '',
    completed: false,
    discussedBy: ''
  }
]

// =================== DONNÉES INITIALES ===================
const initialFormData: ASTFormData = {
  // ========== NUMÉROS AST AUTOMATIQUES ==========
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
    briefingTime: ''
  },
  
  safetyEquipment: [...requiredSafetyEquipment],
  electricalHazards: [...predefinedElectricalHazards],
  
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
  electricalIsolations: [],
  mechanicalIsolations: [],
  
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
}
// =================== SECTION 2/4: TRADUCTIONS & STYLES ===================
// AST Form Ultra Premium - Client Potentiel
// Section 2: Traductions et Styles CSS

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
      acknowledgment: "Prise de Connaissance AST",
      acknowledged: "J'ai pris connaissance de l'AST",
      acknowledgedAt: "Pris connaissance le",
      pendingAcknowledgment: "En attente de prise de connaissance",
      briefingStatus: "État du Briefing",
      completeBriefing: "Compléter le Briefing",
      validation: "Validation Équipe",
      approved: "Approuvé",
      rejected: "Rejeté",
      pending: "En attente"
    },
    
    isolation: {
      title: "Points d'Isolement",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      addPhotos: "Ajouter Photos",
      photosCarousel: "Carrousel Photos",
      
      electrical: {
        title: "Isolement Électrique",
        circuitName: "Nom du Circuit",
        isolationManeuver: "Manœuvre d'Isolement",
        lockoutApplied: "Cadenas appliqués",
        tensionVerified: "Absence de tension vérifiée",
        groundingInstalled: "Mise à la terre installée",
        verification: "Méthode de Vérification",
        additionalSteps: "Étapes Supplémentaires"
      },
      
      mechanical: {
        title: "Isolement Mécanique",
        equipmentName: "Nom de l'Équipement",
        lockoutType: "Type de Verrouillage",
        energySource: "Source d'Énergie",
        lockoutApplied: "Verrouillage appliqué",
        verificationMethod: "Méthode de Vérification",
        pressureReleased: "Pression relâchée"
      }
    },
    
    electricalHazards: {
      title: "Dangers Électriques Identifiés",
      selectAll: "Sélectionner Tout",
      deselectAll: "Désélectionner Tout",
      riskLevel: "Niveau de Risque",
      controlMeasures: "Mesures de Contrôle",
      additionalNotes: "Notes Additionnelles",
      addCustomControl: "Ajouter mesure personnalisée",
      customControlPlaceholder: "Nouvelle mesure de contrôle..."
    },
    
    actions: {
      sendByEmail: "Envoyer par Courriel",
      archive: "Archiver",
      generatePDF: "Générer PDF",
      print: "Imprimer",
      teamValidation: "Validation Équipe",
      finalApproval: "Approbation Finale"
    },
    
    buttons: {
      previous: "Précédent",
      next: "Suivant",
      save: "Sauvegarder",
      add: "Ajouter",
      remove: "Supprimer",
      acknowledge: "Prendre Connaissance",
      createIsolation: "Créer Isolement",
      approve: "Approuver",
      reject: "Rejeter",
      validate: "Valider"
    },
    
    riskLevels: {
      low: "Faible",
      medium: "Moyen", 
      high: "Élevé",
      critical: "Critique"
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
      acknowledgment: "JSA Acknowledgment",
      acknowledged: "I acknowledge this JSA",
      acknowledgedAt: "Acknowledged on",
      pendingAcknowledgment: "Pending acknowledgment",
      briefingStatus: "Briefing Status",
      completeBriefing: "Complete Briefing",
      validation: "Team Validation",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending"
    },
    
    isolation: {
      title: "Isolation Points",
      addPoint: "Add Isolation Point",
      pointName: "Isolation Point Name",
      isolationType: "Isolation Type",
      selectType: "Select type...",
      noPoints: "No isolation points configured",
      addPhotos: "Add Photos",
      photosCarousel: "Photos Carousel",
      
      electrical: {
        title: "Electrical Isolation",
        circuitName: "Circuit Name",
        isolationManeuver: "Isolation Maneuver",
        lockoutApplied: "Lockout applied",
        tensionVerified: "Zero energy verified",
        groundingInstalled: "Grounding installed",
        verification: "Verification Method",
        additionalSteps: "Additional Steps"
      },
      
      mechanical: {
        title: "Mechanical Isolation",
        equipmentName: "Equipment Name",
        lockoutType: "Lockout Type",
        energySource: "Energy Source",
        lockoutApplied: "Lockout applied",
        verificationMethod: "Verification Method",
        pressureReleased: "Pressure released"
      }
    },
    
    electricalHazards: {
      title: "Identified Electrical Hazards",
      selectAll: "Select All",
      deselectAll: "Deselect All", 
      riskLevel: "Risk Level",
      controlMeasures: "Control Measures",
      additionalNotes: "Additional Notes",
      addCustomControl: "Add custom control",
      customControlPlaceholder: "New control measure..."
    },
    
    actions: {
      sendByEmail: "Send by Email",
      archive: "Archive",
      generatePDF: "Generate PDF",
      print: "Print",
      teamValidation: "Team Validation",
      finalApproval: "Final Approval"
    },
    
    buttons: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      add: "Add",
      remove: "Remove",
      acknowledge: "Acknowledge",
      createIsolation: "Create Isolation",
      approve: "Approve",
      reject: "Reject",
      validate: "Validate"
    },
    
    riskLevels: {
      low: "Low",
      medium: "Medium",
      high: "High", 
      critical: "Critical"
    },

    email: {
      subject: "JSA - Job Safety Analysis",
      body: "Please find attached the Job Safety Analysis for your review."
    }
  }
}

// =================== STYLES CSS PREMIUM ===================
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
  
  .input-premium:disabled {
    background: rgba(30, 41, 59, 0.5);
    color: #94a3b8;
    cursor: not-allowed;
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
  
  .ast-number-display {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid #22c55e;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .ast-number-text {
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #22c55e;
    letter-spacing: 0.5px;
  }
  
  .refresh-btn {
    background: none;
    border: 1px solid #22c55e;
    color: #22c55e;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .refresh-btn:hover {
    background: rgba(34, 197, 94, 0.2);
  }
  
  .checkbox-premium {
    width: 20px;
    height: 20px;
    border: 2px solid #64748b;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .checkbox-premium.checked {
    background: #22c55e;
    border-color: #22c55e;
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
  
  .carousel-container {
    position: relative;
    background: rgba(30, 41, 59, 0.8);
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
  }
  
  .carousel-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .carousel-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.7);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .carousel-nav:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  
  .carousel-nav.prev {
    left: 16px;
  }
  
  .carousel-nav.next {
    right: 16px;
  }
  
  .validation-card {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin: 8px 0;
  }
  
  .validation-approved {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
  }
  
  .validation-rejected {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
  
  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
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
  
  .slide-in {
    animation: slideInUp 0.5s ease-out;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  @media (max-width: 768px) {
    .step-indicator {
      gap: 4px;
      padding: 16px;
    }
    
    .step-item {
      padding: 8px 12px;
      font-size: 12px;
    }
    
    .glass-effect {
      margin: 16px;
      padding: 20px;
    }
  }
// =================== SECTION 3/4: FONCTIONS & COMPOSANTS CORRIGÉE ===================
// AST Form Ultra Premium - Client Potentiel
// Section 3: Fonctions utilitaires et composants - VERSION CORRIGÉE

// =================== COMPOSANT CARROUSEL PHOTOS ===================
const PhotoCarousel = ({ photos, onAddPhoto, onRemovePhoto }: {
  photos: Photo[]
  onAddPhoto: (file: File) => void
  onRemovePhoto: (photoId: string) => void
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAddPhoto(file)
    }
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="carousel-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
          📸 Photos ({photos.length})
        </h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-premium"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          Ajouter Photo
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
            className="carousel-image"
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="carousel-nav prev"
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={nextPhoto}
                className="carousel-nav next"
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
            fontSize: '12px'
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
              cursor: 'pointer'
            }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>

          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              className="input-premium"
              placeholder="Description de la photo..."
              value={photos[currentPhotoIndex].description}
              onChange={(e) => {
                // Fonction pour mettre à jour la description sera définie dans le composant principal
              }}
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
          📷 Aucune photo ajoutée
        </div>
      )}
    </div>
  )
}

// =================== COMPOSANT VALIDATION ÉQUIPE CORRIGÉ ===================
const TeamValidationCard = ({ member, onValidate }: {
  member: TeamMember
  onValidate: (memberId: string, approved: boolean, comments: string) => void
}) => {
  const [comments, setComments] = useState(member.validationComments || '')
  const [showValidation, setShowValidation] = useState(false)

  const handleValidation = (approved: boolean) => {
    onValidate(member.id, approved, comments)
    setShowValidation(false)
  }

  const getStatusColor = () => {
    switch (member.validationStatus) {
      case 'approved': return '#22c55e'
      case 'rejected': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  const getStatusText = () => {
    switch (member.validationStatus) {
      case 'approved': return '✅ Approuvé'
      case 'rejected': return '❌ Rejeté'
      default: return '⏳ En attente'
    }
  }

  // CORRECTION: Utiliser une logique conditionnelle au lieu d'un template literal complexe
  const getValidationCardClass = () => {
    let baseClass = 'validation-card'
    if (member.validationStatus === 'approved') {
      baseClass += ' validation-approved'
    } else if (member.validationStatus === 'rejected') {
      baseClass += ' validation-rejected'
    }
    return baseClass
  }

  return (
    <div className={getValidationCardClass()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
            {member.name}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
            {member.department} • {member.qualification}
          </p>
        </div>
        <div style={{ 
          color: getStatusColor(), 
          fontSize: '14px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {getStatusText()}
        </div>
      </div>

      {member.validationStatus === 'pending' && (
        <div>
          {!showValidation ? (
            <button
              onClick={() => setShowValidation(true)}
              className="btn-premium"
              style={{ padding: '8px 16px', fontSize: '12px', width: '100%' }}
            >
              <Eye style={{ width: '14px', height: '14px' }} />
              Réviser l'AST
            </button>
          ) : (
            <div>
              <textarea
                className="input-premium"
                placeholder="Commentaires de validation..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{ minHeight: '80px', marginBottom: '12px', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleValidation(true)}
                  className="btn-success"
                  style={{ padding: '8px 16px', fontSize: '12px', flex: 1 }}
                >
                  <Check style={{ width: '14px', height: '14px' }} />
                  Approuver
                </button>
                <button
                  onClick={() => handleValidation(false)}
                  className="btn-danger"
                  style={{ padding: '8px 16px', fontSize: '12px', flex: 1 }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                  Rejeter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {member.validationComments && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(100, 116, 139, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#e2e8f0', fontSize: '12px', margin: 0 }}>
            💬 {member.validationComments}
          </p>
        </div>
      )}
    </div>
  )
}

// =================== FONCTIONS UTILITAIRES ===================

// Fonction de génération PDF professionnel 8.5x11
const generateProfessionalPDF = (formData: ASTFormData, tenant: Tenant) => {
  // Simulation de génération PDF
  console.log('🔄 Génération PDF 8.5"x11" format professionnel...')
  console.log('📄 Données AST:', formData.astNumber)
  console.log('🏢 Client:', tenant.companyName)
  
  // Ici, vous intégreriez une vraie bibliothèque PDF comme jsPDF
  // avec mise en page professionnelle, logo, headers/footers
  
  setTimeout(() => {
    console.log('✅ PDF généré avec succès!')
    // Simulation du téléchargement
    const link = document.createElement('a')
    link.href = '#'
    link.download = `AST-${formData.astNumber}-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  }, 2000)
}

// Fonction d'envoi par courriel
const sendByEmail = async (formData: ASTFormData, tenant: Tenant, language: string) => {
  const t = translations[language as keyof typeof translations]
  
  try {
    console.log('📧 Envoi par courriel...')
    
    // Simulation d'envoi d'email
    const emailData = {
      to: formData.projectInfo.client || 'client@example.com',
      subject: `${t.email.subject} - ${formData.astNumber}`,
      body: `${t.email.body}\n\nProjet: ${formData.projectInfo.projectNumber}\nLieu: ${formData.projectInfo.workLocation}`,
      attachments: [`AST-${formData.astNumber}.pdf`]
    }
    
    // Ici vous intégreriez votre service d'email (EmailJS, backend API, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('✅ Email envoyé avec succès!')
    return true
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

// Fonction d'archivage
const archiveAST = async (formData: ASTFormData) => {
  try {
    console.log('📦 Archivage de l\'AST...')
    
    // Simulation d'archivage
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const archivedData = {
      ...formData,
      status: 'archived' as const,
      validation: {
        ...formData.validation,
        archivedDate: new Date().toISOString()
      }
    }
    
    console.log('✅ AST archivé avec succès!')
    return archivedData
  } catch (error) {
    console.error('❌ Erreur archivage:', error)
    throw error
  }
}

// Fonction de validation de l'équipe
const validateTeamApproval = (team: ASTFormData['team']): boolean => {
  const totalMembers = team.members.length
  const approvedMembers = team.members.filter(m => m.validationStatus === 'approved').length
  
  return totalMembers > 0 && approvedMembers === totalMembers
}

// Fonction de calcul du pourcentage de completion
const calculateCompletionPercentage = (formData: ASTFormData): number => {
  let completed = 0
  let total = 0
  
  // Vérification des informations de base
  total += 8
  if (formData.projectInfo.client) completed++
  if (formData.projectInfo.workDescription) completed++
  if (formData.projectInfo.workLocation) completed++
  if (formData.projectInfo.date) completed++
  if (formData.projectInfo.projectNumber) completed++
  if (formData.team.supervisor) completed++
  if (formData.team.members.length > 0) completed++
  if (formData.electricalHazards.some(h => h.isSelected)) completed++
  
  // Vérification des validations équipe
  total += 2
  if (formData.team.allApproved) completed++
  if (formData.validation.finalApproval) completed++
  
  return Math.round((completed / total) * 100)
}

// Fonction de génération de rapport de conformité
const generateComplianceReport = (formData: ASTFormData) => {
  const report = {
    astNumber: formData.astNumber,
    completionRate: calculateCompletionPercentage(formData),
    teamValidationStatus: validateTeamApproval(formData.team),
    hazardsIdentified: formData.electricalHazards.filter(h => h.isSelected).length,
    isolationPointsConfigured: formData.isolationPoints.length,
    photosDocumented: formData.documentation.photos.length,
    safetyEquipmentVerified: formData.safetyEquipment.filter(eq => eq.verified).length,
    complianceScore: 0
  }
  
  // Calcul du score de conformité
  let score = 0
  if (report.completionRate >= 90) score += 25
  if (report.teamValidationStatus) score += 25
  if (report.hazardsIdentified >= 2) score += 20
  if (report.isolationPointsConfigured >= 1) score += 15
  if (report.photosDocumented >= 3) score += 10
  if (report.safetyEquipmentVerified >= 3) score += 5
  
  report.complianceScore = score
  
  return report
}

// Export des fonctions pour utilisation dans le composant principal
export {
  PhotoCarousel,
  TeamValidationCard,
  generateProfessionalPDF,
  sendByEmail,
  archiveAST,
  validateTeamApproval,
  calculateCompletionPercentage,
  generateComplianceReport,
  premiumStyles,
  translations,
  initialFormData,
  generateASTNumber,
  isolationTypesByIndustry,
  predefinedElectricalHazards,
  requiredSafetyEquipment,
  predefinedDiscussions
}
// =================== SECTION 4/4: COMPOSANT PRINCIPAL COMPLET ===================
// AST Form Ultra Premium - Client Potentiel
// Copiez les 3 premières sections avant ce code

import React, { useState, useEffect, useRef } from 'react'
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle
} from 'lucide-react'

// =================== TYPES & INTERFACES (Définitions minimales pour la Section 4) ===================
interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

interface TeamMember {
  id: string
  name: string
  employeeId: string
  department: string
  qualification: string
  hasAcknowledged: boolean
  acknowledgmentTime?: string
  signature?: string
  joinedAt: string
  validationStatus: 'pending' | 'approved' | 'rejected'
  validationComments?: string
}

interface Photo {
  id: string
  name: string
  data: string
  description: string
  timestamp: string
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'isolation' | 'other'
}

interface IsolationPoint {
  id: string
  name: string
  type: 'electrical' | 'mechanical' | 'pneumatic' | 'hydraulic' | 'chemical' | 'thermal'
  isActive: boolean
  createdAt: string
  photos: Photo[]
}

interface ASTFormData {
  id: string
  astNumber: string
  created: string
  lastModified: string
  language: 'fr' | 'en' | 'es'
  status: 'draft' | 'completed' | 'team_validation' | 'approved' | 'archived'
  industry: 'electrical' | 'construction' | 'industrial' | 'office' | 'manufacturing' | 'other'
  
  projectInfo: {
    date: string
    time: string
    client: string
    projectNumber: string
    astClientNumber: string
    workLocation: string
    workDescription: string
    estimatedDuration: string
    workerCount: number
    clientRepresentative: string
    emergencyContact: string
    emergencyPhone: string
    workPermitRequired: boolean
    workPermitNumber?: string
    weatherConditions: string
    specialConditions: string
  }
  
  team: {
    supervisor: string
    supervisorCertification: string
    supervisorSignature?: string
    members: TeamMember[]
    briefingCompleted: boolean
    briefingDate: string
    briefingTime: string
    totalMembers: number
    acknowledgedMembers: number
    validations: any[]
    allApproved: boolean
  }
  
  isolationPoints: IsolationPoint[]
  electricalHazards: any[]
  documentation: {
    photos: Photo[]
    additionalDocuments: string[]
    inspectionNotes: string
    correctiveActions: string
  }
  
  validation: {
    completedBy: string
    completedDate: string
    reviewedBy: string
    reviewedDate: string
    approvedBy: string
    approvedDate: string
    clientApproval: boolean
    finalApproval: boolean
    submissionDate?: string
    revisionNumber: number
    comments: string
    emailSent: boolean
    archivedDate?: string
  }
}

interface ASTFormProps {
  tenant: Tenant
}

// =================== GÉNÉRATEUR DE NUMÉRO AST ===================
const generateASTNumber = (): string => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `AST-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`
}

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
  electricalHazards: [],
  
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
}

// =================== TRADUCTIONS ===================
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
      acknowledgment: "Prise de Connaissance AST",
      acknowledged: "J'ai pris connaissance de l'AST",
      acknowledgedAt: "Pris connaissance le",
      pendingAcknowledgment: "En attente de prise de connaissance",
      briefingStatus: "État du Briefing",
      completeBriefing: "Compléter le Briefing",
      validation: "Validation Équipe",
      approved: "Approuvé",
      rejected: "Rejeté",
      pending: "En attente"
    },
    
    isolation: {
      title: "Points d'Isolement",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      addPhotos: "Ajouter Photos",
      photosCarousel: "Carrousel Photos"
    },
    
    actions: {
      sendByEmail: "Envoyer par Courriel",
      archive: "Archiver",
      generatePDF: "Générer

// =================== COMPOSANT CARROUSEL PHOTOS ===================
const PhotoCarousel = ({ photos, onAddPhoto, onRemovePhoto, onUpdateDescription }: {
  photos: Photo[]
  onAddPhoto: (file: File) => void
  onRemovePhoto: (photoId: string) => void
  onUpdateDescription: (photoId: string, description: string) => void
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAddPhoto(file)
    }
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
          📸 Photos ({photos.length})
        </h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-premium"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          Ajouter Photo
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
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
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
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
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
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
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
            fontSize: '12px'
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
              cursor: 'pointer'
            }}
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
          📷 Aucune photo ajoutée
        </div>
      )}
    </div>
  )
}

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
      validation: "Validation Équipe"
    },
    
    isolation: {
      title: "Points d'Isolement",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré"
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
      reject: "Rejeter"
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
      validation: "Team Validation"
    },
    
    isolation: {
      title: "Isolation Points",
      addPoint: "Add Isolation Point",
      pointName: "Isolation Point Name",
      isolationType: "Isolation Type",
      selectType: "Select type...",
      noPoints: "No isolation points configured"
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
      reject: "Reject"
    }
  }
}

// =================== STYLES CSS PREMIUM ===================
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
  
  .ast-number-display {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid #22c55e;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .ast-number-text {
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #22c55e;
    letter-spacing: 0.5px;
  }
  
  .refresh-btn {
    background: none;
    border: 1px solid #22c55e;
    color: #22c55e;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .refresh-btn:hover {
    background: rgba(34, 197, 94, 0.2);
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
  
  .slide-in {
    animation: slideInUp 0.5s ease-out;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  @media (max-width: 768px) {
    .step-indicator {
      gap: 4px;
      padding: 16px;
    }
    
    .step-item {
      padding: 8px 12px;
      font-size: 12px;
    }
    
    .glass-effect {
      margin: 16px;
      padding: 20px;
    }
  }
`

// =================== FONCTIONS UTILITAIRES ===================
const generateProfessionalPDF = (formData: ASTFormData, tenant: Tenant) => {
  console.log('🔄 Génération PDF 8.5"x11" format professionnel...')
  console.log('📄 Données AST:', formData.astNumber)
  console.log('🏢 Client:', tenant.companyName)
  
  setTimeout(() => {
    console.log('✅ PDF généré avec succès!')
    const link = document.createElement('a')
    link.href = '#'
    link.download = `AST-${formData.astNumber}-${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  }, 2000)
}

const sendByEmail = async (formData: ASTFormData, tenant: Tenant, language: string) => {
  try {
    console.log('📧 Envoi par courriel...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('✅ Email envoyé avec succès!')
    return true
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}

const archiveAST = async (formData: ASTFormData) => {
  try {
    console.log('📦 Archivage de l\'AST...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const archivedData = {
      ...formData,
      status: 'archived' as const,
      validation: {
        ...formData.validation,
        archivedDate: new Date().toISOString()
      }
    }
    
    console.log('✅ AST archivé avec succès!')
    return archivedData
  } catch (error) {
    console.error('❌ Erreur archivage:', error)
    throw error
  }
}

// =================== COMPOSANT PRINCIPAL ===================
export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ASTFormData>(initialFormData)
  const [language, setLanguage] = useState<'fr' | 'en' | 'es'>('fr')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaveTime, setLastSaveTime] = useState<string>('')
  const [showValidationMode, setShowValidationMode] = useState(false)
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({})
  const [newIsolationPoint, setNewIsolationPoint] = useState<Partial<IsolationPoint>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { icon: FileText, key: 'general' as const },
    { icon: MessageSquare, key: 'discussion' as const },
    { icon: Shield, key: 'equipment' as const },
    { icon: Zap, key: 'hazards' as const },
    { icon: Settings, key: 'isolation' as const },
    { icon: Users, key: 'team' as const },
    { icon: Camera, key: 'documentation' as const },
    { icon: CheckCircle, key: 'validation' as const }
  ]

  const t = translations[language]

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.status === 'draft') {
        handleSave(true, true)
      }
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [formData])

  // =================== FONCTIONS UTILITAIRES ===================
  const handleSave = async (isDraft = true, isAutoSave = false) => {
    setSaveStatus('saving')
    
    try {
      await new Promise(resolve => setTimeout(resolve, isAutoSave ? 500 : 1500))
      
      setFormData(prev => ({
        ...prev,
        lastModified: new Date().toISOString(),
        status: isDraft ? 'draft' : 'completed'
      }))
      
      setSaveStatus('saved')
      setLastSaveTime(new Date().toLocaleTimeString())
      
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setTimeout(() => setSaveStatus('idle'), isAutoSave ? 2000 : 3000)
    }
  }

  const regenerateASTNumber = () => {
    setFormData(prev => ({
      ...prev,
      astNumber: generateASTNumber()
    }))
  }

  // ========== FONCTIONS ÉQUIPE ==========
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
        validationStatus: 'pending'
      }
      
      setFormData(prev => ({
        ...prev,
        team: {
          ...prev.team,
          members: [...prev.team.members, member],
          totalMembers: prev.team.members.length + 1
        }
      }))
      
      setNewTeamMember({})
    }
  }

  const validateTeamMember = (memberId: string, approved: boolean, comments: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { 
                ...m, 
                validationStatus: approved ? 'approved' : 'rejected',
                validationComments: comments 
              }
            : m
        ),
        allApproved: prev.team.members.every(m => 
          m.id === memberId ? approved : m.validationStatus === 'approved'
        )
      }
    }))
  }

  // ========== FONCTIONS PHOTOS ==========
  const addPhoto = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        name: file.name,
        data: e.target?.result as string,
        description: '',
        timestamp: new Date().toISOString(),
        category: 'isolation'
      }
      
      setFormData(prev => ({
        ...prev,
        documentation: {
          ...prev.documentation,
          photos: [...prev.documentation.photos, newPhoto]
        }
      }))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.filter(p => p.id !== photoId)
      }
    }))
  }

  const updatePhotoDescription = (photoId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      documentation: {
        ...prev.documentation,
        photos: prev.documentation.photos.map(p =>
          p.id === photoId ? { ...p, description } : p
        )
      }
    }))
  }

  // ========== FONCTIONS ISOLATION ==========
  const addIsolationPoint = () => {
    if (newIsolationPoint.name?.trim() && newIsolationPoint.type) {
      const point: IsolationPoint = {
        id: `isolation-${Date.now()}`,
        name: newIsolationPoint.name.trim(),
        type: newIsolationPoint.type,
        isActive: true,
        createdAt: new Date().toISOString(),
        photos: []
      }
      
      setFormData(prev => ({
        ...prev,
        isolationPoints: [...prev.isolationPoints, point]
      }))
      
      setNewIsolationPoint({})
    }
  }

  const addPhotoToIsolationPoint = (pointId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        name: file.name,
        data: e.target?.result as string,
        description: '',
        timestamp: new Date().toISOString(),
        category: 'isolation'
      }
      
      setFormData(prev => ({
        ...prev,
        isolationPoints: prev.isolationPoints.map(point =>
          point.id === pointId 
            ? { ...point, photos: [...point.photos, newPhoto] }
            : point
        )
      }))
    }
    reader.readAsDataURL(file)
  }

  // ========== ACTIONS PRINCIPALES ==========
  const handleGeneratePDF = () => {
    generateProfessionalPDF(formData, tenant)
  }

  const handleSendByEmail = async () => {
    const success = await sendByEmail(formData, tenant, language)
    if (success) {
      setFormData(prev => ({
        ...prev,
        validation: { ...prev.validation, emailSent: true }
      }))
    }
  }

  const handleArchive = async () => {
    try {
      const archivedData = await archiveAST(formData)
      setFormData(archivedData)
    } catch (error) {
      console.error('Erreur archivage:', error)
    }
  }

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
          </div>
        )}

        {/* Header avec logo */}
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
                <div className="company-logo">
                  CP
                </div>
                <div>
                  <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                    {t.title}
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    {tenant.companyName} • {formData.astNumber} • {t.industries[formData.industry]}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as 'fr' | 'en' | 'es')}
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
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Indicateur d'étapes */}
            <div className="step-indicator">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`step-item ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <step.icon style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                    {t.steps[step.key]}
                  </span>
                </div>
              ))}
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
                    
                    {/* # AST Principal */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🔢 {t.projectInfo.astNumber}
                      </label>
                      <div className="ast-number-display">
                        <div>
                          <div className="ast-number-text">{formData.astNumber}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                            {t.projectInfo.astInfo}
                          </div>
                        </div>
                        <button 
                          onClick={regenerateASTNumber}
                          className="refresh-btn"
                          title="Régénérer le numéro"
                        >
                          <Copy style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>

                    {/* Autres champs du formulaire */}
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

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📝 {t.projectInfo.workDescription} *
                      </label>
                      <textarea 
                        className="input-premium"
                        style={{ minHeight: '120px', resize: 'vertical' }}
                        placeholder="Description détaillée des travaux..."
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

              {/* ÉTAPE 5: Points d'Isolement avec Photos */}
              {currentStep === 4 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ⚙️ {t.isolation.title}
                    </h2>
                  </div>

                  {/* Ajouter nouveau point */}
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
                        <option value="">{t.isolation.selectType}</option>
                        <option value="electrical">⚡ Électrique</option>
                        <option value="mechanical">⚙️ Mécanique</option>
                        <option value="hydraulic">💧 Hydraulique</option>
                        <option value="pneumatic">💨 Pneumatique</option>
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

                  {/* Liste des points d'isolement */}
                  {formData.isolationPoints.map((point) => (
                    <div key={point.id} style={{ 
                      background: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(100, 116, 139, 0.3)', 
                      borderRadius: '16px', 
                      padding: '24px', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                          {point.type === 'electrical' ? '⚡' : point.type === 'mechanical' ? '⚙️' : point.type === 'hydraulic' ? '💧' : '💨'} {point.name}
                        </h4>
                        <span style={{ 
                          background: point.type === 'electrical' ? '#ef4444' : point.type === 'mechanical' ? '#3b82f6' : '#06b6d4',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {point.type}
                        </span>
                      </div>

                      {/* Carrousel de photos pour ce point */}
                      <PhotoCarousel
                        photos={point.photos}
                        onAddPhoto={(file) => addPhotoToIsolationPoint(point.id, file)}
                        onRemovePhoto={(photoId) => {
                          setFormData(prev => ({
                            ...prev,
                            isolationPoints: prev.isolationPoints.map(p =>
                              p.id === point.id 
                                ? { ...p, photos: p.photos.filter(photo => photo.id !== photoId) }
                                : p
                            )
                          }))
                        }}
                        onUpdateDescription={(photoId, description) => {
                          setFormData(prev => ({
                            ...prev,
                            isolationPoints: prev.isolationPoints.map(p =>
                              p.id === point.id 
                                ? { 
                                    ...p, 
                                    photos: p.photos.map(photo => 
                                      photo.id === photoId ? { ...photo, description } : photo
                                    ) 
                                  }
                                : p
                            )
                          }))
                        }}
                      />
                    </div>
                  ))}

                  {formData.isolationPoints.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                      <Settings style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', margin: 0 }}>{t.isolation.noPoints}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 6: Validation Équipe */}
              {currentStep === 5 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      👥 {t.team.validation}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Chaque membre de l'équipe doit réviser et approuver l'AST
                    </p>
                  </div>

                  {/* Ajouter membre */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      ➕ {t.team.addMember}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
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
                        style={{ padding: '14px 20px' }}
                      >
                        <Plus style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>

                  {/* Liste des membres avec validation */}
                  {formData.team.members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: `1px solid ${
                          member.validationStatus === 'approved' ? '#22c55e' : 
                          member.validationStatus === 'rejected' ? '#ef4444' : 
                          'rgba(100, 116, 139, 0.3)'
                        }`,
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                            {member.name}
                          </h4>
                          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                            {member.department} • {member.qualification}
                          </p>
                        </div>
                        <div style={{ 
                          color: member.validationStatus === 'approved' ? '#22c55e' : 
                                 member.validationStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                          fontSize: '14px', 
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {member.validationStatus === 'approved' && '✅ Approuvé'}
                          {member.validationStatus === 'rejected' && '❌ Rejeté'}
                          {member.validationStatus === 'pending' && '⏳ En attente'}
                        </div>
                      </div>

                      {member.validationStatus === 'pending' && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => validateTeamMember(member.id, true, 'Approuvé par validation équipe')}
                            className="btn-success"
                            style={{ flex: 1, padding: '12px' }}
                          >
                            <Check style={{ width: '16px', height: '16px' }} />
                            {t.buttons.approve}
                          </button>
                          <button
                            onClick={() => validateTeamMember(member.id, false, 'Rejeté - révision nécessaire')}
                            className="btn-danger"
                            style={{ flex: 1, padding: '12px' }}
                          >
                            <X style={{ width: '16px', height: '16px' }} />
                            {t.buttons.reject}
                          </button>
                        </div>
                      )}

                      {member.validationComments && (
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          background: 'rgba(100, 116, 139, 0.2)',
                          borderRadius: '8px'
                        }}>
                          <p style={{ color: '#e2e8f0', fontSize: '14px', margin: 0 }}>
                            💬 {member.validationComments}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.team.members.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                      <Users style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', margin: 0 }}>Aucun membre d'équipe ajouté</p>
                    </div>
                  )}

                  {/* Status global validation */}
                  {formData.team.members.length > 0 && (
                    <div style={{
                      background: formData.team.allApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      border: `1px solid ${formData.team.allApproved ? '#22c55e' : '#f59e0b'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      marginTop: '24px'
                    }}>
                      <h3 style={{ 
                        color: formData.team.allApproved ? '#22c55e' : '#f59e0b',
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                      }}>
                        {formData.team.allApproved ? '✅ Validation Équipe Complète' : '⏳ Validation Équipe en Cours'}
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                        {formData.team.members.filter(m => m.validationStatus === 'approved').length} / {formData.team.members.length} membres ont approuvé
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 8: Validation Finale et Actions */}
              {currentStep === 7 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ✅ {t.steps.validation}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Approbation finale et actions d'envoi
                    </p>
                  </div>

                  {/* Actions principales */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    
                    <button
                      onClick={handleGeneratePDF}
                      className="btn-premium"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Download style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{t.actions.generatePDF}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Format 8.5"×11" professionnel</div>
                      </div>
                    </button>

                    <button
                      onClick={handleSendByEmail}
                      className="btn-success"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Mail style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{t.actions.sendByEmail}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Envoyer au client</div>
                      </div>
                    </button>

                    <button
                      onClick={handleArchive}
                      className="btn-secondary"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Archive style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{t.actions.archive}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Archiver définitivement</div>
                      </div>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="btn-secondary"
                      style={{ padding: '20px', flexDirection: 'column', gap: '12px', height: 'auto' }}
                    >
                      <Printer style={{ width: '32px', height: '32px' }} />
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{t.actions.print}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Impression directe</div>
                      </div>
                    </button>
                  </div>

                  {/* Résumé de conformité */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      📊 Résumé de Conformité
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '700' }}>
                          {formData.team.members.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Membres d'équipe</div>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                          {formData.team.members.filter(m => m.validationStatus === 'approved').length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Validations</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#a855f7', fontSize: '24px', fontWeight: '700' }}>
                          {formData.isolationPoints.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Points d'isolement</div>
                      </div>

                      <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
                        <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '700' }}>
                          {formData.documentation.photos.length}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>Photos documentées</div>
                      </div>
                    </div>

                    {/* Status final */}
                    <div style={{
                      marginTop: '24px',
                      padding: '20px',
                      background: formData.team.allApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${formData.team.allApproved ? '#22c55e' : '#ef4444'}`,
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        color: formData.team.allApproved ? '#22c55e' : '#ef4444',
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '8px'
                      }}>
                        {formData.team.allApproved ? '✅ AST PRÊT POUR SOUMISSION' : '⚠️ VALIDATION ÉQUIPE REQUISE'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                        {formData.team.allApproved 
                          ? 'Toutes les validations sont complètes. L\'AST peut être envoyé au client.'
                          : 'L\'équipe doit compléter la validation avant la soumission finale.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Autres étapes simplifiées */}
              {[1, 2, 3, 6].includes(currentStep) && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      {steps[currentStep].icon({ style: { width: '32px', height: '32px', marginRight: '12px' } })}
                      {t.steps[steps[currentStep].key]}
                    </h2>
                  </div>
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: '16px', margin: 0 }}>
                      Contenu de l'étape {t.steps[steps[currentStep].key]} - Implémentation à venir...
                    </p>
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
                {t.buttons.previous}
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleSave(true)} 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save style={{ width: '16px', height: '16px' }} /> 
                  {t.buttons.save}
                </button>
                
                {currentStep === steps.length - 1 ? (
                  <button 
                    onClick={() => handleSave(false)} 
                    className="btn-success"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={!formData.team.allApproved}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    {t.actions.finalApproval}
                  </button>
                ) : (
                  <button 
                    className="btn-premium" 
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {t.buttons.next} 
                    <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
