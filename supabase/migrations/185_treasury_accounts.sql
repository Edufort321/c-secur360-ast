-- 185: COMPTES DE TRÉSORERIE du tenant (banque, carte de crédit de compagnie, caisse), reliés au
-- grand livre. Chaque compte de trésorerie = UN compte GL dédié (suivi du solde PAR compte). On les
-- assigne aux transactions pour poster au BON compte (achat sur carte -> passif carte ; sortie banque
-- -> actif banque). Idempotent.

CREATE TABLE IF NOT EXISTS treasury_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL,
  name          text NOT NULL,
  kind          text NOT NULL DEFAULT 'bank' CHECK (kind IN ('bank', 'credit_card', 'cash')),
  gl_account_id uuid REFERENCES gl_accounts(id),
  last4         text,                                   -- 4 derniers chiffres (carte/compte), affichage
  institution   text,                                   -- banque / émetteur
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS treasury_accounts_tenant_idx ON treasury_accounts(tenant_id);

-- Compte de trésorerie assigné à une transaction (moyen de paiement réel).
ALTER TABLE commerce_transactions ADD COLUMN IF NOT EXISTS treasury_account_id uuid;

ALTER TABLE treasury_accounts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'treasury_accounts' AND policyname = 'treasury_accounts_all') THEN
    CREATE POLICY treasury_accounts_all ON treasury_accounts FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

insert into schema_migrations (version) values ('185') on conflict (version) do nothing;
