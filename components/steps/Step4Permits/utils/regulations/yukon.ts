/**
 * Yukon Workers' Safety and Compensation Commission (WSCC)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Yukon Occupational Health and Safety Act and Regulations
 * Part 22: Confined Spaces (Sections 22.1-22.20)
 * 
 * Territorial Focus: Mining, tourism, extreme northern conditions, indigenous communities
 */
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

export interface RegulationStandard {
  id: string;
  title: BilingualText;
  authority: string;
  jurisdiction: ProvinceCode[];
  section: string;
  category: string;
  mandatory: boolean;
  criteria: string[];
  ytSpecific?: Record<string, any>;
  penalties?: {
    individual: { min: number; max: number; };
    corporation: { min: number; max: number; };
  };
  references?: Array<{
    type: string;
    title: string;
    citation: string;
    url?: string;
  }>;
  standards?: Record<string, { min?: number; max?: number; unit: string; }>;
  implementation?: {
    timeline: string;
    resources: string[];
    responsibilities: string[];
  };
}

export interface PersonnelQualification {
  id: string;
  title: BilingualText;
  authority: string;
  jurisdiction: ProvinceCode[];
  requirements: string[];
  ytSpecific?: Record<string, any>;
  certification: string;
  validity: string;
  mandatoryTraining?: string[];
}

export interface ComplianceCheck {
  standardId: string;
  requirementId: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence: string[];
  gaps?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AtmosphericReading {
  gasType: string;
  value: number;
  unit: string;
  timestamp: number;
  location?: string;
  equipmentRating?: string[];
  temperatureCompensation?: any;
}

export interface LegalPermit {
  id: string;
  spaceDetails?: {
    identification?: string;
    environmentalFactors?: string[];
  };
  hazardAssessment?: {
    environmentalHazards?: string[];
    traditionalKnowledge?: any;
    operationSpecific?: Record<string, any>;
  };
  entryPermit?: {
    weatherLimitations?: any;
    emergencyEvacuation?: string[];
    communicationPlan?: any;
  };
}

export interface PersonnelData {
  role: string;
  preferredLanguage?: string;
  qualifications?: Array<{
    type: string;
    valid: boolean;
  }>;
}

export interface ComplianceResult {
  jurisdiction: string;
  overallCompliance: number;
  results: ComplianceCheck[];
  criticalNonCompliance: number;
  ytSpecific?: Record<string, any>;
  actionPlan: ActionPlan[];
}

export interface ActionPlan {
  standardId: string;
  action: BilingualText;
  responsible: string;
  deadline: string;
  resources: string[];
  verification: string;
}

// =================== YUKON AUTHORITY ===================

export const WSCC_YT_AUTHORITY = {
  name: 'Yukon Workers\' Safety and Compensation Commission',
  acronym: 'WSCC Yukon',
  jurisdiction: ['YT'] as const,
  website: 'https://www.wcb.yk.ca',
  contactInfo: {
    phone: '1-800-661-0443',
    preventionPhone: '867-667-5450',
    email: 'prevention@wcb.yk.ca',
    address: '401 Strickland Street, Whitehorse, YT Y1A 5N8'
  },
  regionalOffices: [
    { region: 'Whitehorse', phone: '867-667-5450', coverage: 'Southern Yukon, Government, Tourism' },
    { region: 'Dawson City', phone: '867-993-4444', coverage: 'Central Yukon, Mining, Historic Sites' },
    { region: 'Watson Lake', phone: '867-536-7301', coverage: 'Southeast Yukon, Transportation' },
    { region: 'Mayo', phone: '867-996-2221', coverage: 'Central Yukon, Mining Operations' },
    { region: 'Faro', phone: '867-994-2728', coverage: 'Mining Legacy Sites' }
  ],
  languages: ['en', 'fr'] as const,
  indigenousLanguages: [
    'gwich_in', 'han', 'northern_tutchone', 'southern_tutchone', 'champagne_aishihik', 'vuntut_gwitchin'
  ],
  specializedUnits: [
    'mining_safety_division',
    'tourism_safety_program',
    'indigenous_safety_initiative',
    'remote_operations_unit'
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties up to $300,000',
    'Prosecutions under territorial law'
  ]
};

// =================== YT SPECIFIC FEATURES ===================

export const YT_SPECIFIC_FEATURES = {
  miningOperations: [
    'placer_gold_mining_klondike_region',
    'hard_rock_mining_casino_coffee_eagle',
    'legacy_mining_sites_faro_anvil',
    'mineral_exploration_remote_areas',
    'underground_mining_limited_operations'
  ],
  tourismOperations: [
    'wilderness_lodge_remote_locations',
    'adventure_tourism_extreme_activities',
    'cruise_ship_operations_whitehorse',
    'heritage_tourism_dawson_city',
    'outdoor_recreation_facilities'
  ],
  extremeNorthernConditions: [
    'temperatures_below_minus_50_celsius',
    'continuous_permafrost_throughout_territory',
    'midnight_sun_continuous_daylight_summer',
    'polar_darkness_continuous_winter',
    'extreme_weather_variability'
  ],
  indigenousCommunities: [
    'first_nations_traditional_territories',
    'champagne_aishihik_first_nations',
    'vuntut_gwitchin_first_nation',
    'tr_ondek_hwech_in_first_nation',
    'little_salmon_carmacks_first_nation'
  ],
  remoteOperations: [
    'fly_in_access_only_locations',
    'seasonal_ice_road_access_winter',
    'helicopter_access_mining_exploration',
    'satellite_communication_dependency',
    'extended_isolation_periods'
  ],
  wildernessFactors: [
    'wildlife_encounters_bears_wolves',
    'wilderness_survival_requirements',
    'search_rescue_coordination',
    'emergency_evacuation_weather_dependent',
    'traditional_survival_skills_integration'
  ],
  regulatoryIntegration: [
    'yukon_environmental_socio_economic_assessment',
    'yukon_energy_corporation_coordination',
    'parks_canada_heritage_sites',
    'first_nations_land_claims_agreements'
  ]
};

// =================== YT REGULATION STANDARDS ===================

export const YT_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'YT_OHS_22_1': {
    id: 'YT_OHS_22_1',
    title: { 
      en: 'Confined Space Definition for Northern Operations', 
      fr: 'Définition d\'Espace Clos pour Opérations Nordiques' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    section: '22.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes northern mining, tourism, and remote operations'
    ],
    ytSpecific: {
      miningDefinitions: [
        'placer_mining_sluice_boxes_settling_ponds',
        'hard_rock_mining_underground_workings',
        'mineral_processing_mill_circuits',
        'legacy_mining_contaminated_areas'
      ],
      tourismDefinitions: [
        'wilderness_lodge_mechanical_rooms',
        'adventure_tourism_equipment_spaces',
        'cruise_ship_confined_areas',
        'heritage_building_preservation_spaces'
      ],
      remoteOperationsDefinitions: [
        'fuel_storage_tanks_remote_camps',
        'generator_buildings_power_systems',
        'communication_equipment_shelters',
        'emergency_shelter_structures'
      ],
      indigenousOperationsDefinitions: [
        'traditional_food_storage_areas',
        'community_infrastructure_confined_spaces',
        'cultural_facility_preservation_areas'
      ]
    },
    penalties: {
      individual: { min: 500, max: 50000 },
      corporation: { min: 2500, max: 300000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Yukon Occupational Health and Safety Regulations',
        citation: 'YT Reg. O.I.C. 2006/178',
        url: 'https://laws.yukon.ca/cms/images/LEGISLATION/SUBORDINATE/2006/2006-0178/2006-0178.pdf'
      }
    ]
  },

