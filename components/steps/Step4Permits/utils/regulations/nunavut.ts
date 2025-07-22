/**
 * Nunavut Workers' Safety and Compensation Commission (WSCC)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Nunavut Safety Act and General Safety Regulations
 * Part 8: Confined Spaces (Sections 8.1-8.25)
 * 
 * Territorial Focus: Arctic operations, mining, remote Inuit communities, extreme weather
 */
"use client";

// Types définis localement pour éviter les dépendances manquantes
export interface BilingualText {
  fr: string;
  en: string;
  iu?: string; // Inuktitut pour Nunavut
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
  nuSpecific?: Record<string, any>;
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
  nuSpecific?: Record<string, any>;
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
  temperatureCompensation?: boolean;
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
  nuSpecific?: Record<string, any>;
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

// =================== NUNAVUT AUTHORITY ===================

export const WSCC_NU_AUTHORITY = {
  name: 'Workers\' Safety and Compensation Commission of the Northwest Territories and Nunavut',
  acronym: 'WSCC',
  jurisdiction: ['NU'] as const,
  website: 'https://www.wscc.nt.ca',
  contactInfo: {
    phone: '1-800-661-0792',
    nunavutPhone: '867-979-8500',
    email: 'prevention@wscc.nt.ca',
    address: 'Qamutiq Building, 2nd Floor, 1120 Brown Street, Iqaluit, NU X0A 0H0'
  },
  regionalOffices: [
    { region: 'Iqaluit', phone: '867-979-8500', coverage: 'Baffin Region, Government Services' },
    { region: 'Rankin Inlet', phone: '867-645-8136', coverage: 'Kivalliq Region, Mining Operations' },
    { region: 'Cambridge Bay', phone: '867-983-4625', coverage: 'Kitikmeot Region, Arctic Operations' }
  ],
  languages: ['en', 'fr', 'iu'] as const,
  indigenousLanguages: [
    'inuktitut', 'inuinnaqtun', 'inuvialuktun'
  ],
  specializedUnits: [
    'arctic_mining_safety_division',
    'inuit_safety_program',
    'remote_arctic_operations_unit'
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties up to $1,000,000',
    'Prosecutions under territorial law'
  ]
};

// =================== NU SPECIFIC FEATURES ===================

export const NU_SPECIFIC_FEATURES = {
  arcticMining: [
    'baffinland_mary_river_iron_mine',
    'agnico_eagle_meadowbank_mine',
    'hope_bay_gold_mine_tmac',
    'back_river_gold_project',
    'diamond_exploration_projects'
  ],
  extremeArcticConditions: [
    'temperatures_below_minus_60_celsius',
    'polar_night_continuous_darkness',
    'midnight_sun_continuous_daylight',
    'extreme_wind_chill_factors',
    'ground_blizzard_whiteout_conditions'
  ],
  inuitCommunities: [
    'traditional_knowledge_integration',
    'inuktitut_safety_communication',
    'community_based_safety_programs',
    'elder_consultation_protocols',
    'cultural_safety_considerations'
  ],
  remoteOperations: [
    'fly_in_fly_out_arctic_operations',
    'ice_road_seasonal_access_only',
    'satellite_communication_dependency',
    'emergency_evacuation_weather_dependent',
    'supply_chain_seasonal_limitations'
  ],
  environmentalChallenges: [
    'permafrost_throughout_territory',
    'arctic_wildlife_polar_bear_encounters',
    'sea_ice_formation_timing',
    'tundra_ecosystem_protection',
    'traditional_hunting_fishing_areas'
  ],
  emergencyResponse: [
    'medevac_weather_dependent_evacuation',
    'volunteer_community_emergency_response',
    'search_rescue_joint_task_force_north',
    'satellite_emergency_beacon_dependency',
    'traditional_survival_skills_integration'
  ],
  regulatoryIntegration: [
    'nunavut_land_claims_agreement',
    'inuit_impact_benefit_agreements',
    'traditional_territory_protocols',
    'federal_territorial_jurisdiction_coordination',
    'environmental_assessment_nunavut_impact_review_board'
  ]
};

// =================== NU REGULATION STANDARDS ===================

export const NU_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'NU_GSR_8_1': {
    id: 'NU_GSR_8_1',
    title: { 
      en: 'Confined Space Definition for Arctic Operations', 
      fr: 'Définition d\'Espace Clos pour Opérations Arctiques',
      iu: 'Anerniqsaijuq Inuksugait Ukiulingnik Pijariit'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    section: '8.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has limited means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes arctic mining and remote community facilities'
    ],
    nuSpecific: {
      arcticMiningDefinitions: [
        'underground_mine_workings_permafrost',
        'ore_processing_vessels_extreme_cold',
        'mining_equipment_heated_enclosures',
        'concentrate_storage_facilities'
      ],
      communityFacilitiesDefinitions: [
        'community_fuel_storage_tanks',
        'water_treatment_plant_confined_spaces',
        'power_plant_generator_enclosures',
        'sewage_lagoon_pump_stations'
      ],
      arcticEnvironmentalConsiderations: [
        'permafrost_affected_structures',
        'extreme_cold_confined_spaces',
        'wind_chill_exposure_areas',
        'traditional_food_storage_areas'
      ]
    },
    penalties: {
      individual: { min: 1000, max: 300000 },
      corporation: { min: 10000, max: 2000000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Nunavut General Safety Regulations',
        citation: 'Nu Reg. 003-2015',
        url: 'https://www.canlii.org/en/nu/laws/regu/nu-reg-3-2015/latest/'
      }
    ]
  },

