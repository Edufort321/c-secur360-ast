'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, ArrowLeft, Save, FileText, Users, AlertTriangle, Shield, MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Types pour conformité Canada (CNESST/CSA)
interface Worker {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  qualification: string;
  departureTime: string;
  signature?: string;
}

interface IsolationCircuit {
  id: string;
  name: string;
  voltage: string;
  padlock: boolean;
  voltageTest: boolean;
  grounding: boolean;
  verifiedBy: string;
  timestamp: string;
}

interface Hazard {
  id: string;
  category: 'electrical' | 'mechanical' | 'chemical' | 'physical' | 'ergonomic' | 'environmental';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  controlMeasures: string[];
  photos: Photo[];
  legislation: string; // Référence CNESST/CSA
}

interface Photo {
  id: string;
  name: string;
  data: string;
  type: string;
  location?: { lat: number; lng: number };
  timestamp: string;
}

interface ASTFormData {
  // Métadonnées
  id: string;
  created: string;
  lastModified: string;
  language: 'fr' | 'en' | 'es' | 'fr-eu';
  jurisdiction: 'CA-QC' | 'CA-ON' | 'US' | 'MX' | 'FR';
  version: string;
  
  // Informations générales (conformité CNESST)
  projectInfo: {
    number: string;
    client: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    clientRep: string;
    emergencyContact: string;
    astNumber: string;
    clientAstNumber?: string;
    workDescription: string;
    estimatedDuration: string;
    workPermitRequired: boolean;
    workPermitNumber?: string;
  };
  
  // Équipe et formation
  team: {
    supervisor: string;
    supervisor_certification: string;
    workers: Worker[];
    briefingCompleted: boolean;
    briefingTopics: string[];
  };
  
  // Isolation et consignation (CSA Z460)
  isolation: {
    required: boolean;
    point: string;
    circuits: IsolationCircuit[];
    groundingRemoval: string;
    verificationProcedure: string;
    keyHolder: string;
  };
  
  // Analyse des dangers (conformité CNESST)
  hazardAnalysis: {
    hazards: Hazard[];
    customHazards: string[];
    emergencyProcedures: string[];
    evacuationPlan: string;
  };
  
  // EPI et équipements
  equipment: {
    requiredPPE: string[];
    specialEquipment: string[];
    inspectionCompleted: boolean;
    inspectedBy: string;
  };
  
  // Validation et signatures
  validation: {
    completedBy: string;
    reviewedBy: string;
    approvedBy: string;
    workerSignatures: { workerId: string; signature: string; timestamp: string }[];
    finalApproval: boolean;
  };
  
  // Documentation
  documentation: {
    photos: Photo[];
    additionalDocs: string[];
    references: string[];
  };
}

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
}

interface ASTFormProps {
  tenant: Tenant;
}

