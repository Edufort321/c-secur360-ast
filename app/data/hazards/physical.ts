// app/data/hazards/physical.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS PHYSIQUES ===================

export const workingAtHeight: Hazard = createNewHazard({
  id: 'working_at_height',
  name: 'Travail en hauteur',
  category: 'physical',
  subcategory: 'height',
  displayName: {
    fr: 'Travail en hauteur',
    en: 'Working at height'
  },
  description: 'Risque de chute lors de travaux effectués à plus de 3 mètres de hauteur',
  severity: 5,
  probability: 3,
  
  eliminationMethods: [
    'Effectuer travaux au sol',
    'Préfabrication en atelier',
    'Méthodes alternatives sans hauteur'
  ],
  
  substitutionOptions: [
    'Équipements télescopiques',
    'Drones pour inspection',
    'Systèmes robotisés'
  ],
  
  engineeringControls: [
    'Garde-corps permanents',
    'Planchers de travail',
    'Filets de sécurité',
    'Plateformes élévatrices',
    'Échafaudages certifiés'
  ],
  
  administrativeControls: [
    'Plan de protection contre chutes',
    'Formation travail en hauteur',
    'Inspection équipements quotidienne',
    'Procédures de sauvetage',
    'Conditions météo acceptables'
  ],
  
  ppeRequirements: [
    'Harnais de sécurité complet',
    'Casque avec jugulaire',
    'Chaussures antidérapantes',
    'Gants préhension',
    'Longe avec absorbeur d\'énergie'
  ],
  
  requiredEquipment: [
    'fall_arrest_harness',
    'safety_helmet',
    'fall_protection_lanyard',
    'anchor_points',
    'rescue_equipment'
  ],
  
  recommendedEquipment: [
    'positioning_belt',
    'tool_lanyards',
    'communication_radio'
  ],
  
  regulations: {
    csa: ['CSA Z259', 'CSA Z91'],
    rsst: ['Section VII - Protection contre chutes'],
    other: ['ANSI Z359', 'EN 361']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 40,
      unit: 'km/h',
      description: 'Vent fort - arrêt travaux hauteur'
    },
    {
      condition: 'visibility',
      operator: '<',
      value: 150,
      unit: 'm',
      description: 'Visibilité réduite'
    },
    {
      condition: 'temperature',
      operator: '<',
      value: -25,
      unit: '°C',
      description: 'Froid extrême'
    }
  ],
  
  requiredTraining: [
    'Travail en hauteur',
    'Utilisation harnais',
    'Techniques de sauvetage',
    'Inspection équipements'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Avant chaque utilisation',
  
  emergencyProcedures: [
    'Plan de sauvetage activé',
    'Équipe secours spécialisée',
    'Évacuation héliportée si nécessaire',
    'Immobilisation colonne vertébrale'
  ],
  
  firstAidMeasures: [
    'Évaluation traumatismes multiples',
    'Immobilisation complète',
    'Surveillance signes vitaux',
    'Transport médicalisé'
  ],
  
  tags: ['hauteur', 'harnais', 'sauvetage_specialise', 'meteo_critique']
});

export const confinedSpace: Hazard = createNewHazard({
  id: 'confined_space_entry',
  name: 'Espaces clos',
  category: 'physical',
  subcategory: 'confined_space',
  displayName: {
    fr: 'Entrée en espaces clos',
    en: 'Confined space entry'
  },
  description: 'Risque d\'asphyxie, intoxication ou piégeage dans espaces clos',
  severity: 5,
  probability: 2,
  
  eliminationMethods: [
    'Éviter entrée si possible',
    'Travaux à distance',
    'Modifications conception'
  ],
  
  engineeringControls: [
    'Ventilation forcée',
    'Systèmes de surveillance gaz',
    'Éclairage antidéflagrant',
    'Systèmes de communication',
    'Équipements de sauvetage'
  ],
  
  administrativeControls: [
    'Permis d\'entrée obligatoire',
    'Préposé à l\'entrée',
    'Tests atmosphériques continus',
    'Procédures d\'urgence',
    'Formation spécialisée'
  ],
  
  ppeRequirements: [
    'Appareil respiratoire autonome',
    'Harnais de sauvetage',
    'Équipements intrinsèquement sûrs',
    'Vêtements anti-statiques'
  ],
  
  requiredEquipment: [
    'gas_detector_4_gas',
    'forced_ventilation',
    'scba_equipment',
    'rescue_tripod',
    'communication_system'
  ],
  
  regulations: {
    csa: ['CSA Z1006'],
    rsst: ['Section XXIII - Espaces clos'],
    other: ['OSHA 1910.146']
  },
  
  requiredTraining: [
    'Espaces clos',
    'Détection gaz',
    'Sauvetage espaces clos',
    'SCBA utilisation'
  ],
  
  certificationRequired: true,
  monitoringRequired: true,
  inspectionFrequency: 'Continue pendant entrée',
  
  emergencyProcedures: [
    'Évacuation immédiate',
    'Équipe sauvetage espaces clos',
    'Ventilation d\'urgence',
    'Réanimation si nécessaire'
  ],
  
  tags: ['espaces_clos', 'scba', 'surveillance_continue', 'sauvetage_specialise']
});

