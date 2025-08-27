'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Save,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  MapPin,
  Calendar,
  Building,
  Phone,
  User,
  Briefcase,
  Copy,
  Check,
  Camera,
  HardHat,
  Zap,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  Wifi,
  WifiOff,
  Upload,
  Bell,
  Wrench,
  Wind,
  Droplets,
  Flame,
  Activity,
  Search,
  Filter,
  Hand,
  MessageSquare
} from 'lucide-react';

// Types pour le formulaire démo AST
interface DemoASTData {
  id: string;
  astNumber: string;
  projectInfo: {
    client: string;
    workLocation: string;
    industry: string;
    projectNumber: string;
    date: string;
    time: string;
    workDescription: string;
    workerCount: number;
    lockoutPoints: string[];
  };
  equipment: {
    selected: string[];
    custom: string[];
  };
  hazards: {
    selected: string[];
    controls: string[];
  };
  permits: {
    permits: string[];
  };
  validation: {
    reviewers: string[];
  };
  finalization: {
    consent: boolean;
    signatures: string[];
    fieldsCompiled: boolean;
  };
}

export default function DemoNouvellePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [astData, setAstData] = useState<DemoASTData>({
    id: '',
    astNumber: '',
    projectInfo: {
      client: '',
      workLocation: '',
      industry: '',
      projectNumber: '',
      date: '',
      time: '',
      workDescription: '',
      workerCount: 1,
      lockoutPoints: [],
    },
    equipment: {
      selected: [],
      custom: []
    },
    hazards: {
      selected: [],
      controls: []
    },
    permits: {
      permits: []
    },
    validation: {
      reviewers: []
    },
    finalization: {
      consent: false,
      signatures: [],
      fieldsCompiled: false
    },
  });

  // Initialiser les données
  useEffect(() => {
    const generateId = () => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      return `demo_ast_${timestamp}_${randomId}`;
    };

    const generateASTNumber = () => {
      const year = new Date().getFullYear();
      const sequence = String(Date.now()).slice(-6);
      return `DEMO-AST-${year}-${sequence}`;
    };

    setAstData(prev => ({
      ...prev,
      id: generateId(),
      astNumber: generateASTNumber(),
    }));
  }, []);

  const handleDataChange = (section: string, data: any) => {
    setAstData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleSave = () => {
    alert('📝 Mode Démo - Sauvegarde\n\n✅ Formulaire rempli avec succès!\n\n⚠️ Les données ne sont pas sauvegardées en mode démo.\n\n🚀 Dans la version complète, cette AST serait automatiquement sauvegardée et synchronisée avec votre équipe.');
  };

  const handleSubmit = () => {
    alert('🚀 Mode Démo - Soumission AST\n\n✅ Formulaire complet validé!\n\n⚠️ En mode démo, aucune donnée n\'est envoyée.\n\n🚀 Dans la version complète:\n• Notification automatique aux superviseurs\n• Génération QR code pour accès mobile\n• Synchronisation multi-sites\n• Conformité réglementaire assurée');
  };

  const steps = [
    {
      id: 1,
      title: 'Informations Projet',
      icon: <Building className="w-5 h-5" />,
      description: 'Client, lieu, description du travail'
    },
    {
      id: 2,
      title: 'Équipements',
      icon: <Wrench className="w-5 h-5" />,
      description: 'Outils et matériel requis'
    },
    {
      id: 3,
      title: 'Dangers & Contrôles',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Identification des risques'
    },
    {
      id: 4,
      title: 'Validation',
      icon: <Shield className="w-5 h-5" />,
      description: 'Révision et approbations'
    },
    {
      id: 5,
      title: 'Finalisation',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Signatures et consentements'
    }
  ];

  const renderProjectInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client / Entreprise *
          </label>
          <input
            type="text"
            value={astData.projectInfo.client}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              client: e.target.value
            })}
            placeholder="Ex: Construction ABC Inc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lieu de travail *
          </label>
          <input
            type="text"
            value={astData.projectInfo.workLocation}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              workLocation: e.target.value
            })}
            placeholder="Ex: 123 Rue Principale, Montréal, QC"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secteur d'activité *
          </label>
          <select
            value={astData.projectInfo.industry}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              industry: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionner un secteur</option>
            <option value="construction">Construction</option>
            <option value="manufacturier">Manufacturier</option>
            <option value="transport">Transport</option>
            <option value="energie">Énergie</option>
            <option value="petrochimie">Pétrochimie</option>
            <option value="minier">Minier</option>
            <option value="forestier">Forestier</option>
            <option value="autres">Autres</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de projet
          </label>
          <input
            type="text"
            value={astData.projectInfo.projectNumber}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              projectNumber: e.target.value
            })}
            placeholder="Ex: PROJ-2024-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date prévue *
          </label>
          <input
            type="date"
            value={astData.projectInfo.date}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              date: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure de début *
          </label>
          <input
            type="time"
            value={astData.projectInfo.time}
            onChange={(e) => handleDataChange('projectInfo', {
              ...astData.projectInfo,
              time: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description détaillée du travail *
        </label>
        <textarea
          value={astData.projectInfo.workDescription}
          onChange={(e) => handleDataChange('projectInfo', {
            ...astData.projectInfo,
            workDescription: e.target.value
          })}
          placeholder="Décrivez en détail le travail à effectuer, les procédures, les équipements impliqués..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de travailleurs *
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={astData.projectInfo.workerCount}
          onChange={(e) => handleDataChange('projectInfo', {
            ...astData.projectInfo,
            workerCount: parseInt(e.target.value) || 1
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderEquipmentStep = () => {
    const commonEquipment = [
      'Casque de sécurité', 'Lunettes de protection', 'Gants de sécurité',
      'Chaussures de sécurité', 'Harnais de sécurité', 'Masque respiratoire',
      'Échelle', 'Échafaudage', 'Perceuse', 'Scie circulaire', 'Meuleuse',
      'Chalumeau', 'Nacelle élévatrice', 'Chariot élévateur', 'Grue'
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Équipements de protection et outils</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonEquipment.map((equipment) => (
              <label key={equipment} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={astData.equipment.selected.includes(equipment)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleDataChange('equipment', {
                        ...astData.equipment,
                        selected: [...astData.equipment.selected, equipment]
                      });
                    } else {
                      handleDataChange('equipment', {
                        ...astData.equipment,
                        selected: astData.equipment.selected.filter(item => item !== equipment)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Équipements supplémentaires (spécifiez)
          </label>
          <textarea
            placeholder="Listez tout équipement spécialisé non mentionné ci-dessus..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  };

  const renderHazardsStep = () => {
    const commonHazards = [
      'Chute de hauteur', 'Électrocution', 'Écrasement', 'Coupure', 'Brûlure',
      'Inhalation de vapeurs toxiques', 'Exposition au bruit', 'Exposition aux produits chimiques',
      'Risque d\'incendie', 'Explosion', 'Espace confiné', 'Glissade/Trébuchement'
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identification des dangers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonHazards.map((hazard) => (
              <label key={hazard} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={astData.hazards.selected.includes(hazard)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleDataChange('hazards', {
                        ...astData.hazards,
                        selected: [...astData.hazards.selected, hazard]
                      });
                    } else {
                      handleDataChange('hazards', {
                        ...astData.hazards,
                        selected: astData.hazards.selected.filter(item => item !== hazard)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{hazard}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesures de contrôle et prévention
          </label>
          <textarea
            placeholder="Décrivez les mesures de sécurité, procédures d'urgence, formations requises..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  };

  const renderValidationStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Révision AST</h3>
        <p className="text-sm text-blue-700">
          Vérifiez toutes les informations saisies avant soumission finale.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Informations du projet</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Client:</strong> {astData.projectInfo.client || 'Non spécifié'}</p>
            <p><strong>Lieu:</strong> {astData.projectInfo.workLocation || 'Non spécifié'}</p>
            <p><strong>Date:</strong> {astData.projectInfo.date || 'Non spécifiée'}</p>
            <p><strong>Travailleurs:</strong> {astData.projectInfo.workerCount}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Équipements sélectionnés</h4>
          <div className="text-sm text-gray-600">
            {astData.equipment.selected.length > 0 ? (
              <p>{astData.equipment.selected.join(', ')}</p>
            ) : (
              <p>Aucun équipement sélectionné</p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Dangers identifiés</h4>
          <div className="text-sm text-gray-600">
            {astData.hazards.selected.length > 0 ? (
              <p>{astData.hazards.selected.join(', ')}</p>
            ) : (
              <p>Aucun danger identifié</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinalizationStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-900 mb-2">Finalisation de l'AST</h3>
        <p className="text-sm text-green-700">
          Dernière étape avant la soumission officielle de votre Analyse de Sécurité au Travail.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={astData.finalization.consent}
            onChange={(e) => handleDataChange('finalization', {
              ...astData.finalization,
              consent: e.target.checked
            })}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-900">Consentement et responsabilité</p>
            <p className="text-gray-600">
              Je confirme que toutes les informations fournies sont exactes et complètes. 
              Je comprends que cette AST est un document de sécurité officiel et qu'elle doit 
              être respectée par tous les travailleurs impliqués dans ce projet.
            </p>
          </div>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature électronique (nom complet)
          </label>
          <input
            type="text"
            placeholder="Votre nom complet"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Mode Démonstration</p>
              <p>Cette AST ne sera pas sauvegardée dans votre système. Dans la version complète, 
              elle serait automatiquement synchronisée avec votre équipe et génèrerait un QR code 
              pour accès mobile sur le terrain.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderProjectInfoStep();
      case 2: return renderEquipmentStep();
      case 3: return renderHazardsStep();
      case 4: return renderValidationStep();
      case 5: return renderFinalizationStep();
      default: return renderProjectInfoStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Bandeau démo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Mode Démo - Nouvelle AST</p>
              <p className="text-xs text-blue-700">Formulaire interactif - Aucune donnée sauvegardée</p>
            </div>
            <a 
              href="/demo/ast"
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image 
                src="/c-secur360-logo.png" 
                alt="C-SECUR360" 
                width={48} 
                height={48}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouvelle AST</h1>
                <p className="text-gray-600 mt-1">Numéro: {astData.astNumber}</p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center space-x-2 cursor-pointer ${
                    currentStep === step.id 
                      ? 'text-blue-600' 
                      : currentStep > step.id 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`p-2 rounded-full ${
                    currentStep === step.id 
                      ? 'bg-blue-100' 
                      : currentStep > step.id 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs opacity-75">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>

            <div className="text-sm text-gray-500">
              Étape {currentStep} sur {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <CheckCircle className="h-4 w-4" />
                Finaliser AST
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}