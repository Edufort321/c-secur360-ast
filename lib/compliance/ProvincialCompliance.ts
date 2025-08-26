// =================== CONFORMITÉ PROVINCIALE CANADIENNE ===================
// Service de conformité aux normes de santé-sécurité par province
// CRITIQUE: Documents légaux officiels en cas d'accident

export type CanadianProvince = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';

// =================== INTERFACES PROVINCIALES ===================

export interface ProvincialRegulation {
  province: CanadianProvince;
  organizationName: string;
  organizationAcronym: string;
  mainAct: string;
  websiteUrl: string;
  emergencyPhone: string;
  inspectorPhone: string;
  regulations: {
    confinedSpace: RegulationDetail;
    electrical: RegulationDetail;
    excavation: RegulationDetail;
    hotWork: RegulationDetail;
    heightWork: RegulationDetail;
    chemical: RegulationDetail;
  };
  complianceRequirements: ComplianceRequirement[];
}

export interface RegulationDetail {
  regulationNumber: string;
  title: string;
  sections: string[];
  permitRequired: boolean;
  trainingRequired: boolean;
  inspectionRequired: boolean;
  documentationRetention: string; // Ex: "7 ans"
  specificRequirements: string[];
  penalties: {
    individual: string;
    corporate: string;
  };
}

export interface ComplianceRequirement {
  type: 'permit' | 'training' | 'inspection' | 'documentation' | 'notification';
  description: string;
  frequency: string;
  deadline: string;
  responsibleParty: string;
}

// =================== DONNÉES PROVINCIALES ===================

