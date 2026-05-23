// app/data/controlMeasures/administrative.ts
import { ControlMeasure, createNewControlMeasure } from './template';

// =================== CONTRÔLES ADMINISTRATIFS ===================

export const safetyTrainingProgram: ControlMeasure = createNewControlMeasure({
  id: 'comprehensive_safety_training',
  name: 'Programme de formation sécurité',
  category: 'administrative',
  hierarchyLevel: 4,
  displayName: {
    fr: 'Programme de formation sécurité complet',
    en: 'Comprehensive safety training program'
  },
  description: 'Formation structurée du personnel sur tous aspects sécurité travail',
  
  effectiveness: 3,
  
  applicableHazards: [
    'general_workplace_hazards',
    'equipment_operation_risks',
    'emergency_response',
    'hazard_recognition'
  ],
  
  applicableWorkTypes: [
    'all_work_types'
  ],
  
  applicableIndustries: ['tous_secteurs'],
  
  implementationSteps: {
    fr: [
      'Évaluer besoins formation par poste',
      'Développer modules formation spécifiques',
      'Planifier sessions formation théorique',
      'Organiser formation pratique terrain',
      'Évaluer compétences acquises',
      'Certifier personnel formé',
      'Programmer formations recyclage'
    ],
    en: [
      'Assess training needs per position',
      'Develop specific training modules',
      'Schedule theoretical training sessions',
      'Organize practical field training',
      'Evaluate acquired competencies',
      'Certify trained personnel',
      'Schedule refresher training'
    ]
  },
  
  requiredResources: [
    'Formateurs qualifiés certifiés',
    'Matériel pédagogique',
    'Salles formation équipées',
    'Équipements démonstration',
    'Documentation formation'
  ],
  
  estimatedCost: {
    amount: 200,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Formation initiale + recyclage'
  },
  
  implementationTime: '2-4 semaines',
  riskReduction: 40,
  sustainabilityRating: 3,
  maintenanceRequired: true,
  maintenanceFrequency: 'Annuelle',
  
  regulatoryRequirements: {
    csa: ['Formation selon normes applicables'],
    rsst: ['Art. 51 - Information formation'],
    other: ['Loi sur la santé et sécurité travail']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Efficacité dépend engagement personnel',
    'Temps formation impact productivité',
    'Coûts récurrents formation',
    'Roulement personnel nécessite re-formation'
  ],
  
  prerequisites: [
    'Identification besoins formation',
    'Budget formation alloué',
    'Formateurs qualifiés disponibles'
  ],
  
  potentialSideEffects: [
    'Temps production réduit pendant formation',
    'Résistance changements comportements',
    'Surcharge cognitive information'
  ],
  
  monitoringRequired: true,
  trainingRequired: false, // C'est la mesure elle-même
  skillLevel: 'basic',
  certificationRequired: true,
  
  compatibleMeasures: [
    'safety_procedures_written',
    'safety_supervision',
    'incident_reporting_system'
  ],
  
  tags: ['administrative', 'formation', 'competences', 'certification', 'obligatoire']
});