  'NU_GSR_8_4': {
    id: 'NU_GSR_8_4',
    title: { 
      en: 'Arctic Hazard Assessment and Traditional Knowledge', 
      fr: 'Évaluation des Dangers Arctiques et Savoirs Traditionnels',
      iu: 'Anernirnik Isumaqatigiit Inuit Qaujimajatuqangit'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    section: '8.4',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Integration of traditional Inuit knowledge where applicable',
      'Assessment of arctic environmental conditions',
      'Evaluation of emergency evacuation challenges',
      'Consideration of community and cultural factors'
    ],
    nuSpecific: {
      arcticEnvironmentalHazards: {
        extremeCold: 'hypothermia_frostbite_equipment_failure',
        permafrostInstability: 'ground_movement_structural_integrity',
        polarConditions: 'continuous_darkness_daylight_disorientation',
        wildlifeEncounters: 'polar_bear_arctic_fox_safety_protocols',
        weatherExtremes: 'blizzard_whiteout_wind_chill_conditions'
      },
      traditionalKnowledge: {
        inuitQaujimajatuqangit: 'traditional_knowledge_safety_integration',
        elderConsultation: 'community_elder_safety_wisdom',
        traditionalSurvival: 'arctic_survival_traditional_methods',
        culturalConsiderations: 'inuit_cultural_safety_practices',
        communityInvolvement: 'hamlet_safety_committee_participation'
      },
      miningHazards: {
        arcticMining: 'permafrost_mining_ground_conditions',
        remoteMining: 'isolation_extreme_weather_mining',
        transportationHazards: 'ice_road_seasonal_transport_risks',
        equipmentChallenges: 'extreme_cold_equipment_reliability'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'community_safety_representative', 'traditional_knowledge_holder'],
      responsibilities: ['employer', 'competent_person', 'hamlet_council', 'inuit_organization']
    }
  },

