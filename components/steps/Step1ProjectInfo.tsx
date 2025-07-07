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

// Import des données
import { allClients } from '@/data/clients';
import { allWorkTypes } from '@/data/workTypes';

// Import des hooks
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

// Import des types
import { ContactInfo, Address } from '../../types';

// =================== INTERFACES ===================
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

// =================== COMPOSANT PRINCIPAL ===================
const Step1ProjectInfo: React.FC<Step1ProjectInfoProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const projectInfo: ProjectInfoData = formData.projectInfo;
  
  // États locaux
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  
  // Hooks
  const { getCurrentLocation, geocodeAddress, searchAddresses } = useGoogleMaps();
  
  // Référence pour la carte
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Formulaire principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonne gauche - Informations de base */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informations générales
            </h3>

            {/* Titre du projet */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.projectTitle} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectInfo.title}
                onChange={(e) => handleProjectInfoChange('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t.projectTitlePlaceholder}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Client */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.client} <span className="text-red-500">*</span>
              </label>
              <select
                value={projectInfo.clientId}
                onChange={(e) => handleProjectInfoChange('clientId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.clientId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t.selectClient}</option>
                {allClients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de travail */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.workType} <span className="text-red-500">*</span>
              </label>
              <select
                value={projectInfo.workTypeId}
                onChange={(e) => handleProjectInfoChange('workTypeId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">{t.selectWorkType}</option>
                {allWorkTypes.map(workType => (
                  <option key={workType.id} value={workType.id}>
                    {workType.name} - {workType.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.projectDescription}
              </label>
              <textarea
                value={projectInfo.description}
                onChange={(e) => handleProjectInfoChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows={4}
                placeholder={t.projectDescriptionPlaceholder}
              />
            </div>
          </div>

          {/* Planification */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Planification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.plannedStartDate} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={projectInfo.plannedStartDate}
                  onChange={(e) => handleProjectInfoChange('plannedStartDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Durée estimée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.estimatedDuration}
                </label>
                <input
                  type="number"
                  value={projectInfo.estimatedDuration}
                  onChange={(e) => handleProjectInfoChange('estimatedDuration', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  min="1"
                  max="720"
                  placeholder="8"
                />
              </div>

              {/* Date de fin (calculée automatiquement) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.plannedEndDate}
                </label>
                <input
                  type="date"
                  value={projectInfo.plannedEndDate}
                  onChange={(e) => handleProjectInfoChange('plannedEndDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Localisation
            </h3>

            {/* Adresse */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.workLocation} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectInfo.workLocation.street}
                  onChange={(e) => {
                    handleLocationChange('street', e.target.value);
                    handleAddressSearch(e.target.value);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleLocationChange('street', suggestion);
                        setAddressSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={projectInfo.workLocation.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sherbrooke"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  type="text"
                  value={projectInfo.workLocation.province}
                  onChange={(e) => handleLocationChange('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="QC"
                />
              </div>
            </div>

            {/* Coordonnées GPS */}
            {projectInfo.workLocation.coordinates && (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t.coordinates}:</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {projectInfo.workLocation.coordinates.lat?.toFixed(6)}, {projectInfo.workLocation.coordinates.lng?.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chef d'équipe */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-600" />
              {t.teamLeader}
            </h3>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.teamLeaderName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectInfo.teamLeader.name}
                  onChange={(e) => handleTeamLeaderChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Jean Tremblay"
                />
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.teamLeaderPosition}
                </label>
                <input
                  type="text"
                  value={projectInfo.teamLeader.position}
                  onChange={(e) => handleTeamLeaderChange('position', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Superviseur électrique"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.teamLeaderPhone}
                  </label>
                  <input
                    type="tel"
                    value={projectInfo.teamLeader.phone}
                    onChange={(e) => handleTeamLeaderChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="(819) 555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.teamLeaderEmail}
                  </label>
                  <input
                    type="email"
                    value={projectInfo.teamLeader.email}
                    onChange={(e) => handleTeamLeaderChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-red-800 mb-2">
                {t.emergencyProtocol} - {selectedClient.name}
              </h4>
              <p className="text-red-700">
                {EMERGENCY_MESSAGES[selectedClient.id as keyof typeof EMERGENCY_MESSAGES]?.[language] || 
                 EMERGENCY_MESSAGES.default[language]}
              </p>
              {selectedClient.emergencyContact && (
                <div className="mt-3 flex items-center space-x-4 text-sm text-red-600">
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Résumé de l'étape</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.title && projectInfo.clientId ? 'text-green-600' : 'text-gray-400'}`}>
              {projectInfo.title && projectInfo.clientId ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-600">Informations de base</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.workLocation.street ? 'text-green-600' : 'text-gray-400'}`}>
              {projectInfo.workLocation.street ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-600">Localisation</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${projectInfo.teamLeader.name ? 'text-green-600' : 'text-gray-400'}`}>
              {projectInfo.teamLeader.name ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-600">Chef d'équipe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1ProjectInfo;
