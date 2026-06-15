-- 174 — Interconnexions modules : colonnes de liens manquantes (idempotent, gated par entitlements côté app).
-- Accidents ↔ AST : un incident peut référencer l'AST des travaux. Accidents ↔ Personnel : personne
-- impliquée structurée. Inspections ↔ RH : inspecteur lié au personnel (validation formation possible).

ALTER TABLE incident_reports     ADD COLUMN IF NOT EXISTS ast_permit_number text;
ALTER TABLE incident_reports     ADD COLUMN IF NOT EXISTS personnel_id uuid REFERENCES planner_personnel(id) ON DELETE SET NULL;
ALTER TABLE equipment_inspections ADD COLUMN IF NOT EXISTS inspector_id uuid REFERENCES planner_personnel(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_ast       ON incident_reports(ast_permit_number);
CREATE INDEX IF NOT EXISTS idx_incidents_personnel ON incident_reports(personnel_id);
CREATE INDEX IF NOT EXISTS idx_ei_inspector        ON equipment_inspections(inspector_id);

NOTIFY pgrst, 'reload schema';
