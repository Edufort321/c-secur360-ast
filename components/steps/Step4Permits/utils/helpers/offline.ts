// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/HELPERS/OFFLINE.TS ===================
// Gestionnaire mode hors ligne pour continuité opérationnelle critique
"use client";

// Types définis localement pour éviter les dépendances manquantes
export type LocalGasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'propane'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'acetone'
  | 'formaldehyde';

export type LocalAlarmLevel = 'safe' | 'low' | 'medium' | 'high' | 'danger' | 'critical' | 'extreme';

export interface LocalBilingualText {
  fr: string;
  en: string;
}

export interface LocalAtmosphericReading {
  id: string;
  timestamp: number;
  gasType: LocalGasType;
  value: number;
  unit: string;
  alarmLevel: LocalAlarmLevel;
  confidence: number;
  location: {
    coordinates: { latitude: number; longitude: number; };
    point: string;
  };
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  metadata: {
    equipment: {
      model: string;
      serialNumber: string;
      lastCalibration: number;
      batteryLevel: number;
    };
    operator: string;
    qualityAssurance: {
      validated: boolean;
      flagged: boolean;
      notes: string[];
    };
  };
}

export interface LocalLegalPermit {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'suspended' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  validFrom: number;
  validUntil: number;
  location: {
    coordinates: { latitude: number; longitude: number; };
    address: string;
    description: LocalBilingualText;
  };
  hazards: Array<{
    type: string;
    severity: LocalAlarmLevel;
    mitigation: string[];
  }>;
  requirements: {
    personnel: number;
    equipment: string[];
    procedures: string[];
    training: string[];
  };
  approvals: Array<{
    role: string;
    name: string;
    timestamp: number;
    signature?: string;
  }>;
}

export interface LocalPermitFormData {
  permitId: string;
  entrants: Array<{
    id: string;
    name: string;
    role: string;
    certifications: string[];
  }>;
  supervisor: {
    id: string;
    name: string;
    contact: string;
  };
  equipment: Array<{
    type: string;
    model: string;
    serialNumber: string;
    calibrationDate: number;
  }>;
  procedures: string[];
  emergencyContacts: Array<{
    name: string;
    role: string;
    phone: string;
  }>;
}

export interface LocalPersonnelData {
  id: string;
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
  };
  role: 'supervisor' | 'safety_officer' | 'entrant' | 'attendant';
  certifications: Array<{
    type: string;
    number: string;
    issuer: string;
    validFrom: number;
    validUntil: number;
  }>;
  medicalClearance: {
    status: 'valid' | 'expired' | 'pending';
    expiryDate: number;
    restrictions: string[];
    doctorName: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
}

export interface LocalElectronicSignature {
  id: string;
  signerId: string;
  signerName: string;
  timestamp: number;
  type: 'standard' | 'advanced' | 'qualified';
  documentId?: string;
  ipAddress: string;
  userAgent: string;
  biometricData?: {
    fingerprint?: string;
    voiceprint?: string;
    typing_pattern?: Array<{ key: string; duration: number; }>;
  };
  certificate: {
    issuer: string;
    serialNumber: string;
    validFrom: number;
    validUntil: number;
    algorithm: string;
  };
  metadata: {
    documentHash: string;
    signatureHash: string;
    timestampHash: string;
    verificationType: 'standard' | 'advanced' | 'qualified';
    legalCompliance: string[];
  };
}

// =================== INTERFACES OFFLINE ===================

export interface OfflineConfig {
  enableOfflineMode: boolean;
  maxStorageSize: number;        // MB
  syncRetryAttempts: number;
  syncRetryDelay: number;        // ms
  offlineTimeout: number;        // ms
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backgroundSync: boolean;
  criticalDataPriority: string[];
  purgeStrategy: 'lru' | 'fifo' | 'priority' | 'manual';
  maxOfflineDuration: number;    // heures
}

export interface OfflineData {
  id: string;
  type: OfflineDataType;
  data: any;
  timestamp: number;
  priority: OfflinePriority;
  size: number;                  // bytes
  compressed: boolean;
  encrypted: boolean;
  synced: boolean;
  attempts: number;
  lastSyncAttempt?: number;
  dependencies?: string[];       // IDs données dépendantes
  metadata: {
    version: string;
    checksum: string;
    source: string;
    expiresAt?: number;
    tags: string[];
  };
}

