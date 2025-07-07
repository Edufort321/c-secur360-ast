// app/data/equipment/hand-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'HAND_PROTECTION' as any,
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

// =================== GANTS DE TRAVAIL GÉNÉRAUX ===================

export const workGlovesMechanic = createNewEquipment({
  id: 'work_gloves_mechanic_synthetic',
  name: 'Gants de travail mécanicien synthétiques',
  category: 'HAND_PROTECTION' as any,
  subcategory: 'general_work',
  description: 'Gants polyvalents pour travaux mécaniques et manipulation',
  
  displayName: {
    fr: 'Gants de travail mécanicien synthétiques',
    en: 'Synthetic Mechanic Work Gloves'
  },

  specifications: {
    model: 'M-Pact',
    manufacturer: 'Mechanix Wear',
    partNumber: 'MPT-55',
    material: 'Cuir synthétique TrekDry',
    palmMaterial: 'Clarino synthétique',
    protection: 'Articulations renforcées',
    cuffType: 'Poignet élastique',
    sizes: 'S à 3XL',
    washable: true
  },

  safetyFeatures: [
    'Protection impact articulations',
    'Paume antidérapante renforcée',
    'Doigts préformés ergonomiques',
    'Respirabilité TrekDry',
    'Pouce renforcé saddle',
    'Compatible écrans tactiles'
  ] as any,

  maintenanceRequirements: [
    'Lavage machine eau froide',
    'Séchage à l\'air libre',
    'Inspection usure quotidienne',
    'Remplacement si déchirure',
    'Stockage lieu sec'
  ] as any,

  compatibleWith: [
    'safety_glasses_basic',
    'hard_hat_standard',
    'steel_toe_boots'
  ] as any,

  certifications: ['CE EN 388:2016'] as any,
  standards: ['EN 388', 'ANSI 105'] as any,
  
  usageInstructions: [
    'Ajuster correctement au poignet',
    'Inspecter avant chaque utilisation',
    'Éviter contact avec objets tranchants',
    'Laver régulièrement',
    'Remplacer si usure excessive'
  ] as any,

  storageConditions: 'Lieu sec, ventilé, à l\'abri UV',
  
  inspectionCriteria: [
    'Intégrité des coutures',
    'Usure de la paume',
    'État des renforts articulations',
    'Souplesse du matériau',
    'Absence de déchirures'
  ] as any,

  supplier: 'Mechanix Wear',
  cost: 25,
  currency: 'CAD',
  lifespan: '6 months',
  lifespanMonths: 6,
  inspectionFrequency: 'daily',
  workTypes: ['maintenance', 'assembly', 'general_labor'] as any,
  hazardTypes: ['cuts_abrasions', 'impact_injuries', 'grip_loss'] as any
});

// =================== GANTS RÉSISTANTS COUPURES ===================

export const cutResistantGloves = createNewEquipment({
  id: 'cut_resistant_gloves_level_a4',
  name: 'Gants anti-coupures niveau A4',
  category: 'HAND_PROTECTION' as any,
  subcategory: 'cut_resistant',
  description: 'Gants haute protection contre les coupures',
  
  displayName: {
    fr: 'Gants anti-coupures niveau A4',
    en: 'Level A4 Cut Resistant Gloves'
  },

  specifications: {
    model: 'HyFlex 11-644',
    manufacturer: 'Ansell',
    partNumber: '11-644',
    cutLevel: 'ANSI A4',
    material: 'UHMWPE, fibre verre, polyamide',
    coating: 'Nitrile paume et doigts',
    thickness: '1.3mm',
    cutResistance: 2200, // grams
    sizes: '6 à 11'
  },

  safetyFeatures: [
    'Protection coupures niveau A4',
    'Adhérence supérieure nitrile',
    'Dextérité exceptionnelle',
    'Résistance à l\'abrasion',
    'Confort prolongé',
    'Lavable machine'
  ] as any,

  maintenanceRequirements: [
    'Inspection visuelle avant usage',
    'Lavage régulier eau tiède',
    'Séchage complet avant stockage',
    'Retrait immédiat si coupure',
    'Rotation entre plusieurs paires'
  ] as any,

  compatibleWith: [
    'safety_glasses_impact',
    'cut_resistant_sleeves',
    'steel_toe_boots'
  ] as any,

  certifications: ['ANSI 105 A4', 'CE EN 388:2016'] as any,
  standards: ['ANSI 105', 'EN 388'] as any,
  
  usageInstructions: [
    'Ajuster taille appropriée',
    'Inspecter absence de coupures',
    'Utiliser avec objets tranchants',
    'Ne pas utiliser près de flammes',
    'Remplacer si performance réduite'
  ] as any,

  storageConditions: 'Lieu propre, sec, ventilé',
  
  inspectionCriteria: [
    'Absence de coupures ou trous',
    'Intégrité du revêtement nitrile',
    'Élasticité des fibres',
    'Adhérence de la paume',
    'Confort et ajustement'
  ] as any,

  supplier: 'Ansell Healthcare',
  cost: 18,
  currency: 'CAD',
  lifespan: '4 months',
  lifespanMonths: 4,
  inspectionFrequency: 'before each use',
  workTypes: ['glass_handling', 'metal_fabrication', 'sharp_objects'] as any,
  hazardTypes: ['lacerations', 'puncture_wounds', 'cuts'] as any
});

