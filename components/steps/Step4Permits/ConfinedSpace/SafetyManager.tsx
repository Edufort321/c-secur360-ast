// SafetyManager.tsx - Gestionnaire Centralisé avec Supabase
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

// =================== CONFIGURATION SUPABASE ===================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// =================== TYPES COMPLETS ===================
export interface ConfinedSpacePermit {
  // Métadonnées
  id?: string;
  permit_number: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  province: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  
  // Données des sections
  siteInformation: SiteInformationData;
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

export interface SiteInformationData {
  // Projet et localisation
  projectNumber: string;
  workLocation: string;
  contractor: string;
  supervisor: string;
  emergencyNumber: string;
  
  // Identification de l'espace
  spaceIdentification: {
    spaceType: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      volume: number;
    };
    accessPoints: AccessPoint[];
    ventilationSystem: VentilationData;
  };
  
  // Évaluation des dangers
  hazardAssessment: {
    atmosphericHazards: HazardItem[];
    physicalHazards: HazardItem[];
    biologicalHazards: HazardItem[];
    chemicalHazards: HazardItem[];
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  };
  
  // Documentation
  photos: PhotoData[];
  documents: DocumentData[];
  lastUpdated: string;
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
export interface AccessPoint {
  id: string;
  type: 'main_entry' | 'emergency_exit' | 'access_hatch';
  location: string;
  dimensions: { width: number; height: number };
  isLocked: boolean;
  keyLocation?: string;
}

export interface VentilationData {
  type: 'natural' | 'mechanical' | 'none';
  capacity?: number; // CFM
  direction: 'intake' | 'exhaust' | 'bidirectional';
  isOperational: boolean;
}

export interface HazardItem {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
  controlMeasures: string[];
  residualRisk: 'low' | 'medium' | 'high';
}

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

      // =================== ACTIONS DE MISE À JOUR ===================
      updateSiteInformation: (data) => {
        set((state) => {
          const updatedPermit = {
            ...state.currentPermit,
            siteInformation: {
              ...state.currentPermit.siteInformation,
              ...data,
              lastUpdated: new Date().toISOString()
            },
            last_modified: new Date().toISOString()
          };
          
          // Audit trail
          updatedPermit.auditTrail.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            action: 'update_site_information',
            section: 'siteInformation',
            userId: 'current_user', // À remplacer par l'utilisateur réel
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

      // =================== VALIDATION ===================
      validatePermitCompleteness: () => {
        const permit = get().currentPermit;
        const errors: string[] = [];
        let completedSections = 0;
        const totalSections = 4;

        // Validation Site Information
        if (permit.siteInformation.projectNumber && permit.siteInformation.workLocation) {
          completedSections++;
        } else {
          errors.push('Informations du site incomplètes');
        }

        // Validation Atmospheric Testing
        if (permit.atmosphericTesting.readings?.length > 0) {
          completedSections++;
        } else {
          errors.push('Tests atmosphériques manquants');
        }

        // Validation Entry Registry
        if (permit.entryRegistry.personnel?.length > 0) {
          completedSections++;
        } else {
          errors.push('Personnel non défini');
        }

        // Validation Rescue Plan
        if (permit.rescuePlan.emergencyContacts?.length > 0) {
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
      projectNumber: '',
      workLocation: '',
      contractor: '',
      supervisor: '',
      emergencyNumber: '',
      spaceIdentification: {
        spaceType: '',
        dimensions: { length: 0, width: 0, height: 0, volume: 0 },
        accessPoints: [],
        ventilationSystem: {
          type: 'none',
          direction: 'intake',
          isOperational: false
        }
      },
      hazardAssessment: {
        atmosphericHazards: [],
        physicalHazards: [],
        biologicalHazards: [],
        chemicalHazards: [],
        riskLevel: 'low'
      },
      photos: [],
      documents: [],
      lastUpdated: now
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

interface PhotoData {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  location?: string;
}

interface DocumentData {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
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

export default useSafetyManager;
