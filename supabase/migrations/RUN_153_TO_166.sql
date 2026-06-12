-- ============================================================================
-- BUNDLE MIGRATIONS 153 -> 166 — coller dans le SQL Editor de Supabase (1 fois).
-- Toutes idempotentes (IF NOT EXISTS / DROP IF EXISTS / DO blocks). Re-executables.
-- ============================================================================

-- ====================== 153_dga_email_inbound.sql ======================
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

-- ====================== 154_dga_treated.sql ======================
-- 154 — Drapeau MANUEL « traité / non traité » par transformateur DGA.
-- Distinct de `seen` (badge « Nouveau » qui s'efface a l'ouverture de la fiche) : `treated` est
-- contrôlé par l'utilisateur et PERSISTE. Quand un import par courriel apporte de nouveaux
-- résultats, le transformateur passe a `treated=false` (« A traiter ») ; l'utilisateur coche
-- « Traité » quand il a fini, et peut filtrer la liste sur ce drapeau.
-- Defaut true : les transformateurs existants / créés a la main ne sont PAS signalés.
ALTER TABLE public.dga_dossiers ADD COLUMN IF NOT EXISTS treated boolean NOT NULL DEFAULT true;

-- ====================== 155_recurring_tasks.sql ======================
-- 155 — Catalogue de TÂCHES RÉCURRENTES défini par le tenant.
-- Le tenant crée ses propres tâches (ex. bureau, atelier, soumission, administration, formation…).
-- Utilisé comme alternative au PROJET pour associer une ligne de feuille de temps ou une tâche du
-- planificateur. `billable` distingue les tâches refacturables des tâches internes.
-- (Interconnexion du temps — voir docs/INTERCONNEXION_TEMPS.md.)
CREATE TABLE IF NOT EXISTS public.tenant_recurring_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL,
  name        text NOT NULL,
  code        text NOT NULL DEFAULT '',         -- code court optionnel (ex. ADM, ATL)
  billable    boolean NOT NULL DEFAULT false,    -- refacturable au client (sinon interne)
  active      boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenant_recurring_tasks_idx ON public.tenant_recurring_tasks (tenant_id, active, sort_order);

ALTER TABLE public.tenant_recurring_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_recurring_tasks_access ON public.tenant_recurring_tasks;
CREATE POLICY tenant_recurring_tasks_access ON public.tenant_recurring_tasks FOR ALL USING (true) WITH CHECK (true);

-- Temps réel (l'admin et la feuille de temps s'y abonnent pour refléter le catalogue à jour).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN CREATE PUBLICATION supabase_realtime; END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='tenant_recurring_tasks' AND c.relkind='r')
     AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tenant_recurring_tasks') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_recurring_tasks';
  END IF;
  EXECUTE 'ALTER TABLE public.tenant_recurring_tasks REPLICA IDENTITY FULL';
END $$;

-- ====================== 156_timesheets_vehicles_retrofit.sql ======================
-- 156 — RETROFIT idempotent du module Feuille de temps + Véhicules.
-- Corrige les 404/400 observés (tables/colonnes manquantes parce que d'anciennes migrations
-- n'ont pas toutes ete appliquees dans ce projet Supabase) : employee_profiles, timesheet_allowances,
-- timesheet_hour_bonuses (060) ; colonnes timesheet_entries (sort_order, etc.) ; colonnes vehicles
-- (assigned_to 059, active 027, regime 062, km_rate_override 027, is_sales_employee). Tout en
-- CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS -> re-execution sans danger.

-- ── Profils de paie employes (060) ──
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL, employee_id text NOT NULL,
  employee_name text NOT NULL DEFAULT '', employee_email text NOT NULL DEFAULT '',
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  ot_multiplier numeric(4,2) NOT NULL DEFAULT 1.5, dt_multiplier numeric(4,2) NOT NULL DEFAULT 2.0,
  ot_daily_hrs numeric DEFAULT 8, dt_daily_hrs numeric DEFAULT NULL, ot_weekly_hrs numeric DEFAULT 40,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id)
);
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ep_access ON public.employee_profiles;
CREATE POLICY ep_access ON public.employee_profiles FOR ALL USING (true) WITH CHECK (true);

