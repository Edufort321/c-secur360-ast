-- 138 — Suivi du cycle de vie des soumissions + majoration.
--  - sent_at      : date de TRANSMISSION au client (début du décompte de relance à 30 j).
--  - total_hours  : nb d'heures MO total (mini-dashboard).
--  - markup_pct   : majoration manuelle appliquée au total (arrondi/majoration du prix).
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS sent_at     TIMESTAMPTZ;
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS total_hours NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS markup_pct  NUMERIC NOT NULL DEFAULT 0;
