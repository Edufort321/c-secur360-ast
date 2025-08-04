// SafetyManager.tsx - VERSION FANTÔME COMPLÈTE (tous les exports nécessaires)
"use client";

// =================== TYPES COMPLETS POUR COMPATIBILITÉ ===================
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type Language = 'fr' | 'en';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type UserRole = 'entrant' | 'attendant' | 'supervisor' | 'rescue' | 'admin';
export type SafetyRole = UserRole;
export type AlertType = 'info' | 'warning' | 'critical' | 'success';

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
  dimensions?: any;
  unitSystem?: 'metric' | 'imperial';
  entryPoints?: any[];
  atmosphericHazards?: string[];
  physicalHazards?: string[];
  environmentalConditions?: any;
  spaceContent?: any;
  safetyMeasures?: any;
  spacePhotos?: any[];
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

// =================== FONCTIONS UTILITAIRES FANTÔMES ===================
export const generatePermitNumber = (province: ProvinceCode): string => {
  console.log('👻 generatePermitNumber fantôme appelé', province);
  const timestamp = Date.now();
  return `CS-${province}-${timestamp}`;
};

export const generateId = (): string => {
  console.log('👻 generateId fantôme appelé');
  return Math.random().toString(36).substr(2, 9);
};

// ✅ AJOUT: generatePermitId demandé par les composants
export const generatePermitId = (): string => {
  console.log('👻 generatePermitId fantôme appelé');
  return generateId();
};

export const createConfinedSpacePermit = (province: ProvinceCode = 'QC'): ConfinedSpacePermit => {
  console.log('👻 createConfinedSpacePermit fantôme appelé', province);
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
  console.log('👻 validatePermitSection fantôme appelé', section);
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
  console.log('👻 createAuditTrailEntry fantôme appelé', action, section);
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

// ✅ AJOUTS: Autres exports demandés
export const generateNewPermitNumber = generatePermitNumber;
export const usePermitValidation = (permit: ConfinedSpacePermit) => {
  console.log('👻 usePermitValidation fantôme appelé');
  return { isValid: false, percentage: 0, errors: [], warnings: [], completedSections: 0, totalSections: 4 };
};

// =================== SAFETYMANAGER FANTÔME ===================
const createGhostSafetyManager = () => ({
  // État fantôme
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

  // 👻 FONCTIONS FANTÔMES - Ne font rien mais existent
  updateSiteInformation: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateSiteInformation ignoré', data);
  },
  
  updateAtmosphericTesting: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateAtmosphericTesting ignoré', data);
  },
  
  updateEntryRegistry: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateEntryRegistry ignoré', data);
  },
  
  updateRescuePlan: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateRescuePlan ignoré', data);
  },
  
  // Méthodes pour EntryRegistry
  updateRegistryData: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateRegistryData ignoré', data);
  },
  
  updatePersonnel: (person: any) => {
    console.log('👻 SafetyManager fantôme: updatePersonnel ignoré', person);
  },
  
  updateEquipment: (equipment: any) => {
    console.log('👻 SafetyManager fantôme: updateEquipment ignoré', equipment);
  },
  
  updateCompliance: (key: string, value: boolean) => {
    console.log('👻 SafetyManager fantôme: updateCompliance ignoré', key, value);
  },
  
  recordEntryExit: (personId: string, action: any) => {
    console.log('👻 SafetyManager fantôme: recordEntryExit ignoré', personId, action);
  },
  
  // Alias de compatibilité
  updateSiteInfo: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateSiteInfo ignoré', data);
  },
  
  updateAtmosphericData: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateAtmosphericData ignoré', data);
  },
  
  updateRegistryInfo: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateRegistryInfo ignoré', data);
  },
  
  updateRescueData: (data: any) => {
    console.log('👻 SafetyManager fantôme: updateRescueData ignoré', data);
  },
  
  // Base de données fantôme
  saveToDatabase: async () => {
    console.log('👻 SafetyManager fantôme: saveToDatabase ignoré');
    return null;
  },
  
  loadFromDatabase: async (permitNumber: string) => {
    console.log('👻 SafetyManager fantôme: loadFromDatabase ignoré', permitNumber);
    return null;
  },
  
  loadPermitHistory: async () => {
    console.log('👻 SafetyManager fantôme: loadPermitHistory ignoré');
    return [];
  },
  
  // QR Code et partage fantôme
  generateQRCode: async () => {
    console.log('👻 SafetyManager fantôme: generateQRCode ignoré');
    return '';
  },
  
  generatePDF: async () => {
    console.log('👻 SafetyManager fantôme: generatePDF ignoré');
    return new Blob();
  },
  
  sharePermit: async (method: string) => {
    console.log('👻 SafetyManager fantôme: sharePermit ignoré', method);
  },
  
  // Validation fantôme (retourne des valeurs par défaut)
  validatePermitCompleteness: (): ValidationResult => {
    console.log('👻 SafetyManager fantôme: validatePermitCompleteness - retour valeurs par défaut');
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
    console.log('👻 SafetyManager fantôme: validateSection ignoré', section);
    return {
      isValid: false,
      percentage: 0,
      errors: [],
      warnings: [],
      completedSections: 0,
      totalSections: 1
    };
  },
  
  // Utilitaires fantômes
  createNewPermit: (province: ProvinceCode) => {
    console.log('👻 SafetyManager fantôme: createNewPermit ignoré', province);
  },
  
  resetPermit: () => {
    console.log('👻 SafetyManager fantôme: resetPermit ignoré');
  },
  
  exportData: () => {
    console.log('👻 SafetyManager fantôme: exportData ignoré');
    return '{}';
  },
  
  importData: (jsonData: string) => {
    console.log('👻 SafetyManager fantôme: importData ignoré', jsonData);
  },
  
  // Alertes fantômes
  addAlert: (alert: any) => {
    console.log('👻 SafetyManager fantôme: addAlert ignoré', alert);
  },
  
  removeAlert: (alertId: string) => {
    console.log('👻 SafetyManager fantôme: removeAlert ignoré', alertId);
  },
  
  addNotification: (notification: any) => {
    console.log('👻 SafetyManager fantôme: addNotification ignoré', notification);
  },
  
  markNotificationAsRead: (notificationId: string) => {
    console.log('👻 SafetyManager fantôme: markNotificationAsRead ignoré', notificationId);
  }
});

// =================== HOOK FANTÔME ===================
export const useSafetyManager = () => {
  console.log('👻 useSafetyManager fantôme appelé - aucune interférence');
  return createGhostSafetyManager();
};

// =================== EXPORT PAR DÉFAUT ===================
export default useSafetyManager;

// =================== CONSOLE INFO ===================
console.log('👻 SafetyManager FANTÔME COMPLET chargé - Pas d\'interférence, tous les exports disponibles!');
