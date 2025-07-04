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
}

interface IsolationPoint {
  id: string
  name: string
  type: 'electrical' | 'mechanical' | 'pneumatic' | 'hydraulic' | 'chemical' | 'thermal'
  isActive: boolean
  createdAt: string
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

interface ASTFormData {
  // ========== NUMÉROS AST AUTOMATIQUES ==========
  id: string
  astMDLNumber: string // Généré automatiquement - usage unique
  created: string
  lastModified: string
  language: 'fr' | 'en' | 'es'
  status: 'draft' | 'completed' | 'approved' | 'archived'
  industry: 'electrical' | 'construction' | 'industrial' | 'office' | 'manufacturing' | 'other'
  
  projectInfo: {
    date: string
    time: string
    client: string
    projectNumber: string
    astClientNumber: string // Numéro fourni par le client
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
  }
}

interface ASTFormProps {
  tenant: Tenant
}

// =================== GÉNÉRATEUR DE NUMÉRO AST MDL UNIQUE ===================
const generateASTMDLNumber = (): string => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  
  // Générer un identifiant unique avec timestamp + random
  const timestamp = Date.now().toString().slice(-6) // 6 derniers chiffres du timestamp
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  // Format: AST-MDL-YYYYMMDD-XXXXXX
  return `AST-MDL-${year}${month}${day}-${timestamp}${random.slice(0, 2)}`
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
// =================== DONNÉES INITIALES AVEC NUMÉROS AST ===================
const initialFormData: ASTFormData = {
  // ========== NUMÉROS AST AUTOMATIQUES ==========
  id: `AST-${Date.now()}`,
  astMDLNumber: generateASTMDLNumber(), // Généré automatiquement - usage unique
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  language: 'fr',
  status: 'draft',
  industry: 'electrical', // Par défaut
  
  projectInfo: {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    client: '',
    projectNumber: '',
    astClientNumber: '', // Numéro fourni par le client
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
    acknowledgedMembers: 0
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
    comments: ''
  }
}

// =================== TRADUCTIONS MISES À JOUR ===================
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
      astMDLNumber: "# AST MDL",
      astClientNumber: "# AST du Client",
      date: "Date",
      client: "Client",
      projectNumber: "Numéro de Projet",
      workDescription: "Description des Travaux",
      workLocation: "Lieu des Travaux",
      astMDLInfo: "Numéro généré automatiquement - usage unique",
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
      completeBriefing: "Compléter le Briefing"
    },
    
    isolation: {
      title: "Points d'Isolement",
      addPoint: "Ajouter Point d'Isolement",
      pointName: "Nom du Point d'Isolement",
      isolationType: "Type d'Isolement",
      selectType: "Sélectionner le type...",
      noPoints: "Aucun point d'isolement configuré",
      
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
    
    buttons: {
      previous: "Précédent",
      next: "Suivant",
      save: "Sauvegarder",
      add: "Ajouter",
      remove: "Supprimer",
      acknowledge: "Prendre Connaissance",
      createIsolation: "Créer Isolement"
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
      astMDLNumber: "# JSA MDL",
      astClientNumber: "# Client JSA",
      date: "Date",
      client: "Client",
      projectNumber: "Project Number",
      workDescription: "Work Description",
      workLocation: "Work Location",
      astMDLInfo: "Auto-generated unique number",
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
      completeBriefing: "Complete Briefing"
    },
    
    isolation: {
      title: "Isolation Points",
      addPoint: "Add Isolation Point",
      pointName: "Isolation Point Name",
      isolationType: "Isolation Type",
      selectType: "Select type...",
      noPoints: "No isolation points configured",
      
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
    
    buttons: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      add: "Add",
      remove: "Remove",
      acknowledge: "Acknowledge",
      createIsolation: "Create Isolation"
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
    subtitle: "Formulario adaptativo conforme a normas SST",
    saving: "Guardando...",
    saved: "✅ Guardado exitosamente",
    
    steps: {
      general: "Información General",
      discussion: "Discusión del Equipo",
      equipment: "Equipo de Seguridad",
      hazards: "Peligros y Riesgos",
      isolation: "Puntos de Aislamiento",
      team: "Equipo de Trabajo", 
      documentation: "Fotos y Documentación",
      validation: "Validación y Firmas"
    },
    
    projectInfo: {
      title: "Información del Proyecto",
      industry: "Tipo de Industria",
      astMDLNumber: "# AST MDL",
      astClientNumber: "# AST del Cliente",
      date: "Fecha",
      client: "Cliente",
      projectNumber: "Número de Proyecto",
      workDescription: "Descripción del Trabajo",
      workLocation: "Ubicación del Trabajo",
      astMDLInfo: "Número generado automáticamente - uso único",
      astClientInfo: "Número proporcionado por el cliente (opcional)"
    },
    
    industries: {
      electrical: "Eléctrico",
      construction: "Construcción",
      industrial: "Industrial",
      office: "Oficina/Administrativo",
      manufacturing: "Manufacturero",
      other: "Otro"
    },
    
    team: {
      title: "Equipo de Trabajo",
      supervisor: "Supervisor",
      addMember: "Agregar Miembro del Equipo",
      memberName: "Nombre del Miembro",
      employeeId: "ID del Empleado",
      department: "Departamento",
      qualification: "Calificación",
      acknowledgment: "Reconocimiento AST",
      acknowledged: "Reconozco este AST",
      acknowledgedAt: "Reconocido el",
      pendingAcknowledgment: "Pendiente de reconocimiento",
      briefingStatus: "Estado del Briefing",
      completeBriefing: "Completar Briefing"
    },
    
    isolation: {
      title: "Puntos de Aislamiento",
      addPoint: "Agregar Punto de Aislamiento",
      pointName: "Nombre del Punto de Aislamiento",
      isolationType: "Tipo de Aislamiento",
      selectType: "Seleccionar tipo...",
      noPoints: "No hay puntos de aislamiento configurados",
      
      electrical: {
        title: "Aislamiento Eléctrico",
        circuitName: "Nombre del Circuito",
        isolationManeuver: "Maniobra de Aislamiento",
        lockoutApplied: "Bloqueo aplicado",
        tensionVerified: "Ausencia de tensión verificada",
        groundingInstalled: "Puesta a tierra instalada",
        verification: "Método de Verificación",
        additionalSteps: "Pasos Adicionales"
      },
      
      mechanical: {
        title: "Aislamiento Mecánico",
        equipmentName: "Nombre del Equipo",
        lockoutType: "Tipo de Bloqueo",
        energySource: "Fuente de Energía",
        lockoutApplied: "Bloqueo aplicado",
        verificationMethod: "Método de Verificación",
        pressureReleased: "Presión liberada"
      }
    },
    
    electricalHazards: {
      title: "Peligros Eléctricos Identificados",
      selectAll: "Seleccionar Todo",
      deselectAll: "Deseleccionar Todo",
      riskLevel: "Nivel de Riesgo",
      controlMeasures: "Medidas de Control",
      additionalNotes: "Notas Adicionales",
      addCustomControl: "Agregar control personalizado",
      customControlPlaceholder: "Nueva medida de control..."
    },
    
    buttons: {
      previous: "Anterior",
      next: "Siguiente",
      save: "Guardar",
      add: "Agregar",
      remove: "Eliminar",
      acknowledge: "Reconocer",
      createIsolation: "Crear Aislamiento"
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
  const [newControlMeasure, setNewControlMeasure] = useState<{[hazardId: string]: string}>({})
  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({})
  const [newIsolationPoint, setNewIsolationPoint] = useState<Partial<IsolationPoint>>({})

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

  // ========== FONCTION DE REGÉNÉRATION AST MDL ==========
  const regenerateASTMDLNumber = () => {
    setFormData(prev => ({
      ...prev,
      astMDLNumber: generateASTMDLNumber()
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
        joinedAt: new Date().toISOString()
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

  const removeTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter(m => m.id !== memberId),
        totalMembers: prev.team.members.length - 1,
        acknowledgedMembers: prev.team.members.filter(m => m.id !== memberId && m.hasAcknowledged).length
      }
    }))
  }

  const acknowledgeMember = (memberId: string) => {
    const now = new Date()
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map(m =>
          m.id === memberId 
            ? { ...m, hasAcknowledged: true, acknowledgmentTime: now.toISOString() }
            : m
        ),
        acknowledgedMembers: prev.team.members.filter(m => 
          m.hasAcknowledged || m.id === memberId
        ).length
      }
    }))
  }

  // ========== FONCTIONS ISOLEMENT ==========
  const addIsolationPoint = () => {
    if (newIsolationPoint.name?.trim() && newIsolationPoint.type) {
      const point: IsolationPoint = {
        id: `isolation-${Date.now()}`,
        name: newIsolationPoint.name.trim(),
        type: newIsolationPoint.type,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      setFormData(prev => ({
        ...prev,
        isolationPoints: [...prev.isolationPoints, point]
      }))
      
      setNewIsolationPoint({})
    }
  }

  const removeIsolationPoint = (pointId: string) => {
    setFormData(prev => ({
      ...prev,
      isolationPoints: prev.isolationPoints.filter(p => p.id !== pointId),
      electricalIsolations: prev.electricalIsolations.filter(i => i.isolationPointId !== pointId),
      mechanicalIsolations: prev.mechanicalIsolations.filter(i => i.isolationPointId !== pointId)
    }))
  }

  const createIsolationDetails = (point: IsolationPoint) => {
    const isolationId = `isolation-detail-${Date.now()}`
    
    switch (point.type) {
      case 'electrical':
        const electricalIsolation: ElectricalIsolation = {
          id: isolationId,
          isolationPointId: point.id,
          circuitName: '',
          lockoutApplied: false,
          tensionVerified: false,
          groundingInstalled: false,
          isolationManeuver: '',
          verification: '',
          additionalSteps: [
            'Manœuvre d\'isolement',
            'Verrouillage', 
            'Absence de tension vérifiée',
            'Mise à la terre installée',
            'Balisage et signalisation',
            'Test de continuité'
          ],
          customSteps: []
        }
        setFormData(prev => ({
          ...prev,
          electricalIsolations: [...prev.electricalIsolations, electricalIsolation]
        }))
        break
        
      case 'mechanical':
        const mechanicalIsolation: MechanicalIsolation = {
          id: isolationId,
          isolationPointId: point.id,
          equipmentName: '',
          lockoutType: 'valve',
          energySource: '',
          lockoutApplied: false,
          verificationMethod: '',
          pressureReleased: false,
          additionalSteps: [
            'Arrêt de l\'équipement',
            'Isolation énergétique',
            'Verrouillage physique',
            'Relâchement de pression',
            'Vidange des fluides',
            'Blocage mécanique'
          ],
          customSteps: []
        }
        setFormData(prev => ({
          ...prev,
          mechanicalIsolations: [...prev.mechanicalIsolations, mechanicalIsolation]
        }))
        break
    }
  }

  const toggleHazard = (hazardId: string) => {
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(h =>
        h.id === hazardId ? { 
          ...h, 
          isSelected: !h.isSelected,
          isExpanded: !h.isSelected ? true : h.isExpanded
        } : h
      )
    }))
  }

  const toggleControlMeasure = (hazardId: string, measureId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setFormData(prev => ({
      ...prev,
      electricalHazards: prev.electricalHazards.map(hazard =>
        hazard.id === hazardId
          ? {
              ...hazard,
              controlMeasures: hazard.controlMeasures.map(measure =>
                measure.id === measureId
                  ? { ...measure, isSelected: !measure.isSelected }
                  : measure
              )
            }
          : hazard
      )
    }))
  }

  const addCustomControlMeasure = (hazardId: string) => {
    const text = newControlMeasure[hazardId]?.trim()
    if (text) {
      const newMeasure: ControlMeasure = {
        id: `custom-${Date.now()}`,
        text: text,
        isSelected: true,
        isCustom: true
      }
      
      setFormData(prev => ({
        ...prev,
        electricalHazards: prev.electricalHazards.map(hazard =>
          hazard.id === hazardId
            ? {
                ...hazard,
                customControlMeasures: [...hazard.customControlMeasures, newMeasure]
              }
            : hazard
        )
      }))
      
      setNewControlMeasure(prev => ({ ...prev, [hazardId]: '' }))
    }
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
    console.log('Génération PDF AST adaptatif 8.5"x11"...')
  }

  const getAvailableIsolationTypes = () => {
    return isolationTypesByIndustry[formData.industry] || isolationTypesByIndustry.other
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
              
              {/* ÉTAPE 1: Informations Générales avec Numéros AST */}
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
                    
                    {/* ========== NUMÉROS AST ========== */}
                    
                    {/* # AST MDL - Généré automatiquement */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🔢 {t.projectInfo.astMDLNumber}
                      </label>
                      <div className="ast-number-display">
                        <div>
                          <div className="ast-number-text">{formData.astMDLNumber}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                            {t.projectInfo.astMDLInfo}
                          </div>
                        </div>
                        <button 
                          onClick={regenerateASTMDLNumber}
                          className="refresh-btn"
                          title="Régénérer le numéro"
                        >
                          <Copy style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>

                    {/* # AST du Client */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📋 {t.projectInfo.astClientNumber}
                      </label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Numéro fourni par le client (optionnel)"
                        value={formData.projectInfo.astClientNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, astClientNumber: e.target.value }
                        }))}
                      />
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {t.projectInfo.astClientInfo}
                      </div>
                    </div>

                    {/* ========== INFORMATIONS PROJET ========== */}
                    
                    {/* Type d'Industrie */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🏭 {t.projectInfo.industry} *
                      </label>
                      <select 
                        className="input-premium"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          industry: e.target.value as ASTFormData['industry']
                        }))}
                      >
                        <option value="electrical">{t.industries.electrical}</option>
                        <option value="construction">{t.industries.construction}</option>
                        <option value="industrial">{t.industries.industrial}</option>
                        <option value="office">{t.industries.office}</option>
                        <option value="manufacturing">{t.industries.manufacturing}</option>
                        <option value="other">{t.industries.other}</option>
                      </select>
                    </div>

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
                        🕐 Heure *
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

                    {/* Informations supplémentaires */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        ⏱️ Durée Estimée
                      </label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Ex: 4 heures, 2 jours..."
                        value={formData.projectInfo.estimatedDuration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, estimatedDuration: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        👥 Nombre de Travailleurs
                      </label>
                      <input 
                        type="number"
                        min="1"
                        className="input-premium"
                        value={formData.projectInfo.workerCount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, workerCount: parseInt(e.target.value) || 1 }
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
                        placeholder="Nom de la personne contact"
                        value={formData.projectInfo.emergencyContact}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, emergencyContact: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📞 Téléphone d'Urgence
                      </label>
                      <input 
                        type="tel"
                        className="input-premium"
                        placeholder="(XXX) XXX-XXXX"
                        value={formData.projectInfo.emergencyPhone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, emergencyPhone: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Conditions météo */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        🌤️ Conditions Météo
                      </label>
                      <select 
                        className="input-premium"
                        value={formData.projectInfo.weatherConditions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, weatherConditions: e.target.value }
                        }))}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="ensoleille">☀️ Ensoleillé</option>
                        <option value="nuageux">☁️ Nuageux</option>
                        <option value="pluvieux">🌧️ Pluvieux</option>
                        <option value="neigeux">❄️ Neigeux</option>
                        <option value="venteux">💨 Venteux</option>
                        <option value="froid">🥶 Froid extrême</option>
                        <option value="chaud">🥵 Chaleur extrême</option>
                      </select>
                    </div>

                    {/* Permis de travail */}
                    <div>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        📜 Permis de Travail
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div 
                          className={`checkbox-premium ${formData.projectInfo.workPermitRequired ? 'checked' : ''}`}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            projectInfo: { ...prev.projectInfo, workPermitRequired: !prev.projectInfo.workPermitRequired }
                          }))}
                        >
                          {formData.projectInfo.workPermitRequired && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                        </div>
                        <span style={{ color: 'white', fontSize: '14px' }}>Permis de travail requis</span>
                      </div>
                      {formData.projectInfo.workPermitRequired && (
                        <input 
                          type="text"
                          className="input-premium"
                          placeholder="Numéro du permis"
                          value={formData.projectInfo.workPermitNumber || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            projectInfo: { ...prev.projectInfo, workPermitNumber: e.target.value }
                          }))}
                        />
                      )}
                    </div>

                    {/* Conditions spéciales */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        ⚠️ Conditions Spéciales
                      </label>
                      <textarea 
                        className="input-premium"
                        style={{ minHeight: '80px', resize: 'vertical' }}
                        placeholder="Conditions particulières du site, restrictions, consignes spéciales..."
                        value={formData.projectInfo.specialConditions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          projectInfo: { ...prev.projectInfo, specialConditions: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Autres étapes simplifiées pour l'exemple */}
              {currentStep === 1 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      💬 {t.steps.discussion}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Points importants à discuter avec l'équipe
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Discussion Équipe...
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      🛡️ {t.steps.equipment}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Vérification des équipements de sécurité
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Équipements Sécurité...
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ⚡ {t.steps.hazards}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Identification des dangers et risques
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Dangers & Risques...
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ⚙️ {t.steps.isolation}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Configuration des points d'isolement
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Points d'Isolement...
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      👥 {t.steps.team}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Gestion de l'équipe et prises de connaissance
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Équipe de Travail...
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      📷 {t.steps.documentation}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Photos et documentation du site
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Photos & Documentation...
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="slide-in">
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      ✅ {t.steps.validation}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                      Signatures et approbations finales
                    </p>
                  </div>
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Contenu de l'étape Validation & Signatures...
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
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    Soumettre l'AST
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
                    {tenant.companyName} • {formData.astMDLNumber} • {t.industries[formData.industry]}
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
        
