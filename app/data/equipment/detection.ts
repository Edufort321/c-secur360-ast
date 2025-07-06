// app/data/equipment/detection.ts
import { SafetyEquipment, createNewEquipment } from './template';

// =================== ÉQUIPEMENTS DE DÉTECTION ET SURVEILLANCE ===================

export const fourGasDetector: SafetyEquipment = createNewEquipment({
  id: 'four_gas_detector_portable',
  name: 'Détecteur 4 gaz portable',
  category: 'monitoring_detection',
  subcategory: 'gas_detection',
  displayName: {
    fr: 'Détecteur multigaz portable (O₂, LEL, CO, H₂S)',
    en: 'Portable 4-gas detector (O₂, LEL, CO, H₂S)'
  },
  description: 'Surveillance continue atmosphère pour espaces clos et travaux dangereux',
  
  specifications: {
    gases: 'O₂, LEL (CH₄), CO, H₂S',
    oxygenRange: '0-30% vol',
    lelRange: '0-100% LEL',
    coRange: '0-1000 ppm',
    h2sRange: '0-200 ppm',
    batteryLife: '12+ heures continu'
  },
  
  certifications: {
    csa: ['CSA C22.2 No. 152'],
    ansi: [],
    en: ['EN 60079-29-1'],
    iso: [],
    other: ['ATEX', 'IECEx', 'UL 913']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['respiratory_system'],
  hazardsProtectedAgainst: [
    'confined_space_entry',
    'oxygen_deficiency',
    'explosive_atmosphere',
    'toxic_gas_exposure',
    'hydrogen_sulfide_exposure'
  ],
  
  usageInstructions: {
    fr: [
      'Calibration et test fonctionnel quotidien',
      'Surveillance continue - jamais intermittente',
      'Alarmes sonores, visuelles et vibratoires',
      'Évacuation immédiate si alarme',
      'Port en zone respiration utilisateur'
    ],
    en: [
      'Daily calibration and function test',
      'Continuous monitoring - never intermittent',
      'Audio, visual and vibrating alarms',
      'Immediate evacuation if alarm',
      'Wear in user breathing zone'
    ]
  },
  
  limitationsUse: [
    'Calibration quotidienne obligatoire',
    'Durée vie capteurs limitée',
    'Conditions environnementales critiques',
    'Ne détecte pas tous gaz dangereux',
    'Formation utilisation obligatoire'
  ],
  
  compatibility: [
    'scba_compressed_air_30min',
    'supplied_air_respirator_hose',
    'confined_space_entry_permit'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Test bump réussi avec gaz étalon',
    'Alarmes fonctionnelles tous modes',
    'Batteries pleinement chargées',
    'Écran lisible sans dommage',
    'Capteurs dans période validité',
    'Boîtier étanche intact'
  ],
  
  maintenanceInstructions: [
    'Calibration quotidienne obligatoire',
    'Remplacement capteurs selon échéancier',
    'Nettoyage filtre poussière',
    'Charge batteries selon cycle',
    'Documentation tests et calibrations'
  ],
  
  storageInstructions: [
    'Lieu propre sec température contrôlée',
    'Station charge dédiée',
    'Éviter chocs et vibrations',
    'Gaz étalonnage à proximité',
    'Registre maintenance à jour'
  ],
  
  lifespanMonths: 60,
  expirationWarning: 3,
  replacementCriteria: [
    'Fin vie capteurs',
    'Impossible calibration',
    'Dysfonctionnement alarmes',
    'Dommages boîtier étanchéité',
    'Batteries non rechargeables'
  ],
  
  temperatureRange: { min: -20, max: 50, unit: '°C' },
  humidityRange: { min: 15, max: 95, unit: '%' },
  
  estimatedCost: {
    amount: 650,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Industrial Scientific', 'Honeywell', 'MSA', 'Dräger', 'RKI Instruments'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Détection gaz et espaces clos',
    'Calibration et maintenance',
    'Interprétation alarmes et réponses',
    'Limitations équipements'
  ],
  certificationRequired: true,
  
  isMandatory: true,
  
  tags: ['4_gaz', 'espaces_clos', 'calibration_quotidienne', 'surveillance_continue']
});

export const radiationDetector: SafetyEquipment = createNewEquipment({
  id: 'radiation_detector_gamma',
  name: 'Détecteur de radiation gamma',
  category: 'monitoring_detection',
  subcategory: 'radiation_detection',
  displayName: {
    fr: 'Détecteur de radiations ionisantes gamma',
    en: 'Gamma ionizing radiation detector'
  },
  description: 'Détection et mesure radiations ionisantes gamma/X',
  
  specifications: {
    radiationType: 'Gamma, rayons X',
    range: '0.01 μSv/h à 10 Sv/h',
    energyRange: '48 keV à 1.3 MeV',
    accuracy: '±15% (137Cs)',
    detector: 'Tube Geiger-Müller compensé'
  },
  
  certifications: {
    csa: ['CSA N288.1'],
    ansi: ['ANSI N13.4', 'ANSI N42.17A'],
    en: ['IEC 60846-1'],
    iso: ['ISO 4037'],
    other: ['NCRP Report 57']
  },
  
  protectionLevel: 'specialized',
  protectedBodyParts: ['whole_body'],
  hazardsProtectedAgainst: [
    'ionizing_radiation',
    'gamma_radiation',
    'x_ray_exposure'
  ],
  
  usageInstructions: {
    fr: [
      'Calibration annuelle par laboratoire accrédité',
      'Test fonctionnel avec source étalon',
      'Port continu en zone contrôlée',
      'Alarmes seuils configurées',
      'Documentation expositions obligatoire'
    ],
    en: [
      'Annual calibration by accredited lab',
      'Function test with reference source',
      'Continuous wear in controlled area',
      'Threshold alarms configured',
      'Exposure documentation mandatory'
    ]
  },
  
  limitationsUse: [
    'Calibration annuelle professionnelle',
    'Type radiations limitées',
    'Conditions environnementales strictes',
    'Formation radioprotection obligatoire',
    'Autorisation réglementaire requise'
  ],
  
  compatibility: [
    'dosimeter_personal_gamma',
    'radiation_survey_meter',
    'contamination_monitor'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Test source étalon réussi',
    'Alarmes fonctionnelles',
    'Batteries suffisantes',
    'Écran lisible',
    'Certificat calibration valide',
    'Boîtier intact'
  ],
  
  maintenanceInstructions: [
    'Calibration annuelle obligatoire',
    'Test fonctionnel mensuel',
    'Nettoyage décontamination',
    'Batteries selon fabricant',
    'Documentation complète'
  ],
  
  lifespanMonths: 84,
  
  temperatureRange: { min: -20, max: 50, unit: '°C' },
  
  estimatedCost: {
    amount: 1200,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Thermo Fisher', 'Ludlum', 'Canberra', 'Mirion', 'SAIC'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Radioprotection CNSC',
    'Utilisation détecteurs radiation',
    'Procédures décontamination'
  ],
  certificationRequired: true,
  
  tags: ['radiation', 'gamma', 'ionisant', 'calibration_annuelle', 'cnsc']
});

export const noiseLevel: SafetyEquipment = createNewEquipment({
  id: 'noise_level_meter_class2',
  name: 'Sonomètre classe 2',
  category: 'monitoring_detection',
  subcategory: 'noise_measurement',
  displayName: {
    fr: 'Sonomètre intégrateur classe 2',
    en: 'Class 2 integrating sound level meter'
  },
  description: 'Mesure exposition bruit et niveaux sonores ambiants',
  
  specifications: {
    class: 'Classe 2 IEC 61672-1',
    range: '30-130 dBA',
    frequency: '20 Hz - 20 kHz',
    weighting: 'A, C, Z',
    timeWeighting: 'Fast, Slow, Impulse'
  },
  
  certifications: {
    csa: ['CSA Z107.56'],
    ansi: ['ANSI S1.4'],
    en: ['IEC 61672-1 Class 2'],
    iso: ['ISO 15667'],
    other: []
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['ears'],
  hazardsProtectedAgainst: [
    'excessive_noise_exposure',
    'hearing_damage_assessment'
  ],
  
  usageInstructions: {
    fr: [
      'Calibration avec calibreur acoustique',
      'Positionnement selon normes exposition',
      'Pondération A pour exposition professionnelle',
      'Mesures multiples pour moyennage',
      'Protection contre vent et vibrations'
    ],
    en: [
      'Calibration with acoustic calibrator',
      'Positioning per exposure standards',
      'A-weighting for occupational exposure',
      'Multiple measurements for averaging',
      'Wind and vibration protection'
    ]
  },
  
  limitationsUse: [
    'Calibration pré/post mesures',
    'Conditions météo limitées',
    'Formation utilisation requise',
    'Vérification périodique précision',
    'Batterie critique pour fonctionnement'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Calibration acoustique réussie',
    'Microphone propre sans dommage',
    'Écran fonctionnel',
    'Batteries chargées',
    'Certificat vérification valide'
  ],
  
  maintenanceInstructions: [
    'Vérification annuelle laboratoire',
    'Nettoyage microphone spécialisé',
    'Calibreur acoustique vérifié',
    'Stockage conditions contrôlées',
    'Documentation mesures'
  ],
  
  lifespanMonths: 120,
  
  estimatedCost: {
    amount: 800,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['Brüel & Kjær', 'Larson Davis', '3M Quest', 'Casella', 'Cirrus'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Mesures acoustiques CSA Z107.56',
    'Évaluation exposition bruit',
    'Calibration et maintenance'
  ],
  
  tags: ['bruit', 'sonomètre', 'classe2', 'exposition', 'calibration']
});

export const airQualityMonitor: SafetyEquipment = createNewEquipment({
  id: 'air_quality_monitor_voc',
  name: 'Moniteur qualité air COV',
  category: 'monitoring_detection',
  subcategory: 'air_quality',
  displayName: {
    fr: 'Moniteur qualité air - Composés organiques volatils',
    en: 'Air quality monitor - Volatile organic compounds'
  },
  description: 'Surveillance temps réel COV et qualité air intérieur',
  
  specifications: {
    detection: 'COV totaux (TVOC)',
    range: '0-20 000 ppb',
    accuracy: '±15% lecture',
    responseTime: '<30 secondes T90',
    dataLogging: '8000+ points mémoire'
  },
  
  certifications: {
    csa: [],
    ansi: [],
    en: ['EN 50194'],
    iso: ['ISO 16000-6'],
    other: ['EPA Method TO-15']
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['respiratory_system'],
  hazardsProtectedAgainst: [
    'volatile_organic_compounds',
    'indoor_air_quality',
    'chemical_vapors'
  ],
  
  usageInstructions: {
    fr: [
      'Stabilisation 15 minutes avant mesure',
      'Positionnement zone respiration',
      'Enregistrement continu recommandé',
      'Étalonnage avec gaz référence',
      'Interprétation selon normes exposition'
    ],
    en: [
      '15-minute stabilization before measurement',
      'Position in breathing zone',
      'Continuous logging recommended',
      'Calibration with reference gas',
      'Interpretation per exposure standards'
    ]
  },
  
  limitationsUse: [
    'Sélectivité limitée COV spécifiques',
    'Interférences humidité/température',
    'Étalonnage périodique requis',
    'Conditions stockage critiques',
    'Formation interprétation résultats'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Capteur propre sans obstruction',
    'Test zéro et span OK',
    'Batteries chargées',
    'Mémoire disponible',
    'Écran fonctionnel'
  ],
  
  maintenanceInstructions: [
    'Étalonnage mensuel avec gaz étalon',
    'Nettoyage capteur selon fabricant',
    'Téléchargement données régulier',
    'Remplacement capteur selon usure',
    'Stockage sec température stable'
  ],
  
  lifespanMonths: 60,
  
  temperatureRange: { min: -10, max: 50, unit: '°C' },
  humidityRange: { min: 5, max: 95, unit: '%' },
  
  estimatedCost: {
    amount: 950,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['RAE Systems', 'Ion Science', 'Photovac', 'Thermo Fisher', 'TSI'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Qualité air intérieur',
    'Interprétation mesures COV',
    'Étalonnage équipements'
  ],
  
  tags: ['cov', 'qualité_air', 'temps_réel', 'étalonnage', 'intérieur']
});

export const dustMonitor: SafetyEquipment = createNewEquipment({
  id: 'dust_monitor_respirable_pm2_5',
  name: 'Moniteur poussières respirables PM2.5',
  category: 'monitoring_detection',
  subcategory: 'dust_monitoring',
  displayName: {
    fr: 'Moniteur temps réel poussières respirables PM2.5',
    en: 'Real-time respirable dust monitor PM2.5'
  },
  description: 'Surveillance concentration poussières respirables en temps réel',
  
  specifications: {
    particleSize: 'PM2.5 (≤2.5 μm)',
    range: '0-100 mg/m³',
    resolution: '0.001 mg/m³',
    sampling: '1.7 L/min',
    dataStorage: '4000+ échantillons'
  },
  
  certifications: {
    csa: ['CSA Z94.4'],
    ansi: [],
    en: ['EN 481'],
    iso: ['ISO 7708'],
    other: ['NIOSH 0600']
  },
  
  protectionLevel: 'standard',
  protectedBodyParts: ['respiratory_system'],
  hazardsProtectedAgainst: [
    'respirable_dust',
    'silica_exposure',
    'particulate_inhalation'
  ],
  
  usageInstructions: {
    fr: [
      'Étalonnage avec poussières référence',
      'Port zone respiration travailleur',
      'Surveillance continue shift complet',
      'Téléchargement données quotidien',
      'Nettoyage cyclone après usage'
    ],
    en: [
      'Calibration with reference dust',
      'Wear in worker breathing zone',
      'Continuous monitoring full shift',
      'Daily data download',
      'Clean cyclone after use'
    ]
  },
  
  limitationsUse: [
    'Type poussières spécifique',
    'Conditions humidité critiques',
    'Étalonnage avec matériau similaire',
    'Maintenance quotidienne requise',
    'Formation interprétation obligatoire'
  ],
  
  inspectionFrequency: 'before_each_use',
  inspectionCriteria: [
    'Cyclone propre sans obstruction',
    'Test débit aspiration',
    'Batteries pleine charge',
    'Étalonnage dans tolérance',
    'Mémoire disponible'
  ],
  
  maintenanceInstructions: [
    'Nettoyage cyclone quotidien',
    'Étalonnage hebdomadaire',
    'Vérification débit aspiration',
    'Remplacement filtre interne',
    'Téléchargement données'
  ],
  
  lifespanMonths: 60,
  
  temperatureRange: { min: -10, max: 40, unit: '°C' },
  humidityRange: { min: 10, max: 90, unit: '%' },
  
  estimatedCost: {
    amount: 1800,
    currency: 'CAD',
    unit: 'per_item'
  },
  
  suppliers: ['TSI', 'Casella', 'Turnkey', 'SKC', 'Sensidyne'],
  availability: 'specialized',
  
  trainingRequired: true,
  trainingType: [
    'Échantillonnage poussières respirables',
    'Étalonnage moniteurs temps réel',
    'Interprétation exposition'
  ],
  
  tags: ['poussières', 'pm2.5', 'respirables', 'temps_réel', 'silice']
});

// =================== EXPORT ÉQUIPEMENTS DÉTECTION ===================
export const detectionEquipment = [
  fourGasDetector,
  radiationDetector,
  noiseLevel,
  airQualityMonitor,
  dustMonitor
];

export const detectionEquipmentById = detectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default detectionEquipment;