export type OfflineDataType = 
  | 'atmospheric_reading'
  | 'permit'
  | 'permit_form'
  | 'personnel'
  | 'signature'
  | 'configuration'
  | 'media'
  | 'report'
  | 'sync_queue'
  | 'user_action';

export type OfflinePriority = 
  | 'critical'          // Données sécurité critique
  | 'high'              // Données opérationnelles importantes
  | 'medium'            // Données standard
  | 'low'               // Données non-essentielles
  | 'cache';            // Cache optimisation

export interface SyncStatus {
  isOnline: boolean;
  lastOnline: number;
  offlineDuration: number;      // ms
  pendingItems: number;
  failedItems: number;
  totalSize: number;            // bytes
  syncInProgress: boolean;
  lastSyncTime: number;
  nextSyncAttempt?: number;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'network' | 'server' | 'validation' | 'conflict' | 'quota';
  message: string;
  timestamp: number;
  retryable: boolean;
  data?: any;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  resolver?: (serverData: any, clientData: any) => any;
  mergeFields?: string[];
}

export interface OfflineCapabilities {
  storage: {
    available: boolean;
    quota: number;              // bytes
    used: number;               // bytes
    remaining: number;          // bytes
  };
  indexedDB: boolean;
  webWorkers: boolean;
  serviceWorker: boolean;
  backgroundSync: boolean;
  pushNotifications: boolean;
  geolocation: boolean;
  bluetooth: boolean;
}

export interface CacheManifest {
  version: string;
  timestamp: number;
  assets: Array<{
    url: string;
    hash: string;
    size: number;
    priority: OfflinePriority;
    type: 'script' | 'style' | 'image' | 'data' | 'font';
  }>;
  dependencies: Record<string, string[]>;
  fallbacks: Record<string, string>;
}

// =================== CLASSE PRINCIPALE OFFLINEMANAGER ===================

export class OfflineManager {
  private config: OfflineConfig;
  private storage: Map<string, OfflineData> = new Map();
  private syncQueue: string[] = [];
  private eventListeners: Array<(event: OfflineEvent) => void> = [];
  private syncInProgress: boolean = false;
  private isOnline: boolean = navigator.onLine;
  private lastOnlineTime: number = Date.now();
  private worker?: Worker;

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = {
      enableOfflineMode: true,
      maxStorageSize: 100, // MB
      syncRetryAttempts: 5,
      syncRetryDelay: 2000,
      offlineTimeout: 30000,
      compressionEnabled: true,
      encryptionEnabled: false,
      backgroundSync: true,
      criticalDataPriority: ['atmospheric_reading', 'signature', 'permit'],
      purgeStrategy: 'priority',
      maxOfflineDuration: 72, // heures
      ...config
    };

