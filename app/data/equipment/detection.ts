// app/data/equipment/detection.ts
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

// =================== ÉQUIPEMENTS DE DÉTECTION ===================

export const gasDetector4Gas: SafetyEquipment = createNewEquipment({
  id: 'gas_detector_4_gas',
  name: 'Détecteur de gaz 4 gaz',
  category: 'DETECTION-EQUIPMENT' as any,
  subcategory: 'gas_detector',
  description: 'Détecteur portatif 4 gaz pour espaces confinés',
  
  // ✅ Maintenant ces propriétés sont acceptées
  specifications: {
    gases: 'O₂, LEL (CH₄), CO, H₂S',
    oxygenRange: '0-30% vol',
    lelRange: '0-100% LEL',
    coRange: '0-1000 ppm',
    h2sRange: '0-500 ppm',
    batteryLife: '14 heures',
    responseTime: '<30 secondes',
    alarmTypes: 'Visuel, audible, vibration',
    certification: 'ATEX, CSA, UL'
  },
  
  certifications: ['CSA C22.2', 'ATEX', 'UL Listed'],
  standards: ['CSA C22.2', 'ATEX Directive'],
  
  supplier: 'Honeywell',
  cost: 850,
  currency: 'CAD',
  lifespan: '3 years',
  lifespanMonths: 36,
  inspectionFrequency: 'daily',
  
  workTypes: ['confined_space', 'gas_maintenance', 'pipeline_inspection'],
  hazardTypes: ['gas_leak', 'asphyxiation', 'explosion'],
  
  isActive: true
});

export const noiseDetector: SafetyEquipment = createNewEquipment({
  id: 'noise_level_meter',
  name: 'Sonomètre numérique',
  category: 'detection-equipment',
  subcategory: 'noise_meter',
  description: 'Mesure des niveaux sonores ambiants',
  
  specifications: {
    range: '30-130 dBA',
    accuracy: '±1.5 dB',
    frequency: '31.5 Hz à 8 kHz',
    display: 'LCD avec rétroéclairage',
    memory: '32,000 mesures',
    batteryLife: '50 heures',
    certification: 'IEC 61672 Classe 2'
  },
  
  certifications: ['IEC 61672', 'ANSI S1.4'],
  standards: ['IEC 61672', 'ANSI S1.4'],
  
  supplier: 'Extech',
  cost: 350,
  currency: 'CAD',
  lifespan: '5 years',
  lifespanMonths: 60,
  inspectionFrequency: 'monthly',
  
  workTypes: ['construction_general', 'welding', 'excavation'],
  hazardTypes: ['noise', 'hearing_damage'],
  
  isActive: true
});

export const radiationDetector: SafetyEquipment = createNewEquipment({
  id: 'radiation_detector_geiger',
  name: 'Détecteur de radiations Geiger',
  category: 'detection-equipment',
  subcategory: 'radiation_detector',
  description: 'Détection des radiations ionisantes',
  
  specifications: {
    detectionTypes: 'Alpha, Beta, Gamma, X-Ray',
    range: '0.001-1000 mR/hr',
    sensitivity: '0.001 mR/hr',
    display: 'LCD numérique',
    alarms: 'Audible programmable',
    batteryLife: '2000 heures',
    certification: 'Energy Response ±30%'
  },
  
  certifications: ['Health Canada', 'NIST Traceable'],
  standards: ['ANSI N42.17A', 'IEC 60846'],
  
  supplier: 'Ludlum',
  cost: 1200,
  currency: 'CAD',
  lifespan: '10 years',
  lifespanMonths: 120,
  inspectionFrequency: 'annually',
  
  workTypes: ['emergency_response', 'environmental_cleanup'],
  hazardTypes: ['radiation', 'nuclear_exposure'],
  
  isActive: true
});

export const airQualityMonitor: SafetyEquipment = createNewEquipment({
  id: 'air_quality_monitor_voc',
  name: 'Moniteur qualité air VOC',
  category: 'detection-equipment',
  subcategory: 'air_quality_monitor',
  description: 'Surveillance continue qualité de l\'air intérieur',
  
  specifications: {
    parameters: 'VOC, PM2.5, PM10, CO₂, Température, Humidité',
    vocRange: '0-60,000 ppb',
    pm25Range: '0-500 μg/m³',
    co2Range: '400-5000 ppm',
    connectivity: 'Wi-Fi, Bluetooth',
    batteryLife: '24 heures autonomie',
    dataLogging: '10,000 mesures'
  },
  
  certifications: ['FCC', 'CE', 'RoHS'],
  standards: ['ISO 16000', 'EPA Method TO-15'],
  
  supplier: 'TSI',
  cost: 750,
  currency: 'CAD',
  lifespan: '7 years',
  lifespanMonths: 84,
  inspectionFrequency: 'quarterly',
  
  workTypes: ['environmental_cleanup', 'confined_space'],
  hazardTypes: ['toxic_exposure', 'air_quality'],
  
  isActive: true
});

export const thermalCamera: SafetyEquipment = createNewEquipment({
  id: 'thermal_imaging_camera',
  name: 'Caméra thermique infrarouge',
  category: 'detection-equipment',
  subcategory: 'thermal_imaging',
  description: 'Imagerie thermique pour détection anomalies',
  
  specifications: {
    resolution: '320x240 pixels',
    thermalSensitivity: '<50 mK',
    temperatureRange: '-20°C à +650°C',
    accuracy: '±2°C ou ±2%',
    spectralRange: '7.5-14 μm',
    batteryLife: '4 heures',
    storage: 'Carte SD 32GB'
  },
  
  certifications: ['CE', 'FCC', 'IC'],
  standards: ['IEC 60068', 'MIL-STD-810G'],
  
  supplier: 'FLIR',
  cost: 2500,
  currency: 'CAD',
  lifespan: '8 years',
  lifespanMonths: 96,
  inspectionFrequency: 'annually',
  
  workTypes: ['electrical_maintenance', 'emergency_response'],
  hazardTypes: ['electrical_shock', 'fire', 'overheating'],
  
  isActive: true
});

// =================== EXPORT ÉQUIPEMENTS DÉTECTION ===================
export const detectionEquipment = [
  gasDetector4Gas,
  noiseDetector,
  radiationDetector,
  airQualityMonitor,
  thermalCamera
];

export const detectionEquipmentById = detectionEquipment.reduce((acc, equipment) => {
  acc[equipment.id] = equipment;
  return acc;
}, {} as Record<string, SafetyEquipment>);

export default detectionEquipment;
