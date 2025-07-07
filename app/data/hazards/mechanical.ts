// app/data/hazards/mechanical.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'mechanical',
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

// =================== DANGERS MÉCANIQUES ===================

export const cuttingInjuries: Hazard = createNewHazard({
  id: 'cutting_lacerations',
  name: 'Coupures et lacérations',
  category: 'mechanical',
  subcategory: 'cutting',
  description: 'Blessures par objets tranchants, lames, métal',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Gants anti-coupure',
    'Protection des lames',
    'Formation manipulation sécuritaire',
    'Élimination sécurisée objets tranchants'
  ],
  
  requiredEquipment: [
    'cut_resistant_gloves_level5',
    'safety_glasses_wraparound',
    'blade_guards',
    'sharps_disposal_container'
  ],
  
  regulatoryReferences: [
    'RSST Art. 51-70',
    'CSA Z142 - Gants protection',
    'ANSI/ISEA 105 - Résistance coupure'
  ],
  
  workTypes: ['construction_general', 'sheet_metal', 'glass_handling'],
  
  isActive: true
});

export const crushedByMachinery: Hazard = createNewHazard({
  id: 'crushing_by_equipment',
  name: 'Écrasement par machinerie',
  category: 'mechanical',
  subcategory: 'crushing',
  description: 'Écrasement par équipement lourd, pièces mobiles',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'high',
  
  controlMeasures: [
    'Cadenassage/étiquetage obligatoire',
    'Protecteurs de machines',
    'Formation sécurité machinerie',
    'Procédures de travail sécuritaires'
  ],
  
  requiredEquipment: [
    'lockout_tagout_kit',
    'machine_guards',
    'proximity_sensors',
    'emergency_stop_devices'
  ],
  
  regulatoryReferences: [
    'RSST Art. 182-205',
    'CSA Z432 - Sécurité machines',
    'CSA Z460 - Cadenassage'
  ],
  
  workTypes: ['heavy_machinery', 'manufacturing', 'maintenance'],
  
  isActive: true
});

export const pincingTrapping: Hazard = createNewHazard({
  id: 'pinning_trapping_hazard',
  name: 'Pincement et coincement',
  category: 'mechanical',
  subcategory: 'pinching',
  description: 'Coincement de membres dans mécanismes',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Protecteurs anti-pincement',
    'Dispositifs de sécurité',
    'Formation identification risques',
    'Vêtements ajustés'
  ],
  
  requiredEquipment: [
    'pinch_point_guards',
    'proximity_safety_devices',
    'fitted_work_clothing',
    'safety_awareness_training'
  ],
  
  regulatoryReferences: [
    'RSST - Sécurité machines',
    'CSA Z432',
    'ISO 13849 - Sécurité machines'
  ],
  
  workTypes: ['manufacturing', 'assembly_work', 'conveyor_systems'],
  
  isActive: true
});

export const flyingDebris: Hazard = createNewHazard({
  id: 'flying_particles_debris',
  name: 'Projections et éclats',
  category: 'mechanical',
  subcategory: 'projectiles',
  description: 'Projection de particules, copeaux, étincelles',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Protection oculaire obligatoire',
    'Écrans de protection',
    'Nettoyage régulier zones travail',
    'Formation port EPI'
  ],
  
  requiredEquipment: [
    'safety_glasses_wraparound',
    'face_shield_polycarbonate',
    'protective_screens',
    'dust_collection_system'
  ],
  
  regulatoryReferences: [
    'RSST Art. 45-50',
    'CSA Z94.3 - Protection oculaire',
    'ANSI Z87.1'
  ],
  
  workTypes: ['grinding', 'welding', 'cutting', 'drilling'],
  
  isActive: true
});

// =================== EXPORT DANGERS MÉCANIQUES ===================
export const mechanicalHazards = [
  cuttingInjuries,
  crushedByMachinery,
  pincingTrapping,
  flyingDebris
];

export const mechanicalHazardsById = mechanicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default mechanicalHazards;
