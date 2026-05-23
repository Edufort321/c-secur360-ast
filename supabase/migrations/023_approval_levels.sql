-- Approval levels for quote authorization by amount threshold.
-- Managed in Taux & catalogue > Niveaux d'approbation.
CREATE TABLE IF NOT EXISTS approval_levels (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT         NOT NULL,
  sort_order     INT          NOT NULL DEFAULT 0,
  level_name     TEXT         NOT NULL,
  max_amount     NUMERIC      NOT NULL DEFAULT 0,
  approver_label TEXT         NOT NULL DEFAULT '',
  color          TEXT         NOT NULL DEFAULT 'blue',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS approval_levels_tenant_idx ON approval_levels (tenant_id, sort_order);
