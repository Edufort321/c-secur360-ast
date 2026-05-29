-- 085: Socle comptable — partie double, plan comptable, journaux, taxes canadiennes, périodes
-- Base du module « Comptabilité / Grand livre » (rapports fiscaux, audit, conformité ARC/Revenu Québec).
-- Exécuter dans le SQL Editor de Supabase Dashboard.
-- Conçu multi-juridiction (toutes provinces) et multi-type d'entreprise.

-- ── 1. PLAN COMPTABLE (chart of accounts) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  code           TEXT NOT NULL,                       -- ex. '1000', '4000', '5100'
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  parent_id      UUID REFERENCES gl_accounts(id) ON DELETE SET NULL,
  normal_balance TEXT NOT NULL DEFAULT 'debit' CHECK (normal_balance IN ('debit','credit')),
  is_active      BOOLEAN DEFAULT TRUE,
  is_system      BOOLEAN DEFAULT FALSE,               -- comptes du plan par défaut (non supprimables côté UI)
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS gl_accounts_tenant_idx ON gl_accounts (tenant_id, type, code);

-- ── 2. JOURNAUX (ventes, achats, paie, banque, opérations diverses) ─────────
CREATE TABLE IF NOT EXISTS gl_journals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  code        TEXT NOT NULL,                          -- 'VEN' | 'ACH' | 'PAY' | 'BNK' | 'OD'
  name        TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  UNIQUE (tenant_id, code)
);

-- ── 3. PÉRIODES COMPTABLES (clôture = écriture interdite) ────────────────────
CREATE TABLE IF NOT EXISTS gl_periods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  name        TEXT NOT NULL,                          -- ex. '2026' ou '2026-05'
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  closed_at   TIMESTAMPTZ,
  UNIQUE (tenant_id, name)
);

-- ── 4. CODES DE TAXE (TPS/TVH/TVQ/PST/RST par juridiction) ──────────────────
CREATE TABLE IF NOT EXISTS gl_tax_codes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT NOT NULL,
  code                TEXT NOT NULL,                  -- 'GST','HST_ON','QST','PST_BC'...
  name                TEXT NOT NULL,
  jurisdiction        TEXT,                           -- 'CA','QC','ON','BC','MB','SK', ...
  rate                NUMERIC(7,5) NOT NULL DEFAULT 0,-- ex. 0.05000, 0.09975, 0.13000
  account_collected_id UUID REFERENCES gl_accounts(id) ON DELETE SET NULL, -- taxe perçue (passif)
  account_paid_id      UUID REFERENCES gl_accounts(id) ON DELETE SET NULL, -- CTI/RTI récupérable (actif)
  is_recoverable      BOOLEAN DEFAULT TRUE,
  active              BOOLEAN DEFAULT TRUE,
  UNIQUE (tenant_id, code)
);

-- ── 5. ÉCRITURES (journal entries) — en-tête ────────────────────────────────
CREATE TABLE IF NOT EXISTS gl_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  entry_number     TEXT,                              -- n° séquentiel (attribué à la validation)
  journal_id       UUID REFERENCES gl_journals(id) ON DELETE SET NULL,
  period_id        UUID REFERENCES gl_periods(id) ON DELETE SET NULL,
  entry_date       DATE NOT NULL,
  description      TEXT,
  reference        TEXT,                              -- n° facture / feuille de temps / pièce
  source_type      TEXT,                              -- 'manual'|'invoice'|'timesheet'|'transaction'|'vehicle'|'reversal'
  source_id        UUID,
  posted           BOOLEAN DEFAULT FALSE,             -- validée (immuable une fois TRUE)
  reversed_by_id   UUID REFERENCES gl_entries(id) ON DELETE SET NULL, -- écriture de contre-passation
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gl_entries_tenant_idx ON gl_entries (tenant_id, entry_date, posted);

