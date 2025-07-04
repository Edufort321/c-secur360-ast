'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, ArrowLeft, ArrowRight, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Types
interface Worker {
  name: string;
  departureTime: string;
}

interface IsolationCircuit {
  id: string;
  name: string;
  padlock: boolean;
  voltage: boolean;
  grounding: boolean;
}

interface Photo {
  id: string;
  name: string;
  data: string;
  type: string;
}

interface NearMissIncident {
  id: string;
  date: string;
  time: string;
  description: string;
  personnel: string;
  solution: string;
  photos: Photo[];
}

interface ASTFormData {
  datetime: string;
  language: string;
  client: string;
  projectNumber: string;
  workLocation: string;
  clientRep: string;
  emergencyNumber: string;
  astMdlNumber: string;
  astClientNumber: string;
  workDescription: string;
  teamDiscussion: string[];
  isolation: {
    point: string;
    circuits: IsolationCircuit[];
    groundingRemoval: string;
  };
  hazards: string[];
  customHazards: string[];
  controlMeasures: Record<string, string[]>;
  workers: Worker[];
  photos: Record<string, Photo[]>;
}

interface Tenant {
  id: string;
  subdomain: string;
  companyName: string;
}

interface ASTFormProps {
  tenant: Tenant;
}

export default function ASTForm({ tenant }: ASTFormProps) {
  const [currentTab, setCurrentTab] = useState<'ast' | 'nearmiss'>('ast');
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [formData, setFormData] = useState<ASTFormData>({
    datetime: '',
    language: 'fr',
    client: '',
    projectNumber: '',
    workLocation: '',
    clientRep: '',
    emergencyNumber: '',
    astMdlNumber: '',
    astClientNumber: '',
    workDescription: '',
    teamDiscussion: [],
    isolation: {
      point: '',
      circuits: [],
      groundingRemoval: ''
    },
    hazards: [],
    customHazards: [],
    controlMeasures: {},
    workers: [],
    photos: {}
  });

  // Near Miss
  const [nearMissIncidents, setNearMissIncidents] = useState<NearMissIncident[]>([]);

  // UI State
  const [selectedHazards, setSelectedHazards] = useState<Set<string>>(new Set());
  const [hazardControls, setHazardControls] = useState<Record<string, string[]>>({});
  const [customHazardInput, setCustomHazardInput] = useState('');
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    photos: Photo[];
    currentIndex: number;
  }>({ isOpen: false, photos: [], currentIndex: 0 });

  // File inputs refs
  const hazardPhotoRefs = useRef<Record<string, HTMLInputElement>>({});
  const controlPhotoRefs = useRef<Record<string, HTMLInputElement>>({});

  // Traductions (votre code existant)
  const translations = {
    fr: {
      subtitle: "Analyse Sécuritaire de Tâches",
      ast_tab: "📋 Formulaire AST",
      near_miss_tab: "⚠️ Passé proche",
      general_info: "📋 Informations Générales",
      client: "Client",
      client_placeholder: "Nom du client",
      project_number: "Numéro de projet",
      project_number_placeholder: "N° de projet",
      work_location: "Endroit des travaux",
      work_location_placeholder: "Lieu des travaux",
      client_rep: "Représentant du client",
      client_rep_placeholder: "Nom du représentant",
      emergency_number: "Numéro d'urgence",
      emergency_number_placeholder: "Numéro d'urgence",
      ast_mdl_number: "N° AST MDL",
      ast_mdl_number_placeholder: "Numéro AST MDL",
      ast_client_number: "N° AST du client",
      ast_client_number_placeholder: "Numéro AST client",
      work_description: "Description des travaux",
      work_description_placeholder: "ENTRETIEN ÉLECTRIQUE 2024",
      team_discussion: "💬 Information à discuter avec l'équipe",
      electrical_isolation: "⚡ Isolation Électrique",
      potential_hazards: "⚠️ Dangers Potentiels",
      workers: "👷 Nom des Travailleurs",
      add_worker: "+ Ajouter un travailleur",
      reset: "🗑️ Réinitialiser",
      share: "📤 Partager",
      save: "💾 Sauvegarder",
      form_saved: "✅ AST sauvegardé avec succès!",
      save_error: "❌ Erreur lors de la sauvegarde",
    },
    en: {
      subtitle: "Job Safety Analysis",
      ast_tab: "📋 JSA Form",
      near_miss_tab: "⚠️ Near miss",
      general_info: "📋 General Information",
      client: "Client",
      client_placeholder: "Client name",
      project_number: "Project number",
      project_number_placeholder: "Project #",
      work_location: "Work location",
      work_location_placeholder: "Work location",
      client_rep: "Client representative",
      client_rep_placeholder: "Representative name",
      emergency_number: "Emergency number",
      emergency_number_placeholder: "Emergency number",
      ast_mdl_number: "JSA MDL #",
      ast_mdl_number_placeholder: "JSA MDL number",
      ast_client_number: "Client JSA #",
      ast_client_number_placeholder: "Client JSA number",
      work_description: "Work description",
      work_description_placeholder: "ELECTRICAL MAINTENANCE 2024",
      team_discussion: "💬 Information to discuss with team",
      electrical_isolation: "⚡ Electrical Isolation",
      potential_hazards: "⚠️ Potential Hazards",
      workers: "👷 Worker Names",
      add_worker: "+ Add worker",
      reset: "🗑️ Reset",
      share: "📤 Share",
      save: "💾 Save",
      form_saved: "✅ AST saved successfully!",
      save_error: "❌ Error saving AST",
    }
  };

  const getText = (key: string) => {
    return translations[currentLanguage as keyof typeof translations]?.[key as keyof typeof translations.fr] || key;
  };

  const updateDateTime = () => {
    const now = new Date();
    const formatted = now.toLocaleString(currentLanguage === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setFormData(prev => ({ ...prev, datetime: `📅 ${formatted}` }));
  };

  const saveFormData = async (finalData?: any) => {
    try {
      const dataToSave = finalData || {
        formData,
        selectedHazards: Array.from(selectedHazards),
        hazardControls,
        nearMissIncidents,
        currentLanguage
      };

      // Sauvegarder dans localStorage pour le brouillon
      localStorage.setItem(`ast_mdl_draft_${tenant.id}`, JSON.stringify(dataToSave));

      // Si c'est une sauvegarde finale, envoyer à l'API
      if (finalData) {
        const response = await fetch('/api/ast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: tenant.id,
            formData: finalData
          })
        });

        if (response.ok) {
          const result = await response.json();
          localStorage.removeItem(`ast_mdl_draft_${tenant.id}`);
          alert(getText('form_saved'));
          return true;
        } else {
          alert(getText('save_error'));
          return false;
        }
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      alert(getText('save_error'));
      return false;
    }
  };

  const handleSaveAST = async () => {
    const finalFormData = {
      ...formData,
      selectedHazards: Array.from(selectedHazards),
      hazardControls,
      nearMissIncidents
    };
    
    const success = await saveFormData(finalFormData);
    if (success) {
      // Rediriger vers la liste des AST
      window.location.href = `/${tenant.subdomain}/ast`;
    }
  };

  const addWorker = () => {
    setFormData(prev => ({
      ...prev,
      workers: [...prev.workers, { name: '', departureTime: '' }]
    }));
  };

  const updateWorker = (index: number, field: keyof Worker, value: string) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.map((worker, i) => 
        i === index ? { ...worker, [field]: value } : worker
      )
    }));
  };

  const removeWorker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-2">
      {/* Header de navigation */}
      <div className="max-w-lg mx-auto mb-4">
        <Link 
          href={`/${tenant.subdomain}/dashboard`}
          className="inline-flex items-center text-white hover:text-yellow-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au tableau de bord
        </Link>
      </div>

      <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-blue-600 text-white p-5 text-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setCurrentLanguage('fr')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentLanguage === 'fr' ? 'bg-white/90 text-slate-700' : 'bg-white/20'
              }`}
            >
              🇫🇷 FR
            </button>
            <button 
              onClick={() => setCurrentLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentLanguage === 'en' ? 'bg-white/90 text-slate-700' : 'bg-white/20'
              }`}
            >
              🇺🇸 EN
            </button>
          </div>
          <div className="text-2xl font-bold mb-1">🛡️ AST MDL</div>
          <div className="text-sm opacity-90">{tenant.companyName}</div>
          <div className="text-sm opacity-75">{getText('subtitle')}</div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gradient-to-r from-slate-700 to-blue-600 border-b border-white/20">
          <button
            onClick={() => setCurrentTab('ast')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all border-b-3 ${
              currentTab === 'ast' 
                ? 'text-white border-orange-400 bg-white/10' 
                : 'text-white/70 border-transparent hover:bg-white/10'
            }`}
          >
            {getText('ast_tab')}
          </button>
          <button
            onClick={() => setCurrentTab('nearmiss')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all border-b-3 ${
              currentTab === 'nearmiss' 
                ? 'text-white border-orange-400 bg-white/10' 
                : 'text-white/70 border-transparent hover:bg-white/10'
            }`}
          >
            {getText('near_miss_tab')}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {currentTab === 'ast' ? (
            <div className="space-y-6">
              {/* DateTime Display */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl text-center font-bold text-green-700 border-2 border-green-200">
                {formData.datetime}
              </div>

              {/* General Information */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('general_info')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('client')}
                    </label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('client_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('project_number')}
                    </label>
                    <input
                      type="text"
                      value={formData.projectNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('project_number_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('work_location')}
                    </label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('work_location_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                      {getText('work_description')}
                    </label>
                    <textarea
                      value={formData.workDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, workDescription: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder={getText('work_description_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Workers */}
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">{getText('workers')}</h3>
                <div className="space-y-3">
                  {formData.workers.map((worker, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border-2 border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-slate-700">
                          Travailleur {index + 1}
                        </h4>
                        <button
                          onClick={() => removeWorker(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={worker.name}
                            onChange={(e) => updateWorker(index, 'name', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                            placeholder="Nom complet"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            Heure de départ
                          </label>
                          <input
                            type="time"
                            value={worker.departureTime}
                            onChange={(e) => updateWorker(index, 'departureTime', e.target.value)}
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addWorker}
                    className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                  >
                    {getText('add_worker')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Near Miss Tab - simplifié pour cet exemple
            <div className="space-y-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Module Passé proche</h2>
                <p className="text-slate-500">Disponible dans votre formulaire AST complet</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-4">
          <Link href={`/${tenant.subdomain}/dashboard`}>
            <button className="w-full p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105">
              Annuler
            </button>
          </Link>
          <button 
            onClick={handleSaveAST}
            className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            {getText('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
