/**
 * Prince Edward Island Workers Compensation Board (WCB PEI)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: PEI Occupational Health and Safety Act General Regulations
 * Part 9: Confined Spaces (Sections 9.1-9.18)
 * 
 * Provincial Focus: Agriculture, fisheries, food processing, tourism facilities
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

// =================== PRINCE EDWARD ISLAND AUTHORITY ===================

export const WCB_PEI_AUTHORITY = {
  name: 'Workers Compensation Board of Prince Edward Island',
  acronym: 'WCB PEI',
  jurisdiction: ['PE'] as const,
  website: 'https://wcb.pe.ca',
  contactInfo: {
    phone: '1-800-237-5049',              // Ligne principale WCB PEI
    preventionPhone: '902-368-5680',       // Services prévention
    email: 'prevention@wcb.pe.ca',
    address: '14 Weymouth Street, Charlottetown, PE C1A 4Z1'
  },
  regionalOffices: [
    { region: 'Charlottetown', phone: '902-368-5680', coverage: 'Central PEI, Government, Tourism' },
    { region: 'Summerside', phone: '902-888-8218', coverage: 'Western PEI, Food Processing, Agriculture' },
    { region: 'Montague', phone: '902-838-0700', coverage: 'Eastern PEI, Fisheries, Rural Operations' }
  ],
  languages: ['en', 'fr'] as const,        // English primary, French services available
  specializedUnits: [
    'agriculture_safety_program',          // Programme sécurité agriculture
    'fisheries_safety_initiative',         // Initiative sécurité pêches
    'food_processing_safety_unit',         // Unité sécurité transformation alimentaire
    'tourism_hospitality_safety_program'   // Programme sécurité tourisme
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties',
    'Prosecutions under provincial law'
  ]
} as const;

// =================== PEI SPECIFIC FEATURES ===================

export const PEI_SPECIFIC_FEATURES = {
  agricultureOperations: [
    'potato_processing_facilities_cavendish_farms',
    'dairy_farming_operations_throughout_island',
    'grain_storage_facilities_elevators',
    'livestock_barn_manure_storage_systems',
    'greenhouse_operations_controlled_environments'
  ],
  fisheriesOperations: [
    'lobster_processing_plants_seasonal',
    'mussel_aquaculture_operations',
    'oyster_farming_malpeque_bay',
    'fishing_vessel_confined_spaces',
    'seafood_processing_cold_storage'
  ],
  foodProcessingOperations: [
    'cavendish_farms_potato_processing',
    'malpeque_oyster_processing',
    'dairy_processing_plants_adl',
    'meat_processing_facilities',
    'bakery_flour_mill_operations'
  ],
  tourismHospitalityOperations: [
    'hotel_resort_confined_spaces',
    'restaurant_kitchen_equipment_spaces',
    'golf_course_maintenance_facilities',
    'entertainment_venue_technical_spaces',
    'historic_site_preservation_facilities'
  ],
  seasonalConsiderations: [
    'seasonal_tourism_operations_summer',
    'harvest_season_intensive_operations',
    'lobster_fishing_season_spring',
    'winter_maintenance_heating_systems',
    'ice_storm_emergency_preparedness'
  ],
  islandChallenges: [
    'limited_emergency_services_remote_areas',
    'mainland_specialist_support_coordination',
    'weather_dependent_emergency_evacuation',
    'small_workforce_multi_skilled_requirements',
    'equipment_maintenance_parts_availability'
  ],
  regulatoryIntegration: [
    'transport_canada_marine_safety',
    'canadian_food_inspection_agency',
    'agriculture_agri_food_canada',
    'fisheries_oceans_canada_coordination'
  ]
} as const;

// =================== PEI REGULATION STANDARDS ===================

export const PEI_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'PEI_OHS_9_1': {
    id: 'PEI_OHS_9_1',
    title: { 
      en: 'Confined Space Definition for Island Operations', 
      fr: 'Définition d\'Espace Clos pour Opérations Insulaires' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    section: '9.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes agricultural, fisheries, and food processing facilities'  // PEI specific
    ],
    peiSpecific: {
      agricultureDefinitions: [
        'potato_storage_bins_and_silos',
        'grain_elevator_storage_areas',
        'livestock_barn_manure_pits',
        'dairy_barn_milk_house_tanks',
        'greenhouse_fumigation_chambers'
      ],
      fisheriesDefinitions: [
        'lobster_processing_cooking_vessels',
        'mussel_washing_sorting_tanks',
        'fishing_vessel_fish_holds',
        'seafood_cold_storage_freezer_rooms',
        'aquaculture_equipment_chambers'
      ],
      foodProcessingDefinitions: [
        'potato_processing_vessels_tanks',
        'dairy_processing_pasteurization_units',
        'meat_processing_smokehouse_chambers',
        'flour_mill_grain_storage_bins',
        'beverage_production_fermentation_tanks'
      ],
      tourismDefinitions: [
        'hotel_boiler_mechanical_rooms',
        'restaurant_kitchen_equipment_spaces',
        'golf_course_irrigation_pump_houses',
        'historic_building_preservation_spaces'
      ]
    },
    penalties: {
      individual: { min: 250, max: 25000 },     // 2023 amounts
      corporation: { min: 2500, max: 250000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Prince Edward Island Occupational Health and Safety General Regulations',
        citation: 'PEI Reg. EC402/97',
        url: 'https://www.princeedwardisland.ca/en/legislation/occupational-health-and-safety-general-regulations'
      }
    ]
  },

  'PEI_OHS_9_3': {
    id: 'PEI_OHS_9_3',
    title: { 
      en: 'Hazard Assessment for Island Industries', 
      fr: 'Évaluation des Dangers pour Industries Insulaires' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    section: '9.3',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Identification of all potential hazards including seasonal',
      'Assessment of atmospheric, biological, and chemical hazards',
      'Evaluation of emergency response limitations',
      'Consideration of island-specific challenges'
    ],
    peiSpecific: {
      agricultureHazards: {
        potatoProcessing: 'starch_dust_ammonia_refrigeration_steam_systems',
        livestockOperations: 'manure_gas_zoonotic_disease_confined_animal_feeding',
        grainStorage: 'grain_dust_explosion_fumigant_exposure_engulfment',
        greenhouseOperations: 'pesticide_fumigation_carbon_dioxide_enrichment'
      },
      fisheriesHazards: {
        lobsterProcessing: 'steam_cooking_ammonia_refrigeration_biological_contamination',
        aquaculture: 'underwater_equipment_marine_environment_disease_treatment',
        vesselOperations: 'fishing_vessel_stability_confined_fish_holds',
        coldStorage: 'ammonia_refrigeration_oxygen_depletion_ice_formation'
      },
      foodProcessingHazards: {
        potatoFacilities: 'acrylamide_formation_oil_vapor_steam_systems',
        dairyProcessing: 'pasteurization_steam_cleaning_chemical_sanitizers',
        meatProcessing: 'pathogen_exposure_smoking_chemicals_refrigeration',
        bakeryOperations: 'flour_dust_yeast_fermentation_oven_gases'
      },
      seasonalHazards: {
        harvestSeason: 'intensive_operations_extended_hours_equipment_overload',
        winterOperations: 'heating_system_carbon_monoxide_ice_formation',
        stormSeason: 'power_outage_backup_generator_exhaust',
        touristSeason: 'increased_activity_temporary_worker_unfamiliarity'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'industry_specialist', 'seasonal_considerations'],
      responsibilities: ['employer', 'competent_person', 'safety_committee', 'seasonal_coordinators']
    }
  },

  'PEI_OHS_9_6': {
    id: 'PEI_OHS_9_6',
    title: { 
      en: 'Atmospheric Testing for Island Industries', 
      fr: 'Tests Atmosphériques pour Industries Insulaires' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    section: '9.6',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of properly maintained and calibrated equipment',
      'Documentation considering seasonal variations'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    peiSpecific: {
      agricultureTesting: {
        potatoStorage: ['carbon_dioxide_respiration', 'ethylene_ripening_gas', 'fumigant_residues'],
        livestockFacilities: ['methane_manure_decomposition', 'ammonia_animal_waste', 'hydrogen_sulfide_anaerobic'],
        grainStorage: ['carbon_dioxide_respiration', 'phosphine_fumigation', 'grain_dust_suspension'],
        greenhouse: ['carbon_dioxide_enrichment', 'pesticide_vapors', 'humidity_condensation']
      },
      fisheriesTesting: {
        processing: ['ammonia_refrigeration_leaks', 'carbon_dioxide_preservation', 'steam_oxygen_displacement'],
        aquaculture: ['dissolved_oxygen_levels', 'treatment_chemical_residues', 'algae_decomposition_gases'],
        vesselOperations: ['fish_decomposition_gases', 'fuel_vapor_leakage', 'refrigeration_system_gases']
      },
      foodProcessingTesting: {
        potatoProcessing: ['acrylamide_vapor', 'frying_oil_decomposition', 'steam_system_gases'],
        dairyProcessing: ['pasteurization_steam_gases', 'cleaning_chemical_vapors', 'fermentation_gases'],
        meatProcessing: ['smoking_wood_gases', 'preservation_chemical_vapors', 'decomposition_gases'],
        bakery: ['yeast_fermentation_alcohol', 'flour_dust_atmosphere', 'oven_combustion_gases']
      }
    }
  },

  'PEI_OHS_9_9': {
    id: 'PEI_OHS_9_9',
    title: { 
      en: 'Entry Permit System for Island Operations', 
      fr: 'Système de Permis d\'Entrée pour Opérations Insulaires' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    section: '9.9',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of safety measures and procedures',
      'Coordination with seasonal operations',
      'Emergency response plan considering island limitations'
    ],
    peiSpecific: {
      agriculturePermits: {
        harvestSeason: 'intensive_harvest_operation_coordination',
        livestockOperations: 'animal_welfare_ventilation_system_coordination',
        seasonalWorkers: 'temporary_worker_training_language_barriers',
        equipmentCoordination: 'shared_equipment_multiple_farm_coordination'
      },
      fisheriesPermits: {
        seasonalProcessing: 'lobster_season_intensive_processing_coordination',
        vesselOperations: 'fishing_vessel_captain_coordination_tides',
        aquacultureOperations: 'underwater_equipment_weather_tide_coordination',
        harborOperations: 'harbor_activity_vessel_movement_coordination'
      },
      foodProcessingPermits: {
        productionSchedules: 'food_safety_haccp_production_coordination',
        seasonalDemand: 'tourist_season_increased_production_coordination',
        qualityControl: 'food_quality_testing_confined_space_entry',
        shiftOperations: 'multiple_shift_handover_communication'
      },
      emergencyLimitations: {
        islandResponse: 'mainland_emergency_service_coordination',
        weatherDependency: 'weather_dependent_evacuation_planning',
        resourceLimitations: 'limited_specialized_equipment_coordination'
      }
    }
  },

  'PEI_OHS_9_12': {
    id: 'PEI_OHS_9_12',
    title: { 
      en: 'Attendant and Communication for Island Facilities', 
      fr: 'Surveillant et Communication pour Installations Insulaires' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    section: '9.12',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Reliable communication systems',
      'Monitoring of conditions affecting entrant safety',
      'Emergency response coordination capability',
      'Understanding of island-specific emergency procedures'
    ],
    peiSpecific: {
      communicationSystems: {
        cellularCoverage: 'cellular_dead_zone_backup_communication',
        landlineBackup: 'landline_telephone_backup_systems',
        radioSystems: 'two_way_radio_emergency_frequency_coordination'
      },
      islandAttendant: {
        multipleSkills: 'cross_trained_attendant_multiple_competencies',
        emergencyResponse: 'volunteer_fire_department_coordination',
        weatherAwareness: 'storm_weather_evacuation_procedures',
        seasonalFactors: 'tourist_season_increased_activity_coordination'
      },
      industrySpecificAttendant: {
        agriculture: 'farm_operation_seasonal_worker_coordination',
        fisheries: 'fishing_industry_tidal_weather_coordination',
        foodProcessing: 'food_safety_quality_control_integration',
        tourism: 'guest_safety_business_operation_coordination'
      }
    }
  }
};

// =================== PEI ATMOSPHERIC STANDARDS ===================

export const PEI_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // PEI Agriculture Industry Specific
  agricultureSpecific: {
    methane_manure: { max: 1000, unit: 'ppm' },         // Livestock manure storage
    ammonia_livestock: { max: 25, unit: 'ppm' },        // Animal feeding operations
    carbon_dioxide_storage: { max: 5000, unit: 'ppm' }, // Potato/grain respiration
    phosphine_fumigation: { max: 0.3, unit: 'ppm' },    // Grain fumigation
    ethylene_ripening: { max: 100, unit: 'ppm' }        // Potato storage
  },
  
  // PEI Fisheries Industry Specific  
  fisheriesSpecific: {
    ammonia_refrigeration: { max: 25, unit: 'ppm' },    // Seafood processing refrigeration
    hydrogen_sulfide_decomp: { max: 10, unit: 'ppm' },  // Fish decomposition
    carbon_dioxide_preservation: { max: 5000, unit: 'ppm' }, // Seafood preservation
    steam_displacement: 'oxygen_monitoring_required'     // Steam cooking operations
  },
  
  // PEI Food Processing Industry Specific
  foodProcessingSpecific: {
    acrylamide_vapor: { max: 0.03, unit: 'mg/m³' },     // Potato processing
    yeast_alcohol: { max: 1000, unit: 'ppm' },          // Bakery fermentation
    flour_dust: { max: 4, unit: 'mg/m³' },              // Flour mill operations
    cleaning_chemicals: 'per_material_safety_data_sheet', // Food processing sanitizers
    pasteurization_steam: 'oxygen_displacement_monitoring'
  },
  
  // PEI Tourism/Hospitality Specific
  tourismSpecific: {
    kitchen_exhaust: { max: 25, unit: 'ppm' },          // Restaurant CO
    pool_chemicals: { max: 1, unit: 'ppm' },            // Chlorine/chloramine
    boiler_exhaust: { max: 35, unit: 'ppm' },           // Hotel heating systems
    maintenance_solvents: 'per_material_safety_data_sheet'
  }
} as const;

// =================== PEI PERSONNEL QUALIFICATIONS ===================

export const PEI_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'pei_competent_person',
    title: { 
      en: 'Competent Person - PEI Confined Space', 
      fr: 'Personne Compétente - Espace Clos Î.-P.-É.' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with PEI OHS Act and Regulations',
      'Understanding of island industry-specific hazards',
      'Ability to coordinate with limited emergency resources',
      'Knowledge of seasonal operational variations'
    ],
    peiSpecific: {
      agricultureCompetency: {
        potatoIndustry: 'potato_processing_cavendish_farms_procedures',
        livestockOperations: 'dairy_livestock_manure_management_safety',
        seasonalOperations: 'harvest_planting_seasonal_worker_coordination',
        grainHandling: 'grain_elevator_storage_dust_explosion_prevention'
      },
      fisheriesCompetency: {
        lobsterIndustry: 'lobster_processing_seasonal_operations_safety',
        aquaculture: 'mussel_oyster_aquaculture_safety_procedures',
        vesselSafety: 'fishing_vessel_confined_space_procedures',
        marineEnvironment: 'tidal_weather_marine_safety_awareness'
      },
      foodProcessingCompetency: {
        foodSafety: 'haccp_food_safety_confined_space_integration',
        processingEquipment: 'food_processing_equipment_safety_procedures',
        qualityControl: 'quality_control_testing_safety_coordination',
        seasonalDemand: 'tourist_season_production_increase_safety'
      },
      islandChallenges: {
        emergencyResponse: 'limited_emergency_resource_coordination',
        weatherDependency: 'storm_weather_emergency_procedures',
        seasonalWorkforce: 'temporary_seasonal_worker_training',
        equipmentMaintenance: 'preventive_maintenance_parts_availability'
      }
    },
    certification: 'wcb_pei_approved_competent_person_training',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'wcb_pei_confined_space_competent_person',
      'island_industry_specific_hazards',
      'emergency_response_island_limitations',
      'seasonal_operation_safety_coordination'
    ]
  },

  attendant: {
    id: 'pei_attendant',
    title: { 
      en: 'PEI Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Î.-P.-É.' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    requirements: [
      'Training in attendant duties for island operations',
      'Knowledge of communication procedures and backup systems',
      'Understanding of emergency evacuation procedures',
      'Familiarity with atmospheric monitoring equipment',
      'Standard first aid and emergency response training'
    ],
    peiSpecific: {
      communicationSystems: {
        cellularLimitations: 'cellular_dead_zone_backup_communication',
        radioSystems: 'vhf_uhf_radio_operation_emergency_frequencies',
        landlineBackup: 'landline_telephone_emergency_coordination'
      },
      islandOperations: {
        multipleCompetencies: 'cross_training_multiple_industry_competencies',
        emergencyResponse: 'volunteer_emergency_service_coordination',
        weatherAwareness: 'storm_weather_emergency_procedures',
        seasonalFactors: 'seasonal_operation_safety_considerations'
      },
      industrySpecificAttendant: {
        agriculture: 'farm_safety_seasonal_worker_coordination',
        fisheries: 'marine_safety_tidal_weather_awareness',
        foodProcessing: 'food_safety_quality_control_integration',
        tourism: 'guest_safety_hospitality_operation_integration'
      }
    },
    certification: 'wcb_pei_attendant_training_plus_island_specialization',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'pei_atmospheric_tester',
    title: { 
      en: 'PEI Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Î.-P.-É.' 
    },
    authority: 'WCB PEI',
    jurisdiction: ['PE'],
    requirements: [
      'Training on gas detection equipment operation',
      'Knowledge of PEI atmospheric standards and industry variations',
      'Understanding of equipment maintenance in island conditions',
      'Ability to interpret test results for different industries',
      'Knowledge of seasonal atmospheric hazard variations'
    ],
    peiSpecific: {
      equipmentMaintenance: {
        saltAirCorrosion: 'marine_environment_equipment_protection',
        humidityEffects: 'high_humidity_equipment_calibration',
        temperatureVariations: 'seasonal_temperature_equipment_adjustment',
        partsAvailability: 'equipment_maintenance_parts_coordination'
      },
      industryTesting: {
        agriculture: 'potato_grain_storage_atmosphere_testing',
        fisheries: 'seafood_processing_refrigeration_gas_testing',
        foodProcessing: 'food_processing_equipment_atmosphere_testing',
        tourism: 'hospitality_facility_mechanical_space_testing'
      },
      seasonalConsiderations: {
        harvestSeason: 'intensive_harvest_operation_testing_schedules',
        touristSeason: 'increased_activity_testing_coordination',
        winterOperations: 'heating_system_combustion_gas_testing',
        stormPreparation: 'emergency_backup_system_testing'
      }
    },
    certification: 'equipment_manufacturer_plus_pei_industry_specialization',
    validity: 'annual_recertification_equipment_updates'
  }
};

// =================== PEI EMERGENCY SERVICES ===================

export const PEI_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wcbPEI: '1-800-237-5049'
  },
  
  islandServices: {
    emergencyMeasures: '902-894-0385',        // PEI Emergency Measures Organization
    healthEmergency: '902-368-6130',          // Health PEI Emergency Services
    marinEmergency: '1-800-565-1582',         // Coast Guard Charlottetown
    environmentalEmergency: '902-368-5000'    // Environment, Water and Climate Change
  },
  
  agriculture: {
    agricultureEmergency: '902-368-4880',     // Agriculture and Land Department
    potatoBoard: '902-892-6551',              // PEI Potato Board
    dairyBoard: '902-566-3804',               // PEI Dairy Board
    livestockEmergency: '902-368-4852',       // Animal Health Division
    farmSafety: '902-368-4990'                // Farm Safety Association PEI
  },
  
  fisheries: {
    fisheriesEmergency: '902-368-6230',       // PEI Fisheries and Communities
    dfoEmergency: '902-566-7810',             // Fisheries and Oceans Canada
    lobsterBoard: '902-566-4050',             // PEI Lobster Marketing Board
    aquacultureEmergency: '902-368-6265',     // Aquaculture and Fisheries Development
    harborAuthority: '902-566-7923'          // Charlottetown Harbour Authority
  },
  
  foodProcessing: {
    cfiaEmergency: '902-566-7890',            // Canadian Food Inspection Agency
    cavendishFarms: '902-836-3301',           // Cavendish Farms Emergency
    adlEmergency: '902-566-3020',             // Amalgamated Dairies Limited
    foodSafety: '902-368-4185',               // Food Safety and Inspection
    processingAssociation: '902-894-6868'    // Food Processors Association
  },
  
  tourism: {
    tourismEmergency: '902-368-4444',         // Tourism PEI Emergency
    hotelAssociation: '902-892-1853',         // Hotel and Motel Association
    restaurantAssociation: '902-894-7411',    // Restaurant and Foodservices Association
    attractionEmergency: '902-368-4444',      // Tourist Attraction Emergency
    conventionCentre: '902-629-1864'         // Charlottetown Conference Centre
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    marineRescue: 'coast_guard_auxiliary_pei',
    agriculturalRescue: 'volunteer_fire_department_farm_rescue',
    industrialRescue: 'charlottetown_fire_hazmat_team'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkPEICompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'agriculture' | 'fisheries' | 'food_processing' | 'tourism' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(PEI_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(PEI_REGULATION_STANDARDS).forEach(standard => {
    const check = performPEIStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'PE',
    overallCompliance,
    results,
    criticalNonCompliance,
    peiSpecific: {
      industryType: industryType || 'general',
      agricultureConsiderations: industryType === 'agriculture' ? getAgricultureConsiderations() : undefined,
      fisheriesConsiderations: industryType === 'fisheries' ? getFisheriesConsiderations() : undefined,
      foodProcessingConsiderations: industryType === 'food_processing' ? getFoodProcessingConsiderations() : undefined,
      tourismConsiderations: industryType === 'tourism' ? getTourismConsiderations() : undefined,
      islandChallenges: getIslandChallenges(),
      seasonalFactors: getSeasonalFactors(),
      emergencyServices: getPEIEmergencyServices(industryType),
      regulatoryIntegration: getPEIRegulatoryIntegration(industryType)
    },
    actionPlan: generatePEIActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performPEIStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'PEI_OHS_9_1':
      return checkConfinedSpaceIdentification(permitData);
    case 'PEI_OHS_9_3':
      return checkIslandHazardAssessment(permitData, industryType);
    case 'PEI_OHS_9_6':
      return checkIslandAtmosphericTesting(atmosphericReadings, industryType);
    case 'PEI_OHS_9_9':
      return checkIslandEntryPermitSystem(permitData, industryType);
    case 'PEI_OHS_9_12':
      return checkIslandAttendantRequirements(personnel, industryType);
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

function getAgricultureConsiderations() {
  return {
    potatoIndustry: 'potato_processing_storage_safety_coordination',
    livestockOperations: 'dairy_livestock_manure_management_safety',
    seasonalWorkforce: 'temporary_seasonal_worker_training_coordination',
    grainHandling: 'grain_elevator_dust_explosion_prevention',
    greenhouses: 'controlled_environment_fumigation_co2_enrichment'
  };
}

function getFisheriesConsiderations() {
  return {
    seasonalProcessing: 'lobster_season_intensive_processing_safety',
    aquaculture: 'mussel_oyster_aquaculture_underwater_safety',
    vesselOperations: 'fishing_vessel_confined_space_safety',
    marineEnvironment: 'tidal_weather_marine_safety_factors',
    coldStorage: 'ammonia_refrigeration_seafood_storage_safety'
  };
}

function getFoodProcessingConsiderations() {
  return {
    foodSafety: 'haccp_food_safety_confined_space_integration',
    processingEquipment: 'food_processing_equipment_safety_procedures',
    qualityControl: 'quality_testing_confined_space_coordination',
    sanitationSafety: 'cleaning_chemical_confined_space_safety',
    productionSchedules: 'seasonal_demand_production_safety_coordination'
  };
}

function getTourismConsiderations() {
  return {
    hotelOperations: 'hotel_resort_mechanical_space_safety',
    restaurantOperations: 'kitchen_equipment_confined_space_safety',
    seasonalOperations: 'tourist_season_increased_activity_safety',
    guestSafety: 'visitor_safety_confined_space_coordination',
    maintenanceOperations: 'tourism_facility_maintenance_safety'
  };
}

function getIslandChallenges() {
  return {
    emergencyResponse: 'limited_emergency_service_mainland_coordination',
    equipmentMaintenance: 'equipment_parts_availability_coordination',
    weatherDependency: 'storm_weather_emergency_evacuation_planning',
    specializationLimitations: 'cross_trained_personnel_multiple_competencies',
    communicationChallenges: 'cellular_dead_zone_backup_communication'
  };
}

function getSeasonalFactors() {
  return {
    harvestSeason: 'intensive_harvest_operation_safety_coordination',
    touristSeason: 'summer_tourist_activity_safety_considerations',
    lobsterSeason: 'spring_lobster_fishing_processing_safety',
    winterOperations: 'heating_system_storm_emergency_safety',
    stormSeason: 'hurricane_storm_emergency_preparedness'
  };
}

function getPEIEmergencyServices(industryType?: string) {
  const base = PEI_EMERGENCY_SERVICES.general;
  
  if (industryType === 'agriculture') {
    return { ...base, ...PEI_EMERGENCY_SERVICES.agriculture };
  }
  
  if (industryType === 'fisheries') {
    return { ...base, ...PEI_EMERGENCY_SERVICES.fisheries };
  }
  
  if (industryType === 'food_processing') {
    return { ...base, ...PEI_EMERGENCY_SERVICES.foodProcessing };
  }
  
  if (industryType === 'tourism') {
    return { ...base, ...PEI_EMERGENCY_SERVICES.tourism };
  }
  
  return { ...base, ...PEI_EMERGENCY_SERVICES.islandServices };
}

function getPEIRegulatoryIntegration(industryType?: string) {
  const base = ['wcb_pei', 'pei_environment_labour_justice'];
  
  if (industryType === 'agriculture') {
    return [...base, 'agriculture_agri_food_canada', 'pei_agriculture_land'];
  }
  
  if (industryType === 'fisheries') {
    return [...base, 'fisheries_oceans_canada', 'pei_fisheries_communities'];
  }
  
  if (industryType === 'food_processing') {
    return [...base, 'canadian_food_inspection_agency', 'health_canada'];
  }
  
  if (industryType === 'tourism') {
    return [...base, 'tourism_pei', 'service_canada'];
  }
  
  return base;
}

function generatePEIActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getPEICorrectiveAction(result.requirementId, industryType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getPEIRequiredResources(result.requirementId, industryType),
    verification: 'wcb_pei_inspector_verification'
  }));
}

function getPEICorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${industryType || 'PEI'} operations with island-specific considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'Î.-P.-É.'} avec considérations spécifiques insulaires`
    },
    island_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including seasonal and island-specific factors for ${industryType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant facteurs saisonniers et spécifiques île pour opérations ${industryType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with island industry standards and seasonal considerations for ${industryType || 'general'} operations`,
      fr: `Effectuer tests atmosphériques selon standards industries île et considérations saisonnières pour opérations ${industryType || 'générales'}`
    },
    entry_permit: {
      en: `Implement entry permit system with island emergency coordination and ${industryType || 'general'} industry requirements`,
      fr: `Implémenter système permis d'entrée avec coordination urgence île et exigences industrie ${industryType || 'générale'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with island emergency training and ${industryType || 'general'} industry experience`,
      fr: `Assigner surveillant qualifié avec formation urgence île et expérience industrie ${industryType || 'générale'}`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WCB PEI requirements for island operations',
    fr: 'Traiter non-conformité identifiée selon exigences WCB Î.-P.-É. pour opérations insulaires'
  };
}

function getPEIRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_person', 'island_industry_specialist'],
    island_hazard_assessment: ['competent_person', 'seasonal_operation_coordinator'],
    atmospheric_testing: ['island_rated_equipment', 'cross_trained_tester'],
    entry_permit: ['permit_forms', 'emergency_coordination_plan'],
    attendant_present: ['island_trained_attendant', 'backup_communication_systems']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add industry-specific resources
  if (industryType === 'agriculture') {
    resources.push('farm_safety_specialist', 'seasonal_worker_coordinator');
  } else if (industryType === 'fisheries') {
    resources.push('marine_safety_equipment', 'tidal_weather_monitoring');
  } else if (industryType === 'food_processing') {
    resources.push('food_safety_coordinator', 'quality_control_integration');
  } else if (industryType === 'tourism') {
    resources.push('guest_safety_coordinator', 'hospitality_operation_integration');
  }
  
  // Add island-specific resources
  resources.push('volunteer_emergency_service_coordination', 'mainland_specialist_backup');
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasPEIClassification = permitData.spaceDetails?.regulatoryClassification?.includes('pei_ohs');
  
  return {
    standardId: 'PEI_OHS_9_1',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasPEIClassification ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasPEIClassification ? [] : ['Missing PEI OHS classification'])
    ],
    priority: 'critical'
  };
}

function checkIslandHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasSeasonalFactors = permitData.hazardAssessment?.seasonalFactors !== undefined;
  const hasIslandChallenges = permitData.hazardAssessment?.islandChallenges !== undefined;
  const hasIndustrySpecificAssessment = industryType ? 
    permitData.hazardAssessment?.industrySpecific?.[industryType] !== undefined : true;
  
  return {
    standardId: 'PEI_OHS_9_3',
    requirementId: 'island_hazard_assessment',
    status: hasAssessment && hasSeasonalFactors && hasIslandChallenges && hasIndustrySpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasSeasonalFactors ? [] : ['Missing seasonal factors assessment']),
      ...(hasIslandChallenges ? [] : ['Missing island-specific challenges assessment']),
      ...(hasIndustrySpecificAssessment ? [] : [`Missing ${industryType} industry-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkIslandAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'PEI_OHS_9_6',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getPEIStandardsForIndustry(industryType);
  const hasSeasonalConsiderations = atmosphericReadings.some(r => r.seasonalFactors !== undefined);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isPEIReadingCompliant(reading, standards);
  });

  return {
    standardId: 'PEI_OHS_9_6',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasSeasonalConsiderations ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for ${industryType || 'general'} operations`
      ),
      ...(hasSeasonalConsiderations ? [] : ['Missing seasonal considerations in testing'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkIslandEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasEmergencyCoordination = permitData.entryPermit?.emergencyCoordination !== undefined;
  const hasSeasonalCoordination = permitData.entryPermit?.seasonalCoordination !== undefined;
  
  return {
    standardId: 'PEI_OHS_9_9',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasEmergencyCoordination && hasSeasonalCoordination ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasEmergencyCoordination ? [] : ['Missing island emergency coordination']),
      ...(hasSeasonalCoordination ? [] : ['Missing seasonal operation coordination'])
    ],
    priority: 'critical'
  };
}

function checkIslandAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasPEITraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasPEISpecificTraining(p, industryType));
  const hasBackupCommunication = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'backup_communication_systems'));
  
  return {
    standardId: 'PEI_OHS_9_12',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasPEITraining && hasBackupCommunication ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasPEITraining ? [] : [`Attendant lacks PEI ${industryType} training`]),
      ...(hasBackupCommunication ? [] : ['Missing backup communication systems capability'])
    ],
    priority: 'critical'
  };
}

function getPEIStandardsForIndustry(industryType?: string) {
  const baseStandards = PEI_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'agriculture') {
    return { ...baseStandards, ...baseStandards.agricultureSpecific };
  }
  
  if (industryType === 'fisheries') {
    return { ...baseStandards, ...baseStandards.fisheriesSpecific };
  }
  
  if (industryType === 'food_processing') {
    return { ...baseStandards, ...baseStandards.foodProcessingSpecific };
  }
  
  if (industryType === 'tourism') {
    return { ...baseStandards, ...baseStandards.tourismSpecific };
  }
  
  return baseStandards;
}

function isPEIReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasPEISpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  const requiredTraining = {
    agriculture: ['farm_safety_training', 'seasonal_worker_coordination'],
    fisheries: ['marine_safety_training', 'tidal_weather_awareness'],
    food_processing: ['food_safety_training', 'quality_control_integration'],
    tourism: ['hospitality_safety_training', 'guest_safety_coordination']
  };
  
  const peiBaseline = ['wcb_pei_training', 'island_emergency_procedures', 'backup_communication'];
  const industrySpecific = industryType ? requiredTraining[industryType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...peiBaseline, ...industrySpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WCB_PEI_AUTHORITY,
  PEI_SPECIFIC_FEATURES,
  PEI_REGULATION_STANDARDS,
  PEI_ATMOSPHERIC_STANDARDS,
  PEI_PERSONNEL_QUALIFICATIONS,
  PEI_EMERGENCY_SERVICES,
  checkPEICompliance
};

export type PEIIndustryType = 'agriculture' | 'fisheries' | 'food_processing' | 'tourism' | 'general';
export type PEIRegulationStandardId = keyof typeof PEI_REGULATION_STANDARDS;
export type PEIPersonnelQualificationId = keyof typeof PEI_PERSONNEL_QUALIFICATIONS;
