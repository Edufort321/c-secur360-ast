// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/REGULATIONS/BRITISHCOLUMBIA.TS ===================
// Réglementations British Columbia WorkSafeBC pour espaces clos
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

// =================== CONSTANTES BRITISH COLUMBIA WORKSAFEBC ===================

export const BC_PROVINCE_CODE: ProvinceCode = 'BC';

export const WORKSAFEBC_AUTHORITY = {
  name: {
    fr: 'WorkSafeBC (Commission des accidents du travail de la Colombie-Britannique)',
    en: 'WorkSafeBC (Workers\' Compensation Board of British Columbia)'
  },
  acronym: 'WorkSafeBC',
  jurisdiction: ['BC'] as ProvinceCode[],
  website: 'https://www.worksafebc.com',
  contactInfo: {
    phone: '1-888-621-7233',
    emergencyLine: '911',
    preventionPhone: '1-888-621-7233',
    email: 'prevention@worksafebc.com',
    address: {
      street: '6951 Westminster Highway',
      city: 'Richmond',
      province: 'BC',
      postalCode: 'V7C 1C6'
    },
    regionalOffices: [
      {
        region: 'Lower Mainland',
        phone: '604-276-3100',
        address: 'Richmond'
      },
      {
        region: 'Vancouver Island',
        phone: '250-881-3418',
        address: 'Victoria'
      },
      {
        region: 'Interior',
        phone: '250-371-6003',
        address: 'Kamloops'
      },
      {
        region: 'Northern',
        phone: '250-565-6800',
        address: 'Prince George'
      }
    ]
  },
  powers: {
    fr: [
      'Inspection des lieux de travail',
      'Émission d\'ordonnances d\'amélioration',
      'Émission d\'ordonnances d\'arrêt de travail',
      'Amendes administratives pénales',
      'Poursuites pour violations graves',
      'Investigation d\'accidents et incidents'
    ],
    en: [
      'Workplace inspections',
      'Issue improvement orders',
      'Issue stop work orders',
      'Administrative monetary penalties',
      'Prosecutions for serious violations',
      'Accident and incident investigations'
    ]
  },
  specialFeatures: [
    'industry_specific_guidelines',
    'comprehensive_prevention_programs',
    'first_nations_collaboration',
    'multilingual_resources'
  ]
} as const;

// =================== STANDARDS WORKSAFEBC ===================

