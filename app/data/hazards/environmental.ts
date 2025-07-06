// app/data/hazards/environmental.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS ENVIRONNEMENTAUX ===================

export const severeWeather: Hazard = createNewHazard({
  id: 'severe_weather_conditions',
  name: 'Conditions météorologiques sévères',
  category: 'environmental',
  subcategory: 'weather',
  displayName: {
    fr: 'Conditions météorologiques sévères',
    en: 'Severe weather conditions'
  },
  description: 'Risque de blessures par orages, vents forts, grêle ou conditions extrêmes',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Reporter travaux météo défavorable',
    'Travail en intérieur',
    'Surveillance météorologique continue'
  ],
  
  substitutionOptions: [
    'Équipements résistants intempéries',
    'Méthodes adaptées conditions',
    'Horaires ajustés prévisions'
  ],
  
  engineeringControls: [
    'Abris temporaires robustes',
    'Systèmes d\'ancrage renforcés',
    'Protection contre foudre',
    'Drainage efficace zones travail'
  ],
  
  administrativeControls: [
    'Surveillance météo temps réel',
    'Seuils d\'arrêt définis',
    'Procédures évacuation rapide',
    'Formation reconnaissance dangers',
    'Communication continue équipes'
  ],
  
  ppeRequirements: [
    'Vêtements imperméables',
    'Chaussures antidérapantes',
    'Protection contre vent',
    'Équipements haute visibilité'
  ],
  
  requiredEquipment: [
    'weather_monitoring_system',
    'emergency_shelter',
    'communication_radio',
    'lightning_detector'
  ],
  
  recommendedEquipment: [
    'portable_weather_station',
    'emergency_evacuation_plan',
    'backup_power_systems'
  ],
  
  regulations: {
    csa: ['CSA Z259 (hauteur par vent)'],
    rsst: ['Conditions de travail sécuritaires'],
    other: ['Environnement Canada alertes']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 60,
      unit: 'km/h',
      description: 'Arrêt obligatoire travaux extérieurs'
    },
    {
      condition: 'visibility',
      operator: '<',
      value: 100,
      unit: 'm',
      description: 'Visibilité dangereuse'
    }
  ],
  
  timeRestrictions: {
    startTime: '06:00',
    endTime: '20:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    reason: 'Éviter travaux nuit pendant orages'
  },
  
  requiredTraining: [
    'Reconnaissance conditions dangereuses',
    'Procédures évacuation météo',
    'Premiers secours trauma'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Continue pendant exposition',
  
  emergencyProcedures: [
    'Évacuation immédiate abri sûr',
    'Position sécurité foudre',
    'Communication situation équipes',
    'Attendre conditions sécuritaires'
  ],
  
  firstAidMeasures: [
    'Traitement hypothermie/hyperthermie',
    'Évaluation traumatismes impact',
    'Surveillance électrocution foudre',
    'Réchauffement ou refroidissement'
  ],
  
  tags: ['meteo_severe', 'surveillance_continue', 'evacuation_rapide', 'foudre']
});

