-- 110 — Matrice de permissions configurable par tenant.
-- Pour chaque CAPACITE (clé), on stocke le NIVEAU MINIMAL (tier 1..8 du Guide des niveaux d'accès)
-- requis. Tout employé dont le tier >= min_tier a la capacité. Si aucune ligne pour une capacité,
-- l'app utilise le défaut codé (lib/permissions.ts).
CREATE TABLE IF NOT EXISTS tenant_permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  capability  text NOT NULL,
  min_tier    int  NOT NULL DEFAULT 8,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, capability)
);
CREATE INDEX IF NOT EXISTS tenant_permissions_tenant_idx ON tenant_permissions (tenant_id);

ALTER TABLE tenant_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_permissions_access ON tenant_permissions;
CREATE POLICY tenant_permissions_access ON tenant_permissions FOR ALL USING (true) WITH CHECK (true);
