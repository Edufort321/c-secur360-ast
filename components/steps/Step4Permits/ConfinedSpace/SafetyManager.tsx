// SafetyManager.tsx - PARTIE 1/2 - Types et Configuration FONCTIONNEL
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

// =================== CONFIGURATION SUPABASE ROBUSTE ===================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

let supabase: any = null;
let supabaseEnabled = false;

try {
  if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseEnabled = true;
    console.log('✅ SafetyManager: Supabase configuré');
  } else {
    console.log('📝 SafetyManager: Utilisation du localStorage');
  }
} catch (error) {
  console.log('⚠️ SafetyManager: Supabase non configuré, utilisation du localStorage');
  supabaseEnabled = false;
}

// =================== TYPES UNIVERSELS ===================
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type Language = 'fr' | 'en';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type UserRole = 'entrant' | 'attendant' | 'supervisor' | 'rescue' | 'admin';
export type SafetyRole = UserRole;
export type AlertType = 'info' | 'warning' | 'critical' | 'success';

// =================== INTERFACE UNIVERSELLE POUR TOUS LES COMPOSANTS ===================
export interface ConfinedSpaceComponentProps {
  // Props de base communes (OBLIGATOIRES)
  language: Language;
  permitData: ConfinedSpacePermit;
  selectedProvince: ProvinceCode;
  regulations: Record<ProvinceCode, any>;
  isMobile: boolean;
  
  // SafetyManager integration (OPTIONNEL pour rétrocompatibilité)
  safetyManager?: SafetyManagerInstance;
  
  // Props pour AtmosphericTesting
  atmosphericReadings?: any[];
  setAtmosphericReadings?: (readings: any[]) => void;
  updateParentData?: (field: string, value: any) => void;
  
  // Props pour EntryRegistry - ✅ FIX TYPE MISMATCH
  updatePermitData?: (data: any) => void;
  
  // Props pour tous les composants
  styles?: any;
  PROVINCIAL_REGULATIONS?: any;
  
  // Props ASTForm (compatibilité)
  formData?: any;
  onDataChange?: (field: string, value: any) => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onSubmit?: (data: any) => void;
  
  // Props héritées (compatibilité version précédente)
  province?: ProvinceCode;
  initialData?: any;
  tenant?: string;
  errors?: any;
  userRole?: UserRole;
  touchOptimized?: boolean;
  compactMode?: boolean;
  onPermitChange?: (permits: any) => void;
  initialPermits?: any[];
  
  // Props étendues (flexibilité maximale)
  showAdvancedFeatures?: boolean;
  enableAutoSave?: boolean;
  readOnly?: boolean;
  customValidators?: any[];
  theme?: 'dark' | 'light';
  
