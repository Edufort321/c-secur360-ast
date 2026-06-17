-- 210 — BUDGET ANNUEL par compte (#41). Permet de comparer le budget au réel (grand livre) par
-- poste/catégorie, avec écarts. Une ligne = un compte GL × une année. Idempotent.
CREATE TABLE IF NOT EXISTS public.annual_budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  year         INTEGER NOT NULL,
  account_code TEXT NOT NULL,             -- code du compte GL (ex. 4000, 5300)
  amount       NUMERIC(16,2) NOT NULL DEFAULT 0,  -- budget annuel (sens normal du compte)
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_budget_line ON public.annual_budgets(tenant_id, year, account_code);
CREATE INDEX IF NOT EXISTS idx_budget_tenant_year ON public.annual_budgets(tenant_id, year);

ALTER TABLE public.annual_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS budget_access ON public.annual_budgets;
CREATE POLICY budget_access ON public.annual_budgets FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('210') on conflict (version) do nothing;