export const WORKSAFEBC_STANDARDS: Record<string, RegulatoryStandard> = {
  // Part 9 - Confined Spaces (Sections 9.1-9.19)
  'BC_OHSR_PART9_CONFINED_SPACES': {
    id: 'BC_OHSR_PART9_CONFINED_SPACES',
    name: {
      fr: 'Règlement WorkSafeBC - Partie 9 : Espaces clos',
      en: 'WorkSafeBC Regulation - Part 9: Confined Spaces'
    },
    type: 'safety',
    category: 'confined_space',
    authority: WORKSAFEBC_AUTHORITY,
    jurisdiction: ['BC'],
    effectiveDate: new Date('2021-11-01').getTime(), // Dernière révision majeure
    lastUpdated: new Date('2023-06-01').getTime(),
    status: 'active',
    hierarchy: {
      parent: 'BC_OCCUPATIONAL_HEALTH_SAFETY_REGULATION',
      level: 'part',
      section: 'Part 9',
      subsections: ['9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9', 
                   '9.10', '9.11', '9.12', '9.13', '9.14', '9.15', '9.16', '9.17', '9.18', '9.19']
    },
    scope: {
      workplaces: [
        'industrial',
        'construction',
        'forestry',
        'mining',
        'marine',
        'utilities',
        'municipal',
        'healthcare',
        'transportation',
        'agriculture'
      ],
      activities: [
        'confined_space_entry',
        'maintenance_and_repair',
        'inspection_and_testing',
        'cleaning_and_decontamination',
        'construction_activities',
        'emergency_response'
      ],
      equipment: [
        'tanks_and_vessels',
        'silos_and_bins',
        'manholes_and_sewers',
        'tunnels_and_shafts',
        'pits_and_trenches',
        'ship_holds_and_compartments',
        'process_equipment'
      ],
      specialConsiderations: [
        'marine_confined_spaces',
        'forestry_remote_locations',
        'mining_underground_spaces',
        'first_nations_territories'
      ]
    },
    requirements: [
      {
        id: 'BC_OHSR_9_1',
        name: {
          fr: 'Section 9.1 - Définitions',
          en: 'Section 9.1 - Definitions'
        },
        description: {
          fr: 'Définitions spécifiques WorkSafeBC pour espaces clos',
          en: 'WorkSafeBC specific definitions for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Espace clos : espace totalement ou partiellement fermé',
            'Non conçu ou destiné à être occupé par des personnes',
            'Entrée ou sortie limitée par son emplacement, sa taille ou ses moyens d\'accès',
            'Peut devenir dangereux pour une personne qui y entre',
            'Inclut spécifiquement les espaces marins et forestiers'
          ],
          en: [
            'Confined space: space that is totally or partially enclosed',
            'Not designed or intended to be occupied by persons',
            'Entry or exit is limited by location, size or means of access',
            'May become dangerous to a person entering it',
            'Specifically includes marine and forestry spaces'
          ]
        },
        implementation: {
          timeline: 'immediate_upon_identification',
          resources: ['space_classification_checklist', 'hazard_assessment_tools'],
          responsibilities: ['employer', 'supervisor', 'joint_committee'],
          dependencies: ['worker_training', 'hazard_assessment']
        },
        verification: {
          methods: ['documentation_review', 'physical_inspection', 'worker_consultation'],
          evidence: ['written_classification', 'hazard_inventory', 'risk_assessment'],
          frequency: 'annual_or_when_conditions_change'
        }
      },
      {
        id: 'BC_OHSR_9_2',
        name: {
          fr: 'Section 9.2 - Évaluation des risques',
          en: 'Section 9.2 - Risk Assessment'
        },
        description: {
          fr: 'Exigences d\'évaluation des risques avant entrée',
          en: 'Risk assessment requirements before entry'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Évaluation des risques par personne qualifiée',
            'Identification de tous les dangers potentiels',
            'Évaluation des risques atmosphériques, physiques et biologiques',
            'Considération des conditions météorologiques (BC)',
            'Évaluation des voies d\'accès et de sortie',
            'Consultation des travailleurs et du comité de santé-sécurité'
          ],
          en: [
            'Risk assessment by qualified person',
            'Identification of all potential hazards',
            'Assessment of atmospheric, physical and biological risks',
            'Consideration of weather conditions (BC)',
            'Assessment of entry and exit routes',
            'Consultation with workers and health and safety committee'
          ]
        },
        implementation: {
          timeline: 'before_each_entry_project',
          resources: ['qualified_assessor', 'assessment_tools', 'weather_monitoring'],
          responsibilities: ['qualified_person', 'employer', 'supervisor']
        },
        bcSpecific: {
          weatherConsiderations: [
            'coastal_fog_and_visibility',
            'mountain_weather_changes',
            'rainfall_and_flooding_risk',
            'seismic_activity_potential'
          ],
          environmentalFactors: [
            'tidal_influences_marine_spaces',
            'wildlife_encounters',
            'remote_location_isolation'
          ]
        }
      },
      {
        id: 'BC_OHSR_9_3',
        name: {
          fr: 'Section 9.3 - Procédures d\'entrée sécuritaire',
          en: 'Section 9.3 - Safe Entry Procedures'
        },
        description: {
          fr: 'Procédures détaillées pour entrée sécuritaire en espace clos',
          en: 'Detailed procedures for safe confined space entry'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Procédures écrites d\'entrée sécuritaire',
            'Système de permis d\'entrée obligatoire',
            'Tests atmosphériques avant et pendant l\'entrée',
            'Isolation et verrouillage des sources d\'énergie',
            'Communication continue avec l\'extérieur',
            'Surveillance par personne compétente à l\'extérieur'
          ],
          en: [
            'Written safe entry procedures',
            'Mandatory entry permit system',
            'Atmospheric testing before and during entry',
            'Isolation and lockout of energy sources',
            'Continuous communication with outside',
            'Monitoring by competent person outside'
          ]
        },
        implementation: {
          timeline: 'before_any_entry',
          resources: ['permit_system', 'testing_equipment', 'communication_devices'],
          standards: {
            oxygen: { min: 19.5, max: 23.0, unit: '%' },
            flammable_gas: { max: 10, unit: '%LEL' },
            carbon_monoxide: { max: 25, unit: 'ppm' },
            hydrogen_sulfide: { max: 10, unit: 'ppm' },
            other_toxics: 'per_schedule_1_limits'
          }
        }
      },
      {
        id: 'BC_OHSR_9_4',
        name: {
          fr: 'Section 9.4 - Tests atmosphériques',
          en: 'Section 9.4 - Atmospheric Testing'
        },
        description: {
          fr: 'Exigences spécifiques pour tests atmosphériques',
          en: 'Specific requirements for atmospheric testing'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Tests par personne qualifiée avec équipement calibré',
            'Ordre de test obligatoire : oxygène, gaz inflammables, gaz toxiques',
            'Tests à différents niveaux de l\'espace',
            'Tests continus pendant occupation',
            'Documentation de tous les résultats',
            'Procédures d\'urgence si conditions inacceptables'
          ],
          en: [
            'Testing by qualified person with calibrated equipment',
            'Mandatory testing order: oxygen, flammable gases, toxic gases',
            'Testing at different levels of the space',
            'Continuous testing during occupancy',
            'Documentation of all results',
            'Emergency procedures if unacceptable conditions'
          ]
        },
        bcSpecific: {
          marineTesting: {
            additionalGases: ['carbon_dioxide_from_cargo', 'benzene_from_petroleum'],
            tidalConsiderations: 'test_at_different_tide_levels',
            ventilationChallenges: 'saltwater_corrosion_equipment'
          },
          forestryTesting: {
            biologicalHazards: ['decomposing_organic_matter', 'methane_from_vegetation'],
            remoteLocations: 'satellite_communication_backup',
            weatherDependency: 'test_postponement_criteria'
          }
        }
      },
      {
        id: 'BC_OHSR_9_5',
        name: {
          fr: 'Section 9.5 - Ventilation',
          en: 'Section 9.5 - Ventilation'
        },
        description: {
          fr: 'Exigences de ventilation pour espaces clos',
          en: 'Ventilation requirements for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Ventilation naturelle ou mécanique selon évaluation',
            'Élimination ou contrôle des contaminants atmosphériques',
            'Maintien de niveaux d\'oxygène acceptables',
            'Prévention de l\'accumulation de gaz dangereux',
            'Équipement antidéflagrant dans zones inflammables'
          ],
          en: [
            'Natural or mechanical ventilation as per assessment',
            'Elimination or control of atmospheric contaminants',
            'Maintenance of acceptable oxygen levels',
            'Prevention of dangerous gas accumulation',
            'Explosion-proof equipment in flammable areas'
          ]
        },
        bcSpecific: {
          coastalConditions: {
            humidityControl: 'prevent_condensation_equipment_failure',
            saltAirCorrosion: 'marine_grade_ventilation_equipment',
            windFactors: 'natural_ventilation_assessment'
          }
        }
      },
      {
        id: 'BC_OHSR_9_6',
        name: {
          fr: 'Section 9.6 - Équipement de protection individuelle',
          en: 'Section 9.6 - Personal Protective Equipment'
        },
        description: {
          fr: 'Exigences d\'ÉPI pour travail en espace clos',
          en: 'PPE requirements for confined space work'
        },
        mandatory: true,
        criteria: {
          fr: [
            'ÉPI approprié aux dangers identifiés',
            'Protection respiratoire selon évaluation atmosphérique',
            'Harnais de sécurité et système de récupération',
            'Protection contre chutes et objets qui tombent',
            'Éclairage de sécurité intrinsèquement sûr',
            'Vêtements de protection selon dangers chimiques'
          ],
          en: [
            'PPE appropriate to identified hazards',
            'Respiratory protection per atmospheric assessment',
            'Safety harness and retrieval system',
            'Protection against falls and falling objects',
            'Intrinsically safe lighting',
            'Protective clothing per chemical hazards'
          ]
        },
        bcSpecific: {
          marineEnvironment: {
            immersionSuits: 'cold_water_protection_required',
            flotationDevices: 'marine_confined_spaces',
            waterproofEquipment: 'electronics_and_communication'
          },
          extremeWeather: {
            hypothermiaProtection: 'mountain_and_northern_regions',
            heatStressProtection: 'interior_summer_conditions'
          }
        }
      },
      {
        id: 'BC_OHSR_9_7',
        name: {
          fr: 'Section 9.7 - Surveillant',
          en: 'Section 9.7 - Attendant'
        },
        description: {
          fr: 'Exigences pour surveillant d\'espace clos',
          en: 'Requirements for confined space attendant'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Surveillant qualifié en permanence à l\'extérieur',
            'Communication continue avec entrants',
            'Surveillance des conditions atmosphériques',
            'Autorité pour ordonner évacuation immédiate',
            'Ne peut entrer dans l\'espace sauf pour sauvetage d\'urgence',
            'Connaissance des procédures d\'urgence et de sauvetage'
          ],
          en: [
            'Qualified attendant continuously outside',
            'Continuous communication with entrants',
            'Monitoring of atmospheric conditions',
            'Authority to order immediate evacuation',
            'Cannot enter space except for emergency rescue',
            'Knowledge of emergency and rescue procedures'
          ]
        },
        bcSpecific: {
          remoteLocations: {
            communicationBackup: 'satellite_phone_or_radio',
            emergencyResponse: 'bc_ambulance_helicopter_access',
            isolationFactors: 'minimum_two_person_attendant_team'
          }
        }
      },
      {
        id: 'BC_OHSR_9_8',
        name: {
          fr: 'Section 9.8 - Sauvetage et urgences',
          en: 'Section 9.8 - Rescue and Emergencies'
        },
        description: {
          fr: 'Procédures de sauvetage et d\'urgence pour espaces clos',
          en: 'Rescue and emergency procedures for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Plan de sauvetage écrit avant début des travaux',
            'Équipe de sauvetage formée et équipée',
            'Équipement de sauvetage immédiatement disponible',
            'Communication avec services d\'urgence locaux',
            'Procédures pour différents types d\'urgences',
            'Formation régulière et exercices de sauvetage'
          ],
          en: [
            'Written rescue plan before work begins',
            'Trained and equipped rescue team',
            'Rescue equipment immediately available',
            'Communication with local emergency services',
            'Procedures for different types of emergencies',
            'Regular training and rescue drills'
          ]
        },
        bcSpecific: {
          emergencyServices: {
            bcAmbulance: 'air_ambulance_helicopter_coordination',
            coastGuard: 'marine_confined_space_incidents',
            searchAndRescue: 'remote_wilderness_locations',
            fireServices: 'hazmat_and_technical_rescue'
          },
          geographicChallenges: {
            mountainous: 'helicopter_landing_zones_required',
            coastal: 'tide_and_weather_evacuation_windows',
            remote: 'satellite_emergency_beacon_systems'
          }
        }
      },
      {
        id: 'BC_OHSR_9_9',
        name: {
          fr: 'Section 9.9 - Formation et compétences',
          en: 'Section 9.9 - Training and Competency'
        },
        description: {
          fr: 'Exigences de formation pour travail en espace clos',
          en: 'Training requirements for confined space work'
        },
        mandatory: true,
        criteria: {
          fr: [
            'Formation spécialisée selon le rôle (entrant, surveillant, superviseur)',
            'Connaissance des dangers spécifiques au site',
            'Formation sur équipement de sécurité et de sauvetage',
            'Mise à jour régulière des connaissances',
            'Certification par organisme reconnu ou employeur',
            'Documentation des formations et compétences'
          ],
          en: [
            'Specialized training per role (entrant, attendant, supervisor)',
            'Knowledge of site-specific hazards',
            'Training on safety and rescue equipment',
            'Regular knowledge updates',
            'Certification by recognized body or employer',
            'Documentation of training and competencies'
          ]
        }
      }
    ],
    compliance: {
      level: 'mandatory',
      enforcement: 'worksafebc_officers',
      penalties: {
        individual: { min: 734, max: 73400 }, // Montants 2023 WorkSafeBC
        corporation: { min: 7340, max: 734000 },
        criminal: 'possible_under_criminal_code'
      },
      inspectionFrequency: 'risk_based_and_complaint_driven',
      reportingRequirements: [
        'serious_incidents_immediately',
        'fatalities_immediately',
        'dangerous_occurrences_within_48hours'
      ]
    },
    bcSpecificFeatures: {
      industryGuidelines: [
        'forestry_specific_guidance',
        'marine_shipping_guidance',
        'mining_underground_guidance',
        'municipal_utilities_guidance'
      ],
      geographicConsiderations: [
        'coastal_marine_environments',
        'mountain_weather_conditions',
        'remote_location_challenges',
        'seismic_zone_preparations'
      ],
      indigenousCollaboration: [
        'first_nations_territory_protocols',
        'traditional_knowledge_integration',
        'cultural_safety_considerations'
      ]
    },
    relatedStandards: [
      'BC_OHSR_PART3_RIGHTS_RESPONSIBILITIES',
      'BC_OHSR_PART8_PERSONAL_PROTECTIVE_EQUIPMENT',
      'BC_OHSR_PART11_DIVING_OPERATIONS',
      'BC_OHSR_PART16_MOBILE_EQUIPMENT',
      'BC_OHSR_PART20_CONSTRUCTION_SAFETY'
    ],
    references: [
      {
        type: 'regulation',
        title: 'Workers Compensation Act',
        citation: 'RSBC 1996, c. 492',
        url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96492_01'
      },
      {
        type: 'regulation',
        title: 'Occupational Health and Safety Regulation',
        citation: 'BC Reg 296/97',
        section: 'Part 9',
        url: 'https://www.worksafebc.com/en/law-policy/occupational-health-safety/searchable-ohs-regulation'
      },
      {
        type: 'guideline',
        title: 'Confined Space Entry Guidelines',
        publisher: 'WorkSafeBC',
        url: 'https://www.worksafebc.com/en/health-safety/hazards-exposures/confined-spaces'
      },
      {
        type: 'industry_guide',
        title: 'Marine Confined Space Safety Guide',
        publisher: 'BC Maritime Employers Association',
        collaboration: 'WorkSafeBC'
      }
    ],
    lastReview: new Date('2023-06-01').getTime(),
    nextReview: new Date('2025-06-01').getTime(),
    metadata: {
      version: '2023.2',
      language: 'en',
      jurisdiction: 'BC',
      effectiveTerritory: 'province_wide_including_marine',
      specialConditions: [
        'marine_vessels_and_ports',
        'forestry_remote_operations',
        'first_nations_territories',
        'seismic_zone_requirements'
      ]
    }
  }
};

