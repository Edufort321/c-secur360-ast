-- 153 — Import DGA par courriel (Phase 1) + temps reel sur les tables DGA.
-- (1) dga_inbound        : config d'import par courriel PAR TENANT (adresse dediee, liste blanche
--                          d'expediteurs, activation, auto-creation des transformateurs).
-- (2) dga_inbound_log    : journal d'audit des courriels recus (recu / importe / rejete / erreur).
-- (3) Publication temps reel des tables dga_dossiers + dga_measures : la page DGA s'y abonne deja
--     (postgres_changes) -> un import par courriel (ecrit cote serveur en service_role) apparait
--     alors EN DIRECT dans l'app ouverte, sans rechargement.
--
-- Securite / Loi 25 : dga_inbound et dga_inbound_log sont SERVEUR-SEUL (RLS USING(false) + REVOKE
-- pour anon/authenticated). Tout passe par les routes serveur (service_role) avec tenant de SESSION.
-- L'adresse d'import et la liste blanche limitent qui peut injecter des donnees (anti-usurpation).

-- ───────────────────────── (1) Config par tenant ─────────────────────────
CREATE TABLE IF NOT EXISTS public.dga_inbound (
  tenant_id     text PRIMARY KEY,
  address       text NOT NULL,                    -- adresse dediee, ex. dga.<tenant>@in.c-secur360.ca
  enabled       boolean NOT NULL DEFAULT false,    -- desactive par defaut (le tenant active apres config)
  allow_senders text[]  NOT NULL DEFAULT '{}',     -- courriels OU domaines autorises ; vide = accepter tous
  auto_create   boolean NOT NULL DEFAULT true,     -- creer un nouveau transformateur si aucune correspondance
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ───────────────────────── (2) Journal d'audit ─────────────────────────
CREATE TABLE IF NOT EXISTS public.dga_inbound_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  email_id    text,                                -- id Resend du courriel recu
  from_addr   text,
  subject     text,
  status      text NOT NULL DEFAULT 'received',     -- received | imported | rejected | error
  detail      text,                                 -- motif (rejet/erreur) ou resume
  created     int NOT NULL DEFAULT 0,               -- transformateurs crees
  merged      int NOT NULL DEFAULT 0,               -- transformateurs fusionnes
  measures    int NOT NULL DEFAULT 0,               -- mesures ajoutees
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dga_inbound_log_tenant_idx ON public.dga_inbound_log (tenant_id, created_at DESC);

-- ───────────────────────── RLS : serveur-seul ─────────────────────────
ALTER TABLE public.dga_inbound      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dga_inbound_log  ENABLE ROW LEVEL SECURITY;
-- Aucune policy permissive : l'anon/authenticated ne lit ni n'ecrit (service_role bypass RLS).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dga_inbound' AND policyname='dga_inbound_no_anon') THEN
    CREATE POLICY dga_inbound_no_anon ON public.dga_inbound FOR ALL USING (false) WITH CHECK (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dga_inbound_log' AND policyname='dga_inbound_log_no_anon') THEN
    CREATE POLICY dga_inbound_log_no_anon ON public.dga_inbound_log FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;
REVOKE ALL ON public.dga_inbound      FROM anon, authenticated;
REVOKE ALL ON public.dga_inbound_log  FROM anon, authenticated;

-- ───────────────────────── Drapeau « nouveau » (resultats recus par courriel) ─────────────────────────
-- seen=false marque une mesure importee par courriel que le tenant n'a pas encore consultee
-- -> badge « Nouveau » sur la carte du transformateur, efface a l'ouverture de la fiche.
-- Defaut true : les mesures existantes et les imports manuels ne sont PAS signales.
ALTER TABLE public.dga_measures ADD COLUMN IF NOT EXISTS seen boolean NOT NULL DEFAULT true;

-- ───────────────────────── (3) Temps reel sur les tables DGA ─────────────────────────
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY['dga_dossiers','dga_measures'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = t AND c.relkind = 'r'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    END IF;
  END LOOP;
END $$;