  // Callbacks standardisés
  onUpdate?: (section: string, data: any) => void;
  onSectionComplete?: (sectionData: any) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

// =================== TYPES POUR ENTRYREGISTRY (COMPATIBILITÉ) ===================
export interface PersonnelEntry {
  id: string;
  name: string;
  role: UserRole;
  certification: string[];
  medicalFitness: {
    valid: boolean;
    expiryDate: string;
    restrictions?: string[];
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Propriétés additionnelles pour EntryRegistry (COMPATIBILITÉ BUILD)
  entryTime?: string;
  exitTime?: string;
  status?: 'inside' | 'outside' | 'emergency';
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

// =================== INSTANCE DU SAFETYMANAGER ===================
export interface SafetyManagerInstance {
  // État principal
  currentPermit: ConfinedSpacePermit;
  permits: ConfinedSpacePermit[];
  
  // États de l'interface
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  
  // ✅ États pour débounce intelligent
  isUpdating: boolean;
  lastUpdateTime: number;
  
  // Alertes et notifications
  activeAlerts: Alert[];
  notifications: Notification[];
  
  // Actions principales - ✅ TOUTES FONCTIONNELLES
  updateSiteInformation: (data: Partial<ConfinedSpaceDetails>) => void;
  updateAtmosphericTesting: (data: Partial<AtmosphericTestingData>) => void;
  updateEntryRegistry: (data: Partial<EntryRegistryData>) => void;
  updateRescuePlan: (data: Partial<RescuePlanData>) => void;
  
  // Méthodes pour EntryRegistry (COMPATIBILITÉ BUILD ASSURÉE)
  updateRegistryData: (data: any) => void;
  updatePersonnel: (person: PersonnelEntry) => void;
  updateEquipment: (equipment: any) => void;
  updateCompliance: (key: string, value: boolean) => void;
  recordEntryExit: (personId: string, action: 'entry' | 'exit' | 'emergency_exit') => void;
  
  // ✅ ALIAS DE COMPATIBILITÉ POUR LES COMPOSANTS EXISTANTS
  updateSiteInfo: (data: any) => void;
  updateAtmosphericData: (data: any) => void;
  updateRegistryInfo: (data: any) => void;
  updateRescueData: (data: any) => void;
  
  // Gestion de base de données
  saveToDatabase: () => Promise<string | null>;
  loadFromDatabase: (permitNumber: string) => Promise<ConfinedSpacePermit | null>;
  loadPermitHistory: () => Promise<ConfinedSpacePermit[]>;
  
  // QR Code et partage
  generateQRCode: () => Promise<string>;
  generatePDF: () => Promise<Blob>;
  sharePermit: (method: 'email' | 'sms' | 'whatsapp') => Promise<void>;
  
  // Validation
  validatePermitCompleteness: () => ValidationResult;
  validateSection: (section: keyof ConfinedSpacePermit) => ValidationResult;
  
  // Utilitaires
  createNewPermit: (province: ProvinceCode) => void;
  resetPermit: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
}

// =================== TYPES PRINCIPAUX ===================
export interface ConfinedSpacePermit {
  // Métadonnées essentielles
  id?: string;
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  last_modified: string;
  issue_date?: string;
  
  // ✅ Données des sections principales - GARANTIES NON-UNDEFINED
  siteInformation: ConfinedSpaceDetails;
  atmosphericTesting: AtmosphericTestingData;
  entryRegistry: EntryRegistryData;
  rescuePlan: RescuePlanData;
  
  // Données de conformité légale
  gas_detector_calibrated?: boolean;
  calibration_date?: string;
  calibration_certificate?: string;
  multi_level_testing_completed?: boolean;
  atmospheric_stability_confirmed?: boolean;
  test_results_signed?: boolean;
  qualified_tester_name?: string;
  
  // Propriétés pour EntryRegistry (COMPATIBILITÉ BUILD)
  attendant_present?: boolean;
  communication_system_tested?: boolean;
  emergency_retrieval_ready?: boolean;
  
  // Conformité générale
  compliance?: Record<string, boolean>;
  
  // Métadonnées de validation
  validation: ValidationData;
  
  // Données d'audit et attachements
  auditTrail: AuditEntry[];
  attachments: AttachmentData[];
  
  // Propriétés optionnelles pour compatibilité
  selected_province?: ProvinceCode;
  projectNumber?: string;
  workLocation?: string;
  spaceDescription?: string;
  workDescription?: string;
  entry_supervisor?: string;
  rescue_plan_type?: 'internal' | 'external' | 'hybrid';
  supervisor_name?: string;
  permit_valid_from?: string;
  permit_valid_to?: string;
}

export interface ValidationData {
  isComplete: boolean;
  isValid?: boolean;
  percentage: number;
  completedSections?: string[];
  errors: string[];
  warnings?: string[];
  lastValidated: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ✅ INTERFACE SITEINFO POUR LA SAISIE - TOUTES PROPRIÉTÉS DÉFINIES
export interface ConfinedSpaceDetails {
  // ✅ Informations principales - GARANTIES STRING DÉFINIES
  projectNumber: string;
  workLocation: string;
  workLocationCoordinates?: Coordinates;
  contractor: string;
  supervisor: string;
  entryDate: string;
  duration: string;
  workerCount: number;
  workDescription: string;

  // Identification de l'espace
  spaceType: string;
  csaClass: string;
  entryMethod: string;
  accessType: string;
  spaceLocation: string;
  spaceDescription: string;

  // Dimensions avec forme
  dimensions: Dimensions;
  unitSystem: 'metric' | 'imperial';

  // Points d'entrée
  entryPoints: EntryPoint[];

  // Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];

  // Conditions environnementales
  environmentalConditions: EnvironmentalConditions;

  // Contenu de l'espace
  spaceContent: SpaceContent;

  // Mesures de sécurité
  safetyMeasures: SafetyMeasures;

  // Photos de l'espace
  spacePhotos: SpacePhoto[];
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  diameter: number;
  volume: number;
  spaceShape: 'rectangular' | 'cylindrical' | 'spherical' | 'irregular';
}

export interface EntryPoint {
  id: string;
  type: string;
  dimensions: string;
  location: string;
  condition: string;
  accessibility: string;
  photos: string[];
}

export interface EnvironmentalConditions {
  ventilationRequired: boolean;
  ventilationType: string;
  lightingConditions: string;
  temperatureRange: string;
  moistureLevel: string;
  noiseLevel: string;
  weatherConditions: string;
}

export interface SpaceContent {
  contents: string;
  residues: string;
  previousUse: string;
  lastEntry: string;
  cleaningStatus: string;
}

export interface SafetyMeasures {
  emergencyEgress: string;
  communicationMethod: string;
  monitoringEquipment: string[];
  ventilationEquipment: string[];
  emergencyEquipment: string[];
}

export interface SpacePhoto {
  id: string;
  url: string;
  category: string;
  caption: string;
  timestamp: string;
  location: string;
  measurements?: string;
  gpsCoords?: { lat: number; lng: number };
}

export interface AtmosphericTestingData {
  equipment: {
    deviceModel: string;
    serialNumber: string;
    calibrationDate: string;
    nextCalibration: string;
  };
  readings: AtmosphericReading[];
  continuousMonitoring: boolean;
  alarmSettings: AlarmSettings;
  testingFrequency?: number;
  lastUpdated: string;
}

export interface AtmosphericReading {
  id: string;
  timestamp: string;
  location: string;
  readings: {
    oxygen: number;
    combustibleGas: number;
    hydrogenSulfide: number;
    carbonMonoxide: number;
    temperature: number;
    humidity: number;
  };
  status: 'safe' | 'caution' | 'danger';
  testedBy: string;
  notes?: string;
}

export interface AlarmSettings {
  oxygen: { min: number; max: number };
  combustibleGas: { max: number };
  hydrogenSulfide: { max: number };
  carbonMonoxide: { max: number };
}

export interface EntryRegistryData {
  personnel: PersonnelEntry[];
  entryLog: EntryLogEntry[];
  entryLogs?: EntryLogEntry[];
  activeEntrants: string[];
  maxOccupancy: number;
  communicationProtocol: CommunicationProtocol;
  lastUpdated: string;
  
  // Propriétés additionnelles pour EntryRegistry (COMPATIBILITÉ BUILD)
  equipment?: any[];
  compliance?: Record<string, boolean>;
  supervisor?: {
    name: string;
    certification: string;
    contact: string;
  };
  
  // ✅ Propriétés manquantes utilisées dans EntryRegistry.tsx
  attendantPresent?: boolean;
  entryAuthorized?: boolean;
  emergencyProcedures?: boolean;
  communicationEstablished?: boolean;
  communicationSystemActive?: boolean;
  rescueTeamNotified?: boolean;
  atmosphericTestingCurrent?: boolean;
  equipmentInspected?: boolean;
  safetyBriefingCompleted?: boolean;
  permitReviewed?: boolean;
  hazardsIdentified?: boolean;
  controlMeasuresImplemented?: boolean;
  emergencyEquipmentAvailable?: boolean;
  emergencyContactsNotified?: boolean;
  currentOccupancy?: number;
  
  // Autres propriétés potentielles
  entryDateTime?: string;
  exitDateTime?: string;
  workDescription?: string;
  notes?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EntryLogEntry {
  id: string;
  personnelId: string;
  action: 'entry' | 'exit' | 'emergency_exit';
  timestamp: string;
  authorizedBy: string;
  atmosphericReadings?: {
    oxygen: number;
    combustibleGas: number;
    toxicGas: number;
  };
  notes?: string;
}

export interface CommunicationProtocol {
  type: 'radio' | 'cellular' | 'hardline';
  frequency?: string;
  checkInterval: number;
}

export interface RescuePlanData {
  emergencyContacts: EmergencyContact[];
  rescueTeam: RescueTeamMember[];
  evacuationProcedure: string;
  rescueEquipment: EquipmentItem[];
  hospitalInfo: HospitalInfo;
  communicationPlan: string;
  lastUpdated: string;
  responseTime?: number;
  
  // Propriétés étendues pour RescuePlan
  rescue_plan_type?: string;
  rescue_plan_responsible?: string;
  rescue_team_phone?: string;
  rescue_response_time?: string;
  rescue_plan?: string;
  rescue_equipment?: Record<string, boolean>;
  rescue_equipment_validated?: boolean;
  rescue_steps?: Array<{
    id: number;
    step: number;
    description: string;
  }>;
  rescue_team_certifications?: {
    csa_z1006_certified?: boolean;
    certification_expiry?: string;
    first_aid_level2?: boolean;
    cpr_certified?: boolean;
    rescue_training_hours?: number;
    response_time_verified?: boolean;
    [key: string]: any;
  };
  equipment_certifications?: {
    harness_inspection_date?: string;
    scba_certification?: string;
    mechanical_recovery_cert?: string;
    last_equipment_inspection?: string;
    equipment_serial_numbers?: string[];
    [key: string]: any;
  };
  annual_drill_required?: boolean;
  last_effectiveness_test?: string;
  regulatory_compliance_verified?: boolean;
  rescue_training?: Record<string, boolean>;
  last_drill_date?: string;
  drill_results?: string;
  drill_notes?: string;
  rescue_plan_validated?: boolean;
}

export interface RescueTeamMember {
  id: string;
  name: string;
  role: string;
  certification: string[];
  phone: string;
  isOnCall: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  serialNumber?: string;
  lastInspection: string;
  nextInspection: string;
  isAvailable: boolean;
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  distance: number;
}

// =================== TYPES ADDITIONNELS ===================
export interface ValidationResult {
  isValid: boolean;
  percentage: number;
  errors: string[];
  warnings?: string[];
  completedSections: number;
  totalSections: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  location?: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Notification {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  isRead: boolean;
  action?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  section: string;
  userId: string;
  userName?: string;
  changes: Record<string, any>;
  oldValues?: Record<string, any>;
}

export interface AttachmentData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
  category?: 'photo' | 'document' | 'certificate' | 'plan' | 'other';
  description?: string;
}

// =================== FONCTIONS UTILITAIRES UNIVERSELLES ===================
export function generatePermitNumber(province: ProvinceCode): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  
  return `CS-${province}-${year}${month}${day}-${time}`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function checkAtmosphericAlerts(readings: AtmosphericReading[]): Alert[] {
  const alerts: Alert[] = [];
  
  readings.forEach(reading => {
    if (reading.readings.oxygen < 19.5 || reading.readings.oxygen > 23.5) {
      alerts.push({
        id: generateId(),
        type: 'critical',
        message: `Niveau d'oxygène dangereux: ${reading.readings.oxygen}%`,
        location: reading.location,
        timestamp: reading.timestamp
      });
    }
    
    if (reading.readings.combustibleGas > 10) {
      alerts.push({
        id: generateId(),
        type: 'critical',
        message: `Gaz combustible détecté: ${reading.readings.combustibleGas}% LEL`,
        location: reading.location,
        timestamp: reading.timestamp
      });
    }
    
    if (reading.readings.hydrogenSulfide > 10) {
      alerts.push({
        id: generateId(),
        type: 'critical',
        message: `H2S détecté: ${reading.readings.hydrogenSulfide} ppm`,
        location: reading.location,
        timestamp: reading.timestamp
      });
    }
    
    if (reading.readings.carbonMonoxide > 35) {
      alerts.push({
        id: generateId(),
        type: 'critical',
        message: `CO détecté: ${reading.readings.carbonMonoxide} ppm`,
        location: reading.location,
        timestamp: reading.timestamp
      });
    }
  });
  
  return alerts;
}

function createAuditEntry(action: string, section: string, changes: any, oldValues?: any): AuditEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    section,
    userId: 'current_user',
    userName: 'Utilisateur actuel',
    changes,
    oldValues
  };
}
// SafetyManager.tsx - PARTIE 2/2 - Store MODE PRODUCTION (Focus Safe)

// =================== FONCTION CREATEEMPTYPERMIT AVEC VALEURS GARANTIES ===================
function createEmptyPermit(): ConfinedSpacePermit {
  const now = new Date().toISOString();
  
  return {
    permit_number: '',
    status: 'draft',
    province: 'QC',
    created_at: now,
    updated_at: now,
    last_modified: now,
    issue_date: now,
    
    // Propriétés pour EntryRegistry (COMPATIBILITÉ BUILD)
    attendant_present: false,
    communication_system_tested: false,
    emergency_retrieval_ready: false,
    
    // ✅ SAISIE LIBRE: SITEINFORMATION TOUJOURS DÉFINI AVEC STRINGS NON-UNDEFINED
    siteInformation: {
      // ✅ GARANTIE: Toutes les propriétés string sont définies (pas undefined)
      projectNumber: '',
      workLocation: '',
      workLocationCoordinates: { lat: 45.5017, lng: -73.5673 },
      contractor: '',
      supervisor: '',
      entryDate: '',
      duration: '',
      workerCount: 1,
      workDescription: '',

      // Identification de l'espace
      spaceType: '',
      csaClass: '',
      entryMethod: '',
      accessType: '',
      spaceLocation: '',
      spaceDescription: '',

      // Dimensions avec forme
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        diameter: 0,
        volume: 0,
        spaceShape: 'rectangular'
      },
      unitSystem: 'metric',

      // Points d'entrée
      entryPoints: [{
        id: 'entry-1',
        type: 'circular',
        dimensions: '',
        location: '',
        condition: 'good',
        accessibility: 'normal',
        photos: []
      }],

      // Dangers
      atmosphericHazards: [],
      physicalHazards: [],

      // Conditions environnementales
      environmentalConditions: {
        ventilationRequired: false,
        ventilationType: '',
        lightingConditions: '',
        temperatureRange: '',
        moistureLevel: '',
        noiseLevel: '',
        weatherConditions: '',
      },

      // Contenu de l'espace
      spaceContent: {
        contents: '',
        residues: '',
        previousUse: '',
        lastEntry: '',
        cleaningStatus: '',
      },

      // Mesures de sécurité
      safetyMeasures: {
        emergencyEgress: '',
        communicationMethod: '',
        monitoringEquipment: [],
        ventilationEquipment: [],
        emergencyEquipment: [],
      },

      // Photos de l'espace
      spacePhotos: []
    },
    
    atmosphericTesting: {
      equipment: {
        deviceModel: '',
        serialNumber: '',
        calibrationDate: '',
        nextCalibration: ''
      },
      readings: [],
      continuousMonitoring: false,
      alarmSettings: {
        oxygen: { min: 19.5, max: 23.5 },
        combustibleGas: { max: 10 },
        hydrogenSulfide: { max: 10 },
        carbonMonoxide: { max: 35 }
      },
      testingFrequency: 30,
      lastUpdated: now
    },
    
    entryRegistry: {
      personnel: [],
      entryLog: [],
      entryLogs: [],
      activeEntrants: [],
      maxOccupancy: 1,
      communicationProtocol: {
        type: 'radio',
        frequency: '',
        checkInterval: 15
      },
      lastUpdated: now,
      equipment: [],
      compliance: {},
      supervisor: {
        name: '',
        certification: '',
        contact: ''
      },
      // ✅ Valeurs par défaut pour toutes les propriétés utilisées
      attendantPresent: false,
      entryAuthorized: false,
      emergencyProcedures: false,
      communicationEstablished: false,
      communicationSystemActive: false,
      rescueTeamNotified: false,
      atmosphericTestingCurrent: false,
      equipmentInspected: false,
      safetyBriefingCompleted: false,
      permitReviewed: false,
      hazardsIdentified: false,
      controlMeasuresImplemented: false,
      emergencyEquipmentAvailable: false,
      emergencyContactsNotified: false,
      currentOccupancy: 0
    },
    
    rescuePlan: {
      emergencyContacts: [],
      rescueTeam: [],
      evacuationProcedure: '',
      rescueEquipment: [],
      hospitalInfo: {
        name: '',
        address: '',
        phone: '',
        distance: 0
      },
      communicationPlan: '',
      lastUpdated: now,
      responseTime: 5
    },
    
    compliance: {},
    
    validation: {
      isComplete: false,
      isValid: false,
      percentage: 0,
      completedSections: [],
      errors: [],
      warnings: [],
      lastValidated: now
    },
    
    auditTrail: [],
    attachments: []
  };
}

// =================== STORE ZUSTAND MODE PRODUCTION (FOCUS SAFE) ===================
interface SafetyManagerState {
  // État principal
  currentPermit: ConfinedSpacePermit;
  permits: ConfinedSpacePermit[];
  
