'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Send, Camera, Plus, X, Check, Upload, FileText, Users, Shield, 
  AlertTriangle, Clock, MapPin, Calendar, ChevronRight, ChevronLeft, Eye, Download,
  Zap, Target, Award, CheckCircle, XCircle, Image as ImageIcon, BookOpen, Star, 
  Copy, Filter, Search, MessageSquare, Heart, Phone, User, Building, Hash,
  Timer, UserCheck, ClipboardList, Headphones, HardHat, Wrench, Settings
} from 'lucide-react'

// =================== INTERFACES ===================
interface Tenant {
  id: string
  subdomain: string
  companyName: string
}

interface Worker {
  id: string
  name: string
  employeeId: string
  department: string
  qualification: string
  signature?: string
  departureTime?: string
}

interface ElectricalHazard {
  id: string
  code: string
  title: string
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  controlMeasures: string[]
  isSelected: boolean
  additionalNotes?: string
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
  category: 'site' | 'equipment' | 'hazard' | 'team' | 'other'
}

interface ASTFormData {
  id: string
  created: string
  lastModified: string
  language: 'fr' | 'en' | 'es'
  status: 'draft' | 'completed' | 'approved' | 'archived'
  
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
    workers: Worker[]
    totalWorkers: number
    briefingAttendees: string[]
  }
  
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
  }
}

interface ASTFormProps {
  tenant: Tenant
}

