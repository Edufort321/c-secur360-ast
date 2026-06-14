-- 173 — Dimension SITE sur les modules (Phase 2). Ajoute site_id (-> planner_succursales) aux tables
-- des modules filtrables par site. NULL = non rattaché (visible seulement en vue « Tous les sites »).
-- Idempotent. Les nouveaux enregistrements capturent le site courant (sélecteur global).

ALTER TABLE projects          ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;
ALTER TABLE incident_reports  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;
ALTER TABLE ast_permits       ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;
ALTER TABLE timesheets        ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;
ALTER TABLE inv_items         ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_site    ON projects(site_id);
CREATE INDEX IF NOT EXISTS idx_incidents_site   ON incident_reports(site_id);
CREATE INDEX IF NOT EXISTS idx_ast_site         ON ast_permits(site_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_site  ON timesheets(site_id);
CREATE INDEX IF NOT EXISTS idx_inv_items_site   ON inv_items(site_id);

NOTIFY pgrst, 'reload schema';