export const terrainHazards: Hazard = createNewHazard({
  id: 'unstable_uneven_terrain',
  name: 'Terrain instable',
  category: 'environmental',
  subcategory: 'terrain',
  displayName: {
    fr: 'Terrain instable et inégal',
    en: 'Unstable and uneven terrain'
  },
  description: 'Risque de chutes, glissades ou ensevelissement sur terrain difficile',
  severity: 3,
  probability: 4,
  
  eliminationMethods: [
    'Nivellement préalable terrain',
    'Accès sécurisés aménagés',
    'Évitement zones instables'
  ],
  
  substitutionOptions: [
    'Équipements tout-terrain',
    'Plateformes de travail stables',
    'Méthodes à distance'
  ],
  
  engineeringControls: [
    'Chemins d\'accès sécurisés',
    'Système drainage efficace',
    'Éclairage adéquat zones',
    'Signalisation dangers visibles'
  ],
  
  administrativeControls: [
    'Inspection terrain préalable',
    'Formation déplacement sécuritaire',
    'Planification routes accès',
    'Surveillance conditions sol'
  ],
  
  ppeRequirements: [
    'Chaussures sécurité antidérapantes',
    'Protection jambes si nécessaire',
    'Équipements stabilisation',
    'Éclairage personnel'
  ],
  
  requiredEquipment: [
    'slip_resistant_boots',
    'portable_lighting',
    'terrain_survey_equipment',
    'stability_testing_tools'
  ],
  
  recommendedEquipment: [
    'walking_aids',
    'portable_bridges',
    'ground_stabilization_mats'
  ],
  
  regulations: {
    csa: ['CSA Z195'],
    rsst: ['Voies d\'accès sécuritaires'],
    other: ['Codes construction locaux']
  },
  
  weatherRestrictions: [
    {
      condition: 'precipitation',
      operator: '>',
      value: 5,
      unit: 'mm/h',
      description: 'Terrain glissant dangereusement'
    }
  ],
  
  requiredTraining: [
    'Évaluation stabilité terrain',
    'Techniques déplacement sécuritaire',
    'Utilisation équipements spécialisés'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Quotidienne et après intempéries',
  
  emergencyProcedures: [
    'Évacuation terrain instable',
    'Secours personnes coincées',
    'Stabilisation zone si possible'
  ],
  
  tags: ['terrain_instable', 'glissades', 'inspection_quotidienne', 'acces_securises']
});

export const wildlifeEncounters: Hazard = createNewHazard({
  id: 'dangerous_wildlife_encounters',
  name: 'Rencontres faune dangereuse',
  category: 'environmental',
  subcategory: 'wildlife',
  displayName: {
    fr: 'Rencontres avec faune dangereuse',
    en: 'Dangerous wildlife encounters'
  },
  description: 'Risque d\'attaques ou morsures par animaux sauvages',
  severity: 4,
  probability: 2,
  
  eliminationMethods: [
    'Évitement habitats fauniques',
    'Travaux hors périodes actives',
    'Surveillance zones à risque'
  ],
  
  substitutionOptions: [
    'Méthodes bruyantes dissuasives',
    'Équipements à distance',
    'Travail en groupes'
  ],
  
  engineeringControls: [
    'Clôtures protection temporaires',
    'Éclairage dissuasif nocturne',
    'Systèmes d\'alerte sonore',
    'Véhicules protection'
  ],
  
  administrativeControls: [
    'Formation reconnaissance espèces',
    'Protocoles rencontres animales',
    'Surveillance activité faunique',
    'Communication constante équipes'
  ],
  
  ppeRequirements: [
    'Vêtements protection déchirures',
    'Chaussures montantes robustes',
    'Équipements signalisation',
    'Moyens communication d\'urgence'
  ],
  
  requiredEquipment: [
    'wildlife_deterrent_devices',
    'emergency_communication',
    'first_aid_wildlife_kit',
    'protective_barriers'
  ],
  
  recommendedEquipment: [
    'bear_spray',
    'emergency_flares',
    'noise_makers'
  ],
  
  regulations: {
    csa: [],
    rsst: ['Environnement de travail sécuritaire'],
    other: ['Réglementations provinciales faune']
  },
  
  timeRestrictions: {
    startTime: '08:00',
    endTime: '18:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reason: 'Éviter périodes activité animale crépusculaire'
  },
  
  requiredTraining: [
    'Reconnaissance comportements animaux',
    'Techniques évitement/dissuasion',
    'Premiers secours morsures',
    'Procédures urgence faune'
  ],
  
  emergencyProcedures: [
    'Ne pas courir ou crier',
    'Se faire paraître plus grand',
    'Reculer lentement si possible',
    'Utiliser moyens dissuasion',
    'Premiers secours immédiats'
  ],
  
  firstAidMeasures: [
    'Contrôle saignement morsures',
    'Nettoyage plaies antiseptique',
    'Immobilisation si fractures',
    'Transport médical urgent',
    'Signalement autorités faune'
  ],
  
  tags: ['faune', 'morsures', 'dissuasion', 'groupes_obligatoires']
});

export const naturalDisasters: Hazard = createNewHazard({
  id: 'natural_disaster_seismic',
  name: 'Catastrophes naturelles',
  category: 'environmental',
  subcategory: 'natural_disasters',
  displayName: {
    fr: 'Catastrophes naturelles (séismes, inondations)',
    en: 'Natural disasters (earthquakes, floods)'
  },
  description: 'Risque de blessures graves lors d\'événements naturels majeurs',
  severity: 5,
  probability: 1,
  
  eliminationMethods: [
    'Évitement zones à haut risque',
    'Report travaux selon alertes',
    'Planification saisonnière'
  ],
  
  engineeringControls: [
    'Structures résistantes séismes',
    'Systèmes d\'alerte précoce',
    'Routes évacuation multiples',
    'Abris d\'urgence renforcés'
  ],
  
  administrativeControls: [
    'Plans urgence catastrophes',
    'Formation évacuation d\'urgence',
    'Surveillance alertes officielles',
    'Équipements secours prépositionnés'
  ],
  
  ppeRequirements: [
    'Casques renforcés',
    'Équipements flottaison',
    'Vêtements haute visibilité',
    'Moyens communication satellite'
  ],
  
  requiredEquipment: [
    'emergency_evacuation_kit',
    'satellite_communication',
    'emergency_shelter_kit',
    'rescue_equipment_basic'
  ],
  
  regulations: {
    csa: ['CSA Z1600'],
    rsst: ['Plans mesures d\'urgence'],
    other: ['Sécurité publique Canada', 'Plans municipaux urgence']
  },
  
  requiredTraining: [
    'Plans évacuation d\'urgence',
    'Premiers secours catastrophes',
    'Communication d\'urgence',
    'Survie temporaire'
  ],
  
  certificationRequired: false,
  monitoringRequired: true,
  inspectionFrequency: 'Selon alertes officielles',
  
  emergencyProcedures: [
    'Activation plan urgence immédiat',
    'Évacuation selon procédures',
    'Communication situation autorités',
    'Regroupement points ralliement',
    'Assistance blessés prioritaire'
  ],
  
  firstAidMeasures: [
    'Triage multiple victimes',
    'Traitement traumatismes écrasement',
    'Hypothermie/déshydratation',
    'Soutien psychologique'
  ],
  
  tags: ['catastrophes', 'evacuation_urgence', 'triage_multiple', 'plans_urgence']
});

// =================== EXPORT DANGERS ENVIRONNEMENTAUX ===================
export const environmentalHazards = [
  severeWeather,
  terrainHazards,
  wildlifeEncounters,
  naturalDisasters
];

export const environmentalHazardsById = environmentalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default environmentalHazards;
