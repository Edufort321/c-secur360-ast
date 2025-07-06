"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Shield, 
  ExternalLink,
  Copy,
  Check,
  X,
  Info
} from 'lucide-react';

// =================== INTERFACES ===================
interface ClientEmergencyAlertProps {
  client: {
    id: string;
    name: string;
    logo?: string;
    primaryColor?: string;
    emergencyProtocol?: string;
    contacts: {
      emergency: string;
      supervisor: string;
      dispatch?: string;
      technical?: string;
    };
    procedures?: string[];
    additionalInfo?: string;
  };
  workType?: string;
  location?: string;
  language?: 'fr' | 'en';
  variant?: 'alert' | 'card' | 'compact';
  showActions?: boolean;
  onClose?: () => void;
  className?: string;
}

// =================== DONNÉES DES CLIENTS ===================
const clientsEmergencyData = {
  'hydro-quebec': {
    id: 'hydro-quebec',
    name: 'Hydro-Québec',
    logo: '⚡',
    primaryColor: '#0066CC',
    emergencyProtocol: 'En cas d\'urgence électrique, coupez immédiatement l\'alimentation et évacuez la zone',
    contacts: {
      emergency: '1-800-790-2424',
      supervisor: '1-800-HYDRO-QC',
      dispatch: '1-800-463-9999',
      technical: '1-866-744-6337'
    },
    procedures: [
      'Composez le 911 en premier',
      'Appelez Hydro-Québec au 1-800-790-2424',
      'Éloignez-vous des lignes électriques',
      'Ne touchez jamais à un fil électrique au sol',
      'Attendez l\'arrivée des équipes d\'Hydro-Québec'
    ],
    additionalInfo: 'Disponible 24h/7j • Temps de réponse: 2-4h selon urgence'
  },
  'energir': {
    id: 'energir',
    name: 'Énergir',
    logo: '🔥',
    primaryColor: '#FF6600',
    emergencyProtocol: 'En cas de fuite de gaz, évacuez immédiatement et n\'utilisez aucun appareil électrique',
    contacts: {
      emergency: '1-800-361-8003',
      supervisor: '1-800-ENERGIR',
      dispatch: '1-888-463-7447'
    },
    procedures: [
      'Composez le 911 immédiatement',
      'Appelez Énergir au 1-800-361-8003',
      'Évacuez la zone sans utiliser d\'appareils électriques',
      'N\'allumez pas de flamme ou d\'étincelle',
      'Attendez l\'arrivée des techniciens Énergir'
    ],
    additionalInfo: 'Service d\'urgence 24h/7j • Intervention prioritaire'
  },
  'bell': {
    id: 'bell',
    name: 'Bell Canada',
    logo: '📡',
    primaryColor: '#0048CE',
    emergencyProtocol: 'En cas d\'urgence télécoms, signalez immédiatement les interruptions critiques',
    contacts: {
      emergency: '1-800-667-0123',
      supervisor: '1-800-BELL-TSN',
      dispatch: '611',
      technical: '1-888-824-2511'
    },
    procedures: [
      'Évaluez la criticité de la panne',
      'Contactez Bell au 1-800-667-0123',
      'Documentez l\'heure et la nature du problème',
      'Suivez les instructions du technicien Bell'
    ],
    additionalInfo: 'Support technique 24h/7j pour services critiques'
  }
};

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    emergencyProcedure: 'Procédure d\'urgence',
    emergencyContacts: 'Contacts d\'urgence',
    mainEmergency: 'Urgence principale',
    supervisor: 'Superviseur',
    dispatch: 'Répartition',
    technical: 'Support technique',
    procedures: 'Procédures à suivre',
    additionalInfo: 'Informations supplémentaires',
    copyNumber: 'Copier le numéro',
    numberCopied: 'Numéro copié!',
    callNow: 'Appeler maintenant',
    close: 'Fermer',
    workType: 'Type de travail',
    location: 'Lieu',
    criticalAlert: 'ALERTE CRITIQUE',
    rememberProcedure: 'Gardez cette procédure à portée de main pendant les travaux'
  },
  en: {
    emergencyProcedure: 'Emergency Procedure',
    emergencyContacts: 'Emergency Contacts',
    mainEmergency: 'Main Emergency',
    supervisor: 'Supervisor',
    dispatch: 'Dispatch',
    technical: 'Technical Support',
    procedures: 'Procedures to Follow',
    additionalInfo: 'Additional Information',
    copyNumber: 'Copy number',
    numberCopied: 'Number copied!',
    callNow: 'Call now',
    close: 'Close',
    workType: 'Work Type',
    location: 'Location',
    criticalAlert: 'CRITICAL ALERT',
    rememberProcedure: 'Keep this procedure handy during work'
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const ClientEmergencyAlert: React.FC<ClientEmergencyAlertProps> = ({
  client,
  workType,
  location,
  language = 'fr',
  variant = 'alert',
  showActions = true,
  onClose,
  className = ''
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const t = translations[language];

  // Utiliser les données prédéfinies si disponibles
  const clientData = clientsEmergencyData[client.id as keyof typeof clientsEmergencyData] || client;

  const copyToClipboard = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const callNumber = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  // =================== VARIANTES DE RENDU ===================
  
  if (variant === 'compact') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl">{clientData.logo}</div>
            <div>
              <div className="font-semibold text-red-800 text-sm">{t.emergencyProcedure}</div>
              <div className="text-red-600 text-xs">{clientData.name}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={`tel:${clientData.contacts.emergency}`}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors"
            >
              {clientData.contacts.emergency}
            </a>
            {onClose && (
              <button onClick={onClose} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border-2 border-red-300 rounded-xl shadow-lg ${className}`}>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-t-xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{clientData.logo}</div>
              <div>
                <h3 className="font-bold text-lg">{clientData.name}</h3>
                <p className="text-red-100 text-sm">{t.emergencyContacts}</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-red-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Contacts principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-xs font-medium text-red-700 mb-1">{t.mainEmergency}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-800">{clientData.contacts.emergency}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => copyToClipboard(clientData.contacts.emergency)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title={t.copyNumber}
                  >
                    {copiedNumber === clientData.contacts.emergency ? 
                      <Check className="w-4 h-4" /> : 
                      <Copy className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => callNumber(clientData.contacts.emergency)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title={t.callNow}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-1">{t.supervisor}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-800">{clientData.contacts.supervisor}</span>
                <button
                  onClick={() => callNumber(clientData.contacts.supervisor)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Protocole d'urgence */}
          {clientData.emergencyProtocol && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 text-sm">{clientData.emergencyProtocol}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant 'alert' (par défaut)
  return (
    <div className={`bg-red-50 border-2 border-red-300 rounded-xl p-6 ${className}`}>
      {/* Header avec alerte critique */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500 p-2 rounded-full animate-pulse">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">{t.criticalAlert}</h3>
            <p className="text-red-600">{clientData.name} - {t.emergencyProcedure}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Contexte du travail */}
      {(workType || location) && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-red-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {workType && (
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{t.workType}: <span className="font-medium">{workType}</span></span>
              </div>
            )}
            {location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{t.location}: <span className="font-medium">{location}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Protocole d'urgence principal */}
      {clientData.emergencyProtocol && (
        <div className="mb-6 p-4 bg-red-100 rounded-lg border border-red-300">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{clientData.logo}</div>
            <div>
              <h4 className="font-semibold text-red-800 mb-2">Protocole d'urgence</h4>
              <p className="text-red-700 leading-relaxed">{clientData.emergencyProtocol}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contacts d'urgence */}
      <div className="mb-6">
        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          {t.emergencyContacts}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
            <div className="text-sm font-medium text-red-700 mb-2">{t.mainEmergency}</div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-red-800">{clientData.contacts.emergency}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(clientData.contacts.emergency)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  title={t.copyNumber}
                >
                  {copiedNumber === clientData.contacts.emergency ? 
                    <Check className="w-4 h-4" /> : 
                    <Copy className="w-4 h-4" />
                  }
                </button>
                <a
                  href={`tel:${clientData.contacts.emergency}`}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                  title={t.callNow}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600">{t.supervisor}</div>
                  <div className="font-medium text-gray-800">{clientData.contacts.supervisor}</div>
                </div>
                <a href={`tel:${clientData.contacts.supervisor}`} className="text-blue-600 hover:text-blue-800">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {clientData.contacts.dispatch && (
              <div className="bg-white p-3 rounded border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-600">{t.dispatch}</div>
                    <div className="font-medium text-gray-800">{clientData.contacts.dispatch}</div>
                  </div>
                  <a href={`tel:${clientData.contacts.dispatch}`} className="text-blue-600 hover:text-blue-800">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Procédures détaillées */}
      {clientData.procedures && clientData.procedures.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-red-800 mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            {t.procedures}
          </h4>
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <ol className="space-y-2">
              {clientData.procedures.map((procedure, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{procedure}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Informations supplémentaires */}
      {clientData.additionalInfo && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-800 mb-1">{t.additionalInfo}</div>
              <p className="text-blue-700 text-sm">{clientData.additionalInfo}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message de rappel */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2 text-yellow-800">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{t.rememberProcedure}</span>
        </div>
      </div>
    </div>
  );
};

export default ClientEmergencyAlert;
