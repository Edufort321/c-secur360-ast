// data/provinces/index.ts

export interface Province {
  code: string;
  name: string;
  nameFr: string;
  safetyAgency: string;
  safetyAgencyFr: string;
  regulations: string[];
  emergencyNumber: string;
  color: string;
}

export const CANADIAN_PROVINCES: Province[] = [
  {
    code: 'AB',
    name: 'Alberta',
    nameFr: 'Alberta',
    safetyAgency: 'Alberta Occupational Health and Safety (OHS)',
    safetyAgencyFr: 'Santé et sécurité au travail de l\'Alberta (SST)',
    regulations: ['Occupational Health and Safety Act', 'OHS Code', 'OHS Regulation'],
    emergencyNumber: '911',
    color: '#1f4e79'
  },
  {
    code: 'BC',
    name: 'British Columbia',
    nameFr: 'Colombie-Britannique',
    safetyAgency: 'WorkSafeBC',
    safetyAgencyFr: 'WorkSafeBC',
    regulations: ['Workers Compensation Act', 'Occupational Health and Safety Regulation'],
    emergencyNumber: '911',
    color: '#234075'
  },
  {
    code: 'MB',
    name: 'Manitoba',
    nameFr: 'Manitoba',
    safetyAgency: 'Workplace Safety and Health (WSH)',
    safetyAgencyFr: 'Sécurité et santé au travail (SST)',
    regulations: ['Workplace Safety and Health Act', 'WSH Regulation'],
    emergencyNumber: '911',
    color: '#8b1538'
  },
  {
    code: 'NB',
    name: 'New Brunswick',
    nameFr: 'Nouveau-Brunswick',
    safetyAgency: 'WorkSafeNB',
    safetyAgencyFr: 'Travail sécuritaire NB',
    regulations: ['Occupational Health and Safety Act', 'General Regulation'],
    emergencyNumber: '911',
    color: '#d4af37'
  },
  {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    nameFr: 'Terre-Neuve-et-Labrador',
    safetyAgency: 'Workplace Health, Safety and Compensation Commission',
    safetyAgencyFr: 'Commission de la santé, de la sécurité et de l\'indemnisation des accidents de travail',
    regulations: ['Occupational Health and Safety Act', 'Occupational Health and Safety Regulations'],
    emergencyNumber: '911',
    color: '#006a4e'
  },
  {
    code: 'NS',
    name: 'Nova Scotia',
    nameFr: 'Nouvelle-Écosse',
    safetyAgency: 'Workers\' Compensation Board of Nova Scotia',
    safetyAgencyFr: 'Commission des accidents du travail de la Nouvelle-Écosse',
    regulations: ['Occupational Health and Safety Act', 'Workplace Safety Regulations'],
    emergencyNumber: '911',
    color: '#003f7f'
  },
  {
    code: 'NT',
    name: 'Northwest Territories',
    nameFr: 'Territoires du Nord-Ouest',
    safetyAgency: 'Workers\' Safety and Compensation Commission',
    safetyAgencyFr: 'Commission de la sécurité au travail et de l\'indemnisation des travailleurs',
    regulations: ['Safety Act', 'General Safety Regulations'],
    emergencyNumber: '911',
    color: '#004225'
  },
  {
    code: 'NU',
    name: 'Nunavut',
    nameFr: 'Nunavut',
    safetyAgency: 'Workers\' Safety and Compensation Commission',
    safetyAgencyFr: 'Commission de la sécurité au travail et de l\'indemnisation des travailleurs',
    regulations: ['Safety Act', 'General Safety Regulations'],
    emergencyNumber: '911',
    color: '#003f7f'
  },
  {
    code: 'ON',
    name: 'Ontario',
    nameFr: 'Ontario',
    safetyAgency: 'Ministry of Labour (MOL)',
    safetyAgencyFr: 'Ministère du Travail (MOL)',
    regulations: ['Occupational Health and Safety Act', 'Ontario Regulation 851', 'OHSA Regulations'],
    emergencyNumber: '911',
    color: '#006a4e'
  },
  {
    code: 'PE',
    name: 'Prince Edward Island',
    nameFr: 'Île-du-Prince-Édouard',
    safetyAgency: 'Workers Compensation Board of PEI',
    safetyAgencyFr: 'Commission des accidents du travail de l\'Î.-P.-É.',
    regulations: ['Occupational Health and Safety Act', 'General Regulations'],
    emergencyNumber: '911',
    color: '#d4af37'
  },
  {
    code: 'QC',
    name: 'Quebec',
    nameFr: 'Québec',
    safetyAgency: 'Commission des normes, de l\'équité, de la santé et de la sécurité du travail (CNESST)',
    safetyAgencyFr: 'Commission des normes, de l\'équité, de la santé et de la sécurité du travail (CNESST)',
    regulations: ['Loi sur la santé et la sécurité du travail (LSST)', 'Règlement sur la santé et la sécurité du travail (RSST)', 'Code de sécurité pour les travaux de construction'],
    emergencyNumber: '911',
    color: '#003f87'
  },
  {
    code: 'SK',
    name: 'Saskatchewan',
    nameFr: 'Saskatchewan',
    safetyAgency: 'Saskatchewan Workers\' Compensation Board',
    safetyAgencyFr: 'Commission des accidents du travail de la Saskatchewan',
    regulations: ['Occupational Health and Safety Act', 'Occupational Health and Safety Regulations'],
    emergencyNumber: '911',
    color: '#006a4e'
  },
  {
    code: 'YT',
    name: 'Yukon',
    nameFr: 'Yukon',
    safetyAgency: 'Yukon Workers\' Compensation Health and Safety Board',
    safetyAgencyFr: 'Commission de la santé et de la sécurité du travail du Yukon',
    regulations: ['Occupational Health and Safety Act', 'Occupational Health and Safety Regulation'],
    emergencyNumber: '911',
    color: '#003f7f'
  }
];

