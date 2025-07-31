// SafetyManager.tsx - Gestionnaire Centralisé avec Supabase
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

// =================== CONFIGURATION SUPABASE ===================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// =================== TYPES COMPLETS BASÉS SUR SITEINFORMATION RÉEL ===================
export interface ConfinedSpacePermit {
  // Métadonnées
  id?: string;
  permit_number: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  province: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  
  // Données des sections (basées sur le code réel)
  siteInformation: ConfinedSpaceDetails;
  atmosphericTesting: AtmosphericTestingData;
  entryRegistry: EntryRegistryData;
  rescuePlan: RescuePlanData;
  
  // Métadonnées de validation
  validation: {
    isComplete: boolean;
    percentage: number;
    errors: string[];
    lastValidated: string;
  };
  
  // Données d'audit
  auditTrail: AuditEntry[];
  attachments: AttachmentData[];
}

// Types directement du SiteInformation.tsx
export interface ConfinedSpaceDetails {
  // Informations principales
  projectNumber: string;
  workLocation: string;
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
  entryPoints: Array<{
    id: string;
    type: string;
    dimensions: string;
    location: string;
    condition: string;
    accessibility: string;
    photos: string[];
  }>;

  // Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];

  // Conditions environnementales
  environmentalConditions: {
    ventilationRequired: boolean;
    ventilationType: string;
    lightingConditions: string;
    temperatureRange: string;
    moistureLevel: string;
    noiseLevel: string;
    weatherConditions: string;
  };

  // Contenu de l'espace
  spaceContent: {
    contents: string;
    residues: string;
    previousUse: string;
    lastEntry: string;
    cleaningStatus: string;
  };

  // Mesures de sécurité
  safetyMeasures: {
    emergencyEgress: string;
    communicationMethod: string;
    monitoringEquipment: string[];
    ventilationEquipment: string[];
    emergencyEquipment: string[];
  };

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
  lastUpdated: string;
}

export interface EntryRegistryData {
  personnel: PersonnelEntry[];
  entryLog: EntryLogEntry[];
  activeEntrants: string[]; // IDs des personnes actuellement à l'intérieur
  maxOccupancy: number;
  communicationProtocol: CommunicationProtocol;
  lastUpdated: string;
}

export interface RescuePlanData {
  emergencyContacts: EmergencyContact[];
  rescueTeam: RescueTeamMember[];
  evacuationProcedure: string;
  rescueEquipment: EquipmentItem[];
  hospitalInfo: HospitalInfo;
  communicationPlan: string;
  lastUpdated: string;
}

// =================== INTERFACES DÉTAILLÉES ===================
export interface AtmosphericReading {
  id: string;
  timestamp: string;
  location: string;
  readings: {
    oxygen: number; // %
    combustibleGas: number; // % LEL
    hydrogenSulfide: number; // ppm
    carbonMonoxide: number; // ppm
    temperature: number; // °C
    humidity: number; // %
  };
  status: 'safe' | 'caution' | 'danger';
  testedBy: string;
  notes?: string;
}

export interface PersonnelEntry {
  id: string;
  name: string;
  role: 'entrant' | 'attendant' | 'supervisor' | 'rescue';
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

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  section: string;
  userId: string;
  changes: Record<string, any>;
  oldValues?: Record<string, any>;
}

// =================== TYPES ADDITIONNELS ===================
interface ValidationResult {
  isValid: boolean;
  percentage: number;
  errors: string[];
  completedSections: number;
  totalSections: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  location?: string;
  timestamp: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface AlarmSettings {
  oxygen: { min: number; max: number };
  combustibleGas: { max: number };
  hydrogenSulfide: { max: number };
  carbonMonoxide: { max: number };
}

interface CommunicationProtocol {
  type: 'radio' | 'cellular' | 'hardline';
  frequency?: string;
  checkInterval: number; // minutes
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

interface RescueTeamMember {
  id: string;
  name: string;
  role: string;
  certification: string[];
  phone: string;
  isOnCall: boolean;
}

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  serialNumber?: string;
  lastInspection: string;
  nextInspection: string;
  isAvailable: boolean;
}

interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  distance: number; // km
}

interface AttachmentData {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  description?: string;
}

// Fix du type manquant
interface SiteInformationData extends ConfinedSpaceDetails {}

// =================== STORE ZUSTAND CENTRALISÉ ===================
interface SafetyManagerState {
  // État principal
  currentPermit: ConfinedSpacePermit;
  permits: ConfinedSpacePermit[];
  
  // États de l'interface
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  
  // Alertes et notifications
  activeAlerts: Alert[];
  notifications: Notification[];
  
  // Actions principales
  updateSiteInformation: (data: Partial<SiteInformationData>) => void;
  updateAtmosphericTesting: (data: Partial<AtmosphericTestingData>) => void;
  updateEntryRegistry: (data: Partial<EntryRegistryData>) => void;
  updateRescuePlan: (data: Partial<RescuePlanData>) => void;
  
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
  createNewPermit: (province: string) => void;
  resetPermit: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
}

