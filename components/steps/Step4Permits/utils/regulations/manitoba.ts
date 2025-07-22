// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/REGULATIONS/MANITOBA.TS ===================
// Réglementations Manitoba Workplace Safety and Health pour espaces clos
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
    mbSpecificInclusions?: string[];
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
      equipment?: string[];
      frequency?: string;
      retentionPeriod?: string;
      format?: string;
      accessibility?: string;
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
    mbSpecific?: Record<string, any>;
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
  mbSpecificFeatures?: Record<string, any>;
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
    mbSpecific?: Record<string, any>;
  }>;
  nextAssessment: number;
  certifiedBy: string;
  mbSpecific?: Record<string, any>;
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

// =================== CONSTANTES MANITOBA WSH ===================

export const MANITOBA_PROVINCE_CODE: ProvinceCode = 'MB';

export const MANITOBA_WSH_AUTHORITY = {
  name: {
    fr: 'Sécurité et santé au travail Manitoba',
    en: 'Manitoba Workplace Safety and Health'
  },
  acronym: 'Manitoba WSH',
  jurisdiction: ['MB'] as ProvinceCode[],
  website: 'https://www.gov.mb.ca/labour/safety',
  contactInfo: {
    phone: '1-855-957-7233',
    emergencyLine: '911',
    email: 'safety@gov.mb.ca',
    address: {
      street: '401 York Avenue, Suite 1000',
      city: 'Winnipeg',
      province: 'MB',
      postalCode: 'R3C 0P8'
    },
    regionalOffices: [
      {
        region: 'Winnipeg',
        phone: '204-945-3446',
        address: '401 York Avenue'
      },
      {
        region: 'Brandon',
        phone: '204-726-6444',
        address: '314 - 9th Street'
      },
      {
        region: 'Thompson',
        phone: '204-677-6456',
        address: '59 Elizabeth Drive'
      },
      {
        region: 'The Pas',
        phone: '204-627-8270',
        address: 'Provincial Building'
      }
    ]
  },
  powers: {
    fr: 'Inspection des lieux de travail, émission d\'ordonnances d\'amélioration, émission d\'ordres d\'arrêt de travail, amendes et poursuites, investigation d\'accidents, éducation et prévention',
    en: 'Workplace inspections, issue improvement orders, issue stop work orders, fines and prosecutions, accident investigations, education and prevention'
  },
  specialFeatures: [
    'agricultural_safety_focus',
    'mining_expertise',
    'northern_remote_operations',
    'bilingual_services_available'
  ]
};

// =================== STANDARDS MANITOBA WSH ===================

