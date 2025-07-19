/**
 * Northwest Territories Workers' Safety and Compensation Commission (WSCC)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Northwest Territories Safety Act and General Safety Regulations
 * Part 9: Confined Spaces (Sections 9.1-9.30)
 * 
 * Territorial Focus: Mining operations, remote communities, extreme weather, indigenous workforce
 */

import type { 
  RegulationStandard, 
  PersonnelQualification, 
  ComplianceCheck,
  BilingualText,
  AtmosphericReading,
  LegalPermit,
  PersonnelData,
  ComplianceResult,
  ActionPlan
} from '../types';

// =================== NORTHWEST TERRITORIES AUTHORITY ===================

export const WSCC_NT_AUTHORITY = {
  name: 'Workers\' Safety and Compensation Commission of the Northwest Territories and Nunavut',
  acronym: 'WSCC',
  jurisdiction: ['NT'] as const,
  website: 'https://www.wscc.nt.ca',
  contactInfo: {
    phone: '1-800-661-0792',              // Ligne principale WSCC
    preventionPhone: '867-920-3888',       // Prévention
    email: 'prevention@wscc.nt.ca',
    address: 'Centre Square Tower, 5th Floor, 5022 49th Street, Yellowknife, NT X1A 1P5'
  },
  regionalOffices: [
    { region: 'Yellowknife', phone: '867-920-3888', coverage: 'Central NT, Government' },
    { region: 'Hay River', phone: '867-874-6995', coverage: 'Southern NT, Transportation' },
    { region: 'Inuvik', phone: '867-678-2301', coverage: 'Western Arctic, Oil & Gas' },
    { region: 'Fort Smith', phone: '867-872-6192', coverage: 'Eastern NT, Parks Canada' }
  ],
  languages: ['en', 'fr'] as const,        // English primary, French services available
  indigenousLanguages: [                   // Services disponibles langues autochtones
    'dene', 'inuktitut', 'inuvialuktun', 'gwich_in', 'tlicho'
  ],
  specializedUnits: [
    'mining_safety_division',             // Division sécurité minière
    'remote_operations_unit',             // Unité opérations isolées
    'indigenous_safety_program'           // Programme sécurité autochtone
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties',
    'Prosecutions under territorial law'
  ]
} as const;

// =================== NT SPECIFIC FEATURES ===================

export const NT_SPECIFIC_FEATURES = {
  miningOperations: [
    'diamond_mining_ekati_diavik',         // Mines diamant Ekati/Diavik
    'gold_mining_operations',
    'rare_earth_mineral_extraction',
    'underground_mining_northern_conditions',
    'fly_in_fly_out_mining_camps'
  ],
  remoteOperations: [
    'isolated_community_access',
    'seasonal_ice_road_dependency',       // Dépendance routes glace saisonnières
    'extreme_weather_operations',         // -50°C opérations
    'satellite_communication_dependency',
    'limited_emergency_services_access'
  ],
  indigenousWorkforce: [
    'first_nations_dene_workers',
    'inuit_workforce_integration',
    'traditional_knowledge_integration',   // Intégration savoirs traditionnels
    'cultural_safety_considerations',
    'language_barrier_accommodations'
  ],
  environmentalChallenges: [
    'permafrost_ground_conditions',       // Conditions pergélisol
    'extreme_cold_equipment_challenges',
    'daylight_seasonal_variations',       // Variations lumière saisonnières
    'wildlife_encounter_protocols',
    'environmental_protection_requirements'
  ],
  emergencyResponse: [
    'medevac_helicopter_dependency',      // Dépendance évacuation médicale hélico
    'volunteer_fire_departments',
    'community_emergency_response',
    'search_rescue_coordination',
    'satellite_emergency_beacons'
  ],
  regulatoryIntegration: [
    'indigenous_self_government_agreements', // Accords autonomie gouvernementale
    'land_claim_agreement_compliance',
    'environmental_assessment_requirements',
    'federal_territorial_jurisdiction_coordination'
  ]
} as const;

// =================== NT REGULATION STANDARDS ===================

