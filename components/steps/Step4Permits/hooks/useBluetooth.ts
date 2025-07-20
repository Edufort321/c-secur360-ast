// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USEBLUETOOTH.TS ===================
// Hook React pour connexion Bluetooth native avec équipements de détection industriels
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// =================== DÉCLARATIONS DE TYPES WEB BLUETOOTH ===================

declare global {
  interface Navigator {
    bluetooth?: Bluetooth;
  }
  
  interface Bluetooth {
    getAvailability(): Promise<boolean>;
    requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  }
  
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }
  
  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice;
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
  }
  
  interface BluetoothRemoteGATTService {
    device: BluetoothDevice;
    uuid: string;
    isPrimary: boolean;
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
    getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }
  
  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    service: BluetoothRemoteGATTService;
    uuid: string;
    properties: BluetoothCharacteristicProperties;
    value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  }
  
  interface BluetoothCharacteristicProperties {
    broadcast: boolean;
    read: boolean;
    writeWithoutResponse: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
    authenticatedSignedWrites: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
  }
  
  interface RequestDeviceOptions {
    filters?: BluetoothLEScanFilter[];
    optionalServices?: BluetoothServiceUUID[];
    acceptAllDevices?: boolean;
    deviceId?: string;
  }
  
  interface BluetoothLEScanFilter {
    services?: BluetoothServiceUUID[];
    name?: string;
    namePrefix?: string;
    manufacturerData?: BluetoothManufacturerDataFilter[];
    serviceData?: BluetoothServiceDataFilter[];
  }
  
  interface BluetoothManufacturerDataFilter {
    companyIdentifier: number;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }
  
  interface BluetoothServiceDataFilter {
    service: BluetoothServiceUUID;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }
  
  type BluetoothServiceUUID = number | string;
  type BluetoothCharacteristicUUID = number | string;
}

// =================== INTERFACES ===================

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  type: 'detector' | 'monitor' | 'sensor' | 'unknown';
  manufacturer: string;
  model: string;
  serialNumber?: string;
  firmwareVersion?: string;
  batteryLevel?: number;
  signalStrength: number; // RSSI en dBm
  isConnected: boolean;
  lastSeen: Date;
  services: BluetoothServiceInfo[];
  capabilities: DeviceCapabilities;
}

export interface BluetoothServiceInfo {
  uuid: string;
  name: string;
  characteristics: BluetoothCharacteristicInfo[];
}

export interface BluetoothCharacteristicInfo {
  uuid: string;
  name: string;
  properties: string[];
  value?: ArrayBuffer;
  isNotifying: boolean;
}

export interface DeviceCapabilities {
  canDetectGas: boolean;
  supportedGases: string[];
  canMeasureTemperature: boolean;
  canMeasureHumidity: boolean;
  canMeasurePressure: boolean;
  hasAlarm: boolean;
  hasVibration: boolean;
  hasDisplay: boolean;
  canCalibrate: boolean;
  supportsBatch: boolean;
  maxSampleRate: number; // Hz
}

export interface AtmosphericReading {
  deviceId: string;
  timestamp: Date;
  parameters: {
    oxygen?: number;
    lel?: number;
    h2s?: number;
    co?: number;
    co2?: number;
    temperature?: number;
    humidity?: number;
    pressure?: number;
  };
  alarms: AlarmStatus[];
  confidence: number;
  calibrationStatus: CalibrationStatus;
}

export interface AlarmStatus {
  parameter: string;
  level: 'low' | 'high' | 'critical';
  value: number;
  threshold: number;
  isActive: boolean;
  timestamp: Date;
}

export interface CalibrationStatus {
  lastCalibration: Date;
  nextCalibration: Date;
  isValid: boolean;
  coefficients: Record<string, number>;
  accuracy: number;
}

export interface BluetoothConfig {
  scanTimeout: number;
  connectionTimeout: number;
  maxRetries: number;
  autoReconnect: boolean;
  readingInterval: number;
  bufferSize: number;
  enableLogging: boolean;
}