  // États de l'interface
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  
  // ✅ MODE PRODUCTION: États pour débounce NON-INVASIF
  isUpdating: boolean;
  lastUpdateTime: number;
  inputDebounceTimer: NodeJS.Timeout | null;
  pendingUpdates: Record<string, any>; // ✅ Buffer pour éviter les re-renders
  
  // Alertes et notifications
  activeAlerts: Alert[];
  notifications: Notification[];
  
  // Actions principales - ✅ MODE PRODUCTION: NON-INVASIVES
  updateSiteInformation: (data: Partial<ConfinedSpaceDetails>) => void;
  updateAtmosphericTesting: (data: Partial<AtmosphericTestingData>) => void;
  updateEntryRegistry: (data: Partial<EntryRegistryData>) => void;
  updateRescuePlan: (data: Partial<RescuePlanData>) => void;
  
  // Méthodes pour EntryRegistry
  updateRegistryData: (data: any) => void;
  updatePersonnel: (person: any) => void;
  updateEquipment: (equipment: any) => void;
  updateCompliance: (key: string, value: boolean) => void;
  recordEntryExit: (personId: string, action: 'entry' | 'exit' | 'emergency_exit') => void;
  
  // ✅ ALIAS DE COMPATIBILITÉ
  updateSiteInfo: (data: any) => void;
  updateAtmosphericData: (data: any) => void;
  updateRegistryInfo: (data: any) => void;
  updateRescueData: (data: any) => void;
  
