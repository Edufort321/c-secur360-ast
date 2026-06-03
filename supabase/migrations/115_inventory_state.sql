-- 115 — Persistance de l'inventaire par tenant (#55). Le module inventaire conserve son modele
-- riche cote client ; on persiste un instantané JSON par tenant (multi-appareils, survit au reload).
-- Corrige le bug ou la table `items` vide ecrasait le cache localStorage a chaque chargement.
CREATE TABLE IF NOT EXISTS inventory_state (
  tenant_id  TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { items, movements, departments, categories, storageUnits, baseEbitda, targetEbitda }
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inventory_state_access ON inventory_state;
CREATE POLICY inventory_state_access ON inventory_state FOR ALL USING (true) WITH CHECK (true);
