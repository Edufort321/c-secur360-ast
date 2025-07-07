// app/data/equipment/electrical.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'ELECTRICAL' as any,
    certifications: [] as any,
    standards: [] as any,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    workTypes: [] as any,
    hazardTypes: [] as any,
    supplier: 'Supplier TBD',
    cost: 0,
    currency: 'CAD',
    lifespan: '1 year',
    inspectionFrequency: 'monthly',
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== GANTS ÉLECTRIQUES ===================

export const electricalGlovesClass0 = createNewEquipment({
  id: 'electrical_gloves_class0_1000v',
  name: 'Gants électriques Classe 0 - 1000V',
  category: 'ELECTRICAL' as any,
  subcategory: 'electrical_gloves',
  description: 'Gants isolants électriques pour travaux basse tension',
  
  displayName: {
    fr: 'Gants électriques Classe 0 - 1000V',
    en: 'Electrical Gloves Class 0 - 1000V'
  },

  specifications: {
    model: 'E011B',
    manufacturer: 'Salisbury',
    partNumber: 'E011B/9',
    voltageClass: 'Classe 0',
    maxVoltage: 1000, // V
    testVoltage: 5000, // V
    material: 'Caoutchouc naturel',
    thickness: '1.14mm minimum',
    length: '356mm',
    sizes: '7 à 12 disponibles'
  },

  safetyFeatures: [
    'Test diélectrique 100% en usine',
    'Résistance à l\'ozone excellent',
    'Marquage permanent de la classe',
    'Code couleur pour identification',
    'Résistance aux produits chimiques',
    'Inspection visuelle facilitée'
  ] as any,

  maintenanceRequirements: [
    'Test électrique tous les 6 mois',
    'Inspection visuelle avant chaque usage',
    'Nettoyage après utilisation',
    'Stockage suspendu, à l\'abri de la lumière',
    'Remplacement si défaut détecté'
  ] as any,

  compatibleWith: [
    'leather_protector_gloves',
    'hard_hat_electrical_class_e',
    'safety_glasses_arc_rated'
  ] as any,

  certifications: ['ASTM D120', 'CSA Z462', 'IEC 60903'] as any,
  standards: ['ASTM D120', 'CSA Z462'] as any,
  
  usageInstructions: [
    'Inspecter visuellement avant utilisation',
    'Porter avec gants de protection en cuir',
    'Éviter contact avec objets tranchants',
    'Respecter les limites de tension',
    'Nettoyer et sécher après usage'
  ] as any,

  storageConditions: 'Suspendu, température ambiante, à l\'abri UV',
  
  inspectionCriteria: [
    'Absence de coupures, trous, fissures',
    'État des marquages de classe',
    'Souplesse du matériau',
    'Date du dernier test électrique',
    'Absence de contamination chimique'
  ] as any,

  supplier: 'Honeywell',
  cost: 85,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  workTypes: ['electrical_work', 'maintenance'] as any,
  hazardTypes: ['electrical_shock', 'arc_flash'] as any
});

// =================== DÉTECTEUR DE TENSION ===================

export const voltageDetector = createNewEquipment({
  id: 'voltage_detector_non_contact',
  name: 'Détecteur de tension sans contact',
  category: 'ELECTRICAL' as any,
  subcategory: 'test_equipment',
  description: 'Détecteur de tension capacitif sans contact',
  
  displayName: {
    fr: 'Détecteur de tension sans contact',
    en: 'Non-Contact Voltage Detector'
  },

  specifications: {
    model: '1AC-A1-II',
    manufacturer: 'Fluke',
    partNumber: '1AC-A1-II',
    voltageRange: '90-1000V AC',
    frequency: '50/60 Hz',
    safetyCategory: 'CAT IV 1000V',
    batteryType: 'AAA x2',
    batteryLife: 100, // heures
    operatingTemp: '0 à 50°C',
    autoShutoff: 5 // minutes
  },

  safetyFeatures: [
    'Détection sans contact physique',
    'Indication visuelle et sonore',
    'Test de fonctionnement intégré',
    'Arrêt automatique économie batterie',
    'Boîtier antidérapant',
    'Conformité CAT IV'
  ] as any,

  maintenanceRequirements: [
    'Test de fonctionnement avant usage',
    'Remplacement des piles selon besoin',
    'Nettoyage du boîtier',
    'Vérification de l\'indicateur LED/sonore',
    'Étalonnage annuel recommandé'
  ] as any,

  compatibleWith: [
    'electrical_safety_kit',
    'lockout_tagout_devices',
    'multimeter_digital'
  ] as any,

  certifications: ['UL', 'CSA', 'CE', 'CAT IV 1000V'] as any,
  standards: ['IEC 61010-1', 'EN 61010-1'] as any,
  
  usageInstructions: [
    'Tester sur source connue avant usage',
    'Approcher graduellement du conducteur',
    'Confirmer absence tension sur tous conducteurs',
    'Ne pas se fier uniquement à cet outil',
    'Utiliser en complément d\'un multimètre'
  ] as any,

  storageConditions: 'Étui de protection, température ambiante',
  
  inspectionCriteria: [
    'Fonctionnement sur source connue',
    'Réponse des indicateurs LED/sonore',
    'État de la pile',
    'Intégrité du boîtier',
    'Propreté des zones de détection'
  ] as any,

  supplier: 'Fluke Corporation',
  cost: 45,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  workTypes: ['electrical_work', 'maintenance'] as any,
  hazardTypes: ['electrical_shock', 'arc_flash'] as any
});

// =================== TAPIS ISOLANT ===================

