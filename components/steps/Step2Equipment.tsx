"use client";

import React, { useState } from 'react';
import { 
  Shield, Search, CheckCircle, HardHat, Eye, Wind, Hand, 
  Zap, Activity, Star, AlertTriangle 
} from 'lucide-react';
import LocationTabsContainer from '../shared/LocationTabsContainer';

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

// =================== SYSTÈME DE TRADUCTIONS COMPLET ===================
const translations = {
  fr: {
    // En-tête
    title: "🛡️ Équipements de Protection",
    subtitle: "Sélectionnez tous les EPI requis pour cette tâche",
    
    // Statistiques
    selected: "Sélectionnés",
    critical: "Critiques",
    categories: "Catégories",
    
    // Recherche
    searchPlaceholder: "Rechercher un équipement...",
    allCategories: "Toutes catégories",
    
    // Priorités
    priorities: {
      high: "🔴 Critique",
      medium: "🟡 Important",
      low: "🟢 Standard",
      default: "⚪ Normal"
    },
    
    // Messages
    noResults: "Aucun équipement trouvé",
    noResultsDescription: "Modifiez vos critères de recherche pour voir plus d'équipements",
    validationErrors: "Erreurs de validation :",
    debugMessage: "équipements chargés,",
    debugDisplayed: "affichés",
    
    // Catégories
    categoryNames: {
      "Tête": "Tête",
      "Yeux": "Yeux", 
      "Respiratoire": "Respiratoire",
      "Mains": "Mains",
      "Pieds": "Pieds",
      "Corps": "Corps",
      "Chute": "Chute",
      "Détection": "Détection",
      "Auditive": "Auditive",
      "Éclairage": "Éclairage"
    },
    
    // Équipements - Protection tête
    equipment: {
      "helmet-class-e": "Casque classe E (20kV)",
      "helmet-standard": "Casque de sécurité standard",
      "bump-cap": "Casquette anti-heurt",
      
      // Protection oculaire
      "safety-glasses": "Lunettes de sécurité",
      "safety-goggles": "Lunettes-masques étanches",
      "face-shield": "Écran facial",
      "welding-mask": "Masque de soudage",
      
      // Protection respiratoire
      "n95-mask": "Masque N95",
      "p100-mask": "Masque P100",
      "half-face-respirator": "Demi-masque respiratoire",
      "full-face-respirator": "Masque respiratoire complet",
      "scba": "Appareil respiratoire autonome",
      
      // Protection mains
      "work-gloves": "Gants de travail",
      "electrical-gloves": "Gants isolants classe 2",
      "cut-resistant-gloves": "Gants anti-coupure",
      "chemical-gloves": "Gants chimiques",
      "welding-gloves": "Gants de soudage",
      
      // Protection pieds
      "safety-boots": "Bottes sécurité diélectriques",
      "steel-toe-boots": "Bottes à cap d'acier",
      "chemical-boots": "Bottes chimiques",
      "slip-resistant-shoes": "Chaussures antidérapantes",
      
      // Protection corps
      "high-vis-vest": "Veste haute visibilité",
      "arc-flash-suit": "Costume arc électrique",
      "chemical-suit": "Combinaison chimique",
      "coveralls": "Salopette de travail",
      "lab-coat": "Sarrau de laboratoire",
      
      // Protection chute
      "fall-harness": "Harnais antichute",
      "safety-lanyard": "Longe de sécurité",
      "self-retracting-lifeline": "Antichute à rappel automatique",
      "positioning-belt": "Ceinture de positionnement",
      
      // Détection et mesure
      "gas-detector-4": "Détecteur 4 gaz",
      "radiation-detector": "Détecteur de radiation",
      "noise-dosimeter": "Dosimètre de bruit",
      "vibration-meter": "Vibromètre",
      
      // Protection auditive
      "ear-plugs": "Bouchons d'oreilles",
      "ear-muffs": "Casque antibruit",
      "communication-headset": "Casque de communication",
      
      // Éclairage et signalisation
      "flashlight": "Lampe de poche",
      "headlamp": "Lampe frontale",
      "emergency-beacon": "Balise d'urgence"
    },
    
  },
  
  en: {
    // Header
    title: "🛡️ Personal Protective Equipment",
    subtitle: "Select all PPE required for this task",
    
    // Statistics
    selected: "Selected",
    critical: "Critical",
    categories: "Categories",
    
    // Search
    searchPlaceholder: "Search for equipment...",
    allCategories: "All categories",
    
    // Priorities
    priorities: {
      high: "🔴 Critical",
      medium: "🟡 Important", 
      low: "🟢 Standard",
      default: "⚪ Normal"
    },
    
    // Messages
    noResults: "No equipment found",
    noResultsDescription: "Modify your search criteria to see more equipment",
    validationErrors: "Validation errors:",
    debugMessage: "equipment loaded,",
    debugDisplayed: "displayed",
    
    // Categories
    categoryNames: {
      "Tête": "Head",
      "Yeux": "Eyes",
      "Respiratoire": "Respiratory", 
      "Mains": "Hands",
      "Pieds": "Feet",
      "Corps": "Body",
      "Chute": "Fall",
      "Détection": "Detection",
      "Auditive": "Hearing",
      "Éclairage": "Lighting"
    },
    
    // Equipment - Head protection
    equipment: {
      "helmet-class-e": "Class E helmet (20kV)",
      "helmet-standard": "Standard safety helmet",
      "bump-cap": "Bump cap",
      
      // Eye protection
      "safety-glasses": "Safety glasses",
      "safety-goggles": "Safety goggles",
      "face-shield": "Face shield",
      "welding-mask": "Welding mask",
      
      // Respiratory protection
      "n95-mask": "N95 mask",
      "p100-mask": "P100 mask",
      "half-face-respirator": "Half-face respirator",
      "full-face-respirator": "Full-face respirator",
      "scba": "Self-contained breathing apparatus",
      
      // Hand protection
      "work-gloves": "Work gloves",
      "electrical-gloves": "Class 2 insulating gloves",
      "cut-resistant-gloves": "Cut-resistant gloves",
      "chemical-gloves": "Chemical gloves",
      "welding-gloves": "Welding gloves",
      
      // Foot protection
      "safety-boots": "Dielectric safety boots",
      "steel-toe-boots": "Steel toe boots",
      "chemical-boots": "Chemical boots",
      "slip-resistant-shoes": "Slip-resistant shoes",
      
      // Body protection
      "high-vis-vest": "High-visibility vest",
      "arc-flash-suit": "Arc flash suit",
      "chemical-suit": "Chemical suit",
      "coveralls": "Work coveralls",
      "lab-coat": "Lab coat",
      
      // Fall protection
      "fall-harness": "Fall arrest harness",
      "safety-lanyard": "Safety lanyard",
      "self-retracting-lifeline": "Self-retracting lifeline",
      "positioning-belt": "Positioning belt",
      
      // Detection and measurement
      "gas-detector-4": "4-gas detector",
      "radiation-detector": "Radiation detector",
      "noise-dosimeter": "Noise dosimeter",
      "vibration-meter": "Vibration meter",
      
      // Hearing protection
      "ear-plugs": "Ear plugs",
      "ear-muffs": "Ear muffs",
      "communication-headset": "Communication headset",
      
      // Lighting and signaling
      "flashlight": "Flashlight",
      "headlamp": "Headlamp",
      "emergency-beacon": "Emergency beacon"
    },
    
  }
};

