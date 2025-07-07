// app/data/hazards/workplace.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'WORKPLACE' as any,
    severity: 'medium',
    likelihood: 'medium',
    riskLevel: 'medium',
    controlMeasures: [],
    requiredEquipment: [],
    regulatoryReferences: [],
    workTypes: [],
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    // Merge avec les propriétés passées
    ...base
  } as Hazard;
};

// =================== DANGERS DU MILIEU DE TRAVAIL ===================

export const slipsTripsFalls: Hazard = createNewHazard({
  id: 'slips_trips_falls_same_level',
  name: 'Glissades, trébuchements, chutes de plain-pied',
  category: 'workplace',
  subcategory: 'surface_hazards',
  description: 'Chutes au même niveau par surfaces glissantes, obstacles',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Maintien propreté surfaces',
    'Signalisation dangers temporaires',
    'Chaussures antidérapantes',
    'Éclairage adéquat'
  ],
  
  requiredEquipment: [
    'slip_resistant_footwear',
    'warning_signs_wet_floor',
    'adequate_lighting',
    'non_slip_mats'
  ],
  
  regulatoryReferences: [
    'RSST Art. 12-19',
    'CSA Z195 - Chaussures sécurité',
    'Guide CNESST - Glissades'
  ],
  
  workTypes: ['construction_general', 'maintenance', 'cleaning'],
  
  isActive: true
});

export const poorHousekeeping: Hazard = createNewHazard({
  id: 'poor_workplace_housekeeping',
  name: 'Mauvais entretien ménager',
  category: 'workplace',
  subcategory: 'housekeeping',
  description: 'Désordre, déchets, matériaux mal rangés',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Programme 5S/entretien ménager',
    'Zones désignées matériaux',
    'Nettoyage régulier planifié',
    'Responsabilisation équipes'
  ],
  
  requiredEquipment: [
    'storage_containers',
    'cleaning_supplies',
    'waste_disposal_bins',
    'material_handling_equipment'
  ],
  
  regulatoryReferences: [
    'RSST Art. 10-11',
    'Guide CNESST - Entretien ménager'
  ],
  
  workTypes: ['construction_general', 'manufacturing', 'warehouse'],
  
  isActive: true
});

export const inadequateLighting: Hazard = createNewHazard({
  id: 'insufficient_workplace_lighting',
  name: 'Éclairage insuffisant',
  category: 'workplace',
  subcategory: 'lighting',
  description: 'Éclairage inadéquat causant erreurs, accidents',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Mesure niveaux éclairage',
    'Éclairage supplémentaire portable',
    'Maintenance régulière luminaires',
    'Réflecteurs et miroirs'
  ],
  
  requiredEquipment: [
    'portable_work_lights',
    'light_level_meter',
    'reflective_surfaces',
    'emergency_lighting'
  ],
  
  regulatoryReferences: [
    'RSST Art. 103-110',
    'IESNA RP-7 - Éclairage industriel',
    'CSA C22.2'
  ],
  
  workTypes: ['construction_general', 'maintenance', 'precision_work'],
  
  isActive: true
});

export const workspaceConfinement: Hazard = createNewHazard({
  id: 'cramped_workspace_conditions',
  name: 'Espaces de travail restreints',
  category: 'workplace',
  subcategory: 'space',
  description: 'Manque d\'espace causant postures contraignantes',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Aménagement optimal espaces',
    'Outils adaptés espaces restreints',
    'Rotation fréquente personnel',
    'Supports ergonomiques'
  ],
  
  requiredEquipment: [
    'compact_ergonomic_tools',
    'kneeling_pads',
    'adjustable_work_supports',
    'personal_lighting_systems'
  ],
  
  regulatoryReferences: [
    'RSST - Aménagement postes',
    'CSA Z412 - Ergonomie'
  ],
  
  workTypes: ['confined_space', 'maintenance', 'repair_work'],
  
  isActive: true
});

export const vehicleTraffic: Hazard = createNewHazard({
  id: 'vehicle_pedestrian_interaction',
  name: 'Circulation véhicules/piétons',
  category: 'workplace',
  subcategory: 'traffic',
  description: 'Collision entre véhicules et travailleurs à pied',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Séparation voies circulation',
    'Signalisation visible',
    'Vêtements haute visibilité',
    'Communication radio'
  ],
  
  requiredEquipment: [
    'high_visibility_vest_class2',
    'traffic_cones_barriers',
    'vehicle_warning_devices',
    'two_way_radio_communication'
  ],
  
  regulatoryReferences: [
    'RSST Art. 2.20',
    'CSA Z96 - Haute visibilité',
    'Manuel signalisation chantier'
  ],
  
  workTypes: ['construction_general', 'warehouse', 'road_work'],
  
  isActive: true
});

// =================== EXPORT DANGERS MILIEU TRAVAIL ===================
export const workplaceHazards = [
  slipsTripsFalls,
  poorHousekeeping,
  inadequateLighting,
  workspaceConfinement,
  vehicleTraffic
];

export const workplaceHazardsById = workplaceHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default workplaceHazards;