export const electricalMat = createNewEquipment({
  id: 'electrical_insulating_mat_class2',
  name: 'Tapis isolant électrique Classe 2',
  category: 'ELECTRICAL' as any,
  subcategory: 'floor_protection',
  description: 'Tapis isolant en caoutchouc pour poste de travail électrique',
  
  displayName: {
    fr: 'Tapis isolant électrique Classe 2',
    en: 'Class 2 Electrical Insulating Mat'
  },

  specifications: {
    model: 'IM-36-2',
    manufacturer: 'Cementex',
    partNumber: 'IM-36-2',
    voltageClass: 'Classe 2',
    maxVoltage: 17000, // V
    testVoltage: 25000, // V
    material: 'Caoutchouc synthétique',
    thickness: '3.2mm',
    dimensions: '914 x 914mm',
    weight: 4.5 // kg
  },

  safetyFeatures: [
    'Surface antidérapante texturée',
    'Résistance à l\'huile et produits chimiques',
    'Bordures biseautées anti-trébuchement',
    'Marquage permanent de classe',
    'Résistance aux UV',
    'Test diélectrique certifié'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage régulier avec détergent doux',
    'Inspection visuelle mensuelle',
    'Test électrique annuel',
    'Stockage à plat, éviter pliage',
    'Remplacement si endommagé'
  ] as any,

  compatibleWith: [
    'electrical_work_station',
    'safety_barriers',
    'warning_signs_electrical'
  ] as any,

  certifications: ['ASTM D178', 'IEC 61111'] as any,
  standards: ['ASTM D178', 'IEC 61111'] as any,
  
  usageInstructions: [
    'Placer sur surface propre et sèche',
    'Éviter objets tranchants sur le tapis',
    'Maintenir surface propre pendant utilisation',
    'Inspecter avant chaque installation',
    'Stocker roulé, jamais plié'
  ] as any,

  storageConditions: 'Roulé, température 5-35°C, éviter UV directs',
  
  inspectionCriteria: [
    'Absence de coupures, perforations',
    'Intégrité des bordures',
    'État de la surface antidérapante',
    'Lisibilité du marquage de classe',
    'Souplesse du matériau'
  ] as any,

  supplier: 'Cementex',
  cost: 275,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'monthly',
  workTypes: ['electrical_work', 'substation_work'] as any,
  hazardTypes: ['electrical_shock', 'step_potential'] as any
});

// =================== KIT DE VERROUILLAGE ===================

export const lockoutTagoutKit = createNewEquipment({
  id: 'lockout_tagout_electrical_kit',
  name: 'Kit de verrouillage électrique complet',
  category: 'ELECTRICAL' as any,
  subcategory: 'lockout_devices',
  description: 'Kit complet pour verrouillage/étiquetage électrique',
  
  displayName: {
    fr: 'Kit de verrouillage électrique complet',
    en: 'Complete Electrical Lockout Kit'
  },

  specifications: {
    model: 'ELK-1',
    manufacturer: 'Brady',
    partNumber: '65289',
    contents: 'Cadenas, étiquettes, dispositifs divers',
    lockQuantity: 6,
    tagQuantity: 25,
    caseType: 'Mallette plastique rigide',
    weight: 2.8, // kg
    dimensions: '330 x 254 x 89mm'
  },

  contents: [
    'Cadenas sécurité rouge (6)',
    'Étiquettes danger (25)',
    'Bloque-disjoncteur universel (5)',
    'Bloque-prise standard (3)',
    'Bloque-fiche (2)',
    'Chaîne avec cadenas (1)',
    'Marqueurs permanents (2)',
    'Manuel de procédures'
  ] as any,

  safetyFeatures: [
    'Cadenas à clé unique par utilisateur',
    'Étiquettes résistantes aux intempéries',
    'Couleur rouge haute visibilité',
    'Matériaux non conducteurs',
    'Résistance à la corrosion',
    'Mallette organisée clairement'
  ] as any,

  maintenanceRequirements: [
    'Inventaire mensuel du contenu',
    'Remplacement des étiquettes utilisées',
    'Test de fonctionnement des cadenas',
    'Nettoyage de la mallette',
    'Formation du personnel utilisateur'
  ] as any,

  compatibleWith: [
    'electrical_panels',
    'circuit_breakers',
    'electrical_outlets',
    'motor_starters'
  ] as any,

  certifications: ['CSA Z460', 'OSHA 1910.147'] as any,
  standards: ['CSA Z460', 'OSHA 1910.147'] as any,
  
  usageInstructions: [
    'Identifier toutes sources d\'énergie',
    'Couper et verrouiller chaque source',
    'Apposer étiquette avec informations',
    'Tester l\'absence d\'énergie',
    'Seul le poseur retire son cadenas'
  ] as any,

  storageConditions: 'Mallette fermée, lieu sec, accès contrôlé',
  
  inspectionCriteria: [
    'Présence de tous les éléments',
    'État des cadenas et clés',
    'Lisibilité des étiquettes',
    'Intégrité des dispositifs de blocage',
    'Fonctionnalité de la mallette'
  ] as any,

  supplier: 'Brady Corporation',
  cost: 185,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'monthly',
  workTypes: ['electrical_work', 'maintenance', 'shutdown'] as any,
  hazardTypes: ['electrical_shock', 'unexpected_startup'] as any
});

// =================== EXPORT DES ÉQUIPEMENTS ÉLECTRIQUES ===================

export const electricalEquipment = [
  electricalGlovesClass0,
  voltageDetector,
  electricalMat,
  lockoutTagoutKit
];

export const electricalById = electricalEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default electricalEquipment;
