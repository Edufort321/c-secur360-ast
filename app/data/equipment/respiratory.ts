// app/data/equipment/respiratory.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION RESPIRATOIRE ===================

export const n95FilteringFacepiece: SafetyEquipment = createNewEquipment({
  id: 'n95_respirator_niosh',
  name: 'Masque respiratoire N95',
  category: 'ppe_respiratory',
  subcategory: 'filtering_facepiece',
  displayName: {
    fr: 'Appareil de protection respiratoire N95',
    en: 'N95 filtering facepiece respirator'
  },
  description: 'Masque filtrant jetable contre particules solides et liquides non huileuses',
  
  specifications: {
    model: 'N95 NIOSH 42CFR84',
    filtrationEfficiency: '95% particules ≥0.3 microns',
    material: 'Média filtrant électrostatique',
    resistance: '<343 Pa @ 85 L/min'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 149 FFP2 équivalent'],
    iso: [],
    other: ['NIOSH 42CFR84', 'FDA 510(k)']
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['respiratory_system', 'nose', 'mouth'],
  hazardsProtectedAgainst: [
    'dust_particles',
    'mold_fungal_contamination',
    'non_oil_aerosols',
    'biological_droplets'
  ],
  
  usageInstructions: {
    fr: [
      'Test d\'étanchéité utilisateur obligatoire',
      'Placer sur nez et bouche couvrant menton',
      'Ajuster sangles: inférieure nuque, supérieure sommet tête',
      'Presser pince-nez pour ajustement',
      'Test étanchéité: inspiration/expiration forcées'
    ],
    en: [
      'Mandatory user seal check',
      'Position over nose and mouth covering chin',
      'Adjust straps: lower behind neck, upper on crown',
      'Press nose clip for fit',
      'Seal check: forced inhalation/exhalation'
    ]
  },
  
  limitationsUse: [
    'Usage unique seulement - JETABLE',
    'Ne protège pas contre gaz et vapeurs',
    'Ne convient pas atmosphères IDLH',
    'Remplacer si humide, souillé ou endommagé',
    'Test d\'ajustement requis annuellement',
    'Ne pas utiliser avec barbe'
  ],
  
  compatibility: [
    'safety_glasses_z94_3',
    'safety_helmet_class_e'
  ],
  
  incompatibility: [
    'chemical_safety_goggles',
    'face_shield_polycarbonate'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Emballage scellé intact',
    'Absence déformation masque',
    'Sangles élastiques intactes',
    'Pince-nez fonctionnelle',
    'Date expiration non dépassée',
    'Test étanchéité réussi'
  ],
  
  maintenanceInstructions: [
    'JETABLE - aucun nettoyage',
    'Stockage lieu sec température ambiante',
    'Éviter compression ou pliage',
    'Élimination selon déchets biomédicaux si contaminé'
  ],
  
  storageInstructions: [
    'Emballage original jusqu\'à usage',
    'Température 15-30°C',
    'Humidité relative <80%',
    'Éviter lumière directe',
    'FIFO - premier entré, premier sorti'
  ],
  
  lifespanMonths: 60, // En stockage
  expirationWarning: 6,
  replacementCriteria: [
    'Usage unique terminé',
    'Humidité ou souillure',
    'Déformation ou dommage',
    'Difficulté respiratoire',
    'Odeur détectée à travers filtre',
    'Date expiration atteinte'
  ],
  
  temperatureRange: { min: -30, max: 50, unit: '°C' },
  humidityRange: { min: 0, max: 95, unit: '%' },
  
  estimatedCost: {
    amount: 3,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M', 'Honeywell', 'Moldex', 'MSA', 'Kimberly-Clark'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Test d\'ajustement quantitatif/qualitatif',
    'Utilisation et limitations',
    'Test d\'étanchéité utilisateur',
    'Stockage et élimination'
  ],
  certificationRequired: false,
  
  isMandatory: false,
  
  tags: ['n95', 'jetable', 'particules', 'test_ajustement', 'niosh']
});

export const halfMaskReusable: SafetyEquipment = createNewEquipment({
  id: 'half_mask_reusable_p100',
  name: 'Demi-masque réutilisable P100',
  category: 'ppe_respiratory',
  subcategory: 'half_mask',
  displayName: {
    fr: 'Demi-masque réutilisable avec filtres P100',
    en: 'Reusable half-mask with P100 filters'
  },
  description: 'Masque réutilisable avec cartouches filtrantes remplaçables',
  
  specifications: {
    model: 'Silicone/TPE réutilisable',
    filtrationEfficiency: '99.97% toutes particules',
    cartridgeType: 'P100 + cartouches spécialisées',
    faceSealMaterial: 'Silicone médical'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 140', 'EN 143'],
    iso: [],
    other: ['NIOSH 42CFR84']
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['respiratory_system', 'nose', 'mouth'],
  hazardsProtectedAgainst: [
    'hazardous_chemical_exposure',
    'asbestos_fiber_exposure',
    'organic_solvents_vapors',
    'dust_particles',
    'mold_fungal_contamination'
  ],
  
  usageInstructions: {
    fr: [
      'Test d\'ajustement professionnel obligatoire',
      'Inspection pré-usage cartouches et masque',
      'Ajustement sangles: bas puis haut',
      'Test étanchéité positif et négatif',
      'Remplacement cartouches selon usage/temps',
      'Nettoyage après chaque utilisation'
    ],
    en: [
      'Professional fit testing mandatory',
      'Pre-use inspection of cartridges and mask',
      'Adjust straps: lower then upper',
      'Positive and negative seal check',
      'Replace cartridges per use/time',
      'Clean after each use'
    ]
  },
  
  limitationsUse: [
    'Test d\'ajustement professionnel requis',
    'Facteur protection limité (APF=10)',
    'Ne convient pas atmosphères IDLH',
    'Incompatible avec barbe',
    'Cartouches spécifiques par contaminant',
    'Entretien régulier obligatoire'
  ],
  
  compatibility: [
    'safety_glasses_z94_3',
    'cartridges_organic_vapor',
    'cartridges_acid_gas',
    'p100_particulate_filters'
  ],
  
  incompatibility: [
    'chemical_safety_goggles',
    'welding_helmet_auto_darkening'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Masque propre et désinfecté',
    'Joints d\'étanchéité souples',
    'Sangles élastiques fonctionnelles',
    'Cartouches dans date limite',
    'Absence fissures ou déformation',
    'Valves expiratoires libres'
  ],
  
  maintenanceInstructions: [
    'Démontage complet après usage',
    'Nettoyage eau tiède savonneuse',
    'Désinfection solution appropriée',
    'Séchage complet avant remontage',
    'Remplacement joints selon usure',
    'Stockage boîte protectrice'
  ],
  
  storageInstructions: [
    'Boîte rigide individuelle',
    'Environnement propre et sec',
    'Éviter déformation joints',
    'Température ambiante stable',
    'Inventaire cartouches séparé'
  ],
  
  lifespanMonths: 60,
  expirationWarning: 6,
  replacementCriteria: [
    'Joints durcis ou fissurés',
    'Impossible maintenir étanchéité',
    'Déformation permanente',
    'Contamination non nettoyable',
    'Usure mécanique excessive'
  ],
  
  temperatureRange: { min: -30, max: 55, unit: '°C' },
  
  estimatedCost: {
    amount: 85,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M', 'MSA', 'Honeywell', 'Moldex', 'Scott Safety'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Test d\'ajustement professionnel annuel',
    'Sélection cartouches appropriées',
    'Entretien et désinfection',
    'Inspection et remplacement'
  ],
  certificationRequired: true,
  
  tags: ['réutilisable', 'p100', 'cartouches', 'test_professionnel', 'entretien']
});

export const scbaCompressed: SafetyEquipment = createNewEquipment({
  id: 'scba_compressed_air_30min',
  name: 'SCBA air comprimé 30 minutes',
  category: 'ppe_respiratory',
  subcategory: 'self_contained',
  displayName: {
    fr: 'Appareil respiratoire autonome 30 minutes',
    en: '30-minute self-contained breathing apparatus'
  },
  description: 'Protection respiratoire complète en atmosphère IDLH',
  
  specifications: {
    model: 'SCBA air comprimé',
    serviceTime: '30 minutes @ 40 L/min',
    airPressure: '300 bar (4500 psi)',
    weight: '15-18 kg complet',
    airQuality: 'Grade D minimum'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 137'],
    iso: [],
    other: ['NIOSH 42CFR84', 'NFPA 1981']
  },
  
  protectionLevel: 'maximum',
  protectedBodyParts: ['respiratory_system', 'entire_breathing_zone'],
  hazardsProtectedAgainst: [
    'confined_space_entry',
    'infectious_biological_agents',
    'unknown_atmosphere',
    'oxygen_deficiency',
    'idlh_conditions'
  ],
  
  usageInstructions: {
    fr: [
      'Formation SCBA obligatoire avant usage',
      'Inspection complète pré-utilisation',
      'Test alarme basse pression',
      'Mise en place hors zone dangereuse',
      'Surveillance temps air restant constant',
      'Sortie avant alarme basse pression'
    ],
    en: [
      'Mandatory SCBA training before use',
      'Complete pre-use inspection',
      'Low pressure alarm test',
      'Donning outside hazard area',
      'Constant air time monitoring',
      'Exit before low pressure alarm'
    ]
  },
  
  limitationsUse: [
    'Durée service limitée (30 min)',
    'Poids important - fatigue utilisateur',
    'Formation spécialisée obligatoire',
    'Entretien professionnel requis',
    'Coût élevé acquisition/maintenance',
    'Espace confiné peut limiter mobilité'
  ],
  
  compatibility: [
    'safety_helmet_class_e',
    'chemical_suit',
    'confined_space_entry_permit'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Pression bouteille >90% capacité',
    'Alarme basse pression fonctionnelle',
    'Masque complet étanche',
    'Sangles et harnais intacts',
    'Absence dommages visuels',
    'Certificat test hydrostatique valide'
  ],
  
  maintenanceInstructions: [
    'Inspection quotidienne si en service',
    'Test annuel complet professionnel',
    'Rechargement bouteilles après usage',
    'Nettoyage/désinfection masque',
    'Test hydrostatique bouteilles 5 ans',
    'Maintenance selon fabricant'
  ],
  
  storageInstructions: [
    'Local sec, propre, ventilé',
    'Support vertical ou horizontal approprié',
    'Protection contre chocs',
    'Température contrôlée',
    'Accès rapide urgence',
    'Registre maintenance à jour'
  ],
  
  lifespanMonths: 180,
  expirationWarning: 12,
  replacementCriteria: [
    'Échec tests annuels',
    'Fin vie bouteilles (15-30 ans)',
    'Dommages structurels',
    'Pièces obsolètes non disponibles',
    'Modifications réglementaires'
  ],
  
  temperatureRange: { min: -32, max: 60, unit: '°C' },
  
  estimatedCost: {
    amount: 2800,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['MSA', 'Scott Safety', 'Dräger', 'Honeywell', '3M Scott'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Formation SCBA 16+ heures',
    'Espaces clos si applicable',
    'Procédures urgence respiratoire',
    'Entretien et inspection'
  ],
  certificationRequired: true,
  
  isMandatory: false,
  
  tags: ['scba', 'autonome', '30min', 'idlh', 'formation_obligatoire']
});

export const suppliedAirHose: SafetyEquipment = createNewEquipment({
  id: 'supplied_air_respirator_hose',
  name: 'Respirateur à adduction d\'air',
  category: 'ppe_respiratory',
  subcategory: 'supplied_air',
  displayName: {
    fr: 'Appareil respiratoire à adduction d\'air',
    en: 'Supplied-air respirator system'
  },
  description: 'Air propre fourni par compresseur via tuyau d\'alimentation',
  
  specifications: {
    model: 'Adduction air comprimé',
    hoseLength: '25-100 mètres',
    airPressure: '4-8 bar régulé',
    flowRate: '115-425 L/min',
    airQuality: 'Grade D respiratoire'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 14594'],
    iso: [],
    other: ['NIOSH 42CFR84']
  },
  
  protectionLevel: 'maximum',
  protectedBodyParts: ['respiratory_system'],
  hazardsProtectedAgainst: [
    'confined_space_entry',
    'asbestos_fiber_exposure',
    'hazardous_chemical_exposure',
    'painting_spray_operations'
  ],
  
  usageInstructions: {
    fr: [
      'Vérification qualité air compresseur',
      'Test débit et pression avant usage',
      'Mise en place progressive du masque',
      'Surveillance tuyau air pendant travail',
      'Communication constante superviseur',
      'Procédure d\'urgence si perte air'
    ],
    en: [
      'Verify compressor air quality',
      'Test flow and pressure before use',
      'Progressive mask fitting',
      'Monitor air hose during work',
      'Constant supervisor communication',
      'Emergency procedure if air loss'
    ]
  },
  
  limitationsUse: [
    'Mobilité limitée par longueur tuyau',
    'Dépendant source air externe',
    'Risque coupure/pincement tuyau',
    'Maintenance compresseur critique',
    'Surveillance continue obligatoire',
    'SCBA secours requis'
  ],
  
  compatibility: [
    'air_compressor_grade_d',
    'scba_escape_backup',
    'communication_system'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Qualité air compresseur conforme',
    'Pression système dans limites',
    'Tuyau sans dommages',
    'Connexions étanches',
    'Masque/cagoule en bon état',
    'SCBA secours disponible'
  ],
  
  maintenanceInstructions: [
    'Test qualité air quotidien',
    'Inspection tuyau air complète',
    'Maintenance préventive compresseur',
    'Nettoyage/désinfection masque',
    'Test alarmes et indicateurs',
    'Formation utilisateurs régulière'
  ],
  
  lifespanMonths: 120,
  
  temperatureRange: { min: -25, max: 55, unit: '°C' },
  
  estimatedCost: {
    amount: 1200,
    currency: 'CAD',
    unit: 'per_set'
  },
  
  suppliers: ['3M', 'Honeywell', 'MSA', 'Scott Safety', 'Bullard'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Utilisation systèmes adduction air',
    'Procédures urgence perte air',
    'Maintenance et inspection',
    'Espaces clos si applicable'
  ],
  certificationRequired: true,
  
  tags: ['adduction_air', 'tuyau', 'compresseur', 'mobilité_limitée', 'secours']
});

export const escapeRespirator: SafetyEquipment = createNewEquipment({
  id: 'escape_respirator_15min',
  name: 'Respirateur d\'évacuation 15 minutes',
  category: 'ppe_respiratory',
  subcategory: 'escape_only',
  displayName: {
    fr: 'Appareil respiratoire d\'évacuation 15 min',
    en: '15-minute escape respirator'
  },
  description: 'Protection respiratoire pour évacuation d\'urgence seulement',
  
  specifications: {
    model: 'SCSR ou chimique O2',
    serviceTime: '15 minutes minimum',
    activationType: 'Automatique ou manuel',
    weight: '1.5-3.0 kg',
    shelfLife: '10-15 ans'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 13794'],
    iso: [],
    other: ['NIOSH 42CFR84', 'MSHA 30CFR11']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['respiratory_system'],
  hazardsProtectedAgainst: [
    'emergency_evacuation',
    'fire_smoke_escape',
    'toxic_gas_release',
    'chemical_spill_evacuation'
  ],
  
  usageInstructions: {
    fr: [
      'ÉVACUATION SEULEMENT - pas de travail',
      'Activation selon instructions fabricant',
      'Mise en place rapide mais correcte',
      'Évacuation immédiate zone dangereuse',
      'Suivre plan évacuation établi',
      'Ne pas retirer jusqu\'en sécurité'
    ],
    en: [
      'EVACUATION ONLY - no work activities',
      'Activate per manufacturer instructions',
      'Quick but proper donning',
      'Immediate evacuation from hazard area',
      'Follow established evacuation plan',
      'Do not remove until in safety'
    ]
  },
  
  limitationsUse: [
    'ÉVACUATION SEULEMENT',
    'Durée service très limitée',
    'Usage unique - non rechargeable',
    'Formation activation obligatoire',
    'Stockage conditions critiques',
    'Inspection périodique essentielle'
  ],
  
  compatibility: [
    'emergency_evacuation_plan',
    'escape_route_lighting',
    'communication_emergency'
  ],
  
  inspectionFrequency: 'monthly',
  inspectionCriteria: [
    'Emballage scellé intact',
    'Indicateurs pression OK',
    'Date expiration non dépassée',
    'Activation pas amorcée',
    'Stockage conditions appropriées',
    'Accessibilité immédiate'
  ],
  
  maintenanceInstructions: [
    'PAS de maintenance utilisateur',
    'Inspection visuelle seulement',
    'Remplacement selon date limite',
    'Stockage conditions fabricant',
    'Test fonctionnel professionnel',
    'Formation périodique obligatoire'
  ],
  
  storageInstructions: [
    'Emballage original jusqu\'usage',
    'Température contrôlée 15-35°C',
    'Éviter vibrations/chocs',
    'Accès immédiat urgence',
    'Signalisation claire',
    'Inventaire à jour'
  ],
  
  lifespanMonths: 180,
  expirationWarning: 12,
  replacementCriteria: [
    'Date expiration atteinte',
    'Emballage endommagé',
    'Indicateurs hors limites',
    'Activation accidentelle',
    'Exposition conditions extrêmes'
  ],
  
  temperatureRange: { min: -20, max: 60, unit: '°C' },
  humidityRange: { min: 10, max: 95, unit: '%' },
  
  estimatedCost: {
    amount: 450,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['MSA', 'Ocenco', 'Dräger', 'CSE', 'Avon Protection'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Procédures évacuation urgence',
    'Activation équipement escape',
    'Plans évacuation spécifiques site'
  ],
  certificationRequired: false,
  
  isMandatory: false,
  
  tags: ['évacuation', '15min', 'urgence', 'usage_unique', 'scsr']
});

// =================== EXPORT PROTECTION RESPIRATOIRE ===================
export const respiratoryEquipment = [
  n95FilteringFacepiece,
  halfMaskReusable,
  scbaCompressed,
  suppliedAirHose,
  escapeRespirator
];

export const respiratoryById = respiratoryEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default respiratoryEquipment;
