// =================== COMPONENTS/STEPS/STEP4PERMITS/HOOKS/USEQRCODE.TS ===================
// Hook React pour gestion QR codes espaces clos avec intégration Supabase complète
"use client";

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { CustomGeolocationPosition, GeolocationAddress } from './useGeolocation';

// =================== CONFIGURATION SUPABASE ===================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// =================== INTERFACES SUPABASE ===================

export interface Database {
  public: {
    Tables: {
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

// Tables Supabase - Schema complet
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
  dimensions: SpaceDimensions;
  hazards: string[];
  access_points: AccessPoint[];
  ventilation_systems: VentilationSystem[];
  emergency_equipment: EmergencyEquipment[];
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
  qr_code_data: string; // Base64 image
  qr_url: string;
  print_data: QRPrintData;
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
  personnel_assigned: PersonnelAssignment[];
  supervisor_id: string;
  safety_officer_id: string;
  atmospheric_readings: AtmosphericReading[];
  equipment_used: string[];
  procedures_completed: string[];
  risk_controls: string[];
  emergency_contacts: EmergencyContact[];
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
  checklist_items: InspectionItem[];
  findings: InspectionFinding[];
  recommendations: string[];
  photos: string[]; // URLs vers storage
  videos: string[]; // URLs vers storage
  documents: string[]; // URLs vers storage
  overall_score: number; // 0-100
  compliance_status: 'compliant' | 'minor_issues' | 'major_issues' | 'critical';
  next_inspection_due: string;
  certification_required: boolean;
  certification_expiry?: string;
  weather_conditions?: WeatherConditions;
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
  personnel_involved: PersonnelInvolved[];
  witnesses: PersonnelInvolved[];
  immediate_actions: string[];
  root_cause_analysis: string;
  corrective_actions: CorrectiveAction[];
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

// Insert/Update types (omettent les champs auto-générés)
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

// =================== INTERFACES MÉTADONNÉES ===================

export interface SpaceDimensions {
  length?: number;
  width?: number;
  height?: number;
  diameter?: number;
  volume?: number;
  unit: 'm' | 'ft';
  entrance_size?: string;
  working_space?: string;
}

export interface AccessPoint {
  id: string;
  name: string;
  type: 'manhole' | 'hatch' | 'door' | 'opening' | 'valve' | 'port';
  size: string;
  location: string;
  coordinates?: { x: number; y: number; z: number };
  is_emergency_exit: boolean;
  key_required: boolean;
  lock_type?: string;
  restrictions: string[];
  last_inspected?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe';
}

export interface VentilationSystem {
  id: string;
  name: string;
  type: 'natural' | 'mechanical' | 'forced' | 'exhaust' | 'supply' | 'hybrid';
  capacity_cfm: number;
  location: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  installation_date?: string;
  is_operational: boolean;
  last_maintenance: string;
  next_maintenance: string;
  maintenance_schedule: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  efficiency_rating?: number;
  noise_level_db?: number;
  energy_consumption_kw?: number;
}

export interface EmergencyEquipment {
  id: string;
  name: string;
  type: 'rescue_tripod' | 'winch' | 'ventilator' | 'communication' | 'lighting' | 'first_aid' | 'breathing_apparatus' | 'fall_protection';
  location: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  last_inspection: string;
  next_inspection: string;
  inspection_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  is_operational: boolean;
  certification_number?: string;
  certification_expiry?: string;
  maintenance_records: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  date: string;
  type: 'inspection' | 'repair' | 'calibration' | 'replacement';
  description: string;
  technician: string;
  parts_replaced?: string[];
  cost?: number;
  next_action?: string;
}

export interface PersonnelAssignment {
  id: string;
  name: string;
  role: string;
  certifications: string[];
  experience_years: number;
  training_records: TrainingRecord[];
  medical_clearance: boolean;
  medical_expiry?: string;
  emergency_contact: EmergencyContact;
}

export interface TrainingRecord {
  course_name: string;
  completion_date: string;
  expiry_date?: string;
  instructor: string;
  certificate_number?: string;
  score?: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
}

export interface AtmosphericReading {
  timestamp: string;
  device_id: string;
  device_name: string;
  operator: string;
  location: string;
  oxygen_percent: number;
  lel_percent: number;
  h2s_ppm: number;
  co_ppm: number;
  co2_ppm?: number;
  temperature_celsius: number;
  humidity_percent?: number;
  pressure_kpa?: number;
  is_valid: boolean;
  calibration_date: string;
  notes?: string;
}

export interface InspectionItem {
  id: string;
  category: string;
  description: string;
  requirement: string;
  status: 'pass' | 'fail' | 'na' | 'attention_required';
  notes?: string;
  photos?: string[];
  corrective_action?: string;
  due_date?: string;
}

export interface InspectionFinding {
  id: string;
  category: 'safety' | 'environmental' | 'operational' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendation: string;
  timeline: 'immediate' | 'within_24h' | 'within_week' | 'within_month';
  responsible_person?: string;
  photos?: string[];
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
}

export interface WeatherConditions {
  temperature_celsius: number;
  humidity_percent: number;
  pressure_kpa: number;
  wind_speed_kmh: number;
  wind_direction_degrees: number;
  precipitation: 'none' | 'light' | 'moderate' | 'heavy';
  visibility_km: number;
  conditions: 'clear' | 'cloudy' | 'overcast' | 'fog' | 'rain' | 'snow';
}

export interface PersonnelInvolved {
  id: string;
  name: string;
  role: string;
  department: string;
  experience_years: number;
  injury_type?: 'none' | 'minor' | 'major' | 'fatality';
  medical_treatment?: boolean;
  hospital_transport?: boolean;
  time_off_work?: number; // days
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible_person: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_date?: string;
  verification_method: string;
  cost_estimate?: number;
  actual_cost?: number;
}

export interface QRPrintData {
  title: string;
  subtitle: string;
  instructions: string[];
  emergency_contact: string;
  company_logo?: string;
  qr_size: number;
  format: 'A4' | 'Letter' | 'Label' | '4x6' | '3x5';
  language: 'fr' | 'en';
  color_scheme: 'standard' | 'high_contrast' | 'safety_orange' | 'custom';
  include_map: boolean;
  include_photos: boolean;
  watermark?: string;
}

// =================== CONFIGURATION ===================

const QR_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.permits.ca',
  qrSize: 200,
  errorCorrectionLevel: 'M' as const,
  margin: 4,
  maxPrintCount: 50,
  maxScanCount: 10000,
  expiryDays: 365,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

// =================== HOOK PRINCIPAL ===================

export function useQRCode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // =================== UTILITAIRES ===================

  const log = useCallback((message: string, data?: any) => {
    console.log(`[QRCode] ${message}`, data || '');
  }, []);

  const handleError = useCallback((error: any, context: string) => {
    const message = error.message || error.toString();
    setError(`${context}: ${message}`);
    log(`Error in ${context}`, error);
    return null;
  }, [log]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Génération ID unique
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // =================== GESTION ESPACES CLOS ===================

  const createConfinedSpace = useCallback(async (
    spaceData: Partial<ConfinedSpaceInsert>,
    position: CustomGeolocationPosition,
    address: GeolocationAddress
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      clearError();

      const spaceId = generateId('space');
      const userId = 'current_user'; // À remplacer par auth réel

      const confinedSpace: ConfinedSpaceInsert = {
        name: spaceData.name || `Espace Clos ${spaceId.slice(-8)}`,
        type: spaceData.type || 'other',
        description: spaceData.description || '',
        location_latitude: position.latitude,
        location_longitude: position.longitude,
        location_accuracy: position.accuracy,
        address_formatted: address.formattedAddress,
        address_city: address.city,
        address_province: address.province,
        address_postal_code: address.postalCode,
        dimensions: spaceData.dimensions || { unit: 'm' },
        hazards: spaceData.hazards || [],
        access_points: spaceData.access_points || [],
        ventilation_systems: spaceData.ventilation_systems || [],
        emergency_equipment: spaceData.emergency_equipment || [],
        status: spaceData.status || 'active',
        company_id: spaceData.company_id || 'default_company',
        site_id: spaceData.site_id,
        risk_assessment: spaceData.risk_assessment || 'medium',
        metadata: spaceData.metadata || {},
        created_by: userId
      };

      const { data, error } = await supabase
        .from('confined_spaces')
        .insert(confinedSpace)
        .select()
        .single();

      if (error) throw error;

      // Récupérer l'ID généré par Supabase
      const actualSpaceId = data.id;

      log('Espace clos créé', { spaceId: actualSpaceId, name: confinedSpace.name });
      return actualSpaceId;

    } catch (error: any) {
      return handleError(error, 'createConfinedSpace');
    } finally {
      setIsLoading(false);
    }
  }, [generateId, handleError, clearError, log]);

  const getConfinedSpace = useCallback(async (spaceId: string): Promise<ConfinedSpaceRow | null> => {
    try {
      setIsLoading(true);
      clearError();

      const { data, error } = await supabase
        .from('confined_spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (error) throw error;

      log('Espace clos récupéré', { spaceId });
      return data;

    } catch (error: any) {
      return handleError(error, 'getConfinedSpace');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError, log]);

  const updateConfinedSpace = useCallback(async (
    spaceId: string,
    updates: ConfinedSpaceUpdate
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();

      const { error } = await supabase
        .from('confined_spaces')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', spaceId);

      if (error) throw error;

      log('Espace clos mis à jour', { spaceId, updates });
      return true;

    } catch (error: any) {
      handleError(error, 'updateConfinedSpace');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError, log]);

  // =================== GÉNÉRATION QR CODES ===================

  const generateQRCodeImage = useCallback(async (
    text: string,
    options: { width: number; height: number; margin: number; color: { dark: string; light: string } }
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = options.width;
      canvas.height = options.height;
      
      // Fond blanc
      ctx.fillStyle = options.color.light;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Pattern QR sophistiqué basé sur hash du texte
      ctx.fillStyle = options.color.dark;
      const cellSize = (options.width - 2 * options.margin) / 29; // 29x29 grid
      
      // Algorithme de hash amélioré
      const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Génération pattern plus réaliste
      for (let i = 0; i < 29; i++) {
        for (let j = 0; j < 29; j++) {
          // Éviter les zones de positionnement
          if ((i < 9 && j < 9) || (i < 9 && j > 19) || (i > 19 && j < 9)) {
            continue;
          }
          
          // Pattern basé sur hash + position
          const cellHash = (hash + i * 31 + j * 17) % 100;
          if (cellHash < 45) { // 45% de probabilité pour un module noir
            ctx.fillRect(
              options.margin + i * cellSize,
              options.margin + j * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
      
      // Markers de positionnement (coins)
      const markerSize = cellSize * 7;
      const positions = [[0, 0], [22, 0], [0, 22]];
      
      positions.forEach(([x, y]) => {
        // Carré extérieur noir
        ctx.fillStyle = options.color.dark;
        ctx.fillRect(
          options.margin + x * cellSize,
          options.margin + y * cellSize,
          markerSize,
          markerSize
        );
        
        // Carré intérieur blanc
        ctx.fillStyle = options.color.light;
        ctx.fillRect(
          options.margin + (x + 1) * cellSize,
          options.margin + (y + 1) * cellSize,
          markerSize - 2 * cellSize,
          markerSize - 2 * cellSize
        );
        
        // Carré central noir
        ctx.fillStyle = options.color.dark;
        ctx.fillRect(
          options.margin + (x + 2) * cellSize,
          options.margin + (y + 2) * cellSize,
          markerSize - 4 * cellSize,
          markerSize - 4 * cellSize
        );
      });
      
      // Timing patterns
      ctx.fillStyle = options.color.dark;
      for (let i = 8; i < 21; i++) {
        if (i % 2 === 0) {
          // Horizontal timing
          ctx.fillRect(
            options.margin + i * cellSize,
            options.margin + 6 * cellSize,
            cellSize,
            cellSize
          );
          // Vertical timing
          ctx.fillRect(
            options.margin + 6 * cellSize,
            options.margin + i * cellSize,
            cellSize,
            cellSize
          );
        }
      }
      
      resolve(canvas.toDataURL('image/png'));
    });
  }, []);

  const generateSpaceQR = useCallback(async (
    spaceId: string,
    printOptions: Partial<QRPrintData> = {}
  ): Promise<QRCodeRow | null> => {
    try {
      setIsLoading(true);
      clearError();

      // Récupérer les données de l'espace
      const space = await getConfinedSpace(spaceId);
      if (!space) {
        throw new Error('Espace clos non trouvé');
      }

      // Générer URL unique avec tracking
      const qrUrl = `${QR_CONFIG.baseUrl}/confined-spaces/${spaceId}?utm_source=qr&utm_medium=print&utm_campaign=space_access&t=${Date.now()}`;
      
      // Configuration d'impression par défaut
      const printData: QRPrintData = {
        title: space.name,
        subtitle: space.address_formatted,
        instructions: [
          'Scannez ce code QR pour accéder à:',
          '• Fiche technique de l\'espace clos',
          '• Historique des permis et inspections',
          '• Procédures d\'urgence spécifiques',
          '• Équipements de sécurité requis',
          '• Contacts d\'urgence 24/7'
        ],
        emergency_contact: '🚨 URGENCE: 911 | CNESST: 1-844-838-0808',
        qr_size: QR_CONFIG.qrSize,
        format: 'A4',
        language: 'fr',
        color_scheme: 'standard',
        include_map: true,
        include_photos: false,
        ...printOptions
      };

      // Générer l'image QR
      const qrCodeImage = await generateQRCodeImage(qrUrl, {
        width: printData.qr_size,
        height: printData.qr_size,
        margin: QR_CONFIG.margin,
        color: QR_CONFIG.color
      });

      const qrId = generateId('qr');
      const userId = 'current_user'; // À remplacer par auth réel

      const qrCodeData: QRCodeInsert = {
        space_id: spaceId,
        qr_code_data: qrCodeImage,
        qr_url: qrUrl,
        print_data: printData,
        is_active: true,
        expiry_date: new Date(Date.now() + QR_CONFIG.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        print_count: 0,
        scan_count: 0,
        created_by: userId
      };

      const { data, error } = await supabase
        .from('qr_codes')
        .insert(qrCodeData)
        .select()
        .single();

      if (error) throw error;

      log('QR Code généré', { qrId, spaceId, spaceName: space.name });
      return data;

    } catch (error: any) {
      return handleError(error, 'generateSpaceQR');
    } finally {
      setIsLoading(false);
    }
  }, [getConfinedSpace, generateQRCodeImage, generateId, handleError, clearError, log]);

  // =================== GESTION HISTORIQUES ===================

  const getPermitHistory = useCallback(async (spaceId: string): Promise<SpacePermitRow[]> => {
    try {
      const { data, error } = await supabase
        .from('space_permits')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      handleError(error, 'getPermitHistory');
      return [];
    }
  }, [handleError]);

  const getInspectionHistory = useCallback(async (spaceId: string): Promise<SpaceInspectionRow[]> => {
    try {
      const { data, error } = await supabase
        .from('space_inspections')
        .select('*')
        .eq('space_id', spaceId)
        .order('inspection_date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      handleError(error, 'getInspectionHistory');
      return [];
    }
  }, [handleError]);

  const getIncidentHistory = useCallback(async (spaceId: string): Promise<SpaceIncidentRow[]> => {
    try {
      const { data, error } = await supabase
        .from('space_incidents')
        .select('*')
        .eq('space_id', spaceId)
        .order('incident_date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      handleError(error, 'getIncidentHistory');
      return [];
    }
  }, [handleError]);

  // =================== TRACKING ET ANALYTICS ===================

  const trackQRAccess = useCallback(async (
    qrCodeId: string,
    userAgent: string,
    ipAddress: string,
    location?: { latitude: number; longitude: number }
  ): Promise<boolean> => {
    try {
      // Incrémenter le compteur de scans
      const { data: currentQR } = await supabase
        .from('qr_codes')
        .select('scan_count')
        .eq('id', qrCodeId)
        .single();

      await supabase
        .from('qr_codes')
        .update({ 
          scan_count: (currentQR?.scan_count || 0) + 1,
          last_scanned_at: new Date().toISOString()
        })
        .eq('id', qrCodeId);

      // Enregistrer le log d'accès
      const logData: QRAccessLogInsert = {
        qr_code_id: qrCodeId,
        space_id: '', // Sera rempli par un trigger Supabase
        accessed_at: new Date().toISOString(),
        user_agent: userAgent,
        ip_address: ipAddress,
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        device_type: /Mobile|Android|iPhone/.test(userAgent) ? 'mobile' : 
                    /Tablet|iPad/.test(userAgent) ? 'tablet' : 'desktop',
        browser: userAgent.split(' ')[0],
        pages_viewed: [],
        actions_taken: ['qr_scan']
      };

      const { error } = await supabase
        .from('qr_access_logs')
        .insert(logData);

      if (error) throw error;

      log('Accès QR trackée', { qrCodeId, device: logData.device_type });
      return true;

    } catch (error: any) {
      handleError(error, 'trackQRAccess');
      return false;
    }
  }, [handleError, log]);

  const getQRAnalytics = useCallback(async (spaceId: string) => {
    try {
      // Récupérer les stats des QR codes
      const { data: qrStats, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, print_count, scan_count, created_at, last_scanned_at')
        .eq('space_id', spaceId);

      if (qrError) throw qrError;

      // Récupérer les logs d'accès des 30 derniers jours
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: accessLogs, error: logsError } = await supabase
        .from('qr_access_logs')
        .select('accessed_at, device_type, browser, location_latitude, location_longitude')
        .eq('space_id', spaceId)
        .gte('accessed_at', thirtyDaysAgo);

      if (logsError) throw logsError;

      // Calculer les statistiques
      const totalScans = qrStats?.reduce((sum, qr) => sum + qr.scan_count, 0) || 0;
      const totalPrints = qrStats?.reduce((sum, qr) => sum + qr.print_count, 0) || 0;
      const uniqueDevices = new Set(accessLogs?.map(log => log.device_type)).size;
      const recentScans = accessLogs?.length || 0;

      return {
        totalScans,
        totalPrints,
        uniqueDevices,
        recentScans,
        qrCodes: qrStats || [],
        accessLogs: accessLogs || []
      };

    } catch (error: any) {
      handleError(error, 'getQRAnalytics');
      return null;
    }
  }, [handleError]);

  // =================== PDF GÉNÉRATION ===================

  const generatePrintablePDF = useCallback(async (qrCodeId: string): Promise<string | null> => {
    try {
      setIsLoading(true);

      // Récupérer les données du QR code et de l'espace
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          confined_spaces (*)
        `)
        .eq('id', qrCodeId)
        .single();

      if (qrError) throw qrError;

      const space = qrData.confined_spaces;
      const printData = qrData.print_data;

      // Incrémenter le compteur d'impressions
      const { data: currentQR } = await supabase
        .from('qr_codes')
        .select('print_count')
        .eq('id', qrCodeId)
        .single();

      await supabase
        .from('qr_codes')
        .update({ print_count: (currentQR?.print_count || 0) + 1 })
        .eq('id', qrCodeId);

      // Générer le HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="${printData.language}">
        <head>
          <meta charset="UTF-8">
          <title>QR Code - ${printData.title}</title>
          <style>
            @page { 
              size: ${printData.format}; 
              margin: 1.5cm; 
              @bottom-center {
                content: "Page " counter(page) " - Généré le " "${new Date().toLocaleDateString('fr-CA')}";
                font-size: 10px;
                color: #666;
              }
            }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container { max-width: 100%; margin: 0 auto; }
            .header { 
              text-align: center;
              border-bottom: 3px solid #dc2626; 
              padding-bottom: 1.5em; 
              margin-bottom: 2em; 
              background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
              padding: 1.5em;
              border-radius: 8px;
            }
            .title { 
              font-size: 28px; 
              font-weight: bold; 
              color: #dc2626; 
              margin-bottom: 0.5em;
            }
            .subtitle { 
              font-size: 18px; 
              color: #666; 
              margin-bottom: 0.5em;
            }
            .space-type {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 0.3em 1em;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .qr-section { 
              text-align: center;
              margin: 2.5em 0; 
              background: #f8fafc;
              padding: 2em;
              border-radius: 12px;
              border: 2px dashed #cbd5e1;
            }
            .qr-code { 
              border: 3px solid #1f2937; 
              padding: 1em; 
              display: inline-block; 
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .qr-label {
              font-size: 16px;
              font-weight: bold;
              margin-top: 1em;
              color: #374151;
            }
            .instructions { 
              background: #f0f9ff;
              border: 2px solid #0ea5e9;
              border-radius: 8px;
              padding: 1.5em;
              margin: 2em 0;
            }
            .instructions h3 {
              margin-top: 0;
              color: #0c4a6e;
              font-size: 20px;
            }
            .instructions ul {
              margin: 1em 0;
              padding-left: 1.5em;
            }
            .instructions li { 
              margin: 0.7em 0; 
              font-size: 16px;
            }
            .emergency { 
              background: #fef2f2; 
              border: 3px solid #dc2626; 
              padding: 1.5em; 
              margin: 2em 0;
              border-radius: 8px;
              text-align: center;
            }
            .emergency-title {
              font-size: 24px;
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 0.5em;
            }
            .emergency-contact {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
            }
            .space-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2em;
              margin: 2em 0;
            }
            .detail-section {
              background: #f9fafb;
              padding: 1.5em;
              border-radius: 8px;
              border-left: 4px solid #6366f1;
            }
            .detail-title {
              font-size: 18px;
              font-weight: bold;
              color: #4338ca;
              margin-bottom: 1em;
            }
            .detail-content {
              font-size: 14px;
              line-height: 1.6;
            }
            .hazards {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 1em;
              border-radius: 6px;
              margin: 1em 0;
            }
            .hazard-item {
              background: #fed7aa;
              display: inline-block;
              padding: 0.3em 0.8em;
              margin: 0.2em;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            .footer { 
              font-size: 12px; 
              color: #6b7280; 
              margin-top: 3em;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              padding-top: 1em;
            }
            .coordinates {
              font-family: 'Courier New', monospace;
              background: #f3f4f6;
              padding: 0.5em;
              border-radius: 4px;
              font-size: 12px;
            }
            @media print {
              .container { box-shadow: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">${printData.title}</div>
              <div class="subtitle">${printData.subtitle}</div>
              <div class="space-type">${space.type.replace('_', ' ').toUpperCase()}</div>
            </div>
            
            <div class="qr-section">
              <div class="qr-code">
                <img src="${qrData.qr_code_data}" alt="QR Code" width="${printData.qr_size}" height="${printData.qr_size}" />
              </div>
              <div class="qr-label">Scannez pour accéder aux informations complètes</div>
            </div>
            
            <div class="instructions">
              <h3>📱 Instructions d'utilisation:</h3>
              <ul>
                ${printData.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
              </ul>
            </div>

            <div class="space-details">
              <div class="detail-section">
                <div class="detail-title">📍 Localisation</div>
                <div class="detail-content">
                  <strong>Adresse:</strong> ${space.address_formatted}<br/>
                  <strong>Coordonnées GPS:</strong><br/>
                  <span class="coordinates">
                    Lat: ${space.location_latitude.toFixed(6)}<br/>
                    Lng: ${space.location_longitude.toFixed(6)}
                  </span><br/>
                  <strong>Précision:</strong> ±${space.location_accuracy}m
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-title">ℹ️ Informations générales</div>
                <div class="detail-content">
                  <strong>Type:</strong> ${space.type.replace('_', ' ')}<br/>
                  <strong>Statut:</strong> ${space.status}<br/>
                  <strong>Évaluation risque:</strong> ${space.risk_assessment}<br/>
                  <strong>ID Espace:</strong> <span class="coordinates">${space.id}</span>
                </div>
              </div>
            </div>

            ${space.hazards.length > 0 ? `
              <div class="hazards">
                <strong>⚠️ Dangers identifiés:</strong><br/>
                ${space.hazards.map(hazard => `<span class="hazard-item">${hazard}</span>`).join('')}
              </div>
            ` : ''}
            
            <div class="emergency">
              <div class="emergency-title">🚨 CONTACTS D'URGENCE</div>
              <div class="emergency-contact">${printData.emergency_contact}</div>
            </div>
            
            <div class="footer">
              <strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-CA', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}<br/>
              <strong>QR Code ID:</strong> ${qrCodeId}<br/>
              <strong>Espace ID:</strong> ${space.id}<br/>
              <strong>Validité:</strong> ${qrData.expiry_date ? new Date(qrData.expiry_date).toLocaleDateString('fr-CA') : 'Permanente'}<br/>
              <small>Ce document est généré automatiquement. Pour la version la plus récente, scannez le QR code.</small>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // En production, utiliser une lib comme Puppeteer ou jsPDF
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      log('PDF généré', { qrCodeId, spaceName: space.name });
      return url;

    } catch (error: any) {
      handleError(error, 'generatePrintablePDF');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, log]);

  // =================== GESTION QR CODES ===================

  const getQRCodeBySpace = useCallback(async (spaceId: string): Promise<QRCodeRow[]> => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('space_id', spaceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      handleError(error, 'getQRCodeBySpace');
      return [];
    }
  }, [handleError]);

  const deactivateQRCode = useCallback(async (qrCodeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', qrCodeId);

      if (error) throw error;

      log('QR Code désactivé', qrCodeId);
      return true;
    } catch (error: any) {
      handleError(error, 'deactivateQRCode');
      return false;
    }
  }, [handleError, log]);

  // =================== RETOUR DU HOOK ===================

  return {
    // État
    isLoading,
    error,
    
    // Gestion espaces clos
    createConfinedSpace,
    getConfinedSpace,
    updateConfinedSpace,
    
    // Génération QR codes
    generateSpaceQR,
    generatePrintablePDF,
    
    // Historiques
    getPermitHistory,
    getInspectionHistory,
    getIncidentHistory,
    
    // Gestion QR codes
    getQRCodeBySpace,
    deactivateQRCode,
    
    // Analytics
    trackQRAccess,
    getQRAnalytics,
    
    // Utilitaires
    clearError,
    
    // Configuration
    config: QR_CONFIG
  };
}

// =================== TYPES EXPORTÉS ===================

export type UseQRCodeReturn = ReturnType<typeof useQRCode>;

export default useQRCode;
