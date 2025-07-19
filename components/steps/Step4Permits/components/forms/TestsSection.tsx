// =================== COMPONENTS/FORMS/TESTSSECTION.TSX - SECTION TESTS & MESURES MOBILE-FIRST ===================
// Section tests atmosphériques avec mesures temps réel, équipements et monitoring mobile

"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Wind, 
  Thermometer, 
  Gauge, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Mic,
  MicOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Bluetooth,
  Wifi,
  Battery,
  Settings,
  Calendar,
  MapPin,
  Upload,
  Download,
  Save,
  Play,
  Pause,
  Stop,
  Volume2,
  Info,
  HelpCircle,
  Plus,
  Minus,
  X,
  Check,
  Edit3,
  Copy,
  Share2
} from 'lucide-react';
import { validateAtmosphericData, validateEquipmentCalibration } from '../../utils/validators';
import { PROVINCIAL_REGULATIONS } from '../../constants/provinces';
import type { 
  PermitFormData,
  PermitType,
  AtmosphericData,
  EquipmentData,
  TestResult,
  MonitoringSession,
  FieldError,
  CalibrationData
} from '../../types';

// =================== INTERFACES SECTION ===================
interface TestsSectionProps {
  data: Partial<PermitFormData>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, FieldError>;
  language: 'fr' | 'en';
  permitType: PermitType;
  province: string;
  touchOptimized?: boolean;
  enablePhotoCapture?: boolean;
  enableBluetoothDevices?: boolean;
  enableContinuousMonitoring?: boolean;
}

interface AtmosphericReading {
  id: string;
  timestamp: Date;
  oxygen: number;
  lel: number; // Lower Explosive Limit
  h2s: number; // Hydrogen Sulfide
  co: number;  // Carbon Monoxide
  temperature: number;
  humidity: number;
  pressure: number;
  location: string;
  operatorId: string;
  equipmentId: string;
  notes?: string;
  photo?: string;
  isValid: boolean;
  alarms: AlarmData[];
}

interface AlarmData {
  id: string;
  type: 'low' | 'high' | 'critical';
  parameter: 'oxygen' | 'lel' | 'h2s' | 'co' | 'temperature';
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  actionTaken?: string;
}

interface EquipmentCalibration {
  id: string;
  equipmentId: string;
  calibrationDate: Date;
  expiryDate: Date;
  certificateNumber: string;
  calibratedBy: string;
  isValid: boolean;
  gasTypes: string[];
  accuracy: Record<string, number>;
  zeroPoints: Record<string, number>;
  spanPoints: Record<string, number>;
}

interface MonitoringConfig {
  interval: number; // secondes
  alarmLimits: Record<string, { low: number; high: number; critical: number }>;
  autoSave: boolean;
  continuousMode: boolean;
  bluetoothEnabled: boolean;
  voiceAlerts: boolean;
  hapticFeedback: boolean;
}

// =================== LIMITES ATMOSPHÉRIQUES PAR PROVINCE ===================
const ATMOSPHERIC_LIMITS: Record<string, {
  oxygen: { min: number; max: number; critical: number };
  lel: { max: number; critical: number };
  h2s: { max: number; critical: number };
  co: { max: number; critical: number };
  temperature: { min: number; max: number };
}> = {
  QC: {
    oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 35, critical: 200 },
    temperature: { min: -20, max: 50 }
  },
  ON: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 25, critical: 200 },
    temperature: { min: -25, max: 45 }
  },
  BC: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 25, critical: 200 },
    temperature: { min: -30, max: 40 }
  },
  AB: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 25, critical: 200 },
    temperature: { min: -35, max: 45 }
  }
};

