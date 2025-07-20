// =================== COMPONENTS/FORMS/SHARED/ATMOSPHERICSECTION.TSX - SECTION TESTS ATMOSPHÉRIQUES RÉUTILISABLE ===================
// Section tests atmosphériques avec monitoring temps réel, équipements Bluetooth et validation provinciale

"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Bluetooth,
  Battery,
  Signal,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  Bell,
  Zap,
  Camera,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Gauge
} from 'lucide-react';
import { StatusBadge } from '../../StatusBadge';

// =================== TYPES ===================
export interface AtmosphericReading {
  id: string;
  timestamp: Date;
  location: string;
  operator: string;
  readings: {
    oxygen: number;      // %
    lel: number;         // %LEL
    h2s: number;         // ppm
    co: number;          // ppm
    temperature: number; // °C
    pressure?: number;   // kPa
    humidity?: number;   // %
  };
  deviceId: string;
  deviceName: string;
  isValid: boolean;
  notes?: string;
  photo?: string;
  gpsLocation?: { lat: number; lng: number };
  calibrationDate?: Date;
}

export interface AtmosphericLimits {
  oxygen: { min: number; max: number; critical: number };
  lel: { max: number; critical: number };
  h2s: { max: number; critical: number };
  co: { max: number; critical: number };
  temperature?: { min: number; max: number };
  pressure?: { min: number; max: number };
}

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'bw-4-gas' | 'msa-altair' | 'draeger-xam' | 'ventis-pro' | 'generic';
  manufacturer: string;
  model: string;
  serialNumber: string;
  isConnected: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  lastCalibration: Date;
  nextCalibration: Date;
  supportedParameters: string[];
  firmware?: string;
}

export interface AlarmData {
  id: string;
  type: 'low' | 'high' | 'critical' | 'device-error' | 'calibration-due';
  parameter: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  deviceId: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
}

export interface MonitoringSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  readings: AtmosphericReading[];
  devices: BluetoothDevice[];
  alarms: AlarmData[];
  location: string;
  operator: string;
  purpose: string;
  isActive: boolean;
}

export interface AtmosphericSectionProps {
  data: {
    initialReadings: AtmosphericReading[];
    continuousMonitoring: {
      enabled: boolean;
      interval: number;
      devices: BluetoothDevice[];
    };
    limits: AtmosphericLimits;
    emergencyLimits: AtmosphericLimits;
    ventilationRequired: boolean;
    ventilationDetails?: any;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  language: 'fr' | 'en';
  province: 'QC' | 'ON' | 'AB' | 'BC' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  permitType: string;
  touchOptimized?: boolean;
  readOnly?: boolean;
}

// =================== CONFIGURATION LIMITES PAR PROVINCE ===================
const PROVINCIAL_LIMITS: Record<string, AtmosphericLimits> = {
  QC: {
    oxygen: { min: 20.5, max: 23.0, critical: 19.5 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 35, critical: 200 }
  },
  ON: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 25, critical: 200 } // Plus strict en Ontario
  },
  AB: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 15 }, // Plus strict pour H2S (industrie pétrolière)
    co: { max: 35, critical: 200 }
  },
  BC: {
    oxygen: { min: 19.5, max: 23.0, critical: 19.0 },
    lel: { max: 10, critical: 25 },
    h2s: { max: 10, critical: 20 },
    co: { max: 35, critical: 200 }
  }
};

