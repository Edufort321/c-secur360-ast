"use client";

import React, { useState, useRef } from 'react';
import { 
  Shield, Plus, Search, Filter, CheckCircle, AlertTriangle, Camera, 
  HardHat, Eye, Wind, Hand, Zap, Wrench, Activity, Star, Clock,
  MapPin, User, FileText, Trash2, ArrowLeft, ArrowRight
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
  available: boolean;
  verified: boolean;
  notes?: string;
  certification?: string;
  inspectionDate?: string;
  inspectedBy?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  cost?: number;
  supplier?: string;
  photos?: EquipmentPhoto[];
  priority?: 'high' | 'medium' | 'low';
  mandatoryFor?: string[];
}

interface EquipmentPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category: 'inspection' | 'condition' | 'certification' | 'use';
}

// =================== ÉQUIPEMENTS PRÉDÉFINIS AMÉLIORÉS ===================
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
    supplier: 'MSA Safety',
    priority: 'high',
    mandatoryFor: ['electrical', 'construction'],
    photos: []
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
    supplier: '3M',
    priority: 'high',
    mandatoryFor: ['construction', 'mechanical'],
    photos: []
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
    supplier: 'Salisbury',
    priority: 'high',
    mandatoryFor: ['electrical'],
    photos: []
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
    supplier: 'Dakota',
    priority: 'high',
    mandatoryFor: ['electrical', 'construction'],
    photos: []
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
    supplier: 'Forcefield',
    priority: 'medium',
    mandatoryFor: ['construction'],
    photos: []
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
    supplier: 'Miller',
    priority: 'high',
    mandatoryFor: ['height_work'],
    photos: []
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
    supplier: 'Honeywell',
    priority: 'high',
    mandatoryFor: ['confined_space'],
    photos: []
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
    supplier: '3M',
    priority: 'medium',
    mandatoryFor: ['dust', 'chemical'],
    photos: []
  }
];

