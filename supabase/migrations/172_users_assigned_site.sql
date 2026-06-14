-- 172 — Assignation d'un SITE à un utilisateur (atterrissage par défaut sur son site à la connexion).
-- Le site provient de la hiérarchie réelle planner_succursales (type 'site'). NULL = pas d'assignation
-- (l'utilisateur voit « Tous les sites » par défaut). Idempotent.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES planner_succursales(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_site_id ON users(site_id);

NOTIFY pgrst, 'reload schema';
