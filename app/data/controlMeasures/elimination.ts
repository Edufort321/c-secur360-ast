// app/data/controlMeasures/elimination.ts
import { ControlMeasure, createNewControlMeasure } from './template';

// =================== MESURES D'ÉLIMINATION ===================

export const eliminateHeightWork: ControlMeasure = createNewControlMeasure({
  id: 'eliminate_height_work',
  name: 'Éliminer le travail en hauteur',
  category: 'elimination',
  hierarchyLevel: 1,
  displayName: {
    fr: 'Élimination complète du travail en hauteur',
    en: 'Complete elimination of work at height'
  },
  description: 'Supprimer entièrement la nécessité de travailler en hauteur par reconception ou méthodes alternatives',
  
  effectiveness: 5,
  
  applicableHazards: [
    'working_at_height',
    'fall_arrest',
    'ladder_falls'
  ],
  
  applicableWorkTypes: [
    'construction_general',
    'maintenance_general',
    'electrical_maintenance',
    'telecom_installation'
  ],
  
  applicableIndustries: ['construction', 'maintenance', 'télécommunications'],
  
  implementationSteps: {
    fr: [
      'Analyser la nécessité réelle du travail en hauteur',
      'Étudier les alternatives de conception',
      'Modifier les méthodes de travail',
      'Utiliser équipements télescopiques ou à distance',
      'Préfabriquer au sol quand possible',
      'Installer systèmes d\'accès permanents'
    ],
    en: [
      'Analyze actual need for height work',
      'Study design alternatives',
      'Modify work methods',
      'Use telescopic or remote equipment',
      'Prefabricate at ground level when possible',
      'Install permanent access systems'
    ]
  },
  
  requiredResources: [
    'Équipements télescopiques',
    'Systèmes de levage',
    'Expertise en reconception',
    'Outils à distance'
  ],
  
  estimatedCost: {
    amount: 5000,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Installation initiale'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 100, // Élimination complète
  sustainabilityRating: 5,
  maintenanceRequired: false,
  
  regulatoryRequirements: {
    csa: ['CSA Z259.1'],
    rsst: ['Section VII - Protection contre chutes'],
    other: ['Directive conception sécuritaire']
  },
  
  complianceLevel: 'best_practice',
  
  limitations: [
    'Peut nécessiter reconception majeure',
    'Coûts initiaux élevés',
    'Pas toujours techniquement faisable',
    'Peut requérir modification structures existantes'
  ],
  
  prerequisites: [
    'Étude faisabilité technique',
    'Budget modification disponible',
    'Accès pour équipements alternatives'
  ],
  
  potentialSideEffects: [
    'Augmentation coûts initiaux',
    'Complexité accrue planification',
    'Possible impact délais projet'
  ],
  
  trainingRequired: false,
  skillLevel: 'intermediate',
  certificationRequired: false,
  
  compatibleMeasures: [
    'remote_work_methods',
    'automated_systems',
    'ground_level_assembly'
  ],
  
  tags: ['elimination', 'hauteur', 'reconception', 'prefabrication', 'optimal']
});

export const eliminateConfinedSpace: ControlMeasure = createNewControlMeasure({
  id: 'eliminate_confined_space_entry',
  name: 'Éliminer l\'entrée en espaces clos',
  category: 'elimination',
  hierarchyLevel: 1,
  displayName: {
    fr: 'Élimination entrée en espaces clos',
    en: 'Elimination of confined space entry'
  },
  description: 'Supprimer la nécessité d\'entrer dans des espaces clos par méthodes alternatives',
  
  effectiveness: 5,
  
  applicableHazards: [
    'confined_space_entry',
    'oxygen_deficiency',
    'toxic_atmosphere'
  ],
  
  applicableWorkTypes: [
    'maintenance_general',
    'gas_maintenance',
    'chemical_operations'
  ],
  
  implementationSteps: {
    fr: [
      'Installer systèmes d\'accès externes',
      'Utiliser robots ou équipements télécommandés',
      'Modifier conception pour accès externe',
      'Installer systèmes de surveillance à distance',
      'Créer ouvertures d\'accès permanentes'
    ],
    en: [
      'Install external access systems',
      'Use robots or remote-controlled equipment',
      'Modify design for external access',
      'Install remote monitoring systems',
      'Create permanent access openings'
    ]
  },
  
  requiredResources: [
    'Équipements robotiques',
    'Systèmes de surveillance à distance',
    'Modification structures',
    'Systèmes d\'accès externes'
  ],
  
  estimatedCost: {
    amount: 15000,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Modification permanente'
  },
  
  implementationTime: '2-4 semaines',
  riskReduction: 100,
  sustainabilityRating: 5,
  maintenanceRequired: true,
  maintenanceFrequency: 'Annuelle',
  
  regulatoryRequirements: {
    csa: ['CSA Z1006'],
    rsst: ['Section XXIII - Espaces clos'],
    other: []
  },
  
  complianceLevel: 'best_practice',
  
  limitations: [
    'Modifications structurelles majeures',
    'Investissement initial important',
    'Pas applicable à tous espaces clos'
  ],
  
  skillLevel: 'advanced',
  
  tags: ['elimination', 'espaces_clos', 'robotique', 'surveillance_distance']
});

export const eliminateChemicalUse: ControlMeasure = createNewControlMeasure({
  id: 'eliminate_hazardous_chemicals',
  name: 'Éliminer l\'usage de produits chimiques',
  category: 'elimination',
  hierarchyLevel: 1,
  displayName: {
    fr: 'Élimination complète produits chimiques dangereux',
    en: 'Complete elimination of hazardous chemicals'
  },
  description: 'Supprimer entièrement l\'utilisation de substances chimiques dangereuses',
  
  effectiveness: 5,
  
  applicableHazards: [
    'hazardous_chemical_exposure',
    'chemical_burns',
    'inhalation_toxicity'
  ],
  
  implementationSteps: {
    fr: [
      'Analyser procédés nécessitant chimiques',
      'Identifier méthodes alternatives non chimiques',
      'Remplacer par procédés mécaniques',
      'Utiliser technologies propres',
      'Modifier conception produits'
    ],
    en: [
      'Analyze processes requiring chemicals',
      'Identify non-chemical alternatives',
      'Replace with mechanical processes',
      'Use clean technologies',
      'Modify product design'
    ]
  },
  
  estimatedCost: {
    amount: 10000,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '2-6 semaines',
  riskReduction: 100,
  sustainabilityRating: 5,
  
  limitations: [
    'Alternatives pas toujours disponibles',
    'Peut affecter qualité produit',
    'Coûts conversion élevés'
  ],
  
  skillLevel: 'expert',
  
  tags: ['elimination', 'chimiques', 'technologies_propres', 'mecanique']
});

export const eliminateNoiseSource: ControlMeasure = createNewControlMeasure({
  id: 'eliminate_noise_source',
  name: 'Éliminer les sources de bruit',
  category: 'elimination',
  hierarchyLevel: 1,
  displayName: {
    fr: 'Élimination des sources de bruit',
    en: 'Elimination of noise sources'
  },
  description: 'Supprimer complètement les équipements ou procédés générateurs de bruit',
  
  effectiveness: 5,
  
  applicableHazards: [
    'excessive_noise_exposure',
    'hearing_damage'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier sources de bruit principales',
      'Remplacer par équipements silencieux',
      'Modifier procédés bruyants',
      'Automatiser opérations bruyantes',
      'Relocaliser sources de bruit'
    ],
    en: [
      'Identify main noise sources',
      'Replace with quiet equipment',
      'Modify noisy processes',
      'Automate noisy operations',
      'Relocate noise sources'
    ]
  },
  
  estimatedCost: {
    amount: 8000,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '1-3 semaines',
  riskReduction: 100,
  sustainabilityRating: 4,
  
  regulatoryRequirements: {
    csa: ['CSA Z107.56'],
    rsst: ['Section VI - Bruit'],
    other: []
  },
  
  tags: ['elimination', 'bruit', 'equipements_silencieux', 'automatisation']
});

export const eliminateManualLifting: ControlMeasure = createNewControlMeasure({
  id: 'eliminate_manual_lifting',
  name: 'Éliminer la manutention manuelle',
  category: 'elimination',
  hierarchyLevel: 1,
  displayName: {
    fr: 'Élimination manutention manuelle',
    en: 'Elimination of manual lifting'
  },
  description: 'Supprimer complètement le besoin de manutention manuelle par automatisation',
  
  effectiveness: 5,
  
  applicableHazards: [
    'repetitive_strain_injury',
    'manual_lifting_heavy_loads',
    'back_injuries'
  ],
  
  implementationSteps: {
    fr: [
      'Installer systèmes de convoyage',
      'Utiliser équipements de levage automatisés',
      'Réorganiser flux de matériaux',
      'Implanter robots de manutention',
      'Modifier conception postes'
    ],
    en: [
      'Install conveyor systems',
      'Use automated lifting equipment',
      'Reorganize material flow',
      'Implement handling robots',
      'Modify workstation design'
    ]
  },
  
  estimatedCost: {
    amount: 25000,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '4-8 semaines',
  riskReduction: 100,
  sustainabilityRating: 5,
  maintenanceRequired: true,
  maintenanceFrequency: 'Trimestrielle',
  
  regulatoryRequirements: {
    csa: ['CSA Z412'],
    rsst: ['Art. 166-172 - Manutention'],
    other: []
  },
  
  skillLevel: 'advanced',
  
  tags: ['elimination', 'manutention', 'automatisation', 'convoyage', 'robotique']
});

// =================== EXPORT MESURES ÉLIMINATION ===================
export const eliminationMeasures = [
  eliminateHeightWork,
  eliminateConfinedSpace,
  eliminateChemicalUse,
  eliminateNoiseSource,
  eliminateManualLifting
];

export const eliminationMeasuresById = eliminationMeasures.reduce((acc, measure) => {
  acc[measure.id] = measure;
  return acc;
}, {} as Record<string, ControlMeasure>);

export default eliminationMeasures;
