// app/data/hazards/electrical.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'ELECTRICAL' as any,
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

// =================== DANGERS ÉLECTRIQUES ===================

export const electricalShock: Hazard = createNewHazard({
  id: 'electrical_shock_hazard',
  name: 'Choc électrique',
  category: 'ELECTRICAL' as any,
  subcategory: 'shock',
  description: 'Risque d\'électrocution par contact direct ou indirect',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Cadenassage/étiquetage (LOTO)',
    'Test absence de tension',
    'Équipement de protection électrique',
    'Formation sécurité électrique'
  ],
  
  requiredEquipment: [
    'electrical_insulating_gloves_class2',
    'non_contact_voltage_detector',
    'electrical_insulating_mat',
    'lockout_tagout_kit'
  ],
  
  regulatoryReferences: [
    'CSA Z462 - Sécurité électrique',
    'Code électrique du Québec',
    'RSST Art. 185-222'
  ],
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  
  isActive: true
});

export const arcFlash: Hazard = createNewHazard({
  id: 'arc_flash_hazard',
  name: 'Arc électrique',
  category: 'electrical',
  subcategory: 'arc_flash',
  description: 'Explosion d\'arc électrique causant brûlures graves',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'high',
  
  controlMeasures: [
    'Analyse d\'arc électrique',
    'Équipement protection arc',
    'Distance de sécurité',
    'Procédures de travail sécuritaires'
  ],
  
  requiredEquipment: [
    'arc_flash_protection_suit',
    'digital_multimeter_cat3',
    'electrical_safety_helmet'
  ],
  
  regulatoryReferences: [
    'CSA Z462',
    'NFPA 70E',
    'IEEE 1584'
  ],
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  
  isActive: true
});

export const electricalFire: Hazard = createNewHazard({
  id: 'electrical_fire_hazard',
  name: 'Incendie électrique',
  category: 'electrical',
  subcategory: 'fire',
  description: 'Risque d\'incendie causé par défaillance électrique',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Inspection régulière des installations',
    'Extincteurs classe C',
    'Détection précoce',
    'Coupure d\'urgence'
  ],
  
  requiredEquipment: [
    'class_c_fire_extinguisher',
    'thermal_imaging_camera',
    'emergency_power_cutoff'
  ],
  
  regulatoryReferences: [
    'Code de prévention incendie',
    'NFPA 70',
    'ULC-S524'
  ],
  
  workTypes: ['electrical_maintenance', 'fire_prevention'],
  
  isActive: true
});

// =================== EXPORT DANGERS ÉLECTRIQUES ===================
export const electricalHazards = [
  electricalShock,
  arcFlash,
  electricalFire
];

export const electricalHazardsById = electricalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default electricalHazards;