// =================== LIMITES EXPOSITION BRITISH COLUMBIA ===================

export const BC_EXPOSURE_LIMITS: Record<GasType, {
  twa: number;
  stel: number;
  ceiling?: number;
  unit: string;
  source: string;
  bcSpecific?: any;
}> = {
  oxygen: {
    twa: 0, // Pas de limite TWA - requis 19.5-23%
    stel: 0,
    unit: '%',
    source: 'WorkSafeBC OHSR Part 9',
    bcSpecific: {
      altitudeAdjustment: 'sea_level_to_mountain_corrections',
      marineEnvironment: 'cargo_hold_specific_requirements'
    }
  },
  carbon_monoxide: {
    twa: 25,
    stel: 125,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1',
    bcSpecific: {
      forestryOperations: 'equipment_exhaust_considerations',
      marineEngine: 'ship_engine_room_monitoring'
    }
  },
  hydrogen_sulfide: {
    twa: 10,
    stel: 15,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1',
    bcSpecific: {
      pulpMills: 'kraft_process_monitoring',
      sewageTreatment: 'municipal_facility_requirements'
    }
  },
  methane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1',
    bcSpecific: {
      landfills: 'organic_waste_decomposition',
      naturalGas: 'pipeline_and_processing_facilities'
    }
  },
  propane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  }
} as any;

