// app/data/hazards/workplace.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: any): Hazard => {
  return {
    category: 'WORKPLACE' as any
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
  name: 'Glissades, trébuchements, chutes',
  category: 'WORKPLACE' as any,
  subcategory: 'walking_surfaces',
  displayName: {
    fr: 'Chutes de plain-pied',
    en: 'Slips, trips and falls'
  },
  description: 'Risque de chute sur surfaces glissantes ou encombrées',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  eliminationMethods: [
    'Conception surfaces antidérapantes',
    'Élimination obstacles permanents',
    'Drainage automatique des liquides'
  ],
  
  engineeringControls: [
    'Revêtements antidérapants',
    'Systèmes de drainage efficaces',
    'Éclairage adéquat des passages',
    'Rampes et mains courantes'
  ],
  
  administrativeControls: [
    'Entretien ménager régulier',
    'Signalisation zones dangereuses',
    'Procédures nettoyage immédiat',
    'Inspection quotidienne des lieux'
  ],
  
  controlMeasures: [
    'Entretien ménager rigoureux',
    'Chaussures antidérapantes',
    'Signalisation sol mouillé',
    'Éclairage adéquat des passages'
  ],
  
  requiredEquipment: [
    'non_slip_safety_footwear',
    'wet_floor_warning_signs',
    'anti_slip_floor_treatments',
    'adequate_lighting_systems'
  ],
  
  emergencyProcedures: [
    'Évaluation blessures avant déplacement',
    'Immobilisation si douleur dorsale',
    'Nettoyage immédiat zone dangereuse',
    'Rapport incident détaillé'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Entretien ménager',
    'Code du bâtiment - Surfaces de marche'
  ],
  
  workTypes: ['general_workplace', 'food_service', 'cleaning_operations'],
  
  isActive: true
});

export const poorHousekeeping: Hazard = createNewHazard({
  id: 'poor_housekeeping_clutter',
  name: 'Mauvais entretien ménager',
  category: 'WORKPLACE' as any,
  subcategory: 'housekeeping',
  displayName: {
    fr: 'Encombrement et désordre',
    en: 'Poor housekeeping and clutter'
  },
  description: 'Risque d\'accidents par encombrement et désorganisation',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Programme 5S (Sort, Set, Shine, Standardize, Sustain)',
    'Rangement systématique quotidien',
    'Élimination objets inutiles',
    'Zones de stockage délimitées'
  ],
  
  requiredEquipment: [
    'storage_containers_labeled',
    'waste_disposal_bins',
    'cleaning_supplies_accessible',
    'organization_systems'
  ],
  
  emergencyProcedures: [
    'Dégagement voies d\'évacuation',
    'Nettoyage immédiat déversements',
    'Signalement obstacles dangereux',
    'Inspection sécuritaire urgente'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Organisation du travail',
    'Code de prévention des incendies'
  ],
  
  workTypes: ['manufacturing', 'warehousing', 'office_environments'],
  
  isActive: true
});

export const inadequateLighting: Hazard = createNewHazard({
  id: 'inadequate_workplace_lighting',
  name: 'Éclairage insuffisant',
  category: 'WORKPLACE' as any,
  subcategory: 'lighting',
  displayName: {
    fr: 'Mauvais éclairage',
    en: 'Inadequate lighting'
  },
  description: 'Risque d\'accidents par visibilité réduite',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Éclairage minimum requis respecté',
    'Éclairage d\'appoint aux postes',
    'Maintenance régulière luminaires',
    'Éclairage d\'urgence fonctionnel'
  ],
  
  requiredEquipment: [
    'adequate_overhead_lighting',
    'task_specific_lighting',
    'emergency_lighting_system',
    'light_meter_measurement'
  ],
  
  emergencyProcedures: [
    'Éclairage d\'urgence automatique',
    'Évacuation sécuritaire guidée',
    'Réparation éclairage prioritaire',
    'Éclairage temporaire si nécessaire'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Éclairage des lieux de travail',
    'Code du bâtiment - Éclairage'
  ],
  
  workTypes: ['indoor_work', 'precision_tasks', 'night_shift_operations'],
  
  isActive: true
});

export const confinedWorkspaces: Hazard = createNewHazard({
  id: 'confined_restricted_workspaces',
  name: 'Espaces de travail restreints',
  category: 'WORKPLACE' as any,
  subcategory: 'space_constraints',
  displayName: {
    fr: 'Espaces restreints',
    en: 'Confined workspaces'
  },
  description: 'Risque d\'accidents par manque d\'espace de manœuvre',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Aménagement optimisé de l\'espace',
    'Procédures d\'entrée sécuritaires',
    'Équipements adaptés à l\'espace',
    'Surveillance continue des travailleurs'
  ],
  
  requiredEquipment: [
    'compact_safety_equipment',
    'communication_devices_portable',
    'personal_monitoring_systems',
    'emergency_evacuation_equipment'
  ],
  
  emergencyProcedures: [
    'Évacuation rapide espace confiné',
    'Secours spécialisé espace restreint',
    'Communication d\'urgence maintenue',
    'Surveillance médicale post-exposition'
  ] as any,
  
  regulatoryReferences: [
    'CSA Z1611 - Espaces confinés',
    'RSST - Espaces clos'
  ],
  
  workTypes: ['confined_space_entry', 'maintenance_work', 'underground_operations'],
  
  isActive: true
});

export const vehiclePedestrianTraffic: Hazard = createNewHazard({
  id: 'vehicle_pedestrian_interaction',
  name: 'Circulation véhicules/piétons',
  category: 'WORKPLACE' as any,
  subcategory: 'traffic_control',
  displayName: {
    fr: 'Trafic mixte véhicules-piétons',
    en: 'Vehicle-pedestrian traffic'
  },
  description: 'Risque de collision entre véhicules et piétons',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Séparation voies véhicules/piétons',
    'Signalisation claire et visible',
    'Vêtements haute visibilité',
    'Zones de circulation délimitées'
  ],
  
  requiredEquipment: [
    'high_visibility_safety_vests',
    'traffic_control_devices',
    'pedestrian_crossing_signals',
    'vehicle_warning_systems'
  ],
  
  emergencyProcedures: [
    'Arrêt circulation immédiat',
    'Premiers soins traumatisme',
    'Transport médical d\'urgence',
    'Enquête accident détaillée'
  ] as any,
  
  regulatoryReferences: [
    'Code de la sécurité routière',
    'RSST - Circulation en milieu de travail'
  ],
  
  workTypes: ['warehouse_operations', 'construction_sites', 'loading_dock_operations'],
  
  isActive: true
});

// =================== EXPORT DANGERS MILIEU DE TRAVAIL ===================
export const workplaceHazards = [
  slipsTripsFalls,
  poorHousekeeping,
  inadequateLighting,
  confinedWorkspaces,
  vehiclePedestrianTraffic
];

export const workplaceHazardsById = workplaceHazards.reduce((acc, hazard) => {
  acc[(hazard as any).id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default workplaceHazards;
