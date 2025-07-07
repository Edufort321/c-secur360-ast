// app/data/equipment/body-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise la nouvelle interface
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement (remplace createNewEquipment)
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

// =================== PROTECTION DU CORPS ===================

export const highVisibilityVest: SafetyEquipment = createNewEquipment({
  id: 'high_visibility_vest_class2',
  name: 'Veste haute visibilité classe 2',
  category: 'body-protection',
  subcategory: 'high_visibility',
  description: 'Protection haute visibilité pour travaux routiers et industriels',
  
  // ✅ Maintenant ces propriétés sont acceptées
  specifications: {
    model: 'CSA Z96 Classe 2',
    backgroundMaterial: 'Polyester fluorescent',
    retroreflectiveTape: '50mm largeur',
    colors: 'Orange, jaune-vert fluorescent'
  },
  
  certifications: ['CSA Z96-15 Classe 2', 'ANSI/ISEA 107 Type R Class 2'],
  standards: ['CSA Z96-15', 'ANSI/ISEA 107'],
  
  supplier: 'ML Kishigo',
  cost: 18,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'work_at_height'],
  hazardTypes: ['struck_by_objects', 'visibility'],
  
  isActive: true
});

export const chemicalSuit: SafetyEquipment = createNewEquipment({
  id: 'chemical_protective_suit_type3',
  name: 'Combinaison protection chimique Type 3',
  category: 'body-protection',
  subcategory: 'chemical_suit',
  description: 'Protection contre jets de liquides chimiques sous pression',
  
  specifications: {
    model: 'EN 14605 Type 3',
    material: 'Polyéthylène/Tyvek laminé',
    // Propriétés spécialisées
    seams: 'Cousues et étanchéifiées',
    coverage: 'Corps complet avec capuche'
  },
  
  certifications: ['EN 14605 Type 3', 'EN 13982-1'],
  standards: ['EN 14605', 'EN 13982-1'],
  
  supplier: 'DuPont',
  cost: 35,
  currency: 'CAD',
  lifespan: 'Single use',
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'chemical_burns'],
  
  isActive: true
});

export const weldingJacket: SafetyEquipment = createNewEquipment({
  id: 'welding_jacket_leather',
  name: 'Veste de soudage cuir',
  category: 'body-protection',
  subcategory: 'welding_clothing',
  description: 'Protection contre projections métalliques et radiations soudage',
  
  specifications: {
    material: 'Cuir de vache pleine fleur',
    thickness: '1.2-1.4mm',
    closure: 'Boutons pression métalliques',
    sleeves: 'Manches longues protection complète'
  },
  
  certifications: ['CSA Z49.1', 'ANSI Z49.1', 'EN ISO 11611 Classe A1'],
  standards: ['CSA Z49.1', 'EN ISO 11611'],
  
  supplier: 'Lincoln Electric',
  cost: 85,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'weekly',
  
  workTypes: ['welding'],
  hazardTypes: ['fire', 'radiation', 'toxic_exposure'],
  
  isActive: true
});

export const disposableCoveralls: SafetyEquipment = createNewEquipment({
  id: 'disposable_coveralls_tyvek',
  name: 'Combinaison jetable Tyvek',
  category: 'body-protection',
  subcategory: 'disposable_clothing',
  description: 'Protection jetable contre poussières et particules',
  
  specifications: {
    material: 'Tyvek polyéthylène filé-lié',
    closure: 'Fermeture éclair devant',
    elasticCuffs: 'Poignets, chevilles, capuche',
    sizes: 'M à 3XL disponibles'
  },
  
  certifications: ['EN 13982-1 Type 5'],
  standards: ['EN 13982-1'],
  
  supplier: 'DuPont',
  cost: 8,
  currency: 'CAD',
  lifespan: 'Single use',
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'environmental_cleanup'],
  hazardTypes: ['dust_particles', 'minor_contamination'],
  
  isActive: true
});

export const insulatedWorkwear: SafetyEquipment = createNewEquipment({
  id: 'insulated_workwear_winter',
  name: 'Vêtements de travail isolés hiver',
  category: 'body-protection',
  subcategory: 'thermal_protection',
  description: 'Protection thermique pour travail extérieur par temps froid',
  
  specifications: {
    insulation: 'Thinsulate ou duvet synthétique',
    outerShell: 'Nylon ripstop déperlant',
    tempRating: '-25°C confort',
    features: 'Poches multiples, capuche amovible'
  },
  
  certifications: ['CSA Z96', 'EN 342', 'ISO 11079'],
  standards: ['CSA Z96', 'EN 342'],
  
  supplier: 'Carhartt',
  cost: 150,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'emergency_response'],
  hazardTypes: ['weather_exposure', 'cold_exposure'],
  
  isActive: true
});

// =================== EXPORT PROTECTION CORPS ===================
export const bodyProtectionEquipment = [
  highVisibilityVest,
  chemicalSuit,
  weldingJacket,
  disposableCoveralls,
  insulatedWorkwear
];

export const bodyProtectionById = bodyProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default bodyProtectionEquipment;