export const NT_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'NT_GSR_9_1': {
    id: 'NT_GSR_9_1',
    title: { 
      en: 'Confined Space Definition and Scope', 
      fr: 'Définition et Portée d\'Espace Clos' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    section: '9.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has limited means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes northern mining and remote operation facilities'  // NT specific
    ],
    ntSpecific: {
      miningDefinitions: [
        'underground_mine_workings_permafrost',
        'diamond_processing_vessels',
        'ore_storage_bins_frozen_conditions',
        'mining_equipment_enclosed_cabs'
      ],
      remoteOperationsDefinitions: [
        'fuel_storage_tanks_remote_locations',
        'generator_enclosures_community_power',
        'communication_equipment_shelters',
        'emergency_shelter_confined_spaces'
      ],
      environmentalConsiderations: [
        'permafrost_affected_structures',
        'extreme_cold_confined_spaces',
        'seasonal_access_limitations'
      ]
    },
    penalties: {
      individual: { min: 500, max: 100000 },   // 2023 amounts
      corporation: { min: 2500, max: 1000000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Northwest Territories General Safety Regulations',
        citation: 'NWT Reg. 003-2016',
        url: 'https://www.justice.gov.nt.ca/en/files/legislation/safety/safety.r3.pdf'
      }
    ]
  },

  'NT_GSR_9_5': {
    id: 'NT_GSR_9_5',
    title: { 
      en: 'Hazard Assessment for Northern Conditions', 
      fr: 'Évaluation des Dangers pour Conditions Nordiques' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    section: '9.5',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Identification of all potential hazards including environmental',
      'Assessment of atmospheric, physical, and biological hazards',
      'Evaluation of access routes and emergency evacuation',
      'Consideration of northern conditions and seasonal factors'
    ],
    ntSpecific: {
      environmentalHazards: {
        permafrostInstability: 'ground_movement_and_structural_integrity',
        extremeCold: 'hypothermia_and_equipment_failure_risk',
        seasonalAccess: 'ice_road_dependency_and_seasonal_isolation',
        wildlifeEncounters: 'bear_and_wildlife_safety_protocols'
      },
      miningHazards: {
        undergroundPermafrost: 'ground_stability_in_permafrost_conditions',
        remoteMining: 'isolation_and_emergency_response_limitations',
        chemicalProcessing: 'diamond_processing_chemical_hazards'
      },
      indigenousConsiderations: {
        culturalSafety: 'traditional_knowledge_and_cultural_practices',
        languageBarriers: 'communication_in_indigenous_languages',
        communityInvolvement: 'local_community_safety_input'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'northern_conditions_training'],
      responsibilities: ['employer', 'competent_person', 'safety_committee', 'community_representatives']
    }
  },

  'NT_GSR_9_10': {
    id: 'NT_GSR_9_10',
    title: { 
      en: 'Atmospheric Testing in Northern Conditions', 
      fr: 'Tests Atmosphériques en Conditions Nordiques' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    section: '9.10',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of cold-weather rated and calibrated equipment',
      'Documentation of all test results with temperature compensation'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    ntSpecific: {
      coldWeatherTesting: {
        temperatureCompensation: 'equipment_calibration_extreme_cold',
        equipmentProtection: 'cold_weather_equipment_specifications',
        batteryLife: 'extended_battery_backup_cold_conditions'
      },
      miningTesting: {
        undergroundGases: ['methane_permafrost', 'radon_uranium_deposits'],
        processingChemicals: ['cyanide_gold_processing', 'diamond_processing_chemicals'],
        ventilationChallenges: 'permafrost_ventilation_effectiveness'
      },
      remoteOperationsTesting: {
        fuelVapors: 'diesel_heating_fuel_vapors',
        generatorExhaust: 'carbon_monoxide_from_backup_generators',
        propaneHeating: 'propane_heating_system_leaks'
      }
    }
  },

  'NT_GSR_9_15': {
    id: 'NT_GSR_9_15',
    title: { 
      en: 'Entry Permit System for Remote Operations', 
      fr: 'Système de Permis d\'Entrée pour Opérations Isolées' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    section: '9.15',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of safety measures and emergency procedures',
      'Communication plan for remote locations',
      'Weather and environmental condition limitations'
    ],
    ntSpecific: {
      remoteOperationsPermits: {
        communicationProtocols: 'satellite_radio_backup_communication',
        weatherLimitations: 'extreme_cold_wind_visibility_limits',
        emergencyEvacuation: 'medevac_helicopter_accessibility',
        seasonalRestrictions: 'ice_road_seasonal_access_considerations'
      },
      miningPermits: {
        shiftCoordination: 'fly_in_fly_out_shift_coordination',
        undergroundAccess: 'permafrost_mine_access_stability',
        emergencyResponse: 'mine_rescue_team_remote_response'
      },
      indigenousCoordination: {
        communityNotification: 'local_community_safety_coordinator_notice',
        traditionalLandUse: 'traditional_territory_activity_coordination',
        culturalProtocols: 'indigenous_safety_protocols_integration'
      }
    }
  },

  'NT_GSR_9_20': {
    id: 'NT_GSR_9_20',
    title: { 
      en: 'Attendant and Communication Systems', 
      fr: 'Surveillant et Systèmes de Communication' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    section: '9.20',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Reliable communication with entrants at all times',
      'Monitoring of external conditions affecting safety',
      'Emergency response coordination capability',
      'Understanding of remote location emergency procedures'
    ],
    ntSpecific: {
      communicationSystems: {
        primarySystems: 'two_way_radio_satellite_communication',
        backupSystems: 'emergency_satellite_beacon_activation',
        weatherDependency: 'communication_system_weather_resilience'
      },
      remoteAttendant: {
        isolationFactors: 'minimum_two_person_attendant_team',
        emergencyCoordination: 'community_emergency_response_coordination',
        medicalEmergency: 'first_aid_wilderness_medical_training'
      },
      indigenousAttendant: {
        languageCompetency: 'communication_in_worker_preferred_language',
        culturalCompetency: 'understanding_indigenous_safety_practices',
        communityIntegration: 'local_community_safety_representative'
      }
    }
  }
};