  'NU_GSR_8_8': {
    id: 'NU_GSR_8_8',
    title: { 
      en: 'Atmospheric Testing in Extreme Arctic Conditions', 
      fr: 'Tests Atmosphériques en Conditions Arctiques Extrêmes',
      iu: 'Anerniq Qimmisimajuq Ukiulingnik Anerniqsaijuq'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    section: '8.8',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of arctic-rated and cold-weather certified equipment',
      'Documentation with extreme temperature considerations'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    nuSpecific: {
      arcticTesting: {
        extremeColdEquipment: 'equipment_operation_minus_60_celsius',
        temperatureCompensation: 'manual_calibration_extreme_temperatures',
        batteryPerformance: 'cold_weather_battery_backup_systems',
        condensationPrevention: 'moisture_freeze_sensor_protection'
      },
      miningTesting: {
        undergroundArctic: ['methane_permafrost_deposits', 'radon_uranium_ore'],
        processingChemicals: ['cyanide_gold_processing', 'flotation_chemicals'],
        dieselEquipment: 'underground_diesel_exhaust_monitoring',
        ventilationChallenges: 'arctic_mine_ventilation_effectiveness'
      },
      communityTesting: {
        fuelStorage: 'heating_fuel_diesel_vapor_monitoring',
        wastewater: 'sewage_methane_hydrogen_sulfide',
        powerGeneration: 'generator_carbon_monoxide_monitoring',
        traditionalFoods: 'fermentation_storage_atmosphere_monitoring'
      }
    }
  },

  'NU_GSR_8_12': {
    id: 'NU_GSR_8_12',
    title: { 
      en: 'Entry Permit System for Remote Arctic Operations', 
      fr: 'Système de Permis d\'Entrée pour Opérations Arctiques Isolées',
      iu: 'Itijaujuq Papiit Sila Ukiulingnik Pijariit'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    section: '8.12',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of arctic safety measures',
      'Weather and emergency evacuation limitations',
      'Communication plan for remote locations'
    ],
    nuSpecific: {
      arcticPermits: {
        weatherLimitations: 'extreme_cold_wind_visibility_blizzard_limits',
        emergencyEvacuation: 'medevac_weather_dependent_accessibility',
        communicationProtocols: 'satellite_radio_backup_systems',
        seasonalRestrictions: 'polar_night_daylight_considerations'
      },
      miningPermits: {
        shiftCoordination: 'fly_in_fly_out_shift_arctic_coordination',
        undergroundAccess: 'permafrost_mine_access_stability',
        emergencyResponse: 'mine_rescue_team_arctic_response',
        transportationCoordination: 'ice_road_seasonal_access_planning'
      },
      communityCoordination: {
        hamletNotification: 'hamlet_council_safety_coordination',
        inuitOrganization: 'inuit_organization_traditional_territory_coordination',
        elderConsultation: 'community_elder_safety_protocol_consultation',
        culturalProtocols: 'inuit_cultural_safety_protocol_integration'
      }
    }
  },

  'NU_GSR_8_16': {
    id: 'NU_GSR_8_16',
    title: { 
      en: 'Attendant and Communication in Arctic Isolation', 
      fr: 'Surveillant et Communication en Isolement Arctique',
      iu: 'Saqijuq Uqausivut Ukiumi Alianaittuq'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    section: '8.16',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Multi-redundant communication systems',
      'Monitoring of extreme weather conditions',
      'Emergency response coordination in arctic conditions',
      'Understanding of traditional survival methods'
    ],
    nuSpecific: {
      arcticAttendant: {
        communicationSystems: 'satellite_radio_emergency_beacon_systems',
        weatherMonitoring: 'continuous_arctic_weather_monitoring',
        emergencyCoordination: 'joint_task_force_north_coordination',
        survivalSkills: 'arctic_survival_traditional_knowledge_training'
      },
      isolationFactors: {
        minimumTeamSize: 'minimum_three_person_arctic_safety_team',
        emergencyBackup: 'backup_attendant_extreme_isolation',
        medicalEmergency: 'wilderness_arctic_medical_response_training',
        communicationRedundancy: 'multiple_communication_system_backup'
      },
      inuitCulturalIntegration: {
        languageSupport: 'inuktitut_safety_communication_capability',
        culturalCompetency: 'inuit_cultural_safety_understanding',
        communityLiaison: 'hamlet_safety_representative_coordination',
        traditionalKnowledge: 'elder_traditional_knowledge_consultation'
      }
    }
  }
};

// =================== NU ATMOSPHERIC STANDARDS ===================

export const NU_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // NU Arctic Mining Specific
  arcticMiningSpecific: {
    methane_permafrost: { max: 0.5, unit: '%' },
    radon_uranium: { max: 0.1, unit: 'pCi/L' },
    diesel_exhaust_arctic: { max: 1.0, unit: 'mg/m³' },
    gold_processing_cyanide: { max: 4.7, unit: 'mg/m³' },
    flotation_chemicals: 'per_material_safety_data_sheet'
  },
  
  // NU Community Operations Specific  
  communityOperationsSpecific: {
    heating_fuel_vapors: { max: 100, unit: 'mg/m³' },
    sewage_methane: { max: 1000, unit: 'ppm' },
    generator_exhaust: { max: 25, unit: 'ppm' },
    traditional_food_gases: 'monitoring_required_fermentation'
  },
  
  // Arctic Specific Adjustments
  arcticConditions: {
    temperatureCompensation: 'readings_adjusted_extreme_cold',
    equipmentLimitations: 'sensor_accuracy_below_minus_40C',
    calibrationFrequency: 'daily_calibration_extreme_conditions',
    moistureCompensation: 'humidity_freeze_adjustment_factors'
  }
};

// =================== NU PERSONNEL QUALIFICATIONS ===================

