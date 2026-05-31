-- 093: Seed du bac a sable 'demo' (acces demo public) — active tous les modules.
-- Le tenant 'demo' est valide en fast-path (app/[tenant]/layout.tsx) ; ce seed lui donne des modules
-- pour que l'espace /demo soit explorable. Idempotent.
-- Executer dans le SQL Editor de Supabase Dashboard.

INSERT INTO tenant_modules (tenant_id, module_key, enabled, source)
SELECT 'demo', k, true, 'seed'
FROM (VALUES
  ('admin'),('projects'),('ast'),('permits'),('accidents'),('near_miss'),
  ('planner'),('inventory'),('equipment'),('inspections'),('timesheets'),('logbook'),('todo')
) AS m(k)
ON CONFLICT (tenant_id, module_key) DO UPDATE SET enabled = true;
