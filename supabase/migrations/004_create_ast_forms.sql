-- ===============================================
-- MIGRATION 004 - CRÉATION TABLE AST_FORMS
-- ===============================================
-- Crée la table principale du module AST (formulaires d'analyse sécuritaire
-- des tâches). DOIT s'exécuter AVANT 005_fix_ast_forms.sql et 010_core_projects_hub.sql
-- qui ne font que l'ALTER en supposant qu'elle existe déjà.
--
-- Colonnes alignées sur lib/supabase.ts -> createASTForm() / interface ASTFormData.
-- Idempotent / non destructif (IF NOT EXISTS partout).
-- ===============================================

CREATE TABLE IF NOT EXISTS ast_forms (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id         TEXT        NOT NULL,
  user_id           TEXT        NOT NULL DEFAULT '',
  project_number    TEXT        NOT NULL DEFAULT '',
  client_name       TEXT        NOT NULL DEFAULT '',
  work_location     TEXT        NOT NULL DEFAULT '',
  client_rep        TEXT,
  emergency_number  TEXT,
  ast_number        TEXT        NOT NULL,
  client_reference  TEXT,
  work_description  TEXT        NOT NULL DEFAULT '',
  status            TEXT        NOT NULL DEFAULT 'draft',
  general_info      JSONB,
  team_discussion   JSONB,
  isolation         JSONB,
  hazards           JSONB,
  control_measures  JSONB,
  workers           JSONB,
  photos            JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_ast_forms_tenant_id  ON ast_forms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ast_forms_ast_number ON ast_forms(ast_number);
CREATE INDEX IF NOT EXISTS idx_ast_forms_created_at ON ast_forms(created_at DESC);

-- Activer la sécurité au niveau ligne.
-- NOTE : les politiques RLS par tenant sont définies dans 005_fix_ast_forms.sql.
ALTER TABLE ast_forms ENABLE ROW LEVEL SECURITY;

-- updated_at automatique
CREATE OR REPLACE FUNCTION set_ast_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ast_forms_updated_at ON ast_forms;
CREATE TRIGGER trg_ast_forms_updated_at
  BEFORE UPDATE ON ast_forms
  FOR EACH ROW
  EXECUTE FUNCTION set_ast_forms_updated_at();
