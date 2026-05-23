-- =====================================================
-- MIGRATION 012 — Cycle d'abonnement par tenant
-- Rappel 60 j avant refacturation · 30 j de grâce · blocage si impayé.
-- Idempotent.
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  tenant_id          TEXT PRIMARY KEY,
  status             TEXT DEFAULT 'active',     -- active | grace | unpaid | blocked (statut métier; l'état effectif est aussi calculé via les dates)
  cycle              TEXT DEFAULT 'annual',
  start_date         DATE DEFAULT CURRENT_DATE,
  next_billing_date  DATE,                      -- date de refacturation / renouvellement
  last_payment_at    TIMESTAMPTZ,
  reminder_days      INT DEFAULT 60,            -- rappel X jours avant
  grace_days         INT DEFAULT 30,            -- grâce X jours après échéance
  amount             NUMERIC(12,2),             -- montant facturé (snapshot)
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_subscriptions_access ON tenant_subscriptions;
CREATE POLICY tenant_subscriptions_access ON tenant_subscriptions FOR ALL USING (true);

-- Facturable : compté dans le revenu (décocher pour exclure, ex. CERDIA)
ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE;

-- CERDIA : abonnement actif, prochaine facturation dans 1 an
INSERT INTO tenant_subscriptions (tenant_id, status, next_billing_date, start_date, last_payment_at)
VALUES ('cerdia', 'active', CURRENT_DATE + INTERVAL '1 year', CURRENT_DATE, NOW())
ON CONFLICT (tenant_id) DO NOTHING;
