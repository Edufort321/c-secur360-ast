"use client";

import React, { useState } from 'react';
import { 
  Shield, Search, CheckCircle, HardHat, Eye, Wind, Hand, 
  Zap, Activity, Star, AlertTriangle 
} from 'lucide-react';

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
  certification?: string;
  priority?: 'high' | 'medium' | 'low';
  icon: string;
}

// =================== LISTE COMPLÈTE DES EPI ===================
const equipmentList: Equipment[] = [
  // Protection tête
  { id: 'helmet-class-e', name: 'Casque classe E (20kV)', category: 'Tête', required: false, certification: 'CSA Z94.1', priority: 'high', icon: '🪖' },
  { id: 'helmet-standard', name: 'Casque de sécurité standard', category: 'Tête', required: false, certification: 'CSA Z94.1', priority: 'medium', icon: '⛑️' },
  { id: 'bump-cap', name: 'Casquette anti-heurt', category: 'Tête', required: false, certification: 'CSA Z94.1', priority: 'low', icon: '🧢' },

  // Protection oculaire
  { id: 'safety-glasses', name: 'Lunettes de sécurité', category: 'Yeux', required: false, certification: 'CSA Z94.3', priority: 'high', icon: '👓' },
  { id: 'safety-goggles', name: 'Lunettes-masques étanches', category: 'Yeux', required: false, certification: 'CSA Z94.3', priority: 'medium', icon: '🥽' },
  { id: 'face-shield', name: 'Écran facial', category: 'Yeux', required: false, certification: 'CSA Z94.3', priority: 'medium', icon: '🛡️' },
  { id: 'welding-mask', name: 'Masque de soudage', category: 'Yeux', required: false, certification: 'CSA Z94.3', priority: 'high', icon: '😎' },

  // Protection respiratoire
  { id: 'n95-mask', name: 'Masque N95', category: 'Respiratoire', required: false, certification: 'NIOSH N95', priority: 'medium', icon: '😷' },
  { id: 'p100-mask', name: 'Masque P100', category: 'Respiratoire', required: false, certification: 'NIOSH P100', priority: 'high', icon: '😷' },
  { id: 'half-face-respirator', name: 'Demi-masque respiratoire', category: 'Respiratoire', required: false, certification: 'NIOSH', priority: 'high', icon: '😷' },
  { id: 'full-face-respirator', name: 'Masque respiratoire complet', category: 'Respiratoire', required: false, certification: 'NIOSH', priority: 'high', icon: '🎭' },
  { id: 'scba', name: 'Appareil respiratoire autonome', category: 'Respiratoire', required: false, certification: 'NIOSH', priority: 'high', icon: '🎒' },

  // Protection mains
  { id: 'work-gloves', name: 'Gants de travail', category: 'Mains', required: false, certification: 'CSA Z195', priority: 'medium', icon: '🧤' },
  { id: 'electrical-gloves', name: 'Gants isolants classe 2', category: 'Mains', required: false, certification: 'ASTM D120', priority: 'high', icon: '🧤' },
  { id: 'cut-resistant-gloves', name: 'Gants anti-coupure', category: 'Mains', required: false, certification: 'ANSI A4', priority: 'high', icon: '🧤' },
  { id: 'chemical-gloves', name: 'Gants chimiques', category: 'Mains', required: false, certification: 'EN 374', priority: 'high', icon: '🧤' },
  { id: 'welding-gloves', name: 'Gants de soudage', category: 'Mains', required: false, certification: 'CSA Z195', priority: 'medium', icon: '🧤' },

  // Protection pieds
  { id: 'safety-boots', name: 'Bottes sécurité diélectriques', category: 'Pieds', required: false, certification: 'CSA Z195', priority: 'high', icon: '👢' },
  { id: 'steel-toe-boots', name: 'Bottes à cap d\'acier', category: 'Pieds', required: false, certification: 'CSA Z195', priority: 'medium', icon: '👢' },
  { id: 'chemical-boots', name: 'Bottes chimiques', category: 'Pieds', required: false, certification: 'CSA Z195', priority: 'medium', icon: '👢' },
  { id: 'slip-resistant-shoes', name: 'Chaussures antidérapantes', category: 'Pieds', required: false, certification: 'CSA Z195', priority: 'low', icon: '👟' },

  // Protection corps
  { id: 'high-vis-vest', name: 'Veste haute visibilité', category: 'Corps', required: false, certification: 'CSA Z96', priority: 'medium', icon: '🦺' },
  { id: 'arc-flash-suit', name: 'Costume arc électrique', category: 'Corps', required: false, certification: 'NFPA 70E', priority: 'high', icon: '🦺' },
  { id: 'chemical-suit', name: 'Combinaison chimique', category: 'Corps', required: false, certification: 'EN 14325', priority: 'high', icon: '🦺' },
  { id: 'coveralls', name: 'Salopette de travail', category: 'Corps', required: false, certification: 'CSA', priority: 'low', icon: '👔' },
  { id: 'lab-coat', name: 'Sarrau de laboratoire', category: 'Corps', required: false, certification: 'NFPA', priority: 'medium', icon: '🥼' },

  // Protection chute
  { id: 'fall-harness', name: 'Harnais antichute', category: 'Chute', required: false, certification: 'CSA Z259.10', priority: 'high', icon: '🪢' },
  { id: 'safety-lanyard', name: 'Longe de sécurité', category: 'Chute', required: false, certification: 'CSA Z259.11', priority: 'high', icon: '🔗' },
  { id: 'self-retracting-lifeline', name: 'Antichute à rappel automatique', category: 'Chute', required: false, certification: 'CSA Z259.2.2', priority: 'high', icon: '⚙️' },
  { id: 'positioning-belt', name: 'Ceinture de positionnement', category: 'Chute', required: false, certification: 'CSA Z259.1', priority: 'medium', icon: '🔗' },

  // Détection et mesure
  { id: 'gas-detector-4', name: 'Détecteur 4 gaz', category: 'Détection', required: false, certification: 'CSA C22.2', priority: 'high', icon: '📡' },
  { id: 'radiation-detector', name: 'Détecteur de radiation', category: 'Détection', required: false, certification: 'IEC 61526', priority: 'high', icon: '☢️' },
  { id: 'noise-dosimeter', name: 'Dosimètre de bruit', category: 'Détection', required: false, certification: 'IEC 61252', priority: 'medium', icon: '🔊' },
  { id: 'vibration-meter', name: 'Vibromètre', category: 'Détection', required: false, certification: 'ISO 8041', priority: 'medium', icon: '📳' },

  // Protection auditive
  { id: 'ear-plugs', name: 'Bouchons d\'oreilles', category: 'Auditive', required: false, certification: 'CSA Z94.2', priority: 'medium', icon: '🔇' },
  { id: 'ear-muffs', name: 'Casque antibruit', category: 'Auditive', required: false, certification: 'CSA Z94.2', priority: 'medium', icon: '🎧' },
  { id: 'communication-headset', name: 'Casque de communication', category: 'Auditive', required: false, certification: 'CSA Z94.2', priority: 'low', icon: '🎧' },

  // Éclairage et signalisation
  { id: 'flashlight', name: 'Lampe de poche', category: 'Éclairage', required: false, certification: 'Ex ia', priority: 'medium', icon: '🔦' },
  { id: 'headlamp', name: 'Lampe frontale', category: 'Éclairage', required: false, certification: 'Ex ia', priority: 'medium', icon: '💡' },
  { id: 'emergency-beacon', name: 'Balise d\'urgence', category: 'Éclairage', required: false, certification: 'Transport Canada', priority: 'low', icon: '🚨' }
];

