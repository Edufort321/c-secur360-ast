// app/data/equipment/eye-protection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'EYE_PROTECTION' as any,
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

// =================== LUNETTES DE SÉCURITÉ ===================

export const safetyGlassesBasic = createNewEquipment({
  id: 'safety_glasses_z87_basic',
  name: 'Lunettes de sécurité Z87 de base',
  category: 'EYE_PROTECTION' as any,
  subcategory: 'safety_glasses',
  description: 'Lunettes de sécurité transparentes pour usage général',
  
  displayName: {
    fr: 'Lunettes de sécurité Z87 de base',
    en: 'Basic Z87 Safety Glasses'
  },

  specifications: {
    model: 'Genesis',
    manufacturer: 'Uvex',
    partNumber: 'S3200',
    lensType: 'Polycarbonate transparent',
    frameType: 'Monobloc léger',
    weight: 25, // grammes
    uvProtection: '99.9%',
    opticalClass: 'Classe 1',
    impactRating: 'Z87.1'
  },

  safetyFeatures: [
    'Lentilles polycarbonate anti-impact',
    'Protection UV 99.9%',
    'Branches ajustables',
    'Revêtement antibuée disponible',
    'Design enveloppant',
    'Poids ultra-léger'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage quotidien avec solution douce',
    'Inspection des rayures sur lentilles',
    'Vérification ajustement branches',
    'Remplacement si endommagées',
    'Stockage dans étui de protection'
  ] as any,

  compatibleWith: [
    'hard_hat_standard',
    'hearing_protection_basic',
    'dust_mask_n95'
  ] as any,

  certifications: ['ANSI Z87.1', 'CSA Z94.3', 'CE EN 166'] as any,
  standards: ['ANSI Z87.1', 'CSA Z94.3'] as any,
  
  usageInstructions: [
    'Ajuster les branches pour confort',
    'Nettoyer avant utilisation',
    'Inspecter les lentilles avant usage',
    'Remplacer si rayées ou endommagées',
    'Ranger dans étui après utilisation'
  ] as any,

  storageConditions: 'Étui de protection, éviter chaleur excessive',
  
  inspectionCriteria: [
    'Absence de rayures sur lentilles',
    'Intégrité du cadre et branches',
    'Ajustement correct sur le visage',
    'Propreté des lentilles',
    'Fonctionnement des ajustements'
  ] as any,

  supplier: 'Uvex Safety',
  cost: 8,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'daily',
  workTypes: ['construction_general', 'manufacturing'] as any,
  hazardTypes: ['flying_particles', 'dust', 'uv_radiation'] as any
});

// =================== LUNETTES DE SOUDAGE ===================

export const weldingGlasses = createNewEquipment({
  id: 'welding_glasses_shade10',
  name: 'Lunettes de soudage teinte 10',
  category: 'EYE_PROTECTION' as any,
  subcategory: 'welding_protection',
  description: 'Lunettes spécialisées pour soudage arc électrique',
  
  displayName: {
    fr: 'Lunettes de soudage teinte 10',
    en: 'Shade 10 Welding Glasses'
  },

  specifications: {
    model: 'WX-10',
    manufacturer: 'Lincoln Electric',
    partNumber: 'KH961',
    shadeNumber: 10,
    lensType: 'Verre filtrant IR/UV',
    frameType: 'Plastique résistant chaleur',
    protection: 'IR et UV complète',
    temperature: 'Résistant jusqu\'à 175°C',
    opticalClass: 'Classe 1'
  },

  safetyFeatures: [
    'Filtration IR et UV totale',
    'Teinte 10 pour arc électrique',
    'Verres résistants aux projections',
    'Monture thermorésistante',
    'Branches antidérapantes',
    'Champ de vision optimisé'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage avec chiffon doux uniquement',
    'Inspection des verres (projections)',
    'Vérification de l\'étanchéité',
    'Remplacement si verres endommagés',
    'Stockage à l\'abri de la chaleur'
  ] as any,

  compatibleWith: [
    'welding_helmet',
    'welding_jacket_leather',
    'welding_gloves_heat_resistant'
  ] as any,

  certifications: ['ANSI Z87.1', 'CSA Z94.3', 'EN 169'] as any,
  standards: ['ANSI Z87.1', 'EN 169'] as any,
  
  usageInstructions: [
    'Vérifier la teinte appropriée au procédé',
    'Inspecter les verres avant soudage',
    'Porter en complément du masque si requis',
    'Nettoyer après chaque utilisation',
    'Remplacer si vision altérée'
  ] as any,

  storageConditions: 'Étui rigide, température ambiante',
  
  inspectionCriteria: [
    'Intégrité des verres filtrants',
    'Absence de fissures ou impacts',
    'Clarté de la vision à travers les verres',
    'État de la monture',
    'Ajustement sécuritaire'
  ] as any,

  supplier: 'Lincoln Electric',
  cost: 35,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'before each use',
  workTypes: ['welding', 'cutting_torch'] as any,
  hazardTypes: ['arc_radiation', 'infrared_radiation', 'sparks'] as any
});

// =================== ÉCRAN FACIAL ===================

