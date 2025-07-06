// app/data/equipment/hand-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION DES MAINS ===================

export const cutResistantLevel5: SafetyEquipment = createNewEquipment({
  id: 'cut_resistant_gloves_level5',
  name: 'Gants anti-coupures niveau 5',
  category: 'ppe_hands',
  subcategory: 'cut_resistant',
  displayName: {
    fr: 'Gants résistants aux coupures niveau 5',
    en: 'Level 5 cut-resistant gloves'
  },
  description: 'Protection maximale contre coupures et lacérations par objets tranchants',
  
  specifications: {
    model: 'ANSI/ISEA 105 Level 5',
    material: 'Fibres UHMWPE + enrobage nitrile',
    thickness: '1.0-1.5mm',
    cutResistance: '4000+ grammes force'
  },
  
  certifications: {
    csa: ['CSA Z96'],
    ansi: ['ANSI/ISEA 105 Level 5'],
    en: ['EN 388 Level F (5)'],
    iso: ['ISO 13997'],
    other: []
  },
  
  protectionLevel: 'maximum',
  protectedBodyParts: ['hands', 'fingers', 'wrists'],
  hazardsProtectedAgainst: [
    'sharp_objects',
    'cutting_tools',
    'metal_edges',
    'glass_handling',
    'blade_work'
  ],
  
  usageInstructions: {
    fr: [
      'Choisir taille permettant dextérité',
      'Inspecter avant chaque utilisation',
      'Remplacer immédiatement si coupés',
      'Laver selon instructions fabricant',
      'Ne pas utiliser près flammes'
    ],
    en: [
      'Select size allowing dexterity',
      'Inspect before each use',
      'Replace immediately if cut',
      'Wash per manufacturer instructions',
      'Do not use near flames'
    ]
  },
  
  limitationsUse: [
    'Protection perforation limitée',
    'Résistance chimique variable',
    'Peut réduire dextérité fine',
    'Non résistant à la chaleur',
    'Incompatible avec certains solvants'
  ],
  
  compatibility: [
    'safety_glasses_z94_3',
    'cut_resistant_sleeves'
  ],
  
  incompatibility: [
    'electrical_insulating_gloves',
    'chemical_resistant_gloves'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Absence de coupures ou trous',
    'Enrobage adhérent et intact',
    'Coutures solides',
    'Absence d\'usure excessive',
    'Taille et ajustement corrects'
  ],
  
  maintenanceInstructions: [
    'Laver à l\'eau tiède avec savon doux',
    'Sécher à l\'air libre',
    'Éviter eau de javel et solvants',
    'Stocker à plat ou suspendus',
    'Rotation des paires recommandée'
  ],
  
  storageInstructions: [
    'Lieu sec et aéré',
    'Éviter exposition UV directe',
    'Séparer des objets tranchants',
    'Température ambiante'
  ],
  
  lifespanMonths: 6,
  expirationWarning: 1,
  replacementCriteria: [
    'Coupures visibles',
    'Usure importante enrobage',
    'Perte d\'élasticité',
    'Coutures défaillantes',
    'Contamination persistante'
  ],
  
  temperatureRange: { min: -20, max: 80, unit: '°C' },
  
  estimatedCost: {
    amount: 22,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['HexArmor', 'Ansell', 'Superior Glove', 'MCR Safety', 'Wells Lamont'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Sélection niveau protection approprié',
    'Inspection et remplacement',
    'Limitations d\'usage'
  ],
  
  tags: ['coupures', 'niveau5', 'uhmwpe', 'tranchant', 'maximum']
});

export const electricalInsulatingGloves: SafetyEquipment = createNewEquipment({
  id: 'electrical_insulating_gloves_class2',
  name: 'Gants isolants électriques classe 2',
  category: 'ppe_hands',
  subcategory: 'electrical_insulating',
  displayName: {
    fr: 'Gants isolants électriques classe 2 (17 000V)',
    en: 'Class 2 electrical insulating gloves (17,000V)'
  },
  description: 'Protection contre chocs électriques jusqu\'à 17 000V AC',
  
  specifications: {
    model: 'CSA Z462 Classe 2',
    material: 'Caoutchouc naturel diélectrique',
    voltage: '17 000V AC / 25 500V DC',
    thickness: '1.14mm minimum'
  },
  
  certifications: {
    csa: ['CSA Z462', 'CSA Z96'],
    ansi: ['ANSI/ASTM D120 Class 2'],
    en: ['IEC 60903 Class 2'],
    iso: [],
    other: ['IEEE 1048']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['hands', 'wrists', 'forearms'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'arc_flash',
    'live_electrical_work',
    'high_voltage_exposure'
  ],
  
  usageInstructions: {
    fr: [
      'Test étanchéité à l\'air obligatoire avant usage',
      'Porter avec surgants cuir par-dessus',
      'Inspecter visuellement défauts',
      'Tester électriquement selon CSA Z462',
      'Ne jamais utiliser si endommagés'
    ],
    en: [
      'Mandatory air leak test before use',
      'Wear with leather protector gloves over',
      'Visual inspection for defects',
      'Electrical testing per CSA Z462',
      'Never use if damaged'
    ]
  },
  
  limitationsUse: [
    'Utilisation avec surgants obligatoire',
    'Test électrique périodique requis',
    'Sensible aux coupures et perforations',
    'Durée d\'utilisation limitée par fatigue',
    'Nettoyage spécialisé requis'
  ],
  
  compatibility: [
    'leather_protector_gloves',
    'safety_helmet_class_e',
    'electrical_insulating_sleeves'
  ],
  
  incompatibility: [
    'cut_resistant_gloves_level5',
    'chemical_resistant_gloves'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Test gonflage étanchéité réussi',
    'Absence de coupures ou trous',
    'Pas de zones amincies',
    'Absence de contamination',
    'Certificat test électrique valide',
    'Date expiration non dépassée'
  ],
  
  maintenanceInstructions: [
    'Test électrique tous les 6 mois',
    'Nettoyage avec savon spécialisé seulement',
    'Séchage complet avant stockage',
    'Pas de contact avec huiles/solvants',
    'Stockage dans contenants approuvés'
  ],
  
  storageInstructions: [
    'Boîtes métalliques ou sacs spéciaux',
    'Éviter pliage ou compression',
    'Température contrôlée 16-32°C',
    'Humidité relative 50-80%',
    'Loin sources ozone et UV'
  ],
  
  lifespanMonths: 36,
  expirationWarning: 3,
  replacementCriteria: [
    'Échec test électrique',
    'Dommages physiques visibles',
    'Contamination non nettoyable',
    'Dépassement date limite',
    'Exposition à solvants'
  ],
  
  temperatureRange: { min: -25, max: 65, unit: '°C' },
  
  estimatedCost: {
    amount: 120,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Salisbury', 'Cementex', 'Regeltex', 'Honeywell'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'CSA Z462 sécurité électrique',
    'Test et inspection gants isolants',
    'Procédures urgence électrique'
  ],
  certificationRequired: true,
  
  isMandatory: true,
  
  tags: ['électrique', 'isolants', 'classe2', '17000v', 'test_obligatoire']
});

export const chemicalResistantNitrile: SafetyEquipment = createNewEquipment({
  id: 'chemical_resistant_nitrile_gloves',
  name: 'Gants nitrile résistants chimiques',
  category: 'ppe_hands',
  subcategory: 'chemical_resistant',
  displayName: {
    fr: 'Gants de protection chimique en nitrile',
    en: 'Chemical-resistant nitrile gloves'
  },
  description: 'Protection contre large gamme de produits chimiques',
  
  specifications: {
    model: 'Nitrile non supporté',
    material: 'Caoutchouc nitrile 100%',
    thickness: '0.12-0.38mm selon modèle',
    length: '300-330mm'
  },
  
  certifications: {
    csa: ['CSA Z96'],
    ansi: ['ANSI/ISEA 105'],
    en: ['EN 374-1', 'EN 374-2', 'EN 374-3'],
    iso: ['ISO 374-1'],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['hands', 'wrists', 'forearms'],
  hazardsProtectedAgainst: [
    'hazardous_chemical_exposure',
    'organic_solvents_vapors',
    'oils_greases',
    'petroleum_products'
  ],
  
  usageInstructions: {
    fr: [
      'Vérifier compatibilité chimique avant usage',
      'Enfiler sans contamination extérieure',
      'Remplacer si percée ou dégradation',
      'Retirer soigneusement pour éviter contact',
      'Décontaminer avant réutilisation'
    ],
    en: [
      'Check chemical compatibility before use',
      'Don without exterior contamination',
      'Replace if breakthrough or degradation',
      'Remove carefully to avoid contact',
      'Decontaminate before reuse'
    ]
  },
  
  limitationsUse: [
    'Temps de percée limité selon chimique',
    'Dégradation par certains solvants',
    'Résistance coupure limitée',
    'Peut causer allergies latex croisées',
    'Performance réduite par étirement'
  ],
  
  compatibility: [
    'chemical_safety_goggles',
    'chemical_suit',
    'face_shield_polycarbonate'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Absence de trous ou fissures',
    'Pas de décoloration suspecte',
    'Élasticité maintenue',
    'Propreté intérieure et extérieure',
    'Absence de contamination résiduelle'
  ],
  
  maintenanceInstructions: [
    'Décontamination selon produit exposé',
    'Rinçage abondant eau propre',
    'Séchage complet si réutilisables',
    'Test intégrité si réutilisation',
    'Élimination sécuritaire si jetables'
  ],
  
  lifespanMonths: 12,
  replacementCriteria: [
    'Temps de percée chimique atteint',
    'Dommages physiques visibles',
    'Changement couleur/texture',
    'Perte d\'élasticité',
    'Contamination persistante'
  ],
  
  temperatureRange: { min: -40, max: 107, unit: '°C' },
  
  estimatedCost: {
    amount: 8,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Ansell', 'Showa', 'Mapa', 'Kimberly-Clark', 'Microflex'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Sélection gants par compatibilité chimique',
    'Procédures enfilage/retrait sécuritaires',
    'Décontamination appropriée'
  ],
  
  tags: ['chimiques', 'nitrile', 'solvants', 'résistant', 'polyvalent']
});

export const leatherWorkGloves: SafetyEquipment = createNewEquipment({
  id: 'leather_work_gloves_general',
  name: 'Gants de travail en cuir',
  category: 'ppe_hands',
  subcategory: 'general_work',
  displayName: {
    fr: 'Gants de travail en cuir général',
    en: 'General purpose leather work gloves'
  },
  description: 'Protection générale contre abrasion, échardes et manipulation rugueuse',
  
  specifications: {
    model: 'Cuir de vache ou porc',
    material: 'Cuir pleine fleur',
    thickness: '1.0-1.2mm',
    lining: 'Doublure coton ou sans'
  },
  
  certifications: {
    csa: ['CSA Z96'],
    ansi: ['ANSI/ISEA 105'],
    en: ['EN 388'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'basic',
  protectedBodyParts: ['hands', 'wrists'],
  hazardsProtectedAgainst: [
    'abrasion',
    'splinters',
    'rough_handling',
    'minor_cuts',
    'heat_contact_brief'
  ],
  
  usageInstructions: {
    fr: [
      'Choisir taille permettant mouvement libre',
      'Sécher si mouillés avant stockage',
      'Conditionner cuir périodiquement',
      'Éviter contact avec huiles'
    ],
    en: [
      'Select size allowing free movement',
      'Dry if wet before storage',
      'Condition leather periodically',
      'Avoid contact with oils'
    ]
  },
  
  limitationsUse: [
    'Protection chimique limitée',
    'Conducteur électricité si mouillé',
    'Absorption liquides',
    'Séchage lent si trempé',
    'Rigidification par froid'
  ],
  
  inspectionFrequency: 'weekly',
  inspectionCriteria: [
    'Cuir souple et intact',
    'Coutures solides',
    'Absence de fissures',
    'Propreté générale',
    'Absence de contamination'
  ],
  
  maintenanceInstructions: [
    'Nettoyer avec brosse et eau savonneuse',
    'Sécher lentement à température ambiante',
    'Appliquer conditionneur cuir si sec',
    'Éviter séchage direct chaleur'
  ],
  
  lifespanMonths: 12,
  
  temperatureRange: { min: -20, max: 60, unit: '°C' },
  
  estimatedCost: {
    amount: 12,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Wells Lamont', 'Kinco', 'Tillman', 'Boss', 'Outdoor Element'],
  availability: 'common',
  
  tags: ['cuir', 'général', 'abrasion', 'manipulation', 'basique']
});

export const antiVibrationGloves: SafetyEquipment = createNewEquipment({
  id: 'anti_vibration_gloves_iso',
  name: 'Gants anti-vibration ISO 10819',
  category: 'ppe_hands',
  subcategory: 'anti_vibration',
  displayName: {
    fr: 'Gants de protection anti-vibration',
    en: 'Anti-vibration protection gloves'
  },
  description: 'Réduction transmission vibrations outils motorisés aux mains',
  
  specifications: {
    model: 'ISO 10819 certifié',
    material: 'Polymères absorbants + gel',
    vibrationReduction: '10-40% selon fréquence',
    thickness: '5-8mm zones critiques'
  },
  
  certifications: {
    csa: ['CSA Z96'],
    ansi: ['ANSI/ISEA 105'],
    en: ['EN 388', 'EN ISO 10819'],
    iso: ['ISO 10819'],
    other: []
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['hands', 'wrists'],
  hazardsProtectedAgainst: [
    'hand_arm_vibration_syndrome',
    'repetitive_strain_injury',
    'tool_vibration'
  ],
  
  usageInstructions: {
    fr: [
      'Utiliser avec outils vibrants >2.5 m/s²',
      'Ajustement serré mais confortable',
      'Rotation fréquente recommandée',
      'Combiner avec pauses régulières',
      'Maintenir mains au chaud'
    ],
    en: [
      'Use with vibrating tools >2.5 m/s²',
      'Snug but comfortable fit',
      'Frequent rotation recommended',
      'Combine with regular breaks',
      'Keep hands warm'
    ]
  },
  
  limitationsUse: [
    'Efficacité variable selon fréquence',
    'Réduction dextérité par épaisseur',
    'Ne remplace pas limitation exposition',
    'Efficacité réduite si mal ajustés',
    'Durabilité limitée usage intensif'
  ],
  
  inspectionFrequency: 'weekly',
  inspectionCriteria: [
    'Matériau absorbant intact',
    'Absence de zones comprimées',
    'Coutures et fixations solides',
    'Flexibilité maintenue',
    'Propreté et absence usure'
  ],
  
  lifespanMonths: 9,
  
  temperatureRange: { min: -10, max: 40, unit: '°C' },
  weatherLimitations: [
    'Efficacité réduite par froid extrême',
    'Séchage requis si mouillés'
  ],
  
  estimatedCost: {
    amount: 35,
    currency: 'CAD',
    unit: 'per_pair'
  },
  
  suppliers: ['Ergodyne', 'Impacto', 'Superior Glove', 'MCR Safety'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Syndrome vibration main-bras',
    'Limitation temps exposition',
    'Techniques réduction vibration'
  ],
  
  tags: ['vibration', 'svmb', 'iso10819', 'outils_motorisés', 'réduction']
});

// =================== EXPORT PROTECTION MAINS ===================
export const handProtectionEquipment = [
  cutResistantLevel5,
  electricalInsulatingGloves,
  chemicalResistantNitrile,
  leatherWorkGloves,
  antiVibrationGloves
];

export const handProtectionById = handProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default handProtectionEquipment;
