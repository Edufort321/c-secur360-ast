// app/data/controlMeasures/ppe.ts
import { ControlMeasure, createNewControlMeasure } from './template';

// =================== ÉQUIPEMENTS DE PROTECTION INDIVIDUELLE ===================

export const respiratoryProtection: ControlMeasure = createNewControlMeasure({
  id: 'respiratory_protection_program',
  name: 'Programme protection respiratoire',
  category: 'ppe',
  hierarchyLevel: 5,
  displayName: {
    fr: 'Programme de protection respiratoire',
    en: 'Respiratory protection program'
  },
  description: 'Protection individuelle voies respiratoires contre inhalation contaminants',
  
  effectiveness: 2,
  
  applicableHazards: [
    'hazardous_chemical_exposure',
    'dust_particles',
    'organic_solvents_vapors',
    'biological_aerosols',
    'asbestos_fiber_exposure'
  ],
  
  applicableWorkTypes: [
    'chemical_operations',
    'asbestos_remediation',
    'spray_painting',
    'grinding_operations'
  ],
  
  implementationSteps: {
    fr: [
      'Évaluer contaminants atmosphériques',
      'Sélectionner équipements appropriés',
      'Effectuer tests d\'ajustement',
      'Former utilisateurs',
      'Établir programme maintenance',
      'Surveiller utilisation correcte',
      'Remplacer selon échéancier'
    ],
    en: [
      'Evaluate atmospheric contaminants',
      'Select appropriate equipment',
      'Perform fit testing',
      'Train users',
      'Establish maintenance program',
      'Monitor correct usage',
      'Replace per schedule'
    ]
  },
  
  requiredResources: [
    'Appareils respiratoires certifiés',
    'Équipement test ajustement',
    'Cartouches/filtres appropriés',
    'Programme formation',
    'Système suivi maintenance'
  ],
  
  estimatedCost: {
    amount: 300,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Équipement initial + formation'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 60,
  sustainabilityRating: 2,
  maintenanceRequired: true,
  maintenanceFrequency: 'Quotidienne',
  
  regulatoryRequirements: {
    csa: ['CSA Z94.4'],
    rsst: ['Protection respiratoire'],
    other: ['NIOSH 42CFR84']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Efficacité dépend ajustement correct',
    'Inconfort port prolongé',
    'Formation obligatoire utilisateurs',
    'Maintenance quotidienne critique',
    'Coûts récurrents élevés'
  ],
  
  prerequisites: [
    'Évaluation atmosphérique complète',
    'Tests ajustement professionnels',
    'Formation utilisateurs certifiée',
    'Surveillance médicale si requis'
  ],
  
  potentialSideEffects: [
    'Fatigue respiratoire',
    'Stress thermique accru',
    'Communication difficile',
    'Vision périphérique réduite'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'intermediate',
  certificationRequired: true,
  
  compatibleMeasures: [
    'local_exhaust_ventilation',
    'substitute_safer_chemicals',
    'air_quality_monitoring'
  ],
  
  incompatibleMeasures: [
    'eliminate_chemical_use' // Si chimiques éliminés, ÉPI moins nécessaire
  ],
  
  tags: ['ppe', 'respiratoire', 'test_ajustement', 'maintenance_quotidienne', 'formation_obligatoire']
});

export const fallProtectionPPE: ControlMeasure = createNewControlMeasure({
  id: 'fall_protection_ppe_program',
  name: 'ÉPI protection contre chutes',
  category: 'ppe',
  hierarchyLevel: 5,
  displayName: {
    fr: 'Équipements protection individuelle chutes',
    en: 'Personal fall protection equipment'
  },
  description: 'Harnais, longes et équipements individuels protection chutes',
  
  effectiveness: 3,
  
  applicableHazards: [
    'working_at_height',
    'fall_from_elevation',
    'temporary_work_platforms'
  ],
  
  implementationSteps: {
    fr: [
      'Évaluer points chute potentiels',
      'Sélectionner harnais appropriés',
      'Installer points ancrage certifiés',
      'Former utilisateurs techniques',
      'Inspecter équipements quotidiennement',
      'Calculer tirant d\'air',
      'Établir procédures sauvetage'
    ],
    en: [
      'Evaluate potential fall points',
      'Select appropriate harnesses',
      'Install certified anchor points',
      'Train users on techniques',
      'Inspect equipment daily',
      'Calculate clearance distances',
      'Establish rescue procedures'
    ]
  },
  
  requiredResources: [
    'Harnais complets certifiés',
    'Longes avec absorbeur énergie',
    'Points ancrage 22kN',
    'Équipements sauvetage',
    'Formation spécialisée'
  ],
  
  estimatedCost: {
    amount: 400,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Équipement complet'
  },
  
  implementationTime: '1 semaine',
  riskReduction: 85,
  sustainabilityRating: 3,
  maintenanceRequired: true,
  maintenanceFrequency: 'Quotidienne',
  
  regulatoryRequirements: {
    csa: ['CSA Z259.10', 'CSA Z259.11'],
    rsst: ['Section VII - Protection chutes'],
    other: ['ANSI Z359']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Requiert points ancrage adéquats',
    'Calculs tirant d\'air critiques',
    'Plan sauvetage obligatoire',
    'Formation spécialisée requise',
    'Inspection quotidienne'
  ],
  
  prerequisites: [
    'Points ancrage certifiés disponibles',
    'Formation protection chutes',
    'Plan sauvetage établi',
    'Calculs ingénierie complétés'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'advanced',
  certificationRequired: true,
  
  compatibleMeasures: [
    'permanent_fall_protection',
    'fall_protection_training',
    'rescue_procedures'
  ],
  
  tags: ['ppe', 'chutes', 'harnais', 'ancrage', 'sauvetage', 'calculs_ingenierie']
});

export const eyeFaceProtection: ControlMeasure = createNewControlMeasure({
  id: 'eye_face_protection_program',
  name: 'Protection yeux et visage',
  category: 'ppe',
  hierarchyLevel: 5,
  displayName: {
    fr: 'Protection individuelle yeux et visage',
    en: 'Individual eye and face protection'
  },
  description: 'Lunettes, écrans et équipements protection oculaire/faciale',
  
  effectiveness: 3,
  
  applicableHazards: [
    'flying_particles',
    'chemical_splash',
    'welding_radiation',
    'laser_exposure',
    'impact_hazards'
  ],
  
  implementationSteps: {
    fr: [
      'Évaluer risques oculaires/faciaux',
      'Sélectionner protection appropriée',
      'Vérifier compatibilité autres ÉPI',
      'Former utilisateurs',
      'Entretenir selon fabricant',
      'Remplacer si endommagés'
    ],
    en: [
      'Evaluate eye/face hazards',
      'Select appropriate protection',
      'Check compatibility with other PPE',
      'Train users',
      'Maintain per manufacturer',
      'Replace if damaged'
    ]
  },
  
  requiredResources: [
    'Lunettes sécurité certifiées',
    'Écrans faciaux appropriés',
    'Produits nettoyage',
    'Étuis protection'
  ],
  
  estimatedCost: {
    amount: 50,
    currency: 'CAD',
    unit: 'per_worker'
  },
  
  implementationTime: '2-3 jours',
  riskReduction: 70,
  sustainabilityRating: 3,
  maintenanceRequired: true,
  maintenanceFrequency: 'Quotidienne',
  
  regulatoryRequirements: {
    csa: ['CSA Z94.3'],
    rsst: ['Protection oculaire'],
    other: ['ANSI Z87.1']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Vision périphérique peut être réduite',
    'Buée par conditions humides',
    'Compatibilité autres ÉPI',
    'Nettoyage fréquent requis'
  ],
  
  trainingRequired: true,
  skillLevel: 'basic',
  
  compatibleMeasures: [
    'machine_safety_guards',
    'process_containment',
    'safety_procedures'
  ],
  
  tags: ['ppe', 'yeux', 'visage', 'lunettes', 'projection', 'radiation']
});

export const handProtectionProgram: ControlMeasure = createNewControlMeasure({
  id: 'hand_protection_program',
  name: 'Protection des mains',
  category: 'ppe',
  hierarchyLevel: 5,
  displayName: {
    fr: 'Programme protection des mains',
    en: 'Hand protection program'
  },
  description: 'Gants spécialisés selon dangers : coupures, chimiques, électriques',
  
  effectiveness: 3,
  
  applicableHazards: [
    'sharp_objects',
    'chemical_contact',
    'electrical_shock',
    'thermal_burns',
    'vibration_exposure'
  ],
  
  implementationSteps: {
    fr: [
      'Analyser dangers spécifiques mains',
      'Sélectionner gants appropriés',
      'Vérifier résistance chimique',
      'Tester ajustement et dextérité',
      'Former utilisation correcte',
      'Inspecter avant usage',
      'Remplacer selon usure'
    ],
    en: [
      'Analyze specific hand hazards',
      'Select appropriate gloves',
      'Verify chemical resistance',
      'Test fit and dexterity',
      'Train correct usage',
      'Inspect before use',
      'Replace per wear'
    ]
  },
  
  requiredResources: [
    'Gants spécialisés certifiés',
    'Tableaux compatibilité chimique',
    'Programme inspection',
    'Formation spécifique'
  ],
  
  estimatedCost: {
    amount: 80,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Assortiment gants'
  },
  
  implementationTime: '3-5 jours',
  riskReduction: 65,
  sustainabilityRating: 2,
  maintenanceRequired: true,
  maintenanceFrequency: 'Quotidienne',
  
  regulatoryRequirements: {
    csa: ['CSA Z96'],
    rsst: ['Protection mains'],
    other: ['ANSI/ISEA 105']
  },
  
  limitations: [
    'Dextérité réduite',
    'Usure rapide selon usage',
    'Compatibilité chimique critique',
    'Taille appropriée essentielle'
  ],
  
  prerequisites: [
    'Évaluation dangers mains',
    'Sélection gants appropriés',
    'Tests compatibilité'
  ],
  
  trainingRequired: true,
  skillLevel: 'basic',
  
  tags: ['ppe', 'mains', 'gants', 'chimiques', 'coupures', 'dexterite']
});

export const hearingProtectionProgram: ControlMeasure = createNewControlMeasure({
  id: 'hearing_protection_program',
  name: 'Protection auditive',
  category: 'ppe',
  hierarchyLevel: 5,
  displayName: {
    fr: 'Programme protection auditive',
    en: 'Hearing protection program'
  },
  description: 'Protecteurs auditifs contre exposition bruit excessif',
  
  effectiveness: 2,
  
  applicableHazards: [
    'excessive_noise_exposure'
  ],
  
  implementationSteps: {
    fr: [
      'Mesurer niveaux sonores postes',
      'Calculer réduction bruit requise',
      'Sélectionner protecteurs appropriés',
      'Former insertion/ajustement',
      'Surveiller utilisation correcte',
      'Audiométrie périodique',
      'Remplacer selon usure'
    ],
    en: [
      'Measure workplace noise levels',
      'Calculate required noise reduction',
      'Select appropriate protectors',
      'Train insertion/fitting',
      'Monitor correct usage',
      'Periodic audiometry',
      'Replace per wear schedule'
    ]
  },
  
  requiredResources: [
    'Protecteurs auditifs certifiés',
    'Sonomètre vérification',
    'Tests audiométriques',
    'Formation ajustement'
  ],
  
  estimatedCost: {
    amount: 40,
    currency: 'CAD',
    unit: 'per_worker'
  },
  
  implementationTime: '2-3 jours',
  riskReduction: 50,
  sustainabilityRating: 2,
  maintenanceRequired: true,
  maintenanceFrequency: 'Quotidienne',
  
  regulatoryRequirements: {
    csa: ['CSA Z94.2'],
    rsst: ['Section VI - Bruit'],
    other: ['ANSI S3.19']
  },
  
  limitations: [
    'Communication difficile',
    'Inconfort port prolongé',
    'Efficacité dépend ajustement',
    'Surveillance médicale requise'
  ],
  
  prerequisites: [
    'Évaluation exposition bruit',
    'Sélection NRR approprié',
    'Programme audiométrie'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'basic',
  
  compatibleMeasures: [
    'noise_control_enclosures',
    'substitute_quieter_equipment',
    'audiometric_testing'
  ],
  
  tags: ['ppe', 'audition', 'bruit', 'nrr', 'audiometrie', 'communication']
});

// =================== EXPORT ÉPI ===================
export const ppeMeasures = [
  respiratoryProtection,
  fallProtectionPPE,
  eyeFaceProtection,
  handProtectionProgram,
  hearingProtectionProgram
];

export const ppeMeasuresById = ppeMeasures.reduce((acc, measure) => {
  acc[measure.id] = measure;
  return acc;
}, {} as Record<string, ControlMeasure>);

export default ppeMeasures;