  'YT_OHS_22_3': {
    id: 'YT_OHS_22_3',
    title: { 
      en: 'Northern Hazard Assessment and Traditional Knowledge', 
      fr: 'Évaluation des Dangers Nordiques et Savoirs Traditionnels' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    section: '22.3',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Integration of traditional First Nations knowledge where applicable',
      'Assessment of extreme northern environmental conditions',
      'Evaluation of emergency evacuation challenges',
      'Consideration of seasonal accessibility limitations'
    ],
    ytSpecific: {
      extremeNorthernHazards: {
        extremeCold: 'hypothermia_frostbite_equipment_failure_minus_50c',
        permafrostFactors: 'ground_instability_seasonal_thaw_settlement',
        polarConditions: 'continuous_darkness_daylight_circadian_disruption',
        wildlifeEncounters: 'bear_wolf_encounter_safety_protocols',
        weatherExtremes: 'blizzard_ice_storm_chinook_wind_conditions'
      },
      miningHazards: {
        placerMining: 'hydraulic_equipment_water_pressure_drowning',
        hardRockMining: 'underground_ground_stability_permafrost_mining',
        legacyMining: 'contaminated_site_exposure_heavy_metals',
        mineralProcessing: 'processing_chemical_cyanide_flotation_reagents'
      },
      tourismHazards: {
        wildernessLodges: 'remote_location_emergency_response_limitations',
        adventureTourism: 'extreme_outdoor_activity_safety_requirements',
        heritageOperations: 'historic_building_structural_hazards',
        seasonalOperations: 'tourist_season_intensive_activity_periods'
      },
      indigenousConsiderations: {
        traditionalKnowledge: 'first_nations_traditional_safety_practices',
        culturalSafety: 'indigenous_cultural_safety_workplace_practices',
        landConnection: 'traditional_territory_environmental_knowledge',
        communityInvolvement: 'first_nations_community_safety_consultation'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'traditional_knowledge_holder', 'northern_conditions_specialist'],
      responsibilities: ['employer', 'competent_person', 'first_nations_representative', 'community_safety_committee']
    }
  },

