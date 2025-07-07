// data/workTypes/index.ts
export interface WorkType {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  baseHazards: string[];
  requiredPermits: string[];
  requiredEquipment: string[];
  estimatedDuration: string;
  skillLevel: 'entry' | 'intermediate' | 'advanced' | 'expert';
  regulations: string[];
}

export const workTypesDatabase: WorkType[] = [
  // ÉLECTRICITÉ
  {
    id: 'electrical_maintenance',
    name: 'Maintenance électrique',
    category: 'Électricité',
    description: 'Travaux de maintenance sur installations électriques',
    icon: '⚡',
    baseHazards: ['electrical_shock', 'arc_flash', 'electrical_burns'],
    requiredPermits: ['electrical', 'lockout'],
    requiredEquipment: ['electrical_gloves', 'safety_boots_steel', 'arc_flash_suit'],
    estimatedDuration: '2-8 heures',
    skillLevel: 'advanced',
    regulations: ['CSA Z462', 'RSST Art. 185', 'Code électrique']
  },
  {
    id: 'electrical_installation',
    name: 'Installation électrique',
    category: 'Électricité',
    description: 'Installation de nouveaux équipements électriques',
    icon: '🔌',
    baseHazards: ['electrical_shock', 'arc_flash', 'cuts_lacerations', 'falls'],
    requiredPermits: ['electrical', 'construction'],
    requiredEquipment: ['electrical_gloves', 'hardhat_class_e', 'safety_glasses'],
    estimatedDuration: '4-12 heures',
    skillLevel: 'expert',
    regulations: ['CSA Z462', 'Code électrique', 'RSST']
  },

  // GAZ ET PIPELINE
  {
    id: 'gas_maintenance',
    name: 'Maintenance gazière',
    category: 'Gaz & Pipeline',
    description: 'Maintenance sur réseaux de distribution de gaz',
    icon: '🔥',
    baseHazards: ['gas_leak', 'explosion', 'fire', 'asphyxiation'],
    requiredPermits: ['gas', 'confined_space', 'hot_work'],
    requiredEquipment: ['gas_detector_4_gas', 'chemical_suit', 'scba'],
    estimatedDuration: '3-10 heures',
    skillLevel: 'expert',
    regulations: ['CSA Z662', 'RSST Art. 280', 'Règlement gazier']
  },
  {
    id: 'pipeline_inspection',
    name: 'Inspection pipeline',
    category: 'Gaz & Pipeline',
    description: 'Inspection et contrôle de pipelines',
    icon: '🚰',
    baseHazards: ['gas_leak', 'explosion', 'asphyxiation', 'confined_space'],
    requiredPermits: ['gas', 'confined_space'],
    requiredEquipment: ['gas_detector_4_gas', 'scba', 'full_body_harness'],
    estimatedDuration: '2-6 heures',
    skillLevel: 'advanced',
    regulations: ['CSA Z662', 'CSA Z1611']
  },

  // CONSTRUCTION
  {
    id: 'construction_general',
    name: 'Construction générale',
    category: 'Construction',
    description: 'Travaux de construction et rénovation',
    icon: '🏗️',
    baseHazards: ['falls', 'struck_by_objects', 'cuts_lacerations', 'noise'],
    requiredPermits: ['construction', 'municipal'],
    requiredEquipment: ['hardhat_standard', 'safety_boots_steel', 'high_vis_vest'],
    estimatedDuration: '1-8 heures',
    skillLevel: 'intermediate',
    regulations: ['RSST', 'Code du bâtiment', 'Normes municipales']
  },
  {
    id: 'excavation',
    name: 'Excavation',
    category: 'Construction',
    description: 'Travaux d\'excavation et terrassement',
    icon: '⛏️',
    baseHazards: ['cave_in', 'struck_by_objects', 'underground_utilities'],
    requiredPermits: ['excavation', 'utility_clearance'],
    requiredEquipment: ['hardhat_standard', 'safety_boots_steel', 'high_vis_vest'],
    estimatedDuration: '4-12 heures',
    skillLevel: 'advanced',
    regulations: ['RSST', 'Info-Excavation', 'Normes municipales']
  },
  {
    id: 'work_at_height',
    name: 'Travail en hauteur',
    category: 'Construction',
    description: 'Travaux effectués à plus de 3 mètres',
    icon: '🪜',
    baseHazards: ['falls', 'weather_exposure', 'struck_by_objects'],
    requiredPermits: ['height_work', 'safety_plan'],
    requiredEquipment: ['full_body_harness', 'shock_absorbing_lanyard', 'anchor_point'],
    estimatedDuration: '2-8 heures',
    skillLevel: 'advanced',
    regulations: ['RSST Art. 347', 'CSA Z259', 'Normes de sécurité']
  },

  // INDUSTRIEL
  {
    id: 'welding',
    name: 'Soudage',
    category: 'Industriel',
    description: 'Travaux de soudage et découpage',
    icon: '🔥',
    baseHazards: ['fire', 'toxic_exposure', 'radiation', 'electrical_burns'],
    requiredPermits: ['hot_work', 'fire_permit'],
    requiredEquipment: ['welding_helmet', 'welding_gloves', 'fire_extinguisher'],
    estimatedDuration: '2-8 heures',
    skillLevel: 'advanced',
    regulations: ['CSA W117.2', 'RSST Art. 338', 'Normes de soudage']
  },
  {
    id: 'confined_space',
    name: 'Espace confiné',
    category: 'Industriel',
    description: 'Travaux en espaces confinés',
    icon: '🕳️',
    baseHazards: ['asphyxiation', 'toxic_exposure', 'oxygen_deficiency'],
    requiredPermits: ['confined_space', 'atmospheric_testing'],
    requiredEquipment: ['scba', 'gas_detector_4_gas', 'emergency_retrieval'],
    estimatedDuration: '1-6 heures',
    skillLevel: 'expert',
    regulations: ['CSA Z1611', 'RSST', 'Normes espaces confinés']
  },

  // TÉLÉCOMMUNICATIONS
  {
    id: 'telecom_installation',
    name: 'Installation télécom',
    category: 'Télécommunications',
    description: 'Installation d\'équipements de télécommunication',
    icon: '📡',
    baseHazards: ['falls', 'electrical_shock', 'electromagnetic_fields'],
    requiredPermits: ['telecom', 'rf_safety'],
    requiredEquipment: ['full_body_harness', 'rf_detector', 'electrical_gloves'],
    estimatedDuration: '3-8 heures',
    skillLevel: 'advanced',
    regulations: ['Industrie Canada', 'CSA', 'Normes RF']
  },

  // ENVIRONNEMENT
  {
    id: 'environmental_cleanup',
    name: 'Décontamination',
    category: 'Environnement',
    description: 'Travaux de décontamination environnementale',
    icon: '♻️',
    baseHazards: ['toxic_exposure', 'biological_hazards', 'chemical_burns'],
    requiredPermits: ['environmental', 'waste_handling'],
    requiredEquipment: ['chemical_suit', 'scba', 'decontamination_station'],
    estimatedDuration: '4-12 heures',
    skillLevel: 'expert',
    regulations: ['Loi environnementale', 'RSST', 'Transport Canada']
  },

  // URGENCE
  {
    id: 'emergency_response',
    name: 'Intervention d\'urgence',
    category: 'Urgence',
    description: 'Interventions d\'urgence et réparations critiques',
    icon: '🚨',
    baseHazards: ['weather_exposure', 'electrical_shock', 'falls', 'time_pressure'],
    requiredPermits: ['emergency', 'municipal_clearance'],
    requiredEquipment: ['emergency_kit', 'communication_radio', 'portable_lighting'],
    estimatedDuration: '1-24 heures',
    skillLevel: 'expert',
    regulations: ['Protocoles d\'urgence', 'RSST', 'Normes client']
  }
];

export const getWorkTypesByCategory = (category: string): WorkType[] => {
  return workTypesDatabase.filter(workType => workType.category === category);
};

export const getWorkTypeById = (id: string): WorkType | undefined => {
  return workTypesDatabase.find(workType => workType.id === id);
};

export const getAllCategories = (): string[] => {
  return [...new Set(workTypesDatabase.map(workType => workType.category))];
};

// ⭐ LIGNE CLÉE AJOUTÉE - Export pour compatibilité avec les composants
export const allWorkTypes = workTypesDatabase;

export default workTypesDatabase;