export const NU_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'nu_competent_person',
    title: { 
      en: 'Competent Person - Arctic Confined Space', 
      fr: 'Personne Compétente - Espace Clos Arctique',
      iu: 'Ilisaijuq Inuk - Anerniqsaijuq Ukiumi'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with NU Safety Act and arctic regulations',
      'Understanding of extreme arctic environmental conditions',
      'Ability to integrate traditional Inuit knowledge',
      'Coordination with remote community emergency response'
    ],
    nuSpecific: {
      arcticConditions: {
        extremeColdOperations: 'arctic_survival_extreme_cold_training',
        permafrostAwareness: 'permafrost_ground_conditions_safety',
        polarConditions: 'continuous_darkness_daylight_adaptation',
        wildlifeSafety: 'polar_bear_arctic_wildlife_protocols'
      },
      miningCompetency: {
        certifications: ['arctic_mining_safety', 'underground_permafrost_operations'],
        experience: 'northern_mining_baffinland_agnico_experience',
        emergencyResponse: 'mine_rescue_arctic_conditions_coordination'
      },
      inuitCulturalCompetency: {
        languageSupport: 'inuktitut_basic_safety_communication',
        culturalTraining: 'inuit_cultural_safety_awareness',
        traditionalKnowledge: 'elder_consultation_traditional_knowledge_integration',
        communityEngagement: 'hamlet_community_safety_coordination'
      },
      remoteOperations: {
        communicationSystems: 'satellite_communication_arctic_emergency',
        survivalSkills: 'arctic_wilderness_survival_training',
        isolation: 'extreme_isolation_psychological_preparation',
        medicalResponse: 'wilderness_arctic_medical_emergency_response'
      }
    },
    certification: 'wscc_approved_arctic_specialization_training',
    validity: 'ongoing_with_annual_arctic_conditions_refresher',
    mandatoryTraining: [
      'wscc_confined_space_competent_person',
      'arctic_conditions_safety_training',
      'inuit_cultural_safety_awareness',
      'emergency_response_remote_arctic'
    ]
  },

  attendant: {
    id: 'nu_attendant',
    title: { 
      en: 'Arctic Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Arctique',
      iu: 'Saqijuq Anerniqsaijuq Ukiumi'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    requirements: [
      'Training in attendant duties for arctic conditions',
      'Knowledge of multi-redundant communication systems',
      'Understanding of arctic emergency evacuation procedures',
      'Familiarity with traditional survival methods',
      'Arctic wilderness first aid and emergency response'
    ],
    nuSpecific: {
      communicationSystems: {
        satelliteCommunication: 'satellite_radio_operation_arctic_training',
        emergencyBeacons: 'personal_locator_beacon_satellite_activation',
        weatherCommunication: 'communication_extreme_weather_conditions',
        traditionalSignaling: 'traditional_inuit_emergency_signaling_methods'
      },
      arcticOperations: {
        extremeWeather: 'blizzard_whiteout_emergency_procedures',
        survivalSkills: 'arctic_survival_traditional_modern_methods',
        medicalEmergency: 'arctic_wilderness_first_aid_certification',
        isolationFactors: 'psychological_support_extreme_isolation'
      },
      inuitCulturalSupport: {
        languageServices: 'inuktitut_emergency_communication',
        culturalSafety: 'inuit_cultural_safety_practices',
        communityLiaison: 'hamlet_community_safety_coordination',
        elderConsultation: 'traditional_knowledge_emergency_protocols'
      },
      environmentalAwareness: {
        wildlifeSafety: 'polar_bear_deterrent_safety_training',
        permafrostConditions: 'permafrost_ground_stability_awareness',
        weatherMonitoring: 'arctic_weather_pattern_recognition'
      }
    },
    certification: 'wscc_arctic_attendant_plus_cultural_competency',
    validity: 'annual_recertification_arctic_conditions'
  },

  atmospheric_tester: {
    id: 'nu_atmospheric_tester',
    title: { 
      en: 'Arctic Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Arctique',
      iu: 'Qimmisijiijuq Anerniq Ukiumi'
    },
    authority: 'WSCC',
    jurisdiction: ['NU'],
    requirements: [
      'Training on arctic-rated gas detection equipment',
      'Knowledge of extreme temperature compensation procedures',
      'Understanding of equipment limitations in arctic conditions',
      'Ability to perform manual calibration in extreme cold',
      'Knowledge of arctic-specific atmospheric hazards'
    ],
    nuSpecific: {
      arcticTesting: {
        extremeColdEquipment: 'gas_detector_operation_minus_60_celsius',
        temperatureCompensation: 'manual_arctic_temperature_adjustment',
        equipmentMaintenance: 'arctic_equipment_winterization_procedures',
        batteryManagement: 'cold_weather_battery_performance_optimization'
      },
      miningTesting: {
        arcticUnderground: 'permafrost_mine_atmospheric_monitoring',
        processingChemicals: 'gold_processing_chemical_detection_arctic',
        ventilationAssessment: 'arctic_mine_ventilation_effectiveness',
        dieselEquipment: 'underground_diesel_exhaust_arctic_monitoring'
      },
      communityTesting: {
        fuelSystemTesting: 'community_heating_fuel_vapor_detection',
        wastewaterTesting: 'sewage_lagoon_gas_monitoring_arctic',
        powerGenerationTesting: 'community_generator_exhaust_monitoring',
        traditionalFoodTesting: 'traditional_food_storage_atmosphere_monitoring'
      }
    },
    certification: 'equipment_manufacturer_plus_arctic_conditions_specialization',
    validity: 'annual_recertification_arctic_equipment_updates'
  }
};