    this.initializeOfflineMode();
  }

  // =================== MÉTHODES PRINCIPALES ===================

  /**
   * Stocker données en mode hors ligne
   */
  async storeOfflineData(
    type: OfflineDataType,
    data: any,
    options?: {
      priority?: OfflinePriority;
      compress?: boolean;
      encrypt?: boolean;
      dependencies?: string[];
      expiresIn?: number; // ms
      tags?: string[];
    }
  ): Promise<string> {
    if (!this.config.enableOfflineMode) {
      throw new Error('Offline mode is disabled');
    }

    const id = this.generateId();
    const priority = options?.priority || this.determinePriority(type);
    const timestamp = Date.now();
    
    // Compression optionnelle
    let processedData = data;
    let compressed = false;
    
    if ((options?.compress ?? this.config.compressionEnabled) && this.shouldCompress(data)) {
      processedData = await this.compressData(data);
      compressed = true;
    }

    // Chiffrement optionnel
    let encrypted = false;
    if ((options?.encrypt ?? this.config.encryptionEnabled) && this.shouldEncrypt(type)) {
      processedData = await this.encryptData(processedData);
      encrypted = true;
    }

    const offlineData: OfflineData = {
      id,
      type,
      data: processedData,
      timestamp,
      priority,
      size: this.calculateSize(processedData),
      compressed,
      encrypted,
      synced: false,
      attempts: 0,
      dependencies: options?.dependencies,
      metadata: {
        version: '1.0.0',
        checksum: await this.calculateChecksum(processedData),
        source: 'offline',
        expiresAt: options?.expiresIn ? timestamp + options.expiresIn : undefined,
        tags: options?.tags || []
      }
    };

    // Vérifier quota storage
    await this.ensureStorageQuota(offlineData.size);

    // Stocker données
    this.storage.set(id, offlineData);
    await this.persistToIndexedDB(offlineData);

    // Ajouter à queue synchronisation
    this.syncQueue.push(id);

    // Tenter synchronisation si en ligne
    if (this.isOnline) {
      this.attemptSync();
    }

    this.emitEvent({
      type: 'data_stored',
      timestamp: Date.now(),
      data: { id, type, priority, size: offlineData.size }
    });

    return id;
  }

  /**
   * Récupérer données hors ligne
   */
  async getOfflineData(
    id: string,
    options?: {
      decompress?: boolean;
      decrypt?: boolean;
      includeMetadata?: boolean;
    }
  ): Promise<any> {
    let offlineData = this.storage.get(id);
    
    if (!offlineData) {
      // Essayer de charger depuis IndexedDB
      offlineData = await this.loadFromIndexedDB(id);
      if (offlineData) {
        this.storage.set(id, offlineData);
      }
    }

    if (!offlineData) {
      throw new Error(`Offline data not found: ${id}`);
    }

    // Vérifier expiration
    if (offlineData.metadata.expiresAt && Date.now() > offlineData.metadata.expiresAt) {
      await this.removeOfflineData(id);
      throw new Error(`Offline data expired: ${id}`);
    }

    let data = offlineData.data;

    // Déchiffrement
    if (offlineData.encrypted && (options?.decrypt ?? true)) {
      data = await this.decryptData(data);
    }

    // Décompression
    if (offlineData.compressed && (options?.decompress ?? true)) {
      data = await this.decompressData(data);
    }

    if (options?.includeMetadata) {
      return {
        data,
        metadata: offlineData.metadata,
        priority: offlineData.priority,
        timestamp: offlineData.timestamp,
        synced: offlineData.synced
      };
    }

    return data;
  }

  /**
   * Rechercher données par type et critères
   */
  async queryOfflineData(
    type: OfflineDataType,
    criteria?: {
      priority?: OfflinePriority;
      syncStatus?: 'synced' | 'pending' | 'failed';
      tags?: string[];
      dateRange?: { start: number; end: number; };
      limit?: number;
      orderBy?: 'timestamp' | 'priority' | 'size';
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<Array<{ id: string; data: any; metadata: any; }>> {
    const results: Array<{ id: string; data: any; metadata: any; }> = [];

    for (const [id, offlineData] of this.storage.entries()) {
      if (offlineData.type !== type) continue;

      // Filtrer par critères
      if (criteria?.priority && offlineData.priority !== criteria.priority) continue;
      if (criteria?.syncStatus) {
        const synced = offlineData.synced;
        const failed = offlineData.attempts >= this.config.syncRetryAttempts;
        const pending = !synced && !failed;
        
        if (criteria.syncStatus === 'synced' && !synced) continue;
        if (criteria.syncStatus === 'pending' && !pending) continue;
        if (criteria.syncStatus === 'failed' && !failed) continue;
      }
      if (criteria?.tags && !criteria.tags.some(tag => offlineData.metadata.tags.includes(tag))) continue;
      if (criteria?.dateRange) {
        if (offlineData.timestamp < criteria.dateRange.start) continue;
        if (offlineData.timestamp > criteria.dateRange.end) continue;
      }

      const data = await this.getOfflineData(id);
      results.push({
        id,
        data,
        metadata: offlineData.metadata
      });
    }

    // Tri
    if (criteria?.orderBy) {
      results.sort((a, b) => {
        const aData = this.storage.get(a.id)!;
        const bData = this.storage.get(b.id)!;
        
        let aValue: any, bValue: any;
        switch (criteria.orderBy) {
          case 'timestamp':
            aValue = aData.timestamp;
            bValue = bData.timestamp;
            break;
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1, cache: 0 };
            aValue = priorityOrder[aData.priority];
            bValue = priorityOrder[bData.priority];
            break;
          case 'size':
            aValue = aData.size;
            bValue = bData.size;
            break;
          default:
            return 0;
        }
        
        const direction = criteria.orderDirection === 'desc' ? -1 : 1;
        return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
      });
    }

    // Limite
    if (criteria?.limit) {
      return results.slice(0, criteria.limit);
    }

    return results;
  }

  /**
   * Synchroniser avec serveur
   */
  async synchronize(
    options?: {
      force?: boolean;
      priority?: OfflinePriority[];
      batchSize?: number;
      timeout?: number;
    }
  ): Promise<SyncResult> {
    if (!this.isOnline && !options?.force) {
      throw new Error('Cannot sync while offline');
    }

    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      processed: 0,
      failed: 0,
      conflicts: 0,
      duration: 0,
      errors: []
    };

    try {
      // Filtrer items à synchroniser
      const itemsToSync = this.syncQueue.filter(id => {
        const data = this.storage.get(id);
        if (!data || data.synced) return false;
        
        if (options?.priority && !options.priority.includes(data.priority)) return false;
        
        return true;
      });

      const batchSize = options?.batchSize || 10;
      const timeout = options?.timeout || this.config.offlineTimeout;

      // Synchroniser par batch
      for (let i = 0; i < itemsToSync.length; i += batchSize) {
        const batch = itemsToSync.slice(i, i + batchSize);
        
        try {
          const batchResult = await this.syncBatch(batch, timeout);
          result.processed += batchResult.processed;
          result.failed += batchResult.failed;
          result.conflicts += batchResult.conflicts;
          result.errors.push(...batchResult.errors);
        } catch (error) {
          result.errors.push({
            id: 'batch_error',
            type: 'network',
            message: error instanceof Error ? error.message : 'Batch sync failed',
            timestamp: Date.now(),
            retryable: true
          });
          result.failed += batch.length;
        }
      }

      result.success = result.failed === 0;
      result.duration = Date.now() - startTime;

      this.emitEvent({
        type: 'sync_completed',
        timestamp: Date.now(),
        data: result
      });

      return result;

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtenir statut synchronisation
   */
  getSyncStatus(): SyncStatus {
    const pendingItems = this.syncQueue.filter(id => {
      const data = this.storage.get(id);
      return data && !data.synced && data.attempts < this.config.syncRetryAttempts;
    }).length;

    const failedItems = this.syncQueue.filter(id => {
      const data = this.storage.get(id);
      return data && !data.synced && data.attempts >= this.config.syncRetryAttempts;
    }).length;

    const totalSize = Array.from(this.storage.values())
      .reduce((total, data) => total + data.size, 0);

    const offlineDuration = this.isOnline ? 0 : Date.now() - this.lastOnlineTime;

    return {
      isOnline: this.isOnline,
      lastOnline: this.lastOnlineTime,
      offlineDuration,
      pendingItems,
      failedItems,
      totalSize,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.getLastSyncTime(),
      errors: this.getSyncErrors()
    };
  }

  /**
   * Nettoyer données expirées
   */
  async cleanup(
    options?: {
      force?: boolean;
      olderThan?: number; // ms
      priority?: OfflinePriority[];
      syncedOnly?: boolean;
    }
  ): Promise<{ removed: number; freedSpace: number; }> {
    const now = Date.now();
    const olderThan = options?.olderThan || (this.config.maxOfflineDuration * 60 * 60 * 1000);
    
    let removed = 0;
    let freedSpace = 0;

    const idsToRemove: string[] = [];

    for (const [id, data] of this.storage.entries()) {
      let shouldRemove = false;

      // Données expirées
      if (data.metadata.expiresAt && now > data.metadata.expiresAt) {
        shouldRemove = true;
      }

      // Données anciennes
      if (!shouldRemove && (now - data.timestamp) > olderThan) {
        shouldRemove = true;
      }

      // Filtres optionnels
      if (shouldRemove && options?.priority && !options.priority.includes(data.priority)) {
        shouldRemove = false;
      }

      if (shouldRemove && options?.syncedOnly && !data.synced) {
        shouldRemove = false;
      }

      // Ne pas supprimer données critiques non synchronisées
      if (!options?.force && data.priority === 'critical' && !data.synced) {
        shouldRemove = false;
      }

      if (shouldRemove) {
        idsToRemove.push(id);
        freedSpace += data.size;
      }
    }

    // Supprimer données
    for (const id of idsToRemove) {
      await this.removeOfflineData(id);
      removed++;
    }

    this.emitEvent({
      type: 'cleanup_completed',
      timestamp: Date.now(),
      data: { removed, freedSpace }
    });

    return { removed, freedSpace };
  }

  // =================== MÉTHODES SPÉCIALISÉES ===================

  /**
   * Stocker lecture atmosphérique critique
   */
  async storeAtmosphericReading(reading: LocalAtmosphericReading): Promise<string> {
    const priority: OfflinePriority = ['danger', 'critical', 'extreme'].includes(reading.alarmLevel) ? 
      'critical' : 'high';

    return this.storeOfflineData('atmospheric_reading', reading, {
      priority,
      compress: true,
      tags: ['atmospheric', reading.gasType, reading.alarmLevel],
      expiresIn: 24 * 60 * 60 * 1000 // 24h
    });
  }

  /**
   * Stocker signature électronique
   */
  async storeSignature(signature: LocalElectronicSignature): Promise<string> {
    return this.storeOfflineData('signature', signature, {
      priority: 'critical',
      encrypt: true,
      compress: false, // Conserver intégrité
      tags: ['signature', signature.type],
      dependencies: signature.documentId ? [signature.documentId] : undefined
    });
  }

  /**
   * Stocker permis complet
   */
  async storePermit(permit: LocalLegalPermit, formData?: LocalPermitFormData): Promise<string[]> {
    const ids: string[] = [];

    // Stocker permis
    const permitId = await this.storeOfflineData('permit', permit, {
      priority: permit.priority === 'emergency' ? 'critical' : 'high',
      tags: ['permit', permit.category, permit.status]
    });
    ids.push(permitId);

    // Stocker données formulaire si présentes
    if (formData) {
      const formId = await this.storeOfflineData('permit_form', formData, {
        priority: 'high',
        dependencies: [permitId],
        tags: ['form', permit.category]
      });
      ids.push(formId);
    }

    return ids;
  }

  /**
   * Récupérer données critiques pour mode hors ligne
   */
  async getCriticalOfflineData(): Promise<{
    atmosphericReadings: LocalAtmosphericReading[];
    permits: LocalLegalPermit[];
    personnel: LocalPersonnelData[];
    signatures: LocalElectronicSignature[];
  }> {
    const [atmosphericReadings, permits, personnel, signatures] = await Promise.all([
      this.queryOfflineData('atmospheric_reading', { priority: 'critical', limit: 100 }),
      this.queryOfflineData('permit', { priority: 'critical', limit: 50 }),
      this.queryOfflineData('personnel', { priority: 'high', limit: 20 }),
      this.queryOfflineData('signature', { priority: 'critical', limit: 30 })
    ]);

    return {
      atmosphericReadings: atmosphericReadings.map(item => item.data),
      permits: permits.map(item => item.data),
      personnel: personnel.map(item => item.data),
      signatures: signatures.map(item => item.data)
    };
  }

  // =================== MÉTHODES PRIVÉES ===================

  private async initializeOfflineMode(): Promise<void> {
    // Écouter événements réseau
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.lastOnlineTime = Date.now();
      this.emitEvent({
        type: 'online',
        timestamp: Date.now(),
        data: {}
      });
      this.attemptSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emitEvent({
        type: 'offline',
        timestamp: Date.now(),
        data: {}
      });
    });

    // Initialiser IndexedDB
    await this.initializeIndexedDB();

    // Charger données existantes
    await this.loadExistingData();

    // Démarrer worker background
    if (this.config.backgroundSync && window.Worker) {
      this.initializeWorker();
    }

    // Cleanup périodique
    setInterval(() => {
      this.cleanup({ syncedOnly: true });
    }, 60 * 60 * 1000); // Chaque heure
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determinePriority(type: OfflineDataType): OfflinePriority {
    const priorityMap: Record<OfflineDataType, OfflinePriority> = {
      atmospheric_reading: 'high',
      permit: 'high',
      permit_form: 'medium',
      personnel: 'medium',
      signature: 'critical',
      configuration: 'low',
      media: 'low',
      report: 'medium',
      sync_queue: 'high',
      user_action: 'medium'
    };

    return priorityMap[type] || 'medium';
  }

  private shouldCompress(data: any): boolean {
    const size = this.calculateSize(data);
    return size > 1024; // Compresser si > 1KB
  }

  private shouldEncrypt(type: OfflineDataType): boolean {
    return ['signature', 'personnel'].includes(type);
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async calculateChecksum(data: any): Promise<string> {
    const text = JSON.stringify(data);
    const encoder = new TextEncoder();
    const data_bytes = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data_bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async ensureStorageQuota(requiredSize: number): Promise<void> {
    const capabilities = await this.getOfflineCapabilities();
    const availableSpace = capabilities.storage.remaining;

    if (requiredSize > availableSpace) {
      // Purger selon stratégie
      await this.purgeOldData(requiredSize - availableSpace);
    }
  }

  private async purgeOldData(requiredSpace: number): Promise<void> {
    const items = Array.from(this.storage.entries())
      .filter(([_, data]) => data.synced || data.priority === 'cache')
      .sort(([_, a], [__, b]) => {
        switch (this.config.purgeStrategy) {
          case 'lru':
            return a.timestamp - b.timestamp;
          case 'fifo':
            return a.timestamp - b.timestamp;
          case 'priority':
            const priorityOrder = { cache: 0, low: 1, medium: 2, high: 3, critical: 4 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          default:
            return 0;
        }
      });

    let freedSpace = 0;
    for (const [id, data] of items) {
      if (freedSpace >= requiredSpace) break;
      
      await this.removeOfflineData(id);
      freedSpace += data.size;
    }
  }

  private async removeOfflineData(id: string): Promise<void> {
    this.storage.delete(id);
    await this.removeFromIndexedDB(id);
    
    const queueIndex = this.syncQueue.indexOf(id);
    if (queueIndex > -1) {
      this.syncQueue.splice(queueIndex, 1);
    }
  }

  private async compressData(data: any): Promise<string> {
    // Compression simple LZ (placeholder)
    return JSON.stringify(data);
  }

  private async decompressData(data: string): Promise<any> {
    // Décompression (placeholder)
    return JSON.parse(data);
  }

  private async encryptData(data: any): Promise<string> {
    // Chiffrement simple (placeholder - utiliser Web Crypto API en production)
    return btoa(JSON.stringify(data));
  }

  private async decryptData(data: string): Promise<any> {
    // Déchiffrement simple (placeholder)
    return JSON.parse(atob(data));
  }

  private async attemptSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    try {
      await this.synchronize({ batchSize: 5 });
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }

  private async syncBatch(ids: string[], timeout: number): Promise<SyncResult> {
    // Placeholder pour synchronisation batch
    const result: SyncResult = {
      success: true,
      processed: ids.length,
      failed: 0,
      conflicts: 0,
      duration: 0,
      errors: []
    };

    // Marquer comme synchronisé
    for (const id of ids) {
      const data = this.storage.get(id);
      if (data) {
        data.synced = true;
        data.attempts++;
        this.storage.set(id, data);
      }
    }

    return result;
  }

  private getLastSyncTime(): number {
    return Array.from(this.storage.values())
      .filter(data => data.synced)
      .reduce((latest, data) => Math.max(latest, data.timestamp), 0);
  }

  private getSyncErrors(): SyncError[] {
    // Retourner erreurs récentes
    return [];
  }

  private async initializeIndexedDB(): Promise<void> {
    // Initialiser IndexedDB (placeholder)
  }

  private async loadExistingData(): Promise<void> {
    // Charger données existantes depuis IndexedDB (placeholder)
  }

  private async persistToIndexedDB(data: OfflineData): Promise<void> {
    // Persister vers IndexedDB (placeholder)
  }

  private async loadFromIndexedDB(id: string): Promise<OfflineData | null> {
    // Charger depuis IndexedDB (placeholder)
    return null;
  }

  private async removeFromIndexedDB(id: string): Promise<void> {
    // Supprimer de IndexedDB (placeholder)
  }

  private initializeWorker(): void {
    // Initialiser worker background (placeholder)
  }

  private emitEvent(event: OfflineEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in offline event listener:', error);
      }
    });
  }

  // =================== MÉTHODES PUBLIQUES UTILITAIRES ===================

  /**
   * Ajouter listener d'événements
   */
  addEventListener(listener: (event: OfflineEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Obtenir capacités hors ligne
   */
  async getOfflineCapabilities(): Promise<OfflineCapabilities> {
    const quota = await this.getStorageQuota();
    
    return {
      storage: {
        available: 'storage' in navigator,
        quota: quota.quota,
        used: quota.usage,
        remaining: quota.quota - quota.usage
      },
      indexedDB: 'indexedDB' in window,
      webWorkers: 'Worker' in window,
      serviceWorker: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      pushNotifications: 'PushManager' in window,
      geolocation: 'geolocation' in navigator,
      bluetooth: 'bluetooth' in navigator
    };
  }

  /**
   * Exporter données pour sauvegarde
   */
  async exportOfflineData(
    options?: {
      types?: OfflineDataType[];
      includeMetadata?: boolean;
      compress?: boolean;
    }
  ): Promise<Blob> {
    const exportData: any = {
      version: '1.0.0',
      timestamp: Date.now(),
      data: {}
    };

    const types = options?.types || ['atmospheric_reading', 'permit', 'signature'];
    
    for (const type of types) {
      const items = await this.queryOfflineData(type as OfflineDataType);
      exportData.data[type] = items;
    }

    if (options?.includeMetadata) {
      exportData.metadata = {
        config: this.config,
        syncStatus: this.getSyncStatus(),
        capabilities: await this.getOfflineCapabilities()
      };
    }

    const jsonData = JSON.stringify(exportData);
    
    if (options?.compress) {
      // Compression (placeholder)
      return new Blob([jsonData], { type: 'application/json' });
    }

    return new Blob([jsonData], { type: 'application/json' });
  }

  private async getStorageQuota(): Promise<{ quota: number; usage: number; }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0
      };
    }
    return { quota: 0, usage: 0 };
  }
}

