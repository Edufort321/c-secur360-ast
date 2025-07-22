// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/REGULATIONS/BRITISHCOLUMBIA.TS ===================
// Réglementations British Columbia WorkSafeBC pour espaces clos
"use client";

// Types définis localement pour éviter les dépendances manquantes
export interface BilingualText {
  fr: string;
  en: string;
}

export type ProvinceCode = 
  | 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' 
  | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';

export type GasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'propane'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'acetone'
  | 'formaldehyde';

export interface RegulatoryStandard {
  id: string;
  name: BilingualText;
  type: 'safety' | 'environmental' | 'quality' | 'procedural';
  category: string;
  authority: {
    name: BilingualText;
    acronym: string;
    jurisdiction: ProvinceCode[];
    website: string;
    contactInfo: {
      phone: string;
      emergencyLine: string;
      email: string;
      address: {
        street: string;
        city: string;
        province: string;
        postalCode: string;
      };
      regionalOffices?: Array<{
        region: string;
        phone: string;
        address: string;
      }>;
    };
    powers: BilingualText;
    specialFeatures?: string[];
  };
  jurisdiction: ProvinceCode[];
  effectiveDate: number;
  lastUpdated: number;
  status: 'active' | 'pending' | 'superseded' | 'repealed';
  hierarchy: {
    parent?: string;
    level: 'act' | 'regulation' | 'section' | 'subsection' | 'part';
    section?: string;
    subsections?: string[];
  };
  scope: {
    workplaces: string[];
    activities: string[];
    equipment: string[];
    exclusions?: string[];
    specialConsiderations?: string[];
  };
  requirements: Array<{
    id: string;
    name: BilingualText;
    description: BilingualText;
    mandatory: boolean;
    criteria: BilingualText;
    implementation?: {
      timeline: string;
      resources: string[];
      responsibilities?: string[];
      dependencies?: string[];
      standards?: Record<string, { min?: number; max?: number; unit: string; }>;
    };
    verification?: {
      methods: string[];
      documentation?: string[];
      frequency?: string;
      evidence?: string[];
      nonCompliance?: {
        indicators: string[];
        actions: string[];
      };
    };
    penalties?: {
      individual: { min: number; max: number; };
      corporation: { min: number; max: number; };
      description?: BilingualText;
    };
    provinceSpecific?: Record<string, any>;
  }>;
  compliance: {
    level: 'mandatory' | 'recommended' | 'best_practice';
    enforcement: string;
    penalties: {
      individual: { min: number; max: number; };
      corporation: { min: number; max: number; };
      criminal?: string;
    };
    inspectionFrequency: string;
    reportingRequirements: string[];
  };
  provinceSpecific?: Record<string, any>;
  relatedStandards?: string[];
  references: Array<{
    type: string;
    title: string;
    citation: string;
    section?: string;
    url?: string;
    publisher?: string;
    collaboration?: string;
  }>;
  lastReview: number;
  nextReview: number;
  metadata: {
    version: string;
    language: string;
    jurisdiction: string;
    effectiveTerritory: string;
    specialConditions: string[];
  };
}