  'YT_OHS_22_6': {
    id: 'YT_OHS_22_6',
    title: { 
      en: 'Atmospheric Testing for Extreme Northern Conditions', 
      fr: 'Tests Atmosphériques pour Conditions Nordiques Extrêmes' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    section: '22.6',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of northern-rated and cold-weather certified equipment',
      'Documentation with extreme temperature considerations'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    ytSpecific: {
      extremeNorthernTesting: {
        coldWeatherEquipment: 'equipment_operation_minus_50_celsius',
        permafrostFactors: 'ground_gas_emission_permafrost_thaw',
        batteryPerformance: 'extended_battery_backup_extreme_cold',
        calibrationChallenges: 'equipment_calibration_temperature_extremes'
      },
      miningTesting: {
        placerMining: ['methane_organic_decomposition', 'equipment_exhaust_hydraulic_operations'],
        hardRockMining: ['radon_uranium_deposits', 'underground_mine_gases', 'processing_chemical_vapors'],
        legacySites: ['heavy_metal_vapors', 'contaminated_soil_gas_emissions', 'groundwater_contamination_gases']
      },
      tourismTesting: {
        wildernessLodges: ['propane_heating_systems', 'generator_exhaust_carbon_monoxide', 'fuel_storage_vapors'],
        heritageBuildings: ['preservation_chemical_vapors', 'old_building_material_emissions', 'heating_system_gases']
      },
      seasonalTesting: {
        permafrostThaw: 'seasonal_ground_gas_emission_monitoring',
        equipmentWinterization: 'cold_weather_equipment_performance_testing',
        fuelSystemTesting: 'heating_fuel_arctic_grade_diesel_testing'
      }
    }
  },

  'YT_OHS_22_9': {
    id: 'YT_OHS_22_9',
    title: { 
      en: 'Entry Permit System for Remote Northern Operations', 
      fr: 'Système de Permis d\'Entrée pour Opérations Nordiques Isolées' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    section: '22.9',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of northern safety measures',
      'Weather and evacuation limitations',
      'Communication plan for remote locations'
    ],
    ytSpecific: {
      miningPermits: {
        placerOperations: 'placer_mining_seasonal_operation_coordination',
        hardRockMining: 'underground_mining_permafrost_access_coordination',
        explorationOperations: 'remote_exploration_helicopter_access_coordination',
        legacySiteWork: 'contaminated_site_remediation_safety_coordination'
      },
      tourismPermits: {
        wildernessOperations: 'remote_lodge_guest_safety_coordination',
        adventureActivities: 'extreme_outdoor_activity_risk_management',
        seasonalOperations: 'tourist_season_intensive_operation_coordination',
        heritageOperations: 'heritage_site_visitor_safety_coordination'
      },
      remoteOperationsPermits: {
        accessLimitations: 'fly_in_helicopter_access_weather_dependency',
        communicationProtocols: 'satellite_communication_backup_systems',
        emergencyEvacuation: 'weather_dependent_evacuation_planning',
        supplySystems: 'seasonal_supply_delivery_coordination'
      },
      indigenousCoordination: {
        firstNationsConsultation: 'traditional_territory_activity_coordination',
        culturalProtocols: 'indigenous_cultural_protocol_integration',
        communityNotification: 'first_nations_community_safety_coordination',
        traditionalKnowledge: 'traditional_knowledge_safety_integration'
      }
    }
  },

  'YT_OHS_22_12': {
    id: 'YT_OHS_22_12',
    title: { 
      en: 'Attendant and Communication for Wilderness Operations', 
      fr: 'Surveillant et Communication pour Opérations en Milieu Sauvage' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    section: '22.12',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Multi-redundant communication systems',
      'Monitoring of extreme weather conditions',
      'Emergency response coordination in wilderness conditions',
      'Understanding of traditional survival methods'
    ],
    ytSpecific: {
      communicationSystems: {
        satelliteSystems: 'satellite_phone_emergency_beacon_systems',
        radioSystems: 'vhf_uhf_radio_emergency_frequency_coordination',
        cellularLimitations: 'cellular_coverage_limitation_backup_systems'
      },
      wildernessAttendant: {
        survivalSkills: 'wilderness_survival_traditional_knowledge_training',
        wildlifeAwareness: 'bear_wolf_wildlife_encounter_safety_training',
        extremeWeather: 'extreme_cold_weather_survival_procedures',
        emergencyEvacuation: 'helicopter_evacuation_weather_dependency'
      },
      miningAttendant: {
        remoteOperations: 'isolated_mining_operation_emergency_procedures',
        equipmentOperation: 'mining_equipment_emergency_shutdown_procedures',
        environmentalHazards: 'contaminated_site_exposure_emergency_procedures'
      },
      tourismAttendant: {
        guestSafety: 'tourist_guest_safety_emergency_procedures',
        wildernessGuide: 'wilderness_guide_emergency_response_training',
        seasonalFactors: 'tourist_season_emergency_response_coordination'
      },
      indigenousIntegration: {
        culturalCompetency: 'indigenous_cultural_safety_understanding',
        traditionalKnowledge: 'traditional_survival_knowledge_integration',
        communityLiaison: 'first_nations_community_emergency_coordination'
      }
    }
  }
};

// =================== YT ATMOSPHERIC STANDARDS ===================

export const YT_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // YT Mining Industry Specific
  miningSpecific: {
    radon_uranium: { max: 0.3, unit: 'WL' },
    methane_placer: { max: 1000, unit: 'ppm' },
    cyanide_processing: { max: 4.7, unit: 'mg/m³' },
    heavy_metal_vapors: { max: 0.05, unit: 'mg/m³' },
    diesel_exhaust_mining: { max: 1.5, unit: 'mg/m³' }
  },
  
