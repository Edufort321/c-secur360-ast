import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface ConfinedSpacePermit {
  id: string
  permit_number: string
  project_number?: string
  work_location?: string
  contractor?: string
  supervisor?: string
  space_type?: string
  csa_class?: string
  entry_date?: string
  duration?: string
  worker_count?: number
  work_description?: string
  dimensions?: any
  entry_points?: any
  atmospheric_hazards?: string[]
  physical_hazards?: string[]
  environmental_conditions?: any
  space_content?: any
  safety_measures?: any
  space_photos?: any
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  province: string
  authority?: string
  created_at: string
  last_modified: string
  entry_count: number
  hazard_count: number
  qr_code?: string
}

export interface PermitEntry {
  id: string
  permit_id: string
  entry_date: string
  exit_date?: string
  worker_name?: string
  entry_type: 'standard' | 'emergency' | 'maintenance'
  atmospheric_readings?: any
  notes?: string
  created_at: string
}