// =================== NT ATMOSPHERIC STANDARDS ===================

export const NT_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // NT Mining Industry Specific
  miningSpecific: {
    methane_permafrost: { max: 1.0, unit: '%' },        // Methane from permafrost
    radon_uranium: { max: 0.2, unit: 'pCi/L' },         // Radon from uranium deposits
    cyanide_gold: { max: 4.7, unit: 'mg/m³' },          // Gold processing
    ammonia_explosives: { max: 25, unit: 'ppm' },       // Explosive storage
    diesel_exhaust: { max: 1.5, unit: 'mg/m³' }         // Underground diesel equipment
  },
  
  // NT Remote Operations Specific  
  remoteOperationsSpecific: {
    diesel_vapors: { max: 100, unit: 'mg/m³' },         // Heating fuel storage
    propane_heating: { max: 1000, unit: 'ppm' },        // Propane heating systems
    generator_exhaust: { max: 25, unit: 'ppm' },        // Backup generator CO
    fuel_additives: 'per_material_safety_data_sheet'    // Arctic fuel additives
  },
  
  // Cold Weather Adjustments
  coldWeatherAdjustments: {
    temperatureCompensation: 'readings_adjusted_for_extreme_cold',
    equipmentLimitations: 'sensor_accuracy_below_minus_30C',
    calibrationFrequency: 'increased_calibration_cold_conditions'
  }
} as const;

// =================== NT PERSONNEL QUALIFICATIONS ===================

