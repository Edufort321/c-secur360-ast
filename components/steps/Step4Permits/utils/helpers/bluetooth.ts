// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/HELPERS/BLUETOOTH.TS ===================
// Helper Bluetooth pour connexion détecteurs atmosphériques et équipements de sécurité
"use client";

import type { 
  AtmosphericReading,
  GasType,
  AlarmLevel,
  BilingualText,
  NumericValue
} from '../../types';

// =================== INTERFACES BLUETOOTH ===================

export interface BluetoothDevice {
  id: string;
  name: string;
  type: BluetoothDeviceType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  batteryLevel: number;
  signalStrength: number;
  connectionStatus: BluetoothConnectionStatus;
  lastSeen: number;
  capabilities: BluetoothCapability[];
  services: BluetoothServiceUUID[];
  characteristics: BluetoothCharacteristic[];
  metadata: BluetoothDeviceMetadata;
}

export type BluetoothDeviceType = 
  | 'atmospheric_detector'     // Détecteur atmosphérique
  | 'personal_monitor'         // Moniteur personnel
  | 'ventilation_controller'   // Contrôleur ventilation
  | 'communication_device'     // Radio/communication
  | 'safety_equipment'         // Équipement sécurité
  | 'environmental_sensor'     // Capteur environnemental
  | 'emergency_beacon'         // Balise urgence
  | 'access_control'           // Contrôle accès
  | 'data_logger'              // Enregistreur données
  | 'pump_sampler';            // Pompe échantillonnage

export type BluetoothConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'pairing'
  | 'scanning'
  | 'timeout';

export interface BluetoothCapability {
  type: 'gas_detection' | 'environmental' | 'communication' | 'control' | 'data_storage';
  gases?: GasType[];
  ranges?: Array<{ gas: GasType; min: number; max: number; unit: string; }>;
  accuracy?: number;
  responseTime?: number;
  features: string[];
}

export interface BluetoothCharacteristic {
  uuid: string;
  name: string;
  properties: ('read' | 'write' | 'notify' | 'indicate')[];
  description: BilingualText;
  dataType: 'string' | 'number' | 'boolean' | 'bytes' | 'json';
  format?: string;
  unit?: string;
}

export interface BluetoothDeviceMetadata {
  calibrationDate: number;
  calibrationDue: number;
  maintenanceSchedule: {
    lastMaintenance: number;
    nextMaintenance: number;
    interval: number;
  };
  certifications: Array<{
    type: string;
    issuer: string;
    number: string;
    expiryDate: number;
  }>;
  operatingConditions: {
    temperatureRange: { min: number; max: number; };
    humidityRange: { min: number; max: number; };
    pressureRange: { min: number; max: number; };
  };
  specifications: {
    dimensions: { width: number; height: number; depth: number; };
    weight: number;
    powerSource: 'battery' | 'external' | 'rechargeable';
    batteryLife: number; // heures
    ipRating: string; // IP65, IP67, etc.
  };
}

export interface BluetoothScanOptions {
  deviceTypes?: BluetoothDeviceType[];
  manufacturers?: string[];
  scanDuration?: number; // ms
  rssiThreshold?: number; // dBm
  includePaired?: boolean;
  includeUnknown?: boolean;
  services?: BluetoothServiceUUID[];
  filters?: BluetoothScanFilter[];
}

export interface BluetoothScanFilter {
  type: 'name' | 'manufacturer' | 'service' | 'rssi' | 'custom';
  value: any;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
}

export interface BluetoothConnectionOptions {
  timeout?: number; // ms
  retryAttempts?: number;
  retryDelay?: number; // ms
  autoReconnect?: boolean;
  keepAlive?: boolean;
  subscribeToNotifications?: boolean;
  requestMtu?: number; // bytes
  securityLevel?: 'low' | 'medium' | 'high';
}

export interface BluetoothReading {
  deviceId: string;
  timestamp: number;
  data: BluetoothReadingData;
  quality: BluetoothReadingQuality;
  metadata: {
    signalStrength: number;
    batteryLevel: number;
    temperature: number;
    humidity: number;
    sequenceNumber?: number;
    checksum?: string;
  };
}

export interface BluetoothReadingData {
  gasReadings?: Array<{
    gasType: GasType;
    value: number;
    unit: string;
    alarmLevel: AlarmLevel;
    confidence: number;
  }>;
  environmental?: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed?: number;
    windDirection?: number;
  };
  status?: {
    operationalStatus: 'normal' | 'warning' | 'alarm' | 'fault';
    faults: string[];
    warnings: string[];
  };
  control?: {
    ventilationSpeed: number;
    damperPosition: number;
    pumpStatus: 'on' | 'off' | 'standby';
  };
}

