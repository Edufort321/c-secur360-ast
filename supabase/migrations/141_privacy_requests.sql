-- Loi 25 — Registre des demandes d'exercice de droits (accès, rectification, suppression,
-- retrait du consentement, portabilité). Permet un traitement traçable avec délai légal (30 j).
CREATE TABLE IF NOT EXISTS privacy_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT,
  user_id         TEXT,
  email           TEXT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('access','rectification','deletion','withdrawal','portability')),
  message         TEXT,
  status          TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','in_progress','completed','refused')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at          TIMESTAMPTZ,            -- échéance de réponse (Loi 25 : 30 jours)
  handled_by      TEXT,
  handled_at      TIMESTAMPTZ,
  resolution_note TEXT
);

CREATE INDEX IF NOT EXISTS privacy_requests_tenant_idx ON privacy_requests (tenant_id);
CREATE INDEX IF NOT EXISTS privacy_requests_email_idx  ON privacy_requests (email);
CREATE INDEX IF NOT EXISTS privacy_requests_status_idx ON privacy_requests (status);

-- Accès réservé au service role (les routes serveur utilisent la clé service).
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
