// app/data/equipment/head-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'HEAD_PROTECTION' as any,
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

// =================== CASQUE STANDARD ===================

export const hardHatStandard = createNewEquipment({
  id: 'hard_hat_standard_type1_class_g',
  name: 'Casque de sécurité Type 1 Classe G',
  category: 'HEAD_PROTECTION' as any,
  subcategory: 'hard_hats',
  description: 'Casque de protection standard pour chantiers',
  
  displayName: {
    fr: 'Casque de sécurité Type 1 Classe G',
    en: 'Type 1 Class G Standard Hard Hat'
  },

  specifications: {
    model: 'V-Gard',
    manufacturer: 'MSA Safety',
    partNumber: '10194812',
    type: 'Type 1',
    electricalClass: 'Classe G (2200V)',
    material: 'HDPE haute densité',
    suspension: '4 points Fas-Trac III',
    weight: 350, // grammes
    colors: 'Blanc, jaune, orange, rouge'
  },

  safetyFeatures: [
    'Protection impact vertical Type 1',
    'Isolation électrique 2200V',
    'Système suspension 4 points',
    'Ajustement rapide Fas-Trac',
    'Résistant UV et températures extrêmes',
    'Compatible accessoires MSA'
  ] as any,

  maintenanceRequirements: [
    'Inspection quotidienne coque et suspension',
    'Nettoyage eau savonneuse tiède',
    'Remplacement suspension annuel',
    'Retrait si impact subi',
    'Vérification des fissures'
  ] as any,

  compatibleWith: [
    'chin_strap_elastic',
    'face_shield_attachable',
    'hearing_protection_earmuffs',
    'headlamp_mounting'
  ] as any,

  certifications: ['CSA Z94.1 Type 1 Classe G', 'ANSI Z89.1'] as any,
  standards: ['CSA Z94.1', 'ANSI Z89.1'] as any,
  
  usageInstructions: [
    'Ajuster suspension pour confort',
    'Porter correctement sur la tête',
    'Inspecter avant chaque utilisation',
    'Remplacer après impact significatif',
    'Nettoyer régulièrement'
  ] as any,

  storageConditions: 'Lieu sec, à l\'abri UV directe et chaleur',
  
  inspectionCriteria: [
    'Absence de fissures dans la coque',
    'Intégrité du système de suspension',
    'État des sangles et rivets',
    'Décoloration ou déformation',
    'Fonctionnement de l\'ajustement'
  ] as any,

  supplier: 'MSA Safety',
  cost: 35,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'daily',
  workTypes: ['construction_general', 'manufacturing', 'utilities'] as any,
  hazardTypes: ['falling_objects', 'head_impact', 'electrical_hazards'] as any
});

// =================== CASQUE ÉLECTRICIEN ===================

export const electricalHardHat = createNewEquipment({
  id: 'hard_hat_electrical_class_e_type2',
  name: 'Casque électricien Classe E Type 2',
  category: 'HEAD_PROTECTION' as any,
  subcategory: 'electrical_hats',
  description: 'Casque haute protection électrique et impact',
  
  displayName: {
    fr: 'Casque électricien Classe E Type 2',
    en: 'Class E Type 2 Electrical Hard Hat'
  },

  specifications: {
    model: 'V-Gard GREEN',
    manufacturer: 'MSA Safety',
    partNumber: '10194838',
    type: 'Type 2',
    electricalClass: 'Classe E (20000V)',
    material: 'Thermodurcissable électro-isolant',
    suspension: '6 points Fas-Trac III',
    weight: 385, // grammes
    testVoltage: 30000 // V
  },

  safetyFeatures: [
    'Protection impact latéral Type 2',
    'Isolation électrique 20kV certifiée',
    'Suspension 6 points renforcée',
    'Matériau thermodurcissable',
    'Test diélectrique individuel',
    'Résistance arc électrique'
  ] as any,

  maintenanceRequirements: [
    'Inspection électrique semestrielle',
    'Nettoyage produits non conducteurs',
    'Vérification isolation quotidienne',
    'Remplacement selon exposition',
    'Éviter contaminants conducteurs'
  ] as any,

  compatibleWith: [
    'electrical_face_shield',
    'electrical_safety_glasses',
    'non_conductive_chin_strap'
  ] as any,

  certifications: ['CSA Z94.1 Type 2 Classe E', 'ANSI Z89.1'] as any,
  standards: ['CSA Z94.1', 'ANSI Z89.1'] as any,
  
  usageInstructions: [
    'Vérifier isolation avant travaux électriques',
    'Éviter contamination par conducteurs',
    'Inspecter fissures compromettant isolation',
    'Porter avec autres EPI électriques',
    'Remplacer selon recommandations'
  ] as any,

  storageConditions: 'Lieu sec, propre, hors contaminants',
  
  inspectionCriteria: [
    'Intégrité de l\'isolation électrique',
    'Absence de fissures ou impacts',
    'Propreté surface (pas de conducteurs)',
    'État suspension et isolation',
    'Date dernier test électrique'
  ] as any,

  supplier: 'MSA Safety',
  cost: 85,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  workTypes: ['electrical_work', 'high_voltage', 'power_line'] as any,
  hazardTypes: ['electrical_shock', 'arc_flash', 'head_impact'] as any
});

