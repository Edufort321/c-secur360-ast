import { createClient } from '@supabase/supabase-js'
export type { ConfinedSpaceDetails } from '@/types/confinedSpace'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
    queryBuilder = queryBuilder.or(`
      permit_number.ilike.%${query}%,
      project_number.ilike.%${query}%,
      work_location.ilike.%${query}%,
      contractor.ilike.%${query}%
    `)
  }

  if (province) {
    queryBuilder = queryBuilder.eq('province', province)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) throw error
  return data
}
