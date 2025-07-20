// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USESUPABASE.TS ===================
// Hook React pour intégration Supabase complète avec gestion permissions et auth
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// =================== TYPES SUPABASE DATABASE ===================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRow;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      companies: {
        Row: CompanyRow;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
      };
      confined_spaces: {
        Row: ConfinedSpaceRow;
        Insert: ConfinedSpaceInsert;
        Update: ConfinedSpaceUpdate;
      };
      qr_codes: {
        Row: QRCodeRow;
        Insert: QRCodeInsert;
        Update: QRCodeUpdate;
      };
      space_permits: {
        Row: SpacePermitRow;
        Insert: SpacePermitInsert;
        Update: SpacePermitUpdate;
      };
      space_inspections: {
        Row: SpaceInspectionRow;
        Insert: SpaceInspectionInsert;
        Update: SpaceInspectionUpdate;
      };
      space_incidents: {
        Row: SpaceIncidentRow;
        Insert: SpaceIncidentInsert;
        Update: SpaceIncidentUpdate;
      };
      qr_access_logs: {
        Row: QRAccessLogRow;
        Insert: QRAccessLogInsert;
        Update: QRAccessLogUpdate;
      };
    };
  };
}

// Tables de base
export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  role: UserRole;
  permissions: string[];
  avatar_url?: string;
  phone?: string;
  department?: string;
  position?: string;
  certifications: Certification[];
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface CompanyRow {
  id: string;
  name: string;
  type: 'enterprise' | 'contractor' | 'government' | 'nonprofit';
  registration_number?: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfinedSpaceRow {
  id: string;
  name: string;
  type: 'tank' | 'vessel' | 'tunnel' | 'pit' | 'silo' | 'vault' | 'trench' | 'other';
  description: string;
  location_latitude: number;
  location_longitude: number;
  location_accuracy: number;
  address_formatted: string;
  address_city: string;
  address_province: string;
  address_postal_code?: string;
  dimensions: Record<string, any>;
  hazards: string[];
  access_points: Record<string, any>[];
  ventilation_systems: Record<string, any>[];
  emergency_equipment: Record<string, any>[];
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  company_id: string;
  site_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_inspection_date?: string;
  next_inspection_due?: string;
  compliance_score?: number;
  risk_assessment: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

export interface QRCodeRow {
  id: string;
  space_id: string;
  qr_code_data: string;
  qr_url: string;
  print_data: Record<string, any>;
  is_active: boolean;
  expiry_date?: string;
  print_count: number;
  scan_count: number;
  last_scanned_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SpacePermitRow {
  id: string;
  space_id: string;
  permit_number: string;
  permit_type: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'expired';
  work_description: string;
  personnel_assigned: Record<string, any>[];
  supervisor_id: string;
  safety_officer_id: string;
  atmospheric_readings: Record<string, any>[];
  equipment_used: string[];
  procedures_completed: string[];
  risk_controls: string[];
  emergency_contacts: Record<string, any>[];
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  completed_by?: string;
  completed_at?: string;
}

export interface SpaceInspectionRow {
  id: string;
  space_id: string;
  inspection_date: string;
  inspector_id: string;
  inspector_name: string;
  inspection_type: 'routine' | 'safety' | 'pre_entry' | 'post_work' | 'regulatory';
  checklist_items: Record<string, any>[];
  findings: Record<string, any>[];
  recommendations: string[];
  photos: string[];
  videos: string[];
  documents: string[];
  overall_score: number;
  compliance_status: 'compliant' | 'minor_issues' | 'major_issues' | 'critical';
  next_inspection_due: string;
  certification_required: boolean;
  certification_expiry?: string;
  weather_conditions?: Record<string, any>;
  temperature: number;
  humidity: number;
  atmospheric_pressure: number;
  wind_speed: number;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SpaceIncidentRow {
  id: string;
  space_id: string;
  incident_number: string;
  incident_date: string;
  incident_time: string;
  incident_type: 'near_miss' | 'injury' | 'exposure' | 'equipment_failure' | 'evacuation' | 'environmental' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'catastrophic';
  description: string;
  location_details: string;
  personnel_involved: Record<string, any>[];
  witnesses: Record<string, any>[];
  immediate_actions: string[];
  root_cause_analysis: string;
  corrective_actions: Record<string, any>[];
  preventive_measures: string[];
  investigation_status: 'pending' | 'ongoing' | 'completed' | 'closed';
  investigation_team: string[];
  photos: string[];
  documents: string[];
  regulatory_notification: boolean;
  regulatory_agencies: string[];
  insurance_claim: boolean;
  estimated_cost: number;
  actual_cost?: number;
  lessons_learned: string[];
  reported_by: string;
  investigated_by?: string;
  approved_by?: string;
  is_resolved: boolean;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
}

export interface QRAccessLogRow {
  id: string;
  qr_code_id: string;
  space_id: string;
  accessed_at: string;
  user_id?: string;
  user_agent: string;
  ip_address: string;
  location_latitude?: number;
  location_longitude?: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  referrer?: string;
  session_duration?: number;
  pages_viewed: string[];
  actions_taken: string[];
  created_at: string;
}

// Insert/Update types
export type UserProfileInsert = Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>;
export type UserProfileUpdate = Partial<Omit<UserProfileRow, 'id' | 'created_at'>>;
export type CompanyInsert = Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'>;
export type CompanyUpdate = Partial<Omit<CompanyRow, 'id' | 'created_at'>>;
export type ConfinedSpaceInsert = Omit<ConfinedSpaceRow, 'id' | 'created_at' | 'updated_at'>;
export type ConfinedSpaceUpdate = Partial<Omit<ConfinedSpaceRow, 'id' | 'created_at'>>;
export type QRCodeInsert = Omit<QRCodeRow, 'id' | 'created_at' | 'updated_at'>;
export type QRCodeUpdate = Partial<Omit<QRCodeRow, 'id' | 'created_at'>>;
export type SpacePermitInsert = Omit<SpacePermitRow, 'id' | 'created_at' | 'updated_at'>;
export type SpacePermitUpdate = Partial<Omit<SpacePermitRow, 'id' | 'created_at'>>;
export type SpaceInspectionInsert = Omit<SpaceInspectionRow, 'id' | 'created_at' | 'updated_at'>;
export type SpaceInspectionUpdate = Partial<Omit<SpaceInspectionRow, 'id' | 'created_at'>>;
export type SpaceIncidentInsert = Omit<SpaceIncidentRow, 'id' | 'created_at' | 'updated_at'>;
export type SpaceIncidentUpdate = Partial<Omit<SpaceIncidentRow, 'id' | 'created_at'>>;
export type QRAccessLogInsert = Omit<QRAccessLogRow, 'id' | 'created_at'>;
export type QRAccessLogUpdate = Partial<Omit<QRAccessLogRow, 'id' | 'created_at'>>;

// =================== CONFIGURATION SUPABASE ===================

// Variables d'environnement (à configurer dans .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'; // Backend seulement

// Client Supabase
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// =================== INTERFACES ===================

export interface SupabaseConfig {
  enableRealtime: boolean;
  enableAuth: boolean;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  cacheTimeout: number;
  enableLogging: boolean;
  enableOfflineMode: boolean;
}

export interface SupabaseState {
  isConnected: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  permissions: UserPermissions | null;
  profile: UserProfile | null;
  error: string | null;
  lastSync: Date | null;
  offlineQueue: OfflineOperation[];
  realtimeConnections: Map<string, RealtimeSubscription>;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string;
  company_name: string;
  role: UserRole;
  permissions: string[];
  avatar_url?: string;
  phone?: string;
  department?: string;
  position?: string;
  certifications: Certification[];
  is_active: boolean;
  last_login: Date;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any>;
}

export interface UserPermissions {
  permits: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    manage_all: boolean;
  };
  spaces: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    manage_qr: boolean;
  };
  personnel: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    manage_certifications: boolean;
  };
  inspections: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
  incidents: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    investigate: boolean;
  };
  reports: {
    view_basic: boolean;
    view_detailed: boolean;
    export: boolean;
    schedule: boolean;
  };
  admin: {
    manage_users: boolean;
    manage_company: boolean;
    manage_settings: boolean;
    view_audit_logs: boolean;
  };
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  number: string;
  issue_date: Date;
  expiry_date: Date;
  is_valid: boolean;
  verification_url?: string;
}