// =================== HOOK PRINCIPAL ===================
export const useSafetyManager = create<SafetyManagerState>()(
  persist(
    (set, get) => ({
      // État initial
      currentPermit: createEmptyPermit(),
      permits: [],
      isSaving: false,
      isLoading: false,
      lastSaved: null,
      autoSaveEnabled: true,
      activeAlerts: [],
      notifications: [],

      // =================== ACTIONS DE MISE À JOUR BASÉES SUR LA STRUCTURE RÉELLE ===================
      updateSiteInformation: (data) => {
        set((state) => {
          const updatedPermit = {
            ...state.currentPermit,
            siteInformation: {
              ...state.currentPermit.siteInformation,
              ...data
            },
            last_modified: new Date().toISOString()
          };
          
          // Audit trail
          updatedPermit.auditTrail.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'update_site_information',
            section: 'siteInformation',
            userId: 'current_user',
            changes: data
          });
          
          // Auto-save si activé
          if (state.autoSaveEnabled) {
            setTimeout(() => get().saveToDatabase(), 2000);
          }
          
          return { currentPermit: updatedPermit };
        });
      },

      updateAtmosphericTesting: (data) => {
        set((state) => {
          const updatedPermit = {
            ...state.currentPermit,
            atmosphericTesting: {
              ...state.currentPermit.atmosphericTesting,
              ...data,
              lastUpdated: new Date().toISOString()
            },
            last_modified: new Date().toISOString()
          };
          
          // Vérifier les alertes de sécurité
          if (data.readings) {
            const newAlerts = checkAtmosphericAlerts(data.readings);
            updatedPermit.auditTrail.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              action: 'update_atmospheric_testing',
              section: 'atmosphericTesting',
              userId: 'current_user',
              changes: data
            });
            
            return { 
              currentPermit: updatedPermit,
              activeAlerts: [...state.activeAlerts, ...newAlerts]
            };
          }
          
          return { currentPermit: updatedPermit };
        });
      },

      updateEntryRegistry: (data) => {
        set((state) => {
          const updatedPermit = {
            ...state.currentPermit,
            entryRegistry: {
              ...state.currentPermit.entryRegistry,
              ...data,
              lastUpdated: new Date().toISOString()
            },
            last_modified: new Date().toISOString()
          };
          
          updatedPermit.auditTrail.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'update_entry_registry',
            section: 'entryRegistry',
            userId: 'current_user',
            changes: data
          });
          
          if (state.autoSaveEnabled) {
            setTimeout(() => get().saveToDatabase(), 2000);
          }
          
          return { currentPermit: updatedPermit };
        });
      },

      updateRescuePlan: (data) => {
        set((state) => {
          const updatedPermit = {
            ...state.currentPermit,
            rescuePlan: {
              ...state.currentPermit.rescuePlan,
              ...data,
              lastUpdated: new Date().toISOString()
            },
            last_modified: new Date().toISOString()
          };
          
          updatedPermit.auditTrail.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'update_rescue_plan',
            section: 'rescuePlan',
            userId: 'current_user',
            changes: data
          });
          
          if (state.autoSaveEnabled) {
            setTimeout(() => get().saveToDatabase(), 2000);
          }
          
          return { currentPermit: updatedPermit };
        });
      },

      // =================== BASE DE DONNÉES SUPABASE ===================
      saveToDatabase: async () => {
        set({ isSaving: true });
        
        try {
          const permit = get().currentPermit;
          const validation = get().validatePermitCompleteness();
          
          // Mise à jour de la validation
          permit.validation = {
            isComplete: validation.isValid,
            percentage: validation.percentage,
            errors: validation.errors,
            lastValidated: new Date().toISOString()
          };
          
          // Générer un numéro de permis si nécessaire
          if (!permit.permit_number) {
            permit.permit_number = generatePermitNumber(permit.province);
          }
          
          // Sauvegarder dans Supabase
          const { data, error } = await supabase
            .from('confined_space_permits')
            .upsert(permit, { onConflict: 'permit_number' })
            .select()
            .single();
          
          if (error) throw error;
          
          set({ 
            currentPermit: data,
            lastSaved: new Date().toISOString(),
            isSaving: false 
          });
          
          return data.permit_number;
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
          set({ isSaving: false });
          return null;
        }
      },

      loadFromDatabase: async (permitNumber: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from('confined_space_permits')
            .select('*')
            .eq('permit_number', permitNumber)
            .single();
          
          if (error) throw error;
          
          set({ 
            currentPermit: data,
            isLoading: false 
          });
          
          return data;
        } catch (error) {
          console.error('Erreur chargement:', error);
          set({ isLoading: false });
          return null;
        }
      },

      loadPermitHistory: async () => {
        try {
          const { data, error } = await supabase
            .from('confined_space_permits')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (error) throw error;
          
          set({ permits: data });
          return data;
        } catch (error) {
          console.error('Erreur historique:', error);
          return [];
        }
      },

      // =================== QR CODE ET PARTAGE ===================
      generateQRCode: async () => {
        const permit = get().currentPermit;
        const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
        
        // Utiliser une API QR Code (ex: qr-server.com)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(permitUrl)}`;
        
        return qrUrl;
      },

      generatePDF: async () => {
        const permit = get().currentPermit;
        
        // Ici vous pouvez utiliser jsPDF ou une API de génération PDF
        // Pour l'exemple, on crée un blob vide
        const pdfContent = generatePDFContent(permit);
        return new Blob([pdfContent], { type: 'application/pdf' });
      },

      sharePermit: async (method: 'email' | 'sms' | 'whatsapp') => {
        const permit = get().currentPermit;
        const qrCode = await get().generateQRCode();
        const permitUrl = `${window.location.origin}/permits/confined-space/${permit.permit_number}`;
        
        const message = `Permis d'espace clos ${permit.permit_number}\nLieu: ${permit.siteInformation.workLocation}\nAccès: ${permitUrl}`;
        
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
      },

      // =================== VALIDATION BASÉE SUR LA STRUCTURE RÉELLE ===================
      validatePermitCompleteness: () => {
        const permit = get().currentPermit;
        const errors: string[] = [];
        let completedSections = 0;
        const totalSections = 4;

        // Validation Site Information (basée sur SiteInformation.tsx)
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
          errors.push('Volume doit être calculé');
          siteComplete = false;
        }
        if (!siteInfo.entryPoints?.length) {
          errors.push('Au moins un point d\'entrée requis');
          siteComplete = false;
        }
        
        if (siteComplete) completedSections++;

        // Validation Atmospheric Testing
        if (permit.atmosphericTesting?.readings?.length > 0) {
          completedSections++;
        } else {
          errors.push('Tests atmosphériques manquants');
        }

        // Validation Entry Registry
        if (permit.entryRegistry?.personnel?.length > 0) {
          completedSections++;
        } else {
          errors.push('Personnel non défini');
        }

        // Validation Rescue Plan
        if (permit.rescuePlan?.emergencyContacts?.length > 0) {
          completedSections++;
        } else {
          errors.push('Plan de sauvetage incomplet');
        }

        const percentage = Math.round((completedSections / totalSections) * 100);
        
        return {
          isValid: errors.length === 0,
          percentage,
          errors,
          completedSections,
          totalSections
        };
      },

      validateSection: (section) => {
        // Validation spécifique par section
        const permit = get().currentPermit;
        // Implémentation détaillée selon la section
        return { isValid: true, percentage: 100, errors: [], completedSections: 1, totalSections: 1 };
      },

      // =================== UTILITAIRES ===================
      createNewPermit: (province: string) => {
        const newPermit = createEmptyPermit();
        newPermit.province = province;
        newPermit.created_at = new Date().toISOString();
        set({ currentPermit: newPermit });
      },

      resetPermit: () => {
        set({ currentPermit: createEmptyPermit() });
      },

      exportData: () => {
        const permit = get().currentPermit;
        return JSON.stringify(permit, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const permit = JSON.parse(jsonData);
          set({ currentPermit: permit });
        } catch (error) {
          console.error('Erreur import:', error);
        }
      }
    }),
    {
      name: 'safety-manager-storage',
      partialize: (state) => ({
        currentPermit: state.currentPermit,
        permits: state.permits,
        autoSaveEnabled: state.autoSaveEnabled
      })
    }
  )
);

// =================== FONCTIONS UTILITAIRES ===================
function createEmptyPermit(): ConfinedSpacePermit {
  const now = new Date().toISOString();
  
  return {
    permit_number: '',
    status: 'draft',
    province: 'QC',
    created_at: now,
    updated_at: now,
    last_modified: now,
    
    siteInformation: {
      // Informations principales
      projectNumber: '',
      workLocation: '',
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
      lastUpdated: now
    },
    
    entryRegistry: {
      personnel: [],
      entryLog: [],
      activeEntrants: [],
      maxOccupancy: 1,
      communicationProtocol: {
        type: 'radio',
        frequency: '',
        checkInterval: 15
      },
      lastUpdated: now
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
      lastUpdated: now
    },
    
    validation: {
      isComplete: false,
      percentage: 0,
      errors: [],
      lastValidated: now
    },
    
    auditTrail: [],
    attachments: []
  };
}

function generatePermitNumber(province: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  
  return `CS-${province}-${year}${month}${day}-${time}`;
}

function generateId(): string {
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
  });
  
  return alerts;
}

function generatePDFContent(permit: ConfinedSpacePermit): string {
  // Implémentation de génération PDF
  return `PDF Content for permit ${permit.permit_number}`;
}

export default useSafetyManager;