  // YT Tourism Industry Specific  
  tourismSpecific: {
    propane_heating: { max: 1000, unit: 'ppm' },
    generator_exhaust: { max: 25, unit: 'ppm' },
    fuel_vapors_remote: { max: 100, unit: 'mg/m³' },
    preservation_chemicals: 'per_material_safety_data_sheet'
  },
  
  // YT Extreme Northern Conditions
  extremeNorthernSpecific: {
    permafrost_gases: 'seasonal_monitoring_required',
    heating_system_exhaust: { max: 35, unit: 'ppm' },
    fuel_additives_arctic: 'per_arctic_fuel_specifications',
    equipment_refrigerants: { max: 1000, unit: 'ppm' }
  }
};

// =================== YT PERSONNEL QUALIFICATIONS ===================

export const YT_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'yt_competent_person',
    title: { 
      en: 'Competent Person - Northern Confined Space', 
      fr: 'Personne Compétente - Espace Clos Nordique' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with Yukon OHS Act and northern regulations',
      'Understanding of extreme northern environmental conditions',
      'Ability to integrate traditional First Nations knowledge',
      'Coordination with remote emergency response systems'
    ],
    ytSpecific: {
      extremeNorthernConditions: {
        coldWeatherOperations: 'minus_50_celsius_operations_safety_training',
        permafrostAwareness: 'permafrost_ground_conditions_safety_training',
        polarConditions: 'continuous_darkness_daylight_adaptation_training',
        wildlifeEncounters: 'bear_wolf_wildlife_safety_protocols'
      },
      miningCompetency: {
        placerMining: 'placer_mining_hydraulic_operations_safety',
        hardRockMining: 'northern_underground_mining_safety_training',
        legacySites: 'contaminated_site_safety_procedures',
        mineralProcessing: 'northern_mineral_processing_safety'
      },
      tourismCompetency: {
        wildernessOperations: 'wilderness_lodge_remote_operations_safety',
        adventureTourism: 'extreme_outdoor_activity_safety_coordination',
        heritageOperations: 'heritage_site_preservation_safety',
        guestSafety: 'tourist_guest_safety_risk_management'
      },
      indigenousCompetency: {
        culturalSafety: 'first_nations_cultural_safety_training',
        traditionalKnowledge: 'traditional_knowledge_safety_integration',
        communityEngagement: 'first_nations_community_consultation',
        landConnections: 'traditional_territory_environmental_awareness'
      },
      remoteOperations: {
        communicationSystems: 'satellite_communication_emergency_procedures',
        survivalSkills: 'northern_wilderness_survival_training',
        isolationFactors: 'extreme_isolation_psychological_preparation',
        emergencyCoordination: 'remote_emergency_response_coordination'
      }
    },
    certification: 'wscc_yukon_competent_person_plus_northern_specialization',
    validity: 'ongoing_with_annual_northern_conditions_refresher',
    mandatoryTraining: [
      'wscc_yukon_confined_space_competent_person',
      'extreme_northern_conditions_safety',
      'first_nations_cultural_safety',
      'remote_emergency_response_coordination'
    ]
  },

  attendant: {
    id: 'yt_attendant',
    title: { 
      en: 'Northern Wilderness Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Milieu Sauvage Nordique' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    requirements: [
      'Training in attendant duties for northern wilderness operations',
      'Knowledge of multi-redundant communication systems',
      'Understanding of extreme weather emergency procedures',
      'Familiarity with traditional survival methods',
      'Wilderness first aid and emergency response training'
    ],
    ytSpecific: {
      communicationSystems: {
        satelliteCommunication: 'satellite_phone_emergency_beacon_operation',
        radioSystems: 'wilderness_radio_communication_protocols',
        emergencyBeacons: 'personal_locator_beacon_activation_procedures'
      },
      wildernessOperations: {
        survivalSkills: 'northern_wilderness_survival_traditional_modern',
        wildlifeEncounters: 'bear_wolf_wildlife_deterrent_safety',
        extremeWeather: 'extreme_cold_blizzard_emergency_procedures',
        emergencyEvacuation: 'helicopter_evacuation_weather_limitations'
      },
      miningAttendant: {
        remoteOperations: 'isolated_mining_site_emergency_procedures',
        equipmentSafety: 'mining_equipment_emergency_shutdown',
        environmentalHazards: 'contaminated_site_exposure_procedures'
      },
      tourismAttendant: {
        guestCoordination: 'tourist_guest_emergency_evacuation_procedures',
        wildernessGuide: 'wilderness_guide_emergency_coordination',
        heritageOperations: 'heritage_site_emergency_procedures'
      },
      indigenousIntegration: {
        culturalCompetency: 'first_nations_cultural_safety_practices',
        traditionalKnowledge: 'traditional_survival_emergency_knowledge',
        communityLiaison: 'first_nations_community_emergency_coordination'
      }
    },
    certification: 'wscc_yukon_attendant_plus_wilderness_survival_training',
    validity: 'annual_recertification_northern_conditions'
  },

  atmospheric_tester: {
    id: 'yt_atmospheric_tester',
    title: { 
      en: 'Northern Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Nordique' 
    },
    authority: 'WSCC Yukon',
    jurisdiction: ['YT'],
    requirements: [
      'Training on extreme cold weather gas detection equipment',
      'Knowledge of northern atmospheric standards and variations',
      'Understanding of equipment limitations in extreme conditions',
      'Ability to perform testing in challenging northern conditions',
      'Knowledge of northern-specific atmospheric hazards'
    ],
    ytSpecific: {
      extremeConditionsTesting: {
        coldWeatherEquipment: 'gas_detector_operation_minus_50_celsius',
        permafrostFactors: 'permafrost_ground_gas_detection_procedures',
        batteryManagement: 'extreme_cold_battery_performance_management',
        equipmentMaintenance: 'northern_equipment_winterization_procedures'
      },
      miningTesting: {
        placerMining: 'placer_mining_atmospheric_hazard_detection',
        hardRockMining: 'underground_northern_mine_atmospheric_monitoring',
        legacySites: 'contaminated_site_atmospheric_testing',
        processingOperations: 'mineral_processing_chemical_detection'
      },
      tourismTesting: {
        wildernessLodges: 'remote_lodge_atmospheric_testing_procedures',
        heritageBuildings: 'heritage_building_atmospheric_assessment',
        seasonalOperations: 'seasonal_atmospheric_monitoring_tourism'
      },
      remoteOperationsTesting: {
        fuelSystems: 'remote_fuel_storage_vapor_detection',
        generatorSystems: 'remote_generator_exhaust_monitoring',
        emergencyTesting: 'emergency_atmospheric_testing_protocols'
      }
    },
    certification: 'equipment_manufacturer_plus_northern_conditions_training',
    validity: 'annual_recertification_extreme_conditions_updates'
  }
};

