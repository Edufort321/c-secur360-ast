// app/data/equipment/foot-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'FOOT_PROTECTION' as any,
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

// =================== BOTTES DE SÉCURITÉ ACIER ===================

export const steelToeBoots = createNewEquipment({
  id: 'steel_toe_boots_csa_grade1',
  name: 'Bottes sécurité embout acier CSA Grade 1',
  category: 'FOOT_PROTECTION' as any,
  subcategory: 'safety_boots',
  description: 'Bottes de travail avec embout d\'acier protection Grade 1',
  
  displayName: {
    fr: 'Bottes sécurité embout acier CSA Grade 1',
    en: 'CSA Grade 1 Steel Toe Safety Boots'
  },

  specifications: {
    model: 'Timberland PRO Pit Boss',
    manufacturer: 'Timberland',
    partNumber: '33034',
    toeCapType: 'Acier Grade 1',
    upperMaterial: 'Cuir pleine fleur',
    soleMaterial: 'Caoutchouc antidérapant',
    height: '15cm (6 pouces)',
    weight: 1.8, // kg par paire
    sizes: '7 à 15 disponibles'
  },

  safetyFeatures: [
    'Embout acier résistant 125 joules',
    'Semelle antiperforation',
    'Semelle antidérapante',
    'Protection métatarsienne disponible',
    'Résistant à l\'huile et produits chimiques',
    'Support de voûte plantaire'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage quotidien après utilisation',
    'Séchage complet avant stockage',
    'Inspection de l\'usure de la semelle',
    'Vérification de l\'intégrité de l\'embout',
    'Conditionnement du cuir mensuel'
  ] as any,

  compatibleWith: [
    'work_socks_moisture_wicking',
    'metatarsal_guards',
    'steel_shank_insoles'
  ] as any,

  certifications: ['CSA Z195 Grade 1', 'ASTM F2413'] as any,
  standards: ['CSA Z195', 'ASTM F2413'] as any,
  
  usageInstructions: [
    'Lacer fermement pour support optimal',
    'Inspecter avant chaque utilisation',
    'Remplacer si embout endommagé',
    'Maintenir les lacets en bon état',
    'Alterner avec une deuxième paire'
  ] as any,

  storageConditions: 'Lieu sec, aéré, forme maintenue',
  
  inspectionCriteria: [
    'Intégrité de l\'embout de protection',
    'Usure de la semelle antidérapante',
    'État du cuir et coutures',
    'Fonctionnement du laçage',
    'Absence de perforation de la semelle'
  ] as any,

  supplier: 'Timberland PRO',
  cost: 175,
  currency: 'CAD',
  lifespan: '12 months',
  lifespanMonths: 12,
  inspectionFrequency: 'daily',
  workTypes: ['construction_general', 'manufacturing', 'warehousing'] as any,
  hazardTypes: ['falling_objects', 'puncture_wounds', 'slips_falls'] as any
});

// =================== BOTTES ÉLECTRIQUES ===================

export const electricalSafetyBoots = createNewEquipment({
  id: 'electrical_safety_boots_18kv',
  name: 'Bottes sécurité électrique 18 kV',
  category: 'FOOT_PROTECTION' as any,
  subcategory: 'electrical_boots',
  description: 'Bottes isolantes électriques pour haute tension',
  
  displayName: {
    fr: 'Bottes sécurité électrique 18 kV',
    en: '18kV Electrical Safety Boots'
  },

  specifications: {
    model: 'Insulator',
    manufacturer: 'Salisbury',
    partNumber: 'ILB8005',
    voltageRating: 18000, // V
    testVoltage: 30000, // V
    material: 'Caoutchouc diélectrique',
    height: '40cm',
    soumisEncore: false,
    buckles: '4 boucles ajustables',
    weight: 2.8 // kg par paire
  },

  safetyFeatures: [
    'Isolation électrique 18 kV certifiée',
    'Matériau 100% diélectrique',
    'Boucles non conductrices',
    'Test en usine chaque paire',
    'Résistance à l\'ozone',
    'Marquage permanent classe voltage'
  ] as any,

  maintenanceRequirements: [
    'Test électrique semestriel obligatoire',
    'Nettoyage avec produits approuvés',
    'Inspection visuelle avant usage',
    'Stockage suspendu, à l\'abri lumière',
    'Retrait immédiat si défaut détecté'
  ] as any,

  compatibleWith: [
    'electrical_gloves_high_voltage',
    'arc_flash_suit',
    'hard_hat_electrical_class_e'
  ] as any,

  certifications: ['ASTM F2413', 'CSA Z462', 'IEC 61482'] as any,
  standards: ['ASTM F2413', 'CSA Z462'] as any,
  
  usageInstructions: [
    'Inspecter visuellement avant utilisation',
    'Porter sur surface isolante',
    'Éviter objets tranchants ou abrasifs',
    'Respecter les limites de tension',
    'Nettoyer après exposition à contaminants'
  ] as any,

  storageConditions: 'Suspendues, température contrôlée, hors UV',
  
  inspectionCriteria: [
    'Absence de coupures, fissures, trous',
    'État des boucles et fermetures',
    'Lisibilité du marquage voltage',
    'Souplesse du matériau caoutchouc',
    'Date du dernier test électrique'
  ] as any,

  supplier: 'Honeywell Salisbury',
  cost: 385,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  workTypes: ['electrical_high_voltage', 'substation_work'] as any,
  hazardTypes: ['electrical_shock', 'step_potential', 'arc_flash'] as any
});