// =================== QUALIFICATIONS BRITISH COLUMBIA ===================

export const BC_QUALIFICATIONS = {
  qualified_person_atmospheric_testing: {
    name: {
      fr: 'Personne qualifiée pour tests atmosphériques',
      en: 'Qualified Person for Atmospheric Testing'
    },
    requirements: {
      fr: [
        'Formation certifiée sur équipement de détection',
        'Connaissance des limites d\'exposition WorkSafeBC',
        'Compétence en interprétation des résultats',
        'Formation sur calibration et maintenance d\'équipement',
        'Connaissance des dangers spécifiques BC (marine, foresterie)'
      ],
      en: [
        'Certified training on detection equipment',
        'Knowledge of WorkSafeBC exposure limits',
        'Competency in results interpretation',
        'Training on equipment calibration and maintenance',
        'Knowledge of BC-specific hazards (marine, forestry)'
      ]
    },
    certification: 'manufacturer_plus_worksafebc_approved',
    validity: 'annual_recertification',
    bcSpecific: {
      marineQualification: 'transport_canada_marine_certification',
      forestryQualification: 'bc_forest_safety_council_training',
      remoteOperations: 'wilderness_first_aid_certification'
    }
  },
  competent_supervisor: {
    name: {
      fr: 'Superviseur compétent',
      en: 'Competent Supervisor'
    },
    requirements: {
      fr: [
        'Autorité pour arrêter le travail dangereux',
        'Connaissance approfondie des dangers d\'espaces clos',
        'Formation en gestion de permis d\'entrée',
        'Compétence en évaluation des risques',
        'Formation en procédures d\'urgence et de sauvetage'
      ],
      en: [
        'Authority to stop unsafe work',
        'Thorough knowledge of confined space hazards',
        'Training in entry permit management',
        'Competency in risk assessment',
        'Training in emergency and rescue procedures'
      ]
    },
    certification: 'employer_verified_competency',
    validity: 'ongoing_with_annual_assessment',
    bcSpecific: {
      indigenousLands: 'cultural_protocol_awareness',
      remoteLocations: 'emergency_communication_procedures',
      marineOperations: 'vessel_safety_management_system'
    }
  },
  attendant: {
    name: {
      fr: 'Surveillant',
      en: 'Attendant'
    },
    requirements: {
      fr: [
        'Formation spécialisée en surveillance d\'espaces clos',
        'Compétence en communication d\'urgence',
        'Connaissance des procédures d\'évacuation',
        'Formation en premiers secours et RCR',
        'Connaissance des systèmes de sauvetage'
      ],
      en: [
        'Specialized confined space attendant training',
        'Competency in emergency communication',
        'Knowledge of evacuation procedures',
        'First aid and CPR training',
        'Knowledge of rescue systems'
      ]
    },
    certification: 'worksafebc_approved_training',
    validity: 'annual_refresher_required',
    bcSpecific: {
      remoteOperations: 'satellite_communication_certification',
      marineEnvironment: 'marine_emergency_procedures',
      weatherDependency: 'severe_weather_protocols'
    }
  },
  rescue_team_member: {
    name: {
      fr: 'Membre d\'équipe de sauvetage',
      en: 'Rescue Team Member'
    },
    requirements: {
      fr: [
        'Formation avancée en sauvetage d\'espaces clos',
        'Certification en protection respiratoire',
        'Formation en techniques de récupération',
        'Premiers secours avancés et soins préhospitaliers',
        'Formation en travail en équipe sous stress'
      ],
      en: [
        'Advanced confined space rescue training',
        'Respiratory protection certification',
        'Training in retrieval techniques',
        'Advanced first aid and pre-hospital care',
        'Training in team work under stress'
      ]
    },
    certification: 'third_party_certified_plus_worksafebc',
    validity: 'annual_certification_required',
    bcSpecific: {
      mountainRescue: 'bc_search_and_rescue_coordination',
      marineRescue: 'coast_guard_auxiliary_liaison',
      industrialRescue: 'hazmat_emergency_response'
    }
  }
};

