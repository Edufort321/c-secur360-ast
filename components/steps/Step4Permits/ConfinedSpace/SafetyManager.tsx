// =================== SAFETY MANAGER AMÉLIORÉ ===================
// SafetyManager.tsx - Version améliorée avec Zustand et persistance

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useRef } from 'react';

// =================== TYPES EXISTANTS (conservés) ===================
export interface SafetyTimer {
  id: string;
  type: 'retest' | 'continuous' | 'evacuation';
  level?: 'top' | 'middle' | 'bottom';
  timeRemaining: number;
  isActive: boolean;
  lastReading?: AtmosphericReading;
  alertTriggered: boolean;
}

export interface SafetyAlert {
  id: string;
  type: 'warning' | 'danger' | 'evacuation' | 'retest';
  level: 'top' | 'middle' | 'bottom';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  personnelCount: number;
  autoEvacuation?: boolean;
}

export interface AtmosphericReading {
  id: string;
  timestamp: string;
  level: 'top' | 'middle' | 'bottom';
  oxygen: number;
  lel: number;
  h2s: number;
  co: number;
  temperature?: number;
  humidity?: number;
  status: 'safe' | 'warning' | 'danger';
  device_id?: string;
  taken_by: string;
  notes?: string;
  retest_required?: boolean;
  next_test_due?: string;
  timer_active?: boolean;
}

export interface PersonnelStatus {
  totalPersonnel: number;
  personnelInside: number;
  personnelByLevel: {
    top: number;
    middle: number;
    bottom: number;
  };
  surveillantActive: boolean;
}

// =================== NOUVEAUX TYPES POUR PERSISTANCE ===================
type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL';
type Language = 'fr' | 'en';

interface ConfinedSpacePermit {
  // Métadonnées
  id: string;
  permit_number: string;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  created_at: string;
  last_modified: string;
  province: ProvinceCode;
  language: Language;
  
  // Sections principales
  siteInformation: Record<string, any>;
  rescuePlan: Record<string, any>;
  atmosphericTesting: {
    readings: AtmosphericReading[];
    testLevels: any[];
    monitoringFrequency: number;
    [key: string]: any;
  };
  entryRegistry: {
    personnel: any[];
    equipment: any[];
    compliance_check: any;
    [key: string]: any;
  };
}

// =================== STORE ZUSTAND CENTRALISÉ ===================
interface SafetyManagerState {
  // Données du permis
  currentPermit: ConfinedSpacePermit;
  permitHistory: ConfinedSpacePermit[];
  
  // États de sécurité (conservés de l'ancien code)
  activeTimers: Map<string, SafetyTimer>;
  activeAlerts: SafetyAlert[];
  personnelStatus: PersonnelStatus;
  
  // États globaux
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;
  isOffline: boolean;
  lastSaved: string | null;
  validationErrors: string[];
  
  // Actions principales
  initializePermit: (province: ProvinceCode, language: Language) => void;
  updateSection: (section: keyof ConfinedSpacePermit, data: any) => void;
  saveToDatabase: () => Promise<string | null>;
  loadFromDatabase: (permitId: string) => Promise<boolean>;
  
  // Actions de sécurité (conservées)
  processAtmosphericReading: (reading: AtmosphericReading, callbacks: any) => any;
  triggerEmergencyEvacuation: (reason: string, details: string[]) => void;
  updatePersonnelStatus: (status: PersonnelStatus) => void;
  addAlert: (alert: SafetyAlert) => void;
  clearAlert: (alertId: string) => void;
  
  // Nouveaux actions pour gestion complète
  generateQRCode: () => Promise<string>;
  generatePDF: () => Promise<Blob>;
  sharePermit: (method: 'email' | 'sms' | 'whatsapp') => Promise<void>;
  exportData: (format: 'json' | 'excel') => Promise<Blob>;
  
  // Validation cross-sections
  validatePermitCompleteness: () => { isValid: boolean; errors: string[]; percentage: number };
  canProceedToStep: (step: number) => boolean;
  
  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
}