  // ✅ MODE PRODUCTION: Méthodes d'optimisation
  flushPendingUpdates: () => void;
  silentSave: () => Promise<void>;
  
  // Gestion de base de données
  saveToDatabase: () => Promise<string | null>;
  loadFromDatabase: (permitNumber: string) => Promise<ConfinedSpacePermit | null>;
  loadPermitHistory: () => Promise<ConfinedSpacePermit[]>;
  
  // QR Code et partage
  generateQRCode: () => Promise<string>;
  generatePDF: () => Promise<Blob>;
  sharePermit: (method: 'email' | 'sms' | 'whatsapp') => Promise<void>;
  
  // Validation - ✅ RESTE ACTIVE pour progression et rapport final
  validatePermitCompleteness: () => ValidationResult;
  validateSection: (section: keyof ConfinedSpacePermit) => ValidationResult;
  
  // Utilitaires
  createNewPermit: (province: ProvinceCode) => void;
  resetPermit: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
  
  // Gestion des alertes et notifications
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  removeAlert: (alertId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

export const useSafetyManager = create<SafetyManagerState>()(
  persist(
    (set, get) => ({
      // =================== ÉTAT INITIAL ===================
      currentPermit: createEmptyPermit(),
      permits: [],
      isSaving: false,
      isLoading: false,
      lastSaved: null,
      autoSaveEnabled: true, // ✅ MODE PRODUCTION: Activé mais NON-INVASIF
      
      // ✅ MODE PRODUCTION: États optimisés pour UX
      isUpdating: false,
      lastUpdateTime: 0,
      inputDebounceTimer: null,
      pendingUpdates: {}, // ✅ Buffer pour éviter les re-renders

      activeAlerts: [],
      notifications: [],

      // =================== ACTIONS MODE PRODUCTION - NON-INVASIVES ===================
      
      updateSiteInformation: (data) => {
        console.log('🔄 SafetyManager: updateSiteInformation appelé', data);
        
        const state = get();
        
        // ✅ MODE PRODUCTION: MISE À JOUR SILENCIEUSE SANS RE-RENDER AGRESSIF
        const updatedSiteInfo = {
          ...state.currentPermit.siteInformation,
          ...data
        };
        
        // ✅ OPTIMISATION: Mise à jour directe de l'objet sans déclencher de re-render
        state.currentPermit.siteInformation = updatedSiteInfo;
        state.currentPermit.last_modified = new Date().toISOString();
        state.currentPermit.updated_at = new Date().toISOString();
        
        // ✅ BUFFER: Stocker les updates pour le debounce
        const pendingUpdates = { ...state.pendingUpdates };
        pendingUpdates.siteInformation = { ...pendingUpdates.siteInformation, ...data };
        
        // ✅ MISE À JOUR MINIMALE (sans re-render complet)
        set({ 
          lastUpdateTime: Date.now(),
          pendingUpdates
        });
        
        // ✅ DÉBOUNCE INTELLIGENT 5 SECONDES (plus long pour éviter les conflits)
        if (state.autoSaveEnabled) {
          if (state.inputDebounceTimer) {
            clearTimeout(state.inputDebounceTimer);
          }
          
          const timer = setTimeout(() => {
            console.log('💾 Auto-save silencieux déclenché après débounce');
            get().silentSave(); // ✅ SILENCIEUX = pas de re-render
          }, 5000); // ✅ 5 secondes pour laisser le temps de taper
          
          set({ inputDebounceTimer: timer });
        }
        
        console.log('✅ SafetyManager: siteInformation mis à jour silencieusement');
      },

      updateAtmosphericTesting: (data) => {
        console.log('🔄 SafetyManager: updateAtmosphericTesting appelé', data);
        
        const state = get();
        
        // ✅ MODE PRODUCTION: MISE À JOUR SILENCIEUSE
        const updatedAtmosphericTesting = {
          ...state.currentPermit.atmosphericTesting,
          ...data,
          lastUpdated: new Date().toISOString()
        };
        
        // ✅ OPTIMISATION: Mise à jour directe
        state.currentPermit.atmosphericTesting = updatedAtmosphericTesting;
        state.currentPermit.last_modified = new Date().toISOString();
        
        // ✅ BUFFER: Stocker les updates
        const pendingUpdates = { ...state.pendingUpdates };
        pendingUpdates.atmosphericTesting = { ...pendingUpdates.atmosphericTesting, ...data };
        
        set({ 
          lastUpdateTime: Date.now(),
          pendingUpdates
        });
        
        // Vérifier les alertes de sécurité (critique - pas de débounce)
        if (data.readings && Array.isArray(data.readings)) {
          const newAlerts = checkAtmosphericAlerts(data.readings);
          if (newAlerts.length > 0) {
            set((prevState) => ({
              activeAlerts: [...prevState.activeAlerts, ...newAlerts]
            }));
          }
        }
        
        // ✅ Auto-save silencieux avec débounce
        if (state.autoSaveEnabled) {
          if (state.inputDebounceTimer) {
            clearTimeout(state.inputDebounceTimer);
          }
          
          const timer = setTimeout(() => {
            get().silentSave();
          }, 5000);
          
          set({ inputDebounceTimer: timer });
        }
        
        console.log('✅ SafetyManager: atmosphericTesting mis à jour silencieusement');
      },

      updateEntryRegistry: (data) => {
        console.log('🔄 SafetyManager: updateEntryRegistry appelé', data);
        
        const state = get();
        
        // ✅ MODE PRODUCTION: MISE À JOUR SILENCIEUSE
        const updatedEntryRegistry = {
          ...state.currentPermit.entryRegistry,
          ...data,
          lastUpdated: new Date().toISOString()
        };
        
        // ✅ OPTIMISATION: Mise à jour directe
        state.currentPermit.entryRegistry = updatedEntryRegistry;
        state.currentPermit.last_modified = new Date().toISOString();
        
        // ✅ BUFFER: Stocker les updates
        const pendingUpdates = { ...state.pendingUpdates };
        pendingUpdates.entryRegistry = { ...pendingUpdates.entryRegistry, ...data };
        
        set({ 
          lastUpdateTime: Date.now(),
          pendingUpdates
        });
        
        // ✅ Auto-save silencieux avec débounce
        if (state.autoSaveEnabled) {
          if (state.inputDebounceTimer) {
            clearTimeout(state.inputDebounceTimer);
          }
          
          const timer = setTimeout(() => {
            get().silentSave();
          }, 5000);
          
          set({ inputDebounceTimer: timer });
        }
        
        console.log('✅ SafetyManager: entryRegistry mis à jour silencieusement');
      },

      updateRescuePlan: (data) => {
        console.log('🔄 SafetyManager: updateRescuePlan appelé', data);
        
        const state = get();
        
        // ✅ MODE PRODUCTION: MISE À JOUR SILENCIEUSE
        const updatedRescuePlan = {
          ...state.currentPermit.rescuePlan,
          ...data,
          lastUpdated: new Date().toISOString()
        };
        
        // ✅ OPTIMISATION: Mise à jour directe
        state.currentPermit.rescuePlan = updatedRescuePlan;
        state.currentPermit.last_modified = new Date().toISOString();
        
        // ✅ BUFFER: Stocker les updates
        const pendingUpdates = { ...state.pendingUpdates };
        pendingUpdates.rescuePlan = { ...pendingUpdates.rescuePlan, ...data };
        
        set({ 
          lastUpdateTime: Date.now(),
          pendingUpdates
        });
        
        // ✅ Auto-save silencieux avec débounce
        if (state.autoSaveEnabled) {
          if (state.inputDebounceTimer) {
            clearTimeout(state.inputDebounceTimer);
          }
          
          const timer = setTimeout(() => {
            get().silentSave();
          }, 5000);
          
          set({ inputDebounceTimer: timer });
        }
        
        console.log('✅ SafetyManager: rescuePlan mis à jour silencieusement');
      },

      // =================== MÉTHODES POUR ENTRYREGISTRY - OPTIMISÉES ===================
      updateRegistryData: (data) => {
        console.log('🔄 SafetyManager: updateRegistryData appelé', data);
        get().updateEntryRegistry(data);
      },

      updatePersonnel: (person) => {
        console.log('🔄 SafetyManager: updatePersonnel appelé', person);
        
        const state = get();
        const currentPersonnel = state.currentPermit.entryRegistry.personnel || [];
        
        // Mettre à jour ou ajouter la personne
        const existingIndex = currentPersonnel.findIndex(p => p.id === person.id);
        let updatedPersonnel;
        
        if (existingIndex >= 0) {
          updatedPersonnel = [...currentPersonnel];
          updatedPersonnel[existingIndex] = person;
        } else {
          updatedPersonnel = [...currentPersonnel, person];
        }
        
        get().updateEntryRegistry({ personnel: updatedPersonnel });
      },

      updateEquipment: (equipment) => {
        console.log('🔄 SafetyManager: updateEquipment appelé', equipment);
        get().updateEntryRegistry({ equipment });
      },

      updateCompliance: (key: string, value: boolean) => {
        console.log('🔄 SafetyManager: updateCompliance appelé', key, value);
        
        const state = get();
        const currentCompliance = state.currentPermit.entryRegistry.compliance || {};
        
        get().updateEntryRegistry({ 
          compliance: {
            ...currentCompliance,
            [key]: value
          }
        });
      },

      recordEntryExit: (personId, action) => {
        console.log('🔄 SafetyManager: recordEntryExit appelé', personId, action);
        
        const state = get();
        const entryLog = state.currentPermit.entryRegistry.entryLog || [];
        const activeEntrants = [...(state.currentPermit.entryRegistry.activeEntrants || [])];
        
        // Créer une nouvelle entrée de log
        const logEntry: EntryLogEntry = {
          id: generateId(),
          personnelId: personId,
          action,
          timestamp: new Date().toISOString(),
          authorizedBy: 'current_user'
        };
        
        // Mettre à jour la liste des entrants actifs
        if (action === 'entry') {
          if (!activeEntrants.includes(personId)) {
            activeEntrants.push(personId);
          }
        } else if (action === 'exit' || action === 'emergency_exit') {
          const index = activeEntrants.indexOf(personId);
          if (index > -1) {
            activeEntrants.splice(index, 1);
          }
        }
        
        get().updateEntryRegistry({
          entryLog: [...entryLog, logEntry],
          entryLogs: [...entryLog, logEntry], // Alias pour compatibilité
          activeEntrants,
          currentOccupancy: activeEntrants.length
        });
      },

      // ✅ ALIAS DE COMPATIBILITÉ - OPTIMISÉS
      updateSiteInfo: (data: any) => {
        console.log('🔄 SafetyManager: updateSiteInfo (alias) appelé', data);
        get().updateSiteInformation(data);
      },

      updateAtmosphericData: (data: any) => {
        console.log('🔄 SafetyManager: updateAtmosphericData (alias) appelé', data);
        get().updateAtmosphericTesting(data);
      },

      updateRegistryInfo: (data: any) => {
        console.log('🔄 SafetyManager: updateRegistryInfo (alias) appelé', data);
        get().updateEntryRegistry(data);
      },

      updateRescueData: (data: any) => {
        console.log('🔄 SafetyManager: updateRescueData (alias) appelé', data);
        get().updateRescuePlan(data);
      },

      // =================== MÉTHODES D'OPTIMISATION MODE PRODUCTION ===================
      
      flushPendingUpdates: () => {
        const state = get();
        if (Object.keys(state.pendingUpdates).length > 0) {
          console.log('🔄 Flush des updates en attente:', state.pendingUpdates);
          
          // Appliquer tous les updates en une seule fois
          const updatedPermit = { ...state.currentPermit };
          
          Object.keys(state.pendingUpdates).forEach(section => {
            if (updatedPermit[section as keyof ConfinedSpacePermit]) {
              (updatedPermit as any)[section] = {
                ...(updatedPermit as any)[section],
                ...state.pendingUpdates[section]
              };
            }
          });
          
          set({ 
            currentPermit: updatedPermit,
            pendingUpdates: {}
          });
        }
      },

      silentSave: async () => {
        const state = get();
        
        // ✅ SAUVEGARDE SILENCIEUSE: Pas de changement d'état UI
        if (state.isSaving) {
          console.log('🚫 Sauvegarde silencieuse déjà en cours');
          return;
        }

        console.log('💾 Sauvegarde silencieuse en cours...');
        
        try {
          // ✅ FLUSH: Appliquer les updates en attente
          get().flushPendingUpdates();
          
          const permit = get().currentPermit;
          
          // Générer un numéro de permis si nécessaire
          if (!permit.permit_number) {
            permit.permit_number = generatePermitNumber(permit.province);
          }
          
          // Mise à jour des timestamps
          permit.updated_at = new Date().toISOString();
          permit.last_modified = new Date().toISOString();
          
          // ✅ SAUVEGARDE SANS MODIFIER L'ÉTAT UI
          if (supabaseEnabled && supabase) {
            try {
              await supabase
                .from('confined_space_permits')
                .upsert({
                  permit_number: permit.permit_number,
                  data: permit,
                  updated_at: new Date().toISOString()
                });
              console.log('✅ Permit sauvegardé silencieusement dans Supabase');
            } catch (supabaseError) {
              console.error('❌ Erreur Supabase, fallback localStorage:', supabaseError);
              localStorage.setItem(`permit_${permit.permit_number}`, JSON.stringify(permit));
            }
          } else {
            // Fallback localStorage
            localStorage.setItem(`permit_${permit.permit_number}`, JSON.stringify(permit));
            localStorage.setItem('currentPermit', JSON.stringify(permit));
            console.log('✅ Permit sauvegardé silencieusement dans localStorage');
          }
          
          // ✅ MISE À JOUR MINIMALE: Juste le timestamp, pas de re-render
          set({ lastSaved: new Date().toISOString() });
          
        } catch (error) {
          console.error('❌ Erreur sauvegarde silencieuse:', error);
        }
      },

      // =================== GESTION BASE DE DONNÉES STANDARD ===================
      saveToDatabase: async () => {
        const state = get();
        
        // ✅ Éviter les sauvegardes concurrentes
        if (state.isSaving) {
          console.log('🚫 Sauvegarde déjà en cours, ignorée');
          return null;
        }

        set({ isSaving: true });
        
        try {
          const permit = get().currentPermit;
          const validation = get().validatePermitCompleteness();
          
          console.log('💾 Sauvegarde manuelle en cours...', permit.permit_number || 'nouveau');
          
          // Mise à jour de la validation
          permit.validation = {
            isComplete: validation.isValid,
            isValid: validation.isValid,
            percentage: validation.percentage,
            completedSections: validation.errors.length === 0 ? ['siteInformation', 'atmosphericTesting', 'entryRegistry', 'rescuePlan'] : [],
            errors: validation.errors,
            warnings: validation.warnings || [],
            lastValidated: new Date().toISOString()
          };
          
          // Générer un numéro de permis si nécessaire
          if (!permit.permit_number) {
            permit.permit_number = generatePermitNumber(permit.province);
          }
          
          // Mise à jour des timestamps
          permit.updated_at = new Date().toISOString();
          permit.last_modified = new Date().toISOString();
          
          // Sauvegarder dans Supabase si configuré, sinon localStorage
          if (supabaseEnabled && supabase) {
            try {
              const { data, error } = await supabase
                .from('confined_space_permits')
                .upsert({
                  permit_number: permit.permit_number,
                  data: permit,
                  updated_at: new Date().toISOString()
                });
                
              if (error) throw error;
              console.log('✅ Permit sauvegardé dans Supabase');
            } catch (supabaseError) {
              console.error('❌ Erreur Supabase, fallback vers localStorage:', supabaseError);
              localStorage.setItem(`permit_${permit.permit_number}`, JSON.stringify(permit));
            }
          } else {
            // Fallback localStorage
            localStorage.setItem(`permit_${permit.permit_number}`, JSON.stringify(permit));
            localStorage.setItem('currentPermit', JSON.stringify(permit));
            console.log('✅ Permit sauvegardé dans localStorage');
          }
          
          set({ 
            currentPermit: permit,
            lastSaved: new Date().toISOString(),
            isSaving: false 
          });
          
          // Notification de succès
          get().addNotification({
            type: 'success',
            message: `Permis ${permit.permit_number} sauvegardé avec succès`
          });
          
          return permit.permit_number;
        } catch (error) {
          console.error('❌ Erreur sauvegarde:', error);
          set({ isSaving: false });
          
          get().addNotification({
            type: 'critical',
            message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          });
          
          return null;
        }
      },

      loadFromDatabase: async (permitNumber: string) => {
        set({ isLoading: true });
        
        try {
          console.log('📥 Chargement du permis:', permitNumber);
          
          // Essayer Supabase d'abord
          if (supabaseEnabled && supabase) {
            try {
              const { data, error } = await supabase
                .from('confined_space_permits')
                .select('data')
                .eq('permit_number', permitNumber)
                .single();
                
              if (!error && data) {
                set({ 
                  currentPermit: data.data,
                  isLoading: false 
                });
                
                get().addNotification({
                  type: 'success',
                  message: `Permis ${permitNumber} chargé depuis Supabase`
                });
                
                return data.data;
              }
            } catch (supabaseError) {
              console.error('❌ Erreur chargement Supabase:', supabaseError);
            }
          }
          
          // Fallback localStorage
          const storedPermit = localStorage.getItem(`permit_${permitNumber}`);
          if (storedPermit) {
            const permit = JSON.parse(storedPermit);
            set({ 
              currentPermit: permit,
              isLoading: false 
            });
            
            get().addNotification({
              type: 'info',
              message: `Permis ${permitNumber} chargé depuis le cache local`
            });
            
            return permit;
          }
          
          set({ isLoading: false });
          
          get().addNotification({
            type: 'warning',
            message: `Permis ${permitNumber} introuvable`
          });
          
          return null;
        } catch (error) {
          console.error('❌ Erreur chargement:', error);
          set({ isLoading: false });
          
          get().addNotification({
            type: 'critical',
            message: `Erreur lors du chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          });
          
          return null;
        }
      },

      loadPermitHistory: async () => {
        try {
          let permits: ConfinedSpacePermit[] = [];
          
          // Essayer Supabase d'abord
          if (supabaseEnabled && supabase) {
            try {
              const { data, error } = await supabase
                .from('confined_space_permits')
                .select('data')
                .order('updated_at', { ascending: false })
                .limit(50);
                
              if (!error && data) {
                permits = data.map((item: any) => item.data);
              }
            } catch (supabaseError) {
              console.error('❌ Erreur historique Supabase:', supabaseError);
            }
          }
          
          // Fallback localStorage si pas de résultats Supabase
          if (permits.length === 0) {
            const currentPermit = get().currentPermit;
            if (currentPermit.permit_number) {
              permits = [currentPermit];
              
              // Chercher d'autres permis dans localStorage
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('permit_') && key !== `permit_${currentPermit.permit_number}`) {
                  try {
                    const permit = JSON.parse(localStorage.getItem(key) || '');
                    if (permit && permit.permit_number) {
                      permits.push(permit);
                    }
                  } catch (e) {
                    console.warn('⚠️ Erreur parsing permit:', key);
                  }
                }
              }
            }
          }
          
          set({ permits });
          return permits;
        } catch (error) {
          console.error('❌ Erreur historique:', error);
          return [];
        }
      },

      // =================== QR CODE ET PARTAGE ACTIFS ===================
      generateQRCode: async () => {
        const permit = get().currentPermit;
        if (!permit.permit_number) {
          throw new Error('Permit number required for QR code');
        }
        
        const permitUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/permits/confined-space/${permit.permit_number}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(permitUrl)}`;
        
        get().addNotification({
          type: 'success',
          message: 'Code QR généré avec succès'
        });
        
        return qrUrl;
      },

      generatePDF: async () => {
        const permit = get().currentPermit;
        const validation = get().validatePermitCompleteness();
        
        const pdfContent = `
Permis d'Entrée en Espace Clos
==============================

Numéro de permis: ${permit.permit_number}
Province: ${permit.province}
Statut: ${permit.status}
Date de création: ${new Date(permit.created_at).toLocaleDateString('fr-CA')}
Dernière modification: ${new Date(permit.last_modified).toLocaleDateString('fr-CA')}

INFORMATIONS DU SITE
====================
Numéro de projet: ${permit.siteInformation.projectNumber}
Lieu des travaux: ${permit.siteInformation.workLocation}
Entrepreneur: ${permit.siteInformation.contractor}
Superviseur: ${permit.siteInformation.supervisor}
Date d'entrée: ${permit.siteInformation.entryDate}
Description des travaux: ${permit.siteInformation.workDescription}

Type d'espace: ${permit.siteInformation.spaceType}
Classification CSA: ${permit.siteInformation.csaClass}
Volume: ${permit.siteInformation.dimensions.volume} ${permit.siteInformation.unitSystem === 'metric' ? 'm³' : 'ft³'}

TESTS ATMOSPHÉRIQUES
===================
Lectures effectuées: ${permit.atmosphericTesting.readings.length}
Surveillance continue: ${permit.atmosphericTesting.continuousMonitoring ? 'Oui' : 'Non'}
Équipement: ${permit.atmosphericTesting.equipment.deviceModel}
Dernière calibration: ${permit.atmosphericTesting.equipment.calibrationDate}

REGISTRE D'ENTRÉE
================
Personnel autorisé: ${permit.entryRegistry.personnel.length}
Entrants actifs: ${permit.entryRegistry.activeEntrants.length}
Occupancy maximale: ${permit.entryRegistry.maxOccupancy}

PLAN DE SAUVETAGE
================
Contacts d'urgence: ${permit.rescuePlan.emergencyContacts.length}
Équipe de sauvetage: ${permit.rescuePlan.rescueTeam.length}
Temps de réponse: ${permit.rescuePlan.responseTime} minutes

VALIDATION
==========
Complétude: ${validation.percentage}%
Statut: ${validation.isValid ? 'VALIDE' : 'INVALIDE'}
Erreurs: ${validation.errors.length}

${validation.errors.length > 0 ? `
ERREURS DÉTECTÉES:
${validation.errors.map(error => `- ${error}`).join('\n')}
` : ''}

Document généré le ${new Date().toLocaleString('fr-CA')}
        `;
        
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        
        get().addNotification({
          type: 'success',
          message: 'PDF généré avec succès'
        });
        
        return blob;
      },

      sharePermit: async (method: 'email' | 'sms' | 'whatsapp') => {
        const permit = get().currentPermit;
        const permitUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/permits/confined-space/${permit.permit_number}`;
        
        const message = `Permis d'espace clos ${permit.permit_number}
Lieu: ${permit.siteInformation.workLocation}
Entrepreneur: ${permit.siteInformation.contractor}
Accès: ${permitUrl}`;
        
        if (typeof window !== 'undefined') {
          switch (method) {
            case 'email':
              window.location.href = `mailto:?subject=Permis d'espace clos ${permit.permit_number}&body=${encodeURIComponent(message)}`;
              break;
            case 'sms':
              window.location.href = `sms:?body=${encodeURIComponent(message)}`;
              break;
            case 'whatsapp':
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
              break;
          }
        }
        
        get().addNotification({
          type: 'info',
          message: `Permis partagé via ${method}`
        });
      },

      // =================== VALIDATION COMPLÈTE ACTIVE ===================
      validatePermitCompleteness: () => {
        const permit = get().currentPermit;
        const errors: string[] = [];
        const warnings: string[] = [];
        let completedSections = 0;
        const totalSections = 4;

        // Validation Site Information
        const siteInfo = permit.siteInformation;
        let siteComplete = true;
        
        if (!siteInfo.projectNumber?.trim()) {
          errors.push('Numéro de projet manquant');
          siteComplete = false;
        }
        if (!siteInfo.workLocation?.trim()) {
          errors.push('Lieu des travaux manquant');
          siteComplete = false;
        }
        if (!siteInfo.contractor?.trim()) {
          errors.push('Entrepreneur manquant');
          siteComplete = false;
        }
        if (!siteInfo.supervisor?.trim()) {
          errors.push('Superviseur manquant');
          siteComplete = false;
        }
        if (!siteInfo.entryDate) {
          errors.push('Date d\'entrée manquante');
          siteComplete = false;
        }
        if (!siteInfo.spaceType) {
          errors.push('Type d\'espace manquant');
          siteComplete = false;
        }
        if (!siteInfo.csaClass) {
          errors.push('Classification CSA manquante');
          siteComplete = false;
        }
        if (siteInfo.dimensions?.volume === 0) {
          warnings.push('Volume doit être calculé');
        }
        if (!siteInfo.entryPoints?.length) {
          warnings.push('Au moins un point d\'entrée recommandé');
        }
        
        if (siteComplete) completedSections++;

        // Validation Atmospheric Testing
        if (permit.atmosphericTesting?.readings?.length > 0) {
          completedSections++;
          
          // Vérifier la fraîcheur des lectures
          const latestReading = permit.atmosphericTesting.readings[permit.atmosphericTesting.readings.length - 1];
          const readingAge = Date.now() - new Date(latestReading.timestamp).getTime();
          if (readingAge > 30 * 60 * 1000) { // 30 minutes
            warnings.push('Lectures atmosphériques anciennes (> 30 min)');
          }
        } else {
          errors.push('Tests atmosphériques manquants');
        }

        // Validation Entry Registry
        if (permit.entryRegistry?.personnel?.length > 0) {
          completedSections++;
          
          // Vérifier les certifications
          const personnelWithoutCert = permit.entryRegistry.personnel.filter(p => !p.certification?.length);
          if (personnelWithoutCert.length > 0) {
            warnings.push(`${personnelWithoutCert.length} personne(s) sans certification`);
          }
        } else {
          errors.push('Personnel non défini');
        }

        // Validation Rescue Plan
        if (permit.rescuePlan?.emergencyContacts?.length > 0) {
          completedSections++;
          
          // Vérifier le temps de réponse
          if (!permit.rescuePlan.responseTime || permit.rescuePlan.responseTime > 10) {
            warnings.push('Temps de réponse de sauvetage élevé (> 10 min)');
          }
        } else {
          errors.push('Plan de sauvetage incomplet');
        }

        const percentage = Math.round((completedSections / totalSections) * 100);
        
        return {
          isValid: errors.length === 0,
          percentage,
          errors,
          warnings,
          completedSections,
          totalSections
        };
      },

      validateSection: (section) => {
        const permit = get().currentPermit;
        const errors: string[] = [];
        const warnings: string[] = [];
        
        switch (section) {
          case 'siteInformation':
            const siteInfo = permit.siteInformation;
            if (!siteInfo.projectNumber) errors.push('Numéro de projet requis');
            if (!siteInfo.workLocation) errors.push('Lieu de travail requis');
            if (!siteInfo.contractor) errors.push('Entrepreneur requis');
            if (!siteInfo.supervisor) errors.push('Superviseur requis');
            if (!siteInfo.entryDate) errors.push('Date d\'entrée requise');
            if (!siteInfo.spaceType) warnings.push('Type d\'espace recommandé');
            break;
          case 'atmosphericTesting':
            if (!permit.atmosphericTesting.readings.length) errors.push('Lectures atmosphériques requises');
            if (!permit.atmosphericTesting.equipment.deviceModel) warnings.push('Modèle d\'équipement requis');
            break;
          case 'entryRegistry':
            if (!permit.entryRegistry.personnel.length) errors.push('Personnel requis');
            if (!permit.entryRegistry.maxOccupancy) warnings.push('Occupancy maximale non définie');
            break;
          case 'rescuePlan':
            if (!permit.rescuePlan.emergencyContacts.length) errors.push('Contacts d\'urgence requis');
            if (!permit.rescuePlan.evacuationProcedure) warnings.push('Procédure d\'évacuation recommandée');
            break;
        }
        
        return {
          isValid: errors.length === 0,
          percentage: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25)),
          errors,
          warnings,
          completedSections: errors.length === 0 ? 1 : 0,
          totalSections: 1
        };
      },

      // =================== UTILITAIRES ACTIFS ===================
      createNewPermit: (province: ProvinceCode) => {
        const newPermit = createEmptyPermit();
        newPermit.province = province;
        newPermit.permit_number = generatePermitNumber(province);
        newPermit.created_at = new Date().toISOString();
        
        set({ currentPermit: newPermit });
        
        get().addNotification({
          type: 'success',
          message: `Nouveau permis créé: ${newPermit.permit_number}`
        });
      },

      resetPermit: () => {
        set({ currentPermit: createEmptyPermit() });
        
        get().addNotification({
          type: 'info',
          message: 'Permis réinitialisé'
        });
      },

      exportData: () => {
        const permit = get().currentPermit;
        const exportData = {
          permit,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        get().addNotification({
          type: 'success',
          message: 'Données exportées'
        });
        
        return JSON.stringify(exportData, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          const permit = data.permit || data;
          
          // Validation de base
          if (!permit.permit_number) {
            throw new Error('Données invalides: numéro de permis manquant');
          }
          
          set({ currentPermit: permit });
          
          get().addNotification({
            type: 'success',
            message: `Permis ${permit.permit_number} importé avec succès`
          });
        } catch (error) {
          console.error('Erreur import:', error);
          
          get().addNotification({
            type: 'critical',
            message: `Erreur d'importation: ${error instanceof Error ? error.message : 'Format invalide'}`
          });
        }
      },

      // =================== GESTION ALERTES ET NOTIFICATIONS ACTIVE ===================
      addAlert: (alert) => {
        const newAlert: Alert = {
          ...alert,
          id: generateId(),
          timestamp: new Date().toISOString(),
          isRead: false
        };
        
        set((state) => ({
          activeAlerts: [...state.activeAlerts, newAlert]
        }));
      },

      removeAlert: (alertId) => {
        set((state) => ({
          activeAlerts: state.activeAlerts.filter(alert => alert.id !== alertId)
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date().toISOString(),
          isRead: false
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications.slice(0, 49)] // Garder max 50 notifications
        }));
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        }));
      }
    }),
    {
      name: 'safety-manager-storage',
      partialize: (state) => ({
        currentPermit: state.currentPermit,
        permits: state.permits,
        autoSaveEnabled: state.autoSaveEnabled,
        lastSaved: state.lastSaved,
        notifications: state.notifications.slice(0, 10) // Persister seulement les 10 dernières
      })
    }
  )
);