-- ── 6. LIGNES D'ÉCRITURE (postings) — débit/crédit ──────────────────────────
CREATE TABLE IF NOT EXISTS gl_lines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  entry_id    UUID NOT NULL REFERENCES gl_entries(id) ON DELETE CASCADE,
  account_id  UUID NOT NULL REFERENCES gl_accounts(id) ON DELETE RESTRICT,
  debit       NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (debit  >= 0),
  credit      NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  tax_code_id UUID REFERENCES gl_tax_codes(id) ON DELETE SET NULL,
  partner_type TEXT,                                  -- 'client'|'vendor'|'employee'
  partner_id  TEXT,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  CHECK (NOT (debit > 0 AND credit > 0))              -- une ligne = débit OU crédit
);
CREATE INDEX IF NOT EXISTS gl_lines_entry_idx ON gl_lines (entry_id);
CREATE INDEX IF NOT EXISTS gl_lines_account_idx ON gl_lines (tenant_id, account_id);

-- ── 7. CONTRÔLE D'ÉQUILIBRE : Σdébits = Σcrédits à la validation (posted) ────
CREATE OR REPLACE FUNCTION gl_check_balanced() RETURNS TRIGGER AS $$
DECLARE
  v_debit  NUMERIC(14,2);
  v_credit NUMERIC(14,2);
BEGIN
  IF NEW.posted IS TRUE THEN
    SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0)
      INTO v_debit, v_credit FROM gl_lines WHERE entry_id = NEW.id;
    IF v_debit <> v_credit THEN
      RAISE EXCEPTION 'Écriture déséquilibrée: débits % ≠ crédits %', v_debit, v_credit;
    END IF;
    IF v_debit = 0 THEN
      RAISE EXCEPTION 'Écriture vide: aucune ligne à valider';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gl_entries_balance_check ON gl_entries;
CREATE TRIGGER gl_entries_balance_check
  BEFORE INSERT OR UPDATE ON gl_entries
  FOR EACH ROW EXECUTE FUNCTION gl_check_balanced();

-- ── 8. IMMUABILITÉ : interdire la modification d'une écriture déjà validée ───
CREATE OR REPLACE FUNCTION gl_protect_posted() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.posted IS TRUE AND TG_OP = 'UPDATE'
     AND (NEW.posted IS DISTINCT FROM OLD.posted
          OR NEW.entry_date IS DISTINCT FROM OLD.entry_date
          OR NEW.journal_id IS DISTINCT FROM OLD.journal_id) THEN
    -- on autorise seulement le marquage reversed_by_id (contre-passation)
    IF NEW.reversed_by_id IS NOT DISTINCT FROM OLD.reversed_by_id THEN
      RAISE EXCEPTION 'Écriture validée immuable: utilisez une contre-passation (reversal)';
    END IF;
  END IF;
  IF OLD.posted IS TRUE AND TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Écriture validée non supprimable: utilisez une contre-passation (reversal)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gl_entries_protect ON gl_entries;
CREATE TRIGGER gl_entries_protect
  BEFORE UPDATE OR DELETE ON gl_entries
  FOR EACH ROW EXECUTE FUNCTION gl_protect_posted();

-- ── 9. RLS (permissive comme le reste du projet ; isolation par tenant_id applicative) ──
ALTER TABLE gl_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_journals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_periods   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_tax_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_lines     ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gl_accounts_access  ON gl_accounts;  CREATE POLICY gl_accounts_access  ON gl_accounts  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS gl_journals_access  ON gl_journals;  CREATE POLICY gl_journals_access  ON gl_journals  FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS gl_periods_access   ON gl_periods;   CREATE POLICY gl_periods_access   ON gl_periods   FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS gl_tax_codes_access ON gl_tax_codes; CREATE POLICY gl_tax_codes_access ON gl_tax_codes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS gl_entries_access   ON gl_entries;   CREATE POLICY gl_entries_access   ON gl_entries   FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS gl_lines_access     ON gl_lines;     CREATE POLICY gl_lines_access     ON gl_lines     FOR ALL USING (true) WITH CHECK (true);

