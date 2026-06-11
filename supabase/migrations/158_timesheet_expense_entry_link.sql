-- 158 — Dépense rattachée à SA ligne de temps + héritage projet/tâche (→ facturation projet).
-- entry_id = la ligne (timesheet_entries.id) à laquelle la dépense appartient. project_id existait
-- déjà (108) ; on ajoute le n° de projet + la tâche récurrente (snapshot) pour la remontée/facturation.
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS entry_id            text;
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS project_number      text NOT NULL DEFAULT '';
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS recurring_task_id   text;
ALTER TABLE public.timesheet_expenses ADD COLUMN IF NOT EXISTS recurring_task_name text NOT NULL DEFAULT '';
