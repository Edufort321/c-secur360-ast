// app/data/hazards/ergonomic.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'ERGONOMIC' as any,
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

// =================== DANGERS ERGONOMIQUES ===================

export const repetitiveStrain: Hazard = createNewHazard({
  id: 'repetitive_strain_injury',
  name: 'Troubles musculo-squelettiques',
  category: 'ergonomic',
  subcategory: 'repetitive_motion',
  description: 'Lésions par mouvements répétitifs, postures contraignantes',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Rotation des tâches',
    'Pauses fréquentes',
    'Équipement ergonomique',
    'Formation postures de travail'
  ],
  
  requiredEquipment: [
    'ergonomic_support_belt',
    'anti_vibration_gloves',
    'knee_protection_pads',
    'ergonomic_tools'
  ],
  
  regulatoryReferences: [
    'RSST Art. 166-184',
    'CSA Z412 - Ergonomie bureau',
    'IRSST - Prévention TMS'
  ],
  
  workTypes: ['construction_general', 'assembly_work', 'office_work'],
  
  isActive: true
});

export const heavyLifting: Hazard = createNewHazard({
  id: 'manual_handling_heavy_loads',
  name: 'Manutention manuelle',
  category: 'ergonomic',
  subcategory: 'lifting',
  description: 'Soulèvement, transport de charges lourdes',
  severity: 'high',
  likelihood: 'high',
  riskLevel: 'high',
  
  controlMeasures: [
    'Techniques de levage sécuritaires',
    'Équipement de manutention mécanique',
    'Travail en équipe',
    'Limitation poids maximal'
  ],
  
  requiredEquipment: [
    'lifting_belt_support',
    'mechanical_lifting_aid',
    'dolly_cart',
    'safety_boots_steel'
  ],
  
  regulatoryReferences: [
    'RSST Art. 166-184',
    'Guide CNESST - Manutention',
    'CSA Z365 - Manutention'
  ],
  
  workTypes: ['construction_general', 'warehouse_work', 'moving'],
  
  isActive: true
});

export const awkwardPostures: Hazard = createNewHazard({
  id: 'awkward_working_postures',
  name: 'Postures contraignantes',
  category: 'ergonomic',
  subcategory: 'posture',
  description: 'Travail en position inconfortable prolongée',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Aménagement postes de travail',
    'Supports et appuis',
    'Changements fréquents de position',
    'Étirements réguliers'
  ],
  
  requiredEquipment: [
    'kneeling_pads',
    'adjustable_work_platform',
    'lumbar_support',
    'ergonomic_cushions'
  ],
  
  regulatoryReferences: [
    'RSST - Postes de travail',
    'IRSST - Ergonomie',
    'ISO 11226 - Postures'
  ],
  
  workTypes: ['construction_general', 'confined_space', 'maintenance'],
  
  isActive: true
});

export const vibrationExposure: Hazard = createNewHazard({
  id: 'hand_arm_vibration',
  name: 'Exposition aux vibrations',
  category: 'ergonomic',
  subcategory: 'vibration',
  description: 'Vibrations main-bras par outils mécaniques',
  severity: 'medium',
  likelihood: 'medium',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Outils anti-vibration',
    'Limitation temps d\'exposition',
    'Gants anti-vibration',
    'Maintenance outils'
  ],
  
  requiredEquipment: [
    'anti_vibration_gloves',
    'vibration_dampening_tools',
    'vibration_meter',
    'ergonomic_tool_handles'
  ],
  
  regulatoryReferences: [
    'RSST Art. 206',
    'ISO 5349 - Vibrations',
    'ACGIH TLV - Vibrations'
  ],
  
  workTypes: ['construction_general', 'excavation', 'demolition'],
  
  isActive: true
});

// =================== EXPORT DANGERS ERGONOMIQUES ===================
export const ergonomicHazards = [
  repetitiveStrain,
  heavyLifting,
  awkwardPostures,
  vibrationExposure
];

export const ergonomicHazardsById = ergonomicHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default ergonomicHazards;