// =================== YT EMERGENCY SERVICES ===================

export const YT_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wsccYukon: '1-800-661-0443'
  },
  
  territorialServices: {
    emergencyMeasures: '867-667-5220',
    healthEmergency: '867-393-8700',
    searchRescue: '1-800-267-7270',
    environmentalEmergency: '867-667-7244',
    wildlifeConflict: '1-800-661-0525'
  },
  
  mining: {
    mineRescue: '867-667-5450',
    northernMines: {
      casino: '867-334-1238',
      coffee: '867-334-4614',
      eagle: '867-993-2464'
    },
    placerMining: '867-993-7200',
    yukonMinersAssociation: '867-668-4118'
  },
  
  tourism: {
    wildernessLodges: {
      lodgeAssociation: '867-668-3331',
      guideOutfitters: '867-668-4118'
    },
    adventureTourism: '867-667-5036',
    heritageOperations: {
      parksCanada: '867-667-3910',
      heritageYukon: '867-667-4704'
    },
    cruiseOperations: '867-668-9229'
  },
  
  indigenousCommunities: {
    champagneAishihik: '867-634-4200',
    vuntutGwitchin: '867-966-3261',
    trondekHwechin: '867-993-7100',
    littleSalmon: '867-863-5576',
    whiteRiverFirst: '867-862-7802',
    councilFirstNations: '867-393-9200'
  },
  
  remoteOperations: {
    aircraftServices: {
      airNorth: '867-668-2228',
      alkanAir: '867-668-6616',
      helicopterServices: '867-668-2643'
    },
    communicationServices: {
      northwestel: '1-888-423-2333',
      satelliteServices: '1-866-947-9669'
    },
    supplySystems: {
      fuelDelivery: '867-668-5081',
      emergencySupplies: '867-667-5220'
    }
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    wildernessRescue: 'yukon_search_rescue_association',
    mineRescue: 'yukon_territorial_mine_rescue',
    aircraftRescue: 'joint_rescue_coordination_centre_trenton',
    indigenousRescue: 'first_nations_traditional_knowledge_emergency'
  }
};

