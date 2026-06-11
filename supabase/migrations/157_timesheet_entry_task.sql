-- 157 — Association d'une ligne de feuille de temps à une TÂCHE RÉCURRENTE (catalogue admin 155).
-- Une ligne est soit un PROJET (project_id/number) soit une TÂCHE récurrente (recurring_task_id).
-- recurring_task_name = snapshot du nom (affichage/impression même si la tâche est renommée/supprimée).
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.timesheet_entries ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';