export const safetyProcedures: ControlMeasure = createNewControlMeasure({
  id: 'written_safety_procedures',
  name: 'Procédures de travail sécuritaires',
  category: 'administrative',
  hierarchyLevel: 4,
  displayName: {
    fr: 'Procédures de travail sécuritaires écrites',
    en: 'Written safe work procedures'
  },
  description: 'Documentation détaillée des méthodes de travail sécuritaires',
  
  effectiveness: 3,
  
  applicableHazards: [
    'procedural_errors',
    'unsafe_work_practices',
    'equipment_misuse'
  ],
  
  implementationSteps: {
    fr: [
      'Analyser tâches et dangers associés',
      'Rédiger procédures étape par étape',
      'Intégrer mesures sécurité spécifiques',
      'Faire réviser par experts terrain',
      'Tester procédures conditions réelles',
      'Former personnel aux procédures',
      'Réviser périodiquement'
    ],
    en: [
      'Analyze tasks and associated hazards',
      'Write step-by-step procedures',
      'Integrate specific safety measures',
      'Have field experts review',
      'Test procedures under real conditions',
      'Train personnel on procedures',
      'Review periodically'
    ]
  },
  
  requiredResources: [
    'Experts rédaction procédures',
    'Personnel terrain expérimenté',
    'Systèmes documentation',
    'Outils communication'
  ],
  
  estimatedCost: {
    amount: 1500,
    currency: 'CAD',
    unit: 'per_project',
    timeframe: 'Développement procédures'
  },
  
  implementationTime: '2-3 semaines',
  riskReduction: 35,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Annuelle',
  
  regulatoryRequirements: {
    csa: ['Documentation selon normes'],
    rsst: ['Méthodes de travail sécuritaires'],
    other: []
  },
  
  complianceLevel: 'recommended',
  
  limitations: [
    'Efficacité dépend application terrain',
    'Mise à jour régulière requise',
    'Résistance changements habitudes'
  ],
  
  prerequisites: [
    'Analyse détaillée tâches',
    'Personnel expert disponible',
    'Systèmes documentation place'
  ],
  
  trainingRequired: true,
  skillLevel: 'intermediate',
  
  compatibleMeasures: [
    'comprehensive_safety_training',
    'safety_supervision',
    'regular_safety_audits'
  ],
  
  tags: ['administrative', 'procedures', 'documentation', 'formation_requise']
});

export const workPermitSystem: ControlMeasure = createNewControlMeasure({
  id: 'work_permit_authorization',
  name: 'Système de permis de travail',
  category: 'administrative',
  hierarchyLevel: 4,
  displayName: {
    fr: 'Système permis de travail et autorisations',
    en: 'Work permit and authorization system'
  },
  description: 'Contrôle administratif des travaux à risque par système permis',
  
  effectiveness: 4,
  
  applicableHazards: [
    'confined_space_entry',
    'hot_work_operations',
    'electrical_work',
    'excavation_work',
    'working_at_height'
  ],
  
  implementationSteps: {
    fr: [
      'Identifier travaux nécessitant permis',
      'Développer formulaires permis spécifiques',
      'Établir processus autorisation',
      'Former personnel émission permis',
      'Implanter système suivi',
      'Auditer application système'
    ],
    en: [
      'Identify work requiring permits',
      'Develop specific permit forms',
      'Establish authorization process',
      'Train permit issuing personnel',
      'Implement tracking system',
      'Audit system application'
    ]
  },
  
  requiredResources: [
    'Formulaires permis standardisés',
    'Personnel autorisé émission',
    'Système suivi documentaire',
    'Procédures validation'
  ],
  
  estimatedCost: {
    amount: 100,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Formation et mise en place'
  },
  
  implementationTime: '1-2 semaines',
  riskReduction: 50,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Continue',
  
  regulatoryRequirements: {
    csa: ['CSA Z1006 (espaces clos)', 'CSA Z462 (électrique)'],
    rsst: ['Permis selon travaux'],
    other: ['Codes municipaux']
  },
  
  complianceLevel: 'mandatory',
  
  limitations: [
    'Délais émission permis',
    'Charge administrative',
    'Résistance personnel terrain'
  ],
  
  prerequisites: [
    'Système documentation place',
    'Personnel formé autorisations',
    'Procédures claires établies'
  ],
  
  monitoringRequired: true,
  trainingRequired: true,
  skillLevel: 'intermediate',
  certificationRequired: true,
  
  tags: ['administrative', 'permis', 'autorisation', 'documentation', 'obligatoire']
});