// =================== NU EMERGENCY SERVICES ===================

export const NU_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wscc: '1-800-661-0792'
  },
  
  territorialServices: {
    emergencyMeasures: '867-975-5403',
    healthEmergency: '867-975-5700',
    searchRescue: '1-800-267-7270',
    environmentalEmergency: '867-975-7700',
    arcticEmergency: '867-975-6000'
  },
  
  mining: {
    mineRescue: '911_request_mine_rescue_team',
    arcticMines: {
      baffinlandMaryRiver: '867-899-2342',
      agnicoEagleMeadowbank: '867-462-7800',
      hopeBayGold: '867-873-5281'
    },
    miningAssociation: '867-920-2267',
    arcticTransportation: '867-975-7800'
  },
  
  remoteArctic: {
    jointTaskForceNorth: '1-800-267-7270',
    arcticResponse: {
      iqaluitBase: '867-979-6262',
      rankinInletBase: '867-645-2800',
      cambridgeBayBase: '867-983-4500'
    },
    satelliteEmergency: {
      cospas: 'cospas_sarsat_406_mhz_beacon',
      spot: 'spot_satellite_messenger_sos',
      inreach: 'garmin_inreach_satellite_sos'
    },
    traditionaResponse: {
      canadianRangers: 'canadian_rangers_arctic_patrol',
      inuitGuides: 'community_inuit_guide_emergency_support'
    }
  },
  
  inuitCommunities: {
    hamletCouncils: 'local_hamlet_council_emergency_coordinator',
    inuitOrganizations: {
      nunavutTunngavik: '867-975-4900',
      qikiqtaniInuit: '867-975-8400',
      kivalliqInuit: '867-645-4800',
      kitikmeotInuit: '867-983-2458'
    },
    elders: 'community_elder_traditional_knowledge_emergency',
    traditionalKnowledge: 'inuit_qaujimajatuqangit_emergency_protocols'
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    arcticRescue: 'joint_task_force_north_arctic_operations',
    mineRescue: 'territorial_mine_rescue_association',
    traditionalRescue: 'canadian_rangers_inuit_guides_coordination'
  }
};

// =================== COMPLIANCE CHECKING ===================

