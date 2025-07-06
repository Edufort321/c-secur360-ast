// app/data/equipment/fall-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION CONTRE LES CHUTES ===================

export const fullBodyHarness: SafetyEquipment = createNewEquipment({
  id: 'full_body_harness_class_a',
  name: 'Harnais complet classe A',
  category: 'ppe_fall_protection',
  subcategory: 'harness',
  displayName: {
    fr: 'Harnais de sécurité complet classe A',
    en: 'Class A full body safety harness'
  },
  description: 'Harnais complet pour arrêt de chute et positionnement de travail',
  
  specifications: {
    model: 'CSA Z259.10 Classe A',
    breakingStrength: '22 kN (2200 kg)',
    weight: '1.5-2.5 kg',
    material: 'Sangles polyester/nylon',
    adjustmentRange: 'M-XL (66-140 cm tour de taille)'
  },
  
  certifications: {
    csa: ['CSA Z259.10 Classe A'],
    ansi: ['ANSI Z359.11 Type 1'],
    en: ['EN 361', 'EN 358'],
    iso: [],
    other: ['OSHA 1926.502']
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['torso', 'shoulders', 'legs', 'pelvis'],
  hazardsProtectedAgainst: [
    'working_at_height',
    'fall_arrest',
    'work_positioning',
    'confined_space_entry'
  ],
  
  usageInstructions: {
    fr: [
      'Ajustement correct toutes sangles obligatoire',
      'Point d\'attache dorsal pour arrêt chute',
      'Points latéraux pour positionnement seulement',
      'Inspection complète avant chaque usage',
      'Porter par-dessus vêtements normaux'
    ],
    en: [
      'Proper adjustment of all straps mandatory',
      'Dorsal attachment point for fall arrest',
      'Side points for positioning only',
      'Complete inspection before each use',
      'Wear over normal clothing'
    ]
  },
  
  limitationsUse: [
    'Point attache dorsal: arrêt chute seulement',
    'Points latéraux: positionnement max 2kN',
    'Ne pas modifier ou réparer',
    'Retirer service après chute arrêtée'
  ],
  
  compatibility: [
    'shock_absorbing_lanyard',
    'self_retracting_lifeline',
    'positioning_lanyard'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Sangles sans coupures, brûlures, usure',
    'Coutures intactes et solides',
    'Boucles et anneaux sans déformation',
    'Points d\'attache non endommagés'
  ],
  
  lifespanMonths: 60,
  
  estimatedCost: {
    amount: 120,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M DBI-SALA', 'MSA', 'Honeywell Miller', 'Capital Safety'],
  availability: 'common',
  trainingRequired: true,
  isMandatory: true,
  
  tags: ['harnais', 'classe_a', 'arrêt_chute', 'positionnement', 'obligatoire']
});

export const shockAbsorbingLanyard: SafetyEquipment = createNewEquipment({
  id: 'shock_absorbing_lanyard_1_8m',
  name: 'Longe avec absorbeur d\'énergie 1.8m',
  category: 'ppe_fall_protection',
  subcategory: 'lanyard',
  displayName: {
    fr: 'Longe avec absorbeur d\'énergie 1.8m',
    en: '1.8m shock absorbing lanyard'
  },
  description: 'Longe pour arrêt de chute avec réduction forces d\'impact',
  
  specifications: {
    model: 'CSA Z259.11',
    length: '1.8m (6 pieds)',
    maxArrestForce: '<8kN avec absorbeur',
    webbing: 'Polyester 45mm'
  },
  
  certifications: {
    csa: ['CSA Z259.11'],
    ansi: ['ANSI Z359.13'],
    en: ['EN 355'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'working_at_height',
    'fall_arrest_forces'
  ],
  
  usageInstructions: {
    fr: [
      'Connecter au point attache dorsal harnais',
      'Point ancrage résistance min 22kN',
      'Maintenir longe tendue - éviter mou',
      'Un seul utilisateur par longe'
    ],
    en: [
      'Connect to dorsal attachment point harness',
      'Anchor point minimum 22kN strength',
      'Keep lanyard taut - avoid slack',
      'One user per lanyard only'
    ]
  },
  
  limitationsUse: [
    'Usage unique après activation absorbeur',
    'Distance chute libre limitée',
    'Calcul tirant d\'air obligatoire'
  ],
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 60,
  
  estimatedCost: {
    amount: 85,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M DBI-SALA', 'MSA', 'Honeywell Miller'],
  availability: 'common',
  trainingRequired: true,
  
  tags: ['longe', 'absorbeur', '1.8m', 'arrêt_chute']
});

export const selfRetractingLifeline: SafetyEquipment = createNewEquipment({
  id: 'self_retracting_lifeline_20m',
  name: 'Antichute à rappel automatique 20m',
  category: 'ppe_fall_protection',
  subcategory: 'srl',
  displayName: {
    fr: 'Système antichute à rappel automatique 20m',
    en: '20m self-retracting lifeline system'
  },
  description: 'Système antichute avec câble rétractable automatiquement',
  
  specifications: {
    model: 'CSA Z259.2.2',
    maxLength: '20 mètres',
    cableType: 'Galvanisé 3.2mm',
    arrestDistance: '<1.2m après activation'
  },
  
  certifications: {
    csa: ['CSA Z259.2.2'],
    ansi: ['ANSI Z359.14'],
    en: ['EN 360'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'working_at_height',
    'fall_arrest_immediate'
  ],
  
  usageInstructions: {
    fr: [
      'Installation sur point ancrage certifié',
      'Connexion harnais par connecteur fourni',
      'Maintenir ligne sous utilisateur',
      'Respecter angle max 15° de vertical'
    ],
    en: [
      'Install on certified anchor point',
      'Connect to harness via provided connector',
      'Keep lifeline below user',
      'Respect maximum 15° from vertical'
    ]
  },
  
  limitationsUse: [
    'Angle max 15° de la verticale',
    'Une personne seulement par système',
    'Maintenance professionnelle requise'
  ],
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 120,
  
  estimatedCost: {
    amount: 450,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M DBI-SALA', 'MSA', 'Honeywell Miller'],
  availability: 'specialized',
  trainingRequired: true,
  
  tags: ['srl', 'rappel_automatique', '20m', 'verticale']
});

export const anchorPointPortable: SafetyEquipment = createNewEquipment({
  id: 'portable_anchor_point_22kn',
  name: 'Point d\'ancrage portable 22kN',
  category: 'ppe_fall_protection',
  subcategory: 'anchor_point',
  displayName: {
    fr: 'Point d\'ancrage portable temporaire',
    en: 'Portable temporary anchor point'
  },
  description: 'Système d\'ancrage temporaire pour surfaces variées',
  
  specifications: {
    model: 'CSA Z259.15',
    breakingStrength: '22 kN minimum',
    weight: '5-15 kg selon type',
    applications: 'Toiture, poutre, béton'
  },
  
  certifications: {
    csa: ['CSA Z259.15'],
    ansi: ['ANSI Z359.18'],
    en: ['EN 795'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['anchor_structure'],
  hazardsProtectedAgainst: [
    'inadequate_anchor_points',
    'structural_failure'
  ],
  
  usageInstructions: {
    fr: [
      'Installation selon instructions fabricant',
      'Vérification résistance support',
      'Test charge avant utilisation',
      'Une personne maximum par point'
    ],
    en: [
      'Install per manufacturer instructions',
      'Verify support structure strength',
      'Load test before use',
      'Maximum one person per point'
    ]
  ],
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 120,
  
  estimatedCost: {
    amount: 350,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  availability: 'specialized',
  trainingRequired: true,
  
  tags: ['ancrage', 'portable', '22kn', 'temporaire']
});

export const rescueKit: SafetyEquipment = createNewEquipment({
  id: 'fall_rescue_kit_complete',
  name: 'Trousse de sauvetage chute complète',
  category: 'ppe_fall_protection',
  subcategory: 'rescue',
  displayName: {
    fr: 'Équipement de sauvetage après chute',
    en: 'Post-fall rescue equipment kit'
  },
  description: 'Équipement complet pour sauvetage personne suspendue',
  
  specifications: {
    components: 'Poulies, cordes, descendeur',
    ropeLength: '50-100 mètres',
    capacity: '140 kg utilisateur + équipement'
  },
  
  certifications: {
    csa: ['CSA Z259.10'],
    ansi: ['ANSI Z359'],
    en: ['EN 341', 'EN 12841'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'post_fall_suspension',
    'rescue_operations'
  ],
  
  usageInstructions: {
    fr: [
      'Formation sauvetage obligatoire',
      'Plan sauvetage établi avant travail',
      'Équipe sauvetage formée disponible',
      'Test équipement avant chaque projet'
    ],
    en: [
      'Rescue training mandatory',
      'Rescue plan established before work',
      'Trained rescue team available',
      'Equipment testing before each project'
    ]
  },
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 60,
  
  estimatedCost: {
    amount: 800,
    currency: 'CAD',
    unit: 'per_kit'
  },
  
  availability: 'specialized',
  trainingRequired: true,
  certificationRequired: true,
  
  tags: ['sauvetage', 'suspension', 'urgence', 'formation_obligatoire']
});

// =================== EXPORT PROTECTION CHUTES ===================
export const fallProtectionEquipment = [
  fullBodyHarness,
  shockAbsorbingLanyard,
  selfRetractingLifeline,
  anchorPointPortable,
  rescueKit
];

export const fallProtectionById = fallProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default fallProtectionEquipment;