-- ── Avantages configurables (060) ──
CREATE TABLE IF NOT EXISTS public.timesheet_allowances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
  name text NOT NULL, amount numeric(10,2) NOT NULL DEFAULT 0,
  is_taxable boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.timesheet_allowances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ta_access ON public.timesheet_allowances;
CREATE POLICY ta_access ON public.timesheet_allowances FOR ALL USING (true) WITH CHECK (true);

-- ── Primes par plage d'heures (060) ──
CREATE TABLE IF NOT EXISTS public.timesheet_hour_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
  name text NOT NULL, trigger_hours numeric NOT NULL, bonus_amount numeric(10,2) NOT NULL DEFAULT 0,
  is_taxable boolean NOT NULL DEFAULT true, active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.timesheet_hour_bonuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS thb_access ON public.timesheet_hour_bonuses;
CREATE POLICY thb_access ON public.timesheet_hour_bonuses FOR ALL USING (true) WITH CHECK (true);

-- ── Colonnes timesheet_entries (corrige le 400 sur order=sort_order) ──
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'project';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_id text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_number text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS project_title text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS client_name text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_id uuid;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_type text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS vehicle_name text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS materiel numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS allowances jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── Totaux sur timesheets ──
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS total_allowances numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS total_bonuses numeric NOT NULL DEFAULT 0;

-- ── Colonnes vehicles (corrige le 400 assigned_to / active / regime / is_sales_employee) ──
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS regime text NOT NULL DEFAULT 'A_achat';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km_rate_override numeric;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_sales_employee boolean NOT NULL DEFAULT false;

-- ====================== 157_timesheet_entry_task.sql ======================
-- 157 — Association d'une ligne de feuille de temps à une TÂCHE RÉCURRENTE (catalogue admin 155).
-- Une ligne est soit un PROJET (project_id/number) soit une TÂCHE récurrente (recurring_task_id).
-- recurring_task_name = snapshot du nom (affichage/impression même si la tâche est renommée/supprimée).
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';

-- ====================== 158_timesheet_expense_entry_link.sql ======================
-- 158 — Dépense rattachée à SA ligne de temps + héritage projet/tâche (→ facturation projet).
-- entry_id = la ligne (timesheet_entries.id) à laquelle la dépense appartient. project_id existait
-- déjà (108) ; on ajoute le n° de projet + la tâche récurrente (snapshot) pour la remontée/facturation.
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS entry_id            text;
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS project_number      text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';

-- ====================== 159_poste_grid_conditions.sql ======================
-- 159 — Conditions/frais (subsistance, hébergement…) applicables à un POSTE, avec prix EMPLOYÉ.
-- Les conditions viennent du catalogue des taux (prix VENDANT). Sur la grille d'un poste, on coche
-- celles qui s'appliquent et on fixe le « prix donné à l'employé » (par défaut vendant × 0,8 = −20 %,
-- éditable). Stocké en JSONB : [{ key, label, sell_price, employee_price, applies }].
-- (Interconnexion du temps — voir docs/INTERCONNEXION_TEMPS.md, Point 2.)
ALTER TABLE public.poste_salary_grids ADD COLUMN IF NOT EXISTS grid_conditions jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ====================== 160_planner_jobs_recurring_task.sql ======================
-- 160 — Planificateur : lier un mandat à une TÂCHE RÉCURRENTE (hors projet).
-- Même interconnexion que la feuille de temps (migration 157) : un mandat planifié est soit un
-- PROJET (planner_jobs.projectId déjà présent), soit une tâche récurrente du catalogue admin
-- (tenant_recurring_tasks, migration 155) — bureau/atelier/administration/soumission…
-- recurring_task_name est un instantané du libellé (résilient si la tâche est renommée/supprimée).
ALTER TABLE public.planner_jobs ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.planner_jobs ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';

