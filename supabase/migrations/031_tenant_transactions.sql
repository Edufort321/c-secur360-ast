-- =====================================================
-- MIGRATION 031 — Historique des transactions par tenant
-- Chaque paiement/crédit/remboursement est loggé ici.
-- Idempotent.
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'payment',  -- payment | refund | credit | adjustment
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT        NOT NULL DEFAULT 'CAD',
  status        TEXT        NOT NULL DEFAULT 'completed', -- completed | pending | failed | cancelled
  description   TEXT,
  reference     TEXT,       -- numéro de facture, réf Commerce CERDIA, etc.
  period_start  DATE,       -- période couverte
  period_end    DATE,
  created_by    TEXT,       -- email de l'admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_transactions_tenant ON tenant_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_transactions_created ON tenant_transactions(created_at DESC);

ALTER TABLE tenant_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_transactions_access ON tenant_transactions;
CREATE POLICY tenant_transactions_access ON tenant_transactions FOR ALL USING (true);
