// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/HELPERS/INDEX.TS ===================
// Centralisation et export de tous les helpers pour système de permis
"use client";

// =================== EXPORTS BLUETOOTH ===================
export {
  BluetoothManager,
  getBluetoothManager,
  scanAtmosphericDetectors,
  connectAtmosphericDetector,
  readAllAtmosphericData,
  checkDevicesHealth,
  BluetoothServiceUUID
} from './bluetooth';

export type {
  BluetoothDevice,
  BluetoothDeviceType,
  BluetoothConnectionStatus,
  BluetoothCapability,
  BluetoothCharacteristic,
  BluetoothDeviceMetadata,
  BluetoothScanOptions,
  BluetoothConnectionOptions,
  BluetoothReading,
  BluetoothReadingData,
  BluetoothReadingQuality,
  BluetoothCalibration,
  BluetoothEvent,
  BluetoothEventType
} from './bluetooth';

// =================== EXPORTS CALCULATIONS ===================
export {
  AtmosphericCalculations,
  PHYSICAL_CONSTANTS,
  GAS_PROPERTIES,
  quickPpmToMgPerM3,
  quickCalculateLEL,
  quickRiskAssessment,
  quickVentilationCalc
} from './calculations';

export type {
  AtmosphericCalculationResult,
  AtmosphericCorrection,
  CorrectionType,
  CalculationMethod,
  GasProperties,
  EnvironmentalConditions,
  VentilationCalculation,
  VentilationRecommendation,
  RiskAssessmentCalculation,
  RiskLevel,
  RiskFactor,
  RiskRecommendation,
  ExposureCalculation
} from './calculations';

// =================== EXPORTS FORMATTERS ===================
export {
  DataFormatter,
  LOCALE_MAPPINGS,
  CURRENCY_SYMBOLS,
  UNIT_ABBREVIATIONS,
  GAS_COLOR_SCALES,
  ALARM_LEVEL_COLORS,
  PRIORITY_COLORS,
  GAS_ICONS,
  ALARM_ICONS,
  STATUS_ICONS,
  quickFormatAtmospheric,
  quickFormatTime,
  quickFormatPercent,
  quickFormatMoney,
  getAlarmColor,
  getGasIcon,
  getAtmosphericClassName,
  formatRange,
  formatBilingualList,
  generateTooltip
} from './formatters';

export type {
  FormattingOptions,
  FormattedValue,
  ColorScale,
  IconMapping,
  UnitConversion
} from './formatters';

// =================== EXPORTS OFFLINE ===================
export {
  OfflineManager,
  getOfflineManager,
  isOfflineModeAvailable,
  quickStoreAtmospheric,
  getConnectionStatus,
  estimateSyncTime,
  checkStorageQuota
} from './offline';

export type {
  OfflineConfig,
  OfflineData,
  OfflineDataType,
  OfflinePriority,
  SyncStatus,
  SyncError,
  ConflictResolution,
  OfflineCapabilities,
  CacheManifest
} from './offline';

// =================== HELPERS INTÉGRÉS SPÉCIALISÉS ===================

/**
 * Helper intégré pour lecture atmosphérique complète
 * Combine Bluetooth + Calculations + Formatters + Offline
 */
export class IntegratedAtmosphericHelper {
  private bluetoothManager = getBluetoothManager();
  private offlineManager = getOfflineManager();