// =================== GANTS CHIMIQUES ===================

export const chemicalGlovesNitrile = createNewEquipment({
  id: 'chemical_gloves_nitrile_heavy',
  name: 'Gants chimiques nitrile épais',
  category: 'HAND_PROTECTION' as any,
  subcategory: 'chemical_resistant',
  description: 'Gants de protection contre produits chimiques',
  
  displayName: {
    fr: 'Gants chimiques nitrile épais',
    en: 'Heavy Duty Nitrile Chemical Gloves'
  },

  specifications: {
    model: 'SolVex 37-185',
    manufacturer: 'Ansell',
    partNumber: '37-185',
    material: 'Nitrile butadiène',
    thickness: '0.65mm',
    length: '330mm',
    chemicalResistance: 'Hydrocarbures, huiles, graisses',
    permeationTime: '>480 minutes',
    sizes: '7 à 10'
  },

  safetyFeatures: [
    'Résistance chimique étendue',
    'Barrière imperméable',
    'Résistance à la perforation',
    'Adhérence en milieu huileux',
    'Résistance à l\'abrasion',
    'Confort prolongé'
  ] as any,

  maintenanceRequirements: [
    'Décontamination après usage',
    'Rinçage abondant eau claire',
    'Inspection avant réutilisation',
    'Séchage complet',
    'Retrait si dégradation chimique'
  ] as any,

  compatibleWith: [
    'chemical_protective_suit',
    'face_shield_chemical',
    'chemical_resistant_boots'
  ] as any,

  certifications: ['EN 374-3', 'ASTM F739'] as any,
  standards: ['EN 374', 'ASTM F739'] as any,
  
  usageInstructions: [
    'Vérifier compatibilité chimique',
    'Enfiler correctement sans contamination',
    'Éviter contact avec objets tranchants',
    'Changer selon temps de perméation',
    'Décontaminer selon procédures'
  ] as any,

  storageConditions: 'Lieu frais, sec, hors UV directe',
  
  inspectionCriteria: [
    'Absence de perforation ou fissure',
    'Intégrité de l\'étanchéité',
    'Flexibilité du nitrile',
    'Absence de décoloration',
    'Performance barrière chimique'
  ] as any,

  supplier: 'Ansell Healthcare',
  cost: 12,
  currency: 'CAD',
  lifespan: '1 year',
  lifespanMonths: 12,
  inspectionFrequency: 'before each use',
  workTypes: ['chemical_handling', 'laboratory_work', 'cleaning'] as any,
  hazardTypes: ['chemical_burns', 'skin_absorption', 'contamination'] as any
});

// =================== GANTS THERMIQUES ===================

export const heatResistantGloves = createNewEquipment({
  id: 'heat_resistant_gloves_kevlar',
  name: 'Gants résistants chaleur Kevlar',
  category: 'HAND_PROTECTION' as any,
  subcategory: 'heat_resistant',
  description: 'Gants de protection contre chaleur extrême',
  
  displayName: {
    fr: 'Gants résistants chaleur Kevlar',
    en: 'Kevlar Heat Resistant Gloves'
  },

  specifications: {
    model: 'ActivArmr 43-216',
    manufacturer: 'Ansell',
    partNumber: '43-216',
    material: 'Kevlar, Nomex, coton',
    heatResistance: 250, // °C contact
    length: '350mm',
    insulation: 'Multicouche thermique',
    grip: 'Silicone antidérapant',
    sizes: '8 à 11'
  },

  safetyFeatures: [
    'Résistance chaleur 250°C',
    'Protection flamme et étincelles',
    'Isolation thermique multicouche',
    'Adhérence haute température',
    'Dextérité maintenue',
    'Évacuation humidité'
  ] as any,

  maintenanceRequirements: [
    'Inspection après chaque utilisation',
    'Nettoyage selon contamination',
    'Séchage complet obligatoire',
    'Retrait si brûlure ou trou',
    'Stockage ventilé'
  ] as any,

  compatibleWith: [
    'welding_helmet',
    'heat_resistant_clothing',
    'safety_glasses_heat'
  ] as any,

  certifications: ['EN 407', 'NFPA 1971'] as any,
  standards: ['EN 407', 'NFPA 1971'] as any,
  
  usageInstructions: [
    'Vérifier température de travail',
    'Inspecter avant exposition chaleur',
    'Éviter contact direct flammes',
    'Limiter temps d\'exposition',
    'Retirer si sensation chaleur'
  ] as any,

  storageConditions: 'Lieu sec, frais, ventilé',
  
  inspectionCriteria: [
    'Intégrité des fibres Kevlar',
    'Absence de brûlures ou trous',
    'État des coutures thermiques',
    'Fonctionnement adhérence silicone',
    'Souplesse des matériaux'
  ] as any,

  supplier: 'Ansell Healthcare',
  cost: 45,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  workTypes: ['welding', 'foundry', 'glass_handling', 'furnace'] as any,
  hazardTypes: ['thermal_burns', 'fire_exposure', 'molten_metal'] as any
});

// =================== EXPORT DES PROTECTIONS MAINS ===================

export const handProtectionEquipment = [
  workGlovesMechanic,
  cutResistantGloves,
  chemicalGlovesNitrile,
  heatResistantGloves
];

export const handProtectionById = handProtectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default handProtectionEquipment;
