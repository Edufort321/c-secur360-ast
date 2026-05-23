// app/data/equipment/respiratory.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'RESPIRATORY_PROTECTION' as any,
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

// =================== MASQUE JETABLE N95 ===================

export const dustMaskN95 = createNewEquipment({
  id: 'dust_mask_n95_disposable',
  name: 'Masque anti-poussière N95 jetable',
  category: 'RESPIRATORY_PROTECTION' as any,
  subcategory: 'disposable_masks',
  description: 'Masque filtrant jetable contre particules fines',
  
  displayName: {
    fr: 'Masque anti-poussière N95 jetable',
    en: 'N95 Disposable Dust Mask'
  },

  specifications: {
    model: '8210',
    manufacturer: '3M',
    partNumber: '8210',
    filtrationEfficiency: 95, // %
    filterType: 'Électrostatique',
    breathingResistance: 35, // Pa
    usage: 'Usage unique',
    material: 'Polypropylène non-tissé',
    weight: 10 // grammes
  },

  safetyFeatures: [
    'Filtration 95% particules 0.3 microns',
    'Élastiques ajustables',
    'Barrette nasale formable',
    'Coquille rigide maintien forme',
    'Valve d\'expiration (modèles)',
    'Hypoallergénique'
  ] as any,

  maintenanceRequirements: [
    'Usage unique - ne pas réutiliser',
    'Remplacer si souillé ou humide',
    'Remplacer si résistance respiratoire',
    'Stockage emballage d\'origine',
    'Éviter déformation avant usage'
  ] as any,

  compatibleWith: [
    'safety_glasses_basic',
    'hard_hat_standard',
    'work_clothing_standard'
  ] as any,

  certifications: ['NIOSH N95', 'Health Canada'] as any,
  standards: ['42 CFR 84', 'CSA Z94.4'] as any,
  
  usageInstructions: [
    'Placer sur visage couvrant nez/bouche',
    'Former barrette nasale correctement',
    'Ajuster élastiques sans serrer excessif',
    'Tester étanchéité par respiration',
    'Jeter après utilisation'
  ] as any,

  storageConditions: 'Lieu sec, température ambiante, emballage fermé',
  
  inspectionCriteria: [
    'Intégrité du masque avant usage',
    'Absence de déformation',
    'Élastiques en bon état',
    'Emballage non endommagé',
    'Date d\'expiration valide'
  ] as any,

  supplier: '3M Canada',
  cost: 2,
  currency: 'CAD',
  lifespan: 'Single use',
  lifespanMonths: 0,
  inspectionFrequency: 'before each use',
  workTypes: ['construction_general', 'sanding', 'cleaning'] as any,
  hazardTypes: ['dust_inhalation', 'particulate_exposure', 'respiratory_irritation'] as any
});

// =================== DEMI-MASQUE RÉUTILISABLE ===================

export const halfMaskReusable = createNewEquipment({
  id: 'half_mask_reusable_p100',
  name: 'Demi-masque réutilisable P100',
  category: 'RESPIRATORY_PROTECTION' as any,
  subcategory: 'reusable_masks',
  description: 'Demi-masque avec cartouches filtrantes P100',
  
  displayName: {
    fr: 'Demi-masque réutilisable P100',
    en: 'P100 Reusable Half Mask'
  },

  specifications: {
    model: '6200',
    manufacturer: '3M',
    partNumber: '6200',
    cartridgeType: 'P100 particules',
    material: 'Silicone thermoplastique',
    sizes: 'S, M, L disponibles',
    weight: 85, // grammes sans cartouches
    sealType: 'Joint silicone double'
  },

  safetyFeatures: [
    'Étanchéité silicone supérieure',
    'Cartouches P100 interchangeables',
    'Valve d\'expiration centrale',
    'Sangles ajustables 4 points',
    'Compatible lunettes de sécurité',
    'Facilité de nettoyage'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage après chaque utilisation',
    'Désinfection entre utilisateurs',
    'Remplacement cartouches selon usage',
    'Inspection joints d\'étanchéité',
    'Test d\'ajustement annuel'
  ] as any,

  compatibleWith: [
    'p100_filter_cartridges',
    'safety_glasses_low_profile',
    'hard_hat_standard'
  ] as any,

  certifications: ['NIOSH', 'CSA Z94.4'] as any,
  standards: ['42 CFR 84', 'CSA Z94.4'] as any,
  
  usageInstructions: [
    'Effectuer test d\'ajustement',
    'Placer masque couvrant nez à menton',
    'Ajuster sangles uniformément',
    'Vérifier étanchéité par test pression',
    'Remplacer cartouches selon saturation'
  ] as any,

  storageConditions: 'Étui de protection, lieu propre et sec',
  
  inspectionCriteria: [
    'Intégrité du joint silicone',
    'État des sangles et boucles',
    'Fonctionnement valve expiration',
    'Propreté et désinfection',
    'Date remplacement cartouches'
  ] as any,

  supplier: '3M Canada',
  cost: 65,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  workTypes: ['asbestos_removal', 'spray_painting', 'chemical_handling'] as any,
  hazardTypes: ['toxic_vapors', 'particulate_exposure', 'chemical_inhalation'] as any
});

// =================== MASQUE COMPLET ===================