// =================== FONCTIONS CONFORMITÉ BRITISH COLUMBIA ===================

/**
 * Vérifier conformité WorkSafeBC pour espace clos
 */
export function checkBCCompliance(
  permitData: any,
  atmosphericReadings: any[],
  personnel: any[],
  location?: { marine?: boolean; forestry?: boolean; remote?: boolean; }
): ComplianceMatrix {
  const results: any[] = [];

  // Vérification Section 9.1 - Définitions et classification
  results.push({
    standardId: 'BC_OHSR_9_1',
    requirementId: 'space_classification',
    status: permitData.spaceClassification ? 'compliant' : 'non_compliant',
    evidence: permitData.spaceClassification ? ['space_classification_documented'] : [],
    gaps: permitData.spaceClassification ? [] : ['Missing WorkSafeBC space classification'],
    priority: 'high' as const
  });

  // Vérification Section 9.2 - Évaluation des risques
  const hasRiskAssessment = permitData.riskAssessment && 
                           permitData.riskAssessment.qualifiedPersonConducted;
  results.push({
    standardId: 'BC_OHSR_9_2',
    requirementId: 'risk_assessment',
    status: hasRiskAssessment ? 'compliant' : 'non_compliant',
    evidence: hasRiskAssessment ? ['qualified_person_risk_assessment'] : [],
    gaps: hasRiskAssessment ? [] : ['Missing qualified person risk assessment'],
    priority: 'critical' as const
  });

  // Vérification spécifique BC pour conditions météorologiques
  if (location?.remote || location?.marine) {
    const hasWeatherAssessment = permitData.riskAssessment?.weatherConsiderations;
    results.push({
      standardId: 'BC_OHSR_9_2',
      requirementId: 'weather_assessment',
      status: hasWeatherAssessment ? 'compliant' : 'non_compliant',
      evidence: hasWeatherAssessment ? ['weather_conditions_assessed'] : [],
      gaps: hasWeatherAssessment ? [] : ['Missing BC weather/environmental assessment'],
      priority: 'high' as const
    });
  }

  // Vérification Section 9.4 - Tests atmosphériques
  const hasAtmosphericTesting = atmosphericReadings && atmosphericReadings.length > 0;
  const recentReadings = hasAtmosphericTesting ? 
    atmosphericReadings.filter(r => Date.now() - r.timestamp < 2 * 60 * 60 * 1000) : []; // 2h

  let atmosphericCompliant = true;
  const atmosphericGaps: string[] = [];

  if (recentReadings.length === 0) {
    atmosphericCompliant = false;
    atmosphericGaps.push('No recent atmospheric testing by qualified person');
  } else {
    // Vérifier ordre de test WorkSafeBC (O2, inflammables, toxiques)
    const gasTypes = recentReadings.map(r => r.gasType);
    const hasOxygen = gasTypes.includes('oxygen');
    const hasFlammable = gasTypes.some(g => ['methane', 'propane'].includes(g));
    
    if (!hasOxygen) {
      atmosphericCompliant = false;
      atmosphericGaps.push('Missing oxygen testing - required first per WorkSafeBC');
    }

    // Vérifier limites BC
    recentReadings.forEach(reading => {
      const limits = BC_EXPOSURE_LIMITS[reading.gasType];
      if (limits) {
        if (reading.gasType === 'oxygen') {
          if (reading.value < 19.5 || reading.value > 23.0) {
            atmosphericCompliant = false;
            atmosphericGaps.push(`Oxygen level ${reading.value}% outside WorkSafeBC 19.5-23% range`);
          }
        } else if (reading.value > limits.twa) {
          atmosphericCompliant = false;
          atmosphericGaps.push(`${reading.gasType} ${reading.value}${limits.unit} exceeds WorkSafeBC TWA ${limits.twa}${limits.unit}`);
        }
      }
    });
  }

  results.push({
    standardId: 'BC_OHSR_9_4',
    requirementId: 'atmospheric_testing',
    status: atmosphericCompliant ? 'compliant' : 'non_compliant',
    evidence: hasAtmosphericTesting ? ['qualified_person_atmospheric_testing'] : [],
    gaps: atmosphericGaps,
    priority: 'critical' as const
  });

  // Vérification Section 9.7 - Surveillant
  const hasAttendant = personnel.some(p => 
    p.role === 'attendant' && p.qualifications?.worksafebc_certified
  );
  results.push({
    standardId: 'BC_OHSR_9_7',
    requirementId: 'qualified_attendant',
    status: hasAttendant ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['worksafebc_certified_attendant'] : [],
    gaps: hasAttendant ? [] : ['No WorkSafeBC qualified attendant assigned'],
    priority: 'critical' as const
  });

  // Vérification Section 9.8 - Plan de sauvetage
  const hasRescuePlan = permitData.rescuePlan && permitData.rescuePlan.written;
  results.push({
    standardId: 'BC_OHSR_9_8',
    requirementId: 'rescue_plan',
    status: hasRescuePlan ? 'compliant' : 'non_compliant',
    evidence: hasRescuePlan ? ['written_rescue_plan'] : [],
    gaps: hasRescuePlan ? [] : ['Missing written rescue plan'],
    priority: 'critical' as const
  });

  // Vérifications spécifiques BC selon localisation
  if (location?.marine) {
    const hasMarineSpecific = permitData.marineConsiderations;
    results.push({
      standardId: 'BC_OHSR_9_MARINE',
      requirementId: 'marine_specific_procedures',
      status: hasMarineSpecific ? 'compliant' : 'non_compliant',
      evidence: hasMarineSpecific ? ['marine_specific_assessment'] : [],
      gaps: hasMarineSpecific ? [] : ['Missing marine-specific procedures and equipment'],
      priority: 'high' as const
    });
  }

  // Calcul conformité globale
  const compliantCount = results.filter(r => r.status === 'compliant').length;
  const overallCompliance = (compliantCount / results.length) * 100;

  return {
    jurisdiction: 'BC',
    standardsAssessed: ['BC_OHSR_PART9_CONFINED_SPACES'],
    assessmentDate: Date.now(),
    overallCompliance,
    results,
    criticalNonCompliance: results.filter(r => 
      r.status === 'non_compliant' && r.priority === 'critical'
    ).length,
    actionPlan: generateBCActionPlan(results, location),
    nextAssessment: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 jours
    certifiedBy: 'worksafebc_system',
    bcSpecific: {
      locationConsiderations: location,
      emergencyServices: getBCEmergencyServices(location),
      weatherFactors: getBCWeatherFactors(location)
    },
    metadata: {
      version: '2023.2',
      assessmentMethod: 'worksafebc_automated_compliance_check',
      dataQuality: 'high',
      limitationsNoted: []
    }
  };
}

