// app/data/hazards/chemical.ts
import { Hazard } from '../../types/hazards';

const createNewHazard = (base: any): Hazard => {
  return {
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
    ...base
  } as Hazard;
};

export const toxicGases: Hazard = createNewHazard({
  id: 'toxic_gas_exposure',
  name: 'Gaz toxiques (CO, H₂S)',
  category: 'CHEMICAL' as any,
  subcategory: 'toxic_gas',
  displayName: {
    fr: 'Exposition aux gaz toxiques',
    en: 'Toxic gas exposure'
  },
  description: 'Risque d\'intoxication par inhalation de gaz toxiques',
  severity: 'critical',
  likelihood: 'medium',
  riskLevel: 'high',
  
  eliminationMethods: [
    'Élimination des sources de gaz toxiques',
    'Substitution par des procédés sans gaz dangereux'
  ],
  
  engineeringControls: [
    'Système de ventilation d\'extraction',
    'Détection automatique de gaz',
    'Alarmes de concentration dangereuse',
    'Isolation des zones à risque'
  ],
  
  administrativeControls: [
    'Procédures de travail sécuritaires',
    'Formation sur les gaz toxiques',
    'Surveillance atmosphérique continue',
    'Plan d\'évacuation d\'urgence'
  ],
  
  controlMeasures: [
    'Détection continue de gaz',
    'Appareils respiratoires autonomes',
    'Ventilation forcée',
    'Évacuation immédiate si détection'
  ],
  
  requiredEquipment: [
    'gas_detector_multi_gas',
    'scba_full_face_30min',
    'chemical_resistant_suit',
    'emergency_escape_respirator'
  ],
  
  emergencyProcedures: [
    'Évacuation immédiate de la zone',
    'Activation alarme générale',
    'Secours avec équipement autonome',
    'Transport médical d\'urgence'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Substances dangereuses',
    'SIMDUT 2015',
    'ACGIH - Valeurs limites d\'exposition'
  ],
  
  workTypes: ['confined_space', 'industrial_maintenance', 'chemical_processing'],
  
  isActive: true
});

export const corrosiveSubstances: Hazard = createNewHazard({
  id: 'corrosive_chemical_exposure',
  name: 'Substances corrosives',
  category: 'CHEMICAL' as any,
  subcategory: 'corrosive',
  displayName: {
    fr: 'Produits chimiques corrosifs',
    en: 'Corrosive chemical substances'
  },
  description: 'Risque de brûlures chimiques par contact avec substances corrosives',
  severity: 'high',
  likelihood: 'medium',
  riskLevel: 'high',
  
  controlMeasures: [
    'Manipulation en enceinte fermée',
    'Équipements de protection chimique',
    'Douches de sécurité accessibles',
    'Neutralisants d\'urgence disponibles'
  ],
  
  requiredEquipment: [
    'chemical_resistant_gloves_neoprene',
    'face_shield_chemical_splash',
    'chemical_apron_pvc',
    'safety_boots_chemical_resistant'
  ],
  
  emergencyProcedures: [
    'Rinçage abondant eau claire 15 min',
    'Retrait vêtements contaminés',
    'Transport médical immédiat',
    'Notification centre antipoison'
  ] as any,
  
  regulatoryReferences: [
    'SIMDUT 2015 - Corrosifs',
    'RSST - Équipements de protection'
  ],
  
  workTypes: ['chemical_processing', 'laboratory_work', 'industrial_cleaning'],
  
  isActive: true
});

export const volatileOrganicCompounds: Hazard = createNewHazard({
  id: 'voc_exposure_inhalation',
  name: 'Composés organiques volatils (COV)',
  category: 'CHEMICAL' as any,
  subcategory: 'volatile_organic',
  displayName: {
    fr: 'Exposition aux COV',
    en: 'VOC exposure'
  },
  description: 'Risque d\'intoxication par inhalation de vapeurs organiques',
  severity: 'medium',
  likelihood: 'high',
  riskLevel: 'medium',
  
  controlMeasures: [
    'Ventilation locale d\'extraction',
    'Contenants hermétiques',
    'Protection respiratoire adaptée',
    'Surveillance des concentrations'
  ],
  
  requiredEquipment: [
    'organic_vapor_respirator',
    'chemical_resistant_gloves',
    'safety_goggles_indirect_vent',
    'explosion_proof_equipment'
  ],
  
  emergencyProcedures: [
    'Évacuation vers air frais',
    'Retrait vêtements contaminés',
    'Surveillance symptômes intoxication',
    'Consultation médicale si malaise'
  ] as any,
  
  regulatoryReferences: [
    'RSST - Qualité de l\'air',
    'Règlement sur l\'assainissement de l\'atmosphère'
  ],
  
  workTypes: ['painting', 'printing', 'adhesive_application'],
  
  isActive: true
});

export const carcinogenicSubstances: Hazard = createNewHazard({
  id: 'carcinogenic_substance_exposure',
  name: 'Substances cancérigènes',
  category: 'CHEMICAL' as any,
  subcategory: 'carcinogenic',
  displayName: {
    fr: 'Exposition aux cancérigènes',
    en: 'Carcinogenic exposure'
  },
  description: 'Risque de cancer par exposition à des substances cancérigènes',
  severity: 'critical',
  likelihood: 'low',
  riskLevel: 'high',
  
  controlMeasures: [
    'Élimination ou substitution prioritaire',
    'Confinement maximal',
    'Protection respiratoire totale',
    'Surveillance médicale renforcée'
  ],
  
  requiredEquipment: [
    'supplied_air_respirator_full_face',
    'chemical_protective_suit_level_b',
    'double_layer_gloves_chemically_resistant',
    'decontamination_shower_station'
  ],
  
  emergencyProcedures: [
    'Décontamination complète immédiate',
    'Surveillance médicale d\'urgence',
    'Documentation détaillée exposition',
    'Suivi médical à long terme'
  ] as any,
  
  regulatoryReferences: [
    'CIRC - Classification cancérigènes',
    'RSST - Substances cancérigènes',
    'Loi sur la santé et sécurité du travail'
  ],
  
  workTypes: ['asbestos_removal', 'chemical_manufacturing', 'research_laboratory'],
  
  isActive: true
});

export const chemicalHazards = [
  toxicGases,
  corrosiveSubstances,
  volatileOrganicCompounds,
  carcinogenicSubstances
];

export default chemicalHazards;
