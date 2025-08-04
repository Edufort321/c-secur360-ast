// SafetyManager.tsx - VERSION FANTÔME (juste pour éviter les erreurs de build)
"use client";

// =================== TYPES MINIMUMS POUR COMPATIBILITÉ ===================
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
export type Language = 'fr' | 'en';
export type PermitStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type UserRole = 'entrant' | 'attendant' | 'supervisor' | 'rescue' | 'admin';
export type AlertType = 'info' | 'warning' | 'critical' | 'success';

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

// =================== EXPORTS POUR COMPATIBILITÉ ===================
export const generatePermitNumber = (province: ProvinceCode): string => {
  const timestamp = Date.now();
  return `CS-${province}-${timestamp}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
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

export default useSafetyManager;

// =================== CONSOLE INFO ===================
console.log('👻 SafetyManager FANTÔME chargé - Pas d\'interférence, juste compatibilité build!');
