import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =================== TYPES ET INTERFACES ===================
export interface Database {
  public: {
    Tables: {
      ast_forms: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          project_number: string
          client_name: string
          work_location: string
          client_rep: string | null
          emergency_number: string | null
          ast_number: string
          client_reference: string | null
          work_description: string
          status: string
          general_info: any | null
          team_discussion: any | null
          isolation: any | null
          hazards: any | null
          control_measures: any | null
          workers: any | null
          photos: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          project_number: string
          client_name: string
          work_location: string
          client_rep?: string | null
          emergency_number?: string | null
          ast_number: string
          client_reference?: string | null
          work_description: string
          status?: string
          general_info?: any | null
          team_discussion?: any | null
          isolation?: any | null
          hazards?: any | null
          control_measures?: any | null
          workers?: any | null
          photos?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          project_number?: string
          client_name?: string
          work_location?: string
          client_rep?: string | null
          emergency_number?: string | null
          ast_number?: string
          client_reference?: string | null
          work_description?: string
          status?: string
          general_info?: any | null
          team_discussion?: any | null
          isolation?: any | null
          hazards?: any | null
          control_measures?: any | null
          workers?: any | null
          photos?: any | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
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

// =================== FONCTIONS AST ===================

export interface ASTFormData {
  id?: string
  tenantId: string
  userId: string
  projectNumber: string
  clientName: string
  workLocation: string
  clientRep?: string
  emergencyNumber?: string
  astNumber: string
  clientReference?: string
  workDescription: string
  status?: string
  generalInfo?: any
  teamDiscussion?: any
  isolation?: any
  hazards?: any
  controlMeasures?: any
  workers?: any
  photos?: any
}

export const createASTForm = async (astData: ASTFormData) => {
  const { data, error } = await supabase
    .from('ast_forms')
    .insert({
      tenant_id: astData.tenantId,
      user_id: astData.userId,
      project_number: astData.projectNumber,
      client_name: astData.clientName,
      work_location: astData.workLocation,
      client_rep: astData.clientRep,
      emergency_number: astData.emergencyNumber,
      ast_number: astData.astNumber,
      client_reference: astData.clientReference,
      work_description: astData.workDescription,
      status: astData.status || 'draft',
      general_info: astData.generalInfo,
      team_discussion: astData.teamDiscussion,
      isolation: astData.isolation,
      hazards: astData.hazards,
      control_measures: astData.controlMeasures,
      workers: astData.workers,
      photos: astData.photos
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateASTForm = async (id: string, astData: Partial<ASTFormData>) => {
  const updateData: any = {}
  
  if (astData.tenantId) updateData.tenant_id = astData.tenantId
  if (astData.userId) updateData.user_id = astData.userId
  if (astData.projectNumber) updateData.project_number = astData.projectNumber
  if (astData.clientName) updateData.client_name = astData.clientName
  if (astData.workLocation) updateData.work_location = astData.workLocation
  if (astData.clientRep !== undefined) updateData.client_rep = astData.clientRep
  if (astData.emergencyNumber !== undefined) updateData.emergency_number = astData.emergencyNumber
  if (astData.astNumber) updateData.ast_number = astData.astNumber
  if (astData.clientReference !== undefined) updateData.client_reference = astData.clientReference
  if (astData.workDescription) updateData.work_description = astData.workDescription
  if (astData.status) updateData.status = astData.status
  if (astData.generalInfo !== undefined) updateData.general_info = astData.generalInfo
  if (astData.teamDiscussion !== undefined) updateData.team_discussion = astData.teamDiscussion
  if (astData.isolation !== undefined) updateData.isolation = astData.isolation
  if (astData.hazards !== undefined) updateData.hazards = astData.hazards
  if (astData.controlMeasures !== undefined) updateData.control_measures = astData.controlMeasures
  if (astData.workers !== undefined) updateData.workers = astData.workers
  if (astData.photos !== undefined) updateData.photos = astData.photos

  const { data, error } = await supabase
    .from('ast_forms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getASTForm = async (id: string) => {
  const { data, error } = await supabase
    .from('ast_forms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const getASTFormsByTenant = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('ast_forms')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const deleteASTForm = async (id: string) => {
  const { data, error } = await supabase
    .from('ast_forms')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
