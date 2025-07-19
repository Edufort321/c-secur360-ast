// =================== CONSTANTS/PROVINCES.TS - VERSION COMPLÈTE ===================
// Données réglementaires officielles et permis de travail complets du Canada

// =================== CONFIGURATION PROVINCIALE RÉELLE ===================
export const PROVINCIAL_REGULATIONS = {
  QC: {
    name: 'Québec - CNESST',
    regulation: 'RSST Section XXVI (2023)',
    oxygenRange: { min: 20.5, max: 23.0 }, // Nouvelle norme 2025
    flammableGasLimit: 5, // % LIE - Nouvelle norme stricte
    minimumAge: 18,
    fallProtectionHeight: 3.0, // mètres
    liftingCapacityLimit: 2000, // kg pour certification obligatoire
    electricalVoltageLimit: 50, // VAC pour LOTO obligatoire
    mandatoryDocuments: [
      'Permis d\'entrée en espace clos',
      'Analyse atmosphérique continue',
      'Plan d\'intervention d\'urgence',
      'Formation du personnel certifiée',
      'Équipements de sauvetage vérifiés'
    ],
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois',
    website: 'https://www.cnesst.gouv.qc.ca',
    emergencyNumber: '1-844-838-0808',
    inspectionRequired: true,
    languageRequired: 'fr'
  },
  ON: {
    name: 'Ontario - OHSA',
    regulation: 'Règl. de l\'Ont. 632/05 - Espaces clos, O. Reg. 213/91 - Construction',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10, // % LIE
    minimumAge: 18,
    fallProtectionHeight: 3.0, // mètres
    liftingCapacityLimit: 2000, // kg pour certification
    electricalVoltageLimit: 50, // VAC pour LOTO
    mandatoryDocuments: [
      'Programme écrit sur les espaces clos',
      'Permis d\'entrée obligatoire',
      'Évaluation des risques',
      'Formation des travailleurs',
      'Procédures de sauvetage'
    ],
    authority: 'Ministère du Travail de l\'Ontario',
    penalties: 'Amendes jusqu\'à 25 000$ ou prison jusqu\'à 12 mois',
    website: 'https://www.ontario.ca/workplace-safety',
    emergencyNumber: '1-877-202-0008',
    inspectionRequired: true,
    languageRequired: 'en'
  },
  BC: {
    name: 'Colombie-Britannique - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces, Part 11 - Fall Protection, Part 14 - Cranes',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 19, // BC spécifique
    fallProtectionHeight: 7.5, // mètres (25 pieds)
    liftingCapacityLimit: 5000, // kg (5 tonnes) pour certification grue
    electricalVoltageLimit: 50, // VAC
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment',
      'Entry Procedures',
      'Emergency Response Plan',
      'Worker Training Records'
    ],
    authority: 'Workers\' Compensation Board of British Columbia',
    penalties: 'Administrative penalties and prosecution',
    website: 'https://www.worksafebc.com',
    emergencyNumber: '1-888-621-7233',
    inspectionRequired: true,
    languageRequired: 'en'
  },
  AB: {
    name: 'Alberta - OHS',
    regulation: 'OHS Code Part 4 - Confined Spaces, Part 6 - Cranes, Part 9 - Fall Protection',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 2.4, // mètres (le plus strict au Canada)
    liftingCapacityLimit: 2000, // kg
    electricalVoltageLimit: 50, // VAC
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment and Control',
      'Emergency Response Procedures',
      'Training and Competency',
      'Atmospheric Testing'
    ],
    authority: 'Alberta Occupational Health and Safety',
    penalties: 'Fines up to $500,000 for corporations',
    website: 'https://www.alberta.ca/ohs',
    emergencyNumber: '1-866-415-8690',
    inspectionRequired: true,
    languageRequired: 'en'
  },
  SK: {
    name: 'Saskatchewan - OHS',
    regulation: 'OHS Regulations Part XVIII',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment',
      'Safety Procedures',
      'Emergency Response Plan'
    ],
    authority: 'Saskatchewan Ministry of Labour Relations and Workplace Safety',
    penalties: 'Fines up to $300,000',
    website: 'https://www.saskatchewan.ca/workplace-safety',
    emergencyNumber: '1-800-567-7233',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  MB: {
    name: 'Manitoba - Safe Work',
    regulation: 'Workplace Safety and Health Regulation',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Risk Assessment',
      'Safety Procedures',
      'Training Documentation'
    ],
    authority: 'Safe Work Manitoba',
    penalties: 'Fines up to $250,000',
    website: 'https://www.safeworkmanitoba.ca',
    emergencyNumber: '1-855-957-7233',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  NB: {
    name: 'Nouveau-Brunswick - OHSACT',
    regulation: 'General Regulation 91-191',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment',
      'Safety Procedures'
    ],
    authority: 'WorkSafeNB',
    penalties: 'Fines up to $250,000',
    website: 'https://www.worksafenb.ca',
    emergencyNumber: '1-800-999-9775',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  NS: {
    name: 'Nouvelle-Écosse - OHS',
    regulation: 'Occupational Health and Safety Act',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Risk Assessment',
      'Safety Procedures'
    ],
    authority: 'Nova Scotia Department of Labour and Advanced Education',
    penalties: 'Fines up to $250,000',
    website: 'https://novascotia.ca/lae/healthandsafety',
    emergencyNumber: '1-800-952-2687',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  PE: {
    name: 'Île-du-Prince-Édouard - OHS',
    regulation: 'Occupational Health and Safety Act',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Hazard Assessment'
    ],
    authority: 'PEI Workers Compensation Board',
    penalties: 'Fines up to $100,000',
    website: 'https://www.wcb.pe.ca',
    emergencyNumber: '1-800-237-5049',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador - OHS',
    regulation: 'Occupational Health and Safety Regulations',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit',
      'Risk Assessment'
    ],
    authority: 'WorkplaceNL',
    penalties: 'Fines up to $500,000',
    website: 'https://workplacenl.ca',
    emergencyNumber: '1-800-563-9000',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  YT: {
    name: 'Yukon - OHS',
    regulation: 'Occupational Health and Safety Act',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit'
    ],
    authority: 'Yukon Workers\' Compensation Health and Safety Board',
    penalties: 'Administrative penalties',
    website: 'https://wcb.yk.ca',
    emergencyNumber: '1-800-661-0443',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  NT: {
    name: 'Territoires du Nord-Ouest - OHS',
    regulation: 'Safety Act',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit'
    ],
    authority: 'Workers\' Safety and Compensation Commission',
    penalties: 'Administrative penalties',
    website: 'https://www.wscc.nt.ca',
    emergencyNumber: '1-800-661-0792',
    inspectionRequired: false,
    languageRequired: 'en'
  },
  NU: {
    name: 'Nunavut - OHS',
    regulation: 'Safety Act',
    oxygenRange: { min: 19.5, max: 23.0 },
    flammableGasLimit: 10,
    minimumAge: 18,
    fallProtectionHeight: 3.0,
    liftingCapacityLimit: 2000,
    electricalVoltageLimit: 50,
    mandatoryDocuments: [
      'Confined Space Entry Permit'
    ],
    authority: 'Workers\' Safety and Compensation Commission',
    penalties: 'Administrative penalties',
    website: 'https://www.wscc.nu.ca',
    emergencyNumber: '1-877-404-4407',
    inspectionRequired: false,
    languageRequired: 'en'
  }
} as const;

