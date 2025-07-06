// app/data/hazards/chemical.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS CHIMIQUES ===================

export const hazardousChemicals: Hazard = createNewHazard({
  id: 'hazardous_chemical_exposure',
  name: 'Produits chimiques dangereux',
  category: 'chemical',
  subcategory: 'toxic_exposure',
  displayName: {
    fr: 'Exposition produits chimiques dangereux',
    en: 'Hazardous chemical exposure'
  },
  description: 'Risque d\'intoxication, brûlures chimiques ou réactions allergiques',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Éliminer utilisation produits toxiques',
    'Processus sans chimiques',
    'Automatisation complète'
  ],
  
  substitutionOptions: [
    'Produits moins dangereux',
    'Solutions aqueuses vs solvants',
    'Produits biodégradables',
    'Concentrations réduites'
  ],
  
  engineeringControls: [
    'Ventilation d\'extraction locale',
    'Enceintes fermées',
    'Systèmes de captage à la source',
    'Douches de sécurité',
    'Lave-yeux d\'urgence'
  ],
  
  administrativeControls: [
    'Fiches de données de sécurité (FDS)',
    'Formation SIMDUT',
    'Procédures de manipulation',
    'Surveillance médicale',
    'Limitation temps d\'exposition'
  ],
  
  ppeRequirements: [
    'Gants résistants chimiques',
    'Lunettes étanches ou écran facial',
    'Vêtements de protection chimique',
    'Appareil respiratoire approprié'
  ],
  
  requiredEquipment: [
    'chemical_resistant_gloves',
    'chemical_safety_goggles',
    'chemical_suit',
    'eyewash_station',
    'emergency_shower'
  ],
  
  recommendedEquipment: [
    'gas_detector_specific',
    'spill_kit_chemical',
    'neutralizing_agents'
  ],
  
  regulations: {
    csa: ['CSA Z94.4', 'CSA Z180.1'],
    rsst: ['Section IV - Substances dangereuses'],
    other: ['SIMDUT 2015', 'Loi canadienne sur la protection de l\'environnement']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 15,
      unit: 'km/h',
      description: 'Risque dispersion vapeurs'
    },
    {
      condition: 'temperature',
      operator: '>',
      value: 30,
      unit: '°C',
      description: 'Évaporation accélérée'
    }
  ],
  
  requiredTraining: [
    'SIMDUT 2015',
    'Manipulation produits chimiques',
    'Premiers secours chimiques',
    'Utilisation équipements protection'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Avant chaque utilisation',
  
  emergencyProcedures: [
    'Évacuer zone contaminée',
    'Rinçage abondant 15+ minutes',
    'Retirer vêtements contaminés',
    'Appeler Centre antipoison',
    'Transport médical urgent'
  ],
  
  firstAidMeasures: [
    'Rinçage cutané/oculaire prolongé',
    'Surveillance détresse respiratoire',
    'Position de récupération',
    'Apporter FDS à l\'hôpital'
  ],
  
  tags: ['simdut', 'fds_obligatoire', 'surveillance_medicale', 'rinçage_urgence']
});

export const asbestosExposure: Hazard = createNewHazard({
  id: 'asbestos_fiber_exposure',
  name: 'Exposition amiante',
  category: 'chemical',
  subcategory: 'carcinogenic',
  displayName: {
    fr: 'Exposition fibres d\'amiante',
    en: 'Asbestos fiber exposure'
  },
  description: 'Risque d\'inhalation de fibres d\'amiante cancérigènes',
  severity: 5,
  probability: 2,
  
  eliminationMethods: [
    'Désamiantage professionnel préalable',
    'Évitement zones contaminées',
    'Méthodes sans perturbation'
  ],
  
  substitutionOptions: [
    'Matériaux sans amiante',
    'Encapsulation vs désamiantage',
    'Méthodes humides'
  ],
  
  engineeringControls: [
    'Enceintes sous pression négative',
    'Filtration HEPA',
    'Sas de décontamination',
    'Surveillance atmosphérique continue'
  ],
  
  administrativeControls: [
    'Permis de désamiantage',
    'Entrepreneur certifié seulement',
    'Formation spécialisée amiante',
    'Surveillance médicale spéciale',
    'Registre d\'exposition'
  ],
  
  ppeRequirements: [
    'Respirateur P100 ou SCBA',
    'Combinaison jetable complète',
    'Gants jetables',
    'Bottes couvrantes',
    'Protection oculaire'
  ],
  
  requiredEquipment: [
    'hepa_respirator_p100',
    'disposable_coveralls',
    'decontamination_unit',
    'air_monitoring_system'
  ],
  
  regulations: {
    csa: ['CSA Z94.4'],
    rsst: ['Règlement amiante'],
    other: ['Loi sur la santé et sécurité du travail']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 10,
      unit: 'km/h',
      description: 'Dispersion fibres - travaux extérieurs'
    }
  ],
  
  requiredTraining: [
    'Formation amiante 16h minimum',
    'Procédures décontamination',
    'Utilisation équipements spécialisés'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Continue pendant travaux',
  
  emergencyProcedures: [
    'Arrêt immédiat travaux',
    'Confinement zone',
    'Décontamination d\'urgence',
    'Surveillance médicale immédiate'
  ],
  
  tags: ['amiante', 'cancerigene', 'entrepreneur_certifie', 'surveillance_medicale_speciale']
});

