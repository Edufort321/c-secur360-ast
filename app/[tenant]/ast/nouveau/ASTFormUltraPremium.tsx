'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Camera, 
  Plus, 
  X, 
  Check, 
  Upload, 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Eye,
  Download,
  Zap,
  Target,
  Award,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react'

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
}

interface Hazard {
  id: string
  category: 'electrical' | 'mechanical' | 'chemical' | 'physical' | 'ergonomic' | 'environmental'
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  controlMeasures: string[]
  photos: Photo[]
}

interface Photo {
  id: string
  name: string
  data: string
  description: string
  timestamp: string
}

interface ASTFormData {
  // Métadonnées
  id: string
  created: string
  language: 'fr' | 'en'
  
  // Step 1: Informations générales
  projectInfo: {
    number: string
    client: string
    location: string
    coordinates?: { lat: number; lng: number }
    clientRep: string
    emergencyContact: string
    astNumber: string
    workDescription: string
    estimatedDuration: string
    workDate: string
    workPermitRequired: boolean
    workPermitNumber?: string
  }
  
  // Step 2: Équipe
  team: {
    supervisor: string
    supervisorCert: string
    workers: Worker[]
    briefingCompleted: boolean
  }
  
  // Step 3: Analyse des dangers
  hazardAnalysis: {
    hazards: Hazard[]
    emergencyProcedures: string[]
    evacuationPlan: string
  }
  
  // Step 4: Équipement et EPI
  equipment: {
    requiredPPE: string[]
    specialEquipment: string[]
    inspectionCompleted: boolean
    inspectedBy: string
  }
  
  // Step 5: Photos et documentation
  documentation: {
    photos: Photo[]
    additionalNotes: string
  }
  
  // Step 6: Validation
  validation: {
    completedBy: string
    reviewedBy: string
    approvedBy: string
    finalApproval: boolean
    submissionDate?: string
  }
}

interface ASTFormProps {
  tenant: Tenant
}

// Interface complète pour les traductions
interface TranslationLabels {
  projectNumber: string
  client: string
  location: string
  workDate: string
  workDescription: string
  estimatedDuration: string
  astNumber: string
  workPermit: string
  supervisor: string
  certifications: string
}

interface TranslationPlaceholders {
  projectNumber: string
  client: string
  location: string
  workDescription: string
  duration: string
  astNumber: string
  certifications: string
}

interface TranslationButtons {
  previous: string
  next: string
  save: string
  submit: string
  addPhoto: string
  addWorker: string
  addHazard: string
}

interface TranslationSteps {
  general: string
  team: string
  hazards: string
  equipment: string
  documentation: string
  validation: string
}

interface Translations {
  title: string
  subtitle: string
  steps: TranslationSteps
  buttons: TranslationButtons
  labels: TranslationLabels
  placeholders: TranslationPlaceholders
}

