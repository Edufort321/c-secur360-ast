"use client";

import React, { useState } from 'react';
import { Shield, Plus, Search, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import EquipmentCard from '@/components/shared/EquipmentCard';

// =================== INTERFACES ===================
interface Step2EquipmentProps {
  formData: any;
  onDataChange: (section: string, data: any) => void;
  language: 'fr' | 'en';
  tenant: string;
  errors?: any;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  required: boolean;
  available: boolean;
  verified: boolean;
  notes?: string;
  certification?: string;
  inspectionDate?: string;
  inspectedBy?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  cost?: number;
  supplier?: string;
}

// =================== ÉQUIPEMENTS PRÉDÉFINIS ===================
const defaultEquipment: Equipment[] = [
  {
    id: 'helmet-class-e',
    name: 'Casque classe E (20kV)',
    category: 'head',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA Z94.1',
    cost: 85,
    supplier: 'MSA Safety'
  },
  {
    id: 'safety-glasses',
    name: 'Lunettes de sécurité',
    category: 'eye',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA Z94.3',
    cost: 25,
    supplier: '3M'
  },
  {
    id: 'electrical-gloves',
    name: 'Gants isolants classe 2',
    category: 'electrical',
    required: false,
    available: false,
    verified: false,
    certification: 'ASTM D120',
    cost: 120,
    supplier: 'Salisbury'
  },
  {
    id: 'safety-boots',
    name: 'Bottes sécurité diélectriques',
    category: 'foot',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA Z195',
    cost: 180,
    supplier: 'Dakota'
  },
  {
    id: 'high-vis-vest',
    name: 'Veste haute visibilité',
    category: 'body',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA Z96',
    cost: 45,
    supplier: 'Forcefield'
  },
  {
    id: 'fall-harness',
    name: 'Harnais antichute',
    category: 'fall',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA Z259.10',
    cost: 150,
    supplier: 'Miller'
  },
  {
    id: 'gas-detector',
    name: 'Détecteur 4 gaz',
    category: 'detection',
    required: false,
    available: false,
    verified: false,
    certification: 'CSA C22.2',
    cost: 850,
    supplier: 'Honeywell'
  },
  {
    id: 'respirator-n95',
    name: 'Masque N95',
    category: 'respiratory',
    required: false,
    available: false,
    verified: false,
    certification: 'NIOSH N95',
    cost: 3,
    supplier: '3M'
  }
];

// =================== TRADUCTIONS ===================
const translations = {
  fr: {
    title: 'Équipements de Protection',
    subtitle: 'Sélectionnez les équipements requis et vérifiez leur disponibilité',
    searchPlaceholder: 'Rechercher un équipement...',
    filterByCategory: 'Filtrer par catégorie',
    allCategories: 'Toutes catégories',
    addCustomEquipment: 'Ajouter équipement personnalisé',
    selectedEquipment: 'Équipements sélectionnés',
    totalCost: 'Coût total estimé',
    inspectionStatus: 'Statut d\'inspection',
    equipmentSummary: 'Résumé des équipements',
    categories: {
      head: 'Protection tête',
      eye: 'Protection oculaire',
      respiratory: 'Protection respiratoire',
      hand: 'Protection mains',
      foot: 'Protection pieds',
      body: 'Protection corps',
      fall: 'Protection chute',
      electrical: 'Électrique',
      detection: 'Détection',
      other: 'Autre'
    },
    validation: {
      atLeastOne: 'Au moins un équipement doit être sélectionné',
      allVerified: 'Tous les équipements requis doivent être vérifiés',
      inspectionRequired: 'Inspection requise pour les équipements critiques'
    }
  },
  en: {
    title: 'Protection Equipment',
    subtitle: 'Select required equipment and verify availability',
    searchPlaceholder: 'Search equipment...',
    filterByCategory: 'Filter by category',
    allCategories: 'All categories',
    addCustomEquipment: 'Add custom equipment',
    selectedEquipment: 'Selected Equipment',
    totalCost: 'Total estimated cost',
    inspectionStatus: 'Inspection Status',
    equipmentSummary: 'Equipment Summary',
    categories: {
      head: 'Head Protection',
      eye: 'Eye Protection',
      respiratory: 'Respiratory Protection',
      hand: 'Hand Protection',
      foot: 'Foot Protection',
      body: 'Body Protection',
      fall: 'Fall Protection',
      electrical: 'Electrical',
      detection: 'Detection',
      other: 'Other'
    },
    validation: {
      atLeastOne: 'At least one equipment must be selected',
      allVerified: 'All required equipment must be verified',
      inspectionRequired: 'Inspection required for critical equipment'
    }
  }
};

// =================== COMPOSANT PRINCIPAL ===================
const Step2Equipment: React.FC<Step2EquipmentProps> = ({
  formData,
  onDataChange,
  language,
  tenant,
  errors
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // État local des équipements
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(
    formData.equipment?.list || defaultEquipment
  );

  // Équipements sélectionnés
  const selectedEquipment = equipmentList.filter(eq => eq.required);

  // Filtrage des équipements
  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques
  const categories = Array.from(new Set(equipmentList.map(eq => eq.category)));

  // =================== HANDLERS ===================
  const handleEquipmentSelect = (equipmentId: string) => {
    const updatedList = equipmentList.map(equipment => 
      equipment.id === equipmentId 
        ? { ...equipment, required: !equipment.required }
        : equipment
    );
    setEquipmentList(updatedList);
    updateFormData(updatedList);
  };

  const handleEquipmentUpdate = (equipmentId: string, field: keyof Equipment, value: any) => {
    const updatedList = equipmentList.map(equipment => 
      equipment.id === equipmentId 
        ? { ...equipment, [field]: value }
        : equipment
    );
    setEquipmentList(updatedList);
    updateFormData(updatedList);
  };

  const updateFormData = (updatedList: Equipment[]) => {
    const equipmentData = {
      list: updatedList,
      selected: updatedList.filter(eq => eq.required),
      totalCost: updatedList
        .filter(eq => eq.required)
        .reduce((sum, eq) => sum + (eq.cost || 0), 0),
      inspectionStatus: calculateInspectionStatus(updatedList.filter(eq => eq.required))
    };
    
    onDataChange('equipment', equipmentData);
  };

  const calculateInspectionStatus = (selectedEq: Equipment[]) => {
    const total = selectedEq.length;
    const verified = selectedEq.filter(eq => eq.verified).length;
    const available = selectedEq.filter(eq => eq.available).length;
    
    return {
      total,
      verified,
      available,
      verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
      availabilityRate: total > 0 ? Math.round((available / total) * 100) : 0
    };
  };

  const addCustomEquipment = () => {
    const newEquipment: Equipment = {
      id: `custom-${Date.now()}`,
      name: 'Nouvel équipement',
      category: 'other',
      required: true,
      available: false,
      verified: false
    };
    
    const updatedList = [...equipmentList, newEquipment];
    setEquipmentList(updatedList);
    updateFormData(updatedList);
    setShowAddCustom(false);
  };

  // =================== CALCULS ===================
  const totalCost = selectedEquipment.reduce((sum, eq) => sum + (eq.cost || 0), 0);
  const inspectionStatus = calculateInspectionStatus(selectedEquipment);

  // =================== RENDU ===================
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-green-600" />
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {t.categories[category as keyof typeof t.categories] || category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton ajouter équipement personnalisé */}
          <button
            onClick={() => setShowAddCustom(true)}
            className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addCustomEquipment}
          </button>
        </div>

        {/* Résumé */}
        {selectedEquipment.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">{t.equipmentSummary}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedEquipment.length}</div>
                <div className="text-blue-700">Équipements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{inspectionStatus.availabilityRate}%</div>
                <div className="text-green-700">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{inspectionStatus.verificationRate}%</div>
                <div className="text-purple-700">Vérifiés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">${totalCost}</div>
                <div className="text-orange-700">Coût total</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des équipements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map(equipment => (
          <EquipmentCard
            key={equipment.id}
            equipment={equipment}
            isSelected={equipment.required}
            onSelect={handleEquipmentSelect}
            language={language}
            showStatus={true}
            className="h-full"
          />
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun équipement trouvé avec ces critères.</p>
        </div>
      )}

      {/* Équipements sélectionnés */}
      {selectedEquipment.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {t.selectedEquipment} ({selectedEquipment.length})
          </h3>

          <div className="space-y-3">
            {selectedEquipment.map(equipment => (
              <div key={equipment.id} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{equipment.name}</h4>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={equipment.available}
                        onChange={(e) => handleEquipmentUpdate(equipment.id, 'available', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Disponible</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={equipment.verified}
                        onChange={(e) => handleEquipmentUpdate(equipment.id, 'verified', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Vérifié</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date d'inspection
                    </label>
                    <input
                      type="date"
                      value={equipment.inspectionDate || ''}
                      onChange={(e) => handleEquipmentUpdate(equipment.id, 'inspectionDate', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Inspecté par
                    </label>
                    <input
                      type="text"
                      value={equipment.inspectedBy || ''}
                      onChange={(e) => handleEquipmentUpdate(equipment.id, 'inspectedBy', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder="Nom de l'inspecteur"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      État
                    </label>
                    <select
                      value={equipment.condition || 'good'}
                      onChange={(e) => handleEquipmentUpdate(equipment.id, 'condition', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Bon</option>
                      <option value="fair">Acceptable</option>
                      <option value="poor">Mauvais</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={equipment.notes || ''}
                    onChange={(e) => handleEquipmentUpdate(equipment.id, 'notes', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Notes sur l'équipement..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation */}
      {errors?.equipment && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erreurs de validation :</span>
          </div>
          <ul className="mt-2 text-sm text-red-700">
            {errors.equipment.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Step2Equipment;
