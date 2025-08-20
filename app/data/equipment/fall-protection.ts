// app/data/equipment/fall-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'FALL_PROTECTION' as any,
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

// =================== HARNAIS COMPLET ===================

export const fullBodyHarness = createNewEquipment({
  id: 'full_body_harness_class_a',
  name: 'Harnais complet Classe A',
  category: 'FALL_PROTECTION' as any,
  subcategory: 'harnesses',
  description: 'Harnais de sécurité corps entier pour travail en hauteur',
  
  displayName: {
    fr: 'Harnais complet Classe A',
    en: 'Class A Full Body Harness'
  },

  specifications: {
    model: 'ExoFit NEX',
    manufacturer: '3M DBI-SALA',
    partNumber: '1113122',
    weightCapacity: 140, // kg
    material: 'Polyester résistant',
    buckleType: 'Boucles à passage rapide',
    dorsal: 'Point d\'ancrage dorsal',
    frontal: 'Point d\'ancrage frontal',
    sizes: 'S à 3XL'
  },

  safetyFeatures: [
    'Points d\'ancrage multiples certifiés',
    'Sangles rembourrées confort',
    'Boucles autobloquantes',
    'Indicateurs d\'usure visuels',
    'Anneaux en acier forgé',
    'Résistant aux UV et abrasion'
  ] as any,

  maintenanceRequirements: [
    'Inspection complète avant chaque usage',
    'Nettoyage après exposition à contaminants',
    'Vérification des coutures et sangles',
    'Test des boucles et anneaux',
    'Retrait immédiat si chute subie'
  ] as any,

  compatibleWith: [
    'shock_absorbing_lanyard',
    'self_retracting_lifeline',
    'hard_hat_chin_strap',
    'safety_boots_work'
  ] as any,

  certifications: ['CSA Z259.10-M90', 'ANSI Z359.11', 'CE EN 361'] as any,
  standards: ['CSA Z259.10', 'ANSI Z359.11'] as any,
  
  usageInstructions: [
    'Ajuster toutes les sangles correctement',
    'Vérifier tous les points de connexion',
    'Connecter à un point d\'ancrage certifié',
    'Maintenir les anneaux libres d\'obstacles',
    'Respecter la limite de poids'
  ] as any,

  storageConditions: 'Lieu sec, suspendu, à l\'abri des UV',
  
  inspectionCriteria: [
    'Intégrité de toutes les sangles',
    'État des coutures et surpiqûres',
    'Fonctionnement des boucles',
    'Absence de déformation des anneaux',
    'Usure des points de frottement'
  ] as any,

  supplier: '3M Fall Protection',
  cost: 185,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  workTypes: ['work_at_height', 'roofing', 'construction'] as any,
  hazardTypes: ['falls_from_height', 'swing_fall'] as any
});

// =================== LONGE AVEC ABSORBEUR ===================

export const shockAbsorbingLanyard = createNewEquipment({
  id: 'shock_absorbing_lanyard_2m',
  name: 'Longe avec absorbeur d\'énergie 2m',
  category: 'FALL_PROTECTION' as any,
  subcategory: 'lanyards',
  description: 'Longe de sécurité avec absorbeur d\'énergie intégré',
  
  displayName: {
    fr: 'Longe avec absorbeur d\'énergie 2m',
    en: '2m Shock Absorbing Lanyard'
  },

  specifications: {
    model: 'ShockWave2',
    manufacturer: 'Miller',
    partNumber: 'M1020045',
    length: 2.0, // mètres
    weightCapacity: 140, // kg
    material: 'Polyester tressé',
    absorberType: 'Déchirement contrôlé',
    connectors: 'Mousquetons acier forgé',
    fallDistance: 6.0 // mètres maximum
  },

  safetyFeatures: [
    'Absorbeur d\'énergie certifié',
    'Mousquetons autoverrouillants',
    'Étiquette d\'inspection permanente',
    'Résistance 22 kN minimum',
    'Indicateur visuel d\'activation',
    'Protection contre la corrosion'
  ] as any,

  maintenanceRequirements: [
    'Inspection visuelle avant usage',
    'Vérification des mousquetons',
    'Contrôle de l\'absorbeur d\'énergie',
    'Nettoyage si contaminé',
    'Retrait si absorbeur activé'
  ] as any,

  compatibleWith: [
    'full_body_harness_class_a',
    'permanent_anchor_points',
    'temporary_anchor_systems'
  ] as any,

  certifications: ['CSA Z259.11-M90', 'ANSI Z359.13', 'CE EN 355'] as any,
  standards: ['CSA Z259.11', 'ANSI Z359.13'] as any,
  
  usageInstructions: [
    'Connecter aux points d\'ancrage certifiés',
    'Maintenir longueur minimale chute libre',
    'Éviter les arêtes vives',
    'Inspecter l\'absorbeur avant usage',
    'Remplacer après toute chute'
  ] as any,

  storageConditions: 'Enroulé sans nœud, lieu sec et propre',
  
  inspectionCriteria: [
    'Intégrité de la longe textile',
    'État des épissures et coutures',
    'Fonctionnement des mousquetons',
    'Condition de l\'absorbeur d\'énergie',
    'Lisibilité de l\'étiquette'
  ] as any,

  supplier: 'Honeywell Miller',
  cost: 95,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  workTypes: ['work_at_height', 'tower_climbing'] as any,
  hazardTypes: ['falls_from_height', 'arrest_forces'] as any
});

// =================== LIGNE DE VIE AUTORÉTRACTABLE ===================

