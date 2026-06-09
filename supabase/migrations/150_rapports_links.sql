-- 150 — Interconnexion du module Rapports terrain avec le HUB Projets, le Planner et la
-- facturation. Un rapport peut être rattaché à un PROJET (projects.id) et à un ÉVÉNEMENT du
-- planner (planner_jobs.id). Ces colonnes rendent le lien REQUÊTABLE : le statut d'un rapport
-- (rapports.status) remonte alors au projet / à la facturation (SELECT … WHERE project_id = …)
-- et le rapport « suit » l'événement (WHERE planner_job_id = …). Le détail complet du lien
-- (numéros lisibles, nom client) reste dans data.link.
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS project_id     text;
ALTER TABLE rapports ADD COLUMN IF NOT EXISTS planner_job_id text;

CREATE INDEX IF NOT EXISTS rapports_project_idx ON rapports (tenant_id, project_id);
CREATE INDEX IF NOT EXISTS rapports_job_idx     ON rapports (tenant_id, planner_job_id);
