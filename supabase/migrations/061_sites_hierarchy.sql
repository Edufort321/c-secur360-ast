-- 061: Hiérarchie sites → départements dans planner_succursales
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Type: 'site' (racine) ou 'departement' (enfant d'un site)
ALTER TABLE planner_succursales
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'site';

-- Lien parent : département → site (NULL pour les sites racines)
ALTER TABLE planner_succursales
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES planner_succursales(id) ON DELETE CASCADE;

-- Index lookup rapide des enfants d'un site
CREATE INDEX IF NOT EXISTS ps_parent_idx
  ON planner_succursales (tenant_id, parent_id)
  WHERE parent_id IS NOT NULL;