// =================== 14 DANGERS ÉLECTRIQUES (Excel MDL) ===================
const predefinedElectricalHazards: ElectricalHazard[] = [
  {
    id: 'h0', code: '0', title: 'RISQUE ÉLECTRIQUE',
    description: 'Exposition aux tensions électriques dangereuses',
    riskLevel: 'critical',
    controlMeasures: [
      'Coupure et verrouillage des sources d\'énergie',
      'Vérification de l\'absence de tension',
      'Mise à la terre des équipements',
      'Délimitation de la zone de travail'
    ],
    isSelected: false
  },
  {
    id: 'h1', code: '1', title: 'APPAREILLAGE SOUS-TENSION',
    description: 'Travail à proximité d\'équipement électrique énergisé',
    riskLevel: 'critical',
    controlMeasures: [
      'Port d\'équipement de protection individuelle arc électrique',
      'Maintien des distances de sécurité',
      'Surveillance continue par personne qualifiée',
      'Utilisation d\'outils isolés'
    ],
    isSelected: false
  },
  {
    id: 'h2', code: '2', title: 'MACHINE - OUTIL ROTATIF',
    description: 'Utilisation d\'équipements avec parties rotatives exposées',
    riskLevel: 'high',
    controlMeasures: [
      'Protection des parties mobiles',
      'Formation spécifique sur l\'équipement',
      'Inspection avant utilisation',
      'Port d\'EPI approprié'
    ],
    isSelected: false
  },
  {
    id: 'h3', code: '3', title: 'LEVAGE MÉCANIQUE',
    description: 'Opérations de levage avec équipements mécaniques',
    riskLevel: 'high',
    controlMeasures: [
      'Inspection de l\'équipement de levage',
      'Signaleur qualifié',
      'Délimitation de la zone de levage',
      'Plan de levage approuvé'
    ],
    isSelected: false
  },
  {
    id: 'h4', code: '4', title: 'MANUTENTION MANUELLE',
    description: 'Soulèvement et transport manuel de charges',
    riskLevel: 'medium',
    controlMeasures: [
      'Formation sur les techniques de levage',
      'Utilisation d\'aides mécaniques si possible',
      'Travail en équipe pour charges lourdes',
      'Échauffement avant les tâches'
    ],
    isSelected: false
  },
  {
    id: 'h5', code: '5', title: 'SUBSTANCES DANGEREUSES',
    description: 'Exposition à des produits chimiques ou substances toxiques',
    riskLevel: 'high',
    controlMeasures: [
      'Fiches de données de sécurité disponibles',
      'Ventilation adéquate',
      'EPI de protection respiratoire',
      'Formation SIMDUT'
    ],
    isSelected: false
  },
  {
    id: 'h6', code: '6', title: 'ESPACES CLOS',
    description: 'Travail en espace confiné ou restreint',
    riskLevel: 'critical',
    controlMeasures: [
      'Permis d\'entrée en espace clos',
      'Test atmosphérique continu',
      'Surveillance externe constante',
      'Équipement de sauvetage disponible'
    ],
    isSelected: false
  },
  {
    id: 'h7', code: '7', title: 'BRUIT EXCESSIF',
    description: 'Exposition à des niveaux sonores dangereux',
    riskLevel: 'medium',
    controlMeasures: [
      'Mesure des niveaux sonores',
      'Protection auditive obligatoire',
      'Rotation des travailleurs',
      'Contrôle à la source si possible'
    ],
    isSelected: false
  },
  {
    id: 'h8', code: '8', title: 'RAYONNEMENT',
    description: 'Exposition à des radiations ionisantes ou non-ionisantes',
    riskLevel: 'high',
    controlMeasures: [
      'Dosimètres personnels',
      'Délimitation des zones radioactives',
      'Formation radiation',
      'Temps d\'exposition limité'
    ],
    isSelected: false
  },
  {
    id: 'h9', code: '9', title: 'RISQUE DE CHUTE',
    description: 'Travail en hauteur ou sur surfaces glissantes',
    riskLevel: 'high',
    controlMeasures: [
      'Harnais de sécurité et ligne de vie',
      'Garde-corps et filets de sécurité',
      'Inspection des équipements de protection',
      'Formation travail en hauteur'
    ],
    isSelected: false
  },
  {
    id: 'h10', code: '10', title: 'VÉHICULES ET ÉQUIPEMENTS MOBILES',
    description: 'Circulation d\'équipements lourds sur le site',
    riskLevel: 'high',
    controlMeasures: [
      'Signalisation et balisage',
      'Communication radio',
      'Vêtements haute visibilité',
      'Zones piétonnes délimitées'
    ],
    isSelected: false
  },
  {
    id: 'h11', code: '11', title: 'TEMPÉRATURE EXTRÊME',
    description: 'Exposition au froid intense ou à la chaleur excessive',
    riskLevel: 'medium',
    controlMeasures: [
      'Vêtements adaptés aux conditions',
      'Pauses régulières',
      'Hydratation appropriée',
      'Surveillance des signes de stress thermique'
    ],
    isSelected: false
  },
  {
    id: 'h12', code: '12', title: 'INCENDIE / EXPLOSION',
    description: 'Risque d\'incendie ou d\'explosion sur le site',
    riskLevel: 'critical',
    controlMeasures: [
      'Élimination des sources d\'ignition',
      'Surveillance des atmosphères explosives',
      'Équipements anti-déflagrants',
      'Plan d\'évacuation d\'urgence'
    ],
    isSelected: false
  },
  {
    id: 'h13', code: '13', title: 'AUTRES RISQUES',
    description: 'Autres dangers spécifiques au site ou à la tâche',
    riskLevel: 'medium',
    controlMeasures: [
      'Analyse spécifique du risque',
      'Mesures de contrôle adaptées',
      'Formation supplémentaire si requise',
      'Surveillance renforcée'
    ],
    isSelected: false
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
  },
  {
    id: 'eq5',
    name: 'DÉTECTEUR DE TENSION',
    required: false,
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
  id: `AST-${Date.now()}`,
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  language: 'fr',
  status: 'draft',
  
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
    workers: [],
    totalWorkers: 0,
    briefingAttendees: []
  },
  
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
    comments: ''
  }
}
// =================== TRADUCTIONS COMPLÈTES ===================
const translations = {
  fr: {
    title: "Nouvelle Analyse Sécuritaire de Tâches",
    subtitle: "Formulaire complet conforme aux normes CNESST et standards MDL",
    saving: "Sauvegarde en cours...",
    saved: "✅ Sauvegardé avec succès",
    autoSaved: "Sauvegarde automatique",
    
    steps: {
      general: "Informations Générales",
      discussion: "Discussion Équipe", 
      equipment: "Équipements Sécurité",
      hazards: "Dangers Électriques",
      team: "Équipe de Travail",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    
    projectInfo: {
      title: "Informations du Projet",
      date: "Date",
      time: "Heure",
      client: "Client",
      projectNumber: "Numéro de Projet",
      astClientNumber: "Numéro AST Client",
      workLocation: "Lieu des Travaux",
      workDescription: "Description des Travaux",
      estimatedDuration: "Durée Estimée",
      workerCount: "Nombre de Travailleurs",
      clientRep: "Représentant Client",
      emergencyContact: "Contact d'Urgence",
      emergencyPhone: "Téléphone d'Urgence",
      workPermit: "Permis de Travail Requis",
      workPermitNumber: "Numéro de Permis",
      weather: "Conditions Météo",
      specialConditions: "Conditions Spéciales"
    },
    
    teamDiscussion: {
      title: "Discussion avec l'Équipe",
      electricalCutoff: "Points de Coupure Électrique",
      hazardExplanation: "Explication des Dangers Électriques",
      epiNotes: "Notes Spécifiques sur les EPI",
      workConditions: "Conditions Spéciales de Travail",
      emergencyProc: "Procédures d'Urgence",
      briefingCompleted: "Briefing Complété",
      addDiscussion: "Ajouter une Discussion"
    },
    
    safetyEquipment: {
      title: "Équipements de Sécurité",
      required: "Obligatoire",
      available: "Disponible",
      verified: "Vérifié",
      notes: "Notes",
      addEquipment: "Ajouter Équipement"
    },
    
    electricalHazards: {
      title: "Dangers Électriques Identifiés",
      selectAll: "Sélectionner Tout",
      deselectAll: "Désélectionner Tout",
      riskLevel: "Niveau de Risque",
      controlMeasures: "Mesures de Contrôle",
      additionalNotes: "Notes Additionnelles"
    },
    
    team: {
      title: "Équipe de Travail",
      supervisor: "Superviseur",
      certification: "Certification",
      addWorker: "Ajouter Travailleur",
      workerName: "Nom du Travailleur",
      employeeId: "ID Employé",
      department: "Département",
      qualification: "Qualification",
      departureTime: "Heure de Départ"
    },
    
    documentation: {
      title: "Documentation & Photos",
      addPhoto: "Ajouter Photo",
      photoDescription: "Description de la Photo",
      inspectionNotes: "Notes d'Inspection",
      correctiveActions: "Actions Correctives"
    },
    
    validation: {
      title: "Validation & Signatures",
      completedBy: "Complété par",
      reviewedBy: "Révisé par", 
      approvedBy: "Approuvé par",
      clientApproval: "Approbation Client",
      comments: "Commentaires",
      submit: "Soumettre l'AST"
    },
    
    buttons: {
      previous: "Précédent",
      next: "Suivant", 
      save: "Sauvegarder",
      submit: "Soumettre",
      cancel: "Annuler",
      add: "Ajouter",
      remove: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      download: "Télécharger",
      print: "Imprimer"
    },
    
    riskLevels: {
      low: "Faible",
      medium: "Moyen", 
      high: "Élevé",
      critical: "Critique"
    }
  },
  
  en: {
    title: "New Job Safety Analysis",
    subtitle: "Complete form compliant with OHSA standards and MDL requirements",
    saving: "Saving...",
    saved: "✅ Successfully saved",
    autoSaved: "Auto-saved",
    
    steps: {
      general: "General Information",
      discussion: "Team Discussion",
      equipment: "Safety Equipment", 
      hazards: "Electrical Hazards",
      team: "Work Team",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    
    projectInfo: {
      title: "Project Information",
      date: "Date",
      time: "Time", 
      client: "Client",
      projectNumber: "Project Number",
      astClientNumber: "JSA Client Number",
      workLocation: "Work Location",
      workDescription: "Work Description",
      estimatedDuration: "Estimated Duration",
      workerCount: "Number of Workers",
      clientRep: "Client Representative",
      emergencyContact: "Emergency Contact",
      emergencyPhone: "Emergency Phone",
      workPermit: "Work Permit Required",
      workPermitNumber: "Permit Number",
      weather: "Weather Conditions",
      specialConditions: "Special Conditions"
    },
    
    teamDiscussion: {
      title: "Team Discussion",
      electricalCutoff: "Electrical Cutoff Points",
      hazardExplanation: "Electrical Hazard Explanation", 
      epiNotes: "PPE Specific Notes",
      workConditions: "Special Work Conditions",
      emergencyProc: "Emergency Procedures",
      briefingCompleted: "Briefing Completed",
      addDiscussion: "Add Discussion"
    },
    
    safetyEquipment: {
      title: "Safety Equipment",
      required: "Required",
      available: "Available",
      verified: "Verified",
      notes: "Notes",
      addEquipment: "Add Equipment"
    },
    
    electricalHazards: {
      title: "Identified Electrical Hazards",
      selectAll: "Select All",
      deselectAll: "Deselect All", 
      riskLevel: "Risk Level",
      controlMeasures: "Control Measures",
      additionalNotes: "Additional Notes"
    },
    
    team: {
      title: "Work Team",
      supervisor: "Supervisor",
      certification: "Certification",
      addWorker: "Add Worker",
      workerName: "Worker Name",
      employeeId: "Employee ID",
      department: "Department", 
      qualification: "Qualification",
      departureTime: "Departure Time"
    },
    
    documentation: {
      title: "Documentation & Photos",
      addPhoto: "Add Photo",
      photoDescription: "Photo Description",
      inspectionNotes: "Inspection Notes",
      correctiveActions: "Corrective Actions"
    },
    
    validation: {
      title: "Validation & Signatures",
      completedBy: "Completed by",
      reviewedBy: "Reviewed by",
      approvedBy: "Approved by", 
      clientApproval: "Client Approval",
      comments: "Comments",
      submit: "Submit JSA"
    },
    
    buttons: {
      previous: "Previous",
      next: "Next",
      save: "Save", 
      submit: "Submit",
      cancel: "Cancel",
      add: "Add",
      remove: "Remove",
      edit: "Edit",
      view: "View",
      download: "Download",
      print: "Print"
    },
    
    riskLevels: {
      low: "Low",
      medium: "Medium",
      high: "High", 
      critical: "Critical"
    }
  },
  
  es: {
    title: "Nuevo Análisis de Seguridad del Trabajo",
    subtitle: "Formulario completo conforme a estándares OHSA y requisitos MDL",
    saving: "Guardando...",
    saved: "✅ Guardado exitosamente",
    autoSaved: "Auto-guardado",
    
    steps: {
      general: "Información General",
      discussion: "Discusión del Equipo",
      equipment: "Equipo de Seguridad",
      hazards: "Peligros Eléctricos", 
      team: "Equipo de Trabajo",
      documentation: "Fotos y Documentación",
      validation: "Validación y Firmas"
    },
    
    projectInfo: {
      title: "Información del Proyecto",
      date: "Fecha",
      time: "Hora",
      client: "Cliente",
      projectNumber: "Número de Proyecto",
      astClientNumber: "Número AST Cliente", 
      workLocation: "Ubicación del Trabajo",
      workDescription: "Descripción del Trabajo",
      estimatedDuration: "Duración Estimada",
      workerCount: "Número de Trabajadores",
      clientRep: "Representante del Cliente",
      emergencyContact: "Contacto de Emergencia",
      emergencyPhone: "Teléfono de Emergencia",
      workPermit: "Permiso de Trabajo Requerido",
      workPermitNumber: "Número de Permiso",
      weather: "Condiciones Climáticas",
      specialConditions: "Condiciones Especiales"
    },
    
    teamDiscussion: {
      title: "Discusión del Equipo",
      electricalCutoff: "Puntos de Corte Eléctrico",
      hazardExplanation: "Explicación de Peligros Eléctricos",
      epiNotes: "Notas Específicas de EPP",
      workConditions: "Condiciones Especiales de Trabajo",
      emergencyProc: "Procedimientos de Emergencia",
      briefingCompleted: "Briefing Completado",
      addDiscussion: "Agregar Discusión"
    },
    
    safetyEquipment: {
      title: "Equipo de Seguridad",
      required: "Requerido",
      available: "Disponible",
      verified: "Verificado",
      notes: "Notas",
      addEquipment: "Agregar Equipo"
    },
    
    electricalHazards: {
      title: "Peligros Eléctricos Identificados",
      selectAll: "Seleccionar Todo",
      deselectAll: "Deseleccionar Todo",
      riskLevel: "Nivel de Riesgo",
      controlMeasures: "Medidas de Control",
      additionalNotes: "Notas Adicionales"
    },
    
    team: {
      title: "Equipo de Trabajo",
      supervisor: "Supervisor",
      certification: "Certificación",
      addWorker: "Agregar Trabajador",
      workerName: "Nombre del Trabajador",
      employeeId: "ID del Empleado",
      department: "Departamento",
      qualification: "Calificación",
      departureTime: "Hora de Salida"
    },
    
    documentation: {
      title: "Documentación y Fotos",
      addPhoto: "Agregar Foto",
      photoDescription: "Descripción de la Foto",
      inspectionNotes: "Notas de Inspección",
      correctiveActions: "Acciones Correctivas"
    },
    
    validation: {
      title: "Validación y Firmas",
      completedBy: "Completado por",
      reviewedBy: "Revisado por",
      approvedBy: "Aprobado por",
      clientApproval: "Aprobación del Cliente",
      comments: "Comentarios",
      submit: "Enviar AST"
    },
    
    buttons: {
      previous: "Anterior",
      next: "Siguiente",
      save: "Guardar",
      submit: "Enviar",
      cancel: "Cancelar",
      add: "Agregar",
      remove: "Eliminar",
      edit: "Editar",
      view: "Ver",
      download: "Descargar",
      print: "Imprimir"
    },
    
    riskLevels: {
      low: "Bajo",
      medium: "Medio",
      high: "Alto",
      critical: "Crítico"
    }
  }
}
// =================== COMPOSANT PRINCIPAL ===================
export default function ASTFormComplet({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ASTFormData>(initialFormData)
  const [language, setLanguage] = useState<'fr' | 'en' | 'es'>('fr')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaveTime, setLastSaveTime] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { icon: FileText, key: 'general' as const },
    { icon: MessageSquare, key: 'discussion' as const },
    { icon: Shield, key: 'equipment' as const },
    { icon: Zap, key: 'hazards' as const },
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
      
      if (!isDraft && !isAutoSave) {
        setTimeout(() => {
          window.location.href = `/${tenant.subdomain}/dashboard`
        }, 2000)
      }
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setTimeout(() => setSaveStatus('idle'), isAutoSave ? 2000 : 3000)
    }
  }

  const addWorker = () => {
    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: '',
      employeeId: '',
      department: '',
      qualification: '',
      departureTime: ''
    }
    
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: [...prev.team.workers, newWorker],
        totalWorkers: prev.team.workers.length + 1
      }
    }))
  }

  const removeWorker = (workerId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: prev.team.workers.filter(w => w.id !== workerId),
        totalWorkers: prev.team.workers.length - 1
      }
    }))
  }

  const toggleHazard = (hazardId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId ? { ...h, isSelected: !h.isSelected } : h
      )
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}`,
          name: file.name,
          data: e.target?.result as string,
          description: '',
          timestamp: new Date().toISOString(),
          category: 'site'
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
  }

  const generatePDF = () => {
    console.log('Génération PDF AST 8.5"x11"...')
  }

  return (
    <>
      {/* CSS PREMIUM INTÉGRÉ */}
      <style dangerouslySetInnerHTML={{ __html: `
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
        
        .hazard-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(100, 116, 139, 0.3);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .hazard-card:hover {
          transform: translateY(-2px);
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .hazard-card.selected {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
        
        .risk-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .risk-low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .risk-medium { background: rgba(251, 191, 36, 0.2); color: #f59e0b; }
        .risk-high { background: rgba(249, 115, 22, 0.2); color: #f97316; }
        .risk-critical { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        
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
        
        .equipment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }
        
        .equipment-item:hover {
          border-color: #3b82f6;
          background: rgba(30, 41, 59, 0.6);
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
      ` }} />

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

        {/* Header */}
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
                <Link href={`/${tenant.subdomain}/dashboard`}>
                  <ArrowLeft style={{ width: '24px', height: '24px', color: 'white', cursor: 'pointer' }} />
                </Link>
                <div>
                  <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                    {t.title}
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    {tenant.companyName} • {formData.id} • {t.steps[steps[currentStep].key]}
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
                  <option value="es">🇪🇸 Español</option>
                </select>
                
                <button 
                  onClick={() => handleSave(true)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                </button>
                
                <button 
                  onClick={generatePDF}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
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
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      {t.subtitle}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {/* Date et Heure */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📅 {t.projectInfo.date} *
                      </label>
                      <input 
                        type="date"
                        className="input-premium"
                        value={formData.projectInfo.date}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, date: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🕐 {t.projectInfo.time} *
                      </label>
                      <input 
                        type="time"
                        className="input-premium"
                        value={formData.projectInfo.time}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, time: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Client */}
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

                    {/* Numéro de Projet */}
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

                    {/* Lieu des Travaux */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📍 {t.projectInfo.workLocation} *
                      </label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Adresse complète du lieu des travaux"
                        value={formData.projectInfo.workLocation}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, workLocation: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Description des Travaux */}
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

              {/* ÉTAPE 2: Discussion Équipe */}
              {currentStep === 1 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      💬 {t.teamDiscussion.title}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Points importants discutés avec l'équipe
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Points de coupure électrique */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        ⚡ {t.teamDiscussion.electricalCutoff}
                      </label>
                      <textarea 
                        className="input-premium"
                        style={{ minHeight: '100px' }}
                        placeholder="Identifier les points de coupure, disjoncteurs, etc."
                        value={formData.teamDiscussion.electricalCutoffPoints}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          teamDiscussion: { ...prev.teamDiscussion, electricalCutoffPoints: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Discussions prédéfinies */}
                    <div>
                      <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                        Points de discussion obligatoires
                      </h3>
                      {formData.teamDiscussion.discussions.map((discussion) => (
                        <div key={discussion.id} style={{ 
                          background: 'rgba(30, 41, 59, 0.4)', 
                          border: '1px solid rgba(100, 116, 139, 0.2)', 
                          borderRadius: '12px', 
                          padding: '16px', 
                          marginBottom: '16px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              {discussion.topic}
                            </h4>
                            <div 
                              className={`checkbox-premium ${discussion.completed ? 'checked' : ''}`}
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                teamDiscussion: {
                                  ...prev.teamDiscussion,
                                  discussions: prev.teamDiscussion.discussions.map(d =>
                                    d.id === discussion.id ? { ...d, completed: !d.completed } : d
                                  )
                                }
                              }))}
                            >
                              {discussion.completed && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                            </div>
                          </div>
                          <textarea 
                            className="input-premium"
                            style={{ minHeight: '60px' }}
                            placeholder="Notes de discussion..."
                            value={discussion.notes}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              teamDiscussion: {
                                ...prev.teamDiscussion,
                                discussions: prev.teamDiscussion.discussions.map(d =>
                                  d.id === discussion.id ? { ...d, notes: e.target.value } : d
                                )
                              }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
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
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Vérification des équipements obligatoires et disponibles
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {formData.safetyEquipment.map((equipment) => (
                      <div key={equipment.id} className="equipment-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div 
                            className={`checkbox-premium ${equipment.available ? 'checked' : ''}`}
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              safetyEquipment: prev.safetyEquipment.map(eq =>
                                eq.id === equipment.id ? { ...eq, available: !eq.available } : eq
                              )
                            }))}
                          >
                            {equipment.available && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                              {equipment.name}
                            </h4>
                            {equipment.required && (
                              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                                * OBLIGATOIRE
                              </span>
                            )}
                          </div>
                          <input 
                            type="text"
                            className="input-premium"
                            style={{ maxWidth: '200px' }}
                            placeholder="Notes..."
                            value={equipment.notes}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              safetyEquipment: prev.safetyEquipment.map(eq =>
                                eq.id === equipment.id ? { ...eq, notes: e.target.value } : eq
                              )
                            }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ÉTAPE 4: Dangers Électriques */}
              {currentStep === 3 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ⚡ {t.electricalHazards.title}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Sélectionner les dangers applicables (14 dangers prédéfinis MDL)
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    {formData.electricalHazards.map((hazard) => (
                      <div 
                        key={hazard.id}
                        className={`hazard-card ${hazard.isSelected ? 'selected' : ''}`}
                        onClick={() => toggleHazard(hazard.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              background: '#3b82f6', 
                              color: 'white', 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: '700' 
                            }}>
                              {hazard.code}
                            </div>
                            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              {hazard.title}
                            </h3>
                          </div>
                          <div className={`risk-badge risk-${hazard.riskLevel}`}>
                            {t.riskLevels[hazard.riskLevel]}
                          </div>
                        </div>
                        
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                          {hazard.description}
                        </p>
                        
                        <div>
                          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                            {t.electricalHazards.controlMeasures}:
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {hazard.controlMeasures.map((measure, index) => (
                              <li key={index} style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>
                                {measure}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {hazard.isSelected && (
                          <div style={{ marginTop: '16px' }}>
                            <textarea 
                              className="input-premium"
                              style={{ minHeight: '60px' }}
                              placeholder="Notes additionnelles pour ce danger..."
                              value={hazard.additionalNotes || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                electricalHazards: prev.electricalHazards.map(h =>
                                  h.id === hazard.id ? { ...h, additionalNotes: e.target.value } : h
                                )
                              }))}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ÉTAPE 5: Équipe de Travail */}
              {currentStep === 4 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      👥 {t.team.title}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Informations sur l'équipe et les travailleurs
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Superviseur */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                          👤 {t.team.supervisor} *
                        </label>
                        <input 
                          type="text"
                          className="input-premium"
                          placeholder="Nom du superviseur"
                          value={formData.team.supervisor}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            team: { ...prev.team, supervisor: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                          🎓 {t.team.certification}
                        </label>
                        <input 
                          type="text"
                          className="input-premium"
                          placeholder="Certifications du superviseur"
                          value={formData.team.supervisorCertification}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            team: { ...prev.team, supervisorCertification: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Travailleurs */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                          Travailleurs ({formData.team.workers.length})
                        </h3>
                        <button onClick={addWorker} className="btn-premium">
                          <Plus style={{ width: '16px', height: '16px' }} />
                          {t.team.addWorker}
                        </button>
                      </div>

                      {formData.team.workers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                          Aucun travailleur ajouté
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {formData.team.workers.map((worker) => (
                            <div key={worker.id} style={{
                              background: 'rgba(30, 41, 59, 0.4)',
                              border: '1px solid rgba(100, 116, 139, 0.2)',
                              borderRadius: '12px',
                              padding: '20px'
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                                    {t.team.workerName}
                                  </label>
                                  <input 
                                    type="text"
                                    className="input-premium"
                                    placeholder="Nom complet"
                                    value={worker.name}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      team: {
                                        ...prev.team,
                                        workers: prev.team.workers.map(w =>
                                          w.id === worker.id ? { ...w, name: e.target.value } : w
                                        )
                                      }
                                    }))}
                                  />
                                </div>
                                
                                <div>
                                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                                    {t.team.qualification}
                                  </label>
                                  <input 
                                    type="text"
                                    className="input-premium"
                                    placeholder="Qualification/Métier"
                                    value={worker.qualification}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      team: {
                                        ...prev.team,
                                        workers: prev.team.workers.map(w =>
                                          w.id === worker.id ? { ...w, qualification: e.target.value } : w
                                        )
                                      }
                                    }))}
                                  />
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'end' }}>
                                  <button 
                                    onClick={() => removeWorker(worker.id)}
                                    className="btn-danger"
                                    style={{ padding: '8px' }}
                                  >
                                    <X style={{ width: '16px', height: '16px' }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 6: Documentation */}
              {currentStep === 5 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      📷 {t.documentation.title}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Photos et documentation du site
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Upload de photos */}
                    <div>
                      <input 
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-premium"
                      >
                        <Camera style={{ width: '16px', height: '16px' }} />
                        {t.documentation.addPhoto}
                      </button>
                    </div>

                    {/* Grille de photos */}
                    {formData.documentation.photos.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {formData.documentation.photos.map((photo) => (
                          <div key={photo.id} style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={photo.data} 
                              alt={photo.name}
                              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '12px' }}>
                              <input 
                                type="text"
                                className="input-premium"
                                placeholder="Description de la photo"
                                value={photo.description}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  documentation: {
                                    ...prev.documentation,
                                    photos: prev.documentation.photos.map(p =>
                                      p.id === photo.id ? { ...p, description: e.target.value } : p
                                    )
                                  }
                                }))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notes d'inspection */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📝 {t.documentation.inspectionNotes}
                      </label>
                      <textarea 
                        className="input-premium"
                        style={{ minHeight: '100px' }}
                        placeholder="Notes d'inspection du site..."
                        value={formData.documentation.inspectionNotes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documentation: { ...prev.documentation, inspectionNotes: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 7: Validation */}
              {currentStep === 6 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ✅ {t.validation.title}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Signatures et approbations finales
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                          ✍️ {t.validation.completedBy} *
                        </label>
                        <input 
                          type="text"
                          className="input-premium"
                          placeholder="Nom de la personne qui complète l'AST"
                          value={formData.validation.completedBy}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            validation: { ...prev.validation, completedBy: e.target.value }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                          👀 {t.validation.reviewedBy}
                        </label>
                        <input 
                          type="text"
                          className="input-premium"
                          placeholder="Nom du réviseur"
                          value={formData.validation.reviewedBy}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            validation: { ...prev.validation, reviewedBy: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        💬 {t.validation.comments}
                      </label>
                      <textarea 
                        className="input-premium"
                        style={{ minHeight: '100px' }}
                        placeholder="Commentaires finaux, observations..."
                        value={formData.validation.comments}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          validation: { ...prev.validation, comments: e.target.value }
                        }))}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        className={`checkbox-premium ${formData.validation.finalApproval ? 'checked' : ''}`}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          validation: { ...prev.validation, finalApproval: !prev.validation.finalApproval }
                        }))}
                      >
                        {formData.validation.finalApproval && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                      </div>
                      <label style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                        Approbation finale - AST prêt pour soumission
                      </label>
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
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                    disabled={!formData.validation.finalApproval}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    {t.validation.submit}
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
