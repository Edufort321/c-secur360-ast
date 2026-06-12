-- 164 — Module MARKETING : persistance conforme (LCAP / Loi 25).
-- Données personnelles (courriels = renseignements personnels Loi 25) -> RLS activée, AUCUNE policy
-- permissive : l'accès se fait UNIQUEMENT par routes serveur (service_role), jamais par la clé anon.
-- Obligations légales couvertes : registre de consentement, registre de désabonnement (à honorer
-- sous 10 j), instantané de consentement par envoi (preuve conservée ~36 mois).

-- Prospects + CONSENTEMENT (preuve LCAP).
CREATE TABLE IF NOT EXISTS public.marketing_prospects (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          text NOT NULL,
  company            text,
  email              text NOT NULL,
  segment            text,
  consent_type       text NOT NULL DEFAULT 'none',   -- express | tacit | none
  consent_source     text,                            -- origine (formulaire, relation d'affaires, salon…)
  consent_at         timestamptz,                     -- date du consentement
  consent_expires_at timestamptz,                     -- tacite : 24 mois
  score              int  NOT NULL DEFAULT 0,
  status             text NOT NULL DEFAULT 'active',  -- active | unsubscribed | blocked | bounced
  enriched           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- Registre des désabonnements / plaintes (preuve ; exclusion automatique des envois).
CREATE TABLE IF NOT EXISTS public.marketing_unsubscribes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  email       text NOT NULL,
  reason      text,                                   -- unsubscribe | complaint | bounce
  source      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- Campagnes (module/segment/angle/séquence + contenu IA + validation humaine = conformité).
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      text NOT NULL,
  name           text,
  channel        text NOT NULL DEFAULT 'email',       -- email | video
  module         text,
  segment        text,
  angle          text,
  sequence       jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{day:0},{day:4},{day:9}]
  content        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- objets A/B, corps, footer (généré IA)
  min_score      int  NOT NULL DEFAULT 0,
  status         text NOT NULL DEFAULT 'draft',       -- draft | approved | scheduled | sent | paused
  compliance_ack jsonb NOT NULL DEFAULT '{}'::jsonb,  -- 4 conditions cochées + qui/quand
  approved_by    text,
  approved_at    timestamptz,
  created_by     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Journal d'envoi avec INSTANTANÉ DE CONSENTEMENT figé (preuve LCAP, conserver ~36 mois).
CREATE TABLE IF NOT EXISTS public.marketing_sends (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text NOT NULL,
  campaign_id     uuid,
  prospect_id     uuid,
  email           text NOT NULL,
  consent_type    text,                               -- figés au moment de l'envoi
  consent_source  text,
  consent_at      timestamptz,
  step            int  NOT NULL DEFAULT 0,
  subject         text,
  status          text NOT NULL DEFAULT 'queued',     -- queued | sent | opened | replied | bounced | suppressed
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Actifs générés (scripts / vidéos) — métadonnées.
CREATE TABLE IF NOT EXISTS public.marketing_assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  kind        text NOT NULL,                          -- script | video
  module      text,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,     -- scènes, warnings, durée…
  status      text NOT NULL DEFAULT 'draft',
  created_by  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mkt_prospects_tenant ON public.marketing_prospects (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_mkt_unsub_tenant      ON public.marketing_unsubscribes (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_mkt_campaigns_tenant  ON public.marketing_campaigns (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_mkt_sends_campaign    ON public.marketing_sends (tenant_id, campaign_id);

-- Sécurité Loi 25 : RLS ON, aucune policy permissive -> la clé anon ne lit/écrit RIEN.
-- Tout passe par les routes serveur (service_role, protégées requireAdmin).
ALTER TABLE public.marketing_prospects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_sends        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets       ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.marketing_prospects, public.marketing_unsubscribes, public.marketing_campaigns,
  public.marketing_sends, public.marketing_assets FROM anon;

NOTIFY pgrst, 'reload schema';