// =================== TOUS LES PERMIS DE TRAVAIL OFFICIELS CANADIENS ===================
export const OFFICIAL_PERMITS = {
  // =================== ESPACES CLOS / CONFINED SPACES ===================
  QC_CONFINED_SPACE: {
    id: 'qc-espace-clos-cnesst',
    officialName: 'Permis d\'entrée en espace clos - CNESST',
    regulation: 'RSST Section XXVI, articles 296.1 à 312',
    formNumber: 'CNESST-EC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Espaces Clos',
    priority: 'critical',
    lastUpdated: '2023-07-25',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/espace-clos-formulaire.pdf',
    requiredFields: [
      'Identification de l\'espace clos',
      'Description du travail',
      'Analyse atmosphérique (O2: 20.5-23%, Gaz inflammables ≤5% LIE)',
      'Procédures d\'entrée et de sortie',
      'Équipements de protection requis',
      'Surveillant désigné (18+ ans)',
      'Plan d\'intervention d\'urgence',
      'Signatures autorisées'
    ],
    validityPeriod: '24 heures maximum',
    renewalProcess: 'Nouvelle évaluation complète requise',
    testingRequired: true,
    personnelRequired: ['Surveillant externe', 'Entrant certifié', 'Personne compétente']
  },

  ON_CONFINED_SPACE: {
    id: 'on-confined-space-ohsa',
    officialName: 'Confined Space Entry Permit - OHSA',
    regulation: 'O. Reg. 632/05 under OHSA',
    formNumber: 'OHSA-CS-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Confined Spaces',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/confined-space-entry-permit',
    requiredFields: [
      'Confined space identification and location',
      'Work description and duration',
      'Atmospheric testing results',
      'Entry and exit procedures',
      'Attendant designation',
      'Emergency rescue procedures',
      'Equipment checklist and verification',
      'Authorized signatures'
    ],
    validityPeriod: '24 hours maximum',
    renewalProcess: 'Complete reassessment required',
    testingRequired: true,
    personnelRequired: ['External attendant', 'Certified entrant', 'Competent person']
  },

  BC_CONFINED_SPACE: {
    id: 'bc-confined-space-wsbc',
    officialName: 'Confined Space Entry Permit - WorkSafeBC',
    regulation: 'OHSR Part 5 - Confined Spaces',
    formNumber: 'WSBC-CS-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    category: 'Confined Spaces',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.worksafebc.com/en/resources/health-safety/forms/confined-space-entry-permit',
    requiredFields: [
      'Confined space identification',
      'Hazard assessment and controls',
      'Atmospheric monitoring (19+ age requirement)',
      'Entry procedures and training',
      'Emergency response plan',
      'Equipment verification',
      'Competent person authorization'
    ],
    validityPeriod: '24 hours maximum',
    renewalProcess: 'Hazard reassessment',
    testingRequired: true,
    personnelRequired: ['Qualified attendant', 'Certified worker', 'Competent supervisor']
  },

  AB_CONFINED_SPACE: {
    id: 'ab-confined-space-ohs',
    officialName: 'Confined Space Entry Permit - Alberta OHS',
    regulation: 'OHS Code Part 4',
    formNumber: 'OHS-AB-CS-2025',
    authority: 'Alberta Occupational Health and Safety',
    category: 'Confined Spaces',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.alberta.ca/ohs-confined-space-permit',
    requiredFields: [
      'Confined space identification',
      'Hazard assessment and control',
      'Atmospheric testing procedures',
      'Entry procedures',
      'Emergency response procedures',
      'Training and competency verification'
    ],
    validityPeriod: '24 hours maximum',
    renewalProcess: 'Complete hazard reassessment',
    testingRequired: true,
    personnelRequired: ['External attendant', 'Qualified entrant', 'Competent person']
  },

  // =================== TRAVAIL À CHAUD / HOT WORK ===================
  QC_HOT_WORK: {
    id: 'qc-travail-chaud-cnesst',
    officialName: 'Permis de travail à chaud - CNESST',
    regulation: 'RSST Section relative aux travaux à chaud + NFPA 51B',
    formNumber: 'CNESST-TC-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Travail à Chaud',
    priority: 'critical',
    lastUpdated: '2023-07-25',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/travail-chaud-formulaire.pdf',
    requiredFields: [
      'Description des travaux à chaud (soudage, découpage, meulage)',
      'Évaluation des risques d\'incendie',
      'Mesures de prévention incendie',
      'Zone dégagée 11 mètres (NFPA 51B)',
      'Surveillance continue obligatoire',
      'Équipements d\'extinction à proximité',
      'Autorisations de supervision',
      'Durée et horaires des travaux'
    ],
    validityPeriod: '8 heures maximum',
    renewalProcess: 'Réévaluation des risques',
    testingRequired: false,
    personnelRequired: ['Surveillant incendie', 'Soudeur certifié', 'Superviseur autorisé']
  },

  ON_HOT_WORK: {
    id: 'on-hot-work-ohsa',
    officialName: 'Hot Work Permit - OHSA',
    regulation: 'O. Reg. 851 under OHSA + NFPA 51B',
    formNumber: 'OHSA-HW-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Hot Work',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/hot-work-permit',
    requiredFields: [
      'Hot work description and location',
      'Fire risk assessment',
      'Fire prevention measures',
      '11-meter clearance zone (NFPA 51B)',
      'Fire watch designation',
      'Equipment verification',
      'Authorization signatures'
    ],
    validityPeriod: '8 hours maximum',
    renewalProcess: 'Risk reassessment',
    testingRequired: false,
    personnelRequired: ['Fire watch', 'Certified welder', 'Authorized supervisor']
  },

  // =================== EXCAVATION / TRENCHING ===================
  QC_EXCAVATION: {
    id: 'qc-excavation-cnesst',
    officialName: 'Permis d\'excavation - CNESST',
    regulation: 'Code de sécurité pour les travaux de construction Section 3.15',
    formNumber: 'CNESST-EX-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Excavation',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/excavation-formulaire.pdf',
    requiredFields: [
      'Localisation et dimensions de l\'excavation',
      'Profondeur et largeur prévues',
      'Type de sol et analyse géotechnique',
      'Localisation des services publics (Loi 456)',
      'Méthodes de protection (>1.2m)',
      'Plan d\'accès et de sortie',
      'Procédures d\'urgence',
      'Personne compétente désignée'
    ],
    validityPeriod: '30 jours maximum',
    renewalProcess: 'Réévaluation des conditions',
    testingRequired: false,
    personnelRequired: ['Personne compétente', 'Superviseur excavation', 'Opérateur équipement']
  },

  ON_EXCAVATION: {
    id: 'on-excavation-ohsa',
    officialName: 'Excavation/Trenching Permit - OHSA',
    regulation: 'O. Reg. 213/91 Section 228-237',
    formNumber: 'OHSA-EX-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Excavation',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/excavation-permit',
    requiredFields: [
      'Excavation location and dimensions',
      'Utility location verification',
      'Notice of Trench Work (>1.2m depth)',
      'Soil classification and protection method',
      'Shoring requirements and plans',
      'Access and egress provisions (max 8m CCOHS)',
      'Emergency procedures',
      'Competent person designation'
    ],
    validityPeriod: '30 days maximum',
    renewalProcess: 'Site condition reassessment',
    testingRequired: false,
    personnelRequired: ['Competent person', 'Qualified supervisor', 'Equipment operator']
  },

  BC_EXCAVATION: {
    id: 'bc-excavation-wsbc',
    officialName: 'Excavation Permit - WorkSafeBC',
    regulation: 'OHSR Part 20 - Excavation',
    formNumber: 'WSBC-EX-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    category: 'Excavation',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.worksafebc.com/en/resources/health-safety/forms/excavation-permit',
    requiredFields: [
      'Excavation location and dimensions',
      'Soil analysis and slope requirements',
      'Utility location verification (BC One Call)',
      'Shoring requirements',
      'Access and egress provisions',
      'Competent person designation',
      'Emergency response procedures'
    ],
    validityPeriod: '30 days maximum',
    renewalProcess: 'Site condition reassessment',
    testingRequired: false,
    personnelRequired: ['Competent person', 'Qualified supervisor', 'Heavy equipment operator']
  },

  // =================== LEVAGE ET GRUTAGE / LIFTING & CRANE OPERATIONS ===================
  QC_CRANE_LIFTING: {
    id: 'qc-levage-grue-cnesst',
    officialName: 'Permis de levage et grutage - CNESST',
    regulation: 'Code de sécurité pour les travaux de construction Section 2.20',
    formNumber: 'CNESST-LG-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Levage',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/levage-grue-formulaire.pdf',
    requiredFields: [
      'Type et capacité de la grue',
      'Certificat d\'inspection en cours',
      'Opérateur certifié et cartes de compétence',
      'Plan de levage avec calculs de charge',
      'Zone de travail sécurisée et balisée',
      'Signaleur qualifié désigné',
      'Vérification des conditions météorologiques',
      'Procédures d\'urgence spécifiques'
    ],
    validityPeriod: '7 jours ou durée du projet',
    renewalProcess: 'Réévaluation plan de levage',
    testingRequired: true,
    personnelRequired: ['Opérateur grue certifié', 'Signaleur qualifié', 'Superviseur levage']
  },

  ON_CRANE_LIFTING: {
    id: 'on-crane-lifting-ohsa',
    officialName: 'Crane/Lifting Operations Permit - OHSA',
    regulation: 'O. Reg. 213/91 Section 150-180',
    formNumber: 'OHSA-CL-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Lifting',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/crane-lifting-permit',
    requiredFields: [
      'Crane type and rated capacity',
      'Valid inspection certificate',
      'Certified crane operator (Mobile Crane Operator 1/2 or Hoisting Engineer)',
      'Critical lift plan (>90% capacity or >50% radius)',
      'Exclusion zone establishment',
      'Qualified signaller designation',
      'Weather monitoring procedures',
      'Emergency response plan'
    ],
    validityPeriod: '7 days or project duration',
    renewalProcess: 'Lift plan reassessment',
    testingRequired: true,
    personnelRequired: ['Certified crane operator', 'Qualified signaller', 'Lifting supervisor']
  },

  BC_CRANE_LIFTING: {
    id: 'bc-crane-lifting-wsbc',
    officialName: 'Crane Operations Permit - WorkSafeBC',
    regulation: 'OHSR Part 14 - Cranes and Hoists',
    formNumber: 'WSBC-CL-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    category: 'Lifting',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.worksafebc.com/en/resources/health-safety/forms/crane-permit',
    requiredFields: [
      'Crane specifications and capacity (≥5 tons or ≥7.62m boom)',
      'BC Crane Operator Certificate',
      'Critical lift procedures (>90% capacity)',
      'Tandem lift procedures (>75% capacity per crane)',
      'Work zone protection',
      'Communication procedures',
      'Weather restrictions',
      'Emergency procedures'
    ],
    validityPeriod: '7 days or project duration',
    renewalProcess: 'Operations reassessment',
    testingRequired: true,
    personnelRequired: ['BC certified crane operator', 'Qualified rigger', 'Competent supervisor']
  },

  // =================== TRAVAIL EN HAUTEUR / WORKING AT HEIGHTS ===================
  QC_FALL_PROTECTION: {
    id: 'qc-travail-hauteur-cnesst',
    officialName: 'Permis de travail en hauteur - CNESST',
    regulation: 'Code de sécurité pour les travaux de construction Section 2.9',
    formNumber: 'CNESST-TH-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Hauteur',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/travail-hauteur-formulaire.pdf',
    requiredFields: [
      'Hauteur et nature du travail (≥3m)',
      'Évaluation des risques de chute',
      'Système de protection contre les chutes',
      'Ancrages certifiés et inspection',
      'Formation travail en hauteur vérifiée',
      'Plan de sauvetage spécialisé',
      'Conditions météorologiques acceptables',
      'Supervision compétente désignée'
    ],
    validityPeriod: '8 heures ou journée de travail',
    renewalProcess: 'Réévaluation quotidienne',
    testingRequired: false,
    personnelRequired: ['Travailleur formé hauteur', 'Superviseur compétent', 'Équipe sauvetage (si requis)']
  },

  ON_FALL_PROTECTION: {
    id: 'on-working-heights-ohsa',
    officialName: 'Working at Heights Permit - OHSA',
    regulation: 'O. Reg. 213/91 Part III + Working at Heights Training Standard',
    formNumber: 'OHSA-WH-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Working at Heights',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/working-at-heights-permit',
    requiredFields: [
      'Work location and height assessment (≥3m)',
      'Fall protection plan',
      'Working at Heights training verification',
      'Personal fall protection system inspection',
      'Anchor point certification (22kN minimum)',
      'Rescue procedures and equipment',
      'Weather monitoring',
      'Competent worker designation'
    ],
    validityPeriod: '8 hours or work shift',
    renewalProcess: 'Daily reassessment',
    testingRequired: false,
    personnelRequired: ['Working at Heights certified worker', 'Competent person', 'Rescue team (if required)']
  },

  BC_FALL_PROTECTION: {
    id: 'bc-fall-protection-wsbc',
    officialName: 'Fall Protection Work Permit - WorkSafeBC',
    regulation: 'OHSR Part 11 - Fall Protection',
    formNumber: 'WSBC-FP-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    category: 'Fall Protection',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.worksafebc.com/en/resources/health-safety/forms/fall-protection-permit',
    requiredFields: [
      'Work area assessment (≥7.5m or 25 feet)',
      'Fall protection plan requirement',
      'Personal fall protection system verification',
      'Anchor system certification (22kN/5000lbs)',
      'Worker training verification',
      'Emergency procedures',
      'Weather conditions assessment',
      'Qualified person oversight'
    ],
    validityPeriod: '8 hours or work shift',
    renewalProcess: 'Daily conditions assessment',
    testingRequired: false,
    personnelRequired: ['Qualified worker', 'Competent supervisor', 'Rescue capability']
  },

  AB_FALL_PROTECTION: {
    id: 'ab-fall-protection-ohs',
    officialName: 'Fall Protection Permit - Alberta OHS',
    regulation: 'OHS Code Part 9 - Fall Protection',
    formNumber: 'OHS-AB-FP-2025',
    authority: 'Alberta Occupational Health and Safety',
    category: 'Fall Protection',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.alberta.ca/ohs-fall-protection-permit',
    requiredFields: [
      'Work area assessment (≥2.4m - most strict in Canada)',
      'Fall protection system selection',
      'Anchor point verification (16kN minimum)',
      'Personal protective equipment inspection',
      'Worker competency verification',
      'Rescue procedures',
      'Environmental conditions',
      'Supervisor authorization'
    ],
    validityPeriod: '8 hours or work shift',
    renewalProcess: 'Shift-by-shift assessment',
    testingRequired: false,
    personnelRequired: ['Competent worker', 'Qualified supervisor', 'Rescue trained personnel']
  },

  // =================== ISOLATION ÉNERGÉTIQUE / LOCKOUT-TAGOUT (LOTO) ===================
  QC_LOTO_ELECTRICAL: {
    id: 'qc-loto-electrique-cnesst',
    officialName: 'Permis d\'isolation énergétique électrique - CNESST',
    regulation: 'CSA Z460-20 + CNESST Sécurité électrique',
    formNumber: 'CNESST-IE-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Isolation Énergétique',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/loto-electrique-formulaire.pdf',
    requiredFields: [
      'Identification de l\'équipement électrique',
      'Tension et ampérage du circuit (≥50VAC)',
      'Dispositifs d\'isolement identifiés',
      'Procédure de verrouillage-étiquetage',
      'Vérification état zéro énergie',
      'Personnel autorisé seulement',
      'Clés individuelles et étiquettes',
      'Procédure de remise en service'
    ],
    validityPeriod: 'Duration of maintenance work',
    renewalProcess: 'New isolation required',
    testingRequired: true,
    personnelRequired: ['Électricien qualifié', 'Personne autorisée LOTO', 'Superviseur électrique']
  },

  ON_LOTO_ELECTRICAL: {
    id: 'on-loto-electrical-ohsa',
    officialName: 'Electrical Lockout/Tagout Permit - OHSA',
    regulation: 'O. Reg. 213/91 Section 184-190 + CSA Z460-20',
    formNumber: 'OHSA-LOTO-2025',
    authority: 'Ministry of Labour, Immigration, Training and Skills Development',
    category: 'Energy Isolation',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.ontario.ca/document/electrical-loto-permit',
    requiredFields: [
      'Electrical equipment identification',
      'Circuit voltage and current (≥50VAC hazardous)',
      'Energy isolating devices location',
      'Lockout/tagout procedure steps',
      'Zero energy state verification',
      'Authorized personnel only access',
      'Individual locks and tags',
      'Re-energization procedure'
    ],
    validityPeriod: 'Duration of electrical work',
    renewalProcess: 'New lockout required',
    testingRequired: true,
    personnelRequired: ['Qualified electrician', 'Authorized LOTO person', 'Electrical supervisor']
  },

  BC_LOTO_ELECTRICAL: {
    id: 'bc-loto-electrical-wsbc',
    officialName: 'Electrical Energy Isolation Permit - WorkSafeBC',
    regulation: 'OHSR Part 19 - Electrical Safety + CSA Z460-20',
    formNumber: 'WSBC-EI-2025',
    authority: 'Workers\' Compensation Board of British Columbia',
    category: 'Energy Isolation',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.worksafebc.com/en/resources/health-safety/forms/electrical-isolation-permit',
    requiredFields: [
      'Electrical system identification',
      'Hazardous energy assessment (≥50VAC)',
      'Isolation device locations',
      'Lockout/tagout implementation',
      'Testing and verification procedures',
      'Qualified person authorization',
      'Personal protective equipment',
      'System restoration procedures'
    ],
    validityPeriod: 'Duration of electrical maintenance',
    renewalProcess: 'Complete re-isolation',
    testingRequired: true,
    personnelRequired: ['Qualified electrical worker', 'LOTO authorized person', 'Electrical safety supervisor']
  },

  // =================== ÉQUIPEMENTS SOUS PRESSION / PRESSURE VESSEL WORK ===================
  QC_PRESSURE_VESSEL: {
    id: 'qc-equipement-pression-cnesst',
    officialName: 'Permis de travail sur équipements sous pression - CNESST',
    regulation: 'Loi sur les appareils sous pression + CSA B51',
    formNumber: 'CNESST-EP-2025',
    authority: 'Régie du bâtiment du Québec + CNESST',
    category: 'Équipements Pression',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/equipement-pression-formulaire.pdf',
    requiredFields: [
      'Identification équipement et numéro RBQ',
      'Pression de service et température',
      'Dépressurisation complète vérifiée',
      'Isolement des sources d\'énergie',
      'Purge et nettoyage si requis',
      'Tests d\'atmosphère (espaces clos)',
      'Soudeur et inspecteur certifiés',
      'Procédures de remise en service'
    ],
    validityPeriod: 'Duration of pressure vessel work',
    renewalProcess: 'New assessment and isolation',
    testingRequired: true,
    personnelRequired: ['Soudeur certifié CWB', 'Inspecteur agréé', 'Superviseur qualifié']
  },

  // =================== RADIOGRAPHIE INDUSTRIELLE / INDUSTRIAL RADIOGRAPHY ===================
  QC_RADIOGRAPHY: {
    id: 'qc-radiographie-industrielle-cnesst',
    officialName: 'Permis de radiographie industrielle - CNESST',
    regulation: 'Loi sur la sûreté et la réglementation nucléaires + CNESST',
    formNumber: 'CNESST-RI-2025',
    authority: 'Commission canadienne de sûreté nucléaire + CNESST',
    category: 'Radiographie',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/radiographie-formulaire.pdf',
    requiredFields: [
      'Licence de radiographie CCSN en cours',
      'Zone contrôlée établie et balisée',
      'Équipement de détection radiation',
      'Personnel certifié et dosimètres',
      'Procédures d\'urgence radiation',
      'Transport sécuritaire des sources',
      'Surveillance de zone obligatoire',
      'Déclaration post-exposition'
    ],
    validityPeriod: 'Duration of radiographic work',
    radiationSafetyRequired: true,
    renewalProcess: 'New radiation safety assessment',
    testingRequired: true,
    personnelRequired: ['Radiographe certifié CCSN', 'Agent de radioprotection', 'Surveillant zone']
  },

  // =================== TRAVAIL SUR TOITURE / ROOFING WORK ===================
  QC_ROOFING_WORK: {
    id: 'qc-travail-toiture-cnesst',
    officialName: 'Permis de travail sur toiture - CNESST',
    regulation: 'Code de sécurité pour les travaux de construction Section 2.9.9',
    formNumber: 'CNESST-TT-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Toiture',
    priority: 'high',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/toiture-formulaire.pdf',
    requiredFields: [
      'Type de toiture et pente (%)',
      'Conditions météorologiques acceptables',
      'Système protection chutes approprié',
      'Accès sécurisé à la toiture',
      'Matériaux et outils sécurisés',
      'Plan d\'évacuation d\'urgence',
      'Formation spécialisée toiture',
      'Surveillance continue si requis'
    ],
    validityPeriod: '8 hours or weather dependent',
    renewalProcess: 'Weather and conditions reassessment',
    testingRequired: false,
    personnelRequired: ['Couvreur expérimenté', 'Superviseur toiture', 'Surveillant sécurité']
  },

  // =================== DÉMOLITION / DEMOLITION ===================
  QC_DEMOLITION: {
    id: 'qc-demolition-cnesst',
    officialName: 'Permis de démolition - CNESST',
    regulation: 'Code de sécurité pour les travaux de construction Section 2.21',
    formNumber: 'CNESST-DM-2025',
    authority: 'Commission des normes de l\'équité de la santé et de la sécurité du travail',
    category: 'Démolition',
    priority: 'critical',
    lastUpdated: '2024-01-01',
    downloadUrl: 'https://www.cnesst.gouv.qc.ca/sites/default/files/documents/demolition-formulaire.pdf',
    requiredFields: [
      'Plan de démolition avec séquence',
      'Inspection structure par ingénieur',
      'Isolement services publics complet',
      'Contrôle poussières et amiante',
      'Zone d\'exclusion et protection public',
      'Équipements de démolition inspectés',
      'Plan de gestion des débris',
      'Procédures d\'urgence spécialisées'
    ],
    validityPeriod: 'Duration of demolition project',
    renewalProcess: 'Weekly progress assessment',
    testingRequired: true, // Pour amiante et matières dangereuses
    personnelRequired: ['Superviseur démolition', 'Opérateur équipement lourd', 'Inspecteur structure']
  }
} as const;

