// app/data/controlMeasures/substitution.ts
import { ControlMeasure, createNewControlMeasure } from './template';

// =================== MESURES DE SUBSTITUTION ===================

export const substituteChemicalsSafer: ControlMeasure = createNewControlMeasure({
  id: 'substitute_safer_chemicals',
  name: 'Substituer par produits moins dangereux',
  category: 'substitution',
  hierarchyLevel: 2,
  displayName: {
    fr: 'Substitution par produits chimiques plus sûrs',
    en: 'Substitution with safer chemicals'
  },
  description: 'Remplacer les substances dangereuses par des alternatives moins toxiques',
  
  effectiveness: 4,
  
  applicableHazards: [
    'hazardous_chemical_exposure',
    'organic_solvents_vapors',
    'corrosive_acids_bases'
  ],
  
  applicableWorkTypes: [
    'chemical_operations',
    'painting_coating',
    'cleaning_maintenance'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier produits chimiques dangereux actuels',
      'Rechercher alternatives moins toxiques',
      'Évaluer efficacité des substituts',
      'Tester compatibilité avec procédés',
      'Former personnel aux nouveaux produits',
      'Modifier procédures d\'utilisation'
    ],
    en: [
      'Identify current hazardous chemicals',
      'Research less toxic alternatives',
      'Evaluate substitute effectiveness',
      'Test compatibility with processes',
      'Train personnel on new products',
      'Modify usage procedures'
    ]
  },
  
  requiredResources: [
    'Alternatives chimiques certifiées',
    'Tests de compatibilité',
    'Formation du personnel',
    'Mise à jour des FDS'
  ],
  
  estimatedCost: {
    amount: 150,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Formation et transition'
  },
  
  implementationTime: '2-4 semaines',
  riskReduction: 70,
  sustainabilityRating: 4,
  maintenanceRequired: false,
  
  regulatoryRequirements: {
    csa: ['CSA Z94.4'],
    rsst: ['Section IV - Substances dangereuses'],
    other: ['SIMDUT 2015']
  },
  
  complianceLevel: 'recommended',
  
  limitations: [
    'Alternatives pas toujours disponibles',
    'Efficacité peut être réduite',
    'Coûts produits alternatifs parfois plus élevés',
    'Temps adaptation requis'
  ],
  
  prerequisites: [
    'Évaluation alternatives disponibles',
    'Tests préalables d'efficacité',
    'Budget transition produits'
  ],
  
  potentialSideEffects: [
    'Changement qualité résultats',
    'Modification temps procédés',
    'Formation additionnelle requise'
  ],
  
  trainingRequired: true,
  skillLevel: 'intermediate',
  certificationRequired: false,
  
  compatibleMeasures: [
    'engineering_ventilation',
    'ppe_chemical_resistant',
    'administrative_training'
  ],
  
  tags: ['substitution', 'chimiques', 'moins_toxique', 'simdut', 'formation']
});

