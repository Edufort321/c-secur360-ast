// app/data/equipment/body-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise la nouvelle interface
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement (remplace createNewEquipment)
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'BODY_PROTECTION' as any,
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

// =================== PROTECTION DU CORPS ===================

export const highVisibilityVest: SafetyEquipment = createNewEquipment({
  id: 'high_visibility_vest_class2',
  name: 'Veste haute visibilité classe 2',
  category: 'BODY_PROTECTION' as any,
  subcategory: 'high_visibility',
  description: 'Protection haute visibilité pour travaux routiers et industriels',
  
  // ✅ Maintenant ces propriétés sont acceptées
  specifications: {
    model: 'CSA Z96 Classe 2',
    backgroundMaterial: 'Polyester fluorescent',
    retroreflectiveTape: '50mm largeur',
    colors: 'Orange, jaune-vert fluorescent'
  },
  
  certifications: ['CSA Z96-15 Classe 2', 'ANSI/ISEA 107 Type R Class 2'] as any,
  standards: ['CSA Z96-15', 'ANSI/ISEA 107'] as any,
  
  supplier: 'ML Kishigo',
  cost: 18,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'work_at_height'] as any,
  hazardTypes: ['struck_by_objects', 'visibility'] as any,
  
  isActive: true
});

export const chemicalSuit: SafetyEquipment = createNewEquipment({
  id: 'chemical_protective_suit_type3',
  name: 'Combinaison protection chimique Type 3',
  category: 'BODY_PROTECTION' as any,
  subcategory: 'chemical_suit',
  description: 'Protection contre jets de liquides chimiques sous pression',
  
  specifications: {
    model: 'EN 14605 Type 3',
    material: 'Polyéthylène/Tyvek laminé',
    // Propriétés spécialisées
    seams: 'Cousues et étanchéifiées',
    coverage: 'Corps complet avec capuche'
  },
  
  certifications: ['EN 14605 Type 3', 'EN 13982-1'] as any,
  standards: ['EN 14605', 'EN 13982-1'] as any,
  
  supplier: 'DuPont',
  cost: 35,
  currency: 'CAD',
  lifespan: 'Single use',
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'] as any,
  hazardTypes: ['toxic_exposure', 'chemical_burns'] as any,
  
  isActive: true
});

export const weldingJacket: SafetyEquipment = createNewEquipment({
  id: 'welding_jacket_leather',
  name: 'Veste de soudage cuir',
  category: 'BODY_PROTECTION' as any,
  subcategory: 'welding_clothing',
  description: 'Protection contre projections métalliques et radiations soudage',
  
  specifications: {
    material: 'Cuir de vache pleine fleur',
    thickness: '1.2-1.4mm',
    closure: 'Boutons pression métalliques',
    sleeves: 'Manches longues protection complète'
  },
  
  certifications: ['CSA Z49.1', 'ANSI Z49.1', 'EN ISO 11611 Classe A1'] as any,
  standards: ['CSA Z49.1', 'EN ISO 11611'] as any,
  
  supplier: 'Lincoln Electric',
  cost: 85,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'weekly',
  
  workTypes: ['welding'] as any,
  hazardTypes: ['fire', 'radiation', 'toxic_exposure'] as any,
  
  isActive: true
});

export const disposableCoveralls: SafetyEquipment = createNewEquipment({
  id: 'disposable_coveralls_tyvek',
  name: 'Combinaison jetable Tyvek',
  category: 'BODY_PROTECTION' as any,
  subcategory: 'disposable_clothing',
  description: 'Protection jetable contre poussières et particules',
  
  specifications: {
    material: 'Tyvek polyéthylène filé-lié',
    closure: 'Fermeture éclair devant',
    elasticCuffs: 'Poignets, chevilles, capuche',
    sizes: 'M à 3XL disponibles'
  },
  
  certifications: ['EN 13982-1 Type 5'] as any,
  standards: ['EN 13982-1'] as any,
  
  supplier: 'DuPont',
  cost: 8,
  currency: 'CAD',
  lifespan: 'Single use',
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'environmental_cleanup'] as any,
  hazardTypes: ['dust_particles', 'minor_contamination'] as any,
  
  isActive: true
});

export const insulatedWorkwear: SafetyEquipment = createNewEquipment({
  id: 'insulated_workwear_winter',
  name: 'Vêtements de travail isolés hiver',
  category: 'BODY_PROTECTION' as any,
  subcategory: 'thermal_protection',
  description: 'Protection thermique pour travail extérieur par temps froid',
  
  specifications: {
    insulation: 'Thinsulate ou duvet synthétique',
    outerShell: 'Nylon ripstop déperlant',
    tempRating: '-25°C confort',
    features: 'Poches multiples, capuche amovible'
  },
  
  certifications: ['CSA Z96', 'EN 342', 'ISO 11079'] as any,
  standards: ['CSA Z96', 'EN 342'] as any,
  
  supplier: 'Carhartt',
  cost: 150,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'emergency_response'] as any,
  hazardTypes: ['weather_exposure', 'cold_exposure'] as any,
  
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
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default bodyProtectionEquipment;