export const NT_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'nt_competent_person',
    title: { 
      en: 'Competent Person - Northern Confined Space', 
      fr: 'Personne Compétente - Espace Clos Nordique' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with NT Safety Act and Regulations',
      'Understanding of northern environmental conditions',
      'Ability to coordinate emergency response in remote locations',
      'Cultural competency for indigenous workforce'
    ],
    ntSpecific: {
      northernConditions: {
        coldWeatherOperations: 'extreme_cold_weather_safety_training',
        permafrostAwareness: 'permafrost_ground_conditions_training',
        wildlifeSafety: 'northern_wildlife_encounter_protocols'
      },
      miningCompetency: {
        certifications: ['northern_mining_safety', 'underground_mining_permafrost'],
        experience: 'diamond_or_gold_mining_northern_operations',
        emergencyResponse: 'mine_rescue_remote_location_coordination'
      },
      indigenousCompetency: {
        culturalTraining: 'indigenous_cultural_safety_training',
        languageSupport: 'interpreter_services_coordination',
        communityEngagement: 'community_safety_representative_liaison'
      },
      remoteOperations: {
        communicationSystems: 'satellite_communication_emergency_procedures',
        firstAid: 'wilderness_first_aid_emergency_medical_response',
        isolation: 'remote_location_emergency_coordination'
      }
    },
    certification: 'wscc_approved_training_plus_northern_specialization',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'wscc_confined_space_competent_person',
      'northern_conditions_safety_training',
      'emergency_response_remote_locations',
      'indigenous_cultural_safety_awareness'
    ]
  },

  attendant: {
    id: 'nt_attendant',
    title: { 
      en: 'Northern Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Nordique' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    requirements: [
      'Training in attendant duties for northern conditions',
      'Knowledge of communication procedures and backup systems',
      'Understanding of emergency evacuation in remote locations',
      'Familiarity with atmospheric monitoring in cold conditions',
      'Wilderness first aid and emergency response training'
    ],
    ntSpecific: {
      communicationSystems: {
        satelliteCommunication: 'satellite_radio_operation_training',
        emergencyBeacons: 'personal_locator_beacon_activation',
        weatherBackup: 'communication_system_weather_failure_procedures'
      },
      remoteOperations: {
        isolationFactors: 'buddy_system_remote_location_safety',
        emergencyResponse: 'community_emergency_response_coordination',
        medicalEmergency: 'wilderness_first_aid_certification_required'
      },
      indigenousSupport: {
        languageServices: 'interpreter_services_availability',
        culturalSafety: 'indigenous_safety_practices_understanding',
        communityLiaison: 'local_safety_representative_coordination'
      },
      environmentalAwareness: {
        coldWeather: 'hypothermia_recognition_and_prevention',
        wildlife: 'bear_safety_and_wildlife_deterrent_training',
        seasonal: 'seasonal_hazard_recognition_training'
      }
    },
    certification: 'wscc_approved_attendant_training_plus_northern_specialization',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'nt_atmospheric_tester',
    title: { 
      en: 'Northern Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Nordique' 
    },
    authority: 'WSCC',
    jurisdiction: ['NT'],
    requirements: [
      'Training on cold-weather gas detection equipment',
      'Knowledge of NT atmospheric standards and northern adjustments',
      'Understanding of equipment limitations in extreme conditions',
      'Ability to perform temperature-compensated readings',
      'Knowledge of northern-specific atmospheric hazards'
    ],
    ntSpecific: {
      coldWeatherTesting: {
        equipmentOperation: 'gas_detector_operation_extreme_cold',
        temperatureCompensation: 'manual_temperature_adjustment_calculations',
        equipmentMaintenance: 'cold_weather_equipment_care_procedures'
      },
      miningTesting: {
        undergroundNorthern: 'permafrost_mine_atmospheric_monitoring',
        processingChemicals: 'diamond_gold_processing_chemical_detection',
        ventilationAssessment: 'northern_mine_ventilation_effectiveness'
      },
      remoteOperationsTesting: {
        fuelSystemTesting: 'heating_fuel_vapor_detection_procedures',
        generatorMonitoring: 'backup_generator_exhaust_monitoring',
        emergencyTesting: 'emergency_atmospheric_testing_protocols'
      }
    },
    certification: 'equipment_manufacturer_plus_northern_conditions_training',
    validity: 'annual_recertification_with_cold_weather_updates'
  }
};

// =================== NT EMERGENCY SERVICES ===================

