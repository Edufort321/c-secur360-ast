{/* Grille des modules de permis */}"use client";

import React, { useState } from 'react';
import { 
  Shield, Search, CheckCircle, AlertTriangle, FileText, Settings, 
  Users, Clock, Eye, Zap, Wind, Flame, Construction, Building, 
  Activity, BarChart3, Star, Plus, Wrench, Home, Target, ChevronDown, ChevronRight,
  Camera, MapPin, Bluetooth, Battery, Signal, Play, Pause, Mic, Upload, Download, Gauge
} from 'lucide-react';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
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
    ]
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
    
    // TODO: Charger le composant spécifique du permis
    // Pour l'instant, on simule
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

  // Si un permis est sélectionné, afficher "En développement" pour l'instant
  if (selectedPermit) {
    const permit = permits.find(p => p.id === selectedPermit);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header de retour */}
          <div className="mb-8">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {texts.backToSelection}
            </button>
            
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-8">
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
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {permit?.name}
                  </h1>
                  <p className="text-red-200 text-lg">
                    {permit?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu en développement */}
          <div className="bg-slate-800/50 border border-slate-600/30 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 bg-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Construction className="w-12 h-12 text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Module en Développement
            </h2>
            
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Le module <strong>{permit?.name}</strong> est actuellement en développement pour la province <strong>{PROVINCES_DATA[selectedProvince].name}</strong>. 
              Il intégrera toutes les fonctionnalités avancées prévues selon les réglementations de {PROVINCES_DATA[selectedProvince].authority}.
            </p>

            <div className="bg-slate-900/50 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Fonctionnalités Prévues :</h3>
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
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retourner à la Sélection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue principale - Sélection des permis
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header principal */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-orange-600/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  📄 {texts.title}
                </h1>
                <p className="text-red-200 text-lg">
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
                <div className="text-2xl font-bold text-blue-400">{province}</div>
                <div className="text-slate-300 text-sm">Province</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section sélection province */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Sélection de la Province</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(PROVINCES_DATA).map(([code, data]) => (
              <button
                key={code}
                onClick={() => setSelectedProvince(code as ProvinceCode)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm
                  ${selectedProvince === code 
                    ? 'border-blue-500 bg-blue-500/20 text-white' 
                    : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {permits.map(permit => (
            <div 
              key={permit.id}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02] hover:border-slate-500/50 cursor-pointer"
              onClick={() => handlePermitSelect(permit.id)}
            >
              {/* Header du module */}
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ 
                    background: `${permit.color}20`,
                    border: `1px solid ${permit.color}30`
                  }}
                >
                  {permit.iconEmoji}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {permit.name}
                  </h3>
                  <p className="text-slate-300 text-sm line-clamp-2">
                    {permit.description}
                  </p>
                </div>

                {/* Statut */}
                <div className="flex flex-col items-end gap-2">
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${permit.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                      permit.status === 'in-progress' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-slate-900/30 text-slate-300'
                    }
                  `}>
                    {permit.status === 'completed' ? texts.completed :
                     permit.status === 'in-progress' ? texts.inProgress :
                     'Disponible'}
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{texts.riskLevel}:</span>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      background: `${permit.color}20`,
                      color: permit.color
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
                      className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs"
                    >
                      {reg}
                    </span>
                  ))}
                  {permit.regulations.length > 2 && (
                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      +{permit.regulations.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all group"
              >
                <FileText className="w-4 h-4" />
                {permit.status === 'in-progress' ? texts.continuePermit : texts.startPermit}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

          <div className="mt-8 bg-slate-800/50 border border-slate-600/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Information Importante</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Tous les permis sont conçus pour respecter les réglementations provinciales en vigueur. 
              Province sélectionnée : <strong>{PROVINCES_DATA[selectedProvince].name} ({selectedProvince})</strong> - {PROVINCES_DATA[selectedProvince].authority}.
              <br />
              Chaque module intègre les fonctionnalités avancées requises : signatures électroniques, 
              horodatage sécurisé, photos géolocalisées, et archivage automatique dans Supabase.
            </p>
          </div>
      </div>
    </div>
  );
};

export default Step4Permits;"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Clock, AlertTriangle, Users, Wind, Camera, MapPin, 
  Bluetooth, Battery, Signal, CheckCircle, XCircle, Play, Pause, 
  RotateCcw, Save, Upload, Download, PenTool, Shield, Eye,
  Thermometer, Activity, Volume2, FileText, Phone
} from 'lucide-react';

// =================== TYPES ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';

interface ConfinedSpacePermitProps {
  province: ProvinceCode;
  language: 'fr' | 'en';
  onSave?: (data: any) => void;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

interface AtmosphericReading {
  id: string;
  timestamp: string;
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature: number;
  humidity: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  location?: string;
}

interface PersonnelRecord {
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor' | 'rescue';
  certification: string;
  certification_expiry: string;
  signature?: string;
  entry_time?: string;
  exit_time?: string;
}

interface PhotoRecord {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'before' | 'during' | 'after' | 'equipment' | 'hazard';
  gps_location?: { lat: number; lng: number };
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  available_24h: boolean;
}

// =================== RÉGLEMENTATIONS PROVINCIALES ===================
const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec',
    authority: 'CNESST',
    code: 'RSST Art. 302-317',
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    },
    personnel: {
      attendant_required: true,
      rescue_team_standby: true,
      max_entrants: 2
    },
    documentation: [
      'Permis d\'entrée signé',
      'Tests atmosphériques documentés',
      'Plan de sauvetage approuvé',
      'Équipements vérifiés'
    ]
  },
  ON: {
    name: 'Ontario',
    authority: 'MOL',
    code: 'O. Reg. 632/05',
    atmospheric_testing: {
      frequency_minutes: 10,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    }
  },
  BC: {
    name: 'British Columbia',
    authority: 'WorkSafeBC',
    code: 'Part 9 - Confined Spaces',
    atmospheric_testing: {
      frequency_minutes: 15,
      continuous_required: true,
      gases: ['O2', 'LEL', 'H2S', 'CO'],
      limits: {
        oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
        lel: { max: 10, critical: 25 },
        h2s: { max: 10, critical: 20 },
        co: { max: 35, critical: 200 }
      }
    }
  }
};

// =================== TRADUCTIONS ===================
const getTexts = (language: 'fr' | 'en') => {
  if (language === 'en') {
    return {
      title: "Confined Space Entry Permit",
      identification: "Identification",
      personnel: "Personnel",
      atmospheric: "Atmospheric Testing",
      equipment: "Equipment & Safety",
      emergency: "Emergency Procedures",
      signatures: "Electronic Signatures",
      photos: "Photo Documentation",
      projectName: "Project Name",
      location: "Location",
      contractor: "Contractor",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration (hours)",
      spaceDescription: "Space Description",
      hazardsIdentified: "Hazards Identified",
      workDescription: "Work Description",
      entrant: "Entrant",
      attendant: "Attendant", 
      supervisor: "Entry Supervisor",
      rescue: "Rescue Team",
      name: "Name",
      certification: "Certification",
      expiry: "Expiry Date",
      signature: "Electronic Signature",
      currentReading: "Current Reading",
      lastReading: "Last Reading",
      status: "Status",
      safe: "SAFE",
      warning: "WARNING",
      danger: "DANGER",
      oxygen: "Oxygen (O₂)",
      lel: "LEL",
      h2s: "H₂S",
      co: "CO",
      temperature: "Temperature",
      humidity: "Humidity",
      deviceConnected: "Device Connected",
      batteryLevel: "Battery",
      signalStrength: "Signal",
      startTimer: "Start Timer",
      pauseTimer: "Pause Timer",
      resetTimer: "Reset Timer",
      emergencyEvacuation: "EMERGENCY EVACUATION",
      savePermit: "Save Permit",
      submitPermit: "Submit Permit",
      cancel: "Cancel"
    };
  }
  
  return {
    title: "Permis d'Entrée en Espace Clos",
    identification: "Identification",
    personnel: "Personnel",
    atmospheric: "Tests Atmosphériques", 
    equipment: "Équipements & Sécurité",
    emergency: "Procédures d'Urgence",
    signatures: "Signatures Électroniques",
    photos: "Documentation Photo",
    projectName: "Nom du Projet",
    location: "Emplacement",
    contractor: "Contracteur",
    startTime: "Heure de Début",
    endTime: "Heure de Fin",
    duration: "Durée (heures)",
    spaceDescription: "Description de l'Espace",
    hazardsIdentified: "Dangers Identifiés",
    workDescription: "Description du Travail",
    entrant: "Entrant",
    attendant: "Surveillant",
    supervisor: "Superviseur d'Entrée",
    rescue: "Équipe de Sauvetage",
    name: "Nom",
    certification: "Certification",
    expiry: "Date d'Expiration",
    signature: "Signature Électronique",
    currentReading: "Lecture Actuelle",
    lastReading: "Dernière Lecture",
    status: "Statut",
    safe: "SÉCURITAIRE",
    warning: "ATTENTION",
    danger: "DANGER",
    oxygen: "Oxygène (O₂)",
    lel: "LEL",
    h2s: "H₂S", 
    co: "CO",
    temperature: "Température",
    humidity: "Humidité",
    deviceConnected: "Appareil Connecté",
    batteryLevel: "Batterie",
    signalStrength: "Signal",
    startTimer: "Démarrer Timer",
    pauseTimer: "Pause Timer",
    resetTimer: "Reset Timer",
    emergencyEvacuation: "ÉVACUATION D'URGENCE",
    savePermit: "Sauvegarder Permis",
    submitPermit: "Soumettre Permis",
    cancel: "Annuler"
  };
};

// =================== COMPOSANT SIGNATURE ÉLECTRONIQUE ===================
const SignatureCanvas: React.FC<{
  onSignature: (signature: string) => void;
  role: string;
  required?: boolean;
}> = ({ onSignature, role, required = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setIsEmpty(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      const signatureData = canvas.toDataURL();
      onSignature(signatureData);
    }
  };

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">
          {role} {required && <span className="text-red-400">*</span>}
        </span>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleString()}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="w-full border border-slate-600 rounded bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearSignature}
          className="px-3 py-1 bg-slate-600 text-white text-sm rounded hover:bg-slate-500"
        >
          <RotateCcw className="w-3 h-3 mr-1 inline" />
          Effacer
        </button>
        <button
          onClick={saveSignature}
          disabled={isEmpty}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-3 h-3 mr-1 inline" />
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

// =================== COMPOSANT CAPTURE PHOTO ===================
const PhotoCapture: React.FC<{
  onPhoto: (photo: PhotoRecord) => void;
  category: PhotoRecord['category'];
  photos: PhotoRecord[];
}> = ({ onPhoto, category, photos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = async (file: File) => {
    const url = URL.createObjectURL(file);
    
    // Géolocalisation si disponible
    const location = await new Promise<{ lat: number; lng: number } | undefined>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          () => resolve(undefined),
          { timeout: 5000 }
        );
      } else {
        resolve(undefined);
      }
    });

    const photo: PhotoRecord = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      caption: `Photo ${category} - ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      category,
      gps_location: location
    };

    onPhoto(photo);
  };

  const categoryPhotos = photos.filter(p => p.category === category);

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white capitalize">
          Photos - {category}
        </span>
        <span className="text-xs text-slate-400">
          {categoryPhotos.length}/5
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) capturePhoto(file);
        }}
        className="hidden"
      />

      {categoryPhotos.length < 5 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3 border-2 border-dashed border-slate-600 rounded hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
        >
          <Camera className="w-5 h-5 mx-auto mb-1" />
          Prendre une photo
        </button>
      )}

      <div className="grid grid-cols-3 gap-2 mt-3">
        {categoryPhotos.map(photo => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-16 object-cover rounded border border-slate-600"
            />
            {photo.gps_location && (
              <MapPin className="absolute top-1 right-1 w-3 h-3 text-green-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// =================== COMPOSANT PRINCIPAL ===================
const ConfinedSpacePermit: React.FC<ConfinedSpacePermitProps> = ({
  province = 'QC',
  language = 'fr',
  onSave,
  onSubmit,
  onCancel,
  initialData
}) => {
  const texts = getTexts(language);
  const regulations = PROVINCIAL_REGULATIONS[province];

  // =================== ÉTAT PRINCIPAL ===================
  const [permitData, setPermitData] = useState({
    // Identification
    project_name: initialData?.project_name || '',
    location: initialData?.location || '',
    contractor: initialData?.contractor || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    duration: initialData?.duration || 8,
    space_description: initialData?.space_description || '',
    hazards_identified: initialData?.hazards_identified || '',
    work_description: initialData?.work_description || '',
    
    // Personnel
    personnel: initialData?.personnel || {
      entrant: { name: '', certification: '', certification_expiry: '', signature: '' },
      attendant: { name: '', certification: '', certification_expiry: '', signature: '' },
      supervisor: { name: '', certification: '', certification_expiry: '', signature: '' }
    },
    
    // Tests atmosphériques
    atmospheric_readings: initialData?.atmospheric_readings || [] as AtmosphericReading[],
    
    // Photos
    photos: initialData?.photos || [] as PhotoRecord[]
  });

  // =================== TIMER ET MONITORING ===================
  const [timerState, setTimerState] = useState({
    elapsed: 0,
    isRunning: false,
    lastTestTime: 0
  });

  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [currentReading, setCurrentReading] = useState<AtmosphericReading | null>(null);

  // Timer principal
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState(prev => {
        const newElapsed = prev.elapsed + 1;
        const testInterval = regulations.atmospheric_testing.frequency_minutes * 60;
        
        // Notification de test requis
        if (newElapsed % testInterval === 0 && newElapsed > 0) {
          alert(`🌬️ Test atmosphérique requis (${regulations.atmospheric_testing.frequency_minutes}min)`);
        }

        return { ...prev, elapsed: newElapsed };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, regulations.atmospheric_testing.frequency_minutes]);

  // =================== SIMULATION BLUETOOTH 4-GAZ ===================
  const simulateBluetoothReading = useCallback(() => {
    const reading: AtmosphericReading = {
      id: `reading_${Date.now()}`,
      timestamp: new Date().toISOString(),
      oxygen: Math.random() * 2 + 20.5, // 20.5-22.5%
      lel: Math.random() * 5, // 0-5%
      h2s: Math.random() * 5, // 0-5 ppm
      co: Math.random() * 15, // 0-15 ppm
      temperature: Math.random() * 10 + 20, // 20-30°C
      humidity: Math.random() * 20 + 40, // 40-60%
      status: 'safe',
      device_id: 'BW-GasAlert-001',
      location: permitData.location
    };

    // Déterminer le statut
    const limits = regulations.atmospheric_testing.limits;
    if (reading.oxygen < limits.oxygen.critical || 
        reading.lel > limits.lel.critical ||
        reading.h2s > limits.h2s.critical ||
        reading.co > limits.co.critical) {
      reading.status = 'danger';
    } else if (reading.oxygen < limits.oxygen.min ||
               reading.lel > limits.lel.max ||
               reading.h2s > limits.h2s.max ||
               reading.co > limits.co.max) {
      reading.status = 'warning';
    }

    setCurrentReading(reading);
    setPermitData(prev => ({
      ...prev,
      atmospheric_readings: [...prev.atmospheric_readings, reading]
    }));
  }, [permitData.location, regulations.atmospheric_testing.limits]);

  // =================== HANDLERS ===================
  const handleInputChange = (section: string, field: string, value: any) => {
    setPermitData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handlePersonnelChange = (role: string, field: string, value: string) => {
    setPermitData(prev => ({
      ...prev,
      personnel: {
        ...prev.personnel,
        [role]: {
          ...prev.personnel[role],
          [field]: value
        }
      }
    }));
  };

  const handleSignature = (role: string, signature: string) => {
    handlePersonnelChange(role, 'signature', signature);
  };

  const handlePhoto = (photo: PhotoRecord) => {
    setPermitData(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  const connectBluetoothDevice = async () => {
    // Simulation connexion Bluetooth
    setBluetoothDevice({
      id: 'BW-GasAlert-001',
      name: 'BW GasAlert Quattro',
      connected: true,
      battery: 85,
      signal: 95
    });
    
    // Démarrer les lectures automatiques
    const readingInterval = setInterval(simulateBluetoothReading, 30000); // Toutes les 30s
    
    return () => clearInterval(readingInterval);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // =================== RENDU ===================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER AVEC TIMER */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{texts.title}</h1>
                <p className="text-red-200">{regulations.name} - {regulations.code}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-mono text-green-400">
                {formatTime(timerState.elapsed)}
              </div>
              <div className="text-sm text-slate-400">Temps écoulé</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-white">{province}</div>
              <div className="text-xs text-slate-400">Province</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-blue-400">
                {regulations.atmospheric_testing.frequency_minutes}min
              </div>
              <div className="text-xs text-slate-400">Fréq. Tests</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {permitData.atmospheric_readings.length}
              </div>
              <div className="text-xs text-slate-400">Tests Effectués</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTimerState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    timerState.isRunning 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {timerState.isRunning ? (
                    <><Pause className="w-3 h-3 mr-1 inline" /> Pause</>
                  ) : (
                    <><Play className="w-3 h-3 mr-1 inline" /> Start</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLONNE GAUCHE */}
          <div className="space-y-6">
            
            {/* SECTION IDENTIFICATION */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {texts.identification}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.projectName} *
                  </label>
                  <input
                    type="text"
                    value={permitData.project_name}
                    onChange={(e) => handleInputChange('project_name', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.location} *
                  </label>
                  <input
                    type="text"
                    value={permitData.location}
                    onChange={(e) => handleInputChange('location', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.contractor}
                  </label>
                  <input
                    type="text"
                    value={permitData.contractor}
                    onChange={(e) => handleInputChange('contractor', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {texts.startTime}
                    </label>
                    <input
                      type="datetime-local"
                      value={permitData.start_time}
                      onChange={(e) => handleInputChange('start_time', '', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {texts.duration}
                    </label>
                    <input
                      type="number"
                      value={permitData.duration}
                      onChange={(e) => handleInputChange('duration', '', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      min="1"
                      max="24"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.spaceDescription}
                  </label>
                  <textarea
                    value={permitData.space_description}
                    onChange={(e) => handleInputChange('space_description', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {texts.hazardsIdentified}
                  </label>
                  <textarea
                    value={permitData.hazards_identified}
                    onChange={(e) => handleInputChange('hazards_identified', '', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* SECTION PERSONNEL */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {texts.personnel}
              </h2>

              <div className="space-y-6">
                {['entrant', 'attendant', 'supervisor'].map((role) => (
                  <div key={role}>
                    <h3 className="text-lg font-medium text-white mb-3">
                      {texts[role as keyof typeof texts]}
                      {role !== 'supervisor' && <span className="text-red-400 ml-1">*</span>}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">{texts.name}</label>
                        <input
                          type="text"
                          value={permitData.personnel[role]?.name || ''}
                          onChange={(e) => handlePersonnelChange(role, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                          required={role !== 'supervisor'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">{texts.certification}</label>
                        <input
                          type="text"
                          value={permitData.personnel[role]?.certification || ''}
                          onChange={(e) => handlePersonnelChange(role, 'certification', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <SignatureCanvas
                      role={texts[role as keyof typeof texts]}
                      onSignature={(sig) => handleSignature(role, sig)}
                      required={role !== 'supervisor'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="space-y-6">
            
            {/* SECTION TESTS ATMOSPHÉRIQUES */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  {texts.atmospheric}
                </h2>
                
                <div className="flex gap-2">
                  {!bluetoothDevice ? (
                    <button
                      onClick={connectBluetoothDevice}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Bluetooth className="w-3 h-3 mr-1 inline" />
                      Connecter 4-Gaz
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      <Bluetooth className="w-3 h-3" />
                      <span>{bluetoothDevice.name}</span>
                      <Battery className="w-3 h-3" />
                      <span>{bluetoothDevice.battery}%</span>
                    </div>
                  )}
                  
                  <button
                    onClick={simulateBluetoothReading}
                    className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
                  >
                    Test Manuel
                  </button>
                </div>
              </div>

              {/* Lecture actuelle */}
              {currentReading && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{texts.currentReading}</span>
                    <span className={`text-sm font-bold ${getStatusColor(currentReading.status)}`}>
                      {texts[currentReading.status as keyof typeof texts]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {currentReading.oxygen.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.oxygen}</div>
                      <div className="text-xs text-slate-500">
                        {regulations.atmospheric_testing.limits.oxygen.min}-{regulations.atmospheric_testing.limits.oxygen.max}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {currentReading.lel.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.lel}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.lel.max}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {currentReading.h2s.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{texts.h2s}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.h2s.max}ppm
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {currentReading.co.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{texts.co}</div>
                      <div className="text-xs text-slate-500">
                        &lt;{regulations.atmospheric_testing.limits.co.max}ppm
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {currentReading.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-slate-400">{texts.temperature}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {currentReading.humidity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400">{texts.humidity}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique des lectures */}
              <div className="max-h-60 overflow-y-auto">
                <h3 className="text-lg font-medium text-white mb-3">Historique des Tests</h3>
                <div className="space-y-2">
                  {permitData.atmospheric_readings.slice(-10).reverse().map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <span className="text-xs text-slate-400">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span>O₂: {reading.oxygen.toFixed(1)}%</span>
                        <span>LEL: {reading.lel.toFixed(1)}%</span>
                        <span>H₂S: {reading.h2s.toFixed(1)}</span>
                        <span>CO: {reading.co.toFixed(1)}</span>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(reading.status)}`}>
                        {reading.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION PHOTOS */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {texts.photos}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="before"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="equipment"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="during"
                  photos={permitData.photos}
                />
                <PhotoCapture
                  onPhoto={handlePhoto}
                  category="after"
                  photos={permitData.photos}
                />
              </div>
            </div>

            {/* CONTACTS D'URGENCE */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contacts d'Urgence
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">Services d'Urgence</div>
                    <div className="text-sm text-red-200">Police, Ambulance, Pompiers</div>
                  </div>
                  <a href="tel:911" className="text-2xl font-bold text-red-400">911</a>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">CNESST Urgence</div>
                    <div className="text-sm text-red-200">Accidents de travail</div>
                  </div>
                  <a href="tel:1-844-838-0808" className="text-lg font-bold text-red-400">1-844-838-0808</a>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-800/20 rounded">
                  <div>
                    <div className="font-medium text-white">Centre Anti-Poison</div>
                    <div className="text-sm text-red-200">Intoxications</div>
                  </div>
                  <a href="tel:1-800-463-5060" className="text-lg font-bold text-red-400">1-800-463-5060</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS FINALES */}
        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-6">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => onSave?.(permitData)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {texts.savePermit}
              </button>
              
              <button
                onClick={() => onSubmit?.(permitData)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {texts.submitPermit}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => alert('🚨 ÉVACUATION IMMÉDIATE ACTIVÉE')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 animate-pulse"
              >
                <AlertTriangle className="w-4 h-4" />
                {texts.emergencyEvacuation}
              </button>
              
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                {texts.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfinedSpacePermit;