export interface OfflineOperation {
  id: string;
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retries: number;
  error?: string;
}

export interface RealtimeSubscription {
  id: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
  subscription: any; // Supabase subscription object
}

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
  status: 'success' | 'error' | 'loading';
}

export interface BatchOperation {
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  where?: Record<string, any>;
}

export type UserRole = 
  | 'super_admin' | 'company_admin' | 'safety_manager' | 'supervisor'
  | 'safety_officer' | 'inspector' | 'worker' | 'contractor' | 'observer';

// =================== CONFIGURATION PAR DÉFAUT ===================

const DEFAULT_CONFIG: SupabaseConfig = {
  enableRealtime: true,
  enableAuth: true,
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 100,
  cacheTimeout: 300000, // 5 minutes
  enableLogging: true,
  enableOfflineMode: true
};

// =================== PERMISSIONS PAR RÔLE ===================

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    permits: { create: true, read: true, update: true, delete: true, approve: true, manage_all: true },
    spaces: { create: true, read: true, update: true, delete: true, manage_qr: true },
    personnel: { create: true, read: true, update: true, delete: true, manage_certifications: true },
    inspections: { create: true, read: true, update: true, delete: true, approve: true },
    incidents: { create: true, read: true, update: true, delete: true, investigate: true },
    reports: { view_basic: true, view_detailed: true, export: true, schedule: true },
    admin: { manage_users: true, manage_company: true, manage_settings: true, view_audit_logs: true }
  },
  company_admin: {
    permits: { create: true, read: true, update: true, delete: true, approve: true, manage_all: true },
    spaces: { create: true, read: true, update: true, delete: true, manage_qr: true },
    personnel: { create: true, read: true, update: true, delete: true, manage_certifications: true },
    inspections: { create: true, read: true, update: true, delete: true, approve: true },
    incidents: { create: true, read: true, update: true, delete: true, investigate: true },
    reports: { view_basic: true, view_detailed: true, export: true, schedule: true },
    admin: { manage_users: true, manage_company: false, manage_settings: true, view_audit_logs: true }
  },
  safety_manager: {
    permits: { create: true, read: true, update: true, delete: false, approve: true, manage_all: true },
    spaces: { create: true, read: true, update: true, delete: false, manage_qr: true },
    personnel: { create: false, read: true, update: true, delete: false, manage_certifications: true },
    inspections: { create: true, read: true, update: true, delete: false, approve: true },
    incidents: { create: true, read: true, update: true, delete: false, investigate: true },
    reports: { view_basic: true, view_detailed: true, export: true, schedule: true },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: true }
  },
  supervisor: {
    permits: { create: true, read: true, update: true, delete: false, approve: true, manage_all: false },
    spaces: { create: false, read: true, update: true, delete: false, manage_qr: false },
    personnel: { create: false, read: true, update: false, delete: false, manage_certifications: false },
    inspections: { create: true, read: true, update: true, delete: false, approve: false },
    incidents: { create: true, read: true, update: true, delete: false, investigate: false },
    reports: { view_basic: true, view_detailed: true, export: false, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  },
  safety_officer: {
    permits: { create: true, read: true, update: true, delete: false, approve: true, manage_all: false },
    spaces: { create: true, read: true, update: true, delete: false, manage_qr: true },
    personnel: { create: false, read: true, update: false, delete: false, manage_certifications: true },
    inspections: { create: true, read: true, update: true, delete: false, approve: true },
    incidents: { create: true, read: true, update: true, delete: false, investigate: true },
    reports: { view_basic: true, view_detailed: true, export: true, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  },
  inspector: {
    permits: { create: false, read: true, update: false, delete: false, approve: false, manage_all: false },
    spaces: { create: false, read: true, update: false, delete: false, manage_qr: false },
    personnel: { create: false, read: true, update: false, delete: false, manage_certifications: false },
    inspections: { create: true, read: true, update: true, delete: false, approve: false },
    incidents: { create: true, read: true, update: false, delete: false, investigate: false },
    reports: { view_basic: true, view_detailed: false, export: false, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  },
  worker: {
    permits: { create: false, read: true, update: false, delete: false, approve: false, manage_all: false },
    spaces: { create: false, read: true, update: false, delete: false, manage_qr: false },
    personnel: { create: false, read: false, update: false, delete: false, manage_certifications: false },
    inspections: { create: false, read: true, update: false, delete: false, approve: false },
    incidents: { create: true, read: true, update: false, delete: false, investigate: false },
    reports: { view_basic: true, view_detailed: false, export: false, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  },
  contractor: {
    permits: { create: false, read: true, update: false, delete: false, approve: false, manage_all: false },
    spaces: { create: false, read: true, update: false, delete: false, manage_qr: false },
    personnel: { create: false, read: false, update: false, delete: false, manage_certifications: false },
    inspections: { create: false, read: true, update: false, delete: false, approve: false },
    incidents: { create: true, read: true, update: false, delete: false, investigate: false },
    reports: { view_basic: true, view_detailed: false, export: false, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  },
  observer: {
    permits: { create: false, read: true, update: false, delete: false, approve: false, manage_all: false },
    spaces: { create: false, read: true, update: false, delete: false, manage_qr: false },
    personnel: { create: false, read: false, update: false, delete: false, manage_certifications: false },
    inspections: { create: false, read: true, update: false, delete: false, approve: false },
    incidents: { create: false, read: true, update: false, delete: false, investigate: false },
    reports: { view_basic: true, view_detailed: false, export: false, schedule: false },
    admin: { manage_users: false, manage_company: false, manage_settings: false, view_audit_logs: false }
  }
};

// =================== HOOK PRINCIPAL ===================

export function useSupabase(config: Partial<SupabaseConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // État principal
  const [state, setState] = useState<SupabaseState>({
    isConnected: false,
    isLoading: false,
    user: null,
    session: null,
    permissions: null,
    profile: null,
    error: null,
    lastSync: null,
    offlineQueue: [],
    realtimeConnections: new Map()
  });

  // Cache et références
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const retryTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // =================== UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    if (finalConfig.enableLogging) {
      console.log(`[Supabase] ${message}`, data || '');
    }
  }, [finalConfig.enableLogging]);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
    log(`Error: ${error}`);
  }, [log]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const generateCacheKey = useCallback((table: string, query?: any): string => {
    return `${table}_${JSON.stringify(query || {})}`;
  }, []);

  const isCacheValid = useCallback((key: string): boolean => {
    const cached = cacheRef.current.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < finalConfig.cacheTimeout;
  }, [finalConfig.cacheTimeout]);

  const setCache = useCallback((key: string, data: any): void => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);

  const getCache = useCallback((key: string): any => {
    const cached = cacheRef.current.get(key);
    return cached?.data;
  }, []);

  // =================== AUTHENTIFICATION ===================

  const initializeAuth = useCallback(async () => {
    if (!finalConfig.enableAuth) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        setState(prev => ({
          ...prev,
          session,
          user: session.user,
          isConnected: true
        }));
        
        // Charger le profil utilisateur
        await loadUserProfile(session.user.id);
      }

      log('Auth initialisé', { hasSession: !!session });

    } catch (error: any) {
      setError(`Erreur initialisation auth: ${error.message}`);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [finalConfig.enableAuth, log, setError]);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      clearError();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        setState(prev => ({
          ...prev,
          session: data.session,
          user: data.user,
          isConnected: true
        }));

        await loadUserProfile(data.user.id);
        log('Connexion réussie', { email });
        return true;
      }

      return false;

    } catch (error: any) {
      setError(`Erreur connexion: ${error.message}`);
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [clearError, setError, log]);

  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Nettoyer les connexions realtime
      state.realtimeConnections.forEach(sub => {
        supabase.removeChannel(sub.subscription);
      });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        profile: null,
        permissions: null,
        isConnected: false,
        realtimeConnections: new Map()
      }));

      // Vider le cache
      cacheRef.current.clear();

      log('Déconnexion réussie');
      return true;

    } catch (error: any) {
      setError(`Erreur déconnexion: ${error.message}`);
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.realtimeConnections, setError, log]);

  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile: UserProfile = {
        ...data,
        company_name: data.companies?.name || 'Compagnie inconnue',
        last_login: new Date(data.last_login),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      const permissions = ROLE_PERMISSIONS[profile.role] || ROLE_PERMISSIONS.observer;

      setState(prev => ({
        ...prev,
        profile,
        permissions
      }));

      log('Profil chargé', { role: profile.role, permissions });

    } catch (error: any) {
      log('Erreur chargement profil', error);
      // Ne pas bloquer si le profil n'existe pas
    }
  }, [log]);

  // =================== OPÉRATIONS DATABASE ===================

  const executeQuery = useCallback(async <T>(
    operation: () => Promise<any>,
    cacheKey?: string,
    useCache = true
  ): Promise<QueryResult<T>> => {
    try {
      // Vérifier le cache si activé
      if (useCache && cacheKey && isCacheValid(cacheKey)) {
        const cachedData = getCache(cacheKey);
        log('Cache hit', cacheKey);
        return { data: cachedData, error: null, status: 'success' };
      }

      const result = await operation();

      if (result.error) {
        throw result.error;
      }

      // Mettre en cache si activé
      if (useCache && cacheKey) {
        setCache(cacheKey, result.data);
      }

      return {
        data: result.data,
        error: null,
        count: result.count,
        status: 'success'
      };

    } catch (error: any) {
      log('Erreur query', error);
      
      // Retry logic si activé
      if (finalConfig.autoRetry && cacheKey) {
        return retryOperation(operation, cacheKey, 1);
      }

      return {
        data: null,
        error: error.message,
        status: 'error'
      };
    }
  }, [finalConfig.autoRetry, isCacheValid, getCache, setCache, log]);

  const retryOperation = useCallback(async <T>(
    operation: () => Promise<any>,
    operationId: string,
    attempt: number
  ): Promise<QueryResult<T>> => {
    if (attempt > finalConfig.maxRetries) {
      return {
        data: null,
        error: `Échec après ${finalConfig.maxRetries} tentatives`,
        status: 'error'
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        try {
          const result = await operation();
          if (result.error) throw result.error;
          
          resolve({
            data: result.data,
            error: null,
            count: result.count,
            status: 'success'
          });
        } catch (error: any) {
          resolve(await retryOperation(operation, operationId, attempt + 1));
        } finally {
          retryTimeoutRef.current.delete(operationId);
        }
      }, finalConfig.retryDelay * attempt);

      retryTimeoutRef.current.set(operationId, timeout);
    });
  }, [finalConfig.maxRetries, finalConfig.retryDelay]);

  // =================== CRUD GÉNÉRIQUE ===================

  const create = useCallback(async <T>(
    table: string,
    data: any,
    options: { returning?: boolean } = { returning: true }
  ): Promise<QueryResult<T>> => {
    const operation = () => supabase
      .from(table)
      .insert(data)
      .select(options.returning ? '*' : undefined);

    return executeQuery<T>(operation, undefined, false);
  }, [executeQuery]);

  const read = useCallback(async <T>(
    table: string,
    query?: {
      select?: string;
      where?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    },
    useCache = true
  ): Promise<QueryResult<T[]>> => {
    const cacheKey = generateCacheKey(table, query);
    
    const operation = () => {
      let supabaseQuery = supabase.from(table).select(query?.select || '*');
      
      if (query?.where) {
        Object.entries(query.where).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }
      
      if (query?.order) {
        supabaseQuery = supabaseQuery.order(query.order.column, {
          ascending: query.order.ascending ?? true
        });
      }
      
      if (query?.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }
      
      if (query?.offset) {
        supabaseQuery = supabaseQuery.range(
          query.offset,
          query.offset + (query.limit || 1000) - 1
        );
      }
      
      return supabaseQuery;
    };

    return executeQuery<T[]>(operation, cacheKey, useCache);
  }, [executeQuery, generateCacheKey]);

  const update = useCallback(async <T>(
    table: string,
    data: any,
    where: Record<string, any>,
    options: { returning?: boolean } = { returning: true }
  ): Promise<QueryResult<T>> => {
    const operation = () => {
      let query = supabase.from(table).update(data);
      
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (options.returning) {
        query = query.select('*');
      }
      
      return query;
    };

    // Invalider le cache pour cette table
    const cacheKeys = Array.from(cacheRef.current.keys()).filter(key => 
      key.startsWith(table)
    );
    cacheKeys.forEach(key => cacheRef.current.delete(key));

    return executeQuery<T>(operation, undefined, false);
  }, [executeQuery]);

  const remove = useCallback(async <T>(
    table: string,
    where: Record<string, any>,
    options: { returning?: boolean } = { returning: false }
  ): Promise<QueryResult<T>> => {
    const operation = () => {
      let query = supabase.from(table).delete();
      
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (options.returning) {
        query = query.select('*');
      }
      
      return query;
    };

    // Invalider le cache pour cette table
    const cacheKeys = Array.from(cacheRef.current.keys()).filter(key => 
      key.startsWith(table)
    );
    cacheKeys.forEach(key => cacheRef.current.delete(key));

    return executeQuery<T>(operation, undefined, false);
  }, [executeQuery]);

  // =================== OPÉRATIONS BATCH ===================

  const executeBatch = useCallback(async (
    operations: BatchOperation[]
  ): Promise<QueryResult<any[]>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const results = [];
      
      // Traiter par chunks selon batchSize
      for (let i = 0; i < operations.length; i += finalConfig.batchSize) {
        const chunk = operations.slice(i, i + finalConfig.batchSize);
        
        const chunkPromises = chunk.map(async (op) => {
          switch (op.operation) {
            case 'insert':
              return create(op.table, op.data, { returning: false });
            case 'update':
              return update(op.table, op.data, op.where!, { returning: false });
            case 'delete':
              return remove(op.table, op.where!, { returning: false });
            default:
              throw new Error(`Operation non supportée: ${op.operation}`);
          }
        });
        
        const chunkResults = await Promise.allSettled(chunkPromises);
        results.push(...chunkResults);
      }
      
      log('Batch exécuté', { operations: operations.length, results: results.length });
      
      return {
        data: results,
        error: null,
        status: 'success'
      };

    } catch (error: any) {
      return {
        data: null,
        error: error.message,
        status: 'error'
      };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [finalConfig.batchSize, create, update, remove, log]);

  // =================== REALTIME ===================

  const subscribeToTable = useCallback((
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void,
    filter?: Record<string, any>
  ): string => {
    if (!finalConfig.enableRealtime) {
      log('Realtime désactivé');
      return '';
    }

    const subscriptionId = `${table}_${event}_${Date.now()}`;
    
    let subscription = supabase
      .channel(`table_${table}_${subscriptionId}`)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table,
        filter: filter ? Object.entries(filter).map(([key, value]) => `${key}=eq.${value}`).join(',') : undefined
      }, (payload) => {
        log('Realtime event', { table, event, payload });
        callback(payload);
      })
      .subscribe();

    const realtimeSubscription: RealtimeSubscription = {
      id: subscriptionId,
      table,
      event,
      callback,
      subscription
    };

    setState(prev => ({
      ...prev,
      realtimeConnections: new Map(prev.realtimeConnections.set(subscriptionId, realtimeSubscription))
    }));

    log('Realtime subscription créée', { table, event, id: subscriptionId });
    return subscriptionId;
  }, [finalConfig.enableRealtime, log]);

  const unsubscribeFromTable = useCallback((subscriptionId: string): boolean => {
    const subscription = state.realtimeConnections.get(subscriptionId);
    if (!subscription) return false;

    supabase.removeChannel(subscription.subscription);
    
    setState(prev => {
      const newConnections = new Map(prev.realtimeConnections);
      newConnections.delete(subscriptionId);
      return { ...prev, realtimeConnections: newConnections };
    });

    log('Realtime subscription supprimée', subscriptionId);
    return true;
  }, [state.realtimeConnections, log]);

  // =================== PERMISSIONS ===================

  const hasPermission = useCallback((
    resource: keyof UserPermissions,
    action: string
  ): boolean => {
    if (!state.permissions) return false;
    
    const resourcePermissions = state.permissions[resource] as any;
    if (!resourcePermissions) return false;
    
    return resourcePermissions[action] === true;
  }, [state.permissions]);

  const checkRole = useCallback((requiredRole: UserRole): boolean => {
    if (!state.profile) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      observer: 1,
      contractor: 2,
      worker: 3,
      inspector: 4,
      safety_officer: 5,
      supervisor: 6,
      safety_manager: 7,
      company_admin: 8,
      super_admin: 9
    };
    
    const userLevel = roleHierarchy[state.profile.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }, [state.profile]);

  // =================== UTILITAIRES ===================

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const keysToDelete = Array.from(cacheRef.current.keys()).filter(key =>
        key.includes(pattern)
      );
      keysToDelete.forEach(key => cacheRef.current.delete(key));
      log('Cache partiel effacé', { pattern, count: keysToDelete.length });
    } else {
      cacheRef.current.clear();
      log('Cache complet effacé');
    }
  }, [log]);

  const getConnectionInfo = useCallback(() => {
    return {
      isConnected: state.isConnected,
      user: state.user?.email,
      role: state.profile?.role,
      company: state.profile?.company_name,
      permissions: state.permissions,
      realtimeConnections: state.realtimeConnections.size,
      cacheSize: cacheRef.current.size,
      lastSync: state.lastSync
    };
  }, [state]);

  // =================== EFFETS ===================

  // Initialisation
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Écoute des changements d'auth
  useEffect(() => {
    if (!finalConfig.enableAuth) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('Auth state change', { event, hasSession: !!session });
        
        if (event === 'SIGNED_IN' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
            isConnected: true
          }));
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            session: null,
            user: null,
            profile: null,
            permissions: null,
            isConnected: false,
            realtimeConnections: new Map()
          }));
          cacheRef.current.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [finalConfig.enableAuth, loadUserProfile, log]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      // Nettoyer les timeouts
      retryTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      retryTimeoutRef.current.clear();
      
      // Nettoyer les subscriptions realtime
      state.realtimeConnections.forEach(sub => {
        supabase.removeChannel(sub.subscription);
      });
    };
  }, [state.realtimeConnections]);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    ...state,
    
    // Auth
    signIn,
    signOut,
    initializeAuth,
    
    // CRUD
    create,
    read,
    update,
    remove,
    executeBatch,
    
    // Realtime
    subscribeToTable,
    unsubscribeFromTable,
    
    // Permissions
    hasPermission,
    checkRole,
    
    // Utilitaires
    clearError,
    clearCache,
    getConnectionInfo,
    
    // Client Supabase direct (pour cas avancés)
    supabase,
    
    // Configuration
    config: finalConfig
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseSupabaseReturn = ReturnType<typeof useSupabase>;

// Export du client pour utilisation directe si nécessaire
export { supabase };

export default useSupabase;
