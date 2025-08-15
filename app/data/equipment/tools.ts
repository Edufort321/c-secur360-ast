// app/data/equipment/tools.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'TOOLS' as any,
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== OUTILS ÉLECTRIQUES ===================

export const cordlessHammer = createNewEquipment({
  id: 'cordless_hammer_drill',
  name: 'Perceuse à percussion sans fil',
  category: 'TOOLS' as any,
  subcategory: 'power_tools',
  description: 'Perceuse à percussion sans fil avec système de sécurité',
  
  displayName: {
    fr: 'Perceuse à percussion sans fil',
    en: 'Cordless Hammer Drill'
  },

  specifications: {
    model: 'DHP484',
    manufacturer: 'Makita',
    partNumber: 'DHP484Z',
    voltage: '18V',
    maxTorque: '54 Nm',
    weight: 1.8,
    chuckSize: '13mm',
    batteryType: 'Li-ion'
  },

  safetyFeatures: [
    'Système de débrayage automatique',
    'Éclairage LED intégré',
    'Poignée ergonomique antidérapante',
    'Protection contre la surcharge',
    'Gâchette de sécurité'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage après chaque utilisation',
    'Vérification des brosses carbone (500h)',
    'Graissage du mandrin (mensuel)',
    'Inspection des câbles et connexions',
    'Test de fonctionnement (hebdomadaire)'
  ] as any,

  compatibleWith: [
    'hearing_protection_class4',
    'safety_glasses_z87',
    'work_gloves_cut_resistant',
    'steel_toe_boots_csa'
  ] as any,

  certifications: ['CSA', 'UL', 'CE'] as any,
  
  usageInstructions: [
    'Vérifier la charge de la batterie avant utilisation',
    'Porter les EPI appropriés',
    'Sélectionner le bon mode (perçage/percussion)',
    'Maintenir une prise ferme',
    'Éviter les surcharges prolongées'
  ] as any,

  storageConditions: 'Lieu sec, température 0-40°C, batterie stockée séparément',
  
  inspectionCriteria: [
    'État du mandrin et mécanisme de serrage',
    'Fonctionnement des boutons et gâchette',
    'Intégrité du boîtier et poignée',
    'Performance de la batterie',
    'Niveau sonore dans les limites'
  ] as any
});

// =================== OUTILS MANUELS ===================

export const adjustableWrench = createNewEquipment({
  id: 'adjustable_wrench_250mm',
  name: 'Clé à molette ajustable 250mm',
  category: 'TOOLS' as any,
  subcategory: 'hand_tools',
  description: 'Clé à molette professionnelle avec mâchoires trempées',
  
  displayName: {
    fr: 'Clé à molette ajustable 250mm',
    en: 'Adjustable Wrench 250mm'
  },

  specifications: {
    model: '87-250',
    manufacturer: 'Stanley',
    partNumber: 'STMT87250-8',
    length: '250mm',
    maxOpening: '32mm',
    weight: 0.4,
    material: 'Acier au chrome vanadium',
    finish: 'Chrome poli'
  },

  safetyFeatures: [
    'Mâchoires trempées et rectifiées',
    'Poignée ergonomique antidérapante',
    'Graduation claire et précise',
    'Mécanisme de réglage fluide',
    'Résistance à la corrosion'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage après utilisation',
    'Lubrification du mécanisme (mensuel)',
    'Vérification de l\'usure des mâchoires',
    'Contrôle de la précision d\'ouverture',
    'Stockage dans un lieu sec'
  ] as any,

  compatibleWith: [
    'work_gloves_mechanic',
    'safety_glasses_basic',
    'tool_belt_leather'
  ] as any,

  certifications: ['ISO 6787', 'DIN 3117'] as any,
  
  usageInstructions: [
    'Sélectionner la bonne ouverture',
    'Positionner correctement sur l\'écrou',
    'Tourner dans le sens approprié',
    'Éviter les efforts excessifs',
    'Nettoyer après utilisation'
  ] as any,

  storageConditions: 'Lieu sec, protection contre les chocs',
  
  inspectionCriteria: [
    'État des mâchoires (usure, ébréchures)',
    'Fonctionnement du mécanisme d\'ajustement',
    'Précision des graduations',
    'État de la poignée',
    'Absence de fissures ou déformation'
  ] as any
});

// =================== ÉQUIPEMENTS DE MESURE ===================