export interface ProvinceFormRequirements {
  province: string;
  requiredFields: string[];
  additionalDocuments: string[];
  specificRegulations: string[];
  emergencyProtocols: string[];
}

export const PROVINCE_FORM_REQUIREMENTS: ProvinceFormRequirements[] = [
  {
    province: 'QC',
    requiredFields: [
      'permis_cnesst',
      'numero_ase',
      'representant_prevention',
      'comite_sst',
      'plan_prevention',
      'formation_sst'
    ],
    additionalDocuments: [
      'Certificat CNESST',
      'Plan de prévention SST',
      'Formation des travailleurs',
      'Analyse des risques CNESST'
    ],
    specificRegulations: [
      'LSST Art. 51',
      'RSST Section II',
      'Code sécurité construction'
    ],
    emergencyProtocols: [
      'Appeler 911',
      'Notifier CNESST dans les 24h',
      'Préserver les lieux',
      'Enquête interne obligatoire'
    ]
  },
  {
    province: 'ON',
    requiredFields: [
      'wsib_number',
      'mol_compliance',
      'joint_health_safety_committee',
      'workplace_inspection',
      'training_records',
      'incident_reporting'
    ],
    additionalDocuments: [
      'WSIB Certificate',
      'MOL Compliance Certificate',
      'JHSC Minutes',
      'Training Documentation'
    ],
    specificRegulations: [
      'OHSA Section 25',
      'Ontario Reg. 851',
      'Construction Regulation 213/91'
    ],
    emergencyProtocols: [
      'Call 911',
      'Notify MOL within 48 hours',
      'Preserve accident scene',
      'Internal investigation required'
    ]
  },
  {
    province: 'AB',
    requiredFields: [
      'wcb_number',
      'ohs_compliance',
      'safety_program',
      'hazard_assessment',
      'training_certification',
      'incident_investigation'
    ],
    additionalDocuments: [
      'WCB Certificate',
      'OHS Safety Program',
      'Hazard Assessment',
      'Training Certificates'
    ],
    specificRegulations: [
      'OHS Act Section 3',
      'OHS Code Part 2',
      'OHS Regulation 87/2009'
    ],
    emergencyProtocols: [
      'Call 911',
      'Report to OHS within 24 hours',
      'Secure incident site',
      'Conduct investigation'
    ]
  },
  {
    province: 'BC',
    requiredFields: [
      'worksafebc_account',
      'safety_program',
      'first_aid_attendant',
      'incident_investigation',
      'safety_meetings',
      'equipment_inspection'
    ],
    additionalDocuments: [
      'WorkSafeBC Registration',
      'Safety Program Documentation',
      'First Aid Certificates',
      'Inspection Records'
    ],
    specificRegulations: [
      'Workers Compensation Act',
      'OHS Regulation Part 3',
      'First Aid Regulation'
    ],
    emergencyProtocols: [
      'Call 911',
      'Report to WorkSafeBC immediately',
      'Provide first aid',
      'Investigation within 48h'
    ]
  }
];

// Fonctions utilitaires
export const getProvinceByCode = (code: string): Province | undefined => {
  return CANADIAN_PROVINCES.find(province => province.code === code);
};

export const getProvinceRequirements = (provinceCode: string): ProvinceFormRequirements | undefined => {
  return PROVINCE_FORM_REQUIREMENTS.find(req => req.province === provinceCode);
};

export const getAllProvinceNames = (language: 'fr' | 'en' = 'fr'): string[] => {
  return CANADIAN_PROVINCES.map(province => 
    language === 'fr' ? province.nameFr : province.name
  );
};

export const getMultiProvinceRequirements = (provinceCodes: string[]): ProvinceFormRequirements[] => {
  return PROVINCE_FORM_REQUIREMENTS.filter(req => provinceCodes.includes(req.province));
};

export default CANADIAN_PROVINCES;