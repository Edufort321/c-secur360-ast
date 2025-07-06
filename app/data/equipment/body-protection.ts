// app/data/equipment/body-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION DU CORPS ===================

export const highVisibilityVest: SafetyEquipment = createNewEquipment({
  id: 'high_visibility_vest_class2',
  name: 'Veste haute visibilité classe 2',
  category: 'ppe_body',
  subcategory: 'high_visibility',
  displayName: {
    fr: 'Vêtement haute visibilité classe 2',
    en: 'Class 2 high-visibility safety vest'
  },
  description: 'Protection haute visibilité pour travaux routiers et industriels',
  
  specifications: {
    model: 'CSA Z96 Classe 2',
    backgroundMaterial: 'Polyester fluorescent',
    retroreflectiveTape: '50mm largeur',
    colors: 'Orange, jaune-vert fluorescent'
  },
  
  certifications: {
    csa: ['CSA Z96-15 Classe 2'],
    ansi: ['ANSI/ISEA 107 Type R Class 2'],
    en: ['EN ISO 20471 Classe 2'],
    iso: ['ISO 20471'],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['torso', 'visibility_enhancement'],
  hazardsProtectedAgainst: [
    'vehicle_traffic_hazards',
    'low_visibility_conditions'
  ],
  
  usageInstructions: {
    fr: [
      'Porter par-dessus vêtements de travail',
      'Fermer complètement devant',
      'Vérifier visibilité bandes rétroréfléchissantes'
    ],
    en: [
      'Wear over work clothing',
      'Close completely in front',
      'Check retroreflective tape visibility'
    ]
  },
  
  limitationsUse: [
    'Efficacité réduite si sale ou mouillé',
    'Décoloration UV progressive',
    'Lavage selon instructions seulement'
  ],
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 24,
  
  estimatedCost: {
    amount: 18,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['ML Kishigo', 'Occunomix', 'Pyramex'],
  availability: 'common',
  isMandatory: true,
  
  tags: ['haute_visibilité', 'classe2', 'fluorescent', 'obligatoire']
});

export const chemicalSuit: SafetyEquipment = createNewEquipment({
  id: 'chemical_protective_suit_type3',
  name: 'Combinaison protection chimique Type 3',
  category: 'ppe_body',
  subcategory: 'chemical_suit',
  displayName: {
    fr: 'Combinaison de protection chimique Type 3',
    en: 'Type 3 chemical protective suit'
  },
  description: 'Protection contre jets de liquides chimiques sous pression',
  
  specifications: {
    model: 'EN 14605 Type 3',
    material: 'Polyéthylène/Tyvek laminé',
    seams: 'Cousues et étanchéifiées',
    coverage: 'Corps complet avec capuche'
  },
  
  certifications: {
    csa: [],
    ansi: [],
    en: ['EN 14605 Type 3', 'EN 13982-1'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['whole_body', 'head'],
  hazardsProtectedAgainst: [
    'hazardous_chemical_exposure',
    'chemical_splash',
    'liquid_chemical_jets'
  ],
  
  usageInstructions: {
    fr: [
      'Enfilage selon procédure établie',
      'Vérification étanchéité toutes coutures',
      'Usage unique - jetable après exposition',
      'Décontamination avant retrait'
    ],
    en: [
      'Donning per established procedure',
      'Check all seam integrity',
      'Single use - disposable after exposure',
      'Decontamination before removal'
    ]
  },
  
  limitationsUse: [
    'Usage unique seulement',
    'Protection limitée selon chimique',
    'Ventilation réduite - surveillance chaleur',
    'Déchirure facile objets tranchants'
  ],
  
  compatibility: [
    'chemical_resistant_nitrile_gloves',
    'chemical_resistant_boots_pvc',
    'supplied_air_respirator_hose'
  ],
  
  inspectionFrequency: 'before_each_use',
  
  estimatedCost: {
    amount: 35,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['DuPont', '3M', 'Lakeland', 'Honeywell'],
  availability: 'specialized',
  trainingRequired: true,
  
  tags: ['chimiques', 'type3', 'jetable', 'jets_liquides']
});

export const weldingJacket: SafetyEquipment = createNewEquipment({
  id: 'welding_jacket_leather',
  name: 'Veste de soudage cuir',
  category: 'ppe_body',
  subcategory: 'welding_clothing',
  displayName: {
    fr: 'Veste de protection soudage en cuir',
    en: 'Leather welding protection jacket'
  },
  description: 'Protection contre projections métalliques et radiations soudage',
  
  specifications: {
    material: 'Cuir de vache pleine fleur',
    thickness: '1.2-1.4mm',
    closure: 'Boutons pression métalliques',
    sleeves: 'Manches longues protection complète'
  },
  
  certifications: {
    csa: ['CSA Z49.1'],
    ansi: ['ANSI Z49.1'],
    en: ['EN ISO 11611 Classe A1'],
    iso: ['ISO 11611'],
    other: []
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['torso', 'arms'],
  hazardsProtectedAgainst: [
    'welding_radiation',
    'metal_splatter',
    'grinding_sparks'
  ],
  
  usageInstructions: {
    fr: [
      'Porter par-dessus vêtements coton',
      'Fermer complètement pendant soudage',
      'Éviter contact huiles/solvants',
      'Sécher si mouillé avant usage'
    ],
    en: [
      'Wear over cotton clothing',
      'Close completely during welding',
      'Avoid contact with oils/solvents',
      'Dry if wet before use'
    ]
  },
  
  limitationsUse: [
    'Absorption liquides si non traité',
    'Rigidification par froid',
    'Nettoyage spécialisé requis',
    'Conducteur électricité si mouillé'
  ],
  
  inspectionFrequency: 'weekly',
  lifespanMonths: 36,
  
  estimatedCost: {
    amount: 85,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Lincoln Electric', 'Miller', 'Tillman', 'Revco'],
  availability: 'specialized',
  trainingRequired: true,
  
  tags: ['soudage', 'cuir', 'projections', 'radiations']
});

export const disposableCoveralls: SafetyEquipment = createNewEquipment({
  id: 'disposable_coveralls_tyvek',
  name: 'Combinaison jetable Tyvek',
  category: 'ppe_body',
  subcategory: 'disposable_clothing',
  displayName: {
    fr: 'Combinaison de travail jetable Tyvek',
    en: 'Disposable Tyvek work coveralls'
  },
  description: 'Protection jetable contre poussières et particules',
  
  specifications: {
    material: 'Tyvek polyéthylène filé-lié',
    closure: 'Fermeture éclair devant',
    elasticCuffs: 'Poignets, chevilles, capuche',
    sizes: 'M à 3XL disponibles'
  },
  
  certifications: {
    csa: [],
    ansi: [],
    en: ['EN 13982-1 Type 5'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'basic',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'dust_particles',
    'dry_particulates',
    'minor_contamination'
  ],
  
  usageInstructions: {
    fr: [
      'Usage unique seulement',
      'Enfiler dans zone propre',
      'Éviter déchirure par objets tranchants',
      'Éliminer selon déchets industriels'
    ],
    en: [
      'Single use only',
      'Don in clean area',
      'Avoid tearing on sharp objects',
      'Dispose as industrial waste'
    ]
  },
  
  limitationsUse: [
    'Protection chimique très limitée',
    'Déchirure facile',
    'Ventilation réduite',
    'Usage unique seulement'
  ],
  
  inspectionFrequency: 'before_each_use',
  
  estimatedCost: {
    amount: 8,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['DuPont', 'Kimberly-Clark', 'Lakeland'],
  availability: 'common',
  
  tags: ['jetable', 'tyvek', 'poussières', 'usage_unique']
});

export const insulatedWorkwear: SafetyEquipment = createNewEquipment({
  id: 'insulated_workwear_winter',
  name: 'Vêtements de travail isolés hiver',
  category: 'ppe_body',
  subcategory: 'thermal_protection',
  displayName: {
    fr: 'Vêtements de travail isolés pour climat froid',
    en: 'Insulated winter workwear'
  },
  description: 'Protection thermique pour travail extérieur par temps froid',
  
  specifications: {
    insulation: 'Thinsulate ou duvet synthétique',
    outerShell: 'Nylon ripstop déperlant',
    tempRating: '-25°C confort',
    features: 'Poches multiples, capuche amovible'
  },
  
  certifications: {
    csa: ['CSA Z96 si haute visibilité'],
    ansi: [],
    en: ['EN 342 si applicable'],
    iso: ['ISO 11079'],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['torso', 'arms', 'legs'],
  hazardsProtectedAgainst: [
    'cold_exposure_hypothermia',
    'wind_chill',
    'precipitation'
  ],
  
  usageInstructions: {
    fr: [
      'Système multicouches recommandé',
      'Éviter coton contre peau',
      'Ventiler si sudation excessive',
      'Sécher complètement si mouillé'
    ],
    en: [
      'Multi-layer system recommended',
      'Avoid cotton against skin',
      'Ventilate if excessive sweating',
      'Dry completely if wet'
    ]
  },
  
  limitationsUse: [
    'Efficacité réduite si mouillé',
    'Mobilité réduite si trop volumineux',
    'Surchauffe si activité intense',
    'Entretien selon instructions'
  ],
  
  inspectionFrequency: 'weekly',
  lifespanMonths: 60,
  
  weatherLimitations: [
    'Efficacité optimale <-10°C',
    'Éviter immersion eau'
  ],
  
  estimatedCost: {
    amount: 150,
    currency: 'CAD',
    unit: 'per_set'
  },
  
  suppliers: ['Carhartt', 'Helly Hansen', 'RefrigiWear', 'Tough Duck'],
  availability: 'common',
  
  tags: ['isolé', 'hiver', 'froid', 'multicouches', 'déperlant']
});

// =================== EXPORT PROTECTION CORPS ===================
export const bodyProtectionEquipment = [
  highVisibilityVest,
  chemicalSuit,
  weldingJacket,
  disposableCoveralls,
  insulatedWorkwear
];

export const bodyProtectionById = bodyProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default bodyProtectionEquipment;
