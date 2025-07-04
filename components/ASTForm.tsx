'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, ArrowLeft, ArrowRight, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Types (gardez tous vos types existants)
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
  // Ajoutez votre state et logique existants ici...
  const [currentTab, setCurrentTab] = useState<'ast' | 'nearmiss'>('ast');
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  
  // ... (tout votre code state existant)

  // Modifiez la fonction saveFormData pour inclure le tenant
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
          localStorage.removeItem(`ast_mdl_draft_${tenant.id}`);
          return true;
        }
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      return false;
    }
  };

  // Ajoutez un header avec navigation
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
          <div className="text-sm opacity-75">Analyse Sécuritaire de Tâches</div>
        </div>

        {/* Votre contenu de formulaire existant... */}
        {/* Copiez tout le contenu JSX de votre formulaire ici */}
        
      </div>
    </div>
  );
}