export const useSafetyManagerStore = create<SafetyManagerState>()(
  persist(
    (set, get) => ({
      // États initiaux
      currentPermit: getDefaultPermit(),
      permitHistory: [],
      activeTimers: new Map(),
      activeAlerts: [],
      personnelStatus: {
        totalPersonnel: 0,
        personnelInside: 0,
        personnelByLevel: { top: 0, middle: 0, bottom: 0 },
        surveillantActive: false
      },
      currentStep: 1,
      isLoading: false,
      isSaving: false,
      isOffline: !navigator.onLine,
      lastSaved: null,
      validationErrors: [],

      // =================== INITIALISATION ===================
      initializePermit: (province: ProvinceCode, language: Language) => {
        const newPermit = getDefaultPermit();
        newPermit.id = generatePermitId();
        newPermit.permit_number = generatePermitNumber(province);
        newPermit.province = province;
        newPermit.language = language;
        newPermit.created_at = new Date().toISOString();
        newPermit.last_modified = new Date().toISOString();
        
        set({ 
          currentPermit: newPermit,
          currentStep: 1,
          validationErrors: [],
          lastSaved: null,
          activeAlerts: [],
          activeTimers: new Map()
        });
        
        get().enableAutoSave();
      },

      // =================== GESTION DES SECTIONS ===================
      updateSection: (section: keyof ConfinedSpacePermit, data: any) => {
        const currentPermit = get().currentPermit;
        const updatedPermit = {
          ...currentPermit,
          [section]: { ...currentPermit[section], ...data },
          last_modified: new Date().toISOString()
        };
        
        set({ currentPermit: updatedPermit });
        
        // Auto-save debounced
        debounceAutoSave();
      },

      // =================== SAUVEGARDE DATABASE ===================
      saveToDatabase: async () => {
        const state = get();
        set({ isSaving: true });
        
        try {
          // Import dynamique de Supabase
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { data, error } = await supabase
            .from('confined_space_permits')
            .upsert({
              id: state.currentPermit.id,
              permit_number: state.currentPermit.permit_number,
              ...state.currentPermit,
              last_modified: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          set({ 
            lastSaved: new Date().toISOString(),
            currentPermit: { ...state.currentPermit, ...data }
          });
          
          showNotification('✅ Permis sauvegardé avec succès', 'success');
          return state.currentPermit.permit_number;
          
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
          showNotification('❌ Erreur lors de la sauvegarde', 'error');
          return null;
        } finally {
          set({ isSaving: false });
        }
      },

      // =================== CHARGEMENT DATABASE ===================
      loadFromDatabase: async (permitId: string) => {
        set({ isLoading: true });
        
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { data, error } = await supabase
            .from('confined_space_permits')
            .select('*')
            .eq('id', permitId)
            .single();

          if (error) throw error;

          if (data) {
            set({ 
              currentPermit: data as ConfinedSpacePermit,
              lastSaved: data.last_modified
            });
            return true;
          }
          
          return false;
          
        } catch (error) {
          console.error('Erreur chargement:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // =================== FONCTIONS DE SÉCURITÉ (conservées + améliorées) ===================
      processAtmosphericReading: (reading: AtmosphericReading, callbacks: any) => {
        const state = get();
        
        // Mettre à jour les données atmosphériques dans le permis
        const updatedPermit = {
          ...state.currentPermit,
          atmosphericTesting: {
            ...state.currentPermit.atmosphericTesting,
            readings: [...state.currentPermit.atmosphericTesting.readings, reading]
          }
        };
        
        set({ currentPermit: updatedPermit });
        
        // Logique de sécurité existante
        let evacuationTriggered = false;
        
        if (reading.status === 'danger' && state.personnelStatus.personnelInside > 0) {
          get().triggerEmergencyEvacuation(
            `Test atmosphérique critique niveau ${reading.level}`,
            [`O2: ${reading.oxygen}%`, `LEL: ${reading.lel}%`, `H2S: ${reading.h2s}ppm`, `CO: ${reading.co}ppm`]
          );
          evacuationTriggered = true;
        }
        
        return { evacuationTriggered };
      },

      triggerEmergencyEvacuation: (reason: string, details: string[]) => {
        const state = get();
        
        // Vider le personnel à l'intérieur
        const updatedStatus = {
          ...state.personnelStatus,
          personnelInside: 0,
          personnelByLevel: { top: 0, middle: 0, bottom: 0 }
        };
        
        // Créer alerte d'évacuation
        const evacuationAlert: SafetyAlert = {
          id: `evac_${Date.now()}`,
          type: 'evacuation',
          level: 'top', // Niveau critique
          message: `🚨 ÉVACUATION D'URGENCE: ${reason}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          personnelCount: state.personnelStatus.personnelInside,
          autoEvacuation: true
        };
        
        set({ 
          personnelStatus: updatedStatus,
          activeAlerts: [...state.activeAlerts, evacuationAlert]
        });
        
        // Jouer alarme d'évacuation
        playEvacuationAlarm();
        
        // Notification browser
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 ÉVACUATION D\'URGENCE', {
            body: `${reason} - ${state.personnelStatus.personnelInside} personne(s) évacuée(s)`,
            icon: '/c-secur360-logo.png',
            requireInteraction: true
          });
        }
        
        // Enregistrer l'événement dans le permis
        const updatedPermit = {
          ...state.currentPermit,
          entryRegistry: {
            ...state.currentPermit.entryRegistry,
            evacuationEvents: [
              ...(state.currentPermit.entryRegistry.evacuationEvents || []),
              {
                timestamp: new Date().toISOString(),
                reason,
                details,
                evacuatedPersonnel: state.personnelStatus.personnelInside
              }
            ]
          }
        };
        
        set({ currentPermit: updatedPermit });
      },

      updatePersonnelStatus: (status: PersonnelStatus) => {
        set({ personnelStatus: status });
      },

      addAlert: (alert: SafetyAlert) => {
        const state = get();
        set({ activeAlerts: [...state.activeAlerts, alert] });
      },

      clearAlert: (alertId: string) => {
        const state = get();
        set({ activeAlerts: state.activeAlerts.filter(a => a.id !== alertId) });
      },

      // =================== NOUVELLES FONCTIONS AVANCÉES ===================
      generateQRCode: async () => {
        const state = get();
        
        try {
          const QRCode = (await import('qrcode')).default;
          
          const qrData = {
            permitNumber: state.currentPermit.permit_number,
            type: 'confined_space',
            province: state.currentPermit.province,
            url: `${window.location.origin}/permits/confined-space/${state.currentPermit.permit_number}`,
            projectNumber: state.currentPermit.siteInformation.projectNumber,
            location: state.currentPermit.siteInformation.workLocation,
            contractor: state.currentPermit.siteInformation.contractor
          };
          
          return await QRCode.toDataURL(JSON.stringify(qrData), {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 512
          });
          
        } catch (error) {
          console.error('Erreur génération QR Code:', error);
          return '';
        }
      },

      generatePDF: async () => {
        const state = get();
        
        // Génération PDF complète (utiliserait jsPDF en réalité)
        const pdfContent = JSON.stringify(state.currentPermit, null, 2);
        return new Blob([pdfContent], { type: 'application/pdf' });
      },

      sharePermit: async (method: 'email' | 'sms' | 'whatsapp') => {
        const state = get();
        const permitUrl = `${window.location.origin}/permits/confined-space/${state.currentPermit.permit_number}`;
        
        const shareText = `Permis d'Espace Clos: ${state.currentPermit.permit_number}
Projet: ${state.currentPermit.siteInformation.projectNumber}
Lieu: ${state.currentPermit.siteInformation.workLocation}
Lien: ${permitUrl}`;
        
        switch (method) {
          case 'email':
            window.open(`mailto:?subject=Permis d'Espace Clos&body=${encodeURIComponent(shareText)}`);
            break;
          case 'sms':
            window.open(`sms:?body=${encodeURIComponent(shareText)}`);
            break;
          case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
            break;
        }
      },

      exportData: async (format: 'json' | 'excel') => {
        const state = get();
        
        if (format === 'json') {
          const jsonData = JSON.stringify(state.currentPermit, null, 2);
          return new Blob([jsonData], { type: 'application/json' });
        } else {
          // Exportation Excel (utiliserait SheetJS en réalité)
          const csvData = "Permis d'Espace Clos\n" + JSON.stringify(state.currentPermit);
          return new Blob([csvData], { type: 'text/csv' });
        }
      },

      // =================== VALIDATION ===================
      validatePermitCompleteness: () => {
        const state = get();
        const permit = state.currentPermit;
        const errors: string[] = [];
        let completedSections = 0;
        
        // Validation des 4 sections principales
        if (permit.siteInformation.projectNumber && permit.siteInformation.workLocation) {
          completedSections++;
        } else {
          errors.push('Informations du site incomplètes');
        }
        
        if (permit.rescuePlan.emergencyContacts?.length > 0) {
          completedSections++;
        } else {
          errors.push('Plan de sauvetage incomplet');
        }
        
        if (permit.atmosphericTesting.readings?.length > 0) {
          completedSections++;
        } else {
          errors.push('Tests atmosphériques manquants');
        }
        
        if (permit.entryRegistry.personnel?.length > 0) {
          completedSections++;
        } else {
          errors.push('Registre d\'entrée vide');
        }
        
        const percentage = Math.round((completedSections / 4) * 100);
        return { isValid: errors.length === 0, errors, percentage };
      },

      canProceedToStep: (step: number) => {
        const validation = get().validatePermitCompleteness();
        return step <= Math.ceil(validation.percentage / 25);
      },

      // =================== AUTO-SAVE ===================
      enableAutoSave: () => {
        autoSaveInterval = setInterval(() => {
          if (!get().isOffline && !get().isSaving) {
            get().saveToDatabase();
          }
        }, 30000);
      },

      disableAutoSave: () => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
          autoSaveInterval = null;
        }
      }
    }),
    {
      name: 'safety-manager-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentPermit: state.currentPermit,
        permitHistory: state.permitHistory,
        currentStep: state.currentStep
      })
    }
  )
);