export const MANITOBA_WSH_STANDARDS: Record<string, RegulatoryStandard> = {
  // Part 12 - Confined Spaces (Regulation 217/2006)
  'MB_WSH_PART12_CONFINED_SPACES': {
    id: 'MB_WSH_PART12_CONFINED_SPACES',
    name: {
      fr: 'Règlement Manitoba WSH - Partie 12 : Espaces clos',
      en: 'Manitoba WSH Regulation - Part 12: Confined Spaces'
    },
    type: 'safety',
    category: 'confined_space',
    authority: MANITOBA_WSH_AUTHORITY,
    jurisdiction: ['MB'],
    effectiveDate: new Date('2006-06-01').getTime(),
    lastUpdated: new Date('2022-12-01').getTime(),
    status: 'active',
    hierarchy: {
      parent: 'MB_WORKPLACE_SAFETY_HEALTH_REGULATION_217_2006',
      level: 'part',
      section: 'Part 12',
      subsections: ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '12.7', '12.8', '12.9', '12.10', '12.11']
    },
    scope: {
      workplaces: [
        'industrial', 'construction', 'agricultural', 'mining', 'utilities',
        'municipal', 'healthcare', 'transportation', 'manufacturing'
      ],
      activities: [
        'confined_space_entry', 'maintenance_operations', 'inspection_activities',
        'cleaning_operations', 'emergency_response', 'construction_in_confined_spaces'
      ],
      equipment: [
        'storage_tanks', 'process_vessels', 'grain_bins_silos', 'manholes_sewers',
        'underground_vaults', 'rail_cars_tank_trucks', 'boilers_pressure_vessels'
      ],
      mbSpecificInclusions: [
        'agricultural_grain_storage', 'mining_underground_spaces',
        'northern_remote_facilities', 'hydro_generating_stations'
      ]
    },
    requirements: [
      {
        id: 'MB_WSH_12_1',
        name: {
          fr: 'Section 12.1 - Définitions',
          en: 'Section 12.1 - Definitions'
        },
        description: {
          fr: 'Définitions Manitoba pour espaces clos et termes connexes',
          en: 'Manitoba definitions for confined spaces and related terms'
        },
        mandatory: true,
        criteria: {
          fr: 'Espace clos : espace totalement ou partiellement fermé, non conçu pour occupation humaine continue, moyens d\'entrée et de sortie limités, peut contenir ou développer une atmosphère dangereuse, inclut spécifiquement les silos à grains et espaces agricoles',
          en: 'Confined space: space that is totally or partially enclosed, not designed for continuous human occupancy, limited means of entry and exit, may contain or develop a hazardous atmosphere, specifically includes grain silos and agricultural spaces'
        },
        mbSpecific: {
          agriculturalFocus: [
            'grain_storage_bins_silos', 'livestock_manure_pits',
            'feed_storage_structures', 'agricultural_processing_tanks'
          ],
          miningInclusions: [
            'underground_mine_workings', 'ore_storage_bins',
            'processing_plant_vessels', 'tailings_ponds_structures'
          ]
        },
        verification: {
          methods: ['workplace_assessment', 'hazard_identification', 'space_classification'],
          documentation: ['space_inventory', 'classification_records'],
          frequency: 'annually_or_when_modified'
        }
      },
      {
        id: 'MB_WSH_12_2',
        name: {
          fr: 'Section 12.2 - Responsabilités de l\'employeur',
          en: 'Section 12.2 - Employer Responsibilities'
        },
        description: {
          fr: 'Responsabilités spécifiques de l\'employeur pour espaces clos',
          en: 'Specific employer responsibilities for confined spaces'
        },
        mandatory: true,
        criteria: {
          fr: 'Développer programme écrit de sécurité pour espaces clos, identifier et évaluer tous les espaces clos du lieu de travail, établir procédures d\'entrée sécuritaire, fournir formation appropriée aux travailleurs, assurer disponibilité d\'équipement de sécurité, maintenir registres et documentation',
          en: 'Develop written confined space safety program, identify and assess all confined spaces in workplace, establish safe entry procedures, provide appropriate worker training, ensure availability of safety equipment, maintain records and documentation'
        },
        implementation: {
          timeline: 'within_30_days_of_identification',
          resources: ['competent_person', 'safety_program_template', 'training_materials'],
          responsibilities: ['employer', 'safety_coordinator', 'supervisors'],
          dependencies: ['space_identification', 'hazard_assessment', 'worker_consultation']
        }
      },
      {
        id: 'MB_WSH_12_4',
        name: {
          fr: 'Section 12.4 - Tests atmosphériques',
          en: 'Section 12.4 - Atmospheric Testing'
        },
        description: {
          fr: 'Exigences pour les tests atmosphériques',
          en: 'Requirements for atmospheric testing'
        },
        mandatory: true,
        criteria: {
          fr: 'Tests atmosphériques obligatoires avant entrée, tests par personne compétente avec équipement calibré, ordre de test : oxygène, gaz inflammables, gaz toxiques, tests à tous les niveaux de l\'espace, surveillance continue pendant occupation, documentation de tous les résultats',
          en: 'Mandatory atmospheric testing before entry, testing by competent person with calibrated equipment, testing order: oxygen, flammable gases, toxic gases, testing at all levels of the space, continuous monitoring during occupancy, documentation of all results'
        },
        implementation: {
          standards: {
            oxygen: { min: 19.5, max: 23.0, unit: '%' },
            flammable_gas: { max: 10, unit: '%LEL' },
            carbon_monoxide: { max: 35, unit: 'ppm' },
            hydrogen_sulfide: { max: 10, unit: 'ppm' }
          },
          equipment: ['multi_gas_detectors', 'calibration_gases', 'documentation_forms'],
          frequency: 'before_entry_and_continuous'
        },
        mbSpecific: {
          agriculturalTesting: {
            grainDust: 'combustible_dust_monitoring',
            manurePits: 'methane_hydrogen_sulfide_priority',
            coldWeatherAdjustments: 'temperature_compensation_required'
          },
          miningTesting: {
            undergroundGases: 'continuous_methane_monitoring',
            oxygenDeficiency: 'ventilation_effectiveness_testing',
            depthConsiderations: 'pressure_adjusted_readings'
          }
        }
      },
      {
        id: 'MB_WSH_12_6',
        name: {
          fr: 'Section 12.6 - Systèmes de permis',
          en: 'Section 12.6 - Permit Systems'
        },
        description: {
          fr: 'Exigences pour systèmes de permis d\'entrée',
          en: 'Requirements for entry permit systems'
        },
        mandatory: true,
        criteria: {
          fr: 'Système de permis écrit pour toutes les entrées, autorisation par personne compétente, validité limitée dans le temps, vérification de toutes les mesures de sécurité, signatures et approbations requises, annulation si conditions changent',
          en: 'Written permit system for all entries, authorization by competent person, time-limited validity, verification of all safety measures, required signatures and approvals, cancellation if conditions change'
        }
      },
      {
        id: 'MB_WSH_12_8',
        name: {
          fr: 'Section 12.8 - Surveillance et attendant',
          en: 'Section 12.8 - Monitoring and Attendant'
        },
        description: {
          fr: 'Exigences de surveillance et d\'attendant',
          en: 'Monitoring and attendant requirements'
        },
        mandatory: true,
        criteria: {
          fr: 'Attendant compétent en permanence à l\'extérieur, communication continue avec entrants, surveillance des conditions atmosphériques, autorité pour ordonner évacuation, ne peut quitter son poste, formation en procédures d\'urgence',
          en: 'Competent attendant continuously outside, continuous communication with entrants, monitoring of atmospheric conditions, authority to order evacuation, cannot leave post, training in emergency procedures'
        },
        mbSpecific: {
          remoteOperations: {
            communicationBackup: 'satellite_or_radio_backup_systems',
            weatherDependency: 'severe_weather_postponement_criteria',
            isolationFactors: 'minimum_response_team_size'
          }
        }
      },
      {
        id: 'MB_WSH_12_9',
        name: {
          fr: 'Section 12.9 - Procédures d\'urgence et de sauvetage',
          en: 'Section 12.9 - Emergency and Rescue Procedures'
        },
        description: {
          fr: 'Procédures d\'urgence et de sauvetage',
          en: 'Emergency and rescue procedures'
        },
        mandatory: true,
        criteria: {
          fr: 'Plan d\'urgence écrit spécifique au site, équipe de sauvetage formée et équipée, coordination avec services d\'urgence locaux, procédures pour différents types d\'urgences, exercices réguliers de sauvetage, équipement de sauvetage maintenu et testé',
          en: 'Written site-specific emergency plan, trained and equipped rescue team, coordination with local emergency services, procedures for different emergency types, regular rescue drills, rescue equipment maintained and tested'
        },
        mbSpecific: {
          emergencyServices: {
            ruralResponse: 'volunteer_fire_department_coordination',
            northernRegions: 'nursing_station_and_medevac_access',
            agriculturalEmergencies: 'grain_rescue_specialized_teams'
          },
          weatherConsiderations: {
            winterOperations: 'cold_weather_rescue_procedures',
            remoteAccess: 'snow_and_ice_equipment_access'
          }
        }
      },
      {
        id: 'MB_WSH_12_10',
        name: {
          fr: 'Section 12.10 - Formation et compétence',
          en: 'Section 12.10 - Training and Competency'
        },
        description: {
          fr: 'Exigences de formation et de compétence',
          en: 'Training and competency requirements'
        },
        mandatory: true,
        criteria: {
          fr: 'Formation spécialisée selon le rôle assigné, connaissance des dangers spécifiques au lieu de travail, formation sur utilisation d\'équipement de sécurité, procédures d\'urgence et de sauvetage, mise à jour régulière des compétences, documentation des formations reçues',
          en: 'Specialized training according to assigned role, knowledge of workplace-specific hazards, training on safety equipment use, emergency and rescue procedures, regular skills updating, documentation of training received'
        }
      },
      {
        id: 'MB_WSH_12_11',
        name: {
          fr: 'Section 12.11 - Registres et documentation',
          en: 'Section 12.11 - Records and Documentation'
        },
        description: {
          fr: 'Exigences de tenue de registres et documentation',
          en: 'Record keeping and documentation requirements'
        },
        mandatory: true,
        criteria: {
          fr: 'Registres de tous les permis d\'entrée, documentation des tests atmosphériques, registres de formation du personnel, documentation des inspections d\'équipement, rapports d\'incidents et d\'accidents, conservation des registres pendant période requise',
          en: 'Records of all entry permits, documentation of atmospheric testing, personnel training records, equipment inspection documentation, incident and accident reports, record retention for required period'
        },
        implementation: {
          retentionPeriod: '3_years_minimum',
          format: 'written_or_electronic_acceptable',
          accessibility: 'available_to_inspectors_and_workers'
        }
      }
    ],
    compliance: {
      level: 'mandatory',
      enforcement: 'manitoba_wsh_officers',
      penalties: {
        individual: { min: 250, max: 50000 },
        corporation: { min: 2500, max: 500000 },
        criminal: 'possible_under_criminal_code'
      },
      inspectionFrequency: 'complaint_driven_and_programmed',
      reportingRequirements: [
        'serious_incidents_within_24hours',
        'fatalities_immediately',
        'dangerous_occurrences_within_24hours'
      ]
    },
    mbSpecificFeatures: {
      agriculturalFocus: [
        'grain_storage_safety_emphasis',
        'livestock_facility_considerations',
        'seasonal_agricultural_operations',
        'farm_family_exemptions_noted'
      ],
      miningConsiderations: [
        'underground_mining_applications',
        'surface_mining_operations',
        'mineral_processing_facilities'
      ],
      climateAdaptations: [
        'extreme_cold_weather_operations',
        'equipment_winterization_requirements',
        'seasonal_accessibility_issues'
      ],
      northernOperations: [
        'remote_location_challenges',
        'limited_emergency_services',
        'indigenous_community_considerations'
      ]
    },
    relatedStandards: [
      'MB_WSH_PART2_GENERAL_DUTIES',
      'MB_WSH_PART4_PERSONAL_PROTECTIVE_EQUIPMENT',
      'MB_WSH_PART11_LOCKOUT',
      'MB_WSH_PART13_FALL_PROTECTION',
      'MB_WSH_PART36_MINING_OPERATIONS'
    ],
    references: [
      {
        type: 'act',
        title: 'The Workplace Safety and Health Act',
        citation: 'C.C.S.M. c. W210',
        url: 'https://web2.gov.mb.ca/laws/statutes/ccsm/w210e.php'
      },
      {
        type: 'regulation',
        title: 'Manitoba Regulation 217/2006',
        citation: 'M.R. 217/2006',
        section: 'Part 12',
        url: 'https://web2.gov.mb.ca/laws/regs/current/_pdf-regs.php?reg=217/2006'
      },
      {
        type: 'guideline',
        title: 'Confined Space Safety Guidelines',
        citation: 'MB WSH CS-2022',
        publisher: 'Manitoba WSH',
        url: 'https://www.gov.mb.ca/labour/safety/confined_spaces.html'
      },
      {
        type: 'industry_guide',
        title: 'Agricultural Confined Space Safety',
        citation: 'MB AG-CS-2022',
        publisher: 'Manitoba Agriculture',
        collaboration: 'Manitoba WSH'
      }
    ],
    lastReview: new Date('2022-12-01').getTime(),
    nextReview: new Date('2025-12-01').getTime(),
    metadata: {
      version: '2022.1',
      language: 'en',
      jurisdiction: 'MB',
      effectiveTerritory: 'province_wide',
      specialConditions: [
        'agricultural_exemptions_noted',
        'mining_specific_applications',
        'northern_remote_considerations',
        'indigenous_community_protocols'
      ]
    }
  }
};