export const NT_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wscc: '1-800-661-0792'
  },
  
  territorialServices: {
    emergencyMeasures: '867-873-7750',        // NT Emergency Measures Organization
    healthEmergency: '867-777-7400',          // Health and Social Services Emergency
    searchRescue: '1-800-267-7270',           // Joint Rescue Coordination Centre Trenton
    environmentalEmergency: '867-767-9235'    // Environment and Natural Resources
  },
  
  mining: {
    mineRescue: '911_request_mine_rescue_team',
    diamondMines: {
      ekatiMine: '867-669-6500',             // Ekati Diamond Mine
      diavikMine: '867-669-6210'            // Diavik Diamond Mine
    },
    miningAssociation: '867-873-5281',       // NWT & Nunavut Chamber of Mines
    transportationEmergency: '867-767-9088'  // Department of Infrastructure
  },
  
  remoteOperations: {
    communityEmergency: 'local_community_emergency_coordinator',
    medicalEvacuation: {
      yellowknifeBase: '867-920-8888',       // Yellowknife medevac
      inuvikBase: '867-777-7400',            // Inuvik health centre
      fortSmithBase: '867-872-0111'          // Fort Smith health centre
    },
    satelliteEmergency: {
      sar: 'personal_locator_beacon_406_mhz', // Search and Rescue satellite
      spot: 'spot_satellite_messenger',       // SPOT emergency beacon
      inreach: 'garmin_inreach_satellite'     // Garmin satellite communication
    }
  },
  
  indigenousCommunities: {
    deneCommunities: 'local_chief_and_council_emergency_contact',
    inuitCommunities: 'hamlet_emergency_coordinator',
    metisSettlements: 'settlement_council_emergency_contact',
    traditionalKnowledge: 'elder_consultation_emergency_protocols'
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    mineRescue: 'territorial_mine_rescue_association',
    wildernessRescue: 'canadian_rangers_coordination',
    helicopterRescue: 'northern_helicopter_service_providers'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkNTCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: 'mining' | 'remote_operations' | 'community' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(NT_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(NT_REGULATION_STANDARDS).forEach(standard => {
    const check = performNTStandardCheck(standard, permitData, atmosphericReadings, personnel, operationType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'NT',
    overallCompliance,
    results,
    criticalNonCompliance,
    ntSpecific: {
      operationType: operationType || 'general',
      northernConditions: getNorthernConditions(),
      miningConsiderations: operationType === 'mining' ? getMiningConsiderations() : undefined,
      remoteOperationsConsiderations: operationType === 'remote_operations' ? getRemoteOperationsConsiderations() : undefined,
      indigenousConsiderations: getIndigenousConsiderations(),
      emergencyServices: getNTEmergencyServices(operationType),
      environmentalFactors: getNTEnvironmentalFactors(),
      seasonalLimitations: getSeasonalLimitations()
    },
    actionPlan: generateNTActionPlan(results.filter(r => r.status === 'non_compliant'), operationType)
  };
}

function performNTStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'NT_GSR_9_1':
      return checkConfinedSpaceIdentification(permitData);
    case 'NT_GSR_9_5':
      return checkNorthernHazardAssessment(permitData, operationType);
    case 'NT_GSR_9_10':
      return checkNorthernAtmosphericTesting(atmosphericReadings, operationType);
    case 'NT_GSR_9_15':
      return checkRemoteEntryPermitSystem(permitData, operationType);
    case 'NT_GSR_9_20':
      return checkNorthernAttendantRequirements(personnel, operationType);
    default:
      return {
        standardId: standard.id,
        requirementId: 'general_compliance',
        status: 'compliant',
        evidence: [],
        priority: 'medium'
      };
  }
}

function getNorthernConditions() {
  return {
    temperatureRange: 'minus_50_to_plus_30_celsius',
    permafrostPresence: 'continuous_discontinuous_permafrost_zones',
    seasonalAccess: 'winter_road_seasonal_access_limitations',
    daylightVariation: 'extreme_seasonal_daylight_variation',
    weatherChallenges: 'blizzards_extreme_wind_visibility_issues'
  };
}

function getMiningConsiderations() {
  return {
    undergroundConditions: 'permafrost_mine_workings_stability',
    processingOperations: 'diamond_gold_chemical_processing_hazards',
    remoteLocation: 'fly_in_fly_out_operations_isolation',
    emergencyResponse: 'mine_rescue_team_coordination_northern_conditions',
    environmentalProtection: 'arctic_environmental_sensitivity'
  };
}

function getRemoteOperationsConsiderations() {
  return {
    communicationChallenges: 'satellite_dependency_weather_interference',
    accessLimitations: 'seasonal_ice_road_helicopter_dependency',
    emergencyResponse: 'extended_response_times_limited_resources',
    equipmentChallenges: 'extreme_cold_equipment_reliability',
    supplyChallenges: 'seasonal_resupply_limitations'
  };
}

function getIndigenousConsiderations() {
  return {
    culturalSafety: 'traditional_knowledge_integration_safety_practices',
    languageAccommodation: 'interpreter_services_indigenous_languages',
    communityEngagement: 'local_community_safety_representative_involvement',
    traditionalTerritory: 'traditional_land_use_activity_coordination',
    capacityBuilding: 'indigenous_workforce_safety_training_development'
  };
}

function getNTEmergencyServices(operationType?: string) {
  const base = NT_EMERGENCY_SERVICES.general;
  
  if (operationType === 'mining') {
    return { ...base, ...NT_EMERGENCY_SERVICES.mining };
  }
  
  if (operationType === 'remote_operations') {
    return { ...base, ...NT_EMERGENCY_SERVICES.remoteOperations };
  }
  
  return { ...base, ...NT_EMERGENCY_SERVICES.territorialServices };
}

function getNTEnvironmentalFactors() {
  return {
    temperature: 'extreme_cold_minus_50_celsius',
    permafrost: 'ground_instability_seasonal_thaw',
    wildlife: 'bear_caribou_encounter_protocols',
    weather: 'blizzard_whiteout_conditions',
    daylight: 'polar_night_midnight_sun_variations',
    isolation: 'extreme_remote_location_factors'
  };
}

function getSeasonalLimitations() {
  return {
    winter: 'extreme_cold_limited_daylight_ice_road_access',
    spring: 'breakup_flooding_unstable_ice_conditions',
    summer: 'permafrost_thaw_wildlife_activity_increase',
    fall: 'freeze_up_weather_uncertainty_access_changes'
  };
}

function generateNTActionPlan(nonCompliantResults: ComplianceCheck[], operationType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getNTCorrectiveAction(result.requirementId, operationType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getNTRequiredResources(result.requirementId, operationType),
    verification: 'wscc_inspector_verification'
  }));
}

