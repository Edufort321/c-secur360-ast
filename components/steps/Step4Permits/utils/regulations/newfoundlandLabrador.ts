/**
 * Newfoundland and Labrador Workplace Health, Safety and Compensation Commission (WorkplaceNL)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Newfoundland and Labrador Occupational Health and Safety Regulations
 * Part IV: Confined Spaces (Sections 85-98)
 * 
 * Provincial Focus: Offshore oil & gas, fisheries, mining, marine operations, remote locations
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
  nlSpecific?: Record<string, any>;
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
  nlSpecific?: Record<string, any>;
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
}

export interface LegalPermit {
  id: string;
  spaceDetails?: {
    identification?: string;
  };
  hazardAssessment?: {
    industrySpecific?: Record<string, any>;
  };
  entryPermit?: {
    industrySpecific?: Record<string, any>;
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
  nlSpecific?: Record<string, any>;
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

// =================== NEWFOUNDLAND & LABRADOR AUTHORITY ===================

export const WORKPLACENL_AUTHORITY = {
  name: 'WorkplaceNL (Workplace Health, Safety and Compensation Commission)',
  acronym: 'WorkplaceNL',
  jurisdiction: ['NL'] as const,
  website: 'https://workplacenl.ca',
  contactInfo: {
    phone: '1-800-563-9000',
    preventionPhone: '709-778-1000',
    email: 'prevention@workplacenl.ca',
    address: '146-148 Forest Road, St. John\'s, NL A1E 1E5'
  },
  regionalOffices: [
    { region: 'St. John\'s', phone: '709-778-1000', coverage: 'Avalon Peninsula' },
    { region: 'Grand Falls-Windsor', phone: '709-292-4500', coverage: 'Central NL' },
    { region: 'Corner Brook', phone: '709-637-2200', coverage: 'Western NL' },
    { region: 'Happy Valley-Goose Bay', phone: '709-896-3391', coverage: 'Labrador' }
  ],
  languages: ['en'] as const,
  specializedUnits: [
    'offshore_safety_division',
    'mining_safety_unit',
    'fisheries_safety_program'
  ],
  powers: [
    'Workplace inspections and investigations',
    'Issuing improvement orders',
    'Stop work orders',
    'Administrative penalties',
    'Prosecutions and fines'
  ]
};

// =================== NL SPECIFIC FEATURES ===================

export const NL_SPECIFIC_FEATURES = {
  offshoreOperations: [
    'hibernia_platform_operations',
    'terra_nova_fpso_operations',
    'white_rose_platform_operations',
    'hebron_platform_operations',
    'offshore_supply_vessels',
    'offshore_drilling_rigs'
  ],
  fisheriesOperations: [
    'fish_processing_plants',
    'fishing_vessel_confined_spaces',
    'cold_storage_facilities',
    'aquaculture_operations',
    'marine_transportation'
  ],
  miningOperations: [
    'iron_ore_mines_labrador',
    'underground_mining_operations',
    'mineral_processing_facilities',
    'tailing_pond_operations',
    'mine_ventilation_systems'
  ],
  remoteLocations: [
    'isolated_communities_access',
    'weather_dependent_operations',
    'limited_emergency_services',
    'seasonal_accessibility_challenges',
    'satellite_communication_dependency'
  ],
  maritimeEnvironment: [
    'harsh_weather_conditions',
    'sea_ice_considerations',
    'extreme_cold_operations',
    'fog_and_visibility_issues',
    'emergency_evacuation_challenges'
  ],
  regulatoryIntegration: [
    'canada_offshore_petroleum_board',
    'transport_canada_marine_safety',
    'environment_climate_change_canada',
    'fisheries_oceans_canada'
  ]
};

// =================== NL REGULATION STANDARDS ===================

export const NL_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'NL_OHS_85': {
    id: 'NL_OHS_85',
    title: { 
      en: 'Confined Space Definition and Identification', 
      fr: 'Définition et Identification d\'Espace Clos' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    section: '85',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means for entry or exit',
      'May become hazardous to any person entering it',
      'Includes offshore platforms, vessels, and mining facilities'
    ],
    nlSpecific: {
      offshoreDefinitions: [
        'offshore_platform_confined_spaces',
        'fpso_ballast_tanks_and_voids',
        'subsea_equipment_chambers',
        'drilling_rig_confined_areas'
      ],
      fisheriesDefinitions: [
        'fish_hold_compartments',
        'refrigeration_machinery_spaces',
        'processing_tank_interiors',
        'vessel_void_spaces'
      ],
      miningDefinitions: [
        'underground_mine_workings',
        'ore_processing_vessels',
        'conveyor_tunnels',
        'ventilation_shafts_and_raises'
      ]
    },
    penalties: {
      individual: { min: 500, max: 50000 },
      corporation: { min: 5000, max: 500000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Newfoundland and Labrador Occupational Health and Safety Regulations',
        citation: 'NLR 5/12',
        url: 'https://www.assembly.nl.ca/Legislation/sr/Regulations/rc120005.htm'
      }
    ]
  },

  'NL_OHS_87': {
    id: 'NL_OHS_87',
    title: { 
      en: 'Hazard Assessment and Control', 
      fr: 'Évaluation et Contrôle des Dangers' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    section: '87',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Written hazard assessment by competent person',
      'Identification of all potential hazards',
      'Assessment of atmospheric, physical, and biological hazards',
      'Evaluation of ingress and egress routes',
      'Consideration of external conditions affecting safety'
    ],
    nlSpecific: {
      offshoreAssessment: {
        weatherConditions: 'sea_state_wind_visibility_assessment',
        helicopterAccess: 'emergency_evacuation_capability',
        platformMovement: 'dynamic_positioning_stability_factors'
      },
      fisheriesAssessment: {
        vesselMotion: 'ship_stability_and_movement_considerations',
        refrigerationHazards: 'ammonia_and_refrigerant_exposure_risk',
        processingHazards: 'biological_and_chemical_contamination'
      },
      miningAssessment: {
        undergroundConditions: 'ground_stability_and_ventilation',
        equipmentHazards: 'mobile_equipment_and_machinery_risks',
        environmentalFactors: 'dust_noise_and_vibration_exposure'
      }
    },
    implementation: {
      timeline: 'before_any_confined_space_entry',
      resources: ['competent_person', 'hazard_identification_tools'],
      responsibilities: ['employer', 'competent_person', 'workers']
    }
  },

  'NL_OHS_89': {
    id: 'NL_OHS_89',
    title: { 
      en: 'Atmospheric Testing Requirements', 
      fr: 'Exigences de Tests Atmosphériques' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    section: '89',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by qualified person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Use of calibrated and maintained testing equipment',
      'Documentation and retention of test results'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    nlSpecific: {
      offshoreTesting: {
        additionalGases: ['hydrogen_sulfide_sour_gas', 'mercaptans', 'aromatic_hydrocarbons'],
        pressureConsiderations: 'depth_and_pressure_compensation',
        equipmentProtection: 'saltwater_corrosion_resistant_equipment'
      },
      fisheriesTesting: {
        refrigerationGases: ['ammonia', 'carbon_dioxide_refrigeration'],
        marineEnvironment: 'motion_compensated_testing_procedures',
        biologicalHazards: 'decomposition_gas_monitoring'
      },
      miningTesting: {
        undergroundGases: ['methane', 'carbon_dioxide', 'nitrogen_oxides'],
        depthFactors: 'barometric_pressure_adjustments',
        ventilationEffectiveness: 'air_flow_pattern_assessment'
      }
    }
  },

  'NL_OHS_92': {
    id: 'NL_OHS_92',
    title: { 
      en: 'Entry Permit System', 
      fr: 'Système de Permis d\'Entrée' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    section: '92',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Written entry permit for each entry',
      'Authorization by competent person',
      'Specification of safety measures and procedures',
      'Time limitations and validity period',
      'Signatures of authorized personnel'
    ],
    nlSpecific: {
      offshorePermits: {
        weatherLimitations: 'sea_state_wind_speed_visibility_limits',
        evacuationProcedures: 'helicopter_boat_evacuation_readiness',
        communicationProtocols: 'offshore_installation_manager_approval'
      },
      fisheriesPermits: {
        vesselOperations: 'captain_approval_and_vessel_safety_status',
        portRegulations: 'port_authority_notification_requirements'
      },
      miningPermits: {
        shiftCoordination: 'mine_rescue_team_notification',
        ventilationStatus: 'ventilation_system_operational_verification'
      }
    }
  },

  'NL_OHS_95': {
    id: 'NL_OHS_95',
    title: { 
      en: 'Attendant and Communication', 
      fr: 'Surveillant et Communication' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    section: '95',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Qualified attendant stationed outside confined space',
      'Continuous communication with entrants',
      'Monitoring of conditions that may affect entrant safety',
      'Authority to order evacuation',
      'Emergency response capabilities'
    ],
    nlSpecific: {
      offshoreAttendant: {
        communicationSystems: 'multi_redundant_communication_systems',
        weatherMonitoring: 'continuous_weather_condition_assessment',
        evacuationAuthority: 'offshore_installation_manager_coordination'
      },
      fisheriesAttendant: {
        vesselOperations: 'bridge_communication_and_vessel_status_monitoring',
        marineSafety: 'coast_guard_communication_capability'
      },
      miningAttendant: {
        undergroundOperations: 'mine_communication_system_integration',
        emergencyResponse: 'mine_rescue_team_direct_communication'
      }
    }
  }
};

// =================== NL ATMOSPHERIC STANDARDS ===================

export const NL_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // NL Offshore Industry Specific
  offshoreSpecific: {
    hydrogen_sulfide_sour_gas: { max: 5, unit: 'ppm' },
    mercaptans: { max: 0.5, unit: 'ppm' },
    aromatic_hydrocarbons: { max: 1, unit: 'ppm' },
    drilling_mud_gases: 'per_material_safety_data_sheet'
  },
  
  // NL Fisheries Industry Specific  
  fisheriesSpecific: {
    ammonia_refrigeration: { max: 25, unit: 'ppm' },
    carbon_dioxide_refrigeration: { max: 5000, unit: 'ppm' },
    decomposition_gases: 'continuous_monitoring_required'
  },
  
  // NL Mining Industry Specific
  miningSpecific: {
    methane_underground: { max: 1.25, unit: '%' },
    nitrogen_oxides: { max: 3, unit: 'ppm' },
    dust_particulates: { max: 3, unit: 'mg/m³' }
  }
};

// =================== NL PERSONNEL QUALIFICATIONS ===================

export const NL_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'nl_competent_person',
    title: { 
      en: 'Competent Person - Confined Space', 
      fr: 'Personne Compétente - Espace Clos' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with NL OHS Act and Regulations',
      'Ability to identify hazardous conditions',
      'Authority to implement control measures',
      'Understanding of emergency response procedures'
    ],
    nlSpecific: {
      offshoreCompetency: {
        certifications: ['basic_offshore_safety_induction_training', 'helicopter_underwater_escape_training'],
        experience: 'offshore_platform_or_vessel_operations_experience',
        medicalFitness: 'offshore_medical_certificate_current'
      },
      fisheriesCompetency: {
        marineCertifications: ['marine_emergency_duties_training', 'personal_survival_techniques'],
        vesselExperience: 'fishing_vessel_or_processing_plant_experience'
      },
      miningCompetency: {
        certifications: ['mine_rescue_training', 'underground_mining_safety'],
        experience: 'underground_or_surface_mining_operations'
      }
    },
    certification: 'workplacenl_approved_training_plus_industry_specific',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'workplacenl_confined_space_competent_person',
      'hazard_recognition_and_assessment',
      'atmospheric_testing_and_monitoring',
      'emergency_response_procedures'
    ]
  },

  attendant: {
    id: 'nl_attendant',
    title: { 
      en: 'Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    requirements: [
      'Training in attendant duties and responsibilities',
      'Knowledge of communication procedures and equipment',
      'Understanding of emergency evacuation procedures',
      'Familiarity with atmospheric monitoring equipment',
      'First aid and CPR certification'
    ],
    nlSpecific: {
      offshoreAttendant: {
        certifications: ['basic_offshore_safety_induction', 'offshore_medical_first_aid'],
        communicationSystems: 'offshore_platform_communication_systems_training',
        emergencyResponse: 'helicopter_boat_evacuation_procedures'
      },
      fisheriesAttendant: {
        marineCertifications: ['marine_emergency_duties', 'elementary_first_aid'],
        vesselOperations: 'fishing_vessel_safety_procedures_training'
      },
      miningAttendant: {
        certifications: ['mine_rescue_awareness', 'underground_first_aid'],
        communicationSystems: 'mine_communication_and_tracking_systems'
      }
    },
    certification: 'workplacenl_approved_training_program',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'nl_atmospheric_tester',
    title: { 
      en: 'Atmospheric Tester', 
      fr: 'Testeur Atmosphérique' 
    },
    authority: 'WorkplaceNL',
    jurisdiction: ['NL'],
    requirements: [
      'Training on gas detection equipment operation',
      'Knowledge of NL atmospheric standards and limits',
      'Understanding of equipment calibration procedures',
      'Ability to interpret test results accurately',
      'Knowledge of equipment limitations and maintenance'
    ],
    nlSpecific: {
      offshoreTesting: {
        equipmentCertification: 'intrinsically_safe_equipment_operation',
        environmentalFactors: 'offshore_environmental_conditions_training',
        gasKnowledge: 'petroleum_industry_gas_hazards_training'
      },
      fisheriesTesting: {
        marineEnvironment: 'vessel_motion_compensation_testing_techniques',
        refrigerationGases: 'ammonia_and_co2_detection_systems_training'
      },
      miningTesting: {
        undergroundTesting: 'underground_atmospheric_monitoring_systems',
        ventilationAssessment: 'mine_ventilation_effectiveness_evaluation'
      }
    },
    certification: 'equipment_manufacturer_plus_industry_specific_training',
    validity: 'annual_recertification_with_equipment_updates'
  }
};

// =================== NL EMERGENCY SERVICES ===================

export const NL_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    workplacenl: '1-800-563-9000'
  },
  
  offshore: {
    coastGuard: '1-800-565-1582',
    offshoreSafety: '1-800-563-3638',
    helicopterServices: {
      cougarHelicopters: '709-758-7050',
      exxonMobilHelicopter: '709-778-8000'
    },
    offshoreInstallations: {
      hibernia: '709-778-8000',
      terraNova: '709-778-1400',
      whiteRose: '709-778-9000',
      hebron: '709-778-8700'
    }
  },
  
  fisheries: {
    coastGuardRescue: '1-800-565-1582',
    fisheriesSafety: '709-772-4423',
    marinetTransportation: '709-729-3080',
    portAuthorities: {
      stJohns: '709-758-2688',
      cornerBrook: '709-637-2626'
    }
  },
  
  mining: {
    mineRescue: '911_request_mine_rescue_team',
    laboradorMining: {
      ironOreCompany: '709-944-8000',
      miningAssociation: '709-754-4160'
    },
    undergroundEmergency: 'mine_specific_emergency_response_teams'
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_technical_rescue_team',
    offshoreEvacuation: 'cougar_helicopters_search_rescue',
    marineRescue: 'canadian_coast_guard_auxiliary_newfoundland',
    mineRescue: 'provincial_mine_rescue_association'
  }
};

// =================== COMPLIANCE CHECKING ===================

export function checkNLCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'offshore' | 'fisheries' | 'mining' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(NL_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(NL_REGULATION_STANDARDS).forEach(standard => {
    const check = performNLStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'NL',
    overallCompliance,
    results,
    criticalNonCompliance,
    nlSpecific: {
      industryType: industryType || 'general',
      offshoreConsiderations: industryType === 'offshore' ? getOffshoreConsiderations() : undefined,
      fisheriesConsiderations: industryType === 'fisheries' ? getFisheriesConsiderations() : undefined,
      miningConsiderations: industryType === 'mining' ? getMiningConsiderations() : undefined,
      emergencyServices: getNLEmergencyServices(industryType),
      weatherFactors: getNLWeatherFactors(industryType),
      regulatoryIntegration: getNLRegulatoryIntegration(industryType)
    },
    actionPlan: generateNLActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performNLStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  // Implementation specific to each standard
  switch (standard.id) {
    case 'NL_OHS_85':
      return checkConfinedSpaceIdentification(permitData);
    case 'NL_OHS_87':
      return checkHazardAssessment(permitData, industryType);
    case 'NL_OHS_89':
      return checkAtmosphericTesting(atmosphericReadings, industryType);
    case 'NL_OHS_92':
      return checkEntryPermitSystem(permitData, industryType);
    case 'NL_OHS_95':
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

function getOffshoreConsiderations() {
  return {
    weatherLimitations: 'sea_state_wind_visibility_helicopter_limits',
    evacuationProcedures: 'helicopter_boat_abandonment_procedures',
    communicationSystems: 'multi_redundant_offshore_communication',
    specializedEquipment: 'intrinsically_safe_offshore_equipment',
    regulatoryOversight: 'canada_newfoundland_offshore_petroleum_board'
  };
}

function getFisheriesConsiderations() {
  return {
    vesselOperations: 'fishing_vessel_stability_and_safety',
    marineEnvironment: 'sea_conditions_and_vessel_motion',
    refrigerationHazards: 'ammonia_and_co2_refrigeration_systems',
    portRegulations: 'transport_canada_marine_safety_integration',
    seasonalFactors: 'ice_conditions_and_weather_limitations'
  };
}

function getMiningConsiderations() {
  return {
    undergroundOperations: 'mine_ventilation_and_ground_conditions',
    equipmentHazards: 'mobile_equipment_and_machinery_integration',
    emergencyResponse: 'mine_rescue_team_coordination',
    ventilationSystems: 'mine_ventilation_effectiveness_monitoring',
    communicationSystems: 'underground_communication_and_tracking'
  };
}

function getNLEmergencyServices(industryType?: string) {
  const base = NL_EMERGENCY_SERVICES.general;
  
  if (industryType === 'offshore') {
    return { ...base, ...NL_EMERGENCY_SERVICES.offshore };
  }
  
  if (industryType === 'fisheries') {
    return { ...base, ...NL_EMERGENCY_SERVICES.fisheries };
  }
  
  if (industryType === 'mining') {
    return { ...base, ...NL_EMERGENCY_SERVICES.mining };
  }
  
  return base;
}

function getNLWeatherFactors(industryType?: string) {
  const baseFactors = ['temperature', 'precipitation', 'wind', 'visibility'];
  
  if (industryType === 'offshore') {
    return [...baseFactors, 'sea_state', 'helicopter_limits', 'fog', 'ice_conditions'];
  }
  
  if (industryType === 'fisheries') {
    return [...baseFactors, 'sea_conditions', 'ice_formation', 'storm_systems'];
  }
  
  if (industryType === 'mining') {
    return [...baseFactors, 'ground_conditions', 'seasonal_access'];
  }
  
  return baseFactors;
}

function getNLRegulatoryIntegration(industryType?: string) {
  const base = ['workplacenl', 'service_nl'];
  
  if (industryType === 'offshore') {
    return [...base, 'c_nlopb', 'transport_canada', 'environment_climate_change'];
  }
  
  if (industryType === 'fisheries') {
    return [...base, 'transport_canada_marine', 'fisheries_oceans_canada'];
  }
  
  if (industryType === 'mining') {
    return [...base, 'natural_resources_canada', 'environment_climate_change'];
  }
  
  return base;
}

function generateNLActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getNLCorrectiveAction(result.requirementId, industryType),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getNLRequiredResources(result.requirementId, industryType),
    verification: 'workplacenl_inspector_verification'
  }));
}

function getNLCorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      en: `Identify and classify all confined spaces in ${industryType || 'workplace'} operations`,
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'du lieu de travail'}`
    },
    hazard_assessment: {
      en: `Conduct comprehensive hazard assessment for ${industryType || 'general'} confined space operations`,
      fr: `Effectuer évaluation complète des dangers pour opérations espaces clos ${industryType || 'générales'}`
    },
    atmospheric_testing: {
      en: `Perform atmospheric testing with industry-specific standards for ${industryType || 'general'} operations`,
      fr: `Effectuer tests atmosphériques selon standards spécifiques industrie pour opérations ${industryType || 'générales'}`
    },
    entry_permit: {
      en: `Implement entry permit system with ${industryType || 'general'} industry requirements`,
      fr: `Implémenter système permis d'entrée avec exigences industrie ${industryType || 'générale'}`
    },
    attendant_present: {
      en: `Assign qualified attendant with ${industryType || 'general'} industry training`,
      fr: `Assigner surveillant qualifié avec formation industrie ${industryType || 'générale'}`
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WorkplaceNL requirements',
    fr: 'Traiter non-conformité identifiée selon exigences WorkplaceNL'
  };
}

function getNLRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['competent_person', 'space_inventory_forms'],
    hazard_assessment: ['competent_person', 'hazard_assessment_tools'],
    atmospheric_testing: ['calibrated_detectors', 'qualified_tester'],
    entry_permit: ['permit_forms', 'competent_person_authorization'],
    attendant_present: ['trained_attendant', 'communication_equipment']
  };
  
  const resources = baseResources[requirementId] || ['competent_person'];
  
  // Add industry-specific resources
  if (industryType === 'offshore') {
    resources.push('intrinsically_safe_equipment', 'offshore_emergency_procedures');
  } else if (industryType === 'fisheries') {
    resources.push('marine_safety_equipment', 'vessel_communication_systems');
  } else if (industryType === 'mining') {
    resources.push('mine_rescue_coordination', 'underground_communication_systems');
  }
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  
  return {
    standardId: 'NL_OHS_85',
    requirementId: 'confined_space_identification',
    status: hasIdentification ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: hasIdentification ? [] : ['Missing confined space identification and classification'],
    priority: 'critical'
  };
}

function checkHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasIndustrySpecificAssessment = industryType ? 
    permitData.hazardAssessment?.industrySpecific?.[industryType] !== undefined : true;
  
  return {
    standardId: 'NL_OHS_87',
    requirementId: 'hazard_assessment',
    status: hasAssessment && hasIndustrySpecificAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['written_hazard_assessment'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Missing written hazard assessment']),
      ...(hasIndustrySpecificAssessment ? [] : [`Missing ${industryType} industry-specific hazard assessment`])
    ],
    priority: 'critical'
  };
}

function checkAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'NL_OHS_89',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = getNLStandardsForIndustry(industryType);
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isReadingCompliant(reading, standards);
  });

  return {
    standardId: 'NL_OHS_89',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: nonCompliantReadings.map(r => 
      `${r.gasType} level ${r.value}${r.unit} outside acceptable range for ${industryType || 'general'} operations`
    ),
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'low'
  };
}

function checkEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasIndustrySpecificRequirements = industryType ? 
    permitData.entryPermit?.industrySpecific?.[industryType] !== undefined : true;
  
  return {
    standardId: 'NL_OHS_92',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasIndustrySpecificRequirements ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['entry_permit_documentation'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Missing entry permit system']),
      ...(hasIndustrySpecificRequirements ? [] : [`Missing ${industryType} industry-specific permit requirements`])
    ],
    priority: 'critical'
  };
}

function checkAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasIndustryTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => hasIndustrySpecificTraining(p, industryType));
  
  return {
    standardId: 'NL_OHS_95',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasIndustryTraining ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No qualified attendant assigned']),
      ...(attendantHasIndustryTraining ? [] : [`Attendant lacks ${industryType} industry-specific training`])
    ],
    priority: 'critical'
  };
}

function getNLStandardsForIndustry(industryType?: string) {
  const baseStandards = NL_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'offshore') {
    return { ...baseStandards, ...baseStandards.offshoreSpecific };
  }
  
  if (industryType === 'fisheries') {
    return { ...baseStandards, ...baseStandards.fisheriesSpecific };
  }
  
  if (industryType === 'mining') {
    return { ...baseStandards, ...baseStandards.miningSpecific };
  }
  
  return baseStandards;
}

function isReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasIndustrySpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  if (!industryType) return true;
  
  const requiredTraining = {
    offshore: ['basic_offshore_safety_induction', 'helicopter_underwater_escape'],
    fisheries: ['marine_emergency_duties', 'personal_survival_techniques'],
    mining: ['mine_rescue_awareness', 'underground_safety']
  };
  
  const required = requiredTraining[industryType as keyof typeof requiredTraining] || [];
  return required.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  WORKPLACENL_AUTHORITY,
  NL_SPECIFIC_FEATURES,
  NL_REGULATION_STANDARDS,
  NL_ATMOSPHERIC_STANDARDS,
  NL_PERSONNEL_QUALIFICATIONS,
  NL_EMERGENCY_SERVICES,
  checkNLCompliance
};

export type NLIndustryType = 'offshore' | 'fisheries' | 'mining' | 'general';
export type NLRegulationStandardId = keyof typeof NL_REGULATION_STANDARDS;
export type NLPersonnelQualificationId = keyof typeof NL_PERSONNEL_QUALIFICATIONS;
