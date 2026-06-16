-- 197 — ACTIONNAIRES & DIVIDENDES + comptes GL pour EBITDA/CAPEX (#32).
-- Confidentialité : l'information BANCAIRE des actionnaires est dans une table séparée,
-- 100 % serveur (REVOKE ALL anon/authenticated), au même titre que les salaires (cf. 145/147).
-- Idempotent (IF NOT EXISTS / ON CONFLICT).

-- ── 1. Registre des actionnaires (profil — non bancaire) ──
CREATE TABLE IF NOT EXISTS public.shareholders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  full_name    TEXT NOT NULL,
  email        TEXT,                       -- courriel PERSONNEL (avis de dividende)
  phone        TEXT,
  address      TEXT,
  holder_type  TEXT NOT NULL DEFAULT 'individual', -- individual | corporation | trust
  tax_id       TEXT,                       -- NAS / n° entreprise (sensible)
  is_active    BOOLEAN NOT NULL DEFAULT true,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shareholders_tenant ON public.shareholders(tenant_id);

-- ── 2. Coordonnées BANCAIRES de versement des dividendes (CONFIDENTIEL — table isolée) ──
CREATE TABLE IF NOT EXISTS public.shareholder_banking (
  shareholder_id   UUID PRIMARY KEY REFERENCES public.shareholders(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  payment_method   TEXT NOT NULL DEFAULT 'eft',   -- eft (virement) | cheque | other
  bank_institution TEXT,   -- n° institution (3)
  bank_transit     TEXT,   -- n° transit/succursale (5)
  bank_account     TEXT,   -- n° compte
  iban             TEXT,
  swift            TEXT,
  account_holder   TEXT,   -- titulaire du compte
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Catégories d'actions (cap table) ──
CREATE TABLE IF NOT EXISTS public.share_classes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,                 -- ex. « Catégorie A — votantes »
  votes_per_share  NUMERIC(12,4) NOT NULL DEFAULT 1,
  is_voting        BOOLEAN NOT NULL DEFAULT true,
  par_value        NUMERIC(14,4) NOT NULL DEFAULT 0,
  liquidation_pref NUMERIC(14,4) NOT NULL DEFAULT 0,
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_share_classes_tenant ON public.share_classes(tenant_id);

-- ── 4. Mouvements d'actions (émission / transfert / rachat) → la détention = somme cumulée ──
CREATE TABLE IF NOT EXISTS public.share_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  shareholder_id  UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  share_class_id  UUID REFERENCES public.share_classes(id) ON DELETE SET NULL,
  txn_date        DATE NOT NULL,
  txn_type        TEXT NOT NULL DEFAULT 'issuance', -- issuance | transfer_in | transfer_out | buyback
  shares          NUMERIC(18,4) NOT NULL,           -- variation (+ émission/entrée, − sortie/rachat)
  price_per_share NUMERIC(14,4) NOT NULL DEFAULT 0,
  amount          NUMERIC(16,2) NOT NULL DEFAULT 0, -- apport en capital (espèces) lié au mouvement
  gl_entry_id     UUID,                             -- écriture d'apport au capital (si espèces)
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_share_txn_tenant ON public.share_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_share_txn_holder ON public.share_transactions(shareholder_id);

-- ── 5. Déclarations de dividendes ──
CREATE TABLE IF NOT EXISTS public.dividend_declarations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  declaration_date DATE NOT NULL,
  record_date      DATE,                  -- date de clôture des registres
  payment_date     DATE,
  share_class_id   UUID REFERENCES public.share_classes(id) ON DELETE SET NULL, -- null = toutes catégories
  dividend_type    TEXT NOT NULL DEFAULT 'eligible', -- eligible | non_eligible | capital (fiscalité)
  total_amount     NUMERIC(16,2) NOT NULL DEFAULT 0,
  per_share        NUMERIC(16,8) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'declared',  -- declared | paid | cancelled
  gl_entry_id      UUID,                  -- écriture de déclaration (DR 3300 / CR 2350)
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_div_decl_tenant ON public.dividend_declarations(tenant_id);

-- ── 6. Versements de dividendes par actionnaire ──
CREATE TABLE IF NOT EXISTS public.dividend_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  declaration_id  UUID NOT NULL REFERENCES public.dividend_declarations(id) ON DELETE CASCADE,
  shareholder_id  UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  shares          NUMERIC(18,4) NOT NULL DEFAULT 0,
  amount          NUMERIC(16,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending',   -- pending | paid
  paid_date       DATE,
  gl_entry_id     UUID,                  -- écriture du versement (DR 2350 / CR 1000)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_div_pay_tenant ON public.dividend_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_div_pay_decl   ON public.dividend_payments(declaration_id);

-- ── 7. Nouveaux comptes GL (capitaux propres + dividendes + isolation EBITDA) ──
-- Back-fill pour TOUS les tenants ayant déjà un plan comptable (085).
INSERT INTO public.gl_accounts (tenant_id, code, name, type, normal_balance, is_system)
SELECT DISTINCT tenant_id, v.code, v.name, v.type, v.nb, true
FROM public.gl_accounts g
CROSS JOIN (VALUES
  ('2350','Dividendes à payer','liability','credit'),
  ('3100','Capital-actions','equity','credit'),
  ('3200','Bénéfices non répartis','equity','credit'),
  ('3300','Dividendes déclarés','equity','debit'),
  ('5600','Amortissement','expense','debit'),
  ('5700','Intérêts et frais financiers','expense','debit'),
  ('5800','Impôts sur le résultat','expense','debit')
) AS v(code,name,type,nb)
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Et pour les FUTURS tenants : on enrichit la fonction de seed (réplique 085 + nouveaux comptes).
CREATE OR REPLACE FUNCTION add_equity_ebitda_accounts(p_tenant TEXT) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.gl_accounts (tenant_id, code, name, type, normal_balance, is_system) VALUES
    (p_tenant,'2350','Dividendes à payer','liability','credit',true),
    (p_tenant,'3100','Capital-actions','equity','credit',true),
    (p_tenant,'3200','Bénéfices non répartis','equity','credit',true),
    (p_tenant,'3300','Dividendes déclarés','equity','debit',true),
    (p_tenant,'5600','Amortissement','expense','debit',true),
    (p_tenant,'5700','Intérêts et frais financiers','expense','debit',true),
    (p_tenant,'5800','Impôts sur le résultat','expense','debit',true)
  ON CONFLICT (tenant_id, code) DO NOTHING;
END; $$ LANGUAGE plpgsql;

-- ── 8. RLS + verrouillage (100 % serveur via service_role) ──
ALTER TABLE public.shareholders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareholder_banking   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_payments     ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.shareholders          FROM anon, authenticated;
REVOKE ALL ON public.shareholder_banking   FROM anon, authenticated;
REVOKE ALL ON public.share_classes         FROM anon, authenticated;
REVOKE ALL ON public.share_transactions    FROM anon, authenticated;
REVOKE ALL ON public.dividend_declarations FROM anon, authenticated;
REVOKE ALL ON public.dividend_payments     FROM anon, authenticated;

insert into schema_migrations (version) values ('197') on conflict (version) do nothing;
