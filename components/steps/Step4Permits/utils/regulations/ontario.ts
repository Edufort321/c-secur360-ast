/**
 * Ontario Workplace Safety and Insurance Board (WSIB)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Ontario Regulation 632/05 - Confined Spaces
 * Under the Occupational Health and Safety Act
 * 
 * Provincial Focus: Manufacturing, construction, mining, nuclear, automotive
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

// =================== ONTARIO AUTHORITY ===================

export const WSIB_ON_AUTHORITY = {
  name: 'Workplace Safety and Insurance Board of Ontario',
  acronym: 'WSIB Ontario',
  jurisdiction: ['ON'] as const,
  website: 'https://www.wsib.ca',
  contactInfo: {
    phone: '1-800-387-0750',              // Ligne principale WSIB
    preventionPhone: '1-877-202-0008',     // Services prévention
    email: 'prevention@wsib.on.ca',
    address: '200 Front Street West, Toronto, ON M5V 3J1'
  },
  regionalOffices: [
    { region: 'Toronto', phone: '416-344-1000', coverage: 'GTA, Manufacturing Hub' },
    { region: 'Ottawa', phone: '613-238-1995', coverage: 'Eastern Ontario, Government' },
    { region: 'London', phone: '519-645-4944', coverage: 'Southwestern Ontario, Automotive' },
    { region: 'Hamilton', phone: '905-308-5555', coverage: 'Steel Industry, Heavy Manufacturing' },
    { region: 'Sudbury', phone: '705-564-7131', coverage: 'Northern Ontario, Mining' },
    { region: 'Thunder Bay', phone: '807-343-8000', coverage: 'Northwestern Ontario, Forestry' },
    { region: 'Windsor', phone: '519-973-4510', coverage: 'Automotive Manufacturing' },
    { region: 'Kitchener', phone: '519-571-0444', coverage: 'Technology Corridor' }
  ],
  languages: ['en', 'fr'] as const,        // Officially bilingual province
  specializedUnits: [
    'manufacturing_safety_division',       // Division sécurité manufacturière
    'mining_safety_unit',                  // Unité sécurité minière
    'nuclear_safety_program',              // Programme sécurité nucléaire
    'automotive_safety_initiative',        // Initiative sécurité automobile
    'construction_safety_association'      // Association sécurité construction
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing orders and directives',
    'Stop work orders',
    'Administrative penalties up to $1,500,000',
    'Prosecutions under provincial law'
  ]
} as const;

// =================== ON SPECIFIC FEATURES ===================

export const ON_SPECIFIC_FEATURES = {
  manufacturingOperations: [
    'automotive_assembly_plants_windsor_toronto',
    'steel_production_hamilton_sault_ste_marie',
    'petrochemical_facilities_sarnia',
    'food_processing_plants_throughout_province',
    'pharmaceutical_manufacturing_mississauga'
  ],
  miningOperations: [
    'nickel_mining_sudbury_basin',          // Bassin minier Sudbury
    'gold_mining_timmins_kirkland_lake',
    'uranium_mining_elliot_lake',
    'salt_mining_goderich_windsor',
    'aggregate_quarries_throughout_province'
  ],
  nuclearOperations: [
    'bruce_nuclear_generating_station',     // Centrale nucléaire Bruce
    'pickering_nuclear_generating_station',
    'darlington_nuclear_generating_station',
    'ontario_power_generation_facilities',
    'nuclear_waste_management_facilities'
  ],
  constructionOperations: [
    'high_rise_construction_toronto',
    'infrastructure_projects_407_gardiner',
    'transit_construction_ttc_metrolinx',
    'bridge_tunnel_construction',
    'underground_utility_construction'
  ],
  bilingualRequirements: [
    'french_language_services_designated_areas',
    'bilingual_safety_documentation_requirement',
    'french_speaking_safety_personnel_available',
    'bilingual_emergency_response_procedures'
  ],
  regulatoryIntegration: [
    'canadian_nuclear_safety_commission',   // Commission sûreté nucléaire Canada
    'transport_canada_dangerous_goods',
    'environment_climate_change_canada',
    'technical_standards_safety_authority'  // TSSA Ontario
  ]
} as const;

// =================== ON REGULATION STANDARDS ===================

export const ON_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'ON_REG_632_1': {
    id: 'ON_REG_632_1',
    title: { 
      en: 'Confined Space Definition and Application', 
      fr: 'Définition et Application d\'Espace Clos' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    section: '1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes manufacturing, mining, nuclear, and construction spaces'  // ON specific
    ],
    onSpecific: {
      manufacturingDefinitions: [
        'automotive_paint_booth_confined_spaces',
        'steel_furnace_maintenance_areas',
        'petrochemical_vessel_interiors',
        'food_processing_tank_interiors'
      ],
      miningDefinitions: [
        'underground_mine_workings_development',
        'ore_processing_mill_vessels',
        'mine_ventilation_shaft_areas',
        'tailings_pond_pump_stations'
      ],
      nuclearDefinitions: [
        'reactor_containment_areas',
        'steam_generator_interiors',
        'nuclear_waste_storage_areas',
        'radioactive_material_handling_spaces'
      ],
      constructionDefinitions: [
        'tunnel_boring_machine_areas',
        'underground_transit_construction',
        'bridge_box_girder_interiors',
        'utility_vault_manholes'
      ]
    },
    penalties: {
      individual: { min: 1000, max: 100000 },   // 2023 amounts
      corporation: { min: 50000, max: 1500000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Ontario Regulation 632/05 - Confined Spaces',
        citation: 'O. Reg. 632/05',
        url: 'https://ontario.ca/laws/regulation/632'
      }
    ]
  },

  'ON_REG_632_3': {
    id: 'ON_REG_632_3',
    title: { 
      en: 'Hazard Assessment for Industrial Operations', 
      fr: 'Évaluation des Dangers pour Opérations Industrielles' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    section: '3',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Assessment by competent person before entry',
      'Identification of all potential hazards',
      'Assessment of atmospheric, physical, and process hazards',
      'Evaluation of ingress and egress routes',
      'Consideration of adjacent operations and processes'
    ],
    onSpecific: {
      manufacturingHazards: {
        automotiveHazards: 'paint_fumes_robotic_equipment_welding_gases',
        steelProductionHazards: 'molten_metal_carbon_monoxide_heat_stress',
        petrochemicalHazards: 'hydrocarbon_vapors_process_chemicals_pressure',
        foodProcessingHazards: 'biological_contamination_cleaning_chemicals'
      },
      miningHazards: {
        undergroundHazards: 'ground_instability_mine_gases_equipment_risks',
        processingHazards: 'flotation_chemicals_grinding_dust_noise',
        tailingsHazards: 'tailings_dam_stability_chemical_exposure'
      },
      nuclearHazards: {
        radiationHazards: 'ionizing_radiation_contamination_exposure',
        processHazards: 'steam_pressure_chemical_cleaning_agents',
        emergencyHazards: 'radiation_emergency_response_coordination'
      },
      constructionHazards: {
        excavationHazards: 'cave_in_groundwater_utility_strikes',
        tunnelHazards: 'tunnel_boring_machine_ground_conditions',
        bridgeHazards: 'height_weather_traffic_coordination'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'industry_safety_specialist'],
      responsibilities: ['employer', 'competent_person', 'joint_health_safety_committee']
    }
  },

  'ON_REG_632_5': {
    id: 'ON_REG_632_5',
    title: { 
      en: 'Atmospheric Testing for Industrial Environments', 
      fr: 'Tests Atmosphériques pour Environnements Industriels' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    section: '5',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Testing by qualified person with appropriate equipment',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of properly calibrated and maintained equipment',
      'Documentation of all test results and corrective actions'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    onSpecific: {
      manufacturingTesting: {
        automotiveChemicals: ['toluene_paint_solvents', 'isocyanates_adhesives', 'welding_fumes'],
        steelProduction: ['carbon_monoxide_blast_furnace', 'sulfur_dioxide_coking', 'metal_fumes'],
        petrochemicals: ['benzene_aromatic_hydrocarbons', 'hydrogen_sulfide_sour_gas', 'mercaptans'],
        foodProcessing: ['ammonia_refrigeration', 'carbon_dioxide_preservation', 'cleaning_chemical_vapors']
      },
      miningTesting: {
        undergroundGases: ['methane_natural_seepage', 'carbon_dioxide_blasting', 'nitrogen_oxides'],
        processingChemicals: ['flotation_reagents', 'cyanide_gold_processing', 'acid_leaching_vapors'],
        dustMonitoring: 'respirable_crystalline_silica_monitoring'
      },
      nuclearTesting: {
        radiationMonitoring: 'continuous_radiation_level_monitoring',
        processGases: ['tritium_vapor', 'noble_gases', 'activation_products'],
        ventilationEffectiveness: 'negative_pressure_maintenance_verification'
      },
      constructionTesting: {
        excavationGases: ['methane_landfill_gas', 'hydrogen_sulfide_sewers', 'carbon_monoxide_equipment'],
        tunnelAtmosphere: 'tunnel_boring_machine_exhaust_monitoring',
        utilityGases: 'natural_gas_line_leak_detection'
      }
    }
  },

  'ON_REG_632_8': {
    id: 'ON_REG_632_8',
    title: { 
      en: 'Entry Procedures and Permit System', 
      fr: 'Procédures d\'Entrée et Système de Permis' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    section: '8',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry procedure developed for each confined space',
      'Entry permit issued for each entry',
      'Authorization by competent person',
      'Specification of safety equipment and procedures',
      'Coordination with other workplace activities'
    ],
    onSpecific: {
      manufacturingPermits: {
        automotiveCoordination: 'production_line_shutdown_coordination',
        steelProductionCoordination: 'furnace_operation_isolation_procedures',
        petrochemicalCoordination: 'process_unit_isolation_lockout_tagout',
        foodProcessingCoordination: 'sanitation_schedule_coordination'
      },
      miningPermits: {
        undergroundCoordination: 'mine_ventilation_system_coordination',
        blastingCoordination: 'blasting_schedule_confined_space_entry',
        shiftCoordination: 'underground_shift_change_communication'
      },
      nuclearPermits: {
        radiationWorkPermit: 'radiation_work_permit_integration',
        outageCoordination: 'planned_outage_maintenance_coordination',
        emergencyProcedures: 'nuclear_emergency_response_coordination'
      },
      constructionPermits: {
        trafficCoordination: 'road_closure_traffic_management',
        utilityCoordination: 'utility_locate_before_entry',
        projectCoordination: 'multi_contractor_coordination_procedures'
      }
    }
  },

  'ON_REG_632_11': {
    id: 'ON_REG_632_11',
    title: { 
      en: 'Attendant and Communication Requirements', 
      fr: 'Exigences de Surveillant et Communication' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    section: '11',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Trained attendant stationed outside confined space',
      'Effective communication between attendant and entrants',
      'Monitoring of conditions that may affect entrant safety',
      'Authority to order immediate evacuation',
      'Understanding of emergency response procedures'
    ],
    onSpecific: {
      manufacturingAttendant: {
        productionIntegration: 'manufacturing_process_monitoring_integration',
        emergencyShutdown: 'production_line_emergency_shutdown_authority',
        qualityControl: 'product_quality_safety_coordination'
      },
      miningAttendant: {
        undergroundCommunication: 'mine_communication_system_integration',
        ventilationMonitoring: 'mine_ventilation_effectiveness_monitoring',
        emergencyResponse: 'mine_rescue_team_direct_communication'
      },
      nuclearAttendant: {
        radiationMonitoring: 'continuous_radiation_level_monitoring',
        controlRoomCommunication: 'nuclear_plant_control_room_coordination',
        emergencyResponse: 'nuclear_emergency_response_team_coordination'
      },
      constructionAttendant: {
        siteCoordination: 'construction_site_activity_coordination',
        trafficSafety: 'traffic_control_safety_coordination',
        utilityAwareness: 'underground_utility_safety_monitoring'
      }
    }
  }
};

// =================== ON ATMOSPHERIC STANDARDS ===================

export const ON_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // ON Manufacturing Industry Specific
  manufacturingSpecific: {
    toluene_automotive: { max: 50, unit: 'ppm' },       // Automotive paint operations
    isocyanates: { max: 0.005, unit: 'ppm' },           // Automotive adhesives
    benzene_petrochemical: { max: 0.5, unit: 'ppm' },  // Petrochemical operations
    ammonia_food: { max: 25, unit: 'ppm' },             // Food processing refrigeration
    metal_fumes_steel: { max: 5, unit: 'mg/m³' }        // Steel production
  },
  
  // ON Mining Industry Specific  
  miningSpecific: {
    methane_underground: { max: 1.0, unit: '%' },       // Underground mining
    silica_dust: { max: 0.1, unit: 'mg/m³' },          // Respirable crystalline silica
    cyanide_gold: { max: 4.7, unit: 'mg/m³' },         // Gold processing
    flotation_chemicals: 'per_material_safety_data_sheet',
    nitrogen_oxides_blasting: { max: 3, unit: 'ppm' }   // Post-blasting
  },
  
  // ON Nuclear Industry Specific
  nuclearSpecific: {
    tritium_vapor: { max: 40, unit: 'Bq/m³' },         // Tritium operations
    noble_gases: 'continuous_radiation_monitoring',
    activation_products: 'radiation_work_permit_limits',
    ventilation_effectiveness: 'negative_pressure_maintained'
  },
  
  // ON Construction Industry Specific
  constructionSpecific: {
    methane_landfill: { max: 1000, unit: 'ppm' },      // Landfill gas
    hydrogen_sulfide_sewer: { max: 10, unit: 'ppm' },  // Sewer work
    equipment_exhaust: { max: 25, unit: 'ppm' },       // Construction equipment CO
    utility_gases: 'natural_gas_leak_detection_required'
  }
} as const;

// =================== ON PERSONNEL QUALIFICATIONS ===================

export const ON_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'on_competent_person',
    title: { 
      en: 'Competent Person - Ontario Confined Space', 
      fr: 'Personne Compétente - Espace Clos Ontario' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with Ontario OHSA and Regulation 632/05',
      'Understanding of industry-specific hazards and controls',
      'Authority to implement safety measures and stop work',
      'Knowledge of Ontario emergency response systems'
    ],
    onSpecific: {
      manufacturingCompetency: {
        automotiveExperience: 'automotive_manufacturing_safety_experience',
        steelIndustryExperience: 'steel_production_hazard_recognition',
        petrochemicalExperience: 'petrochemical_process_safety_knowledge',
        foodProcessingExperience: 'food_safety_haccp_integration'
      },
      miningCompetency: {
        certifications: ['ontario_mining_supervisor_certification', 'underground_mining_safety'],
        experience: 'northern_ontario_mining_operations_experience',
        emergencyResponse: 'mine_rescue_team_coordination'
      },
      nuclearCompetency: {
        certifications: ['cnsc_nuclear_security_clearance', 'radiation_safety_officer'],
        experience: 'ontario_nuclear_generating_station_experience',
        emergencyResponse: 'nuclear_emergency_response_coordination'
      },
      constructionCompetency: {
        certifications: ['ontario_construction_safety_coordinator', 'confined_space_construction'],
        experience: 'major_infrastructure_project_experience',
        regulatoryKnowledge: 'tssa_boiler_pressure_vessel_regulations'
      },
      bilingualRequirements: {
        frenchLanguageServices: 'french_safety_communication_designated_areas',
        bilingualDocumentation: 'safety_documentation_english_french'
      }
    },
    certification: 'wsib_ontario_approved_competent_person_training',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'wsib_ontario_confined_space_competent_person',
      'industry_specific_hazard_recognition',
      'ontario_emergency_response_coordination',
      'joint_health_safety_committee_integration'
    ]
  },

  attendant: {
    id: 'on_attendant',
    title: { 
      en: 'Ontario Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos Ontario' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    requirements: [
      'Training in attendant duties for Ontario operations',
      'Knowledge of communication procedures and equipment',
      'Understanding of industry-specific emergency procedures',
      'Familiarity with atmospheric monitoring equipment',
      'Standard first aid and CPR certification'
    ],
    onSpecific: {
      manufacturingAttendant: {
        automotiveTraining: 'automotive_production_line_safety_procedures',
        steelIndustryTraining: 'steel_production_emergency_procedures',
        petrochemicalTraining: 'petrochemical_process_emergency_response',
        foodProcessingTraining: 'food_processing_sanitation_safety_integration'
      },
      miningAttendant: {
        certifications: ['ontario_mining_first_aid', 'underground_emergency_procedures'],
        communicationSystems: 'mine_communication_tracking_systems',
        emergencyResponse: 'mine_rescue_team_coordination'
      },
      nuclearAttendant: {
        certifications: ['nuclear_facility_security_clearance', 'radiation_safety_awareness'],
        radiationMonitoring: 'personal_radiation_monitoring_equipment',
        emergencyResponse: 'nuclear_emergency_response_procedures'
      },
      constructionAttendant: {
        certifications: ['construction_safety_awareness', 'traffic_control_safety'],
        siteCoordination: 'multi_contractor_site_coordination',
        utilityAwareness: 'ontario_one_call_utility_location'
      },
      bilingualServices: {
        frenchCommunication: 'french_language_emergency_communication',
        bilingualDocumentation: 'safety_procedures_english_french'
      }
    },
    certification: 'wsib_ontario_attendant_training_plus_industry_specific',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'on_atmospheric_tester',
    title: { 
      en: 'Ontario Atmospheric Tester', 
      fr: 'Testeur Atmosphérique Ontario' 
    },
    authority: 'WSIB Ontario',
    jurisdiction: ['ON'],
    requirements: [
      'Training on gas detection equipment operation',
      'Knowledge of Ontario atmospheric standards and TLVs',
      'Understanding of equipment calibration procedures',
      'Ability to interpret test results for different industries',
      'Knowledge of Ontario-specific atmospheric hazards'
    ],
    onSpecific: {
      manufacturingTesting: {
        automotiveChemicals: 'automotive_paint_solvent_detection_training',
        steelIndustryGases: 'blast_furnace_coke_oven_gas_monitoring',
        petrochemicalTesting: 'hydrocarbon_vapor_detection_procedures',
        foodProcessingTesting: 'refrigeration_gas_detection_systems'
      },
      miningTesting: {
        undergroundTesting: 'underground_mine_atmospheric_monitoring',
        processingChemicals: 'ore_processing_chemical_detection',
        silicaMonitoring: 'respirable_silica_dust_monitoring',
        ventilationAssessment: 'mine_ventilation_effectiveness_evaluation'
      },
      nuclearTesting: {
        radiationMonitoring: 'nuclear_facility_atmospheric_radiation_monitoring',
        processGases: 'nuclear_process_gas_detection_systems',
        contamination: 'radioactive_contamination_detection'
      },
      constructionTesting: {
        excavationTesting: 'excavation_atmospheric_hazard_detection',
        tunnelTesting: 'tunnel_atmospheric_monitoring_procedures',
        utilityTesting: 'natural_gas_leak_detection_procedures'
      }
    },
    certification: 'equipment_manufacturer_plus_ontario_industry_specific',
    validity: 'annual_recertification_with_equipment_updates'
  }
};

// =================== ON EMERGENCY SERVICES ===================

export const ON_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    wsib: '1-800-387-0750'
  },
  
  manufacturingEmergency: {
    automotiveEmergency: {
      fordMotor: '519-973-9441',             // Ford Motor Company Windsor
      generalMotors: '905-644-5000',         // GM Oshawa
      chrysler: '519-973-2000',              // Stellantis Windsor
      toyotaMotor: '519-451-0100'            // Toyota Motor Manufacturing Cambridge
    },
    steelIndustry: {
      arcMittal: '905-548-7200',             // ArcelorMittal Dofasco Hamilton
      algomaSteelSault: '705-945-2351',      // Algoma Steel Sault Ste. Marie
      nucorYamachiche: '819-296-2121'        // Nucor Steel Gallatin
    },
    petrochemicals: {
      imperialOil: '519-339-2716',           // Imperial Oil Sarnia
      shellCanada: '519-339-1311',           // Shell Canada Sarnia
      nova: '519-339-6111'                   // NOVA Chemicals Sarnia
    }
  },
  
  mining: {
    northernOntarioMines: {
      valeInco: '705-693-2761',              // Vale Inco Sudbury
      glencore: '705-693-2911',              // Glencore Sudbury
      barrickGold: '705-267-6271',           // Barrick Gold Hemlo
      newmontGold: '705-235-3291'            // Newmont Borden Lake
    },
    mineRescue: '705-670-5707',              // Ontario Mine Rescue
    miningAssociation: '416-364-9301',       // Ontario Mining Association
    northernDevelopment: '705-564-5927'     // Northern Ontario Heritage Fund
  },
  
  nuclear: {
    bruceNuclear: '519-361-7777',            // Bruce Nuclear Emergency
    pickeringNuclear: '905-839-1151',        // Pickering Nuclear Emergency
    darlingtonNuclear: '905-697-1800',       // Darlington Nuclear Emergency
    opg: '416-592-2555',                     // Ontario Power Generation Emergency
    cnsc: '613-995-5894'                     // Canadian Nuclear Safety Commission
  },
  
  construction: {
    infrastructureOntario: '416-327-1234',   // Infrastructure Ontario
    metrolinxEmergency: '416-202-4900',      // Metrolinx Construction Emergency
    407ETREmergency: '905-264-5407',         // 407 ETR Emergency
    torontoHydro: '416-542-8000',            // Toronto Hydro Emergency
    hydroOne: '1-800-434-1235'              // Hydro One Emergency
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    industrialRescue: 'local_fire_department_hazmat_team',
    nuclearEmergency: 'provincial_nuclear_emergency_response_plan',
    mineRescue: 'ontario_mine_rescue_association',
    constructionRescue: 'infrastructure_emergency_response_team'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkONCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'manufacturing' | 'mining' | 'nuclear' | 'construction' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(ON_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(ON_REGULATION_STANDARDS).forEach(standard => {
    const check = performONStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'ON',
    overallCompliance,
    results,
    criticalNonCompliance,
    onSpecific: {
      industryType: industryType || 'general',
      manufacturingConsiderations: industryType === 'manufacturing' ? getManufacturingConsiderations() : undefined,
      miningConsiderations: industryType === 'mining' ? getMiningConsiderations() : undefined,
      nuclearConsiderations: industryType === 'nuclear' ? getNuclearConsiderations() : undefined,
      constructionConsiderations: industryType === 'construction' ? getConstructionConsiderations() : undefined,
      bilingualRequirements: getBilingualRequirements(),
      emergencyServices: getONEmergencyServices(industryType),
      regulatoryIntegration: getONRegulatoryIntegration(industryType),
      jhscIntegration: getJHSCIntegration()
    },
    actionPlan: generateONActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performONStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'ON_REG_632_1':
      return checkConfinedSpaceIdentification(permitData);
    case 'ON_REG_632_3':
      return checkIndustrialHazardAssessment(permitData, industryType);
    case 'ON_REG_632_5':
      return checkIndustrialAtmosphericTesting(atmosphericReadings, industryType);
    case 'ON_REG_632_8':
      return checkEntryPermitSystem(permitData, industryType);
    case 'ON_REG_632_11':
      return checkAttendantRequirements(personnel, industryType);
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

function getManufacturingConsiderations() {
  return {
    automotiveIntegration: 'production_line_safety_coordination',
    steelProductionHazards: 'molten_metal_carbon_monoxide_management',
    petrochemicalProcesses: 'hydrocarbon_vapor_process_isolation',
    foodProcessingSafety: 'sanitation_chemical_biological_hazards',
    qualityControlIntegration: 'product_quality_safety_coordination'
  };
}

function getMiningConsiderations() {
  return {
    undergroundOperations: 'mine_ventilation_ground_control_integration',
    processingOperations: 'ore_processing_chemical_flotation_hazards',
    northernOperations: 'northern_ontario_remote_location_challenges',
    emergencyResponse: 'ontario_mine_rescue_coordination',
    silicaProtection: 'respirable_crystalline_silica_prevention'
  };
}

function getNuclearConsiderations() {
  return {
    radiationProtection: 'alara_principle_radiation_exposure_minimization',
    securityRequirements: 'cnsc_security_clearance_requirements',
    emergencyResponse: 'provincial_nuclear_emergency_response_plan',
    regulatoryOversight: 'canadian_nuclear_safety_commission_coordination',
    outageCoordination: 'planned_maintenance_outage_coordination'
  };
}

function getConstructionConsiderations() {
  return {
    infrastructureProjects: 'major_infrastructure_project_coordination',
    utilityCoordination: 'ontario_one_call_utility_location',
    trafficManagement: 'road_closure_traffic_control_coordination',
    multiContractor: 'multiple_contractor_site_coordination',
    publicSafety: 'public_area_construction_safety_protection'
  };
}

function getBilingualRequirements() {
  return {
    frenchLanguageServices: 'designated_french_language_service_areas',
    bilingualDocumentation: 'safety_documentation_english_french_required',
    bilingualPersonnel: 'french_speaking_safety_personnel_availability',
    emergencyProcedures: 'bilingual_emergency_response_procedures'
  };
}

function getONEmergencyServices(industryType?: string) {
  const base = ON_EMERGENCY_SERVICES.general;
  
  if (industryType === 'manufacturing') {
    return { ...base, ...ON_EMERGENCY_SERVICES.manufacturingEmergency };
  }
  
  if (industryType === 'mining') {
    return { ...base, ...ON_EMERGENCY_SERVICES.mining };
  }
  
  if (industryType === 'nuclear') {
    return { ...base, ...ON_EMERGENCY_SERVICES.nuclear };
  }
  
  if (industryType === 'construction') {
    return { ...base, ...ON_EMERGENCY_SERVICES.construction };
  }
  
  return base;
}

function getONRegulatoryIntegration(industryType?: string) {
  const base = ['wsib_ontario', 'ministry_labour_training_skills_development'];
  
  if (industryType === 'nuclear') {
    return [...base, 'canadian_nuclear_safety_commission', 'ontario_power_generation'];
  }
  
  if (industryType === 'construction') {
    return [...base, 'technical_standards_safety_authority', 'infrastructure_ontario'];
  }
  
  if (industryType === 'mining') {
    return [...base, 'ministry_northern_development_mines', 'ontario_mine_rescue'];
  }
  
  return base;
}

function getJHSCIntegration() {
  return {
    jhscConsultation: 'joint_health_safety_committee_consultation_required',
    workerRepresentation: 'worker_representative_confined_space_assessment',
    trainingCoordination: 'jhsc_safety_training_coordination',
    incidentInvestigation: 'jhsc_incident_investigation_participation'
  };
}

function generateONActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getONCorrectiveAction(result.requirementId, industryType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getONRequiredResources(result.requirementId, industryType),
    verification: 'wsib_ontario_inspector_verification'
  }));
}

function getONCorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${industryType || 'Ontario'} operations according to O. Reg. 632/05`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'Ontario'} selon O. Reg. 632/05`
    },
    industrial_hazard_assessment: {
      en: `Conduct comprehensive hazard assessment for ${industryType || 'industrial'} confined space operations`,
      fr: `Effectuer évaluation complète des dangers pour opérations espaces clos ${industryType || 'industrielles'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with ${industryType || 'industry'}-specific standards and Ontario requirements`,
      fr: `Effectuer tests atmosphériques selon standards spécifiques ${industryType || 'industrie'} et exigences Ontario`
    },
    entry_permit: {
      en: `Implement entry permit system with ${industryType || 'industrial'} coordination requirements`,
      fr: `Implémenter système permis d'entrée avec exigences coordination ${industryType || 'industrielle'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with ${industryType || 'industry'}-specific training and Ontario certification`,
      fr: `Assigner surveillant qualifié avec formation spécifique ${industryType || 'industrie'} et certification Ontario`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WSIB Ontario and O. Reg. 632/05 requirements',
    fr: 'Traiter non-conformité identifiée selon exigences WSIB Ontario et O. Reg. 632/05'
  };
}

function getONRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_person', 'ontario_regulation_632_guidelines'],
    industrial_hazard_assessment: ['competent_person', 'industry_safety_specialist'],
    atmospheric_testing: ['calibrated_detectors', 'ontario_certified_tester'],
    entry_permit: ['permit_forms', 'coordination_procedures'],
    attendant_present: ['ontario_trained_attendant', 'communication_equipment']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add industry-specific resources
  if (industryType === 'nuclear') {
    resources.push('radiation_safety_officer', 'cnsc_coordination');
  } else if (industryType === 'mining') {
    resources.push('ontario_mine_rescue_coordination', 'underground_communication');
  } else if (industryType === 'manufacturing') {
    resources.push('production_coordination', 'quality_control_integration');
  } else if (industryType === 'construction') {
    resources.push('site_coordination', 'utility_location_services');
  }
  
  // Add Ontario-specific resources
  resources.push('jhsc_consultation', 'wsib_ontario_guidelines');
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasOntarioClassification = permitData.spaceDetails?.regulatoryClassification?.includes('ontario_reg_632');
  
  return {
    standardId: 'ON_REG_632_1',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasOntarioClassification ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Missing confined space identification']),
      ...(hasOntarioClassification ? [] : ['Missing Ontario Regulation 632/05 classification'])
    ],
    priority: 'critical'
  };
}

function checkIndustrialHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasIndustrialHazards = permitData.hazardAssessment?.industrySpecific?.[industryType || 'general'] !== undefined;
  const hasAdjacentOperations = permitData.hazardAssessment?.adjacentOperations !== undefined;
  
  return {
    standardId: 'ON_REG_632_3',
    requirementId: 'industrial_hazard_assessment',
    status: hasAssessment && hasIndustrialHazards && hasAdjacentOperations ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasIndustrialHazards ? [] : [`Missing ${industryType} industry-specific hazard assessment`]),
      ...(hasAdjacentOperations ? [] : ['Missing adjacent operations assessment'])
    ],
    priority: 'critical'
  };
}

function checkIndustrialAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'ON_REG_632_5',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getONStandardsForIndustry(industryType);
  const hasQualifiedTester = atmosphericReadings.some(r => r.testerQualification?.includes('ontario_certified'));
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isONReadingCompliant(reading, standards);
  });

  return {
    standardId: 'ON_REG_632_5',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasQualifiedTester ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `${r.gasType} level ${r.value}${r.unit} outside acceptable range for ${industryType || 'general'} operations`
      ),
      ...(hasQualifiedTester ? [] : ['Missing Ontario qualified atmospheric tester'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWrittenProcedures = permitData.entryPermit?.writtenProcedures !== undefined;
  const hasCoordination = permitData.entryPermit?.operationalCoordination !== undefined;
  
  return {
    standardId: 'ON_REG_632_8',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWrittenProcedures && hasCoordination ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasWrittenProcedures ? [] : ['Missing written entry procedures']),
      ...(hasCoordination ? [] : ['Missing operational coordination procedures'])
    ],
    priority: 'critical'
  };
}

function checkAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasOntarioTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasOntarioSpecificTraining(p, industryType));
  const hasEffectiveCommunication = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'communication_systems'));
  
  return {
    standardId: 'ON_REG_632_11',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasOntarioTraining && hasEffectiveCommunication ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasOntarioTraining ? [] : [`Attendant lacks Ontario ${industryType} training`]),
      ...(hasEffectiveCommunication ? [] : ['Missing effective communication capability'])
    ],
    priority: 'critical'
  };
}

function getONStandardsForIndustry(industryType?: string) {
  const baseStandards = ON_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'manufacturing') {
    return { ...baseStandards, ...baseStandards.manufacturingSpecific };
  }
  
  if (industryType === 'mining') {
    return { ...baseStandards, ...baseStandards.miningSpecific };
  }
  
  if (industryType === 'nuclear') {
    return { ...baseStandards, ...baseStandards.nuclearSpecific };
  }
  
  if (industryType === 'construction') {
    return { ...baseStandards, ...baseStandards.constructionSpecific };
  }
  
  return baseStandards;
}

function isONReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasOntarioSpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  const requiredTraining = {
    manufacturing: ['ontario_manufacturing_safety', 'production_coordination'],
    mining: ['ontario_mining_safety', 'underground_operations'],
    nuclear: ['cnsc_nuclear_safety', 'radiation_protection'],
    construction: ['ontario_construction_safety', 'utility_coordination']
  };
  
  const ontarioBaseline = ['wsib_ontario_training', 'standard_first_aid', 'o_reg_632_awareness'];
  const industrySpecific = industryType ? requiredTraining[industryType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...ontarioBaseline, ...industrySpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WSIB_ON_AUTHORITY,
  ON_SPECIFIC_FEATURES,
  ON_REGULATION_STANDARDS,
  ON_ATMOSPHERIC_STANDARDS,
  ON_PERSONNEL_QUALIFICATIONS,
  ON_EMERGENCY_SERVICES,
  checkONCompliance
};

export type ONIndustryType = 'manufacturing' | 'mining' | 'nuclear' | 'construction' | 'general';
export type ONRegulationStandardId = keyof typeof ON_REGULATION_STANDARDS;
export type ONPersonnelQualificationId = keyof typeof ON_PERSONNEL_QUALIFICATIONS;
