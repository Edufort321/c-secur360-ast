// app/data/equipment/eye-protection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== PROTECTION DES YEUX ET DU VISAGE ===================

export const safetyGlassesBasic: SafetyEquipment = createNewEquipment({
  id: 'safety_glasses_z94_3',
  name: 'Lunettes de sécurité CSA Z94.3',
  category: 'ppe_eyes_face',
  subcategory: 'safety_glasses',
  displayName: {
    fr: 'Lunettes de protection CSA Z94.3',
    en: 'CSA Z94.3 safety glasses'
  },
  description: 'Lunettes de protection contre projections et impacts légers',
  
  specifications: {
    model: 'CSA Z94.3',
    material: 'Polycarbonate anti-rayures',
    weight: '25-35g',
    uvProtection: '99.9% UV-A et UV-B'
  },
  
  certifications: {
    csa: ['CSA Z94.3'],
    ansi: ['ANSI Z87.1'],
    en: ['EN 166'],
    iso: ['ISO 12312-1'],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['eyes'],
  hazardsProtectedAgainst: [
    'flying_particles',
    'dust_particles',
    'uv_radiation',
    'wind_debris'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster branches confortablement derrière oreilles',
      'Vérifier couverture complète champ visuel',
      'Nettoyer avec eau savonneuse tiède',
      'Sécher avec tissu doux non abrasif'
    ],
    en: [
      'Adjust temples comfortably behind ears',
      'Ensure complete visual field coverage',
      'Clean with warm soapy water',
      'Dry with soft non-abrasive cloth'
    ]
  },
  
  limitationsUse: [
    'Ne protège pas contre projections chimiques',
    'Protection latérale limitée',
    'Remplacer si rayures importantes',
    'Ne convient pas pour soudage'
  ],
  
  compatibility: [
    'safety_helmet_class_e',
    'hearing_protection_coquilles'
  ],
  
  incompatibility: [
    'welding_helmet_auto_darkening'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Verres sans rayures obstruant vision',
    'Monture non déformée ou cassée',
    'Branches bien fixées',
    'Plaquettes nasales en bon état',
    'Absence de fissures dans verres'
  ],
  
  maintenanceInstructions: [
    'Nettoyer quotidiennement si utilisé',
    'Utiliser produits nettoyants non abrasifs',
    'Ranger dans étui protecteur',
    'Éviter contact avec solvants'
  ],
  
  storageInstructions: [
    'Ranger dans étui rigide',
    'Éviter exposition chaleur excessive',
    'Stocker verres vers le haut'
  ],
  
  lifespanMonths: 24,
  replacementCriteria: [
    'Rayures importantes dans champ vision',
    'Monture cassée ou déformée',
    'Perte d\'ajustement',
    'Verres fissurés ou ébréchés'
  ],
  
  estimatedCost: {
    amount: 15,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M', 'Uvex', 'Honeywell', 'MCR Safety', 'Pyramex'],
  availability: 'common',
  
  tags: ['lunettes', 'projections', 'uv', 'polycarbonate', 'standard']
});

export const chemicalGoggles: SafetyEquipment = createNewEquipment({
  id: 'chemical_safety_goggles',
  name: 'Lunettes étanches chimiques',
  category: 'ppe_eyes_face',
  subcategory: 'chemical_goggles',
  displayName: {
    fr: 'Lunettes de protection chimique étanches',
    en: 'Chemical splash safety goggles'
  },
  description: 'Protection étanche contre éclaboussures de produits chimiques',
  
  specifications: {
    model: 'CSA Z94.3 Type indirect vent',
    material: 'Polycarbonate + joints étanches',
    weight: '80-120g',
    ventilation: 'Indirecte avec filtres'
  },
  
  certifications: {
    csa: ['CSA Z94.3'],
    ansi: ['ANSI Z87.1'],
    en: ['EN 166', 'EN 172'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['eyes', 'area_around_eyes'],
  hazardsProtectedAgainst: [
    'hazardous_chemical_exposure',
    'chemical_splash',
    'corrosive_acids_bases',
    'organic_solvents_vapors'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster sangle élastique confortablement',
      'Vérifier étanchéité complète périmètre',
      'Ajuster ventilation selon environnement',
      'Nettoyer immédiatement après exposition chimique'
    ],
    en: [
      'Adjust elastic strap comfortably',
      'Ensure complete perimeter seal',
      'Adjust ventilation per environment',
      'Clean immediately after chemical exposure'
    ]
  },
  
  limitationsUse: [
    'Ventilation réduite peut causer buée',
    'Port prolongé peut être inconfortable',
    'Champ visuel réduit vs lunettes',
    'Compatibilité limitée avec autres EPI'
  ],
  
  compatibility: [
    'chemical_resistant_gloves',
    'chemical_suit'
  ],
  
  incompatibility: [
    'safety_helmet_class_e',
    'hearing_protection_coquilles'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Joints d\'étanchéité intacts',
    'Sangle élastique fonctionnelle',
    'Ventilation non obstruée',
    'Verres propres et sans dommage',
    'Absence de fissures matériau'
  ],
  
  maintenanceInstructions: [
    'Rincer abondamment après usage chimique',
    'Désinfecter selon produits exposés',
    'Sécher complètement avant rangement',
    'Remplacer joints si dégradés'
  ],
  
  lifespanMonths: 18,
  
  temperatureRange: { min: -10, max: 60, unit: '°C' },
  
  estimatedCost: {
    amount: 35,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Uvex', '3M', 'Honeywell', 'MSA'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Ajustement correct pour étanchéité',
    'Procédures décontamination',
    'Limitations et incompatibilités'
  ],
  
  tags: ['chimiques', 'étanches', 'éclaboussures', 'ventilation_indirecte']
});

export const weldingShade: SafetyEquipment = createNewEquipment({
  id: 'welding_shade_glasses',
  name: 'Lunettes de soudage teintées',
  category: 'ppe_eyes_face',
  subcategory: 'welding_glasses',
  displayName: {
    fr: 'Lunettes de protection soudage',
    en: 'Welding shade safety glasses'
  },
  description: 'Protection contre radiations de soudage léger et meulage',
  
  specifications: {
    model: 'Shade 3-5',
    material: 'Verres filtrants IR/UV',
    weight: '40-60g',
    shadeRange: 'Shade 3, 5 disponibles'
  },
  
  certifications: {
    csa: ['CSA Z94.3', 'CSA W117.2'],
    ansi: ['ANSI Z87.1', 'ANSI Z49.1'],
    en: ['EN 166', 'EN 169'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['eyes'],
  hazardsProtectedAgainst: [
    'welding_radiation',
    'infrared_radiation',
    'uv_radiation',
    'grinding_sparks'
  ],
  
  usageInstructions: {
    fr: [
      'Choisir teinte selon procédé soudage',
      'Shade 3: meulage, coupage oxygène léger',
      'Shade 5: soudage gaz, brasage',
      'Ne pas utiliser pour soudage arc électrique'
    ],
    en: [
      'Select shade per welding process',
      'Shade 3: grinding, light oxy cutting',
      'Shade 5: gas welding, brazing',
      'Do not use for electric arc welding'
    ]
  },
  
  limitationsUse: [
    'NE PAS utiliser pour soudage >50A',
    'Ne protège pas contre projections métalliques',
    'Vision réduite en faible luminosité',
    'Ne remplace pas casque de soudage complet'
  ],
  
  inspectionFrequency: 'before_each_use',
  
  lifespanMonths: 36,
  
  estimatedCost: {
    amount: 25,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Sélection teinte appropriée',
    'Limitations selon procédés'
  ],
  
  tags: ['soudage', 'teintées', 'shade', 'radiations', 'meulage']
});

export const faceShieldPolycarbonate: SafetyEquipment = createNewEquipment({
  id: 'face_shield_polycarbonate',
  name: 'Écran facial polycarbonate',
  category: 'ppe_eyes_face',
  subcategory: 'face_shield',
  displayName: {
    fr: 'Écran de protection facial',
    en: 'Polycarbonate face shield'
  },
  description: 'Protection complète du visage contre projections et impacts',
  
  specifications: {
    model: 'CSA Z94.3',
    material: 'Polycarbonate 1.0mm',
    weight: '150-200g',
    coverage: 'Front et côtés partiels'
  },
  
  certifications: {
    csa: ['CSA Z94.3'],
    ansi: ['ANSI Z87.1'],
    en: ['EN 166'],
    iso: [],
    other: []
  },
  
  protectionLevel: 'enhanced',
  protectedBodyParts: ['face', 'eyes', 'forehead', 'chin'],
  hazardsProtectedAgainst: [
    'chemical_splash',
    'metal_splatter',
    'flying_particles',
    'grinding_sparks',
    'biological_droplets'
  ],
  
  usageInstructions: {
    fr: [
      'Ajuster bandeau ou fixer sur casque',
      'Positionner à 2-3cm du visage',
      'Utiliser AVEC lunettes de sécurité',
      'Incliner légèrement vers arrière'
    ],
    en: [
      'Adjust headgear or mount on helmet',
      'Position 2-3cm from face',
      'Use WITH safety glasses',
      'Tilt slightly backward'
    ]
  },
  
  limitationsUse: [
    'NE REMPLACE PAS les lunettes de sécurité',
    'Protection latérale limitée',
    'Peut créer reflets par éclairage',
    'Ventilation réduite'
  ],
  
  compatibility: [
    'safety_helmet_class_e',
    'safety_glasses_z94_3',
    'chemical_safety_goggles'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Écran sans rayures importantes',
    'Fixation solide bandeau/casque',
    'Absence de fissures',
    'Mécanisme d\'ajustement fonctionnel'
  ],
  
  maintenanceInstructions: [
    'Nettoyer avec détergent doux',
    'Éviter produits abrasifs',
    'Sécher avec tissu antistatique',
    'Désinfecter si exposition biologique'
  ],
  
  lifespanMonths: 30,
  replacementCriteria: [
    'Rayures obstruant vision',
    'Fissures dans matériau',
    'Déformation permanente',
    'Perte de transparence'
  ],
  
  estimatedCost: {
    amount: 20,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['3M', 'Honeywell', 'Jackson Safety', 'MCR Safety'],
  availability: 'common',
  
  tags: ['écran_facial', 'projections', 'complémentaire', 'polycarbonate']
});

export const laserSafetyGlasses: SafetyEquipment = createNewEquipment({
  id: 'laser_safety_glasses_nd_yag',
  name: 'Lunettes protection laser',
  category: 'ppe_eyes_face',
  subcategory: 'laser_glasses',
  displayName: {
    fr: 'Lunettes de protection laser Nd:YAG',
    en: 'Nd:YAG laser safety glasses'
  },
  description: 'Protection spécialisée contre rayonnements laser spécifiques',
  
  specifications: {
    model: 'OD4+ @ 1064nm',
    material: 'Verre filtrant laser',
    weight: '45-65g',
    wavelength: '1064nm (Nd:YAG)'
  },
  
  certifications: {
    csa: [],
    ansi: ['ANSI Z136.1'],
    en: ['EN 207', 'EN 208'],
    iso: ['ISO 12254'],
    other: ['FDA 21CFR1040']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['eyes', 'retina'],
  hazardsProtectedAgainst: [
    'laser_radiation_1064nm',
    'infrared_radiation'
  ],
  
  usageInstructions: {
    fr: [
      'Vérifier longueur d\'onde laser avant usage',
      'Porter en permanence en zone laser',
      'Vérifier densité optique requise',
      'Ne jamais regarder directement faisceau'
    ],
    en: [
      'Verify laser wavelength before use',
      'Wear continuously in laser area',
      'Check required optical density',
      'Never look directly at beam'
    ]
  },
  
  limitationsUse: [
    'SPÉCIFIQUE à longueur d\'onde indiquée',
    'Ne protège pas autres longueurs d\'onde',
    'Vision des couleurs altérée',
    'Transmission lumière réduite'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Verres intacts sans dommage',
    'Marquage longueur d\'onde lisible',
    'Densité optique confirmée',
    'Ajustement sécuritaire'
  ],
  
  lifespanMonths: 60,
  
  estimatedCost: {
    amount: 150,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Thorlabs', 'Edmund Optics', 'Newport', 'Laser Safety Industries'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Sécurité laser niveaux 3B/4',
    'Sélection EPI laser approprié',
    'Procédures urgence laser'
  ],
  certificationRequired: true,
  
  tags: ['laser', 'nd_yag', '1064nm', 'spécialisé', 'od4']
});

// =================== EXPORT PROTECTION YEUX ===================
export const eyeProtectionEquipment = [
  safetyGlassesBasic,
  chemicalGoggles,
  weldingShade,
  faceShieldPolycarbonate,
  laserSafetyGlasses
];

export const eyeProtectionById = eyeProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default eyeProtectionEquipment;
