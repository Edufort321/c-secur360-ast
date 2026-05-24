-- ============================================================
-- Migration: work_permits + ast_permits tables
-- Date: 2026-05-24
-- All new permit types use work_permits (single table, type discriminator)
-- AST uses ast_permits (distinct concept from work permits)
-- ============================================================

-- Unified table for all new permit types
-- (confined_space_permits already exists separately)
CREATE TABLE IF NOT EXISTS work_permits (
  permit_number  text        PRIMARY KEY,
  tenant_id      text        NOT NULL,
  type           text        NOT NULL,  -- hot_work | loto | electrical | height_work | excavation | chemical | pressure
  data           jsonb       NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS work_permits_tenant     ON work_permits (tenant_id);
CREATE INDEX IF NOT EXISTS work_permits_tenant_type ON work_permits (tenant_id, type);
CREATE INDEX IF NOT EXISTS work_permits_updated     ON work_permits (updated_at DESC);

-- RLS (same pattern as confined_space_permits)
ALTER TABLE work_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select" ON work_permits
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_insert" ON work_permits
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_update" ON work_permits
  FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

-- AST (Analyse de Sécurité au Travail) — separate table
CREATE TABLE IF NOT EXISTS ast_permits (
  permit_number  text        PRIMARY KEY,
  tenant_id      text        NOT NULL,
  data           jsonb       NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ast_permits_tenant  ON ast_permits (tenant_id);
CREATE INDEX IF NOT EXISTS ast_permits_updated ON ast_permits (updated_at DESC);

ALTER TABLE ast_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select" ON ast_permits
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_insert" ON ast_permits
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_update" ON ast_permits
  FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true));

-- ============================================================
-- NOTE: Run this migration manually via Supabase dashboard
-- SQL editor, or: supabase db push (only for these new tables)
-- DO NOT run supabase db push for worker_registry migrations
-- ============================================================
