-- 191 : Programme de MAINTENANCE d'équipement (GMAO/CMMS).
-- S'appuie sur le registre `equipment` existant (migration 040) — on n'y touche pas.
--  - maintenance_templates : GABARITS dupliquables (séquence de lignes d'entretien).
--  - maintenance_sheets     : instance d'un gabarit RATTACHÉE à une machine (equipment_id) — porte le QR.
--  - maintenance_logs       : exécutions d'une feuille (date, exécutant, durée chrono, résultats par ligne).
--  - maintenance_actions    : correctifs à faire (anomalies) — dashboard + cédulage planner.
-- RLS permissive (isolation applicative par tenant, comme les autres tables opérationnelles). Idempotent.

CREATE TABLE IF NOT EXISTS maintenance_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  equipment_type TEXT,                          -- type d'équipement visé (optionnel)
  frequency      TEXT,                          -- quotidien|hebdomadaire|mensuel|semestriel|annuel|par_quart
  lines          JSONB NOT NULL DEFAULT '[]',   -- [{ id, description, allow_anomaly:true }]
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_sheets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  equipment_id   UUID,                          -- machine (registre equipment) — null = gabarit non encore instancié
  template_id    UUID,                          -- gabarit d'origine (pour duplication)
  name           TEXT,                          -- nom de la feuille (ex. « Entretien presse #3 »)
  frequency      TEXT,
  lines          JSONB NOT NULL DEFAULT '[]',   -- copie éditable des lignes du gabarit
  last_done_at   DATE,                          -- dernière maintenance effectuée (pour les rappels)
  next_due_at    DATE,                          -- prochaine échéance calculée/saisie
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  sheet_id       UUID,                          -- feuille exécutée
  equipment_id   UUID,
  performed_by   TEXT,                          -- nom/identifiant du technicien
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_min   NUMERIC DEFAULT 0,             -- temps de maintenance (chrono / clic punch), en minutes
  labor_cost     NUMERIC DEFAULT 0,             -- coût MO calculé (taux × temps), figé au log
  parts_cost     NUMERIC DEFAULT 0,             -- coût pièces (lien bon de commande / inventaire)
  results        JSONB NOT NULL DEFAULT '{}',   -- { lineId: { state:'ok'|'anomaly', note, photos:[...] } }
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_actions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  equipment_id   UUID,
  sheet_id       UUID,
  log_id         UUID,
  description    TEXT NOT NULL,
  priority       TEXT DEFAULT 'normal',         -- low|normal|high|critical
  status         TEXT DEFAULT 'todo',           -- todo|scheduled|done
  photos         JSONB DEFAULT '[]',
  due_date       DATE,
  planner_job_id TEXT,                          -- job planner créé pour le correctif (cédulage)
  cost           NUMERIC DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maint_sheets_tenant_equip ON maintenance_sheets (tenant_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_maint_logs_tenant_equip   ON maintenance_logs (tenant_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_maint_actions_tenant_stat ON maintenance_actions (tenant_id, status);

ALTER TABLE maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_sheets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_actions   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS maint_templates_all ON maintenance_templates;
DROP POLICY IF EXISTS maint_sheets_all    ON maintenance_sheets;
DROP POLICY IF EXISTS maint_logs_all      ON maintenance_logs;
DROP POLICY IF EXISTS maint_actions_all   ON maintenance_actions;
CREATE POLICY maint_templates_all ON maintenance_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY maint_sheets_all    ON maintenance_sheets    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY maint_logs_all      ON maintenance_logs      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY maint_actions_all   ON maintenance_actions   FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('191') on conflict (version) do nothing;
