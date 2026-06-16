-- 198 — JOURNAL D'AUDIT (finance / RH / actionnaires). Trace qui consulte/modifie les données
-- sensibles (info bancaire actionnaire, salaires, dividendes, cap table). Écrit/lu UNIQUEMENT côté
-- serveur (service_role). Idempotent.
CREATE TABLE IF NOT EXISTS public.audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL,
  actor_id     UUID,            -- utilisateur ayant fait l'action (users.id)
  actor_email  TEXT,
  action       TEXT NOT NULL,   -- reveal_banking | update_banking | declare_dividend | pay_dividend | ...
  entity_type  TEXT NOT NULL,   -- shareholder_banking | dividend | share_txn | salary | ...
  entity_id    TEXT,
  summary      TEXT,
  meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip           TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_date ON public.audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_entity ON public.audit_log(tenant_id, entity_type);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audit_log FROM anon, authenticated;

insert into schema_migrations (version) values ('198') on conflict (version) do nothing;
