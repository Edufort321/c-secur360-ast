// app/data/hazards/mechanical.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS MÉCANIQUES ===================

export const movingParts: Hazard = createNewHazard({
  id: 'moving_mechanical_parts',
  name: 'Pièces mobiles',
  category: 'mechanical',
  subcategory: 'moving_parts',
  displayName: {
    fr: 'Pièces mobiles en mouvement',
    en: 'Moving mechanical parts'
  },
  description: 'Risque de happement, écrasement ou coupure par des pièces mobiles en mouvement',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Arrêt complet de l\'équipement',
    'Consignation LOTO',
    'Blocage mécanique'
  ],
  
  substitutionOptions: [
    'Outils à distance',
    'Maintenance prédictive',
    'Équipements sans pièces mobiles exposées'
  ],
  
  engineeringControls: [
    'Protecteurs fixes',
    'Protecteurs mobiles verrouillés',
    'Dispositifs de protection sensibles',
    'Barrières lumineuses',
    'Arrêts d\'urgence accessibles'
  ],
  
  administrativeControls: [
    'Procédures LOTO strictes',
    'Formation sécurité machine',
    'Inspection pré-utilisation',
    'Signalisation de danger',
    'Supervision des travaux'
  ],
  
  ppeRequirements: [
    'Gants résistants à la coupure',
    'Vêtements ajustés',
    'Chaussures de sécurité',
    'Lunettes de protection'
  ],
  
  requiredEquipment: [
    'lockout_kit',
    'ppe_cut_resistant_gloves',
    'safety_harness',
    'emergency_stop_device'
  ],
  
  recommendedEquipment: [
    'portable_guards',
    'warning_signs',
    'communication_device'
  ],
  
  regulations: {
    csa: ['CSA Z432', 'CSA Z434'],
    rsst: ['Section IX - Machines', 'Art. 173-184'],
    other: ['ISO 12100', 'ISO 13849']
  },
  
  requiredTraining: [
    'Sécurité machines',
    'Procédures LOTO',
    'Reconnaissance des dangers'
  ],
  
  certificationRequired: false,
  monitoringRequired: true,
  inspectionFrequency: 'Avant chaque utilisation',
  
  emergencyProcedures: [
    'Activation arrêt d\'urgence',
    'Couper alimentation principale',
    'Appeler premiers secours',
    'Libérer personne coincée si sécuritaire',
    'Sécuriser la zone'
  ],
  
  firstAidMeasures: [
    'Évaluer gravité blessures',
    'Contrôler saignements',
    'Immobiliser fractures',
    'Surveiller état de choc'
  ],
  
  tags: ['loto', 'machines', 'formation_obligatoire']
});

export const hydraulicSystems: Hazard = createNewHazard({
  id: 'hydraulic_pressure',
  name: 'Systèmes hydrauliques',
  category: 'mechanical',
  subcategory: 'pressure_systems',
  displayName: {
    fr: 'Systèmes hydrauliques sous pression',
    en: 'Hydraulic pressure systems'
  },
  description: 'Risque de projection de fluide hydraulique sous haute pression',
  severity: 4,
  probability: 2,
  
  eliminationMethods: [
    'Dépressurisation complète',
    'Purge du système',
    'Consignation hydraulique'
  ],
  
  engineeringControls: [
    'Écrans de protection',
    'Limiteurs de pression',
    'Soupapes de sécurité',
    'Raccords haute pression certifiés'
  ],
  
  administrativeControls: [
    'Procédures de dépressurisation',
    'Inspection des flexibles',
    'Test de pression régulier',
    'Marquage des zones à risque'
  ],
  
  ppeRequirements: [
    'Lunettes étanches',
    'Gants résistants à l\'huile',
    'Vêtements résistants chimiques',
    'Chaussures antidérapantes'
  ],
  
  requiredEquipment: [
    'pressure_gauge',
    'hydraulic_tools',
    'spill_kit',
    'pressure_relief_valve'
  ],
  
  regulations: {
    csa: ['CSA B51'],
    rsst: ['Section XI - Appareils sous pression'],
    other: ['ASME Section VIII']
  },
  
  requiredTraining: [
    'Systèmes hydrauliques',
    'Sécurité fluides sous pression',
    'Premiers secours chimiques'
  ],
  
  emergencyProcedures: [
    'Arrêt pompe hydraulique',
    'Évacuer zone de projection',
    'Rinçage abondant si contact',
    'Appeler secours si blessure grave'
  ],
  
  tags: ['haute_pression', 'fluides', 'formation_technique']
});

