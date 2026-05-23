// app/data/hazards/mechanical.ts
import { Hazard } from '../../types/hazards';

const createNewHazard = (base: any): Hazard => {
  return {
    category: 'MECHANICAL' as any,
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
    ...base
  } as Hazard;
};

export const cuttingLacerations: Hazard = createNewHazard({
  id: 'cutting_laceration_injuries',
  name: 'Coupures et lacérations',
  category: 'MECHANICAL' as any,
  subcategory: 'cutting',
  displayName: {
    fr: 'Blessures par objets tranchants',
    en: 'Cutting and laceration injuries'
  },
  description: 'Risque de coupures par outils tranchants ou surfaces coupantes',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  eliminationMethods: [
    'Élimination objets tranchants inutiles',
    'Automatisation opérations de coupe',
    'Conception sécuritaire des outils'
  ],
  
  engineeringControls: [
    'Protecteurs de lames automatiques',
    'Dispositifs de maintien des pièces',
    'Lames rétractables sécurisées',
    'Surfaces arrondies non coupantes'
  ],
  
  administrativeControls: [
    'Formation manipulation sécuritaire',
    'Procédures de rangement',
    'Inspection régulière des outils',
    'Remplacement lames émoussées'
  ],
  
  controlMeasures: [
    'Gants résistants aux coupures',
    'Techniques de manipulation sécuritaires',
    'Rangement sécurisé des outils',
    'Inspection avant utilisation'
  ],
  
  requiredEquipment: [
    'cut_resistant_gloves_level_5',
    'safety_knife_retractable',
    'cut_resistant_sleeves',
    'metal_mesh_protective_apron'
  ],
  
  emergencyProcedures: [
    'Contrôle saignement par compression',
    'Nettoyage plaie eau stérile',
    'Pansement stérile immédiat',
    'Transport médical selon gravité'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Protection des mains',
    'ANSI/ISEA 105 - Gants résistants coupures'
  ],
  
  workTypes: ['manufacturing', 'food_processing', 'glass_handling'],
  
  isActive: true
});

export const machineCrushing: Hazard = createNewHazard({
  id: 'crushing_by_machinery',
  name: 'Écrasement par machinerie',
  category: 'MECHANICAL' as any,
  subcategory: 'crushing',
  displayName: {
    fr: 'Écrasement par équipements',
    en: 'Crushing by machinery'
  },
  description: 'Risque d\'écrasement par pièces mobiles de machinerie',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Protecteurs de machines verrouillés',
    'Dispositifs d\'arrêt d\'urgence',
    'Cadenassage/étiquetage obligatoire',
    'Zone d\'exclusion délimitée'
  ],
  
  requiredEquipment: [
    'lockout_tagout_devices',
    'emergency_stop_buttons',
    'machine_guard_interlocks',
    'safety_light_curtains'
  ],
  
  emergencyProcedures: [
    'Arrêt machine immédiat',
    'Stabilisation victimes écrasement',
    'Évacuation médicale spécialisée',
    'Surveillance compression prolongée'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Sécurité des machines',
    'CSA Z432 - Protecteurs de machines'
  ],
  
  workTypes: ['manufacturing', 'heavy_machinery_operation', 'maintenance'],
  
  isActive: true
});

export const caughtInBetween: Hazard = createNewHazard({
  id: 'caught_pinched_between',
  name: 'Pincement et coincement',
  category: 'MECHANICAL' as any,
  subcategory: 'pinching',
  displayName: {
    fr: 'Coincement entre objets',
    en: 'Caught or pinched between objects'
  },
  description: 'Risque de pincement entre pièces mobiles ou objets',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Espacement sécuritaire maintenu',
    'Protecteurs anti-pincement',
    'Procédures d\'approche sécuritaires',
    'Signalisation zones dangereuses'
  ],
  
  requiredEquipment: [
    'pinch_point_guards',
    'proximity_sensors_safety',
    'warning_signs_pinch_points',
    'safety_switches_position'
  ],
  
  emergencyProcedures: [
    'Libération immédiate si possible',
    'Stabilisation partie coincée',
    'Évacuation sans traction',
    'Surveillance circulation sanguine'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Points de pincement',
    'Code sécurité machines industrielles'
  ],
  
  workTypes: ['conveyor_operation', 'press_operation', 'assembly_work'],
  
  isActive: true
});

export const flyingDebris: Hazard = createNewHazard({
  id: 'flying_debris_projectiles',
  name: 'Projections et éclats',
  category: 'MECHANICAL' as any,
  subcategory: 'projectiles',
  displayName: {
    fr: 'Éclats et projections',
    en: 'Flying debris and projectiles'
  },
  description: 'Risque de blessures par éclats ou projections de matières',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Écrans de protection transparents',
    'Protection oculaire obligatoire',
    'Enceintes de confinement',
    'Aspiration des poussières'
  ],
  
  requiredEquipment: [
    'safety_glasses_side_shields',
    'face_shield_impact_resistant',
    'protective_screens_transparent',
    'dust_collection_system'
  ],
  
  emergencyProcedures: [
    'Rinçage oculaire abondant',
    'Retrait corps étrangers superficiels',
    'Consultation ophtalmologique',
    'Pansement stérile plaies'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Protection oculaire',
    'CSA Z94.3 - Protection des yeux'
  ],
  
  workTypes: ['grinding', 'welding', 'demolition'],
  
  isActive: true
});

export const mechanicalHazards = [
  cuttingLacerations,
  machineCrushing,
  caughtInBetween,
  flyingDebris
];

export default mechanicalHazards;
