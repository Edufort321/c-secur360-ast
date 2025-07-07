// app/data/equipment/detection.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { SafetyEquipment } from '../../types/equipment';

// Fonction helper pour créer un équipement
const createNewEquipment = (base: any): SafetyEquipment => {
  return {
    // Valeurs par défaut
    category: 'DETECTION' as any,
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

// =================== DÉTECTEURS DE GAZ ===================

export const multiGasDetector = createNewEquipment({
  id: 'multi_gas_detector_4gas',
  name: 'Détecteur multi-gaz 4 gaz',
  category: 'DETECTION' as any,
  subcategory: 'gas_detection',
  description: 'Détecteur portable pour LEL, O2, CO et H2S',
  
  displayName: {
    fr: 'Détecteur multi-gaz 4 gaz',
    en: '4-Gas Multi-Gas Detector'
  },

  specifications: {
    model: 'GasAlert Quattro',
    manufacturer: 'BW Technologies',
    partNumber: 'QT-XWQM-R-Y-NA',
    gases: 'LEL, O2, CO, H2S',
    lelRange: '0-100% LEL',
    o2Range: '0-30% vol',
    coRange: '0-1000 ppm',
    h2sRange: '0-500 ppm',
    batteryLife: 14, // ✅ CORRIGÉ : number au lieu de string
    responseTime: 30, // ✅ CORRIGÉ : number (secondes)
    alarmTypes: 'Visuel, audible, vibration',
    certification: 'ATEX, CSA, UL'
  },

  safetyFeatures: [
    'Alarmes visuelles, audibles et par vibration',
    'Affichage LCD rétroéclairé',
    'Protection IP65',
    'Auto-test au démarrage',
    'Enregistrement des données',
    'Clip de fixation robuste'
  ] as any,

  maintenanceRequirements: [
    'Calibration mensuelle obligatoire',
    'Test fonctionnel quotidien',
    'Remplacement des capteurs selon fabricant',
    'Nettoyage des ports de capteurs',
    'Vérification de la batterie'
  ] as any,

  compatibleWith: [
    'safety_harness_full_body',
    'hard_hat_standard',
    'communication_headset'
  ] as any,

  certifications: ['CSA C22.2 No. 152', 'ATEX', 'UL 913'] as any,
  standards: ['CSA C22.2 No. 152', 'EN 60079'] as any,
  
  usageInstructions: [
    'Effectuer un test de fonctionnement avant utilisation',
    'Porter en zone de respiration',
    'Éviter l\'exposition à des solvants',
    'Réagir immédiatement aux alarmes',
    'Enregistrer les lectures anormales'
  ] as any,

  storageConditions: 'Lieu sec, température 5-40°C, hors gel',
  
  inspectionCriteria: [
    'Fonctionnement de tous les capteurs',
    'Déclenchement des alarmes aux seuils',
    'État de la batterie et autonomie',
    'Intégrité du boîtier et écran',
    'Date de dernière calibration'
  ] as any,

  supplier: 'Honeywell',
  cost: 850,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'daily',
  workTypes: ['confined_space', 'environmental_cleanup'] as any,
  hazardTypes: ['toxic_exposure', 'explosive_atmosphere'] as any
});

// =================== DÉTECTEUR DE FUMÉE ===================

export const smokeDetector = createNewEquipment({
  id: 'smoke_detector_photoelectric',
  name: 'Détecteur de fumée photoélectrique',
  category: 'DETECTION' as any,
  subcategory: 'fire_detection',
  description: 'Détecteur de fumée haute sensibilité pour espaces clos',
  
  displayName: {
    fr: 'Détecteur de fumée photoélectrique',
    en: 'Photoelectric Smoke Detector'
  },

  specifications: {
    model: 'FSD-751P',
    manufacturer: 'System Sensor',
    partNumber: '2151',
    technology: 'Photoélectrique',
    sensitivity: '0.5-4.0% obs/ft',
    powerSource: '9V alkaline',
    batteryLife: 12, // mois
    operatingTemp: '-10 à 50°C',
    humidity: '10-95% RH',
    dimensions: '150mm diamètre'
  },

  safetyFeatures: [
    'Chambre optique scellée',
    'Test automatique de fonctionnement',
    'Indicateur LED de statut',
    'Alarme sonore 85dB',
    'Signal de batterie faible',
    'Bouton de test manuel'
  ] as any,

  maintenanceRequirements: [
    'Test mensuel du bouton test',
    'Nettoyage de la chambre (semestriel)',
    'Remplacement batterie (annuel)',
    'Vérification du montage',
    'Remplacement après 10 ans'
  ] as any,

  compatibleWith: [
    'fire_alarm_panel',
    'emergency_lighting_system',
    'evacuation_system'
  ] as any,

  certifications: ['UL 268', 'cUL', 'FM'] as any,
  standards: ['UL 268', 'NFPA 72'] as any,
  
  usageInstructions: [
    'Installer selon code du bâtiment',
    'Tester mensuellement',
    'Ne pas peindre le détecteur',
    'Éviter les emplacements poussiéreux',
    'Remplacer la batterie annuellement'
  ] as any,

  storageConditions: 'Emballage d\'origine, température ambiante',
  
  inspectionCriteria: [
    'Réponse au test de fumée',
    'Fonctionnement du signal sonore',
    'État de l\'indicateur LED',
    'Propreté de la chambre optique',
    'Fixation sécuritaire'
  ] as any,

  supplier: 'System Sensor',
  cost: 45,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'monthly',
  workTypes: ['construction_general', 'confined_space'] as any,
  hazardTypes: ['fire', 'smoke_inhalation'] as any
});

// =================== DÉTECTEUR DE MOUVEMENT ===================

export const motionDetector = createNewEquipment({
  id: 'motion_detector_pir',
  name: 'Détecteur de mouvement PIR',
  category: 'DETECTION' as any,
  subcategory: 'security_detection',
  description: 'Détecteur de mouvement infrarouge passif pour surveillance',
  
  displayName: {
    fr: 'Détecteur de mouvement PIR',
    en: 'PIR Motion Detector'
  },

  specifications: {
    model: 'DT-7225',
    manufacturer: 'Optex',
    partNumber: 'DT7225ST',
    technology: 'Infrarouge passif double',
    detectionRange: '12m x 12m',
    detectionAngle: '90 degrés',
    powerConsumption: 35, // mA
    operatingVoltage: '12-24V DC',
    operatingTemp: '-10 à 55°C',
    mountingHeight: '2.4m recommandé'
  },

  safetyFeatures: [
    'Double détection PIR anti-fausses alarmes',
    'Immunité aux animaux jusqu\'à 25kg',
    'Protection contre les interférences RF',
    'Lentille Fresnel de précision',
    'Boîtier résistant aux intempéries',
    'LED d\'indication désactivable'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage des lentilles (trimestriel)',
    'Vérification de l\'alignement',
    'Test de détection mensuel',
    'Inspection des connexions',
    'Vérification des réglages de sensibilité'
  ] as any,

  compatibleWith: [
    'security_alarm_system',
    'lighting_control_system',
    'access_control_system'
  ] as any,

  certifications: ['CE', 'FCC', 'IC'] as any,
  standards: ['EN 50131-2-2', 'Grade 2'] as any,
  
  usageInstructions: [
    'Installer à la hauteur recommandée',
    'Éviter les sources de chaleur',
    'Ajuster la sensibilité selon l\'environnement',
    'Tester régulièrement la détection',
    'Protéger des rayons directs du soleil'
  ] as any,

  storageConditions: 'Lieu sec, éviter les températures extrêmes',
  
  inspectionCriteria: [
    'Détection dans toute la zone couverte',
    'Absence de fausses alarmes',
    'Propreté des lentilles',
    'Fixation solide',
    'Fonctionnement des LED d\'indication'
  ] as any,

  supplier: 'Optex',
  cost: 125,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'monthly',
  workTypes: ['security', 'site_monitoring'] as any,
  hazardTypes: ['unauthorized_access', 'theft'] as any
});

// =================== DÉTECTEUR DE NIVEAU D'EAU ===================

export const waterLevelDetector = createNewEquipment({
  id: 'water_level_detector_ultrasonic',
  name: 'Détecteur de niveau d\'eau ultrasonique',
  category: 'DETECTION' as any,
  subcategory: 'level_detection',
  description: 'Capteur ultrasonique pour surveillance niveau d\'eau',
  
  displayName: {
    fr: 'Détecteur de niveau d\'eau ultrasonique',
    en: 'Ultrasonic Water Level Detector'
  },

  specifications: {
    model: 'ULS-30',
    manufacturer: 'Banner Engineering',
    partNumber: 'ULS30D13T',
    range: '30cm à 8m',
    accuracy: '±1% pleine échelle',
    resolution: '1mm',
    frequency: '42 kHz',
    powerSupply: '18-30V DC',
    currentConsumption: 200, // mA max
    operatingTemp: '-25 à 70°C',
    housingMaterial: 'PTFE/PBT'
  },

  safetyFeatures: [
    'Boîtier IP67 étanche',
    'Protection contre les surtensions',
    'Sortie analogique 4-20mA',
    'Affichage LED multi-couleur',
    'Auto-diagnostic intégré',
    'Protection contre les échos parasites'
  ] as any,

  maintenanceRequirements: [
    'Nettoyage de la face du capteur',
    'Vérification de l\'étalonnage (semestriel)',
    'Inspection des connexions électriques',
    'Test de la sortie analogique',
    'Vérification de l\'étanchéité'
  ] as any,

  compatibleWith: [
    'plc_control_system',
    'data_logger',
    'alarm_panel',
    'scada_system'
  ] as any,

  certifications: ['CE', 'UL', 'CSA'] as any,
  standards: ['IEC 61326-1', 'EN 60947-5-2'] as any,
  
  usageInstructions: [
    'Installer perpendiculairement à la surface',
    'Éviter les obstacles dans le faisceau',
    'Étalonner selon l\'application',
    'Vérifier la stabilité du signal',
    'Protéger contre les projections'
  ] as any,

  storageConditions: 'Lieu sec, température de stockage -40 à 85°C',
  
  inspectionCriteria: [
    'Précision des mesures',
    'Stabilité du signal de sortie',
    'État de l\'affichage LED',
    'Intégrité du boîtier et câbles',
    'Fonctionnement de l\'auto-diagnostic'
  ] as any,

  supplier: 'Banner Engineering',
  cost: 320,
  currency: 'CAD',
  lifespan: '15 years',
  lifespanMonths: 180,
  inspectionFrequency: 'monthly',
  workTypes: ['environmental_monitoring', 'water_management'] as any,
  hazardTypes: ['flooding', 'water_contamination'] as any
});

// =================== EXPORT DES ÉQUIPEMENTS DE DÉTECTION ===================

export const detectionEquipment = [
  multiGasDetector,
  smokeDetector,
  motionDetector,
  waterLevelDetector
];

export const detectionById = detectionEquipment.reduce((acc, equipment) => {
  acc[(equipment as any).id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default detectionEquipment;
