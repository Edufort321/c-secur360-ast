// =================== DONNÉES DE DÉMONSTRATION COMPLÈTES ===================
// Pour tester le rapport final Step5 avec toutes les données compilées

export const DEMO_DATA = {
  // ✅ STEP 1 - INFORMATIONS PROJET (Complètes)
  projectInfo: {
    client: "Hydro-Québec",
    projectNumber: "HQ-2025-AST-001",
    workLocation: "Centrale de Beauharnois - Unité 3",
    date: "2025-01-15",
    time: "08:00",
    industry: "energy",
    workerCount: 8,
    estimatedDuration: "3 jours",
    workDescription: "Maintenance préventive des turbines - Remplacement des joints d'étanchéité et vérification des systèmes hydrauliques",
    clientContact: {
      name: "Marie Dubois",
      title: "Ingénieure en chef",
      phone: "+1 514 385-7252",
      email: "marie.dubois@hydroquebec.com"
    },
    emergencyContact: {
      name: "Service d'urgence Hydro-Québec",
      phone: "+1 514 385-7911",
      available24h: true
    },
    supervisor: {
      name: "Jean-Marc Tremblay",
      title: "Superviseur sécurité",
      phone: "+1 514 555-0123",
      certification: "CSO, COSH"
    },
    workLocations: [
      {
        id: "loc-1",
        name: "Salle des turbines",
        description: "Zone principale des équipements rotatifs",
        zone: "Zone A",
        building: "Centrale principale",
        floor: "Sous-sol -1",
        maxWorkers: 6,
        currentWorkers: 0,
        isActive: true,
        createdAt: "2025-01-15T08:00:00Z",
        estimatedDuration: "2 jours",
        coordinates: { lat: 45.3168, lng: -74.1267 }
      },
      {
        id: "loc-2", 
        name: "Station hydraulique",
        description: "Systèmes de commande hydraulique",
        zone: "Zone B",
        building: "Annexe technique",
        floor: "Rez-de-chaussée",
        maxWorkers: 4,
        currentWorkers: 0,
        isActive: true,
        createdAt: "2025-01-15T08:00:00Z",
        estimatedDuration: "1 jour"
      },
      {
        id: "loc-3",
        name: "Salle de contrôle",
        description: "Centre de surveillance et commande",
        zone: "Zone C",
        building: "Tour de contrôle",
        floor: "Étage 2",
        maxWorkers: 2,
        currentWorkers: 0,
        isActive: true,
        createdAt: "2025-01-15T08:00:00Z",
        estimatedDuration: "3 jours"
      }
    ],
    weatherConditions: {
      temperature: 2,
      humidity: 75,
      windSpeed: 15,
      conditions: "Nuageux avec risque de neige légère",
      visibility: "Bonne"
    },
    accessRestrictions: [
      "Badge d'accès niveau 3 requis",
      "Formation sécurité électrique obligatoire",
      "Escorte sécurité pour zones sensibles"
    ]
  },

  // ✅ STEP 2 - ÉQUIPEMENTS DE SÉCURITÉ (Complets)
  equipment: {
    selected: [
      {
        id: "ppe-helmet",
        name: "Casque de sécurité",
        category: "Protection tête",
        mandatory: true,
        quantity: 10,
        cost: 45.99,
        certification: "CSA Z94.1",
        supplier: "3M Canada"
      },
      {
        id: "ppe-safety-glasses",
        name: "Lunettes de sécurité",
        category: "Protection yeux",
        mandatory: true,
        quantity: 10,
        cost: 12.50,
        certification: "ANSI Z87.1"
      },
      {
        id: "ppe-gloves",
        name: "Gants de travail résistants",
        category: "Protection mains",
        mandatory: true,
        quantity: 15,
        cost: 8.99,
        certification: "EN 388"
      },
      {
        id: "ppe-boots",
        name: "Bottes de sécurité",
        category: "Protection pieds",
        mandatory: true,
        quantity: 10,
        cost: 120.00,
        certification: "CSA Z195"
      },
      {
        id: "ppe-harness",
        name: "Harnais de sécurité",
        category: "Protection chute",
        mandatory: true,
        quantity: 8,
        cost: 89.99,
        certification: "ANSI Z359.11"
      },
      {
        id: "tool-multimeter",
        name: "Multimètre de sécurité",
        category: "Outils mesure",
        mandatory: false,
        quantity: 3,
        cost: 245.00,
        certification: "CAT IV 600V"
      },
      {
        id: "safety-signs",
        name: "Panneaux de signalisation",
        category: "Signalisation",
        mandatory: true,
        quantity: 20,
        cost: 15.50
      }
    ],
    totalCost: 2847.41,
    inspectionRequired: true,
    certifications: ["CSA Z94.1", "ANSI Z87.1", "EN 388", "CSA Z195"],
    inspectionDate: "2025-01-14",
    inspectedBy: "Claude Bergeron - Technicien sécurité"
  },

  // ✅ STEP 3 - DANGERS ET CONTRÔLES (Complets)  
  hazards: {
    identified: [
      {
        id: "hazard-electrical",
        name: "Risque électrique",
        category: "Électrique",
        severity: "Élevé",
        probability: "Moyenne",
        riskLevel: "Élevé",
        description: "Présence de circuits haute tension (25kV) dans la zone de travail",
        controlMeasures: [
          "Consignation électrique complète",
          "Vérification d'absence de tension (VAT)",
          "Mise à la terre et en court-circuit",
          "Port d'EPI électriques certifiés"
        ]
      },
      {
        id: "hazard-mechanical",
        name: "Risque mécanique",
        category: "Mécanique", 
        severity: "Élevé",
        probability: "Élevée",
        riskLevel: "Très élevé",
        description: "Équipements rotatifs lourds - turbines de 50 tonnes",
        controlMeasures: [
          "Procédures LOTO complètes",
          "Blocage mécanique des rotors",
          "Formation manipulation d'équipements lourds",
          "Système de communication permanente"
        ]
      },
      {
        id: "hazard-height",
        name: "Travail en hauteur", 
        category: "Chute",
        severity: "Élevé",
        probability: "Moyenne",
        riskLevel: "Élevé",
        description: "Travaux à 8 mètres de hauteur sur les turbines",
        controlMeasures: [
          "Port du harnais obligatoire",
          "Installation de lignes de vie temporaires",
          "Inspection des équipements de protection",
          "Procédure de sauvetage définie"
        ]
      },
      {
        id: "hazard-hydraulic",
        name: "Pression hydraulique",
        category: "Fluide sous pression",
        severity: "Moyenne",
        probability: "Faible", 
        riskLevel: "Moyen",
        description: "Systèmes hydrauliques à 300 bar",
        controlMeasures: [
          "Dépressurisation avant intervention",
          "Utilisation d'outils appropriés",
          "Formation systèmes hydrauliques",
          "Procédure d'urgence définie"
        ]
      }
    ],
    riskLevel: "Élevé",
    controlMeasures: [
      "Formation sécurité spécialisée obligatoire",
      "Supervision permanente par personnel qualifié",
      "Plan d'évacuation d'urgence établi",
      "Équipements de premiers secours sur site"
    ],
    residualRisk: "Faible",
    emergencyProcedures: [
      {
        type: "Incendie",
        procedure: "Évacuation immédiate - Point de rassemblement parking nord",
        contact: "911 puis +1 514 385-7911"
      },
      {
        type: "Électrisation",
        procedure: "Couper l'alimentation - Ne pas toucher la victime - Appeler secours",
        contact: "911 + Service médical interne 7555"
      },
      {
        type: "Chute/Blessure",
        procedure: "Sécuriser la zone - Premiers secours - Transport médical",
        contact: "Service médical interne puis 911 si nécessaire"
      }
    ],
    monitoringRequired: true
  },

  // ✅ STEP 4 - PERMIS ET VALIDATION (Complets)
  permits: {
    required: [
      {
        id: "permit-electrical",
        name: "Permis de travail électrique",
        authority: "Hydro-Québec Sécurité",
        status: "Approuvé",
        validFrom: "2025-01-15T08:00:00Z",
        validUntil: "2025-01-17T18:00:00Z",
        permitNumber: "HQ-ELEC-2025-0234",
        conditions: [
          "Consignation supervisée par électricien certifié",
          "VAT obligatoire avant chaque intervention", 
          "Communication radio permanente"
        ]
      },
      {
        id: "permit-confined-space",
        name: "Permis d'entrée en espace confiné",
        authority: "Service Sécurité Industrielle",
        status: "Approuvé",
        validFrom: "2025-01-15T08:00:00Z",
        validUntil: "2025-01-17T18:00:00Z",
        permitNumber: "HQ-EC-2025-0089",
        conditions: [
          "Test atmosphérique continu",
          "Surveillance externe permanente",
          "Équipement de sauvetage disponible"
        ]
      },
      {
        id: "permit-hot-work",
        name: "Permis de travail à chaud",
        authority: "Prévention Incendie",
        status: "En attente",
        validFrom: "2025-01-16T09:00:00Z", 
        validUntil: "2025-01-16T17:00:00Z",
        permitNumber: "HQ-TC-2025-0156",
        conditions: [
          "Surveillance feu permanente",
          "Extincteurs CO2 à proximité",
          "Zone dégagée dans un rayon de 10m"
        ]
      }
    ],
    authorities: [
      "Hydro-Québec Sécurité",
      "Service Sécurité Industrielle", 
      "Prévention Incendie",
      "Inspection du Travail"
    ],
    validations: [
      {
        permitId: "permit-electrical",
        validator: "Michel Lavoie",
        role: "Électricien Chef",
        date: "2025-01-14T16:30:00Z",
        signature: "ML_20250114",
        comments: "Procédures LOTO vérifiées et approuvées"
      },
      {
        permitId: "permit-confined-space",
        validator: "Sophie Martin",
        role: "Responsable Sécurité",
        date: "2025-01-14T17:15:00Z", 
        signature: "SM_20250114",
        comments: "Équipements de surveillance atmosphérique testés"
      }
    ]
  },

  // ✅ STEP 4 - REGISTRE DES TRAVAILLEURS (Complet)
  workers: {
    list: [
      {
        id: "worker-1",
        name: "Pierre Lalonde",
        company: "Hydro-Québec",
        phoneNumber: "+1 514 555-0134",
        employeeNumber: "HQ-7542",
        certification: ["Électricité industrielle", "LOTO", "Espaces confinés"],
        lockStatus: "applied",
        workLocation: "Zone A - Salle des turbines",
        consentAST: true,
        consentSignatureDate: "2025-01-15T07:45:12",
        workStarted: true,
        workStartTime: "2025-01-15T08:15:00",
        workEnded: false,
        workEndTime: "",
        totalWorkTime: 285, // 4h45min
        signature: "PL_signature_base64",
        consentTimestamp: "2025-01-15T07:45:12Z",
        astValidated: true,
        workTimer: {
          startTime: "2025-01-15T08:15:00",
          isActive: true,
          totalTime: 285 * 60 * 1000,
          breaks: []
        },
        assignedLocks: [],
        registeredAt: "2025-01-15T07:45:12Z",
        lastActivity: "2025-01-15T13:00:00Z"
      },
      {
        id: "worker-2", 
        name: "Marie-Claire Bouchard",
        company: "Hydro-Québec",
        phoneNumber: "+1 514 555-0178",
        employeeNumber: "HQ-8293",
        certification: ["Mécanique industrielle", "Travail en hauteur", "Premiers soins"],
        lockStatus: "applied",
        workLocation: "Zone A - Salle des turbines", 
        consentAST: true,
        consentSignatureDate: "2025-01-15T07:50:33",
        workStarted: true,
        workStartTime: "2025-01-15T08:15:00",
        workEnded: false,
        workEndTime: "",
        totalWorkTime: 285,
        signature: "MCB_signature_base64",
        consentTimestamp: "2025-01-15T07:50:33Z",
        astValidated: true,
        workTimer: {
          startTime: "2025-01-15T08:15:00",
          isActive: true,
          totalTime: 285 * 60 * 1000,
          breaks: []
        },
        assignedLocks: [],
        registeredAt: "2025-01-15T07:50:33Z",
        lastActivity: "2025-01-15T13:00:00Z"
      },
      {
        id: "worker-3",
        name: "François Gagnon",
        company: "Contracteur Mécanique Plus",
        phoneNumber: "+1 514 555-0192",
        employeeNumber: "CMP-3847",
        certification: ["Soudure", "LOTO", "Gaz comprimés"],
        lockStatus: "applied",
        workLocation: "Zone B - Station hydraulique",
        consentAST: true,
        consentSignatureDate: "2025-01-15T07:55:18",
        workStarted: true,
        workStartTime: "2025-01-15T08:30:00", 
        workEnded: true,
        workEndTime: "2025-01-15T12:00:00",
        totalWorkTime: 210, // 3h30min
        signature: "FG_signature_base64",
        consentTimestamp: "2025-01-15T07:55:18Z",
        astValidated: true,
        workTimer: {
          startTime: "2025-01-15T08:30:00",
          endTime: "2025-01-15T12:00:00",
          isActive: false,
          totalTime: 210 * 60 * 1000,
          breaks: []
        },
        assignedLocks: [],
        registeredAt: "2025-01-15T07:55:18Z",
        lastActivity: "2025-01-15T12:00:00Z"
      },
      {
        id: "worker-4",
        name: "Isabelle Moreau",
        company: "Techniciens Spécialisés Inc.",
        phoneNumber: "+1 514 555-0205",
        employeeNumber: "TSI-9156",
        certification: ["Instrumentation", "Travail en hauteur"],
        lockStatus: "removed",
        workLocation: "Zone C - Salle de contrôle",
        consentAST: true,
        consentSignatureDate: "2025-01-15T08:02:44",
        workStarted: true,
        workStartTime: "2025-01-15T09:00:00",
        workEnded: false,
        workEndTime: "",
        totalWorkTime: 240, // 4h00min
        signature: "IM_signature_base64", 
        consentTimestamp: "2025-01-15T08:02:44Z",
        astValidated: true,
        workTimer: {
          startTime: "2025-01-15T09:00:00",
          isActive: true,
          totalTime: 240 * 60 * 1000,
          breaks: []
        },
        assignedLocks: [],
        registeredAt: "2025-01-15T08:02:44Z",
        lastActivity: "2025-01-15T13:00:00Z"
      }
    ],
    totalCount: 4,
    lastUpdated: "2025-01-15T13:00:00Z"
  },

  // ✅ STEP 5 - VALIDATION ÉQUIPE (Complète)
  validation: {
    reviewers: [
      {
        id: "reviewer-1",
        name: "Jean-Marc Tremblay",
        role: "Superviseur sécurité",
        email: "jm.tremblay@hydroquebec.com",
        status: "approved",
        comments: "AST conforme aux standards Hydro-Québec. Équipe expérimentée et bien préparée.",
        rating: 5,
        approvedAt: "2025-01-15T07:30:00Z",
        signature: "JMT_signature_base64"
      },
      {
        id: "reviewer-2", 
        name: "Dr. Anne Lefebvre",
        role: "Médecin du travail",
        email: "a.lefebvre@hydroquebec.com",
        status: "approved", 
        comments: "Évaluation médicale des risques validée. Aucune contre-indication pour l'équipe.",
        rating: 5,
        approvedAt: "2025-01-15T07:35:00Z",
        signature: "AL_signature_base64"
      },
      {
        id: "reviewer-3",
        name: "Marc Dubois",
        role: "Ingénieur responsable",
        email: "m.dubois@hydroquebec.com", 
        status: "approved",
        comments: "Procédures techniques validées. Autorisation donnée pour démarrer les travaux.",
        rating: 4,
        approvedAt: "2025-01-15T07:40:00Z",
        signature: "MD_signature_base64"
      }
    ],
    approvals: [
      "Sécurité industrielle",
      "Médecine du travail", 
      "Ingénierie",
      "Gestion de projet"
    ],
    signatures: 3,
    finalApproval: true,
    criteria: {
      projectInfo: true,
      equipmentPPE: true, 
      hazardControl: true,
      riskAssessment: true,
      completeness: true
    },
    comments: [
      "AST exceptionnellement bien préparée",
      "Équipe hautement qualifiée et expérimentée",
      "Procédures de sécurité exemplaires"
    ]
  }
};

// =================== FONCTION D'INJECTION DES DONNÉES ===================

export const injectDemoData = (formData: any) => {
  return {
    ...formData,
    ...DEMO_DATA,
    astNumber: `AST-DEMO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: 'demo-complete'
  };
};

export const getDemoDataByStep = (step: number) => {
  switch (step) {
    case 1:
      return { projectInfo: DEMO_DATA.projectInfo };
    case 2:
      return { 
        projectInfo: DEMO_DATA.projectInfo,
        equipment: DEMO_DATA.equipment 
      };
    case 3:
      return {
        projectInfo: DEMO_DATA.projectInfo,
        equipment: DEMO_DATA.equipment,
        hazards: DEMO_DATA.hazards
      };
    case 4:
      return {
        projectInfo: DEMO_DATA.projectInfo,
        equipment: DEMO_DATA.equipment,
        hazards: DEMO_DATA.hazards,
        permits: DEMO_DATA.permits,
        workers: DEMO_DATA.workers
      };
    case 5:
      return DEMO_DATA;
    default:
      return {};
  }
};