// =================== COMPLIANCE CHECKING ===================

export function checkYTCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: 'mining' | 'tourism' | 'remote_operations' | 'indigenous_operations' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(YT_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(YT_REGULATION_STANDARDS).forEach(standard => {
    const check = performYTStandardCheck(standard, permitData, atmosphericReadings, personnel, operationType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'YT',
    overallCompliance,
    results,
    criticalNonCompliance,
    ytSpecific: {
      operationType: operationType || 'general',
      extremeNorthernConditions: getExtremeNorthernConditions(),
      miningConsiderations: operationType === 'mining' ? getMiningConsiderations() : undefined,
      tourismConsiderations: operationType === 'tourism' ? getTourismConsiderations() : undefined,
      indigenousConsiderations: getIndigenousConsiderations(),
      wildernessFactors: getWildernessFactors(),
      emergencyServices: getYTEmergencyServices(operationType),
      seasonalLimitations: getSeasonalLimitations(),
      traditionalKnowledgeIntegration: getTraditionalKnowledgeIntegration()
    },
    actionPlan: generateYTActionPlan(results.filter(r => r.status === 'non_compliant'), operationType)
  };
}

function performYTStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'YT_OHS_22_1':
      return checkNorthernConfinedSpaceIdentification(permitData);
    case 'YT_OHS_22_3':
      return checkNorthernHazardAssessment(permitData, operationType);
    case 'YT_OHS_22_6':
      return checkNorthernAtmosphericTesting(atmosphericReadings, operationType);
    case 'YT_OHS_22_9':
      return checkNorthernEntryPermitSystem(permitData, operationType);
    case 'YT_OHS_22_12':
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

function getExtremeNorthernConditions() {
  return {
    temperatureRange: 'minus_50_to_plus_30_celsius',
    permafrostPresence: 'continuous_permafrost_throughout_territory',
    polarConditions: 'midnight_sun_polar_darkness_cycles',
    wildlifeFactors: 'bear_wolf_wildlife_encounter_considerations',
    accessibilityLimitations: 'fly_in_helicopter_seasonal_access_only'
  };
}

function getMiningConsiderations() {
  return {
    placerMining: 'klondike_placer_mining_hydraulic_operations',
    hardRockMining: 'underground_mining_permafrost_conditions',
    legacySites: 'faro_anvil_contaminated_site_remediation',
    remoteOperations: 'fly_in_mining_exploration_operations',
    environmentalProtection: 'northern_ecosystem_mining_impact_minimization'
  };
}

function getTourismConsiderations() {
  return {
    wildernessLodges: 'remote_wilderness_lodge_guest_safety',
    adventureTourism: 'extreme_outdoor_activity_risk_management',
    heritageOperations: 'dawson_city_heritage_site_preservation',
    seasonalOperations: 'summer_tourist_season_intensive_operations',
    culturalTourism: 'first_nations_cultural_tourism_integration'
  };
}

function getIndigenousConsiderations() {
  return {
    traditionalKnowledge: 'first_nations_traditional_knowledge_safety_integration',
    culturalSafety: 'indigenous_cultural_safety_workplace_practices',
    territorialRights: 'traditional_territory_land_claims_agreement_respect',
    communityEngagement: 'first_nations_community_consultation_participation',
    languageAccommodation: 'indigenous_language_safety_communication'
  };
}

function getWildernessFactors() {
  return {
    wildlifeEncounters: 'bear_wolf_wildlife_safety_protocols',
    survivalRequirements: 'northern_wilderness_survival_skills',
    emergencyEvacuation: 'helicopter_weather_dependent_evacuation',
    isolationFactors: 'extreme_isolation_psychological_preparation',
    traditionalSurvival: 'indigenous_traditional_survival_knowledge'
  };
}

function getYTEmergencyServices(operationType?: string) {
  const base = YT_EMERGENCY_SERVICES.general;
  
  if (operationType === 'mining') {
    return { ...base, ...YT_EMERGENCY_SERVICES.mining };
  }
  
  if (operationType === 'tourism') {
    return { ...base, ...YT_EMERGENCY_SERVICES.tourism };
  }
  
  if (operationType === 'indigenous_operations') {
    return { ...base, ...YT_EMERGENCY_SERVICES.indigenousCommunities };
  }
  
  if (operationType === 'remote_operations') {
    return { ...base, ...YT_EMERGENCY_SERVICES.remoteOperations };
  }
  
  return { ...base, ...YT_EMERGENCY_SERVICES.territorialServices };
}

function getSeasonalLimitations() {
  return {
    winter: 'extreme_cold_polar_darkness_limited_access',
    spring: 'breakup_unstable_ice_road_conditions',
    summer: 'midnight_sun_intensive_tourism_mining_season',
    fall: 'freeze_up_access_preparation_wildlife_activity'
  };
}

function getTraditionalKnowledgeIntegration() {
  return {
    firstNationsKnowledge: 'traditional_environmental_safety_knowledge',
    elderWisdom: 'elder_consultation_safety_protocols',
    culturalPractices: 'indigenous_cultural_safety_workplace_integration',
    landConnections: 'traditional_territory_environmental_awareness',
    communityParticipation: 'first_nations_community_safety_involvement'
  };
}

function generateYTActionPlan(nonCompliantResults: ComplianceCheck[], operationType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getYTCorrectiveAction(result.requirementId, operationType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getYTRequiredResources(result.requirementId, operationType),
    verification: 'wscc_yukon_inspector_verification'
  }));
}

