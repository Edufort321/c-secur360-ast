// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/REGULATIONS/ALBERTA.TS ===================
// Réglementations Alberta Occupational Health and Safety (OHS) pour espaces clos
"use client";

import type { 
  RegulatoryStandard,
  ComplianceMatrix,
  RegulatoryUpdate,
  StandardRevision,
  BilingualText,
  GasType,
  ProvinceCode
} from '../../types';

// =================== CONSTANTES ALBERTA OHS ===================

export const ALBERTA_PROVINCE_CODE: ProvinceCode = 'AB';

export const ALBERTA_AUTHORITY = {
  name: {
    fr: 'Alberta Occupational Health and Safety',
    en: 'Alberta Occupational Health and Safety'
  },
  acronym: 'Alberta OHS',
  jurisdiction: ['AB'] as ProvinceCode[],
  website: 'https://www.alberta.ca/ohs-legislation',
  contactInfo: {
    phone: '1-866-415-8690',
    emergencyLine: '911',
    email: 'ohs.info@gov.ab.ca',
    address: {
      street: '9515 - 107 Street NW',
      city: 'Edmonton',
      province: 'AB',
      postalCode: 'T5K 2C3'
    }
  },
  powers: {
    fr: [
      'Inspection des lieux de travail',
      'Émission d\'ordonnances d\'amélioration',
      'Émission d\'ordonnances d\'arrêt de travail',
      'Poursuites et amendes',
      'Investigation d\'accidents'
    ],
    en: [
      'Workplace inspections',
      'Issue improvement orders',
      'Issue stop work orders', 
      'Prosecutions and fines',
      'Accident investigations'
    ]
  }
} as const;

// =================== STANDARDS ALBERTA OHS ===================

