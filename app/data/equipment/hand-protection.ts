// app/data/equipment/hand-protection.ts
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

// =================== PROTECTION DES MAINS ===================

export const mechanicalGloves: SafetyEquipment = createNewEquipment({
  id: 'mechanical_work_gloves_leather',
  name: 'Gants de travail mécaniques cuir',
  category: 'HAND_PROTECTION' as any,
  subcategory: 'mechanical_gloves',
  description: 'Protection mécanique générale en cuir',
  
  specifications: {
    material: 'Cuir de vache pleine fleur',
    palm: 'Cuir renforcé',
    back: 'Cuir souple respirant',
    cuff: 'Manchette 10cm sécurisée',
    lining: 'Doublure coton',
    sizes: 'S, M, L, XL, XXL',
    dexterity: 'Niveau 3/5',
    grip: 'Excellente préhension'
  },
  
  certifications: ['CSA Z142', 'ANSI/ISEA 105'],
  standards: ['CSA Z142', 'ANSI/ISEA 105'],
  
  supplier: 'Wells Lamont',
  cost: 18,
  currency: 'CAD',
  lifespan: '6 months',
  lifespanMonths: 6,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'excavation', 'welding'],
  hazardTypes: ['cuts_lacerations', 'abrasion', 'punctures'],
  
  isActive: true
});

export const electricalGloves: SafetyEquipment = createNewEquipment({
  id: 'electrical_insulating_gloves_class2',
  name: 'Gants isolants électriques Classe 2',
  category: 'hand-protection',
  subcategory: 'electrical_gloves',
  description: 'Protection électrique jusqu\'à 17,000V',
  
  specifications: {
    voltage: '17,000 V AC / 25,500 V DC',
    material: 'Caoutchouc naturel isolant',
    thickness: '1.14mm minimum',
    testVoltage: '20,000 V AC',
    proofTest: '10,000 V AC',
    leakageCurrent: 'Max 14 mA',
    sizes: '7, 8, 9, 10, 11, 12',
    length: '356mm (14 pouces)'
  },
  
  certifications: ['CSA Z462', 'ASTM D120 Classe 2', 'IEC 60903'],
  standards: ['CSA Z462', 'ASTM D120', 'IEC 60903'],
  
  supplier: 'Salisbury',
  cost: 185,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'arc_flash', 'electrical_burns'],
  
  isActive: true
});

export const chemicalGloves: SafetyEquipment = createNewEquipment({
  id: 'chemical_resistant_gloves_nitrile',
  name: 'Gants résistants chimiques nitrile',
  category: 'hand-protection',
  subcategory: 'chemical_gloves',
  description: 'Protection contre produits chimiques variés',
  
  specifications: {
    material: 'Nitrile butadiène',
    thickness: '0.38mm (15 mil)',
    length: '330mm',
    finish: 'Texturé pour préhension',
    permeation: 'Résistance évaluée',
    chemicals: 'Huiles, graisses, solvants',
    sizes: 'XS, S, M, L, XL',
    cuff: 'Manchette droite'
  },
  
  certifications: ['ANSI/ISEA 105', 'EN 374'],
  standards: ['ANSI/ISEA 105', 'EN 374'],
  
  supplier: 'Ansell',
  cost: 12,
  currency: 'CAD',
  lifespan: '3 months',
  lifespanMonths: 3,
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'chemical_burns', 'skin_absorption'],
  
  isActive: true
});

export const cutResistantGloves: SafetyEquipment = createNewEquipment({
  id: 'cut_resistant_gloves_level5',
  name: 'Gants anti-coupure Niveau 5',
  category: 'hand-protection',
  subcategory: 'cut_resistant',
  description: 'Protection maximale contre les coupures',
  
  specifications: {
    cutLevel: 'ANSI A5 - Protection maximale',
    material: 'UHMWPE + fibres d\'acier',
    coating: 'Polyuréthane paume/doigts',
    thickness: '13 gauge',
    dexterity: 'Niveau 4/5',
    washable: 'Lavable machine',
    sizes: 'XS, S, M, L, XL, XXL',
    grip: 'Préhension sèche/humide'
  },
  
  certifications: ['ANSI/ISEA 105 Level A5', 'EN 388:2016'],
  standards: ['ANSI/ISEA 105', 'EN 388'],
  
  supplier: 'HexArmor',
  cost: 35,
  currency: 'CAD',
  lifespan: '4 months',
  lifespanMonths: 4,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'sheet_metal', 'glass_handling'],
  hazardTypes: ['cuts_lacerations', 'sharp_objects', 'blade_injuries'],
  
  isActive: true
});

export const weldingGloves: SafetyEquipment = createNewEquipment({
  id: 'welding_gloves_leather_kevlar',
  name: 'Gants de soudage cuir/Kevlar',
  category: 'hand-protection',
  subcategory: 'welding_gloves',
  description: 'Protection soudage haute température',
  
  specifications: {
    material: 'Cuir de vache + Kevlar',
    heatResistance: 'Jusqu\'à 480°C',
    length: '356mm (14 pouces)',
    reinforcement: 'Double paume et doigts',
    seams: 'Coutures Kevlar',
    lining: 'Doublure aramide',
    sizes: 'M, L, XL, XXL',
    dexterity: 'Niveau 2/5 - Soudage'
  },
  
  certifications: ['CSA Z49.1', 'EN 12477 Type A'],
  standards: ['CSA Z49.1', 'EN 12477'],
  
  supplier: 'Lincoln Electric',
  cost: 45,
  currency: 'CAD',
  lifespan: '8 months',
  lifespanMonths: 8,
  inspectionFrequency: 'weekly',
  
  workTypes: ['welding', 'cutting_torch', 'hot_work'],
  hazardTypes: ['fire', 'metal_splatter', 'thermal_burns'],
  
  isActive: true
});

// =================== EXPORT PROTECTION MAINS ===================
export const handProtectionEquipment = [
  mechanicalGloves,
  electricalGloves,
  chemicalGloves,
  cutResistantGloves,
  weldingGloves
];

export const handProtectionById = handProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default handProtectionEquipment;