// =================== CASQUE AVEC VISIÈRE ===================

export const hardHatWithVisor = createNewEquipment({
  id: 'hard_hat_integrated_face_shield',
  name: 'Casque avec visière intégrée',
  category: 'HEAD_PROTECTION' as any,
  subcategory: 'combination_protection',
  description: 'Casque avec protection faciale intégrée',
  
  displayName: {
    fr: 'Casque avec visière intégrée',
    en: 'Hard Hat with Integrated Face Shield'
  },

  specifications: {
    model: 'V-Gard 950',
    manufacturer: 'MSA Safety',
    partNumber: '10194845',
    visorMaterial: 'Polycarbonate 2mm',
    protection: 'Tête et visage combinés',
    visorCoverage: '180° protection latérale',
    weight: 485, // grammes
    adjustment: 'Visière relevable',
    opticalClass: 'Classe 1'
  },

  safetyFeatures: [
    'Protection tête et visage intégrée',
    'Visière polycarbonate résistante',
    'Mécanisme de relevage facile',
    'Protection périphérique 180°',
    'Ventilation antibuée',
    'Compatible lunettes'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage visière produits doux',
    'Inspection mécanisme relevage',
    'Vérification transparence optique',
    'Lubrification points pivots',
    'Remplacement visière si rayée'
  ] as any,

  compatibleWith: [
    'hearing_protection_under_helmet',
    'respiratory_protection_half_mask',
    'safety_glasses_under_visor'
  ] as any,

  certifications: ['CSA Z94.1', 'CSA Z94.3', 'ANSI Z87.1'] as any,
  standards: ['CSA Z94.1', 'CSA Z94.3'] as any,
  
  usageInstructions: [
    'Ajuster casque avant utilisation',
    'Régler position visière selon travail',
    'Nettoyer visière pour visibilité',
    'Relever visière si non nécessaire',
    'Inspecter mécanisme régulièrement'
  ] as any,

  storageConditions: 'Visière relevée, lieu propre et sec',
  
  inspectionCriteria: [
    'Fonctionnement mécanisme visière',
    'Transparence et propreté visière',
    'Absence rayures majeures',
    'Intégrité casque base',
    'Étanchéité points d\'articulation'
  ] as any,

  supplier: 'MSA Safety',
  cost: 125,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'daily',
  workTypes: ['grinding', 'chemical_work', 'forestry'] as any,
  hazardTypes: ['flying_particles', 'chemical_splash', 'head_impact'] as any
});

// =================== CASQUE POMPIER ===================

export const firefighterHelmet = createNewEquipment({
  id: 'firefighter_helmet_nfpa_1971',
  name: 'Casque pompier NFPA 1971',
  category: 'HEAD_PROTECTION' as any,
  subcategory: 'emergency_helmets',
  description: 'Casque de protection pompier certifié NFPA',
  
  displayName: {
    fr: 'Casque pompier NFPA 1971',
    en: 'NFPA 1971 Firefighter Helmet'
  },

  specifications: {
    model: 'F1XF',
    manufacturer: 'MSA Safety',
    partNumber: '10194852',
    standard: 'NFPA 1971-2018',
    material: 'Composite thermoplastique',
    heatResistance: 260, // °C
    impact: 'Résistant 15 joules',
    chinStrap: 'Sangle 4 points ignifuge',
    weight: 680 // grammes
  },

  safetyFeatures: [
    'Résistance chaleur extrême 260°C',
    'Protection impact renforcée',
    'Matériaux ignifuges certifiés',
    'Réflecteurs haute visibilité',
    'Système ventilation intégré',
    'Compatible équipement respiratoire'
  ] as any,

  maintenanceRequirements: [
    'Inspection après chaque intervention',
    'Nettoyage décontamination spécialisé',
    'Vérification résistance thermique',
    'Test intégrité structure',
    'Remplacement selon exposition'
  ] as any,

  compatibleWith: [
    'scba_breathing_apparatus',
    'firefighter_face_mask',
    'thermal_imaging_camera',
    'headlamp_firefighter'
  ] as any,

  certifications: ['NFPA 1971-2018', 'CGSB 155.1'] as any,
  standards: ['NFPA 1971', 'CGSB 155.1'] as any,
  
  usageInstructions: [
    'Vérifier avant chaque intervention',
    'Ajuster sangles sécuritairement',
    'Respecter limites thermiques',
    'Décontaminer après exposition',
    'Remplacer selon protocoles'
  ] as any,

  storageConditions: 'Lieu propre, sec, décontaminé',
  
  inspectionCriteria: [
    'Intégrité structure composite',
    'État des éléments réfléchissants',
    'Fonctionnement sangle mentonnière',
    'Absence de déformation thermique',
    'Propreté et décontamination'
  ] as any,

  supplier: 'MSA Safety',
  cost: 285,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'after each use',
  workTypes: ['firefighting', 'emergency_response', 'hazmat'] as any,
  hazardTypes: ['extreme_heat', 'falling_debris', 'toxic_exposure'] as any
});

// =================== EXPORT DES PROTECTIONS TÊTE ===================

export const headProtectionEquipment = [
  hardHatStandard,
  electricalHardHat,
  hardHatWithVisor,
  firefighterHelmet
];

export const headProtectionById = headProtectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default headProtectionEquipment;
