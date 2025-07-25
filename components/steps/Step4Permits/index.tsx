"use client";

import React, { useState } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge,
  ArrowRight
} from 'lucide-react';

// Import conditionnel du permis Espace Clos
import ConfinedSpacePermit from './permits/ConfinedSpace';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

// =================== DONNÉES PROVINCIALES ===================
const PROVINCES_DATA = {
  QC: { name: 'Québec', authority: 'CNESST', color: '#1e40af' },
  ON: { name: 'Ontario', authority: 'MOL', color: '#dc2626' },
  BC: { name: 'Colombie-Britannique', authority: 'WorkSafeBC', color: '#059669' },
  AB: { name: 'Alberta', authority: 'Alberta OHS', color: '#7c2d12' },
  SK: { name: 'Saskatchewan', authority: 'Saskatchewan OHS', color: '#a21caf' },
  MB: { name: 'Manitoba', authority: 'Manitoba Workplace Safety', color: '#ea580c' },
  NB: { name: 'Nouveau-Brunswick', authority: 'WorkSafeNB', color: '#0891b2' },
  NS: { name: 'Nouvelle-Écosse', authority: 'Workers\' Compensation Board', color: '#be123c' },
  PE: { name: 'Île-du-Prince-Édouard', authority: 'PEI Workers Compensation Board', color: '#9333ea' },
  NL: { name: 'Terre-Neuve-et-Labrador', authority: 'WorkplaceNL', color: '#0d9488' }
};

// =================== INTERFACES ===================
interface Step4PermitsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
  province?: string;
  userRole?: string;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
}

interface PermitModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  iconEmoji: string;
  color: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number;
  status: 'available' | 'in-progress' | 'completed' | 'locked';
  completionRate: number;
  regulations: string[];
  features: string[];
  component?: React.ComponentType<any>;
}

