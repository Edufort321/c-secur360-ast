-- 206 — REGISTRE DES IMMOBILISATIONS : biens appartenant à l'entreprise (ordinateur, mobilier,
-- véhicule, équipement…) afin qu'ils paraissent au livre (actif 1500). Comptabilisation : DR 1500
-- Immobilisations / CR 1000 Banque (payé) ou 2000 Fournisseurs (à payer). Table opérationnelle. Idempotent.
CREATE TABLE IF NOT EXISTS public.company_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         TEXT NOT NULL,
  name              TEXT NOT NULL,
  category          TEXT,                               -- Informatique | Mobilier | Véhicule | Équipement | Autre
  acquisition_date  DATE NOT NULL DEFAULT (now()::date),
  cost              NUMERIC(16,2) NOT NULL DEFAULT 0,   -- coût d'acquisition
  supplier          TEXT,
  serial_number     TEXT,
  useful_life_years NUMERIC(6,2),                       -- durée de vie utile (amortissement linéaire)
  salvage_value     NUMERIC(16,2) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active',      -- active | disposed
  disposal_date     DATE,
  gl_entry_id       UUID,                               -- écriture d'acquisition (si comptabilisée)
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_tenant ON public.company_assets(tenant_id, status);

ALTER TABLE public.company_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assets_access ON public.company_assets;
CREATE POLICY assets_access ON public.company_assets FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('206') on conflict (version) do nothing;