export interface BluetoothReadingQuality {
  overall: 'excellent' | 'good' | 'fair' | 'poor';
  signalStrength: number; // 0-100
  dataIntegrity: number; // 0-100
  latency: number; // ms
  packetLoss: number; // %
  errors: string[];
}

export interface BluetoothCalibration {
  deviceId: string;
  gasType: GasType;
  referenceValue: number;
  measuredValue: number;
  deviation: number;
  passed: boolean;
  calibratedBy: string;
  timestamp: number;
  certificate?: {
    number: string;
    issuer: string;
    validUntil: number;
  };
  conditions: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
}

export interface BluetoothEvent {
  type: BluetoothEventType;
  deviceId: string;
  timestamp: number;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  handled: boolean;
}

export type BluetoothEventType = 
  | 'device_connected'
  | 'device_disconnected'
  | 'reading_received'
  | 'alarm_triggered'
  | 'battery_low'
  | 'calibration_due'
  | 'fault_detected'
  | 'communication_error'
  | 'data_corruption'
  | 'security_violation';

// UUIDs de services Bluetooth standards
export enum BluetoothServiceUUID {
  // Services standards
  BATTERY_SERVICE = '0000180F-0000-1000-8000-00805F9B34FB',
  DEVICE_INFORMATION = '0000180A-0000-1000-8000-00805F9B34FB',
  ENVIRONMENTAL_SENSING = '0000181A-0000-1000-8000-00805F9B34FB',
  
  // Services spécialisés détection gaz
  GAS_DETECTION_SERVICE = '12345678-1234-5678-9ABC-DEF012345678',
  ATMOSPHERIC_MONITORING = '87654321-4321-8765-CBA9-FED210987654',
  SAFETY_EQUIPMENT = 'ABCDEF12-3456-7890-ABCD-EF1234567890',
  
  // Services fabricants spécifiques
  HONEYWELL_GAS_DETECTOR = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
  DRAEGER_MONITOR = 'F1E2D3C4-B5A6-9807-FEDC-BA0987654321',
  MSA_ALTAIR = 'FEDCBA98-7654-3210-FEDC-BA0987654321',
  INDUSTRIAL_SCIENTIFIC = '12345ABC-DEF0-1234-5678-9ABCDEF01234'
}

// =================== CLASSE PRINCIPALE BLUETOOTHMANAGER ===================

export class BluetoothManager {
  private devices: Map<string, BluetoothDevice> = new Map();
  private connections: Map<string, any> = new Map();
  private eventListeners: Array<(event: BluetoothEvent) => void> = [];
  private scanInProgress: boolean = false;
  private autoReconnectEnabled: boolean = true;
  private readingInterval: number = 1000; // ms

  constructor() {
    this.initializeBluetoothSupport();
  }

  // =================== MÉTHODES PRINCIPALES ===================

  /**
   * Scanner les appareils Bluetooth disponibles
   */
  async scanDevices(options?: BluetoothScanOptions): Promise<BluetoothDevice[]> {
    if (this.scanInProgress) {
      throw new Error('Scan already in progress');
    }

    if (!this.isBluetoothSupported()) {
      throw new Error('Bluetooth not supported in this browser');
    }

    this.scanInProgress = true;
    const discoveredDevices: BluetoothDevice[] = [];

    try {
      const scanOptions = {
        deviceTypes: options?.deviceTypes || ['atmospheric_detector'],
        scanDuration: options?.scanDuration || 10000,
        rssiThreshold: options?.rssiThreshold || -80,
        includePaired: options?.includePaired ?? true,
        includeUnknown: options?.includeUnknown ?? false,
        ...options
      };

      // Utiliser Web Bluetooth API
      const device = await navigator.bluetooth.requestDevice({
        filters: this.createBluetoothFilters(scanOptions),
        optionalServices: Object.values(BluetoothServiceUUID)
      });

      if (device) {
        const bluetoothDevice = await this.createBluetoothDevice(device);
        discoveredDevices.push(bluetoothDevice);
        this.devices.set(bluetoothDevice.id, bluetoothDevice);
      }

      return discoveredDevices;

    } catch (error) {
      this.emitEvent({
        type: 'communication_error',
        deviceId: 'scanner',
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error',
        handled: false
      });
      throw error;
    } finally {
      this.scanInProgress = false;
    }
  }

