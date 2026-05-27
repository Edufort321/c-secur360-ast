-- =====================================================
-- MIGRATION 055 — Colonnes auth manquantes sur users
-- Ajoute locked_until, failed_attempts, last_login_at
-- Idempotent (ADD COLUMN IF NOT EXISTS)
-- =====================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locked_until    TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at   TIMESTAMPTZ DEFAULT NULL;