-- ====================== 161_timesheet_entries_align_app_schema.sql ======================
-- 161 — Aligner timesheet_entries sur le schéma réellement utilisé par l'application.
--
-- CONTEXTE : la table avait été créée à l'origine avec un schéma parallèle (work_date, total_hours,
-- mileage_km, notes, activity_type, is_billable, source, ast_id, planned_entry_id, location_*…) que
-- le CODE ACTUEL N'UTILISE NULLE PART. Les migrations 029/107 (qui définissent date/hrs_*/km/
-- description) étaient en CREATE TABLE IF NOT EXISTS : la table existant déjà, elles n'ont rien ajouté.
-- Résultat : l'app écrivait/lisait des colonnes inexistantes (date, hrs_*, km, description, tenant_id)
-- -> le SELECT .order('date') et l'INSERT échouaient -> « le temps ne reste jamais enregistré ».
--
-- CORRECTIF (non destructif) : on AJOUTE les colonnes attendues par l'app et on RELÂCHE les NOT NULL
-- hérités que l'app ne renseigne pas, pour que les écritures passent. On NE SUPPRIME aucune colonne
-- héritée (au cas où une intégration externe les lirait).

-- 1) Colonnes attendues par l'application (ajoutées si absentes)
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS tenant_id   text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS date        date;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_regular  numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_overtime numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS hrs_premium  numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS km           numeric NOT NULL DEFAULT 0;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS description  text    NOT NULL DEFAULT '';

-- 2) Relâcher les NOT NULL hérités que l'app ne remplit pas (sinon l'INSERT échoue). Sans risque :
--    rend simplement ces colonnes nullables, uniquement si elles existent.
DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY[
    'work_date','total_hours','user_id','client_id','site_id','billing_code',
    'start_time','end_time','break_minutes','activity_type','is_billable','billing_rate',
    'source','ast_id','planned_entry_id','travel_time_hours','mileage_km'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='timesheet_entries' AND column_name=c) THEN
      EXECUTE format('ALTER TABLE public.timesheet_entries ALTER COLUMN %I DROP NOT NULL', c);
    END IF;
  END LOOP;
END $$;

-- 3) Cohérence des lignes existantes : refléter date <-> work_date quand l'une manque.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='timesheet_entries' AND column_name='work_date') THEN
    UPDATE public.timesheet_entries SET date = work_date WHERE date IS NULL AND work_date IS NOT NULL;
    UPDATE public.timesheet_entries SET work_date = date WHERE work_date IS NULL AND date IS NOT NULL;
  END IF;
END $$;

-- 4) Index utile (chargement par feuille, tri par date)
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_sheet_date ON public.timesheet_entries (timesheet_id, date);

-- 5) Recharger le cache de schéma PostgREST (sinon l'API continue d'ignorer les nouvelles colonnes)
NOTIFY pgrst, 'reload schema';

-- ====================== 162_timesheet_entries_drop_legacy_checks.sql ======================
-- 162 — Retirer les contraintes CHECK héritées du schéma d'origine de timesheet_entries.
--
-- Suite de la migration 161 : la table avait un schéma parallèle (start_time/end_time/total_hours…)
-- avec des contraintes CHECK (ex. « valid_times » : end_time > start_time) que l'APPLICATION ACTUELLE
-- NE RENSEIGNE PAS (elle utilise date + hrs_regular/overtime/premium). Ces contraintes bloquent donc
-- l'INSERT/UPSERT de l'app -> erreur « violates check constraint "valid_times" ».
--
-- On retire la contrainte connue, puis on supprime AUTOMATIQUEMENT toute autre contrainte CHECK qui
-- référence une colonne héritée non utilisée par l'app (start_time/end_time/break_minutes/total_hours/
-- billing_rate/mileage_km/travel_time_hours). Non destructif pour les données ; ne touche pas aux
-- colonnes ni aux contraintes portant sur les colonnes de l'app.