-- ── 10. SEED : plan comptable + journaux + taxes par défaut pour un tenant ──
-- Idempotent (ON CONFLICT DO NOTHING). À appeler par l'app à l'activation du module:
--   SELECT seed_accounting_defaults('mon_tenant');
CREATE OR REPLACE FUNCTION seed_accounting_defaults(p_tenant TEXT) RETURNS VOID AS $$
BEGIN
  -- Plan comptable PME canadienne (normal_balance: actif/charge=debit, passif/capitaux/produit=credit)
  INSERT INTO gl_accounts (tenant_id, code, name, type, normal_balance, is_system) VALUES
    (p_tenant,'1000','Encaisse / Banque','asset','debit',true),
    (p_tenant,'1100','Clients (comptes à recevoir)','asset','debit',true),
    (p_tenant,'1200','TPS/TVH à récupérer (CTI)','asset','debit',true),
    (p_tenant,'1210','TVQ à récupérer (RTI)','asset','debit',true),
    (p_tenant,'1300','Stocks / Inventaire','asset','debit',true),
    (p_tenant,'1500','Immobilisations (véhicules, équipement)','asset','debit',true),
    (p_tenant,'2000','Fournisseurs (comptes à payer)','liability','credit',true),
    (p_tenant,'2100','TPS/TVH à payer','liability','credit',true),
    (p_tenant,'2110','TVQ à payer','liability','credit',true),
    (p_tenant,'2200','Retenues à la source à remettre — fédéral (RPC/AE/impôt)','liability','credit',true),
    (p_tenant,'2210','Retenues à la source à remettre — Québec (RRQ/RQAP/impôt/FSS)','liability','credit',true),
    (p_tenant,'2300','Salaires à payer','liability','credit',true),
    (p_tenant,'3000','Capital / Bénéfices non répartis','equity','credit',true),
    (p_tenant,'4000','Produits — Ventes et services','revenue','credit',true),
    (p_tenant,'4100','Produits — Autres','revenue','credit',true),
    (p_tenant,'5000','Salaires et avantages','expense','debit',true),
    (p_tenant,'5050','Commissions sur ventes','expense','debit',true),
    (p_tenant,'5100','Charges sociales employeur','expense','debit',true),
    (p_tenant,'5200','Frais de véhicules','expense','debit',true),
    (p_tenant,'5300','Fournitures et matériel','expense','debit',true),
    (p_tenant,'5900','Frais administratifs','expense','debit',true)
  ON CONFLICT (tenant_id, code) DO NOTHING;

  -- Journaux
  INSERT INTO gl_journals (tenant_id, code, name) VALUES
    (p_tenant,'VEN','Journal des ventes'),
    (p_tenant,'ACH','Journal des achats'),
    (p_tenant,'PAY','Journal de paie'),
    (p_tenant,'BNK','Journal de banque'),
    (p_tenant,'OD','Opérations diverses')
  ON CONFLICT (tenant_id, code) DO NOTHING;

  -- Codes de taxe par juridiction (taux 2026)
  INSERT INTO gl_tax_codes (tenant_id, code, name, jurisdiction, rate) VALUES
    (p_tenant,'GST','TPS 5 %','CA',0.05000),
    (p_tenant,'QST','TVQ 9,975 %','QC',0.09975),
    (p_tenant,'HST_ON','TVH Ontario 13 %','ON',0.13000),
    (p_tenant,'HST_NS','TVH Nouvelle-Écosse 14 %','NS',0.14000),
    (p_tenant,'HST_NB','TVH N.-B./T.-N.-L./Î.-P.-É. 15 %','NB',0.15000),
    (p_tenant,'PST_BC','PST C.-B. 7 %','BC',0.07000),
    (p_tenant,'PST_SK','PST Saskatchewan 6 %','SK',0.06000),
    (p_tenant,'RST_MB','RST Manitoba 7 %','MB',0.07000)
  ON CONFLICT (tenant_id, code) DO NOTHING;

  -- Lier les comptes de taxe TPS/TVQ (perçu / récupérable)
  UPDATE gl_tax_codes t SET
    account_collected_id = (SELECT id FROM gl_accounts WHERE tenant_id=p_tenant AND code='2100'),
    account_paid_id      = (SELECT id FROM gl_accounts WHERE tenant_id=p_tenant AND code='1200')
    WHERE t.tenant_id=p_tenant AND t.code='GST';
  UPDATE gl_tax_codes t SET
    account_collected_id = (SELECT id FROM gl_accounts WHERE tenant_id=p_tenant AND code='2110'),
    account_paid_id      = (SELECT id FROM gl_accounts WHERE tenant_id=p_tenant AND code='1210')
    WHERE t.tenant_id=p_tenant AND t.code='QST';
END;
$$ LANGUAGE plpgsql;