// Traductions premium trilingues
const translations = {
  'fr': {
    title: "Analyse Sécuritaire de Tâches",
    subtitle: "Conforme CNESST • CSA Z1000",
    step_general: "Informations Générales",
    step_team: "Équipe et Formation",
    step_isolation: "Isolation et Consignation",
    step_hazards: "Analyse des Dangers",
    step_equipment: "Équipement et EPI",
    step_validation: "Validation et Signatures",
    project_number: "Numéro de projet",
    client_name: "Nom du client",
    work_location: "Lieu des travaux",
    client_rep: "Représentant client",
    emergency_contact: "Contact d'urgence",
    ast_number: "Numéro AST",
    work_description: "Description détaillée des travaux",
    estimated_duration: "Durée estimée",
    work_permit_required: "Permis de travail requis",
    supervisor_name: "Nom du superviseur",
    supervisor_cert: "Certification du superviseur",
    add_worker: "Ajouter un travailleur",
    worker_name: "Nom du travailleur",
    employee_id: "Numéro d'employé",
    department: "Département",
    qualification: "Qualification",
    departure_time: "Heure de départ",
    isolation_required: "Isolation requise",
    isolation_point: "Point d'isolation",
    add_circuit: "Ajouter un circuit",
    circuit_name: "Nom du circuit",
    voltage_level: "Niveau de tension",
    padlock_applied: "Cadenas appliqué",
    voltage_test: "Test d'absence de tension",
    grounding_installed: "Mise à la terre installée",
    verified_by: "Vérifié par",
    hazard_electrical: "Électrique",
    hazard_mechanical: "Mécanique", 
    hazard_chemical: "Chimique",
    hazard_physical: "Physique",
    hazard_ergonomic: "Ergonomique",
    hazard_environmental: "Environnemental",
    risk_low: "Faible",
    risk_medium: "Moyen",
    risk_high: "Élevé",
    risk_critical: "Critique",
    add_control_measure: "Ajouter mesure de contrôle",
    required_ppe: "EPI requis",
    special_equipment: "Équipement spécialisé",
    inspection_completed: "Inspection complétée",
    save_draft: "Sauvegarder brouillon",
    complete_ast: "Finaliser AST",
    export_pdf: "Exporter PDF",
    legal_notice: "Document légal conforme aux exigences CNESST"
  },
  'en': {
    title: "Job Safety Analysis",
    subtitle: "CNESST Compliant • CSA Z1000",
    step_general: "General Information",
    step_team: "Team and Training",
    step_isolation: "Isolation and Lockout",
    step_hazards: "Hazard Analysis",
    step_equipment: "Equipment and PPE",
    step_validation: "Validation and Signatures",
    project_number: "Project number",
    client_name: "Client name",
    work_location: "Work location",
    client_rep: "Client representative",
    emergency_contact: "Emergency contact",
    ast_number: "JSA number",
    work_description: "Detailed work description",
    estimated_duration: "Estimated duration",
    work_permit_required: "Work permit required",
    supervisor_name: "Supervisor name",
    supervisor_cert: "Supervisor certification",
    add_worker: "Add worker",
    worker_name: "Worker name",
    employee_id: "Employee ID",
    department: "Department",
    qualification: "Qualification",
    departure_time: "Departure time",
    isolation_required: "Isolation required",
    isolation_point: "Isolation point",
    add_circuit: "Add circuit",
    circuit_name: "Circuit name",
    voltage_level: "Voltage level",
    padlock_applied: "Padlock applied",
    voltage_test: "Voltage absence test",
    grounding_installed: "Grounding installed",
    verified_by: "Verified by",
    hazard_electrical: "Electrical",
    hazard_mechanical: "Mechanical",
    hazard_chemical: "Chemical", 
    hazard_physical: "Physical",
    hazard_ergonomic: "Ergonomic",
    hazard_environmental: "Environmental",
    risk_low: "Low",
    risk_medium: "Medium",
    risk_high: "High",
    risk_critical: "Critical",
    add_control_measure: "Add control measure",
    required_ppe: "Required PPE",
    special_equipment: "Special equipment",
    inspection_completed: "Inspection completed",
    save_draft: "Save draft",
    complete_ast: "Complete JSA",
    export_pdf: "Export PDF",
    legal_notice: "Legal document compliant with CNESST requirements"
  }
};

