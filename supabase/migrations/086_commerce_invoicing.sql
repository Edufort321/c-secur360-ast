-- 086: Module « Facture de commerce » — facturation générique tout type d'entreprise
-- Multi-province (TPS/TVH/TVQ/PST), numérotation séquentielle, lien vers le grand livre (085).
-- Exécuter dans le SQL Editor de Supabase Dashboard.

-- ── Paramètres de l'entreprise (émetteur des factures) — un enregistrement par tenant ──
CREATE TABLE IF NOT EXISTS company_settings (
  tenant_id     TEXT PRIMARY KEY,
  legal_name    TEXT,
  address       TEXT,
  city          TEXT,
  province      TEXT DEFAULT 'QC',
  postal_code   TEXT,
  country       TEXT DEFAULT 'Canada',
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  gst_number    TEXT,                                -- n° TPS/TVH (ex. 123456789 RT0001)
  qst_number    TEXT,                                -- n° TVQ (ex. TVQ 1234567890 TQ0001)
  bank_details  TEXT,                                -- coordonnées de paiement / Interac
  invoice_prefix TEXT DEFAULT 'F',                   -- préfixe du n° de facture
  default_terms  TEXT DEFAULT '30 jours',
  logo_url      TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Factures ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commerce_invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  client_id      UUID,                               -- référence souple à clients(id)
  client_snapshot JSONB,                             -- snapshot du client au moment de l'émission
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE,
  province       TEXT DEFAULT 'QC',                  -- juridiction fiscale appliquée
  subtotal       NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_rate       NUMERIC(7,5) DEFAULT 0,
  qst_rate       NUMERIC(7,5) DEFAULT 0,
  pst_rate       NUMERIC(7,5) DEFAULT 0,             -- TVH/PST/RST hors Québec (taxe unique)
  gst_amount     NUMERIC(14,2) DEFAULT 0,
  qst_amount     NUMERIC(14,2) DEFAULT 0,
  pst_amount     NUMERIC(14,2) DEFAULT 0,
  total          NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  payment_terms  TEXT,
  gl_entry_id    UUID,                               -- écriture de vente liée (gl_entries.id)
  paid_date      DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS commerce_invoices_tenant_idx ON commerce_invoices (tenant_id, status, issue_date);

-- ── Lignes de facture ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commerce_invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  invoice_id  UUID NOT NULL REFERENCES commerce_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(14,2) NOT NULL DEFAULT 0,
  subtotal    NUMERIC(14,2) NOT NULL DEFAULT 0,
  taxable     BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS commerce_invoice_items_idx ON commerce_invoice_items (invoice_id);

-- ── RLS (permissive, isolation applicative par tenant_id, comme le reste du projet) ──
ALTER TABLE company_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerce_invoice_items  ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS company_settings_access       ON company_settings;       CREATE POLICY company_settings_access       ON company_settings       FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS commerce_invoices_access      ON commerce_invoices;      CREATE POLICY commerce_invoices_access      ON commerce_invoices      FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS commerce_invoice_items_access ON commerce_invoice_items; CREATE POLICY commerce_invoice_items_access ON commerce_invoice_items FOR ALL USING (true) WITH CHECK (true);
