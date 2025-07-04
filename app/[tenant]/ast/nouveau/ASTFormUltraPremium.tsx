// =================== AST SECTION 1 V3 - INTERFACES MISES À JOUR ===================
// Section 1: Interfaces avec nouveaux champs client et responsable

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, MessageSquare, Shield, Zap, Settings, Users, Camera, CheckCircle,
  ChevronLeft, ChevronRight, Save, Download, Send, Copy, Check, X, Plus, Trash2,
  ArrowLeft, ArrowRight, Eye, Mail, Archive, Printer, Upload, Star, AlertTriangle,
  Edit, Clock, User, Phone, MapPin, Calendar, Briefcase, HardHat, Heart, Activity,
  Lock, Unlock
} from 'lucide-react';

// =================== INTERFACES MISES À JOUR ===================
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
    clientPhone: string; // NOUVEAU
    projectNumber: string;
    astClientNumber: string;
    workLocation: string;
    workDescription: string;
    estimatedDuration: string;
    workerCount: number;
    clientRepresentative: string;
    clientRepresentativePhone: string; // NOUVEAU
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
    clientPhone: '', // NOUVEAU
    projectNumber: '',
    astClientNumber: '',
    workLocation: '',
    workDescription: '',
    estimatedDuration: '',
    workerCount: 1,
    clientRepresentative: '',
    clientRepresentativePhone: '', // NOUVEAU
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

// Reste des interfaces inchangées...
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
    cadenasReleve: boolean; // Gardé pour compatibilité mais pas affiché
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
// =================== TRADUCTIONS MISES À JOUR V3 ===================

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
      clientPhone: "# Téléphone Client", // NOUVEAU
      projectNumber: "Numéro de Projet",
      workDescription: "Description des Travaux",
      workLocation: "Lieu des Travaux",
      clientRepresentative: "Nom du Responsable", // NOUVEAU
      clientRepresentativePhone: "# Téléphone Responsable", // NOUVEAU
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
      clientPhone: "Client Phone #", // NOUVEAU
      projectNumber: "Project Number",
      workDescription: "Work Description",
      workLocation: "Work Location",
      clientRepresentative: "Representative Name", // NOUVEAU
      clientRepresentativePhone: "Representative Phone #", // NOUVEAU
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
  // =================== SECTION 5 V3 - ÉTAPE 1 MISE À JOUR ===================
// Étape 1: Informations Générales avec nouveaux champs

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

      {/* NOUVEAU: Téléphone Client */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📞 # Téléphone Client
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

      {/* NOUVEAU: Nom du Responsable */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          👤 Nom du Responsable
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

      {/* NOUVEAU: Téléphone Responsable */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📞 # Téléphone Responsable
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

      {/* Lieu des travaux */}
      <div>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📍 Lieu des Travaux
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
          📝 Description des Travaux *
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
              ⏱️ Durée Estimée
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
              🚨 Contact d'Urgence
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
              📞 # Urgence
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
