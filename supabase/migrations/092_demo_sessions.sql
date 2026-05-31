-- 092: Acces demo limite + capture de lead (page publique)
-- Suit l'usage par courriel : sessions de 1h, max 3 demarrages (1 + 2 reprises), plafond 4h total.
-- statut: active | expired | locked | converted (abonne). Notification proprietaire par SMS (Twilio).
-- Executer dans le SQL Editor de Supabase Dashboard.

CREATE TABLE IF NOT EXISTS demo_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT NOT NULL UNIQUE,
  name               TEXT,
  first_seen         TIMESTAMPTZ DEFAULT NOW(),
  last_start         TIMESTAMPTZ,
  session_expires_at TIMESTAMPTZ,
  total_seconds      INTEGER DEFAULT 0,      -- temps cumule consomme
  attempts           INTEGER DEFAULT 0,      -- nombre de demarrages
  status             TEXT DEFAULT 'active' CHECK (status IN ('active','expired','locked','converted')),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS demo_sessions_email_idx ON demo_sessions (email);

ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS demo_sessions_access ON demo_sessions;
CREATE POLICY demo_sessions_access ON demo_sessions FOR ALL USING (true) WITH CHECK (true);
