/**
 * New Brunswick Workplace Health, Safety and Compensation Commission (WorkSafeNB)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: New Brunswick General Regulation under the Occupational Health and Safety Act
 * Section 8: Confined Spaces (Sections 8.1-8.25)
 * 
 * Provincial Focus: Maritime industry, forestry, fisheries, oil refining, bilingual requirements
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

// =================== NEW BRUNSWICK AUTHORITY ===================

export const WORKSAFENB_AUTHORITY = {
  name: 'WorkSafeNB (Workplace Health, Safety and Compensation Commission)',
  acronym: 'WorkSafeNB',
  jurisdiction: ['NB'] as const,
  website: 'https://www.worksafenb.ca',
  contactInfo: {
    phone: '1-800-222-9775',              // Ligne principale WorkSafeNB
    preventionPhone: '506-632-2200',       // Prévention
    email: 'prevention@worksafenb.ca',
    address: '1 Portland Street, P.O. Box 160, Saint John, NB E2L 3X9'
  },
  regionalOffices: [
    { region: 'Saint John', phone: '506-632-2200', languages: ['en', 'fr'] },
    { region: 'Moncton', phone: '506-856-2582', languages: ['en', 'fr'] },
    { region: 'Fredericton', phone: '506-453-2467', languages: ['en', 'fr'] },
    { region: 'Bathurst', phone: '506-547-2020', languages: ['fr', 'en'] },
    { region: 'Edmundston', phone: '506-735-2025', languages: ['fr', 'en'] }
  ],
  languages: ['en', 'fr'] as const,        // Province officiellement bilingue
  powers: [
    'Workplace inspections and investigations',
    'Issuing compliance orders',
    'Stop work orders',
    'Prosecutions and fines',
    'Accident investigations'
  ]
} as const;

// =================== NB SPECIFIC FEATURES ===================

export const NB_SPECIFIC_FEATURES = {
  maritimeIndustry: [
    'shipbuilding_and_repair_facilities',
    'port_operations_confined_spaces',
    'marine_vessel_tank_entries',
    'offshore_platform_operations',
    'fishing_vessel_confined_spaces'
  ],
  forestryOperations: [
    'pulp_mill_digesters_and_tanks',
    'wood_chip_storage_silos',
    'chemical_storage_vessels',
    'paper_machine_confined_spaces',
    'sawmill_equipment_spaces'
  ],
  oilRefining: [
    'irving_oil_refinery_compliance',      // Major NB employer
    'petroleum_storage_tanks',
    'process_vessels_and_reactors',
    'pipeline_maintenance_operations'
  ],
  bilingualRequirements: [
    'documentation_in_both_languages',
    'safety_training_language_choice',
    'emergency_procedures_bilingual',
    'inspection_communication_preference'
  ],
  tidalInfluences: [
    'bay_of_fundy_extreme_tides',          // Marées extrêmes Baie de Fundy
    'tidal_access_considerations',
    'marine_confined_space_timing',
    'emergency_evacuation_tide_dependency'
  ]
} as const;

// =================== NB REGULATION STANDARDS ===================

export const NB_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'NB_OHS_8_1': {
    id: 'NB_OHS_8_1',
    title: { 
      en: 'Confined Space Definition', 
      fr: 'Définition d\'Espace Clos' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    section: '8.1',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Space that is enclosed or partially enclosed',
      'Not designed or intended for human occupancy',
      'Has restricted means of entry or exit',
      'May become hazardous to any person entering it',
      'Includes marine vessels, tanks, and forestry equipment'  // NB specific
    ],
    nbSpecific: {
      maritimeDefinitions: [
        'ship_holds_and_cargo_tanks',
        'ballast_tanks_and_fuel_tanks',
        'engine_rooms_and_pump_rooms',
        'void_spaces_in_vessels'
      ],
      forestryDefinitions: [
        'pulp_digesters_and_bleach_towers',
        'chip_bins_and_storage_silos',
        'recovery_boilers_and_lime_kilns'
      ]
    },
    penalties: {
      individual: { min: 295, max: 50000 },    // 2023 amounts
      corporation: { min: 1475, max: 500000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'New Brunswick General Regulation',
        citation: 'N.B. Reg. 91-191',
        url: 'https://laws.gnb.ca/en/regulations/91-191'
      }
    ]
  },

  'NB_OHS_8_5': {
    id: 'NB_OHS_8_5',
    title: { 
      en: 'Written Safety Program', 
      fr: 'Programme de Sécurité Écrit' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    section: '8.5',
    category: 'program_requirements',
    mandatory: true,
    criteria: [
      'Written safety program for confined space entry',
      'Identification of all confined spaces in workplace',
      'Hazard assessment procedures',
      'Entry procedures and safety measures',
      'Emergency response procedures',
      'Training requirements for workers'
    ],
    nbSpecific: {
      bilingualDocumentation: 'program_available_in_french_and_english',
      maritimeRequirements: 'transport_canada_marine_integration',
      forestryRequirements: 'pulp_paper_industry_specific_hazards'
    },
    implementation: {
      timeline: 'immediate_upon_confined_space_identification',
      resources: ['competent_person', 'safety_committee_consultation'],
      responsibilities: ['employer', 'safety_coordinator', 'supervisors']
    }
  },

  'NB_OHS_8_8': {
    id: 'NB_OHS_8_8',
    title: { 
      en: 'Atmospheric Testing', 
      fr: 'Tests Atmosphériques' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    section: '8.8',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Atmospheric testing by competent person',
      'Testing for oxygen, flammable gases, and toxic substances',
      'Testing before entry and continuously during occupation',
      'Calibrated and maintained testing equipment',
      'Documentation of all test results'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LEL' },
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    nbSpecific: {
      maritimeTesting: {
        additionalGases: ['benzene_petroleum_products', 'inert_gas_cargo_systems'],
        tidalConsiderations: 'test_timing_with_tide_cycles',
        marineEnvironment: 'saltwater_equipment_considerations'
      },
      forestryTesting: {
        chemicalHazards: ['chlorine_dioxide', 'sulfur_compounds', 'methanol'],
        pulpMillSpecific: 'kraft_process_chemical_monitoring',
        ventilationChallenges: 'stack_effect_in_tall_structures'
      }
    }
  },

  'NB_OHS_8_15': {
    id: 'NB_OHS_8_15',
    title: { 
      en: 'Attendant Requirements', 
      fr: 'Exigences du Surveillant' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    section: '8.15',
    category: 'personnel_requirements',
    mandatory: true,
    criteria: [
      'Trained attendant stationed outside confined space',
      'Maintains continuous communication with entrants',
      'Monitors external conditions that may affect safety',
      'Initiates emergency rescue procedures when necessary',
      'Does not enter space except for rescue by trained personnel'
    ],
    nbSpecific: {
      maritimeAttendant: {
        marineRadioProtocols: 'vhf_channel_monitoring_requirements',
        tidalAwareness: 'bay_of_fundy_tide_monitoring',
        vesselMovement: 'ship_motion_safety_considerations'
      },
      bilingualCommunication: 'attendant_language_competency_matching_crew'
    }
  }
};

// =================== NB ATMOSPHERIC STANDARDS ===================

export const NB_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LEL' },
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // NB Maritime Industry Specific
  maritimeSpecific: {
    benzene: { max: 1, unit: 'ppm' },                // Petroleum operations
    inert_gas_oxygen: { min: 5, max: 8, unit: '%' }, // Cargo tank inerting
    cargo_vapors: 'per_material_safety_data_sheet'
  },
  
  // NB Forestry Industry Specific  
  forestrySpecific: {
    chlorine_dioxide: { max: 0.1, unit: 'ppm' },     // Pulp bleaching
    sulfur_dioxide: { max: 2, unit: 'ppm' },         // Kraft process
    methanol: { max: 200, unit: 'ppm' },             // Pulp mill operations
    turpentine_vapors: { max: 100, unit: 'ppm' }     // Wood processing
  }
} as const;

// =================== NB PERSONNEL QUALIFICATIONS ===================

export const NB_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  competent_person: {
    id: 'nb_competent_person',
    title: { 
      en: 'Competent Person - Confined Space', 
      fr: 'Personne Compétente - Espace Clos' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    requirements: [
      'Knowledge, training and experience in confined space hazards',
      'Familiarity with NB OHS Act and Regulations',
      'Ability to identify hazardous conditions',
      'Authority to take corrective measures',
      'Understanding of emergency procedures'
    ],
    nbSpecific: {
      bilingualCompetency: 'language_skills_matching_workplace_requirements',
      maritimeExperience: 'marine_confined_space_specialized_knowledge',
      forestryExperience: 'pulp_paper_mill_process_understanding'
    },
    certification: 'employer_verification_plus_training_records',
    validity: 'ongoing_with_annual_refresher',
    mandatoryTraining: [
      'worksafenb_confined_space_program',
      'hazard_recognition_and_assessment',
      'atmospheric_testing_procedures',
      'emergency_response_procedures'
    ]
  },

  attendant: {
    id: 'nb_attendant',
    title: { 
      en: 'Confined Space Attendant', 
      fr: 'Surveillant d\'Espace Clos' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    requirements: [
      'Training in attendant duties and responsibilities',
      'Knowledge of communication procedures',
      'Understanding of emergency evacuation procedures',
      'Familiarity with atmospheric monitoring equipment',
      'First aid training recommended'
    ],
    nbSpecific: {
      maritimeAttendant: {
        marineRadio: 'vhf_radio_operator_certification',
        vesselSafety: 'transport_canada_marine_safety_training',
        tidalAwareness: 'bay_of_fundy_tide_table_reading'
      },
      bilingualRequirements: 'communication_in_worker_preferred_language'
    },
    certification: 'worksafenb_approved_training_program',
    validity: 'annual_recertification'
  },

  atmospheric_tester: {
    id: 'nb_atmospheric_tester',
    title: { 
      en: 'Atmospheric Tester', 
      fr: 'Testeur Atmosphérique' 
    },
    authority: 'WorkSafeNB',
    jurisdiction: ['NB'],
    requirements: [
      'Training on gas detection equipment operation',
      'Knowledge of NB atmospheric standards',
      'Understanding of equipment calibration procedures',
      'Ability to interpret test results',
      'Knowledge of equipment limitations'
    ],
    nbSpecific: {
      maritimeTesting: {
        marineGases: 'petroleum_vapor_inert_gas_detection_training',
        shipboardOperations: 'vessel_confined_space_testing_procedures'
      },
      forestryTesting: {
        pulpMillGases: 'kraft_process_chemical_detection_training',
        industrialVentilation: 'stack_effect_ventilation_assessment'
      }
    },
    certification: 'equipment_manufacturer_or_third_party_training',
    validity: 'annual_recertification_with_equipment_updates'
  }
};

// =================== NB EMERGENCY SERVICES ===================

export const NB_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    worksafenb: '1-800-222-9775'
  },
  
  maritime: {
    coastGuard: '1-800-565-1582',            // Maritime Rescue Sub-Centre Halifax
    marineEmergency: 'VHF Channel 16',        // International distress frequency
    portAuthority: {
      saintJohn: '506-636-4869',             // Port Saint John Authority
      belledune: '506-522-1200'              // Port of Belledune
    }
  },
  
  forestry: {
    dnrFire: '1-800-442-4804',               // Department Natural Resources - Forest Fire
    pulpMillEmergency: {
      irvingPulp: '506-648-3200',            // Irving Pulp & Paper Saint John
      twinRivers: '506-735-6700'             // Twin Rivers Paper Edmundston
    }
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_request_specialized_team',
    marineRescue: 'canadian_coast_guard_auxiliary',
    technicalRescue: 'local_fire_department_technical_rescue'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkNBCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  workplaceType?: 'maritime' | 'forestry' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(NB_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(NB_REGULATION_STANDARDS).forEach(standard => {
    const check = performNBStandardCheck(standard, permitData, atmosphericReadings, personnel, workplaceType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'NB',
    overallCompliance,
    results,
    criticalNonCompliance,
    nbSpecific: {
      workplaceType: workplaceType || 'general',
      bilingualCompliance: checkBilingualCompliance(permitData, personnel),
      maritimeConsiderations: workplaceType === 'maritime' ? getMaritimeConsiderations() : undefined,
      forestryConsiderations: workplaceType === 'forestry' ? getForestryConsiderations() : undefined,
      emergencyServices: getNBEmergencyServices(workplaceType)
    },
    actionPlan: generateNBActionPlan(results.filter(r => r.status === 'non_compliant'))
  };
}

function performNBStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  workplaceType?: string
): ComplianceCheck {
  // Implementation specific to each standard
  switch (standard.id) {
    case 'NB_OHS_8_1':
      return checkConfinedSpaceIdentification(permitData);
    case 'NB_OHS_8_5':
      return checkWrittenSafetyProgram(permitData, workplaceType);
    case 'NB_OHS_8_8':
      return checkAtmosphericTesting(atmosphericReadings, workplaceType);
    case 'NB_OHS_8_15':
      return checkAttendantRequirements(personnel, workplaceType);
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

function checkBilingualCompliance(permitData: LegalPermit, personnel: PersonnelData[]): boolean {
  // Check if documentation and training available in required languages
  const hasEnglishDocs = permitData.documentation?.some(doc => doc.language === 'en');
  const hasFrenchDocs = permitData.documentation?.some(doc => doc.language === 'fr');
  const personnelLanguageNeeds = personnel.map(p => p.preferredLanguage);
  
  return (hasEnglishDocs && hasFrenchDocs) || 
         personnelLanguageNeeds.every(lang => 
           permitData.documentation?.some(doc => doc.language === lang)
         );
}

function getMaritimeConsiderations() {
  return {
    tidalInfluences: 'bay_of_fundy_extreme_tide_considerations',
    marineRegulations: 'transport_canada_marine_integration_required',
    emergencyAccess: 'coast_guard_coordination',
    specializedEquipment: 'marine_confined_space_rescue_equipment'
  };
}

function getForestryConsiderations() {
  return {
    chemicalHazards: 'kraft_process_chemical_monitoring',
    structuralHazards: 'tall_vessel_and_tower_access',
    emergencyResponse: 'mill_emergency_response_team_integration',
    environmentalFactors: 'stack_effect_ventilation_challenges'
  };
}

function getNBEmergencyServices(workplaceType?: string) {
  const base = NB_EMERGENCY_SERVICES.general;
  
  if (workplaceType === 'maritime') {
    return { ...base, ...NB_EMERGENCY_SERVICES.maritime };
  }
  
  if (workplaceType === 'forestry') {
    return { ...base, ...NB_EMERGENCY_SERVICES.forestry };
  }
  
  return base;
}

function generateNBActionPlan(nonCompliantResults: ComplianceCheck[]): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getNBCorrectiveAction(result.requirementId),
    responsible: 'competent_person',
    deadline: result.priority === 'critical' ? 'immediate' : 
              result.priority === 'high' ? '24_hours' : '7_days',
    resources: getNBRequiredResources(result.requirementId),
    verification: 'worksafenb_inspector_verification'
  }));
}

function getNBCorrectiveAction(requirementId: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    written_safety_program: {
      en: 'Develop written confined space safety program with NB-specific requirements',
      fr: 'Élaborer programme de sécurité écrit pour espaces clos avec exigences NB'
    },
    atmospheric_testing: {
      en: 'Conduct atmospheric testing by competent person with calibrated equipment',
      fr: 'Effectuer tests atmosphériques par personne compétente avec équipement calibré'
    },
    attendant_present: {
      en: 'Assign trained attendant outside confined space with communication capability',
      fr: 'Assigner surveillant formé à l\'extérieur de l\'espace avec capacité communication'
    }
  };
  
  return actions[requirementId] || {
    en: 'Address identified non-compliance according to WorkSafeNB requirements',
    fr: 'Traiter non-conformité identifiée selon exigences WorkSafeNB'
  };
}

function getNBRequiredResources(requirementId: string): string[] {
  const resources: Record<string, string[]> = {
    written_safety_program: ['competent_person', 'safety_committee', 'worksafenb_guidelines'],
    atmospheric_testing: ['calibrated_detectors', 'competent_tester', 'documentation_forms'],
    attendant_present: ['trained_attendant', 'communication_equipment', 'emergency_procedures']
  };
  
  return resources[requirementId] || ['competent_person', 'worksafenb_consultation'];
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  
  return {
    standardId: 'NB_OHS_8_1',
    requirementId: 'confined_space_identification',
    status: hasIdentification ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['space_identification_documentation'] : [],
    gaps: hasIdentification ? [] : ['Missing confined space identification'],
    priority: 'critical'
  };
}

function checkWrittenSafetyProgram(permitData: LegalPermit, workplaceType?: string): ComplianceCheck {
  const hasProgram = permitData.safetyProgram !== undefined;
  const hasBilingualDocs = workplaceType ? 
    permitData.documentation?.some(doc => doc.language === 'en') &&
    permitData.documentation?.some(doc => doc.language === 'fr') : true;
  
  return {
    standardId: 'NB_OHS_8_5',
    requirementId: 'written_safety_program',
    status: hasProgram && hasBilingualDocs ? 'compliant' : 'non_compliant',
    evidence: hasProgram ? ['written_safety_program'] : [],
    gaps: [
      ...(hasProgram ? [] : ['Missing written safety program']),
      ...(hasBilingualDocs ? [] : ['Missing bilingual documentation'])
    ],
    priority: 'critical'
  };
}

function checkAtmosphericTesting(atmosphericReadings: AtmosphericReading[], workplaceType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'NB_OHS_8_8',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['No atmospheric testing conducted'],
      priority: 'critical'
    };
  }

  const standards = NB_ATMOSPHERIC_STANDARDS;
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    const gasStandard = standards[reading.gasType as keyof typeof standards];
    if (!gasStandard) return false;
    
    if ('min' in gasStandard && 'max' in gasStandard) {
      return reading.value < gasStandard.min || reading.value > gasStandard.max;
    }
    if ('max' in gasStandard) {
      return reading.value > gasStandard.max;
    }
    return false;
  });

  return {
    standardId: 'NB_OHS_8_8',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 ? 'compliant' : 'non_compliant',
    evidence: ['atmospheric_test_results'],
    gaps: nonCompliantReadings.map(r => 
      `${r.gasType} level ${r.value}${r.unit} outside acceptable range`
    ),
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'low'
  };
}

function checkAttendantRequirements(personnel: PersonnelData[], workplaceType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'attendant');
  const attendantHasTraining = personnel
    .filter(p => p.role === 'attendant')
    .every(p => p.qualifications?.some(q => q.type === 'attendant_training'));
  
  return {
    standardId: 'NB_OHS_8_15',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasTraining ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['attendant_assigned'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['No attendant assigned']),
      ...(attendantHasTraining ? [] : ['Attendant lacks required training'])
    ],
    priority: 'critical'
  };
}

// =================== EXPORTS ===================

export default {
  WORKSAFENB_AUTHORITY,
  NB_SPECIFIC_FEATURES,
  NB_REGULATION_STANDARDS,
  NB_ATMOSPHERIC_STANDARDS,
  NB_PERSONNEL_QUALIFICATIONS,
  NB_EMERGENCY_SERVICES,
  checkNBCompliance
};

export type NBWorkplaceType = 'maritime' | 'forestry' | 'general';
export type NBRegulationStandardId = keyof typeof NB_REGULATION_STANDARDS;
export type NBPersonnelQualificationId = keyof typeof NB_PERSONNEL_QUALIFICATIONS;
