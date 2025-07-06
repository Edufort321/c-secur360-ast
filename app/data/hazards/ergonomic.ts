// app/data/hazards/ergonomic.ts
import { Hazard, createNewHazard } from './template';

// =================== DANGERS ERGONOMIQUES ===================

export const repetitiveStrain: Hazard = createNewHazard({
  id: 'repetitive_strain_injury',
  name: 'Lésions par efforts répétitifs',
  category: 'workplace',
  subcategory: 'repetitive_motion',
  displayName: {
    fr: 'Lésions par efforts répétitifs (LER)',
    en: 'Repetitive strain injury (RSI)'
  },
  description: 'Risque de blessures par mouvements répétitifs des membres supérieurs',
  severity: 3,
  probability: 5,
  
  eliminationMethods: [
    'Automatisation tâches répétitives',
    'Réorganisation méthodes travail',
    'Élimination cadences excessives'
  ],
  
  substitutionOptions: [
    'Outils motorisés vs manuels',
    'Alternance types mouvements',
    'Réduction forces requises'
  ],
  
  engineeringControls: [
    'Outils ergonomiques vibration réduite',
    'Plans travail hauteur ajustable',
    'Supports avant-bras',
    'Équipements anti-vibration',
    'Réduction efforts préhension'
  ],
  
  administrativeControls: [
    'Rotation postes toutes les 2h',
    'Pauses micro 5min/30min',
    'Échauffements pré-travail',
    'Formation gestes techniques',
    'Surveillance symptômes précoces'
  ],
  
  ppeRequirements: [
    'Gants anti-vibration',
    'Supports poignets si approprié',
    'Attelles préventives légères'
  ],
  
  requiredEquipment: [
    'ergonomic_tools_low_vibration',
    'workstation_adjusters',
    'vibration_dampeners',
    'grip_enhancers'
  ],
  
  recommendedEquipment: [
    'motion_analysis_sensors',
    'fatigue_monitoring_devices',
    'therapeutic_exercise_equipment'
  ],
  
  regulations: {
    csa: ['CSA Z412'],
    rsst: ['Troubles musculo-squelettiques'],
    other: ['IRSST - Guide prévention TMS']
  },
  
  requiredTraining: [
    'Prévention TMS membres supérieurs',
    'Techniques travail optimales',
    'Reconnaissance symptômes précoces',
    'Exercices compensation'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Hebdomadaire - surveillance symptômes',
  
  emergencyProcedures: [
    'Arrêt immédiat si douleur aiguë',
    'Application glace 15-20 minutes',
    'Repos complet membre affecté',
    'Évaluation médicale rapide'
  ],
  
  firstAidMeasures: [
    'Repos et élévation membre',
    'Compression légère si enflure',
    'Anti-inflammatoires si approprié',
    'Éviter mouvements aggravants'
  ],
  
  tags: ['ler', 'repetitif', 'vibrations', 'rotation_obligatoire']
});

export const manualLifting: Hazard = createNewHazard({
  id: 'manual_lifting_heavy_loads',
  name: 'Manutention manuelle charges lourdes',
  category: 'workplace',
  subcategory: 'manual_handling',
  displayName: {
    fr: 'Manutention manuelle de charges lourdes',
    en: 'Manual lifting of heavy loads'
  },
  description: 'Risque de blessures dorso-lombaires par soulèvement incorrect',
  severity: 4,
  probability: 4,
  
  eliminationMethods: [
    'Équipements mécanisés levage',
    'Systèmes convoyage automatisé',
    'Réduction poids unitaires'
  ],
  
  substitutionOptions: [
    'Aides mécaniques portables',
    'Tables élévatrices',
    'Systèmes pneumatiques',
    'Manutention par équipe'
  ],
  
  engineeringControls: [
    'Palans et treuils portables',
    'Tables hauteur variable',
    'Plans inclinés et rampes',
    'Prises ergonomiques objets',
    'Réduction distances transport'
  ],
  
  administrativeControls: [
    'Formation techniques sécuritaires',
    'Limites poids individuelles',
    'Évaluation capacités physiques',
    'Échauffement obligatoire',
    'Travail en équipe >23kg'
  ],
  
  ppeRequirements: [
    'Ceinture lombaire si prescrite',
    'Gants préhension antidérapants',
    'Chaussures stabilité renforcée',
    'Genouillères travail au sol'
  ],
  
  requiredEquipment: [
    'mechanical_lifting_aids',
    'lifting_straps_certified',
    'load_assessment_scale',
    'ergonomic_assessment_tools'
  ],
  
  regulations: {
    csa: ['CSA Z412'],
    rsst: ['Art. 166-172 - Manutention'],
    other: ['NIOSH équation levage']
  },
  
  weatherRestrictions: [
    {
      condition: 'temperature',
      operator: '<',
      value: -10,
      unit: '°C',
      description: 'Muscles froids - risque blessure'
    },
    {
      condition: 'humidity',
      operator: '>',
      value: 85,
      unit: '%',
      description: 'Préhension glissante'
    }
  ],
  
  requiredTraining: [
    'Techniques manutention sécuritaire',
    'Évaluation charges acceptables',
    'Utilisation aides mécaniques',
    'Reconnaissance limites personnelles'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Quotidienne - auto-évaluation',
  
  emergencyProcedures: [
    'Arrêt activité si douleur dorsale',
    'Position antalgique immédiate',
    'Application froid si inflammation',
    'Éviter manipulations supplémentaires'
  ],
  
  firstAidMeasures: [
    'Repos position confortable',
    'Application glace 20 minutes',
    'Anti-inflammatoires si approprié',
    'Mobilisation graduelle douce'
  ],
  
  tags: ['manutention', 'dorso_lombaire', 'limite_poids', 'equipe_obligatoire']
});

export const prolongedSitting: Hazard = createNewHazard({
  id: 'prolonged_sitting_posture',
  name: 'Position assise prolongée',
  category: 'workplace',
  subcategory: 'static_posture',
  displayName: {
    fr: 'Position assise prolongée',
    en: 'Prolonged sitting posture'
  },
  description: 'Risque de troubles circulatoires et musculo-squelettiques',
  severity: 2,
  probability: 5,
  
  eliminationMethods: [
    'Postes travail debout-assis',
    'Réunions en marchant',
    'Pauses mouvement fréquentes'
  ],
  
  substitutionOptions: [
    'Bureau debout ajustable',
    'Ballon exercice vs chaise',
    'Supports posturaux actifs'
  ],
  
  engineeringControls: [
    'Chaises ergonomiques ajustables',
    'Repose-pieds adaptables',
    'Support lombaire personnalisé',
    'Bureau hauteur variable',
    'Rappels posturaux automatiques'
  ],
  
  administrativeControls: [
    'Pauses mouvement obligatoires 10min/h',
    'Exercices étirement programmés',
    'Formation posture optimale',
    'Évaluation poste individualisée'
  ],
  
  ppeRequirements: [
    'Coussin lombaire si prescrit',
    'Chaussures confortables',
    'Vêtements non restrictifs'
  ],
  
  requiredEquipment: [
    'ergonomic_chair_adjustable',
    'footrest_adjustable',
    'lumbar_support',
    'posture_reminder_device'
  ],
  
  regulations: {
    csa: ['CSA Z412'],
    rsst: ['Aménagement ergonomique'],
    other: ['Guide CSA ergonomie bureau']
  },
  
  requiredTraining: [
    'Ajustement poste de travail',
    'Exercices étirement bureau',
    'Reconnaissance fatigue posturale'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Mensuelle - évaluation posturale',
  
  emergencyProcedures: [
    'Levée immédiate si engourdissement',
    'Marche légère 5-10 minutes',
    'Étirements décompression'
  ],
  
  firstAidMeasures: [
    'Mobilisation progressive',
    'Étirements doux membres inférieurs',
    'Surélévation jambes si enflure'
  ],
  
  tags: ['position_assise', 'circulation', 'pauses_mouvement', 'etirements']
});

export const forcedPostures: Hazard = createNewHazard({
  id: 'forced_awkward_postures',
  name: 'Postures contraignantes',
  category: 'workplace',
  subcategory: 'awkward_posture',
  displayName: {
    fr: 'Postures contraignantes et forcées',
    en: 'Forced and awkward postures'
  },
  description: 'Risque de TMS par postures non-neutres prolongées',
  severity: 4,
  probability: 4,
  
  eliminationMethods: [
    'Réaménagement espaces travail',
    'Élimination contraintes spatiales',
    'Accès optimisé équipements'
  ],
  
  substitutionOptions: [
    'Outils extension/articulation',
    'Plateformes de travail adaptées',
    'Systèmes repositionnement'
  ],
  
  engineeringControls: [
    'Plans travail orientables',
    'Supports corporels multiples',
    'Éclairage directionnel optimal',
    'Outils coudés/articulés',
    'Plateformes stabilisation'
  ],
  
  administrativeControls: [
    'Limitation temps postures contraignantes',
    'Alternance positions fréquente',
    'Formation postures sécuritaires',
    'Récupération active programmée'
  ],
  
  ppeRequirements: [
    'Genouillères si travail au sol',
    'Supports lombaires portables',
    'Coussins positionnement',
    'Gants préhension renforcée'
  ],
  
  requiredEquipment: [
    'articulated_tools',
    'portable_work_platforms',
    'positioning_aids',
    'postural_support_devices'
  ],
  
  regulations: {
    csa: ['CSA Z412'],
    rsst: ['Contraintes posturales'],
    other: ['RULA/REBA assessment tools']
  },
  
  requiredTraining: [
    'Reconnaissance postures à risque',
    'Techniques compensation posturale',
    'Utilisation aides positionnement'
  ],
  
  monitoringRequired: true,
  inspectionFrequency: 'Hebdomadaire - évaluation RULA',
  
  emergencyProcedures: [
    'Changement position immédiat',
    'Mobilisation articulaire douce',
    'Étirements décompression',
    'Repos position neutre'
  ],
  
  firstAidMeasures: [
    'Décompression articulaire progressive',
    'Chaleur locale si tensions',
    'Mobilisation passive douce',
    'Éviter positions aggravantes'
  ],
  
  tags: ['postures_contraignantes', 'tms', 'rula_reba', 'compensation_posturale']
});

export const handArmVibration: Hazard = createNewHazard({
  id: 'hand_arm_vibration_syndrome',
  name: 'Syndrome vibration main-bras',
  category: 'workplace',
  subcategory: 'vibration',
  displayName: {
    fr: 'Syndrome vibration main-bras (SVMB)',
    en: 'Hand-arm vibration syndrome (HAVS)'
  },
  description: 'Risque de troubles vasculaires et neurologiques par exposition vibrations',
  severity: 4,
  probability: 3,
  
  eliminationMethods: [
    'Outils sans vibration',
    'Méthodes alternatives automatisées',
    'Élimination sources vibratoires'
  ],
  
  substitutionOptions: [
    'Outils anti-vibration certifiés',
    'Technologies ultrasoniques',
    'Systèmes hydrauliques vs pneumatiques'
  ],
  
  engineeringControls: [
    'Outils isolation vibratoire',
    'Poignées anti-vibration',
    'Maintenance optimale équipements',
    'Systèmes absorption vibrations',
    'Limiteurs temps exposition'
  ],
  
  administrativeControls: [
    'Mesures vibrations régulières',
    'Limitation temps exposition quotidien',
    'Rotation équipes exposées',
    'Surveillance médicale spécialisée',
    'Formation utilisation optimale'
  ],
  
  ppeRequirements: [
    'Gants anti-vibration certifiés',
    'Vêtements maintien chaleur',
    'Chaussures isolation sol'
  ],
  
  requiredEquipment: [
    'vibration_measuring_equipment',
    'anti_vibration_tools',
    'vibration_isolation_gloves',
    'exposure_monitoring_system'
  ],
  
  regulations: {
    csa: ['CSA Z94.2'],
    rsst: ['Exposition vibrations'],
    other: ['ISO 5349', 'Directive UE 2002/44/CE']
  },
  
  weatherRestrictions: [
    {
      condition: 'temperature',
      operator: '<',
      value: 5,
      unit: '°C',
      description: 'Froid aggrave effets vibrations'
    }
  ],
  
  requiredTraining: [
    'Syndrome vibration main-bras',
    'Techniques réduction exposition',
    'Maintenance préventive outils',
    'Reconnaissance symptômes précoces'
  ],
  
  certificationRequired: false,
  monitoringRequired: true,
  inspectionFrequency: 'Mensuelle - mesures vibrations',
  
  emergencyProcedures: [
    'Arrêt exposition si engourdissement',
    'Réchauffement mains/poignets',
    'Mobilisation douce extrémités',
    'Évaluation médicale si symptômes'
  ],
  
  firstAidMeasures: [
    'Réchauffement progressif mains',
    'Massage léger circulation',
    'Élévation membres supérieurs',
    'Éviter re-exposition immédiate'
  ],
  
  tags: ['vibrations', 'svmb', 'surveillance_medicale', 'limitation_exposition']
});

// =================== EXPORT DANGERS ERGONOMIQUES ===================
export const ergonomicHazards = [
  repetitiveStrain,
  manualLifting,
  prolongedSitting,
  forcedPostures,
  handArmVibration
];

export const ergonomicHazardsById = ergonomicHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

export default ergonomicHazards;
