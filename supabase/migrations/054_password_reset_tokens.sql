-- Migration 054: Password reset tokens for custom auth system
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prt_token   ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_prt_user    ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prt_service_all ON password_reset_tokens;
CREATE POLICY prt_service_all ON password_reset_tokens FOR ALL USING (true);