ALTER TABLE public.timesheet_entries DROP CONSTRAINT IF EXISTS valid_times;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT con.conname, pg_get_constraintdef(con.oid) AS def
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    WHERE ns.nspname = 'public'
      AND rel.relname = 'timesheet_entries'
      AND con.contype = 'c'  -- CHECK
  LOOP
    -- Si la définition de la contrainte mentionne une colonne héritée non remplie par l'app, on la retire.
    IF r.def ~* '(start_time|end_time|break_minutes|total_hours|billing_rate|mileage_km|travel_time_hours)' THEN
      EXECUTE format('ALTER TABLE public.timesheet_entries DROP CONSTRAINT IF EXISTS %I', r.conname);
      RAISE NOTICE 'Contrainte CHECK héritée retirée : %', r.conname;
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- ====================== 163_timesheets_status_lifecycle.sql ======================
-- 163 — Cycle de vie complet du statut des feuilles de temps.
-- L'ancienne contrainte n'autorisait que draft/submitted/approved/rejected/exported. Le flux réel
-- ajoute 'verified' (vérifiée par la paie) et 'paid' (payée). On élargit la contrainte (en gardant
-- 'exported' pour la rétro-compatibilité). Flux : draft -> submitted -> approved -> verified -> paid.
ALTER TABLE public.timesheets DROP CONSTRAINT IF EXISTS timesheets_status_check;
ALTER TABLE public.timesheets ADD CONSTRAINT timesheets_status_check
  CHECK (status::text = ANY (ARRAY['draft','submitted','approved','verified','paid','rejected','exported']::text[]));

-- Traçabilité paie (facultatif mais utile) : qui/quand a vérifié et payé.
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS verified_by text;
ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS paid_by     text;

NOTIFY pgrst, 'reload schema';

-- ====================== 164_marketing.sql ======================
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

-- ====================== 165_marketing_storage.sql ======================
-- 165 — Stockage des actifs marketing (images de modèle d'avatar, bibliothèque, vidéos d'avatar).
-- Bucket PUBLIC en LECTURE (les URLs publiques servent aux <img>/<video> et à l'API D-ID qui récupère
-- l'image), mais ÉCRITURE réservée au SERVEUR (service_role via les routes requireAdmin) — la clé anon
-- ne peut rien écrire (sécurité). Idempotent.
insert into storage.buckets (id, name, public)
values ('marketing', 'marketing', true)
on conflict (id) do update set public = true;

-- Lecture publique des objets du bucket (affichage + récupération par D-ID).
drop policy if exists "marketing public read" on storage.objects;
create policy "marketing public read" on storage.objects
  for select using (bucket_id = 'marketing');

-- Aucune policy d'INSERT/UPDATE/DELETE pour anon/authenticated : seules les routes serveur
-- (service_role) écrivent — elles contournent la RLS. La clé anon ne peut donc pas téléverser.

-- ====================== 166_vehicles_relax_legacy_notnull.sql ======================
-- 166 — Véhicules : relâcher les NOT NULL hérités que l'app ne remplit pas.
-- L'app utilise « plate » ; une colonne héritée « plate_number » NOT NULL (sans défaut) faisait
-- échouer l'enregistrement (null value in column "plate_number" ... violates not-null constraint).
-- On relâche plate_number (et d'éventuelles autres colonnes héritées) si elles existent. Idempotent.
DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY['plate_number','vehicle_type','status','name','description'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='vehicles' AND column_name=c AND is_nullable='NO') THEN
      EXECUTE format('ALTER TABLE public.vehicles ALTER COLUMN %I DROP NOT NULL', c);
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

NOTIFY pgrst, 'reload schema';