export function checkNUCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: 'arctic_mining' | 'community_operations' | 'remote_arctic' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(NU_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(NU_REGULATION_STANDARDS).forEach(standard => {
    const check = performNUStandardCheck(standard, permitData, atmosphericReadings, personnel, operationType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'NU',
    overallCompliance,
    results,
    criticalNonCompliance,
    nuSpecific: {
      operationType: operationType || 'general',
      arcticConditions: getArcticConditions(),
      miningConsiderations: operationType === 'arctic_mining' ? getArcticMiningConsiderations() : undefined,
      communityConsiderations: operationType === 'community_operations' ? getCommunityConsiderations() : undefined,
      inuitCulturalConsiderations: getInuitCulturalConsiderations(),
      emergencyServices: getNUEmergencyServices(operationType),
      environmentalFactors: getNUEnvironmentalFactors(),
      seasonalLimitations: getArcticSeasonalLimitations(),
      traditionalKnowledge: getTraditionalKnowledgeIntegration()
    },
    actionPlan: generateNUActionPlan(results.filter(r => r.status === 'non_compliant'), operationType)
  };
}

function performNUStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  operationType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'NU_GSR_8_1':
      return checkArcticConfinedSpaceIdentification(permitData);
    case 'NU_GSR_8_4':
      return checkArcticHazardAssessment(permitData, operationType);
    case 'NU_GSR_8_8':
      return checkArcticAtmosphericTesting(atmosphericReadings, operationType);
    case 'NU_GSR_8_12':
      return checkArcticEntryPermitSystem(permitData, operationType);
    case 'NU_GSR_8_16':
      return checkArcticAttendantRequirements(personnel, operationType);
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

function getArcticConditions() {
  return {
    temperatureRange: 'minus_60_to_plus_20_celsius',
    permafrostPresence: 'continuous_permafrost_throughout_territory',
    seasonalAccess: 'ice_road_seasonal_sealift_access',
    polarConditions: 'polar_night_midnight_sun_cycles',
    weatherExtremes: 'blizzards_ground_blizzard_whiteout_conditions'
  };
}

function getArcticMiningConsiderations() {
  return {
    undergroundConditions: 'permafrost_mine_workings_stability',
    processingOperations: 'gold_iron_ore_processing_extreme_cold',
    remoteLocation: 'fly_in_fly_out_arctic_mining_camps',
    emergencyResponse: 'mine_rescue_team_arctic_coordination',
    environmentalProtection: 'arctic_ecosystem_traditional_territory_protection'
  };
}

function getCommunityConsiderations() {
  return {
    infrastructureChallenges: 'community_infrastructure_permafrost_challenges',
    culturalIntegration: 'inuit_community_safety_cultural_integration',
    languageRequirements: 'inuktitut_safety_communication_requirements',
    traditionalActivities: 'traditional_hunting_fishing_safety_coordination',
    emergencyResponse: 'volunteer_community_emergency_response_capabilities'
  };
}

function getInuitCulturalConsiderations() {
  return {
    traditionalKnowledge: 'inuit_qaujimajatuqangit_safety_integration',
    languageAccommodation: 'inuktitut_inuinnaqtun_safety_services',
    culturalSafety: 'inuit_cultural_safety_workplace_practices',
    elderConsultation: 'community_elder_safety_protocol_consultation',
    landClaimsAgreement: 'nunavut_land_claims_agreement_compliance'
  };
}

function getNUEmergencyServices(operationType?: string) {
  const base = NU_EMERGENCY_SERVICES.general;
  
  if (operationType === 'arctic_mining') {
    return { ...base, ...NU_EMERGENCY_SERVICES.mining };
  }
  
  if (operationType === 'remote_arctic') {
    return { ...base, ...NU_EMERGENCY_SERVICES.remoteArctic };
  }
  
  if (operationType === 'community_operations') {
    return { ...base, ...NU_EMERGENCY_SERVICES.inuitCommunities };
  }
  
  return { ...base, ...NU_EMERGENCY_SERVICES.territorialServices };
}

function getNUEnvironmentalFactors() {
  return {
    temperature: 'extreme_arctic_temperatures_minus_60_celsius',
    permafrost: 'continuous_permafrost_ground_instability',
    wildlife: 'polar_bear_arctic_fox_caribou_encounters',
    weather: 'blizzard_ground_blizzard_whiteout_conditions',
    polarConditions: 'polar_night_midnight_sun_circadian_disruption',
    isolation: 'extreme_arctic_isolation_factors'
  };
}

function getArcticSeasonalLimitations() {
  return {
    winter: 'extreme_cold_polar_night_limited_access',
    spring: 'breakup_ice_road_closure_limited_access',
    summer: 'midnight_sun_permafrost_thaw_sealift_access',
    fall: 'freeze_up_weather_uncertainty_access_preparation'
  };
}

function getTraditionalKnowledgeIntegration() {
  return {
    inuitQaujimajatuqangit: 'traditional_knowledge_safety_integration',
    elderWisdom: 'community_elder_safety_consultation',
    traditionalSurvival: 'arctic_survival_traditional_methods',
    culturalProtocols: 'inuit_cultural_safety_workplace_protocols',
    communityInvolvement: 'hamlet_inuit_organization_safety_participation'
  };
}

function generateNUActionPlan(nonCompliantResults: ComplianceCheck[], operationType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getNUCorrectiveAction(result.requirementId, operationType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getNURequiredResources(result.requirementId, operationType),
    verification: 'wscc_inspector_verification'
  }));
}