/**
 * Générer plan d'action spécifique BC
 */
function generateBCActionPlan(results: any[], location?: any): any[] {
  const nonCompliantItems = results.filter(r => r.status === 'non_compliant');
  
  return nonCompliantItems.map(item => ({
    standardId: item.standardId,
    requirement: item.requirementId,
    priority: item.priority,
    action: getBCCorrectiveAction(item.standardId, item.requirementId, location),
    responsible: 'competent_supervisor',
    deadline: item.priority === 'critical' ? 
      'immediate' : 
      item.priority === 'high' ? '24_hours' : '7_days',
    resources: getBCRequiredResources(item.standardId, location),
    verification: 'worksafebc_documentation_standards',
    bcSpecific: {
      emergencyContacts: getBCEmergencyServices(location),
      weatherConsiderations: location?.remote ? 'weather_dependent_timeline' : 'standard_timeline'
    },
    status: 'planned' as const
  }));
}

/**
 * Obtenir action corrective spécifique WorkSafeBC
 */
function getBCCorrectiveAction(
  standardId: string, 
  requirementId: string, 
  location?: any
): { fr: string; en: string; } {
  const baseActions: Record<string, { fr: string; en: string; }> = {
    'BC_OHSR_9_2_risk_assessment': {
      fr: 'Effectuer évaluation des risques par personne qualifiée WorkSafeBC',
      en: 'Conduct risk assessment by WorkSafeBC qualified person'
    },
    'BC_OHSR_9_4_atmospheric_testing': {
      fr: 'Effectuer tests atmosphériques selon ordre WorkSafeBC (O2, inflammables, toxiques)',
      en: 'Conduct atmospheric testing per WorkSafeBC order (O2, flammables, toxics)'
    },
    'BC_OHSR_9_7_qualified_attendant': {
      fr: 'Assigner surveillant certifié WorkSafeBC',
      en: 'Assign WorkSafeBC certified attendant'
    },
    'BC_OHSR_9_8_rescue_plan': {
      fr: 'Développer plan de sauvetage écrit avec équipe formée',
      en: 'Develop written rescue plan with trained team'
    }
  };

  const key = `${standardId}_${requirementId}`;
  let action = baseActions[key] || {
    fr: 'Corriger la non-conformité WorkSafeBC',
    en: 'Correct WorkSafeBC non-compliance'
  };

  // Ajouter considérations spécifiques BC selon localisation
  if (location?.marine) {
    action = {
      fr: `${action.fr} (considérations marines spécifiques)`,
      en: `${action.en} (marine-specific considerations)`
    };
  } else if (location?.remote) {
    action = {
      fr: `${action.fr} (procédures lieux isolés)`,
      en: `${action.en} (remote location procedures)`
    };
  }

  return action;
}

