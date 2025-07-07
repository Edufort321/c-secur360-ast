// app/data/equipment/eye-protection.ts
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

// =================== PROTECTION OCULAIRE ===================

export const safetyGlasses: SafetyEquipment = createNewEquipment({
  id: 'safety_glasses_wraparound',
  name: 'Lunettes de sécurité enveloppantes',
  category: 'eye-protection',
  subcategory: 'safety_glasses',
  description: 'Protection oculaire de base polyvalente',
  
  specifications: {
    lensType: 'Polycarbonate clair',
    impactRating: 'ANSI Z87.1+ haute vélocité',
    uvProtection: '99.9% UV-A/UV-B',
    coatings: 'Anti-rayures, anti-buée',
    sideShields: 'Protection latérale intégrée',
    nosebridge: 'Pont nasal ajustable',
    temples: 'Branches réglables',
    weight: 0.025  // ⭐ CORRIGÉ : 25 grammes = 0.025 kg
  },
  
  certifications: ['CSA Z94.3', 'ANSI Z87.1+'],
  standards: ['CSA Z94.3', 'ANSI Z87.1'],
  
  supplier: '3M',
  cost: 8,
  currency: 'CAD',
  lifespan: '1 year',
  lifespanMonths: 12,
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'excavation'],
  hazardTypes: ['flying_particles', 'dust', 'chemical_splash'],
  
  isActive: true
});

export const safetyGoggles: SafetyEquipment = createNewEquipment({
  id: 'safety_goggles_chemical',
  name: 'Lunettes étanches protection chimique',
  category: 'eye-protection',
  subcategory: 'chemical_goggles',
  description: 'Protection hermétique contre vapeurs chimiques',
  
  specifications: {
    sealType: 'Joint néoprène hermétique',
    lensType: 'Polycarbonate résistant chimique',
    ventilation: 'Valves anti-buée indirectes',
    chemicalResistance: 'Acides, bases, solvants',
    fogResistance: 'Traitement anti-buée',
    headstrap: 'Sangle élastique ajustable',
    overGlasses: 'Compatible lunettes prescription',
    cleanability: 'Nettoyage facile',
    weight: 0.085  // ⭐ CORRIGÉ : ~85 grammes = 0.085 kg
  },
  
  certifications: ['CSA Z94.3', 'ANSI Z87.1', 'EN 166'],
  standards: ['CSA Z94.3', 'EN 166'],
  
  supplier: 'Uvex',
  cost: 18,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'chemical_burns', 'vapors'],
  
  isActive: true
});

export const weldingGoggles: SafetyEquipment = createNewEquipment({
  id: 'welding_goggles_shade5',
  name: 'Lunettes de soudage teinte 5',
  category: 'eye-protection',
  subcategory: 'welding_goggles',
  description: 'Protection soudage/oxycoupage léger',
  
  specifications: {
    shadeLevel: 'DIN 5 fixe',
    lensType: 'Verre teinté résistant impact',
    application: 'Soudage gaz, brasage, oxycoupage',
    sideShields: 'Protection latérale renforcée',
    headstrap: 'Sangle élastique confortable',
    ventilation: 'Évents latéraux filtrés',
    replacement: 'Verres de rechange disponibles',
    comfort: 'Coussinets mousse',
    weight: 0.12  // ⭐ CORRIGÉ : ~120 grammes = 0.12 kg
  },
  
  certifications: ['CSA Z94.3', 'ANSI Z87.1', 'EN 175'],
  standards: ['CSA Z94.3', 'EN 175'],
  
  supplier: 'Jackson Safety',
  cost: 25,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  
  workTypes: ['welding', 'cutting_torch'],
  hazardTypes: ['welding_radiation', 'infrared_radiation', 'sparks'],
  
  isActive: true
});

export const faceShield: SafetyEquipment = createNewEquipment({
  id: 'face_shield_polycarbonate',
  name: 'Écran facial polycarbonate',
  category: 'eye-protection',
  subcategory: 'face_shield',
  description: 'Protection faciale complète',
  
  specifications: {
    material: 'Polycarbonate 1.0mm',
    coverage: 'Protection frontale complète',
    opticalClass: 'Classe 1 - Distorsion minimale',
    thickness: '1.0mm résistant impact',
    headgear: 'Serre-tête réglable',
    flipUp: 'Relevable pour visibilité',
    replacement: 'Écrans remplaçables',
    compatibility: 'Compatible lunettes dessous',
    weight: 0.15  // ⭐ CORRIGÉ : ~150 grammes = 0.15 kg
  },
  
  certifications: ['CSA Z94.3', 'ANSI Z87.1+'],
  standards: ['CSA Z94.3', 'ANSI Z87.1'],
  
  supplier: 'Honeywell',
  cost: 35,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  
  workTypes: ['grinding', 'chemical_handling'],
  hazardTypes: ['flying_particles', 'chemical_splash', 'sparks'],
  
  isActive: true
});

export const laserSafetyGlasses: SafetyEquipment = createNewEquipment({
  id: 'laser_safety_glasses_1064nm',
  name: 'Lunettes protection laser 1064nm',
  category: 'eye-protection',
  subcategory: 'laser_safety',
  description: 'Protection spécialisée contre lasers',
  
  specifications: {
    wavelength: '1064nm (Nd:YAG)',
    opticalDensity: 'OD 7+ à 1064nm',
    laserType: 'Classe 4 Nd:YAG',
    transmission: '20% lumière visible',
    material: 'Polycarbonate filtrant',
    sideProtection: 'Coques latérales étanches',
    certification: 'Marquage CE laser',
    testStandard: 'EN 207',
    weight: 0.045  // ⭐ CORRIGÉ : ~45 grammes = 0.045 kg
  },
  
  certifications: ['EN 207', 'FDA Laser Safety'],
  standards: ['EN 207', 'IEC 60825-1'],
  
  supplier: 'Laservision',
  cost: 285,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['laser_operations', 'research'],
  hazardTypes: ['laser_radiation', 'eye_damage', 'retinal_burns'],
  
  isActive: true
});

// =================== EXPORT PROTECTION OCULAIRE ===================
export const eyeProtectionEquipment = [
  safetyGlasses,
  safetyGoggles,
  weldingGoggles,
  faceShield,
  laserSafetyGlasses
];

export const eyeProtectionById = eyeProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default eyeProtectionEquipment;