export const PROVINCIAL_REGULATIONS: Record<CanadianProvince, ProvincialRegulation> = {
  // QUÉBEC - CNESST
  QC: {
    province: 'QC',
    organizationName: 'Commission des normes, de l\'équité, de la santé et de la sécurité du travail',
    organizationAcronym: 'CNESST',
    mainAct: 'Loi sur la santé et la sécurité du travail (RLRQ chapitre S-2.1)',
    websiteUrl: 'https://www.cnesst.gouv.qc.ca',
    emergencyPhone: '1-844-838-0808',
    inspectorPhone: '1-844-838-0808',
    
    regulations: {
      confinedSpace: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 297-312',
        title: 'Règlement sur la santé et la sécurité du travail - Espaces clos',
        sections: ['297', '298', '299', '300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Test atmosphérique obligatoire avant entrée',
          'Surveillance continue par personnel qualifié',
          'Moyens de communication établis',
          'Plan de sauvetage d\'urgence',
          'Concentration gaz inflammables ≤ 5% de la limite inférieure d\'explosion',
          'Personnel qualifié seulement autorisé à travailler'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      },
      
      electrical: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 185-196',
        title: 'Règlement sur la santé et la sécurité du travail - Électricité',
        sections: ['185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Verrouillage/étiquetage obligatoire',
          'Personnel qualifié CSA Z462 requis',
          'Vérification absence de tension',
          'Équipement de protection individuelle approprié',
          'Interdiction échelles métalliques près circuits exposés'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      },
      
      excavation: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 217-242',
        title: 'Règlement sur la santé et la sécurité du travail - Excavation',
        sections: ['217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Plan de creusage approuvé par ingénieur',
          'Localisation services publics obligatoire (Info-Excavation)',
          'Talutage selon type de sol',
          'Moyens d\'accès et de sortie à max 7,5m',
          'Surveillance continue si profondeur > 1,2m'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      },
      
      hotWork: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 243-256',
        title: 'Règlement sur la santé et la sécurité du travail - Travaux à chaud',
        sections: ['243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Surveillance feu obligatoire pendant et après travaux',
          'Période de surveillance post-travaux: minimum 60 minutes',
          'Équipement d\'extinction à proximité',
          'Formation surveillant de feu certifiée',
          'Plan d\'urgence incendie'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      },
      
      heightWork: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 257-296',
        title: 'Règlement sur la santé et la sécurité du travail - Travail en hauteur',
        sections: ['257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '292', '293', '294', '295', '296'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Protection antichute obligatoire > 3m',
          'Inspection quotidienne équipement',
          'Plan de sauvetage défini',
          'Formation travail en hauteur certifiée'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      },
      
      chemical: {
        regulationNumber: 'RLRQ chapitre S-2.1, r. 13, sections 313-339',
        title: 'Règlement sur la santé et la sécurité du travail - Matières dangereuses',
        sections: ['313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '337', '338', '339'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 ans',
        specificRequirements: [
          'Évaluation des risques chimiques',
          'SIMDUT 2015 obligatoire',
          'Fiches de données de sécurité disponibles',
          'Équipement protection respiratoire approprié'
        ],
        penalties: {
          individual: 'Max 25 000$ ou emprisonnement max 12 mois',
          corporate: 'Max 500 000$'
        }
      }
    },
    
    complianceRequirements: [
      {
        type: 'permit',
        description: 'Permis de travail obligatoire pour tous travaux dangereux',
        frequency: 'Par projet',
        deadline: 'Avant début des travaux',
        responsibleParty: 'Employeur/Superviseur qualifié'
      },
      {
        type: 'training',
        description: 'Formation du personnel selon nature des travaux',
        frequency: 'Selon programme défini',
        deadline: 'Avant assignation aux tâches',
        responsibleParty: 'Employeur'
      },
      {
        type: 'documentation',
        description: 'Conservation documents sécurité',
        frequency: 'Continue',
        deadline: '7 ans après fin des travaux',
        responsibleParty: 'Employeur'
      }
    ]
  },

  // ONTARIO - WSIB
  ON: {
    province: 'ON',
    organizationName: 'Workplace Safety and Insurance Board',
    organizationAcronym: 'WSIB / Ministry of Labour',
    mainAct: 'Occupational Health and Safety Act (R.S.O. 1990, c. O.1)',
    websiteUrl: 'https://www.wsib.ca',
    emergencyPhone: '1-800-387-0750',
    inspectorPhone: '1-877-202-0008',
    
    regulations: {
      confinedSpace: {
        regulationNumber: 'O. Reg. 632/05',
        title: 'Confined Spaces Regulation',
        sections: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Entry permit system mandatory',
          'Atmospheric testing before entry',
          'Continuous monitoring during work',
          'Trained attendant outside space',
          'Emergency rescue procedures established',
          'Written confined space program required'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      },
      
      electrical: {
        regulationNumber: 'O. Reg. 851/90, sections 43-57',
        title: 'Industrial Establishments - Electrical',
        sections: ['43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Lockout/tagout procedures mandatory',
          'Qualified worker requirements',
          'Electrical safety program required',
          'Arc flash risk assessment',
          'Personal protective equipment standards'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      },
      
      excavation: {
        regulationNumber: 'O. Reg. 213/91, sections 220-239',
        title: 'Construction Projects - Excavation',
        sections: ['220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Utility location mandatory (Ontario One Call)',
          'Soil classification required',
          'Protective systems for depths > 1.2m',
          'Safe means of egress within 7.5m',
          'Daily inspection by competent person'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      },
      
      hotWork: {
        regulationNumber: 'O. Reg. 851/90, sections 58-71',
        title: 'Industrial Establishments - Hot Work',
        sections: ['58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Fire watch required during and after work',
          'Hot work permit system mandatory',
          'Fire extinguishing equipment readily available',
          'Area cleared of combustible materials',
          'Post-work fire watch minimum 60 minutes'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      },
      
      heightWork: {
        regulationNumber: 'O. Reg. 213/91, sections 125-159',
        title: 'Construction Projects - Fall Protection',
        sections: ['125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Fall protection required > 3m height',
          'Written rescue procedures required',
          'Daily equipment inspection',
          'Fall protection training mandatory'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      },
      
      chemical: {
        regulationNumber: 'O. Reg. 851/90, sections 125-155',
        title: 'Industrial Establishments - Chemical and Biological Substances',
        sections: ['125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'WHMIS 2015 compliance mandatory',
          'Safety data sheets available',
          'Chemical risk assessment required',
          'Respiratory protection program'
        ],
        penalties: {
          individual: 'Max $25,000 or imprisonment max 12 months',
          corporate: 'Max $500,000'
        }
      }
    },
    
    complianceRequirements: [
      {
        type: 'permit',
        description: 'Work permits required for hazardous operations',
        frequency: 'Per project',
        deadline: 'Before work commencement',
        responsibleParty: 'Employer/Competent person'
      },
      {
        type: 'training',
        description: 'Worker training according to work type',
        frequency: 'As per program requirements',
        deadline: 'Before task assignment',
        responsibleParty: 'Employer'
      }
    ]
  },

  // COLOMBIE-BRITANNIQUE - WorkSafeBC
  BC: {
    province: 'BC',
    organizationName: 'Workers\' Compensation Board of British Columbia',
    organizationAcronym: 'WorkSafeBC',
    mainAct: 'Workers Compensation Act (RSBC 2019)',
    websiteUrl: 'https://www.worksafebc.com',
    emergencyPhone: '1-888-621-7233',
    inspectorPhone: '1-888-621-7233',
    
    regulations: {
      confinedSpace: {
        regulationNumber: 'Part 9 - Confined Spaces (sections 9.1-9.25)',
        title: 'Occupational Health and Safety Regulation - Confined Spaces',
        sections: ['9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9', '9.10', '9.11', '9.12', '9.13', '9.14', '9.15', '9.16', '9.17', '9.18', '9.19', '9.20', '9.21', '9.22', '9.23', '9.24', '9.25'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Written confined space program required',
          'Entry permit system mandatory',
          'Atmospheric testing and monitoring',
          'Trained attendant required',
          'Emergency rescue procedures'
        ],
        penalties: {
          individual: 'Max $672,627 individual',
          corporate: 'Max $6,726,279'
        }
      },
      
      electrical: {
        regulationNumber: 'Part 19 - Electrical Safety (sections 19.1-19.35)',
        title: 'Occupational Health and Safety Regulation - Electrical Safety',
        sections: ['19.1', '19.2', '19.3', '19.4', '19.5', '19.6', '19.7', '19.8', '19.9', '19.10', '19.11', '19.12', '19.13', '19.14', '19.15', '19.16', '19.17', '19.18', '19.19', '19.20', '19.21', '19.22', '19.23', '19.24', '19.25', '19.26', '19.27', '19.28', '19.29', '19.30', '19.31', '19.32', '19.33', '19.34', '19.35'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Lockout procedures mandatory',
          'Qualified person requirements',
          'Electrical safety program',
          'Personal protective equipment',
          'Arc flash protection standards'
        ],
        penalties: {
          individual: 'Max $672,627',
          corporate: 'Max $6,726,279'
        }
      },
      
      excavation: {
        regulationNumber: 'Part 20 - Excavation, Tunneling and Caissons (sections 20.1-20.35)',
        title: 'Occupational Health and Safety Regulation - Excavation',
        sections: ['20.1', '20.2', '20.3', '20.4', '20.5', '20.6', '20.7', '20.8', '20.9', '20.10', '20.11', '20.12', '20.13', '20.14', '20.15', '20.16', '20.17', '20.18', '20.19', '20.20', '20.21', '20.22', '20.23', '20.24', '20.25', '20.26', '20.27', '20.28', '20.29', '20.30', '20.31', '20.32', '20.33', '20.34', '20.35'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'BC One Call utility location mandatory',
          'Soil analysis required',
          'Protective systems for depths > 1.2m',
          'Safe access and egress',
          'Competent person daily inspection'
        ],
        penalties: {
          individual: 'Max $672,627',
          corporate: 'Max $6,726,279'
        }
      },
      
      hotWork: {
        regulationNumber: 'Part 5 - Chemical Hazards and Fire Safety (sections 5.55-5.65)',
        title: 'Occupational Health and Safety Regulation - Fire Safety',
        sections: ['5.55', '5.56', '5.57', '5.58', '5.59', '5.60', '5.61', '5.62', '5.63', '5.64', '5.65'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Hot work permit required',
          'Fire watch during and after operations',
          'Fire suppression equipment available',
          'Area preparation and clearance',
          'Post-work monitoring period'
        ],
        penalties: {
          individual: 'Max $672,627',
          corporate: 'Max $6,726,279'
        }
      },
      
      heightWork: {
        regulationNumber: 'Part 11 - Fall Protection (sections 11.1-11.21)',
        title: 'Occupational Health and Safety Regulation - Fall Protection',
        sections: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7', '11.8', '11.9', '11.10', '11.11', '11.12', '11.13', '11.14', '11.15', '11.16', '11.17', '11.18', '11.19', '11.20', '11.21'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Fall protection required > 3m',
          'Written procedures for rescue',
          'Equipment inspection requirements',
          'Training certification required'
        ],
        penalties: {
          individual: 'Max $672,627',
          corporate: 'Max $6,726,279'
        }
      },
      
      chemical: {
        regulationNumber: 'Part 5 - Chemical Hazards (sections 5.1-5.54)',
        title: 'Occupational Health and Safety Regulation - Chemical Hazards',
        sections: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11', '5.12', '5.13', '5.14', '5.15', '5.16', '5.17', '5.18', '5.19', '5.20', '5.21', '5.22', '5.23', '5.24', '5.25', '5.26', '5.27', '5.28', '5.29', '5.30', '5.31', '5.32', '5.33', '5.34', '5.35', '5.36', '5.37', '5.38', '5.39', '5.40', '5.41', '5.42', '5.43', '5.44', '5.45', '5.46', '5.47', '5.48', '5.49', '5.50', '5.51', '5.52', '5.53', '5.54'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'WHMIS 2015 compliance',
          'Chemical risk assessment',
          'Safety data sheets available',
          'Respiratory protection program'
        ],
        penalties: {
          individual: 'Max $672,627',
          corporate: 'Max $6,726,279'
        }
      }
    },
    
    complianceRequirements: [
      {
        type: 'permit',
        description: 'Work permits for high-risk activities',
        frequency: 'Per work activity',
        deadline: 'Before work starts',
        responsibleParty: 'Employer/Supervisor'
      }
    ]
  },

  // ALBERTA - WCB
  AB: {
    province: 'AB',
    organizationName: 'Workers\' Compensation Board of Alberta',
    organizationAcronym: 'WCB Alberta / Alberta Labour',
    mainAct: 'Occupational Health and Safety Act (RSA 2000, c O-2)',
    websiteUrl: 'https://www.wcb.ab.ca',
    emergencyPhone: '1-866-415-8690',
    inspectorPhone: '1-866-415-8690',
    
    regulations: {
      confinedSpace: {
        regulationNumber: 'Part 5 - Confined Spaces (sections 68-88)',
        title: 'Occupational Health and Safety Code - Confined Spaces',
        sections: ['68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Written confined space program',
          'Entry permit system required',
          'Atmospheric testing mandatory',
          'Attendant outside confined space',
          'Emergency rescue procedures'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      },
      
      electrical: {
        regulationNumber: 'Part 16 - Electrical (sections 308-328)',
        title: 'Occupational Health and Safety Code - Electrical',
        sections: ['308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Lockout procedures required',
          'Qualified worker standards',
          'Electrical safety program',
          'Personal protective equipment',
          'Arc flash risk assessment'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      },
      
      excavation: {
        regulationNumber: 'Part 6 - Excavation and Tunnels (sections 89-108)',
        title: 'Occupational Health and Safety Code - Excavation',
        sections: ['89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Alberta One-Call utility location',
          'Soil classification required',
          'Protective systems for depths > 1.2m',
          'Safe access and egress provisions',
          'Daily inspection by competent person'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      },
      
      hotWork: {
        regulationNumber: 'Part 4 - Chemical Hazards Fire and Explosion (sections 40-67)',
        title: 'Occupational Health and Safety Code - Fire Prevention',
        sections: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Hot work permit system',
          'Fire watch requirements',
          'Fire suppression equipment',
          'Area preparation standards',
          'Post-work monitoring'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      },
      
      heightWork: {
        regulationNumber: 'Part 9 - Fall Protection (sections 139-157)',
        title: 'Occupational Health and Safety Code - Fall Protection',
        sections: ['139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'Fall protection required > 3m',
          'Rescue procedures documented',
          'Equipment inspection protocols',
          'Worker training certification'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      },
      
      chemical: {
        regulationNumber: 'Part 4 - Chemical Hazards (sections 40-67)',
        title: 'Occupational Health and Safety Code - Chemical Hazards',
        sections: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67'],
        permitRequired: true,
        trainingRequired: true,
        inspectionRequired: true,
        documentationRetention: '7 years',
        specificRequirements: [
          'WHMIS 2015 compliance',
          'Chemical hazard assessment',
          'Safety data sheets accessible',
          'Respiratory protection requirements'
        ],
        penalties: {
          individual: 'Max $30,000',
          corporate: 'Max $500,000'
        }
      }
    },
    
    complianceRequirements: [
      {
        type: 'permit',
        description: 'Work permits for hazardous work',
        frequency: 'Per operation',
        deadline: 'Before work commencement',
        responsibleParty: 'Employer/Competent person'
      }
    ]
  },

  // Autres provinces - structures similaires mais simplifiées pour l'exemple
  SK: {
    province: 'SK',
    organizationName: 'Saskatchewan Workers\' Compensation Board',
    organizationAcronym: 'WCB Saskatchewan',
    mainAct: 'Occupational Health and Safety Act (SS 1993, c O-1.1)',
    websiteUrl: 'https://www.wcbsask.com',
    emergencyPhone: '1-800-667-7590',
    inspectorPhone: '1-800-667-7590',
    regulations: {} as any,
    complianceRequirements: []
  },

  MB: {
    province: 'MB',
    organizationName: 'Workers Compensation Board of Manitoba',
    organizationAcronym: 'WCB Manitoba',
    mainAct: 'Workplace Safety and Health Act (CCSM c W210)',
    websiteUrl: 'https://www.wcb.mb.ca',
    emergencyPhone: '1-855-954-4321',
    inspectorPhone: '1-855-954-4321',
    regulations: {} as any,
    complianceRequirements: []
  },

  NB: {
    province: 'NB',
    organizationName: 'WorkSafeNB',
    organizationAcronym: 'WorkSafeNB',
    mainAct: 'Occupational Health and Safety Act (RSNB 1973, c O-0.2)',
    websiteUrl: 'https://www.worksafenb.ca',
    emergencyPhone: '1-800-999-9775',
    inspectorPhone: '1-800-999-9775',
    regulations: {} as any,
    complianceRequirements: []
  },

  NS: {
    province: 'NS',
    organizationName: 'Workers\' Compensation Board of Nova Scotia',
    organizationAcronym: 'WCB Nova Scotia',
    mainAct: 'Occupational Health and Safety Act (RSNS 1996, c 7)',
    websiteUrl: 'https://www.wcb.ns.ca',
    emergencyPhone: '1-800-870-3331',
    inspectorPhone: '1-800-870-3331',
    regulations: {} as any,
    complianceRequirements: []
  },

  PE: {
    province: 'PE',
    organizationName: 'Workers Compensation Board of Prince Edward Island',
    organizationAcronym: 'WCB PEI',
    mainAct: 'Occupational Health and Safety Act (RSPEI 1988, c O-1.01)',
    websiteUrl: 'https://www.wcb.pe.ca',
    emergencyPhone: '1-800-237-5049',
    inspectorPhone: '1-800-237-5049',
    regulations: {} as any,
    complianceRequirements: []
  },

  NL: {
    province: 'NL',
    organizationName: 'Workplace Health, Safety and Compensation Commission',
    organizationAcronym: 'WorkplaceNL',
    mainAct: 'Occupational Health and Safety Act (SNL 1995, c O-3)',
    websiteUrl: 'https://www.workplacenl.ca',
    emergencyPhone: '1-800-563-9000',
    inspectorPhone: '1-800-563-9000',
    regulations: {} as any,
    complianceRequirements: []
  },

  YT: {
    province: 'YT',
    organizationName: 'Yukon Workers\' Safety and Compensation Board',
    organizationAcronym: 'YWSCB',
    mainAct: 'Occupational Health and Safety Act (RSY 2002, c 159)',
    websiteUrl: 'https://www.ywscb.ca',
    emergencyPhone: '1-800-661-0443',
    inspectorPhone: '1-800-661-0443',
    regulations: {} as any,
    complianceRequirements: []
  },

  NT: {
    province: 'NT',
    organizationName: 'Workers\' Safety & Compensation Commission',
    organizationAcronym: 'WSCC',
    mainAct: 'Safety Act (SNWT 2003, c 23)',
    websiteUrl: 'https://www.wscc.nt.ca',
    emergencyPhone: '1-800-661-0792',
    inspectorPhone: '1-800-661-0792',
    regulations: {} as any,
    complianceRequirements: []
  },

  NU: {
    province: 'NU',
    organizationName: 'Workers\' Safety & Compensation Commission',
    organizationAcronym: 'WSCC Nunavut',
    mainAct: 'Safety Act (SNu 2003, c 24)',
    websiteUrl: 'https://www.wscc.nt.ca',
    emergencyPhone: '1-800-661-0792',
    inspectorPhone: '1-800-661-0792',
    regulations: {} as any,
    complianceRequirements: []
  }
};

// =================== FONCTIONS DE CONFORMITÉ ===================

export class ProvincialComplianceService {
  private static instance: ProvincialComplianceService;
  
  private constructor() {}
  
  public static getInstance(): ProvincialComplianceService {
    if (!ProvincialComplianceService.instance) {
      ProvincialComplianceService.instance = new ProvincialComplianceService();
    }
    return ProvincialComplianceService.instance;
  }
  
  /**
   * Obtenir la réglementation pour une province spécifique
   */
  getProvincialRegulation(province: CanadianProvince): ProvincialRegulation {
    return PROVINCIAL_REGULATIONS[province];
  }
  
  /**
   * Obtenir les exigences spécifiques pour un type de travail et une province
   */
  getWorkTypeRequirements(
    province: CanadianProvince, 
    workType: keyof ProvincialRegulation['regulations']
  ): RegulationDetail {
    return PROVINCIAL_REGULATIONS[province].regulations[workType];
  }
  
  /**
   * Valider la conformité d'un permis selon la province
   */
  validatePermitCompliance(
    province: CanadianProvince,
    workType: keyof ProvincialRegulation['regulations'],
    permitData: any
  ): {
    isCompliant: boolean;
    violations: string[];
    warnings: string[];
    requiredActions: string[];
  } {
    const regulation = this.getWorkTypeRequirements(province, workType);
    const violations: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];
    
    // Vérifications basiques
    if (regulation.permitRequired && !permitData.hasPermit) {
      violations.push(`Permis obligatoire selon ${regulation.regulationNumber}`);
    }
    
    if (regulation.trainingRequired && !permitData.hasTraining) {
      violations.push(`Formation obligatoire selon ${regulation.regulationNumber}`);
    }
    
    if (regulation.inspectionRequired && !permitData.hasInspection) {
      violations.push(`Inspection obligatoire selon ${regulation.regulationNumber}`);
    }
    
    // Vérifications spécifiques selon le type de travail
    regulation.specificRequirements.forEach(req => {
      requiredActions.push(`OBLIGATOIRE: ${req}`);
    });
    
    return {
      isCompliant: violations.length === 0,
      violations,
      warnings,
      requiredActions
    };
  }
  
  /**
   * Générer un en-tête de conformité légale pour les documents
   */
  generateLegalComplianceHeader(province: CanadianProvince, workType: keyof ProvincialRegulation['regulations']): {
    header: string;
    regulation: RegulationDetail;
    organizationInfo: {
      name: string;
      emergency: string;
      inspector: string;
    };
  } {
    const provincialReg = PROVINCIAL_REGULATIONS[province];
    const regulation = provincialReg.regulations[workType];
    
    const header = `
=== DOCUMENT LÉGAL DE SÉCURITÉ ===
Province: ${province}
Organisation: ${provincialReg.organizationName} (${provincialReg.organizationAcronym})
Réglementation: ${regulation.regulationNumber}
Titre: ${regulation.title}
Sections applicables: ${regulation.sections.join(', ')}

⚠️ AVERTISSEMENT LÉGAL ⚠️
Ce document constitue un document légal officiel de sécurité au travail.
En cas d'accident, ce document sera scruté par les autorités compétentes.
La non-conformité aux exigences réglementaires peut entraîner:
- Amendes individuelles: ${regulation.penalties.individual}
- Amendes corporatives: ${regulation.penalties.corporate}
- Poursuites criminelles en cas de négligence

Urgence: ${provincialReg.emergencyPhone}
Inspecteur: ${provincialReg.inspectorPhone}
Conservation obligatoire: ${regulation.documentationRetention}
=== FIN AVERTISSEMENT LÉGAL ===
    `.trim();
    
    return {
      header,
      regulation,
      organizationInfo: {
        name: provincialReg.organizationName,
        emergency: provincialReg.emergencyPhone,
        inspector: provincialReg.inspectorPhone
      }
    };
  }
  
  /**
   * Obtenir toutes les provinces supportées
   */
  getSupportedProvinces(): CanadianProvince[] {
    return Object.keys(PROVINCIAL_REGULATIONS) as CanadianProvince[];
  }
  
  /**
   * Obtenir les exigences de formation par province et type de travail
   */
  getTrainingRequirements(
    province: CanadianProvince,
    workType: keyof ProvincialRegulation['regulations']
  ): {
    required: boolean;
    certificationNeeded: boolean;
    renewalPeriod?: string;
    standards: string[];
  } {
    const regulation = this.getWorkTypeRequirements(province, workType);
    
    return {
      required: regulation.trainingRequired,
      certificationNeeded: true,
      renewalPeriod: '3 ans', // Générique, peut être spécifié par type
      standards: [`Conformité ${regulation.regulationNumber}`, ...regulation.specificRequirements]
    };
  }
}