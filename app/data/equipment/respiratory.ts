// app/data/equipment/respiratory.ts
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

// =================== PROTECTION RESPIRATOIRE ===================

export const n95Respirator: SafetyEquipment = createNewEquipment({
  id: 'n95_filtering_facepiece',
  name: 'Masque filtrant N95 jetable',
  category: 'respiratory-protection',
  subcategory: 'disposable_respirator',
  description: 'Protection contre particules non huileuses',
  
  specifications: {
    filterEfficiency: '95% particules 0.3 microns',
    particleType: 'Particules solides non huileuses',
    breathingResistance: 'Max 35 mmH2O',
    material: 'Non-tissé électrostatique',
    noseclip: 'Barrette nasale ajustable',
    straps: 'Élastiques tour de tête',
    sizes: 'Taille unique',
    singleUse: 'Usage unique 8 heures max',
    weight: 0.015  // ⭐ CORRIGÉ : ~15g = 0.015 kg
  },
  
  certifications: ['NIOSH N95', 'Health Canada'],
  standards: ['42 CFR 84', 'CSA Z94.4'],
  
  supplier: '3M',
  cost: 2.5,
  currency: 'CAD',
  lifespan: 'Single use',
  inspectionFrequency: 'before each use',
  
  workTypes: ['construction_general', 'environmental_cleanup'],
  hazardTypes: ['dust_particles', 'biological_hazards'],
  
  isActive: true
});

export const halfMaskReusable: SafetyEquipment = createNewEquipment({
  id: 'half_mask_reusable_p100',
  name: 'Demi-masque réutilisable P100',
  category: 'respiratory-protection',
  subcategory: 'half_mask',
  description: 'Protection haute efficacité réutilisable',
  
  specifications: {
    filterType: 'Cartouches P100 remplaçables',
    efficiency: '99.97% particules 0.3 microns',
    maskMaterial: 'Silicone hypoallergénique',
    sealType: 'Joint facial hermétique',
    exhalationValve: 'Valve expiration centrale',
    sizes: 'S, M, L',
    cartridgeLife: 'Variable selon exposition',
    maintenance: 'Nettoyage après usage',
    weight: 0.25  // ⭐ CORRIGÉ : ~250g = 0.25 kg
  },
  
  certifications: ['NIOSH P100', 'CSA Z94.4'],
  standards: ['42 CFR 84', 'CSA Z94.4'],
  
  supplier: 'Moldex',
  cost: 45,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'asbestos', 'silica'],
  
  isActive: true
});

export const fullFaceMask: SafetyEquipment = createNewEquipment({
  id: 'full_face_mask_organic_vapor',
  name: 'Masque complet vapeurs organiques',
  category: 'respiratory-protection',
  subcategory: 'full_face_mask',
  description: 'Protection respiratoire et oculaire',
  
  specifications: {
    protection: 'Respiratoire + oculaire combinée',
    cartridgeType: 'Vapeurs organiques + P100',
    lensType: 'Polycarbonate résistant impact',
    fieldOfView: 'Vision périphérique étendue',
    speechDiaphragm: 'Membrane communication',
    headHarness: 'Harnais 5 points ajustable',
    sizes: 'S, M, L',
    sealMaterial: 'Silicone facial',
    weight: 0.65  // ⭐ CORRIGÉ : ~650g = 0.65 kg
  },
  
  certifications: ['NIOSH', 'CSA Z94.4', 'ANSI Z87.1'],
  standards: ['42 CFR 84', 'CSA Z94.4'],
  
  supplier: 'MSA',
  cost: 285,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'chemical_vapors', 'eye_irritation'],
  
  isActive: true
});

export const scbaApparatus: SafetyEquipment = createNewEquipment({
  id: 'scba_30_minute_carbon',
  name: 'Appareil respiratoire autonome 30 min',
  category: 'respiratory-protection',
  subcategory: 'scba',
  description: 'Air respirable autonome haute protection',
  
  specifications: {
    airSupply: '30 minutes autonomie',
    cylinderMaterial: 'Composite carbone',
    pressure: '300 bar (4500 psi)',
    weight: 7.2,  // ⭐ CORRIGÉ : 7.2 kg total
    regulator: 'Détendeur à la demande',
    alarms: 'Alarme basse pression',
    facepiece: 'Masque complet inclus',
    backplate: 'Plaque dorsale ergonomique'
  },
  
  certifications: ['NIOSH', 'NFPA 1981', 'CSA Z94.4'],
  standards: ['42 CFR 84', 'NFPA 1981'],
  
  supplier: 'Scott Safety',
  cost: 3500,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'monthly',
  
  workTypes: ['emergency_response', 'confined_space'],
  hazardTypes: ['asphyxiation', 'oxygen_deficiency', 'unknown_atmosphere'],
  
  isActive: true
});

export const suppliedAirHose: SafetyEquipment = createNewEquipment({
  id: 'supplied_air_respirator_hose',
  name: 'Respirateur à adduction d\'air',
  category: 'respiratory-protection',
  subcategory: 'supplied_air',
  description: 'Air respirable via ligne d\'alimentation',
  
  specifications: {
    hoseLength: '25 pieds (7.6m) standard',
    airSource: 'Compresseur air respirable',
    flowRate: '6-15 CFM ajustable',
    coolingTube: 'Tube vortex refroidissement',
    beltMounted: 'Régulateur ceinture',
    facepiece: 'Demi ou masque complet',
    mobility: 'Mobilité dans rayon action',
    backup: 'Bouteille secours optionnelle',
    weight: 3.5  // ⭐ CORRIGÉ : ~3.5 kg (système complet)
  },
  
  certifications: ['NIOSH Type C', 'CSA Z94.4'],
  standards: ['42 CFR 84', 'CSA Z94.4'],
  
  supplier: 'Allegro',
  cost: 650,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  
  workTypes: ['confined_space', 'environmental_cleanup'],
  hazardTypes: ['asphyxiation', 'toxic_exposure', 'oxygen_deficiency'],
  
  isActive: true
});

// =================== EXPORT PROTECTION RESPIRATOIRE ===================
export const respiratoryEquipment = [
  n95Respirator,
  halfMaskReusable,
  fullFaceMask,
  scbaApparatus,
  suppliedAirHose
];

export const respiratoryById = respiratoryEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default respiratoryEquipment;
