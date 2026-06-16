-- 204 — ABONNEMENTS RÉCURRENTS (#35) : un tenant facture ses clients de façon récurrente
-- (contrats mensuels/annuels). Source du MRR/ARR. Génère des factures à l'échéance (cron).
-- Table opérationnelle (scoping applicatif par tenant_id, comme commerce_invoices). Idempotent.
CREATE TABLE IF NOT EXISTS public.recurring_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         TEXT NOT NULL,
  client_name       TEXT NOT NULL,
  client_id         UUID,
  plan_name         TEXT NOT NULL DEFAULT 'Abonnement',
  amount            NUMERIC(14,2) NOT NULL DEFAULT 0,   -- montant par période (avant taxes)
  interval          TEXT NOT NULL DEFAULT 'monthly',    -- monthly | annual
  province          TEXT,                               -- pour le calcul de taxes à la facturation
  status            TEXT NOT NULL DEFAULT 'active',      -- active | paused | cancelled
  start_date        DATE NOT NULL DEFAULT (now()::date),
  next_billing_date DATE,
  billing_count     INTEGER NOT NULL DEFAULT 0,
  auto_invoice      BOOLEAN NOT NULL DEFAULT true,       -- génère une facture automatiquement à l'échéance
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recsub_tenant ON public.recurring_subscriptions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_recsub_due    ON public.recurring_subscriptions(next_billing_date);

ALTER TABLE public.recurring_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recsub_access ON public.recurring_subscriptions;
CREATE POLICY recsub_access ON public.recurring_subscriptions FOR ALL USING (true) WITH CHECK (true);

insert into schema_migrations (version) values ('204') on conflict (version) do nothing;