/**
 * Obtenir ressources requises spécifiques BC
 */
function getBCRequiredResources(standardId: string, location?: any): string[] {
  const baseResources: Record<string, string[]> = {
    'BC_OHSR_9_2': ['qualified_person_bc', 'risk_assessment_forms', 'site_inspection'],
    'BC_OHSR_9_4': ['calibrated_detectors', 'qualified_tester_bc', 'continuous_monitoring'],
    'BC_OHSR_9_7': ['worksafebc_certified_attendant', 'communication_equipment'],
    'BC_OHSR_9_8': ['rescue_team_bc', 'rescue_equipment', 'emergency_communication']
  };

  let resources = baseResources[standardId] || ['general_worksafebc_resources'];

  // Ajouter ressources spécifiques selon localisation BC
  if (location?.marine) {
    resources.push('marine_safety_equipment', 'coast_guard_communication', 'immersion_suits');
  }
  if (location?.remote) {
    resources.push('satellite_communication', 'bc_ambulance_helicopter', 'emergency_shelter');
  }
  if (location?.forestry) {
    resources.push('forestry_radio_network', 'wildfire_safety_equipment');
  }

  return resources;
}

/**
 * Obtenir services d'urgence BC selon localisation
 */
function getBCEmergencyServices(location?: any): any {
  const baseServices = {
    ambulance: '911',
    fire: '911',
    police: '911',
    worksafebc: '1-888-621-7233'
  };

  if (location?.marine) {
    return {
      ...baseServices,
      coastGuard: '1-800-567-5111',
      marineRescue: 'VHF Channel 16',
      vesselTraffic: 'VHF Channel 11'
    };
  }

  if (location?.remote) {
    return {
      ...baseServices,
      searchAndRescue: '1-800-567-5111',
      bcAmbulanceHelicopter: '911',
      satelliteEmergency: 'Personal Locator Beacon'
    };
  }

  return baseServices;
}