export const faceShieldClear = createNewEquipment({
  id: 'face_shield_clear_full',
  name: 'Écran facial transparent complet',
  category: 'EYE_PROTECTION' as any,
  subcategory: 'face_shields',
  description: 'Protection faciale complète contre projections',
  
  displayName: {
    fr: 'Écran facial transparent complet',
    en: 'Clear Full Face Shield'
  },

  specifications: {
    model: 'Bionic',
    manufacturer: 'Uvex',
    partNumber: '9301',
    material: 'Polycarbonate 0.8mm',
    coverage: 'Visage complet',
    weight: 65, // grammes
    thickness: '0.8mm',
    transparency: '90%',
    mounting: 'Bandeau ajustable'
  },

  safetyFeatures: [
    'Protection faciale intégrale',
    'Polycarbonate haute résistance',
    'Transparency optique excellente',
    'Bandeau ergonomique ajustable',
    'Ventilation antibuée',
    'Compatible avec lunettes'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage avec solution savonneuse',
    'Désinfection entre utilisateurs',
    'Inspection des fixations',
    'Remplacement de la visière si rayée',
    'Ajustement du bandeau'
  ] as any,

  compatibleWith: [
    'safety_glasses_z87',
    'hard_hat_standard',
    'respiratory_protection',
    'hearing_protection'
  ] as any,

  certifications: ['ANSI Z87.1', 'CSA Z94.3', 'CE EN 166'] as any,
  standards: ['ANSI Z87.1', 'EN 166'] as any,
  
  usageInstructions: [
    'Ajuster le bandeau confortablement',
    'Vérifier la couverture complète',
    'Porter avec lunettes de sécurité',
    'Nettoyer régulièrement',
    'Remplacer la visière si endommagée'
  ] as any,

  storageConditions: 'Suspendu ou posé à plat, éviter rayures',
  
  inspectionCriteria: [
    'Transparence de la visière',
    'Absence de rayures majeures',
    'Intégrité des fixations',
    'Fonctionnement du bandeau',
    'Couverture faciale adéquate'
  ] as any,

  supplier: 'Uvex Safety',
  cost: 25,
  currency: 'CAD',
  lifespan: '2 years',
  lifespanMonths: 24,
  inspectionFrequency: 'before each use',
  workTypes: ['grinding', 'chemical_handling', 'medical'] as any,
  hazardTypes: ['chemical_splash', 'flying_particles', 'infectious_agents'] as any
});

// =================== LUNETTES LASER ===================

export const laserSafetyGlasses = createNewEquipment({
  id: 'laser_safety_glasses_multiwave',
  name: 'Lunettes de protection laser multi-longueurs d\'onde',
  category: 'EYE_PROTECTION' as any,
  subcategory: 'laser_protection',
  description: 'Protection spécialisée contre rayonnements laser',
  
  displayName: {
    fr: 'Lunettes de protection laser multi-longueurs d\'onde',
    en: 'Multi-Wavelength Laser Safety Glasses'
  },

  specifications: {
    model: 'LSG-19',
    manufacturer: 'Thorlabs',
    partNumber: 'LG19',
    wavelengthRange: '800-1070nm',
    opticalDensity: 'OD 5+',
    transmissionVisible: '20%',
    frameType: 'Polycarbonate résistant',
    certificationLevel: 'CE EN 207',
    damageTreshold: '10 J/cm²'
  },

  safetyFeatures: [
    'Protection multi-longueurs d\'onde',
    'Densité optique OD 5+',
    'Résistance aux dommages laser',
    'Marquage permanent des spécifications',
    'Monture résistante aux impacts',
    'Champ de vision acceptable'
  ] as any,

  maintenanceRequirements: [
    'Inspection quotidienne des lentilles',
    'Nettoyage avec produits appropriés',
    'Vérification du marquage OD',
    'Test périodique de l\'atténuation',
    'Remplacement selon recommandations'
  ] as any,

  compatibleWith: [
    'laser_systems',
    'fiber_optic_equipment',
    'research_laboratory_setup'
  ] as any,

  certifications: ['CE EN 207', 'ANSI Z136.1'] as any,
  standards: ['EN 207', 'ANSI Z136.1'] as any,
  
  usageInstructions: [
    'Vérifier la compatibilité longueur d\'onde',
    'Inspecter avant chaque utilisation',
    'Porter durant toute exposition laser',
    'Ne jamais regarder directement le faisceau',
    'Stockage dans étui de protection'
  ] as any,

  storageConditions: 'Étui rigide, à l\'abri de la lumière directe',
  
  inspectionCriteria: [
    'Lisibilité du marquage OD',
    'Intégrité des lentilles filtrantes',
    'Absence de rayures ou dommages',
    'État de la monture',
    'Ajustement sécuritaire'
  ] as any,

  supplier: 'Thorlabs Inc.',
  cost: 125,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'before each use',
  workTypes: ['laser_operation', 'research', 'medical_laser'] as any,
  hazardTypes: ['laser_radiation', 'eye_injury', 'retinal_damage'] as any
});

// =================== EXPORT DES PROTECTIONS OCULAIRES ===================

export const eyeProtectionEquipment = [
  safetyGlassesBasic,
  weldingGlasses,
  faceShieldClear,
  laserSafetyGlasses
];

export const eyeProtectionById = eyeProtectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default eyeProtectionEquipment;
