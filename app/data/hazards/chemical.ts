// app/data/hazards/chemical.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'CHEMICAL' as any,
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

// =================== DANGERS CHIMIQUES ===================

export const toxicGases: Hazard = createNewHazard({
  id: 'toxic_gas_exposure',
  name: 'Gaz toxiques',
  category: 'CHEMICAL' as any,
  subcategory: 'toxic_gases',
  description: 'Exposition à des gaz toxiques (CO, H2S, etc.)',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Détection continue des gaz',
    'Ventilation forcée',
    'Protection respiratoire',
    'Évacuation d\'urgence'
  ],
  
  requiredEquipment: [
    'gas_detector_4_gas',
    'scba_30_minute_carbon',
    'emergency_evacuation_kit'
  ],
  
  regulatoryReferences: [
    'RSST - Espaces confinés',
    'CSA Z1611 - Espaces confinés'
  ],
  
  workTypes: ['confined_space', 'gas_maintenance'],
  
  isActive: true
});

export const corrosiveSubstances: Hazard = createNewHazard({
  id: 'corrosive_chemical_exposure',
  name: 'Substances corrosives',
  category: 'chemical',
  subcategory: 'corrosive',
  description: 'Contact avec acides, bases et substances corrosives',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Équipement de protection chimique',
    'Stations de rinçage d\'urgence',
    'Manipulation sécurisée',
    'Formation SIMDUT'
  ],
  
  requiredEquipment: [
    'chemical_resistant_gloves_nitrile',
    'chemical_resistant_boots_pvc',
    'safety_goggles_chemical'
  ],
  
  regulatoryReferences: [
    'SIMDUT 2015',
    'RSST - Substances dangereuses'
  ],
  
  workTypes: ['environmental_cleanup', 'chemical_handling'],
  
  isActive: true
});

export const volatileOrganicCompounds: Hazard = createNewHazard({
  id: 'voc_exposure',
  name: 'Composés organiques volatils',
  category: 'chemical',
  subcategory: 'volatile_organic',
  description: 'Exposition aux COV par inhalation ou contact cutané',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Ventilation locale',
    'Protection respiratoire',
    'Surveillance de l\'air',
    'Limitation du temps d\'exposition'
  ],
  
  requiredEquipment: [
    'full_face_mask_organic_vapor',
    'air_quality_monitor_voc',
    'chemical_resistant_gloves_nitrile'
  ],
  
  regulatoryReferences: [
    'ACGIH TLV',
    'Santé Canada - Qualité de l\'air'
  ],
  
  workTypes: ['construction_general', 'painting', 'cleaning'],
  
  isActive: true
});

// =================== EXPORT DANGERS CHIMIQUES ===================
export const chemicalHazards = [
  toxicGases,
  corrosiveSubstances,
  volatileOrganicCompounds
];

export const chemicalHazardsById = chemicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default chemicalHazards;