const EQUIPMENT_TYPES = {
  'detecteur-4-gaz': {
    name: { fr: 'Détecteur 4 gaz', en: '4-Gas Detector' },
    icon: <Shield className="w-5 h-5" />,
    color: '#DC2626',
    parameters: ['oxygen', 'lel', 'h2s', 'co'],
    accuracy: { oxygen: 0.1, lel: 1, h2s: 0.5, co: 1 },
    calibrationInterval: 180, // jours
    brands: ['BW Technologies', 'Industrial Scientific', 'Draeger', 'MSA']
  },
  'detecteur-oxygen': {
    name: { fr: 'Détecteur O₂', en: 'O₂ Detector' },
    icon: <Wind className="w-5 h-5" />,
    color: '#0369A1',
    parameters: ['oxygen'],
    accuracy: { oxygen: 0.1 },
    calibrationInterval: 365,
    brands: ['Crowcon', 'Analox', 'Teledyne']
  },
  'detecteur-gaz-combustible': {
    name: { fr: 'Détecteur gaz combustible', en: 'Combustible Gas Detector' },
    icon: <Zap className="w-5 h-5" />,
    color: '#EA580C',
    parameters: ['lel'],
    accuracy: { lel: 1 },
    calibrationInterval: 180,
    brands: ['RAE Systems', 'Sensidyne', 'GfG']
  },
  'thermometre-infrarouge': {
    name: { fr: 'Thermomètre infrarouge', en: 'Infrared Thermometer' },
    icon: <Thermometer className="w-5 h-5" />,
    color: '#7C2D12',
    parameters: ['temperature'],
    accuracy: { temperature: 0.5 },
    calibrationInterval: 365,
    brands: ['Fluke', 'Flir', 'Raytek']
  },
  'manometre-differentiel': {
    name: { fr: 'Manomètre différentiel', en: 'Differential Manometer' },
    icon: <Gauge className="w-5 h-5" />,
    color: '#059669',
    parameters: ['pressure'],
    accuracy: { pressure: 0.01 },
    calibrationInterval: 365,
    brands: ['Dwyer', 'Omega', 'Setra']
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const TestsSection: React.FC<TestsSectionProps> = ({
  data,
  onChange,
  errors,
  language = 'fr',
  permitType,
  province,
  touchOptimized = true,
  enablePhotoCapture = true,
  enableBluetoothDevices = true,
  enableContinuousMonitoring = true
}) => {
  // =================== STATE MANAGEMENT ===================
  const [currentReading, setCurrentReading] = useState<Partial<AtmosphericReading>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<EquipmentData[]>([]);
  const [activeAlarms, setActiveAlarms] = useState<AlarmData[]>([]);
  const [monitoringConfig, setMonitoringConfig] = useState<MonitoringConfig>({
    interval: 60,
    alarmLimits: ATMOSPHERIC_LIMITS[province] || ATMOSPHERIC_LIMITS.QC,
    autoSave: true,
    continuousMode: false,
    bluetoothEnabled: enableBluetoothDevices,
    voiceAlerts: true,
    hapticFeedback: true
  });
  const [showEquipmentCalibration, setShowEquipmentCalibration] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);
  
  // Refs pour monitoring
  const monitoringIntervalRef = useRef<NodeJS.Timeout>();
  const voiceRecognitionRef = useRef<SpeechRecognition | null>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  // =================== CONFIGURATION TESTS SELON TYPE PERMIS ===================
  const requiredTests = useMemo(() => {
    const baseTests = ['oxygen', 'lel', 'temperature'];
    
    switch (permitType) {
      case 'espace-clos':
        return [...baseTests, 'h2s', 'co', 'pressure'];
      case 'travail-chaud':
        return [...baseTests, 'lel', 'co'];
      case 'excavation':
        return ['oxygen', 'lel', 'h2s'];
      case 'levage':
        return ['temperature', 'pressure'];
      default:
        return baseTests;
    }
  }, [permitType]);

  const atmosphericLimits = useMemo(() => {
    return ATMOSPHERIC_LIMITS[province] || ATMOSPHERIC_LIMITS.QC;
  }, [province]);

  // =================== BLUETOOTH DEVICE CONNECTION ===================
  const connectBluetoothDevice = useCallback(async () => {
    if (!enableBluetoothDevices || !navigator.bluetooth) return;

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'BW' },
          { namePrefix: 'MSA' },
          { namePrefix: 'Draeger' }
        ],
        optionalServices: ['battery_service', 'device_information']
      });

      const server = await device.gatt?.connect();
      if (server) {
        const newDevice: EquipmentData = {
          id: device.id || Date.now().toString(),
          name: device.name || 'Unknown Device',
          type: 'detecteur-4-gaz',
          serialNumber: device.id || '',
          manufacturer: device.name?.split(' ')[0] || 'Unknown',
          model: device.name || '',
          calibrationDate: new Date(),
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          isConnected: true,
          batteryLevel: 100,
          status: 'connected'
        };

        setConnectedDevices(prev => [...prev, newDevice]);
        
        // Feedback haptic connexion
        if (navigator.vibrate) {
          navigator.vibrate([50, 25, 50, 25, 50]);
        }
      }
    } catch (error) {
      console.error('Erreur connexion Bluetooth:', error);
      
      // Feedback haptic erreur
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
  }, [enableBluetoothDevices]);

  // =================== MONITORING CONTINU ===================
  const startContinuousMonitoring = useCallback(() => {
    if (!enableContinuousMonitoring) return;

    setIsMonitoring(true);
    
    monitoringIntervalRef.current = setInterval(async () => {
      // Simulation lecture capteurs - Remplacer par vraie API
      const mockReading: AtmosphericReading = {
        id: Date.now().toString(),
        timestamp: new Date(),
        oxygen: 20.8 + (Math.random() - 0.5) * 0.4,
        lel: Math.random() * 5,
        h2s: Math.random() * 2,
        co: Math.random() * 10,
        temperature: 22 + (Math.random() - 0.5) * 4,
        humidity: 45 + Math.random() * 20,
        pressure: 101.3 + (Math.random() - 0.5) * 0.2,
        location: data.location?.address || 'Position actuelle',
        operatorId: 'current-user',
        equipmentId: connectedDevices[0]?.id || 'manual',
        isValid: true,
        alarms: []
      };

      // Vérification alarmes
      const newAlarms: AlarmData[] = [];
      
      if (mockReading.oxygen < atmosphericLimits.oxygen.min) {
        newAlarms.push({
          id: `alarm-${Date.now()}`,
          type: mockReading.oxygen < atmosphericLimits.oxygen.critical ? 'critical' : 'low',
          parameter: 'oxygen',
          value: mockReading.oxygen,
          threshold: atmosphericLimits.oxygen.min,
          timestamp: new Date(),
          acknowledged: false
        });
      }

      if (mockReading.lel > atmosphericLimits.lel.max) {
        newAlarms.push({
          id: `alarm-${Date.now()}-lel`,
          type: mockReading.lel > atmosphericLimits.lel.critical ? 'critical' : 'high',
          parameter: 'lel',
          value: mockReading.lel,
          threshold: atmosphericLimits.lel.max,
          timestamp: new Date(),
          acknowledged: false
        });
      }

      mockReading.alarms = newAlarms;
      setActiveAlarms(prev => [...prev, ...newAlarms]);

      // Alertes vocales et haptic
      if (newAlarms.length > 0) {
        const criticalAlarms = newAlarms.filter(a => a.type === 'critical');
        
        if (monitoringConfig.hapticFeedback && navigator.vibrate) {
          if (criticalAlarms.length > 0) {
            navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
          } else {
            navigator.vibrate([100, 50, 100]);
          }
        }

        if (monitoringConfig.voiceAlerts && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(
            language === 'fr' 
              ? `Alarme ${criticalAlarms.length > 0 ? 'critique' : 'importante'} détectée`
              : `${criticalAlarms.length > 0 ? 'Critical' : 'Important'} alarm detected`
          );
          utterance.lang = language === 'fr' ? 'fr-CA' : 'en-CA';
          speechSynthesis.speak(utterance);
        }
      }

      setCurrentReading(mockReading);
      
      // Auto-save si configuré
      if (monitoringConfig.autoSave) {
        const currentReadings = data.atmosphericReadings || [];
        onChange('atmosphericReadings', [...currentReadings, mockReading]);
      }
    }, monitoringConfig.interval * 1000);
    
    // Feedback haptic début monitoring
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }
  }, [enableContinuousMonitoring, monitoringConfig, atmosphericLimits, data.atmosphericReadings, data.location, connectedDevices, language, onChange]);

  const stopContinuousMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    setIsMonitoring(false);
    
    // Feedback haptic arrêt
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  // =================== CAPTURE PHOTO READING ===================
  const capturePhotoWithReading = useCallback(async () => {
    if (!enablePhotoCapture) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Caméra arrière
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
      }

      // Simulation capture - Remplacer par vraie capture
      setTimeout(() => {
        if (currentReading.id) {
          const updatedReading = {
            ...currentReading,
            photo: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...` // Base64 simulé
          };
          setCurrentReading(updatedReading);
        }
        
        // Arrêter stream
        stream.getTracks().forEach(track => track.stop());
        
        // Feedback haptic capture
        if (navigator.vibrate) {
          navigator.vibrate([25, 25, 25]);
        }
      }, 2000);
    } catch (error) {
      console.error('Erreur capture photo:', error);
    }
  }, [enablePhotoCapture, currentReading]);

  // =================== VALIDATION TEMPS RÉEL ===================
  const validateReading = useCallback((reading: Partial<AtmosphericReading>) => {
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    requiredTests.forEach(test => {
      const value = reading[test as keyof AtmosphericReading] as number;
      const limits = atmosphericLimits[test as keyof typeof atmosphericLimits];
      
      if (typeof value !== 'number') {
        validation.isValid = false;
        validation.errors.push(
          language === 'fr' 
            ? `Valeur ${test} manquante` 
            : `Missing ${test} value`
        );
        return;
      }

      if (test === 'oxygen') {
        if (value < limits.min || value > limits.max) {
          validation.isValid = false;
          validation.errors.push(
            language === 'fr'
              ? `O₂ hors limites: ${value}% (requis: ${limits.min}-${limits.max}%)`
              : `O₂ out of range: ${value}% (required: ${limits.min}-${limits.max}%)`
          );
        }
      } else {
        if (value > limits.max) {
          validation.isValid = false;
          validation.errors.push(
            language === 'fr'
              ? `${test.toUpperCase()} trop élevé: ${value} (max: ${limits.max})`
              : `${test.toUpperCase()} too high: ${value} (max: ${limits.max})`
          );
        }
      }
    });

    return validation;
  }, [requiredTests, atmosphericLimits, language]);

  // =================== CLEANUP ===================
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // =================== RENDU COMPOSANT ===================
  const currentReadings = data.atmosphericReadings as AtmosphericReading[] || [];
  const hasValidReadings = currentReadings.some(r => r.isValid);

  return (
    <div className="space-y-6">
      {/* =================== HEADER SECTION =================== */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {language === 'fr' ? 'Tests atmosphériques et équipements' : 'Atmospheric tests and equipment'}
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              {language === 'fr' 
                ? `Tests requis pour ${permitType} selon ${province}: ${requiredTests.join(', ')}`
                : `Required tests for ${permitType} per ${province}: ${requiredTests.join(', ')}`
              }
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {isMonitoring ? (language === 'fr' ? 'Monitoring actif' : 'Active monitoring') : (language === 'fr' ? 'Monitoring inactif' : 'Monitoring inactive')}
              </span>
              <span className="flex items-center gap-1">
                <Bluetooth className="w-3 h-3" />
                {connectedDevices.length} {language === 'fr' ? 'appareils' : 'devices'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================== MONITORING TEMPS RÉEL =================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'fr' ? 'Monitoring temps réel' : 'Real-time monitoring'}
          </h4>
          <div className="flex items-center gap-2">
            {isMonitoring ? (
              <button
                onClick={stopContinuousMonitoring}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg font-medium transition-all active:bg-red-700"
              >
                <Stop className="w-4 h-4" />
                <span>{language === 'fr' ? 'Arrêter' : 'Stop'}</span>
              </button>
            ) : (
              <button
                onClick={startContinuousMonitoring}
                disabled={connectedDevices.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{language === 'fr' ? 'Démarrer' : 'Start'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Lectures actuelles */}
        {Object.keys(currentReading).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {requiredTests.map(test => {
              const value = currentReading[test as keyof AtmosphericReading] as number;
              const limits = atmosphericLimits[test as keyof typeof atmosphericLimits];
              const isOutOfRange = test === 'oxygen' 
                ? (value < limits.min || value > limits.max)
                : (value > limits.max);
              
              return (
                <div
                  key={test}
                  className={`
                    p-3 rounded-lg border
                    ${isOutOfRange 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-green-300 bg-green-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {test === 'oxygen' && <Wind className="w-4 h-4 text-blue-600" />}
                    {test === 'lel' && <Zap className="w-4 h-4 text-orange-600" />}
                    {test === 'temperature' && <Thermometer className="w-4 h-4 text-red-600" />}
                    {test === 'pressure' && <Gauge className="w-4 h-4 text-green-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {test.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {value?.toFixed(1)} {test === 'temperature' ? '°C' : test === 'oxygen' || test === 'lel' ? '%' : 'ppm'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {test === 'oxygen' 
                      ? `${limits.min}-${limits.max}%`
                      : `Max ${limits.max}${test === 'temperature' ? '°C' : test === 'oxygen' || test === 'lel' ? '%' : 'ppm'}`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alarmes actives */}
        {activeAlarms.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h5 className="font-semibold text-red-900">
                {language === 'fr' ? 'Alarmes actives' : 'Active alarms'}
              </h5>
            </div>
            <div className="space-y-2">
              {activeAlarms.slice(-3).map(alarm => (
                <div key={alarm.id} className="flex items-center justify-between text-sm">
                  <span className="text-red-700">
                    {alarm.parameter.toUpperCase()}: {alarm.value} (seuil: {alarm.threshold})
                  </span>
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${alarm.type === 'critical' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-orange-100 text-orange-700'
                    }
                  `}>
                    {alarm.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =================== ÉQUIPEMENTS CONNECTÉS =================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'fr' ? 'Équipements de mesure' : 'Measurement equipment'}
          </h4>
          <button
            onClick={connectBluetoothDevice}
            disabled={!enableBluetoothDevices}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all active:bg-blue-700 disabled:opacity-50"
          >
            <Bluetooth className="w-4 h-4" />
            <span>{language === 'fr' ? 'Connecter' : 'Connect'}</span>
          </button>
        </div>

        {connectedDevices.length > 0 ? (
          <div className="space-y-3">
            {connectedDevices.map(device => (
              <EquipmentCard
                key={device.id}
                equipment={device}
                language={language}
                onCalibrate={() => {
                  setSelectedEquipment(device);
                  setShowEquipmentCalibration(true);
                }}
                onDisconnect={() => {
                  setConnectedDevices(prev => prev.filter(d => d.id !== device.id));
                }}
                touchOptimized={touchOptimized}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Bluetooth className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'fr' 
                ? 'Aucun équipement connecté' 
                : 'No equipment connected'
              }
            </p>
          </div>
        )}
      </div>

      {/* =================== HISTORIQUE LECTURES =================== */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {language === 'fr' ? 'Historique des lectures' : 'Reading history'}
          </h4>
          <span className="text-sm text-gray-600">
            {currentReadings.length} {language === 'fr' ? 'lectures' : 'readings'}
          </span>
        </div>

        {currentReadings.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {currentReadings.slice(-10).reverse().map((reading, index) => (
              <ReadingCard
                key={reading.id || index}
                reading={reading}
                language={language}
                limits={atmosphericLimits}
                onViewDetails={() => {
                  // Modal détails lecture
                }}
                touchOptimized={touchOptimized}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'fr' 
                ? 'Aucune lecture enregistrée' 
                : 'No readings recorded'
              }
            </p>
          </div>
        )}
      </div>

      {/* =================== ACTIONS RAPIDES =================== */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={capturePhotoWithReading}
          disabled={!enablePhotoCapture}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium transition-all active:bg-purple-700 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{language === 'fr' ? 'Photo + lecture' : 'Photo + reading'}</span>
        </button>
        
        <button
          onClick={() => {
            // Export readings
            const csvData = currentReadings.map(r => 
              `${r.timestamp},${r.oxygen},${r.lel},${r.h2s},${r.co},${r.temperature}`
            ).join('\n');
            
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'atmospheric-readings.csv';
            a.click();
          }}
          disabled={currentReadings.length === 0}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium transition-all active:bg-green-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'fr' ? 'Exporter CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* =================== MODAL CALIBRATION ÉQUIPEMENT =================== */}
      <AnimatePresence>
        {showEquipmentCalibration && selectedEquipment && (
          <EquipmentCalibrationModal
            equipment={selectedEquipment}
            language={language}
            onSave={(calibrationData) => {
              // Save calibration
              setShowEquipmentCalibration(false);
              setSelectedEquipment(null);
            }}
            onCancel={() => {
              setShowEquipmentCalibration(false);
              setSelectedEquipment(null);
            }}
            touchOptimized={touchOptimized}
          />
        )}
      </AnimatePresence>

      {/* =================== VIDEO CAPTURE HIDDEN =================== */}
      <video 
        ref={cameraRef}
        className="hidden"
        autoPlay
        playsInline
      />
    </div>
  );
};

// =================== COMPOSANT CARTE ÉQUIPEMENT ===================
const EquipmentCard: React.FC<{
  equipment: EquipmentData;
  language: 'fr' | 'en';
  onCalibrate: () => void;
  onDisconnect: () => void;
  touchOptimized: boolean;
}> = ({ equipment, language, onCalibrate, onDisconnect, touchOptimized }) => {
  const isCalibrationExpired = equipment.expiryDate && new Date() > equipment.expiryDate;
  const daysUntilExpiry = equipment.expiryDate 
    ? Math.ceil((equipment.expiryDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {EQUIPMENT_TYPES[equipment.type as keyof typeof EQUIPMENT_TYPES]?.icon || <Shield className="w-6 h-6 text-blue-600" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 truncate">
                {equipment.name}
              </h5>
              <p className="text-sm text-gray-600 truncate">
                {equipment.manufacturer} {equipment.model}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>S/N: {equipment.serialNumber}</span>
                <span className={`
                  px-2 py-0.5 rounded-full
                  ${equipment.isConnected 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                  }
                `}>
                  {equipment.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Battery className={`w-4 h-4 ${equipment.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xs text-gray-500">{equipment.batteryLevel}%</span>
            </div>
          </div>
          
          {/* Calibration status */}
          <div className="mt-2">
            <div className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
              ${isCalibrationExpired 
                ? 'bg-red-100 text-red-700' 
                : daysUntilExpiry < 30 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-green-100 text-green-700'
              }
            `}>
              <Calendar className="w-3 h-3" />
              {isCalibrationExpired 
                ? (language === 'fr' ? 'Calibration expirée' : 'Calibration expired')
                : daysUntilExpiry < 30
                ? (language === 'fr' ? `Expire dans ${daysUntilExpiry}j` : `Expires in ${daysUntilExpiry}d`)
                : (language === 'fr' ? 'Calibration valide' : 'Calibration valid')
              }
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onCalibrate}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm transition-colors active:bg-blue-100"
            >
              <Settings className="w-4 h-4" />
              <span>{language === 'fr' ? 'Calibrer' : 'Calibrate'}</span>
            </button>
            
            <button
              onClick={onDisconnect}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 rounded-lg font-medium text-sm transition-colors active:bg-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== COMPOSANT CARTE LECTURE ===================
const ReadingCard: React.FC<{
  reading: AtmosphericReading;
  language: 'fr' | 'en';
  limits: any;
  onViewDetails: () => void;
  touchOptimized: boolean;
}> = ({ reading, language, limits, onViewDetails, touchOptimized }) => {
  const hasAlarms = reading.alarms && reading.alarms.length > 0;
  const criticalAlarms = reading.alarms?.filter(a => a.type === 'critical') || [];

  return (
    <div 
      className={`
        border rounded-lg p-3 cursor-pointer transition-all
        ${hasAlarms 
          ? criticalAlarms.length > 0 
            ? 'border-red-300 bg-red-50' 
            : 'border-orange-300 bg-orange-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
        ${touchOptimized ? 'active:scale-[0.98]' : ''}
      `}
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium text-gray-900">
          {reading.timestamp.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')} {reading.timestamp.toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-1">
          {reading.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          {reading.photo && <Camera className="w-4 h-4 text-blue-600" />}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-gray-600">O₂:</span>
          <span className={`ml-1 font-medium ${reading.oxygen < limits.oxygen.min || reading.oxygen > limits.oxygen.max ? 'text-red-600' : 'text-green-600'}`}>
            {reading.oxygen.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-gray-600">LEL:</span>
          <span className={`ml-1 font-medium ${reading.lel > limits.lel.max ? 'text-red-600' : 'text-green-600'}`}>
            {reading.lel.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-gray-600">H₂S:</span>
          <span className={`ml-1 font-medium ${reading.h2s > limits.h2s.max ? 'text-red-600' : 'text-green-600'}`}>
            {reading.h2s.toFixed(1)}ppm
          </span>
        </div>
        <div>
          <span className="text-gray-600">CO:</span>
          <span className={`ml-1 font-medium ${reading.co > limits.co.max ? 'text-red-600' : 'text-green-600'}`}>
            {reading.co.toFixed(1)}ppm
          </span>
        </div>
      </div>
      
      {hasAlarms && (
        <div className="mt-2 text-xs">
          <span className="text-red-600 font-medium">
            {criticalAlarms.length > 0 
              ? (language === 'fr' ? `${criticalAlarms.length} alarme(s) critique(s)` : `${criticalAlarms.length} critical alarm(s)`)
              : (language === 'fr' ? `${reading.alarms.length} alarme(s)` : `${reading.alarms.length} alarm(s)`)
            }
          </span>
        </div>
      )}
    </div>
  );
};

// =================== MODAL CALIBRATION ÉQUIPEMENT (PLACEHOLDER) ===================
const EquipmentCalibrationModal: React.FC<any> = (props) => {
  return <div>Modal Calibration Équipement - À implémenter</div>;
};

// =================== EXPORT DEFAULT ===================
export default TestsSection;
