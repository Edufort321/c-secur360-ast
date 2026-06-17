-- 208 — Connexion bancaire temps réel (agrégateur Flinks). Stocke la connexion (LoginId) d'un tenant
-- et l'identifiant d'opération externe pour dédoublonner les synchros. Idempotent.
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           TEXT NOT NULL,
  provider            TEXT NOT NULL DEFAULT 'flinks',
  login_id            TEXT NOT NULL,                 -- jeton de connexion de l'agrégateur (pas d'identifiants bancaires)
  institution         TEXT,
  account_mask        TEXT,
  treasury_account_id UUID,                          -- compte de trésorerie cible des opérations synchronisées
  status              TEXT NOT NULL DEFAULT 'active', -- active | error
  last_sync_at        TIMESTAMPTZ,
  last_error          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bankconn_tenant ON public.bank_connections(tenant_id, status);

-- Dédoublonnage des opérations synchronisées (identifiant fourni par l'agrégateur ou empreinte).
ALTER TABLE public.bank_statement_lines ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.bank_statement_lines ADD COLUMN IF NOT EXISTS treasury_account_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bankline_external ON public.bank_statement_lines(tenant_id, external_id) WHERE external_id IS NOT NULL;

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bank_connections FROM anon, authenticated; -- 100 % serveur (jeton sensible)

insert into schema_migrations (version) values ('208') on conflict (version) do nothing;
