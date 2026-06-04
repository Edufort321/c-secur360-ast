-- 128: #72 Module Congés (self-service) — colonnes de workflow sur planner_conges.
-- Le planner utilise deja planner_conges (start/end/type/approved/notes) ; on AJOUTE le cycle de
-- vie d'une DEMANDE (statut, demandeur, approbateur) sans casser l'usage planner. On garde la
-- colonne booleenne 'approved' synchronisee (status='approved' => approved=true) pour le planner.
ALTER TABLE planner_conges
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled')),
  ADD COLUMN IF NOT EXISTS requested_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by  TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at  TIMESTAMPTZ;

-- Backfill : les conges deja approuves (approved=true) passent en status 'approved'.
UPDATE planner_conges SET status = 'approved' WHERE approved = TRUE AND status = 'pending';

CREATE INDEX IF NOT EXISTS planner_conges_status_idx ON planner_conges (tenant_id, status, start_date);