// =================== INTERFACES SUPPLÉMENTAIRES ===================

interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  conflicts: number;
  duration: number;
  errors: SyncError[];
}

interface OfflineEvent {
  type: 'online' | 'offline' | 'data_stored' | 'sync_completed' | 'cleanup_completed' | 'error';
  timestamp: number;
  data: any;
}

// =================== INSTANCE SINGLETON ===================

let offlineManagerInstance: OfflineManager | null = null;

/**
 * Obtenir instance singleton du manager hors ligne
 */
export function getOfflineManager(config?: Partial<OfflineConfig>): OfflineManager {
  if (!offlineManagerInstance) {
    offlineManagerInstance = new OfflineManager(config);
  }
  return offlineManagerInstance;
}

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Vérifier si mode hors ligne est disponible
 */
export function isOfflineModeAvailable(): boolean {
  return 'indexedDB' in window && 'storage' in navigator;
}

/**
 * Stocker rapidement lecture atmosphérique
 */
export async function quickStoreAtmospheric(reading: LocalAtmosphericReading): Promise<string> {
  const manager = getOfflineManager();
  return manager.storeAtmosphericReading(reading);
}

/**
 * Obtenir statut connexion
 */
export function getConnectionStatus(): { 
  isOnline: boolean; 
  type?: string; 
  effectiveType?: string; 
} {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    isOnline: navigator.onLine,
    type: connection?.type,
    effectiveType: connection?.effectiveType
  };
}

/**
 * Estimer temps synchronisation
 */
export async function estimateSyncTime(pendingItems: number): Promise<number> {
  const connection = getConnectionStatus();
  const baseTimePerItem = 100; // ms
  
  let multiplier = 1;
  if (connection.effectiveType === 'slow-2g') multiplier = 10;
  else if (connection.effectiveType === '2g') multiplier = 5;
  else if (connection.effectiveType === '3g') multiplier = 2;
  
  return pendingItems * baseTimePerItem * multiplier;
}

/**
 * Vérifier quota storage
 */
export async function checkStorageQuota(): Promise<{
  available: boolean;
  percentage: number;
  remaining: number;
}> {
  const manager = getOfflineManager();
  const capabilities = await manager.getOfflineCapabilities();
  
  const percentage = capabilities.storage.quota > 0 ? 
    (capabilities.storage.used / capabilities.storage.quota) * 100 : 0;
  
  return {
    available: capabilities.storage.available,
    percentage,
    remaining: capabilities.storage.remaining
  };
}

// =================== EXPORTS ===================
export default OfflineManager;