// =================== LIMITES EXPOSITION MANITOBA ===================

export const MANITOBA_EXPOSURE_LIMITS: Record<GasType, {
  twa: number;
  stel: number;
  ceiling?: number;
  unit: string;
  source: string;
  mbSpecific?: any;
}> = {
  oxygen: {
    twa: 0,
    stel: 0,
    unit: '%',
    source: 'Manitoba WSH Regulation Part 12',
    mbSpecific: {
      coldWeatherAdjustment: 'equipment_calibration_temperature_compensation',
      altitudeConsideration: 'minimal_elevation_variation_mb'
    }
  },
  carbon_monoxide: {
    twa: 25,
    stel: 125,
    ceiling: 35,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A',
    mbSpecific: {
      agriculturalSources: 'grain_dryer_engine_exhaust_monitoring',
      heatingEquipment: 'winter_heating_carbon_monoxide_prevention'
    }
  },
  hydrogen_sulfide: {
    twa: 10,
    stel: 15,
    ceiling: 10,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A',
    mbSpecific: {
      agriculturalSources: 'manure_pit_livestock_operations',
      industrialSources: 'oil_refining_chemical_processing'
    }
  },
  methane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A',
    mbSpecific: {
      agriculturalSources: 'grain_fermentation_manure_decomposition',
      miningSources: 'underground_coal_mining_operations'
    }
  },
  propane: {
    twa: 1000,
    stel: 1000,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  carbon_dioxide: {
    twa: 5000,
    stel: 30000,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  ammonia: {
    twa: 25,
    stel: 35,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  chlorine: {
    twa: 0.5,
    stel: 1,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  nitrogen_dioxide: {
    twa: 3,
    stel: 5,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  sulfur_dioxide: {
    twa: 2,
    stel: 5,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  benzene: {
    twa: 0.5,
    stel: 2.5,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  toluene: {
    twa: 20,
    stel: 50,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  xylene: {
    twa: 100,
    stel: 150,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  acetone: {
    twa: 500,
    stel: 750,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  },
  formaldehyde: {
    twa: 0.3,
    stel: 0.3,
    unit: 'ppm',
    source: 'Manitoba WSH Regulation Schedule A'
  }
};

// =================== QUALIFICATIONS MANITOBA ===================

export const MANITOBA_QUALIFICATIONS = {
  competent_person: {
    name: {
      fr: 'Personne compétente',
      en: 'Competent Person'
    },
    requirements: {
      fr: 'Connaissance, formation et expérience appropriées, familiarité avec la Loi et règlements Manitoba WSH, connaissance des dangers des espaces clos, autorité pour prendre mesures correctives, capacité d\'identifier conditions dangereuses',
      en: 'Appropriate knowledge, training and experience, familiarity with Manitoba WSH Act and regulations, knowledge of confined space hazards, authority to take corrective measures, ability to identify hazardous conditions'
    },
    certification: 'employer_designated_competency_verified',
    validity: 'ongoing_with_annual_verification',
    mbSpecific: {
      agriculturalCompetency: 'grain_storage_livestock_facility_expertise',
      miningCompetency: 'underground_surface_mining_experience',
      northernOperations: 'remote_location_emergency_procedures'
    }
  },
  atmospheric_tester: {
    name: {
      fr: 'Testeur atmosphérique qualifié',
      en: 'Qualified Atmospheric Tester'
    },
    requirements: {
      fr: 'Formation sur équipement de détection de gaz, connaissance des limites d\'exposition Manitoba, compétence en calibration d\'équipement, interprétation des résultats de tests, procédures d\'urgence si conditions dangereuses',
      en: 'Training on gas detection equipment, knowledge of Manitoba exposure limits, competency in equipment calibration, interpretation of test results, emergency procedures if hazardous conditions'
    },
    certification: 'manufacturer_training_plus_workplace_verification',
    validity: 'annual_recertification_required',
    mbSpecific: {
      coldWeatherTesting: 'equipment_operation_extreme_temperatures',
      agriculturalTesting: 'grain_dust_manure_gas_specialization',
      miningTesting: 'underground_atmosphere_monitoring_expertise'
    }
  },
  attendant: {
    name: {
      fr: 'Surveillant d\'espace clos',
      en: 'Confined Space Attendant'
    },
    requirements: {
      fr: 'Formation spécialisée en surveillance d\'espaces clos, connaissance des procédures d\'urgence, compétence en communication d\'urgence, formation en premiers secours (recommandée), connaissance des systèmes de récupération',
      en: 'Specialized confined space attendant training, knowledge of emergency procedures, competency in emergency communication, first aid training (recommended), knowledge of retrieval systems'
    },
    certification: 'employer_training_program_verified',
    validity: 'annual_refresher_training',
    mbSpecific: {
      ruralOperations: 'limited_emergency_service_response_training',
      agricultureSpecific: 'grain_rescue_procedures_training',
      winterOperations: 'cold_weather_emergency_procedures'
    }
  }
};

// =================== FONCTIONS CONFORMITÉ MANITOBA ===================

/**
 * Vérifier conformité Manitoba WSH pour espace clos
 */
export function checkManitobaCompliance(
  permitData: any,
  atmosphericReadings: any[],
  personnel: any[],
  workplaceType?: 'agricultural' | 'mining' | 'industrial' | 'municipal'
): ComplianceMatrix {
  const results: any[] = [];

  // Vérification Section 12.1 - Définitions et identification
  results.push({
    standardId: 'MB_WSH_12_1',
    requirementId: 'space_identification',
    status: permitData.spaceIdentified ? 'compliant' : 'non_compliant',
    evidence: permitData.spaceIdentified ? ['space_properly_identified'] : [],
    gaps: permitData.spaceIdentified ? [] : ['Missing Manitoba WSH space identification'],
    priority: 'high' as const
  });

  // Vérification Section 12.2 - Programme de sécurité
  const hasWrittenProgram = permitData.safetyProgram?.written;
  results.push({
    standardId: 'MB_WSH_12_2',
    requirementId: 'written_safety_program',
    status: hasWrittenProgram ? 'compliant' : 'non_compliant',
    evidence: hasWrittenProgram ? ['written_confined_space_program'] : [],
    gaps: hasWrittenProgram ? [] : ['Missing written confined space safety program'],
    priority: 'critical' as const
  });

  // Vérification Section 12.4 - Tests atmosphériques
  const hasAtmosphericTesting = atmosphericReadings?.length > 0;
  const recentReadings = hasAtmosphericTesting ? 
    atmosphericReadings.filter(r => Date.now() - r.timestamp < 4 * 60 * 60 * 1000) : [];

  let atmosphericCompliant = true;
  const atmosphericGaps: string[] = [];

  if (recentReadings.length === 0) {
    atmosphericCompliant = false;
    atmosphericGaps.push('No recent atmospheric testing by competent person');
  } else {
    // Vérifier ordre de test Manitoba (O2, inflammables, toxiques)
    const gasTypes = recentReadings.map(r => r.gasType);
    const hasRequiredSequence = gasTypes.includes('oxygen');
    
    if (!hasRequiredSequence) {
      atmosphericCompliant = false;
      atmosphericGaps.push('Missing required oxygen testing first per Manitoba WSH');
    }

    // Vérifier limites Manitoba
    recentReadings.forEach(reading => {
      const gasType = reading.gasType as GasType;
      const limits = MANITOBA_EXPOSURE_LIMITS[gasType];
      if (limits) {
        if (gasType === 'oxygen') {
          if (reading.value < 19.5 || reading.value > 23.0) {
            atmosphericCompliant = false;
            atmosphericGaps.push(`Oxygen level ${reading.value}% outside Manitoba WSH 19.5-23% range`);
          }
        } else if (limits.ceiling && reading.value > limits.ceiling) {
          atmosphericCompliant = false;
          atmosphericGaps.push(`${gasType} ${reading.value}${limits.unit} exceeds Manitoba ceiling ${limits.ceiling}${limits.unit}`);
        }
      }
    });

    // Vérifications spécifiques selon type de lieu de travail
    if (workplaceType === 'agricultural') {
      const hasGrainDustMonitoring = recentReadings.some(r => 
        r.metadata?.tags?.includes('grain_dust') || 
        r.gasType === 'combustible_dust'
      );
      if (!hasGrainDustMonitoring && permitData.grainStoragePresent) {
        atmosphericCompliant = false;
        atmosphericGaps.push('Missing grain dust monitoring for agricultural operations');
      }
    }
  }

  results.push({
    standardId: 'MB_WSH_12_4',
    requirementId: 'atmospheric_testing',
    status: atmosphericCompliant ? 'compliant' : 'non_compliant',
    evidence: hasAtmosphericTesting ? ['competent_person_atmospheric_testing'] : [],
    gaps: atmosphericGaps,
    priority: 'critical' as const
  });

  // Vérification Section 12.8 - Attendant
  const hasAttendant = personnel.some(p => 
    p.role === 'attendant' && p.qualifications?.manitoba_wsh_trained
  );
  results.push({
    standardId: 'MB_WSH_12_8',
    requirementId: 'competent_attendant',
    status: hasAttendant ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['manitoba_trained_attendant'] : [],
    gaps: hasAttendant ? [] : ['No Manitoba WSH trained attendant assigned'],
    priority: 'critical' as const
  });

  // Vérification Section 12.9 - Plan d'urgence
  const hasEmergencyPlan = permitData.emergencyPlan?.siteSpecific;
  results.push({
    standardId: 'MB_WSH_12_9',
    requirementId: 'emergency_plan',
    status: hasEmergencyPlan ? 'compliant' : 'non_compliant',
    evidence: hasEmergencyPlan ? ['site_specific_emergency_plan'] : [],
    gaps: hasEmergencyPlan ? [] : ['Missing site-specific emergency plan'],
    priority: 'critical' as const
  });

  // Calcul conformité globale
  const compliantCount = results.filter(r => r.status === 'compliant').length;
  const overallCompliance = (compliantCount / results.length) * 100;

  return {
    jurisdiction: 'MB',
    standardsAssessed: ['MB_WSH_PART12_CONFINED_SPACES'],
    assessmentDate: Date.now(),
    overallCompliance,
    results,
    criticalNonCompliance: results.filter(r => 
      r.status === 'non_compliant' && r.priority === 'critical'
    ).length,
    actionPlan: generateManitobaActionPlan(results, workplaceType),
    nextAssessment: Date.now() + (30 * 24 * 60 * 60 * 1000),
    certifiedBy: 'manitoba_wsh_system',
    mbSpecific: {
      workplaceType,
      climateConsiderations: getManitobaClimateFactors(),
      emergencyServices: getManitobaEmergencyServices(workplaceType)
    },
    metadata: {
      version: '2022.1',
      assessmentMethod: 'manitoba_wsh_automated_compliance_check',
      dataQuality: 'high',
      limitationsNoted: []
    }
  };
}

/**
 * Générer plan d'action spécifique Manitoba
 */
function generateManitobaActionPlan(
  results: any[], 
  workplaceType?: string
): any[] {
  const nonCompliantItems = results.filter(r => r.status === 'non_compliant');
  
  return nonCompliantItems.map(item => ({
    standardId: item.standardId,
    requirement: item.requirementId,
    priority: item.priority,
    action: getManitobaCorrectiveAction(item.standardId, item.requirementId, workplaceType),
    responsible: 'competent_person',
    deadline: item.priority === 'critical' ? 'immediate' : 
              item.priority === 'high' ? '48_hours' : '7_days',
    resources: getManitobaRequiredResources(item.standardId, workplaceType),
    verification: 'manitoba_wsh_documentation_standards',
    mbSpecific: {
      workplaceConsiderations: workplaceType,
      climateFactors: 'seasonal_accessibility_considerations',
      emergencyContacts: getManitobaEmergencyServices(workplaceType)
    },
    status: 'planned' as const
  }));
}

/**
 * Obtenir action corrective spécifique Manitoba
 */
function getManitobaCorrectiveAction(
  standardId: string, 
  requirementId: string, 
  workplaceType?: string
): { fr: string; en: string; } {
  const baseActions: Record<string, { fr: string; en: string; }> = {
    'MB_WSH_12_2_written_safety_program': {
      fr: 'Développer programme écrit de sécurité pour espaces clos Manitoba WSH',
      en: 'Develop written confined space safety program per Manitoba WSH'
    },
    'MB_WSH_12_4_atmospheric_testing': {
      fr: 'Effectuer tests atmosphériques par personne compétente Manitoba',
      en: 'Conduct atmospheric testing by Manitoba competent person'
    },
    'MB_WSH_12_8_competent_attendant': {
      fr: 'Assigner attendant compétent formé Manitoba WSH',
      en: 'Assign competent attendant trained per Manitoba WSH'
    },
    'MB_WSH_12_9_emergency_plan': {
      fr: 'Développer plan d\'urgence spécifique au site',
      en: 'Develop site-specific emergency plan'
    }
  };

  const key = `${standardId}_${requirementId}`;
  let action = baseActions[key] || {
    fr: 'Corriger la non-conformité Manitoba WSH',
    en: 'Correct Manitoba WSH non-compliance'
  };

  // Ajouter considérations spécifiques selon type de lieu de travail
  if (workplaceType === 'agricultural') {
    action = {
      fr: `${action.fr} (considérations agricoles spécifiques)`,
      en: `${action.en} (agricultural-specific considerations)`
    };
  } else if (workplaceType === 'mining') {
    action = {
      fr: `${action.fr} (considérations minières spécifiques)`,
      en: `${action.en} (mining-specific considerations)`
    };
  }

  return action;
}

/**
 * Obtenir ressources requises spécifiques Manitoba
 */
function getManitobaRequiredResources(
  standardId: string, 
  workplaceType?: string
): string[] {
  const baseResources: Record<string, string[]> = {
    'MB_WSH_12_2': ['competent_person_mb', 'safety_program_template', 'workplace_assessment'],
    'MB_WSH_12_4': ['calibrated_detectors', 'competent_atmospheric_tester', 'documentation_forms'],
    'MB_WSH_12_8': ['trained_attendant_mb', 'communication_equipment', 'monitoring_devices'],
    'MB_WSH_12_9': ['emergency_response_team', 'rescue_equipment', 'emergency_communication']
  };

  let resources = baseResources[standardId] || ['general_manitoba_wsh_resources'];

  // Ajouter ressources spécifiques selon type de lieu de travail
  if (workplaceType === 'agricultural') {
    resources.push('grain_rescue_equipment', 'manure_gas_monitoring', 'agricultural_safety_expertise');
  } else if (workplaceType === 'mining') {
    resources.push('underground_gas_monitoring', 'mine_rescue_team', 'specialized_mining_equipment');
  }

  // Ajouter ressources climat Manitoba
  resources.push('cold_weather_equipment', 'winter_operation_procedures');

  return resources;
}

/**
 * Obtenir facteurs climatiques Manitoba
 */
function getManitobaClimateFactors(): string[] {
  return [
    'extreme_cold_temperatures',
    'equipment_winterization_needs',
    'ice_formation_issues',
    'snow_access_limitations',
    'heating_equipment_co_risk',
    'battery_performance_cold'
  ];
}

/**
 * Obtenir services d'urgence Manitoba
 */
function getManitobaEmergencyServices(workplaceType?: string): any {
  const baseServices = {
    ambulance: '911',
    fire: '911',
    police: '911',
    manitoba_wsh: '1-855-957-7233'
  };

  if (workplaceType === 'agricultural') {
    return {
      ...baseServices,
      grainRescue: 'Manitoba Farm Safety Specialists',
      ruralFire: 'Local Volunteer Fire Department',
      veterinaryEmergency: 'For livestock-related incidents'
    };
  }

  if (workplaceType === 'mining') {
    return {
      ...baseServices,
      mineRescue: 'Manitoba Mine Rescue',
      miningInspector: 'Manitoba Mining Inspector',
      specializedEquipment: 'Underground rescue capabilities'
    };
  }

  return {
    ...baseServices,
    ruralServices: 'Limited in remote areas',
    winterAccess: 'Weather-dependent response times'
  };
}

/**
 * Valider qualifications personnel Manitoba
 */
export function validateManitobaQualifications(
  personnelData: any[],
  requiredRoles: string[],
  workplaceType?: string
): {
  compliant: boolean;
  gaps: string[];
  recommendations: string[];
  mbSpecific?: any;
} {
  const gaps: string[] = [];
  const recommendations: string[] = [];

  requiredRoles.forEach(role => {
    const qualified = personnelData.find(p => 
      p.role === role && p.qualifications?.manitoba_wsh_competent
    );

    if (!qualified) {
      gaps.push(`No Manitoba WSH competent ${role}`);
      recommendations.push(`Ensure ${role} meets Manitoba WSH competency requirements`);
    }
  });

  return {
    compliant: gaps.length === 0,
    gaps,
    recommendations,
    mbSpecific: {
      workplaceType,
      climateTraining: 'cold_weather_operations_training_recommended',
      emergencyResponse: 'rural_emergency_response_training_beneficial'
    }
  };
}

/**
 * Obtenir exigences formation Manitoba
 */
export function getManitobaTrainingRequirements(
  role: string,
  workplaceType?: string
): {
  mandatory: string[];
  recommended: string[];
  frequency: string;
  provider: string[];
  mbSpecific?: any;
} {
  const baseRequirements: Record<string, any> = {
    competent_person: {
      mandatory: [
        'manitoba_wsh_act_regulation_knowledge',
        'confined_space_hazard_recognition',
        'risk_assessment_competency',
        'corrective_action_authority'
      ],
      recommended: [
        'occupational_first_aid',
        'incident_investigation',
        'safety_program_development'
      ],
      frequency: 'ongoing_with_annual_verification',
      provider: ['manitoba_wsh_approved', 'employer_competency_verification', 'safety_associations']
    },
    atmospheric_tester: {
      mandatory: [
        'gas_detection_equipment_training',
        'atmospheric_testing_procedures',
        'equipment_calibration_maintenance',
        'emergency_response_procedures'
      ],
      recommended: [
        'advanced_gas_detection_techniques',
        'equipment_troubleshooting'
      ],
      frequency: 'annually',
      provider: ['equipment_manufacturer', 'safety_training_organizations']
    },
    attendant: {
      mandatory: [
        'confined_space_attendant_duties',
        'emergency_communication_procedures',
        'evacuation_procedures',
        'monitoring_responsibilities'
      ],
      recommended: [
        'first_aid_cpr',
        'rescue_techniques_basic'
      ],
      frequency: 'annually',
      provider: ['manitoba_wsh_approved', 'safety_training_providers']
    }
  };

  let requirements = baseRequirements[role] || {
    mandatory: ['general_confined_space_awareness'],
    recommended: ['workplace_safety_orientation'],
    frequency: 'annually',
    provider: ['employer_training_program']
  };

  // Ajouter exigences spécifiques selon type de lieu de travail
  if (workplaceType === 'agricultural') {
    requirements.mbSpecific = {
      agriculturalRequirements: [
        'grain_storage_safety',
        'livestock_facility_safety',
        'manure_gas_awareness',
        'farm_equipment_safety'
      ],
      agriculturalProviders: ['manitoba_farm_safety', 'agricultural_safety_associations']
    };
  }

  if (workplaceType === 'mining') {
    requirements.mbSpecific = {
      miningRequirements: [
        'underground_mining_safety',
        'mine_gas_monitoring',
        'mine_rescue_procedures',
        'mining_equipment_safety'
      ],
      miningProviders: ['manitoba_mining_association', 'mine_safety_training_centers']
    };
  }

  return requirements;
}

// =================== EXPORTS ===================
export default {
  MANITOBA_WSH_AUTHORITY,
  MANITOBA_WSH_STANDARDS,
  MANITOBA_EXPOSURE_LIMITS,
  MANITOBA_QUALIFICATIONS,
  checkManitobaCompliance,
  validateManitobaQualifications,
  getManitobaTrainingRequirements,
  getManitobaClimateFactors,
  getManitobaEmergencyServices
};
