-- 041_equipment_fk.sql
-- Ajoute equipment_id FK dans equipment_inspections
-- + backfill automatique depuis les inspections existantes

ALTER TABLE equipment_inspections
  ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id);

CREATE INDEX IF NOT EXISTS idx_ei_equipment_id ON equipment_inspections(equipment_id);

-- Backfill : crée un enregistrement equipment par équipement unique (tenant+type+série)
-- en prenant les données de l'inspection la plus récente, puis lie toutes les inspections.
-- À exécuter UNE SEULE FOIS après la migration 040.

WITH latest AS (
  SELECT DISTINCT ON (tenant_id, equipment_type, COALESCE(NULLIF(equipment_serial, ''), equipment_name, ''))
    tenant_id,
    equipment_type,
    equipment_name,
    equipment_serial,
    equipment_location,
    COALESCE(equipment_photos, '[]'::jsonb)   AS equipment_photos,
    inspection_frequency,
    COALESCE(inspection_shifts, '[]'::jsonb)  AS inspection_shifts
  FROM equipment_inspections
  WHERE tenant_id IS NOT NULL
    AND equipment_id IS NULL
  ORDER BY
    tenant_id,
    equipment_type,
    COALESCE(NULLIF(equipment_serial, ''), equipment_name, ''),
    updated_at DESC NULLS LAST
),
inserted_equipment AS (
  INSERT INTO equipment (
    tenant_id, equipment_type, equipment_name, equipment_serial,
    equipment_location, equipment_photos, inspection_frequency, inspection_shifts
  )
  SELECT
    tenant_id, equipment_type, equipment_name, equipment_serial,
    equipment_location, equipment_photos, inspection_frequency, inspection_shifts
  FROM latest
  RETURNING id, tenant_id, equipment_type, equipment_serial, equipment_name
)
UPDATE equipment_inspections ei
SET equipment_id = ie.id
FROM inserted_equipment ie
WHERE ei.tenant_id  = ie.tenant_id
  AND ei.equipment_type = ie.equipment_type
  AND COALESCE(NULLIF(ei.equipment_serial, ''), ei.equipment_name, '')
      = COALESCE(NULLIF(ie.equipment_serial, ''), ie.equipment_name, '');
