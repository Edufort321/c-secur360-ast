// app/data/equipment/head-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION DE LA TÊTE ===================

export const safetyHelmetClassE: SafetyEquipment = createNewEquipment({
  id: 'safety_helmet_class_e',
  name: 'Casque de sécurité classe E',
  category: 'ppe_head',
  subcategory: 'electrical_helmet',
  displayName: {
    fr: 'Casque de sécurité électrique classe E',
    en: 'Class E electrical safety helmet'
  },
  description: 'Casque de protection contre impacts et chocs électriques jusqu\'à 20 000V',
  
  specifications: {
    model: 'CSA Z94.1 Type 1 Classe E',
    manufacturer: 'MSA, 3M, Honeywell',
    material: 'Polyéthylène haute densité',
    weight: '400-500g',
    color: 'Blanc, jaune, orange, rouge'
  },
  
  certifications: {
    csa: ['CSA Z94.1 Type 1 Classe E'],
    ansi: ['ANSI Z89.1 Type I Class E'],
    en: ['EN 397 + A1'],
    iso: ['ISO 3873'],
    other: ['OSHA 1926.95']
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['head'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'arc_flash',
    'falling_objects',
    'impact_head',
    'live_electrical_work'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster le harnais à la circonférence de la tête',
      'Maintenir une distance de 2.5cm entre le casque et le crâne',
      'Porter la jugulaire en environnement venteux ou en hauteur',
      'Inspecter visuellement avant chaque utilisation',
      'Nettoyer avec eau tiède et savon doux'
    ],
    en: [
      'Adjust harness to head circumference',
      'Maintain 2.5cm clearance between helmet and skull',
      'Use chin strap in windy conditions or at height',
      'Visual inspection before each use',
      'Clean with warm water and mild soap'
    ]
  },
  
  limitationsUse: [
    'Ne pas modifier, percer ou peindre avec des solvants',
    'Ne pas utiliser comme siège ou support',
    'Remplacer immédiatement si fissures ou impact majeur',
    'Ne pas exposer à des températures >50°C',
    'Ne pas stocker en plein soleil prolongé'
  ],
  
  compatibility: [
    'safety_glasses_z94_3',
    'hearing_protection_coquilles',
    'face_shield_polycarbonate'
  ],
  
  incompatibility: [
    'baseball_cap',
    'tuque_hiver'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Absence de fissures dans la coque',
    'Harnais en bon état sans déchirures',
    'Jugulaire fonctionnelle',
    'Absence d\'impacts ou déformations',
    'Mécanisme d\'ajustement fonctionnel',
    'Accessoires bien fixés'
  ],
  
  maintenanceInstructions: [
    'Nettoyer après chaque utilisation',
    'Sécher complètement avant rangement',
    'Inspecter le harnais mensuellement',
    'Remplacer le harnais si usé'
  ],
  
  storageInstructions: [
    'Stocker dans endroit sec et frais',
    'Éviter exposition UV directe',
    'Suspendre ou poser sur surface plane',
    'Température de stockage: -20°C à +50°C'
  ],
  
  lifespanMonths: 60,
  expirationWarning: 6,
  replacementCriteria: [
    'Fissures visibles dans la coque',
    'Déformation permanente après impact',
    'Usure excessive du harnais',
    'Exposition UV prolongée (>5 ans)',
    'Impact électrique documenté',
    'Décoloration importante'
  ],
  
  temperatureRange: { min: -30, max: 50, unit: '°C' },
  humidityRange: { min: 0, max: 100, unit: '%' },
  weatherLimitations: [
    'Éviter utilisation par vent >80 km/h',
    'Attention aux accumulations de neige'
  ],
  
  estimatedCost: {
    amount: 45,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M Canada', 'MSA Safety', 'Honeywell', 'Bullard', 'Pyramex'],
  availability: 'common',
  
  trainingRequired: true,
  trainingType: [
    'Utilisation et ajustement correct',
    'Inspection et maintenance',
    'Limitations et compatibilité'
  ],
  
  isMandatory: true,
  
  tags: ['casque', 'électricité', 'classe_e', 'impacts', 'obligatoire']
});

export const bumpCap: SafetyEquipment = createNewEquipment({
  id: 'bump_cap_lightweight',
  name: 'Casquette de protection légère',
  category: 'ppe_head',
  subcategory: 'bump_cap',
  displayName: {
    fr: 'Casquette anti-heurt',
    en: 'Lightweight bump cap'
  },
  description: 'Protection légère contre les chocs mineurs et l\'abrasion',
  
  specifications: {
    model: 'ANSI Z89.1 Type II',
    material: 'ABS ou polyéthylène',
    weight: '150-250g',
    color: 'Variés selon disponibilité'
  },
  
  certifications: {
    csa: [],
    ansi: ['ANSI Z89.1 Type II'],
    en: ['EN 812'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'basic',
  protectedBodyParts: ['head'],
  hazardsProtectedAgainst: [
    'minor_head_bumps',
    'abrasion',
    'hair_entanglement'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster selon tour de tête',
      'Porter comme une casquette normale',
      'Vérifier que la protection couvre le sommet'
    ],
    en: [
      'Adjust to head size',
      'Wear like a normal cap',
      'Ensure protection covers crown'
    ]
  },
  
  limitationsUse: [
    'NE PROTÈGE PAS contre objets lourds tombants',
    'NE PROTÈGE PAS contre l\'électricité',
    'Usage en espaces confinés seulement',
    'Ne remplace pas un casque de sécurité complet'
  ],
  
  inspectionFrequency: 'weekly',
  
  lifespanMonths: 36,
  
  estimatedCost: {
    amount: 20,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  availability: 'common',
  
  tags: ['casquette', 'léger', 'espaces_confinés', 'chocs_mineurs']
});

export const weldingHelmet: SafetyEquipment = createNewEquipment({
  id: 'welding_helmet_auto_darkening',
  name: 'Casque de soudage auto-obscurcissant',
  category: 'ppe_head',
  subcategory: 'welding_helmet',
  displayName: {
    fr: 'Casque de soudage à obscurcissement automatique',
    en: 'Auto-darkening welding helmet'
  },
  description: 'Protection complète contre radiations de soudage et projections métalliques',
  
  specifications: {
    model: 'CSA Z94.3 Shade 9-13',
    material: 'Polycarbonate + filtre LCD',
    weight: '400-600g',
    viewingArea: '90mm x 110mm minimum'
  },
  
  certifications: {
    csa: ['CSA Z94.3', 'CSA W117.2'],
    ansi: ['ANSI Z87.1', 'ANSI Z49.1'],
    en: ['EN 379', 'EN 175'],
    iso: ['ISO 4850'],
    other: []
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['head', 'face', 'eyes', 'neck'],
  hazardsProtectedAgainst: [
    'welding_radiation',
    'infrared_radiation',
    'uv_radiation',
    'metal_splatter',
    'grinding_sparks'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster bandeau confortablement',
      'Tester fonctionnement auto-obscurcissement',
      'Régler niveau d\'obscurcissement selon procédé',
      'Vérifier état des batteries',
      'Nettoyer lentille extérieure régulièrement'
    ],
    en: [
      'Adjust headgear comfortably',
      'Test auto-darkening function',
      'Set darkness level per welding process',
      'Check battery status',
      'Clean outer lens regularly'
    ]
  },
  
  limitationsUse: [
    'Remplacer lentille si rayée',
    'Vérifier calibration régulièrement',
    'Ne pas utiliser pour coupage plasma sans protection additionnelle',
    'Batteries limitées par température'
  ],
  
  compatibility: [
    'safety_helmet_class_e',
    'respiratory_powered_air'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Fonctionnement correct auto-obscurcissement',
    'Lentilles sans rayures importantes',
    'Bandeau en bon état',
    'Batteries fonctionnelles',
    'Réglages appropriés au travail'
  ],
  
  lifespanMonths: 84,
  
  temperatureRange: { min: -10, max: 55, unit: '°C' },
  
  estimatedCost: {
    amount: 280,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Miller', 'Lincoln Electric', '3M Speedglas', 'ESAB'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Réglages selon procédés de soudage',
    'Maintenance et calibration',
    'Inspection pré-utilisation'
  ],
  certificationRequired: false,
  
  tags: ['soudage', 'auto_obscurcissement', 'radiations', 'spécialisé']
});

export const hardHatSummer: SafetyEquipment = createNewEquipment({
  id: 'hard_hat_ventilated_summer',
  name: 'Casque ventilé été',
  category: 'ppe_head',
  subcategory: 'ventilated_helmet',
  displayName: {
    fr: 'Casque de sécurité ventilé pour climat chaud',
    en: 'Ventilated hard hat for hot climate'
  },
  description: 'Casque avec ventilation intégrée pour conditions chaudes',
  
  specifications: {
    model: 'CSA Z94.1 Type 1',
    material: 'Polyéthylène avec évents',
    weight: '350-450g',
    ventilation: '6-8 évents de ventilation'
  },
  
  certifications: {
    csa: ['CSA Z94.1 Type 1'],
    ansi: ['ANSI Z89.1 Type I'],
    en: ['EN 397'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['head'],
  hazardsProtectedAgainst: [
    'falling_objects',
    'impact_head',
    'heat_stress_exposure'
  ],
  
  usageInstructions: {
    fr: [
      'Utiliser par températures >25°C',
      'Vérifier que les évents ne sont pas obstrués',
      'Combiner avec pauses fréquentes à l\'ombre'
    ],
    en: [
      'Use in temperatures >25°C',
      'Ensure vents are not blocked',
      'Combine with frequent shade breaks'
    ]
  },
  
  limitationsUse: [
    'Protection électrique réduite (évents)',
    'Ne pas utiliser en présence de produits chimiques liquides',
    'Nettoyer évents régulièrement'
  ],
  
  inspectionFrequency: 'before_each_use',
  
  weatherLimitations: [
    'Éviter par temps très pluvieux',
    'Nettoyer évents après exposition poussière'
  ],
  
  lifespanMonths: 48,
  
  estimatedCost: {
    amount: 40,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  tags: ['ventilé', 'chaleur', 'été', 'évents']
});

// =================== EXPORT PROTECTION TÊTE ===================
export const headProtectionEquipment = [
  safetyHelmetClassE,
  bumpCap,
  weldingHelmet,
  hardHatSummer
];

export const headProtectionById = headProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default headProtectionEquipment;