export const ALBERTA_OHS_STANDARDS: Record<string, RegulatoryStandard> = {
  // Part 8 - Espaces clos (Section 117-128)
  'AB_OHS_PART8_CONFINED_SPACES': {
    id: 'AB_OHS_PART8_CONFINED_SPACES',
    name: {
      fr: 'Règlement Alberta OHS - Partie 8 : Espaces clos',
      en: 'Alberta OHS Regulation - Part 8: Confined Spaces'
    },
    type: 'safety',
    category: 'confined_space',
    authority: ALBERTA_AUTHORITY,
    jurisdiction: ['AB'],
    effectiveDate: new Date('2009-07-01').getTime(),
    lastUpdated: new Date('2023-01-01').getTime(),
    status: 'active',
    hierarchy: {
      parent: 'AB_OHS_REGULATION',
      level: 'section',
      section: 'Part 8',
      subsections: ['117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128']
    },
    scope: {
      workplaces: [
        'industrial',
        'construction', 
        'oil_and_gas',
        'mining',
        'utilities',
        'municipal',
        'agricultural'
      ],
      activities: [
        'confined_space_entry',
        'maintenance',
        'inspection',
        'cleaning',
        'repair',
        'construction_in_confined_space'
      ],
      equipment: [
        'tanks',
        'vessels',
        'silos',
        'sewers',
        'manholes',
        'pits',
        'trenches_over_4ft',
        'tunnels'
      ],
      exclusions: [
        'underground_mines_regulated_separately',
        'oil_and_gas_specific_regulations'
      ]
    },
    requirements: [
      {
        id: 'AB_OHS_117',
        name: {
          fr: 'Section 117 - Définitions',
          en: 'Section 117 - Definitions'
        },
        description: {
          fr: 'Définitions des termes relatifs aux espaces clos',
          en: 'Definitions of confined space related terms'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Espace clos défini comme espace substantiellement fermé',
            'Non conçu pour occupation humaine continue',
            'Accès limité pour entrée et sortie',
            'Peut présenter risques pour la santé et sécurité'
          ],
          en: [
            'Confined space defined as substantially enclosed space',
            'Not designed for continuous human occupancy',
            'Limited access for entry and exit',
            'May present health and safety hazards'
          ]
        },
        verification: {
          methods: ['visual_inspection', 'design_review', 'hazard_assessment'],
          documentation: ['space_classification', 'hazard_inventory'],
          frequency: 'before_each_entry'
        },
        penalties: {
          individual: { min: 0, max: 30000 },
          corporation: { min: 0, max: 500000 },
          description: {
            fr: 'Amendes pour non-conformité aux définitions et classifications',
            en: 'Fines for non-compliance with definitions and classifications'
          }
        }
      },
      {
        id: 'AB_OHS_118',
        name: {
          fr: 'Section 118 - Évaluation des dangers',
          en: 'Section 118 - Hazard Assessment'
        },
        description: {
          fr: 'Exigences d\'évaluation des dangers avant entrée en espace clos',
          en: 'Requirements for hazard assessment before confined space entry'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Évaluation écrite des dangers requise avant entrée',
            'Identification de tous les dangers potentiels',
            'Évaluation des risques atmosphériques',
            'Considération des dangers mécaniques, physiques et chimiques',
            'Révision lors de changement des conditions'
          ],
          en: [
            'Written hazard assessment required before entry',
            'Identification of all potential hazards',
            'Assessment of atmospheric hazards',
            'Consideration of mechanical, physical and chemical hazards',
            'Review when conditions change'
          ]
        },
        implementation: {
          timeline: 'before_each_entry',
          resources: ['qualified_assessor', 'detection_equipment', 'documentation'],
          responsibilities: ['employer', 'competent_supervisor', 'qualified_worker'],
          dependencies: ['worker_training', 'equipment_calibration']
        },
        verification: {
          methods: ['document_review', 'on_site_inspection', 'worker_interview'],
          evidence: ['written_assessment', 'signature_authorization', 'date_stamps'],
          nonCompliance: {
            indicators: ['missing_assessment', 'outdated_assessment', 'inadequate_scope'],
            actions: ['stop_work_order', 'improvement_order', 'prosecution']
          }
        }
      },
      {
        id: 'AB_OHS_119',
        name: {
          fr: 'Section 119 - Système de permis d\'entrée',
          en: 'Section 119 - Entry Permit System'
        },
        description: {
          fr: 'Exigences pour système de permis d\'entrée en espace clos',
          en: 'Requirements for confined space entry permit system'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Permis d\'entrée écrit requis pour chaque entrée',
            'Autorisation par personne compétente',
            'Validité limitée dans le temps',
            'Spécification des mesures de contrôle',
            'Signatures des personnes autorisées'
          ],
          en: [
            'Written entry permit required for each entry',
            'Authorization by competent person',
            'Time-limited validity',
            'Specification of control measures',
            'Signatures of authorized persons'
          ]
        },
        implementation: {
          timeline: 'before_each_entry_shift',
          resources: ['permit_forms', 'authorized_signatories', 'control_measures'],
          responsibilities: ['competent_supervisor', 'entrants', 'attendants']
        }
      },
      {
        id: 'AB_OHS_120',
        name: {
          fr: 'Section 120 - Tests atmosphériques',
          en: 'Section 120 - Atmospheric Testing'
        },
        description: {
          fr: 'Exigences pour tests atmosphériques des espaces clos',
          en: 'Requirements for atmospheric testing of confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Tests atmosphériques requis avant entrée',
            'Ordre de test : oxygène, gaz inflammables, gaz toxiques',
            'Tests continus pendant occupation',
            'Équipement calibré et certifié',
            'Tests par personne qualifiée'
          ],
          en: [
            'Atmospheric testing required before entry',
            'Testing order: oxygen, flammable gases, toxic gases',
            'Continuous testing during occupancy',
            'Calibrated and certified equipment',
            'Testing by qualified person'
          ]
        },
        implementation: {
          timeline: 'before_entry_and_continuous',
          resources: ['calibrated_detectors', 'qualified_tester', 'documentation'],
          standards: {
            oxygen: { min: 19.5, max: 23.0, unit: '%' },
            flammable_gas: { max: 10, unit: '%LEL' },
            carbon_monoxide: { max: 35, unit: 'ppm' },
            hydrogen_sulfide: { max: 10, unit: 'ppm' }
          }
        }
      },
      {
        id: 'AB_OHS_121',
        name: {
          fr: 'Section 121 - Ventilation',
          en: 'Section 121 - Ventilation'
        },
        description: {
          fr: 'Exigences de ventilation pour espaces clos',
          en: 'Ventilation requirements for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Ventilation mécanique requise si nécessaire',
            'Élimination des dangers atmosphériques',
            'Maintien des conditions acceptables',
            'Ventilation continue pendant occupation',
            'Équipement antidéflagrant si requis'
          ],
          en: [
            'Mechanical ventilation required if necessary',
            'Elimination of atmospheric hazards',
            'Maintenance of acceptable conditions',
            'Continuous ventilation during occupancy',
            'Explosion-proof equipment if required'
          ]
        }
      },
      {
        id: 'AB_OHS_122',
        name: {
          fr: 'Section 122 - Surveillant',
          en: 'Section 122 - Attendant'
        },
        description: {
          fr: 'Exigences pour surveillant d\'espace clos',
          en: 'Requirements for confined space attendant'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Surveillant qualifié requis à l\'extérieur',
            'Communication constante avec entrants',
            'Surveillance des conditions',
            'Autorité d\'ordonner évacuation',
            'Ne doit pas quitter son poste'
          ],
          en: [
            'Qualified attendant required outside',
            'Constant communication with entrants',
            'Monitoring of conditions',
            'Authority to order evacuation',
            'Must not leave post'
          ]
        }
      },
      {
        id: 'AB_OHS_123',
        name: {
          fr: 'Section 123 - Équipement de protection',
          en: 'Section 123 - Protective Equipment'
        },
        description: {
          fr: 'Exigences d\'équipement de protection pour espaces clos',
          en: 'Protective equipment requirements for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'ÉPI approprié aux dangers identifiés',
            'Équipement de protection respiratoire si requis',
            'Harnais et système de récupération',
            'Éclairage sécuritaire',
            'Équipement de communication'
          ],
          en: [
            'PPE appropriate to identified hazards',
            'Respiratory protection equipment if required',
            'Harness and retrieval system',
            'Safe lighting',
            'Communication equipment'
          ]
        }
      },
      {
        id: 'AB_OHS_124',
        name: {
          fr: 'Section 124 - Procédures d\'urgence',
          en: 'Section 124 - Emergency Procedures'
        },
        description: {
          fr: 'Exigences pour procédures d\'urgence en espace clos',
          en: 'Emergency procedure requirements for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Plan d\'urgence écrit requis',
            'Procédures de sauvetage établies',
            'Équipe de sauvetage disponible',
            'Communication avec services d\'urgence',
            'Formation du personnel aux procédures'
          ],
          en: [
            'Written emergency plan required',
            'Rescue procedures established',
            'Rescue team available',
            'Communication with emergency services',
            'Personnel training on procedures'
          ]
        }
      },
      {
        id: 'AB_OHS_125',
        name: {
          fr: 'Section 125 - Formation',
          en: 'Section 125 - Training'
        },
        description: {
          fr: 'Exigences de formation pour travail en espace clos',
          en: 'Training requirements for confined space work'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Formation spécifique aux espaces clos',
            'Reconnaissance des dangers',
            'Utilisation d\'équipement de sécurité',
            'Procédures d\'urgence et de sauvetage',
            'Formation de recyclage périodique'
          ],
          en: [
            'Confined space specific training',
            'Hazard recognition',
            'Safety equipment use',
            'Emergency and rescue procedures',
            'Periodic refresher training'
          ]
        }
      }
    ],
    compliance: {
      level: 'mandatory',
      enforcement: 'regulatory',
      penalties: {
        individual: { min: 500, max: 30000 },
        corporation: { min: 2500, max: 500000 },
        criminal: 'possible_for_gross_negligence'
      },
      inspectionFrequency: 'complaint_driven_and_programmed',
      reportingRequirements: [
        'incidents_within_24hours',
        'fatalities_immediately',
        'serious_injuries_within_24hours'
      ]
    },
    relatedStandards: [
      'AB_OHS_PART5_VIOLENCE_HARASSMENT',
      'AB_OHS_PART7_EMERGENCY_PREPAREDNESS',
      'AB_OHS_PART9_FALL_PROTECTION',
      'AB_OHS_PART18_PERSONAL_PROTECTIVE_EQUIPMENT'
    ],
    references: [
      {
        type: 'regulation',
        title: 'Alberta Occupational Health and Safety Regulation',
        citation: 'Alberta Regulation 87/2009',
        url: 'https://www.qp.alberta.ca/documents/Regs/2009_087.pdf'
      },
      {
        type: 'code',
        title: 'Alberta Occupational Health and Safety Code',
        citation: 'Alberta Regulation 87/2009',
        section: 'Part 8'
      },
      {
        type: 'guideline',
        title: 'Confined Space Entry Guidelines',
        publisher: 'Alberta OHS',
        url: 'https://www.alberta.ca/ohs-confined-space-entry'
      }
    ],
    lastReview: new Date('2023-01-01').getTime(),
    nextReview: new Date('2025-01-01').getTime(),
    metadata: {
      version: '2023.1',
      language: 'en',
      jurisdiction: 'AB',
      effectiveTerritory: 'province_wide',
      specialConditions: [
        'oil_and_gas_additional_requirements',
        'mining_specific_exclusions',
        'municipal_utility_variations'
      ]
    }
  }
};