// =================== CATÉGORIES DE PERMIS ===================
export const PERMIT_CATEGORIES = {
  'fr': {
    'Espaces Clos': {
      icon: '🔒',
      color: '#8b5cf6',
      description: 'Permis pour entrée en espaces confinés avec tests atmosphériques'
    },
    'Travail à Chaud': {
      icon: '🔥',
      color: '#ef4444',
      description: 'Soudage, découpage, meulage avec surveillance incendie'
    },
    'Excavation': {
      icon: '⛏️',
      color: '#f59e0b',
      description: 'Travaux d\'excavation avec protection et étançonnement'
    },
    'Levage': {
      icon: '🏗️',
      color: '#3b82f6',
      description: 'Opérations de levage et grutage avec opérateurs certifiés'
    },
    'Hauteur': {
      icon: '🪜',
      color: '#22c55e',
      description: 'Travail en hauteur avec protection contre les chutes'
    },
    'Isolation Énergétique': {
      icon: '⚡',
      color: '#dc2626',
      description: 'Lockout-Tagout pour isolation énergétique sécuritaire'
    },
    'Équipements Pression': {
      icon: '🔧',
      color: '#7c3aed',
      description: 'Travail sur équipements sous pression et chaudières'
    },
    'Radiographie': {
      icon: '☢️',
      color: '#f97316',
      description: 'Radiographie industrielle avec protection radiation'
    },
    'Toiture': {
      icon: '🏠',
      color: '#06b6d4',
      description: 'Travaux de couverture avec protection spécialisée'
    },
    'Démolition': {
      icon: '🔨',
      color: '#991b1b',
      description: 'Démolition contrôlée avec gestion amiante'
    }
  },
  'en': {
    'Confined Spaces': {
      icon: '🔒',
      color: '#8b5cf6',
      description: 'Permits for confined space entry with atmospheric testing'
    },
    'Hot Work': {
      icon: '🔥',
      color: '#ef4444',
      description: 'Welding, cutting, grinding with fire watch'
    },
    'Excavation': {
      icon: '⛏️',
      color: '#f59e0b',
      description: 'Excavation work with protection and shoring'
    },
    'Lifting': {
      icon: '🏗️',
      color: '#3b82f6',
      description: 'Lifting and crane operations with certified operators'
    },
    'Working at Heights': {
      icon: '🪜',
      color: '#22c55e',
      description: 'Height work with fall protection systems'
    },
    'Energy Isolation': {
      icon: '⚡',
      color: '#dc2626',
      description: 'Lockout-Tagout for safe energy isolation'
    },
    'Pressure Equipment': {
      icon: '🔧',
      color: '#7c3aed',
      description: 'Pressure vessel and boiler work'
    },
    'Radiography': {
      icon: '☢️',
      color: '#f97316',
      description: 'Industrial radiography with radiation protection'
    },
    'Roofing': {
      icon: '🏠',
      color: '#06b6d4',
      description: 'Roofing work with specialized protection'
    },
    'Demolition': {
      icon: '🔨',
      color: '#991b1b',
      description: 'Controlled demolition with asbestos management'
    }
  }
} as const;