export const selfRetractingLifeline = createNewEquipment({
  id: 'self_retracting_lifeline_20m',
  name: 'Ligne de vie autorétractable 20m',
  category: 'FALL_PROTECTION' as any,
  subcategory: 'srl_devices',
  description: 'Système autorétractable avec câble acier 20 mètres',
  
  displayName: {
    fr: 'Ligne de vie autorétractable 20m',
    en: '20m Self-Retracting Lifeline'
  },

  specifications: {
    model: 'Talon',
    manufacturer: '3M DBI-SALA',
    partNumber: '3102000',
    cableLength: 20.0, // mètres
    cableType: 'Acier galvanisé 3.2mm',
    weightCapacity: 140, // kg
    housing: 'Aluminium moulé',
    brakingDistance: 1.0, // mètre
    weight: 8.5 // kg
  },

  safetyFeatures: [
    'Freinage automatique instantané',
    'Mécanisme de rappel constant',
    'Boîtier étanche IP65',
    'Indicateur de chute intégré',
    'Point de fixation pivotant',
    'Inspection facilitée'
  ] as any,

  maintenanceRequirements: [
    'Inspection complète annuelle par technicien',
    'Vérification du mécanisme de freinage',
    'Contrôle de l\'état du câble',
    'Lubrification selon manuel',
    'Test fonctionnel mensuel'
  ] as any,

  compatibleWith: [
    'full_body_harness_dorsal',
    'overhead_anchor_points',
    'crane_hooks',
    'structural_steel'
  ] as any,

  certifications: ['CSA Z259.2.2', 'ANSI Z359.14', 'CE EN 360'] as any,
  standards: ['CSA Z259.2.2', 'ANSI Z359.14'] as any,
  
  usageInstructions: [
    'Fixer au point d\'ancrage au-dessus',
    'Connecter au point dorsal du harnais',
    'Vérifier le rappel automatique',
    'Éviter les obstacles sur le trajet',
    'Respecter l\'angle de travail maximal'
  ] as any,

  storageConditions: 'Position verticale, mécanisme protégé',
  
  inspectionCriteria: [
    'Fonctionnement du mécanisme de rappel',
    'État du câble (corrosion, torons)',
    'Test du système de freinage',
    'Intégrité du boîtier',
    'Fonctionnement des indicateurs'
  ] as any,

  supplier: '3M Fall Protection',
  cost: 485,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'monthly',
  workTypes: ['work_at_height', 'confined_space'] as any,
  hazardTypes: ['falls_from_height', 'pendulum_effect'] as any
});

// =================== SYSTÈME D'ANCRAGE TEMPORAIRE ===================

export const temporaryAnchorSystem = createNewEquipment({
  id: 'temporary_anchor_system_roof',
  name: 'Système d\'ancrage temporaire toiture',
  category: 'FALL_PROTECTION' as any,
  subcategory: 'anchor_systems',
  description: 'Point d\'ancrage temporaire pour toitures et structures',
  
  displayName: {
    fr: 'Système d\'ancrage temporaire toiture',
    en: 'Temporary Roof Anchor System'
  },

  specifications: {
    model: 'SSRA1',
    manufacturer: 'Guardian Fall Protection',
    partNumber: '00815',
    capacity: 2270, // kg (5000 lbs)
    material: 'Acier galvanisé',
    roofThickness: '6-51mm compatible',
    baseSize: '203 x 203mm',
    height: '76mm',
    weight: 4.1 // kg
  },

  safetyFeatures: [
    'Ancrage certifié 22.2 kN',
    'Installation sans perçage',
    'Répartition de charge optimisée',
    'Résistant à la corrosion',
    'Point de connexion 360°',
    'Marquage permanent capacité'
  ] as any,

  maintenanceRequirements: [
    'Inspection avant chaque installation',
    'Vérification de l\'état de surface',
    'Contrôle des boulons de serrage',
    'Nettoyage après utilisation',
    'Stockage dans emballage d\'origine'
  ] as any,

  compatibleWith: [
    'various_roof_types',
    'fall_protection_systems',
    'temporary_installations',
    'maintenance_work'
  ] as any,

  certifications: ['CSA Z259.15', 'ANSI Z359.18', 'OSHA 1926.502'] as any,
  standards: ['CSA Z259.15', 'ANSI Z359.18'] as any,
  
  usageInstructions: [
    'Vérifier la compatibilité avec la toiture',
    'Positionner selon les instructions',
    'Serrer à la force spécifiée',
    'Limiter à 2 utilisateurs maximum',
    'Retirer après utilisation'
  ] as any,

  storageConditions: 'Lieu sec, emballage de protection',
  
  inspectionCriteria: [
    'Intégrité de la structure métallique',
    'État des surfaces de contact',
    'Fonctionnement des boulons',
    'Absence de déformation',
    'Lisibilité du marquage'
  ] as any,

  supplier: 'Guardian Fall Protection',
  cost: 275,
  currency: 'CAD',
  lifespan: '20 years',
  lifespanMonths: 240,
  inspectionFrequency: 'before each use',
  workTypes: ['roofing', 'maintenance', 'construction'] as any,
  hazardTypes: ['falls_from_height', 'anchor_failure'] as any
});

// =================== EXPORT DES ÉQUIPEMENTS ANTICHUTE ===================

export const fallProtectionEquipment = [
  fullBodyHarness,
  shockAbsorbingLanyard,
  selfRetractingLifeline,
  temporaryAnchorSystem
];

export const fallProtectionById = fallProtectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default fallProtectionEquipment;
