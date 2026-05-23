-- =====================================================
-- MIGRATION 008 — ALIGNEMENT INVENTAIRE (inv_* existants)
-- N'invente rien : ALTER des tables réelles + ajout des manques.
-- Idempotent / non destructif.
-- =====================================================

-- Fonction trigger partagée (idempotente, au cas où) -------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- 1. Ancrage tenant : ajouter tenant_id (texte) ------------------------------
ALTER TABLE inv_items        ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE inv_locations    ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE inv_transactions ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Assouplir client_id NOT NULL (uniquement si table vide) --------------------
DO $$
DECLARE tbls TEXT[] := ARRAY['inv_items','inv_locations']; t TEXT; n BIGINT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
    IF n = 0 THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN client_id DROP NOT NULL', t);
    ELSE
      RAISE NOTICE '008: % non vide (% lignes) — client_id NOT NULL conservé', t, n;
    END IF;
  END LOOP;
END $$;

-- 2. Valorisation (absente de inv_items) -------------------------------------
ALTER TABLE inv_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(12,2) DEFAULT 0;
ALTER TABLE inv_items ADD COLUMN IF NOT EXISTS sale_price DECIMAL(12,2) DEFAULT 0;

-- 3. Catégories (lookup optionnel — inv_items.category reste texte) ----------
CREATE TABLE IF NOT EXISTS inv_categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,
  icon        TEXT,
  parent_id   UUID REFERENCES inv_categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

ALTER TABLE inv_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inv_categories_access ON inv_categories;
CREATE POLICY inv_categories_access ON inv_categories FOR ALL USING (true);

-- 4. Index -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inv_items_tenant         ON inv_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_locations_tenant     ON inv_locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_transactions_tenant  ON inv_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_transactions_project ON inv_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_inv_categories_tenant    ON inv_categories(tenant_id);

DROP TRIGGER IF EXISTS trg_inv_categories_updated_at ON inv_categories;
CREATE TRIGGER trg_inv_categories_updated_at BEFORE UPDATE ON inv_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