// =================== LISTES POUR UI ===================
export const PROVINCE_CODES = Object.keys(PROVINCIAL_REGULATIONS) as Array<keyof typeof PROVINCIAL_REGULATIONS>;

export const PROVINCE_NAMES = {
  'fr': {
    QC: 'Québec',
    ON: 'Ontario', 
    BC: 'Colombie-Britannique',
    AB: 'Alberta',
    SK: 'Saskatchewan',
    MB: 'Manitoba',
    NB: 'Nouveau-Brunswick',
    NS: 'Nouvelle-Écosse',
    PE: 'Île-du-Prince-Édouard',
    NL: 'Terre-Neuve-et-Labrador',
    YT: 'Yukon',
    NT: 'Territoires du Nord-Ouest',
    NU: 'Nunavut'
  },
  'en': {
    QC: 'Quebec',
    ON: 'Ontario',
    BC: 'British Columbia', 
    AB: 'Alberta',
    SK: 'Saskatchewan',
    MB: 'Manitoba',
    NB: 'New Brunswick',
    NS: 'Nova Scotia',
    PE: 'Prince Edward Island',
    NL: 'Newfoundland and Labrador',
    YT: 'Yukon',
    NT: 'Northwest Territories',
    NU: 'Nunavut'
  }
} as const;

