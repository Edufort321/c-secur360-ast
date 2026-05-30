-- 087: Module « Transactions » — depenses / achats fournisseurs
-- Saisie d'une depense (achat de biens ou services) avec ventilation par compte de charge,
-- taxes recuperables (CTI/RTI), piece jointe (recu) et ecriture d'achat -> grand livre (085).
-- Achat = DR charges + DR 1200 CTI (TPS) + DR 1210 RTI (TVQ) , CR 1000 banque (comptant) ou 2000 fournisseurs (a credit).
-- Executer dans le SQL Editor de Supabase Dashboard.

-- ── En-tete de transaction (depense / achat) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS commerce_transactions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          TEXT NOT NULL,
  transaction_number TEXT,                              -- n° sequentiel ex. 'A-2026-001'
  vendor_id          UUID,                              -- reference souple a un fournisseur
  vendor_name        TEXT,                              -- nom du fournisseur (snapshot)
  txn_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  province           TEXT DEFAULT 'QC',                 -- juridiction fiscale appliquee
  payment_method     TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','on_account')),
  status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','paid','cancelled')),
  subtotal           NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_rate           NUMERIC(7,5) DEFAULT 0,
  qst_rate           NUMERIC(7,5) DEFAULT 0,
  pst_rate           NUMERIC(7,5) DEFAULT 0,            -- TVH/PST/RST hors Quebec
  gst_amount         NUMERIC(14,2) DEFAULT 0,           -- TPS payee (recuperable -> 1200 CTI)
  qst_amount         NUMERIC(14,2) DEFAULT 0,           -- TVQ payee (recuperable -> 1210 RTI)
  pst_amount         NUMERIC(14,2) DEFAULT 0,           -- PST/RST non recuperable (capitalisee en charge)
  total              NUMERIC(14,2) NOT NULL DEFAULT 0,
  receipt_url        TEXT,                              -- piece jointe (recu) — Storage ou data URL
  notes              TEXT,
  gl_entry_id        UUID,                              -- ecriture d'achat liee (gl_entries.id)
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, transaction_number)
);
CREATE INDEX IF NOT EXISTS commerce_transactions_tenant_idx ON commerce_transactions (tenant_id, status, txn_date);

-- ── Lignes de transaction (ventilation par compte de charge) ─────────────────
CREATE TABLE IF NOT EXISTS commerce_transaction_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  transaction_id UUID NOT NULL REFERENCES commerce_transactions(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  account_code   TEXT NOT NULL DEFAULT '5300',          -- compte de charge (gl_accounts.code)
  amount         NUMERIC(14,2) NOT NULL DEFAULT 0,       -- montant net (hors taxes)
  taxable        BOOLEAN DEFAULT TRUE,
  sort_order     INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS commerce_transaction_items_idx ON commerce_transaction_items (transaction_id);

-- ── RLS (permissive, isolation applicative par tenant_id, comme le reste du projet) ──
ALTER TABLE commerce_transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_transaction_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS commerce_transactions_access      ON commerce_transactions;      CREATE POLICY commerce_transactions_access      ON commerce_transactions      FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS commerce_transaction_items_access ON commerce_transaction_items; CREATE POLICY commerce_transaction_items_access ON commerce_transaction_items FOR ALL USING (true) WITH CHECK (true);

-- ── Bucket de stockage pour les recus (pieces jointes) ───────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('transaction-receipts', 'transaction-receipts', true)
  ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS transaction_receipts_access ON storage.objects;
CREATE POLICY transaction_receipts_access ON storage.objects FOR ALL
  USING (bucket_id = 'transaction-receipts') WITH CHECK (bucket_id = 'transaction-receipts');