export const solventsVapors: Hazard = createNewHazard({
  id: 'organic_solvents_vapors',
  name: 'Vapeurs de solvants',
  category: 'chemical',
  subcategory: 'vapors_gases',
  displayName: {
    fr: 'Vapeurs de solvants organiques',
    en: 'Organic solvent vapors'
  },
  description: 'Risque d\'intoxication par inhalation de vapeurs de solvants',
  severity: 3,
  probability: 4,
  
  eliminationMethods: [
    'Solvants à base d\'eau',
    'Processus mécaniques',
    'Élimination dégraissage chimique'
  ],
  
  substitutionOptions: [
    'Solvants moins volatils',
    'Nettoyage ultrasons',
    'Dégraissage CO2 supercritique'
  ],
  
  engineeringControls: [
    'Ventilation d\'extraction efficace',
    'Enceintes fermées',
    'Récupération vapeurs',
    'Systèmes de lavage'
  ],
  
  administrativeControls: [
    'Mesures atmosphériques',
    'Limitation temps exposition',
    'Rotation du personnel',
    'Formation vapeurs organiques'
  ],
  
  ppeRequirements: [
    'Respirateur avec cartouches organiques',
    'Gants nitrile résistants',
    'Vêtements anti-statiques'
  ],
  
  requiredEquipment: [
    'organic_vapor_respirator',
    'vapor_detector',
    'explosion_proof_ventilation'
  ],
  
  regulations: {
    csa: ['CSA Z94.4'],
    rsst: ['Valeurs d\'exposition'],
    other: ['ACGIH TLVs']
  },
  
  weatherRestrictions: [
    {
      condition: 'temperature',
      operator: '>',
      value: 25,
      unit: '°C',
      description: 'Évaporation accélérée solvants'
    }
  ],
  
  requiredTraining: [
    'Manipulation solvants',
    'Reconnaissance intoxication',
    'Ventilation workplace'
  ],
  
  emergencyProcedures: [
    'Évacuation zone vapeurs',
    'Ventilation forcée',
    'Oxygène si détresse respiratoire'
  ],
  
  tags: ['solvants', 'vapeurs', 'ventilation_obligatoire', 'mesures_atmospheriques']
});

export const corrosiveSubstances: Hazard = createNewHazard({
  id: 'corrosive_acids_bases',
  name: 'Substances corrosives',
  category: 'chemical',
  subcategory: 'corrosive',
  displayName: {
    fr: 'Acides et bases corrosives',
    en: 'Corrosive acids and bases'
  },
  description: 'Risque de brûlures chimiques par contact avec substances corrosives',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Processus neutres pH',
    'Méthodes mécaniques',
    'Élimination décapage chimique'
  ],
  
  substitutionOptions: [
    'Solutions moins concentrées',
    'Produits moins corrosifs',
    'Systèmes tamponnés'
  ],
  
  engineeringControls: [
    'Douches et lave-yeux d\'urgence',
    'Ventilation corrosion-résistante',
    'Contenants résistants',
    'Rétention secondaire'
  ],
  
  administrativeControls: [
    'Procédures manipulation spéciales',
    'Neutralisants disponibles',
    'Formation corrosifs',
    'Inspection équipements régulière'
  ],
  
  ppeRequirements: [
    'Gants résistants chimiques',
    'Écran facial complet',
    'Tablier chimique',
    'Bottes résistantes chimiques'
  ],
  
  requiredEquipment: [
    'acid_resistant_gloves',
    'face_shield_chemical',
    'chemical_apron',
    'neutralizing_kit'
  ],
  
  regulations: {
    csa: ['CSA Z180.1'],
    rsst: ['Section IV'],
    other: ['Transport matières dangereuses']
  },
  
  requiredTraining: [
    'Manipulation corrosifs',
    'Neutralisation d\'urgence',
    'Premiers secours chimiques'
  ],
  
  emergencyProcedures: [
    'Rinçage immédiat 20+ minutes',
    'Neutralisation si approprié',
    'Retirer vêtements contaminés',
    'Transport médical urgent'
  ],
  
  firstAidMeasures: [
    'Rinçage abondant continu',
    'Ne pas neutraliser sur la peau',
    'Surveillance brûlures profondes',
    'Analgésie si nécessaire'
  ],
  
  tags: ['corrosifs', 'brulures_chimiques', 'neutralisation', 'rinçage_prolonge']
});

// =================== EXPORT DANGERS CHIMIQUES ===================
export const chemicalHazards = [
  hazardousChemicals,
  asbestosExposure,
  solventsVapors,
  corrosiveSubstances
];

export const chemicalHazardsById = chemicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default chemicalHazards;