// =================== HELPERS ===================
export const getRegulationByProvince = (province: string) => {
  return PROVINCIAL_REGULATIONS[province as keyof typeof PROVINCIAL_REGULATIONS];
};

export const getOfficialPermitsByProvince = (province: string) => {
  return Object.values(OFFICIAL_PERMITS).filter(permit => 
    permit.id.startsWith(province.toLowerCase())
  );
};

export const getPermitsByCategory = (category: string, language: 'fr' | 'en' = 'fr') => {
  return Object.values(OFFICIAL_PERMITS).filter(permit => {
    if (language === 'fr') {
      return permit.category === category;
    } else {
      // Map French categories to English
      const categoryMap: Record<string, string> = {
        'Espaces Clos': 'Confined Spaces',
        'Travail à Chaud': 'Hot Work',
        'Excavation': 'Excavation',
        'Levage': 'Lifting',
        'Hauteur': 'Working at Heights',
        'Isolation Énergétique': 'Energy Isolation',
        'Équipements Pression': 'Pressure Equipment',
        'Radiographie': 'Radiography',
        'Toiture': 'Roofing',
        'Démolition': 'Demolition'
      };
      return categoryMap[permit.category] === category;
    }
  });
};

export const getProvinceName = (code: string, language: 'fr' | 'en' = 'fr') => {
  return PROVINCE_NAMES[language][code as keyof typeof PROVINCE_NAMES.fr] || code;
};

