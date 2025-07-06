"use client";

import React, { useState, useMemo } from 'react';
import { AlertTriangle, Plus, Search, Filter, Eye, BarChart3, CheckCircle } from 'lucide-react';
import HazardCard from '@/components/shared/HazardCard';
import RiskMatrix from '@/components/shared/RiskMatrix';

// =================== INTERFACES ===================
interface Step3HazardsProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Hazard {
  id: string;
  category: 'electrical' | 'mechanical' | 'chemical' | 'physical' | 'ergonomic' | 'environmental';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  controlMeasures: string[];
  photos: any[];
  legislation: string;
  isSelected?: boolean;
  severity?: number;
  probability?: number;
  notes?: string;
}

// =================== DANGERS PRÉDÉFINIS ===================
const predefinedHazards: Hazard[] = [
  // ÉLECTRIQUES
  {
    id: 'elec_shock',
    category: 'electrical',
    description: 'Contact direct ou indirect avec parties sous tension',
    riskLevel: 'critical',
    controlMeasures: ['Consignation LOTO', 'VAT', 'EPI électrique'],
    photos: [],
    legislation: 'CSA Z462, RSST Art. 185'
  },
  {
    id: 'arc_flash',
    category: 'electrical', 
    description: 'Arc électrique lors de manœuvres',
    riskLevel: 'critical',
    controlMeasures: ['Vêtements résistants arc', 'Analyse arc', 'Distance sécurité'],
    photos: [],
    legislation: 'CSA Z462, NFPA 70E'
  },
  {
    id: 'electrical_burns',
    category: 'electrical',
    description: 'Brûlures par contact électrique',
    riskLevel: 'high',
    controlMeasures: ['Isolation électrique', 'Gants isolants', 'Formation'],
    photos: [],
    legislation: 'CSA Z462'
  },

  // MÉCANIQUES
  {
    id: 'moving_parts',
    category: 'mechanical',
    description: 'Pièces mobiles non protégées',
    riskLevel: 'high',
    controlMeasures: ['Protecteurs mécaniques', 'Consignation', 'Formation'],
    photos: [],
    legislation: 'RSST Art. 182-184'
  },
  {
    id: 'pressure_systems',
    category: 'mechanical',
    description: 'Systèmes sous pression',
    riskLevel: 'high',
    controlMeasures: ['Dépressurisation', 'Soupapes sécurité', 'Manomètres'],
    photos: [],
    legislation: 'CSA B51'
  },
  {
    id: 'lifting_equipment',
    category: 'mechanical',
    description: 'Équipements de levage',
    riskLevel: 'medium',
    controlMeasures: ['Inspection équipement', 'Signaleur', 'Zone sécurité'],
    photos: [],
    legislation: 'RSST Art. 347'
  },

  // PHYSIQUES
  {
    id: 'falls_height',
    category: 'physical',
    description: 'Chutes de hauteur (>3m)',
    riskLevel: 'critical',
    controlMeasures: ['Harnais sécurité', 'Garde-corps', 'Filets sécurité'],
    photos: [],
    legislation: 'RSST Art. 347, CSA Z259'
  },
  {
    id: 'struck_objects',
    category: 'physical',
    description: 'Objets qui tombent',
    riskLevel: 'high',
    controlMeasures: ['Casque protection', 'Périmètre sécurité', 'Filets'],
    photos: [],
    legislation: 'RSST Art. 338'
  },
  {
    id: 'cuts_lacerations',
    category: 'physical',
    description: 'Coupures par objets tranchants',
    riskLevel: 'medium',
    controlMeasures: ['Gants anti-coupure', 'Outils sécuritaires', 'Formation'],
    photos: [],
    legislation: 'CSA Z94.4'
  },

  // CHIMIQUES
  {
    id: 'toxic_vapors',
    category: 'chemical',
    description: 'Vapeurs toxiques',
    riskLevel: 'high',
    controlMeasures: ['Ventilation', 'Masque respiratoire', 'Détection gaz'],
    photos: [],
    legislation: 'RSST Art. 44'
  },
  {
    id: 'chemical_burns',
    category: 'chemical',
    description: 'Brûlures chimiques',
    riskLevel: 'medium',
    controlMeasures: ['Gants chimiques', 'Douche urgence', 'FDS'],
    photos: [],
    legislation: 'SIMDUT 2015'
  },

  // ERGONOMIQUES
  {
    id: 'manual_handling',
    category: 'ergonomic',
    description: 'Manutention manuelle',
    riskLevel: 'medium',
    controlMeasures: ['Techniques levage', 'Équipement aide', 'Rotation tâches'],
    photos: [],
    legislation: 'RSST Art. 166'
  },
  {
    id: 'repetitive_strain',
    category: 'ergonomic',
    description: 'Mouvements répétitifs',
    riskLevel: 'low',
    controlMeasures: ['Pauses régulières', 'Rotation postes', 'Étirements'],
    photos: [],
    legislation: 'Guide CNESST'
  },

  // ENVIRONNEMENTAUX
  {
    id: 'extreme_weather',
    category: 'environmental',
    description: 'Conditions météo extrêmes',
    riskLevel: 'medium',
    controlMeasures: ['Surveillance météo', 'Vêtements adaptés', 'Abris'],
    photos: [],
    legislation: 'Guide CNESST'
  },
  {
    id: 'noise_exposure',
    category: 'environmental',
    description: 'Exposition au bruit',
    riskLevel: 'medium',
    controlMeasures: ['Protection auditive', 'Mesure bruit', 'Rotation'],
    photos: [],
    legislation: 'RSST Art. 141-151'
  }
];

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Identification des Dangers',
    subtitle: 'Identifiez les dangers potentiels et évaluez les risques',
    searchPlaceholder: 'Rechercher un danger...',
    filterByCategory: 'Filtrer par catégorie',
    allCategories: 'Toutes catégories',
    addCustomHazard: 'Ajouter danger personnalisé',
    selectedHazards: 'Dangers identifiés',
    riskAssessment: 'Évaluation des risques',
    showMatrix: 'Afficher matrice',
    hideMatrix: 'Masquer matrice',
    categories: {
      electrical: 'Électrique',
      mechanical: 'Mécanique', 
      chemical: 'Chimique',
      physical: 'Physique',
      ergonomic: 'Ergonomique',
      environmental: 'Environnemental'
    },
    riskLevels: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique'
    },
    summary: {
      totalHazards: 'Dangers identifiés',
      highRisks: 'Risques élevés',
      averageRisk: 'Risque moyen',
      needsAttention: 'Attention requise'
    },
    validation: {
      atLeastOne: 'Au moins un danger doit être identifié',
      riskAssessment: 'Évaluation des risques requise',
      controlMeasures: 'Mesures de contrôle manquantes'
    }
  },
  en: {
    title: 'Hazard Identification',
    subtitle: 'Identify potential hazards and assess risks',
    searchPlaceholder: 'Search hazard...',
    filterByCategory: 'Filter by category',
    allCategories: 'All categories',
    addCustomHazard: 'Add custom hazard',
    selectedHazards: 'Identified Hazards',
    riskAssessment: 'Risk Assessment',
    showMatrix: 'Show matrix',
    hideMatrix: 'Hide matrix',
    categories: {
      electrical: 'Electrical',
      mechanical: 'Mechanical',
      chemical: 'Chemical', 
      physical: 'Physical',
      ergonomic: 'Ergonomic',
      environmental: 'Environmental'
    },
    riskLevels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    },
    summary: {
      totalHazards: 'Identified Hazards',
      highRisks: 'High Risks',
      averageRisk: 'Average Risk',
      needsAttention: 'Needs Attention'
    },
    validation: {
      atLeastOne: 'At least one hazard must be identified',
      riskAssessment: 'Risk assessment required',
      controlMeasures: 'Missing control measures'
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step3Hazards: React.FC<Step3HazardsProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMatrix, setShowMatrix] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // État local des dangers
  const [hazardsList, setHazardsList] = useState<Hazard[]>(
    formData.hazards?.list || predefinedHazards.map(h => ({ ...h, isSelected: false, severity: 3, probability: 3 }))
  );

  // Dangers sélectionnés
  const selectedHazards = hazardsList.filter(h => h.isSelected);

  // Filtrage des dangers
  const filteredHazards = hazardsList.filter(hazard => {
    const matchesSearch = hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hazard.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hazard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques
  const categories = Array.from(new Set(hazardsList.map(h => h.category)));

  // =================== CALCULS ===================
  const riskStats = useMemo(() => {
    const total = selectedHazards.length;
    const highRisks = selectedHazards.filter(h => 
      h.riskLevel === 'high' || h.riskLevel === 'critical'
    ).length;
    
    const averageRisk = total > 0 
      ? selectedHazards.reduce((sum, h) => {
          const riskScore = (h.severity || 3) * (h.probability || 3);
          return sum + riskScore;
        }, 0) / total
      : 0;

    const needsAttention = selectedHazards.filter(h => 
      h.controlMeasures.length === 0 || h.riskLevel === 'critical'
    ).length;

    return { total, highRisks, averageRisk: Math.round(averageRisk * 10) / 10, needsAttention };
  }, [selectedHazards]);

  // =================== HANDLERS ===================
  const handleHazardSelect = (hazardId: string) => {
    const updatedList = hazardsList.map(hazard => 
      hazard.id === hazardId 
        ? { ...hazard, isSelected: !hazard.isSelected }
        : hazard
    );
    setHazardsList(updatedList);
    updateFormData(updatedList);
  };

  const handleHazardUpdate = (hazardId: string, field: keyof Hazard, value: any) => {
    const updatedList = hazardsList.map(hazard => 
      hazard.id === hazardId 
        ? { ...hazard, [field]: value }
        : hazard
    );
    setHazardsList(updatedList);
    updateFormData(updatedList);
  };

  const updateFormData = (updatedList: Hazard[]) => {
    const hazardsData = {
      list: updatedList,
      selected: updatedList.filter(h => h.isSelected),
      stats: {
        total: updatedList.filter(h => h.isSelected).length,
        categories: categories.reduce((acc, cat) => {
          acc[cat] = updatedList.filter(h => h.isSelected && h.category === cat).length;
          return acc;
        }, {} as Record<string, number>)
      }
    };
    
    onDataChange('hazards', hazardsData);
  };

  const addCustomHazard = () => {
    const newHazard: Hazard = {
      id: `custom-${Date.now()}`,
      category: 'physical',
      description: 'Nouveau danger personnalisé',
      riskLevel: 'medium',
      controlMeasures: [],
      photos: [],
      legislation: 'À définir',
      isSelected: true,
      severity: 3,
      probability: 3
    };
    
    const updatedList = [...hazardsList, newHazard];
    setHazardsList(updatedList);
    updateFormData(updatedList);
    setShowAddCustom(false);
  };

  // Données pour la matrice de risques
  const matrixRisks = selectedHazards.map(h => ({
    id: h.id,
    name: h.description,
    severity: h.severity || 3,
    probability: h.probability || 3,
    category: h.category
  }));

  // =================== RENDU ===================
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Contrôles de filtrage */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par catégorie */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {t.categories[category as keyof typeof t.categories]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                showMatrix 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              {showMatrix ? t.hideMatrix : t.showMatrix}
            </button>
            
            <button
              onClick={() => setShowAddCustom(true)}
              className="flex items-center px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.addCustomHazard}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {selectedHazards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{riskStats.total}</div>
              <div className="text-sm text-blue-700">{t.summary.totalHazards}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-600">{riskStats.highRisks}</div>
              <div className="text-sm text-red-700">{t.summary.highRisks}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{riskStats.averageRisk}</div>
              <div className="text-sm text-purple-700">{t.summary.averageRisk}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-600">{riskStats.needsAttention}</div>
              <div className="text-sm text-orange-700">{t.summary.needsAttention}</div>
            </div>
          </div>
        )}
      </div>

      {/* Matrice de risques */}
      {showMatrix && selectedHazards.length > 0 && (
        <RiskMatrix
          risks={matrixRisks}
          onRiskClick={(risk) => {
            const hazard = hazardsList.find(h => h.id === risk.id);
            if (hazard) {
              // Focus sur le danger
              console.log('Focus sur danger:', hazard);
            }
          }}
          showLegend={true}
          showStats={true}
          language={language}
          title={t.riskAssessment}
        />
      )}

      {/* Liste des dangers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHazards.map(hazard => (
          <div key={hazard.id} className="relative">
            <HazardCard
              hazard={hazard}
              isSelected={hazard.isSelected}
              onSelect={handleHazardSelect}
              language={language}
              className="h-full"
            />
            
            {/* Évaluation de risque si sélectionné */}
            {hazard.isSelected && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Évaluation des risques</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gravité (1-5)
                    </label>
                    <select
                      value={hazard.severity || 3}
                      onChange={(e) => handleHazardUpdate(hazard.id, 'severity', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value={1}>1 - Négligeable</option>
                      <option value={2}>2 - Mineur</option>
                      <option value={3}>3 - Modéré</option>
                      <option value={4}>4 - Majeur</option>
                      <option value={5}>5 - Catastrophique</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Probabilité (1-5)
                    </label>
                    <select
                      value={hazard.probability || 3}
                      onChange={(e) => handleHazardUpdate(hazard.id, 'probability', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value={1}>1 - Très rare</option>
                      <option value={2}>2 - Peu probable</option>
                      <option value={3}>3 - Possible</option>
                      <option value={4}>4 - Probable</option>
                      <option value={5}>5 - Très probable</option>
                    </select>
                  </div>
                </div>
                
                {/* Score de risque */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Score de risque:</span>
                  <span className={`font-bold px-2 py-1 rounded ${
                    (hazard.severity || 3) * (hazard.probability || 3) >= 15 ? 'bg-red-100 text-red-800' :
                    (hazard.severity || 3) * (hazard.probability || 3) >= 10 ? 'bg-orange-100 text-orange-800' :
                    (hazard.severity || 3) * (hazard.probability || 3) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(hazard.severity || 3) * (hazard.probability || 3)}/25
                  </span>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes additionnelles
                  </label>
                  <textarea
                    value={hazard.notes || ''}
                    onChange={(e) => handleHazardUpdate(hazard.id, 'notes', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500"
                    rows={2}
                    placeholder="Notes sur ce danger..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredHazards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun danger trouvé avec ces critères.</p>
        </div>
      )}

      {/* Résumé des dangers sélectionnés */}
      {selectedHazards.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {t.selectedHazards} ({selectedHazards.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedHazards.map(hazard => (
              <div key={hazard.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{hazard.description}</h4>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    hazard.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    hazard.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    hazard.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {t.riskLevels[hazard.riskLevel]}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Catégorie:</span> {t.categories[hazard.category]}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Score:</span> {(hazard.severity || 3)} × {(hazard.probability || 3)} = {(hazard.severity || 3) * (hazard.probability || 3)}
                </div>
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Mesures:</span> {hazard.controlMeasures.length} mesure(s) de contrôle
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation */}
      {errors?.hazards && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erreurs de validation :</span>
          </div>
          <ul className="mt-2 text-sm text-red-700">
            {errors.hazards.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step3Hazards;
