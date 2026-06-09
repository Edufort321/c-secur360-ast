-- 149 — Module Rapports terrain : persistance serveur (remplace le localStorage). Un rapport =
-- un document JSON. Colonnes updated_at + deleted (soft-delete) requises pour la future synchro
-- hors-ligne. Accès SERVEUR uniquement (service role + tenant de session) — fermé à l'anon.
CREATE TABLE IF NOT EXISTS rapports (
  id            text PRIMARY KEY,            -- id client conservé (r_...)
  tenant_id     text NOT NULL,
  title         text DEFAULT '',
  status        text DEFAULT 'in_progress',
  template      text,
  num           text,                        -- numéro de gabarit/rapport
  data          jsonb NOT NULL DEFAULT '{}'::jsonb, -- document complet (blocks, annotations, cover…)
  author_email  text,
  version       int  NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted       boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS rapports_tenant_idx ON rapports (tenant_id, updated_at DESC);

-- Gabarits custom du tenant (partagés entre utilisateurs du tenant).
CREATE TABLE IF NOT EXISTS rapport_templates (
  id          text PRIMARY KEY,             -- ct_...
  tenant_id   text NOT NULL,
  name        text DEFAULT '',
  num         text,
  blocks      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted     boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS rapport_templates_tenant_idx ON rapport_templates (tenant_id);

-- Sécurité : accès via routes serveur (service role) uniquement.
ALTER TABLE rapports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapport_templates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rapports          FROM anon, authenticated;
REVOKE ALL ON rapport_templates FROM anon, authenticated;