// =================== LIMITES EXPOSITION ALBERTA ===================

export const ALBERTA_EXPOSURE_LIMITS: Record<GasType, {
  twa: number;
  stel: number;
  ceiling?: number;
  unit: string;
  source: string;
}> = {
  oxygen: {
    twa: 0, // Pas de limite TWA - requis 19.5-23%
    stel: 0,
    unit: '%',
    source: 'Alberta OHS Code Section 120'
  },
  carbon_monoxide: {
    twa: 25,
    stel: 125,
    ceiling: 35, // Limite spécifique Alberta pour espaces clos
    unit: 'ppm',
    source: 'Alberta OHS Code Section 120'
  },
  hydrogen_sulfide: {
    twa: 10,
    stel: 15,
    ceiling: 10, // Limite spécifique Alberta pour espaces clos
    unit: 'ppm',
    source: 'Alberta OHS Code Section 120'
  },
  methane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'Alberta OHS Schedule 1 Table 2'
  },
  propane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'Alberta OHS Schedule 1 Table 2'
  }
} as any;

// =================== QUALIFICATIONS ALBERTA ===================

export const ALBERTA_QUALIFICATIONS = {
  competent_supervisor: {
    name: {
      fr: 'Superviseur compétent',
      en: 'Competent Supervisor'
    },
    requirements: {
      fr: [
        'Connaissance des dangers des espaces clos',
        'Formation en évaluation des risques',
        'Autorité pour arrêter le travail',
        'Expérience pertinente démontrée',
        'Formation en premiers secours (recommandée)'
      ],
      en: [
        'Knowledge of confined space hazards',
        'Training in risk assessment',
        'Authority to stop work',
        'Demonstrated relevant experience',
        'First aid training (recommended)'
      ]
    },
    certification: 'employer_verified',
    validity: 'ongoing_with_refresher',
    mandatoryTraining: [
      'confined_space_hazard_recognition',
      'permit_system_management',
      'emergency_procedures',
      'atmospheric_testing_interpretation'
    ]
  },
  qualified_worker: {
    name: {
      fr: 'Travailleur qualifié pour tests atmosphériques',
      en: 'Qualified Worker for Atmospheric Testing'
    },
    requirements: {
      fr: [
        'Formation sur équipement de détection',
        'Connaissance des procédures de test',
        'Interprétation des résultats',
        'Calibration des équipements',
        'Reconnaissance des limites d\'équipement'
      ],
      en: [
        'Training on detection equipment',
        'Knowledge of testing procedures',
        'Interpretation of results',
        'Equipment calibration',
        'Recognition of equipment limitations'
      ]
    },
    certification: 'manufacturer_or_third_party',
    validity: 'annual_recertification',
    mandatoryTraining: [
      'atmospheric_testing_procedures',
      'equipment_operation_maintenance',
      'data_interpretation',
      'emergency_response'
    ]
  },
  attendant: {
    name: {
      fr: 'Surveillant d\'espace clos',
      en: 'Confined Space Attendant'
    },
    requirements: {
      fr: [
        'Formation spécialisée en surveillance',
        'Communication et systèmes d\'alarme',
        'Procédures d\'évacuation d\'urgence',
        'Connaissance des dangers spécifiques',
        'Formation en premiers secours'
      ],
      en: [
        'Specialized attendant training',
        'Communication and alarm systems',
        'Emergency evacuation procedures',
        'Knowledge of specific hazards',
        'First aid training'
      ]
    },
    certification: 'employer_training_program',
    validity: 'annual_refresher',
    mandatoryTraining: [
      'attendant_responsibilities',
      'communication_procedures',
      'emergency_response',
      'rescue_coordination'
    ]
  }
};

