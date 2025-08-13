import { createClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/env'

const FALLBACK_URL = 'http://localhost:54321'
const supabaseUrlEnv = NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in your .env.local file.')
  throw new Error('Supabase anon key is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

let supabaseUrl: string
try {
  supabaseUrl = new URL(supabaseUrlEnv ?? FALLBACK_URL).toString()
  if (!supabaseUrlEnv) {
    console.warn(`NEXT_PUBLIC_SUPABASE_URL is not set. Configure it in .env.local. Falling back to ${FALLBACK_URL}`)
  }
} catch {
  const message = `Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrlEnv}`
  console.error(message)
  throw new Error(message)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =================== TYPES ET INTERFACES ===================
export interface Database {
  public: {
    Tables: {
      confined_space_permits: {
        Row: {
          id: string
          permit_number: string
          project_number: string | null
          work_location: string | null
          contractor: string | null
          supervisor: string | null
          space_type: string | null
          csa_class: string | null
          entry_date: string | null
          duration: string | null
          worker_count: number | null
          work_description: string | null
          dimensions: any | null
          entry_points: any | null
          atmospheric_hazards: string[] | null
          physical_hazards: string[] | null
          environmental_conditions: any | null
          space_content: any | null
          safety_measures: any | null
          space_photos: any[] | null
          status: 'active' | 'completed' | 'expired' | 'cancelled'
          province: string | null
          authority: string | null
          qr_code: string | null
          entry_count: number | null
          hazard_count: number | null
          created_at: string
          updated_at: string | null
          last_modified: string | null
        }
        Insert: {
          id?: string
          permit_number: string
          project_number?: string | null
          work_location?: string | null
          contractor?: string | null
          supervisor?: string | null
          space_type?: string | null
          csa_class?: string | null
          entry_date?: string | null
          duration?: string | null
          worker_count?: number | null
          work_description?: string | null
          dimensions?: any | null
          entry_points?: any | null
          atmospheric_hazards?: string[] | null
          physical_hazards?: string[] | null
          environmental_conditions?: any | null
          space_content?: any | null
          safety_measures?: any | null
          space_photos?: any[] | null
          status?: 'active' | 'completed' | 'expired' | 'cancelled'
          province?: string | null
          authority?: string | null
          qr_code?: string | null
          entry_count?: number | null
          hazard_count?: number | null
          created_at?: string
          updated_at?: string | null
          last_modified?: string | null
        }
        Update: {
          id?: string
          permit_number?: string
          project_number?: string | null
          work_location?: string | null
          contractor?: string | null
          supervisor?: string | null
          space_type?: string | null
          csa_class?: string | null
          entry_date?: string | null
          duration?: string | null
          worker_count?: number | null
          work_description?: string | null
          dimensions?: any | null
          entry_points?: any | null
          atmospheric_hazards?: string[] | null
          physical_hazards?: string[] | null
          environmental_conditions?: any | null
          space_content?: any | null
          safety_measures?: any | null
          space_photos?: any[] | null
          status?: 'active' | 'completed' | 'expired' | 'cancelled'
          province?: string | null
          authority?: string | null
          qr_code?: string | null
          entry_count?: number | null
          hazard_count?: number | null
          created_at?: string
          updated_at?: string | null
          last_modified?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =================== TYPES SPÉCIFIQUES POUR L'APPLICATION ===================
export type ProvinceCode = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL'

export interface PermitSearchResult {
  permits: PermitHistoryEntry[]
  total: number
  page: number
  hasMore: boolean
}

export interface PermitHistoryEntry {
  id: string
  permitNumber: string
  projectNumber: string
  workLocation: string
  contractor: string
  spaceType: string
  csaClass: string
  entryDate: string
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  createdAt: string
  lastModified: string
  entryCount: number
  hazardCount: number
  qrCode?: string
}

export interface SpacePhoto {
  id: string
  url: string
  category: string
  caption: string
  timestamp: string
  location: string
  measurements?: string
  gpsCoords?: { lat: number; lng: number }
}

export interface ConfinedSpaceDetails {
  // Informations principales
  projectNumber: string
  workLocation: string
  contractor: string
  supervisor: string
  entryDate: string
  duration: string
  workerCount: number
  workDescription: string

  // Identification de l'espace
  spaceType: string
  csaClass: string
  entryMethod: string
  accessType: string
  spaceLocation: string
  spaceDescription: string

  // Dimensions
  dimensions: {
    length: number
    width: number
    height: number
    diameter: number
    volume: number
  }

  // Points d'entrée
  entryPoints: Array<{
    id: string
    type: string
    dimensions: string
    location: string
    condition: string
    accessibility: string
    photos: string[]
  }>

  // Dangers
  atmosphericHazards: string[]
  physicalHazards: string[]

  // Conditions environnementales
  environmentalConditions: {
    ventilationRequired: boolean
    ventilationType: string
    lightingConditions: string
    temperatureRange: string
    moistureLevel: string
    noiseLevel: string
    weatherConditions: string
  }

  // Contenu de l'espace
  spaceContent: {
    contents: string
    residues: string
    previousUse: string
    lastEntry: string
    cleaningStatus: string
  }

  // Mesures de sécurité
  safetyMeasures: {
    emergencyEgress: string
    communicationMethod: string
    monitoringEquipment: string[]
    ventilationEquipment: string[]
    emergencyEquipment: string[]
  }

  // Photos de l'espace
  spacePhotos: SpacePhoto[]
}

// =================== FONCTIONS UTILITAIRES SUPABASE ===================
export const createPermit = async (permitData: any) => {
  const { data, error } = await supabase
    .from('confined_space_permits')
    .insert(permitData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePermit = async (id: string, permitData: any) => {
  const { data, error } = await supabase
    .from('confined_space_permits')
    .update(permitData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPermit = async (permitNumber: string) => {
  const { data, error } = await supabase
    .from('confined_space_permits')
    .select('*')
    .eq('permit_number', permitNumber)
    .single()

  if (error) throw error
  return data
}

export const searchPermits = async (query: string, province?: ProvinceCode) => {
  let queryBuilder = supabase
    .from('confined_space_permits')
    .select('*')

  if (query.trim()) {
    const sanitizedQuery = query.trim()
    const searchExpression = [
      'permit_number',
      'project_number',
      'work_location',
      'contractor'
    ]
      .map((field) => `${field}.ilike.%${sanitizedQuery}%`)
      .join(',')

    queryBuilder = queryBuilder.or(searchExpression)
  }

  if (province) {
    queryBuilder = queryBuilder.eq('province', province)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) throw error
  return data
}