export const heatStress: Hazard = createNewHazard({
  id: 'heat_stress_exposure',
  name: 'Stress thermique',
  category: 'physical',
  subcategory: 'temperature',
  displayName: {
    fr: 'Stress thermique / Coup de chaleur',
    en: 'Heat stress / Heat stroke'
  },
  description: 'Risque de troubles liés à la chaleur lors de travaux par temperatures élevées',
  severity: 4,
  probability: 4,
  
  eliminationMethods: [
    'Travaux durant heures fraîches',
    'Contrôle température ambiante',
    'Automatisation des tâches'
  ],
  
  substitutionOptions: [
    'Équipements de refroidissement',
    'Vêtements rafraîchissants',
    'Rotation équipes fréquente'
  ],
  
  engineeringControls: [
    'Ventilation/climatisation',
    'Zones d\'ombre',
    'Stations de refroidissement',
    'Isolation sources chaleur'
  ],
  
  administrativeControls: [
    'Surveillance température/humidité',
    'Pauses fréquentes obligatoires',
    'Hydratation programmée',
    'Acclimatation progressive',
    'Surveillance médicale'
  ],
  
  ppeRequirements: [
    'Vêtements légers respirants',
    'Casque avec aération',
    'Lunettes protection UV',
    'Crème solaire FPS 30+'
  ],
  
  requiredEquipment: [
    'temperature_monitor',
    'cooling_stations',
    'electrolyte_drinks',
    'shade_structures'
  ],
  
  weatherRestrictions: [
    {
      condition: 'temperature',
      operator: '>',
      value: 32,
      unit: '°C',
      description: 'Surveillance renforcée >32°C'
    },
    {
      condition: 'humidity',
      operator: '>',
      value: 80,
      unit: '%',
      description: 'Humidité excessive'
    }
  ],
  
  requiredTraining: [
    'Reconnaissance stress thermique',
    'Premiers secours chaleur',
    'Hydratation appropriée'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Toutes les 2 heures',
  
  emergencyProcedures: [
    'Déplacement zone fraîche',
    'Refroidissement actif',
    'Hydratation si conscient',
    'Transport médical urgent'
  ],
  
  firstAidMeasures: [
    'Mesure température corporelle',
    'Refroidissement externe',
    'Surveillance conscience',
    'Position de récupération'
  ],
  
  tags: ['chaleur', 'hydratation', 'surveillance_medicale', 'pauses_obligatoires']
});

export const coldExposure: Hazard = createNewHazard({
  id: 'cold_exposure_hypothermia',
  name: 'Exposition au froid',
  category: 'physical',
  subcategory: 'temperature',
  displayName: {
    fr: 'Exposition au froid / Hypothermie',
    en: 'Cold exposure / Hypothermia'
  },
  description: 'Risque d\'hypothermie, gelures lors de travaux par temps froid',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Reporter travaux temps doux',
    'Travail en environnement chauffé',
    'Méthodes à distance'
  ],
  
  engineeringControls: [
    'Abris chauffés',
    'Stations de réchauffement',
    'Isolation du sol',
    'Protection contre vent'
  ],
  
  administrativeControls: [
    'Surveillance température',
    'Pauses réchauffement obligatoires',
    'Système de jumelage',
    'Formation reconnaissance hypothermie',
    'Limitation durée exposition'
  ],
  
  ppeRequirements: [
    'Vêtements multicouches',
    'Isolation tête/extrémités',
    'Gants chauds dextérité',
    'Chaussures isolantes'
  ],
  
  weatherRestrictions: [
    {
      condition: 'temperature',
      operator: '<',
      value: -30,
      unit: '°C',
      description: 'Froid extrême - arrêt travaux'
    },
    {
      condition: 'wind',
      operator: '>',
      value: 50,
      unit: 'km/h',
      description: 'Refroidissement éolien dangereux'
    }
  ],
  
  requiredTraining: [
    'Travail temps froid',
    'Reconnaissance hypothermie',
    'Premiers secours froid'
  ],
  
  emergencyProcedures: [
    'Réchauffement progressif',
    'Abri chauffé immédiat',
    'Surveillance hypothermie',
    'Évacuation médicale'
  ],
  
  tags: ['froid', 'hypothermie', 'gelures', 'rechauffement_progressif']
});

// =================== EXPORT DANGERS PHYSIQUES ===================
export const physicalHazards = [
  workingAtHeight,
  confinedSpace,
  heatStress,
  coldExposure
];

export const physicalHazardsById = physicalHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default physicalHazards;
