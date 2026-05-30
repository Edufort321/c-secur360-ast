// =====================================================
// Client Supabase SERVEUR (service_role) — pour l'auth et les opérations privilégiées.
// NE JAMAIS importer côté navigateur (service_role bypass RLS). Server-only.
// Securite (#5) : PAS de fallback anon silencieux en PRODUCTION runtime -> on echoue de maniere
// visible si la cle service_role est absente (deploiement mal configure). En dev/build local
// (ou service_role peut etre absent de .env.local), on tolere l'anon avec avertissement.
// =====================================================
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Build Next.js : NEXT_PHASE === 'phase-production-build' ; runtime prod : NODE_ENV=production sans cette phase.
const isProdRuntime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build';

if (!service) {
  if (isProdRuntime) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant en production — operations privilegiees indisponibles (aucun fallback anon).');
  }
  console.warn('⚠️ supabaseAdmin : SUPABASE_SERVICE_ROLE_KEY absent — fallback anon (dev/build uniquement).');
}

const key = service || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
