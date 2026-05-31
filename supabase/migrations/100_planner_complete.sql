-- ============================================================================
-- 100 : PLANNER — MIGRATION COMPLETE ET A JOUR (idempotente, autonome)
-- ----------------------------------------------------------------------------
-- Remplace/consolide 020 + 065 + 089 + le is_active du planner.
-- Ne touche QUE les tables planner_* (n'echoue pas si sites/clients/equipment/
-- vehicles n'existent pas -> evite l'erreur "column is_active does not exist"
-- venant de 067 sur des tables absentes).
-- 100 % idempotente : a executer/reexecuter sans risque dans le SQL Editor Supabase.
-- ============================================================================

-- ─── 1) TABLES DE BASE (creees seulement si absentes) ───────────────────────
CREATE TABLE IF NOT EXISTS planner_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  job_number    TEXT,
  project_id    TEXT,
  title         TEXT,
  client        TEXT,
  location      TEXT,
  start_date    DATE,
  end_date      DATE,
  status        TEXT DEFAULT 'planned',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_personnel (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  name          TEXT,
  role          TEXT,
  department_id UUID,
  phone         TEXT,
  email         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_equipements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  site_id       TEXT,
  name          TEXT,
  type          TEXT,
  serial_number TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_postes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT,
  code          TEXT,
  color         TEXT DEFAULT '#6b7280',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_succursales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  name          TEXT,
  code          TEXT,
  address       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_departements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  succursale_id UUID,
  name          TEXT,
  code          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_conges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  personnel_id   UUID,
  start_date     DATE,
  end_date       DATE,
  type           TEXT DEFAULT 'conge',
  approved       BOOLEAN DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planner_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  job_id          UUID,
  personnel_id    UUID,
  equipement_id   UUID,
  poste_id        UUID,
  assigned_date   DATE,
  hours           NUMERIC(4,1) DEFAULT 8,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2) planner_jobs : title NON contraint (le formulaire utilise `nom`) ─────
ALTER TABLE planner_jobs ALTER COLUMN title DROP NOT NULL;

-- ─── 3) planner_jobs : colonnes scalaires (camelCase = cles de formData) ─────
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS nom               TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "numeroJob"       TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS description       TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dateDebut"       TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heureDebut"      TEXT DEFAULT '08:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dateFin"         TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heureFin"        TEXT DEFAULT '17:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS lieu              TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS priorite          TEXT DEFAULT 'normale';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS statut            TEXT DEFAULT 'planifie';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "succursaleEnCharge" TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS budget            TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresPlanifiees"          TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dureePreviewHours"         TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "includeWeekendsInDuration" BOOLEAN DEFAULT FALSE;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "nombrePersonnelRequis"     INTEGER DEFAULT 1;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horaireMode"     TEXT DEFAULT 'global';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "modeHoraire"     TEXT DEFAULT 'heures-jour';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresDebutJour" TEXT DEFAULT '08:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresFinJour"   TEXT DEFAULT '17:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "typeHoraire"     TEXT DEFAULT 'jour';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "modeHoraireEquipes" TEXT DEFAULT 'global';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttViewMode"     TEXT DEFAULT 'day';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttMode"         TEXT DEFAULT 'individuel';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "showCriticalPath"  BOOLEAN DEFAULT FALSE;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "prochainNumeroEquipe"  INTEGER DEFAULT 1;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipeAutoGeneration"  BOOLEAN DEFAULT TRUE;

-- ─── 4) planner_jobs : colonnes JSONB (donnees imbriquees) ───────────────────
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS personnel          JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS equipements        JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "sousTraitants"    JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "personnelAssigne" JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipementAssigne" JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS documents          JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS photos             JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS etapes             JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS preparation        JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS recurrence         JSONB DEFAULT '{"active":false}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS equipes            JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "assignationsEquipes"   JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipesNumerotees"     JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesParJour"          JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesIndividuels"      JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesEquipes"          JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesDepartements"     JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "assignationsParJour"      JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "resourcesPersonnaliseeParJour" JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttBaseline"    JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "criticalPath"     JSONB DEFAULT '[]';

-- ─── 5) planner_jobs : liens P4 (modules + geolocalisation) ──────────────────
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "responsableId" TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "projectId"     TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "clientId"      TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "astId"         TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "lieuLat"       NUMERIC(10,6);
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "lieuLng"       NUMERIC(10,6);

-- ─── 6) is_active + updated_at sur les tables planner ────────────────────────
ALTER TABLE planner_jobs         ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_personnel    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_equipements  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_postes       ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_succursales  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE planner_conges       ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE planner_postes       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE planner_succursales  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE planner_succursales  ADD COLUMN IF NOT EXISTS parent_id  UUID;
ALTER TABLE planner_departements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE planner_conges       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── 7) RLS permissive sur toutes les tables planner (idempotent) ────────────
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'planner_jobs','planner_personnel','planner_equipements','planner_postes',
    'planner_succursales','planner_departements','planner_conges','planner_assignments'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_all ON %I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;

-- ─── 8) INDEX (apres creation des colonnes) ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_planner_jobs_tenant  ON planner_jobs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_statut  ON planner_jobs (tenant_id, statut);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_nom     ON planner_jobs (tenant_id, nom);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_debut   ON planner_jobs (tenant_id, "dateDebut");
CREATE INDEX IF NOT EXISTS idx_planner_personnel_tenant   ON planner_personnel (tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_equipements_tenant ON planner_equipements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_planner_conges_tenant      ON planner_conges (tenant_id);

-- FIN 100
