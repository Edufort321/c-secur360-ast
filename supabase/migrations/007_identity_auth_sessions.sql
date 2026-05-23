-- =====================================================
-- MIGRATION 007 — IDENTITÉ & AUTH
-- Crée auth_sessions (attendue par middleware.ts, actuellement inexistante).
-- Identité = table `users` (id texte) ; `profiles` consolidée (note plus bas).
-- Idempotent / non destructif.
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_sessions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token         TEXT NOT NULL UNIQUE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at    TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token   ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user    ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions(expires_at);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_sessions_access ON auth_sessions;
CREATE POLICY auth_sessions_access ON auth_sessions FOR ALL USING (true);

-- Consolidation profiles -> users (optionnel, à exécuter en connaissance) ------
-- [MIGRATE] décommenter après vérification :
-- INSERT INTO users (id, email, name, password, role, "tenantId", tenant_id, is_active)
-- SELECT p.id::text, p.email, p.full_name, '', COALESCE(p.role,'user'),
--        p.tenant_id, p.tenant_id, true
-- FROM profiles p
-- ON CONFLICT (id) DO NOTHING;
