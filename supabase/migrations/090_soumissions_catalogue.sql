-- 090: Soumissions + catalogue de taux versionne (chaine devis -> planificateur -> facturation)
-- Structure hierarchique : Soumission -> Items -> Lignes (MO Bureau/Chantier/Voyagement/Subsistance/Hebergement/Materiaux).
-- Catalogue de taux versionne par annee/revision. Revisions de soumission (archivage + nouvelle version).
-- Executer dans le SQL Editor de Supabase Dashboard.

-- ── Catalogue de taux (versionne par annee / revision) ───────────────────────
CREATE TABLE IF NOT EXISTS catalogue_taux (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  name            TEXT NOT NULL DEFAULT 'Catalogue',
  year            INTEGER NOT NULL,
  revision        INTEGER NOT NULL DEFAULT 1,         -- rev 1, 2, ... pour une meme annee
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  taux_mo_bureau  NUMERIC(12,2) DEFAULT 0,            -- $/h main-d'oeuvre bureau
  taux_mo_chantier NUMERIC(12,2) DEFAULT 0,           -- $/h main-d'oeuvre chantier
  mult_supp       NUMERIC(6,3) DEFAULT 1.5,           -- multiplicateur heures supplementaires
  mult_maj        NUMERIC(6,3) DEFAULT 2.0,           -- multiplicateur heures majorees (defaut 2x, configurable)
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, year, revision, name)
);
CREATE INDEX IF NOT EXISTS catalogue_taux_tenant_idx ON catalogue_taux (tenant_id, year, status);

-- ── Soumissions (en-tete) — versionnees (revisions) ──────────────────────────
CREATE TABLE IF NOT EXISTS soumissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            TEXT NOT NULL,
  numero               TEXT NOT NULL,                 -- ex. 'S-2026-001'
  revision             INTEGER NOT NULL DEFAULT 1,
  parent_soumission_id UUID REFERENCES soumissions(id) ON DELETE SET NULL, -- chaine des revisions
  year                 INTEGER,
  client_id            TEXT,
  client_snapshot      JSONB,
  project_id           TEXT,                          -- renseigne quand transferee en projet (recherche planif)
  catalogue_id         UUID REFERENCES catalogue_taux(id) ON DELETE SET NULL, -- version de taux utilisee
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','archived')),
  total                NUMERIC(14,2) DEFAULT 0,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, numero, revision)
);
CREATE INDEX IF NOT EXISTS soumissions_tenant_idx ON soumissions (tenant_id, status, year);
CREATE INDEX IF NOT EXISTS soumissions_project_idx ON soumissions (tenant_id, project_id);

-- ── Items de soumission (ex. « Item 1 — Entretien ») ─────────────────────────
CREATE TABLE IF NOT EXISTS soumission_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  soumission_id UUID NOT NULL REFERENCES soumissions(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  year          INTEGER,
  sort_order    INTEGER DEFAULT 0,
  total         NUMERIC(14,2) DEFAULT 0
);
CREATE INDEX IF NOT EXISTS soumission_items_idx ON soumission_items (soumission_id, sort_order);

-- ── Lignes (par categorie) ────────────────────────────────────────────────────
-- MO Bureau / MO Chantier : tech (nb personnes) + reg/supp/maj (heures). Autres : quantite + cout unitaire.
CREATE TABLE IF NOT EXISTS soumission_lignes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  item_id     UUID NOT NULL REFERENCES soumission_items(id) ON DELETE CASCADE,
  categorie   TEXT NOT NULL CHECK (categorie IN ('mo_bureau','mo_chantier','voyagement','subsistance','hebergement','materiaux')),
  description TEXT,
  tech        INTEGER DEFAULT 1,                       -- nb de personnes (MO)
  reg         NUMERIC(10,2) DEFAULT 0,                 -- heures regulieres
  supp        NUMERIC(10,2) DEFAULT 0,                 -- heures supplementaires
  maj         NUMERIC(10,2) DEFAULT 0,                 -- heures majorees
  quantity    NUMERIC(12,2) DEFAULT 0,                 -- pour lignes de cout (voyagement/subsistance/...)
  unit        TEXT,
  unit_cost   NUMERIC(12,2) DEFAULT 0,
  montant     NUMERIC(14,2) DEFAULT 0,                 -- montant calcule de la ligne
  sort_order  INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS soumission_lignes_idx ON soumission_lignes (item_id, categorie, sort_order);

-- ── RLS (permissive, isolation applicative par tenant_id, comme le reste du projet) ──
ALTER TABLE catalogue_taux     ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumission_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumission_lignes  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS catalogue_taux_access    ON catalogue_taux;    CREATE POLICY catalogue_taux_access    ON catalogue_taux    FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS soumissions_access       ON soumissions;       CREATE POLICY soumissions_access       ON soumissions       FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS soumission_items_access  ON soumission_items;  CREATE POLICY soumission_items_access  ON soumission_items  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS soumission_lignes_access ON soumission_lignes; CREATE POLICY soumission_lignes_access ON soumission_lignes FOR ALL USING (true) WITH CHECK (true);
