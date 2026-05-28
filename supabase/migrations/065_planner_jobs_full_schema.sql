-- 065: planner_jobs — schéma complet compatible avec JobModal (camelCase → colonnes réelles)
-- Le hook useSupabaseSync envoie l'objet JS directement → chaque clé doit être une colonne.
-- Toutes les colonnes camelCase correspondent aux champs de formData dans JobModal.jsx
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── Colonnes scalaires manquantes ───────────────────────────────────────────

-- Nom du job (le formulaire utilise `nom` pas `title`)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS nom               TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "numeroJob"       TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS description       TEXT;

-- Dates/heures (le formulaire utilise dateDebut/dateFin, pas start_date/end_date)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dateDebut"       TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heureDebut"      TEXT DEFAULT '08:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dateFin"         TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heureFin"        TEXT DEFAULT '17:00';

-- Infos générales
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS lieu              TEXT;   -- formData.lieu (vs location)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS priorite          TEXT DEFAULT 'normale';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS statut            TEXT DEFAULT 'planifie'; -- vs status
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "succursaleEnCharge" TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS budget            TEXT;

-- Heures planifiées
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresPlanifiees"          TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "dureePreviewHours"         TEXT;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "includeWeekendsInDuration" BOOLEAN DEFAULT FALSE;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "nombrePersonnelRequis"     INTEGER DEFAULT 1;

-- Modes horaire
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horaireMode"     TEXT DEFAULT 'global';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "modeHoraire"     TEXT DEFAULT 'heures-jour';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresDebutJour" TEXT DEFAULT '08:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "heuresFinJour"   TEXT DEFAULT '17:00';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "typeHoraire"     TEXT DEFAULT 'jour';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "modeHoraireEquipes" TEXT DEFAULT 'global';

-- Gantt / chemin critique
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttViewMode"     TEXT DEFAULT 'day';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttMode"         TEXT DEFAULT 'individuel';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "showCriticalPath"  BOOLEAN DEFAULT FALSE;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "prochainNumeroEquipe"  INTEGER DEFAULT 1;
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipeAutoGeneration"  BOOLEAN DEFAULT TRUE;

-- ─── Colonnes JSONB pour données complexes/imbriquées ─────────────────────────

-- Ressources assignées
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS personnel          JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS equipements        JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "sousTraitants"    JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "personnelAssigne" JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipementAssigne" JSONB DEFAULT '[]';

-- Fichiers
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS documents          JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS photos             JSONB DEFAULT '[]';

-- Étapes & préparation
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS etapes             JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS preparation        JSONB DEFAULT '[]';

-- Récurrence
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS recurrence         JSONB DEFAULT '{"active":false}';

-- Équipes
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS equipes            JSONB DEFAULT '[]';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "assignationsEquipes"   JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "equipesNumerotees"     JSONB DEFAULT '{}';

-- Horaires détaillés (par jour / par individu / par équipe / par département)
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesParJour"          JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesIndividuels"      JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesEquipes"          JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "horairesDepartements"     JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "assignationsParJour"      JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "resourcesPersonnaliseeParJour" JSONB DEFAULT '{}';

-- Gantt
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "ganttBaseline"    JSONB DEFAULT '{}';
ALTER TABLE planner_jobs ADD COLUMN IF NOT EXISTS "criticalPath"     JSONB DEFAULT '[]';

-- ─── Index sur les colonnes de recherche fréquente ───────────────────────────

CREATE INDEX IF NOT EXISTS idx_planner_jobs_statut   ON planner_jobs (tenant_id, statut);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_nom      ON planner_jobs (tenant_id, nom);
CREATE INDEX IF NOT EXISTS idx_planner_jobs_debut    ON planner_jobs (tenant_id, "dateDebut");

-- ─── S'assurer que planner_conges a updated_at (sync l'attend) ──────────────
ALTER TABLE planner_conges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── S'assurer que planner_succursales a parent_id (utilisé dans admin) ─────
ALTER TABLE planner_succursales ADD COLUMN IF NOT EXISTS parent_id UUID;

-- ─── S'assurer que planner_succursales a updated_at ──────────────────────────
ALTER TABLE planner_succursales ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── S'assurer que planner_departements a updated_at ────────────────────────
ALTER TABLE planner_departements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── RLS déjà activé en migration 020 — rien à faire ────────────────────────