// =================== COMPOSANT PRINCIPAL ===================
const Step2Equipment: React.FC<Step2EquipmentProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // État local des équipements
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(
    formData.equipment?.list || defaultEquipment
  );

  // =================== GESTION PHOTOS ===================
  const handlePhotoCapture = async (equipmentId: string, category: string) => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.capture = 'environment';
        fileInputRef.current.multiple = true;
        fileInputRef.current.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) {
            files.forEach(file => processPhoto(file, equipmentId, category));
          }
        };
        fileInputRef.current.click();
      }
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  };

  const processPhoto = async (file: File, equipmentId: string, category: string) => {
    try {
      const photoUrl = URL.createObjectURL(file);
      const newPhoto: EquipmentPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: photoUrl,
        caption: `${getCategoryLabel(category)} - ${new Date().toLocaleString('fr-CA')}`,
        category: category as any,
        timestamp: new Date().toISOString()
      };

      const updatedList = equipmentList.map(equipment => 
        equipment.id === equipmentId 
          ? { ...equipment, photos: [...(equipment.photos || []), newPhoto] }
          : equipment
      );
      
      setEquipmentList(updatedList);
      updateFormData(updatedList);
      console.log('Photo ajoutée à l\'équipement:', equipmentId);
    } catch (error) {
      console.error('Erreur traitement photo:', error);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      'inspection': 'Inspection',
      'condition': 'État',
      'certification': 'Certification',
      'use': 'Utilisation'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const deletePhoto = (equipmentId: string, photoId: string) => {
    const updatedList = equipmentList.map(equipment => 
      equipment.id === equipmentId 
        ? { 
            ...equipment, 
            photos: (equipment.photos || []).filter(photo => photo.id !== photoId) 
          }
        : equipment
    );
    setEquipmentList(updatedList);
    updateFormData(updatedList);
  };

  // =================== CARROUSEL PHOTOS ===================
  const PhotoCarousel = ({ photos, equipmentId, onAddPhoto }: {
    photos: EquipmentPhoto[];
    equipmentId: string;
    onAddPhoto: () => void;
  }) => {
    const currentIndex = currentPhotoIndex[equipmentId] || 0;
    const totalSlides = photos.length + 1;

    const setCurrentIndex = (index: number) => {
      setCurrentPhotoIndex(prev => ({ ...prev, [equipmentId]: index }));
    };

    const nextSlide = () => setCurrentIndex((currentIndex + 1) % totalSlides);
    const prevSlide = () => setCurrentIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);

    return (
      <div className="photo-carousel">
        <div className="carousel-container">
          <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {photos.map((photo: EquipmentPhoto, index: number) => (
              <div key={photo.id} className="carousel-slide">
                <img src={photo.url} alt={photo.caption} />
                <div className="photo-info">
                  <div className="photo-caption">
                    <h4>{getCategoryLabel(photo.category)}</h4>
                    <p>{new Date(photo.timestamp).toLocaleString('fr-CA')}</p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="photo-action-btn delete" 
                      onClick={() => deletePhoto(equipmentId, photo.id)}
                      title="Supprimer cette photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="carousel-slide add-photo" onClick={onAddPhoto}>
              <div className="add-photo-content">
                <div className="add-photo-icon"><Camera size={24} /></div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Ajouter photo</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Documentez cet équipement</p>
              </div>
            </div>
          </div>
          {totalSlides > 1 && (
            <>
              <button className="carousel-nav prev" onClick={prevSlide}>
                <ArrowLeft size={20} />
              </button>
              <button className="carousel-nav next" onClick={nextSlide}>
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Équipements sélectionnés
  const selectedEquipment = equipmentList.filter(eq => eq.required);

  // Filtrage des équipements
  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques avec icônes
  const categoryIcons = {
    head: HardHat,
    eye: Eye,
    respiratory: Wind,
    hand: Hand,
    foot: Shield,
    body: Shield,
    fall: Activity,
    electrical: Zap,
    detection: Activity,
    other: Wrench
  };

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
      verified: false,
      priority: 'medium',
      photos: []
    };
    
    const updatedList = [...equipmentList, newEquipment];
    setEquipmentList(updatedList);
    updateFormData(updatedList);
    setShowAddCustom(false);
  };

  // =================== CALCULS ===================
  const totalCost = selectedEquipment.reduce((sum, eq) => sum + (eq.cost || 0), 0);
  const inspectionStatus = calculateInspectionStatus(selectedEquipment);

  return (
    <>
      {/* CSS Premium pour Step 2 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .step2-container { padding: 0; }
          .premium-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 32px; }
          .equipment-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 20px; padding: 20px; transition: all 0.3s ease; position: relative; overflow: hidden; }
          .equipment-card:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); }
          .equipment-card.selected { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
          .equipment-card.high-priority { border-left: 4px solid #ef4444; }
          .equipment-card.medium-priority { border-left: 4px solid #f59e0b; }
          .equipment-card.low-priority { border-left: 4px solid #6b7280; }
          .equipment-header { display: flex; align-items: center; justify-content: between; margin-bottom: 16px; }
          .equipment-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
          .equipment-title { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; flex: 1; }
          .equipment-select { width: 20px; height: 20px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 4px; background: rgba(15, 23, 42, 0.8); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .equipment-select.checked { background: #22c55e; border-color: #22c55e; color: white; }
          .equipment-select:hover { border-color: #3b82f6; transform: scale(1.05); }
          .equipment-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          .info-item { background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 8px; }
          .info-label { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
          .info-value { font-size: 13px; color: #e2e8f0; font-weight: 600; }
          .status-indicators { display: flex; gap: 8px; margin-bottom: 16px; }
          .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
          .status-available { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
          .status-verified { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
          .status-unavailable { background: rgba(239, 68, 68, 0.2); color: #f87171; }
          .photo-carousel { position: relative; margin-top: 16px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 12px; overflow: hidden; }
          .carousel-container { position: relative; width: 100%; height: 200px; overflow: hidden; }
          .carousel-track { display: flex; transition: transform 0.3s ease; height: 100%; }
          .carousel-slide { min-width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
          .carousel-slide img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }
          .carousel-slide.add-photo { background: rgba(59, 130, 246, 0.1); border: 2px dashed rgba(59, 130, 246, 0.3); cursor: pointer; transition: all 0.3s ease; flex-direction: column; gap: 12px; }
          .carousel-slide.add-photo:hover { background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.5); }
          .add-photo-content { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #60a5fa; }
          .add-photo-icon { width: 32px; height: 32px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
          .carousel-slide.add-photo:hover .add-photo-icon { transform: scale(1.1); background: rgba(59, 130, 246, 0.3); }
          .carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0, 0, 0, 0.7); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; z-index: 10; }
          .carousel-nav:hover { background: rgba(0, 0, 0, 0.9); transform: translateY(-50%) scale(1.1); }
          .carousel-nav.prev { left: 8px; }
          .carousel-nav.next { right: 8px; }
          .photo-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0, 0, 0, 0.8)); color: white; padding: 12px 8px 8px; display: flex; justify-content: space-between; align-items: flex-end; }
          .photo-caption { flex: 1; margin-right: 8px; }
          .photo-caption h4 { margin: 0 0 2px; font-size: 12px; font-weight: 600; }
          .photo-caption p { margin: 0; font-size: 10px; opacity: 0.8; }
          .photo-actions { display: flex; gap: 4px; }
          .photo-action-btn { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 4px; border-radius: 4px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; }
          .photo-action-btn:hover { background: rgba(255, 255, 255, 0.3); }
          .photo-action-btn.delete:hover { background: rgba(239, 68, 68, 0.8); border-color: #ef4444; }
          .equipment-controls { margin-top: 16px; }
          .control-group { margin-bottom: 12px; }
          .control-label { font-size: 12px; color: #94a3b8; font-weight: 500; margin-bottom: 4px; display: block; }
          .control-input { width: 100%; padding: 8px 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 8px; color: #ffffff; font-size: 13px; transition: all 0.3s ease; }
          .control-input:focus { outline: none; border-color: #3b82f6; background: rgba(15, 23, 42, 0.9); }
          .control-textarea { min-height: 60px; resize: vertical; font-family: inherit; }
          .control-checkbox { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
          .checkbox-input { width: 16px; height: 16px; border: 2px solid rgba(100, 116, 139, 0.5); border-radius: 3px; background: rgba(15, 23, 42, 0.8); cursor: pointer; }
          .checkbox-input:checked { background: #22c55e; border-color: #22c55e; }
          .checkbox-label { font-size: 13px; color: #e2e8f0; }
          .summary-card { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .summary-header { color: #22c55e; font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
          .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: 800; color: #22c55e; margin-bottom: 4px; }
          .summary-label { font-size: 12px; color: #16a34a; font-weight: 500; }
          .search-controls { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(100, 116, 139, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
          .search-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: end; }
          .search-input { position: relative; }
          .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
          .input-field { width: 100%; padding: 12px 12px 12px 40px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; transition: all 0.3s ease; }
          .input-field:focus { outline: none; border-color: #3b82f6; background: rgba(15, 23, 42, 0.9); }
          .select-field { padding: 12px; background: rgba(15, 23, 42, 0.8); border: 2px solid rgba(100, 116, 139, 0.3); border-radius: 12px; color: #ffffff; font-size: 14px; cursor: pointer; }
          .btn-primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: none; color: white; padding: 12px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); }
          .photo-buttons { display: flex; gap: 6px; margin-top: 12px; }
          .photo-btn { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; }
          .photo-btn:hover { background: rgba(59, 130, 246, 0.2); transform: translateY(-1px); }
          @media (max-width: 768px) {
            .premium-grid { grid-template-columns: 1fr; gap: 16px; }
            .search-grid { grid-template-columns: 1fr; gap: 12px; }
            .equipment-info { grid-template-columns: 1fr; }
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .photo-buttons { flex-direction: column; }
          }
        `
      }} />

      {/* Input caché pour capture photo */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple style={{ display: 'none' }} />

      <div className="step2-container">
        {/* En-tête avec design premium */}
        <div className="summary-card">
          <div className="summary-header">
            <Shield className="w-8 h-8" />
            🛡️ Équipements de Protection Individuelle
          </div>
          <p style={{ color: '#16a34a', margin: '0 0 16px', fontSize: '14px' }}>
            Sélectionnez et documentez les EPI requis pour ce travail selon l'analyse des risques
          </p>

          {/* Résumé si équipements sélectionnés */}
          {selectedEquipment.length > 0 && (
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{selectedEquipment.length}</div>
                <div className="summary-label">Équipements</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{inspectionStatus.availabilityRate}%</div>
                <div className="summary-label">Disponibles</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{inspectionStatus.verificationRate}%</div>
                <div className="summary-label">Vérifiés</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">${totalCost}</div>
                <div className="summary-label">Coût total</div>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles de recherche */}
        <div className="search-controls">
          <div className="search-grid">
            <div className="search-input">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un équipement..."
                className="input-field"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-field"
            >
              <option value="all">Toutes catégories</option>
              <option value="head">🪖 Protection tête</option>
              <option value="eye">👓 Protection oculaire</option>
              <option value="respiratory">😷 Protection respiratoire</option>
              <option value="hand">🧤 Protection mains</option>
              <option value="foot">👢 Protection pieds</option>
              <option value="body">🦺 Protection corps</option>
              <option value="fall">🪢 Protection chute</option>
              <option value="electrical">⚡ Électrique</option>
              <option value="detection">📡 Détection</option>
            </select>
            <button onClick={addCustomEquipment} className="btn-primary">
              <Plus size={18} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Grille des équipements */}
        <div className="premium-grid">
          {filteredEquipment.map(equipment => {
            const IconComponent = categoryIcons[equipment.category as keyof typeof categoryIcons] || Shield;
            const isSelected = equipment.required;
            
            return (
              <div 
                key={equipment.id} 
                className={`equipment-card ${isSelected ? 'selected' : ''} ${equipment.priority}-priority`}
              >
                {/* Header avec sélection */}
                <div className="equipment-header">
                  <div className="equipment-icon">
                    <IconComponent size={20} color="#60a5fa" />
                  </div>
                  <h3 className="equipment-title">{equipment.name}</h3>
                  <div 
                    className={`equipment-select ${isSelected ? 'checked' : ''}`}
                    onClick={() => handleEquipmentSelect(equipment.id)}
                  >
                    {isSelected && <CheckCircle size={16} />}
                  </div>
                </div>

                {/* Informations de base */}
                <div className="equipment-info">
                  <div className="info-item">
                    <div className="info-label">Certification</div>
                    <div className="info-value">{equipment.certification || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Coût</div>
                    <div className="info-value">${equipment.cost || 0}</div>
                  </div>
                </div>

                {/* Indicateurs de statut */}
                <div className="status-indicators">
                  <span className={`status-badge ${equipment.available ? 'status-available' : 'status-unavailable'}`}>
                    {equipment.available ? '✓ Disponible' : '✗ Indisponible'}
                  </span>
                  {equipment.verified && (
                    <span className="status-badge status-verified">✓ Vérifié</span>
                  )}
                  {equipment.priority === 'high' && (
                    <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                      ⚠️ Prioritaire
                    </span>
                  )}
                </div>

                {/* Photos de l'équipement */}
                {isSelected && (
                  <>
                    <div className="photo-buttons">
                      <button 
                        className="photo-btn"
                        onClick={() => handlePhotoCapture(equipment.id, 'inspection')}
                      >
                        <Camera size={12} />Inspection
                      </button>
                      <button 
                        className="photo-btn"
                        onClick={() => handlePhotoCapture(equipment.id, 'condition')}
                      >
                        <Eye size={12} />État
                      </button>
                      <button 
                        className="photo-btn"
                        onClick={() => handlePhotoCapture(equipment.id, 'certification')}
                      >
                        <FileText size={12} />Certification
                      </button>
                    </div>

                    {(equipment.photos && equipment.photos.length > 0) ? (
                      <PhotoCarousel 
                        photos={equipment.photos}
                        equipmentId={equipment.id}
                        onAddPhoto={() => handlePhotoCapture(equipment.id, 'inspection')}
                      />
                    ) : (
                      <div 
                        className="photo-carousel"
                        onClick={() => handlePhotoCapture(equipment.id, 'inspection')}
                        style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <div className="add-photo-content">
                          <div className="add-photo-icon"><Camera size={20} /></div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#60a5fa' }}>Photographier l'équipement</p>
                        </div>
                      </div>
                    )}

                    {/* Contrôles d'inspection */}
                    <div className="equipment-controls">
                      <div className="control-checkbox">
                        <input
                          type="checkbox"
                          checked={equipment.available}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'available', e.target.checked)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-label">Équipement disponible</span>
                      </div>
                      <div className="control-checkbox">
                        <input
                          type="checkbox"
                          checked={equipment.verified}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'verified', e.target.checked)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-label">Inspection vérifiée</span>
                      </div>

                      <div className="control-group">
                        <label className="control-label">Date d'inspection</label>
                        <input
                          type="date"
                          value={equipment.inspectionDate || ''}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'inspectionDate', e.target.value)}
                          className="control-input"
                        />
                      </div>

                      <div className="control-group">
                        <label className="control-label">Inspecté par</label>
                        <input
                          type="text"
                          value={equipment.inspectedBy || ''}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'inspectedBy', e.target.value)}
                          placeholder="Nom de l'inspecteur"
                          className="control-input"
                        />
                      </div>

                      <div className="control-group">
                        <label className="control-label">État de l'équipement</label>
                        <select
                          value={equipment.condition || 'good'}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'condition', e.target.value)}
                          className="control-input"
                        >
                          <option value="excellent">🟢 Excellent</option>
                          <option value="good">🟡 Bon</option>
                          <option value="fair">🟠 Acceptable</option>
                          <option value="poor">🔴 Mauvais</option>
                        </select>
                      </div>

                      <div className="control-group">
                        <label className="control-label">Notes d'inspection</label>
                        <textarea
                          value={equipment.notes || ''}
                          onChange={(e) => handleEquipmentUpdate(equipment.id, 'notes', e.target.value)}
                          placeholder="Observations, défauts, remarques..."
                          className="control-input control-textarea"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun résultat */}
        {filteredEquipment.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#94a3b8',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)'
          }}>
            <Shield size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
            <h3 style={{ color: '#e2e8f0', margin: '0 0 8px' }}>Aucun équipement trouvé</h3>
            <p style={{ margin: 0 }}>Modifiez vos critères de recherche ou ajoutez un équipement personnalisé</p>
          </div>
        )}

        {/* Validation */}
        {errors?.equipment && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '8px' }}>
              <AlertTriangle size={20} />
              <span style={{ fontWeight: '600' }}>Erreurs de validation :</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5' }}>
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
