-- 160 — Planificateur : lier un mandat à une TÂCHE RÉCURRENTE (hors projet).
-- Même interconnexion que la feuille de temps (migration 157) : un mandat planifié est soit un
-- PROJET (planner_jobs.projectId déjà présent), soit une tâche récurrente du catalogue admin
-- (tenant_recurring_tasks, migration 155) — bureau/atelier/administration/soumission…
-- recurring_task_name est un instantané du libellé (résilient si la tâche est renommée/supprimée).
ALTER TABLE public.planner_jobs ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.planner_jobs ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';
