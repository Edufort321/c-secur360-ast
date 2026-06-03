-- 108 — Dépenses de feuille de temps (avec reçu/pièce jointe), en remplacement de « matériel ».
-- Chaque dépense capte fournisseur + sous-total + taxes (TPS/TVQ) + total + reçu, pour remonter
-- vers la comptabilité (crédits de taxe CTI/RTI) et le remboursement employé (voir tâche #45).
CREATE TABLE IF NOT EXISTS timesheet_expenses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     text NOT NULL,
  timesheet_id  uuid NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  date          date,
  category      text NOT NULL DEFAULT 'autre',   -- carburant|repas|hebergement|materiel|outils|stationnement|peage|autre
  supplier      text DEFAULT '',
  description   text DEFAULT '',
  subtotal      numeric(12,2) NOT NULL DEFAULT 0, -- avant taxes
  gst           numeric(12,2) NOT NULL DEFAULT 0, -- TPS/TVH
  qst           numeric(12,2) NOT NULL DEFAULT 0, -- TVQ
  total         numeric(12,2) NOT NULL DEFAULT 0, -- sous-total + taxes
  receipt_url   text,
  reimbursable  boolean NOT NULL DEFAULT true,    -- payé par l'employé -> à rembourser
  project_id    text,
  gl_posted     boolean NOT NULL DEFAULT false,   -- écriture comptable créée (tâche #45)
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS timesheet_expenses_sheet_idx ON timesheet_expenses (timesheet_id);

ALTER TABLE timesheet_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS timesheet_expenses_access ON timesheet_expenses;
CREATE POLICY timesheet_expenses_access ON timesheet_expenses FOR ALL USING (true) WITH CHECK (true);