export const jobRotationSchedule: ControlMeasure = createNewControlMeasure({
  id: 'job_rotation_exposure_control',
  name: 'Rotation des postes de travail',
  category: 'administrative',
  hierarchyLevel: 4,
  displayName: {
    fr: 'Rotation postes pour contrôle exposition',
    en: 'Job rotation for exposure control'
  },
  description: 'Rotation systématique du personnel pour limiter exposition aux dangers',
  
  effectiveness: 3,
  
  applicableHazards: [
    'repetitive_strain_injury',
    'noise_exposure',
    'chemical_exposure_chronic',
    'ergonomic_hazards'
  ],
  
  implementationSteps: {
    fr: [
      'Évaluer niveaux exposition par poste',
      'Identifier postes rotation compatibles',
      'Planifier horaires rotation',
      'Former personnel postes multiples',
      'Implanter système suivi exposition',
      'Surveiller efficacité rotation'
    ],
    en: [
      'Evaluate exposure levels per position',
      'Identify compatible rotation positions',
      'Plan rotation schedules',
      'Train personnel on multiple positions',
      'Implement exposure tracking system',
      'Monitor rotation effectiveness'
    ]
  },
  
  requiredResources: [
    'Évaluation exposition postes',
    'Formation polyvalence',
    'Système planification',
    'Suivi médical si requis'
  ],
  
  estimatedCost: {
    amount: 150,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Formation polyvalence'
  },
  
  implementationTime: '2-4 semaines',
  riskReduction: 30,
  sustainabilityRating: 3,
  maintenanceRequired: true,
  maintenanceFrequency: 'Continue',
  
  limitations: [
    'Complexité planification',
    'Formation polyvalence requise',
    'Possible baisse productivité initiale',
    'Résistance changements'
  ],
  
  prerequisites: [
    'Évaluation exposition détaillée',
    'Postes compatibles identifiés',
    'Personnel accepte polyvalence'
  ],
  
  trainingRequired: true,
  skillLevel: 'basic',
  
  tags: ['administrative', 'rotation', 'exposition', 'polyvalence', 'planification']
});

export const safetyInspections: ControlMeasure = createNewControlMeasure({
  id: 'regular_safety_inspections',
  name: 'Inspections sécurité régulières',
  category: 'administrative',
  hierarchyLevel: 4,
  displayName: {
    fr: 'Programme inspections sécurité régulières',
    en: 'Regular safety inspection program'
  },
  description: 'Inspections systématiques pour identifier et corriger dangers',
  
  effectiveness: 3,
  
  applicableHazards: [
    'equipment_deterioration',
    'housekeeping_hazards',
    'maintenance_deficiencies'
  ],
  
  implementationSteps: {
    fr: [
      'Développer listes vérification',
      'Former inspecteurs qualifiés',
      'Planifier inspections périodiques',
      'Documenter observations',
      'Prioriser actions correctives',
      'Suivre fermeture items',
      'Analyser tendances'
    ],
    en: [
      'Develop inspection checklists',
      'Train qualified inspectors',
      'Schedule periodic inspections',
      'Document observations',
      'Prioritize corrective actions',
      'Track item closure',
      'Analyze trends'
    ]
  },
  
  estimatedCost: {
    amount: 75,
    currency: 'CAD',
    unit: 'per_worker',
    timeframe: 'Programme annuel'
  },
  
  implementationTime: '1 semaine',
  riskReduction: 25,
  sustainabilityRating: 4,
  maintenanceRequired: true,
  maintenanceFrequency: 'Continue',
  
  regulatoryRequirements: {
    csa: ['Inspections selon normes'],
    rsst: ['Inspection lieux travail'],
    other: []
  },
  
  complianceLevel: 'recommended',
  
  trainingRequired: true,
  skillLevel: 'intermediate',
  
  compatibleMeasures: [
    'incident_reporting_system',
    'corrective_action_tracking',
    'safety_committee_meetings'
  ],
  
  tags: ['administrative', 'inspection', 'surveillance', 'documentation', 'tendances']
});

// =================== EXPORT CONTRÔLES ADMINISTRATIFS ===================
export const administrativeMeasures = [
  safetyTrainingProgram,
  safetyProcedures,
  workPermitSystem,
  jobRotationSchedule,
  safetyInspections
];

export const administrativeMeasuresById = administrativeMeasures.reduce((acc, measure) => {
  acc[measure.id] = measure;
  return acc;
}, {} as Record<string, ControlMeasure>);

export default administrativeMeasures;
