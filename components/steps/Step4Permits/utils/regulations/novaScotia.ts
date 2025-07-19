/**
 * Nova Scotia Workers' Compensation Board (WCB Nova Scotia)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Nova Scotia Occupational Health and Safety Act and General Regulations
 * Part 12: Confined Spaces (Sections 12.1-12.20)
 * 
 * Provincial Focus: Maritime operations, offshore oil & gas, fisheries, forestry, shipbuilding
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

// =================== NOVA SCOTIA AUTHORITY ===================

export const WCB_NS_AUTHORITY = {
  name: 'Workers\' Compensation Board of Nova Scotia',
  acronym: 'WCB Nova Scotia',
  jurisdiction: ['NS'] as const,
  website: 'https://www.wcb.ns.ca',
  contactInfo: {
    phone: '1-800-870-3331',              // Ligne principale WCB NS
    preventionPhone: '902-491-8999',       // Services prévention
    email: 'prevention@wcb.ns.ca',
    address: '5668 South Street, Halifax, NS B3J 2A4'
  },
  regionalOffices: [
    { region: 'Halifax', phone: '902-491-8999', coverage: 'Central NS, Halifax Regional Municipality' },
    { region: 'Sydney', phone: '902-563-2444', coverage: 'Cape Breton, Industrial Cape Breton' },
    { region: 'Kentville', phone: '902-679-6500', coverage: 'Annapolis Valley, Western NS' },
    { region: 'Truro', phone: '902-893-7281', coverage: 'Northern NS, Cumberland County' },
    { region: 'Yarmouth', phone: '902-742-7705', coverage: 'Southwestern NS, Fishing Industry' }
  ],
  languages: ['en', 'fr'] as const,        // English primary, French services available
  specializedUnits: [
    'offshore_safety_division',             // Division sécurité offshore
    'maritime_safety_unit',                 // Unité sécurité maritime
    'forestry_safety_program',              // Programme sécurité forestière
    'fisheries_safety_initiative'           // Initiative sécurité pêches
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties',
    'Prosecutions under provincial law'
  ]
} as const;

// =================== NS SPECIFIC FEATURES ===================

export const NS_SPECIFIC_FEATURES = {
  maritimeOperations: [
    'shipbuilding_irving_shipyard',        // Chantier naval Irving
    'port_operations_halifax_sydney',
    'marine_vessel_maintenance_repair',
    'offshore_supply_vessel_operations',
    'coast_guard_vessel_maintenance'
  ],
  offshoreOperations: [
    'sable_offshore_energy_project',       // Projet Sable Offshore
    'deep_panuke_offshore_platform',
    'offshore_exploration_drilling',
    'subsea_pipeline_operations',
    'offshore_platform_maintenance'
  ],
  fisheriesOperations: [
    'lobster_processing_facilities',
    'scallop_fishing_vessel_operations',
    'fish_processing_plants_lunenburg',
    'aquaculture_salmon_farming',
    'shellfish_harvesting_operations'
  ],
  forestryOperations: [
    'pulp_mill_operations_northern_ns',
    'sawmill_operations_throughout_province',
    'biomass_processing_facilities',
    'wood_chip_storage_handling',
    'forest_harvesting_equipment'
  ],
  tidalInfluences: [
    'bay_of_fundy_extreme_tides',          // Marées extrêmes Baie de Fundy
    'tidal_power_generation_facilities',
    'marine_confined_space_timing',
    'tidal_access_considerations'
  ],
  weatherChallenges: [
    'maritime_fog_conditions',
    'hurricane_storm_surge_impacts',
    'winter_ice_formation',
    'coastal_wind_exposure'
  ],
  regulatoryIntegration: [
    'canada_nova_scotia_offshore_petroleum_board', // CNSOPB
    'transport_canada_marine_safety',
    'fisheries_oceans_canada_integration',
    'environment_climate_change_canada'
  ]
} as const;

// =================== NS REGULATION STANDARDS ===================

export const NS_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'NS_OHS_12_1': {
    id: 'NS_OHS_12_1',
    title: { 
      en: 'Confined Space Definition and Maritime Applications', 
      fr: 'Définition d\'Espace Clos et Applications Maritimes' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    section: '12.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes marine vessels, offshore platforms, and coastal facilities'  // NS specific
    ],
    nsSpecific: {
      maritimeDefinitions: [
        'ship_holds_and_cargo_compartments',
        'ballast_tanks_and_void_spaces',
        'engine_rooms_and_machinery_spaces',
        'shipyard_construction_confined_spaces'
      ],
      offshoreDefinitions: [
        'offshore_platform_confined_areas',
        'subsea_equipment_chambers',
        'drilling_mud_tanks_and_pits',
        'pipeline_pig_traps_and_launchers'
      ],
      fisheriesDefinitions: [
        'fish_hold_compartments',
        'processing_vessel_tanks',
        'refrigeration_machinery_spaces',
        'lobster_trap_storage_areas'
      ],
      forestryDefinitions: [
        'pulp_digesters_and_recovery_boilers',
        'chip_storage_silos',
        'chemical_storage_vessels',
        'biomass_processing_equipment'
      ]
    },
    penalties: {
      individual: { min: 500, max: 100000 },   // 2023 amounts
      corporation: { min: 5000, max: 1000000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Nova Scotia Occupational Health and Safety General Regulations',
        citation: 'NS Reg. 52/2013',
        url: 'https://novascotia.ca/just/regulations/regs/ohsgen.htm'
      }
    ]
  },

  'NS_OHS_12_3': {
    id: 'NS_OHS_12_3',
    title: { 
      en: 'Hazard Assessment for Maritime and Offshore Operations', 
      fr: 'Évaluation des Dangers pour Opérations Maritimes et Offshore' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    section: '12.3',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Identification of all potential hazards including maritime-specific',
      'Assessment of atmospheric, physical, and environmental hazards',
      'Evaluation of access routes and emergency evacuation',
      'Consideration of tidal influences and weather conditions'
    ],
    nsSpecific: {
      maritimeHazards: {
        tidalInfluences: 'bay_of_fundy_extreme_tide_considerations',
        vesselMovement: 'ship_motion_and_stability_factors',
        marineEnvironment: 'saltwater_corrosion_and_moisture',
        weatherDependency: 'maritime_fog_storm_conditions'
      },
      offshoreHazards: {
        platformOperations: 'offshore_platform_weather_limitations',
        helicopterAccess: 'emergency_evacuation_weather_dependency',
        subsea: 'underwater_equipment_access_challenges',
        pressureHazards: 'pressure_vessel_and_pipeline_operations'
      },
      fisheriesHazards: {
        vesselOperations: 'fishing_vessel_stability_and_motion',
        processingHazards: 'fish_processing_biological_chemical',
        refrigerationSystems: 'ammonia_and_refrigerant_hazards',
        seasonalFactors: 'fishing_season_weather_limitations'
      },
      forestryHazards: {
        pulpMillOperations: 'kraft_process_chemical_hazards',
        biomassProcessing: 'combustible_dust_explosion_risk',
        chemicalStorage: 'pulp_bleaching_chemical_exposure',
        equipmentHazards: 'large_machinery_entanglement_risks'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'maritime_safety_specialist'],
      responsibilities: ['employer', 'competent_person', 'safety_committee', 'vessel_captain']
    }
  },

  'NS_OHS_12_6': {
    id: 'NS_OHS_12_6',
    title: { 
      en: 'Atmospheric Testing for Maritime Environments', 
      fr: 'Tests Atmosphériques pour Environnements Maritimes' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    section: '12.6',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of intrinsically safe equipment in marine environments',
      'Documentation with consideration of environmental conditions'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    nsSpecific: {
      maritimeTesting: {
        additionalGases: ['benzene_fuel_vapors', 'inert_gas_systems', 'cargo_tank_vapors'],
        saltwater: 'corrosion_resistant_equipment_requirements',
        vesselMotion: 'motion_compensated_testing_procedures',
        tidalFactors: 'testing_timing_with_tide_cycles'
      },
      offshoreTesting: {
        petroleumGases: ['hydrogen_sulfide_sour_gas', 'methane_natural_gas', 'drilling_mud_vapors'],
        pressureFactors: 'depth_pressure_compensation_requirements',
        intrinsicSafety: 'explosion_proof_equipment_classification',
        weatherLimitations: 'testing_postponement_severe_weather'
      },
      fisheriesTesting: {
        biologicalHazards: 'decomposition_gas_monitoring',
        refrigerationGases: ['ammonia_leakage', 'carbon_dioxide_systems'],
        vesselSafety: 'testing_during_vessel_operations'
      },
      forestryTesting: {
        pulpMillGases: ['chlorine_dioxide', 'sulfur_compounds', 'methanol_vapors'],
        biomassGases: 'combustible_dust_atmosphere_monitoring',
        ventilationAssessment: 'mill_ventilation_system_effectiveness'
      }
    }
  },

  'NS_OHS_12_10': {
    id: 'NS_OHS_12_10',
    title: { 
      en: 'Entry Permit System for Marine and Offshore Operations', 
      fr: 'Système de Permis d\'Entrée pour Opérations Marines et Offshore' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    section: '12.10',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of safety measures and marine procedures',
      'Weather and sea state limitations',
      'Coordination with vessel operations and offshore activities'
    ],
    nsSpecific: {
      maritimePermits: {
        vesselOperations: 'captain_authorization_vessel_safety_status',
        tidalCoordination: 'permit_timing_with_tide_tables',
        weatherLimitations: 'sea_state_wind_fog_visibility_limits',
        portAuthority: 'halifax_sydney_port_authority_coordination'
      },
      offshorePermits: {
        platformOperations: 'offshore_installation_manager_approval',
        helicopterAccess: 'weather_limits_evacuation_capability',
        cnsopbCompliance: 'canada_nova_scotia_offshore_board_requirements',
        emergencyResponse: 'coast_guard_search_rescue_coordination'
      },
      fisheriesPermits: {
        vesselOperations: 'fishing_vessel_captain_approval',
        seasonalFactors: 'fishing_season_weather_considerations',
        processingCoordination: 'fish_plant_operations_coordination'
      },
      forestryPermits: {
        millOperations: 'pulp_mill_process_coordination',
        chemicalSafety: 'kraft_process_chemical_isolation_procedures',
        emergencyResponse: 'mill_emergency_response_team_notification'
      }
    }
  },

  'NS_OHS_12_15': {
    id: 'NS_OHS_12_15',
    title: { 
      en: 'Attendant and Communication for Maritime Operations', 
      fr: 'Surveillant et Communication pour Opérations Maritimes' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    section: '12.15',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Reliable marine communication systems',
      'Monitoring of weather and sea conditions',
      'Emergency response coordination capability',
      'Understanding of maritime emergency procedures'
    ],
    nsSpecific: {
      maritimeAttendant: {
        communicationSystems: 'vhf_radio_satellite_communication_backup',
        weatherMonitoring: 'continuous_weather_sea_state_assessment',
        vesselCoordination: 'bridge_communication_vessel_operations',
        emergencyEvacuation: 'coast_guard_search_rescue_procedures'
      },
      offshoreAttendant: {
        platformSystems: 'offshore_platform_communication_integration',
        helicopterCoordination: 'helicopter_evacuation_weather_limits',
        emergencyResponse: 'offshore_emergency_response_team_coordination',
        cnsopbProtocols: 'offshore_safety_regulatory_compliance'
      },
      fisheriesAttendant: {
        vesselSafety: 'fishing_vessel_safety_procedures_knowledge',
        marineRadio: 'maritime_emergency_communication_protocols',
        seasonalAwareness: 'fishing_season_safety_considerations'
      },
      forestryAttendant: {
        millOperations: 'pulp_mill_emergency_response_integration',
        chemicalAwareness: 'kraft_process_chemical_emergency_procedures',
        processCoordination: 'mill_process_shutdown_procedures'
      }
    }
  }
};

// =================== NS ATMOSPHERIC STANDARDS ===================

export const NS_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // NS Maritime Industry Specific
  maritimeSpecific: {
    benzene_fuel: { max: 1, unit: 'ppm' },              // Marine fuel operations
    inert_gas_oxygen: { min: 5, max: 8, unit: '%' },    // Cargo tank inerting
    cargo_vapors: 'per_material_safety_data_sheet',
    ballast_gases: 'continuous_monitoring_required'
  },
  
  // NS Offshore Industry Specific  
  offshoreSpecific: {
    hydrogen_sulfide_sour: { max: 5, unit: 'ppm' },     // Sour gas offshore
    methane_natural_gas: { max: 1, unit: '%' },         // Natural gas operations
    drilling_mud_gases: 'per_drilling_program_requirements',
    petroleum_vapors: { max: 100, unit: 'mg/m³' }       // Petroleum processing
  },
  
  // NS Fisheries Industry Specific
  fisheriesSpecific: {
    ammonia_refrigeration: { max: 25, unit: 'ppm' },    // Fish processing refrigeration
    carbon_dioxide_ref: { max: 5000, unit: 'ppm' },     // CO2 refrigeration systems
    decomposition_gases: 'continuous_biological_monitoring',
    fish_hold_atmosphere: 'oxygen_depletion_monitoring'
  },
  
  // NS Forestry Industry Specific
  forestrySpecific: {
    chlorine_dioxide: { max: 0.1, unit: 'ppm' },        // Pulp bleaching
    sulfur_dioxide: { max: 2, unit: 'ppm' },            // Kraft process
    methanol: { max: 200, unit: 'ppm' },                // Pulp mill operations
    wood_dust: { max: 1, unit: 'mg/m³' },               // Respirable wood dust
    turpentine: { max: 100, unit: 'ppm' }               // Wood processing vapors
  }
} as const;

// =================== NS PERSONNEL QUALIFICATIONS ===================

export const NS_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'ns_competent_person',
    title: { 
      en: 'Competent Person - Maritime Confined Space', 
      fr: 'Personne Compétente - Espace Clos Maritime' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with NS OHS Act and Regulations',
      'Understanding of maritime and offshore safety requirements',
      'Ability to coordinate with marine operations',
      'Knowledge of Nova Scotia emergency response systems'
    ],
    nsSpecific: {
      maritimeCompetency: {
        vesselOperations: 'commercial_vessel_safety_training',
        marineSafety: 'transport_canada_marine_safety_courses',
        tidalAwareness: 'bay_of_fundy_tide_dynamics_training'
      },
      offshoreCompetency: {
        certifications: ['basic_offshore_safety_induction', 'helicopter_underwater_escape'],
        cnsopbRequirements: 'canada_nova_scotia_offshore_board_compliance',
        emergencyResponse: 'offshore_emergency_response_coordination'
      },
      fisheriesCompetency: {
        vesselSafety: 'fishing_vessel_safety_regulations_training',
        processingPlants: 'fish_processing_facility_safety_procedures',
        seasonalOperations: 'fishing_season_safety_considerations'
      },
      forestryCompetency: {
        pulpMillOperations: 'kraft_process_safety_training',
        chemicalSafety: 'pulp_mill_chemical_handling_procedures',
        biomassProcessing: 'combustible_dust_explosion_prevention'
      }
    },
    certification: 'wcb_ns_approved_training_plus_industry_specific',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'wcb_ns_confined_space_competent_person',
      'maritime_safety_awareness',
      'emergency_response_coordination',
      'industry_specific_hazard_recognition'
    ]
  },

  attendant: {
    id: 'ns_attendant',
    title: { 
      en: 'Maritime Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Maritime' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    requirements: [
      'Training in attendant duties for maritime environments',
      'Knowledge of marine communication procedures',
      'Understanding of weather and sea condition monitoring',
      'Familiarity with maritime emergency procedures',
      'Marine first aid and emergency response training'
    ],
    nsSpecific: {
      maritimeAttendant: {
        marineCommunication: 'vhf_radio_operator_certification',
        weatherMonitoring: 'marine_weather_interpretation_training',
        vesselSafety: 'vessel_emergency_procedures_training',
        tidalAwareness: 'tide_table_reading_and_planning'
      },
      offshoreAttendant: {
        certifications: ['basic_offshore_safety_induction', 'offshore_medical_first_aid'],
        platformOperations: 'offshore_platform_emergency_procedures',
        helicopterSafety: 'helicopter_safety_and_evacuation_procedures'
      },
      fisheriesAttendant: {
        vesselOperations: 'fishing_vessel_safety_procedures',
        processingPlant: 'fish_processing_emergency_procedures',
        marineSafety: 'marine_emergency_duties_training'
      },
      forestryAttendant: {
        millOperations: 'pulp_mill_emergency_response_procedures',
        chemicalSafety: 'chemical_spill_emergency_response',
        processAwareness: 'kraft_process_safety_procedures'
      }
    },
    certification: 'wcb_ns_approved_attendant_training_plus_marine_certification',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'ns_atmospheric_tester',
    title: { 
      en: 'Maritime Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Maritime' 
    },
    authority: 'WCB Nova Scotia',
    jurisdiction: ['NS'],
    requirements: [
      'Training on marine-rated gas detection equipment',
      'Knowledge of NS atmospheric standards and maritime adjustments',
      'Understanding of intrinsically safe equipment requirements',
      'Ability to perform testing in challenging marine conditions',
      'Knowledge of industry-specific atmospheric hazards'
    ],
    nsSpecific: {
      maritimeTesting: {
        intrinsicSafety: 'intrinsically_safe_equipment_operation_certification',
        marineEnvironment: 'saltwater_corrosion_equipment_protection',
        vesselTesting: 'shipboard_atmospheric_testing_procedures'
      },
      offshoreTesting: {
        petroleumIndustry: 'oil_gas_atmospheric_hazard_detection',
        pressureCompensation: 'depth_pressure_atmospheric_adjustment',
        explosionProof: 'explosion_proof_equipment_certification'
      },
      fisheriesTesting: {
        biologicalHazards: 'fish_decomposition_gas_detection',
        refrigerationSystems: 'ammonia_co2_detection_procedures',
        vesselOperations: 'fishing_vessel_atmospheric_monitoring'
      },
      forestryTesting: {
        pulpMillTesting: 'kraft_process_chemical_detection_training',
        combustibleDust: 'biomass_dust_atmosphere_monitoring',
        ventilationAssessment: 'mill_ventilation_effectiveness_evaluation'
      }
    },
    certification: 'equipment_manufacturer_plus_marine_industry_training',
    validity: 'annual_recertification_with_equipment_updates'
  }
};

// =================== NS EMERGENCY SERVICES ===================

export const NS_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wcbNS: '1-800-870-3331'
  },
  
  maritime: {
    coastGuard: '1-800-565-1582',            // Maritime Rescue Sub-Centre Halifax
    marineEmergency: 'VHF Channel 16',        // International distress frequency
    portAuthorities: {
      halifax: '902-426-8222',               // Halifax Port Authority
      sydney: '902-564-7575',                // Sydney Port Corporation
      yarmouth: '902-742-6635'               // Port of Yarmouth
    },
    marineRescue: 'canadian_coast_guard_auxiliary_nova_scotia'
  },
  
  offshore: {
    cnsopb: '902-422-5588',                  // Canada-Nova Scotia Offshore Petroleum Board
    offshoreEmergency: '1-800-565-1633',     // Offshore emergency 24/7
    helicopterServices: {
      chc: '902-873-3500',                   // CHC Helicopter - Halifax
      exxonMobil: '902-420-4000'            // ExxonMobil helicopter operations
    },
    platformEmergency: 'platform_specific_emergency_numbers'
  },
  
  fisheries: {
    fisheriesSafety: '902-424-7773',         // NS Fisheries and Aquaculture Safety
    marineEmergency: '1-800-565-1582',       // Coast Guard Marine Communications
    fishingVesselSafety: '902-424-2522',     // Transport Canada Marine Safety
    aquacultureEmergency: '902-424-4560'    // Aquaculture Emergency Response
  },
  
  forestry: {
    forestryEmergency: '1-800-565-2224',     // NS Department of Lands and Forestry
    pulpMillEmergency: {
      northernPulp: '902-752-8927',          // Northern Pulp Nova Scotia
      portHawkesbury: '902-625-3400'        // Port Hawkesbury Paper
    },
    forestFireEmergency: '1-800-565-2224',   // Forest fire emergency
    sawmillAssociation: '902-429-4255'      // Forest Nova Scotia
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    marineRescue: 'coast_guard_search_rescue_halifax',
    offshoreEvacuation: 'chc_helicopter_search_rescue',
    industrialRescue: 'halifax_regional_fire_technical_rescue'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkNSCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'maritime' | 'offshore' | 'fisheries' | 'forestry' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(NS_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(NS_REGULATION_STANDARDS).forEach(standard => {
    const check = performNSStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'NS',
    overallCompliance,
    results,
    criticalNonCompliance,
    nsSpecific: {
      industryType: industryType || 'general',
      maritimeConsiderations: industryType === 'maritime' ? getMaritimeConsiderations() : undefined,
      offshoreConsiderations: industryType === 'offshore' ? getOffshoreConsiderations() : undefined,
      fisheriesConsiderations: industryType === 'fisheries' ? getFisheriesConsiderations() : undefined,
      forestryConsiderations: industryType === 'forestry' ? getForestryConsiderations() : undefined,
      emergencyServices: getNSEmergencyServices(industryType),
      weatherFactors: getNSWeatherFactors(industryType),
      tidalInfluences: getTidalInfluences(),
      regulatoryIntegration: getNSRegulatoryIntegration(industryType)
    },
    actionPlan: generateNSActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performNSStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'NS_OHS_12_1':
      return checkConfinedSpaceIdentification(permitData);
    case 'NS_OHS_12_3':
      return checkMaritimeHazardAssessment(permitData, industryType);
    case 'NS_OHS_12_6':
      return checkMaritimeAtmosphericTesting(atmosphericReadings, industryType);
    case 'NS_OHS_12_10':
      return checkMaritimeEntryPermitSystem(permitData, industryType);
    case 'NS_OHS_12_15':
      return checkMaritimeAttendantRequirements(personnel, industryType);
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

function getMaritimeConsiderations() {
  return {
    tidalInfluences: 'bay_of_fundy_extreme_tide_coordination',
    vesselOperations: 'shipyard_vessel_safety_integration',
    weatherDependency: 'maritime_fog_storm_limitations',
    emergencyAccess: 'coast_guard_search_rescue_coordination',
    specializedEquipment: 'intrinsically_safe_marine_equipment'
  };
}

function getOffshoreConsiderations() {
  return {
    weatherLimitations: 'offshore_platform_weather_evacuation_limits',
    regulatoryOversight: 'canada_nova_scotia_offshore_petroleum_board',
    emergencyEvacuation: 'helicopter_boat_evacuation_procedures',
    communicationSystems: 'offshore_satellite_communication_requirements',
    specializedTraining: 'offshore_safety_certification_requirements'
  };
}

function getFisheriesConsiderations() {
  return {
    seasonalOperations: 'fishing_season_weather_safety_considerations',
    vesselSafety: 'fishing_vessel_stability_motion_factors',
    processingHazards: 'fish_processing_biological_chemical_risks',
    refrigerationSystems: 'ammonia_co2_refrigeration_safety',
    marineEnvironment: 'saltwater_equipment_corrosion_protection'
  };
}

function getForestryConsiderations() {
  return {
    pulpMillOperations: 'kraft_process_chemical_safety_procedures',
    biomassProcessing: 'combustible_dust_explosion_prevention',
    chemicalHandling: 'pulp_bleaching_chemical_safety_protocols',
    emergencyResponse: 'mill_emergency_response_team_integration',
    ventilationSystems: 'mill_ventilation_effectiveness_monitoring'
  };
}

function getNSEmergencyServices(industryType?: string) {
  const base = NS_EMERGENCY_SERVICES.general;
  
  if (industryType === 'maritime') {
    return { ...base, ...NS_EMERGENCY_SERVICES.maritime };
  }
  
  if (industryType === 'offshore') {
    return { ...base, ...NS_EMERGENCY_SERVICES.offshore };
  }
  
  if (industryType === 'fisheries') {
    return { ...base, ...NS_EMERGENCY_SERVICES.fisheries };
  }
  
  if (industryType === 'forestry') {
    return { ...base, ...NS_EMERGENCY_SERVICES.forestry };
  }
  
  return base;
}

function getNSWeatherFactors(industryType?: string) {
  const baseFactors = ['temperature', 'precipitation', 'wind', 'visibility'];
  
  if (industryType === 'maritime' || industryType === 'offshore' || industryType === 'fisheries') {
    return [...baseFactors, 'sea_state', 'fog', 'tides', 'storm_surge'];
  }
  
  return baseFactors;
}

function getTidalInfluences() {
  return {
    bayOfFundy: 'extreme_tidal_range_up_to_16_meters',
    tidalTiming: 'confined_space_entry_tide_coordination',
    accessLimitations: 'tide_dependent_facility_access',
    emergencyEvacuation: 'tide_evacuation_route_planning'
  };
}

function getNSRegulatoryIntegration(industryType?: string) {
  const base = ['wcb_nova_scotia', 'nova_scotia_environment'];
  
  if (industryType === 'offshore') {
    return [...base, 'cnsopb', 'transport_canada', 'environment_climate_change'];
  }
  
  if (industryType === 'maritime' || industryType === 'fisheries') {
    return [...base, 'transport_canada_marine', 'fisheries_oceans_canada'];
  }
  
  if (industryType === 'forestry') {
    return [...base, 'natural_resources_canada', 'nova_scotia_lands_forestry'];
  }
  
  return base;
}

function generateNSActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getNSCorrectiveAction(result.requirementId, industryType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getNSRequiredResources(result.requirementId, industryType),
    verification: 'wcb_ns_inspector_verification'
  }));
}

function getNSCorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${industryType || 'Nova Scotia'} operations with maritime considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'Nouvelle-Écosse'} avec considérations maritimes`
    },
    maritime_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including maritime and weather conditions for ${industryType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant conditions maritimes et météorologiques pour opérations ${industryType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with marine-rated equipment and ${industryType || 'general'} industry standards`,
      fr: `Effectuer tests atmosphériques avec équipement maritime et standards industrie ${industryType || 'générale'}`
    },
    entry_permit: {
      en: `Implement entry permit system with maritime conditions and ${industryType || 'general'} industry requirements`,
      fr: `Implémenter système permis d'entrée avec conditions maritimes et exigences industrie ${industryType || 'générale'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with maritime training and ${industryType || 'general'} industry experience`,
      fr: `Assigner surveillant qualifié avec formation maritime et expérience industrie ${industryType || 'générale'}`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WCB Nova Scotia requirements',
    fr: 'Traiter non-conformité identifiée selon exigences WCB Nouvelle-Écosse'
  };
}

function getNSRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_person', 'maritime_safety_specialist'],
    maritime_hazard_assessment: ['competent_person', 'weather_monitoring_equipment'],
    atmospheric_testing: ['intrinsically_safe_detectors', 'marine_rated_equipment'],
    entry_permit: ['permit_forms', 'marine_communication_equipment'],
    attendant_present: ['trained_attendant', 'vhf_radio_communication']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add industry-specific resources
  if (industryType === 'offshore') {
    resources.push('offshore_safety_equipment', 'helicopter_evacuation_procedures');
  } else if (industryType === 'maritime') {
    resources.push('vessel_safety_equipment', 'tide_monitoring_systems');
  } else if (industryType === 'fisheries') {
    resources.push('fishing_vessel_safety_equipment', 'marine_emergency_procedures');
  } else if (industryType === 'forestry') {
    resources.push('mill_emergency_response_team', 'chemical_safety_equipment');
  }
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasMaritimeConsiderations = permitData.spaceDetails?.environmentalFactors?.includes('maritime_environment');
  
  return {
    standardId: 'NS_OHS_12_1',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasMaritimeConsiderations ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasMaritimeConsiderations ? [] : ['Missing maritime environmental considerations'])
    ],
    priority: 'critical'
  };
}

function checkMaritimeHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasMaritimeHazards = permitData.hazardAssessment?.environmentalHazards?.some(h => 
    ['tidal_influences', 'weather_dependency', 'marine_environment'].includes(h)
  );
  const hasIndustrySpecificAssessment = industryType ? 
    permitData.hazardAssessment?.industrySpecific?.[industryType] !== undefined : true;
  
  return {
    standardId: 'NS_OHS_12_3',
    requirementId: 'maritime_hazard_assessment',
    status: hasAssessment && hasMaritimeHazards && hasIndustrySpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasMaritimeHazards ? [] : ['Missing maritime environmental hazard assessment']),
      ...(hasIndustrySpecificAssessment ? [] : [`Missing ${industryType} industry-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkMaritimeAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'NS_OHS_12_6',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getNSStandardsForIndustry(industryType);
  const hasIntrinsicSafetyRating = atmosphericReadings.some(r => r.equipmentRating?.includes('intrinsically_safe'));
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isNSReadingCompliant(reading, standards);
  });

  return {
    standardId: 'NS_OHS_12_6',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasIntrinsicSafetyRating ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for ${industryType || 'general'} operations`
      ),
      ...(hasIntrinsicSafetyRating ? [] : ['Missing intrinsically safe equipment rating for marine environment'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkMaritimeEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWeatherLimitations = permitData.entryPermit?.weatherLimitations !== undefined;
  const hasMaritimeCoordination = permitData.entryPermit?.maritimeCoordination !== undefined;
  
  return {
    standardId: 'NS_OHS_12_10',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWeatherLimitations && hasMaritimeCoordination ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasWeatherLimitations ? [] : ['Missing weather and sea state limitations']),
      ...(hasMaritimeCoordination ? [] : ['Missing maritime operations coordination'])
    ],
    priority: 'critical'
  };
}

function checkMaritimeAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasMaritimeTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasMaritimeSpecificTraining(p, industryType));
  const hasMarineCommunication = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'vhf_radio_operator'));
  
  return {
    standardId: 'NS_OHS_12_15',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasMaritimeTraining && hasMarineCommunication ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasMaritimeTraining ? [] : [`Attendant lacks ${industryType} maritime training`]),
      ...(hasMarineCommunication ? [] : ['Attendant lacks marine communication certification'])
    ],
    priority: 'critical'
  };
}

function getNSStandardsForIndustry(industryType?: string) {
  const baseStandards = NS_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'maritime') {
    return { ...baseStandards, ...baseStandards.maritimeSpecific };
  }
  
  if (industryType === 'offshore') {
    return { ...baseStandards, ...baseStandards.offshoreSpecific };
  }
  
  if (industryType === 'fisheries') {
    return { ...baseStandards, ...baseStandards.fisheriesSpecific };
  }
  
  if (industryType === 'forestry') {
    return { ...baseStandards, ...baseStandards.forestrySpecific };
  }
  
  return baseStandards;
}

function isNSReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasMaritimeSpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  const requiredTraining = {
    maritime: ['vessel_safety_training', 'marine_emergency_procedures'],
    offshore: ['basic_offshore_safety_induction', 'helicopter_underwater_escape'],
    fisheries: ['fishing_vessel_safety', 'marine_emergency_duties'],
    forestry: ['pulp_mill_emergency_procedures', 'chemical_safety_training']
  };
  
  const maritimeBaseline = ['vhf_radio_operator', 'marine_first_aid'];
  const industrySpecific = industryType ? requiredTraining[industryType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...maritimeBaseline, ...industrySpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WCB_NS_AUTHORITY,
  NS_SPECIFIC_FEATURES,
  NS_REGULATION_STANDARDS,
  NS_ATMOSPHERIC_STANDARDS,
  NS_PERSONNEL_QUALIFICATIONS,
  NS_EMERGENCY_SERVICES,
  checkNSCompliance
};

export type NSIndustryType = 'maritime' | 'offshore' | 'fisheries' | 'forestry' | 'general';
export type NSRegulationStandardId = keyof typeof NS_REGULATION_STANDARDS;
export type NSPersonnelQualificationId = keyof typeof NS_PERSONNEL_QUALIFICATIONS;
