-- 062: Véhicules — régimes comptables complets (ARC/Revenu Québec)
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Régime fiscal du véhicule
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS regime TEXT NOT NULL DEFAULT 'A_achat';
-- Valeurs: 'A_achat' | 'A_bail' | 'A_financement' | 'B_personnel'

-- Type de motorisation (DPA Cat. 10/10.1 vs Cat. 54 ZEV)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_type TEXT NOT NULL DEFAULT 'thermique';
-- Valeurs: 'thermique' | 'electrique'

-- Coût mensuel du bail (Régime A — Bail) — plafonné à 1 050 $/mois ARC 2026
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS monthly_lease_cost NUMERIC(12,2);

-- Intérêts mensuels du financement (Régime A — Financement) — plafonnés à 300 $/mois ARC 2026
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interest_monthly NUMERIC(10,2);

-- Mise à jour des données existantes si la colonne type existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='type') THEN
    UPDATE vehicles SET regime = 'B_personnel' WHERE type = 'personal' AND regime = 'A_achat';
    UPDATE vehicles SET regime = 'A_achat'     WHERE type = 'company'  AND regime = 'A_achat';
  END IF;
END $$;

-- Index pour filtrage par régime
CREATE INDEX IF NOT EXISTS vehicles_regime_idx ON vehicles (tenant_id, regime, active);