function getNUCorrectiveAction(requirementId: string, operationType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    arctic_confined_space_identification: {
      en: `Identify and classify all confined spaces in ${operationType || 'arctic'} operations with permafrost and cultural considerations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${operationType || 'arctiques'} avec considérations pergélisol et culturelles`,
      iu: `Anerniqsaijut takujuq pausimajut ${operationType || 'ukiulingnik'} pijariit inuit qaujimajatuqangit`
    },
    arctic_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment including arctic conditions and traditional knowledge for ${operationType || 'general'} operations`,
      fr: `Effectuer évaluation complète des dangers incluant conditions arctiques et savoirs traditionnels pour opérations ${operationType || 'générales'}`,
      iu: `Anernirnik isumaqatigiit ukiulingnik inuit qaujimajatuqangit ${operationType || 'tamanik'} pijarijit`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with arctic-rated equipment and temperature compensation for ${operationType || 'general'} operations`,
      fr: `Effectuer tests atmosphériques avec équipement arctique et compensation température pour opérations ${operationType || 'générales'}`,
      iu: `Anerniq qimmisimajuq ukiulingnik pijariit ${operationType || 'tamanik'} atilirijit`
    },
    entry_permit: {
      en: `Implement entry permit system with arctic conditions and ${operationType || 'general'} operation requirements`,
      fr: `Implémenter système permis d'entrée avec conditions arctiques et exigences opérations ${operationType || 'générales'}`,
      iu: `Itijaujuq papiit sila ukiulingnik ${operationType || 'tamanik'} pijariit atuniqaqtit`
    },
    attendant_present: {
      en: `Assign qualified attendant with arctic training and cultural competency for ${operationType || 'general'} operations`,
      fr: `Assigner surveillant qualifié avec formation arctique et compétence culturelle pour opérations ${operationType || 'générales'}`,
      iu: `Saqijuq ilisaijuq ukiulingnik inuit qaujimajatuqangit ${operationType || 'tamanik'} pijariit`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WSCC requirements for arctic operations',
    fr: 'Traiter non-conformité identifiée selon exigences WSCC pour opérations arctiques',
    iu: 'Angirutivut WSCC malikkuaq ukiulingnik pijariit'
  };
}

function getNURequiredResources(requirementId: string, operationType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    arctic_confined_space_identification: ['competent_person', 'arctic_conditions_assessment'],
    arctic_hazard_assessment: ['competent_person', 'traditional_knowledge_holder', 'arctic_safety_specialist'],
    atmospheric_testing: ['arctic_rated_detectors', 'temperature_compensation_equipment'],
    entry_permit: ['permit_forms', 'satellite_communication', 'weather_monitoring'],
    attendant_present: ['arctic_trained_attendant', 'multi_redundant_communication', 'emergency_response_plan']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add operation-specific resources
  if (operationType === 'arctic_mining') {
    resources.push('mine_rescue_coordination', 'underground_arctic_communication');
  } else if (operationType === 'remote_arctic') {
    resources.push('satellite_emergency_beacon', 'arctic_survival_equipment');
  } else if (operationType === 'community_operations') {
    resources.push('hamlet_safety_coordinator', 'inuktitut_interpreter');
  }
  
  // Add arctic-specific resources
  resources.push('arctic_survival_equipment', 'inuit_cultural_safety_representative');
  
  return resources;
}

// Helper functions for specific standard checks
function checkArcticConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasArcticConsiderations = permitData.spaceDetails?.environmentalFactors?.includes('arctic_conditions');
  const hasPermafrostAssessment = permitData.spaceDetails?.environmentalFactors?.includes('permafrost');
  
  return {
    standardId: 'NU_GSR_8_1',
    requirementId: 'arctic_confined_space_identification',
    status: hasIdentification && hasArcticConsiderations && hasPermafrostAssessment ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasArcticConsiderations ? [] : ['Missing arctic environmental considerations']),
      ...(hasPermafrostAssessment ? [] : ['Missing permafrost assessment'])
    ],
    priority: 'critical'
  };
}

function checkArcticHazardAssessment(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasArcticHazards = permitData.hazardAssessment?.environmentalHazards?.some(h => 
    ['extreme_cold', 'permafrost', 'polar_conditions', 'wildlife', 'isolation'].includes(h)
  );
  const hasTraditionalKnowledge = permitData.hazardAssessment?.traditionalKnowledge !== undefined;
  const hasOperationSpecificAssessment = operationType ? 
    permitData.hazardAssessment?.operationSpecific?.[operationType] !== undefined : true;
  
  return {
    standardId: 'NU_GSR_8_4',
    requirementId: 'arctic_hazard_assessment',
    status: hasAssessment && hasArcticHazards && hasTraditionalKnowledge && hasOperationSpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasArcticHazards ? [] : ['Missing arctic environmental hazard assessment']),
      ...(hasTraditionalKnowledge ? [] : ['Missing traditional knowledge integration']),
      ...(hasOperationSpecificAssessment ? [] : [`Missing ${operationType} operation-specific assessment`])
    ],
    priority: 'critical'
  };
}