function getYTCorrectiveAction(requirementId: string, operationType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    northern_confined_space_identification: {
      en: `Identify and classify all confined spaces in ${operationType || 'northern'} operations with extreme conditions considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${operationType || 'nordiques'} avec considérations conditions extrêmes`
    },
    northern_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including extreme northern conditions and traditional knowledge for ${operationType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant conditions nordiques extrêmes et savoirs traditionnels pour opérations ${operationType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with extreme cold weather equipment and ${operationType || 'general'} operation standards`,
      fr: `Effectuer tests atmosphériques avec équipement froid extrême et standards opérations ${operationType || 'générales'}`
    },
    entry_permit: {
      en: `Implement entry permit system with northern wilderness conditions and ${operationType || 'general'} operation requirements`,
      fr: `Implémenter système permis d'entrée avec conditions milieu sauvage nordique et exigences opérations ${operationType || 'générales'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with northern wilderness training and ${operationType || 'general'} operation experience`,
      fr: `Assigner surveillant qualifié avec formation milieu sauvage nordique et expérience opérations ${operationType || 'générales'}`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WSCC Yukon requirements for northern operations',
    fr: 'Traiter non-conformité identifiée selon exigences WSCC Yukon pour opérations nordiques'
  };
}

function getYTRequiredResources(requirementId: string, operationType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    northern_confined_space_identification: ['competent_person', 'northern_conditions_assessment'],
    northern_hazard_assessment: ['competent_person', 'traditional_knowledge_holder', 'northern_specialist'],
    atmospheric_testing: ['extreme_cold_detectors', 'northern_rated_equipment'],
    entry_permit: ['permit_forms', 'satellite_communication', 'weather_monitoring'],
    attendant_present: ['northern_trained_attendant', 'wilderness_survival_equipment', 'multi_redundant_communication']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add operation-specific resources
  if (operationType === 'mining') {
    resources.push('mine_rescue_coordination', 'contaminated_site_equipment');
  } else if (operationType === 'tourism') {
    resources.push('wilderness_guide_coordination', 'guest_evacuation_procedures');
  } else if (operationType === 'indigenous_operations') {
    resources.push('first_nations_consultation', 'traditional_knowledge_integration');
  } else if (operationType === 'remote_operations') {
    resources.push('helicopter_evacuation_procedures', 'extreme_isolation_support');
  }
  
  // Add northern-specific resources
  resources.push('extreme_weather_equipment', 'wildlife_deterrent_systems', 'traditional_survival_knowledge');
  
  return resources;
}

// Helper functions for specific standard checks
function checkNorthernConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasNorthernConsiderations = permitData.spaceDetails?.environmentalFactors?.includes('extreme_northern_conditions');
  const hasPermafrostAssessment = permitData.spaceDetails?.environmentalFactors?.includes('permafrost');
  
  return {
    standardId: 'YT_OHS_22_1',
    requirementId: 'northern_confined_space_identification',
    status: hasIdentification && hasNorthernConsiderations && hasPermafrostAssessment ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasNorthernConsiderations ? [] : ['Missing extreme northern conditions assessment']),
      ...(hasPermafrostAssessment ? [] : ['Missing permafrost considerations'])
    ],
    priority: 'critical'
  };
}

