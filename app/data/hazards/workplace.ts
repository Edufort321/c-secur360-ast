// app/data/hazards/workplace.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS MILIEU DE TRAVAIL ===================

export const ergonomicInjuries: Hazard = createNewHazard({
  id: 'ergonomic_repetitive_strain',
  name: 'Troubles musculo-squelettiques',
  category: 'workplace',
  subcategory: 'ergonomic',
  displayName: {
    fr: 'Troubles musculo-squelettiques (TMS)',
    en: 'Musculoskeletal disorders (MSDs)'
  },
  description: 'Risque de blessures par mouvements répétitifs, mauvaises postures ou surefforts',
  severity: 3,
  probability: 5,
  
  eliminationMethods: [
    'Automatisation tâches répétitives',
    'Réorganisation processus travail',
    'Élimination manutention manuelle'
  ],
  
  substitutionOptions: [
    'Équipements d\'aide manutention',
    'Outils ergonomiques adaptés',
    'Méthodes travail optimisées'
  ],
  
  engineeringControls: [
    'Plans de travail ajustables',
    'Convoyeurs et tables élévatrices',
    'Outils anti-vibration',
    'Supports posturaux',
    'Éclairage adéquat'
  ],
  
  administrativeControls: [
    'Rotation postes de travail',
    'Pauses fréquentes programmées',
    'Formation techniques sécuritaires',
    'Échauffements pré-travail',
    'Évaluation ergonomique postes'
  ],
  
  ppeRequirements: [
    'Supports lombaires si nécessaire',
    'Gants préhension adaptés',
    'Chaussures ergonomiques',
    'Genouillères pour travail au sol'
  ],
  
  requiredEquipment: [
    'lifting_aids_mechanical',
    'ergonomic_tools',
    'anti_fatigue_mats',
    'workstation_adjusters'
  ],
  
  recommendedEquipment: [
    'posture_monitoring_devices',
    'stretching_equipment',
    'ergonomic_assessment_tools'
  ],
  
  regulations: {
    csa: ['CSA Z412'],
    rsst: ['Manutention manuelle', 'Art. 166-172'],
    other: ['Guide IRSST ergonomie']
  },
  
  requiredTraining: [
    'Techniques manutention sécuritaire',
    'Principes ergonomiques',
    'Reconnaissance TMS précoces',
    'Exercices prévention'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Mensuelle évaluation postes',
  
  emergencyProcedures: [
    'Arrêt activité si douleur aiguë',
    'Application froid/chaleur selon',
    'Évaluation médicale prompte',
    'Modification temporaire tâches'
  ],
  
  firstAidMeasures: [
    'Repos et immobilisation',
    'Application glace 15-20 min',
    'Élévation membre affecté',
    'Anti-inflammatoires si approprié'
  ],
  
  tags: ['tms', 'ergonomie', 'rotation_postes', 'pauses_frequentes']
});

export const noiseExposure: Hazard = createNewHazard({
  id: 'excessive_noise_exposure',
  name: 'Exposition bruit excessif',
  category: 'workplace',
  subcategory: 'noise',
  displayName: {
    fr: 'Exposition au bruit excessif',
    en: 'Excessive noise exposure'
  },
  description: 'Risque de perte auditive temporaire ou permanente par exposition au bruit',
  severity: 3,
  probability: 4,
  
  eliminationMethods: [
    'Remplacement équipements bruyants',
    'Processus silencieux',
    'Isolation sources sonores'
  ],
  
  substitutionOptions: [
    'Équipements moins bruyants',
    'Technologies alternatives',
    'Horaires exposition réduits'
  ],
  
  engineeringControls: [
    'Encoffrement machines bruyantes',
    'Matériaux absorbants acoustiques',
    'Isolation vibratoire',
    'Silencieux échappements',
    'Barrières acoustiques'
  ],
  
  administrativeControls: [
    'Mesures bruit régulières',
    'Limitation temps exposition',
    'Rotation personnel zones bruyantes',
    'Formation protection auditive',
    'Audiométrie périodique'
  ],
  
  ppeRequirements: [
    'Protecteurs auditifs appropriés',
    'Bouchons ou coquilles selon',
    'Protection double si >100 dB',
    'Vérification ajustement'
  ],
  
  requiredEquipment: [
    'hearing_protection_rated',
    'noise_dosimeter',
    'sound_level_meter',
    'audiometry_equipment'
  ],
  
  regulations: {
    csa: ['CSA Z94.2'],
    rsst: ['Section VI - Bruit', 'Art. 131-135'],
    other: ['ACGIH limites exposition']
  },
  
  weatherRestrictions: [
    {
      condition: 'wind',
      operator: '>',
      value: 25,
      unit: 'km/h',
      description: 'Vent masque signaux sonores sécurité'
    }
  ],
  
  requiredTraining: [
    'Protection auditive efficace',
    'Reconnaissance perte auditive',
    'Utilisation équipements mesure'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Mensuelle dosimétrie',
  
  emergencyProcedures: [
    'Éloignement source bruit',
    'Évaluation auditive immédiate',
    'Signalement incident'
  ],
  
  firstAidMeasures: [
    'Repos auditif environnement calme',
    'Éviter autres bruits intenses',
    'Évaluation ORL si acouphènes'
  ],
  
  tags: ['bruit', 'protection_auditive', 'audiometrie', 'dosimetrie']
});

export const inadequateLighting: Hazard = createNewHazard({
  id: 'poor_lighting_conditions',
  name: 'Éclairage inadéquat',
  category: 'workplace',
  subcategory: 'lighting',
  displayName: {
    fr: 'Conditions d\'éclairage inadéquates',
    en: 'Poor lighting conditions'
  },
  description: 'Risque d\'accidents par visibilité réduite ou éblouissement',
  severity: 2,
  probability: 4,
  
  eliminationMethods: [
    'Travail heures éclairage naturel',
    'Relocalisation zones mieux éclairées',
    'Évitement travail nocturne'
  ],
  
  substitutionOptions: [
    'Éclairage LED haute efficacité',
    'Systèmes adaptatifs',
    'Éclairage portatif adéquat'
  ],
  
  engineeringControls: [
    'Éclairage général uniforme',
    'Éclairage tâche localisé',
    'Contrôle éblouissement',
    'Maintenance régulière luminaires',
    'Capteurs luminosité automatiques'
  ],
  
  administrativeControls: [
    'Mesures éclairage périodiques',
    'Nettoyage régulier luminaires',
    'Formation éclairage sécuritaire',
    'Planification selon luminosité'
  ],
  
  ppeRequirements: [
    'Lampes frontales individuelles',
    'Vêtements haute visibilité',
    'Lunettes protection éblouissement'
  ],
  
  requiredEquipment: [
    'portable_lighting_adequate',
    'light_meter',
    'high_visibility_clothing',
    'emergency_lighting'
  ],
  
  regulations: {
    csa: ['CSA Z96'],
    rsst: ['Éclairage des lieux'],
    other: ['Guide éclairage IESNA']
  },
  
  timeRestrictions: {
    startTime: '07:00',
    endTime: '19:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    reason: 'Éviter travaux précis éclairage insuffisant'
  },
  
  requiredTraining: [
    'Évaluation besoins éclairage',
    'Utilisation éclairage portatif',
    'Reconnaissance dangers visuels'
  ],
  
  emergencyProcedures: [
    'Arrêt travaux si éclairage défaillant',
    'Éclairage secours si disponible',
    'Évacuation sécuritaire si nécessaire'
  ],
  
  tags: ['eclairage', 'visibilite', 'haute_visibilite', 'travail_diurne']
});

export const slipsTripsStumbles: Hazard = createNewHazard({
  id: 'slips_trips_falls_same_level',
  name: 'Glissades et trébuchements',
  category: 'workplace',
  subcategory: 'walking_surfaces',
  displayName: {
    fr: 'Glissades, trébuchements et chutes de plain-pied',
    en: 'Slips, trips and falls on same level'
  },
  description: 'Risque de blessures par surfaces glissantes ou obstacles',
  severity: 3,
  probability: 5,
  
  eliminationMethods: [
    'Surfaces antidérapantes permanentes',
    'Élimination obstacles fixes',
    'Drainage efficace zones humides'
  ],
  
  substitutionOptions: [
    'Revêtements texturés',
    'Systèmes drainage améliorés',
    'Cheminements optimisés'
  ],
  
  engineeringControls: [
    'Surfaces antidérapantes',
    'Drainage et évacuation eau',
    'Éclairage adéquat circulations',
    'Signalisation dangers visibles',
    'Garde-corps et rampes'
  ],
  
  administrativeControls: [
    'Inspection quotidienne surfaces',
    'Nettoyage immédiat déversements',
    'Signalisation zones glissantes',
    'Formation déplacement sécuritaire',
    'Maintenance préventive'
  ],
  
  ppeRequirements: [
    'Chaussures antidérapantes certifiées',
    'Semelles adaptées conditions',
    'Dispositifs traction temporaires'
  ],
  
  requiredEquipment: [
    'slip_resistant_footwear',
    'spill_cleanup_kits',
    'warning_signs_wet_floor',
    'temporary_barriers'
  ],
  
  recommendedEquipment: [
    'portable_ramps',
    'anti_slip_tape',
    'drainage_mats'
  ],
  
  regulations: {
    csa: ['CSA Z195'],
    rsst: ['Voies de circulation'],
    other: ['Codes construction']
  },
  
  weatherRestrictions: [
    {
      condition: 'precipitation',
      operator: '>',
      value: 1,
      unit: 'mm/h',
      description: 'Surfaces extérieures glissantes'
    },
    {
      condition: 'temperature',
      operator: '<',
      value: 2,
      unit: '°C',
      description: 'Formation verglas possible'
    }
  ],
  
  requiredTraining: [
    'Reconnaissance surfaces dangereuses',
    'Techniques déplacement sécuritaire',
    'Entretien préventif surfaces'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Quotidienne',
  
  emergencyProcedures: [
    'Premiers secours chutes',
    'Immobilisation si fracture suspectée',
    'Sécurisation zone accident'
  ],
  
  firstAidMeasures: [
    'Évaluation traumatismes multiples',
    'Immobilisation colonne si nécessaire',
    'Application froid contusions',
    'Surveillance commotion'
  ],
  
  tags: ['glissades', 'trebuchements', 'antiderapant', 'inspection_quotidienne']
});

export const workplaceViolence: Hazard = createNewHazard({
  id: 'workplace_violence_aggression',
  name: 'Violence au travail',
  category: 'workplace',
  subcategory: 'violence',
  displayName: {
    fr: 'Violence et agression au travail',
    en: 'Workplace violence and aggression'
  },
  description: 'Risque d\'agression physique ou psychologique par clients ou collègues',
  severity: 4,
  probability: 2,
  
  eliminationMethods: [
    'Évitement situations à risque',
    'Travail en équipe obligatoire',
    'Contrôle accès zones sensibles'
  ],
  
  substitutionOptions: [
    'Communication à distance',
    'Médiateurs professionnels',
    'Services sécurité spécialisés'
  ],
  
  engineeringControls: [
    'Barrières physiques protection',
    'Systèmes d\'alarme personnelle',
    'Surveillance vidéo',
    'Éclairage sécuritaire',
    'Issues secours multiples'
  ],
  
  administrativeControls: [
    'Évaluation risques violence',
    'Formation désescalade',
    'Procédures signalement',
    'Soutien psychologique',
    'Politique tolérance zéro'
  ],
  
  ppeRequirements: [
    'Dispositifs alarme personnelle',
    'Moyens communication rapide',
    'Vêtements non restrictifs',
    'Identification visible'
  ],
  
  requiredEquipment: [
    'personal_alarm_device',
    'emergency_communication',
    'protective_barriers',
    'surveillance_system'
  ],
  
  regulations: {
    csa: [],
    rsst: ['Violence au travail'],
    other: ['Code criminel', 'Lois provinciales harcèlement']
  },
  
  timeRestrictions: {
    startTime: '08:00',
    endTime: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reason: 'Éviter isolement heures creuses'
  },
  
  requiredTraining: [
    'Reconnaissance signes agression',
    'Techniques désescalade',
    'Procédures urgence violence',
    'Soutien victimes'
  ],
  
  certificationRequired: false,
  monitoringRequired: true,
  
  emergencyProcedures: [
    'Signaler immédiatement sécurité',
    'Se mettre en sécurité priorité',
    'Appeler police si nécessaire',
    'Premiers secours si blessures',
    'Soutien psychologique après'
  ],
  
  firstAidMeasures: [
    'Évaluation blessures physiques',
    'Soutien immédiat victime',
    'Documentation détaillée incident',
    'Référence professionnels appropriés'
  ],
  
  tags: ['violence', 'agression', 'desescalade', 'soutien_psychologique']
});

// =================== EXPORT DANGERS MILIEU TRAVAIL ===================
export const workplaceHazards = [
  ergonomicInjuries,
  noiseExposure,
  inadequateLighting,
  slipsTripsStumbles,
  workplaceViolence
];

export const workplaceHazardsById = workplaceHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default workplaceHazards;
