-- 112 — Partage API selectif par module (#74). Le client pompe SES donnees (read-only) vers son serveur/ERP.
-- Une cle API par tenant + liste des modules autorises. Complement de la connexion ERP (erp_* sur tenants).
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  tenant_id    text PRIMARY KEY,
  api_key      text NOT NULL,                 -- jeton porteur (prefixe csk_), regenerable
  enabled      boolean NOT NULL DEFAULT true,  -- coupe-circuit global du partage
  modules      jsonb NOT NULL DEFAULT '{}',    -- { "financial": true, "timesheets": false, ... }
  last_used_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS tenant_api_keys_key_idx ON tenant_api_keys (api_key);

-- RLS : la table n'est jamais lue cote navigateur en clair pour un autre tenant.
-- L'admin du tenant gere via le client (filtre tenant_id) ; l'endpoint /api/erp lit via service_role.
ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_api_keys_access ON tenant_api_keys;
CREATE POLICY tenant_api_keys_access ON tenant_api_keys FOR ALL USING (true) WITH CHECK (true);