// =================== FONCTION POUR GÉNÉRER LA LISTE D'ÉQUIPEMENTS TRADUITE ===================
const getEquipmentList = (language: 'fr' | 'en'): Equipment[] => {
  const t = translations[language];
  
  return [
    // Protection tête
    { 
      id: 'helmet-class-e', 
      name: t.equipment['helmet-class-e'], 
      category: t.categoryNames['Tête'], 
      required: false, 
      certification: 'CSA Z94.1', 
      priority: 'high', 
      icon: '🪖' 
    },
    { 
      id: 'helmet-standard', 
      name: t.equipment['helmet-standard'], 
      category: t.categoryNames['Tête'], 
      required: false, 
      certification: 'CSA Z94.1', 
      priority: 'medium', 
      icon: '⛑️' 
    },
    { 
      id: 'bump-cap', 
      name: t.equipment['bump-cap'], 
      category: t.categoryNames['Tête'], 
      required: false, 
      certification: 'CSA Z94.1', 
      priority: 'low', 
      icon: '🧢' 
    },

    // Protection oculaire
    { 
      id: 'safety-glasses', 
      name: t.equipment['safety-glasses'], 
      category: t.categoryNames['Yeux'], 
      required: false, 
      certification: 'CSA Z94.3', 
      priority: 'high', 
      icon: '👓' 
    },
    { 
      id: 'safety-goggles', 
      name: t.equipment['safety-goggles'], 
      category: t.categoryNames['Yeux'], 
      required: false, 
      certification: 'CSA Z94.3', 
      priority: 'medium', 
      icon: '🥽' 
    },
    { 
      id: 'face-shield', 
      name: t.equipment['face-shield'], 
      category: t.categoryNames['Yeux'], 
      required: false, 
      certification: 'CSA Z94.3', 
      priority: 'medium', 
      icon: '🛡️' 
    },
    { 
      id: 'welding-mask', 
      name: t.equipment['welding-mask'], 
      category: t.categoryNames['Yeux'], 
      required: false, 
      certification: 'CSA Z94.3', 
      priority: 'high', 
      icon: '😎' 
    },

    // Protection respiratoire
    { 
      id: 'n95-mask', 
      name: t.equipment['n95-mask'], 
      category: t.categoryNames['Respiratoire'], 
      required: false, 
      certification: 'NIOSH N95', 
      priority: 'medium', 
      icon: '😷' 
    },
    { 
      id: 'p100-mask', 
      name: t.equipment['p100-mask'], 
      category: t.categoryNames['Respiratoire'], 
      required: false, 
      certification: 'NIOSH P100', 
      priority: 'high', 
      icon: '😷' 
    },
    { 
      id: 'half-face-respirator', 
      name: t.equipment['half-face-respirator'], 
      category: t.categoryNames['Respiratoire'], 
      required: false, 
      certification: 'NIOSH', 
      priority: 'high', 
      icon: '😷' 
    },
    { 
      id: 'full-face-respirator', 
      name: t.equipment['full-face-respirator'], 
      category: t.categoryNames['Respiratoire'], 
      required: false, 
      certification: 'NIOSH', 
      priority: 'high', 
      icon: '🎭' 
    },
    { 
      id: 'scba', 
      name: t.equipment['scba'], 
      category: t.categoryNames['Respiratoire'], 
      required: false, 
      certification: 'NIOSH', 
      priority: 'high', 
      icon: '🎒' 
    },

    // Protection mains
    { 
      id: 'work-gloves', 
      name: t.equipment['work-gloves'], 
      category: t.categoryNames['Mains'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'medium', 
      icon: '🧤' 
    },
    { 
      id: 'electrical-gloves', 
      name: t.equipment['electrical-gloves'], 
      category: t.categoryNames['Mains'], 
      required: false, 
      certification: 'ASTM D120', 
      priority: 'high', 
      icon: '🧤' 
    },
    { 
      id: 'cut-resistant-gloves', 
      name: t.equipment['cut-resistant-gloves'], 
      category: t.categoryNames['Mains'], 
      required: false, 
      certification: 'ANSI A4', 
      priority: 'high', 
      icon: '🧤' 
    },
    { 
      id: 'chemical-gloves', 
      name: t.equipment['chemical-gloves'], 
      category: t.categoryNames['Mains'], 
      required: false, 
      certification: 'EN 374', 
      priority: 'high', 
      icon: '🧤' 
    },
    { 
      id: 'welding-gloves', 
      name: t.equipment['welding-gloves'], 
      category: t.categoryNames['Mains'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'medium', 
      icon: '🧤' 
    },

    // Protection pieds
    { 
      id: 'safety-boots', 
      name: t.equipment['safety-boots'], 
      category: t.categoryNames['Pieds'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'high', 
      icon: '👢' 
    },
    { 
      id: 'steel-toe-boots', 
      name: t.equipment['steel-toe-boots'], 
      category: t.categoryNames['Pieds'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'medium', 
      icon: '👢' 
    },
    { 
      id: 'chemical-boots', 
      name: t.equipment['chemical-boots'], 
      category: t.categoryNames['Pieds'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'medium', 
      icon: '👢' 
    },
    { 
      id: 'slip-resistant-shoes', 
      name: t.equipment['slip-resistant-shoes'], 
      category: t.categoryNames['Pieds'], 
      required: false, 
      certification: 'CSA Z195', 
      priority: 'low', 
      icon: '👟' 
    },

    // Protection corps
    { 
      id: 'high-vis-vest', 
      name: t.equipment['high-vis-vest'], 
      category: t.categoryNames['Corps'], 
      required: false, 
      certification: 'CSA Z96', 
      priority: 'medium', 
      icon: '🦺' 
    },
    { 
      id: 'arc-flash-suit', 
      name: t.equipment['arc-flash-suit'], 
      category: t.categoryNames['Corps'], 
      required: false, 
      certification: 'NFPA 70E', 
      priority: 'high', 
      icon: '🦺' 
    },
    { 
      id: 'chemical-suit', 
      name: t.equipment['chemical-suit'], 
      category: t.categoryNames['Corps'], 
      required: false, 
      certification: 'EN 14325', 
      priority: 'high', 
      icon: '🦺' 
    },
    { 
      id: 'coveralls', 
      name: t.equipment['coveralls'], 
      category: t.categoryNames['Corps'], 
      required: false, 
      certification: 'CSA', 
      priority: 'low', 
      icon: '👔' 
    },
    { 
      id: 'lab-coat', 
      name: t.equipment['lab-coat'], 
      category: t.categoryNames['Corps'], 
      required: false, 
      certification: 'NFPA', 
      priority: 'medium', 
      icon: '🥼' 
    },

    // Protection chute
    { 
      id: 'fall-harness', 
      name: t.equipment['fall-harness'], 
      category: t.categoryNames['Chute'], 
      required: false, 
      certification: 'CSA Z259.10', 
      priority: 'high', 
      icon: '🪢' 
    },
    { 
      id: 'safety-lanyard', 
      name: t.equipment['safety-lanyard'], 
      category: t.categoryNames['Chute'], 
      required: false, 
      certification: 'CSA Z259.11', 
      priority: 'high', 
      icon: '🔗' 
    },
    { 
      id: 'self-retracting-lifeline', 
      name: t.equipment['self-retracting-lifeline'], 
      category: t.categoryNames['Chute'], 
      required: false, 
      certification: 'CSA Z259.2.2', 
      priority: 'high', 
      icon: '⚙️' 
    },
    { 
      id: 'positioning-belt', 
      name: t.equipment['positioning-belt'], 
      category: t.categoryNames['Chute'], 
      required: false, 
      certification: 'CSA Z259.1', 
      priority: 'medium', 
      icon: '🔗' 
    },

    // Détection et mesure
    { 
      id: 'gas-detector-4', 
      name: t.equipment['gas-detector-4'], 
      category: t.categoryNames['Détection'], 
      required: false, 
      certification: 'CSA C22.2', 
      priority: 'high', 
      icon: '📡' 
    },
    { 
      id: 'radiation-detector', 
      name: t.equipment['radiation-detector'], 
      category: t.categoryNames['Détection'], 
      required: false, 
      certification: 'IEC 61526', 
      priority: 'high', 
      icon: '☢️' 
    },
    { 
      id: 'noise-dosimeter', 
      name: t.equipment['noise-dosimeter'], 
      category: t.categoryNames['Détection'], 
      required: false, 
      certification: 'IEC 61252', 
      priority: 'medium', 
      icon: '🔊' 
    },
    { 
      id: 'vibration-meter', 
      name: t.equipment['vibration-meter'], 
      category: t.categoryNames['Détection'], 
      required: false, 
      certification: 'ISO 8041', 
      priority: 'medium', 
      icon: '📳' 
    },

    // Protection auditive
    { 
      id: 'ear-plugs', 
      name: t.equipment['ear-plugs'], 
      category: t.categoryNames['Auditive'], 
      required: false, 
      certification: 'CSA Z94.2', 
      priority: 'medium', 
      icon: '🔇' 
    },
    { 
      id: 'ear-muffs', 
      name: t.equipment['ear-muffs'], 
      category: t.categoryNames['Auditive'], 
      required: false, 
      certification: 'CSA Z94.2', 
      priority: 'medium', 
      icon: '🎧' 
    },
    { 
      id: 'communication-headset', 
      name: t.equipment['communication-headset'], 
      category: t.categoryNames['Auditive'], 
      required: false, 
      certification: 'CSA Z94.2', 
      priority: 'low', 
      icon: '🎧' 
    },

    // Éclairage et signalisation
    { 
      id: 'flashlight', 
      name: t.equipment['flashlight'], 
      category: t.categoryNames['Éclairage'], 
      required: false, 
      certification: 'Ex ia', 
      priority: 'medium', 
      icon: '🔦' 
    },
    { 
      id: 'headlamp', 
      name: t.equipment['headlamp'], 
      category: t.categoryNames['Éclairage'], 
      required: false, 
      certification: 'Ex ia', 
      priority: 'medium', 
      icon: '💡' 
    },
    { 
      id: 'emergency-beacon', 
      name: t.equipment['emergency-beacon'], 
      category: t.categoryNames['Éclairage'], 
      required: false, 
      certification: 'Transport Canada', 
      priority: 'low', 
      icon: '🚨' 
    }
  ];
};
const Step2Equipment: React.FC<Step2EquipmentProps> = ({
  formData,
  onDataChange,
  language = 'fr',
  tenant,
  errors
}) => {
  // =================== TRADUCTIONS ET CONFIGURATION ===================
  const t = translations[language];
  
  // =================== ÉTATS ===================
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  
  // Initialiser avec la liste complète des équipements traduits
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    if (formData.equipment?.list && formData.equipment.list.length > 0) {
      // Si nous avons déjà des équipements sauvegardés, les utiliser mais mettre à jour les traductions
      const savedEquipment = formData.equipment.list;
      const translatedEquipment = getEquipmentList(language);
      
      // Fusionner les données sauvegardées avec les nouvelles traductions
      return translatedEquipment.map(translatedItem => {
        const savedItem = savedEquipment.find((saved: Equipment) => saved.id === translatedItem.id);
        return savedItem ? { ...translatedItem, required: savedItem.required } : translatedItem;
      });
    }
    return getEquipmentList(language);
  });

  // =================== FONCTIONS UTILITAIRES ===================
  
  // Filtrage des équipements avec recherche intelligente
  const filteredEquipment = equipment.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    
    // Recherche dans le nom, catégorie, certification
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      (item.certification?.toLowerCase().includes(searchLower)) ||
      (item.priority && t.priorities[item.priority].toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories uniques avec traductions
  const categories = Array.from(new Set(equipment.map(eq => eq.category))).sort();
  
  // Options de catégorie avec compteurs
  const categoryOptions = categories.map(category => ({
    category,
    count: equipment.filter(eq => eq.category === category).length
  }));

  // Équipements sélectionnés
  const selectedEquipment = equipment.filter(eq => eq.required);

  // Statistiques
  const stats = {
    totalSelected: selectedEquipment.length,
    highPriority: selectedEquipment.filter(eq => eq.priority === 'high').length,
    categoriesCount: Array.from(new Set(selectedEquipment.map(eq => eq.category))).length,
    totalEquipment: equipment.length,
    filteredCount: filteredEquipment.length
  };

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
      categories: Array.from(new Set(selectedList.map(eq => eq.category))),
      inspectionStatus: {
        total: selectedList.length,
        verified: selectedList.length, // Assume all selected are verified
        available: selectedList.length,
        verificationRate: 100,
        availabilityRate: 100
      }
    };
    
    onDataChange('equipment', equipmentData);
  };
  

  // =================== FONCTIONS DE STYLE ===================
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    return t.priorities[priority as keyof typeof t.priorities] || t.priorities.default;
  };

  // =================== HANDLERS DE RECHERCHE AVANCÉE ===================
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handleSelectAllInCategory = (category: string) => {
    const updatedEquipment = equipment.map(item => 
      item.category === category 
        ? { ...item, required: true }
        : item
    );
    
    setEquipment(updatedEquipment);
    updateFormData(updatedEquipment);
  };

  const handleDeselectAllInCategory = (category: string) => {
    const updatedEquipment = equipment.map(item => 
      item.category === category 
        ? { ...item, required: false }
        : item
    );
    
    setEquipment(updatedEquipment);
    updateFormData(updatedEquipment);
  };

  const handleSelectAllCritical = () => {
    const updatedEquipment = equipment.map(item => 
      item.priority === 'high' 
        ? { ...item, required: true }
        : item
    );
    
    setEquipment(updatedEquipment);
    updateFormData(updatedEquipment);
  };

  const handleDeselectAll = () => {
    const updatedEquipment = equipment.map(item => ({ ...item, required: false }));
    setEquipment(updatedEquipment);
    updateFormData(updatedEquipment);
  };

  // =================== EFFET POUR METTRE À JOUR LES TRADUCTIONS ===================
  React.useEffect(() => {
    // Mettre à jour les traductions quand la langue change
    const translatedEquipment = getEquipmentList(language);
    const updatedEquipment = translatedEquipment.map(translatedItem => {
      const currentItem = equipment.find(item => item.id === translatedItem.id);
      return currentItem ? { ...translatedItem, required: currentItem.required } : translatedItem;
    });
    setEquipment(updatedEquipment);
  }, [language]);

  // =================== COMPOSANTS UTILITAIRES ===================
  
  const SearchControls = () => (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: '16px'
    }}>
      <button
        onClick={handleClearSearch}
        style={{
          padding: '8px 16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#60a5fa',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        Effacer filtres
      </button>
      
      <button
        onClick={handleSelectAllCritical}
        style={{
          padding: '8px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        🔴 Sélectionner critiques
      </button>
      
      <button
        onClick={handleDeselectAll}
        style={{
          padding: '8px 16px',
          background: 'rgba(100, 116, 139, 0.1)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '8px',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        Tout désélectionner
      </button>
    </div>
  );

  const CategoryInfo = () => {
    if (selectedCategory === 'all') return null;
    
    const categoryEquipment = equipment.filter(eq => eq.category === selectedCategory);
    const selectedInCategory = categoryEquipment.filter(eq => eq.required).length;
    
    return (
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '500' }}>
          {selectedCategory}: {selectedInCategory}/{categoryEquipment.length} sélectionnés
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleSelectAllInCategory(selectedCategory)}
            style={{
              padding: '4px 8px',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '4px',
              color: '#22c55e',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Tout
          </button>
          <button
            onClick={() => handleDeselectAllInCategory(selectedCategory)}
            style={{
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '4px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Aucun
          </button>
        </div>
      </div>
    );
  };

  // =================== COMPOSANT CARTE D'ÉQUIPEMENT ===================
  const EquipmentCard = ({ item }: { item: Equipment }) => {
    const isSelected = item.required;
    
    return (
      <div 
        className={`equipment-item ${isSelected ? 'selected' : ''} ${item.priority}-priority`}
        onClick={() => handleEquipmentToggle(item.id)}
        style={{
          background: isSelected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(20px)',
          border: isSelected ? '1px solid #22c55e' : '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        {/* Indicateur de priorité */}
        {item.priority === 'high' && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: '#ef4444',
            borderRadius: '12px 0 0 12px'
          }} />
        )}
        {item.priority === 'medium' && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: '#f59e0b',
            borderRadius: '12px 0 0 12px'
          }} />
        )}
        
        <div className="equipment-header" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div className="equipment-icon" style={{
            fontSize: '24px',
            width: '32px',
            textAlign: 'center'
          }}>
            {item.icon}
          </div>
          <div className="equipment-content" style={{ flex: 1 }}>
            <h3 className="equipment-name" style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 4px'
            }}>
              {item.name}
            </h3>
            <div className="equipment-category" style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {item.category}
            </div>
          </div>
          <div className={`equipment-checkbox ${isSelected ? 'checked' : ''}`} style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(100, 116, 139, 0.5)',
            borderRadius: '4px',
            background: isSelected ? '#22c55e' : 'rgba(15, 23, 42, 0.8)',
            borderColor: isSelected ? '#22c55e' : 'rgba(100, 116, 139, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: 'white'
          }}>
            {isSelected && <CheckCircle size={16} />}
          </div>
        </div>
        
        <div className="equipment-details" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <div className="equipment-certification" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {item.certification}
          </div>
          <div 
            className="equipment-priority"
            style={{ 
              background: `${getPriorityColor(item.priority)}20`,
              color: getPriorityColor(item.priority),
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            {getPriorityLabel(item.priority)}
          </div>
        </div>
      </div>
    );
  };
  // Récupérer le mode depuis formData
  const equipmentControlMode = formData?.projectInfo?.equipmentControlMode || 'global';
  const workLocations = formData?.projectInfo?.workLocations || [];

  // Fonction pour gérer les changements de données par emplacement
  const handleLocationDataChange = (locationId: string, section: string, data: any) => {
    // Cette fonction sera utilisée pour les données par emplacement
    console.log('Location data change:', locationId, section, data);
  };

  // Contenu principal de l'interface équipements
  const equipmentContent = (
    <div className="equipment-simple-container">
      {/* En-tête avec résumé */}
      <div className="summary-header">
        <div className="summary-title">
          <Shield size={24} />
          {t.title}
        </div>
        <div className="summary-subtitle">{t.subtitle}</div>
        
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.totalSelected}</span>
            <span className="stat-label">{t.selected}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.highPriority}</span>
            <span className="stat-label">{t.critical}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.categoriesCount}</span>
            <span className="stat-label">{t.categories}</span>
          </div>
        </div>
      </div>

      {/* Erreurs de validation */}
      {errors?.equipment && (
        <div className="validation-errors">
          <AlertTriangle size={20} />
          <div className="errors-content">
            <strong>{t.validationErrors}</strong>
            <ul>
              {errors.equipment.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sélecteur de catégorie */}
      <div className="category-selector">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">{t.allCategories}</option>
          {categoryOptions.map(({ category, count }) => {
            if (count > 0) {
              return (
                <option key={category} value={category}>
                  {category} ({count})
                </option>
              );
            }
          })}
        </select>
      </div>
      
      {/* Contrôles de recherche */}
      <div className="controls-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Liste des équipements */}
      <div className="equipment-grid">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => <EquipmentCard key={item.id} item={item} />)
        ) : (
          <div className="no-results">
            <AlertTriangle size={48} />
            <h3>{t.noResults}</h3>
            <p>{t.noResultsDescription}</p>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="debug-info">
        {equipment.length} {t.debugMessage} {filteredEquipment.length} {t.debugDisplayed}
      </div>
    </div>
  );

  return (
    <>
      {/* CSS pour le design optimisé et responsive */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .equipment-simple-container { 
            padding: 0; 
            color: #ffffff;
          }
          
          .summary-header { 
            background: rgba(34, 197, 94, 0.1); 
            border: 1px solid rgba(34, 197, 94, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
          }
          
          .summary-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent);
            animation: shine 3s ease-in-out infinite;
          }
          
          @keyframes shine {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          
          .summary-title { 
            color: #22c55e; 
            font-size: 18px; 
            font-weight: 700; 
            margin-bottom: 8px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
            position: relative;
            z-index: 1;
          }
          
          .summary-subtitle {
            color: #16a34a;
            margin: '0 0 8px';
            fontSize: '14px';
            position: relative;
            z-index: 1;
          }
          
          .summary-stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 16px; 
            margin-top: 16px;
            position: relative;
            z-index: 1;
          }
          
          .stat-item { 
            text-align: center; 
            background: rgba(15, 23, 42, 0.6); 
            padding: 12px; 
            border-radius: 8px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .stat-item:hover {
            transform: translateY(-2px);
            background: rgba(15, 23, 42, 0.8);
          }
          
          .stat-value { 
            font-size: 20px; 
            font-weight: 800; 
            color: #22c55e; 
            margin-bottom: 4px; 
          }
          
          .stat-label { 
            font-size: 12px; 
            color: #16a34a; 
            font-weight: 500; 
          }
          
          .search-section { 
            background: rgba(30, 41, 59, 0.6); 
            backdrop-filter: blur(20px); 
            border: 1px solid rgba(100, 116, 139, 0.3); 
            border-radius: 16px; 
            padding: 20px; 
            margin-bottom: 24px; 
          }
          
          .search-grid { 
            display: grid; 
            grid-template-columns: 1fr auto; 
            gap: 12px; 
            align-items: end; 
          }
          
          .search-input-wrapper { 
            position: relative; 
          }
          
          .search-icon { 
            position: absolute; 
            left: 12px; 
            top: 50%; 
            transform: translateY(-50%); 
            color: #94a3b8; 
            z-index: 10; 
          }
          
          .search-field { 
            width: 100%; 
            padding: 12px 12px 12px 40px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 14px; 
            transition: all 0.3s ease;
            font-family: inherit;
          }
          
          .search-field:focus { 
            outline: none; 
            border-color: #3b82f6; 
            background: rgba(15, 23, 42, 0.9);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .search-field::placeholder {
            color: #64748b;
            font-weight: 400;
          }
          
          .category-select { 
            padding: 12px; 
            background: rgba(15, 23, 42, 0.8); 
            border: 2px solid rgba(100, 116, 139, 0.3); 
            border-radius: 12px; 
            color: #ffffff; 
            font-size: 14px; 
            cursor: pointer; 
            transition: all 0.3s ease;
            font-family: inherit;
            min-width: 200px;
          }
          
          .category-select:focus { 
            outline: none; 
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .equipment-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
            gap: 16px; 
          }
          
          .equipment-item { 
            transition: all 0.3s ease; 
            cursor: pointer; 
            position: relative;
            overflow: hidden;
          }
          
          .equipment-item:hover { 
            transform: translateY(-2px); 
            border-color: rgba(59, 130, 246, 0.5) !important; 
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1); 
          }
          
          .equipment-item.selected:hover {
            border-color: rgba(34, 197, 94, 0.8) !important;
            box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2);
          }
          
          .no-results { 
            text-align: center; 
            padding: 60px 20px; 
            color: #94a3b8; 
            background: rgba(30, 41, 59, 0.6); 
            border-radius: 16px; 
            border: 1px solid rgba(100, 116, 139, 0.3);
            backdrop-filter: blur(20px);
          }
          
          .no-results-icon {
            margin: '0 auto 16px';
            color: '#64748b';
          }
          
          .no-results-title {
            color: '#e2e8f0';
            margin: '0 0 8px';
            font-size: '18px';
            font-weight: '600';
          }
          
          .no-results-description {
            margin: 0;
            font-size: '14px';
          }
          
          .error-section { 
            background: rgba(239, 68, 68, 0.1); 
            border: 1px solid rgba(239, 68, 68, 0.3); 
            border-radius: 12px; 
            padding: 16px; 
            margin-top: 24px;
            backdrop-filter: blur(10px);
          }
          
          .error-header { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            color: #f87171; 
            margin-bottom: 8px; 
            font-weight: 600; 
          }
          
          .error-list { 
            margin: 0; 
            padding-left: 20px; 
            color: #fca5a5; 
          }
          
          .debug-section {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            color: #60a5fa;
            fontSize: 14px;
          }
          
          .controls-section {
            margin-bottom: 16px;
          }
          
          .controls-grid {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
          }
          
          .control-btn {
            padding: 8px 16px;
            border: 1px solid;
            border-radius: 8px;
            cursor: pointer;
            fontSize: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
            background: transparent;
          }
          
          .control-btn:hover {
            transform: translateY(-1px);
            opacity: 0.8;
          }
          
          .control-btn.clear {
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.3);
            color: #60a5fa;
          }
          
          .control-btn.critical {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
            color: #f87171;
          }
          
          .control-btn.deselect {
            background: rgba(100, 116, 139, 0.1);
            border-color: rgba(100, 116, 139, 0.3);
            color: #94a3b8;
          }
          
          .category-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .category-info-text {
            color: #60a5fa;
            fontSize: 14px;
            font-weight: 500;
          }
          
          .category-actions {
            display: flex;
            gap: 8px;
          }
          
          .category-btn {
            padding: 4px 8px;
            border: 1px solid;
            border-radius: 4px;
            cursor: pointer;
            fontSize: 12px;
            background: transparent;
          }
          
          .category-btn.select-all {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.4);
            color: #22c55e;
          }
          
          .category-btn.deselect-all {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.4);
            color: #ef4444;
          }
          
          /* =================== RESPONSIVE =================== */
          @media (max-width: 768px) {
            .equipment-grid { 
              grid-template-columns: 1fr; 
              gap: 12px; 
            }
            
            .search-grid { 
              grid-template-columns: 1fr; 
              gap: 8px; 
            }
            
            .summary-stats { 
              grid-template-columns: repeat(2, 1fr); 
            }
            
            .equipment-details { 
              flex-direction: column; 
              align-items: flex-start; 
              gap: 8px; 
            }
            
            .controls-grid {
              flex-direction: column;
              align-items: stretch;
            }
            
            .control-btn {
              text-align: center;
            }
            
            .category-select {
              min-width: auto;
            }
            
            .category-info {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }
            
            .category-actions {
              justify-content: center;
            }
          }
          
          @media (max-width: 480px) {
            .equipment-simple-container {
              padding: 0;
            }
            
            .summary-header,
            .search-section {
              padding: 16px;
              margin-bottom: 16px;
            }
            
            .summary-stats {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            
            .equipment-item {
              padding: 12px;
            }
            
            .no-results {
              padding: 40px 16px;
            }
          }
          
          /* =================== ANIMATIONS =================== */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .equipment-item {
            animation: fadeIn 0.3s ease-out;
          }
          
          .stat-item {
            animation: fadeIn 0.4s ease-out;
          }
          
          /* =================== DARK MODE OPTIMIZATIONS =================== */
          .equipment-item {
            border: 1px solid rgba(100, 116, 139, 0.3);
          }
          
          .equipment-item:hover {
            background: rgba(30, 41, 59, 0.8) !important;
          }
          
          .equipment-item.selected {
            background: rgba(34, 197, 94, 0.15) !important;
            border-color: #22c55e !important;
          }
          
        `
      }} />

      {/* Affichage conditionnel selon le mode */}
      {equipmentControlMode === 'global' ? (
        // Mode global - interface unique
        equipmentContent
      ) : (
        // Mode par emplacement - onglets pour chaque emplacement
        <LocationTabsContainer
          workLocations={workLocations}
          equipmentControlMode={equipmentControlMode}
          step={2}
          onLocationDataChange={handleLocationDataChange}
          language={language}
        >
          {() => equipmentContent}
        </LocationTabsContainer>
      )}
    </>
  );
};

export default Step2Equipment;