// =================== CONFIGURATION DES MODULES DE PERMIS ===================
const PERMIT_MODULES: PermitModule[] = [
  {
    id: 'confined-space',
    name: 'Permis d\'Espace Clos',
    description: 'Permis d\'entrée en espace clos avec tests atmosphériques et surveillance continue',
    icon: Home,
    iconEmoji: '🏠',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 45,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 302-317', 'CSA Z1006', 'CNESST'],
    features: [
      'Tests atmosphériques 4-gaz',
      'Surveillance Bluetooth temps réel',
      'Timer réglementaire automatique',
      'Signatures électroniques horodatées',
      'Photos géolocalisées',
      'Plan de sauvetage intégré'
    ],
    component: ConfinedSpacePermit
  },
  {
    id: 'electrical-work',
    name: 'Permis Travaux Électriques',
    description: 'Permis pour travaux électriques avec consignation LOTO et vérification VAT',
    icon: Zap,
    iconEmoji: '⚡',
    color: '#dc2626',
    riskLevel: 'critical',
    estimatedTime: 35,
    status: 'available',
    completionRate: 0,
    regulations: ['CSA Z462', 'RSST Art. 185', 'NFPA 70E'],
    features: [
      'Consignation LOTO complète',
      'Vérification absence tension (VAT)',
      'Calcul énergie incidente arc',
      'EPI arc-flash requis',
      'Distances sécurité automatiques'
    ]
  },
  {
    id: 'excavation',
    name: 'Permis d\'Excavation',
    description: 'Permis pour travaux d\'excavation avec analyse sol et protection talus',
    icon: Construction,
    iconEmoji: '🏗️',
    color: '#d97706',
    riskLevel: 'high',
    estimatedTime: 40,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 3.20', 'CSA Z271', 'Info-Excavation'],
    features: [
      'Localisation services publics',
      'Analyse stabilité du sol',
      'Calcul protection talus',
      'Plan évacuation d\'urgence',
      'Surveillance continue'
    ]
  },
  {
    id: 'height-work',
    name: 'Permis Travail en Hauteur',
    description: 'Permis pour travaux en hauteur avec protection antichute et plan sauvetage',
    icon: Building,
    iconEmoji: '🏢',
    color: '#7c3aed',
    riskLevel: 'critical',
    estimatedTime: 50,
    status: 'available',
    completionRate: 0,
    regulations: ['RSST Art. 347', 'CSA Z259', 'CNESST Hauteur'],
    features: [
      'Protection antichute complète',
      'Points ancrage certifiés',
      'Plan sauvetage en hauteur',
      'Vérification météo',
      'Équipe sauvetage sur site'
    ]
  },
  {
    id: 'hot-work',
    name: 'Permis Travail à Chaud',
    description: 'Permis pour soudage/coupage avec surveillance incendie et timer post-travaux',
    icon: Flame,
    iconEmoji: '🔥',
    color: '#ea580c',
    riskLevel: 'critical',
    estimatedTime: 30,
    status: 'available',
    completionRate: 0,
    regulations: ['NFPA 51B', 'RSST Art. 323', 'Code prévention incendie'],
    features: [
      'Surveillance incendie 60min post-travaux',
      'Timer automatique réglementaire',
      'Extincteurs spécialisés requis',
      'Zone dégagement combustibles',
      'Garde-feu qualifié'
    ]
  },
  {
    id: 'lifting',
    name: 'Permis Opérations Levage',
    description: 'Permis pour opérations de levage avec calcul charges et inspection équipements',
    icon: Wrench,
    iconEmoji: '🏗️',
    color: '#059669',
    riskLevel: 'high',
    estimatedTime: 55,
    status: 'available',
    completionRate: 0,
    regulations: ['ASME B30', 'CSA B335', 'RSST Art. 260-290'],
    features: [
      'Calcul charge de travail sécuritaire',
      'Inspection pré-utilisation',
      'Plan de levage détaillé',
      'Signaleur certifié requis',
      'Périmètre sécurité automatique'
    ]
  }
];

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "Work Permits & Legal Authorizations",
      subtitle: "Select and configure work permits with full regulatory compliance",
      selectPermit: "Select Permit Type",
      backToSelection: "← Back to Selection",
      estimatedTime: "Estimated Time",
      minutes: "min",
      riskLevel: "Risk Level",
      regulations: "Regulations",
      features: "Key Features",
      startPermit: "Start Permit",
      continuePermit: "Continue",
      completed: "Completed",
      inProgress: "In Progress",
      riskLevels: {
        critical: "🔴 Critical",
        high: "🟠 High",
        medium: "🟡 Medium",
        low: "🟢 Low"
      }
    };
  }
  
  return {
    title: "Permis de Travail & Autorisations Légales",
    subtitle: "Sélectionnez et configurez vos permis de travail avec conformité réglementaire complète",
    selectPermit: "Sélectionner le Type de Permis",
    backToSelection: "← Retour à la Sélection",
    estimatedTime: "Temps Estimé",
    minutes: "min",
    riskLevel: "Niveau de Risque",
    regulations: "Réglementations",
    features: "Fonctionnalités Clés",
    startPermit: "Démarrer Permis",
    continuePermit: "Continuer",
    completed: "Complété",
    inProgress: "En Cours",
    riskLevels: {
      critical: "🔴 Critique",
      high: "🟠 Élevé",
      medium: "🟡 Moyen",
      low: "🟢 Faible"
    }
  };
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Permits: React.FC<Step4PermitsProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors,
  province = 'QC',
  userRole,
  touchOptimized = false,
  compactMode = false,
  onPermitChange,
  initialPermits
}) => {
  const texts = getTexts(language);
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceCode>(province as ProvinceCode || 'QC');

  // Mettre à jour les statuts des permis selon les données sauvegardées
  const [permits, setPermits] = useState<PermitModule[]>(() => {
    if (formData.permits?.completed) {
      return PERMIT_MODULES.map(permit => ({
        ...permit,
        status: formData.permits.completed.includes(permit.id) ? 'completed' : 
                formData.permits.inProgress?.includes(permit.id) ? 'in-progress' : 'available',
        completionRate: formData.permits.completion?.[permit.id] || 0
      }));
    }
    return PERMIT_MODULES;
  });

  const handlePermitSelect = (permitId: string) => {
    setSelectedPermit(permitId);
    console.log(`Chargement du permis: ${permitId}`);
  };

  const handleBackToSelection = () => {
    setSelectedPermit(null);
  };

  const updatePermitStatus = (permitId: string, status: PermitModule['status'], completionRate: number = 0) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId 
        ? { ...permit, status, completionRate }
        : permit
    );
    setPermits(updatedPermits);

    // Sauvegarder dans formData
    const completedPermits = updatedPermits.filter(p => p.status === 'completed').map(p => p.id);
    const inProgressPermits = updatedPermits.filter(p => p.status === 'in-progress').map(p => p.id);
    const completion = Object.fromEntries(updatedPermits.map(p => [p.id, p.completionRate]));

    onDataChange('permits', {
      completed: completedPermits,
      inProgress: inProgressPermits,
      completion,
      total: permits.length
    });
  };

  // Si un permis est sélectionné, charger son composant
  if (selectedPermit) {
    const permit = permits.find(p => p.id === selectedPermit);
    
    if (permit?.component) {
      // Rendu du composant spécifique du permis
      const PermitComponent = permit.component as React.ComponentType<{
        province: ProvinceCode;
        language: 'fr' | 'en';
        onSave: (data: any) => void;
        onSubmit: (data: any) => void;
        onCancel: () => void;
        initialData?: any;
      }>;
      
      return (
        <div className="space-y-6">
          {/* Header de retour avec style cohérent */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-4">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {texts.backToSelection}
            </button>
          </div>

          {/* ✅ CORRECTION : Composant de permis sans wrapper qui écrase les styles */}
          <PermitComponent
            province={selectedProvince}
            language={language}
            onSave={(data: any) => {
              console.log('Permis sauvegardé:', data);
              updatePermitStatus(permit.id, 'in-progress', 50);
            }}
            onSubmit={(data: any) => {
              console.log('Permis soumis:', data);
              updatePermitStatus(permit.id, 'completed', 100);
              handleBackToSelection();
            }}
            onCancel={handleBackToSelection}
            initialData={formData[`permit_${permit.id}`] || {}}
          />
        </div>
      );
    } else {
      // Fallback pour les permis sans composant
      return (
        <div className="space-y-6">
          {/* Header de retour avec style cohérent */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-4">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {texts.backToSelection}
            </button>
          </div>
          
          {/* En-tête du permis */}
          <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ 
                  background: `${permit?.color}20`,
                  border: `1px solid ${permit?.color}30`
                }}
              >
                {permit?.iconEmoji}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {permit?.name}
                </h2>
                <p className="text-slate-300">
                  {permit?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Contenu en développement */}
          <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 bg-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Construction className="w-12 h-12 text-yellow-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Module en Développement
            </h3>
            
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Le module <strong>{permit?.name}</strong> est actuellement en développement pour la province <strong>{PROVINCES_DATA[selectedProvince].name}</strong>. 
              Il intégrera toutes les fonctionnalités avancées prévues selon les réglementations de {PROVINCES_DATA[selectedProvince].authority}.
            </p>

            <div className="bg-slate-900/50 rounded-xl p-6 max-w-md mx-auto mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">Fonctionnalités Prévues :</h4>
              <div className="space-y-2 text-left">
                {permit?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBackToSelection}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retourner à la Sélection
            </button>
          </div>
        </div>
      );
    }
  }

  // Vue principale - Sélection des permis
  return (
    <div className="space-y-6">
      
      {/* Header avec style cohérent Step 1-3 */}
      <div className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                📄 {texts.title}
              </h2>
              <p className="text-slate-300">
                {texts.subtitle}
              </p>
            </div>
          </div>
          
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="text-2xl font-bold text-white">{permits.length}</div>
              <div className="text-slate-300 text-sm">Modules Disponibles</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="text-2xl font-bold text-green-400">
                {permits.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-slate-300 text-sm">Complétés</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="text-2xl font-bold text-yellow-400">
                {permits.filter(p => p.status === 'in-progress').length}
              </div>
              <div className="text-slate-300 text-sm">En Cours</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="text-2xl font-bold text-blue-400">{selectedProvince}</div>
              <div className="text-slate-300 text-sm">Province</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section sélection province avec style cohérent */}
      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Sélection de la Province</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(PROVINCES_DATA).map(([code, data]) => (
            <button
              key={code}
              onClick={() => setSelectedProvince(code as ProvinceCode)}
              className={`
                p-3 rounded-lg border-2 transition-all text-sm hover:scale-[1.02]
                ${selectedProvince === code 
                  ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/25' 
                  : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <div className="font-medium">{data.name}</div>
              <div className="text-xs opacity-75">{data.authority}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-200">
            <strong>Province sélectionnée :</strong> {PROVINCES_DATA[selectedProvince].name} ({selectedProvince})<br/>
            <strong>Autorité compétente :</strong> {PROVINCES_DATA[selectedProvince].authority}<br/>
            <span className="text-xs opacity-75">
              Les permis seront adaptés automatiquement aux réglementations de cette province
            </span>
          </div>
        </div>
      </div>

      {/* Grille des modules de permis avec style Step 1-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {permits.map(permit => (
          <div 
            key={permit.id}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02] hover:border-slate-500/50 hover:shadow-xl hover:shadow-slate-900/25 cursor-pointer group"
            onClick={() => handlePermitSelect(permit.id)}
          >
            {/* Header du module */}
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: `${permit.color}20`,
                  border: `1px solid ${permit.color}30`
                }}
              >
                {permit.iconEmoji}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors">
                  {permit.name}
                </h4>
                <p className="text-slate-300 text-sm line-clamp-2">
                  {permit.description}
                </p>
              </div>

              {/* Statut */}
              <div className="flex flex-col items-end gap-2">
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${permit.status === 'completed' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                    permit.status === 'in-progress' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30' :
                    'bg-slate-900/30 text-slate-300 border border-slate-500/30'
                  }
                `}>
                  {permit.status === 'completed' ? texts.completed :
                   permit.status === 'in-progress' ? texts.inProgress :
                   'Disponible'}
                </div>
              </div>
            </div>

            {/* Métadonnées avec style cohérent */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{texts.riskLevel}:</span>
                <span 
                  className="px-2 py-1 rounded text-xs font-medium border"
                  style={{ 
                    background: `${permit.color}20`,
                    color: permit.color,
                    borderColor: `${permit.color}30`
                  }}
                >
                  {texts.riskLevels[permit.riskLevel]}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">{texts.estimatedTime}:</span>
                <span className="text-sm text-blue-400">
                  {permit.estimatedTime} {texts.minutes}
                </span>
              </div>
            </div>

            {/* Réglementations */}
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">{texts.regulations}:</div>
              <div className="flex flex-wrap gap-1">
                {permit.regulations.slice(0, 2).map((reg, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-500/30"
                  >
                    {reg}
                  </span>
                ))}
                {permit.regulations.length > 2 && (
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs border border-slate-500/30">
                    +{permit.regulations.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Action avec style cohérent */}
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all group-hover:shadow-lg shadow-blue-500/25 font-medium"
            >
              <FileText className="w-4 h-4" />
              {permit.status === 'in-progress' ? texts.continuePermit : texts.startPermit}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer informatif avec style cohérent */}
      <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Information Importante</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Tous les permis sont conçus pour respecter les réglementations provinciales en vigueur. 
          Province sélectionnée : <strong className="text-blue-400">{PROVINCES_DATA[selectedProvince].name} ({selectedProvince})</strong> - {PROVINCES_DATA[selectedProvince].authority}.
          <br />
          Chaque module intègre les fonctionnalités avancées requises : signatures électroniques, 
          horodatage sécurisé, photos géolocalisées, et archivage automatique dans Supabase.
        </p>
      </div>
    </div>
  );
};

export default Step4Permits;
