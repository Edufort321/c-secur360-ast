'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  FileText,
  HardHat,
  AlertTriangle,
  Users,
  FileCheck,
  Share2,
  Award
} from 'lucide-react';

// Import de tous vos steps
import Step1ProjectInfo from './steps/Step1ProjectInfo';
import Step2Equipment from './steps/Step2Equipment';
import Step3Hazards from './steps/Step3Hazards';
import Step4Controls from './steps/Step4Controls';
import Step5Permits from './steps/Step5Permits';
import Step6Validation from './steps/Step6Validation';
import Step7TeamShare from './steps/Step7TeamShare';
import Step8Finalization from './steps/Step8Finalization';

interface ASTFormProps {
  tenant: string;
}

interface FormData {
  projectInfo?: any;
  equipment?: any[];
  hazards?: any[];
  controls?: any[];
  permits?: any[];
  validation?: any;
  teamShare?: any;
  finalization?: any;
}

const stepConfig = [
  {
    id: 1,
    title: 'Informations Projet',
    icon: FileText,
    description: 'Détails du projet et localisation',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Équipements',
    icon: HardHat,
    description: 'Équipements de sécurité requis',
    color: 'green'
  },
  {
    id: 3,
    title: 'Dangers',
    icon: AlertTriangle,
    description: 'Identification des risques',
    color: 'yellow'
  },
  {
    id: 4,
    title: 'Contrôles',
    icon: Shield,
    description: 'Mesures de protection',
    color: 'purple'
  },
  {
    id: 5,
    title: 'Permis',
    icon: FileCheck,
    description: 'Autorisations requises',
    color: 'orange'
  },
  {
    id: 6,
    title: 'Validation',
    icon: Users,
    description: 'Approbation équipe',
    color: 'indigo'
  },
  {
    id: 7,
    title: 'Partage',
    icon: Share2,
    description: 'Partage avec équipe',
    color: 'cyan'
  },
  {
    id: 8,
    title: 'Finalisation',
    icon: Award,
    description: 'Publication finale',
    color: 'emerald'
  }
];

export default function ASTForm({ tenant }: ASTFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour mettre à jour les données
  const handleDataChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Calcul de progression
  const calculateProgress = () => {
    const sections = Object.keys(formData);
    const completedSections = sections.filter(section => {
      const data = formData[section as keyof FormData];
      return data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
    });
    return Math.round((completedSections.length / 8) * 100);
  };

  const progress = calculateProgress();

  // Rendu du step actuel
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProjectInfo
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 2:
        return (
          <Step2Equipment
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 3:
        return (
          <Step3Hazards
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 4:
        return (
          <Step4Controls
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 5:
        return (
          <Step5Permits
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 6:
        return (
          <Step6Validation
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 7:
        return (
          <Step7TeamShare
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      case 8:
        return (
          <Step8Finalization
            formData={formData}
            onDataChange={handleDataChange}
            language={language}
            tenant={tenant}
          />
        );
      default:
        return null;
    }
  };

  const currentStepConfig = stepConfig.find(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  CSécur360 AST
                </h1>
                <p className="text-sm text-gray-300">Tenant: {tenant}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm backdrop-blur-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>

              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Étape {currentStep} sur 8 - {currentStepConfig?.title}
              </span>
              <span className="text-sm font-medium text-gray-300">
                {progress}% complété
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar avec navigation */}
          <div className="w-80 space-y-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Étapes</h3>
              <div className="space-y-2">
                {stepConfig.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-blue-500/20 border border-blue-400/30 text-blue-300'
                          : isCompleted
                          ? 'bg-green-500/10 border border-green-400/20 text-green-300 hover:bg-green-500/20'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isCurrent
                          ? 'bg-blue-500/30'
                          : isCompleted
                          ? 'bg-green-500/30'
                          : 'bg-white/10'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                      {isCompleted && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Progression</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Sections complétées</span>
                  <span className="text-white font-medium">{Object.keys(formData).length}/8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progression globale</span>
                  <span className="text-white font-medium">{progress}%</span>
                </div>
                {formData.hazards && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Dangers identifiés</span>
                    <span className="text-yellow-400 font-medium">{(formData.hazards as any[]).length}</span>
                  </div>
                )}
                {formData.equipment && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Équipements</span>
                    <span className="text-green-400 font-medium">{(formData.equipment as any[]).length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8">
              {renderCurrentStep()}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </button>

              <div className="flex space-x-2">
                {stepConfig.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      step.id === currentStep
                        ? 'bg-blue-500 text-white'
                        : step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                  >
                    {step.id}
                  </button>
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === 8}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === 8 ? 'Finaliser' : 'Suivant'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
