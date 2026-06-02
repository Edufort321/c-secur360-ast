-- 106 — Bons de commande (achats fournisseurs).
-- Interrelie planificateur (items "à commander"), inventaire (réception) et facturation/projet.
-- Les lignes sont stockées en JSON (items) — résilient, pas de table enfant.
CREATE TABLE IF NOT EXISTS bons_commande (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        text NOT NULL DEFAULT 'cerdia',
  numero           text NOT NULL,
  supplier         text,
  supplier_contact text,
  project_id       text,
  status           text NOT NULL DEFAULT 'brouillon', -- brouillon | envoye | partiel | recu | annule
  items            jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes            text,
  province         text DEFAULT 'QC',
  expected_date    date,
  subtotal         numeric(12,2) DEFAULT 0,
  taxes            numeric(12,2) DEFAULT 0,
  total            numeric(12,2) DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bc_tenant_idx ON bons_commande (tenant_id);

ALTER TABLE bons_commande ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bc_access ON bons_commande;
CREATE POLICY bc_access ON bons_commande FOR ALL USING (true) WITH CHECK (true);