export const substituteQuieterEquipment: ControlMeasure = createNewControlMeasure({
  id: 'substitute_quieter_equipment',
  name: 'Substituer par équipements moins bruyants',
  category: 'substitution',
  hierarchyLevel: 2,
  displayName: {
    fr: 'Substitution équipements moins bruyants',
    en: 'Substitution with quieter equipment'
  },
  description: 'Remplacer les équipements bruyants par des modèles à faible émission sonore',
  
  effectiveness: 4,
  
  applicableHazards: [
    'excessive_noise_exposure'
  ],
  
  implementationSteps: {
    fr: [
      'Mesurer niveaux sonores équipements actuels',
      'Identifier équipements moins bruyants',
      'Comparer performances et émissions',
      'Tester équipements substituts',
      'Former opérateurs nouveaux équipements',
      'Remplacer progressivement'
    ],
    en: [
      'Measure current equipment noise levels',
      'Identify quieter equipment options',
      'Compare performance and emissions',
      'Test substitute equipment',
      'Train operators on new equipment',
      'Replace progressively'
    ]
  },
  
  requiredResources: [
    'Équipements à faible bruit',
    'Tests de performance',
    'Formation opérateurs'
  ],
  
  estimatedCost: {
    amount: 5000,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Remplacement équipement'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 60,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Selon fabricant',
  
  regulatoryRequirements: {
    csa: ['CSA Z107.56'],
    rsst: ['Section VI - Bruit'],
    other: []
  },
  
  complianceLevel: 'best_practice',
  
  limitations: [
    'Coûts équipements spécialisés',
    'Performance peut être différente',
    'Disponibilité limitée certains types'
  ],
  
  trainingRequired: true,
  skillLevel: 'basic',
  
  tags: ['substitution', 'bruit', 'equipements_silencieux', 'performance']
});

export const substituteLighterMaterials: ControlMeasure = createNewControlMeasure({
  id: 'substitute_lighter_materials',
  name: 'Substituer par matériaux plus légers',
  category: 'substitution',
  hierarchyLevel: 2,
  displayName: {
    fr: 'Substitution matériaux plus légers',
    en: 'Substitution with lighter materials'
  },
  description: 'Remplacer matériaux lourds par alternatives plus légères pour réduire manutention',
  
  effectiveness: 4,
  
  applicableHazards: [
    'manual_lifting_heavy_loads',
    'repetitive_strain_injury',
    'back_injuries'
  ],
  
  implementationSteps: {
    fr: [
      'Analyser poids matériaux actuels',
      'Identifier alternatives plus légères',
      'Évaluer résistance et durabilité',
      'Tester compatibilité applications',
      'Modifier spécifications projet',
      'Former équipes nouveaux matériaux'
    ],
    en: [
      'Analyze current material weights',
      'Identify lighter alternatives',
      'Evaluate strength and durability',
      'Test application compatibility',
      'Modify project specifications',
      'Train teams on new materials'
    ]
  },
  
  requiredResources: [
    'Matériaux légers certifiés',
    'Tests résistance',
    'Modification spécifications'
  ],
  
  estimatedCost: {
    amount: 200,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Surcoût matériaux'
  },
  
  implementationTime: '1 semaine',
  riskReduction: 50,
  sustainabilityRating: 4,
  
  limitations: [
    'Coûts matériaux spécialisés',
    'Résistance peut être moindre',
    'Disponibilité selon régions'
  ],
  
  skillLevel: 'basic',
  
  tags: ['substitution', 'materiaux_legers', 'manutention', 'ergonomie']
});

export const substituteNonToxicSolvents: ControlMeasure = createNewControlMeasure({
  id: 'substitute_water_based_solvents',
  name: 'Substituer par solvants à base d\'eau',
  category: 'substitution',
  hierarchyLevel: 2,
  displayName: {
    fr: 'Substitution solvants base eau',
    en: 'Substitution with water-based solvents'
  },
  description: 'Remplacer solvants organiques par alternatives aqueuses moins toxiques',
  
  effectiveness: 4,
  
  applicableHazards: [
    'organic_solvents_vapors',
    'fire_explosion_risk',
    'skin_absorption'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier applications solvants organiques',
      'Sélectionner formulations base eau',
      'Tester efficacité nettoyage/dégraissage',
      'Adapter paramètres procédés',
      'Former utilisateurs',
      'Modifier stockage et manipulation'
    ],
    en: [
      'Identify organic solvent applications',
      'Select water-based formulations',
      'Test cleaning/degreasing effectiveness',
      'Adapt process parameters',
      'Train users',
      'Modify storage and handling'
    ]
  },
  
  estimatedCost: {
    amount: 100,
    currency: 'CAD',
    unit: 'per_worker'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 80,
  sustainabilityRating: 5,
  
  regulatoryRequirements: {
    csa: ['CSA Z94.4'],
    rsst: ['Section IV'],
    other: ['SIMDUT 2015']
  },
  
  potentialSideEffects: [
    'Temps séchage plus long',
    'Efficacité dégraissage variable',
    'Problèmes corrosion possibles'
  ],
  
  trainingRequired: true,
  skillLevel: 'basic',
  
  tags: ['substitution', 'solvants', 'base_eau', 'non_toxique', 'environnement']
});

export const substituteLowVoltage: ControlMeasure = createNewControlMeasure({
  id: 'substitute_low_voltage_systems',
  name: 'Substituer par systèmes basse tension',
  category: 'substitution',
  hierarchyLevel: 2,
  displayName: {
    fr: 'Substitution systèmes basse tension',
    en: 'Substitution with low voltage systems'
  },
  description: 'Remplacer équipements haute tension par alternatives basse tension (<50V)',
  
  effectiveness: 4,
  
  applicableHazards: [
    'electrical_shock',
    'arc_flash',
    'electrocution'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier équipements haute tension',
      'Évaluer alternatives basse tension',
      'Vérifier compatibilité puissance',
      'Modifier alimentation électrique',
      'Installer transformateurs sécurité',
      'Former électriciens'
    ],
    en: [
      'Identify high voltage equipment',
      'Evaluate low voltage alternatives',
      'Check power compatibility',
      'Modify electrical supply',
      'Install safety transformers',
      'Train electricians'
    ]
  },
  
  estimatedCost: {
    amount: 3000,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '2-3 semaines',
  riskReduction: 85,
  sustainabilityRating: 5,
  
  regulatoryRequirements: {
    csa: ['CSA Z462', 'CSA C22.1'],
    rsst: ['Section V - Électricité'],
    other: ['Code électrique canadien']
  },
  
  complianceLevel: 'recommended',
  
  limitations: [
    'Puissance limitée applications',
    'Coûts transformation',
    'Complexité installation'
  ],
  
  trainingRequired: true,
  skillLevel: 'advanced',
  certificationRequired: true,
  
  tags: ['substitution', 'basse_tension', 'electricite', 'transformateurs', 'securite']
});

// =================== EXPORT MESURES SUBSTITUTION ===================
export const substitutionMeasures = [
  substituteChemicalsSafer,
  substituteQuieterEquipment,
  substituteLighterMaterials,
  substituteNonToxicSolvents,
  substituteLowVoltage
];

export const substitutionMeasuresById = substitutionMeasures.reduce((acc, measure) => {
  acc[measure.id] = measure;
  return acc;
}, {} as Record<string, ControlMeasure>);

export default substitutionMeasures;
