// app/data/hazards/gas.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Fonction helper pour créer un danger
const createNewHazard = (base: any): Hazard => {
  return {
    category: 'GASL' as any,
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
  category: 'GAS' as any,
  subcategory: 'natural_gas',
  displayName: {
    fr: 'Fuite de gaz naturel',
    en: 'Natural gas leak'
  },
  description: 'Risque d\'explosion, asphyxie par fuite de gaz',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Élimination des sources de gaz',
    'Systèmes de détection précoce',
    'Isolation automatique des fuites'
  ],
  
  engineeringControls: [
    'Détection automatique de gaz',
    'Ventilation forcée continue',
    'Vannes d\'arrêt automatiques',
    'Systèmes d\'alarme intégrés'
  ],
  
  administrativeControls: [
    'Procédures d\'urgence gaz',
    'Formation détection de fuites',
    'Inspection régulière équipements',
    'Plan d\'évacuation d\'urgence'
  ],
  
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
  
  emergencyProcedures: [
    'Coupure alimentation gaz immédiate',
    'Évacuation zone dangereuse',
    'Élimination sources d\'ignition',
    'Ventilation forcée de la zone'
  ] as any,
  
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
  category: 'GAS' as any,
  subcategory: 'toxic_gas',
  displayName: {
    fr: 'Exposition au sulfure d\'hydrogène',
    en: 'Hydrogen sulfide exposure'
  },
  description: 'Gaz toxique mortel à faible concentration',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'critical',
  
  eliminationMethods: [
    'Élimination sources H₂S',
    'Processus sans production H₂S',
    'Confinement total des sources'
  ],
  
  engineeringControls: [
    'Détection H₂S automatique',
    'Ventilation d\'extraction locale',
    'Systèmes d\'alarme multi-niveaux',
    'Neutralisation automatique'
  ],
  
  administrativeControls: [
    'Formation spécialisée H₂S',
    'Procédures d\'urgence strictes',
    'Surveillance atmosphérique',
    'Plan de sauvetage d\'urgence'
  ],
  
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
  
  emergencyProcedures: [
    'Évacuation immédiate zone H₂S',
    'Réanimation avec oxygène pur',
    'Transport médical d\'urgence',
    'Surveillance neurologique continue'
  ] as any,
  
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
  category: 'GAS' as any,
  subcategory: 'toxic_gas',
  displayName: {
    fr: 'Intoxication au monoxyde de carbone',
    en: 'Carbon monoxide poisoning'
  },
  description: 'Intoxication par CO, gaz inodore et mortel',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Élimination combustion incomplète',
    'Équipements électriques purs',
    'Processus sans combustion'
  ],
  
  engineeringControls: [
    'Détection CO automatique',
    'Ventilation d\'extraction forcée',
    'Entretien préventif équipements',
    'Isolation zones combustion'
  ],
  
  administrativeControls: [
    'Formation reconnaissance CO',
    'Procédures entretien équipements',
    'Surveillance atmosphérique',
    'Protocoles d\'urgence CO'
  ],
  
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
  
  emergencyProcedures: [
    'Évacuation vers air frais',
    'Oxygénothérapie immédiate',
    'Transport centre hyperbare',
    'Surveillance cardiaque continue'
  ] as any,
  
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
  category: 'GAS' as any,
  subcategory: 'atmosphere',
  displayName: {
    fr: 'Atmosphère déficiente en oxygène',
    en: 'Oxygen deficient atmosphere'
  },
  description: 'Atmosphère avec moins de 19.5% d\'oxygène',
  severity: 'critical',
  likelihood: 'high',
  riskLevel: 'critical',
  
  eliminationMethods: [
    'Éviter espaces confinés',
    'Ventilation naturelle continue',
    'Élimination gaz inertes'
  ],
  
  engineeringControls: [
    'Surveillance O₂ automatique',
    'Ventilation forcée continue',
    'Alarmes déficience oxygène',
    'Injection oxygène automatique'
  ],
  
  administrativeControls: [
    'Procédures espaces confinés',
    'Tests atmosphériques obligatoires',
    'Surveillance continue personnel',
    'Formation sauvetage d\'urgence'
  ],
  
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
  
  emergencyProcedures: [
    'Évacuation immédiate',
    'Oxygénation d\'urgence',
    'Réanimation si nécessaire',
    'Surveillance médicale prolongée'
  ] as any,
  
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
  acc[(hazard as any).id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default gasHazards;
