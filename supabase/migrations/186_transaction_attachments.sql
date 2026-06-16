-- 186: PIÈCES JOINTES MULTIPLES par transaction (reçus, factures, justificatifs). En plus du reçu
-- principal (commerce_transactions.receipt_url), une transaction peut porter PLUSIEURS documents.
-- Le comptable y accède via file_url (exports CSV). Idempotent.

CREATE TABLE IF NOT EXISTS transaction_attachments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      text NOT NULL,
  transaction_id uuid NOT NULL,
  file_name      text NOT NULL,
  file_url       text NOT NULL,
  file_type      text,
  file_size      bigint,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transaction_attachments_txn_idx ON transaction_attachments(transaction_id);
CREATE INDEX IF NOT EXISTS transaction_attachments_tenant_idx ON transaction_attachments(tenant_id);

ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_attachments' AND policyname = 'transaction_attachments_all') THEN
    CREATE POLICY transaction_attachments_all ON transaction_attachments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

insert into schema_migrations (version) values ('186') on conflict (version) do nothing;