// =================== BOTTES CHIMIQUES ===================

export const chemicalResistantBoots = createNewEquipment({
  id: 'chemical_resistant_boots_neoprene',
  name: 'Bottes résistantes chimiques néoprène',
  category: 'FOOT_PROTECTION' as any,
  subcategory: 'chemical_boots',
  description: 'Bottes de protection contre produits chimiques',
  
  displayName: {
    fr: 'Bottes résistantes chimiques néoprène',
    en: 'Neoprene Chemical Resistant Boots'
  },

  specifications: {
    model: 'ChemTech',
    manufacturer: 'Servus',
    partNumber: 'CT15',
    material: 'Néoprène 15" hauteur',
    thickness: '4.5mm',
    height: '38cm',
    sole: 'Caoutchouc nitrile antidérapant',
    chemicalResistance: 'Acides, bases, hydrocarbures',
    weight: 1.6 // kg par paire
  },

  safetyFeatures: [
    'Résistance chimique étendue',
    'Étanchéité intégrale',
    'Semelle antidérapante spécialisée',
    'Résistance à la perforation',
    'Facilité de décontamination',
    'Confort prolongé'
  ] as any,

  maintenanceRequirements: [
    'Décontamination après chaque usage',
    'Rinçage abondant eau claire',
    'Séchage complet avant stockage',
    'Inspection des zones d\'usure',
    'Test d\'étanchéité périodique'
  ] as any,

  compatibleWith: [
    'chemical_protective_suit',
    'chemical_gloves_nitrile',
    'face_shield_chemical'
  ] as any,

  certifications: ['EN 13832-3', 'ASTM F1671'] as any,
  standards: ['EN 13832-3', 'ASTM F1671'] as any,
  
  usageInstructions: [
    'Enfiler par-dessus vêtements protection',
    'Vérifier l\'étanchéité complète',
    'Éviter contact avec objets tranchants',
    'Décontaminer selon procédures',
    'Remplacer si dégradation chimique'
  ] as any,

  storageConditions: 'Lieu propre, sec, ventilé, hors UV',
  
  inspectionCriteria: [
    'Intégrité de l\'étanchéité',
    'Absence de fissures ou trous',
    'État de la semelle antidérapante',
    'Flexibilité du matériau',
    'Résistance aux produits utilisés'
  ] as any,

  supplier: 'Honeywell Servus',
  cost: 125,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  workTypes: ['chemical_handling', 'environmental_cleanup'] as any,
  hazardTypes: ['chemical_exposure', 'skin_contact', 'contamination'] as any
});

// =================== CHAUSSURES ANTIDÉRAPANTES ===================

export const slipResistantShoes = createNewEquipment({
  id: 'slip_resistant_shoes_kitchen',
  name: 'Chaussures antidérapantes cuisine',
  category: 'FOOT_PROTECTION' as any,
  subcategory: 'slip_resistant',
  description: 'Chaussures spécialisées surfaces glissantes',
  
  displayName: {
    fr: 'Chaussures antidérapantes cuisine',
    en: 'Kitchen Slip-Resistant Shoes'
  },

  specifications: {
    model: 'Revolution',
    manufacturer: 'Shoes for Crews',
    partNumber: 'SFC22782',
    soleType: 'TripGuard caoutchouc spécialisé',
    upperMaterial: 'Cuir résistant à l\'eau',
    slipResistance: 'Coefficient 0.75+',
    oilResistance: 'Résistant huiles animales/végétales',
    weight: 0.8, // kg par paire
    sizes: '5 à 13 disponibles'
  },

  safetyFeatures: [
    'Semelle antidérapante certifiée',
    'Résistance huiles et graisses',
    'Évacuation liquides optimisée',
    'Confort toute la journée',
    'Facilité de nettoyage',
    'Séchage rapide'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage quotidien après service',
    'Désinfection selon protocoles',
    'Inspection de l\'usure semelle',
    'Séchage complet entre utilisations',
    'Remplacement selon usure'
  ] as any,

  compatibleWith: [
    'non_slip_socks',
    'uniform_kitchen',
    'hair_net_food_service'
  ] as any,

  certifications: ['SATRA TM144', 'ASTM F1677'] as any,
  standards: ['SATRA TM144', 'ASTM F1677'] as any,
  
  usageInstructions: [
    'Lacer fermement pour stabilité',
    'Nettoyer semelles si accumulation graisse',
    'Marcher prudemment sur surfaces mouillées',
    'Remplacer quand adhérence diminue',
    'Maintenir propreté pour performance'
  ] as any,

  storageConditions: 'Lieu sec, aéré, propre',
  
  inspectionCriteria: [
    'Profondeur des crampons semelle',
    'Absence d\'accumulation graisses',
    'Intégrité du cuir supérieur',
    'État du laçage',
    'Performance antidérapante'
  ] as any,

  supplier: 'Shoes for Crews',
  cost: 85,
  currency: 'CAD',
  lifespan: '8 months',
  lifespanMonths: 8,
  inspectionFrequency: 'weekly',
  workTypes: ['food_service', 'kitchen_work', 'restaurant'] as any,
  hazardTypes: ['slips_falls', 'burns_scalds', 'cuts_from_falls'] as any
});

// =================== EXPORT DES PROTECTIONS PIEDS ===================

export const footProtectionEquipment = [
  steelToeBoots,
  electricalSafetyBoots,
  chemicalResistantBoots,
  slipResistantShoes
];

export const footProtectionById = footProtectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default footProtectionEquipment;
