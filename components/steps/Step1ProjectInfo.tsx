"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  Globe,
  AlertTriangle,
  Info
} from 'lucide-react';

// =================== INTERFACES LOCALES ===================
interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Step1ProjectInfoProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors: any;
}

interface ProjectInfoData {
  title: string;
  description: string;
  clientId: string;
  projectName: string;
  workTypeId: string;
  workLocation: Address;
  teamLeader: ContactInfo;
  teamMembers: ContactInfo[];
  estimatedDuration: number;
  plannedStartDate: string;
  plannedEndDate: string;
}

// =================== DONNÉES MOCK ===================
const allClients = [
  {
    id: 'hydro-quebec',
    name: 'Hydro-Québec',
    industry: 'Électricité',
    emergencyContact: '1-800-790-2424',
    dispatchContact: 'dispatch@hydroquebec.com'
  },
  {
    id: 'energir',
    name: 'Énergir',
    industry: 'Gaz naturel',
    emergencyContact: '1-800-361-8003',
    dispatchContact: 'dispatch@energir.com'
  },
  {
    id: 'bell',
    name: 'Bell Canada',
    industry: 'Télécommunications',
    emergencyContact: '1-800-667-0123',
    dispatchContact: 'urgence@bell.ca'
  },
  {
    id: 'cogeco',
    name: 'Cogeco',
    industry: 'Télécommunications',
    emergencyContact: '1-800-267-9000',
    dispatchContact: 'support@cogeco.ca'
  }
];

const allWorkTypes = [
  {
    id: 'electrical-maintenance',
    name: 'Maintenance électrique',
    category: 'Électricité'
  },
  {
    id: 'gas-installation',
    name: 'Installation de gaz',
    category: 'Gaz naturel'
  },
  {
    id: 'telecom-repair',
    name: 'Réparation télécoms',
    category: 'Télécommunications'
  },
  {
    id: 'construction',
    name: 'Construction',
    category: 'Génie civil'
  },
  {
    id: 'inspection',
    name: 'Inspection',
    category: 'Contrôle qualité'
  }
];

// =================== MESSAGES D'URGENCE ===================
const EMERGENCY_MESSAGES = {
  'hydro-quebec': {
    fr: "🚨 URGENCE ÉLECTRIQUE - Composez le 911 et Hydro-Québec au 1-800-790-2424",
    en: "🚨 ELECTRICAL EMERGENCY - Call 911 and Hydro-Québec at 1-800-790-2424"
  },
  'energir': {
    fr: "🚨 URGENCE GAZ - Composez le 911 et Énergir au 1-800-361-8003",
    en: "🚨 GAS EMERGENCY - Call 911 and Énergir at 1-800-361-8003"
  },
  'bell': {
    fr: "🚨 URGENCE TÉLÉCOMS - Composez le 911 et Bell au 1-800-667-0123",
    en: "🚨 TELECOM EMERGENCY - Call 911 and Bell at 1-800-667-0123"
  },
  'default': {
    fr: "🚨 URGENCE - Composez le 911 et contactez votre superviseur immédiatement",
    en: "🚨 EMERGENCY - Call 911 and contact your supervisor immediately"
  }
};

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Informations du projet',
    subtitle: 'Détails généraux et localisation du travail',
    projectTitle: 'Titre du projet',
    projectTitlePlaceholder: 'Ex: Maintenance transformateur - Poste Nord',
    projectDescription: 'Description du travail',
    projectDescriptionPlaceholder: 'Décrivez brièvement les tâches à effectuer...',
    client: 'Client',
    selectClient: 'Sélectionner un client',
    workType: 'Type de travail',
    selectWorkType: 'Sélectionner le type de travail',
    workLocation: 'Lieu du travail',
    workLocationPlaceholder: 'Adresse complète du site de travail',
    coordinates: 'Coordonnées GPS',
    teamLeader: 'Chef d\'équipe',
    teamLeaderName: 'Nom complet',
    teamLeaderPosition: 'Poste/Titre',
    teamLeaderPhone: 'Téléphone',
    teamLeaderEmail: 'Email',
    plannedStartDate: 'Date de début prévue',
    plannedEndDate: 'Date de fin prévue',
    estimatedDuration: 'Durée estimée (heures)',
    emergencyProtocol: 'Procédure d\'urgence',
    requiredField: 'Champ obligatoire',
    autoDetectLocation: 'Détecter ma position',
    searchAddress: 'Rechercher une adresse',
    mapClickInstructions: 'Cliquez sur la carte pour sélectionner le lieu exact'
  },
  en: {
    title: 'Project Information',
    subtitle: 'General details and work location',
    projectTitle: 'Project Title',
    projectTitlePlaceholder: 'Ex: Transformer Maintenance - North Station',
    projectDescription: 'Work Description',
    projectDescriptionPlaceholder: 'Briefly describe the tasks to be performed...',
    client: 'Client',
    selectClient: 'Select a client',
    workType: 'Work Type',
    selectWorkType: 'Select work type',
    workLocation: 'Work Location',
    workLocationPlaceholder: 'Complete address of work site',
    coordinates: 'GPS Coordinates',
    teamLeader: 'Team Leader',
    teamLeaderName: 'Full Name',
    teamLeaderPosition: 'Position/Title',
    teamLeaderPhone: 'Phone',
    teamLeaderEmail: 'Email',
    plannedStartDate: 'Planned Start Date',
    plannedEndDate: 'Planned End Date',
    estimatedDuration: 'Estimated Duration (hours)',
    emergencyProtocol: 'Emergency Procedure',
    requiredField: 'Required field',
    autoDetectLocation: 'Detect my location',
    searchAddress: 'Search address',
    mapClickInstructions: 'Click on map to select exact location'
  }
};