// =================== HOOK ORIGINAL CONSERVÉ ===================
export const useSafetyManager = () => {
  const store = useSafetyManagerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sons d'alerte (conservés)
  const ALERT_SOUNDS = {
    warning: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR',
    danger: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR',
    evacuation: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBC6Mzd68dSgPOZjW89qDOQgVaLTj7qR'
  };

  // Fonctions originales conservées
  const playAlert = (type: keyof typeof ALERT_SOUNDS, repeat = false) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current = new Audio(ALERT_SOUNDS[type]);
      audioRef.current.loop = repeat;
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(() => {
        console.log('Audio autoplay bloqué par le navigateur');
      });
    } catch (error) {
      console.error('Erreur audio:', error);
    }
  };

  const sendNotification = (title: string, body: string, type: keyof typeof ALERT_SOUNDS) => {
    playAlert(type, type === 'evacuation');
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/c-secur360-logo.png',
          tag: `safety-alert-${type}`,
          requireInteraction: type === 'evacuation'
        });
        
        if (type === 'evacuation') {
          setTimeout(() => notification.close(), 30000);
        }
      }
    }
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        clearInterval(timer);
      });
      timersRef.current.clear();
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    // Store Zustand
    ...store,
    
    // Fonctions originales
    playAlert,
    sendNotification,
    
    // Nouvelles fonctions intégrées
    processAtmosphericReading: store.processAtmosphericReading,
    triggerEmergencyEvacuation: store.triggerEmergencyEvacuation
  };
};

