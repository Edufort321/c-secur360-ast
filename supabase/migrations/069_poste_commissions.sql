-- 069: Commissions vendeurs par poste + lien vente projet ↔ responsable
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── Champs commission sur la grille salariale ───────────────────────────────
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_enabled   BOOLEAN       NOT NULL DEFAULT FALSE;
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_pct       NUMERIC(5,2)  DEFAULT 0;
-- Si tiered (par palier), commission_pct sur la grille = défaut, et chaque tier peut override
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_basis     TEXT          DEFAULT 'gross'
                                  CHECK (commission_basis IN ('gross','net','margin','custom'));
-- Seuil minimum de ventes avant déclenchement (optionnel)
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_threshold NUMERIC(12,2) DEFAULT 0;
-- Plafond annuel (optionnel)
ALTER TABLE poste_salary_grids ADD COLUMN IF NOT EXISTS commission_cap       NUMERIC(12,2);

-- Override par palier — chaque palier peut avoir son propre %
ALTER TABLE poste_salary_tiers ADD COLUMN IF NOT EXISTS commission_pct       NUMERIC(5,2);

-- ─── Liens vendeur(s) ↔ projet — qui touche commission sur quoi ─────────────
CREATE TABLE IF NOT EXISTS project_commissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  personnel_id    UUID NOT NULL REFERENCES planner_personnel(id) ON DELETE CASCADE,
  poste_id        UUID REFERENCES planner_postes(id) ON DELETE SET NULL,
  tier_id         UUID REFERENCES poste_salary_tiers(id) ON DELETE SET NULL,

  -- Snapshot au moment de l'enregistrement (immuable même si grille change après)
  commission_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,        -- % appliqué
  basis           TEXT NOT NULL DEFAULT 'gross'           -- base de calcul
                    CHECK (basis IN ('gross','net','margin','custom')),
  basis_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,       -- montant de base (CA, marge, etc.)
  commission_amount NUMERIC(14,2) NOT NULL DEFAULT 0,     -- = basis_amount × pct/100
  role            TEXT DEFAULT 'vendeur',                 -- 'vendeur' | 'co-vendeur' | 'apporteur'
  share_pct       NUMERIC(5,2) DEFAULT 100,               -- part si plusieurs vendeurs
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','paid','cancelled')),
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pc_project_idx   ON project_commissions (project_id);
CREATE INDEX IF NOT EXISTS pc_personnel_idx ON project_commissions (personnel_id, status);
CREATE INDEX IF NOT EXISTS pc_tenant_idx    ON project_commissions (tenant_id, status);

ALTER TABLE project_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pc_access ON project_commissions;
CREATE POLICY pc_access ON project_commissions FOR ALL USING (true) WITH CHECK (true);

-- ─── Marqueur sur projects pour le vendeur principal (rapide) ───────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_seller_id UUID;  -- planner_personnel.id
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sale_amount       NUMERIC(14,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS margin_amount     NUMERIC(14,2);
CREATE INDEX IF NOT EXISTS projects_primary_seller_idx ON projects (primary_seller_id) WHERE primary_seller_id IS NOT NULL;
