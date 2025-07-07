// app/data/equipment/electrical.ts
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

// =================== ÉQUIPEMENTS ÉLECTRIQUES ===================

export const digitalMultimeter: SafetyEquipment = createNewEquipment({
  id: 'digital_multimeter_cat3',
  name: 'Multimètre numérique CAT III',
  category: 'electrical-protection',
  subcategory: 'test_equipment',
  description: 'Mesure tension, courant, résistance sécurisée',
  
  // ✅ Maintenant ces propriétés sont acceptées
  specifications: {
    model: 'CSA C22.2 No. 61010-1',
    voltageRange: '12V AC/DC à 1000V AC/DC',
    accuracy: '±2% + 3 digits',
    safety: 'CAT III 1000V, CAT IV 600V',
    display: 'LCD avec rétroéclairage',
    autoRange: 'Gamme automatique',
    dataHold: 'Maintien de données',
    batteryLife: '200 heures'
  },
  
  certifications: ['CSA C22.2', 'UL Listed', 'CE'],
  standards: ['IEC 61010-1', 'CSA C22.2'],
  
  supplier: 'Fluke',
  cost: 285,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'annually',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'arc_flash'],
  
  isActive: true
});

export const voltageDetector: SafetyEquipment = createNewEquipment({
  id: 'non_contact_voltage_detector',
  name: 'Détecteur de tension sans contact',
  category: 'electrical-protection',
  subcategory: 'voltage_detector',
  description: 'Détection sécurisée présence tension',
  
  specifications: {
    voltageRange: '80V AC à 1000V AC',
    frequency: '50/60 Hz',
    indication: 'LED rouge + alarme sonore',
    sensitivity: 'Haute sensibilité ajustable',
    selfTest: 'Test automatique au démarrage',
    batteryType: '2x AAA',
    batteryLife: '1000 heures',
    safety: 'CAT IV 1000V'
  },
  
  certifications: ['CSA C22.2', 'UL Listed'],
  standards: ['IEC 61243-3', 'CSA C22.2'],
  
  supplier: 'Klein Tools',
  cost: 45,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'arc_flash'],
  
  isActive: true
});

export const arcFlashSuit: SafetyEquipment = createNewEquipment({
  id: 'arc_flash_protection_suit',
  name: 'Combinaison protection arc électrique',
  category: 'electrical-protection',
  subcategory: 'arc_flash_suit',
  description: 'Protection complète contre arc électrique',
  
  specifications: {
    arcRating: '40 cal/cm² ATPV',
    material: 'Nomex IIIA + Kevlar',
    components: 'Veste, pantalon, cagoule, gants',
    flameResistant: 'Ignifuge permanent',
    breathability: 'Membrane respirante',
    visibility: 'Bandes réfléchissantes',
    sizes: 'S à 4XL',
    weight: 2.8  // ⭐ CORRIGÉ : Number au lieu de string
  },
  
  certifications: ['CSA Z462', 'NFPA 70E', 'ASTM F1959'],
  standards: ['CSA Z462', 'NFPA 70E', 'IEEE 1584'],
  
  supplier: 'Salisbury',
  cost: 1850,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['arc_flash', 'electrical_burns', 'fire'],
  
  isActive: true
});

export const insulatingMat: SafetyEquipment = createNewEquipment({
  id: 'electrical_insulating_mat',
  name: 'Tapis isolant électrique',
  category: 'electrical-protection',
  subcategory: 'insulating_equipment',
  description: 'Isolation du sol pour travaux électriques',
  
  specifications: {
    voltage: '26,500 V AC',
    material: 'Caoutchouc naturel',
    thickness: '3.2mm (1/8 pouce)',
    size: '36" x 24" (91cm x 61cm)',
    testVoltage: '40,000 V AC',
    workingVoltage: '17,000 V AC max',
    color: 'Rouge standard',
    temperature: '-25°C à +65°C'
  },
  
  certifications: ['ASTM D178 Type II', 'IEC 61111'],
  standards: ['ASTM D178', 'IEC 61111'],
  
  supplier: 'Salisbury',
  cost: 125,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'ground_faults'],
  
  isActive: true
});

export const lockoutTagout: SafetyEquipment = createNewEquipment({
  id: 'lockout_tagout_kit',
  name: 'Ensemble cadenassage/étiquetage',
  category: 'electrical-protection',
  subcategory: 'lockout_tagout',
  description: 'Cadenassage sécurisé sources d\'énergie',
  
  specifications: {
    locks: '6 cadenas sécurité',
    tags: '25 étiquettes danger',
    hasp: '3 morganes multi-cadenas',
    circuitBreaker: 'Dispositifs disjoncteurs',
    plugLockout: 'Cadenassage prises',
    cableBlocker: 'Bloqueurs de câbles',
    case: 'Coffret de transport',
    keying: 'Clés différentes'
  },
  
  certifications: ['CSA Z460', 'OSHA 1910.147'],
  standards: ['CSA Z460', 'ANSI Z244.1'],
  
  supplier: 'Brady',
  cost: 185,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'before each use',
  
  workTypes: ['electrical_maintenance', 'electrical_installation'],
  hazardTypes: ['electrical_shock', 'unexpected_startup'],
  
  isActive: true
});

// =================== EXPORT ÉQUIPEMENTS ÉLECTRIQUES ===================
export const electricalEquipment = [
  digitalMultimeter,
  voltageDetector,
  arcFlashSuit,
  insulatingMat,
  lockoutTagout
];

export const electricalEquipmentById = electricalEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default electricalEquipment;
