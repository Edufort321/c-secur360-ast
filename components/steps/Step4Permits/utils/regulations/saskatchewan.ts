/**
 * Saskatchewan Workers' Compensation Board (WCB Saskatchewan)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: The Saskatchewan Employment Act and Occupational Health and Safety Regulations
 * Part VI: Confined Spaces (Sections 6-18 to 6-35)
 * 
 * Provincial Focus: Agriculture, potash mining, oil & gas, uranium mining
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
  skSpecific?: Record<string, any>;
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
  skSpecific?: Record<string, any>;
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
  weatherCompensation?: any;
}

export interface LegalPermit {
  id: string;
  spaceDetails?: {
    identification?: string;
    regulatoryClassification?: string[];
  };
  hazardAssessment?: {
    climaticFactors?: string[];
    industrySpecific?: Record<string, any>;
  };
  entryPermit?: {
    weatherConsiderations?: any;
    operationalCoordination?: any;
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
  skSpecific?: Record<string, any>;
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

// =================== SASKATCHEWAN AUTHORITY ===================

export const WCB_SK_AUTHORITY = {
  name: 'Saskatchewan Workers\' Compensation Board',
  acronym: 'WCB Saskatchewan',
  jurisdiction: ['SK'] as const,
  website: 'https://www.wcbsask.com',
  contactInfo: {
    phone: '1-800-667-7590',
    preventionPhone: '306-787-4370',
    email: 'prevention@wcbsask.com',
    address: '200 - 1881 Scarth Street, Regina, SK S4P 4L1'
  },
  regionalOffices: [
    { region: 'Regina', phone: '306-787-4370', coverage: 'Southern SK, Government, Agriculture' },
    { region: 'Saskatoon', phone: '306-933-3060', coverage: 'Central SK, Potash Mining, Manufacturing' },
    { region: 'Prince Albert', phone: '306-922-4200', coverage: 'Northern SK, Forestry, Remote Operations' },
    { region: 'Estevan', phone: '306-637-4665', coverage: 'Southeast SK, Oil & Gas, Coal' },
    { region: 'North Battleford', phone: '306-446-7492', coverage: 'Northwest SK, Agriculture' },
    { region: 'Yorkton', phone: '306-786-1421', coverage: 'East SK, Agriculture, Food Processing' }
  ],
  languages: ['en', 'fr'] as const,
  specializedUnits: [
    'potash_mining_safety_division',
    'oil_gas_safety_unit',
    'agriculture_safety_program',
    'uranium_mining_safety_unit'
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties up to $500,000',
    'Prosecutions under provincial law'
  ]
};

// =================== SK SPECIFIC FEATURES ===================

export const SK_SPECIFIC_FEATURES = {
  potashMiningOperations: [
    'nutrien_potash_mines_saskatoon_area',
    'mosaic_potash_mines_esterhazy_belle_plaine',
    'potash_solution_mining_operations',
    'underground_potash_mining_shafts',
    'potash_processing_refining_facilities'
  ],
  agricultureOperations: [
    'grain_storage_elevators_throughout_province',
    'livestock_operations_cattle_hogs',
    'canola_processing_facilities',
    'pulse_crop_processing_lentils_peas',
    'farm_fuel_storage_systems'
  ],
  oilGasOperations: [
    'heavy_oil_extraction_lloydminster',
    'oil_sands_mining_operations',
    'natural_gas_processing_plants',
    'pipeline_compression_stations',
    'oilfield_tank_battery_operations'
  ],
  uraniumMiningOperations: [
    'cameco_uranium_mines_northern_sk',
    'mcarthur_river_cigar_lake_mines',
    'uranium_milling_processing_facilities',
    'underground_uranium_mining_operations',
    'radiation_protection_requirements'
  ],
  climaticChallenges: [
    'extreme_cold_winter_operations',
    'prairie_wind_exposure_factors',
    'seasonal_access_remote_locations',
    'ice_road_winter_transportation',
    'blizzard_whiteout_conditions'
  ],
  remoteOperations: [
    'northern_mining_fly_in_operations',
    'agricultural_remote_grain_facilities',
    'oil_gas_remote_well_sites',
    'limited_emergency_services_access',
    'satellite_communication_dependency'
  ],
  regulatoryIntegration: [
    'canadian_nuclear_safety_commission',
    'saskatchewan_energy_regulator',
    'environment_climate_change_saskatchewan',
    'saskpower_coordination'
  ]
};

// =================== SK REGULATION STANDARDS ===================

export const SK_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'SK_OHS_6_18': {
    id: 'SK_OHS_6_18',
    title: { 
      en: 'Confined Space Definition for Prairie Operations', 
      fr: 'Définition d\'Espace Clos pour Opérations des Prairies' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    section: '6-18',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes potash mines, grain facilities, oil & gas, and uranium operations'
    ],
    skSpecific: {
      potashMiningDefinitions: [
        'potash_mine_shafts_underground_workings',
        'potash_solution_mining_caverns',
        'potash_processing_vessels_digesters',
        'potash_storage_silos_load_out_facilities'
      ],
      agricultureDefinitions: [
        'grain_elevator_storage_bins',
        'livestock_barn_manure_storage_pits',
        'canola_processing_extraction_vessels',
        'farm_fuel_storage_tank_systems'
      ],
      oilGasDefinitions: [
        'oil_storage_tank_batteries',
        'natural_gas_processing_vessels',
        'pipeline_pump_stations_compressor_buildings',
        'heavy_oil_extraction_underground_operations'
      ],
      uraniumMiningDefinitions: [
        'uranium_mine_underground_workings',
        'uranium_milling_processing_circuits',
        'yellowcake_production_vessels',
        'radioactive_waste_storage_areas'
      ]
    },
    penalties: {
      individual: { min: 500, max: 50000 },
      corporation: { min: 5000, max: 500000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Saskatchewan Occupational Health and Safety Regulations',
        citation: 'RRS c O-1.1 Reg 1',
        url: 'https://www.qp.gov.sk.ca/documents/english/Regulations/Regulations/O1-1R1.pdf'
      }
    ]
  },

  'SK_OHS_6_20': {
    id: 'SK_OHS_6_20',
    title: { 
      en: 'Hazard Assessment for Saskatchewan Industries', 
      fr: 'Évaluation des Dangers pour Industries Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    section: '6-20',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent worker',
      'Identification of all potential hazards',
      'Assessment of atmospheric, physical, and radiation hazards',
      'Evaluation of access routes and emergency response',
      'Consideration of Saskatchewan climatic and geographic factors'
    ],
    skSpecific: {
      potashMiningHazards: {
        undergroundHazards: 'ground_stability_potash_mining_water_influx',
        solutionMining: 'brine_solution_high_pressure_underground_caverns',
        processingHazards: 'potash_dust_crystallization_equipment_hazards',
        transportationHazards: 'conveyor_systems_railcar_loading_dust_control'
      },
      agricultureHazards: {
        grainStorage: 'grain_dust_explosion_engulfment_fumigant_exposure',
        livestockOperations: 'manure_gas_animal_confinement_zoonotic_diseases',
        canolaProcessing: 'hexane_extraction_oil_processing_fire_explosion',
        seasonalHazards: 'harvest_season_intensive_operations_extended_hours'
      },
      oilGasHazards: {
        heavyOilOperations: 'hydrogen_sulfide_sour_gas_steam_injection',
        naturalGasProcessing: 'methane_propane_butane_processing_chemicals',
        pipelineOperations: 'high_pressure_natural_gas_compressor_operations',
        remoteOperations: 'isolated_locations_emergency_response_limitations'
      },
      uraniumMiningHazards: {
        radiationHazards: 'ionizing_radiation_radon_decay_products',
        chemicalHazards: 'uranium_processing_acids_yellowcake_production',
        undergroundHazards: 'uranium_mine_ground_stability_radiation_exposure',
        wasteManagement: 'radioactive_tailings_long_term_containment'
      },
      climaticHazards: {
        winterOperations: 'extreme_cold_minus_40_celsius_wind_chill',
        springConditions: 'flooding_ice_jams_equipment_access',
        summerConditions: 'severe_thunderstorms_tornadoes_hail',
        fallConditions: 'early_freeze_equipment_winterization'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_worker', 'industry_specialist', 'climatic_assessment'],
      responsibilities: ['employer', 'competent_worker', 'occupational_health_committee']
    }
  },

  'SK_OHS_6_23': {
    id: 'SK_OHS_6_23',
    title: { 
      en: 'Atmospheric Testing for Saskatchewan Industries', 
      fr: 'Tests Atmosphériques pour Industries Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    section: '6-23',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified worker',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of properly calibrated and maintained equipment',
      'Documentation considering temperature and environmental conditions'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    skSpecific: {
      potashMiningTesting: {
        undergroundGases: ['methane_natural_seepage', 'hydrogen_sulfide_geological', 'carbon_dioxide_equipment'],
        solutionMining: ['brine_vapor_sodium_chloride', 'processing_chemical_vapors', 'equipment_exhaust_gases'],
        potashDust: 'respirable_potash_dust_atmospheric_monitoring'
      },
      agricultureTesting: {
        grainStorage: ['carbon_dioxide_grain_respiration', 'phosphine_fumigation', 'grain_dust_suspension'],
        livestockFacilities: ['methane_manure_decomposition', 'ammonia_animal_waste', 'hydrogen_sulfide_anaerobic'],
        canolaProcessing: ['hexane_extraction_vapors', 'oil_processing_steam', 'cleaning_solvent_vapors'],
        farmFuelSystems: ['gasoline_diesel_vapors', 'propane_heating_systems', 'natural_gas_equipment']
      },
      oilGasTesting: {
        heavyOilOperations: ['hydrogen_sulfide_sour_gas', 'methane_natural_gas', 'steam_injection_gases'],
        processingPlants: ['natural_gas_components', 'processing_chemical_vapors', 'compressor_exhaust'],
        tankBatteries: ['crude_oil_vapors', 'produced_water_gases', 'flare_stack_emissions'],
        pipelineOperations: ['natural_gas_leakage', 'compressor_station_emissions', 'maintenance_purging_gases']
      },
      uraniumMiningTesting: {
        radiationMonitoring: 'continuous_radon_decay_product_monitoring',
        chemicalTesting: ['uranium_dust_airborne', 'acid_processing_vapors', 'yellowcake_dust'],
        ventilationAssessment: 'underground_mine_ventilation_effectiveness'
      }
    }
  },

  'SK_OHS_6_26': {
    id: 'SK_OHS_6_26',
    title: { 
      en: 'Entry Procedures for Saskatchewan Operations', 
      fr: 'Procédures d\'Entrée pour Opérations Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    section: '6-26',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry procedure for each confined space',
      'Entry permit issued for each entry',
      'Authorization by competent worker',
      'Specification of safety equipment and procedures',
      'Coordination with seasonal operations and weather conditions'
    ],
    skSpecific: {
      potashMiningPermits: {
        undergroundCoordination: 'mine_shaft_hoist_operations_coordination',
        solutionMining: 'brine_injection_extraction_cycle_coordination',
        processingCoordination: 'potash_mill_continuous_operations',
        shiftCoordination: 'underground_shift_change_communication'
      },
      agriculturePermits: {
        harvestSeason: 'grain_harvest_intensive_operations_coordination',
        livestockOperations: 'animal_feeding_milking_schedule_coordination',
        seasonalWorkers: 'temporary_foreign_worker_training_language',
        equipmentSharing: 'cooperative_equipment_multiple_farm_coordination'
      },
      oilGasPermits: {
        wellSiteOperations: 'drilling_completion_production_coordination',
        pipelineOperations: 'gas_flow_pressure_maintenance_coordination',
        facilityMaintenance: 'plant_shutdown_turnaround_coordination',
        emergencyResponse: 'remote_location_emergency_access_planning'
      },
      uraniumMiningPermits: {
        radiationWorkPermit: 'cnsc_radiation_work_permit_integration',
        undergroundOperations: 'uranium_mine_ventilation_coordination',
        processingOperations: 'uranium_mill_yellowcake_production_coordination',
        wasteManagement: 'radioactive_waste_handling_coordination'
      },
      climaticConsiderations: {
        winterOperations: 'extreme_cold_weather_equipment_procedures',
        emergencyAccess: 'weather_dependent_emergency_response_planning',
        remoteLocation: 'seasonal_access_road_ice_road_dependency'
      }
    }
  },

  'SK_OHS_6_29': {
    id: 'SK_OHS_6_29',
    title: { 
      en: 'Attendant Requirements for Prairie Operations', 
      fr: 'Exigences de Surveillant pour Opérations des Prairies' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    section: '6-29',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Reliable communication systems for remote operations',
      'Monitoring of weather and operational conditions',
      'Emergency response coordination capability',
      'Understanding of Saskatchewan-specific emergency procedures'
    ],
    skSpecific: {
      communicationSystems: {
        cellularCoverage: 'cellular_tower_coverage_rural_saskatchewan',
        radioSystems: 'two_way_radio_emergency_frequency_coordination',
        satelliteCommunication: 'satellite_system_remote_location_backup'
      },
      potashMiningAttendant: {
        undergroundCommunication: 'mine_communication_system_integration',
        hoistOperations: 'mine_shaft_hoist_safety_coordination',
        emergencyResponse: 'mine_rescue_team_potash_mining_coordination'
      },
      agricultureAttendant: {
        seasonalOperations: 'harvest_season_extended_hours_coordination',
        cooperativeOperations: 'multi_farm_equipment_sharing_coordination',
        ruralEmergency: 'volunteer_fire_department_rural_response'
      },
      oilGasAttendant: {
        remoteOperations: 'isolated_wellsite_emergency_coordination',
        h2sAwareness: 'hydrogen_sulfide_detection_emergency_procedures',
        pipelineAwareness: 'pipeline_emergency_response_coordination'
      },
      uraniumMiningAttendant: {
        radiationMonitoring: 'personal_radiation_monitoring_equipment',
        emergencyResponse: 'nuclear_emergency_response_coordination',
        medicalEmergency: 'radiation_exposure_medical_response'
      }
    }
  }
};

// =================== SK ATMOSPHERIC STANDARDS ===================

export const SK_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // SK Potash Mining Industry Specific
  potashMiningSpecific: {
    potash_dust: { max: 1, unit: 'mg/m³' },
    brine_vapors: { max: 5, unit: 'mg/m³' },
    methane_underground: { max: 1.0, unit: '%' },
    diesel_exhaust: { max: 1.5, unit: 'mg/m³' }
  },
  
  // SK Agriculture Industry Specific  
  agricultureSpecific: {
    grain_dust: { max: 4, unit: 'mg/m³' },
    phosphine_fumigation: { max: 0.3, unit: 'ppm' },
    hexane_canola: { max: 176, unit: 'mg/m³' },
    ammonia_livestock: { max: 25, unit: 'ppm' },
    methane_manure: { max: 1000, unit: 'ppm' }
  },
  
  // SK Oil & Gas Industry Specific
  oilGasSpecific: {
    hydrogen_sulfide_sour: { max: 10, unit: 'ppm' },
    methane_natural_gas: { max: 1000, unit: 'ppm' },
    benzene_crude_oil: { max: 0.5, unit: 'ppm' },
    propane_processing: { max: 1000, unit: 'ppm' },
    mercaptans_odorant: { max: 0.5, unit: 'ppm' }
  },
  
  // SK Uranium Mining Industry Specific
  uraniumMiningSpecific: {
    radon_decay_products: { max: 0.33, unit: 'WL' },
    uranium_dust: { max: 0.2, unit: 'mg/m³' },
    yellowcake_dust: { max: 0.05, unit: 'mg/m³' },
    acid_vapors: { max: 1, unit: 'mg/m³' }
  }
};

// =================== SK PERSONNEL QUALIFICATIONS ===================

export const SK_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_worker: {
    id: 'sk_competent_worker',
    title: { 
      en: 'Competent Worker - Saskatchewan Confined Space', 
      fr: 'Travailleur Compétent - Espace Clos Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with Saskatchewan Employment Act and OHS Regulations',
      'Understanding of Saskatchewan industry-specific hazards',
      'Authority to implement safety measures and stop work',
      'Knowledge of Saskatchewan emergency response systems'
    ],
    skSpecific: {
      potashMiningCompetency: {
        certifications: ['saskatchewan_potash_mining_safety', 'underground_mining_competency'],
        experience: 'nutrien_mosaic_potash_operations_experience',
        emergencyResponse: 'potash_mine_rescue_team_coordination'
      },
      agricultureCompetency: {
        grainHandling: 'grain_elevator_storage_dust_explosion_prevention',
        livestockOperations: 'livestock_confinement_manure_gas_safety',
        canolaProcessing: 'canola_oil_extraction_hexane_safety',
        seasonalOperations: 'harvest_season_safety_intensive_operations'
      },
      oilGasCompetency: {
        certifications: ['h2s_alive_certification', 'well_control_certification'],
        experience: 'heavy_oil_natural_gas_operations_experience',
        emergencyResponse: 'oil_gas_emergency_response_coordination'
      },
      uraniumMiningCompetency: {
        certifications: ['cnsc_nuclear_security_clearance', 'radiation_safety_training'],
        experience: 'cameco_uranium_mining_operations_experience',
        emergencyResponse: 'nuclear_emergency_response_coordination'
      },
      prairieConditions: {
        climaticAwareness: 'extreme_weather_operations_safety',
        remoteOperations: 'isolated_location_emergency_procedures',
        communicationSystems: 'rural_communication_backup_systems'
      }
    },
    certification: 'wcb_saskatchewan_competent_worker_training',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'wcb_saskatchewan_confined_space_competent_worker',
      'industry_specific_hazard_recognition',
      'saskatchewan_emergency_response_coordination',
      'occupational_health_committee_integration'
    ]
  },

  attendant: {
    id: 'sk_attendant',
    title: { 
      en: 'Saskatchewan Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    requirements: [
      'Training in attendant duties for Saskatchewan operations',
      'Knowledge of communication procedures for rural/remote areas',
      'Understanding of industry-specific emergency procedures',
      'Familiarity with atmospheric monitoring equipment',
      'Standard first aid and emergency response training'
    ],
    skSpecific: {
      communicationSystems: {
        ruralCommunication: 'cellular_radio_satellite_communication_systems',
        emergencyFrequencies: 'emergency_service_radio_frequency_coordination',
        weatherDependency: 'weather_resistant_communication_equipment'
      },
      potashMiningAttendant: {
        certifications: ['potash_mining_first_aid', 'underground_emergency_procedures'],
        mineOperations: 'potash_mine_shaft_hoist_safety_procedures',
        emergencyResponse: 'potash_mine_rescue_coordination'
      },
      agricultureAttendant: {
        seasonalOperations: 'harvest_season_extended_hours_safety',
        grainHandling: 'grain_dust_explosion_emergency_procedures',
        livestockSafety: 'livestock_confinement_emergency_procedures'
      },
      oilGasAttendant: {
        certifications: ['h2s_alive_certification', 'well_site_safety'],
        remoteOperations: 'isolated_well_site_emergency_procedures',
        h2sResponse: 'hydrogen_sulfide_emergency_response_procedures'
      },
      uraniumMiningAttendant: {
        certifications: ['radiation_safety_awareness', 'nuclear_emergency_procedures'],
        radiationMonitoring: 'personal_radiation_detection_equipment',
        emergencyResponse: 'nuclear_facility_emergency_coordination'
      }
    },
    certification: 'wcb_saskatchewan_attendant_training_plus_industry_specific',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'sk_atmospheric_tester',
    title: { 
      en: 'Saskatchewan Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Saskatchewan' 
    },
    authority: 'WCB Saskatchewan',
    jurisdiction: ['SK'],
    requirements: [
      'Training on gas detection equipment operation',
      'Knowledge of Saskatchewan atmospheric standards and industry variations',
      'Understanding of equipment operation in extreme weather',
      'Ability to interpret test results for different industries',
      'Knowledge of Saskatchewan-specific atmospheric hazards'
    ],
    skSpecific: {
      equipmentOperations: {
        extremeWeather: 'gas_detector_operation_minus_40_celsius',
        windFactors: 'prairie_wind_atmospheric_sampling_techniques',
        temperatureCompensation: 'extreme_temperature_equipment_calibration'
      },
      potashMiningTesting: {
        undergroundTesting: 'potash_mine_atmospheric_monitoring_procedures',
        dustMonitoring: 'respirable_potash_dust_measurement',
        ventilationAssessment: 'potash_mine_ventilation_effectiveness'
      },
      agricultureTesting: {
        grainTesting: 'grain_storage_atmosphere_fumigant_detection',
        livestockTesting: 'livestock_facility_manure_gas_monitoring',
        canolaProcessing: 'hexane_vapor_detection_oil_extraction'
      },
      oilGasTesting: {
        wellSiteTesting: 'hydrogen_sulfide_natural_gas_detection',
        processingPlantTesting: 'natural_gas_processing_chemical_monitoring',
        pipelineTesting: 'pipeline_purging_atmospheric_monitoring'
      },
      uraniumMiningTesting: {
        radiationMonitoring: 'radon_decay_product_atmospheric_monitoring',
        chemicalTesting: 'uranium_dust_yellowcake_detection',
        ventilationEffectiveness: 'uranium_mine_ventilation_assessment'
      }
    },
    certification: 'equipment_manufacturer_plus_saskatchewan_industry_training',
    validity: 'annual_recertification_with_equipment_updates'
  }
};

// =================== SK EMERGENCY SERVICES ===================

export const SK_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wcbSaskatchewan: '1-800-667-7590'
  },
  
  potashMining: {
    potashMineRescue: '306-933-8118',
    nutrienEmergency: '306-933-3030',
    mosaicEmergency: '306-783-8200',
    miningAssociation: '306-757-9505'
  },
  
  agriculture: {
    agriculturalSafety: '306-933-7484',
    grainElevatorEmergency: '306-525-4490',
    livestockEmergency: '306-787-5420',
    cooperativeEmergency: '306-244-3311'
  },
  
  oilGas: {
    saskEnergyEmergency: '306-787-2584',
    oilGasAssociation: '306-525-0171',
    pipelineEmergency: '1-800-667-8293',
    wellSiteEmergency: '306-787-2584'
  },
  
  uraniumMining: {
    camecoEmergency: '306-956-6200',
    cnscEmergency: '613-995-5894',
    nuclearEmergency: '306-787-8130',
    radiationEmergency: '306-787-6334'
  },
  
  regionalEmergency: {
    reginaEmergency: '306-777-7000',
    saskatoonEmergency: '306-975-2476',
    princeAlbertEmergency: '306-953-4222',
    estevanEmergency: '306-637-4044',
    yorktonEmergency: '306-786-1757',
    northBattlefordEmergency: '306-445-1710'
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    potashMineRescue: 'saskatchewan_potash_mine_rescue_association',
    oilGasRescue: 'petroleum_industry_emergency_response',
    nuclearRescue: 'nuclear_emergency_response_team_canada',
    agriculturalRescue: 'volunteer_fire_department_farm_rescue'
  }
};

// =================== COMPLIANCE CHECKING ===================

export function checkSKCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'potash_mining' | 'agriculture' | 'oil_gas' | 'uranium_mining' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(SK_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(SK_REGULATION_STANDARDS).forEach(standard => {
    const check = performSKStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'SK',
    overallCompliance,
    results,
    criticalNonCompliance,
    skSpecific: {
      industryType: industryType || 'general',
      potashMiningConsiderations: industryType === 'potash_mining' ? getPotashMiningConsiderations() : undefined,
      agricultureConsiderations: industryType === 'agriculture' ? getAgricultureConsiderations() : undefined,
      oilGasConsiderations: industryType === 'oil_gas' ? getOilGasConsiderations() : undefined,
      uraniumMiningConsiderations: industryType === 'uranium_mining' ? getUraniumMiningConsiderations() : undefined,
      prairieConditions: getPrairieConditions(),
      climaticFactors: getClimaticFactors(),
      emergencyServices: getSKEmergencyServices(industryType),
      regulatoryIntegration: getSKRegulatoryIntegration(industryType)
    },
    actionPlan: generateSKActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performSKStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'SK_OHS_6_18':
      return checkConfinedSpaceIdentification(permitData);
    case 'SK_OHS_6_20':
      return checkSaskatchewanHazardAssessment(permitData, industryType);
    case 'SK_OHS_6_23':
      return checkSaskatchewanAtmosphericTesting(atmosphericReadings, industryType);
    case 'SK_OHS_6_26':
      return checkSaskatchewanEntryPermitSystem(permitData, industryType);
    case 'SK_OHS_6_29':
      return checkSaskatchewanAttendantRequirements(personnel, industryType);
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

function getPotashMiningConsiderations() {
  return {
    undergroundOperations: 'potash_mine_shaft_underground_safety',
    solutionMining: 'brine_injection_extraction_high_pressure_operations',
    processingOperations: 'potash_mill_dust_control_crystallization',
    emergencyResponse: 'potash_mine_rescue_team_coordination',
    environmentalProtection: 'potash_mining_groundwater_protection'
  };
}

function getAgricultureConsiderations() {
  return {
    grainHandling: 'grain_elevator_storage_dust_explosion_prevention',
    livestockOperations: 'livestock_confinement_manure_gas_management',
    canolaProcessing: 'canola_oil_extraction_hexane_safety',
    seasonalOperations: 'harvest_season_intensive_operations_safety',
    cooperativeOperations: 'multi_farm_equipment_sharing_coordination'
  };
}

function getOilGasConsiderations() {
  return {
    heavyOilOperations: 'lloydminster_heavy_oil_extraction_safety',
    naturalGasProcessing: 'natural_gas_plant_processing_chemical_safety',
    pipelineOperations: 'pipeline_compression_station_safety',
    wellSiteOperations: 'drilling_completion_production_safety',
    h2sOperations: 'hydrogen_sulfide_sour_gas_emergency_procedures'
  };
}

function getUraniumMiningConsiderations() {
  return {
    radiationProtection: 'alara_principle_radiation_exposure_minimization',
    undergroundOperations: 'uranium_mine_ventilation_radon_control',
    processingOperations: 'uranium_milling_yellowcake_production_safety',
    wasteManagement: 'radioactive_tailings_management_safety',
    emergencyResponse: 'nuclear_emergency_response_coordination'
  };
}

function getPrairieConditions() {
  return {
    extremeWeather: 'minus_40_celsius_winter_operations',
    windExposure: 'prairie_wind_equipment_safety_considerations',
    remoteLocations: 'isolated_rural_operations_limited_services',
    seasonalAccess: 'ice_road_seasonal_transportation_limitations',
    communicationChallenges: 'rural_cellular_coverage_backup_systems'
  };
}

function getClimaticFactors() {
  return {
    winter: 'extreme_cold_blizzard_operations_safety',
    spring: 'flooding_ice_jam_equipment_access_challenges',
    summer: 'severe_weather_tornado_hail_operations',
    fall: 'early_freeze_equipment_winterization_preparation'
  };
}

function getSKEmergencyServices(industryType?: string) {
  const base = SK_EMERGENCY_SERVICES.general;
  
  if (industryType === 'potash_mining') {
    return { ...base, ...SK_EMERGENCY_SERVICES.potashMining };
  }
  
  if (industryType === 'agriculture') {
    return { ...base, ...SK_EMERGENCY_SERVICES.agriculture };
  }
  
  if (industryType === 'oil_gas') {
    return { ...base, ...SK_EMERGENCY_SERVICES.oilGas };
  }
  
  if (industryType === 'uranium_mining') {
    return { ...base, ...SK_EMERGENCY_SERVICES.uraniumMining };
  }
  
  return { ...base, ...SK_EMERGENCY_SERVICES.regionalEmergency };
}

function getSKRegulatoryIntegration(industryType?: string) {
  const base = ['wcb_saskatchewan', 'saskatchewan_labour_relations_workplace_safety'];
  
  if (industryType === 'uranium_mining') {
    return [...base, 'canadian_nuclear_safety_commission', 'saskatchewan_environment'];
  }
  
  if (industryType === 'oil_gas') {
    return [...base, 'saskatchewan_energy_regulator', 'saskatchewan_environment'];
  }
  
  if (industryType === 'potash_mining') {
    return [...base, 'saskatchewan_energy_regulator', 'saskatchewan_environment'];
  }
  
  if (industryType === 'agriculture') {
    return [...base, 'saskatchewan_agriculture', 'agriculture_agri_food_canada'];
  }
  
  return base;
}

function generateSKActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getSKCorrectiveAction(result.requirementId, industryType),
    responsible: 'competent_worker',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getSKRequiredResources(result.requirementId, industryType),
    verification: 'wcb_saskatchewan_inspector_verification'
  }));
}

function getSKCorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${industryType || 'Saskatchewan'} operations with prairie considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'Saskatchewan'} avec considérations des prairies`
    },
    saskatchewan_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including climatic and industry factors for ${industryType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant facteurs climatiques et industriels pour opérations ${industryType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with ${industryType || 'industry'}-specific standards and extreme weather considerations`,
      fr: `Effectuer tests atmosphériques selon standards spécifiques ${industryType || 'industrie'} et considérations météo extrême`
    },
    entry_permit: {
      en: `Implement entry permit system with ${industryType || 'industry'} coordination and weather dependency planning`,
      fr: `Implémenter système permis d'entrée avec coordination ${industryType || 'industrie'} et planification dépendance météo`
    },
    attendant_present: {
      en: `Assign qualified attendant with ${industryType || 'industry'} training and prairie emergency procedures`,
      fr: `Assigner surveillant qualifié avec formation ${industryType || 'industrie'} et procédures urgence prairies`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WCB Saskatchewan and prairie operation requirements',
    fr: 'Traiter non-conformité identifiée selon exigences WCB Saskatchewan et opérations des prairies'
  };
}

function getSKRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_worker', 'saskatchewan_ohs_guidelines'],
    saskatchewan_hazard_assessment: ['competent_worker', 'industry_specialist', 'climatic_assessment'],
    atmospheric_testing: ['calibrated_detectors', 'extreme_weather_equipment'],
    entry_permit: ['permit_forms', 'weather_monitoring_equipment'],
    attendant_present: ['trained_attendant', 'prairie_communication_systems']
  };
  
  const resources = baseResources[requirementId] || ['competent_worker'];
  
  // Add industry-specific resources
  if (industryType === 'potash_mining') {
    resources.push('potash_mine_rescue_coordination', 'underground_communication');
  } else if (industryType === 'uranium_mining') {
    resources.push('radiation_safety_officer', 'cnsc_coordination');
  } else if (industryType === 'oil_gas') {
    resources.push('h2s_detection_equipment', 'petroleum_emergency_response');
  } else if (industryType === 'agriculture') {
    resources.push('grain_handling_safety_equipment', 'seasonal_operation_coordination');
  }
  
  // Add Saskatchewan-specific resources
  resources.push('extreme_weather_procedures', 'rural_emergency_coordination');
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasSKClassification = permitData.spaceDetails?.regulatoryClassification?.includes('saskatchewan_ohs');
  
  return {
    standardId: 'SK_OHS_6_18',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasSKClassification ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasSKClassification ? [] : ['Missing Saskatchewan OHS classification'])
    ],
    priority: 'critical'
  };
}

function checkSaskatchewanHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasClimaticFactors = permitData.hazardAssessment?.climaticFactors?.includes('saskatchewan_prairie_conditions');
  const hasIndustrySpecificAssessment = industryType ? 
    permitData.hazardAssessment?.industrySpecific?.[industryType] !== undefined : true;
  
  return {
    standardId: 'SK_OHS_6_20',
    requirementId: 'saskatchewan_hazard_assessment',
    status: hasAssessment && hasClimaticFactors && hasIndustrySpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasClimaticFactors ? [] : ['Missing Saskatchewan prairie conditions assessment']),
      ...(hasIndustrySpecificAssessment ? [] : [`Missing ${industryType} industry-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkSaskatchewanAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'SK_OHS_6_23',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getSKStandardsForIndustry(industryType);
  const hasWeatherCompensation = atmosphericReadings.some(r => r.weatherCompensation !== undefined);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isSKReadingCompliant(reading, standards);
  });

  return {
    standardId: 'SK_OHS_6_23',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasWeatherCompensation ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for ${industryType || 'general'} operations`
      ),
      ...(hasWeatherCompensation ? [] : ['Missing extreme weather compensation'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkSaskatchewanEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWeatherConsiderations = permitData.entryPermit?.weatherConsiderations !== undefined;
  const hasOperationalCoordination = permitData.entryPermit?.operationalCoordination !== undefined;
  
  return {
    standardId: 'SK_OHS_6_26',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWeatherConsiderations && hasOperationalCoordination ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasWeatherConsiderations ? [] : ['Missing extreme weather considerations']),
      ...(hasOperationalCoordination ? [] : ['Missing operational coordination procedures'])
    ],
    priority: 'critical'
  };
}

function checkSaskatchewanAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasSKTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasSaskatchewanSpecificTraining(p, industryType));
  const hasCommunicationBackup = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'rural_communication_systems'));
  
  return {
    standardId: 'SK_OHS_6_29',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasSKTraining && hasCommunicationBackup ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasSKTraining ? [] : [`Attendant lacks Saskatchewan ${industryType} training`]),
      ...(hasCommunicationBackup ? [] : ['Missing rural communication backup systems'])
    ],
    priority: 'critical'
  };
}

function getSKStandardsForIndustry(industryType?: string) {
  const baseStandards = SK_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'potash_mining') {
    return { ...baseStandards, ...baseStandards.potashMiningSpecific };
  }
  
  if (industryType === 'agriculture') {
    return { ...baseStandards, ...baseStandards.agricultureSpecific };
  }
  
  if (industryType === 'oil_gas') {
    return { ...baseStandards, ...baseStandards.oilGasSpecific };
  }
  
  if (industryType === 'uranium_mining') {
    return { ...baseStandards, ...baseStandards.uraniumMiningSpecific };
  }
  
  return baseStandards;
}

function isSKReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasSaskatchewanSpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  const requiredTraining = {
    potash_mining: ['potash_mining_safety', 'underground_operations'],
    agriculture: ['grain_handling_safety', 'livestock_safety'],
    oil_gas: ['h2s_alive_certification', 'well_site_safety'],
    uranium_mining: ['radiation_safety', 'nuclear_emergency_procedures']
  };
  
  const saskatchewanBaseline = ['wcb_saskatchewan_training', 'standard_first_aid', 'extreme_weather_operations'];
  const industrySpecific = industryType ? requiredTraining[industryType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...saskatchewanBaseline, ...industrySpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WCB_SK_AUTHORITY,
  SK_SPECIFIC_FEATURES,
  SK_REGULATION_STANDARDS,
  SK_ATMOSPHERIC_STANDARDS,
  SK_PERSONNEL_QUALIFICATIONS,
  SK_EMERGENCY_SERVICES,
  checkSKCompliance
};

export type SKIndustryType = 'potash_mining' | 'agriculture' | 'oil_gas' | 'uranium_mining' | 'general';
export type SKRegulationStandardId = keyof typeof SK_REGULATION_STANDARDS;
export type SKPersonnelQualificationId = keyof typeof SK_PERSONNEL_QUALIFICATIONS;