/**
 * Obtenir facteurs météorologiques BC
 */
function getBCWeatherFactors(location?: any): string[] {
  const baseFactors = ['temperature', 'precipitation', 'wind'];

  if (location?.marine) {
    return [...baseFactors, 'tides', 'sea_state', 'fog', 'storms'];
  }
  
  if (location?.remote) {
    return [...baseFactors, 'avalanche_risk', 'flash_floods', 'extreme_cold'];
  }

  return baseFactors;
}

/**
 * Valider qualifications personnel WorkSafeBC
 */
export function validateBCQualifications(
  personnelData: any[],
  requiredRoles: string[],
  location?: any
): {
  compliant: boolean;
  gaps: string[];
  recommendations: string[];
  bcSpecific?: any;
} {
  const gaps: string[] = [];
  const recommendations: string[] = [];
  const bcSpecific: any = {};

  requiredRoles.forEach(role => {
    const qualified = personnelData.find(p => 
      p.role === role && 
      p.qualifications?.worksafebc_certified
    );

    if (!qualified) {
      gaps.push(`No WorkSafeBC qualified ${role}`);
      recommendations.push(`Provide WorkSafeBC certification for ${role}`);
    }

    // Vérifications spécifiques selon localisation
    if (location?.marine && role === 'attendant') {
      const marineQualified = personnelData.find(p => 
        p.role === role && p.qualifications?.marine_safety_certified
      );
      if (!marineQualified) {
        gaps.push(`Marine attendant missing marine safety certification`);
        recommendations.push(`Obtain Transport Canada marine safety certification`);
      }
    }

    if (location?.remote && ['attendant', 'supervisor'].includes(role)) {
      const firstAidCertified = personnelData.find(p => 
        p.role === role && p.qualifications?.wilderness_first_aid
      );
      if (!firstAidCertified) {
        gaps.push(`${role} missing wilderness first aid for remote location`);
        recommendations.push(`Obtain wilderness first aid certification for remote BC operations`);
      }
    }
  });

  return {
    compliant: gaps.length === 0,
    gaps,
    recommendations,
    bcSpecific: {
      locationRequirements: location,
      emergencyServices: getBCEmergencyServices(location),
      additionalCertifications: location?.marine ? ['marine_safety'] : 
                               location?.remote ? ['wilderness_first_aid'] : []
    }
  };
}

/**
 * Obtenir exigences formation WorkSafeBC
 */
export function getBCTrainingRequirements(
  role: string,
  location?: any
): {
  mandatory: string[];
  recommended: string[];
  frequency: string;
  provider: string[];
  bcSpecific?: any;
} {
  const baseRequirements: Record<string, any> = {
    supervisor: {
      mandatory: [
        'worksafebc_confined_space_supervisor',
        'risk_assessment_competency',
        'emergency_response_coordination'
      ],
      recommended: [
        'occupational_first_aid_level_3',
        'incident_investigation',
        'worksafebc_due_diligence'
      ],
      frequency: 'every_3_years',
      provider: ['worksafebc_approved', 'bc_safety_authority', 'industry_training_organization']
    },
    attendant: {
      mandatory: [
        'worksafebc_confined_space_attendant',
        'communication_procedures',
        'emergency_evacuation_procedures'
      ],
      recommended: [
        'occupational_first_aid_level_1',
        'rescue_techniques_basic'
      ],
      frequency: 'annually',
      provider: ['worksafebc_approved', 'bc_safety_council']
    },
    entrant: {
      mandatory: [
        'worksafebc_confined_space_entrant',
        'ppe_competency',
        'hazard_recognition'
      ],
      recommended: [
        'self_rescue_techniques',
        'basic_first_aid'
      ],
      frequency: 'annually',
      provider: ['worksafebc_approved', 'employer_certified_program']
    }
  };

  let requirements = baseRequirements[role] || {
    mandatory: ['worksafebc_confined_space_awareness'],
    recommended: ['general_safety_orientation'],
    frequency: 'annually',
    provider: ['worksafebc_approved']
  };

  // Ajouter exigences spécifiques BC selon localisation
  if (location?.marine) {
    requirements = {
      ...requirements,
      bcSpecific: {
        marineRequirements: [
          'transport_canada_marine_safety',
          'marine_confined_space_procedures',
          'vessel_emergency_procedures'
        ],
        marineProviders: ['transport_canada', 'bc_maritime_employers_association']
      }
    };
  }

  if (location?.remote) {
    requirements = {
      ...requirements,
      bcSpecific: {
        remoteRequirements: [
          'wilderness_first_aid',
          'satellite_communication_procedures',
          'severe_weather_protocols'
        ],
        remoteProviders: ['bc_search_and_rescue', 'wilderness_medicine_institute']
      }
    };
  }

  return requirements;
}

// =================== EXPORTS ===================
export default {
  WORKSAFEBC_AUTHORITY,
  WORKSAFEBC_STANDARDS,
  BC_EXPOSURE_LIMITS,
  BC_QUALIFICATIONS,
  checkBCCompliance,
  validateBCQualifications,
  getBCTrainingRequirements,
  getBCEmergencyServices,
  getBCWeatherFactors
};