export default function ASTFormPremium({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [formData, setFormData] = useState<ASTFormData>({
    id: `AST-${Date.now()}`,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    language: 'fr',
    jurisdiction: 'CA-QC',
    version: '1.0',
    projectInfo: {
      number: '',
      client: '',
      location: '',
      clientRep: '',
      emergencyContact: '',
      astNumber: '',
      workDescription: '',
      estimatedDuration: '',
      workPermitRequired: false
    },
    team: {
      supervisor: '',
      supervisor_certification: '',
      workers: [],
      briefingCompleted: false,
      briefingTopics: []
    },
    isolation: {
      required: false,
      point: '',
      circuits: [],
      groundingRemoval: '',
      verificationProcedure: '',
      keyHolder: ''
    },
    hazardAnalysis: {
      hazards: [],
      customHazards: [],
      emergencyProcedures: [],
      evacuationPlan: ''
    },
    equipment: {
      requiredPPE: [],
      specialEquipment: [],
      inspectionCompleted: false,
      inspectedBy: ''
    },
    validation: {
      completedBy: '',
      reviewedBy: '',
      approvedBy: '',
      workerSignatures: [],
      finalApproval: false
    },
    documentation: {
      photos: [],
      additionalDocs: [],
      references: []
    }
  });

  const steps = [
    { icon: FileText, key: 'step_general' },
    { icon: Users, key: 'step_team' },
    { icon: Shield, key: 'step_isolation' },
    { icon: AlertTriangle, key: 'step_hazards' },
    { icon: CheckCircle, key: 'step_equipment' },
    { icon: Save, key: 'step_validation' }
  ];

  const getText = (key: string) => {
    return translations[language]?.[key as keyof typeof translations.fr] || key;
  };

  const addWorker = () => {
    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      name: '',
      employeeId: '',
      department: '',
      qualification: '',
      departureTime: ''
    };
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: [...prev.team.workers, newWorker]
      }
    }));
  };

  const updateWorker = (id: string, field: keyof Worker, value: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: prev.team.workers.map(worker => 
          worker.id === id ? { ...worker, [field]: value } : worker
        )
      }
    }));
  };

  const removeWorker = (id: string) => {
    setFormData(prev => ({
      ...prev,
      team: {
        ...prev.team,
        workers: prev.team.workers.filter(worker => worker.id !== id)
      }
    }));
  };

  const addIsolationCircuit = () => {
    const newCircuit: IsolationCircuit = {
      id: `circuit-${Date.now()}`,
      name: '',
      voltage: '',
      padlock: false,
      voltageTest: false,
      grounding: false,
      verifiedBy: '',
      timestamp: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      isolation: {
        ...prev.isolation,
        circuits: [...prev.isolation.circuits, newCircuit]
      }
    }));
  };

  const updateCircuit = (id: string, field: keyof IsolationCircuit, value: any) => {
    setFormData(prev => ({
      ...prev,
      isolation: {
        ...prev.isolation,
        circuits: prev.isolation.circuits.map(circuit => 
          circuit.id === id ? { ...circuit, [field]: value } : circuit
        )
      }
    }));
  };

  const handleSave = async (isDraft = true) => {
    try {
      const response = await fetch('/api/ast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          formData: { ...formData, lastModified: new Date().toISOString() },
          isDraft
        })
      });

      if (response.ok) {
        alert(isDraft ? 'Brouillon sauvegardé!' : 'AST finalisé avec succès!');
        if (!isDraft) {
          window.location.href = `/${tenant.subdomain}/ast`;
        }
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header Premium */}
      <header className="bg-gradient-to-r from-black via-slate-800 to-black border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/${tenant.subdomain}/dashboard`}>
                <ArrowLeft className="w-6 h-6 text-white hover:text-amber-400 transition-colors cursor-pointer" />
              </Link>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">🛡️ C-Secur360</h1>
                <p className="text-amber-200 text-sm">{getText('title')} • {getText('subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="bg-slate-800 text-white border border-amber-500/30 rounded-lg px-3 py-2"
              >
                <option value="fr">🇨🇦 Français</option>
                <option value="en">🇨🇦 English</option>
              </select>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 rounded-full text-white text-sm font-medium">
                {tenant.companyName}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    currentStep === index 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{getText(step.key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          
          {/* Step 0 - General Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-amber-400" />
                {getText('step_general')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('project_number')} *
                  </label>
                  <input
                    type="text"
                    value={formData.projectInfo.number}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, number: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Ex: PROJ-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('client_name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.projectInfo.client}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, client: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('work_location')} *
                  </label>
                  <input
                    type="text"
                    value={formData.projectInfo.location}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, location: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('work_description')} *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.projectInfo.workDescription}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, workDescription: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Description détaillée des travaux à effectuer..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 - Team and Training */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-amber-400" />
                {getText('step_team')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('supervisor_name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.team.supervisor}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      team: { ...prev.team, supervisor: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {getText('supervisor_cert')} *
                  </label>
                  <input
                    type="text"
                    value={formData.team.supervisor_certification}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      team: { ...prev.team, supervisor_certification: e.target.value }
                    }))}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="Ex: Superviseur CNESST, CSA Z462"
                  />
                </div>
              </div>

              {/* Workers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Équipe de travail</h3>
                  <button
                    onClick={addWorker}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{getText('add_worker')}</span>
                  </button>
                </div>
                
                {formData.team.workers.map((worker, index) => (
                  <div key={worker.id} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-white">Travailleur {index + 1}</h4>
                      <button
                        onClick={() => removeWorker(worker.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder={getText('worker_name')}
                        value={worker.name}
                        onChange={(e) => updateWorker(worker.id, 'name', e.target.value)}
                        className="p-2 bg-slate-600/50 border border-slate-500 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder={getText('employee_id')}
                        value={worker.employeeId}
                        onChange={(e) => updateWorker(worker.id, 'employeeId', e.target.value)}
                        className="p-2 bg-slate-600/50 border border-slate-500 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder={getText('qualification')}
                        value={worker.qualification}
                        onChange={(e) => updateWorker(worker.id, 'qualification', e.target.value)}
                        className="p-2 bg-slate-600/50 border border-slate-500 rounded text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 - Isolation (simplified for display) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-amber-400" />
                {getText('step_isolation')}
              </h2>
              <div className="text-center py-12">
                <p className="text-slate-300">Section isolation et consignation</p>
                <p className="text-slate-400 text-sm">Conforme CSA Z460</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleSave(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{getText('save_draft')}</span>
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={() => handleSave(false)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{getText('complete_ast')}</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                  Suivant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-slate-400 text-sm">
            🏛️ {getText('legal_notice')} | C-Secur360 © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
