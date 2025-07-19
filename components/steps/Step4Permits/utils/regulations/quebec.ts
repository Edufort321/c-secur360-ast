/**
 * Commission des normes, de l'équité, de la santé et de la sécurité du travail (CNESST)
 * Confined Space Regulations and Compliance System
 * 
 * Standards: Règlement sur la santé et la sécurité du travail (RSST)
 * Section XVII: Espaces clos (Articles 297-312)
 * 
 * Provincial Focus: Manufacturing, mining, hydroelectric, aerospace, bilingual requirements
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

// =================== QUÉBEC AUTHORITY ===================

export const CNESST_QC_AUTHORITY = {
  name: 'Commission des normes, de l\'équité, de la santé et de la sécurité du travail',
  acronym: 'CNESST',
  jurisdiction: ['QC'] as const,
  website: 'https://www.cnesst.gouv.qc.ca',
  contactInfo: {
    phone: '1-844-838-0808',              // Ligne principale CNESST
    preventionPhone: '418-266-4000',       // Services prévention
    email: 'prevention@cnesst.gouv.qc.ca',
    address: '524, rue Bourdages, Québec (Québec) G1K 7E2'
  },
  regionalOffices: [
    { region: 'Montréal', phone: '514-906-3000', coverage: 'Région métropolitaine, Aérospatiale, Manufacturier' },
    { region: 'Québec', phone: '418-266-4000', coverage: 'Capitale-Nationale, Administration publique' },
    { region: 'Sherbrooke', phone: '819-820-3534', coverage: 'Estrie, Cantons-de-l\'Est' },
    { region: 'Trois-Rivières', phone: '819-371-6581', coverage: 'Mauricie, Pâtes et papiers' },
    { region: 'Chicoutimi', phone: '418-549-7388', coverage: 'Saguenay-Lac-Saint-Jean, Alumineries' },
    { region: 'Rimouski', phone: '418-727-3589', coverage: 'Bas-Saint-Laurent, Gaspésie' },
    { region: 'Rouyn-Noranda', phone: '819-763-3585', coverage: 'Abitibi-Témiscamingue, Mines' },
    { region: 'Sept-Îles', phone: '418-964-8888', coverage: 'Côte-Nord, Mines de fer' }
  ],
  languages: ['fr', 'en'] as const,        // Province officiellement francophone
  specializedUnits: [
    'division_securite_miniere',           // Division sécurité minière
    'unite_hydroelectricite',              // Unité hydroélectricité
    'programme_aerospatiale',              // Programme aérospatiale
    'services_bilingues'                   // Services bilingues
  ],
  powers: [
    'Inspections et enquêtes en milieu de travail',
    'Émission d\'ordonnances et de directives',
    'Arrêts de travail',
    'Amendes administratives jusqu\'à 2 000 000 $',
    'Poursuites pénales sous la loi provinciale'
  ]
} as const;

// =================== QC SPECIFIC FEATURES ===================

export const QC_SPECIFIC_FEATURES = {
  manufacturingOperations: [
    'aerospace_bombardier_pratt_whitney',   // Aérospatiale Bombardier, Pratt & Whitney
    'aluminum_smelters_alcoa_rio_tinto',    // Alumineries Alcoa, Rio Tinto
    'pulp_paper_mills_resolute_cascades',  // Pâtes et papiers Résolu, Cascades
    'pharmaceutical_manufacturing_montreal',
    'textile_manufacturing_traditional'
  ],
  hydroelectricOperations: [
    'hydro_quebec_generating_stations',     // Centrales Hydro-Québec
    'james_bay_hydroelectric_complex',     // Complexe hydroélectrique Baie-James
    'churchill_falls_labrador_transmission',
    'dam_spillway_maintenance_operations',
    'transmission_substation_facilities'
  ],
  miningOperations: [
    'iron_ore_mining_sept_iles_fermont',   // Mines fer Sept-Îles, Fermont
    'gold_mining_abitibi_temiscamingue',   // Mines or Abitibi-Témiscamingue
    'copper_zinc_mining_noranda',          // Mines cuivre-zinc Noranda
    'asbestos_mining_legacy_sites',        // Sites miniers amiante patrimoniaux
    'rare_earth_mining_exploration'        // Exploration terres rares
  ],
  bilingualRequirements: [
    'documentation_obligatoire_francais',   // Documentation obligatoire français
    'formation_securite_langue_francaise',  // Formation sécurité langue française
    'affichage_securite_francais_priorite', // Affichage sécurité français priorité
    'services_anglais_disponibles',         // Services anglais disponibles
    'communications_urgence_bilingues'      // Communications urgence bilingues
  ],
  charteLangue: [
    'charte_langue_francaise_article_46',   // Charte langue française article 46
    'francisation_entreprises_obligatoire', // Francisation entreprises obligatoire
    'terminologie_securite_francaise',      // Terminologie sécurité française
    'formation_personnel_francais'          // Formation personnel français
  ],
  regulatoryIntegration: [
    'regie_batiment_quebec_rbq',           // Régie du bâtiment Québec
    'ministere_environnement_quebec',      // Ministère Environnement Québec
    'hydro_quebec_coordination',           // Coordination Hydro-Québec
    'societes_etat_quebec'                 // Sociétés d'État Québec
  ]
} as const;

// =================== QC REGULATION STANDARDS ===================

export const QC_REGULATION_STANDARDS: Record<string, RegulationStandard> = {
  'QC_RSST_297': {
    id: 'QC_RSST_297',
    title: { 
      fr: 'Définition et identification des espaces clos', 
      en: 'Confined Space Definition and Identification' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    section: '297',
    category: 'definition',
    mandatory: true,
    criteria: [
      'Espace totalement ou partiellement clos',
      'Non conçu pour être occupé par des personnes',
      'Moyens d\'accès ou d\'évacuation limités',
      'Peut présenter des risques pour la santé et la sécurité',
      'Inclut les installations manufacturières, minières et hydroélectriques du Québec'  // QC specific
    ],
    qcSpecific: {
      manufacturingDefinitions: [
        'espaces_confinés_aérospatiale_bombardier',
        'cuves_alumineries_alcoa_rio_tinto',
        'digesteurs_papeteries_résolu_cascades',
        'réservoirs_pharmaceutiques_montréal'
      ],
      hydroelectricDefinitions: [
        'conduites_forcées_hydro_québec',
        'chambres_turbines_centrales_génération',
        'galeries_évacuateurs_barrages',
        'postes_transformation_transport_énergie'
      ],
      miningDefinitions: [
        'galeries_mines_souterraines_abitibi',
        'cuves_traitement_minerai_sept_îles',
        'silos_concentré_mines_fer',
        'bassins_résidus_miniers_noranda'
      ],
      bilingualRequirements: [
        'identification_française_obligatoire',
        'panneaux_sécurité_français_priorité',
        'documentation_bilingue_disponible'
      ]
    },
    penalties: {
      individual: { min: 600, max: 300000 },     // 2023 amounts
      corporation: { min: 6000, max: 2000000 }
    },
    references: [
      {
        type: 'regulation',
        title: 'Règlement sur la santé et la sécurité du travail',
        citation: 'RLRQ c. S-2.1, r. 13',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013'
      }
    ]
  },

  'QC_RSST_299': {
    id: 'QC_RSST_299',
    title: { 
      fr: 'Évaluation des risques pour opérations québécoises', 
      en: 'Risk Assessment for Quebec Operations' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    section: '299',
    category: 'hazard_assessment',
    mandatory: true,
    criteria: [
      'Évaluation écrite des risques par personne compétente',
      'Identification de tous les dangers potentiels',
      'Évaluation des risques atmosphériques, physiques et chimiques',
      'Évaluation des voies d\'accès et d\'évacuation',
      'Considération des opérations adjacentes et saisonnières'
    ],
    qcSpecific: {
      manufacturingHazards: {
        aérospatiale: 'solvants_aéronautiques_composites_fibres_carbone',
        alumineries: 'vapeurs_aluminium_gaz_fluor_anodes_carbone',
        papeteries: 'liqueur_kraft_chlore_dioxyde_vapeurs_méthanol',
        pharmaceutique: 'principes_actifs_solvants_réactions_chimiques'
      },
      hydroelectricHazards: {
        centralesHydro: 'noyade_conduites_forcées_haute_pression',
        barrages: 'chutes_hauteur_débits_élevés_glace',
        postes: 'électrocution_haute_tension_arc_électrique',
        maintenance: 'travail_isolé_conditions_hivernales_extrêmes'
      },
      miningHazards: {
        minesSouterraines: 'éboulement_gaz_mines_explosions_poussières',
        traitementMinerai: 'produits_chimiques_flotation_cyanure_acides',
        résidusMiniers: 'drainage_minier_acide_métaux_lourds',
        transport: 'convoyeurs_broyeurs_équipements_mobiles'
      },
      climaticHazards: {
        hiverQuébec: 'froid_extrême_verglas_accumulation_neige',
        dégel: 'inondations_printemps_fonte_neiges',
        canicule: 'stress_thermique_orage_électrique'
      }
    },
    implementation: {
      timeline: 'avant_toute_entrée_espace_clos',
      resources: ['personne_compétente', 'spécialiste_industrie_québec'],
      responsibilities: ['employeur', 'personne_compétente', 'comité_santé_sécurité', 'représentant_syndical']
    }
  },

  'QC_RSST_302': {
    id: 'QC_RSST_302',
    title: { 
      fr: 'Contrôle de l\'atmosphère pour environnements industriels', 
      en: 'Atmospheric Control for Industrial Environments' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    section: '302',
    category: 'atmospheric_testing',
    mandatory: true,
    criteria: [
      'Vérification de l\'atmosphère par personne qualifiée',
      'Mesure de l\'oxygène, des gaz inflammables et des substances toxiques',
      'Vérification avant l\'entrée et de façon continue',
      'Utilisation d\'équipement étalonné et entretenu',
      'Documentation des résultats et des mesures correctives'
    ],
    standards: {
      oxygen: { min: 19.5, max: 23.0, unit: '%' },
      flammable_gas: { max: 10, unit: '%LIE' },    // %LIE en français
      carbon_monoxide: { max: 35, unit: 'ppm' },
      hydrogen_sulfide: { max: 10, unit: 'ppm' }
    },
    qcSpecific: {
      manufacturingTesting: {
        aérospatiale: ['toluène_xylène_solvants', 'isocyanates_polyuréthanes', 'fibres_carbone_époxy'],
        alumineries: ['fluorure_hydrogène_anodes', 'dioxyde_soufre_cuisson', 'vapeurs_aluminium_électrolyse'],
        papeteries: ['dioxyde_chlore_blanchiment', 'sulfure_hydrogène_kraft', 'méthanol_récupération'],
        pharmaceutique: ['solvants_organiques_synthèse', 'poussières_principes_actifs', 'vapeurs_réactions']
      },
      hydroelectricTesting: {
        conduitesForcées: ['monoxyde_carbone_soudage', 'vapeurs_huiles_hydrauliques', 'gaz_inertes_azote'],
        chambres: ['ozone_équipements_électriques', 'vapeurs_lubrifiants', 'gaz_SF6_disjoncteurs'],
        galeries: ['radon_roches_granitiques', 'humidité_condensation', 'gaz_explosion_mines']
      },
      miningTesting: {
        souterraines: ['méthane_gisements_naturels', 'monoxyde_carbone_équipements_diesel', 'poussières_silice'],
        traitement: ['cyanure_extraction_or', 'acides_lixiviation', 'xanthates_flotation'],
        stockage: ['ammoniac_explosifs', 'oxydes_azote_sautage', 'poussières_concentrés']
      }
    }
  },

  'QC_RSST_305': {
    id: 'QC_RSST_305',
    title: { 
      fr: 'Procédures d\'entrée et système de permis', 
      en: 'Entry Procedures and Permit System' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    section: '305',
    category: 'permit_system',
    mandatory: true,
    criteria: [
      'Procédure écrite d\'entrée pour chaque espace clos',
      'Permis d\'entrée délivré pour chaque entrée',
      'Autorisation par une personne compétente',
      'Spécification des mesures de sécurité et équipements',
      'Coordination avec les autres activités du lieu de travail'
    ],
    qcSpecific: {
      manufacturingPermits: {
        aérospatiale: 'coordination_chaînes_assemblage_bombardier',
        alumineries: 'coordination_électrolyse_continue_24h',
        papeteries: 'coordination_procédés_continus_kraft',
        pharmaceutique: 'coordination_production_principes_actifs'
      },
      hydroelectricPermits: {
        centrales: 'coordination_exploitation_hydro_québec',
        maintenance: 'coordination_arrêts_groupes_turbines',
        distribution: 'coordination_réseau_transport_énergie',
        urgence: 'coordination_répartition_charge_électrique'
      },
      miningPermits: {
        exploitation: 'coordination_extraction_minerai_continue',
        traitement: 'coordination_usines_concentration',
        transport: 'coordination_expédition_concentrés',
        environnement: 'coordination_gestion_résidus_miniers'
      },
      bilingualRequirements: {
        documentation: 'permis_français_obligatoire_anglais_disponible',
        formation: 'formation_sécurité_langue_française',
        communication: 'communications_urgence_bilingues'
      }
    }
  },

  'QC_RSST_308': {
    id: 'QC_RSST_308',
    title: { 
      fr: 'Surveillant et systèmes de communication', 
      en: 'Attendant and Communication Systems' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    section: '308',
    category: 'attendant_requirements',
    mandatory: true,
    criteria: [
      'Surveillant qualifié positionné à l\'extérieur de l\'espace clos',
      'Communication efficace entre surveillant et personnes entrantes',
      'Surveillance des conditions pouvant affecter la sécurité',
      'Autorité d\'ordonner l\'évacuation immédiate',
      'Compréhension des procédures d\'urgence'
    ],
    qcSpecific: {
      manufacturingSurveillant: {
        aérospatiale: 'intégration_systèmes_production_bombardier',
        alumineries: 'surveillance_procédés_électrolyse_continus',
        papeteries: 'surveillance_procédés_kraft_blanchiment',
        pharmaceutique: 'surveillance_atmosphères_contrôlées'
      },
      hydroelectricSurveillant: {
        centrales: 'surveillance_exploitation_groupes_turbines',
        barrages: 'surveillance_débits_niveaux_réservoirs',
        distribution: 'surveillance_réseau_haute_tension',
        télécommande: 'surveillance_systèmes_scada_automatisés'
      },
      miningSurveillant: {
        souterrain: 'surveillance_ventilation_mines_gaz',
        traitement: 'surveillance_procédés_concentration',
        transport: 'surveillance_convoyeurs_manutention',
        environnement: 'surveillance_rejets_émissions'
      },
      bilingualRequirements: {
        communication: 'communication_français_anglais_urgence',
        formation: 'formation_surveillant_langue_française',
        documentation: 'procédures_urgence_bilingues'
      }
    }
  }
};

// =================== QC ATMOSPHERIC STANDARDS ===================

export const QC_ATMOSPHERIC_STANDARDS = {
  oxygen: { min: 19.5, max: 23.0, unit: '%' },
  flammable_gas: { max: 10, unit: '%LIE' },       // %LIE en français
  carbon_monoxide: { max: 35, unit: 'ppm' },
  hydrogen_sulfide: { max: 10, unit: 'ppm' },
  
  // QC Manufacturing Industry Specific
  manufacturingSpecific: {
    toluène_aérospatiale: { max: 50, unit: 'ppm' },     // Aérospatiale solvants
    isocyanates: { max: 0.005, unit: 'ppm' },           // Polyuréthanes
    fluorure_hydrogène: { max: 0.5, unit: 'ppm' },      // Alumineries anodes
    dioxyde_chlore: { max: 0.1, unit: 'ppm' },          // Papeteries blanchiment
    vapeurs_aluminium: { max: 2, unit: 'mg/m³' }        // Électrolyse aluminium
  },
  
  // QC Hydroelectric Industry Specific  
  hydroelectricSpecific: {
    sf6_disjoncteurs: { max: 1000, unit: 'ppm' },       // Hexafluorure soufre
    ozone_équipements: { max: 0.1, unit: 'ppm' },       // Ozone équipements électriques
    vapeurs_huiles: { max: 5, unit: 'mg/m³' },          // Huiles hydrauliques
    radon_galeries: { max: 800, unit: 'Bq/m³' }         // Radon galeries souterraines
  },
  
  // QC Mining Industry Specific
  miningSpecific: {
    cyanure_extraction: { max: 4.7, unit: 'mg/m³' },    // Extraction or cyanure
    silice_poussières: { max: 0.1, unit: 'mg/m³' },     // Silice cristalline respirable
    xanthates_flotation: { max: 5, unit: 'mg/m³' },     // Xanthates flotation
    ammoniac_explosifs: { max: 25, unit: 'ppm' },       // Ammoniac explosifs
    méthane_souterrain: { max: 1.25, unit: '%' }        // Méthane mines souterraines
  }
} as const;

// =================== QC PERSONNEL QUALIFICATIONS ===================

export const QC_PERSONNEL_QUALIFICATIONS: Record<string, PersonnelQualification> = {
  personne_compétente: {
    id: 'qc_personne_compétente',
    title: { 
      fr: 'Personne compétente - Espaces clos Québec', 
      en: 'Competent Person - Quebec Confined Space' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    requirements: [
      'Connaissance, formation et expérience des dangers d\'espaces clos',
      'Familiarité avec la LSST et le RSST du Québec',
      'Compréhension des dangers spécifiques aux industries québécoises',
      'Autorité pour mettre en œuvre des mesures de sécurité',
      'Connaissance des systèmes d\'urgence du Québec'
    ],
    qcSpecific: {
      manufacturingCompétence: {
        aérospatiale: 'expérience_bombardier_pratt_whitney_procédés',
        alumineries: 'expérience_alcoa_rio_tinto_électrolyse',
        papeteries: 'expérience_résolu_cascades_procédés_kraft',
        pharmaceutique: 'expérience_manufacturiers_montréal_principes_actifs'
      },
      hydroelectricCompétence: {
        certifications: ['hydro_québec_sécurité_électrique', 'travail_haute_tension'],
        expérience: 'centrales_hydroélectriques_baie_james_churchill',
        urgence: 'coordination_répartition_charge_hydro_québec'
      },
      miningCompétence: {
        certifications: ['certificat_mineur_québec', 'sécurité_mines_souterraines'],
        expérience: 'mines_abitibi_sept_îles_noranda',
        urgence: 'équipes_sauvetage_minier_québec'
      },
      exigencesBilingues: {
        français: 'maîtrise_français_obligatoire_loi_101',
        anglais: 'anglais_fonctionnel_entreprises_fédérales',
        formation: 'formation_sécurité_langue_française'
      }
    },
    certification: 'cnesst_formation_personne_compétente_approuvée',
    validity: 'en_cours_recyclage_annuel',
    mandatoryTraining: [
      'cnesst_espaces_clos_personne_compétente',
      'dangers_spécifiques_industries_québec',
      'coordination_urgence_québec',
      'intégration_comité_santé_sécurité'
    ]
  },

  surveillant: {
    id: 'qc_surveillant',
    title: { 
      fr: 'Surveillant d\'espaces clos Québec', 
      en: 'Quebec Confined Space Attendant' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    requirements: [
      'Formation aux tâches de surveillant pour opérations québécoises',
      'Connaissance des procédures de communication',
      'Compréhension des procédures d\'urgence spécifiques',
      'Familiarité avec l\'équipement de surveillance atmosphérique',
      'Secourisme général et RCR certification'
    ],
    qcSpecific: {
      manufacturingSurveillant: {
        aérospatiale: 'formation_procédures_urgence_bombardier',
        alumineries: 'formation_procédures_urgence_alcoa_rio_tinto',
        papeteries: 'formation_procédures_urgence_résolu_cascades',
        pharmaceutique: 'formation_atmosphères_contrôlées_pharmaceutique'
      },
      hydroelectricSurveillant: {
        certifications: ['hydro_québec_sécurité_base', 'premiers_soins_milieu_isolé'],
        systèmes: 'systèmes_communication_scada_hydro_québec',
        urgence: 'procédures_urgence_centrales_hydroélectriques'
      },
      miningSurveillant: {
        certifications: ['secourisme_minier_québec', 'procédures_urgence_souterrain'],
        communication: 'systèmes_communication_mines_souterraines',
        urgence: 'équipes_sauvetage_minier_coordination'
      },
      exigencesBilingues: {
        français: 'communication_français_obligatoire',
        anglais: 'communication_anglais_entreprises_fédérales',
        urgence: 'communications_urgence_bilingues'
      }
    },
    certification: 'cnesst_formation_surveillant_plus_industrie_spécifique',
    validity: 'recertification_annuelle'
  },

  vérificateur_atmosphérique: {
    id: 'qc_vérificateur_atmosphérique',
    title: { 
      fr: 'Vérificateur atmosphérique Québec', 
      en: 'Quebec Atmospheric Tester' 
    },
    authority: 'CNESST',
    jurisdiction: ['QC'],
    requirements: [
      'Formation sur l\'utilisation d\'équipement de détection de gaz',
      'Connaissance des normes atmosphériques CNESST et variations industrielles',
      'Compréhension des procédures d\'étalonnage d\'équipement',
      'Capacité d\'interpréter les résultats pour différentes industries',
      'Connaissance des dangers atmosphériques spécifiques au Québec'
    ],
    qcSpecific: {
      manufacturingTesting: {
        aérospatiale: 'détection_solvants_aéronautiques_isocyanates',
        alumineries: 'détection_fluorures_vapeurs_aluminium',
        papeteries: 'détection_dioxyde_chlore_sulfures_méthanol',
        pharmaceutique: 'détection_principes_actifs_solvants_organiques'
      },
      hydroelectricTesting: {
        équipements: 'détection_sf6_ozone_vapeurs_huiles',
        galeries: 'détection_radon_gaz_souterrains',
        maintenance: 'détection_gaz_soudage_atmosphères_inertes'
      },
      miningTesting: {
        souterrain: 'détection_méthane_monoxyde_carbone_poussières',
        traitement: 'détection_cyanure_acides_xanthates',
        explosifs: 'détection_ammoniac_oxydes_azote'
      },
      climatQuébec: {
        hiver: 'compensation_température_équipement_froid_extrême',
        humidité: 'compensation_humidité_équipement_condensation'
      }
    },
    certification: 'fabricant_équipement_plus_formation_industrie_québec',
    validity: 'recertification_annuelle_mises_jour_équipement'
  }
};

// =================== QC EMERGENCY SERVICES ===================

export const QC_EMERGENCY_SERVICES = {
  general: {
    ambulance: '911',
    fire: '911',
    police: '911',
    cnesst: '1-844-838-0808'
  },
  
  manufacturingEmergency: {
    aérospatiale: {
      bombardier: '514-855-5000',           // Bombardier Aéronautique
      prattWhitney: '450-647-8000',         // Pratt & Whitney Canada
      bell: '450-437-2862',                 // Bell Helicopter Textron
      cae: '514-341-6780'                   // CAE Simulateurs
    },
    alumineries: {
      alcoa: '418-549-4494',                // Alcoa Deschambault
      rioTinto: '418-589-2431',             // Rio Tinto Alma
      alouette: '514-384-4242'              // Aluminerie Alouette Sept-Îles
    },
    papeteries: {
      résolu: '819-627-3000',               // Produits forestiers Résolu
      cascades: '819-363-5100',             // Cascades
      kruger: '819-762-3178'                // Kruger
    }
  },
  
  hydroelectric: {
    hydroQuébec: '1-800-790-2424',          // Hydro-Québec urgence
    exploitationCentrales: '514-289-2211',  // Exploitation centrales
    transport: '514-289-5120',              // Transport énergie
    distribution: '1-800-790-2424',         // Distribution
    répartitionCharge: '514-289-2211'       // Répartition charge
  },
  
  mining: {
    miningSafetyQuébec: '819-763-3585',     // Sécurité minière Québec
    minesAbitibi: {
      agnicoEagle: '819-637-7146',          // Agnico Eagle Mines
      iamgold: '819-797-4335',              // IAMGOLD
      canadianMalartic: '819-757-3737'     // Canadian Malartic
    },
    minesSeptÎles: {
      arcMittal: '418-968-3333',            // ArcelorMittal Mines Canada
      iocc: '418-968-8000',                 // Iron Ore Company of Canada
      quebec: '418-962-6032'                // Champion Iron
    },
    sauvetageMinier: '819-762-0931'         // Sauvetage minier Québec
  },
  
  specializedRescue: {
    confinedSpaceRescue: '911_demander_équipe_sauvetage_technique',
    industrialRescue: 'équipe_hazmat_service_incendie_local',
    hydroelectricEmergency: 'plan_urgence_hydro_québec',
    mineRescue: 'association_sauvetage_minier_québec'
  }
} as const;

// =================== COMPLIANCE CHECKING ===================

export function checkQCCompliance(
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: 'manufacturing' | 'hydroelectric' | 'mining' | 'general'
): ComplianceResult {
  const results: ComplianceCheck[] = [];
  let overallScore = 0;
  const totalChecks = Object.keys(QC_REGULATION_STANDARDS).length;

  // Check each standard
  Object.values(QC_REGULATION_STANDARDS).forEach(standard => {
    const check = performQCStandardCheck(standard, permitData, atmosphericReadings, personnel, industryType);
    results.push(check);
    overallScore += check.status === 'compliant' ? 1 : 0;
  });

  const overallCompliance = (overallScore / totalChecks) * 100;
  const criticalNonCompliance = results.filter(r => 
    r.status === 'non_compliant' && r.priority === 'critical'
  ).length;

  return {
    jurisdiction: 'QC',
    overallCompliance,
    results,
    criticalNonCompliance,
    qcSpecific: {
      industryType: industryType || 'general',
      manufacturingConsiderations: industryType === 'manufacturing' ? getManufacturingConsiderations() : undefined,
      hydroelectricConsiderations: industryType === 'hydroelectric' ? getHydroelectricConsiderations() : undefined,
      miningConsiderations: industryType === 'mining' ? getMiningConsiderations() : undefined,
      bilingualRequirements: getBilingualRequirements(),
      charteLangue: getCharteLangueRequirements(),
      emergencyServices: getQCEmergencyServices(industryType),
      regulatoryIntegration: getQCRegulatoryIntegration(industryType),
      comitéSantéSécurité: getComitéSantéSécuritéIntegration()
    },
    actionPlan: generateQCActionPlan(results.filter(r => r.status === 'non_compliant'), industryType)
  };
}

function performQCStandardCheck(
  standard: RegulationStandard,
  permitData: LegalPermit,
  atmosphericReadings: AtmosphericReading[],
  personnel: PersonnelData[],
  industryType?: string
): ComplianceCheck {
  switch (standard.id) {
    case 'QC_RSST_297':
      return checkConfinedSpaceIdentification(permitData);
    case 'QC_RSST_299':
      return checkQuebecHazardAssessment(permitData, industryType);
    case 'QC_RSST_302':
      return checkQuebecAtmosphericTesting(atmosphericReadings, industryType);
    case 'QC_RSST_305':
      return checkQuebecEntryPermitSystem(permitData, industryType);
    case 'QC_RSST_308':
      return checkQuebecAttendantRequirements(personnel, industryType);
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
    aérospatialeIntegration: 'coordination_sécurité_bombardier_pratt_whitney',
    alumineries: 'gestion_vapeurs_aluminium_fluorures_électrolyse',
    papeteries: 'gestion_procédés_kraft_blanchiment_dioxyde_chlore',
    pharmaceutique: 'atmosphères_contrôlées_principes_actifs_solvants',
    contrôleQualité: 'intégration_qualité_sécurité_production'
  };
}

function getHydroelectricConsiderations() {
  return {
    centralesHydro: 'coordination_exploitation_hydro_québec',
    distributionTransport: 'sécurité_réseau_haute_tension',
    barragesComplexes: 'sécurité_baie_james_churchill_falls',
    maintenanceProgrammée: 'arrêts_maintenance_groupes_turbines',
    protectionEnvironnement: 'protection_écosystèmes_aquatiques'
  };
}

function getMiningConsiderations() {
  return {
    exploitationSouterraine: 'ventilation_mines_gaz_éboulements',
    traitementMinerai: 'procédés_concentration_cyanure_acides',
    gestionRésidus: 'bassins_résidus_drainage_minier_acide',
    urgenceSauvetage: 'équipes_sauvetage_minier_québec',
    protectionSilice: 'prévention_silicose_poussières_cristallines'
  };
}

function getBilingualRequirements() {
  return {
    documentationFrançaise: 'documentation_sécurité_française_obligatoire',
    formationFrançaise: 'formation_sécurité_langue_française_priorité',
    affichageFrançais: 'panneaux_sécurité_français_priorité',
    servicesAnglais: 'services_anglais_disponibles_sur_demande',
    communicationsUrgence: 'communications_urgence_bilingues'
  };
}

function getCharteLangueRequirements() {
  return {
    article46: 'charte_langue_française_article_46_respect',
    francisationEntreprises: 'francisation_entreprises_50_plus_employés',
    terminologieSécurité: 'terminologie_sécurité_française_oqlf',
    formationPersonnel: 'formation_personnel_français_obligatoire'
  };
}

function getQCEmergencyServices(industryType?: string) {
  const base = QC_EMERGENCY_SERVICES.general;
  
  if (industryType === 'manufacturing') {
    return { ...base, ...QC_EMERGENCY_SERVICES.manufacturingEmergency };
  }
  
  if (industryType === 'hydroelectric') {
    return { ...base, ...QC_EMERGENCY_SERVICES.hydroelectric };
  }
  
  if (industryType === 'mining') {
    return { ...base, ...QC_EMERGENCY_SERVICES.mining };
  }
  
  return base;
}

function getQCRegulatoryIntegration(industryType?: string) {
  const base = ['cnesst', 'ministère_travail_emploi_solidarité_sociale'];
  
  if (industryType === 'hydroelectric') {
    return [...base, 'hydro_québec', 'régie_énergie_québec'];
  }
  
  if (industryType === 'mining') {
    return [...base, 'ministère_énergie_ressources_naturelles', 'melcc_québec'];
  }
  
  if (industryType === 'manufacturing') {
    return [...base, 'ministère_économie_innovation', 'investissement_québec'];
  }
  
  return base;
}

function getComitéSantéSécuritéIntegration() {
  return {
    consultationCSS: 'consultation_comité_santé_sécurité_obligatoire',
    représentationTravailleur: 'représentant_travailleur_évaluation_espace_clos',
    coordinationFormation: 'coordination_formation_sécurité_css',
    enquêteAccident: 'participation_css_enquête_accident'
  };
}

function generateQCActionPlan(nonCompliantResults: ComplianceCheck[], industryType?: string): ActionPlan[] {
  return nonCompliantResults.map(result => ({
    standardId: result.standardId,
    action: getQCCorrectiveAction(result.requirementId, industryType),
    responsible: 'personne_compétente',
    deadline: result.priority === 'critical' ? 'immédiat' : 
              result.priority === 'high' ? '24_heures' : '7_jours',
    resources: getQCRequiredResources(result.requirementId, industryType),
    verification: 'vérification_inspecteur_cnesst'
  }));
}

function getQCCorrectiveAction(requirementId: string, industryType?: string): BilingualText {
  const actions: Record<string, BilingualText> = {
    confined_space_identification: {
      fr: `Identifier et classifier tous les espaces clos dans les opérations ${industryType || 'Québec'} selon le RSST`,
      en: `Identify and classify all confined spaces in ${industryType || 'Quebec'} operations according to RSST`
    },
    quebec_hazard_assessment: {
      fr: `Effectuer évaluation complète des risques incluant facteurs climatiques québécois pour opérations ${industryType || 'générales'}`,
      en: `Conduct comprehensive risk assessment including Quebec climatic factors for ${industryType || 'general'} operations`
    },
    atmospheric_testing: {
      fr: `Effectuer contrôle atmosphérique selon standards spécifiques ${industryType || 'industrie'} et exigences CNESST`,
      en: `Perform atmospheric control with ${industryType || 'industry'}-specific standards and CNESST requirements`
    },
    entry_permit: {
      fr: `Implémenter système permis d'entrée avec coordination ${industryType || 'industrielle'} et exigences bilingues`,
      en: `Implement entry permit system with ${industryType || 'industrial'} coordination and bilingual requirements`
    },
    attendant_present: {
      fr: `Assigner surveillant qualifié avec formation ${industryType || 'industrie'} spécifique et certification CNESST`,
      en: `Assign qualified attendant with ${industryType || 'industry'}-specific training and CNESST certification`
    }
  };
  
  return actions[requirementId] || {
    fr: 'Traiter non-conformité identifiée selon exigences CNESST et RSST Québec',
    en: 'Address identified non-compliance according to CNESST and Quebec RSST requirements'
  };
}

function getQCRequiredResources(requirementId: string, industryType?: string): string[] {
  const baseResources: Record<string, string[]> = {
    confined_space_identification: ['personne_compétente', 'guide_rsst_cnesst'],
    quebec_hazard_assessment: ['personne_compétente', 'spécialiste_industrie_québec'],
    atmospheric_testing: ['détecteurs_étalonnés', 'vérificateur_certifié_cnesst'],
    entry_permit: ['formulaires_permis', 'procédures_coordination'],
    attendant_present: ['surveillant_formé_cnesst', 'équipement_communication']
  };
  
  const resources = baseResources[requirementId] || ['personne_compétente'];
  
  // Add industry-specific resources
  if (industryType === 'hydroelectric') {
    resources.push('coordination_hydro_québec', 'formation_haute_tension');
  } else if (industryType === 'mining') {
    resources.push('coordination_sauvetage_minier', 'formation_mines_souterraines');
  } else if (industryType === 'manufacturing') {
    resources.push('coordination_production', 'intégration_contrôle_qualité');
  }
  
  // Add Quebec-specific resources
  resources.push('consultation_css', 'documentation_bilingue_cnesst');
  
  return resources;
}

// Helper functions for specific standard checks
function checkConfinedSpaceIdentification(permitData: LegalPermit): ComplianceCheck {
  const hasIdentification = permitData.spaceDetails?.identification !== undefined;
  const hasQuebecClassification = permitData.spaceDetails?.regulatoryClassification?.includes('rsst_québec');
  const hasFrenchDocumentation = permitData.documentation?.some(doc => doc.language === 'fr');
  
  return {
    standardId: 'QC_RSST_297',
    requirementId: 'confined_space_identification',
    status: hasIdentification && hasQuebecClassification && hasFrenchDocumentation ? 'compliant' : 'non_compliant',
    evidence: hasIdentification ? ['documentation_identification_espace'] : [],
    gaps: [
      ...(hasIdentification ? [] : ['Identification espace clos manquante']),
      ...(hasQuebecClassification ? [] : ['Classification RSST Québec manquante']),
      ...(hasFrenchDocumentation ? [] : ['Documentation française obligatoire manquante'])
    ],
    priority: 'critical'
  };
}

function checkQuebecHazardAssessment(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasAssessment = permitData.hazardAssessment !== undefined;
  const hasQuebecHazards = permitData.hazardAssessment?.climaticFactors?.includes('québec_winter_conditions');
  const hasIndustrySpecificAssessment = industryType ? 
    permitData.hazardAssessment?.industrySpecific?.[industryType] !== undefined : true;
  const hasFrenchAssessment = permitData.hazardAssessment?.language === 'fr';
  
  return {
    standardId: 'QC_RSST_299',
    requirementId: 'quebec_hazard_assessment',
    status: hasAssessment && hasQuebecHazards && hasIndustrySpecificAssessment && hasFrenchAssessment ? 'compliant' : 'non_compliant',
    evidence: hasAssessment ? ['évaluation_risques_écrite'] : [],
    gaps: [
      ...(hasAssessment ? [] : ['Évaluation risques écrite manquante']),
      ...(hasQuebecHazards ? [] : ['Facteurs climatiques québécois manquants']),
      ...(hasIndustrySpecificAssessment ? [] : [`Évaluation spécifique ${industryType} manquante`]),
      ...(hasFrenchAssessment ? [] : ['Évaluation en français obligatoire manquante'])
    ],
    priority: 'critical'
  };
}

function checkQuebecAtmosphericTesting(atmosphericReadings: AtmosphericReading[], industryType?: string): ComplianceCheck {
  if (atmosphericReadings.length === 0) {
    return {
      standardId: 'QC_RSST_302',
      requirementId: 'atmospheric_testing',
      status: 'non_compliant',
      evidence: [],
      gaps: ['Aucun contrôle atmosphérique effectué'],
      priority: 'critical'
    };
  }

  const standards = getQCStandardsForIndustry(industryType);
  const hasQualifiedTester = atmosphericReadings.some(r => r.testerQualification?.includes('cnesst_certifié'));
  const hasFrenchDocumentation = atmosphericReadings.some(r => r.language === 'fr');
  const nonCompliantReadings = atmosphericReadings.filter(reading => {
    return !isQCReadingCompliant(reading, standards);
  });

  return {
    standardId: 'QC_RSST_302',
    requirementId: 'atmospheric_testing',
    status: nonCompliantReadings.length === 0 && hasQualifiedTester && hasFrenchDocumentation ? 'compliant' : 'non_compliant',
    evidence: ['résultats_contrôle_atmosphérique'],
    gaps: [
      ...nonCompliantReadings.map(r => 
        `Niveau ${r.gasType} ${r.value}${r.unit} hors limites acceptables pour opérations ${industryType || 'générales'}`
      ),
      ...(hasQualifiedTester ? [] : ['Vérificateur qualifié CNESST manquant']),
      ...(hasFrenchDocumentation ? [] : ['Documentation française obligatoire manquante'])
    ],
    priority: nonCompliantReadings.length > 0 ? 'critical' : 'medium'
  };
}

function checkQuebecEntryPermitSystem(permitData: LegalPermit, industryType?: string): ComplianceCheck {
  const hasPermitSystem = permitData.entryPermit !== undefined;
  const hasWrittenProcedures = permitData.entryPermit?.writtenProcedures !== undefined;
  const hasOperationalCoordination = permitData.entryPermit?.operationalCoordination !== undefined;
  const hasFrenchPermit = permitData.entryPermit?.language === 'fr';
  
  return {
    standardId: 'QC_RSST_305',
    requirementId: 'entry_permit',
    status: hasPermitSystem && hasWrittenProcedures && hasOperationalCoordination && hasFrenchPermit ? 'compliant' : 'non_compliant',
    evidence: hasPermitSystem ? ['documentation_permis_entrée'] : [],
    gaps: [
      ...(hasPermitSystem ? [] : ['Système permis entrée manquant']),
      ...(hasWrittenProcedures ? [] : ['Procédures écrites entrée manquantes']),
      ...(hasOperationalCoordination ? [] : ['Coordination opérationnelle manquante']),
      ...(hasFrenchPermit ? [] : ['Permis en français obligatoire manquant'])
    ],
    priority: 'critical'
  };
}

function checkQuebecAttendantRequirements(personnel: PersonnelData[], industryType?: string): ComplianceCheck {
  const hasAttendant = personnel.some(p => p.role === 'surveillant' || p.role === 'attendant');
  const attendantHasQCTraining = personnel
    .filter(p => p.role === 'surveillant' || p.role === 'attendant')
    .every(p => hasQuebecSpecificTraining(p, industryType));
  const hasFrenchCapability = personnel
    .filter(p => p.role === 'surveillant' || p.role === 'attendant')
    .every(p => p.languages?.includes('fr'));
  
  return {
    standardId: 'QC_RSST_308',
    requirementId: 'attendant_present',
    status: hasAttendant && attendantHasQCTraining && hasFrenchCapability ? 'compliant' : 'non_compliant',
    evidence: hasAttendant ? ['surveillant_assigné'] : [],
    gaps: [
      ...(hasAttendant ? [] : ['Aucun surveillant qualifié assigné']),
      ...(attendantHasQCTraining ? [] : [`Surveillant manque formation Québec ${industryType}`]),
      ...(hasFrenchCapability ? [] : ['Capacité communication française obligatoire manquante'])
    ],
    priority: 'critical'
  };
}

function getQCStandardsForIndustry(industryType?: string) {
  const baseStandards = QC_ATMOSPHERIC_STANDARDS;
  
  if (industryType === 'manufacturing') {
    return { ...baseStandards, ...baseStandards.manufacturingSpecific };
  }
  
  if (industryType === 'hydroelectric') {
    return { ...baseStandards, ...baseStandards.hydroelectricSpecific };
  }
  
  if (industryType === 'mining') {
    return { ...baseStandards, ...baseStandards.miningSpecific };
  }
  
  return baseStandards;
}

function isQCReadingCompliant(reading: AtmosphericReading, standards: any): boolean {
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

function hasQuebecSpecificTraining(personnel: PersonnelData, industryType?: string): boolean {
  const requiredTraining = {
    manufacturing: ['formation_sécurité_manufacturière_québec', 'coordination_production'],
    hydroelectric: ['formation_sécurité_hydro_québec', 'haute_tension'],
    mining: ['formation_sécurité_minière_québec', 'sauvetage_minier']
  };
  
  const quebecBaseline = ['formation_cnesst', 'secourisme_général', 'français_communication'];
  const industrySpecific = industryType ? requiredTraining[industryType as keyof typeof requiredTraining] || [] : [];
  const allRequired = [...quebecBaseline, ...industrySpecific];
  
  return allRequired.every(training => 
    personnel.qualifications?.some(q => q.type === training)
  );
}

// =================== EXPORTS ===================

export default {
  CNESST_QC_AUTHORITY,
  QC_SPECIFIC_FEATURES,
  QC_REGULATION_STANDARDS,
  QC_ATMOSPHERIC_STANDARDS,
  QC_PERSONNEL_QUALIFICATIONS,
  QC_EMERGENCY_SERVICES,
  checkQCCompliance
};

export type QCIndustryType = 'manufacturing' | 'hydroelectric' | 'mining' | 'general';
export type QCRegulationStandardId = keyof typeof QC_REGULATION_STANDARDS;
export type QCPersonnelQualificationId = keyof typeof QC_PERSONNEL_QUALIFICATIONS;