export const liftingEquipment: Hazard = createNewHazard({
  id: 'lifting_dropping_loads',
  name: 'Équipements de levage',
  category: 'mechanical',
  subcategory: 'lifting',
  displayName: {
    fr: 'Chute de charges / Équipements de levage',
    en: 'Lifting equipment / Dropping loads'
  },
  description: 'Risque de chute de charges ou défaillance d\'équipements de levage',
  severity: 5,
  probability: 2,
  
  eliminationMethods: [
    'Éliminer besoin de levage',
    'Conception sans levage',
    'Transport au sol'
  ],
  
  substitutionOptions: [
    'Équipements plus légers',
    'Systèmes de convoyage',
    'Levage assisté mécaniquement'
  ],
  
  engineeringControls: [
    'Dispositifs anti-chute',
    'Limiteurs de charge',
    'Signalisation sonore/visuelle',
    'Zones d\'exclusion marquées'
  ],
  
  administrativeControls: [
    'Plan de levage détaillé',
    'Inspection équipements certifiée',
    'Formation grutier/élingueur',
    'Signaleur qualifié',
    'Permis de levage'
  ],
  
  ppeRequirements: [
    'Casque de sécurité',
    'Chaussures de sécurité',
    'Gants de manutention',
    'Gilet haute visibilité'
  ],
  
  requiredEquipment: [
    'certified_crane',
    'load_block',
    'slings_certified',
    'communication_radio'
  ],
  
  recommendedEquipment: [
    'load_monitoring_system',
    'taglines',
    'lifting_plan_chart'
  ],
  
  regulations: {
    csa: ['CSA B167', 'CSA Z150'],
    rsst: ['Section XII - Appareils de levage'],
    other: ['CSA A344', 'ASME B30']
  },
  
  requiredTraining: [
    'Conduite grue/palan',
    'Élingage sécuritaire',
    'Signalisation levage',
    'Inspection équipements'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Quotidienne',
  
  emergencyProcedures: [
    'Évacuer zone de danger',
    'Arrêter opération levage',
    'Sécuriser charge si possible',
    'Appeler secours si accident'
  ],
  
  tags: ['levage', 'certification_operateur', 'inspection_quotidienne']
});

export const compressedAir: Hazard = createNewHazard({
  id: 'compressed_air_systems',
  name: 'Air comprimé',
  category: 'mechanical',
  subcategory: 'pressure_systems',
  displayName: {
    fr: 'Systèmes d\'air comprimé',
    en: 'Compressed air systems'
  },
  description: 'Risque de blessures par projection d\'air comprimé ou éclatement',
  severity: 3,
  probability: 3,
  
  eliminationMethods: [
    'Dépressurisation avant intervention',
    'Isolation complète circuit'
  ],
  
  engineeringControls: [
    'Régulateurs de pression',
    'Soupapes de décharge',
    'Flexibles renforcés',
    'Raccords sécurisés'
  ],
  
  administrativeControls: [
    'Pression limitée selon usage',
    'Interdiction nettoyage corporel',
    'Inspection des flexibles',
    'Formation utilisation sécuritaire'
  ],
  
  ppeRequirements: [
    'Lunettes de sécurité',
    'Protection auditive',
    'Gants antidérapants'
  ],
  
  requiredEquipment: [
    'pressure_regulator',
    'safety_nozzles',
    'pressure_gauge'
  ],
  
  regulations: {
    csa: ['CSA B51'],
    rsst: ['Section XI'],
    other: ['OSHA 1910.95']
  },
  
  emergencyProcedures: [
    'Fermer alimentation air',
    'Évacuer si blessure grave',
    'Premiers secours si projection débris'
  ],
  
  tags: ['air_comprime', 'pression', 'formation_usage']
});

// =================== EXPORT DANGERS MÉCANIQUES ===================
export const mechanicalHazards = [
  movingParts,
  hydraulicSystems,
  liftingEquipment,
  compressedAir
];

export const mechanicalHazardsById = mechanicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default mechanicalHazards;
