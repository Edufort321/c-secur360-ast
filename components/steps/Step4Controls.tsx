"use client";

import React, { useState, useMemo } from 'react';
import { Shield, TrendingDown, CheckCircle, AlertTriangle, Plus, Target, BarChart3 } from 'lucide-react';
import RiskMatrix from '@/components/shared/RiskMatrix';

// =================== INTERFACES ===================
interface Step4ControlsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface ControlMeasure {
  id: string;
  hazardId: string;
  type: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  name: string;
  description: string;
  effectiveness: number; // 0-100%
  cost: 'low' | 'medium' | 'high';
  timeToImplement: string;
  responsible: string;
  deadline: string;
  isImplemented: boolean;
  priority: number; // 1-5
  legislation?: string;
  notes?: string;
}

interface SelectedHazard {
  id: string;
  description: string;
  category: string;
  severity: number;
  probability: number;
  riskLevel: string;
  controlMeasures: ControlMeasure[];
  residualRisk?: {
    severity: number;
    probability: number;
    riskLevel: string;
  };
}

// =================== MESURES DE CONTRÔLE PRÉDÉFINIES ===================
const controlMeasuresDatabase: Record<string, ControlMeasure[]> = {
  // Mesures pour dangers électriques
  'elec_shock': [
    {
      id: 'loto_procedure',
      hazardId: 'elec_shock',
      type: 'elimination',
      name: 'Procédure LOTO (Consignation)',
      description: 'Consignation électrique complète avec verrouillage et étiquetage',
      effectiveness: 95,
      cost: 'low',
      timeToImplement: '30 minutes',
      responsible: 'Électricien qualifié',
      deadline: '',
      isImplemented: false,
      priority: 1,
      legislation: 'CSA Z462, RSST Art. 185'
    },
    {
      id: 'vat_verification',
      hazardId: 'elec_shock',
      type: 'administrative',
      name: 'Vérification absence de tension (VAT)',
      description: 'Test avec appareil certifié pour confirmer absence tension',
      effectiveness: 90,
      cost: 'low',
      timeToImplement: '10 minutes',
      responsible: 'Électricien qualifié',
      deadline: '',
      isImplemented: false,
      priority: 1,
      legislation: 'CSA Z462'
    },
    {
      id: 'electrical_ppe',
      hazardId: 'elec_shock',
      type: 'ppe',
      name: 'EPI électrique spécialisé',
      description: 'Gants isolants, chaussures diélectriques, casque classe E',
      effectiveness: 75,
      cost: 'medium',
      timeToImplement: 'Immédiat',
      responsible: 'Travailleur',
      deadline: '',
      isImplemented: false,
      priority: 2,
      legislation: 'CSA Z462 Annexe H'
    }
  ],

  // Mesures pour chutes de hauteur
  'falls_height': [
    {
      id: 'fall_guardrails',
      hazardId: 'falls_height',
      type: 'engineering',
      name: 'Garde-corps permanents',
      description: 'Installation garde-corps conformes h=1070mm avec main courante',
      effectiveness: 95,
      cost: 'high',
      timeToImplement: '2-4 heures',
      responsible: 'Installateur certifié',
      deadline: '',
      isImplemented: false,
      priority: 1,
      legislation: 'RSST Art. 2.9.1'
    },
    {
      id: 'fall_harness',
      hazardId: 'falls_height',
      type: 'ppe',
      name: 'Système arrêt de chute',
      description: 'Harnais intégral avec longe absorption énergie',
      effectiveness: 80,
      cost: 'medium',
      timeToImplement: 'Immédiat',
      responsible: 'Travailleur formé',
      deadline: '',
      isImplemented: false,
      priority: 2,
      legislation: 'CSA Z259 série'
    },
    {
      id: 'safety_nets',
      hazardId: 'falls_height',
      type: 'engineering',
      name: 'Filets de sécurité',
      description: 'Installation filets protection collective',
      effectiveness: 85,
      cost: 'medium',
      timeToImplement: '1-2 heures',
      responsible: 'Équipe montage',
      deadline: '',
      isImplemented: false,
      priority: 2,
      legislation: 'CSA Z259.16'
    }
  ],

  // Mesures génériques pour autres dangers
  'default': [
    {
      id: 'elimination_redesign',
      hazardId: 'default',
      type: 'elimination',
      name: 'Élimination par reconception',
      description: 'Modification du processus pour éliminer le danger',
      effectiveness: 100,
      cost: 'high',
      timeToImplement: 'Variable',
      responsible: 'Ingénieur/Concepteur',
      deadline: '',
      isImplemented: false,
      priority: 1
    },
    {
      id: 'substitution_safer',
      hazardId: 'default',
      type: 'substitution',
      name: 'Substitution sécuritaire',
      description: 'Remplacement par alternative moins dangereuse',
      effectiveness: 85,
      cost: 'medium',
      timeToImplement: 'Variable',
      responsible: 'Spécialiste technique',
      deadline: '',
      isImplemented: false,
      priority: 2
    },
    {
      id: 'engineering_controls',
      hazardId: 'default',
      type: 'engineering',
      name: 'Contrôles techniques',
      description: 'Mesures techniques de protection collective',
      effectiveness: 75,
      cost: 'medium',
      timeToImplement: '1-4 heures',
      responsible: 'Technicien spécialisé',
      deadline: '',
      isImplemented: false,
      priority: 3
    },
    {
      id: 'administrative_controls',
      hazardId: 'default',
      type: 'administrative',
      name: 'Contrôles administratifs',
      description: 'Procédures, formation, surveillance renforcée',
      effectiveness: 60,
      cost: 'low',
      timeToImplement: '30 minutes',
      responsible: 'Superviseur',
      deadline: '',
      isImplemented: false,
      priority: 4
    },
    {
      id: 'ppe_standard',
      hazardId: 'default',
      type: 'ppe',
      name: 'Équipements protection individuelle',
      description: 'EPI adaptés au danger spécifique',
      effectiveness: 50,
      cost: 'low',
      timeToImplement: 'Immédiat',
      responsible: 'Travailleur',
      deadline: '',
      isImplemented: false,
      priority: 5
    }
  ]
};

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Mesures de Contrôle',
    subtitle: 'Définissez les mesures de contrôle selon la hiérarchie CSA',
    noHazards: 'Aucun danger identifié',
    noHazardsDesc: 'Retournez à l\'étape précédente pour identifier les dangers',
    hierarchyTitle: 'Hiérarchie des mesures de contrôle',
    riskReduction: 'Réduction du risque',
    beforeAfter: 'Avant / Après contrôles',
    residualRisk: 'Risque résiduel',
    implementation: 'Mise en œuvre',
    controlTypes: {
      elimination: 'Élimination',
      substitution: 'Substitution',
      engineering: 'Contrôles techniques',
      administrative: 'Contrôles administratifs',
      ppe: 'EPI'
    },
    effectiveness: 'Efficacité',
    cost: 'Coût',
    timeToImplement: 'Temps de mise en œuvre',
    responsible: 'Responsable',
    deadline: 'Échéance',
    priority: 'Priorité',
    implemented: 'Implémenté',
    addCustomControl: 'Ajouter mesure personnalisée',
    selectMeasures: 'Sélectionner les mesures de contrôle appropriées',
    costLevels: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé'
    },
    summary: {
      totalMeasures: 'Mesures totales',
      implemented: 'Implémentées',
      avgEffectiveness: 'Efficacité moyenne',
      riskReduction: 'Réduction risque'
    }
  },
  en: {
    title: 'Control Measures',
    subtitle: 'Define control measures according to CSA hierarchy',
    noHazards: 'No hazards identified',
    noHazardsDesc: 'Go back to previous step to identify hazards',
    hierarchyTitle: 'Control measures hierarchy',
    riskReduction: 'Risk reduction',
    beforeAfter: 'Before / After controls',
    residualRisk: 'Residual risk',
    implementation: 'Implementation',
    controlTypes: {
      elimination: 'Elimination',
      substitution: 'Substitution',
      engineering: 'Engineering Controls',
      administrative: 'Administrative Controls',
      ppe: 'PPE'
    },
    effectiveness: 'Effectiveness',
    cost: 'Cost',
    timeToImplement: 'Implementation Time',
    responsible: 'Responsible',
    deadline: 'Deadline',
    priority: 'Priority',
    implemented: 'Implemented',
    addCustomControl: 'Add custom control',
    selectMeasures: 'Select appropriate control measures',
    costLevels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    },
    summary: {
      totalMeasures: 'Total Measures',
      implemented: 'Implemented',
      avgEffectiveness: 'Avg Effectiveness',
      riskReduction: 'Risk Reduction'
    }
  }
};