export const getCategoryInfo = (category: string, language: 'fr' | 'en' = 'fr') => {
  return PERMIT_CATEGORIES[language][category as keyof typeof PERMIT_CATEGORIES.fr];
};

// =================== FONCTION GÉNÉRATION PERMIS COMPLETS ===================
export const generateAllAvailablePermits = (language: 'fr' | 'en', province: string) => {
  const permits = getOfficialPermitsByProvince(province);
  const regulation = getRegulationByProvince(province);
  
  return permits.map(permitTemplate => ({
    id: `${permitTemplate.id}-${Date.now()}`,
    name: permitTemplate.officialName,
    description: permitTemplate.requiredFields.slice(0, 3).join(', ') + '...',
    category: permitTemplate.category,
    authority: permitTemplate.authority,
    province: [province],
    priority: permitTemplate.priority as 'low' | 'medium' | 'high' | 'critical',
    selected: false,
    formData: {},
    code: permitTemplate.formNumber,
    status: 'draft' as const,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    legalRequirements: {
      permitRequired: true,
      atmosphericTesting: permitTemplate.testingRequired || false,
      entryProcedure: permitTemplate.category.includes('Espace') || permitTemplate.category.includes('Confined'),
      emergencyPlan: true,
      equipmentCheck: true,
      attendantRequired: permitTemplate.personnelRequired?.length > 0,
      documentation: true
    },
    validity: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (permitTemplate.validityPeriod.includes('24') ? 24 : 168) * 60 * 60 * 1000).toISOString(),
      isValid: false
    },
    compliance: {
      [province.toLowerCase() === 'qc' ? 'cnesst' : 
       province.toLowerCase() === 'on' ? 'ohsa' : 
       province.toLowerCase() === 'bc' ? 'worksafebc' : 'ohs']: true
    },
    officialTemplate: permitTemplate
  }));
};

// =================== EXPORTS ===================
export type ProvinceCode = keyof typeof PROVINCIAL_REGULATIONS;
export type RegulationInfo = typeof PROVINCIAL_REGULATIONS[ProvinceCode];
export type OfficialPermit = typeof OFFICIAL_PERMITS[keyof typeof OFFICIAL_PERMITS];
export type PermitCategoryInfo = typeof PERMIT_CATEGORIES['fr'][keyof typeof PERMIT_CATEGORIES['fr']];
