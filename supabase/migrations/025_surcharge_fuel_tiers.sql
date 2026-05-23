-- Barème de surcharge carburant sur les km.
-- Prix litre (range) → pourcentage de surcharge appliqué au coût km.
CREATE TABLE IF NOT EXISTS surcharge_fuel_tiers (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT    NOT NULL,
  sort_order   INT     NOT NULL DEFAULT 0,
  price_min    NUMERIC NOT NULL DEFAULT 0,   -- prix litre minimum ($)
  price_max    NUMERIC,                       -- prix litre maximum ($), NULL = illimité
  surcharge_pct NUMERIC NOT NULL DEFAULT 0,  -- % de surcharge sur le coût km
  applies_to   TEXT    NOT NULL DEFAULT 'km',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE surcharge_fuel_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS surcharge_fuel_tiers_access ON surcharge_fuel_tiers;
CREATE POLICY surcharge_fuel_tiers_access ON surcharge_fuel_tiers FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS surcharge_fuel_tiers_tenant_idx ON surcharge_fuel_tiers (tenant_id, sort_order);
