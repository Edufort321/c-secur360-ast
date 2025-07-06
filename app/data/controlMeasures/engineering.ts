// app/data/controlMeasures/engineering.ts
import { ControlMeasure, createNewControlMeasure } from './template';

// =================== CONTRÔLES D'INGÉNIERIE ===================

export const ventilationSystem: ControlMeasure = createNewControlMeasure({
  id: 'local_exhaust_ventilation',
  name: 'Ventilation d\'extraction locale',
  category: 'engineering',
  hierarchyLevel: 3,
  displayName: {
    fr: 'Système de ventilation d\'extraction locale',
    en: 'Local exhaust ventilation system'
  },
  description: 'Captage et évacuation des contaminants à la source par ventilation mécanique',
  
  effectiveness: 4,
  
  applicableHazards: [
    'hazardous_chemical_exposure',
    'organic_solvents_vapors',
    'welding_fumes',
    'dust_particles'
  ],
  
  applicableWorkTypes: [
    'chemical_operations',
    'welding_fabrication',
    'painting_coating',
    'grinding_cutting'
  ],
  
  implementationSteps: {
    fr: [
      'Évaluer besoins captage selon contaminants',
      'Calculer débits d\'air requis',
      'Concevoir système captage à la source',
      'Installer conduits et ventilateurs',
      'Tester efficacité captage',
      'Établir programme maintenance préventive'
    ],
    en: [
      'Assess capture needs per contaminants',
      'Calculate required air flows',
      'Design source capture system',
      'Install ducts and fans',
      'Test capture effectiveness',
      'Establish preventive maintenance program'
    ]
  },
  
  requiredResources: [
    'Ventilateurs industriels',
    'Conduits résistants corrosion',
    'Hottes de captage',
    'Systèmes filtration',
    'Instrumentation débit/pression'
  ],
  
  estimatedCost: {
    amount: 8000,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Installation système'
  },
  
  implementationTime: '2-4 semaines',
  riskReduction: 70,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Mensuelle',
  
  regulatoryRequirements: {
    csa: ['CSA Z94.4'],
    rsst: ['Ventilation des lieux de travail'],
    other: ['ASHRAE 62.1', 'ACGIH Industrial Ventilation Manual']
  },
  
  complianceLevel: 'recommended',
  
  limitations: [
    'Efficacité dépend conception',
    'Coûts énergie opération',
    'Maintenance régulière critique',
    'Bruit ventilateurs'
  ],
  
  prerequisites: [
    'Étude ingénierie ventilation',
    'Alimentation électrique adéquate',
    'Espace installation conduits'
  ],
  
  potentialSideEffects: [
    'Augmentation consommation énergie',
    'Bruit ambiant accru',
    'Courants d\'air zones travail'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'intermediate',
  certificationRequired: false,
  
  compatibleMeasures: [
    'substitute_safer_chemicals',
    'ppe_respiratory_protection',
    'administrative_exposure_limits'
  ],
  
  incompatibleMeasures: [
    'eliminate_chemical_use' // Si chimiques éliminés, ventilation moins critique
  ],
  
  tags: ['engineering', 'ventilation', 'captage_source', 'maintenance_requise']
});

export const machineGuarding: ControlMeasure = createNewControlMeasure({
  id: 'machine_safety_guards',
  name: 'Protecteurs de machines',
  category: 'engineering',
  hierarchyLevel: 3,
  displayName: {
    fr: 'Protecteurs et dispositifs de sécurité machines',
    en: 'Machine safety guards and devices'
  },
  description: 'Barrières physiques et dispositifs préventifs pour machines dangereuses',
  
  effectiveness: 4,
  
  applicableHazards: [
    'moving_mechanical_parts',
    'crushing_injuries',
    'cutting_hazards',
    'pinch_points'
  ],
  
  applicableWorkTypes: [
    'manufacturing_operations',
    'mechanical_maintenance',
    'fabrication_machining'
  ],
  
  implementationSteps: {
    fr: [
      'Analyser points de pincement et coupure',
      'Sélectionner types protecteurs appropriés',
      'Installer protecteurs fixes et mobiles',
      'Intégrer verrouillages sécurité',
      'Tester fonctionnement systèmes',
      'Former opérateurs utilisation sécuritaire'
    ],
    en: [
      'Analyze pinch and cutting points',
      'Select appropriate guard types',
      'Install fixed and movable guards',
      'Integrate safety interlocks',
      'Test system operation',
      'Train operators on safe use'
    ]
  },
  
  requiredResources: [
    'Protecteurs certifiés CSA',
    'Systèmes verrouillage',
    'Barrières lumineuses',
    'Dispositifs arrêt urgence'
  ],
  
  estimatedCost: {
    amount: 2500,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Par machine protégée'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 85,
  sustainabilityRating: 5,
  maintenanceRequired: true,
  maintenanceFrequency: 'Trimestrielle',
  
  regulatoryRequirements: {
    csa: ['CSA Z432', 'CSA Z434'],
    rsst: ['Section IX - Machines'],
    other: ['ISO 12100', 'ISO 13849']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Peut ralentir certaines opérations',
    'Accès maintenance plus complexe',
    'Coûts installation et maintenance'
  ],
  
  prerequisites: [
    'Évaluation risques machines',
    'Sélection dispositifs certifiés',
    'Formation personnel maintenance'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'intermediate',
  certificationRequired: false,
  
  compatibleMeasures: [
    'administrative_lockout_procedures',
    'ppe_general_protection',
    'training_machine_safety'
  ],
  
  tags: ['engineering', 'protecteurs', 'machines', 'verrouillage', 'obligatoire']
});

export const noiseEnclosures: ControlMeasure = createNewControlMeasure({
  id: 'noise_control_enclosures',
  name: 'Encoffrements acoustiques',
  category: 'engineering',
  hierarchyLevel: 3,
  displayName: {
    fr: 'Encoffrements et traitement acoustique',
    en: 'Acoustic enclosures and treatment'
  },
  description: 'Isolation et traitement acoustique des sources de bruit',
  
  effectiveness: 4,
  
  applicableHazards: [
    'excessive_noise_exposure'
  ],
  
  implementationSteps: {
    fr: [
      'Mesurer niveaux sonores sources',
      'Concevoir encoffrements acoustiques',
      'Installer matériaux absorbants',
      'Créer barrières acoustiques',
      'Vérifier réduction obtenue',
      'Optimiser selon résultats'
    ],
    en: [
      'Measure source noise levels',
      'Design acoustic enclosures',
      'Install absorbing materials',
      'Create acoustic barriers',
      'Verify achieved reduction',
      'Optimize based on results'
    ]
  },
  
  requiredResources: [
    'Matériaux absorbants acoustiques',
    'Panneaux isolants phoniques',
    'Structures encoffrement',
    'Sonomètre vérification'
  ],
  
  estimatedCost: {
    amount: 3500,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '1-3 semaines',
  riskReduction: 60,
  sustainabilityRating: 5,
  maintenanceRequired: true,
  maintenanceFrequency: 'Annuelle',
  
  regulatoryRequirements: {
    csa: ['CSA Z107.56'],
    rsst: ['Section VI - Bruit'],
    other: []
  },
  
  limitations: [
    'Efficacité variable selon fréquences',
    'Accès maintenance équipements',
    'Ventilation encoffrements requise'
  ],
  
  trainingRequired: false,
  skillLevel: 'intermediate',
  
  tags: ['engineering', 'acoustique', 'encoffrement', 'absorption', 'barrières']
});

export const fallProtectionSystems: ControlMeasure = createNewControlMeasure({
  id: 'permanent_fall_protection',
  name: 'Systèmes protection chutes permanents',
  category: 'engineering',
  hierarchyLevel: 3,
  displayName: {
    fr: 'Systèmes permanents protection contre chutes',
    en: 'Permanent fall protection systems'
  },
  description: 'Installation de garde-corps, filets et systèmes permanents anti-chute',
  
  effectiveness: 4,
  
  applicableHazards: [
    'working_at_height',
    'fall_from_elevation',
    'opening_hazards'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier zones exposition chutes',
      'Concevoir garde-corps conformes',
      'Installer systèmes ancrage permanents',
      'Poser filets sécurité si requis',
      'Tester résistance installations',
      'Marquer zones protection'
    ],
    en: [
      'Identify fall exposure areas',
      'Design compliant guardrails',
      'Install permanent anchor systems',
      'Install safety nets if required',
      'Test installation strength',
      'Mark protection zones'
    ]
  },
  
  requiredResources: [
    'Garde-corps certifiés CSA',
    'Points ancrage 22kN',
    'Filets sécurité',
    'Systèmes rails glissants'
  ],
  
  estimatedCost: {
    amount: 150,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Par mètre linéaire'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 90,
  sustainabilityRating: 5,
  maintenanceRequired: true,
  maintenanceFrequency: 'Annuelle',
  
  regulatoryRequirements: {
    csa: ['CSA Z259.1', 'CSA Z259.10'],
    rsst: ['Section VII - Protection contre chutes'],
    other: ['Code construction']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Coûts installation élevés',
    'Modifications structures existantes',
    'Accès certaines zones restreint'
  ],
  
  prerequisites: [
    'Analyse structurelle points fixation',
    'Calculs résistance charges',
    'Permis modification structures'
  ],
  
  trainingRequired: true,
  skillLevel: 'advanced',
  certificationRequired: true,
  
  compatibleMeasures: [
    'ppe_fall_arrest_equipment',
    'administrative_height_procedures',
    'training_fall_protection'
  ],
  
  tags: ['engineering', 'chutes', 'garde_corps', 'permanent', 'structural']
});

export const emergencyShutoffs: ControlMeasure = createNewControlMeasure({
  id: 'emergency_shutdown_systems',
  name: 'Systèmes d\'arrêt d\'urgence',
  category: 'engineering',
  hierarchyLevel: 3,
  displayName: {
    fr: 'Systèmes d\'arrêt d\'urgence automatiques',
    en: 'Automatic emergency shutdown systems'
  },
  description: 'Dispositifs d\'arrêt automatique en cas de conditions dangereuses',
  
  effectiveness: 4,
  
  applicableHazards: [
    'equipment_malfunction',
    'process_upset_conditions',
    'fire_explosion_risk',
    'toxic_release'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier conditions déclenchement',
      'Installer capteurs surveillance',
      'Programmer logiques arrêt',
      'Connecter systèmes isolation',
      'Tester séquences urgence',
      'Former personnel procédures'
    ],
    en: [
      'Identify trigger conditions',
      'Install monitoring sensors',
      'Program shutdown logic',
      'Connect isolation systems',
      'Test emergency sequences',
      'Train personnel on procedures'
    ]
  },
  
  requiredResources: [
    'Capteurs process certifiés',
    'Systèmes contrôle sécurité',
    'Vannes arrêt automatique',
    'Alimentation secours'
  ],
  
  estimatedCost: {
    amount: 12000,
    currency: 'CAD',
    unit: 'per_project'
  },
  
  implementationTime: '3-6 semaines',
  riskReduction: 75,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Mensuelle',
  
  regulatoryRequirements: {
    csa: ['CSA Z432'],
    rsst: ['Systèmes sécurité process'],
    other: ['IEC 61508', 'ISA 84']
  },
  
  complianceLevel: 'recommended',
  
  limitations: [
    'Complexité systèmes',
    'Coûts maintenance élevés',
    'Arrêts intempestifs possibles',
    'Formation spécialisée requise'
  ],
  
  prerequisites: [
    'Analyse sécurité fonctionnelle',
    'Spécification SIL approprié',
    'Personnel qualifié maintenance'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'expert',
  certificationRequired: true,
  
  tags: ['engineering', 'urgence', 'automatique', 'capteurs', 'process']
});

// =================== EXPORT CONTRÔLES INGÉNIERIE ===================
export const engineeringMeasures = [
  ventilationSystem,
  machineGuarding,
  noiseEnclosures,
  fallProtectionSystems,
  emergencyShutoffs
];

export const engineeringMeasuresById = engineeringMeasures.reduce((acc, measure) => {
  acc[measure.id] = measure;
  return acc;
}, {} as Record<string, ControlMeasure>);

export default engineeringMeasures;