  /**
   * Connecter à un appareil spécifique
   */
  async connectDevice(
    deviceId: string, 
    options?: BluetoothConnectionOptions
  ): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const connectionOptions = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000,
      autoReconnect: true,
      keepAlive: true,
      subscribeToNotifications: true,
      securityLevel: 'medium',
      ...options
    };

    try {
      device.connectionStatus = 'connecting';
      this.updateDevice(device);

      // Simuler connexion (à remplacer par vraie implémentation Web Bluetooth)
      const connection = await this.establishConnection(device, connectionOptions);
      
      if (connection) {
        this.connections.set(deviceId, connection);
        device.connectionStatus = 'connected';
        device.lastSeen = Date.now();
        this.updateDevice(device);

        // Démarrer lecture continue si c'est un détecteur
        if (device.type === 'atmospheric_detector') {
          this.startContinuousReading(deviceId);
        }

        this.emitEvent({
          type: 'device_connected',
          deviceId,
          timestamp: Date.now(),
          data: { device },
          severity: 'info',
          handled: false
        });

        return true;
      }

      return false;

    } catch (error) {
      device.connectionStatus = 'error';
      this.updateDevice(device);
      
      this.emitEvent({
        type: 'communication_error',
        deviceId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : 'Connection failed' },
        severity: 'error',
        handled: false
      });

      throw error;
    }
  }

  /**
   * Déconnecter un appareil
   */
  async disconnectDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    const connection = this.connections.get(deviceId);

    if (device) {
      device.connectionStatus = 'disconnected';
      this.updateDevice(device);
    }

    if (connection) {
      await this.closeConnection(connection);
      this.connections.delete(deviceId);
    }

    this.emitEvent({
      type: 'device_disconnected',
      deviceId,
      timestamp: Date.now(),
      data: {},
      severity: 'info',
      handled: false
    });

    return true;
  }

  /**
   * Lire données d'un appareil
   */
  async readDeviceData(deviceId: string): Promise<BluetoothReading | null> {
    const device = this.devices.get(deviceId);
    const connection = this.connections.get(deviceId);

    if (!device || !connection || device.connectionStatus !== 'connected') {
      return null;
    }

    try {
      // Lire données selon le type d'appareil
      const rawData = await this.readRawData(connection, device);
      const reading = this.parseBluetoothReading(deviceId, rawData, device);

      // Vérifier alarmes
      this.checkAlarms(reading);

      this.emitEvent({
        type: 'reading_received',
        deviceId,
        timestamp: Date.now(),
        data: reading,
        severity: 'info',
        handled: false
      });

      return reading;

    } catch (error) {
      this.emitEvent({
        type: 'communication_error',
        deviceId,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : 'Read failed' },
        severity: 'warning',
        handled: false
      });

      return null;
    }
  }

  /**
   * Calibrer un détecteur de gaz
   */
  async calibrateDevice(
    deviceId: string,
    gasType: GasType,
    referenceValue: number,
    conditions: { temperature: number; humidity: number; pressure: number; }
  ): Promise<BluetoothCalibration> {
    const device = this.devices.get(deviceId);
    if (!device || device.connectionStatus !== 'connected') {
      throw new Error('Device not connected');
    }

    if (device.type !== 'atmospheric_detector') {
      throw new Error('Device does not support calibration');
    }

    try {
      // Effectuer calibration
      const measuredValue = await this.performCalibration(deviceId, gasType, referenceValue);
      const deviation = Math.abs((measuredValue - referenceValue) / referenceValue) * 100;
      const passed = deviation <= 5; // 5% tolérance

      const calibration: BluetoothCalibration = {
        deviceId,
        gasType,
        referenceValue,
        measuredValue,
        deviation,
        passed,
        calibratedBy: 'System',
        timestamp: Date.now(),
        conditions
      };

      // Mettre à jour métadonnées appareil
      device.metadata.calibrationDate = Date.now();
      device.metadata.calibrationDue = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 jours
      this.updateDevice(device);

      return calibration;

    } catch (error) {
      throw new Error(`Calibration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtenir statut détaillé d'un appareil
   */
  getDeviceStatus(deviceId: string): {
    device: BluetoothDevice | null;
    connection: any;
    lastReading: BluetoothReading | null;
    healthScore: number;
    issues: string[];
  } {
    const device = this.devices.get(deviceId);
    const connection = this.connections.get(deviceId);
    
    let healthScore = 0;
    const issues: string[] = [];

    if (device) {
      // Calculer score santé
      if (device.connectionStatus === 'connected') healthScore += 30;
      if (device.batteryLevel > 20) healthScore += 20;
      else issues.push('Battery low');
      
      if (device.signalStrength > -70) healthScore += 20;
      else issues.push('Weak signal');
      
      if (Date.now() - device.metadata.calibrationDate < 90 * 24 * 60 * 60 * 1000) {
        healthScore += 20;
      } else {
        issues.push('Calibration due');
      }
      
      if (Date.now() - device.lastSeen < 60000) healthScore += 10;
      else issues.push('Last seen > 1 minute ago');
    }

    return {
      device: device || null,
      connection: connection || null,
      lastReading: null, // TODO: implémenter cache readings
      healthScore,
      issues
    };
  }

  /**
   * Convertir lecture Bluetooth en AtmosphericReading
   */
  convertToAtmosphericReading(
    reading: BluetoothReading,
    location: { coordinates: any; point: string; }
  ): AtmosphericReading[] {
    if (!reading.data.gasReadings) return [];

    return reading.data.gasReadings.map(gasReading => ({
      id: `${reading.deviceId}_${reading.timestamp}_${gasReading.gasType}`,
      timestamp: reading.timestamp,
      gasType: gasReading.gasType,
      value: gasReading.value,
      unit: gasReading.unit,
      alarmLevel: gasReading.alarmLevel,
      confidence: gasReading.confidence,
      location,
      environmentalConditions: reading.data.environmental || {
        temperature: 20,
        humidity: 50,
        pressure: 101.3
      },
      metadata: {
        equipment: {
          model: this.devices.get(reading.deviceId)?.model || 'Unknown',
          serialNumber: this.devices.get(reading.deviceId)?.serialNumber || 'Unknown',
          lastCalibration: this.devices.get(reading.deviceId)?.metadata.calibrationDate || 0,
          batteryLevel: reading.metadata.batteryLevel / 100
        },
        operator: 'Bluetooth System',
        qualityAssurance: {
          validated: reading.quality.overall !== 'poor',
          flagged: reading.quality.errors.length > 0,
          notes: reading.quality.errors
        }
      }
    }));
  }

  // =================== MÉTHODES ÉVÉNEMENTS ===================

  /**
   * Ajouter listener d'événements
   */
  addEventListener(listener: (event: BluetoothEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Émettre événement
   */
  private emitEvent(event: BluetoothEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in Bluetooth event listener:', error);
      }
    });
  }

  // =================== MÉTHODES PRIVÉES ===================

  private initializeBluetoothSupport(): void {
    if (!this.isBluetoothSupported()) {
      console.warn('Bluetooth not supported in this browser');
      return;
    }

    // Écouter événements Bluetooth système
    if ('bluetooth' in navigator) {
      navigator.bluetooth.addEventListener('availabilitychanged', (event: any) => {
        this.emitEvent({
          type: 'device_connected',
          deviceId: 'system',
          timestamp: Date.now(),
          data: { available: event.value },
          severity: 'info',
          handled: false
        });
      });
    }
  }

  private isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator && typeof navigator.bluetooth.requestDevice === 'function';
  }

  private createBluetoothFilters(options: BluetoothScanOptions): any[] {
    const filters: any[] = [];

    // Filtres par services
    if (options.services && options.services.length > 0) {
      filters.push({
        services: options.services
      });
    }

    // Filtres par fabricant
    if (options.manufacturers && options.manufacturers.length > 0) {
      options.manufacturers.forEach(manufacturer => {
        filters.push({
          namePrefix: manufacturer
        });
      });
    }

    // Filtre par défaut pour détecteurs atmosphériques
    if (filters.length === 0) {
      filters.push({
        services: [BluetoothServiceUUID.GAS_DETECTION_SERVICE]
      });
    }

    return filters;
  }

  private async createBluetoothDevice(nativeDevice: any): Promise<BluetoothDevice> {
    const gatt = await nativeDevice.gatt?.connect();
    
    // Lire informations de base
    const deviceInfo = await this.readDeviceInformation(gatt);
    const batteryLevel = await this.readBatteryLevel(gatt);
    const capabilities = await this.detectCapabilities(gatt);

    return {
      id: nativeDevice.id,
      name: nativeDevice.name || 'Unknown Device',
      type: this.detectDeviceType(nativeDevice),
      manufacturer: deviceInfo.manufacturer || 'Unknown',
      model: deviceInfo.model || 'Unknown',
      serialNumber: deviceInfo.serialNumber || 'Unknown',
      firmwareVersion: deviceInfo.firmwareVersion || 'Unknown',
      batteryLevel: batteryLevel || 0,
      signalStrength: -50, // TODO: lire RSSI réel
      connectionStatus: 'disconnected',
      lastSeen: Date.now(),
      capabilities,
      services: [], // TODO: lire services disponibles
      characteristics: [], // TODO: lire caractéristiques
      metadata: {
        calibrationDate: 0,
        calibrationDue: 0,
        maintenanceSchedule: {
          lastMaintenance: 0,
          nextMaintenance: 0,
          interval: 30 * 24 * 60 * 60 * 1000 // 30 jours
        },
        certifications: [],
        operatingConditions: {
          temperatureRange: { min: -20, max: 60 },
          humidityRange: { min: 0, max: 95 },
          pressureRange: { min: 80, max: 120 }
        },
        specifications: {
          dimensions: { width: 100, height: 50, depth: 25 },
          weight: 200,
          powerSource: 'battery',
          batteryLife: 24,
          ipRating: 'IP65'
        }
      }
    };
  }

  private detectDeviceType(device: any): BluetoothDeviceType {
    const name = device.name?.toLowerCase() || '';
    
    if (name.includes('gas') || name.includes('detector') || name.includes('monitor')) {
      return 'atmospheric_detector';
    }
    if (name.includes('ventil') || name.includes('fan')) {
      return 'ventilation_controller';
    }
    if (name.includes('radio') || name.includes('comm')) {
      return 'communication_device';
    }
    
    return 'atmospheric_detector'; // Par défaut
  }

  private async readDeviceInformation(gatt: any): Promise<any> {
    // TODO: implémenter lecture réelle des informations appareil
    return {
      manufacturer: 'Generic',
      model: 'GX-2012',
      serialNumber: '123456789',
      firmwareVersion: '1.0.0'
    };
  }

  private async readBatteryLevel(gatt: any): Promise<number> {
    // TODO: implémenter lecture réelle du niveau batterie
    return Math.floor(Math.random() * 100);
  }

  private async detectCapabilities(gatt: any): Promise<BluetoothCapability[]> {
    // TODO: détecter capacités réelles de l'appareil
    return [
      {
        type: 'gas_detection',
        gases: ['oxygen', 'carbon_monoxide', 'hydrogen_sulfide', 'methane'],
        ranges: [
          { gas: 'oxygen', min: 0, max: 25, unit: '%' },
          { gas: 'carbon_monoxide', min: 0, max: 1000, unit: 'ppm' },
          { gas: 'hydrogen_sulfide', min: 0, max: 100, unit: 'ppm' },
          { gas: 'methane', min: 0, max: 100, unit: '%LEL' }
        ],
        accuracy: 0.1,
        responseTime: 30,
        features: ['alarm', 'vibration', 'data_logging']
      }
    ];
  }

  private async establishConnection(device: BluetoothDevice, options: BluetoothConnectionOptions): Promise<any> {
    // TODO: implémenter vraie connexion Bluetooth
    return { connected: true, device: device.id };
  }

  private async closeConnection(connection: any): Promise<void> {
    // TODO: implémenter fermeture connexion
  }

  private async readRawData(connection: any, device: BluetoothDevice): Promise<any> {
    // TODO: lire données réelles de l'appareil
    return {
      gasReadings: [
        {
          gasType: 'oxygen' as GasType,
          value: 20.9,
          unit: '%',
          alarmLevel: 'safe' as AlarmLevel,
          confidence: 0.95
        }
      ],
      environmental: {
        temperature: 22,
        humidity: 45,
        pressure: 101.3
      }
    };
  }

  private parseBluetoothReading(deviceId: string, rawData: any, device: BluetoothDevice): BluetoothReading {
    return {
      deviceId,
      timestamp: Date.now(),
      data: rawData,
      quality: {
        overall: 'good',
        signalStrength: device.signalStrength,
        dataIntegrity: 95,
        latency: 50,
        packetLoss: 0,
        errors: []
      },
      metadata: {
        signalStrength: device.signalStrength,
        batteryLevel: device.batteryLevel,
        temperature: 22,
        humidity: 45
      }
    };
  }

  private checkAlarms(reading: BluetoothReading): void {
    if (!reading.data.gasReadings) return;

    reading.data.gasReadings.forEach(gasReading => {
      if (['danger', 'critical', 'extreme'].includes(gasReading.alarmLevel)) {
        this.emitEvent({
          type: 'alarm_triggered',
          deviceId: reading.deviceId,
          timestamp: Date.now(),
          data: {
            gasType: gasReading.gasType,
            value: gasReading.value,
            alarmLevel: gasReading.alarmLevel
          },
          severity: gasReading.alarmLevel === 'extreme' ? 'critical' : 'warning',
          handled: false
        });
      }
    });
  }

  private startContinuousReading(deviceId: string): void {
    const interval = setInterval(async () => {
      const device = this.devices.get(deviceId);
      if (!device || device.connectionStatus !== 'connected') {
        clearInterval(interval);
        return;
      }

      try {
        await this.readDeviceData(deviceId);
      } catch (error) {
        console.error('Error reading device data:', error);
      }
    }, this.readingInterval);
  }

  private async performCalibration(deviceId: string, gasType: GasType, referenceValue: number): Promise<number> {
    // TODO: implémenter vraie calibration
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    return referenceValue * (1 + variance);
  }

  private updateDevice(device: BluetoothDevice): void {
    this.devices.set(device.id, device);
  }

  // =================== MÉTHODES PUBLIQUES UTILITAIRES ===================

  /**
   * Obtenir tous les appareils découverts
   */
  getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Obtenir appareils connectés
   */
  getConnectedDevices(): BluetoothDevice[] {
    return Array.from(this.devices.values())
      .filter(device => device.connectionStatus === 'connected');
  }

  /**
   * Obtenir détecteurs atmosphériques connectés
   */
  getAtmosphericDetectors(): BluetoothDevice[] {
    return this.getConnectedDevices()
      .filter(device => device.type === 'atmospheric_detector');
  }

  /**
   * Vérifier si un appareil nécessite une calibration
   */
  isCalibrationDue(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    
    return Date.now() > device.metadata.calibrationDue;
  }

  /**
   * Obtenir batteries faibles
   */
  getLowBatteryDevices(): BluetoothDevice[] {
    return Array.from(this.devices.values())
      .filter(device => device.batteryLevel < 20);
  }
}

// =================== INSTANCE SINGLETON ===================

let bluetoothManagerInstance: BluetoothManager | null = null;

/**
 * Obtenir instance singleton du manager Bluetooth
 */
export function getBluetoothManager(): BluetoothManager {
  if (!bluetoothManagerInstance) {
    bluetoothManagerInstance = new BluetoothManager();
  }
  return bluetoothManagerInstance;
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Scanner rapidement les détecteurs atmosphériques
 */
export async function scanAtmosphericDetectors(): Promise<BluetoothDevice[]> {
  const manager = getBluetoothManager();
  return manager.scanDevices({
    deviceTypes: ['atmospheric_detector'],
    scanDuration: 5000
  });
}

/**
 * Connecter à un détecteur spécifique
 */
export async function connectAtmosphericDetector(deviceId: string): Promise<boolean> {
  const manager = getBluetoothManager();
  return manager.connectDevice(deviceId, {
    timeout: 10000,
    autoReconnect: true,
    subscribeToNotifications: true
  });
}

/**
 * Lire données atmosphériques de tous les détecteurs connectés
 */
export async function readAllAtmosphericData(): Promise<AtmosphericReading[]> {
  const manager = getBluetoothManager();
  const detectors = manager.getAtmosphericDetectors();
  const allReadings: AtmosphericReading[] = [];

  for (const detector of detectors) {
    try {
      const reading = await manager.readDeviceData(detector.id);
      if (reading) {
        const atmosphericReadings = manager.convertToAtmosphericReading(reading, {
          coordinates: { latitude: 0, longitude: 0 },
          point: 'bluetooth_detector'
        });
        allReadings.push(...atmosphericReadings);
      }
    } catch (error) {
      console.error(`Error reading from detector ${detector.id}:`, error);
    }
  }

  return allReadings;
}

/**
 * Vérifier état de santé de tous les appareils
 */
export function checkDevicesHealth(): Array<{
  deviceId: string;
  healthScore: number;
  issues: string[];
}> {
  const manager = getBluetoothManager();
  const devices = manager.getDiscoveredDevices();
  
  return devices.map(device => {
    const status = manager.getDeviceStatus(device.id);
    return {
      deviceId: device.id,
      healthScore: status.healthScore,
      issues: status.issues
    };
  });
}

// =================== EXPORTS ===================
export default BluetoothManager;