function getNTCorrectiveAction(requirementId: string, operationType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${operationType || 'northern'} operations with environmental considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${operationType || 'nordiques'} avec considérations environnementales`
    },
    northern_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including northern environmental conditions for ${operationType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant conditions environnementales nordiques pour opérations ${operationType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with cold-weather equipment and northern standards for ${operationType || 'general'} operations`,
      fr: `Effectuer tests atmosphériques avec équipement temps froid et standards nordiques pour opérations ${operationType || 'générales'}`
    },
    entry_permit: {
      en: `Implement entry permit system with northern conditions and ${operationType || 'general'} operation requirements`,
      fr: `Implémenter système permis d'entrée avec conditions nordiques et exigences opérations ${operationType || 'générales'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with northern conditions training and ${operationType || 'general'} operation experience`,
      fr: `Assigner surveillant qualifié avec formation conditions nordiques et expérience opérations ${operationType || 'générales'}`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WSCC requirements for northern operations',
    fr: 'Traiter non-conformité identifiée selon exigences WSCC pour opérations nordiques'
  };
}

function getNTRequiredResources(requirementId: string, operationType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_person', 'northern_conditions_assessment'],
    northern_hazard_assessment: ['competent_person', 'environmental_assessment_tools', 'indigenous_consultation'],
    atmospheric_testing: ['cold_weather_detectors', 'temperature_compensation_equipment'],
    entry_permit: ['permit_forms', 'communication_equipment', 'weather_monitoring'],
    attendant_present: ['trained_attendant', 'satellite_communication', 'emergency_response_plan']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add operation-specific resources
  if (operationType === 'mining') {
    resources.push('mine_rescue_coordination', 'underground_communication_systems');
  } else if (operationType === 'remote_operations') {
    resources.push('satellite_emergency_beacon', 'wilderness_first_aid_supplies');
  }
  
  // Add northern-specific resources
  resources.push('cold_weather_safety_equipment', 'indigenous_safety_representative');
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasNorthernConsiderations = permitData.spaceDetails?.environmentalFactors?.includes('northern_conditions');
  
  return {
    standardId: 'NT_GSR_9_1',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasNorthernConsiderations ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasNorthernConsiderations ? [] : ['Missing northern environmental considerations'])
    ],
    priority: 'critical'
  };
}