// =================== FONCTIONS CONFORMITÉ ALBERTA ===================

/**
 * Vérifier conformité Alberta OHS pour espace clos
 */
export function checkAlbertaCompliance(
  permitData: any,
  atmosphericReadings: any[],
  personnel: any[]
): ComplianceMatrix {
  const results: any[] = [];

  // Vérification Section 117 - Définitions et classification
  results.push({
    standardId: 'AB_OHS_117',
    requirementId: 'space_classification',
    status: permitData.spaceType ? 'compliant' : 'non_compliant',
    evidence: permitData.spaceType ? ['space_classification_documented'] : [],
    gaps: permitData.spaceType ? [] : ['Missing space classification'],
    priority: 'high' as const
  });

  // Vérification Section 118 - Évaluation des dangers
  const hasHazardAssessment = permitData.hazardAssessment && 
                              permitData.hazardAssessment.completed;
  results.push({
    standardId: 'AB_OHS_118',
    requirementId: 'hazard_assessment',
    status: hasHazardAssessment ? 'compliant' : 'non_compliant',
    evidence: hasHazardAssessment ? ['written_hazard_assessment'] : [],
    gaps: hasHazardAssessment ? [] : ['Missing written hazard assessment'],
    priority: 'critical' as const
  });

  // Vérification Section 120 - Tests atmosphériques
  const hasAtmosphericTesting = atmosphericReadings && atmosphericReadings.length > 0;
  const latestReadings = hasAtmosphericTesting ? 
    atmosphericReadings.filter(r => Date.now() - r.timestamp < 4 * 60 * 60 * 1000) : []; // 4h

  // Vérifier limites Alberta
  let atmosphericCompliant = true;
  const atmosphericGaps: string[] = [];

  if (latestReadings.length === 0) {
    atmosphericCompliant = false;
    atmosphericGaps.push('No recent atmospheric testing');
  } else {
    latestReadings.forEach(reading => {
      const limits = ALBERTA_EXPOSURE_LIMITS[reading.gasType];
      if (limits) {
        if (reading.gasType === 'oxygen') {
          if (reading.value < 19.5 || reading.value > 23.0) {
            atmosphericCompliant = false;
            atmosphericGaps.push(`Oxygen level ${reading.value}% outside 19.5-23% range`);
          }
        } else if (limits.ceiling && reading.value > limits.ceiling) {
          atmosphericCompliant = false;
          atmosphericGaps.push(`${reading.gasType} ${reading.value}${limits.unit} exceeds ceiling ${limits.ceiling}${limits.unit}`);
        }
      }
    });
  }

  results.push({
    standardId: 'AB_OHS_120',
    requirementId: 'atmospheric_testing',
    status: atmosphericCompliant ? 'compliant' : 'non_compliant',
    evidence: hasAtmosphericTesting ? ['atmospheric_test_records'] : [],
    gaps: atmosphericGaps,
    priority: 'critical' as const
  });

  // Vérification Section 122 - Surveillant
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  results.push({
    standardId: 'AB_OHS_122',
    requirementId: 'attendant_present',
    status: hasAttendant ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: hasAttendant ? [] : ['No qualified attendant assigned'],
    priority: 'critical' as const
  });

  // Calcul conformité globale
  const compliantCount = results.filter(r => r.status === 'compliant').length;
  const overallCompliance = (compliantCount / results.length) * 100;

  return {
    jurisdiction: 'AB',
    standardsAssessed: ['AB_OHS_PART8_CONFINED_SPACES'],
    assessmentDate: Date.now(),
    overallCompliance,
    results,
    criticalNonCompliance: results.filter(r => 
      r.status === 'non_compliant' && r.priority === 'critical'
    ).length,
    actionPlan: generateAlbertaActionPlan(results),
    nextAssessment: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 jours
    certifiedBy: 'alberta_ohs_system',
    metadata: {
      version: '2023.1',
      assessmentMethod: 'automated_plus_manual_review',
      dataQuality: 'high',
      limitationsNoted: []
    }
  };
}