// Traductions corrigées avec interface complète
const translations: Record<'fr' | 'en', Translations> = {
  fr: {
    title: "Nouvelle Analyse Sécuritaire de Tâches",
    subtitle: "Renseignez les informations de base du projet",
    steps: {
      general: "Informations Générales",
      team: "Équipe de Travail", 
      hazards: "Analyse des Dangers",
      equipment: "Équipement & EPI",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    buttons: {
      previous: "Précédent",
      next: "Suivant", 
      save: "Sauvegarder",
      submit: "Soumettre AST",
      addPhoto: "Ajouter Photo",
      addWorker: "Ajouter Travailleur",
      addHazard: "Ajouter Danger"
    },
    labels: {
      projectNumber: "Numéro de projet",
      client: "Client",
      location: "Lieu des travaux",
      workDate: "Date des travaux",
      workDescription: "Description détaillée des travaux",
      estimatedDuration: "Durée estimée",
      astNumber: "Numéro AST",
      workPermit: "Permis de travail",
      supervisor: "Nom du superviseur",
      certifications: "Certifications"
    },
    placeholders: {
      projectNumber: "Ex: PROJ-2024-001",
      client: "Nom du client",
      location: "Adresse complète",
      workDescription: "Décrivez en détail les travaux à effectuer, les étapes prévues, les équipements impliqués...",
      duration: "Ex: 2 jours, 4 heures",
      astNumber: "Généré automatiquement",
      certifications: "Ex: CNESST, CSA Z462"
    }
  },
  en: {
    title: "New Job Safety Analysis",
    subtitle: "Fill in the basic project information",
    steps: {
      general: "General Information",
      team: "Work Team",
      hazards: "Hazard Analysis", 
      equipment: "Equipment & PPE",
      documentation: "Photos & Documentation",
      validation: "Validation & Signatures"
    },
    buttons: {
      previous: "Previous",
      next: "Next",
      save: "Save",
      submit: "Submit JSA", 
      addPhoto: "Add Photo",
      addWorker: "Add Worker",
      addHazard: "Add Hazard"
    },
    labels: {
      projectNumber: "Project number",
      client: "Client",
      location: "Work location",
      workDate: "Work date",
      workDescription: "Detailed work description",
      estimatedDuration: "Estimated duration",
      astNumber: "JSA number",
      workPermit: "Work permit",
      supervisor: "Supervisor name",
      certifications: "Certifications"
    },
    placeholders: {
      projectNumber: "Ex: PROJ-2024-001",
      client: "Client name",
      location: "Complete address",
      workDescription: "Describe in detail the work to be performed, planned steps, equipment involved...",
      duration: "Ex: 2 days, 4 hours",
      astNumber: "Auto-generated",
      certifications: "Ex: CNESST, CSA Z462"
    }
  }
}

const initialFormData: ASTFormData = {
  id: `AST-${Date.now()}`,
  created: new Date().toISOString(),
  language: 'fr',
  projectInfo: {
    number: '',
    client: '',
    location: '',
    clientRep: '',
    emergencyContact: '',
    astNumber: '',
    workDescription: '',
    estimatedDuration: '',
    workDate: '',
    workPermitRequired: false
  },
  team: {
    supervisor: '',
    supervisorCert: '',
    workers: [],
    briefingCompleted: false
  },
  hazardAnalysis: {
    hazards: [],
    emergencyProcedures: [],
    evacuationPlan: ''
  },
  equipment: {
    requiredPPE: [],
    specialEquipment: [],
    inspectionCompleted: false,
    inspectedBy: ''
  },
  documentation: {
    photos: [],
    additionalNotes: ''
  },
  validation: {
    completedBy: '',
    reviewedBy: '',
    approvedBy: '',
    finalApproval: false
  }
}

export default function ASTFormUltraPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ASTFormData>(initialFormData)
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [isVisible, setIsVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { icon: FileText, key: 'general' as keyof TranslationSteps },
    { icon: Users, key: 'team' as keyof TranslationSteps },
    { icon: AlertTriangle, key: 'hazards' as keyof TranslationSteps },
    { icon: Shield, key: 'equipment' as keyof TranslationSteps },
    { icon: Camera, key: 'documentation' as keyof TranslationSteps },
    { icon: CheckCircle, key: 'validation' as keyof TranslationSteps }
  ]

  const isDemo = tenant.subdomain === 'demo'
  const t = translations[language]

  // Animation d'entrée
  useEffect(() => {
    setIsVisible(true)
    setFormData(prev => ({ ...prev, language }))
  }, [language])

  // Sauvegarde automatique
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (formData.projectInfo.number || formData.projectInfo.client) {
        handleSave(true)
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSave)
  }, [formData])

  const handleSave = async (isDraft = true) => {
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // En production: appel à l'API
      // const response = await fetch('/api/ast', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tenantId: tenant.id, formData, isDraft })
      // })
      
      setSaveStatus('saved')
      
      if (!isDraft) {
        // Redirection après soumission
        setTimeout(() => {
          window.location.href = `/${tenant.subdomain}/dashboard`
        }, 2000)
      }
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}-${Math.random()}`,
          name: file.name,
          data: e.target?.result as string,
          description: '',
          timestamp: new Date().toISOString()
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
    })
  }

  const addWorker = () => {
    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: '',
      employeeId: '',
      department: '',
      qualification: ''
    }
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: [...prev.team.workers, newWorker]
      }
    }))
  }

  const addHazard = () => {
    const newHazard: Hazard = {
      id: `hazard-${Date.now()}`,
      category: 'physical',
      description: '',
      riskLevel: 'low',
      controlMeasures: [],
      photos: []
    }
    setFormData(prev => ({
      ...prev,
      hazardAnalysis: {
        ...prev.hazardAnalysis,
        hazards: [...prev.hazardAnalysis.hazards, newHazard]
      }
    }))
  }

  const getStepProgress = () => {
    const completedSteps = steps.filter((_, index) => {
      switch (index) {
        case 0: return formData.projectInfo.number && formData.projectInfo.client
        case 1: return formData.team.supervisor && formData.team.workers.length > 0
        case 2: return formData.hazardAnalysis.hazards.length > 0
        case 3: return formData.equipment.requiredPPE.length > 0
        case 4: return formData.documentation.photos.length > 0
        case 5: return formData.validation.completedBy
        default: return false
      }
    })
    return (completedSteps.length / steps.length) * 100
  }

  return (
    <>
      {/* CSS Premium */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
          }
          
          @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--progress, 0%); }
          }
          
          .form-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
            background-size: 400% 400%;
            animation: gradientShift 20s ease infinite;
            min-height: 100vh;
          }
          
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .slide-in-up { animation: slideInUp 0.6s ease-out; }
          .pulse-animation { animation: pulse 2s ease-in-out infinite; }
          .float-animation { animation: float 4s ease-in-out infinite; }
          .glow-effect { animation: glow 3s ease-in-out infinite; }
          
          .glass-effect {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          
          .input-premium {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            padding: 14px 18px;
            color: white;
            font-size: 14px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .input-premium:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
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
            position: relative;
            overflow: hidden;
          }
          
          .btn-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
          }
          
          .btn-premium:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .btn-premium:hover:before {
            left: 100%;
          }
          
          .progress-bar {
            animation: progressFill 1s ease-out;
          }
          
          .step-indicator {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .step-indicator:hover {
            transform: scale(1.05);
          }
          
          .step-indicator.active {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            transform: scale(1.1);
          }
          
          .step-indicator.completed {
            background: rgba(34, 197, 94, 0.2);
            border-color: #22c55e;
          }
          
          @media (max-width: 768px) {
            .form-container { padding: 16px; }
            .glass-effect { border-radius: 16px; padding: 20px; }
            .mobile-grid { grid-template-columns: 1fr !important; }
          }
        `
      }} />

      <div className="form-container">
        {/* Header Premium */}
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
              
              {/* Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link href={`/${tenant.subdomain}/dashboard`}>
                  <ArrowLeft 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      color: 'white', 
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                  />
                </Link>
                
                <div>
                  <h1 style={{ 
                    color: 'white', 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    margin: 0,
                    background: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {t.title}
                  </h1>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    {tenant.companyName} • {formData.id}
                  </p>
                </div>
              </div>

              {/* Contrôles */}
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

                {/* Status sauvegarde */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: saveStatus === 'saved' ? 'rgba(34, 197, 94, 0.2)' : 
                            saveStatus === 'saving' ? 'rgba(59, 130, 246, 0.2)' : 
                            saveStatus === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'transparent'
                }}>
                  {saveStatus === 'saving' && <div className="pulse-animation" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />}
                  {saveStatus === 'saved' && <Check style={{ width: '16px', height: '16px', color: '#22c55e' }} />}
                  {saveStatus === 'error' && <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />}
                  <span style={{ 
                    color: saveStatus === 'saved' ? '#22c55e' : 
                          saveStatus === 'saving' ? '#3b82f6' : 
                          saveStatus === 'error' ? '#ef4444' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {saveStatus === 'saving' ? 'Sauvegarde...' :
                     saveStatus === 'saved' ? 'Sauvegardé' :
                     saveStatus === 'error' ? 'Erreur' : 'Auto-save'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar Global */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.8)', 
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
          padding: '16px 0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              height: '6px', 
              background: 'rgba(100, 116, 139, 0.2)', 
              borderRadius: '3px', 
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <div 
                className="progress-bar"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #22c55e)',
                  borderRadius: '3px',
                  width: `${getStepProgress()}%`
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>Progression: {Math.round(getStepProgress())}%</span>
              <span>Étape {currentStep + 1} sur {steps.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation par étapes */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(10px)',
          padding: '20px 0',
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px'
            }} className="mobile-grid">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === index
                const isCompleted = index < currentStep || getStepProgress() === 100
                
                return (
                  <div
                    key={index}
                    className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setCurrentStep(index)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: `2px solid ${
                        isActive ? '#3b82f6' : 
                        isCompleted ? '#22c55e' : 
                        'rgba(100, 116, 139, 0.3)'
                      }`,
                      background: isActive ? 'rgba(59, 130, 246, 0.2)' : 
                                isCompleted ? 'rgba(34, 197, 94, 0.1)' : 
                                'rgba(30, 41, 59, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Icon style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: isActive ? '#3b82f6' : 
                            isCompleted ? '#22c55e' : 
                            '#94a3b8',
                      marginBottom: '6px'
                    }} />
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600',
                      color: isActive ? '#3b82f6' : 
                            isCompleted ? '#22c55e' : 
                            '#94a3b8',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      {t.steps[step.key]}
                    </span>
                    {isCompleted && !isActive && (
                      <CheckCircle style={{ 
                        width: '12px', 
                        height: '12px', 
                        color: '#22c55e',
                        marginTop: '4px'
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
          <div className="glass-effect slide-in-up" style={{ padding: '32px' }}>
            
            {/* Step 0: Informations générales */}
            {currentStep === 0 && (
              <div style={{ space: '32px' }}>
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                  <h2 style={{ 
                    color: 'white', 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    margin: '0 0 8px 0',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    📋 {t.steps.general}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    {t.subtitle}
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px'
                }} className="mobile-grid">
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.projectNumber} *
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.number}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, number: e.target.value }
                      }))}
                      placeholder={t.placeholders.projectNumber}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.client} *
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.client}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, client: e.target.value }
                      }))}
                      placeholder={t.placeholders.client}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.location} *
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.location}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, location: e.target.value }
                      }))}
                      placeholder={t.placeholders.location}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.workDate} *
                    </label>
                    <input
                      type="date"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.workDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, workDate: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.workDescription} *
                    </label>
                    <textarea
                      className="input-premium"
                      style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                      value={formData.projectInfo.workDescription}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, workDescription: e.target.value }
                      }))}
                      placeholder={t.placeholders.workDescription}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.estimatedDuration}
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, estimatedDuration: e.target.value }
                      }))}
                      placeholder={t.placeholders.duration}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#e2e8f0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px' 
                    }}>
                      {t.labels.astNumber}
                    </label>
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.astNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, astNumber: e.target.value }
                      }))}
                      placeholder={t.placeholders.astNumber}
                    />
                  </div>
                </div>

                {/* Permis de travail */}
                <div style={{ 
                  marginTop: '32px',
                  padding: '24px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    🎫 {t.labels.workPermit}
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <input
                      type="checkbox"
                      id="workPermit"
                      checked={formData.projectInfo.workPermitRequired}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, workPermitRequired: e.target.checked }
                      }))}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <label htmlFor="workPermit" style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                      Un permis de travail est requis pour ce projet
                    </label>
                  </div>

                  {formData.projectInfo.workPermitRequired && (
                    <input
                      type="text"
                      className="input-premium"
                      style={{ width: '100%' }}
                      value={formData.projectInfo.workPermitNumber || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectInfo: { ...prev.projectInfo, workPermitNumber: e.target.value }
                      }))}
                      placeholder="Numéro du permis de travail"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Équipe */}
            {currentStep === 1 && (
              <div>
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                  <h2 style={{ 
                    color: 'white', 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    margin: '0 0 8px 0',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    👥 {t.steps.team}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                    Définissez l'équipe et les responsabilités
                  </p>
                </div>

                {/* Superviseur */}
                <div style={{ 
                  marginBottom: '32px',
                  padding: '24px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 style={{ color: '#22c55e', fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    👨‍💼 Superviseur responsable
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '16px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: '#e2e8f0', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        {t.labels.supervisor} *
                      </label>
                      <input
                        type="text"
                        className="input-premium"
                        style={{ width: '100%' }}
                        value={formData.team.supervisor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          team: { ...prev.team, supervisor: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: '#e2e8f0', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        {t.labels.certifications} *
                      </label>
                      <input
                        type="text"
                        className="input-premium"
                        style={{ width: '100%' }}
                        value={formData.team.supervisorCert}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          team: { ...prev.team, supervisorCert: e.target.value }
                        }))}
                        placeholder={t.placeholders.certifications}
                      />
                    </div>
                  </div>
                </div>

                {/* Travailleurs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      👷‍♂️ Équipe de travail
                    </h3>
                    <button
                      className="btn-premium"
                      onClick={addWorker}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                      {t.buttons.addWorker}
                    </button>
                  </div>

                  {formData.team.workers.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '48px 24px',
                      background: 'rgba(100, 116, 139, 0.1)',
                      border: '2px dashed rgba(100, 116, 139, 0.3)',
                      borderRadius: '16px'
                    }}>
                      <Users style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 16px auto' }} />
                      <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                        Aucun travailleur ajouté
                      </p>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0 0 0' }}>
                        Cliquez sur "Ajouter Travailleur" pour commencer
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {formData.team.workers.map((worker, index) => (
                        <div key={worker.id} style={{
                          padding: '20px',
                          background: 'rgba(30, 41, 59, 0.6)',
                          border: '1px solid rgba(100, 116, 139, 0.3)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                              Travailleur #{index + 1}
                            </h4>
                            <button
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                team: {
                                  ...prev.team,
                                  workers: prev.team.workers.filter(w => w.id !== worker.id)
                                }
                              }))}
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.2)', 
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '6px',
                                color: '#ef4444',
                                cursor: 'pointer'
                              }}
                            >
                              <X style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '12px'
                          }}>
                            <input
                              type="text"
                              className="input-premium"
                              placeholder="Nom complet"
                              value={worker.name}
                              onChange={(e) => {
                                const updatedWorkers = formData.team.workers.map(w => 
                                  w.id === worker.id ? { ...w, name: e.target.value } : w
                                )
                                setFormData(prev => ({
                                  ...prev,
                                  team: { ...prev.team, workers: updatedWorkers }
                                }))
                              }}
                            />
                            <input
                              type="text"
                              className="input-premium"
                              placeholder="Numéro d'employé"
                              value={worker.employeeId}
                              onChange={(e) => {
                                const updatedWorkers = formData.team.workers.map(w => 
                                  w.id === worker.id ? { ...w, employeeId: e.target.value } : w
                                )
                                setFormData(prev => ({
                                  ...prev,
                                  team: { ...prev.team, workers: updatedWorkers }
                                }))
                              }}
                            />
                            <input
                              type="text"
                              className="input-premium"
                              placeholder="Département"
                              value={worker.department}
                              onChange={(e) => {
                                const updatedWorkers = formData.team.workers.map(w => 
                                  w.id === worker.id ? { ...w, department: e.target.value } : w
                                )
                                setFormData(prev => ({
                                  ...prev,
                                  team: { ...prev.team, workers: updatedWorkers }
                                }))
                              }}
                            />
                            <input
                              type="text"
                              className="input-premium"
                              placeholder="Qualification"
                              value={worker.qualification}
                              onChange={(e) => {
                                const updatedWorkers = formData.team.workers.map(w => 
                                  w.id === worker.id ? { ...w, qualification: e.target.value } : w
                                )
                                setFormData(prev => ({
                                  ...prev,
                                  team: { ...prev.team, workers: updatedWorkers }
                                }))
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Autres étapes peuvent être ajoutées ici */}
            {currentStep > 1 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                  🚧 Étape en développement
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                  Cette section sera complétée dans la prochaine version
                </p>
              </div>
            )}

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
                className="btn-premium"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                style={{ 
                  background: currentStep === 0 ? 'rgba(100, 116, 139, 0.3)' : undefined,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
                {t.buttons.previous}
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  style={{
                    background: 'rgba(100, 116, 139, 0.2)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  {t.buttons.save}
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    className="btn-premium"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    style={{ 
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    {t.buttons.submit}
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

        {/* Input caché pour photos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>
    </>
  )
}