function checkNorthernHazardAssessment(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasNorthernHazards = permitData.hazardAssessment?.environmentalHazards?.some(h => 
    ['extreme_cold', 'permafrost', 'wildlife', 'isolation'].includes(h)
  );
  const hasOperationSpecificAssessment = operationType ? 
    permitData.hazardAssessment?.operationSpecific?.[operationType] !== undefined : true;
  
  return {
    standardId: 'NT_GSR_9_5',
    requirementId: 'northern_hazard_assessment',
    status: hasAssessment && hasNorthernHazards && hasOperationSpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasNorthernHazards ? [] : ['Missing northern environmental hazard assessment']),
      ...(hasOperationSpecificAssessment ? [] : [`Missing ${operationType} operation-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkNorthernAtmosphericTesting(atmosphericReadings: AtmosphericReading[], operationType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'NT_GSR_9_10',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getNTStandardsForOperation(operationType);
  const hasColdWeatherCompensation = atmosphericReadings.some(r => r.temperatureCompensation !== undefined);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isNTReadingCompliant(reading, standards);
  });

  return {
    standardId: 'NT_GSR_9_10',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasColdWeatherCompensation ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for northern ${operationType || 'general'} operations`
      ),
      ...(hasColdWeatherCompensation ? [] : ['Missing cold weather temperature compensation'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkRemoteEntryPermitSystem(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasCommunicationPlan = permitData.entryPermit?.communicationPlan !== undefined;
  const hasEmergencyProcedures = permitData.entryPermit?.emergencyProcedures?.includes('remote_location_procedures');
  
  return {
    standardId: 'NT_GSR_9_15',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasCommunicationPlan && hasEmergencyProcedures ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasCommunicationPlan ? [] : ['Missing communication plan for remote operations']),
      ...(hasEmergencyProcedures ? [] : ['Missing remote location emergency procedures'])
    ],
    priority: 'critical'
  };
}

function checkNorthernAttendantRequirements(personnel: PersonnelData[], operationType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasNorthernTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasNorthernSpecificTraining(p, operationType));
  const hasBackupAttendant = personnel.filter(p => p.role === 'attendant').length >= 2; // Remote operations require backup
  
  return {
    standardId: 'NT_GSR_9_20',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasNorthernTraining && hasBackupAttendant ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasNorthernTraining ? [] : [`Attendant lacks northern conditions training`]),
      ...(hasBackupAttendant ? [] : ['Missing backup attendant for remote operations'])
    ],
    priority: 'critical'
  };
}

function getNTStandardsForOperation(operationType?: string) {
  const baseStandards = NT_ATMOSPHERIC_STANDARDS;
  
  if (operationType === 'mining') {
    return { ...baseStandards, ...baseStandards.miningSpecific };
  }
  
  if (operationType === 'remote_operations') {
    return { ...baseStandards, ...baseStandards.remoteOperationsSpecific };
  }
  
  return baseStandards;
}

function isNTReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
  const gasStandard = standards[reading.gasType];
  if (!gasStandard) return true;
  
  if ('min' in gasStandard && 'max' in gasStandard) {
    return reading.value >= gasStandard.min && reading.value <= gasStandard.max;
  }
  if ('max' in gasStandard) {
    return reading.value <= gasStandard.max;
  }
  return true;
}

function hasNorthernSpecificTraining(personnel: PersonnelData, operationType?: string): boolean {
  const requiredTraining = {
    mining: ['northern_mining_safety', 'underground_permafrost_operations'],
    remote_operations: ['wilderness_first_aid', 'satellite_communication_emergency'],
    community: ['indigenous_cultural_safety', 'community_emergency_response']
  };
  
  const northernBaseline = ['cold_weather_operations', 'northern_emergency_procedures'];
  const operationSpecific = operationType ? requiredTraining[operationType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...northernBaseline, ...operationSpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WSCC_NT_AUTHORITY,
  NT_SPECIFIC_FEATURES,
  NT_REGULATION_STANDARDS,
  NT_ATMOSPHERIC_STANDARDS,
  NT_PERSONNEL_QUALIFICATIONS,
  NT_EMERGENCY_SERVICES,
  checkNTCompliance
};

export type NTOperationType = 'mining' | 'remote_operations' | 'community' | 'general';
export type NTRegulationStandardId = keyof typeof NT_REGULATION_STANDARDS;
export type NTPersonnelQualificationId = keyof typeof NT_PERSONNEL_QUALIFICATIONS;