// =================== CONFIGURATION ÉQUIPEMENTS BLUETOOTH ===================
const DEVICE_CONFIGS = {
  'bw-4-gas': {
    name: 'BW Technologies 4-Gas',
    parameters: ['oxygen', 'lel', 'h2s', 'co'],
    icon: '📟',
    color: '#3B82F6'
  },
  'msa-altair': {
    name: 'MSA Altair Series',
    parameters: ['oxygen', 'lel', 'h2s', 'co', 'temperature'],
    icon: '📱',
    color: '#10B981'
  },
  'draeger-xam': {
    name: 'Draeger X-am Series',
    parameters: ['oxygen', 'lel', 'h2s', 'co', 'pressure'],
    icon: '🔬',
    color: '#F59E0B'
  },
  'ventis-pro': {
    name: 'Industrial Scientific Ventis Pro',
    parameters: ['oxygen', 'lel', 'h2s', 'co', 'temperature', 'humidity'],
    icon: '📡',
    color: '#8B5CF6'
  },
  'generic': {
    name: 'Détecteur générique',
    parameters: ['oxygen', 'lel', 'h2s', 'co'],
    icon: '⚡',
    color: '#6B7280'
  }
};

// =================== CONFIGURATION PARAMÈTRES ===================
const PARAMETER_CONFIG = {
  oxygen: {
    label: { fr: 'Oxygène (O₂)', en: 'Oxygen (O₂)' },
    unit: '%',
    icon: Wind,
    color: '#3B82F6',
    normalRange: { min: 20.5, max: 23.0 },
    precision: 1
  },
  lel: {
    label: { fr: 'Limite explosive (LEL)', en: 'Lower Explosive Limit (LEL)' },
    unit: '%LEL',
    icon: Zap,
    color: '#F59E0B',
    normalRange: { min: 0, max: 10 },
    precision: 1
  },
  h2s: {
    label: { fr: 'Sulfure d\'hydrogène (H₂S)', en: 'Hydrogen Sulfide (H₂S)' },
    unit: 'ppm',
    icon: AlertTriangle,
    color: '#EF4444',
    normalRange: { min: 0, max: 10 },
    precision: 1
  },
  co: {
    label: { fr: 'Monoxyde de carbone (CO)', en: 'Carbon Monoxide (CO)' },
    unit: 'ppm',
    icon: Activity,
    color: '#DC2626',
    normalRange: { min: 0, max: 35 },
    precision: 1
  },
  temperature: {
    label: { fr: 'Température', en: 'Temperature' },
    unit: '°C',
    icon: Thermometer,
    color: '#059669',
    normalRange: { min: -10, max: 50 },
    precision: 1
  },
  pressure: {
    label: { fr: 'Pression', en: 'Pressure' },
    unit: 'kPa',
    icon: Gauge,
    color: '#7C3AED',
    normalRange: { min: 85, max: 110 },
    precision: 1
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const AtmosphericSection: React.FC<AtmosphericSectionProps> = ({
  data,
  onChange,
  errors,
  language,
  province,
  permitType,
  touchOptimized = true,
  readOnly = false
}) => {
  // =================== STATE ===================
  const [currentReading, setCurrentReading] = useState<AtmosphericReading | null>(null);
  const [monitoringSession, setMonitoringSession] = useState<MonitoringSession | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>(data.continuousMonitoring.devices);
  const [activeAlarms, setActiveAlarms] = useState<AlarmData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<string>('oxygen');
  const [manualReading, setManualReading] = useState<Partial<AtmosphericReading['readings']>>({});
  const [isCalibrating, setIsCalibrating] = useState<string | null>(null);

  const monitoringIntervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();

  // =================== LIMITES PROVINCIALES ===================
  const provincialLimits = PROVINCIAL_LIMITS[province] || PROVINCIAL_LIMITS.QC;

  // =================== PARAMÈTRES REQUIS SELON TYPE PERMIS ===================
  const getRequiredParameters = useCallback(() => {
    switch (permitType) {
      case 'espace-clos':
        return ['oxygen', 'lel', 'h2s', 'co', 'temperature'];
      case 'travail-chaud':
        return ['oxygen', 'lel', 'co', 'temperature'];
      case 'excavation':
        return ['oxygen', 'lel', 'h2s'];
      case 'hauteur':
        return ['oxygen', 'temperature'];
      case 'electrique':
        return ['oxygen', 'lel'];
      default:
        return ['oxygen', 'lel', 'temperature'];
    }
  }, [permitType]);

  const requiredParameters = getRequiredParameters();

  // =================== BLUETOOTH SIMULATION ===================
  const simulateBluetoothReading = useCallback((device: BluetoothDevice): AtmosphericReading => {
    const baseValues = {
      oxygen: 20.9 + (Math.random() - 0.5) * 0.4,
      lel: Math.random() * 2,
      h2s: Math.random() * 3,
      co: Math.random() * 8,
      temperature: 22 + (Math.random() - 0.5) * 6,
      pressure: 101.3 + (Math.random() - 0.5) * 2,
      humidity: 45 + (Math.random() - 0.5) * 10
    };

    const readings: any = {};
    device.supportedParameters.forEach(param => {
      if (baseValues[param as keyof typeof baseValues] !== undefined) {
        readings[param] = Number(baseValues[param as keyof typeof baseValues].toFixed(1));
      }
    });

    return {
      id: `reading_${Date.now()}_${device.id}`,
      timestamp: new Date(),
      location: monitoringSession?.location || 'Position actuelle',
      operator: monitoringSession?.operator || 'Système',
      readings,
      deviceId: device.id,
      deviceName: device.name,
      isValid: true,
      calibrationDate: device.lastCalibration
    };
  }, [monitoringSession]);

  // =================== VALIDATION LECTURES - CORRIGÉE ===================
  const validateReading = useCallback((reading: AtmosphericReading): AlarmData[] => {
    const alarms: AlarmData[] = [];
    const limits = data.limits || provincialLimits;

    Object.entries(reading.readings).forEach(([parameter, value]) => {
      const paramLimits = limits[parameter as keyof AtmosphericLimits];
      if (!paramLimits || typeof value !== 'number') return;

      let alarmType: AlarmData['type'] | null = null;
      let severity: AlarmData['severity'] = 'info';

      if (parameter === 'oxygen') {
        // CORRECTION: Vérification avec garde de type pour 'critical'
        if ('critical' in paramLimits && value < paramLimits.critical) {
          alarmType = 'critical';
          severity = 'emergency';
        } else if ('min' in paramLimits && 'max' in paramLimits && (value < paramLimits.min || value > paramLimits.max)) {
          alarmType = 'high';
          severity = 'critical';
        }
      } else {
        // CORRECTION: Vérification avec garde de type pour 'critical'
        if ('critical' in paramLimits && value > paramLimits.critical) {
          alarmType = 'critical';
          severity = 'emergency';
        } else if ('max' in paramLimits && value > paramLimits.max) {
          alarmType = 'high';
          severity = 'warning';
        }
      }

      if (alarmType) {
        const threshold = parameter === 'oxygen' 
          ? ('min' in paramLimits ? paramLimits.min : 0)
          : ('max' in paramLimits ? paramLimits.max : 0);

        alarms.push({
          id: `alarm_${Date.now()}_${parameter}`,
          type: alarmType,
          parameter,
          value,
          threshold,
          timestamp: new Date(),
          acknowledged: false,
          deviceId: reading.deviceId,
          severity
        });
      }
    });

    return alarms;
  }, [data.limits, provincialLimits]);

  // =================== ALERTES MULTI-SENSORIELLES ===================
  const triggerAlarm = useCallback((alarms: AlarmData[]) => {
    alarms.forEach(alarm => {
      // Feedback haptic
      if (touchOptimized && navigator.vibrate) {
        const pattern = alarm.severity === 'emergency' ? [200, 100, 200, 100, 200] : [100, 50, 100];
        navigator.vibrate(pattern);
      }

      // Alerte sonore
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const frequency = alarm.severity === 'emergency' ? 1200 : 800;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // Notification push
      if ('Notification' in window && Notification.permission === 'granted') {
        const parameterConfig = PARAMETER_CONFIG[alarm.parameter as keyof typeof PARAMETER_CONFIG];
        new Notification(`${alarm.severity.toUpperCase()} - ${parameterConfig?.label[language] || alarm.parameter}`, {
          body: `${language === 'fr' ? 'Valeur' : 'Value'}: ${alarm.value}${parameterConfig?.unit || ''} (${language === 'fr' ? 'Seuil' : 'Threshold'}: ${alarm.threshold}${parameterConfig?.unit || ''})`,
          icon: '/atmospheric-alarm.png',
          tag: alarm.id
        });
      }
    });

    setActiveAlarms(prev => [...alarms, ...prev]);
  }, [touchOptimized, language]);

  // =================== MONITORING AUTOMATIQUE ===================
  const startMonitoring = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const session: MonitoringSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      readings: [],
      devices: connectedDevices.filter(d => d.isConnected),
      alarms: [],
      location: 'Position actuelle',
      operator: 'Utilisateur',
      purpose: `Monitoring ${permitType}`,
      isActive: true
    };

    setMonitoringSession(session);
    setIsMonitoring(true);

    monitoringIntervalRef.current = setInterval(() => {
      connectedDevices.filter(d => d.isConnected).forEach(device => {
        const reading = simulateBluetoothReading(device);
        const alarms = validateReading(reading);
        
        if (alarms.length > 0) {
          triggerAlarm(alarms);
        }

        setCurrentReading(reading);
        setMonitoringSession(prev => prev ? {
          ...prev,
          readings: [...prev.readings, reading],
          alarms: [...prev.alarms, ...alarms]
        } : null);
      });
    }, data.continuousMonitoring.interval * 1000);
  }, [connectedDevices, data.continuousMonitoring.interval, simulateBluetoothReading, validateReading, triggerAlarm, permitType]);

  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    
    setIsMonitoring(false);
    setMonitoringSession(prev => prev ? { ...prev, endTime: new Date(), isActive: false } : null);
  }, []);

  // =================== LECTURE MANUELLE ===================
  const addManualReading = useCallback(() => {
    if (!Object.keys(manualReading).length) return;

    const reading: AtmosphericReading = {
      id: `manual_${Date.now()}`,
      timestamp: new Date(),
      location: 'Lecture manuelle',
      operator: 'Utilisateur',
      readings: manualReading as AtmosphericReading['readings'],
      deviceId: 'manual',
      deviceName: 'Lecture manuelle',
      isValid: true
    };

    const alarms = validateReading(reading);
    if (alarms.length > 0) {
      triggerAlarm(alarms);
    }

    const updatedReadings = [...data.initialReadings, reading];
    onChange('initialReadings', updatedReadings);
    setManualReading({});
  }, [manualReading, data.initialReadings, onChange, validateReading, triggerAlarm]);

  // =================== ACKNOWLEDGMENT ALARMES ===================
  const acknowledgeAlarm = useCallback((alarmId: string) => {
    setActiveAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));
  }, []);

  // =================== RENDU LECTURE TEMPS RÉEL ===================
  const renderCurrentReading = () => {
    if (!currentReading) return null;

    return (
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h4 className="font-medium text-gray-900">
              {language === 'fr' ? 'Lecture temps réel' : 'Real-time reading'}
            </h4>
          </div>
          <div className="text-xs text-gray-500">
            {currentReading.timestamp.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(currentReading.readings).map(([parameter, value]) => {
            const config = PARAMETER_CONFIG[parameter as keyof typeof PARAMETER_CONFIG];
            const limits = provincialLimits[parameter as keyof AtmosphericLimits];
            
            if (!config) return null;

            let status: 'normal' | 'warning' | 'critical' = 'normal';
            if (limits) {
              if (parameter === 'oxygen') {
                if ('critical' in limits && value < limits.critical) status = 'critical';
                else if ('min' in limits && 'max' in limits && (value < limits.min || value > limits.max)) status = 'warning';
              } else {
                if ('critical' in limits && value > limits.critical) status = 'critical';
                else if ('max' in limits && value > limits.max) status = 'warning';
              }
            }

            const Icon = config.icon;

            return (
              <motion.div
                key={parameter}
                className={`
                  p-3 rounded-lg border
                  ${status === 'critical' ? 'bg-red-100 border-red-300' :
                    status === 'warning' ? 'bg-yellow-100 border-yellow-300' :
                    'bg-white border-gray-200'
                  }
                `}
                animate={status === 'critical' ? {
                  scale: [1, 1.05, 1],
                  transition: { duration: 1, repeat: Infinity }
                } : {}}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon 
                    size={16} 
                    style={{ color: config.color }}
                  />
                  <span className="text-xs text-gray-600">
                    {config.label[language]}
                  </span>
                </div>
                <div className="text-lg font-bold" style={{ color: config.color }}>
                  {value}{config.unit}
                </div>
                {limits && (
                  <div className="text-xs text-gray-500">
                    {parameter === 'oxygen' 
                      ? ('min' in limits && 'max' in limits ? `${limits.min}-${limits.max}${config.unit}` : '')
                      : ('max' in limits ? `<${limits.max}${config.unit}` : '')
                    }
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // =================== RENDU ÉQUIPEMENTS BLUETOOTH ===================
  const renderBluetoothDevices = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          {language === 'fr' ? 'Équipements Bluetooth' : 'Bluetooth devices'}
        </h4>
        <button
          onClick={() => {
            // Simulate device scan
            console.log('Scanning for devices...');
          }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          <Bluetooth size={16} />
          <span>{language === 'fr' ? 'Scanner' : 'Scan'}</span>
        </button>
      </div>

      {connectedDevices.map(device => {
        const config = DEVICE_CONFIGS[device.type];
        
        return (
          <motion.div
            key={device.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h5 className="font-medium text-gray-900">{device.name}</h5>
                  <p className="text-sm text-gray-600">{config.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {device.isConnected ? (
                  <StatusBadge status="active" language={language} size="sm" />
                ) : (
                  <StatusBadge status="suspended" language={language} size="sm" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Battery size={16} className="text-gray-400" />
                <span>{device.batteryLevel || 85}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Signal size={16} className="text-gray-400" />
                <span>{device.signalStrength || 92}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>
                  {Math.ceil((device.nextCalibration.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}j
                </span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setIsCalibrating(device.id)}
                className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {language === 'fr' ? 'Calibrer' : 'Calibrate'}
              </button>
              
              <button
                onClick={() => {
                  const reading = simulateBluetoothReading(device);
                  setCurrentReading(reading);
                }}
                className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                {language === 'fr' ? 'Test' : 'Test'}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // =================== RENDU LECTURE MANUELLE ===================
  const renderManualInput = () => (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-medium text-gray-900 mb-4">
        {language === 'fr' ? 'Lecture manuelle' : 'Manual reading'}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {requiredParameters.map(parameter => {
          const config = PARAMETER_CONFIG[parameter as keyof typeof PARAMETER_CONFIG];
          if (!config) return null;

          return (
            <div key={parameter}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {config.label[language]}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={`0.${'1'.repeat(config.precision)}`}
                  value={manualReading[parameter as keyof typeof manualReading] || ''}
                  onChange={(e) => setManualReading(prev => ({
                    ...prev,
                    [parameter]: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 text-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {config.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addManualReading}
        disabled={Object.keys(manualReading).length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {language === 'fr' ? 'Ajouter lecture' : 'Add reading'}
      </button>
    </div>
  );

  // =================== RENDU ALERTES ACTIVES ===================
  const renderActiveAlarms = () => {
    const unacknowledgedAlarms = activeAlarms.filter(alarm => !alarm.acknowledged);
    
    if (unacknowledgedAlarms.length === 0) return null;

    return (
      <motion.div
        className="bg-red-50 border border-red-200 rounded-xl p-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h4 className="font-medium text-red-800">
            {language === 'fr' ? 'Alertes actives' : 'Active alarms'}
          </h4>
        </div>

        <div className="space-y-2">
          {unacknowledgedAlarms.slice(0, 3).map(alarm => {
            const config = PARAMETER_CONFIG[alarm.parameter as keyof typeof PARAMETER_CONFIG];
            
            return (
              <motion.div
                key={alarm.id}
                className={`
                  p-3 rounded-lg border-l-4 
                  ${alarm.severity === 'emergency' ? 'bg-red-100 border-red-500' :
                    alarm.severity === 'critical' ? 'bg-orange-100 border-orange-500' :
                    'bg-yellow-100 border-yellow-500'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {config?.label[language] || alarm.parameter}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'fr' ? 'Valeur' : 'Value'}: {alarm.value}{config?.unit || ''} 
                      {' • '}
                      {language === 'fr' ? 'Seuil' : 'Threshold'}: {alarm.threshold}{config?.unit || ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alarm.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlarm(alarm.id)}
                    className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // =================== RENDU PRINCIPAL ===================
  return (
    <div className="space-y-6">
      {/* Header avec contrôles monitoring */}
      <div className="bg-cyan-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wind className="h-6 w-6 text-cyan-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'fr' ? 'Tests et monitoring atmosphériques' : 'Atmospheric testing and monitoring'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'fr' ? 'Surveillance continue des paramètres atmosphériques' : 'Continuous atmospheric parameters monitoring'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={readOnly || connectedDevices.filter(d => d.isConnected).length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px]
                ${isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isMonitoring ? <Pause size={20} /> : <Play size={20} />}
              <span>
                {isMonitoring 
                  ? (language === 'fr' ? 'Arrêter' : 'Stop')
                  : (language === 'fr' ? 'Démarrer' : 'Start')
                }
              </span>
            </button>
          </div>
        </div>

        {/* Limites provinciales info */}
        <div className="bg-white rounded-lg p-3 border border-cyan-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {language === 'fr' ? 'Limites réglementaires' : 'Regulatory limits'} ({province})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(provincialLimits).map(([param, limits]) => {
              const config = PARAMETER_CONFIG[param as keyof typeof PARAMETER_CONFIG];
              if (!config) return null;

              return (
                <div key={param} className="text-center">
                  <div className="font-medium">{config.label[language]}</div>
                  <div className="text-gray-600">
                    {param === 'oxygen' 
                      ? ('min' in limits && 'max' in limits ? `${limits.min}-${limits.max}${config.unit}` : '')
                      : ('max' in limits ? `<${limits.max}${config.unit}` : '')
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alertes actives */}
      <AnimatePresence>
        {renderActiveAlarms()}
      </AnimatePresence>

      {/* Lecture temps réel */}
      {currentReading && renderCurrentReading()}

      {/* Équipements Bluetooth */}
      {renderBluetoothDevices()}

      {/* Lecture manuelle */}
      {!readOnly && renderManualInput()}

      {/* Historique des lectures */}
      {data.initialReadings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">
            {language === 'fr' ? 'Historique des lectures' : 'Readings history'}
          </h4>
          
          <div className="space-y-3">
            {data.initialReadings.slice(-5).reverse().map(reading => (
              <div
                key={reading.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <div className="font-medium">{reading.operator}</div>
                    <div className="text-gray-600">
                      {reading.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {Object.entries(reading.readings).map(([param, value]) => {
                    const config = PARAMETER_CONFIG[param as keyof typeof PARAMETER_CONFIG];
                    if (!config) return null;

                    return (
                      <div key={param} className="text-center">
                        <div className="text-gray-600">{param.toUpperCase()}</div>
                        <div className="font-medium">
                          {value}{config.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Erreurs de validation */}
      {errors.atmospheric && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-800">
              {language === 'fr' ? 'Erreurs à corriger' : 'Errors to fix'}
            </h4>
          </div>
          <p className="text-sm text-red-700">{errors.atmospheric}</p>
        </div>
      )}
    </div>
  );
};

// =================== EXPORT ===================
export default AtmosphericSection;