function checkArcticAtmosphericTesting(atmosphericReadings: AtmosphericReading[], operationType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'NU_GSR_8_8',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getNUStandardsForOperation(operationType);
  const hasArcticRatedEquipment = atmosphericReadings.some(r => r.equipmentRating?.includes('arctic_rated'));
  const hasTemperatureCompensation = atmosphericReadings.some(r => r.temperatureCompensation !== undefined);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isNUReadingCompliant(reading, standards);
  });

  return {
    standardId: 'NU_GSR_8_8',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasArcticRatedEquipment && hasTemperatureCompensation ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for arctic ${operationType || 'general'} operations`
      ),
      ...(hasArcticRatedEquipment ? [] : ['Missing arctic-rated equipment certification']),
      ...(hasTemperatureCompensation ? [] : ['Missing extreme temperature compensation'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkArcticEntryPermitSystem(permitData: LegalPermit, operationType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWeatherLimitations = permitData.entryPermit?.weatherLimitations !== undefined;
  const hasEmergencyEvacuation = permitData.entryPermit?.emergencyEvacuation?.includes('arctic_procedures');
  const hasCommunicationPlan = permitData.entryPermit?.communicationPlan !== undefined;
  
  return {
    standardId: 'NU_GSR_8_12',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWeatherLimitations && hasEmergencyEvacuation && hasCommunicationPlan ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasWeatherLimitations ? [] : ['Missing arctic weather limitations']),
      ...(hasEmergencyEvacuation ? [] : ['Missing arctic emergency evacuation procedures']),
      ...(hasCommunicationPlan ? [] : ['Missing remote arctic communication plan'])
    ],
    priority: 'critical'
  };
}

function checkArcticAttendantRequirements(personnel: PersonnelData[], operationType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasArcticTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasArcticSpecificTraining(p, operationType));
  const hasMinimumTeam = personnel.filter(p => p.role === 'attendant').length >= 3;
  const hasCulturalCompetency = personnel
    .filter(p => p.role === 'attendant')
    .some(p => p.qualifications?.some(q => q.type === 'inuit_cultural_safety'));
  
  return {
    standardId: 'NU_GSR_8_16',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasArcticTraining && hasMinimumTeam && hasCulturalCompetency ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasArcticTraining ? [] : [`Attendant lacks arctic conditions training`]),
      ...(hasMinimumTeam ? [] : ['Missing minimum 3-person arctic safety team']),
      ...(hasCulturalCompetency ? [] : ['Missing Inuit cultural competency'])
    ],
    priority: 'critical'
  };
}

function getNUStandardsForOperation(operationType?: string) {
  const baseStandards = NU_ATMOSPHERIC_STANDARDS;
  
  if (operationType === 'arctic_mining') {
    return { ...baseStandards, ...baseStandards.arcticMiningSpecific };
  }
  
  if (operationType === 'community_operations') {
    return { ...baseStandards, ...baseStandards.communityOperationsSpecific };
  }
  
  return baseStandards;
}

function isNUReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasArcticSpecificTraining(personnel: PersonnelData, operationType?: string): boolean {
  const requiredTraining = {
    arctic_mining: ['arctic_mining_safety', 'underground_permafrost_operations'],
    community_operations: ['community_safety_coordination', 'inuktitut_communication'],
    remote_arctic: ['arctic_survival', 'satellite_communication_emergency']
  };
  
  const arcticBaseline = ['arctic_survival_training', 'extreme_cold_operations', 'satellite_communication'];
  const operationSpecific = operationType ? requiredTraining[operationType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...arcticBaseline, ...operationSpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WSCC_NU_AUTHORITY,
  NU_SPECIFIC_FEATURES,
  NU_REGULATION_STANDARDS,
  NU_ATMOSPHERIC_STANDARDS,
  NU_PERSONNEL_QUALIFICATIONS,
  NU_EMERGENCY_SERVICES,
  checkNUCompliance
};

export type NUOperationType = 'arctic_mining' | 'community_operations' | 'remote_arctic' | 'general';
export type NURegulationStandardId = keyof typeof NU_REGULATION_STANDARDS;
export type NUPersonnelQualificationId = keyof typeof NU_PERSONNEL_QUALIFICATIONS;
