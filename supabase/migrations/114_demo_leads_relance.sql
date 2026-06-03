-- 114 — Suivi de relance des leads demo (le proprietaire veut relancer les personnes ayant teste la demo).
-- Ajoute l'horodatage de relance, un compteur, des notes et un telephone optionnel a demo_sessions.
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS contacted_at  TIMESTAMPTZ;
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS contact_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS contact_notes TEXT;
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS phone         TEXT;
