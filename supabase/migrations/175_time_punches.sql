-- 175 — Poinçon (punch in/out) du planificateur. Le travailleur connecté pointe sur une tâche planifiée ;
-- à la sortie, le temps (arrondi 15 min) est injecté dans SA feuille de temps (timesheets/timesheet_entries),
-- rattaché au projet de la tâche -> réel en direct. Table fermée à l'anon (écriture via route serveur).
CREATE TABLE IF NOT EXISTS time_punches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text NOT NULL,
  person_id       text NOT NULL,            -- users.id du travailleur connecté
  person_name     text,
  person_email    text,
  job_id          text,                      -- planner_jobs.id (tâche planifiée)
  project_id      uuid,                      -- projet rattaché (feuille de temps + projet)
  project_number  text,
  site_id         uuid,
  punched_in_at   timestamptz NOT NULL DEFAULT now(),
  punched_out_at  timestamptz,
  hours           numeric(6,2),              -- heures arrondies au 0,25 h, calculées à la sortie
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_punches_open ON time_punches(tenant_id, person_id) WHERE punched_out_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_punches_job  ON time_punches(tenant_id, job_id);

ALTER TABLE time_punches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON time_punches FROM anon;

NOTIFY pgrst, 'reload schema';