export interface BluetoothState {
  isSupported: boolean;
  isEnabled: boolean;
  isScanning: boolean;
  isConnecting: boolean;
  devices: BluetoothDeviceInfo[];
  connectedDevices: BluetoothDeviceInfo[];
  readings: AtmosphericReading[];
  error: string | null;
  lastError: Date | null;
}

// =================== CONSTANTES BLUETOOTH ===================

// UUIDs des services Bluetooth pour équipements industriels
const DEVICE_SERVICES = {
  // Service générique d'informations sur l'appareil
  DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb',
  // Service de détection de gaz personnalisé
  GAS_DETECTION: '12345678-1234-1234-1234-123456789abc',
  // Service batterie
  BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
  // Service environnemental
  ENVIRONMENTAL: '0000181a-0000-1000-8000-00805f9b34fb'
} as const;

// Caractéristiques pour lecture des données
const CHARACTERISTICS = {
  // Informations appareil
  MANUFACTURER_NAME: '00002a29-0000-1000-8000-00805f9b34fb',
  MODEL_NUMBER: '00002a24-0000-1000-8000-00805f9b34fb',
  SERIAL_NUMBER: '00002a25-0000-1000-8000-00805f9b34fb',
  FIRMWARE_REVISION: '00002a26-0000-1000-8000-00805f9b34fb',
  
  // Batterie
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
  
  // Données de gaz (UUIDs personnalisés pour équipements industriels)
  OXYGEN_READING: '12345678-1234-1234-1234-123456789001',
  LEL_READING: '12345678-1234-1234-1234-123456789002',
  H2S_READING: '12345678-1234-1234-1234-123456789003',
  CO_READING: '12345678-1234-1234-1234-123456789004',
  TEMPERATURE_READING: '12345678-1234-1234-1234-123456789005',
  HUMIDITY_READING: '12345678-1234-1234-1234-123456789006',
  PRESSURE_READING: '12345678-1234-1234-1234-123456789007',
  
  // Contrôle et calibration
  ALARM_STATUS: '12345678-1234-1234-1234-123456789010',
  CALIBRATION_DATA: '12345678-1234-1234-1234-123456789011',
  DEVICE_CONTROL: '12345678-1234-1234-1234-123456789012'
} as const;

// Configuration par défaut
const DEFAULT_CONFIG: BluetoothConfig = {
  scanTimeout: 10000, // 10 secondes
  connectionTimeout: 5000, // 5 secondes
  maxRetries: 3,
  autoReconnect: true,
  readingInterval: 1000, // 1 seconde
  bufferSize: 100,
  enableLogging: true
};

// Fabricants d'équipements supportés
const SUPPORTED_MANUFACTURERS = {
  'BW Technologies': {
    models: ['GasAlert Extreme', 'GasAlert Max XT II', 'MicroClip XL'],
    serviceUUID: DEVICE_SERVICES.GAS_DETECTION
  },
  'MSA': {
    models: ['Altair 4X', 'Altair 5X', 'ALTAIR io'],
    serviceUUID: DEVICE_SERVICES.GAS_DETECTION
  },
  'Draeger': {
    models: ['X-am 2500', 'X-am 5100', 'X-am 5600'],
    serviceUUID: DEVICE_SERVICES.GAS_DETECTION
  },
  'Industrial Scientific': {
    models: ['Ventis Pro5', 'Tango TX1', 'GasBadge Pro'],
    serviceUUID: DEVICE_SERVICES.GAS_DETECTION
  },
  'RKI Instruments': {
    models: ['GX-2009', 'GX-6000', 'SC-01'],
    serviceUUID: DEVICE_SERVICES.GAS_DETECTION
  }
} as const;

// =================== HOOK PRINCIPAL ===================