// =================== HOOKS MOCK ===================
const useGoogleMaps = () => {
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  const geocodeAddress = async (location: { lat: number; lng: number }): Promise<Address | null> => {
    // Mock geocoding - en production, utiliser l'API Google
    return {
      street: `${Math.round(location.lat * 1000)} Rue Example`,
      city: 'Sherbrooke',
      province: 'QC',
      postalCode: 'J1H 1A1',
      country: 'Canada'
    };
  };

  const searchAddresses = async (query: string): Promise<string[]> => {
    // Mock search - en production, utiliser l'API Google Places
    const mockAddresses = [
      `${query} - 123 Rue King, Sherbrooke, QC`,
      `${query} - 456 Avenue University, Sherbrooke, QC`,
      `${query} - 789 Boulevard Portland, Sherbrooke, QC`
    ];
    return mockAddresses.slice(0, 3);
  };

  return { getCurrentLocation, geocodeAddress, searchAddresses };
};

// =================== COMPOSANT PRINCIPAL ===================
const Step1ProjectInfo: React.FC<Step1ProjectInfoProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  
  // Initialisation des données avec valeurs par défaut
  const projectInfo: ProjectInfoData = formData.projectInfo || {
    title: '',
    description: '',
    clientId: '',
    projectName: '',
    workTypeId: '',
    workLocation: {
      street: '',
      city: 'Sherbrooke',
      province: 'QC',
      postalCode: '',
      country: 'Canada'
    },
    teamLeader: {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    teamMembers: [],
    estimatedDuration: 8,
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: ''
  };
  
  // États locaux
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  
  // Hooks
  const { getCurrentLocation, geocodeAddress, searchAddresses } = useGoogleMaps();
  
  // Référence pour la carte
  const mapRef = useRef<HTMLDivElement>(null);

  // =================== HANDLERS ===================
  const handleProjectInfoChange = (field: keyof ProjectInfoData, value: any) => {
    const updatedProjectInfo = {
      ...projectInfo,
      [field]: value
    };
    onDataChange('projectInfo', updatedProjectInfo);
  };

  const handleLocationChange = (field: keyof Address, value: any) => {
    const updatedLocation = {
      ...projectInfo.workLocation,
      [field]: value
    };
    handleProjectInfoChange('workLocation', updatedLocation);
  };

  const handleTeamLeaderChange = (field: keyof ContactInfo, value: any) => {
    const updatedTeamLeader = {
      ...projectInfo.teamLeader,
      [field]: value
    };
    handleProjectInfoChange('teamLeader', updatedTeamLeader);
  };

  const handleAutoDetectLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        handleLocationChange('coordinates', location);
        
        // Géocodage inverse pour obtenir l'adresse
        const address = await geocodeAddress(location);
        if (address) {
          handleLocationChange('street', address.street || '');
          handleLocationChange('city', address.city || '');
          handleLocationChange('province', address.province || '');
          handleLocationChange('postalCode', address.postalCode || '');
        }
      }
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleAddressSearch = async (query: string) => {
    if (query.length > 3) {
      try {
        const suggestions = await searchAddresses(query);
        setAddressSuggestions(suggestions.slice(0, 5)); // Limiter à 5 suggestions
      } catch (error) {
        console.error('Erreur recherche adresse:', error);
        setAddressSuggestions([]);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  // Calcul automatique de la date de fin
  useEffect(() => {
    if (projectInfo.plannedStartDate && projectInfo.estimatedDuration) {
      const startDate = new Date(projectInfo.plannedStartDate);
      const durationDays = Math.ceil(projectInfo.estimatedDuration / 8); // 8h par jour
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);
      
      const endDateString = endDate.toISOString().split('T')[0];
      if (endDateString !== projectInfo.plannedEndDate) {
        handleProjectInfoChange('plannedEndDate', endDateString);
      }
    }
  }, [projectInfo.plannedStartDate, projectInfo.estimatedDuration]);

  // Client sélectionné
  const selectedClient = allClients.find(c => c.id === projectInfo.clientId);
  const selectedWorkType = allWorkTypes.find(w => w.id === projectInfo.workTypeId);

  // =================== RENDU ===================
  return (
    <div className="space-y-8">
      {/* En-tête de l'étape */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-300">{t.subtitle}</p>
      </div>

      {/* Formulaire principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche - Informations de base */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Informations générales
            </h3>

            {/* Titre du projet */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.projectTitle} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectInfo.title}
                onChange={(e) => handleProjectInfoChange('title', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400 ${
                  errors?.projectInfo?.title ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder={t.projectTitlePlaceholder}
              />
              {errors?.projectInfo?.title && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.projectInfo.title}
                </p>
              )}
            </div>

            {/* Client */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.client} <span className="text-red-400">*</span>
              </label>
              <select
                value={projectInfo.clientId}
                onChange={(e) => handleProjectInfoChange('clientId', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white ${
                  errors?.projectInfo?.clientId ? 'border-red-400' : 'border-white/30'
                }`}
              >
                <option value="" className="text-gray-800">{t.selectClient}</option>
                {allClients.map(client => (
                  <option key={client.id} value={client.id} className="text-gray-800">
                    {client.name} - {client.industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de travail */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.workType} <span className="text-red-400">*</span>
              </label>
              <select
                value={projectInfo.workTypeId}
                onChange={(e) => handleProjectInfoChange('workTypeId', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white"
              >
                <option value="" className="text-gray-800">{t.selectWorkType}</option>
                {allWorkTypes.map(workType => (
                  <option key={workType.id} value={workType.id} className="text-gray-800">
                    {workType.name} - {workType.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.projectDescription}
              </label>
              <textarea
                value={projectInfo.description}
                onChange={(e) => handleProjectInfoChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                rows={4}
                placeholder={t.projectDescriptionPlaceholder}
              />
            </div>
          </div>

          {/* Planification */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-400" />
              Planification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t.plannedStartDate} <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={projectInfo.plannedStartDate}
                  onChange={(e) => handleProjectInfoChange('plannedStartDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Durée estimée */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t.estimatedDuration}
                </label>
                <input
                  type="number"
                  value={projectInfo.estimatedDuration}
                  onChange={(e) => handleProjectInfoChange('estimatedDuration', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  min="1"
                  max="720"
                  placeholder="8"
                />
              </div>

              {/* Date de fin (calculée automatiquement) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t.plannedEndDate}
                </label>
                <input
                  type="date"
                  value={projectInfo.plannedEndDate}
                  onChange={(e) => handleProjectInfoChange('plannedEndDate', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-400">
                  <Info className="w-3 h-3 inline mr-1" />
                  Calculée automatiquement selon la durée estimée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Localisation et équipe */}
        <div className="space-y-6">
          {/* Localisation */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-400" />
              Localisation
            </h3>

            {/* Adresse */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t.workLocation} <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectInfo.workLocation.street}
                  onChange={(e) => {
                    handleLocationChange('street', e.target.value);
                    handleAddressSearch(e.target.value);
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder={t.workLocationPlaceholder}
                />
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={isLoadingLocation}
                  className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  title={t.autoDetectLocation}
                >
                  {isLoadingLocation ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Suggestions d'adresses */}
              {addressSuggestions.length > 0 && (
                <div className="mt-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm shadow-lg">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleLocationChange('street', suggestion);
                        setAddressSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Détails de l'adresse */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Ville</label>
                <input
                  type="text"
                  value={projectInfo.workLocation.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Sherbrooke"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Province</label>
                <input
                  type="text"
                  value={projectInfo.workLocation.province}
                  onChange={(e) => handleLocationChange('province', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="QC"
                />
              </div>
            </div>

            {/* Coordonnées GPS */}
            {projectInfo.workLocation.coordinates && (
              <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200">{t.coordinates}:</span>
                  <span className="text-sm text-gray-300 font-mono">
                    {projectInfo.workLocation.coordinates.lat?.toFixed(6)}, {projectInfo.workLocation.coordinates.lng?.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chef d'équipe */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-400" />
              {t.teamLeader}
            </h3>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t.teamLeaderName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={projectInfo.teamLeader.name}
                  onChange={(e) => handleTeamLeaderChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Jean Tremblay"
                />
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t.teamLeaderPosition}
                </label>
                <input
                  type="text"
                  value={projectInfo.teamLeader.position}
                  onChange={(e) => handleTeamLeaderChange('position', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Superviseur électrique"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t.teamLeaderPhone}
                  </label>
                  <input
                    type="tel"
                    value={projectInfo.teamLeader.phone}
                    onChange={(e) => handleTeamLeaderChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                    placeholder="(819) 555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t.teamLeaderEmail}
                  </label>
                  <input
                    type="email"
                    value={projectInfo.teamLeader.email}
                    onChange={(e) => handleTeamLeaderChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-white placeholder-gray-400"
                    placeholder="jean.tremblay@entreprise.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message d'urgence du client */}
      {selectedClient && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-300 mb-2">
                {t.emergencyProtocol} - {selectedClient.name}
              </h4>
              <p className="text-red-200">
                {EMERGENCY_MESSAGES[selectedClient.id as keyof typeof EMERGENCY_MESSAGES]?.[language] || 
                 EMERGENCY_MESSAGES.default[language]}
              </p>
              {selectedClient.emergencyContact && (
                <div className="mt-3 flex items-center space-x-4 text-sm text-red-300">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{selectedClient.emergencyContact}</span>
                  </div>
                  {selectedClient.dispatchContact && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedClient.dispatchContact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Résumé de validation */}
      <div className="bg-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
        <h4 className="text-lg font-semibold text-white mb-4">Résumé de l'étape</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.title && projectInfo.clientId ? 'text-green-400' : 'text-gray-500'}`}>
              {projectInfo.title && projectInfo.clientId ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-300">Informations de base</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.workLocation.street ? 'text-green-400' : 'text-gray-500'}`}>
              {projectInfo.workLocation.street ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-300">Localisation</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.teamLeader.name ? 'text-green-400' : 'text-gray-500'}`}>
              {projectInfo.teamLeader.name ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-300">Chef d'équipe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectInfo;