/**
 * Générer plan d'action pour non-conformités Alberta
 */
function generateAlbertaActionPlan(results: any[]): any[] {
  const nonCompliantItems = results.filter(r => r.status === 'non_compliant');
  
  return nonCompliantItems.map(item => ({
    standardId: item.standardId,
    requirement: item.requirementId,
    priority: item.priority,
    action: getAlbertaCorrectiveAction(item.standardId, item.requirementId),
    responsible: 'competent_supervisor',
    deadline: item.priority === 'critical' ? 
      'immediate' : 
      item.priority === 'high' ? '24_hours' : '7_days',
    resources: getRequiredResources(item.standardId),
    verification: 'supervisor_sign_off_plus_documentation',
    status: 'planned' as const
  }));
}

/**
 * Obtenir action corrective spécifique Alberta
 */
function getAlbertaCorrectiveAction(standardId: string, requirementId: string): {
  fr: string;
  en: string;
} {
  const actions: Record<string, { fr: string; en: string; }> = {
    'AB_OHS_117_space_classification': {
      fr: 'Compléter la classification de l\'espace selon la section 117',
      en: 'Complete space classification per section 117'
    },
    'AB_OHS_118_hazard_assessment': {
      fr: 'Effectuer évaluation écrite des dangers par personne compétente',
      en: 'Conduct written hazard assessment by competent person'
    },
    'AB_OHS_120_atmospheric_testing': {
      fr: 'Effectuer tests atmosphériques selon ordre requis (O2, inflammables, toxiques)',
      en: 'Conduct atmospheric testing per required order (O2, flammables, toxics)'
    },
    'AB_OHS_122_attendant_present': {
      fr: 'Assigner surveillant qualifié à l\'extérieur de l\'espace',
      en: 'Assign qualified attendant outside the space'
    }
  };

  const key = `${standardId}_${requirementId}`;
  return actions[key] || {
    fr: 'Corriger la non-conformité identifiée',
    en: 'Correct identified non-compliance'
  };
}

