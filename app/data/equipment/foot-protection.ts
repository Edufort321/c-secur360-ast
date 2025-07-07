// app/data/equipment/foot-protection.ts
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

// =================== PROTECTION DES PIEDS ===================

export const steelToeBoots: SafetyEquipment = createNewEquipment({
  id: 'steel_toe_work_boots',
  name: 'Bottes de sécurité bout d\'acier',
  category: 'FOOT_PROTECTION' as any,
  subcategory: 'safety_boots',
  description: 'Protection standard avec embout acier',
  
  specifications: {
    toeProtection: 'Embout acier 200 joules',
    material: 'Cuir pleine fleur',
    sole: 'Semelle PU antidérapante',
    punctureResistance: 'Semelle anti-perforation',
    height: 'Tige 6 pouces',
    waterproof: 'Non étanche',
    sizes: '7-13 (US)',
    widths: 'M, W, EW',
    weight: 2.1  // ⭐ CORRIGÉ : 2.1 kg (la paire)
  },
  
  certifications: ['CSA Z195 Grade 1', 'ASTM F2413'],
  standards: ['CSA Z195', 'ASTM F2413'],
  
  supplier: 'Red Wing',
  cost: 185,
  currency: 'CAD',
  lifespan: '18 months',
  lifespanMonths: 18,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'excavation', 'welding'],
  hazardTypes: ['falls', 'struck_by_objects', 'punctures'],
  
  isActive: true
});

export const electricalBoots: SafetyEquipment = createNewEquipment({
  id: 'electrical_hazard_boots',
  name: 'Bottes protection électrique',
  category: 'foot-protection',
  subcategory: 'electrical_boots',
  description: 'Protection contre risques électriques',
  
  specifications: {
    toeProtection: 'Embout composite non-conducteur',
    electricalRating: '18,000 V - 60 Hz',
    material: 'Cuir traité diélectrique',
    sole: 'Semelle isolante sans métal',
    construction: 'Cousu Goodyear isolant',
    hardware: 'Œillets non-métalliques',
    sizes: '7-13 (US)',
    testVoltage: '18,000 V pendant 1 minute',
    leakage: 'Max 3.0 mA',
    weight: 2.3  // ⭐ CORRIGÉ : ~2.3 kg (la paire)
  },
  
  certifications: ['CSA Z195 ESR', 'ASTM F2413 EH'],
  standards: ['CSA Z195', 'ASTM F2413'],
  
  supplier: 'Georgia Boot',
  cost: 275,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'arc_flash', 'electrical_burns'],
  
  isActive: true
});

export const chemicalBoots: SafetyEquipment = createNewEquipment({
  id: 'chemical_resistant_boots_pvc',
  name: 'Bottes résistantes chimiques PVC',
  category: 'foot-protection',
  subcategory: 'chemical_boots',
  description: 'Protection contre produits chimiques',
  
  specifications: {
    material: 'PVC souple résistant',
    height: 'Tige 16 pouces',
    sole: 'Semelle antidérapante',
    chemicalResistance: 'Acides, bases, huiles',
    waterproof: '100% étanche',
    cleanability: 'Lavage facile',
    sizes: '7-13 (US)',
    temperature: '-40°C à +60°C',
    steelToe: 'Embout acier optionnel',
    weight: 1.8  // ⭐ CORRIGÉ : ~1.8 kg (la paire)
  },
  
  certifications: ['CSA Z195', 'ASTM F2413'],
  standards: ['CSA Z195', 'ASTM F2413'],
  
  supplier: 'Bata',
  cost: 95,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'after each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'chemical_burns', 'slips'],
  
  isActive: true
});

export const metatarsalBoots: SafetyEquipment = createNewEquipment({
  id: 'metatarsal_protection_boots',
  name: 'Bottes protection métatarsienne',
  category: 'foot-protection',
  subcategory: 'metatarsal_boots',
  description: 'Protection étendue du dessus du pied',
  
  specifications: {
    toeProtection: 'Embout composite 200J',
    metatarsalGuard: 'Protection externe métatar.',
    coverage: 'Protection jusqu\'à la cheville',
    material: 'Cuir résistant abrason',
    sole: 'Semelle Vibram antidérapante',
    punctureResistance: 'Semelle kevlar',
    sizes: '6-14 (US)',
    weight: 2.5,  // ⭐ CORRIGÉ : 2.5 kg (la paire)
    comfort: 'Semelle intérieure amovible'
  },
  
  certifications: ['CSA Z195 Grade 1', 'ASTM F2413 Mt'],
  standards: ['CSA Z195', 'ASTM F2413'],
  
  supplier: 'Timberland PRO',
  cost: 225,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'weekly',
  
  workTypes: ['construction_general', 'welding', 'heavy_machinery'],
  hazardTypes: ['struck_by_objects', 'heavy_impacts', 'foot_crushing'],
  
  isActive: true
});

export const insulatedBoots: SafetyEquipment = createNewEquipment({
  id: 'insulated_winter_boots',
  name: 'Bottes isolées grand froid',
  category: 'foot-protection',
  subcategory: 'insulated_boots',
  description: 'Protection thermique extrême',
  
  specifications: {
    insulation: 'Thinsulate 1200g',
    temperatureRating: '-40°C confort',
    material: 'Cuir et nylon imperméable',
    sole: 'Semelle Vibram Arctic Grip',
    height: 'Tige 10 pouces',
    waterproof: 'Membrane étanche',
    toeProtection: 'Embout composite isolé',
    sizes: '7-13 (US)',
    traction: 'Crampons intégrés',
    weight: 2.8  // ⭐ CORRIGÉ : ~2.8 kg (la paire)
  },
  
  certifications: ['CSA Z195', 'ASTM F2413'],
  standards: ['CSA Z195', 'ASTM F2413'],
  
  supplier: 'Baffin',
  cost: 350,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'monthly',
  
  workTypes: ['emergency_response', 'outdoor_winter'],
  hazardTypes: ['weather_exposure', 'cold_exposure', 'slips'],
  
  isActive: true
});

// =================== EXPORT PROTECTION PIEDS ===================
export const footProtectionEquipment = [
  steelToeBoots,
  electricalBoots,
  chemicalBoots,
  metatarsalBoots,
  insulatedBoots
];

export const footProtectionById = footProtectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default footProtectionEquipment;
