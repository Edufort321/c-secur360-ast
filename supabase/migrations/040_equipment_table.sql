-- 040_equipment_table.sql
-- Fiche équipement séparée des inspections

CREATE TABLE IF NOT EXISTS equipment (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            TEXT        NOT NULL,
  equipment_type       TEXT        NOT NULL,
  equipment_name       TEXT,
  equipment_serial     TEXT,
  equipment_location   TEXT,
  equipment_photos     JSONB       NOT NULL DEFAULT '[]',
  inspection_frequency TEXT,
  inspection_shifts    JSONB       NOT NULL DEFAULT '[]',
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_tenant ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(equipment_serial);
CREATE INDEX IF NOT EXISTS idx_equipment_type   ON equipment(equipment_type);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equip_anon_select" ON equipment FOR SELECT USING (true);
CREATE POLICY "equip_anon_insert" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "equip_anon_update" ON equipment FOR UPDATE USING (true);
CREATE POLICY "equip_anon_delete" ON equipment FOR DELETE USING (true);
