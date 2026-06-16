-- 193 : Répertoire FOURNISSEURS (achats) — pendant du répertoire clients. Alimente les bons de commande
-- (sélection du fournisseur) et la facturation/comptabilité (tiers). Isolation applicative par tenant.
-- Idempotent. RLS permissive (comme clients / tables opérationnelles).

CREATE TABLE IF NOT EXISTS suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT NOT NULL,
  contact_name  TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  city          TEXT,
  province      TEXT DEFAULT 'QC',
  postal_code   TEXT,
  account_no    TEXT,                 -- n° de compte fournisseur (chez le fournisseur)
  payment_terms TEXT,                 -- ex. « net 30 »
  notes         TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers (tenant_id);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS suppliers_all ON suppliers;
CREATE POLICY suppliers_all ON suppliers FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('193') on conflict (version) do nothing;
