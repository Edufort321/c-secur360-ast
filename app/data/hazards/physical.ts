// app/data/hazards/physical.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'PHYSICAL' as any,
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

// =================== DANGERS PHYSIQUES ===================

export const fallsFromHeight: Hazard = createNewHazard({
  id: 'falls_from_height',
  name: 'Chutes de hauteur',
  category: 'PHYSICAL' as any,
  subcategory: 'falls',
  description: 'Risque de chute de plus de 3 mètres',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Système d\'arrêt de chute',
    'Garde-corps temporaires',
    'Filets de sécurité',
    'Formation travail en hauteur'
  ],
  
  requiredEquipment: [
    'full_body_harness_3d',
    'shock_absorbing_lanyard_6ft',
    'temporary_anchor_point_beam',
    'climbing_helmet_mountaineering'
  ],
  
  regulatoryReferences: [
    'RSST Art. 347-378',
    'CSA Z259 série',
    'ANSI Z359 série'
  ],
  
  workTypes: ['work_at_height', 'construction_general'],
  
  isActive: true
});

export const struckByObjects: Hazard = createNewHazard({
  id: 'struck_by_falling_objects',
  name: 'Objets qui tombent',
  category: 'physical',
  subcategory: 'struck_by',
  description: 'Impact par objets qui chutent ou sont projetés',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Casque de sécurité obligatoire',
    'Périmètre de sécurité',
    'Filets de protection',
    'Signalisation des zones dangereuses'
  ],
  
  requiredEquipment: [
    'hard_hat_standard_csa',
    'safety_glasses_wraparound',
    'high_visibility_vest_class2'
  ],
  
  regulatoryReferences: [
    'RSST Art. 2.10',
    'CSA Z94.1',
    'ANSI Z89.1'
  ],
  
  workTypes: ['construction_general', 'excavation'],
  
  isActive: true
});

export const noiseExposure: Hazard = createNewHazard({
  id: 'excessive_noise_exposure',
  name: 'Exposition au bruit',
  category: 'physical',
  subcategory: 'noise',
  description: 'Exposition à des niveaux sonores supérieurs à 85 dBA',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Protection auditive obligatoire',
    'Rotation du personnel',
    'Réduction à la source',
    'Audiométrie périodique'
  ],
  
  requiredEquipment: [
    'hearing_protection_plugs',
    'noise_level_meter',
    'sound_dampening_barriers'
  ],
  
  regulatoryReferences: [
    'RSST Art. 130-141',
    'CSA Z107.56',
    'ISO 1999'
  ],
  
  workTypes: ['construction_general', 'welding', 'excavation'],
  
  isActive: true
});

export const extremeTemperatures: Hazard = createNewHazard({
  id: 'extreme_temperature_exposure',
  name: 'Températures extrêmes',
  category: 'physical',
  subcategory: 'temperature',
  description: 'Exposition au froid extrême ou à la chaleur excessive',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Vêtements appropriés',
    'Rotation fréquente',
    'Hydratation/réchauffement',
    'Surveillance des signes vitaux'
  ],
  
  requiredEquipment: [
    'insulated_winter_boots',
    'thermal_workwear',
    'cooling_vest_summer'
  ],
  
  regulatoryReferences: [
    'RSST Art. 121-129',
    'ACGIH TLV',
    'ISO 7730'
  ],
  
  workTypes: ['emergency_response', 'outdoor_work'],
  
  isActive: true
});

// =================== EXPORT DANGERS PHYSIQUES ===================
export const physicalHazards = [
  fallsFromHeight,
  struckByObjects,
  noiseExposure,
  extremeTemperatures
];

export const physicalHazardsById = physicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default physicalHazards;
