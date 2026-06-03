-- 117 — Modèle complet du module DGA (port de l'app dga-diagnostic.html vers Supabase, multi-tenant).
-- Dossier = transformateur/équipement (EQUIP_FIELDS) ; measures = échantillons DGA (gaz + diagnostic + flag).
-- Données hébergées sur Supabase (remplace localStorage). Recherche/flags/filtres client+série côté app.

CREATE TABLE IF NOT EXISTS dga_dossiers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  -- Information de commande
  company       TEXT, contact TEXT, email TEXT, sample_id TEXT, report_id TEXT, po_no TEXT,
  -- Équipement
  client        TEXT,            -- Localisation / Sous-station
  ident         TEXT NOT NULL,   -- Équipement (nom) — requis
  serie         TEXT,            -- N° de série
  equip_no      TEXT, apparatus TEXT, description TEXT, alarm TEXT,
  kv            NUMERIC, mva NUMERIC, oil_vol NUMERIC, oil_type TEXT,
  manufacturer  TEXT, year TEXT,
  extra         JSONB DEFAULT '{}'::jsonb,  -- champs additionnels (souplesse port)
  -- Suivi
  flag          TEXT,            -- statut/flag (ex. a_surveiller, critique, ok)
  notes         TEXT,
  created_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dga_dossiers_tenant_idx ON dga_dossiers (tenant_id, ident);
CREATE INDEX IF NOT EXISTS dga_dossiers_serie_idx  ON dga_dossiers (tenant_id, serie);
CREATE INDEX IF NOT EXISTS dga_dossiers_client_idx ON dga_dossiers (tenant_id, client);

CREATE TABLE IF NOT EXISTS dga_measures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  dossier_id   UUID NOT NULL REFERENCES dga_dossiers(id) ON DELETE CASCADE,
  sample_date  DATE,
  -- Gaz (ppm)
  h2 NUMERIC DEFAULT 0, ch4 NUMERIC DEFAULT 0, c2h6 NUMERIC DEFAULT 0, c2h4 NUMERIC DEFAULT 0,
  c2h2 NUMERIC DEFAULT 0, co NUMERIC DEFAULT 0, co2 NUMERIC DEFAULT 0,
  o2 NUMERIC, n2 NUMERIC,                          -- gaz additionnels (optionnels)
  -- Qualité d'huile / autres mesures (souplesse : furannes, eau, rigidité, etc.)
  oil_quality  JSONB DEFAULT '{}'::jsonb,
  -- Diagnostic calculé
  tdcg         NUMERIC, condition INT, duval TEXT, fault TEXT,
  methods      JSONB DEFAULT '{}'::jsonb,          -- Rogers/IEC/KeyGas + IA
  ai_summary   TEXT,                               -- synthèse de l'analyseur IA
  flag         TEXT,                               -- flag de l'échantillon
  source       TEXT DEFAULT 'manual',              -- manual | pdf | ai
  attachment_url TEXT,                             -- PDF de labo source (Storage)
  notes        TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dga_measures_dossier_idx ON dga_measures (tenant_id, dossier_id, sample_date);

CREATE TABLE IF NOT EXISTS dga_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  title        TEXT, project_no TEXT,
  dossier_ids  JSONB DEFAULT '[]'::jsonb,          -- dossiers assemblés dans le rapport
  recommendation TEXT, report_date DATE,
  pdf_url      TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dga_reports_tenant_idx ON dga_reports (tenant_id, created_at DESC);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['dga_dossiers','dga_measures','dga_reports'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_access ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_access ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;
