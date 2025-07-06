// app/data/equipment/foot-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION DES PIEDS ===================

export const safetyBootsGrade1: SafetyEquipment = createNewEquipment({
  id: 'safety_boots_csa_grade1',
  name: 'Bottes de sécurité CSA Grade 1',
  category: 'ppe_feet',
  subcategory: 'safety_boots',
  displayName: {
    fr: 'Chaussures de sécurité CSA Grade 1',
    en: 'CSA Grade 1 safety footwear'
  },
  description: 'Protection complète avec embout d\'acier et semelle anti-perforation',
  
  specifications: {
    model: 'CSA Z195-14 Grade 1',
    toeCapImpact: '125 joules',
    punctureResistance: '1200 newtons',
    material: 'Cuir pleine fleur + embout acier',
    sole: 'Semelle PU/caoutchouc antidérapante'
  },
  
  certifications: {
    csa: ['CSA Z195-14 Grade 1'],
    ansi: ['ASTM F2413-18'],
    en: ['EN ISO 20345 SB'],
    iso: ['ISO 20345'],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['feet', 'toes', 'soles'],
  hazardsProtectedAgainst: [
    'falling_objects',
    'puncture_hazards',
    'slips_trips_falls_same_level',
    'crushing_injuries',
    'sharp_objects_ground'
  ],
  
  usageInstructions: {
    fr: [
      'Ajustement confortable sans point de pression',
      'Lacer complètement jusqu\'au sommet',
      'Inspecter semelles et embouts régulièrement',
      'Porter chaussettes appropriées',
      'Remplacer si usure excessive semelles'
    ],
    en: [
      'Comfortable fit without pressure points',
      'Lace completely to top',
      'Inspect soles and toe caps regularly',
      'Wear appropriate socks',
      'Replace if excessive sole wear'
    ]
  },
  
  limitationsUse: [
    'Conducteur électricité si mouillé',
    'Isolation thermique limitée',
    'Poids additionnel vs chaussures normales',
    'Période d\'adaptation requise',
    'Entretien régulier nécessaire'
  ],
  
  compatibility: [
    'safety_helmet_class_e',
    'cut_resistant_gloves_level5',
    'high_visibility_vest'
  ],
  
  inspectionFrequency: 'weekly',
  inspectionCriteria: [
    'Embout d\'acier intact et solidement fixé',
    'Semelle sans usure excessive',
    'Absence de fissures cuir',
    'Lacets en bon état',
    'Coutures solides',
    'Semelle anti-perforation intacte'
  ],
  
  maintenanceInstructions: [
    'Nettoyer avec brosse et eau savonneuse',
    'Sécher à température ambiante',
    'Conditionner cuir mensellement',
    'Remplacer lacets si usés',
    'Inspecter usure semelles'
  ],
  
  storageInstructions: [
    'Lieu sec et aéré',
    'Insérer embauchoirs si stockage prolongé',
    'Éviter chaleur directe',
    'Rotation de paires recommandée'
  ],
  
  lifespanMonths: 18,
  expirationWarning: 2,
  replacementCriteria: [
    'Usure semelle dépassant indicateurs',
    'Fissures importantes cuir',
    'Détachement embout ou semelle',
    'Perte d\'étanchéité',
    'Déformation permanente'
  ],
  
  temperatureRange: { min: -30, max: 50, unit: '°C' },
  weatherLimitations: [
    'Performance antidérapante réduite sur glace',
    'Séchage requis après exposition prolongée eau'
  ],
  
  estimatedCost: {
    amount: 85,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Dakota', 'Terra', 'Timberland PRO', 'Red Wing', 'Kodiak'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Sélection pointure et ajustement',
    'Inspection et entretien',
    'Reconnaissance usure dangereuse'
  ],
  
  isMandatory: true,
  
  tags: ['csa_grade1', 'embout_acier', 'anti_perforation', 'obligatoire', 'general']
});

export const electricalHazardBoots: SafetyEquipment = createNewEquipment({
  id: 'electrical_hazard_boots_eh',
  name: 'Bottes protection électrique EH',
  category: 'ppe_feet',
  subcategory: 'electrical_boots',
  displayName: {
    fr: 'Chaussures protection électrique EH',
    en: 'Electrical hazard (EH) protective footwear'
  },
  description: 'Protection contre chocs électriques jusqu\'à 18 000V en circuit ouvert',
  
  specifications: {
    model: 'CSA Z195 EH + Grade 1',
    electricalResistance: '18 000V @ 60Hz pendant 1 minute',
    leakageCurrent: '<1.0 mA maximum',
    material: 'Cuir + semelle isolante testée'
  },
  
  certifications: {
    csa: ['CSA Z195-14 EH'],
    ansi: ['ASTM F2413 EH'],
    en: [],
    iso: [],
    other: ['ASTM F2412']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['feet', 'body_electrical_path'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'live_electrical_work',
    'falling_objects',
    'puncture_hazards'
  ],
  
  usageInstructions: {
    fr: [
      'Inspecter semelles avant chaque usage',
      'Maintenir semelles propres et sèches',
      'Éviter clous ou agrafes métalliques',
      'Test résistance électrique annuel',
      'Ne pas modifier ou réparer'
    ],
    en: [
      'Inspect soles before each use',
      'Keep soles clean and dry',
      'Avoid metal nails or staples',
      'Annual electrical resistance test',
      'Do not modify or repair'
    ]
  },
  
  limitationsUse: [
    'Protection limitée si semelles mouillées',
    'Test annuel obligatoire',
    'Éviter surfaces conductrices humides',
    'Ne protège pas contre tension soutenue',
    'Réparations interdites'
  ],
  
  compatibility: [
    'electrical_insulating_gloves_class2',
    'safety_helmet_class_e',
    'arc_flash_suit'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Semelles sans corps étrangers conducteurs',
    'Absence de fissures ou trous semelle',
    'Propreté et sécheresse semelles',
    'Certificat test électrique valide',
    'Absence de modifications'
  ],
  
  maintenanceInstructions: [
    'Test électrique annuel obligatoire',
    'Nettoyage semelles avec brosse isolante',
    'Séchage complet après exposition humidité',
    'Pas de produits conducteurs',
    'Stockage environnement sec'
  ],
  
  lifespanMonths: 24,
  expirationWarning: 3,
  replacementCriteria: [
    'Échec test électrique annuel',
    'Dommages semelle isolante',
    'Exposition prolongée humidité',
    'Corps étrangers incrustés',
    'Fin période certification'
  ],
  
  temperatureRange: { min: -25, max: 60, unit: '°C' },
  humidityRange: { min: 0, max: 75, unit: '%' },
  
  estimatedCost: {
    amount: 140,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Salisbury', 'Cementex', 'Red Wing EH', 'Terra EH'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Sécurité électrique CSA Z462',
    'Inspection et test EPI électrique',
    'Limitations protection EH'
  ],
  certificationRequired: true,
  
  isMandatory: true,
  
  tags: ['électrique', 'eh', '18000v', 'test_annuel', 'isolant']
});

export const chemicalResistantBoots: SafetyEquipment = createNewEquipment({
  id: 'chemical_resistant_boots_pvc',
  name: 'Bottes résistantes chimiques PVC',
  category: 'ppe_feet',
  subcategory: 'chemical_boots',
  displayName: {
    fr: 'Bottes de protection chimique PVC',
    en: 'PVC chemical-resistant boots'
  },
  description: 'Protection contre éclaboussures et immersion chimiques',
  
  specifications: {
    model: 'PVC/Nitrile construction',
    height: '400-450mm',
    material: 'PVC + semelle nitrile',
    chemicalResistance: 'Acides, bases, solvants'
  },
  
  certifications: {
    csa: ['CSA Z195'],
    ansi: ['ASTM F2413'],
    en: ['EN 13832', 'EN ISO 20345'],
    iso: ['ISO 20345'],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['feet', 'lower_legs'],
  hazardsProtectedAgainst: [
    'hazardous_chemical_exposure',
    'chemical_splash',
    'corrosive_acids_bases',
    'immersion_contaminated_liquids'
  ],
  
  usageInstructions: {
    fr: [
      'Vérifier compatibilité chimique avant usage',
      'Enfiler par-dessus pantalon de protection',
      'Décontaminer après chaque usage',
      'Inspecter fissures avant utilisation',
      'Sécher complètement après lavage'
    ],
    en: [
      'Check chemical compatibility before use',
      'Wear over protective pants',
      'Decontaminate after each use',
      'Inspect for cracks before use',
      'Dry completely after washing'
    ]
  },
  
  limitationsUse: [
    'Résistance variable selon chimique',
    'Durabilité limitée solvants agressifs',
    'Isolation thermique faible',
    'Éviter surfaces très rugueuses',
    'Temps exposition limité certains produits'
  ],
  
  compatibility: [
    'chemical_resistant_nitrile_gloves',
    'chemical_safety_goggles',
    'chemical_suit'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Absence fissures ou trous',
    'Semelles bien adhérentes',
    'Fermetures étanches fonctionnelles',
    'Absence décoloration suspecte',
    'Flexibilité matériau maintenue'
  ],
  
  maintenanceInstructions: [
    'Décontamination selon produits exposés',
    'Rinçage abondant eau propre',
    'Séchage à l\'air libre',
    'Stockage vertical si possible',
    'Éviter pliage zones flexion'
  ],
  
  lifespanMonths: 18,
  replacementCriteria: [
    'Dégradation chimique visible',
    'Fissures ou perforations',
    'Perte flexibilité',
    'Décollement semelles',
    'Exposition chimiques incompatibles'
  ],
  
  temperatureRange: { min: -20, max: 80, unit: '°C' },
  
  estimatedCost: {
    amount: 65,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Dunlop', 'Bata', 'Tingley', 'Servus', 'Honeywell'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Compatibilité chimiques/matériaux',
    'Procédures décontamination',
    'Enfilage/retrait sécuritaires'
  ],
  
  tags: ['chimiques', 'pvc', 'étanches', 'décontamination', 'immersion']
});

export const steelToeRubberBoots: SafetyEquipment = createNewEquipment({
  id: 'steel_toe_rubber_boots_waterproof',
  name: 'Bottes caoutchouc embout acier étanches',
  category: 'ppe_feet',
  subcategory: 'waterproof_boots',
  displayName: {
    fr: 'Bottes de sécurité caoutchouc étanches',
    en: 'Waterproof steel toe rubber boots'
  },
  description: 'Protection contre eau, boue et impacts avec embout de sécurité',
  
  specifications: {
    model: 'CSA Z195 + étanchéité',
    material: 'Caoutchouc néoprène',
    height: '300-400mm',
    waterproofRating: '100% étanche'
  },
  
  certifications: {
    csa: ['CSA Z195-14'],
    ansi: ['ASTM F2413'],
    en: ['EN ISO 20345'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['feet', 'lower_legs'],
  hazardsProtectedAgainst: [
    'water_immersion',
    'falling_objects',
    'slips_trips_falls_same_level',
    'mud_contamination',
    'cold_exposure'
  ],
  
  usageInstructions: {
    fr: [
      'Porter chaussettes isolantes par temps froid',
      'Rincer après usage en eau contaminée',
      'Sécher intérieur après chaque usage',
      'Éviter surfaces très chaudes',
      'Vérifier étanchéité périodiquement'
    ],
    en: [
      'Wear insulating socks in cold weather',
      'Rinse after contaminated water use',
      'Dry interior after each use',
      'Avoid very hot surfaces',
      'Check waterproofing periodically'
    ]
  },
  
  limitationsUse: [
    'Isolation thermique limitée',
    'Transpiration réduite',
    'Poids supérieur aux bottes cuir',
    'Dégradation UV prolongée',
    'Résistance chimique variable'
  ],
  
  inspectionFrequency: 'weekly',
  inspectionCriteria: [
    'Test étanchéité par immersion',
    'Embout acier bien fixé',
    'Semelles sans usure excessive',
    'Absence fissures caoutchouc',
    'Doublure intérieure intacte'
  ],
  
  maintenanceInstructions: [
    'Rinçage extérieur après chaque usage',
    'Séchage intérieur complet',
    'Application protecteur UV si exposé',
    'Stockage vertical de préférence',
    'Éviter contact hydrocarbures'
  ],
  
  lifespanMonths: 24,
  
  temperatureRange: { min: -40, max: 60, unit: '°C' },
  weatherLimitations: [
    'Performance antidérapante variable sur glace',
    'Durcissement par froid extrême'
  ],
  
  estimatedCost: {
    amount: 95,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Baffin', 'Dunlop', 'Kamik', 'Servus', 'Tingley'],
  availability: 'common',
  
  tags: ['étanches', 'caoutchouc', 'embout_acier', 'boue', 'eau']
});

export const metguardBoots: SafetyEquipment = createNewEquipment({
  id: 'metatarsal_guard_boots_mt',
  name: 'Bottes avec protège-métatarse MT',
  category: 'ppe_feet',
  subcategory: 'metatarsal_boots',
  displayName: {
    fr: 'Chaussures de sécurité avec protège-métatarse',
    en: 'Metatarsal guard safety footwear'
  },
  description: 'Protection renforcée dessus du pied contre objets lourds tombants',
  
  specifications: {
    model: 'CSA Z195 + MT',
    metatarsalProtection: '101 joules impact',
    coverage: 'Dessus pied jusqu\'à cheville',
    material: 'Cuir + protecteur métallique/composite'
  },
  
  certifications: {
    csa: ['CSA Z195-14 MT'],
    ansi: ['ASTM F2413 MT'],
    en: ['EN ISO 20345'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['feet', 'toes', 'metatarsals'],
  hazardsProtectedAgainst: [
    'heavy_falling_objects',
    'crushing_injuries',
    'metal_beam_impacts',
    'pipe_rolling'
  ],
  
  usageInstructions: {
    fr: [
      'Ajustement crucial pour protection optimale',
      'Protecteur doit couvrir métatarses complètement',
      'Vérifier fixation protecteur régulièrement',
      'Port peut nécessiter période adaptation'
    ],
    en: [
      'Proper fit crucial for optimal protection',
      'Guard must cover metatarsals completely',
      'Check guard attachment regularly',
      'May require adaptation period'
    ]
  },
  
  limitationsUse: [
    'Poids additionnel significatif',
    'Ajustement plus critique',
    'Coût supérieur modèles standard',
    'Période adaptation requise',
    'Entretien protecteur additionnel'
  ],
  
  inspectionFrequency: 'weekly',
  inspectionCriteria: [
    'Protège-métatarse solidement fixé',
    'Absence fissures protecteur',
    'Coussinets intérieurs intacts',
    'Embout et semelle standard OK',
    'Ajustement correct maintenu'
  ],
  
  lifespanMonths: 18,
  
  estimatedCost: {
    amount: 125,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Red Wing', 'Timberland PRO', 'Thorogood', 'Carolina'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Ajustement correct protection MT',
    'Limitations et applications',
    'Inspection protecteur métatarse'
  ],
  
  tags: ['métatarse', 'mt', 'objets_lourds', 'protection_renforcée', 'spécialisé']
});

// =================== EXPORT PROTECTION PIEDS ===================
export const footProtectionEquipment = [
  safetyBootsGrade1,
  electricalHazardBoots,
  chemicalResistantBoots,
  steelToeRubberBoots,
  metguardBoots
];

export const footProtectionById = footProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default footProtectionEquipment;