const Step2Equipment: React.FC<Step2EquipmentProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [equipment, setEquipment] = useState<Equipment[]>(
    formData.equipment?.list || equipmentList
  );

  // Filtrage des équipements
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques
  const categories = Array.from(new Set(equipment.map(eq => eq.category))).sort();

  // Équipements sélectionnés
  const selectedEquipment = equipment.filter(eq => eq.required);

  // =================== HANDLERS ===================
  const handleEquipmentToggle = (equipmentId: string) => {
    const updatedEquipment = equipment.map(item => 
      item.id === equipmentId 
        ? { ...item, required: !item.required }
        : item
    );
    
    setEquipment(updatedEquipment);
    updateFormData(updatedEquipment);
  };

  const updateFormData = (updatedEquipment: Equipment[]) => {
    const selectedList = updatedEquipment.filter(eq => eq.required);
    
    const equipmentData = {
      list: updatedEquipment,
      selected: selectedList,
      totalSelected: selectedList.length,
      highPriority: selectedList.filter(eq => eq.priority === 'high').length,
      categories: Array.from(new Set(selectedList.map(eq => eq.category)))
    };
    
    onDataChange('equipment', equipmentData);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high': return '🔴 Critique';
      case 'medium': return '🟡 Important';
      case 'low': return '🟢 Standard';
      default: return '⚪ Normal';
    }
  };

  return (
    <>
      {/* CSS pour le design simplifié */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .equipment-simple-container { padding: 0; }
          .summary-header { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .summary-title { color: #22c55e; font-size: 18px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
          .stat-item { text-align: center; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 8px; }
          .stat-value { font-size: 20px; font-weight: 800; color: #22c55e; margin-bottom: 4px; }
          .stat-label { font-size: 12px; color: #16a34a; font-weight: 500; }
          .search-section { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; }
          .search-input-wrapper { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; z-index: 10; }
          .search-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .search-field:focus { outline: none; border-color: #3b82f6; background: rgba(15, 23, 42, 0.9); }
          .category-select { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
          .category-select:focus { outline: none; border-color: #3b82f6; }
          .equipment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
          .equipment-item { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; padding: 16px; transition: all 0.3s ease; cursor: pointer; position: relative; }
          .equipment-item:hover { transform: translateY(-2px); border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1); }
          .equipment-item.selected { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
          .equipment-item.high-priority::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #ef4444; border-radius: 12px 0 0 12px; }
          .equipment-item.medium-priority::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #f59e0b; border-radius: 12px 0 0 12px; }
          .equipment-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
          .equipment-icon { font-size: 24px; width: 32px; text-align: center; }
          .equipment-content { flex: 1; }
          .equipment-name { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
          .equipment-category { color: #94a3b8; font-size: 12px; font-weight: 500; }
          .equipment-checkbox { width: 20px; height: 20px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 4px; background: rgba(15, 23, 42, 0.8); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .equipment-checkbox.checked { background: #22c55e; border-color: #22c55e; color: white; }
          .equipment-details { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .equipment-certification { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
          .equipment-priority { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
          .no-results { text-align: center; padding: 60px 20px; color: #94a3b8; background: rgba(30, 41, 59, 0.6); border-radius: 16px; border: 1px solid rgba(100, 116, 139, 0.3); }
          .error-section { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-top: 24px; }
          .error-header { display: flex; align-items: center; gap: 8px; color: #f87171; margin-bottom: 8px; font-weight: 600; }
          .error-list { margin: 0; padding-left: 20px; color: #fca5a5; }
          @media (max-width: 768px) {
            .equipment-grid { grid-template-columns: 1fr; gap: 12px; }
            .search-grid { grid-template-columns: 1fr; gap: 8px; }
            .summary-stats { grid-template-columns: repeat(2, 1fr); }
            .equipment-details { flex-direction: column; align-items: flex-start; gap: 8px; }
          }
        `
      }} />

      <div className="equipment-simple-container">
        {/* En-tête avec résumé */}
        <div className="summary-header">
          <div className="summary-title">
            <Shield size={24} />
            🛡️ Équipements de Protection Individuelle
          </div>
          <p style={{ color: '#16a34a', margin: '0 0 8px', fontSize: '14px' }}>
            Sélectionnez tous les EPI requis pour ce travail en cochant les cases
          </p>
          
          {selectedEquipment.length > 0 && (
            <div className="summary-stats">
              <div className="stat-item">
                <div className="stat-value">{selectedEquipment.length}</div>
                <div className="stat-label">Sélectionnés</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{selectedEquipment.filter(eq => eq.priority === 'high').length}</div>
                <div className="stat-label">Critiques</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{Array.from(new Set(selectedEquipment.map(eq => eq.category))).length}</div>
                <div className="stat-label">Catégories</div>
              </div>
            </div>
          )}
        </div>

        {/* Section de recherche */}
        <div className="search-section">
          <div className="search-grid">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un équipement..."
                className="search-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Toutes catégories ({equipment.length})</option>
              {categories.map(category => {
                const count = equipment.filter(eq => eq.category === category).length;
                return (
                  <option key={category} value={category}>
                    {category} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Grille des équipements */}
        <div className="equipment-grid">
          {filteredEquipment.map(item => {
            const isSelected = item.required;
            
            return (
              <div 
                key={item.id} 
                className={`equipment-item ${isSelected ? 'selected' : ''} ${item.priority}-priority`}
                onClick={() => handleEquipmentToggle(item.id)}
              >
                <div className="equipment-header">
                  <div className="equipment-icon">{item.icon}</div>
                  <div className="equipment-content">
                    <h3 className="equipment-name">{item.name}</h3>
                    <div className="equipment-category">{item.category}</div>
                  </div>
                  <div className={`equipment-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle size={16} />}
                  </div>
                </div>
                
                <div className="equipment-details">
                  <div className="equipment-certification">{item.certification}</div>
                  <div 
                    className="equipment-priority"
                    style={{ 
                      background: `${getPriorityColor(item.priority)}20`,
                      color: getPriorityColor(item.priority)
                    }}
                  >
                    {getPriorityLabel(item.priority)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredEquipment.length === 0 && (
          <div className="no-results">
            <Shield size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun équipement trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche pour voir plus d'équipements</p>
          </div>
        )}

        {/* Validation d'erreurs */}
        {errors?.equipment && (
          <div className="error-section">
            <div className="error-header">
              <AlertTriangle size={20} />
              Erreurs de validation :
            </div>
            <ul className="error-list">
              {errors.equipment.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default Step2Equipment;