/**
 * Obtenir ressources requises pour conformité
 */
function getRequiredResources(standardId: string): string[] {
  const resources: Record<string, string[]> = {
    'AB_OHS_117': ['classification_forms', 'competent_person'],
    'AB_OHS_118': ['hazard_assessment_forms', 'competent_supervisor', 'site_inspection'],
    'AB_OHS_120': ['calibrated_detectors', 'qualified_tester', 'documentation_forms'],
    'AB_OHS_122': ['trained_attendant', 'communication_equipment', 'rescue_equipment']
  };

  return resources[standardId] || ['general_safety_resources'];
}

/**
 * Valider qualifications personnel Alberta
 */
export function validateAlbertaQualifications(
  personnelData: any[],
  requiredRoles: string[]
): {
  compliant: boolean;
  gaps: string[];
  recommendations: string[];
} {
  const gaps: string[] = [];
  const recommendations: string[] = [];

  requiredRoles.forEach(role => {
    const qualified = personnelData.find(p => 
      p.role === role && 
      p.qualifications?.alberta_ohs_certified
    );

    if (!qualified) {
      gaps.push(`No qualified ${role} with Alberta OHS certification`);
      recommendations.push(`Provide Alberta OHS training for ${role}`);
    }
  });

  return {
    compliant: gaps.length === 0,
    gaps,
    recommendations
  };
}

/**
 * Obtenir exigences formation Alberta
 */
export function getAlbertaTrainingRequirements(role: string): {
  mandatory: string[];
  recommended: string[];
  frequency: string;
  provider: string[];
} {
  const requirements: Record<string, any> = {
    supervisor: {
      mandatory: [
        'confined_space_supervisor_training',
        'hazard_assessment_training',
        'permit_system_training'
      ],
      recommended: [
        'first_aid_cpr',
        'incident_investigation',
        'emergency_response'
      ],
      frequency: 'every_3_years',
      provider: ['alberta_ohs_approved', 'employer_program', 'industry_association']
    },
    entrant: {
      mandatory: [
        'confined_space_entrant_training',
        'ppe_training',
        'emergency_procedures'
      ],
      recommended: [
        'first_aid',
        'self_rescue_techniques'
      ],
      frequency: 'annually',
      provider: ['alberta_ohs_approved', 'employer_program']
    },
    attendant: {
      mandatory: [
        'confined_space_attendant_training',
        'communication_procedures',
        'emergency_response',
        'rescue_coordination'
      ],
      recommended: [
        'first_aid_cpr',
        'incident_command'
      ],
      frequency: 'annually',
      provider: ['alberta_ohs_approved', 'rescue_service_training']
    }
  };

  return requirements[role] || {
    mandatory: ['general_confined_space_awareness'],
    recommended: ['workplace_safety_basics'],
    frequency: 'annually',
    provider: ['employer_program']
  };
}

// =================== EXPORTS ===================
export default {
  ALBERTA_AUTHORITY,
  ALBERTA_OHS_STANDARDS,
  ALBERTA_EXPOSURE_LIMITS,
  ALBERTA_QUALIFICATIONS,
  checkAlbertaCompliance,
  validateAlbertaQualifications,
  getAlbertaTrainingRequirements
};