export function useBluetooth(config: Partial<BluetoothConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // État principal
  const [state, setState] = useState<BluetoothState>({
    isSupported: false,
    isEnabled: false,
    isScanning: false,
    isConnecting: false,
    devices: [],
    connectedDevices: [],
    readings: [],
    error: null,
    lastError: null
  });

  // Références pour le nettoyage
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();
  const readingIntervalRef = useRef<NodeJS.Timeout>();
  const connectedDevicesRef = useRef<Map<string, BluetoothRemoteGATTServer>>(new Map());
  const characteristicsRef = useRef<Map<string, BluetoothRemoteGATTCharacteristic>>(new Map());

  // =================== FONCTIONS UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.enableLogging) {
      console.log(`[Bluetooth] ${message}`, data || '');
    }
  }, [finalConfig.enableLogging]);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      lastError: new Date()
    }));
    log(`Error: ${error}`);
  }, [log]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Vérification du support Bluetooth
  const checkBluetoothSupport = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        setError('Bluetooth Web API non supporté dans ce navigateur');
        return false;
      }

      const isAvailable = await navigator.bluetooth.getAvailability();
      setState(prev => ({
        ...prev,
        isSupported: true,
        isEnabled: isAvailable
      }));

      log('Bluetooth support vérifié', { supported: true, enabled: isAvailable });
      return true;
    } catch (error) {
      setError(`Erreur vérification Bluetooth: ${error}`);
      return false;
    }
  }, [setError, log]);

  // Identification du type d'appareil basé sur le nom
  const identifyDevice = useCallback((name: string): BluetoothDeviceInfo['type'] => {
    const deviceName = name.toLowerCase();
    
    if (deviceName.includes('gasalert') || 
        deviceName.includes('altair') || 
        deviceName.includes('x-am') ||
        deviceName.includes('ventis') ||
        deviceName.includes('tango') ||
        deviceName.includes('gx-')) {
      return 'detector';
    }
    
    if (deviceName.includes('monitor') || deviceName.includes('sensor')) {
      return deviceName.includes('gas') ? 'detector' : 'sensor';
    }
    
    return 'unknown';
  }, []);

  // Extraction des informations fabricant
  const getDeviceInfo = useCallback((name: string) => {
    for (const [manufacturer, info] of Object.entries(SUPPORTED_MANUFACTURERS)) {
      for (const model of info.models) {
        if (name.toLowerCase().includes(model.toLowerCase())) {
          return { manufacturer, model };
        }
      }
    }
    
    // Tentative d'identification basée sur des mots-clés
    if (name.toLowerCase().includes('bw')) {
      return { manufacturer: 'BW Technologies', model: 'Unknown Model' };
    }
    if (name.toLowerCase().includes('msa')) {
      return { manufacturer: 'MSA', model: 'Unknown Model' };
    }
    if (name.toLowerCase().includes('draeger')) {
      return { manufacturer: 'Draeger', model: 'Unknown Model' };
    }
    
    return { manufacturer: 'Unknown', model: 'Unknown' };
  }, []);

  // =================== SCAN ET DÉCOUVERTE ===================

  const startScan = useCallback(async () => {
    if (!state.isSupported || state.isScanning) return;

    clearError();
    setState(prev => ({ ...prev, isScanning: true }));
    log('Début du scan Bluetooth');

    try {
      // Options de scan pour équipements de détection de gaz
      const options: RequestDeviceOptions = {
        acceptAllDevices: true,
        optionalServices: Object.values(DEVICE_SERVICES)
      };

      // Timeout du scan
      scanTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isScanning: false }));
        log('Scan terminé par timeout');
      }, finalConfig.scanTimeout);

      // Demande de sélection d'appareil
      const device = await navigator.bluetooth!.requestDevice(options);
      
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      if (device) {
        const deviceInfo = getDeviceInfo(device.name || 'Unknown');
        const deviceType = identifyDevice(device.name || 'Unknown');
        
        const bluetoothDeviceInfo: BluetoothDeviceInfo = {
          id: device.id,
          name: device.name || 'Appareil inconnu',
          type: deviceType,
          manufacturer: deviceInfo.manufacturer,
          model: deviceInfo.model,
          signalStrength: -50, // Approximation, pas accessible via Web Bluetooth
          isConnected: false,
          lastSeen: new Date(),
          services: [],
          capabilities: {
            canDetectGas: deviceType === 'detector',
            supportedGases: deviceType === 'detector' ? ['O2', 'LEL', 'H2S', 'CO'] : [],
            canMeasureTemperature: true,
            canMeasureHumidity: false,
            canMeasurePressure: false,
            hasAlarm: deviceType === 'detector',
            hasVibration: deviceType === 'detector',
            hasDisplay: true,
            canCalibrate: deviceType === 'detector',
            supportsBatch: false,
            maxSampleRate: 1
          }
        };

        setState(prev => ({
          ...prev,
          isScanning: false,
          devices: [...prev.devices.filter(d => d.id !== device.id), bluetoothDeviceInfo]
        }));

        log('Appareil découvert', bluetoothDeviceInfo);
      }

    } catch (error: any) {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      setState(prev => ({ ...prev, isScanning: false }));
      
      if (error.name === 'NotFoundError') {
        log('Scan annulé par l\'utilisateur');
      } else {
        setError(`Erreur lors du scan: ${error.message}`);
      }
    }
  }, [state.isSupported, state.isScanning, clearError, log, finalConfig.scanTimeout, getDeviceInfo, identifyDevice, setError]);

  const stopScan = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    setState(prev => ({ ...prev, isScanning: false }));
    log('Scan arrêté');
  }, [log]);

  // =================== CONNEXION ET DÉCONNEXION ===================

  const connectToDevice = useCallback(async (deviceId: string) => {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device || device.isConnected || state.isConnecting) return;

    clearError();
    setState(prev => ({ ...prev, isConnecting: true }));
    log('Connexion à l\'appareil', device.name);

    try {
      // Obtenir l'appareil Bluetooth natif
      const bluetoothDevice = await navigator.bluetooth!.requestDevice({
        deviceId: deviceId,
        optionalServices: Object.values(DEVICE_SERVICES)
      });

      // Connexion GATT
      connectionTimeoutRef.current = setTimeout(() => {
        setError('Timeout de connexion');
        setState(prev => ({ ...prev, isConnecting: false }));
      }, finalConfig.connectionTimeout);

      const server = await bluetoothDevice.gatt?.connect();
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      if (!server) {
        throw new Error('Impossible de se connecter au serveur GATT');
      }

      // Stocker la connexion
      connectedDevicesRef.current.set(deviceId, server);

      // Découvrir les services
      const services = await server.getPrimaryServices();
      const bluetoothServices: BluetoothServiceInfo[] = [];

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        const bluetoothCharacteristics: BluetoothCharacteristicInfo[] = [];

        for (const char of characteristics) {
          bluetoothCharacteristics.push({
            uuid: char.uuid,
            name: getCharacteristicName(char.uuid),
            properties: char.properties ? Object.keys(char.properties).filter(p => (char.properties as any)[p]) : [],
            isNotifying: false
          });

          // Stocker la caractéristique pour usage futur
          characteristicsRef.current.set(`${deviceId}-${char.uuid}`, char);
        }

        bluetoothServices.push({
          uuid: service.uuid,
          name: getServiceName(service.uuid),
          characteristics: bluetoothCharacteristics
        });
      }

      // Mettre à jour l'état de l'appareil
      setState(prev => ({
        ...prev,
        isConnecting: false,
        devices: prev.devices.map(d => 
          d.id === deviceId 
            ? { ...d, isConnected: true, services: bluetoothServices }
            : d
        ),
        connectedDevices: [...prev.connectedDevices.filter(d => d.id !== deviceId), 
                          { ...device, isConnected: true, services: bluetoothServices }]
      }));

      // Configurer les notifications pour les données atmosphériques
      await setupNotifications(deviceId);

      log('Connexion réussie', device.name);

    } catch (error: any) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      setState(prev => ({ ...prev, isConnecting: false }));
      setError(`Erreur de connexion: ${error.message}`);
    }
  }, [state.devices, state.isConnecting, clearError, log, finalConfig.connectionTimeout, setError]);

  const disconnectFromDevice = useCallback(async (deviceId: string) => {
    const server = connectedDevicesRef.current.get(deviceId);
    if (server) {
      try {
        server.disconnect();
        connectedDevicesRef.current.delete(deviceId);
        
        // Nettoyer les caractéristiques
        for (const [key] of characteristicsRef.current.entries()) {
          if (key.startsWith(deviceId)) {
            characteristicsRef.current.delete(key);
          }
        }

        setState(prev => ({
          ...prev,
          devices: prev.devices.map(d => 
            d.id === deviceId ? { ...d, isConnected: false } : d
          ),
          connectedDevices: prev.connectedDevices.filter(d => d.id !== deviceId)
        }));

        log('Déconnexion réussie', deviceId);
      } catch (error: any) {
        setError(`Erreur de déconnexion: ${error.message}`);
      }
    }
  }, [log, setError]);

  // =================== LECTURE DES DONNÉES ===================

  const setupNotifications = useCallback(async (deviceId: string) => {
    const gasCharacteristics = [
      CHARACTERISTICS.OXYGEN_READING,
      CHARACTERISTICS.LEL_READING,
      CHARACTERISTICS.H2S_READING,
      CHARACTERISTICS.CO_READING,
      CHARACTERISTICS.TEMPERATURE_READING
    ];

    for (const charUUID of gasCharacteristics) {
      const char = characteristicsRef.current.get(`${deviceId}-${charUUID}`);
      if (char && char.properties.notify) {
        try {
          await char.startNotifications();
          char.addEventListener('characteristicvaluechanged', (event) => {
            handleCharacteristicValueChanged(deviceId, charUUID, event);
          });
          log(`Notifications activées pour ${getCharacteristicName(charUUID)}`);
        } catch (error: any) {
          log(`Erreur activation notifications pour ${charUUID}: ${error.message}`);
        }
      }
    }
  }, [log]);

  const handleCharacteristicValueChanged = useCallback((
    deviceId: string,
    characteristicUUID: string,
    event: Event
  ) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    
    if (!value) return;

    // Parser les données selon le type de caractéristique
    const parsedValue = parseCharacteristicValue(characteristicUUID, value);
    
    // Créer ou mettre à jour la lecture atmosphérique
    const reading: Partial<AtmosphericReading> = {
      deviceId,
      timestamp: new Date(),
      parameters: {},
      alarms: [],
      confidence: 0.95,
      calibrationStatus: {
        lastCalibration: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h ago
        nextCalibration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isValid: true,
        coefficients: {},
        accuracy: 0.98
      }
    };

    // Assigner la valeur au bon paramètre
    switch (characteristicUUID) {
      case CHARACTERISTICS.OXYGEN_READING:
        reading.parameters!.oxygen = parsedValue;
        break;
      case CHARACTERISTICS.LEL_READING:
        reading.parameters!.lel = parsedValue;
        break;
      case CHARACTERISTICS.H2S_READING:
        reading.parameters!.h2s = parsedValue;
        break;
      case CHARACTERISTICS.CO_READING:
        reading.parameters!.co = parsedValue;
        break;
      case CHARACTERISTICS.TEMPERATURE_READING:
        reading.parameters!.temperature = parsedValue;
        break;
    }

    // Vérifier les alarmes
    const alarms = checkAlarms(reading.parameters!, deviceId);
    reading.alarms = alarms;

    setState(prev => ({
      ...prev,
      readings: [reading as AtmosphericReading, ...prev.readings.slice(0, finalConfig.bufferSize - 1)]
    }));

    log(`Nouvelle lecture de ${getCharacteristicName(characteristicUUID)}`, parsedValue);
  }, [finalConfig.bufferSize, log]);

  // =================== FONCTIONS HELPER ===================

  const getServiceName = (uuid: string): string => {
    const serviceNames: Record<string, string> = {
      [DEVICE_SERVICES.DEVICE_INFORMATION]: 'Informations Appareil',
      [DEVICE_SERVICES.GAS_DETECTION]: 'Détection de Gaz',
      [DEVICE_SERVICES.BATTERY_SERVICE]: 'Batterie',
      [DEVICE_SERVICES.ENVIRONMENTAL]: 'Environnemental'
    };
    return serviceNames[uuid] || `Service ${uuid.slice(0, 8)}`;
  };

  const getCharacteristicName = (uuid: string): string => {
    const charNames: Record<string, string> = {
      [CHARACTERISTICS.MANUFACTURER_NAME]: 'Fabricant',
      [CHARACTERISTICS.MODEL_NUMBER]: 'Modèle',
      [CHARACTERISTICS.SERIAL_NUMBER]: 'Numéro de série',
      [CHARACTERISTICS.FIRMWARE_REVISION]: 'Version firmware',
      [CHARACTERISTICS.BATTERY_LEVEL]: 'Niveau batterie',
      [CHARACTERISTICS.OXYGEN_READING]: 'Oxygène',
      [CHARACTERISTICS.LEL_READING]: 'LIE',
      [CHARACTERISTICS.H2S_READING]: 'H₂S',
      [CHARACTERISTICS.CO_READING]: 'CO',
      [CHARACTERISTICS.TEMPERATURE_READING]: 'Température'
    };
    return charNames[uuid] || `Caractéristique ${uuid.slice(0, 8)}`;
  };

  const parseCharacteristicValue = (uuid: string, value: DataView): number => {
    // Parser selon le type de donnée (généralement Float32 little-endian)
    try {
      return value.getFloat32(0, true); // little-endian
    } catch {
      // Fallback vers Uint16 si Float32 échoue
      try {
        return value.getUint16(0, true) / 100; // Diviser par 100 pour les pourcentages
      } catch {
        return 0;
      }
    }
  };

  const checkAlarms = (parameters: AtmosphericReading['parameters'], deviceId: string): AlarmStatus[] => {
    const alarms: AlarmStatus[] = [];
    const now = new Date();

    // Seuils d'alarme typiques (peuvent être configurés par appareil)
    const thresholds = {
      oxygen: { low: 19.5, high: 23.5 },
      lel: { low: 0, high: 10 },
      h2s: { low: 0, high: 10 },
      co: { low: 0, high: 35 }
    };

    for (const [param, value] of Object.entries(parameters)) {
      if (value !== undefined && thresholds[param as keyof typeof thresholds]) {
        const threshold = thresholds[param as keyof typeof thresholds];
        
        if (value < threshold.low) {
          alarms.push({
            parameter: param,
            level: value < threshold.low * 0.8 ? 'critical' : 'low',
            value,
            threshold: threshold.low,
            isActive: true,
            timestamp: now
          });
        } else if (value > threshold.high) {
          alarms.push({
            parameter: param,
            level: value > threshold.high * 1.2 ? 'critical' : 'high',
            value,
            threshold: threshold.high,
            isActive: true,
            timestamp: now
          });
        }
      }
    }

    return alarms;
  };

  // =================== EFFETS ===================

  // Initialisation
  useEffect(() => {
    checkBluetoothSupport();
  }, [checkBluetoothSupport]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      if (readingIntervalRef.current) clearTimeout(readingIntervalRef.current);
      
      // Déconnecter tous les appareils
      connectedDevicesRef.current.forEach((server) => {
        try {
          server.disconnect();
        } catch (error) {
          console.warn('Erreur lors de la déconnexion:', error);
        }
      });
      connectedDevicesRef.current.clear();
      characteristicsRef.current.clear();
    };
  }, []);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    ...state,
    
    // Actions principales
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    
    // Utilitaires
    clearError,
    checkBluetoothSupport,
    
    // Données calculées
    isAnyDeviceConnected: state.connectedDevices.length > 0,
    latestReadings: state.readings.slice(0, 10),
    activeAlarms: state.readings.flatMap(r => r.alarms.filter(a => a.isActive)),
    
    // Configuration
    config: finalConfig
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseBluetoothReturn = ReturnType<typeof useBluetooth>;

export default useBluetooth;
