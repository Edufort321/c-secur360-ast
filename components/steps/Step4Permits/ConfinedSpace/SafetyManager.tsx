// SafetyManager.tsx - VERSION SILENCIEUSE COMPLÈTE (Stop Boucle Infinie)
"use client";

// =================== TYPES COMPLETS POUR COMPATIBILITÉ ===================
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type Language = 'fr' | 'en';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type UserRole = 'entrant' | 'attendant' | 'supervisor' | 'rescue' | 'admin';
export type SafetyRole = UserRole;
export type AlertType = 'info' | 'warning' | 'critical' | 'success';

// =================== EXPORTS MANQUANTS POUR SITEINFORMATION ===================
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

// =================== TOUS LES TYPES DEMANDÉS PAR LES COMPOSANTS ===================
export interface AtmosphericTestingData {
  equipment?: any;
  readings?: AtmosphericReading[];
  continuousMonitoring?: boolean;
  alarmSettings?: AlarmSettings;
  testingFrequency?: number;
  lastUpdated?: string;
  [key: string]: any;
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
  [key: string]: any;
}

export interface AlarmSettings {
  oxygen: { min: number; max: number };
  combustibleGas: { max: number };
  hydrogenSulfide: { max: number };
  carbonMonoxide: { max: number };
  [key: string]: any;
}

export interface ConfinedSpaceDetails {
  projectNumber?: string;
  workLocation?: string;
  contractor?: string;
  supervisor?: string;
  entryDate?: string;
  duration?: string;
  workerCount?: number;
  workDescription?: string;
  spaceType?: string;
  csaClass?: string;
  entryMethod?: string;
  accessType?: string;
  spaceLocation?: string;
  spaceDescription?: string;
  dimensions?: Dimensions;
  unitSystem?: 'metric' | 'imperial';
  entryPoints?: EntryPoint[];
  atmosphericHazards?: string[];
  physicalHazards?: string[];
  environmentalConditions?: EnvironmentalConditions;
  spaceContent?: SpaceContent;
  safetyMeasures?: SafetyMeasures;
  spacePhotos?: SpacePhoto[];
  [key: string]: any;
}

export interface EntryRegistryData {
  personnel?: PersonnelEntry[];
  entryLog?: EntryLogEntry[];
  entryLogs?: EntryLogEntry[];
  activeEntrants?: string[];
  maxOccupancy?: number;
  communicationProtocol?: CommunicationProtocol;
  lastUpdated?: string;
  equipment?: any[];
  compliance?: Record<string, boolean>;
  supervisor?: any;
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
  entryDateTime?: string;
  exitDateTime?: string;
  workDescription?: string;
  notes?: string;
  emergencyContacts?: EmergencyContact[];
  [key: string]: any;
}

export interface RescuePlanData {
  emergencyContacts?: EmergencyContact[];
  rescueTeam?: RescueTeamMember[];
  evacuationProcedure?: string;
  rescueEquipment?: EquipmentItem[];
  hospitalInfo?: HospitalInfo;
  communicationPlan?: string;
  lastUpdated?: string;
  responseTime?: number;
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
  rescue_team_certifications?: any;
  equipment_certifications?: any;
  annual_drill_required?: boolean;
  last_effectiveness_test?: string;
  regulatory_compliance_verified?: boolean;
  rescue_training?: Record<string, boolean>;
  last_drill_date?: string;
  drill_results?: string;
  drill_notes?: string;
  rescue_plan_validated?: boolean;
  [key: string]: any;
}

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
  entryTime?: string;
  exitTime?: string;
  status?: 'inside' | 'outside' | 'emergency';
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
  [key: string]: any;
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
  [key: string]: any;
}

export interface CommunicationProtocol {
  type: 'radio' | 'cellular' | 'hardline';
  frequency?: string;
  checkInterval: number;
  [key: string]: any;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  [key: string]: any;
}

export interface RescueTeamMember {
  id: string;
  name: string;
  role: string;
  certification: string[];
  phone: string;
  isOnCall: boolean;
  [key: string]: any;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  serialNumber?: string;
  lastInspection: string;
  nextInspection: string;
  isAvailable: boolean;
  [key: string]: any;
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  distance: number;
  [key: string]: any;
}

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
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  isRead: boolean;
  action?: string;
  [key: string]: any;
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
  [key: string]: any;
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
  [key: string]: any;
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

// =================== INTERFACE POUR LES COMPOSANTS ===================
export interface ConfinedSpaceComponentProps {
  language: Language;
  permitData: any;
  selectedProvince: ProvinceCode;
  regulations: any;
  isMobile: boolean;
  safetyManager?: any;
  atmosphericReadings?: any[];
  setAtmosphericReadings?: (readings: any[]) => void;
  updateParentData?: (field: string, value: any) => void;
  updatePermitData?: (data: any) => void;
  styles?: any;
  onDataChange?: (field: string, value: any) => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onSubmit?: (data: any) => void;
  readOnly?: boolean;
  onUpdate?: (section: string, data: any) => void;
  onSectionComplete?: (sectionData: any) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  [key: string]: any; // Accepte toutes les autres props
}

// =================== TYPES BASIQUES ===================
export interface ConfinedSpacePermit {
  permit_number: string;
  status: PermitStatus;
  province: ProvinceCode;
  created_at: string;
  updated_at: string;
  last_modified: string;
  siteInformation: any;
  atmosphericTesting: any;
  entryRegistry: any;
  rescuePlan: any;
  validation: any;
  auditTrail: any[];
  attachments: any[];
  id?: string;
  issue_date?: string;
  attendant_present?: boolean;
  communication_system_tested?: boolean;
  emergency_retrieval_ready?: boolean;
  compliance?: Record<string, boolean>;
  [key: string]: any;
}

