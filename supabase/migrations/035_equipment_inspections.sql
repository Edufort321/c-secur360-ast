-- 035_equipment_inspections.sql
-- Formulaires d'inspection d'équipements de sécurité
-- Types supportés : harness, forklift, aerial, scaffold, ladder, power_tools,
--                   fire_extinguisher, gas_detector, respiratory, ppe_general

CREATE TABLE IF NOT EXISTS equipment_inspections (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT        NOT NULL,
  inspection_number   TEXT        NOT NULL,
  equipment_type      TEXT        NOT NULL,
  equipment_name      TEXT,
  equipment_serial    TEXT,
  equipment_location  TEXT,
  equipment_photo     TEXT,                          -- base64 compressée
  inspector_name      TEXT,
  inspection_date     DATE,
  status              TEXT        NOT NULL DEFAULT 'draft',   -- draft | submitted | closed
  overall_result      TEXT,                          -- conforme | conditionnel | non_conforme | retrait
  results             JSONB       NOT NULL DEFAULT '{}',     -- { itemId: 'pass'|'fail'|'na' }
  item_photos         JSONB       NOT NULL DEFAULT '{}',     -- { itemId: base64 }
  item_notes          JSONB       NOT NULL DEFAULT '{}',     -- { itemId: string }
  non_conformities    JSONB       NOT NULL DEFAULT '[]',
  notes               TEXT,
  data                JSONB       NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ei_tenant  ON equipment_inspections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ei_type    ON equipment_inspections(equipment_type);
CREATE INDEX IF NOT EXISTS idx_ei_status  ON equipment_inspections(status);
CREATE INDEX IF NOT EXISTS idx_ei_date    ON equipment_inspections(inspection_date DESC);

ALTER TABLE equipment_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ei_tenant_isolation" ON equipment_inspections
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "ei_anon_insert" ON equipment_inspections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ei_anon_select" ON equipment_inspections
  FOR SELECT USING (true);

CREATE POLICY "ei_anon_update" ON equipment_inspections
  FOR UPDATE USING (true);
