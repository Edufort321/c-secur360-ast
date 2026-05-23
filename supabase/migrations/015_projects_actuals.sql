-- =====================================================
-- MIGRATION 015 — Heures/coûts RÉELS du projet (feuille de temps) en JSONB
-- Idempotent.
-- =====================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actuals JSONB;