// =================== HELPER FUNCTIONS POUR COMPATIBILITÉ UNIVERSELLE ===================
export const createConfinedSpacePermit = (province: ProvinceCode = 'QC'): ConfinedSpacePermit => {
  const permit = createEmptyPermit();
  permit.province = province;
  permit.permit_number = generatePermitNumber(province);
  return permit;
};

export const validatePermitSection = (permit: ConfinedSpacePermit, section: keyof ConfinedSpacePermit): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  switch (section) {
    case 'siteInformation':
      const siteInfo = permit.siteInformation;
      if (!siteInfo.projectNumber) errors.push('Numéro de projet requis');
      if (!siteInfo.workLocation) errors.push('Lieu de travail requis');
      if (!siteInfo.contractor) errors.push('Entrepreneur requis');
      if (!siteInfo.supervisor) errors.push('Superviseur requis');
      if (!siteInfo.entryDate) errors.push('Date d\'entrée requise');
      break;
    case 'atmosphericTesting':
      if (!permit.atmosphericTesting.readings.length) errors.push('Lectures atmosphériques requises');
      break;
    case 'entryRegistry':
      if (!permit.entryRegistry.personnel.length) errors.push('Personnel requis');
      break;
    case 'rescuePlan':
      if (!permit.rescuePlan.emergencyContacts.length) errors.push('Contacts d\'urgence requis');
      break;
  }
  
  return {
    isValid: errors.length === 0,
    percentage: errors.length === 0 ? 100 : 0,
    errors,
    warnings,
    completedSections: errors.length === 0 ? 1 : 0,
    totalSections: 1
  };
};

// Utilitaires pour la compatibilité (EXPORTS AJOUTÉS)
export const generatePermitId = generateId;
export const generateNewPermitNumber = generatePermitNumber;
export const createAuditTrailEntry = createAuditEntry;

// Hook simplifié pour compatibilité
export const usePermitValidation = (permit: ConfinedSpacePermit) => {
  const manager = useSafetyManager();
  return manager.validatePermitCompleteness();
};

// Export par défaut pour compatibilité maximale
export default useSafetyManager;
