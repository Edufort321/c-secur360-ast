-- 176 — Interconnexions optionnelles (idempotent).
-- equipment.status : un équipement mis en RETRAIT par une inspection (overall_result='retrait') devient
--   non disponible (visible partout, base d'une future alerte planner). 'active' par défaut.
-- commerce_invoices.project_id : lier une facture à un projet (traçabilité projet↔facturation).
-- dga_dossiers.equipment_id : lier un transformateur DGA à une fiche équipement (asset unifié, optionnel).

ALTER TABLE equipment         ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE commerce_invoices ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE dga_dossiers      ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_project ON commerce_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_dga_equipment    ON dga_dossiers(equipment_id);

NOTIFY pgrst, 'reload schema';