// =================== FONCTIONS UTILITAIRES SILENCIEUSES ===================
let idCounter = 0;

export const generatePermitNumber = (province: ProvinceCode): string => {
  const timestamp = Date.now();
  return `CS-${province}-${timestamp}`;
};

export const generateId = (): string => {
  return `id_${++idCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generatePermitId = (): string => {
  return generateId();
};

export const createConfinedSpacePermit = (province: ProvinceCode = 'QC'): ConfinedSpacePermit => {
  const now = new Date().toISOString();
  return {
    permit_number: generatePermitNumber(province),
    status: 'draft',
    province,
    created_at: now,
    updated_at: now,
    last_modified: now,
    siteInformation: {},
    atmosphericTesting: {},
    entryRegistry: {},
    rescuePlan: {},
    validation: { isValid: false, percentage: 0, errors: [], completedSections: 0, totalSections: 4 },
    auditTrail: [],
    attachments: []
  };
};

export const validatePermitSection = (permit: ConfinedSpacePermit, section: any): ValidationResult => {
  return {
    isValid: false,
    percentage: 0,
    errors: [],
    warnings: [],
    completedSections: 0,
    totalSections: 1
  };
};

export const createAuditTrailEntry = (action: string, section: string, changes: any, oldValues?: any): AuditEntry => {
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
};

export const generateNewPermitNumber = generatePermitNumber;
export const usePermitValidation = (permit: ConfinedSpacePermit) => {
  return { isValid: false, percentage: 0, errors: [], warnings: [], completedSections: 0, totalSections: 4 };
};

// =================== SAFETYMANAGER SILENCIEUX (Pas de console.log, pas de validation automatique) ===================
const createSilentSafetyManager = () => ({
  // État statique
  currentPermit: {} as ConfinedSpacePermit,
  permits: [] as ConfinedSpacePermit[],
  isSaving: false,
  isLoading: false,
  lastSaved: null,
  autoSaveEnabled: false,
  isUpdating: false,
  lastUpdateTime: 0,
  activeAlerts: [],
  notifications: [],

  // 🔇 FONCTIONS SILENCIEUSES - Ne font rien, pas de console.log
  updateSiteInformation: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateAtmosphericTesting: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateEntryRegistry: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateRescuePlan: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateRegistryData: (data: any) => {
    // Silencieux - aucune action
  },
  
  updatePersonnel: (person: any) => {
    // Silencieux - aucune action
  },
  
  updateEquipment: (equipment: any) => {
    // Silencieux - aucune action
  },
  
  updateCompliance: (key: string, value: boolean) => {
    // Silencieux - aucune action
  },
  
  recordEntryExit: (personId: string, action: any) => {
    // Silencieux - aucune action
  },
  
  updateSiteInfo: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateAtmosphericData: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateRegistryInfo: (data: any) => {
    // Silencieux - aucune action
  },
  
  updateRescueData: (data: any) => {
    // Silencieux - aucune action
  },
  
  saveToDatabase: async () => {
    // Silencieux - pas de sauvegarde
    return null;
  },
  
  loadFromDatabase: async (permitNumber: string) => {
    // Silencieux - pas de chargement
    return null;
  },
  
  loadPermitHistory: async () => {
    // Silencieux - pas d'historique
    return [];
  },
  
  generateQRCode: async () => {
    // Silencieux - pas de QR code
    return '';
  },
  
  generatePDF: async () => {
    // Silencieux - pas de PDF
    return new Blob();
  },
  
  sharePermit: async (method: string) => {
    // Silencieux - pas de partage
  },
  
  // 🔇 VALIDATION SILENCIEUSE (retourne des valeurs par défaut SANS déclencher de re-renders)
  validatePermitCompleteness: (): ValidationResult => {
    // Validation statique silencieuse
    return {
      isValid: false,
      percentage: 0,
      errors: [],
      warnings: [],
      completedSections: 0,
      totalSections: 4
    };
  },
  
  validateSection: (section: any): ValidationResult => {
    // Validation statique silencieuse
    return {
      isValid: false,
      percentage: 0,
      errors: [],
      warnings: [],
      completedSections: 0,
      totalSections: 1
    };
  },
  
  createNewPermit: (province: ProvinceCode) => {
    // Silencieux - pas de création
  },
  
  resetPermit: () => {
    // Silencieux - pas de reset
  },
  
  exportData: () => {
    // Silencieux - pas d'export
    return '{}';
  },
  
  importData: (jsonData: string) => {
    // Silencieux - pas d'import
  },
  
  addAlert: (alert: any) => {
    // Silencieux - pas d'alertes
  },
  
  removeAlert: (alertId: string) => {
    // Silencieux - pas de suppression d'alertes
  },
  
  addNotification: (notification: any) => {
    // Silencieux - pas de notifications
  },
  
  markNotificationAsRead: (notificationId: string) => {
    // Silencieux - pas de marquage lu
  }
});

// =================== HOOK SILENCIEUX ===================
export const useSafetyManager = () => {
  // Pas de console.log, pas de re-renders
  return createSilentSafetyManager();
};

// =================== EXPORT PAR DÉFAUT ===================
export default useSafetyManager;
