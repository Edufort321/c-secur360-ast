// =====================================================
// Client Supabase SERVEUR (service_role) — pour l'auth et les opérations privilégiées.
// NE JAMAIS importer côté navigateur (service_role bypass RLS). Server-only.
// Fallback sur l'anon si service_role absent (dégradé).
// =====================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