  /**
   * Lecture atmosphérique complète avec traitement intégré
   */
  async performCompleteAtmosphericReading(options?: {
    deviceId?: string;
    location?: { coordinates: any; point: string; };
    storeOffline?: boolean;
    language?: 'fr' | 'en';
  }) {
    try {
      // 1. Lire données Bluetooth
      const readings = options?.deviceId ? 
        [await this.bluetoothManager.readDeviceData(options.deviceId)] :
        await readAllAtmosphericData();

      if (!readings.length || !readings[0]) {
        throw new Error('No atmospheric readings available');
      }

      const bluetoothReading = readings[0];
      
      // 2. Convertir en AtmosphericReading standard
      const atmosphericReadings = this.bluetoothManager.convertToAtmosphericReading(
        bluetoothReading,
        options?.location || { 
          coordinates: { latitude: 0, longitude: 0 }, 
          point: 'bluetooth_detector' 
        }
      );

      // 3. Appliquer calculs et corrections
      const processedReadings = await Promise.all(
        atmosphericReadings.map(async (reading) => {
          // Corrections atmosphériques
          if (reading.unit === 'ppm') {
            const corrected = AtmosphericCalculations.ppmToMgPerM3(
              reading.value,
              reading.gasType,
              reading.environmentalConditions
            );
            
            // Ajouter lecture corrigée
            return {
              ...reading,
              correctedValue: corrected.value,
              correctedUnit: corrected.unit,
              corrections: corrected.corrections,
              confidence: Math.min(reading.confidence, corrected.confidence)
            };
          }
          return reading;
        })
      );

      // 4. Stocker hors ligne si demandé
      if (options?.storeOffline !== false) {
        await Promise.all(
          processedReadings.map(reading => 
            this.offlineManager.storeAtmosphericReading(reading)
          )
        );
      }

      // 5. Formater pour affichage
      const formattedReadings = processedReadings.map(reading => ({
        ...reading,
        formatted: DataFormatter.formatAtmosphericReading(reading, {
          language: options?.language || 'fr',
          colorCoded: true,
          includeIcon: true,
          includeTooltip: true
        })
      }));

      // 6. Évaluer risques
      const riskAssessment = AtmosphericCalculations.assessAtmosphericRisk(
        processedReadings,
        { volume: 100, depth: 2, ventilation: 'none', access: 'top', drainage: false },
        ['inspection'],
        1
      );

      return {
        success: true,
        readings: formattedReadings,
        riskAssessment,
        deviceInfo: {
          deviceId: options?.deviceId,
          batteryLevel: bluetoothReading.metadata.batteryLevel,
          signalStrength: bluetoothReading.metadata.signalStrength
        },
        metadata: {
          timestamp: Date.now(),
          location: options?.location,
          storedOffline: options?.storeOffline !== false
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Surveillance continue avec alertes automatiques
   */
  startContinuousMonitoring(options?: {
    interval?: number; // ms
    alertThresholds?: Record<string, number>;
    autoSync?: boolean;
    language?: 'fr' | 'en';
  }) {
    const interval = options?.interval || 30000; // 30s par défaut
    
    return setInterval(async () => {
      try {
        const result = await this.performCompleteAtmosphericReading({
          storeOffline: true,
          language: options?.language
        });

        if (result.success && result.readings) {
          // Vérifier seuils d'alerte
          const criticalReadings = result.readings.filter(reading => 
            ['danger', 'critical', 'extreme'].includes(reading.alarmLevel)
          );

          if (criticalReadings.length > 0) {
            this.handleCriticalAlert(criticalReadings, options?.language);
          }

          // Synchronisation automatique si demandée
          if (options?.autoSync && navigator.onLine) {
            await this.offlineManager.synchronize({ 
              priority: ['critical', 'high'],
              batchSize: 5 
            });
          }
        }
      } catch (error) {
        console.error('Continuous monitoring error:', error);
      }
    }, interval);
  }

  private async handleCriticalAlert(readings: any[], language: 'fr' | 'en' = 'fr') {
    // Émettre événement critique
    const event = new CustomEvent('atmosphericAlert', {
      detail: {
        readings,
        timestamp: Date.now(),
        language
      }
    });
    window.dispatchEvent(event);

    // Log pour debugging
    console.warn('🚨 ATMOSPHERIC ALERT:', readings.map(r => 
      `${r.gasType}: ${r.value} ${r.unit} (${r.alarmLevel})`
    ));
  }
}

/**
 * Helper intégré pour gestion permis complète
 */
export class IntegratedPermitHelper {
  private offlineManager = getOfflineManager();

  /**
   * Sauvegarder permis complet avec toutes dépendances
   */
  async saveCompletePermit(
    permit: any,
    formData?: any,
    signatures?: any[],
    atmosphericData?: any[],
    options?: {
      priority?: 'critical' | 'high' | 'medium';
      compress?: boolean;
      language?: 'fr' | 'en';
    }
  ) {
    const savedIds: string[] = [];
    
    try {
      // 1. Sauvegarder permis principal
      const permitId = await this.offlineManager.storeOfflineData(
        'permit',
        permit,
        {
          priority: options?.priority || 'high',
          compress: options?.compress ?? true,
          tags: ['permit', permit.category, permit.status]
        }
      );
      savedIds.push(permitId);

      // 2. Sauvegarder formulaire avec dépendance
      if (formData) {
        const formId = await this.offlineManager.storeOfflineData(
          'permit_form',
          formData,
          {
            priority: 'medium',
            dependencies: [permitId],
            tags: ['form', permit.category]
          }
        );
        savedIds.push(formId);
      }

      // 3. Sauvegarder signatures avec chiffrement
      if (signatures && signatures.length > 0) {
        for (const signature of signatures) {
          const sigId = await this.offlineManager.storeSignature({
            ...signature,
            documentId: permitId
          });
          savedIds.push(sigId);
        }
      }

      // 4. Sauvegarder données atmosphériques liées
      if (atmosphericData && atmosphericData.length > 0) {
        for (const reading of atmosphericData) {
          const readingId = await this.offlineManager.storeAtmosphericReading({
            ...reading,
            permitId
          });
          savedIds.push(readingId);
        }
      }

      // 5. Formater résumé pour affichage
      const summary = this.generatePermitSummary(permit, formData, options?.language);

      return {
        success: true,
        permitId,
        savedIds,
        summary,
        metadata: {
          timestamp: Date.now(),
          totalItems: savedIds.length,
          language: options?.language || 'fr'
        }
      };

    } catch (error) {
      // Rollback en cas d'erreur
      await this.rollbackSavedData(savedIds);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Save failed',
        partialIds: savedIds
      };
    }
  }

  private generatePermitSummary(permit: any, formData?: any, language: 'fr' | 'en' = 'fr') {
    const formatted = DataFormatter.formatTimestamp(Date.now(), 'full', { language });
    
    return {
      title: permit.name || 'Permit',
      id: permit.id,
      type: permit.category,
      status: permit.status,
      createdAt: formatted.display,
      personnel: formData?.entrants?.length || 0,
      supervisor: formData?.supervisor?.name || 'N/A'
    };
  }

  private async rollbackSavedData(ids: string[]) {
    for (const id of ids) {
      try {
        await this.offlineManager.cleanup({ force: true });
      } catch (error) {
        console.error('Rollback failed for:', id, error);
      }
    }
  }
}

/**
 * Helper intégré pour diagnostics système
 */
export class SystemDiagnosticsHelper {
  private bluetoothManager = getBluetoothManager();
  private offlineManager = getOfflineManager();

  /**
   * Diagnostic complet du système
   */
  async performSystemDiagnostics(language: 'fr' | 'en' = 'fr') {
    const startTime = Date.now();
    
    // 1. Capacités système
    const capabilities = await this.offlineManager.getOfflineCapabilities();
    
    // 2. État connexions Bluetooth
    const bluetoothDevices = this.bluetoothManager.getDiscoveredDevices();
    const connectedDevices = this.bluetoothManager.getConnectedDevices();
    const deviceHealth = checkDevicesHealth();
    
    // 3. Statut synchronisation
    const syncStatus = this.offlineManager.getSyncStatus();
    
    // 4. Quota storage
    const storageQuota = await checkStorageQuota();
    
    // 5. État connexion réseau
    const connectionStatus = getConnectionStatus();
    
    // 6. Performance calculations
    const performanceTest = this.runPerformanceTests();
    
    const diagnostics = {
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      system: {
        capabilities,
        storage: storageQuota,
        network: connectionStatus
      },
      bluetooth: {
        discovered: bluetoothDevices.length,
        connected: connectedDevices.length,
        health: deviceHealth
      },
      offline: {
        syncStatus,
        pendingItems: syncStatus.pendingItems,
        offlineDuration: syncStatus.offlineDuration
      },
      performance: performanceTest,
      recommendations: this.generateRecommendations({
        capabilities,
        syncStatus,
        deviceHealth,
        storageQuota
      }, language)
    };

    return diagnostics;
  }

  private runPerformanceTests() {
    const start = performance.now();
    
    // Test calculs
    quickPpmToMgPerM3(100, 'carbon_monoxide');
    quickCalculateLEL(2.5, '%', 'methane');
    
    // Test formatage
    quickFormatAtmospheric(85, 'ppm', 'carbon_monoxide', 'danger');
    quickFormatTime(Date.now(), 'relative');
    
    const calculationsTime = performance.now() - start;
    
    return {
      calculationsTime,
      rating: calculationsTime < 10 ? 'excellent' : 
              calculationsTime < 50 ? 'good' : 
              calculationsTime < 100 ? 'fair' : 'poor'
    };
  }

  private generateRecommendations(data: any, language: 'fr' | 'en') {
    const recommendations: Array<{ priority: string; message: string; action: string; }> = [];
    
    // Storage recommendations
    if (data.storageQuota.percentage > 80) {
      recommendations.push({
        priority: 'high',
        message: language === 'fr' ? 
          'Espace de stockage faible' : 
          'Low storage space',
        action: language === 'fr' ? 
          'Nettoyer les données anciennes' : 
          'Clean old data'
      });
    }
    
    // Sync recommendations
    if (data.syncStatus.pendingItems > 20) {
      recommendations.push({
        priority: 'medium',
        message: language === 'fr' ? 
          'Nombreux éléments en attente de synchronisation' : 
          'Many items pending sync',
        action: language === 'fr' ? 
          'Synchroniser manuellement' : 
          'Sync manually'
      });
    }
    
    // Device health recommendations
    const unhealthyDevices = data.deviceHealth.filter((d: any) => d.healthScore < 70);
    if (unhealthyDevices.length > 0) {
      recommendations.push({
        priority: 'high',
        message: language === 'fr' ? 
          `${unhealthyDevices.length} appareil(s) nécessitent attention` : 
          `${unhealthyDevices.length} device(s) need attention`,
        action: language === 'fr' ? 
          'Vérifier batteries et calibration' : 
          'Check batteries and calibration'
      });
    }
    
    return recommendations;
  }
}

// =================== INSTANCES GLOBALES ===================

/**
 * Instance globale helper atmosphérique intégré
 */
export const atmosphericHelper = new IntegratedAtmosphericHelper();

/**
 * Instance globale helper permis intégré
 */
export const permitHelper = new IntegratedPermitHelper();

/**
 * Instance globale helper diagnostics système
 */
export const systemDiagnostics = new SystemDiagnosticsHelper();

// =================== FONCTIONS UTILITAIRES GLOBALES ===================

/**
 * Initialisation complète du système de permis
 */
export async function initializePermitSystem(config?: {
  offlineConfig?: any;
  bluetoothConfig?: any;
  language?: 'fr' | 'en';
}) {
  try {
    // 1. Initialiser gestionnaires
    const offlineManager = getOfflineManager(config?.offlineConfig);
    const bluetoothManager = getBluetoothManager();
    
    // 2. Vérifier capacités
    const capabilities = await offlineManager.getOfflineCapabilities();
    
    // 3. Scanner appareils Bluetooth
    let bluetoothDevices: any[] = [];
    try {
      bluetoothDevices = await scanAtmosphericDetectors();
    } catch (error) {
      console.warn('Bluetooth scan failed:', error);
    }
    
    // 4. Diagnostic initial
    const diagnostics = await systemDiagnostics.performSystemDiagnostics(
      config?.language || 'fr'
    );
    
    return {
      success: true,
      capabilities,
      bluetoothDevices: bluetoothDevices.length,
      diagnostics,
      helpers: {
        atmospheric: atmosphericHelper,
        permit: permitHelper,
        diagnostics: systemDiagnostics
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Initialization failed'
    };
  }
}

/**
 * Nettoyage complet du système
 */
export async function cleanupPermitSystem(options?: {
  force?: boolean;
  keepCritical?: boolean;
}) {
  const offlineManager = getOfflineManager();
  
  const cleanupResult = await offlineManager.cleanup({
    force: options?.force || false,
    olderThan: 7 * 24 * 60 * 60 * 1000, // 7 jours
    priority: options?.keepCritical ? ['cache', 'low'] : undefined
  });
  
  return {
    cleaned: cleanupResult.removed,
    freedSpace: cleanupResult.freedSpace,
    timestamp: Date.now()
  };
}

/**
 * Export de sauvegarde complet
 */
export async function exportSystemBackup() {
  const offlineManager = getOfflineManager();
  
  const backup = await offlineManager.exportOfflineData({
    types: ['atmospheric_reading', 'permit', 'permit_form', 'signature'],
    includeMetadata: true,
    compress: true
  });
  
  return backup;
}

/**
 * Obtenir résumé statut système
 */
export function getSystemStatus(language: 'fr' | 'en' = 'fr') {
  const bluetoothManager = getBluetoothManager();
  const offlineManager = getOfflineManager();
  
  const connectedDevices = bluetoothManager.getConnectedDevices().length;
  const syncStatus = offlineManager.getSyncStatus();
  const connectionStatus = getConnectionStatus();
  
  return {
    online: connectionStatus.isOnline,
    bluetoothDevices: connectedDevices,
    pendingSync: syncStatus.pendingItems,
    offlineDuration: syncStatus.offlineDuration,
    formatted: {
      status: connectionStatus.isOnline ? 
        (language === 'fr' ? 'En ligne' : 'Online') :
        (language === 'fr' ? 'Hors ligne' : 'Offline'),
      devices: `${connectedDevices} ${language === 'fr' ? 'appareils' : 'devices'}`,
      pending: `${syncStatus.pendingItems} ${language === 'fr' ? 'en attente' : 'pending'}`
    }
  };
}

// =================== CONSTANTS GLOBALES ===================

/**
 * Configuration par défaut système de permis
 */
export const DEFAULT_PERMIT_SYSTEM_CONFIG = {
  offline: {
    enableOfflineMode: true,
    maxStorageSize: 100, // MB
    syncRetryAttempts: 5,
    backgroundSync: true,
    criticalDataPriority: ['atmospheric_reading', 'signature', 'permit']
  },
  formatting: {
    language: 'fr' as const,
    locale: 'fr-CA',
    precision: 2,
    colorCoded: true,
    includeIcon: true
  },
  monitoring: {
    continuousInterval: 30000, // 30s
    autoSync: true,
    alertThresholds: {
      oxygen: { min: 19.5, max: 23.5 },
      carbon_monoxide: { max: 25 },
      hydrogen_sulfide: { max: 1 }
    }
  }
} as const;

/**
 * Messages d'erreur bilingues
 */
export const ERROR_MESSAGES = {
  bluetooth_not_supported: {
    fr: 'Bluetooth non supporté par ce navigateur',
    en: 'Bluetooth not supported by this browser'
  },
  offline_not_available: {
    fr: 'Mode hors ligne non disponible',
    en: 'Offline mode not available'
  },
  sync_failed: {
    fr: 'Échec de synchronisation',
    en: 'Synchronization failed'
  },
  device_connection_failed: {
    fr: 'Connexion appareil échouée',
    en: 'Device connection failed'
  },
  storage_quota_exceeded: {
    fr: 'Quota de stockage dépassé',
    en: 'Storage quota exceeded'
  }
} as const;

// =================== EXPORTS PAR DÉFAUT ===================
export default {
  // Classes principales
  IntegratedAtmosphericHelper,
  IntegratedPermitHelper,
  SystemDiagnosticsHelper,
  
  // Instances globales
  atmosphericHelper,
  permitHelper,
  systemDiagnostics,
  
  // Fonctions système
  initializePermitSystem,
  cleanupPermitSystem,
  exportSystemBackup,
  getSystemStatus,
  
  // Configuration
  DEFAULT_PERMIT_SYSTEM_CONFIG,
  ERROR_MESSAGES
};