// =================== FONCTIONS UTILITAIRES ===================
let autoSaveInterval: NodeJS.Timeout | null = null;
let autoSaveTimer: NodeJS.Timeout;

const debounceAutoSave = () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    useSafetyManagerStore.getState().saveToDatabase();
  }, 2000);
};

const generatePermitId = (): string => {
  return `permit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generatePermitNumber = (province: ProvinceCode): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `CS-${province}-${year}${month}${day}-${random}`;
};

const getDefaultPermit = (): ConfinedSpacePermit => ({
  id: '',
  permit_number: '',
  status: 'draft',
  created_at: '',
  last_modified: '',
  province: 'QC',
  language: 'fr',
  siteInformation: {},
  rescuePlan: {},
  atmosphericTesting: {
    readings: [],
    testLevels: [],
    monitoringFrequency: 30
  },
  entryRegistry: {
    personnel: [],
    equipment: [],
    compliance_check: {}
  }
});

const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('C-SECUR360', {
      body: message,
      icon: '/c-secur360-logo.png'
    });
  }
};

const playEvacuationAlarm = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Répéter 3 fois
    setTimeout(() => playEvacuationAlarm(), 600);
    setTimeout(() => playEvacuationAlarm(), 1200);
  } catch (error) {
    console.warn('Cannot play alarm sound:', error);
  }
};

// =================== CSS STYLES (conservés) ===================
export const emergencyStyles = `
  @keyframes evacuation-flash {
    0% { background-color: rgba(220, 38, 38, 0.1); }
    50% { background-color: rgba(220, 38, 38, 0.3); }
    100% { background-color: rgba(220, 38, 38, 0.1); }
  }
  
  .evacuation-alert {
    animation: evacuation-flash 0.5s infinite;
    border: 3px solid #ef4444 !important;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
  }
  
  .timer-warning {
    animation: pulse 1s infinite;
    color: #f59e0b !important;
  }
  
  .timer-danger {
    animation: pulse 0.5s infinite;
    color: #ef4444 !important;
  }
`;

export default useSafetyManager;