export const digitalMultimeter = createNewEquipment({
  id: 'digital_multimeter_600v',
  name: 'Multimètre numérique 600V',
  category: 'TOOLS' as any,
  subcategory: 'measurement',
  description: 'Multimètre numérique professionnel pour mesures électriques',
  
  displayName: {
    fr: 'Multimètre numérique 600V',
    en: 'Digital Multimeter 600V'
  },

  specifications: {
    model: 'FLK-117',
    manufacturer: 'Fluke',
    partNumber: '117',
    maxVoltage: '600V AC/DC',
    accuracy: '±0.5%',
    displayCount: 6000,
    weight: 0.45,
    batteryLife: '400 heures',
    safetyCategory: 'CAT III 600V'
  },

  safetyFeatures: [
    'Protection contre les surcharges',
    'Fusibles de sécurité',
    'Sondes isolées',
    'Affichage de polarité automatique',
    'Indicateur de batterie faible',
    'Conformité CAT III'
  ] as any,

  maintenanceRequirements: [
    'Vérification de l\'étalonnage (annuel)',
    'Remplacement des fusibles si nécessaire',
    'Nettoyage des contacts',
    'Test de fonctionnement (mensuel)',
    'Remplacement de la batterie'
  ] as any,

  compatibleWith: [
    'electrical_safety_gloves_class0',
    'safety_glasses_arc_rated',
    'hard_hat_electrical_class_e'
  ] as any,

  certifications: ['UL', 'CSA', 'CE', 'CAT III'] as any,
  
  usageInstructions: [
    'Vérifier l\'état des sondes avant utilisation',
    'Sélectionner la bonne fonction',
    'Respecter les limites de tension',
    'Porter les EPI électriques appropriés',
    'Éteindre après utilisation'
  ] as any,

  storageConditions: 'Étui de protection, température -10 à 50°C',
  
  inspectionCriteria: [
    'État des sondes et câbles',
    'Fonctionnement de l\'affichage',
    'Précision des mesures',
    'État des fusibles de protection',
    'Intégrité du boîtier'
  ] as any
});

// =================== OUTILS DE COUPE ===================

export const anglegrinder = createNewEquipment({
  id: 'angle_grinder_125mm',
  name: 'Meuleuse d\'angle 125mm',
  category: 'TOOLS' as any,
  subcategory: 'cutting_tools',
  description: 'Meuleuse d\'angle électrique avec protection renforcée',
  
  displayName: {
    fr: 'Meuleuse d\'angle 125mm',
    en: 'Angle Grinder 125mm'
  },

  specifications: {
    model: 'GWS 7-125',
    manufacturer: 'Bosch',
    partNumber: '0601388108',
    discDiameter: '125mm',
    power: '720W',
    noLoadSpeed: '11000 rpm',
    weight: 1.9,
    spindleThread: 'M14'
  },

  safetyFeatures: [
    'Carter de protection ajustable',
    'Poignée auxiliaire',
    'Système de démarrage progressif',
    'Protection contre les redémarrages',
    'Interrupteur de sécurité'
  ] as any,

  maintenanceRequirements: [
    'Vérification du disque avant chaque utilisation',
    'Remplacement des balais carbone (selon usage)',
    'Nettoyage des orifices d\'aération',
    'Lubrification des roulements (selon fabricant)',
    'Inspection du câble d\'alimentation'
  ] as any,

  compatibleWith: [
    'face_shield_grinding',
    'hearing_protection_class5',
    'cut_resistant_gloves_level5',
    'safety_boots_metatarsal',
    'dust_mask_p2'
  ] as any,

  certifications: ['CE', 'CSA', 'UL'] as any,
  
  usageInstructions: [
    'Vérifier l\'état et la fixation du disque',
    'Porter tous les EPI requis',
    'Maintenir une prise ferme',
    'Éviter les blocages de disque',
    'Laisser refroidir avant rangement'
  ] as any,

  storageConditions: 'Lieu sec, disque retiré si stockage prolongé',
  
  inspectionCriteria: [
    'État du disque (fissures, usure)',
    'Fonctionnement du carter de protection',
    'État de la poignée auxiliaire',
    'Performance du moteur',
    'Intégrité du câble électrique'
  ] as any
});

// =================== EXPORT DES OUTILS ===================

export const toolsEquipment = [
  cordlessHammer,
  adjustableWrench,
  digitalMultimeter,
  anglegrinder
];

export default toolsEquipment;
