-- 134 — Archivage des non-conformités/anomalies du dashboard.
-- Permet à un coordonnateur de RANGER une anomalie (ex. AST déjà traitée) pour ne plus la voir
-- en haut du tableau de bord, sans toucher au dossier source. item_key = clé stable du panneau
-- (ex. 'ast_AST-CERDIA-2026-05-26-LGTI', 'insp_<n>', 'inc_<id>'). Réversible (restauration).

CREATE TABLE IF NOT EXISTS dashboard_archived_anomalies (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT        NOT NULL,
  item_key     TEXT        NOT NULL,
  archived_by  TEXT        DEFAULT '',
  archived_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, item_key)
);
CREATE INDEX IF NOT EXISTS dash_archived_tenant_idx ON dashboard_archived_anomalies (tenant_id);

ALTER TABLE dashboard_archived_anomalies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dash_archived_access ON dashboard_archived_anomalies;
CREATE POLICY dash_archived_access ON dashboard_archived_anomalies FOR ALL USING (true);
