// app/data/equipment/electrical.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== ÉQUIPEMENTS ÉLECTRIQUES SPÉCIALISÉS ===================

export const voltageDetector: SafetyEquipment = createNewEquipment({
  id: 'voltage_detector_1000v',
  name: 'Détecteur de tension 1000V',
  category: 'electrical_safety',
  subcategory: 'testing_equipment',
  displayName: {
    fr: 'Détecteur de tension électrique 1000V',
    en: '1000V electrical voltage detector'
  },
  description: 'Vérification absence de tension avant intervention électrique',
  
  specifications: {
    model: 'CSA C22.2 No. 61010-1',
    voltageRange: '12V AC/DC à 1000V AC/DC',
    accuracy: '±2% + 3 digits',
    safety: 'CAT III 1000V, CAT IV 600V',
    display: 'LCD avec rétroéclairage'
  },
  
  certifications: {
    csa: ['CSA C22.2 No. 61010-1'],
    ansi: [],
    en: ['EN 61010-1'],
    iso: ['ISO 17025'],
    other: ['UL 61010-1']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['hands', 'body_electrical_path'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'live_electrical_work',
    'voltage_verification'
  ],
  
  usageInstructions: {
    fr: [
      'Test fonctionnement sur source connue',
      'Vérification absence tension 3 points minimum',
      'Confirmer arrêt sur source connue après',
      'Porter EPI électriques appropriés',
      'Calibration annuelle obligatoire'
    ],
    en: [
      'Function test on known live source',
      'Verify de-energized at 3+ points minimum',
      'Confirm shutdown on known live source after',
      'Wear appropriate electrical PPE',
      'Annual calibration mandatory'
    ]
  },
  
  limitationsUse: [
    'Calibration annuelle obligatoire',
    'Test fonctionnement pré/post usage',
    'Conditions environnementales limitées',
    'Remplacement batteries critique',
    'Ne remplace pas procédures LOTO'
  ],
  
  compatibility: [
    'electrical_insulating_gloves_class2',
    'safety_helmet_class_e',
    'arc_flash_suit'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Écran fonctionnel et lisible',
    'Boîtier intact sans fissures',
    'Sondes en bon état',
    'Batteries suffisamment chargées',
    'Certificat calibration valide',
    'Test fonctionnement réussi'
  ],
  
  maintenanceInstructions: [
    'Calibration professionnelle annuelle',
    'Remplacement batteries préventif',
    'Nettoyage sondes après usage',
    'Stockage étui protecteur',
    'Éviter chocs et vibrations'
  ],
  
  storageInstructions: [
    'Étui rigide fourni',
    'Température contrôlée 0-50°C',
    'Humidité <80% sans condensation',
    'Éviter champs magnétiques forts',
    'Batteries retirées si stockage prolongé'
  ],
  
  lifespanMonths: 84,
  expirationWarning: 12,
  replacementCriteria: [
    'Échec calibration annuelle',
    'Dommages boîtier affectant sécurité',
    'Dysfonctionnement sondes',
    'Perte précision mesures',
    'Obsolescence pièces de rechange'
  ],
  
  temperatureRange: { min: -10, max: 55, unit: '°C' },
  humidityRange: { min: 5, max: 95, unit: '%' },
  
  estimatedCost: {
    amount: 180,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Fluke', 'Klein Tools', 'Ideal', 'Amprobe', 'Greenlee'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Sécurité électrique CSA Z462',
    'Utilisation détecteurs tension',
    'Procédures vérification absence tension'
  ],
  certificationRequired: true,
  
  isMandatory: true,
  
  tags: ['tension', 'détection', '1000v', 'calibration_annuelle', 'obligatoire']
});

export const lockoutTagoutKit: SafetyEquipment = createNewEquipment({
  id: 'lockout_tagout_kit_electrical',
  name: 'Trousse LOTO électrique complète',
  category: 'electrical_safety',
  subcategory: 'lockout_tagout',
  displayName: {
    fr: 'Ensemble de cadenassage/étiquetage électrique',
    en: 'Electrical lockout/tagout kit'
  },
  description: 'Kit complet pour cadenassage sécuritaire équipements électriques',
  
  specifications: {
    components: 'Cadenas, étiquettes, dispositifs',
    padlocks: '6-12 cadenas sécurité identiques',
    lockoutDevices: 'Disjoncteurs, fiches, vannes',
    tags: 'Étiquettes personnalisées durables'
  },
  
  certifications: {
    csa: ['CSA Z460'],
    ansi: ['ANSI Z244.1'],
    en: [],
    iso: [],
    other: ['OSHA 1910.147']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'unexpected_energization',
    'equipment_startup'
  ],
  
  usageInstructions: {
    fr: [
      'Procédure LOTO écrite obligatoire',
      'Identification toutes sources énergie',
      'Cadenassage individuel chaque personne',
      'Étiquetage avec identification',
      'Test absence énergie après LOTO'
    ],
    en: [
      'Written LOTO procedure mandatory',
      'Identify all energy sources',
      'Individual lockout each person',
      'Tagging with identification',
      'Test zero energy after LOTO'
    ]
  },
  
  limitationsUse: [
    'Procédures écrites spécifiques requises',
    'Formation LOTO obligatoire',
    'Un cadenas par personne exposée',
    'Étiquettes personnalisées seulement',
    'Vérification fonctionnement périodique'
  ],
  
  compatibility: [
    'voltage_detector_1000v',
    'electrical_insulating_gloves_class2',
    'procedure_loto_written'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Cadenas fonctionnels et identifiés',
    'Dispositifs cadenassage intacts',
    'Étiquettes lisibles et complètes',
    'Clés disponibles pour utilisateur',
    'Aucun dispositif défaillant'
  ],
  
  maintenanceInstructions: [
    'Test fonctionnement cadenas',
    'Remplacement étiquettes usées',
    'Lubrification mécanismes si requis',
    'Inventaire complet périodique',
    'Mise à jour selon modifications équipements'
  ],
  
  lifespanMonths: 120,
  replacementCriteria: [
    'Dysfonctionnement cadenas',
    'Usure dispositifs cadenassage',
    'Étiquettes illisibles',
    'Modifications équipements',
    'Évolution réglementations'
  ],
  
  estimatedCost: {
    amount: 250,
    currency: 'CAD',
    unit: 'per_kit'
  },
  
  suppliers: ['Brady', 'Master Lock', 'Panduit', 'Ideal', 'Accuform'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Procédures LOTO CSA Z460',
    'Identification sources énergie',
    'Utilisation dispositifs cadenassage'
  ],
  certificationRequired: true,
  
  isMandatory: true,
  
  tags: ['loto', 'cadenassage', 'étiquetage', 'procédures', 'obligatoire']
});

export const arcFlashSuit: SafetyEquipment = createNewEquipment({
  id: 'arc_flash_suit_category_4',
  name: 'Costume arc électrique catégorie 4',
  category: 'electrical_safety',
  subcategory: 'arc_flash_ppe',
  displayName: {
    fr: 'Ensemble de protection arc électrique cat. 4',
    en: 'Category 4 arc flash protection suit'
  },
  description: 'Protection complète contre arc électrique haute énergie >40 cal/cm²',
  
  specifications: {
    model: 'CSA Z462 Cat. 4',
    arcRating: '40+ cal/cm² minimum',
    components: 'Veste, pantalon, cagoule, gants',
    material: 'Nomex/Kevlar ignifuge',
    visibility: 'Bandes réfléchissantes'
  },
  
  certifications: {
    csa: ['CSA Z462', 'CSA Z96'],
    ansi: ['ANSI/ISEA 125'],
    en: ['IEC 61482-1-2'],
    iso: [],
    other: ['NFPA 70E', 'ASTM F1506']
  },
  
  protectionLevel: 'maximum',
  protectedBodyParts: ['whole_body', 'head', 'face', 'hands'],
  hazardsProtectedAgainst: [
    'arc_flash',
    'electrical_shock',
    'thermal_burns',
    'molten_metal_splash'
  ],
  
  usageInstructions: {
    fr: [
      'Analyse arc flash préalable obligatoire',
      'Sélection catégorie selon énergie incidente',
      'Port ensemble complet obligatoire',
      'Aucun sous-vêtement synthétique',
      'Cagoule avec ventilation si >25°C'
    ],
    en: [
      'Arc flash analysis required beforehand',
      'Category selection per incident energy',
      'Complete ensemble wearing mandatory',
      'No synthetic undergarments',
      'Ventilated hood if >25°C'
    ]
  },
  
  limitationsUse: [
    'Catégorie selon énergie incidente',
    'Durée port limitée par chaleur',
    'Nettoyage spécialisé requis',
    'Remplacement après exposition arc',
    'Stockage conditions contrôlées'
  ],
  
  compatibility: [
    'electrical_insulating_gloves_class2',
    'electrical_hazard_boots_eh',
    'voltage_detector_1000v'
  ],
  
  incompatibility: [
    'synthetic_undergarments',
    'metal_jewelry',
    'flammable_materials'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Tissu ignifuge sans dommages',
    'Fermetures éclair fonctionnelles',
    'Bandes réfléchissantes adhérentes',
    'Cagoule visière claire',
    'Étiquettes catégorie présentes',
    'Absence contamination'
  ],
  
  maintenanceInstructions: [
    'Nettoyage professionnel seulement',
    'Séchage air libre - pas de chaleur',
    'Stockage suspendu lieu sec',
    'Éviter contact produits chimiques',
    'Inspection après chaque usage'
  ],
  
  storageInstructions: [
    'Penderie dédiée ventilée',
    'Éviter compression prolongée',
    'Température ambiante stable',
    'Loin sources ignition',
    'Inventaire par catégorie'
  ],
  
  lifespanMonths: 60,
  expirationWarning: 6,
  replacementCriteria: [
    'Exposition à arc électrique',
    'Dommages tissu ignifuge',
    'Contamination non nettoyable',
    'Usure excessive générale',
    'Évolution normes protection'
  ],
  
  temperatureRange: { min: -30, max: 60, unit: '°C' },
  
  estimatedCost: {
    amount: 850,
    currency: 'CAD',
    unit: 'per_set'
  },
  
  suppliers: ['Oberon', 'Salisbury', 'Cementex', 'National Safety Apparel'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Analyse arc flash IEEE 1584',
    'Sélection EPI selon énergie incidente',
    'Utilisation ensemble arc flash'
  ],
  certificationRequired: true,
  
  isMandatory: false,
  
  tags: ['arc_flash', 'catégorie4', '40cal', 'ignifuge', 'analyse_préalable']
});

export const insulatingMats: SafetyEquipment = createNewEquipment({
  id: 'electrical_insulating_mats_class2',
  name: 'Tapis isolants électriques classe 2',
  category: 'electrical_safety',
  subcategory: 'insulating_equipment',
  displayName: {
    fr: 'Tapis isolants électriques classe 2 (17kV)',
    en: 'Class 2 electrical insulating mats (17kV)'
  },
  description: 'Isolation sol pour travaux électriques haute tension',
  
  specifications: {
    model: 'ASTM D178 Classe 2',
    voltage: '17 000V AC test',
    thickness: '3.2-4.8mm',
    material: 'Caoutchouc diélectrique',
    size: '0.9m x 0.9m standard'
  },
  
  certifications: {
    csa: ['CSA Z462'],
    ansi: ['ASTM D178 Class 2'],
    en: ['IEC 61111'],
    iso: [],
    other: ['IEEE 1048']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['feet', 'body_electrical_path'],
  hazardsProtectedAgainst: [
    'electrical_shock',
    'step_potential',
    'touch_potential'
  ],
  
  usageInstructions: {
    fr: [
      'Inspection avant chaque utilisation',
      'Surface propre et sèche obligatoire',
      'Éviter objets tranchants',
      'Recouvrement surfaces conductrices',
      'Test électrique annuel obligatoire'
    ],
    en: [
      'Inspection before each use',
      'Clean and dry surface mandatory',
      'Avoid sharp objects',
      'Cover conductive surfaces',
      'Annual electrical testing mandatory'
    ]
  },
  
  limitationsUse: [
    'Test électrique annuel obligatoire',
    'Sensible perforation/coupure',
    'Nettoyage spécialisé requis',
    'Stockage conditions contrôlées',
    'Température utilisation limitée'
  ],
  
  compatibility: [
    'electrical_insulating_gloves_class2',
    'electrical_hazard_boots_eh',
    'voltage_detector_1000v'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Surface sans coupures ou trous',
    'Absence objets étrangers incrustés',
    'Flexibilité matériau maintenue',
    'Propreté surface travail',
    'Certificat test électrique valide'
  ],
  
  maintenanceInstructions: [
    'Test électrique professionnel annuel',
    'Nettoyage eau savonneuse douce',
    'Séchage complet avant stockage',
    'Éviter solvants et huiles',
    'Stockage à plat ou enroulé'
  ],
  
  storageInstructions: [
    'Local sec température contrôlée',
    'Éviter contact objets tranchants',
    'Stockage vertical ou enroulé',
    'Loin sources ozone et UV',
    'Inventaire et rotation stock'
  ],
  
  lifespanMonths: 60,
  expirationWarning: 6,
  replacementCriteria: [
    'Échec test électrique annuel',
    'Perforations ou coupures',
    'Durcissement ou fissuration',
    'Contamination non nettoyable',
    'Fin période recommandée'
  ],
  
  temperatureRange: { min: -25, max: 65, unit: '°C' },
  
  estimatedCost: {
    amount: 120,
    currency: 'CAD',
    unit: 'per_mat'
  },
  
  suppliers: ['Salisbury', 'Cementex', 'Regeltex', 'Honeywell'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Installation et utilisation tapis isolants',
    'Inspection et maintenance',
    'Limitations et précautions'
  ],
  
  tags: ['isolants', 'tapis', 'classe2', '17kv', 'test_annuel']
});

export const groundingEquipment: SafetyEquipment = createNewEquipment({
  id: 'portable_grounding_equipment',
  name: 'Équipement de mise à la terre portable',
  category: 'electrical_safety',
  subcategory: 'grounding',
  displayName: {
    fr: 'Kit de mise à la terre portable',
    en: 'Portable grounding equipment kit'
  },
  description: 'Mise à la terre temporaire pour travaux sur lignes électriques',
  
  specifications: {
    model: 'IEEE 1048',
    conductorSize: '2/0 AWG minimum',
    clampRating: '1000A court-circuit',
    cableLength: '3-15 mètres',
    material: 'Cuivre multi-brins'
  },
  
  certifications: {
    csa: ['CSA Z462'],
    ansi: ['IEEE 1048'],
    en: [],
    iso: [],
    other: ['ASTM F855']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'induced_voltage',
    'fault_current',
    'static_electricity'
  ],
  
  usageInstructions: {
    fr: [
      'Installation après vérification absence tension',
      'Connexion terre avant conducteurs',
      'Déconnexion conducteurs avant terre',
      'Test continuité avant usage',
      'Personnel qualifié seulement'
    ],
    en: [
      'Install after voltage verification',
      'Connect ground before conductors',
      'Disconnect conductors before ground',
      'Continuity test before use',
      'Qualified personnel only'
    ]
  },
  
  limitationsUse: [
    'Personnel qualifié seulement',
    'Test continuité obligatoire',
    'Procédures strictes installation',
    'Inspection après chaque usage',
    'Conditions météo limitées'
  ],
  
  inspectionFrequency: 'before_each_use',
  lifespanMonths: 120,
  
  estimatedCost: {
    amount: 400,
    currency: 'CAD',
    unit: 'per_set'
  },
  
  suppliers: ['Salisbury', 'Hubbell', 'Chance', 'Hastings'],
  availability: 'specialized',
  trainingRequired: true,
  certificationRequired: true,
  
  tags: ['mise_terre', 'portable', 'lignes', 'qualifié_seulement']
});

// =================== EXPORT ÉQUIPEMENTS ÉLECTRIQUES ===================
export const electricalEquipment = [
  voltageDetector,
  lockoutTagoutKit,
  arcFlashSuit,
  insulatingMats,
  groundingEquipment
];

export const electricalEquipmentById = electricalEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default electricalEquipment;
