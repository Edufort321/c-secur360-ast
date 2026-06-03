-- 123: rapprochement bancaire (#35 controle bancaire).
-- Lignes de releve bancaire importees (CSV), rapprochees aux transactions (commerce_transactions).
-- amount : signe = + credit (entree) / - debit (sortie), tel qu'au releve.
-- (n° 120 reserve affiliation, 121 incidents, 122 txn_type ; on prend 123.)
CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              TEXT NOT NULL,
  stmt_date              DATE,
  description            TEXT DEFAULT '',
  amount                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  matched_transaction_id UUID,                       -- commerce_transactions.id si rapprochee
  reconciled             BOOLEAN NOT NULL DEFAULT FALSE,
  imported_at            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bank_statement_lines_idx ON bank_statement_lines (tenant_id, stmt_date);

ALTER TABLE bank_statement_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bank_statement_lines_access ON bank_statement_lines;
CREATE POLICY bank_statement_lines_access ON bank_statement_lines FOR ALL USING (TRUE) WITH CHECK (TRUE);
