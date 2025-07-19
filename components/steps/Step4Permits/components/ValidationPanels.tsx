// components/steps/Step4Permits/components/ValidationPanels.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Wrench, Users, FileText, Shield, CheckCircle, 
  XCircle, AlertTriangle, Clock, RefreshCw, TrendingUp,
  Thermometer, Wind, Eye, Settings, User, HardHat
} from 'lucide-react';

// =================== ATMOSPHERIC MONITORING PANEL ===================
interface AtmosphericMonitoringPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  regulationConfig: any;
  onDataUpdate: (data: any[]) => void;
}

export const AtmosphericMonitoringPanel: React.FC<AtmosphericMonitoringPanelProps> = ({
  permit,
  language,
  validationResult,
  regulationConfig,
  onDataUpdate
}) => {
  const mockReadings = [
    { id: '1', gasType: 'oxygen', value: 20.9, unit: '%', timestamp: new Date(), alarmLevel: 'normal' },
    { id: '2', gasType: 'carbon_monoxide', value: 0, unit: 'ppm', timestamp: new Date(), alarmLevel: 'normal' },
    { id: '3', gasType: 'hydrogen_sulfide', value: 0, unit: 'ppm', timestamp: new Date(), alarmLevel: 'normal' },
    { id: '4', gasType: 'methane', value: 0, unit: '%LEL', timestamp: new Date(), alarmLevel: 'normal' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="text-blue-600" size={24} />
          {language === 'fr' ? 'Surveillance Atmosphérique' : 'Atmospheric Monitoring'}
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
          <RefreshCw size={16} />
          {language === 'fr' ? 'Actualiser' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockReadings.map((reading) => (
          <div key={reading.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {reading.gasType.replace('_', ' ')}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                reading.alarmLevel === 'normal' ? 'bg-green-500' :
                reading.alarmLevel === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {reading.value} <span className="text-sm text-gray-500">{reading.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {reading.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          {language === 'fr' ? 'Limites réglementaires' : 'Regulatory limits'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Oxygène:</span> 19.5% - 23.5%
          </div>
          <div>
            <span className="font-medium">CO:</span> {'<'} 35 ppm
          </div>
          <div>
            <span className="font-medium">H₂S:</span> {'<'} 10 ppm
          </div>
          <div>
            <span className="font-medium">CH₄:</span> {'<'} 10% LEL
          </div>
        </div>
      </div>

      {validationResult && (
        <div className={`p-4 rounded-lg border-l-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.isValid ? 
              <CheckCircle className="text-green-600" size={20} /> :
              <XCircle className="text-red-600" size={20} />
            }
            <span className="font-medium">
              {validationResult.isValid 
                ? (language === 'fr' ? 'Validation réussie' : 'Validation passed')
                : (language === 'fr' ? 'Validation échouée' : 'Validation failed')
              }
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {language === 'fr' ? 'Confiance: ' : 'Confidence: '}{Math.round(validationResult.confidence || 0)}%
          </p>
        </div>
      )}
    </div>
  );
};

// =================== EQUIPMENT VALIDATION PANEL ===================
interface EquipmentValidationPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  regulationConfig: any;
  onDataUpdate: (data: any[]) => void;
}

export const EquipmentValidationPanel: React.FC<EquipmentValidationPanelProps> = ({
  permit,
  language,
  validationResult,
  regulationConfig,
  onDataUpdate
}) => {
  const mockEquipment = [
    { id: '1', type: 'gas_detector_portable', name: 'Détecteur 4 gaz', status: 'operational', lastCalibration: new Date() },
    { id: '2', type: 'ventilation_fan', name: 'Ventilateur portable', status: 'operational', lastInspection: new Date() },
    { id: '3', type: 'communication_system', name: 'Radio bidirectionnelle', status: 'operational', lastCheck: new Date() },
    { id: '4', type: 'tripod_winch', name: 'Trépied avec treuil', status: 'needs_attention', lastInspection: new Date() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="text-orange-600" size={24} />
          {language === 'fr' ? 'Validation Équipement' : 'Equipment Validation'}
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
          <Settings size={16} />
          {language === 'fr' ? 'Configurer' : 'Configure'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockEquipment.map((equipment) => (
          <div key={equipment.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{equipment.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                equipment.status === 'operational' ? 'bg-green-100 text-green-800' :
                equipment.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {equipment.status === 'operational' ? 'Opérationnel' :
                 equipment.status === 'needs_attention' ? 'Attention requise' : 'Défaillant'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div>Type: {equipment.type.replace(/_/g, ' ')}</div>
              <div>
                Dernière vérification: {equipment.lastCalibration?.toLocaleDateString() || 
                                      equipment.lastInspection?.toLocaleDateString() || 
                                      equipment.lastCheck?.toLocaleDateString()}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-1 px-3 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                {language === 'fr' ? 'Inspecter' : 'Inspect'}
              </button>
              <button className="flex-1 py-1 px-3 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                {language === 'fr' ? 'Historique' : 'History'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {validationResult && (
        <div className={`p-4 rounded-lg border-l-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.isValid ? 
              <CheckCircle className="text-green-600" size={20} /> :
              <XCircle className="text-red-600" size={20} />
            }
            <span className="font-medium">
              {validationResult.isValid 
                ? (language === 'fr' ? 'Équipement validé' : 'Equipment validated')
                : (language === 'fr' ? 'Problèmes détectés' : 'Issues detected')
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== PERSONNEL VALIDATION PANEL ===================
interface PersonnelValidationPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  regulationConfig: any;
  onDataUpdate: (data: any[]) => void;
}

export const PersonnelValidationPanel: React.FC<PersonnelValidationPanelProps> = ({
  permit,
  language,
  validationResult,
  regulationConfig,
  onDataUpdate
}) => {
  const mockPersonnel = [
    { id: '1', name: 'Jean Dupont', role: 'entry_supervisor', certifications: ['espace-clos-superviseur'], status: 'qualified' },
    { id: '2', name: 'Marie Martin', role: 'entrant', certifications: ['espace-clos-travailleur'], status: 'qualified' },
    { id: '3', name: 'Pierre Durand', role: 'attendant', certifications: ['premiers-secours'], status: 'training_required' },
    { id: '4', name: 'Sophie Leclerc', role: 'rescue_team_member', certifications: ['secours-espace-clos'], status: 'qualified' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="text-purple-600" size={24} />
          {language === 'fr' ? 'Validation Personnel' : 'Personnel Validation'}
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
          <User size={16} />
          {language === 'fr' ? 'Ajouter' : 'Add'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockPersonnel.map((person) => (
          <div key={person.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <HardHat size={20} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{person.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{person.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                person.status === 'qualified' ? 'bg-green-100 text-green-800' :
                person.status === 'training_required' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {person.status === 'qualified' ? 'Qualifié' :
                 person.status === 'training_required' ? 'Formation requise' : 'Non qualifié'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Certifications:</span>
                <div className="mt-1 space-y-1">
                  {person.certifications.map((cert, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-1 px-3 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                {language === 'fr' ? 'Profil' : 'Profile'}
              </button>
              <button className="flex-1 py-1 px-3 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                {language === 'fr' ? 'Formations' : 'Training'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {validationResult && (
        <div className={`p-4 rounded-lg border-l-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.isValid ? 
              <CheckCircle className="text-green-600" size={20} /> :
              <XCircle className="text-red-600" size={20} />
            }
            <span className="font-medium">
              {validationResult.isValid 
                ? (language === 'fr' ? 'Équipe validée' : 'Team validated')
                : (language === 'fr' ? 'Problèmes d\'équipe' : 'Team issues')
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== PROCEDURE VALIDATION PANEL ===================
interface ProcedureValidationPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  regulationConfig: any;
  onDataUpdate: (data: any[]) => void;
}

export const ProcedureValidationPanel: React.FC<ProcedureValidationPanelProps> = ({
  permit,
  language,
  validationResult,
  regulationConfig,
  onDataUpdate
}) => {
  const mockProcedures = [
    { id: '1', type: 'confined_space_entry', title: 'Procédure d\'entrée', status: 'approved', lastReview: new Date() },
    { id: '2', type: 'emergency_response', title: 'Procédure d\'urgence', status: 'approved', lastReview: new Date() },
    { id: '3', type: 'communication_protocol', title: 'Protocole communication', status: 'review_required', lastReview: new Date() },
    { id: '4', type: 'rescue_plan', title: 'Plan de sauvetage', status: 'approved', lastReview: new Date() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="text-green-600" size={24} />
          {language === 'fr' ? 'Validation Procédures' : 'Procedure Validation'}
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
          <FileText size={16} />
          {language === 'fr' ? 'Nouvelle' : 'New'}
        </button>
      </div>

      <div className="space-y-4">
        {mockProcedures.map((procedure) => (
          <div key={procedure.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{procedure.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                procedure.status === 'approved' ? 'bg-green-100 text-green-800' :
                procedure.status === 'review_required' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {procedure.status === 'approved' ? 'Approuvée' :
                 procedure.status === 'review_required' ? 'Révision requise' : 'Non approuvée'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Type: {procedure.type.replace(/_/g, ' ')}</span>
              <span>Dernière révision: {procedure.lastReview.toLocaleDateString()}</span>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-1 px-3 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                {language === 'fr' ? 'Voir' : 'View'}
              </button>
              <button className="flex-1 py-1 px-3 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                {language === 'fr' ? 'Modifier' : 'Edit'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {validationResult && (
        <div className={`p-4 rounded-lg border-l-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validationResult.isValid ? 
              <CheckCircle className="text-green-600" size={20} /> :
              <XCircle className="text-red-600" size={20} />
            }
            <span className="font-medium">
              {validationResult.isValid 
                ? (language === 'fr' ? 'Procédures validées' : 'Procedures validated')
                : (language === 'fr' ? 'Procédures incomplètes' : 'Procedures incomplete')
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== VALIDATION SUMMARY PANEL ===================
interface ValidationSummaryPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  allValidationResults?: any;
  regulationConfig: any;
  onGeneratePermit: () => void;
}

export const ValidationSummaryPanel: React.FC<ValidationSummaryPanelProps> = ({
  permit,
  language,
  validationResult,
  allValidationResults,
  regulationConfig,
  onGeneratePermit
}) => {
  const validationCategories = [
    { key: 'atmospheric', icon: Activity, label: language === 'fr' ? 'Atmosphérique' : 'Atmospheric' },
    { key: 'equipment', icon: Wrench, label: language === 'fr' ? 'Équipement' : 'Equipment' },
    { key: 'personnel', icon: Users, label: language === 'fr' ? 'Personnel' : 'Personnel' },
    { key: 'procedures', icon: FileText, label: language === 'fr' ? 'Procédures' : 'Procedures' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="text-blue-600" size={24} />
          {language === 'fr' ? 'Résumé de Validation' : 'Validation Summary'}
        </h3>
        <button 
          onClick={onGeneratePermit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FileText size={16} />
          {language === 'fr' ? 'Générer Permis' : 'Generate Permit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {validationCategories.map(({ key, icon: Icon, label }) => {
          const result = allValidationResults?.[key];
          const isValid = result?.isValid;
          
          return (
            <div key={key} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="text-gray-600" size={20} />
                {isValid === true && <CheckCircle className="text-green-500" size={20} />}
                {isValid === false && <XCircle className="text-red-500" size={20} />}
                {isValid === undefined && <Clock className="text-yellow-500" size={20} />}
              </div>
              <h4 className="font-medium text-gray-900">{label}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {isValid === true && (language === 'fr' ? 'Validé' : 'Validated')}
                {isValid === false && (language === 'fr' ? 'Échec' : 'Failed')}
                {isValid === undefined && (language === 'fr' ? 'En attente' : 'Pending')}
              </p>
              {result?.confidence && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {language === 'fr' ? 'Confiance' : 'Confidence'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">
          {language === 'fr' ? 'État global du permis' : 'Overall permit status'}
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {language === 'fr' ? 'Progression globale' : 'Overall progress'}
            </span>
            <span className="font-medium">{permit.progress || 0}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${permit.progress || 0}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Statut' : 'Status'}
              </span>
              <p className="font-medium capitalize">{permit.status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">
                {language === 'fr' ? 'Priorité' : 'Priority'}
              </span>
              <p className="font-medium capitalize">{permit.priority}</p>
            </div>
          </div>
        </div>
      </div>

      {validationResult && !validationResult.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h5 className="font-medium text-red-800 mb-2">
            {language === 'fr' ? 'Problèmes à résoudre' : 'Issues to resolve'}
          </h5>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• {language === 'fr' ? 'Vérifier les lectures atmosphériques' : 'Check atmospheric readings'}</li>
            <li>• {language === 'fr' ? 'Calibrer l\'équipement de détection' : 'Calibrate detection equipment'}</li>
            <li>• {language === 'fr' ? 'Compléter la formation du personnel' : 'Complete personnel training'}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// =================== PERMIT GENERATION PANEL ===================
interface PermitGenerationPanelProps {
  permit: any;
  language: 'fr' | 'en';
  validationResult?: any;
  regulationConfig: any;
}

export const PermitGenerationPanel: React.FC<PermitGenerationPanelProps> = ({
  permit,
  language,
  validationResult,
  regulationConfig
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {language === 'fr' ? 'Génération de Permis' : 'Permit Generation'}
      </h3>
      
      <div className="bg-white border rounded-lg p-4">
        <p className="text-gray-600">
          {language === 'fr' ? 'Fonctionnalité en développement' : 'Feature under development'}
        </p>
      </div>
    </div>
  );
};