// =================== CONFIGURATION ===================
const controlTypeColors = {
  elimination: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '🚫' },
  substitution: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '🔄' },
  engineering: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: '⚙️' },
  administrative: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '📋' },
  ppe: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '🦺' }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step4Controls: React.FC<Step4ControlsProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const [showMatrix, setShowMatrix] = useState(true);

  // Récupérer les dangers identifiés
  const identifiedHazards: SelectedHazard[] = formData.hazards?.selected || [];

  // État des mesures de contrôle
  const [controlMeasures, setControlMeasures] = useState<Record<string, ControlMeasure[]>>(
    formData.controls?.measures || {}
  );

  // =================== CALCULS ===================
  const controlStats = useMemo(() => {
    const allMeasures = Object.values(controlMeasures).flat();
    const totalMeasures = allMeasures.length;
    const implementedMeasures = allMeasures.filter(m => m.isImplemented).length;
    const avgEffectiveness = totalMeasures > 0 
      ? Math.round(allMeasures.reduce((sum, m) => sum + m.effectiveness, 0) / totalMeasures)
      : 0;

    return {
      totalMeasures,
      implementedMeasures,
      avgEffectiveness
    };
  }, [controlMeasures]);

  // Calcul du risque résiduel pour chaque danger
  const hazardsWithResidualRisk = useMemo(() => {
    return identifiedHazards.map(hazard => {
      const hazardControls = controlMeasures[hazard.id] || [];
      const implementedControls = hazardControls.filter(c => c.isImplemented);
      
      let residualSeverity = hazard.severity;
      let residualProbability = hazard.probability;
      
      if (implementedControls.length > 0) {
        const totalEffectiveness = implementedControls.reduce((sum, c) => sum + c.effectiveness, 0);
        const maxEffectiveness = Math.min(90, totalEffectiveness); // Plafond à 90%
        
        // Réduction proportionnelle
        const reductionFactor = (100 - maxEffectiveness) / 100;
        residualSeverity = Math.max(1, Math.round(hazard.severity * reductionFactor));
        residualProbability = Math.max(1, Math.round(hazard.probability * reductionFactor));
      }

      return {
        ...hazard,
        controlMeasures: hazardControls,
        residualRisk: {
          severity: residualSeverity,
          probability: residualProbability,
          riskLevel: calculateRiskLevel(residualSeverity, residualProbability)
        }
      };
    });
  }, [identifiedHazards, controlMeasures]);

  const calculateRiskLevel = (severity: number, probability: number): string => {
    const score = severity * probability;
    if (score <= 4) return 'very_low';
    if (score <= 8) return 'low';
    if (score <= 12) return 'medium';
    if (score <= 16) return 'high';
    return 'very_high';
  };

  // =================== HANDLERS ===================
  const getAvailableControls = (hazardId: string): ControlMeasure[] => {
    const specificControls = controlMeasuresDatabase[hazardId] || [];
    const genericControls = controlMeasuresDatabase['default'] || [];
    
    return [
      ...specificControls.map(c => ({ ...c, hazardId })),
      ...genericControls.map(c => ({ ...c, hazardId, id: `${hazardId}_${c.id}` }))
    ];
  };

  const handleControlToggle = (hazardId: string, controlId: string) => {
    const availableControls = getAvailableControls(hazardId);
    const control = availableControls.find(c => c.id === controlId);
    
    if (control) {
      const currentControls = controlMeasures[hazardId] || [];
      const existingIndex = currentControls.findIndex(c => c.id === controlId);
      
      let updatedControls;
      if (existingIndex >= 0) {
        // Retirer la mesure
        updatedControls = currentControls.filter(c => c.id !== controlId);
      } else {
        // Ajouter la mesure
        updatedControls = [...currentControls, { ...control, isImplemented: false }];
      }
      
      const updatedControlMeasures = {
        ...controlMeasures,
        [hazardId]: updatedControls
      };
      
      setControlMeasures(updatedControlMeasures);
      updateFormData(updatedControlMeasures);
    }
  };

  const handleControlUpdate = (hazardId: string, controlId: string, field: keyof ControlMeasure, value: any) => {
    const updatedControlMeasures = {
      ...controlMeasures,
      [hazardId]: (controlMeasures[hazardId] || []).map(control =>
        control.id === controlId ? { ...control, [field]: value } : control
      )
    };
    
    setControlMeasures(updatedControlMeasures);
    updateFormData(updatedControlMeasures);
  };

  const updateFormData = (updatedControlMeasures: Record<string, ControlMeasure[]>) => {
    const controlsData = {
      measures: updatedControlMeasures,
      summary: {
        totalMeasures: Object.values(updatedControlMeasures).flat().length,
        implementedMeasures: Object.values(updatedControlMeasures).flat().filter(m => m.isImplemented).length,
        avgEffectiveness: controlStats.avgEffectiveness
      }
    };
    
    onDataChange('controls', controlsData);
  };

  // Données pour la matrice (avant/après)
  const initialRisks = identifiedHazards.map(h => ({
    id: h.id,
    name: h.description,
    severity: h.severity,
    probability: h.probability,
    category: h.category
  }));

  const residualRisks = hazardsWithResidualRisk.map(h => ({
    id: h.id,
    name: h.description,
    severity: h.residualRisk?.severity || h.severity,
    probability: h.residualRisk?.probability || h.probability,
    category: h.category
  }));

  // =================== RENDU ===================
  if (identifiedHazards.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t.noHazards}</h3>
          <p className="text-gray-500">{t.noHazardsDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{controlStats.totalMeasures}</div>
          <div className="text-sm text-blue-700">{t.summary.totalMeasures}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{controlStats.implementedMeasures}</div>
          <div className="text-sm text-green-700">{t.summary.implemented}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{controlStats.avgEffectiveness}%</div>
          <div className="text-sm text-purple-700">{t.summary.avgEffectiveness}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((1 - residualRisks.reduce((sum, r) => sum + (r.severity * r.probability), 0) / 
            initialRisks.reduce((sum, r) => sum + (r.severity * r.probability), 0)) * 100)}%
          </div>
          <div className="text-sm text-orange-700">{t.summary.riskReduction}</div>
        </div>
      </div>

      {/* Matrice avant/après */}
      {showMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risques initiaux</h3>
            <RiskMatrix
              risks={initialRisks}
              showLegend={false}
              showStats={false}
              showControls={false}
              language={language}
              className="h-fit"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-1 text-green-600" />
              Risques résiduels
            </h3>
            <RiskMatrix
              risks={residualRisks}
              showLegend={false}
              showStats={false}
              showControls={false}
              language={language}
              className="h-fit"
            />
          </div>
        </div>
      )}

      {/* Mesures de contrôle par danger */}
      <div className="space-y-6">
        {hazardsWithResidualRisk.map((hazard, index) => (
          <div key={hazard.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{hazard.description}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>Risque initial: {hazard.severity} × {hazard.probability} = {hazard.severity * hazard.probability}</span>
                  <span>→</span>
                  <span className="text-green-600 font-medium">
                    Risque résiduel: {hazard.residualRisk?.severity} × {hazard.residualRisk?.probability} = {(hazard.residualRisk?.severity || 0) * (hazard.residualRisk?.probability || 0)}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (hazard.residualRisk?.severity || 0) * (hazard.residualRisk?.probability || 0) >= 15 ? 'bg-red-100 text-red-800' :
                (hazard.residualRisk?.severity || 0) * (hazard.residualRisk?.probability || 0) >= 10 ? 'bg-orange-100 text-orange-800' :
                (hazard.residualRisk?.severity || 0) * (hazard.residualRisk?.probability || 0) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {hazard.residualRisk?.riskLevel}
              </span>
            </div>

            {/* Hiérarchie des contrôles */}
            <div className="space-y-4">
              {(['elimination', 'substitution', 'engineering', 'administrative', 'ppe'] as const).map(controlType => {
                const availableControls = getAvailableControls(hazard.id).filter(c => c.type === controlType);
                const selectedControls = hazard.controlMeasures.filter(c => c.type === controlType);
                const typeStyle = controlTypeColors[controlType];
                
                if (availableControls.length === 0) return null;

                return (
                  <div key={controlType} className={`p-4 rounded-lg border ${typeStyle.border} ${typeStyle.bg}`}>
                    <h4 className={`font-semibold mb-3 flex items-center ${typeStyle.text}`}>
                      <span className="text-lg mr-2">{typeStyle.icon}</span>
                      {t.controlTypes[controlType]}
                      {selectedControls.length > 0 && (
                        <span className="ml-2 bg-white px-2 py-1 rounded-full text-xs">
                          {selectedControls.length}
                        </span>
                      )}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableControls.map(control => {
                        const isSelected = hazard.controlMeasures.some(c => c.id === control.id);
                        const selectedControl = hazard.controlMeasures.find(c => c.id === control.id);
                        
                        return (
                          <div
                            key={control.id}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                              isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                            onClick={() => handleControlToggle(hazard.id, control.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm text-gray-800">{control.name}</h5>
                              {isSelected && <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />}
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2">{control.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              <div>Efficacité: {control.effectiveness}%</div>
                              <div>Coût: {t.costLevels[control.cost]}</div>
                              <div>Temps: {control.timeToImplement}</div>
                              <div>Priorité: {control.priority}/5</div>
                            </div>

                            {isSelected && selectedControl && (
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedControl.isImplemented}
                                    onChange={(e) => handleControlUpdate(hazard.id, control.id, 'isImplemented', e.target.checked)}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-xs text-gray-700">{t.implemented}</span>
                                </div>
                                
                                <input
                                  type="text"
                                  placeholder={t.responsible}
                                  value={selectedControl.responsible}
                                  onChange={(e) => handleControlUpdate(hazard.id, control.id, 'responsible', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                />
                                
                                <input
                                  type="date"
                                  value={selectedControl.deadline}
                                  onChange={(e) => handleControlUpdate(hazard.id, control.id, 'deadline', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Validation */}
      {errors?.controls && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erreurs de validation :</span>
          </div>
          <ul className="mt-2 text-sm text-red-700">
            {errors.controls.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step4Controls;