function checkNorthernHazardAssessment(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasNorthernHazards = permitData.hazardAssessment?.environmentalHazards?.some(h => 
    ['extreme_cold', 'permafrost', 'wildlife', 'isolation', 'polar_conditions'].includes(h)
  );
  const hasTraditionalKnowledge = permitData.hazardAssessment?.traditionalKnowledge !== undefined;
  const hasOperationSpecificAssessment = operationType ? 
    permitData.hazardAssessment?.operationSpecific?.[operationType] !== undefined : true;
  
  return {
    standardId: 'YT_OHS_22_3',
    requirementId: 'northern_hazard_assessment',
    status: hasAssessment && hasNorthernHazards && hasTraditionalKnowledge && hasOperationSpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasNorthernHazards ? [] : ['Missing extreme northern hazard assessment']),
      ...(hasTraditionalKnowledge ? [] : ['Missing traditional knowledge integration']),
      ...(hasOperationSpecificAssessment ? [] : [`Missing ${operationType} operation-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkNorthernAtmosphericTesting(atmosphericReadings: AtmosphericReading[], operationType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'YT_OHS_22_6',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getYTStandardsForOperation(operationType);
  const hasNorthernRatedEquipment = atmosphericReadings.some(r => r.equipmentRating?.includes('northern_rated'));
  const hasExtremeTemperatureCompensation = atmosphericReadings.some(r => r.temperatureCompensation !== undefined);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isYTReadingCompliant(reading, standards);
  });

  return {
    standardId: 'YT_OHS_22_6',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasNorthernRatedEquipment && hasExtremeTemperatureCompensation ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for northern ${operationType || 'general'} operations`
      ),
      ...(hasNorthernRatedEquipment ? [] : ['Missing northern-rated equipment certification']),
      ...(hasExtremeTemperatureCompensation ? [] : ['Missing extreme temperature compensation'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkNorthernEntryPermitSystem(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWeatherLimitations = permitData.entryPermit?.weatherLimitations !== undefined;
  const hasEmergencyEvacuation = permitData.entryPermit?.emergencyEvacuation?.includes('northern_procedures');
  const hasCommunicationPlan = permitData.entryPermit?.communicationPlan !== undefined;
  
  return {
    standardId: 'YT_OHS_22_9',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWeatherLimitations && hasEmergencyEvacuation && hasCommunicationPlan ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasWeatherLimitations ? [] : ['Missing extreme weather limitations']),
      ...(hasEmergencyEvacuation ? [] : ['Missing northern emergency evacuation procedures']),
      ...(hasCommunicationPlan ? [] : ['Missing remote communication plan'])
    ],
    priority: 'critical'
  };
}

function checkNorthernAttendantRequirements(personnel: PersonnelData[], operationType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasNorthernTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasNorthernSpecificTraining(p, operationType));
  const hasWildernessSurvival = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'wilderness_survival'));
  const hasMultiRedundantComm = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'multi_redundant_communication'));
  
  return {
    standardId: 'YT_OHS_22_12',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasNorthernTraining && hasWildernessSurvival && hasMultiRedundantComm ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasNorthernTraining ? [] : [`Attendant lacks northern ${operationType} training`]),
      ...(hasWildernessSurvival ? [] : ['Missing wilderness survival training']),
      ...(hasMultiRedundantComm ? [] : ['Missing multi-redundant communication capability'])
    ],
    priority: 'critical'
  };
}

function getYTStandardsForOperation(operationType?: string) {
  const baseStandards = YT_ATMOSPHERIC_STANDARDS;
  
  if (operationType === 'mining') {
    return { ...baseStandards, ...baseStandards.miningSpecific };
  }
  
  if (operationType === 'tourism') {
    return { ...baseStandards, ...baseStandards.tourismSpecific };
  }
  
  return { ...baseStandards, ...baseStandards.extremeNorthernSpecific };
}

function isYTReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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
    mining: ['northern_mining_safety', 'contaminated_site_procedures'],
    tourism: ['wilderness_guide_safety', 'guest_evacuation_procedures'],
    indigenous_operations: ['first_nations_cultural_safety', 'traditional_knowledge_integration'],
    remote_operations: ['extreme_isolation_procedures', 'helicopter_evacuation_coordination']
  };
  
  const northernBaseline = ['extreme_cold_operations', 'wilderness_survival', 'wildlife_encounter_safety'];
  const operationSpecific = operationType ? requiredTraining[operationType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...northernBaseline, ...operationSpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WSCC_YT_AUTHORITY,
  YT_SPECIFIC_FEATURES,
  YT_REGULATION_STANDARDS,
  YT_ATMOSPHERIC_STANDARDS,
  YT_PERSONNEL_QUALIFICATIONS,
  YT_EMERGENCY_SERVICES,
  checkYTCompliance
};

export type YTOperationType = 'mining' | 'tourism' | 'remote_operations' | 'indigenous_operations' | 'general';
export type YTRegulationStandardId = keyof typeof YT_REGULATION_STANDARDS;
export type YTPersonnelQualificationId = keyof typeof YT_PERSONNEL_QUALIFICATIONS;
