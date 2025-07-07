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
  displayName: {
    fr: 'Chutes de hauteur',
    en: 'Falls from height'
  },
  description: 'Risque de chute depuis une surface élevée pouvant causer blessures graves',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Élimination du travail en hauteur',
    'Conception sans accès en hauteur',
    'Automatisation des tâches'
  ],
  
  engineeringControls: [
    'Garde-corps permanents',
    'Plateformes de travail sécurisées',
    'Systèmes de protection collective',
    'Filets de sécurité'
  ],
  
  administrativeControls: [
    'Formation travail en hauteur',
    'Procédures de sécurité strictes',
    'Inspection équipements quotidienne',
    'Plan de sauvetage d\'urgence'
  ],
  
  controlMeasures: [
    'Système d\'arrêt de chute',
    'Harnais de sécurité complet',
    'Points d\'ancrage certifiés',
    'Inspection quotidienne équipements'
  ],
  
  requiredEquipment: [
    'full_body_harness_3_point',
    'shock_absorbing_lanyard',
    'temporary_anchor_point',
    'fall_arrest_system'
  ],
  
  emergencyProcedures: [
    'Secours en espace suspendu',
    'Stabilisation victimes chute',
    'Transport médical spécialisé',
    'Évaluation traumatisme rachidien'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Travail en hauteur',
    'CSA Z259 - Équipements protection chutes',
    'Code de sécurité pour travaux de construction'
  ],
  
  workTypes: ['construction', 'maintenance', 'roofing', 'tower_work'],
  
  isActive: true
});

export const fallingObjects: Hazard = createNewHazard({
  id: 'falling_objects_impact',
  name: 'Objets qui tombent',
  category: 'PHYSICAL' as any,
  subcategory: 'falling_objects',
  displayName: {
    fr: 'Chute d\'objets',
    en: 'Falling objects'
  },
  description: 'Risque de blessures par impact d\'objets tombant d\'une hauteur',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Filets de protection anti-chute',
    'Zones d\'exclusion délimitées',
    'Casques de protection obligatoires',
    'Arrimage sécuritaire des matériaux'
  ],
  
  requiredEquipment: [
    'hard_hat_class_e_electrical',
    'debris_nets_construction',
    'tool_tethering_system',
    'barricade_warning_tape'
  ],
  
  emergencyProcedures: [
    'Évacuation zone d\'impact',
    'Traitement traumatisme crânien',
    'Immobilisation victimes',
    'Transport médical d\'urgence'
  ] as any,
  
  regulatoryReferences: [
    'Code de sécurité construction',
    'RSST - Protection individuelle'
  ],
  
  workTypes: ['construction', 'demolition', 'material_handling'],
  
  isActive: true
});

export const noiseExposure: Hazard = createNewHazard({
  id: 'occupational_noise_exposure',
  name: 'Exposition au bruit',
  category: 'PHYSICAL' as any,
  subcategory: 'noise',
  displayName: {
    fr: 'Bruit excessif en milieu de travail',
    en: 'Occupational noise exposure'
  },
  description: 'Risque de perte auditive par exposition à des niveaux sonores élevés',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Réduction du bruit à la source',
    'Isolation acoustique',
    'Protection auditive individuelle',
    'Rotation des travailleurs exposés'
  ],
  
  requiredEquipment: [
    'hearing_protection_earplugs',
    'noise_cancelling_earmuffs',
    'sound_level_meter',
    'audiometric_testing_equipment'
  ],
  
  emergencyProcedures: [
    'Retrait immédiat zone bruyante',
    'Évaluation auditive d\'urgence',
    'Consultation audiologique',
    'Surveillance médicale renforcée'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Bruit en milieu de travail',
    'Règlement sur la santé et sécurité du travail'
  ],
  
  workTypes: ['manufacturing', 'construction', 'airport_operations'],
  
  isActive: true
});

export const extremeTemperatures: Hazard = createNewHazard({
  id: 'extreme_temperature_exposure',
  name: 'Températures extrêmes',
  category: 'PHYSICAL' as any,
  subcategory: 'temperature',
  displayName: {
    fr: 'Exposition températures extrêmes',
    en: 'Extreme temperature exposure'
  },
  description: 'Risque de stress thermique par exposition à chaleur ou froid extrêmes',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Contrôle climatisation/chauffage',
    'Vêtements adaptés aux conditions',
    'Pauses fréquentes en zone tempérée',
    'Hydratation régulière'
  ],
  
  requiredEquipment: [
    'cooling_vest_evaporative',
    'insulated_winter_clothing',
    'temperature_monitoring_device',
    'heated_shelter_portable'
  ],
  
  emergencyProcedures: [
    'Refroidissement/réchauffement graduel',
    'Surveillance signes vitaux',
    'Hydratation contrôlée',
    'Transport médical si nécessaire'
  ] as any,
  
  regulatoryReferences: [
    'ACGIH - Stress thermique',
    'RSST - Conditions de température'
  ],
  
  workTypes: ['outdoor_work', 'foundry_operations', 'cold_storage'],
  
  isActive: true
});

// =================== EXPORT DANGERS PHYSIQUES ===================
export const physicalHazards = [
  fallsFromHeight,
  fallingObjects,
  noiseExposure,
  extremeTemperatures
];

export const physicalHazardsById = physicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default physicalHazards;
