-- 199 — ALERTES & NOTIFICATIONS (#36). Règles de seuils financiers + notifications in-app.
-- Livraison multi-canal (in-app / courriel / SMS). Servies/écrites via routes serveur (service_role).
-- Idempotent.

-- Notifications in-app (par utilisateur ; user_id NULL = diffusion à tout le tenant).
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   TEXT NOT NULL,
  user_id     UUID,                 -- destinataire ; NULL = tous (broadcast tenant)
  title       TEXT NOT NULL,
  body        TEXT,
  severity    TEXT NOT NULL DEFAULT 'info',   -- info | warning | critical
  category    TEXT,                 -- finance | facture | rh | systeme | ...
  link        TEXT,                 -- lien d'action (ex. /tenant/admin?tab=etat-financier)
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_tenant_user ON public.notifications(tenant_id, user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notif_tenant_date ON public.notifications(tenant_id, created_at DESC);

-- Règles d'alerte (seuils). channels = sous-ensemble de {in_app, email, sms}.
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  metric          TEXT NOT NULL,    -- cash_below | margin_pct_below | ar_overdue_above | ebitda_below | altman_below
  threshold       NUMERIC(16,4) NOT NULL DEFAULT 0,
  channels        TEXT[] NOT NULL DEFAULT ARRAY['in_app']::text[],
  recipient_email TEXT,
  recipient_phone TEXT,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  last_fired_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alert_rules_tenant ON public.alert_rules(tenant_id, enabled);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules   ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notifications FROM anon, authenticated;
REVOKE ALL ON public.alert_rules   FROM anon, authenticated;

insert into schema_migrations (version) values ('199') on conflict (version) do nothing;
