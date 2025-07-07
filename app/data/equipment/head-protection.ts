// app/data/equipment/head-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise la nouvelle interface
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: Partial<SafetyEquipment>): SafetyEquipment => {
  return {
    // Valeurs par défaut
    certifications: [],
    standards: [],
    isActive: true,
    createdDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    workTypes: [],
    hazardTypes: [],
    supplier: 'Supplier TBD',
    cost: 0,
    currency: 'CAD',
    lifespan: '1 year',
    inspectionFrequency: 'monthly',
    // Merge avec les propriétés passées
    ...base
  } as SafetyEquipment;
};

// =================== PROTECTION DE LA TÊTE ===================

export const hardHatStandard: SafetyEquipment = createNewEquipment({
  id: 'hard_hat_standard_csa',
  name: 'Casque de sécurité standard CSA',
  category: 'head-protection',
  subcategory: 'hard_hat',
  description: 'Casque de protection contre les chocs et impacts',
  
  specifications: {
    type: 'Type 1 - Impact vertical',
    electricalClass: 'Classe G (General)',
    material: 'HDPE (polyéthylène haute densité)',
    suspensionType: 'Suspension à crémaillère',
    ventilation: 'Non ventilé',
    chinStrap: 'Compatible',
    colors: 'Blanc, jaune, orange, bleu'
  },
  
  certifications: ['CSA Z94.1', 'ANSI Z89.1 Type I Class G'],
  standards: ['CSA Z94.1', 'ANSI Z89.1'],
  
  supplier: 'MSA Safety',
  cost: 25,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'excavation', 'work_at_height'],
  hazardTypes: ['falls', 'struck_by_objects', 'head_injuries'],
  
  isActive: true
});

export const hardHatElectrical: SafetyEquipment = createNewEquipment({
  id: 'hard_hat_electrical_class_e',
  name: 'Casque électrique Classe E',
  category: 'head-protection',
  subcategory: 'electrical_hard_hat',
  description: 'Protection électrique jusqu\'à 20,000V',
  
  specifications: {
    type: 'Type 1 - Impact vertical',
    electricalClass: 'Classe E (Electrical)',
    voltageRating: '20,000 V AC',
    material: 'Thermodurcissable isolant',
    suspensionType: 'Suspension isolante',
    testVoltage: '30,000 V',
    leakageCurrent: 'Max 9.0 mA'
  },
  
  certifications: ['CSA Z94.1 Classe E', 'ANSI Z89.1 Type I Class E'],
  standards: ['CSA Z94.1', 'ANSI Z89.1'],
  
  supplier: 'Salisbury',
  cost: 85,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'arc_flash', 'electrical_burns'],
  
  isActive: true
});

export const bumpCap: SafetyEquipment = createNewEquipment({
  id: 'bump_cap_lightweight',
  name: 'Casquette anti-choc légère',
  category: 'head-protection',
  subcategory: 'bump_cap',
  description: 'Protection légère contre chocs mineurs',
  
  specifications: {
    type: 'Casquette anti-choc',
    material: 'ABS léger',
    weight: '85 grammes',
    ventilation: 'Ventilation intégrée',
    adjustment: 'Tour de tête ajustable',
    style: 'Style casquette baseball',
    sizes: 'S/M/L/XL'
  },
  
  certifications: ['EN 812'],
  standards: ['EN 812'],
  
  supplier: 'JSP Safety',
  cost: 35,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'weekly',
  
  workTypes: ['telecom_installation', 'maintenance_light'],
  hazardTypes: ['minor_head_impacts', 'scrapes'],
  
  isActive: true
});

export const weldingHelmet: SafetyEquipment = createNewEquipment({
  id: 'welding_helmet_auto_darkening',
  name: 'Masque de soudage auto-obscurcissant',
  category: 'head-protection',
  subcategory: 'welding_helmet',
  description: 'Protection complète pour soudage avec filtre auto',
  
  specifications: {
    filterType: 'Auto-obscurcissant LCD',
    shadeRange: 'DIN 4/5-8/9-13',
    reactionTime: '0.1 milliseconde',
    lightToShade: 'DIN 4',
    batteryLife: '3000 heures',
    sensors: '2 capteurs d\'arc',
    viewingArea: '100 x 50 mm'
  },
  
  certifications: ['CSA Z94.3', 'ANSI Z87.1', 'EN 379'],
  standards: ['CSA Z94.3', 'EN 379'],
  
  supplier: '3M Speedglas',
  cost: 450,
  currency: 'CAD',
  lifespan: '7 years',
  lifespanMonths: 84,
  inspectionFrequency: 'before each use',
  
  workTypes: ['welding', 'cutting_torch'],
  hazardTypes: ['welding_radiation', 'arc_flash', 'eye_damage'],
  
  isActive: true
});

export const climberHelmet: SafetyEquipment = createNewEquipment({
  id: 'climbing_helmet_mountaineering',
  name: 'Casque d\'escalade et travail en hauteur',
  category: 'head-protection',
  subcategory: 'climbing_helmet',
  description: 'Protection multi-impact pour travail vertical',
  
  specifications: {
    type: 'Multi-impact MIPS',
    material: 'Polycarbonate + EPS',
    weight: '350 grammes',
    ventilation: '14 évents aération',
    headlamp: 'Clips frontaux et latéraux',
    chinStrap: 'Sangle mentonnière ajustable',
    certifications: 'CE EN 12492, UIAA 106'
  },
  
  certifications: ['CE EN 12492', 'UIAA 106'],
  standards: ['EN 12492', 'UIAA 106'],
  
  supplier: 'Petzl',
  cost: 125,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  
  workTypes: ['work_at_height', 'tower_climbing', 'rescue'],
  hazardTypes: ['falls', 'struck_by_objects', 'head_injuries'],
  
  isActive: true
});

// =================== EXPORT PROTECTION TÊTE ===================
export const headProtectionEquipment = [
  hardHatStandard,
  hardHatElectrical,
  bumpCap,
  weldingHelmet,
  climberHelmet
];

export const headProtectionById = headProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default headProtectionEquipment;