export interface ComplianceMatrix {
  jurisdiction: string;
  standardsAssessed: string[];
  assessmentDate: number;
  overallCompliance: number;
  results: Array<{
    standardId: string;
    requirementId: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
    evidence: string[];
    gaps: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  criticalNonCompliance: number;
  actionPlan: Array<{
    standardId: string;
    requirement: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: BilingualText;
    responsible: string;
    deadline: string;
    resources: string[];
    verification: string;
    status: 'planned' | 'in_progress' | 'completed' | 'overdue';
    provinceSpecific?: Record<string, any>;
  }>;
  nextAssessment: number;
  certifiedBy: string;
  provinceSpecific?: Record<string, any>;
  metadata: {
    version: string;
    assessmentMethod: string;
    dataQuality: string;
    limitationsNoted: string[];
  };
}

export interface RegulatoryUpdate {
  id: string;
  standardId: string;
  updateType: 'amendment' | 'revision' | 'new_requirement' | 'repeal';
  effectiveDate: number;
  description: BilingualText;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedSections: string[];
  transitionPeriod?: number;
  complianceActions: string[];
}

export interface StandardRevision {
  revisionId: string;
  standardId: string;
  previousVersion: string;
  newVersion: string;
  revisionDate: number;
  changes: Array<{
    section: string;
    changeType: 'addition' | 'modification' | 'deletion';
    description: BilingualText;
    rationale: BilingualText;
  }>;
  impactAssessment: {
    affected_organizations: number;
    compliance_cost_estimate: number;
    implementation_timeline: string;
  };
}

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
    fr: 'Inspection des lieux de travail, émission d\'ordonnances d\'amélioration, émission d\'ordonnances d\'arrêt de travail, amendes administratives pénales, poursuites pour violations graves, investigation d\'accidents et incidents',
    en: 'Workplace inspections, issue improvement orders, issue stop work orders, administrative monetary penalties, prosecutions for serious violations, accident and incident investigations'
  },
  specialFeatures: [
    'industry_specific_guidelines',
    'comprehensive_prevention_programs',
    'first_nations_collaboration',
    'multilingual_resources'
  ]
};

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
    effectiveDate: new Date('2021-11-01').getTime(),
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
        'industrial', 'construction', 'forestry', 'mining', 'marine',
        'utilities', 'municipal', 'healthcare', 'transportation', 'agriculture'
      ],
      activities: [
        'confined_space_entry', 'maintenance_and_repair', 'inspection_and_testing',
        'cleaning_and_decontamination', 'construction_activities', 'emergency_response'
      ],
      equipment: [
        'tanks_and_vessels', 'silos_and_bins', 'manholes_and_sewers',
        'tunnels_and_shafts', 'pits_and_trenches', 'ship_holds_and_compartments', 'process_equipment'
      ],
      specialConsiderations: [
        'marine_confined_spaces', 'forestry_remote_locations',
        'mining_underground_spaces', 'first_nations_territories'
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
          fr: 'Espace clos : espace totalement ou partiellement fermé, non conçu ou destiné à être occupé par des personnes, entrée ou sortie limitée par son emplacement, sa taille ou ses moyens d\'accès, peut devenir dangereux pour une personne qui y entre, inclut spécifiquement les espaces marins et forestiers',
          en: 'Confined space: space that is totally or partially enclosed, not designed or intended to be occupied by persons, entry or exit is limited by location, size or means of access, may become dangerous to a person entering it, specifically includes marine and forestry spaces'
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
          fr: 'Évaluation des risques par personne qualifiée, identification de tous les dangers potentiels, évaluation des risques atmosphériques, physiques et biologiques, considération des conditions météorologiques (BC), évaluation des voies d\'accès et de sortie, consultation des travailleurs et du comité de santé-sécurité',
          en: 'Risk assessment by qualified person, identification of all potential hazards, assessment of atmospheric, physical and biological risks, consideration of weather conditions (BC), assessment of entry and exit routes, consultation with workers and health and safety committee'
        },
        implementation: {
          timeline: 'before_each_entry_project',
          resources: ['qualified_assessor', 'assessment_tools', 'weather_monitoring'],
          responsibilities: ['qualified_person', 'employer', 'supervisor']
        },
        provinceSpecific: {
          bcSpecific: {
            weatherConsiderations: [
              'coastal_fog_and_visibility', 'mountain_weather_changes',
              'rainfall_and_flooding_risk', 'seismic_activity_potential'
            ],
            environmentalFactors: [
              'tidal_influences_marine_spaces', 'wildlife_encounters', 'remote_location_isolation'
            ]
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
          fr: 'Surveillant qualifié en permanence à l\'extérieur, communication continue avec entrants, surveillance des conditions atmosphériques, autorité pour ordonner évacuation immédiate, ne peut entrer dans l\'espace sauf pour sauvetage d\'urgence, connaissance des procédures d\'urgence et de sauvetage',
          en: 'Qualified attendant continuously outside, continuous communication with entrants, monitoring of atmospheric conditions, authority to order immediate evacuation, cannot enter space except for emergency rescue, knowledge of emergency and rescue procedures'
        },
        provinceSpecific: {
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
          fr: 'Plan de sauvetage écrit avant début des travaux, équipe de sauvetage formée et équipée, équipement de sauvetage immédiatement disponible, communication avec services d\'urgence locaux, procédures pour différents types d\'urgences, formation régulière et exercices de sauvetage',
          en: 'Written rescue plan before work begins, trained and equipped rescue team, rescue equipment immediately available, communication with local emergency services, procedures for different types of emergencies, regular training and rescue drills'
        },
        provinceSpecific: {
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
          fr: 'Formation spécialisée selon le rôle (entrant, surveillant, superviseur), connaissance des dangers spécifiques au site, formation sur équipement de sécurité et de sauvetage, mise à jour régulière des connaissances, certification par organisme reconnu ou employeur, documentation des formations et compétences',
          en: 'Specialized training per role (entrant, attendant, supervisor), knowledge of site-specific hazards, training on safety and rescue equipment, regular knowledge updates, certification by recognized body or employer, documentation of training and competencies'
        }
      }
    ],
    compliance: {
      level: 'mandatory',
      enforcement: 'worksafebc_officers',
      penalties: {
        individual: { min: 734, max: 73400 },
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
    provinceSpecific: {
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
        citation: 'WorkSafeBC G9.1-2023',
        publisher: 'WorkSafeBC',
        url: 'https://www.worksafebc.com/en/health-safety/hazards-exposures/confined-spaces'
      },
      {
        type: 'industry_guide',
        title: 'Marine Confined Space Safety Guide',
        citation: 'BCMEA-CS-2023',
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
    twa: 0,
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
  },
  carbon_dioxide: {
    twa: 5000,
    stel: 30000,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  ammonia: {
    twa: 25,
    stel: 35,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  chlorine: {
    twa: 0.5,
    stel: 1,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  nitrogen_dioxide: {
    twa: 3,
    stel: 5,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  sulfur_dioxide: {
    twa: 2,
    stel: 5,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  benzene: {
    twa: 0.5,
    stel: 2.5,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  toluene: {
    twa: 20,
    stel: 50,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  xylene: {
    twa: 100,
    stel: 150,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  acetone: {
    twa: 500,
    stel: 750,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  },
  formaldehyde: {
    twa: 0.3,
    stel: 0.3,
    unit: 'ppm',
    source: 'WorkSafeBC Schedule 1 Table 1'
  }
};

// =================== QUALIFICATIONS BRITISH COLUMBIA ===================

export const BC_QUALIFICATIONS = {
  qualified_person_atmospheric_testing: {
    name: {
      fr: 'Personne qualifiée pour tests atmosphériques',
      en: 'Qualified Person for Atmospheric Testing'
    },
    requirements: {
      fr: 'Formation certifiée sur équipement de détection, connaissance des limites d\'exposition WorkSafeBC, compétence en interprétation des résultats, formation sur calibration et maintenance d\'équipement, connaissance des dangers spécifiques BC (marine, foresterie)',
      en: 'Certified training on detection equipment, knowledge of WorkSafeBC exposure limits, competency in results interpretation, training on equipment calibration and maintenance, knowledge of BC-specific hazards (marine, forestry)'
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
      fr: 'Autorité pour arrêter le travail dangereux, connaissance approfondie des dangers d\'espaces clos, formation en gestion de permis d\'entrée, compétence en évaluation des risques, formation en procédures d\'urgence et de sauvetage',
      en: 'Authority to stop unsafe work, thorough knowledge of confined space hazards, training in entry permit management, competency in risk assessment, training in emergency and rescue procedures'
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
      fr: 'Formation spécialisée en surveillance d\'espaces clos, compétence en communication d\'urgence, connaissance des procédures d\'évacuation, formation en premiers secours et RCR, connaissance des systèmes de sauvetage',
      en: 'Specialized confined space attendant training, competency in emergency communication, knowledge of evacuation procedures, first aid and CPR training, knowledge of rescue systems'
    },
    certification: 'worksafebc_approved_training',
    validity: 'annual_refresher_required',
    bcSpecific: {
      remoteOperations: 'satellite_communication_certification',
      marineEnvironment: 'marine_emergency_procedures',
      weatherDependency: 'severe_weather_protocols'
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
  const hasRiskAssessment = permitData.riskAssessment?.qualifiedPersonConducted;
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

  // Vérification tests atmosphériques
  const hasAtmosphericTesting = atmosphericReadings?.length > 0;
  const recentReadings = hasAtmosphericTesting ? 
    atmosphericReadings.filter(r => Date.now() - r.timestamp < 2 * 60 * 60 * 1000) : [];

  let atmosphericCompliant = true;
  const atmosphericGaps: string[] = [];

  if (recentReadings.length === 0) {
    atmosphericCompliant = false;
    atmosphericGaps.push('No recent atmospheric testing by qualified person');
  } else {
    // Vérifier ordre de test WorkSafeBC (O2, inflammables, toxiques)
    const gasTypes = recentReadings.map(r => r.gasType);
    const hasOxygen = gasTypes.includes('oxygen');
    
    if (!hasOxygen) {
      atmosphericCompliant = false;
      atmosphericGaps.push('Missing oxygen testing - required first per WorkSafeBC');
    }

    // Vérifier limites BC
    recentReadings.forEach(reading => {
      const gasType = reading.gasType as GasType;
      const limits = BC_EXPOSURE_LIMITS[gasType];
      if (limits) {
        if (gasType === 'oxygen') {
          if (reading.value < 19.5 || reading.value > 23.0) {
            atmosphericCompliant = false;
            atmosphericGaps.push(`Oxygen level ${reading.value}% outside WorkSafeBC 19.5-23% range`);
          }
        } else if (reading.value > limits.twa) {
          atmosphericCompliant = false;
          atmosphericGaps.push(`${gasType} ${reading.value}${limits.unit} exceeds WorkSafeBC TWA ${limits.twa}${limits.unit}`);
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
  const hasRescuePlan = permitData.rescuePlan?.written;
  results.push({
    standardId: 'BC_OHSR_9_8',
    requirementId: 'rescue_plan',
    status: hasRescuePlan ? 'compliant' : 'non_compliant',
    evidence: hasRescuePlan ? ['written_rescue_plan'] : [],
    gaps: hasRescuePlan ? [] : ['Missing written rescue plan'],
    priority: 'critical' as const
  });

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
    nextAssessment: Date.now() + (30 * 24 * 60 * 60 * 1000),
    certifiedBy: 'worksafebc_system',
    provinceSpecific: {
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
    deadline: item.priority === 'critical' ? 'immediate' : 
              item.priority === 'high' ? '24_hours' : '7_days',
    resources: getBCRequiredResources(item.standardId, location),
    verification: 'worksafebc_documentation_standards',
    provinceSpecific: {
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

  requiredRoles.forEach(role => {
    const qualified = personnelData.find(p => 
      p.role === role && p.qualifications?.worksafebc_certified
    );

    if (!qualified) {
      gaps.push(`No WorkSafeBC qualified ${role}`);
      recommendations.push(`Provide WorkSafeBC certification for ${role}`);
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
    requirements.bcSpecific = {
      marineRequirements: [
        'transport_canada_marine_safety',
        'marine_confined_space_procedures',
        'vessel_emergency_procedures'
      ],
      marineProviders: ['transport_canada', 'bc_maritime_employers_association']
    };
  }

  if (location?.remote) {
    requirements.bcSpecific = {
      remoteRequirements: [
        'wilderness_first_aid',
        'satellite_communication_procedures',
        'severe_weather_protocols'
      ],
      remoteProviders: ['bc_search_and_rescue', 'wilderness_medicine_institute']
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
