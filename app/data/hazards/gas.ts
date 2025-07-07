// app/data/hazards/gas.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: Partial<Hazard>): Hazard => {
  return {
    // Valeurs par défaut
    category: 'gas',
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

// =================== DANGERS GAZEUX ===================

export const gasLeak: Hazard = createNewHazard({
  id: 'natural_gas_leak',
  name: 'Fuite de gaz naturel',
  category: 'gas',
  subcategory: 'natural_gas',
  description: 'Risque d\'explosion, asphyxie par fuite de gaz',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Détection continue de gaz',
    'Ventilation forcée',
    'Élimination sources d\'ignition',
    'Évacuation d\'urgence'
  ],
  
  requiredEquipment: [
    'gas_detector_4_gas',
    'explosion_proof_lighting',
    'emergency_gas_shutoff',
    'scba_30_minute_carbon'
  ],
  
  regulatoryReferences: [
    'CSA Z662 - Réseaux gaziers',
    'Règlement gazier provincial',
    'RSST Art. 280-300'
  ],
  
  workTypes: ['gas_maintenance', 'pipeline_inspection', 'excavation'],
  
  isActive: true
});

export const hydrogenSulfide: Hazard = createNewHazard({
  id: 'hydrogen_sulfide_exposure',
  name: 'Sulfure d\'hydrogène (H₂S)',
  category: 'gas',
  subcategory: 'toxic_gas',
  description: 'Gaz toxique mortel à faible concentration',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'critical',
  
  controlMeasures: [
    'Détection H₂S obligatoire',
    'Appareil respiratoire autonome',
    'Procédures d\'urgence H₂S',
    'Formation spécialisée'
  ],
  
  requiredEquipment: [
    'h2s_detector_personal',
    'scba_escape_respirator',
    'h2s_antidote_kit',
    'emergency_rescue_equipment'
  ],
  
  regulatoryReferences: [
    'RSST - Gaz toxiques',
    'ACGIH TLV - H₂S',
    'API RP 55 - H₂S'
  ],
  
  workTypes: ['confined_space', 'environmental_cleanup', 'gas_maintenance'],
  
  isActive: true
});

export const carbonMonoxide: Hazard = createNewHazard({
  id: 'carbon_monoxide_poisoning',
  name: 'Monoxyde de carbone (CO)',
  category: 'gas',
  subcategory: 'toxic_gas',
  description: 'Intoxication par CO, gaz inodore et mortel',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Détection CO continue',
    'Ventilation adéquate',
    'Entretien équipements combustion',
    'Formation reconnaissance symptômes'
  ],
  
  requiredEquipment: [
    'co_detector_personal',
    'forced_ventilation_system',
    'co_antidote_oxygen',
    'emergency_evacuation_alarm'
  ],
  
  regulatoryReferences: [
    'RSST - Atmosphères dangereuses',
    'ACGIH TLV - CO',
    'CSA B149 - Combustibles gazeux'
  ],
  
  workTypes: ['confined_space', 'welding', 'heating_systems'],
  
  isActive: true
});

export const oxygenDeficiency: Hazard = createNewHazard({
  id: 'oxygen_deficient_atmosphere',
  name: 'Déficience en oxygène',
  category: 'gas',
  subcategory: 'atmosphere',
  description: 'Atmosphère avec moins de 19.5% d\'oxygène',
  severity: 'critical',
  likelihood: 'high',
  riskLevel: 'critical',
  
  controlMeasures: [
    'Test atmosphérique obligatoire',
    'Ventilation forcée continue',
    'Surveillance constante O₂',
    'Appareil respiratoire autonome'
  ],
  
  requiredEquipment: [
    'oxygen_meter_calibrated',
    'supplied_air_respirator_hose',
    'emergency_oxygen_supply',
    'atmospheric_monitoring_system'
  ],
  
  regulatoryReferences: [
    'CSA Z1611 - Espaces confinés',
    'RSST - Atmosphères dangereuses',
    'OSHA 1910.146'
  ],
  
  workTypes: ['confined_space', 'underground_work', 'tank_cleaning'],
  
  isActive: true
});

// =================== EXPORT DANGERS GAZEUX ===================
export const gasHazards = [
  gasLeak,
  hydrogenSulfide,
  carbonMonoxide,
  oxygenDeficiency
];

export const gasHazardsById = gasHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default gasHazards;