export const fullFaceMask = createNewEquipment({
  id: 'full_face_mask_organic_vapor',
  name: 'Masque complet vapeurs organiques',
  category: 'RESPIRATORY_PROTECTION' as any,
  subcategory: 'full_face_masks',
  description: 'Masque facial complet avec protection oculaire',
  
  displayName: {
    fr: 'Masque complet vapeurs organiques',
    en: 'Full Face Organic Vapor Mask'
  },

  specifications: {
    model: '6800',
    manufacturer: '3M',
    partNumber: '6800',
    facepiece: 'Silicone intégral',
    visorMaterial: 'Polycarbonate résistant',
    cartridgeType: 'Vapeurs organiques + P100',
    sizes: 'S, M, L disponibles',
    weight: 450, // grammes sans cartouches
    fieldOfView: '180° non obstrué'
  },

  safetyFeatures: [
    'Protection respiratoire et oculaire',
    'Visière polycarbonate résistante impacts',
    'Joint d\'étanchéité silicone premium',
    'Valve d\'expiration à faible résistance',
    'Sangles 5 points ajustement précis',
    'Compatible communication'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage et désinfection après usage',
    'Inspection joints d\'étanchéité',
    'Remplacement cartouches chimiques',
    'Test d\'ajustement semestriel',
    'Vérification clarté visière'
  ] as any,

  compatibleWith: [
    'organic_vapor_cartridges',
    'p100_filter_attachments',
    'communication_systems'
  ] as any,

  certifications: ['NIOSH', 'CSA Z94.4', 'CE EN 136'] as any,
  standards: ['42 CFR 84', 'CSA Z94.4'] as any,
  
  usageInstructions: [
    'Effectuer test d\'ajustement qualifié',
    'Placer masque du menton vers front',
    'Ajuster sangles selon procédure',
    'Vérifier étanchéité complète',
    'Surveiller saturation cartouches'
  ] as any,

  storageConditions: 'Étui rigide, cartouches séparées si stockage',
  
  inspectionCriteria: [
    'Intégrité visière polycarbonate',
    'État joints silicone',
    'Fonctionnement valve expiration',
    'Clarté optique visière',
    'Système de sangles complet'
  ] as any,

  supplier: '3M Canada',
  cost: 185,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  workTypes: ['spray_painting', 'chemical_processing', 'pesticide_application'] as any,
  hazardTypes: ['chemical_vapors', 'eye_exposure', 'respiratory_toxicity'] as any
});

// =================== APPAREIL RESPIRATOIRE AUTONOME ===================

export const selfContainedBreathingApparatus = createNewEquipment({
  id: 'scba_compressed_air_30min',
  name: 'ARICA 30 minutes air comprimé',
  category: 'RESPIRATORY_PROTECTION' as any,
  subcategory: 'scba_equipment',
  description: 'Appareil respiratoire isolant circuit fermé',
  
  displayName: {
    fr: 'ARICA 30 minutes air comprimé',
    en: '30-Minute SCBA Compressed Air'
  },

  specifications: {
    model: 'AirHawk II',
    manufacturer: 'MSA Safety',
    partNumber: '10154052',
    airSupply: '30 minutes nominal',
    cylinderPressure: 4500, // PSI
    cylinderVolume: 45, // minutes service
    weight: 14.5, // kg complet
    alarmPressure: 25, // % capacité
    harness: 'Kevlar renforcé'
  },

  safetyFeatures: [
    'Alimentation air pur indépendante',
    'Alarme sonore basse pression',
    'Régulateur à la demande',
    'Harnais ergonomique renforcé',
    'Manomètre haute visibilité',
    'Système d\'évacuation rapide'
  ] as any,

  maintenanceRequirements: [
    'Inspection complète après usage',
    'Test fonctionnel hebdomadaire',
    'Maintenance préventive mensuelle',
    'Recharge cylindres selon besoin',
    'Certification annuelle obligatoire'
  ] as any,

  compatibleWith: [
    'firefighter_helmet',
    'thermal_protection_suit',
    'emergency_escape_equipment'
  ] as any,

  certifications: ['NIOSH', 'NFPA 1981', 'CSA Z180.1'] as any,
  standards: ['NFPA 1981', 'CSA Z180.1'] as any,
  
  usageInstructions: [
    'Vérifier pression avant utilisation',
    'Enfiler selon procédure établie',
    'Tester alarme et régulateur',
    'Respecter limites de temps',
    'Procédure sortie d\'urgence connue'
  ] as any,

  storageConditions: 'Position verticale, cylindres pleins, lieu sec',
  
  inspectionCriteria: [
    'Pression cylindre conforme',
    'Fonctionnement alarme basse pression',
    'Intégrité du masque facial',
    'État du harnais et sangles',
    'Test régulateur et débitmètre'
  ] as any,

  supplier: 'MSA Safety',
  cost: 3200,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'before each use',
  workTypes: ['firefighting', 'hazmat_response', 'confined_space_rescue'] as any,
  hazardTypes: ['oxygen_deficiency', 'toxic_atmosphere', 'unknown_contaminants'] as any
});

// =================== EXPORT DES PROTECTIONS RESPIRATOIRES ===================

export const respiratoryEquipment = [
  dustMaskN95,
  halfMaskReusable,
  fullFaceMask,
  selfContainedBreathingApparatus
];

export const respiratoryById = respiratoryEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default respiratoryEquipment;
